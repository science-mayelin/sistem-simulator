"use client";

import { useCallback, useEffect, useState } from "react";

export const CACHE_KEY = "nasa_tle_cache";
export const TLE_TTL = 24 * 60 * 60 * 1000;

export const SATELLITES = {
  L8: { norad: 39084, name: "Landsat 8", color: "#5DCAA5" },
  L9: { norad: 49260, name: "Landsat 9", color: "#85B7EB" },
} as const;

export type TleTriple = [string, string, string];

interface CachePayload {
  ts: number;
  L8: string[];
  L9: string[];
}

function readCache(): CachePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CachePayload;
    if (!data?.L8?.length || !data?.L9?.length || typeof data.ts !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(L8: string[], L9: string[]) {
  const payload: CachePayload = { ts: Date.now(), L8, L9 };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

function isFresh(ts: number): boolean {
  return Date.now() - ts < TLE_TTL;
}

export interface UseTLEResult {
  tleL8: TleTriple | null;
  tleL9: TleTriple | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

export function useTLE(): UseTLEResult {
  const [tleL8, setTleL8] = useState<TleTriple | null>(null);
  const [tleL9, setTleL9] = useState<TleTriple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const applyPayload = useCallback((L8: string[], L9: string[], ts: number) => {
    if (L8.length >= 3 && L9.length >= 3) {
      setTleL8([L8[0], L8[1], L8[2]]);
      setTleL9([L9[0], L9[1], L9[2]]);
      setLastUpdated(ts);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const cached = readCache();
    if (cached?.L8?.length && cached?.L9?.length && cached.L8.length >= 3 && cached.L9.length >= 3) {
      applyPayload(cached.L8, cached.L9, cached.ts);
    }
    if (cached && isFresh(cached.ts) && refreshToken === 0) {
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tle");
        const json = (await res.json()) as {
          L8?: string[];
          L9?: string[];
          fetchedAt?: number;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error || "Error al obtener TLE");
        }
        if (!json.L8?.length || !json.L9?.length) {
          throw new Error("Respuesta TLE inválida");
        }
        writeCache(json.L8, json.L9);
        const ts = json.fetchedAt ?? Date.now();
        if (!cancelled) {
          applyPayload(json.L8, json.L9, ts);
        }
      } catch (e) {
        const stale = readCache();
        if (stale?.L8?.length && stale?.L9?.length) {
          if (!cancelled) {
            applyPayload(stale.L8, stale.L9, stale.ts);
            setError(e instanceof Error ? e.message : "Error de red");
          }
        } else if (!cancelled) {
          setTleL8(null);
          setTleL9(null);
          setLastUpdated(null);
          setError(e instanceof Error ? e.message : "Error de red");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [applyPayload, refreshToken]);

  const refresh = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
    setRefreshToken((t) => t + 1);
  }, []);

  return { tleL8, tleL9, loading, error, lastUpdated, refresh };
}
