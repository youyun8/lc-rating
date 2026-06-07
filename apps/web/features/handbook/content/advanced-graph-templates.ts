import type { HandbookTopic } from "../model";

export const advancedGraphTemplates: HandbookTopic = {
  slug: "advanced-graph-templates",
  title: "Advanced Graph Templates",
  tagline:
    "SCC condensation, 2-SAT, bipartite matching, Dinic flow, min-cost flow, and heavy-light decomposition.",
  icon: "Network",
  group: "Graphs & Grids",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Advanced graph problems are usually reductions. Once you identify the reduction, the implementation should come from a trusted template.

| Signal | Template |
| --- | --- |
| mutually reachable directed components | SCC |
| boolean clauses with two literals | 2-SAT |
| assign left objects to right objects | bipartite matching |
| capacities, cuts, disjoint paths | max flow |
| capacity plus cost | min-cost max-flow |
| many path queries on a tree | HLD |

\`\`\`cpp
// Reduction checklist.
enum class GraphTool {
  SCC,
  TwoSAT,
  BipartiteMatching,
  MaxFlow,
  MinCostFlow,
  HeavyLight
};

// If the problem statement says "minimum cut", "assign", "at most one",
// "path query on a tree", or "mutual reachability", map it to a template first.
\`\`\``,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- All of [Graph Algorithms](/handbook/graph): BFS/DFS, Dijkstra, topological sort, MST, and Tarjan low-link.
- [Data Structures](/handbook/data-structures) for DSU, and [Trees & Binary Trees](/handbook/trees) for the Euler order behind heavy-light decomposition.
- Practice turning a word problem into a reduction ("minimum cut", "assign at most one", "two-literal clause").

Related: [Range Queries & Offline Algorithms](/handbook/range-queries-offline) (a segment tree over time powers the rollback-DSU technique).`,
    },
    {
      id: "scc",
      title: "Strongly connected components and condensation",
      body: `SCCs partition a directed graph into maximal groups where every node can reach every other node. Compressing each SCC gives a DAG.

\`\`\`cpp
// Tarjan's SCC: assigns each node a component id via DFS + explicit stack.
struct SCC {
  int n, timer = 0, compCnt = 0;
  vector<vector<int>> g;
  // disc: discovery time; low: lowest disc reachable; comp: SCC id of node
  vector<int> disc, low, comp, st;
  vector<char> inStack;

  SCC(int n) : n(n), g(n), disc(n, -1), low(n), comp(n, -1), inStack(n, 0) {}

  void addEdge(int u, int v) { g[u].push_back(v); }

  void dfs(int u) {
    disc[u] = low[u] = timer++;  // stamp discovery time
    st.push_back(u);
    inStack[u] = 1;

    for (int v : g[u]) {
      if (disc[v] == -1) {
        dfs(v);
        low[u] = min(low[u], low[v]);  // pull reachability info from child
      } else if (inStack[v]) {
        // back edge to an ancestor still on the stack -> same SCC
        low[u] = min(low[u], disc[v]);
      }
    }

    // u is a root of an SCC when no ancestor is reachable from its subtree
    if (low[u] == disc[u]) {
      while (true) {
        int v = st.back();
        st.pop_back();
        inStack[v] = 0;
        comp[v] = compCnt;  // label every node in this SCC
        if (v == u) {
          break;
        }
      }
      ++compCnt;
    }
  }

  vector<int> build() {
    for (int i = 0; i < n; ++i) {
      if (disc[i] == -1) {
        dfs(i);  // handle disconnected components
      }
    }
    return comp;
  }

  // Build the condensation DAG: one node per SCC, edges between distinct SCCs.
  vector<vector<int>> condensation() {
    build();
    vector<vector<int>> dag(compCnt);
    set<pair<int, int>> seen;  // deduplicate parallel edges
    for (int u = 0; u < n; ++u) {
      for (int v : g[u]) {
        if (comp[u] != comp[v] && seen.insert({comp[u], comp[v]}).second) {
          dag[comp[u]].push_back(comp[v]);
        }
      }
    }
    return dag;
  }
};
\`\`\``,
    },
    {
      id: "two-sat",
      title: "2-SAT implication graph",
      body: `A 2-SAT clause \`(a OR b)\` becomes implications \`not a -> b\` and \`not b -> a\`. The formula is satisfiable iff no variable and its negation are in the same SCC.

\`\`\`cpp
struct TwoSAT {
  int n;
  SCC scc;

  TwoSAT(int n) : n(n), scc(2 * n) {}

  int id(int var, bool isTrue) const { return 2 * var + (isTrue ? 0 : 1); }

  int neg(int x) const { return x ^ 1; }

  void addImplication(int a, int b) { scc.addEdge(a, b); }

  void addOr(int aVar, bool aTrue, int bVar, bool bTrue) {
    int a = id(aVar, aTrue);
    int b = id(bVar, bTrue);
    addImplication(neg(a), b);
    addImplication(neg(b), a);
  }

  void force(int var, bool value) { addOr(var, value, var, value); }

  optional<vector<bool>> solve() {
    vector<int> comp = scc.build();
    vector<bool> assignment(n);
    for (int i = 0; i < n; ++i) {
      if (comp[id(i, true)] == comp[id(i, false)]) {
        return nullopt;
      }
      assignment[i] = comp[id(i, true)] > comp[id(i, false)];
    }
    return assignment;
  }
};

// Example: x0 OR not x1
// TwoSAT sat(2);
// sat.addOr(0, true, 1, false);
\`\`\``,
    },
    {
      id: "kuhn",
      title: "Bipartite matching with Kuhn DFS",
      body: `Bipartite matching assigns left nodes to distinct right nodes. Kuhn's algorithm is short and often fast enough for moderate graphs; Hopcroft-Karp is faster for very large inputs.

\`\`\`cpp
// Kuhn's algorithm: maximum bipartite matching via augmenting paths.
struct KuhnMatcher {
  int L, R;
  vector<vector<int>> g;
  // matchR[v]: which left node is currently matched to right node v (-1 = free)
  vector<int> matchR, seen;
  int iter = 0;  // iteration stamp avoids clearing the visited array each call

  KuhnMatcher(int L, int R) : L(L), R(R), g(L), matchR(R, -1), seen(L, 0) {}

  void addEdge(int left, int right) { g[left].push_back(right); }

  // Try to find an augmenting path starting from left node u.
  bool dfs(int u) {
    if (seen[u] == iter) {
      return false;  // already visited in this round
    }
    seen[u] = iter;
    for (int v : g[u]) {
      // Right node v is free, or its current match can be rerouted.
      if (matchR[v] == -1 || dfs(matchR[v])) {
        matchR[v] = u;
        return true;
      }
    }
    return false;
  }

  int maxMatching() {
    int ans = 0;
    for (int u = 0; u < L; ++u) {
      ++iter;  // bump stamp instead of clearing seen[]
      if (dfs(u)) {
        ++ans;
      }
    }
    return ans;
  }
};
\`\`\``,
    },
    {
      id: "dinic",
      title: "Dinic max flow and min cut",
      body: `Max flow models capacities, edge-disjoint paths, assignment with capacities, and project selection. After max flow, nodes reachable from the source in the residual graph define the source side of a minimum cut.

\`\`\`cpp
// Dinic's max-flow: O(V^2 * E) via BFS level graph + blocking flow with DFS.
struct Dinic {
  struct Edge {
    int to, rev;  // rev: index of reverse edge in g[to]
    long long cap;
  };

  int n;
  vector<vector<Edge>> g;
  // level: BFS distance from source; it: current edge pointer (arc advance)
  vector<int> level, it;

  Dinic(int n) : n(n), g(n), level(n), it(n) {}

  void addEdge(int u, int v, long long cap) {
    Edge a{v, (int)g[v].size(), cap};
    Edge b{u, (int)g[u].size(), 0};  // reverse edge starts with 0 capacity
    g[u].push_back(a);
    g[v].push_back(b);
  }

  // BFS to build the level graph; returns false when sink is unreachable.
  bool bfs(int s, int t) {
    fill(level.begin(), level.end(), -1);
    queue<int> q;
    level[s] = 0;
    q.push(s);
    while (!q.empty()) {
      int u = q.front();
      q.pop();
      for (const Edge& e : g[u]) {
        if (e.cap > 0 && level[e.to] == -1) {
          level[e.to] = level[u] + 1;
          q.push(e.to);
        }
      }
    }
    return level[t] != -1;
  }

  // DFS along level graph; it[u] skips saturated edges (arc-advance trick).
  long long dfs(int u, int t, long long f) {
    if (u == t) {
      return f;
    }
    for (int& i = it[u]; i < (int)g[u].size(); ++i) {
      Edge& e = g[u][i];
      if (e.cap > 0 && level[e.to] == level[u] + 1) {
        long long got = dfs(e.to, t, min(f, e.cap));
        if (got) {
          e.cap -= got;
          g[e.to][e.rev].cap += got;  // update reverse edge
          return got;
        }
      }
    }
    return 0;
  }

  long long maxFlow(int s, int t) {
    long long flow = 0;
    while (bfs(s, t)) {
      fill(it.begin(), it.end(), 0);  // reset arc pointers for new phase
      while (long long pushed = dfs(s, t, LLONG_MAX / 4)) {
        flow += pushed;
      }
    }
    return flow;
  }
};
\`\`\``,
    },
    {
      id: "min-cost-flow",
      title: "Min-cost max-flow",
      body: `Min-cost flow is for "send k units with minimum total cost" where each edge has capacity and cost. The template below uses SPFA potentials style for clarity; for very large graphs, use Dijkstra with potentials.

\`\`\`cpp
// Min-Cost Max-Flow: SPFA (Bellman-Ford via queue) to find cheapest augmenting
// paths.
struct MinCostMaxFlow {
  struct Edge {
    int to, rev, cap, cost;
  };

  int n;
  vector<vector<Edge>> g;

  MinCostMaxFlow(int n) : n(n), g(n) {}

  // Reverse edge carries negative cost to allow flow cancellation.
  void addEdge(int u, int v, int cap, int cost) {
    Edge a{v, (int)g[v].size(), cap, cost};
    Edge b{u, (int)g[u].size(), 0, -cost};
    g[u].push_back(a);
    g[v].push_back(b);
  }

  // Send up to 'need' units of flow; returns {actual flow, total cost}.
  pair<int, long long> minCostFlow(int s, int t, int need) {
    int flow = 0;
    long long cost = 0;
    const int INF = 1e9;

    while (flow < need) {
      // SPFA: shortest-path in residual graph (supports negative-cost edges).
      vector<int> dist(n, INF), pv(n, -1), pe(n, -1), inq(n, 0);
      queue<int> q;
      dist[s] = 0;
      q.push(s);
      inq[s] = 1;

      while (!q.empty()) {
        int u = q.front();
        q.pop();
        inq[u] = 0;
        for (int i = 0; i < (int)g[u].size(); ++i) {
          Edge& e = g[u][i];
          if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
            dist[e.to] = dist[u] + e.cost;
            pv[e.to] = u;  // predecessor node
            pe[e.to] = i;  // predecessor edge index
            if (!inq[e.to]) {
              q.push(e.to);
              inq[e.to] = 1;
            }
          }
        }
      }

      if (dist[t] == INF) {
        break;  // sink unreachable: no more augmenting paths
      }

      // Find bottleneck capacity along the shortest path.
      int add = need - flow;
      for (int v = t; v != s; v = pv[v]) {
        add = min(add, g[pv[v]][pe[v]].cap);
      }
      // Augment along the path and update residual capacities.
      for (int v = t; v != s; v = pv[v]) {
        Edge& e = g[pv[v]][pe[v]];
        e.cap -= add;
        g[v][e.rev].cap += add;
      }
      flow += add;
      cost += 1LL * add * dist[t];  // accumulate cost: units * cost-per-unit
    }

    return {flow, cost};
  }
};
\`\`\``,
    },
    {
      id: "hld",
      title: "Heavy-light decomposition for tree paths",
      body: `HLD breaks a tree path into \`O(log n)\` contiguous segments in an Euler-order array. Combine it with a segment tree or Fenwick tree for path sum, max, min, or update queries.

\`\`\`cpp
struct HLD {
  int n, timer = 0;
  vector<vector<int>> g;
  vector<int> parent, depth, heavy, head, pos, sz;

  HLD(int n)
      : n(n), g(n), parent(n), depth(n), heavy(n, -1), head(n), pos(n), sz(n) {}

  void addEdge(int u, int v) {
    g[u].push_back(v);
    g[v].push_back(u);
  }

  int dfsSize(int u, int p) {
    parent[u] = p;
    sz[u] = 1;
    int best = 0;
    for (int v : g[u]) {
      if (v == p) {
        continue;
      }
      depth[v] = depth[u] + 1;
      int sub = dfsSize(v, u);
      sz[u] += sub;
      if (sub > best) {
        best = sub;
        heavy[u] = v;
      }
    }
    return sz[u];
  }

  void dfsDecompose(int u, int h) {
    head[u] = h;
    pos[u] = timer++;
    if (heavy[u] != -1) {
      dfsDecompose(heavy[u], h);
    }
    for (int v : g[u]) {
      if (v != parent[u] && v != heavy[u]) {
        dfsDecompose(v, v);
      }
    }
  }

  void build(int root = 0) {
    depth[root] = 0;
    dfsSize(root, -1);
    dfsDecompose(root, root);
  }

  template <class Query>
  long long queryPath(int a, int b, Query querySegment) {
    long long ans = 0;
    while (head[a] != head[b]) {
      if (depth[head[a]] < depth[head[b]]) {
        swap(a, b);
      }
      ans += querySegment(pos[head[a]], pos[a]);
      a = parent[head[a]];
    }
    if (depth[a] > depth[b]) {
      swap(a, b);
    }
    ans += querySegment(pos[a], pos[b]);
    return ans;
  }
};

// Example usage with a Fenwick tree storing node weights:
// HLD hld(n); hld.build(0);
// long long pathSum = hld.queryPath(u, v, [&](int l, int r) {
//   return fenwick.sumRange(l + 1, r + 1);
// });
\`\`\``,
    },
    {
      id: "rollback-dsu",
      title: "Rollback DSU for offline dynamic connectivity",
      body: `When edges are added and removed over time, process queries offline with a segment tree over time and a rollback DSU. The DSU can undo unions when recursion leaves a time segment.

\`\`\`cpp
// DSU with rollback (no path compression): supports undo via a history stack.
struct RollbackDSU {
  vector<int> p, sz;
  vector<pair<int, int>>
      history;  // stores (node b, old size of root a) per unite
  int comps;

  RollbackDSU(int n) : p(n), sz(n, 1), comps(n) { iota(p.begin(), p.end(), 0); }

  // Path compression is intentionally omitted to make rollback O(log n)
  // correct.
  int find(int x) {
    while (x != p[x]) {
      x = p[x];
    }
    return x;
  }

  bool unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) {
      history.push_back({-1, -1});  // sentinel: no structural change
      return false;
    }
    if (sz[a] < sz[b]) {
      swap(a, b);  // union by size: attach smaller tree under larger
    }
    history.push_back({b, sz[a]});  // save enough info to undo this merge
    p[b] = a;
    sz[a] += sz[b];
    comps--;
    return true;
  }

  // Capture current history length as a restore point.
  int snapshot() const { return history.size(); }

  // Undo all unite() calls made after the given snapshot.
  void rollback(int snap) {
    while ((int)history.size() > snap) {
      auto [b, oldSizeA] = history.back();
      history.pop_back();
      if (b == -1) {
        continue;  // sentinel entry: nothing to reverse
      }
      int a = p[b];
      sz[a] = oldSizeA;  // restore parent's size
      p[b] = b;          // detach b back to its own root
      ++comps;
    }
  }
};
\`\`\``,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Algorithm | Complexity | Notes |
| --- | --- | --- |
| Tarjan SCC | \`O(V + E)\` | single DFS, linear |
| 2-SAT | \`O(V + E)\` | SCC on the implication graph |
| Kuhn matching | \`O(V * E)\` | small / medium bipartite graphs |
| Hopcroft-Karp | \`O(E sqrt V)\` | large bipartite matching |
| Dinic max flow | \`O(V^2 E)\` | \`O(E sqrt V)\` on unit capacities |
| Min-cost max-flow | \`O(V E)\` per augment | use potentials + Dijkstra to speed up |
| HLD + segment tree | \`O(log^2 n)\` per query | \`O(log n)\` chains times segment tree |`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `Advanced graph problems are almost always a *reduction* to one of these templates — name the reduction first, then drop in the trusted code.

| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| SCC condensation | "mutually reachable", collapse cycles to a DAG | Tarjan low-link, then condense | [Longest Cycle in a Graph](https://leetcode.cn/problems/longest-cycle-in-a-graph) |
| Bridges / articulation | "critical edge/node", removal disconnects | one DFS tracking \`disc\`/\`low\` | [Critical Connections](https://leetcode.cn/problems/critical-connections-in-a-network) |
| 2-SAT | two-literal boolean clauses, "at most one of" | implication graph + SCC | [Is Graph Bipartite?](https://leetcode.cn/problems/is-graph-bipartite) |
| Bipartite matching | assign left to distinct right objects | Kuhn augmenting paths | [Maximum Students Taking Exam](https://leetcode.cn/problems/maximum-students-taking-exam) |
| Assignment (min/max cost) | "match all, optimize total score/cost" | min-cost flow or Hungarian | [Maximum Compatibility Score Sum](https://leetcode.cn/problems/maximum-compatibility-score-sum) |
| Max flow / min cut | capacities, disjoint paths, "minimum cut" | Dinic; min cut = max flow | [Minimum XOR Sum of Two Arrays](https://leetcode.cn/problems/minimum-xor-sum-of-two-arrays) |
| Offline dynamic connectivity | edges added/removed over time | segment tree on time + rollback DSU | [Path Existence Queries II](https://leetcode.cn/problems/path-existence-queries-in-a-graph-ii) |

- The subtlest is **assignment vs. plain matching**: if every left node *must* be matched and you optimize a total cost, it is min-cost max-flow (or Hungarian), not unweighted Kuhn — Kuhn only maximizes the *count* of matched pairs.
- 2-SAT satisfiability is "no variable shares an SCC with its negation"; the recovered assignment direction depends on SCC numbering, so verify with a forced variable.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 1761 | [Minimum Degree of a Connected Trio in a Graph](https://leetcode.cn/problems/minimum-degree-of-a-connected-trio-in-a-graph) | 2005 | triangle enumeration |
| 2097 | [Valid Arrangement of Pairs](https://leetcode.cn/problems/valid-arrangement-of-pairs) | 2651 | Eulerian trail |
| 2608 | [Shortest Cycle in a Graph](https://leetcode.cn/problems/shortest-cycle-in-a-graph) | 1904 | cycle BFS |
| 332 | [Reconstruct Itinerary](https://leetcode.cn/problems/reconstruct-itinerary) | - | Eulerian path |
| 753 | [Cracking the Safe](https://leetcode.cn/problems/cracking-the-safe) | - | De Bruijn / Euler tour |
| 847 | [Shortest Path Visiting All Nodes](https://leetcode.cn/problems/shortest-path-visiting-all-nodes) | - | bitmask BFS |
| 1203 | [Sort Items by Groups Respecting Dependencies](https://leetcode.cn/problems/sort-items-by-groups-respecting-dependencies) | - | grouped topological sort |
| 1489 | [Critical and Pseudo-Critical Edges in MST](https://leetcode.cn/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree) | - | MST edge classification |
| 1514 | [Path with Maximum Probability](https://leetcode.cn/problems/path-with-maximum-probability) | - | multiplicative Dijkstra |
| 1579 | [Remove Max Number of Edges to Keep Graph Traversable](https://leetcode.cn/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable) | - | shared DSU |
| 3600 | [Maximize Spanning Tree Stability with Upgrades](https://leetcode.cn/problems/maximize-spanning-tree-stability-with-upgrades) | 2301 | MST / DSU |
| 3608 | [Minimum Time for K Connected Components](https://leetcode.cn/problems/minimum-time-for-k-connected-components) | 1893 | offline DSU |
| 3530 | [Maximum Profit from Valid Topological Order in DAG](https://leetcode.cn/problems/maximum-profit-from-valid-topological-order-in-dag) | 2353 | DAG topological DP |
| 3534 | [Path Existence Queries in a Graph II](https://leetcode.cn/problems/path-existence-queries-in-a-graph-ii) | 2507 | offline graph queries |
| 3615 | [Longest Palindromic Path in Graph](https://leetcode.cn/problems/longest-palindromic-path-in-graph) | 2463 | bitmask graph DP |
| 1192 | [Critical Connections in a Network](https://leetcode.cn/problems/critical-connections-in-a-network) | 2085 | Tarjan bridges classic |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- SCC component numbering depends on the implementation; do not assume topological order unless you verify it.
- 2-SAT assignment direction varies by SCC order. Test with simple forced variables.
- Kuhn matching should reset the DFS visited marker for each left node.
- Dinic needs reverse edges with correct indices.
- Min-cost flow with negative costs needs shortest augmenting paths on the residual graph.
- HLD path queries must define whether edge weights live on the child node or node weights live on every node.

\`\`\`cpp
// Edge-weight convention for HLD:
// Store the weight of edge parent[v] -> v at position pos[v].
// Then path query between a and b should exclude pos[lca] for edge-only sums.
if (depth[a] > depth[b]) {
  swap(a, b);
}
// query(pos[a] + 1, pos[b]) when a is the LCA and weights are on child nodes.
\`\`\``,
    },
  ],
};
