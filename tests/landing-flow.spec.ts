import { expect, test } from "@playwright/test";

test("着陆页展示四角色总览与多智能体流水线", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("screen-landing")).toBeVisible();
  await expect(page.getByTestId("role-card-candidate")).toBeVisible();
  await expect(page.getByTestId("role-card-enterprise")).toBeVisible();
  await expect(page.getByTestId("role-card-school")).toBeVisible();
  await expect(page.getByTestId("role-card-admin")).toBeVisible();
  await expect(page.getByText("6 步真实推理，不是 1 次黑箱打分")).toBeVisible();
});

test("一键跑完整故事会自动跑完真实模型流水线并直达结果页", async ({ page }) => {
  test.setTimeout(80000);
  await page.goto("/");
  await page.getByTestId("run-story-button").click();
  // 一键故事走真实模型，分数不固定，断言流程跑通与关键面板可见即可。
  await expect(page).toHaveURL(/\/result\//, { timeout: 70000 });
  await expect(page.getByTestId("recruiter-twin")).toBeVisible({ timeout: 70000 });
  await expect(page.getByTestId("agent-readout")).toBeVisible();
});

test("顶部导航可在四角色工作台之间跳转", async ({ page }) => {
  await page.goto("/candidate");
  await page.getByRole("navigation", { name: "主要页面" }).getByRole("link", { name: "企业" }).click();
  await expect(page).toHaveURL(/\/enterprise$/);
  await expect(page.getByTestId("screen-enterprise")).toBeVisible();
});
