import { NextResponse } from "next/server";

function todayUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const key = process.env.NASA_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "NASA_API_KEY no configurada" },
      { status: 500 }
    );
  }

  const date = todayUtc();
  try {
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `NASA NEO: ${res.status}`, detail: text.slice(0, 200) },
        { status: res.status }
      );
    }
    const data = (await res.json()) as {
      near_earth_objects?: Record<string, unknown[]>;
    };
    const list = data.near_earth_objects?.[date] ?? [];
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
