import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { MotionEnhancer } from "@/components/motion-enhancer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://touqian-tijian.veithly.workers.dev"),
  title: "咔哒 / Clack — 投之前，咔哒一下",
  description: "投之前，咔哒一下：把岗位和简历贴在一起，6 个智能体逐条核证据，30 秒给一个能不能投的判断。",
  openGraph: {
    title: "咔哒 / Clack — 投之前，咔哒一下",
    description: "投之前，咔哒一下：6 个智能体逐条核证据，30 秒看能不能投，每一步可追溯。",
    images: ["/brand/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={outfit.variable}>
        {children}
        <CommandPalette />
        <MotionEnhancer />
      </body>
    </html>
  );
}
