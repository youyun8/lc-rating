import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
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
    <div className="rounded-xl border border-border overflow-hidden">
      {enrichedProblems.map((problem, idx) => {
        const problemId = problem.id?.toString();
        const info = ratingInfo(problem.score || 0);
        return (
          <div
            key={`${problem.slug}-${problemId}`}
            className={`flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between${idx < enrichedProblems.length - 1 ? " border-b border-border" : ""}`}
          >
            <a
              href={`${LC_HOST}/problems/${problem.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:truncate"
            >
              {problem.id?.toString() === "1000000000" ||
              problem.title.startsWith(`${problem.id}`)
                ? problem.title
                : `${problem.id}. ${problem.title}`}
            </a>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
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
                <span className="inline-block w-14" />
              )}
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
