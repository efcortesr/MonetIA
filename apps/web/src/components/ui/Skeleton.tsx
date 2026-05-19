"use client";

/**
 * Generic animated skeleton block — used to indicate loading state
 * without layout shift. Width/height are controlled by className.
 */
export function Skeleton({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-zinc-100 ${className}`}
    />
  );
}

/** Pre-built skeleton for a KPI / stat card */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-7 w-32 mt-3" />
      <Skeleton className="h-2 w-24 mt-1" />
    </div>
  );
}

function getCellWidth(index: number, cols: number): string {
  if (index === 1) return "w-40";
  if (index === cols - 1) return "w-16 ml-auto";
  return "w-24";
}

/** Pre-built skeleton for the expense table rows */
export function TableRowSkeleton({ cols = 5 }: Readonly<{ cols?: number }>) {
  const columns = Array.from({ length: cols }, (_, i) => `col-skeleton-${i}`);
  return (
    <tr>
      {columns.map((colId, i) => (
        <td key={colId} className="px-6 py-4">
          <Skeleton className={`h-3 ${getCellWidth(i, cols)}`} />
        </td>
      ))}
    </tr>
  );
}

const CHART_SKELETON_IDS = ["chart-a", "chart-b", "chart-c"];

/** Pre-built skeleton that matches the FinancialDashboard loading state */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {CHART_SKELETON_IDS.map((id) => (
          <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-24" />
            <Skeleton className="h-48 w-full mt-2 rounded-xl" />
          </div>
        ))}
      </div>
      {/* Timeline chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-2 w-56" />
        <Skeleton className="h-64 w-full mt-2 rounded-xl" />
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-24" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <table className="w-full">
          <tbody>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}
