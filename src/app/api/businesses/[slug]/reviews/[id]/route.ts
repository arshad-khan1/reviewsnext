import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { isBusinessOwner } from "@/lib/db/business";
import { getReviewDetails } from "@/lib/db/review";

/**
 * GET /api/businesses/:slug/reviews/:id
 * Fetches a single review by ID with scan context.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string, id: string }> }) => {
  try {
    const { slug, id } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const review = await getReviewDetails(id, slug);

    if (!review) {
      return NextResponse.json({ code: "REVIEW_NOT_FOUND", message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });

  } catch (error) {
    console.error("[GET_REVIEW_ID_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch review details" }, { status: 500 });
  }
});
