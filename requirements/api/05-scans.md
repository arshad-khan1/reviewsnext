# Scans API

A scan event is recorded every time a customer opens a QR review link — even if they don't submit a review.  
This allows tracking **conversion rate** = (reviews submitted / total scans).

Two flows:
1. **Public** — Record a scan when the review page loads (unauthenticated)
2. **Dashboard** — Business owner views scan history (authenticated)

---

## POST `/api/public/scan`

Records a QR code scan event.  
Called automatically when a customer lands on `/[business]/review?source=...`.

**Auth required:** ❌ Public

> This should be called as soon as the review page loads, before the user takes any action. The `scanId` returned is passed later when submitting a review to link them together.

### Request Body

```json
{
  "businessSlug": "abc-cafe",
  "sourceTag": "entrance",
  "device": "iPhone 15 Pro",
  "browser": "Safari 18",
  "os": "iOS 19"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `businessSlug` | `string` | ✅ | The business slug from the URL |
| `sourceTag` | `string` | ✅ | The `source` query param from the QR URL |
| `device` | `string` | ❌ | Parsed from User-Agent |
| `browser` | `string` | ❌ | Parsed from User-Agent |
| `os` | `string` | ❌ | Parsed from User-Agent |

> **Note:** `ipAddress`, `city`, and `country` are resolved server-side from the request IP. Do not send these from the client.

### Response `201 Created`

```json
{
  "scanId": "clscan001",
  "qrCodeId": "clqr001",
  "businessName": "ABC Cafe",
  "logoUrl": "https://cdn.example.com/logos/abc-cafe.png",
  "acceptedStarsThreshold": 4,
  "googleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
  "aiGuidingPrompt": "Welcome the guest and ask about their dining experience.",
  "commentStyle": "PROFESSIONAL_POLITE"
}
```

> The response includes everything needed to render the review page (business branding, routing config, AI settings).

| Field | Type | Description |
|-------|------|-------------|
| `scanId` | `string` | Store this — pass it when submitting the review |
| `qrCodeId` | `string` | The QR code that was scanned |
| `businessName` | `string` | Business display name |
| `logoUrl` | `string \| null` | Business logo URL |
| `acceptedStarsThreshold` | `number` | Ratings ≥ this go to Google |
| `googleMapsLink` | `string \| null` | QR-level link, falls back to business default |
| `aiGuidingPrompt` | `string \| null` | QR-level prompt, falls back to business default |
| `commentStyle` | `string` | Comment style for AI suggestions |
| `effectiveBranding` | `object` | Fully merged branding config (business defaults + QR override). Used directly to style the review page. |
| `showWatermark` | `boolean` | `true` for STARTER plan — render the "Powered by ReviewFunnel" badge |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `404` | `QR_NOT_FOUND` | No active QR code found for this business + sourceTag combination |

---

## GET `/api/businesses/:slug/scans`

Returns a paginated list of scan events for a business.  
Used on `/[business]/dashboard` (scans tab) and `/[business]/dashboard/scans` (full page).

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `8` | Results per page |
| `qrCodeId` | `string` | — | Filter by specific QR code |
| `resultedInReview` | `boolean` | — | `true` = only converted scans, `false` = no review |
| `search` | `string` | — | Search by device, city, country, or IP |
| `from` | `ISO date` | — | Filter scans on or after this date |
| `to` | `ISO date` | — | Filter scans on or before this date |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "clscan001",
      "scannedAt": "2026-03-14T09:12:00.000Z",
      "device": "iPhone 15 Pro",
      "browser": "Safari 18",
      "os": "iOS 19",
      "ipAddress": "192.168.1.10",
      "city": "New York",
      "country": "US",
      "resultedInReview": true,
      "qrCode": {
        "id": "clqr001",
        "name": "Main Entrance",
        "sourceTag": "entrance"
      },
      "review": {
        "id": "clrev001",
        "rating": 5,
        "type": "POSITIVE"
      }
    },
    {
      "id": "clscan002",
      "scannedAt": "2026-03-13T17:30:00.000Z",
      "device": "Google Pixel 9",
      "browser": "Chrome 122",
      "os": "Android 16",
      "ipAddress": "10.0.0.5",
      "city": "Chicago",
      "country": "US",
      "resultedInReview": false,
      "qrCode": {
        "id": "clqr002",
        "name": "Table 5",
        "sourceTag": "table-5"
      },
      "review": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 124,
    "totalPages": 16
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## GET `/api/businesses/:slug/scans/:id`

Fetches a single scan event by ID.  
Used when the user clicks a row in the scans table to open the detail dialog.

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The scan ID |

### Response `200 OK`

```json
{
  "scan": {
    "id": "clscan001",
    "scannedAt": "2026-03-14T09:12:00.000Z",
    "device": "iPhone 15 Pro",
    "browser": "Safari 18",
    "os": "iOS 19",
    "ipAddress": "192.168.1.10",
    "city": "New York",
    "country": "US",
    "resultedInReview": true,
    "qrCode": {
      "id": "clqr001",
      "name": "Main Entrance",
      "sourceTag": "entrance"
    },
    "review": {
      "id": "clrev001",
      "rating": 5,
      "type": "POSITIVE",
      "submittedToGoogle": true,
      "submittedAt": "2026-03-14T09:15:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Scan doesn't belong to this business |
| `404` | `SCAN_NOT_FOUND` | Scan not found |
