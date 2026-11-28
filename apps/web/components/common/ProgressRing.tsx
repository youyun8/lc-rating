import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  /** Any CSS colour; defaults to the theme's primary colour. */
  color?: string;
  trackClassName?: string;
  className?: string;
  children?: ReactNode;
  label?: string;
}

/** Circular progress meter with optional centred content. */
export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  color = "var(--primary)",
  trackClassName = "stroke-muted",
  className,
  children,
  label,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped * 100)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
        />
        {clamped > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            // SVG presentation attributes don't resolve var(); style does.
            style={{ stroke: color }}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${clamped * circumference} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        )}
      </svg>
      {children && <span className="relative">{children}</span>}
    </span>
  );
}
