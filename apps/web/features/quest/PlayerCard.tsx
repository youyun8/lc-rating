"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import { cn } from "@/lib/utils";
import { Flame, Star } from "lucide-react";

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
              ? "fill-gold text-gold"
              : "fill-transparent text-current opacity-30",
          )}
        />
      ))}
    </span>
  );
}

/** Level number inside an XP ring. */
export function LevelBadge({
  level,
  size = 56,
  className,
}: {
  level: PlayerLevel;
  size?: number;
  className?: string;
}) {
  return (
    <ProgressRing
      value={level.xpIntoLevel / level.xpForNext}
      size={size}
      stroke={Math.max(3, size / 14)}
      color="var(--xp)"
      trackClassName="stroke-xp-soft"
      className={className}
      label={`Lv.${level.level}`}
    >
      <span
        className="flex flex-col items-center leading-none"
        style={{ fontSize: size * 0.32 }}
      >
        <span className="text-[0.45em] font-semibold uppercase tracking-wider text-xp">
          Lv
        </span>
        <span className="font-num font-bold text-foreground">
          {level.level}
        </span>
      </span>
    </ProgressRing>
  );
}

interface PlayerHudProps {
  xp: number;
  level: PlayerLevel;
  streak: StreakInfo;
  totalStars: number;
  maxStars: number;
  className?: string;
}

/** One-line heads-up display: level, XP, streak, today's quest and stars. */
export function PlayerCard({
  xp,
  level,
  streak,
  totalStars,
  maxStars,
  className,
}: PlayerHudProps) {
  const dailyDone = Math.min(streak.solvedToday, DAILY_GOAL);
  const levelPct = (level.xpIntoLevel / level.xpForNext) * 100;

  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]",
        className,
      )}
    >
      <div className="flex items-center gap-3.5 bg-card p-3.5 sm:p-4">
        <LevelBadge level={level} size={54} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-bold">{level.title}</p>
            <p className="font-num shrink-0 text-xs text-muted-foreground">
              {xp.toLocaleString()} XP
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-xp-soft">
            <div
              className="h-full rounded-full bg-xp transition-[width] duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
          <p className="font-num mt-1 text-[11px] text-muted-foreground">
            再 {(level.xpForNext - level.xpIntoLevel).toLocaleString()} XP 升到
            Lv.{level.level + 1}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px sm:contents">
        <HudCell
          label="連續天數"
          hint={
            streak.activeToday
              ? "今天已點燃"
              : streak.streak > 0
                ? "今天 AC 一題延續"
                : "AC 一題開始累積"
          }
        >
          <Flame
            className={cn(
              "h-6 w-6",
              streak.activeToday
                ? "fill-streak/25 text-streak"
                : "text-muted-foreground/60",
            )}
          />
          <span className="font-num text-2xl font-bold">{streak.streak}</span>
          <span className="text-xs text-muted-foreground">天</span>
        </HudCell>

        <HudCell
          label="今日任務"
          hint={
            dailyDone >= DAILY_GOAL ? "完成！明天見" : `AC ${DAILY_GOAL} 題`
          }
        >
          <ProgressRing
            value={dailyDone / DAILY_GOAL}
            size={30}
            stroke={4}
            color="var(--success)"
          />
          <span className="font-num text-2xl font-bold">{dailyDone}</span>
          <span className="font-num text-xs text-muted-foreground">
            /{DAILY_GOAL}
          </span>
        </HudCell>

        <HudCell label="星星" hint="⅓・⅔・全部 AC 各一顆">
          <Star className="h-6 w-6 fill-gold text-gold" />
          <span className="font-num text-2xl font-bold">{totalStars}</span>
          <span className="font-num text-xs text-muted-foreground">
            /{maxStars}
          </span>
        </HudCell>
      </div>
    </div>
  );
}

function HudCell({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center bg-card px-3 py-3 sm:px-4">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">{children}</div>
      <p className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">
        {hint}
      </p>
    </div>
  );
}
