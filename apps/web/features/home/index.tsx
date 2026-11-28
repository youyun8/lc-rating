"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import { ADVENTURE_KEY } from "@/config/constants";
import { defaultTheme, studyPlanThemes } from "@/config/studyPlanThemes";
import {
  activityCalendar,
  nextProblem,
  problemsToNextStar,
  SOLVED_KEY,
  type QuestProblem,
} from "@/features/quest/engine";
import {
  DAILY_GOAL,
  useQuestMaps,
  usePlayerProfile,
} from "@/features/quest/hooks";
import { LevelBadge, StarRow } from "@/features/quest/PlayerCard";
import { QuestCelebrations } from "@/features/quest/QuestCelebrations";
import { regionLabel } from "@/features/quest/StageMap";
import { useProblemProgress, useRecentProgress } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { useProgressStore } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import { ratingInfo } from "@/components/common/RatingCircle";
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Check,
  ExternalLink,
  Flame,
  GraduationCap,
  Library,
  ListChecks,
  Star,
  Swords,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function greeting(hour: number) {
  if (hour < 5) return "夜深了";
  if (hour < 11) return "早安";
  if (hour < 14) return "午安";
  if (hour < 18) return "下午好";
  return "晚安";
}

/** Client clock, so the static export doesn't bake in the build time. */
function useClientNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

function CardTitle({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-bold">
        <Icon className="h-4.5 w-4.5 text-primary" />
        {title}
      </h2>
      {action}
    </div>
  );
}

function ProblemRow({ problem }: { problem: QuestProblem }) {
  const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
  const { setStatus, clearStatus } = useProblemProgress();
  return (
    <li className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        onClick={() =>
          problem.solved
            ? clearStatus(problem.id)
            : setStatus(problem.id, SOLVED_KEY)
        }
        aria-label={problem.solved ? "取消已解題" : "標記為已解題"}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          problem.solved
            ? "border-success bg-success text-white"
            : "border-border text-transparent hover:border-success hover:text-success",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
      <a
        href={getLeetCodeProblemUrl(problem.slug, linkLanguage)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex min-w-0 flex-1 items-center gap-1 text-sm font-medium hover:underline",
          problem.solved && "text-muted-foreground line-through",
        )}
      >
        <span className="truncate">
          <span className="font-num text-muted-foreground">{problem.id}.</span>{" "}
          {problem.title}
        </span>
        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-60" />
      </a>
      {problem.rating !== null && (
        <span
          className="font-num shrink-0 text-xs font-semibold"
          style={{ color: ratingInfo(problem.rating).color }}
        >
          {Math.round(problem.rating)}
        </span>
      )}
    </li>
  );
}

const HEAT_LEVELS = [0, 1, 2, 4];

function ActivityHeatmap() {
  const progress = useProgressStore((state) => state.progress);
  const updatedAt = useProgressStore((state) => state.progressUpdatedAt);
  const now = useClientNow();
  const days = useMemo(
    () =>
      now ? activityCalendar(progress, updatedAt ?? {}, 20, now.getTime()) : [],
    [progress, updatedAt, now],
  );
  const total = days.reduce((acc, d) => acc + d.solved, 0);
  const activeDays = days.filter((d) => d.solved > 0).length;
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const level = (solved: number) =>
    HEAT_LEVELS.filter((threshold) => solved > threshold).length;

  return (
    <Card>
      <CardTitle
        icon={CalendarRange}
        title="刷題足跡"
        action={
          <span className="font-num text-xs text-muted-foreground">
            近 20 週 · {total} 題 · {activeDays} 天
          </span>
        }
      />
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
        }}
      >
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-rows-7 gap-[3px]">
            {week.map((day) => (
              <span
                key={day.key}
                title={`${day.date.getMonth() + 1}/${day.date.getDate()}：${day.solved} 題`}
                className="aspect-square w-full rounded-[3px] bg-muted sm:rounded-[4px]"
                style={
                  day.solved > 0
                    ? {
                        background: `color-mix(in oklab, var(--primary) ${25 + level(day.solved) * 25}%, transparent)`,
                      }
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        少
        {[0, 1, 2, 3].map((l) => (
          <span
            key={l}
            className="h-3 w-3 rounded-[3px] bg-muted"
            style={
              l > 0
                ? {
                    background: `color-mix(in oklab, var(--primary) ${25 + l * 25}%, transparent)`,
                  }
                : undefined
            }
          />
        ))}
        多
      </div>
    </Card>
  );
}

const QUICK_LINKS: {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { href: "/studyplan", label: "題單", hint: "靈茶分類題單", icon: ListChecks },
  { href: "/lecture", label: "講義", hint: "觀念與模板", icon: GraduationCap },
  { href: "/contest", label: "競賽", hint: "歷屆週賽分級", icon: Trophy },
  { href: "/problemset", label: "題庫", hint: "依分數篩題", icon: Library },
  { href: "/handbook", label: "手冊", hint: "面試與競賽手冊", icon: BookOpen },
  { href: "/training", label: "集訓", hint: "十二週計畫", icon: CalendarRange },
];

function HomeDashboard() {
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const recent = useRecentProgress(6);
  const now = useClientNow();

  const adventure = maps[ADVENTURE_KEY];
  const stage = adventure?.currentStage ?? null;
  const theme = studyPlanThemes[ADVENTURE_KEY] ?? defaultTheme;

  // Today's picks: the next unsolved problems of the current stage, plus
  // anything solved today from it so ticking one off keeps it on screen.
  const picks = useMemo(() => {
    if (!stage) return [];
    const unsolved = stage.problems.filter((p) => !p.solved && !p.isPremium);
    return unsolved.slice(0, DAILY_GOAL);
  }, [stage]);
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    setShown((prev) => {
      const ids = new Set(prev);
      for (const p of picks) ids.add(p.id);
      return prev.length === 0 ? picks.map((p) => p.id) : [...ids].slice(-6);
    });
  }, [picks]);
  const pickProblems = (stage?.problems ?? []).filter((p) =>
    shown.includes(p.id),
  );

  const dailyDone = Math.min(profile.streak.solvedToday, DAILY_GOAL);
  const suggested = nextProblem(stage);
  const hour = now?.getHours() ?? 12;

  const headline = profile.streak.activeToday
    ? dailyDone >= DAILY_GOAL
      ? "今日任務完成！要不要再挑戰一關？"
      : `今天已 AC ${profile.streak.solvedToday} 題，再 ${DAILY_GOAL - dailyDone} 題完成今日任務。`
    : profile.streak.streak > 0
      ? `連續 ${profile.streak.streak} 天了，今天 AC 一題就能延續 🔥`
      : "今天從一題開始，點燃你的連續紀錄。";

  return (
    <div className="min-h-screen bg-background font-han">
      <QuestCelebrations />
      <div className="page-shell px-3 pb-24 pt-6 sm:px-4 md:px-6 xl:px-8">
        <header className="mb-6">
          <p className="font-num text-xs text-muted-foreground">
            {now
              ? now.toLocaleDateString("zh-TW", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })
              : " "}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting(hour)}，{profile.level.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {headline}
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-5">
            {/* Today's quest */}
            <section
              className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-6"
              style={{ background: theme.gradient }}
            >
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <ProgressRing
                  value={dailyDone / DAILY_GOAL}
                  size={96}
                  stroke={9}
                  color="white"
                  trackClassName="stroke-white/25"
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-num text-3xl font-bold">
                      {dailyDone}
                    </span>
                    <span className="font-num text-xs text-white/75">
                      / {DAILY_GOAL}
                    </span>
                  </span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                    今日任務
                  </p>
                  {stage ? (
                    <>
                      <p className="mt-1 text-2xl font-bold leading-tight">
                        {stage.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
                        <StarRow
                          stars={stage.stars}
                          size="h-4.5 w-4.5"
                          className="text-white"
                        />
                        <span>再 {problemsToNextStar(stage)} 題拿下一顆星</span>
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-xl font-bold">
                      冒險路線已全部三星 🏆
                    </p>
                  )}
                </div>
                {stage && (
                  <Link
                    href={`/quest/${ADVENTURE_KEY}?stage=${stage.sectionId}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 font-bold text-foreground shadow-md transition-transform hover:translate-x-0.5"
                  >
                    <Swords className="h-4.5 w-4.5" />
                    進入關卡
                  </Link>
                )}
              </div>
            </section>

            {pickProblems.length > 0 && (
              <Card>
                <CardTitle
                  icon={Swords}
                  title="今天就從這幾題開始"
                  action={
                    suggested && (
                      <span className="text-xs text-muted-foreground">
                        依分數由易到難
                      </span>
                    )
                  }
                />
                <ul className="-my-1 divide-y divide-border/60">
                  {pickProblems.map((problem) => (
                    <ProblemRow key={problem.id} problem={problem} />
                  ))}
                </ul>
              </Card>
            )}

            <ActivityHeatmap />

            {adventure && (
              <Card>
                <CardTitle
                  icon={ListChecks}
                  title="冒險路線進度"
                  action={
                    <Link
                      href="/quest"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      世界地圖
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  }
                />
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {adventure.regions.map((region) => {
                    const pct =
                      region.total > 0 ? region.solved / region.total : 0;
                    return (
                      <Link
                        key={region.index}
                        href={`/quest/${ADVENTURE_KEY}?region=${region.index}`}
                        className="group flex items-center gap-3"
                      >
                        <span className="font-num w-6 text-right text-xs text-muted-foreground">
                          {String(region.index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate font-medium group-hover:text-primary">
                              {regionLabel(region.title)}
                            </span>
                            <span className="font-num shrink-0 text-[11px] text-muted-foreground">
                              {region.solved}/{region.total}
                            </span>
                          </span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full transition-[width] duration-700"
                              style={{
                                width: `${pct * 100}%`,
                                background: theme.gradient,
                              }}
                            />
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <aside className="min-w-0 space-y-5">
            <Card className="text-center">
              <div className="flex justify-center">
                <LevelBadge level={profile.level} size={96} />
              </div>
              <p className="mt-3 text-lg font-bold">{profile.level.title}</p>
              <p className="font-num text-xs text-muted-foreground">
                {profile.xp.toLocaleString()} XP · 再{" "}
                {(
                  profile.level.xpForNext - profile.level.xpIntoLevel
                ).toLocaleString()}{" "}
                升級
              </p>
              <div className="mt-4 grid grid-cols-3 divide-x divide-border/70 rounded-2xl bg-muted/50 py-3">
                <div>
                  <Flame
                    className={cn(
                      "mx-auto h-5 w-5",
                      profile.streak.activeToday
                        ? "fill-streak/25 text-streak"
                        : "text-muted-foreground",
                    )}
                  />
                  <p className="font-num mt-1 text-lg font-bold">
                    {profile.streak.streak}
                  </p>
                  <p className="text-[11px] text-muted-foreground">連續天數</p>
                </div>
                <div>
                  <Star className="mx-auto h-5 w-5 fill-gold text-gold" />
                  <p className="font-num mt-1 text-lg font-bold">
                    {Object.values(maps).reduce((a, m) => a + m.stars, 0)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">星星</p>
                </div>
                <div>
                  <Trophy className="mx-auto h-5 w-5 text-xp" />
                  <p className="font-num mt-1 text-lg font-bold">
                    {profile.achievements.filter((a) => a.unlocked).length}
                  </p>
                  <p className="text-[11px] text-muted-foreground">成就</p>
                </div>
              </div>
              <Link
                href="/quest"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/70 py-2 text-sm font-semibold hover:bg-muted"
              >
                破關模式
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card>
              <CardTitle icon={BookOpen} title="快速前往" />
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ href, label, hint, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group rounded-2xl border border-border/70 p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-bold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{hint}</p>
                  </Link>
                ))}
              </div>
            </Card>

            {recent.length > 0 && (
              <Card>
                <CardTitle icon={CalendarRange} title="最近更新" />
                <ul className="space-y-2.5">
                  {recent.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: item.statusColor }}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-num text-muted-foreground">
                          {item.id}.
                        </span>{" "}
                        {/* Pre-contest problems aren't in the rating library. */}
                        {item.title !== item.id ? item.title : ""}
                      </span>
                      <span
                        className="shrink-0 text-[11px] font-medium"
                        style={{ color: item.statusColor }}
                      >
                        {item.statusLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default HomeDashboard;
