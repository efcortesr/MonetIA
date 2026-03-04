import { clampPercent } from "@/lib/mock";

export function Progress({ value }: { value: number }) {
  const pct = clampPercent(value);
  return (
    <div className="h-2 w-full rounded-full bg-zinc-100">
      <div
        className="h-2 rounded-full bg-blue-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
