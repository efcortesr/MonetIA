"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
];

export function DetailSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
          B
        </div>
        <div>
          <div className="text-sm font-semibold leading-5 text-zinc-900">
            BudgetAI
          </div>
          <div className="text-xs text-zinc-500">Enterprise</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-2">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/projects" && pathname.startsWith("/projects"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-100" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-900">
              Alex Morgan
            </div>
            <div className="truncate text-xs text-zinc-500">alex@budgetai.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
