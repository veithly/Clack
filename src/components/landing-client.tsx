import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileSearch,
  GanttChartSquare,
  GraduationCap,
  Link2,
  LockKeyhole,
  LogIn,
  Play,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UserSearch
} from "lucide-react";
import { BrandMark } from "@/components/brand";

const ROLES = [
  { step: 1, key: "candidate", icon: UserRound, title: "候选人", action: "上传材料，补齐证据，设置可见范围", meta: "约 3 分钟", href: "/login?role=candidate" },
  { step: 2, key: "enterprise", icon: Building2, title: "企业复核员", action: "查看授权证据，人工复核，申请补材料", meta: "约 2 分钟", href: "/login?role=enterprise" },
  { step: 3, key: "school", icon: GraduationCap, title: "高校导师", action: "查看就业看板，发现共性缺口，安排训练", meta: "约 2 分钟", href: "/login?role=school" },
  { step: 4, key: "admin", icon: SlidersHorizontal, title: "平台管理员", action: "管理权限模板，屏蔽敏感字段，查看审计日志", meta: "约 1 分钟", href: "/login?role=admin" }
] as const;

const PIPELINE = [
  { icon: FileSearch, name: "岗位解析", desc: "拆出硬性要求与证据偏好" },
  { icon: ScanSearch, name: "简历声明", desc: "抽取可核验的能力声明" },
  { icon: Link2, name: "证据绑定", desc: "把材料片段绑定到声明" },
  { icon: ShieldCheck, name: "缺口核验", desc: "标出缺证据、弱证据" },
  { icon: UserSearch, name: "招聘官视角", desc: "模拟第一眼判断与追问" },
  { icon: GanttChartSquare, name: "行动建议", desc: "先补哪条最值，再决定投不投" }
] as const;

const SCAN_ROWS = [
  { label: "React 工程化经验", state: "已证实", status: "green" },
  { label: "TypeScript 规模化", state: "已证实", status: "green" },
  { label: "可访问性 a11y", state: "证据弱", status: "yellow" },
  { label: "性能优化实战", state: "缺证据", status: "red" }
] as const;

export function LandingClient() {
  return (
    <main className="cine" data-testid="screen-landing">
      <section className="cine-hero">
        <div className="cine-hero-art" aria-hidden="true" />
        <div className="cine-veil" aria-hidden="true" />
        <div className="cine-hero-beam" aria-hidden="true" />

        <header className="cine-topbar">
          <Link href="/" className="cine-brand link-reset" aria-label="咔哒 Clack">
            <BrandMark />
            <span className="cine-brand-text">
              <b>咔哒</b>
              <i>投之前，咔哒一下</i>
            </span>
          </Link>
          <nav className="cine-nav" aria-label="角色入口">
            <Link href="/login?role=candidate">候选人</Link>
            <Link href="/login?role=enterprise">企业</Link>
            <Link href="/login?role=school">高校</Link>
            <Link href="/login?role=admin">管理员</Link>
          </nav>
          <div className="cine-topbar-right">
            <Link className="cine-login-link" href="/login" data-testid="login-entry">
              <LogIn size={15} />
              登录
            </Link>
            <div className="cine-boundary-chip" data-testid="proof-boundary-note">
              <LockKeyhole size={14} />
              只判断可证明性
            </div>
          </div>
        </header>

        <div className="cine-hero-inner">
          <span className="cine-kicker">
            <ScanSearch size={14} />
            求职安检机 · 岗位证据层
          </span>
          <h1 className="cine-slogan">
            投之前，<span className="kada-key">咔哒</span>一下
          </h1>
          <p className="cine-lede">
            不美化简历，只核对证据。粘贴岗位和简历，30 秒判断这份工作值不值得投。
          </p>
          <div className="cine-cta">
            <Link className="cine-btn primary" href="/candidate?autostart=1" data-testid="run-story-button" data-cta-primary="一键跑完整故事">
              <Play size={18} />
              一键跑完整故事
            </Link>
            <Link className="cine-btn ghost" href="/login" data-testid="explore-button">
              <LogIn size={18} />
              登录进入工作台
            </Link>
          </div>
          <dl className="cine-trust">
            <div>
              <dt>6</dt>
              <dd>6 步证据核对</dd>
            </div>
            <div>
              <dt>4</dt>
              <dd>4 类角色同看一份证据</dd>
            </div>
            <div>
              <dt>0</dt>
              <dd>0 次自动淘汰</dd>
            </div>
          </dl>
        </div>

        <div className="cine-scrollcue" aria-hidden="true">
          <span className="cine-scrollcue-line" />
          逐条核证据
        </div>
      </section>

      <section className="cine-band cine-pipeline" aria-label="多智能体流水线">
        <div className="cine-band-art pipeline" aria-hidden="true" />
        <div className="cine-band-inner">
          <span className="cine-eyebrow">PIPELINE</span>
          <h2>6 步核对，不靠一次打分</h2>
          <p className="cine-band-lede">
            每一步都能看到依据：岗位要求、简历声明、证据来源和判断结果。
          </p>
          <ol className="cine-steps">
            {PIPELINE.map((node, index) => (
              <li key={node.name}>
                <span className="cine-step-no">{String(index + 1).padStart(2, "0")}</span>
                <node.icon className="cine-step-icon" size={20} />
                <b>{node.name}</b>
                <small>{node.desc}</small>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cine-band cine-proof" aria-label="证据就绪度示例">
        <div className="cine-band-inner cine-proof-inner">
          <div className="cine-proof-copy">
            <span className="cine-eyebrow">EVIDENCE READOUT</span>
            <h2>逐条看清证据强弱</h2>
            <p className="cine-band-lede">
              绿灯是已证实，黄灯是证据弱，红灯是缺证据。咔哒不美化简历，只告诉你哪些能证明、哪些还缺证据。
            </p>
          </div>
          <div className="cine-readout">
            <div className="cine-readout-head">
              <span className="cine-readout-tag">
                <span className="cine-dot" />
                SCANNING
              </span>
              <span>岗位 ↔ 简历 · 就绪度 42</span>
            </div>
            <ul className="cine-scan-rows">
              {SCAN_ROWS.map((row) => (
                <li className={`cine-scan-row ${row.status}`} key={row.label}>
                  <span className="cine-tick" aria-hidden="true" />
                  <span className="cine-scan-label">{row.label}</span>
                  <span className="cine-scan-state">{row.state}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="cine-band cine-roles" aria-label="选择角色">
        <div className="cine-roles-head">
          <div>
            <span className="cine-eyebrow">ROLES</span>
            <h2>一份证据，四类角色看见不同重点</h2>
          </div>
          <Link className="cine-textlink" href="/candidate">
            按导览顺序开始
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="cine-role-grid">
          {ROLES.map((role) => (
            <Link className="cine-role" href={role.href} key={role.key} data-testid={`role-card-${role.key}`}>
              <div className="cine-role-top">
                <span className="role-step">{role.step}</span>
                <role.icon className="cine-role-icon" size={22} />
              </div>
              <h3>{role.title}</h3>
              <p>{role.action}</p>
              <span className="cine-role-meta">
                {role.meta}
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cine-boundary-band">
        <ShieldCheck size={20} />
        <p>
          咔哒只判断“能不能证明”，不验证经历真假，不预测录用概率，不自动排名或淘汰，也不使用敏感身份字段。
        </p>
      </section>

      <footer className="cine-foot">
        <span>咔哒 Clack · 求职安检机</span>
        <span>投之前，咔哒一下</span>
      </footer>
    </main>
  );
}
