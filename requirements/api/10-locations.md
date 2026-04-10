# Locations API  *(PRO Plan Only)*

Locations represent physical branches of a business (e.g. "Bandra Branch", "Andheri Outlet").  
QR codes can be assigned to a location to enable per-branch analytics and segmented views.

**Plan restriction:** All endpoints require an active **PRO plan** subscription.  
Attempting to use these endpoints on STARTER or GROWTH plans returns `403 PLAN_REQUIRED`.

**Auth required:** ✅ All endpoints

---

## Plan Gate — Error Response

Any request to a Location endpoint from a non-PRO business returns:

```json
{
  "error": {
    "code": "PLAN_REQUIRED",
    "message": "Location management is available on the PRO plan. Upgrade to access this feature.",
    "requiredPlan": "PRO",
    "upgradeUrl": "/abc-cafe/dashboard/topup"
  }
}
```

---

## GET `/api/businesses/:slug/locations`

Returns all locations for a business.  
Used on the Locations management page and as options in the QR code assignment dropdown.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isActive` | `boolean` | — | Filter by active/inactive |
| `includeStats` | `boolean` | `false` | If `true`, includes scan/review counts per location |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": "clloc001",
      "name": "Bandra Branch",
      "address": "Shop 12, Linking Road, Bandra West",
      "city": "Mumbai",
      "isActive": true,
      "createdAt": "2026-03-05T10:00:00.000Z",
      "qrCodeCount": 4,
      "stats": {
        "totalScans": 286,
        "totalReviews": 198,
        "conversionRate": 69.2,
        "avgRating": 4.4
      }
    },
    {
      "id": "clloc002",
      "name": "Andheri Outlet",
      "address": "2nd Floor, Infiniti Mall, Andheri West",
      "city": "Mumbai",
      "isActive": true,
      "createdAt": "2026-03-10T14:00:00.000Z",
      "qrCodeCount": 4,
      "stats": {
        "totalScans": 194,
        "totalReviews": 121,
        "conversionRate": 62.4,
        "avgRating": 3.9
      }
    },
    {
      "id": "clloc003",
      "name": "Juhu Cafe",
      "address": "Juhu Beach Road, Juhu",
      "city": "Mumbai",
      "isActive": true,
      "createdAt": "2026-03-15T09:00:00.000Z",
      "qrCodeCount": 3,
      "stats": {
        "totalScans": 142,
        "totalReviews": 104,
        "conversionRate": 73.2,
        "avgRating": 4.7
      }
    }
  ],
  "unassignedQRCodes": 2
}
```

> `unassignedQRCodes` = number of QR codes in this business not yet assigned to any location.  
> `stats` is only included when `includeStats=true`.

---

## POST `/api/businesses/:slug/locations`

Creates a new location for a business.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "name": "Powai Branch",
  "address": "L&T Business Park, Powai",
  "city": "Mumbai"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Branch display name |
| `address` | `string` | ❌ | Full street address |
| `city` | `string` | ❌ | City of this branch |

### Response `201 Created`

```json
{
  "location": {
    "id": "clloc004",
    "name": "Powai Branch",
    "address": "L&T Business Park, Powai",
    "city": "Mumbai",
    "isActive": true,
    "qrCodeCount": 0,
    "createdAt": "2026-04-11T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | `name` is missing |
| `403` | `FORBIDDEN` | Not the business owner |
| `403` | `PLAN_REQUIRED` | Business is not on PRO plan |

---

## GET `/api/businesses/:slug/locations/:id`

Returns full details of a single location, including its QR codes and analytics.  
Used on the per-location analytics drill-down view.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The location ID |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `string` | `30d` | Date range for analytics: `7d`, `30d`, `90d`, `all` |

### Response `200 OK`

```json
{
  "location": {
    "id": "clloc001",
    "name": "Bandra Branch",
    "address": "Shop 12, Linking Road, Bandra West",
    "city": "Mumbai",
    "isActive": true,
    "createdAt": "2026-03-05T10:00:00.000Z",
    "stats": {
      "totalScans": 286,
      "totalReviews": 198,
      "conversionRate": 69.2,
      "avgRating": 4.4,
      "positiveCount": 171,
      "negativeCount": 27,
      "googleSubmissions": 140
    },
    "charts": {
      "scansOverTime": [
        { "date": "2026-04-05", "scans": 18 },
        { "date": "2026-04-06", "scans": 22 }
      ],
      "ratingDistribution": [
        { "rating": "1 Star", "count": 2 },
        { "rating": "2 Star", "count": 5 },
        { "rating": "3 Star", "count": 20 },
        { "rating": "4 Star", "count": 68 },
        { "rating": "5 Star", "count": 103 }
      ]
    },
    "qrCodes": [
      {
        "id": "clqr001",
        "name": "Entrance",
        "sourceTag": "bandra-entrance",
        "isActive": true,
        "scans": 98,
        "conversions": 71,
        "conversionRate": 72.4
      },
      {
        "id": "clqr002",
        "name": "Counter",
        "sourceTag": "bandra-counter",
        "isActive": true,
        "scans": 82,
        "conversions": 59,
        "conversionRate": 72.0
      }
    ]
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `403` | `PLAN_REQUIRED` | Business is not on PRO plan |
| `404` | `LOCATION_NOT_FOUND` | Location not found |

---

## PATCH `/api/businesses/:slug/locations/:id`

Updates a location's details.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The location ID |

### Request Body

All fields optional.

```json
{
  "name": "Bandra West Branch",
  "address": "Shop 15, Linking Road, Bandra West",
  "city": "Mumbai",
  "isActive": false
}
```

### Response `200 OK`

```json
{
  "location": {
    "id": "clloc001",
    "name": "Bandra West Branch",
    "isActive": false,
    "updatedAt": "2026-04-11T11:00:00.000Z"
  }
}
```

---

## DELETE `/api/businesses/:slug/locations/:id`

Deletes a location.  
QR codes assigned to this location are **not deleted** — their `locationId` is set to `null` (unassigned).

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The location ID |

### Response `200 OK`

```json
{
  "message": "Location deleted. 4 QR code(s) have been unassigned.",
  "unassignedQRCodes": 4
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `403` | `PLAN_REQUIRED` | Business is not on PRO plan |
| `404` | `LOCATION_NOT_FOUND` | Location not found |

---

## PATCH `/api/businesses/:slug/qr-codes/:id/location`

Assigns or unassigns a QR code to a location.  
This is a dedicated endpoint to keep QR assignment separate from QR settings updates.

> This is different from `PATCH /api/businesses/:slug/qr-codes/:id` — this endpoint **only** changes the location assignment.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |
| `id` | The QR code ID |

### Request Body

```json
{
  "locationId": "clloc001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | `string \| null` | ✅ | Location ID to assign, or `null` to unassign |

### Response `200 OK`

```json
{
  "qrCode": {
    "id": "clqr005",
    "name": "Table 3",
    "locationId": "clloc001",
    "locationName": "Bandra Branch"
  }
}
```

**Unassign example — set `locationId` to `null`:**

```json
{
  "qrCode": {
    "id": "clqr005",
    "name": "Table 3",
    "locationId": null,
    "locationName": null
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `LOCATION_MISMATCH` | The given `locationId` belongs to a different business |
| `403` | `FORBIDDEN` | Not the business owner |
| `403` | `PLAN_REQUIRED` | Business is not on PRO plan |
| `404` | `QR_NOT_FOUND` | QR code not found |
| `404` | `LOCATION_NOT_FOUND` | Location ID doesn't exist |
