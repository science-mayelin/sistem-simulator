"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div ref={rootRef} className="pointer-events-none fixed left-0 top-0 z-50">
      {open && (
        <div
          role="presentation"
          className="pointer-events-auto fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className="pointer-events-auto absolute left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] sm:left-4 sm:top-4"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`rounded-lg border px-3 py-1.5 text-xs text-zinc-200 shadow-lg transition ${
            open
              ? "border-white/25 bg-zinc-950 text-zinc-50"
              : "border-white/15 bg-black/60 backdrop-blur-md hover:bg-white/10"
          }`}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          Menu
        </button>
        {open && (
          <div
            className="mt-2 min-w-[11rem] rounded-lg border border-white/20 bg-zinc-950 p-1 shadow-2xl ring-1 ring-black/40"
            role="menu"
            aria-label="Navegación"
          >
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Simulador
            </Link>
            <Link
              href="/media"
              className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Media NASA
            </Link>
            <Link
              href="/eventos"
              className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              ✨ Eventos
            </Link>
            <Link
              href="/noticias"
              className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Noticias
            </Link>
            <Link
              href="/landsats"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <svg
                className="h-4 w-4 shrink-0 text-zinc-300"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <rect x="2" y="9" width="5" height="6" rx="1" />
                <rect x="17" y="9" width="5" height="6" rx="1" />
                <rect x="9" y="8" width="6" height="8" rx="1" />
              </svg>
              Landsats
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
