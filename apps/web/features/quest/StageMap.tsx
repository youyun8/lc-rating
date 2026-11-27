"use client";

import { Switch } from "@/components/ui/switch";
import { STUDYPLANS } from "@/config/constants";
import {
  defaultTheme,
  studyPlanIcons,
  studyPlanThemes,
} from "@/config/studyPlanThemes";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Check,
  ChevronRight,
  Crown,
  Lock,
  Swords,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  nextProblem,
  problemsToNextStar,
  type QuestStage,
  type QuestWorld,
} from "./engine";
import { useQuestMaps, usePlayerProfile } from "./hooks";
import { PlayerCard, StarRow } from "./PlayerCard";
import { QuestCelebrations } from "./QuestCelebrations";
import { StageDialog } from "./StageDialog";
import { useQuestStore } from "./store";

/** Horizontal offsets (px) that make the stage path snake left and right. */
const PATH_OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

interface StageNodeProps {
  stage: QuestStage;
  isCurrent: boolean;
  offset: number;
  accent: string;
  gradient: string;
  onSelect: () => void;
}

function StageNode({
  stage,
  isCurrent,
  offset,
  accent,
  gradient,
  onSelect,
}: StageNodeProps) {
  const locked = stage.state === "locked";
  const perfect = stage.state === "perfect";

  return (
    <div
      className="flex translate-x-[calc(var(--x)*0.55)] flex-col items-center sm:translate-x-[var(--x)]"
      style={{ "--x": `${offset}px` } as React.CSSProperties}
    >
      {isCurrent && (
        <span
          className="quest-bob mb-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow"
          style={{ background: accent }}
        >
          挑戰這關！
        </span>
      )}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`第 ${stage.index + 1} 關 ${stage.title}，${stage.stars} 星${
          locked ? "，未解鎖" : ""
        }`}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full border-b-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40",
          locked &&
            "border-muted-foreground/30 bg-muted text-muted-foreground shadow-none",
          perfect &&
            "border-amber-600 bg-gradient-to-br from-amber-300 to-amber-500",
          isCurrent && "quest-node-current",
        )}
        style={
          locked || perfect
            ? undefined
            : ({
                background: gradient,
                borderColor: "rgb(0 0 0 / 0.25)",
                opacity: stage.state === "open" && !isCurrent ? 0.85 : 1,
                "--quest-ring": `${accent}88`,
              } as React.CSSProperties)
        }
      >
        {locked ? (
          <Lock className="h-6 w-6" />
        ) : perfect ? (
          <Crown className="h-7 w-7 drop-shadow" />
        ) : stage.state === "cleared" ? (
          <Check className="h-7 w-7" strokeWidth={3} />
        ) : (
          <span className="tabular-nums">{stage.index + 1}</span>
        )}
        {stage.solved > 0 && stage.stars < 3 && (
          <svg
            className="pointer-events-none absolute -inset-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)] -rotate-90"
            viewBox="0 0 36 36"
            aria-hidden
          >
            <circle
              cx="18"
              cy="18"
              r="16.5"
              fill="none"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${(stage.solved / stage.total) * 103.7} 103.7`}
            />
          </svg>
        )}
      </button>
      <StarRow
        stars={stage.stars}
        className="mt-1.5 text-muted-foreground"
        size="h-4 w-4"
      />
      <p
        className={cn(
          "mt-1 line-clamp-2 w-40 text-center text-xs leading-snug",
          locked ? "text-muted-foreground" : "font-medium text-foreground",
        )}
      >
        {stage.title}
      </p>
      <p className="text-[11px] text-muted-foreground tabular-nums">
        {stage.solved}/{stage.total}
      </p>
    </div>
  );
}

function WorldSection({
  world,
  currentKey,
  accent,
  gradient,
  onSelect,
}: {
  world: QuestWorld;
  currentKey: string | null;
  accent: string;
  gradient: string;
  onSelect: (stage: QuestStage) => void;
}) {
  const pct =
    world.total > 0 ? Math.round((world.solved / world.total) * 100) : 0;
  const bossStage = world.boss
    ? world.stages.find((s) => s.problems.some((p) => p.id === world.boss!.id))
    : undefined;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-card shadow-sm",
        world.cleared ? "border-amber-400/50" : "border-border/60",
      )}
    >
      <header className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: world.unlocked ? gradient : undefined }}
          >
            {world.unlocked ? (
              `W${world.index + 1}`
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold sm:text-lg">
              {world.title}
            </h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              ★ {world.stars}/{world.maxStars}・{world.solved}/{world.total}{" "}
              題・{pct}%{world.cleared && "・區域制霸 🏰"}
            </p>
          </div>
        </div>
        {world.boss && (
          <button
            type="button"
            onClick={() => bossStage && onSelect(bossStage)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60",
              world.boss.solved
                ? "border-amber-400/60 bg-amber-400/10"
                : "border-border/60",
            )}
          >
            <Crown
              className={cn(
                "h-5 w-5 shrink-0",
                world.boss.solved ? "text-amber-500" : "text-muted-foreground",
              )}
            />
            <span className="min-w-0">
              <span className="block font-semibold">
                {world.boss.solved ? "魔王已擊敗" : "本區魔王"}
                {world.boss.rating !== null && (
                  <span className="ml-1 tabular-nums text-muted-foreground">
                    {Math.round(world.boss.rating)}
                  </span>
                )}
              </span>
              <span className="block max-w-[14rem] truncate text-muted-foreground">
                {world.boss.id}. {world.boss.title}
              </span>
            </span>
          </button>
        )}
      </header>

      {!world.unlocked && (
        <p className="mx-4 mt-4 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground sm:mx-5">
          上一區通關一半的關卡後解鎖；也可以打開「自由探索」直接挑戰。
        </p>
      )}

      <div className="flex flex-col items-center gap-6 px-4 py-6 sm:py-8">
        {world.stages.map((stage, i) => (
          <StageNode
            key={stage.key}
            stage={stage}
            isCurrent={stage.key === currentKey}
            offset={PATH_OFFSETS[i % PATH_OFFSETS.length]!}
            accent={accent}
            gradient={gradient}
            onSelect={() => onSelect(stage)}
          />
        ))}
      </div>
    </section>
  );
}

function StageMap({ plan }: { plan: string }) {
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const freeMode = useQuestStore((state) => state.freeMode);
  const setFreeMode = useQuestStore((state) => state.setFreeMode);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const map = maps[plan];
  const theme = studyPlanThemes[plan] ?? defaultTheme;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const title = STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? plan;

  const totals = useMemo(
    () =>
      Object.values(maps).reduce(
        (acc, m) => ({
          stars: acc.stars + m.stars,
          maxStars: acc.maxStars + m.maxStars,
        }),
        { stars: 0, maxStars: 0 },
      ),
    [maps],
  );

  // Deep link from the hub: /quest/<plan>?stage=<sectionId>
  useEffect(() => {
    const stageId = new URLSearchParams(window.location.search).get("stage");
    if (stageId) setSelectedKey(`${plan}:${stageId}`);
  }, [plan]);

  if (!map || map.stages.length === 0) {
    return (
      <div className="page-shell px-3 py-10">
        <div className="empty-state">
          <p className="text-lg font-medium text-foreground">找不到這個世界</p>
          <Link href="/quest" className="mt-3 text-primary hover:underline">
            回到破關模式
          </Link>
        </div>
      </div>
    );
  }

  const selected = map.stages.find((s) => s.key === selectedKey) ?? null;
  const selectedBoss = selected ? map.worlds[selected.worldIndex]?.boss : null;
  const current = map.currentStage;
  const suggested = nextProblem(current);
  const pct = map.total > 0 ? Math.round((map.solved / map.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background font-han">
      <QuestCelebrations />
      <div className="page-shell px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        <div
          className="motion-rise relative overflow-hidden rounded-[1.75rem] text-white shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)]"
          style={{ background: theme.gradient }}
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative p-4 sm:p-6 md:p-8">
            <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              <Link href="/quest" className="hover:text-white">
                破關模式
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-white">{title}</span>
            </nav>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm text-white/80 tabular-nums">
                    ★ {map.stars}/{map.maxStars}・通關 {map.clearedStages}/
                    {map.stages.length} 關・{map.solved}/{map.total} 題（{pct}
                    %）
                  </p>
                  <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm ring-1 ring-white/20">
                  <Switch checked={freeMode} onCheckedChange={setFreeMode} />
                  自由探索
                </label>
                <Link
                  href={`/studyplan/${plan}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm ring-1 ring-white/20 transition-colors hover:bg-white/25"
                >
                  <TableProperties className="h-4 w-4" />
                  表格檢視
                </Link>
              </div>
            </div>
          </div>
        </div>

        <PlayerCard
          className="mt-4"
          xp={profile.xp}
          level={profile.level}
          streak={profile.streak}
          totalStars={totals.stars}
          maxStars={totals.maxStars}
        />

        {current && (
          <button
            type="button"
            onClick={() => setSelectedKey(current.key)}
            className="group mt-4 flex w-full flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left shadow-sm transition-colors hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: theme.gradient }}
              >
                <Swords className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary">
                  目前任務・第 {current.index + 1} 關
                </p>
                <p className="truncate font-semibold">{current.title}</p>
                <p className="text-xs text-muted-foreground">
                  再 AC {problemsToNextStar(current)} 題拿到下一顆星
                  {suggested && `・建議：${suggested.id}. ${suggested.title}`}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary">開始挑戰 →</span>
          </button>
        )}
        {!current && (
          <div className="mt-4 rounded-2xl border border-amber-400/50 bg-amber-400/10 p-5 text-center">
            <p className="text-2xl">🏆</p>
            <p className="mt-1 font-semibold">
              全部關卡三星完成！你已經制霸這個世界。
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-6 pb-10 lg:grid-cols-2 2xl:grid-cols-3">
          {map.worlds.map((world) => (
            <WorldSection
              key={world.index}
              world={world}
              currentKey={current?.key ?? null}
              accent={theme.accent}
              gradient={theme.gradient}
              onSelect={(stage) => setSelectedKey(stage.key)}
            />
          ))}
        </div>
      </div>

      <StageDialog
        planKey={plan}
        stage={selected}
        bossId={selectedBoss?.id ?? null}
        accent={theme.accent}
        onOpenChange={(open) => {
          if (!open) setSelectedKey(null);
        }}
      />
    </div>
  );
}

export default StageMap;
