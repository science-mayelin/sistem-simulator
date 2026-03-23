"use client";

import { AppMenu } from "@/components/AppMenu";
import { SatelliteGlobe } from "@/components/SatelliteGlobe";
import { useTLE } from "@/hooks/useTLE";
import { useMemo } from "react";

export default function LandsatsPage() {
  const { tleL8, tleL9, loading, error, lastUpdated, refresh } = useTLE();

  const hoursAgo = useMemo(() => {
    if (lastUpdated == null) return null;
    return (Date.now() - lastUpdated) / (60 * 60 * 1000);
  }, [lastUpdated]);

  const tleLabel = useMemo(() => {
    if (hoursAgo == null) return "TLE: sin datos";
    if (hoursAgo < 1) {
      const m = Math.round(hoursAgo * 60);
      return `TLE actualizado hace ${m} min`;
    }
    const h = hoursAgo.toFixed(1);
    return `TLE actualizado hace ${h} h`;
  }, [hoursAgo]);

  const staleWarning = hoursAgo != null && hoursAgo > 12;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black text-zinc-100">
      <AppMenu />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-30 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-20">
        <div className="pointer-events-auto flex w-full flex-wrap items-end justify-between gap-3 text-left">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight drop-shadow-md sm:text-2xl md:text-3xl">
              Tracker Landsat en tiempo real
            </h1>
            <p
              className={`mt-1 text-xs drop-shadow ${staleWarning ? "text-amber-400/90" : "text-zinc-400"}`}
            >
              {tleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-zinc-100 backdrop-blur-md hover:bg-white/10"
          >
            ↺ Actualizar TLE
          </button>
        </div>
      </header>

      <div className="absolute inset-0">
        <SatelliteGlobe
          tleL8={tleL8}
          tleL9={tleL9}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>

      <details className="pointer-events-auto absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/55 backdrop-blur-md">
        <summary className="cursor-pointer list-none px-4 py-2 text-center text-[11px] uppercase tracking-wide text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
          Contexto de misión · tocar para expandir
        </summary>
        <div className="max-h-[28vh] overflow-y-auto border-t border-white/5 px-4 pb-4 pt-2 text-xs leading-relaxed text-zinc-400">
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              Órbita casi polar heliosíncrona (~98.2° de inclinación): casi cada paso cruza
              regiones altas latitud norte y sur.
            </li>
            <li>
              Período orbital ~98.9 min por vuelta completa; altitud operativa ~705 km; velocidad
              orbital típica ~7.5 km/s (~27 000 km/h).
            </li>
            <li>
              Landsat 8 y Landsat 9 están desfasados unos 8 días en el ciclo de cobertura; juntos
              repiten el mismo punto cada ~16 días individualmente, y en conjunto ayudan a cubrir la
              Tierra en ~8 días.
            </li>
          </ul>
        </div>
      </details>
    </main>
  );
}
