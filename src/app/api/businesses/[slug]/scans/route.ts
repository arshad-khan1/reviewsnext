import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getScans } from "@/lib/db/scan";
import { isBusinessOwner } from "@/lib/db/business";

/**
 * GET /api/businesses/:slug/scans
 * Returns a paginated list of scan events for a business.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const qrCodeId = searchParams.get("qrCodeId") || undefined;
    const resultedInReview = searchParams.has("resultedInReview") 
      ? searchParams.get("resultedInReview") === "true" 
      : undefined;
    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

    const result = await getScans(slug, page, limit, {
      qrCodeId,
      resultedInReview,
      search,
      from,
      to,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("[GET_BUSINESS_SCANS_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch scans" }, { status: 500 });
  }
});
