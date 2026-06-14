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

/**
 * 推理型模型（step-3.x / *-thinking / *-reasoner）在 response_format=json_object
 * 强制模式下会把真实答案写进 reasoning，content 退化成 `{": ": ", "}` 这类碎片，
 * 导致整条流水线误判为“无可用输出”而走规则兜底。对这类模型关掉 json_object，
 * 让它把干净 JSON 直接写进 content。
 */
export function wantsJsonObjectMode(model: string): boolean {
  return !/step-?[23]|thinking|reason/i.test(model);
}

/** 推理型模型要同时产出 thinking + 答案，给足 token 预算，避免 content 被截断。 */
export function resolveMaxTokens(model: string, requested: number): number {
  return wantsJsonObjectMode(model) ? requested : Math.max(requested, 5000);
}

/**
 * 从一段文本里挑出最后一个可解析的 JSON 对象。
 * 容忍前后混入的思考文字（推理模型常把 JSON 包在解释里）。
 */
export function lastJsonObject<T>(text: string | null | undefined): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, " ");
  const blocks: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}" && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) blocks.push(cleaned.slice(start, i + 1));
    }
  }
  for (let i = blocks.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(blocks[i]) as T;
    } catch {
      // fall through to the next-shorter candidate
    }
  }
  return null;
}

type LlmMessage = {
  content?: string | null;
  reasoning_content?: string | null;
  reasoning?: string | null;
};

/** 优先用 content，损坏时再从 reasoning_content / reasoning 里挖干净 JSON。 */
export function readModelJson<T>(message: LlmMessage | null | undefined): T | null {
  if (!message) return null;
  return (
    lastJsonObject<T>(message.content) ??
    lastJsonObject<T>(message.reasoning_content) ??
    lastJsonObject<T>(message.reasoning)
  );
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
    const request: Record<string, unknown> = {
      model,
      temperature: options.temperature ?? 0.4,
      max_tokens: resolveMaxTokens(model, options.maxTokens ?? 1400),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    };
    if (wantsJsonObjectMode(model)) request.response_format = { type: "json_object" };
    const response = await client.chat.completions.create(request as never, {
      timeout: options.timeoutMs ?? 32000,
      maxRetries: 1
    });
    const data = readModelJson<T>(response.choices[0]?.message as LlmMessage);
    return data ? { data, engine: model } : null;
  } catch {
    return null;
  }
}
