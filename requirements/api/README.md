# ReviewFunnel — API Documentation

## Overview

All authenticated endpoints require a valid **session token** passed as a cookie (`rf_session`) obtained after OTP verification. The public review endpoint is unauthenticated.

**Base URL:** `https://yourdomain.com/api`  
**Content-Type:** `application/json`  
**Auth:** `Authorization: Bearer <accessToken>` header (JWT, 15 min lifetime)  
**Token Refresh:** `POST /api/auth/refresh` using `rf_refresh` HTTP-only cookie (30 day lifetime)

---

## Conventions

### Standard Error Response

All endpoints return this shape on error:

```json
{
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "The requested business does not exist."
  }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request / Validation error |
| `401` | Unauthenticated — no valid session |
| `403` | Forbidden — you don't own this resource |
| `404` | Not Found |
| `409` | Conflict (e.g. duplicate slug) |
| `429` | Too Many Requests (OTP rate limit) |
| `500` | Internal Server Error |

### Pagination

Paginated list endpoints accept these query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `limit` | `number` | `20` | Items per page (max 100) |

And always return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "totalPages": 5
  }
}
```

---

## API Modules

| File | Module | Routes |
|------|--------|--------|
| [01-auth.md](./01-auth.md) | Authentication | Send OTP, Verify OTP, Me, Logout |
| [02-businesses.md](./02-businesses.md) | Businesses | CRUD for business profiles |
| [03-qr-codes.md](./03-qr-codes.md) | QR Codes | Generate, list, edit, delete QR codes |
| [04-reviews.md](./04-reviews.md) | Reviews | Public submit + dashboard listing |
| [05-scans.md](./05-scans.md) | Scans | Track scans + dashboard listing |
| [06-dashboard.md](./06-dashboard.md) | Dashboard Analytics | Aggregated stats + charts |
| [07-ai-credits.md](./07-ai-credits.md) | AI Credits | Balance, usage, topup |
| [08-payments.md](./08-payments.md) | Payments | Razorpay order creation + webhook |
| [09-admin.md](./09-admin.md) | Admin | Platform stats, all businesses, expiring subscriptions |
| [10-locations.md](./10-locations.md) | Locations *(PRO only)* | Branch locations, per-location analytics, QR assignment |
| [11-branding.md](./11-branding.md) | Branding | Review page customization (GROWTH=business-level, PRO=per-QR override) |
| [12-ai-generation.md](./12-ai-generation.md) | AI Generation | Generate review drafts using AI credits |
| [13-uploads.md](./13-uploads.md) | Uploads | Cloudinary signed upload flow for logos and banners |

---

## Route Summary

```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/refresh
GET    /api/auth/me
PATCH  /api/auth/me
GET    /api/auth/sessions
POST   /api/auth/logout
POST   /api/auth/logout-all

GET    /api/businesses
POST   /api/businesses
GET    /api/businesses/:slug
PATCH  /api/businesses/:slug
DELETE /api/businesses/:slug

GET    /api/businesses/:slug/qr-codes
POST   /api/businesses/:slug/qr-codes
GET    /api/businesses/:slug/qr-codes/:id
PATCH  /api/businesses/:slug/qr-codes/:id
DELETE /api/businesses/:slug/qr-codes/:id

POST   /api/public/scan                        ← unauthenticated
POST   /api/public/review                      ← unauthenticated

GET    /api/businesses/:slug/reviews
GET    /api/businesses/:slug/reviews/:id

GET    /api/businesses/:slug/scans
GET    /api/businesses/:slug/scans/:id

GET    /api/businesses/:slug/dashboard

GET    /api/businesses/:slug/ai-credits
POST   /api/businesses/:slug/ai-credits/topup/create-order
POST   /api/businesses/:slug/ai-credits/topup/verify

POST   /api/payments/webhook

GET    /api/admin/dashboard
GET    /api/admin/businesses
GET    /api/admin/businesses/expiring-subscriptions
GET    /api/admin/businesses/:slug
PATCH  /api/admin/businesses/:slug/credits

GET    /api/businesses/:slug/locations              ← PRO only
POST   /api/businesses/:slug/locations              ← PRO only
GET    /api/businesses/:slug/locations/:id          ← PRO only
PATCH  /api/businesses/:slug/locations/:id          ← PRO only
DELETE /api/businesses/:slug/locations/:id          ← PRO only
PATCH  /api/businesses/:slug/qr-codes/:id/location  ← PRO only

GET    /api/businesses/:slug/branding                     ← GROWTH + PRO
PUT    /api/businesses/:slug/branding                     ← GROWTH + PRO
DELETE /api/businesses/:slug/branding                     ← GROWTH + PRO
GET    /api/businesses/:slug/qr-codes/:id/branding        ← PRO only
PUT    /api/businesses/:slug/qr-codes/:id/branding        ← PRO only
DELETE /api/businesses/:slug/qr-codes/:id/branding        ← PRO only

POST   /api/public/ai/generate-review                     ← public, costs 1 AI credit

GET    /api/uploads/sign
```
