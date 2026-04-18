import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withAuth } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/logout
 * Revokes the current refresh token and clears the cookie
 */
export const POST = withAuth(async (req, payload) => {
  // Revoke current session in DB
  try {
    if (payload.sid) {
      await prisma.refreshToken.update({
        where: { id: payload.sid },
        data: { revokedAt: new Date() },
      });
    }
  } catch (err) {
    console.error("[AUTH_LOGOUT] Failed to revoke session", err);
  }

  const response = NextResponse.json({
    message: "Logged out successfully.",
  });

  // Clear cookies in browser
  const cookieStore = await cookies();
  cookieStore.delete("rf_refresh");
  cookieStore.delete("rf_admin_session");

  return response;
});
