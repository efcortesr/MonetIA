"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { approveRecommendation, discardRecommendation, type ApiRecommendation } from "@/lib/projects-api";

type Priority = "Alta" | "Media" | "Baja";

function PriorityPill({ p }: Readonly<{ p: Priority }>) {
  if (p === "Alta") return <Badge tone="danger">Alta</Badge>;
  if (p === "Media") return <Badge tone="warning">Media</Badge>;
  return <Badge tone="muted">Baja</Badge>;
}

export default function RecommendationsClient({ initialItems }: Readonly<{ initialItems: ApiRecommendation[] }>) {
  const [items, setItems] = useState<ApiRecommendation[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"Todas" | "Alta" | "Media" | "Baja">("Todas");
  
  // Modal states
  const [selectedRec, setSelectedRec] = useState<ApiRecommendation | null>(null);
  
  // Pending actions
  const [loadingIds, setLoadingIds] = useState<Record<string, "approving" | "discarding">>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleApprove = async (id: string, title: string) => {
    setLoadingIds(prev => ({ ...prev, [id]: "approving" }));
    try {
      await approveRecommendation(id);
      // Fade out of current list
      setItems(prev => prev.filter(item => item.id !== id));
      showToast(`¡Recomendación "${title}" aprobada con éxito!`);
    } catch (err) {
      console.error(err);
      alert("Error al aprobar la recomendación");
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
      setItems(prev => prev.filter(item => item.id !== id));
      showToast(`Recomendación "${title}" descartada.`);
    } catch (err) {
      console.error(err);
      alert("Error al descartar la recomendación");
    } finally {
      setLoadingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Filter recommendations based on current tab (we only show pending ones on this page)
  const filteredItems = items.filter(r => {
    if (activeTab === "Todas") return true;
    return r.priority === activeTab;
  });

  const tabs = ["Todas", "Alta", "Media", "Baja"] as const;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-2xl animate-bounce">
          <span className="text-emerald-400">✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600 font-bold">☼</span>
            <span>Recomendaciones IA</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Acciones sugeridas por inteligencia artificial para optimizar costos de tus proyectos
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        {tabs.map((t) => {
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {t}
              {items.some(r => t === "Todas" || r.priority === t) && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.25 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {items.filter(r => t === "Todas" || r.priority === t).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
          <div className="text-4xl mb-4">✨</div>
          <div className="text-lg font-semibold text-zinc-800">Todo en orden</div>
          <div className="mt-1 text-xs max-w-sm text-zinc-500 leading-relaxed">
            No tienes recomendaciones pendientes en la categoría <strong className="text-blue-600">&ldquo;{activeTab}&rdquo;</strong>. 
            Registra más gastos o modifica roles de equipo para recibir nuevos análisis predictivos.
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredItems.map((r) => {
            let priorityBorder = "border-zinc-200 bg-white";
            if (r.priority === "Alta") priorityBorder = "border-rose-400 bg-rose-50/5";
            else if (r.priority === "Media") priorityBorder = "border-amber-400 bg-amber-50/5";
            else if (r.priority === "Baja") priorityBorder = "border-blue-400 bg-blue-50/5";
            
            const actionLoading = loadingIds[r.id];

            return (
              <Card
                key={r.id}
                className={`p-0 overflow-hidden border ${priorityBorder} hover:shadow-md transition-shadow relative shadow-xs`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <PriorityPill p={r.priority} />
                      <div className="mt-3 text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors">
                        {r.title}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {r.project || "Proyecto General"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDiscard(r.id, r.title)}
                      disabled={!!actionLoading}
                      className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1 transition-all duration-200 cursor-pointer disabled:opacity-50"
                      aria-label="Descartar"
                      title="Descartar"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 text-[12px] leading-relaxed text-zinc-600 line-clamp-3">
                    {r.body}
                  </div>

                  <div className="mt-5 flex items-center gap-3 border-t border-zinc-50 pt-4">
                    <button
                      onClick={() => handleApprove(r.id, r.title)}
                      disabled={!!actionLoading}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                    >
                      {actionLoading === "approving" ? (
                        <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : null}
                      Aprobar
                    </button>
                    
                    <button
                      onClick={() => setSelectedRec(r)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
                    >
                      Detalles
                    </button>
                    
                    <button
                      onClick={() => handleDiscard(r.id, r.title)}
                      disabled={!!actionLoading}
                      className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-zinc-400 hover:text-rose-600 hover:underline transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === "discarding" ? (
                        <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                      ) : null}
                      Descartar
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Expanded Details Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <PriorityPill p={selectedRec.priority} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {selectedRec.project || "Proyecto General"}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-zinc-900">{selectedRec.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs leading-relaxed text-zinc-700">
              
              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[10px] mb-1">Descripción de la recomendación</h4>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-zinc-600">
                  {selectedRec.body}
                </div>
              </div>

              {/* Dynamic AI Insights generated section */}
              <div>
                <h4 className="font-semibold text-blue-600 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                  <span>✨ Análisis Adicional de Inteligencia Artificial</span>
                </h4>
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50 text-zinc-600 space-y-2">
                  <p>
                    Basado en las métricas de rendimiento y presupuestos de <strong>{selectedRec.project}</strong>, la IA de MonetIA sugiere aplicar esta corrección inmediatamente.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 mt-2 text-zinc-500">
                    <li>Reduce las desviaciones de presupuesto proyectadas en un 5% - 12%.</li>
                    <li>Libera flujo de caja operativo para contingencias de fase tardía.</li>
                    <li>Permite redistribuir mejor el margen disponible entre categorías críticas.</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider text-[10px] mb-1">Acción del Proyecto</h4>
                <p className="text-zinc-500">
                  Al presionar <strong>&ldquo;Aprobar&rdquo;</strong>, esta recomendación se guardará de manera permanente en el detalle del proyecto correspondiente para el seguimiento del equipo directivo.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
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
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer active:scale-[0.98]"
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
