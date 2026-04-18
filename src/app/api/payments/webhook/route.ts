import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  handlePaymentCaptured,
  handlePaymentFailed,
  handleSubscriptionCharged,
  handleSubscriptionStatusChange,
} from "@/lib/db/payment";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  // We need the raw body for signature verification
  const rawBody = await req.text();

  const isValid = verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    console.error("[Webhook] Invalid signature detected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, payload } = body;

  console.log(`[Webhook] Received Razorpay event: ${event}`);

  try {
    switch (event) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        await handlePaymentCaptured({
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
        });
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        await handlePaymentFailed({
          paymentId: payment.id,
          orderId: payment.order_id,
        });
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription.entity;
        const payment = payload.payment.entity;
        await handleSubscriptionCharged({
          subscriptionId: sub.id,
          nextChargeDate: sub.charge_at,
          currentStart: sub.current_start,
          currentEnd: sub.current_end,
        });
        break;
      }

      case "subscription.activated":
        await handleSubscriptionStatusChange(
          payload.subscription.entity.id,
          SubscriptionStatus.ACTIVE
        );
        break;

      case "subscription.cancelled":
        await handleSubscriptionStatusChange(
          payload.subscription.entity.id,
          SubscriptionStatus.CANCELED
        );
        break;

      case "subscription.expired":
        await handleSubscriptionStatusChange(
          payload.subscription.entity.id,
          SubscriptionStatus.EXPIRED
        );
        break;

      default:
        console.warn(`[Webhook] Unhandled event type: ${event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`[Webhook] Error processing event ${event}:`, error);
    // Always return 200 to Razorpay to prevent retries of poison messages,
    // but log the error for monitoring.
    return NextResponse.json({ received: true, error: "Internal processing error" }, { status: 200 });
  }
}
