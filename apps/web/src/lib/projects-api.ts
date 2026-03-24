import { apiFetch } from "@/lib/api";

export type ApiProject = {
  id: number;
  owner: number;
  name: string;
  description: string;
  budget: string;
  start_date: string;
  end_date: string;
  status: string;
  total_expenses: string;
  total_roles_cost: string;
  total_spent: string;
  remaining_budget: string;
};

export type ApiProjectRole = {
  id: number;
  project: number;
  name: string;
  salary: string;
};

export type ApiExpense = {
  id: number;
  project: number;
  category: number;
  user: number;
  amount: string;
  description: string;
  date: string;
  receipt_url: string;
  status: string;
};

export type ApiCategory = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

export type ApiRecommendation = {
  id: string;
  title: string;
  body: string;
  priority: "Alta" | "Media" | "Baja";
  project?: string;
};

export type CreateProjectRequest = Omit<ApiProject, 'id' | 'owner' | 'total_expenses' | 'total_roles_cost' | 'total_spent' | 'remaining_budget'>;
export type CreateExpenseRequest = Omit<ApiExpense, 'id' | 'user' | 'receipt_url' | 'status'>;
export type CreateProjectRoleRequest = Omit<ApiProjectRole, 'id'>;

export async function listProjects() {
  return apiFetch<ApiProject[]>("/projects/");
}

export async function getProject(id: string | number) {
  return apiFetch<ApiProject>(`/projects/${id}/`);
}

export async function createProject(project: CreateProjectRequest) {
  return apiFetch<ApiProject>("/projects/", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function listCategories() {
  return apiFetch<ApiCategory[]>("/categories/");
}

export async function listAllExpenses() {
  return apiFetch<ApiExpense[]>("/expenses/");
}

export async function createExpense(expense: CreateExpenseRequest) {
  return apiFetch<ApiExpense>("/expenses/", {
    method: "POST",
    body: JSON.stringify({ ...expense, user: 1, receipt_url: "", status: "registrado" }),
  });
}

export async function createProjectRole(role: CreateProjectRoleRequest) {
  return apiFetch<ApiProjectRole>("/project-roles/", {
    method: "POST",
    body: JSON.stringify(role),
  });
}

export async function listProjectRoles(projectId: string | number) {
  const roles = await apiFetch<ApiProjectRole[]>("/project-roles/");
  return roles.filter((role) => String(role.project) === String(projectId));
}

export async function listProjectExpenses(projectId: string | number) {
  const expenses = await apiFetch<ApiExpense[]>("/expenses/");
  return expenses.filter((expense) => String(expense.project) === String(projectId));
}

// Helper function to calculate spending by category
export async function getSpendingByCategory() {
  try {
    const [expenses, categories] = await Promise.all([
      listAllExpenses(),
      listCategories()
    ]);

    const spendingByCategory = categories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category === category.id);
      const totalAmount = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        amount: totalAmount
      };
    });

    return spendingByCategory.filter(cat => cat.amount > 0);
  } catch (error) {
    console.error("Error calculating spending by category:", error);
    return [];
  }
}

export async function getGlobalRecommendations() {
  const data = await apiFetch<{ results: ApiRecommendation[] }>("/recommendations/", {
    next: { revalidate: 0 },
    cache: "no-store",
  });
  return data.results || [];
}

export async function getProjectRecommendations(projectId: string | number) {
  const data = await apiFetch<{ results: ApiRecommendation[] }>(`/projects/${projectId}/recommendations/`, {
    next: { revalidate: 0 },
    cache: "no-store",
  });
  return data.results || [];
}
