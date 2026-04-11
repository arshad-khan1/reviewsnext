import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { isBusinessOwner } from "@/lib/db/business";
import { getReviews } from "@/lib/db/review";
import { ReviewType } from "@prisma/client";

/**
 * GET /api/businesses/:slug/reviews
 * Returns a paginated list of reviews for a business with filtering support.
 */
export const GET = withAuth(async (req, payload, context: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await context.params;
    
    const owner = await isBusinessOwner(payload.sub, slug);
    if (!owner) {
      return NextResponse.json({ code: "FORBIDDEN", message: "User does not own this business" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    
    const type = searchParams.get("type") as ReviewType || undefined;
    const ratingStr = searchParams.get("rating");
    const rating = ratingStr ? parseInt(ratingStr) : undefined;
    const qrCodeId = searchParams.get("qrCodeId") || undefined;
    const search = searchParams.get("search") || undefined;
    
    const subToGoogleStr = searchParams.get("submittedToGoogle");
    const submittedToGoogle = subToGoogleStr === "true" ? true : subToGoogleStr === "false" ? false : undefined;

    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

    const result = await getReviews(slug, page, limit, {
      type,
      rating,
      qrCodeId,
      search,
      submittedToGoogle,
      from,
      to,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("[GET_REVIEWS_ERROR]", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch reviews" }, { status: 500 });
  }
});
