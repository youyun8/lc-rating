import { studyPlanContentMap } from "@/features/lecture/content";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import type { StudyPlanData, TutorialData } from "@/types";

/**
 * Self-authored learning paths (進階刷題衝刺, 手冊, 面試準備…) used
 * to have a separate「講義」page. Their prose now lives inside the matching
 * 題單: this module folds the authored `TutorialData` tree into the studyplan
 * problem tree so every 章節敘述 shows next to its tracked problems, and any
 * 講義-only 子主題 (e.g. 手冊的「模式總覽 / 定長視窗」) is preserved as a
 * prose-only section instead of being lost when the 講義 page is removed.
 */

/**
 * Trailing practice tables embedded in 講義 prose duplicate the tracked problem
 * lists that the 題單 already renders. Cut them so the merged section shows the
 * teaching prose once, with progress-tracked problems handled by the 題單.
 */
const PRACTICE_TABLE_MARKERS = [
  "\n## 搭配追蹤題單",
  "\n## 練習題",
  "\n**搭配練習**",
];

function stripEmbeddedPracticeTables(summary: string | undefined): string {
  if (!summary) return "";
  let cut = summary.length;
  for (const marker of PRACTICE_TABLE_MARKERS) {
    const idx = summary.indexOf(marker);
    if (idx !== -1 && idx < cut) cut = idx;
  }
  return summary.slice(0, cut).trimEnd();
}

function indexProseById(
  root: TutorialData.Root,
): Map<number, TutorialData.Section> {
  const map = new Map<number, TutorialData.Section>();
  const walk = (section: TutorialData.Section) => {
    map.set(section.id, section);
    section.children?.forEach(walk);
  };
  root.children.forEach(walk);
  return map;
}

/** Build the prose-only sections for 講義 nodes that have no matching 題單 id. */
function proseOnlySection(
  section: TutorialData.Section,
  studyPlanIds: Set<number>,
): StudyPlanData.Section | null {
  const summary = stripEmbeddedPracticeTables(section.summary);
  const childSections = (section.children ?? [])
    .filter((child) => !studyPlanIds.has(child.id))
    .map((child) => proseOnlySection(child, studyPlanIds))
    .filter((child): child is StudyPlanData.Section => child !== null);
  if (!summary && !section.description && childSections.length === 0) {
    return null;
  }
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    summary,
    children: childSections.length > 0 ? childSections : undefined,
  };
}

function mergeSection(
  section: StudyPlanData.Section,
  proseById: Map<number, TutorialData.Section>,
  studyPlanIds: Set<number>,
): StudyPlanData.Section {
  const prose = proseById.get(section.id);
  const mergedChildren = (section.children ?? []).map((child) =>
    mergeSection(child, proseById, studyPlanIds),
  );

  // Prose-only 講義 子主題 whose parent is this section keep their teaching
  // content alive inside the 題單, ordered before the tracked practice leaves.
  const injected = (prose?.children ?? [])
    .filter((child) => !studyPlanIds.has(child.id))
    .map((child) => proseOnlySection(child, studyPlanIds))
    .filter((child): child is StudyPlanData.Section => child !== null);

  const children = [...injected, ...mergedChildren];

  return {
    ...section,
    description: prose?.description ?? section.description,
    summary: stripEmbeddedPracticeTables(prose?.summary) || section.summary,
    children: children.length > 0 ? children : undefined,
  };
}

export interface MergedStudyPlan {
  root: StudyPlanData.Root;
  /** Root-level 講義 prose to surface at the top of the 題單 page. */
  summary?: string;
  description?: string;
}

/**
 * Returns the studyplan tree with authored 講義 prose folded in when the plan is
 * a self-authored learning path; otherwise returns the plain studyplan tree.
 */
export function getMergedStudyPlan(planKey: string): MergedStudyPlan | null {
  const base = studyPlanDataMap[planKey];
  if (!base) return null;

  const prose = studyPlanContentMap[planKey];
  if (!prose) return { root: base };

  const proseById = indexProseById(prose);
  const studyPlanIds = new Set<number>();
  const collect = (section: StudyPlanData.Section) => {
    studyPlanIds.add(section.id);
    section.children?.forEach(collect);
  };
  base.children.forEach(collect);

  return {
    root: {
      ...base,
      children: base.children.map((section) =>
        mergeSection(section, proseById, studyPlanIds),
      ),
    },
    summary: prose.summary,
    description: prose.description,
  };
}

/** Whether a plan carries merged 講義 prose (i.e. has no standalone 講義 page). */
export function isMergedLearningPath(planKey: string): boolean {
  return Boolean(studyPlanContentMap[planKey]);
}
