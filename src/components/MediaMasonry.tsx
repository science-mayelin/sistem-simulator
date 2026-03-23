"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { AppMenu } from "@/components/AppMenu";

type ApodItem = {
  title: string;
  title_es?: string;
  explanation: string;
  explanation_es?: string;
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
  media_type: "image" | "video" | string;
  date: string;
  copyright?: string;
};

type FeedResponse = {
  items: ApodItem[];
  hasMore: boolean;
};

type MediaFilter = "all" | "image" | "video";
type DateFilter = "all" | "7d" | "30d" | "365d";

const PAGE_SIZE = 10;
const MAX_PAGES = 30;

async function fetchMediaFeed(url: string): Promise<FeedResponse> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: string }).error)
        : "No se pudo cargar media de NASA"
    );
  }
  return res.json();
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
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return url;
  }
  return url;
}

function isVideo(item: ApodItem): boolean {
  if (item.media_type === "video") return true;
  const u = item.url.toLowerCase();
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com");
}

function getImageDownloadUrl(item: ApodItem): string {
  const raw = item.hdurl || item.url;
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" && u.hostname.includes("nasa.gov")) {
      return `/api/nasa/proxy-image?url=${encodeURIComponent(raw)}`;
    }
  } catch {
    return raw;
  }
  return raw;
}

function getItemCategory(item: ApodItem): string {
  const text = `${item.title_es || item.title} ${item.explanation_es || item.explanation}`.toLowerCase();
  if (text.includes("galax")) return "Galaxias";
  if (text.includes("nebula") || text.includes("nebulosa")) return "Nebulosas";
  if (text.includes("mars") || text.includes("marte") || text.includes("jupiter") || text.includes("saturn")) {
    return "Planetas";
  }
  if (text.includes("moon") || text.includes("luna") || text.includes("sun") || text.includes("sol")) {
    return "Luna y Sol";
  }
  if (text.includes("mission") || text.includes("mision") || text.includes("rover") || text.includes("apollo")) {
    return "Misiones";
  }
  return "Espacio profundo";
}

export default function MediaMasonry() {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestLockRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ApodItem | null>(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<"slow" | "medium" | "fast">(
    "slow"
  );
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
  } = useSWRInfinite<FeedResponse>(
    (pageIndex, prev) => {
      if (pageIndex >= MAX_PAGES) return null;
      if (prev && !prev.hasMore) return null;
      return `/api/nasa/apod-feed?page=${pageIndex}&pageSize=${PAGE_SIZE}`;
    },
    fetchMediaFeed,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
      initialSize: 1,
      persistSize: true,
    }
  );

  const items = useMemo(() => {
    const unique = new Map<string, ApodItem>();
    for (const page of data ?? []) {
      for (const item of page.items) {
        unique.set(`${item.date}-${item.title}`, item);
      }
    }
    return Array.from(unique.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      set.add(getItemCategory(item));
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const dateLimitMs =
      dateFilter === "7d"
        ? 7 * 86400000
        : dateFilter === "30d"
          ? 30 * 86400000
          : dateFilter === "365d"
            ? 365 * 86400000
            : Number.POSITIVE_INFINITY;

    return items.filter((item) => {
      if (mediaFilter === "image" && isVideo(item)) return false;
      if (mediaFilter === "video" && !isVideo(item)) return false;

      if (dateFilter !== "all") {
        const itemTime = new Date(item.date).getTime();
        if (!Number.isFinite(itemTime)) return false;
        if (now - itemTime > dateLimitMs) return false;
      }

      if (categoryFilter !== "all" && getItemCategory(item) !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [items, mediaFilter, dateFilter, categoryFilter]);

  const hasMore = data?.[data.length - 1]?.hasMore ?? true;
  const isLoadingMore = isValidating && !!data;
  const reachedMaxPages = size >= MAX_PAGES;
  const canLoadMore = hasMore && !reachedMaxPages;

  useEffect(() => {
    if (!isValidating) {
      requestLockRef.current = false;
    }
  }, [isValidating]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !canLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (requestLockRef.current || isLoadingMore) return;
        requestLockRef.current = true;
        void setSize(size + 1);
      },
      { rootMargin: "250px 0px 250px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, isLoadingMore, setSize, size]);

  useEffect(() => {
    if (!canLoadMore) {
      requestLockRef.current = true;
    }
  }, [canLoadMore]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        requestLockRef.current = true;
      } else if (!isValidating) {
        requestLockRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isValidating]);

  useEffect(() => {
    if (!autoScrollEnabled) return;
    const target = scrollContainerRef.current;
    if (!target) return;

    let rafId = 0;
    let last = performance.now();
    const speedPxPerSec =
      autoScrollSpeed === "fast" ? 80 : autoScrollSpeed === "medium" ? 45 : 26;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const maxScroll = target.scrollHeight - target.clientHeight;
      if (target.scrollTop >= maxScroll - 1) {
        setAutoScrollEnabled(false);
        return;
      }

      target.scrollTop = Math.min(target.scrollTop + speedPxPerSec * dt, maxScroll);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoScrollEnabled, autoScrollSpeed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openModal = (item: ApodItem) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalClosing(false);
    setSelectedItem(item);
  };

  const closeModal = () => {
    if (!selectedItem || isModalClosing) return;
    setIsModalClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedItem(null);
      setIsModalClosing(false);
      closeTimerRef.current = null;
    }, 180);
  };

  return (
    <main
      ref={scrollContainerRef}
      className={`h-screen overflow-y-auto bg-black px-4 pb-10 pt-24 text-zinc-100 transition-[filter] duration-500 md:px-6 ${
        autoScrollEnabled ? "scroll-smooth saturate-110" : ""
      }`}
    >
      <AppMenu />
      <div className="mx-auto mb-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Media NASA</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Muro con fotos y videos recientes de APOD.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value as MediaFilter)}
                className="rounded-md border border-white/15 bg-black/70 px-2 py-1 text-zinc-100"
              >
                <option value="all">Todo</option>
                <option value="image">Solo imagen</option>
                <option value="video">Solo video</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="rounded-md border border-white/15 bg-black/70 px-2 py-1 text-zinc-100"
              >
                <option value="all">Cualquier fecha</option>
                <option value="7d">Ultimos 7 dias</option>
                <option value="30d">Ultimos 30 dias</option>
                <option value="365d">Ultimo anio</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-white/15 bg-black/70 px-2 py-1 text-zinc-100"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas las categorias" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoScrollEnabled((v) => !v)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              autoScrollEnabled
                ? "border-amber-300/50 bg-amber-500/20 text-amber-100"
                : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
            }`}
          >
            {autoScrollEnabled ? "Pausar desplazamiento" : "Play desplazamiento"}
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 p-1">
            {[
              { id: "slow", label: "Lento" },
              { id: "medium", label: "Medio" },
              { id: "fast", label: "Rápido" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setAutoScrollSpeed(opt.id as "slow" | "medium" | "fast")
                }
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                  autoScrollSpeed === opt.id
                    ? "bg-amber-500/25 text-amber-100"
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="mx-auto max-w-6xl text-sm text-zinc-400">Cargando media de NASA...</p>
      )}
      {error && (
        <p className="mx-auto max-w-6xl text-sm text-red-400">
          Error cargando media: {error instanceof Error ? error.message : "desconocido"}
        </p>
      )}

      {filteredItems.length > 0 && (
        <section className="mx-auto max-w-6xl columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filteredItems.map((item) => {
            const video = isVideo(item);
            const imgSrc = item.thumbnail_url || item.hdurl || item.url;
            return (
              <article
                key={`${item.date}-${item.title}`}
                className="mb-4 break-inside-avoid rounded-xl border border-white/10 bg-zinc-950/90 p-2 shadow-lg"
              >
                <div className="relative">
                  {video ? (
                    <iframe
                      title={item.title}
                      src={embedVideoUrl(item.url)}
                      className="aspect-video w-full rounded-lg border border-white/10"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full rounded-lg border border-white/10 object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {!video && (
                    <a
                      href={getImageDownloadUrl(item)}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-2 z-10 rounded-md border border-white/20 bg-black/60 px-1.5 py-1 text-xs text-zinc-100 opacity-80 transition hover:opacity-100"
                      aria-label={`Descargar ${item.title_es || item.title}`}
                      title="Descargar imagen"
                    >
                      ↓
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="absolute inset-0 rounded-lg transition hover:bg-black/10"
                    aria-label={`Abrir ${item.title_es || item.title}`}
                  />
                </div>
                <div className="px-1 pb-1 pt-2">
                  <h2 className="line-clamp-2 text-sm font-semibold text-zinc-100">
                    {item.title_es || item.title}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">{item.date}</p>
                  <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-zinc-400">
                    {item.explanation_es || item.explanation}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs text-amber-400 hover:underline"
                  >
                    Ver fuente NASA
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      )}
      {!isLoading && !error && filteredItems.length === 0 && (
        <p className="mx-auto max-w-6xl text-sm text-zinc-500">No hay elementos para mostrar.</p>
      )}
      <div ref={loadMoreRef} className="mx-auto mt-8 max-w-6xl py-6 text-center text-xs text-zinc-500">
        {!canLoadMore
          ? "Limite de carga alcanzado"
          : isLoadingMore
            ? "Cargando más..."
            : "Desplaza para cargar más"}
      </div>

      {selectedItem && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
            isModalClosing ? "bg-black/0 opacity-0" : "bg-black/85 opacity-100"
          }`}
          onClick={closeModal}
          role="presentation"
        >
          <div
            className={`relative w-full max-w-5xl rounded-xl border border-white/15 bg-zinc-950 p-3 shadow-2xl transition-all duration-200 ${
              isModalClosing
                ? "translate-y-2 scale-[0.98] opacity-0"
                : "translate-y-0 scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title_es || selectedItem.title}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-2 top-2 z-10 rounded-md border border-white/20 bg-black/70 px-2 py-1 text-xs text-zinc-100 hover:bg-white/10"
            >
              Cerrar
            </button>
            {!isVideo(selectedItem) && (
              <a
                href={getImageDownloadUrl(selectedItem)}
                download
                target="_blank"
                rel="noreferrer"
                className="absolute right-20 top-2 z-10 rounded-md border border-white/20 bg-black/70 px-2 py-1 text-xs text-zinc-100 hover:bg-white/10"
                aria-label={`Descargar ${selectedItem.title_es || selectedItem.title}`}
                title="Descargar imagen"
              >
                Descargar
              </a>
            )}
            {isVideo(selectedItem) ? (
              <iframe
                title={selectedItem.title_es || selectedItem.title}
                src={embedVideoUrl(selectedItem.url)}
                className="aspect-video w-full rounded-lg border border-white/10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedItem.hdurl || selectedItem.url}
                alt={selectedItem.title_es || selectedItem.title}
                className="max-h-[78vh] w-full rounded-lg border border-white/10 object-contain"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="px-1 pb-1 pt-3">
              <h3 className="text-sm font-semibold text-zinc-100">
                {selectedItem.title_es || selectedItem.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">{selectedItem.date}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
