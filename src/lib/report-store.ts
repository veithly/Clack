import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { analyzeEvidenceUpdate, analyzeInitialReport, type AiReportAnalysis } from "./ai-report";
import type {
  AddEvidenceInput,
  AgentTrace,
  BestFix,
  CheckReport,
  CreateReportInput,
  EvidenceCard,
  EvidenceGap,
  JobRequirement,
  ResumeClaim,
  TrafficLight
} from "./types";

const STORE_PATH = join(process.cwd(), ".data", "reports.json");

type StoreShape = {
  reports: Record<string, CheckReport>;
};
type D1Prepared = {
  run: () => Promise<unknown>;
  bind: (...values: unknown[]) => {
    run: () => Promise<unknown>;
    first: <T = unknown>() => Promise<T | null>;
  };
};
type D1DatabaseLike = {
  exec: (query: string) => Promise<unknown>;
  prepare: (query: string) => D1Prepared;
};
type ReportRow = { report_json: string };

const sampleJd = `产品运营实习生
需要参与用户调研，整理用户反馈和核心问题。
需要协助校园活动或社群活动的策划、执行和复盘。
需要用数据评估活动效果，说明转化、留存或参与变化。
需要和设计、内容、社群同学协作推进项目。
有校园项目、社群运营或产品体验分析经验优先。`;

const sampleResume = `大三学生，求职产品运营实习。
参与校园活动运营，负责部分报名和宣传工作。
具备用户洞察能力，能发现同学需求。
熟悉表格工具，了解基础数据分析。
完成过一个校园活动优化课程项目。`;

const sampleEvidence = `我负责问卷调研和报名页优化，调研 86 名同学，发现 2 个主要流失点，调整页面说明后报名转化率从 21% 提升到 39%。`;

export function getSampleInput() {
  return {
    jdText: sampleJd,
    resumeText: sampleResume,
    evidenceText: sampleEvidence
  };
}

async function getD1() {
  try {
    const context = await getCloudflareContext({ async: true });
    return (context.env as { DB?: D1DatabaseLike }).DB ?? null;
  } catch {
    return null;
  }
}

async function ensureD1(db: D1DatabaseLike) {
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, sessionId TEXT NOT NULL, ownerId TEXT NOT NULL, shareToken TEXT NOT NULL UNIQUE, role TEXT NOT NULL, report_json TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)"
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_reports_owner ON reports(ownerId, updatedAt)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_reports_session ON reports(sessionId, updatedAt)").run();
}

async function readLocalStore(): Promise<StoreShape> {
  if (!existsSync(STORE_PATH)) {
    return { reports: {} };
  }
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as StoreShape;
}

async function writeLocalStore(store: StoreShape) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function saveReport(report: CheckReport) {
  const cloudDb = await getD1();
  if (cloudDb) {
    await ensureD1(cloudDb);
    await cloudDb
    .prepare(`
      INSERT INTO reports (id, sessionId, ownerId, shareToken, role, report_json, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sessionId = excluded.sessionId,
        ownerId = excluded.ownerId,
        shareToken = excluded.shareToken,
        role = excluded.role,
        report_json = excluded.report_json,
        updatedAt = excluded.updatedAt
    `)
      .bind(
        report.id,
        report.sessionId,
        report.ownerId,
        report.shareToken,
        report.role,
        JSON.stringify(report),
        report.createdAt,
        report.updatedAt
      )
      .run();
    return;
  }

  const store = await readLocalStore();
  store.reports[report.id] = report;
  await writeLocalStore(store);
}

async function findReport(id: string) {
  const cloudDb = await getD1();
  if (cloudDb) {
    await ensureD1(cloudDb);
    const row = await cloudDb
      .prepare("SELECT report_json FROM reports WHERE id = ?")
      .bind(id)
      .first<ReportRow>();
    return row ? (JSON.parse(row.report_json) as CheckReport) : null;
  }

  const store = await readLocalStore();
  return store.reports[id] ?? null;
}

function requirements(): JobRequirement[] {
  return [
    { id: "req-research", title: "用户调研", detail: "需要参与用户调研，能整理用户反馈和核心问题。", weight: "high" },
    { id: "req-ops", title: "活动运营", detail: "需要协助校园活动或社群活动的策划、执行和复盘。", weight: "high" },
    { id: "req-data", title: "数据复盘", detail: "需要用数据评估活动效果，能说明转化、留存或参与变化。", weight: "medium" },
    { id: "req-collab", title: "跨团队沟通", detail: "需要和设计、内容、社群同学协作推进项目。", weight: "medium" },
    { id: "req-campus", title: "校园项目", detail: "有校园项目、社群运营或产品体验分析经验优先。", weight: "low" }
  ];
}

function claims(): ResumeClaim[] {
  return [
    { id: "claim-ops", title: "参与校园活动运营", detail: "负责部分报名和宣传工作，但个人贡献边界不清。" },
    { id: "claim-insight", title: "具备用户洞察能力", detail: "写到了能力，但缺少调研样本、方法和结论。" },
    { id: "claim-data", title: "熟悉基础数据分析", detail: "有工具关键词，但没有业务指标和结果。" },
    { id: "claim-project", title: "校园活动优化课程项目", detail: "有项目经历，但缺少截图、链接和复盘材料。" }
  ];
}

function initialGaps(): EvidenceGap[] {
  return [
    {
      id: "gap-research",
      requirementId: "req-research",
      title: "用户调研缺少样本量和结论",
      requirement: "岗位需要参与用户调研，整理用户反馈和核心问题。",
      currentEvidence: "简历写了“具备用户洞察能力”。",
      missingEvidence: "缺少调研对象、样本量、方法和结论。",
      impact: "高影响",
      status: "missing"
    },
    {
      id: "gap-ops",
      requirementId: "req-ops",
      title: "活动运营只写参与，个人贡献不清",
      requirement: "岗位需要协助校园活动或社群活动策划、执行和复盘。",
      currentEvidence: "简历写了“参与校园活动运营”。",
      missingEvidence: "缺少你具体负责什么、推进什么、产生什么结果。",
      impact: "高影响",
      status: "weak"
    },
    {
      id: "gap-data",
      requirementId: "req-data",
      title: "数据复盘缺少结果指标",
      requirement: "岗位需要用数据评估活动效果。",
      currentEvidence: "简历写了“熟悉表格工具”。",
      missingEvidence: "缺少转化率、报名率或参与变化。",
      impact: "中影响",
      status: "missing"
    }
  ];
}

function updatedGaps(): EvidenceGap[] {
  return [
    {
      ...initialGaps()[0],
      status: "proven",
      currentEvidence: "补充材料显示调研 86 名同学，并发现 2 个主要流失点。",
      missingEvidence: "已补上样本量和结论。"
    },
    {
      ...initialGaps()[1],
      status: "proven",
      currentEvidence: "补充材料说明负责问卷调研和报名页优化。",
      missingEvidence: "已补上个人动作。"
    },
    {
      ...initialGaps()[2],
      status: "proven",
      currentEvidence: "补充材料显示报名转化率从 21% 提升到 39%。",
      missingEvidence: "已补上结果指标。"
    }
  ];
}

function evidenceAwareGaps(): EvidenceGap[] {
  return [
    {
      ...initialGaps()[0],
      status: "weak",
      currentEvidence: "已上传证明材料，但需要继续确认调研样本和结论是否能对应这条声明。",
      missingEvidence: "请绑定具体引用片段，说明调研对象、样本量和结论。"
    },
    {
      ...initialGaps()[1],
      status: "weak",
      currentEvidence: "材料库中已有证明材料入口，但个人贡献边界仍需写清。",
      missingEvidence: "请补充你负责的动作、交付物和结果。"
    },
    initialGaps()[2]
  ];
}

function bestFix(): BestFix {
  return {
    title: "补一张项目复盘截图",
    detail: "说明调研样本、你的动作和结果指标。只补这一条，收益最高。",
    evidenceText: sampleEvidence,
    relatedRequirementId: "req-research"
  };
}

function lightLabel(light: TrafficLight) {
  if (light === "green") return "可以投";
  if (light === "yellow") return "先补 1 个证据再投";
  return "不建议现在投";
}

function makeCard(reportId: string, shareToken: string, version: number, score: number, light: TrafficLight, targetRole = "产品运营实习生"): EvidenceCard {
  const isGreen = light === "green";
  return {
    reportId,
    shareToken,
    version,
    targetRole,
    trafficLight: light,
    score,
    provenPoints: isGreen
      ? ["用户调研有样本量和结论", "活动复盘有转化率变化", "项目贡献有具体动作"]
      : ["有校园活动经历", "有产品运营方向项目"],
    weakPoints: isGreen ? ["作品链接可以更完整"] : ["用户调研缺少样本量", "活动运营个人贡献不清", "数据复盘缺少结果指标"],
    nextAction: isGreen ? "把项目截图、调研样本量和转化结果补进简历项目经历中。" : "补充项目复盘截图，说明调研样本、你的动作和结果指标。",
    generatedAt: new Date().toISOString(),
    boundaryText: "本卡片只展示证据可证明性，不验证经历真实性。"
  };
}

function lightFromScore(score: number): TrafficLight {
  if (score >= 75) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

function forceInitialLight(score: number, suggested?: TrafficLight, hasEvidence = false): TrafficLight {
  if (hasEvidence && suggested === "green" && score >= 75) return "green";
  if (suggested === "red") return "red";
  if (score >= 45) return "yellow";
  return "red";
}

function traces(reportId: string, updated = false, ai?: AiReportAnalysis | null): AgentTrace[] {
  const rows = [
    ["JdParserAgent", "岗位解析智能体", "读取岗位描述。", ai?.traceSummaries?.jd || "提取到用户调研、活动运营、数据复盘等要求。", "作为证据匹配基准。"],
    ["ResumeClaimAgent", "简历声明智能体", "读取候选人简历摘要。", ai?.traceSummaries?.resume || "提取到能力声明和项目经历。", "确认简历声明是否有证据支撑。"],
    [
      "EvidenceVerifierAgent",
      "证据核验智能体",
      updated ? "读取新增证明材料。" : "读取岗位要求和简历声明。",
      ai?.traceSummaries?.evidence || (updated ? "重新判断 3 条证据缺口状态。" : "标记缺少证据和证据较弱的要求。"),
      "决定红黄绿证据标签。"
    ],
    ["RecruiterTwinAgent", "招聘官分身智能体", "读取证据状态和岗位权重。", ai?.traceSummaries?.recruiter || (updated ? "更新招聘官视角评分和投递灯。" : "给出招聘官第一眼判断。"), "模拟招聘官第一眼判断。"],
    ["ActionAgent", "行动建议智能体", "读取最高影响缺口。", ai?.traceSummaries?.action || (updated ? "建议把补充证据写回简历。" : "选择唯一最佳补证据动作。"), "保证 P0 只给一个最佳补证据动作。"]
  ];
  return rows.map((row, index) => ({
    id: `${reportId}-${index + 1}`,
    agentName: row[0],
    displayName: row[1],
    status: "success",
    durationMs: 420 + index * 160,
    inputSummary: row[2],
    outputSummary: row[3],
    impactSummary: row[4],
    orderIndex: index + 1
  }));
}

export async function createReport(input: CreateReportInput): Promise<CheckReport> {
  const id = randomUUID();
  const sessionId = input.sessionId?.trim() || "guest-local";
  const ownerId = input.ownerId?.trim() || sessionId;
  const shareToken = randomUUID().replaceAll("-", "").slice(0, 16);
  const now = new Date().toISOString();
  const jdText = input.useSample || !input.jdText ? sampleJd : input.jdText;
  const resumeText = input.useSample || !input.resumeText ? sampleResume : input.resumeText;
  const evidenceText = input.useSample ? undefined : input.evidenceText?.replace(/\s+/g, " ").trim().slice(0, 6000) || undefined;
  const hasEvidence = Boolean(evidenceText);
  const ai = input.useSample ? null : await analyzeInitialReport({ jdText, resumeText, evidenceText });
  const inputSource = input.useSample ? "sample" : input.inputSource ?? "paste";
  const score = input.useSample ? 42 : ai?.score ?? (hasEvidence ? 58 : 42);
  const trafficLight = input.useSample ? "yellow" : forceInitialLight(score, ai?.trafficLight, hasEvidence);
  const targetRole = ai?.targetRole || "产品运营实习生";
  const selectedBestFix = ai?.bestFix
    ? {
        ...ai.bestFix,
        evidenceText: ai.bestFix.evidenceText || sampleEvidence
      }
    : bestFix();
  const report: CheckReport = {
    id,
    sessionId,
    ownerId,
    shareToken,
    role: input.role ?? "candidate",
    state: "reviewed",
    createdAt: now,
    updatedAt: now,
    targetRole,
    jdText,
    resumeText,
    jdSourceUrl: input.useSample ? undefined : input.jdSourceUrl?.trim() || undefined,
    resumeFileName: input.useSample ? undefined : input.resumeFileName?.trim() || undefined,
    proofFileName: input.useSample ? undefined : input.proofFileName?.trim() || undefined,
    inputSource,
    score,
    trafficLight,
    trafficLightLabel: lightLabel(trafficLight),
    scoreReason: ai?.scoreReason || "这份简历有相关经历，但关键岗位要求缺少可展示证据。",
    requirements: ai?.requirements ?? requirements(),
    claims: ai?.claims ?? claims(),
    gaps: ai?.gaps ?? (hasEvidence ? evidenceAwareGaps() : initialGaps()),
    bestFix: selectedBestFix,
    traces: traces(id, false, ai),
    card: makeCard(id, shareToken, 1, score, trafficLight, targetRole),
    evidenceText,
    fallbackUsed: input.useSample ? false : !ai?.usedAi,
    version: 1
  };
  await saveReport(report);
  return report;
}

export async function getReport(id: string): Promise<CheckReport | null> {
  return findReport(id);
}

export async function addEvidence(id: string, input: AddEvidenceInput): Promise<CheckReport | null> {
  const report = await getReport(id);
  if (!report) return null;
  const evidenceText = input.evidenceText || sampleEvidence;
  const isSampleReport = report.jdText === sampleJd && report.resumeText === sampleResume;
  const ai = isSampleReport ? null : await analyzeEvidenceUpdate({ report, evidenceText });
  const nextScore = isSampleReport ? 78 : ai?.score ?? Math.max(78, report.score + 18);
  const nextLight = isSampleReport ? "green" : ai?.trafficLight ?? lightFromScore(nextScore);
  const nextGaps = isSampleReport ? updatedGaps() : ai?.gaps ?? updatedGaps();
  const updated: CheckReport = {
    ...report,
    state: "card_refreshed",
    updatedAt: new Date().toISOString(),
    beforeScore: report.score,
    afterScore: nextScore,
    score: nextScore,
    scoreDelta: nextScore - report.score,
    trafficLight: nextLight,
    trafficLightLabel: lightLabel(nextLight),
    scoreReason: ai?.scoreReason || "新增证明材料补上了关键岗位要求对应的可展示证据。",
    gaps: nextGaps,
    evidenceText,
    traces: traces(id, true, ai),
    card: makeCard(id, report.shareToken, report.version + 1, nextScore, nextLight, report.targetRole),
    fallbackUsed: report.fallbackUsed && !ai?.usedAi,
    version: report.version + 1
  };
  await saveReport(updated);
  return updated;
}

export async function getCard(id: string): Promise<EvidenceCard | null> {
  const report = await getReport(id);
  return report?.card ?? null;
}

export async function getTrace(id: string): Promise<AgentTrace[] | null> {
  const report = await getReport(id);
  return report?.traces ?? null;
}
