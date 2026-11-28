import assert from "node:assert/strict";
import test from "node:test";

import type { StudyPlanData } from "@/types";

import { sectionProgress, splitSectionTitle } from "./sectionProgress";

const item = (id: number): StudyPlanData.Item => ({
  id,
  title: `P${id}`,
  slug: `p-${id}`,
  src: "",
  solution: null,
  score: null,
  isPremium: false,
});

test("counts unique problems in the subtree", () => {
  const section: StudyPlanData.Section = {
    id: 1,
    title: "1. A",
    problems: [item(1), item(2)],
    children: [{ id: 2, title: "1.1 B", problems: [item(2), item(3)] }],
  };
  assert.deepEqual(sectionProgress(section, { "2": "SOLVED", "3": "TRIED" }), {
    solved: 1,
    total: 3,
  });
});

test("splits numbered titles", () => {
  assert.deepEqual(splitSectionTitle("1.2 爬樓梯"), {
    number: "1.2",
    label: "爬樓梯",
  });
  assert.deepEqual(splitSectionTitle("3. 背包"), {
    number: "3",
    label: "背包",
  });
  assert.deepEqual(splitSectionTitle("模式總覽"), {
    number: null,
    label: "模式總覽",
  });
});
