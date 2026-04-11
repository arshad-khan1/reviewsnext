import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { createRazorpaySubscription, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { initiateSubscription } from "@/lib/db/subscription";
import { PlanType, BillingInterval } from "@prisma/client";

export const POST = withAuth(async (req: NextRequest, { business, user }) => {
  const body = await req.json();
  const { plan, billingInterval } = body;

  if (!plan || !billingInterval) {
    return NextResponse.json({ error: "PLAN_AND_INTERVAL_REQUIRED" }, { status: 400 });
  }

  try {
    // 1. Create Razorpay Subscription (mocked)
    const razorpaySub = await createRazorpaySubscription(plan, billingInterval);

    // 2. Save/Update in DB
    await initiateSubscription(
      business.id,
      plan as PlanType,
      billingInterval as BillingInterval,
      razorpaySub.id
    );

    return NextResponse.json({
      subscriptionId: razorpaySub.id,
      razorpayKeyId: RAZORPAY_KEY_ID,
      plan,
      billingInterval
    }, { status: 201 });

  } catch (error) {
    console.error("[Subscription] Creation error:", error);
    return NextResponse.json({ error: "SUBSCRIPTION_CREATION_FAILED" }, { status: 500 });
  }
});
