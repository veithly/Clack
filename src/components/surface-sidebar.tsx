import Link from "next/link";
import { ChevronLeft, ClipboardCheck, FileText, History, Home } from "lucide-react";

export function SurfaceSidebar() {
  return (
    <aside className="surface-sidebar" aria-label="主导航">
      <button className="sidebar-collapse min-h-11 min-w-11" type="button" data-collapse-toggle="主导航收起">
        <ChevronLeft size={16} />
      </button>
      <nav>
        <Link href="/"><Home size={16} />着陆页</Link>
        <Link href="/candidate"><ClipboardCheck size={16} />候选人台</Link>
        <Link href="/candidate"><FileText size={16} />简历输入</Link>
        <Link href="/candidate"><History size={16} />最近报告</Link>
      </nav>
    </aside>
  );
}
