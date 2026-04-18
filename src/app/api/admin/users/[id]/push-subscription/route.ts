import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { manuallyPushSubscription } from "@/lib/db/admin";

export const POST = withAdminAuth(async (req, user, context: any) => {
  const params = await context.params;
  const id = params.id;
  
  try {
    const body = await req.json();
    const { planId, paymentMethod, amountPaid } = body;

    if (!planId || !paymentMethod || amountPaid === undefined) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Plan, payment method and amount are required" },
        { status: 400 },
      );
    }

    const result = await manuallyPushSubscription({
      userId: id,
      planId,
      paymentMethod,
      amountPaid,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ADMIN_USER_PUSH_SUBSCRIPTION]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: error.message || "Failed to push subscription" },
      { status: 500 },
    );
  }
});
