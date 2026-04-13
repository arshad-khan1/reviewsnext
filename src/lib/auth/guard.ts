import { verifyAccessToken, TokenPayload, verifyAdminToken } from "./jwt";
import { handleApiError } from "../error-handler";
import { NextRequest, NextResponse } from "next/server";

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
 * Extracts the admin user from headers and cookies
 */
export async function getAdminUser(req: NextRequest): Promise<AuthResult> {
  const { user, error } = await getAuthUser(req);
  if (error) return { user: null, error };

  if (!user?.isAdmin) {
    return {
      user: null,
      error: NextResponse.json(
        { code: "FORBIDDEN", message: "User is not an admin" },
        { status: 403 },
      ),
    };
  }

  const adminCookie = req.cookies.get("rf_admin_session")?.value;
  const adminPayload = adminCookie ? await verifyAdminToken(adminCookie) : null;

  if (!adminPayload || adminPayload.sub !== user.sub) {
    return {
      user: null,
      error: NextResponse.json(
        { code: "FORBIDDEN", message: "Admin session is missing or invalid" },
        { status: 403 },
      ),
    };
  }

  return { user };
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
    try {
      const { user, error } = await getAuthUser(req);
      if (error) return error;
      return await handler(req, user!, context);
    } catch (error) {
      return handleApiError(error, "AUTH_GUARD");
    }
  };
}

/**
 * Higher-order function to protect Admin API routes
 */
export function withAdminAuth<T = any>(
  handler: (
    req: NextRequest,
    user: TokenPayload,
    context: T,
  ) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: T) => {
    try {
      const { user, error } = await getAdminUser(req);
      if (error) return error;
      return await handler(req, user!, context);
    } catch (error) {
      return handleApiError(error, "ADMIN_GUARD");
    }
  };
}
