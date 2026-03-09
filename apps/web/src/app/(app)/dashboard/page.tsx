import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

function formatUSD(value: number) {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  return `USD ${formatted}`;
}

function MetricIcon({ kind }: { kind: "budget" | "spend" | "ai" }) {
  const base =
    kind === "budget"
      ? "bg-blue-50 text-blue-600"
      : kind === "spend"
        ? "bg-amber-50 text-amber-600"
        : "bg-rose-50 text-rose-600";

  return (
    <div className={`grid h-8 w-8 place-items-center rounded-full ${base}`}>
      {kind === "budget" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2v20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 7.5a4 4 0 0 0-4-4H9.5a3.5 3.5 0 1 0 0 7H14a3.5 3.5 0 1 1 0 7H10.5a4 4 0 0 1-4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : kind === "spend" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  delta,
  deltaTone,
  icon,
}: {
  title: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "danger" | "muted";
  icon: "budget" | "spend" | "ai";
}) {
  const deltaClass =
    deltaTone === "success"
      ? "text-emerald-600"
      : deltaTone === "danger"
        ? "text-rose-600"
        : "text-zinc-400";

  return (
    <Card className="p-0">
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <div className="text-xs font-medium text-zinc-500">{title}</div>
          <div className="mt-1 text-base font-semibold text-zinc-900">
            {value}
          </div>
          {delta ? (
            <div className={`mt-1 text-xs ${deltaClass}`}>{delta}</div>
          ) : null}
        </div>
        <MetricIcon kind={icon} />
      </div>
    </Card>
  );
}

function BurnRateChart() {
  const w = 860;
  const h = 240;
  const padX = 54;
  const padY = 24;

  const labels = [
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
  ];

  const actual = [120, 135, 155, 185, 205, 230];
  const projected = [250, 270, 290, 310];
  const min = 100;
  const max = 340;
  const range = max - min;

  const xStep = (w - padX - 24) / (labels.length - 1);
  const toX = (i: number) => padX + i * xStep;
  const toY = (v: number) => (1 - (v - min) / range) * (h - padY * 2) + padY;

  const actualD = actual
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");
  const projOffset = actual.length - 1;
  const projectedD = projected
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i + projOffset)} ${toY(i === 0 ? actual[actual.length - 1] : v)}`)
    .join(" ");

  const yTicks = [100, 150, 200, 250, 300, 350];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
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
              ${t}k
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

        <path d={actualD} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        {actual.slice(0, -1).map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r={2}
            fill="#2563eb"
          />
        ))}
        <circle
          cx={toX(actual.length - 1)}
          cy={toY(actual[actual.length - 1])}
          r={3}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="2"
        />

        <path
          d={projectedD}
          fill="none"
          stroke="#6b7280"
          strokeDasharray="4 4"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function HealthDot({ health }: { health: "good" | "warning" | "bad" }) {
  const cls =
    health === "good"
      ? "bg-emerald-500"
      : health === "warning"
        ? "bg-amber-500"
        : "bg-rose-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />;
}

export default function DashboardPage() {
  const totalBudget = 1_030_000;
  const actualSpend = 650_000;
  const predictedFinal = 1_112_000;

  const projectRows = [
    {
      id: "ecom",
      name: "Plataforma E-Commerce v2",
      status: "En riesgo",
      statusTone: "danger" as const,
      budget: 450_000,
      spent: 312_000,
      health: "bad" as const,
    },
    {
      id: "mobile",
      name: "App Móvil Clientes",
      status: "Activo",
      statusTone: "info" as const,
      budget: 230_000,
      spent: 145_000,
      health: "warning" as const,
    },
    {
      id: "aws",
      name: "Migración Cloud AWS",
      status: "Activo",
      statusTone: "info" as const,
      budget: 180_000,
      spent: 78_000,
      health: "good" as const,
    },
    {
      id: "crm",
      name: "CRM Interno",
      status: "Completado",
      statusTone: "default" as const,
      budget: 120_000,
      spent: 115_000,
      health: "good" as const,
    },
  ];

  const categories = [
    { name: "Ingeniería", value: 300_000, color: "bg-blue-600" },
    { name: "Marketing", value: 85_000, color: "bg-emerald-500" },
    { name: "Operación", value: 65_000, color: "bg-amber-500" },
    { name: "Ventas", value: 55_000, color: "bg-purple-500" },
    { name: "RRHH", value: 40_000, color: "bg-sky-500" },
  ];
  const maxCat = Math.max(...categories.map((c) => c.value));

  const alerts = [
    {
      id: "a1",
      color: "bg-rose-500",
      title: "Sobrecosto proyectado: E-Commerce v2",
      body:
        "El proyecto supera el presupuesto en 15.6%. IA predice un costo final de $520K vs $450K presupuestados.",
    },
    {
      id: "a2",
      color: "bg-amber-500",
      title: "Gasto inusual: Software",
      body:
        "Se detectó un incremento del 40% en licencias de software para App Móvil respecto al mes anterior.",
    },
    {
      id: "a3",
      color: "bg-amber-500",
      title: "Horas extra acumuladas",
      body:
        "El equipo de desarrollo suma 240 horas extra en los últimos 14 días.",
    },
    {
      id: "a4",
      color: "bg-blue-600",
      title: "Renovación de licencia próxima",
      body:
        "La licencia de AWS Enterprise vence en 30 días. Considera renegociar tarifa.",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xl font-semibold text-zinc-900">Dashboard</div>
        <div className="mt-1 text-xs text-zinc-500">
          Vista general de todos los proyectos
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Stat
          title="Presupuesto Total"
          value={formatUSD(totalBudget)}
          deltaTone="muted"
          icon="budget"
        />
        <Stat
          title="Gasto Real"
          value={formatUSD(actualSpend)}
          delta="▲ +12% vs mes anterior"
          deltaTone="danger"
          icon="spend"
        />
        <Stat
          title="Costo Final Predicho (IA)"
          value={formatUSD(predictedFinal)}
          delta="▼ -$50,000 de costos proyectados"
          deltaTone="danger"
          icon="ai"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0">
          <CardHeader
            title="Budget Burn Rate"
            right={
              <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Real
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  Proyección
                </div>
              </div>
            }
          />
          <CardBody>
            <BurnRateChart />
          </CardBody>
        </Card>

        <Card className="p-0">
          <CardHeader title="Smart Alerts" />
          <CardBody className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className={`w-1.5 rounded-full ${a.color}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900">
                    {a.title}
                  </div>
                  <div className="mt-1 text-[11px] leading-4 text-zinc-500">
                    {a.body}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0">
          <CardHeader title="Proyectos Activos" />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-[11px] text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Proyecto</th>
                    <th className="px-5 py-3 text-left font-medium">Estado</th>
                    <th className="px-5 py-3 text-right font-medium">Presupuesto</th>
                    <th className="px-5 py-3 text-right font-medium">Gastado</th>
                    <th className="px-5 py-3 text-center font-medium">Salud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {projectRows.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-4 text-xs font-semibold text-zinc-900">
                        {p.name}
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={p.statusTone}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-zinc-600">
                        {formatUSD(p.budget)}
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-zinc-600">
                        {formatUSD(p.spent)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <HealthDot health={p.health} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card className="p-0">
          <CardHeader title="Gasto por Categoría" />
          <CardBody>
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-600">
                    <span>{c.name}</span>
                    <span>${Math.round(c.value / 1000)}k</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-zinc-100">
                    <div
                      className={`h-3 rounded-full ${c.color}`}
                      style={{ width: `${(c.value / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 text-[10px] text-zinc-400">
                $0k&nbsp;&nbsp;&nbsp;&nbsp;$50k&nbsp;&nbsp;&nbsp;&nbsp;$100k&nbsp;&nbsp;&nbsp;&nbsp;$150k&nbsp;&nbsp;&nbsp;&nbsp;$200k&nbsp;&nbsp;&nbsp;&nbsp;$250k&nbsp;&nbsp;&nbsp;&nbsp;$300k
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
