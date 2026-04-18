import { openai, OPENAI_MODEL } from "./openai";
import { gemini, GEMINI_MODEL } from "./gemini";

export type AiGenerationOptions = {
  systemMessage: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
};

/**
 * Helper: Generate via Gemini
 */
export async function generateWithGemini(options: AiGenerationOptions): Promise<string> {
  const model = gemini.getGenerativeModel({ 
    model: GEMINI_MODEL,
    systemInstruction: options.systemMessage,
  });

  const result = await model.generateContent(options.userMessage);
  const response = await result.response;
  const text = response.text().trim();
  
  if (!text) throw new Error("EMPTY_RESPONSE");
  return text;
}

/**
 * Helper: Generate via OpenAI
 */
export async function generateWithOpenAI(options: AiGenerationOptions): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: options.systemMessage },
      { role: "user", content: options.userMessage },
    ],
    temperature: options.temperature ?? 0.85,
    max_tokens: options.maxTokens ?? 200,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("EMPTY_RESPONSE");
  return text;
}

/**
 * Main entry point for AI generation that respects the AI_PROVIDER env var.
 */
export async function generateWithProvider(options: AiGenerationOptions): Promise<string> {
  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? "gemini";

  if (provider === "openai") {
    return await generateWithOpenAI(options);
  } else {
    // Default to Gemini
    return await generateWithGemini(options);
  }
}
