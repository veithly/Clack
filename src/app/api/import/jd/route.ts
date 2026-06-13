import { NextResponse } from "next/server";

const MAX_HTML_BYTES = 1_000_000;
const MAX_TEXT_LENGTH = 6000;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function stripHtml(html: string) {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  const title = withoutNoise.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const body = withoutNoise
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|section|article|h1|h2|h3)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return normalizeWhitespace(decodeHtmlEntities(`${title}\n${body}`)).slice(0, MAX_TEXT_LENGTH);
}

function isAllowedProtocol(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "请先粘贴岗位链接。" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "岗位链接格式不正确。" }, { status: 400 });
  }

  if (!isAllowedProtocol(url)) {
    return NextResponse.json({ error: "只支持 http 或 https 岗位链接。" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "ClackBot/1.0 (+https://touqian-tijian.veithly.workers.dev)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5"
      },
      redirect: "follow",
      signal: controller.signal
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: `岗位页面读取失败：HTTP ${upstream.status}` }, { status: 502 });
    }

    const contentLength = Number(upstream.headers.get("content-length") ?? 0);
    if (contentLength > MAX_HTML_BYTES) {
      return NextResponse.json({ error: "岗位页面过大，请复制核心 JD 文本。" }, { status: 413 });
    }

    const html = await upstream.text();
    if (html.length > MAX_HTML_BYTES) {
      return NextResponse.json({ error: "岗位页面过大，请复制核心 JD 文本。" }, { status: 413 });
    }

    const text = stripHtml(html);
    if (text.length < 40) {
      return NextResponse.json({ error: "没有抓到足够岗位文字，请复制 JD 到左侧输入框。" }, { status: 422 });
    }

    return NextResponse.json({
      sourceUrl: url.toString(),
      text,
      characters: text.length
    });
  } catch {
    return NextResponse.json({ error: "岗位链接读取超时或不可访问，请复制 JD 到左侧输入框。" }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
