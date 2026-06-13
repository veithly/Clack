import { expect, test } from "@playwright/test";

test("投前体检主路径：样例 -> 结果 -> 补证据 -> 证据卡 -> 轨迹", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("screen-home")).toBeVisible();
  await page.getByTestId("demo-sample-button").click();
  await expect(page.getByTestId("start-check-button")).toBeEnabled();
  await page.getByTestId("start-check-button").click();

  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByTestId("traffic-light-result")).toContainText("先补 1 个证据再投");
  await expect(page.getByTestId("score-number")).toContainText("42");
  await expect(page.getByTestId("evidence-gap-item")).toHaveCount(3);

  await page.getByTestId("use-evidence-button").click();
  await page.getByTestId("recheck-button").click();
  await expect(page.getByTestId("score-number")).toContainText("78");
  await expect(page.getByTestId("traffic-light-result")).toContainText("可以投");

  await page.getByTestId("go-card-button").click();
  await expect(page).toHaveURL(/\/card\//);
  await expect(page.getByTestId("evidence-card")).toContainText("可以投");
  await expect(page.getByTestId("card-score")).toContainText("78");

  await page.getByText("查看智能体轨迹").click();
  await expect(page).toHaveURL(/\/trace\//);
  await expect(page.getByTestId("agent-trace-node")).toHaveCount(5);
});

test("移动端只读证据卡不显示编辑入口", async ({ page, isMobile }) => {
  test.skip(!isMobile, "只在移动端项目执行");
  await page.goto("/");
  await page.getByTestId("demo-sample-button").click();
  await page.getByTestId("start-check-button").click();
  await expect(page).toHaveURL(/\/result\//);
  await page.getByTestId("use-evidence-button").click();
  await page.getByTestId("recheck-button").click();
  await expect(page.getByTestId("score-number")).toContainText("78");
  await page.getByTestId("go-card-button").click();
  await expect(page.getByTestId("readonly-banner")).toBeVisible();
  await expect(page.getByTestId("evidence-card")).toContainText("下一步只做这一件事");
  await expect(page.getByTestId("recheck-button")).toHaveCount(0);
});
