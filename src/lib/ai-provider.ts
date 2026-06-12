import "server-only";

import OpenAI from "openai";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  });
}

export function getDefaultAiModel() {
  return process.env.OPENAI_DEFAULT_MODEL || "gpt-4.1-mini";
}
