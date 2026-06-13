import { ResultClient } from "@/components/result-client";
import { getReport } from "@/lib/report-store";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  return (
    <>
      <ResultClient initialReport={report} reportId={id} />
      <div className="surface-contract" aria-hidden="true">
        <span data-placeholder-example="证据缺口示例">用户调研缺少样本量</span>
        <span data-placeholder-example="补证据示例">补项目复盘截图</span>
        <span data-next-step-cta="重新体检并刷新证据卡">重新体检并刷新证据卡</span>
      </div>
    </>
  );
}
