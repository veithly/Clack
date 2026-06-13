# Clack

Clack 是一个投递前证据体检台：粘贴岗位 JD、导入简历和证明材料，先判断“这份简历里的声明有没有证据支撑”，再决定是否投递。

它不是简历润色器，也不替企业做录用判断。Clack 只输出岗位要求、候选人声明、证据缺口、最佳补证据动作和可分享的只读证据卡。

## 核心能力

- 岗位导入：支持粘贴 JD，也支持抓取公开岗位链接并抽取正文。
- 简历导入：支持粘贴文本、上传 TXT 和文字型 PDF。
- 证据体检：生成红黄绿就绪度、3 个关键证据缺口和 1 个最该补的动作。
- 证据复核：补充材料后刷新报告，展示分数变化和状态变化。
- 只读分享：生成候选人可分享的证据卡，企业端只看授权范围内的材料。
- 过程审计：保留 Agent Trace，展示 JD 解析、简历声明、证据核验和建议生成过程。
- 多角色空间：候选人、企业、高校和管理员视角使用同一套证据数据。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Framer Motion / GSAP
- lucide-react
- PDF.js
- OpenAI-compatible SDK
- Mimo TTS
- Cloudflare Workers / OpenNext / D1
- Playwright

## 本地运行

```bash
npm install
npm run dev -- --port 4387
```

打开 `http://localhost:4387`。

常用命令：

```bash
npm run typecheck
npm run build
npm run test:e2e
```

Cloudflare 构建和部署：

```bash
npm run cf:build
npm run cf:preview
npm run deploy
```

## 环境变量

AI 分析和语音播报都支持缺省降级；没有密钥时仍可使用演示样例和规则路径。

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_DEFAULT_MODEL=

MIMO_API_KEY=
MIMO_BASE_URL=
MIMO_TTS_MODEL=
MIMO_TTS_VOICE=
MIMO_TTS_FORMAT=
```

Cloudflare D1 绑定名为 `DB`，配置见 `wrangler.jsonc`。

## 工作流

```mermaid
flowchart LR
  A["岗位 JD"] --> B["岗位要求抽取"]
  C["简历文本"] --> D["候选人声明抽取"]
  E["证明材料"] --> F["证据核验"]
  B --> F
  D --> F
  F --> G["红黄绿就绪度"]
  F --> H["最佳补证据动作"]
  G --> I["只读证据卡"]
  H --> I
  F --> J["Agent Trace"]
```

## 项目结构

```text
src/app/                         Next.js App Router 页面和 API
src/components/home-client.tsx    候选人导入工作台
src/components/result-client.tsx  体检结果、补证据和语音播报
src/components/card-client.tsx    只读证据卡
src/components/trace-client.tsx   Agent Trace
src/components/commercial-workspaces.tsx
                                 企业、高校、管理员和证据护照空间
src/lib/report-store.ts          D1 / 本地文件双路径持久化
src/lib/ai-provider.ts           OpenAI-compatible 客户端配置
src/lib/ai-report.ts             结构化岗位证据分析
src/lib/mimo-tts.ts              Mimo TTS 封装
tests/                           Playwright 主流程测试
public/brand/                    品牌图形资源
public/vendor/pdf.worker.min.mjs PDF.js worker
```

## 代码提交约定

仓库只保存源码、配置、测试和必要运行静态资源。以下内容属于生成产物或本地材料，不应提交：

- `.next/`
- `.open-next/`
- `.wrangler/`
- `.data/`
- `node_modules/`
- `*.tsbuildinfo`
- `worker-configuration.d.ts`
- `pitch/`
- `docs/`
- `artifacts/`
- `outputs/`

## 边界

- 只判断声明和证据之间的可证明性。
- 不验证经历真假。
- 不做录用、淘汰或背调决定。
- 不读取未授权材料。
- 扫描版 PDF 和图片 OCR 属于后续增强方向。
