import { ReactNode } from "react";
import { ConditionalShell } from "@/components/ConditionalShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ConditionalShell>{children}</ConditionalShell>;
}
