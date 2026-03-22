"use client";

import Link from "next/link";

export function DetailTopbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-zinc-400"
            >
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="truncate">Busqueda de proyectos...</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 17H20L18.5 15.5V11a6.5 6.5 0 1 0-13 0v4.5L4 17h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9.5 17a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/projects/new"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo Proyecto 
          </Link>
        </div>
      </div>
    </header>
  );
}
