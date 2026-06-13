import { NextResponse } from "next/server";
import { getReport } from "@/lib/report-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "没有找到这份体检报告" }, { status: 404 });
  }
  return NextResponse.json(report);
}
