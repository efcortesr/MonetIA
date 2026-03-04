import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Priority = "Alta" | "Media" | "Baja";

function PriorityPill({ p }: { p: Priority }) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default function RecommendationsPage() {
  const items = [
    {
      id: "hi-1",
      priority: "Alta" as const,
      title: "Renegociar contrato con proveedor de hosting",
      project: "Plataforma E-Commerce v2",
      body:
        "El análisis predictivo indica que los costos de infraestructura superarán el presupuesto en un 22%. Renegociar ahora puede ahorrar hasta $35,000.",
    },
    {
      id: "hi-2",
      priority: "Alta" as const,
      title: "Reducir alcance del módulo de reportes",
      project: "Plataforma E-Commerce v2",
      body:
        "El módulo de reportes avanzados consume el 28% del presupuesto restante. Simplificar features no críticas libera recursos para items prioritarios.",
    },
    {
      id: "m-1",
      priority: "Media" as const,
      title: "Consolidar licencias de software",
      project: "App Móvil Clientes",
      body:
        "Se detectaron 3 herramientas con funcionalidad similar. Consolidar puede ahorrar $8,500/mes.",
    },
    {
      id: "m-2",
      priority: "Media" as const,
      title: "Optimizar distribución del equipo",
      project: "Plataforma E-Commerce v2",
      body:
        "Reasignar 2 desarrolladores senior del proyecto CRM (completado) al E-Commerce podría acelerar la entrega en 3 semanas.",
    },
    {
      id: "l-1",
      priority: "Baja" as const,
      title: "Automatizar pruebas de integración",
      project: "Migración Cloud AWS",
      body:
        "La inversión inicial de $12,000 en CI/CD reducirá costos de QA manual en un 40% a mediano plazo.",
    },
    {
      id: "l-2",
      priority: "Baja" as const,
      title: "Revisar plan de capacitación",
      project: "App Móvil Clientes",
      body:
        "El equipo dedica 13% del tiempo a aprender nuevas herramientas. Un plan estructurado podría reducirlo al 8%.",
    },
  ];

  const tabs = ["Todas", "Alta", "Media", "Baja"] as const;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">☼</span>
          Recomendaciones IA
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Acciones sugeridas por inteligencia artificial para optimizar costos
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tabs.map((t, idx) => (
          <button
            key={t}
            className={
              idx === 0
                ? "inline-flex h-8 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white"
                : "inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((r) => {
          const isHigh = r.priority === "Alta";
          return (
            <Card
              key={r.id}
              className={
                isHigh
                  ? "p-0 overflow-hidden border-zinc-900 bg-[#0b1220] text-white"
                  : "p-0"
              }
            >
              <div className={isHigh ? "p-5" : "p-5"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <PriorityPill p={r.priority} />
                    <div
                      className={
                        isHigh
                          ? "mt-3 text-sm font-semibold"
                          : "mt-3 text-sm font-semibold text-zinc-900"
                      }
                    >
                      {r.title}
                    </div>
                    <div
                      className={
                        isHigh
                          ? "mt-1 text-[11px] text-zinc-200"
                          : "mt-1 text-[11px] text-zinc-500"
                      }
                    >
                      {r.project}
                    </div>
                  </div>

                  <button
                    className={
                      isHigh
                        ? "text-zinc-300 hover:text-white"
                        : "text-zinc-400 hover:text-zinc-600"
                    }
                    aria-label="Descartar"
                    title="Descartar"
                  >
                    ✕
                  </button>
                </div>

                <div
                  className={
                    isHigh
                      ? "mt-3 text-[11px] leading-4 text-zinc-200"
                      : "mt-3 text-[11px] leading-4 text-zinc-600"
                  }
                >
                  {r.body}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">
                    Aprobar
                  </button>
                  <button
                    className={
                      isHigh
                        ? "inline-flex h-8 items-center rounded-lg border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                        : "inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                    }
                  >
                    Detalles
                  </button>
                  <button
                    className={
                      isHigh
                        ? "inline-flex h-8 items-center rounded-lg px-0 text-xs font-semibold text-zinc-200 hover:underline"
                        : "inline-flex h-8 items-center rounded-lg px-0 text-xs font-semibold text-zinc-600 hover:underline"
                    }
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
