import { prisma } from "../prisma";
import { PlanType } from "@prisma/client";
import { PLAN_LIMITS, PlanFeatures, hasFeature } from "../../config/plan-limits";

/**
 * Checks if a business has the required plan or better.
 * Plan priority: PRO > GROWTH > STARTER
 */
export async function checkBusinessPlan(businessSlug: string, requiredPlan: PlanType) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: { 
      owner: {
        include: { activeSubscription: true }
      }
    },
  });

  if (!business) return { business: null, hasPlan: false, error: "BUSINESS_NOT_FOUND" };

  const subscription = business.owner.activeSubscription;
  const currentPlan = subscription?.plan || PlanType.FREE;
  const currentStatus = subscription?.status;

  const planPriority: Record<PlanType, number> = {
    [PlanType.FREE]: 0,
    [PlanType.STARTER]: 1,
    [PlanType.GROWTH]: 2,
    [PlanType.PRO]: 3,
  };

  const hasPlan = planPriority[currentPlan] >= planPriority[requiredPlan];

  return {
    business,
    hasPlan,
    currentPlan,
    currentStatus,
    error: hasPlan ? null : "PLAN_REQUIRED",
  };
}

/**
 * Gets the consolidated features and limits for a business's plan
 */
export async function getBusinessPlanFeatures(businessSlug: string) {
  const business = await prisma.business.findFirst({
    where: { slug: businessSlug, isDeleted: false },
    include: { 
      owner: {
        include: { activeSubscription: true }
      }
    },
  });

  if (!business) return null;

  const subscription = business.owner.activeSubscription;
  const currentPlan = subscription?.plan || PlanType.FREE;
  const currentStatus = subscription?.status;

  return {
    business,
    features: PLAN_LIMITS[currentPlan],
    plan: currentPlan,
    status: currentStatus,
  };
}

/**
 * Checks if a business is within its plan limits for a specific feature
 */
export async function checkPlanLimit(businessSlug: string, limitKey: keyof PlanFeatures) {
  const data = await getBusinessPlanFeatures(businessSlug);
  if (!data) return { allowed: false, error: "BUSINESS_NOT_FOUND" };

  const limit = data.features[limitKey];
  if (typeof limit === "boolean") {
    // Check if feature is allowed based on plan AND status (trial handling)
    const allowed = hasFeature(data.plan, data.status, limitKey as any);
    return { allowed, error: allowed ? null : "FEATURE_LOCKED" };
  }

  // Handle numeric limits
  if (limitKey === "maxQrCodesTotal") {
    const count = await prisma.qRCode.count({
      where: { business: { slug: businessSlug }, isDeleted: false }
    });
    const allowed = count < limit;
    return { allowed, current: count, limit, error: allowed ? null : "LIMIT_REACHED" };
  }

  if (limitKey === "maxLocations") {
    const count = await prisma.location.count({
      where: { business: { slug: businessSlug }, isDeleted: false }
    });
    const allowed = count < limit;
    return { allowed, current: count, limit, error: allowed ? null : "LIMIT_REACHED" };
  }

  return { allowed: true, error: null };
}
