import {
  LC_RATING_PROBLEM_SOLUTIONS_KEY,
  STORAGE_VERSION,
} from "@/config/constants";
import { shared } from "use-broadcast-ts";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  ProblemSolutionsStore,
  ProblemSolutionsStoreState,
} from "./types_v2";

const persistOption: PersistOptions<
  ProblemSolutionsStore,
  ProblemSolutionsStoreState
> = {
  name: LC_RATING_PROBLEM_SOLUTIONS_KEY,
  version: STORAGE_VERSION,
};

const sharedOption = {
  name: LC_RATING_PROBLEM_SOLUTIONS_KEY,
};

export const useProblemSolutionsStore = create<ProblemSolutionsStore>()(
  shared(
    persist(
      (set, get) => ({
        problemSolutions: {},
        problemSolutionsUpdatedAt: {},

        getProblemSolution: (id) => get().problemSolutions[id],

        setProblemSolution: (id, value) =>
          set((state) => {
            const code = value.code.trim();
            const problemSolutions = { ...state.problemSolutions };
            const problemSolutionsUpdatedAt = {
              ...state.problemSolutionsUpdatedAt,
            };

            if (code.length === 0) {
              delete problemSolutions[id];
              delete problemSolutionsUpdatedAt[id];
            } else {
              problemSolutions[id] = {
                code: value.code,
                language: value.language,
              };
              problemSolutionsUpdatedAt[id] = Date.now();
            }

            return { problemSolutions, problemSolutionsUpdatedAt };
          }),

        delProblemSolution: (id) =>
          set((state) => {
            const problemSolutions = { ...state.problemSolutions };
            delete problemSolutions[id];
            const problemSolutionsUpdatedAt = {
              ...state.problemSolutionsUpdatedAt,
            };
            delete problemSolutionsUpdatedAt[id];
            return {
              problemSolutions,
              problemSolutionsUpdatedAt,
            };
          }),

        setAllProblemSolutions: (
          problemSolutions,
          problemSolutionsUpdatedAt = {},
        ) => {
          set((state) => ({
            problemSolutions: {
              ...state.problemSolutions,
              ...problemSolutions,
            },
            problemSolutionsUpdatedAt: {
              ...state.problemSolutionsUpdatedAt,
              ...problemSolutionsUpdatedAt,
            },
          }));
        },

        clearAllProblemSolutions: () =>
          set(() => ({
            problemSolutions: {},
            problemSolutionsUpdatedAt: {},
          })),
      }),
      persistOption,
    ),
    sharedOption,
  ),
);

export const useProblemSolutions = () => {
  const problemSolutions = useProblemSolutionsStore(
    (state) => state.problemSolutions,
  );
  const setProblemSolution = useProblemSolutionsStore(
    (state) => state.setProblemSolution,
  );
  const delProblemSolution = useProblemSolutionsStore(
    (state) => state.delProblemSolution,
  );

  return {
    problemSolutions,
    setProblemSolution,
    delProblemSolution,
  };
};
