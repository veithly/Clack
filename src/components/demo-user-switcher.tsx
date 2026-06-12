"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, GraduationCap, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { DEMO_USER_STORAGE_KEY, demoUsers, getDemoUser, type DemoRole } from "@/lib/demo-users";

const roleIcons: Record<DemoRole, React.ReactNode> = {
  candidate: <UserRound size={16} />,
  enterprise: <Building2 size={16} />,
  school: <GraduationCap size={16} />,
  admin: <Wrench size={16} />
};

export function DemoUserSwitcher() {
  const [role, setRole] = useState<DemoRole>("candidate");
  const user = useMemo(() => getDemoUser(role), [role]);

  useEffect(() => {
    const saved = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (saved) setRole(getDemoUser(saved).role);
  }, []);

  function switchRole(nextRole: DemoRole) {
    setRole(nextRole);
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, nextRole);
    window.dispatchEvent(new CustomEvent("clack-role-change", { detail: nextRole }));
  }

  return (
    <section className="demo-user-switcher" aria-label="演示用户切换" data-testid="demo-user-switcher">
      <div className="demo-user-current">
        <span>{roleIcons[user.role]}</span>
        <div>
          <b>{user.name}</b>
          <small>{user.title}，{user.org}</small>
        </div>
      </div>
      <div className="demo-role-tabs" role="tablist" aria-label="选择演示用户">
        {demoUsers.map((item) => (
          <button
            className={item.role === user.role ? "demo-role-tab active" : "demo-role-tab"}
            key={item.role}
            onClick={() => switchRole(item.role)}
            type="button"
            data-testid={`switch-role-${item.role}`}
          >
            {roleIcons[item.role]}
            {item.title}
          </button>
        ))}
      </div>
      <Link className="demo-role-route" href={user.defaultRoute} data-testid="current-role-route">
        进入{user.homeTitle}
      </Link>
    </section>
  );
}

export function RolePermissionStrip({ expected }: { expected?: DemoRole }) {
  const [role, setRole] = useState<DemoRole>("candidate");

  useEffect(() => {
    const apply = () => setRole(getDemoUser(window.localStorage.getItem(DEMO_USER_STORAGE_KEY)).role);
    apply();
    function onChange(event: Event) {
      setRole(getDemoUser((event as CustomEvent<DemoRole>).detail).role);
    }
    window.addEventListener("clack-role-change", onChange);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("clack-role-change", onChange);
      window.removeEventListener("storage", apply);
    };
  }, []);

  const user = getDemoUser(role);
  const mismatch = expected && expected !== user.role;

  return (
    <section className={mismatch ? "role-permission-strip mismatch" : "role-permission-strip"} data-testid="role-permission-strip">
      <div>
        <span className="status-pill blue"><ShieldCheck size={14} />当前身份：{user.title}</span>
        <b>{user.homeTitle}</b>
        <p>{mismatch ? `你正在查看其他角色空间，演示时可切换为${expectedRoleName(expected)}。` : user.homeSubtitle}</p>
      </div>
      <div className="permission-list">
        {user.permissions.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
      </div>
      <div className="restriction-list">
        {user.restrictions.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function expectedRoleName(role?: DemoRole) {
  if (role === "enterprise") return "企业复核员";
  if (role === "school") return "高校导师";
  if (role === "admin") return "平台管理员";
  return "候选人";
}
