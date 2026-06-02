import type { HandbookTopic } from "../model";

export const trees: HandbookTopic = {
  slug: "trees",
  title: "Trees & Binary Trees",
  tagline:
    "Traversals, BST invariants, lowest common ancestor, and tree DP — recursion is your default tool.",
  icon: "Network",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Trees are connected acyclic graphs; binary trees are the most common form on LeetCode. Almost every tree problem is solved by **recursion**: define what a function returns for a node given the answers for its children. The rest is choosing the right traversal order and what to aggregate.

Signals & sub-topics:

- **Traversal**: preorder/inorder/postorder, level-order (BFS).
- **BST**: inorder gives sorted order; left < root < right enables \`O(h)\` search.
- **Aggregate up the tree** (height, diameter, sum) → postorder / tree DP.
- **Ancestor queries** → lowest common ancestor (LCA).
- **Construct / serialize** trees from traversals.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Recursion and the call stack; how a postorder function returns child results.
- Queues (for BFS) and stacks (for iterative traversal).

Related: [Data Structures](/handbook/data-structures), [Graph Algorithms](/handbook/graph) (a tree is a graph), [Dynamic Programming](/handbook/dynamic-programming) (tree DP).

\`\`\`cpp
// Standard node used throughout
struct TreeNode {
  int val;
  TreeNode *left, *right;
  TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
\`\`\``,
    },
    {
      id: "traversal",
      title: "Traversals: recursive and iterative",
      body: `Pre/in/postorder differ only in *when* you visit the node relative to its children.

\`\`\`cpp
// Recursive inorder (left, node, right) -> sorted for a BST
void inorder(TreeNode* r, vector<int>& out) {
  if (!r) {
    return;
  }
  inorder(r->left, out);
  out.push_back(r->val);
  inorder(r->right, out);
}
\`\`\`

Iterative inorder with an explicit stack (useful when recursion depth is a concern):

\`\`\`cpp
// Iterative inorder traversal (LC 94)
vector<int> inorderIter(TreeNode* root) {
  vector<int> out;
  stack<TreeNode*> st;
  TreeNode* cur = root;
  while (cur || !st.empty()) {
    while (cur) {  // dive left
      st.push(cur);
      cur = cur->left;
    }
    cur = st.top();
    st.pop();
    out.push_back(cur->val);
    cur = cur->right;  // then right
  }
  return out;
}
\`\`\``,
    },
    {
      id: "bfs",
      title: "Level-order traversal (BFS)",
      body: `Process the tree level by level with a queue; capture the level size up front to group nodes.

\`\`\`cpp
// Level-order traversal grouped by depth (LC 102)
vector<vector<int>> levelOrder(TreeNode* root) {
  vector<vector<int>> res;
  if (!root) {
    return res;
  }
  queue<TreeNode*> q;
  q.push(root);
  while (!q.empty()) {
    int sz = q.size();
    vector<int> level;
    for (int i = 0; i < sz; i++) {
      TreeNode* node = q.front();
      q.pop();
      level.push_back(node->val);
      if (node->left) {
        q.push(node->left);
      }
      if (node->right) {
        q.push(node->right);
      }
    }
    res.push_back(level);
  }
  return res;
}
\`\`\`

The same loop yields right-side view (last of each level, LC 199), zigzag order (LC 103), and average per level (LC 637).`,
    },
    {
      id: "bst",
      title: "Binary search trees",
      body: `In a BST, \`left < node < right\`, so search/insert/delete cost \`O(h)\` and an **inorder traversal is sorted** — the key insight behind validation and Kth-smallest.

\`\`\`cpp
// Validate BST using min/max bounds (LC 98)
bool valid(TreeNode* r, long lo, long hi) {
  if (!r) {
    return true;
  }
  if (r->val <= lo || r->val >= hi) {
    return false;
  }
  return valid(r->left, lo, r->val) && valid(r->right, r->val, hi);
}
// call: valid(root, LONG_MIN, LONG_MAX)
\`\`\`

\`\`\`cpp
// Kth smallest in a BST (LC 230) via inorder counting
int kthSmallest(TreeNode* root, int k) {
  stack<TreeNode*> st;
  TreeNode* cur = root;
  while (cur || !st.empty()) {
    while (cur) {
      st.push(cur);
      cur = cur->left;
    }
    cur = st.top();
    st.pop();
    if (--k == 0) {
      return cur->val;
    }
    cur = cur->right;
  }
  return -1;
}
\`\`\``,
    },
    {
      id: "treedp",
      title: "Tree DP: aggregate answers up the tree",
      body: `Return a tuple of facts from each child, combine at the parent, and update a global answer. Diameter and max path sum are the archetypes.

\`\`\`cpp
// Diameter (longest path in edges, LC 543): height returns depth, updates best
int best = 0;
int height(TreeNode* r) {
  if (!r) {
    return 0;
  }
  int L = height(r->left), R = height(r->right);
  best = max(best, L + R);  // path through r uses both children
  return 1 + max(L, R);     // height contributed upward
}
\`\`\`

\`\`\`cpp
// Max path sum (LC 124): a node may "drop" a negative branch
int maxSum = INT_MIN;
int gain(TreeNode* r) {
  if (!r) {
    return 0;
  }
  int L = max(0, gain(r->left)), R = max(0, gain(r->right));  // ignore negatives
  maxSum = max(maxSum, r->val + L + R);
  return r->val + max(L, R);
}
\`\`\`

House Robber III (LC 337) returns a pair {rob, skip} per node — the canonical tree DP with state.`,
    },
    {
      id: "lca",
      title: "Lowest common ancestor",
      body: `The LCA is the deepest node that has both targets in its subtree. Postorder recursion finds it in one pass.

\`\`\`cpp
// LCA in a binary tree (LC 236)
TreeNode* lca(TreeNode* r, TreeNode* p, TreeNode* q) {
  if (!r || r == p || r == q) {
    return r;
  }
  TreeNode* L = lca(r->left, p, q);
  TreeNode* R = lca(r->right, p, q);
  if (L && R) {  // p and q split here -> r is the LCA
    return r;
  }
  return L ? L : R;  // both on one side (or neither)
}
\`\`\`

In a **BST** the LCA is simpler: walk down, going left/right until \`p\` and \`q\` fall on opposite sides of the current node (LC 235).`,
    },
    {
      id: "construct",
      title: "Construction & serialization",
      body: `Rebuild a tree from traversals using the fact that preorder gives the root and inorder splits left/right.

\`\`\`cpp
// Build tree from preorder + inorder (LC 105)
TreeNode* build(vector<int>& pre, vector<int>& in) {
  unordered_map<int, int> pos;  // value -> index in inorder
  for (int i = 0; i < (int)in.size(); i++) {
    pos[in[i]] = i;
  }
  int idx = 0;
  function<TreeNode*(int, int)> go = [&](int l, int r) -> TreeNode* {
    if (l > r) {
      return nullptr;
    }
    int v = pre[idx++];
    TreeNode* node = new TreeNode(v);
    node->left = go(l, pos[v] - 1);
    node->right = go(pos[v] + 1, r);
    return node;
  };
  return go(0, (int)in.size() - 1);
}
\`\`\`

Serialize/deserialize (LC 297) uses preorder with explicit null markers ("#") so the structure is recoverable.`,
    },
    {
      id: "binary-lifting",
      title: "Binary lifting for LCA & ancestor queries",
      body: `When you must answer many LCA or "kth ancestor" queries, precompute \`up[k][v]\` = the \`2^k\`-th ancestor of \`v\`. Build in \`O(n log n)\`, then each query is \`O(log n)\`.

\`\`\`cpp
// LCA by binary lifting (LC 1483 Kth Ancestor uses the same up[][] table)
struct LCA {
  int LOG;
  vector<int> depth;
  vector<vector<int>> up;
  LCA(int n, vector<vector<int>>& adj, int root = 0) {
    LOG = 1;
    while ((1 << LOG) < n) {
      LOG++;
    }
    depth.assign(n, 0);
    up.assign(LOG, vector<int>(n, root));
    function<void(int, int)> dfs = [&](int u, int p) {
      up[0][u] = p;
      for (int v : adj[u]) {
        if (v != p) {
          depth[v] = depth[u] + 1;
          dfs(v, u);
        }
      }
    };
    dfs(root, root);
    for (int k = 1; k < LOG; k++) {
      for (int v = 0; v < n; v++) {
        up[k][v] = up[k - 1][up[k - 1][v]];
      }
    }
  }
  int lca(int a, int b) {
    if (depth[a] < depth[b]) {
      swap(a, b);
    }
    int d = depth[a] - depth[b];
    for (int k = 0; k < LOG; k++) {  // lift a up to b
      if (d & (1 << k)) {
        a = up[k][a];
      }
    }
    if (a == b) {
      return a;
    }
    for (int k = LOG - 1; k >= 0; k--) {
      if (up[k][a] != up[k][b]) {
        a = up[k][a];
        b = up[k][b];
      }
    }
    return up[0][a];
  }
};
\`\`\``,
    },
    {
      id: "rerooting",
      title: "Rerooting DP & Morris traversal",
      body: `**Rerooting** computes a per-node answer that depends on the *whole* tree (e.g. sum of distances to all other nodes) in \`O(n)\` with two DFS passes: one to get subtree aggregates and the root's answer, one to shift the root from parent to child.

\`\`\`cpp
// Sum of Distances in Tree (LC 834): two passes
vector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {
  vector<vector<int>> g(n);
  for (auto& e : edges) {
    g[e[0]].push_back(e[1]);
    g[e[1]].push_back(e[0]);
  }
  vector<int> cnt(n, 1), ans(n, 0);
  function<void(int, int)> post = [&](int u, int p) {
    for (int v : g[u]) {
      if (v != p) {
        post(v, u);
        cnt[u] += cnt[v];
        ans[u] += ans[v] + cnt[v];
      }
    }
  };
  function<void(int, int)> reroot = [&](int u, int p) {
    for (int v : g[u]) {
      if (v != p) {
        ans[v] = ans[u] - cnt[v] + (n - cnt[v]);
        reroot(v, u);
      }
    }
  };
  post(0, -1);
  reroot(0, -1);
  return ans;
}
\`\`\`

**Morris traversal** does inorder in \`O(1)\` extra space by temporarily threading each node to its inorder successor.

\`\`\`cpp
// Morris inorder traversal: O(1) space
vector<int> morrisInorder(TreeNode* root) {
  vector<int> out;
  TreeNode* cur = root;
  while (cur) {
    if (!cur->left) {
      out.push_back(cur->val);
      cur = cur->right;
    } else {
      TreeNode* pre = cur->left;
      while (pre->right && pre->right != cur) {
        pre = pre->right;
      }
      if (!pre->right) {  // create thread
        pre->right = cur;
        cur = cur->left;
      } else {  // remove
        pre->right = nullptr;
        out.push_back(cur->val);
        cur = cur->right;
      }
    }
  }
  return out;
}
\`\`\``,
    },
    {
      id: "advanced-trees",
      title: "Advanced techniques (hard problems)",
      body: `**Greedy tree DP (LC 968 Binary Tree Cameras).** Return a state per node (covered / has-camera / needs-cover) and place cameras bottom-up only when forced — a postorder greedy that minimizes count.

**Euler tour flattening.** Number nodes by entry/exit time so a subtree becomes a contiguous range; subtree updates/queries then reduce to a Fenwick or segment tree over that range. This turns "add to all descendants" / "sum over subtree" into 1D range ops.

**Heavy-Light Decomposition (HLD).** Splits the tree into chains so any root-to-node path crosses \`O(log n)\` chains; combined with a segment tree it answers path-sum / path-max / path-update in \`O(log^2 n)\` — the tool for hard path-query problems.

**Hard problems worth studying:** Binary Tree Maximum Path Sum (LC 124), Binary Tree Cameras (LC 968), Sum of Distances in Tree (LC 834), Kth Ancestor of a Tree Node (LC 1483, binary lifting), Distribute Coins in Binary Tree (LC 979, flow-as-DP), and Count Pairs Of Nodes within a distance (Euler tour + BIT).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation | Time | Space |
| --- | --- | --- |
| Any traversal | \`O(n)\` | \`O(h)\` stack / \`O(n)\` BFS |
| BST search/insert/delete | \`O(h)\` | \`O(h)\` |
| Tree DP (diameter, path sum) | \`O(n)\` | \`O(h)\` |
| LCA (binary tree) | \`O(n)\` | \`O(h)\` |
| Construction | \`O(n)\` | \`O(n)\` |

\`h\` is the height: \`O(log n)\` if balanced, \`O(n)\` in the worst case.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 94 / 144 / 145 | [Traversals](https://leetcode.cn/problems/binary-tree-inorder-traversal) | recursion / stack |
| 102 / 103 / 199 | [Level](https://leetcode.cn/problems/binary-tree-level-order-traversal) / [Zigzag](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal) / [Right View](https://leetcode.cn/problems/binary-tree-right-side-view) | BFS |
| 98 | [Validate BST](https://leetcode.cn/problems/validate-binary-search-tree) | bounds recursion |
| 230 | [Kth Smallest in BST](https://leetcode.cn/problems/kth-smallest-element-in-a-bst) | inorder |
| 235 / 236 | [LCA (BST / binary)](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree) | descent / postorder |
| 543 | [Diameter](https://leetcode.cn/problems/diameter-of-binary-tree) | tree DP |
| 124 | [Max Path Sum](https://leetcode.cn/problems/binary-tree-maximum-path-sum) | tree DP with drop |
| 337 | [House Robber III](https://leetcode.cn/problems/house-robber-iii) | tree DP with state |
| 105 / 106 | [Construct from Traversals](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal) | divide & conquer |
| 297 | [Serialize and Deserialize](https://leetcode.cn/problems/serialize-and-deserialize-binary-tree) | preorder + null markers |
| 226 | [Invert Binary Tree](https://leetcode.cn/problems/invert-binary-tree) | recursion |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 2458 | [Height of Binary Tree After Subtree Removal Queries](https://leetcode.cn/problems/height-of-binary-tree-after-subtree-removal-queries) | DFS in/out order |
| 2467 | [Most Profitable Path in a Tree](https://leetcode.cn/problems/most-profitable-path-in-a-tree) | tree + BFS paths |
| 2049 | [Count Nodes With the Highest Score](https://leetcode.cn/problems/count-nodes-with-the-highest-score) | tree DP |
| 1483 | [Kth Ancestor of a Tree Node](https://leetcode.cn/problems/kth-ancestor-of-a-tree-node) | binary lifting |
| 834 | [Sum of Distances in Tree](https://leetcode.cn/problems/sum-of-distances-in-tree) | rerooting DP |
| 968 | [Binary Tree Cameras](https://leetcode.cn/problems/binary-tree-cameras) | greedy tree DP |
| 979 | [Distribute Coins in Binary Tree](https://leetcode.cn/problems/distribute-coins-in-binary-tree) | flow-as-DP |

**Recent medium problems (rating ≥ 1800)**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 3331 | [Find Subtree Sizes After Changes](https://leetcode.cn/problems/find-subtree-sizes-after-changes) | 2046 | DFS + relabel |
| 2477 | [Minimum Fuel Cost to Report to the Capital](https://leetcode.cn/problems/minimum-fuel-cost-to-report-to-the-capital) | 2012 | tree DFS |
| 3593 | [Minimum Increments to Equalize Leaf Paths](https://leetcode.cn/problems/minimum-increments-to-equalize-leaf-paths) | 1959 | tree DP (postorder) |
| 3372 | [Maximize the Number of Target Nodes After Connecting Trees I](https://leetcode.cn/problems/maximize-the-number-of-target-nodes-after-connecting-trees-i) | 1927 | tree BFS / DP |
| 3067 | [Count Pairs of Connectable Servers in a Weighted Tree Network](https://leetcode.cn/problems/count-pairs-of-connectable-servers-in-a-weighted-tree-network) | 1909 | tree DFS |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Recursion depth**: a skewed tree can be \`O(n)\` deep — switch to iterative traversal if stack overflow is a risk.
- **BST validation** must use *bounds*, not just compare a node to its immediate children.
- **Global vs. returned value** in tree DP: the path *through* a node updates the answer, but the value *returned* upward can only extend one branch.
- **Null handling**: guard \`if (!root)\` first in every recursive function.
- **Use \`long\`** in BST validation to avoid overflow on \`INT_MIN/INT_MAX\` values.`,
    },
  ],
};
