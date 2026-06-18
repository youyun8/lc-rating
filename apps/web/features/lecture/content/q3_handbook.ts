import type { TutorialData } from "@/types";

export const q3Handbook = {
  id: 930,
  title: "LeetCode 競賽 Q3 手冊：第三題模式訓練",
  description:
    "給已能穩定完成 Q1/Q2、但常在 Q3 卡住的使用者：用模式優先的方式整理讀題訊號、解法轉換與賽後複習。",
  src: null,
  last_update: "2026-06-18T00:00:00.000Z",
  summary:
    "# LeetCode 競賽 Q3 手冊\n\n這份手冊把 Q3 常見考法整理成可辨識的模式。閱讀時先看限制與敘述中的訊號，再決定要嘗試滑動視窗、前綴和、答案二分、堆積貪心、最短路、DP、貢獻法或位元壓縮。\n\n## 學習順序\n\n1. 先讀 Q3 心態與模式識別清單。\n2. 選一個核心模式章節，確認它解決哪種重複工作。\n3. 做 P0 經典題，把不變式講清楚。\n4. 做 P1/P2 近年競賽型題，練習辨認偽裝後的同一個模式。\n5. 每次失敗都寫成一句下次能直接使用的判斷規則。",
  children: [
    {
      id: 93100,
      title: "1. Q3 心態與識別",
      summary:
        "先把 Q3 的決策流程拆清楚：讀限制、拆暴力、找重複工作，並知道什麼時候該換方向。",
      children: [
        {
          id: 93000,
          title: "1.1 如何使用本手冊",
          summary:
            "# 如何使用本手冊\n\n本手冊的目標不是把題目背起來，而是把失敗的 Q3 轉成可重用的判斷規則。\n\n## 建議循環\n\n1. 選一個模式章節。\n2. 先讀題目訊號與不變式，再開題。\n3. 不計時完成兩題 P0 經典題。\n4. 用 35 分鐘計時挑戰兩題 P1 近年競賽型題。\n5. 失敗時寫下「我漏看的訊號」。\n6. 依複習頻率回來重做。\n\n## 賽後筆記要寫什麼\n\n有效的筆記要短、具體，而且能改變下一次開題時的第一個判斷。\n\n- 正數陣列加目標和：先想滑動視窗，再想前綴和。\n- 要最小化最大值：先檢查是否能二分答案。\n- 網格移動代價只有 0/1：先想 0-1 BFS。\n\n避免只寫「多練習」或「小心一點」；這類結論無法在下一場比賽中轉成具體動作。",
        },
        {
          id: 93001,
          title: "1.2 Q3 競賽心態",
          summary:
            "# Q3 競賽心態\n\n## 為什麼 Q3 比 Q1/Q2 難很多\n\nQ1/Q2 多半考直接實作：模擬、簡單計數、或套一個基本資料結構。Q3 則通常要求你把暴力法轉換成某個模式。\n\n常見轉換包括：\n\n- 枚舉所有子陣列 -> 滑動視窗、前綴和、貢獻法。\n- 嘗試每個答案 -> 二分答案加可行性檢查。\n- 遞迴枚舉選擇 -> 定義小狀態 DP。\n- 掃所有路徑 -> 建圖後做 BFS、0-1 BFS 或 Dijkstra。\n- 反覆找最佳前狀態 -> 用堆積、映射表、單調佇列或有序集合。\n\n## 先寫暴力，再找重複工作\n\n先用一句話說清楚：我在枚舉什麼？什麼條件算合法？答案要加總、最大化還是最小化？哪一段重複工作太慢？\n\n重複工作通常就是模式線索。每個右端點都重新往左掃，可能是視窗；每個候選答案都能獨立驗證，可能是答案二分；每條路徑重複到達相同狀態，可能是最短路或 DP。\n\n## 何時換方向\n\n如果 8 到 12 分鐘後仍說不出目前做法的不變式，就要主動切換方向。常見訊號：\n\n- 視窗條件其實不單調。\n- DP 轉移還需要掃全部前狀態。\n- 貪心選擇沒有交換論證。\n- 圖的 visited 少了剩餘資源、奇偶性或上一動作。\n- 二分的 can(x) 不是單調的。",
        },
        {
          id: 93002,
          title: "1.3 模式識別檢查清單",
          summary:
            "# 模式識別檢查清單\n\n## 讀題前三分鐘\n\n- 最大限制是多少？\n- 暴力枚舉的是子陣列、路徑、區間、狀態還是答案值？\n- 數值是全正、可正可負、二元、還是位元範圍很小？\n- 題目要的是計數、最大值、最小值、存在性還是構造？\n\n## 子陣列與子字串\n\n- 全正且有和/乘積限制：先想滑動視窗。\n- 可正可負：先想前綴和或單調前綴結構。\n- 恰好 K：嘗試 atMost(K) - atMost(K - 1)。\n- 計數題：決定是依右端點還是左端點計數。\n\n## 最佳化\n\n- 是否在最小化最大值或最大化最小值？\n- 候選答案變大時，可行性是否單調？\n- can(x) 能否用貪心、計數或一次掃描完成？\n\n## 圖與狀態\n\n- 陣列或網格是否其實是圖？\n- 邊權全為 1、0/1、還是非負？\n- visited 是否需要加入剩餘資源、mask、奇偶性或上一個方向？\n\n## DP 與貢獻\n\n- 是否在選不重疊區間或至多 K 個物件？\n- 是否能排序後找前一個相容狀態？\n- 是否在求所有子陣列/子字串總和，能改成每個元素的貢獻？\n- AND/OR 狀態是否因位元單向變化而很少？",
        },
        {
          id: 93003,
          title: "1.4 如何練習",
          summary:
            "# 如何練習\n\n## 檢討失敗的 Q3\n\n每次失敗後固定記錄五件事：暴力想法、被哪個限制殺掉、漏看的模式訊號、正解的不變式或轉移、下一次可重用的一句規則。\n\n範例：如果候選答案是容量，且一次貪心掃描能數需要幾組，先試答案二分，不要直接寫複雜 DP。\n\n## 建立個人模式筆記\n\n每個模式只保留：一個模板、三個題目訊號、兩個常見陷阱、三題自己錯過訊號的題目、一句自己的規則。\n\n## 計時練習\n\n學習模式不計時，重點是講清楚不變式；競賽模式限時 35 分鐘，8 到 12 分鐘沒有不變式就換方向。練觀念與練速度要分開，否則很難判斷問題出在模式不熟還是賽中決策太慢。",
        },
        {
          id: 93004,
          title: "1.5 最終競賽檢查清單",
          summary:
            "# 最終競賽檢查清單\n\n## 開題後\n\n- 先讀限制。\n- 用一句話寫暴力法。\n- 找出重複工作。\n- 判斷數值特性：全正、可負、二元、位元小、或網格/圖。\n\n## 模式訊號\n\n- 最小化最大值：檢查單調性。\n- 子陣列計數：檢查滑窗、前綴和、貢獻法。\n- 恰好 K：檢查 atMost 差分。\n- 網格帶代價：檢查 BFS / 0-1 BFS / Dijkstra。\n- 不重疊選擇：檢查區間 DP 或前綴最佳值。\n- AND/OR 子陣列：檢查壓縮位元狀態。\n\n## 寫碼前\n\n先說出不變式或轉移，再定義答案邊界、確認完整狀態、決定重複值 tie-break；可能溢位的地方一律改用 long long。",
        },
      ],
    },
    {
      id: 93200,
      title: "2. 核心 Q3 模式講義",
      summary: "每個核心模式都整理讀題訊號、可維護的不變式、常見踩坑與代表題。",
      children: [
        {
          id: 93005,
          title: "2.1 滑動視窗",
          summary:
            "# 滑動視窗\n\n## 為什麼 Q3 常出現\n\n滑動視窗把重複的連續區間掃描壓成一次線性掃描。Q3 常把它偽裝成刪除、替換、頻次限制、至少 K 次事件或依端點計數。\n\n## 核心想法\n\n維護 [left, right] 與一個可恢復的不變式。右端進來後，若條件被破壞，就移動 left 直到恢復。\n\n常見型態：定長視窗、不定長視窗、至多 K、恰好 K = atMost(K) - atMost(K-1)、依右端點計數、依左端點計數。\n\n## 讀題訊號\n\n連續子陣列/子字串、全正數、最長/最短合法區間、至多 K 次修改或刪除、計算每個右端點能形成多少合法區間。\n\n## 模板\n\n```cpp\nlong long countAtMost(vector<int>& nums, int k) {\n    if (k < 0) return 0;\n    long long answer = 0;\n    int left = 0;\n    unordered_map<int, int> freq;\n\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        if (++freq[nums[right]] == 1) --k;\n        while (k < 0) {\n            if (--freq[nums[left]] == 0) ++k;\n            ++left;\n        }\n        answer += right - left + 1;\n    }\n    return answer;\n}\n```\n\n## 常見踩坑\n\n可正可負的和不適合直接滑窗；計數前要確認不變式已恢復；OR 從視窗移出元素時要用位元計數，不能直接相減；有時真正的視窗是在「相同值的位置陣列」上。\n\n## 代表題\n\n| 題號 | 核心 | 難點 |\n| --- | --- | --- |\n| 209 | shrink while valid | 最短合法視窗 |\n| 713 | 依右端點計數 | 正數乘積才有單調性 |\n| 1004 | 至多 K 個 0 | 違規計數比替換過程重要 |\n| 992 | 恰好 K 轉 atMost | 直接維護恰好容易錯 |\n| 2831 | 對位置陣列滑窗 | 原陣列不是最佳座標 |",
        },
        {
          id: 93006,
          title: "2.2 前綴和與雜湊表",
          summary:
            "# 前綴和與雜湊表\n\n當滑動視窗因負數失去單調性時，前綴和通常接手。把子陣列條件改寫成兩個前綴的關係：若 sum(i..j)=k，則需要先前 prefix = current - k。\n\n## 讀題訊號\n\n可正可負、精確和、模數條件、平衡條件、依目前值查某個先前前綴。\n\n## 模板\n\n```cpp\nlong long countSubarraysWithSum(vector<int>& nums, long long target) {\n    unordered_map<long long, long long> freq;\n    freq[0] = 1;\n    long long prefix = 0, answer = 0;\n    for (int value : nums) {\n        prefix += value;\n        answer += freq[prefix - target];\n        ++freq[prefix];\n    }\n    return answer;\n}\n```\n\n## 檢查重點\n\n先初始化空前綴；判斷要存頻次、最早下標、最新下標還是最佳前綴；遇到 modulo 要處理負餘數。",
        },
        {
          id: 93007,
          title: "2.3 答案二分搜尋",
          summary:
            "# 答案二分搜尋\n\n## 核心想法\n\n最佳答案難直接構造，但檢查某個候選值 x 是否可行很容易，而且可行性隨 x 單調變化。這時把問題改成找第一個可行值或最後一個可行值。\n\n## 讀題訊號\n\n最小化最大值、最大化最小值、最少時間/天數/速度/容量、候選答案是數值且 can(x) 能用貪心或計數完成。\n\n## 模板\n\n```cpp\nlong long firstFeasible(long long low, long long high) {\n    auto can = [&](long long limit) {\n        return true;\n    };\n    while (low < high) {\n        long long mid = low + (high - low) / 2;\n        if (can(mid)) high = mid;\n        else low = mid + 1;\n    }\n    return low;\n}\n```\n\n## 常見踩坑\n\ncan(x) 不是單調、邊界不包含真答案、first true 與 last true 更新式混用、總和或乘法沒有用 long long。",
        },
        {
          id: 93008,
          title: "2.4 堆積貪心",
          summary:
            "# 堆積貪心\n\n堆積貪心常見於「先做選擇，之後再反悔」或「必要時才消耗昂貴資源」。堆積保存目前看過的最佳候選，讓每次反悔都能改掉最不划算的決策。\n\n## 讀題訊號\n\n燃料、磚塊、梯子、操作次數、排程、每次取最大/最小、更新後舊資料可能失效。\n\n## 判斷方式\n\n問自己：堆裡放的是候選、活躍項目還是已分配資源？我要最大堆還是最小堆？舊資料何時變 stale？查答案前是否要延遲刪除？",
        },
        {
          id: 93009,
          title: "2.5 區間與掃描線",
          summary:
            "# 區間與掃描線\n\n把範圍問題壓成排序後的邊界事件。常見答案是合併後長度、最大重疊、最少房間/組數、或未覆蓋部分。\n\n## 讀題訊號\n\n會議、天數、預訂、覆蓋、[l,r] 操作、最少分組、最大同時存在數。\n\n## 檢查重點\n\n區間是閉區間還是半開區間？同一座標 start/end 誰先處理？是否需要座標壓縮？最少組數是否等於最大重疊數？",
        },
        {
          id: 93010,
          title: "2.6 單調堆疊與單調佇列",
          summary:
            "# 單調堆疊與單調佇列\n\n單調結構的本質是刪掉永遠不可能成為答案的候選。它適合找下一個更大/更小、子陣列最大最小貢獻、固定視窗最值、或前綴和限制。\n\n## 讀題訊號\n\nnext greater、next smaller、視窗最大值、子陣列最小值總和、帶負數的最短子陣列。\n\n## 常見踩坑\n\n忘記存下標導致無法算距離；重複值 tie-break 不一致；deque 隊首過期但沒有移除。",
        },
        {
          id: 93011,
          title: "2.7 圖論：BFS / 0-1 BFS / Dijkstra",
          summary:
            "# 圖論：BFS / 0-1 BFS / Dijkstra\n\n很多 Q3 的陣列/網格題其實是最短路。格子、下標、mask、剩餘資源都可能是節點狀態；移動或操作是邊。\n\n## 選演算法\n\n- 邊權全 1：BFS。\n- 邊權只有 0/1：0-1 BFS。\n- 邊權非負：Dijkstra。\n- 有剩餘資源、奇偶性、上一方向：把它加入狀態。\n\n## 模板提醒\n\nDijkstra 從 priority_queue 取出狀態時，如果 cost != dist[node]，這筆就是 stale entry，要跳過。",
        },
        {
          id: 93012,
          title: "2.8 動態規劃",
          summary:
            "# 動態規劃\n\nQ3 的 DP 通常不是表很大，而是狀態藏得深。先說清楚 dp[i] 代表「處理完哪個前綴後的最佳值」，再想如何壓縮轉移。\n\n## 讀題訊號\n\n選或不選、不重疊區間/子陣列、至多 K 個、上一個相容物件、目前是否在一段中。\n\n## 常見優化\n\n排序加二分找相容前狀態、前綴最大值替代掃描、堆或 map 保存最佳轉移、狀態壓縮。",
        },
        {
          id: 93013,
          title: "2.9 貢獻法",
          summary:
            "# 貢獻法\n\n當題目要求所有子陣列或子字串的總和時，不要枚舉每個物件；改算每個元素在多少物件中扮演指定角色。\n\n## 讀題訊號\n\n所有子陣列/子字串之和、每個元素作為最小值/最大值/唯一字元、前後邊界決定貢獻範圍。\n\n## 公式\n\n若 index 左邊有 L 種起點、右邊有 R 種終點，貢獻通常是 L * R * value。重複值要用不對稱比較避免重複歸屬。",
        },
        {
          id: 93014,
          title: "2.10 位元技巧",
          summary:
            "# 位元技巧\n\nOR 只會讓位元從 0 變 1，AND 只會讓位元從 1 變 0，所以每個右端點的不同 OR/AND 值數量通常很小，可用 map 保存「值 -> 次數」。\n\n## 讀題訊號\n\n子陣列 OR/AND/XOR、目標 K、限制允許 O(n * 32)、mask 狀態小、bitset 可表示可達性。\n\n## 注意\n\nXOR 沒有 OR/AND 的單調壓縮特性，常要改用前綴 XOR 或有限狀態。滑窗維護 OR 時，移出元素必須用每個 bit 的計數。",
        },
        {
          id: 93015,
          title: "2.11 資料結構設計",
          summary:
            "# 資料結構設計\n\n資料結構型 Q3 重點是維護多個視角：一份權威狀態，加上一些加速查詢的索引。堆積、set、map 都可能保存過期資料，因此查詢前要驗證。\n\n## 讀題訊號\n\n更新與查詢交錯、依分類找最高/最低、頻次變化、刪除或覆蓋造成舊 heap entry 失效。\n\n## 原則\n\n先定義 source of truth，再定義索引。索引可以有 stale entry，但回傳答案前必須和 source of truth 對齊。",
        },
      ],
    },
    {
      id: 93300,
      title: "3. 精選 Q3 追蹤表與題單",
      summary: "從經典基礎題到近年競賽型題，保留能訓練遷移能力的精選練習。",
      children: [
        {
          id: 93016,
          title: "3.1 Q3 總追蹤表",
          summary:
            "# Q3 總追蹤表\n\n這張總表把所有 Q3 精選題集中在一起，適合做混合複習。P0 用來校準不變式，P1/P2 用來訓練你在題目偽裝後仍能選對第一方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 209 | [長度最小的子陣列](https://leetcode.cn/problems/minimum-size-subarray-sum) |  | 滑動視窗 / P0 / 最短合法視窗 | P0 |\n| 2 | 713 | [乘積小於 K 的子陣列](https://leetcode.cn/problems/subarray-product-less-than-k) |  | 滑動視窗 / P0 / 依右端點計數 | P0 |\n| 3 | 1004 | [最大連續 1 的個數 III](https://leetcode.cn/problems/max-consecutive-ones-iii) |  | 滑動視窗 / P0 / 至多 K | P0 |\n| 4 | 992 | [K 個不同整數的子陣列](https://leetcode.cn/problems/subarrays-with-k-different-integers) |  | 滑動視窗 / P0 / 恰好 K 轉成 atMost | P0 |\n| 5 | 2831 | [找出最長等值子陣列](https://leetcode.cn/problems/find-the-longest-equal-subarray) | 1800 | 滑動視窗 / P1 / 在位置陣列上滑窗 | P1 |\n| 6 | 2962 | [統計最大元素至少出現 K 次的子陣列](https://leetcode.cn/problems/count-subarrays-where-max-element-appears-at-least-k-times) | 1700 | 滑動視窗 / P1 / 依左端點計數 | P1 |\n| 7 | 3097 | [或值至少為 K 的最短子陣列 II](https://leetcode.cn/problems/shortest-subarray-with-or-at-least-k-ii) | 1900 | 滑動視窗 / P1 / 視窗內維護位元計數 | P1 |\n| 8 | 560 | [和為 K 的子陣列](https://leetcode.cn/problems/subarray-sum-equals-k) |  | 前綴和與雜湊表 / P0 / 前綴頻次 | P0 |\n| 9 | 974 | [和可被 K 整除的子陣列](https://leetcode.cn/problems/subarray-sums-divisible-by-k) |  | 前綴和與雜湊表 / P0 / 模數前綴 | P0 |\n| 10 | 1248 | [統計優美子陣列](https://leetcode.cn/problems/count-number-of-nice-subarrays) |  | 前綴和與雜湊表 / P1 / 計數差分 | P1 |\n| 11 | 3026 | [最大好子陣列和](https://leetcode.cn/problems/maximum-good-subarray-sum) | 1800 | 前綴和與雜湊表 / P1 / 依值查最佳前綴 | P1 |\n| 12 | 410 | [分割陣列的最大值](https://leetcode.cn/problems/split-array-largest-sum) |  | 答案二分搜尋 / P0 / 最小化最大值 | P0 |\n| 13 | 875 | [愛吃香蕉的珂珂](https://leetcode.cn/problems/koko-eating-bananas) |  | 答案二分搜尋 / P0 / 最小可行速度 | P0 |\n| 14 | 1482 | [製作 m 束花所需的最少天數](https://leetcode.cn/problems/minimum-number-of-days-to-make-m-bouquets) |  | 答案二分搜尋 / P0 / 可行性檢查 | P0 |\n| 15 | 1552 | [兩球之間的磁力](https://leetcode.cn/problems/magnetic-force-between-two-balls) |  | 答案二分搜尋 / P0 / 最大化最小值 | P0 |\n| 16 | 2187 | [完成旅途的最少時間](https://leetcode.cn/problems/minimum-time-to-complete-trips) |  | 答案二分搜尋 / P0 / 計數型檢查 | P0 |\n| 17 | 2517 | [糖果禮盒的最大甜度](https://leetcode.cn/problems/maximum-tastiness-of-candy-basket) | 1700 | 答案二分搜尋 / P1 / 最大化最小值 | P1 |\n| 18 | 2616 | [最小化數對的最大差值](https://leetcode.cn/problems/minimize-the-maximum-difference-of-pairs) | 1800 | 答案二分搜尋 / P1 / 貪心檢查 | P1 |\n| 19 | 871 | [最低加油次數](https://leetcode.cn/problems/minimum-number-of-refueling-stops) |  | 堆積貪心 / P0 / 先拿再反悔 | P0 |\n| 20 | 1642 | [可以到達的最遠建築](https://leetcode.cn/problems/furthest-building-you-can-reach) |  | 堆積貪心 / P0 / 必要時才用昂貴資源 | P0 |\n| 21 | 2353 | [設計食物評分系統](https://leetcode.cn/problems/design-a-food-rating-system) |  | 資料結構設計 / P0 / 堆積加映射表 | P0 |\n| 22 | 2530 | [執行 K 次操作後的最大分數](https://leetcode.cn/problems/maximal-score-after-applying-k-operations) | 1500 | 堆積貪心 / P1 / 反覆取最佳選擇 | P1 |\n| 23 | 3066 | [超過閾值的最少操作數 II](https://leetcode.cn/problems/minimum-operations-to-exceed-threshold-value-ii) | 1500 | 堆積貪心 / P1 / 合併最小值 | P1 |\n| 24 | 56 | [合併區間](https://leetcode.cn/problems/merge-intervals) |  | 區間與掃描線 / P0 / 合併區間 | P0 |\n| 25 | 253 | [會議室 II](https://leetcode.cn/problems/meeting-rooms-ii) |  | 區間與掃描線 / P0 / 維護活躍區間 | P0 |\n| 26 | 2406 | [將區間分成最少組數](https://leetcode.cn/problems/divide-intervals-into-minimum-number-of-groups) |  | 區間與掃描線 / P0 / 最大重疊數 | P0 |\n| 27 | 3169 | [無會議的工作日](https://leetcode.cn/problems/count-days-without-meetings) | 1400 | 區間與掃描線 / P1 / 合併區間 | P1 |\n| 28 | 739 | [每日溫度](https://leetcode.cn/problems/daily-temperatures) |  | 單調堆疊與單調佇列 / P0 / 下一個更大元素 | P0 |\n| 29 | 239 | [滑動視窗最大值](https://leetcode.cn/problems/sliding-window-maximum) |  | 單調堆疊與單調佇列 / P0 / 單調佇列 | P0 |\n| 30 | 862 | [和至少為 K 的最短子陣列](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k) |  | 單調堆疊與單調佇列 / P1 / 前綴和單調佇列 | P1 |\n| 31 | 1368 | [使網格圖至少有一條有效路徑的最小代價](https://leetcode.cn/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / 0-1 BFS | P0 |\n| 32 | 1631 | [最小體力消耗路徑](https://leetcode.cn/problems/path-with-minimum-effort) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / Dijkstra 最小化最大邊 | P0 |\n| 33 | 1293 | [網格中的最短路徑（可消除障礙）](https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / 狀態擴展 | P0 |\n| 34 | 2290 | [到達角落需要移除障礙物的最小數目](https://leetcode.cn/problems/minimum-obstacle-removal-to-reach-corner) | 1900 | 圖論：BFS / 0-1 BFS / Dijkstra / P1 / 0-1 BFS | P1 |\n| 35 | 2577 | [在網格中訪問一個格子的最少時間](https://leetcode.cn/problems/minimum-time-to-visit-a-cell-in-a-grid) | 2300 | 圖論：BFS / 0-1 BFS / Dijkstra / P2 / 含奇偶等待的 Dijkstra | P2 |\n| 36 | 198 | [打家劫舍](https://leetcode.cn/problems/house-robber) |  | 動態規劃 / P0 / 選或不選 | P0 |\n| 37 | 300 | [最長遞增子序列](https://leetcode.cn/problems/longest-increasing-subsequence) |  | 動態規劃 / P0 / 轉移優化 | P0 |\n| 38 | 1235 | [規劃兼職工作](https://leetcode.cn/problems/maximum-profit-in-job-scheduling) |  | 動態規劃 / P0 / 帶權區間排程 | P0 |\n| 39 | 689 | [三個無重疊子陣列的最大和](https://leetcode.cn/problems/maximum-sum-of-3-non-overlapping-subarrays) |  | 動態規劃 / P1 / 不重疊子陣列 | P1 |\n| 40 | 3186 | [施咒的最大總傷害](https://leetcode.cn/problems/maximum-total-damage-with-spell-casting) | 1900 | 動態規劃 / P1 / 值域版打家劫舍 | P1 |\n| 41 | 3077 | [K 個不相交子陣列的最大強度](https://leetcode.cn/problems/maximum-strength-of-k-disjoint-subarrays) | 2500 | 動態規劃 / P2 / 至多 K 段子陣列 | P2 |\n| 42 | 828 | [統計所有子字串中的唯一字元](https://leetcode.cn/problems/count-unique-characters-of-all-substrings-of-a-given-string) |  | 貢獻法 / P0 / 前後出現位置 | P0 |\n| 43 | 907 | [子陣列的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums) |  | 貢獻法 / P0 / 前後更小元素 | P0 |\n| 44 | 2104 | [子陣列範圍和](https://leetcode.cn/problems/sum-of-subarray-ranges) |  | 貢獻法 / P0 / 最大貢獻減最小貢獻 | P0 |\n| 45 | 2262 | [字串的總吸引力](https://leetcode.cn/problems/total-appeal-of-a-string) | 2000 | 貢獻法 / P1 / 子字串貢獻 | P1 |\n| 46 | 898 | [子陣列按位 OR 的不同結果數](https://leetcode.cn/problems/bitwise-ors-of-subarrays) |  | 位元技巧 / P0 / OR 狀態壓縮 | P0 |\n| 47 | 1521 | [找到最接近目標值的函式值](https://leetcode.cn/problems/find-a-value-of-a-mysterious-function-closest-to-target) |  | 位元技巧 / P0 / AND 狀態壓縮 | P0 |\n| 48 | 3209 | [AND 值為 K 的子陣列數目](https://leetcode.cn/problems/number-of-subarrays-with-and-value-of-k) | 2000 | 位元技巧 / P1 / AND 狀態壓縮 | P1 |\n| 49 | 3095 | [或值至少為 K 的最短子陣列 I](https://leetcode.cn/problems/shortest-subarray-with-or-at-least-k-i) | 1400 | 位元技巧 / P1 / OR 維護 | P1 |\n| 50 | 1804 | [實作 Trie II](https://leetcode.cn/problems/implement-trie-ii) |  | 資料結構設計 / P1 / 頻次追蹤 | P1 |\n| 51 | 2034 | [股票價格波動](https://leetcode.cn/problems/stock-price-fluctuation) |  | 資料結構設計 / P0 / 延遲刪除 | P0 |\n| 52 | 2502 | [設計記憶體配置器](https://leetcode.cn/problems/design-memory-allocator) | 1600 | 資料結構設計 / P1 / 區間配置 | P1 |",
        },
        {
          id: 93017,
          title: "3.2 滑動視窗 題單",
          summary:
            "# 滑動視窗 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 209 | [長度最小的子陣列](https://leetcode.cn/problems/minimum-size-subarray-sum) |  | 滑動視窗 / P0 / 最短合法視窗 | P0 |\n| 2 | 713 | [乘積小於 K 的子陣列](https://leetcode.cn/problems/subarray-product-less-than-k) |  | 滑動視窗 / P0 / 依右端點計數 | P0 |\n| 3 | 1004 | [最大連續 1 的個數 III](https://leetcode.cn/problems/max-consecutive-ones-iii) |  | 滑動視窗 / P0 / 至多 K | P0 |\n| 4 | 992 | [K 個不同整數的子陣列](https://leetcode.cn/problems/subarrays-with-k-different-integers) |  | 滑動視窗 / P0 / 恰好 K 轉成 atMost | P0 |\n| 5 | 2831 | [找出最長等值子陣列](https://leetcode.cn/problems/find-the-longest-equal-subarray) | 1800 | 滑動視窗 / P1 / 在位置陣列上滑窗 | P1 |\n| 6 | 2962 | [統計最大元素至少出現 K 次的子陣列](https://leetcode.cn/problems/count-subarrays-where-max-element-appears-at-least-k-times) | 1700 | 滑動視窗 / P1 / 依左端點計數 | P1 |\n| 7 | 3097 | [或值至少為 K 的最短子陣列 II](https://leetcode.cn/problems/shortest-subarray-with-or-at-least-k-ii) | 1900 | 滑動視窗 / P1 / 視窗內維護位元計數 | P1 |",
        },
        {
          id: 93018,
          title: "3.3 前綴和與雜湊表 題單",
          summary:
            "# 前綴和與雜湊表 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 560 | [和為 K 的子陣列](https://leetcode.cn/problems/subarray-sum-equals-k) |  | 前綴和與雜湊表 / P0 / 前綴頻次 | P0 |\n| 2 | 974 | [和可被 K 整除的子陣列](https://leetcode.cn/problems/subarray-sums-divisible-by-k) |  | 前綴和與雜湊表 / P0 / 模數前綴 | P0 |\n| 3 | 1248 | [統計優美子陣列](https://leetcode.cn/problems/count-number-of-nice-subarrays) |  | 前綴和與雜湊表 / P1 / 計數差分 | P1 |\n| 4 | 3026 | [最大好子陣列和](https://leetcode.cn/problems/maximum-good-subarray-sum) | 1800 | 前綴和與雜湊表 / P1 / 依值查最佳前綴 | P1 |",
        },
        {
          id: 93019,
          title: "3.4 答案二分搜尋 題單",
          summary:
            "# 答案二分搜尋 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 410 | [分割陣列的最大值](https://leetcode.cn/problems/split-array-largest-sum) |  | 答案二分搜尋 / P0 / 最小化最大值 | P0 |\n| 2 | 875 | [愛吃香蕉的珂珂](https://leetcode.cn/problems/koko-eating-bananas) |  | 答案二分搜尋 / P0 / 最小可行速度 | P0 |\n| 3 | 1482 | [製作 m 束花所需的最少天數](https://leetcode.cn/problems/minimum-number-of-days-to-make-m-bouquets) |  | 答案二分搜尋 / P0 / 可行性檢查 | P0 |\n| 4 | 1552 | [兩球之間的磁力](https://leetcode.cn/problems/magnetic-force-between-two-balls) |  | 答案二分搜尋 / P0 / 最大化最小值 | P0 |\n| 5 | 2187 | [完成旅途的最少時間](https://leetcode.cn/problems/minimum-time-to-complete-trips) |  | 答案二分搜尋 / P0 / 計數型檢查 | P0 |\n| 6 | 2517 | [糖果禮盒的最大甜度](https://leetcode.cn/problems/maximum-tastiness-of-candy-basket) | 1700 | 答案二分搜尋 / P1 / 最大化最小值 | P1 |\n| 7 | 2616 | [最小化數對的最大差值](https://leetcode.cn/problems/minimize-the-maximum-difference-of-pairs) | 1800 | 答案二分搜尋 / P1 / 貪心檢查 | P1 |",
        },
        {
          id: 93020,
          title: "3.5 堆積貪心 題單",
          summary:
            "# 堆積貪心 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 871 | [最低加油次數](https://leetcode.cn/problems/minimum-number-of-refueling-stops) |  | 堆積貪心 / P0 / 先拿再反悔 | P0 |\n| 2 | 1642 | [可以到達的最遠建築](https://leetcode.cn/problems/furthest-building-you-can-reach) |  | 堆積貪心 / P0 / 必要時才用昂貴資源 | P0 |\n| 3 | 2530 | [執行 K 次操作後的最大分數](https://leetcode.cn/problems/maximal-score-after-applying-k-operations) | 1500 | 堆積貪心 / P1 / 反覆取最佳選擇 | P1 |\n| 4 | 3066 | [超過閾值的最少操作數 II](https://leetcode.cn/problems/minimum-operations-to-exceed-threshold-value-ii) | 1500 | 堆積貪心 / P1 / 合併最小值 | P1 |",
        },
        {
          id: 93021,
          title: "3.6 區間與掃描線 題單",
          summary:
            "# 區間與掃描線 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 56 | [合併區間](https://leetcode.cn/problems/merge-intervals) |  | 區間與掃描線 / P0 / 合併區間 | P0 |\n| 2 | 253 | [會議室 II](https://leetcode.cn/problems/meeting-rooms-ii) |  | 區間與掃描線 / P0 / 維護活躍區間 | P0 |\n| 3 | 2406 | [將區間分成最少組數](https://leetcode.cn/problems/divide-intervals-into-minimum-number-of-groups) |  | 區間與掃描線 / P0 / 最大重疊數 | P0 |\n| 4 | 3169 | [無會議的工作日](https://leetcode.cn/problems/count-days-without-meetings) | 1400 | 區間與掃描線 / P1 / 合併區間 | P1 |",
        },
        {
          id: 93022,
          title: "3.7 單調堆疊與單調佇列 題單",
          summary:
            "# 單調堆疊與單調佇列 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 739 | [每日溫度](https://leetcode.cn/problems/daily-temperatures) |  | 單調堆疊與單調佇列 / P0 / 下一個更大元素 | P0 |\n| 2 | 239 | [滑動視窗最大值](https://leetcode.cn/problems/sliding-window-maximum) |  | 單調堆疊與單調佇列 / P0 / 單調佇列 | P0 |\n| 3 | 862 | [和至少為 K 的最短子陣列](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k) |  | 單調堆疊與單調佇列 / P1 / 前綴和單調佇列 | P1 |",
        },
        {
          id: 93023,
          title: "3.8 圖論：BFS / 0-1 BFS / Dijkstra 題單",
          summary:
            "# 圖論：BFS / 0-1 BFS / Dijkstra 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 1368 | [使網格圖至少有一條有效路徑的最小代價](https://leetcode.cn/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / 0-1 BFS | P0 |\n| 2 | 1631 | [最小體力消耗路徑](https://leetcode.cn/problems/path-with-minimum-effort) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / Dijkstra 最小化最大邊 | P0 |\n| 3 | 1293 | [網格中的最短路徑（可消除障礙）](https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination) |  | 圖論：BFS / 0-1 BFS / Dijkstra / P0 / 狀態擴展 | P0 |\n| 4 | 2290 | [到達角落需要移除障礙物的最小數目](https://leetcode.cn/problems/minimum-obstacle-removal-to-reach-corner) | 1900 | 圖論：BFS / 0-1 BFS / Dijkstra / P1 / 0-1 BFS | P1 |\n| 5 | 2577 | [在網格中訪問一個格子的最少時間](https://leetcode.cn/problems/minimum-time-to-visit-a-cell-in-a-grid) | 2300 | 圖論：BFS / 0-1 BFS / Dijkstra / P2 / 含奇偶等待的 Dijkstra | P2 |",
        },
        {
          id: 93024,
          title: "3.9 動態規劃 題單",
          summary:
            "# 動態規劃 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 198 | [打家劫舍](https://leetcode.cn/problems/house-robber) |  | 動態規劃 / P0 / 選或不選 | P0 |\n| 2 | 300 | [最長遞增子序列](https://leetcode.cn/problems/longest-increasing-subsequence) |  | 動態規劃 / P0 / 轉移優化 | P0 |\n| 3 | 1235 | [規劃兼職工作](https://leetcode.cn/problems/maximum-profit-in-job-scheduling) |  | 動態規劃 / P0 / 帶權區間排程 | P0 |\n| 4 | 689 | [三個無重疊子陣列的最大和](https://leetcode.cn/problems/maximum-sum-of-3-non-overlapping-subarrays) |  | 動態規劃 / P1 / 不重疊子陣列 | P1 |\n| 5 | 3186 | [施咒的最大總傷害](https://leetcode.cn/problems/maximum-total-damage-with-spell-casting) | 1900 | 動態規劃 / P1 / 值域版打家劫舍 | P1 |\n| 6 | 3077 | [K 個不相交子陣列的最大強度](https://leetcode.cn/problems/maximum-strength-of-k-disjoint-subarrays) | 2500 | 動態規劃 / P2 / 至多 K 段子陣列 | P2 |",
        },
        {
          id: 93025,
          title: "3.10 貢獻法 題單",
          summary:
            "# 貢獻法 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 828 | [統計所有子字串中的唯一字元](https://leetcode.cn/problems/count-unique-characters-of-all-substrings-of-a-given-string) |  | 貢獻法 / P0 / 前後出現位置 | P0 |\n| 2 | 907 | [子陣列的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums) |  | 貢獻法 / P0 / 前後更小元素 | P0 |\n| 3 | 2104 | [子陣列範圍和](https://leetcode.cn/problems/sum-of-subarray-ranges) |  | 貢獻法 / P0 / 最大貢獻減最小貢獻 | P0 |\n| 4 | 2262 | [字串的總吸引力](https://leetcode.cn/problems/total-appeal-of-a-string) | 2000 | 貢獻法 / P1 / 子字串貢獻 | P1 |",
        },
        {
          id: 93026,
          title: "3.11 位元技巧 題單",
          summary:
            "# 位元技巧 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 898 | [子陣列按位 OR 的不同結果數](https://leetcode.cn/problems/bitwise-ors-of-subarrays) |  | 位元技巧 / P0 / OR 狀態壓縮 | P0 |\n| 2 | 1521 | [找到最接近目標值的函式值](https://leetcode.cn/problems/find-a-value-of-a-mysterious-function-closest-to-target) |  | 位元技巧 / P0 / AND 狀態壓縮 | P0 |\n| 3 | 3209 | [AND 值為 K 的子陣列數目](https://leetcode.cn/problems/number-of-subarrays-with-and-value-of-k) | 2000 | 位元技巧 / P1 / AND 狀態壓縮 | P1 |\n| 4 | 3095 | [或值至少為 K 的最短子陣列 I](https://leetcode.cn/problems/shortest-subarray-with-or-at-least-k-i) | 1400 | 位元技巧 / P1 / OR 維護 | P1 |",
        },
        {
          id: 93027,
          title: "3.12 資料結構設計 題單",
          summary:
            "# 資料結構設計 題單\n\n這張題單用 P0 經典題校準核心不變式，再用 P1/P2 競賽題檢查遷移能力。每題完成後，請記下讀題訊號、核心不變式或轉移，以及下次遇到類似敘述時的第一個嘗試方向。\n\n**搭配練習**\n\n| # | ID | Problem | Rating | Technique | Score |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 2353 | [設計食物評分系統](https://leetcode.cn/problems/design-a-food-rating-system) |  | 資料結構設計 / P0 / 堆積加映射表 | P0 |\n| 2 | 1804 | [實作 Trie II](https://leetcode.cn/problems/implement-trie-ii) |  | 資料結構設計 / P1 / 頻次追蹤 | P1 |\n| 3 | 2034 | [股票價格波動](https://leetcode.cn/problems/stock-price-fluctuation) |  | 資料結構設計 / P0 / 延遲刪除 | P0 |\n| 4 | 2502 | [設計記憶體配置器](https://leetcode.cn/problems/design-memory-allocator) | 1600 | 資料結構設計 / P1 / 區間配置 | P1 |",
        },
        {
          id: 93030,
          title: "3.99 Q3 模式分類表",
          summary:
            "# Q3 模式分類表\n\n這份分類是複習時的標籤系統。好的標籤不是為了分類好看，而是要幫你在下一場比賽讀題時知道第一個該嘗試的方向。\n\n## 滑動視窗\n\n- 定長視窗\n- 不定長視窗\n- 至多 K\n- 恰好 K\n- 依右端點計數\n- 左端驅動視窗\n- 頻次視窗\n\n## 前綴和與雜湊表\n\n- 前綴頻次\n- 模數前綴\n- 計數差分\n- 子陣列和等於 K\n- 二維前綴和\n\n## 答案二分搜尋\n\n- 最小化最大值\n- 最大化最小值\n- 可行性檢查\n- 貪心檢查\n- 計數型檢查\n\n## 堆積貪心\n\n- 先拿再反悔\n- 必要時才用昂貴資源\n- 延遲刪除\n- 雙堆積\n- 優先級排程\n\n## 區間與掃描線\n\n- 合併區間\n- 會議室模型\n- 差分事件\n- 活躍集合\n- 座標壓縮\n\n## 單調堆疊與單調佇列\n\n- 下一個更小元素\n- 下一個更大元素\n- 滑動視窗最大值\n- 最短子陣列\n- 類凸性轉移\n\n## 圖論：BFS / 0-1 BFS / Dijkstra\n\n- 無權 BFS\n- 0-1 BFS\n- Dijkstra\n- 狀態擴展\n- 網格建圖\n- 過期項目\n\n## 動態規劃\n\n- 選或不選\n- 至多 K 個選擇\n- 不重疊子陣列\n- 狀態壓縮\n- DP 加資料結構\n\n## 貢獻法\n\n- 前後出現位置\n- 前後更小元素\n- 前後更大元素\n- 子字串貢獻\n- 子陣列最小/最大值貢獻\n\n## 位元技巧\n\n- OR 狀態壓縮\n- AND 狀態壓縮\n- XOR 狀態\n- bitset 優化\n- 有限 mask 狀態\n\n## 資料結構設計\n\n- 堆積加映射表\n- 有序集合\n- 頻次追蹤\n- 延遲刪除\n- 索引查找\n\n## 使用方式\n\n每次錯過 Q3 後，只選一個主模式與一個子模式，並寫下「我應該看到哪個題目訊號」。避免把同一題貼上太多標籤，否則賽中無法回想。",
        },
      ],
    },
    {
      id: 93400,
      title: "4. C++ 競賽模板",
      summary: "整理競賽中可直接改寫的 C++ 模板，重點放在邊界與不變式。",
      children: [
        {
          id: 93031,
          title: "4.1 答案二分模板",
          summary:
            "# 4.1 答案二分模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nlong long firstFeasible(long long low, long long high) {\n    auto can = [&](long long candidate) {\n        // Replace with a monotonic feasibility check.\n        return candidate >= 0;\n    };\n\n    while (low < high) {\n        long long mid = low + (high - low) / 2;\n        if (can(mid)) high = mid;\n        else low = mid + 1;\n    }\n    return low;\n}\n\n```",
        },
        {
          id: 93032,
          title: "4.2 Dijkstra 模板",
          summary:
            "# 4.2 Dijkstra 模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& graph, int source) {\n    const long long kInf = 4e18;\n    vector<long long> dist(n, kInf);\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;\n\n    dist[source] = 0;\n    pq.push({0, source});\n\n    while (!pq.empty()) {\n        auto [cost, node] = pq.top();\n        pq.pop();\n        if (cost != dist[node]) continue;\n\n        for (auto [next_node, weight] : graph[node]) {\n            long long next_cost = cost + weight;\n            if (next_cost < dist[next_node]) {\n                dist[next_node] = next_cost;\n                pq.push({next_cost, next_node});\n            }\n        }\n    }\n    return dist;\n}\n\n```",
        },
        {
          id: 93033,
          title: "4.3 DP 轉移模板",
          summary:
            "# 4.3 DP 轉移模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nlong long takeSkipDp(vector<int>& values) {\n    long long skip = 0;\n    long long take = 0;\n\n    for (int value : values) {\n        long long next_take = skip + value;\n        long long next_skip = max(skip, take);\n        take = next_take;\n        skip = next_skip;\n    }\n    return max(skip, take);\n}\n\n```",
        },
        {
          id: 93034,
          title: "4.4 堆積貪心模板",
          summary:
            "# 4.4 堆積貪心模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nint minimumStops(int target, int start_fuel, vector<vector<int>>& stations) {\n    priority_queue<int> fuels;\n    long long reachable = start_fuel;\n    int index = 0;\n    int answer = 0;\n\n    while (reachable < target) {\n        while (index < (int)stations.size() && stations[index][0] <= reachable) {\n            fuels.push(stations[index][1]);\n            ++index;\n        }\n        if (fuels.empty()) return -1;\n        reachable += fuels.top();\n        fuels.pop();\n        ++answer;\n    }\n    return answer;\n}\n\n```",
        },
        {
          id: 93035,
          title: "4.5 區間掃描模板",
          summary:
            "# 4.5 區間掃描模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nint maxClosedIntervalOverlap(vector<vector<int>>& intervals) {\n    vector<pair<int, int>> events;\n    for (auto& interval : intervals) {\n        events.push_back({interval[0], 1});\n        events.push_back({interval[1] + 1, -1});\n    }\n    sort(events.begin(), events.end());\n\n    int active = 0;\n    int answer = 0;\n    for (auto [position, delta] : events) {\n        active += delta;\n        answer = max(answer, active);\n    }\n    return answer;\n}\n\n```",
        },
        {
          id: 93036,
          title: "4.6 單調佇列模板",
          summary:
            "# 4.6 單調佇列模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> dq;\n    vector<int> answer;\n\n    for (int i = 0; i < (int)nums.size(); ++i) {\n        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();\n        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();\n        dq.push_back(i);\n        if (i >= k - 1) answer.push_back(nums[dq.front()]);\n    }\n    return answer;\n}\n\n```",
        },
        {
          id: 93037,
          title: "4.7 單調堆疊模板",
          summary:
            "# 4.7 單調堆疊模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> previousLess(vector<int>& nums) {\n    vector<int> answer(nums.size(), -1);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < (int)nums.size(); ++i) {\n        while (!stack_indices.empty() && nums[stack_indices.back()] >= nums[i]) {\n            stack_indices.pop_back();\n        }\n        if (!stack_indices.empty()) answer[i] = stack_indices.back();\n        stack_indices.push_back(i);\n    }\n    return answer;\n}\n\n```",
        },
        {
          id: 93038,
          title: "4.8 滑動視窗模板",
          summary:
            "# 4.8 滑動視窗模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nlong long countAtMost(vector<int>& nums, int k) {\n    if (k < 0) return 0;\n    unordered_map<int, int> freq;\n    int left = 0;\n    long long answer = 0;\n\n    for (int right = 0; right < (int)nums.size(); ++right) {\n        if (++freq[nums[right]] == 1) --k;\n        while (k < 0) {\n            if (--freq[nums[left]] == 0) ++k;\n            ++left;\n        }\n        answer += right - left + 1;\n    }\n    return answer;\n}\n\n```",
        },
        {
          id: 93039,
          title: "4.9 0-1 BFS 模板",
          summary:
            "# 4.9 0-1 BFS 模板\n\n這段模板保留競賽中可直接改寫的骨架；套用時先替換狀態語意，再補上題目自己的邊界條件。\n\n```cpp\n#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> zeroOneBfs(int n, vector<vector<pair<int, int>>>& graph, int source) {\n    const int kInf = 1e9;\n    vector<int> dist(n, kInf);\n    deque<int> dq;\n\n    dist[source] = 0;\n    dq.push_front(source);\n\n    while (!dq.empty()) {\n        int node = dq.front();\n        dq.pop_front();\n\n        for (auto [next_node, weight] : graph[node]) {\n            int next_dist = dist[node] + weight;\n            if (next_dist >= dist[next_node]) continue;\n            dist[next_node] = next_dist;\n            if (weight == 0) dq.push_front(next_node);\n            else dq.push_back(next_node);\n        }\n    }\n    return dist;\n}\n\n```",
        },
      ],
    },
    {
      id: 93500,
      title: "5. 學習計畫與複習模板",
      summary: "提供兩週、四週與賽後檢討模板，方便把練習節奏固定下來。",
      children: [
        {
          id: 93040,
          title: "5.1 兩週衝刺課表",
          summary:
            "# 兩週衝刺課表\n\n## 第一週\n\n| 天 | 主題 | 任務 |\n| --- | --- | --- |\n| 1 | Q3 心態 | 讀 1.2 與 1.3，檢討兩題最近錯過的 Q3。 |\n| 2 | 滑動視窗 | 做 209、713、1004，再做一題近年滑窗題。 |\n| 3 | 答案二分 | 做 410、875、1552，再做一題近年答案二分題。 |\n| 4 | 前綴與貢獻 | 做 560、974、907，寫邊界筆記。 |\n| 5 | 圖最短路 | 做 1368、1631，說清楚邊權。 |\n| 6 | 混合計時 | 三題 P1，每題 35 分鐘。 |\n| 7 | 複習 | 更新筆記並重做失敗題。 |\n\n## 第二週\n\n堆積貪心、DP、位元技巧各排一天，最後用混合題與模擬賽檢查決策速度。",
        },
        {
          id: 93041,
          title: "5.2 四週 Q3 訓練計畫",
          summary:
            "# 四週 Q3 訓練計畫\n\n## 第 1 週：連續資料\n\n滑動視窗與前綴和。重點是判斷什麼時候不能滑窗。\n\n## 第 2 週：最佳化與貪心\n\n答案二分與堆積貪心。每題先寫 can(x) 或 heap invariant。\n\n## 第 3 週：圖、區間、DP\n\n練習完整狀態、相容前狀態與不重疊選擇。\n\n## 第 4 週：貢獻、位元、混合題\n\n用混合計時題檢查是否能在題目偽裝下選對第一方向。",
        },
        {
          id: 93042,
          title: "5.3 賽後檢討模板",
          summary:
            "# 賽後檢討模板\n\n## 題目\n\n- 競賽：\n- 題號：\n- 題名：\n- 比賽中結果：\n\n## 第一想法\n\n- 暴力法：\n- 複雜度：\n- 被哪個限制擋住：\n\n## 漏看的訊號\n\n- 讀題線索：\n- 主模式：\n- 子模式：\n\n## 正確轉換\n\n- 不變式或轉移：\n- 資料結構：\n- 複雜度：\n\n## 下一次規則\n\n當我看到……，我應該先嘗試……。",
        },
      ],
    },
    {
      id: 93600,
      title: "6. 選讀：後端同步備忘",
      summary:
        "保留原全端版本的雲端同步設計備忘；只閱讀 lc-rating 講義時可以略過。",
      children: [
        {
          id: 93043,
          title: "6.1 後端設計備忘",
          summary:
            "# 後端設計備忘\n\n原全端版本曾規劃用 Cloudflare Workers、Hono 與 D1 保存使用者進度。若只是閱讀 lc-rating 講義與刷題，這一段可以略過。\n\n同步模型是 localStorage 優先；登入後下載遠端進度，用 updated_at 做 最後寫入優先 合併，再批次上傳。",
        },
        {
          id: 93044,
          title: "6.2 API 備忘",
          summary:
            "# API 備忘\n\n原規劃端點包含 GitHub OAuth 登入、登出、/api/me、進度 CRUD、批次同步與統計；保留作為未來重新接入雲端同步時的參考。",
        },
        {
          id: 93045,
          title: "6.3 資料庫與安全備忘",
          summary:
            "# 資料庫與安全備忘\n\n資料表包含 users、user_progress、review_events。正式部署時，OAuth 密鑰與 JWT 密鑰必須放在 Wrangler secret，不可提交到 Git。CORS 應限制前端 origin，JWT 優先放 HttpOnly cookie。",
        },
        {
          id: 93046,
          title: "6.4 部署備忘",
          summary:
            "# 部署備忘\n\n只使用 lc-rating 版本時，不需要建立新的 Worker。若未來要恢復雲端同步，可再部署 Cloudflare Worker 與 D1，並設定 GitHub OAuth 回呼。",
        },
      ],
    },
  ],
} as TutorialData.Root;
