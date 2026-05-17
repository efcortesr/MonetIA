"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  /** Auto-dismiss after ms (default: 3500). Set 0 to disable. */
  duration?: number;
};

const ICONS: Record<ToastType, ReactElement> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const STYLES: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800 [&_svg]:text-emerald-600",
  error:   "bg-rose-50 border-rose-200 text-rose-800 [&_svg]:text-rose-600",
  warning: "bg-amber-50 border-amber-200 text-amber-800 [&_svg]:text-amber-600",
  info:    "bg-blue-50 border-blue-200 text-blue-800 [&_svg]:text-blue-600",
};

export function Toast({ message, type = "success", onClose, duration = 3500 }: Readonly<ToastProps>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium 
        animate-in slide-in-from-bottom-2 fade-in duration-300 ${STYLES[type]}`}
    >
      <span className="shrink-0">{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="shrink-0 ml-1 opacity-50 hover:opacity-100 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Fixed-position toast container — renders toasts stacked at the bottom-right.
 * Usage: render <ToastContainer> once at the page level and pass toasts array.
 */
export type ToastItem = {
  id: string;
  message: string;
  type?: ToastType;
};

export function ToastContainer({
  toasts,
  onClose,
}: Readonly<{
  toasts: ToastItem[];
  onClose: (id: string) => void;
}>) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
