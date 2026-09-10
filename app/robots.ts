import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // 필터 URL 은 robots 로 막지 않는다. 크롤러가 들어와서
    // noindex 를 읽어야 이미 색인된 변형이 빠지기 때문이다.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
