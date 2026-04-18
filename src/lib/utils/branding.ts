import { PlanType } from "@/types/prisma-enums";
import { BrandingConfig, EffectiveBranding } from "@/types/branding";

export const DEFAULT_BRANDING: EffectiveBranding = {
  isBrandingEnabled: false,
  primaryColor: "#6366f1", // Indigo-500
  backgroundColor: "#ffffff",
  backgroundUrl: null,
  overlayOpacity: 0.1,
  headline: "How was your experience with us?",
  subheadline: "Your feedback helps us improve and helps others discover us.",
  thankYouMessage:
    "Your honesty helps us build a better experience for everyone. We truly appreciate it!",
  fontFamily: "var(--font-urbanist)",
  buttonStyle: "rounded",
  canRemoveWatermark: false,
  isGlassmorphismEnabled: false,
  starHeadlines: {
    1: "We're deeply sorry for your experience.",
    2: "We regret that we missed the mark.",
    3: "We're striving for better.",
    4: "We're so glad you enjoyed it!",
    5: "Excellent! We're thrilled!",
  },
  starSubheadlines: {
    1: "Making you comfortable is our priority. We truly regret the inconvenience caused.",
    2: "Making you comfortable is our priority. We truly regret the inconvenience caused.",
    3: "Your feedback helps us close the gap to excellence.",
    4: "Your support helps others discover our business!",
    5: "Your support helps others discover our business!",
  },
};

export function resolveEffectiveBranding(
  plan: PlanType,
  config: BrandingConfig,
): EffectiveBranding {
  const isGrowthOrAbove = plan === PlanType.GROWTH || plan === PlanType.PRO;
  const isPro = plan === PlanType.PRO;
  const isBrandingEnabled =
    isGrowthOrAbove && config.isBrandingEnabled === true;

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

    // Background Images - PRO Only
    backgroundUrl: isPro ? config.backgroundUrl || null : null,
    overlayOpacity: isPro
      ? (config.overlayOpacity ?? DEFAULT_BRANDING.overlayOpacity)
      : DEFAULT_BRANDING.overlayOpacity,

    // Text - Growth+
    headline: config.headline || DEFAULT_BRANDING.headline,
    subheadline: config.subheadline || DEFAULT_BRANDING.subheadline,
    thankYouMessage: config.thankYouMessage || DEFAULT_BRANDING.thankYouMessage,

    // Star Specific Messaging
    starHeadlines: {
      ...DEFAULT_BRANDING.starHeadlines,
      ...config.starHeadlines,
    },
    starSubheadlines: {
      ...DEFAULT_BRANDING.starSubheadlines,
      ...config.starSubheadlines,
    },

    // Permissions - Primarily Pro
    canRemoveWatermark: isPro && (config.canRemoveWatermark ?? false),
    isGlassmorphismEnabled: isPro,
  };
}
