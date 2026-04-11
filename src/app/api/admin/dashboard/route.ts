import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAdminDashboardStats, getAdminRecentActivity } from "@/lib/db/admin";

/**
 * GET /api/admin/dashboard
 * Platform-wide aggregated stats for the admin overview screen.
 */
export const GET = withAdminAuth(async (req, user) => {
  try {
    const [stats, recentActivity] = await Promise.all([
      getAdminDashboardStats(),
      getAdminRecentActivity(),
    ]);

    return NextResponse.json({
      ...stats,
      recentActivity,
      chartData: {
        // Mocking chart data for now as it requires complex temporal aggregation
        newSignupsOverTime: [
          { date: "2026-04-05", count: 12 },
          { date: "2026-04-06", count: 9 },
          { date: "2026-04-07", count: 15 },
          { date: "2026-04-08", count: 11 },
          { date: "2026-04-09", count: 7 },
          { date: "2026-04-10", count: 18 },
          { date: "2026-04-11", count: 15 }
        ],
        revenueOverTime: [
          { month: "2026-01", amountINR: 312000 },
          { month: "2026-02", amountINR: 389000 },
          { month: "2026-03", amountINR: 402000 },
          { month: "2026-04", amountINR: 412000 }
        ]
      }
    });
  } catch (error: any) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch admin dashboard" }, { status: 500 });
  }
});
