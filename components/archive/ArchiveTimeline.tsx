"use client";

import { SearchX } from "lucide-react";
import { useMemo } from "react";

import ArchiveFilterBar from "@/components/archive/ArchiveFilterBar";
import SessionBlock from "@/components/archive/SessionBlock";
import { useArchiveFilters } from "@/hooks/useArchiveFilters";
import {
  type ArchiveFilters,
  countArticles,
  filterSessions,
  getFacets,
} from "@/lib/archive-utils";
import type { ArchiveSession } from "@/types/archive";

type ArchiveTimelineProps = {
  sessions: ArchiveSession[];
  initialFilters: ArchiveFilters;
};

export default function ArchiveTimeline({
  sessions,
  initialFilters,
}: ArchiveTimelineProps) {
  const { filters, isFiltered, setQuery, toggleMember, toggleTag, reset } =
    useArchiveFilters(initialFilters);

  const facets = useMemo(() => getFacets(sessions), [sessions]);
  const totalCount = useMemo(() => countArticles(sessions), [sessions]);
  const visible = useMemo(
    () => filterSessions(sessions, filters),
    [sessions, filters],
  );
  const resultCount = countArticles(visible);

  return (
    <>
      <ArchiveFilterBar
        facets={facets}
        filters={filters}
        isFiltered={isFiltered}
        resultCount={resultCount}
        totalCount={totalCount}
        onQueryChange={setQuery}
        onToggleMember={toggleMember}
        onToggleTag={toggleTag}
        onReset={reset}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-24 sm:px-6 md:pt-14">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <SearchX
              aria-hidden
              strokeWidth={1.25}
              className="size-10 text-muted-foreground"
            />
            <div>
              <p className="font-medium text-lg">조건에 맞는 아티클이 없어요</p>
              <p className="mt-1.5 text-muted-foreground text-sm">
                검색어를 줄이거나 선택한 멤버·태그를 해제해 보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="mt-1 inline-flex h-9 cursor-pointer items-center rounded-full border border-border px-4 text-[13px] transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          visible.map((session) => (
            <SessionBlock
              key={session.id}
              session={session}
              query={filters.q}
              activeMembers={filters.members}
              activeTags={filters.tags}
              onToggleTag={toggleTag}
            />
          ))
        )}
      </main>
    </>
  );
}
