"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

type Action = {
  label: string;
  detail: string;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [path, setPath] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    setPath(window.location.pathname);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const actions = useMemo<Action[]>(() => {
    const currentId = path.match(/\/(?:result|card|trace)\/([^/]+)/)?.[1];
    return [
      { label: "回到体检台", detail: "重新粘贴岗位和简历", run: () => (window.location.href = "/") },
      { label: "打开证据护照", detail: "查看材料库、声明和证据引用关系", run: () => (window.location.href = "/passport") },
      { label: "打开企业复核示例", detail: "查看人工复核前的证据工作台", run: () => (window.location.href = "/enterprise") },
      { label: "打开高校看板示例", detail: "查看就业证据缺口和训练包", run: () => (window.location.href = "/school") },
      { label: "打开管理员控制台", detail: "查看权限、审计和模型服务状态", run: () => (window.location.href = "/admin") },
      {
        label: "查看求职证据卡",
        detail: currentId ? "打开当前报告的只读卡片" : "先完成一次体检",
        run: () => {
          if (currentId) window.location.href = `/card/${currentId}`;
        }
      },
      {
        label: "展开智能体轨迹",
        detail: currentId ? "查看每个智能体的输入和输出" : "先完成一次体检",
        run: () => {
          if (currentId) window.location.href = `/trace/${currentId}`;
        }
      },
      { label: "复制当前链接", detail: "分享给队友或评委复看", run: () => navigator.clipboard?.writeText(window.location.href) }
    ];
  }, [path]);

  const filtered = actions.filter((action) => `${action.label}${action.detail}`.includes(query.trim()));

  return (
    <>
      <button className="palette-trigger min-h-11 min-w-11" type="button" onClick={() => setOpen(true)} aria-label="打开快捷面板">
        <Search size={17} />
        <span>快捷</span>
        <kbd>⌘K</kbd>
      </button>
      {open ? (
        <div className="palette-backdrop" role="dialog" aria-modal="true" aria-label="快捷面板">
          <div className="palette-panel">
            <div className="palette-search">
              <Search size={18} />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="搜索动作" autoFocus />
              <button className="icon-button min-h-11 min-w-11" type="button" onClick={() => setOpen(false)} aria-label="关闭快捷面板">
                <X size={18} />
              </button>
            </div>
            <div className="palette-results">
              {filtered.map((action) => (
                <button className="palette-item min-h-11 min-w-11" type="button" key={action.label} onClick={action.run}>
                  <span>{action.label}</span>
                  <small>{action.detail}</small>
                </button>
              ))}
              {filtered.length === 0 ? <div className="palette-empty">没有匹配动作</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
