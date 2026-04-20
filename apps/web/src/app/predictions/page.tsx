import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  getAiInsights,
  listProjects,
  type ApiAiProjection,
  type ApiAiRiskFactor,
  type ApiAiInsightSummary,
} from "@/lib/projects-api";
import ProjectFilter from "@/app/predictions/ProjectFilter";

function ProjectionChart({
  data,
}: Readonly<{
  data: ApiAiProjection | null;
}>) {
  const w = 980;
  const h = 260;
  const padX = 56;
  const padY = 20;

  if (!data) {
    return (
      <div className="h-60 w-full flex items-center justify-center text-xs text-zinc-500">
        No hay datos de proyeccion disponibles.
      </div>
    );
  }

  const labels = data.labels;
  const base = data.actual;
  const opt = data.optimistic;
  const exp = data.expected;
  const pes = data.pessimistic;

  const series = [...base, ...opt, ...exp, ...pes].filter((value) => Number.isFinite(value));
  const min = Math.min(...series) * 0.9;
  const max = Math.max(...series) * 1.1;
  const range = Math.max(1, max - min);

  const xStep = (w - padX - 24) / (labels.length - 1);
  const toX = (i: number) => padX + i * xStep;
  const toY = (v: number) => (1 - (v - min) / range) * (h - padY * 2) + padY;

  const baseD = base
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");

  const todayIndex = data.today_index;
  const scenarioStart = todayIndex;

  const scenarioPath = (arr: number[]) =>
    arr
      .slice(scenarioStart)
      .map((v, i) => {
        const idx = scenarioStart + i;
        const startVal = base[todayIndex];
        const y = i === 0 ? toY(startVal) : toY(v);
        return `${i === 0 ? "M" : "L"} ${toX(idx)} ${y}`;
      })
      .join(" ");

  const yTicks = [0.25, 0.5, 0.75, 1].map((t) => min + range * t);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-60 w-full">
      <rect x="0" y="0" width={w} height={h} fill="white" />

      {labels.map((_, i) => (
        <line
          key={i}
          x1={toX(i)}
          x2={toX(i)}
          y1={padY}
          y2={h - padY - 12}
          stroke="#f1f5f9"
        />
      ))}

      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={padX}
            x2={w - 24}
            y1={toY(t)}
            y2={toY(t)}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
          />
          <text
            x={padX - 10}
            y={toY(t) + 4}
            textAnchor="end"
            fontSize="10"
            fill="#9ca3af"
          >
            ${Math.round(t / 1000)}k
          </text>
        </g>
      ))}

      {labels.map((l, i) => (
        <text
          key={l}
          x={toX(i)}
          y={h - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          {l}
        </text>
      ))}

      <path d={baseD} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      <circle cx={toX(todayIndex)} cy={toY(base[todayIndex])} r={3} fill="#ffffff" stroke="#2563eb" strokeWidth="2" />

      <line
        x1={toX(todayIndex)}
        x2={toX(todayIndex)}
        y1={padY}
        y2={h - padY - 12}
        stroke="#94a3b8"
        strokeDasharray="4 4"
      />

      <path d={scenarioPath(opt)} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" />
      <path d={scenarioPath(exp)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
      <path d={scenarioPath(pes)} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

      <g>
        <rect x={toX(todayIndex) - 26} y={padY + 8} rx="14" ry="14" width="52" height="22" fill="#111827" />
        <text x={toX(todayIndex)} y={padY + 23} textAnchor="middle" fontSize="10" fill="#ffffff">
          Hoy
        </text>
      </g>
    </svg>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(iso: string) {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "Reciente";
  const diffMs = Date.now() - time;
  const diffHrs = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  return `Detectada hace ${diffHrs} horas`;
}

function summaryTone(summary: ApiAiInsightSummary | null) {
  if (!summary) return "muted";
  if (summary.severity === "Crítica") return "danger";
  if (summary.severity === "Moderada") return "warning";
  return "info";
}

function summaryCardClass(tone: string) {
  if (tone === "danger") return "border-rose-200 bg-rose-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-blue-200 bg-blue-50";
}

function summaryIconClass(tone: string) {
  if (tone === "danger") return "bg-rose-100 text-rose-600";
  if (tone === "warning") return "bg-amber-100 text-amber-600";
  return "bg-blue-100 text-blue-600";
}

function riskCardClasses(tone: ApiAiRiskFactor["tone"]) {
  if (tone === "danger") return "border-rose-200 bg-rose-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  if (tone === "info") return "border-blue-200 bg-blue-50";
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  return "border-zinc-200 bg-zinc-50";
}

export default async function PredictionsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ project_id?: string }>;
}>) {
  const params = searchParams ? await searchParams : undefined;
  const selectedProjectId = params?.project_id ?? "";

  const [projects, insights] = await Promise.all([
    listProjects().catch(() => []),
    getAiInsights(selectedProjectId || undefined).catch(() => ({
      summary: null,
      projection: null,
      risk_factors: [],
    })),
  ]);

  const tone = summaryTone(insights.summary);
  const projectLabel = selectedProjectId
    ? projects.find((project) => String(project.id) === String(selectedProjectId))?.name
    : null;
  const summaryClassName = summaryCardClass(tone);
  const iconClassName = summaryIconClass(tone);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600">◍</span>
            AI Insights
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Predicciones y análisis de riesgo, basados en inteligencia artificial
          </div>
        </div>
        {projects.length > 0 ? (
          <ProjectFilter
            projects={projects}
            selectedProjectId={selectedProjectId}
          />
        ) : null}
      </div>

      {insights.summary ? (
        <div
          className={`rounded-2xl border p-4 ${summaryClassName}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconClassName}`}
            >
              <span className="text-sm font-bold">!</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone={tone}>{insights.summary.severity}</Badge>
                <div className="text-xs font-semibold text-zinc-600">
                  {formatRelativeTime(insights.summary.generated_at)}
                </div>
              </div>
              <div className="mt-2 text-xs font-semibold text-zinc-900">
                {projectLabel ?? insights.summary.project_name} — Sobrecosto potencial
              </div>
              <div className="mt-1 text-[11px] leading-4 text-zinc-600">
                La IA proyecta un costo final de
                {" "}
                <span className="font-semibold">{formatCurrency(insights.summary.predicted_total)}</span>
                {" "}vs{" "}
                <span className="font-semibold">{formatCurrency(insights.summary.budget)}</span> presupuestados.
                {" "}
                Consumo actual:{" "}
                <span className="font-semibold">{insights.summary.consumed_pct.toFixed(1)}%</span>.
              </div>
              <div className="mt-2 text-[11px] text-zinc-500">
                Confianza del modelo: {Math.round(insights.summary.confidence)}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500">
          Aun no hay suficientes datos para generar predicciones.
        </div>
      )}

      <Card className="p-0">
        <CardHeader
          title="Proyección Presupuestaria — 3 Escenarios"
          right={
            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Real
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Optimista
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Esperado
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Pesimista
              </div>
            </div>
          }
        />
        <CardBody>
          <ProjectionChart data={insights.projection} />
        </CardBody>
      </Card>

      <div>
        <div className="text-sm font-semibold text-zinc-900">Risk Factors Breakdown</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.risk_factors.map((factor) => (
          <Card key={factor.id} className={riskCardClasses(factor.tone)}>
            <CardHeader
              title={factor.title}
              right={<Badge tone={factor.tone === "neutral" ? "muted" : factor.tone}>{factor.tone}</Badge>}
            />
            <CardBody>
              <div className="text-[11px] leading-4 text-zinc-700">
                {factor.message}
              </div>
              <button className="mt-3 text-xs font-semibold text-zinc-700 hover:underline">
                {factor.action} →
              </button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
