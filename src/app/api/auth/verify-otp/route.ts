import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRefreshToken } from "@/lib/db/auth";
import { findUserByPhone, upsertUser } from "@/lib/db/user";
import {
  signAccessToken,
  generateRefreshToken,
  signAdminToken,
} from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "INVALID_PHONE"),
  otp: z.string().length(6),
  deviceLabel: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid input" },
        { status: 400 },
      );
    }

    const { phone, otp, deviceLabel } = result.data;

    // 1. Verify OTP with Twilio
    const isValid = true; // DEVELOPMENT BYPASS: await checkTwilioVerification(phone, otp);

    if (!isValid) {
      return NextResponse.json(
        { code: "INVALID_OTP", message: "OTP verification failed or expired" },
        { status: 400 },
      );
    }

    // 2. Get or Create User
    const existingUser = await findUserByPhone(phone);
    const isNewUser = !existingUser;
    const user = await upsertUser(phone);

    const { token: rfToken, hash: rfHash } = generateRefreshToken();

    // 3. Store Refresh Token in DB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const rfSession = await createRefreshToken({
      userId: user.id,
      tokenHash: rfHash,
      deviceLabel: deviceLabel || "Unknown Device",
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0",
      expiresAt,
    });

    // 4. Issue Access Token with Session ID (sid) and user metadata
    const accessToken = await signAccessToken({
      sub: user.id,
      phone: user.phone,
      isAdmin: user.isAdmin,
      sid: rfSession.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      businesses: (user as any).businesses,
    });

    // 5. Prepare Response
    const response = NextResponse.json({
      accessToken,
      expiresIn: 900,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        businesses: (user as any).businesses || [],
      },
      isNewUser,
    });

    const cookieStore = await cookies();
    cookieStore.set("rf_refresh", rfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    if (user.isAdmin) {
      const adminToken = await signAdminToken({ sub: user.id });
      cookieStore.set("rf_admin_session", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      });
    }

    return response;
  } catch (error) {
    console.error("[AUTH_VERIFY_OTP]", error);
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message:
          "Verification failed: " +
          (error instanceof Error
            ? error.stack || error.message
            : String(error)),
      },
      { status: 500 },
    );
  }
}
