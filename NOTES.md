# Handbook Codebase Exploration — NOTES (TASK 1)

This documents the actual architecture of the LeetCode Pattern Handbook as it
exists in the repo, so that all later tasks extend (not replace) it.

## TL;DR — the data model is **structured**, not free-form markdown

The handbook is authored as **typed TypeScript definition objects** that a
builder function deterministically renders into 12 markdown sections. You edit
structured fields (arrays of bullets, template keys, practice-problem objects),
**not** raw section markdown. This is the model all later tasks must work within.

## Key file paths

| Concern                                             | Path                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Topic type (rendered form)                          | `apps/web/features/handbook/model.ts`                                          |
| Topic **definitions** + builder                     | `apps/web/features/handbook/content/pattern-handbook.ts`                       |
| ML system-design topic (separate authored markdown) | `apps/web/features/handbook/content/ml-performance-system-design.ts`           |
| Topic registry / index / nav                        | `apps/web/features/handbook/content/index.ts`                                  |
| Topic page renderer                                 | `apps/web/features/handbook/HandbookTopicPage.tsx`                             |
| Section body renderer (md → JSX)                    | `apps/web/features/handbook/HandbookSectionBody.tsx`                           |
| Worked-example collapsible card                     | `apps/web/features/handbook/HandbookExample.tsx`                               |
| Overview / landing page                             | `apps/web/features/handbook/HandbookOverview.tsx`                              |
| Markdown engine (marked + katex + hljs)             | `apps/web/features/studyplan/MarkdownContent.tsx`                              |
| Interactive problem list widget                     | `apps/web/features/studyplan/ProblemList.tsx`                                  |
| Route: overview                                     | `apps/web/app/(lc)/handbook/page.tsx`                                          |
| Route: topic page                                   | `apps/web/app/(lc)/handbook/[topic]/page.tsx` (SSG via `generateStaticParams`) |

## The two-layer data model

### Layer A — rendered model (`model.ts`)

```ts
interface HandbookSection {
  id: string;
  title: string;
  body: string;
} // body = markdown
interface HandbookTopic {
  slug;
  title;
  tagline;
  icon;
  group: HandbookGroup;
  sections: HandbookSection[];
}
```

`HandbookGroup` is a fixed union of category names (see `model.ts`). The overview
groups topics by `group` in `HANDBOOK_GROUP_ORDER` (`content/index.ts`).

### Layer B — authoring model (`pattern-handbook.ts`, NOT exported in model.ts)

```ts
interface TemplateBlock {
  summary: string;
  code: string;
} // C++17 snippets, keyed in TEMPLATES
interface PracticeProblem {
  id: number;
  title: string;
  slug: string;
  rating: number;
  difficulty: string;
  subPattern: string;
  why: string;
  order: number;
  tier: "Core Practice" | "Advanced Practice" | "Challenge Practice";
}
interface PatternTopicDefinition {
  slug;
  title;
  tagline;
  icon;
  group;
  concept: string[]; // → section 1
  motivation: string[]; // → section 2
  whenUse: string[]; // → section 3
  coreIdea: string[]; // → section 4
  invariant: string; // → section 5 (+ generated Proof Sketch)
  variants: string[]; // → section 6
  templateKeys: string[]; // → section 7 (look up TEMPLATES[key])
  complexity: string[]; // → section 8
  mistakes: string[]; // → section 9
  practice: PracticeProblem[]; // → section 10 (ProblemList, NOT collapsible)
  recognition: string[]; // → section 11
  related: string[]; // → section 12 (slugs)
}
```

`TEMPLATES: Record<string, TemplateBlock>` is a shared registry (36 templates)
referenced by `templateKeys`, so the same template can be reused across topics.

### The builder: `createTopic(def) → HandbookTopic`

`createTopic` maps each definition to the 12 sections. Helper functions:

- `bulletList`, `numberedList` — plain markdown lists.
- `templateMarkdown(keys)` — wraps **each** template in raw `<details><summary>` + a
  ` ```cpp ` block.
- `proofMarkdown(def)` — section 5 Proof Sketch in a `<details>`.
- `practiceMarkdown(problems)` — emits one markdown table per tier
  (`| ID | Problem | Rating | Technique |`) which `HandbookSectionBody` upgrades
  into a `ProblemList`.
- `relatedMarkdown(slugs)` — bullet list of `/handbook/<slug>` links.

`PATTERN_HANDBOOK_TOPICS = TOPIC_DEFINITIONS.map(createTopic)` then
`HANDBOOK_TOPICS = [...PATTERN_HANDBOOK_TOPICS, mlPerformanceSystemDesign]`.

## Index / navigation mechanism

Static, not filesystem-scanned. `content/index.ts` exposes `HANDBOOK_TOPICS`,
`getHandbookTopic(slug)`, `getHandbookTopicSlugs()`, `getAdjacentTopics(slug)`
(prev/next from array order), and `getHandbookTopicsByGroup()`. The route uses
`generateStaticParams()` → fully static export. **To add a topic:** add a
`PatternTopicDefinition` to `TOPIC_DEFINITIONS`; it auto-registers everywhere.
New groups must be added to both the `HandbookGroup` union (`model.ts`) and
`HANDBOOK_GROUP_ORDER` + `HANDBOOK_GROUP_DESCRIPTIONS` (`content/index.ts`).

## Collapsible / expandable patterns that ALREADY exist

There is **no shadcn Collapsible / Radix Accordion** in the handbook. Three
collapsible mechanisms exist, all funneled through `MarkdownContent.tsx`:

1. **`<details><summary>` raw HTML** — the markdown engine's `useEffect` restyles
   every `<details>` into a card with a rotating chevron and expand/collapse
   badge. Used today for **section 7 templates** and **section 5 proof sketch**.
   Native `<details open>` controls default state.
2. **Auto-wrapped code blocks** — every `<pre>` is wrapped in a collapsible
   toggle; the label is taken from the first `// comment` line of the code.
   Collapsed by default **unless** `codeInitiallyOpen` is set OR the `<pre>` is
   inside a `<details>` (`pre.closest("details")`).
3. **`:::example <title> … :::`** fenced block → `HandbookExample` card
   (collapsed by default). Parsed in `HandbookSectionBody.splitSectionBody`.

**Unified primitive choice for TASK 2:** the `<details><summary>` convention is
already the shared, consistently-styled collapsible across the handbook. TASK 2
standardizes on it via builder helpers rather than introducing a new library.

## Section 10 (LeetCode Problems) is already NON-collapsible

`practiceMarkdown` emits plain `| ID | Problem | Rating | Technique |` tables.
`HandbookSectionBody.splitSectionBody` detects the `ID`+`Problem` header and
converts the table into a `<ProblemList>` widget — never wrapped in `<details>`
or `:::example`. The 5:3:2 tiers render as three always-visible tables.

## Existing inventory

- **26 pattern topics** (definitions) + 1 ML system-design topic = 27 total.
  Slugs: constraint-driven-thinking, brute-force-to-optimization,
  invariant-thinking, feasibility-check, state-design,
  boundary-and-edge-case-thinking, proof-techniques, enumeration-strategy,
  contribution-counting, fix-right-maintain-left, enumerate-pivot-middle,
  prefix-suffix-decomposition, difference-array, binary-search-on-answer,
  monotonic-data-structures, coordinate-compression, exchange-argument,
  greedy-construction, greedy-stays-ahead, cut-property, dp-state-design,
  dp-transition-design, offline-query-processing, sweep-line,
  state-compression, loop-invariant.
- **36 shared C++17 templates** in the `TEMPLATES` registry.
- Groups in use: Problem-Solving Mindset, Enumeration and Counting, Core
  Array/String Patterns, Data Structure Patterns, Greedy Patterns, Graph
  Patterns, Dynamic Programming, Range Query and Offline Techniques, Bit and
  Math Patterns, Advanced Mixed Patterns, ML Performance System Design.

## Constraints discovered (impact on later tasks)

- LeetCode links in `practiceMarkdown` are emitted with `leetcode.com`, then the
  `ProblemList` widget swaps the host based on site settings (the `enhanceLeetCode`
  path). So authoring uses `leetcode.com/problems/<slug>` and the cn/com host is
  applied at render — links resolve to leetcode.cn for users with that setting.
- New categories needed by TASK 5 ("Recursion and Search", "Tree Patterns",
  "Graph Patterns" [exists], "String Patterns", "Math Patterns") must be added to
  the `HandbookGroup` union and the index group order/descriptions.
- `pnpm check-types` passes at baseline (verified before changes).

## Build / verify commands

- `pnpm build` (turbo) · `pnpm check-types` · `pnpm lint` from repo root.
- Dev server: `pnpm dev` (web on :3001). Static export of `/handbook/[topic]`.
  </content>
  </invoke>

## Interview Frequency Ranking

Ranking of all 44 handbook chapters by how often the pattern appears in
real software-engineering interviews. Composite score combines three
weighted sources:

1. **LeetCode company-frequency tags (40%)** — how often the chapter's
   Section 10 problems are tagged as asked by top companies (FAANG,
   Microsoft, …), synthesized into a 0-100 prominence score (`S1`).
2. **Contest appearance rate (30%)** — objective: the number of the
   chapter's Section 10 problems with a contest rating in the 1700-2000
   band (`band`), normalized to 0-100 across chapters (`S2`).
3. **Study-guide prominence (30%)** — prominence across the NeetCode
   roadmap, Grind 75/150, Blind 75, and Sean Prashad's list, as a 0-100
   score (`S3`).

`composite = 0.40*S1 + 0.30*S2 + 0.30*S3`. Frequency tiers: **High** =
ranks 1-5, **Medium** = ranks 6-15, **Low** = ranks 16+.

| Rank | Chapter                                                 | Slug                              | S1 (40%) | band→S2 (30%) | S3 (30%) | Composite | Frequency | Rationale                                                                                                                                         |
| ---: | ------------------------------------------------------- | --------------------------------- | -------: | ------------: | -------: | --------: | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | DP State Design                                         | `dp-state-design`                 |       85 |          5→42 |       90 |      73.5 | High      | Choosing the DP state is the crux of the heavily-tested DP block in Blind 75 / NeetCode 150.                                                      |
|    2 | Hash Map / Frequency Counting                           | `hash-map-frequency`              |       95 |          3→25 |       92 |      73.1 | High      | The single most common interview tool — Two Sum, anagram, and subarray-sum problems open nearly every FAANG screen and headline every study list. |
|    3 | Two Pointers (Opposite Direction)                       | `two-pointers-opposite`           |       92 |          3→25 |       95 |      72.8 | High      | A Blind 75 / NeetCode / Grind staple (3Sum, container-with-water) asked across virtually all top companies.                                       |
|    4 | Graph BFS and DFS                                       | `graph-traversal`                 |       88 |          4→33 |       90 |      72.2 | High      | Number-of-islands-style BFS/DFS is among the most-asked patterns and central to every graph study unit.                                           |
|    5 | Sliding Window (Exact Size / At-Most-K)                 | `sliding-window`                  |       90 |          3→25 |       95 |        72 | High      | Longest/shortest-substring questions are a top-frequency FAANG pattern and a dedicated section in every roadmap.                                  |
|    6 | Tree DFS and BFS                                        | `tree-traversal`                  |       90 |          3→25 |       92 |      71.1 | Medium    | Binary-tree DFS/BFS return-value design is interview bread-and-butter and a large NeetCode/Grind block.                                           |
|    7 | Heap Patterns                                           | `heap-patterns`                   |       78 |          6→50 |       82 |      70.8 | Medium    | Top-K and merge-k-lists heap problems are frequently asked and a standard roadmap section.                                                        |
|    8 | Binary Search on Answer                                 | `binary-search-on-answer`         |       80 |          5→42 |       84 |      69.7 | Medium    | Binary search and its 'search the answer' variant (Koko, ship-within-days) are a top-tier, guide-prominent pattern.                               |
|    9 | Interval Merging                                        | `interval-merging`                |       78 |          5→42 |       80 |      67.7 | Medium    | Merge/insert intervals and meeting-rooms are classic high-frequency questions in every list.                                                      |
|   10 | DP Transition Design                                    | `dp-transition-design`            |       80 |          4→33 |       85 |      67.5 | Medium    | The transition half of DP (knapsack, edit distance) is a high-frequency follow-up across study guides.                                            |
|   11 | Backtracking                                            | `backtracking`                    |       82 |          3→25 |       88 |      66.7 | Medium    | Subsets/permutations/combination-sum recur constantly and form a full roadmap section.                                                            |
|   12 | Topological Sort                                        | `topological-sort`                |       68 |          6→50 |       74 |      64.4 | Medium    | Course-Schedule-style ordering is a common graph follow-up and a named pattern in NeetCode/Prashad.                                               |
|   13 | Sorting as a Tool                                       | `sorting-as-a-tool`               |       75 |          4→33 |       78 |      63.4 | Medium    | Sort-then-scan setups underpin many medium questions and appear throughout the curated lists.                                                     |
|   14 | Monotonic Data Structures                               | `monotonic-data-structures`       |       62 |          6→50 |       70 |      60.8 | Medium    | Daily-temperatures / next-greater monotonic-stack questions recur and form a recognizable pattern unit.                                           |
|   15 | Enumeration Strategy                                    | `enumeration-strategy`            |       45 |        12→100 |       40 |        60 | Medium    | Choosing what to enumerate is a broadly useful counting meta-pattern with moderate direct exposure.                                               |
|   16 | Prefix/Suffix Decomposition                             | `prefix-suffix-decomposition`     |       68 |          4→33 |       70 |      58.2 | Low       | Prefix-sum / product-of-array-except-self problems are common and a standard list entry.                                                          |
|   17 | Union-Find (DSU)                                        | `union-find`                      |       70 |          3→25 |       74 |      57.7 | Low       | Connected-components and redundant-connection problems show up regularly and have a dedicated roadmap unit.                                       |
|   18 | Fix Right, Maintain Left                                | `fix-right-maintain-left`         |       60 |          5→42 |       64 |      55.7 | Low       | The expand-right / shrink-left counting variant of sliding window is a common medium follow-up.                                                   |
|   19 | Trie                                                    | `trie`                            |       64 |          3→25 |       74 |      55.3 | Low       | Implement-Trie and word-search-II appear in NeetCode/Grind, with moderate live-interview frequency.                                               |
|   20 | Feasibility Check                                       | `feasibility-check`               |       52 |          6→50 |       50 |      50.8 | Low       | Binary-search feasibility checks are a recurring medium/hard device, moderately represented in guides.                                            |
|   21 | Greedy Construction                                     | `greedy-construction`             |       60 |          3→25 |       58 |      48.9 | Low       | Jump-game / gas-station greedy constructions are frequently asked and appear across study guides.                                                 |
|   22 | State Compression                                       | `state-compression`               |       35 |          8→67 |       40 |        46 | Low       | Bitmask DP surfaces in harder/senior loops and competitive prep, with low everyday frequency.                                                     |
|   23 | Number Theory and Math                                  | `number-theory-and-math`          |       54 |          3→25 |       56 |      45.9 | Low       | GCD/primes/pow problems show up periodically and have a math section in most roadmaps.                                                            |
|   24 | Difference Array                                        | `difference-array`                |       44 |          6→50 |       44 |      45.8 | Low       | Range-update / corporate-flight-bookings problems appear at a moderate, mostly-medium frequency.                                                  |
|   25 | String Pattern Matching                                 | `string-matching`                 |       55 |          2→17 |       60 |        45 | Low       | KMP/Rabin-Karp and find-the-index questions appear at a moderate rate, mostly at string-heavy companies.                                          |
|   26 | State Design                                            | `state-design`                    |       55 |          3→25 |       50 |      44.5 | Low       | Naming the right state is a practically important meta-skill underlying many DP/graph interview questions.                                        |
|   27 | Constraint-Driven Thinking                              | `constraint-driven-thinking`      |       50 |          4→33 |       45 |      43.5 | Low       | Reading constraints to pick an approach is a high-value meta-skill rather than a tagged interview topic.                                          |
|   28 | Brute Force to Optimization                             | `brute-force-to-optimization`     |       48 |          4→33 |       45 |      42.7 | Low       | The optimize-from-brute-force mindset matters in every interview but is not itself a tagged question type.                                        |
|   29 | Boundary and Edge Case Thinking                         | `boundary-and-edge-case-thinking` |       45 |          5→42 |       40 |      42.5 | Low       | Edge-case discipline is rewarded in every interview but is a cross-cutting skill, not a standalone topic.                                         |
|   30 | Divide and Conquer                                      | `divide-and-conquer`              |       55 |           0→0 |       62 |      40.6 | Low       | Merge-sort, sort-list, and count-of-smaller divide-and-conquer questions feature in most lists.                                                   |
|   31 | Greedy Stays Ahead                                      | `greedy-stays-ahead`              |       34 |          6→50 |       34 |      38.8 | Low       | The stays-ahead proof style backs several greedy answers but is rarely the explicit ask.                                                          |
|   32 | Enumerate Pivot / Middle                                | `enumerate-pivot-middle`          |       38 |          3→25 |       34 |      32.9 | Low       | Fix-the-middle counting (3Sum-like, count-triplets) is an occasional contest-flavored medium.                                                     |
|   33 | Segment Tree and Fenwick Tree                           | `segment-tree-and-fenwick-tree`   |       45 |           0→0 |       48 |      32.4 | Low       | Rare in standard interviews but a staple of contests and senior/competitive study tracks.                                                         |
|   34 | Exchange Argument                                       | `exchange-argument`               |       24 |          6→50 |       24 |      31.8 | Low       | A greedy-correctness proof tool seen mainly in competitive programming, seldom asked explicitly.                                                  |
|   35 | Loop Invariant                                          | `loop-invariant`                  |       25 |          6→50 |       22 |      31.6 | Low       | A correctness-discipline contract that supports binary-search/two-pointer answers rather than being asked.                                        |
|   36 | Invariant Thinking                                      | `invariant-thinking`              |       36 |          3→25 |       32 |      31.5 | Low       | Reasoning with invariants strengthens many answers but is taught as a method, not asked directly.                                                 |
|   37 | Sweep Line                                              | `sweep-line`                      |       42 |           0→0 |       44 |        30 | Low       | Meeting-rooms-II and skyline sweeps appear occasionally, mostly as harder follow-ups.                                                             |
|   38 | Cut Property                                            | `cut-property`                    |       26 |          4→33 |       26 |      28.2 | Low       | The MST safe-edge argument is rarely interviewed outside specialized roles, but foundational in theory.                                           |
|   39 | Game Theory                                             | `game-theory`                     |       32 |           1→8 |       36 |      26.1 | Low       | Stone-game / Nim questions appear infrequently and only at a few companies, but feature in DP study sets.                                         |
|   40 | Contribution Counting                                   | `contribution-counting`           |       30 |          2→17 |       30 |        26 | Low       | Sum-of-subarray-minimums contribution counting is a contest-leaning technique, uncommon in interviews.                                            |
|   41 | Proof Techniques                                        | `proof-techniques`                |       20 |          5→42 |       18 |      25.9 | Low       | Induction/exchange/contradiction proofs are a meta-skill for justifying solutions, not an interview topic.                                        |
|   42 | Offline Query Processing                                | `offline-query-processing`        |       18 |          5→42 |       20 |      25.7 | Low       | Reordering queries offline is almost exclusively a competitive-programming technique.                                                             |
|   43 | Coordinate Compression                                  | `coordinate-compression`          |       28 |           1→8 |       28 |      22.1 | Low       | A preprocessing step for BIT/segment-tree problems; rare in interviews, common in contests.                                                       |
|   44 | System Design for ML Performance Engineering Interviews | `ml-performance-system-design`    |       12 |           0→0 |        6 |       6.6 | Low       | A specialized ML-infra interview track, outside the standard coding-pattern frequency lists.                                                      |
