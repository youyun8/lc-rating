import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { useProgressStore } from "@/hooks/useProgress";
import { useProblems } from "@/hooks/useProblems";
import { StudyPlanData } from "@/types";
import React, { useMemo } from "react";

interface ProblemListProps {
  problems: StudyPlanData.Item[];
}

const ProblemList = React.memo(({ problems }: ProblemListProps) => {
  const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
  const LC_HOST = linkLanguage === "zh" ? LC_HOST_ZH : LC_HOST_EN;
  const { problemMap } = useProblems();
  const progress = useProgressStore((state) => state.progress);

  // Enrich problems with scores from problemMap
  const enrichedProblems = useMemo(() => {
    if (!problemMap) return problems;

    return problems.map((problem) => {
      // If problem already has a score, use it
      if (problem.score !== null && problem.score !== undefined) {
        return problem;
      }

      // Otherwise, look up the rating from problemMap using problem id
      const problemId = problem.id?.toString();
      if (problemId && problemMap[problemId]) {
        return {
          ...problem,
          score: problemMap[problemId].rating,
        };
      }

      return problem;
    });
  }, [problems, problemMap]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-4 py-3">
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            題目列表
          </p>
          <p className="text-xs text-muted-foreground">
            可直接前往 LeetCode 並同步更新進度
          </p>
        </div>
        <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {enrichedProblems.length} 題
        </span>
      </div>

      {enrichedProblems.map((problem, idx) => {
        const problemId = problem.id?.toString();
        const info = ratingInfo(problem.score || 0);
        const isCompleted = problemId ? progress[problemId] === "AC" : false;
        return (
          <div
            key={`${problem.slug}-${problemId}`}
            className={`flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between${
              idx < enrichedProblems.length - 1 ? " border-b border-border/60" : ""
            }${isCompleted ? " bg-emerald-500/5" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {problemId && problemId !== "1000000000" ? (
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    #{problemId}
                  </span>
                ) : null}
                {isCompleted ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    已完成
                  </span>
                ) : null}
              </div>
              <a
                href={`${LC_HOST}/problems/${problem.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:text-[15px]"
              >
                {problem.id?.toString() === "1000000000" ||
                problem.title.startsWith(`${problem.id}`)
                  ? problem.title
                  : `${problem.id}. ${problem.title}`}
              </a>
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <div className="flex items-center gap-2">
                {problem.score ? (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                    style={{
                      color: info.color,
                      backgroundColor: `${info.color}1a`,
                    }}
                  >
                    {problem.score.toFixed(0)}
                  </span>
                ) : (
                  <span className="rounded-full border border-dashed border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                    無評分
                  </span>
                )}
              </div>
              {problemId ? <ProgressSelector problemId={problemId} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
});

ProblemList.displayName = "ProblemList";

export { ProblemList };
