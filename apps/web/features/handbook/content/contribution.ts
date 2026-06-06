import type { HandbookTopic } from "../model";

export const contribution: HandbookTopic = {
  slug: "contribution",
  title: "Contribution Method",
  tagline:
    "Swap the order of summation — count how much each element, bit, pair, or edge adds across all structures instead of evaluating every structure.",
  icon: "PieChart",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `The **contribution method** (貢獻法) evaluates a sum of the form "**total over all** subarrays / subsequences / pairs / paths of $f(X)$" by exchanging the order of summation. Instead of iterating every structure $X$ and computing $f(X)$, you flip the question: for each *atomic part* — an element, a single bit, a pair, a tree edge — ask **how much does this part add to the grand total across all structures?** Summing those independent contributions gives the answer.

The recurring identity is:

> $\\text{total} = \\sum_{\\text{parts}} (\\text{value of the part}) \\times (\\text{number of structures it counts in})$

A brute force over all $O(n^2)$ subarrays or $O(2^n)$ subsets collapses to $O(n)$ or $O(n \\log V)$ once the per-part count has a closed form.

Signals:

- "**sum / total** over **all** subarrays, subsequences, pairs, or paths of …"
- the per-structure value is an aggregate you can *attribute* to parts: a sum, a min, a max, an XOR, an absolute difference, a distance
- direct enumeration is $O(n^2)$ / $O(2^n)$ but "in how many structures does part $p$ count?" has a formula
- "for each element, in how many [structures] does it appear / dominate / flip a bit?"

Patterns covered on this page:

- [Positional subarray count](#positional) — every element times the number of subarrays containing it.
- [Min / max domination](#domination) — each element weighted by the subarrays it is the extreme of (monotonic stack).
- [Per-bit contribution](#bitwise) — solve each bit independently for XOR / AND / OR / Hamming sums.
- [Pairwise contribution](#pairwise) — sort, then count how often each value is the larger / smaller side.
- [Subsequence contribution](#subsequence) — powers of two for sums over all $2^n$ subsequences.
- [Tree edge / path contribution](#tree) — each edge weighted by the pairs whose path crosses it.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Basic combinatorial counting (how many subarrays/subsets contain an index).
- Prefix sums and sorting for the pairwise and subsequence variants.
- A [Monotonic Stack](/handbook/monotonic-stack-vs-deque) for the min/max domination spans.
- Bit operations for the per-bit split (see [Bit Manipulation](/handbook/bit-manipulation)).

Related: [Sliding Window](/handbook/sliding-window), [Trees](/handbook/trees), [Math](/handbook/math).`,
    },
    {
      id: "positional",
      title: "Pattern 1: Positional subarray count",
      body: `When $f(\\text{subarray}) = \\text{sum}$, every element contributes its value once per subarray that contains it. Index $i$ (0-based) is the left end of $i + 1$ choices and the right end of $n - i$ choices, so it appears in $(i+1)(n-i)$ subarrays.

\`\`\`cpp
// Sum of all subarray sums: a[i] appears in (i+1)*(n-i) subarrays
long long sumOfAllSubarraySums(vector<int>& a) {
  int n = a.size();
  long long total = 0;
  for (int i = 0; i < n; i++) {
    total += 1LL * a[i] * (i + 1) * (n - i);  // # subarrays covering index i
  }
  return total;
}
\`\`\`

**Restrict the count by a property of the subarray.** Sum of All Odd Length Subarrays (LC 1588) keeps only odd-length subarrays containing index $i$; exactly $\\lceil (i+1)(n-i)/2 \\rceil$ of them qualify, so the contribution is $a_i \\cdot \\lceil (i+1)(n-i)/2 \\rceil$. The same "count then weight" idea drives Minimum Number of Operations to Move All Balls (LC 1769), where each box's distance is a prefix-count contribution.`,
    },
    {
      id: "domination",
      title: "Pattern 2: Min / max domination",
      body: `When $f(\\text{subarray})$ is a **min** or **max**, attribute each subarray to its extreme element. For $a_i$, find the maximal span $[\\text{left}, \\text{right}]$ over which it stays the minimum; it is then the minimum of $\\text{left} \\cdot \\text{right}$ subarrays, contributing $a_i \\cdot \\text{left} \\cdot \\text{right}$. A [Monotonic Stack](/handbook/monotonic-stack-vs-deque) computes both boundaries in $O(n)$.

\`\`\`cpp
// left[i]*right[i] = # subarrays where a[i] is the minimum; sum the contributions
long long sumSubarrayMins(vector<int>& a) {
  int n = a.size();
  vector<int> left(n), right(n);
  stack<int> st;
  for (int i = 0; i < n; i++) {  // strictly-smaller element to the left
    while (!st.empty() && a[st.top()] >= a[i]) st.pop();
    left[i] = st.empty() ? i + 1 : i - st.top();
    st.push(i);
  }
  st = {};
  for (int i = n - 1; i >= 0; i--) {  // smaller-or-equal to the right (no ties)
    while (!st.empty() && a[st.top()] > a[i]) st.pop();
    right[i] = st.empty() ? n - i : st.top() - i;
    st.push(i);
  }
  long long total = 0;
  for (int i = 0; i < n; i++) total += 1LL * a[i] * left[i] * right[i];
  return total;
}
\`\`\`

Sum of Subarray Ranges (LC 2104) = (sum of subarray maxima) − (sum of subarray minima), each a domination sum. Maximum Subarray Min-Product (LC 1856) multiplies each element's min-span by a prefix-sum window. The asymmetric strict/non-strict comparison ($\\ge$ on one side, $>$ on the other) prevents double-counting equal values.`,
    },
    {
      id: "bitwise",
      title: "Pattern 3: Per-bit contribution",
      body: `:::example Total Hamming Distance (LC 477)
For sums of **XOR / AND / OR** or Hamming distances over all pairs or subsets, the bits are independent: bit $b$ contributes $2^b$ times the number of structures whose aggregate has bit $b$ set. Solve one bit at a time, then weight by $2^b$.

\`\`\`cpp
// Total Hamming Distance between all pairs (LC 477)
int totalHammingDistance(vector<int>& a) {
  int n = a.size(), total = 0;
  for (int b = 0; b < 30; b++) {
    int ones = 0;
    for (int x : a) ones += (x >> b) & 1;
    total += ones * (n - ones);  // each (one, zero) pair differs in bit b
  }
  return total;
}
\`\`\`
:::

:::example Sum of All Subset XOR Totals (LC 1863)
A bit set in *any* element appears in exactly half of the $2^n$ subsets, so Sum of All Subset XOR Totals (LC 1863) needs no enumeration at all:

\`\`\`cpp
// Sum of XOR totals over all subsets (LC 1863)
int subsetXORSum(vector<int>& a) {
  int orAll = 0;
  for (int x : a) orAll |= x;
  return orAll << (a.size() - 1);  // each present bit is set in 2^(n-1) subsets
}
\`\`\`
:::

Each present bit lands in $2^{n-1}$ of the subsets, so the answer is simply the OR of all values shifted left by $n - 1$. The same per-bit split powers Count Beautiful Subarrays via prefix XOR (LC 2588) and OR/AND-over-all-subarrays totals.`,
    },
    {
      id: "pairwise",
      title: "Pattern 4: Pairwise contribution after sorting",
      body: `Sums over all **pairs** of $|a_i - a_j|$ look quadratic, but after sorting, the element at rank $i$ is the **larger** side of exactly $i$ pairs and the **smaller** side of $n - 1 - i$ pairs. A running prefix sum turns the whole thing into one pass.

\`\`\`cpp
// Sum of |a_i - a_j| over all unordered pairs (sort + prefix)
long long sumPairwiseAbsDiff(vector<int> a) {
  sort(a.begin(), a.end());
  int n = a.size();
  long long total = 0, prefix = 0;
  for (int i = 0; i < n; i++) {
    total += 1LL * i * a[i] - prefix;  // a[i] beats the i smaller elements
    prefix += a[i];
  }
  return total;
}
\`\`\`

Sum of Absolute Differences in a Sorted Array (LC 1685) reports this contribution per index using both a prefix and a suffix sum. The "rank as a signed coefficient" idea also gives Sum of Distances (LC 2615) and any "sum of $|x_i - x_j|$" objective.`,
    },
    {
      id: "subsequence",
      title: "Pattern 5: Subsequence contribution (powers of two)",
      body: `:::example Sum of Subsequence Widths (LC 891)
For sums over all $2^n$ **subsequences** where $f$ is a max, min, or width, sort and count with powers of two: the element at rank $i$ is the **max** of every subsequence chosen from the $i$ smaller elements ($2^i$ of them) and the **min** of $2^{n-1-i}$ subsequences.

\`\`\`cpp
// Sum of widths (max - min) over all subsequences (LC 891), mod 1e9+7
int sumSubseqWidths(vector<int>& a) {
  const long long MOD = 1e9 + 7;
  sort(a.begin(), a.end());
  int n = a.size();
  vector<long long> pw(n);
  pw[0] = 1;
  for (int i = 1; i < n; i++) pw[i] = pw[i - 1] * 2 % MOD;
  long long total = 0;
  for (int i = 0; i < n; i++) {
    // a[i] is the max of 2^i subseqs and the min of 2^(n-1-i)
    total = (total + (pw[i] - pw[n - 1 - i]) * a[i]) % MOD;
  }
  return (int)((total % MOD + MOD) % MOD);
}
\`\`\`
:::

So each $a_i$ carries a net coefficient of $2^i - 2^{n-1-i}$. The same $2^k$ weighting solves Power of Heroes (LC 2681), where each value is the max of some subsequences and the min of others, contributing $\\max \\cdot \\min^2$.`,
    },
    {
      id: "tree",
      title: "Pattern 6: Tree edge / path contribution",
      body: `For sums of **path lengths over all pairs of nodes**, attribute the total to **edges**. Removing an edge splits the tree into a part of size $s$ and a part of size $n - s$; every one of the $s(n - s)$ cross pairs uses that edge exactly once.

\`\`\`cpp
// Sum of distances over all node pairs: each edge contributes sz*(n-sz)
long long sumAllPairDistances(int n, vector<vector<int>>& g) {
  long long total = 0;
  vector<int> sz(n, 1);
  function<void(int, int)> dfs = [&](int u, int parent) {
    for (int v : g[u]) {
      if (v == parent) continue;
      dfs(v, u);
      sz[u] += sz[v];
      total += 1LL * sz[v] * (n - sz[v]);  // edge (u,v) splits here
    }
  };
  dfs(0, -1);
  return total;
}
\`\`\`

Weight the term by the edge cost for weighted trees; Minimum Fuel Cost to Report to the Capital (LC 2477) sums $\\lceil s / \\text{seats} \\rceil$ per edge. Note that Sum of Distances in Tree (LC 834) — distances from *every* node — instead needs [rerooting](/handbook/trees), a close cousin of edge contribution.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Time | Space |
| --- | --- | --- |
| Positional subarray count | \`O(n)\` | \`O(1)\` |
| Min/max domination | \`O(n)\` | \`O(n)\` |
| Per-bit contribution | \`O(n log V)\` | \`O(1)\` |
| Pairwise after sorting | \`O(n log n)\` | \`O(1)\` |
| Subsequence powers of two | \`O(n log n)\` | \`O(n)\` |
| Tree edge / path | \`O(n)\` | \`O(n)\` |

The win is always the same: an $O(n^2)$ or $O(2^n)$ enumeration becomes near-linear once each part's count is a formula.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Pattern |
| --- | --- | --- |
| 477 | [Total Hamming Distance](https://leetcode.cn/problems/total-hamming-distance) | per-bit |
| 891 | [Sum of Subsequence Widths](https://leetcode.cn/problems/sum-of-subsequence-widths) | subsequence powers of two |
| 907 | [Sum of Subarray Minimums](https://leetcode.cn/problems/sum-of-subarray-minimums) | min domination |
| 1588 | [Sum of All Odd Length Subarrays](https://leetcode.cn/problems/sum-of-all-odd-length-subarrays) | positional count |
| 1685 | [Sum of Absolute Differences](https://leetcode.cn/problems/sum-of-absolute-differences-in-a-sorted-array) | pairwise |
| 1769 | [Move All Balls to Each Box](https://leetcode.cn/problems/minimum-number-of-operations-to-move-all-balls-to-each-box) | prefix contribution |
| 1863 | [Sum of All Subset XOR Totals](https://leetcode.cn/problems/sum-of-all-subset-xor-totals) | per-bit |
| 2104 | [Sum of Subarray Ranges](https://leetcode.cn/problems/sum-of-subarray-ranges) | min + max domination |

**Advanced practice problems**

| ID | Problem | Pattern |
| --- | --- | --- |
| 834 | [Sum of Distances in Tree](https://leetcode.cn/problems/sum-of-distances-in-tree) | rerooting / edge contribution |
| 1856 | [Maximum Subarray Min-Product](https://leetcode.cn/problems/maximum-subarray-min-product) | min span + prefix sums |
| 2281 | [Sum of Total Strength of Wizards](https://leetcode.cn/problems/sum-of-total-strength-of-wizards) | min domination + double prefix |
| 2477 | [Minimum Fuel Cost to Report to the Capital](https://leetcode.cn/problems/minimum-fuel-cost-to-report-to-the-capital) | tree edge contribution |
| 2588 | [Count the Number of Beautiful Subarrays](https://leetcode.cn/problems/count-the-number-of-beautiful-subarrays) | per-bit prefix XOR |
| 2615 | [Sum of Distances](https://leetcode.cn/problems/sum-of-distances) | pairwise by value |
| 2681 | [Power of Heroes](https://leetcode.cn/problems/power-of-heroes) | subsequence powers of two |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Overflow**: products like $(i+1)(n-i)$ and $s(n-s)$ overflow 32-bit — cast to \`long long\` (or apply the modulus) before multiplying.
- **Tie handling in domination**: use one strict and one non-strict comparison so equal values land in exactly one element's span; otherwise pairs are double-counted or dropped.
- **Ordered vs unordered pairs**: decide whether (i, j) and (j, i) both count; the pairwise formulas above count each unordered pair once.
- **Modular subtraction**: when contributions can be negative (e.g. \`pw[i] - pw[n-1-i]\`), add \`MOD\` before the final \`% MOD\`.
- **Pick the right atom**: subarrays → index spans; subsets → powers of two; pairs → sorted rank; trees → edges. Choosing the wrong atom makes the count have no closed form.`,
    },
  ],
};
