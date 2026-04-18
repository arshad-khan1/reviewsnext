import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import {
  getLocationDetail,
  updateLocation,
  deleteLocation,
} from "@/lib/db/location";
import { checkBusinessPlan } from "@/lib/db/plan";
import { PlanType } from "@/types/prisma-enums";

/**
 * GET /api/businesses/:slug/locations/:id
 * Returns details of a single location. (PRO only)
 */
export const GET = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json(
        { code: "PLAN_REQUIRED", message: "PRO plan required" },
        { status: 403 },
      );
    }

    const location = await getLocationDetail(slug, id, period);
    return NextResponse.json({ location });
  } catch (error: any) {
    if (error.message === "LOCATION_NOT_FOUND") {
      return NextResponse.json(
        { code: "LOCATION_NOT_FOUND", message: "Location not found" },
        { status: 404 },
      );
    }
    console.error("[LOCATION_DETAIL_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch location details" },
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/businesses/:slug/locations/:id
 * Updates location details. (PRO only)
 */
export const PATCH = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json(
        { code: "PLAN_REQUIRED", message: "PRO plan required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const location = await updateLocation(slug, id, body);

    return NextResponse.json({ location });
  } catch (error: any) {
    if (error.message === "LOCATION_NOT_FOUND") {
      return NextResponse.json(
        { code: "LOCATION_NOT_FOUND", message: "Location not found" },
        { status: 404 },
      );
    }
    console.error("[LOCATION_PATCH]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update location" },
      { status: 500 },
    );
  }
});

/**
 * DELETE /api/businesses/:slug/locations/:id
 * Deletes a location. (PRO only)
 */
export const DELETE = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json(
        { code: "PLAN_REQUIRED", message: "PRO plan required" },
        { status: 403 },
      );
    }

    const result = await deleteLocation(slug, id);
    return NextResponse.json({
      message: `Location deleted. ${result.unassignedQRCodes} QR code(s) have been unassigned.`,
      unassignedQRCodes: result.unassignedQRCodes,
    });
  } catch (error: any) {
    if (error.message === "LOCATION_NOT_FOUND") {
      return NextResponse.json(
        { code: "LOCATION_NOT_FOUND", message: "Location not found" },
        { status: 404 },
      );
    }
    console.error("[LOCATION_DELETE]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to delete location" },
      { status: 500 },
    );
  }
});
