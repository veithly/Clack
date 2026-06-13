"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  FileText,
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
import { evidenceArtifacts } from "@/lib/demo-data";
import { AGENT_SHORT_LABELS, PIPELINE_AGENTS, displayEngine } from "@/lib/pipeline-meta";
import type { AgentTrace } from "@/lib/types";

type SampleInput = {
  jdText: string;
  resumeText: string;
  evidenceText: string;
};

type AgentUi = {
  key: string;
  label: string;
  displayName: string;
  status: "idle" | "running" | "done";
  agentStatus?: AgentTrace["status"];
  confidence?: number;
  output?: string;
  role?: string;
  engine?: string;
  durationMs?: number;
};

type StreamEvent =
  | { type: "agent_start"; index: number; total: number; agent: { key: string; displayName: string; role: string } }
  | { type: "agent_done"; index: number; total: number; trace: AgentTrace }
  | { type: "done"; reportId: string; score: number; trafficLight: string; trafficLightLabel: string; confidence?: number; pipelineDepth?: string }
  | { type: "error"; message: string };

type RunPayload = {
  jdText: string;
  resumeText: string;
  evidenceText: string;
  inputSource: string;
  useSample: boolean;
  /** true 时强制规则路径 + 固定分数，断网也能演示；默认 false 走真实模型。 */
  offline?: boolean;
  jdSourceUrl?: string;
  resumeFileName?: string;
  proofFileName?: string;
};

function idleAgents(): AgentUi[] {
  return PIPELINE_AGENTS.map((agent) => ({
    key: agent.key,
    label: AGENT_SHORT_LABELS[agent.key] ?? agent.displayName,
    displayName: agent.displayName,
    status: "idle"
  }));
}

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
  const [agents, setAgents] = useState<AgentUi[]>(idleAgents);
  const [pipelineDepth, setPipelineDepth] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const canStart = jdText.trim().length > 40 && resumeText.trim().length > 30;
  const sourceCount = Number(Boolean(jdText.trim())) + Number(Boolean(resumeText.trim())) + Number(Boolean(proofFileName || proofText.trim()));

  async function loadSample(): Promise<SampleInput> {
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
    return data;
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

  async function runCheck(payload: RunPayload) {
    if (isScanning) return;
    setIsScanning(true);
    setImportError("");
    setPipelineDepth("");
    setAgents(idleAgents());
    try {
      const res = await fetch("/api/report/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.body) {
        setImportError("浏览器不支持流式分析，请刷新重试。");
        setIsScanning(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reportId = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }
          if (event.type === "agent_start") {
            setAgents((prev) => prev.map((item, index) => (index === event.index ? { ...item, status: "running", role: event.agent.role } : item)));
          } else if (event.type === "agent_done") {
            setAgents((prev) =>
              prev.map((item, index) =>
                index === event.index
                  ? {
                      ...item,
                      status: "done",
                      agentStatus: event.trace.status,
                      confidence: event.trace.confidence,
                      output: event.trace.outputSummary,
                      engine: event.trace.engine,
                      durationMs: event.trace.durationMs
                    }
                  : item
              )
            );
          } else if (event.type === "done") {
            reportId = event.reportId;
            setPipelineDepth(event.pipelineDepth ?? "");
          } else if (event.type === "error") {
            setImportError(event.message);
          }
        }
      }
      if (reportId) {
        await new Promise((resolve) => setTimeout(resolve, 480));
        router.push(`/result/${reportId}`);
      } else {
        setImportError((current) => current || "分析没有返回报告，请重试。");
        setIsScanning(false);
      }
    } catch {
      setImportError("分析流水线连接中断，请重试。");
      setIsScanning(false);
    }
  }

  function startCheck() {
    if (!canStart || isScanning) return;
    const inputSource = isSampleLoaded ? "sample" : jdSourceUrl && resumeFileName ? "mixed" : jdSourceUrl ? "jd-url" : resumeFileName ? "resume-file" : "paste";
    void runCheck({ jdText, resumeText, evidenceText: proofText, inputSource, useSample: isSampleLoaded, offline: false, jdSourceUrl, resumeFileName, proofFileName });
  }

  // 离线稳定版：始终用演示样例 + 规则路径 + 固定分数，断网或评委网络差时兜底。
  async function runStableDemo() {
    if (isScanning) return;
    const data = await loadSample();
    await runCheck({ jdText: data.jdText, resumeText: data.resumeText, evidenceText: "", inputSource: "sample", useSample: true, offline: true, proofFileName: "演示项目复盘证据" });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autostart") !== "1") return;
    let cancelled = false;
    (async () => {
      const data = await loadSample();
      if (cancelled) return;
      await runCheck({ jdText: data.jdText, resumeText: data.resumeText, evidenceText: data.evidenceText, inputSource: "sample", useSample: true, proofFileName: "演示项目复盘证据" });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="app-shell commercial-shell" data-testid="screen-home">
      <CandidateHeader />

      <section className="workspace-hero" aria-label="咔哒工作台">
        <div className="hero-copy">
          <span className="hero-label">岗位证据层 · 6 智能体真实模型推理</span>
          <h2>先看证据就绪度，再决定是否投递</h2>
          <p>导入岗位与简历，6 个智能体串行调用真实大模型，只判断声明有没有证据支撑——不验真假、不自动投递。</p>
          <div className="hero-actions">
            <button className="primary-button min-h-11 min-w-11" onClick={startCheck} disabled={!canStart || isScanning} data-testid="start-check-button" data-cta-primary="开始体检" type="button">
              {isScanning ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
              {isScanning ? "智能体推理中" : "开始体检（真实模型）"}
            </button>
            <button className="secondary-button min-h-11 min-w-11" onClick={loadSample} data-testid="demo-sample-button" type="button">
              <Sparkles size={18} />
              {isSampleLoaded ? "已载入样例" : "使用演示样例"}
            </button>
          </div>
          <button className="ghost-link offline-demo-link min-h-11" onClick={runStableDemo} disabled={isScanning} data-testid="offline-demo-button" type="button">
            <ShieldCheck size={14} />
            离线稳定版（断网兜底，固定演示结果）
          </button>
        </div>
        <ScannerPanel isScanning={isScanning} canStart={canStart} onStart={startCheck} sourceCount={sourceCount} agents={agents} depth={pipelineDepth} />
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

      <div className="mobile-sticky-action">
        <button className="primary-button wide min-h-11 min-w-11" onClick={startCheck} disabled={!canStart || isScanning} type="button">
          {isScanning ? "正在体检" : "开始体检"}
        </button>
      </div>
    </main>
  );
}

function CandidateHeader() {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup subtitle="岗位证据层，不是简历润色器" />
      </Link>
      <nav className="top-nav" aria-label="主要页面">
        <Link href="/candidate">候选人</Link>
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
          <p>粘贴链接或 JD，自动拆出岗位要求与证据偏好。</p>
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
          <p>上传一次，后续岗位复用同一份证据护照。</p>
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
  agents: AgentUi[];
  depth: string;
}) {
  const cards = [
    ["岗位", "要求拆解", props.sourceCount >= 1],
    ["简历", "声明抽取", props.sourceCount >= 2],
    ["材料库", "证据匹配", props.sourceCount >= 3]
  ] as const;
  const doneCount = props.agents.filter((agent) => agent.status === "done").length;
  const modelName = props.agents.find((agent) => agent.engine && agent.engine !== "规则兜底")?.engine;
  const modelSteps = props.agents.filter((agent) => agent.engine && agent.engine !== "规则兜底").length;
  return (
    <section className={`scanner-panel commercial-scanner ${props.isScanning ? "is-scanning" : ""}`} data-testid="scanner-section">
      <div className="scanner-panel-top">
        <div>
          <span>多智能体扫描台</span>
          <h3>6 个智能体串行推理，每步都可追溯</h3>
        </div>
        {modelName ? (
          <span className="scanner-model-badge" data-testid="scanner-model-badge" title="本次实际调用大模型推理">
            <Cpu size={14} />
            {displayEngine(modelName)}
            <b>{modelSteps}/{props.agents.length} 步真实推理</b>
          </span>
        ) : (
          <Radar size={28} />
        )}
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
      <ol className="agent-pipeline" data-testid="agent-pipeline">
        {props.agents.map((agent, index) => (
          <li className={`agent-step ${agent.status}`} key={agent.key} data-testid="agent-step">
            <span className="agent-step-index">{agent.status === "done" ? <CheckCircle2 size={15} /> : agent.status === "running" ? <Loader2 className="spin" size={15} /> : index + 1}</span>
            <div className="agent-step-body">
              <b>{agent.label}</b>
              <small>{agent.status === "done" ? agent.output ?? "已完成" : agent.status === "running" ? agent.role ?? "推理中…" : agent.displayName}</small>
              {agent.status === "done" && agent.engine ? (
                <span className="agent-step-engine" data-testid="agent-step-engine">
                  <Cpu size={11} />
                  {displayEngine(agent.engine)}
                  {typeof agent.durationMs === "number" ? <em>{(agent.durationMs / 1000).toFixed(1)}s</em> : null}
                </span>
              ) : null}
            </div>
            {agent.status === "done" && typeof agent.confidence === "number" ? (
              <span className={`agent-conf ${agent.agentStatus === "fallback" ? "fallback" : ""}`}>{agent.confidence}%</span>
            ) : null}
          </li>
        ))}
      </ol>
      <button className="primary-button wide min-h-11 min-w-11" onClick={props.onStart} disabled={!props.canStart || props.isScanning} type="button">
        <Play size={18} />
        {props.isScanning ? `正在推理 ${doneCount}/${props.agents.length}` : "开始体检"}
      </button>
      {props.depth ? (
        <p className="scanner-depth-note">
          {props.depth === "ai" ? "本次由模型完成全部 6 步推理。" : props.depth === "hybrid" ? "本次模型 + 规则混合完成推理。" : "本次使用规则兜底（未配置模型密钥）。"}
        </p>
      ) : null}
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
