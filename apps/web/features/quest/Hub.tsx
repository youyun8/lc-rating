"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import {
  ADVENTURE_KEY,
  LISTED_STUDYPLANS,
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
  ChevronDown,
  Crown,
  Gamepad2,
  Lock,
  Star,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  nextProblem,
  problemsToNextStar,
  type Achievement,
  type QuestMap,
} from "./engine";
import { useQuestMaps, usePlayerProfile } from "./hooks";
import { PlayerCard, StarRow } from "./PlayerCard";
import { QuestCelebrations } from "./QuestCelebrations";
import { regionLabel } from "./StageMap";

function planTitle(key: string) {
  return STUDYPLANS[key as keyof typeof STUDYPLANS] ?? key;
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 mt-10 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** The 12 topics of 冒險路線 as map regions. */
function RegionGrid({ map }: { map: QuestMap }) {
  const theme = studyPlanThemes[map.planKey] ?? defaultTheme;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {map.regions.map((region) => {
        const pct = region.total > 0 ? region.solved / region.total : 0;
        const bosses = region.worlds.filter((w) => w.boss).length;
        const defeated = region.worlds.filter((w) => w.boss?.solved).length;
        const done = region.solved === region.total && region.total > 0;
        return (
          <Link
            key={region.index}
            href={`/quest/${map.planKey}?region=${region.index}`}
            className={cn(
              "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
              done ? "border-gold/60" : "border-border/70",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-num text-3xl font-bold leading-none text-muted-foreground/30 transition-colors group-hover:text-primary/40">
                {String(region.index + 1).padStart(2, "0")}
              </span>
              <ProgressRing
                value={pct}
                size={40}
                stroke={4}
                color={done ? "var(--gold)" : theme.accent}
              >
                <span className="font-num text-[10px] font-bold">
                  {Math.round(pct * 100)}
                </span>
              </ProgressRing>
            </div>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug">
              {regionLabel(region.title)}
            </p>
            <div className="font-num flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-gold text-gold" />
                {region.stars}/{region.maxStars}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Crown className="h-3 w-3 text-gold" />
                {defeated}/{bosses}
              </span>
              <span className="ml-auto">
                {region.solved}/{region.total}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function WorldTile({ map }: { map: QuestMap }) {
  const Icon = studyPlanIcons[map.planKey] ?? BookOpen;
  const theme = studyPlanThemes[map.planKey] ?? defaultTheme;
  const pct = map.total > 0 ? map.solved / map.total : 0;
  const done = pct === 1;
  return (
    <Link
      href={`/quest/${map.planKey}`}
      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <ProgressRing
        value={pct}
        size={52}
        stroke={4}
        color={done ? "var(--gold)" : theme.accent}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: theme.gradient }}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{planTitle(map.planKey)}</p>
        <p className="font-num mt-0.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {map.stars}/{map.maxStars}
          </span>
          <span>
            {map.solved}/{map.total} 題
          </span>
        </p>
      </div>
      {done ? (
        <Trophy className="quest-bob h-5 w-5 shrink-0 text-gold" />
      ) : (
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

function Medal({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className="flex flex-col items-center text-center"
      title={achievement.description}
    >
      <ProgressRing
        value={achievement.unlocked ? 1 : achievement.progress}
        size={72}
        stroke={5}
        color={achievement.unlocked ? "var(--gold)" : "var(--muted-foreground)"}
      >
        <span
          className={cn(
            "flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full text-2xl",
            achievement.unlocked
              ? "bg-gold-soft shadow-inner"
              : "bg-muted grayscale",
          )}
        >
          {achievement.unlocked ? (
            achievement.icon
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </span>
      </ProgressRing>
      <p
        className={cn(
          "mt-2 text-xs font-bold",
          !achievement.unlocked && "text-muted-foreground",
        )}
      >
        {achievement.title}
      </p>
      <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
        {achievement.description}
      </p>
    </div>
  );
}

function QuestHub() {
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const mapList = useMemo(
    () =>
      Object.keys(LISTED_STUDYPLANS)
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

  const adventure = maps[ADVENTURE_KEY];
  // Resume the adventure first, then the most advanced unfinished world.
  const resume = useMemo(() => {
    const started = mapList.filter(
      (m) => m.solved > 0 && m.solved < m.total && m.currentStage,
    );
    return (
      started.find((m) => m.planKey === ADVENTURE_KEY) ??
      started.sort((a, b) => b.solved / b.total - a.solved / a.total)[0] ??
      (adventure?.currentStage ? adventure : null)
    );
  }, [mapList, adventure]);
  const resumeStage = resume?.currentStage ?? null;
  const resumeProblem = nextProblem(resumeStage);
  const resumeTheme = resume
    ? (studyPlanThemes[resume.planKey] ?? defaultTheme)
    : defaultTheme;

  const worlds = mapList.filter((m) => m.planKey !== ADVENTURE_KEY);
  const unlocked = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background font-han">
      <QuestCelebrations />
      <div className="page-shell px-3 pb-24 pt-6 sm:px-4 md:px-6 xl:px-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <Gamepad2 className="h-7 w-7 text-primary" />
              破關模式
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              每份題單是一個世界，每個小節是一道關卡。AC
              收集星星、擊敗魔王、升級稱號。
            </p>
          </div>
        </div>

        <PlayerCard
          xp={profile.xp}
          level={profile.level}
          streak={profile.streak}
          totalStars={totals.stars}
          maxStars={totals.maxStars}
        />

        {resume && resumeStage && (
          <Link
            href={`/quest/${resume.planKey}?stage=${resumeStage.sectionId}`}
            className="group relative mt-4 block overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-7"
            style={{ background: resumeTheme.gradient }}
          >
            <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
                  <Swords className="h-4 w-4" />
                  {resume.solved > 0 ? "繼續冒險" : "開始冒險"} ·{" "}
                  {planTitle(resume.planKey)}
                </p>
                <p className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                  {resumeStage.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
                  <StarRow
                    stars={resumeStage.stars}
                    size="h-5 w-5"
                    className="text-white"
                  />
                  <span>
                    再 AC {problemsToNextStar(resumeStage)} 題拿下一顆星
                  </span>
                  {resumeProblem && (
                    <span className="truncate">
                      建議：{resumeProblem.id}. {resumeProblem.title}
                    </span>
                  )}
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-bold text-foreground shadow-md transition-transform group-hover:translate-x-1">
                出發
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </Link>
        )}

        {adventure && adventure.regions.length > 0 && (
          <>
            <SectionHeading
              title="冒險路線"
              hint={`依靈茶分類的精選路線 · ${adventure.solved}/${adventure.total} 題`}
            />
            <RegionGrid map={adventure} />
          </>
        )}

        <SectionHeading title="靈茶題單世界" hint="每份題單都是一張完整地圖" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {worlds.map((map) => (
            <WorldTile key={map.planKey} map={map} />
          ))}
        </div>

        <SectionHeading
          title="成就"
          hint={`已解鎖 ${unlocked} / ${profile.achievements.length}`}
        />
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 rounded-3xl border border-border/70 bg-card p-5 sm:grid-cols-5 lg:grid-cols-8">
          {[...profile.achievements]
            .sort(
              (a, b) =>
                Number(b.unlocked) - Number(a.unlocked) ||
                b.progress - a.progress,
            )
            .map((a) => (
              <Medal key={a.id} achievement={a} />
            ))}
        </div>

        <details className="group mt-6 rounded-2xl border border-border/70 bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold">
            遊戲規則
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
            <p>
              <strong className="text-foreground">星星：</strong>
              每關 AC ⅓ 題得 ★、⅔ 得 ★★、全部 AC 得 ★★★。拿到第一顆星就算通關。
            </p>
            <p>
              <strong className="text-foreground">解鎖：</strong>
              區內關卡依序開放，上一區通關一半就開下一區；冒險路線每個主題各自從第一區開始。也可以開「自由探索」。
            </p>
            <p>
              <strong className="text-foreground">魔王：</strong>
              每區分數最高的題目，擊敗 +200 XP；整區通關再 +300 XP。
            </p>
            <p>
              <strong className="text-foreground">經驗值：</strong>
              每題約「分數 ÷ 10」XP（無分數 100），每顆星 +30。同一題只算一次。
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default QuestHub;
