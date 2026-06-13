module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/import/jd/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const MAX_HTML_BYTES = 1_000_000;
const MAX_TEXT_LENGTH = 6000;
function normalizeWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
}
function decodeHtmlEntities(value) {
    return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}
function stripHtml(html) {
    const withoutNoise = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<svg[\s\S]*?<\/svg>/gi, " ");
    const title = withoutNoise.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const body = withoutNoise.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|section|article|h1|h2|h3)>/gi, "\n").replace(/<[^>]+>/g, " ");
    return normalizeWhitespace(decodeHtmlEntities(`${title}\n${body}`)).slice(0, MAX_TEXT_LENGTH);
}
function isAllowedProtocol(url) {
    return url.protocol === "http:" || url.protocol === "https:";
}
async function POST(request) {
    const body = await request.json().catch(()=>({}));
    const rawUrl = body.url?.trim();
    if (!rawUrl) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "请先粘贴岗位链接。"
        }, {
            status: 400
        });
    }
    let url;
    try {
        url = new URL(rawUrl);
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "岗位链接格式不正确。"
        }, {
            status: 400
        });
    }
    if (!isAllowedProtocol(url)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "只支持 http 或 https 岗位链接。"
        }, {
            status: 400
        });
    }
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 10_000);
    try {
        const upstream = await fetch(url, {
            headers: {
                "User-Agent": "TouqianTijianBot/1.0 (+https://touqian-tijian.veithly.workers.dev)",
                Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5"
            },
            redirect: "follow",
            signal: controller.signal
        });
        if (!upstream.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `岗位页面读取失败：HTTP ${upstream.status}`
            }, {
                status: 502
            });
        }
        const contentLength = Number(upstream.headers.get("content-length") ?? 0);
        if (contentLength > MAX_HTML_BYTES) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "岗位页面过大，请复制核心 JD 文本。"
            }, {
                status: 413
            });
        }
        const html = await upstream.text();
        if (html.length > MAX_HTML_BYTES) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "岗位页面过大，请复制核心 JD 文本。"
            }, {
                status: 413
            });
        }
        const text = stripHtml(html);
        if (text.length < 40) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "没有抓到足够岗位文字，请复制 JD 到左侧输入框。"
            }, {
                status: 422
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            sourceUrl: url.toString(),
            text,
            characters: text.length
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "岗位链接读取超时或不可访问，请复制 JD 到左侧输入框。"
        }, {
            status: 504
        });
    } finally{
        clearTimeout(timeout);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0a_-r-b._.js.map