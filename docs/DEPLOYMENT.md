# 部署说明

咔哒使用 Next.js App Router + OpenNext for Cloudflare 部署到 Cloudflare Workers。P0 只需要一个 D1 数据库保存报告、证据卡和智能体轨迹；R2 证据文件桶是 P1 扩展，不阻塞当前演示。

PDF 简历解析发生在浏览器端，静态 worker 文件位于 `public/vendor/pdf.worker.min.mjs`，部署时由 OpenNext 作为静态资产发布。服务端不保存 PDF 原文件，只保存解析后的文本、文件名和体检报告。

## 需要的绑定和密钥

| 名称 | 类型 | 用途 | 设置方式 |
| --- | --- | --- | --- |
| `DB` | Cloudflare D1 | 保存体检报告、`sessionId`、`ownerId`、`shareToken` 和报告 JSON | `wrangler d1 create clack-db` 后回填 `wrangler.jsonc` |
| `OPENAI_API_KEY` | Worker Secret | 接入 OpenAI-compatible 模型 | `wrangler secret put OPENAI_API_KEY` |
| `OPENAI_BASE_URL` | Worker Vars | 当前 `https://api.stepfun.com/v1` | 已写入 `wrangler.jsonc` |
| `OPENAI_DEFAULT_MODEL` | Worker Vars | 当前 `step-2-mini` | 已写入 `wrangler.jsonc` |

## 首次部署

```bash
npm install
npx wrangler login
npx wrangler d1 create clack-db
```

把命令返回的 `database_id` 写入 `wrangler.jsonc` 的 `d1_databases[0].database_id`。

```bash
npx wrangler secret put OPENAI_API_KEY
npm run cf:build
npx wrangler deploy
```

OpenNext 会把 Next.js 产物输出到 `.open-next/`，再由 Wrangler 发布到 Workers。

## 本地预览

```bash
npm run cf:preview
```

本地预览会使用 Wrangler 的本地 D1 模拟。应用第一次写入报告时会自动创建 `reports` 表和索引。

## 线上烟测

部署后记录 Workers URL 到 `stack.lock.json > deploy.production_url`，然后执行：

```bash
curl -I https://<your-worker>.workers.dev
PLAYWRIGHT_BASE_URL=https://<your-worker>.workers.dev npm run test:e2e
```

通过后把烟测时间写入 `stack.lock.json > deploy.smoke_tested_at`。

当前正式地址：

```text
https://clack.veithly.workers.dev
```

当前部署版本：

```text
4d8a9ee3-a1fa-4e53-9aa5-31edfa8a6375
```

最新公开验证：

```text
2026-06-15 00:00:58 +08:00
Workers 首页 200；页面标题为“咔哒 / Clack”；metadata 和 User-Agent 已切到 clack.veithly.workers.dev；Playwright 线上桌面端 hero-flow 通过。
```

## 边界

- 浏览器端永远不读取 `OPENAI_API_KEY`。
- D1 记录按 `sessionId`、`ownerId`、`shareToken` 保存归属和分享边界。
- 当前 P0 支持文字型 PDF/TXT 简历解析，但不保存上传原文件，只保存解析文本和补充证明材料。文件型证据、截图和作品集进入 P1 时再启用 R2。
