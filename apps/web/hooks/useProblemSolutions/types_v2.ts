export interface ProblemSolution {
  code: string;
  language: string;
}

export type ProblemSolutions = Record<string, ProblemSolution>;
export type ProblemSolutionsUpdatedAt = Record<string, number>;

export interface ProblemSolutionsStoreState {
  problemSolutions: ProblemSolutions;
  problemSolutionsUpdatedAt: ProblemSolutionsUpdatedAt;
}

interface ProblemSolutionsStoreActions {
  getProblemSolution: (id: string) => ProblemSolution | undefined;
  setProblemSolution: (id: string, value: ProblemSolution) => void;
  delProblemSolution: (id: string) => void;
  setAllProblemSolutions: (
    problemSolutions: ProblemSolutions,
    problemSolutionsUpdatedAt?: ProblemSolutionsUpdatedAt,
  ) => void;
  clearAllProblemSolutions: () => void;
}

export type ProblemSolutionsStore = ProblemSolutionsStoreState &
  ProblemSolutionsStoreActions;
