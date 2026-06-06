import type { HandbookTopic } from "../model";

export const grid: HandbookTopic = {
  slug: "grid",
  title: "Grid / Matrix",
  tagline:
    "Treat a 2D grid as an implicit graph — flood fill, multi-source BFS, and matrix traversal patterns.",
  icon: "Grid3x3",
  group: "Graphs & Grids",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A grid is just a graph where each cell connects to its neighbours. The hard part is rarely the algorithm — it is the bookkeeping: bounds checks, a directions array, visited marking, and BFS vs. DFS choice.

Common grid tasks:

- **Flood fill / connected regions** → DFS or BFS (number of islands).
- **Shortest path in cells** → BFS (unweighted) or Dijkstra/0-1 BFS (weighted).
- **Spread from many sources at once** → multi-source BFS (rotting oranges).
- **Path counting / min path sum** → grid DP.
- **Search a word / place items** → backtracking.
- **In-place transforms** → rotate, spiral, set zeroes.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- BFS/DFS and queues (see [Graph Algorithms](/handbook/graph)).
- Grid DP (see [Dynamic Programming](/handbook/dynamic-programming)).

The directions array is the single most reused idiom:

\`\`\`cpp
// 4-directional neighbours (use the 8-dir version for diagonal moves)
const int dx[4] = {-1, 1, 0, 0};
const int dy[4] = {0, 0, -1, 1};
auto inBounds = [&](int r, int c) {
  return r >= 0 && r < m && c >= 0 && c < n;
};
\`\`\``,
    },
    {
      id: "floodfill",
      title: "Flood fill & connected components",
      body: `:::example Number of Islands (LC 200)
Count or fill regions by visiting a cell and recursing into valid same-region neighbours. Marking the grid in place avoids a separate visited array.

\`\`\`cpp
// Number of Islands (LC 200): sink each island on first contact
int numIslands(vector<vector<char>>& g) {
  int m = g.size(), n = g[0].size(), count = 0;
  function<void(int, int)> sink = [&](int r, int c) {
    if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] != '1') {
      return;
    }
    g[r][c] = '0';  // mark visited in place
    sink(r - 1, c);
    sink(r + 1, c);
    sink(r, c - 1);
    sink(r, c + 1);
  };
  for (int r = 0; r < m; r++) {
    for (int c = 0; c < n; c++) {
      if (g[r][c] == '1') {
        count++;
        sink(r, c);
      }
    }
  }
  return count;
}
\`\`\`
:::

Variations: Max Area of Island (LC 695, return the size), Surrounded Regions (LC 130, flood from the border first), Number of Closed Islands (LC 1254), and Pacific Atlantic Water Flow (LC 417, two reverse floods).`,
    },
    {
      id: "multibfs",
      title: "Multi-source BFS",
      body: `:::example Rotting Oranges (LC 994)
When something spreads simultaneously from several origins, seed the BFS queue with **all** sources at distance 0, then expand level by level. The level index is the elapsed time / distance.

\`\`\`cpp
// Rotting Oranges (LC 994): minutes until all fresh oranges rot
int orangesRotting(vector<vector<int>>& g) {
  int m = g.size(), n = g[0].size(), fresh = 0, minutes = 0;
  queue<pair<int, int>> q;
  for (int r = 0; r < m; r++) {
    for (int c = 0; c < n; c++) {
      if (g[r][c] == 2) {
        q.push({r, c});  // every rotten cell is a source
      } else if (g[r][c] == 1) {
        fresh++;
      }
    }
  }
  const int dx[4] = {-1, 1, 0, 0}, dy[4] = {0, 0, -1, 1};
  while (!q.empty() && fresh) {
    int sz = q.size();
    for (int i = 0; i < sz; i++) {
      auto [r, c] = q.front();
      q.pop();
      for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && g[nr][nc] == 1) {
          g[nr][nc] = 2;
          fresh--;
          q.push({nr, nc});
        }
      }
    }
    minutes++;
  }
  return fresh ? -1 : minutes;
}
\`\`\`
:::

01 Matrix (LC 542) and Walls and Gates (LC 286) are multi-source BFS computing the distance to the nearest source.`,
    },
    {
      id: "shortest",
      title: "Shortest path in a grid",
      body: `:::example Shortest Path in Binary Matrix (LC 1091)
Unweighted shortest path → plain BFS. With per-cell costs → Dijkstra; with 0/1 move costs → 0-1 BFS (deque).

\`\`\`cpp
// Shortest path in a binary matrix, 8-directional (LC 1091)
int shortestPathBinaryMatrix(vector<vector<int>>& g) {
  int n = g.size();
  if (g[0][0] || g[n - 1][n - 1]) {
    return -1;
  }
  queue<pair<int, int>> q;
  q.push({0, 0});
  g[0][0] = 1;  // reuse grid as distance
  int dist = 1;
  while (!q.empty()) {
    int sz = q.size();
    for (int i = 0; i < sz; i++) {
      auto [r, c] = q.front();
      q.pop();
      if (r == n - 1 && c == n - 1) {
        return dist;
      }
      for (int dr = -1; dr <= 1; dr++) {
        for (int dc = -1; dc <= 1; dc++) {
          int nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < n && nc >= 0 && nc < n && g[nr][nc] == 0) {
            g[nr][nc] = 1;
            q.push({nr, nc});
          }
        }
      }
    }
    dist++;
  }
  return -1;
}
\`\`\`
:::

When you must track extra state (keys collected, remaining obstacle removals), make the BFS/Dijkstra node a tuple \`(r, c, state)\` (LC 1293 Shortest Path with Obstacle Elimination, LC 864 Shortest Path to Get All Keys).`,
    },
    {
      id: "backtracking",
      title: "Backtracking on grids",
      body: `:::example Word Search (LC 79)
Search problems explore a path, mark cells, recurse, then **undo** the mark on the way out.

\`\`\`cpp
// Word Search (LC 79): DFS with backtracking
bool exist(vector<vector<char>>& b, string word) {
  int m = b.size(), n = b[0].size();
  function<bool(int, int, int)> dfs = [&](int r, int c, int k) {
    if (k == (int)word.size()) {
      return true;
    }
    if (r < 0 || r >= m || c < 0 || c >= n || b[r][c] != word[k]) {
      return false;
    }
    char tmp = b[r][c];
    b[r][c] = '#';  // mark to avoid reuse
    bool found = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) ||
                 dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    b[r][c] = tmp;  // restore (backtrack)
    return found;
  };
  for (int r = 0; r < m; r++) {
    for (int c = 0; c < n; c++) {
      if (dfs(r, c, 0)) {
        return true;
      }
    }
  }
  return false;
}
\`\`\`
:::`,
    },
    {
      id: "transforms",
      title: "In-place matrix transforms",
      body: `:::example Rotate Image (LC 48)
Layout problems are about index arithmetic, not algorithms.

\`\`\`cpp
// Rotate image 90 degrees clockwise in place (LC 48): transpose then reverse
// rows
void rotate(vector<vector<int>>& a) {
  int n = a.size();
  for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
      swap(a[i][j], a[j][i]);
    }
  }
  for (auto& row : a) {
    reverse(row.begin(), row.end());
  }
}
\`\`\`
:::

Spiral Matrix (LC 54) walks four shrinking boundaries; Set Matrix Zeroes (LC 73) uses the first row/column as flags for \`O(1)\` extra space.`,
    },
    {
      id: "grid-dijkstra",
      title: "Dijkstra & min-max paths on grids",
      body: `:::example Swim in Rising Water (LC 778)
When moving between cells has a cost — or you must minimize the *maximum* cell on a path — run Dijkstra with a min-heap over cells.

\`\`\`cpp
// Swim in Rising Water (LC 778): minimize the largest elevation on a path
int swimInWater(vector<vector<int>>& grid) {
  int n = grid.size();
  // {time, r, c}
  priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> pq;
  vector<vector<int>> seen(n, vector<int>(n, 0));
  pq.push({grid[0][0], 0, 0});
  seen[0][0] = 1;
  const int dx[4] = {-1, 1, 0, 0}, dy[4] = {0, 0, -1, 1};
  while (!pq.empty()) {
    auto [t, r, c] = pq.top();
    pq.pop();
    if (r == n - 1 && c == n - 1) {
      return t;
    }
    for (int d = 0; d < 4; d++) {
      int nr = r + dx[d], nc = c + dy[d];
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !seen[nr][nc]) {
        seen[nr][nc] = 1;
        pq.push({max(t, grid[nr][nc]), nr, nc});  // path cost = max cell
      }
    }
  }
  return -1;
}
\`\`\`
:::

Path With Minimum Effort (LC 1631) is the same template minimizing the maximum absolute height difference. For 0/1 move costs, prefer 0-1 BFS with a deque (LC 1368).`,
    },
    {
      id: "broken-profile",
      title: "Bitmask / broken-profile DP on grids",
      body: `:::example Maximum Students Taking Exam (LC 1349)
When grid dimensions are small in one direction (\`cols <= ~12\`), DP over **row bitmasks** — each mask encodes which cells in a row are chosen, with adjacency constraints between consecutive rows.

\`\`\`cpp
// Maximum Students Taking Exam (LC 1349): DP over valid seating bitmasks per
// row
int maxStudents(vector<vector<char>>& seats) {
  int m = seats.size(), n = seats[0].size();
  vector<int> good(m, 0);
  for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
      if (seats[i][j] == '.') {
        good[i] |= (1 << j);
      }
    }
  }
  auto ok = [&](int row, int mask) {
    return (mask & good[row]) == mask && !(mask & (mask << 1));
  };
  vector<vector<int>> dp(m + 1, vector<int>(1 << n, -1));
  dp[0][0] = 0;
  int best = 0;
  for (int i = 0; i < m; i++) {
    for (int prev = 0; prev < (1 << n); prev++) {
      if (dp[i][prev] < 0) {
        continue;
      }
      for (int cur = 0; cur < (1 << n); cur++) {
        if (!ok(i, cur)) {
          continue;
        }
        if ((cur & (prev << 1)) || (cur & (prev >> 1))) {
          continue;  // diagonal clash
        }
        int val = dp[i][prev] + __builtin_popcount(cur);
        dp[i + 1][cur] = max(dp[i + 1][cur], val);
        best = max(best, val);
      }
    }
  }
  return best;
}
\`\`\`
:::

The same idea (broken-profile DP) tiles boards with dominoes (LC 1659 Maximize Grid Happiness pushes this to 3-state profiles).`,
    },
    {
      id: "grid-advanced",
      title: "Advanced traversal techniques (hard problems)",
      body: `- **BFS with a bitmask of collected items.** Shortest Path to Get All Keys (LC 864): the state is \`(r, c, keyMask)\`, and the goal is reaching \`keyMask == allKeys\`.
- **A\\* search.** Sliding Puzzle (LC 773) and the 15-puzzle prune BFS with an admissible heuristic (sum of Manhattan distances) to reach the goal far faster than plain BFS.
- **Bidirectional BFS.** Search from both source and target and meet in the middle — turns \`O(b^d)\` into roughly \`O(b^{d / 2})\` for Word Ladder (LC 127) and Open the Lock (LC 752).
- **Backtracking with pruning.** N-Queens (LC 51) places one queen per row using column/diagonal bitmasks to prune in \`O(1)\`.
- **DSU on a grid.** Number of Islands II (LC 305) adds land incrementally and unions with neighbours to maintain the component count online.

Recurring lesson: when plain BFS/DFS is too weak, *enrich the state* (keys, fuel, removals, parity) or *change the search* (Dijkstra, 0-1 BFS, A\\*, bidirectional) rather than abandoning the grid-as-graph model.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `For an \`m x n\` grid:

| Pattern | Time | Space |
| --- | --- | --- |
| Flood fill / components | \`O(mn)\` | \`O(mn)\` recursion/queue |
| Multi-source BFS | \`O(mn)\` | \`O(mn)\` |
| Dijkstra on grid | \`O(mn log(mn))\` | \`O(mn)\` |
| Grid DP | \`O(mn)\` | \`O(mn)\` or \`O(n)\` rolling |
| Backtracking (word search) | \`O(mn * 4^L)\` | \`O(L)\` |`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Grid questions map cleanly onto a few graph-on-cells patterns — pick the one matching the movement and cost model.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Flood fill / components | "count/size of regions", "islands" | DFS/BFS, mark in place | [Number of Islands](https://leetcode.cn/problems/number-of-islands) |
| Multi-source BFS | spread from many origins at once, "minutes/distance to nearest" | seed queue with all sources at level 0 | [Rotting Oranges](https://leetcode.cn/problems/rotting-oranges) |
| Plain BFS shortest path | unweighted moves, "fewest steps" | level-by-level BFS, 4/8-dir array | [Shortest Path in Binary Matrix](https://leetcode.cn/problems/shortest-path-in-binary-matrix) |
| BFS/Dijkstra with state | keys, fuel, obstacle removals, parity | node = \`(r, c, state)\` in visited key | [Shortest Path to Get All Keys](https://leetcode.cn/problems/shortest-path-to-get-all-keys) |
| Min-max path (Dijkstra) | minimize the *largest* cell/edge on a path | min-heap over cells, cost = \`max(...)\` | [Swim in Rising Water](https://leetcode.cn/problems/swim-in-rising-water) |
| Backtracking on cells | "search a word", place items, undo on exit | DFS, mark then restore | [Word Search](https://leetcode.cn/problems/word-search) |
| Broken-profile / bitmask DP | small dimension ($n \\le 12$), row-by-row constraints | DP over row masks | [Maximum Students Taking Exam](https://leetcode.cn/problems/maximum-students-taking-exam) |
| In-place transforms | rotate, spiral, set-zeroes | index arithmetic, reuse the grid | [Rotate Image](https://leetcode.cn/problems/rotate-image) |

- The most error-prone is **state in the node**: keys/fuel/removals must be part of the visited key or BFS will prune a cell that was reachable in a *different* state, silently dropping the optimal path.
- Reuse the grid itself as the visited/distance marker when you may mutate the input; otherwise carry a separate \`seen\` array.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 48 / 54 / 73 | [Rotate Image](https://leetcode.cn/problems/rotate-image) / [Spiral](https://leetcode.cn/problems/spiral-matrix) / [Set Zeroes](https://leetcode.cn/problems/set-matrix-zeroes) | in-place transforms |
| 64 | [Minimum Path Sum](https://leetcode.cn/problems/minimum-path-sum) | grid DP |
| 79 | [Word Search](https://leetcode.cn/problems/word-search) | backtracking |
| 130 | [Surrounded Regions](https://leetcode.cn/problems/surrounded-regions) | border flood |
| 200 | [Number of Islands](https://leetcode.cn/problems/number-of-islands) | flood fill |
| 417 | [Pacific Atlantic Water Flow](https://leetcode.cn/problems/pacific-atlantic-water-flow) | reverse multi-flood |
| 542 | [01 Matrix](https://leetcode.cn/problems/01-matrix) | multi-source BFS |
| 695 | [Max Area of Island](https://leetcode.cn/problems/max-area-of-island) | flood fill + size |
| 994 | [Rotting Oranges](https://leetcode.cn/problems/rotting-oranges) | multi-source BFS |
| 1091 | [Shortest Path in Binary Matrix](https://leetcode.cn/problems/shortest-path-in-binary-matrix) | BFS (8-dir) |
| 1293 | [Shortest Path with Obstacles](https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination) | BFS with state |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 407 | [Trapping Rain Water II](https://leetcode.cn/problems/trapping-rain-water-ii) | heap BFS |
| 778 | [Swim in Rising Water](https://leetcode.cn/problems/swim-in-rising-water) | min-max Dijkstra |
| 864 | [Shortest Path to Get All Keys](https://leetcode.cn/problems/shortest-path-to-get-all-keys) | BFS with bitmask state |
| 2258 | [Escape the Spreading Fire](https://leetcode.cn/problems/escape-the-spreading-fire) | BFS + binary search |
| 2577 | [Minimum Time to Visit a Cell In a Grid](https://leetcode.cn/problems/minimum-time-to-visit-a-cell-in-a-grid) | Dijkstra |
| 2684 | [Maximum Number of Moves in a Grid](https://leetcode.cn/problems/maximum-number-of-moves-in-a-grid) | DP / BFS |
| 2812 | [Find the Safest Path in a Grid](https://leetcode.cn/problems/find-the-safest-path-in-a-grid) | multi-source BFS + binary search |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3240 | [Minimum Number of Flips to Make Binary Grid Palindromic II](https://leetcode.cn/problems/minimum-number-of-flips-to-make-binary-grid-palindromic-ii) | 2080 | grid + greedy/counting |
| 3552 | [Grid Teleportation Traversal](https://leetcode.cn/problems/grid-teleportation-traversal) | 2036 | 0-1 BFS |
| 3122 | [Minimum Number of Operations to Satisfy Conditions](https://leetcode.cn/problems/minimum-number-of-operations-to-satisfy-conditions) | 1905 | grid DP / counting |
| 3665 | [Twisted Mirror Path Count](https://leetcode.cn/problems/twisted-mirror-path-count) | 1883 | grid DFS / DP |
| 3742 | [Maximum Path Score in a Grid](https://leetcode.cn/problems/maximum-path-score-in-a-grid) | 1804 | grid DP |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Bounds first**: always check \`inBounds\` before reading a cell.
- **Mark on enqueue** (BFS) to avoid pushing a cell twice.
- **Empty grid**: guard \`grid.empty() || grid[0].empty()\`.
- **In-place marking** is convenient but mutates the input — restore it if the caller needs it (backtracking does).
- **State in the node**: keys, fuel, or removals must be part of the visited key, or BFS will wrongly prune.
- **8 vs. 4 directions**: re-read the problem; diagonals change everything.`,
    },
  ],
};
