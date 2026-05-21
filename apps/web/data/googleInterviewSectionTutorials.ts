import { sectionAnchor } from "@/utils/sectionAnchor";

export interface GoogleInterviewSectionTutorial {
  id: number;
  title: string;
  slug: string;
  content: string;
}

const sectionTutorials = [
  {
    id: 2,
    title: "1. 圖搜尋與最短路",
    summary:
      "這章處理「從一個狀態走到其他狀態」的問題。從零開始看，圖搜尋不是只在明顯的 graph 上使用；只要題目可以描述成「目前在哪裡、下一步能做什麼、做一步的代價是多少」，就可以建成狀態圖。網格中的格子、字串轉換後的字串、已收集鑰匙的集合、甚至剩餘資源量，都可能是狀態的一部分。\n\n**核心觀念**：\n- BFS 用在每一步代價相同的最短步數問題。第一次抵達某狀態時，距離一定最短。\n- 0-1 BFS 用在邊權只有 0 和 1 的圖，用 deque 維護候選狀態。\n- Dijkstra 用在非負權重圖。每次取出目前已知距離最小的狀態並鬆弛鄰居。\n- visited 不能只憑直覺寫。若未來選擇會受「剩餘資源、鑰匙集合、方向、時間」影響，這些都要進入狀態。\n\n**系統例題：網格最短路，最多消除 k 個障礙**\n\n題目：給一個 0/1 網格，從左上走到右下，每步上下左右移動，遇到 1 可以消耗一次消除機會，最多消除 k 次，求最少步數。\n\n解題步驟：\n1. 狀態不是 `(r, c)`，而是 `(r, c, left)`，其中 `left` 是剩餘消除次數。\n2. 每次移動代價都是 1，所以使用 BFS。\n3. 同一格可能以不同 `left` 抵達。若我們曾用更多剩餘次數到過同一格，現在用更少次數到達就沒有價值。\n4. 用 `best[r][c]` 記錄到達此格時看過的最大剩餘消除次數，只在新狀態更好時入隊。\n\n**C++：BFS + 資源維度剪枝**\n\n```cpp\n// shortest path in grid with at most k obstacle eliminations\nint shortestPath(vector<vector<int>>& grid, int k) {\n    int m = grid.size(), n = grid[0].size();\n    vector<vector<int>> best(m, vector<int>(n, -1));\n    queue<array<int, 4>> q; // row, col, remaining eliminations, distance\n\n    q.push({0, 0, k, 0});\n    best[0][0] = k;\n    int dirs[5] = {1, 0, -1, 0, 1};\n\n    while (!q.empty()) {\n        auto [r, c, left, dist] = q.front();\n        q.pop();\n        if (r == m - 1 && c == n - 1) return dist;\n\n        for (int d = 0; d < 4; ++d) {\n            int nr = r + dirs[d], nc = c + dirs[d + 1];\n            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;\n\n            int nextLeft = left - grid[nr][nc];\n            if (nextLeft < 0) continue;\n            if (nextLeft <= best[nr][nc]) continue;\n\n            best[nr][nc] = nextLeft;\n            q.push({nr, nc, nextLeft, dist + 1});\n        }\n    }\n    return -1;\n}\n```\n\n複雜度是 `O(m*n*k)` 的上界，但 `best` 剪枝常把實際狀態數壓小。面試時要主動說明：如果障礙消除次數不是資源，而是有不同代價，模型就要改成 Dijkstra。",
  },
  {
    id: 3,
    title: "2. 樹與圖建模",
    summary: [
      "這章訓練把題目文字轉成圖、樹或 DAG。初學時最常卡住的不是 DFS 寫法，而是沒有先判斷關係的性質：邊是有向還是無向、是否保證無環、是否一定連通、是否有唯一父節點。Google 題常把「課程、任務、城市、員工、父子關係」包成資料表；只要模型選對，後面通常就是拓撲排序、DFS/BFS、並查集、樹形 DP、Tarjan 找橋或強連通分量。",
      "**從零建模總表**：\n- 有先後依賴：建有向圖。若依賴可能成環，用拓撲排序檢查是否能處理全部節點；若需要最早完成時間，拓撲順序上做 DP。\n- 無向連通關係：建無向圖。若要走訪或統計每個連通塊，用 DFS/BFS；若邊是逐步加入、只問兩點是否連通，用並查集。\n- 每個點除根以外只有一個父節點：通常是樹。用 DFS 回傳子樹資訊，例如 size、sum、高度、是否滿足條件。\n- 問刪掉一條邊是否斷開：考慮橋。橋是無向圖中移除後會增加連通塊數的邊。\n- 問強依賴群組或互相可達：考慮強連通分量。SCC 是有向圖中任兩點都能互相到達的一組點。",
      "**Pattern 1：有向依賴圖 + 拓撲排序**\n\n使用時機：題目有「必須先完成 A 才能做 B」、「課程先修」、「任務依賴」、「build pipeline」等描述。建邊時要固定語意：若 `u -> v` 表示 u 是 v 的 prerequisite，拓撲順序中 u 必須出現在 v 前面。\n\n系統例題：有 n 門課，每門課需要 `time[i]`，關係 `u -> v` 表示必須先完成 u 才能開始 v。可以平行上課，求完成全部課程的最早時間。\n\n解題步驟：\n1. 這是有向依賴圖。若有環，課程無法全部完成。\n2. `finish[i]` 表示完成第 i 門課的最早時間。\n3. 入度為 0 的課可立刻開始，完成時間是 `time[i]`。\n4. 拓撲排序彈出 u 後，用 `finish[u] + time[v]` 更新後繼 v。\n5. 若最後處理節點數小於 n，代表存在 cycle；否則答案是 `max(finish)`。",
      "```cpp\n// Topological sort + longest path on a DAG.\nint minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {\n    vector<vector<int>> g(n);\n    vector<int> indeg(n), finish(n);\n\n    for (auto& e : relations) {\n        int u = e[0] - 1, v = e[1] - 1;\n        g[u].push_back(v);\n        indeg[v]++;\n    }\n\n    queue<int> q;\n    for (int i = 0; i < n; ++i) {\n        finish[i] = time[i];\n        if (indeg[i] == 0) q.push(i);\n    }\n\n    int seen = 0;\n    while (!q.empty()) {\n        int u = q.front();\n        q.pop();\n        seen++;\n        for (int v : g[u]) {\n            finish[v] = max(finish[v], finish[u] + time[v]);\n            if (--indeg[v] == 0) q.push(v);\n        }\n    }\n\n    if (seen < n) return -1;\n    return *max_element(finish.begin(), finish.end());\n}\n```",
      "**Pattern 2：無向圖連通塊 + DFS/BFS**\n\n使用時機：題目問「有幾個群組」、「每個群組大小」、「從某點能走到哪些點」、「網路是否全部連通」。DFS/BFS 適合一次性走訪整張靜態圖，因為你能在走訪時同步統計連通塊資訊。\n\n系統例題：給 n 個城市和無向邊，求連通塊數量。\n\n解題步驟：\n1. 建無向 adjacency list，因為關係是雙向可達。\n2. 用 `visited` 避免重複走訪。\n3. 每遇到一個未走訪節點，就代表發現新連通塊，從它開始 DFS/BFS 標記整塊。\n4. DFS 和 BFS 在此題複雜度相同，都是 `O(V+E)`。",
      "```cpp\n// Count connected components with DFS.\nint countComponents(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> g(n);\n    for (auto& e : edges) {\n        g[e[0]].push_back(e[1]);\n        g[e[1]].push_back(e[0]);\n    }\n\n    vector<char> seen(n, false);\n    function<void(int)> dfs = [&](int u) {\n        seen[u] = true;\n        for (int v : g[u]) {\n            if (!seen[v]) dfs(v);\n        }\n    };\n\n    int components = 0;\n    for (int i = 0; i < n; ++i) {\n        if (seen[i]) continue;\n        components++;\n        dfs(i);\n    }\n    return components;\n}\n```",
      "**Pattern 3：逐步合併關係 + 並查集**\n\n使用時機：邊或關係是一條一條加入，並且問題主要是「兩個點是否在同一群」、「加入這條邊是否形成環」、「目前還有幾個集合」。並查集不適合刪邊，也不適合回答路徑長度；它只維護集合代表元。\n\n系統例題：給一批無向邊，判斷是否能形成一棵合法樹。\n\n解題步驟：\n1. 樹需要剛好 `n-1` 條邊，且整張圖連通、無環。\n2. 用 DSU 逐條加入邊；若加入前兩端已在同一集合，這條邊會形成環。\n3. 最後若沒有環且邊數是 `n-1`，就是樹。",
      "```cpp\n// Union Find for validating whether an undirected graph is a tree.\nclass DSU {\n    vector<int> parent, size;\n\npublic:\n    DSU(int n) : parent(n), size(n, 1) {\n        iota(parent.begin(), parent.end(), 0);\n    }\n\n    int find(int x) {\n        if (parent[x] == x) return x;\n        return parent[x] = find(parent[x]);\n    }\n\n    bool unite(int a, int b) {\n        int ra = find(a), rb = find(b);\n        if (ra == rb) return false;\n        if (size[ra] < size[rb]) swap(ra, rb);\n        parent[rb] = ra;\n        size[ra] += size[rb];\n        return true;\n    }\n};\n\nbool validTree(int n, vector<vector<int>>& edges) {\n    if ((int)edges.size() != n - 1) return false;\n    DSU dsu(n);\n    for (auto& e : edges) {\n        if (!dsu.unite(e[0], e[1])) return false;\n    }\n    return true;\n}\n```",
      "**Pattern 4：樹 + 子樹資訊合併**\n\n使用時機：題目保證是樹，或每個點除了根以外只有一個父節點。樹沒有環，所以 DFS 時只需要避開 parent；每個節點的答案通常能由孩子答案合併。\n\n系統例題：給一棵樹與每個節點的值，統計有多少個子樹總和能被 k 整除。若某個子樹總和能被 k 整除，就可以把它切出來，向父節點回傳 0。\n\n解題步驟：\n1. 從任意節點當根做 DFS。\n2. `dfs(u)` 回傳 u 子樹尚未被切走的總和模 k。\n3. 合併所有孩子回傳值與 `value[u]`。\n4. 若當前總和模 k 為 0，答案加一，並向父節點回傳 0。",
      "```cpp\n// Tree DFS that merges child subtree information.\nint countDivisibleSubtrees(int n, vector<vector<int>>& edges, vector<int>& values, int k) {\n    vector<vector<int>> tree(n);\n    for (auto& e : edges) {\n        tree[e[0]].push_back(e[1]);\n        tree[e[1]].push_back(e[0]);\n    }\n\n    int ans = 0;\n    function<int(int, int)> dfs = [&](int u, int parent) {\n        long long sum = values[u] % k;\n        for (int v : tree[u]) {\n            if (v == parent) continue;\n            sum += dfs(v, u);\n        }\n        sum %= k;\n        if (sum == 0) {\n            ans++;\n            return 0;\n        }\n        return (int)sum;\n    };\n\n    dfs(0, -1);\n    return ans;\n}\n```",
      "**Pattern 5：無向圖關鍵邊 + 橋（Tarjan low-link）**\n\n使用時機：題目問「移除哪條邊會讓網路斷開」、「critical connections」、「某條邊是否不可替代」。DFS 樹中，若子節點 v 及其子樹無法透過 back edge 回到 u 或 u 的祖先，則 `(u, v)` 是橋。\n\n系統例題：找出無向圖中所有 critical connections。\n\n解題步驟：\n1. `dfn[u]` 是第一次拜訪 u 的時間戳。\n2. `low[u]` 是 u 透過 DFS tree edge 加最多一條 back edge 能到達的最小 dfn。\n3. DFS 完 child v 後，若 `low[v] > dfn[u]`，代表 v 子樹沒有任何路能繞回 u 或 u 祖先，所以 `(u, v)` 是橋。\n4. 無向圖要用 edge id 避免把父邊誤當 back edge。",
      "```cpp\n// Tarjan bridge-finding in an undirected graph.\nvector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {\n    vector<vector<pair<int, int>>> g(n);\n    for (int i = 0; i < (int)connections.size(); ++i) {\n        int u = connections[i][0], v = connections[i][1];\n        g[u].push_back({v, i});\n        g[v].push_back({u, i});\n    }\n\n    vector<int> dfn(n, 0), low(n, 0);\n    vector<vector<int>> bridges;\n    int timer = 0;\n\n    function<void(int, int)> dfs = [&](int u, int parentEdge) {\n        dfn[u] = low[u] = ++timer;\n        for (auto [v, edgeId] : g[u]) {\n            if (edgeId == parentEdge) continue;\n            if (!dfn[v]) {\n                dfs(v, edgeId);\n                low[u] = min(low[u], low[v]);\n                if (low[v] > dfn[u]) bridges.push_back({u, v});\n            } else {\n                low[u] = min(low[u], dfn[v]);\n            }\n        }\n    };\n\n    for (int i = 0; i < n; ++i) {\n        if (!dfn[i]) dfs(i, -1);\n    }\n    return bridges;\n}\n```",
      "**Pattern 6：有向圖互相依賴群組 + 強連通分量（SCC）**\n\n使用時機：題目描述有向依賴，且要找「互相可達」、「互相依賴」、「一組節點可以彼此到達」。把每個 SCC 壓縮成一個點後，整張圖會變成 DAG，很多問題就能接拓撲排序或 DP。\n\n系統例題：給有向圖，找出所有強連通分量。這裡用 Kosaraju：先在原圖 DFS 得到完成順序，再在反圖依反向完成順序 DFS，每次走到的一整塊就是一個 SCC。\n\n解題步驟：\n1. 原圖 DFS，節點完成時放入 `order`。\n2. 建反圖。\n3. 反向掃 `order`，在反圖上 DFS；每次 DFS 收集到的 nodes 互相可達，是一個 SCC。\n4. 若要解依賴問題，可以把每個 SCC 編號後建 component DAG。",
      "```cpp\n// Kosaraju algorithm for strongly connected components.\nvector<vector<int>> stronglyConnectedComponents(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> g(n), rg(n);\n    for (auto& e : edges) {\n        g[e[0]].push_back(e[1]);\n        rg[e[1]].push_back(e[0]);\n    }\n\n    vector<char> seen(n, false);\n    vector<int> order;\n\n    function<void(int)> dfs1 = [&](int u) {\n        seen[u] = true;\n        for (int v : g[u]) {\n            if (!seen[v]) dfs1(v);\n        }\n        order.push_back(u);\n    };\n\n    for (int i = 0; i < n; ++i) {\n        if (!seen[i]) dfs1(i);\n    }\n\n    vector<vector<int>> components;\n    fill(seen.begin(), seen.end(), false);\n\n    function<void(int, vector<int>&)> dfs2 = [&](int u, vector<int>& comp) {\n        seen[u] = true;\n        comp.push_back(u);\n        for (int v : rg[u]) {\n            if (!seen[v]) dfs2(v, comp);\n        }\n    };\n\n    reverse(order.begin(), order.end());\n    for (int u : order) {\n        if (seen[u]) continue;\n        vector<int> comp;\n        dfs2(u, comp);\n        components.push_back(comp);\n    }\n    return components;\n}\n```",
      "**面試時的總結方式**：先說資料如何建圖，再說圖的性質，最後說演算法。比如：「這是有向依賴圖，所以我先檢查 cycle，若無 cycle 就在拓撲順序上做 DP」；或「這是無向靜態連通問題，所以 DFS 一次走訪每個 component 就夠，不需要 DSU」。這種回答比直接丟模板更容易讓面試官確認你真的理解模型。",
    ].join("\n\n"),
  },
  {
    id: 4,
    title: "3. 動態規劃與搜尋優化",
    summary:
      "這章的核心是把暴力搜尋改成「只記必要資訊」。動態規劃從零開始可以理解成：很多搜尋路徑會重複到達同一種局面，只要這些局面的未來完全一樣，就可以把局面變成狀態並重用答案。設計 DP 時，不要先想陣列大小，先用一句話定義 `dp` 的意義。\n\n**DP 設計流程**：\n1. 狀態：處理到哪個位置？用了多少資源？目前限制還剩多少？\n2. 選擇：這一步選或不選、接在哪個前一狀態後面、或切在哪裡。\n3. 轉移：把選擇寫成公式，確認每個依賴狀態已經算好。\n4. 初始值：最大化用很小值，最小化用 INF，計數用 0/1 起點。\n5. 優化：如果轉移太慢，再找排序、二分、前綴最佳值或單調資料結構。\n\n**系統例題：帶權工作排程**\n\n題目：每份工作有開始時間、結束時間、收益，不能選時間重疊的工作，求最大收益。\n\n解題步驟：\n1. 先按結束時間排序，讓「前面工作」代表已經較早結束。\n2. 定義 `dp[i]`：只考慮前 i 個排序後工作時的最大收益。\n3. 對第 i 個工作，有兩種選擇：不選它，答案是 `dp[i-1]`；選它，就要接在最後一個結束時間 `<= start` 的工作後面。\n4. 用二分找到相容工作的數量 `j`，轉移為 `dp[i] = max(dp[i-1], dp[j] + profit)`。\n\n**C++：排序 + 二分 + 一維 DP**\n\n```cpp\n// weighted interval scheduling\nint jobScheduling(vector<int>& start, vector<int>& end, vector<int>& profit) {\n    int n = start.size();\n    vector<array<int, 3>> jobs;\n    for (int i = 0; i < n; ++i) {\n        jobs.push_back({end[i], start[i], profit[i]});\n    }\n    sort(jobs.begin(), jobs.end());\n\n    vector<int> ends(n);\n    for (int i = 0; i < n; ++i) ends[i] = jobs[i][0];\n\n    vector<int> dp(n + 1, 0);\n    for (int i = 1; i <= n; ++i) {\n        auto [e, s, p] = jobs[i - 1];\n        int j = upper_bound(ends.begin(), ends.end(), s) - ends.begin();\n        dp[i] = max(dp[i - 1], dp[j] + p);\n    }\n    return dp[n];\n}\n```\n\n複雜度是 `O(n log n)`。面試時要能說出為什麼排序後可以只看前綴，為什麼 `dp[j]` 已經包含所有不重疊工作，而不是只選第 j 份工作。",
  },
  {
    id: 5,
    title: "4. 字串、Trie 與雜湊",
    summary:
      "字串題的第一步是判斷「比較單位」。初學時常用雙層迴圈逐字比較，但面試輸入一大就會超時。常見技巧都是為了快速回答某種比較：KMP 和 Z 函式處理前綴/模式匹配，rolling hash 處理任意子串相等，Trie 處理大量字典詞的共同前綴。\n\n**常見選型**：\n- 找 pattern 在 text 中所有出現位置：KMP 或 Z 函式。\n- 判斷大量子串是否相等：rolling hash，實務上可用雙模或 64-bit 降低碰撞風險。\n- 對字典詞反覆查前綴：Trie。\n- 字串轉換帶代價：把字元或字串建成圖，再接最短路或 DP。\n\n**系統例題：找出 pattern 在 text 中的所有位置**\n\n暴力做法是每個位置都比較一次 pattern，最壞 `O(n*m)`。KMP 的關鍵是：當匹配失敗時，不必把 pattern 退回 0，而是利用 pattern 自己的最長相等前後綴，跳到下一個仍可能匹配的位置。\n\n解題步驟：\n1. 對 `pattern` 建 prefix function，`pi[i]` 表示 `pattern[0..i]` 的最長 proper prefix，同時也是 suffix 的長度。\n2. 掃描 text 時用指標 `j` 表示 pattern 已匹配長度。\n3. 若字元不等，沿 `pi` 回退；若相等，`j++`。\n4. `j == m` 時找到一次匹配，記錄起點並繼續回退到 `pi[m-1]`。\n\n**C++：KMP 模式匹配**\n\n```cpp\n// KMP prefix function and pattern search\nvector<int> prefixFunction(const string& s) {\n    int n = s.size();\n    vector<int> pi(n, 0);\n    for (int i = 1; i < n; ++i) {\n        int j = pi[i - 1];\n        while (j > 0 && s[i] != s[j]) j = pi[j - 1];\n        if (s[i] == s[j]) j++;\n        pi[i] = j;\n    }\n    return pi;\n}\n\nvector<int> findMatches(const string& text, const string& pattern) {\n    vector<int> pi = prefixFunction(pattern);\n    vector<int> ans;\n    int j = 0, m = pattern.size();\n\n    for (int i = 0; i < (int)text.size(); ++i) {\n        while (j > 0 && text[i] != pattern[j]) j = pi[j - 1];\n        if (text[i] == pattern[j]) j++;\n        if (j == m) {\n            ans.push_back(i - m + 1);\n            j = pi[j - 1];\n        }\n    }\n    return ans;\n}\n```\n\nKMP 是 `O(n+m)`。如果題目不是固定 pattern，而是任意兩段子串比較，KMP 就不合適，應改用 hash 或後綴相關工具。",
  },
  {
    id: 6,
    title: "5. 資料結構與離線處理",
    summary:
      "資料結構題的關鍵不是背容器名稱，而是維護不變式。從零開始可以這樣想：題目有一串操作，每次操作後，你要快速回答某種查詢。資料結構就是讓更新和查詢都維持在可接受複雜度的索引。不變式一旦破壞，後面的查詢就會錯。\n\n**選型提示**：\n- 動態最大/最小：heap；若元素會失效，常用懶刪除。\n- 有序前驅/後繼、排名、區間：`set` / `map` / Fenwick / segment tree。\n- 歷史版本查詢：每個 key 存 `(time, value)` 序列，查詢時二分。\n- 查詢可離線排序：把資料與 query 依門檻排序，只加入當前可用元素。\n\n**系統例題：Snapshot Array**\n\n題目：支援 `set(index, val)`、`snap()` 回傳快照 id、`get(index, snap_id)` 回傳該快照時 index 的值。\n\n解題步驟：\n1. 不要每次 `snap` 複製整個陣列，會是 `O(n*snap)`。\n2. 對每個 index 只記錄值改變的時間序列，例如 `history[index] = [(snapId, value)]`。\n3. `set` 時，如果同一個 snapId 已經寫過此 index，直接覆蓋最後一筆；否則追加新紀錄。\n4. `get` 時，在此 index 的歷史中找 `snap_id` 以下最後一筆。\n\n**C++：每個位置一條歷史序列**\n\n```cpp\n// snapshot array with binary search over per-index history\nclass SnapshotArray {\n    int currentSnap = 0;\n    vector<vector<pair<int, int>>> history;\n\npublic:\n    SnapshotArray(int length) : history(length, {{0, 0}}) {}\n\n    void set(int index, int val) {\n        auto& h = history[index];\n        if (h.back().first == currentSnap) {\n            h.back().second = val;\n        } else {\n            h.push_back({currentSnap, val});\n        }\n    }\n\n    int snap() {\n        return currentSnap++;\n    }\n\n    int get(int index, int snap_id) {\n        auto& h = history[index];\n        int pos = upper_bound(h.begin(), h.end(), make_pair(snap_id, INT_MAX)) - h.begin() - 1;\n        return h[pos].second;\n    }\n};\n```\n\n`set` 均攤 `O(1)`，`snap` 是 `O(1)`，`get` 是 `O(log changes_at_index)`。面試中要明確說出 canonical state 是每個 index 的歷史，而不是某個完整陣列。",
  },
  {
    id: 7,
    title: "6. 二分、貪心與滑動視窗",
    summary:
      "這章處理「答案不是直接算，而是找邊界、做局部選擇或維護一段連續區間」的題型。二分、貪心、滑動視窗都很常見，但也最容易被誤用。選方法前先問：答案是否有單調性？局部選擇是否能用交換論證證明？窗口合法性是否能隨左右指標增減而維護？\n\n**三種模型**：\n- 二分答案：把「求最小可行值」改成「給定 x，是否可行」。可行性必須單調。\n- 貪心：每一步做局部最優，並能證明任何最優解都可交換成包含這個選擇。\n- 滑動視窗：處理連續子陣列/子字串，右端擴張、左端收縮，維護窗口合法。\n\n**系統例題：最長子字串，最多替換 k 個字元後全相同**\n\n題目：給大寫字串 s，最多替換 k 個字元，求可變成同一字元的最長子字串。\n\n解題步驟：\n1. 對一個窗口，如果長度是 `len`，最多字元出現次數是 `maxFreq`，那需要替換 `len - maxFreq` 個字元。\n2. 窗口合法條件：`len - maxFreq <= k`。\n3. 右指標逐步擴張並更新字元計數。\n4. 若窗口不合法，移動左指標直到合法。\n5. 每次合法時更新答案。\n\n**C++：滑動視窗維護合法性**\n\n```cpp\n// longest repeating character replacement\nint characterReplacement(string s, int k) {\n    vector<int> cnt(26, 0);\n    int left = 0, maxFreq = 0, ans = 0;\n\n    for (int right = 0; right < (int)s.size(); ++right) {\n        int x = s[right] - 'A';\n        cnt[x]++;\n        maxFreq = max(maxFreq, cnt[x]);\n\n        while ((right - left + 1) - maxFreq > k) {\n            cnt[s[left] - 'A']--;\n            left++;\n        }\n        ans = max(ans, right - left + 1);\n    }\n    return ans;\n}\n```\n\n這段程式中的 `maxFreq` 不必在左移時降低，因為它只會讓窗口偶爾看起來偏寬，但答案長度仍然只在曾經存在足夠高頻字元的尺度上更新。若面試官追問，可改成每次重算 26 個字母的最大值，仍是 `O(26n)`。",
  },
  {
    id: 8,
    title: "7. 資料平行與資料流",
    summary:
      "這一章補強資料平行、資料流與吞吐量思維。即使一般 SWE 面試不要求寫 GPU code，Google 類面試可能會追問：哪些步驟能平行、哪些步驟需要同步、資料是否連續讀寫、如何在記憶體有限或流式資料下得到答案。從零開始理解，可以把演算法拆成 map、filter、scan、reduce 四種常見資料流操作。\n\n**基本概念**：\n- map：每個元素獨立轉換，天然可平行。\n- reduce：多個元素合併成一個值，例如 sum、max、xor，需要合併順序或結合律。\n- prefix scan：每個位置需要前面累積結果，例如前綴和、排名、壓縮後位置。\n- streaming：資料只能看一遍或不能全部放進記憶體，需要維護足夠小的摘要。\n\n**系統例題：資料流中的前 k 大元素**\n\n題目：數字源源不斷到來，不能保存全部資料，隨時要知道目前最大的 k 個數。\n\n解題步驟：\n1. 若保存全部再排序，空間是 `O(n)`，不符合資料流需求。\n2. 只保存目前前 k 大即可。用大小為 k 的最小堆，堆頂是目前第 k 大。\n3. 新元素若堆未滿就加入；若大於堆頂，彈出堆頂再加入；否則丟棄。\n4. 查詢時堆中就是前 k 大，若要排序輸出再複製排序。\n\n**C++：Streaming Top-K**\n\n```cpp\n// maintain top k largest values in a stream\nclass TopKStream {\n    int k;\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n\npublic:\n    TopKStream(int k) : k(k) {}\n\n    void add(int x) {\n        if ((int)minHeap.size() < k) {\n            minHeap.push(x);\n        } else if (x > minHeap.top()) {\n            minHeap.pop();\n            minHeap.push(x);\n        }\n    }\n\n    vector<int> topKDescending() const {\n        auto copy = minHeap;\n        vector<int> values;\n        while (!copy.empty()) {\n            values.push_back(copy.top());\n            copy.pop();\n        }\n        sort(values.rbegin(), values.rend());\n        return values;\n    }\n};\n```\n\n每筆資料處理 `O(log k)`，空間 `O(k)`。如果要平行化，可讓每個 shard 維護自己的 top-k，最後把所有 shard 的候選再做一次 top-k reduction。這就是 map-reduce 思路。",
  },
  {
    id: 9,
    title: "8. 資源限制與位元狀態",
    summary:
      "這一章更在意資源邊界：記憶體是否固定、是否能避免碎片、整數是否溢位、狀態是否能用 bit mask 表示、操作是否有最壞情況延遲。從零開始看，這類題通常不是問你會不會用 `vector`，而是問你能不能在限制下設計可靠行為。\n\n**複習重點**：\n- 固定容量：明確處理 full/empty，不讓資料結構無限制成長。\n- ring buffer：用陣列和環狀 index 支援佇列，適合固定記憶體。\n- bit mask：用一個整數表示多個布林狀態，集合操作通常是 `O(1)`。\n- 邊界條件：整數溢位、負數、重複釋放、wrap-around index、capacity 為 0。\n\n**系統例題：固定容量循環佇列**\n\n題目：實作固定容量 queue，支援 `push`、`pop`，不能動態擴容。\n\n解題步驟：\n1. 用長度為 capacity 的陣列保存資料。\n2. `head` 指向下一個要 pop 的位置，`tail` 指向下一個要 push 的位置。\n3. `count` 區分空和滿；否則 `head == tail` 會同時可能代表空或滿。\n4. 每次指標移動都用 `(idx + 1) % capacity` wrap around。\n\n**C++：Ring Buffer**\n\n```cpp\n// fixed-capacity circular queue\nclass RingBuffer {\n    vector<int> buf;\n    int head = 0;\n    int tail = 0;\n    int count = 0;\n\npublic:\n    RingBuffer(int capacity) : buf(capacity) {}\n\n    bool push(int x) {\n        if (buf.empty() || count == (int)buf.size()) return false;\n        buf[tail] = x;\n        tail = (tail + 1) % buf.size();\n        count++;\n        return true;\n    }\n\n    bool pop(int& out) {\n        if (count == 0) return false;\n        out = buf[head];\n        head = (head + 1) % buf.size();\n        count--;\n        return true;\n    }\n\n    int size() const { return count; }\n    bool empty() const { return count == 0; }\n};\n```\n\n若題目改成多執行緒，就要討論鎖、原子操作或 single-producer/single-consumer 的限制；若改成狀態集合，則可把 `vector<bool>` 換成 bit mask 或 bitset 來降低空間。",
  },
  {
    id: 10,
    title: "9. 平台 API 與系統資料結構",
    summary:
      "這一章常以 API 設計形式出現：題目不只要求算一次答案，而是要求一個物件支援多個方法。從零開始做 API 題，先列出每個方法的輸入、輸出、目標複雜度，再決定 canonical state 和衍生索引。只要有多個索引，更新時就必須同步刪舊插新，否則會產生 stale entry。\n\n**設計流程**：\n- 列 API：`add`、`remove`、`update`、`query` 各自要什麼複雜度。\n- 找事實來源：哪份 map 保存最可信的實體資料。\n- 建衍生索引：為排名、最值、查 id、查 group 等查詢建立 set、heap 或 map。\n- 定義 tie-breaker：同分時用 name、id 或時間，避免排序不穩。\n\n**系統例題：食物評分系統**\n\n題目：每個 food 有 cuisine 和 rating，支援修改某 food 的 rating，查某 cuisine 中 rating 最高、同分字典序最小的 food。\n\n解題步驟：\n1. canonical state：`food -> (cuisine, rating)`。\n2. 每個 cuisine 維護一個有序 set，排序規則是 rating 高優先，name 小優先。\n3. 更新 rating 時，先從原 cuisine 的 set 刪掉舊 `(rating, food)`，再插入新值。\n4. 查詢最高評分時取 set begin。\n\n**C++：多索引 API 設計**\n\n```cpp\n// food ratings with per-cuisine ordered index\nclass FoodRatings {\n    struct Entry {\n        int rating;\n        string food;\n    };\n\n    struct Cmp {\n        bool operator()(const Entry& a, const Entry& b) const {\n            if (a.rating != b.rating) return a.rating > b.rating;\n            return a.food < b.food;\n        }\n    };\n\n    unordered_map<string, string> cuisineOf;\n    unordered_map<string, int> ratingOf;\n    unordered_map<string, set<Entry, Cmp>> byCuisine;\n\npublic:\n    FoodRatings(vector<string>& foods, vector<string>& cuisines, vector<int>& ratings) {\n        for (int i = 0; i < (int)foods.size(); ++i) {\n            cuisineOf[foods[i]] = cuisines[i];\n            ratingOf[foods[i]] = ratings[i];\n            byCuisine[cuisines[i]].insert({ratings[i], foods[i]});\n        }\n    }\n\n    void changeRating(string food, int newRating) {\n        string cuisine = cuisineOf[food];\n        int oldRating = ratingOf[food];\n        byCuisine[cuisine].erase({oldRating, food});\n        ratingOf[food] = newRating;\n        byCuisine[cuisine].insert({newRating, food});\n    }\n\n    string highestRated(string cuisine) {\n        return byCuisine[cuisine].begin()->food;\n    }\n};\n```\n\n每次更新 `O(log n_cuisine)`，查詢 `O(1)` 取 begin。面試中要說清楚：set 裡保存的是衍生索引，`ratingOf` 才是目前真實分數。",
  },
  {
    id: 1101,
    title: "10. 狀態空間搜尋與壓縮 BFS",
    summary:
      "這類題不是在原圖上搜尋，而是在「狀態圖」上搜尋。從零開始理解：如果只知道目前位置還不夠決定未來能走哪裡，就必須把其他資訊放進狀態。例如鑰匙集合、已訪問節點集合、箱子位置、玩家位置、剩餘操作次數。只要兩條路徑到達同一個完整狀態，後續選擇完全相同，就可以去重。\n\n**使用時機**：\n- 題目有「收集所有」、「訪問所有」、「拿到鑰匙後開門」、「推箱子」等描述。\n- 同一位置在不同 mask 下的可行操作不同。\n- 初始狀態可能有多個，例如可從任意節點開始走完所有節點。\n\n**系統例題：訪問所有節點的最短路**\n\n題目：給無權無向圖，可從任意節點出發，求訪問所有節點的最少邊數。\n\n解題步驟：\n1. 狀態是 `(node, mask)`，`mask` 表示已訪問節點集合。\n2. 邊權全是 1，所以用 BFS。\n3. 因為可以從任意節點出發，將所有 `(i, 1<<i)` 作為多源起點。\n4. 第一次取到 `mask == full` 的狀態，就是最短答案。\n\n**C++：多源 bitmask BFS**\n\n```cpp\n// shortest path visiting all nodes in an unweighted graph\nint shortestPathLength(vector<vector<int>>& graph) {\n    int n = graph.size();\n    int full = (1 << n) - 1;\n    vector<vector<int>> dist(n, vector<int>(1 << n, -1));\n    queue<pair<int, int>> q;\n\n    for (int i = 0; i < n; ++i) {\n        int mask = 1 << i;\n        dist[i][mask] = 0;\n        q.push({i, mask});\n    }\n\n    while (!q.empty()) {\n        auto [u, mask] = q.front();\n        q.pop();\n        if (mask == full) return dist[u][mask];\n\n        for (int v : graph[u]) {\n            int nextMask = mask | (1 << v);\n            if (dist[v][nextMask] != -1) continue;\n            dist[v][nextMask] = dist[u][mask] + 1;\n            q.push({v, nextMask});\n        }\n    }\n    return -1;\n}\n```\n\n狀態數是 `O(n*2^n)`，邊鬆弛約 `O(E*2^n)`。面試中要先估 n；如果 n 很大，bitmask BFS 就不是正確方向。",
  },
  {
    id: 1102,
    title: "11. 多階段最短路與路徑約束",
    summary:
      "多階段最短路題通常不是一次 Dijkstra 就結束，而是要把路徑條件拆成幾份可重用的距離表。從零開始看，Dijkstra 只回答「一個起點到所有點的最短距離」。如果題目有兩個起點、匯合點、反向到終點、第二短路或等待規則，就要擴充狀態或跑多次距離表。\n\n**常見模型**：\n- 兩個起點匯合再到終點：從 `src1`、`src2` 跑正圖，從 `dest` 跑反圖，枚舉匯合點。\n- 第二短路：每個點保留最短與次短兩個不同距離。\n- 交通燈或週期等待：鬆弛邊前先根據目前時間計算等待。\n- 有折扣或通行證：狀態加入已使用次數，變成分層圖最短路。\n\n**系統例題：兩個來源到同一終點的最小權重子圖**\n\n題目：有向加權圖，找一個子圖讓 `src1` 和 `src2` 都能到 `dest`，最小化使用邊權總和。等價於選一個匯合點 x，兩個來源各自走到 x，再從 x 走到 dest。\n\n解題步驟：\n1. 從 `src1` 在原圖跑 Dijkstra，得到 `d1[x]`。\n2. 從 `src2` 在原圖跑 Dijkstra，得到 `d2[x]`。\n3. 從 `dest` 在反圖跑 Dijkstra，得到 `dr[x]`，代表原圖中 `x -> dest` 的距離。\n4. 枚舉 x，最小化 `d1[x] + d2[x] + dr[x]`。\n\n**C++：三次 Dijkstra + 枚舉匯合點**\n\n```cpp\n// minimum total path cost for src1 and src2 to meet and reach dest\nvector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& g, int src) {\n    const long long INF = 4e18;\n    vector<long long> dist(n, INF);\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n    dist[src] = 0;\n    pq.push({0, src});\n\n    while (!pq.empty()) {\n        auto [du, u] = pq.top();\n        pq.pop();\n        if (du != dist[u]) continue;\n        for (auto [v, w] : g[u]) {\n            if (dist[v] > du + w) {\n                dist[v] = du + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}\n\nlong long minimumWeight(int n, vector<vector<int>>& edges, int src1, int src2, int dest) {\n    vector<vector<pair<int, int>>> g(n), rg(n);\n    for (auto& e : edges) {\n        int u = e[0], v = e[1], w = e[2];\n        g[u].push_back({v, w});\n        rg[v].push_back({u, w});\n    }\n\n    auto d1 = dijkstra(n, g, src1);\n    auto d2 = dijkstra(n, g, src2);\n    auto dr = dijkstra(n, rg, dest);\n\n    const long long INF = 4e18;\n    long long ans = INF;\n    for (int x = 0; x < n; ++x) {\n        if (d1[x] == INF || d2[x] == INF || dr[x] == INF) continue;\n        ans = min(ans, d1[x] + d2[x] + dr[x]);\n    }\n    return ans == INF ? -1 : ans;\n}\n```\n\n重點是反圖那次 Dijkstra：它把所有點到 dest 的距離一次算完，避免對每個匯合點重跑最短路。",
  },
  {
    id: 1103,
    title: "12. 樹分解、換根與子樹查詢",
    summary:
      "高階樹題的核心是把「子樹」變成可計算的範圍，或把「換根後答案」用父節點答案推導出來。從零開始看，樹沒有環，所以每條邊把樹切成兩部分；很多問題就是快速知道某個子樹的 size、sum、xor、高度，或知道把根從父節點移到孩子後答案如何改變。\n\n**常用工具**：\n- 後序 DFS：先算孩子，再合併出子樹資訊。\n- Euler tour：記錄 `tin/tout`，子樹對應一段連續時間區間。\n- 換根 DP：第一次 DFS 算某個根的答案，第二次 DFS 把答案從父節點推給孩子。\n- 祖先判斷：`tin[u] <= tin[v] <= tout[u]` 表示 u 是 v 的祖先。\n\n**系統例題：每個節點到所有節點的距離和**\n\n題目：給 n 個節點的樹，對每個節點 i，求 i 到所有節點的距離和。\n\n解題步驟：\n1. 先固定 0 為根。第一次 DFS 算 `size[u]` 和 `ans[0]`，其中 `ans[0]` 是 0 到所有點距離和。\n2. 對一條父子邊 `u -> v`，若根從 u 移到 v：v 子樹內的 `size[v]` 個點距離都減 1，其他 `n - size[v]` 個點距離都加 1。\n3. 所以 `ans[v] = ans[u] - size[v] + (n - size[v])`。\n4. 第二次 DFS 套公式下傳答案。\n\n**C++：換根 DP 距離和**\n\n```cpp\n// sum of distances in tree for every root\nvector<int> sumOfDistancesInTree(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> g(n);\n    for (auto& e : edges) {\n        g[e[0]].push_back(e[1]);\n        g[e[1]].push_back(e[0]);\n    }\n\n    vector<int> size(n, 1);\n    vector<int> ans(n, 0);\n\n    function<void(int, int, int)> dfs1 = [&](int u, int p, int depth) {\n        ans[0] += depth;\n        for (int v : g[u]) {\n            if (v == p) continue;\n            dfs1(v, u, depth + 1);\n            size[u] += size[v];\n        }\n    };\n\n    function<void(int, int)> dfs2 = [&](int u, int p) {\n        for (int v : g[u]) {\n            if (v == p) continue;\n            ans[v] = ans[u] - size[v] + (n - size[v]);\n            dfs2(v, u);\n        }\n    };\n\n    dfs1(0, -1, 0);\n    dfs2(0, -1);\n    return ans;\n}\n```\n\n換根題的面試重點是推導公式，而不是背模板。你要能清楚說出哪一部分距離變短、哪一部分變長。",
  },
  {
    id: 1104,
    title: "13. 字串演算法結合 DP/資料結構",
    summary:
      "字串高階題通常是「字串演算法 + 另一層 DP/計數/資料結構」。KMP、Z 函式、Trie、rolling hash 只是取得比較資訊的工具，真正的答案常要再透過 DP 或資料結構累積。從零開始時，先找出題目反覆做的昂貴比較，再用字串工具把比較降到 `O(1)` 或均攤線性。\n\n**工具定位**：\n- Z 函式：快速知道 `s[i...]` 和整個字串前綴的 LCP。\n- KMP prefix function：處理 border、模式匹配、週期性。\n- rolling hash：快速比較任意兩段子串，但要注意碰撞。\n- Trie：處理多個字典詞與 target 的前綴匹配，常接 DP。\n\n**系統例題：用字典詞拼出 target 的最少詞數**\n\n題目：給一批 words 和 target，每次可取一個 word 完整接到目前字串後面，求拼出 target 的最少詞數。\n\n解題步驟：\n1. 暴力嘗試每個位置接每個 word 會很慢。\n2. 把 words 建成 Trie，從 target 的每個起點 i 沿 Trie 往後走，能走到 word 結尾就代表有一條轉移 `i -> j`。\n3. 定義 `dp[i]`：拼出 target 前 i 個字元的最少詞數。\n4. 從每個 i 出發沿 Trie 枚舉可接的詞，更新 `dp[j] = min(dp[j], dp[i] + 1)`。\n\n**C++：Trie + DP**\n\n```cpp\n// minimum number of dictionary words to form target\nstruct TrieNode {\n    int next[26];\n    bool end = false;\n    TrieNode() { fill(begin(next), end(next), -1); }\n};\n\nint minWords(vector<string>& words, string target) {\n    vector<TrieNode> trie(1);\n    for (const string& w : words) {\n        int node = 0;\n        for (char ch : w) {\n            int c = ch - 'a';\n            if (trie[node].next[c] == -1) {\n                trie[node].next[c] = trie.size();\n                trie.emplace_back();\n            }\n            node = trie[node].next[c];\n        }\n        trie[node].end = true;\n    }\n\n    const int INF = 1e9;\n    int n = target.size();\n    vector<int> dp(n + 1, INF);\n    dp[0] = 0;\n\n    for (int i = 0; i < n; ++i) {\n        if (dp[i] == INF) continue;\n        int node = 0;\n        for (int j = i; j < n; ++j) {\n            int c = target[j] - 'a';\n            if (trie[node].next[c] == -1) break;\n            node = trie[node].next[c];\n            if (trie[node].end) {\n                dp[j + 1] = min(dp[j + 1], dp[i] + 1);\n            }\n        }\n    }\n    return dp[n] == INF ? -1 : dp[n];\n}\n```\n\n如果 words 很多且 target 很長，可以再用 Aho-Corasick 或 hash 優化匹配；但面試中先把「Trie 產生轉移，DP 求最少段數」講清楚最重要。",
  },
  {
    id: 1105,
    title: "14. 高階 DP 與單調性優化",
    summary:
      "高階 DP 的訊號是狀態容易寫，但轉移太慢。從零開始時，不要一開始就套優化；先寫出正確但可能較慢的定義，再觀察轉移是否只需要某個前綴最佳值、滑動窗口最值、二分相容狀態、單調隊列或斜率優化。優化的本質是避免重複枚舉不可能成為最佳的決策點。\n\n**常見 Pattern**：\n- 排程/活動：排序 + 二分找到上一個相容狀態。\n- `dp[i] = min(dp[j] + cost(j, i))`：檢查 cost 是否能用前綴、單調隊列或 convex hull trick 優化。\n- 有 k 次選擇：通常是 `dp[i][used]`，再看每層能否優化。\n- 窗口限制：轉移只來自最近一段 j，可用 deque 維護候選最大/最小值。\n\n**系統例題：帶最多 k 個活動的最大收益**\n\n題目：每個活動有開始、結束、價值，最多選 k 個互不重疊活動，求最大價值。\n\n解題步驟：\n1. 按結束時間排序，讓前 i 個活動形成前綴。\n2. `dp[i][c]` 表示只看前 i 個活動、最多選 c 個時的最大價值。\n3. 不選第 i 個：`dp[i-1][c]`。\n4. 選第 i 個：找到最後一個結束時間小於目前開始時間的活動數 `j`，轉移為 `dp[j][c-1] + value`。\n5. 用二分找 j，避免每次線性往前掃。\n\n**C++：二分相容狀態的二維 DP**\n\n```cpp\n// maximum value from at most k non-overlapping events\nint maxValue(vector<vector<int>>& events, int k) {\n    sort(events.begin(), events.end(), [](const auto& a, const auto& b) {\n        return a[1] < b[1];\n    });\n\n    int n = events.size();\n    vector<int> ends(n);\n    for (int i = 0; i < n; ++i) ends[i] = events[i][1];\n\n    vector<vector<int>> dp(n + 1, vector<int>(k + 1, 0));\n    for (int i = 1; i <= n; ++i) {\n        int start = events[i - 1][0];\n        int value = events[i - 1][2];\n        int j = lower_bound(ends.begin(), ends.end(), start) - ends.begin();\n\n        for (int c = 1; c <= k; ++c) {\n            dp[i][c] = max(dp[i - 1][c], dp[j][c - 1] + value);\n        }\n    }\n    return dp[n][k];\n}\n```\n\n複雜度是 `O(n log n + n*k)`。如果 n 和 k 都很大，才需要再討論單調性、資料結構或不同狀態定義；先把可證明正確的 DP 建出來，是高階 DP 面試的基礎。",
  },
] as const;

const competitiveProgrammingCourseMaterials: Record<number, string> = {
  2: [
    "**競程課程講義：把搜尋題拆成演算法選型**",
    "**BFS：等權最短路**\n\n訊號：每一步成本相同，題目問最少步數、最少操作次數、最短層數。BFS 的不變式是「queue 中狀態依距離非遞減」，因此第一次到達目標就是最短。\n\n例題：二進位矩陣最短路。8 方向移動，只能走 0，求左上到右下最短路。狀態是格子 `(r,c)`，邊權都是 1。",
    "```cpp\n// BFS on an unweighted grid.\nint shortestPathBinaryMatrix(vector<vector<int>>& grid) {\n    int n = grid.size();\n    if (grid[0][0] || grid[n - 1][n - 1]) return -1;\n    queue<pair<int, int>> q;\n    vector<vector<int>> dist(n, vector<int>(n, -1));\n    q.push({0, 0});\n    dist[0][0] = 1;\n    int dr[8] = {1, 1, 0, -1, -1, -1, 0, 1};\n    int dc[8] = {0, 1, 1, 1, 0, -1, -1, -1};\n    while (!q.empty()) {\n        auto [r, c] = q.front(); q.pop();\n        if (r == n - 1 && c == n - 1) return dist[r][c];\n        for (int d = 0; d < 8; ++d) {\n            int nr = r + dr[d], nc = c + dc[d];\n            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;\n            if (grid[nr][nc] || dist[nr][nc] != -1) continue;\n            dist[nr][nc] = dist[r][c] + 1;\n            q.push({nr, nc});\n        }\n    }\n    return -1;\n}\n```",
    "**0-1 BFS：邊權只有 0 或 1**\n\n訊號：轉移有免費操作和付費一次操作，例如改方向代價 1、順方向代價 0。用 deque；0 權邊放前面，1 權邊放後面。不變式近似 Dijkstra，但避免 priority queue。\n\n例題：網格每格有建議方向，順方向走成本 0，改方向成本 1，求最小修改次數。",
    "```cpp\n// 0-1 BFS on a directed-cost grid.\nint minCost(vector<vector<int>>& grid) {\n    int m = grid.size(), n = grid[0].size();\n    vector<vector<int>> dist(m, vector<int>(n, 1e9));\n    deque<pair<int, int>> dq;\n    int dr[5] = {0, 0, 0, 1, -1};\n    int dc[5] = {0, 1, -1, 0, 0};\n    dist[0][0] = 0;\n    dq.push_front({0, 0});\n    while (!dq.empty()) {\n        auto [r, c] = dq.front(); dq.pop_front();\n        for (int dir = 1; dir <= 4; ++dir) {\n            int nr = r + dr[dir], nc = c + dc[dir];\n            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;\n            int w = (grid[r][c] == dir ? 0 : 1);\n            if (dist[nr][nc] <= dist[r][c] + w) continue;\n            dist[nr][nc] = dist[r][c] + w;\n            if (w == 0) dq.push_front({nr, nc});\n            else dq.push_back({nr, nc});\n        }\n    }\n    return dist[m - 1][n - 1];\n}\n```",
    "**Dijkstra：非負權最短路**\n\n訊號：邊權是非負數，題目問最短時間、最低成本、最小風險。priority queue 每次取出目前距離最小的點；若彈出距離不是最新值，跳過。\n\n例題：網路延遲時間。從起點 k 傳訊息到所有節點，求最晚收到時間。",
    "```cpp\n// Dijkstra for non-negative weighted graph.\nint networkDelayTime(vector<vector<int>>& times, int n, int k) {\n    vector<vector<pair<int, int>>> g(n + 1);\n    for (auto& e : times) g[e[0]].push_back({e[1], e[2]});\n    const int INF = 1e9;\n    vector<int> dist(n + 1, INF);\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;\n    dist[k] = 0;\n    pq.push({0, k});\n    while (!pq.empty()) {\n        auto [du, u] = pq.top(); pq.pop();\n        if (du != dist[u]) continue;\n        for (auto [v, w] : g[u]) {\n            if (dist[v] > du + w) {\n                dist[v] = du + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    int ans = *max_element(dist.begin() + 1, dist.end());\n    return ans == INF ? -1 : ans;\n}\n```",
  ].join("\n\n"),
  3: [
    "**競程課程講義：建模後要把每種圖型配到固定工具**",
    "這章的核心不是背 Tarjan 或 DSU，而是能把題目敘述翻譯成圖的性質。競程課中建議每題先寫四行：節點是什麼、邊代表什麼、邊是否有方向、答案需要連通性還是路徑順序。完成這四行後，演算法通常就很明確。",
    "**對照表**：\n- DFS/BFS：靜態圖走訪、連通塊統計、可達性。\n- DSU：動態加邊合併集合、判斷加邊是否成環。\n- Topological sort：DAG 依賴順序、先修限制、任務排程。\n- Tree DFS：子樹 size/sum/depth/height 合併。\n- Bridge：無向圖中不可替代的邊。\n- SCC：有向圖中的互相可達群組，壓縮後變 DAG。",
  ].join("\n\n"),
  4: [
    "**競程課程講義：DP 從暴力搜尋開始教**",
    "**Pattern 1：記憶化 DFS**\n\n訊號：遞迴搜尋會重複遇到同一個 `(index, remaining, state)`。先寫暴力遞迴，再加 memo。\n\n例題：爬樓梯，每次走 1 或 2 階，求方法數。狀態 `f(i)` 是到第 i 階的方法數。",
    "```cpp\n// Memoized DFS: number of ways to climb n stairs.\nint climbStairs(int n) {\n    vector<int> memo(n + 1, -1);\n    function<int(int)> dfs = [&](int i) {\n        if (i == 0) return 1;\n        if (i < 0) return 0;\n        if (memo[i] != -1) return memo[i];\n        return memo[i] = dfs(i - 1) + dfs(i - 2);\n    };\n    return dfs(n);\n}\n```",
    "**Pattern 2：線性 DP**\n\n訊號：答案只依賴前面幾個位置。例題：House Robber。`dp[i]` 表示前 i 間房子的最大收益；第 i 間選或不選。",
    "```cpp\n// Linear DP with take / skip transition.\nint rob(vector<int>& nums) {\n    int take = 0, skip = 0;\n    for (int x : nums) {\n        int ntake = skip + x;\n        int nskip = max(skip, take);\n        take = ntake;\n        skip = nskip;\n    }\n    return max(take, skip);\n}\n```",
    "**Pattern 3：狀態壓縮 DP**\n\n訊號：限制數量小，例如 `n <= 20` 或技能數小。用 bitmask 表示集合。\n\n例題：最小團隊覆蓋所有技能。`dp[mask]` 保存達成技能集合 mask 的最少人數。",
    "```cpp\n// Bitmask DP for set cover style problems.\nint minPeopleForSkills(vector<int>& personMask, int skillCount) {\n    int full = 1 << skillCount;\n    const int INF = 1e9;\n    vector<int> dp(full, INF);\n    dp[0] = 0;\n    for (int pm : personMask) {\n        vector<int> old = dp;\n        for (int mask = 0; mask < full; ++mask) {\n            int next = mask | pm;\n            dp[next] = min(dp[next], old[mask] + 1);\n        }\n    }\n    return dp[full - 1];\n}\n```",
    "**Pattern 4：排序後 DP + 二分前驅**\n\n訊號：每個選擇有開始/結束時間，轉移需要找前一個相容狀態。先排序，再二分，不要在轉移中線性掃描。",
  ].join("\n\n"),
  5: [
    "**競程課程講義：字串演算法是比較工具，不是答案本身**",
    "**Pattern 1：KMP / prefix function**\n\n訊號：固定 pattern 匹配、多次問 border、週期性。`pi[i]` 是 `s[0..i]` 的最長相等真前後綴長度。",
    "```cpp\nvector<int> prefixFunction(const string& s) {\n    vector<int> pi(s.size());\n    for (int i = 1; i < (int)s.size(); ++i) {\n        int j = pi[i - 1];\n        while (j > 0 && s[i] != s[j]) j = pi[j - 1];\n        if (s[i] == s[j]) j++;\n        pi[i] = j;\n    }\n    return pi;\n}\n```",
    "**Pattern 2：Z function**\n\n訊號：大量比較 `s[i...]` 與整個字串前綴。Z-box `[l,r]` 維護目前最右匹配區間。",
    "```cpp\nvector<int> zFunction(const string& s) {\n    int n = s.size();\n    vector<int> z(n);\n    for (int i = 1, l = 0, r = 0; i < n; ++i) {\n        if (i <= r) z[i] = min(r - i + 1, z[i - l]);\n        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;\n        if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;\n    }\n    return z;\n}\n```",
    "**Pattern 3：Rolling hash**\n\n訊號：任意兩段子串要反覆比較。課程中要提醒 hash 有碰撞；競賽可用雙模或 unsigned long long 降低風險。",
    "```cpp\nstruct RollingHash {\n    static const long long MOD = 1000000007, BASE = 911382323;\n    vector<long long> h, p;\n    RollingHash(const string& s) : h(s.size() + 1), p(s.size() + 1, 1) {\n        for (int i = 0; i < (int)s.size(); ++i) {\n            h[i + 1] = (h[i] * BASE + s[i]) % MOD;\n            p[i + 1] = p[i] * BASE % MOD;\n        }\n    }\n    long long get(int l, int r) {\n        return (h[r] - h[l] * p[r - l] % MOD + MOD) % MOD;\n    }\n};\n```",
    "**Pattern 4：Trie**\n\n訊號：多個字典詞共用前綴，或從 target 某位置往後匹配多個候選詞。Trie 常接 DP、BFS 或貪心。",
  ].join("\n\n"),
  6: [
    "**競程課程講義：資料結構題先寫不變式**",
    "**Pattern 1：Heap + lazy deletion**\n\n訊號：要動態取最大/最小，但舊元素可能被更新或刪除。heap 不支援任意刪除，所以保留最新版本表，彈出時檢查是否過期。",
    "```cpp\npriority_queue<pair<int, int>> pq;\nunordered_map<int, int> latest;\n\nvoid update(int id, int value) {\n    latest[id] = value;\n    pq.push({value, id});\n}\n\nint getMax() {\n    while (!pq.empty()) {\n        auto [value, id] = pq.top();\n        if (latest.count(id) && latest[id] == value) return value;\n        pq.pop();\n    }\n    return -1;\n}\n```",
    "**Pattern 2：Ordered set / map**\n\n訊號：需要 predecessor、successor、動態排序、tie-breaker。例題：維護座位區間或即時排名。",
    "```cpp\n// Find smallest existing value >= x.\nint lowerBoundQuery(set<int>& values, int x) {\n    auto it = values.lower_bound(x);\n    return it == values.end() ? -1 : *it;\n}\n```",
    "**Pattern 3：Fenwick tree 離線查詢**\n\n訊號：查詢可以排序後處理，且需要 prefix sum / count。例題：統計每個 query 中小於等於 x 的元素數。",
    "```cpp\nclass Fenwick {\n    vector<int> bit;\npublic:\n    Fenwick(int n) : bit(n + 1) {}\n    void add(int i, int delta) { for (++i; i < (int)bit.size(); i += i & -i) bit[i] += delta; }\n    int sumPrefix(int i) { int s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }\n};\n```",
    "**Pattern 4：歷史版本陣列**\n\n訊號：set 後 snap，查過去版本。每個 index 存時間序列，再二分最後一個 `time <= queryTime`。",
  ].join("\n\n"),
  7: [
    "**競程課程講義：二分、貪心、視窗分開證明**",
    "**Pattern 1：二分答案**\n\n訊號：問最小可行值或最大可行值，且可行性單調。課程中要先明確定義 predicate：`ok(x)` 的 true 區間在哪一側。\n\n例題：以最小速度吃完香蕉。速度越大越容易完成，所以 `ok(speed)` 單調。",
    "```cpp\nint minEatingSpeed(vector<int>& piles, int h) {\n    auto ok = [&](int speed) {\n        long long hours = 0;\n        for (int x : piles) hours += (x + speed - 1) / speed;\n        return hours <= h;\n    };\n    int lo = 1, hi = *max_element(piles.begin(), piles.end());\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (ok(mid)) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}\n```",
    "**Pattern 2：貪心 + 交換論證**\n\n訊號：排序後每次選最早結束、最小成本、最大收益等局部選擇。必須能說明任意最優解可替換成你的局部選擇而不變差。\n\n例題：最多不重疊區間，選結束時間最早的區間。",
    "```cpp\nint eraseOverlapIntervals(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {\n        return a[1] < b[1];\n    });\n    int keep = 0, lastEnd = INT_MIN;\n    for (auto& in : intervals) {\n        if (in[0] >= lastEnd) {\n            keep++;\n            lastEnd = in[1];\n        }\n    }\n    return intervals.size() - keep;\n}\n```",
    "**Pattern 3：滑動視窗**\n\n訊號：子陣列或子字串連續，右端加入元素、左端移除元素後能維護合法性。若條件不能局部維護，視窗通常不適合。",
    "```cpp\nint longestOnes(vector<int>& nums, int k) {\n    int left = 0, zeros = 0, ans = 0;\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        zeros += nums[right] == 0;\n        while (zeros > k) zeros -= nums[left++] == 0;\n        ans = max(ans, right - left + 1);\n    }\n    return ans;\n}\n```",
  ].join("\n\n"),
  8: [
    "**競程課程講義：資料平行題用 map / reduce / scan 分解**",
    "**Pattern 1：Map**\n\n每個元素獨立轉換，不讀寫其他位置。例題：把每個元素平方或計算每筆資料的局部貢獻。平行化時沒有資料競爭。",
    "```cpp\nvector<long long> squareAll(const vector<int>& a) {\n    vector<long long> out(a.size());\n    for (int i = 0; i < (int)a.size(); ++i) out[i] = 1LL * a[i] * a[i];\n    return out;\n}\n```",
    "**Pattern 2：Reduce**\n\n多個值合併成一個值。操作最好具備結合律，例如 sum、max、min、xor，才能分塊後再合併。",
    "```cpp\nlong long blockReduceSum(const vector<int>& a, int blockSize) {\n    vector<long long> partial;\n    for (int l = 0; l < (int)a.size(); l += blockSize) {\n        long long s = 0;\n        for (int i = l; i < min((int)a.size(), l + blockSize); ++i) s += a[i];\n        partial.push_back(s);\n    }\n    return accumulate(partial.begin(), partial.end(), 0LL);\n}\n```",
    "**Pattern 3：Prefix scan**\n\n每個位置需要前面累積資訊。競程常用在前綴和、差分還原、壓縮後位置、平行 compaction。",
    "```cpp\nvector<long long> exclusiveScan(const vector<int>& a) {\n    vector<long long> scan(a.size() + 1);\n    for (int i = 0; i < (int)a.size(); ++i) scan[i + 1] = scan[i] + a[i];\n    return scan;\n}\n```",
    "**Pattern 4：Streaming sketch**\n\n資料不能全存時，只維護摘要。Top-K 用 min-heap，頻率估計可用 hash map 或 sketch；要說清楚空間上限。",
  ].join("\n\n"),
  9: [
    "**競程課程講義：資源限制題要把空間上限寫進設計**",
    "**Pattern 1：固定容量容器**\n\n訊號：不能動態配置、需要 bounded memory、queue 或 log buffer。ring buffer 用 `head/tail/count` 區分空和滿。",
    "**Pattern 2：Bit mask 狀態集合**\n\n訊號：布林狀態數小於 20 到 25。集合加入、刪除、查詢都可用位運算。",
    "```cpp\nbool hasSkill(int mask, int i) { return mask & (1 << i); }\nint addSkill(int mask, int i) { return mask | (1 << i); }\nint removeSkill(int mask, int i) { return mask & ~(1 << i); }\n```",
    "**Pattern 3：溢位保護**\n\n競程中 `int` 很容易在加總、乘法、距離中溢位。模板：乘法前轉 `long long`，INF 設成不會在加法後溢位的值。",
    "```cpp\nconst long long INF = 4e18;\nlong long safeAdd(long long a, long long b) {\n    if (a >= INF || b >= INF) return INF;\n    if (a > INF - b) return INF;\n    return a + b;\n}\n```",
    "**Pattern 4：Free list**\n\n訊號：需要反覆 allocate/free 固定數量節點。用陣列存節點，用 stack 保存可重用 index，避免碎片。",
    "```cpp\nclass Pool {\n    vector<int> value, freeIds;\npublic:\n    Pool(int n) : value(n) { for (int i = n - 1; i >= 0; --i) freeIds.push_back(i); }\n    int alloc(int x) { if (freeIds.empty()) return -1; int id = freeIds.back(); freeIds.pop_back(); value[id] = x; return id; }\n    void release(int id) { freeIds.push_back(id); }\n};\n```",
  ].join("\n\n"),
  10: [
    "**競程課程講義：API 題等於多資料結構同步**",
    "**Pattern 1：Canonical state + derived indexes**\n\n先指定哪個 map 是事實來源，再用 set/heap 建查詢索引。更新時先刪舊索引，再更新 state，再插新索引。",
    "**Pattern 2：LRU Cache**\n\n訊號：`get` 和 `put` 都要 O(1)，並且要刪最久未使用。用 list 維護時間順序，用 unordered_map 指到 list iterator。",
    "```cpp\nclass LRUCache {\n    int cap;\n    list<pair<int, int>> order;\n    unordered_map<int, list<pair<int, int>>::iterator> pos;\npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    int get(int key) {\n        if (!pos.count(key)) return -1;\n        order.splice(order.begin(), order, pos[key]);\n        return pos[key]->second;\n    }\n    void put(int key, int value) {\n        if (pos.count(key)) {\n            pos[key]->second = value;\n            order.splice(order.begin(), order, pos[key]);\n            return;\n        }\n        if ((int)order.size() == cap) {\n            pos.erase(order.back().first);\n            order.pop_back();\n        }\n        order.push_front({key, value});\n        pos[key] = order.begin();\n    }\n};\n```",
    "**Pattern 3：Time based key-value store**\n\n訊號：查某 key 在某時間點的值。每個 key 的歷史按 timestamp 遞增，查詢用二分。",
    "```cpp\nclass TimeMap {\n    unordered_map<int, vector<pair<int, int>>> hist;\npublic:\n    void set(int key, int time, int value) { hist[key].push_back({time, value}); }\n    int get(int key, int time) {\n        auto& v = hist[key];\n        int i = upper_bound(v.begin(), v.end(), make_pair(time, INT_MAX)) - v.begin() - 1;\n        return i < 0 ? -1 : v[i].second;\n    }\n};\n```",
  ].join("\n\n"),
  1101: [
    "**競程課程講義：狀態空間搜尋先估狀態數**",
    "**Pattern 1：位置 + mask**\n\n訊號：訪問所有點、收集所有 key、每個元素只有拿/沒拿。狀態數常是 `O(n 2^n)` 或 `O(mn 2^k)`。",
    "**Pattern 2：多源 BFS**\n\n若起點不固定，把所有合法起點距離設為 0 同時入隊。這比枚舉起點各跑一次 BFS 更乾淨。",
    "**Pattern 3：鑰匙與門**\n\n同一格在不同 key mask 下不是同一狀態；visited 必須包含 `(r,c,mask)`。",
    "```cpp\n// State transition skeleton for grid with keys.\nstruct State { int r, c, mask; };\nint encode(int r, int c, int mask, int n, int keyCount) {\n    return ((r * n + c) << keyCount) | mask;\n}\n```",
    "**Pattern 4：狀態圖 Dijkstra**\n\n若操作代價不同，不要硬套 BFS。把完整狀態當節點，轉移代價當邊權，跑 Dijkstra。",
  ].join("\n\n"),
  1102: [
    "**競程課程講義：多階段最短路是距離表組合**",
    "**Pattern 1：匯合點枚舉**\n\n跑多張距離表後枚舉中繼點。關鍵是從終點跑反圖，取得所有點到終點的距離。",
    "**Pattern 2：次短路**\n\n每個節點保留兩個嚴格不同距離。鬆弛時先更新最短，再更新次短；相同距離不要重複算。",
    "```cpp\nvector<array<long long, 2>> twoShortest(vector<vector<pair<int,int>>>& g, int src) {\n    int n = g.size();\n    const long long INF = 4e18;\n    vector<array<long long, 2>> dist(n, {INF, INF});\n    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;\n    dist[src][0] = 0; pq.push({0, src});\n    while (!pq.empty()) {\n        auto [du, u] = pq.top(); pq.pop();\n        if (du > dist[u][1]) continue;\n        for (auto [v, w] : g[u]) {\n            long long nd = du + w;\n            if (nd < dist[v][0]) swap(nd, dist[v][0]), pq.push({dist[v][0], v});\n            if (dist[v][0] < nd && nd < dist[v][1]) dist[v][1] = nd, pq.push({nd, v});\n        }\n    }\n    return dist;\n}\n```",
    "**Pattern 3：分層圖**\n\n訊號：可用 k 次折扣、通行證、免費邊。狀態加一維 `used`，邊在同層或下一層轉移。",
    "**Pattern 4：等待規則**\n\n若交通燈或週期限制出發時間，dist 仍表示實際抵達時間；relax 前先把 `depart` 調到下一個可出發時間。",
  ].join("\n\n"),
  1103: [
    "**競程課程講義：樹題把子樹轉成區間或貢獻公式**",
    "**Pattern 1：Euler tour**\n\n訊號：子樹查詢、刪除子樹、判斷祖先。DFS 進入時間 `tin` 到離開前最大時間 `tout` 是子樹連續區間。",
    "```cpp\nvector<int> tin, tout, order;\nvoid dfsOrder(int u, int p, vector<vector<int>>& g) {\n    tin[u] = order.size();\n    order.push_back(u);\n    for (int v : g[u]) if (v != p) dfsOrder(v, u, g);\n    tout[u] = order.size();\n}\nbool isAncestor(int u, int v) { return tin[u] <= tin[v] && tin[v] < tout[u]; }\n```",
    "**Pattern 2：後序子樹 DP**\n\n先算孩子，再合併 size、sum、height、best path。",
    "**Pattern 3：換根 DP**\n\n第一次 DFS 算根為 0 的答案；第二次把父答案推給孩子。核心是推導跨過一條邊時貢獻如何改變。",
    "**Pattern 4：Binary lifting**\n\n訊號：多次 LCA、向上跳 k 步、路徑查詢。預處理 `up[j][v]` 表示 v 的 `2^j` 祖先。",
    "```cpp\nvoid buildLift(int root, vector<vector<int>>& g, vector<vector<int>>& up, vector<int>& depth) {\n    function<void(int,int)> dfs = [&](int u, int p) {\n        up[0][u] = p;\n        for (int j = 1; j < (int)up.size(); ++j) up[j][u] = up[j - 1][up[j - 1][u]];\n        for (int v : g[u]) if (v != p) depth[v] = depth[u] + 1, dfs(v, u);\n    };\n    dfs(root, root);\n}\n```",
  ].join("\n\n"),
  1104: [
    "**競程課程講義：字串工具通常只是 DP 的加速器**",
    "**Pattern 1：Z + DP 刪除前綴**\n\n若要比較 `s[i...]` 和 `s[j...]` 的 LCP，可對後綴建 Z 或用 rolling hash + binary search。",
    "**Pattern 2：KMP border tree**\n\nprefix function 形成 border 鏈，可以統計每個 border 出現次數、週期長度、前後綴關係。",
    "```cpp\nvector<int> borderCounts(const string& s) {\n    auto pi = prefixFunction(s);\n    int n = s.size();\n    vector<int> cnt(n + 1);\n    for (int x : pi) cnt[x]++;\n    for (int i = n; i > 0; --i) cnt[pi[i - 1]] += cnt[i];\n    for (int i = 0; i <= n; ++i) cnt[i]++;\n    return cnt;\n}\n```",
    "**Pattern 3：Hash LCP + DP**\n\n任意兩段比較時，用 hash 判斷長度 mid 是否相等，再二分 LCP。常用於 lexicographic DP 或一次 mismatch 判斷。",
    "**Pattern 4：Trie / Aho-Corasick + DP**\n\n多字典詞匹配 target 時，Trie 是基礎；若要從每個位置大量找所有詞，Aho-Corasick 能把匹配變成線性掃描。",
  ].join("\n\n"),
  1105: [
    "**競程課程講義：DP 優化先保留樸素式，再消掉枚舉維度**",
    "**Pattern 1：排序 + 二分前驅**\n\n活動選擇、工作排程、帶 k 次選擇。把相容條件變成前綴 index。",
    "**Pattern 2：單調隊列優化**\n\n訊號：`dp[i] = best(dp[j] + value[j])`，且 j 只在滑動窗口內。deque 維護候選值單調。",
    "```cpp\n// dp[i] = nums[i] + max(dp[j]) for i-k <= j < i.\nint constrainedSubsetSum(vector<int>& nums, int k) {\n    deque<int> dq;\n    vector<int> dp(nums.size());\n    int ans = nums[0];\n    for (int i = 0; i < (int)nums.size(); ++i) {\n        dp[i] = nums[i] + (dq.empty() ? 0 : max(0, dp[dq.front()]));\n        ans = max(ans, dp[i]);\n        while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();\n        dq.push_back(i);\n        if (dq.front() <= i - k) dq.pop_front();\n    }\n    return ans;\n}\n```",
    "**Pattern 3：前綴最佳值**\n\n若轉移只需要 `min(dp[j] - prefix[j])` 或 `max(dp[j] + value[j])`，用一個變數維護最佳候選即可。",
    "**Pattern 4：Convex Hull Trick**\n\n訊號：轉移形如 `dp[i] = min(m_j * x_i + b_j)`。每個 j 是一條線，查詢 x_i 的最小值。競程課中先要求學生辨認斜率與查詢 x 是否單調，再決定用 deque hull 或 Li Chao tree。",
  ].join("\n\n"),
};

export const googleInterviewSectionTutorials: GoogleInterviewSectionTutorial[] =
  sectionTutorials.map((section) => ({
    id: section.id,
    title: section.title,
    slug: sectionAnchor(section.title),
    content: [
      section.summary,
      competitiveProgrammingCourseMaterials[section.id],
    ]
      .filter(Boolean)
      .join("\n\n"),
  }));

export function getGoogleInterviewSectionTutorial(slug: string) {
  return googleInterviewSectionTutorials.find(
    (section) => section.slug === slug || String(section.id) === slug,
  );
}
