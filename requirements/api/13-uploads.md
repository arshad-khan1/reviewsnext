# Uploads API

All file uploads (business logos, review page banners) use **Cloudinary** as the storage provider.  
The upload flow uses **signed upload presets** — the client uploads directly to Cloudinary, and only the resulting URL is saved to the database.

**Auth required:** ✅ All endpoints (uploads are authenticated actions)

---

## Upload Flow

```
1. Client calls → GET /api/uploads/sign          (get a signed upload params)
2. Client uploads file directly → Cloudinary CDN  (using the signed params)
3. Cloudinary returns → { secure_url, public_id }
4. Client calls → PATCH /api/businesses/:slug     (saves the URL to DB)
```

> This pattern keeps large file data off your server entirely. Your API only handles signing (step 1) and URL persistence (step 4).

---

## GET `/api/uploads/sign`

Generates a signed upload preset for direct Cloudinary upload from the browser.  
The signature is time-limited (valid for 60 seconds).

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `string` | ✅ | Upload category. One of: `business_logo`, `business_banner`, `avatar` |
| `businessSlug` | `string` | ❌ | Required when `type` is `business_logo` or `business_banner` |

### Response `200 OK`

```json
{
  "cloudName": "reviewfunnel",
  "apiKey": "123456789012345",
  "timestamp": 1744380000,
  "signature": "abc123def456...",
  "folder": "reviewfunnel/business_logos",
  "publicId": "reviewfunnel/business_logos/abc-cafe_1744380000",
  "uploadUrl": "https://api.cloudinary.com/v1_1/reviewfunnel/image/upload"
}
```

| Field | Description |
|-------|-------------|
| `cloudName` | Your Cloudinary cloud name |
| `apiKey` | Cloudinary API key (public, safe to expose) |
| `timestamp` | Unix timestamp used for signature |
| `signature` | HMAC-SHA1 signature — authenticates the upload to Cloudinary |
| `folder` | Cloudinary folder where the file will be stored |
| `publicId` | Pre-assigned public ID (ensures predictable URL and overwrites old uploads) |
| `uploadUrl` | Cloudinary upload endpoint to POST to |

### Folder Structure on Cloudinary

| `type` | Cloudinary Folder |
|--------|-------------------|
| `business_logo` | `reviewfunnel/business_logos/` |
| `business_banner` | `reviewfunnel/business_banners/` |
| `avatar` | `reviewfunnel/avatars/` |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_TYPE` | `type` is not one of the allowed values |
| `400` | `BUSINESS_SLUG_REQUIRED` | `type` needs `businessSlug` but it was not provided |
| `403` | `FORBIDDEN` | `businessSlug` provided but user doesn't own that business |

---

## How to Upload (Client-side Example)

After receiving the sign response, the client uploads directly to Cloudinary:

```ts
// 1. Get signed params from your API
const { cloudName, apiKey, timestamp, signature, folder, publicId, uploadUrl } =
  await fetch("/api/uploads/sign?type=business_logo&businessSlug=abc-cafe").then(r => r.json());

// 2. Build form data
const formData = new FormData();
formData.append("file", selectedFile);           // The actual file
formData.append("api_key", apiKey);
formData.append("timestamp", timestamp);
formData.append("signature", signature);
formData.append("folder", folder);
formData.append("public_id", publicId);

// 3. Upload directly to Cloudinary
const result = await fetch(uploadUrl, {
  method: "POST",
  body: formData,
}).then(r => r.json());

// result.secure_url: "https://res.cloudinary.com/reviewfunnel/image/upload/..."

// 4. Save URL to your database
await fetch(`/api/businesses/abc-cafe`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({ logoUrl: result.secure_url }),
});
```

---

## File Constraints

Enforced via Cloudinary upload preset configuration (set in Cloudinary dashboard):

| Type | Max Size | Allowed Formats | Recommended Dimensions |
|------|----------|-----------------|------------------------|
| `business_logo` | 2 MB | JPG, PNG, WEBP, SVG | Square, min 200×200px |
| `business_banner` | 5 MB | JPG, PNG, WEBP | 1200×400px (3:1 ratio) |
| `avatar` | 2 MB | JPG, PNG, WEBP | Square, min 100×100px |

---

## Transformation URLs

Cloudinary URLs can be transformed on-the-fly using URL parameters.  
Your frontend should request appropriately sized images:

```ts
// Original
"https://res.cloudinary.com/reviewfunnel/image/upload/reviewfunnel/business_logos/abc-cafe.jpg"

// Resized to 200×200, auto quality, WebP format
"https://res.cloudinary.com/reviewfunnel/image/upload/w_200,h_200,c_fill,f_webp,q_auto/reviewfunnel/business_logos/abc-cafe.jpg"
```

| Transformation | Code | Use case |
|----------------|------|---------|
| Resize + crop | `w_200,h_200,c_fill` | Logo thumbnail |
| WebP format | `f_webp` | Browser optimization |
| Auto quality | `q_auto` | Smaller file size |
| Rounded corners | `r_20` | Styled logo display |

---

## Accessing Uploaded Assets in API Responses

Once saved, file URLs appear in normal API responses:

```json
// GET /api/businesses/:slug
{
  "business": {
    "logoUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/reviewfunnel/business_logos/abc-cafe.jpg",
    "brandingConfig": {
      "bannerUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/reviewfunnel/business_banners/abc-cafe-banner.jpg"
    }
  }
}
```

And the scan response (for the public review page):
```json
// POST /api/public/scan
{
  "logoUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/reviewfunnel/business_logos/abc-cafe.jpg",
  "effectiveBranding": {
    "bannerUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/reviewfunnel/business_banners/abc-cafe-banner.jpg"
  }
}
```
