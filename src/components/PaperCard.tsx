"use client";

import { useState } from "react";
import type { NewsItem } from "@/types/news";
import {
  PAPER_SOURCE_BADGES,
  categoryShortLabel,
} from "@/lib/news-ui-labels";

function formatFooterDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (d.getFullYear() < 1980) return String(d.getFullYear());
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function PaperCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const badge =
    PAPER_SOURCE_BADGES[item.source as keyof typeof PAPER_SOURCE_BADGES];
  const label = badge?.label ?? item.source;
  const fullSummary = item.summary;
  const needsExpand = fullSummary.length > 220;

  return (
    <article className="flex h-full flex-col rounded-xl border border-white/10 bg-zinc-950/90 p-4 shadow-lg transition hover:border-amber-400/30 hover:shadow-xl">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold"
          style={{
            color: badge?.color ?? "#e4e4e7",
            backgroundColor: badge?.bg ?? "rgba(39,39,42,0.9)",
          }}
        >
          {label}
        </span>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
          {categoryShortLabel(item.category)}
        </span>
      </div>
      <h3 className="text-sm font-medium leading-snug text-zinc-100">
        {item.title}
      </h3>
      {fullSummary ? (
        <div className="mt-2">
          <p
            className={`text-xs leading-relaxed text-zinc-400 ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {fullSummary}
          </p>
          {needsExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-amber-400/90 hover:underline"
            >
              {expanded ? "Mostrar menos" : "Leer más"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-zinc-500">Sin resumen disponible.</p>
      )}
      {item.authors && item.authors.length > 0 && (
        <p className="mt-2 text-[11px] text-zinc-500">
          {item.authors.slice(0, 3).join(", ")}
          {item.authors.length > 3
            ? ` y ${item.authors.length - 3} más`
            : ""}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[11px] text-zinc-500">
        <span>{formatFooterDate(item.date)}</span>
        {item.journal && (
          <span className="max-w-[12rem] truncate" title={item.journal}>
            {item.journal}
          </span>
        )}
        {item.citationCount != null && item.citationCount > 0 && (
          <span>{item.citationCount} citas</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.openAccessPdf && (
          <a
            href={item.openAccessPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
          >
            PDF
          </a>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/20"
        >
          Ver publicación →
        </a>
      </div>
    </article>
  );
}
