import { prisma } from "../prisma";
import { PlanType, BillingInterval, SubscriptionStatus } from "@prisma/client";

/**
 * Initiates a subscription for a business.
 */
export async function initiateSubscription(
  businessId: string,
  plan: PlanType,
  interval: BillingInterval,
  razorpaySubId: string
) {
  // Plan allotment map
  const allotments = {
    [PlanType.STARTER]: 100,
    [PlanType.GROWTH]: 800,
    [PlanType.PRO]: 10000, /// Represeting a "Unlimited" cap for now
  };

  return await prisma.subscription.upsert({
    where: { businessId },
    update: {
      plan,
      billingInterval: interval,
      razorpaySubId,
      status: SubscriptionStatus.TRIALING, /// Initial state until webhook charge
      monthlyAiCredits: allotments[plan],
    },
    create: {
      businessId,
      plan,
      billingInterval: interval,
      razorpaySubId,
      status: SubscriptionStatus.TRIALING,
      monthlyAiCredits: allotments[plan],
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
      isTopup: p.isTopup,
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
