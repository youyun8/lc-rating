const studyPlanCourseMaterials: Record<string, string> = {
  google_interview: [
    "**競程課程講義：Google 面試題的競程化整理**",
    "這份題單橫跨圖、DP、字串、資料結構、系統 API 與資源限制。練習時建議把每題先歸類成一個已知 pattern，再補上面試需要的溝通：狀態定義、正確性、不變式、複雜度與邊界條件。",
    "**常見 Pattern**：BFS / Dijkstra、拓撲排序、樹形 DP、KMP / Trie / hash、heap / set / Fenwick、二分答案、滑動視窗、bitmask BFS、換根 DP。",
  ].join("\n\n"),

  rating_2100: [
    "**競程課程講義：Rating 2100 常見思維**",
    "這個難度通常不是考單一模板，而是考「把兩三個基本技巧拼起來」。先找約束：`n <= 2e5` 多半需要 `O(n log n)`；`n <= 20` 可以狀壓；值域小可以計數或枚舉值域；圖邊權非負可考慮 Dijkstra。",
    "**Pattern 1：排序後維護前綴最佳值**\n\n例題模型：每個物品有兩個維度，排序一維後，用資料結構維護另一維的最佳答案。",
    "```cpp\n// Sort by x, query best value seen so far.\nlong long bestAfterSorting(vector<pair<int, int>>& items) {\n  sort(items.begin(), items.end());\n  long long best = LLONG_MIN, ans = LLONG_MIN;\n  for (auto [x, y] : items) {\n    if (best != LLONG_MIN) {\n      ans = max(ans, best + y - x);\n    }\n    best = max(best, 1LL * y + x);\n  }\n  return ans;\n}\n```",
    "**Pattern 2：枚舉關鍵點**\n\n2100 題常要求你少枚舉。不要枚舉所有答案，只枚舉會改變答案的邊界、排序後相鄰點、因數、bit 或決策次數。",
    "**Pattern 3：資料結構維護候選集合**\n\n如果每一步需要刪除過期候選並查最大/最小，用 heap、set、Fenwick、segment tree 或 monotonic deque。",
  ].join("\n\n"),

  binary_search: [
    "**競程課程講義：二分搜尋與二分答案**",
    "**Pattern 1：lower_bound / upper_bound**\n\n訊號：排序陣列中找第一個 `>= x`、第一個 `> x`、最後一個 `< x`。不變式是答案始終在 `[lo, hi)`。",
    "```cpp\nint firstGreaterEqual(vector<int>& a, int x) {\n  int lo = 0, hi = a.size();\n  while (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (a[mid] >= x) {\n      hi = mid;\n    } else {\n      lo = mid + 1;\n    }\n  }\n  return lo;\n}\n```",
    "**Pattern 2：二分答案**\n\n訊號：問「最小可行值」或「最大可行值」。必須先定義單調 predicate。例題：最小速度、最小最大分段和、最大最小距離。",
    "```cpp\nlong long minimizeLargestSum(vector<int>& nums, int k) {\n  auto canSplit = [&nums, k](long long limit) {\n    int groups = 1;\n    long long current_sum = 0;\n    for (int x : nums) {\n      if (x > limit) {\n        return false;\n      }\n      if (current_sum + x > limit) {\n        groups++;\n        current_sum = 0;\n      }\n      current_sum += x;\n    }\n    return groups <= k;\n  };\n  long long left = 0, right = accumulate(nums.begin(), nums.end(), 0LL);\n  while (left < right) {\n    long long mid = left + (right - left) / 2;\n    if (canSplit(mid)) {\n      right = mid;\n    } else {\n      left = mid + 1;\n    }\n  }\n  return left;\n}\n```",
    "**Pattern 3：實數二分**\n\n訊號：答案是浮點數或幾何長度。固定迭代 60 到 100 次，比用 epsilon 當 while 條件更穩。",
  ].join("\n\n"),

  bitwise_operations: [
    "**競程課程講義：位元運算**",
    "**Pattern 1：集合狀態壓縮**\n\n第 i 個元素是否存在，用第 i bit 表示。常用於 `n <= 20` 的集合 DP、枚舉子集、訪問狀態。",
    "```cpp\nfor (int sub = mask; sub; sub = (sub - 1) & mask) {\n  // sub is a non-empty subset of mask\n}\n```",
    "**Pattern 2：逐 bit 貢獻**\n\nXOR / OR / AND 的總和常可拆成每一 bit 分開計算。例題：所有 pair XOR sum，每個 bit 貢獻 `count0 * count1 * 2^b`。",
    "```cpp\nlong long pairXorSum(vector<int>& nums) {\n  long long ans = 0;\n  for (int b = 0; b < 31; ++b) {\n    long long ones = 0;\n    for (int x : nums) {\n      ones += (x >> b) & 1;\n    }\n    ans += ones * (nums.size() - ones) * (1LL << b);\n  }\n  return ans;\n}\n```",
    "**Pattern 3：試填答案 bit**\n\n最大 XOR、最小 OR 類問題常從高位到低位貪心試填，並用 set / trie 檢查可行性。",
    "```cpp\nint maxPairXor(vector<int>& nums) {\n  int ans = 0, mask = 0;\n  for (int b = 30; b >= 0; --b) {\n    mask |= 1 << b;\n    unordered_set<int> seen;\n    for (int x : nums) {\n      seen.insert(x & mask);\n    }\n    int candidate = ans | (1 << b);\n    for (int p : seen) {\n      if (seen.count(p ^ candidate)) {\n        ans = candidate;\n        break;\n      }\n    }\n  }\n  return ans;\n}\n```",
  ].join("\n\n"),

  data_structure: [
    "**競程課程講義：資料結構選型**",
    "**Pattern 1：Stack / monotonic stack**\n\n訊號：找左/右第一個更大、更小，或用每個元素當最小值/最大值算貢獻。",
    "**Pattern 2：Heap**\n\n訊號：動態取最大/最小、Top-K、合併 k 個有序序列。若元素會失效，用 lazy deletion。",
    "**Pattern 3：Trie**\n\n訊號：字串前綴、多字典匹配、最大 XOR。二進位 Trie 可逐 bit 決策。",
    "```cpp\nstruct BinaryTrie {\n  vector<array<int, 2>> children{{{-1, -1}}};\n\n  void insert(int x) {\n    int node = 0;\n    for (int bit = 30; bit >= 0; --bit) {\n      int direction = (x >> bit) & 1;\n      if (children[node][direction] == -1) {\n        children[node][direction] = children.size();\n        children.push_back({-1, -1});\n      }\n      node = children[node][direction];\n    }\n  }\n};\n```",
    "**Pattern 4：Fenwick / Segment Tree**\n\nFenwick 適合單點加、前綴和；Segment tree 適合區間 query、區間 update、維護 max/min/gcd 等可合併資訊。",
    "```cpp\nclass Fenwick {\n  vector<long long> bit_;\n\n public:\n  Fenwick(int n) : bit_(n + 1) {}\n\n  void add(int index, long long delta) {\n    for (++index; index < (int)bit_.size(); index += index & -index) {\n      bit_[index] += delta;\n    }\n  }\n\n  long long prefixSum(int index) {\n    long long sum = 0;\n    for (++index; index > 0; index -= index & -index) {\n      sum += bit_[index];\n    }\n    return sum;\n  }\n};\n```",
  ].join("\n\n"),

  dynamic_programming: [
    "**競程課程講義：動態規劃 Pattern**",
    "**Pattern 1：線性 DP**\n\n狀態按位置推進，轉移只依賴前面。先定義 `dp[i]` 的語意，再寫 take/skip 或 split。",
    "**Pattern 2：背包 DP**\n\n0/1 背包倒序枚舉容量，完全背包正序枚舉容量。",
    "```cpp\nint zeroOneKnapsack(vector<int>& weights, vector<int>& values, int capacity) {\n  vector<int> dp(capacity + 1);\n  for (int i = 0; i < (int)weights.size(); ++i) {\n    for (int cap = capacity; cap >= weights[i]; --cap) {\n      dp[cap] = max(dp[cap], dp[cap - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}\n```",
    "**Pattern 3：區間 DP**\n\n訊號：合併區間、刪除區間、括號/回文。枚舉長度，再枚舉左端點和切分點。",
    "```cpp\nfor (int len = 2; len <= n; ++len) {\n  for (int l = 0; l + len <= n; ++l) {\n    int r = l + len - 1;\n    for (int k = l; k < r; ++k) {\n      dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + cost(l, r));\n    }\n  }\n}\n```",
    "**Pattern 4：狀壓 DP**\n\n訊號：集合大小小。典型狀態 `dp[mask][last]` 表示已選集合 mask 且最後在 last。",
    "**Pattern 5：樹形 DP**\n\nDFS 後序合併孩子狀態。若答案和根有關，再做換根 DP。",
    "**Pattern 6：DP 優化**\n\n常見是前綴最佳值、單調隊列、斜率優化、分治優化。先寫出樸素轉移，再觀察可消掉哪個枚舉維度。",
  ].join("\n\n"),

  graph: [
    "**競程課程講義：圖論演算法 Pattern**",
    "**Pattern 1：DFS/BFS 走訪**\n\n連通塊、二分圖染色、網格可達性。BFS 適合等權最短路，DFS 適合回溯與子樹統計。",
    "**Pattern 2：拓撲排序**\n\nDAG 依賴、課程排程、DAG DP。若處理數小於 n，代表有環。",
    "```cpp\nvector<int> topoSort(int n, vector<vector<int>>& g) {\n  vector<int> indeg(n), order;\n  for (int u = 0; u < n; ++u) {\n    for (int v : g[u]) {\n      indeg[v]++;\n    }\n  }\n  queue<int> q;\n  for (int i = 0; i < n; ++i) {\n    if (!indeg[i]) {\n      q.push(i);\n    }\n  }\n  while (!q.empty()) {\n    int u = q.front();\n    q.pop();\n    order.push_back(u);\n    for (int v : g[u]) {\n      if (--indeg[v] == 0) {\n        q.push(v);\n      }\n    }\n  }\n  return order;\n}\n```",
    "**Pattern 3：最短路**\n\n等權 BFS、0-1 BFS、非負權 Dijkstra、有負權 Bellman-Ford / SPFA 判負環。競程中先看邊權範圍再選。",
    "**Pattern 4：最小生成樹**\n\n無向連通圖選 n-1 條邊讓總權最小。Kruskal = sort edges + DSU。",
    "```cpp\nlong long kruskal(int n, vector<array<int, 3>>& edges) {\n  sort(edges.begin(), edges.end());\n  DSU dsu(n);\n  long long total = 0;\n  for (auto [w, u, v] : edges) {\n    if (dsu.unite(u, v)) {\n      total += w;\n    }\n  }\n  return total;\n}\n```",
    "**Pattern 5：SCC / bridge / articulation**\n\nSCC 用在有向互相可達，bridge/articulation 用在無向關鍵邊/點。",
    "**Pattern 6：Network flow**\n\n訊號：二分圖匹配、最大流、最小割、帶容量分配。熟悉 Dinic 的 BFS 分層 + DFS 增廣即可處理多數題。",
  ].join("\n\n"),

  greedy: [
    "**競程課程講義：貪心要有證明**",
    "**Pattern 1：排序後選最早結束**\n\n區間不重疊問題常按右端點排序。證明用交換論證：任何最優解的第一個區間都可換成右端點更早的區間。",
    "```cpp\nint maxNonOverlapping(vector<vector<int>>& intervals) {\n  sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });\n  int ans = 0, end = INT_MIN;\n  for (auto& it : intervals) {\n    if (it[0] >= end) {\n      ans++, end = it[1];\n    }\n  }\n  return ans;\n}\n```",
    "**Pattern 2：反悔貪心**\n\n先接受選擇，若超出限制，就移除目前最差的一個。常用 heap。",
    "```cpp\nint scheduleCourse(vector<vector<int>>& courses) {\n  sort(courses.begin(), courses.end(), [](auto& a, auto& b) { return a[1] < b[1]; });\n  priority_queue<int> pq;\n  int time = 0;\n  for (auto& c : courses) {\n    time += c[0];\n    pq.push(c[0]);\n    if (time > c[1]) {\n      time -= pq.top(), pq.pop();\n    }\n  }\n  return pq.size();\n}\n```",
    "**Pattern 3：字典序貪心**\n\n從左到右決定答案，每一步保證剩餘資源還能完成目標。常搭配 monotonic stack。",
    "**Pattern 4：構造貪心**\n\n先找必要條件，再按規則構造。構造題要同時說明為何不會卡住，以及結果滿足所有限制。",
  ].join("\n\n"),

  grid: [
    "**競程課程講義：網格圖**",
    "**Pattern 1：Flood fill**\n\n訊號：島嶼數量、連通區域大小、包圍區域。把 `(r, c)` 當節點，四方向或八方向當邊。",
    "```cpp\nint dirs[5] = {1, 0, -1, 0, 1};\nvoid dfs(int r, int c, vector<vector<int>>& grid) {\n  int m = grid.size(), n = grid[0].size();\n  if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] == 0) {\n    return;\n  }\n  grid[r][c] = 0;\n  for (int d = 0; d < 4; ++d) {\n    dfs(r + dirs[d], c + dirs[d + 1], grid);\n  }\n}\n```",
    "**Pattern 2：多源 BFS**\n\n訊號：每個格子到最近 source 的距離，例如最近 0、腐爛橘子、邊界逃離。把所有 source 同時入隊。",
    "**Pattern 3：狀態 BFS**\n\n若同一格的未來取決於鑰匙、剩餘消除次數、方向或時間，visited 必須包含額外維度。",
    "**Pattern 4：網格 Dijkstra / 0-1 BFS**\n\n格子移動成本不同時使用 Dijkstra；成本只有 0/1 時使用 0-1 BFS。",
  ].join("\n\n"),

  math: [
    "**競程課程講義：數學題 Pattern**",
    "**Pattern 1：GCD / LCM / Euclid**\n\n整除、週期、最大公因數。注意 `lcm(a, b)=a/gcd(a, b)*b` 避免溢位。",
    "```cpp\nlong long gcdLl(long long a, long long b) {\n  while (b) {\n    tie(a, b) = pair(b, a % b);\n  }\n  return a;\n}\n```",
    "**Pattern 2：快速冪與模逆元**\n\n訊號：大指數、組合數取模。若 mod 是質數，`inv(x)=x^(mod-2)`。",
    "```cpp\nlong long modPow(long long a, long long e, long long mod) {\n  long long r = 1;\n  while (e) {\n    if (e & 1) {\n      r = r * a % mod;\n    }\n    a = a * a % mod;\n    e >>= 1;\n  }\n  return r;\n}\n```",
    "**Pattern 3：篩法**\n\n求質數、最小質因數、分解多個數。多次 factor query 時先預處理 SPF。",
    "**Pattern 4：組合計數**\n\n先判斷是排列、組合、隔板法、容斥還是 DP 計數。取模時預處理 factorial 和 inverse factorial。",
    "**Pattern 5：博弈論**\n\n公平組合遊戲看 SG function；簡單取石子看必敗態/必勝態遞推。",
    "**Pattern 6：幾何**\n\n向量叉積判方向，點積判角度/投影。幾何題優先畫圖並處理精度。",
  ].join("\n\n"),

  monotonic_stack: [
    "**競程課程講義：單調堆疊**",
    "**Pattern 1：下一個更大/更小元素**\n\n維護 stack 中元素單調。當新元素破壞單調性時，彈出的元素就找到了右側第一個答案。",
    "```cpp\nvector<int> nextGreater(vector<int>& a) {\n  int n = a.size();\n  vector<int> ans(n, -1), st;\n  for (int i = 0; i < n; ++i) {\n    while (!st.empty() && a[st.back()] < a[i]) {\n      ans[st.back()] = i;\n      st.pop_back();\n    }\n    st.push_back(i);\n  }\n  return ans;\n}\n```",
    "**Pattern 2：貢獻法**\n\n每個元素作為區間最小/最大值時，找到左右邊界，貢獻是 `leftChoices * rightChoices * value`。",
    "**Pattern 3：最大矩形**\n\n直方圖最大矩形用單調遞增 stack，彈出高度 h 時，以當前 i 作為右邊界，stack top 作為左邊界。",
    "**Pattern 4：字典序最小 subsequence**\n\nstack 維護答案，若當前字元更小且被彈字元後面還會出現，就可以彈出。",
  ].join("\n\n"),

  sliding_window: [
    "**競程課程講義：滑動視窗與雙指標**",
    "**Pattern 1：定長視窗**\n\n窗口大小固定 k，每次右進一個、左出一個，更新 sum/count/max。",
    "```cpp\nint maxSumFixedK(vector<int>& nums, int k) {\n  int window_sum = 0, answer = INT_MIN;\n  for (int i = 0; i < (int)nums.size(); ++i) {\n    window_sum += nums[i];\n    if (i >= k) {\n      window_sum -= nums[i - k];\n    }\n    if (i >= k - 1) {\n      answer = max(answer, window_sum);\n    }\n  }\n  return answer;\n}\n```",
    "**Pattern 2：不定長視窗**\n\n右端擴張直到不合法，左端收縮恢復合法。適用於條件能局部維護的連續子陣列/子字串。",
    "**Pattern 3：恰好 K 轉成 atMost(K) - atMost(K-1)**\n\n計數型問題常用。例題：恰好 K 個不同整數的子陣列。",
    "```cpp\nlong long atMostKDistinct(vector<int>& nums, int k) {\n  unordered_map<int, int> count;\n  long long answer = 0;\n  int left = 0;\n  for (int right = 0; right < (int)nums.size(); ++right) {\n    if (count[nums[right]]++ == 0) {\n      k--;\n    }\n    while (k < 0) {\n      if (--count[nums[left++]] == 0) {\n        k++;\n      }\n    }\n    answer += right - left + 1;\n  }\n  return answer;\n}\n```",
    "**Pattern 4：雙序列雙指標**\n\n兩個排序序列合併、求交集、最小差值。指標移動依當前較小元素決定。",
  ].join("\n\n"),

  string: [
    "**競程課程講義：字串演算法**",
    "**Pattern 1：KMP**\n\n固定 pattern 匹配與 border。核心是 prefix function。",
    "**Pattern 2：Z function**\n\n比較每個後綴與整串前綴。常用於前綴匹配、字串拼接判斷。",
    "**Pattern 3：Manacher**\n\n線性求每個中心的回文半徑。適用於回文子串計數、最長回文。",
    "```cpp\nvector<int> manacherOdd(const string& s) {\n  int n = s.size();\n  vector<int> d(n);\n  for (int i = 0, l = 0, r = -1; i < n; ++i) {\n    int k = (i > r) ? 1 : min(d[l + r - i], r - i + 1);\n    while (0 <= i - k && i + k < n && s[i - k] == s[i + k]) {\n      k++;\n    }\n    d[i] = k--;\n    if (i + k > r) {\n      l = i - k, r = i + k;\n    }\n  }\n  return d;\n}\n```",
    "**Pattern 4：Rolling hash**\n\n任意子串比較。注意碰撞，可雙模或 64-bit。",
    "**Pattern 5：Aho-Corasick**\n\n多 pattern 同時匹配。Trie + failure links，把多字典匹配降成線性掃描。",
    "**Pattern 6：Suffix array / automaton**\n\n進階字串結構。常用於後綴排序、不同子串數量、LCP 查詢。",
  ].join("\n\n"),

  trees: [
    "**競程課程講義：鏈結串列、樹與回溯**",
    "**Pattern 1：鏈結串列 dummy node**\n\n刪除、合併、反轉局部鏈表時用 dummy 簡化頭節點變化。",
    "```cpp\nListNode* reverseList(ListNode* head) {\n  ListNode* prev = nullptr;\n  while (head) {\n    ListNode* next = head->next;\n    head->next = prev;\n    prev = head;\n    head = next;\n  }\n  return prev;\n}\n```",
    "**Pattern 2：快慢指標**\n\n找中點、判環、找環入口。快指標一次兩步，慢指標一次一步。",
    "**Pattern 3：二元樹 DFS**\n\n前序適合自頂向下傳狀態；後序適合回傳子樹資訊，如高度、直徑、是否平衡。",
    "```cpp\nint diameter = 0;\nint depth(TreeNode* root) {\n  if (!root) {\n    return 0;\n  }\n  int l = depth(root->left), r = depth(root->right);\n  diameter = max(diameter, l + r);\n  return max(l, r) + 1;\n}\n```",
    "**Pattern 4：BFS 層序**\n\n最短層數、每層統計、鋸齒遍歷。",
    "**Pattern 5：LCA**\n\n二元樹遞迴：若左右各找到一個目標，當前節點是 LCA。多次查詢用 binary lifting。",
    "**Pattern 6：回溯**\n\n排列、組合、子集、棋盤搜索。模板是選擇、遞迴、撤銷；剪枝來自排序、剩餘容量、合法性檢查。",
  ].join("\n\n"),
};

const studyPlanDeepDiveMaterials: Record<string, string> = {
  google_interview: [
    "**教授講義補充：面試題的完整解題敘述**",
    "Google 類型題常同時考演算法選型與溝通品質。解題時不要只說「我用 BFS」或「我用 DP」，而要把題目拆成四件事：資料如何建模、狀態代表什麼、每一步如何保持不變式、複雜度是否符合限制。若能把這四件事說清楚，即使程式碼還沒寫完，面試官也能判斷你的方向是正確的。",
    "**觀念起點**\n\nGoogle interview 題常把熟悉演算法包成比較接近產品或系統的敘述：任務排程像依賴圖，API 設計像多索引資料結構，資料流像受限空間下的摘要維護，資源限制像狀態壓縮。讀題時先不要尋找模板名稱，而是先回答「目前局面由哪些資訊決定」以及「下一步操作會改變哪些資訊」。\n\n若題目要求設計 class 或 API，演算法只是其中一部分。你還要說清楚 canonical state 放在哪裡、查詢索引如何維護、更新時哪些舊資料要刪掉、tie-breaker 如何定義。這些說明能避免 heap stale entry、set comparator 不完整、map 與索引不同步等錯誤。",
    "**常見模式總表**：\n- 狀態圖最短路：狀態包含位置、資源、mask、時間；等權用 BFS，0/1 權用 deque，非負權用 Dijkstra。\n- 依賴圖：先建有向邊，再用拓撲排序檢查 cycle；若需要最早完成時間，在拓撲序上做 DP。\n- 資料結構同步：API 題通常有一個 canonical state，再維護 heap / set / map 作查詢索引。\n- 字串比較：固定 pattern 用 KMP / Z；大量字典詞用 Trie；任意子串比較用 hash。\n- 資源限制：把 memory、操作次數、狀態總數寫成公式，再決定是否需要壓縮狀態。",
    "**面試解題骨架**：\n1. 先重述完整問題，包含輸入、輸出、限制與是否多次查詢。\n2. 定義狀態或資料結構的語意，避免只說容器名稱。\n3. 說明不變式，例如 BFS queue 的距離順序、拓撲排序的入度語意、API 索引與 canonical state 的同步關係。\n4. 用一個小例子手算一輪，確認狀態轉移與答案更新位置。\n5. 寫 C++ 時先完成邊界與資料結構初始化，再補主流程。",
    "**例題解析：帶資源的最短路**\n\n**完整問題**：給定一個 `rows x cols` 的 0/1 網格，`0` 表示空格、`1` 表示障礙。你從左上角 `(0, 0)` 出發，要走到右下角 `(rows - 1, cols - 1)`。每一步可以往上下左右相鄰格移動一次，並且最多可以消除 `k` 個障礙。請回傳最少步數；若無法到達，回傳 `-1`。\n\n題目訊號是「從起點走到終點」加上「最多消耗 k 次資源」。若只把 `(row, col)` 當狀態會錯，因為同一格剩餘資源不同，未來可走的路也不同。正確狀態是 `(row, col, remaining)`。若每一步成本相同，使用 BFS；若移動成本不等，才改成 Dijkstra。\n\n推導流程：\n1. 初始狀態 `(0, 0, k)`，距離是 0。\n2. 從狀態轉移到四個鄰格，若鄰格是障礙就消耗 1。\n3. 對同一格，只保留看過的最大 remaining；若新狀態 remaining 更小，沒有必要入隊。\n4. 第一次取出終點時，距離就是最短步數。",
    "```cpp\nint shortestPathWithResource(vector<vector<int>>& grid, int k) {\n  int rows = grid.size(), cols = grid[0].size();\n  const int kDirs[5] = {1, 0, -1, 0, 1};\n  vector<vector<int>> best(rows, vector<int>(cols, -1));\n  queue<array<int, 4>> q;\n\n  q.push({0, 0, k, 0});\n  best[0][0] = k;\n  while (!q.empty()) {\n    auto [row, col, left, dist] = q.front();\n    q.pop();\n    if (row == rows - 1 && col == cols - 1) {\n      return dist;\n    }\n    for (int dir = 0; dir < 4; ++dir) {\n      int next_row = row + kDirs[dir];\n      int next_col = col + kDirs[dir + 1];\n      if (next_row < 0 || next_row >= rows || next_col < 0 || next_col >= cols) {\n        continue;\n      }\n      int next_left = left - grid[next_row][next_col];\n      if (next_left < 0 || next_left <= best[next_row][next_col]) {\n        continue;\n      }\n      best[next_row][next_col] = next_left;\n      q.push({next_row, next_col, next_left, dist + 1});\n    }\n  }\n  return -1;\n}\n```",
  ].join("\n\n"),

  rating_2100: [
    "**教授講義補充：Rating 2100 的組合式思考**",
    "這個區間的題目通常不是新演算法，而是把排序、二分、DP、圖論或資料結構接在一起。讀題時先找「哪個維度可以被固定」，再問固定後剩下的部分是否能用已知工具快速回答。例如排序固定時間順序，Fenwick 回答前綴數量；二分固定答案，貪心檢查可行性；枚舉一個端點，資料結構維護另一端候選。",
    "**觀念起點**\n\nRating 2100 題常要求讀者把已知基礎工具重新組合。看到 `n <= 2e5` 時，先假設需要 `O(n log n)` 或接近線性；看到 `n <= 20` 時，才考慮狀壓；看到多次查詢時，先問能否離線排序；看到最小化最大值或最大化最小值時，先檢查可行性是否單調。\n\n這個難度最需要練的是「固定一個維度」。固定右端點後，左側能不能用 hash/Fenwick/set 維護？固定答案後，能不能用貪心 check？固定一個節點後，其他距離能不能由預處理表查到？題目的突破口通常來自這種改寫。",
    "**常見模式**：\n- 排序 + 前綴最佳值：把二維條件變成一維掃描，維護 `max(value - cost)` 或 `min(prefix)`。\n- 二分答案 + greedy check：答案有單調性，但實際構造困難；先用 predicate 判斷可行。\n- 離線排序 + Fenwick / segment tree：查詢與資料都有門檻，按門檻排序後逐步加入資料。\n- 狀態 BFS / 分層圖：同一位置的未來取決於 mask、剩餘資源或已使用次數。\n- DP + 優化：先保留樸素轉移，再用前綴最佳、二分前驅、單調隊列或資料結構找最佳前驅。\n- 枚舉小集合：若限制有 `n <= 20`、bit 數小、質因數少，優先考慮狀壓或枚舉子集。",
    "**解題檢查順序**：\n1. 用限制決定目標複雜度。\n2. 找能固定的維度，例如右端點、答案值、排序後的前綴、圖上的匯合點。\n3. 寫出固定後需要維護的狀態或資料結構。\n4. 用不變式檢查每次更新是否不漏、不重、不使用未來資料。\n5. 最後處理相等元素、負數、空集合、不連通與溢位。",
    "**例題解析：排序後維護最佳候選**\n\n**完整問題**：給定 `n` 個點，每個點有座標 `(x, y)`。請選兩個不同點 `i, j`，滿足 `x_i < x_j`，並最大化 `y_i + y_j + x_i - x_j`。請回傳最大值；若不存在合法 pair，回傳題目指定的空值或最小值。\n\n模型：排序後掃描右端點 j，左端點 i 一定已經被看過，因此只要維護 `max(y_i + x_i)`。\n\n步驟：\n1. 依 `x` 排序，讓掃描順序保證左端點合法。\n2. 令 `best = max(y_i + x_i)`。\n3. 對當前點 `(x_j, y_j)`，候選答案是 `best + y_j - x_j`。\n4. 更新 `best`，進入下一個點。",
    "```cpp\nlong long maxPairValue(vector<pair<int, int>>& points) {\n  sort(points.begin(), points.end());\n  long long best = LLONG_MIN;\n  long long answer = LLONG_MIN;\n  for (auto [x, y] : points) {\n    if (best != LLONG_MIN) {\n      answer = max(answer, best + y - x);\n    }\n    best = max(best, 1LL * y + x);\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  binary_search: [
    "**教授講義補充：二分的本質是不變式**",
    "二分不是只把 `mid` 寫出來，而是維護一個清楚的不變式。對 `lower_bound` 類問題，常用半開區間 `[left, right)`，語意是答案一定在這段區間內。對二分答案，必須先證明 predicate 單調：若 `can(x)` 為 true，則所有更大的 x 也 true，或所有更小的 x 也 true。",
    "**常見模式**：\n- 找第一個合法位置：`false false true true`，回傳第一個 true。\n- 找最後一個合法位置：可轉成找第一個不合法，再減一。\n- 二分答案：答案不是陣列位置，而是一個容量、速度、距離、時間或最大值。\n- 實數二分：固定迭代次數，避免浮點 epsilon 導致死循環。",
    "**例題解析：最小化最大分段和**\n\n**完整問題**：給定一個正整數陣列 `nums` 與整數 `k`。請把陣列依原本順序切成最多 `k` 個非空連續段，使所有段落元素和的最大值最小。請回傳這個最小可能值。\n\n若限制 `limit` 越大，越容易切成功，所以 `canSplit(limit)` 單調。檢查方式是從左到右貪心累加，超過 limit 就開新段；這種貪心正確，因為在固定 limit 下，當前段能多放就多放，不會增加段數。",
    "```cpp\nlong long splitArrayMinLargestSum(vector<int>& nums, int k) {\n  auto canSplit = [&nums, k](long long limit) {\n    int groups = 1;\n    long long sum = 0;\n    for (int x : nums) {\n      if (x > limit) {\n        return false;\n      }\n      if (sum + x > limit) {\n        groups++;\n        sum = 0;\n      }\n      sum += x;\n    }\n    return groups <= k;\n  };\n\n  long long left = *max_element(nums.begin(), nums.end());\n  long long right = accumulate(nums.begin(), nums.end(), 0LL);\n  while (left < right) {\n    long long mid = left + (right - left) / 2;\n    if (canSplit(mid)) {\n      right = mid;\n    } else {\n      left = mid + 1;\n    }\n  }\n  return left;\n}\n```",
  ].join("\n\n"),

  bitwise_operations: [
    "**教授講義補充：把整數當成集合與向量**",
    "位元題的第一步是決定每一個 bit 的語意：它可能代表集合元素是否存在，也可能代表一個二進位位值對總答案的貢獻。若題目中的狀態數小、元素只有選或不選，mask 是集合；若題目問 XOR / OR / AND 的總和、最大值或可行性，就逐 bit 分析。",
    "**常見模式**：\n- 子集枚舉：`sub = (sub - 1) & mask`，枚舉 mask 的所有非空子集。\n- 逐 bit 貢獻：把 pair 或 subarray 的總貢獻拆成每個 bit 獨立計算。\n- 高位貪心：從最高 bit 往下試填答案，利用 set 或 trie 檢查是否可行。\n- 狀壓 DP：`dp[mask]` 表示完成集合 mask 的最優值。",
    "**例題解析：所有 pair 的 XOR 總和**\n\n**完整問題**：給定一個整數陣列 `nums`，請計算所有 pair `(i, j)`、`i < j` 的 `nums[i] XOR nums[j]` 總和，並回傳該總和。\n\nXOR 的某一 bit 為 1，當且僅當兩個數在該 bit 不同。若第 b 位有 `ones` 個 1，`zeros` 個 0，則這一 bit 對所有 pair 的貢獻是 `ones * zeros * 2^b`。所有 bit 相加就是答案。",
    "```cpp\nlong long pairXorSum(vector<int>& nums) {\n  long long answer = 0;\n  for (int bit = 0; bit < 31; ++bit) {\n    long long ones = 0;\n    for (int x : nums) {\n      ones += (x >> bit) & 1;\n    }\n    long long zeros = nums.size() - ones;\n    answer += ones * zeros * (1LL << bit);\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  data_structure: [
    "**教授講義補充：資料結構是查詢與更新的不變式**",
    "選資料結構時先寫出每次操作需要什麼：取最大、查前綴和、找前驅後繼、刪除過期元素、比較前綴、或維護區間資訊。資料結構的核心不是容器名稱，而是它維護了哪個不變式，以及更新後如何恢復這個不變式。",
    "**常見模式**：\n- Stack：維護尚未找到答案的元素。\n- Heap：維護候選最大/最小；若會失效，搭配 lazy deletion。\n- Ordered set：維護動態有序集合，查前驅、後繼、區間端點。\n- Fenwick：單點更新與前綴查詢。\n- Segment tree：區間合併資訊、區間修改、複雜查詢。\n- Trie：把字串或二進位表示按前綴共享節點。",
    "**例題解析：動態前綴和**\n\n**完整問題**：請設計一個資料結構，初始化時給定長度為 `n` 的陣列，支援兩種操作：`add(index, delta)` 將位置 `index` 加上 `delta`，以及 `rangeSum(left, right)` 回傳閉區間 `[left, right]` 的總和。操作次數很多，必須比每次線性掃描更快。\n\n若用普通前綴和，每次更新要改很多位置。Fenwick tree 用 `index += index & -index` 更新所有負責包含該點的桶；查詢用 `index -= index & -index` 累加前綴桶。",
    "```cpp\nclass Fenwick {\n  vector<long long> bit_;\n\n public:\n  Fenwick(int n) : bit_(n + 1) {}\n\n  void add(int index, long long delta) {\n    for (++index; index < (int)bit_.size(); index += index & -index) {\n      bit_[index] += delta;\n    }\n  }\n\n  long long prefixSum(int index) {\n    long long sum = 0;\n    for (++index; index > 0; index -= index & -index) {\n      sum += bit_[index];\n    }\n    return sum;\n  }\n\n  long long rangeSum(int left, int right) { return prefixSum(right) - (left == 0 ? 0 : prefixSum(left - 1)); }\n};\n```",
  ].join("\n\n"),

  dynamic_programming: [
    "**教授講義補充：DP 是把暴力搜尋合併同類狀態**",
    "DP 的起點不是陣列，而是暴力搜尋。當不同路徑走到同一個局面，且未來只取決於這個局面，就可以把局面定義成狀態。設計 DP 時要回答：狀態代表什麼、轉移從哪裡來、初始值是什麼、計算順序如何保證依賴已完成。",
    "**常見模式**：\n- 線性 DP：狀態按 index 推進，例如 take / skip。\n- 背包 DP：容量是狀態維度，0/1 倒序、完全背包正序。\n- 區間 DP：先枚舉長度，再枚舉左右端點與切分點。\n- 狀壓 DP：集合是狀態，常見 `dp[mask][last]`。\n- 樹形 DP：後序 DFS 合併子樹；需要換根時再做第二次 DFS。\n- 優化 DP：先寫樸素式，再觀察是否能用前綴最佳、單調隊列或資料結構消掉一層枚舉。",
    "**例題解析：0/1 背包**\n\n**完整問題**：給定 `n` 個物品，第 `i` 個物品重量為 `weights[i]`、價值為 `values[i]`，以及背包容量 `capacity`。每個物品最多選一次，請在總重量不超過 `capacity` 的前提下最大化總價值。\n\n`dp[cap]` 表示目前處理過的物品中，容量不超過 cap 的最大價值。每個物品只能選一次，所以容量要倒序枚舉，避免同一物品在同一輪被重複使用。",
    "```cpp\nint zeroOneKnapsack(vector<int>& weights, vector<int>& values, int capacity) {\n  vector<int> dp(capacity + 1);\n  for (int i = 0; i < (int)weights.size(); ++i) {\n    for (int cap = capacity; cap >= weights[i]; --cap) {\n      dp[cap] = max(dp[cap], dp[cap - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}\n```",
  ].join("\n\n"),

  graph: [
    "**教授講義補充：先判斷圖的性質，再選演算法**",
    "圖論題最重要的是建模。先回答：節點是什麼、邊代表什麼、邊有沒有方向、邊權是什麼、是否可能成環、答案問連通性還是路徑順序。這些性質決定工具：無向連通用 DFS/BFS 或 DSU；有向依賴用拓撲排序；非負權最短路用 Dijkstra；互相可達群組用 SCC；移除邊是否斷開用橋。",
    "**常見模式**：\n- DFS/BFS：靜態連通塊、可達性、二分圖染色。\n- DSU：動態加邊、合併集合、判斷是否成環。\n- Topological sort：有向依賴、先修課、DAG DP。\n- Shortest path：等權 BFS、0/1 BFS、Dijkstra、Bellman-Ford。\n- Low-link：橋、割點、SCC。\n- MST / flow：連通成本與容量分配。",
    "**例題解析：依賴圖完成時間**\n\n**完整問題**：給定 `n` 個任務、每個任務需要的時間 `time[i]`，以及若干依賴關係 `[u, v]`，表示任務 `u` 完成後任務 `v` 才能開始。多個可做任務可以平行進行。請回傳完成所有任務所需的最短總時間；若依賴成環，回傳 `-1`。\n\n若關係 `u -> v` 表示 u 完成後才能做 v，這是 DAG 上的最長路。拓撲排序保證處理 v 時，所有前置課程都已經更新過 `finish[v]`。若最後處理節點數少於 n，代表有 cycle，無法完成。",
    "```cpp\nint minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {\n  vector<vector<int>> graph(n);\n  vector<int> indegree(n), finish(n);\n  for (auto& edge : relations) {\n    int from = edge[0] - 1, to = edge[1] - 1;\n    graph[from].push_back(to);\n    indegree[to]++;\n  }\n\n  queue<int> q;\n  for (int node = 0; node < n; ++node) {\n    finish[node] = time[node];\n    if (indegree[node] == 0) {\n      q.push(node);\n    }\n  }\n\n  int seen = 0;\n  while (!q.empty()) {\n    int node = q.front();\n    q.pop();\n    seen++;\n    for (int next_node : graph[node]) {\n      finish[next_node] = max(finish[next_node], finish[node] + time[next_node]);\n      if (--indegree[next_node] == 0) {\n        q.push(next_node);\n      }\n    }\n  }\n  return seen == n ? *max_element(finish.begin(), finish.end()) : -1;\n}\n```",
  ].join("\n\n"),

  greedy: [
    "**教授講義補充：貪心必須能證明局部選擇安全**",
    "貪心題不是看到排序就結束，而是要說明為什麼局部選擇不會破壞最優解。常用證明有交換論證、留有最多剩餘空間、反悔貪心與必要條件構造。若找不到證明，通常要改用 DP 或搜尋。",
    "**常見模式**：\n- 最早結束：區間選擇、活動安排。\n- 最小代價優先：Huffman、合併成本、局部最小堆。\n- 反悔貪心：先選，超限後移除目前最差選擇。\n- 字典序貪心：從左到右決定答案，確保剩餘資源仍可完成。\n- 構造貪心：先找必要條件，再按規則產生一個合法解。",
    "**例題解析：最多不重疊區間**\n\n**完整問題**：給定多個區間 `[start, end]`，請選出最多數量的區間，使任意兩個被選區間不重疊。若一個區間的 `start` 大於等於上一個被選區間的 `end`，視為可以接在後面。請回傳最多可選幾個區間。\n\n排序依右端點由小到大。選擇右端點最早的區間是安全的，因為任何最優解的第一個區間若不是它，都可以替換成這個更早結束的區間，後面可選空間不會變小。",
    "```cpp\nint maxNonOverlapping(vector<vector<int>>& intervals) {\n  sort(intervals.begin(), intervals.end(), [](const auto& lhs, const auto& rhs) { return lhs[1] < rhs[1]; });\n  int answer = 0;\n  int last_end = INT_MIN;\n  for (const auto& interval : intervals) {\n    if (interval[0] >= last_end) {\n      answer++;\n      last_end = interval[1];\n    }\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  grid: [
    "**教授講義補充：網格題就是隱式圖**",
    "網格不需要真的把所有邊建出來。每個格子是節點，方向陣列定義鄰邊。讀題時要判斷：移動成本是否相同、是否有多個起點、狀態是否包含鑰匙或剩餘資源、是否需要從邊界反向搜尋。",
    "**常見模式**：\n- Flood fill：島嶼、連通塊、區域染色。\n- 多源 BFS：最近距離、腐爛擴散、邊界距離。\n- 狀態 BFS：位置加 mask、剩餘消除次數、方向、時間。\n- 0/1 BFS：順方向成本 0、改方向成本 1。\n- Dijkstra：格子移動成本不同且非負。",
    "**例題解析：多源 BFS 最近距離**\n\n**完整問題**：給定一個二維網格，部分格子是 source，其餘格子是一般格。每次可以往上下左右相鄰格移動一步。請對每個格子計算它到最近 source 的最短距離，並回傳距離矩陣。\n\n若要求每個格子到最近 source 的距離，不要從每個格子各跑一次 BFS。把所有 source 一起入隊，距離設為 0。BFS 的層序擴張保證第一次到達某格就是最近 source 的距離。",
    "```cpp\nvector<vector<int>> distanceToNearestSource(vector<vector<int>>& grid) {\n  int rows = grid.size(), cols = grid[0].size();\n  const int kDirs[5] = {1, 0, -1, 0, 1};\n  vector<vector<int>> dist(rows, vector<int>(cols, -1));\n  queue<pair<int, int>> q;\n\n  for (int row = 0; row < rows; ++row) {\n    for (int col = 0; col < cols; ++col) {\n      if (grid[row][col] == 0) {\n        dist[row][col] = 0;\n        q.push({row, col});\n      }\n    }\n  }\n\n  while (!q.empty()) {\n    auto [row, col] = q.front();\n    q.pop();\n    for (int dir = 0; dir < 4; ++dir) {\n      int next_row = row + kDirs[dir];\n      int next_col = col + kDirs[dir + 1];\n      if (next_row < 0 || next_row >= rows || next_col < 0 || next_col >= cols) {\n        continue;\n      }\n      if (dist[next_row][next_col] != -1) {\n        continue;\n      }\n      dist[next_row][next_col] = dist[row][col] + 1;\n      q.push({next_row, next_col});\n    }\n  }\n  return dist;\n}\n```",
  ].join("\n\n"),

  math: [
    "**教授講義補充：數學題先找不變量與週期**",
    "數學題常不是套公式，而是找到題目背後的不變量：整除關係、模數週期、奇偶性、質因數、排列組合限制、或幾何方向。先把小例子列出來，再找哪些量在操作後不變，哪些量可以分解成獨立貢獻。",
    "**常見模式**：\n- GCD / LCM：週期、整除、同步事件。\n- 快速冪：大指數與模運算。\n- 質因數分解：判斷可達性、約數個數、共同因子。\n- 組合計數：排列、組合、容斥、隔板法。\n- 模運算：同餘類、前綴餘數。\n- 幾何：叉積判方向，點積判投影。",
    "**例題解析：前綴和同餘**\n\n**完整問題**：給定整數陣列 `nums` 與正整數 `k`，請計算有多少個非空連續子陣列的元素和可以被 `k` 整除。\n\n若要找子陣列和可被 k 整除，令 `prefix[i]` 是前 i 個數的總和。子陣列 `(l, r]` 的和能被 k 整除，等價於 `prefix[r] % k == prefix[l] % k`。因此只要統計每個餘數出現次數。",
    "```cpp\nlong long countSubarraysDivisibleByK(vector<int>& nums, int k) {\n  unordered_map<int, long long> count;\n  count[0] = 1;\n  long long answer = 0;\n  int prefix = 0;\n  for (int x : nums) {\n    prefix = (prefix + x) % k;\n    if (prefix < 0) {\n      prefix += k;\n    }\n    answer += count[prefix];\n    count[prefix]++;\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  monotonic_stack: [
    "**教授講義補充：單調棧用來找第一個破壞單調性的元素**",
    "單調棧維護一批尚未找到答案的元素。當新元素進來破壞單調性，被彈出的元素就能確定答案。這類題的核心是決定棧中存 index 還是 value，以及相等元素該保留左邊還是右邊，這會影響貢獻計數是否重複。",
    "**常見模式**：\n- 下一個更大 / 更小元素。\n- 每個元素作為區間最小值或最大值的貢獻。\n- 直方圖最大矩形。\n- 字典序最小 subsequence。\n- 移除 k 位數使結果最小。",
    "**例題解析：所有子陣列最小值總和**\n\n**完整問題**：給定整數陣列 `nums`，請列舉所有非空連續子陣列，取每個子陣列的最小值後加總，並回傳總和。\n\n對每個元素 `nums[i]`，找它作為最小值能覆蓋多少子陣列。左邊找前一個嚴格小於它的位置，右邊找下一個小於等於它的位置，用不對稱比較避免相等元素重複計算。貢獻是 `nums[i] * left_count * right_count`。",
    "```cpp\nlong long sumSubarrayMinimums(vector<int>& nums) {\n  int n = nums.size();\n  vector<int> left(n), right(n);\n  vector<int> stack;\n\n  for (int i = 0; i < n; ++i) {\n    while (!stack.empty() && nums[stack.back()] > nums[i]) {\n      stack.pop_back();\n    }\n    left[i] = stack.empty() ? i + 1 : i - stack.back();\n    stack.push_back(i);\n  }\n\n  stack.clear();\n  for (int i = n - 1; i >= 0; --i) {\n    while (!stack.empty() && nums[stack.back()] >= nums[i]) {\n      stack.pop_back();\n    }\n    right[i] = stack.empty() ? n - i : stack.back() - i;\n    stack.push_back(i);\n  }\n\n  long long answer = 0;\n  for (int i = 0; i < n; ++i) {\n    answer += 1LL * nums[i] * left[i] * right[i];\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  sliding_window: [
    "**教授講義補充：滑動視窗處理可局部維護的連續區間**",
    "滑動視窗只適用於連續子陣列或子字串，且合法性要能在右端加入、左端移除後快速更新。如果條件需要全域排序或任意重排，通常不是視窗題。視窗題要先決定是固定長度、最長合法、最短合法，還是計數問題。",
    "**常見模式**：\n- 固定長度：每次進一個出一個。\n- 最長合法：右端擴張，非法時左端收縮。\n- 最短合法：右端擴張到合法，然後盡量收縮。\n- 恰好 K：轉成 `atMost(K) - atMost(K - 1)`。\n- 雙指標合併：兩個排序序列同步移動。",
    "**例題解析：恰好 K 個不同整數**\n\n**完整問題**：給定整數陣列 `nums` 與整數 `k`，請計算有多少個非空連續子陣列剛好包含 `k` 種不同的整數。\n\n直接維護「恰好 K」較難，因為左端移動時答案不容易累加。轉成「最多 K 個不同」就容易：對每個 right，合法 left 到 right 的所有子陣列都可計入。最後用 `atMost(k) - atMost(k - 1)`。",
    "```cpp\nlong long atMostKDistinct(vector<int>& nums, int k) {\n  unordered_map<int, int> count;\n  long long answer = 0;\n  int left = 0;\n  for (int right = 0; right < (int)nums.size(); ++right) {\n    if (count[nums[right]]++ == 0) {\n      k--;\n    }\n    while (k < 0) {\n      if (--count[nums[left++]] == 0) {\n        k++;\n      }\n    }\n    answer += right - left + 1;\n  }\n  return answer;\n}\n\nlong long exactlyKDistinct(vector<int>& nums, int k) { return atMostKDistinct(nums, k) - atMostKDistinct(nums, k - 1); }\n```",
  ].join("\n\n"),

  string: [
    "**教授講義補充：字串演算法是在加速比較**",
    "字串題的核心問題通常是比較：某段是否等於另一段、某個 pattern 出現在哪些位置、前綴和後綴有多長相同、或多個字典詞是否能匹配 target。先明確比較單位，再選工具。",
    "**常見模式**：\n- KMP：固定 pattern、border、週期。\n- Z function：每個後綴與全字串前綴的 LCP。\n- Rolling hash：任意子串相等查詢。\n- Trie：多字典詞前綴匹配。\n- Aho-Corasick：多 pattern 同時在線性掃描中匹配。\n- Manacher：回文半徑。",
    "**例題解析：KMP 找所有匹配位置**\n\n**完整問題**：給定文字 `text` 與模式字串 `pattern`，請回傳 `pattern` 在 `text` 中所有出現位置的起始 index。匹配必須完全相同，且需要比對大量文字時避免每個位置都重新比對整個 pattern。\n\nprefix function `pi[i]` 表示 `pattern[0..i]` 的最長相等真前後綴長度。匹配失敗時，pattern 不需要回到 0，而是跳到 `pi[j - 1]`，保留仍然可能匹配的前綴。",
    "```cpp\nvector<int> prefixFunction(const string& s) {\n  vector<int> pi(s.size());\n  for (int i = 1; i < (int)s.size(); ++i) {\n    int j = pi[i - 1];\n    while (j > 0 && s[i] != s[j]) {\n      j = pi[j - 1];\n    }\n    if (s[i] == s[j]) {\n      j++;\n    }\n    pi[i] = j;\n  }\n  return pi;\n}\n\nvector<int> findMatches(const string& text, const string& pattern) {\n  vector<int> pi = prefixFunction(pattern);\n  vector<int> answer;\n  int matched = 0;\n  for (int i = 0; i < (int)text.size(); ++i) {\n    while (matched > 0 && text[i] != pattern[matched]) {\n      matched = pi[matched - 1];\n    }\n    if (text[i] == pattern[matched]) {\n      matched++;\n    }\n    if (matched == (int)pattern.size()) {\n      answer.push_back(i - (int)pattern.size() + 1);\n      matched = pi[matched - 1];\n    }\n  }\n  return answer;\n}\n```",
  ].join("\n\n"),

  trees: [
    "**教授講義補充：樹題用遞迴語意拆解**",
    "樹沒有環，因此每條邊都把問題分成父側與子樹側。寫 DFS 前先定義函式回傳什麼：高度、子樹大小、最佳路徑、是否合法、或某種狀態集合。若答案與根的選擇有關，先固定根做一次後序，再用換根 DP 把父側資訊傳給孩子。",
    "**常見模式**：\n- Linked list dummy：處理頭節點可能改變的情況。\n- 快慢指標：中點、環、環入口。\n- 二元樹後序：高度、直徑、平衡性。\n- 路徑問題：向下路徑用前序傳狀態，任意路徑常用後序回傳最佳單邊值。\n- LCA：單次遞迴，多次查詢用 binary lifting。\n- 回溯：選擇、遞迴、撤銷，並用剪枝降低搜尋量。",
    "**例題解析：二元樹直徑**\n\n**完整問題**：給定一棵二元樹的根節點 `root`，請回傳樹的直徑。直徑定義為任意兩個節點之間路徑上的邊數最大值，路徑不一定要經過根節點。\n\n直徑可能經過某個節點，也可能完全在子樹內。DFS 回傳「從當前節點往下走的最大深度」，同時用左右深度更新全域答案 `left_depth + right_depth`。這是典型的後序 DFS：先取得孩子資訊，再合併。",
    "```cpp\nint diameterOfBinaryTree(TreeNode* root) {\n  int answer = 0;\n  function<int(TreeNode*)> depth = [&answer, &depth](TreeNode* node) {\n    if (!node) {\n      return 0;\n    }\n    int left_depth = depth(node->left);\n    int right_depth = depth(node->right);\n    answer = max(answer, left_depth + right_depth);\n    return max(left_depth, right_depth) + 1;\n  };\n  depth(root);\n  return answer;\n}\n```",
  ].join("\n\n"),
};

const beginnerLecturePreface = [
  "**講義閱讀方式**",
  "每個 pattern 都照同一個順序理解：先看題目訊號，再定義狀態或資料結構，接著寫出維護的不變式，最後再整理 C++ 模板。講義中的程式碼是骨架與典型寫法，閱讀時要把每個變數對應回狀態語意，而不是只記住語法。",
  "**課堂解題流程**：\n1. 讀限制：`n`、值域、邊數、是否多次查詢。\n2. 找訊號：連續區間、排序、集合狀態、圖可達、最小最大、歷史版本。\n3. 選 pattern：把題目映射到已知模型。\n4. 寫不變式：例如 BFS 第一次出隊最短、單調棧內元素保持遞增、Fenwick 維護前綴和。\n5. 驗證複雜度：先算狀態數，再算每個狀態的轉移成本。",
].join("\n\n");

const beginnerPracticeGuide = [
  "**課後練習方式**",
  "練習後請回到講義的四個面向檢查：模型是否選對、狀態是否足夠、轉移或資料結構是否維護不變式、複雜度是否符合限制。",
  "**複盤問題**：\n- 題目中的哪個訊號指向這個 pattern？\n- 若改變限制，例如加入多次查詢、刪除操作或權重，原本方法是否仍適用？\n- 程式中哪個變數代表核心狀態？\n- 邊界條件包含空集合、單一元素、重複值、負數或不連通情況嗎？",
].join("\n\n");

export function getStudyPlanCourseMaterial(plan: string) {
  const material =
    studyPlanDeepDiveMaterials[plan] ?? studyPlanCourseMaterials[plan];
  if (!material) {
    return undefined;
  }

  return [beginnerLecturePreface, material, beginnerPracticeGuide].join(
    "\n\n---\n\n",
  );
}
