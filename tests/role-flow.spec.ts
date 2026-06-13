import { expect, test } from "@playwright/test";

test("演示用户可以切换到不同权限工作台", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("demo-user-switcher")).toContainText("候选人");
  await expect(page.getByTestId("role-permission-strip")).toContainText("当前身份：候选人");

  await page.getByTestId("switch-role-enterprise").click();
  await expect(page.getByTestId("demo-user-switcher")).toContainText("企业复核员");
  await page.getByTestId("current-role-route").click();
  await expect(page).toHaveURL(/\/enterprise$/);
  await expect(page.getByTestId("role-permission-strip")).toContainText("当前身份：企业复核员");
  await expect(page.getByText("候选人证据队列")).toBeVisible();

  await page.getByTestId("switch-role-school").click();
  await page.getByTestId("current-role-route").click();
  await expect(page).toHaveURL(/\/school$/);
  await expect(page.getByTestId("role-permission-strip")).toContainText("当前身份：高校导师");
  await expect(page.getByText("缺口热力", { exact: true })).toBeVisible();

  await page.getByTestId("switch-role-admin").click();
  await page.getByTestId("current-role-route").click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId("role-permission-strip")).toContainText("当前身份：平台管理员");
  await expect(page.getByText("审计日志", { exact: true })).toBeVisible();
});
