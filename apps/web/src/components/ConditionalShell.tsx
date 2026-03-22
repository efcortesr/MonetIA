"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/AppShell";

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isProjectDetail =
    pathname !== "/projects" &&
    pathname.startsWith("/projects/") &&
    pathname.split("/").filter(Boolean).length === 2;

    return <AppShell>{children}</AppShell>;
  }