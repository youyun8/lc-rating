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
  "Data Structure Patterns",
  "Greedy Patterns",
  "Graph Patterns",
  "Dynamic Programming",
  "Range Query and Offline Techniques",
  "Bit and Math Patterns",
  "Advanced Mixed Patterns",
  "ML Performance System Design",
];

export const HANDBOOK_GROUP_DESCRIPTIONS: Record<HandbookGroup, string> = {
  "Problem-Solving Mindset":
    "How to read constraints, move from brute force to optimized patterns, and reason with invariants and proofs.",
  "Enumeration and Counting":
    "Choosing the right owner, endpoint, pivot, or contribution unit so large candidate sets become countable.",
  "Core Array/String Patterns":
    "High-frequency contiguous and value-space techniques for arrays and strings.",
  "Data Structure Patterns":
    "Compact structures that preserve only the candidates, ranks, and boundaries needed for fast updates.",
  "Greedy Patterns":
    "Local-choice patterns backed by exchange, feasibility, and stays-ahead proofs.",
  "Graph Patterns":
    "Graph correctness ideas for connectivity, cuts, and safe edge choices.",
  "Dynamic Programming":
    "State and transition design for overlapping subproblems, interval decisions, and optimized recurrences.",
  "Range Query and Offline Techniques":
    "Reordering events and queries so range state can be maintained incrementally.",
  "Bit and Math Patterns":
    "Mask-based state compression and small-domain encodings for exponential-looking problems.",
  "Advanced Mixed Patterns":
    "Cross-cutting proof and implementation contracts that make multiple patterns reliable.",
  "ML Performance System Design":
    "Interview-focused ML performance system design: serving, scheduling, profiling, distributed training, optimization, and tradeoffs.",
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
