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
import { slidingWindow } from "./sliding_window";
import { string } from "./string";
import { trees } from "./trees";

/** Lecture category key -> display title. Lecture-owned; independent of STUDYPLANS. */
export const LECTURE_CATEGORIES: Record<string, string> = {
  q3_handbook: "LeetCode 競賽 Q3 手冊",
  interview_sprint: "面試衝刺計畫",
  technical_interview: "技術面試準備",
  rating_2100: "Rating 2100",
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

/** Lecture category key -> authored content tree. Replaces the old tutorial/*.json. */
export const lectureContentMap: Record<string, TutorialData.Root> = {
  q3_handbook: q3Handbook,
  technical_interview: technicalInterview,
  rating_2100: rating_2100,
  binary_search: binarySearch,
  sorting: sorting,
  bitwise_operations: bitwiseOperations,
  data_structure: dataStructure,
  dynamic_programming: dynamicProgramming,
  graph: graph,
  greedy: greedy,
  grid: grid,
  interview_sprint: interviewSprint,
  math: math,
  monotonic_stack: monotonicStack,
  sliding_window: slidingWindow,
  string: string,
  trees: trees,
};
