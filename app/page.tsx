import ArchiveHero from "@/components/archive/ArchiveHero";
import ArchiveTimeline from "@/components/archive/ArchiveTimeline";
import { getStats, parseFilters } from "@/lib/archive-utils";
import { getArchiveSessions } from "@/lib/archives";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [sessions, params] = await Promise.all([
    getArchiveSessions(),
    searchParams,
  ]);

  const stats = getStats(sessions);
  const initialFilters = parseFilters(params);

  return (
    <>
      <a
        href="#archive"
        className="sr-only rounded-full bg-foreground px-4 py-2 text-background text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:outline-2 focus:outline-brand focus:outline-offset-2"
      >
        아카이브 목록으로 건너뛰기
      </a>

      <ArchiveHero stats={stats} />

      <div id="archive" className="flex flex-1 flex-col">
        {sessions.length === 0 ? (
          <p className="mx-auto w-full max-w-5xl px-4 py-24 text-center text-muted-foreground sm:px-6">
            아직 불러온 회차가 없어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : (
          <ArchiveTimeline
            sessions={sessions}
            initialFilters={initialFilters}
          />
        )}
      </div>

      <footer className="border-border/70 border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <a
            href="https://github.com/Frontend-Archive/archive"
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            Frontend-Archive/archive ↗
          </a>
        </div>
      </footer>
    </>
  );
}
