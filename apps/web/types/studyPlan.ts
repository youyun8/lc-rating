export interface Item {
  id?: string | number;
  title: string;
  slug: string;
  src: string;
  solution: string | null;
  score: number | null;
  difficulty?: number | null;
  isPremium: boolean;
  subsection?: string;
}

/**
 * Problemset tree: the "what to practice" side of a study plan. Tutorial prose
 * lives in the matching `TutorialData` tree and is joined to sections here by
 * the stable numeric `id`.
 */
export interface Section {
  id: number;
  title: string;
  src?: string | null;
  isLeaf?: boolean;
  children?: Section[];
  problems?: Item[];
}

export interface Root {
  id: number;
  title: string;
  src: string | null;
  last_update: string | null;
  children: Section[];
}
