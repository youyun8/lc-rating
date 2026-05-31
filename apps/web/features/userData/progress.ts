"use client";

import { useOptions } from "@/hooks/useOptions";
import { useProblems } from "@/hooks/useProblems";
import {
  useProgress,
  useProgressStore,
  type Progress,
} from "@/hooks/useProgress";
import { useMemo } from "react";

export interface ProgressStatusBreakdown {
  key: string;
  label: string;
  color: string;
  count: number;
}

export interface ProgressStats {
  /** Number of problems the user has given any status. */
  tracked: number;
  /** Number of problems marked solved (AC). */
  solved: number;
  /** Solved as a percentage of tracked problems. */
  solvedRate: number;
  /** Total number of problems in the library, when loaded. */
  totalProblems: number;
  /** Tracked as a percentage of the whole library. */
  coverageRate: number;
  byStatus: ProgressStatusBreakdown[];
}

export interface RecentProgressItem {
  /** Problem id (matches the key used in the library). */
  id: string;
  /** Display title, falling back to the id when the library is missing it. */
  title: string;
  /** LeetCode slug, used to build a direct problem link. */
  titleSlug?: string;
  /** Problem rating, when known. */
  rating?: number;
  /** Raw status/option key. */
  status: string;
  /** Human-readable status label. */
  statusLabel: string;
  /** Status colour used for the badge dot. */
  statusColor: string;
  /** Epoch millis of the last status change (0 when unknown). */
  updatedAt: number;
}

/** Aggregated, user-facing progress statistics (no timestamps or raw keys). */
export function useProgressStats(): ProgressStats {
  const { getOption } = useOptions();
  const { problemMap } = useProblems();
  const progress = useProgressStore((state) => state.progress);

  return useMemo(() => {
    const entries = Object.entries(progress);
    const tracked = entries.length;
    const totalProblems = problemMap ? Object.keys(problemMap).length : 0;

    const counts: Record<string, number> = {};
    for (const [, status] of entries) {
      counts[status] = (counts[status] ?? 0) + 1;
    }

    const byStatus: ProgressStatusBreakdown[] = Object.entries(counts)
      .map(([key, count]) => {
        const option = getOption(key);
        return {
          key,
          count,
          label: option.label || option.key,
          color: option.color,
        };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const solved = counts.SOLVED ?? 0;
    const solvedRate = tracked > 0 ? (solved / tracked) * 100 : 0;
    const coverageRate =
      totalProblems > 0 ? (tracked / totalProblems) * 100 : 0;

    return {
      tracked,
      solved,
      solvedRate,
      totalProblems,
      coverageRate,
      byStatus,
    };
  }, [getOption, problemMap, progress]);
}

/**
 * The user's most recently updated problems, newest first. Combines progress
 * timestamps with library metadata so the UI can render a ready-to-show list.
 * Pass a positive `limit` to cap the list (defaults to 20); `0` returns all.
 */
export function useRecentProgress(limit = 20): RecentProgressItem[] {
  const { getOption } = useOptions();
  const { problemMap } = useProblems();
  const progress = useProgressStore((state) => state.progress);
  const progressUpdatedAt = useProgressStore(
    (state) => state.progressUpdatedAt,
  );

  return useMemo(() => {
    const items = Object.entries(progress).map(([id, status]) => {
      const option = getOption(status);
      const problem = problemMap?.[id];
      return {
        id,
        title: problem?.title ?? id,
        titleSlug: problem?.titleSlug,
        rating: problem?.rating,
        status,
        statusLabel: option.label || option.key,
        statusColor: option.color,
        updatedAt: progressUpdatedAt?.[id] ?? 0,
      } satisfies RecentProgressItem;
    });

    items.sort((a, b) => b.updatedAt - a.updatedAt);

    return limit > 0 ? items.slice(0, limit) : items;
  }, [getOption, problemMap, progress, progressUpdatedAt, limit]);
}

/**
 * Read-only access to every tracked problem's status, keyed by problem id.
 * Use this for lists, tables and cards that derive counts or badges from a
 * user's overall progress.
 */
export function useProgressMap(): Progress {
  return useProgressStore((state) => state.progress);
}

/** Read and update a single problem's progress status. */
export function useProblemProgress() {
  const { progress, setProgress, delProgress } = useProgress();
  return {
    progress,
    setStatus: setProgress,
    clearStatus: delProgress,
  };
}

/** Returns the number of tracked problems on this device. */
export function useTrackedCount() {
  const progress = useProgressStore((state) => state.progress);
  return Object.keys(progress).length;
}

/** Permanently clears all locally saved progress. */
export function useClearProgress() {
  return useProgressStore((state) => state.clearAllProgress);
}
