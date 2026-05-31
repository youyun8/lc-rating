import { StudyPlanData } from "@/types";
import { getStudyPlanPracticeStats } from "@/features/learning/utils/sectionTree";

export type ProgressMap = Record<string, string | undefined>;

export interface PlanSummary {
  totalProblems: number;
  totalSections: number;
  completedProblems: number;
  pct: number;
}

export function getPlanSummary(
  data: StudyPlanData.Root | undefined,
  progress: ProgressMap,
): PlanSummary {
  const stats = getStudyPlanPracticeStats(data, progress);

  return {
    totalProblems: stats.total,
    totalSections: stats.sections,
    completedProblems: stats.completed,
    pct: stats.pct,
  };
}
