import { NextResponse } from "next/server";
import {
  fetchArxivAllCategories,
  fetchHackerNews,
  fetchOpenAlex,
  fetchPubMed,
  fetchRSSFeed,
  fetchSemanticScholar,
  fetchSpaceflightNews,
} from "@/lib/news-fetchers";
import type { NewsItem, NewsResponse, NewsSource } from "@/types/news";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const sourceResults: NewsResponse["sources"] = {};

  function mergeSource(
    key: NewsSource,
    count: number,
    ok: boolean,
    error?: string
  ) {
    const prev = sourceResults[key];
    if (!prev) {
      sourceResults[key] = { count, ok, error };
      return;
    }
    sourceResults[key] = {
      count: prev.count + count,
      ok: prev.ok && ok,
      error: ok ? prev.error : (prev.error ?? error),
    };
  }

  function extract(
    result: PromiseSettledResult<NewsItem[]>,
    key: NewsSource
  ): NewsItem[] {
    if (result.status === "fulfilled") {
      mergeSource(key, result.value.length, true);
      return result.value;
    }
    mergeSource(key, 0, false, String(result.reason));
    return [];
  }

  const [
    spaceflightRes,
    hackerNewsRes,
    nasaRSSRes,
    jplRSSRes,
    arxivRes,
    ssSpaceRes,
    ssAIRes,
    ssClimateRes,
    pubmedSpaceRes,
    pubmedBioRes,
    openalexRes,
  ] = await Promise.allSettled([
    fetchSpaceflightNews(15),
    fetchHackerNews(12),
    fetchRSSFeed(
      "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      "nasa"
    ),
    fetchRSSFeed("https://www.jpl.nasa.gov/rss/news.php", "jpl"),
    fetchArxivAllCategories(),
    fetchSemanticScholar("space exploration satellite 2024", 6, "space"),
    fetchSemanticScholar(
      "artificial intelligence deep learning 2024",
      6,
      "cs_ai"
    ),
    fetchSemanticScholar(
      "climate change earth observation 2024",
      5,
      "climate"
    ),
    fetchPubMed("space medicine astronaut", 6, "medicine"),
    fetchPubMed("computational biology genomics", 5, "biology"),
    fetchOpenAlex("satellite remote sensing open access", 6, "technology"),
  ]);

  const allItems: NewsItem[] = [
    ...extract(spaceflightRes, "spaceflight"),
    ...extract(hackerNewsRes, "hackernews"),
    ...extract(nasaRSSRes, "nasa"),
    ...extract(jplRSSRes, "jpl"),
    ...extract(arxivRes, "arxiv"),
    ...extract(ssSpaceRes, "semantic"),
    ...extract(ssAIRes, "semantic"),
    ...extract(ssClimateRes, "semantic"),
    ...extract(pubmedSpaceRes, "pubmed"),
    ...extract(pubmedBioRes, "pubmed"),
    ...extract(openalexRes, "openalex"),
  ];

  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    if (!item.title || !item.url) return false;
    const key = item.title
      .slice(0, 70)
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = deduped.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const response: NewsResponse = {
    items: sorted,
    fetchedAt: new Date().toISOString(),
    sources: sourceResults,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
    },
  });
}
