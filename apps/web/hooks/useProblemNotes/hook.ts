import {
  LC_RATING_PROBLEM_NOTES_KEY,
  STORAGE_VERSION,
} from "@/config/constants";
import { shared } from "use-broadcast-ts";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { ProblemNotesStore, ProblemNotesStoreState } from "./types_v2";

const persistOption: PersistOptions<ProblemNotesStore, ProblemNotesStoreState> =
  {
    name: LC_RATING_PROBLEM_NOTES_KEY,
    version: STORAGE_VERSION,
  };

const sharedOption = {
  name: LC_RATING_PROBLEM_NOTES_KEY,
};

export const useProblemNotesStore = create<ProblemNotesStore>()(
  shared(
    persist(
      (set, get) => ({
        problemNotes: {},
        problemNotesUpdatedAt: {},

        getProblemNote: (id) => get().problemNotes[id],

        setProblemNote: (id, value) =>
          set((state) => {
            const trimmed = value.trim();
            const problemNotes = { ...state.problemNotes };
            const problemNotesUpdatedAt = { ...state.problemNotesUpdatedAt };

            if (trimmed.length === 0) {
              delete problemNotes[id];
              delete problemNotesUpdatedAt[id];
            } else {
              problemNotes[id] = value;
              problemNotesUpdatedAt[id] = Date.now();
            }

            return { problemNotes, problemNotesUpdatedAt };
          }),

        delProblemNote: (id) =>
          set((state) => {
            const problemNotes = { ...state.problemNotes };
            delete problemNotes[id];
            const problemNotesUpdatedAt = { ...state.problemNotesUpdatedAt };
            delete problemNotesUpdatedAt[id];
            return {
              problemNotes,
              problemNotesUpdatedAt,
            };
          }),

        setAllProblemNotes: (problemNotes, problemNotesUpdatedAt = {}) => {
          set((state) => ({
            problemNotes: {
              ...state.problemNotes,
              ...problemNotes,
            },
            problemNotesUpdatedAt: {
              ...state.problemNotesUpdatedAt,
              ...problemNotesUpdatedAt,
            },
          }));
        },

        clearAllProblemNotes: () =>
          set(() => ({
            problemNotes: {},
            problemNotesUpdatedAt: {},
          })),
      }),
      persistOption,
    ),
    sharedOption,
  ),
);
