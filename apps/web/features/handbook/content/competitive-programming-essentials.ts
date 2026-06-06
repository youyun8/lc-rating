import type { HandbookTopic } from "../model";

export const competitiveProgrammingEssentials: HandbookTopic = {
  slug: "competitive-programming-essentials",
  title: "Competitive Programming Essentials",
  tagline:
    "Constraint reading, contest templates, debugging, stress tests, and proof patterns that make every topic usable under time pressure.",
  icon: "Gauge",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Competitive programming is not only knowing algorithms. You must read constraints, choose a viable complexity, implement quickly, prove the idea, and catch bugs before submission.

The practical loop:

1. Translate constraints into a time budget.
2. Pick the simplest algorithm that fits.
3. Code from a reliable template.
4. Test edge cases and, when possible, stress against brute force.
5. State the invariant, exchange argument, or DP transition that makes the solution correct.

\`\`\`cpp
// Tiny complexity budget helper for planning, not for submission.
bool likelyFits(long long operations, double seconds = 2.0) {
  // A conservative C++ contest estimate is around 5e7 simple ops / second.
  return operations <= (long long)(5e7 * seconds);
}

// Example: n = 2e5 -> O(n log n) is fine, O(n^2) is not.
long long n = 200000;
cout << likelyFits((long long)n * 20) << "\\n";      // O(n log n)
cout << likelyFits((long long)n * n) << "\\n";       // O(n^2)
\`\`\``,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort with arrays, vectors, maps, sets, and heaps, plus big-O analysis.
- One language you can type quickly and correctly under pressure (this handbook uses C++).
- Willingness to test before submitting rather than guessing.

This chapter is the entry point to the handbook. From here, branch into [Binary Search](/handbook/binary-search), [Greedy](/handbook/greedy), [Backtracking & Recursion](/handbook/backtracking), [Dynamic Programming](/handbook/dynamic-programming), and [Data Structures](/handbook/data-structures); the templates and proof patterns below apply to every later topic.`,
    },
    {
      id: "constraints",
      title: "Complexity from constraints",
      body: `Use the maximum input size to reject impossible approaches before coding.

| Constraint shape | Usually viable |
| --- | --- |
| $n \\le 20$ | subsets, bitmask DP, meet in the middle |
| $n \\le 400$ | \`O(n^3)\` DP / Floyd-Warshall |
| $n \\le 5000$ | \`O(n^2)\` |
| $n \\le 2 \\times 10^5$ | \`O(n log n)\` or \`O(n)\` |
| $q \\le 2 \\times 10^5$ | preprocessing, Fenwick, segment tree, offline queries |
| values up to $10^9$ | coordinate compression, hashing, math |

\`\`\`cpp
// Pick a technique from constraints. This is a thinking checklist encoded as
// comments so the habit is repeatable during a contest.
void chooseApproach(int n, int q, int maxValue) {
  if (n <= 20) {
    // Try bitmask DP or enumerate all subsets.
  } else if (n <= 500) {
    // O(n^3) may pass: interval DP, Floyd-Warshall, transitive closure.
  } else if (n <= 5000) {
    // O(n^2) may pass: pair DP, LIS variants, dense transitions.
  } else {
    // Need O(n log n) or O(n): sorting, heap, Fenwick, segment tree, greedy.
  }

  if (q > 0 && (long long)n * q > 50000000LL) {
    // Per-query scanning is too slow. Precompute or process offline.
  }
  if (maxValue > n * 4) {
    // Large sparse values usually need compression or hashing.
  }
}
\`\`\``,
    },
    {
      id: "template",
      title: "C++ contest template",
      body: `A contest template should be boring: fast I/O, type aliases, safe constants, helpers, and no problem-specific clutter.

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using pii = pair<int, int>;
using pll = pair<long long, long long>;

const ll INF64 = (1LL << 62);
const int INF = 1e9;
const int MOD = 1e9 + 7;

template <class T>
bool chmin(T& a, const T& b) {
  if (b < a) {
    a = b;
    return true;
  }
  return false;
}

template <class T>
bool chmax(T& a, const T& b) {
  if (a < b) {
    a = b;
    return true;
  }
  return false;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int tc = 1;
  // cin >> tc;  // uncomment for multi-testcase problems
  while (tc--) {
    // solve();
  }
  return 0;
}
\`\`\``,
    },
    {
      id: "safe-arithmetic",
      title: "Safe arithmetic and modulo policy",
      body: `Most wrong answers in math, DP, and graph problems come from overflow or negative modulo. Cast before multiplication and normalize after subtraction.

\`\`\`cpp
long long normMod(long long x, long long mod) {
  x %= mod;
  if (x < 0) {
    x += mod;
  }
  return x;
}

long long addMod(long long a, long long b, long long mod) {
  return normMod(normMod(a, mod) + normMod(b, mod), mod);
}

long long mulMod(long long a, long long b, long long mod) {
  return (__int128)normMod(a, mod) * normMod(b, mod) % mod;
}

long long safeMid(long long l, long long r) {
  return l + (r - l) / 2;
}

long long safeLcm(long long a, long long b) {
  return a / std::gcd(a, b) * b;  // divide first
}
\`\`\``,
    },
    {
      id: "debug",
      title: "Debug macros and local logging",
      body: `A debug macro should disappear on the judge but print useful state locally.

\`\`\`cpp
// Debug printing helpers: overloaded dbgPrint for scalars, pairs, and vectors.
template <class T>
void dbgPrint(const T& x) {
  cerr << x;
}

template <class A, class B>
void dbgPrint(const pair<A, B>& p) {
  cerr << "(";
  dbgPrint(p.first);
  cerr << ", ";
  dbgPrint(p.second);
  cerr << ")";
}

template <class T>
void dbgPrint(const vector<T>& v) {
  cerr << "[";
  for (int i = 0; i < (int)v.size(); i++) {
    if (i) {
      cerr << ", ";  // separator between elements
    }
    dbgPrint(v[i]);
  }
  cerr << "]";
}

// dbg(x) prints "x = <value>" to stderr in LOCAL builds; becomes a no-op in judge submissions.
#ifdef LOCAL
#define dbg(x)                         \\
  do {                                 \\
    cerr << #x << " = ";               \\
    dbgPrint(x);                       \\
    cerr << "\\n";                     \\
  } while (0)
#else
#define dbg(x) ((void)0)
#endif
\`\`\``,
    },
    {
      id: "edge-cases",
      title: "Edge-case checklist as code",
      body: `Before submitting, run cases that attack boundaries: empty or one item, duplicates, sorted, reverse sorted, all equal, negative values, maximum values, disconnected graph, and impossible states.

\`\`\`cpp
// Example harness for an array problem. Replace solveVec with your function.
int solveVec(vector<int> a) {
  return (int)a.size();
}

void runEdgeCases() {
  vector<vector<int>> tests = {
      {},
      {1},
      {1, 1, 1},
      {1, 2, 3, 4},
      {4, 3, 2, 1},
      {-5, 0, 5},
      {INT_MAX, INT_MAX},
  };

  for (auto t : tests) {
    dbg(t);
    cout << solveVec(t) << "\\n";
  }
}
\`\`\``,
    },
    {
      id: "stress",
      title: "Stress testing against brute force",
      body: `When the idea is subtle, write a slow correct solution for tiny random tests and compare it with the optimized one. This catches off-by-one errors faster than manual inspection.

\`\`\`cpp
// Stress test harness for Maximum Subarray (Kadane's algorithm, LC 53).
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());

// O(n^2) brute force: try every subarray; used as the reference answer.
int brute(vector<int> a) {
  int best = 0;
  for (int l = 0; l < (int)a.size(); l++) {
    int sum = 0;
    for (int r = l; r < (int)a.size(); r++) {
      sum += a[r];
      best = max(best, sum);
    }
  }
  return best;
}

// Kadane's O(n): cur holds the max subarray sum ending at the current element.
int fast(vector<int> a) {
  int best = 0, cur = 0;
  for (int x : a) {
    cur = max(0, cur + x);  // reset to 0 if extending would go negative
    best = max(best, cur);
  }
  return best;
}

// Run 10000 random small cases and compare brute vs fast; print divergence and exit.
void stress() {
  for (int it = 0; it < 10000; it++) {
    int n = uniform_int_distribution<int>(1, 10)(rng);
    vector<int> a(n);
    for (int& x : a) {
      x = uniform_int_distribution<int>(-10, 10)(rng);
    }
    int b = brute(a), f = fast(a);
    if (b != f) {
      dbg(a);
      cerr << "brute=" << b << " fast=" << f << "\\n";
      exit(0);
    }
  }
}
\`\`\``,
    },
    {
      id: "proof-patterns",
      title: "Proof patterns with implementation anchors",
      body: `A proof is easiest when it matches a code invariant.

**Binary search invariant:** keep \`lo\` false and \`hi\` true, then shrink until they are adjacent.

\`\`\`cpp
// First x in [0, n] with check(x) == true. Requires monotonic check.
int firstTrue(int n, function<bool(int)> check) {
  int lo = -1, hi = n;
  while (hi - lo > 1) {
    int mid = lo + (hi - lo) / 2;
    if (check(mid)) {
      hi = mid;  // invariant: hi is true
    } else {
      lo = mid;  // invariant: lo is false
    }
  }
  return hi;
}
\`\`\`

**Exchange argument:** show that replacing a chosen item with the greedy item never hurts.

\`\`\`cpp
// Interval scheduling: choosing the earliest finishing compatible interval is
// safe by exchange.
int maxNonOverlapping(vector<pair<int, int>> intervals) {
  sort(intervals.begin(), intervals.end(),
       [](auto a, auto b) { return a.second < b.second; });
  int ans = 0, lastEnd = INT_MIN;
  for (auto [l, r] : intervals) {
    if (l >= lastEnd) {
      ans++;
      lastEnd = r;
    }
  }
  return ans;
}
\`\`\`

**DP induction:** define exactly what \`dp[i]\` means, prove the base case, then prove each transition only uses already-proved states.

\`\`\`cpp
// dp[i] = minimum cost to reach step i.
int minCostClimbingStairs(vector<int>& cost) {
  int n = cost.size();
  vector<int> dp(n + 1, 0);
  for (int i = 2; i <= n; i++) {
    dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
  }
  return dp[n];
}
\`\`\``,
    },
    {
      id: "hash-policy",
      title: "Hash-map safety for adversarial tests",
      body: `Some judges include adversarial keys that make \`unordered_map\` slow. A splitmix64 custom hash keeps expected performance stable.

\`\`\`cpp
// CustomHash: wraps splitmix64 to give unordered_map a collision-resistant hash,
// defending against anti-hash tests that exploit the default identity hash.
struct CustomHash {
  // splitmix64 bijection: avalanches all input bits across the 64-bit output.
  static uint64_t splitmix64(uint64_t x) {
    x += 0x9e3779b97f4a7c15;
    x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
    x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
    return x ^ (x >> 31);
  }

  size_t operator()(uint64_t x) const {
    // A runtime-random seed ensures the hash differs between runs,
    // preventing adversarial inputs crafted offline.
    static const uint64_t seed =
        chrono::steady_clock::now().time_since_epoch().count();
    return splitmix64(x + seed);
  }
};

unordered_map<long long, int, CustomHash> safeCount;
\`\`\``,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `Memorize these baseline costs so you can size an approach in seconds and pair them with the constraint table above.

| Operation | Complexity |
| --- | --- |
| Sort \`n\` items | \`O(n log n)\` |
| Heap push / pop | \`O(log n)\` |
| Balanced BST / ordered-set op | \`O(log n)\` |
| Hash map op (expected) | \`O(1)\` |
| DSU find / union | \`O(α(n))\` |
| Fenwick / segment-tree op | \`O(log n)\` |
| BFS / DFS | \`O(V + E)\` |
| Dijkstra (binary heap) | \`O((V + E) log V)\` |
| Subset enumeration | \`O(2^n)\` |
| Permutation enumeration | \`O(n!)\` |`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Most interview problems are one of a handful of named patterns; recognizing the signal lets you reach for the right template from this chapter instantly.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Two pointers | sorted array, pair/triple sum, in-place partition | converge \`l\`/\`r\` or fast/slow scan in \`O(n)\` | [Two Sum II](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted) |
| Sliding window | longest/shortest contiguous range under a constraint | grow right, shrink left while invalid | [Longest Substring Without Repeating](https://leetcode.cn/problems/longest-substring-without-repeating-characters) |
| Binary search on answer | "minimize the max / maximize the min" with a monotone check | search the value, verify with a greedy \`check\` | [Koko Eating Bananas](https://leetcode.cn/problems/koko-eating-bananas) |
| Hashing for \`O(1)\` lookup | "have I seen this?" / complement / dedup | one pass with a hash map or set | [Two Sum](https://leetcode.cn/problems/two-sum) |
| Top-K with a heap | "k largest/smallest/closest" | size-\`k\` heap, push and pop in \`O(log k)\` | [Kth Largest Element](https://leetcode.cn/problems/kth-largest-element-in-an-array) |
| BFS/DFS on graph or grid | connectivity, shortest unweighted path, flood fill | queue (BFS) or recursion/stack (DFS) over \`O(V+E)\` | [Number of Islands](https://leetcode.cn/problems/number-of-islands) |
| Dynamic programming | overlapping subproblems, "count ways" / "min cost" | define \`dp[i]\`, prove the transition | [Coin Change](https://leetcode.cn/problems/coin-change) |
| Greedy + exchange argument | local best is provably globally safe | sort, then take the locally optimal item | [Jump Game](https://leetcode.cn/problems/jump-game) |

- The hardest call is **greedy vs DP**: only use greedy when an exchange argument proves the local choice never hurts; otherwise fall back to DP.
- **Binary search on answer** is the pattern most often missed — whenever feasibility is monotone in the answer, prefer it over hand-rolled greedy search.`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- Use \`long long\` for sums, products, distances, and counts.
- For binary search, write the invariant before the loop.
- For graph search, decide when a node is marked visited before coding.
- For DP, initialize impossible states to a real \`INF\`, not \`INT_MAX\` if you will add to it.
- For comparators, never use subtraction because it can overflow.

\`\`\`cpp
// Comparator rule: return true only when a should come before b.
sort(a.begin(), a.end(), [](const auto& x, const auto& y) {
  if (x.first != y.first) {
    return x.first < y.first;
  }
  return x.second > y.second;
});
\`\`\``,
    },
  ],
};
