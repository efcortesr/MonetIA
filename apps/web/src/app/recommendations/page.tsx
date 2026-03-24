import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

import { getGlobalRecommendations, type ApiRecommendation } from "@/lib/projects-api";

type Priority = "Alta" | "Media" | "Baja";

function PriorityPill({ p }: { p: Priority }) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default async function RecommendationsPage() {
  let items: ApiRecommendation[] = [];
  let errorMsg: string | null = null;

  try {
    items = await getGlobalRecommendations();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Error al conectar con el servidor.";
  }


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

      {errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-rose-500 bg-rose-50/50 rounded-xl border border-rose-100">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg font-semibold text-rose-700">Error al cargar recomendaciones</div>
          <div className="mt-1 text-sm max-w-md text-rose-600">
            No pudimos obtener las sugerencias del sistema.
            <br />
            Detalle técnico: {errorMsg}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
          <div className="text-4xl mb-4">✨</div>
          <div className="text-lg font-semibold text-zinc-900">Todo en orden</div>
          <div className="mt-1 text-sm max-w-sm">
            Actualmente no hay recomendaciones. Continúa registrando gastos y roles en tus proyectos para recibir optimizaciones inteligentes.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((r) => {
            const isHigh = r.priority === "Alta";
            return (
              <Card
                key={r.id}
                className={
                  isHigh
                    ? "p-0 overflow-hidden border-rose-100 bg-[#0b1220] text-white"
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
                            ? "mt-3 text-sm font-semibold text-white"
                            : "mt-3 text-sm font-semibold text-zinc-900"
                        }
                      >
                        {r.title}
                      </div>
                      <div
                        className={
                          isHigh
                            ? "mt-1 text-[11px] text-zinc-300"
                            : "mt-1 text-[11px] text-zinc-500"
                        }
                      >
                        {r.project}
                      </div>
                    </div>

                    <button
                      className={
                        isHigh
                          ? "text-zinc-400 hover:text-white"
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
                          ? "inline-flex h-8 items-center rounded-lg px-0 text-xs font-semibold text-zinc-300 hover:underline"
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
      )}
    </div>
  );
}
