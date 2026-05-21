const studyPlanCourseMaterials: Record<string, string> = {
  google_interview: [
    "**競程課程講義：Google 面試題的競程化整理**",
    "這份題單橫跨圖、DP、字串、資料結構、系統 API 與資源限制。練習時建議把每題先歸類成一個已知 pattern，再補上面試需要的溝通：狀態定義、正確性、不變式、複雜度與邊界條件。",
    "**常見 Pattern**：BFS / Dijkstra、拓撲排序、樹形 DP、KMP / Trie / hash、heap / set / Fenwick、二分答案、滑動視窗、bitmask BFS、換根 DP。",
    "```cpp\n// Interview checklist for algorithmic problems.\nstruct Checklist {\n    string state;        // what information determines the future?\n    string transition;   // how do we move to the next state?\n    string invariant;    // what is always true after each step?\n    string complexity;   // can it pass the input limits?\n};\n```",
  ].join("\n\n"),

  rating_2100: [
    "**競程課程講義：Rating 2100 常見思維**",
    "這個難度通常不是考單一模板，而是考「把兩三個基本技巧拼起來」。先找約束：`n <= 2e5` 多半需要 `O(n log n)`；`n <= 20` 可以狀壓；值域小可以計數或枚舉值域；圖邊權非負可考慮 Dijkstra。",
    "**Pattern 1：排序後維護前綴最佳值**\n\n例題模型：每個物品有兩個維度，排序一維後，用資料結構維護另一維的最佳答案。",
    "```cpp\n// Sort by x, query best value seen so far.\nlong long bestAfterSorting(vector<pair<int, int>>& items) {\n    sort(items.begin(), items.end());\n    long long best = LLONG_MIN, ans = LLONG_MIN;\n    for (auto [x, y] : items) {\n        if (best != LLONG_MIN) ans = max(ans, best + y - x);\n        best = max(best, 1LL * y + x);\n    }\n    return ans;\n}\n```",
    "**Pattern 2：枚舉關鍵點**\n\n2100 題常要求你少枚舉。不要枚舉所有答案，只枚舉會改變答案的邊界、排序後相鄰點、因數、bit 或決策次數。",
    "**Pattern 3：資料結構維護候選集合**\n\n如果每一步需要刪除過期候選並查最大/最小，用 heap、set、Fenwick、segment tree 或 monotonic deque。",
  ].join("\n\n"),

  binary_search: [
    "**競程課程講義：二分搜尋與二分答案**",
    "**Pattern 1：lower_bound / upper_bound**\n\n訊號：排序陣列中找第一個 `>= x`、第一個 `> x`、最後一個 `< x`。不變式是答案始終在 `[lo, hi)`。",
    "```cpp\nint firstGreaterEqual(vector<int>& a, int x) {\n    int lo = 0, hi = a.size();\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] >= x) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}\n```",
    "**Pattern 2：二分答案**\n\n訊號：問「最小可行值」或「最大可行值」。必須先定義單調 predicate。例題：最小速度、最小最大分段和、最大最小距離。",
    "```cpp\nlong long minimizeLargestSum(vector<int>& nums, int k) {\n    auto ok = [&](long long limit) {\n        int groups = 1;\n        long long sum = 0;\n        for (int x : nums) {\n            if (x > limit) return false;\n            if (sum + x > limit) groups++, sum = 0;\n            sum += x;\n        }\n        return groups <= k;\n    };\n    long long lo = 0, hi = accumulate(nums.begin(), nums.end(), 0LL);\n    while (lo < hi) {\n        long long mid = lo + (hi - lo) / 2;\n        if (ok(mid)) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}\n```",
    "**Pattern 3：實數二分**\n\n訊號：答案是浮點數或幾何長度。固定迭代 60 到 100 次，比用 epsilon 當 while 條件更穩。",
  ].join("\n\n"),

  bitwise_operations: [
    "**競程課程講義：位元運算**",
    "**Pattern 1：集合狀態壓縮**\n\n第 i 個元素是否存在，用第 i bit 表示。常用於 `n <= 20` 的集合 DP、枚舉子集、訪問狀態。",
    "```cpp\nfor (int sub = mask; sub; sub = (sub - 1) & mask) {\n    // sub is a non-empty subset of mask\n}\n```",
    "**Pattern 2：逐 bit 貢獻**\n\nXOR / OR / AND 的總和常可拆成每一 bit 分開計算。例題：所有 pair XOR sum，每個 bit 貢獻 `count0 * count1 * 2^b`。",
    "```cpp\nlong long pairXorSum(vector<int>& nums) {\n    long long ans = 0;\n    for (int b = 0; b < 31; ++b) {\n        long long ones = 0;\n        for (int x : nums) ones += (x >> b) & 1;\n        ans += ones * (nums.size() - ones) * (1LL << b);\n    }\n    return ans;\n}\n```",
    "**Pattern 3：試填答案 bit**\n\n最大 XOR、最小 OR 類問題常從高位到低位貪心試填，並用 set / trie 檢查可行性。",
    "```cpp\nint maxPairXor(vector<int>& nums) {\n    int ans = 0, mask = 0;\n    for (int b = 30; b >= 0; --b) {\n        mask |= 1 << b;\n        unordered_set<int> seen;\n        for (int x : nums) seen.insert(x & mask);\n        int candidate = ans | (1 << b);\n        for (int p : seen) {\n            if (seen.count(p ^ candidate)) { ans = candidate; break; }\n        }\n    }\n    return ans;\n}\n```",
  ].join("\n\n"),

  data_structure: [
    "**競程課程講義：資料結構選型**",
    "**Pattern 1：Stack / monotonic stack**\n\n訊號：找左/右第一個更大、更小，或用每個元素當最小值/最大值算貢獻。",
    "**Pattern 2：Heap**\n\n訊號：動態取最大/最小、Top-K、合併 k 個有序序列。若元素會失效，用 lazy deletion。",
    "**Pattern 3：Trie**\n\n訊號：字串前綴、多字典匹配、最大 XOR。二進位 Trie 可逐 bit 決策。",
    "```cpp\nstruct BinaryTrie {\n    vector<array<int, 2>> child{{{-1, -1}}};\n    void insert(int x) {\n        int u = 0;\n        for (int b = 30; b >= 0; --b) {\n            int c = (x >> b) & 1;\n            if (child[u][c] == -1) child[u][c] = child.size(), child.push_back({-1, -1});\n            u = child[u][c];\n        }\n    }\n};\n```",
    "**Pattern 4：Fenwick / Segment Tree**\n\nFenwick 適合單點加、前綴和；Segment tree 適合區間 query、區間 update、維護 max/min/gcd 等可合併資訊。",
    "```cpp\nclass Fenwick {\n    vector<long long> bit;\npublic:\n    Fenwick(int n) : bit(n + 1) {}\n    void add(int i, long long v) { for (++i; i < (int)bit.size(); i += i & -i) bit[i] += v; }\n    long long sum(int i) { long long s = 0; for (++i; i > 0; i -= i & -i) s += bit[i]; return s; }\n};\n```",
  ].join("\n\n"),

  dynamic_programming: [
    "**競程課程講義：動態規劃 Pattern**",
    "**Pattern 1：線性 DP**\n\n狀態按位置推進，轉移只依賴前面。先定義 `dp[i]` 的語意，再寫 take/skip 或 split。",
    "**Pattern 2：背包 DP**\n\n0/1 背包倒序枚舉容量，完全背包正序枚舉容量。",
    "```cpp\nint zeroOneKnapsack(vector<int>& w, vector<int>& val, int cap) {\n    vector<int> dp(cap + 1);\n    for (int i = 0; i < (int)w.size(); ++i) {\n        for (int c = cap; c >= w[i]; --c) {\n            dp[c] = max(dp[c], dp[c - w[i]] + val[i]);\n        }\n    }\n    return dp[cap];\n}\n```",
    "**Pattern 3：區間 DP**\n\n訊號：合併區間、刪除區間、括號/回文。枚舉長度，再枚舉左端點和切分點。",
    "```cpp\nfor (int len = 2; len <= n; ++len) {\n    for (int l = 0; l + len <= n; ++l) {\n        int r = l + len - 1;\n        for (int k = l; k < r; ++k) {\n            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + cost(l, r));\n        }\n    }\n}\n```",
    "**Pattern 4：狀壓 DP**\n\n訊號：集合大小小。典型狀態 `dp[mask][last]` 表示已選集合 mask 且最後在 last。",
    "**Pattern 5：樹形 DP**\n\nDFS 後序合併孩子狀態。若答案和根有關，再做換根 DP。",
    "**Pattern 6：DP 優化**\n\n常見是前綴最佳值、單調隊列、斜率優化、分治優化。先寫出樸素轉移，再觀察可消掉哪個枚舉維度。",
  ].join("\n\n"),

  graph: [
    "**競程課程講義：圖論演算法 Pattern**",
    "**Pattern 1：DFS/BFS 走訪**\n\n連通塊、二分圖染色、網格可達性。BFS 適合等權最短路，DFS 適合回溯與子樹統計。",
    "**Pattern 2：拓撲排序**\n\nDAG 依賴、課程排程、DAG DP。若處理數小於 n，代表有環。",
    "```cpp\nvector<int> topoSort(int n, vector<vector<int>>& g) {\n    vector<int> indeg(n), order;\n    for (int u = 0; u < n; ++u) for (int v : g[u]) indeg[v]++;\n    queue<int> q;\n    for (int i = 0; i < n; ++i) if (!indeg[i]) q.push(i);\n    while (!q.empty()) {\n        int u = q.front(); q.pop(); order.push_back(u);\n        for (int v : g[u]) if (--indeg[v] == 0) q.push(v);\n    }\n    return order;\n}\n```",
    "**Pattern 3：最短路**\n\n等權 BFS、0-1 BFS、非負權 Dijkstra、有負權 Bellman-Ford / SPFA 判負環。競程中先看邊權範圍再選。",
    "**Pattern 4：最小生成樹**\n\n無向連通圖選 n-1 條邊讓總權最小。Kruskal = sort edges + DSU。",
    "```cpp\nlong long kruskal(int n, vector<array<int,3>>& edges) {\n    sort(edges.begin(), edges.end());\n    DSU dsu(n);\n    long long total = 0;\n    for (auto [w, u, v] : edges) if (dsu.unite(u, v)) total += w;\n    return total;\n}\n```",
    "**Pattern 5：SCC / bridge / articulation**\n\nSCC 用在有向互相可達，bridge/articulation 用在無向關鍵邊/點。",
    "**Pattern 6：Network flow**\n\n訊號：二分圖匹配、最大流、最小割、帶容量分配。熟悉 Dinic 的 BFS 分層 + DFS 增廣即可處理多數題。",
  ].join("\n\n"),

  greedy: [
    "**競程課程講義：貪心要有證明**",
    "**Pattern 1：排序後選最早結束**\n\n區間不重疊問題常按右端點排序。證明用交換論證：任何最優解的第一個區間都可換成右端點更早的區間。",
    "```cpp\nint maxNonOverlapping(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });\n    int ans = 0, end = INT_MIN;\n    for (auto& it : intervals) if (it[0] >= end) ans++, end = it[1];\n    return ans;\n}\n```",
    "**Pattern 2：反悔貪心**\n\n先接受選擇，若超出限制，就移除目前最差的一個。常用 heap。",
    "```cpp\nint scheduleCourse(vector<vector<int>>& courses) {\n    sort(courses.begin(), courses.end(), [](auto& a, auto& b) { return a[1] < b[1]; });\n    priority_queue<int> pq;\n    int time = 0;\n    for (auto& c : courses) {\n        time += c[0]; pq.push(c[0]);\n        if (time > c[1]) time -= pq.top(), pq.pop();\n    }\n    return pq.size();\n}\n```",
    "**Pattern 3：字典序貪心**\n\n從左到右決定答案，每一步保證剩餘資源還能完成目標。常搭配 monotonic stack。",
    "**Pattern 4：構造貪心**\n\n先找必要條件，再按規則構造。構造題要同時說明為何不會卡住，以及結果滿足所有限制。",
  ].join("\n\n"),

  grid: [
    "**競程課程講義：網格圖**",
    "**Pattern 1：Flood fill**\n\n訊號：島嶼數量、連通區域大小、包圍區域。把 `(r,c)` 當節點，四方向或八方向當邊。",
    "```cpp\nint dirs[5] = {1, 0, -1, 0, 1};\nvoid dfs(int r, int c, vector<vector<int>>& grid) {\n    int m = grid.size(), n = grid[0].size();\n    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] == 0) return;\n    grid[r][c] = 0;\n    for (int d = 0; d < 4; ++d) dfs(r + dirs[d], c + dirs[d + 1], grid);\n}\n```",
    "**Pattern 2：多源 BFS**\n\n訊號：每個格子到最近 source 的距離，例如最近 0、腐爛橘子、邊界逃離。把所有 source 同時入隊。",
    "**Pattern 3：狀態 BFS**\n\n若同一格的未來取決於鑰匙、剩餘消除次數、方向或時間，visited 必須包含額外維度。",
    "**Pattern 4：網格 Dijkstra / 0-1 BFS**\n\n格子移動成本不同時使用 Dijkstra；成本只有 0/1 時使用 0-1 BFS。",
  ].join("\n\n"),

  math: [
    "**競程課程講義：數學題 Pattern**",
    "**Pattern 1：GCD / LCM / Euclid**\n\n整除、週期、最大公因數。注意 `lcm(a,b)=a/gcd(a,b)*b` 避免溢位。",
    "```cpp\nlong long gcdll(long long a, long long b) {\n    while (b) tie(a, b) = pair(b, a % b);\n    return a;\n}\n```",
    "**Pattern 2：快速冪與模逆元**\n\n訊號：大指數、組合數取模。若 MOD 是質數，`inv(x)=x^(MOD-2)`。",
    "```cpp\nlong long modPow(long long a, long long e, long long mod) {\n    long long r = 1;\n    while (e) {\n        if (e & 1) r = r * a % mod;\n        a = a * a % mod;\n        e >>= 1;\n    }\n    return r;\n}\n```",
    "**Pattern 3：篩法**\n\n求質數、最小質因數、分解多個數。多次 factor query 時先預處理 SPF。",
    "**Pattern 4：組合計數**\n\n先判斷是排列、組合、隔板法、容斥還是 DP 計數。取模時預處理 factorial 和 inverse factorial。",
    "**Pattern 5：博弈論**\n\n公平組合遊戲看 SG function；簡單取石子看必敗態/必勝態遞推。",
    "**Pattern 6：幾何**\n\n向量叉積判方向，點積判角度/投影。幾何題優先畫圖並處理精度。",
  ].join("\n\n"),

  monotonic_stack: [
    "**競程課程講義：單調堆疊**",
    "**Pattern 1：下一個更大/更小元素**\n\n維護 stack 中元素單調。當新元素破壞單調性時，彈出的元素就找到了右側第一個答案。",
    "```cpp\nvector<int> nextGreater(vector<int>& a) {\n    int n = a.size();\n    vector<int> ans(n, -1), st;\n    for (int i = 0; i < n; ++i) {\n        while (!st.empty() && a[st.back()] < a[i]) {\n            ans[st.back()] = i;\n            st.pop_back();\n        }\n        st.push_back(i);\n    }\n    return ans;\n}\n```",
    "**Pattern 2：貢獻法**\n\n每個元素作為區間最小/最大值時，找到左右邊界，貢獻是 `leftChoices * rightChoices * value`。",
    "**Pattern 3：最大矩形**\n\n直方圖最大矩形用單調遞增 stack，彈出高度 h 時，以當前 i 作為右邊界，stack top 作為左邊界。",
    "**Pattern 4：字典序最小 subsequence**\n\nstack 維護答案，若當前字元更小且被彈字元後面還會出現，就可以彈出。",
  ].join("\n\n"),

  sliding_window: [
    "**競程課程講義：滑動視窗與雙指標**",
    "**Pattern 1：定長視窗**\n\n窗口大小固定 k，每次右進一個、左出一個，更新 sum/count/max。",
    "```cpp\nint maxSumFixedK(vector<int>& nums, int k) {\n    int sum = 0, ans = INT_MIN;\n    for (int i = 0; i < (int)nums.size(); ++i) {\n        sum += nums[i];\n        if (i >= k) sum -= nums[i - k];\n        if (i >= k - 1) ans = max(ans, sum);\n    }\n    return ans;\n}\n```",
    "**Pattern 2：不定長視窗**\n\n右端擴張直到不合法，左端收縮恢復合法。適用於條件能局部維護的連續子陣列/子字串。",
    "**Pattern 3：恰好 K 轉成 atMost(K) - atMost(K-1)**\n\n計數型問題常用。例題：恰好 K 個不同整數的子陣列。",
    "```cpp\nlong long atMostKDistinct(vector<int>& nums, int k) {\n    unordered_map<int, int> cnt;\n    long long ans = 0;\n    int left = 0;\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        if (cnt[nums[right]]++ == 0) k--;\n        while (k < 0) if (--cnt[nums[left++]] == 0) k++;\n        ans += right - left + 1;\n    }\n    return ans;\n}\n```",
    "**Pattern 4：雙序列雙指標**\n\n兩個排序序列合併、求交集、最小差值。指標移動依當前較小元素決定。",
  ].join("\n\n"),

  string: [
    "**競程課程講義：字串演算法**",
    "**Pattern 1：KMP**\n\n固定 pattern 匹配與 border。核心是 prefix function。",
    "**Pattern 2：Z function**\n\n比較每個後綴與整串前綴。常用於前綴匹配、字串拼接判斷。",
    "**Pattern 3：Manacher**\n\n線性求每個中心的回文半徑。適用於回文子串計數、最長回文。",
    "```cpp\nvector<int> manacherOdd(const string& s) {\n    int n = s.size();\n    vector<int> d(n);\n    for (int i = 0, l = 0, r = -1; i < n; ++i) {\n        int k = (i > r) ? 1 : min(d[l + r - i], r - i + 1);\n        while (0 <= i - k && i + k < n && s[i - k] == s[i + k]) k++;\n        d[i] = k--;\n        if (i + k > r) l = i - k, r = i + k;\n    }\n    return d;\n}\n```",
    "**Pattern 4：Rolling hash**\n\n任意子串比較。注意碰撞，可雙模或 64-bit。",
    "**Pattern 5：Aho-Corasick**\n\n多 pattern 同時匹配。Trie + failure links，把多字典匹配降成線性掃描。",
    "**Pattern 6：Suffix array / automaton**\n\n進階字串結構。常用於後綴排序、不同子串數量、LCP 查詢。",
  ].join("\n\n"),

  trees: [
    "**競程課程講義：鏈結串列、樹與回溯**",
    "**Pattern 1：鏈結串列 dummy node**\n\n刪除、合併、反轉局部鏈表時用 dummy 簡化頭節點變化。",
    "```cpp\nListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    while (head) {\n        ListNode* next = head->next;\n        head->next = prev;\n        prev = head;\n        head = next;\n    }\n    return prev;\n}\n```",
    "**Pattern 2：快慢指標**\n\n找中點、判環、找環入口。快指標一次兩步，慢指標一次一步。",
    "**Pattern 3：二元樹 DFS**\n\n前序適合自頂向下傳狀態；後序適合回傳子樹資訊，如高度、直徑、是否平衡。",
    "```cpp\nint diameter = 0;\nint depth(TreeNode* root) {\n    if (!root) return 0;\n    int l = depth(root->left), r = depth(root->right);\n    diameter = max(diameter, l + r);\n    return max(l, r) + 1;\n}\n```",
    "**Pattern 4：BFS 層序**\n\n最短層數、每層統計、鋸齒遍歷。",
    "**Pattern 5：LCA**\n\n二元樹遞迴：若左右各找到一個目標，當前節點是 LCA。多次查詢用 binary lifting。",
    "**Pattern 6：回溯**\n\n排列、組合、子集、棋盤搜索。模板是選擇、遞迴、撤銷；剪枝來自排序、剩餘容量、合法性檢查。",
  ].join("\n\n"),
};

const beginnerLecturePreface = [
  "**如何像競程課學生一樣讀這份講義**",
  "每個 pattern 都請照同一個順序理解：先看題目訊號，再定義狀態或資料結構，接著寫出維護的不變式，最後才背 C++ 模板。初學者最常犯的錯是先套模板，但不知道模板保證了什麼；面試和競賽真正要練的是「看到限制後能選對模型」。",
  "**課堂解題流程**：\n1. 讀限制：`n`、值域、邊數、是否多次查詢。\n2. 找訊號：連續區間、排序、集合狀態、圖可達、最小最大、歷史版本。\n3. 選 pattern：把題目映射到已知模型。\n4. 寫不變式：例如 BFS 第一次出隊最短、單調棧內元素保持遞增、Fenwick 維護前綴和。\n5. 驗證複雜度：先算狀態數，再算每個狀態的轉移成本。",
  "```cpp\n// A compact checklist to write before coding.\nstruct PatternChecklist {\n    string signal;      // What words or constraints suggest this pattern?\n    string state;       // What must be stored to make future decisions?\n    string invariant;   // What remains true after each operation?\n    string transition;  // How does one step update the state?\n    string complexity;  // Why does it fit the constraints?\n};\n```",
].join("\n\n");

const beginnerPracticeGuide = [
  "**課後練習方式**",
  "同一個 pattern 至少連續練三題：第一題照模板寫，第二題自己重寫並解釋不變式，第三題改變一個條件，例如把等權邊改成 0/1 權、把一次查詢改成多次查詢、把靜態資料改成動態更新。能處理這些變形，才代表你真正掌握 pattern。",
  "**複盤問題**：\n- 我為什麼選這個 pattern，而不是相近的另一個？\n- 我的狀態是否包含所有會影響未來的資訊？\n- 哪一行程式維護了核心不變式？\n- 若輸入限制放大 10 倍，瓶頸在哪裡？",
].join("\n\n");

export function getStudyPlanCourseMaterial(plan: string) {
  const material = studyPlanCourseMaterials[plan];
  if (!material) {
    return undefined;
  }

  return [beginnerLecturePreface, material, beginnerPracticeGuide].join(
    "\n\n---\n\n",
  );
}
