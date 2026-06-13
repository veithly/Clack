"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Cpu, Database, EyeOff, Gauge, RotateCcw, ShieldCheck } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { displayEngine } from "@/lib/pipeline-meta";
import type { AgentTrace, CheckReport } from "@/lib/types";

function depthLabel(depth: CheckReport["pipelineDepth"]) {
  if (depth === "ai") return "全模型推理";
  if (depth === "hybrid") return "模型 + 规则混合";
  return "规则兜底";
}

export function TraceClient({ initialTrace, report, reportId }: { initialTrace: AgentTrace[] | null; report: CheckReport | null; reportId: string }) {
  const trace = initialTrace ?? [];
  if (!report || trace.length === 0) {
    return (
      <main className="app-shell compact">
        <section className="panel empty-state">
          <h1>没有找到这份判断依据</h1>
          <p>回到候选人台重新做一次咔哒，完成后这里会显示每一步输入、输出和规则来源。</p>
          <Link className="primary-link" href="/candidate" data-empty-cta="回到咔哒台">回到咔哒台</Link>
        </section>
      </main>
    );
  }
  return (
    <main className="app-shell commercial-shell" data-testid="screen-trace">
      <header className="topbar commercial-topbar">
        <Link className="link-reset" href={`/result/${reportId}`}>
          <BrandLockup title="判断依据" subtitle="每个结论都能追到输入摘要、输出摘要和规则来源" />
        </Link>
        <div className="boundary-note">不展示完整隐私原文，只展示审计摘要</div>
      </header>
      <section className="trace-summary panel" data-testid="trace-report-summary">
        <div><span>目标岗位</span><b>{report.targetRole}</b></div>
        <div><span>推理步数</span><b>{trace.length} 步</b></div>
        <div><span>分析引擎</span><b>{depthLabel(report.pipelineDepth)}</b></div>
        <div><span>综合置信度</span><b>{report.confidence ?? "—"}%</b></div>
        <div><span>总耗时</span><b>{trace.reduce((sum, item) => sum + item.durationMs, 0)} ms</b></div>
        <div><span>报告版本</span><b>v{report.version}</b></div>
      </section>
      <section className="audit-flow" data-testid="agent-trace-timeline">
        {trace.map((item) => (
          <AuditCard item={item} key={item.id} />
        ))}
      </section>
      <div className="trace-actions">
        <Link className="primary-link" href={`/result/${reportId}`}>返回体检结果</Link>
        <Link className="secondary-link" href={`/card/${reportId}`}>查看求职证据卡</Link>
      </div>
    </main>
  );
}

function AuditCard({ item }: { item: AgentTrace }) {
  const isFallback = item.status === "fallback";
  const isFailed = item.status === "failed";
  return (
    <article className="panel audit-card" data-testid="agent-trace-node">
      <div className="audit-rail">
        <span>{item.orderIndex}</span>
      </div>
      <div className="audit-content">
        <div className="trace-card-head">
          <div>
            <h2>{item.displayName}</h2>
            {item.role ? <p className="trace-role">{item.role}</p> : null}
          </div>
          <div className="trace-head-tags">
            {typeof item.confidence === "number" ? <span className="trace-conf"><Gauge size={13} />{item.confidence}%</span> : null}
            <span className={`status-pill ${isFailed ? "red" : isFallback ? "yellow" : "green"}`} data-testid="agent-trace-status">
              {isFallback || isFailed ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
              {isFailed ? "已降级" : isFallback ? "规则兜底" : "模型完成"}
            </span>
          </div>
        </div>
        <div className="audit-grid">
          <p data-testid="agent-input-summary"><Database size={16} /><b>输入摘要</b>{item.inputSummary}</p>
          <p data-testid="agent-output-summary"><RotateCcw size={16} /><b>输出摘要</b>{item.outputSummary}</p>
          <p data-testid="agent-impact-summary"><ShieldCheck size={16} /><b>判断影响</b>{item.impactSummary}</p>
          <p><EyeOff size={16} /><b>敏感字段</b>命中年龄、照片、婚育等字段一律忽略，不参与判断。</p>
        </div>
        {item.findings?.length ? (
          <ul className="trace-findings" data-testid="agent-findings">
            {item.findings.map((finding) => <li key={finding}><Cpu size={13} />{finding}</li>)}
          </ul>
        ) : null}
        <small data-testid="agent-duration"><Clock size={14} />耗时 {item.durationMs} 毫秒 · 引擎：{displayEngine(item.engine) || "模型抽取 + 规则计算"}</small>
      </div>
    </article>
  );
}
