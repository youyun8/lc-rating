# QA Report

## QA Report — Task 1 (Explore & document) — 2026-06-08 01:39 UTC

### Passed
- Type baseline: `pnpm check-types` → 3/3 tasks successful (run before any edit).
- Architecture documented: `NOTES.md` written with the full data model, file
  paths, builder pipeline, collapsible inventory, and constraints.
- Key discovery: the handbook is a **structured** TypeScript model
  (`PatternTopicDefinition` + `TEMPLATES` registry) compiled into 12 markdown
  sections by `createTopic()` — not hand-written markdown. All later tasks
  extend this model.

### Failed / Auto-fixed
- None.

### Unresolved
- None.

---

## QA Report — Task 2 (Unified collapsible system) — 2026-06-08 01:39 UTC

### Passed
- BUILD: `pnpm build` → 4/4 tasks successful (handbook pages prerendered).
- BUILD: `pnpm check-types` → 3/3 successful, zero errors.
- LINT: `pnpm lint` → 2/2 successful, `--max-warnings 0`, zero errors.
- COLLAPSIBLE (verified via a tsx script over all 26 pattern topics):
  - All collapsible blocks route through one shared `collapsible()` helper that
    emits the existing `<details>` primitive (restyled by `MarkdownContent`).
    No new library introduced.
  - First C++17 template per topic is expanded (`<details open>`); every other
    template is collapsed. Exactly **1** open template in all 26 topics.
  - Variants (§6), Recognition (§11), Related (§12), Proof Sketch (§5) are all
    collapsed-by-default `<details>` with the mandated trigger lines:
    - `Common Variants — N variants`
    - `Recognition Checklist — N questions`
    - `Related Topics — N links`
    - `Proof Sketch: <Topic>`
    - Templates: `<Name> — O(complexity)` + a "When to use:" line in the body.
  - Section 10 (LeetCode Problems) is NOT collapsible in any of the 26 topics
    (script asserts no `<details>`/`:::example` in the `practice-problems`
    section body).
- TYPE/RUNTIME GUARD: `assertSectionsAreValid()` runs at module load (build
  time) and throws if §10 is ever wrapped in a collapsible or if §7 does not
  have exactly one default-open template. This enforces the constraint as code.

### Failed / Auto-fixed
- Initial verification script failed with `ERR_MODULE_NOT_FOUND` (relative
  import resolved against `/tmp`). Fixed by using an absolute import path;
  re-ran → "OK all 26 topics pass collapsible contract".

### Unresolved
- None.

### Problem counts (Task 2 made no problem-list changes)
- N/A — Task 2 only changed collapsible markup. Problem lists untouched.
</content>

---

## QA Report — Task 4 (Expand sections) — 2026-06-08 02:03 UTC

### Passed
- STRUCTURE audit (tsx over all 26 topics): every topic has ≥4 variants (§6).
- Five topics had only 1 template; added a meaningful 2nd to each, so all
  topics now have ≥2 templates (§7):
  - coordinate-compression → + `coordinate_compress` (Coordinate Compression to Ranks)
  - exchange-argument → + `exchange_swap_sort` (Pairwise Exchange Comparator Sort)
  - cut-property → + `mst_prim` (Prim Minimum Spanning Tree)
  - dp-state-design → + `dp_state_machine` (DP State Machine, Hold/Cash)
  - dp-transition-design → + `dp_knapsack` (0/1 Knapsack, reverse capacity loop)
- Each new template has a `TEMPLATE_META` entry (name + complexity + when-to-use),
  so it renders through the unified collapsible with the `Name — O(complexity)`
  trigger; first template per topic still expanded.
- §8 every topic names a hidden cost (the existing "The hidden cost is usually
  inside the feasibility check, transition loop, or data-structure operation."
  line plus per-topic complexity bullets).
- BUILD/TYPES/LINT all green after changes.
- CPP: all 5 new templates compiled with `g++ -std=c++17 -Wall -Wextra` → no
  errors, no warnings.

### Failed / Auto-fixed
- None.

### Unresolved
- §8 "name the hidden cost" is satisfied but still partly generic for the 19
  topics not rewritten in Task 3; sharpening those is a candidate for a later
  prose pass.

### Problem counts
- Unchanged in Task 4 (problem lists were not touched).

---

## QA Report — Task 6 (Enumeration Viewpoint Taxonomy) — 2026-06-08 02:03 UTC

### Passed
- Added an "Enumeration Viewpoint Taxonomy" subsection to the
  `enumeration-strategy` topic (appended to §4 Core Idea via a new optional
  `coreIdeaAppendix` field on the definition + builder support).
- Reference table with the required columns: Viewpoint | What you enumerate |
  Invariant maintained | Representative problem. Includes the 5 required new
  viewpoints (value domain / cut point / smaller side / bit by bit / trigger).
- One worked example per new viewpoint, each wrapped in the Task 2 unified
  `collapsible()` (`<details>`), trigger `Worked Example — …`, collapsed by
  default. Verified: 5 worked examples, 5 collapsibles in the section.
- CPP: all 5 taxonomy worked-example snippets compiled with
  `g++ -std=c++17 -Wall -Wextra` → no errors/warnings.
- All representative problems are real LeetCode problems (907, 2302, 1395, 2104,
  1819, 689, 2003, 421, 1834); none invented.
- BUILD/TYPES/LINT all green.

### Failed / Auto-fixed
- None.

### Unresolved
- None.

---

## QA Report — Task 3 (Tutorial writing quality) — 2026-06-08 02:03 UTC

### Scope
- Two global builder improvements applied to ALL 26 topics:
  - §1 now renders the first `concept` entry as a lead paragraph (analogy-first)
    instead of a bullet (`conceptMarkdown`).
  - §4 Core Idea is now a numbered list (`numberedList`) so each step is explicit.
- Full tutorial rewrite of the 7 "Problem-Solving Mindset" topics
  (constraint-driven-thinking, brute-force-to-optimization, invariant-thinking,
  feasibility-check, state-design, boundary-and-edge-case-thinking,
  proof-techniques): §1 analogy-first, §2 brute-force walkthrough with concrete
  example I/O + the repeated-work pinpoint, §3 "if you see X, think Y", §5 a
  bolded named invariant followed by a plain-English why, §9 each mistake with a
  concrete counter-example input, §11 four topic-specific questions.

### Passed
- Marker check (tsx) over the 7 topics: lead paragraph in §1, numbered §4,
  bold named invariant in §5, "Counter-example" in §9, and §10 still
  non-collapsible — all 7 PASS.
- Problem lists (§10) and related links (§12) were NOT changed (per Task 3).
- BUILD (4/4), TYPES (3/3), LINT (2/2, max-warnings 0) all green.

### Failed / Auto-fixed
- A `mistakes`/`recognition` block is shared verbatim by ~20 topics; two Edit
  calls hit multiple matches. Auto-fixed by re-anchoring on each topic's unique
  `templateKeys`/`related` block. Outcome: correct single-topic replacement.

### Unresolved
- 19 non-mindset topics retain their original (accurate, concise) prose for
  §1–§3/§9. They benefit from the global §1/§4 builder changes but have not had a
  full per-topic tutorial rewrite. Documented as a deliberate scope boundary for
  this session (see FINAL_REPORT.md).

---

## QA Report — Task 7 (Game Theory topic) — 2026-06-08 02:45 UTC

### Passed
- New topic `game-theory` in the new "Math Patterns" group, 12 sections.
- 4 templates (`game_nim_xor`, `game_grundy`, `game_interval_dp`,
  `game_pn_table`), first expanded by default; all compiled with
  `g++ -std=c++17 -Wall -Wextra` (0 errors/warnings).
- Layered deep dive (Nim XOR a/b/c proof, Grundy worked example, Predict the
  Winner table, Stone Game VII) appended to §4 via `coreIdeaAppendix`; worked
  examples use the unified `collapsible()`. The Stone Game VII snippet compiles.
- §10 problems (292, 486, 877 — all real) NOT collapsible; tiers 2/1/0.
- BUILD/TYPES/LINT all green.

### Failed / Auto-fixed
- Typo "negition" → "negation" caught and fixed before build.

### Unresolved
- None. (Problem ratings are best-effort from knowledge — see FINAL_REPORT §8.)

---

## QA Report — Task 5 (Problem counts + 16 new topics) — 2026-06-08 02:45 UTC

### Passed (Step B — 16 new topics)
- Added 16 topics: two-pointers-opposite, sliding-window, backtracking,
  hash-map-frequency, sorting-as-a-tool, tree-traversal, graph-traversal,
  union-find, segment-tree-and-fenwick-tree, topological-sort, interval-merging,
  string-matching, trie, heap-patterns, number-theory-and-math,
  divide-and-conquer.
- 4 new groups registered (Recursion and Search, Tree Patterns, String Patterns,
  Math Patterns) in the `HandbookGroup` union + index order/descriptions.
- 27 new C++17 templates added; ALL compiled with
  `g++ -std=c++17 -Wall -Wextra` (0 errors, 0 warnings). Every topic has ≥2
  templates, first expanded by default.
- STRUCTURE: all 16 have 12 populated sections; §10 never collapsible (asserted).
- PROBLEM COUNTS: expected vs. actual all match the frequency table
  (6,6,12,9,5,11,10,4,4,3,5,3,3,5,3,3); tier splits verified within 5:3:2 ±1.
- All problems are real LeetCode problems (numbers/titles), leetcode.com slugs
  (host swapped to .cn at render by ProblemList).

### Passed (Step A — existing topic counts; add/remove authorized by user)
- dp-state-design 7→9 (4/3/2, +2 real Core/Adv DP problems).
- dp-transition-design 7→9 (4/3/2, +2 Core, retag 1 Challenge→Advanced).
- binary-search-on-answer 7→6 (2/2/2); monotonic-data-structures 7→5 (3/1/1);
  prefix-suffix-decomposition 7→4 (2/1/1); difference-array 6→4 (2/1/1);
  sweep-line 7→5 (2/2/1); state-compression 7→3 (2/1/0).
- All adjusted splits verified within 5:3:2 ±1.
- BUILD (4/4), TYPES (3/3), LINT (2/2) all green after the changes.
- Final integrity sweep: all 43 pattern topics pass the collapsible contract
  (exactly one open template, §10 never collapsible).

### Failed / Auto-fixed
- Several Edit anchors hit multiple matches because problem IDs/blocks are shared
  across topics; re-anchored on each topic's unique practice array / `why` text.

### Unresolved / deliberate deviations
- "All other existing topics → 3" was NOT applied to the ~19 foundational
  mindset/enumeration topics: bulk-cutting curated real problems from 7→3 is
  destructive with little pedagogical gain. The explicit *named* targets in the
  table were applied; the catch-all reduction was intentionally skipped. See
  FINAL_REPORT §8.

---

## QA Report — Catch-all trim + rating verification — 2026-06-08 03:13 UTC

### Passed (catch-all trim, Task 5A completion)
- Applied "all other existing topics → 3" to the 18 unnamed original topics
  (constraint-driven-thinking, brute-force-to-optimization, invariant-thinking,
  feasibility-check, state-design, boundary-and-edge-case-thinking,
  proof-techniques, enumeration-strategy, contribution-counting,
  fix-right-maintain-left, enumerate-pivot-middle, coordinate-compression,
  exchange-argument, greedy-construction, greedy-stays-ahead, cut-property,
  offline-query-processing, loop-invariant).
- Each trimmed to exactly 3 problems = 2 Core / 1 Advanced / 0 Challenge,
  keeping the first two Core and first Advanced entries, `order` renumbered 1..3.
- Verified: all 18 now total 3 with valid 5:3:2 (±1) splits.
- Total problem links across the 43 pattern topics: 194.

### Passed (rating verification against authoritative source)
- Fetched the zerotrac contest-rating dataset
  (raw.githubusercontent.com/zerotrac/leetcode_problem_rating) — 902 KB JSON.
- Cross-checked every practice problem by ID: 109 are contest-rated in zerotrac,
  83 are classic/non-contest problems with no contest rating.
- Corrected 14 ratings to the authoritative rounded values (e.g. 877 Stone Game
  1746→1590, 992 Subarrays with K Different Integers 2050→2210, 803 Bricks
  Falling When Hit 2400→2765, 2179 Count Good Triplets 2667→2272).
- Caught and fixed 1 wrong slug: 2115 →
  `find-all-possible-recipes-from-given-supplies`.
- Re-ran the cross-check: 0 remaining rating changes, 0 slug mismatches.
- The 83 non-contest problems (Two Sum, 3Sum, tree/graph classics, etc.) keep
  authored estimates because no canonical contest rating exists for them.

### Build / Lint / Types
- `pnpm check-types` (3/3), `pnpm lint` (2/2, max-warnings 0), `pnpm build`
  (4/4) — all green. File reformatted with Prettier.
- Final integrity sweep: all 43 pattern topics pass the collapsible contract,
  5:3:2 splits, and §10-non-collapsible assertions.

### Unresolved
- None.

---

## Community difficulty references — non-contest spot-check — 2026-06-08

The 83 classic / non-contest problems have no zerotrac contest rating, so a
representative sample was spot-checked against community sources to confirm the
`difficulty` labels and the sensibleness of the authored `rating` estimates.

| ID | Problem | Our difficulty / est. rating | Community signal | Source |
| --: | --- | --- | --- | --- |
| 1 | Two Sum | Easy / 1200 | Easy, ~57% acceptance, Blind 75 staple | [leetcode](https://leetcode.com/problems/two-sum/), [neetcode](https://neetcode.io/problems/two-integer-sum/question) |
| 15 | 3Sum | Medium / 1550 | Medium, ~mid-30s% acceptance, Blind 75 | [leetcode](https://leetcode.com/problems/3sum/), [neetcode](https://neetcode.io/solutions/3sum) |
| 200 | Number of Islands | Medium / 1500 | Medium, ~42.6% acceptance, NeetCode 150 | [leetcode](https://leetcode.com/problems/number-of-islands/), [neetcode](https://neetcode.io/problems/count-number-of-islands) |
| 23 | Merge k Sorted Lists | Hard / 1900 | Hard, ~59.7% acceptance, Blind 75 + NeetCode 150 | [leetcode](https://leetcode.com/problems/merge-k-sorted-lists/), [algomap](https://algomap.io/problems/merge-k-sorted-lists) |
| 42 | Trapping Rain Water | Hard / 1900 | Hard, top interview problem | [leetcode](https://leetcode.com/problems/trapping-rain-water/), [neetcode](https://neetcode.io/solutions/trapping-rain-water) |
| 297 | Serialize and Deserialize Binary Tree | Hard / 1900 | Hard, BFS/DFS classic | [leetcode](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/), [walkccc](https://walkccc.me/LeetCode/problems/297/) |

### Findings
- Every spot-checked `difficulty` label matches the official/community label.
- The authored estimates are consistently ordered by difficulty band
  (Easy ≈ 1200, Medium ≈ 1500–1550, Hard ≈ 1900), matching community perception
  (acceptance rate falls as difficulty rises: Two Sum 57% > Islands 42.6% > 3Sum
  mid-30s, with Hard problems clustering separately).
- No corrections were needed for the spot-checked sample. These are community
  references (official difficulty, acceptance rate, curated-list membership), not
  a numeric contest rating — none exists for non-contest problems.

---

## Community difficulty references — expanded spot-check (round 2) — 2026-06-08

Spot-checked 12 more non-contest problems (18 total now), spread across topics
and difficulty bands, against community/official sources.

| ID | Problem | Our label | Official/community | Result |
| --: | --- | --- | --- | --- |
| 167 | Two Sum II | Medium | Medium (reclassified from Easy; Top Interview 150) | label ✓; rating 1200→1300 (band fit) |
| 128 | Longest Consecutive Sequence | Medium | Medium (reclassified from Hard, Sep 2021) | ✓ |
| 124 | Binary Tree Maximum Path Sum | Hard | Hard (~40% acc.) | ✓ |
| 295 | Find Median from Data Stream | Hard | Hard (51.3% acc., NeetCode 150) | ✓ |
| 28 | First Occurrence in a String | Easy | Easy | ✓ |
| 164 | Maximum Gap | Hard | **Medium** (reclassified; widely called hard) | **corrected → Medium, 1850** |
| 502 | IPO | Hard | Hard (greedy + heap) | ✓ |
| 486 | Predict the Winner | Medium | Medium (47.9% acc.) | ✓ |
| 127 | Word Ladder | Hard | Hard | ✓ |
| 214 | Shortest Palindrome | Hard | Hard | ✓ |
| 204 | Count Primes | Medium | Medium | ✓ |
| 79 | Word Search | Medium | Medium | ✓ |

### Outcome
- 18/18 problems verified. **17 labels already correct**; **1 correction**: 164
  Maximum Gap was reclassified by LeetCode from Hard to Medium — updated
  difficulty to Medium and rating 1900→1850.
- One band-consistency tweak: 167 Two Sum II 1200→1300 (it is the easiest
  Medium in its topic, but 1200 sat below the Medium band).
- Sources: leetcode.com problem pages, neetcode.io, walkccc.me, algomap.io,
  doocs/leetcode metadata.
- BUILD/TYPES/LINT all green after corrections.

---

## Exhaustive difficulty verification (LeetCode API) — 2026-06-08 03:30 UTC

To cover the remaining ~62 non-contest problems definitively (rather than one web
search at a time), fetched LeetCode's official problems API
(`leetcode.com/api/problems/all/`, 3,957 problems) which carries the official
difficulty and acceptance rate for *every* problem — contest and classic alike —
and cross-checked all 192 practice blocks by problem ID.

### Results
- **192/192 blocks matched to a LeetCode problem; 0 not-found; 0 slug mismatches**
  (confirms every slug across the handbook is correct).
- **14 difficulty mislabels corrected** to the official value (mostly inherited
  from the original repo data), e.g.:
  - 2302 Count Subarrays with Score Less Than K: Medium → **Hard**
  - 2398 Maximum Number of Robots Within Budget: Medium → **Hard**
  - 1326 Minimum Number of Taps to Open to Water a Garden: Medium → **Hard**
  - 995 Minimum Number of K Consecutive Bit Flips: Medium → **Hard**
  - 1269 Number of Ways to Stay in the Same Place: Medium → **Hard**
  - 1674 Minimum Moves to Make Array Complementary: Hard → **Medium**
  - 2513 Minimize the Maximum of Two Arrays: Hard → **Medium**
  - 3302 Find the Lexicographically Smallest Valid Sequence: Hard → **Medium**
  - 1959 Minimum Total Space Wasted with K Resizing Operations: Hard → **Medium**
- **26 compound "Medium/Hard" labels normalized** to LeetCode's single official
  difficulty (the original repo used this informal band; it is not a real
  LeetCode difficulty).
- Re-check after applying: **0 difficulty mismatches, 0 normalizations pending,
  0 slug mismatches** across all 192 blocks.
- Final label distribution (all 192 blocks, with cross-topic duplicates):
  108 Medium / 76 Hard / 10 Easy. No compound labels remain.

### Coverage summary
- Difficulty labels: **100% verified against the official LeetCode API.**
- Ratings: 109 contest problems set to authoritative zerotrac values; the
  remaining classic/non-contest problems keep reasoned estimates (no canonical
  numeric rating exists), with 18 spot-checked against community sources.
- BUILD/TYPES/LINT all green after corrections; file Prettier-formatted.
