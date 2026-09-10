import { ArrowUpRight } from "lucide-react";

import { getInitial, splitByQuery } from "@/lib/archive-utils";
import { getSourceLabel } from "@/lib/link-preview";
import { cn } from "@/lib/utils";
import type { Article } from "@/types/archive";

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = splitByQuery(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.matched ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: 원본 문자열을 순서대로 자른 조각이라 인덱스가 곧 정체성이다.
          <mark key={index} className="rounded bg-brand-subtle text-foreground">
            {part.text}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: 위와 동일
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

/**
 * 출처 라벨을 항상 깔아두고 그 위에 이미지를 덮는다.
 * og:image 가 없거나 로딩에 실패해도 빈 칸 대신 출처가 남는다.
 * 좁은 화면에서는 제목이 읽을 폭을 못 가져가서 통째로 접는다.
 */
function Thumbnail({ article }: { article: Article }) {
  return (
    <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted sm:block">
      <span className="absolute inset-0 flex items-center justify-center px-1 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
        {getSourceLabel(article.url)}
      </span>

      {article.image !== null && (
        // biome-ignore lint/performance/noImgElement: 아카이브 링크의 호스트를 미리 알 수 없어 next/image remotePatterns 를 못 건다.
        <img
          src={article.image}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}

type ArticleRowProps = {
  article: Article;
  query: string;
  activeMembers: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
};

export default function ArticleRow({
  article,
  query,
  activeMembers,
  activeTags,
  onToggleTag,
}: ArticleRowProps) {
  const memberActive = activeMembers.includes(article.author);

  return (
    <li className="group relative">
      <div className="-mx-3 flex items-start gap-3 rounded-xl px-3 py-4 transition-colors duration-200 group-hover:bg-muted/70 sm:gap-4 sm:py-5">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border font-medium text-[11px] transition-colors duration-200",
            memberActive
              ? "border-brand/40 bg-brand text-brand-foreground"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {getInitial(article.author)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
            {article.author}
          </p>

          <h3 className="mt-1 text-pretty font-medium text-[15px] leading-snug transition-colors duration-200 group-hover:text-brand sm:text-base">
            <a
              href={article.url}
              target="_blank"
              rel="noopener"
              className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-brand focus-visible:after:outline-offset-2"
            >
              <Highlight text={article.title} query={query} />
              <span className="sr-only"> (새 탭에서 열림)</span>
            </a>
          </h3>

          {article.description !== null && (
            <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground leading-relaxed">
              <Highlight text={article.description} query={query} />
            </p>
          )}

          {article.tags.length > 0 && (
            <ul className="relative z-10 mt-2.5 flex flex-wrap gap-2">
              {article.tags.map((tag) => {
                const active = activeTags.includes(tag);

                return (
                  <li key={tag}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => onToggleTag(tag)}
                      className={cn(
                        "inline-flex h-7 cursor-pointer items-center rounded-full border px-2.5 font-mono text-[11px] transition-colors duration-200",
                        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
                        active
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border/70 bg-background/60 text-muted-foreground hover:border-brand/50 hover:text-brand",
                      )}
                    >
                      #{tag}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Thumbnail article={article} />

        <ArrowUpRight
          aria-hidden
          strokeWidth={1.75}
          className="mt-1 hidden size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand group-hover:opacity-100 sm:block"
        />
      </div>
    </li>
  );
}
