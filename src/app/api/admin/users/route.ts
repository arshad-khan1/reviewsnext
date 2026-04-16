import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAllUsers } from "@/lib/db/admin";

/**
 * GET /api/admin/users
 * Returns a paginated list of all users across the platform.
 */
export const GET = withAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const isAdmin =
    searchParams.get("isAdmin") === "true"
      ? true
      : searchParams.get("isAdmin") === "false"
        ? false
        : undefined;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  try {
    const result = await getAllUsers({
      page,
      limit,
      search,
      isAdmin,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch users" },
      { status: 500 },
    );
  }
});
