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

  const location = await prisma.location.create({
    data: {
      ...data,
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
export async function getLocationDetail(businessSlug: string, locationId: string, period: string = "30d") {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  const location = await prisma.location.findFirst({
    where: { id: locationId, businessId: business.id, isDeleted: false },
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

  // Mock charts for now (similar to dashboard)
  const scansOverTime = [
    { date: "2026-04-10", scans: Math.floor(scanCount / 7) },
    { date: "2026-04-11", scans: scanCount % 7 },
  ];

  return {
    id: location.id,
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
      ratingDistribution: [
        { rating: "1 Star", count: 0 },
        { rating: "2 Star", count: 0 },
        { rating: "3 Star", count: 0 },
        { rating: "4 Star", count: positiveCount },
        { rating: "5 Star", count: 0 }, // Simplified
      ],
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
export async function updateLocation(businessSlug: string, locationId: string, data: Partial<{ name: string; address: string; city: string; isActive: boolean }>) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  return await prisma.location.update({
    where: { id: locationId, businessId: business.id },
    data,
  });
}

/**
 * Deletes a location (soft delete) and unassigns QR codes.
 */
export async function deleteLocation(businessSlug: string, locationId: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  // Verify ownership before deleting
  const location = await prisma.location.findFirst({
    where: { id: locationId, businessId: business.id, isDeleted: false },
  });

  if (!location) throw new Error("LOCATION_NOT_FOUND");

  return await prisma.$transaction(async (tx) => {
    // 1. Unassign QR codes
    const updatedQrs = await tx.qRCode.updateMany({
      where: { locationId: locationId },
      data: { locationId: null },
    });

    // 2. Soft delete location
    await tx.location.update({
      where: { id: locationId },
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
