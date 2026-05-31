export interface ProblemSolution {
  /** Stable id, unique within a problem's solution list. */
  id: string;
  /** Optional label, e.g. the technique used ("雙指針", "DP"...). */
  title: string;
  code: string;
  language: string;
}

/** A problem can have multiple solutions (different techniques). */
export type ProblemSolutions = Record<string, ProblemSolution[]>;
type ProblemSolutionsUpdatedAt = Record<string, number>;

export interface ProblemSolutionsStoreState {
  problemSolutions: ProblemSolutions;
  problemSolutionsUpdatedAt: ProblemSolutionsUpdatedAt;
}

interface ProblemSolutionsStoreActions {
  getProblemSolutions: (id: string) => ProblemSolution[] | undefined;
  setProblemSolutions: (id: string, value: ProblemSolution[]) => void;
  delProblemSolutions: (id: string) => void;
  setAllProblemSolutions: (
    problemSolutions: ProblemSolutions,
    problemSolutionsUpdatedAt?: ProblemSolutionsUpdatedAt,
  ) => void;
  clearAllProblemSolutions: () => void;
}

export type ProblemSolutionsStore = ProblemSolutionsStoreState &
  ProblemSolutionsStoreActions;
