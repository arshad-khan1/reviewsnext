import { createHmac } from "crypto";
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/**
 * Singleton Razorpay instance (server-side only).
 */
export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Creates a one-time Razorpay Order.
 * @param amountInPaise  Amount in smallest unit (paise). E.g. ₹2,499 → 249900
 * @param receipt        Unique receipt string stored on the order (our Payment.id)
 */
export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string,
  currency = "INR",
) {
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    payment_capture: true, // Auto-capture on payment
  } as any);

  return order;
}

/**
 * Verifies the Razorpay payment signature after checkout completes.
 * Formula: HMAC-SHA256(orderId + "|" + paymentId, KeySecret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!signature || !orderId || !paymentId) return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies the Razorpay Webhook signature.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  if (!signature || !RAZORPAY_WEBHOOK_SECRET) return false;

  const expectedSignature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}

export { RAZORPAY_KEY_ID };
