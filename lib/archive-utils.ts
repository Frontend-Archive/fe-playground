import type { ArchiveSession, Article } from "@/types/archive";

export type ArchiveFilters = {
  q: string;
  members: string[];
  tags: string[];
};

export type Facet = {
  value: string;
  count: number;
};

export type ArchiveFacets = {
  members: Facet[];
  tags: Facet[];
};

export type ArchiveStats = {
  sessions: number;
  articles: number;
  members: number;
  tags: number;
  firstDate: string | null;
  lastDate: string | null;
};

export const EMPTY_FILTERS: ArchiveFilters = { q: "", members: [], tags: [] };

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function countBy(
  sessions: ArchiveSession[],
  pick: (article: Article) => string[],
): Facet[] {
  const counts = new Map<string, number>();

  for (const session of sessions) {
    for (const article of session.articles) {
      for (const value of pick(article)) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "ko"));
}

export function getFacets(sessions: ArchiveSession[]): ArchiveFacets {
  return {
    members: countBy(sessions, (article) => [article.author]),
    tags: countBy(sessions, (article) => article.tags),
  };
}

export function getStats(sessions: ArchiveSession[]): ArchiveStats {
  const facets = getFacets(sessions);
  const dates = sessions.map((session) => session.date).sort();

  return {
    sessions: sessions.length,
    articles: sessions.reduce(
      (total, session) => total + session.articles.length,
      0,
    ),
    members: facets.members.length,
    tags: facets.tags.length,
    firstDate: dates.at(0) ?? null,
    lastDate: dates.at(-1) ?? null,
  };
}

function matchesQuery(
  article: Article,
  session: ArchiveSession,
  query: string,
): boolean {
  if (query === "") return true;

  const haystack = normalize(
    [article.title, article.author, session.title, ...article.tags].join(" "),
  );

  return haystack.includes(query);
}

/**
 * 회차 구조를 유지한 채 아티클만 걸러낸다.
 * 남은 아티클이 없는 회차는 타임라인에서 통째로 빠진다.
 */
export function filterSessions(
  sessions: ArchiveSession[],
  filters: ArchiveFilters,
): ArchiveSession[] {
  const query = normalize(filters.q);
  const members = new Set(filters.members);
  const tags = new Set(filters.tags);

  if (query === "" && members.size === 0 && tags.size === 0) return sessions;

  return sessions
    .map((session) => ({
      ...session,
      articles: session.articles.filter(
        (article) =>
          (members.size === 0 || members.has(article.author)) &&
          (tags.size === 0 || article.tags.some((tag) => tags.has(tag))) &&
          matchesQuery(article, session, query),
      ),
    }))
    .filter((session) => session.articles.length > 0);
}

export function countArticles(sessions: ArchiveSession[]): number {
  return sessions.reduce(
    (total, session) => total + session.articles.length,
    0,
  );
}

export function hasActiveFilters(filters: ArchiveFilters): boolean {
  return (
    filters.q.trim() !== "" ||
    filters.members.length > 0 ||
    filters.tags.length > 0
  );
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ArchiveFilters {
  const toList = (value: string | string[] | undefined): string[] => {
    if (value === undefined) return [];
    const raw = Array.isArray(value) ? value : value.split(",");
    return raw.map((item) => item.trim()).filter((item) => item !== "");
  };

  return {
    q: typeof params.q === "string" ? params.q : "",
    members: toList(params.member),
    tags: toList(params.tag),
  };
}

export function serializeFilters(filters: ArchiveFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim() !== "") params.set("q", filters.q.trim());
  if (filters.members.length > 0)
    params.set("member", filters.members.join(","));
  if (filters.tags.length > 0) params.set("tag", filters.tags.join(","));

  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

/** 검색어와 겹치는 구간을 표시하기 위해 텍스트를 조각으로 나눈다. */
export function splitByQuery(
  text: string,
  query: string,
): Array<{ text: string; matched: boolean }> {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [{ text, matched: false }];

  const haystack = text.toLowerCase();
  const parts: Array<{ text: string; matched: boolean }> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) break;

    if (found > cursor) {
      parts.push({ text: text.slice(cursor, found), matched: false });
    }
    parts.push({
      text: text.slice(found, found + needle.length),
      matched: true,
    });
    cursor = found + needle.length;
  }

  if (parts.length === 0) return [{ text, matched: false }];
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), matched: false });
  }

  return parts;
}

export function formatSessionDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function getInitial(name: string): string {
  return name.trim().slice(-2);
}
