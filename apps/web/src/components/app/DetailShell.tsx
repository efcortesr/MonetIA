import { ReactNode } from "react";
import { DetailSidebar } from "@/components/detail/DetailSidebar";
import { DetailTopbar } from "@/components/detail/DetailTopbar";

export function DetailShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <DetailSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DetailTopbar />
          <main className="w-full flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
