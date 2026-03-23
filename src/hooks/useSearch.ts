"use client";

import { useEffect, useMemo, useState } from "react";
import type { CelestialBody } from "@/data/planets";
import { CELESTIAL_BODIES } from "@/data/planets";

function matchesQuery(body: CelestialBody, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (body.name.toLowerCase().includes(s)) return true;
  return body.aliases.some((a) => a.toLowerCase().includes(s));
}

export function useSearch(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debounced.trim()) return CELESTIAL_BODIES;
    return CELESTIAL_BODIES.filter((b) => matchesQuery(b, debounced));
  }, [debounced]);

  return { results };
}
