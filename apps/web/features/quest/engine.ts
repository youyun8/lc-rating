/**
 * Quest engine: turns a study plan (題單) plus the user's progress into a
 * level map (worlds → stages), with stars, XP, unlock state and achievements.
 *
 * Everything here is derived from the existing progress map, so the game
 * state follows cloud sync and backups automatically and never drifts from
 * the problem tables. Only presentation state (which celebrations were shown,
 * free-explore mode) lives in the separate quest store.
 */
import type { StudyPlanData } from "@/types";

export type StageState = "locked" | "open" | "cleared" | "perfect";

export interface QuestProblem {
  id: string;
  title: string;
  slug: string;
  rating: number | null;
  isPremium: boolean;
  solved: boolean;
}

export interface QuestStage {
  /** Globally unique key: `${planKey}:${sectionId}`. */
  key: string;
  sectionId: number;
  title: string;
  /** Title of the 題單 card that renders this stage, for anchor links. */
  anchorTitle: string;
  worldIndex: number;
  /** 0-based position across the whole plan. */
  index: number;
  problems: QuestProblem[];
  solved: number;
  total: number;
  stars: number;
  /** Solved count needed for each star (index 0 → ★1). */
  starThresholds: [number, number, number];
  state: StageState;
}

export interface QuestWorld {
  index: number;
  title: string;
  stages: QuestStage[];
  solved: number;
  total: number;
  stars: number;
  maxStars: number;
  unlocked: boolean;
  /** Every stage has at least ★1. */
  cleared: boolean;
  /** Highest-rated problem of the world: the 魔王題. */
  boss: QuestProblem | null;
}

export interface QuestMap {
  planKey: string;
  worlds: QuestWorld[];
  stages: QuestStage[];
  solved: number;
  total: number;
  stars: number;
  maxStars: number;
  clearedStages: number;
  /** The stage the player should play next (null when everything is perfect). */
  currentStage: QuestStage | null;
}

export type ProgressMap = Record<string, string | undefined>;
/** Looks up a problem's contest rating when the plan JSON doesn't carry one. */
export type RatingLookup = (id: string) => number | null | undefined;

export const SOLVED_KEY = "SOLVED";
/** Consecutive top-level leaf sections are grouped into worlds of this size. */
const LEAF_WORLD_SIZE = 5;
/** A world unlocks once this share of the previous world's stages is cleared. */
const WORLD_UNLOCK_RATIO = 0.5;

export function starThresholds(total: number): [number, number, number] {
  if (total <= 0) return [0, 0, 0];
  return [Math.ceil(total / 3), Math.ceil((2 * total) / 3), total];
}

export function starsFor(solved: number, total: number): number {
  if (total <= 0) return 0;
  return starThresholds(total).filter((need) => solved >= need).length;
}

/** XP for one solved problem: harder problems are worth more. */
export function problemXp(rating: number | null): number {
  if (rating === null || !Number.isFinite(rating) || rating <= 0) return 100;
  return Math.max(10, Math.round(rating / 10));
}

export const STAR_XP = 30;
export const WORLD_CLEAR_XP = 300;
export const BOSS_XP = 200;

function toQuestProblems(
  items: StudyPlanData.Item[],
  progress: ProgressMap,
  ratingOf?: RatingLookup,
): QuestProblem[] {
  const seen = new Set<string>();
  const problems: QuestProblem[] = [];
  for (const item of items) {
    const id = item.id?.toString();
    // Progress is keyed by problem id, so id-less rows can't be tracked.
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const fallback = ratingOf?.(id);
    const rating =
      typeof item.score === "number"
        ? item.score
        : typeof fallback === "number" && fallback > 0
          ? fallback
          : null;
    problems.push({
      id,
      title: item.title,
      slug: item.slug,
      rating,
      isPremium: Boolean(item.isPremium),
      solved: progress[id] === SOLVED_KEY,
    });
  }
  return problems.sort(
    (a, b) =>
      (a.rating ?? Number.NEGATIVE_INFINITY) -
        (b.rating ?? Number.NEGATIVE_INFINITY) ||
      a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
}

interface RawStage {
  section: StudyPlanData.Section;
  items: StudyPlanData.Item[];
}

/** Leaf sections (in reading order) that carry at least one problem. */
function collectLeafStages(section: StudyPlanData.Section): RawStage[] {
  const children = section.children ?? [];
  const own: RawStage[] =
    (section.problems?.length ?? 0) > 0
      ? [{ section, items: section.problems ?? [] }]
      : [];
  return [...own, ...children.flatMap(collectLeafStages)];
}

interface RawWorld {
  title: string;
  stages: RawStage[];
}

function groupWorlds(root: StudyPlanData.Root): RawWorld[] {
  const worlds: RawWorld[] = [];
  let pendingLeaves: RawStage[] = [];

  const flushLeaves = () => {
    for (let i = 0; i < pendingLeaves.length; i += LEAF_WORLD_SIZE) {
      worlds.push({
        title: "",
        stages: pendingLeaves.slice(i, i + LEAF_WORLD_SIZE),
      });
    }
    pendingLeaves = [];
  };

  for (const top of root.children) {
    const hasChildren = (top.children?.length ?? 0) > 0;
    if (!hasChildren) {
      // A plan made of flat leaf sections (e.g. 滑動視窗) would otherwise be
      // one world per stage; bundle neighbours into areas instead.
      if ((top.problems?.length ?? 0) > 0) {
        pendingLeaves.push({ section: top, items: top.problems ?? [] });
      }
      continue;
    }
    flushLeaves();
    const stages = collectLeafStages(top);
    if (stages.length > 0) worlds.push({ title: top.title, stages });
  }
  flushLeaves();

  return worlds.map((world, index) => ({
    ...world,
    title: world.title || `第 ${index + 1} 區`,
  }));
}

export function buildQuestMap(
  planKey: string,
  root: StudyPlanData.Root | undefined,
  progress: ProgressMap,
  freeMode = false,
  ratingOf?: RatingLookup,
): QuestMap {
  const empty: QuestMap = {
    planKey,
    worlds: [],
    stages: [],
    solved: 0,
    total: 0,
    stars: 0,
    maxStars: 0,
    clearedStages: 0,
    currentStage: null,
  };
  if (!root) return empty;

  const worlds: QuestWorld[] = [];
  const stages: QuestStage[] = [];
  let previousWorld: QuestWorld | null = null;

  for (const [worldIndex, rawWorld] of groupWorlds(root).entries()) {
    const worldStages: QuestStage[] = [];
    for (const raw of rawWorld.stages) {
      const problems = toQuestProblems(raw.items, progress, ratingOf);
      if (problems.length === 0) continue;
      const solved = problems.filter((p) => p.solved).length;
      const total = problems.length;
      const stars = starsFor(solved, total);
      worldStages.push({
        key: `${planKey}:${raw.section.id}`,
        sectionId: raw.section.id,
        title: raw.section.title,
        anchorTitle: raw.section.title,
        worldIndex,
        index: stages.length + worldStages.length,
        problems,
        solved,
        total,
        stars,
        starThresholds: starThresholds(total),
        state: "open",
      });
    }
    if (worldStages.length === 0) continue;

    const previousClearedRatio = previousWorld
      ? previousWorld.stages.filter((s) => s.stars > 0).length /
        previousWorld.stages.length
      : 1;
    const unlocked =
      freeMode ||
      previousWorld === null ||
      previousClearedRatio >= WORLD_UNLOCK_RATIO ||
      worldStages.some((s) => s.solved > 0);

    // Within a world, stages open one after another; anything the player has
    // already touched stays open so earlier work is never hidden.
    for (const [i, stage] of worldStages.entries()) {
      const prev = worldStages[i - 1];
      const reachable =
        freeMode ||
        stage.solved > 0 ||
        (unlocked && (prev === undefined || prev.stars > 0));
      stage.state =
        stage.stars === 3
          ? "perfect"
          : stage.stars > 0
            ? "cleared"
            : reachable
              ? "open"
              : "locked";
    }

    const allProblems = worldStages.flatMap((s) => s.problems);
    const boss = allProblems.reduce<QuestProblem | null>(
      (best, p) =>
        p.rating !== null && (best === null || p.rating > (best.rating ?? 0))
          ? p
          : best,
      null,
    );

    const world: QuestWorld = {
      index: worlds.length,
      title: rawWorld.title,
      stages: worldStages,
      solved: worldStages.reduce((acc, s) => acc + s.solved, 0),
      total: worldStages.reduce((acc, s) => acc + s.total, 0),
      stars: worldStages.reduce((acc, s) => acc + s.stars, 0),
      maxStars: worldStages.length * 3,
      unlocked,
      cleared: worldStages.every((s) => s.stars > 0),
      boss,
    };
    for (const stage of worldStages) stage.worldIndex = world.index;
    worlds.push(world);
    stages.push(...worldStages);
    previousWorld = world;
  }

  const currentStage =
    stages.find((s) => s.state === "open") ??
    stages.find((s) => s.state === "cleared") ??
    null;

  return {
    planKey,
    worlds,
    stages,
    solved: stages.reduce((acc, s) => acc + s.solved, 0),
    total: stages.reduce((acc, s) => acc + s.total, 0),
    stars: stages.reduce((acc, s) => acc + s.stars, 0),
    maxStars: stages.length * 3,
    clearedStages: stages.filter((s) => s.stars > 0).length,
    currentStage,
  };
}

/**
 * The first unsolved problem in table order (easiest rated first), preferring
 * free problems so non-members aren't sent to a paywall.
 */
export function nextProblem(stage: QuestStage | null): QuestProblem | null {
  const unsolved = stage?.problems.filter((p) => !p.solved) ?? [];
  return unsolved.find((p) => !p.isPremium) ?? unsolved[0] ?? null;
}

/** Problems still needed for the next star (0 when the stage is perfect). */
export function problemsToNextStar(stage: QuestStage): number {
  const next = stage.starThresholds.find((need) => stage.solved < need);
  return next === undefined ? 0 : next - stage.solved;
}

// ---------------------------------------------------------------------------
// Player profile: XP, level, streak and achievements across every plan.
// ---------------------------------------------------------------------------

export interface PlayerLevel {
  level: number;
  title: string;
  /** XP gained inside the current level. */
  xpIntoLevel: number;
  /** XP needed to go from this level to the next. */
  xpForNext: number;
}

const LEVEL_TITLES: { from: number; title: string }[] = [
  { from: 1, title: "新手冒險者" },
  { from: 3, title: "見習學徒" },
  { from: 6, title: "迴圈戰士" },
  { from: 10, title: "指標遊俠" },
  { from: 14, title: "遞迴法師" },
  { from: 19, title: "動規賢者" },
  { from: 25, title: "圖論領主" },
  { from: 30, title: "演算法宗師" },
  { from: 35, title: "傳說刷題王" },
];

export function titleForLevel(level: number): string {
  return (
    [...LEVEL_TITLES].reverse().find((t) => level >= t.from)?.title ??
    LEVEL_TITLES[0]!.title
  );
}

/** XP needed to advance from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return 500 * level;
}

export function levelFromXp(xp: number): PlayerLevel {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return {
    level,
    title: titleForLevel(level),
    xpIntoLevel: remaining,
    xpForNext: xpForLevel(level),
  };
}

export function computeXp(maps: QuestMap[]): number {
  const solvedRatings = new Map<string, number | null>();
  let bonus = 0;
  for (const map of maps) {
    for (const stage of map.stages) {
      bonus += stage.stars * STAR_XP;
      for (const p of stage.problems) {
        if (p.solved) solvedRatings.set(p.id, p.rating);
      }
    }
    for (const world of map.worlds) {
      if (world.cleared) bonus += WORLD_CLEAR_XP;
      if (world.boss?.solved) bonus += BOSS_XP;
    }
  }
  let xp = bonus;
  // A problem listed in several plans is worth its XP once.
  for (const rating of solvedRatings.values()) xp += problemXp(rating);
  return xp;
}

function dayKey(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface StreakInfo {
  /** Consecutive days (ending today or yesterday) with at least one AC. */
  streak: number;
  solvedToday: number;
  /** True when today already counts towards the streak. */
  activeToday: boolean;
}

export function computeStreak(
  progress: ProgressMap,
  updatedAt: Record<string, number>,
  now = Date.now(),
): StreakInfo {
  const days = new Map<string, number>();
  for (const [id, status] of Object.entries(progress)) {
    const time = updatedAt[id];
    if (status !== SOLVED_KEY || !time) continue;
    const key = dayKey(time);
    days.set(key, (days.get(key) ?? 0) + 1);
  }

  const today = new Date(now);
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const solvedToday = days.get(dayKey(cursor.getTime())) ?? 0;
  if (solvedToday === 0) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, solvedToday, activeToday: solvedToday > 0 };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  /** 0..1 progress towards unlocking. */
  progress: number;
}

export function computeAchievements(
  maps: QuestMap[],
  streak: StreakInfo,
): Achievement[] {
  const solvedIds = new Map<string, number | null>();
  for (const map of maps) {
    for (const stage of map.stages) {
      for (const p of stage.problems)
        if (p.solved) solvedIds.set(p.id, p.rating);
    }
  }
  const solved = solvedIds.size;
  const maxRating = Math.max(0, ...[...solvedIds.values()].map((r) => r ?? 0));
  const perfectStages = maps.reduce(
    (acc, m) => acc + m.stages.filter((s) => s.stars === 3).length,
    0,
  );
  const clearedWorlds = maps.reduce(
    (acc, m) => acc + m.worlds.filter((w) => w.cleared).length,
    0,
  );
  const bosses = maps.reduce(
    (acc, m) => acc + m.worlds.filter((w) => w.boss?.solved).length,
    0,
  );
  const bestPlanPct = Math.max(
    0,
    ...maps.map((m) => (m.total > 0 ? m.solved / m.total : 0)),
  );

  const count = (
    id: string,
    title: string,
    description: string,
    icon: string,
    value: number,
    goal: number,
  ): Achievement => ({
    id,
    title,
    description,
    icon,
    unlocked: value >= goal,
    progress: Math.min(1, goal > 0 ? value / goal : 0),
  });

  return [
    count("first-ac", "初次登場", "在任一題單完成第 1 題", "🌱", solved, 1),
    count("ac-10", "十題達成", "累積完成 10 題", "🔟", solved, 10),
    count("ac-100", "百題斬", "累積完成 100 題", "⚔️", solved, 100),
    count("ac-500", "五百勇者", "累積完成 500 題", "🛡️", solved, 500),
    count("perfect-1", "完美通關", "任一關卡拿到 ★★★", "🌟", perfectStages, 1),
    count(
      "perfect-10",
      "星光收藏家",
      "累積 10 個三星關卡",
      "✨",
      perfectStages,
      10,
    ),
    count(
      "world-1",
      "區域制霸",
      "任一區域所有關卡都至少 ★1",
      "🏰",
      clearedWorlds,
      1,
    ),
    count("boss-1", "魔王討伐", "擊敗任一區域的魔王題", "🐉", bosses, 1),
    count("boss-10", "屠龍者", "擊敗 10 隻魔王", "👑", bosses, 10),
    count(
      "rating-1900",
      "破壁者",
      "完成一題 1900 分以上的題目",
      "🔥",
      maxRating,
      1900,
    ),
    count(
      "rating-2400",
      "高塔攀登者",
      "完成一題 2400 分以上的題目",
      "🗻",
      maxRating,
      2400,
    ),
    count("streak-3", "三日不輟", "連續 3 天都有 AC", "📅", streak.streak, 3),
    count("streak-7", "一週修行", "連續 7 天都有 AC", "🔥", streak.streak, 7),
    count(
      "streak-30",
      "月之試煉",
      "連續 30 天都有 AC",
      "🌙",
      streak.streak,
      30,
    ),
    count("plan-100", "全破！", "把任一份題單刷到 100%", "🏆", bestPlanPct, 1),
  ];
}
