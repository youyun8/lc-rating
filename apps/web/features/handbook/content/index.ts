import type { HandbookGroup, HandbookTopic, HandbookTopicRef } from "../model";
import { competitiveProgrammingEssentials } from "./competitive-programming-essentials";
import { mlPerformanceSystemDesign } from "./ml-performance-system-design";
import { binarySearch } from "./binary-search";
import { sorting } from "./sorting";
import { twoPointers } from "./two-pointers";
import { slidingWindow } from "./sliding-window";
import { prefixSumHashing } from "./prefix-sum-hashing";
import { monotonicStackVsDeque } from "./monotonic-stack-vs-deque";
import { contribution } from "./contribution";
import { greedy } from "./greedy";
import { intervals } from "./intervals";
import { backtracking } from "./backtracking";
import { linkedList } from "./linked-list";
import { dataStructures } from "./data-structures";
import { heapPriorityQueue } from "./heap-priority-queue";
import { rangeQueriesOffline } from "./range-queries-offline";
import { design } from "./design";
import { trees } from "./trees";
import { graph } from "./graph";
import { advancedGraphTemplates } from "./advanced-graph-templates";
import { grid } from "./grid";
import { dynamicProgramming } from "./dynamic-programming";
import { strings } from "./strings";
import { stringAlgorithmsII } from "./string-algorithms-ii";
import { math } from "./math";
import { geometry } from "./geometry";
import { bitManipulation } from "./bit-manipulation";
import { trialFilling } from "./trial-filling";

/**
 * Ordered list of every handbook topic. The order doubles as the learning
 * path used for prev/next navigation on each topic page.
 */
export const HANDBOOK_TOPICS: HandbookTopic[] = [
  competitiveProgrammingEssentials,
  mlPerformanceSystemDesign,
  binarySearch,
  sorting,
  twoPointers,
  slidingWindow,
  prefixSumHashing,
  monotonicStackVsDeque,
  contribution,
  greedy,
  intervals,
  backtracking,
  linkedList,
  dataStructures,
  heapPriorityQueue,
  rangeQueriesOffline,
  design,
  trees,
  graph,
  advancedGraphTemplates,
  grid,
  dynamicProgramming,
  strings,
  stringAlgorithmsII,
  math,
  geometry,
  bitManipulation,
  trialFilling,
];

/** Display order of the overview groups. */
export const HANDBOOK_GROUP_ORDER: HandbookGroup[] = [
  "Foundations",
  "System Design",
  "Data Structures",
  "Graphs & Grids",
  "Dynamic Programming",
  "Strings & Math",
];

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
