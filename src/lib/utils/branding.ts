import { PlanType } from "@prisma/client";
import { BrandingConfig, EffectiveBranding } from "@/types/branding";

export const DEFAULT_BRANDING: EffectiveBranding = {
  isBrandingEnabled: false,
  primaryColor: "#6366f1", // Indigo-500
  backgroundColor: "#ffffff",
  backgroundUrl: null,
  overlayOpacity: 0.1,
  headline: "How was your experience with us?",
  subheadline: "Your feedback helps us improve and helps others discover us.",
  thankYouMessage: "Your honesty helps us build a better experience for everyone. We truly appreciate it!",
  fontFamily: "var(--font-urbanist)",
  buttonStyle: "rounded",
  canRemoveWatermark: false,
  isGlassmorphismEnabled: false,
};

export function resolveEffectiveBranding(
  plan: PlanType,
  config: BrandingConfig,
): EffectiveBranding {
  const isGrowthOrAbove = plan === PlanType.GROWTH || plan === PlanType.PRO;
  const isPro = plan === PlanType.PRO;
  const isBrandingEnabled = isGrowthOrAbove && config.isBrandingEnabled === true;

  if (!isBrandingEnabled) {
    return {
      ...DEFAULT_BRANDING,
      isBrandingEnabled: false,
    };
  }

  return {
    ...DEFAULT_BRANDING,
    isBrandingEnabled: true,
    // Colors & Fonts - Growth+
    primaryColor: config.primaryColor || DEFAULT_BRANDING.primaryColor,
    backgroundColor: config.backgroundColor || DEFAULT_BRANDING.backgroundColor,
    fontFamily: config.fontFamily || DEFAULT_BRANDING.fontFamily,
    buttonStyle: config.buttonStyle || DEFAULT_BRANDING.buttonStyle,

    // Background Images - Growth+
    backgroundUrl: config.backgroundUrl || null,
    overlayOpacity: config.overlayOpacity ?? DEFAULT_BRANDING.overlayOpacity,

    // Text - Growth+
    headline: config.headline || DEFAULT_BRANDING.headline,
    subheadline: config.subheadline || DEFAULT_BRANDING.subheadline,
    thankYouMessage: config.thankYouMessage || DEFAULT_BRANDING.thankYouMessage,

    // Permissions - Primarily Pro
    canRemoveWatermark: isPro && (config.canRemoveWatermark ?? false),
    isGlassmorphismEnabled: isPro,
  };
}
