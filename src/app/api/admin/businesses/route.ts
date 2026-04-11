import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAllBusinesses } from "@/lib/db/admin";

/**
 * GET /api/admin/businesses
 * Returns a paginated list of all businesses across the platform.
 */
export const GET = withAdminAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const plan = searchParams.get("plan") || undefined;
  const status = searchParams.get("status") || undefined;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  try {
    const result = await getAllBusinesses({
      page,
      limit,
      search,
      plan,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ADMIN_BUSINESSES_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch businesses" }, { status: 500 });
  }
});
