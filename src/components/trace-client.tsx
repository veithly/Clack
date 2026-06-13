"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Database, EyeOff, RotateCcw, ShieldCheck } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import type { AgentTrace, CheckReport } from "@/lib/types";

export function TraceClient({ initialTrace, report, reportId }: { initialTrace: AgentTrace[] | null; report: CheckReport | null; reportId: string }) {
  const trace = initialTrace ?? [];
  if (!report || trace.length === 0) {
    return (
      <main className="app-shell compact">
        <section className="panel empty-state">
          <h1>没有找到这份判断依据</h1>
          <p>回到首页重新做一次咔哒，完成后这里会显示每一步输入、输出和规则来源。</p>
          <Link className="primary-link" href="/" data-empty-cta="回到咔哒台">回到咔哒台</Link>
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
        <div><span>投递建议</span><b>{report.trafficLightLabel}</b></div>
        <div><span>证据就绪度</span><b>{report.score} 分</b></div>
        <div><span>报告版本</span><b>v{report.version}</b></div>
      </section>
      <section className="audit-flow" data-testid="agent-trace-timeline">
        {trace.map((item) => (
          <article className="panel audit-card" key={item.id} data-testid="agent-trace-node">
            <div className="audit-rail">
              <span>{item.orderIndex}</span>
            </div>
            <div className="audit-content">
              <div className="trace-card-head">
                <h2>{item.displayName}</h2>
                <span className="status-pill green" data-testid="agent-trace-status"><CheckCircle2 size={14} />已完成</span>
              </div>
              <div className="audit-grid">
                <p data-testid="agent-input-summary"><Database size={16} /><b>输入摘要</b>{item.inputSummary}</p>
                <p data-testid="agent-output-summary"><RotateCcw size={16} /><b>输出摘要</b>{item.outputSummary}</p>
                <p data-testid="agent-impact-summary"><ShieldCheck size={16} /><b>判断影响</b>{item.impactSummary}</p>
                <p><EyeOff size={16} /><b>敏感字段</b>如命中年龄、照片、婚育等字段，已忽略且不参与判断。</p>
              </div>
              <small data-testid="agent-duration"><Clock size={14} />耗时 {item.durationMs} 毫秒，来源：模型抽取 + 规则计算</small>
            </div>
          </article>
        ))}
      </section>
      <div className="trace-actions">
        <Link className="primary-link" href={`/result/${reportId}`}>返回体检结果</Link>
        <Link className="secondary-link" href={`/card/${reportId}`}>查看求职证据卡</Link>
      </div>
    </main>
  );
}
