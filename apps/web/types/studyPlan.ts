export interface Item {
  id?: string | number;
  title: string;
  slug: string;
  src: string;
  solution: string | null;
  score: number | null;
  difficulty?: number | null;
  isPremium: boolean;
}

export interface Section {
  title: string;
  summary?: string;
  content?: string;
  isLeaf?: boolean;
  children?: Section[];
  problems?: Item[];
}

export interface Root {
  title: string;
  src: string;
  last_update: string;
  summary?: string;
  children: Section[];
}
