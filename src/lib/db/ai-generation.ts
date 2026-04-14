import { prisma } from "../prisma";

/**
 * Checks if a business has credits remaining.
 */
export async function hasRemainingCredits(
  businessId: string,
): Promise<boolean> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) return false;

  const credits = await prisma.aiCredits.findUnique({
    where: { userId: business.ownerId },
  });

  if (!credits) return false;

  const totalAllocation = credits.monthlyAllocation + credits.topupAllocation;
  const totalUsed = credits.monthlyUsed + credits.topupUsed;

  return totalUsed < totalAllocation;
}

/**
 * Deducts one credit from a business.
 * Priority: Monthly allowance first, then Top-up bucket.
 */
export async function deductAiCredit(options: {
  businessId: string;
  qrCodeId: string;
  scanId: string;
  operation: string;
}) {
  const { businessId, qrCodeId, scanId, operation } = options;

  return await prisma.$transaction(async (tx) => {
    try {
      const business = await tx.business.findUnique({
        where: { id: businessId },
      });

      if (!business) throw new Error("BUSINESS_NOT_FOUND");

      // Row-level lock for safety during credit deduction
      await tx.$executeRaw`SELECT id FROM "AiCredits" WHERE "userId" = ${business.ownerId} FOR UPDATE`;

      const credits = await tx.aiCredits.findUnique({
        where: { userId: business.ownerId },
      });

      if (!credits) throw new Error("CREDITS_NOT_FOUND");

      const monthlyRemaining = credits.monthlyAllocation - credits.monthlyUsed;
      const topupRemaining = credits.topupAllocation - credits.topupUsed;

      const updateData: any = {};
      if (monthlyRemaining > 0) {
        updateData.monthlyUsed = { increment: 1 };
      } else if (topupRemaining > 0) {
        updateData.topupUsed = { increment: 1 };
      } else {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      // 1. Update Balance
      const updatedCredits = await tx.aiCredits.update({
        where: { id: credits.id },
        data: updateData,
      });

      // 2. Log Usage
      await tx.aiUsageLog.create({
        data: {
          aiCreditsId: credits.id,
          businessId: businessId, // Track which business used it
          creditsUsed: 1,
          operation,
          metadata: { qrCodeId, scanId } as any,
        },
      });

      return {
        creditsRemaining:
          updatedCredits.monthlyAllocation +
          updatedCredits.topupAllocation -
          (updatedCredits.monthlyUsed + updatedCredits.topupUsed),
      };
    } catch (error) {
      console.error("[DEDUCT_AI_CREDIT_ERROR]", error);
      throw error;
    }
  }, {
    timeout: 10000, // 10 seconds to handle transient latency/concurrency
  });
}

/**
 * Static review drafts for temporary use.
 */
export const STATIC_DRAFTS: Record<string, string[]> = {
  PROFESSIONAL_POLITE: [
    "I had a wonderful experience at {businessName}. The service was exemplary, and the attention to detail was truly impressive. I would highly recommend them to anyone seeking quality service.",
    "The team at {businessName} is highly professional and efficient. My visit was seamless from start to finish. Thank you for the excellent hospitality.",
  ],
  FRIENDLY_CASUAL: [
    "Had a great time at {businessName}! The vibe is amazing and the staff are super friendly. Definitely my new go-to spot in the city.",
    "Just visited {businessName} and loved it. Everything was perfect, and I'll definitely be coming back with friends soon!",
  ],
  CONCISE_DIRECT: [
    "Excellent experience at {businessName}. Great service and quality. Will visit again.",
    "Highly impressed with {businessName}. Professional staff and great results. Recommended.",
  ],
  ENTHUSIASTIC_WARM: [
    "OH MY GOSH! {businessName} was absolutely incredible! ❤️ The energy there is just fantastic and I felt so taken care of. You HAVE to try them out! ✨",
    "I am so happy with my visit to {businessName}! Everything exceeded my expectations and the staff are just the sweetest. Five stars all the way! 🌟🌟🌟🌟🌟",
  ],
};

export function getStaticDraft(businessName: string, style: string): string {
  const drafts = STATIC_DRAFTS[style] || STATIC_DRAFTS.FRIENDLY_CASUAL;
  const template = drafts[Math.floor(Math.random() * drafts.length)];
  return template.replace("{businessName}", businessName);
}
