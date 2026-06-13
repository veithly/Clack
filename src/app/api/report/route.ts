import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createReport, getSampleInput } from "@/lib/report-store";
import type { CreateReportInput } from "@/lib/types";

const SESSION_COOKIE = "clack_session";

function getSessionId(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const found = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (found?.[1]) return { sessionId: decodeURIComponent(found[1]), isNew: false };
  return { sessionId: `guest-${randomUUID()}`, isNew: true };
}

export async function GET() {
  return NextResponse.json(getSampleInput());
}

export async function POST(request: Request) {
  const session = getSessionId(request);
  const input = (await request.json().catch(() => ({}))) as CreateReportInput;
  const report = await createReport({ ...input, sessionId: session.sessionId, ownerId: session.sessionId, role: "candidate" });
  const response = NextResponse.json(report);
  if (session.isNew) {
    response.cookies.set(SESSION_COOKIE, session.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });
  }
  return response;
}
