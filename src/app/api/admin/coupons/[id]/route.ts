import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { handleApiError } from "@/lib/error-handler";
import { getCouponById, updateCoupon, softDeleteCoupon } from "@/lib/db/coupon";
import { DiscountType } from "@prisma/client";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().int().positive().optional(),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  minOrderPaise: z.number().int().nonnegative().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
  applicablePlanIds: z.array(z.string()).nullable().optional(),
});

/**
 * GET /api/admin/coupons/:id
 */
export const GET = withAdminAuth(async (req: NextRequest, _user, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const coupon = await getCouponById(id);

    if (!coupon) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error, "ADMIN_COUPON_GET");
  }
});

/**
 * PATCH /api/admin/coupons/:id
 *
 * Partial update — pass only the fields to change.
 */
export const PATCH = withAdminAuth(async (req: NextRequest, _user, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const json = await req.json();
    const parsed = updateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { startsAt, expiresAt, ...rest } = parsed.data;

    const coupon = await updateCoupon(id, {
      ...rest,
      startsAt: startsAt === undefined ? undefined : startsAt ? new Date(startsAt) : null,
      expiresAt: expiresAt === undefined ? undefined : expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ code: "NOT_FOUND", message: "Coupon not found" }, { status: 404 });
    }
    return handleApiError(error, "ADMIN_COUPON_UPDATE");
  }
});

/**
 * DELETE /api/admin/coupons/:id
 *
 * Soft-delete — sets isDeleted = true and isActive = false.
 */
export const DELETE = withAdminAuth(async (req: NextRequest, _user, context: RouteContext) => {
  try {
    const { id } = await context.params;
    await softDeleteCoupon(id);
    return NextResponse.json({ success: true, message: "Coupon deleted." });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ code: "NOT_FOUND", message: "Coupon not found" }, { status: 404 });
    }
    return handleApiError(error, "ADMIN_COUPON_DELETE");
  }
});
