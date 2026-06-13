"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import type { EvidenceCard } from "@/lib/types";

export function CardClient({ initialCard, reportId }: { initialCard: EvidenceCard | null; reportId: string }) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/card/${reportId}`);
  }, [reportId]);

  async function copyShareLink() {
    try {
      await navigator.clipboard?.writeText(shareUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!initialCard) {
    return (
      <main className="app-shell compact">
        <section className="panel empty-state">
          <h1>没有找到这张证据卡</h1>
          <Link className="primary-link" href="/candidate" data-empty-cta="回到咔哒台">回到咔哒台</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell commercial-shell" data-testid="screen-card">
      <header className="topbar commercial-topbar">
        <Link className="link-reset" href={`/result/${reportId}`}>
          <BrandLockup title="求职证据卡" subtitle="只读分享，不暴露编辑入口" />
        </Link>
        <div className="boundary-note" data-testid="readonly-banner"><LockKeyhole size={16} />只读查看模式</div>
      </header>
      <section className="card-layout trusted-card-layout">
        <article className="evidence-card trusted-card" data-testid="evidence-card">
          <div className="card-trust-band">
            <span className="status-pill green" data-testid="card-traffic-light">{initialCard.trafficLight === "green" ? "可以投" : "先补证据"}</span>
            <span>可见范围：公开链接可见</span>
            <span>版本 v{initialCard.version}</span>
          </div>
          <div className="card-score-row">
            <div>
              <h2>{initialCard.targetRole}</h2>
              <p>岗位证据就绪度，只代表材料证据覆盖。</p>
            </div>
            <strong data-testid="card-score">{initialCard.score}<small>分</small></strong>
          </div>
          <section className="trusted-section">
            <h3>支撑声明</h3>
            <div className="card-list" data-testid="card-proven-list">
              {initialCard.provenPoints.map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>
          <section className="trusted-section">
            <h3>仍需人工追问</h3>
            <div className="card-list muted" data-testid="card-gap-list">
              {initialCard.weakPoints.map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>
          <section className="next-action" data-testid="card-next-action">
            <h3>下一步只做这一件事</h3>
            <p>{initialCard.nextAction}</p>
          </section>
          <div className="card-audit-grid">
            <div><b>来源</b><span>用户提供简历和证明材料</span></div>
            <div><b>生成时间</b><span>{new Date(initialCard.generatedAt).toLocaleString("zh-CN")}</span></div>
            <div><b>分享令牌</b><span>{initialCard.shareToken}</span></div>
            <div><b>编辑权限</b><span>无，仅候选人可回到工作台修改</span></div>
          </div>
          <p className="card-boundary" data-testid="card-boundary-note"><ShieldCheck size={16} />{initialCard.boundaryText} 此卡仅展示用户提供材料与系统解析关系，不证明材料真实。</p>
        </article>
        <aside className="panel share-panel">
          <div className="qr-box" data-testid="card-qrcode" aria-label="扫码查看求职证据卡">
            {shareUrl ? (
              <QRCodeSVG value={shareUrl} size={166} level="M" bgColor="#ffffff" fgColor="#0b0e16" marginSize={0} />
            ) : null}
          </div>
          <p className="qr-caption">扫码在手机上打开这张只读证据卡</p>
          <button className="primary-button wide min-h-11 min-w-11" type="button" data-testid="copy-card-link-button" data-next-step-cta="复制分享链接" onClick={copyShareLink}>
            <Copy size={18} />{copied ? "链接已复制" : "复制分享链接"}
          </button>
          <Link className="secondary-link" href={`/trace/${reportId}`}><ExternalLink size={18} />查看智能体轨迹</Link>
          <Link className="secondary-link" href={`/result/${reportId}`}>返回体检结果</Link>
        </aside>
      </section>
    </main>
  );
}
