import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth/guard";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { generateUniqueSlug } from "@/lib/db/business";
import { updateUserProfile } from "@/lib/db/user";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-handler";

const COMMENT_STYLE_MAP: Record<string, string> = {
  "Professional & Polite": "PROFESSIONAL_POLITE",
  "Friendly & Casual": "FRIENDLY_CASUAL",
  "Concise & Direct": "CONCISE_DIRECT",
  "Enthusiastic & Warm": "ENTHUSIASTIC_WARM",
};

const onboardingSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  acceptedStarsThreshold: z.coerce
    .number()
    .min(1)
    .max(5)
    .default(4),
  defaultGoogleMapsLink: z.string().url("Invalid Google Maps URL"),
  defaultAiPrompt: z.string().min(1, "AI prompt is required"),
  defaultCommentStyle: z
    .enum([
      "PROFESSIONAL_POLITE",
      "FRIENDLY_CASUAL",
      "CONCISE_DIRECT",
      "ENTHUSIASTIC_WARM",
    ])
    .default("PROFESSIONAL_POLITE"),
});

/**
 * POST /api/onboarding
 * Completes the onboarding flow for the authenticated user:
 * 1. Updates the user's name (ownerName)
 * 2. Creates the business with location, industry, logo
 * 3. Creates a default QR code named "Reception"
 */
export const POST = withAuth(async (req, payload) => {
  try {
    const formData = await req.formData();

    // Extract all text fields except logo
    const body: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "logo") {
        body[key] = value;
      }
    }

    // Map the display comment style to enum if needed
    if (body.defaultCommentStyle && COMMENT_STYLE_MAP[body.defaultCommentStyle]) {
      body.defaultCommentStyle = COMMENT_STYLE_MAP[body.defaultCommentStyle];
    }

    // Validate
    const result = onboardingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          errors: result.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      industry,
      location,
      ownerName,
      acceptedStarsThreshold,
      defaultGoogleMapsLink,
      defaultAiPrompt,
      defaultCommentStyle,
    } = result.data;

    // 1. Update user's name
    await updateUserProfile(payload.sub, { name: ownerName });

    // 2. Generate a unique slug for the business
    const slug = await generateUniqueSlug(name);

    // 3. Upload logo to Cloudinary
    const logoFile = formData.get("logo");
    let logoUrl: string | undefined;

    if (logoFile && typeof logoFile === "object" && "size" in logoFile) {
      const file = logoFile as unknown as { size: number; type: string; arrayBuffer: () => Promise<ArrayBuffer> };
      
      // Enforce 3MB limit
      const MAX_SIZE = 3 * 1024 * 1024; // 3MB
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            code: "FILE_TOO_LARGE",
            message: "Logo file size must be less than 3MB",
          },
          { status: 400 }
        );
      }

      if (file.size > 0) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = file.type || "image/png";
          const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

          const uploadResult = await uploadToCloudinary(
            base64Data,
            "business_logo",
            slug
          );
          logoUrl = uploadResult.secure_url;
        } catch (uploadError: any) {
          console.error("[LOGO_UPLOAD_ERROR]", uploadError);
          return NextResponse.json(
            { 
              code: "UPLOAD_ERROR", 
              message: "Failed to upload logo. Please try a different image or skip for now." 
            },
            { status: 500 }
          );
        }
      }
    }

    // 4. Check for existing subscription for this user
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId: payload.sub }
    });

    // 5. Create the business + default QR code in a single transaction
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        industry,
        city: location,
        logoUrl,
        acceptedStarsThreshold,
        defaultGoogleMapsLink,
        defaultAiPrompt,
        defaultCommentStyle: defaultCommentStyle as any,
        status: "ACTIVE",
        ownerId: payload.sub,
        qrCodes: {
          create: {
            name: "Reception",
            sourceTag: "reception",
            isDefault: true,
            isActive: true,
            googleMapsLink: null,
            aiGuidingPrompt: null,
            commentStyle: null,
            acceptedStarsThreshold: null,
          },
        },
      },
      include: {
        qrCodes: { where: { isDefault: true } },
      },
    });

    // 5.5 Ensure User has AiCredits record
    await prisma.aiCredits.upsert({
      where: { userId: payload.sub },
      create: {
        userId: payload.sub,
        monthlyAllocation: 0,
        monthlyUsed: 0,
        topupAllocation: 10, // Initial trial credits
        topupUsed: 0,
      },
      update: {}, // Keep existing credits if already present
    });

    let isNewSubscription = false;
    if (!existingSubscription) {
      await prisma.userSubscription.create({
        data: {
          userId: payload.sub,
          plan: "FREE",
          status: "TRIALING",
          trialStartsAt: new Date(),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        }
      });
      isNewSubscription = true;
    }

    return NextResponse.json(
      {
        message: "Onboarding complete",
        business: {
          id: business.id,
          slug: business.slug,
          name: business.name,
          industry: business.industry,
          location: business.city,
          logoUrl: business.logoUrl,
        },
        redirectTo: `/${business.slug}/dashboard${isNewSubscription ? "?welcome=1" : ""}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST_ONBOARDING_ERROR]", error);

    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      return NextResponse.json(
        {
          code: "SLUG_CONFLICT",
          message: "A business with that name already exists. Please try a different name.",
        },
        { status: 409 }
      );
    }

    return handleApiError(error, "POST_ONBOARDING");
  }
});
