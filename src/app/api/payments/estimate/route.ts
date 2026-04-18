import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payments/estimate?planId=...&businessId=...
 * 
 * Calculates the prorated price for an upgrade without creating an order.
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const businessId = searchParams.get("businessId");

    if (!planId || !businessId) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "planId and businessId are required" },
        { status: 400 }
      );
    }

    // 1. Verify business
    const business = await prisma.business.findFirst({
      where: { id: businessId, ownerId: user.sub, isDeleted: false },
    });

    if (!business) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Business not found" }, { status: 404 });
    }

    // 2. Fetch target plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true, isDeleted: false },
    });

    if (!plan) {
      return NextResponse.json({ code: "NOT_FOUND", message: "Plan not found" }, { status: 404 });
    }

    // 3. Proration Calculation
    let upgradeCredit = 0;
    const now = new Date();

    if (plan.type === "SUBSCRIPTION") {
      const currentSub = await prisma.userSubscription.findUnique({
        where: { userId: user.sub },
        include: { planDetails: true },
      });

      if (
        currentSub &&
        currentSub.status === "ACTIVE" &&
        currentSub.plan !== "FREE" &&
        currentSub.currentPeriodEnd &&
        currentSub.currentPeriodEnd > now
      ) {
        // If it's the same plan, it's a renewal (no credit)
        const isRenewal = currentSub.plan === (plan.planTier as any);
        
        if (isRenewal) {
          upgradeCredit = 0;
        } else {
          // It's an upgrade
          const totalDurationDays = 365;
          const msRemaining = currentSub.currentPeriodEnd.getTime() - now.getTime();
          const daysRemaining = Math.max(0, msRemaining / (1000 * 60 * 60 * 24));

          const currentPrice = currentSub.planDetails?.price || 0;
          const dailyRate = currentPrice / totalDurationDays;

          upgradeCredit = Math.floor(dailyRate * daysRemaining);

          if (upgradeCredit >= plan.price) {
            upgradeCredit = plan.price - 100;
          }
        }
      }
    }

    return NextResponse.json({
      originalPrice: plan.price,
      upgradeCredit,
      totalDue: plan.price - upgradeCredit,
      currency: plan.currency,
    });
  } catch (error) {
    console.error("[ESTIMATE_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to calculate estimate" },
      { status: 500 }
    );
  }
});
