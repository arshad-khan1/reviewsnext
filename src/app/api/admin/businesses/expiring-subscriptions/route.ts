import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getExpiringSubscriptions } from "@/lib/db/admin";

/**
 * GET /api/admin/businesses/expiring-subscriptions
 * Returns businesses whose subscriptions are expiring soon.
 */
export const GET = withAdminAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  
  const withinDays = parseInt(searchParams.get("withinDays") || "30");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const result = await getExpiringSubscriptions({
      withinDays,
      page,
      limit,
    });

    // Add summary counts manually if needed, or refine DB helper
    const summary = {
      expiringWithin7Days: (await getExpiringSubscriptions({ withinDays: 7, page: 1, limit: 1 })).pagination.total,
      expiringWithin14Days: (await getExpiringSubscriptions({ withinDays: 14, page: 1, limit: 1 })).pagination.total,
      expiringWithin30Days: (await getExpiringSubscriptions({ withinDays: 30, page: 1, limit: 1 })).pagination.total,
    };

    return NextResponse.json({
      summary,
      ...result,
    });
  } catch (error: any) {
    console.error("[ADMIN_EXPIRING_SUBS_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch expiring subscriptions" }, { status: 500 });
  }
});
