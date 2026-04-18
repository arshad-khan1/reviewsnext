import { prisma } from "../prisma";
import { DiscountType, CouponCodeStyle, Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CouponValidationResult =
  | {
      valid: true;
      couponId: string;
      code: string;
      description: string | null;
      discountType: DiscountType;
      discountValue: number;
      discountPaise: number;
      originalPaise: number;
      finalPaise: number;
    }
  | {
      valid: false;
      error:
        | "NOT_FOUND"
        | "INACTIVE"
        | "NOT_STARTED"
        | "EXPIRED"
        | "DEPLETED"
        | "ALREADY_USED"
        | "MIN_ORDER_NOT_MET"
        | "NOT_APPLICABLE_TO_PLAN";
      message: string;
    };

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountPaise?: number;
  minOrderPaise?: number;
  codeStyle?: CouponCodeStyle;
  maxUses?: number;
  maxUsesPerUser?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
  applicablePlanIds?: string[];
}

export interface UpdateCouponData {
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountPaise?: number | null;
  minOrderPaise?: number | null;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive?: boolean;
  applicablePlanIds?: string[] | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the actual paise discount for a coupon against an order amount.
 */
function calculateDiscount(
  coupon: { discountType: DiscountType; discountValue: number; maxDiscountPaise: number | null },
  originalPaise: number
): number {
  if (coupon.discountType === DiscountType.FLAT) {
    // Flat discount: never exceeds the order amount
    return Math.min(coupon.discountValue, originalPaise);
  }

  // PERCENT: discountValue is 1–100
  const raw = Math.floor((originalPaise * coupon.discountValue) / 100);
  const capped = coupon.maxDiscountPaise ? Math.min(raw, coupon.maxDiscountPaise) : raw;
  return Math.min(capped, originalPaise); // Never exceed order total
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Validate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a coupon code against all business rules WITHOUT creating a redemption.
 * Call this for the "Apply" button in the UI so users see savings before paying.
 *
 * @param code        - The coupon code string (case-insensitive)
 * @param userId      - The authenticated user's ID
 * @param originalPaise - The plan price BEFORE any upgrade proration
 * @param planId      - Optional: the DB Plan ID being purchased (for plan-specific coupons)
 */
export async function validateCoupon(
  code: string,
  userId: string,
  originalPaise: number,
  planId?: string
): Promise<CouponValidationResult> {
  const now = new Date();

  const coupon = await prisma.coupon.findFirst({
    where: { code: code.toUpperCase().trim(), isDeleted: false },
  });

  if (!coupon) {
    return { valid: false, error: "NOT_FOUND", message: "Invalid coupon code." };
  }

  if (!coupon.isActive) {
    return { valid: false, error: "INACTIVE", message: "This coupon is no longer active." };
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: "NOT_STARTED", message: "This coupon is not yet valid." };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: "EXPIRED", message: "This coupon has expired." };
  }

  // Total usage limit
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "DEPLETED", message: "This coupon has reached its usage limit." };
  }

  // Per-user usage limit
  if (coupon.maxUsesPerUser !== null) {
    const userUses = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId, isVoid: false },
    });
    if (userUses >= coupon.maxUsesPerUser) {
      return {
        valid: false,
        error: "ALREADY_USED",
        message: `You have already used this coupon${coupon.maxUsesPerUser === 1 ? "" : ` ${userUses} times`}.`,
      };
    }
  }

  // Minimum order amount
  if (coupon.minOrderPaise !== null && originalPaise < coupon.minOrderPaise) {
    const minINR = (coupon.minOrderPaise / 100).toFixed(0);
    return {
      valid: false,
      error: "MIN_ORDER_NOT_MET",
      message: `This coupon requires a minimum order of ₹${minINR}.`,
    };
  }

  // Plan restriction
  if (coupon.applicablePlanIds !== null) {
    const allowedPlanIds = coupon.applicablePlanIds as string[];
    if (planId && allowedPlanIds.length > 0 && !allowedPlanIds.includes(planId)) {
      return {
        valid: false,
        error: "NOT_APPLICABLE_TO_PLAN",
        message: "This coupon is not valid for the selected plan.",
      };
    }
  }

  const discountPaise = calculateDiscount(coupon, originalPaise);
  const finalPaise = Math.max(originalPaise - discountPaise, 0);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountPaise,
    originalPaise,
    finalPaise,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Reserve (at order creation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reserves a coupon redemption at order creation time (paymentId is null until confirmed).
 * Atomically increments usedCount on the coupon to prevent race conditions.
 *
 * Call this INSIDE the create-order transaction after validating the coupon.
 * Returns the new CouponRedemption ID.
 */
export async function reserveCouponRedemption(
  tx: Prisma.TransactionClient,
  couponId: string,
  userId: string,
  discountApplied: number
): Promise<string> {
  // Atomically increment usedCount
  await tx.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });

  const redemption = await tx.couponRedemption.create({
    data: {
      couponId,
      userId,
      discountApplied,
      isVoid: false,
    },
  });

  return redemption.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Confirm (at payment success)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stamps the confirmed paymentId on an existing pending redemption.
 * Call this in the payment verify handler or webhook after SUCCESS.
 */
export async function confirmCouponRedemption(
  redemptionId: string,
  paymentId: string
): Promise<void> {
  await prisma.couponRedemption.update({
    where: { id: redemptionId },
    data: { paymentId },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Void (on payment failure)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Voids a pending redemption and rolls back usedCount.
 * Call this when payment fails or is cancelled.
 */
export async function voidCouponRedemption(
  tx: Prisma.TransactionClient,
  redemptionId: string
): Promise<void> {
  const redemption = await tx.couponRedemption.findUnique({
    where: { id: redemptionId },
  });
  if (!redemption || redemption.isVoid) return;

  await tx.couponRedemption.update({
    where: { id: redemptionId },
    data: { isVoid: true },
  });

  // Roll back usedCount
  await tx.coupon.update({
    where: { id: redemption.couponId },
    data: { usedCount: { decrement: 1 } },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new coupon. Code is always stored uppercase.
 */
export async function createCoupon(data: CreateCouponData) {
  return prisma.coupon.create({
    data: {
      ...data,
      code: data.code.toUpperCase().trim(),
      // Json? fields require Prisma.DbNull instead of plain null to set a DB NULL
      applicablePlanIds: data.applicablePlanIds ?? Prisma.DbNull,
    },
  });
}

/**
 * Updates a coupon by ID.
 */
export async function updateCoupon(id: string, data: UpdateCouponData) {
  return prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      // undefined = leave unchanged; null = clear to DB NULL (Prisma.DbNull required for Json? fields)
      applicablePlanIds: data.applicablePlanIds === undefined
        ? undefined
        : data.applicablePlanIds === null
          ? Prisma.DbNull
          : data.applicablePlanIds,
    },
  });
}

/**
 * Soft-deletes a coupon.
 */
export async function softDeleteCoupon(id: string) {
  return prisma.coupon.update({
    where: { id },
    data: { isDeleted: true, isActive: false },
  });
}

/**
 * Gets a single coupon by code (admin, includes deleted).
 */
export async function getCouponByCode(code: string) {
  return prisma.coupon.findFirst({
    where: { code: code.toUpperCase().trim() },
    include: {
      _count: { select: { redemptions: true } },
    },
  });
}

/**
 * Gets a single coupon by ID.
 */
export async function getCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: { id },
    include: {
      _count: { select: { redemptions: true } },
    },
  });
}

/**
 * Paginated list of coupons (admin).
 */
export async function listCoupons(options: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.CouponWhereInput = {
    isDeleted: options.includeDeleted ? undefined : false,
    ...(options.isActive !== undefined && { isActive: options.isActive }),
    ...(options.search && {
      OR: [
        { code: { contains: options.search.toUpperCase(), mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ],
    }),
  };

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { redemptions: { where: { isVoid: false } } } } },
    }),
    prisma.coupon.count({ where }),
  ]);

  const now = new Date();
  const data = coupons.map((c) => ({
    ...c,
    redemptionCount: c._count.redemptions,
    status: deriveStatus(c, now),
  }));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Derives a human-readable display status.
 */
function deriveStatus(
  coupon: { isDeleted: boolean; isActive: boolean; expiresAt: Date | null; maxUses: number | null; usedCount: number; startsAt: Date | null },
  now: Date
): "ACTIVE" | "INACTIVE" | "EXPIRED" | "DEPLETED" | "SCHEDULED" {
  if (coupon.isDeleted || !coupon.isActive) return "INACTIVE";
  if (coupon.expiresAt && coupon.expiresAt < now) return "EXPIRED";
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return "DEPLETED";
  if (coupon.startsAt && coupon.startsAt > now) return "SCHEDULED";
  return "ACTIVE";
}
