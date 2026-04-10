# Reviews API

Two distinct flows:

1. **Public** — Customer submits a review after scanning a QR code (unauthenticated)
2. **Dashboard** — Business owner reads submitted reviews (authenticated)

---

## POST `/api/public/review`

Submits a review from a customer on the public review page (`/[business]/review`).

**Auth required:** ❌ Public (no session required)

> This endpoint is hit when the customer clicks "Submit" on either the feedback form (low rating) or after they copy the suggested review and confirm they posted it on Google (high rating).

### Request Body

**Positive review (rating ≥ business threshold):**

```json
{
  "qrCodeId": "clqr001",
  "scanId": "clscan001",
  "rating": 5,
  "type": "POSITIVE",
  "reviewText": "Amazing food and great service! Will definitely come back.",
  "reviewWasAiDraft": true,
  "submittedToGoogle": true,
  "device": "iPhone 15 Pro",
  "browser": "Safari 18",
  "os": "iOS 19"
}
```

**Negative review (rating < business threshold):**

```json
{
  "qrCodeId": "clqr001",
  "scanId": "clscan002",
  "rating": 2,
  "type": "NEGATIVE",
  "whatWentWrong": "Long wait time and cold food.",
  "howToImprove": "Better time management and quality checks.",
  "device": "Samsung Galaxy S25",
  "browser": "Chrome 122",
  "os": "Android 16"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qrCodeId` | `string` | ✅ | ID of the QR code that was scanned |
| `scanId` | `string` | ❌ | ID of the scan event (links review back to scan) |
| `rating` | `number` | ✅ | `1`–`5` |
| `type` | `string` | ✅ | `POSITIVE` or `NEGATIVE` |
| `reviewText` | `string` | ❌ | Required if `type` is `POSITIVE` |
| `reviewWasAiDraft` | `boolean` | ❌ | `true` if text was AI-generated. Default: `false` |
| `submittedToGoogle` | `boolean` | ❌ | `true` if user confirmed they posted to Google. Default: `false` |
| `whatWentWrong` | `string` | ❌ | Required if `type` is `NEGATIVE` |
| `howToImprove` | `string` | ❌ | Optional for `NEGATIVE` type |
| `device` | `string` | ❌ | Device name from user agent |
| `browser` | `string` | ❌ | Browser name and version |
| `os` | `string` | ❌ | Operating system |

### Response `201 Created`

```json
{
  "reviewId": "clrev001",
  "message": "Thank you for your feedback!"
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Missing required fields or invalid rating |
| `404` | `QR_CODE_NOT_FOUND` | QR code ID doesn't exist or is inactive |

---

## GET `/api/businesses/:slug/reviews`

Returns a paginated list of reviews for a business with filtering support.  
Used on `/[business]/dashboard` (recent tab) and `/[business]/dashboard/reviews` (full page).

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
| `type` | `string` | — | Filter: `POSITIVE` or `NEGATIVE` |
| `rating` | `number` | — | Filter: `1`–`5` |
| `qrCodeId` | `string` | — | Filter by specific QR code |
| `search` | `string` | — | Search in `reviewText` or `whatWentWrong` |
| `submittedToGoogle` | `boolean` | — | Filter by Google submission status |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "clrev001",
      "type": "POSITIVE",
      "rating": 5,
      "reviewText": "Great service and very friendly staff. Highly recommended!",
      "reviewWasAiDraft": true,
      "submittedToGoogle": true,
      "whatWentWrong": null,
      "howToImprove": null,
      "device": "iPhone 15 Pro",
      "browser": "Safari 18",
      "os": "iOS 19",
      "submittedAt": "2026-03-14T09:15:00.000Z",
      "qrCode": {
        "id": "clqr001",
        "name": "Main Entrance",
        "sourceTag": "entrance"
      }
    },
    {
      "id": "clrev002",
      "type": "NEGATIVE",
      "rating": 2,
      "reviewText": null,
      "reviewWasAiDraft": false,
      "submittedToGoogle": false,
      "whatWentWrong": "Long wait time and cold food.",
      "howToImprove": "Better time management and quality checks.",
      "device": "iPhone 14",
      "browser": "Safari 18",
      "os": "iOS 18",
      "submittedAt": "2026-03-13T14:25:00.000Z",
      "qrCode": {
        "id": "clqr002",
        "name": "Table 5",
        "sourceTag": "table-5"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 89,
    "totalPages": 12
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## GET `/api/businesses/:slug/reviews/:id`

Fetches a single review by ID.  
Used when the user clicks a row in the reviews table to open the detail dialog.

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The review ID |

### Response `200 OK`

```json
{
  "review": {
    "id": "clrev001",
    "type": "POSITIVE",
    "rating": 5,
    "reviewText": "Great service and very friendly staff. Highly recommended!",
    "reviewWasAiDraft": true,
    "submittedToGoogle": true,
    "whatWentWrong": null,
    "howToImprove": null,
    "device": "iPhone 15 Pro",
    "browser": "Safari 18",
    "os": "iOS 19",
    "submittedAt": "2026-03-14T09:15:00.000Z",
    "qrCode": {
      "id": "clqr001",
      "name": "Main Entrance",
      "sourceTag": "entrance"
    },
    "scan": {
      "id": "clscan001",
      "scannedAt": "2026-03-14T09:12:00.000Z",
      "city": "New York",
      "country": "US"
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Review doesn't belong to this business |
| `404` | `REVIEW_NOT_FOUND` | Review not found |
