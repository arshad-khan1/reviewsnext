import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDashboardData } from "@/lib/db/dashboard";
import { isBusinessOwner } from "@/lib/db/business";

/**
 * GET /api/businesses/:slug/dashboard
 * Returns aggregated analytics for the business dashboard.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "30d";

    const data = await getDashboardData(slug, period);

    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof Error && error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }

    console.error("[GET_BUSINESS_DASHBOARD_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch dashboard data" }, { status: 500 });
  }
});
