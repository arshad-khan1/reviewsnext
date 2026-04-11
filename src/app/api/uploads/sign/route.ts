import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { generateSignedUploadParams, UploadType } from "@/lib/cloudinary";
import { isBusinessOwner } from "@/lib/db/business";

/**
 * GET /api/uploads/sign
 * Generates a signed upload signature for Cloudinary direct uploads.
 */
export const GET = withAuth(async (req, payload) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as UploadType;
  const businessSlug = searchParams.get("businessSlug");

  // 1. Validation
  if (!type || !["business_logo", "business_banner", "avatar"].includes(type)) {
    return NextResponse.json(
      { code: "INVALID_TYPE", message: "Upload type is invalid or missing" },
      { status: 400 }
    );
  }

  // 2. Business Ownership Check
  if (["business_logo", "business_banner"].includes(type)) {
    if (!businessSlug) {
      return NextResponse.json(
        { code: "BUSINESS_SLUG_REQUIRED", message: "businessSlug is required for this upload type" },
        { status: 400 }
      );
    }

    const isOwner = await isBusinessOwner(payload.sub, businessSlug);
    if (!isOwner) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "You do not have permission to upload for this business" },
        { status: 403 }
      );
    }
  }

  // 3. Generate Signature
  // For avatars, we use the userId as the identifier
  const identifier = type === "avatar" ? payload.sub : businessSlug!;
  
  try {
    const signedParams = generateSignedUploadParams(type, identifier);
    return NextResponse.json(signedParams);
  } catch (error) {
    console.error("[UPLOADS_SIGN]", error);
    return NextResponse.json(
      { code: "SIGNING_ERROR", message: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
});
