import type { MetadataRoute } from "next";

import { getArchiveSessions } from "@/lib/archives";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let lastModified = new Date();

  try {
    const sessions = await getArchiveSessions();
    const latest = sessions.at(0)?.date;
    if (latest !== undefined) lastModified = new Date(`${latest}T00:00:00Z`);
  } catch {
    // 원본 레포를 못 읽어도 사이트맵 자체는 나가야 한다.
  }

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
