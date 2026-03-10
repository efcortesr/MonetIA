"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { createExpense, createProjectRole, listCategories, type ApiCategory } from "@/lib/projects-api";

interface ProjectDetailPageProps {
  projectId: string;
}

export function ExpenseForm({ projectId }: ProjectDetailPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Load categories when form is shown
  const loadCategories = async () => {
    if (categories.length === 0) {
      try {
        const cats = await listCategories();
        console.log("Categories loaded:", cats);
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    loadCategories();
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const expense = {
        project: Number(projectId),
        category: Number(formData.get("category")),
        amount: formData.get("amount") as string,
        description: formData.get("description") as string,
        date: formData.get("date") as string,
      };
      
      await createExpense(expense);
      
      // Reset form and refresh page
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={handleShowForm}
        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
      >
        + Registrar gasto
      </button>
    );
  }

  return (
    <Card className="p-0">
      <CardHeader title="Registrar nuevo gasto" />
      <CardBody className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Ej: Licencia de software"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="1000.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Categoría
              </label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">
                  {categories.length === 0 ? "Cargando categorías..." : "Seleccionar categoría"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registrando..." : "Registrar gasto"}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function RoleForm({ projectId }: ProjectDetailPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const role = {
        project: Number(projectId),
        name: formData.get("name") as string,
        salary: formData.get("salary") as string,
      };
      
      await createProjectRole(role);
      
      // Reset form and refresh page
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
      >
        + Agregar rol
      </button>
    );
  }

  return (
    <Card className="p-0">
      <CardHeader title="Agregar nuevo rol" />
      <CardBody className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nombre del rol
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Ej: Desarrollador Senior"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Salario mensual
              </label>
              <input
                type="number"
                name="salary"
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="2500.00"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Agregando..." : "Agregar rol"}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
