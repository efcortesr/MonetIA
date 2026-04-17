import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // Base classes that can be extended or partially overridden
  const baseClasses = "rounded-2xl border shadow-sm";
  
  // Default appearance if not overridden
  const defaultAppearance = className.includes("bg-") ? "" : "bg-white";
  const defaultBorder = className.includes("border-") ? "" : "border-zinc-200";

  return (
    <div className={`${baseClasses} ${defaultBorder} ${defaultAppearance} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div>
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
