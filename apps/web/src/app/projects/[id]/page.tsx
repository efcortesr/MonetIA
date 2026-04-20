import Link from "next/link";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import {
  RoleForm,
  RoleItem,
} from "@/components/forms/project-forms";
import {
  getProject,
  getProjectAlerts,
  listProjectRoles,
  listCategories,
} from "@/lib/projects-api";
import ProjectRecommendations from "./ProjectRecommendations";
import FinancialDashboard from "./FinancialDashboard";

function formatCOP(value: number) {
  return `COP ${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

function Kpi({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "neutral" | "warning" | "danger" | "success";
}) {
  const subCls =
    tone === "danger"
      ? "text-rose-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "success"
          ? "text-emerald-600"
          : "text-zinc-500";

  return (
    <Card className="p-0">
      <div className="p-4">
        <div className="text-xs font-medium text-zinc-500">{title}</div>
        <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
          {value}
        </div>
        <div className={`mt-1 text-xs font-medium ${subCls}`}>{sub}</div>
      </div>
    </Card>
  );
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, roles, categories, alerts] = await Promise.all([
    getProject(id).catch(() => null),
    listProjectRoles(id).catch(() => []),
    listCategories().catch(() => []),
    getProjectAlerts(id).catch(() => []),
  ]);

  if (!project) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">▣</span>
          Proyecto no encontrado
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          ← Volver a proyectos
        </Link>
      </div>
    );
  }

  // ── Totals come directly from the API (calculated by Django, not the UI) ──
  const budget = Number(project.budget);
  const totalExpenses = Number(project.total_expenses);
  const totalRolesCost = Number(project.total_roles_cost);
  const totalSpent = Number(project.total_spent);        // expenses + roles
  const remaining = Number(project.remaining_budget);

  const consumedPct = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const isOverBudget = remaining < 0;

  const budgetAlert = alerts.find((alert) => alert.type === "budget_threshold");
  const alertTone = budgetAlert?.severity === "Crítica" ? "rose" : "amber";
  // Time calculation 
  const timelinePct = (() => {
    const startObj = new Date(project.start_date).getTime();
    const endObj = new Date(project.end_date).getTime();
    if (endObj <= startObj) return 0;
    const nowTs = new Date().getTime();
    return Math.min(100, Math.max(0, ((nowTs - startObj) / (endObj - startObj)) * 100));
  })();

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600">▣</span>
            {project.name}
          </div>
          {project.description && (
            <div className="mt-1 text-xs text-zinc-500">{project.description}</div>
          )}
        </div>
        <Link
          href="/projects"
          className="shrink-0 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          ← Volver
        </Link>
      </div>

      {/* ── Budget threshold alert ── */}
      {budgetAlert && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            alertTone === "rose"
              ? "border-rose-200 bg-rose-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <span
            className={`font-bold text-lg ${
              alertTone === "rose" ? "text-rose-600" : "text-amber-600"
            }`}
          >
            !
          </span>
          <div
            className={`text-sm ${
              alertTone === "rose" ? "text-rose-700" : "text-amber-700"
            }`}
          >
            <span className="font-semibold">Alerta de presupuesto</span> — {budgetAlert.message}
          </div>
        </div>
      )}

      {/* ── Over-budget banner ── */}
      {isOverBudget && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <span className="text-rose-600 font-bold text-lg">!</span>
          <div className="text-sm text-rose-700">
            <span className="font-semibold">Presupuesto excedido</span> — el gasto
            total ({formatCOP(totalSpent)}) supera el presupuesto en{" "}
            <span className="font-semibold">{formatCOP(Math.abs(remaining))}</span>.
          </div>
        </div>
      )}

      {/* ── KPI cards (all from API, zero manual calculation) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Presupuesto"
          value={formatCOP(budget)}
          sub={`${project.start_date} → ${project.end_date}`}
          tone="neutral"
        />
        <Kpi
          title="Total gastado"
          value={formatCOP(totalSpent)}
          sub={`Gastos ${formatCOP(totalExpenses)} + Roles ${formatCOP(totalRolesCost)}`}
          tone={consumedPct > 90 ? "danger" : consumedPct > 70 ? "warning" : "neutral"}
        />
        <Kpi
          title="Presupuesto restante"
          value={formatCOP(remaining)}
          sub={isOverBudget ? "⚠ Sobrepasado" : `${Math.round(100 - consumedPct)}% disponible`}
          tone={isOverBudget ? "danger" : remaining < budget * 0.15 ? "warning" : "success"}
        />
        <Kpi
          title="Consumo"
          value={`${Math.round(consumedPct)}%`}
          sub={`${Math.round(timelinePct)}% del tiempo transcurrido`}
          tone={consumedPct > timelinePct + 15 ? "danger" : "neutral"}
        />
      </div>

      {/* ── Financial Dashboard (KPIs, Charts, Filters, Table) ── */}
      <section id="financial-dashboard" className="space-y-6">
        <FinancialDashboard projectId={id} categories={categories} />
      </section>

      {/* ── Recommendations IA ── */}
      <ProjectRecommendations projectId={id} />

      {/* ── Personnel Costs / Roles (Kept separate for role management) ── */}
      <Card className="p-0">
        <CardHeader
          title="Personal y Roles"
          subtitle={`Inversión total en talento: ${formatCOP(totalRolesCost)}`}
          right={<RoleForm projectId={id} />}
        />
        <CardBody className="space-y-3">
          {roles.length === 0 ? (
            <div className="text-sm text-zinc-500">
              Aún no hay roles. Agrega uno para incluirlo en el cálculo.
            </div>
          ) : (
            roles.map((role) => (
              <RoleItem key={role.id} role={role} projectId={id} />
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}