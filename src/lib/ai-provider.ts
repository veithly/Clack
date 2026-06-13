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

function parseJsonLoose<T>(text: string): T | null {
  const stripped = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(stripped) as T;
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

type CallOptions = { maxTokens?: number; timeoutMs?: number; temperature?: number };

/**
 * 共享的单次模型调用：返回结构化 JSON 或 null（无密钥 / 失败 / 超时）。
 * 6 智能体流水线之外的轻量 AI 动作（STAR 改写、面试评估、多岗对比）都走这里。
 */
export async function callModelJson<T>(
  systemPrompt: string,
  userPrompt: string,
  options: CallOptions = {}
): Promise<{ data: T; engine: string } | null> {
  const client = getOpenAIClient();
  if (!client) return null;
  try {
    const model = getDefaultAiModel();
    const response = await client.chat.completions.create(
      {
        model,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      { timeout: options.timeoutMs ?? 32000, maxRetries: 1 }
    );
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const data = parseJsonLoose<T>(content);
    return data ? { data, engine: model } : null;
  } catch {
    return null;
  }
}
