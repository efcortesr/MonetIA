import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

function ProjectionChart() {
  const w = 980;
  const h = 260;
  const padX = 56;
  const padY = 20;

  const labels = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const base = [100, 115, 135, 155, 175, 190];
  const opt = [190, 205, 215, 225];
  const exp = [190, 215, 235, 255];
  const pes = [190, 225, 250, 275];

  const min = 80;
  const max = 300;
  const range = max - min;

  const xStep = (w - padX - 24) / (labels.length - 1);
  const toX = (i: number) => padX + i * xStep;
  const toY = (v: number) => (1 - (v - min) / range) * (h - padY * 2) + padY;

  const baseD = base
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`)
    .join(" ");

  const todayIndex = 5;
  const scenarioStart = todayIndex;

  const scenarioPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const idx = scenarioStart + i;
        const startVal = base[base.length - 1];
        const y = i === 0 ? toY(startVal) : toY(v);
        return `${i === 0 ? "M" : "L"} ${toX(idx)} ${y}`;
      })
      .join(" ");

  const yTicks = [100, 150, 200, 250, 300];

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

export default function PredictionsPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">◍</span>
          AI Insights
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Predicciones y análisis de riesgo, basados en inteligencia artificial
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
            <span className="text-sm font-bold">!</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone="danger">Crítica</Badge>
              <div className="text-xs font-semibold text-rose-700">
                Detectada hace 2 horas
              </div>
            </div>
            <div className="mt-2 text-xs font-semibold text-zinc-900">
              Plataforma E-Commerce v2 — Sobrecosto inminente
            </div>
            <div className="mt-1 text-[11px] leading-4 text-zinc-600">
              Con base en el ritmo de gasto actual y las tendencias de los últimos 3 meses, la IA predice un costo final de
              <span className="font-semibold"> USD 520,000</span> vs <span className="font-semibold">USD 450,000</span> presupuestados — un exceso del 15.6%.
              Los principales drivers son costos de labor (+28%) e infraestructura (+15%).
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">Confianza del modelo: 87%</div>
          </div>
        </div>
      </div>

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
          <ProjectionChart />
        </CardBody>
      </Card>

      <div>
        <div className="text-sm font-semibold text-zinc-900">Risk Factors Breakdown</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader
            title="Proveedores"
            right={<Badge tone="warning">Alerta</Badge>}
          />
          <CardBody>
            <div className="text-[11px] leading-4 text-zinc-700">
              2 proveedores con incrementos de precios detectados. Riesgo de +$18K.
            </div>
            <button className="mt-3 text-xs font-semibold text-amber-700 hover:underline">
              Renegociar contrato →
            </button>
          </CardBody>
        </Card>

        <Card className="border-rose-200 bg-rose-50">
          <CardHeader title="Labor" right={<Badge tone="danger">Crítica</Badge>} />
          <CardBody>
            <div className="text-[11px] leading-4 text-zinc-700">
              Horas extra acumuladas 40% sobre lo planificado. Burnout potencial.
            </div>
            <button className="mt-3 text-xs font-semibold text-rose-700 hover:underline">
              Redistribuir carga →
            </button>
          </CardBody>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader title="Timeline" right={<Badge tone="info">Normal</Badge>} />
          <CardBody>
            <div className="text-[11px] leading-4 text-zinc-700">
              Milestone 3 completado en tiempo. Próximo hito en 3 semanas.
            </div>
            <button className="mt-3 text-xs font-semibold text-blue-700 hover:underline">
              Monitorear →
            </button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
