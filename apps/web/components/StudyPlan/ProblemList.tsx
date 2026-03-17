import { ProgressSelector } from "@/components/common/ProgressSelector";
import { RatingCircle, ratingInfo } from "@/components/common/RatingCircle";
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
    <div className="flex flex-col w-full gap-1">
      {enrichedProblems.map((problem) => {
        const problemId = problem.id?.toString();
        const info = ratingInfo(problem.score || 0);
        return (
          <div 
            key={`${problem.slug}-${problemId}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors gap-2"
          >
            <a
              href={`${LC_HOST}/problems/${problem.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base font-medium hover:text-primary hover:underline underline-offset-4 line-clamp-1 flex-1 mr-0 sm:mr-4"
            >
              {problem.id?.toString() === "1000000000" || problem.title.startsWith(`${problem.id}`)
                ? problem.title
                : `${problem.id}. ${problem.title}`}
            </a>
            <div className="flex flex-row items-center gap-2 sm:gap-4 shrink-0 justify-between sm:justify-end">
              {problem.score ? (
                <div className="flex flex-row items-center gap-2 min-w-[60px] sm:min-w-[70px] justify-end text-sm sm:text-base">
                  <RatingCircle rating={Number(problem.score || 0)} {...info} />
                  <span className="font-mono text-muted-foreground">{problem.score?.toFixed(0)}</span>
                </div>
              ) : <div className="min-w-[60px] sm:min-w-[70px]" />}
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
