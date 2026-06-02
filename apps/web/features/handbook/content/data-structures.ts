import type { HandbookTopic } from "../model";

export const dataStructures: HandbookTopic = {
  slug: "data-structures",
  title: "Data Structures",
  tagline:
    "Prefix sums, hashing, heaps, DSU, Fenwick & segment trees — the toolbox behind fast queries and updates.",
  icon: "Boxes",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Most "make it faster" problems are really "pick the right data structure". This chapter collects the workhorses that turn an \`O(n)\` per-query brute force into \`O(1)\` or \`O(log n)\`.

Quick selection guide:

| You need to … | Use |
| --- | --- |
| Range sum on a static array | **prefix sums** |
| Range sum/min with point updates | **Fenwick (BIT)** or **segment tree** |
| Range update + range query | **segment tree with lazy propagation** |
| Always pull the min/max | **heap (priority_queue)** |
| Group/connect elements, "are these connected?" | **Disjoint Set Union (DSU)** |
| O(1) average lookup by key | **hash map / hash set** |
| Prefix-keyed string lookups | **Trie** (see Strings) |
| Order-statistics / dynamic median | **two heaps** or ordered set |`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Arrays, pointers, and amortized analysis.
- Recursion (for segment trees) and bit tricks (\`i & -i\` for Fenwick).

Related: [Monotonic Stack](/handbook/monotonic-stack), [Trees & Binary Trees](/handbook/trees), [Strings](/handbook/strings) (Trie), [Graph Algorithms](/handbook/graph) (DSU drives Kruskal & connectivity). Going further: [Range Queries & Offline Algorithms](/handbook/range-queries-offline) (coordinate compression, sweep line, Mo's algorithm, persistent structures).`,
    },
    {
      id: "prefix",
      title: "Prefix sums & difference arrays",
      body: `**Prefix sums** answer range-sum queries in \`O(1)\` after \`O(n)\` preprocessing. **Difference arrays** apply many range *updates* in \`O(1)\` each, then materialize once.

\`\`\`cpp
// 1D prefix sum: sum of a[l..r] inclusive
vector<long long> pre(n + 1, 0);
for (int i = 0; i < n; i++) {
  pre[i + 1] = pre[i] + a[i];
}
auto rangeSum = [&](int l, int r) { return pre[r + 1] - pre[l]; };
\`\`\`

\`\`\`cpp
// Difference array: add 'val' to every index in [l, r], O(1) per update
vector<long long> diff(n + 1, 0);
auto update = [&](int l, int r, long long val) {
  diff[l] += val;
  diff[r + 1] -= val;
};
// materialize
for (int i = 1; i < n; i++) {
  diff[i] += diff[i - 1];
}
\`\`\`

2D prefix sums (LC 304) give submatrix sums in \`O(1)\`; the 2D difference array (LC 2536) batches rectangle updates. Prefix sums + a hash map of seen sums solve "subarray sum equals K" (LC 560).`,
    },
    {
      id: "hashing",
      title: "Hashing: maps, sets, and the prefix-sum hash trick",
      body: `Hash maps give \`O(1)\` average insert/lookup and are the glue of countless problems: two-sum, grouping anagrams, deduplication, frequency counting.

\`\`\`cpp
// Subarray sum equals k (LC 560): count prefix sums seen so far
int subarraySum(vector<int>& a, int k) {
  unordered_map<long long, int> seen{{0, 1}};
  long long sum = 0;
  int res = 0;
  for (int x : a) {
    sum += x;
    res += seen.count(sum - k) ? seen[sum - k] : 0;  // a prefix that makes k
    seen[sum]++;
  }
  return res;
}
\`\`\`

Tips: reserve capacity (\`m.reserve(n)\`) to cut rehashing; for adversarial inputs that target \`unordered_map\`, fall back to \`map\` or add a random salt. Use \`array\`/\`vector\` indexing when keys are small integers — it is far faster than hashing.`,
    },
    {
      id: "heap",
      title: "Heaps & the two-heap trick",
      body: `A binary heap (\`priority_queue\`) gives \`O(log n)\` push/pop and \`O(1)\` top — ideal for "Kth largest", "merge K lists", and streaming medians.

\`\`\`cpp
// Kth largest element (LC 215) with a size-k min-heap: O(n log k)
int findKthLargest(vector<int>& a, int k) {
  priority_queue<int, vector<int>, greater<>> pq;
  for (int x : a) {
    pq.push(x);
    if ((int)pq.size() > k) {
      pq.pop();  // keep only the k largest
    }
  }
  return pq.top();
}
\`\`\`

\`\`\`cpp
// Streaming median (LC 295): max-heap for low half, min-heap for high half
class MedianFinder {
  priority_queue<int> lo;                          // max-heap
  priority_queue<int, vector<int>, greater<>> hi;  // min-heap
 public:
  void addNum(int x) {
    lo.push(x);
    hi.push(lo.top());
    lo.pop();  // balance values
    if (hi.size() > lo.size()) {
      lo.push(hi.top());
      hi.pop();
    }
  }
  double findMedian() {
    return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
  }
};
\`\`\``,
    },
    {
      id: "dsu",
      title: "Disjoint Set Union (Union-Find)",
      body: `DSU tracks a partition into disjoint sets with near-\`O(1)\` \`find\` and \`union\` (inverse-Ackermann, effectively constant) using path compression + union by size/rank.

\`\`\`cpp
// Disjoint Set Union with path compression + union by size
struct DSU {
  vector<int> p, sz;
  DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
  int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
  bool unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) {
      return false;  // already connected
    }
    if (sz[a] < sz[b]) {
      swap(a, b);
    }
    p[b] = a;
    sz[a] += sz[b];
    return true;
  }
};
\`\`\`

Uses: number of connected components / provinces (LC 547), redundant connection / cycle detection (LC 684), accounts merge (LC 721), and Kruskal's MST. For "by value" keys, map them to indices first.`,
    },
    {
      id: "fenwick",
      title: "Fenwick tree (Binary Indexed Tree)",
      body: `A Fenwick tree supports **point update + prefix query** in \`O(log n)\` with tiny constants and code. The bit trick \`i & -i\` isolates the lowest set bit.

\`\`\`cpp
// Fenwick / BIT: 1-indexed, prefix sums with point updates
struct Fenwick {
  int n;
  vector<long long> t;
  Fenwick(int n) : n(n), t(n + 1, 0) {}
  void add(int i, long long v) {
    for (; i <= n; i += i & -i) {
      t[i] += v;
    }
  }
  long long sum(int i) {
    long long s = 0;
    for (; i > 0; i -= i & -i) {
      s += t[i];
    }
    return s;
  }
  // 1-indexed [l, r]
  long long range(int l, int r) { return sum(r) - sum(l - 1); }
};
\`\`\`

Counting inversions (LC 315 Count of Smaller Numbers After Self) is the canonical use: compress values, sweep right-to-left, query how many smaller values were already inserted.`,
    },
    {
      id: "segtree",
      title: "Segment tree (with lazy propagation)",
      body: `When you need **range queries and range updates** (sum/min/max/gcd), a segment tree gives \`O(log n)\` for both. Lazy propagation defers range updates until a node is actually visited.

\`\`\`cpp
// Iterative-free recursive segment tree: range-sum with range-add (lazy)
struct SegTree {
  int n;
  vector<long long> sum, lazy;
  SegTree(int n) : n(n), sum(4 * n, 0), lazy(4 * n, 0) {}
  void push(int node, int l, int r) {
    if (!lazy[node]) {
      return;
    }
    int m = (l + r) / 2, L = 2 * node, R = 2 * node + 1;
    sum[L] += lazy[node] * (m - l + 1);
    lazy[L] += lazy[node];
    sum[R] += lazy[node] * (r - m);
    lazy[R] += lazy[node];
    lazy[node] = 0;
  }
  void update(int node, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) {
      return;
    }
    if (ql <= l && r <= qr) {
      sum[node] += v * (r - l + 1);
      lazy[node] += v;
      return;
    }
    push(node, l, r);
    int m = (l + r) / 2;
    update(2 * node, l, m, ql, qr, v);
    update(2 * node + 1, m + 1, r, ql, qr, v);
    sum[node] = sum[2 * node] + sum[2 * node + 1];
  }
  long long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) {
      return 0;
    }
    if (ql <= l && r <= qr) {
      return sum[node];
    }
    push(node, l, r);
    int m = (l + r) / 2;
    return query(2 * node, l, m, ql, qr) +
           query(2 * node + 1, m + 1, r, ql, qr);
  }
};
\`\`\`

If you only need point updates, prefer Fenwick — it is shorter and faster. Reach for a segment tree for range updates, range min/max, or custom merge functions.`,
    },
    {
      id: "linkedlist",
      title: "Linked lists & the fast/slow pointer",
      body: `Linked-list problems are about pointer choreography: a **dummy head** simplifies edge cases, and **fast/slow pointers** find the middle or detect cycles.

\`\`\`cpp
// Reverse a singly linked list (LC 206)
ListNode* reverse(ListNode* head) {
  ListNode* prev = nullptr;
  while (head) {
    ListNode* nxt = head->next;
    head->next = prev;
    prev = head;
    head = nxt;
  }
  return prev;
}
// Cycle detection (LC 141): slow/fast meet inside a cycle
bool hasCycle(ListNode* head) {
  ListNode *slow = head, *fast = head;
  while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) {
      return true;
    }
  }
  return false;
}
\`\`\``,
    },
    {
      id: "sparse-table",
      title: "Sparse table & O(1) range min/max",
      body: `For a **static** array and idempotent queries (min, max, gcd), a sparse table answers in \`O(1)\` after \`O(n log n)\` preprocessing — faster than a segment tree when there are no updates.

\`\`\`cpp
// Sparse table for range minimum: O(n log n) build, O(1) query on [l, r]
struct SparseTable {
  vector<vector<int>> st;
  vector<int> lg;
  SparseTable(const vector<int>& a) {
    int n = a.size(), K = 1;
    while ((1 << K) <= n) {
      K++;
    }
    lg.assign(n + 1, 0);
    for (int i = 2; i <= n; i++) {
      lg[i] = lg[i / 2] + 1;
    }
    st.assign(K, vector<int>(n));
    st[0] = a;
    for (int j = 1; j < K; j++) {
      for (int i = 0; i + (1 << j) <= n; i++) {
        st[j][i] = min(st[j - 1][i], st[j - 1][i + (1 << (j - 1))]);
      }
    }
  }
  int query(int l, int r) {  // inclusive
    int j = lg[r - l + 1];
    return min(st[j][l],
               st[j][r - (1 << j) + 1]);  // overlap is fine for min/max
  }
};
\`\`\`

Combined with an Euler tour, a sparse table gives \`O(1)\` LCA. For sums (not idempotent) use a Fenwick tree or prefix sums instead.`,
    },
    {
      id: "order-statistics",
      title: "Order-statistics & offline queries",
      body: `**Order-statistics tree (GNU pbds).** A drop-in balanced BST that answers "kth smallest" and "rank of x" in \`O(log n)\` — handy for dynamic medians and counting problems on Codeforces-style judges.

\`\`\`cpp
// GNU pbds order-statistics tree (kth-smallest / rank)
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
template <class T>
using ordered_set =
    tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>;
// os.find_by_order(k) -> iterator to the kth smallest (0-indexed)
// os.order_of_key(x)  -> count of elements strictly less than x
\`\`\`

**Fenwick on ranks.** Count of Smaller Numbers After Self (LC 315) and Count of Range Sum (LC 327): compress values, sweep, and query prefix counts — or use a merge-sort that counts cross-pair inversions.

**Mo's algorithm.** For *offline* range queries with cheap incremental add/remove, sort queries by \`sqrt(n)\` blocks and shuffle two pointers across them in \`O((n + q)·sqrt(n))\`.

\`\`\`cpp
// Mo's algorithm skeleton: fill add()/remove() with the query-specific
// aggregate
struct Query {
  int l, r, idx;
};
vector<long long> mo(int n, vector<Query>& qs) {
  int B = max(1, (int)sqrt((double)n));
  sort(qs.begin(), qs.end(), [&](const Query& x, const Query& y) {
    if (x.l / B != y.l / B) {
      return x.l / B < y.l / B;
    }
    return (x.l / B & 1) ? x.r > y.r : x.r < y.r;  // snake order
  });
  vector<long long> ans(qs.size());
  long long cur = 0;
  int curL = 0, curR = -1;
  auto add = [&](int i) { /* fold a[i] into cur */ };
  auto remove = [&](int i) { /* remove a[i] from cur */ };
  for (auto& q : qs) {
    while (curR < q.r) {
      add(++curR);
    }
    while (curL > q.l) {
      add(--curL);
    }
    while (curR > q.r) {
      remove(curR--);
    }
    while (curL < q.l) {
      remove(curL++);
    }
    ans[q.idx] = cur;
  }
  return ans;
}
\`\`\``,
    },
    {
      id: "advanced-structures",
      title: "Advanced structures (hard problems)",
      body: `**LRU / LFU caches.** A hash map of \`key → list iterator\` plus a doubly linked list gives \`O(1)\` get/put.

\`\`\`cpp
// LRU Cache (LC 146): list front = most-recently-used
class LRUCache {
  int cap;
  list<pair<int, int>> dll;
  unordered_map<int, list<pair<int, int>>::iterator> pos;

 public:
  LRUCache(int capacity) : cap(capacity) {}
  int get(int key) {
    auto it = pos.find(key);
    if (it == pos.end()) {
      return -1;
    }
    dll.splice(dll.begin(), dll, it->second);  // promote to front
    return it->second->second;
  }
  void put(int key, int value) {
    auto it = pos.find(key);
    if (it != pos.end()) {
      it->second->second = value;
      dll.splice(dll.begin(), dll, it->second);
      return;
    }
    if ((int)dll.size() == cap) {
      pos.erase(dll.back().first);
      dll.pop_back();
    }
    dll.push_front({key, value});
    pos[key] = dll.begin();
  }
};
\`\`\`

**Sweep line + balanced multiset / heap.** The Skyline Problem (LC 218), Rectangle Area II (LC 850, segment tree over compressed y-coordinates), and My Calendar series (LC 729/731/732) sweep events and maintain active intervals.

**Interval / range structures.** Range Module (LC 715) keeps disjoint intervals in an ordered \`map\`. SUMMARY: when a problem mixes range updates with range queries, escalate prefix sum → Fenwick → segment tree (lazy) → segment tree beats / persistent segment tree as the query power grows.

**Merge-sort tree & persistent segment tree** answer "kth smallest in a subarray" / "count ≤ x in [l, r]" offline or online in \`O(log^2 n)\` / \`O(log n)\`.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Structure | Query | Update | Space |
| --- | --- | --- | --- |
| Prefix sum | \`O(1)\` | rebuild | \`O(n)\` |
| Hash map/set | \`O(1)\` avg | \`O(1)\` avg | \`O(n)\` |
| Heap | \`O(1)\` top | \`O(log n)\` | \`O(n)\` |
| DSU | \`O(α(n))\` | \`O(α(n))\` | \`O(n)\` |
| Fenwick | \`O(log n)\` | \`O(log n)\` | \`O(n)\` |
| Segment tree (lazy) | \`O(log n)\` | \`O(log n)\` | \`O(n)\` |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Structure |
| --- | --- | --- |
| 1 / 49 | [Two Sum](https://leetcode.cn/problems/two-sum) / [Group Anagrams](https://leetcode.cn/problems/group-anagrams) | hash map |
| 23 | [Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists) | heap |
| 206 / 141 | [Reverse List](https://leetcode.cn/problems/reverse-linked-list) / [Cycle](https://leetcode.cn/problems/linked-list-cycle) | linked-list pointers |
| 215 | [Kth Largest](https://leetcode.cn/problems/kth-largest-element-in-an-array) | heap |
| 295 | [Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream) | two heaps |
| 304 | [Range Sum Query 2D](https://leetcode.cn/problems/range-sum-query-2d-immutable) | 2D prefix sum |
| 307 | [Range Sum Query - Mutable](https://leetcode.cn/problems/range-sum-query-mutable) | Fenwick / segment tree |
| 315 | [Count of Smaller After Self](https://leetcode.cn/problems/count-of-smaller-numbers-after-self) | Fenwick / merge sort |
| 547 | [Number of Provinces](https://leetcode.cn/problems/number-of-provinces) | DSU |
| 560 | [Subarray Sum Equals K](https://leetcode.cn/problems/subarray-sum-equals-k) | prefix sum + hash |
| 684 | [Redundant Connection](https://leetcode.cn/problems/redundant-connection) | DSU cycle detect |

**Advanced practice problems**

| ID | Problem | Structure |
| --- | --- | --- |
| 146 | [LRU Cache](https://leetcode.cn/problems/lru-cache) | hash map + linked list |
| 218 | [The Skyline Problem](https://leetcode.cn/problems/the-skyline-problem) | sweep line + heap |
| 715 | [Range Module](https://leetcode.cn/problems/range-module) | ordered interval map |
| 1157 | [Online Majority Element In Subarray](https://leetcode.cn/problems/online-majority-element-in-subarray) | merge-sort tree |
| 2080 | [Range Frequency Queries](https://leetcode.cn/problems/range-frequency-queries) | per-value binary search |
| 2286 | [Booking Concert Tickets in Groups](https://leetcode.cn/problems/booking-concert-tickets-in-groups) | segment tree |
| 2736 | [Maximum Sum Queries](https://leetcode.cn/problems/maximum-sum-queries) | offline + monotonic stack / BIT |

**Recent medium problems**

| ID | Problem | Rating | Structure |
| --- | --- | --- | --- |
| 3739 | [Count Subarrays With Majority Element II](https://leetcode.cn/problems/count-subarrays-with-majority-element-ii) | 2090 | Fenwick / segment tree |
| 3624 | [Number of Integers With Popcount-Depth Equal to K II](https://leetcode.cn/problems/number-of-integers-with-popcount-depth-equal-to-k-ii) | 2086 | segment tree |
| 3645 | [Maximum Total From Optimal Activation Order](https://leetcode.cn/problems/maximum-total-from-optimal-activation-order) | 2019 | heap (priority queue) |
| 3508 | [Implement Router](https://leetcode.cn/problems/implement-router) | 1851 | design + ordered set |
| 3408 | [Design Task Manager](https://leetcode.cn/problems/design-task-manager) | 1807 | heap / ordered set |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **1-indexing for Fenwick** is mandatory (\`i & -i\` needs index ≥ 1).
- **Coordinate-compress** large/sparse values before using Fenwick or segment trees.
- **\`unordered_map\` worst case** is \`O(n)\` per op under hash collisions; switch to \`map\` or salt the hash if attacked.
- **Heap comparator direction** is easy to flip — \`greater<>\` makes a *min*-heap.
- **DSU "by value"**: remember to map values to compact indices.
- **Segment tree size** is \`4n\`; forgetting \`push\` before recursing corrupts lazy state.`,
    },
  ],
};
