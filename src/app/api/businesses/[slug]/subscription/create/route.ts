import { NextResponse } from "next/server";

/**
 * DEPRECATED: This route has been replaced by the new one-time payment flow.
 * Use POST /api/payments/create-order instead.
 */
export async function POST() {
  return NextResponse.json(
    {
      code: "DEPRECATED",
      message:
        "This endpoint is deprecated. Use POST /api/payments/create-order instead.",
    },
    { status: 410 },
  );
}
