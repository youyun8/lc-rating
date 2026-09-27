/**
 * Book-level configuration: title page text, the part / chapter order and
 * print geometry. Chapter keys are `LECTURE_CATEGORIES` keys.
 */

export const BOOK = {
  title: "演算法講義",
  subtitle: "從題型訊號、不變量到 C++17 模板",
  series: "LeetCode 分級題單・講義合集",
  authors: "lc-rating 講義編寫組　編著",
  edition: "初版",
  lang: "zh-Hant",
  site: "https://youyun8.github.io/lc-rating/lecture/",
  repo: "https://github.com/youyun8/lc-rating",
  keywords: ["演算法", "資料結構", "LeetCode", "競技程式", "C++17", "面試"],
} as const;

export interface BookPart {
  title: string;
  subtitle: string;
  chapters: string[];
}

/**
 * Pedagogical order: techniques that only need arrays come first, graph and
 * DP modelling next, then heavy data structures and mathematics, and finally
 * the "thinking" chapters (greedy, recursion, strings) that reuse all of the
 * above.
 */
export const PARTS: BookPart[] = [
  {
    title: "第一篇　線性結構上的基本技巧",
    subtitle:
      "滑動視窗、二分搜尋、單調堆疊、網格圖與位元運算：只靠陣列與指標就能把 O(n²) 壓到 O(n log n) 以下。",
    chapters: [
      "sliding_window",
      "binary_search",
      "monotonic_stack",
      "grid",
      "bitwise_operations",
    ],
  },
  {
    title: "第二篇　圖論與動態規劃",
    subtitle:
      "把問題建成狀態與轉移：圖上的搜尋、最短路、拓撲序，以及各式 DP 模型與優化。",
    chapters: ["graph", "dynamic_programming"],
  },
  {
    title: "第三篇　資料結構與數學",
    subtitle: "字首和、堆、並查集、線段樹，以及數論、組合、機率與幾何。",
    chapters: ["data_structure", "math"],
  },
  {
    title: "第四篇　貪心、遞迴與字串",
    subtitle:
      "交換論證與反悔、連結串列與樹的遞迴、回溯搜尋，以及字串匹配演算法與排序。",
    chapters: ["greedy", "trees", "string", "sorting"],
  },
];

/** Trim size (mm). 185 × 260 mm is the common 16 開 technical-book format. */
export const PAGE = {
  width: 185,
  height: 260,
  top: 22,
  bottom: 22,
  inner: 22,
  outer: 17,
} as const;
