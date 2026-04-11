import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  findRefreshToken,
  createRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "@/lib/db/auth";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const rfToken = cookieStore.get("rf_refresh")?.value;

  if (!rfToken) {
    return NextResponse.json(
      { code: "REFRESH_TOKEN_MISSING", message: "Refresh token missing" },
      { status: 401 },
    );
  }

  const rfHash = hashToken(rfToken);
  const session = await findRefreshToken(rfHash);

  // 1. Token not found
  if (!session) {
    console.error(`[AUTH_REFRESH] Session not found for hash: ${rfHash}`);
    return NextResponse.json(
      { code: "REFRESH_TOKEN_INVALID", message: "Token invalid" },
      { status: 401 },
    );
  }

  // 2. Token expired
  if (new Date() > session.expiresAt) {
    console.warn(`[AUTH_REFRESH] Token expired for user: ${session.userId}`);
    return NextResponse.json(
      { code: "REFRESH_TOKEN_EXPIRED", message: "Token expired" },
      { status: 401 },
    );
  }

  // 3. Token reuse detection (Already revoked)
  if (session.revokedAt) {
    const gracePeriodMs = 30 * 1000; // 30 seconds
    const isWithinGracePeriod =
      Date.now() - session.revokedAt.getTime() < gracePeriodMs;

    if (isWithinGracePeriod) {
      // Parallel request detected.
      // Instead of revoking everything, we just return 401 and let the client retry with the new token it received.
      // However, since the client probably hasn't received the new token yet,
      // we just return a specific code so the client knows not to force-logout yet.
      return NextResponse.json(
        {
          code: "REFRESH_TOKEN_ROTATING",
          message: "Token rotation in progress",
        },
        { status: 429 }, // Too many requests or similar
      );
    }

    // SECURITY ALERT: Authentic reuse (old token used long after rotation)
    console.error(
      `[SECURITY_ALERT] Token reuse detected for user: ${session.userId}`,
    );
    await revokeAllUserTokens(session.userId);
    return NextResponse.json(
      {
        code: "REFRESH_TOKEN_REUSE",
        message: "Security alert: token reuse detected",
      },
      { status: 401 },
    );
  }

  // 4. Perform Rotation
  // Step A: Revoke old token
  await revokeRefreshToken(rfHash);

  // Step B: Generate new token pair
  const { token: newRfToken, hash: newRfHash } = generateRefreshToken();

  // Step C: Store new refresh token
  const newRfSession = await createRefreshToken({
    userId: session.userId,
    tokenHash: newRfHash,
    deviceLabel: session.deviceLabel || "Rotated Session",
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      session.ipAddress ||
      "0.0.0.0",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  // Step D: Sign new access token with full metadata
  const accessToken = await signAccessToken({
    sub: session.user.id,
    phone: session.user.phone,
    isAdmin: session.user.isAdmin,
    sid: newRfSession.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.avatarUrl,
    businesses: (session.user as any).businesses,
  });

  // 5. Prepare Response
  const response = NextResponse.json({
    accessToken,
    expiresIn: 900,
  });

  // 6. Set new cookie with broad path
  cookieStore.set("rf_refresh", newRfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
