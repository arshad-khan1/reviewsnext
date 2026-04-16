import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Singleton Gemini client.
 * Mirrors the pattern used in openai.ts.
 *
 * Required env vars:
 *   GEMINI_API_KEY  — your Gemini secret key
 *   GEMINI_MODEL    — (optional) model override, defaults to "gemini-1.5-flash"
 */
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const gemini = genAI;

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
