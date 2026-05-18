"use client";

import Link from "next/link";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b border-zinc-100">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-6">

        {/* ── Hamburger ── */}
        <button
          onClick={onMenuClick}
          className="flex-shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          aria-label="Abrir menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo  */}
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white shrink-0">
            M
          </div>
          <span className="text-sm font-semibold text-zinc-900">MonetIA</span>
        </div>

        {/* Spacer desktop */}
        <div className="hidden md:block flex-1" />

        {/* ── Acciones ── */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">

          <Link
            href="/projects/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 sm:px-4 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span className="hidden sm:inline">Nuevo Proyecto</span>
          </Link>
        </div>
      </div>
    </header>
  );
}