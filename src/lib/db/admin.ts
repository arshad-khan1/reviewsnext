import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

/**
 * Platform-wide aggregated stats for the admin overview.
 */
export async function getAdminDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalBusinesses,
    activeSubscriptions,
    totalScansAllTime,
    totalReviewsAllTime,
    totalAiCreditsConsumedAggregation,
    revenueAllTime,
    revenueThisMonth,
    planBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count({ where: { isDeleted: false } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.scan.count({ where: { isDeleted: false } }),
    prisma.review.count({ where: { isDeleted: false } }),
    prisma.aiCredits.aggregate({
      _sum: { monthlyUsed: true, topupUsed: true },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amountInPaise: true },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", completedAt: { gte: startOfMonth } },
      _sum: { amountInPaise: true },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const totalCredits = (totalAiCreditsConsumedAggregation._sum.monthlyUsed || 0) + (totalAiCreditsConsumedAggregation._sum.topupUsed || 0);

  return {
    stats: {
      totalUsers,
      totalBusinesses,
      activeSubscriptions,
      totalScansAllTime,
      totalReviewsAllTime,
      platformConversionRate: totalScansAllTime > 0 ? parseFloat(((totalReviewsAllTime / totalScansAllTime) * 100).toFixed(1)) : 0,
      totalAiCreditsConsumed: totalCredits,
      totalRevenue: {
        allTime: revenueAllTime._sum.amountInPaise || 0,
        thisMonth: revenueThisMonth._sum.amountInPaise || 0,
        currency: "INR",
      },
    },
    planBreakdown: planBreakdown.map(p => ({ plan: p.plan, count: p._count._all })),
    subscriptionStatusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count._all })),
  };
}

/**
 * Recent platform activity.
 */
export async function getAdminRecentActivity() {
  // We'll simulate recent activity from Businesses, Subscriptions, and Payments
  const [newBusinesses, newPayments] = await Promise.all([
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { owner: true },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      take: 5,
      orderBy: { completedAt: "desc" },
      include: { business: true },
    }),
  ]);

  const activity = [
    ...newBusinesses.map(b => ({
      type: "NEW_BUSINESS",
      businessName: b.name,
      businessSlug: b.slug,
      ownerPhone: b.owner.phone,
      timestamp: b.createdAt,
    })),
    ...newPayments.map(p => ({
      type: p.isTopup ? "TOPUP_PURCHASED" : "PLAN_RENEWED",
      businessName: p.business.name,
      businessSlug: p.business.slug,
      package: p.topupPackageId,
      amountINR: p.amountInPaise / 100,
      creditsAdded: p.creditsAdded,
      timestamp: p.completedAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

  return activity;
}

/**
 * Paginated list of all businesses.
 */
export async function getAllBusinesses(options: {
  page: number;
  limit: number;
  search?: string;
  plan?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const skip = (options.page - 1) * options.limit;
  
  const where: Prisma.BusinessWhereInput = {
    isDeleted: false,
    ...(options.search && {
      OR: [
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
        { owner: { phone: { contains: options.search } } },
      ],
    }),
    ...(options.plan && { owner: { activeSubscription: { plan: options.plan as any } } }),
    ...(options.status && { owner: { activeSubscription: { status: options.status as any } } }),
  };

  const [businesses, total] = await Promise.all([
        prisma.business.findMany({
      where,
      skip,
      take: options.limit,
      orderBy: { [options.sortBy || "createdAt"]: options.sortOrder || "desc" },
      include: {
        owner: {
          include: { 
            activeSubscription: true,
            aiCredits: true,
          }
        },
        _count: {
          select: { qrCodes: true }, // Scans/Reviews are on QRCode
        },
      },
    }),
    prisma.business.count({ where }),
  ]);

  const data = businesses.map(b => {
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      logoUrl: (b.brandingConfig as any)?.logoUrl,
      industry: b.industry,
      location: b.location,
      createdAt: b.createdAt,
      owner: {
        id: b.owner.id,
        phone: b.owner.phone,
        name: b.owner.name,
        email: b.owner.email,
      },
      subscription: {
        plan: b.owner.activeSubscription?.plan || "STARTER",
        status: b.owner.activeSubscription?.status || "TRIALING",
        currentPeriodEnd: b.owner.activeSubscription?.currentPeriodEnd,
      },
      usage: {
        totalScans: 0,
        totalReviews: 0,
        conversionRate: 0,
        aiCreditsUsed: (b.owner.aiCredits?.monthlyUsed || 0) + (b.owner.aiCredits?.topupUsed || 0),
        aiCreditsTotal: (b.owner.aiCredits?.monthlyAllocation || 0) + (b.owner.aiCredits?.topupAllocation || 0),
      },
      qrCodeCount: b._count.qrCodes,
    };
  });

  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

/**
 * Businesses with expiring subscriptions.
 */
export async function getExpiringSubscriptions(options: { withinDays: number; page: number; limit: number }) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + options.withinDays);

  const where: Prisma.SubscriptionWhereInput = {
    status: { in: ["ACTIVE", "TRIALING"] },
    currentPeriodEnd: { lte: expiryDate, gte: new Date() },
  };

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      include: {
        user: {
          include: { businesses: true },
        },
      },
      orderBy: { currentPeriodEnd: "asc" },
    }),
    prisma.subscription.count({ where }),
  ]);

  const data = subs.map(s => {
    const now = new Date();
    const daysUntilExpiry = s.currentPeriodEnd 
      ? Math.ceil((new Date(s.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // For admin UI, just pick the first business or generic user info
    const primaryBusiness = s.user.businesses[0];

    return {
      userId: s.user.id,
      userName: s.user.name,
      businessSlug: primaryBusiness?.slug,
      businessName: primaryBusiness?.name,
      owner: {
        name: s.user.name,
        phone: s.user.phone,
        email: s.user.email,
      },
      subscription: {
        plan: s.plan,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        daysUntilExpiry,
        razorpaySubId: s.razorpaySubscriptionId,
        isAutoRenewing: !!s.razorpaySubscriptionId,
      },
    };
  });

  return {
    data,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

/**
 * Manual AI credit adjustment.
 */
export async function adjustBusinessCredits(businessSlug: string, amount: number, reason: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: { owner: { include: { aiCredits: true } } },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  return await prisma.$transaction(async (tx) => {
    const aiCredits = await tx.aiCredits.upsert({
      where: { userId: business.ownerId },
      create: {
        userId: business.ownerId,
        topupAllocation: amount > 0 ? amount : 0,
        topupUsed: amount < 0 ? Math.abs(amount) : 0,
      },
      update: {
        topupAllocation: amount > 0 ? { increment: amount } : undefined,
        topupUsed: amount < 0 ? { increment: Math.abs(amount) } : undefined,
      },
    });

    // Log the adjustment
    await tx.aiUsageLog.create({
      data: {
        aiCreditsId: aiCredits.id,
        operation: amount > 0 ? "REFUND" : "MANUAL_ADJUSTMENT",
        creditsUsed: amount, // Positive for refund/addition
        metadata: { reason },
      },
    });

    const used = aiCredits.monthlyUsed + aiCredits.topupUsed;
    const total = aiCredits.monthlyAllocation + aiCredits.topupAllocation;

    return {
      newBalance: {
        used,
        total,
        remaining: Math.max(0, total - used),
      },
      adjustment: amount,
      reason,
    };
  });
}
