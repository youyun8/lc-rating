"use client";

import { cn } from "@/lib/utils";
import { Flame, Sparkles, Star, Target } from "lucide-react";

import type { PlayerLevel, StreakInfo } from "./engine";
import { DAILY_GOAL } from "./hooks";

export function StarRow({
  stars,
  className,
  size = "h-3.5 w-3.5",
}: {
  stars: number;
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${stars} / 3 星`}
    >
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          className={cn(
            size,
            i < stars
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-current opacity-35",
          )}
        />
      ))}
    </span>
  );
}

interface PlayerCardProps {
  xp: number;
  level: PlayerLevel;
  streak: StreakInfo;
  totalStars: number;
  maxStars: number;
  className?: string;
}

/** Level, XP bar, streak and today's quest in one compact card. */
export function PlayerCard({
  xp,
  level,
  streak,
  totalStars,
  maxStars,
  className,
}: PlayerCardProps) {
  const levelPct = Math.round((level.xpIntoLevel / level.xpForNext) * 100);
  const dailyDone = Math.min(streak.solvedToday, DAILY_GOAL);
  const dailyPct = Math.round((dailyDone / DAILY_GOAL) * 100);

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]",
        className,
      )}
    >
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="brand-gradient flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-sm">
            <span className="text-[10px] font-semibold uppercase leading-none opacity-80">
              Lv
            </span>
            <span className="text-xl font-bold leading-tight tabular-nums">
              {level.level}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">{level.title}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              總經驗 {xp.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>升級進度</span>
            <span>
              {level.xpIntoLevel.toLocaleString()} /{" "}
              {level.xpForNext.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="brand-gradient h-full rounded-full transition-all duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Flame
            className={cn(
              "h-4 w-4",
              streak.activeToday ? "text-orange-500" : "text-muted-foreground",
            )}
          />
          連續天數
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {streak.streak}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            天
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {streak.activeToday
            ? "今天已點燃火焰 🔥"
            : streak.streak > 0
              ? "今天 AC 一題就能延續！"
              : "今天 AC 一題開始累積"}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Target className="h-4 w-4 text-emerald-500" />
          今日任務
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {dailyDone}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {DAILY_GOAL} 題
          </span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4 text-amber-500" />
          收集星星
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {totalStars}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {maxStars}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          每關完成 ⅓、⅔、全部各得一星
        </p>
      </div>
    </div>
  );
}
