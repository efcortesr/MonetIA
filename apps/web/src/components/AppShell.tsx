import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="w-full flex-1 px-6 py-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
