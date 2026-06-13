import { NextResponse } from "next/server";
import { getReport } from "@/lib/report-store";
import { compareJobReadiness, type CompareJobInput } from "@/lib/ai-actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { jobs } = (await request.json().catch(() => ({}))) as { jobs?: Array<{ title?: string; jdText?: string }> };
  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: "没有找到这份体检报告" }, { status: 404 });
  }

  const extraJobs: CompareJobInput[] = (Array.isArray(jobs) ? jobs : [])
    .map((job, index) => ({
      id: `extra-${index + 1}`,
      title: (job.title ?? "").trim() || `对比岗位 ${index + 1}`,
      jdText: (job.jdText ?? "").trim()
    }))
    .filter((job) => job.jdText.length > 20);

  if (extraJobs.length === 0) {
    return NextResponse.json({ error: "再贴 1 到 3 个岗位 JD，才能对比先投哪个" }, { status: 400 });
  }

  const allJobs: CompareJobInput[] = [
    { id: "current", title: report.targetRole, jdText: report.jdText },
    ...extraJobs
  ];

  const result = await compareJobReadiness({
    resumeText: report.resumeText,
    evidenceText: report.evidenceText,
    jobs: allJobs
  });
  return NextResponse.json(result);
}
