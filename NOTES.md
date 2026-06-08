# Handbook Codebase Exploration — NOTES (TASK 1)

This documents the actual architecture of the LeetCode Pattern Handbook as it
exists in the repo, so that all later tasks extend (not replace) it.

## TL;DR — the data model is **structured**, not free-form markdown

The handbook is authored as **typed TypeScript definition objects** that a
builder function deterministically renders into 12 markdown sections. You edit
structured fields (arrays of bullets, template keys, practice-problem objects),
**not** raw section markdown. This is the model all later tasks must work within.

## Key file paths

| Concern | Path |
| --- | --- |
| Topic type (rendered form) | `apps/web/features/handbook/model.ts` |
| Topic **definitions** + builder | `apps/web/features/handbook/content/pattern-handbook.ts` |
| ML system-design topic (separate authored markdown) | `apps/web/features/handbook/content/ml-performance-system-design.ts` |
| Topic registry / index / nav | `apps/web/features/handbook/content/index.ts` |
| Topic page renderer | `apps/web/features/handbook/HandbookTopicPage.tsx` |
| Section body renderer (md → JSX) | `apps/web/features/handbook/HandbookSectionBody.tsx` |
| Worked-example collapsible card | `apps/web/features/handbook/HandbookExample.tsx` |
| Overview / landing page | `apps/web/features/handbook/HandbookOverview.tsx` |
| Markdown engine (marked + katex + hljs) | `apps/web/features/studyplan/MarkdownContent.tsx` |
| Interactive problem list widget | `apps/web/features/studyplan/ProblemList.tsx` |
| Route: overview | `apps/web/app/(lc)/handbook/page.tsx` |
| Route: topic page | `apps/web/app/(lc)/handbook/[topic]/page.tsx` (SSG via `generateStaticParams`) |

## The two-layer data model

### Layer A — rendered model (`model.ts`)

```ts
interface HandbookSection { id: string; title: string; body: string; } // body = markdown
interface HandbookTopic {
  slug; title; tagline; icon; group: HandbookGroup; sections: HandbookSection[];
}
```

`HandbookGroup` is a fixed union of category names (see `model.ts`). The overview
groups topics by `group` in `HANDBOOK_GROUP_ORDER` (`content/index.ts`).

### Layer B — authoring model (`pattern-handbook.ts`, NOT exported in model.ts)

```ts
interface TemplateBlock { summary: string; code: string; }   // C++17 snippets, keyed in TEMPLATES
interface PracticeProblem {
  id: number; title: string; slug: string; rating: number; difficulty: string;
  subPattern: string; why: string; order: number;
  tier: "Core Practice" | "Advanced Practice" | "Challenge Practice";
}
interface PatternTopicDefinition {
  slug; title; tagline; icon; group;
  concept: string[];       // → section 1
  motivation: string[];    // → section 2
  whenUse: string[];       // → section 3
  coreIdea: string[];      // → section 4
  invariant: string;       // → section 5 (+ generated Proof Sketch)
  variants: string[];      // → section 6
  templateKeys: string[];  // → section 7 (look up TEMPLATES[key])
  complexity: string[];    // → section 8
  mistakes: string[];      // → section 9
  practice: PracticeProblem[]; // → section 10 (ProblemList, NOT collapsible)
  recognition: string[];   // → section 11
  related: string[];       // → section 12 (slugs)
}
```

`TEMPLATES: Record<string, TemplateBlock>` is a shared registry (36 templates)
referenced by `templateKeys`, so the same template can be reused across topics.

### The builder: `createTopic(def) → HandbookTopic`

`createTopic` maps each definition to the 12 sections. Helper functions:
- `bulletList`, `numberedList` — plain markdown lists.
- `templateMarkdown(keys)` — wraps **each** template in raw `<details><summary>` + a
  ```` ```cpp ```` block.
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
