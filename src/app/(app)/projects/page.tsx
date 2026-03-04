import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

function formatUSD(value: number) {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  return `USD ${formatted}`;
}

function ProgressLine({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-100">
      <div
        className="h-1.5 rounded-full bg-blue-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProjectsPage() {
  const projects = [
    {
      id: "ecom",
      name: "Plataforma E-Commerce v2",
      status: "En riesgo",
      tone: "danger" as const,
      budget: 450_000,
      spent: 312_000,
    },
    {
      id: "mobile",
      name: "App Móvil Clientes",
      status: "Activo",
      tone: "info" as const,
      budget: 230_000,
      spent: 145_000,
    },
    {
      id: "aws",
      name: "Migración Cloud AWS",
      status: "Activo",
      tone: "info" as const,
      budget: 180_000,
      spent: 78_000,
    },
    {
      id: "crm",
      name: "CRM Interno",
      status: "Completado",
      tone: "muted" as const,
      budget: 120_000,
      spent: 115_000,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">▣</span>
          Proyectos
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Todos los proyectos activos y completados.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((p) => {
          const pct = (p.spent / p.budget) * 100;

          return (
            <Card key={p.id} className="p-0">
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </div>
                  <div className="mt-2">
                    <Badge tone={p.tone}>{p.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-xs">→</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-zinc-500">Presupuesto</div>
                    <div className="mt-1 text-xs font-medium text-zinc-700">
                      {formatUSD(p.budget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-zinc-500">Gastado</div>
                    <div className="mt-1 text-xs font-medium text-zinc-700">
                      {formatUSD(p.spent)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressLine value={pct} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
