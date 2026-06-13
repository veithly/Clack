import "server-only";

import { getDefaultAiModel, getOpenAIClient } from "./ai-provider";
import { PIPELINE_AGENTS, type AgentMeta } from "./pipeline-meta";
import type {
  AgentStatus,
  AgentTrace,
  BestFix,
  EvidenceBinding,
  EvidenceGap,
  EvidenceMatch,
  JobRequirement,
  RecruiterVerdict,
  ResumeClaim,
  TrafficLight
} from "./types";

export { PIPELINE_AGENTS, type AgentMeta } from "./pipeline-meta";

export type PipelineMode = "initial" | "evidence";

export type PipelineInput = {
  jdText: string;
  resumeText: string;
  evidenceText?: string;
  mode?: PipelineMode;
  priorGaps?: EvidenceGap[];
  /** 演示样例等需要稳定结果的场景跳过模型，直接走规则兜底。 */
  offline?: boolean;
};

export type PipelineResult = {
  usedAi: boolean;
  pipelineDepth: "ai" | "hybrid" | "fallback";
  targetRole: string;
  score: number;
  trafficLight: TrafficLight;
  scoreReason: string;
  confidence: number;
  requirements: JobRequirement[];
  claims: ResumeClaim[];
  gaps: EvidenceGap[];
  bestFix: BestFix;
  recruiterVerdict: RecruiterVerdict;
  evidenceBindings: EvidenceBinding[];
  traces: AgentTrace[];
};

export type PipelineEvent =
  | { type: "agent_start"; index: number; total: number; agent: AgentMeta }
  | { type: "agent_done"; index: number; total: number; trace: AgentTrace };

const sampleEvidence =
  "我负责问卷调研和报名页优化，调研 86 名同学，发现 2 个主要流失点，调整页面说明后报名转化率从 21% 提升到 39%。";

// ---------------------------------------------------------------------------
// 文本与归一化工具
// ---------------------------------------------------------------------------

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function firstMeaningfulLine(text: string) {
  const line = text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.length >= 2);
  return cleanText(line, 24);
}

function stripFence(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function parseJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripFence(text)) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

function normalizeWeight(value: unknown): JobRequirement["weight"] {
  return value === "high" || value === "low" ? value : "medium";
}

function normalizeImpact(value: unknown): EvidenceGap["impact"] {
  return value === "高影响" || value === "低影响" ? value : "中影响";
}

function normalizeMatch(value: unknown): EvidenceMatch {
  return value === "direct" || value === "partial" ? value : "none";
}

function normalizeStatus(value: unknown, allowProven: boolean): EvidenceGap["status"] {
  if (value === "proven" && allowProven) return "proven";
  if (value === "weak" || value === "missing" || value === "risky") return value;
  return allowProven ? "weak" : "missing";
}

function average(values: number[]) {
  if (values.length === 0) return 70;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

// ---------------------------------------------------------------------------
// 单个智能体的模型调用
// ---------------------------------------------------------------------------

// 单步上限：一步卡住就快速降级到规则，避免整条流水线被一个慢调用拖垮。
// step-3.7-flash 是推理型模型，单步通常 8-18s，给到 30s 留足余量。
const AGENT_TIMEOUT_MS = 30000;

async function callAgent<T>(systemPrompt: string, userPrompt: string, offline = false): Promise<{ data: T; engine: string } | null> {
  if (offline) return null;
  const client = getOpenAIClient();
  if (!client) return null;
  const model = getDefaultAiModel();
  // 推理型模型（step-3.7-flash）偶发：把 token 预算耗在思考上、content 截断为空。
  // 给足预算 + 失败重试一次，能把绝大多数空响应救回来。
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.chat.completions.create(
        {
          model,
          temperature: 0.4,
          max_tokens: 2800,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        },
        { timeout: AGENT_TIMEOUT_MS, maxRetries: 1 }
      );
      const content = response.choices[0]?.message?.content;
      if (content) {
        const data = parseJson<T>(content);
        if (data) return { data, engine: model };
      }
    } catch {
      // 网络/超时/空响应 → 进入下一次尝试，仍失败则交给规则兜底。
    }
  }
  return null;
}

/**
 * step-3.7-flash 经常无视外层数组键、直接返回单个对象。
 * 这里把模型输出统一成数组：命中外层键 / 顶层即数组 / 单对象包成数组 / 退而找任意数组值。
 */
function asArray(data: unknown, key: string, itemHint: string): Array<Record<string, unknown>> {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record[key])) return record[key] as Array<Record<string, unknown>>;
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  // 模型常把单条结果直接平铺，或塞进 {key: 单对象}；都救回来。
  if (itemHint in record) return [record];
  const nested = record[key];
  if (nested && typeof nested === "object" && itemHint in (nested as Record<string, unknown>)) {
    return [nested as Record<string, unknown>];
  }
  for (const value of Object.values(record)) {
    if (Array.isArray(value) && value.length) return value as Array<Record<string, unknown>>;
  }
  return [];
}

/** 取出单对象结果；若被包了一层（如 {verdict:{...}}）也能挖出来。 */
function asObject(data: unknown, hint: string): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (hint in record) return record;
  for (const value of Object.values(record)) {
    if (value && typeof value === "object" && !Array.isArray(value) && hint in (value as Record<string, unknown>)) {
      return value as Record<string, unknown>;
    }
  }
  return record;
}

// ---------------------------------------------------------------------------
// 规则兜底数据（无 API key 或单步失败时使用，保证现场可操作）
// ---------------------------------------------------------------------------

function fallbackRequirements(): JobRequirement[] {
  return [
    { id: "req-1", title: "用户调研", detail: "参与用户调研，整理用户反馈和核心问题。", weight: "high", evidencePreference: "样本量、调研方法、核心结论" },
    { id: "req-2", title: "活动运营", detail: "协助校园或社群活动的策划、执行和复盘。", weight: "high", evidencePreference: "个人动作、交付物、复盘结论" },
    { id: "req-3", title: "数据复盘", detail: "用数据评估活动效果，说明转化、留存或参与变化。", weight: "medium", evidencePreference: "转化率、留存、参与变化" },
    { id: "req-4", title: "跨团队沟通", detail: "和设计、内容、社群同学协作推进项目。", weight: "medium", evidencePreference: "协作记录、推进结果" },
    { id: "req-5", title: "校园项目", detail: "有校园项目、社群运营或产品体验分析经验优先。", weight: "low", evidencePreference: "项目链接、复盘材料" }
  ];
}

function fallbackClaims(): ResumeClaim[] {
  return [
    { id: "claim-1", title: "参与校园活动运营", detail: "负责部分报名和宣传工作，但个人贡献边界不清。", requirementId: "req-2" },
    { id: "claim-2", title: "具备用户洞察能力", detail: "写到了能力，但缺少调研样本、方法和结论。", requirementId: "req-1" },
    { id: "claim-3", title: "熟悉基础数据分析", detail: "有工具关键词，但没有业务指标和结果。", requirementId: "req-3" },
    { id: "claim-4", title: "校园活动优化课程项目", detail: "有项目经历，但缺少截图、链接和复盘材料。", requirementId: "req-5" }
  ];
}

function fallbackBindings(hasEvidence: boolean): EvidenceBinding[] {
  if (!hasEvidence) {
    return [
      { id: "bind-1", claimId: "claim-2", claimTitle: "具备用户洞察能力", evidenceQuote: "未提供证明材料", match: "none", confidence: 40, note: "声明缺少可引用的调研材料。" },
      { id: "bind-2", claimId: "claim-1", claimTitle: "参与校园活动运营", evidenceQuote: "未提供证明材料", match: "none", confidence: 42, note: "活动运营缺少个人动作证据。" },
      { id: "bind-3", claimId: "claim-3", claimTitle: "熟悉基础数据分析", evidenceQuote: "未提供证明材料", match: "none", confidence: 38, note: "数据复盘缺少结果指标。" }
    ];
  }
  return [
    { id: "bind-1", claimId: "claim-2", claimTitle: "具备用户洞察能力", evidenceQuote: "调研 86 名同学，发现 2 个主要流失点", match: "direct", confidence: 84, note: "样本量和结论已能支撑调研能力声明。" },
    { id: "bind-2", claimId: "claim-1", claimTitle: "参与校园活动运营", evidenceQuote: "负责问卷调研和报名页优化", match: "direct", confidence: 80, note: "个人动作清晰，可对应活动运营要求。" },
    { id: "bind-3", claimId: "claim-3", claimTitle: "熟悉基础数据分析", evidenceQuote: "报名转化率从 21% 提升到 39%", match: "direct", confidence: 86, note: "结果指标明确，支撑数据复盘要求。" }
  ];
}

function fallbackGaps(mode: PipelineMode, hasEvidence: boolean): EvidenceGap[] {
  if (mode === "evidence" || (hasEvidence && mode === "initial")) {
    const proven = mode === "evidence";
    return [
      {
        id: "gap-1",
        requirementId: "req-1",
        title: proven ? "用户调研已补上样本量和结论" : "用户调研样本和结论待绑定",
        requirement: "岗位需要参与用户调研，整理用户反馈和核心问题。",
        currentEvidence: proven ? "补充材料显示调研 86 名同学，发现 2 个主要流失点。" : "已上传材料，需确认调研样本和结论是否对应该声明。",
        missingEvidence: proven ? "已补上样本量和结论。" : "请绑定具体引用，写清调研对象、样本量和结论。",
        impact: "高影响",
        status: proven ? "proven" : "weak",
        confidence: proven ? 88 : 64
      },
      {
        id: "gap-2",
        requirementId: "req-2",
        title: proven ? "活动运营个人动作已清晰" : "活动运营个人贡献待写清",
        requirement: "岗位需要协助校园或社群活动策划、执行和复盘。",
        currentEvidence: proven ? "补充材料说明负责问卷调研和报名页优化。" : "材料里已有入口，但个人贡献边界仍需写清。",
        missingEvidence: proven ? "已补上个人动作。" : "请补充你负责的动作、交付物和结果。",
        impact: "高影响",
        status: proven ? "proven" : "weak",
        confidence: proven ? 85 : 62
      },
      {
        id: "gap-3",
        requirementId: "req-3",
        title: proven ? "数据复盘已补上结果指标" : "数据复盘结果指标待补",
        requirement: "岗位需要用数据评估活动效果。",
        currentEvidence: proven ? "补充材料显示报名转化率从 21% 提升到 39%。" : "简历写了熟悉表格工具，但缺少结果指标。",
        missingEvidence: proven ? "已补上结果指标。" : "缺少转化率、报名率或参与变化。",
        impact: "中影响",
        status: proven ? "proven" : "missing",
        confidence: proven ? 90 : 58
      }
    ];
  }
  return [
    {
      id: "gap-1",
      requirementId: "req-1",
      title: "用户调研缺少样本量和结论",
      requirement: "岗位需要参与用户调研，整理用户反馈和核心问题。",
      currentEvidence: "简历写了“具备用户洞察能力”。",
      missingEvidence: "缺少调研对象、样本量、方法和结论。",
      impact: "高影响",
      status: "missing",
      confidence: 78
    },
    {
      id: "gap-2",
      requirementId: "req-2",
      title: "活动运营只写参与，个人贡献不清",
      requirement: "岗位需要协助校园或社群活动策划、执行和复盘。",
      currentEvidence: "简历写了“参与校园活动运营”。",
      missingEvidence: "缺少你具体负责什么、推进什么、产生什么结果。",
      impact: "高影响",
      status: "weak",
      confidence: 71
    },
    {
      id: "gap-3",
      requirementId: "req-3",
      title: "数据复盘缺少结果指标",
      requirement: "岗位需要用数据评估活动效果。",
      currentEvidence: "简历写了“熟悉表格工具”。",
      missingEvidence: "缺少转化率、报名率或参与变化。",
      impact: "中影响",
      status: "missing",
      confidence: 74
    }
  ];
}

function fallbackRecruiter(score: number, light: TrafficLight, hasEvidence: boolean): RecruiterVerdict {
  if (light === "green") {
    return {
      headline: "第一眼：可以进面，围绕证据追问即可",
      stance: "advance",
      confidence: 82,
      strengths: ["调研有样本量和结论", "活动复盘有转化率变化", "项目贡献有具体动作"],
      concerns: ["作品链接可以再完整一些"],
      interviewQuestions: ["报名转化率从 21% 到 39% 的关键动作是什么？", "调研的 2 个流失点是怎么定位的？"],
      boundary: "这是证据可证明性判断，不是录用决定。"
    };
  }
  if (light === "yellow") {
    return {
      headline: hasEvidence ? "第一眼：方向对，但关键证据还差一口气" : "第一眼：有经历，但缺可展示证据",
      stance: "hold",
      confidence: 68,
      strengths: ["有校园活动和产品运营方向经历", "愿意补充材料"],
      concerns: ["用户调研缺样本量和结论", "活动运营个人贡献不清", "数据复盘缺结果指标"],
      interviewQuestions: ["你在活动里具体负责哪一段？", "有没有能展示的项目复盘或数据截图？"],
      boundary: "这是证据可证明性判断，不是录用决定。"
    };
  }
  return {
    headline: "第一眼：暂不建议现在投，先补关键证据",
    stance: "pass",
    confidence: 64,
    strengths: ["有相关方向的初步经历"],
    concerns: ["核心要求几乎都缺可展示证据", "声明多为能力描述，缺动作和结果"],
    interviewQuestions: ["最能代表你能力的一个项目是什么？", "这个项目有哪些可公开的材料？"],
    boundary: "这是证据可证明性判断，不是淘汰决定。"
  };
}

function fallbackBestFix(): BestFix {
  return {
    title: "补一张项目复盘截图",
    detail: "说明调研样本、你的动作和结果指标。只补这一条，收益最高。",
    evidenceText: sampleEvidence,
    relatedRequirementId: "req-1"
  };
}

function lightFromScore(score: number): TrafficLight {
  if (score >= 75) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

// ---------------------------------------------------------------------------
// 智能体实现：每一步都先尝试真实模型调用，失败则规则兜底
// ---------------------------------------------------------------------------

type AgentRun<T> = { data: T; status: AgentStatus; engine: string };

function makeTrace(
  agent: AgentMeta,
  index: number,
  run: { status: AgentStatus; engine: string; durationMs: number; confidence: number },
  inputSummary: string,
  outputSummary: string,
  impactSummary: string,
  findings: string[]
): AgentTrace {
  return {
    id: `${agent.key}-${index + 1}`,
    agentName: agent.name,
    displayName: agent.displayName,
    role: agent.role,
    status: run.status,
    durationMs: run.durationMs,
    engine: run.engine,
    confidence: run.confidence,
    inputSummary,
    outputSummary,
    impactSummary,
    findings,
    orderIndex: index + 1
  };
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; durationMs: number }> {
  const start = Date.now();
  const value = await fn();
  return { value, durationMs: Math.max(220, Date.now() - start) };
}

// Agent 1: 岗位解析
async function runJdParser(jdText: string, offline: boolean): Promise<AgentRun<{ targetRole: string; requirements: JobRequirement[] }>> {
  const system = `你是岗位解析智能体。只输出一个 JSON 对象，顶层必须是 {"targetRole": string, "requirements": [对象,...]}。
- requirements 必须是数组，包含 3 到 5 条，按重要性从高到低；严禁只返回单个对象、严禁省略 requirements 外层键。
- 每个对象：title(≤8字)、detail(≤40字)、weight(只能 high/medium/low)、evidencePreference(≤20字)。
示例（换成 JD 真实内容，至少 3 条）：
{"targetRole":"数据分析实习生","requirements":[{"title":"SQL 取数","detail":"用 SQL 从业务库取数并清洗","weight":"high","evidencePreference":"真实取数案例"},{"title":"数据可视化","detail":"用图表清晰呈现分析结论","weight":"medium","evidencePreference":"可访问看板"},{"title":"业务理解","detail":"理解核心业务指标与口径","weight":"medium","evidencePreference":"业务复盘记录"}]}`;
  const result = await callAgent<Record<string, unknown>>(system, `岗位 JD：\n${jdText}`, offline);
  const reqArray = asArray(result?.data, "requirements", "title");
  const targetRoleRaw = result?.data && typeof result.data === "object" ? (result.data as Record<string, unknown>).targetRole : undefined;
  if (reqArray.length) {
    const requirements = reqArray
      .map((item, index): JobRequirement | null => {
        const title = cleanText(item.title, 16);
        const detail = cleanText(item.detail, 60);
        if (!title || !detail) return null;
        return { id: `req-${index + 1}`, title, detail, weight: normalizeWeight(item.weight), evidencePreference: cleanText(item.evidencePreference, 28) || undefined };
      })
      .filter((item): item is JobRequirement => Boolean(item))
      .slice(0, 5);
    if (requirements.length >= 3) {
      return { data: { targetRole: cleanText(targetRoleRaw, 24) || firstMeaningfulLine(jdText) || "目标岗位", requirements }, status: "success", engine: result?.engine ?? getDefaultAiModel() };
    }
  }
  return { data: { targetRole: firstMeaningfulLine(jdText) || "产品运营实习生", requirements: fallbackRequirements() }, status: "fallback", engine: "规则兜底" };
}

// Agent 2: 简历声明
async function runResumeClaim(resumeText: string, requirements: JobRequirement[], offline: boolean): Promise<AgentRun<ResumeClaim[]>> {
  const reqList = requirements.map((r, i) => `${i + 1}. ${r.title}`).join("；");
  const system = `你是简历声明智能体。从简历里抽取能力或经历声明，对齐到最相关的岗位要求编号。
只输出一个 JSON 对象，顶层必须是 {"claims": [对象,...]}。
- claims 必须是数组，包含 2 到 4 条；严禁只返回单个对象、严禁省略 claims 外层键。
- 每个对象：title(≤10字)、detail(≤40字,点出证据是否充分)、requirementIndex(整数,从1起)。
示例（填真实内容，至少 2 条）：
{"claims":[{"title":"做过流失分析","detail":"有课程项目但缺样本量和结果指标","requirementIndex":1},{"title":"参与活动运营","detail":"负责报名宣传但个人贡献边界不清","requirementIndex":2}]}`;
  const result = await callAgent<Record<string, unknown>>(system, `岗位要求：${reqList}\n\n简历：\n${resumeText}`, offline);
  const claimArray = asArray(result?.data, "claims", "title");
  if (claimArray.length) {
    const claims = claimArray
      .map((item, index): ResumeClaim | null => {
        const title = cleanText(item.title, 18);
        const detail = cleanText(item.detail, 60);
        if (!title || !detail) return null;
        const refIndex = clamp(item.requirementIndex, 1, requirements.length, ((index % requirements.length) + 1)) - 1;
        return { id: `claim-${index + 1}`, title, detail, requirementId: requirements[refIndex]?.id ?? requirements[0]?.id };
      })
      .filter((item): item is ResumeClaim => Boolean(item))
      .slice(0, 5);
    if (claims.length >= 1) return { data: claims, status: "success", engine: result?.engine ?? getDefaultAiModel() };
  }
  return { data: fallbackClaims(), status: "fallback", engine: "规则兜底" };
}

// Agent 3: 证据绑定（新增能力）
async function runEvidenceBinder(claims: ResumeClaim[], evidenceText: string | undefined, offline: boolean): Promise<AgentRun<EvidenceBinding[]>> {
  const hasEvidence = Boolean(evidenceText?.trim());
  const claimList = claims.map((c, i) => `${i + 1}. ${c.title}`).join("；");
  const system = `你是证据绑定智能体。把证明材料里的具体片段绑定到对应声明，并判断匹配强度。
只输出一个 JSON 对象，顶层必须是 {"bindings": [对象,...]}。
- bindings 必须是数组，每条声明给一条，最多 4 条；严禁只返回单个对象、严禁省略 bindings 外层键。
- 每个对象：claimIndex(整数,从1起)、evidenceQuote(摘自材料原文,≤30字,没有就写“未提供证明材料”)、match(只能 direct/partial/none,只有直接支撑才用 direct)、confidence(0-100整数)、note(≤24字)。
示例（填真实内容，每条声明一条）：
{"bindings":[{"claimIndex":1,"evidenceQuote":"调研 86 名同学发现 2 个流失点","match":"direct","confidence":84,"note":"样本量和结论齐全"},{"claimIndex":2,"evidenceQuote":"报名转化率从21%提升到39%","match":"direct","confidence":82,"note":"有结果指标"}]}`;
  if (hasEvidence) {
    const result = await callAgent<Record<string, unknown>>(system, `声明：${claimList}\n\n证明材料：\n${evidenceText}`, offline);
    const bindArray = asArray(result?.data, "bindings", "evidenceQuote");
    if (bindArray.length) {
      const bindings = bindArray
        .map((item, index): EvidenceBinding | null => {
          const claimIndex = clamp(item.claimIndex, 1, claims.length, ((index % claims.length) + 1)) - 1;
          const claim = claims[claimIndex];
          if (!claim) return null;
          return {
            id: `bind-${index + 1}`,
            claimId: claim.id,
            claimTitle: claim.title,
            evidenceQuote: cleanText(item.evidenceQuote, 40) || "未提供证明材料",
            match: normalizeMatch(item.match),
            confidence: clamp(item.confidence, 0, 100, 60),
            note: cleanText(item.note, 32) || "已读取材料并尝试绑定。"
          };
        })
        .filter((item): item is EvidenceBinding => Boolean(item))
        .slice(0, 4);
      if (bindings.length) return { data: bindings, status: "success", engine: result?.engine ?? getDefaultAiModel() };
    }
  }
  return { data: fallbackBindings(hasEvidence), status: "fallback", engine: hasEvidence ? "规则兜底" : "无材料·跳过模型" };
}

// Agent 4: 缺口核验
async function runGapVerifier(
  requirements: JobRequirement[],
  claims: ResumeClaim[],
  bindings: EvidenceBinding[],
  evidenceText: string | undefined,
  mode: PipelineMode,
  offline: boolean
): Promise<AgentRun<EvidenceGap[]>> {
  const hasEvidence = Boolean(evidenceText?.trim());
  const allowProven = hasEvidence || mode === "evidence";
  const reqList = requirements.map((r, i) => `${i + 1}. ${r.title}：${r.detail}`).join("\n");
  const bindingList = bindings.map((b) => `${b.claimTitle} -> ${b.evidenceQuote}（${b.match}）`).join("；") || "暂无绑定";
  const system = `你是缺口核验智能体。判断岗位最关键的 3 条要求是否有证据支撑，给出状态和置信度。
只输出一个 JSON 对象，顶层必须是 {"gaps": [对象,对象,对象]}。
- gaps 必须是数组且恰好 3 条，对应最关键的 3 条要求；严禁只返回单个对象、严禁省略 gaps 外层键。
- 每个对象：requirementIndex(整数,从1起)、title(≤18字)、requirement(≤40字)、currentEvidence(≤40字)、missingEvidence(≤40字)、impact(只能 高影响/中影响/低影响)、status(只能 proven/weak/missing/risky${allowProven ? ",材料能直接支撑才用 proven" : ",没有材料时不要用 proven"})、confidence(0-100整数)。
示例（填真实内容，恰好 3 条）：
{"gaps":[{"requirementIndex":1,"title":"SQL 取数缺真实案例","requirement":"岗位需要用 SQL 取数清洗","currentEvidence":"简历写熟悉 SQL 基础","missingEvidence":"缺真实取数场景和结果","impact":"高影响","status":"weak","confidence":62},{"requirementIndex":2,"title":"可视化缺可访问作品","requirement":"用图表呈现结论","currentEvidence":"提到会用图表","missingEvidence":"缺可打开的看板链接","impact":"中影响","status":"missing","confidence":58},{"requirementIndex":3,"title":"业务理解需复核","requirement":"理解业务指标","currentEvidence":"有项目经历","missingEvidence":"缺指标口径说明","impact":"中影响","status":"risky","confidence":60}]}`;
  const result = await callAgent<Record<string, unknown>>(
    system,
    `岗位要求：\n${reqList}\n\n证据绑定：${bindingList}\n\n证明材料：${hasEvidence ? evidenceText : "无"}`,
    offline
  );
  const gapArray = asArray(result?.data, "gaps", "missingEvidence");
  if (gapArray.length) {
    const gaps = gapArray
      .map((item, index): EvidenceGap | null => {
        const title = cleanText(item.title, 28);
        const requirement = cleanText(item.requirement, 60);
        const currentEvidence = cleanText(item.currentEvidence, 60);
        const missingEvidence = cleanText(item.missingEvidence, 60);
        if (!title || !requirement) return null;
        const refIndex = clamp(item.requirementIndex, 1, requirements.length, index + 1) - 1;
        return {
          id: `gap-${index + 1}`,
          requirementId: requirements[refIndex]?.id ?? `req-${index + 1}`,
          title,
          requirement,
          currentEvidence: currentEvidence || "简历未给出可引用证据。",
          missingEvidence: missingEvidence || "请补充可展示的材料。",
          impact: normalizeImpact(item.impact),
          status: normalizeStatus(item.status, allowProven),
          confidence: clamp(item.confidence, 0, 100, 70)
        };
      })
      .filter((item): item is EvidenceGap => Boolean(item))
      .slice(0, 3);
    if (gaps.length >= 2) return { data: gaps, status: "success", engine: result?.engine ?? getDefaultAiModel() };
  }
  return { data: fallbackGaps(mode, hasEvidence), status: "fallback", engine: "规则兜底" };
}

// Agent 5: 招聘官分身（新增能力）
async function runRecruiterTwin(
  targetRole: string,
  requirements: JobRequirement[],
  gaps: EvidenceGap[],
  mode: PipelineMode,
  hasEvidence: boolean,
  offline: boolean
): Promise<AgentRun<RecruiterVerdict & { score: number; trafficLight: TrafficLight; scoreReason: string }>> {
  const gapList = gaps.map((g) => `${g.title}（${g.status}）`).join("；");
  const scoreFloor = mode === "evidence" ? 55 : hasEvidence ? 40 : 25;
  const scoreCeil = mode === "evidence" || hasEvidence ? 88 : 72;
  const system = `你是招聘官分身智能体，模拟招聘官第一眼判断，但绝不替企业做录用或淘汰决定。
规则：
- headline 不超过 24 字，是第一眼判断。
- stance 只能是 advance（可进面追问）、hold（先补证据再投）、pass（先补关键证据，不是淘汰）之一。
- score 是证据覆盖度（不是能力分），取 ${scoreFloor} 到 ${scoreCeil} 的整数。
- trafficLight 只能是 green、yellow、red 之一。
- confidence 是 0-100 整数；scoreReason 不超过 40 字。
- strengths、concerns 各最多 3 条，每条不超过 20 字。
- interviewQuestions 给 2 到 3 条围绕证据的追问，每条不超过 24 字。
只输出 JSON，照这个示例填真实内容：
{"headline":"方向对，先补一个数据作品再投","stance":"hold","score":58,"trafficLight":"yellow","confidence":70,"scoreReason":"核心要求缺可展示作品","strengths":["有业务向数据结论"],"concerns":["缺可访问的数据作品"],"interviewQuestions":["有没有可打开看的看板？"]}`;
  const result = await callAgent<Record<string, unknown>>(
    system,
    `岗位：${targetRole}\n关键要求：${requirements.map((r) => r.title).join("、")}\n缺口状态：${gapList}\n已补证据：${hasEvidence ? "有" : "无"}`,
    offline
  );
  const recruiterObj = asObject(result?.data, "headline");
  if (recruiterObj && (recruiterObj.headline || recruiterObj.score)) {
    const data = recruiterObj;
    const score = clamp(data.score, scoreFloor, scoreCeil, hasEvidence ? 66 : 42);
    const light: TrafficLight = data.trafficLight === "green" || data.trafficLight === "yellow" || data.trafficLight === "red" ? (data.trafficLight as TrafficLight) : lightFromScore(score);
    const toList = (value: unknown, max: number, cap: number) =>
      Array.isArray(value) ? value.map((v) => cleanText(v, cap)).filter(Boolean).slice(0, max) : [];
    const verdict: RecruiterVerdict & { score: number; trafficLight: TrafficLight; scoreReason: string } = {
      headline: cleanText(data.headline, 28) || "第一眼判断已生成",
      stance: data.stance === "advance" || data.stance === "pass" ? data.stance : "hold",
      confidence: clamp(data.confidence, 0, 100, 70),
      strengths: toList(data.strengths, 3, 24),
      concerns: toList(data.concerns, 3, 24),
      interviewQuestions: toList(data.interviewQuestions, 3, 30),
      boundary: "这是证据可证明性判断，不是录用决定。",
      score,
      trafficLight: light,
      scoreReason: cleanText(data.scoreReason, 60) || "证据覆盖了部分关键要求。"
    };
    if (verdict.strengths.length && verdict.interviewQuestions.length) {
      return { data: verdict, status: "success", engine: result?.engine ?? getDefaultAiModel() };
    }
  }
  const fallbackScore = mode === "evidence" ? 78 : hasEvidence ? 58 : 42;
  const light: TrafficLight = mode === "evidence" ? "green" : "yellow";
  const verdict = fallbackRecruiter(fallbackScore, light, hasEvidence);
  return {
    data: {
      ...verdict,
      score: fallbackScore,
      trafficLight: light,
      scoreReason: mode === "evidence" ? "新增材料补上了关键要求对应的可展示证据。" : "有相关经历，但关键要求缺少可展示证据。"
    },
    status: "fallback",
    engine: "规则兜底"
  };
}

// Agent 6: 行动建议
async function runActionPlanner(gaps: EvidenceGap[], concerns: string[], requirements: JobRequirement[], offline: boolean): Promise<AgentRun<BestFix>> {
  const openGap = gaps.find((g) => g.status !== "proven") ?? gaps[0];
  const system = `你是行动建议智能体。只给一个 10 分钟内能补的、收益最高的补证据动作。
规则：
- title 不超过 20 字；detail 不超过 50 字，说明为什么这条收益最高。
- evidenceText 是可直接粘贴的示范证据文案，不超过 80 字。
只输出 JSON，照这个示例填真实内容：
{"title":"补一个可访问的数据作品链接","detail":"同时支撑可视化和取数两条要求，收益最高","evidenceText":"我用 Python 清洗 5200 行订单数据，做了留存看板，第 2 周流失最高，链接：…"}`;
  const result = await callAgent<Record<string, unknown>>(
    system,
    `证据缺口：${gaps.map((g) => `${g.title}：${g.missingEvidence}`).join("\n")}\n招聘官顾虑：${concerns.join("；") || "无"}`,
    offline
  );
  const actionObj = asObject(result?.data, "title");
  if (actionObj && actionObj.title) {
    const bestFix: BestFix = {
      title: cleanText(actionObj.title, 28) || "补一条关键证据",
      detail: cleanText(actionObj.detail, 70) || "补这一条同时影响多项要求。",
      evidenceText: cleanText(actionObj.evidenceText, 120) || sampleEvidence,
      relatedRequirementId: openGap?.requirementId ?? requirements[0]?.id ?? "req-1"
    };
    return { data: bestFix, status: "success", engine: result?.engine ?? getDefaultAiModel() };
  }
  return { data: { ...fallbackBestFix(), relatedRequirementId: openGap?.requirementId ?? "req-1" }, status: "fallback", engine: "规则兜底" };
}

// ---------------------------------------------------------------------------
// 编排器：按依赖顺序串起 6 个智能体，并逐步上报进度
// ---------------------------------------------------------------------------

export async function runAnalysisPipeline(
  input: PipelineInput,
  onEvent?: (event: PipelineEvent) => void | Promise<void>
): Promise<PipelineResult> {
  const mode: PipelineMode = input.mode ?? "initial";
  const hasEvidence = Boolean(input.evidenceText?.trim());
  const offline = Boolean(input.offline);
  const total = PIPELINE_AGENTS.length;
  const traces: AgentTrace[] = [];
  const statuses: AgentStatus[] = [];

  async function step<T>(
    index: number,
    work: () => Promise<AgentRun<T>>,
    summarize: (run: AgentRun<T>, durationMs: number) => { confidence: number; input: string; output: string; impact: string; findings: string[] }
  ): Promise<T> {
    const agent = PIPELINE_AGENTS[index];
    await onEvent?.({ type: "agent_start", index, total, agent });
    const { value: run, durationMs } = await timed(work);
    const summary = summarize(run, durationMs);
    const trace = makeTrace(agent, index, { status: run.status, engine: run.engine, durationMs, confidence: summary.confidence }, summary.input, summary.output, summary.impact, summary.findings);
    traces.push(trace);
    statuses.push(run.status);
    await onEvent?.({ type: "agent_done", index, total, trace });
    return run.data;
  }

  const jd = await step(0, () => runJdParser(input.jdText, offline), (run) => ({
    confidence: run.status === "success" ? 88 : 70,
    input: "读取岗位描述全文。",
    output: `识别岗位「${run.data.targetRole}」，拆出 ${run.data.requirements.length} 条要求。`,
    impact: "作为后续所有证据匹配的基准。",
    findings: run.data.requirements.slice(0, 3).map((r) => `${r.title}·${r.weight === "high" ? "高" : r.weight === "medium" ? "中" : "低"}权重`)
  }));

  const claims = await step(1, () => runResumeClaim(input.resumeText, jd.requirements, offline), (run) => ({
    confidence: run.status === "success" ? 84 : 68,
    input: "读取候选人简历文本。",
    output: `抽取 ${run.data.length} 条声明并对齐到岗位要求。`,
    impact: "确认每条声明是否有证据支撑。",
    findings: run.data.slice(0, 3).map((c) => c.title)
  }));

  const bindings = await step(2, () => runEvidenceBinder(claims, input.evidenceText, offline), (run) => {
    const direct = run.data.filter((b) => b.match === "direct").length;
    return {
      confidence: hasEvidence ? (run.status === "success" ? 82 : 66) : 55,
      input: hasEvidence ? "读取证明材料并切片。" : "无证明材料，标记待补。",
      output: hasEvidence ? `绑定 ${run.data.length} 段材料，其中 ${direct} 段直接支撑。` : "暂无可绑定材料，全部记为待补。",
      impact: "把“材料”和“声明”连起来，让缺口判断有依据。",
      findings: run.data.slice(0, 3).map((b) => `${b.claimTitle}→${b.match === "direct" ? "直接" : b.match === "partial" ? "部分" : "缺失"}`)
    };
  });

  const gaps = await step(3, () => runGapVerifier(jd.requirements, claims, bindings, input.evidenceText, mode, offline), (run) => ({
    confidence: average(run.data.map((g) => g.confidence ?? 70)),
    input: "对齐要求、声明和证据绑定。",
    output: `判定 3 条缺口：${run.data.map((g) => g.status).join("/")}。`,
    impact: "决定红黄绿证据标签和置信度。",
    findings: run.data.map((g) => `${g.title}（${g.confidence ?? 70}%）`)
  }));

  const recruiter = await step(4, () => runRecruiterTwin(jd.targetRole, jd.requirements, gaps, mode, hasEvidence, offline), (run) => ({
    confidence: run.data.confidence,
    input: "读取证据状态和岗位权重。",
    output: `第一眼判断：${run.data.headline}（${run.data.score} 分）。`,
    impact: "模拟招聘官视角，但不做录用或淘汰决定。",
    findings: run.data.interviewQuestions.slice(0, 2).map((q) => `追问：${q}`)
  }));

  const bestFix = await step(5, () => runActionPlanner(gaps, recruiter.concerns, jd.requirements, offline), (run) => ({
    confidence: run.status === "success" ? 80 : 66,
    input: "读取最高影响缺口和招聘官顾虑。",
    output: `锁定唯一动作：${run.data.title}。`,
    impact: "保证 P0 只给一个最佳补证据动作。",
    findings: [run.data.title]
  }));

  const successCount = statuses.filter((s) => s === "success").length;
  const pipelineDepth: PipelineResult["pipelineDepth"] = successCount === total ? "ai" : successCount === 0 ? "fallback" : "hybrid";

  const { score, trafficLight, scoreReason, ...verdict } = recruiter;

  return {
    usedAi: successCount > 0,
    pipelineDepth,
    targetRole: jd.targetRole,
    score,
    trafficLight,
    scoreReason,
    confidence: average(traces.map((t) => t.confidence ?? 70)),
    requirements: jd.requirements,
    claims,
    gaps,
    bestFix,
    recruiterVerdict: verdict,
    evidenceBindings: bindings,
    traces
  };
}
