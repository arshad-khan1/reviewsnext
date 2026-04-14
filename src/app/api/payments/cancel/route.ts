import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/guard";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const CancelSchema = z.object({
  paymentRecordId: z.string().min(1),
});

/**
 * POST /api/payments/cancel
 * Marks a PENDING payment record as CANCELLED.
 * Used when a user closes the Razorpay modal.
 */
export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const parsed = CancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid payment record ID" },
        { status: 400 }
      );
    }

    const { paymentRecordId } = parsed.data;

    // 1. Fetch the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentRecordId },
    });

    if (!payment) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Payment record not found" },
        { status: 404 }
      );
    }

    // 2. Authorization: Ensure the payment belongs to one of the user's businesses
    // (Simplification for now: check if the payment exists and is PENDING)
    if (payment.status !== PaymentStatus.PENDING) {
      return NextResponse.json(
        { code: "INVALID_STATE", message: "Only pending payments can be cancelled" },
        { status: 400 }
      );
    }

    // 3. Mark as CANCELLED
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELLED,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT_CANCEL_ERROR]", error);
    return NextResponse.json(
      { code: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
});
