import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { adjustBusinessCredits } from "@/lib/db/admin";
import { z } from "zod";

const adjustCreditsSchema = z.object({
  adjustment: z.number(),
  reason: z.string().min(5),
});

/**
 * PATCH /api/admin/businesses/:slug/credits
 * Manually adjust a business's AI credit balance (Support only).
 */
export const PATCH = withAdminAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const body = await req.json();
    const validated = adjustCreditsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ code: "INVALID_INPUT", message: "Invalid adjustment or reason" }, { status: 400 });
    }

    const result = await adjustBusinessCredits(slug, validated.data.adjustment, validated.data.reason);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }
    // Handle potential business logic errors (like negative balance if we wanted to enforce it)
    
    console.error("[ADMIN_CREDITS_ADJUST]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to adjust credits" }, { status: 500 });
  }
});
