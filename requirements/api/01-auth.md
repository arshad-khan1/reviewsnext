# Auth API

Phone-number OTP based authentication with JWT access + refresh token management.

---

## Auth Flow

```
1. POST /api/auth/send-otp     → sends 6-digit OTP via SMS
2. POST /api/auth/verify-otp   → verifies OTP → returns accessToken + refreshToken
3. Use accessToken in every request: Authorization: Bearer <accessToken>
4. POST /api/auth/refresh       → exchange refreshToken for new accessToken
5. POST /api/auth/logout        → revoke refreshToken
```

### Token Strategy

| Token | Lifetime | Stored | Sent via |
|-------|----------|--------|---------|
| **Access Token** | 15 minutes | Not in DB (stateless JWT) | `Authorization: Bearer` header |
| **Refresh Token** | 30 days | SHA-256 hash stored in `RefreshToken` table | HTTP-only cookie `rf_refresh` |

> Access tokens are **never stored in the database**. Only refresh token hashes are stored (for revocation). This means logout and "log out of all devices" are fully supported.

---

## POST `/api/auth/send-otp`

Sends a 6-digit OTP to the provided phone number via SMS.  
Creates the user if they don't exist (signup and login are the same flow).

**Auth required:** ❌ Public

### Request Body

```json
{
  "phone": "+919876543210"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | `string` | ✅ | E.164 format. e.g. `+919876543210` |

### Response `200 OK`

```json
{
  "message": "OTP sent successfully.",
  "sessionId": "clxyz123abc",
  "expiresAt": "2026-04-11T10:15:00.000Z"
}
```

| Field | Description |
|-------|-------------|
| `sessionId` | OTP session ID — pass back during verification |
| `expiresAt` | OTP expiry time (10 minutes) |

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_PHONE` | Phone not in valid E.164 format |
| `429` | `OTP_RATE_LIMITED` | Too many OTP requests for this phone |

---

## POST `/api/auth/verify-otp`

Verifies the OTP. On success, issues a JWT access token and a refresh token.

**Auth required:** ❌ Public

### Request Body

```json
{
  "sessionId": "clxyz123abc",
  "otp": "482910",
  "deviceLabel": "iPhone 15 • Safari"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | `string` | ✅ | From `send-otp` response |
| `otp` | `string` | ✅ | 6-digit code |
| `deviceLabel` | `string` | ❌ | Human-readable device string for session list UI |

### Response `200 OK`

Sets cookie: `rf_refresh=<refreshToken>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=2592000`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "cluser123",
    "phone": "+919876543210",
    "name": null,
    "email": null,
    "avatarUrl": null,
    "isVerified": true,
    "isAdmin": false,
    "createdAt": "2026-04-11T10:05:00.000Z"
  },
  "isNewUser": true
}
```

| Field | Description |
|-------|-------------|
| `accessToken` | Short-lived JWT. Include in `Authorization: Bearer` header |
| `expiresIn` | Seconds until access token expires (900 = 15 min) |
| `user` | Full user profile |
| `isNewUser` | `true` → redirect to `/onboard` to set up first business |

### JWT Payload (access token)

```json
{
  "sub": "cluser123",
  "phone": "+919876543210",
  "isAdmin": false,
  "iat": 1744380000,
  "exp": 1744380900
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `INVALID_OTP` | Wrong OTP code |
| `400` | `OTP_EXPIRED` | OTP has expired (>10 minutes) |
| `400` | `SESSION_NOT_FOUND` | `sessionId` doesn't exist |
| `429` | `MAX_ATTEMPTS_EXCEEDED` | Too many failed attempts — session locked |

---

## POST `/api/auth/refresh`

Issues a new access token using the refresh token cookie.  
Implements **refresh token rotation** — issues a new refresh token and revokes the old one.

**Auth required:** ❌ (uses `rf_refresh` HTTP-only cookie)

### Response `200 OK`

Rotates cookie: new `rf_refresh` cookie set, old one revoked.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `401` | `REFRESH_TOKEN_MISSING` | No `rf_refresh` cookie present |
| `401` | `REFRESH_TOKEN_INVALID` | Token not found, expired, or revoked |
| `401` | `REFRESH_TOKEN_REUSE` | Token already used (possible token theft — all user tokens revoked) |

> **Token reuse detection:** If a refresh token that was already rotated is presented again, it indicates the token was stolen. All the user's refresh tokens are immediately revoked, forcing a full re-login.

---

## GET `/api/auth/me`

Returns the currently authenticated user's profile.

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Response `200 OK`

```json
{
  "user": {
    "id": "cluser123",
    "phone": "+919876543210",
    "name": "Rajan Mehta",
    "email": "rajan@example.com",
    "avatarUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/avatars/cluser123.jpg",
    "isVerified": true,
    "isAdmin": false,
    "createdAt": "2026-04-11T10:05:00.000Z",
    "updatedAt": "2026-04-11T10:05:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `401` | `TOKEN_MISSING` | No Authorization header |
| `401` | `TOKEN_INVALID` | Malformed or tampered token |
| `401` | `TOKEN_EXPIRED` | Access token has expired — call `/refresh` |

---

## PATCH `/api/auth/me`

Updates the authenticated user's profile.

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Request Body

All fields optional.

```json
{
  "name": "Rajan Mehta",
  "email": "rajan@example.com",
  "avatarUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/avatars/cluser123.jpg"
}
```

| Field | Type | Validation |
|-------|------|------------|
| `name` | `string` | Max 100 characters |
| `email` | `string` | Valid email format. Must be unique across users. |
| `avatarUrl` | `string` | Must be a valid Cloudinary URL from your account |

### Response `200 OK`

```json
{
  "user": {
    "id": "cluser123",
    "phone": "+919876543210",
    "name": "Rajan Mehta",
    "email": "rajan@example.com",
    "avatarUrl": "https://res.cloudinary.com/reviewfunnel/image/upload/avatars/cluser123.jpg",
    "updatedAt": "2026-04-11T12:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid email or name too long |
| `409` | `EMAIL_TAKEN` | Email already used by another account |

---

## GET `/api/auth/sessions`

Returns all active refresh tokens (logged-in devices) for the user.  
Useful for a "Logged in devices" settings page.

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Response `200 OK`

```json
{
  "sessions": [
    {
      "id": "cltoken001",
      "deviceLabel": "iPhone 15 • Safari",
      "ipAddress": "49.36.xx.xx",
      "createdAt": "2026-04-11T10:05:00.000Z",
      "expiresAt": "2026-05-11T10:05:00.000Z",
      "isCurrent": true
    },
    {
      "id": "cltoken002",
      "deviceLabel": "Chrome on Windows",
      "ipAddress": "103.21.xx.xx",
      "createdAt": "2026-04-08T08:30:00.000Z",
      "expiresAt": "2026-05-08T08:30:00.000Z",
      "isCurrent": false
    }
  ]
}
```

---

## POST `/api/auth/logout`

Revokes the current refresh token. Access token expires naturally within 15 minutes.

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Response `200 OK`

```json
{
  "message": "Logged out successfully."
}
```

---

## POST `/api/auth/logout-all`

Revokes **all** refresh tokens for this user — logs out from every device.

**Auth required:** ✅ `Authorization: Bearer <accessToken>`

### Response `200 OK`

```json
{
  "message": "Logged out from all devices.",
  "revokedCount": 3
}
```
