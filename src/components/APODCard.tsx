"use client";

import { useMemo, useState } from "react";
import type { EventFeedItem } from "@/types/events";

function embedVideoUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes("/embed/")) return url;
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, "")}`;
  } catch {
    return url;
  }
  return url;
}

function isVideo(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com");
}

const FAVORITES_KEY = "apod_favoritos";

export function APODCard({ item }: { item: EventFeedItem }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const when = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "full",
      }).format(new Date(item.date)),
    [item.date]
  );

  const mediaUrl = item.imageUrl || item.hdUrl || "";
  const videoMode = isVideo(mediaUrl);

  const onSave = () => {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const list = raw ? (JSON.parse(raw) as EventFeedItem[]) : [];
    if (!list.some((x) => x.id === item.id)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([item, ...list].slice(0, 100)));
    }
    setSaved(true);
  };

  return (
    <article className="rounded-xl border border-indigo-300/20 bg-zinc-950/95 p-3 shadow-xl">
      {videoMode ? (
        <iframe
          title={item.title}
          src={embedVideoUrl(mediaUrl)}
          className="aspect-video w-full rounded-lg border border-white/10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt={item.title}
          className="max-h-[420px] w-full rounded-lg border border-white/10 object-contain"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
        <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-200">
          APOD
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {when}
        {item.copyright ? ` · © ${item.copyright}` : ""}
      </p>
      <p className={`mt-2 text-xs leading-relaxed text-zinc-300 ${expanded ? "" : "line-clamp-3"}`}>
        {item.body}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-zinc-100 hover:bg-white/10"
        >
          {saved ? "Guardado" : "Guardar"}
        </button>
        {item.hdUrl && (
          <a
            href={item.hdUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-zinc-100 hover:bg-white/10"
          >
            Ver HD
          </a>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-amber-400 hover:underline"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      </div>
    </article>
  );
}
