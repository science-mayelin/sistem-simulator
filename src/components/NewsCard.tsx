"use client";

import type { NewsItem } from "@/types/news";
import {
  NEWS_SOURCE_BADGES,
  categoryPlaceholderClass,
} from "@/lib/news-ui-labels";

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function NewsCard({ item }: { item: NewsItem }) {
  const badge = NEWS_SOURCE_BADGES[item.source as keyof typeof NEWS_SOURCE_BADGES];
  const label = badge?.label ?? item.source;
  const accent = categoryPlaceholderClass(item.category);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg transition hover:border-amber-400/30 hover:shadow-xl"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className={`h-full w-full ${accent}`} aria-hidden />
        )}
        <span
          className="absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold shadow"
          style={{
            color: badge?.color ?? "#e4e4e7",
            backgroundColor: badge?.bg ?? "rgba(24,24,27,0.9)",
          }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-zinc-400">
          {item.summary || "—"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
          <time dateTime={item.date}>{formatShortDate(item.date)}</time>
          <span className="truncate text-zinc-600">{label}</span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-xs font-medium text-amber-400/90 hover:underline"
        >
          Abrir artículo →
        </a>
      </div>
    </article>
  );
}
