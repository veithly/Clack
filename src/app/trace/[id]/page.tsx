import { TraceClient } from "@/components/trace-client";
import { getReport, getTrace } from "@/lib/report-store";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  const trace = await getTrace(id);
  return (
    <>
      <TraceClient initialTrace={trace} report={report} reportId={id} />
      <div className="surface-contract" aria-hidden="true">
        <span data-placeholder-example="输入摘要示例">读取岗位要求和简历声明</span>
        <span data-placeholder-example="输出摘要示例">评分更新为 78 分</span>
        <span data-next-step-cta="返回体检结果">返回体检结果</span>
      </div>
    </>
  );
}
