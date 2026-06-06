import type { HandbookTopic } from "../model";

export const lineSweeping: HandbookTopic = {
  slug: "line-sweeping",
  title: "Line Sweeping",
  tagline:
    "Turn intervals, points, and rectangles into ordered events; sweep once while maintaining the active state.",
  icon: "Layers",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `**Line sweeping** is the pattern of sorting all relevant moments on one axis, then walking from left to right while maintaining the objects currently active at that position. It is the natural upgrade from basic interval merging when the question asks for peak concurrency, coverage, active minimum/maximum, or geometry over rectangles.

Signals that a sweep may fit:

- intervals start and end over time, and you need a maximum active count.
- queries ask "which interval covers this point?" or "how many ranges cover this coordinate?"
- many range additions can be delayed until one final scan.
- rectangles contribute area, perimeter, or coverage after projecting onto one axis.
- endpoints are huge but only the input coordinates matter, suggesting coordinate compression.

The core recipe is always the same:

1. Convert each object into one or more **events**.
2. Sort events by coordinate, with deliberate tie-breaking.
3. Sweep in order, updating an **active state** such as a counter, heap, balanced set, or segment tree.
4. Read the answer either at events or over the gap between consecutive coordinates.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- [Intervals](/handbook/intervals) for overlap rules, half-open ranges, and the basic merge scan.
- [Sorting](/handbook/sorting) for custom event ordering and stable tie-breaking.
- [Heap & Priority Queue](/handbook/heap-priority-queue) for active intervals where the best ending time or smallest id matters.
- [Range Queries & Offline Algorithms](/handbook/range-queries-offline) for coordinate compression, Fenwick trees, segment trees, and offline query order.`,
    },
    {
      id: "pattern-catalog",
      title: "Pattern catalog",
      body: `Most sweep-line problems are one of these shapes. The fastest way to choose an implementation is to identify **what changes at an event** and **what must be queried from the active set**.

| Pattern | Event shape | Active state | Typical answer |
| --- | --- | --- | --- |
| Peak concurrency | \`(time, +1/-1)\` | counter | maximum active intervals |
| Difference coverage | \`l += v\`, \`r + 1 -= v\` | prefix sum over events | final value / covered length |
| Offline point queries | intervals + query points sorted together | heap or endpoint counts | best/count covering each point |
| Reusable resource assignment | arrivals and departures | min-heap of free ids + busy heap | smallest available room/chair |
| Dynamic calendar | online interval additions | ordered map of deltas | current maximum overlap |
| Rectangle union | vertical enter/leave edges | compressed y segment tree | covered area over x-gaps |
| Skyline | building edges | active height multiset | key points when max height changes |

Two questions usually settle the design:

1. **Do I answer at event coordinates or over gaps?** Point queries and maximum active count answer *at* events. Coverage length and rectangle area answer over the gap between consecutive coordinates.
2. **Can events be processed offline?** If yes, sort everything once. If bookings arrive online, maintain an ordered delta map or a segment tree that supports incremental updates.`,
    },
    {
      id: "event-ordering",
      title: "Event ordering and tie-breaking",
      body: `For a pure active-count sweep, encode every start as \`+1\` and every end as \`-1\`. The tie rule depends on interval semantics:

- For half-open intervals \`[start, end)\`, an ending event at time \`t\` should be processed before a starting event at \`t\`, because the resource is reusable.
- For closed intervals \`[start, end]\`, a start at \`t\` and an end at \`t\` overlap, so process starts before ends or shift the end to \`end + 1\`.

:::example Meeting Rooms II style sweep
Sort by \`(time, delta)\` so \`-1\` events come before \`+1\` events at the same time. That implements half-open meetings and makes back-to-back meetings share a room.

\`\`\`cpp
// Peak number of active half-open intervals [start, end).
int MaxActive(vector<vector<int>>& intervals) {
  vector<pair<int, int>> events;
  for (const auto& interval : intervals) {
    events.push_back({interval[0], +1});
    events.push_back({interval[1], -1});
  }
  sort(events.begin(), events.end());  // end (-1) before start (+1) at ties

  int active = 0, best = 0;
  for (const auto& [time, delta] : events) {
    active += delta;
    best = max(best, active);
  }
  return best;
}
\`\`\`
::::

If the endpoint is inclusive and integer-valued, the difference-array version often writes \`diff[l] += 1\`, \`diff[r + 1] -= 1\` instead. That is the same sweep with a shifted closing event.`,
    },
    {
      id: "grouped-events",
      title: "Grouped events and gap accumulation",
      body: `When multiple events share the same coordinate, process them as a **group**. This prevents accidental intermediate answers at a coordinate where the active set is still changing, and it makes gap-based sweeps much easier to reason about.

There are two common read points:

- **Before applying events at x:** use the active state from \`prev\` to \`x\` to add length, area, or weighted cost.
- **After applying all events at x:** answer point queries located exactly at \`x\`, or update the current maximum active count.

:::example Accumulate covered length over gaps
For continuous intervals \`[l, r)\`, the covered length between adjacent event coordinates is \`x - prev\` whenever the active count is positive.

\`\`\`cpp
// Total covered length of half-open intervals [l, r).
long long UnionLength(vector<pair<int, int>>& intervals) {
  vector<pair<int, int>> events;
  for (const auto& [left, right] : intervals) {
    events.push_back({left, +1});
    events.push_back({right, -1});
  }
  sort(events.begin(), events.end());

  long long ans = 0;
  int active = 0, prev = events.empty() ? 0 : events[0].first;
  for (int i = 0; i < (int)events.size();) {
    int x = events[i].first;
    if (active > 0) {
      ans += x - prev;  // old active state covers [prev, x)
    }

    while (i < (int)events.size() && events[i].first == x) {
      active += events[i].second;
      ++i;
    }
    prev = x;
  }
  return ans;
}
\`\`\`
::::

This grouped form also removes most tie-breaking headaches: all starts and ends at the same coordinate are merged into the same delta before you inspect the new active state.`,
    },
    {
      id: "active-structures",
      title: "Active heaps and ordered sets",
      body: `Some sweeps need more than a count. If each query point needs the smallest covering interval, sweep all points in increasing order, push intervals whose start is now reachable, and lazily discard intervals whose end is already behind the query.

:::example Minimum Interval to Include Each Query (LC 1851)
The heap stores active intervals by length, then right endpoint. Sorting queries lets every interval enter the heap once and leave lazily.

\`\`\`cpp
// For each query point, return the length of the smallest interval covering it.
vector<int> MinInterval(vector<vector<int>>& intervals, vector<int>& queries) {
  sort(intervals.begin(), intervals.end());
  vector<pair<int, int>> indexed_queries;
  for (int i = 0; i < (int)queries.size(); ++i) {
    indexed_queries.push_back({queries[i], i});
  }
  sort(indexed_queries.begin(), indexed_queries.end());

  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>>
      active_intervals;
  vector<int> ans(queries.size(), -1);
  int i = 0;
  for (const auto& [query, id] : indexed_queries) {
    while (i < (int)intervals.size() && intervals[i][0] <= query) {
      int left = intervals[i][0];
      int right = intervals[i][1];
      active_intervals.push({right - left + 1, right});
      ++i;
    }
    while (!active_intervals.empty() && active_intervals.top().second < query) {
      active_intervals.pop();
    }
    if (!active_intervals.empty()) {
      ans[id] = active_intervals.top().first;
    }
  }
  return ans;
}
\`\`\`
::::

Use a heap when the only active item you need is the minimum or maximum. Use an ordered set when arbitrary deletions or rank queries are required. Use a segment tree when the active state is an aggregate over compressed coordinates.`,
    },
    {
      id: "resource-assignment",
      title: "Reusable resource assignment",
      body: `Resource assignment sweeps track two sets at once:

- **busy resources**, ordered by release time.
- **free resources**, ordered by resource id or priority.

Before assigning a resource to the next arrival, release everything whose end time is not later than the arrival time. Then take the smallest free resource, or create a new one if none is free.

:::example Smallest unoccupied chair pattern
This is the core of LC 1942. The busy heap stores \`(leaveTime, chair)\`; the free heap stores reusable chair ids.

\`\`\`cpp
// Assign the smallest available resource id to each arrival.
vector<int> AssignChairs(vector<pair<int, int>>& times) {
  vector<array<int, 3>> people;
  for (int i = 0; i < (int)times.size(); ++i) {
    people.push_back({times[i].first, times[i].second, i});
  }
  sort(people.begin(), people.end());

  priority_queue<int, vector<int>, greater<int>> free_ids;
  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> busy;
  vector<int> ans(times.size());
  int next_id = 0;

  for (const auto& [arrive, leave, person] : people) {
    while (!busy.empty() && busy.top().first <= arrive) {
      free_ids.push(busy.top().second);
      busy.pop();
    }

    int chair;
    if (free_ids.empty()) {
      chair = next_id++;
    } else {
      chair = free_ids.top();
      free_ids.pop();
    }
    ans[person] = chair;
    busy.push({leave, chair});
  }
  return ans;
}
\`\`\`
::::

The same template appears in meeting-room allocation, server assignment, CPU scheduling with release times, and any problem where an object becomes available again after its end event.`,
    },
    {
      id: "coordinate-compression",
      title: "Coordinate compression and difference sweeps",
      body: `When coordinates are huge but only endpoints matter, compress them before sweeping. For integer coverage over small inclusive ranges, a plain difference array is enough; for large ranges, collect \`l\` and \`r + 1\`, sort unique, then sweep compressed gaps.

:::example Range coverage by difference events
This style is ideal when all updates are known before any query is answered.

\`\`\`cpp
// Count integer points covered by at least one inclusive interval [l, r].
int CoveredPoints(vector<vector<int>>& intervals) {
  map<int, int> diff;
  for (const auto& interval : intervals) {
    ++diff[interval[0]];
    --diff[interval[1] + 1];
  }

  int active = 0, prev = 0, ans = 0;
  bool has_prev = false;
  for (const auto& [x, delta] : diff) {
    if (has_prev && active > 0) {
      ans += x - prev;
    }
    active += delta;
    prev = x;
    has_prev = true;
  }
  return ans;
}
\`\`\`
::::

For continuous coordinates, never add \`1\` to the right endpoint. Instead use half-open events \`[l, r)\` and accumulate the geometric length \`x - prev\` between adjacent event coordinates.`,
    },
    {
      id: "dynamic-sweeps",
      title: "Dynamic sweeps and calendar maps",
      body: `If intervals arrive online, you cannot sort all events once. A common workaround is to store the event deltas in an ordered map. Each new interval adds two deltas, then a scan over the map recomputes the maximum overlap.

:::example My Calendar III map sweep
This direct version is simple and reliable. It costs \`O(m)\` per booking for \`m\` distinct event coordinates, which is often accepted when the number of bookings is small.

\`\`\`cpp
// Online maximum overlap after each booking.
class MyCalendarThree {
 public:
  int Book(int start_time, int end_time) {
    ++diff_[start_time];
    --diff_[end_time];  // bookings are half-open: [start_time, end_time)

    int active = 0, best = 0;
    for (const auto& [time, delta] : diff_) {
      active += delta;
      best = max(best, active);
    }
    return best;
  }

 private:
  map<int, int> diff_;
};
\`\`\`
::::

The advanced version replaces the full rescan with a dynamic segment tree over the coordinate range. Each booking performs a range add and reads the global maximum in \`O(log C)\`, where \`C\` is the coordinate universe.`,
    },
    {
      id: "rectangle-sweeps",
      title: "Rectangle sweeps",
      body: `A rectangle sweep usually walks the x-axis. Each rectangle contributes an entering event at \`x1\` and a leaving event at \`x2\`; between adjacent x-coordinates, the active rectangles cover some total y-length, so the area contribution is \`covered_y * (next_x - x)\`.

:::example Union y-length from active intervals
For small inputs, recomputing the merged y-length from active intervals at each x event is clear and often enough. For large inputs, replace this helper with a segment tree over compressed y-coordinates.

\`\`\`cpp
// Return total length covered by active y-intervals [l, r).
long long CoveredY(vector<pair<int, int>> y_intervals) {
  sort(y_intervals.begin(), y_intervals.end());
  long long total = 0;
  int cur_l = 0, cur_r = 0;
  bool open = false;

  for (const auto& [left, right] : y_intervals) {
    if (!open || left > cur_r) {
      if (open) {
        total += cur_r - cur_l;
      }
      cur_l = left;
      cur_r = right;
      open = true;
    } else {
      cur_r = max(cur_r, right);
    }
  }
  if (open) {
    total += cur_r - cur_l;
  }
  return total;
}
\`\`\`
::::

Rectangle Area II (LC 850) is the canonical version: modulo arithmetic for the answer, compressed y-segments, and a segment tree storing cover counts plus currently covered length.`,
    },
    {
      id: "advanced-techniques",
      title: "Advanced techniques",
      body: `Advanced sweep problems are mostly about choosing the right active structure and composing the sweep with another algorithm:

| Need during sweep | Active structure |
| --- | --- |
| active count / peak count | counter over sorted events |
| smallest ending interval | min-heap with lazy deletion |
| arbitrary add/remove plus min/max | ordered set / multiset |
| covered length over coordinates | segment tree over compressed gaps |
| connectivity under threshold | offline sort + DSU |
| many point queries | sort queries into the same sweep order |
| kth / rank during sweep | Fenwick tree or ordered set |
| maximum overlap online | dynamic segment tree with lazy propagation |

Useful combinations:

- **Sweep + heap:** offline point queries, smallest covering interval, reusable resource ids.
- **Sweep + binary search:** check whether a candidate threshold works, then search the threshold. Area-balancing problems often use this.
- **Sweep + segment tree:** rectangle union, maximum covered length, weighted coverage, dynamic calendar.
- **Sweep + DSU:** sort edges, queries, or activation times by threshold and union components as they become active.
- **Sweep + two pointers:** when starts and ends are in separate sorted arrays, one pointer opens intervals and the other closes them.

For two-dimensional problems, sweep one axis and maintain a one-dimensional structure on the other axis. If both axes are large, compression is usually mandatory because the segment tree stores **gaps between coordinates**, not the raw coordinate values.

Implementation checklist:

1. Write the interval convention in a comment: \`[l, r)\`, \`[l, r]\`, or shifted \`r + 1\`.
2. Decide whether answers are read before or after applying same-coordinate events.
3. Group equal coordinates when the answer depends on gaps.
4. Pick the smallest active structure that supports exactly the operations needed.
5. Use \`long long\` for coordinate differences, area, weighted sums, and event products.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 3454 | [Separate Squares II](https://leetcode.cn/problems/separate-squares-ii) | 2671 | area sweep / binary search |
| 850 | [Rectangle Area II](https://leetcode.cn/problems/rectangle-area-ii) | 2236 | rectangle union / segment tree |
| 1851 | [Minimum Interval to Include Each Query](https://leetcode.cn/problems/minimum-interval-to-include-each-query) | 2286 | offline sweep + heap |
| 2251 | [Number of Flowers in Full Bloom](https://leetcode.cn/problems/number-of-flowers-in-full-bloom) | 2022 | point queries / sorted endpoints |
| 2406 | [Divide Intervals Into Minimum Number of Groups](https://leetcode.cn/problems/divide-intervals-into-minimum-number-of-groups) | 1713 | peak active intervals |
| 1942 | [The Number of the Smallest Unoccupied Chair](https://leetcode.cn/problems/the-number-of-the-smallest-unoccupied-chair) | 1695 | event sweep + reusable ids |
| 1109 | [Corporate Flight Bookings](https://leetcode.cn/problems/corporate-flight-bookings) | 1570 | difference array |
| 1094 | [Car Pooling](https://leetcode.cn/problems/car-pooling) | 1441 | capacity sweep |
| 1893 | [Check if All the Integers in a Range Are Covered](https://leetcode.cn/problems/check-if-all-the-integers-in-a-range-are-covered) | 1307 | integer coverage |
| 2848 | [Points That Intersect With Cars](https://leetcode.cn/problems/points-that-intersect-with-cars) | 1230 | simple coverage |
| 218 | [The Skyline Problem](https://leetcode.cn/problems/the-skyline-problem) | - | active heights |
| 732 | [My Calendar III](https://leetcode.cn/problems/my-calendar-iii) | - | dynamic sweep counts |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Tie-breaking is part of the algorithm.** Decide whether touching endpoints overlap before writing the comparator.
- **Compress gaps, not just points.** In geometry, the segment \`[ys[i], ys[i + 1])\` has length \`ys[i + 1] - ys[i]\`; storing only point counts gives the wrong area.
- **Lazy deletion needs a truth condition.** A heap entry is stale when its right endpoint, id, or version no longer matches the current sweep position.
- **Inclusive integer endpoints often use \`r + 1\`.** Continuous geometry does not.
- **Use \`long long\` for coordinates and accumulated area.** Rectangle area and weighted sweeps overflow \`int\` quickly.`,
    },
  ],
};
