import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { validateCoupon } from "@/lib/db/coupon";
import { handleApiError } from "@/lib/error-handler";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  planId: z.string().min(1, "planId is required"),
  businessId: z.string().min(1, "businessId is required"),
});

/**
 * POST /api/payments/coupon/validate
 *
 * Validates a coupon against all rules and returns the discount breakdown.
 * Does NOT create a redemption — purely a dry-run for the checkout UI.
 *
 * Body: { code, planId, businessId }
 * Response:
 *   { valid: true, couponId, discountType, discountValue, discountPaise, originalPrice, finalPrice, description }
 *   { valid: false, error: "EXPIRED" | "DEPLETED" | ... , message }
 */
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, planId, businessId } = parsed.data;

    // 1. Verify the business belongs to this user
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: user.sub, isDeleted: false },
    });

    if (!business) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Business not found" },
        { status: 404 }
      );
    }

    // 2. Fetch the plan to get the original price
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true, isDeleted: false },
    });

    if (!plan) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Plan not found" },
        { status: 404 }
      );
    }

    // 3. Validate the coupon
    const result = await validateCoupon(code, user.sub, plan.price, planId);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
          message: result.message,
        },
        { status: 200 } // 200 so frontend can differentiate from server errors
      );
    }

    return NextResponse.json({
      valid: true,
      couponId: result.couponId,
      code: result.code,
      description: result.description,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountPaise: result.discountPaise,
      originalPrice: result.originalPaise,
      finalPrice: result.finalPaise,
    });
  } catch (error) {
    return handleApiError(error, "COUPON_VALIDATE");
  }
});
