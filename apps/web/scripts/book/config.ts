/**
 * Book-level configuration: title page text, the part / chapter order and
 * print geometry. Chapter keys are `LECTURE_CATEGORIES` keys.
 */

export const BOOK = {
  title: "演算法講義",
  subtitle: "從題型訊號、不變量到 C++17 模板",
  series: "LeetCode 分級題單・講義合集",
  authors: "LeetCode 講義小組　編著",
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

/**
 * Print production settings for the difficulty edition's `--print` files.
 * Spine width = leaves × leaf thickness + allowance; ask the printer for the
 * real caliper of the chosen paper and adjust `leafThicknessMm`.
 */
export const PRINT = {
  /** Bleed on every outer edge of the cover spread (mm). */
  bleedMm: 3,
  /** Thickness of one leaf (two pages); ~0.1 mm for 80 g woodfree paper. */
  leafThicknessMm: 0.1,
  /** Extra spine width for the glue of a perfect binding (mm). */
  spineAllowanceMm: 1,
  /** Interior page count is padded with blank pages to a multiple of this. */
  padPagesTo: 4,
} as const;

/** Back cover of the topic edition (palette matches `cover.ts`). */
export const TOPIC_BACK = {
  theme: { coverDark: "#0f1f44", coverMid: "#1c3370", coverGlow: "#f59e0b" },
  blurb: [
    "本書把 LeetCode 分級題單的十三個主題整理成一本演算法講義：從滑動視窗、二分搜尋、單調堆疊，到圖論、動態規劃、線段樹、數論與字串演算法。",
    "每一小節都遵循同一個十五段骨架：從「暴力為何不夠」講起，經過題型訊號與不變量證明，走到可以直接套用的 C++17 模板，最後附上依難度分數排序的練習題。書中圖解都由程式實際執行演算法後繪製。",
  ],
} as const;
