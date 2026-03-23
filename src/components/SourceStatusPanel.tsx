"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { ALL_SOURCE_OPTIONS } from "@/lib/news-ui-labels";
import type { NewsResponse, NewsSource } from "@/types/news";

const ORDER: NewsSource[] = [
  "spaceflight",
  "nasa",
  "jpl",
  "arxiv",
  "semantic",
  "pubmed",
  "openalex",
  "hackernews",
];

export function SourceStatusPanel({
  sources,
  fetchedAt,
}: {
  sources: NewsResponse["sources"] | undefined;
  fetchedAt: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const labelById = Object.fromEntries(
    ALL_SOURCE_OPTIONS.map((o) => [o.id, o.label])
  ) as Record<NewsSource, string>;

  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-zinc-950/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/5"
      >
        <span>
          Estado de las fuentes
          {fetchedAt && (
            <span className="ml-2 text-xs text-zinc-500">
              — Última actualización: {formatRelativeTime(fetchedAt)}
            </span>
          )}
        </span>
        <span className="text-zinc-500" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ul className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          {ORDER.map((id) => {
            const row = sources?.[id];
            const name = labelById[id] ?? id;
            if (!row) {
              return (
                <li key={id} className="flex justify-between gap-4 py-1">
                  <span className="text-zinc-500">○ {name}</span>
                  <span className="text-zinc-600">Sin datos aún</span>
                </li>
              );
            }
            return (
              <li key={id} className="flex justify-between gap-4 py-1">
                <span className={row.ok ? "text-emerald-400/90" : "text-red-300/90"}>
                  {row.ok ? "✓" : "✗"} {name}
                </span>
                <span className="shrink-0 text-right text-zinc-500">
                  {row.ok
                    ? `${row.count} ${row.count === 1 ? "resultado" : "resultados"}`
                    : (row.error ?? "Error")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
