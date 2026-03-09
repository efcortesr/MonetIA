"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { DetailShell } from "@/components/app/DetailShell";

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isProjectDetail =
    pathname !== "/projects" &&
    pathname.startsWith("/projects/") &&
    pathname.split("/").filter(Boolean).length === 2;

  if (isProjectDetail) {
    return <DetailShell>{children}</DetailShell>;
  }

  return <AppShell>{children}</AppShell>;
}
