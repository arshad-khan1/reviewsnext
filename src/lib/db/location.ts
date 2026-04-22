import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

/**
 * Fetches all locations for a business with optional stats.
 */
export async function getLocations(businessSlug: string, includeStats: boolean = false) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    select: { id: true },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const locations = await prisma.location.findMany({
    where: { businessId: business.id, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { qrCodes: true },
      },
    },
  });

  const unassignedCount = await prisma.qRCode.count({
    where: { businessId: business.id, locationId: null, isDeleted: false },
  });

  if (!includeStats) {
    return {
      data: locations.map(l => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        address: l.address,
        city: l.city,
        isActive: l.isActive,
        createdAt: l.createdAt,
        qrCodeCount: l._count.qrCodes,
      })),
      unassignedQRCodes: unassignedCount,
    };
  }

  // Aggregate stats per location
  const data = await Promise.all(
    locations.map(async (l) => {
      const qrCodes = await prisma.qRCode.findMany({
        where: { locationId: l.id, isDeleted: false },
        select: { id: true },
      });
      const qrIds = qrCodes.map(q => q.id);

      const [scanCount, reviewStats] = await Promise.all([
        prisma.scan.count({ where: { qrCodeId: { in: qrIds }, isDeleted: false } }),
        prisma.review.aggregate({
          where: { qrCodeId: { in: qrIds }, isDeleted: false },
          _count: { _all: true },
          _avg: { rating: true },
        }),
      ]);

      const totalReviews = reviewStats._count._all;

      return {
        id: l.id,
        slug: l.slug,
        name: l.name,
        address: l.address,
        city: l.city,
        isActive: l.isActive,
        createdAt: l.createdAt,
        qrCodeCount: l._count.qrCodes,
        stats: {
          totalScans: scanCount,
          totalReviews: totalReviews,
          conversionRate: scanCount > 0 ? parseFloat(((totalReviews / scanCount) * 100).toFixed(1)) : 0,
          avgRating: reviewStats._avg.rating ? parseFloat(reviewStats._avg.rating.toFixed(1)) : 0,
        },
      };
    })
  );

  return { data, unassignedQRCodes: unassignedCount };
}

/**
 * Creates a new location.
 */
export async function createLocation(businessSlug: string, data: { name: string; address?: string; city?: string }) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const slugBase = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let slug = slugBase || "location";
  let counter = 1;
  while (true) {
    const existing = await prisma.location.findFirst({
      where: { businessId: business.id, slug }
    });
    if (!existing) break;
    slug = `${slugBase}-${counter}`;
    counter++;
  }

  const location = await prisma.location.create({
    data: {
      ...data,
      slug,
      businessId: business.id,
    },
  });

  return {
    ...location,
    qrCodeCount: 0,
  };
}

/**
 * Detailed view of a single location.
 */
export async function getLocationDetail(businessSlug: string, locationSlug: string, period: string = "30d") {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const location = await prisma.location.findFirst({
    where: { slug: locationSlug, businessId: business.id, isDeleted: false },
    include: {
      qrCodes: {
        where: { isDeleted: false },
        include: {
          _count: {
            select: { scans: true, reviews: true },
          },
        },
      },
    },
  });

  if (!location) throw new Error("LOCATION_NOT_FOUND");

  const qrIds = location.qrCodes.map(q => q.id);

  // Stats aggregation
  const [scanCount, reviewStats, positiveCount, negativeCount, googleSubmissions] = await Promise.all([
    prisma.scan.count({ where: { qrCodeId: { in: qrIds }, isDeleted: false } }),
    prisma.review.aggregate({
      where: { qrCodeId: { in: qrIds }, isDeleted: false },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.review.count({ where: { qrCodeId: { in: qrIds }, type: "POSITIVE", isDeleted: false } }),
    prisma.review.count({ where: { qrCodeId: { in: qrIds }, type: "NEGATIVE", isDeleted: false } }),
    prisma.review.count({ where: { qrCodeId: { in: qrIds }, submittedToGoogle: true, isDeleted: false } }),
  ]);

  const totalReviews = reviewStats._count._all;

  // Determine date range from period
  let startDate: Date | undefined;
  const now = new Date();
  if (period === "7d") startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (period === "30d") startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  else if (period === "90d") startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  else if (period === "all") startDate = undefined;

  const scanWhere: Prisma.ScanWhereInput = {
    qrCodeId: { in: qrIds },
    isDeleted: false,
    ...(startDate && { scannedAt: { gte: startDate } }),
  };

  const reviewWhere: Prisma.ReviewWhereInput = {
    qrCodeId: { in: qrIds },
    isDeleted: false,
    ...(startDate && { submittedAt: { gte: startDate } }),
  };

  // Real chart data
  const [scansByDay, ratingCounts] = await Promise.all([
    prisma.scan.findMany({
      where: scanWhere,
      select: { scannedAt: true },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: reviewWhere,
      _count: { _all: true },
    }),
  ]);

  // Scans Over Time - group by day
  const scansOverTimeMap: Record<string, number> = {};
  scansByDay.forEach((s) => {
    const day = s.scannedAt.toISOString().split("T")[0];
    scansOverTimeMap[day] = (scansOverTimeMap[day] || 0) + 1;
  });

  const scansOverTime = Object.entries(scansOverTimeMap)
    .map(([date, scans]) => ({ date, scans }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Rating Distribution - real counts per star
  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
    const match = ratingCounts.find((c) => c.rating === r);
    return {
      rating: `${r} Star`,
      count: match?._count._all || 0,
    };
  });

  return {
    id: location.id,
    slug: location.slug,
    name: location.name,
    address: location.address,
    city: location.city,
    isActive: location.isActive,
    createdAt: location.createdAt,
    stats: {
      totalScans: scanCount,
      totalReviews: totalReviews,
      conversionRate: scanCount > 0 ? parseFloat(((totalReviews / scanCount) * 100).toFixed(1)) : 0,
      avgRating: reviewStats._avg.rating ? parseFloat(reviewStats._avg.rating.toFixed(1)) : 0,
      positiveCount,
      negativeCount,
      googleSubmissions,
    },
    charts: {
      scansOverTime,
      ratingDistribution,
    },
    qrCodes: location.qrCodes.map(q => {
      const scans = q._count.scans;
      const conversions = q._count.reviews;
      return {
        id: q.id,
        name: q.name,
        sourceTag: q.sourceTag,
        isActive: q.isActive,
        scans,
        conversions,
        conversionRate: scans > 0 ? parseFloat(((conversions / scans) * 100).toFixed(1)) : 0,
      };
    }),
  };
}

/**
 * Updates a location.
 */
export async function updateLocation(businessSlug: string, locationSlug: string, data: Partial<{ name: string; address: string; city: string; isActive: boolean }>) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  return await prisma.location.update({
    where: { businessId_slug: { businessId: business.id, slug: locationSlug } },
    data,
  });
}

/**
 * Deletes a location (soft delete) and unassigns QR codes.
 */
export async function deleteLocation(businessSlug: string, locationSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  // Verify ownership before deleting
  const location = await prisma.location.findFirst({
    where: { slug: locationSlug, businessId: business.id, isDeleted: false },
  });

  if (!location) throw new Error("LOCATION_NOT_FOUND");

  return await prisma.$transaction(async (tx) => {
    // 1. Unassign QR codes
    const updatedQrs = await tx.qRCode.updateMany({
      where: { locationId: location.id },
      data: { locationId: null },
    });

    // 2. Soft delete location
    await tx.location.update({
      where: { id: location.id },
      data: { isDeleted: true },
    });

    return {
      unassignedQRCodes: updatedQrs.count,
    };
  });
}

/**
 * Assigns or unassigns a QR code to a location.
 */
export async function assignQrToLocation(businessSlug: string, qrId: string, locationId: string | null) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  // Verify QR belongs to business
  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, businessId: business.id, isDeleted: false },
  });

  if (!qr) throw new Error("QR_NOT_FOUND");

  // If locationId is provided, verify it belongs to business
  if (locationId) {
    const loc = await prisma.location.findFirst({
      where: { id: locationId, businessId: business.id, isDeleted: false },
    });
    if (!loc) throw new Error("LOCATION_NOT_FOUND");
  }

  const updatedQr = await prisma.qRCode.update({
    where: { id: qrId },
    data: { locationId },
    include: { location: true },
  });

  return {
    id: updatedQr.id,
    name: updatedQr.name,
    locationId: updatedQr.locationId,
    locationName: updatedQr.location?.name || null,
  };
}
