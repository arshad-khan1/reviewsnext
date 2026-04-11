import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getLocations, createLocation } from "@/lib/db/location";
import { checkBusinessPlan } from "@/lib/db/plan";
import { PlanType } from "@prisma/client";

/**
 * GET /api/businesses/:slug/locations
 * Returns all locations for a business. (PRO only)
 */
export const GET = withAuth(async (req, user, { params }) => {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const includeStats = searchParams.get("includeStats") === "true";

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({
        code: "PLAN_REQUIRED",
        message: "Location management is available on the PRO plan. Upgrade to access this feature.",
        requiredPlan: "PRO",
        upgradeUrl: `/${slug}/dashboard/topup`
      }, { status: 403 });
    }
    if (planCheck.error === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }

    const result = await getLocations(slug, includeStats);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[LOCATIONS_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch locations" }, { status: 500 });
  }
});

/**
 * POST /api/businesses/:slug/locations
 * Creates a new location. (PRO only)
 */
export const POST = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({
        code: "PLAN_REQUIRED",
        message: "Location management is available on the PRO plan.",
        requiredPlan: "PRO"
      }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ code: "VALIDATION_ERROR", message: "Location name is required" }, { status: 400 });
    }

    const location = await createLocation(slug, body);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }
    console.error("[LOCATIONS_POST]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to create location" }, { status: 500 });
  }
});
