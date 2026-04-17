"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  getProjectRecommendations, 
  generateProjectRecommendations, 
  type ApiRecommendation 
} from "@/lib/projects-api";

function PriorityPill({ p }: { p: "Alta" | "Media" | "Baja" }) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default function ProjectRecommendations({ projectId }: { projectId: string | number }) {
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectRecommendations(projectId);
      setRecommendations(data);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar las recomendaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const newRecs = await generateProjectRecommendations(projectId);
      setRecommendations(newRecs);
      setSuccessMsg("Recomendaciones actualizadas correctamente");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al generar recomendaciones");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [projectId]);

  if (isLoading) {
    return (
      <Card className="p-0 lg:col-span-3 border-zinc-200 bg-zinc-50/50 shadow-sm">
        <CardBody className="py-10 flex flex-col items-center justify-center text-center">
          <div className="animate-spin text-2xl mb-2">⌛</div>
          <div className="text-sm font-medium text-zinc-500">Cargando recomendaciones...</div>
        </CardBody>
      </Card>
    );
  }

  const hasRecommendations = recommendations && recommendations.length > 0;

  return (
    <Card className="p-0 lg:col-span-3 border-blue-100 bg-blue-50/10 shadow-sm transition-all">
      <CardHeader 
        title="☼ Recomendaciones IA"
        subtitle="Acciones sugeridas por Gemini para optimizar este proyecto"
        right={
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2
              ${isGenerating 
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}
            `}
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">●</span>
                Generando...
              </>
            ) : (
              'Generar recomendaciones'
            )}
          </button>
        }
      />
      <CardBody>
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-600 animate-in fade-in slide-in-from-top-1">
            {successMsg}
          </div>
        )}

        {!hasRecommendations ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-4 opacity-10">✧</div>
            <div className="text-sm font-bold text-zinc-900">Aún no hay recomendaciones</div>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs">
              Las recomendaciones no se generan solas. Presiona el botón de arriba para analizar tu proyecto.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((r) => {
              const isHigh = r.priority === "Alta";
              const priorityBorder = isHigh ? "border-l-4 border-rose-500" : "border-l-4 border-zinc-300";

              return (
                <div key={r.id} className={`rounded-xl border bg-white p-5 shadow-sm transition-all duration-500 
                  ${priorityBorder} 
                  ${isGenerating ? 'opacity-70 saturate-50' : 'opacity-100 saturate-100'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <PriorityPill p={r.priority} />
                      <div className="mt-3 text-sm font-bold text-zinc-900">
                        {r.title}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] leading-relaxed text-zinc-600">
                    {r.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
