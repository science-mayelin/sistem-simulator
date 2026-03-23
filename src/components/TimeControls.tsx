"use client";

import { useMemo } from "react";

const DAY_MS = 86400000;
const SLIDER_MAX = 18250;

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function offsetDaysFromToday(date: Date): number {
  const t = startOfLocalDay(new Date());
  const c = startOfLocalDay(date);
  return Math.round((c.getTime() - t.getTime()) / DAY_MS);
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

const dateTitleFmt = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function TimeControls({
  currentDate,
  onDateChange,
  speedMultiplier,
  onSpeedMultiplierChange,
  isPlaying,
  onIsPlayingChange,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  onTopView,
}: {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  speedMultiplier: number;
  onSpeedMultiplierChange: (n: number) => void;
  isPlaying: boolean;
  onIsPlayingChange: (v: boolean) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onTopView: () => void;
}) {
  const sliderValue = useMemo(
    () =>
      Math.min(SLIDER_MAX, Math.max(-SLIDER_MAX, offsetDaysFromToday(currentDate))),
    [currentDate]
  );

  const label = dateTitleFmt.format(currentDate);

  const preset = (d: Date) => {
    onDateChange(d);
  };

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/55 px-4 py-3 shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Fecha de simulación
            </p>
            <p className="text-2xl font-semibold capitalize text-zinc-50 md:text-3xl">
              {label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={() => preset(new Date(1969, 6, 20, 12, 0, 0))}
            >
              Año 1969 (Apollo 11)
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={() => preset(new Date())}
            >
              Hoy
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={() => preset(new Date(2050, 0, 1, 12, 0, 0))}
            >
              2050
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={() => preset(new Date(2100, 0, 1, 12, 0, 0))}
            >
              2100
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">
            Desplazar ±50 años desde hoy ({sliderValue} días)
          </span>
          <input
            type="range"
            min={-SLIDER_MAX}
            max={SLIDER_MAX}
            step={1}
            value={sliderValue}
            onChange={(e) => {
              const days = Number(e.target.value);
              preset(addDays(new Date(), days));
            }}
            className="accent-amber-400"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                isPlaying
                  ? "bg-amber-500/30 text-amber-100"
                  : "border border-white/15 bg-white/5 text-zinc-200"
              }`}
              onClick={() => onIsPlayingChange(!isPlaying)}
            >
              {isPlaying ? "Parar" : "Iniciar"}
            </button>
            {[1, 10, 100, 1000, 10000, 1000000].map((n) => (
              <button
                key={n}
                type="button"
                className={`rounded-lg border px-3 py-2 text-xs ${
                  speedMultiplier === n && isPlaying
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                    : "border-white/15 bg-white/5 text-zinc-300"
                }`}
                onClick={() => {
                  onSpeedMultiplierChange(n);
                  onIsPlayingChange(true);
                }}
              >
                ×{n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-zinc-500">
              Velocidad tiempo:{" "}
              <span className="font-mono text-zinc-300">
                {speedMultiplier.toLocaleString("es-ES")}×
              </span>{" "}
              {isPlaying ? "" : "(pausado)"}
            </p>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={onToggleOrbits}
            >
              {showOrbits ? "Ocultar órbitas" : "Órbitas"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
              onClick={onToggleLabels}
            >
              {showLabels ? "Ocultar etiquetas" : "Etiquetas"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
              onClick={onTopView}
            >
              Vista cenital
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
