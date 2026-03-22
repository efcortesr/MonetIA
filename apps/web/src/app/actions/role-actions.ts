
"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiProjectRole } from "@/lib/projects-api";

export async function createRoleAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;

  const role = {
    project: Number(projectId),
    name: formData.get("name") as string,
    salary: formData.get("salary") as string,
  };

  const result = await apiFetch<ApiProjectRole>("/project-roles/", {
    method: "POST",
    body: JSON.stringify(role),
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return result;
}

export async function deleteRoleAction(roleId: number, projectId: string) {
  await apiFetch(`/project-roles/${roleId}/`, {
    method: "DELETE",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}