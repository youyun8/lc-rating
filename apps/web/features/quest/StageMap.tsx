"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import { Switch } from "@/components/ui/switch";
import { STUDYPLANS } from "@/config/constants";
import {
  defaultTheme,
  studyPlanIcons,
  studyPlanThemes,
} from "@/config/studyPlanThemes";
import { useProblemProgress } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { cn } from "@/lib/utils";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import {
  BookOpen,
  Check,
  ChevronLeft,
  Crown,
  ExternalLink,
  Lock,
  MapPin,
  Swords,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  nextProblem,
  problemsToNextStar,
  SOLVED_KEY,
  type QuestMap,
  type QuestRegion,
  type QuestStage,
  type QuestWorld,
} from "./engine";
import { useQuestMaps, usePlayerProfile } from "./hooks";
import { PlayerCard, StarRow } from "./PlayerCard";
import { QuestCelebrations } from "./QuestCelebrations";
import { StageDrawer } from "./StageDrawer";
import { useQuestStore } from "./store";

/** Horizontal offsets (px from centre) that make the path snake. */
const PATH_OFFSETS = [0, 62, 86, 62, 0, -62, -86, -62];
const TRACK_WIDTH = 320;
/** On wider screens the snake swings further out. */
const WIDE_SCALE = 1.7;

function useWideTrack() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}
const ROW_HEIGHT = 150;
const NODE_SIZE = 64;
const BOSS_SIZE = 84;

export function regionLabel(title: string) {
  return title.replace(/^\s*\d+\.\s*/, "");
}

interface Theme {
  accent: string;
  gradient: string;
}

// ---------------------------------------------------------------------------
// Map pieces
// ---------------------------------------------------------------------------

function StageNode({
  stage,
  isCurrent,
  theme,
  onSelect,
}: {
  stage: QuestStage;
  isCurrent: boolean;
  theme: Theme;
  onSelect: () => void;
}) {
  const locked = stage.state === "locked";
  const perfect = stage.state === "perfect";
  const cleared = stage.state === "cleared";

  return (
    <div className="relative flex w-44 flex-col items-center">
      {isCurrent && (
        <span className="pointer-events-none absolute -top-8 inset-x-0 flex justify-center">
          <span
            className="quest-bob whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md"
            style={{ background: theme.accent }}
          >
            從這裡開始
          </span>
        </span>
      )}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${stage.title}，${stage.stars} 星${locked ? "，未解鎖" : ""}`}
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full border-b-[5px] text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
          locked && "border-border bg-muted text-muted-foreground shadow-none",
          perfect && "quest-shine border-gold-ink/60 bg-gold",
          isCurrent && "quest-node-current",
        )}
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          ...(locked || perfect
            ? {}
            : {
                background: theme.gradient,
                borderBottomColor: "rgb(0 0 0 / 0.28)",
                filter: !cleared && !isCurrent ? "saturate(0.7)" : undefined,
              }),
          ["--quest-ring" as string]: `${theme.accent}80`,
        }}
      >
        {locked ? (
          <Lock className="h-6 w-6" />
        ) : perfect ? (
          <Crown className="h-7 w-7 drop-shadow" />
        ) : cleared ? (
          <Check className="h-8 w-8" strokeWidth={3.2} />
        ) : (
          <span className="font-num">{stage.index + 1}</span>
        )}
        {stage.solved > 0 && stage.stars < 3 && (
          <ProgressRing
            value={stage.solved / stage.total}
            size={NODE_SIZE + 12}
            stroke={3}
            color={theme.accent}
            trackClassName="stroke-transparent"
            className="pointer-events-none absolute"
          />
        )}
      </button>
      <StarRow
        stars={stage.stars}
        className="mt-1.5 text-muted-foreground"
        size="h-4 w-4"
      />
      <p
        className={cn(
          "mt-0.5 line-clamp-2 text-center text-xs leading-snug",
          locked ? "text-muted-foreground" : "font-medium",
        )}
      >
        {stage.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
      </p>
      <p className="font-num text-[11px] text-muted-foreground">
        {stage.solved}/{stage.total}
      </p>
    </div>
  );
}

function BossNode({
  world,
  onSelect,
}: {
  world: QuestWorld;
  onSelect: () => void;
}) {
  const boss = world.boss!;
  const reachable = world.unlocked;
  return (
    <div className="flex w-52 flex-col items-center">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`魔王 ${boss.title}${boss.solved ? "，已擊敗" : ""}`}
        className={cn(
          "relative flex items-center justify-center rounded-[1.6rem] border-b-[6px] shadow-xl transition-transform hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
          boss.solved
            ? "quest-shine border-gold-ink/60 bg-gold text-white"
            : reachable
              ? "border-black/40 bg-foreground text-background"
              : "border-border bg-muted text-muted-foreground",
        )}
        style={{ width: BOSS_SIZE, height: BOSS_SIZE, rotate: "45deg" }}
      >
        <span style={{ rotate: "-45deg" }}>
          {reachable || boss.solved ? (
            <Crown className="h-9 w-9" />
          ) : (
            <Lock className="h-7 w-7" />
          )}
        </span>
      </button>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-gold-ink">
        {boss.solved ? "魔王已擊敗" : "魔王"}
        {boss.rating !== null && (
          <span className="font-num ml-1.5">{Math.round(boss.rating)}</span>
        )}
      </p>
      <p className="line-clamp-2 text-center text-xs font-medium">
        {boss.id}. {boss.title}
      </p>
    </div>
  );
}

/** A world's stages along a winding path, closed by its boss. */
function WorldTrack({
  world,
  currentKey,
  theme,
  onSelect,
}: {
  world: QuestWorld;
  currentKey: string | null;
  theme: Theme;
  onSelect: (stage: QuestStage) => void;
}) {
  const wide = useWideTrack();
  const scale = wide ? WIDE_SCALE : 1;
  const trackWidth = TRACK_WIDTH + (wide ? 2 * 86 * (WIDE_SCALE - 1) : 0);
  const bossStage = world.boss
    ? world.stages.find((s) => s.problems.some((p) => p.id === world.boss!.id))
    : undefined;
  const points = world.stages.map((_, i) => ({
    x: trackWidth / 2 + PATH_OFFSETS[i % PATH_OFFSETS.length]! * scale,
    y: i * ROW_HEIGHT + NODE_SIZE / 2 + 8,
  }));
  if (bossStage) {
    points.push({
      x: trackWidth / 2,
      y: world.stages.length * ROW_HEIGHT + BOSS_SIZE / 2 + 8,
    });
  }
  const height =
    world.stages.length * ROW_HEIGHT + (bossStage ? BOSS_SIZE + 90 : 0);

  return (
    <div className="relative mx-auto" style={{ width: trackWidth, height }}>
      <svg
        className="pointer-events-none absolute inset-0"
        width={trackWidth}
        height={height}
        aria-hidden
      >
        {points.slice(1).map((to, i) => {
          const from = points[i]!;
          const midY = (from.y + to.y) / 2;
          const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
          const done = (world.stages[i]?.stars ?? 0) > 0;
          return (
            <path
              key={i}
              d={d}
              className="quest-path"
              style={{ stroke: done ? theme.accent : "var(--border)" }}
              strokeWidth={done ? 10 : 8}
              strokeDasharray={done ? undefined : "2 14"}
              opacity={done ? 0.55 : 1}
            />
          );
        })}
      </svg>
      {world.stages.map((stage, i) => (
        <div
          key={stage.key}
          className="absolute flex -translate-x-1/2 justify-center"
          style={{ left: points[i]!.x, top: i * ROW_HEIGHT + 8 }}
        >
          <StageNode
            stage={stage}
            isCurrent={stage.key === currentKey}
            theme={theme}
            onSelect={() => onSelect(stage)}
          />
        </div>
      ))}
      {bossStage && (
        <div
          className="absolute flex -translate-x-1/2 justify-center"
          style={{
            left: trackWidth / 2,
            top: world.stages.length * ROW_HEIGHT + 8,
          }}
        >
          <BossNode world={world} onSelect={() => onSelect(bossStage)} />
        </div>
      )}
    </div>
  );
}

function WorldSignpost({ world, theme }: { world: QuestWorld; theme: Theme }) {
  const pct = world.total > 0 ? world.solved / world.total : 0;
  return (
    <div
      id={`world-${world.index}`}
      className={cn(
        "scroll-mt-[calc(var(--navbar-height)+5rem)] mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border bg-card/95 p-3 shadow-sm backdrop-blur",
        world.cleared ? "border-gold/60" : "border-border/70",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white",
          !world.unlocked && "bg-muted text-muted-foreground",
        )}
        style={world.unlocked ? { background: theme.gradient } : undefined}
      >
        {world.unlocked ? (
          <MapPin className="h-5 w-5" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">
          {world.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
        </p>
        <p className="font-num text-xs text-muted-foreground">
          ★ {world.stars}/{world.maxStars} · {world.solved}/{world.total} 題
          {world.cleared && " · 制霸"}
        </p>
        {!world.unlocked && (
          <p className="text-[11px] text-muted-foreground">
            前一區通關一半後解鎖，或開啟「自由探索」
          </p>
        )}
      </div>
      <ProgressRing value={pct} size={40} stroke={4} color={theme.accent}>
        <span className="font-num text-[10px] font-bold">
          {Math.round(pct * 100)}
        </span>
      </ProgressRing>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------------

function MissionCard({
  stage,
  theme,
  onOpen,
}: {
  stage: QuestStage | null;
  theme: Theme;
  onOpen: () => void;
}) {
  const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
  const { setStatus } = useProblemProgress();
  if (!stage) {
    return (
      <div className="rounded-2xl border border-gold/50 bg-gold-soft p-5 text-center">
        <p className="text-3xl">🏆</p>
        <p className="mt-1 font-bold">全部三星！這個世界被你制霸了。</p>
      </div>
    );
  }
  const suggested = nextProblem(stage);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="p-4 text-white" style={{ background: theme.gradient }}>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
          <Swords className="h-3.5 w-3.5" />
          目前任務
        </p>
        <p className="mt-1 text-lg font-bold leading-snug">
          {stage.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <StarRow stars={stage.stars} size="h-4 w-4" className="text-white" />
          <span className="font-num text-xs text-white/85">
            {stage.solved}/{stage.total}
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">
          再 AC{" "}
          <span className="font-num font-bold text-foreground">
            {problemsToNextStar(stage)}
          </span>{" "}
          題拿到下一顆星
        </p>
        {suggested && (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">
              建議下一題
            </p>
            <a
              href={getLeetCodeProblemUrl(suggested.slug, linkLanguage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-start gap-1 text-sm font-semibold hover:underline"
            >
              <span>
                {suggested.id}. {suggested.title}
              </span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
            </a>
            <div className="mt-2 flex items-center gap-2">
              {suggested.rating !== null && (
                <span className="font-num text-xs text-muted-foreground">
                  {Math.round(suggested.rating)}
                </span>
              )}
              <button
                type="button"
                onClick={() => setStatus(suggested.id, SOLVED_KEY)}
                className="ml-auto rounded-lg bg-success px-2.5 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                我 AC 了 ✓
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition-transform active:translate-y-px"
          style={{ background: theme.gradient }}
        >
          開啟關卡
        </button>
      </div>
    </div>
  );
}

function WorldNavigator({
  region,
  theme,
}: {
  region: QuestRegion;
  theme: Theme;
}) {
  return (
    <nav className="rounded-2xl border border-border/70 bg-card p-2 shadow-sm">
      <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        本區地圖
      </p>
      <ul className="max-h-[40vh] overflow-y-auto">
        {region.worlds.map((world) => (
          <li key={world.index}>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(`world-${world.index}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <ProgressRing
                value={world.total > 0 ? world.solved / world.total : 0}
                size={22}
                stroke={3}
                color={world.cleared ? "var(--gold)" : theme.accent}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  !world.unlocked && "text-muted-foreground",
                )}
              >
                {world.title.replace(/^\d+(?:\.\d+)*\s*/, "")}
              </span>
              {world.boss?.solved && (
                <Crown className="h-3.5 w-3.5 shrink-0 text-gold" />
              )}
              {!world.unlocked && (
                <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RegionTabs({
  regions,
  active,
  theme,
  onChange,
}: {
  regions: QuestRegion[];
  active: number;
  theme: Theme;
  onChange: (index: number) => void;
}) {
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2">
        {regions.map((region) => {
          const selected = region.index === active;
          const pct = region.total > 0 ? region.solved / region.total : 0;
          return (
            <button
              key={region.index}
              type="button"
              onClick={() => onChange(region.index)}
              className={cn(
                "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors",
                selected
                  ? "border-transparent text-white shadow-md"
                  : "border-border/70 bg-card text-foreground hover:bg-muted",
              )}
              style={selected ? { background: theme.gradient } : undefined}
            >
              <ProgressRing
                value={pct}
                size={28}
                stroke={3}
                color={selected ? "white" : theme.accent}
                trackClassName={selected ? "stroke-white/30" : "stroke-muted"}
              >
                <span className="font-num text-[10px] font-bold">
                  {region.index + 1}
                </span>
              </ProgressRing>
              {regionLabel(region.title)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function initialSelection(map: QuestMap | undefined, plan: string) {
  if (typeof window === "undefined" || !map) return null;
  const params = new URLSearchParams(window.location.search);
  const stageId = params.get("stage");
  const region = params.get("region");
  return {
    stageKey: stageId ? `${plan}:${stageId}` : null,
    region: region !== null ? Number(region) : null,
  };
}

function StageMap({ plan }: { plan: string }) {
  const maps = useQuestMaps();
  const profile = usePlayerProfile(maps);
  const freeMode = useQuestStore((state) => state.freeMode);
  const setFreeMode = useQuestStore((state) => state.setFreeMode);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [regionIndex, setRegionIndex] = useState<number | null>(null);

  const map = maps[plan];
  const planTheme = studyPlanThemes[plan] ?? defaultTheme;
  const theme: Theme = {
    accent: planTheme.accent,
    gradient: planTheme.gradient,
  };
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

  // Deep links: ?stage=<sectionId> opens a stage, ?region=<i> picks a topic.
  useEffect(() => {
    const selection = initialSelection(map, plan);
    if (!selection) return;
    if (selection.stageKey) setSelectedKey(selection.stageKey);
    if (selection.region !== null) setRegionIndex(selection.region);
    // Only on first load of this plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const current = map.currentStage;
  const selected = map.stages.find((s) => s.key === selectedKey) ?? null;
  const regionOf = (stage: QuestStage | null) =>
    stage ? (map.worlds[stage.worldIndex]?.region ?? 0) : 0;
  const activeRegion =
    map.regions.find(
      (r) => r.index === (regionIndex ?? regionOf(selected ?? current)),
    ) ?? map.regions[0]!;
  const regionCurrent =
    activeRegion.worlds
      .flatMap((w) => w.stages)
      .find((s) => s.state === "open") ??
    activeRegion.worlds
      .flatMap((w) => w.stages)
      .find((s) => s.state === "cleared") ??
    null;
  const pct = map.total > 0 ? map.solved / map.total : 0;

  return (
    <div className="min-h-screen bg-background font-han">
      <QuestCelebrations />

      <header className="border-b border-border/60 bg-card/60">
        <div className="page-shell flex flex-col gap-4 px-3 py-4 sm:px-4 md:px-6 lg:flex-row lg:items-center xl:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/quest"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground hover:text-foreground"
              aria-label="回到破關模式"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: theme.gradient }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                {title}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${pct * 100}%`,
                      background: theme.gradient,
                    }}
                  />
                </div>
                <span className="font-num text-xs text-muted-foreground">
                  {map.solved}/{map.total} · ★{map.stars}/{map.maxStars}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm">
              <Switch checked={freeMode} onCheckedChange={setFreeMode} />
              自由探索
            </label>
            <Link
              href={`/studyplan/${plan}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <TableProperties className="h-4 w-4" />
              表格
            </Link>
          </div>
        </div>
      </header>

      <div className="page-shell px-3 pb-24 pt-4 sm:px-4 md:px-6 xl:px-8">
        <PlayerCard
          xp={profile.xp}
          level={profile.level}
          streak={profile.streak}
          totalStars={totals.stars}
          maxStars={totals.maxStars}
        />

        {map.regions.length > 1 && (
          <div className="mt-4">
            <RegionTabs
              regions={map.regions}
              active={activeRegion.index}
              theme={theme}
              onChange={(index) => {
                setRegionIndex(index);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--navbar-height)+1rem)] lg:order-2 lg:self-start">
            <MissionCard
              stage={regionCurrent}
              theme={theme}
              onOpen={() => regionCurrent && setSelectedKey(regionCurrent.key)}
            />
            <div className="hidden lg:block">
              <WorldNavigator region={activeRegion} theme={theme} />
            </div>
          </aside>

          <main className="quest-map-bg rounded-3xl border border-border/60 bg-card/40 px-2 py-8 sm:px-6">
            {map.regions.length > 1 && (
              <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
                {regionLabel(activeRegion.title)}
              </h2>
            )}
            <div className="flex flex-col items-center gap-10">
              {activeRegion.worlds.map((world) => (
                <section
                  key={world.index}
                  className="flex w-full flex-col items-center gap-8"
                >
                  <WorldSignpost world={world} theme={theme} />
                  <WorldTrack
                    world={world}
                    currentKey={regionCurrent?.key ?? null}
                    theme={theme}
                    onSelect={(stage) => setSelectedKey(stage.key)}
                  />
                </section>
              ))}
            </div>
            {map.regions.length > 1 &&
              activeRegion.index < map.regions.length - 1 && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRegionIndex(activeRegion.index + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-full border border-border/70 bg-card px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-muted"
                  >
                    前往下一區：
                    {regionLabel(map.regions[activeRegion.index + 1]!.title)} →
                  </button>
                </div>
              )}
          </main>
        </div>
      </div>

      <StageDrawer
        planKey={plan}
        map={map}
        stage={selected}
        theme={theme}
        onSelect={(stage) => setSelectedKey(stage?.key ?? null)}
      />
    </div>
  );
}

export default StageMap;
