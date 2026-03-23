"use client";

import { useMemo, useState } from "react";
import type { EventFeedItem } from "@/types/events";

function typeBadge(type: EventFeedItem["type"]) {
  if (type === "flare") return { label: "Erupción solar", cls: "bg-rose-500/20 text-rose-200" };
  if (type === "cme") return { label: "CME", cls: "bg-amber-500/20 text-amber-200" };
  if (type === "gst") return { label: "Tormenta geomagnética", cls: "bg-violet-500/20 text-violet-200" };
  return { label: "EONET", cls: "bg-teal-500/20 text-teal-200" };
}

function severityBadge(item: EventFeedItem) {
  if (item.type === "earth") return { label: "Info", cls: "bg-zinc-500/20 text-zinc-300" };
  if (item.severity === "high") return { label: item.severityLabel || "Alta", cls: "bg-red-500/20 text-red-200" };
  if (item.severity === "medium") return { label: item.severityLabel || "Media", cls: "bg-amber-500/20 text-amber-200" };
  return { label: item.severityLabel || "Baja", cls: "bg-zinc-500/20 text-zinc-300" };
}

function intensity(item: EventFeedItem): number {
  if (item.type !== "flare" && item.type !== "cme") return 0;
  if (item.severity === "high") return 5;
  if (item.severity === "medium") return 3;
  return 1;
}

export function EventCard({ item }: { item: EventFeedItem }) {
  const [expanded, setExpanded] = useState(false);
  const type = typeBadge(item.type);
  const sev = severityBadge(item);
  const meters = intensity(item);
  const when = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.date)),
    [item.date]
  );

  return (
    <article className="rounded-xl border border-white/10 bg-zinc-950/90 p-4 shadow-lg">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${type.cls}`}>
          {type.label}
        </span>
        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${sev.cls}`}>
          {sev.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
      <p className="mt-1 text-xs text-zinc-500">
        {when} · {item.source}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-300">{item.body}</p>

      {(item.type === "flare" || item.type === "cme") && (
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 w-6 rounded-full ${
                idx < meters ? "bg-amber-300" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-amber-400 hover:underline"
        >
          {expanded ? "Ocultar detalles" : "Ver detalles →"}
        </button>
      </div>
      {expanded && (
        <pre className="mt-3 max-h-64 overflow-auto rounded bg-black/40 p-2 text-[11px] text-zinc-300">
          {JSON.stringify(item.raw, null, 2)}
        </pre>
      )}
    </article>
  );
}
