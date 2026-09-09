export type ArchiveMeetingType = "on-line" | "off-line";

export type Article = {
  author: string;
  title: string;
  url: string;
  tags: string[];
};

/** 스터디 한 회차. archives/YYYYMM.md 파일 하나에 대응한다. */
export type ArchiveSession = {
  id: number;
  date: string;
  title: string;
  type: ArchiveMeetingType;
  articles: Article[];
};
