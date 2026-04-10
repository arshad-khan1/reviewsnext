# Dashboard Analytics API

Provides aggregated stats and chart data for the business dashboard page (`/[business]/dashboard`).  
All data is scoped to the authenticated user's business.

**Auth required:** ✅ All endpoints

---

## GET `/api/businesses/:slug/dashboard`

Returns all aggregated analytics needed for the main dashboard page.  
Includes stat cards, chart data, recent QR codes, recent reviews, and recent scans.

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `string` | `30d` | Date range: `7d`, `30d`, `90d`, `all` |

### Response `200 OK`

```json
{
  "stats": {
    "totalScans": 124,
    "totalReviews": 89,
    "conversionRate": 71.8,
    "avgRating": 4.2,
    "googleSubmissions": 61,
    "negativeFeedbacks": 12,
    "lowRatings": 12,
    "highRatings": 77
  },

  "charts": {
    "scansOverTime": [
      { "date": "2026-03-08", "scans": 18 },
      { "date": "2026-03-09", "scans": 22 },
      { "date": "2026-03-10", "scans": 14 },
      { "date": "2026-03-11", "scans": 25 },
      { "date": "2026-03-12", "scans": 19 },
      { "date": "2026-03-13", "scans": 16 },
      { "date": "2026-03-14", "scans": 10 }
    ],
    "ratingDistribution": [
      { "rating": "1 Star", "count": 3 },
      { "rating": "2 Star", "count": 9 },
      { "rating": "3 Star", "count": 7 },
      { "rating": "4 Star", "count": 28 },
      { "rating": "5 Star", "count": 42 }
    ],
    "deviceBreakdown": [
      { "name": "Apple", "value": 68 },
      { "name": "Samsung", "value": 31 },
      { "name": "Google", "value": 15 },
      { "name": "Other", "value": 10 }
    ],
    "browserBreakdown": [
      { "name": "Safari", "value": 72 },
      { "name": "Chrome", "value": 44 },
      { "name": "Samsung Internet", "value": 8 }
    ]
  },

  "activeQRCodes": [
    {
      "id": "clqr001",
      "name": "Main Entrance",
      "sourceTag": "entrance",
      "scans": 124,
      "conversions": 86,
      "conversionRate": 69.4
    },
    {
      "id": "clqr002",
      "name": "Table 5",
      "sourceTag": "table-5",
      "scans": 45,
      "conversions": 32,
      "conversionRate": 71.1
    }
  ],

  "recentReviews": [
    {
      "id": "clrev001",
      "type": "POSITIVE",
      "rating": 5,
      "reviewText": "Great service!",
      "submittedToGoogle": true,
      "submittedAt": "2026-03-14T09:15:00.000Z",
      "device": "iPhone 15 Pro",
      "browser": "Safari 18",
      "os": "iOS 19"
    }
  ],

  "recentScans": [
    {
      "id": "clscan001",
      "scannedAt": "2026-03-14T09:12:00.000Z",
      "device": "iPhone 15 Pro",
      "resultedInReview": true,
      "rating": 5,
      "city": "New York",
      "country": "US"
    }
  ],

  "aiCredits": {
    "used": 720,
    "total": 800
  },

  "plan": "GROWTH"
}
```

### Response Field Reference

#### `stats`

| Field | Type | Description |
|-------|------|-------------|
| `totalScans` | `number` | Total QR scans in the period |
| `totalReviews` | `number` | Total reviews submitted |
| `conversionRate` | `number` | `(totalReviews / totalScans) * 100` |
| `avgRating` | `number` | Average rating across all reviews |
| `googleSubmissions` | `number` | Reviews where `submittedToGoogle = true` |
| `negativeFeedbacks` | `number` | Reviews with `type = NEGATIVE` |
| `lowRatings` | `number` | Reviews with rating 1–3 |
| `highRatings` | `number` | Reviews with rating 4–5 |

#### `charts.scansOverTime`

Daily scan counts for the selected `period`. Each item:
- `date` — `YYYY-MM-DD`
- `scans` — number of scans on that day

#### `charts.ratingDistribution`

Count of reviews per star rating (1–5).

#### `charts.deviceBreakdown` / `charts.browserBreakdown`

Count of scans per device brand / browser name.

#### `activeQRCodes`

Top QR codes sorted by total scans descending (max 6 returned for dashboard cards).

#### `recentReviews` / `recentScans`

The 5 most recent entries for preview in the dashboard table tabs.

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |
