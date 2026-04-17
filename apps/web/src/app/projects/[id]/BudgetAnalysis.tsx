"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getProjectBudgetAnalysis, type ApiBudgetAnalysis } from "@/lib/projects-api";

const COLORS = ["#2563eb", "#e2e8f0"]; // Blue for Spent, Slate for Remaining
const OVER_COLORS = ["#2563eb", "#f43f5e"]; // Blue for Budget, Rose for Exceeded

export default function BudgetAnalysis({ projectId }: Readonly<{ projectId: string | number }>) {
  const [data, setData] = useState<ApiBudgetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProjectBudgetAnalysis(projectId)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-3 border-zinc-200 shadow-sm">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin text-xl text-zinc-400">⌛</div>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const isOverBudget = data.budget_deviation > 0;
  
  // Data for chart
  const chartData = isOverBudget 
    ? [
        { name: "Presupuesto", value: data.budget },
        { name: "Excedido", value: data.over_budget }
      ]
    : [
        { name: "Gastado", value: data.spent },
        { name: "Restante", value: data.remaining }
      ];

  const colorsToUse = isOverBudget ? OVER_COLORS : COLORS;

  const deviationColor = {
    "Leve": "success",
    "Moderada": "warning",
    "Crítica": "danger"
  }[data.deviation_level] as "success" | "warning" | "danger";

  const formatCurrency = (val: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(Math.abs(val));
    
    if (showSign) {
      return val >= 0 ? `+ ${formatted}` : `- ${formatted}`;
    }
    return formatted;
  };

  return (
    <Card className="lg:col-span-3 overflow-hidden border-zinc-200 shadow-sm mb-6">
      <CardHeader 
        title="Análisis de presupuesto" 
        subtitle="Indicadores financieros de ejecución y desviación presupuestaria" 
      />
      <CardBody className="grid lg:grid-cols-2 gap-8 items-center pt-2">
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={colorsToUse[chartData.indexOf(entry) % colorsToUse.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-9">
             <span className="text-xl font-bold text-zinc-900">{data.execution_percentage.toFixed(1)}%</span>
             <span className="text-[10px] text-zinc-500 font-medium uppercase">Ejecución</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Presupuesto Total</div>
              <div className="text-lg font-bold text-zinc-900 mt-1">{formatCurrency(data.budget)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Gasto Ejecutado</div>
              <div className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(data.spent)}</div>
              <div className="text-[9px] text-blue-500 font-medium mt-1">Gasto Real + Roles</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                Desviación Presupuestaria
              </div>
              <div className={`text-xl font-bold mt-0.5 ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(data.budget_deviation, true)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5 text-center">Nivel</div>
              <Badge tone={deviationColor}>{data.deviation_level}</Badge>
            </div>
          </div>

          <div className="relative pt-1 px-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-lg border shadow-sm
                  ${isOverBudget 
                    ? 'text-rose-600 bg-rose-50 border-rose-100' 
                    : 'text-blue-600 bg-blue-50 border-blue-100'}`}
                >
                  Porcentaje de ejecución
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-700">
                  {data.execution_percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-zinc-100 border border-zinc-200">
              <div 
                style={{ width: `${Math.min(100, data.execution_percentage)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 
                  ${isOverBudget ? 'bg-rose-500' : 'bg-blue-600'}`}
              ></div>
            </div>
            {isOverBudget ? (
                <p className="text-[10px] text-rose-500 font-medium italic mt-1">
                  ⚠ El proyecto ha excedido el presupuesto original en un { (data.execution_percentage - 100).toFixed(1) }%.
                </p>
            ) : (
                <p className="text-[10px] text-emerald-600 font-medium italic mt-1">
                  ✓ Tienes un saldo disponible de { formatCurrency(data.remaining) }.
                </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
