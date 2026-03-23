import { NextResponse } from "next/server";
import type { EventFeedItem } from "@/types/events";

const EONET_LABELS: Record<string, string> = {
  Wildfires: "Incendio forestal",
  Volcanoes: "Volcán activo",
  "Severe Storms": "Tormenta severa",
  "Sea and Lake Ice": "Hielo marino",
  Floods: "Inundación",
  Earthquakes: "Sismo",
  Landslides: "Deslizamiento",
  Drought: "Sequía",
};

function getDateRange(daysBack = 7) {
  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];
  return { start, end };
}

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  const key = process.env.NASA_API_KEY || process.env.VITE_NASA_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "NASA_API_KEY no configurada" }, { status: 500 });
  }

  const { start, end } = getDateRange(7);
  const base = `https://api.nasa.gov`;

  try {
    const [flaresRaw, cmeRaw, gstRaw, earthRaw, apodRaw] = await Promise.all([
      fetchJson(`${base}/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${encodeURIComponent(key)}`),
      fetchJson(
        `${base}/DONKI/CMEAnalysis?startDate=${start}&endDate=${end}&mostAccurateOnly=true&api_key=${encodeURIComponent(
          key
        )}`
      ),
      fetchJson(`${base}/DONKI/GST?startDate=${start}&endDate=${end}&api_key=${encodeURIComponent(key)}`),
      fetchJson("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20"),
      fetchJson(`${base}/planetary/apod?api_key=${encodeURIComponent(key)}&thumbs=true`),
    ]);

    type Flare = { flrID?: string; classType?: string; beginTime?: string; endTime?: string; activeRegionNum?: number };
    type Cme = { time21_5?: string; speed?: number; type?: string; note?: string };
    type Gst = { gstID?: string; startTime?: string; allKpIndex?: Array<{ kpIndex?: number }> };
    type EonetEvent = {
      id?: string;
      title?: string;
      categories?: Array<{ title?: string }>;
      geometries?: Array<{ date?: string; coordinates?: number[] }>;
      sources?: Array<{ id?: string }>;
      closed?: string;
    };
    type EonetPayload = { events?: EonetEvent[] };
    type Apod = {
      date?: string;
      title?: string;
      explanation?: string;
      url?: string;
      hdurl?: string;
      media_type?: string;
      thumbnail_url?: string;
      copyright?: string;
    };

    const flares = normalizeArray<Flare>(flaresRaw).map((e) => {
      const startTime = e.beginTime || new Date().toISOString();
      const endTime = e.endTime ? new Date(e.endTime).getTime() : null;
      const beginTime = new Date(startTime).getTime();
      const duration = endTime ? `${Math.round((endTime - beginTime) / 60000)} min` : "en curso";
      const classType = e.classType || "N/A";
      const severityLabel = classType.startsWith("X")
        ? "X-class"
        : classType.startsWith("M")
          ? "M-class"
          : "Baja";
      return {
        id: e.flrID || `flr-${startTime}`,
        type: "flare",
        date: startTime,
        title: `Erupción solar clase ${classType}`,
        body: `Región activa ${e.activeRegionNum ?? "desconocida"}. Duración: ${duration}.`,
        severity: classType.startsWith("X")
          ? "high"
          : classType.startsWith("M")
            ? "medium"
            : "low",
        severityLabel,
        source: "NASA DONKI",
        raw: e,
      } as EventFeedItem;
    });

    const cme = normalizeArray<Cme>(cmeRaw).map((e) => {
      const speed = Math.round(e.speed ?? 0);
      return {
        id: `cme-${e.time21_5 || Math.random().toString(36).slice(2)}`,
        type: "cme",
        date: e.time21_5 || new Date().toISOString(),
        title: "Eyección de masa coronal (CME)",
        body: `Velocidad: ${speed} km/s. Tipo: ${e.type || "S"}. ${e.note || ""}`.trim(),
        severity: speed > 1000 ? "high" : speed > 500 ? "medium" : "low",
        severityLabel: speed > 1000 ? "Alta" : speed > 500 ? "Media" : "Baja",
        source: "NASA DONKI",
        raw: e,
      } as EventFeedItem;
    });

    const gst = normalizeArray<Gst>(gstRaw).map((e) => {
      const kp = e.allKpIndex?.[0]?.kpIndex ?? 0;
      return {
        id: e.gstID || `gst-${e.startTime || Date.now()}`,
        type: "gst",
        date: e.startTime || new Date().toISOString(),
        title: "Tormenta geomagnética",
        body: `Índice Kp máximo: ${kp || "N/A"}. Posibles auroras en altas latitudes.`,
        severity: kp >= 7 ? "high" : "medium",
        severityLabel: kp >= 7 ? `G${Math.min(5, Math.floor(kp / 2))}` : "G1-G2",
        source: "NASA DONKI",
        raw: e,
      } as EventFeedItem;
    });

    const earthEvents = normalizeArray<EonetEvent>((earthRaw as EonetPayload | null)?.events).map((e) => {
      const category = e.categories?.[0]?.title || "";
      const mapped = EONET_LABELS[category] || e.title || "Evento terrestre";
      return {
        id: e.id || `earth-${Math.random().toString(36).slice(2)}`,
        type: "earth",
        date: e.geometries?.[0]?.date || e.closed || new Date().toISOString(),
        title: mapped,
        body: `${e.title || mapped}. Fuente: ${e.sources?.[0]?.id || "NASA EONET"}.`,
        severity: "info",
        source: "NASA EONET",
        coords: e.geometries?.[0]?.coordinates ?? null,
        raw: e,
      } as EventFeedItem;
    });

    const apod = apodRaw as Apod | null;
    const apodEvent: EventFeedItem[] =
      apod?.date && apod?.title
        ? [
            {
              id: `apod-${apod.date}`,
              type: "apod",
              date: `${apod.date}T00:00:00Z`,
              title: apod.title,
              body: `${(apod.explanation || "").slice(0, 220)}...`,
              severity: "apod",
              source: "NASA APOD",
              imageUrl: apod.media_type === "video" ? apod.thumbnail_url || apod.url : apod.url,
              hdUrl: apod.hdurl,
              copyright: apod.copyright,
              raw: apod,
            },
          ]
        : [];

    const feed = [...flares, ...cme, ...gst, ...earthEvents, ...apodEvent].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      feed,
      range: { start, end },
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
