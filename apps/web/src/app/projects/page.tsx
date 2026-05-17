import Link from "next/link";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listProjects, type ApiProject } from "@/lib/projects-api";

function formatCOP(value: number) {
  return `COP ${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

function ProgressBar({ value, tone }: { value: number; tone: "safe" | "warning" | "danger" }) {
  const pct = Math.max(0, Math.min(100, value));
  const colors = {
    safe:    "bg-emerald-500",
    warning: "bg-amber-400",
    danger:  "bg-rose-500",
  };
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-1.5 rounded-full transition-all duration-500 ${colors[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function mapStatusTone(status: string): BadgeTone {
  const n = status.toLowerCase();
  if (n.includes("riesgo") || n.includes("risk"))        return "danger";
  if (n.includes("completado") || n.includes("done"))    return "muted";
  if (n.includes("activo") || n.includes("track"))       return "info";
  return "warning";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-zinc-900">Aún no tienes proyectos</h2>
      <p className="mt-1 text-sm text-zinc-500 max-w-xs">
        Crea tu primer proyecto para empezar a registrar gastos y controlar tu presupuesto.
      </p>
      <Link
        id="create-first-project-btn"
        href="/projects/new"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        + Crear mi primer proyecto
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <span className="text-rose-500 mt-0.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-800">No se pudo conectar con el servidor</p>
          <p className="text-xs text-zinc-500 mt-1">Verifica que el backend de Django esté ejecutándose en el puerto 8000.</p>
          <p className="text-xs text-zinc-400 mt-2 font-mono">{message}</p>
        </div>
      </div>
    </Card>
  );
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
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600">▣</span>
            Proyectos
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {result.error
              ? "No se pudo conectar con el backend."
              : result.projects.length > 0
                ? `${result.projects.length} proyecto${result.projects.length !== 1 ? "s" : ""} encontrado${result.projects.length !== 1 ? "s" : ""}.`
                : "Aún no hay proyectos registrados."}
          </div>
        </div>
        {!result.error && (
          <Link
            id="new-project-btn"
            href="/projects/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            + Nuevo proyecto
          </Link>
        )}
      </div>

      {/* ── Error ── */}
      {result.error && <ErrorState message={result.error} />}

      {/* ── Empty state ── */}
      {!result.error && result.projects.length === 0 && <EmptyState />}

      {/* ── Project grid ── */}
      {!result.error && result.projects.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.projects.map((project: ApiProject) => {
            const budget = Number(project.budget);
            const spent  = Number(project.total_spent);
            const pct    = budget > 0 ? (spent / budget) * 100 : 0;
            const tone: "safe" | "warning" | "danger" =
              pct >= 100 ? "danger" : pct >= 80 ? "warning" : "safe";

            return (
              <Link
                key={project.id}
                id={`project-card-${project.id}`}
                href={`/projects/${project.id}`}
                className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
              >
                <Card className="p-0 group-hover:border-blue-200 group-hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 p-5 pb-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors truncate">
                        {project.name}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-400">
                        {project.start_date} → {project.end_date}
                      </div>
                      <div className="mt-2">
                        <Badge tone={mapStatusTone(project.status)}>{project.status}</Badge>
                      </div>
                    </div>
                    <svg
                      className="shrink-0 w-4 h-4 text-zinc-300 group-hover:text-blue-400 transition-colors mt-1"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>

                  <div className="px-5 pb-5 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-medium">Presupuesto</div>
                        <div className="mt-0.5 font-semibold text-zinc-700">{formatCOP(budget)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-medium">Gastado</div>
                        <div className={`mt-0.5 font-semibold ${tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-zinc-700"}`}>
                          {formatCOP(spent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-medium">Ejecución</div>
                        <div className={`mt-0.5 font-bold ${tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : "text-emerald-600"}`}>
                          {Math.round(pct)}%
                        </div>
                      </div>
                    </div>

                    <ProgressBar value={pct} tone={tone} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}