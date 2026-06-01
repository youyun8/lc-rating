// 各章節 profile 的教學補強：小範例手動模擬（dry run）、同一模板的套用要點、
// 經典 bug 的額外提醒，以及均攤/空間複雜度說明。以 profile.key 為鍵，於
// buildGenericSectionContent 合併渲染，不更動 lectureTopicProfiles.data.ts。

export interface LectureProfileExtra {
  walkthrough?: string;
  templateNote?: string;
  extraPitfalls?: string[];
  complexityNote?: string;
}

const MID_OVERFLOW =
  "二分中點寫成 `mid = left + (right - left) / 2`，避免 `left + right` 溢位。";
const COMPARATOR_STRICT =
  "排序比較器需為嚴格弱序（用 `<` 而非 `<=`），否則 `sort` 行為未定義。";
const DFS_STACK =
  "遞迴 DFS 在節點數很大時可能爆 stack，必要時改用顯式堆疊或迭代。";
const LONG_LONG =
  "加總、乘法或距離可能超過 `int`，需用 `long long` 並把無限大設成不會溢位的值。";

export const lectureProfileExtras: Record<string, LectureProfileExtra> = {
  "binary-lower-bound": {
    walkthrough:
      "以 `nums = [5, 7, 7, 8, 8, 10]`、`target = 8` 求左端點：left = 0、right = 6；mid = 3（值 8）滿足 `>= 8` → right = 3；mid = 1（值 7）不滿足 → left = 2；mid = 2（值 7）不滿足 → left = 3；此時 left == right == 3，即第一個 8 的位置。對 `target + 1 = 9` 再做一次得 5，故 8 的範圍是 [3, 4]。",
    templateNote:
      "延伸題多半只改 predicate：找「最後一個 <=target」用 `upperBound-1`；旋轉排序陣列找最小值，把 predicate 換成「mid 元素 <= 最右元素」。",
    extraPitfalls: [MID_OVERFLOW],
  },
  "kth-smallest": {
    walkthrough:
      "以 `nums1 = [1, 7]`、`nums2 = [2, 4]`、k = 2：先把每列首個 pair 入堆 →{(3, i = 0, j = 0),(9, i = 1, j = 0)}。彈出最小 (3) → 記錄 (1,2)，並推入同列下一個 (1 + 4 = 5)。再彈出 (5) → 記錄 (1,4)。得前 2 小的 pair。",
    templateNote:
      "若只要第 k 小的「數值」（如有序矩陣），改用「二分答案 + 計算 <=x 的個數」；要列出前 k 個「組合」才用 heap 多路歸併。",
  },
  "binary-answer": {
    walkthrough:
      "以 `weights = [1, 2, 3, 4, 5]`、days = 3：答案值域為 [5（最大件）, 15（總和）]。`canShip(mid)` 貪心裝箱、超過就換天。mid = 6 可在 3 天內運完（[1,2,3]/[4]/[5]）；mid = 5 需 4 天不可行。二分收斂到最小可行容量 6。",
    templateNote:
      "換題時只需重寫 `can(x)` 與值域：最小速度吃香蕉把 `can` 換成總時數 <=h；最大化最小距離則把單調方向反過來（值越大越難）。",
    extraPitfalls: [MID_OVERFLOW],
  },
  "prefix-sum": {
    walkthrough:
      "以 `nums = [1, -1, 1]`、k = 1 求和為 1 的子陣列數：count = {0:1}，prefix 依序 1、0、1。prefix = 1 時查 count[0] = 1（答案 +1），記 count[1] = 1；prefix = 0 時查 count[-1] = 0，記 count[0] = 2；prefix = 1 時查 count[0] = 2（答案 +2）。共 3 個。",
    templateNote:
      "把「和等於 k」換成「和為 k 的倍數」時，改存 `prefix % k` 的出現次數；二維子矩陣和則改用二維前綴和容斥。",
    extraPitfalls: [LONG_LONG],
  },
  "enumerate-maintain": {
    walkthrough:
      "以 `nums = [3, 1, 4]` 求 `max(best_left + nums[right] - right)`：right = 0 時左側為空，僅更新 best_left = 3；right = 1：答案 = 3 + 1 - 1 = 3，更新 best_left = max(3,1 + 1) = 3；right = 2：答案 = max(3,3 + 4 - 2) = 5。掃一遍得 5。",
    templateNote:
      "把「維護左側最大值」換成計數表、雜湊或有序集合，即可處理「左側有多少符合條件」「左側前驅後繼」等變體。",
  },
  "rating-2100-data-structure": {
    walkthrough:
      "以離線「查詢前面有多少數 <= x」為例：把元素與查詢一起按值排序，掃描時先把所有 <= 當前門檻的元素 add 進樹狀數組，再回答查詢的前綴計數。門檻單調，故每個元素只加入一次。",
    templateNote:
      "核心是把限制排序成單調；換題時改變「事件鍵」（值、時間、座標）與「查詢量」（計數、最值、存在性）即可。",
  },
  "rating-2100-dp": {
    walkthrough:
      "以 `dp[i] = max(dp[j] + v)` 且 j 落在窗口內為例：用單調隊列維護候選 dp[j]。掃到 i 時先移除過期 j，隊首即最佳前驅，O(1) 取得後更新 dp[i]，再把 dp[i] 推入隊尾並維持單調遞減。",
    templateNote:
      "先寫可證明正確的樸素轉移，再依 j 的合法範圍（前綴、窗口、排序前驅）選資料結構；狀態語意不變，只換取最佳 j 的方式。",
  },
  "grid-state-bfs": {
    walkthrough:
      "以 2×2 全 0 網格、k = 1（可消除 1 個障礙）為例：狀態 (r,c,剩餘)。起點 (0,0,1) 距離 0 入隊並逐層擴張；同格以更多剩餘到達才入隊。首次到達 (1,1,*) 的距離 2 即最短步數。",
    templateNote:
      "狀態多一維時（鑰匙集合、方向、時間），visited 與 dist 都要含該維；邊權不等就把 BFS 換成 0-1 BFS 或 Dijkstra。",
  },
  "difference-array": {
    walkthrough:
      "以長度 5、操作「[1,3] 加 2」「[2,4] 加 1」為例：diff 在 1 加 2、4 減 2；在 2 加 1、（5 越界略）。對 diff 做前綴和得 [0,2,3,3,1]，即每格最終值。",
    templateNote:
      "二維「子矩形加值」改用二維差分（四個角落 ±）；樹上「路徑加值」改用點差分或邊差分配合 LCA。",
  },
  fenwick: {
    walkthrough:
      "以 `add(2, 5)` 為例（內部 1-indexed，index = 3）：更新 index 3 → 4 → 8…沿 `index += lowbit(index)` 把途經的桶加 5。`prefixSum(4)`（index = 5）則沿 `index -= lowbit(index)`：5 → 4 → 0，累加途經桶得前綴和。",
    templateNote:
      "求逆序對：離散化後由右往左，先查「比它小的已出現個數」再 add；需要區間更新區間查詢時改用兩個 BIT。",
    extraPitfalls: [LONG_LONG],
    complexityNote: "更新與查詢沿 lowbit 跳躍各 `O(log n)` 步。",
  },
  "segment-tree": {
    walkthrough:
      "以 `[1, 2, 3, 4]`、先「區間 [1,2] 加 5」再「查 [0,2] 的和」為例：更新時被完整覆蓋的節點打 lazy 並更新和；查詢 [0,2] 進入子節點前先 push down，合併得 1 + (2 + 5) + (3 + 5) = 16。",
    templateNote:
      "把聚合從「和」換成「最大值」「最小值」「計數」時，pushUp 與 lazy 套用方式要一致；區間賦值用覆蓋型 lazy，區間加用累加型 lazy。",
  },
  dsu: {
    walkthrough:
      "以邊 (0,1)、(1,2)、(0,2) 為例：unite(0,1) 合併；unite(1,2) 合併，三點同集；unite(0,2) 時 find(0) == find(2)，回傳 false → 這條邊會形成環。",
    templateNote:
      "判斷「加邊是否成環」看 unite 回傳；需要維護到代表元的關係（距離、種類）時改用帶權並查集。",
    complexityNote:
      "路徑壓縮加按大小合併後，單次操作均攤近 `O(α(n))`（反阿克曼函數，實務上視為常數）。",
  },
  "monotonic-stack": {
    walkthrough:
      "以 `nums = [2, 1, 3]` 求每個元素的下一個更大值：i = 0 推入棧 [0]；i = 1（值 1 < 2）直接推入 [0,1]；i = 2（值 3）彈出 1（答案 = idx2）、再彈出 0（答案 = idx2），推入 [2]。得 [3,3,-1]（值）。",
    templateNote:
      "求「前一個更小」改成從左掃並維持遞增，或反向掃描；子陣列最小值之和則用貢獻法（左右第一個更小的距離相乘）。",
    complexityNote: "每個元素至多入棧、出棧各一次，總時間均攤 `O(n)`。",
  },
  "two-pointers": {
    walkthrough:
      "以排序後 `nums = [-1, 0, 1, 2]` 求三數之和為 0：固定 -1，left 指向 0、right 指向 2，和 -1 + 0 + 2 = 1 > 0 → right 左移到值 1，和 -1 + 0 + 1 = 0 命中 [-1,0,1]。",
    templateNote:
      "目標從 0 換成任意 target 只改判斷；盛最多水改成「移動較矮的一側」，接雨水則維護左右兩側最高。",
    extraPitfalls: [COMPARATOR_STRICT],
    complexityNote:
      "兩指標各自單向移動，掃描 `O(n)`（含排序為 `O(n log n)`）。",
  },
  "sliding-window": {
    walkthrough:
      "以「最多 1 個 0 的最長子陣列」、`nums = [1, 0, 1, 1]`：right 擴張並累計 0 的個數，當 0 的個數 > 1 時 left 右移並還原。整段 [0..3] 僅含一個 0，合法且長度 4，即答案。",
    templateNote:
      "「恰好 K」=「至多 K」-「至多 K-1」；條件為「至少」時改用「總子陣列數 - 不合法數」反算。",
    complexityNote: "left 與 right 各只前進 `O(n)` 步，總時間 `O(n)`。",
  },
  "interval-dp": {
    walkthrough:
      '以 `s="bbab"` 求最長回文子序列：dp[i][i] = 1；dp[1][2]（"ba"） = 1；dp[1][3]（"bab"）因 s[1] == s[3] → dp[2][2] + 2 = 3；dp[0][3] 因 s[0] == s[3] → dp[1][2] + 2 = 3。答案 3（如 "bab"）。',
    templateNote:
      "戳氣球類把轉移換成「最後戳破 k」：`dp[i][j]=max(dp[i][k-1]+戳k+dp[k+1][j])`，並在兩端補虛擬元素。",
  },
  "tree-dp": {
    walkthrough:
      "以鏈狀樹 1-2-3（值皆 1）做打家劫舍 III：葉 3 回傳 {skip 0, take 1}；節點 2：take = 1 + skip(3) = 1、skip = max(0,1) = 1；根 1：take = 1 + skip(2) = 2、skip = max(1,1) = 1 → 取 max = 2（選首尾兩點）。",
    templateNote:
      "需要每個節點都得到「以它為根」的答案時，加第二次 DFS 做換根，把父側資訊下推。",
    extraPitfalls: [DFS_STACK],
    complexityNote: "每節點處理一次，時間 `O(n)`、遞迴空間 `O(樹高)`。",
  },
  "digit-dp": {
    walkthrough:
      "以統計 [0, 25] 中不含數字 4 的個數：逐位 DFS，tight 沿最高位收緊（十位上限受 2 限制）。0~25 中含 4 的有 4、14、24 三個，故答案 26 - 3 = 23。",
    templateNote:
      "區間 [lo, hi] 用 `f(hi) - f(lo-1)`；加狀態（前一位、數位和）時，記憶化只快取 tight=false 的子問題。",
  },
  "state-compression-dp": {
    walkthrough:
      "以 3 點對稱 TSP 為例：dp[{0}][0] = 0；逐步把「加入新點 j」疊上，如 dp[{0,1}][1] = dist[0][1]。最後 mask = 111 時，對每個結尾 i 取 `dp[full][i] + dist[i][0]` 的最小值即環長。",
    templateNote:
      "狀態多一維（目前位置）是 TSP 的關鍵；任務指派類則 `dp[mask]` 直接以 popcount(mask) 表示已指派人數。",
  },
  knapsack: {
    walkthrough:
      "以重量 [1,3]、價值 [15,20]、容量 4 做 0-1 背包：處理物品 0（w1,v15）後 dp 變 [0,15,15,15,15]；處理物品 1（w3,v20）時 cap = 4：dp[4] = max(15, dp[1] + 20) = 35。答案 35（兩件都拿，總重 4）。",
    templateNote:
      "完全背包把容量改成正序遍歷以允許重複；多重背包用二進位拆分把件數轉成若干 0-1 物品。",
  },
  "grid-dp": {
    walkthrough:
      "以 2×2 全 1 網格求左上到右下的路徑數：第一行、第一列都為 1；dp[1][1] = dp[0][1] + dp[1][0] = 1 + 1 = 2。答案 2。",
    templateNote:
      "最小路徑和把「相加」換成「取較小再加當前格」；有障礙格則把該格 dp 設 0 並跳過轉移。",
    complexityNote: "狀態 `O(rows * cols)`，可用滾動陣列把空間降到 `O(cols)`。",
  },
  "dp-linear": {
    walkthrough:
      "以打家劫舍 `nums = [2, 7, 9]`：x = 2 → take = 2、skip = 0；x = 7 → take = skip + 7 = 7、skip = max(0,2) = 2；x = 9 → take = 2 + 9 = 11、skip = max(2,7) = 7 → 取 max = 11。",
    templateNote:
      "LIS 改用「二分維護最小結尾」達 `O(n log n)`；含狀態（持有/未持有）時擴成狀態機 DP。",
    complexityNote: "一次掃描 `O(n)`，滾動變數空間 `O(1)`。",
  },
  "graph-bfs-dfs": {
    walkthrough:
      "以邊 (0,1)、(2,3) 算連通塊數：從 0 DFS 標記 {0,1}；1 已訪略過；從 2 DFS 標記 {2,3}。共啟動兩次新 DFS → 2 個連通塊。",
    templateNote:
      "把「計連通塊」換成「最短步數」就改用 BFS；狀態非單純座標時（隱式圖）把「一個局面」當節點。",
    extraPitfalls: [DFS_STACK],
    complexityNote: "每點每邊各處理一次，時間 `O(V+E)`、空間 `O(V)`。",
  },
  "topological-dp": {
    walkthrough:
      "以邊 0→1、0→2、1→2 求拓撲序：入度 [0,1,2]。佇列先放入度 0 的 0；彈 0 後 1、2 入度減為 0、1；彈 1 後 2 入度減為 0；彈 2。序為 0,1,2，處理數 = 3 = n，故無環。",
    templateNote:
      "DAG 上求最長路或最早完成時間，就在彈出節點時用它鬆弛後繼；要字典序最小的拓撲序把佇列換成 priority queue。",
  },
  dijkstra: {
    walkthrough:
      "以 0→1(2)、0→2(5)、1→2(1)：dist = [0,∞,∞]，推 (0,0)。彈 0，鬆弛得 dist[1] = 2、dist[2] = 5。彈 (2,1)，鬆弛 dist[2] = min(5,2 + 1) = 3。彈 (3,2)。最短距離 [0,2,3]。",
    templateNote:
      "有負權改用 Bellman-Ford；狀態含「剩餘次數/已用折扣」時把節點擴成 (node, 狀態) 再跑 Dijkstra。",
    extraPitfalls: [LONG_LONG],
    complexityNote: "二元堆實作 `O((V+E) log V)`、空間 `O(V)`。",
  },
  mst: {
    walkthrough:
      "以邊 (0,1,1)、(1,2,2)、(0,2,3) 做 Kruskal：按權排序 1,2,3。加 (0,1,1) 連通；加 (1,2,2) 連通；(0,2,3) 兩端已同集 → 跳過。MST 權重 1 + 2 = 3。",
    templateNote:
      "改成 Prim 時從任一點不斷長出最小邊；「最小化最大邊」的瓶頸生成樹答案即為 MST 的最大邊。",
    complexityNote: "Kruskal 排序主導，時間 `O(E log E)`、空間 `O(V)`。",
  },
  "low-link": {
    walkthrough:
      "以環 0-1-2-0 找橋：DFS 給 dfn 0,1,2；回邊 2→0 使各點 low 都能回到 0。每條樹邊都滿足 `low[child] <= dfn[parent]`，故無橋（環上刪任一邊仍連通）。",
    templateNote:
      "割點判定把條件換成 `low[child] >= dfn[u]`（根節點特判有兩個以上子樹）；有向圖找互相可達群組則改算 SCC。",
    extraPitfalls: [DFS_STACK],
  },
  "network-flow": {
    walkthrough:
      "以 source→A（容量 1）、A→sink（容量 1）為例：找到增廣路 source-A-sink，送 1 單位，並在反向邊留下可撤銷容量。再也找不到增廣路 → 最大流 = 1 = 最小割。",
    templateNote:
      "二分圖最大匹配把每條可配對邊設容量 1、接上超級源匯即可；最小割題直接求最大流。",
    complexityNote:
      "Dinic 一般圖 `O(V^2 * E)`，單位容量圖更快；空間 `O(V+E)`。",
  },
  "greedy-interval": {
    walkthrough:
      "以區間 [1,3]、[2,4]、[3,5] 求最多不重疊：按右端排序後選 [1,3]；下一個左端 >= 3 的是 [3,5]，選之；[2,4] 與 [1,3] 重疊 → 跳過。共 2 個。",
    templateNote:
      "「最少移除使不重疊」= 總數 - 最多不重疊；會議室類（最多同時重疊數）改用掃描線或最小堆維護結束時間。",
    extraPitfalls: [COMPARATOR_STRICT],
    complexityNote: "排序主導，時間 `O(n log n)`、空間 `O(1)`。",
  },
  "math-number-theory": {
    walkthrough:
      "以 `gcd(12, 18)`：18 % 12 = 6，12 % 6 = 0 → gcd = 6；`lcm = 12 / 6 * 18 = 36`（先除再乘避免溢位）。快速冪 `pow(2, 10)` 則把指數拆成二進位，逐步平方累乘。",
    templateNote:
      "模意義下的除法改乘逆元（質數模用費馬小定理 `a^(p-2)`）；大組合數取模用預處理階乘 + 逆元，模為大質數時用 Lucas。",
    extraPitfalls: [LONG_LONG],
  },
  kmp: {
    walkthrough:
      "以 pattern = \"aba\" 建 pi：pi[0] = 0；i = 1（'b'≠'a'）→ pi[1] = 0；i = 2（'a' == 'a'）→ pi[2] = 1。在 text 比對失配時依 pi 回退指標，而非從頭重比。",
    templateNote:
      "求字串最小週期用 `n - pi[n-1]`；多模式同時匹配把 KMP 升級為 AC 自動機。",
    complexityNote:
      "matched 指標只前進與依 border 回退，建表與比對均攤 `O(n+m)`。",
  },
  "tree-linked-binary": {
    walkthrough:
      "以根帶左右兩葉的二元樹求直徑：葉回傳深度 0；根的左右深度各 1，經過根的路徑長 = 1 + 1 = 2，即直徑 2。",
    templateNote:
      "鏈表反轉用三指標（prev/cur/next）逐一翻轉；路徑和題分清「可向上延伸的單邊鏈」與「在當前子樹閉合的完整路徑」。",
    extraPitfalls: [DFS_STACK],
    complexityNote:
      "一次遍歷 `O(n)`；鏈表額外空間 `O(1)`，樹遞迴空間 `O(樹高)`。",
  },
  backtracking: {
    walkthrough:
      "以 `nums = [1, 2]` 求所有子集：path = [] 記錄 []；選 1 記錄 [1]；再選 2 記錄 [1,2]；回溯去掉 2、再回溯去掉 1；選 2 記錄 [2]。得 []、[1]、[1,2]、[2]。",
    templateNote:
      "排列型改用 used 標記而非起始下標；含重複元素先排序，同層跳過 `nums[i]==nums[i-1]` 去重。",
    extraPitfalls: [DFS_STACK],
  },
  "bitwise-contribution": {
    walkthrough:
      "以 `nums = [1, 2]` 求所有 pair 的 XOR 和：第 0 位上 1 有、2 無 → ones = 1, zeros = 1，貢獻 1 * 1 * 1 = 1；第 1 位上 2 有、1 無 → 1 * 1 * 2 = 2。總和 3（即 1^2）。",
    templateNote:
      "把每位的 0/1 計數套到 OR/AND 要換公式（OR：至少一個有；AND：全部都有）；求最大 XOR 用高位試填或線性基。",
    complexityNote: "逐位掃描，時間 `O(n * B)`（B 為位數）、空間 `O(1)`。",
  },
  "linear-basis": {
    walkthrough:
      "以 `[3, 5]` 建線性基（3 = 011、5 = 101）：插入 3，最高位 1 → basis[1] = 3；插入 5，最高位 2 無基 → basis[2] = 5。求最大 XOR：ans = 0，試 basis[2] → 5，再試 basis[1] → 5^3 = 6 > 5 採用，得 6。",
    templateNote:
      "判某值能否表示：用基逐位消去後若歸 0 即可表示；求第 k 小 XOR 需先把基化簡為各位獨立。",
    complexityNote: "每個數插入 `O(B)`，共 `O(n * B)`、空間 `O(B)`。",
  },
  "greedy-general": {
    walkthrough:
      "以反悔貪心選最多工作（各有截止與耗時）為例：依截止排序逐一加入，並把耗時推入大根堆；一旦累積耗時超過當前截止，就彈出耗時最大的工作（反悔）。堆中數量即答案。",
    templateNote:
      "能用交換論證或反悔證明才套貪心；舉得出反例就改用 DP 或搜尋枚舉決策。",
    extraPitfalls: [COMPARATOR_STRICT],
    complexityNote: "排序加堆操作，時間 `O(n log n)`、空間 `O(n)`。",
  },
  manacher: {
    walkthrough:
      '以 "aba" 為例：插入分隔成 "^#a#b#a#$"，對每個中心求回文半徑；中心落在 \'b\' 處可向兩側擴展到 #a#…#a#，換算回原字串即最長回文 "aba"（長 3）。',
    templateNote:
      "插入 `#` 統一奇偶長度；要統計本質不同回文的數量改用回文自動機（PAM）。",
    complexityNote: "利用鏡射繼承半徑，總時間 `O(n)`、空間 `O(n)`。",
  },
  "string-tools": {
    walkthrough:
      '以雜湊比較 "abcabc" 的 [0,3) 與 [3,6)：預處理前綴雜湊與冪次後，`hash(0, 3)` 與 `hash(3, 6)` 各 O(1) 取得；相等代表兩段可能相同，再比對原字串確認。',
    templateNote:
      "固定 pattern 找位置用 KMP/Z；任意子串相等比較用雜湊；大量字典詞共用前綴用 Trie——依「昂貴比較的種類」選工具。",
    complexityNote:
      "雜湊預處理 `O(n)`、單次比較 `O(1)`（嚴格確認需再比 `O(len)`）。",
  },
  "combinatorics-geometry": {
    walkthrough:
      "以「5 個相同球放入 3 個不同盒、可空」為例：用隔板法 C(5 + 3 - 1, 3 - 1) = C(7,2) = 21。若不可空則先每盒放 1，再分配剩 2 個 → C(2 + 3 - 1, 2) = C(4,2) = 6。",
    templateNote:
      "正面難算時改算補集；對稱去重（旋轉或翻轉視為相同）用 Burnside，計算各操作不動點的平均。",
    complexityNote: "預處理階乘與逆元後，每次組合數查詢 `O(1)`。",
  },
};
