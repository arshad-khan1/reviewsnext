import { prisma } from "../prisma";
import { Prisma, ReviewType } from "@prisma/client";

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
  device?: string;
  browser?: string;
  os?: string;
}) {
  return await prisma.$transaction(async (tx) => {
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
        device: data.device,
        browser: data.browser,
        os: data.os,
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
    rating?: number;
    qrCodeId?: string;
    search?: string;
    submittedToGoogle?: boolean;
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
    ...(filters.submittedToGoogle !== undefined && {
      submittedToGoogle: filters.submittedToGoogle,
    }),
    ...(filters.search && {
      OR: [
        { reviewText: { contains: filters.search, mode: "insensitive" } },
        { whatWentWrong: { contains: filters.search, mode: "insensitive" } },
      ],
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
      device: r.device,
      browser: r.browser,
      os: r.os,
      submittedAt: r.submittedAt,
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
  return await prisma.review.findFirst({
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
          city: true,
          country: true,
        },
      },
    },
  });
}
