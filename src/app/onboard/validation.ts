import { z } from "zod";

export const COMMENT_STYLE_LABELS = [
  "Professional & Polite",
  "Friendly & Casual",
  "Concise & Direct",
  "Enthusiastic & Warm",
] as const;

export const COMMENT_STYLE_ENUM_MAP: Record<string, string> = {
  "Professional & Polite": "PROFESSIONAL_POLITE",
  "Friendly & Casual": "FRIENDLY_CASUAL",
  "Concise & Direct": "CONCISE_DIRECT",
  "Enthusiastic & Warm": "ENTHUSIASTIC_WARM",
};

export const step1Schema = z.object({
  name: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  ownerName: z.string().min(1, "Your name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(1, "Location is required"),
  logo: z.any().optional(),
});

export const step2Schema = z.object({
  minRatingToExternal: z.string().regex(/^[1-5]$/, "Invalid rating threshold"),
});

export const step3Schema = z.object({
  googleMapsUrl: z.string().url("Please enter a valid Google Maps URL"),
  aiPrompt: z.string().min(1, "AI prompt is required"),
  commentStyle: z.string().min(1, "Comment style is required"),
});
