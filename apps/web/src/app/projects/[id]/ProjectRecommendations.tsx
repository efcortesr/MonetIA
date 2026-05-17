"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  getProjectRecommendations, 
  generateProjectRecommendations,
  approveRecommendation,
  discardRecommendation, 
  type ApiRecommendation 
} from "@/lib/projects-api";

function PriorityPill({ p }: Readonly<{ p: "Alta" | "Media" | "Baja" }>) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default function ProjectRecommendations({ projectId }: Readonly<{ projectId: string | number }>) {
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Interaction states
  const [selectedRec, setSelectedRec] = useState<ApiRecommendation | null>(null);
  const [loadingIds, setLoadingIds] = useState<Record<string, "approving" | "discarding">>({});

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProjectRecommendations(projectId);
      setRecommendations(data);
      setErrorMsg(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al cargar las recomendaciones");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const newRecs = await generateProjectRecommendations(projectId);
      setRecommendations(newRecs);
      setSuccessMsg("Recomendaciones actualizadas correctamente");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al generar recomendaciones");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id: string, title: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: "approving" }));
    try {
      await approveRecommendation(id);
      // Update local state: mark it as approved
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, status: "approved" } : r)
      );
      setSuccessMsg(`¡Recomendación "${title}" aprobada!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al aprobar la recomendación");
    } finally {
      setLoadingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDiscard = async (id: string, title: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: "discarding" }));
    try {
      await discardRecommendation(id);
      // Remove from list
      setRecommendations(prev => prev.filter(r => r.id !== id));
      setSuccessMsg("Recomendación descartada.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al descartar la recomendación");
    } finally {
      setLoadingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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

  // Filter recommendations
  const pendingRecs = recommendations.filter(r => !r.status || r.status === "pending");
  const approvedRecs = recommendations.filter(r => r.status === "approved");

  return (
    <div className="lg:col-span-3 space-y-6">
      <Card className="p-0 border-blue-100 bg-blue-50/10 shadow-sm transition-all">
        <CardHeader 
          title="☼ Recomendaciones sugeridas"
          subtitle="Acciones predictivas por Gemini para optimizar este proyecto"
          right={
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer
                ${isGenerating 
                  ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}
              `}
            >
              {isGenerating ? (
                <>
                  <span className="animate-pulse">●</span>{" "}
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

          {pendingRecs.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingRecs.map((r) => {
                let priorityBorder = "border-zinc-200 bg-white";
                if (r.priority === "Alta") priorityBorder = "border-rose-400 bg-rose-50/5";
                else if (r.priority === "Media") priorityBorder = "border-amber-400 bg-amber-50/5";
                else if (r.priority === "Baja") priorityBorder = "border-blue-400 bg-blue-50/5";
                
                const actionLoading = loadingIds[r.id];

                return (
                  <div key={r.id} className={`rounded-xl border p-5 shadow-sm transition-all duration-300 relative ${priorityBorder} 
                    ${isGenerating ? 'opacity-70 saturate-50' : 'opacity-100 saturate-100'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <PriorityPill p={r.priority} />
                        <div className="mt-3 text-sm font-bold text-zinc-900">
                          {r.title}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDiscard(r.id, r.title)}
                        disabled={!!actionLoading}
                        className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1 transition-all cursor-pointer"
                        title="Descartar"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-3 text-[12px] leading-relaxed text-zinc-600 line-clamp-3">
                      {r.body}
                    </div>

                    <div className="mt-4 flex items-center gap-3 pt-3 border-t border-zinc-50">
                      <button
                        onClick={() => handleApprove(r.id, r.title)}
                        disabled={!!actionLoading}
                        className="inline-flex h-7 items-center justify-center rounded-lg bg-blue-600 px-3 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer active:scale-98 disabled:opacity-60"
                      >
                        {actionLoading === "approving" ? "Aprobando..." : "Aprobar"}
                      </button>
                      <button
                        onClick={() => setSelectedRec(r)}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
                      >
                        Detalles
                      </button>
                      <button
                        onClick={() => handleDiscard(r.id, r.title)}
                        disabled={!!actionLoading}
                        className="inline-flex h-7 items-center justify-center rounded-lg px-1 text-[11px] font-semibold text-zinc-400 hover:text-rose-600 hover:underline transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4 opacity-10">✧</div>
              <div className="text-sm font-bold text-zinc-900">Aún no hay recomendaciones sugeridas</div>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                Presiona el botón de arriba para analizar tu proyecto y recibir nuevas sugerencias de optimización.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* New Section: Recomendaciones Aprobadas */}
      {approvedRecs.length > 0 && (
        <Card className="p-0 border-emerald-200 bg-emerald-50/5 shadow-xs transition-all animate-fade-in">
          <CardHeader 
            title="✓ Recomendaciones aprobadas"
            subtitle="Acciones de optimización financiera validadas por el equipo directivo"
          />
          <CardBody>
            <div className="grid gap-4 lg:grid-cols-2">
              {approvedRecs.map((r) => (
                <div key={r.id} className="rounded-xl border border-emerald-400 bg-emerald-50/5 p-5 shadow-xs transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        ✓ Aprobada
                      </span>
                      <div className="mt-2 text-sm font-bold text-zinc-900">
                        {r.title}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 text-[12px] leading-relaxed text-zinc-600">
                    {r.body}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Expanded Details Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <PriorityPill p={selectedRec.priority} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Proyecto
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-zinc-900">{selectedRec.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs leading-relaxed text-zinc-700">
              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[10px] mb-1">Descripción Completa</h4>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-zinc-600">
                  {selectedRec.body}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                  <span>✨ Análisis Adicional de Inteligencia Artificial</span>
                </h4>
                <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50/50 text-zinc-600 space-y-2">
                  <p>
                    Esta recomendación de tipo <strong>{selectedRec.priority}</strong> fue formulada mediante el análisis de costos cruzados de este proyecto en particular.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-500">
                    <li>Reduce riesgos de desviación presupuestaria en tiempo real.</li>
                    <li>Permite equilibrar la asignación de recursos y roles técnicos.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
              <button
                onClick={() => setSelectedRec(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={async () => {
                  const item = selectedRec;
                  setSelectedRec(null);
                  await handleApprove(item.id, item.title);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                Aprobar recomendación
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
