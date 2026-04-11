import { createHmac } from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "razorpay_webhook_placeholder";

/**
 * Creates an order in Razorpay.
 * In a real app, this would use the razorpay SDK or a POST request to their API.
 */
export async function createRazorpayOrder(amountInPaise: number, currency: string = "INR") {
  // In production, you would use:
  // const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  // const order = await rzp.orders.create({ amount, currency, receipt: ... });
  
  // For now, we simulate the order ID generation if no real credentials exist,
  // or you could implement the actual fetch call here.
  const orderId = `order_${Math.random().toString(36).substring(2, 15)}`;
  
  return {
    id: orderId,
    amount: amountInPaise,
    currency,
  };
}

/**
 * Verifies the Razorpay signature for client-side redirection verification.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!signature) return false;

  const body = orderId + "|" + paymentId;
  const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies the Razorpay Webhook signature.
 * @param payload Raw request body as string
 * @param signature Value from x-razorpay-signature header
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature) return false;

  const expectedSignature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Creates a subscription in Razorpay.
 */
export async function createRazorpaySubscription(planName: string, interval: string) {
  // In production, you would fetch real plan IDs from your environment or DB
  // const sub = await rzp.subscriptions.create({ plan_id: PLAN_ID, customer_notify: 1, ... });
  
  const subId = `sub_${Math.random().toString(36).substring(2, 15)}`;
  
  return {
    id: subId,
    status: "created"
  };
}

export { RAZORPAY_KEY_ID };
