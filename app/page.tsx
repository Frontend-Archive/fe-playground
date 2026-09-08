import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Archive } from "@/types/archive";

const EXAMPLE_ARCHIVE: Archive[] = [
  {
    author: "권시현",
    title:
      "Sentry 도입후에도 console을 찍고 있는 당신에게 (ft. 그대들의 Sentry는 안녕하신가요?)",
    url: "https://kwonsean.tistory.com/32",
    tags: ["Sentry"],
  },
  {
    author: "민준경",
    title: "레거시 프로젝트, 유지보수 기반 다지기",
    url: "https://jk-devv.vercel.app/blog/레거시-프로젝트-개선/",
    tags: ["유지보수"],
  },
  {
    author: "염승준",
    title: "메인스레드 쉬는 시간 압수하기",
    url: "https://yeomyeom.tistory.com/151#google_vignette",
    tags: ["CS", "성능 개선"],
  },
  {
    author: "최승원",
    title: "useQuery 는 어떻게 동작할까",
    url: "https://app.notion.com/p/seungwon-1/1-useQuery-3-14-3212a7ff711a805bb4efee7bbb16a1cc",
    tags: ["TanStack Query", "useQuery", "오픈소스 분석"],
  },
];

export default function Home() {
  return (
    <div>
      <header>개발자들의 발자취</header>
      <main>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_ARCHIVE.map((archive) => (
            <Card
              key={archive.url}
              className="relative mx-auto w-full max-w-sm pt-0"
            >
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <picture>
                <img
                  src="https://avatar.vercel.sh/shadcn1"
                  alt="Event cover"
                  className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
                />
              </picture>
              <CardHeader>
                <CardAction>
                  {archive.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </CardAction>
                <CardTitle>{archive.title}</CardTitle>
                <CardDescription>{archive.author}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">보러가기</Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
      <footer></footer>
    </div>
  );
}
