"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavIcon({
  name,
}: {
  name: "dashboard" | "projects" | "predictions" | "recommendations";
}) {
  if (name === "dashboard") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9 7v-10h7v10h-7Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === "projects") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "predictions") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 19V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 16l4-4 3 3 5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/projects", label: "Proyectos", icon: "projects" as const },
  { href: "/predictions", label: "AI Insights", icon: "predictions" as const },
  {
    href: "/recommendations",
    label: "Recomendaciones",
    icon: "recommendations" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0b1220] text-zinc-100 md:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
          M
        </div>
        <div>
          <div className="text-sm font-semibold leading-5">MonetIA</div>
          <div className="text-xs text-zinc-300/80">Global Dashboard</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-zinc-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={
                  active ? "text-white" : "text-zinc-400"
                }
              >
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          <div className="text-xs text-zinc-300">IA Activa</div>
        </div>
      </div>
    </aside>
  );
}
