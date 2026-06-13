import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { runAnalysisPipeline, type PipelineEvent, type PipelineResult } from "./ai-pipeline";
import type { CheckReport, CreateReportInput, EvidenceCard, RecruiterVerdict, TrafficLight } from "./types";

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

// ---------------------------------------------------------------------------
// 产品护栏：分数、投递灯、证据卡、招聘官 stance 与最终灯保持一致
// ---------------------------------------------------------------------------

function lightLabel(light: TrafficLight) {
  if (light === "green") return "可以投";
  if (light === "yellow") return "先补 1 个证据再投";
  return "不建议现在投";
}

function lightFromScore(score: number): TrafficLight {
  if (score >= 75) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

function forceInitialLight(score: number, suggested: TrafficLight, hasEvidence: boolean): TrafficLight {
  if (hasEvidence && suggested === "green" && score >= 75) return "green";
  if (suggested === "red") return "red";
  if (score >= 45) return "yellow";
  return "red";
}

function reconcileVerdict(verdict: RecruiterVerdict, light: TrafficLight): RecruiterVerdict {
  const stance = light === "green" ? "advance" : light === "yellow" ? "hold" : "pass";
  if (verdict.stance === stance) return { ...verdict, stance };
  const headline =
    light === "green"
      ? "第一眼：可以进面，围绕证据追问即可"
      : light === "yellow"
        ? "第一眼：方向对，先补 1 条关键证据再投"
        : "第一眼：先补关键证据，暂不建议现在投";
  return { ...verdict, stance, headline };
}

function makeCard(
  reportId: string,
  shareToken: string,
  version: number,
  result: PipelineResult,
  score: number,
  light: TrafficLight
): EvidenceCard {
  const isGreen = light === "green";
  const proven = result.gaps.filter((gap) => gap.status === "proven").map((gap) => gap.title);
  const open = result.gaps.filter((gap) => gap.status !== "proven").map((gap) => gap.title);
  return {
    reportId,
    shareToken,
    version,
    targetRole: result.targetRole,
    trafficLight: light,
    score,
    provenPoints: proven.length ? proven.slice(0, 3) : isGreen ? ["关键要求已有可展示证据"] : ["有相关方向经历"],
    weakPoints: open.length ? open.slice(0, 3) : ["作品链接可以更完整"],
    nextAction: result.bestFix.detail || "补充项目复盘截图，说明调研样本、你的动作和结果指标。",
    generatedAt: new Date().toISOString(),
    boundaryText: "本卡片只展示证据可证明性，不验证经历真实性。"
  };
}

// ---------------------------------------------------------------------------
// 创建报告：跑流水线 → 套护栏 → 落库（支持流式进度回调）
// ---------------------------------------------------------------------------

export async function createReport(
  input: CreateReportInput,
  onEvent?: (event: PipelineEvent) => void | Promise<void>
): Promise<CheckReport> {
  const id = randomUUID();
  const sessionId = input.sessionId?.trim() || "guest-local";
  const ownerId = input.ownerId?.trim() || sessionId;
  const shareToken = randomUUID().replaceAll("-", "").slice(0, 16);
  const now = new Date().toISOString();
  const sampleMode = Boolean(input.useSample); // 载入演示样例文本
  const offlineDemo = Boolean(input.offline); // 离线稳定版：强制规则路径 + 固定分，断网兜底
  const jdText = sampleMode || !input.jdText ? sampleJd : input.jdText;
  const resumeText = sampleMode || !input.resumeText ? sampleResume : input.resumeText;
  // 演示样例首扫不带证据，保留“先红黄→补证据后变绿”的弧线；样例同样走真实模型。
  const evidenceText = sampleMode ? undefined : input.evidenceText?.replace(/\s+/g, " ").trim().slice(0, 6000) || undefined;
  const hasEvidence = Boolean(evidenceText);
  const inputSource = sampleMode ? "sample" : input.inputSource ?? "paste";

  const result = await runAnalysisPipeline({ jdText, resumeText, evidenceText, mode: "initial", offline: offlineDemo }, onEvent);

  const score = offlineDemo ? 42 : result.score;
  const trafficLight = offlineDemo ? "yellow" : forceInitialLight(score, result.trafficLight, hasEvidence);
  const recruiterVerdict = reconcileVerdict(result.recruiterVerdict, trafficLight);

  const report: CheckReport = {
    id,
    sessionId,
    ownerId,
    shareToken,
    role: input.role ?? "candidate",
    state: "reviewed",
    createdAt: now,
    updatedAt: now,
    targetRole: result.targetRole,
    jdText,
    resumeText,
    jdSourceUrl: sampleMode ? undefined : input.jdSourceUrl?.trim() || undefined,
    resumeFileName: sampleMode ? undefined : input.resumeFileName?.trim() || undefined,
    proofFileName: sampleMode ? undefined : input.proofFileName?.trim() || undefined,
    inputSource,
    score,
    trafficLight,
    trafficLightLabel: lightLabel(trafficLight),
    scoreReason: result.scoreReason,
    requirements: result.requirements,
    claims: result.claims,
    gaps: result.gaps,
    bestFix: { ...result.bestFix, evidenceText: result.bestFix.evidenceText || sampleEvidence },
    traces: result.traces,
    card: makeCard(id, shareToken, 1, result, score, trafficLight),
    evidenceText,
    fallbackUsed: offlineDemo ? false : !result.usedAi,
    version: 1,
    confidence: result.confidence,
    recruiterVerdict,
    evidenceBindings: result.evidenceBindings,
    pipelineDepth: result.pipelineDepth,
    offlineDemo
  };
  await saveReport(report);
  return report;
}

export async function getReport(id: string): Promise<CheckReport | null> {
  return findReport(id);
}

export async function addEvidence(
  id: string,
  input: { evidenceText: string },
  onEvent?: (event: PipelineEvent) => void | Promise<void>
): Promise<CheckReport | null> {
  const report = await getReport(id);
  if (!report) return null;
  const evidenceText = input.evidenceText || sampleEvidence;
  const offlineDemo = Boolean(report.offlineDemo);

  const result = await runAnalysisPipeline(
    { jdText: report.jdText, resumeText: report.resumeText, evidenceText, mode: "evidence", offline: offlineDemo, priorGaps: report.gaps },
    onEvent
  );

  const nextScore = offlineDemo ? 78 : result.score;
  const nextLight = offlineDemo ? "green" : result.trafficLight ?? lightFromScore(nextScore);
  const recruiterVerdict = reconcileVerdict(result.recruiterVerdict, nextLight);

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
    scoreReason: result.scoreReason,
    targetRole: report.targetRole,
    requirements: report.requirements.length ? report.requirements : result.requirements,
    claims: report.claims.length ? report.claims : result.claims,
    gaps: result.gaps,
    bestFix: { ...result.bestFix, evidenceText: result.bestFix.evidenceText || evidenceText },
    evidenceText,
    traces: result.traces,
    card: makeCard(report.id, report.shareToken, report.version + 1, { ...result, targetRole: report.targetRole }, nextScore, nextLight),
    fallbackUsed: report.fallbackUsed && !result.usedAi,
    version: report.version + 1,
    confidence: result.confidence,
    recruiterVerdict,
    evidenceBindings: result.evidenceBindings,
    pipelineDepth: result.pipelineDepth
  };
  await saveReport(updated);
  return updated;
}

export async function getCard(id: string): Promise<EvidenceCard | null> {
  const report = await getReport(id);
  return report?.card ?? null;
}

export async function getTrace(id: string) {
  const report = await getReport(id);
  return report?.traces ?? null;
}
