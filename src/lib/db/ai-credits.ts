import { prisma } from "../prisma";
import { Prisma, TopupPackageId } from "@prisma/client";

/**
 * Fetches AI credit balance and recent usage for a business.
 */
export async function getAiCredits(businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: {
      owner: {
        include: {
          aiCredits: {
            include: {
              usageLogs: {
                take: 10,
                orderBy: { usedAt: "desc" },
              },
            },
          },
          activeSubscription: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  const aiCredits = business.owner.aiCredits;
  const activeSubscription = business.owner.activeSubscription;
  const used = (aiCredits?.monthlyUsed || 0) + (aiCredits?.topupUsed || 0);
  const total = (aiCredits?.monthlyAllocation || 0) + (aiCredits?.topupAllocation || 0);

  return {
    credits: {
      used,
      total,
      remaining: Math.max(0, total - used),
      percentUsed: total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0,
    },
    plan: {
      name: activeSubscription?.plan || "STARTER",
      monthlyAllotment: activeSubscription?.monthlyAiCredits || 100,
      status: activeSubscription?.status || "ACTIVE",
      currentPeriodEnd: activeSubscription?.currentPeriodEnd,
    },
    recentUsage: aiCredits?.usageLogs.map((log) => ({
      id: log.id,
      operation: log.operation,
      creditsUsed: log.creditsUsed,
      usedAt: log.usedAt,
    })) || [],
  };
}

/**
 * Creates a topup order.
 */
export async function createTopupOrderInDb(data: {
  businessId: string;
  packageId: TopupPackageId;
  amountInPaise: number;
  credits: number;
  razorpayOrderId: string;
}) {
  return await prisma.payment.create({
    data: {
      businessId: data.businessId,
      status: "PENDING",
      amountInPaise: data.amountInPaise,
      type: "TOPUP",
      intent: "TOPUP",
      packageId: data.packageId,
      creditsAdded: data.credits,
      razorpayOrderId: data.razorpayOrderId,
    },
  });
}

/**
 * Verifies and finalizes a topup payment.
 */
export async function completeTopupPayment(data: {
  businessSlug: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the pending payment
    const payment = await tx.payment.findFirst({
      where: {
        razorpayOrderId: data.razorpayOrderId,
        business: { slug: data.businessSlug },
        status: "PENDING",
      },
      include: {
        business: {
          include: { 
            owner: {
              include: { aiCredits: true }
            } 
          },
        },
      },
    });

    if (!payment) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (payment.status === "SUCCESS") {
      throw new Error("ALREADY_VERIFIED");
    }

    // 2. Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        completedAt: new Date(),
      },
    });

    // 3. Increment credits (User-level)
    const creditsAdded = payment.creditsAdded || 0;
    const userId = payment.business.ownerId;

    const aiCredits = await tx.aiCredits.upsert({
      where: { userId },
      create: {
        userId,
        topupAllocation: creditsAdded,
      },
      update: {
        topupAllocation: { increment: creditsAdded },
      },
    });

    const used = aiCredits.monthlyUsed + aiCredits.topupUsed;
    const total = aiCredits.monthlyAllocation + aiCredits.topupAllocation;

    return {
      success: true,
      creditsAdded,
      newBalance: {
        used,
        total,
        remaining: Math.max(0, total - used),
      },
      referenceId: payment.id,
    };
  });
}
