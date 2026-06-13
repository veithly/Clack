import { NextResponse } from "next/server";
import { getReport } from "@/lib/report-store";
import { rewriteClaimToStar } from "@/lib/ai-actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { gapId } = (await request.json().catch(() => ({}))) as { gapId?: string };
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "没有找到这份体检报告" }, { status: 404 });
  }
  const gap = report.gaps.find((item) => item.id === gapId) ?? report.gaps.find((item) => item.status !== "proven") ?? report.gaps[0];
  if (!gap) {
    return NextResponse.json({ error: "没有可改写的证据缺口" }, { status: 400 });
  }
  const claim = report.claims.find((item) => item.requirementId === gap.requirementId);
  const binding = report.evidenceBindings?.find((item) => item.claimId === claim?.id);
  const result = await rewriteClaimToStar({
    requirement: gap.requirement,
    claimTitle: claim?.title ?? gap.title,
    currentEvidence: gap.currentEvidence,
    missingEvidence: gap.missingEvidence,
    evidenceQuote: binding && binding.match !== "none" ? binding.evidenceQuote : undefined
  });
  return NextResponse.json({ ...result, gapId: gap.id, gapTitle: gap.title });
}
