"use client";

import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { useId, useState } from "react";

import type { ArchiveFacets, ArchiveFilters } from "@/lib/archive-utils";
import { cn } from "@/lib/utils";

type ArchiveFilterBarProps = {
  facets: ArchiveFacets;
  filters: ArchiveFilters;
  isFiltered: boolean;
  resultCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onToggleMember: (member: string) => void;
  onToggleTag: (tag: string) => void;
  onReset: () => void;
};

function Chip({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "font-mono text-[10px] tabular",
          active ? "opacity-70" : "opacity-60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function ArchiveFilterBar({
  facets,
  filters,
  isFiltered,
  resultCount,
  totalCount,
  onQueryChange,
  onToggleMember,
  onToggleTag,
  onReset,
}: ArchiveFilterBarProps) {
  const searchId = useId();
  const tagPanelId = useId();
  const [tagsOpen, setTagsOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-border/70 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              아티클 검색
            </label>
            <Search
              aria-hidden
              strokeWidth={1.75}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id={searchId}
              type="search"
              value={filters.q}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="제목, 작성자, 태그 검색"
              autoComplete="off"
              className={cn(
                "h-11 w-full rounded-full border border-border bg-muted/40 pr-10 pl-9 text-base transition-colors duration-200 sm:text-sm",
                "placeholder:text-muted-foreground focus:border-brand/60 focus:bg-background focus:outline-2 focus:outline-brand focus:outline-offset-1",
                "[&::-webkit-search-cancel-button]:appearance-none",
              )}
            />
            {filters.q !== "" && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="검색어 지우기"
                className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X className="size-4" strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setTagsOpen((open) => !open)}
            aria-expanded={tagsOpen}
            aria-controls={tagPanelId}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 text-[13px] text-muted-foreground transition-colors duration-200 hover:border-brand/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            태그
            <span className="font-mono text-[11px] tabular">
              {filters.tags.length > 0
                ? `${filters.tags.length}/${facets.tags.length}`
                : facets.tags.length}
            </span>
            <ChevronDown
              aria-hidden
              strokeWidth={2}
              className={cn(
                "size-3.5 transition-transform duration-200",
                tagsOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {facets.members.map((member) => (
            <Chip
              key={member.value}
              label={member.value}
              count={member.count}
              active={filters.members.includes(member.value)}
              onClick={() => onToggleMember(member.value)}
            />
          ))}

          <p
            aria-live="polite"
            className="ml-auto font-mono text-[11px] text-muted-foreground tabular"
          >
            {isFiltered
              ? `${resultCount} / ${totalCount} ARTICLES`
              : `${totalCount} ARTICLES`}
          </p>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] text-muted-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
              초기화
            </button>
          )}
        </div>

        {/* display 유틸 충돌을 피하려고 hidden 은 flex 를 쓰지 않는 바깥 래퍼에 건다. */}
        <div
          id={tagPanelId}
          className={cn(
            "border-border/70 border-t pt-3",
            !tagsOpen && "hidden",
          )}
        >
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto sm:max-h-56">
            {facets.tags.map((tag) => (
              <Chip
                key={tag.value}
                label={`#${tag.value}`}
                count={tag.count}
                active={filters.tags.includes(tag.value)}
                onClick={() => onToggleTag(tag.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
