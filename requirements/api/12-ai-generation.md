# AI Review Generation API

The AI generation feature is the **core monetized capability** of ReviewFunnel.  
When a customer rates ≥ threshold stars, they can click "Generate with AI" to get a professionally written review draft tailored to the business.

Each generation consumes **1 AI credit** from the business's balance and logs to `AiUsageLog`.

**Auth required:** ❌ Public (customer-facing, called from the public review page)

> AI credits are consumed by the **business**, not the customer. The customer never needs an account.

---

## Credit Cost Reference

| Operation | Credits | Description |
|-----------|---------|-------------|
| `REVIEW_DRAFT` | 1 | Generate initial review draft |
| `REVIEW_ENHANCE` | 1 | Regenerate/improve an existing draft |

---

## POST `/api/public/ai/generate-review`

Generates an AI review draft for a customer on the public review page.  
Called when the customer clicks "Generate with AI" after giving a high star rating.

**Auth required:** ❌ Public

### Request Body

```json
{
  "qrCodeId": "clqr001",
  "scanId": "clscan001",
  "rating": 5,
  "businessName": "ABC Cafe",
  "aiGuidingPrompt": "Welcome the guest and ask about their dining experience.",
  "commentStyle": "FRIENDLY_CASUAL",
  "operation": "REVIEW_DRAFT"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `qrCodeId` | `string` | ✅ | Used to look up the business and deduct credits |
| `scanId` | `string` | ✅ | Links credit usage to this scan event |
| `rating` | `number` | ✅ | `1`–`5`. The AI tailors tone based on rating |
| `businessName` | `string` | ✅ | Injected into the AI prompt for context |
| `aiGuidingPrompt` | `string` | ❌ | Business/QR-level guiding prompt (from scan response) |
| `commentStyle` | `string` | ✅ | One of: `PROFESSIONAL_POLITE`, `FRIENDLY_CASUAL`, `CONCISE_DIRECT`, `ENTHUSIASTIC_WARM` |
| `operation` | `string` | ✅ | `REVIEW_DRAFT` (first gen) or `REVIEW_ENHANCE` (re-roll) |

### Response `200 OK`

```json
{
  "reviewText": "ABC Cafe is an absolute gem! The food was fresh, the staff incredibly warm, and the ambiance was just right for a relaxed afternoon. Highly recommend to anyone looking for a cozy cafe experience in the city.",
  "creditsRemaining": 79,
  "operation": "REVIEW_DRAFT"
}
```

| Field | Description |
|-------|-------------|
| `reviewText` | The generated review text, ready to display in the text area |
| `creditsRemaining` | Updated remaining credit balance (shown in the UI so owner can see deductions) |
| `operation` | Echoed back for client logging |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `402` | `INSUFFICIENT_CREDITS` | Business has 0 credits remaining |
| `404` | `QR_NOT_FOUND` | QR code doesn't exist or is inactive |
| `503` | `AI_UNAVAILABLE` | AI provider timed out or returned an error |

> **On `INSUFFICIENT_CREDITS`:** The review page should gracefully hide the "Generate with AI" button and show a static text area instead. The customer can still type their review manually.

---

## How the AI Prompt Is Constructed (Server-side)

The server builds the prompt using the inputs — the client never constructs the full prompt:

```
System:
  You are a helpful assistant that writes Google Business reviews on behalf of customers.
  Write in a {commentStyle} tone.
  Keep the review between 2-4 sentences.
  Do not use emojis unless the style is ENTHUSIASTIC_WARM.
  Sound natural and authentic, like a real customer wrote it.

User:
  The customer visited "{businessName}" and gave it {rating} out of 5 stars.
  {aiGuidingPrompt ? `Focus on: ${aiGuidingPrompt}` : ""}
  Write a Google review from their perspective.
```

---

## Credit Deduction Flow

```
1. Receive request
2. Look up business via qrCodeId
3. Check business.aiCredits.remaining > 0 → else return 402
4. Call AI provider (Gemini / OpenAI)
5. On success:
   a. Increment aiCredits.usedCredits by 1
   b. Create AiUsageLog { operation, creditsUsed: 1, reviewId: null (filled later when review is submitted) }
6. Return generated text
```

> The `AiUsageLog.reviewId` is initially `null`. When the customer submits the review (via `POST /api/public/review`), the backend updates the log to link it to the final `Review` record.

---

## POST `/api/public/ai/generate-review` — Re-roll (Enhance)

The same endpoint handles regeneration. Pass `operation: "REVIEW_ENHANCE"` and optionally include the previous text for context.

### Request Body (re-roll)

```json
{
  "qrCodeId": "clqr001",
  "scanId": "clscan001",
  "rating": 5,
  "businessName": "ABC Cafe",
  "aiGuidingPrompt": "Focus on the coffee and pastries.",
  "commentStyle": "FRIENDLY_CASUAL",
  "operation": "REVIEW_ENHANCE",
  "previousText": "ABC Cafe is great! Really enjoyed my visit."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `previousText` | `string` | ❌ | Prior draft — AI uses it to generate a meaningfully different version |

### Response `200 OK`

Same shape as `REVIEW_DRAFT` response.
