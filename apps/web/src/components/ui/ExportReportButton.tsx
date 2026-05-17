"use client";

import { useRef, useState } from "react";
import { exportProjectReport } from "@/lib/projects-api";

type Filters = {
  start_date?: string;
  end_date?: string;
  category?: string;
};

type Props = {
  projectId: string | number;
  filters?: Filters;
};

const ICON_PDF = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
    <polyline points="9 9 10 9" />
  </svg>
);

const ICON_EXCEL = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </svg>
);

const ICON_DOWNLOAD = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ICON_SPINNER = (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

export default function ExportReportButton({ projectId, filters }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: "pdf" | "excel") => {
    setOpen(false);
    setLoading(format);
    setError(null);
    try {
      await exportProjectReport(projectId, format, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al exportar el reporte");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger button */}
      <button
        id="export-report-btn"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 rounded-lg shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {loading ? ICON_SPINNER : ICON_DOWNLOAD}
        {loading ? "Exportando..." : "Exportar reporte"}
        {!loading && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1.5 w-44 rounded-xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/60 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="px-3 py-2 border-b border-zinc-50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Selecciona formato
              </p>
            </div>
            <button
              id="export-pdf-btn"
              role="menuitem"
              onClick={() => handleExport("pdf")}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <span className="text-red-500">{ICON_PDF}</span>
              {" "}Exportar como PDF
            </button>
            <button
              id="export-excel-btn"
              role="menuitem"
              onClick={() => handleExport("excel")}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <span className="text-emerald-600">{ICON_EXCEL}</span>
              {" "}Exportar como Excel
            </button>
          </div>
        </>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute right-0 top-full mt-2 z-50 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 shadow-md min-w-[200px]">
          <span className="font-bold">⚠</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
