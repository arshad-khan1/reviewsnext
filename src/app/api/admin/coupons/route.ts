import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { handleApiError } from "@/lib/error-handler";
import { createCoupon, listCoupons } from "@/lib/db/coupon";
import { DiscountType, CouponCodeStyle } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(32),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().int().positive(),
  maxDiscountPaise: z.number().int().positive().optional(),
  minOrderPaise: z.number().int().nonnegative().optional(),
  codeStyle: z.nativeEnum(CouponCodeStyle).optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional().default(true),
  applicablePlanIds: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/coupons?page=1&limit=20&search=SUMMER&isActive=true
 */
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const isActive =
      isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;

    const result = await listCoupons({ page, limit, search, isActive, includeDeleted });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "ADMIN_COUPONS_LIST");
  }
});

/**
 * POST /api/admin/coupons
 *
 * Body: CreateCouponData
 */
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const json = await req.json();
    const parsed = createSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message, issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      startsAt,
      expiresAt,
      discountType,
      discountValue,
      ...rest
    } = parsed.data;

    // Validate PERCENT constraints
    if (discountType === DiscountType.PERCENT && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "PERCENT discountValue must be between 1 and 100" },
        { status: 400 }
      );
    }

    const coupon = await createCoupon({
      ...rest,
      discountType,
      discountValue,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    // Unique constraint violation — duplicate code
    if (error?.code === "P2002") {
      return NextResponse.json(
        { code: "CONFLICT", message: "A coupon with this code already exists." },
        { status: 409 }
      );
    }
    return handleApiError(error, "ADMIN_COUPONS_CREATE");
  }
});
