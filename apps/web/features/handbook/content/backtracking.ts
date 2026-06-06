import type { HandbookTopic } from "../model";

export const backtracking: HandbookTopic = {
  slug: "backtracking",
  title: "Backtracking & Recursion",
  tagline:
    "Systematically build candidates one choice at a time, undo on dead ends, and prune the search tree early.",
  icon: "GitBranch",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Backtracking is depth-first search over the tree of *partial solutions*. At each node you make a choice, recurse, then **undo** the choice and try the next one. It is the go-to technique when a problem asks you to **enumerate or count all valid configurations** — subsets, permutations, combinations, board placements, or partitions.

Reach for backtracking when you see:

- "Find **all** ...", "list **every** ...", "**count the number of ways** ...".
- A solution that is a **sequence of decisions** (pick/skip an element, place a piece, choose a digit).
- Small constraints — usually $n \\le 20$ for subsets/bitmask or $n!$-style explosions kept tiny by **pruning**.

The whole method is the *choose → explore → un-choose* loop. If you also need the **optimal** answer over overlapping subproblems rather than every configuration, that is the bridge to [Dynamic Programming](/handbook/dynamic-programming): memoize the recursion.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfortable reading and writing **recursion** and tracing a call stack.
- Knowing how a reference parameter (\`vector<int>& path\`) is shared across recursive calls, so changes must be undone.
- Basic counting: how many subsets ($2^n$), permutations ($n!$), and combinations ($C(n, k)$) exist.

Related handbook topics: [Competitive Programming Essentials](/handbook/competitive-programming-essentials) (reading constraints to confirm exponential search fits), [Grid / Matrix](/handbook/grid) (backtracking on boards), [Bit Manipulation](/handbook/bit-manipulation) (subset/mask enumeration), and [Dynamic Programming](/handbook/dynamic-programming) (memoized recursion).`,
    },
    {
      id: "template",
      title: "The backtracking template",
      body: `Every backtracking solution is the same skeleton: a recursive function that records the current partial solution, branches over the next choices, and restores state before returning.

\`\`\`cpp
// Generic skeleton: collect every complete configuration into 'results'.
void backtrack(State& state, vector<Solution>& results) {
  if (isComplete(state)) {        // reached a leaf -> record the answer
    results.push_back(extract(state));
    return;
  }
  for (Choice c : choices(state)) {
    if (!valid(state, c)) {       // prune invalid branches early
      continue;
    }
    apply(state, c);              // choose
    backtrack(state, results);    // explore
    undo(state, c);               // un-choose (restore state)
  }
}
\`\`\`

The three lines **choose / explore / un-choose** are the heart of it. Forgetting the \`undo\` is the most common bug — state leaks into sibling branches.`,
    },
    {
      id: "subsets-perms",
      title: "Subsets, combinations, and permutations",
      body: `These three are the canonical patterns; almost everything else is a variation.

:::example Subsets (LC 78)
**Subsets** — at each index, either include the element or skip it.

\`\`\`cpp
// All subsets of nums (LC 78).
void subsets(vector<int>& nums, int i, vector<int>& path,
             vector<vector<int>>& out) {
  if (i == (int)nums.size()) {
    out.push_back(path);
    return;
  }
  subsets(nums, i + 1, path, out);   // skip nums[i]
  path.push_back(nums[i]);
  subsets(nums, i + 1, path, out);   // take nums[i]
  path.pop_back();                   // undo
}
\`\`\`
:::

:::example Combinations (LC 77)
**Combinations** — pick \`k\` items; pass a \`start\` index so each combination is generated once.

\`\`\`cpp
// All k-combinations of 1..n (LC 77).
void combine(int n, int k, int start, vector<int>& path,
             vector<vector<int>>& out) {
  if ((int)path.size() == k) {
    out.push_back(path);
    return;
  }
  // Prune: stop if not enough numbers remain to fill path.
  for (int x = start; x <= n - (k - (int)path.size()) + 1; x++) {
    path.push_back(x);
    combine(n, k, x + 1, path, out);
    path.pop_back();
  }
}
\`\`\`
:::

:::example Permutations (LC 46)
**Permutations** — track which elements are already used.

\`\`\`cpp
// All permutations of nums (LC 46).
void permute(vector<int>& nums, vector<int>& path, vector<bool>& used,
             vector<vector<int>>& out) {
  if (path.size() == nums.size()) {
    out.push_back(path);
    return;
  }
  for (int i = 0; i < (int)nums.size(); i++) {
    if (used[i]) {
      continue;
    }
    used[i] = true;
    path.push_back(nums[i]);
    permute(nums, path, used, out);
    path.pop_back();
    used[i] = false;
  }
}
\`\`\`
:::`,
    },
    {
      id: "duplicates",
      title: "Handling duplicates",
      body: `:::example Subsets II (LC 90)
When the input has repeated values, sort first and **skip a value equal to its predecessor at the same tree depth**. This generates each distinct configuration once.

\`\`\`cpp
// Subsets II with duplicates (LC 90): sort, then skip repeats per level.
void subsetsDup(vector<int>& nums, int start, vector<int>& path,
                vector<vector<int>>& out) {
  out.push_back(path);
  for (int i = start; i < (int)nums.size(); i++) {
    if (i > start && nums[i] == nums[i - 1]) {
      continue;  // same value already tried at this depth
    }
    path.push_back(nums[i]);
    subsetsDup(nums, i + 1, path, out);
    path.pop_back();
  }
}
\`\`\`
:::

The same \`i > start && nums[i] == nums[i - 1]\` guard deduplicates Combination Sum II (LC 40) and Permutations II (LC 47, where the guard becomes \`!used[i - 1]\`).`,
    },
    {
      id: "pruning",
      title: "Pruning & constraint propagation",
      body: `Pruning is what turns an impossible \`O(n!)\` search into something that runs. Cut a branch the moment it cannot lead to a valid or better answer.

- **Feasibility pruning**: stop when the partial solution already violates a constraint (sum exceeds target, not enough items remain).
- **Bound pruning**: in optimization, abandon a branch whose best possible outcome is worse than the best found so far (branch and bound).
- **Symmetry breaking**: fix an order (e.g. require indices to increase) so you never generate the same set two ways.
- **Constraint propagation**: maintain helper arrays (used columns/diagonals for N-Queens) so \`valid\` is \`O(1)\`.

:::example Combination Sum (LC 39)
\`\`\`cpp
// Combination Sum (LC 39): prune as soon as the running sum passes target.
void combinationSum(vector<int>& cand, int start, int target,
                    vector<int>& path, vector<vector<int>>& out) {
  if (target == 0) {
    out.push_back(path);
    return;
  }
  for (int i = start; i < (int)cand.size(); i++) {
    if (cand[i] > target) {
      continue;  // sorted input -> later candidates are even larger
    }
    path.push_back(cand[i]);
    combinationSum(cand, i, target - cand[i], path, out);  // reuse allowed
    path.pop_back();
  }
}
\`\`\`
:::`,
    },
    {
      id: "board",
      title: "Board problems: N-Queens & Sudoku",
      body: `:::example N-Queens (LC 51/52)
Board problems place pieces cell by cell, keeping \`O(1)\` validity checks via occupancy markers. (For grid path search and word search, see [Grid / Matrix](/handbook/grid).)

\`\`\`cpp
// N-Queens count (LC 51/52): track attacked columns and both diagonals.
int n;
vector<bool> col, diag, anti;  // anti index: r + c, diag index: r - c + n

int placeQueens(int r) {
  if (r == n) {
    return 1;  // all rows filled -> one valid board
  }
  int count = 0;
  for (int c = 0; c < n; c++) {
    if (col[c] || diag[r - c + n] || anti[r + c]) {
      continue;
    }
    col[c] = diag[r - c + n] = anti[r + c] = true;
    count += placeQueens(r + 1);
    col[c] = diag[r - c + n] = anti[r + c] = false;  // undo
  }
  return count;
}
\`\`\`
:::

Sudoku (LC 37) is the same idea: find the next empty cell, try digits 1–9 that are unused in the row, column, and 3×3 box, recurse, and undo. Choosing the **most-constrained** empty cell first (fewest legal digits) is a strong heuristic.`,
    },
    {
      id: "partition",
      title: "Partitioning & word problems",
      body: `:::example Palindrome Partitioning (LC 131)
Many string and array problems are backtracking over **where to cut** or **how to assign** elements.

\`\`\`cpp
// Palindrome Partitioning (LC 131): cut the string into palindromic pieces.
bool isPalindrome(const string& s, int l, int r) {
  while (l < r) {
    if (s[l++] != s[r--]) {
      return false;
    }
  }
  return true;
}

void partition(const string& s, int start, vector<string>& path,
               vector<vector<string>>& out) {
  if (start == (int)s.size()) {
    out.push_back(path);
    return;
  }
  for (int end = start; end < (int)s.size(); end++) {
    if (!isPalindrome(s, start, end)) {
      continue;
    }
    path.push_back(s.substr(start, end - start + 1));
    partition(s, end + 1, path, out);
    path.pop_back();
  }
}
\`\`\`
:::

The same shape solves Restore IP Addresses (LC 93, cut into 4 valid octets) and Letter Combinations of a Phone Number (LC 17, branch over each digit's letters). For "can we split into \`k\` equal-sum groups" (LC 698), backtrack by **assigning each number to a bucket** with sorting + pruning.`,
    },
    {
      id: "advanced",
      title: "Advanced techniques (hard problems)",
      body: `**Memoized backtracking → DP.** When branches revisit the same state, cache results on that state. This is exactly top-down DP and collapses exponential recursion to polynomial: Word Break II (LC 140), Matchsticks to Square / Partition to K Equal Sum Subsets via bitmask memo (LC 698, LC 473), and Minimum Number of Work Sessions (LC 1986).

**Bitmask state.** For $n \\le 20$, represent "which elements are used" as an integer and memoize over it — the link between backtracking and [Bitmask DP](/handbook/dynamic-programming).

\`\`\`cpp
// Count Hamiltonian-style assignments with a bitmask memo.
int n;                       // items
vector<int> memo;            // size 1<<n, -1 = uncomputed
int dfs(int mask) {
  if (mask == (1 << n) - 1) {
    return 1;
  }
  if (memo[mask] != -1) {
    return memo[mask];
  }
  int pos = __builtin_popcount(mask);  // assign item index 'pos' next
  int res = 0;
  for (int i = 0; i < n; i++) {
    if (!(mask & (1 << i)) && compatible(pos, i)) {
      res += dfs(mask | (1 << i));
    }
  }
  return memo[mask] = res;
}
\`\`\`

**Iterative deepening (IDA*).** When the depth of the answer is small but the tree is huge, repeatedly DFS with an increasing depth limit; add an admissible heuristic to prune (classic for puzzle solvers).

**Meet in the middle.** Split the choices in half, enumerate each half ($2^{n/2}$), and combine — turns $2^{40}$ into a manageable $2^{20}$ per side (see [Bit Manipulation](/handbook/bit-manipulation)).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `Backtracking cost is *(number of nodes in the search tree) × (work per node)*. Pruning shrinks the node count, often dramatically.

| Pattern | Configurations | Typical bound |
| --- | --- | --- |
| Subsets | $2^n$ | \`O(n * 2^n)\` to emit |
| Combinations $C(n, k)$ | $C(n, k)$ | \`O(k * C(n, k))\` |
| Permutations | $n!$ | \`O(n * n!)\` |
| N-Queens | backtracked | \`O(n!)\` worst, far less pruned |
| Partition into k groups | $k^n$ raw | feasible with sorting + pruning |
| Memoized over bitmask | $2^n$ states | \`O(2^n * n)\` |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 78 | [Subsets](https://leetcode.cn/problems/subsets) | include / exclude |
| 90 | [Subsets II](https://leetcode.cn/problems/subsets-ii) | dedupe per level |
| 46 | [Permutations](https://leetcode.cn/problems/permutations) | used-array |
| 47 | [Permutations II](https://leetcode.cn/problems/permutations-ii) | dedupe per level |
| 77 | [Combinations](https://leetcode.cn/problems/combinations) | start index + pruning |
| 39 | [Combination Sum](https://leetcode.cn/problems/combination-sum) | reuse + feasibility prune |
| 40 | [Combination Sum II](https://leetcode.cn/problems/combination-sum-ii) | dedupe per level |
| 17 | [Letter Combinations of a Phone Number](https://leetcode.cn/problems/letter-combinations-of-a-phone-number) | branch over digits |
| 22 | [Generate Parentheses](https://leetcode.cn/problems/generate-parentheses) | constraint pruning |
| 131 | [Palindrome Partitioning](https://leetcode.cn/problems/palindrome-partitioning) | partition cuts |
| 93 | [Restore IP Addresses](https://leetcode.cn/problems/restore-ip-addresses) | partition into 4 octets |
| 51 | [N-Queens](https://leetcode.cn/problems/n-queens) | board + occupancy markers |
| 37 | [Sudoku Solver](https://leetcode.cn/problems/sudoku-solver) | constraint propagation |
| 79 | [Word Search](https://leetcode.cn/problems/word-search) | grid DFS + undo |
| 698 | [Partition to K Equal Sum Subsets](https://leetcode.cn/problems/partition-to-k-equal-sum-subsets) | bucket assignment + pruning |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3669 | [Balanced K Factor Decomposition](https://leetcode.cn/problems/balanced-k-factor-decomposition) | 1917 | factor enumeration |
| 3646 | [Next Special Palindrome Number](https://leetcode.cn/problems/next-special-palindrome-number) | 2445 | digit construction |
| 2767 | [Partition String Into Minimum Beautiful Substrings](https://leetcode.cn/problems/partition-string-into-minimum-beautiful-substrings) | 1865 | partition DFS |
| 2597 | [The Number of Beautiful Subsets](https://leetcode.cn/problems/the-number-of-beautiful-subsets) | 2023 | choose / skip + pruning |
| 2305 | [Fair Distribution of Cookies](https://leetcode.cn/problems/fair-distribution-of-cookies) | 1887 | bucket assignment |
| 2056 | [Number of Valid Move Combinations on Chessboard](https://leetcode.cn/problems/number-of-valid-move-combinations-on-chessboard) | 2611 | exhaustive search |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Forgetting to undo**: every \`apply\` needs a matching \`undo\` (\`push_back\` ↔ \`pop_back\`, set flag ↔ clear flag).
- **Duplicate results**: sort the input and skip equal siblings at the same depth, or pass a \`start\` index for combinations/subsets.
- **Copying vs. sharing**: push a *copy* of \`path\` into the results; keep mutating the single shared \`path\` during recursion.
- **No pruning**: an unpruned permutation/partition search times out fast — add feasibility and bound checks first.
- **Confusing subsets with combinations**: subsets explore include/exclude at every index; combinations fix a size and march a start index forward.
- **When every state repeats**: switch to memoized recursion (top-down [DP](/handbook/dynamic-programming)) instead of re-exploring.

\`\`\`cpp
// Right: store a snapshot of the path, then keep mutating the shared vector.
out.push_back(path);  // copy
// Wrong: out.push_back(move(path)); — empties the path used by sibling calls.
\`\`\``,
    },
  ],
};
