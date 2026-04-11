import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "./jwt";

/**
 * Result of authentication check
 */
export interface AuthResult {
  user: TokenPayload | null;
  error?: NextResponse;
}

/**
 * Extracts the user from the Authorization header
 */
export async function getAuthUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      user: null,
      error: NextResponse.json(
        { code: "TOKEN_MISSING", message: "Authorization header is missing" },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      user: null,
      error: NextResponse.json(
        { code: "TOKEN_INVALID", message: "Token is invalid or expired" },
        { status: 401 },
      ),
    };
  }

  return { user: payload };
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth<T = any>(
  handler: (
    req: NextRequest,
    user: TokenPayload,
    context: T,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: T) => {
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    return handler(req, user!, context);
  };
}
