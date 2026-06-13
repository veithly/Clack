module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/lib/ai-provider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultAiModel",
    ()=>getDefaultAiModel,
    "getOpenAIClient",
    ()=>getOpenAIClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
;
function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) return null;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined
    });
}
function getDefaultAiModel() {
    return process.env.OPENAI_DEFAULT_MODEL || "gpt-4.1-mini";
}
}),
"[project]/src/lib/ai-report.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeEvidenceUpdate",
    ()=>analyzeEvidenceUpdate,
    "analyzeInitialReport",
    ()=>analyzeInitialReport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-provider.ts [app-route] (ecmascript)");
;
;
const INITIAL_SYSTEM_PROMPT = `你是“投前体检”的服务端分析智能体。你只判断岗位要求、简历声明和证明材料之间的“可证明性”，不验证经历真假，不承诺录用概率，不做简历润色。

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
const EVIDENCE_SYSTEM_PROMPT = `你是“投前体检”的证据复核智能体。用户已经补充证明材料。你要判断新增材料是否补上原来的 3 个证据缺口。

只输出 JSON。字段同上，但 score 建议在 55-88 之间；gaps 必须恰好 3 条，status 可用 proven|weak|missing|risky。
不要验证经历真假，只判断材料是否能支撑简历声明。`;
function stripCodeFence(text) {
    return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}
function parseJson(text) {
    try {
        return JSON.parse(stripCodeFence(text));
    } catch  {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch  {
            return null;
        }
    }
}
function cleanText(value, maxLength) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
function clampScore(value, min, max) {
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number)) return undefined;
    return Math.max(min, Math.min(max, Math.round(number)));
}
function normalizeTrafficLight(value) {
    if (value === "green" || value === "yellow" || value === "red") return value;
    return undefined;
}
function normalizeWeight(value) {
    if (value === "high" || value === "medium" || value === "low") return value;
    return "medium";
}
function normalizeImpact(value) {
    if (value === "高影响" || value === "中影响" || value === "低影响") return value;
    return "中影响";
}
function normalizeStatus(value, allowProven) {
    if (value === "proven" && allowProven) return "proven";
    if (value === "weak" || value === "missing" || value === "risky") return value;
    return allowProven ? "weak" : "missing";
}
function normalizeAnalysis(raw, allowProven) {
    const requirements = (raw.requirements ?? []).map((item, index)=>{
        const title = cleanText(item.title, 30);
        const detail = cleanText(item.detail, 120);
        if (!title || !detail) return null;
        return {
            id: `ai-req-${index + 1}`,
            title,
            detail,
            weight: normalizeWeight(item.weight)
        };
    }).filter((item)=>Boolean(item)).slice(0, 5);
    const claims = (raw.claims ?? []).map((item, index)=>{
        const title = cleanText(item.title, 34);
        const detail = cleanText(item.detail, 120);
        if (!title || !detail) return null;
        return {
            id: `ai-claim-${index + 1}`,
            title,
            detail
        };
    }).filter((item)=>Boolean(item)).slice(0, 5);
    const gaps = (raw.gaps ?? []).map((item, index)=>{
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
    }).filter((item)=>Boolean(item)).slice(0, 3);
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
        bestFix: bestFixTitle && bestFixDetail ? {
            title: bestFixTitle,
            detail: bestFixDetail,
            evidenceText: bestFixEvidence,
            relatedRequirementId: gaps[0]?.requirementId ?? requirements[0]?.id ?? "ai-req-1"
        } : undefined,
        traceSummaries: raw.traceSummaries
    };
}
async function requestAnalysis(systemPrompt, userPrompt, allowProven) {
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOpenAIClient"])();
    if (!client) return null;
    try {
        const response = await client.chat.completions.create({
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$provider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultAiModel"])(),
            temperature: 0.2,
            response_format: {
                type: "json_object"
            },
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        });
        const content = response.choices[0]?.message?.content;
        if (!content) return null;
        const parsed = parseJson(content);
        return parsed ? normalizeAnalysis(parsed, allowProven) : null;
    } catch  {
        return null;
    }
}
async function analyzeInitialReport(input) {
    const evidenceSection = input.evidenceText?.trim() ? `\n\n已上传证明材料：\n${input.evidenceText}` : "\n\n已上传证明材料：无。请只依据岗位 JD 和简历声明判断可证明性。";
    return requestAnalysis(INITIAL_SYSTEM_PROMPT, `岗位 JD：\n${input.jdText}\n\n简历文本：\n${input.resumeText}${evidenceSection}\n\n请输出投前体检 JSON。`, Boolean(input.evidenceText?.trim()));
}
async function analyzeEvidenceUpdate(input) {
    return requestAnalysis(EVIDENCE_SYSTEM_PROMPT, `岗位 JD：\n${input.report.jdText}\n\n简历文本：\n${input.report.resumeText}\n\n原证据缺口：\n${input.report.gaps.map((gap)=>`- ${gap.title}：${gap.missingEvidence}`).join("\n")}\n\n新增证明材料：\n${input.evidenceText}\n\n请输出复核后的投前体检 JSON。`, true);
}
}),
"[project]/src/lib/report-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEvidence",
    ()=>addEvidence,
    "createReport",
    ()=>createReport,
    "getCard",
    ()=>getCard,
    "getReport",
    ()=>getReport,
    "getSampleInput",
    ()=>getSampleInput,
    "getTrace",
    ()=>getTrace
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opennextjs$2f$cloudflare$2f$dist$2f$api$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@opennextjs/cloudflare/dist/api/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opennextjs$2f$cloudflare$2f$dist$2f$api$2f$cloudflare$2d$context$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$report$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-report.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const STORE_PATH = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(process.cwd(), ".data", "reports.json");
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
function getSampleInput() {
    return {
        jdText: sampleJd,
        resumeText: sampleResume,
        evidenceText: sampleEvidence
    };
}
async function getD1() {
    try {
        const context = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opennextjs$2f$cloudflare$2f$dist$2f$api$2f$cloudflare$2d$context$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCloudflareContext"])({
            async: true
        });
        return context.env.DB ?? null;
    } catch  {
        return null;
    }
}
async function ensureD1(db) {
    await db.prepare("CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, sessionId TEXT NOT NULL, ownerId TEXT NOT NULL, shareToken TEXT NOT NULL UNIQUE, role TEXT NOT NULL, report_json TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)").run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_reports_owner ON reports(ownerId, updatedAt)").run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_reports_session ON reports(sessionId, updatedAt)").run();
}
async function readLocalStore() {
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(STORE_PATH)) {
        return {
            reports: {}
        };
    }
    const raw = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(STORE_PATH, "utf8");
    return JSON.parse(raw);
}
async function writeLocalStore(store) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(STORE_PATH), {
        recursive: true
    });
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
async function saveReport(report) {
    const cloudDb = await getD1();
    if (cloudDb) {
        await ensureD1(cloudDb);
        await cloudDb.prepare(`
      INSERT INTO reports (id, sessionId, ownerId, shareToken, role, report_json, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sessionId = excluded.sessionId,
        ownerId = excluded.ownerId,
        shareToken = excluded.shareToken,
        role = excluded.role,
        report_json = excluded.report_json,
        updatedAt = excluded.updatedAt
    `).bind(report.id, report.sessionId, report.ownerId, report.shareToken, report.role, JSON.stringify(report), report.createdAt, report.updatedAt).run();
        return;
    }
    const store = await readLocalStore();
    store.reports[report.id] = report;
    await writeLocalStore(store);
}
async function findReport(id) {
    const cloudDb = await getD1();
    if (cloudDb) {
        await ensureD1(cloudDb);
        const row = await cloudDb.prepare("SELECT report_json FROM reports WHERE id = ?").bind(id).first();
        return row ? JSON.parse(row.report_json) : null;
    }
    const store = await readLocalStore();
    return store.reports[id] ?? null;
}
function requirements() {
    return [
        {
            id: "req-research",
            title: "用户调研",
            detail: "需要参与用户调研，能整理用户反馈和核心问题。",
            weight: "high"
        },
        {
            id: "req-ops",
            title: "活动运营",
            detail: "需要协助校园活动或社群活动的策划、执行和复盘。",
            weight: "high"
        },
        {
            id: "req-data",
            title: "数据复盘",
            detail: "需要用数据评估活动效果，能说明转化、留存或参与变化。",
            weight: "medium"
        },
        {
            id: "req-collab",
            title: "跨团队沟通",
            detail: "需要和设计、内容、社群同学协作推进项目。",
            weight: "medium"
        },
        {
            id: "req-campus",
            title: "校园项目",
            detail: "有校园项目、社群运营或产品体验分析经验优先。",
            weight: "low"
        }
    ];
}
function claims() {
    return [
        {
            id: "claim-ops",
            title: "参与校园活动运营",
            detail: "负责部分报名和宣传工作，但个人贡献边界不清。"
        },
        {
            id: "claim-insight",
            title: "具备用户洞察能力",
            detail: "写到了能力，但缺少调研样本、方法和结论。"
        },
        {
            id: "claim-data",
            title: "熟悉基础数据分析",
            detail: "有工具关键词，但没有业务指标和结果。"
        },
        {
            id: "claim-project",
            title: "校园活动优化课程项目",
            detail: "有项目经历，但缺少截图、链接和复盘材料。"
        }
    ];
}
function initialGaps() {
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
function updatedGaps() {
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
function evidenceAwareGaps() {
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
function bestFix() {
    return {
        title: "补一张项目复盘截图",
        detail: "说明调研样本、你的动作和结果指标。只补这一条，收益最高。",
        evidenceText: sampleEvidence,
        relatedRequirementId: "req-research"
    };
}
function lightLabel(light) {
    if (light === "green") return "可以投";
    if (light === "yellow") return "先补 1 个证据再投";
    return "不建议现在投";
}
function makeCard(reportId, shareToken, version, score, light, targetRole = "产品运营实习生") {
    const isGreen = light === "green";
    return {
        reportId,
        shareToken,
        version,
        targetRole,
        trafficLight: light,
        score,
        provenPoints: isGreen ? [
            "用户调研有样本量和结论",
            "活动复盘有转化率变化",
            "项目贡献有具体动作"
        ] : [
            "有校园活动经历",
            "有产品运营方向项目"
        ],
        weakPoints: isGreen ? [
            "作品链接可以更完整"
        ] : [
            "用户调研缺少样本量",
            "活动运营个人贡献不清",
            "数据复盘缺少结果指标"
        ],
        nextAction: isGreen ? "把项目截图、调研样本量和转化结果补进简历项目经历中。" : "补充项目复盘截图，说明调研样本、你的动作和结果指标。",
        generatedAt: new Date().toISOString(),
        boundaryText: "本卡片只展示证据可证明性，不验证经历真实性。"
    };
}
function lightFromScore(score) {
    if (score >= 75) return "green";
    if (score >= 45) return "yellow";
    return "red";
}
function forceInitialLight(score, suggested, hasEvidence = false) {
    if (hasEvidence && suggested === "green" && score >= 75) return "green";
    if (suggested === "red") return "red";
    if (score >= 45) return "yellow";
    return "red";
}
function traces(reportId, updated = false, ai) {
    const rows = [
        [
            "JdParserAgent",
            "岗位解析智能体",
            "读取岗位描述。",
            ai?.traceSummaries?.jd || "提取到用户调研、活动运营、数据复盘等要求。",
            "作为证据匹配基准。"
        ],
        [
            "ResumeClaimAgent",
            "简历声明智能体",
            "读取候选人简历摘要。",
            ai?.traceSummaries?.resume || "提取到能力声明和项目经历。",
            "确认简历声明是否有证据支撑。"
        ],
        [
            "EvidenceVerifierAgent",
            "证据核验智能体",
            updated ? "读取新增证明材料。" : "读取岗位要求和简历声明。",
            ai?.traceSummaries?.evidence || (updated ? "重新判断 3 条证据缺口状态。" : "标记缺少证据和证据较弱的要求。"),
            "决定红黄绿证据标签。"
        ],
        [
            "RecruiterTwinAgent",
            "招聘官分身智能体",
            "读取证据状态和岗位权重。",
            ai?.traceSummaries?.recruiter || (updated ? "更新招聘官视角评分和投递灯。" : "给出招聘官第一眼判断。"),
            "模拟招聘官第一眼判断。"
        ],
        [
            "ActionAgent",
            "行动建议智能体",
            "读取最高影响缺口。",
            ai?.traceSummaries?.action || (updated ? "建议把补充证据写回简历。" : "选择唯一最佳补证据动作。"),
            "保证 P0 只给一个最佳补证据动作。"
        ]
    ];
    return rows.map((row, index)=>({
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
async function createReport(input) {
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const sessionId = input.sessionId?.trim() || "guest-local";
    const ownerId = input.ownerId?.trim() || sessionId;
    const shareToken = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replaceAll("-", "").slice(0, 16);
    const now = new Date().toISOString();
    const jdText = input.useSample || !input.jdText ? sampleJd : input.jdText;
    const resumeText = input.useSample || !input.resumeText ? sampleResume : input.resumeText;
    const evidenceText = input.useSample ? undefined : input.evidenceText?.replace(/\s+/g, " ").trim().slice(0, 6000) || undefined;
    const hasEvidence = Boolean(evidenceText);
    const ai = input.useSample ? null : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$report$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeInitialReport"])({
        jdText,
        resumeText,
        evidenceText
    });
    const inputSource = input.useSample ? "sample" : input.inputSource ?? "paste";
    const score = input.useSample ? 42 : ai?.score ?? (hasEvidence ? 58 : 42);
    const trafficLight = input.useSample ? "yellow" : forceInitialLight(score, ai?.trafficLight, hasEvidence);
    const targetRole = ai?.targetRole || "产品运营实习生";
    const selectedBestFix = ai?.bestFix ? {
        ...ai.bestFix,
        evidenceText: ai.bestFix.evidenceText || sampleEvidence
    } : bestFix();
    const report = {
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
async function getReport(id) {
    return findReport(id);
}
async function addEvidence(id, input) {
    const report = await getReport(id);
    if (!report) return null;
    const evidenceText = input.evidenceText || sampleEvidence;
    const isSampleReport = report.jdText === sampleJd && report.resumeText === sampleResume;
    const ai = isSampleReport ? null : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$report$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeEvidenceUpdate"])({
        report,
        evidenceText
    });
    const nextScore = isSampleReport ? 78 : ai?.score ?? Math.max(78, report.score + 18);
    const nextLight = isSampleReport ? "green" : ai?.trafficLight ?? lightFromScore(nextScore);
    const nextGaps = isSampleReport ? updatedGaps() : ai?.gaps ?? updatedGaps();
    const updated = {
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
async function getCard(id) {
    const report = await getReport(id);
    return report?.card ?? null;
}
async function getTrace(id) {
    const report = await getReport(id);
    return report?.traces ?? null;
}
}),
"[project]/src/app/api/report/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/report-store.ts [app-route] (ecmascript)");
;
;
;
const SESSION_COOKIE = "tq_session";
function getSessionId(request) {
    const cookie = request.headers.get("cookie") ?? "";
    const found = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (found?.[1]) return {
        sessionId: decodeURIComponent(found[1]),
        isNew: false
    };
    return {
        sessionId: `guest-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}`,
        isNew: true
    };
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSampleInput"])());
}
async function POST(request) {
    const session = getSessionId(request);
    const input = await request.json().catch(()=>({}));
    const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$report$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createReport"])({
        ...input,
        sessionId: session.sessionId,
        ownerId: session.sessionId,
        role: "candidate"
    });
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(report);
    if (session.isNew) {
        response.cookies.set(SESSION_COOKIE, session.sessionId, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 14
        });
    }
    return response;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__108iqwg._.js.map