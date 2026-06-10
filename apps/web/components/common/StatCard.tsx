import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon?: LucideIcon;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

/** Hero overview metric: label + big number with an optional icon chip and hint. */
export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.75rem]">
            {value}
          </p>
        </div>
        {Icon && (
          <span className="stat-card-chip" aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1.5 hidden text-xs leading-relaxed text-muted-foreground sm:block">
          {hint}
        </p>
      )}
    </div>
  );
}
