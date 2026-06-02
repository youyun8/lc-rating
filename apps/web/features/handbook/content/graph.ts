import type { HandbookTopic } from "../model";

export const graph: HandbookTopic = {
  slug: "graph",
  title: "Graph Algorithms",
  tagline:
    "Traversal, topological order, shortest paths, and minimum spanning trees — the core of connectivity problems.",
  icon: "Share2",
  group: "Graphs & Grids",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A graph models entities (nodes) and relationships (edges). Recognizing a problem *as* a graph — even when it does not look like one — is half the battle ("words differing by one letter", "courses with prerequisites", "cells you can travel between" are all graphs).

The decision tree:

- **Reachability / components** → BFS or DFS.
- **Shortest path, unweighted** → BFS.
- **Shortest path, non-negative weights** → Dijkstra.
- **Shortest path with negatives / detect negative cycle** → Bellman-Ford.
- **All-pairs shortest path (small n)** → Floyd-Warshall.
- **Order tasks with dependencies** → topological sort.
- **Cheapest way to connect everything** → minimum spanning tree (Kruskal/Prim).
- **Edge weights only 0/1** → 0-1 BFS with a deque.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Queues, stacks, recursion, and priority queues.
- Disjoint Set Union (see [Data Structures](/handbook/data-structures)) for Kruskal and connectivity.

Related: [Grid / Matrix](/handbook/grid) (implicit graphs), [Trees & Binary Trees](/handbook/trees), [Greedy](/handbook/greedy). Going further: [Advanced Graph Templates](/handbook/advanced-graph-templates) (SCC condensation, 2-SAT, flow, matching, HLD).

\`\`\`cpp
// Adjacency list (most common representation)
int n;                     // number of nodes
vector<vector<int>> g(n);  // g[u] = neighbours of u
for (auto& e : edges) {    // undirected
  g[e[0]].push_back(e[1]);
  g[e[1]].push_back(e[0]);
}
\`\`\``,
    },
    {
      id: "traversal",
      title: "BFS & DFS",
      body: `DFS explores as deep as possible (recursion or stack); BFS explores in rings (queue) and finds the **fewest-edge** path in an unweighted graph.

\`\`\`cpp
// DFS to count connected components / mark visited
vector<int> vis;
void dfs(int u, vector<vector<int>>& g) {
  vis[u] = 1;
  for (int v : g[u]) {
    if (!vis[v]) {
      dfs(v, g);
    }
  }
}
\`\`\`

\`\`\`cpp
// BFS shortest distance (in edges) from src in an unweighted graph
vector<int> bfs(int src, vector<vector<int>>& g) {
  vector<int> dist(g.size(), -1);
  queue<int> q;
  q.push(src);
  dist[src] = 0;
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (int v : g[u]) {
      if (dist[v] == -1) {
        dist[v] = dist[u] + 1;
        q.push(v);
      }
    }
  }
  return dist;
}
\`\`\`

Word Ladder (LC 127) and Open the Lock (LC 752) are BFS over implicit graphs of states.`,
    },
    {
      id: "toposort",
      title: "Topological sort",
      body: `A topological order lists nodes of a **DAG** so every edge goes forward. Kahn's algorithm (BFS on in-degrees) also detects cycles: if you can't output all nodes, a cycle exists.

\`\`\`cpp
// Kahn's algorithm: topological order, or empty if there is a cycle (LC
// 207/210)
vector<int> topoSort(int n, vector<vector<int>>& g) {
  vector<int> indeg(n, 0), order;
  for (int u = 0; u < n; u++) {
    for (int v : g[u]) {
      indeg[v]++;
    }
  }
  queue<int> q;
  for (int u = 0; u < n; u++) {
    if (indeg[u] == 0) {
      q.push(u);
    }
  }
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);
    for (int v : g[u]) {
      if (--indeg[v] == 0) {
        q.push(v);
      }
    }
  }
  return (int)order.size() == n ? order : vector<int>{};  // empty => cycle
}
\`\`\`

Used for Course Schedule (LC 207/210), Alien Dictionary (LC 269), and Parallel Courses (LC 1136, where BFS levels give the minimum number of semesters).`,
    },
    {
      id: "dijkstra",
      title: "Dijkstra: non-negative shortest paths",
      body: `Dijkstra grows a frontier of finalized nodes, always finalizing the closest unsettled node via a min-heap. Requires **non-negative** edge weights.

\`\`\`cpp
// Dijkstra from src; g[u] = list of {v, weight}
vector<long long> dijkstra(int src, vector<vector<pair<int, int>>>& g) {
  const long long INF = LLONG_MAX;
  vector<long long> dist(g.size(), INF);
  priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>>
      pq;
  dist[src] = 0;
  pq.push({0, src});
  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) {
      continue;  // stale entry
    }
    for (auto [v, w] : g[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({dist[v], v});
      }
    }
  }
  return dist;
}
\`\`\`

Network Delay Time (LC 743), Cheapest Flights (LC 787, with a hop limit → prefer Bellman-Ford), and Path With Minimum Effort (LC 1631, Dijkstra on a grid with a max-edge relaxation).`,
    },
    {
      id: "other-paths",
      title: "Bellman-Ford, Floyd-Warshall & 0-1 BFS",
      body: `**Bellman-Ford** relaxes all edges \`V-1\` times; handles negative edges and detects negative cycles (one more relaxation still improves something).

\`\`\`cpp
// Bellman-Ford: shortest paths with possible negative edges
vector<long long> bellman(int n, int src, vector<array<int, 3>>& edges) {
  const long long INF = LLONG_MAX;
  vector<long long> dist(n, INF);
  dist[src] = 0;
  for (int i = 0; i < n - 1; i++) {
    for (auto& [u, v, w] : edges) {
      if (dist[u] != INF && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }
  return dist;  // run once more to detect a negative cycle
}
\`\`\`

**Floyd-Warshall** computes all-pairs shortest paths in \`O(n^3)\` — fine for \`n <= ~400\`.

\`\`\`cpp
// Floyd-Warshall all-pairs shortest path
for (int k = 0; k < n; k++) {
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
      if (d[i][k] + d[k][j] < d[i][j]) {
        d[i][j] = d[i][k] + d[k][j];
      }
    }
  }
}
\`\`\`

**0-1 BFS**: when weights are only 0 or 1, a deque (push-front for 0, push-back for 1) gives shortest paths in \`O(V+E)\` (LC 1368 Minimum Cost to Make at Least One Valid Path).`,
    },
    {
      id: "mst",
      title: "Minimum spanning tree",
      body: `An MST connects all nodes with minimum total edge weight. **Kruskal** sorts edges and adds them if they connect two different components (DSU). **Prim** grows a tree with a min-heap.

\`\`\`cpp
// Kruskal's MST using DSU (see Data Structures for DSU); returns total weight
long long kruskal(int n, vector<array<int, 3>>& edges /*{w,u,v}*/) {
  sort(edges.begin(), edges.end());
  DSU dsu(n);
  long long total = 0;
  int used = 0;
  for (auto& [w, u, v] : edges) {
    if (dsu.unite(u, v)) {
      total += w;
      if (++used == n - 1) {
        break;
      }
    }
  }
  return total;
}
\`\`\`

Min Cost to Connect All Points (LC 1584) is a complete graph MST: build edges from pairwise Manhattan distances, then run Kruskal or Prim.`,
    },
    {
      id: "coloring",
      title: "Cycle detection & bipartite check",
      body: `**Undirected cycle**: a DFS that reaches a visited node which is not the parent (or a DSU union that fails). **Directed cycle**: DFS with three colors (white/gray/black) — an edge to a gray node is a back edge.

\`\`\`cpp
// Bipartite check via BFS 2-coloring (LC 785)
bool isBipartite(vector<vector<int>>& g) {
  int n = g.size();
  vector<int> color(n, -1);
  for (int s = 0; s < n; s++) {
    if (color[s] == -1) {
      queue<int> q;
      q.push(s);
      color[s] = 0;
      while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
          if (color[v] == -1) {
            color[v] = color[u] ^ 1;
            q.push(v);
          } else if (color[v] == color[u]) {
            return false;  // same-color edge
          }
        }
      }
    }
  }
  return true;
}
\`\`\`

For strongly connected components on directed graphs, learn Tarjan's or Kosaraju's algorithm (advanced).`,
    },
    {
      id: "tarjan",
      title: "Tarjan: bridges, articulation points & SCC",
      body: `A single DFS that tracks each node's discovery time and \`low\` value (the earliest reachable ancestor) finds **bridges** and **articulation points**. An edge \`u→v\` is a bridge when \`low[v] > disc[u]\` (no back edge skips it).

\`\`\`cpp
// Critical Connections / bridges (LC 1192) via Tarjan low-link
vector<vector<int>> criticalConnections(int n, vector<vector<int>>& conns) {
  vector<vector<int>> g(n), bridges;
  for (auto& e : conns) {
    g[e[0]].push_back(e[1]);
    g[e[1]].push_back(e[0]);
  }
  vector<int> disc(n, -1), low(n);
  int timer = 0;
  function<void(int, int)> dfs = [&](int u, int parent) {
    disc[u] = low[u] = timer++;
    for (int v : g[u]) {
      if (v == parent) {
        continue;
      }
      if (disc[v] == -1) {
        dfs(v, u);
        low[u] = min(low[u], low[v]);
        if (low[v] > disc[u]) {
          bridges.push_back({u, v});  // bridge found
        }
      } else {
        low[u] = min(low[u], disc[v]);  // back edge
      }
    }
  };
  for (int i = 0; i < n; i++) {
    if (disc[i] == -1) {
      dfs(i, -1);
    }
  }
  return bridges;
}
\`\`\`

**Strongly connected components (SCC).** Tarjan's (one DFS with a stack) or Kosaraju's (two DFS passes) partition a directed graph into SCCs in \`O(V + E)\`. Condensing each SCC to a single node yields a DAG — the standard preprocessing for "minimum nodes to reach all" and 2-SAT.`,
    },
    {
      id: "euler-dag",
      title: "Eulerian paths & DAG dynamic programming",
      body: `**Eulerian path (Hierholzer).** Walk edges, deferring a node onto the output only when it has no unused edges; reverse at the end. The lexicographically smallest itinerary uses a \`multiset\` of destinations.

\`\`\`cpp
// Reconstruct Itinerary (LC 332): Hierholzer Eulerian path
vector<string> findItinerary(vector<vector<string>>& tickets) {
  unordered_map<string, multiset<string>> g;
  for (auto& t : tickets) {
    g[t[0]].insert(t[1]);
  }
  vector<string> route;
  stack<string> st;
  st.push("JFK");
  while (!st.empty()) {
    string u = st.top();
    if (g[u].empty()) {
      route.push_back(u);
      st.pop();
    } else {
      auto it = g[u].begin();
      string v = *it;
      g[u].erase(it);
      st.push(v);
    }
  }
  reverse(route.begin(), route.end());
  return route;
}
\`\`\`

**DAG longest/shortest path via topological order.** Once nodes are topologically sorted, relax edges in that order in \`O(V + E)\` — no Dijkstra needed. This is the engine behind Longest Increasing Path in a Matrix (LC 329, memoized DFS = DP on the implicit DAG) and Parallel Courses (LC 1136).`,
    },
    {
      id: "flow-matching",
      title: "Max flow, matching & shortest-path variants",
      body: `- **Bipartite matching** (Kuhn's augmenting paths, or Hopcroft–Karp in \`O(E·sqrt(V))\`) solves task assignment and minimum vertex cover (König's theorem). LC examples: Maximum Bipartite-style assignment, LC 1066, LC 1947.
- **Max flow / min cut** (Dinic's in \`O(V^2·E)\`) models capacities, edge-disjoint paths, and project-selection. Min cut = max flow.
- **Dijkstra with state.** Carry extra dimensions in the node: stops left (Cheapest Flights, LC 787), parity, or collected keys. Path With Maximum Probability (LC 1514) is Dijkstra maximizing a product; Path With Minimum Effort (LC 1631) minimizes the max edge.
- **Johnson's algorithm** reweights with Bellman-Ford so Dijkstra can run from every source on graphs with negative edges.
- **2-SAT** reduces boolean clauses to an implication graph; a satisfying assignment exists iff no variable and its negation share an SCC.

These rarely appear on LeetCode but are decisive on the hardest contest problems — recognize the *reduction* (assignment → matching, capacity → flow) and reuse a known template.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Algorithm | Time | Notes |
| --- | --- | --- |
| BFS / DFS | \`O(V + E)\` | traversal, unweighted shortest path |
| Topological sort | \`O(V + E)\` | DAG only; detects cycles |
| Dijkstra (heap) | \`O((V + E) log V)\` | non-negative weights |
| Bellman-Ford | \`O(V * E)\` | negatives; cycle detection |
| Floyd-Warshall | \`O(V^3)\` | all pairs, small V |
| Kruskal / Prim | \`O(E log E)\` | minimum spanning tree |
| 0-1 BFS | \`O(V + E)\` | weights in {0, 1} |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 127 | [Word Ladder](https://leetcode.cn/problems/word-ladder) | BFS over states |
| 200 | [Number of Islands](https://leetcode.cn/problems/number-of-islands) | DFS/BFS components |
| 207 / 210 | [Course Schedule I/II](https://leetcode.cn/problems/course-schedule) | topological sort |
| 269 | [Alien Dictionary](https://leetcode.cn/problems/alien-dictionary) | topo sort |
| 684 | [Redundant Connection](https://leetcode.cn/problems/redundant-connection) | DSU cycle |
| 743 | [Network Delay Time](https://leetcode.cn/problems/network-delay-time) | Dijkstra |
| 785 | [Is Graph Bipartite](https://leetcode.cn/problems/is-graph-bipartite) | 2-coloring |
| 787 | [Cheapest Flights K Stops](https://leetcode.cn/problems/cheapest-flights-within-k-stops) | Bellman-Ford |
| 1368 | [Min Cost Valid Path](https://leetcode.cn/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid) | 0-1 BFS |
| 1584 | [Connect All Points](https://leetcode.cn/problems/min-cost-to-connect-all-points) | MST |
| 1631 | [Path With Minimum Effort](https://leetcode.cn/problems/path-with-minimum-effort) | Dijkstra variant |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 329 | [Longest Increasing Path in a Matrix](https://leetcode.cn/problems/longest-increasing-path-in-a-matrix) | DAG memo DP |
| 332 | [Reconstruct Itinerary](https://leetcode.cn/problems/reconstruct-itinerary) | Eulerian path |
| 1192 | [Critical Connections in a Network](https://leetcode.cn/problems/critical-connections-in-a-network) | Tarjan bridges |
| 1976 | [Number of Ways to Arrive at Destination](https://leetcode.cn/problems/number-of-ways-to-arrive-at-destination) | Dijkstra + counting |
| 2092 | [Find All People With Secret](https://leetcode.cn/problems/find-all-people-with-secret) | DSU by event time |
| 2290 | [Minimum Obstacle Removal to Reach Corner](https://leetcode.cn/problems/minimum-obstacle-removal-to-reach-corner) | 0-1 BFS |
| 2421 | [Number of Good Paths](https://leetcode.cn/problems/number-of-good-paths) | DSU |

**Recent medium problems**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 2508 | [Add Edges to Make Degrees of All Nodes Even](https://leetcode.cn/problems/add-edges-to-make-degrees-of-all-nodes-even) | 2060 | degree analysis |
| 2948 | [Make Lexicographically Smallest Array by Swapping](https://leetcode.cn/problems/make-lexicographically-smallest-array-by-swapping-elements) | 2047 | DSU components |
| 3342 | [Find Minimum Time to Reach Last Room II](https://leetcode.cn/problems/find-minimum-time-to-reach-last-room-ii) | 1862 | Dijkstra |
| 2976 | [Minimum Cost to Convert String I](https://leetcode.cn/problems/minimum-cost-to-convert-string-i) | 1882 | Floyd–Warshall |
| 3604 | [Minimum Time to Reach Destination in Directed Graph](https://leetcode.cn/problems/minimum-time-to-reach-destination-in-directed-graph) | 1845 | time-aware Dijkstra |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Dijkstra forbids negative edges** — use Bellman-Ford instead.
- **Mark visited at enqueue time** in BFS, not dequeue, to avoid duplicates.
- **Stale heap entries**: skip when \`d > dist[u]\` instead of a separate visited set.
- **Directed vs. undirected**: build edges accordingly; undirected cycle detection must ignore the parent edge.
- **Disconnected graphs**: loop over all start nodes for traversal/coloring.
- **Overflow**: sum path weights in \`long long\`; pick an \`INF\` that won't overflow when added.`,
    },
  ],
};
