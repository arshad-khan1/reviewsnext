import { cache } from "react";
import { prisma } from "../prisma";

/**
 * Resolves the effective configuration for a review funnel.
 * Priority: Specific QR Code Overrides > Business Defaults > System Defaults.
 */
export const resolveReviewConfig = cache(async (businessSlug: string, sourceTag?: string) => {
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
      brandingConfig: true,
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
        useDefaultConfig: true,
        acceptedStarsThreshold: true,
        googleMapsLink: true,
        aiGuidingPrompt: true,
        commentStyle: true,
        brandingOverride: true,
      },
    });
  }

  // 3. Resolve the config using strict precedence rules
  const useDefaults = qrCode?.useDefaultConfig ?? true;

  return {
    businessId: business.id,
    businessName: business.name,
    logoUrl: business.logoUrl,
    qrCodeId: qrCode?.id || null,
    // If useDefaultConfig is true, take business defaults. Otherwise QR value > Business value.
    threshold: useDefaults 
      ? (business.acceptedStarsThreshold ?? 4) 
      : (qrCode?.acceptedStarsThreshold ?? business.acceptedStarsThreshold ?? 4),
    googleMapsLink: useDefaults 
      ? business.defaultGoogleMapsLink 
      : (qrCode?.googleMapsLink ?? business.defaultGoogleMapsLink),
    aiGuidingPrompt: useDefaults 
      ? business.defaultAiPrompt 
      : (qrCode?.aiGuidingPrompt ?? business.defaultAiPrompt),
    commentStyle: useDefaults 
      ? business.defaultCommentStyle 
      : (qrCode?.commentStyle ?? business.defaultCommentStyle ?? "PROFESSIONAL_POLITE"),
    planTier: business.owner?.activeSubscription?.plan || "STARTER",
    branding: (qrCode?.brandingOverride || business.brandingConfig || {}) as any,
    sourceTag: sourceTag || null,
  };
});
