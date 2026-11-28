import assert from "node:assert/strict";
import test from "node:test";

import type { StudyPlanData } from "@/types";

import {
  buildAdventurePlan,
  stripNumericPrefix,
  stripProse,
  type AdventureInput,
} from "./adventurePlan";

function item(id: number, score: number | null = null): StudyPlanData.Item {
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

function root(children: StudyPlanData.Section[]): StudyPlanData.Root {
  return { id: 1, title: "src", src: null, last_update: null, children };
}

let nextId = 1;
function section(
  title: string,
  problems?: number[],
  children?: StudyPlanData.Section[],
  summary?: string,
): StudyPlanData.Section {
  return {
    id: nextId++,
    title,
    ...(problems ? { problems: problems.map((id) => item(id)) } : {}),
    ...(children ? { children } : {}),
    ...(summary ? { summary } : {}),
  };
}

const topics = {
  sliding_window: root([
    section("1. 基礎", [1, 2]),
    section("4. 越短越合法", [3]),
  ]),
  binary_search: root([section("1. 基礎", [5, 7]), section("10. 其他", [7])]),
  data_structure: root([
    section("2. 字首和", undefined, [section("2.1 前綴和", [1])]),
  ]),
} as unknown as AdventureInput["topics"];

const sources: AdventureInput["sources"] = [
  {
    key: "interview_sprint",
    root: root([
      section(
        "2. 高優題單",
        undefined,
        [
          section("2.1 滑動視窗（2 題）", [1, 2], undefined, "sw prose"),
          section("2.2 二分搜尋", [7], undefined, "bs prose"),
        ],
        "intro",
      ),
    ]),
  },
  {
    key: "q3_handbook",
    root: root([
      section("前綴和與雜湊表", undefined, [
        section("模式總覽", undefined, undefined, "overview"),
        section("前綴和與雜湊表：必修", [1, 5]),
      ]),
    ]),
  },
];

function find(
  sections: StudyPlanData.Section[],
  match: (s: StudyPlanData.Section) => boolean,
): StudyPlanData.Section | undefined {
  for (const s of sections) {
    if (match(s)) return s;
    const hit = find(s.children ?? [], match);
    if (hit) return hit;
  }
  return undefined;
}

function homeOf(plan: StudyPlanData.Root, id: number) {
  return find(plan.children, (s) =>
    (s.problems ?? []).some((p) => p.id === id),
  );
}

const { root: plan, report } = buildAdventurePlan({
  topics,
  sources,
  ratings: {},
});

test("strips only numeric prefixes", () => {
  assert.equal(stripNumericPrefix("2.1 雙指標"), "雙指標");
  assert.equal(stripNumericPrefix("滑動視窗"), "滑動視窗");
});

test("topics follow 靈茶's order, then the appendix", () => {
  assert.deepEqual(
    plan.children.map((c) => c.title),
    [
      "1. 滑動視窗與雙指標",
      "2. 二分演算法",
      "3. 常用資料結構",
      "4. 附錄：面試題型與原題單說明",
    ],
  );
});

test("a problem goes to its old plan's topic when 0x3F lists it there", () => {
  // 1 is in both 滑動視窗 and 資料結構; 面試衝刺 filed it under 滑動視窗.
  assert.match(homeOf(plan, 1)!.title, /^1\.2\.1 /);
  const p1 = homeOf(plan, 1)!.problems!.find((p) => p.id === 1)!;
  assert.equal(p1.subsection, "面試衝刺 / Q3 必修");
});

test("otherwise it falls back to its earliest 0x3F topic", () => {
  // Q3 filed 5 under 前綴和, but 0x3F only lists it under 二分.
  assert.match(homeOf(plan, 5)!.title, /^2\./);
});

test("misc sections are dispersed to a specific section", () => {
  assert.match(homeOf(plan, 7)!.title, /基礎|二分查找/);
  assert.equal(report.miscUnresolved.length, 0);
});

test("prose moves to its topic's 導讀; mixed containers go to the appendix", () => {
  const swIntro = find(plan.children, (s) =>
    s.title.includes("面試衝刺・滑動視窗"),
  );
  assert.ok(swIntro, "sliding-window prose");
  assert.equal(swIntro!.summary, "sw prose");
  assert.ok(!swIntro!.title.includes("題）"), "stale count stripped");

  const q3 = find(plan.children, (s) => s.title.includes("Q3・前綴和與雜湊表"));
  assert.ok(q3?.title.startsWith("3.1."), "Q3 pattern lands in 資料結構 導讀");
  assert.ok(q3!.children?.some((c) => c.summary === "overview"));

  const appendix = plan.children.at(-1)!;
  assert.ok(appendix.children!.some((c) => c.summary === "intro"));
});

test("section ids are unique and titles numbered", () => {
  const ids: number[] = [];
  const walk = (s: StudyPlanData.Section) => {
    ids.push(s.id);
    s.children?.forEach(walk);
  };
  plan.children.forEach(walk);
  assert.equal(new Set(ids).size, ids.length);
});

test("big stages split by rating; small neighbours pack together", () => {
  const many = Array.from({ length: 14 }, (_, i) => 100 + i);
  const ratings = Object.fromEntries(many.map((id, i) => [id, 1200 + i * 100]));
  const big = buildAdventurePlan({
    topics: {
      sliding_window: root([
        section("1. 基礎", many),
        section("4. 越短越合法", [200]),
        section("6. 越長越合法", [201]),
      ]),
    } as unknown as AdventureInput["topics"],
    sources: [
      {
        key: "interview_sprint",
        root: root([section("2.1 滑動視窗", [...many, 200, 201])]),
      },
    ],
    ratings,
  }).root;
  const fixed = find(big.children, (s) => s.title.endsWith(" 定長滑動視窗"))!;
  assert.deepEqual(
    fixed.children!.map((c) => [c.title, c.problems!.length]),
    [
      ["1.1.1 基礎（基礎・1200–1800）", 7],
      ["1.1.2 基礎（進階・1900–2500）", 7],
    ],
  );
  const variable = find(big.children, (s) =>
    s.title.endsWith(" 不定長滑動視窗"),
  )!;
  // Two 1-problem sections fill one stage named after the chapter.
  assert.deepEqual(
    variable.children!.map((c) => [c.title, c.problems!.length]),
    [["1.2.1 不定長滑動視窗", 2]],
  );
  assert.equal(
    variable.children![0]!.problems![0]!.subsection,
    "越短越合法 / 面試衝刺",
  );
});

test("stripProse keeps only sections with problems", () => {
  const tree = stripProse(plan);
  assert.equal(tree.summary, undefined);
  assert.equal(
    find(tree.children, (s) => s.title.includes("導讀")),
    undefined,
  );
  assert.ok(homeOf(tree, 1));
});
