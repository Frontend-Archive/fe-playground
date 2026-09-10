import type { Metadata } from "next";

/**
 * 배포 도메인. canonical 과 OG 태그는 절대 URL 이어야 해서 빌드/런타임에 확정한다.
 * NEXT_PUBLIC_SITE_URL 을 지정하지 않으면 Vercel 이 주는 프로덕션 도메인을 쓴다.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE = {
  url: resolveSiteUrl(),
  name: "개발자들의 발자취",
  tagline: "프론트엔드 스터디 아티클 아카이브",
  locale: "ko_KR",
  repo: "https://github.com/Frontend-Archive/archive",
} as const;

export function buildDescription(stats: {
  members: number;
  sessions: number;
  articles: number;
}): string {
  return `프론트엔드 개발자 ${stats.members}명이 ${stats.sessions}번의 스터디에서 남긴 글 ${stats.articles}편을 모았습니다. 성능 최적화, 디자인 패턴, React, TypeScript까지 회차별로 정리하고 멤버·태그로 골라 볼 수 있습니다.`;
}

/**
 * Next 의 메타데이터 병합은 얕아서, 하위 라우트가 openGraph 를 하나라도 지정하면
 * 상위의 openGraph 전체가 교체된다. 부분 지정을 금지하고 항상 통째로 만들어 쓴다.
 */
export function buildSocialMetadata(
  description: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const title = `${SITE.name} | ${SITE.tagline}`;

  return {
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: "/",
      siteName: SITE.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
