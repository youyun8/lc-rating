"use client";

import { ADVENTURE_KEY, LISTED_STUDYPLANS } from "@/config/constants";
import { useProblems } from "@/hooks/useProblems";
import { useProgressStore } from "@/hooks/useProgress";
import type { ProblemMap } from "@/types";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { useEffect, useMemo, useState } from "react";

import {
  buildQuestMap,
  computeAchievements,
  computeStreak,
  computeXp,
  levelFromXp,
  type ProgressMap,
  type QuestMap,
} from "./engine";
import { useQuestStore } from "./store";

export const QUEST_PLAN_KEYS = Object.keys(LISTED_STUDYPLANS);

/** Plans whose top level is a list of chapters rather than worlds. */
const WORLD_DEPTH: Record<string, number> = { [ADVENTURE_KEY]: 2 };

/** Quest maps for every plan, rebuilt whenever progress changes. */
export function useQuestMaps(): Record<string, QuestMap> {
  const progress = useProgressStore((state) => state.progress);
  const freeMode = useQuestStore((state) => state.freeMode);
  // Most 0x3F plans carry no score; borrow the library rating like the tables do.
  const { problemMap } = useProblems();

  return useMemo(
    () => buildAllMaps(progress, freeMode, problemMap),
    [progress, freeMode, problemMap],
  );
}

// Several components (map, celebrations) ask for the same maps on one page;
// share the most recent build instead of walking every plan again.
let lastBuild: {
  progress: ProgressMap;
  freeMode: boolean;
  problemMap: ProblemMap | undefined;
  maps: Record<string, QuestMap>;
} | null = null;

function buildAllMaps(
  progress: ProgressMap,
  freeMode: boolean,
  problemMap: ProblemMap | undefined,
): Record<string, QuestMap> {
  if (
    lastBuild?.progress === progress &&
    lastBuild.freeMode === freeMode &&
    lastBuild.problemMap === problemMap
  ) {
    return lastBuild.maps;
  }
  const ratingOf = (id: string) => problemMap?.[id]?.rating;
  const maps: Record<string, QuestMap> = {};
  for (const key of QUEST_PLAN_KEYS) {
    maps[key] = buildQuestMap(
      key,
      studyPlanDataMap[key],
      progress,
      freeMode,
      ratingOf,
      WORLD_DEPTH[key] ?? 1,
    );
  }
  lastBuild = { progress, freeMode, problemMap, maps };
  return maps;
}

/** Current time, refreshed every minute so streaks roll over at midnight. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function usePlayerProfile(maps: Record<string, QuestMap>) {
  const progress = useProgressStore((state) => state.progress);
  const updatedAt = useProgressStore((state) => state.progressUpdatedAt);
  const now = useNow();

  return useMemo(() => {
    const list = Object.values(maps);
    const xp = computeXp(list);
    const streak = computeStreak(progress, updatedAt ?? {}, now);
    return {
      xp,
      level: levelFromXp(xp),
      streak,
      achievements: computeAchievements(list, streak),
    };
  }, [maps, progress, updatedAt, now]);
}

/**
 * zustand's persist middleware only exists in the browser (there is no
 * localStorage during the static export). Wait until it has rehydrated so the
 * first comparison isn't made against an empty snapshot.
 */
export function useQuestHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const api = useQuestStore.persist;
    if (!api) return;
    if (api.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return api.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}

export const DAILY_GOAL = 3;
