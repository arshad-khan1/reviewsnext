import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { completeTopupPayment } from "@/lib/db/ai-credits";

/**
 * POST /api/businesses/:slug/ai-credits/topup/verify
 * Verifies Razorpay payment signature and adds credits.
 */
export const POST = withAuth(async (req, user, { params }) => {
  const { slug } = await params;

  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ code: "MISSING_FIELDS", message: "Missing payment verification fields" }, { status: 400 });
    }

    // 1. Verify Signature
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return NextResponse.json({ code: "INVALID_SIGNATURE", message: "Signature verification failed" }, { status: 400 });
    }

    // 2. Complete Payment & Add Credits
    const result = await completeTopupPayment({
      businessSlug: slug,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ code: "ORDER_NOT_FOUND", message: "No matching order found" }, { status: 404 });
    }
    if (error.message === "ALREADY_VERIFIED") {
      return NextResponse.json({ code: "ALREADY_VERIFIED", message: "Payment already verified" }, { status: 409 });
    }
    
    console.error("[AI_CREDITS_VERIFY]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Verification failed" }, { status: 500 });
  }
});
