"use client";

import { SectionDivider } from "@/components/common/SectionDivider";
import {
  CUSTOM_STUDYPLAN_KEYS,
  INTERVIEW_PREP_KEYS,
  LEARNING_PATH_KEYS,
  STUDYPLANS,
} from "@/config/constants";
import {
  defaultTheme,
  studyPlanIcons,
  studyPlanThemes,
} from "@/config/studyPlanThemes";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Gamepad2,
  Lock,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { nextProblem, problemsToNextStar, type QuestMap } from "./engine";
import { useQuestMaps, usePlayerProfile } from "./hooks";
import { PlayerCard, StarRow } from "./PlayerCard";
import { QuestCelebrations } from "./QuestCelebrations";

function planTitle(key: string) {
  return STUDYPLANS[key as keyof typeof STUDYPLANS] ?? key;
}

function WorldCard({ map }: { map: QuestMap }) {
  const Icon = studyPlanIcons[map.planKey] ?? BookOpen;
  const theme = studyPlanThemes[map.planKey] ?? defaultTheme;
  const pct = map.total > 0 ? Math.round((map.solved / map.total) * 100) : 0;
  const bosses = map.worlds.filter((w) => w.boss).length;
  const defeated = map.worlds.filter((w) => w.boss?.solved).length;

  return (
    <Link href={`/quest/${map.planKey}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div
          className="relative flex h-24 items-center gap-3 overflow-hidden px-4"
          style={{ background: theme.gradient }}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20 transition-transform group-hover:scale-110">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 text-white">
            <p className="truncate text-base font-bold">
              {planTitle(map.planKey)}
            </p>
            <p className="text-xs text-white/75">
              {map.worlds.length} 區・{map.stages.length} 關
            </p>
          </div>
          {pct === 100 && (
            <Trophy className="quest-bob absolute right-3 top-3 h-6 w-6 text-amber-300 drop-shadow" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/40 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">星星</p>
              <p className="text-sm font-semibold tabular-nums">
                {map.stars}/{map.maxStars}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">通關</p>
              <p className="text-sm font-semibold tabular-nums">
                {map.clearedStages}/{map.stages.length}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">魔王</p>
              <p className="text-sm font-semibold tabular-nums">
                {defeated}/{bosses}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>
                {map.solved} / {map.total} 題
              </span>
              <span style={{ color: theme.accent }}>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: theme.gradient }}
              />
            </div>
          </div>
          <div
            className="mt-auto inline-flex items-center text-sm font-medium"
            style={{ color: theme.accent }}
          >
            {pct === 100
              ? "重溫地圖"
              : map.solved > 0
                ? "繼續冒險"
                : "進入世界"}
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuestHub() {
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const mapList = useMemo(
    () =>
      Object.keys(STUDYPLANS)
        .map((key) => maps[key]!)
        .filter(Boolean),
    [maps],
  );

  const totals = useMemo(
    () =>
      mapList.reduce(
        (acc, m) => ({
          stars: acc.stars + m.stars,
          maxStars: acc.maxStars + m.maxStars,
        }),
        { stars: 0, maxStars: 0 },
      ),
    [mapList],
  );

  // Resume the most advanced unfinished adventure.
  const resume = useMemo(() => {
    const candidates = mapList
      .filter((m) => m.solved > 0 && m.solved < m.total && m.currentStage)
      .sort((a, b) => b.solved / b.total - a.solved / a.total);
    return candidates[0] ?? null;
  }, [mapList]);

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;

  const groups = [
    ["0x3F 題單", mapList.filter((m) => !CUSTOM_STUDYPLAN_KEYS.has(m.planKey))],
    ["學習路線", mapList.filter((m) => LEARNING_PATH_KEYS.has(m.planKey))],
    ["面試準備", mapList.filter((m) => INTERVIEW_PREP_KEYS.has(m.planKey))],
  ] as const;

  const resumeStage = resume?.currentStage ?? null;
  const resumeProblem = nextProblem(resumeStage);

  return (
    <div className="min-h-screen bg-background font-han">
      <QuestCelebrations />
      <div className="page-shell px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:p-8">
            <div className="space-y-2">
              <h1 className="page-title inline-flex items-center gap-2">
                <Gamepad2 className="h-7 w-7" />
                破關模式
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                每份題單是一個世界，每個章節是一道關卡。AC
                題目收集星星、擊敗各區魔王、升級稱號，一路把題單消完！進度直接沿用題單的「已解題」標記，雲端同步也一起帶走。
              </p>
            </div>
            <PlayerCard
              xp={profile.xp}
              level={profile.level}
              streak={profile.streak}
              totalStars={totals.stars}
              maxStars={totals.maxStars}
            />
          </div>
        </section>

        {resume && resumeStage && (
          <Link
            href={`/quest/${resume.planKey}?stage=${resumeStage.sectionId}`}
            className="group mt-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm transition-colors hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span className="brand-gradient inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
                <Swords className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary">繼續冒險</p>
                <p className="truncate font-semibold">
                  {planTitle(resume.planKey)}・{resumeStage.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resumeStage.stars < 3
                    ? `再 AC ${problemsToNextStar(resumeStage)} 題拿到下一顆星`
                    : "這關已滿星"}
                  {resumeProblem &&
                    `・建議下一題：${resumeProblem.id}. ${resumeProblem.title}`}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center text-sm font-medium text-primary">
              出發
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}

        {groups.map(
          ([label, list]) =>
            list.length > 0 && (
              <div key={label}>
                <SectionDivider label={label} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {list.map((map) => (
                    <WorldCard key={map.planKey} map={map} />
                  ))}
                </div>
              </div>
            ),
        )}

        <SectionDivider
          label={`成就 ${unlockedCount} / ${profile.achievements.length}`}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {profile.achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors",
                a.unlocked
                  ? "border-amber-400/50 bg-amber-50/60 dark:bg-amber-400/10"
                  : "border-border/60 bg-card",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl",
                  a.unlocked ? "bg-amber-400/20" : "bg-muted grayscale",
                )}
                aria-hidden
              >
                {a.unlocked ? (
                  a.icon
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.description}
                </p>
                {!a.unlocked && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.round(a.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <SectionDivider label="遊戲規則" />
        <div className="mb-10 grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
              <StarRow stars={3} /> 星星
            </p>
            每關 AC ⅓ 題得 ★、⅔ 得 ★★、全部 AC 得 ★★★。拿到第一顆星就算通關。
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
              <Lock className="h-4 w-4" /> 解鎖
            </p>
            同一區的關卡依序解鎖；上一區通關一半，下一區就開放。不想照順序？在地圖頁打開「自由探索」。
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
              <Crown className="h-4 w-4 text-amber-500" /> 魔王題
            </p>
            每區分數最高的題目就是魔王，擊敗它額外 +200 XP；整區通關再 +300 XP。
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-primary" /> 經驗值
            </p>
            每題 XP ≈ 分數 ÷ 10（無分數 100 XP），每顆星 +30
            XP。同一題出現在多份題單只算一次。
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestHub;
