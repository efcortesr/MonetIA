import { ReactNode } from "react";

export type BadgeTone =
  | "default"
  | "muted"
  | "success"
  | "warning"
  | "danger"
  | "info";

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const map: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-700",
    muted: "bg-zinc-50 text-zinc-500",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}
