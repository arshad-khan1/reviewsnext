import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import {
  findBusinessBySlug,
  updateBusiness,
  deleteBusiness,
  isBusinessOwner,
} from "@/lib/db/business";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * GET /api/businesses/:slug
 * Fetches full details for a single business.
 */
export const GET = withAuth(
  async (req, payload, context: { params: Promise<{ slug: string }> }) => {
    try {
      const { slug } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      const business = await findBusinessBySlug(slug);
      if (!business) {
        return NextResponse.json(
          { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        business: {
          id: business.id,
          slug: business.slug,
          name: business.name,
          logoUrl: business.logoUrl,
          industry: business.industry,
          location: business.city,
          description: business.description,
          contactEmail: business.contactEmail,
          acceptedStarsThreshold: business.acceptedStarsThreshold,
          defaultGoogleMapsLink: business.defaultGoogleMapsLink,
          defaultAiPrompt: business.defaultAiPrompt,
          defaultCommentStyle: business.defaultCommentStyle,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt,
          subscription: business.owner.activeSubscription
            ? {
                plan: business.owner.activeSubscription.plan,
                status: business.owner.activeSubscription.status,
                currentPeriodEnd:
                  business.owner.activeSubscription.currentPeriodEnd,
              }
            : null,
          aiCredits: business.owner.aiCredits
            ? {
                monthlyAllocation: business.owner.aiCredits.monthlyAllocation,
                monthlyUsed: business.owner.aiCredits.monthlyUsed,
                topupAllocation: business.owner.aiCredits.topupAllocation,
                topupUsed: business.owner.aiCredits.topupUsed,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("[GET_BUSINESS_SLUG_ERROR]", error);
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to fetch business" },
        { status: 500 },
      );
    }
  },
);

const patchBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  logoUrl: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  contactEmail: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().email().nullable())
    .optional(),
  acceptedStarsThreshold: z.number().min(1).max(5).optional(),
  defaultGoogleMapsLink: z.string().url().nullable().optional(),
  defaultAiPrompt: z.string().nullable().optional(),
  defaultCommentStyle: z
    .enum([
      "PROFESSIONAL_POLITE",
      "FRIENDLY_CASUAL",
      "CONCISE_DIRECT",
      "ENTHUSIASTIC_WARM",
    ])
    .optional(),
});

/**
 * PATCH /api/businesses/:slug
 * Updates an existing business's settings.
 */
export const PATCH = withAuth(
  async (req, payload, context: { params: Promise<{ slug: string }> }) => {
    try {
      const { slug } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        const existing = await findBusinessBySlug(slug);
        if (!existing) {
          return NextResponse.json(
            { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
            { status: 404 },
          );
        }
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      const contentType = req.headers.get("content-type") || "";
      let updateData: any = {};

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          if (key !== "logo") {
            // Handle numeric fields
            if (key === "acceptedStarsThreshold") {
              updateData[key] = Number(value);
            } else {
              updateData[key] = value;
            }
          }
        }

        // Handle logo upload
        const logoFile = formData.get("logo") as File | null;
        if (logoFile && typeof logoFile === "object" && logoFile.size > 0) {
          const arrayBuffer = await logoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = logoFile.type || "image/png";

          const base64Data = `data:${mimeType};base64,${buffer.toString(
            "base64",
          )}`;

          const uploadResult = await uploadToCloudinary(
            base64Data,
            "business_logo",
            slug,
          );
          updateData.logoUrl = uploadResult.secure_url;
        }
      } else {
        updateData = await req.json();
      }

      const result = patchBusinessSchema.safeParse(updateData);

      if (!result.success) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "Invalid field values",
            errors: result.error.issues,
          },
          { status: 400 },
        );
      }

      const updatedBusiness = await updateBusiness(slug, result.data as any);

      return NextResponse.json({
        business: {
          id: updatedBusiness.id,
          slug: updatedBusiness.slug,
          name: updatedBusiness.name,
          logoUrl: updatedBusiness.logoUrl,
          updatedAt: updatedBusiness.updatedAt,
        },
      });
    } catch (error) {
      console.error("[PATCH_BUSINESS_SLUG_ERROR]", error);
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to update business" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/businesses/:slug
 * Permanently deletes a business and all associated data.
 */
export const DELETE = withAuth(
  async (req, payload, context: { params: Promise<{ slug: string }> }) => {
    try {
      const { slug } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        // Check if business exists to return 403 vs 404
        const existing = await findBusinessBySlug(slug);
        if (!existing) {
          return NextResponse.json(
            { code: "BUSINESS_NOT_FOUND", message: "Business not found" },
            { status: 404 },
          );
        }
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      await deleteBusiness(slug);

      return NextResponse.json({
        message: "Business deleted successfully.",
      });
    } catch (error) {
      console.error("[DELETE_BUSINESS_SLUG_ERROR]", error);
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to delete business" },
        { status: 500 },
      );
    }
  },
);
