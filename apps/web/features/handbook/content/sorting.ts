import type { HandbookTopic } from "../model";

export const sorting: HandbookTopic = {
  slug: "sorting",
  title: "Non-Comparison Sorting",
  tagline:
    "Beat the O(n log n) barrier — counting, radix, and bucket sort when keys are bounded integers.",
  icon: "ArrowDownWideNarrow",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Any sort that learns about the data **only by comparing pairs** of elements is bounded below by \`O(n log n)\`. Non-comparison sorts dodge that bound by using the **keys themselves as array indices** — they never compare two elements directly. The price is a restriction: the keys must be integers (or map cleanly to integers) drawn from a manageable range.

Reach for them when you see any of these signals:

- Keys are **small integers**: scores \`0..100\`, letters \`a..z\`, ages, pixel values \`0..255\`.
- The constraints spell out a **small bound** ($1 \\le \\text{nums}[i] \\le 1000$) on the same order as \`n\`.
- You must sort **large-range integers** but the **number of digits is fixed** (32-bit ints, fixed-length strings).
- You need **Top-K by frequency** or the **maximum adjacent gap** in \`O(n)\`.

The three workhorses:

- **Counting sort** — small value range \`[0, k]\`, \`O(n + k)\`.
- **Radix sort** — large range but fixed digit count, \`O(d * (n + b))\`.
- **Bucket sort** — near-uniform distribution, or "frequency buckets", average \`O(n)\`.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- **Prefix sums** — the backbone of the stable counting-sort placement step.
- The notion of a **stable** sort: equal keys keep their original input order. Radix sort *requires* a stable per-digit pass.
- Basic complexity: why comparison sorts cannot beat \`O(n log n)\`.

Related handbook topics: [Binary Search](/handbook/binary-search) (the other "exploit structure in sorted data" tool) and [Data Structures](/handbook/data-structures). For the comparison-based STL \`sort\` / \`stable_sort\`, see [Competitive Programming Essentials](/handbook/competitive-programming-essentials).`,
    },
    {
      id: "counting-sort",
      title: "Counting sort",
      body: `When keys live in a small range \`[0, k]\`, count how many times each value occurs, then emit values in order. No comparisons, \`O(n + k)\` time.

\`\`\`cpp
// Counting sort over the value range [0, k], O(n + k)
vector<int> countingSort(const vector<int>& a, int k) {
  vector<int> cnt(k + 1, 0);
  for (int x : a) {
    cnt[x]++;  // 1) tally occurrences of each value
  }
  vector<int> res;
  for (int v = 0; v <= k; ++v) {  // 2) pour values out in ascending order
    while (cnt[v]-- > 0) {
      res.push_back(v);
    }
  }
  return res;
}
\`\`\`

If you must carry whole records along (sort objects by a key) **and** keep equal keys in input order (stable), use the prefix-sum variant. The prefix sum tells you how many elements are $\\le v$, i.e. where value \`v\` must end:

\`\`\`cpp
// Stable counting sort via prefix sums (the basis of radix sort)
vector<int> stableCountingSort(const vector<int>& a, int k) {
  int n = a.size();
  vector<int> cnt(k + 1, 0), res(n);
  for (int x : a) {
    cnt[x]++;
  }
  for (int v = 1; v <= k; ++v) {
    cnt[v] += cnt[v - 1];  // prefix sum: cnt[v] == count of values <= v
  }
  for (int i = n - 1; i >= 0; i--) {  // iterate from the back to stay stable
    res[--cnt[a[i]]] = a[i];
  }
  return res;
}
\`\`\`

Handle negatives by shifting: map \`[mn, mx]\` to indices \`[0, mx - mn]\` with \`x - mn\`. Counting sort wins when \`k = O(n)\`; if \`k\` dwarfs \`n\` (values up to \`1e9\`), switch to radix or bucket sort.`,
    },
    {
      id: "radix-sort",
      title: "Radix sort",
      body: `Counting sort explodes when the range \`k\` is huge. Radix sort splits each number into **digits** (base 10, or 8-bit groups) and runs one **stable** counting-sort pass per digit, from least significant digit (LSD) to most significant. Stability is what makes it work: sorting by a higher digit preserves the order already established by the lower digits.

\`\`\`cpp
// LSD radix sort for non-negative ints, base 10, O(d * (n + 10))
void radixSort(vector<int>& a) {
  if (a.empty()) {
    return;
  }
  int n = a.size();
  int mx = *max_element(a.begin(), a.end());
  vector<int> out(n);
  for (long exp = 1; mx / exp > 0; exp *= 10) {  // one pass per digit
    vector<int> cnt(10, 0);
    for (int x : a) {
      cnt[(x / exp) % 10]++;  // distribution of this digit
    }
    for (int d = 1; d < 10; ++d) {
      cnt[d] += cnt[d - 1];  // prefix sum -> final positions
    }
    for (int i = n - 1; i >= 0; i--) {  // back to front keeps the pass stable
      int d = (a[i] / exp) % 10;
      out[--cnt[d]] = a[i];
    }
    a = out;  // this digit is sorted; advance to the next
  }
}
\`\`\`

Practical notes:

- **Base 256** (one pass per byte) sorts any 32-bit int in a fixed 4 passes — fewer, fatter passes mean a smaller constant than base 10.
- **Negatives**: shift everything to non-negative with \`x -= mn\` and add \`mn\` back afterwards, or split negatives and non-negatives into separate runs.
- Use \`long\` for \`exp\` so \`exp *= 10\` cannot overflow on large maxima.
- Complexity is \`O(d * (n + b))\` for \`d\` digits in base \`b\`. With a fixed value bound, \`d\` is constant, so it is linear — but the constant is larger than \`std::sort\`, so it only pays off on big inputs.`,
    },
    {
      id: "bucket-sort",
      title: "Bucket sort & frequency buckets",
      body: `Bucket sort scatters elements into buckets by value range, sorts within each bucket, then concatenates. With a near-uniform distribution it averages \`O(n)\`; in the worst case (everything in one bucket) it degrades to the inner sort's cost.

\`\`\`cpp
// Bucket sort for values in [mn, mx], average O(n) when roughly uniform
vector<int> bucketSort(vector<int>& a) {
  int n = a.size();
  if (n <= 1) {
    return a;
  }
  int mn = *min_element(a.begin(), a.end());
  int mx = *max_element(a.begin(), a.end());
  if (mn == mx) {
    return a;  // all equal -> already sorted, avoid divide-by-zero
  }
  vector<vector<int>> buckets(n);
  for (int x : a) {
    int idx = (long long)(x - mn) * (n - 1) / (mx - mn);  // map to [0, n-1]
    buckets[idx].push_back(x);
  }
  vector<int> res;
  for (auto& b : buckets) {
    sort(b.begin(), b.end());  // small buckets -> cheap
    for (int x : b) {
      res.push_back(x);
    }
  }
  return res;
}
\`\`\`

:::example Top K Frequent Elements (LC 347)
The interview-favourite cousin is the **frequency bucket**: index buckets by *occurrence count* to grab the Top-K most frequent values in \`O(n)\`, no sorting of frequencies required.

\`\`\`cpp
// Top-K frequent elements via frequency buckets, O(n) (LC 347)
vector<int> topKFrequent(vector<int>& nums, int k) {
  unordered_map<int, int> freq;
  for (int x : nums) {
    freq[x]++;
  }
  int n = nums.size();
  vector<vector<int>> bucket(n + 1);  // bucket[f] = values seen exactly f times
  for (auto& [val, f] : freq) {
    bucket[f].push_back(val);
  }
  vector<int> res;
  for (int f = n; f >= 1 && (int)res.size() < k; f--) {  // high freq first
    for (int val : bucket[f]) {
      res.push_back(val);
      if ((int)res.size() == k) {
        break;
      }
    }
  }
  return res;
}
\`\`\`
:::

A third face is the **pigeonhole bucket** for the maximum adjacent gap (LC 164): with \`n\` values spread over \`[mn, mx]\`, the largest gap is at least \`ceil((mx - mn) / (n - 1))\`, so it must straddle two buckets of that width — store only each bucket's min/max and the answer is \`max(nextMin - prevMax)\`, all in \`O(n)\`.`,
    },
    {
      id: "advanced-techniques",
      title: "Advanced techniques",
      body: `Advanced non-comparison sorting starts with value-domain control. Compress sparse values, bucket by digit or frequency, and only use radix/counting when the key range and stability requirements are explicit.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Technique | Best for | Time | Extra space | Stable |
| --- | --- | --- | --- | --- |
| Counting sort | small range \`k = O(n)\` | \`O(n + k)\` | \`O(n + k)\` | prefix-sum variant only |
| Radix sort | large range, fixed digits | \`O(d * (n + b))\` | \`O(n + b)\` | yes (each pass must be) |
| Bucket sort | near-uniform distribution | avg \`O(n)\`, worst \`O(n^2)\` | \`O(n)\` | depends on inner sort |
| Frequency bucket | Top-K / sort by frequency | \`O(n)\` | \`O(n)\` | no (group, not order) |

Rule of thumb: range on the order of \`n\` → counting; range large but digit count fixed → radix; ask for Top-K frequency or max gap, or data is uniform → bucket.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Non-comparison sorting surfaces in interviews whenever the keys are bounded integers — recognizing the key range or the "by frequency" phrasing points you straight at the right linear-time tool.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Counting sort | keys in a small range \`[0, k]\` with $k = O(n)$ | tally occurrences, pour out in order, \`O(n + k)\` | [Sort Colors](https://leetcode.cn/problems/sort-colors) |
| Custom-order counting | sort by a bounded key in a caller-defined order | counting buckets visited in the desired order | [Relative Sort Array](https://leetcode.cn/problems/relative-sort-array) |
| LSD radix sort | large-range integers but a fixed digit count | stable counting pass per digit, low to high | [Sort an Array](https://leetcode.cn/problems/sort-an-array) |
| Frequency bucket | "Top-K most frequent" / sort by frequency | bucket by occurrence count, scan high to low | [Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements) |
| Pigeonhole / gap bucket | max adjacent gap, near-uniform spread | \`n+1\` buckets, compare each bucket's min/max | [Maximum Gap](https://leetcode.cn/problems/maximum-gap) |
| Stable sort by mapped key | reorder records by a derived key, ties keep input order | precompute the key, run a stable per-key pass | [Sort the Jumbled Numbers](https://leetcode.cn/problems/sort-the-jumbled-numbers) |

- **Radix demands a stable per-digit pass**: a non-stable inner sort scrambles the order established by lower digits, so iterate back-to-front with the prefix-sum placement.
- **Frequency buckets size \`n + 1\`** (a value can appear up to \`n\` times), not \`n\`; off-by-one here silently drops the most frequent element.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 3541 | [Find Most Frequent Vowel and Consonant](https://leetcode.cn/problems/find-most-frequent-vowel-and-consonant) | 1239 | frequency counting |
| 3545 | [Minimum Deletions for at Most K Distinct Characters](https://leetcode.cn/problems/minimum-deletions-for-at-most-k-distinct-characters) | 1211 | counting / greedy |
| 3517 | [Smallest Palindromic Rearrangement I](https://leetcode.cn/problems/smallest-palindromic-rearrangement-i) | 1357 | counting characters |
| 3446 | [Sort Matrix by Diagonals](https://leetcode.cn/problems/sort-matrix-by-diagonals) | 1373 | diagonal sorting |
| 3478 | [Choose K Elements with Maximum Sum](https://leetcode.cn/problems/choose-k-elements-with-maximum-sum) | 1753 | sort + heap |
| 3507 | [Minimum Pair Removal to Sort Array I](https://leetcode.cn/problems/minimum-pair-removal-to-sort-array-i) | 1349 | ordered simulation |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Bucket size** is \`(value upper bound) + 1\`, never \`n\`; for frequency buckets that is \`n + 1\` (a value can appear \`n\` times).
- **Stability**: the plain "pour out values" counting sort is fine for bare integers but loses input order for records — use the prefix-sum variant, iterating **back to front**.
- **Radix needs a stable pass**; a non-stable per-digit sort scrambles the work of the previous digit.
- **Negatives**: counting and radix sort assume non-negative indices — shift by \`-mn\` (or split by sign) first.
- **Overflow & divide-by-zero**: cast to \`long long\` when mapping bucket indices, and special-case \`mx == mn\`.
- **Range sanity check**: counting sort over a value bound of \`1e9\` allocates a billion-entry array — confirm \`k = O(n)\` before reaching for it, otherwise use radix or bucket sort.`,
    },
  ],
};
