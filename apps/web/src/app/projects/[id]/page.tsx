import Link from "next/link";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import {
  ExpenseForm,
  ExpenseItem,
  RoleForm,
  RoleItem,
} from "@/components/forms/project-forms";
import {
  getProject,
  listProjectExpenses,
  listProjectRoles,
  listCategories,
} from "@/lib/projects-api";
import ProjectRecommendations from "./ProjectRecommendations";

function formatUSD(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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

  const [project, expenses, roles, categories] = await Promise.all([
    getProject(id).catch(() => null),
    listProjectExpenses(id).catch(() => []),
    listProjectRoles(id).catch(() => []),
    listCategories().catch(() => []),
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

  // Rough timeline % based on start/end dates
  const now = Date.now();
  const start = new Date(project.start_date).getTime();
  const end = new Date(project.end_date).getTime();
  const timelinePct =
    end > start
      ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
      : 0;

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

      {/* ── Over-budget banner ── */}
      {isOverBudget && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <span className="text-rose-600 font-bold text-lg">!</span>
          <div className="text-sm text-rose-700">
            <span className="font-semibold">Presupuesto excedido</span> — el gasto
            total ({formatUSD(totalSpent)}) supera el presupuesto en{" "}
            <span className="font-semibold">{formatUSD(Math.abs(remaining))}</span>.
          </div>
        </div>
      )}

      {/* ── KPI cards (all from API, zero manual calculation) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Presupuesto"
          value={formatUSD(budget)}
          sub={`${project.start_date} → ${project.end_date}`}
          tone="neutral"
        />
        <Kpi
          title="Total gastado"
          value={formatUSD(totalSpent)}
          sub={`Gastos ${formatUSD(totalExpenses)} + Roles ${formatUSD(totalRolesCost)}`}
          tone={consumedPct > 90 ? "danger" : consumedPct > 70 ? "warning" : "neutral"}
        />
        <Kpi
          title="Presupuesto restante"
          value={formatUSD(remaining)}
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

      {/* ── Recommendations Preview ── */}
      <ProjectRecommendations projectId={id} />

      {/* ── Progress bars ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <CardHeader title="Progreso del proyecto" />
          <CardBody className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-600">Tiempo transcurrido</span>
                <span className="font-semibold text-zinc-900">
                  {Math.round(timelinePct)}%
                </span>
              </div>
              <Progress value={timelinePct} />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-600">Presupuesto consumido</span>
                <span
                  className={`font-semibold ${
                    consumedPct > 100
                      ? "text-rose-600"
                      : consumedPct > 80
                        ? "text-amber-600"
                        : "text-zinc-900"
                  }`}
                >
                  {Math.round(consumedPct)}%
                </span>
              </div>
              <Progress value={consumedPct} />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="text-xs text-zinc-500 mb-1">
                  Gastos directos
                </div>
                <div className="text-sm font-semibold text-zinc-900">
                  {formatUSD(totalExpenses)}
                </div>
                <div className="text-xs text-zinc-400">
                  {expenses.length} registros
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <div className="text-xs text-zinc-500 mb-1">Costo de roles</div>
                <div className="text-sm font-semibold text-zinc-900">
                  {formatUSD(totalRolesCost)}
                </div>
                <div className="text-xs text-zinc-400">
                  {roles.length} roles
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Los totales son calculados automáticamente por el servidor cada
              vez que se agrega o elimina un gasto o rol.
            </p>
          </CardBody>
        </Card>

        {/* ── Roles panel ── */}
        <Card className="p-0">
          <CardHeader
            title="Roles del proyecto"
            subtitle={`Costo total: ${formatUSD(totalRolesCost)}`}
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

      {/* ── Expenses panel ── */}
      <Card className="p-0">
        <CardHeader
          title="Gastos registrados"
          subtitle={`Total: ${formatUSD(totalExpenses)} — ${expenses.length} registros`}
          right={<ExpenseForm projectId={id} categories={categories} />}
        />
        <CardBody className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-sm text-zinc-500">
              No hay gastos registrados. Agrega el primero con el botón de arriba.
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} projectId={id} />
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}