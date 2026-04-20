"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiExpense } from "@/lib/projects-api";

export async function createExpenseAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;

  const expense = {
    project: Number(projectId),
    category: Number(formData.get("category")),
    amount: formData.get("amount") as string,
    description: formData.get("description") as string,
    date: formData.get("date") as string,
    user: 1,
    receipt_url: "",
    status: "registrado",
  };

  const result = await apiFetch<ApiExpense>("/expenses/", {
    method: "POST",
    body: JSON.stringify(expense),
  });

  // Revalidate the project page so totals update immediately
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return result;
}

export async function updateExpenseAction(expenseId: number, formData: FormData) {
  const projectId = formData.get("projectId") as string;

  const expense = {
    project: Number(projectId),
    category: Number(formData.get("category")),
    amount: formData.get("amount") as string,
    description: formData.get("description") as string,
    date: formData.get("date") as string,
    user: 1,
    receipt_url: "",
    status: "registrado",
  };

  const result = await apiFetch<ApiExpense>(`/expenses/${expenseId}/`, {
    method: "PUT",
    body: JSON.stringify(expense),
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return result;
}

export async function deleteExpenseAction(expenseId: number, projectId: string) {
  await apiFetch(`/expenses/${expenseId}/`, {
    method: "DELETE",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}