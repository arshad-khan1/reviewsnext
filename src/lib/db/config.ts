import { prisma } from "../prisma";

/**
 * Resolves the effective configuration for a review funnel.
 * Priority: Specific QR Code Overrides > Business Defaults > System Defaults.
 */
export async function resolveReviewConfig(businessSlug: string, sourceTag?: string) {
  // 1. Fetch business and its defaults
  const business = await prisma.business.findUnique({
    where: { slug: businessSlug, isDeleted: false },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      acceptedStarsThreshold: true,
      defaultGoogleMapsLink: true,
      defaultAiPrompt: true,
      defaultCommentStyle: true,
      owner: {
        select: {
          activeSubscription: {
            select: {
              plan: true,
            },
          },
        },
      },
    },
  });

  if (!business) return null;

  let qrCode = null;

  // 2. Fetch specific QR code if sourceTag is provided
  if (sourceTag) {
    qrCode = await prisma.qRCode.findUnique({
      where: {
        businessId_sourceTag: {
          businessId: business.id,
          sourceTag: sourceTag,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        acceptedStarsThreshold: true,
        googleMapsLink: true,
        aiGuidingPrompt: true,
        commentStyle: true,
      },
    });
  }

  // 3. Resolve the config using precedence (QR > Business > System Default)
  return {
    businessId: business.id,
    businessName: business.name,
    logoUrl: business.logoUrl,
    qrCodeId: qrCode?.id || null,
    // Threshold defaults to 4 if not set anywhere
    threshold: qrCode?.acceptedStarsThreshold ?? business.acceptedStarsThreshold ?? 4,
    googleMapsLink: qrCode?.googleMapsLink ?? business.defaultGoogleMapsLink,
    aiPrompt: qrCode?.aiGuidingPrompt ?? business.defaultAiPrompt,
    commentStyle: qrCode?.commentStyle ?? business.defaultCommentStyle ?? "PROFESSIONAL_POLITE",
    planTier: business.owner?.activeSubscription?.plan || "STARTER",
  };
}
