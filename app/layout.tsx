import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { buildSocialMetadata, SITE } from "@/lib/site";
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

/** 아카이브를 못 읽었을 때만 쓰이는 설명. 정상 경로에서는 page 가 실제 수치로 덮는다. */
const FALLBACK_DESCRIPTION = `${SITE.tagline}. 회차별로 정리하고 멤버·태그로 골라 볼 수 있습니다.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: FALLBACK_DESCRIPTION,
  applicationName: SITE.name,
  category: "technology",
  keywords: [
    "프론트엔드",
    "프론트엔드 스터디",
    "개발 블로그 모음",
    "아티클 아카이브",
    "React",
    "TypeScript",
    "디자인 패턴",
    "성능 최적화",
  ],
  alternates: { canonical: "/" },
  ...buildSocialMetadata(FALLBACK_DESCRIPTION),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
