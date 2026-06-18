import type { HandbookGroup, HandbookTopic, HandbookTopicRef } from "../model";
import { mlPerformanceSystemDesign } from "./ml-performance-system-design";
import { PATTERN_HANDBOOK_TOPICS } from "./pattern-handbook";

/**
 * Ordered list of every handbook topic. The order doubles as the learning path
 * used for previous/next navigation on each topic page.
 */
export const HANDBOOK_TOPICS: HandbookTopic[] = [
  ...PATTERN_HANDBOOK_TOPICS,
  mlPerformanceSystemDesign,
];

/** Display order of the overview groups. */
export const HANDBOOK_GROUP_ORDER: HandbookGroup[] = [
  "Problem-Solving Mindset",
  "Enumeration and Counting",
  "Core Array/String Patterns",
  "String Patterns",
  "Recursion and Search",
  "Tree Patterns",
  "Graph Patterns",
  "Data Structure Patterns",
  "Greedy Patterns",
  "Dynamic Programming",
  "Range Query and Offline Techniques",
  "Bit and Math Patterns",
  "Math Patterns",
  "Advanced Mixed Patterns",
  "ML Performance System Design",
];

export const HANDBOOK_GROUP_DESCRIPTIONS: Record<HandbookGroup, string> = {
  "Problem-Solving Mindset":
    "如何閱讀限制、從暴力法轉成可通過的模式，並用不變式與證明檢查正確性。",
  "Enumeration and Counting":
    "選對負責者、端點、中心點或貢獻單位，讓龐大的候選集合變得可計數。",
  "Core Array/String Patterns": "陣列與字串中高頻出現的連續區間與值域技巧。",
  "String Patterns": "線性字串匹配與前綴樹技巧：失配函數、雜湊與 Trie。",
  "Recursion and Search": "有系統地探索選擇樹、剪枝，以及分治拆解。",
  "Tree Patterns": "樹遞迴中的遍歷順序、回傳值與參數設計，以及層序搜尋。",
  "Graph Patterns": "連通性、割、遍歷、拓撲順序與安全選邊的圖論正確性思路。",
  "Data Structure Patterns":
    "只保留快速更新所需候選、排名與邊界的精簡資料結構。",
  "Greedy Patterns": "以交換論證、可行性與領先性證明支撐的局部選擇模式。",
  "Dynamic Programming": "重疊子問題、區間決策與優化遞推中的狀態與轉移設計。",
  "Range Query and Offline Techniques":
    "重新排序事件與查詢，讓區間狀態能被增量維護。",
  "Bit and Math Patterns":
    "用 mask 壓縮狀態，或把看似指數的問題編碼到小狀態空間。",
  "Math Patterns":
    "數論工具與對抗遊戲分析：GCD、模運算、篩法、Nim 與 Grundy 值。",
  "Advanced Mixed Patterns": "跨模式的證明與實作約定，讓多種技巧能穩定組合。",
  "ML Performance System Design":
    "面試導向的 ML 效能系統設計：服務、排程、profiling、分散式訓練、優化與取捨。",
};

export const HANDBOOK_GROUP_TITLES: Record<HandbookGroup, string> = {
  "Problem-Solving Mindset": "解題心法",
  "Enumeration and Counting": "枚舉與計數",
  "Core Array/String Patterns": "陣列與字串核心模式",
  "String Patterns": "字串模式",
  "Recursion and Search": "遞迴與搜尋",
  "Tree Patterns": "樹模式",
  "Graph Patterns": "圖論模式",
  "Data Structure Patterns": "資料結構模式",
  "Greedy Patterns": "貪心模式",
  "Dynamic Programming": "動態規劃",
  "Range Query and Offline Techniques": "區間查詢與離線技巧",
  "Bit and Math Patterns": "位元與數學模式",
  "Math Patterns": "數學模式",
  "Advanced Mixed Patterns": "進階混合模式",
  "ML Performance System Design": "ML 效能系統設計",
};

const TOPIC_BY_SLUG = new Map(HANDBOOK_TOPICS.map((t) => [t.slug, t]));

export function getHandbookTopic(slug: string): HandbookTopic | undefined {
  return TOPIC_BY_SLUG.get(slug);
}

export function getHandbookTopicSlugs(): string[] {
  return HANDBOOK_TOPICS.map((t) => t.slug);
}

/** Previous/next topic refs for in-page footer navigation. */
export function getAdjacentTopics(slug: string): {
  prev?: HandbookTopicRef;
  next?: HandbookTopicRef;
} {
  const idx = HANDBOOK_TOPICS.findIndex((t) => t.slug === slug);
  if (idx === -1) return {};
  const toRef = (t: HandbookTopic): HandbookTopicRef => ({
    slug: t.slug,
    title: t.title,
  });
  return {
    prev: idx > 0 ? toRef(HANDBOOK_TOPICS[idx - 1]!) : undefined,
    next:
      idx < HANDBOOK_TOPICS.length - 1
        ? toRef(HANDBOOK_TOPICS[idx + 1]!)
        : undefined,
  };
}

/** Topics grouped by their `group`, in `HANDBOOK_GROUP_ORDER`. */
export function getHandbookTopicsByGroup(): {
  group: HandbookGroup;
  topics: HandbookTopic[];
}[] {
  return HANDBOOK_GROUP_ORDER.map((group) => ({
    group,
    topics: HANDBOOK_TOPICS.filter((t) => t.group === group),
  })).filter((entry) => entry.topics.length > 0);
}
