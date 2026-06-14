"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Cpu,
  Eye,
  FileCheck2,
  Gauge,
  HelpCircle,
  Lightbulb,
  Link2,
  ListChecks,
  Loader2,
  LockKeyhole,
  MailX,
  RotateCcw,
  ShieldCheck,
  TimerReset,
  UserSearch,
  Workflow
} from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { MockInterviewPanel, MultiJobComparePanel, StarRewriteButton } from "@/components/result-actions";
import { statusText } from "@/lib/demo-data";
import { displayEngine } from "@/lib/pipeline-meta";
import type { AgentTrace, CheckReport, EvidenceBinding, EvidenceGap, JobRequirement, RecruiterVerdict, ResumeClaim } from "@/lib/types";

export function ResultClient({ initialReport, reportId }: { initialReport: CheckReport | null; reportId: string }) {
  const [report, setReport] = useState<CheckReport | null>(initialReport);
  const [evidenceText, setEvidenceText] = useState(report?.bestFix.evidenceText ?? "");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [isRechecking, setIsRechecking] = useState(false);

  async function recheck() {
    if (!evidenceText.trim() || !report || isRechecking) return;
    setIsRechecking(true);
    const res = await fetch(`/api/report/${report.id}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidenceText: evidenceLink ? `${evidenceText}\n链接：${evidenceLink}` : evidenceText })
    });
    const updated = (await res.json()) as CheckReport;
    window.setTimeout(() => {
      setReport(updated);
      setIsRechecking(false);
    }, 700);
  }

  if (!report) {
    return (
      <main className="app-shell compact">
        <HeaderLite />
        <section className="panel empty-state">
          <h2>没有找到这份体检报告</h2>
          <p>回到候选人台重新做一次咔哒。</p>
          <Link className="primary-link" href="/candidate" data-empty-cta="回到咔哒台">回到咔哒台</Link>
        </section>
      </main>
    );
  }

  const isGreen = report.trafficLight === "green";
  const matrix = buildMatrix(report.requirements, report.claims, report.gaps);

  return (
    <main className="app-shell commercial-shell" data-testid="screen-result">
      <HeaderLite />

      <section className={`readiness-hero ${report.trafficLight}`} data-testid="traffic-light-result">
        <div>
          <span className="status-pill blue">岗位证据就绪度</span>
          <h2>{report.targetRole}</h2>
          <p>{report.scoreReason}</p>
          <div className="source-receipt" data-testid="source-receipt">
            <span>{sourceLabel(report.inputSource)}</span>
            {report.jdSourceUrl ? <small>JD 链接：{shortUrl(report.jdSourceUrl)}</small> : null}
            {report.resumeFileName ? <small>简历文件：{report.resumeFileName}</small> : null}
            {report.proofFileName ? <small>证明材料：{report.proofFileName}</small> : null}
          </div>
        </div>
        <div className="readiness-meter">
          <div className="light-core" />
          <strong data-testid="score-number">{report.score}<small>分</small></strong>
          <span>{report.trafficLightLabel}</span>
          {report.scoreDelta ? <b className="delta-badge" data-testid="score-delta">+{report.scoreDelta}</b> : <em>补证据后预计可明显提升</em>}
          {typeof report.confidence === "number" ? (
            <small className="confidence-chip" data-testid="confidence-chip"><Gauge size={13} />判断置信度 {report.confidence}%</small>
          ) : null}
        </div>
        <div className="readiness-rules">
          <p><ShieldCheck size={16} />百分比只代表证据覆盖，不代表能力或录用概率。</p>
          <p><LockKeyhole size={16} />敏感身份信息不进入判断。</p>
          <p><Eye size={16} />企业只能看到你授权的只读证据卡。</p>
        </div>
      </section>

      <section className="result-workbench">
        <section className="panel matrix-panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><Activity size={20} />证据矩阵</div>
              <p>每行都能追到岗位要求、简历声明、证据状态和人工复核提示。</p>
            </div>
            <Link className="secondary-link" href={`/card/${report.id}`}>查看只读证据卡</Link>
          </div>
          <div className="evidence-matrix" data-testid="evidence-matrix">
            <div className="matrix-row matrix-head">
              <span>岗位要求</span>
              <span>候选人声明</span>
              <span>引用证据</span>
              <span>状态</span>
              <span>操作</span>
            </div>
            {matrix.map((row) => (
              <details className="matrix-row" key={row.requirement.id} open={row.gap.status !== "proven"}>
                <summary>
                  <span>{row.requirement.title}<small>{row.requirement.weight === "high" ? "高权重" : row.requirement.weight === "medium" ? "中权重" : "低权重"}</small></span>
                  <span>{row.claim.title}</span>
                  <span>{row.gap.currentEvidence}</span>
                  <b className={`matrix-status ${row.gap.status}`}>{statusText(row.gap.status)}</b>
                  <Link href={`/card/${report.id}`}>证据卡</Link>
                </summary>
                <div className="matrix-detail">
                  <p><b>岗位依据：</b>{row.gap.requirement}</p>
                  <p><b>仍需补充：</b>{row.gap.missingEvidence}</p>
                  <p><b>复核提示：</b>{row.gap.status === "proven" ? "面试中围绕证据追问即可。" : "需要候选人补充材料，不能据此自动淘汰。"}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <aside className="result-side">
          <section className="panel gaps-panel">
            <div className="panel-head clean">
              <div>
                <div className="panel-title"><AlertCircle size={20} />{isGreen ? "关键证据已补齐" : "3 个证据缺口"}</div>
                <p>只展示最影响当前岗位的缺口。</p>
              </div>
            </div>
            <div className="gap-stack" data-testid="evidence-gap-list">
              {report.gaps.map((gap) => (
                <GapCard gap={gap} reportId={reportId} key={gap.id} />
              ))}
            </div>
          </section>

          <section className="panel fix-panel" data-testid="best-fix-card">
            <span className="status-pill blue">最佳补证据动作</span>
            <h2>{isGreen ? "把证据写回简历项目经历" : report.bestFix.title}</h2>
            <p>{isGreen ? report.card.nextAction : report.bestFix.detail}</p>
            <label className="editor-label">
              证明材料说明
              <textarea
                data-testid="evidence-input"
                value={evidenceText}
                onChange={(event) => setEvidenceText(event.target.value)}
                aria-label="补充证明材料"
              />
            </label>
            <label className="editor-label">
              作品或截图链接
              <input value={evidenceLink} onChange={(event) => setEvidenceLink(event.target.value)} placeholder="可选，粘贴公开作品、报告或截图链接" />
            </label>
            <button className="secondary-button wide min-h-11 min-w-11" onClick={() => setEvidenceText(report.bestFix.evidenceText)} data-testid="use-evidence-button" type="button">
              <FileCheck2 size={18} />
              使用这条证明材料
            </button>
            <button className="primary-button wide min-h-11 min-w-11" onClick={recheck} disabled={isRechecking || isGreen || !evidenceText.trim()} data-testid="recheck-button" data-next-step-cta="刷新体检报告" type="button">
              {isRechecking ? <Loader2 className="spin" size={18} /> : <RotateCcw size={18} />}
              {isRechecking ? "正在刷新" : isGreen ? "报告已刷新" : "刷新体检报告"}
            </button>
            <div className="proof-links">
              <Link href={`/card/${report.id}`} data-testid="go-card-button"><Lightbulb size={18} />查看只读证据卡</Link>
              <Link href={`/trace/${report.id}`} data-testid="go-trace-button"><Activity size={18} />查看智能体轨迹</Link>
            </div>
          </section>
        </aside>
      </section>

      {report.traces?.length ? <AgentReadoutPanel traces={report.traces} report={report} reportId={reportId} /> : null}

      <section className="result-insights">
        {report.recruiterVerdict ? <RecruiterTwinPanel verdict={report.recruiterVerdict} reportId={reportId} /> : null}
        {report.evidenceBindings && report.evidenceBindings.length ? <EvidenceBindingPanel bindings={report.evidenceBindings} /> : null}
      </section>

      <section className="result-ai-actions">
        <MockInterviewPanel reportId={reportId} questions={report.recruiterVerdict?.interviewQuestions ?? []} />
        <MultiJobComparePanel reportId={reportId} currentRole={report.targetRole} />
      </section>

      <RecoveryPanel report={report} />

      <div className="mobile-sticky-action result-mobile-actions">
        <button className="primary-button min-h-11 min-w-11" onClick={recheck} disabled={isRechecking || isGreen || !evidenceText.trim()} type="button">补最佳证据</button>
        <Link className="secondary-link" href={`/card/${report.id}`}>查看证据卡</Link>
      </div>
    </main>
  );
}

function GapCard({ gap, reportId }: { gap: EvidenceGap; reportId: string }) {
  return (
    <article className={`gap-card ${gap.status}`} data-testid="evidence-gap-item">
      <div className="gap-top">
        <span className={`evidence-badge ${gap.status === "proven" ? "green" : gap.status === "weak" ? "yellow" : "red"}`}>
          {gap.status === "proven" ? "有直接证据" : gap.status === "weak" ? "证据弱或间接" : "无证据支撑"}
        </span>
        <span>{gap.impact}</span>
        {typeof gap.confidence === "number" ? <small className="gap-conf" data-testid="gap-confidence">置信 {gap.confidence}%</small> : null}
      </div>
      <h3>{gap.title}</h3>
      <p>{gap.currentEvidence}</p>
      <details data-testid="evidence-gap-detail">
        <summary>查看岗位依据和补充建议</summary>
        <p><b>岗位要求：</b>{gap.requirement}</p>
        <p><b>建议材料：</b>{gap.missingEvidence}</p>
      </details>
      {gap.status !== "proven" ? <StarRewriteButton reportId={reportId} gapId={gap.id} /> : null}
    </article>
  );
}

function RecruiterTwinPanel({ verdict, reportId }: { verdict: RecruiterVerdict; reportId: string }) {
  const stanceLabel = verdict.stance === "advance" ? "建议进面追问" : verdict.stance === "hold" ? "先补证据再投" : "先补关键证据";
  return (
    <section className="panel recruiter-twin" data-testid="recruiter-twin">
      <div className="recruiter-twin-head">
        <span className="status-pill blue"><UserSearch size={14} />招聘官视角</span>
        <span className={`stance-pill ${verdict.stance}`}>{stanceLabel}</span>
        <span className="recruiter-conf"><Gauge size={13} />置信度 {verdict.confidence}%</span>
      </div>
      <h2>{verdict.headline}</h2>
      <div className="recruiter-twin-grid">
        <div className="twin-col">
          <b className="twin-col-title good">第一眼亮点</b>
          <ul>{verdict.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="twin-col">
          <b className="twin-col-title warn">主要顾虑</b>
          <ul>{verdict.concerns.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="twin-col questions">
          <b className="twin-col-title"><HelpCircle size={14} />面试会追问</b>
          <ul>{verdict.interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>
      <p className="recruiter-boundary"><ShieldCheck size={14} />{verdict.boundary}（报告编号 {reportId.slice(0, 8)}）</p>
    </section>
  );
}

function EvidenceBindingPanel({ bindings }: { bindings: EvidenceBinding[] }) {
  return (
    <section className="panel binding-panel" data-testid="evidence-binding-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><Link2 size={20} />证据绑定</div>
          <p>每条声明背后到底有没有材料撑，绑定到具体引用片段。</p>
        </div>
      </div>
      <div className="binding-list">
        {bindings.map((binding) => (
          <article className={`binding-row ${binding.match}`} key={binding.id} data-testid="evidence-binding-item">
            <div className="binding-claim">
              <b>{binding.claimTitle}</b>
              <span className={`match-pill ${binding.match}`}>{matchLabel(binding.match)}</span>
            </div>
            <p className="binding-quote">“{binding.evidenceQuote}”</p>
            <div className="binding-foot">
              <small>{binding.note}</small>
              <b>{binding.confidence}%</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function matchLabel(match: EvidenceBinding["match"]) {
  if (match === "direct") return "直接支撑";
  if (match === "partial") return "部分支撑";
  return "暂无材料";
}

function depthLabel(depth: CheckReport["pipelineDepth"]) {
  if (depth === "ai") return "全模型推理";
  if (depth === "hybrid") return "模型 + 规则混合";
  return "规则兜底";
}

function traceStatusLabel(status: AgentTrace["status"]) {
  if (status === "failed") return "已降级";
  if (status === "fallback") return "规则兜底";
  return "模型完成";
}

function AgentReadoutPanel({ traces, report, reportId }: { traces: AgentTrace[]; report: CheckReport; reportId: string }) {
  const totalMs = traces.reduce((sum, item) => sum + item.durationMs, 0);
  const ordered = [...traces].sort((a, b) => a.orderIndex - b.orderIndex);
  const modelName = traces.find((item) => item.engine && item.engine !== "规则兜底")?.engine;
  const aiSteps = traces.filter((item) => item.status === "success" && item.engine && item.engine !== "规则兜底").length;
  const usedModel = aiSteps > 0;
  return (
    <section className="panel agent-readout" data-testid="agent-readout">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><Workflow size={20} />{traces.length} 智能体推理过程</div>
          <p>每一步点开都能看到输入、输出和判断影响——这份结论不是一次打分。</p>
        </div>
        <Link className="secondary-link" href={`/trace/${reportId}`}>完整判断依据</Link>
      </div>
      <div className={`readout-model-banner ${usedModel ? "ai" : ""}`} data-testid="readout-model-banner">
        <span className="model-chip"><Cpu size={15} />{modelName ? displayEngine(modelName) : depthLabel(report.pipelineDepth)}</span>
        <div className="model-banner-text">
          <b>{usedModel ? `本次由真实大模型完成 ${aiSteps}/${traces.length} 步推理` : depthLabel(report.pipelineDepth)}</b>
          <small>{depthLabel(report.pipelineDepth)} · 串行调用，逐步把岗位要求和你的证据对齐</small>
        </div>
        <div className="model-banner-stats">
          <span><TimerReset size={13} />{(totalMs / 1000).toFixed(1)}s</span>
          {typeof report.confidence === "number" ? <span><Gauge size={13} />综合置信 {report.confidence}%</span> : null}
        </div>
      </div>
      <ol className="readout-list" data-testid="agent-readout-list">
        {ordered.map((item) => (
          <li key={item.id}>
            <details className={`readout-row ${item.status}`} data-testid="agent-readout-row">
              <summary className="readout-summary">
                <span className="readout-index">{item.orderIndex}</span>
                <div className="readout-head">
                  <b>{item.displayName}</b>
                  <small>{item.role ?? item.outputSummary}</small>
                </div>
                {item.engine ? (
                  <span className={`readout-engine-chip ${item.engine === "规则兜底" ? "rule" : ""}`} data-testid="readout-engine-chip">
                    <Cpu size={11} />{displayEngine(item.engine)}
                  </span>
                ) : null}
                {typeof item.confidence === "number" ? (
                  <span className={`agent-conf ${item.status === "fallback" ? "fallback" : ""}`}>{item.confidence}%</span>
                ) : null}
                <span className={`readout-status ${item.status}`}>{traceStatusLabel(item.status)}</span>
              </summary>
              <div className="readout-detail">
                <p><b>输入</b>{item.inputSummary}</p>
                <p><b>输出</b>{item.outputSummary}</p>
                <p><b>影响</b>{item.impactSummary}</p>
                {item.findings?.length ? (
                  <ul className="readout-findings">
                    {item.findings.map((finding) => <li key={finding}><Cpu size={12} />{finding}</li>)}
                  </ul>
                ) : null}
                <small className="readout-engine"><Clock size={12} />{item.durationMs} ms · {displayEngine(item.engine) || "模型抽取 + 规则计算"}</small>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}

const STREAKS = [
  { id: "none", label: "正常投递", count: 0 },
  { id: "few", label: "投了 3 次没回复", count: 3 },
  { id: "many", label: "连续 5 次以上没回复", count: 5 }
] as const;

function RecoveryPanel({ report }: { report: CheckReport }) {
  const [streakId, setStreakId] = useState<(typeof STREAKS)[number]["id"]>("none");
  const streak = STREAKS.find((item) => item.id === streakId) ?? STREAKS[0];
  const lowBurden = streak.count >= 5;
  const openGaps = report.gaps.filter((gap) => gap.status !== "proven");
  const todoList = (openGaps.length ? openGaps : report.gaps).slice(0, 3);
  const single = openGaps[0] ?? report.gaps[0];

  return (
    <section className="panel recovery-panel" data-testid="recovery-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><MailX size={20} />投递节奏 · 低负担下一步</div>
          <p>连续没回复时，今天只做最有用的一件事，不做情绪诊断。</p>
        </div>
      </div>
      <div className="streak-row" role="group" aria-label="最近投递反馈">
        {STREAKS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`streak-chip ${item.id === streakId ? "active" : ""}`}
            onClick={() => setStreakId(item.id)}
            data-testid="streak-chip"
            aria-pressed={item.id === streakId}
          >
            {item.label}
          </button>
        ))}
      </div>
      {lowBurden ? (
        <div className="recovery-single" data-testid="recovery-single">
          <span className="status-pill warning"><TimerReset size={14} />今天只做这一件</span>
          <h3>{single?.title ?? report.bestFix.title}</h3>
          <p>{single ? single.missingEvidence : report.bestFix.detail}</p>
          <p className="recovery-boundary"><ShieldCheck size={14} />明天再补下一条。降载只为提高下次投递的信号，不替你判断情绪或能力。</p>
        </div>
      ) : (
        <div className="recovery-list" data-testid="recovery-list">
          <div className="recovery-list-head"><ListChecks size={15} />今天可以推进（{todoList.length}）</div>
          {todoList.map((gap) => (
            <article className="recovery-item" key={gap.id}>
              <b>{gap.title}</b>
              <span>{gap.missingEvidence}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function HeaderLite() {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup subtitle="岗位证据就绪度报告" />
      </Link>
      <nav className="top-nav" aria-label="结果页导航">
        <Link href="/candidate">候选人</Link>
        <Link href="/enterprise">企业</Link>
        <Link href="/school">高校</Link>
        <Link href="/admin">管理员</Link>
      </nav>
      <div className="boundary-note">只判断可证明性，不验证经历真实性</div>
    </header>
  );
}

function buildMatrix(requirements: JobRequirement[], claims: ResumeClaim[], gaps: EvidenceGap[]) {
  return requirements.slice(0, 5).map((requirement, index) => {
    const gap = gaps.find((item) => item.requirementId === requirement.id) ?? gaps[index % gaps.length];
    const claim = claims[index % claims.length];
    return { requirement, claim, gap };
  });
}

function sourceLabel(source: CheckReport["inputSource"]) {
  if (source === "sample") return "演示样例，现场路径稳定";
  if (source === "jd-url") return "岗位来自公开链接";
  if (source === "resume-file") return "简历来自上传文件";
  if (source === "mixed") return "岗位链接和简历文件已记录";
  return "岗位和简历来自粘贴文本";
}

function shortUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`.slice(0, 52);
  } catch {
    return value.slice(0, 52);
  }
}
