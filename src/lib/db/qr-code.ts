import { prisma } from "../prisma";
import { Prisma, CommentStyle } from "@prisma/client";

/**
 * Normalizes a string to a URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Returns all QR codes for a business with summary stats.
 * Used on the management page.
 */
export async function getQRCodesByBusiness(
  businessSlug: string,
  search?: string,
  isActive?: boolean,
) {
  const where: Prisma.QRCodeWhereInput = {
    business: { slug: businessSlug },
    isDeleted: false,
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sourceTag: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const qrCodes = await prisma.qRCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          scans: true,
          reviews: true,
        },
      },
    },
  });

  const data = qrCodes.map((qr) => {
    const scans = qr._count.scans;
    const conversions = qr._count.reviews;
    const conversionRate = scans > 0 ? (conversions / scans) * 100 : 0;

    return {
      id: qr.id,
      name: qr.name,
      sourceTag: qr.sourceTag,
      isActive: qr.isActive,
      googleMapsLink: qr.googleMapsLink,
      aiGuidingPrompt: qr.aiGuidingPrompt,
      commentStyle: qr.commentStyle,
      scans,
      conversions,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      createdAt: qr.createdAt,
      // reviewUrl will be constructed in the route handler based on domain
    };
  });

  const totalScans = data.reduce((acc, qr) => acc + qr.scans, 0);
  const totalReviews = data.reduce((acc, qr) => acc + qr.conversions, 0);
  const avgConversionRate =
    totalScans > 0 ? (totalReviews / totalScans) * 100 : 0;

  return {
    data,
    summary: {
      totalQRCodes: data.length,
      totalScans,
      avgConversionRate: parseFloat(avgConversionRate.toFixed(1)),
    },
  };
}

export type CreateQRCodeInput = {
  name: string;
  sourceTag?: string;
  googleMapsLink?: string;
  aiGuidingPrompt?: string;
  commentStyle?: CommentStyle;
};

/**
 * Creates a new QR code for a business.
 * Ensures the sourceTag is unique within the business.
 */
export async function createQRCode(businessSlug: string, data: CreateQRCodeInput) {
  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
    select: { id: true },
  });

  if (!business) throw new Error("BUSINESS_NOT_FOUND");

  let sourceTag = data.sourceTag || slugify(data.name);

  // Ensure uniqueness of sourceTag within business
  let uniqueTag = sourceTag;
  let counter = 1;
  while (counter < 10) {
    const existing = await prisma.qRCode.findFirst({
      where: {
        businessId: business.id,
        sourceTag: uniqueTag,
        isDeleted: false,
      },
    });

    if (!existing) break;

    uniqueTag = `${sourceTag}-${Math.floor(Math.random() * 1000)}`;
    counter++;
  }

  return await prisma.qRCode.create({
    data: {
      name: data.name,
      sourceTag: uniqueTag,
      googleMapsLink: data.googleMapsLink,
      aiGuidingPrompt: data.aiGuidingPrompt,
      commentStyle: data.commentStyle,
      businessId: business.id,
    },
  });
}

/**
 * Retrieves a single QR code with detailed analytics.
 */
export async function getQRCodeDetails(id: string, businessSlug: string) {
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      id,
      business: { slug: businessSlug },
      isDeleted: false,
    },
    include: {
      _count: {
        select: {
          scans: true,
          reviews: true,
        },
      },
    },
  });

  if (!qrCode) return null;

  // Aggregate stats
  const [ratingStats, positiveCount, negativeCount, googleSubmissions] = await Promise.all([
    prisma.review.aggregate({
      where: { qrCodeId: id, isDeleted: false },
      _avg: { rating: true },
    }),
    prisma.review.count({
      where: { qrCodeId: id, type: "POSITIVE", isDeleted: false },
    }),
    prisma.review.count({
      where: { qrCodeId: id, type: "NEGATIVE", isDeleted: false },
    }),
    prisma.review.count({
      where: { qrCodeId: id, submittedToGoogle: true, isDeleted: false },
    }),
  ]);

  const totalScans = qrCode._count.scans;
  const totalReviews = qrCode._count.reviews;
  const conversionRate = totalScans > 0 ? (totalReviews / totalScans) * 100 : 0;

  return {
    ...qrCode,
    stats: {
      totalScans,
      totalReviews,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      avgRating: ratingStats._avg.rating ? parseFloat(ratingStats._avg.rating.toFixed(1)) : 0,
      positiveCount,
      negativeCount,
      googleSubmissions,
    },
  };
}

/**
 * Updates a QR code's settings.
 */
export async function updateQRCode(
  id: string,
  businessSlug: string,
  data: Partial<CreateQRCodeInput> & { isActive?: boolean },
) {
  // Use findFirst to ensure it belongs to the business
  const existing = await prisma.qRCode.findFirst({
    where: { id, business: { slug: businessSlug }, isDeleted: false },
    select: { id: true },
  });

  if (!existing) throw new Error("QR_NOT_FOUND");

  return await prisma.qRCode.update({
    where: { id },
    data: {
      name: data.name,
      isActive: data.isActive,
      googleMapsLink: data.googleMapsLink,
      aiGuidingPrompt: data.aiGuidingPrompt,
      commentStyle: data.commentStyle,
    },
  });
}

/**
 * Soft deletes a QR code.
 */
export async function deleteQRCode(id: string, businessSlug: string) {
  const existing = await prisma.qRCode.findFirst({
    where: { id, business: { slug: businessSlug }, isDeleted: false },
    select: { id: true },
  });

  if (!existing) throw new Error("QR_NOT_FOUND");

  return await prisma.qRCode.update({
    where: { id },
    data: { isDeleted: true },
  });
}
