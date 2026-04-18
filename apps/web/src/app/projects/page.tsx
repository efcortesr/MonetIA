import Link from "next/link";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listProjects } from "@/lib/projects-api";

function formatCOP(value: number) {
  const formatted = value.toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  });
  return `COP ${formatted}`;
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

function mapStatusTone(status: string): BadgeTone {
  const normalized = status.toLowerCase();
  if (normalized.includes("riesgo") || normalized.includes("risk")) return "danger";
  if (normalized.includes("completado") || normalized.includes("done")) return "muted";
  if (normalized.includes("activo") || normalized.includes("track")) return "info";
  return "warning";
}

export default async function ProjectsPage() {
  const result = await listProjects()
    .then((projects: ApiProject[]) => ({ projects, error: null as string | null }))
    .catch((error: unknown) => ({
      projects: [],
      error: error instanceof Error ? error.message : "Error desconocido al cargar proyectos.",
    }));

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">▣</span>
          Proyectos
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {result.error
            ? "No se pudo conectar con el backend. Verifica que Django esté ejecutándose."
            : "Todos los proyectos activos y completados."}
        </div>
      </div>

      {result.error ? (
        <Card className="p-5 text-sm text-zinc-600">{result.error}</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.projects.map((project: ApiProject) => {
            const budget = Number(project.budget);
            const spent = Number(project.total_spent);
            const pct = budget > 0 ? (spent / budget) * 100 : 0;

            return (
              <Card key={project.id} className="p-0">
                <div className="flex items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </div>
                    <div className="mt-2">
                      <Badge tone={mapStatusTone(project.status)}>{project.status}</Badge>
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
                        {formatCOP(budget)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[11px] text-zinc-500">Gastado</div>
                      <div className="mt-1 text-xs font-medium text-zinc-700">
                        {formatCOP(spent)}
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
      )}
    </div>
  );
}