import { NextResponse } from "next/server";
import { addEvidence } from "@/lib/report-store";
import type { AddEvidenceInput } from "@/lib/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const input = (await request.json().catch(() => ({}))) as AddEvidenceInput;
  const report = await addEvidence(id, input);
  if (!report) {
    return NextResponse.json({ error: "没有找到这份体检报告" }, { status: 404 });
  }
  return NextResponse.json(report);
}
