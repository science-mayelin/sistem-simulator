"use client";

import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import type { CelestialBody } from "@/data/planets";

function highlightLine(body: CelestialBody): string {
  if (body.facts.moons > 0 && body.category === "planet") {
    return `${body.facts.moons} lunas`;
  }
  return `Ø ${body.facts.diameter}`;
}

export function SearchBar({
  onSelect,
}: {
  onSelect: (body: CelestialBody) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results } = useSearch(query);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-auto absolute left-4 top-16 z-20 w-full max-w-md">
      <input
        type="search"
        placeholder="Buscar planeta, luna o asteroide..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-lg backdrop-blur-md focus:border-amber-400/50 focus:outline-none"
      />
      {open && (
        <ul className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/80 py-1 shadow-2xl backdrop-blur-md">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">Sin resultados</li>
          ) : (
            results.map((body) => (
              <li key={body.name}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-white/10"
                  onClick={() => {
                    onSelect(body);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-white/20"
                    style={{ backgroundColor: body.color }}
                  />
                  <span className="flex-1 font-medium text-zinc-100">
                    {body.name}
                  </span>
                  <span className="text-xs uppercase text-zinc-500">
                    {body.category.replace("-", " ")}
                  </span>
                  <span className="max-w-[120px] truncate text-xs text-zinc-400">
                    {highlightLine(body)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
