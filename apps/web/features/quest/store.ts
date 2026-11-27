"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const LC_RATING_QUEST_KEY = "lc-rating-quest";

interface QuestUiState {
  /** Ignore unlock rules and open every stage. */
  freeMode: boolean;
  /** Last star count celebrated per stage key. */
  seenStars: Record<string, number>;
  /** Achievement ids already celebrated. */
  seenAchievements: string[];
  seenLevel: number;
  /**
   * False until the first snapshot is taken, so a returning player isn't
   * flooded with celebrations for everything they did before this feature.
   */
  initialized: boolean;
}

interface QuestUiActions {
  setFreeMode: (value: boolean) => void;
  markSeen: (snapshot: {
    stars: Record<string, number>;
    achievements: string[];
    level: number;
  }) => void;
}

export const useQuestStore = create<QuestUiState & QuestUiActions>()(
  persist(
    (set) => ({
      freeMode: false,
      seenStars: {},
      seenAchievements: [],
      seenLevel: 1,
      initialized: false,
      setFreeMode: (freeMode) => set({ freeMode }),
      markSeen: ({ stars, achievements, level }) =>
        set({
          seenStars: stars,
          seenAchievements: achievements,
          seenLevel: level,
          initialized: true,
        }),
    }),
    { name: LC_RATING_QUEST_KEY, version: 1 },
  ),
);
