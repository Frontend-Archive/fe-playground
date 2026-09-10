import type { Metadata } from "next";

import ArchiveHero from "@/components/archive/ArchiveHero";
import ArchiveTimeline from "@/components/archive/ArchiveTimeline";
import { getStats, hasActiveFilters, parseFilters } from "@/lib/archive-utils";
import { getArchiveSessions } from "@/lib/archives";
import { buildDescription, buildSocialMetadata, SITE } from "@/lib/site";
import type { ArchiveSession } from "@/types/archive";

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const [sessions, params] = await Promise.all([
    getArchiveSessions(),
    searchParams,
  ]);

  const stats = getStats(sessions);
  const filters = parseFilters(params);
  const description = buildDescription(stats);

  // 필터는 같은 목록을 잘라 보여줄 뿐이라 색인 대상이 아니다.
  // canonical 은 항상 맨 URL 로 보내고, noindex 로 중복 색인을 끊는다.
  if (hasActiveFilters(filters)) {
    const scope: string[] = [];
    if (filters.members.length > 0) {
      scope.push(`${filters.members.join(", ")}의 글`);
    }
    if (filters.tags.length > 0) {
      scope.push(filters.tags.map((tag) => `#${tag}`).join(" "));
    }
    if (filters.q.trim() !== "") scope.push(`"${filters.q.trim()}" 검색`);

    return {
      // 같은 세그먼트의 layout title.template 은 적용되지 않아 직접 붙인다.
      title: `${scope.join(" · ")} | ${SITE.name}`,
      description,
      alternates: { canonical: "/" },
      robots: { index: false, follow: true },
      ...buildSocialMetadata(description),
    };
  }

  return {
    description,
    alternates: { canonical: "/" },
    ...buildSocialMetadata(description),
  };
}

/**
 * 외부 글을 모아둔 목록이므로 저작자를 우리로 주장하지 않고
 * ItemList 안에 원문 링크만 순서대로 세운다.
 */
function buildJsonLd(sessions: ArchiveSession[], description: string) {
  const articles = sessions.flatMap((session) => session.articles);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE.url}/#archive`,
    url: SITE.url,
    name: `${SITE.name} | ${SITE.tagline}`,
    description,
    inLanguage: "ko-KR",
    isBasedOn: SITE.repo,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: article.url,
      })),
    },
  };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const [sessions, params] = await Promise.all([
    getArchiveSessions(),
    searchParams,
  ]);

  const stats = getStats(sessions);
  const initialFilters = parseFilters(params);
  const jsonLd = buildJsonLd(sessions, buildDescription(stats));

  return (
    <>
      {sessions.length > 0 && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD 는 스크립트 태그로만 넣을 수 있다. `<` 를 이스케이프해 조기 종료를 막는다.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <a
        href="#archive"
        className="sr-only rounded-full bg-foreground px-4 py-2 text-background text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:outline-2 focus:outline-brand focus:outline-offset-2"
      >
        아카이브 목록으로 건너뛰기
      </a>

      <ArchiveHero stats={stats} />

      <div id="archive" className="flex flex-1 flex-col">
        {sessions.length === 0 ? (
          <p className="mx-auto w-full max-w-5xl px-4 py-24 text-center text-muted-foreground sm:px-6">
            아직 불러온 회차가 없어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <ArchiveTimeline
            sessions={sessions}
            initialFilters={initialFilters}
          />
        )}
      </div>

      <footer className="border-border/70 border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener"
            className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            Frontend-Archive/archive ↗
          </a>
        </div>
      </footer>
    </>
  );
}
