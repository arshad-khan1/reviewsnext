import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import { isBusinessOwner } from "@/lib/db/business";
import { getQRCodesByBusiness, createQRCode } from "@/lib/db/qr-code";
import { checkPlanLimit, getBusinessPlanFeatures } from "@/lib/db/plan";

const createQRCodeSchema = z.object({
  name: z.string().min(1),
  sourceTag: z.string().optional(),
  googleMapsLink: z.string().url().optional().nullable(),
  aiGuidingPrompt: z.string().optional().nullable(),
  commentStyle: z.enum(["PROFESSIONAL_POLITE", "FRIENDLY_CASUAL", "CONCISE_DIRECT", "ENTHUSIASTIC_WARM"]).optional().nullable(),
  acceptedStarsThreshold: z.number().min(1).max(5).optional().nullable(),
  useDefaultConfig: z.boolean().optional().default(true),
});

/**
 * GET /api/businesses/:slug/qr-codes
 * Returns all QR codes for a business with summary stats.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const search = req.nextUrl.searchParams.get("search") || undefined;
    const isActiveStr = req.nextUrl.searchParams.get("isActive");
    const isActive = isActiveStr === "true" ? true : isActiveStr === "false" ? false : undefined;

    const result = await getQRCodesByBusiness(slug, search, isActive);

    // Construct full review URL
    const origin = req.nextUrl.origin;
    const data = result.data.map(qr => ({
      ...qr,
      reviewUrl: `${origin}/${slug}/review?source=${qr.sourceTag}`
    }));

    return NextResponse.json({
      data,
      summary: result.summary,
    });

  } catch (error) {
    console.error("[GET_QR_CODES_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch QR codes" }, { status: 500 });
  }
});

/**
 * POST /api/businesses/:slug/qr-codes
 * Creates a new QR code for a business.
 */
export const POST = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;

    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createQRCodeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid field values", errors: validated.error.issues },
        { status: 400 }
      );
    }

    // 1. Check numeric limit
    const limitCheck = await checkPlanLimit(slug, "maxQrCodesTotal");
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        code: "LIMIT_REACHED", 
        message: `Your plan limit of ${limitCheck.limit} QR codes has been reached. Please upgrade to create more.` 
      }, { status: 403 });
    }

    // 2. Check feature restrictions (e.g., custom configuration per QR)
    const planData = await getBusinessPlanFeatures(slug);
    const data = { ...validated.data };
    
    if (planData && !planData.features.canCustomAiPrompts) {
      // Force defaults for plans that don't support custom overrides
      data.useDefaultConfig = true;
      data.aiGuidingPrompt = null;
      data.googleMapsLink = null;
      data.commentStyle = null;
      data.acceptedStarsThreshold = null;
    }

    const qrCode = await createQRCode(slug, data as any);

    const origin = req.nextUrl.origin;
    return NextResponse.json({
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        sourceTag: qrCode.sourceTag,
        isActive: qrCode.isActive,
        isDefault: qrCode.isDefault,
        googleMapsLink: qrCode.googleMapsLink,
        aiGuidingPrompt: qrCode.aiGuidingPrompt,
        commentStyle: qrCode.commentStyle,
        acceptedStarsThreshold: qrCode.acceptedStarsThreshold,
        useDefaultConfig: qrCode.useDefaultConfig,
        scans: 0,
        conversions: 0,
        createdAt: qrCode.createdAt,
        reviewUrl: `${origin}/${slug}/review?source=${qrCode.sourceTag}`
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("[POST_QR_CODE_ERROR]", error);
    
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }

    // Handle Prisma unique constraint error for sourceTag
    if (error.code === 'P2002') {
        return NextResponse.json({ code: "SOURCE_TAG_CONFLICT", message: "A QR code with that sourceTag already exists for this business" }, { status: 409 });
    }

    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to create QR code" }, { status: 500 });
  }
});
