"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  ServerCog,
  ShieldCheck,
  UserRoundSearch
} from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { RolePermissionStrip } from "@/components/demo-user-switcher";
import { evidenceArtifacts, heatCells, reviewCandidates, studentReadiness } from "@/lib/demo-data";

export function ProductHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="topbar commercial-topbar">
      <Link className="link-reset" href="/">
        <BrandLockup title={title} subtitle={subtitle} />
      </Link>
      <nav className="top-nav" aria-label="产品空间导航">
        <Link href="/">候选人</Link>
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
      <RolePermissionStrip expected="candidate" />
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
              <p>证据是独立对象，可以复用、隐藏、撤回和绑定多条声明。</p>
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
              <p>一个声明可绑定多份证据，一份证据也可支撑多个岗位声明。</p>
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

export function EnterpriseWorkspace() {
  const [selectedId, setSelectedId] = useState(reviewCandidates[0]?.id ?? "");
  const [reviewChoice, setReviewChoice] = useState("需补充");
  const [requestText, setRequestText] = useState("请补充项目复盘截图，说明你的个人动作和结果指标。");
  const [requestSent, setRequestSent] = useState(false);
  const selected = useMemo(
    () => reviewCandidates.find((item) => item.id === selectedId) ?? reviewCandidates[0],
    [selectedId]
  );
  return (
    <main className="app-shell commercial-shell">
      <ProductHeader title="企业复核工作区" subtitle="人工复核前的证据工作台" />
      <RolePermissionStrip expected="enterprise" />
      <section className="enterprise-grid">
        <section className="panel candidate-queue">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><Building2 size={20} />候选人证据队列</div>
              <p>默认按提交时间和待复核状态，不做自动排名。</p>
            </div>
            <span className="status-pill neutral">禁止自动淘汰</span>
          </div>
          <div className="candidate-table">
            <div className="candidate-row head">
              <span>候选人</span><span>岗位</span><span>就绪度</span><span>缺口</span><span>状态</span>
            </div>
            {reviewCandidates.map((item) => (
              <button className={`candidate-row candidate-row-button ${item.id === selected?.id ? "selected" : ""}`} key={item.id} onClick={() => {
                setSelectedId(item.id);
                setRequestSent(false);
              }} type="button">
                <span>{item.candidate}<small>{item.id}，{item.submittedAt}</small></span>
                <span>{item.role}</span>
                <strong>{item.readiness}%</strong>
                <span>{item.gaps} 个</span>
                <b>{item.status}</b>
              </button>
            ))}
          </div>
        </section>
        <aside className="panel review-panel">
          <span className="status-pill blue">人工复核面板</span>
          <h2>{selected?.candidate}，{selected?.role}</h2>
          <p>当前结论：{reviewChoice}。复核结论限定为“证据充分”“需补充”“无法判断”，最终录用或拒绝必须由企业自己的人工流程完成。</p>
          <div className="review-options">
            {["证据充分", "需补充", "无法判断"].map((item) => (
              <button className={`secondary-button min-h-11 min-w-11 ${reviewChoice === item ? "is-selected" : ""}`} onClick={() => setReviewChoice(item)} type="button" key={item}>
                {item}
              </button>
            ))}
          </div>
          <label className="editor-label">
            补证据请求
            <textarea value={requestText} onChange={(event) => {
              setRequestText(event.target.value);
              setRequestSent(false);
            }} />
          </label>
          <button className="primary-button wide min-h-11 min-w-11" onClick={() => setRequestSent(true)} disabled={!requestText.trim()} type="button">
            <MessageSquareText size={18} />{requestSent ? "补证据请求已生成" : "发送补证据请求"}
          </button>
          {requestSent ? <p className="inline-success">候选人补充后，企业端只收到更新提醒，不自动改变录用结论。</p> : null}
        </aside>
      </section>
      <section className="panel compliance-band">
        <ShieldCheck size={22} />
        <div>
          <h2>合规边界常驻</h2>
          <p>本工作区只整理可证明性，不验证真假，不替代背调，不作录用决定，不展示敏感属性分数。</p>
        </div>
      </section>
    </main>
  );
}

export function SchoolWorkspace() {
  const [selectedStudent, setSelectedStudent] = useState(studentReadiness[0]?.id ?? "");
  const [activeTraining, setActiveTraining] = useState("项目作品页训练包");
  const [mentorSent, setMentorSent] = useState(false);
  return (
    <main className="app-shell commercial-shell">
      <ProductHeader title="高校就业证据看板" subtitle="从个人体检汇总到院系证据缺口" />
      <RolePermissionStrip expected="school" />
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
              <button className={`student-row student-row-button ${item.id === selectedStudent ? "selected" : ""}`} key={item.id} onClick={() => {
                setSelectedStudent(item.id);
                setMentorSent(false);
              }} type="button">
                <div>
                  <b>{item.id}</b>
                  <span>{item.target}，主要缺口：{item.gap}</span>
                </div>
                <strong>{item.readiness}%</strong>
                <small>{item.mentorState}</small>
              </button>
            ))}
          </div>
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
      </section>
      <section className="training-grid">
        {[
          ["项目作品页训练包", "适用产品、运营、设计岗位", "提交项目背景、动作、结果和截图。"],
          ["实习经历证据整理包", "适用初级岗位", "整理导师确认、工作样本和复盘材料。"],
          ["面试追问准备包", "适用专场招聘前", "把证据卡转成面试追问清单。"]
        ].map(([title, meta, body]) => (
          <article className={`panel training-card ${activeTraining === title ? "selected" : ""}`} key={title}>
            <CheckCircle2 size={22} />
            <h2>{title}</h2>
            <span>{meta}</span>
            <p>{body}</p>
            <button className="secondary-button min-h-11 min-w-11" onClick={() => setActiveTraining(title)} type="button">选择训练包 <ArrowRight size={16} /></button>
          </article>
        ))}
      </section>
      <section className="panel compliance-band">
        <UserRoundSearch size={22} />
        <div>
          <h2>导师待跟进：{selectedStudent}</h2>
          <p>已选择“{activeTraining}”。操作是发送补证据建议，不是给学生打分。</p>
        </div>
        <button className="primary-button min-h-11 min-w-11" onClick={() => setMentorSent(true)} type="button">
          {mentorSent ? "建议已生成" : "发送补证据建议"}
        </button>
      </section>
    </main>
  );
}

export function AdminWorkspace() {
  const auditRows = [
    ["10:16", "林知然", "生成岗位证据报告", "只读取候选人授权材料", "通过"],
    ["10:28", "周晨", "查看只读证据卡", "企业复核员权限", "通过"],
    ["10:31", "系统", "忽略敏感字段", "年龄/照片不进入判断", "已拦截"],
    ["10:42", "许老师", "发送训练包建议", "高校导师权限", "通过"]
  ];
  return (
    <main className="app-shell commercial-shell">
      <ProductHeader title="平台管理员控制台" subtitle="权限、审计、模型和合规边界" />
      <RolePermissionStrip expected="admin" />
      <section className="admin-grid">
        <section className="panel">
          <div className="panel-head clean">
            <div>
              <div className="panel-title"><KeyRound size={20} />角色权限模板</div>
              <p>演示系统使用四类权限模板，真实上线可接入企业 SSO 和高校组织架构。</p>
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
          <h2>AI、TTS、D1 已接入生产环境</h2>
          <p>管理员看到的是运行和合规，不接触候选人原始私密材料。</p>
          <div className="admin-metrics">
            <div><strong>26ms</strong><span>Worker 启动</span></div>
            <div><strong>5</strong><span>Agent Trace 节点</span></div>
            <div><strong>0</strong><span>自动淘汰动作</span></div>
          </div>
        </aside>
      </section>
      <section className="panel admin-audit-panel">
        <div className="panel-head clean">
          <div>
            <div className="panel-title"><ShieldCheck size={20} />审计日志</div>
            <p>每次证据查看、AI 判断、TTS 播报和权限切换都能追踪。</p>
          </div>
        </div>
        <div className="audit-table">
          <div className="audit-table-row head"><span>时间</span><span>操作者</span><span>动作</span><span>权限依据</span><span>结果</span></div>
          {auditRows.map((row) => (
            <div className="audit-table-row" key={row.join("-")}>
              {row.map((cell) => <span key={cell}>{cell}</span>)}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
