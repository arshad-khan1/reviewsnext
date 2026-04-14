import { PlanType } from "@prisma/client";
import { BrandingConfig, EffectiveBranding } from "@/types/branding";

export const DEFAULT_BRANDING: EffectiveBranding = {
  primaryColor: "#6366f1", // Indigo-500
  backgroundColor: "#ffffff",
  backgroundUrl: null,
  overlayOpacity: 0.1,
  headline: "How was your experience with us?",
  subheadline: "Your feedback helps us improve and helps others discover us.",
  fontFamily: "Inter",
  buttonStyle: "rounded",
  canRemoveWatermark: false,
  isGlassmorphismEnabled: false,
};

export function resolveEffectiveBranding(
  plan: PlanType,
  config: BrandingConfig
): EffectiveBranding {
  const isGrowthOrAbove = plan === PlanType.GROWTH || plan === PlanType.PRO;
  const isPro = plan === PlanType.PRO;

  return {
    ...DEFAULT_BRANDING,
    // Colors & Fonts - Only for Growth+
    primaryColor: isGrowthOrAbove ? config.primaryColor || DEFAULT_BRANDING.primaryColor : DEFAULT_BRANDING.primaryColor,
    backgroundColor: isGrowthOrAbove ? config.backgroundColor || DEFAULT_BRANDING.backgroundColor : DEFAULT_BRANDING.backgroundColor,
    fontFamily: isGrowthOrAbove ? config.fontFamily || DEFAULT_BRANDING.fontFamily : DEFAULT_BRANDING.fontFamily,
    buttonStyle: isGrowthOrAbove ? config.buttonStyle || DEFAULT_BRANDING.buttonStyle : DEFAULT_BRANDING.buttonStyle,
    
    // Background Images - Only for Pro (or Growth if we decide so, but user said Pro for Glassmorphism)
    // User said: "predesigned templates... usable by only growth and pro users"
    // User said: "Glassmorphism for PRO users only"
    backgroundUrl: isGrowthOrAbove ? config.backgroundUrl || null : null,
    overlayOpacity: isPro ? config.overlayOpacity ?? 0.1 : 0,

    // Text - Custom text for Growth+
    headline: isGrowthOrAbove ? config.headline || DEFAULT_BRANDING.headline : DEFAULT_BRANDING.headline,
    subheadline: isGrowthOrAbove ? config.subheadline || DEFAULT_BRANDING.subheadline : DEFAULT_BRANDING.subheadline,

    // Permissions
    canRemoveWatermark: isGrowthOrAbove,
    isGlassmorphismEnabled: isPro,
  };
}
