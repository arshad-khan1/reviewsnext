import { prisma } from "../prisma";
import { PaymentStatus, SubscriptionStatus, PlanType } from "@prisma/client";

/**
 * Handles payment.captured event.
 * Links the payment to SUCCESS and adds credits if it was a topup.
 */
export async function handlePaymentCaptured(payload: {
  paymentId: string;
  orderId: string;
  amount: number;
  email?: string;
  contact?: string;
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

    // 3. If it's a topup, increment AI credits
    const creditsToStore = payment.plan?.credits ?? payment.creditsAdded;

    if ((payment.isTopup || payment.plan?.type === "TOPUP") && creditsToStore) {
      const userId = payment.business.ownerId;
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

    return updatedPayment;
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
 * Handles subscription.charged event (renewal/new payment).
 * Updates subscription period and resets monthly credits.
 */
export async function handleSubscriptionCharged(payload: {
  subscriptionId: string;
  nextChargeDate: number; // unix timestamp
  currentStart: number;
  currentEnd: number;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the subscription
    const subscription = await tx.subscription.findUnique({
      where: { razorpaySubId: payload.subscriptionId },
      include: {
        user: {
          include: { businesses: true }
        }
      },
    });

    if (!subscription) {
      console.warn(`[Webhook] Subscription not found: ${payload.subscriptionId}`);
      return null;
    }

    // 2. Update Subscription Period
    const updatedSub = await tx.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(payload.currentStart * 1000),
        currentPeriodEnd: new Date(payload.currentEnd * 1000),
      },
    });

    // 3. Reset Monthly Credits for the USER
    await tx.aiCredits.upsert({
      where: { userId: subscription.userId },
      create: {
        userId: subscription.userId,
        monthlyAllocation: subscription.monthlyAiCredits,
        monthlyUsed: 0,
      },
      update: {
        monthlyUsed: 0, // Reset for new period
        monthlyAllocation: subscription.monthlyAiCredits, // Ensure allocation matches plan
      },
    });

    return updatedSub;
  });
}

/**
 * Handles subscription.cancelled or subscription.expired events.
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
