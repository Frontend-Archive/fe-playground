import { ImageResponse } from "next/og";

import { getStats } from "@/lib/archive-utils";
import { getArchiveSessions } from "@/lib/archives";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — ${SITE.tagline}`;

const EYEBROW = "FRONTEND ARCHIVE";
const INK = "#1C1917";
const MUTED = "#78716C";
const BRAND = "#B34200";
const PAPER = "#FBF9F6";

/**
 * Satori 는 폰트 바이너리를 직접 넘겨야 한글을 그린다.
 * 구글 폰트 CSS API 에 쓰일 글자만 넘겨 서브셋 TTF(약 23KB)를 받아온다.
 * woff2 를 모르는 UA 로 요청해야 truetype 링크가 돌아온다.
 */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((response) => response.text());

    const source = /src:\s*url\((https:\/\/[^)]+)\)/.exec(css)?.[1];
    if (source === undefined) return null;

    return await fetch(source).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  let metrics: Array<[string, number]> = [];

  try {
    const stats = getStats(await getArchiveSessions());
    metrics = [
      ["SESSIONS", stats.sessions],
      ["ARTICLES", stats.articles],
      ["MEMBERS", stats.members],
    ];
  } catch {
    // 원본 레포를 못 읽어도 카드 자체는 나가야 한다.
  }

  const headline = SITE.name;
  const label = metrics.map(([name]) => name).join("");
  const font = await loadFont(
    `${headline}${SITE.tagline}${EYEBROW}${label}0123456789 ·`,
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PAPER,
        padding: "72px 80px",
        borderBottom: `16px solid ${BRAND}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: BRAND,
            fontWeight: 700,
          }}
        >
          {EYEBROW}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: font === null ? 96 : 132,
            lineHeight: 1.05,
            letterSpacing: -4,
            color: INK,
            fontWeight: 700,
          }}
        >
          {font === null ? SITE.tagline : headline}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 64 }}>
        {metrics.map(([name, value]) => (
          <div key={name} style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 4,
                color: MUTED,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 68,
                lineHeight: 1,
                color: INK,
                fontWeight: 700,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts:
        font === null
          ? undefined
          : [
              {
                name: "Noto Sans KR",
                data: font,
                weight: 700,
                style: "normal",
              },
            ],
    },
  );
}
