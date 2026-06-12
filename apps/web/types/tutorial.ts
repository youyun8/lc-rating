/**
 * Tutorial tree: the "what to read" side of a study plan. Shares hierarchy
 * and numeric `id`s with the matching `StudyPlanData` (problemset) tree so the
 * two can be joined 1:1 during rendering.
 */
export interface Section {
  id: number;
  title: string;
  description?: string;
  src?: string | null;
  summary?: string;
  children?: Section[];
}

export interface Root {
  id: number;
  title: string;
  description?: string;
  src: string | null;
  last_update: string | null;
  summary?: string;
  children: Section[];
}
