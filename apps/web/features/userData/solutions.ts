"use client";

import {
  ProblemSolution,
  useProblemSolutionsStore,
} from "@/hooks/useProblemSolutions";
import { useCallback } from "react";

export type { ProblemSolution };

/** Read and persist the user's saved solutions for a single problem. */
export function useProblemSolutions(problemId: string) {
  const solutions = useProblemSolutionsStore(
    (state) => state.problemSolutions[problemId],
  );
  const setProblemSolutions = useProblemSolutionsStore(
    (state) => state.setProblemSolutions,
  );

  const setSolutions = useCallback(
    (next: ProblemSolution[]) => setProblemSolutions(problemId, next),
    [problemId, setProblemSolutions],
  );

  return { solutions, setSolutions };
}
