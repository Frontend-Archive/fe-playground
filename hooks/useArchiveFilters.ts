"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type ArchiveFilters,
  EMPTY_FILTERS,
  hasActiveFilters,
  serializeFilters,
} from "@/lib/archive-utils";

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/**
 * 필터 상태를 로컬로 들고, URL만 뒤따라 갱신한다.
 * router.replace 를 쓰면 24개짜리 목록 하나에 RSC 왕복이 붙어서
 * history API 로 주소만 바꾸고 서버는 건드리지 않는다.
 */
export function useArchiveFilters(initial: ArchiveFilters) {
  const [filters, setFilters] = useState<ArchiveFilters>(initial);

  const queryString = useMemo(() => serializeFilters(filters), [filters]);

  useEffect(() => {
    const next = `${window.location.pathname}${queryString}`;
    if (next === `${window.location.pathname}${window.location.search}`) return;

    window.history.replaceState(null, "", next);
  }, [queryString]);

  const setQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, q }));
  }, []);

  const toggleMember = useCallback((member: string) => {
    setFilters((prev) => ({ ...prev, members: toggle(prev.members, member) }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => ({ ...prev, tags: toggle(prev.tags, tag) }));
  }, []);

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return {
    filters,
    isFiltered: hasActiveFilters(filters),
    setQuery,
    toggleMember,
    toggleTag,
    reset,
  };
}
