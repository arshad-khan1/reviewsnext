import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getBranding, updateBranding, resetBranding } from "@/lib/db/branding";
import { checkBusinessPlan } from "@/lib/db/plan";
import { PlanType } from "@/types/prisma-enums";
import { z } from "zod";

const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  bannerUrl: z.string().url().nullable().optional(),
  headline: z.string().max(80),
  subheadline: z.string().max(120).nullable().optional(),
  thankYouMessage: z.string().max(200),
  buttonStyle: z.enum(["rounded", "sharp", "pill"]),
  fontFamily: z.enum([
    "Inter",
    "Roboto",
    "Poppins",
    "Outfit",
    "Nunito",
    "Lato",
    "Montserrat",
    "Playfair Display",
    "Merriweather",
    "DM Sans",
  ]),
});

/**
 * GET /api/businesses/:slug/branding
 * Returns the current branding configuration for a business.
 */
export const GET = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const result = await getBranding(slug);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json(
        { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
        { status: 404 },
      );
    }
    console.error("[BRANDING_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch branding" },
      { status: 500 },
    );
  }
});

/**
 * PUT /api/businesses/:slug/branding
 * Sets or replaces the business-level branding config. (GROWTH/PRO only)
 */
export const PUT = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.GROWTH);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json(
        {
          code: "PLAN_REQUIRED",
          message:
            "Branding customization is available on GROWTH and PRO plans.",
          requiredPlan: "GROWTH",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = brandingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid branding configuration",
          details: validated.error.format(),
        },
        { status: 400 },
      );
    }

    const result = await updateBranding(slug, validated.data);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json(
        { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
        { status: 404 },
      );
    }
    console.error("[BRANDING_PUT]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update branding" },
      { status: 500 },
    );
  }
});

/**
 * DELETE /api/businesses/:slug/branding
 * Resets branding to ReviewFunnel defaults.
 */
export const DELETE = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const result = await resetBranding(slug);
    return NextResponse.json({
      message: "Branding reset to defaults.",
      showWatermark: result.showWatermark,
    });
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json(
        { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
        { status: 404 },
      );
    }
    console.error("[BRANDING_DELETE]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to reset branding" },
      { status: 500 },
    );
  }
});
