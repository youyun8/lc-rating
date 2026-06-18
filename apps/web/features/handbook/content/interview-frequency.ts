import type { InterviewFrequency } from "../model";

/**
 * Interview-frequency ranking of every handbook chapter.
 *
 * Composite score = 0.40 * companyFrequency + 0.30 * contestAppearance
 *                 + 0.30 * studyGuideProminence
 *
 *  - companyFrequency (40%): how often the chapter's problems carry LeetCode
 *    "asked by" company tags (FAANG, Microsoft, …), synthesized into a 0-100
 *    prominence score.
 *  - contestAppearance (30%): objective — the number of the chapter's Section 10
 *    problems whose contest rating falls in the 1700-2000 band, normalized to
 *    0-100 across all chapters.
 *  - studyGuideProminence (30%): prominence across NeetCode roadmap, Grind
 *    75/150, Blind 75, and Sean Prashad's patterns list, as a 0-100 score.
 *
 * Frequency tiers: High = ranks 1-5, Medium = ranks 6-15, Low = ranks 16+.
 *
 * This file is generated/maintained as the single source of truth for both the
 * /handbook/interview-frequency page and the per-chapter frequency badge.
 */
export interface InterviewFrequencyEntry {
  /** Handbook topic slug. */
  slug: string;
  /** 1-based rank, most-frequently-asked first. */
  rank: number;
  /** Frequency tier derived from rank. */
  frequency: InterviewFrequency;
  /** One-sentence composite-score rationale. */
  rationale: string;
}

/** Full ranking, sorted by rank ascending (rank 1 = most frequently asked). */
export const INTERVIEW_FREQUENCY_RANKING: InterviewFrequencyEntry[] = [
  {
    slug: "dp-state-design",
    rank: 1,
    frequency: "High",
    rationale:
      "選擇 DP 狀態是 Blind 75 / NeetCode 150 中經過嚴格測試的 DP 區塊的關鍵。",
  },
  {
    slug: "hash-map-frequency",
    rank: 2,
    frequency: "High",
    rationale:
      "最常見的面試工具——Two Sum、anagram 和 subarray-sum 問題幾乎打開了每個 FAANG 螢幕，並成為每個研究清單的標題。",
  },
  {
    slug: "two-pointers-opposite",
    rank: 3,
    frequency: "High",
    rationale:
      "幾乎所有頂級公司都詢問過 Blind 75 / NeetCode / 研磨主食（3Sum，裝有水的容器）。",
  },
  {
    slug: "graph-traversal",
    rank: 4,
    frequency: "High",
    rationale:
      "島嶼數樣式 BFS/DFS 是最常被問到的模式之一，也是每個圖形研究單元的核心。",
  },
  {
    slug: "sliding-window",
    rank: 5,
    frequency: "High",
    rationale:
      "最長/最短子字串問題是最常見的 FAANG 模式，並且在每個路線圖中都有一個專用部分。",
  },
  {
    slug: "linked-list-patterns",
    rank: 6,
    frequency: "Medium",
    rationale:
      "反向清單、循環和合併問題固定在 Blind 75 / Grind 75 的鍊錶塊中，並且仍然是預設的手機螢幕熱身，儘管這種模式在比賽中幾乎不存在。",
  },
  {
    slug: "tree-traversal",
    rank: 7,
    frequency: "Medium",
    rationale:
      "二元樹 DFS/BFS 回傳值設計是面試的基礎和一個大的 NeetCode/Grind 區塊。",
  },
  {
    slug: "heap-patterns",
    rank: 8,
    frequency: "Medium",
    rationale: "Top-K 和 merge-k-lists 堆問題是經常被問到的標準路線圖部分。",
  },
  {
    slug: "design-data-structures",
    rank: 9,
    frequency: "Medium",
    rationale:
      "LRU 快取是大公司中最常被問到的實施問題之一，儘管沒有提供任何競爭評級訊號，但設計問題仍成為研究的頭條新聞。",
  },
  {
    slug: "binary-search-on-answer",
    rank: 10,
    frequency: "Medium",
    rationale:
      "二分搜尋及其「搜尋答案」變體（Koko，幾天內發貨）是一種頂級的、引導突出的模式。",
  },
  {
    slug: "interval-merging",
    rank: 11,
    frequency: "Medium",
    rationale: "合併/插入間隔和會議室是每個清單中的經典高頻問題。",
  },
  {
    slug: "shortest-paths",
    rank: 12,
    frequency: "Medium",
    rationale:
      "Dijkstra 和 Bellman-Ford 錨定了學習路線圖的高級圖形塊，並經常出現在 1700-2000 競賽區間中，儘管公司螢幕上觸及它們的頻率低於核心遍歷。",
  },
  {
    slug: "dp-transition-design",
    rank: 13,
    frequency: "Medium",
    rationale: "DP（背包、編輯距離）的過渡部分是跨學習指南的高頻跟進。",
  },
  {
    slug: "backtracking",
    rank: 14,
    frequency: "Medium",
    rationale: "子集/排列/組合和不斷重複並形成完整的路線圖部分。",
  },
  {
    slug: "topological-sort",
    rank: 15,
    frequency: "Medium",
    rationale: "課程表式排序是 NeetCode/Prashad 中常見的圖形後續和命名模式。",
  },
  {
    slug: "sorting-as-a-tool",
    rank: 16,
    frequency: "Low",
    rationale:
      "「排序然後掃描」設定是許多中等問題的基礎，並出現在整個策劃清單中。",
  },
  {
    slug: "monotonic-data-structures",
    rank: 17,
    frequency: "Low",
    rationale:
      "每日溫度/下一個更大的單調堆疊問題重複出現並形成可識別的模式單元。",
  },
  {
    slug: "enumeration-strategy",
    rank: 18,
    frequency: "Low",
    rationale:
      "選擇要列舉的內容是一種廣泛有用的數數元模式，具有適度的直接暴露。",
  },
  {
    slug: "prefix-suffix-decomposition",
    rank: 19,
    frequency: "Low",
    rationale: "前綴和/除自身之外的陣列的乘積問題很常見，並且是標準清單條目。",
  },
  {
    slug: "union-find",
    rank: 20,
    frequency: "Low",
    rationale: "連接組件和冗餘連接問題定期出現，並有一個專門的路線圖單元。",
  },
  {
    slug: "fix-right-maintain-left",
    rank: 21,
    frequency: "Low",
    rationale: "滑動視窗的右擴展/左收縮計數變體是常見的中等後續操作。",
  },
  {
    slug: "trie",
    rank: 22,
    frequency: "Low",
    rationale:
      "Implement-Trie和word-search-II出現在NeetCode/Grind中，現場訪談頻率適中。",
  },
  {
    slug: "feasibility-check",
    rank: 23,
    frequency: "Low",
    rationale:
      "二分搜尋可行性檢查是一種經常出現的中/硬設備，在指南中有所體現。",
  },
  {
    slug: "greedy-construction",
    rank: 24,
    frequency: "Low",
    rationale: "跳躍遊戲/加油站貪婪結構經常被被問到並出現在學習指南中。",
  },
  {
    slug: "state-compression",
    rank: 25,
    frequency: "Low",
    rationale: "Bitmask DP 出現在較難/進階循環和競爭性準備中，日常頻率較低。",
  },
  {
    slug: "number-theory-and-math",
    rank: 26,
    frequency: "Low",
    rationale:
      "GCD/質數/pow 問題會定期出現，並且在大多數路線圖中都有數學部分。",
  },
  {
    slug: "difference-array",
    rank: 27,
    frequency: "Low",
    rationale: "航程更新/公司航班預訂問題的出現​​頻率適中，大部分為中等頻率。",
  },
  {
    slug: "string-matching",
    rank: 28,
    frequency: "Low",
    rationale:
      "KMP/Rabin-Karp 和查找索引問題的出現​​率適中，主要出現在字串較多的公司。",
  },
  {
    slug: "state-design",
    rank: 29,
    frequency: "Low",
    rationale:
      "命名正確的狀態是許多 DP/圖面試問題背後的一項實際上很重要的元技能。",
  },
  {
    slug: "constraint-driven-thinking",
    rank: 30,
    frequency: "Low",
    rationale: "閱讀約束來選擇方法是一項高價值的元技能，而不是標記的面試主題。",
  },
  {
    slug: "brute-force-to-optimization",
    rank: 31,
    frequency: "Low",
    rationale:
      "從暴力中優化的心態在每次面試中都很重要，但它本身並不是一種標記問題類型。",
  },
  {
    slug: "boundary-and-edge-case-thinking",
    rank: 32,
    frequency: "Low",
    rationale:
      "每次面試都會獎勵邊緣案例紀律，但它是一項跨領域技能，而不是一個獨立的主題。",
  },
  {
    slug: "divide-and-conquer",
    rank: 33,
    frequency: "Low",
    rationale:
      "大多數清單中都包含合併排序、排序清單和較小的分而治之問題的計數。",
  },
  {
    slug: "greedy-stays-ahead",
    rank: 34,
    frequency: "Low",
    rationale: "保持領先的證明方式支持幾個貪婪的答案，但很少是明確的要求。",
  },
  {
    slug: "enumerate-pivot-middle",
    rank: 35,
    frequency: "Low",
    rationale:
      "固定中間計數（類似 3Sum，計數三元組）是一種偶爾具有競賽風格的媒介。",
  },
  {
    slug: "segment-tree-and-fenwick-tree",
    rank: 36,
    frequency: "Low",
    rationale:
      "在標準面試中很少見，但卻是競賽和高級/競爭性學習課程的主要內容。",
  },
  {
    slug: "exchange-argument",
    rank: 37,
    frequency: "Low",
    rationale: "貪婪正確性證明工具主要出現在競賽程式設計中，很少明確詢問。",
  },
  {
    slug: "loop-invariant",
    rank: 38,
    frequency: "Low",
    rationale: "一個正確性紀律合約，支持二分搜尋/雙指標答案而不是被詢問。",
  },
  {
    slug: "invariant-thinking",
    rank: 39,
    frequency: "Low",
    rationale:
      "使用不變量進行推理可以強化許多答案，但它是作為一種方法來教導的，而不是直接提出的。",
  },
  {
    slug: "sweep-line",
    rank: 40,
    frequency: "Low",
    rationale: "會議室-II 和天際線掃描偶爾會出現，大多是更困難的後續行動。",
  },
  {
    slug: "cut-property",
    rank: 41,
    frequency: "Low",
    rationale:
      "MST 安全邊緣論點很少在專業角色之外接受採訪，但在理論上是基礎性的。",
  },
  {
    slug: "game-theory",
    rank: 42,
    frequency: "Low",
    rationale:
      "Stone-game / Nim 問題很少出現，並且僅在少數公司中出現，但在 DP 研究集中出現。",
  },
  {
    slug: "contribution-counting",
    rank: 43,
    frequency: "Low",
    rationale:
      "子數組最小值總和貢獻計數是一種傾向於競賽的技術，在面試中並不常見。",
  },
  {
    slug: "proof-techniques",
    rank: 44,
    frequency: "Low",
    rationale:
      "歸納/交換/矛盾證明是證明解決方案合理性的元技能，而不是面試主題。",
  },
  {
    slug: "offline-query-processing",
    rank: 45,
    frequency: "Low",
    rationale: "離線重新排序查詢幾乎完全是一種競爭性程式設計技術。",
  },
  {
    slug: "coordinate-compression",
    rank: 46,
    frequency: "Low",
    rationale: "BIT/線段樹問題的預處理步驟；在訪談中很少見，在比賽中常見。",
  },
  {
    slug: "ml-performance-system-design",
    rank: 47,
    frequency: "Low",
    rationale: "專門的 ML-infra 訪談軌道，位於標準編碼模式頻率清單之外。",
  },
];

const BY_SLUG = new Map(INTERVIEW_FREQUENCY_RANKING.map((e) => [e.slug, e]));

/** Frequency tier for a chapter slug (defaults to "Low" if unranked). */
export function getInterviewFrequency(slug: string): InterviewFrequency {
  return BY_SLUG.get(slug)?.frequency ?? "Low";
}

/** Full ranking entry for a chapter slug, if present. */
export function getInterviewFrequencyEntry(
  slug: string,
): InterviewFrequencyEntry | undefined {
  return BY_SLUG.get(slug);
}
