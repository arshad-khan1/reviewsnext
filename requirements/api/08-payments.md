# Payments API

Handles Razorpay webhook events for asynchronous payment confirmation.  
This is a server-to-server endpoint called by Razorpay — not by the frontend.

> For client-initiated topup flows, see [07-ai-credits.md](./07-ai-credits.md).

**Auth required:** ❌ (verified via Razorpay webhook signature instead)

---

## POST `/api/payments/webhook`

Receives Razorpay webhook events.  
You must register this URL in your Razorpay Dashboard under **Webhooks**.

> The server must verify the `x-razorpay-signature` header using your `RAZORPAY_WEBHOOK_SECRET` before processing any event.

### Headers

| Header | Value |
|--------|-------|
| `x-razorpay-signature` | HMAC-SHA256 signature from Razorpay |
| `Content-Type` | `application/json` |

### Supported Events

| Event | Action Taken |
|-------|-------------|
| `payment.captured` | Mark payment as `SUCCESS`, add credits to business balance |
| `payment.failed` | Mark payment as `FAILED` |
| `subscription.activated` | Mark subscription as `ACTIVE`, set `currentPeriodStart` and `currentPeriodEnd` |
| `subscription.charged` | Renew subscription period, replenish monthly AI credit allotment |
| `subscription.cancelled` | Mark subscription as `CANCELED` |
| `subscription.expired` | Mark subscription as `EXPIRED` |

### Request Body (Razorpay format)

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa3",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Def456UVW",
        "order_id": "order_Abc123XYZ",
        "amount": 100000,
        "currency": "INR",
        "status": "captured",
        "method": "upi",
        "captured": true,
        "created_at": 1744385280
      }
    }
  }
}
```

### Response `200 OK`

```json
{
  "received": true
}
```

> Always return `200` to Razorpay to acknowledge receipt. Process asynchronously if needed.

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_SIGNATURE` | Webhook signature verification failed |
| `400` | `UNKNOWN_EVENT` | Unrecognized event type (still returns 200 to Razorpay) |

---

## Payment Record Model Reference

Every payment (topup or subscription) creates a `Payment` record in the database:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Internal CUID |
| `status` | `PENDING \| SUCCESS \| FAILED \| REFUNDED` | Payment state |
| `amountInPaise` | `number` | Amount in smallest currency unit |
| `currency` | `string` | Always `INR` |
| `type` | `string` | `"SUBSCRIPTION"` or `"TOPUP"` |
| `topupPackageId` | `BOOSTER \| ACCELERATOR \| MEGA \| null` | Set for topup payments |
| `creditsAdded` | `number \| null` | Credits granted on success |
| `razorpayOrderId` | `string` | Razorpay order ID |
| `razorpayPaymentId` | `string` | Razorpay payment ID |
| `initiatedAt` | `datetime` | When the order was created |
| `completedAt` | `datetime \| null` | When payment was captured/failed |

---

## Subscriptions

> Subscription management (upgrade/downgrade plan) is not yet implemented in the UI.  
> When implemented, the flow will be:
>
> 1. `POST /api/businesses/:slug/subscription/create` — create Razorpay subscription
> 2. Razorpay `subscription.activated` webhook → activate in DB
> 3. Razorpay `subscription.charged` webhook → renew period + reset monthly credits

### Subscription Plan Reference

| Plan | Monthly AI Credits | Price |
|------|--------------------|-------|
| `STARTER` | 100 | Free trial |
| `GROWTH` | 800 | ₹X/month |
| `PRO` | Unlimited | ₹Y/month |
