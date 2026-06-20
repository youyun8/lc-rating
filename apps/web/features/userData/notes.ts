"use client";

import { useProblemNotesStore } from "@/hooks/useProblemNotes";
import { useCallback } from "react";

/** Read and persist the user's saved note for a single problem. */
export function useProblemNote(problemId: string) {
  const note = useProblemNotesStore((state) => state.problemNotes[problemId]);
  const setProblemNote = useProblemNotesStore((state) => state.setProblemNote);

  const setNote = useCallback(
    (next: string) => setProblemNote(problemId, next),
    [problemId, setProblemNote],
  );

  return { note, setNote };
}
