import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { createRazorpayOrder, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { createTopupOrderInDb } from "@/lib/db/ai-credits";
import { prisma } from "@/lib/prisma";
import { TopupPackageId } from "@prisma/client";

const PACKAGE_PRICING: Record<string, { credits: number; price: number }> = {
  BOOSTER: { credits: 200, price: 500 },
  ACCELERATOR: { credits: 450, price: 1000 },
  MEGA: { credits: 1000, price: 2000 },
};

/**
 * POST /api/businesses/:slug/ai-credits/topup/create-order
 * Creates a Razorpay order for an AI credit topup.
 */
export const POST = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const body = await req.json();
    const { packageId } = body;

    const pkg = PACKAGE_PRICING[packageId?.toUpperCase()];
    if (!pkg) {
      return NextResponse.json({ code: "INVALID_PACKAGE", message: "Invalid topup package" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { slug, isDeleted: false },
    });

    if (!business) {
      return NextResponse.json({ code: "BUSINESS_NOT_FOUND", message: "Business not found" }, { status: 404 });
    }

    // 1. Create Order in Razorpay
    const amountInPaise = pkg.price * 100;
    const order = await createRazorpayOrder(amountInPaise);

    // 2. Store Order in Database (Pending Payment)
    await createTopupOrderInDb({
      businessId: business.id,
      packageId: packageId.toUpperCase() as TopupPackageId,
      amountInPaise,
      credits: pkg.credits,
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      packageId: packageId.toUpperCase(),
      credits: pkg.credits,
      razorpayKeyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[AI_CREDITS_CREATE_ORDER]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to create order" }, { status: 500 });
  }
});
