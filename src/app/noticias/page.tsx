"use client";

import { AppMenu } from "@/components/AppMenu";
import { NewsCard } from "@/components/NewsCard";
import { PaperCard } from "@/components/PaperCard";
import { SkeletonGrid } from "@/components/SkeletonGrid";
import { SourceStatusPanel } from "@/components/SourceStatusPanel";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { ALL_SOURCE_OPTIONS, CATEGORY_LABELS } from "@/lib/news-ui-labels";
import { useNoticias } from "@/hooks/useNoticias";
import type { NewsCategory, NewsSource, NewsType } from "@/types/news";

const CATEGORY_KEYS: (NewsCategory | "all")[] = [
  "all",
  "space",
  "cs_ai",
  "physics",
  "biology",
  "medicine",
  "technology",
  "climate",
  "general",
];

const TYPE_KEYS: (NewsType | "all")[] = ["all", "news", "paper"];

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      {message}
      <button
        type="button"
        onClick={onRetry}
        className="ml-2 text-xs text-red-100 underline hover:no-underline"
      >
        Reintentar
      </button>
    </div>
  );
}

function WarningBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
      {message}
    </div>
  );
}

export default function NoticiasPage() {
  const {
    items,
    totalCount,
    loading,
    error,
    fetchedAt,
    sources,
    category,
    setCategory,
    type,
    setType,
    source,
    setSource,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
    refresh,
  } = useNoticias();

  return (
    <main className="noticias-scroll h-screen overflow-y-auto overflow-x-hidden bg-black px-4 pb-16 pt-24 text-zinc-100 md:px-6">
      <AppMenu />
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Centro de noticias científicas
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              {totalCount}{" "}
              {totalCount === 1 ? "resultado" : "resultados"} · Actualizado{" "}
              {formatRelativeTime(fetchedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Buscar títulos, resúmenes o autores…"
              aria-label="Buscar en el listado de noticias"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-[12rem] flex-1 rounded-lg border border-white/15 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
            >
              ↺ Actualizar
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                category === cat
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                  : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TYPE_KEYS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                type === t
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                  : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              {t === "all"
                ? "Todo"
                : t === "news"
                  ? "Noticias"
                  : "Publicaciones"}
            </button>
          ))}
          <span className="ml-2 text-xs text-zinc-500">Fuente:</span>
          <select
            value={source}
            onChange={(e) =>
              setSource(e.target.value as NewsSource | "all")
            }
            aria-label="Filtrar por fuente"
            className="rounded-lg border border-white/15 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100"
          >
            <option value="all">Todas las fuentes</option>
            {ALL_SOURCE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {loading && <SkeletonGrid count={12} />}

        {error && !items.length && !loading && (
          <ErrorBanner message={error} onRetry={refresh} />
        )}
        {error && items.length > 0 && !loading && (
          <WarningBanner message="Usando datos en caché — algunas fuentes no están disponibles" />
        )}

        {!loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) =>
              item.type === "paper" ? (
                <PaperCard key={item.id} item={item} />
              ) : (
                <NewsCard key={item.id} item={item} />
              )
            )}
          </div>
        )}

        {!loading && totalCount === 0 && !error && (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400">
            No hay resultados con los filtros actuales.
          </p>
        )}

        {hasMore && !loading && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10"
            >
              Cargar más ({totalCount - items.length} restantes)
            </button>
          </div>
        )}

        <SourceStatusPanel sources={sources} fetchedAt={fetchedAt} />
      </section>
    </main>
  );
}
