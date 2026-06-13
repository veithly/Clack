"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Eye,
  EyeOff,
  Gauge,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Link2,
  LockKeyhole,
  MessageSquareText,
  ScanLine,
  ServerCog,
  ShieldCheck,
  UserRoundSearch,
  UserSearch
} from "lucide-react";
import { BrandLockup } from "@/components/brand";
import {
  candidatePackages,
  evidenceArtifacts,
  heatCells,
  reviewCandidates,
  schoolAgentInsight,
  statusText,
  studentDetails,
  studentReadiness,
  type CandidateEvidencePackage,
  type PackageAgentStep,
  type PackageBinding,
  type PackageGap,
  type PackageMatrixRow
} from "@/lib/demo-data";

export function ProductHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup title={title} subtitle={subtitle} />
      </Link>
      <nav className="top-nav" aria-label="产品空间导航">
        <Link href="/candidate">候选人</Link>
        <Link href="/passport">证据护照</Link>
        <Link href="/enterprise">企业</Link>
        <Link href="/school">高校</Link>
        <Link href="/admin">管理员</Link>
      </nav>
      <div className="boundary-note"><LockKeyhole size={16} />只整理可证明性，不做录用决定</div>
    </header>
  );
}

export function PassportWorkspace() {
  return (
    <main className="app-shell commercial-shell">
      <ProductHeader title="证据护照" subtitle="把项目、声明和证据变成可复用资产" />
      <section className="workspace-hero passport-hero">
        <div className="hero-copy">
          <span className="hero-label">候选人资产</span>
          <h2>一份材料，可以支撑多个岗位声明</h2>
          <p>默认私密。分享前确认可见范围，企业只能看到对应岗位的只读证据卡。</p>
        </div>
        <div className="passport-graph panel">
          <div className="passport-node primary">声明：负责报名页优化</div>
          <div className="passport-link-line" />
          <div className="passport-node">证据：问卷样本 86 人</div>
          <div className="passport-node">证据：转化率 21% 到 39%</div>
          <div className="passport-node">证据：项目复盘截图</div>
        </div>
      </section>
      <section className="workspace-two-col">
        <section className="panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><ClipboardList size={20} />证据对象</div>
              <p>独立对象，可复用、隐藏、撤回、绑定多条声明。</p>
            </div>
          </div>
          <div className="material-list roomy">
            {evidenceArtifacts.map((item) => (
              <article className="material-row" key={item.id}>
                <span>{item.type}</span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.source}，{item.visibility}，{item.updatedAt}</small>
                </div>
                <em>{item.status}</em>
              </article>
            ))}
          </div>
        </section>
        <section className="panel claims-panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><ShieldCheck size={20} />声明引用关系</div>
              <p>一份证据可支撑多个声明，一个声明可绑定多份证据。</p>
            </div>
          </div>
          {[
            ["具备用户调研能力", "问卷样本、调研结论、项目复盘", "对企业可见"],
            ["能用数据复盘活动效果", "转化率截图、报名页调整记录", "公开链接可见"],
            ["负责过校园活动运营", "个人动作说明、导师确认", "私密"]
          ].map(([claim, proof, visibility]) => (
            <article className="claim-row" key={claim}>
              <div>
                <b>{claim}</b>
                <span>{proof}</span>
              </div>
              <small>{visibility}</small>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

const LIGHT_LABEL: Record<CandidateEvidencePackage["trafficLight"], string> = {
  green: "证据充分可进面",
  yellow: "需补 1 条关键证据",
  red: "证据不足暂难判断"
};

const STANCE_LABEL: Record<CandidateEvidencePackage["stance"], string> = {
  advance: "建议进面追问",
  hold: "先补证据再约",
  pass: "暂不推进"
};

function statusToBadge(status: PackageMatrixRow["status"]) {
  if (status === "proven") return "green";
  if (status === "weak" || status === "risky") return "yellow";
  return "red";
}

function defaultRequest(pkg: CandidateEvidencePackage) {
  const top = pkg.gaps[0];
  if (!top) return "证据已较充分，可邀约面试，围绕证据现场追问即可。";
  return `请补充「${top.title}」：${top.missing}。补齐后我会重新人工复核。`;
}

export function EnterpriseWorkspace() {
  const [selectedId, setSelectedId] = useState(reviewCandidates[0]?.id ?? "");
  const selected = useMemo(
    () => reviewCandidates.find((item) => item.id === selectedId) ?? reviewCandidates[0],
    [selectedId]
  );
  const pkg = candidatePackages[selected?.id ?? ""];
  const [reviewChoice, setReviewChoice] = useState("");
  const [requestText, setRequestText] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [extraLog, setExtraLog] = useState<{ at: string; actor: string; action: string }[]>([]);

  function pickCandidate(id: string) {
    setSelectedId(id);
    setReviewChoice("");
    setRequestText("");
    setRequestSent(false);
    setExtraLog([]);
  }

  function sendRequest() {
    const text = (requestText || defaultRequest(pkg)).trim();
    if (!text) return;
    setRequestSent(true);
    setExtraLog((prev) => [{ at: "现在", actor: "周晨", action: `发送补证据请求：${text.slice(0, 40)}` }, ...prev]);
  }

  function setConclusion(choice: string) {
    setReviewChoice(choice);
    setExtraLog((prev) => [{ at: "现在", actor: "周晨", action: `人工复核结论：${choice}` }, ...prev]);
  }

  return (
    <main className="app-shell commercial-shell" data-testid="screen-enterprise">
      <ProductHeader title="企业复核工作区" subtitle="只看授权证据，人工下结论" />
      <section className="enterprise-grid">
        <section className="panel candidate-queue">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><Building2 size={20} />候选人证据队列</div>
              <p>按提交时间排列，不做 AI 自动排名。</p>
            </div>
            <span className="status-pill neutral">0 自动淘汰</span>
          </div>
          <div className="candidate-table">
            <div className="candidate-row head">
              <span>候选人</span><span>岗位</span><span>就绪度</span><span>缺口</span><span>状态</span>
            </div>
            {reviewCandidates.map((item) => (
              <button className={`candidate-row candidate-row-button ${item.id === selected?.id ? "selected" : ""}`} key={item.id} onClick={() => pickCandidate(item.id)} type="button" data-testid={`queue-${item.id}`}>
                <span>{item.candidate}<small>{item.id} · {item.submittedAt}</small></span>
                <span>{item.role}</span>
                <strong>{item.readiness}%</strong>
                <span>{item.gaps} 个</span>
                <b>{item.status}</b>
              </button>
            ))}
          </div>
          <div className="queue-note"><Eye size={15} />只展示候选人主动授权的只读证据卡。</div>
        </section>

        {pkg ? (
          <EvidencePackageView
            pkg={pkg}
            candidate={selected.candidate}
            role={selected.role}
            id={selected.id}
            readiness={selected.readiness}
            reviewChoice={reviewChoice}
            requestText={requestText}
            requestSent={requestSent}
            extraLog={extraLog}
            onConclusion={setConclusion}
            onRequestText={(v) => {
              setRequestText(v);
              setRequestSent(false);
            }}
            onSendRequest={sendRequest}
          />
        ) : null}
      </section>

      <section className="panel compliance-band">
        <ShieldCheck size={22} />
        <div>
          <h2>合规边界常驻</h2>
          <p>只整理可证明性：不验真假、不替代背调、不作录用决定、敏感字段不进入判断。</p>
        </div>
      </section>
    </main>
  );
}

function EvidencePackageView(props: {
  pkg: CandidateEvidencePackage;
  candidate: string;
  role: string;
  id: string;
  readiness: number;
  reviewChoice: string;
  requestText: string;
  requestSent: boolean;
  extraLog: { at: string; actor: string; action: string }[];
  onConclusion: (choice: string) => void;
  onRequestText: (value: string) => void;
  onSendRequest: () => void;
}) {
  const { pkg } = props;
  const log = [...props.extraLog, ...pkg.reviewLog];
  return (
    <section className="evidence-package" data-testid="evidence-package">
      <header className={`package-head ${pkg.trafficLight}`}>
        <div className="package-id">
          <span className="status-pill blue"><ScanLine size={14} />授权证据包</span>
          <h2>{props.candidate} · {props.role}</h2>
          <p className="package-scope"><Eye size={14} />{pkg.authorizedScope} · 授权于 {pkg.authorizedAt}</p>
        </div>
        <div className="package-score">
          <span className="package-light" />
          <strong>{props.readiness}<small>%</small></strong>
          <span>{LIGHT_LABEL[pkg.trafficLight]}</span>
          <b className={`stance-pill ${pkg.stance}`}>{STANCE_LABEL[pkg.stance]}</b>
          <em className="package-conf"><Gauge size={13} />判断置信度 {pkg.confidence}%</em>
        </div>
      </header>

      <div className="review-control" data-testid="review-control">
        <div className="review-control-head">
          <b>人工复核结论</b>
          <span>{props.reviewChoice ? `已选：${props.reviewChoice}` : "结论仅三档，录用与否由企业人工决定"}</span>
        </div>
        <div className="review-options">
          {["证据充分", "需补充", "无法判断"].map((item) => (
            <button className={`secondary-button min-h-11 ${props.reviewChoice === item ? "is-selected" : ""}`} onClick={() => props.onConclusion(item)} type="button" key={item} data-testid={`conclusion-${item}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="panel recruiter-twin package-twin" data-testid="package-recruiter">
        <div className="recruiter-twin-head">
          <span className="status-pill blue"><UserSearch size={14} />招聘官分身</span>
          <span className={`stance-pill ${pkg.stance}`}>{STANCE_LABEL[pkg.stance]}</span>
          <span className="recruiter-conf"><Gauge size={13} />置信度 {pkg.confidence}%</span>
        </div>
        <h2>{pkg.recruiterHeadline}</h2>
        <div className="recruiter-twin-grid">
          <div className="twin-col">
            <b className="twin-col-title good">第一眼亮点</b>
            <ul>{pkg.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="twin-col">
            <b className="twin-col-title warn">主要顾虑</b>
            <ul>{pkg.concerns.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="twin-col questions">
            <b className="twin-col-title"><HelpCircle size={14} />面试会追问</b>
            <ul>{pkg.interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <p className="recruiter-boundary"><ShieldCheck size={14} />招聘官分身只给第一眼判断与追问清单，最终录用由企业人工决定。</p>
      </section>

      <section className="panel pkg-section">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><Cpu size={20} />6 智能体如何得出这份证据包</div>
            <p>每一步都有产出和置信度，企业可逐条核对，不是一次黑箱打分。</p>
          </div>
        </div>
        <ol className="pkg-agents" data-testid="pkg-agents">
          {pkg.agentRun.map((step, index) => (
            <AgentCard step={step} index={index} key={step.key} />
          ))}
        </ol>
      </section>

      <section className="panel pkg-section">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><Activity size={20} />证据矩阵</div>
            <p>每行都能追到岗位要求、候选人声明、引用证据与状态。</p>
          </div>
        </div>
        <div className="evidence-matrix">
          <div className="matrix-row matrix-head">
            <span>岗位要求</span><span>候选人声明</span><span>引用证据</span><span>状态</span><span>权重</span>
          </div>
          {pkg.matrix.map((row) => (
            <details className="matrix-row" key={row.requirement} open={row.status !== "proven"}>
              <summary>
                <span>{row.requirement}</span>
                <span>{row.claim}</span>
                <span>{row.evidence}</span>
                <b className={`evidence-badge ${statusToBadge(row.status)}`}>{statusText(row.status)}</b>
                <span className="matrix-weight">{row.weight === "high" ? "高" : row.weight === "medium" ? "中" : "低"}</span>
              </summary>
              <div className="matrix-detail">
                <p>{row.detail}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="pkg-two-col">
        <section className="panel pkg-section">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><Link2 size={20} />证据绑定</div>
              <p>每条声明背后到底有没有材料撑。</p>
            </div>
          </div>
          <div className="binding-list">
            {pkg.bindings.map((binding) => (
              <BindingRow binding={binding} key={binding.claim} />
            ))}
          </div>
        </section>

        <section className="panel pkg-section">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><AlertCircle size={20} />{pkg.gaps.length ? `${pkg.gaps.length} 个证据缺口` : "无关键缺口"}</div>
              <p>需候选人补充，不能据此自动淘汰。</p>
            </div>
          </div>
          <div className="gap-stack">
            {pkg.gaps.length ? (
              pkg.gaps.map((gap) => <GapRow gap={gap} key={gap.title} />)
            ) : (
              <p className="pkg-empty"><CheckCircle2 size={16} />关键要求均有可展示证据，可直接邀约面试。</p>
            )}
          </div>
        </section>
      </div>

      <section className="panel pkg-section">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><MessageSquareText size={20} />补证据请求</div>
            <p>候选人补充后只发更新提醒，不自动改结论。</p>
          </div>
        </div>
        <div className="request-box">
          <textarea
            data-testid="request-text"
            value={props.requestText}
            placeholder={defaultRequest(pkg)}
            onChange={(event) => props.onRequestText(event.target.value)}
            aria-label="补证据请求"
          />
          <button className="primary-button min-h-11" onClick={props.onSendRequest} type="button" data-testid="send-request">
            <MessageSquareText size={18} />{props.requestSent ? "请求已发送" : "发送补证据请求"}
          </button>
        </div>
        {props.requestSent ? <p className="inline-success">已发送，等待候选人在只读证据卡内补充材料。</p> : null}
        <div className="review-log">
          {log.map((entry, index) => (
            <div className="review-log-row" key={`${entry.at}-${index}`}>
              <span>{entry.at}</span>
              <b>{entry.actor}</b>
              <small>{entry.action}</small>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function AgentCard({ step, index }: { step: PackageAgentStep; index: number }) {
  return (
    <li className={`pkg-agent ${step.status}`} data-testid="pkg-agent">
      <span className="pkg-agent-no">{index + 1}</span>
      <div className="pkg-agent-body">
        <b>{step.name}</b>
        <small>{step.finding}</small>
      </div>
      <span className={`agent-conf ${step.status === "fallback" ? "fallback" : ""}`}>{step.confidence}%</span>
    </li>
  );
}

function BindingRow({ binding }: { binding: PackageBinding }) {
  const label = binding.match === "direct" ? "直接支撑" : binding.match === "partial" ? "部分支撑" : "暂无材料";
  return (
    <article className={`binding-row ${binding.match}`}>
      <div className="binding-claim">
        <b>{binding.claim}</b>
        <span className={`match-pill ${binding.match}`}>{label}</span>
      </div>
      <p className="binding-quote">“{binding.quote}”</p>
      <div className="binding-foot">
        <small>{binding.note}</small>
        <b>{binding.confidence}%</b>
      </div>
    </article>
  );
}

function GapRow({ gap }: { gap: PackageGap }) {
  const badge = statusToBadge(gap.status);
  return (
    <article className={`gap-card ${gap.status === "proven" ? "proven" : ""}`}>
      <div className="gap-top">
        <span className={`evidence-badge ${badge}`}>{statusText(gap.status)}</span>
        <span>{gap.impact}</span>
      </div>
      <h3>{gap.title}</h3>
      <p>需补：{gap.missing}</p>
    </article>
  );
}

const TRAINING_PACKS = [
  { title: "项目作品页训练包", meta: "适用产品、运营、设计岗位", body: "提交项目背景、动作、结果和截图。" },
  { title: "实习经历证据整理包", meta: "适用初级岗位", body: "整理导师确认、工作样本和复盘材料。" },
  { title: "面试追问准备包", meta: "适用专场招聘前", body: "把证据卡转成面试追问清单。" }
];

export function SchoolWorkspace() {
  const [selectedStudent, setSelectedStudent] = useState(studentReadiness[0]?.id ?? "");
  const detail = studentDetails[selectedStudent];
  const readiness = studentReadiness.find((item) => item.id === selectedStudent)?.readiness ?? 0;
  const [activeTraining, setActiveTraining] = useState(detail?.recommendedPack ?? TRAINING_PACKS[0].title);
  const [mentorSent, setMentorSent] = useState(false);

  function pickStudent(id: string) {
    setSelectedStudent(id);
    setActiveTraining(studentDetails[id]?.recommendedPack ?? TRAINING_PACKS[0].title);
    setMentorSent(false);
  }

  return (
    <main className="app-shell commercial-shell" data-testid="screen-school">
      <ProductHeader title="高校就业证据看板" subtitle="只看缺口与训练，不看企业备注" />

      <section className="panel agent-insight-band" data-testid="school-insight">
        <Cpu size={20} />
        <p>{schoolAgentInsight.note}</p>
        <span className="status-pill neutral">{schoolAgentInsight.scanned} 份体检 · {schoolAgentInsight.topGapShare}% 命中</span>
      </section>

      <section className="school-grid">
        <section className="panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><GraduationCap size={20} />学生准备度</div>
              <p>准备度表示材料证据覆盖，不表示学生能力。</p>
            </div>
          </div>
          <div className="student-list">
            {studentReadiness.map((item) => (
              <button className={`student-row student-row-button ${item.id === selectedStudent ? "selected" : ""}`} key={item.id} onClick={() => pickStudent(item.id)} type="button" data-testid={`student-${item.id}`}>
                <div>
                  <b>{item.id}</b>
                  <span>{item.target} · 主要缺口：{item.gap}</span>
                </div>
                <strong>{item.readiness}%</strong>
                <small>{item.mentorState}</small>
              </button>
            ))}
          </div>
        </section>

        {detail ? (
          <aside className="panel student-detail" data-testid="student-detail">
            <span className="status-pill blue"><Activity size={14} />学生缺口明细</span>
            <h2>{selectedStudent} · {studentReadiness.find((s) => s.id === selectedStudent)?.target}</h2>
            <p>{detail.summary}</p>
            <div className="student-trend">
              <strong>{readiness}%</strong>
              <span>准备度 · {detail.readinessTrend}</span>
            </div>
            <div className="agent-insight-inline"><Cpu size={15} />{detail.agentInsight}</div>
            <div className="student-gaps">
              {detail.gaps.map((gap) => (
                <article className={`gap-card ${gap.status === "proven" ? "proven" : ""}`} key={gap.title}>
                  <div className="gap-top">
                    <span className={`evidence-badge ${gap.status === "proven" ? "green" : gap.status === "weak" ? "yellow" : "red"}`}>{statusText(gap.status)}</span>
                    <small className="flagged-by"><Cpu size={12} />{gap.flaggedBy}</small>
                  </div>
                  <h3>{gap.title}</h3>
                  <p>建议：{gap.suggestion}</p>
                </article>
              ))}
            </div>
            <div className="recommended-pack"><BookOpenCheck size={15} />建议训练包：{detail.recommendedPack}</div>
          </aside>
        ) : null}
      </section>

      <section className="panel heat-panel">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><BookOpenCheck size={20} />缺口热力</div>
            <p>颜色表示缺口密度，不用于学生评分。</p>
          </div>
        </div>
        <div className="heat-table">
          <div className="heat-row head"><span>岗位族</span><span>项目</span><span>实习</span><span>作品</span><span>证书</span><span>成果</span></div>
          {heatCells.map((row) => (
            <div className="heat-row" key={row.role}>
              <span>{row.role}</span>
              {[row.project, row.internship, row.portfolio, row.certificate, row.outcome].map((value, index) => (
                <b style={{ "--heat": value } as React.CSSProperties} key={`${row.role}-${index}`}>{value}%</b>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="training-grid">
        {TRAINING_PACKS.map((pack) => (
          <article className={`panel training-card ${activeTraining === pack.title ? "selected" : ""}`} key={pack.title}>
            <CheckCircle2 size={22} />
            <h2>{pack.title}</h2>
            <span>{pack.meta}</span>
            <p>{pack.body}</p>
            <button className="secondary-button min-h-11 min-w-11" onClick={() => setActiveTraining(pack.title)} type="button">选择训练包 <ArrowRight size={16} /></button>
          </article>
        ))}
      </section>

      <section className="panel compliance-band">
        <UserRoundSearch size={22} />
        <div>
          <h2>导师待跟进：{selectedStudent}</h2>
          <p>已选「{activeTraining}」。操作是发送补证据建议，不是给学生打分。</p>
        </div>
        <button className="primary-button min-h-11 min-w-11" onClick={() => setMentorSent(true)} type="button" data-testid="mentor-send">
          {mentorSent ? "建议已生成" : "发送补证据建议"}
        </button>
      </section>
    </main>
  );
}

const SENSITIVE_FIELDS = ["年龄", "照片", "性别", "婚育状况", "籍贯", "院校层级"];

const AGENT_NODES = [
  { name: "岗位解析智能体", state: "正常" },
  { name: "简历声明智能体", state: "正常" },
  { name: "证据绑定智能体", state: "正常" },
  { name: "缺口核验智能体", state: "正常" },
  { name: "招聘官分身智能体", state: "正常" },
  { name: "行动建议智能体", state: "正常" }
];

export function AdminWorkspace() {
  const [blocked, setBlocked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SENSITIVE_FIELDS.map((field) => [field, true]))
  );
  const enteredCount = SENSITIVE_FIELDS.filter((field) => !blocked[field]).length;

  const auditRows = [
    ["10:16", "林知然", "生成岗位证据报告", "候选人授权材料", "通过"],
    ["10:28", "周晨", "查看只读证据卡", "企业复核员权限", "通过"],
    ["10:31", "缺口核验智能体", "标记证据缺口", "只读取授权材料", "通过"],
    ["10:31", "系统", "忽略敏感字段", "年龄/照片不进入判断", "已拦截"],
    ["10:42", "许老师", "发送训练包建议", "高校导师权限", "通过"]
  ];

  return (
    <main className="app-shell commercial-shell" data-testid="screen-admin">
      <ProductHeader title="平台管理员控制台" subtitle="权限、审计、模型与合规边界" />
      <section className="admin-grid">
        <section className="panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><KeyRound size={20} />角色权限模板</div>
              <p>四类权限模板，可接入企业 SSO 与高校组织架构。</p>
            </div>
          </div>
          <div className="permission-template-list">
            {[
              ["候选人", "上传材料、生成报告、授权证据卡", "默认私密"],
              ["企业复核员", "查看授权证据、复核、请求补证据", "禁止自动淘汰"],
              ["高校导师", "查看准备度、训练包、跟进建议", "不可看企业备注"],
              ["平台管理员", "审计、模型配置、成本监控", "不可编辑候选人材料"]
            ].map(([role, allow, deny]) => (
              <article className="permission-template" key={role}>
                <b>{role}</b>
                <span>{allow}</span>
                <em>{deny}</em>
              </article>
            ))}
          </div>
        </section>
        <aside className="panel admin-status-panel">
          <span className="status-pill blue"><ServerCog size={14} />系统状态</span>
          <h2>AI 模型、D1 已接入生产环境</h2>
          <p>管理员看运行与合规，不接触候选人私密原文。</p>
          <div className="admin-metrics">
            <div><strong>26ms</strong><span>Worker 启动</span></div>
            <div><strong>6</strong><span>Agent 节点</span></div>
            <div><strong>{enteredCount}</strong><span>敏感字段进入判断</span></div>
          </div>
        </aside>
      </section>

      <div className="admin-two-col">
        <section className="panel" data-testid="sensitive-filter">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><EyeOff size={20} />敏感字段过滤</div>
              <p>被忽略的字段永远不进入 AI 判断。点选可演示开关效果。</p>
            </div>
            <span className={enteredCount === 0 ? "status-pill green" : "status-pill red"}>
              {enteredCount === 0 ? "0 字段进入判断" : `${enteredCount} 字段进入判断`}
            </span>
          </div>
          <div className="sensitive-list">
            {SENSITIVE_FIELDS.map((field) => (
              <button
                key={field}
                type="button"
                className={`sensitive-chip ${blocked[field] ? "blocked" : "entered"}`}
                onClick={() => setBlocked((prev) => ({ ...prev, [field]: !prev[field] }))}
              >
                <span>{field}</span>
                <b>{blocked[field] ? "已忽略" : "参与判断"}</b>
              </button>
            ))}
          </div>
          <p className="sensitive-note"><ShieldCheck size={14} />默认全部忽略，符合「敏感身份字段不进入判断」的合规边界。</p>
        </section>

        <section className="panel" data-testid="agent-nodes">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><Cpu size={20} />AI 判断节点</div>
              <p>平台统一编排的 6 个智能体，每步都写入审计。</p>
            </div>
          </div>
          <div className="agent-node-list">
            {AGENT_NODES.map((node, index) => (
              <div className="agent-node-row" key={node.name}>
                <span className="agent-node-no">{index + 1}</span>
                <b>{node.name}</b>
                <span className="status-pill green"><CheckCircle2 size={13} />{node.state}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel admin-audit-panel">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><ShieldCheck size={20} />审计日志</div>
            <p>每次证据查看、AI 判断和权限切换都能追踪。</p>
          </div>
        </div>
        <div className="audit-table">
          <div className="audit-table-row head"><span>时间</span><span>操作者</span><span>动作</span><span>权限依据</span><span>结果</span></div>
          {auditRows.map((row) => (
            <div className="audit-table-row" key={row.join("-")}>
              {row.map((cell, index) => <span key={`${cell}-${index}`}>{cell}</span>)}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
