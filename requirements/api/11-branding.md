# Branding API

Allows businesses to customize the visual appearance of their public review page.

---

## Plan Tiers

| Plan | Capability |
|------|------------|
| **STARTER** | ❌ No customization. ReviewFunnel default UI. **"Powered by ReviewFunnel" watermark** shown on every scan. |
| **GROWTH** | ✅ Full business-level branding — logo, colors, texts, font, banner. Watermark removed. |
| **PRO** | ✅ Business-level branding **+** per-QR overrides for campaigns and seasonal themes. |

---

## How Rendering Works (Merge Logic)

When a customer scans a QR code, the review page is built using this priority order:

```
ReviewFunnel defaults
  ← overridden by → business.brandingConfig     (GROWTH + PRO)
      ← overridden by → qrCode.brandingOverride  (PRO only)
```

Only the keys present in an override object take effect.  
Missing keys fall through to the level above.

**Example:**  
Business sets `primaryColor: "#4F46E5"` and `fontFamily: "Inter"`.  
A Valentine's Day QR sets `brandingOverride: { primaryColor: "#E11D48" }`.  
Result: that QR uses red but still uses `Inter` from the business config.

---

## `BrandingConfig` Shape

Both `business.brandingConfig` and `qrCode.brandingOverride` share this structure.  
All fields are optional in `brandingOverride` (partial override).  
All fields should be provided when setting `brandingConfig` for the first time.

```ts
type BrandingConfig = {
  primaryColor?: string;       // Hex color. Used for star ratings, buttons, accents
  backgroundColor?: string;    // Page background hex color
  bannerUrl?: string | null;   // Banner/hero image URL displayed above the rating UI
  headline?: string;           // Main heading. e.g. "How was your experience?"
  subheadline?: string;        // Sub-heading. e.g. "Your feedback means a lot to us."
  thankYouMessage?: string;    // Message shown after review submission
  buttonStyle?: "rounded" | "sharp" | "pill";
  fontFamily?: string;         // Google Fonts name. e.g. "Inter", "Playfair Display"
}
```

### Default values (ReviewFunnel brand — applied when `brandingConfig` is null)

```json
{
  "primaryColor": "#4F46E5",
  "backgroundColor": "#FFFFFF",
  "bannerUrl": null,
  "headline": "How was your experience?",
  "subheadline": "Your feedback helps businesses improve.",
  "thankYouMessage": "Thank you! Your feedback has been submitted.",
  "buttonStyle": "rounded",
  "fontFamily": "Inter"
}
```

---

## "Powered by ReviewFunnel" Watermark

- Shown **only** when `business.brandingConfig` is `null` (STARTER plan)
- A small badge fixed to the bottom of the review page: `"⚡ Powered by ReviewFunnel"`
- Clicking it opens the ReviewFunnel landing page — organic brand exposure
- Automatically hidden when branding is configured (GROWTH/PRO)

---

## GET `/api/businesses/:slug/branding`

Returns the current branding configuration for a business.  
Used to prefill the branding settings form.

**Auth required:** ✅ Session cookie

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Response `200 OK`

```json
{
  "plan": "GROWTH",
  "brandingConfig": {
    "primaryColor": "#0F172A",
    "backgroundColor": "#F8FAFC",
    "bannerUrl": "https://cdn.example.com/banners/abc-cafe-banner.jpg",
    "headline": "How was your visit to ABC Cafe?",
    "subheadline": "We value every piece of feedback.",
    "thankYouMessage": "Thank you! See you again soon ☕",
    "buttonStyle": "pill",
    "fontFamily": "Playfair Display"
  },
  "showWatermark": false
}
```

| Field | Description |
|-------|-------------|
| `brandingConfig` | `null` if STARTER plan; full config object otherwise |
| `showWatermark` | `true` when `brandingConfig` is null (STARTER) |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `403` | `FORBIDDEN` | Not the business owner |
| `404` | `BUSINESS_NOT_FOUND` | Business not found |

---

## PUT `/api/businesses/:slug/branding`

Sets or replaces the business-level branding config.  
`PUT` (not PATCH) because the entire config is replaced at once.

**Auth required:** ✅ Session cookie  
**Plan required:** GROWTH or PRO

### Path Parameters

| Param | Description |
|-------|-------------|
| `slug` | The business URL slug |

### Request Body

```json
{
  "primaryColor": "#0F172A",
  "backgroundColor": "#F8FAFC",
  "bannerUrl": "https://cdn.example.com/banners/abc-cafe-banner.jpg",
  "headline": "How was your visit to ABC Cafe?",
  "subheadline": "We value every piece of feedback.",
  "thankYouMessage": "Thank you! See you again soon ☕",
  "buttonStyle": "pill",
  "fontFamily": "Playfair Display"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `primaryColor` | `string` | ✅ | Valid hex color `#RRGGBB` |
| `backgroundColor` | `string` | ✅ | Valid hex color `#RRGGBB` |
| `bannerUrl` | `string \| null` | ❌ | Valid URL or `null` |
| `headline` | `string` | ✅ | Max 80 characters |
| `subheadline` | `string` | ❌ | Max 120 characters |
| `thankYouMessage` | `string` | ✅ | Max 200 characters |
| `buttonStyle` | `string` | ✅ | One of: `rounded`, `sharp`, `pill` |
| `fontFamily` | `string` | ✅ | Must be in the allowed fonts list (see below) |

#### Allowed Font Families

```
"Inter", "Roboto", "Poppins", "Outfit", "Nunito",
"Lato", "Montserrat", "Playfair Display", "Merriweather", "DM Sans"
```

### Response `200 OK`

```json
{
  "brandingConfig": {
    "primaryColor": "#0F172A",
    "backgroundColor": "#F8FAFC",
    "bannerUrl": "https://cdn.example.com/banners/abc-cafe-banner.jpg",
    "headline": "How was your visit to ABC Cafe?",
    "subheadline": "We value every piece of feedback.",
    "thankYouMessage": "Thank you! See you again soon ☕",
    "buttonStyle": "pill",
    "fontFamily": "Playfair Display"
  },
  "showWatermark": false
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid hex color, font not in allowed list, text too long |
| `403` | `FORBIDDEN` | Not the business owner |
| `403` | `PLAN_REQUIRED` | Business is on STARTER plan |

---

## DELETE `/api/businesses/:slug/branding`

Resets branding to ReviewFunnel defaults (removes the config).  
The "Powered by ReviewFunnel" watermark will re-appear after this.

**Auth required:** ✅ Session cookie

### Response `200 OK`

```json
{
  "message": "Branding reset to defaults.",
  "showWatermark": true
}
```

---

## GET `/api/businesses/:slug/qr-codes/:id/branding`

Returns the branding override for a specific QR code.  
Used to prefill the per-QR branding override form.

**Auth required:** ✅ Session cookie  
**Plan required:** PRO

### Response `200 OK`

```json
{
  "qrCodeId": "clqr001",
  "qrCodeName": "Valentine's Day Special",
  "brandingOverride": {
    "primaryColor": "#E11D48",
    "headline": "Share the love ❤️",
    "bannerUrl": "https://cdn.example.com/banners/valentines.jpg"
  },
  "effectiveConfig": {
    "primaryColor": "#E11D48",
    "backgroundColor": "#F8FAFC",
    "bannerUrl": "https://cdn.example.com/banners/valentines.jpg",
    "headline": "Share the love ❤️",
    "subheadline": "We value every piece of feedback.",
    "thankYouMessage": "Thank you! See you again soon ☕",
    "buttonStyle": "pill",
    "fontFamily": "Playfair Display"
  }
}
```

> `effectiveConfig` = merged result of business config + QR override. This is exactly what the review page renders.

---

## PUT `/api/businesses/:slug/qr-codes/:id/branding`

Sets or replaces the branding override for a specific QR code.  
Only the keys you provide will override the business-level config.

**Auth required:** ✅ Session cookie  
**Plan required:** PRO

### Request Body

```json
{
  "primaryColor": "#E11D48",
  "headline": "Share the love ❤️",
  "bannerUrl": "https://cdn.example.com/banners/valentines.jpg"
}
```

> Same field definitions as business-level branding. All fields are optional here — only provided fields override the business config.

### Response `200 OK`

```json
{
  "brandingOverride": {
    "primaryColor": "#E11D48",
    "headline": "Share the love ❤️",
    "bannerUrl": "https://cdn.example.com/banners/valentines.jpg"
  },
  "effectiveConfig": {
    "primaryColor": "#E11D48",
    "backgroundColor": "#F8FAFC",
    "bannerUrl": "https://cdn.example.com/banners/valentines.jpg",
    "headline": "Share the love ❤️",
    "subheadline": "We value every piece of feedback.",
    "thankYouMessage": "Thank you! See you again soon ☕",
    "buttonStyle": "pill",
    "fontFamily": "Playfair Display"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid hex color, disallowed font, text too long |
| `403` | `PLAN_REQUIRED` | Business is not on PRO plan |
| `404` | `QR_NOT_FOUND` | QR code not found |

---

## DELETE `/api/businesses/:slug/qr-codes/:id/branding`

Removes the per-QR branding override.  
The QR code falls back fully to the business-level config.

**Auth required:** ✅ Session cookie  
**Plan required:** PRO

### Response `200 OK`

```json
{
  "message": "QR code branding override removed. Business branding will apply."
}
```

---

## Public Merge — How the Review Page Gets Its Config

The `POST /api/public/scan` response already returns `effectiveConfig` — the fully merged branding object. The review page (`/[business]/review`) uses this to render without needing any additional API calls.

```
scan response
  ├── effectiveBranding: { ...merged config }
  └── showWatermark: boolean
```

The review page simply reads `effectiveBranding` and applies the styles. It never calls a branding endpoint directly — all data comes from the scan response.
