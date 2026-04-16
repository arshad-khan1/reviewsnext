import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/guard";
import { generateWithProvider } from "@/lib/ai-service";

/**
 * POST /api/public/ai/generate-system-prompt
 * Generates a business-specific AI guiding prompt from owner-supplied keywords.
 *
 * Body:
 *   keywords  string  — free-form description of the business (≥ 10 words)
 */
export async function POST(req: Request) {
  try {
    const { keywords } = await req.json();

    if (!keywords || keywords.trim().split(/\s+/).filter(Boolean).length < 10) {
      return NextResponse.json(
        { code: "INVALID_KEYWORDS", message: "At least 10 words are required" },
        { status: 400 },
      );
    }

    // 1. Attempt to identify the logged-in user (for logging — non-blocking)
    const { user: payload } = await getAuthUser(req as any);

    if (payload) {
      // Ensure user has an AiCredits row (onboarding trial credits)
      const credits = await prisma.aiCredits.upsert({
        where: { userId: payload.sub },
        create: {
          userId: payload.sub,
          monthlyAllocation: 0,
          monthlyUsed: 0,
          topupAllocation: 10,
          topupUsed: 0,
        },
        update: {},
      });

      // Log the usage
      await prisma.aiUsageLog.create({
        data: {
          aiCreditsId: credits.id,
          creditsUsed: 1,
          operation: "SYS_PROMPT_GENERATE",
          metadata: { keywords } as any,
        },
      });
    }

    // 2. Generate a guiding prompt via OpenAI
    const systemMessage = [
      `You are a brand strategist helping business owners craft a short, focused AI guiding prompt.`,
      `The prompt will be shown to an AI later to help it write authentic Google reviews for their customers.`,
      ``,
      `Rules for the output:`,
      `- Write in third person, describing the business and its values.`,
      `- Highlight what makes the business special based on the keywords.`,
      `- Keep it between 40 and 80 words.`,
      `- Output only the final prompt text. No preamble, no labels, no quotation marks.`,
    ].join("\n");

    const userMessage = `Here are the business owner's keywords describing their business:\n\n"${keywords}"\n\nWrite the AI guiding prompt now.`;

    const prompt = await generateWithProvider({
      systemMessage,
      userMessage,
      temperature: 0.7,
      maxTokens: 120,
    });

    if (!prompt) {
      throw new Error("EMPTY_RESPONSE");
    }

    return NextResponse.json({ prompt }, { status: 200 });
  } catch (error: any) {
    console.error("[GENERATE_SYSTEM_PROMPT_ERROR]", error);

    // Graceful fallback — return a solid generic prompt rather than a 500
    const fallbackPrompt =
      "We are committed to delivering an exceptional experience characterised by professional service, meticulous attention to detail, and a warm, inviting atmosphere. Our mission is to exceed customer expectations through quality offerings and personalised care.";

    return NextResponse.json({ prompt: fallbackPrompt }, { status: 200 });
  }
}
