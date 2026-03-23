import { NextResponse } from "next/server";

const MAX_TRANSLATE_LENGTH = 900;

async function translateToSpanish(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return text;
  const input = clean.slice(0, MAX_TRANSLATE_LENGTH);
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
    return translated || text;
  } catch {
    return text;
  }
}

export async function GET() {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "NASA_API_KEY no configurada" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `NASA APOD: ${res.status}`, detail: text.slice(0, 200) },
        { status: res.status }
      );
    }
    const data = (await res.json()) as Record<string, unknown>;
    const title = typeof data.title === "string" ? data.title : "";
    const explanation = typeof data.explanation === "string" ? data.explanation : "";
    if (title) {
      data.title_es = await translateToSpanish(title);
    }
    if (explanation) {
      data.explanation_es = await translateToSpanish(explanation);
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
