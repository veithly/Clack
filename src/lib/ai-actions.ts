import "server-only";

import { callModelJson } from "./ai-provider";

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function toList(value: unknown, max: number, cap: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => clean(item, cap)).filter(Boolean).slice(0, max);
}

// ---------------------------------------------------------------------------
// 1) STAR 简历改写：把一条证据不足的声明，改写成有证据、可直接放进简历的要点
// ---------------------------------------------------------------------------

export type RewriteInput = {
  requirement: string;
  claimTitle: string;
  currentEvidence: string;
  missingEvidence: string;
  evidenceQuote?: string;
};

export type RewriteResult = {
  star: string;
  tips: string[];
  usedAi: boolean;
  engine: string;
};

const REWRITE_SYSTEM = `你是简历改写助手。把候选人一条"证据不足"的声明，改写成一条有证据、可直接放进简历的 STAR 式要点（情境-任务-行动-结果）。
规则：
- star 是一行要点，60 到 90 字，包含具体动作和可量化结果。
- 如果候选人没给数字，用方括号占位（如 [X%]、[N 人]）让用户填，绝不编造数字。
- tips 给 2 条，每条不超过 24 字，说明还要补什么这句话才站得住。
只输出 JSON，照这个示例的字段和风格填真实内容：
{"star":"负责校园活动报名页优化：重写页面说明并精简 3 处表单，两周内把报名转化率从 [21%] 提升到 [39%]。","tips":["补一张转化率前后对比截图","写清你独立负责的部分"]}`;

export async function rewriteClaimToStar(input: RewriteInput): Promise<RewriteResult> {
  const user = `岗位要求：${input.requirement}
当前声明：${input.claimTitle}
简历现有证据：${input.currentEvidence || "几乎没有"}
还缺的证据：${input.missingEvidence}
${input.evidenceQuote ? `已有材料片段：${input.evidenceQuote}` : ""}`;

  const result = await callModelJson<{ star?: unknown; tips?: unknown }>(REWRITE_SYSTEM, user, { maxTokens: 1200, temperature: 0.4 });
  if (result?.data?.star) {
    const star = clean(result.data.star, 140);
    const tips = toList(result.data.tips, 3, 28);
    if (star.length >= 12) {
      return { star, tips: tips.length ? tips : ["补一个可展示的材料链接", "写清你独立负责的部分"], usedAi: true, engine: result.engine };
    }
  }
  return {
    star: `${input.claimTitle}：写清你独立负责的动作，并补上可量化结果（如把某指标从 [X] 提升到 [Y]），再附一条可访问的材料链接。`,
    tips: [`补：${input.missingEvidence || "可展示的结果指标"}`, "区分团队成果与你的个人动作"],
    usedAi: false,
    engine: "规则兜底"
  };
}

// ---------------------------------------------------------------------------
// 2) 面试追问预演：招聘官就某条证据缺口追问，候选人作答，判断是否补上缺口
// ---------------------------------------------------------------------------

export type InterviewInput = {
  targetRole: string;
  question: string;
  answer: string;
  gapTitle?: string;
  missingEvidence?: string;
};

export type InterviewVerdict = "strong" | "partial" | "weak";

export type InterviewResult = {
  verdict: InterviewVerdict;
  score: number;
  feedback: string;
  followUp: string;
  usedAi: boolean;
  engine: string;
};

const INTERVIEW_SYSTEM = `你是面试追问评估助手。招聘官就某条证据缺口提了一个追问，候选人作答。判断这个回答有没有把证据缺口补上。
规则：
- verdict 只能是 strong（答到点且给了证据/数字）、partial（方向对但缺细节或数据）、weak（没答到或仍是空话）之一。
- score 是 0 到 100 的整数，表示把缺口补上的程度。
- feedback 不超过 40 字，直接说哪里好、哪里还虚，不要客套。
- followUp 是一句更深的追问，不超过 24 字。
只输出 JSON，照这个示例的字段和风格填真实内容：
{"verdict":"partial","score":58,"feedback":"说清了动作，但缺样本量和结果数字","followUp":"调研了多少人，结论是什么？"}`;

export async function evaluateInterviewAnswer(input: InterviewInput): Promise<InterviewResult> {
  const answer = clean(input.answer, 600);
  const user = `岗位：${input.targetRole}
${input.gapTitle ? `对应证据缺口：${input.gapTitle}` : ""}
${input.missingEvidence ? `这条缺口还缺：${input.missingEvidence}` : ""}
招聘官追问：${input.question}
候选人回答：${answer}`;

  const result = await callModelJson<Record<string, unknown>>(INTERVIEW_SYSTEM, user, { maxTokens: 1000, temperature: 0.3 });
  if (result?.data && (result.data.feedback || result.data.verdict)) {
    const verdict: InterviewVerdict =
      result.data.verdict === "strong" || result.data.verdict === "weak" ? result.data.verdict : "partial";
    const fallbackScore = verdict === "strong" ? 82 : verdict === "weak" ? 34 : 58;
    return {
      verdict,
      score: clampInt(result.data.score, 0, 100, fallbackScore),
      feedback: clean(result.data.feedback, 60) || "回答已记录，建议补上具体数字和结果。",
      followUp: clean(result.data.followUp, 36) || "能不能再给一个具体数字？",
      usedAi: true,
      engine: result.engine
    };
  }
  // 规则兜底：用回答长度和是否含数字粗判
  const hasNumber = /\d/.test(answer);
  const longEnough = answer.length >= 40;
  const verdict: InterviewVerdict = hasNumber && longEnough ? "partial" : "weak";
  return {
    verdict,
    score: verdict === "partial" ? 56 : 32,
    feedback: hasNumber ? "有内容，但还需要把动作和结果说得更具体。" : "目前偏空泛，缺具体动作和可量化结果。",
    followUp: input.missingEvidence ? `具体补一下：${input.missingEvidence}` : "能给一个具体数字吗？",
    usedAi: false,
    engine: "规则兜底"
  };
}

// ---------------------------------------------------------------------------
// 3) 多岗位就绪度对比：同一份简历和证据，对多个岗位排序该先投哪个
// ---------------------------------------------------------------------------

export type CompareJobInput = { id: string; title: string; jdText: string };

export type CompareJobInputs = {
  resumeText: string;
  evidenceText?: string;
  jobs: CompareJobInput[];
};

export type CompareJobRanking = {
  id: string;
  title: string;
  readiness: number;
  light: "green" | "yellow" | "red";
  reason: string;
  topGap: string;
};

export type CompareResult = {
  ranking: CompareJobRanking[];
  usedAi: boolean;
  engine: string;
};

const COMPARE_SYSTEM = `你是岗位就绪度对比助手。同一份简历和证据，对多个岗位分别判断"证据就绪度"，并据此排序建议先投哪个。
规则：
- 对每个岗位给 readiness（0 到 100 的证据覆盖度整数，不是能力分）、light（green/yellow/red）、reason（不超过 30 字，为什么这个分）、topGap（最该补的一条，不超过 20 字）。
- readiness >= 75 用 green，45 到 74 用 yellow，低于 45 用 red。
- jobs 数组里每个对象都要带回传入的 id。
只输出 JSON，照这个示例的字段和风格填真实内容：
{"jobs":[{"id":"j1","readiness":62,"light":"yellow","reason":"有数据项目但缺可访问作品","topGap":"补一个公开数据看板"}]}`;

function lightFromReadiness(score: number): "green" | "yellow" | "red" {
  if (score >= 75) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

export async function compareJobReadiness(input: CompareJobInputs): Promise<CompareResult> {
  const jobs = input.jobs.slice(0, 4).map((job, index) => ({
    id: job.id || `job-${index + 1}`,
    title: clean(job.title, 30) || `岗位 ${index + 1}`,
    jdText: clean(job.jdText, 700)
  }));

  const user = `简历：${clean(input.resumeText, 1500)}
证据材料：${input.evidenceText ? clean(input.evidenceText, 1000) : "暂未提供"}

要对比的岗位（用 id 对应回传）：
${jobs.map((job) => `[${job.id}] ${job.title}\n${job.jdText}`).join("\n\n")}`;

  const result = await callModelJson<{ jobs?: Array<Record<string, unknown>> }>(COMPARE_SYSTEM, user, { maxTokens: 1600, temperature: 0.3 });
  if (result?.data?.jobs?.length) {
    const byId = new Map(jobs.map((job) => [job.id, job]));
    const ranking = result.data.jobs
      .map((item, index): CompareJobRanking | null => {
        const id = clean(item.id, 24);
        const job = byId.get(id) ?? jobs[index];
        if (!job) return null;
        const readiness = clampInt(item.readiness, 0, 100, 55);
        const light =
          item.light === "green" || item.light === "yellow" || item.light === "red"
            ? (item.light as "green" | "yellow" | "red")
            : lightFromReadiness(readiness);
        return {
          id: job.id,
          title: job.title,
          readiness,
          light,
          reason: clean(item.reason, 40) || "证据覆盖了部分要求。",
          topGap: clean(item.topGap, 28) || "补一条可展示的关键材料"
        };
      })
      .filter((item): item is CompareJobRanking => Boolean(item));
    const ranked = dedupeAndSort(ranking, jobs);
    if (ranked.length) return { ranking: ranked, usedAi: true, engine: result.engine };
  }

  // 规则兜底：按 JD 与简历的关键词重合度粗估
  const fallback = jobs.map((job) => {
    const overlap = keywordOverlap(input.resumeText, job.jdText);
    const readiness = clampInt(40 + overlap * 6, 30, 80, 50);
    return {
      id: job.id,
      title: job.title,
      readiness,
      light: lightFromReadiness(readiness),
      reason: overlap >= 3 ? "简历与岗位关键词重合较多" : "简历与岗位关键词重合较少",
      topGap: "补一条可量化结果的材料"
    };
  });
  return { ranking: dedupeAndSort(fallback, jobs), usedAi: false, engine: "规则兜底" };
}

function dedupeAndSort(ranking: CompareJobRanking[], jobs: CompareJobInput[]): CompareJobRanking[] {
  const seen = new Set<string>();
  const deduped = ranking.filter((item) => (seen.has(item.id) ? false : seen.add(item.id)));
  for (const job of jobs) {
    if (!seen.has(job.id)) {
      deduped.push({ id: job.id, title: clean(job.title, 30), readiness: 50, light: "yellow", reason: "信息不足，按中性估计", topGap: "补一条关键证据" });
      seen.add(job.id);
    }
  }
  return deduped.sort((a, b) => b.readiness - a.readiness);
}

function keywordOverlap(resume: string, jd: string): number {
  const tokens = (text: string) => new Set(text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, " ").split(/\s+/).filter((token) => token.length >= 2));
  const resumeTokens = tokens(resume);
  let count = 0;
  for (const token of tokens(jd)) {
    if (resumeTokens.has(token)) count += 1;
  }
  return count;
}
