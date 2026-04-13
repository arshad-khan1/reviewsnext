import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import { findUserById, updateUserProfile, isEmailTaken } from "@/lib/db/user";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile
 */
export const GET = withAuth(async (req, payload) => {
  const user = await findUserById(payload.sub);

  if (!user) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User no longer exists" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      businesses: user.businesses,
      planTier: user.activeSubscription?.plan,
      subscriptionStatus: user.activeSubscription?.status,
    },
  });
});

const patchMeSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * PATCH /api/auth/me
 * Updates the authenticated user's profile
 */
export const PATCH = withAuth(async (req, payload) => {
  try {
    const body = await req.json();
    const result = patchMeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "Invalid input", errors: result.error.issues },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check email uniqueness if being updated
    if (email) {
      const taken = await isEmailTaken(email, payload.sub);
      if (taken) {
        return NextResponse.json(
          { code: "EMAIL_TAKEN", message: "Email is already used by another account" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await updateUserProfile(payload.sub, result.data);

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        updatedAt: updatedUser.updatedAt,
        businesses: updatedUser.businesses,
        planTier: updatedUser.activeSubscription?.plan,
        subscriptionStatus: updatedUser.activeSubscription?.status,
      },
    });
  } catch (error) {
    console.error("[AUTH_PATCH_ME]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to update profile" },
      { status: 500 }
    );
  }
});
