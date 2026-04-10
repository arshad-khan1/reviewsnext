# AI Credits API

Tracks the AI credit balance for a business.  
Credits are consumed when the AI generates a review draft for a customer.  
Credits are replenished via the subscription allocation or one-time topup purchases.

**Auth required:** ✅ All endpoints

---

## GET `/api/businesses/:slug/ai-credits`

Returns the current credit balance and recent usage history.  
Used by the `UsageCard` component on the dashboard and the topup page header.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Response `200 OK`

```json
{
  "credits": {
    "used": 720,
    "total": 800,
    "remaining": 80,
    "percentUsed": 90.0
  },
  "plan": {
    "name": "GROWTH",
    "monthlyAllotment": 800,
    "status": "ACTIVE",
    "currentPeriodEnd": "2027-03-01T00:00:00.000Z"
  },
  "recentUsage": [
    {
      "id": "cllog001",
      "operation": "REVIEW_DRAFT",
      "creditsUsed": 1,
      "usedAt": "2026-04-10T14:30:00.000Z"
    },
    {
      "id": "cllog002",
      "operation": "REVIEW_ENHANCE",
      "creditsUsed": 2,
      "usedAt": "2026-04-10T13:15:00.000Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `credits.used` | `number` | Credits consumed |
| `credits.total` | `number` | Total available (subscription + topup) |
| `credits.remaining` | `number` | `total - used` |
| `credits.percentUsed` | `number` | `(used / total) * 100` |
| `plan.name` | `string` | Current subscription plan |
| `plan.monthlyAllotment` | `number` | Credits included in plan per period |
| `recentUsage` | `array` | Last 10 AI usage events |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## POST `/api/businesses/:slug/ai-credits/topup/create-order`

Creates a Razorpay order for an AI credit topup package.  
Called when the user clicks "Proceed to Checkout" on the `/[business]/dashboard/topup` page.

> This does **not** add credits yet. Credits are only added after payment is verified.

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "packageId": "ACCELERATOR"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `packageId` | `string` | ✅ | One of: `BOOSTER`, `ACCELERATOR`, `MEGA` |

#### Package Reference

| `packageId` | Credits | Price (INR) |
|-------------|---------|-------------|
| `BOOSTER` | 200 | ₹500 |
| `ACCELERATOR` | 450 | ₹1,000 |
| `MEGA` | 1,000 | ₹2,000 |

### Response `201 Created`

```json
{
  "orderId": "order_Abc123XYZ",
  "amount": 100000,
  "currency": "INR",
  "packageId": "ACCELERATOR",
  "credits": 450,
  "razorpayKeyId": "rzp_live_..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | `string` | Razorpay order ID — pass to Razorpay checkout |
| `amount` | `number` | Amount in **paise** (₹1,000 = `100000`) |
| `currency` | `string` | `INR` |
| `packageId` | `string` | The package selected |
| `credits` | `number` | Credits that will be added on success |
| `razorpayKeyId` | `string` | Public Razorpay key for checkout SDK |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_PACKAGE` | `packageId` is not one of the valid options |
| `403` | `FORBIDDEN` | Not the business owner |

---

## POST `/api/businesses/:slug/ai-credits/topup/verify`

Verifies the Razorpay payment signature after checkout completes.  
Called client-side after the Razorpay checkout modal closes successfully.  
On success, credits are added to the business balance.

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "razorpayOrderId": "order_Abc123XYZ",
  "razorpayPaymentId": "pay_Def456UVW",
  "razorpaySignature": "abc123signature..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `razorpayOrderId` | `string` | ✅ | From `create-order` response |
| `razorpayPaymentId` | `string` | ✅ | From Razorpay checkout callback |
| `razorpaySignature` | `string` | ✅ | HMAC-SHA256 signature from Razorpay |

### Response `200 OK`

```json
{
  "success": true,
  "creditsAdded": 450,
  "newBalance": {
    "used": 720,
    "total": 1250,
    "remaining": 530
  },
  "referenceId": "PAY-8294"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` on verified payment |
| `creditsAdded` | `number` | Credits that were added |
| `newBalance` | `object` | Updated credit balance after topup |
| `referenceId` | `string` | Internal payment reference for the success screen |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_SIGNATURE` | Signature verification failed — possible tampered request |
| `400` | `ORDER_NOT_FOUND` | No matching order found for this business |
| `409` | `ALREADY_VERIFIED` | This payment was already processed |
