import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InterviewFrequency } from "./model";

/**
 * Tailwind color classes per frequency tier, shared by the per-chapter badge
 * and the /handbook/interview-frequency ranking table so colors always match:
 * High = green, Medium = yellow, Low = gray.
 */
const FREQUENCY_CLASSES: Record<InterviewFrequency, string> = {
  High: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Medium:
    "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Low: "border-zinc-400/30 bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

const FREQUENCY_LABELS: Record<InterviewFrequency, string> = {
  High: "高",
  Medium: "中",
  Low: "低",
};

interface InterviewFrequencyBadgeProps {
  frequency: InterviewFrequency;
  /** When true, prefix the label with "Interview Frequency:". */
  withLabel?: boolean;
  className?: string;
}

/** Styled High/Medium/Low interview-frequency badge. */
export function InterviewFrequencyBadge({
  frequency,
  withLabel = false,
  className,
}: InterviewFrequencyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(FREQUENCY_CLASSES[frequency], className)}
    >
      {withLabel
        ? `面試頻率：${FREQUENCY_LABELS[frequency]}`
        : FREQUENCY_LABELS[frequency]}
    </Badge>
  );
}
