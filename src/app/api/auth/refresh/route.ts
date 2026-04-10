import { NextRequest, NextResponse } from "next/server";
import { parse, serialize } from "cookie";
import { findRefreshToken, createRefreshToken, revokeRefreshToken, revokeAllUserTokens } from "@/lib/db/auth";
import { signAccessToken, generateRefreshToken, hashToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parse(cookieHeader || "");
  const rfToken = cookies.rf_refresh;

  if (!rfToken) {
    return NextResponse.json(
      { code: "REFRESH_TOKEN_MISSING", message: "Refresh token missing" },
      { status: 401 }
    );
  }

  const rfHash = hashToken(rfToken);
  const session = await findRefreshToken(rfHash);

  // 1. Token not found or expired
  if (!session || new Date() > session.expiresAt) {
    return NextResponse.json(
      { code: "REFRESH_TOKEN_INVALID", message: "Token invalid or expired" },
      { status: 401 }
    );
  }

  const { user } = session;

  // 2. Token reuse detection (Already revoked)
  if (session.revokedAt) {
    // SECURITY ALERT: Token reuse detected. Revoke all user tokens.
    await revokeAllUserTokens(session.userId);
    return NextResponse.json(
      { code: "REFRESH_TOKEN_REUSE", message: "Security alert: token reuse detected" },
      { status: 401 }
    );
  }

  // 3. Perform Rotation
  // Step A: Revoke old token
  await revokeRefreshToken(rfHash);

  const { token: newRfToken, hash: newRfHash } = generateRefreshToken();

  // Step C: Store new refresh token
  const newRfSession = await createRefreshToken({
    userId: user.id,
    tokenHash: newRfHash,
    deviceLabel: session.deviceLabel || "Rotated Session",
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || session.ipAddress || "0.0.0.0",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  // Step D: Sign new access token with new sid
  const accessToken = await signAccessToken({
    sub: user.id,
    phone: user.phone,
    isAdmin: user.isAdmin,
    sid: newRfSession.id,
  });

  // 4. Prepare Response
  const response = NextResponse.json({
    accessToken,
    expiresIn: 900,
  });

  // Set new cookie
  response.headers.append(
    "Set-Cookie",
    serialize("rf_refresh", newRfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 30 * 24 * 60 * 60,
    })
  );

  return response;
}
