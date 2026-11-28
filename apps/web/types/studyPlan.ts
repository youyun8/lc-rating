export interface Item {
  id?: string | number;
  title: string;
  slug: string;
  src: string;
  solution: string | null;
  score: number | null;
  difficulty?: number | null;
  difficultyLabel?: string;
  stage?: string;
  pattern?: string;
  why?: string;
  insight?: string;
  practiceOrder?: string | number;
  isPremium: boolean;
  subsection?: string;
}

/** Problemset tree: upstream/local summaries stay beside tracked problems. */
export interface Section {
  id: number;
  title: string;
  src?: string | null;
  isLeaf?: boolean;
  /** Upstream summary or prose merged from a self-authored learning path. */
  description?: string;
  summary?: string;
  children?: Section[];
  problems?: Item[];
}

export interface Root {
  id: number;
  title: string;
  src: string | null;
  last_update: string | null;
  description?: string;
  summary?: string;
  children: Section[];
}
