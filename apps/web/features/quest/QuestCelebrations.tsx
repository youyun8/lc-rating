"use client";

import { STUDYPLANS } from "@/config/constants";
import { useProblems } from "@/hooks/useProblems";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Confetti } from "./Confetti";
import { titleForLevel } from "./engine";
import { useQuestHydrated, useQuestMaps, usePlayerProfile } from "./hooks";
import { useQuestStore } from "./store";

const MAX_TOASTS = 3;

function starText(stars: number) {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}

/**
 * Watches progress and celebrates new stars, achievements and level-ups with
 * toasts and confetti. Mount it on pages where students mark problems.
 */
export function QuestCelebrations() {
  const hydrated = useQuestHydrated();
  // XP depends on library ratings; comparing before they load would report a
  // level-up the moment they arrive.
  const { isPending: ratingsPending } = useProblems();
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const [burst, setBurst] = useState(0);
  const clearBurst = useCallback(() => setBurst(0), []);

  useEffect(() => {
    if (!hydrated || ratingsPending) return;
    const store = useQuestStore.getState();

    const stars: Record<string, number> = {};
    const stageGains: { title: string; plan: string; stars: number }[] = [];
    for (const map of Object.values(maps)) {
      for (const stage of map.stages) {
        stars[stage.key] = stage.stars;
        if (stage.stars > (store.seenStars[stage.key] ?? 0)) {
          stageGains.push({
            title: stage.title,
            plan: STUDYPLANS[map.planKey as keyof typeof STUDYPLANS] ?? "",
            stars: stage.stars,
          });
        }
      }
    }
    const achievements = profile.achievements
      .filter((a) => a.unlocked)
      .map((a) => a.id);
    const newAchievements = profile.achievements.filter(
      (a) => a.unlocked && !store.seenAchievements.includes(a.id),
    );
    const levelUp = profile.level.level > store.seenLevel;

    const changed =
      !store.initialized ||
      stageGains.length > 0 ||
      newAchievements.length > 0 ||
      profile.level.level !== store.seenLevel ||
      Object.keys(stars).length !== Object.keys(store.seenStars).length ||
      Object.entries(stars).some(([k, v]) => store.seenStars[k] !== v);
    if (!changed) return;

    store.markSeen({ stars, achievements, level: profile.level.level });
    if (!store.initialized) return;

    const events: { title: string; description?: string }[] = [
      ...stageGains.map((g) => ({
        title:
          g.stars === 3
            ? `完美通關！${starText(3)}`
            : `關卡進度 ${starText(g.stars)}`,
        description: `${g.plan}・${g.title}`,
      })),
      ...newAchievements.map((a) => ({
        title: `${a.icon} 解鎖成就「${a.title}」`,
        description: a.description,
      })),
      ...(levelUp
        ? [
            {
              title: `⬆️ 升級！Lv.${profile.level.level}`,
              description:
                titleForLevel(store.seenLevel) !== profile.level.title
                  ? `獲得新稱號「${profile.level.title}」`
                  : `目前稱號「${profile.level.title}」，繼續往下一級前進！`,
            },
          ]
        : []),
    ];

    if (events.length > MAX_TOASTS) {
      const gained = stageGains.length;
      toast.success("冒險進度已更新", {
        description: `${gained} 個關卡拿到新星星、解鎖 ${newAchievements.length} 個成就${
          levelUp ? `，升到 Lv.${profile.level.level}` : ""
        }`,
        duration: 4000,
      });
    } else {
      for (const event of events) {
        toast.success(event.title, {
          description: event.description,
          duration: 3500,
        });
      }
    }

    const bigMoment =
      levelUp ||
      newAchievements.length > 0 ||
      stageGains.some((g) => g.stars === 3);
    if (bigMoment) setBurst(Date.now());
  }, [hydrated, ratingsPending, maps, profile]);

  return burst ? <Confetti burstId={burst} onDone={clearBurst} /> : null;
}
