import type { TutorialData } from "@/types";
import { technicalInterview } from "./technical_interview";
import { rating_2100 } from "./rating_2100";
import { binarySearch } from "./binary_search";
import { sorting } from "./sorting";
import { bitwiseOperations } from "./bitwise_operations";
import { dataStructure } from "./data_structure";
import { dynamicProgramming } from "./dynamic_programming";
import { graph } from "./graph";
import { greedy } from "./greedy";
import { grid } from "./grid";
import { interviewSprint } from "./interview_sprint";
import { math } from "./math";
import { monotonicStack } from "./monotonic_stack";
import { q3Handbook } from "./q3_handbook";
import { q4Handbook } from "./q4_handbook";
import { slidingWindow } from "./sliding_window";
import { string } from "./string";
import { trees } from "./trees";

/**
 * Lecture category key -> display title. Lecture-owned; independent of
 * STUDYPLANS. Only the upstream 靈茶山艾府（0x3F）主題保留獨立「講義」頁；
 * 自製學習路線的講義內容已合併進對應題單，因此不再列於此。
 */
export const LECTURE_CATEGORIES: Record<string, string> = {
  binary_search: "二分搜尋",
  sorting: "排序",
  bitwise_operations: "位元運算",
  data_structure: "資料結構",
  dynamic_programming: "動態規劃",
  graph: "圖論演算法",
  greedy: "貪心",
  grid: "網格圖",
  math: "數學",
  monotonic_stack: "單調堆疊",
  sliding_window: "滑動視窗",
  string: "字串",
  trees: "樹和二元樹",
};

/**
 * Lecture category key -> authored content tree, for the standalone「講義」頁。
 * 僅含 0x3F 主題；自製路線的講義內容改由 `studyPlanContentMap` 合併進題單。
 */
export const lectureContentMap: Record<string, TutorialData.Root> = {
  binary_search: binarySearch,
  sorting: sorting,
  bitwise_operations: bitwiseOperations,
  data_structure: dataStructure,
  dynamic_programming: dynamicProgramming,
  graph: graph,
  greedy: greedy,
  grid: grid,
  math: math,
  monotonic_stack: monotonicStack,
  sliding_window: slidingWindow,
  string: string,
  trees: trees,
};

/**
 * 自製學習路線 / 面試準備的講義內容樹。這些不再有獨立「講義」頁，
 * 而是由題單頁依 id 合併進對應的練習題樹（含根摘要與各章節敘述）。
 */
export const studyPlanContentMap: Record<string, TutorialData.Root> = {
  q3_handbook: q3Handbook,
  q4_handbook: q4Handbook,
  technical_interview: technicalInterview,
  rating_2100: rating_2100,
  interview_sprint: interviewSprint,
};
