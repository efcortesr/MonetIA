"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import type { ApiCategory, ApiExpense, ApiProjectRole } from "@/lib/projects-api";
import { createExpenseAction, deleteExpenseAction, updateExpenseAction } from "@/app/actions/expense-actions";
import { createRoleAction, deleteRoleAction } from "@/app/actions/role-actions";

// ─── Expense Form ────────────────────────────────────────────────────────────

interface ExpenseFormProps {
  projectId: string;
  categories: ApiCategory[];
  initialData?: ApiExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ 
  projectId, 
  categories, 
  initialData, 
  onSuccess, 
  onCancel 
}: Readonly<ExpenseFormProps>) {
  const [showForm, setShowForm] = useState(!!initialData);
  const [isPending, startTransition] = useTransition();

  const isEdit = !!initialData;

  const handleSubmit = async (formData: FormData) => {
    formData.append("projectId", projectId);
    startTransition(async () => {
      if (isEdit) {
        await updateExpenseAction(initialData.id, formData);
      } else {
        await createExpenseAction(formData);
      }
      
      if (isEdit) {
        // En modo edición mantenemos el formulario abierto si es necesario, 
        // pero aquí la lógica original cerraba el de creación.
      } else {
        setShowForm(false);
      }
      onSuccess?.();
    });
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
      >
        + Registrar gasto
      </button>
    );
  }

  return (
    <Card className={`p-0 border-blue-100 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${isEdit ? '' : 'mt-4'}`}>
      <CardHeader title={isEdit ? "Editar gasto" : "Registrar nuevo gasto"} />
      <CardBody>
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
                defaultValue={initialData?.description}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: Licencia de software"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Monto (COP)
              </label>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                min="0"
                defaultValue={initialData ? Number(initialData.amount) : ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="100.000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Categoría
              </label>
              <select
                name="category"
                required
                defaultValue={initialData?.category}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Seleccionar categoría</option>
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
                defaultValue={initialData?.date}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (isEdit) {
                   onCancel?.();
                } else {
                   setShowForm(false);
                   onCancel?.();
                }
              }}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending 
                ? (isEdit ? "Guardando..." : "Registrando…") 
                : (isEdit ? "Guardar cambios" : "Registrar gasto")}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

// ─── Expense List Item (with delete) ─────────────────────────────────────────

interface ExpenseItemProps {
  expense: ApiExpense;
  projectId: string;
}

export function ExpenseItem({ expense, projectId }: ExpenseItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("¿Eliminar este gasto?")) return;
    startTransition(async () => {
      await deleteExpenseAction(expense.id, projectId);
    });
  };

  const formattedAmount = Number(expense.amount).toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  });

  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 last:pb-0 transition-opacity ${
        isPending ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="font-medium text-zinc-800 truncate">
          {expense.description || "Gasto sin descripción"}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">{expense.date}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-semibold text-zinc-800">COP {formattedAmount}</span>
        <button
          onClick={handleDelete}
          className="text-zinc-400 hover:text-rose-600 transition-colors"
          title="Eliminar gasto"
          aria-label="Eliminar gasto"
        >
          {isPending ? (
            <span className="text-xs">…</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Role Form ────────────────────────────────────────────────────────────────

interface RoleFormProps {
  projectId: string;
}

export function RoleForm({ projectId }: RoleFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    formData.append("projectId", projectId);
    startTransition(async () => {
      await createRoleAction(formData);
      setShowForm(false);
    });
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
      >
        + Agregar rol
      </button>
    );
  }

  return (
    <div className="w-full flex justify-start animate-in fade-in slide-in-from-top-2 duration-300">
      <Card className="mt-4 w-full max-w-md mr-auto border-blue-100 shadow-lg">
        <CardHeader title="Agregar nuevo rol" />

        <CardBody>
          <div className="w-full overflow-x-hidden">
            <form action={handleSubmit} className="space-y-4 w-full">
              {/* Inputs en vertical */}
              <div className="flex flex-col gap-4 w-full">
                {/* Nombre */}
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Nombre del rol
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ej: Desarrollador Senior"
                  />
                </div>

                {/* Salario */}
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Salario mensual (COP)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    required
                    step="0.01"
                    min="0"
                    className="w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="2.500.000"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Agregando…" : "Agregar rol"}
                </button>
              </div>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Role List Item (with delete) ─────────────────────────────────────────────

interface RoleItemProps {
  role: ApiProjectRole;
  projectId: string;
}

export function RoleItem({ role, projectId }: RoleItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    startTransition(async () => {
      await deleteRoleAction(role.id, projectId);
    });
  };

  const formattedSalary = Number(role.salary).toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  });

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-zinc-100 p-3 transition-opacity ${
        isPending ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-zinc-900">{role.name}</div>
        <div className="text-xs text-zinc-500">Salario mensual</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zinc-800">COP {formattedSalary}</span>
        <button
          onClick={handleDelete}
          className="text-zinc-400 hover:text-rose-600 transition-colors"
          title="Eliminar rol"
          aria-label="Eliminar rol"
        >
          {isPending ? (
            <span className="text-xs">…</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
