"use client";

import type { PlanetData } from "@/data/planets";

export type HudProps = {
  speed: number;
  onSpeedChange: (v: number) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onTopView: () => void;
  selected: PlanetData | null;
  onCloseDetail: () => void;
};

export function HUD({
  speed,
  onSpeedChange,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  onTopView,
  selected,
  onCloseDetail,
}: HudProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
        <div className="pointer-events-auto flex max-w-xl flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/55 px-5 py-4 text-sm text-zinc-100 shadow-xl backdrop-blur-md">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              Velocidad ({speed.toFixed(1)}×)
            </span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="accent-amber-400"
            />
          </label>
          <button
            type="button"
            onClick={onToggleOrbits}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
          >
            {showOrbits ? "Ocultar órbitas" : "Mostrar órbitas"}
          </button>
          <button
            type="button"
            onClick={onToggleLabels}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
          >
            {showLabels ? "Ocultar etiquetas" : "Mostrar etiquetas"}
          </button>
          <button
            type="button"
            onClick={onTopView}
            className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25"
          >
            Vista cenital
          </button>
        </div>
      </div>

      {selected && (
        <aside className="absolute right-0 top-0 z-10 flex h-full max-w-sm flex-col border-l border-white/10 bg-black/60 p-6 text-zinc-100 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">
              {selected.name}
            </h2>
            <button
              type="button"
              onClick={onCloseDetail}
              aria-label="Cerrar"
              className="rounded-lg border border-white/15 px-2 py-1 text-lg leading-none text-zinc-300 transition hover:bg-white/10"
            >
              ×
            </button>
          </div>
          <div
            className="mb-6 h-40 w-full rounded-xl border border-white/10 shadow-inner"
            style={{ backgroundColor: selected.color }}
          />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Diámetro</dt>
              <dd className="text-right font-medium">{selected.facts.diameter}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Día</dt>
              <dd className="text-right font-medium">
                {selected.facts.dayLength}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Año</dt>
              <dd className="text-right font-medium">
                {selected.facts.yearLength}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
              <dt className="text-zinc-400">Lunas</dt>
              <dd className="text-right font-medium">{selected.facts.moons}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">Temperatura</dt>
              <dd className="text-right font-medium">
                {selected.facts.temperature}
              </dd>
            </div>
          </dl>
        </aside>
      )}
    </>
  );
}
