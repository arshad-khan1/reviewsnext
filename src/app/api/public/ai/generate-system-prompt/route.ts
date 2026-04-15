import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/guard";

export async function POST(req: Request) {
  try {
    const { keywords } = await req.json();

    if (!keywords || keywords.trim().split(/\s+/).filter(Boolean).length < 10) {
      return NextResponse.json(
        { code: "INVALID_KEYWORDS", message: "At least 10 words are required" },
        { status: 400 },
      );
    }

    // 1. Try to get user for logging
    const { user: payload } = await getAuthUser(req as any);

    if (payload) {
      // Ensure User has AiCredits (Onboarding trial)
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

      // Log Usage
      await prisma.aiUsageLog.create({
        data: {
          aiCreditsId: credits.id,
          creditsUsed: 1,
          operation: "SYS_PROMPT_GENERATE",
          metadata: { keywords } as any,
        },
      });
    }

    // 3. Return Static High-Quality Prompt
    // In the future, this will call an LLM with the provided keywords.
    const staticPrompt = `We are committed to delivering an exceptional experience characterized by professional service, meticulous attention to detail, and a warm, inviting atmosphere. Our mission is to exceed customer expectations through quality products and personalized care. Please highlight our unique blend of expertise and hospitality to inspire authentic and positive feedback from our valued guests.`;

    return NextResponse.json({ prompt: staticPrompt }, { status: 200 });
  } catch (error: any) {
    console.error("[GENERATE_SYSTEM_PROMPT_ERROR]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to generate prompt" },
      { status: 500 },
    );
  }
}
