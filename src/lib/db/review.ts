import { prisma } from "../prisma";
import { Prisma, ReviewType } from "@prisma/client";
import { formatDate } from "../utils/format";

/**
 * Creates a new review.
 * If scanId is provided, links the review to the scan and marks the scan as having resulted in a review.
 */
export async function createReview(data: {
  qrCodeId: string;
  scanId?: string;
  rating: number;
  type: ReviewType;
  reviewText?: string;
  reviewWasAiDraft?: boolean;
  submittedToGoogle?: boolean;
  whatWentWrong?: string;
  howToImprove?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if a review already exists for this scanId
    if (data.scanId) {
      const existing = await tx.review.findUnique({
        where: { scanId: data.scanId },
      });

      if (existing) {
        // Update existing record (priority: submittedToGoogle flag)
        return await tx.review.update({
          where: { id: existing.id },
          data: {
            submittedToGoogle: data.submittedToGoogle ?? existing.submittedToGoogle,
            // If new feedback text is provided, we can update it too
            reviewText: data.reviewText ?? existing.reviewText,
            whatWentWrong: data.whatWentWrong ?? existing.whatWentWrong,
            howToImprove: data.howToImprove ?? existing.howToImprove,
            rating: data.rating ?? existing.rating,
          },
        });
      }
    }

    // 2. Create new entry
    const review = await tx.review.create({
      data: {
        qrCodeId: data.qrCodeId,
        scanId: data.scanId,
        rating: data.rating,
        type: data.type,
        reviewText: data.reviewText,
        reviewWasAiDraft: data.reviewWasAiDraft ?? false,
        submittedToGoogle: data.submittedToGoogle ?? false,
        whatWentWrong: data.whatWentWrong,
        howToImprove: data.howToImprove,
      },
    });

    if (data.scanId) {
      await tx.scan.update({
        where: { id: data.scanId },
        data: { resultedInReview: true },
      });

      // Link AI usage log if it exists for this scan
      // We look for any log created recently for this scanId that hasn't been linked yet
      const aiLog = await tx.aiUsageLog.findFirst({
        where: {
          metadata: { path: ["scanId"], equals: data.scanId } as any,
          reviewId: null,
        },
        orderBy: { usedAt: "desc" },
      });

      if (aiLog) {
        await tx.aiUsageLog.update({
          where: { id: aiLog.id },
          data: { reviewId: review.id },
        });
      }
    }

    return review;
  });
}

/**
 * Fetches paginated reviews for a business with filtering.
 */
export async function getReviews(
  businessSlug: string,
  page: number = 1,
  limit: number = 8,
  filters: {
    type?: ReviewType;
    qrCodeId?: string;
    search?: string;
    submittedToGoogle?: boolean;
    from?: Date;
    to?: Date;
    locationId?: string;
  } = {},
) {
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    qrCode: {
      business: { slug: businessSlug },
      isDeleted: false,
    },
    isDeleted: false,
    ...(filters.type && { type: filters.type }),
    ...(filters.rating && { rating: filters.rating }),
    ...(filters.qrCodeId && { qrCodeId: filters.qrCodeId }),
    ...(filters.locationId && {
      qrCode: {
        locationId: filters.locationId,
      },
    }),
    ...(filters.submittedToGoogle !== undefined && {
      submittedToGoogle: filters.submittedToGoogle,
    }),
    ...(filters.search && {
      OR: [
        { reviewText: { contains: filters.search, mode: "insensitive" } },
        { whatWentWrong: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
    ...((filters.from || filters.to) && {
      submittedAt: {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      },
    }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        qrCode: {
          select: {
            id: true,
            name: true,
            sourceTag: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews.map((r) => ({
      id: r.id,
      type: r.type,
      rating: r.rating,
      reviewText: r.reviewText,
      reviewWasAiDraft: r.reviewWasAiDraft,
      submittedToGoogle: r.submittedToGoogle,
      whatWentWrong: r.whatWentWrong,
      howToImprove: r.howToImprove,
      submittedAt: r.submittedAt,
      formattedAt: formatDate(r.submittedAt),
      qrCode: r.qrCode,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetches a single review detail for a business owner.
 */
export async function getReviewDetails(id: string, businessSlug: string) {
  const review = await prisma.review.findFirst({
    where: {
      id,
      qrCode: {
        business: { slug: businessSlug },
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
      scan: {
        select: {
          id: true,
          scannedAt: true,
          device: true,
          browser: true,
          os: true,
          ipAddress: true,
          city: true,
          country: true,
        },
      },
    },
  });

  if (!review) return null;

  return {
    ...review,
    formattedAt: formatDate(review.submittedAt),
    scan: review.scan ? {
      ...review.scan,
      formattedAt: formatDate(review.scan.scannedAt),
    } : null,
  };
}
