export type ProjectStatus = "In Progress" | "Review" | "On Track" | "At Risk";

export type Health = "good" | "warning" | "bad";

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  health: Health;
  owner: string;
  quarter: string;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
};

export type Recommendation = {
  id: string;
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  cta: string;
};

export const mockProjects: Project[] = [
  {
    id: "alpha",
    name: "Project Alpha: Redesign",
    subtitle: "Q3 Financial Analysis & Budget Prediction",
    status: "On Track",
    budget: 150_000,
    spent: 85_400,
    health: "good",
    owner: "Alex Morgan",
    quarter: "This Quarter",
  },
  {
    id: "website-2",
    name: "Website Redesign 2.0",
    subtitle: "UX refresh + performance improvements",
    status: "In Progress",
    budget: 50_000,
    spent: 20_000,
    health: "good",
    owner: "Sarah Jenkins",
    quarter: "This Quarter",
  },
  {
    id: "mobile-dev",
    name: "Mobile App Dev",
    subtitle: "MVP delivery + analytics instrumentation",
    status: "In Progress",
    budget: 120_000,
    spent: 110_000,
    health: "bad",
    owner: "Mike Ross",
    quarter: "This Quarter",
  },
  {
    id: "cloud-migration",
    name: "Cloud Migration",
    subtitle: "Move workloads to AWS",
    status: "Review",
    budget: 80_000,
    spent: 45_000,
    health: "warning",
    owner: "Daniela Coe",
    quarter: "This Quarter",
  },
];

export const mockAlerts: Alert[] = [
  {
    id: "over-budget",
    title: "Over Budget Risk",
    description:
      "Mobile App Dev is projected to exceed budget by 15% if burn rate continues.",
    severity: "critical",
  },
  {
    id: "unusual-spend",
    title: "Unusual Spend Detected",
    description:
      "Marketing category +25% deviation from monthly average. Review invoices.",
    severity: "warning",
  },
  {
    id: "contract-renewal",
    title: "Contract Renewal",
    description: "AWS Enterprise License expires in 14 days.",
    severity: "info",
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "reallocate",
    priority: "High",
    title: "Reallocate 5% from buffer",
    description:
      "Based on 14 similar past projects, your contingency utilization is low. Move funds to active development.",
    cta: "Approve Reallocation",
  },
  {
    id: "review-contract",
    priority: "High",
    title: "Review TechCorp Contract",
    description:
      "Detected a 12% price variance vs market average for this service tier. Renegotiating could save ~$500/mo.",
    cta: "View Contract Details",
  },
  {
    id: "saas-seats",
    priority: "Medium",
    title: "Unused SaaS Seats",
    description:
      "15 seats for 'DesignTool Pro' haven't been active in 30 days. Downgrading could optimize monthly spend.",
    cta: "Adjust Seats",
  },
  {
    id: "timeline-risk",
    priority: "Medium",
    title: "Q3 Timeline Risk",
    description:
      "The 'Alpha' phase is trending 3 days behind. Adding one junior dev now may be cheaper than overtime later.",
    cta: "View Resource Plan",
  },
  {
    id: "cloud-reserve",
    priority: "Low",
    title: "Cloud Instance Reserve",
    description:
      "Consider reserved instances for the database cluster. Projected savings of ~5% annually.",
    cta: "Analyze Costs",
  },
  {
    id: "travel-policy",
    priority: "Low",
    title: "Travel Policy Update",
    description:
      "Last-minute flight bookings are up 10%. Enforcing a 14-day booking rule could reduce costs.",
    cta: "Review Policy",
  },
];

export function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
