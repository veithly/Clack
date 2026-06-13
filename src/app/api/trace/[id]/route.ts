import { NextResponse } from "next/server";
import { getTrace } from "@/lib/report-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const trace = await getTrace(id);
  if (!trace) {
    return NextResponse.json({ error: "没有找到智能体轨迹" }, { status: 404 });
  }
  return NextResponse.json(trace);
}
