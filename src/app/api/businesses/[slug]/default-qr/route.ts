import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { isBusinessOwner } from "@/lib/db/business";
import { getDefaultQr } from "@/lib/db/qr-code";

/**
 * GET /api/businesses/:slug/default-qr
 * Returns the source tag of the default QR code for a business.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;

    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "User does not own this business" },
        { status: 403 },
      );
    }

    const defaultQR = await getDefaultQr(slug);

    if (!defaultQR) {
      return NextResponse.json(
        { code: "NO_QR_CODES", message: "No QR codes found for this business" },
        { status: 404 },
      );
    }

    return NextResponse.json(defaultQR);
  } catch (error) {
    console.error("[GET_DEFAULT_QR_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch default QR" },
      { status: 500 },
    );
  }
});
