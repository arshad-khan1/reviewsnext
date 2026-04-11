import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { mergeBranding } from "./branding";

/**
 * Creates a new scan record.
 * Fetches the QR code and business details, merges branding, and returns the scan info.
 */
export async function createScan(data: {
  businessSlug: string;
  sourceTag: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
}) {
  // 1. Find the QR Code and its Business
  const qrCode = await prisma.qRCode.findFirst({
    where: {
      sourceTag: data.sourceTag,
      business: { slug: data.businessSlug, isDeleted: false },
      isDeleted: false,
    },
    include: {
      business: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!qrCode) {
    throw new Error("QR_NOT_FOUND");
  }

  const business = qrCode.business;

  // 2. Create the Scan record
  const scan = await prisma.scan.create({
    data: {
      qrCodeId: qrCode.id,
      device: data.device,
      browser: data.browser,
      os: data.os,
      ipAddress: data.ipAddress,
      // City/Country resolution should happen here if we had a geo-service
    },
  });

  // 3. Prepare merged branding and config
  const { effective: effectiveBranding, showWatermark } = mergeBranding(
    business.brandingConfig,
    qrCode.brandingOverride
  );

  return {
    scanId: scan.id,
    qrCodeId: qrCode.id,
    businessName: business.name,
    logoUrl: business.logoUrl,
    acceptedStarsThreshold: business.acceptedStarsThreshold,
    googleMapsLink: qrCode.googleMapsLink || business.defaultGoogleMapsLink,
    aiGuidingPrompt: qrCode.aiGuidingPrompt || business.defaultAiPrompt,
    commentStyle: qrCode.commentStyle || business.defaultCommentStyle,
    effectiveBranding,
    showWatermark,
  };
}

/**
 * Fetches paginated scans for a business with filtering.
 */
export async function getScans(
  businessSlug: string,
  page: number = 1,
  limit: number = 8,
  filters: {
    qrCodeId?: string;
    resultedInReview?: boolean;
    search?: string;
    from?: Date;
    to?: Date;
  } = {}
) {
  const skip = (page - 1) * limit;

  const where: Prisma.ScanWhereInput = {
    qrCode: {
      business: { slug: businessSlug, isDeleted: false },
      isDeleted: false,
    },
    isDeleted: false,
    ...(filters.qrCodeId && { qrCodeId: filters.qrCodeId }),
    ...(filters.resultedInReview !== undefined && { resultedInReview: filters.resultedInReview }),
    ...(filters.search && {
      OR: [
        { device: { contains: filters.search, mode: "insensitive" } },
        { browser: { contains: filters.search, mode: "insensitive" } },
        { os: { contains: filters.search, mode: "insensitive" } },
        { ipAddress: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
        { country: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
    ...( (filters.from || filters.to) && {
      scannedAt: {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      },
    }),
  };

  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        qrCode: {
          select: {
            id: true,
            name: true,
            sourceTag: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            type: true,
          },
        },
      },
    }),
    prisma.scan.count({ where }),
  ]);

  return {
    data: scans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetches a single scan detail for a business owner.
 */
export async function getScanDetails(id: string, businessSlug: string) {
  return await prisma.scan.findFirst({
    where: {
      id,
      qrCode: {
        business: { slug: businessSlug, isDeleted: false },
        isDeleted: false,
      },
      isDeleted: false,
    },
    include: {
      qrCode: {
        select: {
          id: true,
          name: true,
          sourceTag: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          type: true,
          reviewText: true,
          reviewWasAiDraft: true,
          whatWentWrong: true,
          howToImprove: true,
          submittedToGoogle: true,
          submittedAt: true,
        },
      },
    },
  });
}
