"use client";

import { useMemo, useState } from "react";
import { AppMenu } from "@/components/AppMenu";
import { APODCard } from "@/components/APODCard";
import { EventCard } from "@/components/EventCard";
import { useEventFeed } from "@/hooks/useEventFeed";
import type { EventFeedItem } from "@/types/events";

type Tab = "all" | "space" | "earth" | "apod";

function filterFeed(feed: EventFeedItem[], tab: Tab): EventFeedItem[] {
  if (tab === "space") return feed.filter((x) => x.type === "flare" || x.type === "cme" || x.type === "gst");
  if (tab === "earth") return feed.filter((x) => x.type === "earth");
  if (tab === "apod") return feed.filter((x) => x.type === "apod");
  return feed;
}

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-xl border border-white/10 bg-zinc-900/70" />;
}

export default function EventosPage() {
  const { feed, loading, error, minutesAgo, refresh, retry } = useEventFeed();
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => filterFeed(feed, tab), [feed, tab]);

  return (
    <main className="h-screen overflow-y-auto bg-black px-4 pb-10 pt-24 text-zinc-100 md:px-6">
      <AppMenu />
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Eventos & Noticias Astronómicas
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Actualizado hace {minutesAgo ?? "—"} minutos
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
          >
            ↺ Actualizar
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todos" },
            { id: "space", label: "Clima espacial" },
            { id: "earth", label: "Tierra" },
            { id: "apod", label: "APOD" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as Tab)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                tab === t.id
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                  : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && !loading && (
          <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            Error de red: {error}
            <button
              type="button"
              onClick={retry}
              className="ml-2 text-xs text-red-100 underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && feed.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400">
            No hay eventos registrados en los últimos 7 días.
          </p>
        )}

        {!loading && !error && feed.length > 0 && filtered.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400">
            No hay eventos de este tipo recientemente.
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((item) =>
            item.type === "apod" ? (
              <APODCard key={item.id} item={item} />
            ) : (
              <EventCard key={item.id} item={item} />
            )
          )}
        </div>
      </section>
    </main>
  );
}
