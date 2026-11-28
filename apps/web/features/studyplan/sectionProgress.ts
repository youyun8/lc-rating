import type { StudyPlanData } from "@/types";

export interface SectionProgress {
  solved: number;
  total: number;
}

/** Unique problems under a section and how many of them are solved. */
export function sectionProgress(
  section: StudyPlanData.Section,
  progress: Record<string, string | undefined>,
): SectionProgress {
  const ids = new Set<string>();
  const walk = (node: StudyPlanData.Section) => {
    for (const problem of node.problems ?? []) {
      const id = problem.id?.toString();
      if (id) ids.add(id);
    }
    node.children?.forEach(walk);
  };
  walk(section);
  let solved = 0;
  for (const id of ids) if (progress[id] === "SOLVED") solved += 1;
  return { solved, total: ids.size };
}

/** "1.2 爬樓梯" → { number: "1.2", label: "爬樓梯" }. */
export function splitSectionTitle(title: string): {
  number: string | null;
  label: string;
} {
  const match = title.match(/^\s*(\d+(?:\.\d+)*)\.?\s+(.*)$/);
  return match
    ? { number: match[1]!, label: match[2]! }
    : { number: null, label: title };
}
