"use client";

import { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

export function ConditionalShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
