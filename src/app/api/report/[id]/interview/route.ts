import { NextResponse } from "next/server";
import { getReport } from "@/lib/report-store";
import { evaluateInterviewAnswer } from "@/lib/ai-actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { question, answer } = (await request.json().catch(() => ({}))) as { question?: string; answer?: string };
  if (!answer?.trim()) {
    return NextResponse.json({ error: "请先写下你的回答" }, { status: 400 });
  }
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "没有找到这份体检报告" }, { status: 404 });
  }
  const openGap = report.gaps.find((item) => item.status !== "proven") ?? report.gaps[0];
  const result = await evaluateInterviewAnswer({
    targetRole: report.targetRole,
    question: question?.trim() || "请展开说明你这段经历里的具体动作和结果。",
    answer,
    gapTitle: openGap?.title,
    missingEvidence: openGap?.missingEvidence
  });
  return NextResponse.json(result);
}
