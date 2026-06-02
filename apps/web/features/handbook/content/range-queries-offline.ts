import type { HandbookTopic } from "../model";

export const rangeQueriesOffline: HandbookTopic = {
  slug: "range-queries-offline",
  title: "Range Queries & Offline Algorithms",
  tagline:
    "Prefix sums, compression, Fenwick trees, segment trees, sparse tables, sweep line, and Mo's algorithm.",
  icon: "PanelsTopLeft",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Range-query problems ask for information over many intervals, rectangles, prefixes, subtrees, or time windows. The key decision is whether updates exist and whether queries can be reordered.

Decision guide:

| Query shape | Good tool |
| --- | --- |
| Static sum | prefix sums |
| Static min/max/idempotent query | sparse table |
| Point update + prefix/range query | Fenwick tree |
| Range update or custom merge | segment tree |
| Large coordinates | coordinate compression |
| Queries can be reordered | offline sort, sweep line, Mo's algorithm |

\`\`\`cpp
// Skeleton for deciding online vs offline.
struct Query {
  int l, r, id;
};

vector<long long> answerQueries(vector<int>& a, vector<Query> queries) {
  // If queries must be answered immediately, keep input order.
  // If not, sort them by threshold, block, right endpoint, or event time.
  vector<long long> ans(queries.size());
  return ans;
}
\`\`\``,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- A solid grasp of [Data Structures](/handbook/data-structures): Fenwick trees, segment trees, heaps, and DSU.
- [Binary Search](/handbook/binary-search) for kth-element descent on a Fenwick tree and for parametric search.
- Sorting, and the idea of answering queries in an order you choose rather than the input order (offline).

Related: [Sliding Window](/handbook/sliding-window) (the online cousin of many range queries) and [Greedy](/handbook/greedy) (event ordering for sweep line).`,
    },
    {
      id: "prefix-difference",
      title: "Prefix sums and difference arrays",
      body: `Use prefix sums for static range sums and difference arrays for many range additions followed by one materialization.

\`\`\`cpp
// Static range sum on [l, r], 0-indexed inclusive.
struct PrefixSum {
  vector<long long> pre;

  PrefixSum(const vector<int>& a) : pre(a.size() + 1, 0) {
    for (int i = 0; i < (int)a.size(); i++) {
      pre[i + 1] = pre[i] + a[i];
    }
  }

  long long sum(int l, int r) const {
    return pre[r + 1] - pre[l];
  }
};

// Range add updates, then build the final array once.
vector<long long> applyRangeAdds(int n, vector<array<int, 3>> updates) {
  vector<long long> diff(n + 1, 0);
  for (auto [l, r, v] : updates) {
    diff[l] += v;
    if (r + 1 < n) {
      diff[r + 1] -= v;
    }
  }
  for (int i = 1; i < n; i++) {
    diff[i] += diff[i - 1];
  }
  diff.pop_back();
  return diff;
}
\`\`\``,
    },
    {
      id: "compression",
      title: "Coordinate compression",
      body: `When values or coordinates are huge but only \`O(n)\` distinct values matter, replace each value with its sorted rank.

\`\`\`cpp
struct Compressor {
  vector<long long> xs;

  void add(long long x) {
    xs.push_back(x);
  }

  void build() {
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
  }

  int get(long long x) const {
    return lower_bound(xs.begin(), xs.end(), x) - xs.begin();
  }

  int size() const {
    return xs.size();
  }
};

// Example: compress array values to 1-indexed Fenwick positions.
vector<int> compressValues(vector<int> a) {
  Compressor cp;
  for (int x : a) {
    cp.add(x);
  }
  cp.build();
  vector<int> rank(a.size());
  for (int i = 0; i < (int)a.size(); i++) {
    rank[i] = cp.get(a[i]) + 1;
  }
  return rank;
}
\`\`\``,
    },
    {
      id: "fenwick",
      title: "Fenwick tree for counts and sums",
      body: `A Fenwick tree is the shortest reliable template for point updates plus prefix queries. With compression, it also counts values by rank.

\`\`\`cpp
struct Fenwick {
  int n;
  vector<long long> bit;

  Fenwick(int n) : n(n), bit(n + 1, 0) {}

  void add(int idx, long long delta) {
    for (; idx <= n; idx += idx & -idx) {
      bit[idx] += delta;
    }
  }

  long long sumPrefix(int idx) const {
    long long res = 0;
    for (; idx > 0; idx -= idx & -idx) {
      res += bit[idx];
    }
    return res;
  }

  long long sumRange(int l, int r) const {
    return sumPrefix(r) - sumPrefix(l - 1);
  }

  int kth(long long k) const {
    // Smallest idx such that prefix sum >= k. Requires non-negative counts.
    int idx = 0;
    int step = 1;
    while ((step << 1) <= n) {
      step <<= 1;
    }
    for (; step; step >>= 1) {
      int next = idx + step;
      if (next <= n && bit[next] < k) {
        idx = next;
        k -= bit[next];
      }
    }
    return idx + 1;
  }
};

// Count smaller elements after self.
vector<int> countSmaller(vector<int>& nums) {
  vector<int> rank = compressValues(nums);
  Fenwick fw(nums.size());
  vector<int> ans(nums.size());
  for (int i = (int)nums.size() - 1; i >= 0; i--) {
    ans[i] = fw.sumPrefix(rank[i] - 1);
    fw.add(rank[i], 1);
  }
  return ans;
}
\`\`\``,
    },
    {
      id: "segment-tree",
      title: "Segment tree with lazy propagation",
      body: `Use a segment tree when the merge is not just a prefix sum, or when you need range updates with range queries.

\`\`\`cpp
struct SegTree {
  int n;
  vector<long long> tree, lazy;

  SegTree(int n) : n(n), tree(4 * n, 0), lazy(4 * n, 0) {}

  void apply(int node, int l, int r, long long add) {
    tree[node] += add * (r - l + 1);
    lazy[node] += add;
  }

  void push(int node, int l, int r) {
    if (lazy[node] == 0 || l == r) {
      return;
    }
    int mid = l + (r - l) / 2;
    apply(node * 2, l, mid, lazy[node]);
    apply(node * 2 + 1, mid + 1, r, lazy[node]);
    lazy[node] = 0;
  }

  void addRange(int ql, int qr, long long val, int node, int l, int r) {
    if (qr < l || r < ql) {
      return;
    }
    if (ql <= l && r <= qr) {
      apply(node, l, r, val);
      return;
    }
    push(node, l, r);
    int mid = l + (r - l) / 2;
    addRange(ql, qr, val, node * 2, l, mid);
    addRange(ql, qr, val, node * 2 + 1, mid + 1, r);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
  }

  long long querySum(int ql, int qr, int node, int l, int r) {
    if (qr < l || r < ql) {
      return 0;
    }
    if (ql <= l && r <= qr) {
      return tree[node];
    }
    push(node, l, r);
    int mid = l + (r - l) / 2;
    return querySum(ql, qr, node * 2, l, mid) +
           querySum(ql, qr, node * 2 + 1, mid + 1, r);
  }

  void addRange(int l, int r, long long val) {
    addRange(l, r, val, 1, 0, n - 1);
  }

  long long querySum(int l, int r) {
    return querySum(l, r, 1, 0, n - 1);
  }
};
\`\`\``,
    },
    {
      id: "sparse-table",
      title: "Sparse table for static min/max",
      body: `For immutable arrays and idempotent operations like min, max, gcd, and bitwise and/or, a sparse table answers queries in \`O(1)\` after \`O(n log n)\` preprocessing.

\`\`\`cpp
struct SparseTable {
  vector<vector<int>> st;
  vector<int> lg;

  SparseTable(const vector<int>& a) {
    int n = a.size();
    lg.assign(n + 1, 0);
    for (int i = 2; i <= n; i++) {
      lg[i] = lg[i / 2] + 1;
    }
    st.assign(lg[n] + 1, vector<int>(n));
    st[0] = a;
    for (int k = 1; k < (int)st.size(); k++) {
      for (int i = 0; i + (1 << k) <= n; i++) {
        st[k][i] = min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
      }
    }
  }

  int rangeMin(int l, int r) const {
    int k = lg[r - l + 1];
    return min(st[k][l], st[k][r - (1 << k) + 1]);
  }
};
\`\`\``,
    },
    {
      id: "offline-threshold",
      title: "Offline queries sorted by threshold",
      body: `If a query asks about elements with value <= x, sort queries by x and add eligible elements once. This converts repeated scanning into Fenwick or DSU updates.

\`\`\`cpp
// For each query (l, r, x), count elements a[i] <= x in a[l..r].
struct ThresholdQuery {
  int l, r, x, id;
};

vector<int> countLE(vector<int>& a, vector<ThresholdQuery> queries) {
  int n = a.size();
  vector<pair<int, int>> items;
  for (int i = 0; i < n; i++) {
    items.push_back({a[i], i});
  }
  sort(items.begin(), items.end());
  sort(queries.begin(), queries.end(),
       [](const auto& q1, const auto& q2) { return q1.x < q2.x; });

  Fenwick fw(n);
  vector<int> ans(queries.size());
  int ptr = 0;
  for (auto q : queries) {
    while (ptr < n && items[ptr].first <= q.x) {
      fw.add(items[ptr].second + 1, 1);
      ptr++;
    }
    ans[q.id] = fw.sumRange(q.l + 1, q.r + 1);
  }
  return ans;
}
\`\`\``,
    },
    {
      id: "sweep-line",
      title: "Sweep line over events",
      body: `Sweep line turns interval or rectangle problems into sorted events. Maintain active objects in a heap, multiset, map, Fenwick tree, or segment tree.

\`\`\`cpp
// Maximum number of overlapping half-open intervals [l, r).
int maxOverlap(vector<pair<int, int>> intervals) {
  vector<pair<int, int>> events;
  for (auto [l, r] : intervals) {
    events.push_back({l, +1});
    events.push_back({r, -1});
  }
  sort(events.begin(), events.end(), [](auto a, auto b) {
    if (a.first != b.first) {
      return a.first < b.first;
    }
    return a.second < b.second;  // removals before additions for [l, r)
  });

  int cur = 0, best = 0;
  for (auto [x, delta] : events) {
    cur += delta;
    best = max(best, cur);
  }
  return best;
}
\`\`\`

For rectangle union area, sweep x-events and use a segment tree over compressed y-coordinates to maintain covered length.`,
    },
    {
      id: "mo",
      title: "Mo's algorithm",
      body: `Mo's algorithm answers offline range queries by sorting them so the current window moves slowly. It works when adding or removing one endpoint can update the answer quickly.

\`\`\`cpp
struct MoQuery {
  int l, r, id;
};

vector<long long> distinctCount(vector<int>& a, vector<MoQuery> queries) {
  int n = a.size();
  int block = max(1, (int)sqrt(n));
  sort(queries.begin(), queries.end(), [&](const MoQuery& x, const MoQuery& y) {
    int bx = x.l / block, by = y.l / block;
    if (bx != by) {
      return bx < by;
    }
    return (bx & 1) ? x.r > y.r : x.r < y.r;
  });

  unordered_map<int, int> freq;
  vector<long long> ans(queries.size());
  int curL = 0, curR = -1;
  long long distinct = 0;

  auto add = [&](int idx) {
    if (++freq[a[idx]] == 1) {
      distinct++;
    }
  };
  auto remove = [&](int idx) {
    if (--freq[a[idx]] == 0) {
      distinct--;
    }
  };

  for (auto q : queries) {
    while (curL > q.l) {
      add(--curL);
    }
    while (curR < q.r) {
      add(++curR);
    }
    while (curL < q.l) {
      remove(curL++);
    }
    while (curR > q.r) {
      remove(curR--);
    }
    ans[q.id] = distinct;
  }
  return ans;
}
\`\`\``,
    },
    {
      id: "persistent",
      title: "Merge-sort tree and persistent segment tree",
      body: `When queries ask "how many values <= x in [l, r]" or "kth smallest in [l, r]", precompute versions or sorted segment lists instead of re-sorting each query.

\`\`\`cpp
// Merge-sort tree: count values <= x in a[l..r], O(log^2 n) per query.
struct MergeSortTree {
  int n;
  vector<vector<int>> tree;

  MergeSortTree(vector<int>& a) : n(a.size()), tree(4 * n) {
    build(a, 1, 0, n - 1);
  }

  void build(vector<int>& a, int node, int l, int r) {
    if (l == r) {
      tree[node] = {a[l]};
      return;
    }
    int mid = l + (r - l) / 2;
    build(a, node * 2, l, mid);
    build(a, node * 2 + 1, mid + 1, r);
    merge(tree[node * 2].begin(), tree[node * 2].end(),
          tree[node * 2 + 1].begin(), tree[node * 2 + 1].end(),
          back_inserter(tree[node]));
  }

  int countLE(int ql, int qr, int x, int node, int l, int r) {
    if (qr < l || r < ql) {
      return 0;
    }
    if (ql <= l && r <= qr) {
      return upper_bound(tree[node].begin(), tree[node].end(), x) -
             tree[node].begin();
    }
    int mid = l + (r - l) / 2;
    return countLE(ql, qr, x, node * 2, l, mid) +
           countLE(ql, qr, x, node * 2 + 1, mid + 1, r);
  }

  int countLE(int l, int r, int x) {
    return countLE(l, r, x, 1, 0, n - 1);
  }
};
\`\`\``,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Tool | Build | Query | Update |
| --- | --- | --- | --- |
| Prefix sum | \`O(n)\` | \`O(1)\` | rebuild |
| Difference array | \`O(n)\` | \`O(1)\` after build | \`O(1)\` range add |
| Sparse table | \`O(n log n)\` | \`O(1)\` | immutable |
| Fenwick tree | \`O(n)\` | \`O(log n)\` | \`O(log n)\` |
| Segment tree (lazy) | \`O(n)\` | \`O(log n)\` | \`O(log n)\` |
| Merge-sort tree | \`O(n log n)\` | \`O(log^2 n)\` | immutable |
| Mo's algorithm | — | \`O((n + q) sqrt n)\` total | offline only |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 303 | [Range Sum Query - Immutable](https://leetcode.cn/problems/range-sum-query-immutable) | prefix sums |
| 304 | [Range Sum Query 2D - Immutable](https://leetcode.cn/problems/range-sum-query-2d-immutable) | 2D prefix sums |
| 1109 | [Corporate Flight Bookings](https://leetcode.cn/problems/corporate-flight-bookings) | difference array |
| 307 | [Range Sum Query - Mutable](https://leetcode.cn/problems/range-sum-query-mutable) | Fenwick or segment tree |
| 315 | [Count of Smaller Numbers After Self](https://leetcode.cn/problems/count-of-smaller-numbers-after-self) | Fenwick + compression |
| 327 | [Count of Range Sum](https://leetcode.cn/problems/count-of-range-sum) | prefix sums + Fenwick |
| 493 | [Reverse Pairs](https://leetcode.cn/problems/reverse-pairs) | merge sort or Fenwick |
| 218 | [The Skyline Problem](https://leetcode.cn/problems/the-skyline-problem) | sweep line |
| 850 | [Rectangle Area II](https://leetcode.cn/problems/rectangle-area-ii) | sweep line + segment tree |
| 2251 | [Number of Flowers in Full Bloom](https://leetcode.cn/problems/number-of-flowers-in-full-bloom) | offline events + sorting |
| 715 | [Range Module](https://leetcode.cn/problems/range-module) | interval segment tree |
| 699 | [Falling Squares](https://leetcode.cn/problems/falling-squares) | compression + segment tree |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3777 | [Minimum Deletions to Make Alternating Substring](https://leetcode.cn/problems/minimum-deletions-to-make-alternating-substring) | 2202 | segment tree |
| 3768 | [Minimum Inversion Count in Subarrays of Fixed Length](https://leetcode.cn/problems/minimum-inversion-count-in-subarrays-of-fixed-length) | 2158 | Fenwick + merge sort |
| 3748 | [Count Stable Subarrays](https://leetcode.cn/problems/count-stable-subarrays) | 2209 | prefix sums |
| 3739 | [Count Subarrays With Majority Element II](https://leetcode.cn/problems/count-subarrays-with-majority-element-ii) | 2090 | segment tree + merge sort |
| 3691 | [Maximum Total Subarray Value II](https://leetcode.cn/problems/maximum-total-subarray-value-ii) | 2469 | segment tree |
| 3636 | [Threshold Majority Queries](https://leetcode.cn/problems/threshold-majority-queries) | 2451 | offline queries |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- Fenwick trees are usually 1-indexed; compressed ranks should start at 1.
- For segment trees, call \`push\` before descending after a lazy update.
- For sparse tables, only use the overlapping two-block query for idempotent operations.
- For sweep line, decide whether intervals are closed \`[l, r]\` or half-open \`[l, r)\`.
- For Mo's algorithm, all queries must be known in advance.

\`\`\`cpp
// Closed intervals [l, r] need additions before removals at the same coordinate.
sort(events.begin(), events.end(), [](auto a, auto b) {
  if (a.x != b.x) {
    return a.x < b.x;
  }
  return a.type > b.type;  // +1 before -1 for closed intervals
});
\`\`\``,
    },
  ],
};
