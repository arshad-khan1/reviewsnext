import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAdminUserDetail } from "@/lib/db/admin";

/**
 * GET /api/admin/users/[id]
 * Returns full details for a specific user.
 */
export const GET = withAdminAuth(async (req, user, context: any) => {
  const params = await context.params;
  const userId = params.id;

  if (!userId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "User ID is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getAdminUserDetail(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`[ADMIN_USER_DETAIL_GET] ${userId}`, error);
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "User not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch user details" },
      { status: 500 },
    );
  }
});
