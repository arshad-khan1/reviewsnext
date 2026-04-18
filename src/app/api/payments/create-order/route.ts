import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { createRazorpayOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { validateCoupon, reserveCouponRedemption } from "@/lib/db/coupon";
import { z } from "zod";

const bodySchema = z.object({
  planId: z.string().min(1, "planId is required"),
  businessId: z.string().min(1, "businessId is required"),
  /// Optional coupon code — validated here and reservation created at order time
  couponCode: z.string().optional(),
});

/**
 * POST /api/payments/create-order
 *
 * 1. Authenticates the user
 * 2. Fetches the Plan from DB (price, name, credits)
 * 3. Creates a Razorpay Order
 * 4. Stores a PENDING Payment record in DB
 * 5. Returns { orderId, amount, currency, planName, keyId } to the frontend
 */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { planId, businessId, couponCode } = parsed.data;
    const now = new Date();

    // 1. Verify business belongs to this user
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: user.sub, isDeleted: false },
    });

    if (!business) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Business not found" },
        { status: 404 },
      );
    }

    // 2. Fetch the plan from DB
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true, isDeleted: false },
    });

    if (!plan) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Plan not found" },
        { status: 404 },
      );
    }

    if (plan.price === 0) {
      return NextResponse.json(
        { code: "INVALID_PLAN", message: "Cannot purchase a free plan" },
        { status: 400 },
      );
    }

    // 3. Determine Payment Intent and Package ID
    let appliedCredit = 0;
    let intent: "SUBSCRIBE" | "UPGRADE" | "RENEWAL" | "TOPUP" = "SUBSCRIBE";
    let packageId: string | null = null;

    if (plan.type === "TOPUP") {
      intent = "TOPUP";
      packageId = (plan.metadata as any)?.packageId || null;
    } else {
      // SUBSCRIPTION
      packageId = (plan as any).planTier || null;

      const currentSub = await prisma.userSubscription.findUnique({
        where: { userId: user.sub },
        include: { planDetails: true },
      });

      const isActuallyActive =
        currentSub &&
        currentSub.status === "ACTIVE" &&
        currentSub.plan !== "FREE" &&
        currentSub.currentPeriodEnd &&
        currentSub.currentPeriodEnd > now;

      if (isActuallyActive) {
        // Determine if Upgrade or Renewal first
        const isRenewal = currentSub.plan === (plan as any).planTier;

        if (isRenewal) {
          intent = "RENEWAL";
          appliedCredit = 0; // Renewals are full price
        } else {
          intent = "UPGRADE";
          // Handle Upgrade/Proration
          const totalDurationDays = 365;
          const msRemaining =
            currentSub.currentPeriodEnd!.getTime() - now.getTime();
          const daysRemaining = Math.max(
            0,
            msRemaining / (1000 * 60 * 60 * 24),
          );
          const currentPrice = currentSub.planDetails?.price || 0;
          const dailyRate = currentPrice / totalDurationDays;

          appliedCredit = Math.floor(dailyRate * daysRemaining);

          // Cap credit
          if (appliedCredit >= plan.price) {
            appliedCredit = plan.price - 100;
          }
        }
      } else {
        intent = "SUBSCRIBE";
      }
    }

    const proratedAmount = plan.price - appliedCredit;

    // ── Coupon discount ────────────────────────────────────────────────────────
    let couponDiscountPaise = 0;
    let couponId: string | null = null;
    let couponValidationResult: Awaited<
      ReturnType<typeof validateCoupon>
    > | null = null;

    if (couponCode) {
      // Validate against the plan's original price (before proration)
      couponValidationResult = await validateCoupon(
        couponCode,
        user.sub,
        plan.price,
        planId,
      );

      if (!couponValidationResult.valid) {
        return NextResponse.json(
          {
            code: "COUPON_INVALID",
            error: couponValidationResult.error,
            message: couponValidationResult.message,
          },
          { status: 400 },
        );
      }

      couponDiscountPaise = couponValidationResult.discountPaise;
      couponId = couponValidationResult.couponId;
    }

    // Final amount = plan price - proration credit - coupon discount (minimum 0)
    const finalAmount = Math.max(proratedAmount - couponDiscountPaise, 0);

    if (finalAmount === 0) {
      // Edge case: fully comped. For now we block zero-amount Razorpay orders.
      // In future: directly mark as SUCCESS without payment gateway.
      return NextResponse.json(
        {
          code: "ZERO_AMOUNT",
          message:
            "Order total is ₹0. No payment required — contact support to activate.",
        },
        { status: 400 },
      );
    }

    // 4. Create a pending Payment record to get a receipt ID
    let couponRedemptionId: string | null = null;

    const pendingPayment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          businessId: business.id,
          planId: plan.id,
          amountInPaise: finalAmount,
          currency: plan.currency,
          status: "PENDING",
          type: plan.type === "TOPUP" ? "TOPUP" : "SUBSCRIPTION",
          intent: intent,
          packageId: packageId,
          creditsAdded: plan.type === "TOPUP" ? plan.credits : null,
          metadata: {
            originalPrice: plan.price,
            upgradeCredit: appliedCredit,
            wasUpgradeValue: intent === "UPGRADE",
            couponCode: couponCode || null,
            couponId: couponId,
            couponDiscount: couponDiscountPaise,
          },
        },
      });

      // Reserve the coupon redemption inside the same transaction
      if (couponId && couponDiscountPaise > 0) {
        couponRedemptionId = await reserveCouponRedemption(
          tx,
          couponId,
          user.sub,
          couponDiscountPaise,
        );
        // Write it back onto the payment so cancel/fail can void it
        await tx.payment.update({
          where: { id: payment.id },
          data: { couponRedemptionId },
        });
      }

      return payment;
    });

    // 5. Create Razorpay Order using the payment ID as receipt
    const order = await createRazorpayOrder(finalAmount, pendingPayment.id);

    // 6. Store the Razorpay Order ID back on the Payment record
    await prisma.payment.update({
      where: { id: pendingPayment.id },
      data: { razorpayOrderId: order.id },
    });

    // 7. Return what the frontend needs to open the Razorpay modal
    return NextResponse.json({
      orderId: order.id,
      paymentRecordId: pendingPayment.id,
      couponRedemptionId,
      amount: finalAmount,
      currency: plan.currency,
      planName: plan.name,
      planTier: plan.planTier,
      credits: plan.credits,
      type: plan.type === "TOPUP" ? "TOPUP" : "SUBSCRIPTION",
      upgradeCredit: appliedCredit,
      originalPrice: plan.price,
      couponDiscount: couponDiscountPaise,
      couponCode: couponCode || null,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: {
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || "",
        businessName: business.name,
      },
    });
  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create order" },
      { status: 500 },
    );
  }
});
