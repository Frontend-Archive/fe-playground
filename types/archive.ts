export type ArchiveMeetingType = "on-line" | "off-line";

export type Article = {
  author: string;
  title: string;
  url: string;
  tags: string[];
  /** 링크 대상의 og:image. 긁히지 않는 글이 많아 없는 경우가 정상이다. */
  image: string | null;
  /** 링크 대상의 og:description. */
  description: string | null;
};

/** 스터디 한 회차. archives/YYYYMM.md 파일 하나에 대응한다. */
export type ArchiveSession = {
  id: number;
  date: string;
  title: string;
  type: ArchiveMeetingType;
  articles: Article[];
};
