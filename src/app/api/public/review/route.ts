import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReview } from "@/lib/db/review";
import { prisma } from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@/types/prisma-enums";

const publicReviewSchema = z.object({
  qrCodeId: z.string().min(1),
  scanId: z.string().optional(),
  rating: z.number().min(1).max(5),
  type: z.enum(["POSITIVE", "NEGATIVE"]),
  reviewText: z.string().optional(),
  reviewWasAiDraft: z.boolean().optional(),
  submittedToGoogle: z.boolean().optional(),
  whatWentWrong: z.string().optional(),
  howToImprove: z.string().optional(),
}).refine((data) => {
  if (data.type === "POSITIVE" && !data.reviewText) return false;
  if (data.type === "NEGATIVE" && !data.whatWentWrong) return false;
  return true;
}, {
  message: "reviewText is required for POSITIVE, whatWentWrong is required for NEGATIVE",
  path: ["reviewText", "whatWentWrong"],
});

/**
 * POST /api/public/review
 * Submits a review from a customer (unauthenticated).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = publicReviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid field values", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { qrCodeId } = validated.data;

    // Verify QR code exists and is active
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId, isDeleted: false },
      select: { isActive: true, businessId: true },
    });

    if (!qrCode) {
      return NextResponse.json({ code: "QR_CODE_NOT_FOUND", message: "QR code not found" }, { status: 404 });
    }

    if (!qrCode.isActive) {
      return NextResponse.json({ code: "QR_CODE_INACTIVE", message: "This QR code is currently inactive" }, { status: 403 });
    }

    // Check trial expiry for FREE plan users
    const business = await prisma.business.findUnique({
      where: { id: qrCode.businessId },
      select: { ownerId: true },
    });

    if (business) {
      const subscription = await prisma.userSubscription.findUnique({
        where: { userId: business.ownerId },
        select: { plan: true, status: true, trialEndsAt: true },
      });

      if (
        subscription?.plan === PlanType.FREE &&
        subscription?.status === SubscriptionStatus.TRIALING &&
        subscription?.trialEndsAt &&
        new Date() > subscription.trialEndsAt
      ) {
        return NextResponse.json(
          { code: "TRIAL_EXPIRED", message: "Your free trial has expired. Please upgrade to continue accepting reviews." },
          { status: 403 }
        );
      }
    }

    const review = await createReview(validated.data as any);

    return NextResponse.json({
      reviewId: review.id,
      message: "Thank you for your feedback!"
    }, { status: 201 });

  } catch (error) {
    console.error("[PUBLIC_REVIEW_POST_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to submit review" }, { status: 500 });
  }
}
