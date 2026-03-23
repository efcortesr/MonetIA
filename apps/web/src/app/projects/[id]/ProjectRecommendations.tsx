import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getProjectRecommendations, type ApiRecommendation } from "@/lib/projects-api";

function PriorityPill({ p }: { p: "Alta" | "Media" | "Baja" }) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default async function ProjectRecommendations({ projectId }: { projectId: string | number }) {
  let recommendations: ApiRecommendation[] = [];
  let errorMsg = null;

  try {
    recommendations = await getProjectRecommendations(projectId);
  } catch (err: any) {
    errorMsg = err.message || "Error de conexión al servidor";
  }
    
  if (errorMsg) {
    return (
      <Card className="p-0 lg:col-span-3 border-rose-200 bg-rose-50/50 shadow-sm">
        <CardBody className="py-6 flex flex-col items-center justify-center text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-semibold text-rose-700">No se pudieron cargar las recomendaciones</div>
          <div className="text-xs text-rose-600 mt-1 max-w-sm">{errorMsg}</div>
        </CardBody>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="p-0 lg:col-span-3 border-blue-200 bg-blue-50/20 shadow-sm">
        <CardHeader 
          title="☼ Recomendaciones IA"
          subtitle="Acciones sugeridas por Gemini para optimizar este proyecto"
        />
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((r) => {
              const isHigh = r.priority === "Alta";
              return (
                 <div key={r.id} className={`rounded-xl border p-5 ${isHigh ? 'border-rose-100 bg-[#0b1220] text-white' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <PriorityPill p={r.priority} />
                        <div className={`mt-3 text-sm font-semibold ${isHigh ? 'text-white' : 'text-zinc-900'}`}>
                          {r.title}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-3 text-[11px] leading-5 ${isHigh ? 'text-zinc-200' : 'text-zinc-600'}`}>
                      {r.body}
                    </div>
                 </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    );
}
