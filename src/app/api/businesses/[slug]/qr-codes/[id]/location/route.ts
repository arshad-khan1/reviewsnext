import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { assignQrToLocation } from "@/lib/db/location";
import { checkBusinessPlan } from "@/lib/db/plan";
import { PlanType } from "@prisma/client";

/**
 * PATCH /api/businesses/:slug/qr-codes/:id/location
 * Assigns or unassigns a QR code to a location. (PRO only)
 */
export const PATCH = withAuth(async (req, user, { params }) => {
  const { slug, id } = await params;

  try {
    const planCheck = await checkBusinessPlan(slug, PlanType.PRO);
    if (planCheck.error === "PLAN_REQUIRED") {
      return NextResponse.json({ code: "PLAN_REQUIRED", message: "PRO plan required" }, { status: 403 });
    }

    const body = await req.json();
    const locationId = body.locationId; // Can be null

    const result = await assignQrToLocation(slug, id, locationId);
    return NextResponse.json({ qrCode: result });
  } catch (error: any) {
    if (error.message === "QR_NOT_FOUND") {
      return NextResponse.json({ code: "QR_NOT_FOUND", message: "QR code not found" }, { status: 404 });
    }
    if (error.message === "LOCATION_NOT_FOUND") {
      return NextResponse.json({ code: "LOCATION_NOT_FOUND", message: "Location not found" }, { status: 404 });
    }
    console.error("[QR_LOCATION_PATCH]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to assign location" }, { status: 500 });
  }
});
