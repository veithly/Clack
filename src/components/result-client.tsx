"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileCheck2,
  Lightbulb,
  Loader2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Volume2
} from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { statusText } from "@/lib/demo-data";
import type { CheckReport, EvidenceGap, JobRequirement, ResumeClaim } from "@/lib/types";

export function ResultClient({ initialReport, reportId }: { initialReport: CheckReport | null; reportId: string }) {
  const [report, setReport] = useState<CheckReport | null>(initialReport);
  const [evidenceText, setEvidenceText] = useState(report?.bestFix.evidenceText ?? "");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [isRechecking, setIsRechecking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState("");

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

  async function speakReport() {
    if (!report || isSpeaking) return;
    setIsSpeaking(true);
    setTtsError("");
    try {
      const risk = report.gaps.find((gap) => gap.status !== "proven")?.title ?? report.card.nextAction;
      const text = `咔哒结果：当前岗位是${report.targetRole}，岗位证据就绪度为${report.score}分，建议是${report.trafficLightLabel}。主要原因是${risk}。下一步只做这一件事：${report.card.nextAction}`;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style: "清晰、冷静、有判断力" })
      });
      if (!res.ok) throw new Error("tts failed");
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => URL.revokeObjectURL(audio.src);
      await audio.play();
    } catch {
      setTtsError("语音播报生成失败，请稍后重试。");
    } finally {
      setIsSpeaking(false);
    }
  }

  if (!report) {
    return (
      <main className="app-shell compact">
        <HeaderLite />
        <section className="panel empty-state">
          <h2>没有找到这份体检报告</h2>
          <p>回到首页重新做一次咔哒。</p>
          <Link className="primary-link" href="/" data-empty-cta="回到咔哒台">回到咔哒台</Link>
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
                <GapCard gap={gap} key={gap.id} />
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
            <button className="secondary-button wide min-h-11 min-w-11" onClick={speakReport} disabled={isSpeaking} data-testid="tts-report-button" type="button">
              {isSpeaking ? <Loader2 className="spin" size={18} /> : <Volume2 size={18} />}
              {isSpeaking ? "正在生成播报" : "听体检结论"}
            </button>
            {ttsError ? <p className="inline-error compact" data-testid="tts-error">{ttsError}</p> : null}
          </section>
        </aside>
      </section>

      <section className="panel recruiter-strip">
        <ShieldCheck size={20} />
        <div>
          <h2>招聘官会看到什么</h2>
          <p>{isGreen ? "新增证明材料让贡献、样本量和结果指标更清楚，招聘官可以围绕证据追问。" : "招聘官会看到证据缺口和待追问点，但不会看到自动淘汰建议。"}</p>
        </div>
        <span className="status-pill neutral">报告编号：{reportId.slice(0, 8)}</span>
      </section>

      <div className="mobile-sticky-action result-mobile-actions">
        <button className="primary-button min-h-11 min-w-11" onClick={recheck} disabled={isRechecking || isGreen || !evidenceText.trim()} type="button">补最佳证据</button>
        <Link className="secondary-link" href={`/card/${report.id}`}>查看证据卡</Link>
      </div>
    </main>
  );
}

function GapCard({ gap }: { gap: EvidenceGap }) {
  return (
    <article className={`gap-card ${gap.status}`} data-testid="evidence-gap-item">
      <div className="gap-top">
        <span className={`evidence-badge ${gap.status === "proven" ? "green" : gap.status === "weak" ? "yellow" : "red"}`}>
          {gap.status === "proven" ? "有直接证据" : gap.status === "weak" ? "证据弱或间接" : "无证据支撑"}
        </span>
        <span>{gap.impact}</span>
      </div>
      <h3>{gap.title}</h3>
      <p>{gap.currentEvidence}</p>
      <details data-testid="evidence-gap-detail">
        <summary>查看岗位依据和补充建议</summary>
        <p><b>岗位要求：</b>{gap.requirement}</p>
        <p><b>建议材料：</b>{gap.missingEvidence}</p>
      </details>
    </article>
  );
}

function HeaderLite() {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup subtitle="岗位证据就绪度报告" />
      </Link>
      <nav className="top-nav" aria-label="结果页导航">
        <Link href="/">候选人</Link>
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
