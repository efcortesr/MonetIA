"use client";

import Link from "next/link";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        <div />

        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50">
            Q1 2026
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-zinc-500"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link
            href="/projects/new"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span className="text-lg leading-none">+</span>
            <span>Nuevo Proyecto</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
