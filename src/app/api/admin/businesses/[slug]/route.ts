import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAdminBusinessDetail } from "@/lib/db/admin";

/**
 * GET /api/admin/businesses/:slug
 * Full detail view of a single business for the admin.
 */
export const GET = withAdminAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const result = await getAdminBusinessDetail(slug);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }
    console.error("[ADMIN_BUSINESS_DETAIL_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch business details" }, { status: 500 });
  }
});
