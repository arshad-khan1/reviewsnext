import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { withAuth } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/logout
 * Revokes the current refresh token and clears the cookie
 */
export const POST = withAuth(async (req, payload) => {
  // Revoke current session in DB
  await prisma.refreshToken.update({
    where: { id: payload.sid },
    data: { revokedAt: new Date() },
  });

  const response = NextResponse.json({
    message: "Logged out successfully.",
  });

  // Clear cookie in browser (must match path exactly)
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
