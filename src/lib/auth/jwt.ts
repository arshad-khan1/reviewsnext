import * as jose from "jose";
import { createHash, randomBytes } from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "at-secret-minimum-32-chars-long-please"
);

const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "rt-secret-minimum-32-chars-long-please"
);

export interface TokenPayload {
  sub: string;
  phone: string;
  isAdmin: boolean;
  sid: string; // Session ID (RefreshToken id)
}

/**
 * Signs an Access Token (15m)
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

/**
 * Verifies an Access Token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generates a high-entropy Refresh Token and its SHA-256 hash
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  const hash = hashToken(token);
  return { token, hash };
}

/**
 * Hashes a token using SHA-256
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Signs a Refresh Token (30d) - this is just a JWT layer over the random string
 * for extra security/payload if needed, but the requirements just say "refresh token cookie".
 * Usually, the RT itself is the random string, or a JWT.
 * Given the requirements say "SHA-256 hash stored in RefreshToken table", 
 * we can either:
 * 1. Use a random hex string as the token.
 * 2. Use a JWT that contains the session ID.
 * 
 * Requirement says: "POST /api/auth/refresh → exchange refreshToken for new accessToken"
 * and "Refresh Token | 30 days | SHA-256 hash stored in RefreshToken table"
 * 
 * I will use a random string as the token.
 */
