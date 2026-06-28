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
  const delProblemSolutions = useProblemSolutionsStore(
    (state) => state.delProblemSolutions,
  );

  const setSolutions = useCallback(
    (next: ProblemSolution[]) => setProblemSolutions(problemId, next),
    [problemId, setProblemSolutions],
  );

  const delSolutions = useCallback(
    () => delProblemSolutions(problemId),
    [problemId, delProblemSolutions],
  );

  return { solutions, setSolutions, delSolutions };
}
