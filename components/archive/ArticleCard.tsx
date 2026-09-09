import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Article } from "@/types/archive";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>{article.author}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <Button
          className="w-full"
          render={
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${article.title} 보러가기`}
            >
              보러가기
            </a>
          }
        />
      </CardFooter>
    </Card>
  );
}
