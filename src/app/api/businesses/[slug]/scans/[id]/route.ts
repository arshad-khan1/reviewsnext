import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getScanDetails } from "@/lib/db/scan";
import { isBusinessOwner } from "@/lib/db/business";

/**
 * GET /api/businesses/:slug/scans/:id
 * Fetches a single scan event by ID.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string; id: string }> }) => {
  try {
    const { slug, id } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const scan = await getScanDetails(id, slug);

    if (!scan) {
      return NextResponse.json({ code: "SCAN_NOT_FOUND", message: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan });

  } catch (error) {
    console.error("[GET_SCAN_DETAIL_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch scan details" }, { status: 500 });
  }
});
