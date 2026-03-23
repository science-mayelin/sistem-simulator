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

  return (
    <div ref={rootRef} className="pointer-events-auto absolute left-4 top-4 z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-md hover:bg-white/10"
        aria-label="Abrir menú"
      >
        Menu
      </button>
      {open && (
        <div className="mt-2 min-w-40 rounded-lg border border-white/15 bg-black/80 p-1 shadow-2xl backdrop-blur-md">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Simulador
          </Link>
          <Link
            href="/media"
            className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Media NASA
          </Link>
          <Link
            href="/eventos"
            className="block rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            ✨ Eventos
          </Link>
          <Link
            href="/landsats"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => setOpen(false)}
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
  );
}
