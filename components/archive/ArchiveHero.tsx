import ThemeToggle from "@/components/theme/ThemeToggle";
import type { ArchiveStats } from "@/lib/archive-utils";

function formatRange(from: string | null, to: string | null): string | null {
  if (from === null || to === null) return null;

  const short = (date: string) => date.slice(0, 7).replace("-", ".");
  return from === to ? short(from) : `${short(from)} — ${short(to)}`;
}

export default function ArchiveHero({ stats }: { stats: ArchiveStats }) {
  const range = formatRange(stats.firstDate, stats.lastDate);

  const metrics = [
    { label: "Sessions", value: stats.sessions },
    { label: "Articles", value: stats.articles },
    { label: "Members", value: stats.members },
    { label: "Tags", value: stats.tags },
  ];

  return (
    <header className="relative overflow-hidden border-border/70 border-b">
      <div
        aria-hidden
        className="-z-10 pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_28rem_at_15%_-15%,var(--brand-subtle),transparent_65%)] opacity-60"
      />

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6 md:pt-10 md:pb-16">
        <div className="flex items-start justify-between gap-4">
          <p className="font-medium font-mono text-[11px] text-brand uppercase tracking-[0.22em]">
            Frontend Archive
          </p>
          <ThemeToggle />
        </div>

        <h1 className="mt-8 text-balance font-semibold text-[clamp(2.75rem,9vw,5.25rem)] leading-[0.92] tracking-[-0.035em] md:mt-12">
          개발자들의
          <br />
          발자취
        </h1>

        <p className="mt-6 max-w-md text-[15px] text-muted-foreground leading-relaxed">
          매 회차마다 각자 파고든 주제를 글로 남깁니다. 멤버나 태그를 눌러
          원하는 기록만 골라 보세요.
        </p>

        <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 md:mt-12">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
                {metric.label}
              </dt>
              <dd className="mt-1 font-mono font-bold text-3xl leading-none tabular">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        {range !== null && (
          <p className="mt-8 font-mono text-[11px] text-muted-foreground tabular">
            {range}
          </p>
        )}
      </div>
    </header>
  );
}
