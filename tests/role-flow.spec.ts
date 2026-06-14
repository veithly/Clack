import { expect, test } from "@playwright/test";

test("登录页用演示账号快捷填入并进入对应工作台", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-screen")).toBeVisible();

  await page.getByTestId("demo-account-candidate").click();
  await expect(page.getByTestId("login-username")).toHaveValue("lin.zhiran");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/candidate$/);
  await expect(page.getByTestId("screen-home")).toBeVisible();

  await page.goto("/login");
  await page.getByTestId("demo-account-enterprise").click();
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/enterprise$/);
  await expect(page.getByTestId("screen-enterprise")).toBeVisible();
  await expect(page.getByTestId("queue-C-2048")).toBeVisible();

  await page.goto("/login");
  await page.getByTestId("demo-account-school").click();
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/school$/);
  await expect(page.getByTestId("screen-school")).toBeVisible();
  await expect(page.getByText("缺口热力", { exact: true })).toBeVisible();

  await page.goto("/login");
  await page.getByTestId("demo-account-admin").click();
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId("screen-admin")).toBeVisible();
  await expect(page.getByText("审计日志", { exact: true })).toBeVisible();
});

test("演示账号卡片可直达工作台", async ({ page }) => {
  await page.goto("/login?role=enterprise");
  await expect(page.getByTestId("login-username")).toHaveValue("zhou.chen");
  await page.getByTestId("demo-enter-school").click();
  await expect(page).toHaveURL(/\/school$/);
  await expect(page.getByTestId("screen-school")).toBeVisible();
});

test("企业复核：选中候选人展开证据包与 6 智能体分析", async ({ page }) => {
  await page.goto("/enterprise");
  await expect(page.getByTestId("evidence-package")).toBeVisible();
  await expect(page.getByTestId("pkg-agent")).toHaveCount(6);
  await expect(page.getByTestId("package-recruiter")).toBeVisible();

  // 切换到另一位候选人，证据包随之更新
  await page.getByTestId("queue-C-2049").click();
  await expect(page.getByTestId("evidence-package")).toContainText("数据分析");
  await expect(page.getByTestId("pkg-agent")).toHaveCount(6);

  // 人工三档结论可选，且只在企业端人工下结论
  await page.getByTestId("conclusion-需补充").click();
  await expect(page.getByTestId("review-control")).toContainText("已选：需要补证");
  await page.getByTestId("send-request").click();
  await expect(page.getByText("已发送，等待候选人在只读证据卡内补充材料。")).toBeVisible();
});
