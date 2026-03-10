import Link from "next/link";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { ExpenseForm, RoleForm } from "@/components/project-forms";
import { getProject, listProjectExpenses, listProjectRoles } from "@/lib/projects-api";

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

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id).catch(() => null);
  const [expenses, roles] = await Promise.all([
    listProjectExpenses(id).catch(() => []),
    listProjectRoles(id).catch(() => []),
  ]);

  if (!project) {
    return (
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600">▣</span>
            Proyecto no encontrado
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            El proyecto que buscas no existe o fue eliminado.
          </div>
        </div>
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          ← Volver a proyectos
        </Link>
      </div>
    );
  }

  const budget = Number(project.budget);
  const spent = Number(project.total_spent);
  const consumed = budget > 0 ? (spent / budget) * 100 : 0;
  const timeline = 75; // TODO: Calculate from dates

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
            <span className="text-blue-600">▣</span>
            {project.name}
          </div>
          <div className="mt-1 text-xs text-zinc-500">{project.description}</div>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          ← Volver
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Kpi title="Presupuesto" value={formatUSD(budget)} delta="0%" deltaTone="muted" />
        <Kpi title="Gastado" value={formatUSD(spent)} delta={`${Math.round(consumed)}%`} deltaTone="muted" />
        <Kpi title="Restante" value={formatUSD(budget - spent)} delta="0%" deltaTone="muted" />
        <Kpi
          title="Progreso"
          value={`${Math.round(consumed)}%`}
          delta="0%"
          deltaTone="muted"
          right={
            <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
              {Math.max(0, 100 - Math.round(consumed))}%
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-0">
            <CardHeader title="Project Progress vs. Budget" />
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Timeline Elapsed (estimado)</span>
                <span className="font-semibold text-zinc-900">{timeline}%</span>
              </div>
              <Progress value={timeline} />

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Budget Consumed</span>
                <span className="font-semibold text-rose-600">{Math.round(consumed)}%</span>
              </div>
              <Progress value={consumed} />

              <div className="text-xs text-zinc-500">
                Métricas calculadas desde gastos y salarios registrados.
              </div>
            </CardBody>
          </Card>

          <Card className="p-0">
            <CardHeader 
              title="Gastos registrados" 
              right={<ExpenseForm projectId={id} />}
            />
            <CardBody className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-sm text-zinc-500">
                  No hay gastos registrados para este proyecto.
                </div>
              ) : (
                expenses.slice(0, 6).map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium text-zinc-800">
                        {expense.description || "Gasto sin descripción"}
                      </div>
                    </div>
                    <div className="font-semibold text-zinc-800">{formatUSD(Number(expense.amount))}</div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-0">
            <CardHeader 
              title="Cargos del proyecto" 
              subtitle="Roles y salario"
              right={<RoleForm projectId={id} />}
            />
            <CardBody className="space-y-3">
              {roles.length === 0 ? (
                <div className="text-sm text-zinc-500">Aún no hay cargos creados.</div>
              ) : (
                roles.map((role: any) => (
                  <div key={role.id} className="flex items-center justify-between rounded-xl border border-zinc-100 p-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{role.name}</div>
                      <div className="text-xs text-zinc-500">Salario mensual</div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-800">{formatUSD(Number(role.salary))}</div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
