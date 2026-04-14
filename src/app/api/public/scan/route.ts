import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createScan } from "@/lib/db/scan";
import { handleApiError } from "@/lib/error-handler";
import { getDefaultQr } from "@/lib/db/qr-code";

const scanSchema = z.object({
  businessSlug: z.string().min(1, "Business slug is required"),
  sourceTag: z.string().min(1, "Source tag is required"),
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

/**
 * POST /api/public/scan
 * Records a QR code scan event.
 * Returns QR and Business info for rendering the review page.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sourceTag || body.sourceTag === "direct") {
      const defaultQrCode = await getDefaultQr(body.businessSlug);
      if (!defaultQrCode) {
        throw new Error("QR_NOT_FOUND");
      }
      body.sourceTag = defaultQrCode.sourceTag;
    }

    console.log("body", body);
    const result = scanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid scan data",
          errors: result.error.issues,
        },
        { status: 400 },
      );
    }

    const { businessSlug, sourceTag, device, browser, os } = result.data;
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";

    const scanData = await createScan({
      businessSlug,
      sourceTag,
      device,
      browser,
      os,
      ipAddress,
    });

    return NextResponse.json(scanData, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "QR_NOT_FOUND") {
      return NextResponse.json(
        { code: "QR_NOT_FOUND", message: "QR Code not found" },
        { status: 404 },
      );
    }
    return handleApiError(error, "POST_PUBLIC_SCAN");
  }
}
