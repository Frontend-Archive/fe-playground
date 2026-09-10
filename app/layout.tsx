import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "개발자들의 발자취 | Frontend Archive",
  description:
    "프론트엔드 스터디의 회차별 아티클 아카이브. 멤버와 태그로 골라 보세요.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// 하이드레이션 전에 테마를 확정해야 첫 페인트에서 흰 화면이 번쩍이지 않는다.
const THEME_INIT = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("h-full antialiased", sans.variable, mono.variable)}
    >
      <head>
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC 방지용 동기 실행 스크립트 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
