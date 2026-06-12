import type { TutorialData } from "@/types";

export const interviewSprint = {
  id: 1,
  title: "面試衝刺計畫（2.5 週優先題單）",
  src: "",
  last_update: "2026-06-12T00:00:00.000Z",
  summary:
    "這是為 **45 分鐘 coding phone screen（C++）** 量身定做的衝刺計畫：從本站 15 章、4166 題中，依「面試題型權重 × 真實出題頻率 × 學習槓桿」挑出 **60 題**，並排成 18 天的日程，預留 2 次模擬面試與 1 天純複習。\n\n**優先級評分公式**：`priority = 3I + 2F + L`，三軸各 1–5 分。\n\n| 軸 | 權重 | 意義 |\n| --- | --- | --- |\n| **I — 面試題型權重** | ×3 | 是否屬於核心面試題型（搜尋、DP、圖/網格、區間、資料結構設計、滑動視窗、解析、模擬）；冷門數論或 contest 專屬技巧分數低 |\n| **F — 真實出題頻率** | ×2 | 此「題型」（非原題）近兩年在大廠 phone screen 的出現頻率 |\n| **L — 學習槓桿** | ×1 | 解掉它能否解鎖一整族題（模板題）vs. 一次性技巧 |\n\n**使用方式**：每天先看該章節在本站對應的觀念講解，再限時做題（平均 25 分鐘/題：讀題 + 寫 C++ + 看題解），錯題記入錯題本，D-2 全部重寫一遍。",
  children: [
    {
      id: 2,
      title: "1. 18 天衝刺排程",
      summary:
        "每週日均量：**平日 2 小時（3–4 題）、週末 4 小時（5 題）**。請把 5 題的日子（D-15、D-13、D-4）對齊到週末；若面試日不同，整體平移即可。**D-3 與 D-1 是混合題型模擬，D-2 只複習不做新題。**\n\n| Day | Date offset | Chapter(s) | # problems | Focus / template to internalize | Mock interview? |\n| --- | --- | --- | --- | --- | --- |\n| 1 | D-18 | 滑動視窗 | 4 | 不定長視窗模板：越長越合法求最短、越短越合法求最長 | – |\n| 2 | D-17 | 滑動視窗 ＋ 二分搜尋 | 4 | 恰好型＝兩次越短型相減；`check(x)` 單調性證明 | – |\n| 3 | D-16 | 二分搜尋 | 4 | 旋轉陣列邊界判斷、最小化最大值（答案二分） | – |\n| 4 | D-15 | 單調堆疊/單調佇列 | 5 | next-greater 模板、左右邊界貢獻法、deque 維護最值 | – |\n| 5 | D-14 | 資料結構 I | 4 | 字首和＋雜湊表計數、堆疊鄰項消除 | – |\n| 6 | D-13 | 資料結構 II | 5 | 堆模板（合併 K 路、會議室）、對頂堆、DSU、Trie | – |\n| 7 | D-12 | 網格圖 I | 3 | flood fill、多源 BFS（全部源點先入隊） | – |\n| 8 | D-11 | 網格圖 II | 3 | 帶狀態 BFS（visited 升維）、0-1 BFS（deque 前後門） | – |\n| 9 | D-10 | 圖論 I | 3 | 拓撲排序（入度法）＋ 環檢測、連通分量 | – |\n| 10 | D-9 | 圖論 II | 4 | 隱式圖建模 BFS、Dijkstra 堆模板（含 K 步限制變形） | – |\n| 11 | D-8 | 動態規劃 I | 4 | 線性 DP（打家劫舍/LIS）、0-1 與完全背包 | – |\n| 12 | D-7 | 動態規劃 II | 4 | LCS/編輯距離雙序列模板、劃分型 DP、網格 DP | – |\n| 13 | D-6 | 動態規劃 III ＋ 樹 I | 4 | 狀態機 DP、帶權區間排程（排序＋二分前驅）；LCA、直徑 | – |\n| 14 | D-5 | 樹 II | 4 | 自底向上 DFS 回傳值設計、BST 中序性質 | – |\n| 15 | D-4 | 貪心與區間 | 5 | 排序＋一次掃描、區間覆蓋的「最遠可達」貪心 | – |\n| 16 | D-3 | 混合模擬 | （2 題模擬） | 45 分鐘限時 mock ×1：建議抽 1129 顏色交替的最短路徑 ＋ 2406 將區間分為最少組數；之後檢討 | ✅ Mock 1 |\n| 17 | D-2 | 全部複習 | 0 | 不做新題：重寫錯題本所有模板、對每章口述「何時用、複雜度、邊界」 | – |\n| 18 | D-1 | 混合模擬 | （2 題模擬） | 45 分鐘限時 mock ×1：建議抽 1631 最小體力消耗路徑 ＋ 1024 影片拼接；只輕量複習，早睡 | ✅ Mock 2 |\n\n合計新題 60 題（D-18 至 D-4），模擬 4 題從附錄已收錄、但未進題單的題目抽出，不佔 60 題額度。",
    },
    {
      id: 3,
      title: "2. 高優題單",
      summary:
        "9 個主題章節共 **60 題**，每章內依 `Score = 3I + 2F + L` 由高到低排序。Rating 欄取自站內資料（無分數者以 `–` 表示，多為早期經典題）。做題順序建議「章內由上往下」：模板題先做，變形題後做。",
      children: [
        {
          id: 31,
          title: "2.1 滑動視窗（6 題）",
          summary:
            "phone screen 出現率最高的題型，先把「越長越合法 / 越短越合法 / 恰好型」三個模板焊死。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 3 | [無重複字元的最長子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | sliding_window → 越短越合法/求最長 | – | 5 | 5 | 5 | 30 | 滑動視窗第一模板題，screen 最常見開場題 |\n| 2 | 209 | [長度最小的子陣列](https://leetcode.cn/problems/minimum-size-subarray-sum/) | sliding_window → 越長越合法/求最短 | – | 5 | 5 | 5 | 30 | 「求最短」方向的對偶模板，與 LC 3 成對記 |\n| 3 | 76 | [最小覆蓋子串](https://leetcode.cn/problems/minimum-window-substring/) | sliding_window → 越長越合法/求最短 | – | 5 | 5 | 4 | 29 | 帶計數表的視窗收縮，大廠經典 hard |\n| 4 | 1004 | [最大連續 1 的個數 III](https://leetcode.cn/problems/max-consecutive-ones-iii/) | sliding_window → 越短越合法/求最長 | – | 5 | 4 | 4 | 27 | 「至多 K 次操作」型視窗，變形極多 |\n| 5 | 713 | [乘積小於 K 的子陣列](https://leetcode.cn/problems/subarray-product-less-than-k/) | sliding_window → 求子陣列個數>越短越合法 | – | 4 | 4 | 5 | 25 | 計數型視窗的入門：每右端點貢獻 `r-l+1` |\n| 6 | 992 | [K 個不同整數的子陣列](https://leetcode.cn/problems/subarrays-with-k-different-integers/) | sliding_window → 恰好型滑動視窗 | – | 4 | 3 | 5 | 23 | 恰好 K ＝ 至多 K − 至多 K-1，一招解一族 |",
        },
        {
          id: 32,
          title: "2.2 二分搜尋（6 題）",
          summary:
            "兩條主線：旋轉陣列上的邊界二分、與「答案二分」（最小化最大值）。面試時務必口述 `check(x)` 的單調性。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 875 | [愛吃香蕉的珂珂](https://leetcode.cn/problems/koko-eating-bananas/) | binary_search → 求最小 | 1766 | 5 | 5 | 5 | 30 | 答案二分的標準模板：速率單調可行 |\n| 2 | 1011 | [在 D 天內送達包裹的能力](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days/) | binary_search → 求最小 | 1725 | 5 | 5 | 4 | 29 | 容量二分，與 875 同型但 check 寫法不同 |\n| 3 | 33 | [搜尋旋轉排序陣列](https://leetcode.cn/problems/search-in-rotated-sorted-array/) | binary_search → 其他 | – | 5 | 5 | 4 | 29 | 旋轉陣列判「哪半邊有序」，screen 常青題 |\n| 4 | 153 | [尋找旋轉排序陣列中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) | binary_search → 其他 | – | 5 | 4 | 4 | 27 | 33 的前置：先會找最小值再做搜尋 |\n| 5 | 410 | [分割陣列的最大值](https://leetcode.cn/problems/split-array-largest-sum/) | binary_search → 最小化最大值 | – | 4 | 4 | 5 | 25 | 最小化最大值代表題，亦可對照劃分型 DP 解法 |\n| 6 | 162 | [尋找峰值](https://leetcode.cn/problems/find-peak-element/) | binary_search → 其他 | – | 4 | 4 | 4 | 24 | 在「無序但有梯度」陣列上二分，考觀念非模板 |",
        },
        {
          id: 33,
          title: "2.3 單調堆疊與單調佇列（5 題）",
          summary:
            "你自評 1800+ 的弱點之一。核心只有兩件事：next-greater 模板、以及「每個元素當最值的貢獻區間」。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 739 | [每日溫度](https://leetcode.cn/problems/daily-temperatures/) | monotonic_stack → 基礎 | – | 5 | 5 | 5 | 30 | next-greater 第一模板，所有單調堆疊題的根 |\n| 2 | 239 | [滑動視窗最大值](https://leetcode.cn/problems/sliding-window-maximum/) | data_structure → 佇列>單調佇列 | – | 5 | 5 | 5 | 30 | 單調佇列唯一必會題：deque 隊首過期、隊尾彈劣 |\n| 3 | 84 | [柱狀圖中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/) | monotonic_stack → 矩形 | – | 5 | 4 | 5 | 28 | 左右第一個更小元素夾出矩形，85 題直接複用 |\n| 4 | 42 | [接雨水](https://leetcode.cn/problems/trapping-rain-water/) | monotonic_stack → 矩形 | – | 5 | 5 | 3 | 28 | 出場率極高；同時掌握雙指標與堆疊兩種解法 |\n| 5 | 907 | [子陣列的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/) | monotonic_stack → 貢獻法 | – | 4 | 3 | 5 | 23 | 貢獻法模板：算每個元素管轄的子陣列數 |",
        },
        {
          id: 34,
          title: "2.4 資料結構（9 題）",
          summary:
            "覆蓋四個高頻族：字首和＋雜湊表、堆疊消除、堆（優先佇列）、並查集；外加一題 Trie 與一題設計題型的中位數流。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 560 | [和為 K 的子陣列](https://leetcode.cn/problems/subarray-sum-equals-k/) | data_structure → 字首和>字首和與雜湊表 | – | 5 | 5 | 5 | 30 | 字首和＋雜湊計數的根模板，衍生題極多 |\n| 2 | 23 | [合併 K 個升序連結串列](https://leetcode.cn/problems/merge-k-sorted-lists/) | data_structure → 堆>進階 | – | 5 | 5 | 4 | 29 | K 路歸併＝堆的招牌用法，也練連結串列操作 |\n| 3 | 253 | [會議室 II](https://leetcode.cn/problems/meeting-rooms-ii/) | data_structure → 堆>基礎 | – | 5 | 5 | 4 | 29 | 排序＋最小堆追蹤最早結束，screen 高頻 |\n| 4 | 155 | [最小堆疊](https://leetcode.cn/problems/min-stack/) | data_structure → 堆疊>進階 | – | 5 | 4 | 3 | 26 | 「設計一個類」題型入門，輔助堆疊思想 |\n| 5 | 721 | [賬戶合併](https://leetcode.cn/problems/accounts-merge/) | data_structure → 並查集>基礎 | – | 4 | 4 | 5 | 25 | DSU 模板＋實務感很強的建模，一題打通並查集 |\n| 6 | 295 | [資料流的中位數](https://leetcode.cn/problems/find-median-from-data-stream/) | data_structure → 堆>對頂堆 | – | 4 | 4 | 4 | 24 | 對頂堆設計題，資料流題型代表 |\n| 7 | 735 | [小行星碰撞](https://leetcode.cn/problems/asteroid-collision/) | data_structure → 堆疊>鄰項消除 | – | 4 | 4 | 4 | 24 | 堆疊模擬消除，面試愛考的「會碰撞的模擬」 |\n| 8 | 974 | [和可被 K 整除的子陣列](https://leetcode.cn/problems/subarray-sums-divisible-by-k/) | data_structure → 字首和>字首和與雜湊表 | 1676 | 4 | 4 | 4 | 24 | 560 的同餘變形，注意 C++ 負數取模 |\n| 9 | 208 | [實現 Trie（字首樹）](https://leetcode.cn/problems/implement-trie-prefix-tree/) | data_structure → 字典樹>基礎 | – | 4 | 3 | 4 | 22 | 唯一保留的 Trie 題：會手寫節點結構即可 |",
        },
        {
          id: 35,
          title: "2.5 網格圖（6 題）",
          summary:
            "三層遞進：flood fill → 多源/最短路 BFS → 帶狀態 BFS 與 0-1 BFS。後兩題正對你 1800+ 的弱區。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 200 | [島嶼數量](https://leetcode.cn/problems/number-of-islands/) | grid → 網格圖 DFS | – | 5 | 5 | 5 | 30 | flood fill 根模板，幾乎是 screen 必備 |\n| 2 | 994 | [腐爛的橘子](https://leetcode.cn/problems/rotting-oranges/) | grid → 網格圖 BFS | – | 5 | 5 | 5 | 30 | 多源 BFS 模板：所有源點先入隊、逐層擴散 |\n| 3 | 417 | [太平洋大西洋水流問題](https://leetcode.cn/problems/pacific-atlantic-water-flow/) | grid → 網格圖 DFS | – | 5 | 4 | 4 | 27 | 反向思維：從邊界倒灌兩次 DFS 取交集 |\n| 4 | 1091 | [二進位制矩陣中的最短路徑](https://leetcode.cn/problems/shortest-path-in-binary-matrix/) | grid → 網格圖 BFS | – | 5 | 4 | 4 | 27 | 八方向最短路 BFS，邊權為 1 的標準形 |\n| 5 | 1293 | [網格中的最短路徑](https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination/) | grid → 網格圖 BFS | 1967 | 4 | 3 | 5 | 23 | visited 升維（座標＋剩餘消除數），帶狀態 BFS 代表 |\n| 6 | 1368 | [使網格圖至少有一條有效路徑的最小代價](https://leetcode.cn/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/) | grid → 0-1 BFS | 2069 | 4 | 3 | 5 | 23 | 0-1 BFS 模板：0 邊 push_front、1 邊 push_back |",
        },
        {
          id: 36,
          title: "2.6 圖論演算法（7 題）",
          summary:
            "三個必備模板：拓撲排序（含環檢測）、隱式圖建模 BFS、Dijkstra。SCC、網路流、基環樹全數捨棄。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 207 | [課程表](https://leetcode.cn/problems/course-schedule/) | graph → 拓撲排序 | – | 5 | 5 | 5 | 30 | 拓撲＋環檢測模板，依賴關係題的根 |\n| 2 | 210 | [課程表 II](https://leetcode.cn/problems/course-schedule-ii/) | graph → 拓撲排序 | – | 5 | 5 | 4 | 29 | 207 的輸出方案版，兩題一起 30 分鐘內完成 |\n| 3 | 743 | [網路延遲時間](https://leetcode.cn/problems/network-delay-time/) | graph → 單源最短路：Dijkstra | – | 5 | 4 | 5 | 28 | 堆版 Dijkstra 標準模板，背到能盲寫 |\n| 4 | 547 | [省份數量](https://leetcode.cn/problems/number-of-provinces/) | graph → 深度優先搜尋（DFS） | – | 5 | 4 | 4 | 27 | 鄰接矩陣連通分量，DFS/DSU 雙解都要會 |\n| 5 | 127 | [單詞接龍](https://leetcode.cn/problems/word-ladder/) | graph → 圖論建模 + BFS 最短路 | – | 4 | 4 | 4 | 24 | 把字串當節點的隱式圖建模，screen 經典 |\n| 6 | 752 | [開啟轉盤鎖](https://leetcode.cn/problems/open-the-lock/) | graph → 圖論建模 + BFS 最短路 | – | 4 | 4 | 4 | 24 | 狀態空間 BFS＋死鎖剪枝，與 127 同型互補 |\n| 7 | 787 | [K 站中轉內最便宜的航班](https://leetcode.cn/problems/cheapest-flights-within-k-stops/) | graph → 單源最短路：Dijkstra | – | 4 | 3 | 4 | 22 | 帶步數限制的最短路：練「狀態＝節點×步數」 |",
        },
        {
          id: 37,
          title: "2.7 動態規劃（10 題）",
          summary:
            "佔比最大的一章。線性 DP、背包、雙序列、劃分型、狀態機五族各取代表；數位 DP、狀壓 DP、各種優化 DP 全捨。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 198 | [打家劫舍](https://leetcode.cn/problems/house-robber/) | dynamic_programming → 入門 DP>打家劫舍 | – | 5 | 5 | 5 | 30 | 「選或不選」狀態定義的根，先把遞迴→遞推走一遍 |\n| 2 | 322 | [零錢兌換](https://leetcode.cn/problems/coin-change/) | dynamic_programming → 背包>完全背包 | – | 5 | 5 | 5 | 30 | 完全背包模板，screen DP 出題熱區 |\n| 3 | 300 | [最長遞增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/) | dynamic_programming → 經典線性 DP>LIS 基礎 | – | 5 | 5 | 5 | 30 | O(n²) DP 與 O(n log n) 貪心+二分都要會講 |\n| 4 | 139 | [單詞拆分](https://leetcode.cn/problems/word-break/) | dynamic_programming → 劃分型 DP>判定能否劃分 | – | 5 | 5 | 4 | 29 | 劃分型 DP 入門：「最後一段從哪切」思考法 |\n| 5 | 1143 | [最長公共子序列](https://leetcode.cn/problems/longest-common-subsequence/) | dynamic_programming → 經典線性 DP>LCS 基礎 | – | 5 | 4 | 5 | 28 | 雙序列 DP 的根模板 |\n| 6 | 416 | [分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/) | dynamic_programming → 背包>0-1 背包 | – | 5 | 4 | 5 | 28 | 0-1 背包＋bool 可行性，倒序枚舉容量是考點 |\n| 7 | 64 | [最小路徑和](https://leetcode.cn/problems/minimum-path-sum/) | dynamic_programming → 網格圖 DP>基礎 | – | 5 | 4 | 4 | 27 | 網格 DP 標準形，與網格 BFS 區分使用時機 |\n| 8 | 72 | [編輯距離](https://leetcode.cn/problems/edit-distance/) | dynamic_programming → 經典線性 DP>LCS 基礎 | – | 5 | 4 | 4 | 27 | LCS 框架上的三操作轉移，大廠經典 |\n| 9 | 309 | [買賣股票的最佳時機含冷凍期](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/) | dynamic_programming → 狀態機 DP>買賣股票 | – | 4 | 4 | 5 | 25 | 狀態機 DP 代表：畫出持有/冷凍/空倉三態轉移圖 |\n| 10 | 1235 | [規劃兼職工作](https://leetcode.cn/problems/maximum-profit-in-job-scheduling/) | technical_interview → 排程決策與動態規劃 | 2023 | 4 | 4 | 5 | 25 | 帶權區間排程：排序＋二分前驅，工程感最強的 DP |",
        },
        {
          id: 38,
          title: "2.8 樹和二元樹（6 題）",
          summary:
            "重點是「自底向上 DFS 的回傳值設計」：直徑/路徑和一族、LCA 一族、BST 中序一族。倍增 LCA、樹分解不碰。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 236 | [二叉樹的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/) | trees → 二叉樹>最近公共祖先 | – | 5 | 5 | 5 | 30 | LCA 遞迴模板，screen 樹題第一熱門 |\n| 2 | 543 | [二叉樹的直徑](https://leetcode.cn/problems/diameter-of-binary-tree/) | trees → 二叉樹>二叉樹的直徑 | – | 5 | 5 | 5 | 30 | 「回傳鏈長、過程中更新答案」的根模板 |\n| 3 | 124 | [二叉樹中的最大路徑和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/) | trees → 二叉樹>二叉樹的直徑 | – | 5 | 4 | 5 | 28 | 543 的帶權版＋負數剪枝，hard 樹題代表 |\n| 4 | 98 | [驗證二叉搜索樹](https://leetcode.cn/problems/validate-binary-search-tree/) | trees → 二叉樹>二叉搜索樹 | – | 5 | 4 | 4 | 27 | 上下界傳遞或中序遞增，兩種寫法都要會 |\n| 5 | 199 | [二叉樹的右檢視](https://leetcode.cn/problems/binary-tree-right-side-view/) | trees → 二叉樹>自頂向下 DFS | – | 4 | 4 | 4 | 24 | 層序 BFS 與「深度優先先右後左」雙解 |\n| 6 | 230 | [二叉搜索樹中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/) | trees → 二叉樹>二叉搜索樹 | – | 4 | 4 | 4 | 24 | 中序遍歷提前終止，BST 性質的標準應用 |",
        },
        {
          id: 39,
          title: "2.9 貪心與區間（5 題）",
          summary:
            "只取可模板化的區間貪心：排序＋掃描、按右端點選、最遠可達跳躍。交換論證與構造題全捨。\n\n| # | LC ID | Title | Sub-section in lecture | Rating | I | F | L | Score | Why it matters |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 1 | 56 | [合併區間](https://leetcode.cn/problems/merge-intervals/) | greedy → 合併區間 | – | 5 | 5 | 5 | 30 | 排序後一次掃描，區間題第一模板 |\n| 2 | 55 | [跳躍遊戲](https://leetcode.cn/problems/jump-game/) | greedy → 合併區間 | – | 5 | 5 | 4 | 29 | 「最遠可達」貪心，與 45 成對 |\n| 3 | 435 | [無重疊區間](https://leetcode.cn/problems/non-overlapping-intervals/) | greedy → 不相交區間 | – | 5 | 4 | 5 | 28 | 按右端點排序選最多不相交區間的經典證明 |\n| 4 | 763 | [劃分字母區間](https://leetcode.cn/problems/partition-labels/) | greedy → 合併區間 | – | 4 | 4 | 4 | 24 | 記每個字元最遠位置再掃描，合併區間的變形 |\n| 5 | 45 | [跳躍遊戲 II](https://leetcode.cn/problems/jump-game-ii/) | greedy → 區間覆蓋 | – | 4 | 4 | 4 | 24 | 區間覆蓋式分層貪心，55 的求步數版 |",
        },
      ],
    },
    {
      id: 9,
      title: "3. 已捨棄的章節",
      summary:
        "以下章節/小節在 18 天 × 60 題的預算下整段捨棄，理由各一句：\n\n- **rating_2100（整章）**：四個 Phase 與各主題章節大量重複，衝刺期直接做主題章節效率更高。\n- **string → KMP/Z 函式/Manacher/AC 自動機/後綴陣列與自動機**：字串自動機族在 phone screen 出現率趨近於零。\n- **math（整章：數論/組合/博弈 SG/幾何/多項式/FWT）**：contest 專屬知識，45 分鐘 screen 不考。\n- **bitwise_operations → 線性基/試填法/LogTrick/恆等式**：純競賽位元技巧，學習槓桿低。\n- **data_structure → 樹狀陣列/線段樹/莫隊/根號分解/可持久化/Splay/離線演算法**：實作成本遠超 45 分鐘上限，性價比最差的一塊。\n- **dynamic_programming → 數位 DP/狀壓 DP/輪廓線/SOS/斜率優化/WQS 二分/矩陣快速冪**：高成本低頻率，1800+ 補洞應優先補狀態機與劃分型。\n- **graph → 網路流/尤拉路徑/強連通分量/二分圖染色/基環樹/差分約束**：超出 screen 範圍，留到 onsite 前再說。\n- **trees → 倍增 LCA/虛樹/點分治/樹上啟發式合併/DFS 時間戳**：樹分解進階主題，模板長且出題率低。\n- **greedy → 交換論證/構造題/互動題/腦筋急轉彎/數學貪心**：不可模板化、訊號低；只保留區間貪心族。\n- **sorting（整章：計數/基數/桶排序）**：幾乎不單獨出題，知道概念即可。\n- **sliding_window → 分組迴圈/三指標/原地修改/背向雙指標等雜項**：雜項小節以主模板帶過即可。\n- **technical_interview → 距離向量與幾何/掃描線/狀態空間壓縮 BFS/高階 DP 小節**：已抽出 875、1011、1235、1293 等代表題進入題單，其餘屬 2200+ 難度區，超出目標。",
    },
  ],
} as TutorialData.Root;
