import type { HandbookTopic } from "../model";

export const binarySearch: HandbookTopic = {
  slug: "binary-search",
  title: "Binary Search",
  tagline:
    "Halve the search space every step — on sorted arrays, on the answer, and on monotone predicates.",
  icon: "Crosshair",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Binary search turns an \`O(n)\` scan into an \`O(log n)\` probe by repeatedly discarding half of the remaining candidates. It applies whenever the search space is **monotone**: there is a point before which a predicate is false and after which it is true.

Reach for binary search when you see any of these signals:

- The array is **sorted** (or can be sorted) and you need a position or a value.
- You must find the **first/last** index satisfying a condition.
- The problem asks to **minimize a maximum** or **maximize a minimum** ("the smallest capacity such that…", "the largest \`k\` such that…").
- The answer lies in a numeric range and you can **check feasibility** of a candidate answer in \`O(n)\` — this is *binary search on the answer*.
- You need the **Kth smallest** value and counting "how many ≤ x" is cheap.

The mental model: define a boolean \`check(x)\` that is **monotone** (false…false, true…true). Binary search finds the boundary between the two regions.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort with array indexing and half-open vs. closed intervals.
- The idea of a **loop invariant**: a property that holds before and after every iteration.
- Basic complexity: why halving gives \`O(log n)\`.

Related handbook topics: [Sliding Window](/handbook/sliding-window) (the other "monotone shrink" pattern) and [Greedy](/handbook/greedy) (often supplies the \`check\` function for binary-search-on-answer).`,
    },
    {
      id: "invariants",
      title: "Core idea: the loop invariant",
      body: `Every correct binary search maintains the invariant: *if the answer exists, it is still inside the current interval.* You only ever discard the half that provably cannot contain the answer, so the invariant survives each step and the interval strictly shrinks — guaranteeing termination.

Two interval conventions; pick one and never mix them:

| Convention | Init | Loop test | Move left | Move right |
| --- | --- | --- | --- | --- |
| Closed \`[l, r]\` | \`l = 0, r = n - 1\` | \`l <= r\` | \`r = mid - 1\` | \`l = mid + 1\` |
| Half-open \`[l, r)\` | \`l=0, r=n\` | \`l < r\` | \`r = mid\` | \`l = mid + 1\` |

Always compute the midpoint as \`mid = l + (r - l) / 2\` to avoid \`int\` overflow.`,
    },
    {
      id: "templates",
      title: "C++ templates",
      body: `The single most useful template is **"find the first index where \`check\` is true"**. Almost every variant reduces to it.

\`\`\`cpp
// Find first index in [0, n] where check(i) is true (half-open, the workhorse)
int lower_bound_pred(int n, auto&& check) {
  int l = 0, r = n;  // search the boundary in [l, r]
  while (l < r) {
    int mid = l + (r - l) / 2;
    if (check(mid)) {  // mid works -> answer is mid or to the left
      r = mid;
    } else {  // mid fails -> answer is strictly right
      l = mid + 1;
    }
  }
  return l;  // l == r == first true (or n if none)
}
\`\`\`

Classic value search and the STL-equivalent bounds:

\`\`\`cpp
// Plain binary search: index of target in sorted a, else -1
int binary_search_value(const vector<int>& a, int target) {
  int l = 0, r = (int)a.size() - 1;  // closed interval [l, r]
  while (l <= r) {
    int mid = l + (r - l) / 2;
    if (a[mid] == target) {
      return mid;
    } else if (a[mid] < target) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }
  return -1;
}
\`\`\`

\`\`\`cpp
// Hand-rolled lower_bound / upper_bound (first >= / first > target)
int lower_bound_idx(const vector<int>& a, int target) {
  int l = 0, r = (int)a.size();
  while (l < r) {
    int mid = l + (r - l) / 2;
    if (a[mid] >= target) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }
  return l;  // count of elements < target
}
int upper_bound_idx(const vector<int>& a, int target) {
  int l = 0, r = (int)a.size();
  while (l < r) {
    int mid = l + (r - l) / 2;
    if (a[mid] > target) {
      r = mid;
    } else {
      l = mid + 1;
    }
  }
  return l;  // count of elements <= target
}
\`\`\`

Prefer the STL when you can — it is correct and concise:

\`\`\`cpp
// STL bounds on a sorted vector
auto lo = lower_bound(a.begin(), a.end(), x);  // first element >= x
auto hi = upper_bound(a.begin(), a.end(), x);  // first element  > x
int count_equal = hi - lo;                     // occurrences of x
int idx_first_ge = lo - a.begin();
\`\`\``,
    },
    {
      id: "answer",
      title: "Technique: binary search on the answer",
      body: `When the answer is a number in \`[lo, hi]\` and *feasibility is monotone*, search the answer directly. You only need a \`check(x)\` that returns whether \`x\` is achievable.

**Minimize-the-maximum** ("smallest \`x\` that is feasible"):

\`\`\`cpp
// Smallest feasible x in [lo, hi]; check is monotone false...false,true...true
long long min_feasible(long long lo, long long hi, auto&& check) {
  while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (check(mid)) {  // feasible -> try smaller
      hi = mid;
    } else {  // infeasible -> need larger
      lo = mid + 1;
    }
  }
  return lo;
}
\`\`\`

**Maximize-the-minimum** ("largest \`x\` that is feasible"):

\`\`\`cpp
// Largest feasible x in [lo, hi]; check is monotone true...true,false...false
long long max_feasible(long long lo, long long hi, auto&& check) {
  while (lo < hi) {
    long long mid = lo + (hi - lo + 1) / 2;  // bias up to avoid infinite loop
    if (check(mid)) {                        // feasible -> try larger
      lo = mid;
    } else {  // infeasible -> need smaller
      hi = mid - 1;
    }
  }
  return lo;
}
\`\`\`

:::example Capacity to Ship Packages Within D Days (LC 1011)
Example \`check\` for LeetCode 1011 (ship packages within D days at capacity \`cap\`):

\`\`\`cpp
// Feasible if we can ship all weights within 'days' using capacity cap
auto check = [&](int cap) {
  int days = 1, load = 0;
  for (int w : weights) {
    if (w > cap) {  // a single item exceeds capacity
      return false;
    }
    if (load + w > cap) {
      days++;
      load = 0;
    }
    load += w;
  }
  return days <= D;
};
// lo = max(weights), hi = sum(weights); answer = min_feasible(lo, hi, check)
\`\`\`
:::`,
    },
    {
      id: "variants",
      title: "Techniques & LeetCode variants",
      body: `**1. First/last occurrence.** \`lower_bound\` gives the first \`>= x\`; \`upper_bound - 1\` gives the last \`== x\`. (LC 34 Find First and Last Position.)

**2. Insertion point.** \`lower_bound\` index is where \`x\` would be inserted. (LC 35 Search Insert Position.)

:::example Search in Rotated Sorted Array (LC 33)
**3. Rotated sorted array.** One half is always sorted — decide which, then test whether the target lies in it.

\`\`\`cpp
// Search target in a rotated sorted array with distinct values (LC 33)
int search(vector<int>& a, int target) {
  int l = 0, r = (int)a.size() - 1;
  while (l <= r) {
    int mid = l + (r - l) / 2;
    if (a[mid] == target) {
      return mid;
    }
    if (a[l] <= a[mid]) {  // left half sorted
      if (a[l] <= target && target < a[mid]) {
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    } else {  // right half sorted
      if (a[mid] < target && target <= a[r]) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
  }
  return -1;
}
\`\`\`
:::

**4. Find a peak / find the minimum of a rotated array.** Compare \`a[mid]\` to a neighbour or to \`a[r]\` to decide direction (LC 162, LC 153).

**5. Kth-smallest via "count ≤ x".** If you can count how many elements are $\\le x$ in \`O(f(n))\`, binary search the value. Works for a sorted matrix (LC 378), the multiplication table (LC 668), and Kth-smallest distance pair (LC 719).

\`\`\`cpp
// Count entries <= x in an n*n row/col-sorted matrix, staircase from
// bottom-left
int countLE(const vector<vector<int>>& m, int x) {
  int n = m.size(), r = n - 1, c = 0, cnt = 0;
  while (r >= 0 && c < n) {
    if (m[r][c] <= x) {  // whole column up to r qualifies
      cnt += r + 1;
      c++;
    } else {
      r--;
    }
  }
  return cnt;
}
\`\`\`

**6. Real-valued (floating) binary search.** Iterate a fixed number of times instead of comparing floats:

\`\`\`cpp
// ~100 iterations halves the interval to < 2^-100 — plenty of precision
double lo = 0, hi = 1e9;
for (int it = 0; it < 100; it++) {
  double mid = (lo + hi) / 2;
  if (check(mid)) {
    hi = mid;
  } else {
    lo = mid;
  }
}
// answer ~ lo (or hi)
\`\`\`

**7. Binary search the index by predicate.** Split-array-largest-sum (LC 410), Koko eating bananas (LC 875), and minimum-time problems are all \`min_feasible\` with a greedy \`check\`.`,
    },
    {
      id: "advanced",
      title: "Advanced techniques (hard problems)",
      body: `:::example Median of Two Sorted Arrays (LC 4)
**Partition by binary search — median of two sorted arrays (LC 4).** Instead of merging, binary search the cut in the shorter array so the left halves of both arrays form the lower half of the merged array.

\`\`\`cpp
// Median of two sorted arrays in O(log(min(m, n))) (LC 4)
double findMedianSortedArrays(vector<int>& a, vector<int>& b) {
  if (a.size() > b.size()) {
    swap(a, b);
  }
  int m = a.size(), n = b.size(), half = (m + n + 1) / 2;
  int lo = 0, hi = m;
  while (lo <= hi) {
    int i = (lo + hi) / 2, j = half - i;  // i from a, j from b
    int aL = i ? a[i - 1] : INT_MIN, aR = i < m ? a[i] : INT_MAX;
    int bL = j ? b[j - 1] : INT_MIN, bR = j < n ? b[j] : INT_MAX;
    if (aL <= bR && bL <= aR) {
      return ((m + n) & 1) ? max(aL, bL) : (max(aL, bL) + min(aR, bR)) / 2.0;
    } else if (aL > bR) {  // take less from a
      hi = i - 1;
    } else {  // take more from a
      lo = i + 1;
    }
  }
  return 0.0;
}
\`\`\`
:::

:::example Maximum Average Subarray II (LC 644)
**Fractional / parametric binary search — maximize average (LC 644).** Binary search the answer value \`x\`; "average ≥ x" becomes "some window has sum of \`(a[i] - x) ≥ 0\`", checkable with a prefix-min sweep.

\`\`\`cpp
// Maximum average subarray of length >= k (LC 644)
double findMaxAverage(vector<int>& a, int k) {
  double lo = *min_element(a.begin(), a.end()),
         hi = *max_element(a.begin(), a.end());
  auto feasible = [&](double x) {
    double sum = 0, prefix = 0, minPrefix = 0;
    for (int i = 0; i < (int)a.size(); i++) {
      sum += a[i] - x;
      if (i >= k) {
        prefix += a[i - k] - x;
        minPrefix = min(minPrefix, prefix);
      }
      if (i >= k - 1 && sum - minPrefix >= 0) {
        return true;
      }
    }
    return false;
  };
  while (hi - lo > 1e-5) {
    double mid = (lo + hi) / 2;
    if (feasible(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return lo;
}
\`\`\`
:::

**Binary search the answer with a heavy check.** The \`check(x)\` can itself be a greedy or DP — the search just needs it to be monotone. This unlocks many hard problems: split-array / painter problems (LC 410, LC 1highest via DP check), bouquets (LC 1482), magnetic force between balls (LC 1552), maximum candies (LC 2226), and finding a target in a hidden mountain array (LC 1095).

**Kth-smallest via a counting predicate** generalizes with number theory: count "how many values ≤ x" using inclusion–exclusion and \`gcd\`/\`lcm\` for the Nth magical number (LC 878) and ugly number III (LC 1201), or a div-count for the kth smallest in a multiplication table (LC 668).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation | Time | Notes |
| --- | --- | --- |
| Value / bound search | \`O(log n)\` | comparisons only |
| Binary search on answer | \`O(log(hi - lo) * C)\` | \`C\` = cost of one \`check\` |
| Kth-smallest by counting | \`O(log(range) * C)\` | \`C\` = cost to count elements $\\le x$, often \`O(n)\` |
| Floating search | \`O(iterations * C)\` | fixed ~60–100 iterations |

The whole game is making \`check\` cheap and *provably monotone*.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Binary search shows up in interviews as a small set of recognizable shapes — each is just the "find the boundary of a monotone predicate" idea wearing a different costume.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Lower/upper bound | sorted array, "first index \`>= x\`" or count of duplicates | hand-rolled or STL \`lower_bound\` / \`upper_bound\` | [First & Last Position](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array) |
| Binary search on answer | "minimize the max / maximize the min" with a monotone \`check\` | search the value, verify feasibility greedily | [Capacity to Ship Packages](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days) |
| Rotated-array split | sorted array rotated at an unknown pivot | one half is always sorted — test which holds the target | [Search in Rotated Array](https://leetcode.cn/problems/search-in-rotated-sorted-array) |
| Peak / direction by neighbour | no global order, but local slope points to the answer | compare \`a[mid]\` to a neighbour and walk uphill | [Find Peak Element](https://leetcode.cn/problems/find-peak-element) |
| Kth-smallest by counting | "kth value" where counting "how many \`<= x\`" is cheap | binary search the value on the count predicate | [Kth Smallest in Sorted Matrix](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix) |
| Partition by binary search | merge/median of two sorted arrays | search the cut so left halves form the lower half | [Median of Two Sorted Arrays](https://leetcode.cn/problems/median-of-two-sorted-arrays) |
| Floating / parametric search | maximize a ratio or real-valued answer | fixed ~100 iterations on a monotone \`feasible(x)\` | [Maximum Average Subarray II](https://leetcode.cn/problems/maximum-average-subarray-ii) |

- The whole technique hinges on the predicate being **monotone** (false…false, true…true); if \`check\` flips more than once, binary search is invalid.
- For **maximize-the-minimum**, bias the midpoint up with \`mid = l + (r - l + 1) / 2\` so \`l == mid\` cannot loop forever.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 4 | [Median of Two Sorted Arrays](https://leetcode.cn/problems/median-of-two-sorted-arrays) | partition by binary search |
| 33 / 81 | [Search in Rotated Array](https://leetcode.cn/problems/search-in-rotated-sorted-array) | rotated-array split |
| 34 | [First & Last Position](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array) | lower/upper bound |
| 35 | [Search Insert Position](https://leetcode.cn/problems/search-insert-position) | insertion point |
| 153 / 154 | [Find Minimum in Rotated Array](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array) | direction by \`a[r]\` |
| 162 | [Find Peak Element](https://leetcode.cn/problems/find-peak-element) | local monotonicity |
| 378 | [Kth Smallest in Sorted Matrix](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix) | count ≤ x + value search |
| 410 | [Split Array Largest Sum](https://leetcode.cn/problems/split-array-largest-sum) | min-feasible + greedy check |
| 704 | [Binary Search](https://leetcode.cn/problems/binary-search) | plain value search |
| 719 | [Kth Smallest Distance Pair](https://leetcode.cn/problems/find-k-th-smallest-pair-distance) | count ≤ x + two pointers |
| 875 | [Koko Eating Bananas](https://leetcode.cn/problems/koko-eating-bananas) | min-feasible on answer |
| 1011 | [Capacity to Ship Packages](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days) | min-feasible on answer |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 2226 | [Maximum Candies Allocated to K Children](https://leetcode.cn/problems/maximum-candies-allocated-to-k-children) | BS on the answer |
| 2560 | [House Robber IV](https://leetcode.cn/problems/house-robber-iv) | BS on answer + greedy check |
| 2616 | [Minimize the Maximum Difference of Pairs](https://leetcode.cn/problems/minimize-the-maximum-difference-of-pairs) | BS on answer + greedy |
| 2861 | [Maximum Number of Alloys](https://leetcode.cn/problems/maximum-number-of-alloys) | BS on answer |
| 3296 | [Minimum Number of Seconds to Make Mountain Height Zero](https://leetcode.cn/problems/minimum-number-of-seconds-to-make-mountain-height-zero) | BS on answer |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3771 | [Total Score of Dungeon Runs](https://leetcode.cn/problems/total-score-of-dungeon-runs) | 1981 | BS on the answer |
| 3733 | [Minimum Time to Complete All Deliveries](https://leetcode.cn/problems/minimum-time-to-complete-all-deliveries) | 1973 | BS on the answer |
| 3356 | [Zero Array Transformation II](https://leetcode.cn/problems/zero-array-transformation-ii) | 1913 | BS + difference array |
| 3608 | [Minimum Time for K Connected Components](https://leetcode.cn/problems/minimum-time-for-k-connected-components) | 1893 | BS + DSU |
| 3639 | [Minimum Time to Activate String](https://leetcode.cn/problems/minimum-time-to-activate-string) | 1853 | BS on the answer |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Overflow**: always \`mid = l + (r - l) / 2\`, and use \`long long\` for \`hi\` when summing.
- **Infinite loop in maximize**: use \`mid = l + (r - l + 1) / 2\` (round up) when \`l\` can equal \`mid\`.
- **Off-by-one**: decide your interval convention up front; closed uses \`l <= r\` and \`mid ± 1\`, half-open uses \`l < r\` and \`r = mid\`.
- **Non-monotone check**: binary search is only valid if \`check\` flips exactly once. If it doesn't, you need a different approach.
- **Prefer STL** \`lower_bound\`/\`upper_bound\` for sorted containers to avoid hand-rolled bugs.
- **Answer bounds**: set \`lo\`/\`hi\` to provably valid extremes (e.g. \`lo = max(weights)\`, \`hi = sum(weights)\`).`,
    },
  ],
};
