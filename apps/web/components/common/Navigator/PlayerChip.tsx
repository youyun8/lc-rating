"use client";

import { useQuestMaps, usePlayerProfile } from "@/features/quest/hooks";
import { LevelBadge } from "@/features/quest/PlayerCard";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function PlayerChipInner({ className }: { className?: string }) {
  const maps = useQuestMaps();
  const { level, xp, streak } = usePlayerProfile(maps);
  return (
    <Link
      href="/quest"
      title={`Lv.${level.level} ${level.title} · ${xp.toLocaleString()} XP`}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border/70 bg-card py-0.5 pl-0.5 pr-2.5 transition-colors hover:border-xp/50 hover:bg-xp-soft/60",
        className,
      )}
    >
      <LevelBadge level={level} size={30} />
      <Flame
        className={cn(
          "h-4 w-4",
          streak.activeToday
            ? "fill-streak/25 text-streak"
            : "text-muted-foreground/60",
        )}
      />
      <span className="font-num text-sm font-bold">{streak.streak}</span>
    </Link>
  );
}

/**
 * Level and streak, always one click from 破關模式. Rendered after mount:
 * progress lives in localStorage, so the static HTML can't know it.
 */
export function PlayerChip({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={cn("h-8 w-20", className)} />;
  return <PlayerChipInner className={className} />;
}
