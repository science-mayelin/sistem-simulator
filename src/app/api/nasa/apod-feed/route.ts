import { NextRequest, NextResponse } from "next/server";

const APOD_FIRST_DAY_UTC = Date.UTC(1995, 5, 16);
const MAX_TRANSLATE_LENGTH = 900;
const translationCache = new Map<string, string>();

type ApodFeedItem = {
  title?: string;
  explanation?: string;
  [key: string]: unknown;
};

function sanitizeCount(input: string | null): number {
  const n = Number(input);
  if (!Number.isFinite(n)) return 10;
  return Math.min(10, Math.max(6, Math.floor(n)));
}

function sanitizePage(input: string | null): number {
  const n = Number(input);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function toDateOnlyUTC(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addDaysUTC(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDateUTC(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function translateToSpanish(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return text;
  const input = clean.slice(0, MAX_TRANSLATE_LENGTH);
  const cacheKey = `es:${input}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(
      input
    )}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return text;
    const raw = (await res.json()) as unknown;
    if (!Array.isArray(raw) || !Array.isArray(raw[0])) return text;
    const translated = (raw[0] as unknown[])
      .map((chunk) => (Array.isArray(chunk) ? String(chunk[0] ?? "") : ""))
      .join("")
      .trim();
    const finalText = translated || text;
    translationCache.set(cacheKey, finalText);
    return finalText;
  } catch {
    return text;
  }
}

export async function GET(req: NextRequest) {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "NASA_API_KEY no configurada" },
      { status: 500 }
    );
  }

  const pageSize = sanitizeCount(req.nextUrl.searchParams.get("pageSize"));
  const page = sanitizePage(req.nextUrl.searchParams.get("page"));
  const todayUtc = toDateOnlyUTC(new Date());
  const endDate = addDaysUTC(todayUtc, -(page * pageSize));
  const startDate = addDaysUTC(endDate, -(pageSize - 1));

  if (endDate.getTime() < APOD_FIRST_DAY_UTC) {
    return NextResponse.json({ items: [], hasMore: false });
  }

  const safeStart =
    startDate.getTime() < APOD_FIRST_DAY_UTC
      ? new Date(APOD_FIRST_DAY_UTC)
      : startDate;

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(
      key
    )}&start_date=${formatDateUTC(safeStart)}&end_date=${formatDateUTC(endDate)}&thumbs=true`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `NASA APOD feed: ${res.status}`, detail: text.slice(0, 250) },
        { status: res.status }
      );
    }

    const raw = (await res.json()) as unknown;
    const data = (Array.isArray(raw) ? raw : []) as ApodFeedItem[];
    data.sort((a, b) => {
      const ad = typeof a === "object" && a && "date" in a ? String((a as { date: string }).date) : "";
      const bd = typeof b === "object" && b && "date" in b ? String((b as { date: string }).date) : "";
      return bd.localeCompare(ad);
    });
    for (const item of data) {
      const title = typeof item.title === "string" ? item.title : "";
      const explanation = typeof item.explanation === "string" ? item.explanation : "";
      if (title) {
        item.title_es = await translateToSpanish(title);
      }
      if (explanation) {
        item.explanation_es = await translateToSpanish(explanation);
      }
    }
    const hasMore = safeStart.getTime() > APOD_FIRST_DAY_UTC;
    return NextResponse.json({ items: data, hasMore });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
