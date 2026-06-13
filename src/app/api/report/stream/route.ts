import { randomUUID } from "node:crypto";
import { createReport } from "@/lib/report-store";
import type { PipelineEvent } from "@/lib/ai-pipeline";
import type { CreateReportInput } from "@/lib/types";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "clack_session";
// 每步至少占用的时间，让前端扫描台的逐 agent 点亮可被肉眼看到（真实调用本身更慢，这点开销可忽略）。
const MIN_STEP_MS = 170;

function getSessionId(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const found = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (found?.[1]) return { sessionId: decodeURIComponent(found[1]), isNew: false };
  return { sessionId: `guest-${randomUUID()}`, isNew: true };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const session = getSessionId(request);
  const input = (await request.json().catch(() => ({}))) as CreateReportInput;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        const onEvent = async (event: PipelineEvent) => {
          write(event);
          if (event.type === "agent_start") await sleep(MIN_STEP_MS);
        };
        const report = await createReport(
          { ...input, sessionId: session.sessionId, ownerId: session.sessionId, role: "candidate" },
          onEvent
        );
        write({
          type: "done",
          reportId: report.id,
          targetRole: report.targetRole,
          score: report.score,
          trafficLight: report.trafficLight,
          trafficLightLabel: report.trafficLightLabel,
          confidence: report.confidence,
          pipelineDepth: report.pipelineDepth
        });
      } catch {
        write({ type: "error", message: "分析流水线出错，请重试。" });
      } finally {
        controller.close();
      }
    }
  });

  const headers = new Headers({
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no"
  });
  if (session.isNew) {
    headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(session.sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 14}`
    );
  }
  return new Response(stream, { headers });
}
