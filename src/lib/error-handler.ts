import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Handles API errors consistently across the application.
 * Detects database connection issues and other fatal errors,
 * returning a generic message to the client while logging details for developers.
 */
export function handleApiError(error: any, context?: string) {
  const logPrefix = context ? `[${context}] ` : "";
  console.error(`${logPrefix}Error:`, error);

  // 1. Detect Database Connection Issues
  const isConnectionError = detectConnectionError(error);

  if (isConnectionError) {
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Internal server error, please try again later",
      },
      { status: 500 },
    );
  }

  // 2. Handle Prisma Known Request Errors (e.g., unique constraints)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // If it's a conflict or specific known issue we want to handle locally in the route,
    // we might want to pass it through or handle specific ones here.
    // For now, we'll return a generic internal error if not caught by the route specifically,
    // but routes can still catch these before calling handleApiError.
    // Example: P2002 (Unique constraint failed) might be handled by the route for 409 Conflict.
    // If it reaches here, it's an unhandled known error.
  }

  // 3. Default Generic Error
  return NextResponse.json(
    {
      code: "INTERNAL_ERROR",
      message: "Internal server error, please try again later",
    },
    { status: 500 },
  );
}

/**
 * Checks if the error is related to database connection or availability.
 */
function detectConnectionError(error: any): boolean {
  // Prisma Connection Errors
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientRustPanicError) return true;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const connectionCodes = [
      "P1000", // Authentication failed
      "P1001", // Can't reach database server
      "P1002", // Database server timed out
      "P1003", // Database file not found
      "P1008", // Operations timed out
      "P1017", // Server closed the connection
    ];
    if (connectionCodes.includes(error.code)) return true;
  }

  // Low-level network/system errors
  const errorMessage = String(error?.message || "").toLowerCase();
  const errorCode = String(error?.code || "").toUpperCase();

  if (
    errorCode === "EAI_AGAIN" ||
    errorCode === "ECONNREFUSED" ||
    errorCode === "ETIMEDOUT" ||
    errorMessage.includes("getaddrinfo") ||
    errorMessage.includes("connection refused")
  ) {
    return true;
  }

  return false;
}
