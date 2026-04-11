import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getQrBranding, updateQrBranding, resetQrBranding } from "@/lib/db/branding";
import { checkBusinessPlan } from "@/lib/db/plan";
import { PlanType } from "@prisma/client";
import { z } from "zod";

const brandingOverrideSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  bannerUrl: z.string().url().nullable().optional(),
  headline: z.string().max(80).optional(),
  subheadline: z.string().max(120).nullable().optional(),
  thankYouMessage: z.string().max(200).optional(),
  buttonStyle: z.enum(["rounded", "sharp", "pill"]).optional(),
  fontFamily: z.enum([
    "Inter", "Roboto", "Poppins", "Outfit", "Nunito",
    "Lato", "Montserrat", "Playfair Display", "Merriweather", "DM Sans"
  ]).optional(),
});

/**
 * GET /api/businesses/:slug/qr-codes/:id/branding
 * Returns the branding override for a specific QR code. (PRO only)
 */
export const GET = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({ code: "PLAN_REQUIRED", message: "Per-QR branding requires PRO plan" }, { status: 403 });
    }

    const result = await getQrBranding(slug, id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "QR_NOT_FOUND") {
      return NextResponse.json({ code: "QR_NOT_FOUND", message: "QR code not found" }, { status: 404 });
    }
    console.error("[QR_BRANDING_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch QR branding" }, { status: 500 });
  }
});

/**
 * PUT /api/businesses/:slug/qr-codes/:id/branding
 * Sets or replaces the branding override for a specific QR code. (PRO only)
 */
export const PUT = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({ code: "PLAN_REQUIRED", message: "Per-QR branding requires PRO plan" }, { status: 403 });
    }

    const body = await req.json();
    const validated = brandingOverrideSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: "Invalid branding configuration", details: validated.error.format() }, { status: 400 });
    }

    const result = await updateQrBranding(slug, id, validated.data);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "QR_NOT_FOUND") {
      return NextResponse.json({ code: "QR_NOT_FOUND", message: "QR code not found" }, { status: 404 });
    }
    console.error("[QR_BRANDING_PUT]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to update QR branding" }, { status: 500 });
  }
});

/**
 * DELETE /api/businesses/:slug/qr-codes/:id/branding
 * Removes the per-QR branding override. (PRO only)
 */
export const DELETE = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({ code: "PLAN_REQUIRED", message: "PRO plan required" }, { status: 403 });
    }

    const result = await resetQrBranding(slug, id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "QR_NOT_FOUND") {
      return NextResponse.json({ code: "QR_NOT_FOUND", message: "QR code not found" }, { status: 404 });
    }
    console.error("[QR_BRANDING_DELETE]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to reset QR branding" }, { status: 500 });
  }
});
