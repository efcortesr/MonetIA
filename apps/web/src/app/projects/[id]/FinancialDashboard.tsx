"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ExpenseForm } from "@/components/forms/project-forms";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  getProjectFinancialDashboard,
  type ApiCategory,
  type ApiExpense,
  type ApiFinancialDashboard,
} from "@/lib/projects-api";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#ca8a04"];

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  tone: "neutral" | "info" | "danger" | "success" | "warning";
  isBadge?: boolean;
};

export default function FinancialDashboard({
  projectId,
  categories,
}: Readonly<{
  projectId: string;
  categories: ApiCategory[];
}>) {
  const [data, setData] = useState<ApiFinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category: "",
  });
  const [editingExpense, setEditingExpense] = useState<ApiExpense | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProjectFinancialDashboard(projectId, filters);
      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, projectId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  if (!data && loading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center border-dashed border-zinc-200">
        <div className="animate-pulse text-zinc-400 font-medium">Cargando dashboard financiero...</div>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, charts, expenses } = data;

  return (
    <div className="space-y-6">
      <Card className="p-0 border-blue-100 shadow-sm">
        <CardHeader
          title="Registrar gastos"
          subtitle="Puedes seguir agregando gastos en cualquier momento; el dashboard se recalcula con cada nuevo registro."
        />
        <CardBody>
          <ExpenseForm
            projectId={projectId}
            categories={categories}
            mode="create"
            onSuccess={() => {
              fetchDashboard();
            }}
          />
        </CardBody>
      </Card>

      <Card className="p-0 border-zinc-200 shadow-sm bg-zinc-50/50">
        <CardBody className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label htmlFor="filter-start" className="text-[10px] font-bold text-zinc-500 uppercase">
                Desde
              </label>
              <input
                id="filter-start"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((current) => ({ ...current, start_date: e.target.value }))}
                className="block w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="filter-end" className="text-[10px] font-bold text-zinc-500 uppercase">
                Hasta
              </label>
              <input
                id="filter-end"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((current) => ({ ...current, end_date: e.target.value }))}
                className="block w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="filter-category" className="text-[10px] font-bold text-zinc-500 uppercase">
                Categoria
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))}
                className="block w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
              >
                <option value="">Todas las categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFilters({ start_date: "", end_date: "", category: "" })}
              className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Limpiar filtros
            </button>

            {loading && (
              <span className="ml-auto text-[10px] text-blue-500 font-bold animate-pulse">
                ACTUALIZANDO...
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Presupuesto Total"
          value={formatCurrency(summary.budget)}
          sub="Fijo del proyecto"
          tone="neutral"
        />
        <StatCard
          label="Gasto en Periodo"
          value={formatCurrency(summary.filtered_spent)}
          sub={`Total proyecto: ${formatCurrency(summary.total_spent)}`}
          tone={summary.total_execution_percentage > 90 ? "danger" : "info"}
        />
        <StatCard
          label="Saldo Restante"
          value={formatCurrency(summary.total_remaining)}
          sub={
            summary.total_over_budget > 0
              ? "Excedido"
              : `${Math.round(100 - summary.total_execution_percentage)}% disponible`
          }
          tone={summary.total_over_budget > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Nivel de Riesgo"
          value={summary.total_deviation_level}
          sub={`Desviacion: ${formatCurrency(summary.total_budget_deviation)}`}
          tone={
            summary.total_execution_percentage > 90
              ? "danger"
              : summary.total_execution_percentage >= 70
                ? "warning"
                : "success"
          }
          isBadge
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader title="Salud del Presupuesto" subtitle="Gastado vs restante" />
          <CardBody className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Gastado", value: summary.total_spent },
                    { name: "Restante", value: summary.total_remaining },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-1 border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader title="Distribucion por Categoria" subtitle="Gasto en el periodo seleccionado" />
          <CardBody className="h-64 pt-0">
            {charts.by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.by_category}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.by_category.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                Sin datos de categorias
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-1 border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader title="Ranking de Gastos" subtitle="Principales categorias del periodo" />
          <CardBody className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.by_category.slice(0, 5)} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: "10px" }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {charts.by_category.slice(0, 5).map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader title="Evolucion del Gasto" subtitle="Progreso diario de egresos en el periodo" />
        <CardBody className="h-72">
          {charts.by_date.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.by_date}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" style={{ fontSize: "10px" }} tickMargin={10} />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} style={{ fontSize: "10px" }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              No hay gastos en este periodo de tiempo
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader
          title="Listado de Gastos"
          subtitle={`${expenses.length} registros encontrados`}
          right={<div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">Filtros aplicados</div>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-t border-zinc-100">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase">Descripcion</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase text-right">Monto</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase text-center w-20">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {expenses.map((expense) => {
                const expenseCategory = categories.find((category) => category.id === expense.category);

                return (
                  <tr key={expense.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">{expense.date}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {expense.description || "Gasto sin descripcion"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-600">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: expenseCategory?.color || "#d4d4d8" }}
                        />
                        {expenseCategory?.name || `Categoria ${expense.category}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-zinc-900">
                      {formatCurrency(Number(expense.amount))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        aria-label="Editar gasto"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                    No se encontraron gastos con estos criterios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl">
            <ExpenseForm
              projectId={projectId}
              categories={categories}
              mode="edit"
              initialData={editingExpense}
              onSuccess={() => {
                setEditingExpense(null);
                fetchDashboard();
              }}
              onCancel={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, tone, isBadge = false }: Readonly<StatCardProps>) {
  const toneMap: Record<StatCardProps["tone"], string> = {
    neutral: "text-zinc-500",
    info: "text-blue-600",
    danger: "text-rose-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
  };

  return (
    <Card className="p-4 border-zinc-200 shadow-sm">
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        {isBadge ? <Badge tone={tone}>{value}</Badge> : value}
      </div>
      <div className={`mt-1 text-[11px] font-medium ${toneMap[tone]}`}>{sub}</div>
    </Card>
  );
}
