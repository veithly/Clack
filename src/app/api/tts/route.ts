import { NextResponse } from "next/server";
import { synthesizeMimoSpeech } from "@/lib/mimo-tts";

export async function POST(request: Request) {
  const input = (await request.json().catch(() => ({}))) as { text?: string; style?: string };
  if (!input.text?.trim()) {
    return NextResponse.json({ error: "缺少要合成的中文文本" }, { status: 400 });
  }

  try {
    const result = await synthesizeMimoSpeech(input.text, input.style);
    if (!result) {
      return NextResponse.json({ error: "Mimo TTS 未配置" }, { status: 503 });
    }

    const body = new ArrayBuffer(result.audio.byteLength);
    new Uint8Array(body).set(result.audio);
    return new Response(body, {
      headers: {
        "Content-Type": `audio/${result.format}`,
        "Content-Disposition": `inline; filename=\"clack-tts.${result.format}\"`,
        "X-Mimo-Voice": result.voice,
        "X-Mimo-Model": result.model
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Mimo TTS 合成失败" }, { status: 502 });
  }
}
