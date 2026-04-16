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
    totalScansThisMonth,
    totalReviewsThisMonth,
    totalAiCreditsConsumedAggregation,
    revenueAllTime,
    revenueThisMonth,
    planBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count({ where: { isDeleted: false } }),
    prisma.userSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.scan.count({ where: { isDeleted: false } }),
    prisma.review.count({ where: { isDeleted: false } }),
    prisma.scan.count({
      where: { isDeleted: false, scannedAt: { gte: startOfMonth } },
    }),
    prisma.review.count({
      where: { isDeleted: false, submittedAt: { gte: startOfMonth } },
    }),
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
    prisma.userSubscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }),
    prisma.userSubscription.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const totalCredits =
    (totalAiCreditsConsumedAggregation._sum.monthlyUsed || 0) +
    (totalAiCreditsConsumedAggregation._sum.topupUsed || 0);

  return {
    stats: {
      totalUsers,
      totalBusinesses,
      activeSubscriptions,
      totalScansAllTime,
      totalReviewsAllTime,
      totalScansThisMonth,
      totalReviewsThisMonth,
      platformConversionRate:
        totalScansAllTime > 0
          ? parseFloat(
              ((totalReviewsAllTime / totalScansAllTime) * 100).toFixed(1),
            )
          : 0,
      platformConversionRateThisMonth:
        totalScansThisMonth > 0
          ? parseFloat(
              ((totalReviewsThisMonth / totalScansThisMonth) * 100).toFixed(1),
            )
          : 0,
      totalAiCreditsConsumed: totalCredits,
      totalRevenue: {
        allTime: revenueAllTime._sum.amountInPaise || 0,
        thisMonth: revenueThisMonth._sum.amountInPaise || 0,
        currency: "INR",
      },
    },
    planBreakdown: planBreakdown.map((p) => ({
      plan: p.plan,
      count: p._count._all,
    })),
    subscriptionStatusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count._all,
    })),
  };
}

/**
 * Get unique filter options for the admin dashboard.
 */
export async function getFilterOptions() {
  const [cities, industries] = await Promise.all([
    prisma.business.findMany({
      where: { isDeleted: false },
      select: { city: true },
      distinct: ["city"],
    }),
    prisma.business.findMany({
      where: { isDeleted: false },
      select: { industry: true },
      distinct: ["industry"],
    }),
  ]);

  return {
    cities: cities.map((c) => c.city).filter(Boolean),
    industries: industries.map((i) => i.industry).filter(Boolean),
    plans: ["FREE", "STARTER", "GROWTH", "PRO"],
    subscriptionStatuses: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"],
    businessStatuses: ["ACTIVE", "INACTIVE", "SUSPENDED"],
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
    ...newBusinesses.map((b) => ({
      type: "NEW_BUSINESS",
      businessName: b.name,
      businessSlug: b.slug,
      ownerPhone: b.owner.phone,
      timestamp: b.createdAt,
    })),
    ...newPayments.map((p) => ({
      type:
        p.intent === "TOPUP"
          ? "TOPUP_PURCHASED"
          : p.intent === "UPGRADE"
            ? "PLAN_UPGRADED"
            : p.intent === "RENEWAL"
              ? "PLAN_RENEWED"
              : "NEW_SUBSCRIPTION",
      businessName: p.business.name,
      businessSlug: p.business.slug,
      package: p.packageId,
      amountINR: p.amountInPaise / 100,
      creditsAdded: p.creditsAdded,
      timestamp: p.completedAt || p.initiatedAt,
    })),
  ]
    .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
    .slice(0, 10);

  return activity;
}

/**
 * Full detail view of a single business for the admin panel.
 */
export async function getAdminBusinessDetail(slug: string) {
  const business = await prisma.business.findFirst({
    where: { slug, isDeleted: false },
    include: {
      owner: {
        include: {
          activeSubscription: { include: { planDetails: true } },
          aiCredits: {
            include: {
              usageLogs: {
                take: 20,
                orderBy: { usedAt: "desc" },
              },
            },
          },
        },
      },
      qrCodes: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { scans: true, reviews: true } },
        },
      },
      locations: { where: { isDeleted: false } },
      payments: {
        where: { status: "SUCCESS" },
        orderBy: { completedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const aiCredits = business.owner.aiCredits;
  const used = (aiCredits?.monthlyUsed ?? 0) + (aiCredits?.topupUsed ?? 0);
  const total = (aiCredits?.monthlyAllocation ?? 0) + (aiCredits?.topupAllocation ?? 0);

  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    industry: business.industry,
    city: business.city,
    status: business.status,
    createdAt: business.createdAt,
    owner: {
      id: business.owner.id,
      name: business.owner.name,
      phone: business.owner.phone,
      email: business.owner.email,
    },
    subscription: {
      plan: business.owner.activeSubscription?.plan ?? "STARTER",
      status: business.owner.activeSubscription?.status ?? "TRIALING",
      currentPeriodEnd: business.owner.activeSubscription?.currentPeriodEnd,
      planName: business.owner.activeSubscription?.planDetails?.name,
    },
    aiCredits: {
      used,
      total,
      remaining: Math.max(0, total - used),
      recentUsage: aiCredits?.usageLogs ?? [],
    },
    qrCodes: business.qrCodes.map((q) => ({
      id: q.id,
      name: q.name,
      sourceTag: q.sourceTag,
      isActive: q.isActive,
      scans: q._count.scans,
      reviews: q._count.reviews,
    })),
    locations: business.locations,
    recentPayments: business.payments,
  };
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
  businessStatus?: string;
  city?: string;
  industry?: string;
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
    ...(options.plan && {
      owner: { activeSubscription: { plan: options.plan as any } },
    }),
    ...(options.status && {
      owner: { activeSubscription: { status: options.status as any } },
    }),
    ...(options.businessStatus && {
      status: options.businessStatus as any,
    }),
    ...(options.city && {
      city: options.city,
    }),
    ...(options.industry && {
      industry: options.industry,
    }),
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
          },
        },
        _count: {
          select: { qrCodes: true }, // Scans/Reviews are on QRCode
        },
      },
    }),
    prisma.business.count({ where }),
  ]);

  const data = await Promise.all(businesses.map(async (b) => {
    // Aggregate scans and reviews across all QR codes for this business
    const [scansCount, reviewsCount, ratingsAgg, highRatings, lowRatings] = await Promise.all([
      prisma.scan.count({
        where: { qrCode: { businessId: b.id }, isDeleted: false }
      }),
      prisma.review.count({
        where: { qrCode: { businessId: b.id }, isDeleted: false }
      }),
      prisma.review.aggregate({
        where: { qrCode: { businessId: b.id }, isDeleted: false },
        _avg: { rating: true }
      }),
      prisma.review.count({
        where: { qrCode: { businessId: b.id }, rating: { gte: 4 }, isDeleted: false }
      }),
      prisma.review.count({
        where: { qrCode: { businessId: b.id }, rating: { lte: 3 }, isDeleted: false }
      })
    ]);

    const conversionRate = scansCount > 0 
      ? parseFloat(((reviewsCount / scansCount) * 100).toFixed(1))
      : 0;
    
    const avgRating = ratingsAgg._avg.rating || 0;

    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      logoUrl: (b.brandingConfig as any)?.logoUrl,
      industry: b.industry,
      city: b.city,
      createdAt: b.createdAt,
      avgRating,
      highRatings,
      lowRatings,
      owner: {
        id: b.owner.id,
        phone: b.owner.phone,
        name: b.owner.name,
        email: b.owner.email,
        avatarUrl: b.owner.avatarUrl,
      },
      subscription: {
        plan: b.owner.activeSubscription?.plan || "STARTER",
        status: b.owner.activeSubscription?.status || "TRIALING",
        currentPeriodEnd: b.owner.activeSubscription?.currentPeriodEnd,
      },
      usage: {
        totalScans: scansCount,
        totalReviews: reviewsCount,
        conversionRate,
        aiCreditsUsed:
          (b.owner.aiCredits?.monthlyUsed || 0) +
          (b.owner.aiCredits?.topupUsed || 0),
        aiCreditsTotal:
          (b.owner.aiCredits?.monthlyAllocation || 0) +
          (b.owner.aiCredits?.topupAllocation || 0),
      },
      qrCodeCount: b._count.qrCodes,
      lastActive: b.updatedAt, // Using updatedAt as a proxy for last active
    };
  }));

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
export async function getExpiringSubscriptions(options: {
  withinDays: number;
  page: number;
  limit: number;
}) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + options.withinDays);

  const where: Prisma.UserSubscriptionWhereInput = {
    status: { in: ["ACTIVE", "TRIALING"] },
    currentPeriodEnd: { lte: expiryDate, gte: new Date() },
  };

  const [subs, total] = await Promise.all([
    prisma.userSubscription.findMany({
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
    prisma.userSubscription.count({ where }),
  ]);

  const data = subs.map((s) => {
    const now = new Date();
    const daysUntilExpiry = s.currentPeriodEnd
      ? Math.ceil(
          (new Date(s.currentPeriodEnd).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        )
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
        razorpaySubId: s.razorpaySubId,
        isAutoRenewing: !!s.razorpaySubId,
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
export async function adjustBusinessCredits(
  businessSlug: string,
  amount: number,
  reason: string,
) {
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

/**
 * Paginated list of all users.
 */
export async function getAllUsers(options: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isAdmin?: boolean;
}) {
  const skip = (options.page - 1) * options.limit;

  const where: Prisma.UserWhereInput = {
    isDeleted: false,
    ...(options.search && {
      OR: [
        { name: { contains: options.search, mode: "insensitive" } },
        { phone: { contains: options.search } },
        { email: { contains: options.search, mode: "insensitive" } },
      ],
    }),
    ...(options.isAdmin !== undefined && {
      isAdmin: options.isAdmin,
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: options.limit,
      orderBy: { [options.sortBy || "createdAt"]: options.sortOrder || "desc" },
      include: {
        activeSubscription: {
          include: { planDetails: true },
        },
        aiCredits: true,
        _count: {
          select: { businesses: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = users.map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    isAdmin: u.isAdmin,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    businessCount: u._count.businesses,
    subscription: {
      plan: u.activeSubscription?.plan || "FREE",
      status: u.activeSubscription?.status || "ACTIVE",
      planName: u.activeSubscription?.planDetails?.name,
    },
    credits: {
      used: (u.aiCredits?.monthlyUsed || 0) + (u.aiCredits?.topupUsed || 0),
      total:
        (u.aiCredits?.monthlyAllocation || 0) +
        (u.aiCredits?.topupAllocation || 0),
    },
  }));

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
 * Detailed view of a single user for the admin portal.
 */
export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    include: {
      activeSubscription: {
        include: { planDetails: true },
      },
      aiCredits: true,
      businesses: {
        where: { isDeleted: false },
        include: {
          _count: { select: { qrCodes: true } },
        },
      },
      subscriptionHistory: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { plan: true },
      },
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  // Manual aggregation for business stats
  const businesses = await Promise.all(
    user.businesses.map(async (b) => {
      const [scans, reviews] = await Promise.all([
        prisma.scan.count({ where: { qrCode: { businessId: b.id }, isDeleted: false } }),
        prisma.review.count({ where: { qrCode: { businessId: b.id }, isDeleted: false } }),
      ]);
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        city: b.city,
        industry: b.industry,
        status: b.status,
        createdAt: b.createdAt,
        scans,
        reviews,
      };
    })
  );

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    subscription: {
      plan: user.activeSubscription?.plan || "FREE",
      status: user.activeSubscription?.status || "INACTIVE",
      planName: user.activeSubscription?.planDetails?.name,
      currentPeriodEnd: user.activeSubscription?.currentPeriodEnd,
      billingInterval: user.activeSubscription?.billingInterval,
    },
    aiCredits: {
      monthly: {
        allocation: user.aiCredits?.monthlyAllocation || 0,
        used: user.aiCredits?.monthlyUsed || 0,
      },
      topup: {
        allocation: user.aiCredits?.topupAllocation || 0,
        used: user.aiCredits?.topupUsed || 0,
      },
      total:
        (user.aiCredits?.monthlyAllocation || 0) +
        (user.aiCredits?.topupAllocation || 0),
      used: (user.aiCredits?.monthlyUsed || 0) + (user.aiCredits?.topupUsed || 0),
    },
    businesses,
    paymentHistory: user.subscriptionHistory.map((h) => ({
      id: h.id,
      amount: h.amountPaid / 100,
      type: h.type,
      intent: h.intent,
      planName: h.planName || h.plan?.name,
      creditsAdded: h.creditsAdded,
      createdAt: h.createdAt,
      paymentId: h.paymentId,
      method: h.method,
    })),
  };
}

/**
 * Returns all active plans for admin selection.
 */
export async function getAdminPlans() {
  return await prisma.plan.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { price: "asc" },
  });
}

/**
 * Manually upgrade/push a subscription for a user (Offline Sales).
 */
export async function manuallyPushSubscription(data: {
  userId: string;
  planId: string;
  paymentMethod: "UPI" | "CASH" | "OTHER";
  amountPaid: number; // in rupees
  businessId?: string;
}) {
  const { userId, planId, paymentMethod, amountPaid, businessId } = data;

  // 1. Fetch Plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId, isDeleted: false },
  });

  if (!plan) throw new Error("PLAN_NOT_FOUND");

  // 2. Resolve or Create Business (since Payment/History require businessId in schema)
  let targetBusinessId = businessId;
  if (!targetBusinessId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { businesses: { where: { isDeleted: false }, take: 1 } },
    });

    if (user?.businesses && user.businesses.length > 0) {
      targetBusinessId = user.businesses[0].id;
    } else {
      // Create a default business if none exists, to satisfy schema requirements
      const newBusiness = await prisma.business.create({
        data: {
          name: `${user?.name || "User"}'s Business`,
          slug: `business-${userId.slice(-6)}-${Math.floor(Math.random() * 1000)}`,
          city: "Unknown",
          industry: "General",
          ownerId: userId,
        },
      });
      targetBusinessId = newBusiness.id;
    }
  }

  const amountInPaise = Math.round(amountPaid * 100);

  return await prisma.$transaction(async (tx) => {
    // 3. Update UserSubscription
    const subscription = await tx.userSubscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        plan: plan.planTier || "STARTER",
        status: "ACTIVE",
        billingInterval: plan.billingInterval || "YEARLY",
        monthlyAiCredits: plan.credits,
        currentPeriodStart: new Date(),
        currentPeriodEnd:
          plan.billingInterval === "YEARLY"
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
      create: {
        userId,
        planId: plan.id,
        plan: plan.planTier || "STARTER",
        status: "ACTIVE",
        billingInterval: plan.billingInterval || "YEARLY",
        monthlyAiCredits: plan.credits,
        currentPeriodStart: new Date(),
        currentPeriodEnd:
          plan.billingInterval === "YEARLY"
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    // 4. Update AiCredits
    await tx.aiCredits.upsert({
      where: { userId },
      create: {
        userId,
        monthlyAllocation: plan.credits,
        monthlyUsed: 0,
      },
      update: {
        monthlyAllocation: plan.credits,
        monthlyUsed: 0,
      },
    });

    // 5. Create Payment entry (SUCCESS)
    const payment = await tx.payment.create({
      data: {
        businessId: targetBusinessId,
        planId: plan.id,
        amountInPaise,
        status: "SUCCESS",
        type: "SUBSCRIPTION",
        intent: "SUBSCRIBE",
        completedAt: new Date(),
        metadata: {
          method: paymentMethod,
          manual: true,
          pushedBy: "ADMIN",
        },
      },
    });

    // 6. Create SubscriptionHistory entry
    await tx.subscriptionHistory.create({
      data: {
        userId,
        businessId: targetBusinessId,
        type: "SUBSCRIPTION",
        intent: "SUBSCRIBE",
        amountPaid: amountInPaise,
        method: paymentMethod,
        planId: plan.id,
        planName: plan.name,
        paymentId: payment.id,
        creditsAdded: plan.credits,
        startDate: new Date(),
        endDate: subscription.currentPeriodEnd,
      },
    });

    return subscription;
  });
}
