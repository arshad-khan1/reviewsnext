import OpenAI from "openai";

/**
 * Singleton OpenAI client.
 * Mirrors the pattern used in prisma.ts and razorpay-client.ts.
 *
 * Required env vars:
 *   OPENAI_API_KEY  — your OpenAI secret key (sk-...)
 *   OPENAI_MODEL    — (optional) model override, defaults to "gpt-4o-mini"
 */
const globalForOpenAI = global as unknown as { openai: OpenAI };

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
