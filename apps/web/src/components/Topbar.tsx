"use client";

import { logoutAction } from "@/app/actions/auth-actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TopbarProps {
  onMenuClick?: () => void;
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const regex = new RegExp(`(^|; )${name}=([^;]*)`);
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[2]) : null;
}

export function Topbar({ onMenuClick }: Readonly<TopbarProps>) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const name = getCookieValue("userName");
    const email = getCookieValue("userEmail");
    setUserName(name);
    setUserEmail(email);
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

        {/* Logo visible */}
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white shrink-0">
            M
          </div>
          <span className="text-sm font-semibold text-zinc-900">MonetIA</span>
        </div>

        {/* Spacer desktop */}
        <div className="hidden md:block flex-1" />

        {/* ── Acciones ── */}
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {userName && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {getInitials(userName)}
              </div>
              <span className="text-sm font-medium text-zinc-900 whitespace-nowrap">Hola, {userName}</span>
            </div>
          )}
          
          <button
            onClick={async () => { await logoutAction(); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>

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