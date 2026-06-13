import { expect, test } from "@playwright/test";

test("投前体检主路径：离线稳定版 -> 结果 -> 补证据 -> 证据卡 -> 轨迹", async ({ page }) => {
  await page.goto("/candidate");
  await expect(page.getByTestId("screen-home")).toBeVisible();
  // 用离线稳定版做确定性断言（真实模型路径分数不固定，单独人工/演示验证）。
  await page.getByTestId("offline-demo-button").click();

  // 开发模式首次跳转到 /result 可能触发 Turbopack 冷编译，放宽导航超时（离线流水线本身约 1s）。
  await expect(page).toHaveURL(/\/result\//, { timeout: 20000 });
  await expect(page.getByTestId("traffic-light-result")).toContainText("先补 1 个证据再投");
  await expect(page.getByTestId("score-number")).toContainText("42");
  await expect(page.getByTestId("evidence-gap-item")).toHaveCount(3);

  await page.getByTestId("use-evidence-button").click();
  await page.getByTestId("recheck-button").click();
  await expect(page.getByTestId("score-number")).toContainText("78");
  await expect(page.getByTestId("traffic-light-result")).toContainText("可以投");

  await page.getByTestId("go-card-button").click();
  await expect(page).toHaveURL(/\/card\//, { timeout: 20000 });
  await expect(page.getByTestId("evidence-card")).toContainText("可以投");
  await expect(page.getByTestId("card-score")).toContainText("78");

  await page.getByText("查看智能体轨迹").click();
  await expect(page).toHaveURL(/\/trace\//, { timeout: 20000 });
  await expect(page.getByTestId("agent-trace-node")).toHaveCount(6);
});

test("移动端只读证据卡不显示编辑入口", async ({ page, isMobile }) => {
  test.skip(!isMobile, "只在移动端项目执行");
  await page.goto("/candidate");
  await page.getByTestId("offline-demo-button").click();
  await expect(page).toHaveURL(/\/result\//, { timeout: 20000 });
  await page.getByTestId("use-evidence-button").click();
  await page.getByTestId("recheck-button").click();
  await expect(page.getByTestId("score-number")).toContainText("78");
  await page.getByTestId("go-card-button").click();
  await expect(page.getByTestId("readonly-banner")).toBeVisible();
  await expect(page.getByTestId("evidence-card")).toContainText("下一步只做这一件事");
  await expect(page.getByTestId("recheck-button")).toHaveCount(0);
});
