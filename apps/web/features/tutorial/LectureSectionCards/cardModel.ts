import type { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import {
  CheckCircle2,
  CircleDashed,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";

export interface LectureSectionCardItem {
  id: number;
  title: string;
  description?: string;
  slug: string;
  href: string;
  summary?: string;
  childCount: number;
  totalSections: number;
  problemCount: number;
  problemIds: string[];
  depth: number;
}

export interface CardProgressState {
  key: "completed" | "working" | "pending";
  label: string;
  helper: string;
  color: string;
  darkColor: string;
  Icon: LucideIcon;
}

export function getSummaryPreview(summary?: string) {
  if (!summary)
    return "進入此單元後，可依下一層子單元繼續閱讀，或直接開啟完整講義與搭配練習。";

  return summary
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\*\*/g, "")
    .replace(/[#>`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

export function getLevelLabel(depth: number) {
  if (depth === 0) return "單元";
  if (depth === 1) return "子單元";
  return "細分單元";
}

export function getProblemIds(problems: StudyPlanData.Item[]) {
  return Array.from(
    new Set(
      problems
        .map((problem) => problem.id?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

function findStudyPlanSectionById(
  sections: StudyPlanData.Section[] | undefined,
  sectionId: number,
): StudyPlanData.Section | undefined {
  for (const section of sections ?? []) {
    if (section.id === sectionId) return section;

    const childMatch = findStudyPlanSectionById(section.children, sectionId);
    if (childMatch) return childMatch;
  }
}

export function getStudyPlanProblemsForSection(
  root: StudyPlanData.Root | undefined,
  sectionId: number,
): StudyPlanData.Item[] {
  const section = findStudyPlanSectionById(root?.children, sectionId);
  if (!section) return [];

  return collectStudyPlanProblems(section);
}

function collectStudyPlanProblems(
  section: StudyPlanData.Section,
): StudyPlanData.Item[] {
  return [
    ...(section.problems ?? []),
    ...(section.children ?? []).flatMap(collectStudyPlanProblems),
  ];
}

function countTutorialDescendants(section: TutorialData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialDescendants(child),
      0,
    )
  );
}

export function makeLectureSectionCardItem(
  section: TutorialData.Section,
  planKey: string,
  depth = 0,
  problems: StudyPlanData.Item[] = [],
): LectureSectionCardItem {
  const slug = sectionAnchor(section.title);
  const problemIds = getProblemIds(problems);
  const totalSections =
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialDescendants(child),
      0,
    );

  return {
    id: section.id,
    title: section.title,
    description: section.description,
    slug,
    href: `/lecture/${planKey}/${slug}`,
    summary: section.summary,
    childCount: section.children?.length ?? 0,
    totalSections,
    problemCount: problemIds.length,
    problemIds,
    depth,
  };
}

export function getCardProgressState(
  problemIds: string[],
  progress: Record<string, string | undefined>,
  pendingKey: string,
): CardProgressState {
  const total = problemIds.length;
  const solved = problemIds.filter((id) => progress[id] === "SOLVED").length;
  const started = problemIds.filter((id) => {
    const status = progress[id];
    return Boolean(status && status !== pendingKey);
  }).length;

  if (total > 0 && solved === total) {
    return {
      key: "completed",
      label: "已完成",
      helper: `${solved}/${total} 題`,
      color: "#28a745",
      darkColor: "#15803d",
      Icon: CheckCircle2,
    };
  }

  if (started > 0 || solved > 0) {
    return {
      key: "working",
      label: "進行中",
      helper: `${solved}/${total} 題完成`,
      color: "#1E90FF",
      darkColor: "#1d4ed8",
      Icon: PlayCircle,
    };
  }

  return {
    key: "pending",
    label: total > 0 ? "未開始" : "未配置題目",
    helper: total > 0 ? `0/${total} 題` : "暫無題目",
    color: "#64748b",
    darkColor: "#334155",
    Icon: CircleDashed,
  };
}
