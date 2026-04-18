import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { listActiveSessions } from "@/lib/db/auth";

/**
 * GET /api/auth/sessions
 * Returns all active refresh tokens (logged-in devices) for the user
 */
export const GET = withAuth(async (req, payload) => {
  const sessions = await listActiveSessions(payload.sub);

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      deviceLabel: s.deviceLabel,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === payload.sid,
    })),
  });
});
