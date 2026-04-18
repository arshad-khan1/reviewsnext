import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getFilterOptions } from "@/lib/db/admin";

/**
 * GET /api/admin/filters
 * Returns unique filter options for the platform (Cities, Industries, etc.)
 */
export const GET = withAdminAuth(async () => {
  try {
    const filters = await getFilterOptions();
    return NextResponse.json(filters);
  } catch (error: any) {
    console.error("[ADMIN_FILTERS_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch filters" },
      { status: 500 },
    );
  }
});
