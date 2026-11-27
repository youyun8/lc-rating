import assert from "node:assert/strict";
import test from "node:test";

import type { StudyPlanData } from "@/types";

import {
  buildQuestMap,
  computeAchievements,
  computeStreak,
  computeXp,
  levelFromXp,
  nextProblem,
  problemsToNextStar,
  starsFor,
} from "./engine";

function item(id: number, score: number | null = 1500): StudyPlanData.Item {
  return {
    id,
    title: `P${id}`,
    slug: `p-${id}`,
    src: "",
    solution: null,
    score,
    isPremium: false,
  };
}

function leaf(
  id: number,
  title: string,
  problems: StudyPlanData.Item[],
): StudyPlanData.Section {
  return { id, title, problems };
}

const nestedPlan: StudyPlanData.Root = {
  id: 1,
  title: "plan",
  src: null,
  last_update: null,
  children: [
    {
      id: 10,
      title: "1. 入門",
      children: [
        leaf(11, "1.1 A", [item(1, 1200), item(2, 1300), item(3, 1400)]),
        leaf(12, "1.2 B", [item(4, 1500), item(5, 2000)]),
      ],
    },
    {
      id: 20,
      title: "2. 進階",
      children: [leaf(21, "2.1 C", [item(6), item(7)])],
    },
  ],
};

test("stars follow thirds of the stage", () => {
  assert.equal(starsFor(0, 3), 0);
  assert.equal(starsFor(1, 3), 1);
  assert.equal(starsFor(2, 3), 2);
  assert.equal(starsFor(3, 3), 3);
  assert.equal(starsFor(1, 1), 3);
  assert.equal(starsFor(0, 0), 0);
});

test("stages unlock in order and worlds unlock at half cleared", () => {
  const fresh = buildQuestMap("p", nestedPlan, {});
  assert.deepEqual(
    fresh.stages.map((s) => s.state),
    ["open", "locked", "locked"],
  );
  assert.equal(fresh.worlds[1]!.unlocked, false);

  const oneAc = buildQuestMap("p", nestedPlan, { "1": "SOLVED" });
  assert.deepEqual(
    oneAc.stages.map((s) => s.state),
    ["cleared", "open", "open"],
  );
  assert.equal(oneAc.worlds[1]!.unlocked, true);
});

test("touched stages stay open and free mode opens everything", () => {
  const touched = buildQuestMap("p", nestedPlan, { "6": "SOLVED" });
  assert.equal(touched.stages[2]!.state, "cleared");
  assert.equal(touched.stages[1]!.state, "locked");

  const free = buildQuestMap("p", nestedPlan, {}, true);
  assert.ok(free.stages.every((s) => s.state === "open"));
});

test("boss is the highest-rated problem of the world", () => {
  const map = buildQuestMap("p", nestedPlan, {});
  assert.equal(map.worlds[0]!.boss?.id, "5");
});

test("flat leaf plans are grouped into areas", () => {
  const flat: StudyPlanData.Root = {
    id: 2,
    title: "flat",
    src: null,
    last_update: null,
    children: Array.from({ length: 7 }, (_, i) =>
      leaf(100 + i, `${i + 1}. S`, [item(1000 + i)]),
    ),
  };
  const map = buildQuestMap("flat", flat, {});
  assert.deepEqual(
    map.worlds.map((w) => w.stages.length),
    [5, 2],
  );
  assert.equal(map.worlds[1]!.title, "第 2 區");
});

test("duplicate and id-less problems are ignored", () => {
  const plan: StudyPlanData.Root = {
    ...nestedPlan,
    children: [
      leaf(1, "1. X", [item(1), item(1), { ...item(2), id: undefined }]),
    ],
  };
  const map = buildQuestMap("p", plan, {});
  assert.equal(map.total, 1);
});

test("next problem is the easiest unsolved one", () => {
  const map = buildQuestMap("p", nestedPlan, { "1": "SOLVED" });
  const stage = map.stages[0]!;
  assert.equal(nextProblem(stage)?.id, "2");
  assert.equal(problemsToNextStar(stage), 1);
});

test("xp counts shared problems once and levels grow linearly", () => {
  const progress = { "1": "SOLVED" };
  const map = buildQuestMap("p", nestedPlan, progress);
  const twice = computeXp([map, { ...map, planKey: "q" }]);
  // 120 for the problem + 2 × 30 for the star in each copy of the map.
  assert.equal(twice, 120 + 60);

  assert.deepEqual(levelFromXp(0), {
    level: 1,
    title: "新手冒險者",
    xpIntoLevel: 0,
    xpForNext: 500,
  });
  assert.equal(levelFromXp(500).level, 2);
  assert.equal(levelFromXp(1499).level, 2);
  assert.equal(levelFromXp(1500).level, 3);
});

test("streak counts consecutive days and survives until tomorrow", () => {
  const now = new Date(2026, 10, 27, 12).getTime();
  const day = 24 * 60 * 60 * 1000;
  const progress = { a: "SOLVED", b: "SOLVED", c: "SOLVED", d: "TRIED" };
  const updatedAt = {
    a: now - day,
    b: now - 2 * day,
    c: now - 4 * day,
    d: now,
  };

  const info = computeStreak(progress, updatedAt, now);
  assert.equal(info.streak, 2);
  assert.equal(info.solvedToday, 0);

  const withToday = computeStreak(
    { ...progress, e: "SOLVED" },
    { ...updatedAt, e: now },
    now,
  );
  assert.equal(withToday.streak, 3);
  assert.equal(withToday.activeToday, true);
});

test("achievements unlock from aggregated progress", () => {
  const map = buildQuestMap("p", nestedPlan, {
    "4": "SOLVED",
    "5": "SOLVED",
  });
  const unlocked = computeAchievements([map], {
    streak: 0,
    solvedToday: 0,
    activeToday: false,
  })
    .filter((a) => a.unlocked)
    .map((a) => a.id);
  assert.deepEqual(unlocked, [
    "first-ac",
    "perfect-1",
    "boss-1",
    "rating-1900",
  ]);
});

test("library ratings fill in when the plan has no score", () => {
  const plan: StudyPlanData.Root = {
    ...nestedPlan,
    children: [leaf(1, "1. X", [item(1, null), item(2, null)])],
  };
  const map = buildQuestMap("p", plan, {}, false, (id) =>
    id === "2" ? 2100 : 0,
  );
  assert.equal(map.worlds[0]!.boss?.id, "2");
  assert.equal(map.stages[0]!.problems[1]!.rating, 2100);
  assert.equal(map.stages[0]!.problems[0]!.rating, null);
});

test("suggestion skips premium problems when a free one is left", () => {
  const plan: StudyPlanData.Root = {
    ...nestedPlan,
    children: [
      leaf(1, "1. X", [{ ...item(1, 1200), isPremium: true }, item(2, 1300)]),
    ],
  };
  const map = buildQuestMap("p", plan, {});
  assert.equal(nextProblem(map.stages[0]!)?.id, "2");
});
