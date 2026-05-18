"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/AppShell";

export function ConditionalShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const noShellPaths = ["/login", "/register"];

  if (noShellPaths.includes(pathname)) {
    return <div className="min-h-screen bg-[#f4f7fb] text-zinc-900">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}
