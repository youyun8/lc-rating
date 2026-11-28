/**
 * 冒險路線 taxonomy: 靈茶山艾府（0x3F）'s own topic and chapter grouping, plus
 * the few places where this fork deliberately departs from it.
 *
 * Section references are the local top-level section numbers of each 0x3F
 * 題單 (the "4" in "4. 越短越合法/求最長/最大"), so the config survives the
 * upstream sync, which keeps local section titles and ids stable.
 */

export type TopicKey =
  | "sliding_window"
  | "binary_search"
  | "monotonic_stack"
  | "grid"
  | "bitwise_operations"
  | "graph"
  | "dynamic_programming"
  | "data_structure"
  | "math"
  | "greedy"
  | "trees"
  | "string";

export interface ChapterConfig {
  title: string;
  /** Local top-level section numbers that make up this chapter. */
  sections: number[];
  /**
   * Optional regrouping of this chapter's stages (our adjustment). Each entry
   * merges the listed local sections into one stage.
   */
  stages?: { title: string; sections: number[] }[];
}

export interface TopicConfig {
  key: TopicKey;
  /** 靈茶's topic name. */
  title: string;
  chapters: ChapterConfig[];
}

/** 靈茶's recommended learning order. */
export const ADVENTURE_TOPICS: TopicConfig[] = [
  {
    key: "sliding_window",
    title: "滑動視窗與雙指標",
    chapters: [
      { title: "定長滑動視窗", sections: [1, 2, 3] },
      { title: "不定長滑動視窗", sections: [4, 6, 7, 8, 9, 10] },
      { title: "單序列雙指標", sections: [11, 12, 13, 14, 15, 16, 17] },
      { title: "雙序列雙指標", sections: [18, 19] },
      { title: "三指標", sections: [21] },
      { title: "分組迴圈", sections: [22] },
    ],
  },
  {
    key: "binary_search",
    title: "二分演算法",
    chapters: [
      { title: "二分查找", sections: [1, 2] },
      { title: "二分答案", sections: [3, 4, 5, 6, 7, 8] },
      { title: "三分法", sections: [9] },
    ],
  },
  {
    key: "monotonic_stack",
    title: "單調堆疊",
    chapters: [
      { title: "單調堆疊", sections: [1, 2] },
      { title: "矩形", sections: [3] },
      { title: "貢獻法", sections: [4] },
      { title: "最小字典序", sections: [5] },
    ],
  },
  {
    key: "grid",
    title: "網格圖",
    chapters: [
      { title: "網格圖 DFS", sections: [1] },
      { title: "網格圖 BFS", sections: [2] },
      { title: "網格圖 0-1 BFS", sections: [3] },
      { title: "綜合應用", sections: [4] },
    ],
  },
  {
    key: "bitwise_operations",
    title: "位元運算",
    chapters: [
      { title: "基礎題", sections: [1] },
      { title: "異或（XOR）的性質", sections: [2] },
      { title: "與或（AND/OR）的性質", sections: [3] },
      { title: "拆位／貢獻法", sections: [4] },
      { title: "試填法", sections: [5] },
      { title: "恆等式", sections: [6] },
      { title: "線性基", sections: [7] },
      { title: "思維題", sections: [8] },
    ],
  },
  {
    key: "graph",
    title: "圖論演算法",
    chapters: [
      { title: "圖的遍歷", sections: [1, 2, 3, 4] },
      { title: "拓撲排序", sections: [5, 6, 7] },
      { title: "最短路", sections: [8, 9, 10, 11, 12] },
      { title: "最小生成樹", sections: [13] },
      { title: "歐拉路徑／歐拉迴路", sections: [14] },
      { title: "強連通分量／雙連通分量", sections: [15] },
      { title: "二分圖染色", sections: [16] },
      { title: "網路流", sections: [17] },
    ],
  },
  {
    key: "dynamic_programming",
    title: "動態規劃",
    chapters: [
      { title: "入門 DP", sections: [1] },
      { title: "網格圖 DP", sections: [2] },
      { title: "背包", sections: [3] },
      { title: "經典線性 DP", sections: [4] },
      { title: "劃分型 DP", sections: [5] },
      { title: "狀態機 DP", sections: [6] },
      { title: "其他線性 DP", sections: [7] },
      { title: "區間 DP", sections: [8] },
      { title: "狀態壓縮 DP", sections: [9] },
      { title: "數位 DP", sections: [10] },
      { title: "優化 DP", sections: [11] },
      { title: "樹形 DP", sections: [12] },
      { title: "圖 DP", sections: [13] },
      { title: "博弈 DP", sections: [14] },
      { title: "機率／期望 DP", sections: [15] },
      { title: "專題：輸出具體方案", sections: [16] },
      { title: "專題：前後綴分解", sections: [17] },
      { title: "專題：把 X 變成 Y", sections: [18] },
      { title: "專題：跳躍遊戲", sections: [19] },
    ],
  },
  {
    key: "data_structure",
    title: "常用資料結構",
    chapters: [
      { title: "常用列舉技巧", sections: [1] },
      { title: "前綴和", sections: [2] },
      { title: "差分", sections: [3] },
      { title: "堆疊", sections: [4] },
      { title: "佇列", sections: [5] },
      { title: "堆（優先佇列）", sections: [6] },
      { title: "字典樹（trie）", sections: [7] },
      { title: "並查集", sections: [8] },
      { title: "樹狀陣列和線段樹", sections: [9] },
      { title: "伸展樹", sections: [10] },
      { title: "根號演算法", sections: [11] },
      { title: "專題：離線演算法", sections: [12] },
      { title: "專題：綜合題", sections: [13] },
    ],
  },
  {
    key: "math",
    title: "數學演算法",
    chapters: [
      { title: "數論", sections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { title: "組合數學", sections: [13, 14, 15, 16, 17] },
      { title: "機率期望", sections: [18, 19] },
      { title: "博弈論", sections: [20] },
      { title: "計算幾何", sections: [21, 22, 23, 24] },
      { title: "隨機演算法", sections: [25, 26] },
      // 靈茶 calls this 雜項, but each section is a concrete technique.
      { title: "其他數學主題", sections: [27, 28, 29, 30, 31, 32] },
    ],
  },
  {
    key: "greedy",
    title: "貪心與思維",
    chapters: [
      { title: "貪心策略", sections: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { title: "區間貪心", sections: [10, 11, 12, 13, 14, 15] },
      { title: "字串貪心", sections: [16, 17] },
      { title: "數學貪心", sections: [18, 19, 20, 21, 22, 23, 24] },
      {
        // 靈茶's 思維題 has seven loosely-defined sections; group them by the
        // move the problem asks for instead.
        title: "思維題",
        sections: [25, 26, 27, 28, 29, 30, 31],
        stages: [
          {
            title: "換個角度：特殊到一般、等價轉換、逆向思維",
            sections: [25, 27, 28],
          },
          { title: "計數技巧：貢獻法與兩次掃描", sections: [29, 30] },
          { title: "分類討論與腦筋急轉彎", sections: [31, 26] },
        ],
      },
      { title: "構造題", sections: [32] },
      { title: "互動題", sections: [33] },
    ],
  },
  {
    key: "trees",
    title: "鏈結串列、樹與回溯",
    chapters: [
      { title: "鏈結串列", sections: [1] },
      { title: "二元樹", sections: [2] },
      { title: "一般樹", sections: [3] },
      { title: "回溯", sections: [4] },
      { title: "其他遞迴／分治", sections: [5] },
    ],
  },
  {
    key: "string",
    title: "字串",
    chapters: [
      { title: "KMP（前綴的後綴）", sections: [1] },
      { title: "Z 函式（後綴的前綴）", sections: [2] },
      { title: "Manacher（迴文串）", sections: [3] },
      { title: "字串雜湊", sections: [4] },
      { title: "最小表示法", sections: [5] },
      { title: "字典樹", sections: [6] },
      { title: "AC 自動機", sections: [7] },
      { title: "後綴陣列／後綴自動機", sections: [8] },
      { title: "子序列自動機", sections: [9] },
    ],
  },
];

/**
 * 「其他／雜項」sections we disperse (our adjustment). Their problems move to a
 * more specific section the same problem appears in elsewhere in 0x3F, or to
 * the hand-picked home in MISC_PROBLEM_HOMES.
 */
export const MISC_SECTIONS: Partial<Record<TopicKey, number[]>> = {
  binary_search: [10],
  bitwise_operations: [9],
  graph: [18],
  dynamic_programming: [20],
  math: [33],
  greedy: [34],
  string: [10],
};

/**
 * Hand-picked homes (our adjustment) for problems 0x3F only files under
 * 「其他」, and for the few route problems that aren't in any 0x3F 題單:
 * problem id → [topic, local section title prefix (e.g. "3.1")].
 */
export const PROBLEM_HOMES: Record<string, [TopicKey, string]> = {
  // 二分「其他」: classic binary search on a sorted / rotated array.
  "33": ["binary_search", "2"],
  "153": ["binary_search", "2"],
  "162": ["binary_search", "2"],
  "4": ["binary_search", "8"], // k-th smallest of two sorted arrays
  "1954": ["binary_search", "3"], // binary search the smallest side length
  // 位運算「其他」
  "260": ["bitwise_operations", "2"], // XOR splits the two singles
  "982": ["bitwise_operations", "3.1"],
  "137": ["bitwise_operations", "4.1"], // count each bit mod 3
  "1073": ["bitwise_operations", "4.2"], // base −2 addition
  "1238": ["bitwise_operations", "8"], // Gray code construction
  "3782": ["bitwise_operations", "8"],
  // 圖論「其他」
  "1042": ["greedy", "32"], // greedy colouring is a construction
  "1761": ["graph", "1"],
  // 貪心「其他」
  "1733": ["greedy", "6"], // enumerate the language, then greedy
  "3635": ["greedy", "6"],
  "3002": ["greedy", "31"],
  "2498": ["greedy", "26"],
  // Not in any 0x3F 題單
  "3208": ["sliding_window", "1"],
  "1000000000": ["sliding_window", "7"], // LCP 68 美觀的花束
  "50": ["math", "10"], // fast power
  "3047": ["math", "23"],
  "2249": ["math", "22"],
  "2013": ["data_structure", "1.1"],
  "3484": ["data_structure", "13.1"],
  "1996": ["monotonic_stack", "2"],
  "1001": ["string", "7.1"],
  "241": ["trees", "5.1"],
};

/**
 * Neighbouring sections in a chapter with fewer problems than this are packed
 * into one stage (our adjustment): the route only keeps a curated subset of
 * each 0x3F section, which would otherwise leave dozens of 1-problem stages.
 */
export const MIN_STAGE_SIZE = 4;

/** Stages with more problems than this are split by rating (our adjustment). */
export const SPLIT_THRESHOLD = 12;
/** Target size of each piece when a stage is split. */
export const SPLIT_TARGET = 9;

/**
 * Source sections whose problems don't vote for the topic they're about.
 * Keyed by source plan, then by the source section title.
 */
export const SOURCE_TOPIC_OVERRIDES: Record<
  string,
  Record<string, TopicKey>
> = {
  // 「固定一個維度」 is 靈茶's 常用列舉技巧, not 二分 (its problems' vote).
  rating_2100: { "5. 小專題：固定一個維度": "data_structure" },
};

/** Short labels shown on each problem to say which old plan it came from. */
export const SOURCE_LABELS: Record<string, string> = {
  interview_sprint: "面試衝刺",
  technical_interview: "技術面試",
  q3_handbook: "Q3",
  rating_2100: "1700→2100",
  q4_handbook: "Q4",
};
