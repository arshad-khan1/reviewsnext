import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { formatDate } from "../utils/format";

/**
 * Aggregates all analytics data for the business dashboard.
 */
export async function getDashboardData(
  businessSlug: string,
  period: string = "30d",
) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: {
      owner: {
        include: { 
          activeSubscription: true,
          aiCredits: true 
        },
      },
    },
  });

  if (!business) {
    throw new Error("BUSINESS_NOT_FOUND");
  }

  // 1. Determine Date Range
  let startDate: Date | undefined;
  const now = new Date();

  if (period === "7d")
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (period === "30d")
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  else if (period === "90d")
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  else if (period === "all") startDate = undefined;

  // 2. Fetch Stats & Aggregates
  // We fetch QR codes first to simplify filtering and avoid complex relation joins in groupBy
  const qrCodes = await prisma.qRCode.findMany({
    where: { businessId: business.id, isDeleted: false },
    select: { id: true },
  });
  const qrCodeIds = qrCodes.map((qr) => qr.id);

  const scanWhere: Prisma.ScanWhereInput = {
    qrCodeId: { in: qrCodeIds },
    isDeleted: false,
    ...(startDate && { scannedAt: { gte: startDate } }),
  };

  const reviewWhere: Prisma.ReviewWhereInput = {
    qrCodeId: { in: qrCodeIds },
    isDeleted: false,
    ...(startDate && { submittedAt: { gte: startDate } }),
  };

  const [
    totalScans,
    totalReviews,
    avgRatingResult,
    googleSubmissions,
    negativeFeedbacks,
    ratingCounts,
    scansByDay,
    deviceBreakdownRaw,
    browserBreakdownRaw,
    activeQRCodesRaw,
    recentReviews,
    recentScans,
  ] = await Promise.all([
    prisma.scan.count({ where: scanWhere }),
    prisma.review.count({ where: reviewWhere }),
    prisma.review.aggregate({
      where: reviewWhere,
      _avg: { rating: true },
    }),
    prisma.review.count({
      where: { ...reviewWhere, submittedToGoogle: true },
    }),
    prisma.review.count({
      where: { ...reviewWhere, type: "NEGATIVE" },
    }),
    // Rating distribution
    prisma.review.groupBy({
      by: ["rating"],
      where: reviewWhere,
      _count: { _all: true },
    }),
    // Scans over time
    prisma.scan.findMany({
      where: scanWhere,
      select: { scannedAt: true },
    }),
    // Device Breakdown
    prisma.scan.groupBy({
      by: ["device"],
      where: scanWhere, // Cast to any if complexity warning persists
      _count: { _all: true },
      orderBy: { _count: { device: "desc" } },
      take: 10,
    }),
    // Browser Breakdown
    prisma.scan.groupBy({
      by: ["browser"],
      where: scanWhere,
      _count: { _all: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10,
    }),
    // Active QR Codes (top 6 by scans)
    prisma.qRCode.findMany({
      where: { businessId: business.id, isDeleted: false },
      take: 6,
      include: {
        _count: {
          select: {
            scans: { where: scanWhere },
            reviews: { where: reviewWhere },
          },
        },
      },
    }),
    // Recent Reviews
    prisma.review.findMany({
      where: reviewWhere,
      take: 10,
      orderBy: { submittedAt: "desc" },
    }),
    // Recent Scans
    prisma.scan.findMany({
      where: scanWhere,
      take: 10,
      orderBy: { scannedAt: "desc" },
      include: {
        review: {
          select: { rating: true },
        },
      },
    }),
  ]);

  // 3. Process Chart Data

  // Scans Over Time
  const scansOverTimeMap: Record<string, number> = {};
  scansByDay.forEach((s) => {
    const day = s.scannedAt.toISOString().split("T")[0];
    scansOverTimeMap[day] = (scansOverTimeMap[day] || 0) + 1;
  });

  const scansOverTime = Object.entries(scansOverTimeMap)
    .map(([date, scans]) => ({ date, scans }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Rating Distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
    const match = ratingCounts.find((c) => c.rating === r);
    return {
      rating: `${r} Star`,
      count: match?._count._all || 0,
    };
  });

  const lowRatings = ratingDistribution
    .slice(0, 3)
    .reduce((acc, r) => acc + r.count, 0);
  const highRatings = ratingDistribution
    .slice(3, 5)
    .reduce((acc, r) => acc + r.count, 0);

  // Device & Browser Breakdown
  const deviceBreakdown = deviceBreakdownRaw.map((d) => ({
    name: d.device || "Unknown",
    value: d._count._all,
  }));
  const browserBreakdown = browserBreakdownRaw.map((b) => ({
    name: b.browser || "Unknown",
    value: b._count._all,
  }));

  // 4. Process Active QR Codes
  const activeQRCodes = activeQRCodesRaw
    .map((qr) => {
      const scansCount = qr._count.scans;
      const reviewsCount = qr._count.reviews;
      return {
        id: qr.id,
        name: qr.name,
        sourceTag: qr.sourceTag,
        scans: scansCount,
        conversions: reviewsCount,
        conversionRate:
          scansCount > 0
            ? parseFloat(((reviewsCount / scansCount) * 100).toFixed(1))
            : 0,
      };
    })
    .sort((a, b) => b.scans - a.scans);

  // 5. Final Assembly
  return {
    stats: {
      totalScans,
      totalReviews,
      conversionRate:
        totalScans > 0
          ? parseFloat(((totalReviews / totalScans) * 100).toFixed(1))
          : 0,
      avgRating: avgRatingResult._avg.rating
        ? parseFloat(avgRatingResult._avg.rating.toFixed(1))
        : 0,
      googleSubmissions,
      negativeFeedbacks,
      lowRatings,
      highRatings,
    },
    charts: {
      scansOverTime,
      ratingDistribution,
      deviceBreakdown,
      browserBreakdown,
    },
    activeQRCodes,
    recentReviews: recentReviews.map((r) => ({
      id: r.id,
      type: r.type,
      rating: r.rating,
      reviewText: r.reviewText,
      submittedToGoogle: r.submittedToGoogle,
      submittedAt: r.submittedAt,
      formattedAt: formatDate(r.submittedAt),
    })),
    recentScans: recentScans.map((s) => ({
      id: s.id,
      scannedAt: s.scannedAt,
      formattedAt: formatDate(s.scannedAt),
      device: s.device,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ipAddress,
      resultedInReview: s.resultedInReview,
      rating: s.review?.rating || null,
      city: s.city,
      country: s.country,
    })),
    aiCredits: {
      used:
        (business.owner.aiCredits?.monthlyUsed || 0) +
        (business.owner.aiCredits?.topupUsed || 0),
      total:
        (business.owner.aiCredits?.monthlyAllocation || 0) +
        (business.owner.aiCredits?.topupAllocation || 0),
    },
    plan: business.owner.activeSubscription?.plan || "STARTER",
  };
}
