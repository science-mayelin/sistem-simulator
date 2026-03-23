"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventFeedItem, EventFeedResponse } from "@/types/events";

const CACHE_KEY = "nasa_eventos";
const CACHE_TTL = 30 * 60 * 1000;

type CachePayload = {
  ts: number;
  data: EventFeedResponse;
};

export function useEventFeed() {
  const [feed, setFeed] = useState<EventFeedItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setError(null);
    setLoading(true);
    try {
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        const cached = raw ? (JSON.parse(raw) as CachePayload) : null;
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setFeed(cached.data.feed);
          setLastUpdated(cached.ts);
          setLoading(false);
          return;
        }
      } else {
        localStorage.removeItem(CACHE_KEY);
      }

      const res = await fetch("/api/nasa/eventos", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err === "object" && err && "error" in err
            ? String((err as { error: string }).error)
            : "No se pudo cargar eventos"
        );
      }
      const data = (await res.json()) as EventFeedResponse;
      setFeed(data.feed);
      setLastUpdated(Date.now());
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const minutesAgo = useMemo(() => {
    if (!lastUpdated) return null;
    return Math.max(0, Math.floor((Date.now() - lastUpdated) / 60000));
  }, [lastUpdated]);

  return {
    feed,
    loading,
    error,
    minutesAgo,
    refresh: () => load(true),
    retry: () => load(true),
  };
}
