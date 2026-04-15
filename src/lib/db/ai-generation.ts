import { prisma } from "../prisma";
import { openai, OPENAI_MODEL } from "../openai";

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
          businessId: businessId,
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
    timeout: 10000,
  });
}

// ---------------------------------------------------------------------------
// Comment style → tone description mapping for building system prompts
// ---------------------------------------------------------------------------
const STYLE_TONE_MAP: Record<string, string> = {
  PROFESSIONAL_POLITE:
    "formal, respectful, and polished — as if written by a business professional",
  FRIENDLY_CASUAL:
    "warm, conversational, and relaxed — as if written by a happy regular customer",
  CONCISE_DIRECT:
    "brief, factual, and straight to the point — no fluff or filler",
  ENTHUSIASTIC_WARM:
    "very enthusiastic, full of positive energy, with relevant emoji sprinkled naturally",
  WITTY_FUN:
    "clever, playful, and lightly humorous — without being sarcastic",
  HINGLISH:
    "a natural mix of Hindi and English (Hinglish) as spoken in Indian urban areas",
};

// ---------------------------------------------------------------------------
// Rating → sentiment guidance so the AI knows how glowing to be
// ---------------------------------------------------------------------------
function ratingGuidance(rating: number): string {
  if (rating === 5) return "The customer gave 5 stars — the review must feel genuinely thrilled and highly positive.";
  if (rating === 4) return "The customer gave 4 stars — the review should be very positive with a subtle mention that things were great, nearing perfection.";
  return "The customer gave 3 stars — the review should be overall positive but may hint at small room for improvement in a polite way.";
}

// ---------------------------------------------------------------------------
// Fallback review draft (used when OpenAI call fails)
// ---------------------------------------------------------------------------
const FALLBACK_DRAFTS: Record<string, string[]> = {
  PROFESSIONAL_POLITE: [
    "I had a wonderful experience at {businessName}. The service was exemplary and the attention to detail was truly impressive. I would highly recommend them to anyone seeking quality service.",
    "The team at {businessName} is highly professional and efficient. My visit was seamless from start to finish. Thank you for the excellent hospitality.",
  ],
  FRIENDLY_CASUAL: [
    "Had a great time at {businessName}! The vibe is amazing and the staff are super friendly. Definitely my new go-to spot!",
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
  WITTY_FUN: [
    "Went to {businessName}, didn't want to leave. Then again, who would? 10/10, would recommend to everyone I mildly like.",
    "Plot twist: {businessName} is even better than the hype. Strong recommend.",
  ],
  HINGLISH: [
    "{businessName} mein gaya tha — ekdum zabardast experience tha yaar! Staff bhi bahut helpful tha. Definitely dobaara aaunga. 👌",
    "Bhai, {businessName} ne toh dil jeet liya! Service ekdum first class, aur atmosphere bhi bahut achha tha. Highly recommend karta hoon!",
  ],
};

function getFallbackDraft(businessName: string, style: string): string {
  const pool = FALLBACK_DRAFTS[style] ?? FALLBACK_DRAFTS.FRIENDLY_CASUAL;
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template.replace(/\{businessName\}/g, businessName);
}

// ---------------------------------------------------------------------------
// Core function: generate a Google review draft via OpenAI
// ---------------------------------------------------------------------------
/**
 * Generates an authentic-sounding Google review draft using OpenAI.
 *
 * @param options.businessName - The business name to include in context
 * @param options.rating       - Star rating given by the user (1–5)
 * @param options.commentStyle - Tone enum from CommentStyle
 * @param options.aiGuidingPrompt - Optional custom system prompt from the business owner
 * @param options.userInput       - Optional rough notes from the customer to enhance
 * @returns Generated review text string
 */
export async function generateReviewDraft(options: {
  businessName: string;
  rating: number;
  commentStyle: string;
  aiGuidingPrompt?: string;
  userInput?: string;
}): Promise<string> {
  const { businessName, rating, commentStyle, aiGuidingPrompt, userInput } = options;

  const tone = STYLE_TONE_MAP[commentStyle] ?? STYLE_TONE_MAP.FRIENDLY_CASUAL;

  // Build the system message
  const systemMessage = [
    `You are an expert copywriter helping customers write authentic Google reviews.`,
    userInput 
      ? `Your goal is to professionally ENHANCE the customer's rough feedback notes into a polished review.`
      : `Your goal is to write a high-quality review from scratch based on the customer's rating.`,
    `Your writing style must be: ${tone}.`,
    aiGuidingPrompt
      ? `Additional brand context from the business owner: "${aiGuidingPrompt}"`
      : null,
    ``,
    `Rules:`,
    `- Write the review AS the customer (first person).`,
    `- Do NOT mention the star rating or any numbers.`,
    `- Keep it between 40 and 90 words.`,
    `- Sound natural and human — avoid generic filler phrases.`,
    `- Output only the enhanced review text. No preamble, no quotation marks, no sign-off.`,
    userInput ? `- MUST include the core sentiment and details mentioned in the customer's notes.` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const userMessage = userInput 
    ? `Customer's rough feedback for "${businessName}":\n\n"${userInput}"\n\nPlease enhance this into a professional review.`
    : [
        `Write a Google review for a business called "${businessName}".`,
        ratingGuidance(rating),
      ].join(" ");

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.85,
      max_tokens: 200, // Slightly more tokens for enhancements
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("EMPTY_RESPONSE");

    return text;
  } catch (error) {
    console.error("[GENERATE_REVIEW_DRAFT_ERROR]", error);
    // Graceful fallback — never hard-fail the review page
    return getFallbackDraft(businessName, commentStyle);
  }
}
