import { XMLParser } from "fast-xml-parser";
import type {
  NewsCategory,
  NewsItem,
  NewsSource,
  NewsType,
} from "@/types/news";

export function safeDate(str: string | undefined | null): string {
  if (!str) return new Date().toISOString();
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function safeParsePubMedDate(str: string): string {
  if (!str) return new Date().toISOString();
  const normalized = str
    .replace(/(\d{4})\s+([A-Za-z]+)\s+(\d+)/, "$1-$2-$3")
    .replace(/(\d{4})\s+([A-Za-z]+)/, "$1-$2");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export async function fetchArxiv(
  category: string,
  categoryLabel: NewsCategory,
  maxResults = 6
): Promise<NewsItem[]> {
  try {
    const url = new URL("https://export.arxiv.org/api/query");
    url.searchParams.set("search_query", `cat:${category}`);
    url.searchParams.set("sortBy", "submittedDate");
    url.searchParams.set("sortOrder", "descending");
    url.searchParams.set("max_results", String(maxResults));

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    const text = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(text);
    const entries = parsed?.feed?.entry;
    if (!entries) return [];

    const list = Array.isArray(entries) ? entries : [entries];

    return list.map((e: Record<string, unknown>) => {
      const idStr = String(e.id ?? "");
      const absId = idStr.split("/abs/")[1] ?? idStr;
      return {
        id: `arxiv-${absId}`,
        source: "arxiv" as NewsSource,
        type: "paper" as NewsType,
        category: categoryLabel,
        title: String(e.title ?? "")
          .replace(/\s+/g, " ")
          .trim(),
        summary: String(e.summary ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 350),
        url: idStr,
        date: safeDate(String(e.published ?? "")),
        authors: (
          Array.isArray(e.author) ? e.author : e.author ? [e.author] : []
        )
          .map((a: { name?: string }) => a?.name ?? "")
          .filter(Boolean)
          .slice(0, 5),
        openAccessPdf: idStr
          ? idStr.replace("/abs/", "/pdf/") + ".pdf"
          : undefined,
      };
    });
  } catch {
    return [];
  }
}

const ARXIV_BATCH: {
  cat: string;
  label: NewsCategory;
  max: number;
}[] = [
  { cat: "cs.AI", label: "cs_ai", max: 6 },
  { cat: "astro-ph.GA", label: "space", max: 6 },
  { cat: "q-bio.BM", label: "biology", max: 5 },
  { cat: "cond-mat", label: "physics", max: 4 },
];

/** Sequential arXiv requests with delay to respect rate limits (~1 req / 3s). */
export async function fetchArxivAllCategories(): Promise<NewsItem[]> {
  const out: NewsItem[] = [];
  for (let i = 0; i < ARXIV_BATCH.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 3500));
    const { cat, label, max } = ARXIV_BATCH[i];
    const batch = await fetchArxiv(cat, label, max);
    out.push(...batch);
  }
  return out;
}

export async function fetchSemanticScholar(
  query: string,
  limit = 8,
  category: NewsCategory = "general"
): Promise<NewsItem[]> {
  try {
    const fields =
      "paperId,title,abstract,authors,year,citationCount,openAccessPdf,publicationDate,venue";
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=${fields}&limit=${limit}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "AstroApp/1.0" },
      next: { revalidate: 1800 },
    });
    const data = (await res.json()) as {
      data?: Array<{
        paperId: string;
        title?: string;
        abstract?: string;
        authors?: { name?: string }[];
        year?: number;
        citationCount?: number;
        openAccessPdf?: { url?: string } | null;
        publicationDate?: string;
        venue?: string;
      }>;
    };

    return (data.data ?? []).map((p) => ({
      id: `ss-${p.paperId}`,
      source: "semantic" as NewsSource,
      type: "paper" as NewsType,
      category,
      title: p.title ?? "",
      summary: (p.abstract ?? "").slice(0, 350),
      url: `https://www.semanticscholar.org/paper/${p.paperId}`,
      date: safeDate(
        p.publicationDate ?? `${p.year ?? new Date().getFullYear()}-01-01`
      ),
      authors: (p.authors ?? [])
        .map((a) => a.name)
        .filter(Boolean)
        .slice(0, 5) as string[],
      citationCount: p.citationCount ?? 0,
      openAccessPdf: p.openAccessPdf?.url ?? undefined,
      journal: p.venue ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchPubMed(
  query: string,
  maxResults = 8,
  category: NewsCategory = "medicine"
): Promise<NewsItem[]> {
  try {
    const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

    const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=date&retmode=json`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 1800 } });
    const searchData = (await searchRes.json()) as {
      esearchresult?: { idlist?: string[] };
    };
    const ids: string[] = searchData.esearchresult?.idlist ?? [];
    if (!ids.length) return [];

    const summaryUrl = `${baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl, { next: { revalidate: 1800 } });
    const summaryData = (await summaryRes.json()) as {
      result?: Record<
        string,
        {
          title?: string;
          fulljournalname?: string;
          source?: string;
          pubdate?: string;
          authors?: { name?: string }[];
        }
      >;
    };

    const mapped: NewsItem[] = [];
    for (const id of ids) {
      const doc = summaryData.result?.[id];
      if (!doc || !doc.title) continue;
      const abstractBits = [doc.fulljournalname, doc.source].filter(Boolean);
      mapped.push({
        id: `pm-${id}`,
        source: "pubmed",
        type: "paper",
        category,
        title: doc.title ?? "",
        summary: abstractBits.join(" — ").slice(0, 350),
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        date: safeParsePubMedDate(doc.pubdate ?? ""),
        authors: (doc.authors ?? [])
          .slice(0, 5)
          .map((a) => a.name)
          .filter(Boolean) as string[],
        journal: doc.fulljournalname ?? undefined,
      });
    }
    return mapped;
  } catch {
    return [];
  }
}

function reconstructAbstract(
  idx: Record<string, number[]> | null | undefined
): string {
  if (!idx || typeof idx !== "object") return "";
  try {
    const words: [string, number][] = Object.entries(idx).flatMap(
      ([word, positions]) =>
        positions.map((pos) => [word, pos] as [string, number])
    );
    return words
      .sort((a, b) => a[1] - b[1])
      .map(([w]) => w)
      .join(" ");
  } catch {
    return "";
  }
}

export async function fetchOpenAlex(
  query: string,
  limit = 8,
  category: NewsCategory = "general"
): Promise<NewsItem[]> {
  try {
    const url =
      `https://api.openalex.org/works?` +
      `filter=default.search:${encodeURIComponent(query)},open_access.is_oa:true` +
      `&sort=publication_date:desc&per-page=${limit}` +
      `&select=id,title,abstract_inverted_index,authorships,publication_date,primary_location,cited_by_count,open_access`;

    const res = await fetch(url, {
      headers: { "User-Agent": "mailto:app@astrociencia.com" },
      next: { revalidate: 1800 },
    });
    const data = (await res.json()) as {
      results?: Array<{
        id?: string;
        title?: string;
        abstract_inverted_index?: Record<string, number[]>;
        authorships?: Array<{ author?: { display_name?: string } }>;
        publication_date?: string;
        cited_by_count?: number;
        primary_location?: { source?: { display_name?: string } };
        open_access?: { oa_url?: string };
      }>;
    };

    return (data.results ?? [])
      .map((w) => {
        const oaUrl = w.open_access?.oa_url;
        const idShort = w.id?.split("/").pop() ?? "";
        return {
          id: `oa-${idShort}`,
          source: "openalex" as NewsSource,
          type: "paper" as NewsType,
          category,
          title: w.title ?? "",
          summary: reconstructAbstract(w.abstract_inverted_index).slice(0, 350),
          url: oaUrl ?? w.id ?? "",
          date: safeDate(w.publication_date ?? ""),
          authors: (w.authorships ?? [])
            .slice(0, 5)
            .map((a) => a.author?.display_name ?? "")
            .filter(Boolean),
          citationCount: w.cited_by_count ?? 0,
          journal: w.primary_location?.source?.display_name ?? undefined,
          openAccessPdf: oaUrl ?? undefined,
        } satisfies NewsItem;
      })
      .filter((x) => x.title && x.url);
  } catch {
    return [];
  }
}

export async function fetchSpaceflightNews(limit = 15): Promise<NewsItem[]> {
  try {
    const url = `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&ordering=-published_at`;
    const data = (await fetch(url, { next: { revalidate: 900 } }).then((r) =>
      r.json()
    )) as {
      results?: Array<{
        id: number;
        title?: string;
        summary?: string;
        url?: string;
        published_at?: string;
        image_url?: string;
      }>;
    };

    return (data.results ?? []).map((a) => ({
      id: `sfn-${a.id}`,
      source: "spaceflight" as NewsSource,
      type: "news" as NewsType,
      category: "space" as NewsCategory,
      title: a.title ?? "",
      summary: (a.summary ?? "").slice(0, 350),
      url: a.url ?? "",
      date: safeDate(a.published_at ?? ""),
      imageUrl: a.image_url ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchHackerNews(limit = 12): Promise<NewsItem[]> {
  try {
    const ids = (await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 600 } }
    ).then((r) => r.json())) as number[];

    const topIds = ids.slice(0, 30);

    const items = await Promise.all(
      topIds.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json()
        )
      )
    );

    return items
      .filter(
        (i: { url?: string; score?: number; type?: string }) =>
          i?.url && (i.score ?? 0) > 50 && i.type === "story"
      )
      .slice(0, limit)
      .map(
        (i: {
          id: number;
          title?: string;
          score?: number;
          descendants?: number;
          url?: string;
          time?: number;
        }) => ({
          id: `hn-${i.id}`,
          source: "hackernews" as NewsSource,
          type: "news" as NewsType,
          category: "cs_ai" as NewsCategory,
          title: i.title ?? "",
          summary: `${i.score} puntos · ${i.descendants ?? 0} comentarios en Hacker News`,
          url: i.url ?? `https://news.ycombinator.com/item?id=${i.id}`,
          date: safeDate(
            i.time != null ? new Date(i.time * 1000).toISOString() : undefined
          ),
          score: i.score,
        })
      );
  } catch {
    return [];
  }
}

export async function fetchRSSFeed(
  url: string,
  source: NewsSource
): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AstroApp/1.0" },
      next: { revalidate: 1800 },
    });
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: unknown } };
      feed?: { entry?: unknown };
    };

    const items =
      parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
    const list = Array.isArray(items) ? items : [items];

    return list
      .map((item: Record<string, unknown>) => {
        const link = String(item.link ?? item.id ?? "");
        const guid = item.guid;
        const guidStr =
          typeof guid === "object" && guid !== null && "text" in guid
            ? String((guid as { text?: string }).text ?? "")
            : String(guid ?? link);
        const rawDesc =
          item.description ??
          item.summary ??
          item["content:encoded"] ??
          "";
        const cleanDesc = String(rawDesc)
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 350);

        const enclosure = item.enclosure as
          | { "@_url"?: string }
          | undefined;
        const mediaContent = item["media:content"] as
          | { "@_url"?: string }
          | undefined;

        return {
          id: `${source}-${encodeURIComponent(guidStr || link || String(item.title))}`,
          source,
          type: "news" as NewsType,
          category: "space" as NewsCategory,
          title: String(item.title ?? "").trim(),
          summary: cleanDesc,
          url: link,
          date: safeDate(
            String(item.pubDate ?? item.published ?? "")
          ),
          imageUrl: enclosure?.["@_url"] ?? mediaContent?.["@_url"] ?? undefined,
        } satisfies NewsItem;
      })
      .filter((x) => x.title && x.url);
  } catch {
    return [];
  }
}
