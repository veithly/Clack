import { NextResponse } from "next/server";
import { getCard } from "@/lib/report-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const card = await getCard(id);
  if (!card) {
    return NextResponse.json({ error: "没有找到这张证据卡" }, { status: 404 });
  }
  return NextResponse.json(card);
}
