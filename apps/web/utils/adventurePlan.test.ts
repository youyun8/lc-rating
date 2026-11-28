import assert from "node:assert/strict";
import test from "node:test";

import type { StudyPlanData } from "@/types";

import {
  buildAdventurePlan,
  stripNumericPrefix,
  type AdventureSource,
} from "./adventurePlan";

function item(id: number): StudyPlanData.Item {
  return {
    id,
    title: `P${id}`,
    slug: `p-${id}`,
    src: "",
    solution: null,
    score: null,
    isPremium: false,
  };
}

function root(children: StudyPlanData.Section[]): StudyPlanData.Root {
  return { id: 1, title: "src", src: null, last_update: null, children };
}

const sprint: AdventureSource = {
  key: "interview_sprint",
  root: root([
    {
      id: 2,
      title: "2. 高優題單",
      children: [{ id: 3, title: "2.1 雙指標", problems: [item(1), item(2)] }],
    },
  ]),
};

const q3: AdventureSource = {
  key: "q3_handbook",
  root: root([
    {
      id: 93005,
      title: "滑動視窗",
      children: [
        {
          id: 930051,
          title: "滑動視窗：必修",
          problems: [item(2), item(3), item(3)],
        },
      ],
    },
  ]),
};

test("strips only numeric prefixes", () => {
  assert.equal(stripNumericPrefix("2.1 雙指標"), "雙指標");
  assert.equal(
    stripNumericPrefix("1. Phase 1：穩住 1700"),
    "Phase 1：穩住 1700",
  );
  assert.equal(stripNumericPrefix("滑動視窗"), "滑動視窗");
});

test("chapters follow the route order and are renumbered", () => {
  const plan = buildAdventurePlan([q3, sprint]);
  assert.deepEqual(
    plan.children.map((c) => c.title),
    ["1. 面試衝刺", "3. 競賽 Q3 模式"],
  );
  assert.equal(plan.children[0]!.children![0]!.title, "1.1 高優題單");
  assert.equal(
    plan.children[1]!.children![0]!.children![0]!.title,
    "3.1.1 滑動視窗：必修",
  );
});

test("keeps only the first appearance and notes the repeat", () => {
  const plan = buildAdventurePlan([sprint, q3]);
  const leaf = plan.children[1]!.children![0]!.children![0]!;
  assert.deepEqual(
    leaf.problems!.map((p) => p.id),
    [3],
  );
  assert.deepEqual(leaf.repeats, [
    { id: 2, title: "P2", firstSeenIn: "1.1.1 雙指標" },
  ]);
});

test("section ids are namespaced per chapter", () => {
  const plan = buildAdventurePlan([sprint, q3]);
  assert.equal(plan.children[0]!.id, 10_000_000);
  assert.equal(plan.children[1]!.children![0]!.id, 30_000_000 + 93005);
});

test("prose-only sections don't shift numbering from the raw tree", () => {
  const withProse: AdventureSource = {
    ...q3,
    root: root([
      {
        ...q3.root.children[0]!,
        children: [
          { id: 77, title: "模式總覽", summary: "prose" },
          ...q3.root.children[0]!.children!,
        ],
      },
    ]),
  };
  const plan = buildAdventurePlan([sprint, withProse], [sprint, q3]);
  const titles = plan.children[1]!.children![0]!.children!.map((c) => c.title);
  assert.deepEqual(titles, ["模式總覽", "3.1.1 滑動視窗：必修"]);
});
