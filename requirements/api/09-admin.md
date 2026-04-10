# Admin API

Platform-level APIs for internal administration.  
These endpoints are accessible only to super-admins and are **completely separate** from the regular business-owner session.

---

## Auth Model

Admin auth uses a separate mechanism from regular users:

- Admins are identified by a flag stored in the `User` record: `isAdmin: Boolean @default(false)` (needs to be added to schema)
- After OTP login, if `user.isAdmin = true`, an **admin session cookie** (`rf_admin_session`) is set in addition to the regular session
- All `/api/admin/*` routes check for `rf_admin_session` — a regular `rf_session` is **not** sufficient

> [!IMPORTANT]
> If an admin API is hit with a valid regular session but no admin session, return `403 FORBIDDEN` — not `401`. This prevents enumeration attacks that could reveal admin endpoint paths.

---

## Base Path

```
/api/admin/...
```

**Auth required:** ✅ Admin session cookie (`rf_admin_session`) on **all** endpoints below.

---

## GET `/api/admin/dashboard`

Returns platform-wide aggregated stats for the admin overview screen.

### Response `200 OK`

```json
{
  "stats": {
    "totalUsers": 894,
    "totalBusinesses": 1042,
    "activeSubscriptions": 810,
    "totalScansAllTime": 384920,
    "totalReviewsAllTime": 271380,
    "platformConversionRate": 70.5,
    "totalAiCreditsConsumed": 1284920,
    "totalRevenue": {
      "allTime": 8243000,
      "thisMonth": 412000,
      "currency": "INR"
    }
  },

  "growth": {
    "newUsersThisMonth": 87,
    "newBusinessesThisMonth": 96,
    "newSubscriptionsThisMonth": 74
  },

  "planBreakdown": [
    { "plan": "STARTER", "count": 210 },
    { "plan": "GROWTH", "count": 481 },
    { "plan": "PRO", "count": 119 }
  ],

  "subscriptionStatusBreakdown": [
    { "status": "ACTIVE", "count": 810 },
    { "status": "TRIALING", "count": 92 },
    { "status": "PAST_DUE", "count": 41 },
    { "status": "CANCELED", "count": 87 },
    { "status": "EXPIRED", "count": 12 }
  ],

  "recentActivity": [
    {
      "type": "NEW_BUSINESS",
      "businessName": "Spice Garden",
      "businessSlug": "spice-garden",
      "ownerPhone": "+919876543210",
      "timestamp": "2026-04-11T00:45:00.000Z"
    },
    {
      "type": "PLAN_UPGRADED",
      "businessName": "ABC Cafe",
      "businessSlug": "abc-cafe",
      "from": "STARTER",
      "to": "GROWTH",
      "timestamp": "2026-04-10T22:30:00.000Z"
    },
    {
      "type": "TOPUP_PURCHASED",
      "businessName": "The Grand Bakery",
      "businessSlug": "the-grand-bakery",
      "package": "ACCELERATOR",
      "amountINR": 1000,
      "creditsAdded": 450,
      "timestamp": "2026-04-10T20:15:00.000Z"
    }
  ],

  "chartData": {
    "newSignupsOverTime": [
      { "date": "2026-04-05", "count": 12 },
      { "date": "2026-04-06", "count": 9 },
      { "date": "2026-04-07", "count": 15 },
      { "date": "2026-04-08", "count": 11 },
      { "date": "2026-04-09", "count": 7 },
      { "date": "2026-04-10", "count": 18 },
      { "date": "2026-04-11", "count": 15 }
    ],
    "revenueOverTime": [
      { "month": "2026-01", "amountINR": 312000 },
      { "month": "2026-02", "amountINR": 389000 },
      { "month": "2026-03", "amountINR": 402000 },
      { "month": "2026-04", "amountINR": 412000 }
    ]
  }
}
```

#### `stats` Field Reference

| Field | Description |
|-------|-------------|
| `totalUsers` | All registered users |
| `totalBusinesses` | All businesses across all users |
| `activeSubscriptions` | Subscriptions with status `ACTIVE` |
| `platformConversionRate` | Global `(reviews / scans) * 100` |
| `totalRevenue.thisMonth` | Revenue from payments `completedAt` in current calendar month |

#### `recentActivity` event types

| `type` | When triggered |
|--------|---------------|
| `NEW_BUSINESS` | A new business was created |
| `PLAN_UPGRADED` | Subscription plan was upgraded |
| `TOPUP_PURCHASED` | An AI credit topup was completed |
| `SUBSCRIPTION_CANCELED` | A subscription was canceled |

---

## GET `/api/admin/businesses`

Returns a paginated list of **all businesses** across the platform with ownership, plan, and usage info.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Results per page (max 100) |
| `search` | `string` | — | Search by business name, slug, or owner phone |
| `plan` | `string` | — | Filter by plan: `STARTER`, `GROWTH`, `PRO` |
| `status` | `string` | — | Filter by subscription status: `ACTIVE`, `TRIALING`, `PAST_DUE`, `CANCELED`, `EXPIRED` |
| `sortBy` | `string` | `createdAt` | Sort field: `createdAt`, `totalScans`, `totalReviews`, `plan` |
| `sortOrder` | `string` | `desc` | `asc` or `desc` |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "clbiz001",
      "slug": "abc-cafe",
      "name": "ABC Cafe",
      "logoUrl": "https://cdn.example.com/logos/abc-cafe.png",
      "industry": "Restaurants & Cafes",
      "location": "New York, NY",
      "createdAt": "2026-03-01T00:00:00.000Z",
      "owner": {
        "id": "cluser001",
        "phone": "+919876543210",
        "name": "Rajan Mehta",
        "email": "rajan@example.com"
      },
      "subscription": {
        "plan": "GROWTH",
        "status": "ACTIVE",
        "currentPeriodEnd": "2027-03-01T00:00:00.000Z",
        "daysUntilExpiry": 324
      },
      "usage": {
        "totalScans": 124,
        "totalReviews": 89,
        "conversionRate": 71.8,
        "aiCreditsUsed": 720,
        "aiCreditsTotal": 800
      },
      "qrCodeCount": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1042,
    "totalPages": 53
  }
}
```

---

## GET `/api/admin/businesses/expiring-subscriptions`

Returns businesses whose subscriptions are expiring soon.  
Used to trigger proactive outreach, renewal reminders, or support interventions.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `withinDays` | `number` | `30` | Return subscriptions expiring within this many days |
| `plan` | `string` | — | Filter by plan: `STARTER`, `GROWTH`, `PRO` |
| `status` | `string` | `ACTIVE,TRIALING` | Comma-separated statuses to include |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Results per page |

### Response `200 OK`

```json
{
  "summary": {
    "expiringWithin7Days": 8,
    "expiringWithin14Days": 19,
    "expiringWithin30Days": 41
  },
  "data": [
    {
      "businessId": "clbiz001",
      "businessSlug": "abc-cafe",
      "businessName": "ABC Cafe",
      "owner": {
        "name": "Rajan Mehta",
        "phone": "+919876543210",
        "email": "rajan@example.com"
      },
      "subscription": {
        "plan": "GROWTH",
        "status": "ACTIVE",
        "currentPeriodEnd": "2026-04-18T00:00:00.000Z",
        "daysUntilExpiry": 7,
        "razorpaySubId": "sub_Abc123XYZ",
        "isAutoRenewing": true
      }
    },
    {
      "businessId": "clbiz009",
      "businessSlug": "spice-garden",
      "businessName": "Spice Garden",
      "owner": {
        "name": "Priya Nair",
        "phone": "+918765432109",
        "email": null
      },
      "subscription": {
        "plan": "STARTER",
        "status": "TRIALING",
        "currentPeriodEnd": "2026-04-15T00:00:00.000Z",
        "daysUntilExpiry": 4,
        "razorpaySubId": null,
        "isAutoRenewing": false
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 41,
    "totalPages": 3
  }
}
```

#### Response Field Reference

| Field | Description |
|-------|-------------|
| `summary.expiringWithin7Days` | Count of businesses expiring in ≤ 7 days |
| `subscription.daysUntilExpiry` | Calendar days from today to `currentPeriodEnd` |
| `subscription.isAutoRenewing` | `true` if a Razorpay subscription is active and will auto-charge |
| `subscription.razorpaySubId` | `null` for trial users who haven't set up billing |

---

## GET `/api/admin/businesses/:slug`

Full detail view of a single business for the admin — includes owner info, full subscription history, payment records, and usage stats.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Response `200 OK`

```json
{
  "business": {
    "id": "clbiz001",
    "slug": "abc-cafe",
    "name": "ABC Cafe",
    "industry": "Restaurants & Cafes",
    "location": "New York, NY",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "owner": {
      "id": "cluser001",
      "phone": "+919876543210",
      "name": "Rajan Mehta",
      "email": "rajan@example.com",
      "createdAt": "2026-03-01T00:00:00.000Z",
      "totalBusinesses": 2
    },
    "subscription": {
      "plan": "GROWTH",
      "status": "ACTIVE",
      "billingInterval": "YEARLY",
      "currentPeriodStart": "2026-03-01T00:00:00.000Z",
      "currentPeriodEnd": "2027-03-01T00:00:00.000Z",
      "daysUntilExpiry": 324,
      "razorpaySubId": "sub_Abc123XYZ",
      "razorpayCustomerId": "cust_Def456"
    },
    "aiCredits": {
      "used": 720,
      "total": 800,
      "remaining": 80
    },
    "usage": {
      "totalScans": 124,
      "totalReviews": 89,
      "totalQRCodes": 4,
      "avgRating": 4.2,
      "googleSubmissions": 61,
      "conversionRate": 71.8
    },
    "recentPayments": [
      {
        "id": "clpay001",
        "status": "SUCCESS",
        "amountINR": 1000,
        "isTopup": true,
        "package": "ACCELERATOR",
        "creditsAdded": 450,
        "completedAt": "2026-04-10T20:15:00.000Z"
      }
    ]
  }
}
```

---

## PATCH `/api/admin/businesses/:slug/credits`

Manually adjust a business's AI credit balance.  
Used for support cases, refunds, or goodwill credits.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "adjustment": 200,
  "reason": "Support credit — refund for failed payment on 2026-04-10"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `adjustment` | `number` | ✅ | Credits to add (positive) or remove (negative). e.g. `200` or `-100` |
| `reason` | `string` | ✅ | Admin note logged against this adjustment |

### Response `200 OK`

```json
{
  "newBalance": {
    "used": 720,
    "total": 1000,
    "remaining": 280
  },
  "adjustment": 200,
  "reason": "Support credit — refund for failed payment on 2026-04-10"
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_ADJUSTMENT` | Adjustment would make `totalCredits` go below 0 |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## Error Responses (Admin-specific)

| Status | Code | When |
|--------|------|------|
| `401` | `UNAUTHENTICATED` | No session cookie at all |
| `403` | `FORBIDDEN` | Valid user session but not an admin |
