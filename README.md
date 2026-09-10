# 개발자들의 발자취

프론트엔드 스터디의 회차별 아티클 아카이브.

글 데이터는 이 저장소에 없습니다. [Frontend-Archive/archive](https://github.com/Frontend-Archive/archive)의 `archives/*.md`를 빌드/요청 시점에 읽어옵니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

http://localhost:3000

| 스크립트 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드 결과 실행 |
| `pnpm lint` | Biome 검사 |
| `pnpm format` | Biome 포매팅 |

## 환경 변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 배포 시 | canonical · `og:url` · sitemap의 절대 URL 기준. 없으면 Vercel 도메인, 그것도 없으면 `localhost:3000`으로 떨어집니다. |

`.env.example`을 복사해 쓰면 됩니다.

## 구조

```
app/
  page.tsx              데이터 로드 + 메타데이터 + JSON-LD
  layout.tsx            폰트 · 테마 초기화 · 기본 메타데이터
  opengraph-image.tsx   OG 카드 (1200×630) 생성
  robots.ts sitemap.ts
components/archive/     히어로 · 필터바 · 타임라인 · 회차 · 아티클 행
components/theme/       테마 토글
hooks/                  필터 상태(URL 동기화) · 스크롤 진입 감지
lib/
  archives.ts           원본 저장소에서 회차 로드
  link-preview.ts       링크 대상의 og:image · og:description 수집
  archive-utils.ts      필터링 · 검색 · 통계
  site.ts               사이트 상수 · 소셜 메타데이터
```

## 알아둘 점

**데이터 갱신은 24시간 주기입니다.** 원본 저장소에 푸시해도 웹훅이 없어 즉시 반영되지 않습니다. TTL이 지난 뒤 첫 요청은 이전 데이터를 받고 백그라운드에서 갱신되므로, 새 회차는 그다음 방문부터 보입니다.

**링크 미리보기는 절반 정도만 채워집니다.** 티스토리는 `og:image`와 `og:description`이 모두 잡히지만, Notion 링크는 로그인 벽이라 아무것도 못 가져옵니다(요청 자체를 건너뜁니다). 썸네일이 없으면 출처 이름 타일이 대신 표시됩니다.

**필터 URL은 색인되지 않습니다.** `?member=`, `?tag=`, `?q=`는 같은 목록을 잘라 보여줄 뿐이라 `noindex`이며 canonical은 항상 `/`를 가리킵니다.

## 새 회차 추가

이 저장소가 아니라 [Frontend-Archive/archive](https://github.com/Frontend-Archive/archive)에 `archives/YYYYMM.md`를 추가하면 됩니다.

```yaml
---
id: 7
date: '2026-09-19'
title: '스터디 7회차'
type: 'off-line'   # 또는 'on-line'
articles:
  - author: '홍길동'
    title: '글 제목'
    url: 'https://example.com/post'
    tags: ['React', '성능 개선']
---
```

`author` · `title` · `url` 중 하나라도 비면 그 항목은 건너뜁니다. 남은 글이 없는 회차는 통째로 표시되지 않습니다.

## 스택

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Base UI · Biome
