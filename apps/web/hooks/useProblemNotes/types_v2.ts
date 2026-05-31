type ProblemNotes = Record<string, string>;
type ProblemNotesUpdatedAt = Record<string, number>;

export interface ProblemNotesStoreState {
  problemNotes: ProblemNotes;
  problemNotesUpdatedAt: ProblemNotesUpdatedAt;
}

interface ProblemNotesStoreActions {
  getProblemNote: (id: string) => string | undefined;
  setProblemNote: (id: string, value: string) => void;
  delProblemNote: (id: string) => void;
  setAllProblemNotes: (
    problemNotes: ProblemNotes,
    problemNotesUpdatedAt?: ProblemNotesUpdatedAt,
  ) => void;
  clearAllProblemNotes: () => void;
}

export type ProblemNotesStore = ProblemNotesStoreState &
  ProblemNotesStoreActions;
