"use client";

import type { CelestialBody } from "@/data/planets";
import { getPlanetScienceFacts } from "@/lib/nasa";

export function BodyDetailPanel({
  body,
  onClose,
}: {
  body: CelestialBody | null;
  onClose: () => void;
}) {
  if (!body) return null;
  const science = getPlanetScienceFacts(body.name);
  const typeLabel =
    body.category === "planet"
      ? "Planeta"
      : body.category === "dwarf-planet"
        ? "Planeta enano"
        : body.category === "moon"
          ? "Luna"
          : "Asteroide";

  return (
    <aside className="pointer-events-auto absolute right-4 top-16 z-20 flex max-h-[78vh] w-full max-w-sm flex-col overflow-y-auto rounded-2xl border border-white/10 bg-black/75 p-5 text-zinc-100 shadow-2xl backdrop-blur-md xl:max-w-md">
      <div className="mb-4 border-b border-white/10 pb-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="text-3xl font-semibold tracking-tight">{body.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg border border-white/15 px-2 py-1 text-lg leading-none text-zinc-300 transition hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">
          {science?.overview ?? "Sin descripción científica disponible para este cuerpo."}
        </p>
      </div>

      <div className="mb-4 h-1.5 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full shadow-[0_0_16px_rgba(255,255,255,0.25)]"
          style={{ width: "100%", backgroundColor: body.color }}
        />
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Tipo</dt>
          <dd className="font-mono text-zinc-100">{typeLabel}</dd>
        </div>
        {body.parentName && (
          <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
            <dt className="text-zinc-400">Órbita</dt>
            <dd className="font-mono text-zinc-100">{body.parentName}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Diámetro</dt>
          <dd className="font-mono text-zinc-100">{body.facts.diameter}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Día</dt>
          <dd className="font-mono text-zinc-100">{body.facts.dayLength}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Año</dt>
          <dd className="font-mono text-zinc-100">{body.facts.yearLength}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Lunas</dt>
          <dd className="font-mono text-zinc-100">{body.facts.moons}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-white/10 py-1.5">
          <dt className="text-zinc-400">Temperatura</dt>
          <dd className="font-mono text-zinc-100">{body.facts.temperature}</dd>
        </div>
      </dl>

      {science?.composition && (
        <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Composición
          </p>
          <p className="text-xs leading-relaxed text-zinc-300">{science.composition}</p>
        </section>
      )}

      {science?.overview && (
        <section className="mt-4 rounded-lg border border-white/10 bg-amber-500/5 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            ¿Sabías que?
          </p>
          <p className="text-xs leading-relaxed text-zinc-300">{science.overview}</p>
        </section>
      )}

      {body.moons.length > 0 && (
        <section className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
            Satélites destacados
          </p>
          <ul className="space-y-2 text-xs text-zinc-300">
            {body.moons.map((m) => (
              <li
                key={m.name}
                className="flex justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
              >
                <span className="font-medium text-zinc-200">{m.name}</span>
                <span className="text-zinc-500">P {m.orbitalPeriod}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {science?.source && (
        <p className="mt-4 text-[10px] text-zinc-600">{science.source}</p>
      )}
      <div
        className="mt-4 h-10 w-full rounded-lg border border-white/10"
        style={{
          background: `linear-gradient(90deg, ${body.color}00 0%, ${body.color}99 50%, ${body.color}00 100%)`,
        }}
      />
    </aside>
  );
}
