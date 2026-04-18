import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getLocations, createLocation } from "@/lib/db/location";
import { checkBusinessPlan, checkPlanLimit } from "@/lib/db/plan";
import { PlanType } from "@/types/prisma-enums";

/**
 * GET /api/businesses/:slug/locations
 * Returns all locations for a business. (PRO only)
 */
export const GET = withAuth(async (req, user, { params }) => {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const includeStats = searchParams.get("includeStats") === "true";

  try {
    const result = await getLocations(slug, includeStats);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[LOCATIONS_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch locations" },
      { status: 500 },
    );
  }
});

/**
 * POST /api/businesses/:slug/locations
 * Creates a new location. (PRO only)
 */
export const POST = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const limitCheck = await checkPlanLimit(slug, "maxLocations");
    if (!limitCheck.allowed) {
      if (limitCheck.error === "BUSINESS_NOT_FOUND") {
        return NextResponse.json(
          { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
          { status: 404 },
        );
      }

      const limit = Number(limitCheck.limit ?? 0);

      return NextResponse.json(
        {
          code: "LIMIT_REACHED",
          message:
            limit <= 1
              ? "Location management is a premium feature. Upgrade your plan to add more locations."
              : `Your plan limit of ${limit} locations has been reached. Please upgrade to add more.`,
          requiredPlan: limit <= 1 ? "GROWTH" : "PRO",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Location name is required" },
        { status: 400 },
      );
    }

    const location = await createLocation(slug, body);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json(
        { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
        { status: 404 },
      );
    }
    console.error("[LOCATIONS_POST]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create location" },
      { status: 500 },
    );
  }
});
