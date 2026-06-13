"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  LockKeyhole,
  Play,
  Radar,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Upload
} from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { RolePermissionStrip } from "@/components/demo-user-switcher";
import { evidenceArtifacts, recentJobs } from "@/lib/demo-data";
import type { CheckReport } from "@/lib/types";

type SampleInput = {
  jdText: string;
  resumeText: string;
  evidenceText: string;
};

export function HomeClient() {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdSourceUrl, setJdSourceUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [proofText, setProofText] = useState("");
  const [importError, setImportError] = useState("");
  const [isImportingJd, setIsImportingJd] = useState(false);
  const [isReadingResume, setIsReadingResume] = useState(false);
  const [isReadingProof, setIsReadingProof] = useState(false);
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const canStart = jdText.trim().length > 40 && resumeText.trim().length > 30;
  const sourceCount = Number(Boolean(jdText.trim())) + Number(Boolean(resumeText.trim())) + Number(Boolean(proofFileName || proofText.trim()));

  async function loadSample() {
    const res = await fetch("/api/report");
    const data = (await res.json()) as SampleInput;
    setJdText(data.jdText);
    setResumeText(data.resumeText);
    setJdUrl("");
    setJdSourceUrl("");
    setResumeFileName("");
    setProofFileName("演示项目复盘证据");
    setProofText(data.evidenceText);
    setImportError("");
    setIsSampleLoaded(true);
  }

  async function importJdFromUrl() {
    if (!jdUrl.trim() || isImportingJd) return;
    setIsImportingJd(true);
    setImportError("");
    try {
      const res = await fetch("/api/import/jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl })
      });
      const data = (await res.json()) as { text?: string; sourceUrl?: string; error?: string };
      if (!res.ok || !data.text) {
        setImportError(data.error || "岗位链接读取失败，请复制 JD 文本。");
        return;
      }
      setJdText(data.text);
      setJdSourceUrl(data.sourceUrl || jdUrl);
      setIsSampleLoaded(false);
    } finally {
      setIsImportingJd(false);
    }
  }

  async function readResumeFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsReadingResume(true);
    setImportError("");
    try {
      const text = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        ? await extractPdfText(file)
        : await file.text();
      const cleaned = text.replace(/\s+/g, " ").trim();
      if (cleaned.length < 30) {
        setImportError("这份文件没有读到足够简历文字，请换 PDF/TXT 或直接粘贴。");
        return;
      }
      setResumeText(cleaned.slice(0, 8000));
      setResumeFileName(file.name);
      setIsSampleLoaded(false);
    } catch (error) {
      const detail = error instanceof Error ? error.message.slice(0, 90) : "未知错误";
      setImportError(`简历文件读取失败：${detail}。请换成可复制文字的 PDF/TXT。`);
    } finally {
      setIsReadingResume(false);
      event.target.value = "";
    }
  }

  async function readProofFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsReadingProof(true);
    setImportError("");
    try {
      const lowerName = file.name.toLowerCase();
      const canReadText = file.type.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md");
      const text = file.type === "application/pdf" || lowerName.endsWith(".pdf")
        ? await extractPdfText(file)
        : canReadText
          ? await file.text()
          : `用户已上传图片证明材料：${file.name}。候选人需要在只读证据卡中授权企业人工查看。`;
      const cleaned = text.replace(/\s+/g, " ").trim();
      setProofText(cleaned.slice(0, 6000));
      setProofFileName(file.name);
      setIsSampleLoaded(false);
    } catch (error) {
      const detail = error instanceof Error ? error.message.slice(0, 90) : "未知错误";
      setImportError(`证明材料读取失败：${detail}。可以先上传 TXT/PDF，图片材料会作为人工复核附件登记。`);
    } finally {
      setIsReadingProof(false);
      event.target.value = "";
    }
  }

  async function startCheck() {
    if (!canStart || isScanning) return;
    setIsScanning(true);
    const inputSource = isSampleLoaded ? "sample" : jdSourceUrl && resumeFileName ? "mixed" : jdSourceUrl ? "jd-url" : resumeFileName ? "resume-file" : "paste";
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, resumeText, jdSourceUrl, resumeFileName, proofFileName, evidenceText: proofText, inputSource, useSample: isSampleLoaded })
      });
      const report = (await res.json()) as CheckReport;
      router.push(`/result/${report.id}`);
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <main className="app-shell commercial-shell" data-testid="screen-home">
      <WorkbenchHeader />
      <RolePermissionStrip expected="candidate" />

      <section className="workspace-hero" aria-label="咔哒工作台">
        <div className="hero-copy">
          <span className="hero-label">岗位证据层</span>
          <h2>先看证据就绪度，再决定是否投递</h2>
          <p>导入岗位、简历和证明材料。系统只判断声明是否有证据支撑，不验证真假，不自动投递，不替企业做决定。</p>
          <div className="hero-actions">
            <button className="primary-button min-h-11 min-w-11" onClick={startCheck} disabled={!canStart || isScanning} data-testid="start-check-button" data-cta-primary="咔哒" type="button">
              {isScanning ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
              {isScanning ? "正在体检" : "开始体检"}
            </button>
            <button className="secondary-button min-h-11 min-w-11" onClick={loadSample} data-testid="demo-sample-button" type="button">
              <Sparkles size={18} />
              {isSampleLoaded ? "已载入样例" : "使用演示样例"}
            </button>
          </div>
        </div>
        <ScannerPanel isScanning={isScanning} canStart={canStart} onStart={startCheck} sourceCount={sourceCount} />
      </section>

      <section className="workbench-grid" aria-label="导入和证据护照">
        <JobCapturePanel
          jdUrl={jdUrl}
          jdText={jdText}
          jdSourceUrl={jdSourceUrl}
          isImportingJd={isImportingJd}
          onUrlChange={setJdUrl}
          onTextChange={(value) => {
            setJdText(value);
            setJdSourceUrl("");
            setIsSampleLoaded(false);
          }}
          onImport={importJdFromUrl}
        />

        <MaterialsPanel
          resumeText={resumeText}
          resumeFileName={resumeFileName}
          proofFileName={proofFileName}
          proofText={proofText}
          isReadingResume={isReadingResume}
          isReadingProof={isReadingProof}
          fileInputRef={fileInputRef}
          proofInputRef={proofInputRef}
          onResumeTextChange={(value) => {
            setResumeText(value);
            setResumeFileName("");
            setIsSampleLoaded(false);
          }}
          onResumeFile={readResumeFile}
          onProofFile={readProofFile}
        />

        <PassportPanel hasResume={Boolean(resumeText.trim())} hasProof={Boolean(proofFileName)} />
      </section>

      <ImportReceipts
        jdText={jdText}
        jdSourceUrl={jdSourceUrl}
        resumeText={resumeText}
        resumeFileName={resumeFileName}
        proofFileName={proofFileName}
      />

      {importError ? <div className="inline-error workbench-error" data-testid="import-error"><AlertCircle size={16} />{importError}</div> : null}

      <section className="commercial-bottom-grid" aria-label="最近岗位和试用空间">
        <RecentJobsPanel />
        <ActionPanel canStart={canStart} onStart={startCheck} />
        <DemoEntryPanel />
      </section>

      <div className="mobile-sticky-action">
        <button className="primary-button wide min-h-11 min-w-11" onClick={startCheck} disabled={!canStart || isScanning} type="button">
          {isScanning ? "正在体检" : "开始体检"}
        </button>
      </div>
    </main>
  );
}

function WorkbenchHeader() {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup subtitle="岗位证据层，不是简历润色器" />
      </Link>
      <nav className="top-nav" aria-label="主要页面">
        <Link href="/">候选人</Link>
        <Link href="/enterprise">企业</Link>
        <Link href="/school">高校</Link>
        <Link href="/admin">管理员</Link>
      </nav>
      <div className="boundary-note" data-testid="proof-boundary-note">
        <LockKeyhole size={16} />
        只判断可证明性，不验证经历真实性
      </div>
    </header>
  );
}

function JobCapturePanel(props: {
  jdUrl: string;
  jdText: string;
  jdSourceUrl: string;
  isImportingJd: boolean;
  onUrlChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onImport: () => void;
}) {
  const ready = props.jdText.trim().length > 40;
  return (
    <section className="panel capture-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><BriefcaseBusiness size={20} />岗位捕捉</div>
          <p>粘贴链接或岗位描述，系统会拆出岗位要求和证据偏好。</p>
        </div>
        <span className={ready ? "status-pill green" : "status-pill neutral"}>{ready ? "岗位已就绪" : "等待岗位"}</span>
      </div>
      <div className="capture-body">
        <label className="url-import">
          <span><Link2 size={16} />岗位链接</span>
          <input data-testid="jd-url-input" value={props.jdUrl} onChange={(event) => props.onUrlChange(event.target.value)} aria-label="公开岗位详情页 URL" placeholder="https://example.com/job/123" />
        </label>
        <button className="secondary-button min-h-11 min-w-11" onClick={props.onImport} disabled={props.isImportingJd || !props.jdUrl.trim()} data-testid="import-jd-url-button" type="button">
          {props.isImportingJd ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
          {props.isImportingJd ? "正在拉取" : "拉取岗位"}
        </button>
      </div>
      <textarea
        className="workbench-textarea"
        data-testid="jd-input"
        value={props.jdText}
        onChange={(event) => props.onTextChange(event.target.value)}
        aria-label="岗位描述"
        placeholder="也可以直接粘贴岗位 JD。"
      />
      <div className="source-summary">
        <span className={ready ? "receipt-chip done" : "receipt-chip"}>{props.jdSourceUrl ? "JD 已从链接拉取" : ready ? "岗位来自粘贴文本" : "等待岗位"}</span>
        <span className="receipt-chip">已输入 {props.jdText.length} 字</span>
      </div>
    </section>
  );
}

function ImportReceipts(props: {
  jdText: string;
  jdSourceUrl: string;
  resumeText: string;
  resumeFileName: string;
  proofFileName: string;
}) {
  const hasJd = props.jdText.trim().length > 40;
  const hasResume = props.resumeText.trim().length > 30;
  return (
    <div className="source-summary import-receipts-strip" data-testid="import-receipts" aria-label="导入收据">
      <span className={hasJd ? "receipt-chip done" : "receipt-chip"}>
        {props.jdSourceUrl ? "JD 已从链接拉取" : hasJd ? "岗位来自粘贴文本" : "等待岗位"}
      </span>
      <span className={hasResume ? "receipt-chip done" : "receipt-chip"}>
        {props.resumeFileName ? `简历文件：${props.resumeFileName}` : hasResume ? "简历已粘贴" : "等待简历"}
      </span>
      <span className={props.proofFileName ? "receipt-chip done" : "receipt-chip"}>
        {props.proofFileName ? `证明材料：${props.proofFileName}` : "证明材料可稍后补"}
      </span>
    </div>
  );
}

function MaterialsPanel(props: {
  resumeText: string;
  resumeFileName: string;
  proofFileName: string;
  proofText: string;
  isReadingResume: boolean;
  isReadingProof: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  proofInputRef: React.RefObject<HTMLInputElement | null>;
  onResumeTextChange: (value: string) => void;
  onResumeFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onProofFile: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const ready = props.resumeText.trim().length > 30;
  return (
    <section className="panel materials-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><FileText size={20} />简历与材料库</div>
          <p>简历只上传一次，后续岗位会复用同一份证据护照。</p>
        </div>
        <span className={ready ? "status-pill green" : "status-pill neutral"}>{ready ? "简历已解析" : "等待简历"}</span>
      </div>
      <div className="material-actions">
        <input ref={props.fileInputRef} className="hidden-file-input" type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" onChange={props.onResumeFile} data-testid="resume-file-input" />
        <input ref={props.proofInputRef} className="hidden-file-input" type="file" accept=".pdf,.txt,.md,.png,.jpg,.jpeg,text/plain,application/pdf,image/*" onChange={props.onProofFile} data-testid="proof-file-input" />
        <button className="secondary-button min-h-11 min-w-11" onClick={() => props.fileInputRef.current?.click()} disabled={props.isReadingResume} data-testid="upload-resume-button" type="button">
          {props.isReadingResume ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
          {props.isReadingResume ? "正在读取" : "上传简历"}
        </button>
        <button className="secondary-button min-h-11 min-w-11" onClick={() => props.proofInputRef.current?.click()} disabled={props.isReadingProof} type="button">
          {props.isReadingProof ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
          {props.isReadingProof ? "正在读取" : "上传证明材料"}
        </button>
        <Link className="secondary-link min-h-11 min-w-11" href="/passport">
          <ClipboardCheck size={18} />
          从证据护照选择
        </Link>
      </div>
      <textarea
        className="workbench-textarea"
        data-testid="resume-input"
        value={props.resumeText}
        onChange={(event) => props.onResumeTextChange(event.target.value)}
        aria-label="简历文本"
        placeholder="上传 PDF/TXT，或直接粘贴简历文本。"
      />
      <div className="material-list">
        {props.proofFileName ? (
          <article className="material-row uploaded-material">
            <span>证明</span>
            <div>
              <b>{props.proofFileName}</b>
              <small>{props.proofText ? `已读取 ${props.proofText.length} 字，可进入本次体检` : "已登记，等待解析"}</small>
            </div>
            <em>本次可用</em>
          </article>
        ) : null}
        {evidenceArtifacts.map((item) => (
          <article className="material-row" key={item.id}>
            <span>{item.type}</span>
            <div>
              <b>{item.title}</b>
              <small>{item.source}，{item.claims} 条声明，{item.evidenceLinks} 条引用</small>
            </div>
            <em>{item.status}</em>
          </article>
        ))}
      </div>
      <div className="source-summary">
        <span className={props.resumeFileName ? "receipt-chip done" : "receipt-chip"}>{props.resumeFileName ? `简历文件：${props.resumeFileName}` : ready ? "简历已粘贴" : "等待简历"}</span>
        <span className={props.proofFileName ? "receipt-chip done" : "receipt-chip"}>{props.proofFileName ? `证明材料：${props.proofFileName}` : "证明材料可稍后补"}</span>
      </div>
    </section>
  );
}

function PassportPanel({ hasResume, hasProof }: { hasResume: boolean; hasProof: boolean }) {
  const stats = [
    ["声明", hasResume ? "8" : "0"],
    ["已绑定证据", hasProof ? "6" : hasResume ? "2" : "0"],
    ["对外可见", hasProof ? "3" : "0"],
    ["待补证据", hasResume ? (hasProof ? "1" : "3") : "0"]
  ];
  return (
    <section className="panel passport-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><ClipboardCheck size={20} />证据护照</div>
          <p>默认私密，分享前需要确认可见范围。</p>
        </div>
        <span className={hasResume ? "status-pill blue" : "status-pill neutral"}>{hasResume ? "可证明性待确认" : "未生成"}</span>
      </div>
      <div className="passport-score">
        <div className={hasResume ? "passport-light yellow" : "passport-light neutral"} />
        <div>
          <b>{hasResume ? "62%" : "0%"}</b>
          <span>岗位证据就绪度</span>
        </div>
      </div>
      <div className="passport-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="passport-note">
        <LockKeyhole size={16} />
        可见性：私密、对企业可见、对高校导师可见、公开链接可见。
      </div>
    </section>
  );
}

function ScannerPanel(props: {
  isScanning: boolean;
  canStart: boolean;
  sourceCount: number;
  onStart: () => void;
}) {
  const cards = [
    ["岗位", "要求拆解", props.sourceCount >= 1],
    ["简历", "声明抽取", props.sourceCount >= 2],
    ["材料库", "证据匹配", props.sourceCount >= 3]
  ] as const;
  return (
    <section className={`scanner-panel commercial-scanner ${props.isScanning ? "is-scanning" : ""}`} data-testid="scanner-section">
      <div className="scanner-panel-top">
        <div>
          <span>安检扫描台</span>
          <h3>把岗位要求、简历声明和证据材料对齐</h3>
        </div>
        <Radar size={28} />
      </div>
      <div className="scanner-gate" data-testid="scanner-gate">
        {cards.map(([title, label, active]) => (
          <div className={active ? "scan-card active" : "scan-card"} key={title}>
            <span>{title}</span>
            <b className={active ? "evidence-badge green" : "evidence-badge yellow"}>{active ? "已接入" : label}</b>
          </div>
        ))}
        <div className="scan-beam" data-testid="scan-beam" />
      </div>
      <div className="agent-row">
        {["抓取岗位", "解析简历", "匹配证据", "识别缺口", "生成建议"].map((item, index) => (
          <div className={index < props.sourceCount || props.isScanning ? "agent-node active" : "agent-node"} key={item}>
            <ShieldCheck size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <button className="primary-button wide min-h-11 min-w-11" onClick={props.onStart} disabled={!props.canStart || props.isScanning} type="button">
        <Play size={18} />
        {props.isScanning ? "正在生成报告" : "开始体检"}
      </button>
    </section>
  );
}

function RecentJobsPanel() {
  return (
    <section className="panel recent-panel">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><BriefcaseBusiness size={20} />最近岗位</div>
          <p>按就绪度继续体检，不鼓励海投。</p>
        </div>
      </div>
      <div className="job-list">
        {recentJobs.map((job) => (
          <article className="job-row" key={job.id}>
            <div className={`mini-light ${job.light}`} />
            <div>
              <b>{job.role}</b>
              <span>{job.company}，{job.updatedAt}</span>
            </div>
            <strong>{job.readiness}%</strong>
            <small>{job.gaps} 个缺口</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActionPanel({ canStart, onStart }: { canStart: boolean; onStart: () => void }) {
  return (
    <section className="panel next-action-panel">
      <span className="status-pill blue">今日最佳动作</span>
      <h2>先补“项目结果指标”这一条证据</h2>
      <p>它同时影响用户调研、活动复盘和数据复盘三项要求，是当前最有杠杆的补证据动作。</p>
      <button className="primary-button wide min-h-11 min-w-11" onClick={onStart} disabled={!canStart} type="button">
        <CheckCircle2 size={18} />
        生成体检报告
      </button>
    </section>
  );
}

function DemoEntryPanel() {
  return (
    <section className="panel demo-entry-panel">
      <Link href="/enterprise" className="demo-entry">
        <Building2 size={20} />
        <div>
          <b>查看企业复核工作区示例</b>
          <span>候选人队列、人工复核、补证据请求。</span>
        </div>
        <ArrowRight size={18} />
      </Link>
      <Link href="/school" className="demo-entry">
        <GraduationCap size={20} />
        <div>
          <b>查看高校就业证据看板示例</b>
          <span>准备度、缺口热力、训练包和导师待跟进。</span>
        </div>
        <ArrowRight size={18} />
      </Link>
      <Link href="/admin" className="demo-entry">
        <ClipboardCheck size={20} />
        <div>
          <b>查看平台权限与审计控制台</b>
          <span>角色模板、敏感字段过滤和模型服务状态。</span>
        </div>
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const chunks: string[] = [];
  const maxPages = Math.min(doc.numPages, 8);
  for (let index = 1; index <= maxPages; index += 1) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    chunks.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return chunks.join("\n");
}
