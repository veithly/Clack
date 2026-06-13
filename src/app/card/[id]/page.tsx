import { CardClient } from "@/components/card-client";
import { getCard } from "@/lib/report-store";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCard(id);
  return (
    <>
      <CardClient initialCard={card} reportId={id} />
      <div className="surface-contract" aria-hidden="true">
        <span data-placeholder-example="已有证据示例">活动复盘有转化率变化</span>
        <span data-placeholder-example="下一步示例">把证据写回简历项目经历</span>
        <span data-next-step-cta="复制分享链接">复制分享链接</span>
      </div>
    </>
  );
}
