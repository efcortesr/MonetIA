import { getGlobalRecommendations, type ApiRecommendation } from "@/lib/projects-api";
import RecommendationsClient from "./RecommendationsClient";

export default async function RecommendationsPage() {
  let items: ApiRecommendation[] = [];
  let errorMsg: string | null = null;

  try {
    // Only show pending recommendations on the general list page
    const allItems = await getGlobalRecommendations();
    items = allItems.filter(item => !item.status || item.status === "pending");
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Error al conectar con el servidor.";
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-rose-500 bg-rose-50/50 rounded-xl border border-rose-100">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="text-lg font-semibold text-rose-700">Error al cargar recomendaciones</div>
        <div className="mt-1 text-sm max-w-md text-rose-600">
          No pudimos obtener las sugerencias del sistema.
          <br />
          Detalle técnico: {errorMsg}
        </div>
      </div>
    );
  }

  return <RecommendationsClient initialItems={items} />;
}
