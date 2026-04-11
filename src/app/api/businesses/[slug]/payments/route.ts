import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getPaymentHistory } from "@/lib/db/subscription";

export const GET = withAuth(async (req: NextRequest, { business, user }) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const history = await getPaymentHistory(business.slug, { limit, page });
    return NextResponse.json(history);
  } catch (error) {
    console.error("[Payments] History fetch error:", error);
    return NextResponse.json({ error: "HISTORY_FETCH_FAILED" }, { status: 500 });
  }
});
