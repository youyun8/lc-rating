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
      "Choosing the DP state is the crux of the heavily-tested DP block in Blind 75 / NeetCode 150.",
  },
  {
    slug: "hash-map-frequency",
    rank: 2,
    frequency: "High",
    rationale:
      "The single most common interview tool — Two Sum, anagram, and subarray-sum problems open nearly every FAANG screen and headline every study list.",
  },
  {
    slug: "two-pointers-opposite",
    rank: 3,
    frequency: "High",
    rationale:
      "A Blind 75 / NeetCode / Grind staple (3Sum, container-with-water) asked across virtually all top companies.",
  },
  {
    slug: "graph-traversal",
    rank: 4,
    frequency: "High",
    rationale:
      "Number-of-islands-style BFS/DFS is among the most-asked patterns and central to every graph study unit.",
  },
  {
    slug: "sliding-window",
    rank: 5,
    frequency: "High",
    rationale:
      "Longest/shortest-substring questions are a top-frequency FAANG pattern and a dedicated section in every roadmap.",
  },
  {
    slug: "linked-list-patterns",
    rank: 6,
    frequency: "Medium",
    rationale:
      "Reverse-list, cycle, and merge questions anchor the linked-list block of Blind 75 / Grind 75 and remain a default phone-screen warm-up, though the pattern is nearly absent from contests.",
  },
  {
    slug: "tree-traversal",
    rank: 7,
    frequency: "Medium",
    rationale:
      "Binary-tree DFS/BFS return-value design is interview bread-and-butter and a large NeetCode/Grind block.",
  },
  {
    slug: "heap-patterns",
    rank: 8,
    frequency: "Medium",
    rationale:
      "Top-K and merge-k-lists heap problems are frequently asked and a standard roadmap section.",
  },
  {
    slug: "design-data-structures",
    rank: 9,
    frequency: "Medium",
    rationale:
      "LRU Cache is among the most-asked implementation questions at large companies, and design problems headline study lists despite contributing no contest-rating signal.",
  },
  {
    slug: "binary-search-on-answer",
    rank: 10,
    frequency: "Medium",
    rationale:
      "Binary search and its 'search the answer' variant (Koko, ship-within-days) are a top-tier, guide-prominent pattern.",
  },
  {
    slug: "interval-merging",
    rank: 11,
    frequency: "Medium",
    rationale:
      "Merge/insert intervals and meeting-rooms are classic high-frequency questions in every list.",
  },
  {
    slug: "shortest-paths",
    rank: 12,
    frequency: "Medium",
    rationale:
      "Dijkstra and Bellman-Ford anchor the advanced-graph block of study roadmaps and appear frequently in the 1700-2000 contest band, though company screens reach for them less often than core traversal.",
  },
  {
    slug: "dp-transition-design",
    rank: 13,
    frequency: "Medium",
    rationale:
      "The transition half of DP (knapsack, edit distance) is a high-frequency follow-up across study guides.",
  },
  {
    slug: "backtracking",
    rank: 14,
    frequency: "Medium",
    rationale:
      "Subsets/permutations/combination-sum recur constantly and form a full roadmap section.",
  },
  {
    slug: "topological-sort",
    rank: 15,
    frequency: "Medium",
    rationale:
      "Course-Schedule-style ordering is a common graph follow-up and a named pattern in NeetCode/Prashad.",
  },
  {
    slug: "sorting-as-a-tool",
    rank: 16,
    frequency: "Low",
    rationale:
      "Sort-then-scan setups underpin many medium questions and appear throughout the curated lists.",
  },
  {
    slug: "monotonic-data-structures",
    rank: 17,
    frequency: "Low",
    rationale:
      "Daily-temperatures / next-greater monotonic-stack questions recur and form a recognizable pattern unit.",
  },
  {
    slug: "enumeration-strategy",
    rank: 18,
    frequency: "Low",
    rationale:
      "Choosing what to enumerate is a broadly useful counting meta-pattern with moderate direct exposure.",
  },
  {
    slug: "prefix-suffix-decomposition",
    rank: 19,
    frequency: "Low",
    rationale:
      "Prefix-sum / product-of-array-except-self problems are common and a standard list entry.",
  },
  {
    slug: "union-find",
    rank: 20,
    frequency: "Low",
    rationale:
      "Connected-components and redundant-connection problems show up regularly and have a dedicated roadmap unit.",
  },
  {
    slug: "fix-right-maintain-left",
    rank: 21,
    frequency: "Low",
    rationale:
      "The expand-right / shrink-left counting variant of sliding window is a common medium follow-up.",
  },
  {
    slug: "trie",
    rank: 22,
    frequency: "Low",
    rationale:
      "Implement-Trie and word-search-II appear in NeetCode/Grind, with moderate live-interview frequency.",
  },
  {
    slug: "feasibility-check",
    rank: 23,
    frequency: "Low",
    rationale:
      "Binary-search feasibility checks are a recurring medium/hard device, moderately represented in guides.",
  },
  {
    slug: "greedy-construction",
    rank: 24,
    frequency: "Low",
    rationale:
      "Jump-game / gas-station greedy constructions are frequently asked and appear across study guides.",
  },
  {
    slug: "state-compression",
    rank: 25,
    frequency: "Low",
    rationale:
      "Bitmask DP surfaces in harder/senior loops and competitive prep, with low everyday frequency.",
  },
  {
    slug: "number-theory-and-math",
    rank: 26,
    frequency: "Low",
    rationale:
      "GCD/primes/pow problems show up periodically and have a math section in most roadmaps.",
  },
  {
    slug: "difference-array",
    rank: 27,
    frequency: "Low",
    rationale:
      "Range-update / corporate-flight-bookings problems appear at a moderate, mostly-medium frequency.",
  },
  {
    slug: "string-matching",
    rank: 28,
    frequency: "Low",
    rationale:
      "KMP/Rabin-Karp and find-the-index questions appear at a moderate rate, mostly at string-heavy companies.",
  },
  {
    slug: "state-design",
    rank: 29,
    frequency: "Low",
    rationale:
      "Naming the right state is a practically important meta-skill underlying many DP/graph interview questions.",
  },
  {
    slug: "constraint-driven-thinking",
    rank: 30,
    frequency: "Low",
    rationale:
      "Reading constraints to pick an approach is a high-value meta-skill rather than a tagged interview topic.",
  },
  {
    slug: "brute-force-to-optimization",
    rank: 31,
    frequency: "Low",
    rationale:
      "The optimize-from-brute-force mindset matters in every interview but is not itself a tagged question type.",
  },
  {
    slug: "boundary-and-edge-case-thinking",
    rank: 32,
    frequency: "Low",
    rationale:
      "Edge-case discipline is rewarded in every interview but is a cross-cutting skill, not a standalone topic.",
  },
  {
    slug: "divide-and-conquer",
    rank: 33,
    frequency: "Low",
    rationale:
      "Merge-sort, sort-list, and count-of-smaller divide-and-conquer questions feature in most lists.",
  },
  {
    slug: "greedy-stays-ahead",
    rank: 34,
    frequency: "Low",
    rationale:
      "The stays-ahead proof style backs several greedy answers but is rarely the explicit ask.",
  },
  {
    slug: "enumerate-pivot-middle",
    rank: 35,
    frequency: "Low",
    rationale:
      "Fix-the-middle counting (3Sum-like, count-triplets) is an occasional contest-flavored medium.",
  },
  {
    slug: "segment-tree-and-fenwick-tree",
    rank: 36,
    frequency: "Low",
    rationale:
      "Rare in standard interviews but a staple of contests and senior/competitive study tracks.",
  },
  {
    slug: "exchange-argument",
    rank: 37,
    frequency: "Low",
    rationale:
      "A greedy-correctness proof tool seen mainly in competitive programming, seldom asked explicitly.",
  },
  {
    slug: "loop-invariant",
    rank: 38,
    frequency: "Low",
    rationale:
      "A correctness-discipline contract that supports binary-search/two-pointer answers rather than being asked.",
  },
  {
    slug: "invariant-thinking",
    rank: 39,
    frequency: "Low",
    rationale:
      "Reasoning with invariants strengthens many answers but is taught as a method, not asked directly.",
  },
  {
    slug: "sweep-line",
    rank: 40,
    frequency: "Low",
    rationale:
      "Meeting-rooms-II and skyline sweeps appear occasionally, mostly as harder follow-ups.",
  },
  {
    slug: "cut-property",
    rank: 41,
    frequency: "Low",
    rationale:
      "The MST safe-edge argument is rarely interviewed outside specialized roles, but foundational in theory.",
  },
  {
    slug: "game-theory",
    rank: 42,
    frequency: "Low",
    rationale:
      "Stone-game / Nim questions appear infrequently and only at a few companies, but feature in DP study sets.",
  },
  {
    slug: "contribution-counting",
    rank: 43,
    frequency: "Low",
    rationale:
      "Sum-of-subarray-minimums contribution counting is a contest-leaning technique, uncommon in interviews.",
  },
  {
    slug: "proof-techniques",
    rank: 44,
    frequency: "Low",
    rationale:
      "Induction/exchange/contradiction proofs are a meta-skill for justifying solutions, not an interview topic.",
  },
  {
    slug: "offline-query-processing",
    rank: 45,
    frequency: "Low",
    rationale:
      "Reordering queries offline is almost exclusively a competitive-programming technique.",
  },
  {
    slug: "coordinate-compression",
    rank: 46,
    frequency: "Low",
    rationale:
      "A preprocessing step for BIT/segment-tree problems; rare in interviews, common in contests.",
  },
  {
    slug: "ml-performance-system-design",
    rank: 47,
    frequency: "Low",
    rationale:
      "A specialized ML-infra interview track, outside the standard coding-pattern frequency lists.",
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
