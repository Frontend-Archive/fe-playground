import matter from "gray-matter";

import { EMPTY_PREVIEW, getLinkPreview } from "@/lib/link-preview";
import type {
  ArchiveMeetingType,
  ArchiveSession,
  Article,
} from "@/types/archive";

const REPO = "Frontend-Archive/archive";
const ARCHIVES_DIR = "archives";
const REVALIDATE_SECONDS = 60 * 60 * 24;

const MEETING_TYPES: ArchiveMeetingType[] = ["on-line", "off-line"];

type ContentsEntry = {
  name: string;
  type: string;
  download_url: string | null;
};

async function listArchiveFiles(): Promise<ContentsEntry[]> {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${ARCHIVES_DIR}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to list ${ARCHIVES_DIR}: ${response.status} ${response.statusText}`,
    );
  }

  const entries: ContentsEntry[] = await response.json();

  return entries.filter(
    (entry) =>
      entry.type === "file" &&
      entry.name.endsWith(".md") &&
      entry.download_url !== null,
  );
}

async function fetchRawFile(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download ${downloadUrl}: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toArticle(value: unknown): Article | null {
  if (typeof value !== "object" || value === null) return null;

  const { author, title, url, tags } = value as Record<string, unknown>;

  // 원본 레포에는 발표자만 적히고 글이 비어 있는 항목이 섞여 있다.
  if (
    !isNonEmptyString(author) ||
    !isNonEmptyString(title) ||
    !isNonEmptyString(url)
  ) {
    return null;
  }

  return {
    author,
    title,
    url,
    tags: Array.isArray(tags) ? tags.filter(isNonEmptyString) : [],
    ...EMPTY_PREVIEW,
  };
}

/**
 * 링크 대상에서 og 태그를 긁어 아티클에 붙인다.
 * 전부 병렬로 돌리고, 하나가 느리거나 죽어도 나머지는 그대로 간다.
 */
async function attachPreviews(
  sessions: ArchiveSession[],
): Promise<ArchiveSession[]> {
  const articles = sessions.flatMap((session) => session.articles);
  const previews = await Promise.all(
    articles.map((article) => getLinkPreview(article.url)),
  );

  const byUrl = new Map(
    articles.map((article, index) => [article.url, previews[index]]),
  );

  return sessions.map((session) => ({
    ...session,
    articles: session.articles.map((article) => ({
      ...article,
      ...(byUrl.get(article.url) ?? EMPTY_PREVIEW),
    })),
  }));
}

function toSession(data: unknown): ArchiveSession | null {
  if (typeof data !== "object" || data === null) return null;

  const { id, date, title, type, articles } = data as Record<string, unknown>;

  if (typeof id !== "number") return null;
  if (!isNonEmptyString(date) || !isNonEmptyString(title)) return null;
  if (!MEETING_TYPES.includes(type as ArchiveMeetingType)) return null;
  if (!Array.isArray(articles)) return null;

  const parsedArticles = articles
    .map(toArticle)
    .filter((article): article is Article => article !== null);

  if (parsedArticles.length === 0) return null;

  return {
    id,
    date,
    title,
    type: type as ArchiveMeetingType,
    articles: parsedArticles,
  };
}

/**
 * 원본 레포의 archives 디렉토리를 읽어 회차 목록을 최신순으로 돌려준다.
 * 파일 하나가 깨져도 나머지 회차는 살린다.
 */
export async function getArchiveSessions(): Promise<ArchiveSession[]> {
  const files = await listArchiveFiles();

  const sessions = await Promise.all(
    files.map(async (file) => {
      try {
        const raw = await fetchRawFile(file.download_url as string);
        return toSession(matter(raw).data);
      } catch {
        return null;
      }
    }),
  );

  const parsed = sessions
    .filter((session): session is ArchiveSession => session !== null)
    .sort((a, b) => b.date.localeCompare(a.date));

  return attachPreviews(parsed);
}
