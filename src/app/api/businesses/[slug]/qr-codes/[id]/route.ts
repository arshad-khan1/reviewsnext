import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import { isBusinessOwner } from "@/lib/db/business";
import { getQRCodeDetails, updateQRCode, deleteQRCode } from "@/lib/db/qr-code";
import { prisma } from "@/lib/prisma";

const patchQRCodeSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  googleMapsLink: z.string().url().optional().nullable(),
  aiGuidingPrompt: z.string().optional().nullable(),
  commentStyle: z
    .enum([
      "PROFESSIONAL_POLITE",
      "FRIENDLY_CASUAL",
      "CONCISE_DIRECT",
      "ENTHUSIASTIC_WARM",
    ])
    .optional()
    .nullable(),
  acceptedStarsThreshold: z.number().min(1).max(5).optional().nullable(),
  useDefaultConfig: z.boolean().optional(),
  locationId: z.string().optional().nullable(),
});

/**
 * GET /api/businesses/:slug/qr-codes/:id
 * Returns details for a single QR code including its analytics summary.
 */
export const GET = withAuth(
  async (
    req,
    payload,
    context: { params: Promise<{ slug: string; id: string }> },
  ) => {
    try {
      const { slug, id } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      const qrCode = await getQRCodeDetails(id, slug);
      if (!qrCode) {
        return NextResponse.json(
          { code: "QR_NOT_FOUND", message: "QR code not found" },
          { status: 404 },
        );
      }

      const origin = req.nextUrl.origin;
      return NextResponse.json({
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          sourceTag: qrCode.sourceTag,
          isActive: qrCode.isActive,
          googleMapsLink: qrCode.googleMapsLink,
          aiGuidingPrompt: qrCode.aiGuidingPrompt,
          commentStyle: qrCode.commentStyle,
          acceptedStarsThreshold: qrCode.acceptedStarsThreshold,
          useDefaultConfig: qrCode.useDefaultConfig,
          locationId: qrCode.locationId,
          createdAt: qrCode.createdAt,
          reviewUrl: `${origin}/${slug}/review?source=${qrCode.sourceTag}`,
          stats: qrCode.stats,
        },
      });
    } catch (error) {
      console.error("[GET_QR_CODE_ID_ERROR]", error);
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to fetch QR code details" },
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/businesses/:slug/qr-codes/:id
 * Updates a QR code's settings.
 */
export const PATCH = withAuth(
  async (
    req,
    payload,
    context: { params: Promise<{ slug: string; id: string }> },
  ) => {
    try {
      const { slug, id } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const validated = patchQRCodeSchema.safeParse(body);

      if (!validated.success) {
        return NextResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "Invalid field values",
            errors: validated.error.issues,
          },
          { status: 400 },
        );
      }

      const updated = await updateQRCode(id, slug, validated.data as any);

      return NextResponse.json({
        qrCode: {
          id: updated.id,
          name: updated.name,
          isActive: updated.isActive,
          acceptedStarsThreshold: updated.acceptedStarsThreshold,
          useDefaultConfig: updated.useDefaultConfig,
          locationId: updated.locationId,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error: any) {
      console.error("[PATCH_QR_CODE_ERROR]", error);
      if (error.message === "QR_NOT_FOUND") {
        return NextResponse.json(
          { code: "QR_NOT_FOUND", message: "QR code not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to update QR code" },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/businesses/:slug/qr-codes/:id
 * Soft deletes a QR code.
 */
export const DELETE = withAuth(
  async (
    req,
    payload,
    context: { params: Promise<{ slug: string; id: string }> },
  ) => {
    try {
      const { slug, id } = await context.params;

      const owner = await isBusinessOwner(payload.sub, slug);
      if (!owner) {
        return NextResponse.json(
          { code: "FORBIDDEN", message: "User does not own this business" },
          { status: 403 },
        );
      }

      // Prevent deletion of default QR code
      const qr = await prisma.qRCode.findFirst({
        where: { id, business: { slug }, isDeleted: false },
        select: { isDefault: true },
      });
      if (qr?.isDefault) {
        return NextResponse.json(
          { code: "CANNOT_DELETE_DEFAULT", message: "The default QR code cannot be deleted" },
          { status: 403 },
        );
      }

      await deleteQRCode(id, slug);

      return NextResponse.json({
        message: "QR code deleted successfully.",
      });
    } catch (error: any) {
      console.error("[DELETE_QR_CODE_ERROR]", error);
      if (error.message === "QR_NOT_FOUND") {
        return NextResponse.json(
          { code: "QR_NOT_FOUND", message: "QR code not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "Failed to delete QR code" },
        { status: 500 },
      );
    }
  },
);
