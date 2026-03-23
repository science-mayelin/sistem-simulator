"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  NewsCategory,
  NewsItem,
  NewsResponse,
  NewsSource,
  NewsType,
} from "@/types/news";

const CACHE_KEY = "nasa_noticias_cache";
const CACHE_TTL = 15 * 60 * 1000;

export function useNoticias() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [type, setType] = useState<NewsType | "all">("all");
  const [source, setSource] = useState<NewsSource | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 24;

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!forceRefresh && typeof window !== "undefined") {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? (JSON.parse(raw) as NewsResponse) : null;
        if (
          cached &&
          Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL
        ) {
          setData(cached);
          setLoading(false);
          return;
        }
      }
      const res = await fetch("/api/noticias");
      if (!res.ok) {
        throw new Error(
          `No se pudo cargar el contenido (respuesta ${res.status}).`
        );
      }
      const json: NewsResponse = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(json));
      }
      setData(json);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Error desconocido al cargar las noticias."
      );
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? (JSON.parse(raw) as NewsResponse) : null;
        if (cached) setData(cached);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category, type, source, searchQuery]);

  const filtered = (data?.items ?? []).filter((item: NewsItem) => {
    if (category !== "all" && item.category !== category) return false;
    if (type !== "all" && item.type !== type) return false;
    if (source !== "all" && item.source !== source) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.authors?.some((a) => a.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return {
    items: paginated,
    totalCount: filtered.length,
    loading,
    error,
    fetchedAt: data?.fetchedAt,
    sources: data?.sources,
    category,
    setCategory,
    type,
    setType,
    source,
    setSource,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore: () => setPage((p) => p + 1),
    refresh: () => {
      setPage(1);
      void load(true);
    },
  };
}
