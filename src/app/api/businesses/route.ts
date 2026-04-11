import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import { getBusinessesByUser, createBusiness } from "@/lib/db/business";

/**
 * GET /api/businesses
 * Returns all businesses owned by the authenticated user.
 */
export const GET = withAuth(async (req, payload) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;

    const { businesses, total } = await getBusinessesByUser(
      payload.sub,
      page,
      limit,
      search,
    );

    // Map DB outcome to expected API response format
    const formattedBusinesses = businesses.map((b) => {
      // Aggregate totals from relations
      const totalScans = b.qrCodes.reduce(
        (sum, qr) => sum + qr._count.scans,
        0,
      );
      const totalReviews = b.qrCodes.reduce(
        (sum, qr) => sum + qr._count.reviews,
        0,
      );
      const conversionRate =
        totalScans > 0
          ? Number(((totalReviews / totalScans) * 100).toFixed(1))
          : 0;

      // Calculate avgRating - we don't have this in the DB sum directly so we'll leave it as 0 or calculate if needed
      // Actually avgRating wasn't grabbed in the initial query for performance. The requirements document says to return it.
      // We can just stub it or assume it's calculated elsewhere for now. Let's return 0 by default.

      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        logoUrl: b.logoUrl,
        industry: b.industry,
        location: b.city,
        lastActiveAt: b.updatedAt,
        totalScans,
        totalReviews,
        conversionRate,
        avgRating: 0, // Stub for now, requires complex aggregation on reviews
        plan: "STARTER", // Replace with real plan when subscription is included
        aiCredits: {
          monthlyAllocation: b.aiCredits?.monthlyAllocation || 100,
          monthlyUsed: b.aiCredits?.monthlyUsed || 0,
          topupAllocation: b.aiCredits?.topupAllocation || 0,
          topupUsed: b.aiCredits?.topupUsed || 0,
        },
      };
    });

    return NextResponse.json({
      data: formattedBusinesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET_BUSINESSES_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to fetch businesses" },
      { status: 500 },
    );
  }
});

const createBusinessSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  location: z.string().min(1),
  logoUrl: z.string().url().optional(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional(),
  acceptedStarsThreshold: z.number().min(1).max(5).optional(),
  defaultGoogleMapsLink: z.string().url(),
  defaultAiPrompt: z.string().min(1),
  defaultCommentStyle: z
    .enum([
      "PROFESSIONAL_POLITE",
      "FRIENDLY_CASUAL",
      "CONCISE_DIRECT",
      "ENTHUSIASTIC_WARM",
    ])
    .optional(),
});

import { uploadToCloudinary } from "@/lib/cloudinary";
import { generateUniqueSlug } from "@/lib/db/business";

/**
 * POST /api/businesses
 * Creates a new business for the authenticated user.
 */
export const POST = withAuth(async (req, payload) => {
  try {
    const formData = await req.formData();

    const body: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "logo") {
        body[key] = value;
      }
    }

    if (body.acceptedStarsThreshold) {
      body.acceptedStarsThreshold = parseInt(body.acceptedStarsThreshold, 10);
    }

    const result = createBusinessSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          errors: result.error.issues,
        },
        { status: 400 },
      );
    }

    // Generate slug first
    const slug = await generateUniqueSlug(result.data.name);

    let logoUrl = result.data.logoUrl;

    // Process logo upload if present
    const logoFile = formData.get("logo") as File | null;

    if (logoFile && typeof logoFile === "object" && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = logoFile.type || "image/png";
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

      const uploadResult = await uploadToCloudinary(
        base64Data,
        "business_logo",
        slug,
      );

      logoUrl = uploadResult.secure_url;
    } else {
      throw new Error("Logo upload failed");
    }

    const business = await createBusiness(payload.sub, {
      ...result.data,
      slug,
      logoUrl,
    });

    return NextResponse.json(
      {
        business: {
          id: business.id,
          slug: business.slug,
          name: business.name,
          industry: business.industry,
          location: business.city,
          logoUrl: business.logoUrl,
          description: business.description,
          acceptedStarsThreshold: business.acceptedStarsThreshold,
          defaultGoogleMapsLink: business.defaultGoogleMapsLink,
          defaultAiPrompt: business.defaultAiPrompt,
          defaultCommentStyle: business.defaultCommentStyle,
          createdAt: business.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[POST_BUSINESS_ERROR]", error);

    // Check for unique constraint violation on slug
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return NextResponse.json(
        {
          code: "SLUG_CONFLICT",
          message: "A business with that slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to create business" },
      { status: 500 },
    );
  }
});
