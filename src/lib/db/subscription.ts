import { prisma } from "../prisma";
import { PlanType, BillingInterval, SubscriptionStatus } from "@prisma/client";

/**
 * Initiates a subscription for a user using a predefined Plan.
 */
export async function initiateSubscription(
  userId: string,
  planId: string,
  razorpaySubId: string
) {
  // 1. Fetch the plan details
  const plan = await prisma.plan.findUnique({
    where: { id: planId, isDeleted: false },
  });

  if (!plan || plan.type !== "SUBSCRIPTION") {
    throw new Error("INVALID_PLAN_OR_NOT_A_SUBSCRIPTION");
  }

  return await prisma.userSubscription.upsert({
    where: { userId },
    update: {
      planId: plan.id,
      plan: plan.planTier || PlanType.FREE,
      billingInterval: plan.billingInterval || BillingInterval.YEARLY,
      razorpaySubId,
      status: SubscriptionStatus.TRIALING,
      monthlyAiCredits: plan.credits,
    },
    create: {
      userId,
      planId: plan.id,
      plan: plan.planTier || PlanType.STARTER,
      billingInterval: plan.billingInterval || BillingInterval.YEARLY,
      razorpaySubId,
      status: SubscriptionStatus.TRIALING,
      monthlyAiCredits: plan.credits,
    },
  });
}

/**
 * Fetches paginated payment history for a business.
 */
export async function getPaymentHistory(
  businessSlug: string,
  pagination: { limit: number; page: number }
) {
  const { limit, page } = pagination;
  const skip = (page - 1) * limit;

  const [payments, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: {
        business: { slug: businessSlug, isDeleted: false },
      },
      orderBy: { initiatedAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.payment.count({
      where: {
        business: { slug: businessSlug, isDeleted: false },
      },
    }),
  ]);

  return {
    payments: payments.map(p => ({
      id: p.id,
      status: p.status,
      amount: p.amountInPaise / 100,
      currency: p.currency,
      type: p.type,
      initiatedAt: p.initiatedAt,
      completedAt: p.completedAt,
      razorpayOrderId: p.razorpayOrderId,
      invoiceUrl: p.status === "SUCCESS" ? `/api/receipts/${p.id}/download` : null, /// Placeholder link
    })),
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Gets a user's current subscription.
 */
export async function getUserSubscription(userId: string) {
  return await prisma.userSubscription.findUnique({
    where: { userId },
  });
}
