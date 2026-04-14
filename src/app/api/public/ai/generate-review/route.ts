import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deductAiCredit, hasRemainingCredits, getStaticDraft } from "@/lib/db/ai-generation";

/**
 * POST /api/public/ai/generate-review
 * Generates an AI review draft (public endpoint).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[AI_GENERATE_REQUEST_BODY]", body);
    const { qrCodeId, scanId: reqScanId, rating, businessName, aiGuidingPrompt, commentStyle, operation } = body;
    const scanId = reqScanId || "anonymous-scan";

    // 1. Basic Validation
    if (!qrCodeId || rating === undefined || !businessName || !commentStyle || !operation) {
      console.log("[AI_GENERATE_MISSING_FIELDS]", { qrCodeId, scanId, rating, businessName, commentStyle, operation });
      return NextResponse.json({ code: "MISSING_FIELDS", message: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Business & Credit Info
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId, isActive: true, isDeleted: false },
      include: { business: true },
    });

    if (!qrCode) {
      return NextResponse.json({ code: "QR_NOT_FOUND", message: "QR code not found or inactive" }, { status: 404 });
    }

    const businessId = qrCode.businessId;

    // 3. Check Credits
    const canGenerate = await hasRemainingCredits(businessId);
    if (!canGenerate) {
      return NextResponse.json({ 
        code: "INSUFFICIENT_CREDITS", 
        message: "Business has insufficient AI credits" 
      }, { status: 402 });
    }

    // 4. Generate Review (Returning constant for now)
    const reviewText = "This is a constant AI-generated review for testing. The service at " + businessName + " was absolutely exceptional and I would highly recommend it to everyone!";

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
      return NextResponse.json({ code: "INSUFFICIENT_CREDITS", message: "Business has insufficient AI credits" }, { status: 402 });
    }
    console.error("[AI_GENERATE_POST]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "AI generation failed" }, { status: 500 });
  }
}
