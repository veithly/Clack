import { HomeClient } from "@/components/home-client";

export default function Page() {
  return (
    <>
      <HomeClient />
      <div className="surface-contract" aria-hidden="true">
        <span data-placeholder-example="岗位 JD 示例">产品运营实习生岗位描述</span>
        <span data-placeholder-example="简历示例">校园活动运营简历片段</span>
        <span data-cta-primary="开始体检">开始体检</span>
        <span data-next-step-cta="点击开始体检">开始体检</span>
      </div>
    </>
  );
}
