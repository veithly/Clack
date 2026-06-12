import "server-only";

import { getDefaultAiModel, getOpenAIClient } from "./ai-provider";
import type { BestFix, CheckReport, EvidenceGap, JobRequirement, ResumeClaim, TrafficLight } from "./types";

type RawRequirement = {
  title?: string;
  detail?: string;
  weight?: string;
};

type RawClaim = {
  title?: string;
  detail?: string;
};

type RawGap = {
  title?: string;
  requirement?: string;
  currentEvidence?: string;
  missingEvidence?: string;
  impact?: string;
  status?: string;
};

type RawBestFix = {
  title?: string;
  detail?: string;
  evidenceText?: string;
};

export type AiReportAnalysis = {
  usedAi: boolean;
  targetRole?: string;
  score?: number;
  trafficLight?: TrafficLight;
  scoreReason?: string;
  requirements?: JobRequirement[];
  claims?: ResumeClaim[];
  gaps?: EvidenceGap[];
  bestFix?: BestFix;
  traceSummaries?: {
    jd?: string;
    resume?: string;
    evidence?: string;
    recruiter?: string;
    action?: string;
  };
};

type RawAnalysis = {
  targetRole?: string;
  score?: number;
  trafficLight?: string;
  scoreReason?: string;
  requirements?: RawRequirement[];
  claims?: RawClaim[];
  gaps?: RawGap[];
  bestFix?: RawBestFix;
  traceSummaries?: AiReportAnalysis["traceSummaries"];
};

const INITIAL_SYSTEM_PROMPT = `你是“咔哒”的服务端分析智能体。你只判断岗位要求、简历声明和证明材料之间的“可证明性”，不验证经历真假，不承诺录用概率，不做简历润色。

只输出 JSON。字段：
{
  "targetRole": "岗位名称",
  "score": 25-88 的整数,
  "trafficLight": "red|yellow|green",
  "scoreReason": "一句中文原因",
  "requirements": [{"title":"", "detail":"", "weight":"high|medium|low"}],
  "claims": [{"title":"", "detail":""}],
  "gaps": [{"title":"", "requirement":"", "currentEvidence":"", "missingEvidence":"", "impact":"高影响|中影响|低影响", "status":"proven|missing|weak|risky"}],
  "bestFix": {"title":"", "detail":"", "evidenceText":""},
  "traceSummaries": {"jd":"", "resume":"", "evidence":"", "recruiter":"", "action":""}
}

限制：
- requirements 最多 5 条，gaps 必须恰好 3 条。
- 只有当用户提供的证明材料能直接支撑声明时，status 才能写 proven。
- bestFix 只能有 1 个动作，必须是用户 10 分钟内能补的证据。
- 中文要短，像产品界面文案，不要写长段说明。`;

const EVIDENCE_SYSTEM_PROMPT = `你是“咔哒”的证据复核智能体。用户已经补充证明材料。你要判断新增材料是否补上原来的 3 个证据缺口。

只输出 JSON。字段同上，但 score 建议在 55-88 之间；gaps 必须恰好 3 条，status 可用 proven|weak|missing|risky。
不要验证经历真假，只判断材料是否能支撑简历声明。`;

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function parseJson(text: string): RawAnalysis | null {
  try {
    return JSON.parse(stripCodeFence(text)) as RawAnalysis;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as RawAnalysis;
    } catch {
      return null;
    }
  }
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function clampScore(value: unknown, min: number, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizeTrafficLight(value: unknown): TrafficLight | undefined {
  if (value === "green" || value === "yellow" || value === "red") return value;
  return undefined;
}

function normalizeWeight(value: unknown): JobRequirement["weight"] {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function normalizeImpact(value: unknown): EvidenceGap["impact"] {
  if (value === "高影响" || value === "中影响" || value === "低影响") return value;
  return "中影响";
}

function normalizeStatus(value: unknown, allowProven: boolean): EvidenceGap["status"] {
  if (value === "proven" && allowProven) return "proven";
  if (value === "weak" || value === "missing" || value === "risky") return value;
  return allowProven ? "weak" : "missing";
}

function normalizeAnalysis(raw: RawAnalysis, allowProven: boolean): AiReportAnalysis {
  const requirements = (raw.requirements ?? [])
    .map((item, index): JobRequirement | null => {
      const title = cleanText(item.title, 30);
      const detail = cleanText(item.detail, 120);
      if (!title || !detail) return null;
      return {
        id: `ai-req-${index + 1}`,
        title,
        detail,
        weight: normalizeWeight(item.weight)
      };
    })
    .filter((item): item is JobRequirement => Boolean(item))
    .slice(0, 5);

  const claims = (raw.claims ?? [])
    .map((item, index): ResumeClaim | null => {
      const title = cleanText(item.title, 34);
      const detail = cleanText(item.detail, 120);
      if (!title || !detail) return null;
      return {
        id: `ai-claim-${index + 1}`,
        title,
        detail
      };
    })
    .filter((item): item is ResumeClaim => Boolean(item))
    .slice(0, 5);

  const gaps = (raw.gaps ?? [])
    .map((item, index): EvidenceGap | null => {
      const title = cleanText(item.title, 36);
      const requirement = cleanText(item.requirement, 120);
      const currentEvidence = cleanText(item.currentEvidence, 120);
      const missingEvidence = cleanText(item.missingEvidence, 120);
      if (!title || !requirement || !currentEvidence || !missingEvidence) return null;
      return {
        id: `ai-gap-${index + 1}`,
        requirementId: requirements[index % Math.max(requirements.length, 1)]?.id ?? `ai-req-${index + 1}`,
        title,
        requirement,
        currentEvidence,
        missingEvidence,
        impact: normalizeImpact(item.impact),
        status: normalizeStatus(item.status, allowProven)
      };
    })
    .filter((item): item is EvidenceGap => Boolean(item))
    .slice(0, 3);

  const bestFixTitle = cleanText(raw.bestFix?.title, 40);
  const bestFixDetail = cleanText(raw.bestFix?.detail, 140);
  const bestFixEvidence = cleanText(raw.bestFix?.evidenceText, 240);

  return {
    usedAi: true,
    targetRole: cleanText(raw.targetRole, 30) || undefined,
    score: clampScore(raw.score, allowProven ? 55 : 25, allowProven ? 88 : 72),
    trafficLight: normalizeTrafficLight(raw.trafficLight),
    scoreReason: cleanText(raw.scoreReason, 120) || undefined,
    requirements: requirements.length >= 3 ? requirements : undefined,
    claims: claims.length >= 2 ? claims : undefined,
    gaps: gaps.length === 3 ? gaps : undefined,
    bestFix:
      bestFixTitle && bestFixDetail
        ? {
            title: bestFixTitle,
            detail: bestFixDetail,
            evidenceText: bestFixEvidence,
            relatedRequirementId: gaps[0]?.requirementId ?? requirements[0]?.id ?? "ai-req-1"
          }
        : undefined,
    traceSummaries: raw.traceSummaries
  };
}

async function requestAnalysis(systemPrompt: string, userPrompt: string, allowProven: boolean) {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: getDefaultAiModel(),
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = parseJson(content);
    return parsed ? normalizeAnalysis(parsed, allowProven) : null;
  } catch {
    return null;
  }
}

export async function analyzeInitialReport(input: { jdText: string; resumeText: string; evidenceText?: string }) {
  const evidenceSection = input.evidenceText?.trim()
    ? `\n\n已上传证明材料：\n${input.evidenceText}`
    : "\n\n已上传证明材料：无。请只依据岗位 JD 和简历声明判断可证明性。";
  return requestAnalysis(
    INITIAL_SYSTEM_PROMPT,
    `岗位 JD：\n${input.jdText}\n\n简历文本：\n${input.resumeText}${evidenceSection}\n\n请输出咔哒 JSON。`,
    Boolean(input.evidenceText?.trim())
  );
}

export async function analyzeEvidenceUpdate(input: { report: CheckReport; evidenceText: string }) {
  return requestAnalysis(
    EVIDENCE_SYSTEM_PROMPT,
    `岗位 JD：\n${input.report.jdText}\n\n简历文本：\n${input.report.resumeText}\n\n原证据缺口：\n${input.report.gaps
      .map((gap) => `- ${gap.title}：${gap.missingEvidence}`)
      .join("\n")}\n\n新增证明材料：\n${input.evidenceText}\n\n请输出复核后的咔哒 JSON。`,
    true
  );
}
