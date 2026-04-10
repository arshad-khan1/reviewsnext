import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { withAuth } from "@/lib/auth/guard";
import { revokeAllUserTokens } from "@/lib/db/auth";

/**
 * POST /api/auth/logout-all
 * Revokes ALL refresh tokens for this user
 */
export const POST = withAuth(async (req, payload) => {
  const result = await revokeAllUserTokens(payload.sub);

  const response = NextResponse.json({
    message: "Logged out from all devices.",
    revokedCount: result.count,
  });

  // Clear cookie in browser for current session
  response.headers.append(
    "Set-Cookie",
    serialize("rf_refresh", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 0,
    })
  );

  return response;
});
