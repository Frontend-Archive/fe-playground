"use client";

import { MapPin, Wifi } from "lucide-react";

import ArticleRow from "@/components/archive/ArticleRow";
import { useReveal } from "@/hooks/useReveal";
import { formatSessionDate } from "@/lib/archive-utils";
import type { ArchiveSession } from "@/types/archive";

const MEETING_META = {
  "off-line": { label: "오프라인", Icon: MapPin },
  "on-line": { label: "온라인", Icon: Wifi },
} as const;

type SessionBlockProps = {
  session: ArchiveSession;
  query: string;
  activeMembers: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
};

export default function SessionBlock({
  session,
  query,
  activeMembers,
  activeTags,
  onToggleTag,
}: SessionBlockProps) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const { label, Icon } = MEETING_META[session.type];
  const ordinal = String(session.id).padStart(2, "0");
  const headingId = `session-${session.id}`;

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      data-reveal
      data-revealed={revealed}
      className="grid grid-cols-[1.25rem_1fr] gap-x-4 pb-14 md:grid-cols-[7.5rem_1fr] md:gap-x-8 md:pb-20"
    >
      <div className="relative flex justify-end gap-5">
        <span
          aria-hidden
          className="sticky top-28 hidden self-start font-mono font-bold text-5xl text-foreground/15 leading-none tabular md:block"
        >
          {ordinal}
        </span>

        <span aria-hidden className="relative w-px bg-rail">
          <span className="-left-[5px] absolute top-2 size-[11px] rounded-full bg-brand ring-4 ring-background" />
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          <time dateTime={session.date} className="tabular">
            {formatSessionDate(session.date)}
          </time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Icon className="size-3" strokeWidth={2} aria-hidden />
            {label}
          </span>
          <span aria-hidden>·</span>
          <span className="tabular">아티클 {session.articles.length}</span>
        </div>

        <h2
          id={headingId}
          className="mt-1.5 font-semibold text-2xl tracking-tight md:text-[28px]"
        >
          <span
            aria-hidden
            className="mr-2 font-mono font-bold text-brand tabular md:hidden"
          >
            {ordinal}
          </span>
          {session.title}
        </h2>

        <ul
          data-stagger
          data-revealed={revealed}
          className="mt-4 divide-y divide-border/70 border-border/70 border-t"
        >
          {session.articles.map((article) => (
            <ArticleRow
              key={article.url}
              article={article}
              query={query}
              activeMembers={activeMembers}
              activeTags={activeTags}
              onToggleTag={onToggleTag}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
