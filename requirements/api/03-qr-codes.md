# QR Codes API

Each QR code belongs to a business and has a unique `sourceTag` used in the public review URL:

```
https://yourdomain.com/{businessSlug}/review?source={sourceTag}
```

Each QR code can override the business-level defaults for:
- Google Maps review link
- AI guiding prompt
- Comment style

**Auth required:** ✅ All endpoints

---

## GET `/api/businesses/:slug/qr-codes`

Returns all QR codes for a business.  
Used on the `/[business]/dashboard/qr-codes` management page.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string` | — | Filter by name or sourceTag |
| `isActive` | `boolean` | — | Filter by active/inactive status |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "clqr001",
      "name": "Main Entrance",
      "sourceTag": "entrance",
      "isActive": true,
      "googleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
      "aiGuidingPrompt": "Welcome the guest and ask about their dining experience.",
      "commentStyle": "PROFESSIONAL_POLITE",
      "scans": 124,
      "conversions": 86,
      "conversionRate": 69.4,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "reviewUrl": "https://yourdomain.com/abc-cafe/review?source=entrance"
    },
    {
      "id": "clqr002",
      "name": "Table 5",
      "sourceTag": "table-5",
      "isActive": true,
      "googleMapsLink": null,
      "aiGuidingPrompt": null,
      "commentStyle": null,
      "scans": 45,
      "conversions": 32,
      "conversionRate": 71.1,
      "createdAt": "2026-03-05T14:30:00.000Z",
      "reviewUrl": "https://yourdomain.com/abc-cafe/review?source=table-5"
    }
  ],
  "summary": {
    "totalQRCodes": 3,
    "totalScans": 258,
    "avgConversionRate": 70.2
  }
}
```

> **Note:** `googleMapsLink`, `aiGuidingPrompt`, and `commentStyle` will be `null` if not overridden at the QR level — the business defaults apply in that case.

---

## POST `/api/businesses/:slug/qr-codes`

Creates a new QR code for a business.  
Called from the "Create New QR" form on the QR codes management page.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "name": "Waitlist Counter",
  "sourceTag": "waitlist-counter",
  "googleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
  "aiGuidingPrompt": "Thank the guest for their patience while waiting and ask for a review.",
  "commentStyle": "FRIENDLY_CASUAL"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Human-readable label (e.g. "Table 5", "Counter") |
| `sourceTag` | `string` | ✅ | Slug-safe unique tag (e.g. `table-5`). Auto-generated from name if not provided. Must be unique within the business. |
| `googleMapsLink` | `string` | ❌ | Overrides business default. If omitted, business default is used. |
| `aiGuidingPrompt` | `string` | ❌ | Overrides business default |
| `commentStyle` | `string` | ❌ | One of: `PROFESSIONAL_POLITE`, `FRIENDLY_CASUAL`, `CONCISE_DIRECT`, `ENTHUSIASTIC_WARM` |

### Response `201 Created`

```json
{
  "qrCode": {
    "id": "clqr003",
    "name": "Waitlist Counter",
    "sourceTag": "waitlist-counter",
    "isActive": true,
    "googleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
    "aiGuidingPrompt": "Thank the guest for their patience while waiting.",
    "commentStyle": "FRIENDLY_CASUAL",
    "scans": 0,
    "conversions": 0,
    "createdAt": "2026-04-11T12:00:00.000Z",
    "reviewUrl": "https://yourdomain.com/abc-cafe/review?source=waitlist-counter"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Missing `name` or invalid `commentStyle` |
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |
| `409` | `SOURCE_TAG_CONFLICT` | A QR code with that `sourceTag` already exists for this business |

---

## GET `/api/businesses/:slug/qr-codes/:id`

Returns details for a single QR code including its analytics summary.  
Used on the `/[business]/dashboard/qr-codes/[id]` analytics page.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The QR code ID |

### Response `200 OK`

```json
{
  "qrCode": {
    "id": "clqr001",
    "name": "Main Entrance",
    "sourceTag": "entrance",
    "isActive": true,
    "googleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
    "aiGuidingPrompt": "Welcome the guest and ask about their dining experience.",
    "commentStyle": "PROFESSIONAL_POLITE",
    "createdAt": "2026-03-01T10:00:00.000Z",
    "reviewUrl": "https://yourdomain.com/abc-cafe/review?source=entrance",
    "stats": {
      "totalScans": 124,
      "totalReviews": 86,
      "conversionRate": 69.4,
      "avgRating": 4.3,
      "positiveCount": 74,
      "negativeCount": 12,
      "googleSubmissions": 61
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `QR_NOT_FOUND` | QR code not found |

---

## PATCH `/api/businesses/:slug/qr-codes/:id`

Updates a QR code's settings.  
Called from the "Edit QR Settings" dialog on the QR management page.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The QR code ID |

### Request Body

All fields optional.

```json
{
  "name": "Main Entrance (Updated)",
  "isActive": false,
  "googleMapsLink": "https://search.google.com/local/writereview?placeid=NewID...",
  "aiGuidingPrompt": "Updated prompt text.",
  "commentStyle": "CONCISE_DIRECT"
}
```

### Response `200 OK`

```json
{
  "qrCode": {
    "id": "clqr001",
    "name": "Main Entrance (Updated)",
    "isActive": false,
    "updatedAt": "2026-04-11T12:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `QR_NOT_FOUND` | QR code not found |

---

## DELETE `/api/businesses/:slug/qr-codes/:id`

Deletes a QR code and all its associated scans and reviews.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The QR code ID |

### Response `200 OK`

```json
{
  "message": "QR code deleted successfully."
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `QR_NOT_FOUND` | QR code not found |
