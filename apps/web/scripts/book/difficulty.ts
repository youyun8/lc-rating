/**
 * Difficulty edition: split the lecture sections into three volumes
 * (簡單 / 中等 / 困難) instead of one book ordered by topic.
 *
 * A leaf section's level comes from the median contest rating of the rated
 * problems in its practice tables (zerotrac 力扣競賽難度分數). The cut points
 * follow the weekly-contest slots the ratings were fitted on:
 *
 *   簡單  < 1600   (週賽第一、二題；面試的暖身題與基本功)
 *   中等  1600–2099 (週賽第二、三題；技術面試的主戰場)
 *   困難  ≥ 2100   (週賽第三、四題；高階職缺與競賽向技巧)
 *
 * `OVERRIDES` pins sections whose practice tables are skewed by unrated
 * classics (爬樓梯、打家劫舍、反轉連結串列 …) or have no rated problems at
 * all. Group sections (those with children) are not classified: a volume keeps
 * a group whenever it keeps one of its descendants, together with the group's
 * short introduction.
 */
import type { TutorialData } from "../../types";

export type Level = "easy" | "medium" | "hard";

export const LEVELS: Level[] = ["easy", "medium", "hard"];

export interface VolumeInfo {
  level: Level;
  /** 冊次, e.g. 上冊. */
  ordinal: string;
  /** Volume name printed on the cover, e.g. 簡單篇. */
  name: string;
  /** Single-character mark used on the spine and in cross references. */
  mark: string;
  english: string;
  ratingRange: string;
  contestSlot: string;
  tagline: string;
  /** Accent colour (interior headings, cover). */
  accent: string;
  accentSoft: string;
  /** Cover gradient stops, dark to light. */
  coverDark: string;
  coverMid: string;
  coverGlow: string;
  /** Book file suffix. */
  slug: string;
  /** Back-cover copy, one string per paragraph. */
  blurb: string[];
  /** 「本冊怎麼讀」 bullets in the volume guide. */
  howTo: string[];
}

export const RATING_CUTS = { medium: 1600, hard: 2100 } as const;

export const VOLUMES: Record<Level, VolumeInfo> = {
  easy: {
    level: "easy",
    ordinal: "上冊",
    name: "簡單篇",
    mark: "簡",
    english: "FOUNDATIONS",
    ratingRange: "難度分數 1600 以下",
    contestSlot: "週賽第一、二題",
    tagline:
      "把基本功練到不假思索：雙指標、二分、字首和、堆疊佇列、連結串列與二元樹遍歷",
    accent: "#0f766e",
    accentSoft: "#e6f6f3",
    coverDark: "#04211f",
    coverMid: "#0b4a45",
    coverGlow: "#2dd4bf",
    slug: "easy",
    blurb: [
      "本冊收錄練習題難度分數中位數低於 1600 的小節：雙指標與滑動視窗、二分搜尋模板、字首和與差分、堆疊與佇列、堆的基本用法、連結串列與二元樹遍歷、入門 DP、基礎數論與貪心。",
      "這些是每一場技術面試的地基。每一節從「暴力為何不夠」講起，經過題型訊號與不變量證明，到可以直接默寫的 C++17 模板，最後附上依難度分數排序的練習題。",
    ],
    howTo: [
      "目標是「看到就能寫、寫了就對」：每節的 C++17 模板要能在 5 分鐘內默寫出來，並說出迴圈不變量。",
      "先讀「辨識題型的訊號」與「核心想法與直覺」，再做練習表中分數最低的三題；做完再回頭讀「常見錯誤與邊界條件」，逐條確認自己的程式沒有踩到。",
      "附錄 A 的 STL 速查與陷阱清單，是 C++ 面試最常被追問的細節，建議在第一週讀完。",
      "讀完本冊後，用附錄 C 檢查面試高頻題中標示「簡」的題目是否都能獨立完成。",
    ],
  },
  medium: {
    level: "medium",
    ordinal: "中冊",
    name: "中等篇",
    mark: "中",
    english: "INTERVIEW CORE",
    ratingRange: "難度分數 1600 – 2099",
    contestSlot: "週賽第二、三題",
    tagline:
      "技術面試的主戰場：二分答案、單調堆疊、圖搜尋、經典 DP、回溯與貪心證明",
    accent: "#1d4ed8",
    accentSoft: "#eef3ff",
    coverDark: "#071330",
    coverMid: "#132f6e",
    coverGlow: "#60a5fa",
    slug: "medium",
    blurb: [
      "本冊收錄難度分數 1600 到 2099 的小節，也就是多數公司白板題所在的難度：二分答案、單調堆疊、圖與網格的 DFS／BFS、Dijkstra、經典線性 DP 與背包、回溯，以及區間與交換論證的貪心。",
      "中等題的變形最多，只背模板很容易在邊界上出錯。本冊每一節都把「不變量或正確性證明」寫完整，讓你在題目換了包裝時仍然寫得對。",
    ],
    howTo: [
      "本冊是技術面試的主戰場，目標是在 20 分鐘內從題目走到正確的程式碼，並能口頭說明複雜度。",
      "每一節先遮住「核心想法與直覺」，只看「辨識題型的訊號」與一道代表例題，自己想 10 分鐘再讀解說。",
      "「不變量或正確性證明」務必讀懂：面試官追問「為什麼這樣是對的」時，答案就在這一段。",
      "練習時把附錄 B 的答題流程完整走一遍，包括釐清題意、先說暴力解、最後用邊界測資自我檢查。",
    ],
  },
  hard: {
    level: "hard",
    ordinal: "下冊",
    name: "困難篇",
    mark: "難",
    english: "ADVANCED",
    ratingRange: "難度分數 2100 以上",
    contestSlot: "週賽第三、四題",
    tagline:
      "高階職缺與競賽向技巧：線段樹、狀壓與數位 DP、DP 優化、樹上演算法與字串演算法",
    accent: "#9f1239",
    accentSoft: "#fff0f3",
    coverDark: "#1f0610",
    coverMid: "#5b0f2a",
    coverGlow: "#fb7185",
    slug: "hard",
    blurb: [
      "本冊收錄難度分數 2100 以上的小節：樹狀陣列與線段樹、並查集進階、狀態壓縮與數位 DP、各種 DP 優化、樹形 DP 與換根、LCA 與倍增、Z 函式、Manacher 與 AC 自動機，以及組合計數與容斥。",
      "這些技巧在一般面試是加分題，在演算法導向的職缺則可能是主考題。本冊把每個技巧的適用訊號與取捨講清楚，讓你知道何時該用、何時該退回較簡單的做法。",
    ],
    howTo: [
      "本冊不必全部精熟：優先掌握每節的「辨識題型的訊號」與「時間與空間複雜度」，面試時能說出方向並分析複雜度，往往已能拿到大部分分數。",
      "「與相似技巧的比較」特別重要：困難題常是兩三個技巧的組合，知道何時退回較簡單的做法同樣是實力。",
      "建議先讀完上冊與中冊的相關小節（各章章末列出），再進入本冊對應的章節。",
      "模板較長的小節（線段樹、AC 自動機等），先手寫一次並用練習表中分數最低的題目驗證，再整理成自己的模板庫。",
    ],
  },
};

/**
 * Pinned levels, keyed by `category/section title`. `"all"` puts the section
 * in every volume that already contains its chapter (used for the short
 * 常見面試模式 summary tables that close each chapter).
 */
const OVERRIDES: Record<string, Level | "all"> = {
  // Classic interview warm-ups whose signature problems (70, 198, 53, 206,
  // 543, 172 …) carry no contest rating; the rated problems listed after them
  // are harder variations.
  "dynamic_programming/1.1 爬樓梯": "easy",
  "dynamic_programming/1.2 打家劫舍": "easy",
  "dynamic_programming/1.3 最大子陣列和（最大子段和）": "easy",
  "trees/1.4 反轉連結串列": "easy",
  "trees/2.6 二叉樹的直徑": "easy",
  "math/4. 階乘分解": "easy",
  // Core interview techniques whose practice tables lean hard.
  "dynamic_programming/3.1 0-1 背包": "medium",
  "trees/4.4 組合型回溯": "medium",
  // No rated problems: placed by content.
  "sliding_window/24. 雙指針（Two Pointers）": "easy",
  "sliding_window/14. 同向雙指標 > 相似題目": "hard",
  "trees/1.7 雙指標": "easy",
  "trees/1.9 分治": "medium",
  "trees/1.11 其他": "medium",
  "trees/2.11 插入/刪除節點": "medium",
  "trees/2.15 N 叉樹": "easy",
  "trees/4.1 入門回溯": "medium",
  "data_structure/4.7 單調堆疊": "medium",
  "greedy/36. 區間（Intervals）": "medium",
  "math/24. 凸包": "hard",
  "math/25. 隨機數": "medium",
};

const ALL_RE = /常見面試模式/;

/** Contest ratings of the practice-table rows in one section's markdown. */
export function tableRatings(md: string): number[] {
  const out: number[] = [];
  for (const m of md.matchAll(
    /^\|\s*[^|\n]+\|\s*\[[^\]]+\]\([^)]*\)[^|\n]*\|\s*(\d{3,4})\s*\|/gm,
  )) {
    out.push(Number(m[1]));
  }
  return out;
}

export function median(xs: number[]): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1];
}

export function levelOfRating(r: number): Level {
  if (r < RATING_CUTS.medium) return "easy";
  if (r < RATING_CUTS.hard) return "medium";
  return "hard";
}

/** Level of a leaf section, or `"all"`. Throws on an unclassifiable leaf. */
export function classifyLeaf(
  category: string,
  section: TutorialData.Section,
): Level | "all" {
  const key = `${category}/${section.title}`;
  const pinned = OVERRIDES[key];
  if (pinned) return pinned;
  if (ALL_RE.test(section.title)) return "all";
  const med = median(tableRatings(section.summary ?? ""));
  if (med === undefined) {
    throw new Error(
      `[book] cannot classify ${key}: no rated problems and no override in difficulty.ts`,
    );
  }
  return levelOfRating(med);
}

export interface LeafInfo {
  category: string;
  section: TutorialData.Section;
  level: Level | "all";
  median?: number;
}

export function leaves(category: string, root: TutorialData.Root): LeafInfo[] {
  const out: LeafInfo[] = [];
  const walk = (ss: TutorialData.Section[] | undefined) => {
    for (const s of ss ?? []) {
      if (s.children?.length) walk(s.children);
      else if (s.summary?.trim())
        out.push({
          category,
          section: s,
          level: classifyLeaf(category, s),
          median: median(tableRatings(s.summary)),
        });
    }
  };
  walk(root.children);
  return out;
}

/**
 * The part of a chapter that belongs in one volume, or `null` when the
 * volume has no real (non-"all") section of this chapter.
 */
export function filterRoot(
  category: string,
  root: TutorialData.Root,
  level: Level,
): TutorialData.Root | null {
  let real = 0;
  const keep = (
    ss: TutorialData.Section[] | undefined,
  ): TutorialData.Section[] => {
    const out: TutorialData.Section[] = [];
    for (const s of ss ?? []) {
      if (s.children?.length) {
        const kids = keep(s.children);
        if (kids.length) out.push({ ...s, children: kids });
      } else if (s.summary?.trim()) {
        const lv = classifyLeaf(category, s);
        if (lv === level) real++;
        if (lv === level || lv === "all") out.push(s);
      }
    }
    return out;
  };
  const children = keep(root.children);
  if (!real) return null;
  return { ...root, children };
}

/** Section counts per level for one chapter (the "all" sections are not counted). */
export function levelCounts(
  category: string,
  root: TutorialData.Root,
): Record<Level, number> {
  const counts: Record<Level, number> = { easy: 0, medium: 0, hard: 0 };
  for (const l of leaves(category, root))
    if (l.level !== "all") counts[l.level]++;
  return counts;
}
