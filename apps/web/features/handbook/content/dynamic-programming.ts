import type { HandbookTopic } from "../model";

export const dynamicProgramming: HandbookTopic = {
  slug: "dynamic-programming",
  title: "Dynamic Programming",
  tagline:
    "Define a state, write the transition, choose memo or tabulation — from knapsack to LIS to digit & bitmask DP.",
  icon: "Boxes",
  group: "Dynamic Programming",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Dynamic programming solves a problem by combining solutions to overlapping subproblems. It applies when the problem has:

1. **Optimal substructure** — the optimum is built from optima of subproblems.
2. **Overlapping subproblems** — the same subproblem recurs, so caching pays off.

Signals: "count the number of ways", "minimum/maximum cost to …", "is it possible to partition / reach …", choices made in sequence where earlier choices constrain later ones, and exponential brute force (try all subsets/paths) that recomputes the same situations.

The recipe never changes:

1. **State** — what minimal information describes a subproblem? (\`dp[i]\`, \`dp[i][j]\`, \`dp[mask]\`…)
2. **Transition** — how does a state depend on smaller states?
3. **Base cases** — the smallest states.
4. **Order / direction** — memoize top-down, or fill bottom-up so dependencies come first.
5. **Answer** — which state holds it?`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Recursion and the idea of caching (memoization).
- Arrays/2D arrays and iteration order.
- Sometimes [Binary Search](/handbook/binary-search) (LIS), [Bit Manipulation](/handbook/bit-manipulation) (bitmask DP), and [Trees](/handbook/trees) (tree DP).`,
    },
    {
      id: "memo-vs-tab",
      title: "Memoization vs. tabulation",
      body: `**Top-down (memoization)**: write the natural recursion, cache results. Easy to derive; only computes reachable states.

\`\`\`cpp
// Fibonacci-style memoized recursion (template for any top-down DP)
vector<long long> memo;  // sized n+1, init to -1
long long f(int i) {
  if (i <= 1) {
    return i;  // base case
  }
  if (memo[i] != -1) {
    return memo[i];  // cache hit
  }
  return memo[i] = f(i - 1) + f(i - 2);  // transition + store
}
\`\`\`

**Bottom-up (tabulation)**: fill a table in dependency order. Often faster (no recursion overhead) and enables space optimization.

\`\`\`cpp
// Same DP, tabulated, with O(1) rolling space
long long fib(int n) {
  long long a = 0, b = 1;
  for (int i = 2; i <= n; i++) {
    long long c = a + b;
    a = b;
    b = c;
  }
  return n == 0 ? 0 : b;
}
\`\`\`

Derive top-down first; convert to bottom-up when you need speed or space.`,
    },
    {
      id: "linear",
      title: "1D / linear DP",
      body: `When the state is a single index and each \`dp[i]\` depends on a few previous values.

\`\`\`cpp
// House Robber (LC 198): rob[i] = max(skip this, rob this + dp[i-2])
int rob(vector<int>& a) {
  int take = 0, skip = 0;  // best ending with/without robbing prev
  for (int x : a) {
    int newTake = skip + x;
    skip = max(skip, take);
    take = newTake;
  }
  return max(take, skip);
}
\`\`\`

Climbing Stairs (LC 70), Maximum Subarray / Kadane (LC 53), Decode Ways (LC 91), Word Break (LC 139), and Jump-style DP all fit this shape.`,
    },
    {
      id: "knapsack",
      title: "Knapsack & subset DP",
      body: `**0/1 knapsack**: each item used at most once → iterate capacity **downward** so an item isn't reused.

\`\`\`cpp
// 0/1 knapsack: max value within capacity W
int knapsack01(vector<int>& wt, vector<int>& val, int W) {
  vector<int> dp(W + 1, 0);
  for (int i = 0; i < (int)wt.size(); i++) {
    for (int c = W; c >= wt[i]; c--) {  // downward: each item once
      dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
    }
  }
  return dp[W];
}
\`\`\`

**Unbounded knapsack**: items reusable → iterate capacity **upward**.

\`\`\`cpp
// Coin Change (LC 322): fewest coins to make 'amount'; upward = reuse allowed
int coinChange(vector<int>& coins, int amount) {
  const int INF = 1e9;
  vector<int> dp(amount + 1, INF);
  dp[0] = 0;
  for (int c : coins) {
    for (int a = c; a <= amount; a++) {
      dp[a] = min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] >= INF ? -1 : dp[amount];
}
\`\`\`

**Subset-sum / partition** (LC 416) is a boolean 0/1 knapsack: can we hit \`sum/2\`? Coin Change II (LC 518) counts combinations (loop coins outer to avoid counting orderings).`,
    },
    {
      id: "lis",
      title: "Longest increasing subsequence",
      body: `The \`O(n^2)\` DP is intuitive; the \`O(n log n)\` patience-sorting version is the one to memorize.

\`\`\`cpp
// LIS length in O(n log n) (LC 300): tails[k] = smallest tail of an LIS of
// length k+1
int lengthOfLIS(vector<int>& a) {
  vector<int> tails;
  for (int x : a) {
    // strictly increasing
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) {
      tails.push_back(x);
    } else {
      *it = x;  // replace to keep tails small
    }
  }
  return tails.size();
}
\`\`\`

For non-decreasing subsequences use \`upper_bound\`. Russian Doll Envelopes (LC 354) sorts then runs LIS; Number of LIS (LC 673) augments the \`O(n^2)\` DP with counts.`,
    },
    {
      id: "twoseq",
      title: "Two-sequence DP (LCS, edit distance)",
      body: `State \`dp[i][j]\` over prefixes of two strings; the transition compares \`a[i-1]\` and \`b[j-1]\`.

\`\`\`cpp
// Longest Common Subsequence (LC 1143)
int lcs(string a, string b) {
  int m = a.size(), n = b.size();
  vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      dp[i][j] = (a[i - 1] == b[j - 1]) ? dp[i - 1][j - 1] + 1
                                        : max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}
\`\`\`

\`\`\`cpp
// Edit Distance (LC 72): insert/delete/replace
int minDistance(string a, string b) {
  int m = a.size(), n = b.size();
  vector<vector<int>> dp(m + 1, vector<int>(n + 1));
  for (int i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (int j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      dp[i][j] = (a[i - 1] == b[j - 1])
                     ? dp[i - 1][j - 1]
                     : 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
    }
  }
  return dp[m][n];
}
\`\`\``,
    },
    {
      id: "interval",
      title: "Interval DP",
      body: `State over a sub-range \`dp[l][r]\`; iterate by **increasing length** and split at an inner point \`k\`.

\`\`\`cpp
// Burst Balloons (LC 312): dp[l][r] = max coins bursting open interval (l, r)
int maxCoins(vector<int> nums) {
  int n = nums.size();
  vector<int> a(n + 2, 1);
  for (int i = 0; i < n; i++) {
    a[i + 1] = nums[i];  // padded with 1s
  }
  vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
  for (int len = 1; len <= n; len++) {
    for (int l = 1; l + len - 1 <= n; l++) {
      int r = l + len - 1;
      for (int k = l; k <= r; k++) {  // k is the last balloon burst
        dp[l][r] = max(
            dp[l][r], dp[l][k - 1] + a[l - 1] * a[k] * a[r + 1] + dp[k + 1][r]);
      }
    }
  }
  return dp[1][n];
}
\`\`\`

Matrix Chain order, Minimum Cost to Cut a Stick (LC 1547), and Stone Game variants are interval DP.`,
    },
    {
      id: "statemachine",
      title: "State-machine DP (stocks)",
      body: `Model the problem as states (holding / not holding / cooldown) with transitions per step. The stock family is the canonical example.

\`\`\`cpp
// Best Time to Buy/Sell with cooldown (LC 309)
int maxProfit(vector<int>& p) {
  int hold = INT_MIN, sold = 0, rest = 0;  // states after day i
  for (int x : p) {
    int prevSold = sold;
    sold = hold + x;             // sell today
    hold = max(hold, rest - x);  // keep holding or buy today
    rest = max(rest, prevSold);  // cooldown after selling
  }
  return max(sold, rest);
}
\`\`\`

With at most \`k\` transactions (LC 188), use \`dp[k][holding]\` arrays.`,
    },
    {
      id: "bitmask",
      title: "Bitmask DP",
      body: `When \`n <= ~20\`, encode a subset as the bits of an integer. State \`dp[mask]\` (optionally with an extra dimension) iterates over \`2^n\` subsets.

\`\`\`cpp
// Travelling salesman-style: shortest path visiting all nodes (LC 943-flavored)
int tsp(vector<vector<int>>& dist) {
  int n = dist.size(), FULL = (1 << n) - 1;
  vector<vector<int>> dp(1 << n, vector<int>(n, 1e9));
  for (int i = 0; i < n; i++) {
    dp[1 << i][i] = 0;
  }
  for (int mask = 1; mask <= FULL; mask++) {
    for (int u = 0; u < n; u++) {
      if (mask & (1 << u)) {
        for (int v = 0; v < n; v++) {
          if (!(mask & (1 << v))) {
            dp[mask | (1 << v)][v] =
                min(dp[mask | (1 << v)][v], dp[mask][u] + dist[u][v]);
          }
        }
      }
    }
  }
  return *min_element(dp[FULL].begin(), dp[FULL].end());
}
\`\`\`

Partition to K Equal Sum Subsets (LC 698) and Shortest Path Visiting All Nodes (LC 847) are bitmask DP.`,
    },
    {
      id: "digit",
      title: "Digit DP",
      body: `Count numbers in \`[0, N]\` satisfying a digit property by building the number digit-by-digit, tracking a \`tight\` flag (whether the prefix equals N's prefix).

\`\`\`cpp
// Count integers in [0, N] with no two equal adjacent digits (template)
string s;
// memo[pos][prev], -1 init; size handles tight separately
vector<vector<int>> memo;
int dfs(int pos, int prev, bool tight, bool started) {
  if (pos == (int)s.size()) {
    return 1;
  }
  if (!tight && started && memo[pos][prev] != -1) {
    return memo[pos][prev];
  }
  int hi = tight ? s[pos] - '0' : 9, res = 0;
  for (int d = 0; d <= hi; d++) {
    if (started && d == prev) {
      continue;  // property check
    }
    res += dfs(pos + 1, d, tight && d == hi, started || d > 0);
  }
  if (!tight && started) {
    memo[pos][prev] = res;
  }
  return res;
}
\`\`\`

Used for Numbers With Repeated Digits (LC 1012), Count Numbers with Unique Digits (LC 357), and Stepping Numbers.`,
    },
    {
      id: "dp-optimization",
      title: "Transition optimization (monotonic queue, CHT, D&C, Knuth)",
      body: `When a DP is correct but too slow, the *transition* — not the state — is usually the bottleneck. The four standard accelerators:

**Monotonic-queue optimization.** When \`dp[i] = best(dp[i-k..i-1]) + c[i]\` (a sliding-window extreme), a monotonic deque turns the \`O(nk)\` scan into \`O(n)\`.

\`\`\`cpp
// Jump Game VI (LC 1696): dp[i] = a[i] + max(dp[i-k..i-1])
int maxResult(vector<int>& a, int k) {
  int n = a.size();
  vector<long long> dp(n);
  deque<int> dq;  // indices, dp[] decreasing
  dp[0] = a[0];
  dq.push_back(0);
  for (int i = 1; i < n; i++) {
    while (!dq.empty() && dq.front() < i - k) {
      dq.pop_front();  // drop out-of-window
    }
    dp[i] = a[i] + dp[dq.front()];
    while (!dq.empty() && dp[dq.back()] <= dp[i]) {
      dq.pop_back();
    }
    dq.push_back(i);
  }
  return dp[n - 1];
}
\`\`\`

**Convex Hull Trick (CHT).** Transitions of the form \`dp[i] = min_j (dp[j] + b[j]·a[i])\` are linear functions of \`a[i]\`; maintain a lower/upper hull of lines for \`O(1)\` or \`O(log n)\` queries — amortizing \`O(n^2)\` down to \`O(n log n)\` or \`O(n)\`.

**Divide & conquer DP.** When the optimal split point \`opt(i)\` is monotone in \`i\`, compute \`dp[k][·]\` by recursing on index ranges and split ranges together — \`O(kn log n)\` instead of \`O(kn^2)\` (e.g. allocate-mailboxes-style layered DP).

**Knuth's optimization.** Interval DPs \`dp[i][j] = min_k(dp[i][k] + dp[k][j]) + w(i,j)\` whose cost obeys the quadrangle inequality have monotone optimal splits, collapsing \`O(n^3)\` to \`O(n^2)\`.`,
    },
    {
      id: "matrix-expo",
      title: "Matrix exponentiation & SOS DP",
      body: `**Matrix exponentiation.** Any linear recurrence (or count of length-\`k\` walks in a graph) can be raised to the \`k\`-th power in \`O(d^3 log k)\` — essential when \`k\` is up to \`1e9\`.

\`\`\`cpp
// Matrix power for linear recurrences / counting length-k walks (mod 1e9+7)
using Matrix = vector<vector<long long>>;
const long long MOD = 1e9 + 7;
Matrix mul(const Matrix& A, const Matrix& B) {
  int n = A.size(), m = B[0].size(), p = B.size();
  Matrix C(n, vector<long long>(m, 0));
  for (int i = 0; i < n; i++) {
    for (int k = 0; k < p; k++) {
      if (A[i][k]) {
        for (int j = 0; j < m; j++) {
          C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
        }
      }
    }
  }
  return C;
}
Matrix matpow(Matrix A, long long e) {
  int n = A.size();
  Matrix R(n, vector<long long>(n, 0));
  for (int i = 0; i < n; i++) {
    R[i][i] = 1;  // identity
  }
  while (e > 0) {
    if (e & 1) {
      R = mul(R, A);
    }
    A = mul(A, A);
    e >>= 1;
  }
  return R;
}
\`\`\`

Use it for Student Attendance Record II (LC 552), Knight Dialer (LC 935), and Count Vowel Permutations (LC 1220) when the step count is large.

**Sum over Subsets (SOS) DP.** Computes, for every mask, an aggregate over all its submasks in \`O(n·2^n)\` instead of \`O(3^n)\`:

\`\`\`cpp
// SOS DP: f[mask] becomes the sum over all submasks of mask
for (int b = 0; b < n; b++) {
  for (int mask = 0; mask < (1 << n); mask++) {
    if (mask & (1 << b)) {
      f[mask] += f[mask ^ (1 << b)];
    }
  }
}
\`\`\``,
    },
    {
      id: "game-probability",
      title: "Game theory & probability DP",
      body: `**Minimax / game DP.** Two-player optimal-play problems store the score *margin* for the player to move; each player maximizes their own outcome.

\`\`\`cpp
// Predict the Winner (LC 486): dp[i][j] = best margin on a[i..j] for the mover
bool predictTheWinner(vector<int>& a) {
  int n = a.size();
  vector<vector<int>> dp(n, vector<int>(n, 0));
  for (int i = 0; i < n; i++) {
    dp[i][i] = a[i];
  }
  for (int len = 2; len <= n; len++) {
    for (int i = 0; i + len - 1 < n; i++) {
      int j = i + len - 1;
      // take left or right
      dp[i][j] = max(a[i] - dp[i + 1][j], a[j] - dp[i][j - 1]);
    }
  }
  return dp[0][n - 1] >= 0;
}
\`\`\`

Stone Game (LC 877), Stone Game II/III, and Nim (LC 292, Sprague–Grundy for impartial games) follow the same minimax skeleton.

**Probability / expectation DP.** States hold a probability or expected value; transitions weight by outcome probabilities. New 21 Game (LC 837) uses a sliding-window sum of probabilities; Soup Servings (LC 808) memoizes on remaining amounts and converges for large inputs.

**DP + binary search.** Weighted interval scheduling — Maximum Profit in Job Scheduling (LC 1235) — sorts by end time and binary-searches the latest non-overlapping job for each transition, \`O(n log n)\`. (LIS in \`O(n log n)\` is the same idea.)`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `DP cost = (number of states) × (work per transition).

| Pattern | States × transition | Typical |
| --- | --- | --- |
| Linear | \`O(n)\` × \`O(1)\` | \`O(n)\` |
| Knapsack | \`O(nW)\` × \`O(1)\` | \`O(nW)\` |
| LIS (binary search) | — | \`O(n log n)\` |
| Two-sequence | \`O(mn)\` × \`O(1)\` | \`O(mn)\` |
| Interval | \`O(n^2)\` × \`O(n)\` | \`O(n^3)\` |
| Bitmask | \`O(2^n · n)\` × \`O(n)\` | \`O(2^n · n^2)\` |
| Digit | \`O(digits · states)\` | small |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Pattern |
| --- | --- | --- |
| 64 / 62 | [Min Path Sum](https://leetcode.cn/problems/minimum-path-sum) / [Unique Paths](https://leetcode.cn/problems/unique-paths) | grid DP |
| 70 / 198 / 53 | [Stairs](https://leetcode.cn/problems/climbing-stairs) / [Robber](https://leetcode.cn/problems/house-robber) / [Max Subarray](https://leetcode.cn/problems/maximum-subarray) | linear DP |
| 300 / 354 / 673 | [LIS family](https://leetcode.cn/problems/longest-increasing-subsequence) | LIS |
| 309 / 188 | [Stock with Cooldown](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown) / [k Transactions](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv) | state-machine DP |
| 312 | [Burst Balloons](https://leetcode.cn/problems/burst-balloons) | interval DP |
| 322 / 518 | [Coin Change I/II](https://leetcode.cn/problems/coin-change) | unbounded knapsack |
| 337 | [House Robber III](https://leetcode.cn/problems/house-robber-iii) | tree DP |
| 416 | [Partition Equal Subset Sum](https://leetcode.cn/problems/partition-equal-subset-sum) | 0/1 knapsack |
| 698 / 847 | [Partition K Subsets](https://leetcode.cn/problems/partition-to-k-equal-sum-subsets) / [Visit All Nodes](https://leetcode.cn/problems/shortest-path-visiting-all-nodes) | bitmask DP |
| 1143 / 72 | [LCS](https://leetcode.cn/problems/longest-common-subsequence) / [Edit Distance](https://leetcode.cn/problems/edit-distance) | two-sequence DP |
| 1547 | [Min Cost to Cut a Stick](https://leetcode.cn/problems/minimum-cost-to-cut-a-stick) | interval DP |

**Advanced practice problems**

| ID | Problem | Pattern |
| --- | --- | --- |
| 552 | [Student Attendance Record II](https://leetcode.cn/problems/student-attendance-record-ii) | matrix exponentiation |
| 877 | [Stone Game](https://leetcode.cn/problems/stone-game) | minimax DP |
| 1235 | [Maximum Profit in Job Scheduling](https://leetcode.cn/problems/maximum-profit-in-job-scheduling) | DP + binary search |
| 1696 | [Jump Game VI](https://leetcode.cn/problems/jump-game-vi) | monotonic-queue DP |
| 2008 | [Maximum Earnings From Taxi](https://leetcode.cn/problems/maximum-earnings-from-taxi) | DP + binary search |
| 2218 | [Maximum Value of K Coins From Piles](https://leetcode.cn/problems/maximum-value-of-k-coins-from-piles) | group knapsack |
| 2266 | [Count Number of Texts](https://leetcode.cn/problems/count-number-of-texts) | linear DP |
| 2466 | [Count Ways To Build Good Strings](https://leetcode.cn/problems/count-ways-to-build-good-strings) | counting DP |

**Recent medium problems**

| ID | Problem | Rating | Pattern |
| --- | --- | --- | --- |
| 3685 | [Subsequence Sum After Capping Elements](https://leetcode.cn/problems/subsequence-sum-after-capping-elements) | 2073 | knapsack DP |
| 3654 | [Minimum Sum After Divisible Sum Deletions](https://leetcode.cn/problems/minimum-sum-after-divisible-sum-deletions) | 2039 | DP + prefix |
| 3686 | [Number of Stable Subsequences](https://leetcode.cn/problems/number-of-stable-subsequences) | 1969 | counting DP |
| 3599 | [Partition Array to Minimize XOR](https://leetcode.cn/problems/partition-array-to-minimize-xor) | 1955 | bitmask / interval DP |
| 3738 | [Longest Non-Decreasing Subarray After One Replacement](https://leetcode.cn/problems/longest-non-decreasing-subarray-after-replacing-at-most-one-element) | 1811 | DP |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Knapsack loop direction**: 0/1 iterates capacity *down*, unbounded iterates *up*. Getting it wrong silently changes the answer.
- **Combinations vs. permutations** (Coin Change II): loop items outer for combinations, capacity outer for permutations.
- **Initialize correctly**: "min cost" tables start at \`INF\` with \`dp[0]=0\`; "count" tables start at \`0\` with \`dp[0]=1\`.
- **State completeness**: if two different paths to the same indices behave differently, your state is missing a dimension.
- **Overflow**: counts can explode — use \`long long\` and take a modulus when asked.
- **Space**: 2D DPs that only look back one row collapse to \`O(n)\` rolling arrays.`,
    },
  ],
};
