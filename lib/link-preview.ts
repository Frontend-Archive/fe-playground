const REVALIDATE_SECONDS = 60 * 60 * 24;
const FETCH_TIMEOUT_MS = 6000;
const HEAD_SLICE = 120_000;

const USER_AGENT =
  "FrontendArchiveBot/1.0 (+https://github.com/Frontend-Archive/archive)";

/**
 * 로그인 벽 뒤라 스크래퍼에게는 서비스 기본값만 돌려주는 호스트.
 * 긁어봐야 전부 같은 로고와 같은 제목이라 아예 요청하지 않는다.
 */
const OPAQUE_HOSTS = [/(^|\.)notion\.com$/, /(^|\.)notion\.so$/];

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export type LinkPreview = {
  image: string | null;
  description: string | null;
};

export const EMPTY_PREVIEW: LinkPreview = { image: null, description: null };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const token = String(entity);

    if (token.startsWith("#x") || token.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(token.slice(2), 16));
    }
    if (token.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(token.slice(1), 10));
    }
    return ENTITIES[token.toLowerCase()] ?? match;
  });
}

const META_TAG = /<meta\b[^>]*>/gi;
const ATTRIBUTE =
  /([a-z][a-z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;

/**
 * 메타 태그를 속성 단위로 뜯는다.
 * 속성 순서가 뒤집히거나 따옴표가 없는 minified HTML 이 흔해서
 * `property="og:x"` 한 가지 모양만 가정하면 절반쯤 놓친다.
 */
function readMeta(html: string, property: string): string | null {
  for (const tag of html.match(META_TAG) ?? []) {
    const attributes: Record<string, string> = {};

    ATTRIBUTE.lastIndex = 0;
    let attribute = ATTRIBUTE.exec(tag);
    while (attribute !== null) {
      attributes[attribute[1].toLowerCase()] =
        attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
      attribute = ATTRIBUTE.exec(tag);
    }

    const key = (attributes.property ?? attributes.name)?.toLowerCase();
    if (key === property && attributes.content !== undefined) {
      const value = decodeEntities(attributes.content).trim();
      if (value !== "") return value;
    }
  }

  return null;
}

function isOpaqueHost(url: URL): boolean {
  return OPAQUE_HOSTS.some((pattern) => pattern.test(url.hostname));
}

/**
 * 티스토리는 og:image 를 다음 CDN 썸네일러(/thumb/R800x0/)로 내보낸다.
 * 128px 박스에 800px 원본은 과해서 경로의 크기 토큰만 낮춰 받는다 (187KB → 52KB).
 */
function shrinkKnownThumbnail(url: URL): URL {
  if (!/(^|\.)daumcdn\.net$/.test(url.hostname)) return url;

  url.pathname = url.pathname.replace(
    /^\/thumb\/[RC]\d+x\d+\//,
    "/thumb/R320x0/",
  );
  return url;
}

function toAbsoluteImage(value: string | null, pageUrl: URL): string | null {
  if (value === null || value === "") return null;
  // 메타데이터에 객체를 그대로 넣어 직렬화가 깨진 블로그가 있다.
  if (value === "[object Object]" || value.startsWith("[object")) return null;

  try {
    const resolved = new URL(value, pageUrl);
    if (resolved.protocol !== "https:") return null;
    if (isOpaqueHost(resolved)) return null;
    return shrinkKnownThumbnail(resolved).href;
  } catch {
    return null;
  }
}

export async function getLinkPreview(rawUrl: string): Promise<LinkPreview> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return EMPTY_PREVIEW;
  }

  if (isOpaqueHost(url)) return EMPTY_PREVIEW;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) return EMPTY_PREVIEW;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) return EMPTY_PREVIEW;

    const head = (await response.text()).slice(0, HEAD_SLICE);

    const description =
      readMeta(head, "og:description") ?? readMeta(head, "description");

    return {
      image: toAbsoluteImage(readMeta(head, "og:image"), url),
      description: description === "" ? null : description,
    };
  } catch {
    // 타임아웃이든 DNS 실패든, 미리보기 하나 때문에 회차 전체를 잃지는 않는다.
    return EMPTY_PREVIEW;
  }
}

/** 썸네일이 없을 때 대신 보여줄 출처 이름. */
export function getSourceLabel(rawUrl: string): string {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }

  if (/(^|\.)tistory\.com$/.test(host)) return "tistory";
  if (/(^|\.)notion\.(com|so)$/.test(host)) return "notion";
  if (/(^|\.)velog\.io$/.test(host)) return "velog";
  if (/(^|\.)medium\.com$/.test(host)) return "medium";
  if (/(^|\.)github\.(com|io)$/.test(host)) return "github";
  if (/(^|\.)vercel\.app$/.test(host)) return host.split(".")[0];

  return host;
}
