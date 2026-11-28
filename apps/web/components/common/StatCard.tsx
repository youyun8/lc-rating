import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon?: LucideIcon;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

/** Compact overview metric: icon, label and a tabular number. */
export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card" title={typeof hint === "string" ? hint : undefined}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="stat-card-chip" aria-hidden>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className="font-num text-lg font-bold leading-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
