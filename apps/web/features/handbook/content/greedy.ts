import type { HandbookTopic } from "../model";

export const greedy: HandbookTopic = {
  slug: "greedy",
  title: "Greedy",
  tagline:
    "Make the locally optimal choice and prove it stays globally optimal — sorting, exchange arguments, and heaps.",
  icon: "Gauge",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A greedy algorithm builds a solution one step at a time, always taking the choice that looks best *right now*, and never reconsiders. It is the fastest paradigm when it works — but it only works when the problem has the **greedy-choice property** (a local optimum extends to a global optimum) and **optimal substructure**.

Signals that greedy *might* work:

- "minimum number of …", "maximum number of non-overlapping …", "earliest/latest …"
- Intervals, scheduling, or deadlines
- You can sort by a key and process in order
- A heap lets you always pull the current best item

The danger: greedy is wrong far more often than it is right. Always sanity-check with a small counterexample, and prefer [Dynamic Programming](/handbook/dynamic-programming) when choices interact.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Sorting and custom comparators.
- Priority queues (binary heaps).
- The notion of an **exchange argument**: show any optimal solution can be transformed into the greedy one without getting worse.

Related: [Binary Search](/handbook/binary-search) (greedy often supplies the feasibility \`check\`), [Dynamic Programming](/handbook/dynamic-programming), [Graph Algorithms](/handbook/graph) (Dijkstra, Prim, Kruskal are greedy).`,
    },
    {
      id: "proving",
      title: "How to know greedy is correct",
      body: `Two standard proof techniques:

1. **Exchange argument.** Take any optimal solution that differs from the greedy one at the first decision. Swap that decision to match greedy and show the solution is no worse. Repeat → greedy is optimal.
2. **Greedy stays ahead.** Show that after each step, the greedy partial solution is at least as good (e.g. ends no later, covers at least as much) as any other partial solution.

If you cannot construct such an argument, treat greedy as a *guess* and verify against DP/brute force on small inputs.`,
    },
    {
      id: "intervals",
      title: "Pattern: interval scheduling",
      body: `**Maximum non-overlapping intervals** → sort by *end* time, greedily keep an interval if it starts after the last kept end.

\`\`\`cpp
// Max number of non-overlapping intervals (LC 435 returns the count to remove)
int maxNonOverlap(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end(), [](auto& a, auto& b){ return a[1] < b[1]; });
    int count = 0, end = INT_MIN;
    for (auto& x : iv) {
        if (x[0] >= end) { // take it; advance the frontier
            count++;
            end = x[1];
        }
    }
    return count;                     // erase = iv.size() - count
}
\`\`\`

**Merge intervals** (LC 56) → sort by *start*, extend the current block while overlapping.
**Minimum arrows to burst balloons** (LC 452) → sort by end, shoot at each new end.
**Meeting rooms II** (LC 253) → sort starts and ends, sweep to find max concurrency (or use a min-heap of end times).`,
    },
    {
      id: "heap",
      title: "Pattern: greedy with a heap",
      body: `When the best next choice changes as you go, a priority queue keeps it at your fingertips.

\`\`\`cpp
// Minimum cost to connect ropes / merge stones-style (Huffman-like)
long long connectSticks(vector<int>& sticks) {
    priority_queue<long long, vector<long long>, greater<>> pq(sticks.begin(), sticks.end());
    long long cost = 0;
    while (pq.size() > 1) {
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();
        cost += a + b;
        pq.push(a + b);               // always merge the two cheapest
    }
    return cost;
}
\`\`\`

Heap-greedy also solves Task Scheduler (LC 621), Reorganize String (LC 767), IPO (LC 502), and Single-Threaded CPU (LC 1834) — pull the most/least of something at each step.`,
    },
    {
      id: "jump",
      title: "Pattern: reachability / jump games",
      body: `Track the farthest reachable index; greedily extend the current "level".

\`\`\`cpp
// Minimum jumps to reach the end (LC 45) — BFS-like level expansion
int jump(vector<int>& a) {
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i + 1 < (int)a.size(); i++) {
        farthest = max(farthest, i + a[i]);
        if (i == curEnd) { // finished a level
            jumps++;
            curEnd = farthest;
        }
    }
    return jumps;
}
\`\`\`

Can-jump (LC 55) is the boolean version: keep the max reach and fail if \`i > reach\`.`,
    },
    {
      id: "exchange-examples",
      title: "Pattern: sort-by-ratio / exchange arguments",
      body: `Many optimization problems are solved by sorting on a cleverly chosen key justified by an exchange argument.

\`\`\`cpp
// Assign cookies to greedy children (LC 455): smallest cookie that satisfies
int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(), g.end()); sort(s.begin(), s.end());
    int i = 0, j = 0;
    while (i < (int)g.size() && j < (int)s.size()) {
        if (s[j] >= g[i])
            i++;        // this cookie satisfies child i
        j++;
    }
    return i;
}
\`\`\`

Other "sort by the right key" classics: Gas Station (LC 134), Queue Reconstruction by Height (LC 406), Boats to Save People (LC 881), and Two City Scheduling (LC 1029, sort by cost difference).`,
    },
    {
      id: "advanced",
      title: "Advanced techniques (hard problems)",
      body: `**Regret / lazy greedy with a heap (LC 871).** Drive as far as you can; whenever you get stuck, "regret" and retroactively refuel at the largest station you have already passed. The heap stores deferred options you can still claim.

\`\`\`cpp
// Minimum Number of Refueling Stops (LC 871)
int minRefuelStops(int target, int startFuel, vector<vector<int>>& st) {
    priority_queue<int> pq;                      // fuel of passed-but-unused stations
    int fuel = startFuel, i = 0, stops = 0, n = st.size();
    while (fuel < target) {
        while (i < n && st[i][0] <= fuel)
            pq.push(st[i++][1]); // everything reachable
        if (pq.empty())
            return -1;               // truly stuck
        fuel += pq.top(); pq.pop(); stops++;     // claim the best deferred refuel
    }
    return stops;
}
\`\`\`

**Take-then-drop greedy (LC 630).** Sort by deadline, greedily take every course, and if total time overruns the current deadline, drop the longest course taken so far — a single max-heap maintains the optimal feasible set.

\`\`\`cpp
// Course Schedule III (LC 630)
int scheduleCourse(vector<vector<int>>& c) {
    sort(c.begin(), c.end(), [](auto& a, auto& b){ return a[1] < b[1]; }); // by deadline
    priority_queue<int> pq; long long time = 0;
    for (auto& x : c) {
        time += x[0]; pq.push(x[0]);
        if (time > x[1]) { // shed the longest
            time -= pq.top();
            pq.pop();
        }
    }
    return pq.size();
}
\`\`\`

**Two-pass greedy for two-sided constraints (LC 135).** When each element must satisfy both its left and right neighbour, sweep left-to-right then right-to-left and combine.

\`\`\`cpp
// Candy (LC 135): satisfy both neighbour constraints
int candy(vector<int>& r) {
    int n = r.size(); vector<int> c(n, 1);
    for (int i = 1; i < n; i++)
        if (r[i] > r[i-1])
            c[i] = c[i-1] + 1;
    for (int i = n - 2; i >= 0; i--)
        if (r[i] > r[i+1])
            c[i] = max(c[i], c[i+1] + 1);
    return accumulate(c.begin(), c.end(), 0);
}
\`\`\`

Other hard greedies: Minimum Number of Taps to Water a Garden (LC 1326, interval cover like Jump Game II), Video Stitching (LC 1024), and Minimum Cost to Hire K Workers (LC 857, sort by ratio + heap of the K smallest).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Time | Space |
| --- | --- | --- |
| Sort + linear sweep | \`O(n log n)\` | \`O(1)\`–\`O(n)\` |
| Heap-greedy | \`O(n log n)\` | \`O(n)\` |
| Jump / reachability | \`O(n)\` | \`O(1)\` |

The cost is almost always dominated by the initial sort or by heap operations.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 455 | [Assign Cookies](https://leetcode.cn/problems/assign-cookies) | sorted two-pointer |
| 435 | [Non-overlapping Intervals](https://leetcode.cn/problems/non-overlapping-intervals) | sort by end |
| 56 | [Merge Intervals](https://leetcode.cn/problems/merge-intervals) | sort by start |
| 452 | [Burst Balloons (arrows)](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons) | sort by end |
| 253 | [Meeting Rooms II](https://leetcode.cn/problems/meeting-rooms-ii) | sweep / min-heap |
| 621 | [Task Scheduler](https://leetcode.cn/problems/task-scheduler) | heap / math |
| 767 | [Reorganize String](https://leetcode.cn/problems/reorganize-string) | max-heap |
| 55 / 45 | [Jump Game I/II](https://leetcode.cn/problems/jump-game) | farthest reach |
| 134 | [Gas Station](https://leetcode.cn/problems/gas-station) | running deficit |
| 406 | [Queue Reconstruction by Height](https://leetcode.cn/problems/queue-reconstruction-by-height) | sort + insert |
| 881 | [Boats to Save People](https://leetcode.cn/problems/boats-to-save-people) | two pointers |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 2410 | [Maximum Matching of Players With Trainers](https://leetcode.cn/problems/maximum-matching-of-players-with-trainers) | sort + two pointers |
| 2790 | [Maximum Number of Groups With Increasing Length](https://leetcode.cn/problems/maximum-number-of-groups-with-increasing-length) | greedy |
| 2171 | [Removing Minimum Number of Magic Beans](https://leetcode.cn/problems/removing-minimum-number-of-magic-beans) | sort + prefix greedy |
| 1921 | [Eliminate Maximum Number of Monsters](https://leetcode.cn/problems/eliminate-maximum-number-of-monsters) | sort by arrival time |
| 871 | [Minimum Number of Refueling Stops](https://leetcode.cn/problems/minimum-number-of-refueling-stops) | regret heap |
| 630 | [Course Schedule III](https://leetcode.cn/problems/course-schedule-iii) | take-then-drop heap |
| 135 | [Candy](https://leetcode.cn/problems/candy) | two-pass greedy |

**Recent medium problems (rating ≥ 1800)**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3785 | [Minimum Swaps to Avoid Forbidden Values](https://leetcode.cn/problems/minimum-swaps-to-avoid-forbidden-values) | 2052 | greedy |
| 3720 | [Lexicographically Smallest Permutation Greater Than Target](https://leetcode.cn/problems/lexicographically-smallest-permutation-greater-than-target) | 1958 | greedy construction |
| 3635 | [Earliest Finish Time for Land and Water Rides II](https://leetcode.cn/problems/earliest-finish-time-for-land-and-water-rides-ii) | 1870 | greedy + sort |
| 3752 | [Lexicographically Smallest Negated Permutation That Sums to Target](https://leetcode.cn/problems/lexicographically-smallest-negated-permutation-that-sums-to-target) | 1827 | greedy construction |
| 3588 | [Find Maximum Area of a Triangle](https://leetcode.cn/problems/find-maximum-area-of-a-triangle) | 1819 | greedy extremes |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Greedy is often wrong** — coin change with arbitrary denominations needs DP, not greedy.
- **Choose the sort key deliberately**; "sort by end" vs. "sort by start" gives different (and sometimes incorrect) answers.
- **Tie-breaking** in comparators can matter; make it explicit.
- **Prove or disprove** with a tiny counterexample before trusting greedy.
- **Overflow**: accumulate costs in \`long long\`.`,
    },
  ],
};
