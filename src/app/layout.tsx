import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { DemoUserSwitcher } from "@/components/demo-user-switcher";
import { MotionEnhancer } from "@/components/motion-enhancer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://touqian-tijian.veithly.workers.dev"),
  title: "咔哒 / Clack",
  description: "贴岗位，贴简历，30 秒看能不能投。",
  openGraph: {
    title: "咔哒 / Clack",
    description: "30 秒体检 1 个岗位，先补 1 条证据再投。",
    images: ["/brand/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={outfit.variable}>
        <DemoUserSwitcher />
        {children}
        <CommandPalette />
        <MotionEnhancer />
      </body>
    </html>
  );
}
