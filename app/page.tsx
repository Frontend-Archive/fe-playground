import ArticleCard from "@/components/archive/ArticleCard";
import { getArchiveSessions } from "@/lib/archives";

export default async function Home() {
  const sessions = await getArchiveSessions();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-bold text-3xl tracking-tight">개발자들의 발자취</h1>
      </header>

      <main className="flex flex-col gap-12">
        {sessions.map((session) => (
          <section key={session.id} aria-labelledby={`session-${session.id}`}>
            <div className="mb-4 flex items-baseline gap-3">
              <h2
                id={`session-${session.id}`}
                className="font-semibold text-xl"
              >
                {session.title}
              </h2>
              <time
                dateTime={session.date}
                className="text-muted-foreground text-sm"
              >
                {session.date}
              </time>
              <span className="text-muted-foreground text-sm">
                {session.type}
              </span>
            </div>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {session.articles.map((article) => (
                <li key={article.url} className="flex">
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
