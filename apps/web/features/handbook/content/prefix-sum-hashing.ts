import type { HandbookTopic } from "../model";

export const prefixSumHashing: HandbookTopic = {
  slug: "prefix-sum-hashing",
  title: "Prefix Sum & Hashing",
  tagline:
    "Precompute running aggregates and remember what you have seen — the duo behind range queries, subarray counting, and O(1) lookups.",
  icon: "Hash",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A **prefix sum** turns "sum of a range" into a single subtraction: precompute $P[i] = a_0 + a_1 + \\dots + a_{i-1}$ once, and any range sum is $P[r+1] - P[l]$ in $O(1)$. A **hash map** turns "have I seen this before?" into an $O(1)$ lookup. Used together they are the workhorse for *subarray counting*: a subarray $(l, r)$ has a target property exactly when two prefix values are related, so as you scan you count how many earlier prefixes pair with the current one.

The recurring move is: **walk left to right, maintain a running prefix, and ask a hash map how many earlier prefixes complete the current one.** That collapses an $O(n^2)$ scan over all subarrays into a single $O(n)$ pass.

Signals:

- "**sum of a subarray / range**", repeated range-sum queries on an immutable array → prefix sum
- "**count subarrays** with sum \`k\`, divisible by \`k\`, with a given XOR, or equal #0/#1" → prefix + hash map
- "**range update**" (add a value to every index in $[l, r]$), then read the final array → difference array
- "**seen before?**", "first/last index of", two-sum-style complement lookup → hash map counting
- the array has **negative numbers**, so sliding window does not apply, but a prefix relation still holds`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort with half-open ranges and the off-by-one in \`P[r+1] - P[l]\`.
- A hash map / hash set (\`unordered_map\`, \`unordered_set\`) and the idea of storing counts or first-seen indices.
- Modular arithmetic for the remainder variant; XOR basics for the XOR-prefix variant (see [Bit Manipulation](/handbook/bit-manipulation)).

Related: [Sliding Window](/handbook/sliding-window) (the positive-only cousin of subarray counting), [Two Pointers](/handbook/two-pointers), [Contribution Method](/handbook/contribution).`,
    },
    {
      id: "range-sum",
      title: "1D prefix sum: range queries",
      body: `:::example Range Sum Query — Immutable (LC 303)
Build \`P\` once so each query is a single subtraction. Use a length-$(n+1)$ array with $P[0] = 0$ so that the sum of $[l, r]$ is uniformly $P[r+1] - P[l]$ with no special case at the left edge.

\`\`\`cpp
// Immutable range sum via a 1-indexed prefix array (LC 303)
class NumArray {
  vector<long long> P;  // P[i] = sum of the first i elements
public:
  NumArray(vector<int>& a) {
    P.assign(a.size() + 1, 0);
    for (int i = 0; i < (int)a.size(); i++) P[i + 1] = P[i] + a[i];
  }
  int sumRange(int l, int r) { return (int)(P[r + 1] - P[l]); }  // O(1)
};
\`\`\`
:::

Construction is \`O(n)\` and every subsequent query is \`O(1)\`, which pays off as soon as you make more than a handful of queries. The \`long long\` accumulator guards against overflow even though the per-query result fits in \`int\`.`,
    },
    {
      id: "subarray-sum-k",
      title: "Prefix + hash map: counting subarrays",
      body: `:::example Subarray Sum Equals K (LC 560)
A subarray $(l, r)$ sums to \`k\` exactly when $P[r+1] - P[l] = k$, i.e. some earlier prefix equals $P[r+1] - k$. So sweep once, and for each prefix look up how many earlier prefixes had value \`prefix - k\`. Seed the map with \`{0: 1}\` to account for subarrays starting at index 0.

\`\`\`cpp
// Count subarrays summing to k via prefix-count hashmap (LC 560)
int subarraySum(vector<int>& a, int k) {
  unordered_map<long long, int> cnt;
  cnt[0] = 1;          // empty prefix: enables subarrays from index 0
  long long prefix = 0;
  int answer = 0;
  for (int x : a) {
    prefix += x;
    answer += cnt[prefix - k];  // earlier prefixes that complete a sum of k
    cnt[prefix]++;
  }
  return answer;
}
\`\`\`
:::

This works even with **negative numbers**, where a sliding window would fail, because the prefix relation does not depend on monotonicity. The same template counts Binary Subarrays With Sum (LC 930) and Maximum Size Subarray Sum Equals k (LC 325) — the latter stores the *first-seen index* per prefix instead of a count, to maximize \`r - l\`.`,
    },
    {
      id: "remainder-xor",
      title: "Prefix remainder & prefix XOR",
      body: `Swap the aggregate and the relation generalizes. Two subarrays-with-property tests share one shape: **group prefixes by an invariant; a matching pair bounds a valid subarray.**

:::example Subarray Sums Divisible by K (LC 974)
A subarray sum is divisible by \`k\` iff the two enclosing prefixes have the **same remainder** mod \`k\`. Count prefixes per remainder bucket; each pair within a bucket yields one valid subarray. Normalize the remainder into $[0, k)$ because C++ \`%\` can return a negative value.

\`\`\`cpp
// Count subarrays with sum divisible by k, grouping prefixes by remainder (LC 974)
int subarraysDivByK(vector<int>& a, int k) {
  vector<int> cnt(k, 0);
  cnt[0] = 1;
  int prefix = 0, answer = 0;
  for (int x : a) {
    prefix = ((prefix + x) % k + k) % k;  // non-negative remainder
    answer += cnt[prefix];                // pair with every earlier same-remainder prefix
    cnt[prefix]++;
  }
  return answer;
}
\`\`\`
:::

Continuous Subarray Sum (LC 523) uses the same remainder idea but asks for the *existence* of a length-$\\ge 2$ subarray, so it stores the **first index** per remainder and checks the gap. With XOR as the aggregate, $P[r+1] \\oplus P[l]$ is the XOR of $(l, r)$, so an equal-XOR pair (or a pair differing by a target) bounds a subarray:

:::example Count the Number of Beautiful Subarrays (LC 2588)
A subarray can be emptied by the bitwise operation iff its XOR is \`0\`, i.e. the two enclosing prefix XORs are **equal**. Count prefix-XOR values and pair them up exactly as in LC 560.

\`\`\`cpp
// Count subarrays whose XOR is 0 via prefix-XOR counts (LC 2588)
long long beautifulSubarrays(vector<int>& a) {
  unordered_map<int, long long> cnt;
  cnt[0] = 1;
  int prefix = 0;
  long long answer = 0;
  for (int x : a) {
    prefix ^= x;             // running prefix XOR (^ is XOR)
    answer += cnt[prefix];   // equal prefix XOR => subarray XOR is 0
    cnt[prefix]++;
  }
  return answer;
}
\`\`\`
:::

The remap "treat 0 as −1" reuses the count template for balance problems: Contiguous Array (LC 525) replaces every \`0\` with \`-1\`, then a subarray with equal #0/#1 is just a subarray summing to \`0\` — store the first index per prefix to maximize the length.`,
    },
    {
      id: "matrix-2d",
      title: "2D prefix sums",
      body: `:::example Range Sum Query 2D — Immutable (LC 304)
For repeated rectangle-sum queries on a fixed matrix, precompute $P[i][j]$ = sum of the submatrix from $(0, 0)$ to $(i-1, j-1)$. Each query is then four array reads via inclusion–exclusion. Pad with an extra zero row and column to dodge boundary checks.

\`\`\`cpp
// 2D immutable range sum with a padded prefix matrix (LC 304)
class NumMatrix {
  vector<vector<long long>> P;
public:
  NumMatrix(vector<vector<int>>& m) {
    int R = m.size(), C = m[0].size();
    P.assign(R + 1, vector<long long>(C + 1, 0));
    for (int i = 0; i < R; i++)
      for (int j = 0; j < C; j++)
        P[i + 1][j + 1] = P[i][j + 1] + P[i + 1][j] - P[i][j] + m[i][j];
  }
  int sumRegion(int r1, int c1, int r2, int c2) {
    return (int)(P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]);
  }
};
\`\`\`
:::

Construction is \`O(R * C)\` and each query is \`O(1)\`. The \`- P[i][j]\` term in the build (and the symmetric \`+ P[r1][c1]\` in the query) corrects for the corner that the two overlapping strips double-count — the same inclusion–exclusion that powers Matrix Block Sum (LC 1314).`,
    },
    {
      id: "difference-array",
      title: "Difference array: range updates",
      body: `A difference array is the **inverse** of a prefix sum: to add \`v\` to every index in $[l, r]$, do \`diff[l] += v\` and \`diff[r+1] -= v\`. After all updates, a prefix sum of \`diff\` reconstructs the final array, so $m$ range updates cost \`O(m + n)\` instead of \`O(m * n)\`.

:::example Corporate Flight Bookings (LC 1109)
Each booking adds \`seats\` to a contiguous range of flights; only the final per-flight totals are needed, so accumulate into a difference array and sweep once.

\`\`\`cpp
// Apply range increments with a difference array, then prefix-sum (LC 1109)
vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
  vector<long long> diff(n + 1, 0);
  for (auto& b : bookings) {
    int l = b[0] - 1, r = b[1] - 1;  // to 0-indexed
    diff[l] += b[2];
    diff[r + 1] -= b[2];             // cancel the increment past the range
  }
  vector<int> answer(n);
  long long run = 0;
  for (int i = 0; i < n; i++) { run += diff[i]; answer[i] = (int)run; }
  return answer;
}
\`\`\`
:::

Car Pooling (LC 1094) is the same pattern on a timeline: \`diff[from] += passengers\`, \`diff[to] -= passengers\`, then verify the running load never exceeds capacity. The 2D analogue (a difference *matrix* with four corner updates) drives stamp/range-add-on-grid problems like Stamping the Grid (LC 2132).`,
    },
    {
      id: "hashmap-idioms",
      title: "Hash map counting idioms",
      body: `Beyond prefixes, a hash map is the default tool for *complement lookups*, *grouping by a canonical key*, and *first-seen anchoring*.

:::example Two Sum (LC 1)
Store each value as you go and look up its complement \`target - x\` in one pass — the archetypal "have I seen the piece that completes this?" lookup.

\`\`\`cpp
// One-pass complement lookup (LC 1)
vector<int> twoSum(vector<int>& a, int target) {
  unordered_map<int, int> seen;  // value -> index
  for (int i = 0; i < (int)a.size(); i++) {
    auto it = seen.find(target - a[i]);
    if (it != seen.end()) return {it->second, i};
    seen[a[i]] = i;
  }
  return {};
}
\`\`\`
:::

:::example Group Anagrams (LC 49)
Bucket strings by a **canonical key** — the sorted letters — so anagrams collide in the same map entry.

\`\`\`cpp
// Group strings sharing a sorted-letter signature (LC 49)
vector<vector<string>> groupAnagrams(vector<string>& strs) {
  unordered_map<string, vector<string>> groups;
  for (auto& s : strs) {
    string key = s;
    sort(key.begin(), key.end());  // canonical form is the same for anagrams
    groups[key].push_back(s);
  }
  vector<vector<string>> answer;
  for (auto& [k, v] : groups) answer.push_back(move(v));
  return answer;
}
\`\`\`
:::

The **first-seen index** idiom anchors "longest subarray with a property": store the earliest index at which each key (a prefix sum, a remainder, a balance) appears, and when the key recurs, the span from the first occurrence to now is the longest candidate. Longest Well-Performing Interval (LC 1124) maps each prefix to its first index; Contiguous Array (LC 525) and Maximum Size Subarray Sum Equals k (LC 325) follow the same first-index rule.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Static range sum | repeated "sum of $[l, r]$" on a fixed array | prefix array, query \`P[r+1] - P[l]\` | [Range Sum Query — Immutable](https://leetcode.cn/problems/range-sum-query-immutable) |
| Count subarrays = k | "how many subarrays sum to \`k\`", negatives allowed | prefix + hashmap of \`prefix - k\` | [Subarray Sum Equals K](https://leetcode.cn/problems/subarray-sum-equals-k) |
| Divisible / same remainder | "subarray sum divisible by \`k\`" | bucket prefixes by remainder mod \`k\` | [Subarray Sums Divisible by K](https://leetcode.cn/problems/subarray-sums-divisible-by-k) |
| Prefix XOR | "subarray XOR equals target / is 0" | map of prefix XOR values | [Count the Number of Beautiful Subarrays](https://leetcode.cn/problems/count-the-number-of-beautiful-subarrays) |
| Balance / longest span | "longest subarray with equal #0/#1 or net 0" | remap to ±1, first-seen index per prefix | [Contiguous Array](https://leetcode.cn/problems/contiguous-array) |
| 2D range sum | "rectangle sum on an immutable matrix" | padded 2D prefix + inclusion–exclusion | [Range Sum Query 2D — Immutable](https://leetcode.cn/problems/range-sum-query-2d-immutable) |
| Range increments | "add \`v\` to every index in $[l, r]$, then read" | difference array, prefix-sum to finalize | [Corporate Flight Bookings](https://leetcode.cn/problems/corporate-flight-bookings) |
| Complement / grouping | "two pieces sum to target", "group anagrams" | hashmap of value→index or canonical key | [Two Sum](https://leetcode.cn/problems/two-sum) |`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Technique | Build | Query / pass | Space |
| --- | --- | --- | --- |
| 1D prefix sum | \`O(n)\` | \`O(1)\` per range query | \`O(n)\` |
| Subarray count (prefix + hashmap) | — | \`O(n)\` one pass | \`O(n)\` map |
| Prefix remainder | — | \`O(n)\` | \`O(k)\` buckets |
| Prefix XOR | — | \`O(n)\` | \`O(n)\` map |
| 2D prefix sum | \`O(R * C)\` | \`O(1)\` per rectangle | \`O(R * C)\` |
| Difference array | \`O(m + n)\` for \`m\` updates | \`O(n)\` finalize | \`O(n)\` |
| Hashmap idioms | — | \`O(n)\` (\`O(L log L)\` per string for anagram keys) | \`O(n)\` |

The win is uniform: an \`O(n^2)\` subarray scan or an \`O(m * n)\` update loop becomes near-linear, and repeated range reads drop to \`O(1)\` after a one-time build.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 1 | [Two Sum](https://leetcode.cn/problems/two-sum) | hashmap complement |
| 303 | [Range Sum Query — Immutable](https://leetcode.cn/problems/range-sum-query-immutable) | 1D prefix sum |
| 304 | [Range Sum Query 2D — Immutable](https://leetcode.cn/problems/range-sum-query-2d-immutable) | 2D prefix sum |
| 560 | [Subarray Sum Equals K](https://leetcode.cn/problems/subarray-sum-equals-k) | prefix + hashmap |
| 974 | [Subarray Sums Divisible by K](https://leetcode.cn/problems/subarray-sums-divisible-by-k) | prefix remainder |
| 523 | [Continuous Subarray Sum](https://leetcode.cn/problems/continuous-subarray-sum) | remainder + first index |
| 525 | [Contiguous Array](https://leetcode.cn/problems/contiguous-array) | ±1 remap + first index |
| 49 | [Group Anagrams](https://leetcode.cn/problems/group-anagrams) | hashmap canonical key |
| 325 | [Maximum Size Subarray Sum Equals k](https://leetcode.cn/problems/maximum-size-subarray-sum-equals-k) | prefix + first index |
| 1109 | [Corporate Flight Bookings](https://leetcode.cn/problems/corporate-flight-bookings) | difference array |
| 1094 | [Car Pooling](https://leetcode.cn/problems/car-pooling) | difference array on timeline |
| 1248 | [Count Number of Nice Subarrays](https://leetcode.cn/problems/count-number-of-nice-subarrays) | prefix count of odds |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Seed the map with \`{0: 1}\`.** For subarray-count problems the empty prefix must be present, or you drop every subarray that starts at index 0.
- **Overflow.** Prefix sums grow with \`n\`; accumulate in \`long long\` and cast back only at the end. Products in 2D builds overflow 32-bit too.
- **Off-by-one in prefix indices.** With a length-$(n+1)$ array the sum of $[l, r]$ is \`P[r+1] - P[l]\` (half-open). Mixing 0-indexed and 1-indexed forms is the classic bug.
- **Negative remainders.** C++ \`%\` can return a negative value, so normalize with \`((x % k) + k) % k\` before bucketing prefixes by remainder.
- **Negatives break sliding window.** With negative numbers the running sum is not monotonic, so a two-pointer window fails; fall back to prefix + hashmap, which makes no monotonicity assumption.
- **Count vs first-index.** Store *counts* when the answer is "how many subarrays"; store the *first-seen index* when it is "longest subarray" — they are different maps for the same prefix.
- **Difference array bounds.** Size the diff array as \`n + 1\` so the \`diff[r+1] -= v\` at the last index is in-bounds.`,
    },
  ],
};
