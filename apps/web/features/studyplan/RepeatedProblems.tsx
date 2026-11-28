import { useProgressMap } from "@/features/userData";
import type { StudyPlanData } from "@/types";
import { cn } from "@/lib/utils";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { CheckCircle2, Repeat2 } from "lucide-react";

/**
 * 冒險路線 keeps each problem only where it first appears. Sections that used
 * to list it show a compact chip row linking back there, so the teaching flow
 * stays intact without asking students to solve the same problem twice.
 */
export function RepeatedProblems({
  repeats,
}: {
  repeats: StudyPlanData.RepeatedItem[];
}) {
  const progress = useProgressMap();

  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 sm:p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Repeat2 className="h-3.5 w-3.5" />
        本節另有 {repeats.length} 題已在前面章節出現，點擊回到原處
      </p>
      <div className="flex flex-wrap gap-2">
        {repeats.map((repeat) => {
          const solved =
            repeat.id !== undefined && progress[String(repeat.id)] === "SOLVED";
          return (
            <a
              key={`${repeat.id ?? repeat.title}`}
              href={`#${sectionAnchor(repeat.firstSeenIn)}`}
              title={`首次出現於「${repeat.firstSeenIn}」`}
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted",
                solved
                  ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  : "border-border/60 text-foreground",
              )}
            >
              {solved && <CheckCircle2 className="h-3 w-3 shrink-0" />}
              <span className="truncate">
                {repeat.id !== undefined ? `${repeat.id}. ` : ""}
                {repeat.title}
              </span>
              <span className="shrink-0 text-muted-foreground">
                · {repeat.firstSeenIn.split(" ")[0]}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
