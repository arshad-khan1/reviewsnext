import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";
import { getAdminPlans } from "@/lib/db/admin";

export const GET = withAdminAuth(async () => {
  try {
    const plans = await getAdminPlans();
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error("[ADMIN_PLANS_GET]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch plans" },
      { status: 500 },
    );
  }
});
