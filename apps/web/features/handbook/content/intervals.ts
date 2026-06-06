import type { HandbookTopic } from "../model";

export const intervals: HandbookTopic = {
  slug: "intervals",
  title: "Intervals",
  tagline:
    "Sort the endpoints, then sweep — merge overlaps, schedule the most jobs, and count peak concurrency with a single linear pass.",
  icon: "CalendarRange",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `An **interval** is a pair $[s, e)$ (or $[s, e]$) on a number line — a meeting, a balloon, a booking, a road segment. Almost every interval problem reduces to one move: **sort by an endpoint, then make a single linear pass**, keeping a tiny bit of state (the current block's end, the last kept interval, or a running count of active intervals). Once the data is ordered, two intervals overlap iff one starts before the other ends, so a sweep settles overlap, merging, and concurrency questions in $O(n \\log n)$ dominated by the sort.

Signals that you are looking at an interval problem:

- "**merge** overlapping intervals" or "**insert** a new interval and merge"
- "do these ranges **overlap**?", "find the **intersection** of two lists"
- "**maximum number of non-overlapping** intervals", "minimum **removals** / **arrows**"
- "**minimum number of rooms / platforms / machines**", "maximum concurrent …"
- "apply many **range updates**", "car pooling", "+1 over a span"

The two engines below cover nearly all of them: **sort + linear merge/scan** for merging and greedy scheduling, and **sweep line / difference array** for concurrency and range updates.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- [Sorting](/handbook/sorting) with a custom comparator — sort by start *or* by end depending on the goal.
- [Greedy](/handbook/greedy) reasoning and the exchange argument that justifies "sort by end" for scheduling.
- [Heap & Priority Queue](/handbook/heap-priority-queue) for the min-rooms-by-heap variant and for keeping the earliest-finishing active interval.

Also handy: prefix sums for the difference-array form of range updates, and a comfort with half-open intervals $[s, e)$ to dodge off-by-one bugs at the endpoints.`,
    },
    {
      id: "overlap-test",
      title: "Do two intervals overlap?",
      body: `:::example Overlap test for two intervals
Before any sweep, the atomic question is whether **two** intervals touch at all — and that needs no sorting. Two closed intervals \`[a, b]\` and \`[c, d]\` overlap exactly when **each one starts at or before the other ends**, i.e. \`a <= d && c <= b\`. The symmetric phrasing is the easy way to remember it: they are *disjoint* only if one ends entirely before the other starts (\`b < c\` or \`d < a\`), so negating that gives the test below.

\`\`\`cpp
// Do closed intervals [a, b] and [c, d] overlap?
bool overlap(vector<int>& x, vector<int>& y) {
  // Each interval must start at or before the other ends.
  return x[0] <= y[1] && y[0] <= x[1];  // use < on both for strict crossing (no touching)
}
\`\`\`
:::

Whether touching endpoints count is a deliberate choice: with \`<=\`, \`[1, 2]\` and \`[2, 3]\` overlap; with \`<\` they do not. Keep that choice consistent everywhere you test overlap. When you also need *how much* they share, intersect them directly — the common part is \`[max(starts), min(ends)]\`, which is non-empty precisely when \`max(starts) <= min(ends)\`. Clamping the width at zero turns the same formula into an overlap-length helper that the merge, intersection, and sweep patterns below all reuse.

\`\`\`cpp
// Overlap length (0 when disjoint); the intersection is [lo, hi].
int overlapLength(vector<int>& x, vector<int>& y) {
  int lo = max(x[0], y[0]);
  int hi = min(x[1], y[1]);
  return max(0, hi - lo);  // hi - lo can be negative when they miss
}
\`\`\``,
    },
    {
      id: "merge",
      title: "Sort by start, then merge",
      body: `:::example Merge Intervals (LC 56)
Sort by start so overlapping intervals become adjacent. Keep the current merged block; if the next interval starts at or before the block's end, **extend** the block to the max of the two ends, otherwise **flush** the block and open a new one.

\`\`\`cpp
// Merge overlapping intervals (LC 56)
vector<vector<int>> merge(vector<vector<int>>& iv) {
  sort(iv.begin(), iv.end());  // by start, then end
  vector<vector<int>> out;
  for (auto& x : iv) {
    if (!out.empty() && x[0] <= out.back()[1]) {
      out.back()[1] = max(out.back()[1], x[1]);  // overlap -> extend
    } else {
      out.push_back(x);  // disjoint -> start a new block
    }
  }
  return out;
}
\`\`\`
:::

The same scan answers "do any two intervals overlap?" (LC 252 Meeting Rooms I): sort by start and report a clash the moment some \`x[0] < prev_end\`. Use \`<=\` when touching intervals like \`[1,2]\` and \`[2,3]\` should merge; use \`<\` when they only count as overlapping if they truly cross.`,
    },
    {
      id: "insert",
      title: "Insert into a sorted interval list",
      body: `:::example Insert Interval (LC 57)
When the existing list is already sorted and non-overlapping, you do not need a full re-sort. Walk in three phases: copy every interval that ends before the new one starts, **absorb** every interval that overlaps the new one (widening it), then copy the rest.

\`\`\`cpp
// Insert and merge a new interval into a sorted list (LC 57)
vector<vector<int>> insert(vector<vector<int>>& iv, vector<int> nw) {
  vector<vector<int>> out;
  int i = 0, n = iv.size();
  while (i < n && iv[i][1] < nw[0]) out.push_back(iv[i++]);  // strictly left
  while (i < n && iv[i][0] <= nw[1]) {                       // overlapping
    nw[0] = min(nw[0], iv[i][0]);
    nw[1] = max(nw[1], iv[i][1]);
    i++;
  }
  out.push_back(nw);
  while (i < n) out.push_back(iv[i++]);  // strictly right
  return out;
}
\`\`\`
:::

This linear merge is also the backbone of Interval List Intersections (LC 986): advance two sorted pointers, and for the pair (i, j) the overlap is \`[max(start), min(end)]\`, which is non-empty exactly when \`max(start) <= min(end)\`; then drop whichever interval ends first.`,
    },
    {
      id: "scheduling",
      title: "Interval scheduling: sort by end (greedy)",
      body: `:::example Non-overlapping Intervals (LC 435)
To keep the **maximum number of mutually non-overlapping** intervals, sort by **end** time and greedily accept any interval that starts at or after the last accepted end. Finishing earliest leaves the most room for the rest — the classic exchange argument. The minimum number to *remove* is then \`n - kept\`.

\`\`\`cpp
// Max non-overlapping intervals; LC 435 wants the removal count
int eraseOverlapIntervals(vector<vector<int>>& iv) {
  sort(iv.begin(), iv.end(),
       [](auto& a, auto& b) { return a[1] < b[1]; });  // by end
  int kept = 0, end = INT_MIN;
  for (auto& x : iv) {
    if (x[0] >= end) {  // no clash with the last kept -> take it
      kept++;
      end = x[1];
    }
  }
  return (int)iv.size() - kept;
}
\`\`\`
:::

Minimum Number of Arrows to Burst Balloons (LC 452) is the mirror image: sort by end, fire an arrow at each new end, and that arrow pops every balloon whose start is \`<= end\`. The count of arrows equals the count of non-overlapping groups, so it is the same greedy with the count reported instead of the removals. Watch the comparator for overflow — compare with \`a[1] < b[1]\` rather than subtracting.`,
    },
    {
      id: "sweep",
      title: "Sweep line & difference on events",
      body: `:::example Meeting Rooms II (LC 253)
The **minimum number of rooms** equals the **maximum concurrency** — the largest number of intervals alive at any instant. Split each interval into a \`+1\` start event and a \`-1\` end event, sort both endpoint arrays, then sweep two pointers: every time a meeting starts before the earliest end frees up, you need another room.

\`\`\`cpp
// Minimum meeting rooms via two sorted endpoint arrays (LC 253)
int minMeetingRooms(vector<vector<int>>& iv) {
  int n = iv.size();
  vector<int> starts(n), ends(n);
  for (int i = 0; i < n; i++) {
    starts[i] = iv[i][0];
    ends[i] = iv[i][1];
  }
  sort(starts.begin(), starts.end());
  sort(ends.begin(), ends.end());
  int rooms = 0, best = 0, j = 0;
  for (int i = 0; i < n; i++) {
    while (j < n && ends[j] <= starts[i]) j++;  // a room freed before this start
    rooms = i - j + 1;                           // active = started - finished
    best = max(best, rooms);
  }
  return best;
}
\`\`\`
:::

The heap variant says the same thing differently: sort by start, push each meeting's end onto a min-heap, and pop the earliest end whenever it is \`<=\` the current start; the heap's peak size is the answer.

:::example Car Pooling (LC 1094)
For pure **range updates** — add a value over $[s, e)$ many times, then ask for the maximum (or final) — skip per-element loops and use a **difference array**: add the delta at the start index and subtract it at the end index, then take a prefix sum. Each booking is $O(1)$ and one sweep validates the whole timeline.

\`\`\`cpp
// Car pooling: capacity check via a difference array over locations (LC 1094)
bool carPooling(vector<vector<int>>& trips, int capacity) {
  int diff[1001] = {0};
  for (auto& t : trips) {
    diff[t[1]] += t[0];  // passengers board at from
    diff[t[2]] -= t[0];  // and leave at to (half-open end)
  }
  int load = 0;
  for (int i = 0; i <= 1000; i++) {
    load += diff[i];               // running concurrency
    if (load > capacity) return false;
  }
  return true;
}
\`\`\`
:::

Corporate Flight Bookings (LC 1109) is the same difference-array trick for "sum of all updates"; My Calendar / Range Module (LC 729, 731, 715) generalize the sweep to dynamic insertions with an ordered map of events.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Merge overlaps | "merge overlapping intervals" | sort by start, extend the current block | [Merge Intervals](https://leetcode.cn/problems/merge-intervals) |
| Insert + merge | "insert into a sorted list" | three-phase linear merge | [Insert Interval](https://leetcode.cn/problems/insert-interval) |
| Max non-overlapping | "keep the most / remove the fewest" | sort by end, greedy accept | [Non-overlapping Intervals](https://leetcode.cn/problems/non-overlapping-intervals) |
| Point covering | "minimum arrows / points to stab all" | sort by end, shoot at each end | [Burst Balloons (arrows)](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons) |
| Peak concurrency | "minimum rooms / platforms" | sweep two endpoint arrays or min-heap | [Meeting Rooms II](https://leetcode.cn/problems/meeting-rooms-ii) |
| Range updates | "+v over many spans, then query" | difference array + prefix sum | [Car Pooling](https://leetcode.cn/problems/car-pooling) |
| Two-list intersection | "intersection of two sorted lists" | two pointers, take overlap | [Interval List Intersections](https://leetcode.cn/problems/interval-list-intersections) |
| Partition by reach | "split string into max parts" | track farthest needed end | [Partition Labels](https://leetcode.cn/problems/partition-labels) |`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Time | Space |
| --- | --- | --- |
| Sort + merge / scan | \`O(n log n)\` | \`O(n)\` output, \`O(1)\` extra |
| Insert into sorted list | \`O(n)\` | \`O(n)\` |
| Greedy scheduling (by end) | \`O(n log n)\` | \`O(1)\` |
| Sweep with two endpoint arrays | \`O(n log n)\` | \`O(n)\` |
| Min rooms via min-heap | \`O(n log n)\` | \`O(n)\` |
| Difference array (fixed range) | \`O(n + R)\` | \`O(R)\` |

The sort is the bottleneck almost everywhere; once the data is ordered, the sweep itself is linear. A difference array over a bounded coordinate range \`R\` avoids sorting entirely, and coordinate compression shrinks \`R\` when the values are sparse.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 56 | [Merge Intervals](https://leetcode.cn/problems/merge-intervals) | sort + merge |
| 57 | [Insert Interval](https://leetcode.cn/problems/insert-interval) | linear insert + merge |
| 435 | [Non-overlapping Intervals](https://leetcode.cn/problems/non-overlapping-intervals) | greedy by end |
| 452 | [Burst Balloons (arrows)](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons) | greedy by end |
| 253 | [Meeting Rooms II](https://leetcode.cn/problems/meeting-rooms-ii) | sweep / min-heap |
| 1094 | [Car Pooling](https://leetcode.cn/problems/car-pooling) | difference array |
| 1109 | [Corporate Flight Bookings](https://leetcode.cn/problems/corporate-flight-bookings) | difference array |
| 763 | [Partition Labels](https://leetcode.cn/problems/partition-labels) | farthest-reach sweep |
| 986 | [Interval List Intersections](https://leetcode.cn/problems/interval-list-intersections) | two pointers |
| 759 | [Employee Free Time](https://leetcode.cn/problems/employee-free-time) | merge then gaps |
| 218 | [The Skyline Problem](https://leetcode.cn/problems/the-skyline-problem) | sweep + max-heap |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Inclusive vs exclusive ends.** Decide up front whether \`[1,2]\` and \`[2,3]\` touch. Use \`<=\` to merge touching intervals, \`<\` to treat them as disjoint — and keep the choice consistent in the comparator and the merge test.
- **Sort key chooses the algorithm.** Sort by **start** to merge; sort by **end** to schedule / cover. Mixing them up gives a plausible but wrong answer.
- **Comparator overflow & ties.** Compare endpoints with \`a[1] < b[1]\`, never \`a[1] - b[1]\`, which can overflow \`int\`. Break ties deliberately when start and end collide.
- **Endpoint event ordering in a sweep.** When a meeting ends exactly when another starts, process the end before the start (treat the end as \`<=\` the start) so a freed room is reused — otherwise you over-count rooms.
- **Empty input.** Guard against an empty list before \`out.back()\`; return an empty result, \`0\` rooms, or the lone new interval as appropriate.
- **Half-open for range updates.** In a difference array, subtract the delta at the *end* index (exclusive); subtracting one step too late double-counts the boundary cell.`,
    },
  ],
};
