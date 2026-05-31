import type { StudyPlanData, TutorialData } from "@/types";

export interface SectionStats {
  sections: number;
  rootSections: number;
  documented: number;
}

export interface PracticeStats {
  total: number;
  completed: number;
  sections: number;
  rootSections: number;
  pct: number;
}

export function countStudyPlanProblems(section: StudyPlanData.Section): number {
  return (
    (section.problems?.length ?? 0) +
    (section.children ?? []).reduce(
      (acc, child) => acc + countStudyPlanProblems(child),
      0,
    )
  );
}

function countStudyPlanSections(section: StudyPlanData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (acc, child) => acc + countStudyPlanSections(child),
      0,
    )
  );
}

function countTutorialSections(section: TutorialData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (acc, child) => acc + countTutorialSections(child),
      0,
    )
  );
}

function countDocumentedTutorialSections(
  section: TutorialData.Section,
): number {
  return (
    (section.summary ? 1 : 0) +
    (section.children ?? []).reduce(
      (acc, child) => acc + countDocumentedTutorialSections(child),
      0,
    )
  );
}

function collectStudyPlanProblemIds(
  sections: StudyPlanData.Section[],
): string[] {
  const ids: string[] = [];

  function walk(section: StudyPlanData.Section) {
    for (const problem of section.problems ?? []) {
      const id = problem.id?.toString();
      if (id) ids.push(id);
    }

    for (const child of section.children ?? []) {
      walk(child);
    }
  }

  for (const section of sections) {
    walk(section);
  }

  return ids;
}

export function flattenStudyPlanProblems(
  section: StudyPlanData.Section,
): StudyPlanData.Item[] {
  return [
    ...(section.problems ?? []),
    ...(section.children ?? []).flatMap(flattenStudyPlanProblems),
  ];
}

export function indexTutorialSectionsById(root?: TutorialData.Root) {
  const map = new Map<number, TutorialData.Section>();
  if (!root) return map;

  function walk(section: TutorialData.Section) {
    map.set(section.id, section);
    section.children?.forEach(walk);
  }

  root.children.forEach(walk);
  return map;
}

export function getTutorialStats(root?: TutorialData.Root): SectionStats {
  if (!root) {
    return { sections: 0, rootSections: 0, documented: 0 };
  }

  return {
    sections: root.children.reduce(
      (acc, child) => acc + countTutorialSections(child),
      0,
    ),
    rootSections: root.children.length,
    documented: root.children.reduce(
      (acc, child) => acc + countDocumentedTutorialSections(child),
      0,
    ),
  };
}

export function getStudyPlanPracticeStats(
  root: StudyPlanData.Root | undefined,
  progress: Record<string, string | undefined>,
): PracticeStats {
  if (!root) {
    return {
      total: 0,
      completed: 0,
      sections: 0,
      rootSections: 0,
      pct: 0,
    };
  }

  const ids = collectStudyPlanProblemIds(root.children);
  const total = ids.length;
  const completed = ids.filter((id) => progress[id] === "SOLVED").length;

  return {
    total,
    completed,
    sections: root.children.reduce(
      (acc, child) => acc + countStudyPlanSections(child),
      0,
    ),
    rootSections: root.children.length,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
