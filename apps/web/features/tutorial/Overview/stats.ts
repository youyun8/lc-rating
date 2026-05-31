import { TutorialData } from "@/types";
import { getTutorialStats } from "@/features/learning/utils/sectionTree";

export interface TutorialSummary {
  totalSections: number;
  documentedSections: number;
}

export function getTutorialSummary(
  data: TutorialData.Root | undefined,
): TutorialSummary {
  const stats = getTutorialStats(data);
  return {
    totalSections: stats.sections,
    documentedSections: stats.documented + (data?.summary ? 1 : 0),
  };
}
