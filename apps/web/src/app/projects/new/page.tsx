"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { createProject } from "@/lib/projects-api";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetDisplay, setBudgetDisplay] = useState("");
  const [budgetRaw, setBudgetRaw] = useState(0);

  const formatNumber = (val: string) => {
    // Remove non-numeric characters except for formatting
    const numericValue = val.replaceAll(/\D/g, "");
    if (!numericValue) return "";
    return Number(numericValue).toLocaleString("es-CO");
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numeric = value.replaceAll(/\D/g, "");
    setBudgetRaw(Number(numeric));
    setBudgetDisplay(formatNumber(numeric));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const project = {
        name: formData.get("name") as string,
        description: formData.get("description") as string || "",
        budget: budgetRaw.toString(),
        start_date: formData.get("start_date") as string,
        end_date: formData.get("end_date") as string,
        status: "planning",
      };
      
      const result = await createProject(project);
      router.push(`/projects/${result.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
          <span className="text-blue-600">+</span>
          <span>Nuevo Proyecto</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Crea un nuevo proyecto para comenzar a registrar gastos y presupuestos.
        </div>
      </div>

      <Card className="p-0">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
                  Nombre del proyecto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Plataforma E-Commerce v2"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-zinc-700 mb-1">
                  Presupuesto (COP) *
                </label>
                <input
                  type="text"
                  id="budget"
                  value={budgetDisplay}
                  onChange={handleBudgetChange}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.000.000"
                />
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-zinc-700 mb-1">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-zinc-700 mb-1">
                  Fecha de fin *
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe el objetivo y alcance del proyecto..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            <Link
              href="/projects"
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Cancelar
            </Link>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creando..." : "Crear Proyecto"}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
