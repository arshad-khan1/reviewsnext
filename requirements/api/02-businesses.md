# Businesses API

CRUD operations for managing business profiles.  
A single user can own multiple businesses.  
Each business has a unique `slug` used in all dashboard routes: `/{slug}/dashboard`.

**Auth required:** ✅ All endpoints

---

## GET `/api/businesses`

Returns all businesses owned by the authenticated user.  
Used on the `/businesses` listing page.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Results per page |
| `search` | `string` | — | Filter by business name |

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
      "lastActiveAt": "2026-03-23T10:30:00.000Z",
      "totalScans": 124,
      "totalReviews": 89,
      "conversionRate": 71.8,
      "avgRating": 4.2,
      "plan": "GROWTH",
      "aiCredits": {
        "used": 720,
        "total": 800
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## POST `/api/businesses`

Creates a new business for the authenticated user.  
Called at the end of the `/onboard` flow (Step 3 "Finish Onboarding").

### Request Body

```json
{
  "name": "The Grand Bakery",
  "industry": "Restaurants & Cafes",
  "location": "Mumbai, Maharashtra",
  "logoUrl": "https://cdn.example.com/logos/grand-bakery.png",
  "description": "Artisan breads and pastries since 2010.",
  "contactEmail": "hello@grandbakery.com",
  "acceptedStarsThreshold": 4,
  "defaultGoogleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
  "defaultAiPrompt": "Focus on the freshness of baked goods and warm staff.",
  "defaultCommentStyle": "FRIENDLY_CASUAL"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Business display name |
| `industry` | `string` | ✅ | Must match one of the predefined industry options |
| `location` | `string` | ✅ | Human-readable city/state string |
| `logoUrl` | `string` | ❌ | URL of the uploaded logo |
| `description` | `string` | ❌ | Short business description |
| `contactEmail` | `string` | ❌ | Business contact email |
| `acceptedStarsThreshold` | `number` | ❌ | `1`–`5`. Default: `4`. Ratings ≥ this go to Google |
| `defaultGoogleMapsLink` | `string` | ✅ | Google Maps review URL for the first QR code |
| `defaultAiPrompt` | `string` | ✅ | AI guiding prompt for the first QR code |
| `defaultCommentStyle` | `string` | ❌ | One of: `PROFESSIONAL_POLITE`, `FRIENDLY_CASUAL`, `CONCISE_DIRECT`, `ENTHUSIASTIC_WARM`. Default: `PROFESSIONAL_POLITE` |

### Response `201 Created`

```json
{
  "business": {
    "id": "clbiz002",
    "slug": "the-grand-bakery",
    "name": "The Grand Bakery",
    "industry": "Restaurants & Cafes",
    "location": "Mumbai, Maharashtra",
    "logoUrl": null,
    "description": "Artisan breads and pastries since 2010.",
    "acceptedStarsThreshold": 4,
    "defaultGoogleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
    "defaultAiPrompt": "Focus on the freshness of baked goods and warm staff.",
    "defaultCommentStyle": "FRIENDLY_CASUAL",
    "createdAt": "2026-04-11T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Missing required fields or invalid values |
| `409` | `SLUG_CONFLICT` | A business with that slug already exists |

---

## GET `/api/businesses/:slug`

Fetches full details for a single business.  
Used on the settings page and as a data source for dashboard header.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug (e.g. `abc-cafe`) |

### Response `200 OK`

```json
{
  "business": {
    "id": "clbiz001",
    "slug": "abc-cafe",
    "name": "ABC Cafe",
    "logoUrl": "https://cdn.example.com/logos/abc-cafe.png",
    "industry": "Restaurants & Cafes",
    "location": "New York, NY",
    "description": "A great place for customers.",
    "contactEmail": null,
    "acceptedStarsThreshold": 4,
    "defaultGoogleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
    "defaultAiPrompt": "Welcome the guest and ask about their dining experience.",
    "defaultCommentStyle": "PROFESSIONAL_POLITE",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-04-10T14:00:00.000Z",
    "subscription": {
      "plan": "GROWTH",
      "status": "ACTIVE",
      "currentPeriodEnd": "2027-03-01T00:00:00.000Z"
    },
    "aiCredits": {
      "used": 720,
      "total": 800
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Authenticated user does not own this business |
| `404` | `BUSINESS_NOT_FOUND` | No business found with that slug |

---

## PATCH `/api/businesses/:slug`

Updates an existing business's settings.  
Called from the `/[business]/settings` page on Save.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

All fields are optional — only provided fields are updated.

```json
{
  "name": "ABC Cafe & Bistro",
  "logoUrl": "https://cdn.example.com/logos/new-logo.png",
  "description": "Updated description.",
  "contactEmail": "contact@abccafe.com",
  "acceptedStarsThreshold": 3,
  "defaultGoogleMapsLink": "https://search.google.com/local/writereview?placeid=ChIJ...",
  "defaultAiPrompt": "Mention our new seasonal menu.",
  "defaultCommentStyle": "ENTHUSIASTIC_WARM"
}
```

### Response `200 OK`

```json
{
  "business": {
    "id": "clbiz001",
    "slug": "abc-cafe",
    "name": "ABC Cafe & Bistro",
    "updatedAt": "2026-04-11T11:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid field values |
| `403` | `FORBIDDEN` | Not the owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## DELETE `/api/businesses/:slug`

Permanently deletes a business and all associated data (QR codes, scans, reviews, subscription).

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Response `200 OK`

```json
{
  "message": "Business deleted successfully."
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |
