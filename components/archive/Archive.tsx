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
import type { Archive as ArchiveType } from "@/types/archive";

export default function Archive({ archive }: { archive: ArchiveType }) {
  return (
    <Card key={archive.url} className="relative mx-auto w-full max-w-sm pt-0">
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
  );
}
