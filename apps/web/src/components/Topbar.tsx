"use client";

import { logoutAction } from "@/app/actions/auth-actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TopbarProps {
  onMenuClick?: () => void;
}

function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const result: Record<string, string> = {};
  document.cookie.split(";").forEach((cookie) => {
    const idx = cookie.indexOf("=");
    if (idx === -1) return;
    const key = cookie.slice(0, idx).trim();
    const val = cookie.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  });
  return result;
}

export function Topbar({ onMenuClick }: Readonly<TopbarProps>) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const updateUserInfo = () => {
      const cookies = getAllCookies();
      const name = cookies["userName"] ?? null;
      const email = cookies["userEmail"] ?? null;
      
      console.log("[Topbar] Verificando cookies:", { name, email, allCookies: cookies });
      
      setUserName(name);
      setUserEmail(email);
    };

    // Actualizar al montar
    updateUserInfo();

    // Monitoreo más agresivo: cada 200ms
    const interval = setInterval(updateUserInfo, 200);

    // Escuchar eventos de almacenamiento
    window.addEventListener("storage", updateUserInfo);
    
    // También re-verificar cuando la visibilidad cambia
    document.addEventListener("visibilitychange", updateUserInfo);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateUserInfo);
      document.removeEventListener("visibilitychange", updateUserInfo);
    };
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

  const getFirstName = (name: string | null) => {
    if (!name) return null;
    return name.split(" ")[0];
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
          {userName || userEmail ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shrink-0">
                {getInitials(userName || userEmail)}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-zinc-900 whitespace-nowrap">
                  ¡Hola, {getFirstName(userName || userEmail?.split('@')[0] || null)}! 👋
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:block truncate max-w-[160px]">
                  {userEmail}
                </span>
              </div>
            </div>
          ) : (
            // Fallback mientras no carga el nombre
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-500 shrink-0">
              U
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
            <span className="hidden sm:inline">Cerrar sesión</span>
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