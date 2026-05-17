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
          <span>Recomendaciones IA</span>
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
            const priorityBorder = isHigh ? "border-l-4 border-rose-500" : "border-l-4 border-zinc-300";

            return (
              <Card
                key={r.id}
                className={`p-0 overflow-hidden ${priorityBorder} hover:shadow-md transition-shadow`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <PriorityPill p={r.priority} />
                      <div className="mt-3 text-sm font-bold text-zinc-900">
                        {r.title}
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        {r.project}
                      </div>
                    </div>

                    <button
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                      aria-label="Descartar"
                      title="Descartar"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 text-[12px] leading-relaxed text-zinc-700">
                    {r.body}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
                      Aprobar
                    </button>
                    <button className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 transition-all">
                      Detalles
                    </button>
                    <button className="inline-flex h-8 items-center rounded-lg px-0 text-xs font-semibold text-zinc-500 hover:text-rose-600 hover:underline transition-colors">
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
