export type BrandingConfig = {
  isBrandingEnabled?: boolean;
  primaryColor?: string;
  backgroundColor?: string;
  backgroundUrl?: string; // Banner/Hero image
  headline?: string;
  subheadline?: string;
  thankYouMessage?: string;
  overlayOpacity?: number;
  fontFamily?: string;
  buttonStyle?: "rounded" | "sharp" | "pill";
  canRemoveWatermark?: boolean;
};

export type EffectiveBranding = {
  isBrandingEnabled: boolean;
  primaryColor: string;
  backgroundColor: string;
  backgroundUrl: string | null;
  overlayOpacity: number;
  headline: string;
  subheadline: string;
  thankYouMessage: string;
  fontFamily: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  canRemoveWatermark: boolean;
  isGlassmorphismEnabled: boolean;
};
