import { prisma } from "../prisma";
import { PaymentStatus, SubscriptionStatus, PaymentIntent, PaymentType } from "@prisma/client";

/**
 * Internal helper to log history entries for any successful transaction.
 */
async function logSubscriptionHistory(tx: any, data: {
  userId: string;
  businessId: string;
  payment: any;
  startDate?: Date | null;
  endDate?: Date | null;
  creditsAdded: number;
}) {
  return await tx.subscriptionHistory.create({
    data: {
      userId: data.userId,
      businessId: data.businessId,
      type: data.payment.type,
      intent: data.payment.intent,
      amountPaid: data.payment.amountInPaise,
      currency: data.payment.currency,
      method: "RAZORPAY",
      startDate: data.startDate,
      endDate: data.endDate,
      creditsAdded: data.creditsAdded,
      planId: data.payment.planId,
      planName: data.payment.plan?.name || "Plan",
      paymentId: data.payment.id,
      metadata: (data.payment.metadata as any) || {},
    },
  });
}

/**
 * Handles payment.captured event (Webhook).
 * Links the payment to SUCCESS and adds credits/activates history.
 */
export async function handlePaymentCaptured(payload: {
  paymentId: string;
  orderId: string;
  amount: number;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the pending payment record
    const payment = await tx.payment.findUnique({
      where: { razorpayOrderId: payload.orderId },
      include: { business: true, plan: true },
    });

    if (!payment) {
      console.warn(`[Webhook] Payment record not found for order ${payload.orderId}`);
      return null;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment; // Already processed
    }

    // 2. Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        razorpayPaymentId: payload.paymentId,
        completedAt: new Date(),
      },
    });

    const userId = payment.business.ownerId;
    const creditsToStore = payment.plan?.credits ?? (payment.creditsAdded || 0);

    // 3. Handle Top-up or One-time credits
    if (payment.type === "TOPUP" || payment.plan?.type === "TOPUP") {
      await tx.aiCredits.upsert({
        where: { userId },
        create: {
          userId,
          topupAllocation: creditsToStore,
        },
        update: {
          topupAllocation: { increment: creditsToStore },
        },
      });
    }

    // 4. Log History
    await logSubscriptionHistory(tx, {
      userId,
      businessId: payment.businessId,
      payment: payment,
      creditsAdded: creditsToStore,
    });

    return updatedPayment;
  });
}

/**
 * Primary processor for the /verify API.
 * Handles Subscriptions (Period Stacking) and Top-ups in one place.
 */
export async function processSuccessfulPayment(tx: any, {
  payment,
  userId,
  razorpayPaymentId,
  razorpaySignature
}: {
  payment: any;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  // 1. Mark payment as SUCCESS
  await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.SUCCESS,
      razorpayPaymentId,
      razorpaySignature,
      completedAt: new Date(),
    },
  });

  let periodStart: Date | null = null;
  let periodEnd: Date | null = null;
  let creditsAdded = payment.plan?.credits ?? (payment.creditsAdded || 0);

  if (payment.type === "TOPUP") {
    // TOP-UP LOGIC
    await tx.aiCredits.upsert({
      where: { userId },
      update: {
        topupAllocation: { increment: creditsAdded },
      },
      create: {
        userId,
        monthlyAllocation: 0,
        topupAllocation: creditsAdded,
      },
    });
  } else {
    // SUBSCRIPTION LOGIC
    const currentSub = await tx.userSubscription.findUnique({
      where: { userId },
    });

    periodStart = new Date();
    // Period Stacking for Renewals
    if (
      payment.intent === "RENEWAL" &&
      currentSub?.currentPeriodEnd &&
      currentSub.currentPeriodEnd > new Date()
    ) {
      periodStart = new Date(currentSub.currentPeriodEnd);
    }

    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await tx.userSubscription.upsert({
      where: { userId },
      update: {
        planId: payment.planId,
        plan: payment.plan!.planTier!,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        monthlyAiCredits: payment.plan!.credits,
        razorpaySubId: razorpayPaymentId,
      },
      create: {
        userId,
        planId: payment.planId,
        plan: payment.plan!.planTier!,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        monthlyAiCredits: payment.plan!.credits,
        razorpaySubId: razorpayPaymentId,
      },
    });

    // Reset Monthly AI Credits
    await tx.aiCredits.upsert({
      where: { userId },
      update: {
        monthlyAllocation: payment.plan!.credits,
        monthlyUsed: 0,
      },
      create: {
        userId,
        monthlyAllocation: payment.plan!.credits,
        topupAllocation: 0,
        monthlyUsed: 0,
      },
    });
  }

  // LOG HISTORY
  await logSubscriptionHistory(tx, {
    userId,
    businessId: payment.businessId,
    payment,
    startDate: periodStart,
    endDate: periodEnd,
    creditsAdded,
  });
}

/**
 * Handles payment.failed event.
 */
export async function handlePaymentFailed(payload: {
  orderId: string;
  paymentId: string;
}) {
  return await prisma.payment.update({
    where: { razorpayOrderId: payload.orderId },
    data: {
      status: PaymentStatus.FAILED,
      razorpayPaymentId: payload.paymentId,
      completedAt: new Date(),
    },
  });
}

/**
 * Handles subscription.charged event (recurring renewal).
 */
export async function handleSubscriptionCharged(payload: {
  subscriptionId: string;
  nextChargeDate: number; 
  currentStart: number;
  currentEnd: number;
}) {
  return await prisma.$transaction(async (tx) => {
    const subscription = await tx.userSubscription.findUnique({
      where: { razorpaySubId: payload.subscriptionId },
      include: { user: { include: { businesses: true } }, planDetails: true },
    });

    if (!subscription) return null;

    const startDate = new Date(payload.currentStart * 1000);
    const endDate = new Date(payload.currentEnd * 1000);

    // 1. Update Subscription
    const updatedSub = await tx.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      },
    });

    // 2. Reset Monthly Credits
    await tx.aiCredits.upsert({
      where: { userId: subscription.userId },
      create: {
        userId: subscription.userId,
        monthlyAllocation: subscription.monthlyAiCredits,
        monthlyUsed: 0,
      },
      update: {
        monthlyUsed: 0,
        monthlyAllocation: subscription.monthlyAiCredits,
      },
    });

    // 3. Log History (Denormalized)
    const dummyPayment = {
      type: "SUBSCRIPTION",
      intent: "RENEWAL",
      amountInPaise: subscription.planDetails?.price || 0,
      currency: "INR",
      planId: subscription.planId,
      plan: subscription.planDetails,
      id: null, // No specific payment ID for automated charges sometimes
      metadata: {},
    };

    await logSubscriptionHistory(tx, {
      userId: subscription.userId,
      businessId: subscription.user.businesses[0]?.id, // Default to first business
      payment: dummyPayment,
      startDate,
      endDate,
      creditsAdded: subscription.monthlyAiCredits,
    });

    return updatedSub;
  });
}

/**
 * Handles status changes (cancelled, expired).
 */
export async function handleSubscriptionStatusChange(
  razorpaySubId: string,
  newStatus: SubscriptionStatus
) {
  return await prisma.userSubscription.update({
    where: { razorpaySubId },
    data: { status: newStatus },
  });
}
