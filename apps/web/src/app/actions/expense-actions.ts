"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiExpense } from "@/lib/projects-api";

/**
 * Extracts a human-readable validation message from a DRF error string.
 * Avoids regex to prevent ReDoS (S5852): uses indexOf to locate the JSON
 * boundary and JSON.parse to extract the field-level message.
 */
function extractDateError(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return raw;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const dateMsg = parsed["date"];
    if (Array.isArray(dateMsg)) return String(dateMsg[0]);
    if (dateMsg != null) return String(dateMsg);
  } catch {
    // not valid JSON — return raw message
  }
  return raw;
}

function buildExpensePayload(formData: FormData) {
  return {
    project: Number(formData.get("projectId")),
    category: Number(formData.get("category")),
    amount: formData.get("amount") as string,
    description: formData.get("description") as string,
    date: formData.get("date") as string,
    user: 1,
    receipt_url: "",
    status: "registrado",
  };
}

function revalidateProjectPaths(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function createExpenseAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  try {
    const result = await apiFetch<ApiExpense>("/expenses/", {
      method: "POST",
      body: JSON.stringify(buildExpensePayload(formData)),
    });
    revalidateProjectPaths(projectId);
    return { data: result, error: null };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Error desconocido";
    return { data: null, error: extractDateError(raw) };
  }
}

export async function updateExpenseAction(expenseId: number, formData: FormData) {
  const projectId = formData.get("projectId") as string;
  try {
    const result = await apiFetch<ApiExpense>(`/expenses/${expenseId}/`, {
      method: "PUT",
      body: JSON.stringify(buildExpensePayload(formData)),
    });
    revalidateProjectPaths(projectId);
    return { data: result, error: null };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Error desconocido";
    return { data: null, error: extractDateError(raw) };
  }
}

export async function deleteExpenseAction(expenseId: number, projectId: string) {
  await apiFetch(`/expenses/${expenseId}/`, {
    method: "DELETE",
  });
  revalidateProjectPaths(projectId);
}