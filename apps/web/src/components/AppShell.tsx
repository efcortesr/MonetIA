"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /*
     * ── Cambios clave ──
     * 1. Eliminado mx-auto + max-w-[1440px] que limitaba el ancho y causaba
     *    que en pantallas medianas el contenido quedara "pequeño y centrado"
     *    obligando al usuario a hacer zoom manual.
     * 2. w-full garantiza que el layout ocupa siempre el 100% del viewport.
     * 3. El sidebar en móvil usa fixed+translate (fuera del flujo normal).
     */
    <div className="min-h-screen w-full bg-[#f4f7fb] text-zinc-900">

      {/* Overlay oscuro cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen w-full">

        {/* ── Sidebar ──
            Desplegable en todos los tamaños: fixed, desliza con transform.
            shrink-0 evita que flex comprima el sidebar.
        */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 shrink-0
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* ── Área principal ──
            min-w-0 es crítico: evita que el hijo flex desborde al padre
            cuando hay contenido largo (tablas, código, etc.)
        */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Padding responsivo: más pequeño en móvil, más grande en desktop */}
          <main className="flex-1 w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6">
            <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Botón flotante de chat — más pequeño en móvil */}
      <Link
        href="/chat"
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        title="Abrir asistente IA"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Link>
    </div>
  );
}