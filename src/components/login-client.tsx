"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LockKeyhole,
  Play,
  ScanLine,
  UserRound,
  Wrench
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import {
  DEMO_SESSION_STORAGE_KEY,
  DEMO_USER_STORAGE_KEY,
  demoUsers,
  findDemoUserByCredentials,
  getDemoUser,
  type DemoRole
} from "@/lib/demo-users";

const roleIcons: Record<DemoRole, React.ReactNode> = {
  candidate: <UserRound size={18} />,
  enterprise: <Building2 size={18} />,
  school: <GraduationCap size={18} />,
  admin: <Wrench size={18} />
};

export function LoginClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<DemoRole>("candidate");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("role");
    const saved = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
    const initial = getDemoUser(requested ?? saved).role;
    fill(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fill(role: DemoRole) {
    const user = getDemoUser(role);
    setSelected(role);
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  }

  function enterAs(role: DemoRole) {
    const user = getDemoUser(role);
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, role);
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, user.username);
    window.dispatchEvent(new CustomEvent("clack-role-change", { detail: role }));
    router.push(user.defaultRoute);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const matched = findDemoUserByCredentials(username, password);
    if (!matched) {
      setError("账号或密码不匹配，点选下方任意演示身份可一键填入。");
      return;
    }
    enterAs(matched.role);
  }

  return (
    <main className="auth" data-testid="login-screen">
      <div className="auth-art" aria-hidden="true" />
      <div className="auth-veil" aria-hidden="true" />
      <div className="auth-beam" aria-hidden="true" />

      <header className="auth-topbar">
        <Link href="/" className="auth-brand link-reset" aria-label="咔哒 Clack">
          <BrandMark />
          <span className="auth-brand-text">
            <b>咔哒</b>
            <i>投之前，咔哒一下</i>
          </span>
        </Link>
        <span className="auth-boundary">
          <LockKeyhole size={14} />
          只判断可证明性
        </span>
      </header>

      <section className="auth-stage">
        <div className="auth-intro">
          <span className="auth-kicker">
            <ScanLine size={14} />
            求职安检机 · 登录
          </span>
          <h1 className="auth-slogan">
            投之前，<span className="kada-key">咔哒</span>一下
          </h1>
          <p className="auth-lede">
            选一个演示身份，一键进入对应工作台。四个角色看同一条证据链。
          </p>
          <Link className="auth-express" href="/candidate?autostart=1" data-testid="express-demo-link">
            <Play size={15} />
            免登录，一键跑完整故事
          </Link>
        </div>

        <div className="auth-panel">
          <form className="auth-card" onSubmit={handleSubmit} aria-label="登录">
            <div className="auth-card-head">
              <b>登录工作台</b>
              <small>已选身份：{getDemoUser(selected).title} · {getDemoUser(selected).org}</small>
            </div>

            <label className="auth-field">
              <span>账号</span>
              <input
                data-testid="login-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="选择下方演示身份自动填入"
                aria-label="账号"
              />
            </label>
            <label className="auth-field">
              <span>密码</span>
              <input
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="演示密码"
                aria-label="密码"
              />
            </label>

            {error ? (
              <p className="auth-error" data-testid="login-error" role="alert">{error}</p>
            ) : null}

            <button className="auth-submit" type="submit" data-testid="login-submit">
              登录并进入{getDemoUser(selected).homeTitle}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-demos" aria-label="演示账号快捷填入">
            <span className="auth-demos-label">演示账号 · 点选即填入</span>
            <div className="auth-demos-grid">
              {demoUsers.map((user) => (
                <div
                  key={user.role}
                  className={user.role === selected ? "auth-demo active" : "auth-demo"}
                >
                  <button
                    type="button"
                    className="auth-demo-pick"
                    onClick={() => fill(user.role)}
                    data-testid={`demo-account-${user.role}`}
                    aria-pressed={user.role === selected}
                  >
                    <span className="auth-demo-icon">{roleIcons[user.role]}</span>
                    <span className="auth-demo-body">
                      <b>{user.title}</b>
                      <small>{user.name} · {user.org}</small>
                      <i>{user.tagline}</i>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="auth-demo-go"
                    aria-label={`直接进入${user.homeTitle}`}
                    data-testid={`demo-enter-${user.role}`}
                    onClick={() => enterAs(user.role)}
                  >
                    进入<ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="auth-foot">
        <span>咔哒 Clack · 求职安检机</span>
        <span>四个角色 · 一条证据链</span>
      </footer>
    </main>
  );
}
