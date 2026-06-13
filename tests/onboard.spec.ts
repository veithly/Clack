import { expect, test } from "@playwright/test";

test("首访用户 60 秒内完成投前体检主路径", async ({ page }) => {
  const startedAt = Date.now();

  await page.goto("/candidate");
  await expect(page.getByTestId("screen-home")).toBeVisible();
  await page.getByTestId("offline-demo-button").click();

  // 开发模式首次跳转可能触发 Turbopack 冷编译，放宽导航超时。
  await expect(page).toHaveURL(/\/result\//, { timeout: 20000 });
  await expect(page.getByTestId("score-number")).toContainText("42");
  await page.getByTestId("use-evidence-button").click();
  await page.getByTestId("recheck-button").click();
  await expect(page.getByTestId("score-number")).toContainText("78");
  await expect(page.getByTestId("traffic-light-result")).toContainText("可以投");

  await page.getByTestId("go-card-button").click();
  await expect(page).toHaveURL(/\/card\//, { timeout: 20000 });
  await expect(page.getByTestId("evidence-card")).toContainText("下一步只做这一件事");

  expect(Date.now() - startedAt).toBeLessThan(60_000);
});
