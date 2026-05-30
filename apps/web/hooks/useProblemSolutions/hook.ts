import {
  LC_RATING_PROBLEM_SOLUTIONS_KEY,
  STORAGE_VERSION,
} from "@/config/constants";
import { shared } from "use-broadcast-ts";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  ProblemSolution,
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

/** Drop solutions without any code so empty entries never get persisted. */
function sanitizeSolutions(value: ProblemSolution[]): ProblemSolution[] {
  return value
    .filter((solution) => solution.code.trim().length > 0)
    .map((solution) => ({
      id: solution.id,
      title: solution.title,
      code: solution.code,
      language: solution.language,
    }));
}

export const useProblemSolutionsStore = create<ProblemSolutionsStore>()(
  shared(
    persist(
      (set, get) => ({
        problemSolutions: {},
        problemSolutionsUpdatedAt: {},

        getProblemSolutions: (id) => get().problemSolutions[id],

        setProblemSolutions: (id, value) =>
          set((state) => {
            const sanitized = sanitizeSolutions(value);
            const problemSolutions = { ...state.problemSolutions };
            const problemSolutionsUpdatedAt = {
              ...state.problemSolutionsUpdatedAt,
            };

            if (sanitized.length === 0) {
              delete problemSolutions[id];
              delete problemSolutionsUpdatedAt[id];
            } else {
              problemSolutions[id] = sanitized;
              problemSolutionsUpdatedAt[id] = Date.now();
            }

            return { problemSolutions, problemSolutionsUpdatedAt };
          }),

        delProblemSolutions: (id) =>
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
  const setProblemSolutions = useProblemSolutionsStore(
    (state) => state.setProblemSolutions,
  );
  const delProblemSolutions = useProblemSolutionsStore(
    (state) => state.delProblemSolutions,
  );

  return {
    problemSolutions,
    setProblemSolutions,
    delProblemSolutions,
  };
};
