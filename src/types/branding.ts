export type BrandingConfig = {
  primaryColor?: string;
  backgroundColor?: string;
  backgroundUrl?: string;
  templateId?: string;
  headline?: string;
  subheadline?: string;
  thankYouMessage?: string;
  overlayOpacity?: number;
  fontFamily?: string;
  buttonStyle?: "rounded" | "sharp" | "pill";
};

export type EffectiveBranding = {
  primaryColor: string;
  backgroundColor: string;
  backgroundUrl: string | null;
  overlayOpacity: number;
  headline: string;
  subheadline: string;
  fontFamily: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  canRemoveWatermark: boolean;
  isGlassmorphismEnabled: boolean;
};
