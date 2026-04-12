import { prisma } from "../prisma";
import { PlanType } from "@prisma/client";

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

  const currentPlan = business.owner.activeSubscription?.plan || PlanType.STARTER;

  const planPriority: Record<PlanType, number> = {
    [PlanType.STARTER]: 0,
    [PlanType.GROWTH]: 1,
    [PlanType.PRO]: 2,
  };

  const hasPlan = planPriority[currentPlan] >= planPriority[requiredPlan];

  return {
    business,
    hasPlan,
    currentPlan,
    error: hasPlan ? null : "PLAN_REQUIRED",
  };
}
