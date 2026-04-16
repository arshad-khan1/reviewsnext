import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  deductAiCredit,
  hasRemainingCredits,
  generateReviewDraft,
} from "@/lib/db/ai-generation";

/**
 * POST /api/public/ai/generate-review
 * Generates an AI review draft via OpenAI (public endpoint — no auth required).
 *
 * Body:
 *   qrCodeId      string  — the QR code that initiated this review flow
 *   scanId        string  — the scan record ID (or "anonymous-scan")
 *   rating        number  — star rating given by the customer (1–5)
 *   businessName  string  — name of the business
 *   commentStyle  string  — CommentStyle enum value
 *   aiGuidingPrompt string (optional) — business owner's custom AI prompt
 *   operation     string  — "REVIEW_DRAFT" | "REVIEW_REGENERATE"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      qrCodeId,
      scanId: reqScanId,
      rating,
      businessName,
      aiGuidingPrompt,
      commentStyle,
      operation,
      userInput,
    } = body;

    const scanId = reqScanId || "anonymous-scan";

    // 1. Basic Validation
    if (
      !qrCodeId ||
      rating === undefined ||
      !businessName ||
      !commentStyle ||
      !operation
    ) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Fetch QR Code & Business
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId, isActive: true, isDeleted: false },
      include: { business: true },
    });

    if (!qrCode) {
      return NextResponse.json(
        { code: "QR_NOT_FOUND", message: "QR code not found or inactive" },
        { status: 404 },
      );
    }

    const businessId = qrCode.businessId;

    // 3. Check Credits
    const canGenerate = await hasRemainingCredits(businessId);
    if (!canGenerate) {
      return NextResponse.json(
        {
          code: "INSUFFICIENT_CREDITS",
          message: "Business has insufficient AI credits",
        },
        { status: 402 },
      );
    }

    // 4. Generate Review via OpenAI
    const reviewText = await generateReviewDraft({
      businessName,
      rating,
      commentStyle,
      aiGuidingPrompt:
        aiGuidingPrompt || qrCode.business.defaultAiPrompt || undefined,
      userInput,
    });

    // 5. Deduct Credit & Log
    const { creditsRemaining } = await deductAiCredit({
      businessId,
      qrCodeId,
      scanId,
      operation,
    });

    return NextResponse.json({
      reviewText,
      creditsRemaining,
      operation,
    });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        {
          code: "INSUFFICIENT_CREDITS",
          message: "Business has insufficient AI credits",
        },
        { status: 402 },
      );
    }
    console.error("[AI_GENERATE_POST]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "AI generation failed" },
      { status: 500 },
    );
  }
}
