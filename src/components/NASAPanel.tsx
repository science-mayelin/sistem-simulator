"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type { CelestialBody } from "@/data/planets";
import {
  fetchApodClient,
  fetchNeoClient,
  getPlanetScienceFacts,
  horizonsUnavailable,
  type ApodResponse,
  type NeoApproach,
} from "@/lib/nasa";

const fetcherFlags = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error("flags");
  return r.json() as Promise<{ isDemo: boolean }>;
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-700/50 ${className}`}
      aria-hidden
    />
  );
}

function embedVideoUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes("/embed/")) return url;
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, "")}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    /* ignore */
  }
  return url;
}

function isApodVideo(data: ApodResponse): boolean {
  if (data.media_type === "video") return true;
  const u = data.url.toLowerCase();
  return (
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("vimeo.com")
  );
}

function proxiedImageUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol === "https:" && u.hostname.includes("nasa.gov")) {
      return `/api/nasa/proxy-image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

function ApodSection() {
  const { data, error, isLoading } = useSWR<ApodResponse>(
    "nasa-apod",
    fetchApodClient,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  const [expanded, setExpanded] = useState(false);
  const [imgAttempt, setImgAttempt] = useState<"main" | "hd" | "thumb">("main");

  useEffect(() => {
    setImgAttempt("main");
  }, [data?.date]);

  const videoMode = useMemo(() => (data ? isApodVideo(data) : false), [data]);

  const imageSrc = useMemo(() => {
    if (!data || videoMode) return "";
    if (imgAttempt === "thumb" && data.thumbnail_url) {
      return proxiedImageUrl(data.thumbnail_url);
    }
    if (imgAttempt === "hd" && data.hdurl) {
      return proxiedImageUrl(data.hdurl);
    }
    return proxiedImageUrl(data.url);
  }, [data, imgAttempt, videoMode]);

  if (isLoading) {
    return (
      <section className="space-y-2">
        <Skeleton className="h-4 w-[75%]" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-400">
        No se pudo cargar APOD. {error instanceof Error ? error.message : ""}
      </p>
    );
  }

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-100">{data.title_es || data.title}</h3>
      {videoMode ? (
        <iframe
          title={data.title_es || data.title}
          src={embedVideoUrl(data.url)}
          className="aspect-video w-full rounded-lg border border-white/10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc || data.url}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-48 w-full rounded-lg border border-white/10 object-contain"
          onError={() => {
            if (imgAttempt === "main" && data.hdurl) setImgAttempt("hd");
            else if (imgAttempt !== "thumb" && data.thumbnail_url) {
              setImgAttempt("thumb");
            }
          }}
        />
      )}
      <p
        className={`text-xs leading-relaxed text-zinc-400 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {data.explanation_es || data.explanation}
      </p>
      <button
        type="button"
        className="text-xs text-amber-400 hover:underline"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? "ver menos" : "ver más"}
      </button>
    </section>
  );
}

function NeoSection() {
  const { data, error, isLoading } = useSWR<NeoApproach[]>(
    "nasa-neo",
    fetchNeoClient,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  if (isLoading) {
    return (
      <section className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </section>
    );
  }

  if (error || !data) {
    return (
      <p className="text-xs text-red-400">
        NEO no disponible. {error instanceof Error ? error.message : ""}
      </p>
    );
  }

  const slice = data.slice(0, 12);

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Asteroides cercanos (hoy)
      </h3>
      <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
        {slice.map((neo) => {
          const d = neo.estimated_diameter?.meters;
          const km =
            d != null
              ? ((d.estimated_diameter_min + d.estimated_diameter_max) / 2 / 1000).toFixed(2)
              : "—";
          const miss =
            neo.close_approach_data?.[0]?.miss_distance?.kilometers ?? "—";
          const haz = neo.is_potentially_hazardous_asteroid;
          return (
            <li
              key={neo.name}
              className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-200">{neo.name}</span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    haz
                      ? "bg-orange-500/25 text-orange-200"
                      : "bg-emerald-500/20 text-emerald-200"
                  }`}
                >
                  {haz ? "Monitoreado" : "Sin riesgo"}
                </span>
              </div>
              <span className="text-zinc-500">
                Ø ~{km} km · {miss} km
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PlanetScienceSection({ body }: { body: CelestialBody | null }) {
  const h = horizonsUnavailable();
  const facts = body ? getPlanetScienceFacts(body.name) : undefined;

  return (
    <section className="border-t border-white/10 pt-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Datos científicos (NASA / estáticos)
      </h3>
      {!body && (
        <p className="text-xs text-zinc-500">
          Haz clic en un planeta en la escena para ver contexto científico.
        </p>
      )}
      {body && !facts && (
        <p className="text-xs text-zinc-500">
          No hay ficha ampliada para este cuerpo. {h.note}
        </p>
      )}
      {body && facts && (
        <div className="space-y-2 text-xs text-zinc-300">
          <p>{facts.overview}</p>
          {facts.composition && (
            <p>
              <span className="text-zinc-500">Composición: </span>
              {facts.composition}
            </p>
          )}
          {facts.exploration && (
            <p>
              <span className="text-zinc-500">Exploración: </span>
              {facts.exploration}
            </p>
          )}
          <p className="text-[10px] text-zinc-600">{facts.source}</p>
        </div>
      )}
    </section>
  );
}

export function NASAPanel({
  selectedBody,
  collapsed,
  onToggleCollapsed,
}: {
  selectedBody: CelestialBody | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const { data: flags } = useSWR("/api/nasa/flags", fetcherFlags, {
    revalidateOnFocus: false,
  });

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex max-w-md flex-col gap-2">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="self-end rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-md hover:bg-white/10"
      >
        {collapsed ? "NASA +" : "NASA −"}
      </button>
      {!collapsed && (
        <div className="max-h-[calc(100vh-8rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/65 p-4 text-zinc-100 shadow-2xl backdrop-blur-md">
          {flags?.isDemo && (
            <p className="text-center text-[10px] text-amber-200/90">
              Datos de demostración (NASA_API_KEY)
            </p>
          )}
          <ApodSection />
          <NeoSection />
          <PlanetScienceSection body={selectedBody} />
        </div>
      )}
    </div>
  );
}
