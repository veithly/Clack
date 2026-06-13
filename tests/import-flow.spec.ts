import { expect, test } from "@playwright/test";

test("公开岗位链接可以拉取成 JD 文本", async ({ page }) => {
  await page.goto("/");
  const reportUrl = new URL("/api/report", page.url()).toString();
  await page.getByTestId("jd-url-input").fill(reportUrl);
  await page.getByTestId("import-jd-url-button").click();

  await expect(page.getByTestId("jd-input")).toContainText("产品运营实习生");
  await expect(page.getByTestId("import-receipts")).toContainText("JD 已从链接拉取");
});

test("TXT 简历上传会填入简历输入框", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("upload-resume-button")).toBeVisible();
  await page.getByTestId("resume-file-input").setInputFiles({
    name: "resume.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("大三学生，做过校园社群运营。负责报名页、问卷调研和活动复盘，能说明转化率变化。")
  });

  await expect(page.getByTestId("resume-input")).toContainText("校园社群运营");
  await expect(page.getByTestId("import-receipts")).toContainText("简历文件：resume.txt");
});

test("PDF 简历上传会解析文字并填入简历输入框", async ({ page, browser }) => {
  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`
    <main style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6">
      <h1>产品运营实习简历</h1>
      <p>做过校园社群运营、用户调研和活动复盘。</p>
      <p>负责问卷调研 86 名同学，优化报名页，转化率从 21% 提升到 39%。</p>
    </main>
  `);
  const pdf = await pdfPage.pdf({ format: "A4" });
  await pdfPage.close();

  await page.goto("/");
  await page.getByTestId("resume-file-input").setInputFiles({
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: pdf
  });

  await expect(page.getByTestId("resume-input")).toContainText("校园社群运营");
  await expect(page.getByTestId("import-receipts")).toContainText("简历文件：resume.pdf");
});
