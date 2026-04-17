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

export type ApiBudgetAnalysis = {
  budget: number;
  spent: number;
  remaining: number;
  over_budget: number;
  deviation_level: "Leve" | "Moderada" | "Crítica";
  consumed_pct: number;
  execution_percentage: number;
  budget_deviation: number;
};

export type ApiFinancialDashboard = {
  summary: {
    budget: number;
    total_spent: number;
    total_remaining: number;
    total_over_budget: number;
    total_execution_percentage: number;
    total_budget_deviation: number;
    total_deviation_level: "Leve" | "Moderada" | "Crítica";
    filtered_spent: number;
  };
  charts: {
    by_category: { id: number; name: string; color: string; value: number }[];
    by_date: { date: string; value: number }[];
  };
  expenses: ApiExpense[];
};

export type CreateProjectRequest = Omit<ApiProject, 'id' | 'owner' | 'total_expenses' | 'total_roles_cost' | 'total_spent' | 'remaining_budget'>;

export async function generateProjectRecommendations(projectId: string | number) {
  const data = await apiFetch<{ results: ApiRecommendation[] }>(`/projects/${projectId}/generate-recommendations/`, {
    method: "POST",
    cache: "no-store",
  });
  return data.results || [];
}

export async function getProjectBudgetAnalysis(projectId: string | number) {
  return apiFetch<ApiBudgetAnalysis>(`/projects/${projectId}/budget-analysis/`, {
    cache: "no-store",
  });
}

export async function getProjectFinancialDashboard(
  projectId: string | number,
  filters?: { start_date?: string; end_date?: string; category?: string }
) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);
  if (filters?.category) params.append("category", filters.category);
  
  const query = params.toString();
  const url = `/projects/${projectId}/financial-dashboard/${query ? `?${query}` : ""}`;
  
  return apiFetch<ApiFinancialDashboard>(url, {
    cache: "no-store",
  });
}
