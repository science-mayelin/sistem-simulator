import { NextResponse } from "next/server";

const CELESTRAK = (norad: number) =>
  `https://celestrak.org/NORAD/elements/gp.php?CATNR=${norad}&FORMAT=TLE`;

async function fetchTleLines(norad: number): Promise<string[]> {
  const res = await fetch(CELESTRAK(norad), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`CelesTrak ${norad}: ${res.status}`);
  }
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Proxy TLE from CelesTrak (avoids browser CORS). Cached 24h at the edge. */
export async function GET() {
  try {
    const [l8, l9] = await Promise.all([fetchTleLines(39084), fetchTleLines(49260)]);
    if (l8.length < 3 || l9.length < 3) {
      return NextResponse.json({ error: "TLE incompleto" }, { status: 502 });
    }
    return NextResponse.json({
      L8: l8,
      L9: l9,
      fetchedAt: Date.now(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al obtener TLE";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
