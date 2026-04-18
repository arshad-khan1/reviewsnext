import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptionPlans, getAllTopupPlans } from "@/lib/db/plan";

/**
 * GET /api/payments/plans
 * Public endpoint — returns all active subscription plans from the DB.
 * Used by the pricing page to show live prices instead of hardcoded values.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const plans =
      type === "topup"
        ? await getAllTopupPlans()
        : await getAllSubscriptionPlans();

    return NextResponse.json({
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price, // in paise
        currency: p.currency,
        credits: p.credits,
        planTier: p.planTier,
        billingInterval: p.billingInterval,
      })),
    });
  } catch (error) {
    console.error("[GET_PLANS_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch plans" },
      { status: 500 },
    );
  }
}
