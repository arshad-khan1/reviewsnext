import { PlanType, SubscriptionStatus } from "@/types/prisma-enums";

export interface PlanFeatures {
  displayName: string;
  maxLocations: number;
  maxQrCodesTotal: number;
  monthlyAiCredits: number;
  canCustomBranding: boolean;
  canRemoveWatermark: boolean;
  canCustomAiPrompts: boolean;
  canAdvancedAnalytics: boolean;
  canMultiUser: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanFeatures> = {
  [PlanType.FREE]: {
    displayName: "Free",
    maxLocations: 0,
    maxQrCodesTotal: 1,
    monthlyAiCredits: 100,
    canCustomBranding: false,
    canRemoveWatermark: false,
    canCustomAiPrompts: false,
    canAdvancedAnalytics: false,
    canMultiUser: false,
  },
  [PlanType.STARTER]: {
    displayName: "Starter",
    maxLocations: 0,
    maxQrCodesTotal: 1,
    monthlyAiCredits: 300,
    canCustomBranding: false,
    canRemoveWatermark: false,
    canCustomAiPrompts: false,
    canAdvancedAnalytics: false,
    canMultiUser: false,
  },
  [PlanType.GROWTH]: {
    displayName: "Growth",
    maxLocations: 0,
    maxQrCodesTotal: 10,
    monthlyAiCredits: 1000,
    canCustomBranding: true,
    canRemoveWatermark: true,
    canCustomAiPrompts: true,
    canAdvancedAnalytics: true,
    canMultiUser: false,
  },
  [PlanType.PRO]: {
    displayName: "Pro",
    maxLocations: 100, // Effectively unlimited
    maxQrCodesTotal: 1000,
    monthlyAiCredits: 10000,
    canCustomBranding: true,
    canRemoveWatermark: true,
    canCustomAiPrompts: true,
    canAdvancedAnalytics: true,
    canMultiUser: true,
  },
};

/**
 * Helper to check if a plan has a specific boolean feature
 */
export function hasFeature(
  plan: PlanType,
  status: SubscriptionStatus | undefined,
  feature: keyof PlanFeatures,
): boolean {
  // Global Trial Rule: Trial users do not have access to advanced analytics
  if (status === SubscriptionStatus.TRIALING && feature === "canAdvancedAnalytics") {
    return false;
  }

  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  return typeof value === "boolean" ? value : false;
}

/**
 * Helper to get a numeric limit for a plan
 */
export function getLimit(
  plan: PlanType,
  status: SubscriptionStatus | undefined,
  limit: keyof PlanFeatures,
): number {
  const limits = PLAN_LIMITS[plan];
  const value = limits[limit];
  return typeof value === "number" ? value : 0;
}
