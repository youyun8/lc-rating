import type { HandbookTopic } from "../model";

export const heapPriorityQueue: HandbookTopic = {
  slug: "heap-priority-queue",
  title: "Heap & Priority Queue",
  tagline:
    "A binary heap keeps the best element one pop away — the engine behind top-K, running medians, k-way merges, and greedy scheduling.",
  icon: "TrendingUp",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A **binary heap** is a complete binary tree stored in an array where every parent dominates its children. It is the go-to structure whenever you must *repeatedly pull the best element* without paying to keep everything fully sorted. In C++ \`std::priority_queue\` is a **max-heap by default**:

\`\`\`cpp
// Max-heap (default): pq.top() is the largest
priority_queue<int> maxHeap;
// Min-heap: pass the greater<> comparator
priority_queue<int, vector<int>, greater<int>> minHeap;
\`\`\`

Costs: \`push\` and \`pop\` are \`O(log n)\`, reading \`pq.top()\` is \`O(1)\`, and **heapifying** an existing array of \`n\` elements is \`O(n)\` (cheaper than \`n\` separate pushes). A heap gives you a *partial* order — only the extreme is cheap to reach — which is exactly enough for "always pick the best next" problems and far cheaper than re-sorting.

Signals that a heap is the right tool:

- "find the **k-th largest / smallest**" — keep a size-\`k\` heap
- "**top-k frequent / closest / largest**" items
- "**running median** of a stream" — split into two heaps
- "**merge k sorted** lists / arrays / the k smallest pairs"
- "repeatedly take the **best (max/min) next** item, update it, push it back" — greedy scheduling
- the input *arrives as a stream* and you cannot sort it all up front`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comparison and how comparators shape order (a heap is built on top of one).
- Why a *partial* order beats a full sort when you only need the extreme — see [Sorting](/handbook/sorting).
- The \`priority_queue\` adapter and the broader toolbox in [Data Structures](/handbook/data-structures).
- Pointer choreography for node-based merges in [Linked List](/handbook/linked-list).

A heap and a sort solve overlapping problems; reach for a heap when \`k \\ll n\`, when data streams in, or when each pop *changes* what should come next.`,
    },
    {
      id: "top-k",
      title: "Top-K with a size-k heap",
      body: `To find the **k-th largest** element, keep a **min-heap of size k**: push everything, and whenever the heap exceeds \`k\` elements pop the smallest. The heap then holds the \`k\` largest seen so far, and its top is the k-th largest. This costs \`O(n log k)\` and \`O(k)\` space — strictly better than the \`O(n log n)\` of a full sort when \`k\` is small. (Mirror it — a max-heap of size \`k\` — for the k-th *smallest*.)

:::example Kth Largest Element in an Array (LC 215)
The min-heap caps its size at \`k\`, so each of the \`n\` pushes/pops is \`O(log k)\` rather than \`O(log n)\`.

\`\`\`cpp
// Kth largest via a size-k min-heap (LC 215)
int findKthLargest(vector<int>& nums, int k) {
  priority_queue<int, vector<int>, greater<int>> pq;  // min-heap
  for (int x : nums) {
    pq.push(x);
    if ((int)pq.size() > k) {
      pq.pop();  // drop the smallest -> keep the k largest
    }
  }
  return pq.top();  // smallest among the k largest = k-th largest
}
\`\`\`
:::

The same size-k idea handles **Top K Frequent Elements** (LC 347): count frequencies in a hash map, then keep a size-\`k\` min-heap keyed on frequency so the \`k\` most frequent survive.

:::example Top K Frequent Elements (LC 347)
The heap stores (frequency, value) pairs; the comparator orders by frequency, and capping at size \`k\` keeps the cost at \`O(n log k)\`.

\`\`\`cpp
// Top k frequent elements via a size-k min-heap on frequency (LC 347)
vector<int> topKFrequent(vector<int>& nums, int k) {
  unordered_map<int, int> freq;
  for (int x : nums) freq[x]++;
  // min-heap of (count, value); pop the least frequent when over size k
  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
  for (auto& [val, cnt] : freq) {
    pq.push({cnt, val});
    if ((int)pq.size() > k) {
      pq.pop();
    }
  }
  vector<int> res;
  while (!pq.empty()) {
    res.push_back(pq.top().second);
    pq.pop();
  }
  return res;
}
\`\`\`
:::

The same pattern solves **K Closest Points to Origin** (LC 973) — keep a size-\`k\` max-heap on squared distance so the \`k\` nearest points remain.`,
    },
    {
      id: "two-heaps",
      title: "Two heaps: running median & balanced splits",
      body: `Some problems need the **middle** of a dataset, not its extreme. Split the values into a **max-heap for the lower half** and a **min-heap for the upper half**, keeping their sizes balanced to within one. The median is then either the top of the larger heap or the average of both tops — all in \`O(log n)\` per insertion.

:::example Find Median from Data Stream (LC 295)
Push each number into the low half, shift its top to the high half, then rebalance so the low half never gets smaller than the high half. The two tops straddle the median.

\`\`\`cpp
// Streaming median with two heaps (LC 295)
class MedianFinder {
  priority_queue<int> lo;                              // max-heap (low half)
  priority_queue<int, vector<int>, greater<int>> hi;  // min-heap (high half)

 public:
  void addNum(int num) {
    lo.push(num);
    hi.push(lo.top());  // route through to keep halves ordered
    lo.pop();
    if (hi.size() > lo.size()) {  // keep lo >= hi in size
      lo.push(hi.top());
      hi.pop();
    }
  }
  double findMedian() {
    if (lo.size() > hi.size()) return lo.top();
    return (lo.top() + hi.top()) / 2.0;
  }
};
\`\`\`
:::

The "two heaps facing opposite directions" idea also powers **IPO**-style problems (LC 502): a **min-heap on capital** gates which projects are affordable, and as the budget grows you pour every newly affordable project into a **max-heap on profit**, then greedily take the most profitable available project up to \`k\` times. **Sliding Window Median** (LC 480) is the same two-heap median with lazy deletion as the window slides.`,
    },
    {
      id: "k-way-merge",
      title: "K-way merge",
      body: `To merge \`k\` sorted sequences, hold **one frontier element from each sequence** in a min-heap. Repeatedly pop the global minimum and push that sequence's next element. With \`N\` total elements the merge is \`O(N log k)\` — the heap size is bounded by the number of *sequences*, not the total length.

:::example Merge k Sorted Lists (LC 23)
The heap holds the current head of every non-empty list; popping the smallest head and pushing its successor reconstructs the merged list in sorted order.

\`\`\`cpp
// Merge k sorted linked lists with a size-k min-heap (LC 23)
ListNode* mergeKLists(vector<ListNode*>& lists) {
  auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
  priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
  for (ListNode* node : lists) {
    if (node) pq.push(node);
  }
  ListNode dummy, *tail = &dummy;
  while (!pq.empty()) {
    ListNode* node = pq.top();
    pq.pop();
    tail->next = node;
    tail = node;
    if (node->next) pq.push(node->next);  // advance that list's frontier
  }
  return dummy.next;
}
\`\`\`
:::

The frontier idea generalizes from "k lists" to "an implicit grid of candidates":

:::example Find K Pairs with Smallest Sums (LC 373)
Treat pair sums as a grid where row \`i\` (from \`nums1\`) and column \`j\` (from \`nums2\`) give sum \`nums1[i] + nums2[j]\`. Seed the heap with the first column, and when you pop (i, j) push its neighbour (i, j + 1) — the frontier walks rightward through the sorted grid.

\`\`\`cpp
// k pairs with smallest sums (LC 373): heap over a sorted grid frontier
vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2,
                                   int k) {
  // min-heap of (sum, i, j)
  priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>,
                 greater<>>
      pq;
  for (int i = 0; i < (int)nums1.size() && i < k; i++) {
    pq.push({nums1[i] + nums2[0], i, 0});  // first column
  }
  vector<vector<int>> res;
  while (!pq.empty() && (int)res.size() < k) {
    auto [sum, i, j] = pq.top();
    pq.pop();
    res.push_back({nums1[i], nums2[j]});
    if (j + 1 < (int)nums2.size()) {
      pq.push({nums1[i] + nums2[j + 1], i, j + 1});  // push neighbour
    }
  }
  return res;
}
\`\`\`
:::

**Kth Smallest Element in a Sorted Matrix** (LC 378) is the same frontier walk over rows of a row-and-column sorted matrix: seed the heap with the first column and pop \`k\` times. (When \`k\` is huge, binary search on the value can beat the heap — see Pitfalls.)`,
    },
    {
      id: "greedy-heap",
      title: "Greedy scheduling with a heap",
      body: `Many greedy algorithms repeat the loop *take the best available item, transform it, and push the result back*. A heap makes "best available" cheap, and because the set changes after each step you cannot just pre-sort once.

:::example Last Stone Weight (LC 1046)
Repeatedly smash the two heaviest stones; the difference (if any) goes back in. A max-heap surfaces the two largest in \`O(log n)\` each round.

\`\`\`cpp
// Last stone weight: always smash the two heaviest (LC 1046)
int lastStoneWeight(vector<int>& stones) {
  priority_queue<int> pq(stones.begin(), stones.end());  // max-heap, O(n) build
  while (pq.size() > 1) {
    int a = pq.top();
    pq.pop();
    int b = pq.top();
    pq.pop();
    if (a != b) pq.push(a - b);  // remainder rejoins the pile
  }
  return pq.empty() ? 0 : pq.top();
}
\`\`\`
:::

The same "pull the largest, combine, push back" loop appears in **Minimum Cost to Connect Sticks / Ropes** (LC 1167): a **min-heap** repeatedly merges the two cheapest ropes (paying their sum) until one remains — Huffman's algorithm in disguise, \`O(n log n)\`.

:::example Task Scheduler (LC 621)
With cooldown \`n\` between identical tasks, greedily run the **most frequent** remaining task each tick. A max-heap on remaining counts, paired with a short cooldown queue, schedules optimally.

\`\`\`cpp
// Task scheduler with cooldown n: run the most frequent task each tick (LC 621)
int leastInterval(vector<char>& tasks, int n) {
  int freq[26] = {0};
  for (char c : tasks) freq[c - 'A']++;
  priority_queue<int> pq;  // max-heap of remaining counts
  for (int f : freq) {
    if (f > 0) pq.push(f);
  }
  int time = 0;
  while (!pq.empty()) {
    vector<int> cooling;  // tasks run this cycle, awaiting cooldown
    for (int i = 0; i <= n; i++) {     // one cooldown window of length n+1
      if (!pq.empty()) {
        int cnt = pq.top();
        pq.pop();
        if (cnt - 1 > 0) cooling.push_back(cnt - 1);
      }
      time++;
      if (pq.empty() && cooling.empty()) break;  // nothing left to schedule
    }
    for (int c : cooling) pq.push(c);  // requeue after the window
  }
  return time;
}
\`\`\`
:::

**Reorganize String** (LC 767) and **Rearrange String k Distance Apart** (LC 358) reuse the very same "emit the most frequent feasible item, then cool it down" loop.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Top-K | "k-th largest / smallest", "top k frequent" | size-\`k\` min-heap (max-heap for k-th smallest) | [Kth Largest Element](https://leetcode.cn/problems/kth-largest-element-in-an-array) |
| Streaming top-K | k-th element of a *stream* | maintain a size-\`k\` heap across adds | [Kth Largest in a Stream](https://leetcode.cn/problems/kth-largest-element-in-a-stream) |
| Two heaps | "running / sliding median", "balanced split" | max-heap (low) + min-heap (high), rebalance | [Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream) |
| Capital / profit split | "do k projects under a budget" | min-heap gate + max-heap of affordable | [IPO](https://leetcode.cn/problems/ipo) |
| K-way merge | "merge k sorted", "k smallest pairs" | heap of one frontier per sequence | [Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists) |
| Sorted-grid frontier | "kth smallest in a sorted matrix" | seed first column, push neighbours | [Kth Smallest in a Sorted Matrix](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix) |
| Greedy scheduling | "pick the best next, update, repeat" | max/min-heap, push the transformed item back | [Task Scheduler](https://leetcode.cn/problems/task-scheduler) |
| Merge-to-one | "combine two cheapest until one left" | min-heap, push the merged cost back | [Minimum Cost to Connect Sticks](https://leetcode.cn/problems/minimum-cost-to-connect-sticks) |`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation / pattern | Time | Space |
| --- | --- | --- |
| \`push\` / \`pop\` | \`O(log n)\` | — |
| \`top\` (peek) | \`O(1)\` | — |
| Build heap from \`n\` items | \`O(n)\` | \`O(n)\` |
| K-th largest (size-k heap) | \`O(n log k)\` | \`O(k)\` |
| Top-k frequent | \`O(n log k)\` | \`O(n)\` |
| Two-heap median (per add) | \`O(log n)\` | \`O(n)\` |
| Merge k sorted (N total) | \`O(N log k)\` | \`O(k)\` |
| Greedy scheduling | \`O(n log n)\` | \`O(n)\` |

A full sort is \`O(n log n)\`; the heap wins when \`k \\ll n\`, when only the extreme is needed each step, or when data streams in and cannot be sorted up front.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 215 | [Kth Largest Element in an Array](https://leetcode.cn/problems/kth-largest-element-in-an-array) | top-K heap |
| 347 | [Top K Frequent Elements](https://leetcode.cn/problems/top-k-frequent-elements) | top-K heap |
| 692 | [Top K Frequent Words](https://leetcode.cn/problems/top-k-frequent-words) | top-K heap + tie-break |
| 703 | [Kth Largest Element in a Stream](https://leetcode.cn/problems/kth-largest-element-in-a-stream) | streaming size-k heap |
| 295 | [Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream) | two heaps |
| 502 | [IPO](https://leetcode.cn/problems/ipo) | two heaps (capital/profit) |
| 23 | [Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists) | k-way merge |
| 378 | [Kth Smallest in a Sorted Matrix](https://leetcode.cn/problems/kth-smallest-element-in-a-sorted-matrix) | sorted-grid frontier |
| 373 | [Find K Pairs with Smallest Sums](https://leetcode.cn/problems/find-k-pairs-with-smallest-sums) | sorted-grid frontier |
| 1046 | [Last Stone Weight](https://leetcode.cn/problems/last-stone-weight) | greedy max-heap |
| 621 | [Task Scheduler](https://leetcode.cn/problems/task-scheduler) | greedy scheduling |
| 264 | [Ugly Number II](https://leetcode.cn/problems/ugly-number-ii) | k-way merge / heap |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Min vs max heap is the #1 bug.** \`priority_queue<int>\` is a *max*-heap; for a min-heap you must write \`priority_queue<int, vector<int>, greater<int>>\`. Remember the comparator is "reversed": \`greater<>\` puts the smallest on top.
- **Size-k pruning direction.** For the k-th *largest* keep a *min*-heap of size \`k\` (pop the smallest); for the k-th *smallest* keep a *max*-heap of size \`k\`. Mixing these up returns the wrong end.
- **Tie-breaking.** When equal priorities must order by a secondary key (e.g. LC 692, alphabetical on equal frequency), encode it in the comparator — heaps are *not* stable, so equal elements pop in arbitrary order otherwise.
- **Lambda comparators need the instance.** \`priority_queue<T, vector<T>, decltype(cmp)> pq(cmp);\` — passing \`cmp\` to the constructor is required; forgetting it fails to compile or default-constructs garbage.
- **Build in \`O(n)\`, not \`O(n log n)\`.** Construct from a range — \`priority_queue<int> pq(v.begin(), v.end())\` — instead of pushing one element at a time when you already have all the data.
- **No random access or decrease-key.** \`std::priority_queue\` cannot update or erase an interior element; use *lazy deletion* (push the new value, skip stale tops) or switch to a balanced \`set\`/ordered set.
- **When sorting beats a heap.** If you need *all* elements in order, or \`k\` is close to \`n\`, a single \`O(n log n)\` sort is simpler and often faster than \`n\` heap operations. For "k-th smallest in a sorted matrix" with large \`k\`, binary search on the value can beat the frontier heap.`,
    },
  ],
};
