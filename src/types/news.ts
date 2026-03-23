export type NewsSource =
  | "arxiv"
  | "semantic"
  | "pubmed"
  | "openalex"
  | "spaceflight"
  | "hackernews"
  | "nasa"
  | "jpl";

export type NewsCategory =
  | "space"
  | "physics"
  | "cs_ai"
  | "biology"
  | "medicine"
  | "technology"
  | "climate"
  | "general";

export type NewsType = "paper" | "news";

export interface NewsItem {
  id: string;
  source: NewsSource;
  type: NewsType;
  category: NewsCategory;
  title: string;
  summary: string;
  url: string;
  date: string;
  authors?: string[];
  citationCount?: number;
  openAccessPdf?: string;
  imageUrl?: string;
  journal?: string;
  score?: number;
}

export interface NewsResponse {
  items: NewsItem[];
  fetchedAt: string;
  sources: {
    [key in NewsSource]?: { count: number; ok: boolean; error?: string };
  };
}
