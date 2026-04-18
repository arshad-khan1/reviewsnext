import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import { processSuccessfulPayment } from "@/lib/db/payment";

const bodySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  paymentRecordId: z.string(), // Our DB Payment.id
});

/**
 * POST /api/payments/verify
 *
 * Called by the frontend after Razorpay checkout completes successfully.
 * 1. Verifies the HMAC signature  
 * 2. Marks Payment as SUCCESS
 * 3. Upserts UserSubscription to ACTIVE with the new plan
 * 4. Resets AI credits for the new plan
 */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentRecordId } =
      parsed.data;

    // 1. Verify the HMAC signature — critical security step
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      console.error("[VERIFY] Invalid signature for payment:", razorpayPaymentId);
      return NextResponse.json(
        { code: "INVALID_SIGNATURE", message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 2. Fetch our pending payment record with plan details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentRecordId },
      include: { plan: true, business: true },
    });

    if (!payment) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      // Idempotent — already processed (e.g. webhook already handled it)
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    if (!payment.plan) {
      return NextResponse.json(
        { code: "INVALID_PAYMENT", message: "Payment has no associated plan" },
        { status: 400 }
      );
    }

    // 3. Run everything in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      await processSuccessfulPayment(tx, {
        payment,
        userId: user.sub,
        razorpayPaymentId,
        razorpaySignature,
      });
    });

    return NextResponse.json({
      success: true,
      plan: payment.plan.planTier,
      credits: payment.plan.credits,
    });
  } catch (error: any) {
    console.error("[VERIFY_PAYMENT_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to verify payment" },
      { status: 500 }
    );
  }
});
