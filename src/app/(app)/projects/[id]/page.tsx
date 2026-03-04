import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { formatCurrency, mockProjects } from "@/lib/mock";

function formatUSD(value: number) {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  return `$${formatted}`;
}

function Kpi({
  title,
  value,
  delta,
  deltaTone,
  right,
}: {
  title: string;
  value: string;
  delta: string;
  deltaTone: "success" | "warning" | "danger" | "muted";
  right?: React.ReactNode;
}) {
  const cls =
    deltaTone === "success"
      ? "text-emerald-600"
      : deltaTone === "warning"
        ? "text-amber-600"
        : deltaTone === "danger"
          ? "text-rose-600"
          : "text-zinc-500";
  return (
    <Card className="p-0">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-zinc-500">{title}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              {value}
            </div>
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
        <div className={`mt-2 text-xs font-medium ${cls}`}>{delta}</div>
      </div>
    </Card>
  );
}

function Gauge({ value }: { value: number }) {
  const angle = Math.max(-90, Math.min(90, -90 + (value / 100) * 180));
  return (
    <div className="grid place-items-center">
      <div className="relative h-44 w-44">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />
        <div className="absolute inset-3 rounded-full bg-white" />
        <div
          className="absolute left-1/2 top-1/2 h-16 w-1 -translate-x-1/2 -translate-y-full origin-bottom rounded-full bg-zinc-900"
          style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
        />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900" />
      </div>
    </div>
  );
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];

  const remaining = Math.max(0, project.budget - project.spent);
  const consumed = (project.spent / project.budget) * 100;
  const timeline = 66;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <span className="px-2">/</span>
            <span className="text-zinc-700">Active</span>
            <span className="px-2">/</span>
            <span className="text-zinc-700">{project.name}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {project.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500">{project.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="success">On Track</Badge>
          <button className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
            Edit
          </button>
          <button className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium hover:bg-zinc-50">
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Kpi
          title="Total Budget"
          value={formatUSD(project.budget)}
          delta="+0%"
          deltaTone="success"
        />
        <Kpi
          title="Actual Spend"
          value={formatUSD(project.spent)}
          delta="+5% vs plan"
          deltaTone="warning"
        />
        <Kpi
          title="Projected Overrun"
          value={formatUSD(12_500)}
          delta="+8%"
          deltaTone="danger"
        />
        <Kpi
          title="Remaining"
          value={formatUSD(remaining)}
          delta={`${Math.max(0, 100 - Math.round(consumed))}% left`}
          deltaTone="muted"
          right={
            <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
              34%
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0">
            <CardHeader
              title="Project Progress vs. Budget"
              right={
                <Link
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View details
                </Link>
              }
            />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Timeline Elapsed (Week 8/12)</span>
                <span className="font-semibold text-zinc-900">{timeline}%</span>
              </div>
              <Progress value={timeline} />

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Budget Consumed</span>
                <span className="font-semibold text-rose-600">
                  {Math.round(consumed)}% (Under Pace)
                </span>
              </div>
              <Progress value={consumed} />

              <div className="text-xs text-zinc-500">
                Vertical marker indicates expected spend based on timeline.
              </div>
            </CardBody>
          </Card>

          <Card className="p-0">
            <CardHeader title="Budget by Category" />
            <CardBody className="space-y-4">
              {[
                { label: "Labor & Personnel", spent: 45_000, total: 60_000 },
                { label: "Software Licenses", spent: 28_000, total: 30_000 },
                { label: "Infrastructure", spent: 12_400, total: 40_000 },
              ].map((row) => {
                const pct = (row.spent / row.total) * 100;
                return (
                  <div key={row.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-zinc-800">
                        {row.label}
                      </div>
                      <div className="text-zinc-600">
                        {formatUSD(row.spent)} / {formatUSD(row.total)}
                      </div>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-0">
            <CardHeader
              title="Risk Score"
              subtitle="AI-Predicted overrun probability"
            />
            <CardBody>
              <Gauge value={85} />
              <div className="mt-3 text-center">
                <div className="text-3xl font-semibold text-rose-600">High</div>
                <div className="text-sm text-zinc-500">85% Likelihood</div>
              </div>
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                The software license category is trending 15% above average.
                Consider renegotiating vendor contracts.
              </div>
            </CardBody>
          </Card>

          <Card className="p-0">
            <CardHeader
              title="Project Leads"
              right={
                <Link href="#" className="text-sm font-semibold text-blue-600">
                  See All
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {[
                { name: "Sarah Jenkins", role: "PM" },
                { name: "Mike Ross", role: "Finance" },
                { name: "Daniela Coe", role: "Engineering" },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-100" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {u.name}
                      </div>
                      <div className="text-xs text-zinc-500">{u.role}</div>
                    </div>
                  </div>
                  <button className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50" aria-label="Message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
