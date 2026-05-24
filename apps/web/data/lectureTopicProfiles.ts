import type { StudyPlanData, TutorialData } from "@/types";

export interface LectureTopicProfile {
  key: string;
  planKeys?: string[];
  keywords: string[];
  modelProblem: string;
  signals: string[];
  invariants: string[];
  derivation: string[];
  patterns: string[];
  pitfalls: string[];
  complexity: string;
  code: string;
  examples?: Record<
    string,
    Partial<
      Pick<
        LectureTopicProfile,
        | "modelProblem"
        | "signals"
        | "invariants"
        | "derivation"
        | "patterns"
        | "pitfalls"
        | "complexity"
        | "code"
      >
    >
  >;
}

function normalize(text: string) {
  return text.toLowerCase();
}

function normalizeExampleSlug(slug: string) {
  return slug.replace(/^\/+|\/+$/g, "");
}

function stripNumericPrefix(title: string) {
  return title.replace(/^\d+(?:\.\d+)*\.?\s*/, "").trim();
}

function getRating2100ProfileKey(titleHaystack: string) {
  if (titleHaystack.includes("二分")) return "binary-answer";
  if (titleHaystack.includes("位元")) return "bitwise-contribution";
  if (titleHaystack.includes("資料結構")) {
    return "rating-2100-data-structure";
  }
  if (titleHaystack.includes("動態規劃")) return "rating-2100-dp";
  if (titleHaystack.includes("網格")) return "grid-state-bfs";
  if (titleHaystack.includes("圖論")) return "graph-bfs-dfs";
  if (titleHaystack.includes("貪心")) return "greedy-general";
  if (titleHaystack.includes("數學")) return "math-number-theory";
  if (titleHaystack.includes("單調")) return "monotonic-stack";
  if (titleHaystack.includes("滑動")) return "sliding-window";
  if (titleHaystack.includes("字串")) return "string-tools";
  if (titleHaystack.includes("樹")) return "tree-linked-binary";
  return undefined;
}

function scoreProfile(
  profile: LectureTopicProfile,
  planKey: string,
  haystack: string,
  titleHaystack: string,
) {
  if (profile.planKeys && !profile.planKeys.includes(planKey)) {
    return -1;
  }

  return profile.keywords.reduce(
    (score, keyword) => {
      const normalized_keyword = normalize(keyword);
      const title_score = titleHaystack.includes(normalized_keyword)
        ? Math.max(4, normalized_keyword.length * 2)
        : 0;
      if (haystack.includes(normalized_keyword)) {
        return score + title_score + Math.max(2, normalized_keyword.length);
      }
      return score + title_score;
    },
    profile.planKeys?.includes(planKey) ? 2 : 0,
  );
}

export function findLectureTopicProfile({
  planKey,
  section,
  studySection,
  pathTitles,
  example,
}: {
  planKey: string;
  section: TutorialData.Section;
  studySection?: StudyPlanData.Section;
  pathTitles: string[];
  example?: StudyPlanData.Item;
}) {
  const haystack = normalize(
    [
      planKey,
      ...pathTitles,
      section.title,
      studySection?.title ?? "",
      example?.title ?? "",
      example?.slug ?? "",
    ].join(" "),
  );
  const titleHaystack = normalize(
    [section.title, studySection?.title ?? "", pathTitles.at(-1) ?? ""].join(
      " ",
    ),
  );

  const rating_2100_profile_key =
    planKey === "rating_2100"
      ? getRating2100ProfileKey(titleHaystack)
      : undefined;
  const rating_2100_profile = rating_2100_profile_key
    ? lectureTopicProfiles.find(
        (profile) => profile.key === rating_2100_profile_key,
      )
    : undefined;
  if (rating_2100_profile) {
    return rating_2100_profile;
  }

  let best_profile = lectureTopicProfiles[0]!;
  let best_score = -1;
  for (const profile of lectureTopicProfiles) {
    const score = scoreProfile(profile, planKey, haystack, titleHaystack);
    if (score > best_score) {
      best_score = score;
      best_profile = profile;
    }
  }
  return best_profile;
}

export function mergeExampleProfile(
  profile: LectureTopicProfile,
  example?: StudyPlanData.Item,
): LectureTopicProfile {
  const slug = example ? normalizeExampleSlug(example.slug) : undefined;
  const override = slug
    ? {
        ...exampleLectureOverrides[slug],
        ...profile.examples?.[slug],
      }
    : undefined;
  if (!override) return profile;
  return {
    ...profile,
    ...override,
    key: profile.key,
    keywords: profile.keywords,
    planKeys: profile.planKeys,
    examples: profile.examples,
  };
}

export function hasExampleLectureProfile(
  profile: LectureTopicProfile,
  example?: StudyPlanData.Item,
) {
  const slug = example ? normalizeExampleSlug(example.slug) : undefined;
  if (!slug) return false;
  return Boolean(exampleLectureOverrides[slug] || profile.examples?.[slug]);
}

export function getDefaultLectureExample(
  profile: LectureTopicProfile,
): StudyPlanData.Item | undefined {
  return defaultLectureExamples[profile.key];
}

export function formatLectureTopicTitle(section: TutorialData.Section) {
  return stripNumericPrefix(section.title) || section.title;
}

const lectureTopicProfiles: LectureTopicProfile[] = [
  {
    key: "binary-lower-bound",
    planKeys: ["binary_search"],
    keywords: ["基礎", "第一個", "最後一個", "插入位置", "lower", "upper"],
    modelProblem:
      "給定非遞減陣列 `nums` 與目標值 `target`，找出第一個滿足 `nums[i] >= target` 的位置；欲取得目標值的左右端點，可分別對 `target` 與 `target + 1` 做 lower bound。",
    signals: ["輸入已排序", "詢問第一個或最後一個位置", "重複值會影響答案"],
    invariants: [
      "`[0, left)` 內的位置確定不滿足條件。",
      "`[right, n)` 內的位置位於候選答案之後。",
      "答案始終落在半開區間 `[left, right)`。",
    ],
    derivation: [
      "將題目改寫為 predicate：`nums[index] >= target`。",
      "若 `predicate(mid)` 成立，第一個合法位置不會落在 mid 右側，令 `right = mid`。",
      "否則 mid 與其左側皆不可行，令 `left = mid + 1`。",
      "迴圈結束時 `left == right` 即為第一個合法位置，再依題意檢查越界。",
    ],
    patterns: [
      "lower_bound",
      "upper_bound",
      "兩次二分求左右端點",
      "二分後做合法性檢查",
    ],
    pitfalls: [
      "閉區間與半開區間的更新式不可混用。",
      "找到任一 target 不等同於找到第一個 target。",
    ],
    complexity: "每次查詢 `O(log n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int lowerBound(vector<int>& nums, int target) {\n        int left = 0;\n        int right = nums.size();\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] >= target) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n\n    vector<int> searchRange(vector<int>& nums, int target) {\n        int first = lowerBound(nums, target);\n        int after_last = lowerBound(nums, target + 1);\n        if (first == (int)nums.size() || nums[first] != target) {\n            return {-1, -1};\n        }\n        return {first, after_last - 1};\n    }\n};\n```",
  },
  {
    key: "kth-smallest",
    planKeys: ["binary_search"],
    keywords: ["第 K", "第 k", "K 小", "K 大", "kth", "查詢和最小"],
    modelProblem:
      "給定兩個已排序陣列 `nums1`、`nums2` 與整數 `k`，回傳和最小的 k 個 pair `(nums1[i], nums2[j])`。固定 i 時 pair sum 隨 j 遞增，故可將候選視為多條已排序鏈的合併。",
    signals: [
      "題目詢問第 k 小或前 k 小。",
      "候選集合並非單一陣列，而是矩陣、pair、子陣列或乘法表。",
      "候選值具有局部有序性。",
    ],
    invariants: [
      "priority queue 內僅保存每條鏈目前尚未輸出的最小候選。",
      "每次彈出的候選即為全域當前最小，因其他候選皆不小於各自鏈頭。",
      "對固定 `i`，彈出 `(i, j)` 後只需推入同列下一個 `(i, j + 1)`。",
    ],
    derivation: [
      "依 `i` 將所有 pair 拆成多列：第 i 列為 `(i, 0), (i, 1), ...`，sum 沿 j 遞增。",
      "先將前 `min(k, nums1.size())` 列的第一個 pair 放入 min-heap。",
      "重複 k 次：彈出 heap top 即為下一個最小 pair。",
      "若彈出的 pair 仍有同列下一個候選，推入 `(i, j + 1)`。",
    ],
    patterns: [
      "多路合併",
      "第 k 小候選生成",
      "二分答案 + countLessEqual",
      "heap frontier",
    ],
    pitfalls: [
      "切勿一次將所有 `n*m` 個 pair 放入 heap。",
      "若只需第 k 小數值而不必列出前 k 個，可改用二分答案並計數。",
      "k 可能大於 pair 總數，迴圈條件需同時檢查 heap 是否為空。",
    ],
    complexity:
      "回傳前 k 個 pair 時，時間 `O(k log min(k, n))`，空間 `O(min(k, n))`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {\n        using State = tuple<int, int, int>; // sum, index in nums1, index in nums2\n        priority_queue<State, vector<State>, greater<State>> frontier;\n        vector<vector<int>> answer;\n\n        if (nums1.empty() || nums2.empty() || k == 0) return answer;\n        int initial_rows = min<int>(nums1.size(), k);\n        for (int i = 0; i < initial_rows; ++i) {\n            frontier.push({nums1[i] + nums2[0], i, 0});\n        }\n\n        while (!frontier.empty() && (int)answer.size() < k) {\n            auto [sum, i, j] = frontier.top();\n            frontier.pop();\n            answer.push_back({nums1[i], nums2[j]});\n            if (j + 1 < (int)nums2.size()) {\n                frontier.push({nums1[i] + nums2[j + 1], i, j + 1});\n            }\n        }\n        return answer;\n    }\n};\n```",
    examples: {
      "find-k-pairs-with-smallest-sums": {},
      "kth-smallest-element-in-a-sorted-matrix": {
        modelProblem:
          "給定一個每列、每欄皆非遞減的 `n x n` 矩陣與整數 `k`，求矩陣中第 k 小的元素；無需輸出前 k 個，只需輸出第 k 小的值。",
        signals: [
          "矩陣列與欄皆有序。",
          "僅求第 k 小的值。",
          "給定值 x 可計算 `<= x` 的元素個數。",
        ],
        derivation: [
          "答案值域為 `[matrix[0][0], matrix[n-1][n-1]]`。",
          "對候選值 `mid`，自左下角出發計算有多少元素 `<= mid`。",
          "若個數至少為 k，第 k 小不大於 mid，收縮右界。",
          "否則第 k 小大於 mid，提高左界。",
        ],
        complexity: "計數 `O(n)`，值域二分總時間 `O(n log V)`。",
        code: "```cpp\nclass Solution {\npublic:\n    int kthSmallest(vector<vector<int>>& matrix, int k) {\n        int n = matrix.size();\n        int left = matrix[0][0];\n        int right = matrix[n - 1][n - 1];\n\n        auto countLessEqual = [&matrix, n](int value) {\n            int row = n - 1;\n            int col = 0;\n            int count = 0;\n            while (row >= 0 && col < n) {\n                if (matrix[row][col] <= value) {\n                    count += row + 1;\n                    col++;\n                } else {\n                    row--;\n                }\n            }\n            return count;\n        };\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (countLessEqual(mid) >= k) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n};\n```",
      },
    },
  },
  {
    key: "binary-answer",
    planKeys: ["binary_search"],
    keywords: ["求最小", "求最大", "最小化最大值", "最大化最小值", "分間接值"],
    modelProblem:
      "給定答案值域，若固定候選答案 `x` 後可用貪心或計數在一次掃描內判斷是否可行，求最小可行值或最大可行值。",
    signals: [
      "題目詢問最小速度、最小容量或最大最小距離。",
      "固定答案後可進行 check。",
      "check 結果具備單調性。",
    ],
    invariants: [
      "`can(x)` 為真之後，所有更寬鬆的 x 亦為真。",
      "二分區間始終保留可能答案。",
    ],
    derivation: [
      "先由題目限制推導答案下界與上界。",
      "設計 `can(limit)`，僅回答 limit 是否足夠，不在其中求最優。",
      "若 `can(mid)` 成立則嘗試更小答案，否則提高下界。",
    ],
    patterns: [
      "最小速度",
      "最小容量",
      "最大化最小距離",
      "二分答案 + greedy check",
    ],
    pitfalls: [
      "缺乏單調性時不可二分答案。",
      "check 函式的貪心策略亦需證明。",
    ],
    complexity: "`O(log V * check_cost)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int shipWithinDays(vector<int>& weights, int days) {\n        int left = *max_element(weights.begin(), weights.end());\n        int right = accumulate(weights.begin(), weights.end(), 0);\n\n        auto canShip = [&weights, days](int capacity) {\n            int used_days = 1;\n            int current = 0;\n            for (int weight : weights) {\n                if (current + weight > capacity) {\n                    used_days++;\n                    current = 0;\n                }\n                current += weight;\n            }\n            return used_days <= days;\n        };\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (canShip(mid)) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n};\n```",
  },
  {
    key: "prefix-sum",
    planKeys: ["data_structure", "math"],
    keywords: ["字首和", "前綴和", "同餘", "距離和", "狀態壓縮字首和"],
    modelProblem:
      "給定陣列 `nums` 與目標 `k`，計算有多少個連續子陣列滿足區間和條件。區間 `(l, r]` 的和等於 `prefix[r] - prefix[l]`。",
    signals: ["連續子陣列。", "區間和。", "可被 k 整除。", "同一前綴狀態重複出現。"],
    invariants: [
      "掃描到 right 時，雜湊表保存所有 left 前綴狀態。",
      "每次僅統計以當前 right 結尾的子陣列。",
    ],
    derivation: [
      "定義 `prefix` 為目前掃描過的總和。",
      "若目標為和等於 target，需查詢過去出現多少個 `prefix - target`。",
      "若目標為可被 k 整除，則查詢同餘餘數相同的舊前綴。",
    ],
    patterns: ["前綴和 + hash map", "前綴同餘", "奇偶 mask 前綴", "二維前綴和"],
    pitfalls: [
      "存在負數時不可誤用滑動視窗。",
      "`count[0] = 1` 代表自 index 0 開始的子陣列。",
    ],
    complexity: "一次掃描 `O(n)`，空間 `O(不同前綴狀態數)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        unordered_map<int, int> count;\n        count[0] = 1;\n        int prefix_sum = 0;\n        int answer = 0;\n\n        for (int x : nums) {\n            prefix_sum += x;\n            answer += count[prefix_sum - k];\n            count[prefix_sum]++;\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "enumerate-maintain",
    planKeys: ["data_structure", "rating_2100"],
    keywords: ["列舉", "維護左", "列舉中間", "對角線", "遍歷"],
    modelProblem:
      "給定需要枚舉右端點、中間點或對角線的結構，於枚舉當前位置時維護已掃過部分的最佳候選，藉以避免雙重或三重暴力。",
    signals: [
      "枚舉某一位置後，另一側僅需最大值、最小值、計數或集合。",
      "題目可按右端點或中間點拆解。",
      "暴力枚舉所有 pair 或 triple 過慢。",
    ],
    invariants: [
      "掃描到 `right` 時，左側資料結構僅包含 index `< right` 的候選。",
      "答案僅由當前位置與已維護摘要更新，不回頭重掃左側。",
    ],
    derivation: [
      "先決定枚舉哪個維度可使另一側化為歷史資訊。",
      "將歷史資訊壓縮為最大值、最小值、計數表或有序集合。",
      "每處理一個位置，先以歷史資訊更新答案，再將當前位置加入歷史集合。",
    ],
    patterns: ["列舉右維護左", "列舉中間", "對角線遍歷", "排序後掃描"],
    pitfalls: [
      "加入當前位置的時機影響是否會把自身配對到自身。",
      "若維護值需刪除過期元素，普通變數不足，應改用 heap、deque 或 set。",
    ],
    complexity: "通常將 `O(n^2)` 降至 `O(n)` 或 `O(n log n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long maxPairScore(vector<int>& nums) {\n        long long best_left = LLONG_MIN;\n        long long answer = LLONG_MIN;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            if (best_left != LLONG_MIN) {\n                answer = max(answer, best_left + nums[right] - right);\n            }\n            best_left = max(best_left, 1LL * nums[right] + right);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "rating-2100-data-structure",
    planKeys: ["rating_2100"],
    keywords: ["資料結構", "離線", "查詢", "排名", "前綴計數"],
    modelProblem:
      "給定一批查詢或一串掃描事件，選用可維護候選集合、前綴計數、區間資訊或動態排名的資料結構，使每次更新與查詢皆無需線性重掃。",
    signals: [
      "每個位置需查詢歷史資料中有多少候選符合門檻。",
      "查詢可按門檻排序後離線處理。",
      "需要動態取最大/最小、前驅/後繼或前綴排名。",
    ],
    invariants: [
      "資料結構僅保存目前掃描順序下已合法的候選。",
      "查詢答案僅由資料結構當前內容推得，不回頭重算已處理資料。",
      "若採離散化，原始大小關係必須在壓縮後保持不變。",
    ],
    derivation: [
      "先將查詢條件整理為一個門檻或一個可排序事件。",
      "決定掃描順序，使候選僅被加入或刪除一次。",
      "依查詢需求選用 Fenwick、heap、set、segment tree 或 DSU。",
      "每次回答查詢前，確認資料結構內的候選恰為合法範圍。",
    ],
    patterns: [
      "離線排序 + Fenwick",
      "掃描線 + heap/set",
      "門檻查詢 + DSU",
      "有序集合維護前驅後繼",
    ],
    pitfalls: [
      "資料結構所存為輔助索引，非題目原始資料本身。",
      "離散化須涵蓋所有更新值與查詢門檻。",
      "heap 含過期元素時須做 lazy deletion。",
    ],
    complexity: "常見目標為 `O((n + q) log n)`，空間 `O(n + q)`。",
    code: "```cpp\nclass Fenwick {\n    vector<int> tree_;\n\npublic:\n    explicit Fenwick(int n) : tree_(n + 1, 0) {}\n\n    void add(int index, int delta) {\n        for (++index; index < (int)tree_.size(); index += index & -index) {\n            tree_[index] += delta;\n        }\n    }\n\n    int prefixSum(int index) const {\n        int sum = 0;\n        for (++index; index > 0; index -= index & -index) {\n            sum += tree_[index];\n        }\n        return sum;\n    }\n};\n```",
  },
  {
    key: "rating-2100-dp",
    planKeys: ["rating_2100"],
    keywords: ["動態規劃", "DP", "狀態", "轉移", "優化"],
    modelProblem:
      "給定序列、集合或圖狀態，先寫出暴力搜尋中的重複局面，再將局面壓縮為 DP 狀態；必要時以排序、前綴最佳值、單調資料結構或二分將轉移降至可接受複雜度。",
    signals: [
      "同一局面會由多條路徑重複到達。",
      "每一步含選或不選、接於前段之後或切分位置等決策。",
      "樸素轉移正確但枚舉過慢，需要再優化一層。",
    ],
    invariants: [
      "`dp` 的語意固定後，每次轉移僅可來自已處理、已定義的狀態。",
      "若做空間壓縮，更新順序必須保證不重複使用同一輪資料。",
      "優化僅改變查找最佳前驅的方式，不改變原始轉移語意。",
    ],
    derivation: [
      "先以最後一步決策寫出遞迴或樸素 DP。",
      "估算狀態數與每個狀態的轉移成本。",
      "若轉移過慢，觀察最佳前驅是否可由排序、前綴最佳、二分或 deque 維護。",
      "補上初始值與不可達狀態，最後確認答案取自哪個狀態。",
    ],
    patterns: [
      "線性 DP + 狀態機",
      "LIS/LCS 與序列接續",
      "狀壓 DP",
      "排序後 DP + 二分前驅",
      "單調隊列或前綴最佳值優化",
    ],
    pitfalls: [
      "`dp[i]` 不可僅寫為目前答案，須明確說明涵蓋範圍與結尾條件。",
      "最大化與最小化所用的不可達初始值不同。",
      "先證明樸素轉移再套優化，否則易優化錯問題。",
    ],
    complexity:
      "依狀態而定；Rating 2100 常見目標為 `O(n log n)`、`O(nk)` 或 `O(n 2^m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int lengthOfLis(vector<int>& nums) {\n        vector<int> tails;\n        for (int x : nums) {\n            auto it = lower_bound(tails.begin(), tails.end(), x);\n            if (it == tails.end()) {\n                tails.push_back(x);\n            } else {\n                *it = x;\n            }\n        }\n        return tails.size();\n    }\n};\n```",
  },
  {
    key: "grid-state-bfs",
    planKeys: ["rating_2100", "grid"],
    keywords: ["網格", "障礙", "鑰匙", "狀態 BFS", "最短路徑"],
    modelProblem:
      "給定網格、起點、終點與額外限制（如可消除障礙次數、鑰匙集合或時間狀態），將每個完整狀態視為圖上節點，使用 BFS、0-1 BFS 或 Dijkstra 求最短代價。",
    signals: [
      "同一格在不同資源或 mask 下可走的後續不同。",
      "每步移動成本相同或僅有 0/1 成本。",
      "不能僅以 `(row, col)` 去重。",
    ],
    invariants: [
      "visited 或 dist 的維度必須等於完整狀態維度。",
      "等權 BFS 中，首次到達某完整狀態即為步數最短。",
      "若同一格可由更佳的剩餘資源抵達，較差狀態即可剪除。",
    ],
    derivation: [
      "定義狀態，例如 `(row, col, remaining)` 或 `(row, col, key_mask)`。",
      "自初始狀態入隊，距離設為 0。",
      "枚舉四方向或八方向轉移並更新額外狀態。",
      "僅在新狀態未見過或優於舊狀態時入隊。",
      "首次取出終點完整狀態時回傳距離。",
    ],
    patterns: [
      "網格 BFS",
      "資源維度剪枝",
      "key mask BFS",
      "0-1 BFS",
      "網格 Dijkstra",
    ],
    pitfalls: [
      "僅以座標去重會錯過剩餘資源不同的可行路徑。",
      "移動成本非等權時不應使用普通 BFS。",
      "狀態數上界須先估算，避免 mask 維度過大。",
    ],
    complexity: "狀態數通常為 `O(rows * cols * extra_states)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int shortestPath(vector<vector<int>>& grid, int k) {\n        int rows = grid.size();\n        int cols = grid[0].size();\n        const int kDirs[5] = {1, 0, -1, 0, 1};\n        vector<vector<int>> best(rows, vector<int>(cols, -1));\n        queue<array<int, 4>> q;\n\n        best[0][0] = k;\n        q.push({0, 0, k, 0});\n        while (!q.empty()) {\n            auto [row, col, remaining, dist] = q.front();\n            q.pop();\n            if (row == rows - 1 && col == cols - 1) return dist;\n            for (int dir = 0; dir < 4; ++dir) {\n                int next_row = row + kDirs[dir];\n                int next_col = col + kDirs[dir + 1];\n                if (next_row < 0 || next_row >= rows || next_col < 0 || next_col >= cols) continue;\n                int next_remaining = remaining - grid[next_row][next_col];\n                if (next_remaining < 0 || next_remaining <= best[next_row][next_col]) continue;\n                best[next_row][next_col] = next_remaining;\n                q.push({next_row, next_col, next_remaining, dist + 1});\n            }\n        }\n        return -1;\n    }\n};\n```",
  },
  {
    key: "difference-array",
    planKeys: ["data_structure"],
    keywords: ["差分", "一維差分", "二維差分"],
    modelProblem:
      "給定長度為 n 的陣列與大量區間加值操作 `[left, right, delta]`，於所有操作結束後回傳每個位置的值。",
    signals: ["多次區間加減。", "最後統一查詢。", "更新多、即時查詢少。"],
    invariants: [
      "`diff[i]` 表示原陣列在 i 位置相對前一格的變化量。",
      "對 `[l, r]` 加 delta 僅需修改兩個邊界。",
    ],
    derivation: [
      "於區間起點加 delta，使其後各值皆多 delta。",
      "於區間結束後一格減 delta，抵消本次更新。",
      "最後對 diff 取前綴和即可還原每個位置。",
    ],
    patterns: ["一維差分", "二維差分", "差分 + 二分答案", "差分 + 掃描線"],
    pitfalls: [
      "閉區間須於 `right + 1` 抵消。",
      "若操作與查詢交錯，應改用 Fenwick 或 segment tree。",
    ],
    complexity: "每次更新 `O(1)`，還原 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> applyUpdates(int n, vector<array<int, 3>>& updates) {\n        vector<int> diff(n + 1, 0);\n        for (auto [left, right, delta] : updates) {\n            diff[left] += delta;\n            diff[right + 1] -= delta;\n        }\n\n        vector<int> answer(n);\n        int running = 0;\n        for (int i = 0; i < n; ++i) {\n            running += diff[i];\n            answer[i] = running;\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "fenwick",
    planKeys: ["data_structure"],
    keywords: ["樹狀陣列", "Fenwick", "BIT", "動態前綴"],
    modelProblem:
      "維護一個陣列，支援 `add(index, delta)` 單點加值與 `rangeSum(left, right)` 區間和查詢。",
    signals: ["單點更新。", "前綴查詢。", "逆序對。", "動態排名。"],
    invariants: [
      "`tree[index]` 保存一段長度為 lowbit(index) 的區間和。",
      "更新沿樹往上跳，查詢沿樹往下跳。",
    ],
    derivation: [
      "內部採 1-index，使 `index & -index` 表示節點管理的區間長度。",
      "單點更新時，所有覆蓋該點的桶皆需加 delta。",
      "區間和由兩個前綴和相減得到。",
    ],
    patterns: ["單點加、區間和", "離散化 + 排名", "逆序對", "樹狀陣列二分"],
    pitfalls: ["0-index 直接套 lowbit 會陷入死循環。", "值域大時須先離散化。"],
    complexity: "更新與查詢皆為 `O(log n)`，空間 `O(n)`。",
    code: "```cpp\nclass Fenwick {\n    vector<long long> tree_;\n\npublic:\n    explicit Fenwick(int n) : tree_(n + 1, 0) {}\n\n    void add(int index, long long delta) {\n        for (++index; index < (int)tree_.size(); index += index & -index) {\n            tree_[index] += delta;\n        }\n    }\n\n    long long prefixSum(int index) const {\n        long long sum = 0;\n        for (++index; index > 0; index -= index & -index) {\n            sum += tree_[index];\n        }\n        return sum;\n    }\n\n    long long rangeSum(int left, int right) const {\n        return prefixSum(right) - (left == 0 ? 0 : prefixSum(left - 1));\n    }\n};\n```",
  },
  {
    key: "dsu",
    planKeys: ["data_structure", "graph"],
    keywords: ["並查集", "DSU", "Union Find", "最小生成樹", "Kruskal"],
    modelProblem:
      "給定 n 個點與一批逐步加入的無向邊，維護連通分量、判斷兩點是否連通，或判定加入一條邊是否形成 cycle。",
    signals: ["逐步加邊。", "合併集合。", "連通性。", "判斷成環。", "Kruskal。"],
    invariants: [
      "每個集合僅有一個代表元。",
      "同一集合內任兩點已由先前加入的邊連通。",
    ],
    derivation: [
      "初始時每個點自成集合。",
      "加入邊 `(u, v)` 時先找兩端代表元。",
      "若代表元相同，此邊將形成 cycle；否則合併兩個集合。",
    ],
    patterns: ["動態加邊連通性", "Kruskal MST", "冗餘邊", "帶權並查集"],
    pitfalls: ["普通 DSU 不支援刪邊。", "若題目詢問最短路或路徑內容，DSU 不足以勝任。"],
    complexity: "每次 `find/unite` 均攤近似 `O(1)`。",
    code: "```cpp\nclass Dsu {\n    vector<int> parent_;\n    vector<int> size_;\n\npublic:\n    explicit Dsu(int n) : parent_(n), size_(n, 1) {\n        iota(parent_.begin(), parent_.end(), 0);\n    }\n\n    int find(int x) {\n        if (parent_[x] == x) return x;\n        return parent_[x] = find(parent_[x]);\n    }\n\n    bool unite(int a, int b) {\n        int root_a = find(a);\n        int root_b = find(b);\n        if (root_a == root_b) return false;\n        if (size_[root_a] < size_[root_b]) swap(root_a, root_b);\n        parent_[root_b] = root_a;\n        size_[root_a] += size_[root_b];\n        return true;\n    }\n};\n```",
  },
  {
    key: "monotonic-stack",
    planKeys: ["monotonic_stack", "data_structure"],
    keywords: [
      "單調",
      "堆疊",
      "下一個更大",
      "下一個更小",
      "矩形",
      "貢獻法",
      "字典序",
    ],
    modelProblem:
      "給定序列，找出每個元素左右第一個比它大或小的位置，或計算每個元素作為區間極值時可覆蓋多少子陣列。",
    signals: [
      "第一個更大或更小。",
      "最近邊界。",
      "直方圖。",
      "子陣列最小值總和。",
      "字典序最小。",
    ],
    invariants: [
      "棧內 index 對應的值保持單調。",
      "當新元素破壞單調性，被彈出的元素即確定右邊界。",
    ],
    derivation: [
      "決定棧為遞增或遞減，並決定相等元素保留哪一側。",
      "掃描到 i 時，彈出所有被 `nums[i]` 解決的舊 index。",
      "彈出時更新答案；最終未彈出的元素代表右側無破壞者。",
    ],
    patterns: [
      "Next Greater Element",
      "直方圖最大矩形",
      "貢獻法",
      "最小字典序 subsequence",
    ],
    pitfalls: [
      "貢獻法中相等元素必須一側嚴格、一側非嚴格。",
      "需要距離時應存 index，不可僅存 value。",
    ],
    complexity: "每個元素至多入棧與出棧一次，總時間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> nextGreaterElement(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> answer(n, -1);\n        vector<int> stack;\n\n        for (int i = 0; i < n; ++i) {\n            while (!stack.empty() && nums[stack.back()] < nums[i]) {\n                answer[stack.back()] = i;\n                stack.pop_back();\n            }\n            stack.push_back(i);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "sliding-window",
    planKeys: ["sliding_window"],
    keywords: [
      "滑動",
      "越短越合法",
      "越長越合法",
      "恰好",
      "求子陣列個數",
      "基礎",
      "進階",
    ],
    modelProblem:
      "給定陣列或字串，於連續窗口上維護計數、總和或種類數，求最長合法窗口、最短合法窗口或合法子陣列數量。",
    signals: [
      "連續子陣列或子字串。",
      "右端加入、左端移除後可更新狀態。",
      "最多/至少/恰好 k。",
    ],
    invariants: [
      "窗口 `[left, right]` 保存目前考慮的連續區間。",
      "移動 left 旨在恢復或打破合法性。",
    ],
    derivation: [
      "右端逐步擴張，加入新元素並更新窗口狀態。",
      "當窗口不符合題型條件時，移動左端並撤銷離開元素。",
      "對每個 right，依窗口長度或可選 left 數量累加答案。",
    ],
    patterns: [
      "固定長度窗口",
      "最長合法窗口",
      "最短覆蓋窗口",
      "恰好 K = atMost(K) - atMost(K-1)",
    ],
    pitfalls: [
      "若陣列含負數，和的單調性可能不存在。",
      "計數題須明確每個 right 貢獻多少個子陣列。",
    ],
    complexity: "左右指標各掃過一次，時間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long atMostKDistinct(vector<int>& nums, int k) {\n        unordered_map<int, int> count;\n        long long answer = 0;\n        int left = 0;\n\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            if (count[nums[right]]++ == 0) k--;\n            while (k < 0) {\n                if (--count[nums[left]] == 0) k++;\n                left++;\n            }\n            answer += right - left + 1;\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "knapsack",
    planKeys: ["dynamic_programming"],
    keywords: ["背包", "0-1", "完全背包", "多重背包", "分組背包"],
    modelProblem:
      "給定物品重量、價值與容量限制，在不同選取規則下最大化價值、判斷可行或計算方案數。",
    signals: ["容量限制。", "每個物品至多一次或可重複選。", "方案數。", "分組選擇。"],
    invariants: [
      "`dp[cap]` 表示目前處理過的物品在容量 cap 下的最佳值。",
      "0-1 背包倒序枚舉容量，藉以避免同一物品重複使用。",
    ],
    derivation: [
      "對每個物品僅有選或不選兩種決策。",
      "若選，狀態源自 `cap - weight`。",
      "0-1 採倒序、完全背包採正序，差別在於是否允許同輪重複使用物品。",
    ],
    patterns: ["0-1 背包", "完全背包", "分組背包", "方案數背包"],
    pitfalls: [
      "容量迴圈方向錯誤會改變選取規則。",
      "方案數題通常初始化 `dp[0] = 1`。",
    ],
    complexity: "`O(n * capacity)` 時間，`O(capacity)` 空間。",
    code: "```cpp\nclass Solution {\npublic:\n    int zeroOneKnapsack(vector<int>& weights, vector<int>& values, int capacity) {\n        vector<int> dp(capacity + 1, 0);\n        for (int i = 0; i < (int)weights.size(); ++i) {\n            for (int cap = capacity; cap >= weights[i]; --cap) {\n                dp[cap] = max(dp[cap], dp[cap - weights[i]] + values[i]);\n            }\n        }\n        return dp[capacity];\n    }\n};\n```",
  },
  {
    key: "grid-dp",
    planKeys: ["dynamic_programming", "grid"],
    keywords: ["網格圖 DP", "網格 DP", "矩陣", "路徑數", "最小路徑"],
    modelProblem:
      "給定二維網格，移動方向通常受限於向右、向下或固定鄰格，計算到達每格的方案數、最小代價或最大收益。",
    signals: ["二維矩陣。", "每格答案由上方或左方轉移。", "路徑僅能依固定方向前進。"],
    invariants: [
      "`dp[row][col]` 表示到達或處理該格時的最佳答案。",
      "填表順序必須確保轉移來源已計算完成。",
    ],
    derivation: [
      "先定義起點與障礙格的初始化方式。",
      "逐列或逐行掃描，每格自合法前驅轉移。",
      "若移動方向會形成環，應改用 BFS/Dijkstra，而非一次 DP。",
    ],
    patterns: ["路徑計數", "最小路徑和", "帶障礙網格 DP", "滾動陣列壓縮"],
    pitfalls: [
      "第一列與第一行的邊界須單獨處理。",
      "可上下左右任意走的最短路並非普通網格 DP。",
    ],
    complexity: "`O(rows * cols)` 時間，空間可壓至 `O(cols)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int minPathSum(vector<vector<int>>& grid) {\n        int rows = grid.size();\n        int cols = grid[0].size();\n        vector<vector<int>> dp(rows, vector<int>(cols, INT_MAX / 2));\n        dp[0][0] = grid[0][0];\n\n        for (int row = 0; row < rows; ++row) {\n            for (int col = 0; col < cols; ++col) {\n                if (row > 0) dp[row][col] = min(dp[row][col], dp[row - 1][col] + grid[row][col]);\n                if (col > 0) dp[row][col] = min(dp[row][col], dp[row][col - 1] + grid[row][col]);\n            }\n        }\n        return dp[rows - 1][cols - 1];\n    }\n};\n```",
  },
  {
    key: "dp-linear",
    planKeys: ["dynamic_programming"],
    keywords: [
      "DP",
      "入門 DP",
      "爬樓梯",
      "打家劫舍",
      "最大子陣列",
      "線性 DP",
      "LIS",
      "LCS",
      "劃分",
    ],
    modelProblem:
      "給定依 index 推進的序列，定義 `dp[i]` 表示前 i 個元素的最佳值、可行性或方案數，並由先前狀態轉移。",
    signals: ["前 i 個。", "選或不選。", "最後一步。", "子序列。", "切分。"],
    invariants: [
      "計算 `dp[i]` 時，其依賴的狀態皆已計算完成。",
      "`dp` 的語意須能完整描述未來所需資訊。",
    ],
    derivation: [
      "先以暴力遞迴描述最後一步。",
      "找出重複子問題，將遞迴參數轉為 dp 維度。",
      "依依賴順序填表，再視情況壓縮空間。",
    ],
    patterns: ["take/skip", "Kadane 最大子段和", "LIS tails 陣列", "劃分 DP"],
    pitfalls: [
      "全負數最大子段和不可將空段當作答案。",
      "子序列與子陣列的連續性不同。",
    ],
    complexity: "視轉移而定；常見線性 DP 為 `O(n)`，LIS 優化為 `O(n log n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        int skip = 0;\n        int take = 0;\n        for (int money : nums) {\n            int next_take = skip + money;\n            int next_skip = max(skip, take);\n            take = next_take;\n            skip = next_skip;\n        }\n        return max(skip, take);\n    }\n};\n```",
  },
  {
    key: "graph-bfs-dfs",
    planKeys: ["graph", "grid"],
    keywords: [
      "DFS",
      "BFS",
      "深度優先",
      "廣度優先",
      "連通",
      "Flood fill",
      "網格圖 BFS",
      "網格圖 DFS",
    ],
    modelProblem:
      "給定圖或網格，找出所有可達節點、統計連通塊，或在每條邊代價相同時求最短步數。",
    signals: ["可達性。", "連通塊。", "島嶼。", "等權最短路。", "層序。"],
    invariants: [
      "BFS 首次到達某狀態即為距離最短。",
      "DFS/BFS 每個狀態僅應於首次訪問時處理。",
    ],
    derivation: [
      "將格子或物件轉為節點，合法移動轉為邊。",
      "若僅詢問連通，使用 DFS/BFS 走完整個 component。",
      "若詢問最短步數且邊權相同，使用 queue 按層擴張。",
    ],
    patterns: ["連通塊 DFS", "多源 BFS", "二分圖染色", "狀態 BFS"],
    pitfalls: [
      "狀態含鑰匙、剩餘資源或時間時，visited 亦須涵蓋這些維度。",
      "大圖遞迴 DFS 可能爆棧。",
    ],
    complexity: "顯式圖 `O(V + E)`；網格 `O(rows * cols * state_count)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {\n        int rows = mat.size();\n        int cols = mat[0].size();\n        const int kDirs[5] = {1, 0, -1, 0, 1};\n        vector<vector<int>> dist(rows, vector<int>(cols, -1));\n        queue<pair<int, int>> q;\n\n        for (int row = 0; row < rows; ++row) {\n            for (int col = 0; col < cols; ++col) {\n                if (mat[row][col] == 0) {\n                    dist[row][col] = 0;\n                    q.push({row, col});\n                }\n            }\n        }\n\n        while (!q.empty()) {\n            auto [row, col] = q.front();\n            q.pop();\n            for (int dir = 0; dir < 4; ++dir) {\n                int next_row = row + kDirs[dir];\n                int next_col = col + kDirs[dir + 1];\n                if (next_row < 0 || next_row >= rows || next_col < 0 || next_col >= cols) continue;\n                if (dist[next_row][next_col] != -1) continue;\n                dist[next_row][next_col] = dist[row][col] + 1;\n                q.push({next_row, next_col});\n            }\n        }\n        return dist;\n    }\n};\n```",
  },
  {
    key: "topological-dp",
    planKeys: ["graph"],
    keywords: ["拓撲", "DAG", "依賴", "拓撲序"],
    modelProblem:
      "給定 n 個任務、每個任務耗時與依賴關係 `[u, v]`（表示 u 必須在 v 前完成），判斷是否有 cycle，並求完成所有任務的最早時間。",
    signals: ["有向依賴。", "先修課。", "任務排程。", "DAG 上 DP。"],
    invariants: [
      "入度為 0 代表所有前置條件已處理。",
      "於拓撲序中處理節點時，所有前驅 DP 值已確定。",
    ],
    derivation: [
      "建立 `u -> v` 的有向邊與 indegree。",
      "所有 indegree 為 0 的任務可立即開始。",
      "處理 u 時，以 `finish[u] + time[v]` 更新 v 的最早完成時間。",
      "若處理節點數少於 n，代表依賴成環。",
    ],
    patterns: ["Kahn 拓撲排序", "DAG 最長路", "課程表", "依賴排程"],
    pitfalls: [
      "邊方向寫反會使 DP 語意錯誤。",
      "存在 cycle 時不可僅回傳最大 finish，必須標記無解。",
    ],
    complexity: "`O(V + E)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {\n        vector<vector<int>> graph(n);\n        vector<int> indegree(n, 0);\n        vector<int> finish(n, 0);\n        for (auto& edge : relations) {\n            int from = edge[0] - 1;\n            int to = edge[1] - 1;\n            graph[from].push_back(to);\n            indegree[to]++;\n        }\n\n        queue<int> q;\n        for (int node = 0; node < n; ++node) {\n            finish[node] = time[node];\n            if (indegree[node] == 0) q.push(node);\n        }\n\n        int seen = 0;\n        while (!q.empty()) {\n            int node = q.front();\n            q.pop();\n            seen++;\n            for (int next_node : graph[node]) {\n                finish[next_node] = max(finish[next_node], finish[node] + time[next_node]);\n                if (--indegree[next_node] == 0) q.push(next_node);\n            }\n        }\n        return seen == n ? *max_element(finish.begin(), finish.end()) : -1;\n    }\n};\n```",
  },
  {
    key: "dijkstra",
    planKeys: ["graph", "grid"],
    keywords: ["Dijkstra", "最短路", "分層圖", "0-1 BFS", "SPFA", "Floyd"],
    modelProblem:
      "給定非負權圖，求起點到其他點的最短距離；若題目含折扣、剩餘資源或時間狀態，須將狀態擴展為分層圖。",
    signals: ["邊權非負。", "最小代價。", "狀態含額外資源。", "最短路。"],
    invariants: [
      "priority queue 每次取出的最小距離狀態即已定型。",
      "鬆弛僅於找到更短距離時更新。",
    ],
    derivation: [
      "建立鄰接表，邊保存 `(to, weight)`。",
      "距離初始化為無限大，起點距離設為 0。",
      "每次取出目前距離最小的狀態，鬆弛所有出邊。",
    ],
    patterns: ["Dijkstra", "0-1 BFS", "分層圖最短路", "反圖 Dijkstra"],
    pitfalls: [
      "存在負權時不可使用 Dijkstra。",
      "額外資源會影響未來時，不可僅以 node 作為狀態。",
    ],
    complexity: "`O((V + E) log V)`；分層圖須乘上狀態層數。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& graph, int source) {\n        constexpr long long kInf = 4e18;\n        vector<long long> dist(n, kInf);\n        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n        dist[source] = 0;\n        pq.push({0, source});\n\n        while (!pq.empty()) {\n            auto [current_dist, node] = pq.top();\n            pq.pop();\n            if (current_dist != dist[node]) continue;\n            for (auto [next_node, weight] : graph[node]) {\n                if (dist[next_node] > current_dist + weight) {\n                    dist[next_node] = current_dist + weight;\n                    pq.push({dist[next_node], next_node});\n                }\n            }\n        }\n        return dist;\n    }\n};\n```",
  },
  {
    key: "mst",
    planKeys: ["graph"],
    keywords: ["最小生成樹", "Kruskal", "Prim", "生成樹"],
    modelProblem:
      "給定無向加權圖，選出 `n - 1` 條邊連通所有點並使總權重最小；若無法連通所有點則回傳無解。",
    signals: ["無向圖。", "連通所有點。", "總成本最小。", "選 n-1 條邊。"],
    invariants: [
      "Kruskal 掃描到某邊時，所有更小的邊皆已被考慮。",
      "DSU 確保加入的邊不會使目前森林成環。",
    ],
    derivation: [
      "將所有邊整理為 `(weight, from, to)`。",
      "依權重由小至大排序。",
      "若邊連接兩個不同連通塊，即選取並合併。",
      "最終若選取 `n - 1` 條邊即為 MST。",
    ],
    patterns: ["Kruskal + DSU", "Prim + heap", "最大生成樹", "瓶頸生成樹"],
    pitfalls: ["有向圖不可直接套用 MST。", "邊權排序鍵寫錯會破壞貪心。"],
    complexity: "Kruskal 時間 `O(E log E)`，空間 `O(V + E)`。",
    code: "```cpp\nclass Dsu {\n    vector<int> parent_;\n    vector<int> size_;\n\npublic:\n    explicit Dsu(int n) : parent_(n), size_(n, 1) {\n        iota(parent_.begin(), parent_.end(), 0);\n    }\n\n    int find(int x) {\n        if (parent_[x] == x) return x;\n        return parent_[x] = find(parent_[x]);\n    }\n\n    bool unite(int a, int b) {\n        int root_a = find(a);\n        int root_b = find(b);\n        if (root_a == root_b) return false;\n        if (size_[root_a] < size_[root_b]) swap(root_a, root_b);\n        parent_[root_b] = root_a;\n        size_[root_a] += size_[root_b];\n        return true;\n    }\n};\n\nclass Solution {\npublic:\n    long long minimumSpanningTree(int n, vector<array<int, 3>>& edges) {\n        sort(edges.begin(), edges.end()); // {weight, from, to}\n        Dsu dsu(n);\n        long long total = 0;\n        int picked = 0;\n        for (auto [weight, from, to] : edges) {\n            if (dsu.unite(from, to)) {\n                total += weight;\n                picked++;\n            }\n        }\n        return picked == n - 1 ? total : -1;\n    }\n};\n```",
  },
  {
    key: "low-link",
    planKeys: ["graph"],
    keywords: [
      "強連通",
      "雙連通",
      "SCC",
      "Bridge",
      "割邊",
      "割點",
      "Tarjan",
      "low",
    ],
    modelProblem:
      "給定圖，找出有向圖中的強連通分量，或找出無向圖中移除後會使連通塊增加的橋。",
    signals: ["互相可達。", "critical connections。", "刪邊是否斷開。", "low-link。"],
    invariants: [
      "`dfn[u]` 為首次訪問時間。",
      "`low[u]` 為 u 子樹能回到的最早 dfn。",
    ],
    derivation: [
      "DFS 時記錄每個點的 `dfn` 與 `low`。",
      "回溯時以 child 的 low 更新 parent。",
      "若無向 DFS tree edge `(u, v)` 滿足 `low[v] > dfn[u]`，即為橋。",
    ],
    patterns: ["Tarjan bridge", "Tarjan SCC", "割點", "縮點 DAG"],
    pitfalls: [
      "無向圖找橋須使用 edge id，避免將父邊誤認為回邊。",
      "SCC 為有向圖概念，不等同無向連通塊。",
    ],
    complexity: "`O(V + E)`。",
    code: "```cpp\nclass Solution {\n    vector<vector<pair<int, int>>> graph_;\n    vector<int> dfn_;\n    vector<int> low_;\n    vector<vector<int>> bridges_;\n    int timer_ = 0;\n\n    void dfs(int node, int parent_edge) {\n        dfn_[node] = low_[node] = ++timer_;\n        for (auto [next_node, edge_id] : graph_[node]) {\n            if (edge_id == parent_edge) continue;\n            if (dfn_[next_node] == 0) {\n                dfs(next_node, edge_id);\n                low_[node] = min(low_[node], low_[next_node]);\n                if (low_[next_node] > dfn_[node]) {\n                    bridges_.push_back({node, next_node});\n                }\n            } else {\n                low_[node] = min(low_[node], dfn_[next_node]);\n            }\n        }\n    }\n};\n```",
  },
  {
    key: "network-flow",
    planKeys: ["graph"],
    keywords: ["網路流", "最大流", "最小割", "二分圖匹配", "費用流"],
    modelProblem:
      "給定 source、sink 與帶容量的邊，求最大可傳輸流量；二分圖匹配與最小割亦常可轉為最大流模型。",
    signals: ["容量限制。", "source/sink。", "匹配。", "割。", "流量守恆。"],
    invariants: [
      "每條正向邊皆配有一條反向邊以表示可撤銷流量。",
      "Dinic 的 DFS 僅沿分層圖中 level 遞增一層的邊進行增廣。",
    ],
    derivation: [
      "將每個實體拆為節點，容量限制拆為邊。",
      "BFS 建立 source 到各點的 level。",
      "DFS 於分層圖上送流，直至 sink 不可達。",
    ],
    patterns: ["Dinic 最大流", "二分圖匹配", "最小割建模", "費用流"],
    pitfalls: ["容量方向錯誤會改變問題。", "反向邊缺失會導致無法撤銷錯誤增廣。"],
    complexity: "Dinic 複雜度視圖性質而定，二分圖匹配場合通常表現穩定。",
    code: "```cpp\nstruct Edge {\n    int to;\n    int rev;\n    long long cap;\n};\n\nclass Dinic {\n    vector<vector<Edge>> graph_;\n    vector<int> level_;\n    vector<int> iter_;\n\npublic:\n    explicit Dinic(int n) : graph_(n), level_(n), iter_(n) {}\n\n    void addEdge(int from, int to, long long cap) {\n        Edge forward{to, (int)graph_[to].size(), cap};\n        Edge backward{from, (int)graph_[from].size(), 0};\n        graph_[from].push_back(forward);\n        graph_[to].push_back(backward);\n    }\n};\n```",
  },
  {
    key: "greedy-interval",
    planKeys: ["greedy"],
    keywords: ["區間", "不相交", "分組", "選點", "覆蓋", "合併"],
    modelProblem:
      "給定一批區間 `[start, end]`，選出最多不重疊區間、以最少點覆蓋所有區間，或合併重疊區間。",
    signals: ["區間端點。", "不重疊。", "覆蓋。", "會議室。", "最少箭。"],
    invariants: [
      "按右端點排序時，先選最早結束的區間可保留最大後續空間。",
      "掃描過程中 `last_end` 為已選集合的最右邊界。",
    ],
    derivation: [
      "依右端點排序。",
      "若當前區間左端點不早於 `last_end` 即可選取。",
      "選擇右端點最早的區間可由交換論證證明：替換後不會減少後續可選區間。",
    ],
    patterns: ["最多不重疊區間", "區間分組", "區間覆蓋", "合併區間"],
    pitfalls: [
      "閉區間與半開區間會影響使用 `>=` 或 `>`。",
      "覆蓋問題未必可直接按右端點選取。",
    ],
    complexity: "排序 `O(n log n)`，掃描 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n        sort(intervals.begin(), intervals.end(), [](const auto& lhs, const auto& rhs) {\n            return lhs[1] < rhs[1];\n        });\n\n        int kept = 0;\n        int last_end = INT_MIN;\n        for (const auto& interval : intervals) {\n            if (interval[0] >= last_end) {\n                kept++;\n                last_end = interval[1];\n            }\n        }\n        return intervals.size() - kept;\n    }\n};\n```",
  },
  {
    key: "math-number-theory",
    planKeys: ["math"],
    keywords: [
      "質數",
      "篩",
      "質因數",
      "因子",
      "GCD",
      "LCM",
      "互質",
      "同餘",
      "數論分塊",
    ],
    modelProblem:
      "給定整數與整除條件，判斷質數、分解質因數、計算 gcd/lcm，或利用同餘關係統計答案。",
    signals: ["整除。", "質數。", "因數。", "最大公約數。", "模。", "週期。"],
    invariants: [
      "Euclid 中 `gcd(a, b) = gcd(b, a % b)`。",
      "篩法中每個合數皆會被某個質因數標記。",
    ],
    derivation: [
      "先判斷為單次查詢或多次查詢。",
      "多次質因數分解時預處理最小質因數 SPF。",
      "將題目限制轉為 gcd、餘數或質因數指數的條件。",
    ],
    patterns: ["Euclid", "質數篩", "SPF 分解", "模運算", "容斥前的數論化簡"],
    pitfalls: [
      "`lcm(a,b)` 須先除以 gcd 再乘以避免溢位。",
      "模除法要求除數可逆。",
    ],
    complexity: "Euclid `O(log V)`；篩法 `O(n log log n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long gcdLl(long long a, long long b) {\n        while (b != 0) {\n            long long next_a = b;\n            long long next_b = a % b;\n            a = next_a;\n            b = next_b;\n        }\n        return a;\n    }\n\n    long long lcmLl(long long a, long long b) {\n        return a / gcdLl(a, b) * b;\n    }\n};\n```",
  },
  {
    key: "kmp",
    planKeys: ["string"],
    keywords: ["KMP", "字首的字尾", "border", "前綴函數"],
    modelProblem:
      "給定文字 `text` 與模式字串 `pattern`，於線性時間找出 pattern 在 text 中所有出現位置。",
    signals: ["固定 pattern。", "前後綴。", "border。", "週期。", "大量匹配。"],
    invariants: [
      "`pi[i]` 為 `pattern[0..i]` 的最長相等真前後綴長度。",
      "失配時保留仍可能匹配的最長 border。",
    ],
    derivation: [
      "先對 pattern 建 prefix function。",
      "掃描 text 時，以 matched 表示目前匹配的 pattern 前綴長度。",
      "失配時沿 `pi[matched - 1]` 回退，而非自頭開始。",
    ],
    patterns: ["KMP 匹配", "border tree", "週期判斷", "字串出現次數統計"],
    pitfalls: [
      "找到一次完整匹配後須回退，否則將漏掉重疊匹配。",
      "pi 的語意不同於 Z function。",
    ],
    complexity: "`O(n + m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> prefixFunction(const string& pattern) {\n        vector<int> pi(pattern.size());\n        for (int i = 1; i < (int)pattern.size(); ++i) {\n            int matched = pi[i - 1];\n            while (matched > 0 && pattern[i] != pattern[matched]) {\n                matched = pi[matched - 1];\n            }\n            if (pattern[i] == pattern[matched]) matched++;\n            pi[i] = matched;\n        }\n        return pi;\n    }\n};\n```",
  },
  {
    key: "tree-linked-binary",
    planKeys: ["trees"],
    keywords: [
      "連結串列",
      "二叉樹",
      "遍歷",
      "反轉",
      "快慢指標",
      "直徑",
      "最近公共祖先",
      "二叉搜索樹",
      "回溯",
    ],
    modelProblem:
      "給定鏈結串列或二元樹，藉由指標操作、前序傳遞狀態與後序合併子樹資訊，完成反轉、刪除、路徑或子樹問題。",
    signals: [
      "ListNode。",
      "TreeNode。",
      "head 可能改變。",
      "子樹資訊。",
      "路徑。",
      "LCA。",
    ],
    invariants: [
      "鏈表操作前須保存即將斷開的 next。",
      "二元樹後序 DFS 的回傳值即為當前子樹提供給父節點的資訊。",
    ],
    derivation: [
      "鏈表題先描繪每個指標於修改前後的指向。",
      "二元樹題先定義 DFS 回傳值，例如高度、最大單邊路徑或是否平衡。",
      "於回溯階段合併左右子樹並更新全域答案。",
    ],
    patterns: [
      "dummy node",
      "快慢指標",
      "鏈表反轉",
      "二元樹前序/後序",
      "LCA",
      "回溯",
    ],
    pitfalls: [
      "更改 `next` 前未保存後繼將丟失鏈表後半段。",
      "路徑題須分清向下路徑與任意兩點路徑。",
    ],
    complexity: "通常 `O(n)` 時間；鏈表額外空間 `O(1)`，樹遞迴棧 `O(height)`。",
    code: "```cpp\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n};\n\nclass Solution {\n    int answer_ = 0;\n\n    int depth(TreeNode* node) {\n        if (node == nullptr) return 0;\n        int left_depth = depth(node->left);\n        int right_depth = depth(node->right);\n        answer_ = max(answer_, left_depth + right_depth);\n        return max(left_depth, right_depth) + 1;\n    }\n\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        depth(root);\n        return answer_;\n    }\n};\n```",
  },
  {
    key: "bitwise-contribution",
    planKeys: ["bitwise_operations"],
    keywords: ["位元", "XOR", "異或", "AND", "OR", "拆位", "貢獻", "試填"],
    modelProblem:
      "給定一組整數，利用每個 bit 的獨立性計算 XOR/OR/AND 的總貢獻，或自高位至低位構造最大可行答案。",
    signals: [
      "整數可拆為二進位。",
      "題目出現 XOR、OR、AND。",
      "答案可逐 bit 判斷。",
      "值域 bit 數固定。",
    ],
    invariants: [
      "逐 bit 貢獻中，每一位可獨立計算後乘上 `2^bit`。",
      "XOR 某位為 1 等價於兩個數在該位不同。",
      "高位貪心中，已決定的高位不受低位影響。",
    ],
    derivation: [
      "先判斷為 pair、subarray 或 subset 問題。",
      "若為 pair XOR，統計每一 bit 的 0/1 個數。",
      "若為最大 XOR，自高位至低位嘗試將答案該位設為 1，再檢查是否存在兩個前綴可達成。",
    ],
    patterns: ["逐 bit 貢獻", "高位試填", "狀態壓縮 DP", "線性基"],
    pitfalls: [
      "`1 << bit` 可能溢位，較大值域須使用 `1LL << bit`。",
      "XOR 的計數公式不可直接套用於 OR/AND。",
    ],
    complexity: "常見為 `O(n * B)`，`B` 為 bit 數。",
    code: "```cpp\nclass Solution {\npublic:\n    long long pairXorSum(vector<int>& nums) {\n        long long answer = 0;\n        for (int bit = 0; bit < 31; ++bit) {\n            long long ones = 0;\n            for (int x : nums) {\n                ones += (x >> bit) & 1;\n            }\n            long long zeros = nums.size() - ones;\n            answer += ones * zeros * (1LL << bit);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "linear-basis",
    planKeys: ["bitwise_operations"],
    keywords: ["線性基", "基向量", "子集異或", "最大異或"],
    modelProblem:
      "給定一組整數，維護其在 XOR 意義下生成的線性空間，用以求任意子集 XOR 的最大值、判斷某值是否可表示，或計算線性獨立的秩。",
    signals: ["子集 XOR。", "最大異或值。", "線性獨立。", "可表示性。", "基向量。"],
    invariants: [
      "`basis[bit]` 若非 0，表示目前已有最高位為 bit 的基向量。",
      "插入新數時持續以已有最高位基向量消去最高位。",
      "若最終 x 變為 0，代表其可由既有基向量表示。",
    ],
    derivation: [
      "將每個數視為 GF(2) 上的 bit 向量。",
      "自高位往低位檢視，若該位已有基向量則 XOR 消去。",
      "若該位無基向量，將目前 x 放入該位，使每個最高位僅有一個代表。",
      "求最大 XOR 時，自高位往低位嘗試 `answer ^ basis[bit]` 是否變大。",
    ],
    patterns: [
      "最大子集 XOR",
      "判斷 XOR 可表示",
      "線性基合併",
      "帶刪除限制時改用可持久化或離線技巧",
    ],
    pitfalls: [
      "線性基僅適用 XOR 線性空間，不適用 OR/AND。",
      "bit 上限須依值域決定，`long long` 通常取 60 至 62 位。",
    ],
    complexity: "每次插入或查詢 `O(B)`，`B` 為 bit 數。",
    code: "```cpp\nclass XorBasis {\n    static constexpr int kMaxBit = 60;\n    array<long long, kMaxBit + 1> basis_{};\n\npublic:\n    void insert(long long x) {\n        for (int bit = kMaxBit; bit >= 0; --bit) {\n            if (((x >> bit) & 1LL) == 0) continue;\n            if (basis_[bit] == 0) {\n                basis_[bit] = x;\n                return;\n            }\n            x ^= basis_[bit];\n        }\n    }\n\n    long long maxXor() const {\n        long long answer = 0;\n        for (int bit = kMaxBit; bit >= 0; --bit) {\n            answer = max(answer, answer ^ basis_[bit]);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "greedy-general",
    planKeys: ["greedy", "rating_2100", "data_structure"],
    keywords: [
      "貪心",
      "最小",
      "最大",
      "反悔",
      "反悔堆",
      "反悔貪心",
      "字典序",
      "相鄰不同",
      "交換論證",
      "排序不等式",
      "乘積",
    ],
    modelProblem:
      "給定一批候選決策，先排序或維護候選集合，每一步做出一個可由交換論證證明安全的局部選擇。",
    signals: [
      "局部選擇會影響後續空間。",
      "可排序。",
      "超限後移除最差候選。",
      "要求字典序最小或最大。",
    ],
    invariants: [
      "已選集合始終可擴展為某個最優解。",
      "若採反悔 heap，heap 中保存目前被暫時接受的候選。",
      "超出限制時，移除已選集合中最不值得保留的元素。",
    ],
    derivation: [
      "先找出排序鍵，使限制依掃描順序逐步變化。",
      "掃描時將當前候選加入集合。",
      "若集合違反限制，移除成本最大或收益最小的候選以維持可行性。",
    ],
    patterns: ["交換論證", "反悔貪心", "字典序貪心", "構造貪心"],
    pitfalls: [
      "僅言「每次選最小」並非證明。",
      "反悔貪心必須說明被移除者永不比留下者更值得保留。",
    ],
    complexity: "通常排序 `O(n log n)`，每個候選進出 heap 一次。",
    code: "```cpp\nclass Solution {\npublic:\n    int scheduleCourse(vector<vector<int>>& courses) {\n        sort(courses.begin(), courses.end(), [](const auto& lhs, const auto& rhs) {\n            return lhs[1] < rhs[1];\n        });\n\n        priority_queue<int> chosen_durations;\n        int used_time = 0;\n        for (const auto& course : courses) {\n            int duration = course[0];\n            int last_day = course[1];\n            used_time += duration;\n            chosen_durations.push(duration);\n            if (used_time > last_day) {\n                used_time -= chosen_durations.top();\n                chosen_durations.pop();\n            }\n        }\n        return chosen_durations.size();\n    }\n};\n```",
  },
  {
    key: "manacher",
    planKeys: ["string"],
    keywords: ["Manacher", "迴文", "中心擴展"],
    modelProblem:
      "給定字串 `s`，於線性時間求出每個中心的最長迴文半徑，進而計算最長迴文子串或迴文子串數量。",
    signals: ["回文子串。", "每個中心。", "最長迴文。", "中心擴展過慢。"],
    invariants: [
      "目前維護的 `[left, right]` 為已知最靠右的迴文區間。",
      "若 i 落於區間內，可由鏡射點 `left + right - i` 提供初始半徑。",
      "半徑延伸停止時，該中心的最大回文範圍即已確定。",
    ],
    derivation: [
      "決定奇偶分開處理，或插入分隔符統一處理。",
      "對每個中心 i，若其位於最右迴文區間內，先以鏡射半徑取下界。",
      "再向左右暴力延伸；成功延伸的總次數位於線性範圍內。",
      "若新迴文右端更遠，更新最右區間。",
    ],
    patterns: [
      "奇長 Manacher",
      "偶長 Manacher",
      "最長回文子串",
      "回文子串計數",
    ],
    pitfalls: [
      "半徑定義不同會影響答案換算。",
      "使用分隔符版本時，原字串 index 與處理後 index 須分清。",
    ],
    complexity: "`O(n)` 時間與 `O(n)` 空間。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> manacherOdd(const string& s) {\n        int n = s.size();\n        vector<int> radius(n);\n        int left = 0;\n        int right = -1;\n        for (int i = 0; i < n; ++i) {\n            int k = (i > right) ? 1 : min(radius[left + right - i], right - i + 1);\n            while (0 <= i - k && i + k < n && s[i - k] == s[i + k]) k++;\n            radius[i] = k--;\n            if (i + k > right) {\n                left = i - k;\n                right = i + k;\n            }\n        }\n        return radius;\n    }\n};\n```",
  },
  {
    key: "string-tools",
    planKeys: ["string"],
    keywords: [
      "Z 函式",
      "Manacher",
      "迴文",
      "雜湊",
      "字典樹",
      "AC 自動機",
      "後綴",
      "子序列自動機",
      "最小表示",
    ],
    modelProblem:
      "給定字串與大量比較或匹配需求，選用 KMP/Z/Manacher/hash/Trie 等工具，將原本重複的字元比較降為線性或近似常數查詢。",
    signals: [
      "固定 pattern 匹配。",
      "多 pattern。",
      "回文半徑。",
      "任意子串比較。",
      "前綴或後綴重複比較。",
    ],
    invariants: [
      "Z 函式維護最右匹配盒 `[left, right]`。",
      "Manacher 維護最右回文區間，利用鏡射中心得到初始半徑。",
      "Rolling hash 的同長度子串可由標準化 hash 比較。",
    ],
    derivation: [
      "先判定昂貴操作屬於哪一類字串比較。",
      "若比較 pattern 與 text，使用 KMP 或 Z。",
      "若比較任意子串，使用 rolling hash；若為多字典詞，使用 Trie 或 AC 自動機。",
    ],
    patterns: [
      "Z function",
      "Manacher",
      "Rolling hash",
      "Trie",
      "Aho-Corasick",
      "Suffix array",
    ],
    pitfalls: [
      "不同字串工具的陣列語意不同。",
      "Hash 有碰撞風險，嚴格場合須採雙 hash 或額外驗證。",
    ],
    complexity: "多數預處理為 `O(n)` 或 `O(總字元數)`，查詢視工具而定。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> zFunction(const string& s) {\n        int n = s.size();\n        vector<int> z(n, 0);\n        int left = 0;\n        int right = 0;\n        for (int i = 1; i < n; ++i) {\n            if (i <= right) {\n                z[i] = min(right - i + 1, z[i - left]);\n            }\n            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;\n            if (i + z[i] - 1 > right) {\n                left = i;\n                right = i + z[i] - 1;\n            }\n        }\n        return z;\n    }\n};\n```",
  },
  {
    key: "combinatorics-geometry",
    planKeys: ["math"],
    keywords: [
      "組合",
      "乘法原理",
      "放球",
      "容斥",
      "生成函式",
      "機率",
      "期望",
      "博弈",
      "點、線",
      "圓",
      "矩形",
      "凸包",
    ],
    modelProblem:
      "給定計數或幾何限制，將題目拆解為可相乘的選擇、需容斥的重疊條件，或以向量運算判斷幾何關係。",
    signals: ["方案數。", "至少/至多。", "期望。", "座標。", "共線。", "面積。", "凸包。"],
    invariants: [
      "組合計數中，每個物件須被計數一次且僅一次。",
      "容斥中，交集大小依違反條件數量的奇偶加減。",
      "幾何中，叉積符號代表方向，絕對值代表平行四邊形面積。",
    ],
    derivation: [
      "先定義被計數的物件或幾何關係。",
      "若限制重疊，以容斥或 DP 拆開。",
      "若為幾何，先以向量、叉積、點積寫出判斷式，再處理邊界。",
    ],
    patterns: [
      "排列組合",
      "容斥原理",
      "期望線性性",
      "叉積判方向",
      "凸包單調鏈",
    ],
    pitfalls: ["排列與組合不可混用。", "幾何題須處理共線、重點與浮點誤差。"],
    complexity: "組合預處理常為 `O(n)`；凸包通常 `O(n log n)`。",
    code: "```cpp\nstruct Point {\n    long long x;\n    long long y;\n};\n\nlong long cross(Point origin, Point a, Point b) {\n    long long ax = a.x - origin.x;\n    long long ay = a.y - origin.y;\n    long long bx = b.x - origin.x;\n    long long by = b.y - origin.y;\n    return ax * by - ay * bx;\n}\n```",
  },
];

const defaultLectureExamples: Record<string, StudyPlanData.Item> = {
  "binary-lower-bound": {
    id: "1898",
    title: "可移除字元的最大數目",
    slug: "maximum-number-of-removable-characters",
    src: "https://leetcode.cn/problems/maximum-number-of-removable-characters/",
    solution: null,
    score: 1913,
    isPremium: false,
  },
  "kth-smallest": {
    id: "1201",
    title: "醜數 III",
    slug: "ugly-number-iii",
    src: "https://leetcode.cn/problems/ugly-number-iii/",
    solution: null,
    score: 2039,
    isPremium: false,
  },
  "binary-answer": {
    id: "1201",
    title: "醜數 III",
    slug: "ugly-number-iii",
    src: "https://leetcode.cn/problems/ugly-number-iii/",
    solution: null,
    score: 2039,
    isPremium: false,
  },
  "prefix-sum": {
    id: "1915",
    title: "最美子字串的數目",
    slug: "number-of-wonderful-substrings",
    src: "https://leetcode.cn/problems/number-of-wonderful-substrings/",
    solution: null,
    score: 2235,
    isPremium: false,
  },
  "enumerate-maintain": {
    id: "2281",
    title: "巫師的總力量和",
    slug: "sum-of-total-strength-of-wizards",
    src: "https://leetcode.cn/problems/sum-of-total-strength-of-wizards/",
    solution: null,
    score: 2621,
    isPremium: false,
  },
  "rating-2100-data-structure": {
    id: "2426",
    title: "滿足不等式的數對數目",
    slug: "number-of-pairs-satisfying-inequality",
    src: "https://leetcode.cn/problems/number-of-pairs-satisfying-inequality/",
    solution: null,
    score: 2030,
    isPremium: false,
  },
  "rating-2100-dp": {
    id: "1671",
    title: "得到山形陣列的最少刪除次數",
    slug: "minimum-number-of-removals-to-make-mountain-array",
    src: "https://leetcode.cn/problems/minimum-number-of-removals-to-make-mountain-array/",
    solution: null,
    score: 1913,
    isPremium: false,
  },
  "grid-state-bfs": {
    id: "1293",
    title: "網格中的最短路徑",
    slug: "shortest-path-in-a-grid-with-obstacles-elimination",
    src: "https://leetcode.cn/problems/shortest-path-in-a-grid-with-obstacles-elimination/",
    solution: null,
    score: 1967,
    isPremium: false,
  },
  "difference-array": {
    id: "3362",
    title: "零陣列變換 III",
    slug: "zero-array-transformation-iii",
    src: "https://leetcode.cn/problems/zero-array-transformation-iii/",
    solution: null,
    score: 2424,
    isPremium: false,
  },
  fenwick: {
    id: "2426",
    title: "滿足不等式的數對數目",
    slug: "number-of-pairs-satisfying-inequality",
    src: "https://leetcode.cn/problems/number-of-pairs-satisfying-inequality/",
    solution: null,
    score: 2030,
    isPremium: false,
  },
  dsu: {
    id: "1697",
    title: "檢查邊長度限制的路徑是否存在",
    slug: "checking-existence-of-edge-length-limited-paths",
    src: "https://leetcode.cn/problems/checking-existence-of-edge-length-limited-paths/",
    solution: null,
    score: 2300,
    isPremium: false,
  },
  "monotonic-stack": {
    id: "907",
    title: "子陣列的最小值之和",
    slug: "sum-of-subarray-minimums",
    src: "https://leetcode.cn/problems/sum-of-subarray-minimums/",
    solution: null,
    score: 1976,
    isPremium: false,
  },
  "sliding-window": {
    id: "3298",
    title: "統計重新排列後包含另一個字串的子字串數目 II",
    slug: "count-substrings-that-can-be-rearranged-to-contain-a-string-ii",
    src: "https://leetcode.cn/problems/count-substrings-that-can-be-rearranged-to-contain-a-string-ii/",
    solution: null,
    score: 1909,
    isPremium: false,
  },
  knapsack: {
    id: "2518",
    title: "好分割槽的數目",
    slug: "number-of-great-partitions",
    src: "https://leetcode.cn/problems/number-of-great-partitions/",
    solution: null,
    score: 2415,
    isPremium: false,
  },
  "grid-dp": {
    id: "2328",
    title: "網格圖中遞增路徑的數目",
    slug: "number-of-increasing-paths-in-a-grid",
    src: "https://leetcode.cn/problems/number-of-increasing-paths-in-a-grid/",
    solution: null,
    score: 2001,
    isPremium: false,
  },
  "dp-linear": {
    id: "1671",
    title: "得到山形陣列的最少刪除次數",
    slug: "minimum-number-of-removals-to-make-mountain-array",
    src: "https://leetcode.cn/problems/minimum-number-of-removals-to-make-mountain-array/",
    solution: null,
    score: 1913,
    isPremium: false,
  },
  "graph-bfs-dfs": {
    id: "2608",
    title: "圖中的最短環",
    slug: "shortest-cycle-in-a-graph",
    src: "https://leetcode.cn/problems/shortest-cycle-in-a-graph/",
    solution: null,
    score: 1904,
    isPremium: false,
  },
  "topological-dp": {
    id: "2050",
    title: "並行課程 III",
    slug: "parallel-courses-iii",
    src: "https://leetcode.cn/problems/parallel-courses-iii/",
    solution: null,
    score: 2084,
    isPremium: false,
  },
  dijkstra: {
    id: "2203",
    title: "得到要求路徑的最小帶權子圖",
    slug: "minimum-weighted-subgraph-with-the-required-paths",
    src: "https://leetcode.cn/problems/minimum-weighted-subgraph-with-the-required-paths/",
    solution: null,
    score: 2364,
    isPremium: false,
  },
  mst: {
    id: "1489",
    title: "找到最小生成樹裡的關鍵邊和偽關鍵邊",
    slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
    src: "https://leetcode.cn/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/",
    solution: null,
    score: 2572,
    isPremium: false,
  },
  "low-link": {
    id: "1192",
    title: "查詢叢集內的關鍵連線",
    slug: "critical-connections-in-a-network",
    src: "https://leetcode.cn/problems/critical-connections-in-a-network/",
    solution: null,
    score: 2085,
    isPremium: false,
  },
  "network-flow": {
    id: "1349",
    title: "參加考試的最大學生數",
    slug: "maximum-students-taking-exam",
    src: "https://leetcode.cn/problems/maximum-students-taking-exam/",
    solution: null,
    score: 2386,
    isPremium: false,
  },
  "greedy-interval": {
    id: "2589",
    title: "完成所有任務的最少時間",
    slug: "minimum-time-to-complete-all-tasks",
    src: "https://leetcode.cn/problems/minimum-time-to-complete-all-tasks/",
    solution: null,
    score: 2381,
    isPremium: false,
  },
  "math-number-theory": {
    id: "1998",
    title: "陣列的最大公因數排序",
    slug: "gcd-sort-of-an-array",
    src: "https://leetcode.cn/problems/gcd-sort-of-an-array/",
    solution: null,
    score: 2429,
    isPremium: false,
  },
  kmp: {
    id: "3008",
    title: "找出陣列中的美麗下標 II",
    slug: "find-beautiful-indices-in-the-given-array-ii",
    src: "https://leetcode.cn/problems/find-beautiful-indices-in-the-given-array-ii/",
    solution: null,
    score: 2016,
    isPremium: false,
  },
  "tree-linked-binary": {
    id: "2458",
    title: "移除子樹後的二叉樹高度",
    slug: "height-of-binary-tree-after-subtree-removal-queries",
    src: "https://leetcode.cn/problems/height-of-binary-tree-after-subtree-removal-queries/",
    solution: null,
    score: 2299,
    isPremium: false,
  },
  "bitwise-contribution": {
    id: "2680",
    title: "最大或值",
    slug: "maximum-or",
    src: "https://leetcode.cn/problems/maximum-or/",
    solution: null,
    score: 1912,
    isPremium: false,
  },
  "linear-basis": {
    id: "3681",
    title: "子序列最大 XOR 值",
    slug: "maximum-xor-of-subsequences",
    src: "https://leetcode.cn/problems/maximum-xor-of-subsequences/",
    solution: null,
    score: 2027,
    isPremium: false,
  },
  "greedy-general": {
    id: "1642",
    title: "可以到達的最遠建築",
    slug: "furthest-building-you-can-reach",
    src: "https://leetcode.cn/problems/furthest-building-you-can-reach/",
    solution: null,
    score: 1962,
    isPremium: false,
  },
  manacher: {
    id: "1960",
    title: "兩個迴文子字串長度的最大乘積",
    slug: "maximum-product-of-the-length-of-two-palindromic-substrings",
    src: "https://leetcode.cn/problems/maximum-product-of-the-length-of-two-palindromic-substrings/",
    solution: null,
    score: 2691,
    isPremium: false,
  },
  "string-tools": {
    id: "2223",
    title: "構造字串的總得分和",
    slug: "sum-of-scores-of-built-strings",
    src: "https://leetcode.cn/problems/sum-of-scores-of-built-strings/",
    solution: null,
    score: 2220,
    isPremium: false,
  },
  "combinatorics-geometry": {
    id: "1735",
    title: "生成乘積陣列的方案數",
    slug: "count-ways-to-make-array-with-product",
    src: "https://leetcode.cn/problems/count-ways-to-make-array-with-product/",
    solution: null,
    score: 2500,
    isPremium: false,
  },
};

const exampleLectureOverrides: NonNullable<LectureTopicProfile["examples"]> = {
  "maximum-number-of-removable-characters": {
    modelProblem:
      "LeetCode 1898 給定字串 `s`、模式字串 `p` 與陣列 `removable`。移除 `removable` 前 k 個位置上的字元後，若 `p` 仍為剩餘字串的子序列，則 k 合法；回傳最大的合法 k。",
    signals: [
      "題目詢問至多可移除多少個位置。",
      "固定 k 後可線性檢查 `p` 是否仍為子序列。",
      "若 k 合法，較小的 k 亦必然合法。",
    ],
    invariants: [
      "`can(k)` 表示移除前 k 個 removable 位置後，`p` 是否仍能依序匹配。",
      "二分所維護的是最後一個合法 k，而非第一個合法 k。",
      "檢查時 `matched` 僅向右遞增，代表已匹配 `p` 的前綴長度。",
    ],
    derivation: [
      "將答案 k 的範圍設為 `[0, removable.size()]`。",
      "對候選 k，先將前 k 個 removable 位置標記為 removed。",
      "掃描 `s`，跳過 removed 位置，以雙指標判斷 `p` 是否為子序列。",
      "若 `can(mid)` 成立則嘗試更大的 k，否則降低右界。",
    ],
    patterns: ["最大合法值二分", "二分答案 + 子序列檢查", "標記刪除位置"],
    pitfalls: [
      "本題並非於 sorted array 上二分，而是於答案 k 上二分。",
      "檢查函式必須依 removable 的前 k 個位置刪除，不可排序後刪。",
      "求最大合法值時，mid 取上中位數可避免死循環。",
    ],
    complexity:
      "每次檢查 `O(|s| + k)`；總時間 `O((|s| + m) log m)`，空間 `O(|s|)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int maximumRemovals(string s, string p, vector<int>& removable) {\n        auto canRemove = [&s, &p, &removable](int count) {\n            vector<int> removed(s.size(), 0);\n            for (int i = 0; i < count; ++i) removed[removable[i]] = 1;\n\n            int matched = 0;\n            for (int i = 0; i < (int)s.size() && matched < (int)p.size(); ++i) {\n                if (!removed[i] && s[i] == p[matched]) matched++;\n            }\n            return matched == (int)p.size();\n        };\n\n        int left = 0;\n        int right = removable.size();\n        while (left < right) {\n            int mid = left + (right - left + 1) / 2;\n            if (canRemove(mid)) {\n                left = mid;\n            } else {\n                right = mid - 1;\n            }\n        }\n        return left;\n    }\n};\n```",
  },
  "number-of-wonderful-substrings": {
    modelProblem:
      "LeetCode 1915 給定僅含前十個小寫字母的字串 `word`。若子字串中至多僅一種字母出現奇數次即稱為 wonderful；計算 wonderful 子字串數量。",
    signals: [
      "僅關心每個字母出現次數的奇偶性。",
      "子字串狀態可由兩個前綴狀態 XOR 得到。",
      "合法條件為 mask 為 0 或僅一個 bit 為 1。",
    ],
    invariants: [
      "`mask` 表示目前前綴中十個字母出現次數的奇偶狀態。",
      "掃描至當前位置時，`count[old_mask]` 保存所有舊前綴狀態出現次數。",
      "以當前位置結尾的合法子字串，來自相同 mask 或僅差一個 bit 的舊前綴。",
    ],
    derivation: [
      "初始化 `count[0] = 1`，代表空前綴。",
      "每讀入一個字母即翻轉對應 bit。",
      "先累加 `count[mask]`，對應所有字母出現偶數次的情形。",
      "再枚舉十個 bit，累加 `count[mask ^ (1 << bit)]`。",
      "最後將當前 mask 加入 count，供後續右端點使用。",
    ],
    patterns: ["奇偶 mask 前綴", "前綴狀態計數", "合法差值枚舉"],
    pitfalls: [
      "勿使用長度 26 的 mask；題目限制僅需前十個字母。",
      "統計答案須於加入當前前綴之前完成，避免空子字串被計入。",
      "答案可能超過 int，須使用 `long long`。",
    ],
    complexity: "每個位置枚舉 10 個 bit，時間 `O(10n)`，空間 `O(2^10)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long wonderfulSubstrings(string word) {\n        vector<long long> count(1 << 10, 0);\n        count[0] = 1;\n        int mask = 0;\n        long long answer = 0;\n\n        for (char ch : word) {\n            mask ^= 1 << (ch - 'a');\n            answer += count[mask];\n            for (int bit = 0; bit < 10; ++bit) {\n                answer += count[mask ^ (1 << bit)];\n            }\n            count[mask]++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "zero-array-transformation-iii": {
    modelProblem:
      "LeetCode 3362 給定非負陣列 `nums` 與多個區間查詢 `queries[i] = [l, r]`。每個查詢至多可讓區間內每個位置減 1；移除最多查詢，使剩下查詢仍能將整個陣列變為全 0；若無法做到則回傳 -1。",
    signals: [
      "每個位置需被覆蓋 `nums[i]` 次。",
      "查詢為區間資源，可按左端點掃描加入候選。",
      "欲保留較少查詢時，遇需求缺口應選右端點最遠的查詢。",
    ],
    invariants: [
      "`active_add` 表示目前已選查詢對 index 的覆蓋次數。",
      "max-heap 中保存左端點已抵達且尚未選用的查詢右端點。",
      "當覆蓋不足時，選右端點最遠的查詢不會劣於選更短查詢。",
    ],
    derivation: [
      "先依查詢左端點排序，由左至右掃描位置 i。",
      "將所有 `l <= i` 的查詢右端點加入 max-heap。",
      "以差分陣列維護已選查詢在當前位置的覆蓋數。",
      "若覆蓋數小於 `nums[i]`，反覆自 heap 選右端點最遠且仍覆蓋 i 的查詢。",
      "若 heap 已無可用查詢，代表無法完成。",
    ],
    patterns: ["差分維護覆蓋", "掃描線 + heap", "區間資源貪心"],
    pitfalls: [
      "heap 中過期的右端點須丟棄。",
      "選中一個查詢後須於 `right + 1` 以差分抵消。",
      "回傳的是可移除查詢數，而非已選查詢數。",
    ],
    complexity: "排序與 heap 操作總時間 `O((n + q) log q)`，空間 `O(n + q)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int maxRemoval(vector<int>& nums, vector<vector<int>>& queries) {\n        sort(queries.begin(), queries.end());\n        priority_queue<int> available_right;\n        vector<int> diff(nums.size() + 1, 0);\n        int query_index = 0;\n        int coverage = 0;\n        int used = 0;\n\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            coverage += diff[i];\n            while (query_index < (int)queries.size() && queries[query_index][0] <= i) {\n                available_right.push(queries[query_index][1]);\n                query_index++;\n            }\n            while (coverage < nums[i]) {\n                while (!available_right.empty() && available_right.top() < i) available_right.pop();\n                if (available_right.empty()) return -1;\n                int right = available_right.top();\n                available_right.pop();\n                coverage++;\n                diff[right + 1]--;\n                used++;\n            }\n        }\n        return queries.size() - used;\n    }\n};\n```",
  },
  "number-of-pairs-satisfying-inequality": {
    modelProblem:
      "LeetCode 2426 給定 `nums1`、`nums2` 與 `diff`，計算下標對 `(i, j)`（`i < j`）滿足 `nums1[i] - nums2[i] <= nums1[j] - nums2[j] + diff` 的數量。",
    signals: [
      "條件可整理為兩個 transformed value 的大小關係。",
      "掃描右端點時僅需統計左側有多少值不超過某門檻。",
      "需要動態前綴排名或有序計數。",
    ],
    invariants: [
      "定義 `arr[i] = nums1[i] - nums2[i]`。",
      "掃描到 j 時，Fenwick 僅保存所有 `i < j` 的 `arr[i]`。",
      "合法左端點數量即為 `arr[i] <= arr[j] + diff` 的個數。",
    ],
    derivation: [
      "先將所有 `arr[i]` 與查詢門檻 `arr[i] + diff` 放入離散化陣列。",
      "由左至右掃描 j。",
      "以 Fenwick 查詢 `<= arr[j] + diff` 的歷史數量並計入答案。",
      "再將 `arr[j]` 加入 Fenwick，供後續右端點使用。",
    ],
    patterns: ["離散化", "Fenwick 動態排名", "列舉右端點維護左側"],
    pitfalls: [
      "不等式整理方向須保持 `i < j`。",
      "離散化須涵蓋查詢門檻，否則 upper_bound 位置易錯。",
      "答案須使用 `long long`。",
    ],
    complexity: "離散化 `O(n log n)`，每次查詢與更新 `O(log n)`。",
    code: "```cpp\nclass Fenwick {\n    vector<int> tree_;\n\npublic:\n    explicit Fenwick(int n) : tree_(n + 1, 0) {}\n\n    void add(int index, int delta) {\n        for (++index; index < (int)tree_.size(); index += index & -index) tree_[index] += delta;\n    }\n\n    int prefixSum(int index) const {\n        int sum = 0;\n        for (++index; index > 0; index -= index & -index) sum += tree_[index];\n        return sum;\n    }\n};\n\nclass Solution {\npublic:\n    long long numberOfPairs(vector<int>& nums1, vector<int>& nums2, int diff) {\n        vector<int> values;\n        vector<int> arr(nums1.size());\n        for (int i = 0; i < (int)nums1.size(); ++i) {\n            arr[i] = nums1[i] - nums2[i];\n            values.push_back(arr[i]);\n            values.push_back(arr[i] + diff);\n        }\n        sort(values.begin(), values.end());\n        values.erase(unique(values.begin(), values.end()), values.end());\n\n        Fenwick fenwick(values.size());\n        long long answer = 0;\n        for (int x : arr) {\n            int limit_index = upper_bound(values.begin(), values.end(), x + diff) - values.begin() - 1;\n            answer += fenwick.prefixSum(limit_index);\n            int index = lower_bound(values.begin(), values.end(), x) - values.begin();\n            fenwick.add(index, 1);\n        }\n        return answer;\n    }\n};\n```",
  },
  "shortest-path-in-a-grid-with-obstacles-elimination": {
    modelProblem:
      "LeetCode 1293 給定 `rows x cols` 的 0/1 網格。自 `(0,0)` 出發，每步可往上下左右移動；踏入障礙格 `1` 時可消耗一次消除機會，至多消除 `k` 個障礙。回傳到 `(rows-1, cols-1)` 的最少步數；無法到達則回傳 `-1`。",
    signals: [
      "網格最短路。",
      "同一格在不同剩餘消除次數下後續可走路徑不同。",
      "每步成本相同，故完整狀態圖上可用 BFS。",
    ],
    invariants: [
      "BFS 狀態為 `(row, col, remaining)`，而非僅含座標。",
      "`best[row][col]` 保存到達該格時看過的最大剩餘消除次數。",
      "若新狀態的剩餘次數不大於 best，未來不會優於舊狀態，可剪除。",
    ],
    derivation: [
      "初始狀態為 `(0, 0, k, 0)`。",
      "每次出隊後枚舉四個方向。",
      "若下一格為障礙，`remaining` 減一；若變為負數則不可走。",
      "僅當 `next_remaining > best[next_row][next_col]` 時方入隊。",
      "首次出隊到達終點時，距離即為最少步數。",
    ],
    patterns: ["網格 BFS", "資源維度", "dominance pruning", "最短路狀態壓縮"],
    pitfalls: [
      "不可使用二維 visited，否則會將剩餘資源不同的狀態混為一談。",
      "若起點或終點為障礙，須依題意確認是否需消耗 k。",
      "狀態數上界為 `rows * cols * (k + 1)`，k 過大時可先做簡單捷徑剪枝。",
    ],
    complexity:
      "最壞時間 `O(rows * cols * k)`，採用 best 剪枝後空間 `O(rows * cols)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int shortestPath(vector<vector<int>>& grid, int k) {\n        int rows = grid.size();\n        int cols = grid[0].size();\n        const int kDirs[5] = {1, 0, -1, 0, 1};\n        vector<vector<int>> best(rows, vector<int>(cols, -1));\n        queue<array<int, 4>> q;\n\n        best[0][0] = k;\n        q.push({0, 0, k, 0});\n        while (!q.empty()) {\n            auto [row, col, remaining, dist] = q.front();\n            q.pop();\n            if (row == rows - 1 && col == cols - 1) return dist;\n            for (int dir = 0; dir < 4; ++dir) {\n                int next_row = row + kDirs[dir];\n                int next_col = col + kDirs[dir + 1];\n                if (next_row < 0 || next_row >= rows || next_col < 0 || next_col >= cols) continue;\n                int next_remaining = remaining - grid[next_row][next_col];\n                if (next_remaining < 0 || next_remaining <= best[next_row][next_col]) continue;\n                best[next_row][next_col] = next_remaining;\n                q.push({next_row, next_col, next_remaining, dist + 1});\n            }\n        }\n        return -1;\n    }\n};\n```",
  },
  "checking-existence-of-edge-length-limited-paths": {
    modelProblem:
      "LeetCode 1697 給定無向帶權邊 `edgeList` 與查詢 `[p, q, limit]`。每個查詢須判斷是否存在從 p 到 q 的路徑，使路徑上每條邊權皆嚴格小於 limit。",
    signals: [
      "查詢僅會加入小於某限制的邊。",
      "沒有刪邊，僅依門檻逐步加邊。",
      "問題在於連通性，而非路徑長度。",
    ],
    invariants: [
      "處理 limit 之前，DSU 中已加入所有權重 `< limit` 的邊。",
      "同一 DSU component 內的任兩點即存在符合當前 limit 的路徑。",
      "查詢排序後，邊指標僅向右移動一次。",
    ],
    derivation: [
      "將 edgeList 依權重排序。",
      "為 queries 附上原始下標，再依 limit 排序。",
      "對每個查詢加入所有 `weight < limit` 的邊。",
      "以 DSU 判斷 p 與 q 是否位於同一連通塊，答案寫回原下標。",
    ],
    patterns: ["離線排序", "DSU 動態加邊", "門檻連通性查詢"],
    pitfalls: [
      "條件為嚴格小於 limit，而非小於等於。",
      "queries 排序後須保留原始下標。",
      "DSU 不支援刪邊，故必須使 limit 單調遞增。",
    ],
    complexity: "排序 `O((E + Q) log(E + Q))`，DSU 操作近似線性。",
    code: "```cpp\nclass Dsu {\n    vector<int> parent_;\n    vector<int> size_;\n\npublic:\n    explicit Dsu(int n) : parent_(n), size_(n, 1) { iota(parent_.begin(), parent_.end(), 0); }\n    int find(int x) { return parent_[x] == x ? x : parent_[x] = find(parent_[x]); }\n    void unite(int a, int b) {\n        int root_a = find(a), root_b = find(b);\n        if (root_a == root_b) return;\n        if (size_[root_a] < size_[root_b]) swap(root_a, root_b);\n        parent_[root_b] = root_a;\n        size_[root_a] += size_[root_b];\n    }\n};\n\nclass Solution {\npublic:\n    vector<bool> distanceLimitedPathsExist(int n, vector<vector<int>>& edgeList, vector<vector<int>>& queries) {\n        sort(edgeList.begin(), edgeList.end(), [](const auto& lhs, const auto& rhs) { return lhs[2] < rhs[2]; });\n        vector<array<int, 4>> ordered_queries;\n        for (int i = 0; i < (int)queries.size(); ++i) ordered_queries.push_back({queries[i][2], queries[i][0], queries[i][1], i});\n        sort(ordered_queries.begin(), ordered_queries.end());\n\n        Dsu dsu(n);\n        vector<bool> answer(queries.size());\n        int edge_index = 0;\n        for (auto [limit, from, to, query_id] : ordered_queries) {\n            while (edge_index < (int)edgeList.size() && edgeList[edge_index][2] < limit) {\n                dsu.unite(edgeList[edge_index][0], edgeList[edge_index][1]);\n                edge_index++;\n            }\n            answer[query_id] = dsu.find(from) == dsu.find(to);\n        }\n        return answer;\n    }\n};\n```",
  },
  "sum-of-total-strength-of-wizards": {
    modelProblem:
      "LeetCode 2281 給定陣列 `strength`。每個連續子陣列的力量定義為 `min(subarray) * sum(subarray)`。計算所有子陣列力量總和並對 `1e9+7` 取模。",
    signals: [
      "每個子陣列的最小值須乘上區間和。",
      "可枚舉某位置作為最小值的貢獻範圍。",
      "需同時使用單調棧與前綴和的前綴和。",
    ],
    invariants: [
      "對每個 i，找出其作為子陣列最小值時可延伸的左界與右界。",
      "左側採嚴格小於，右側採小於等於，避免相等最小值重複計數。",
      "二階前綴和可於 `O(1)` 算出所有包含 i 的子陣列和總貢獻。",
    ],
    derivation: [
      "以單調棧求 `left[i]`：左側第一個 `< strength[i]` 的位置。",
      "以單調棧求 `right[i]`：右側第一個 `<= strength[i]` 的位置。",
      "建立 prefix 與 prefix of prefix。",
      "對每個 i，計算右側前綴和總量乘左側選法數，再扣除左側前綴和總量乘右側選法數。",
      "將該總區間和乘上 `strength[i]` 計入答案。",
    ],
    patterns: ["單調棧邊界", "貢獻法", "二階前綴和"],
    pitfalls: [
      "相等元素的嚴格/非嚴格方向不可兩側相同。",
      "中間值甚大，所有乘法皆須轉為 `long long` 並取模。",
      "二階前綴陣列下標易偏移，須統一使用半開區間。",
    ],
    complexity: "單調棧與貢獻計算皆為 `O(n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int totalStrength(vector<int>& strength) {\n        constexpr long long kMod = 1'000'000'007;\n        int n = strength.size();\n        vector<int> left(n), right(n, n), stack;\n\n        for (int i = 0; i < n; ++i) {\n            while (!stack.empty() && strength[stack.back()] >= strength[i]) stack.pop_back();\n            left[i] = stack.empty() ? -1 : stack.back();\n            stack.push_back(i);\n        }\n        stack.clear();\n        for (int i = n - 1; i >= 0; --i) {\n            while (!stack.empty() && strength[stack.back()] > strength[i]) stack.pop_back();\n            right[i] = stack.empty() ? n : stack.back();\n            stack.push_back(i);\n        }\n\n        vector<long long> prefix(n + 1), prefix_prefix(n + 2);\n        for (int i = 0; i < n; ++i) {\n            prefix[i + 1] = (prefix[i] + strength[i]) % kMod;\n            prefix_prefix[i + 2] = (prefix_prefix[i + 1] + prefix[i + 1]) % kMod;\n        }\n\n        long long answer = 0;\n        for (int i = 0; i < n; ++i) {\n            long long left_count = i - left[i];\n            long long right_count = right[i] - i;\n            long long right_sum = (prefix_prefix[right[i] + 1] - prefix_prefix[i + 1] + kMod) % kMod;\n            long long left_sum = (prefix_prefix[i + 1] - prefix_prefix[left[i] + 1] + kMod) % kMod;\n            long long total = (right_sum * left_count - left_sum * right_count) % kMod;\n            answer = (answer + strength[i] * total) % kMod;\n        }\n        return (answer + kMod) % kMod;\n    }\n};\n```",
  },
  "sum-of-subarray-minimums": {
    modelProblem:
      "LeetCode 907 給定整數陣列 `arr`，計算所有連續子陣列的最小值之和，答案對 `1e9+7` 取模。",
    signals: [
      "須統計所有子陣列的極值總和。",
      "直接枚舉子陣列為 `O(n^2)`。",
      "每個元素可計算自身作為最小值的覆蓋範圍。",
    ],
    invariants: [
      "`left[i]` 為 i 左側第一個嚴格小於 `arr[i]` 的位置。",
      "`right[i]` 為 i 右側第一個小於等於 `arr[i]` 的位置。",
      "以 i 為最小值的子陣列數量為 `(i-left[i])*(right[i]-i)`。",
    ],
    derivation: [
      "以遞增棧求每個位置的左邊界。",
      "反向掃描求右邊界，並以相反的相等處理避免重複。",
      "將每個元素值乘上可作為最小值的子陣列個數。",
    ],
    patterns: ["單調棧", "子陣列極值貢獻法", "相等元素去重"],
    pitfalls: [
      "相等元素若兩側皆嚴格或皆非嚴格，將重複或漏算。",
      "乘法須使用 `long long`。",
    ],
    complexity: "每個元素入棧出棧各一次，時間 `O(n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int sumSubarrayMins(vector<int>& arr) {\n        constexpr long long kMod = 1'000'000'007;\n        int n = arr.size();\n        vector<int> left(n), right(n, n), stack;\n        for (int i = 0; i < n; ++i) {\n            while (!stack.empty() && arr[stack.back()] > arr[i]) stack.pop_back();\n            left[i] = stack.empty() ? -1 : stack.back();\n            stack.push_back(i);\n        }\n        stack.clear();\n        for (int i = n - 1; i >= 0; --i) {\n            while (!stack.empty() && arr[stack.back()] >= arr[i]) stack.pop_back();\n            right[i] = stack.empty() ? n : stack.back();\n            stack.push_back(i);\n        }\n\n        long long answer = 0;\n        for (int i = 0; i < n; ++i) {\n            answer = (answer + 1LL * arr[i] * (i - left[i]) * (right[i] - i)) % kMod;\n        }\n        return answer;\n    }\n};\n```",
  },
  "count-substrings-that-can-be-rearranged-to-contain-a-string-ii": {
    modelProblem:
      "LeetCode 3298 給定字串 `word1` 與 `word2`，計算有多少個 `word1` 的子字串在重新排列後可使 `word2` 成為其前綴；等價於該子字串涵蓋 `word2` 所需的每個字母次數。",
    signals: [
      "連續子字串。",
      "合法條件為窗口內每個字母數量皆達到需求。",
      "窗口越長越易合法，故可用滑動視窗計數。",
    ],
    invariants: [
      "`need[c]` 為 word2 對字母 c 的需求量。",
      "`missing` 表示目前窗口仍缺多少個必要字元。",
      "當窗口合法時，固定 left 後所有更長的右端皆合法。",
    ],
    derivation: [
      "先統計 word2 的需求，並令 missing 等於 word2 長度。",
      "右端加入字元時，若仍在需求內，missing 減一。",
      "當 missing 為 0，代表當前窗口合法，可累加所有以當前 left 開始的合法子字串。",
      "移動 left 前須撤銷 left 字元對需求的影響。",
    ],
    patterns: ["越長越合法滑動視窗", "需求計數", "一次計算一整段右端貢獻"],
    pitfalls: [
      "合法後貢獻為 `word1.size() - right`，而非僅加一。",
      "移動左端時若字元變為缺少，missing 須補回。",
    ],
    complexity:
      "左右指標各走一次，時間 `O(n + alphabet)`，空間 `O(alphabet)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long validSubstringCount(string word1, string word2) {\n        array<int, 26> need{};\n        for (char ch : word2) need[ch - 'a']++;\n        int missing = word2.size();\n        long long answer = 0;\n        int right = 0;\n\n        for (int left = 0; left < (int)word1.size(); ++left) {\n            while (right < (int)word1.size() && missing > 0) {\n                int index = word1[right] - 'a';\n                if (need[index] > 0) missing--;\n                need[index]--;\n                right++;\n            }\n            if (missing == 0) answer += word1.size() - right + 1;\n            int index = word1[left] - 'a';\n            need[index]++;\n            if (need[index] > 0) missing++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "number-of-great-partitions": {
    modelProblem:
      "LeetCode 2518 給定陣列 `nums` 與整數 `k`。將每個元素分入兩個群組，若兩組總和皆至少為 k 即稱為 good partition；計算 good partition 數量並取模。",
    signals: [
      "每個元素二選一，總方案為 `2^n`。",
      "非法情況為某一組總和小於 k。",
      "僅需統計小於 k 的子集和方案數。",
    ],
    invariants: [
      "`dp[sum]` 表示目前處理過的元素中，選出總和為 sum 的子集數。",
      "容量僅需至 `k - 1`，因達到 k 後僅關心是否非法。",
      "0-1 背包須倒序枚舉 sum 以避免同一元素被多次使用。",
    ],
    derivation: [
      "若總和小於 `2*k`，兩組不可能皆達標，直接回傳 0。",
      "計算所有子集總和 `< k` 的方案數 bad。",
      "任一非法分割必有一側總和 `< k`，且兩側不會同時小於 k。",
      "答案為 `2^n - 2*bad`。",
    ],
    patterns: ["0-1 背包計數", "總方案扣非法", "容量截斷"],
    pitfalls: [
      "總和不足時須先判斷，否則兩側皆小於 k 的情況會被重複扣除。",
      "dp 容量無需開至總和。",
      "模減法須補正。",
    ],
    complexity: "時間 `O(nk)`，空間 `O(k)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int countPartitions(vector<int>& nums, int k) {\n        constexpr long long kMod = 1'000'000'007;\n        long long total_sum = accumulate(nums.begin(), nums.end(), 0LL);\n        if (total_sum < 2LL * k) return 0;\n\n        vector<long long> dp(k, 0);\n        dp[0] = 1;\n        long long total_ways = 1;\n        for (int x : nums) {\n            total_ways = total_ways * 2 % kMod;\n            for (int sum = k - 1; sum >= x; --sum) {\n                dp[sum] = (dp[sum] + dp[sum - x]) % kMod;\n            }\n        }\n\n        long long bad = accumulate(dp.begin(), dp.end(), 0LL) % kMod;\n        return (total_ways - 2 * bad % kMod + kMod) % kMod;\n    }\n};\n```",
  },
  "number-of-increasing-paths-in-a-grid": {
    modelProblem:
      "LeetCode 2328 給定整數矩陣 `grid`。一條路徑可由任意格開始，每步往上下左右相鄰且值更大的格子走；計算所有嚴格遞增路徑數量。",
    signals: [
      "網格邊由小值指向大值，形成 DAG。",
      "每格答案可由更大的鄰格回傳。",
      "詢問所有起點的方案數總和。",
    ],
    invariants: [
      "`dfs(row,col)` 表示自該格出發的遞增路徑數，至少包含僅停在自己的 1 條。",
      "僅往值更大的鄰格遞迴，故不會成環。",
      "記憶化後每個格子的答案僅計算一次。",
    ],
    derivation: [
      "將每個格子視為 DAG 節點。",
      "自任一格出發，先計入單格路徑。",
      "枚舉四個鄰格，若值更大則將鄰格的路徑數加回。",
      "對所有格子的 `dfs` 結果求和。",
    ],
    patterns: ["網格 DAG", "記憶化 DFS", "路徑計數 DP"],
    pitfalls: [
      "相等值不可移動。",
      "答案須於每次加法後取模。",
      "勿以普通 BFS 最短路模型解計數 DP。",
    ],
    complexity: "每個格子與四條邊處理一次，時間 `O(rows*cols)`。",
    code: "```cpp\nclass Solution {\n    static constexpr int kMod = 1'000'000'007;\n    int rows_ = 0;\n    int cols_ = 0;\n    vector<vector<int>> memo_;\n    const int dirs_[5] = {1, 0, -1, 0, 1};\n\n    int dfs(vector<vector<int>>& grid, int row, int col) {\n        if (memo_[row][col] != 0) return memo_[row][col];\n        long long paths = 1;\n        for (int dir = 0; dir < 4; ++dir) {\n            int next_row = row + dirs_[dir];\n            int next_col = col + dirs_[dir + 1];\n            if (next_row < 0 || next_row >= rows_ || next_col < 0 || next_col >= cols_) continue;\n            if (grid[next_row][next_col] > grid[row][col]) paths += dfs(grid, next_row, next_col);\n        }\n        return memo_[row][col] = paths % kMod;\n    }\n\npublic:\n    int countPaths(vector<vector<int>>& grid) {\n        rows_ = grid.size();\n        cols_ = grid[0].size();\n        memo_.assign(rows_, vector<int>(cols_, 0));\n        long long answer = 0;\n        for (int row = 0; row < rows_; ++row) {\n            for (int col = 0; col < cols_; ++col) answer = (answer + dfs(grid, row, col)) % kMod;\n        }\n        return answer;\n    }\n};\n```",
  },
  "minimum-number-of-removals-to-make-mountain-array": {
    modelProblem:
      "LeetCode 1671 給定陣列 `nums`。刪除最少元素，使剩下序列成為山形陣列：先嚴格遞增再嚴格遞減，且峰值左右皆至少有一個元素。",
    signals: [
      "刪除最少等價於保留最長合法子序列。",
      "每個位置皆可作為峰值。",
      "峰值左側需 LIS，右側需 LDS。",
    ],
    invariants: [
      "`left[i]` 為以 i 結尾的最長嚴格遞增子序列長度。",
      "`right[i]` 為以 i 開始的最長嚴格遞減子序列長度。",
      "僅 `left[i] > 1 && right[i] > 1` 的位置可作峰值。",
    ],
    derivation: [
      "由左至右計算每個位置的 LIS 長度。",
      "由右至左計算每個位置往右的嚴格遞減長度。",
      "枚舉峰值 i，山形長度為 `left[i] + right[i] - 1`。",
      "答案為 `n - max_mountain_length`。",
    ],
    patterns: ["LIS 長度表", "前後綴 DP", "枚舉峰值"],
    pitfalls: [
      "左右任一側長度為 1 時即非合法山形。",
      "嚴格遞增須使用 `lower_bound`，而非 `upper_bound`。",
    ],
    complexity: "兩次 LIS 計算 `O(n log n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\n    vector<int> lisLengths(const vector<int>& nums) {\n        vector<int> tails;\n        vector<int> lengths(nums.size());\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            auto it = lower_bound(tails.begin(), tails.end(), nums[i]);\n            int length = it - tails.begin() + 1;\n            if (it == tails.end()) tails.push_back(nums[i]); else *it = nums[i];\n            lengths[i] = length;\n        }\n        return lengths;\n    }\n\npublic:\n    int minimumMountainRemovals(vector<int>& nums) {\n        vector<int> left = lisLengths(nums);\n        vector<int> reversed_nums(nums.rbegin(), nums.rend());\n        vector<int> right = lisLengths(reversed_nums);\n        reverse(right.begin(), right.end());\n\n        int best = 0;\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            if (left[i] > 1 && right[i] > 1) best = max(best, left[i] + right[i] - 1);\n        }\n        return nums.size() - best;\n    }\n};\n```",
  },
  "shortest-cycle-in-a-graph": {
    modelProblem:
      "LeetCode 2608 給定 n 個點的無向圖 `edges`，找出圖中最短 cycle 的長度；若不存在 cycle 則回傳 -1。",
    signals: [
      "無向無權圖。",
      "詢問最短 cycle，可由每個起點做 BFS。",
      "BFS tree 中遇到非父邊即代表形成 cycle。",
    ],
    invariants: [
      "自 source 做 BFS 時，`dist[node]` 為 source 到 node 的最短距離。",
      "若見到已訪問鄰點且非父邊，則 `dist[u] + dist[v] + 1` 為一個 cycle 長度。",
      "對所有 source 取最小值即得全圖最短 cycle。",
    ],
    derivation: [
      "建立無向鄰接表。",
      "枚舉每個 source 進行 BFS，記錄 dist 與 parent。",
      "擴展邊 `(node,next)` 時，若 next 未訪問則入隊。",
      "若 next 已訪問且非 parent，更新答案。",
    ],
    patterns: ["無權圖 BFS", "BFS 找最短環", "父邊排除"],
    pitfalls: [
      "無向圖中返回父節點的邊不可視為 cycle。",
      "僅自單一點做 BFS 可能漏掉其他 component 的最短環。",
    ],
    complexity: "對每個點做 BFS，時間 `O(V*(V+E))`，空間 `O(V+E)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int findShortestCycle(int n, vector<vector<int>>& edges) {\n        vector<vector<int>> graph(n);\n        for (const auto& edge : edges) {\n            graph[edge[0]].push_back(edge[1]);\n            graph[edge[1]].push_back(edge[0]);\n        }\n\n        int answer = INT_MAX;\n        for (int source = 0; source < n; ++source) {\n            vector<int> dist(n, -1), parent(n, -1);\n            queue<int> q;\n            dist[source] = 0;\n            q.push(source);\n            while (!q.empty()) {\n                int node = q.front();\n                q.pop();\n                for (int next_node : graph[node]) {\n                    if (dist[next_node] == -1) {\n                        dist[next_node] = dist[node] + 1;\n                        parent[next_node] = node;\n                        q.push(next_node);\n                    } else if (parent[node] != next_node && parent[next_node] != node) {\n                        answer = min(answer, dist[node] + dist[next_node] + 1);\n                    }\n                }\n            }\n        }\n        return answer == INT_MAX ? -1 : answer;\n    }\n};\n```",
  },
  "parallel-courses-iii": {
    modelProblem:
      "LeetCode 2050 給定 n 門課、先修關係 `relations` 與每門課耗時 `time`。多門課可並行修，先修完成即可開始；求完成所有課程的最短月份數。",
    signals: [
      "有向先修依賴。",
      "可並行，答案為 DAG 上最長路。",
      "若前驅完成時間不同則取最大者。",
    ],
    invariants: [
      "入度為 0 的課程可立即開始。",
      "`finish[i]` 為完成第 i 門課的最早時間。",
      "拓撲處理至某課時，所有已處理前驅皆已將可能答案傳予該課。",
    ],
    derivation: [
      "建立 `prev -> next` 有向圖與 indegree。",
      "將所有 indegree 為 0 的課程入隊，初始完成時間為自身耗時。",
      "彈出課程後，以 `finish[cur] + time[next]` 更新後繼。",
      "後繼入度降為 0 時入隊。",
      "所有課程完成時間的最大值即為答案。",
    ],
    patterns: ["Kahn 拓撲排序", "DAG 最長路", "依賴排程"],
    pitfalls: [
      "並非將所有耗時相加，因課程可並行。",
      "邊方向必須由先修指向後修。",
    ],
    complexity: "`O(n + relations.size())`。",
    code: "```cpp\nclass Solution {\npublic:\n    int minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {\n        vector<vector<int>> graph(n);\n        vector<int> indegree(n, 0), finish(n, 0);\n        for (const auto& relation : relations) {\n            int from = relation[0] - 1;\n            int to = relation[1] - 1;\n            graph[from].push_back(to);\n            indegree[to]++;\n        }\n\n        queue<int> q;\n        for (int course = 0; course < n; ++course) {\n            finish[course] = time[course];\n            if (indegree[course] == 0) q.push(course);\n        }\n\n        while (!q.empty()) {\n            int course = q.front();\n            q.pop();\n            for (int next_course : graph[course]) {\n                finish[next_course] = max(finish[next_course], finish[course] + time[next_course]);\n                if (--indegree[next_course] == 0) q.push(next_course);\n            }\n        }\n        return *max_element(finish.begin(), finish.end());\n    }\n};\n```",
  },
  "minimum-weighted-subgraph-with-the-required-paths": {
    modelProblem:
      "LeetCode 2203 給定有向帶權圖與 `src1`、`src2`、`dest`。選一個子圖使 src1 與 src2 皆能到達 dest，且子圖邊權總和最小。",
    signals: [
      "兩個起點皆須到同一終點。",
      "邊權非負。",
      "可於某匯合點 meet 後共用到 dest 的路徑。",
    ],
    invariants: [
      "`dist1[x]` 為 src1 到 x 的最短路。",
      "`dist2[x]` 為 src2 到 x 的最短路。",
      "`dist_to_dest[x]` 可由反圖上從 dest 出發的 Dijkstra 取得。",
    ],
    derivation: [
      "於原圖上分別自 src1 與 src2 跑 Dijkstra。",
      "建立反圖，自 dest 跑 Dijkstra，得到每個點到 dest 的最短路。",
      "枚舉匯合點 x，候選答案為 `dist1[x] + dist2[x] + dist_to_dest[x]`。",
      "若三段任一不可達則跳過該 x。",
    ],
    patterns: ["多源需求拆為多次 Dijkstra", "反圖最短路", "枚舉匯合點"],
    pitfalls: [
      "不可僅找 src1 到 src2 或 src2 到 src1 的路。",
      "到 dest 的距離須於反圖上自 dest 出發求得。",
      "距離須使用 `long long`。",
    ],
    complexity: "三次 Dijkstra，時間 `O((V+E)logV)`，空間 `O(V+E)`。",
    code: "```cpp\nclass Solution {\n    vector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& graph, int source) {\n        constexpr long long kInf = 4e18;\n        vector<long long> dist(n, kInf);\n        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n        dist[source] = 0;\n        pq.push({0, source});\n        while (!pq.empty()) {\n            auto [current_dist, node] = pq.top();\n            pq.pop();\n            if (current_dist != dist[node]) continue;\n            for (auto [next_node, weight] : graph[node]) {\n                if (dist[next_node] > current_dist + weight) {\n                    dist[next_node] = current_dist + weight;\n                    pq.push({dist[next_node], next_node});\n                }\n            }\n        }\n        return dist;\n    }\n\npublic:\n    long long minimumWeight(int n, vector<vector<int>>& edges, int src1, int src2, int dest) {\n        vector<vector<pair<int, int>>> graph(n), reverse_graph(n);\n        for (const auto& edge : edges) {\n            graph[edge[0]].push_back({edge[1], edge[2]});\n            reverse_graph[edge[1]].push_back({edge[0], edge[2]});\n        }\n        auto dist1 = dijkstra(n, graph, src1);\n        auto dist2 = dijkstra(n, graph, src2);\n        auto dist3 = dijkstra(n, reverse_graph, dest);\n        constexpr long long kInf = 4e18;\n        long long answer = kInf;\n        for (int meet = 0; meet < n; ++meet) {\n            if (dist1[meet] == kInf || dist2[meet] == kInf || dist3[meet] == kInf) continue;\n            answer = min(answer, dist1[meet] + dist2[meet] + dist3[meet]);\n        }\n        return answer == kInf ? -1 : answer;\n    }\n};\n```",
  },
  "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree": {
    modelProblem:
      "LeetCode 1489 給定無向帶權連通圖。若某條邊出現於所有 MST 中即為 critical edge；若某條邊可出現於至少一棵 MST 中則為 pseudo-critical edge。分類所有邊。",
    signals: [
      "問題本質為 MST 邊的重要性。",
      "需比較強制加入或禁用某邊後的 MST 權重。",
      "Kruskal + DSU 可重算 MST。",
    ],
    invariants: [
      "基準 MST 權重 `base` 為所有 MST 的最小權重。",
      "排除邊 e 後若無法連通或權重大於 base，則 e 為 critical。",
      "強制加入 e 後若仍能得到權重 base，則 e 為 pseudo-critical。",
    ],
    derivation: [
      "先為每條邊附上原始下標並依權重排序。",
      "以 Kruskal 求基準 MST 權重。",
      "對每條邊先測試 skip 該邊的 MST 權重。",
      "若非 critical，再測試 force 該邊後的 MST 權重。",
      "依測試結果分入兩個答案列表。",
    ],
    patterns: ["Kruskal", "DSU", "強制/禁止邊敏感度分析"],
    pitfalls: [
      "排序後須保留原始 edge index。",
      "強制加入邊時須先將該邊權重與合併計入。",
      "若 picked 邊數不足 `n-1`，該 MST 權重視為無限大。",
    ],
    complexity: "對每條邊重跑 Kruskal，時間 `O(E^2 α(V))` 加排序。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<vector<int>> findCriticalAndPseudoCriticalEdges(int n, vector<vector<int>>& edges) {\n        // 1. append original index to each edge: {from, to, weight, index}\n        // 2. sort by weight and implement kruskal(skip_index, force_index)\n        // 3. base = kruskal(-1, -1)\n        // 4. if kruskal(edge_index, -1) > base -> critical\n        // 5. else if kruskal(-1, edge_index) == base -> pseudo-critical\n        return { {}, {} };\n    }\n};\n```",
  },
  "critical-connections-in-a-network": {
    modelProblem:
      "LeetCode 1192 給定 n 個伺服器與無向連線。若移除某條連線後圖不再連通，該連線即為 critical connection；找出所有 critical connections。",
    signals: [
      "詢問刪除一條邊是否使圖斷開。",
      "無向圖橋問題。",
      "需要 DFS 時間戳與 low-link。",
    ],
    invariants: [
      "`dfn[u]` 為 u 首次被 DFS 訪問的時間。",
      "`low[u]` 為 u 子樹透過 DFS tree edge 或 back edge 可回到的最小 dfn。",
      "若 tree edge `(u,v)` 滿足 `low[v] > dfn[u]`，即為橋。",
    ],
    derivation: [
      "建立無向鄰接表並保留 edge id。",
      "DFS 時為每個點設定 dfn 與 low。",
      "回溯 child 後以 `low[child]` 更新 `low[node]`。",
      "若 child 無法回到 node 或 node 祖先，記錄該邊。",
    ],
    patterns: ["Tarjan bridge", "low-link", "edge id 排除父邊"],
    pitfalls: [
      "不可僅以 parent node 排除父邊，重邊情境會出錯。",
      "`low[v] > dfn[u]` 方為橋；等於則代表有回邊。",
    ],
    complexity: "`O(V + E)`。",
    code: "```cpp\nclass Solution {\n    vector<vector<pair<int, int>>> graph_;\n    vector<int> dfn_;\n    vector<int> low_;\n    vector<vector<int>> answer_;\n    int timer_ = 0;\n\n    void dfs(int node, int parent_edge) {\n        dfn_[node] = low_[node] = ++timer_;\n        for (auto [next_node, edge_id] : graph_[node]) {\n            if (edge_id == parent_edge) continue;\n            if (dfn_[next_node] == 0) {\n                dfs(next_node, edge_id);\n                low_[node] = min(low_[node], low_[next_node]);\n                if (low_[next_node] > dfn_[node]) answer_.push_back({node, next_node});\n            } else {\n                low_[node] = min(low_[node], dfn_[next_node]);\n            }\n        }\n    }\n\npublic:\n    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {\n        graph_.assign(n, {});\n        for (int id = 0; id < (int)connections.size(); ++id) {\n            int a = connections[id][0], b = connections[id][1];\n            graph_[a].push_back({b, id});\n            graph_[b].push_back({a, id});\n        }\n        dfn_.assign(n, 0);\n        low_.assign(n, 0);\n        dfs(0, -1);\n        return answer_;\n    }\n};\n```",
  },
  "maximum-students-taking-exam": {
    modelProblem:
      "LeetCode 1349 給定座位矩陣，壞座位不可坐。學生不可坐於左右相鄰位置，亦不可坐於左上或右上斜對角可作弊的位置；求最多可安排學生數。",
    signals: [
      "每列座位狀態可壓為 bitmask。",
      "同列限制與相鄰列限制分開檢查。",
      "亦可建成二分圖最大獨立集模型。",
    ],
    invariants: [
      "一列 mask 合法代表不使用壞座位且無左右相鄰 1。",
      "`dp[row][mask]` 表示第 row 列使用 mask 時，前 row 列的最大安排數。",
      "相鄰兩列 mask 不可於斜對角位置衝突。",
    ],
    derivation: [
      "將每列可用座位轉為 bitmask。",
      "枚舉每列所有合法 mask。",
      "以 DP 由上一列合法 mask 轉移至當前 mask。",
      "檢查 `(prev << 1) & mask` 與 `(prev >> 1) & mask` 皆為 0。",
    ],
    patterns: ["狀態壓縮 DP", "二分圖最大獨立集等價模型", "列間相容性"],
    pitfalls: [
      "左右相鄰為同列限制，斜對角為相鄰列限制。",
      "bitmask 的 1 代表坐人，並非壞座位。",
    ],
    complexity: "若每列合法 mask 數為 S，時間 `O(rows*S^2)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int maxStudents(vector<vector<char>>& seats) {\n        int rows = seats.size();\n        int cols = seats[0].size();\n        vector<int> valid_masks;\n        for (int mask = 0; mask < (1 << cols); ++mask) {\n            if ((mask & (mask << 1)) == 0) valid_masks.push_back(mask);\n        }\n        vector<unordered_map<int, int>> dp(rows + 1);\n        dp[0][0] = 0;\n        for (int row = 0; row < rows; ++row) {\n            int available = 0;\n            for (int col = 0; col < cols; ++col) if (seats[row][col] == '.') available |= 1 << col;\n            for (auto [prev_mask, value] : dp[row]) {\n                for (int mask : valid_masks) {\n                    if ((mask & ~available) != 0) continue;\n                    if (((prev_mask << 1) & mask) || ((prev_mask >> 1) & mask)) continue;\n                    dp[row + 1][mask] = max(dp[row + 1][mask], value + __builtin_popcount((unsigned)mask));\n                }\n            }\n        }\n        int answer = 0;\n        for (auto [mask, value] : dp[rows]) answer = max(answer, value);\n        return answer;\n    }\n};\n```",
  },
  "minimum-time-to-complete-all-tasks": {
    modelProblem:
      "LeetCode 2589 給定多個任務 `[start, end, duration]`。任務可於區間內任選 duration 個整數時間點執行，同一時間可同時服務多個任務；求完成所有任務所需開啟的最少時間點數。",
    signals: [
      "每個任務為區間需求。",
      "按右端點排序後，先滿足早結束的任務。",
      "新開時間點應盡量靠右，以利覆蓋後續任務。",
    ],
    invariants: [
      "處理至某任務時，所有更早結束的任務皆已滿足。",
      "已選時間點越靠右對未來區間越有利。",
      "若當前任務仍缺 need 個時間點，自 end 往 start 補最安全。",
    ],
    derivation: [
      "依 end 由小至大排序任務。",
      "對每個任務先計算 `[start,end]` 中已開啟多少時間點。",
      "若不足 duration，自 end 向左選尚未開啟的時間點補足。",
      "最終已開啟時間點數即為答案。",
    ],
    patterns: ["區間右端點貪心", "最少點覆蓋帶需求區間", "靠右補點"],
    pitfalls: [
      "不可按 start 排序，否則將浪費可覆蓋未來的右側位置。",
      "同一時間點可服務多個任務，故並非累加 duration。",
    ],
    complexity: "簡單實作為 `O(n * U)`，可用線段樹優化至 `O(n log U)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int findMinimumTime(vector<vector<int>>& tasks) {\n        sort(tasks.begin(), tasks.end(), [](const auto& lhs, const auto& rhs) { return lhs[1] < rhs[1]; });\n        vector<int> used(2001, 0);\n        int answer = 0;\n        for (const auto& task : tasks) {\n            int start = task[0], end = task[1], duration = task[2];\n            for (int time = start; time <= end; ++time) duration -= used[time];\n            for (int time = end; duration > 0; --time) {\n                if (used[time]) continue;\n                used[time] = 1;\n                duration--;\n                answer++;\n            }\n        }\n        return answer;\n    }\n};\n```",
  },
  "gcd-sort-of-an-array": {
    modelProblem:
      "LeetCode 1998 給定陣列 `nums`。若兩數的 gcd 大於 1 即可交換；判斷能否藉由任意次交換將陣列排序為非遞減。",
    signals: [
      "交換關係具傳遞性。",
      "兩數是否可連通取決於共享質因數。",
      "可由質因數將值串連為 DSU component。",
    ],
    invariants: [
      "若兩值位於同一 DSU component，代表可藉一系列 gcd>1 的交換互換位置。",
      "每個數與其所有質因數節點合併。",
      "排序後，原位置值與目標值必須位於同一 component。",
    ],
    derivation: [
      "複製並排序 nums 得到 target。",
      "對每個值進行質因數分解，將值與質因數於 DSU 中合併。",
      "逐位置檢查 `nums[i]` 是否能換為 `target[i]`。",
      "若任一位置不連通則無法排序。",
    ],
    patterns: ["質因數分解", "DSU 建連通交換群", "排序後逐位驗證"],
    pitfalls: [
      "gcd 關係並非僅看相鄰元素，而是所有值之間皆可交換。",
      "質因數節點與數值節點共用 DSU 時，大小須開至最大值。",
    ],
    complexity: "分解至 `sqrt(maxV)` 的總成本視值域而定；DSU 操作近似線性。",
    code: "```cpp\nclass Solution {\npublic:\n    bool gcdSort(vector<int>& nums) {\n        // 1. build DSU over values up to max(nums)\n        // 2. factor each x and unite(x, prime_factor)\n        // 3. compare nums with sorted copy; each pair must share a DSU root\n        return true;\n    }\n};\n```",
  },
  "find-beautiful-indices-in-the-given-array-ii": {
    modelProblem:
      "LeetCode 3008 給定字串 `s`、模式 `a`、模式 `b` 與整數 `k`。若 `a` 在位置 i 出現，且存在 `b` 的出現位置 j 使 `|i-j| <= k`，則 i 即為 beautiful index；回傳所有 beautiful index。",
    signals: [
      "需找兩個 pattern 在文字中的所有出現位置。",
      "單次匹配應為線性時間。",
      "匹配後再以二分或雙指標判斷距離。",
    ],
    invariants: [
      "KMP 回傳 pattern 在 s 中的所有起點。",
      "b 的出現位置排序後，可對每個 a 的位置找最近候選。",
      "若最近的 b 距離不超過 k，該 a 起點即合法。",
    ],
    derivation: [
      "以 KMP 找出所有 a 的出現位置。",
      "以 KMP 找出所有 b 的出現位置。",
      "對每個 a_index，於 b_positions 中 lower_bound 找第一個不小於 `a_index-k` 的位置。",
      "若該位置存在且不大於 `a_index+k`，加入答案。",
    ],
    patterns: ["KMP 多次匹配", "匹配結果二分", "距離窗口"],
    pitfalls: [
      "找到完整匹配後須按 prefix function 回退，避免漏掉重疊出現。",
      "距離條件作用於起始下標，而非結束下標。",
    ],
    complexity:
      "兩次 KMP `O(|s|+|a|+|b|)`，查詢 `O(matches_a log matches_b)`。",
    code: "```cpp\nclass Solution {\n    vector<int> findOccurrences(const string& text, const string& pattern) {\n        vector<int> pi(pattern.size()), positions;\n        for (int i = 1; i < (int)pattern.size(); ++i) {\n            int matched = pi[i - 1];\n            while (matched > 0 && pattern[i] != pattern[matched]) matched = pi[matched - 1];\n            if (pattern[i] == pattern[matched]) matched++;\n            pi[i] = matched;\n        }\n        int matched = 0;\n        for (int i = 0; i < (int)text.size(); ++i) {\n            while (matched > 0 && text[i] != pattern[matched]) matched = pi[matched - 1];\n            if (text[i] == pattern[matched]) matched++;\n            if (matched == (int)pattern.size()) {\n                positions.push_back(i - (int)pattern.size() + 1);\n                matched = pi[matched - 1];\n            }\n        }\n        return positions;\n    }\n\npublic:\n    vector<int> beautifulIndices(string s, string a, string b, int k) {\n        vector<int> a_positions = findOccurrences(s, a);\n        vector<int> b_positions = findOccurrences(s, b);\n        vector<int> answer;\n        for (int index : a_positions) {\n            auto it = lower_bound(b_positions.begin(), b_positions.end(), index - k);\n            if (it != b_positions.end() && *it <= index + k) answer.push_back(index);\n        }\n        return answer;\n    }\n};\n```",
  },
  "height-of-binary-tree-after-subtree-removal-queries": {
    modelProblem:
      "LeetCode 2458 給定二叉樹 root 與多個 query。每個 query 移除以某節點為根的整棵子樹，回傳剩餘樹的高度；每個 query 彼此獨立。",
    signals: [
      "每個 query 移除一棵子樹。",
      "需預處理每個節點被移除後外部仍可提供的最大高度。",
      "自底向上計算子樹高度，自頂向下傳遞外部答案。",
    ],
    invariants: [
      "`height[node]` 為 node 子樹高度。",
      "`answer[node]` 為移除 node 子樹後整棵樹的剩餘高度。",
      "走向某個 child 時，外部最大高度來自父節點外部或 sibling 子樹。",
    ],
    derivation: [
      "第一次 DFS 以後序計算每個節點的子樹高度。",
      "第二次 DFS 自 root 往下傳遞 `rest_height`。",
      "對左子節點，候選外部高度為父外部與右子樹高度加上深度。",
      "對右子節點同理使用左子樹。",
      "query 直接查詢預處理答案。",
    ],
    patterns: ["樹形 DP", "rerooting 思想", "自底向上 + 自頂向下"],
    pitfalls: [
      "queries 互相獨立，並非真的連續刪樹。",
      "高度定義以邊數或節點數須一致。",
    ],
    complexity: "兩次 DFS `O(n)`，回答查詢 `O(q)`。",
    code: "```cpp\nclass Solution {\n    unordered_map<int, int> height_;\n    unordered_map<int, int> answer_;\n\n    int getHeight(TreeNode* node) {\n        if (node == nullptr) return -1;\n        return height_[node->val] = max(getHeight(node->left), getHeight(node->right)) + 1;\n    }\n\n    void dfs(TreeNode* node, int depth, int rest_height) {\n        if (node == nullptr) return;\n        answer_[node->val] = rest_height;\n        int left_height = node->left ? height_[node->left->val] : -1;\n        int right_height = node->right ? height_[node->right->val] : -1;\n        dfs(node->left, depth + 1, max(rest_height, depth + 1 + right_height));\n        dfs(node->right, depth + 1, max(rest_height, depth + 1 + left_height));\n    }\n\npublic:\n    vector<int> treeQueries(TreeNode* root, vector<int>& queries) {\n        getHeight(root);\n        dfs(root, 0, 0);\n        vector<int> result;\n        for (int query : queries) result.push_back(answer_[query]);\n        return result;\n    }\n};\n```",
  },
  "maximum-or": {
    modelProblem:
      "LeetCode 2680 給定陣列 `nums` 與整數 `k`。可選一個元素將其乘上 `2^k`，最大化整個陣列的 bitwise OR。",
    signals: [
      "OR 的每個 bit 只需某個數提供即可。",
      "操作僅能集中於一個元素。",
      "需取得某位置以外所有元素的 OR。",
    ],
    invariants: [
      "`prefix_or[i]` 為 i 左側所有元素的 OR。",
      "`suffix_or[i]` 為 i 右側所有元素的 OR。",
      "選擇對 i 操作後，候選答案為 `prefix | (nums[i] << k) | suffix`。",
    ],
    derivation: [
      "先建立前綴 OR 與後綴 OR。",
      "枚舉被乘上 `2^k` 的元素 i。",
      "合併 i 左側 OR、操作後的 nums[i] 與 i 右側 OR。",
      "取最大值。",
    ],
    patterns: ["拆位 OR 貢獻", "前後綴分解", "枚舉唯一操作位置"],
    pitfalls: [
      "左移後可能超過 int，須使用 `long long`。",
      "操作不可分散至多個元素。",
    ],
    complexity: "時間 `O(n)`，空間 `O(n)`；亦可採 suffix 壓縮。",
    code: "```cpp\nclass Solution {\npublic:\n    long long maximumOr(vector<int>& nums, int k) {\n        int n = nums.size();\n        vector<long long> prefix(n + 1, 0), suffix(n + 1, 0);\n        for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] | nums[i];\n        for (int i = n - 1; i >= 0; --i) suffix[i] = suffix[i + 1] | nums[i];\n\n        long long answer = 0;\n        for (int i = 0; i < n; ++i) {\n            answer = max(answer, prefix[i] | (1LL * nums[i] << k) | suffix[i + 1]);\n        }\n        return answer;\n    }\n};\n```",
  },
  "maximum-xor-of-subsequences": {
    modelProblem:
      "LeetCode 3681 給定陣列 `nums`，自其中選出任意子序列使元素 XOR 最大，回傳最大值。",
    signals: [
      "任意子序列的 XOR。",
      "選或不選形成 GF(2) 線性空間。",
      "需求最大可表示 XOR 值。",
    ],
    invariants: [
      "`basis[bit]` 若非 0，表示已有最高位為 bit 的基向量。",
      "插入 x 時以已有基向量消去最高位，直至放入新基或變為 0。",
      "求最大值時自高位往低位嘗試讓答案變大。",
    ],
    derivation: [
      "建立 XOR 線性基。",
      "依序將每個數插入線性基。",
      "自最高位至最低位，若 `answer ^ basis[bit]` 更大則採用。",
      "最終 answer 即為所有子序列 XOR 可達最大值。",
    ],
    patterns: ["線性基", "最大子集 XOR", "GF(2) 高斯消去"],
    pitfalls: [
      "線性基處理的是任意子序列，不保留原順序限制。",
      "bit 上限須依 nums 值域設定。",
    ],
    complexity: "每個數插入 `O(B)`，查詢 `O(B)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int maxXorSubsequences(vector<int>& nums) {\n        constexpr int kMaxBit = 30;\n        array<int, kMaxBit + 1> basis{};\n        for (int x : nums) {\n            for (int bit = kMaxBit; bit >= 0; --bit) {\n                if (((x >> bit) & 1) == 0) continue;\n                if (basis[bit] == 0) {\n                    basis[bit] = x;\n                    break;\n                }\n                x ^= basis[bit];\n            }\n        }\n        int answer = 0;\n        for (int bit = kMaxBit; bit >= 0; --bit) answer = max(answer, answer ^ basis[bit]);\n        return answer;\n    }\n};\n```",
  },
  "maximum-product-of-the-length-of-two-palindromic-substrings": {
    modelProblem:
      "LeetCode 1960 給定字串 `s`，選兩個不重疊的奇數長度回文子字串，使其長度乘積最大，回傳最大乘積。",
    signals: [
      "需要每個中心的最長奇回文半徑。",
      "兩段不重疊，可拆為左側最佳與右側最佳。",
      "Manacher 可於線性時間求所有中心半徑。",
    ],
    invariants: [
      "`radius[i]` 表示以 i 為中心的最大奇回文半徑。",
      "`best_left[i]` 為完全落於 `[0,i]` 的最大奇回文長度。",
      "`best_right[i]` 為完全落於 `[i,n-1]` 的最大奇回文長度。",
    ],
    derivation: [
      "先以 Manacher 求每個中心的奇回文半徑。",
      "將每個回文可覆蓋的右端點更新至 best_left。",
      "由左往右傳遞 best_left，並處理長度每次最多增加 2 的限制。",
      "同理反向得到 best_right。",
      "枚舉切分點 i，最大化 `best_left[i] * best_right[i+1]`。",
    ],
    patterns: ["Manacher", "回文半徑", "前後綴最佳值分解"],
    pitfalls: [
      "本題僅考慮奇數長度回文。",
      "半徑與長度的換算須一致。",
      "兩個回文必須不重疊，故切分點左右不能交叉。",
    ],
    complexity: "Manacher 與前後綴處理皆為 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long maxProduct(string s) {\n        // 1. run odd-length Manacher to get radius for each center\n        // 2. derive best_left[i]: best odd palindrome fully ending at or before i\n        // 3. derive best_right[i]: best odd palindrome fully starting at or after i\n        // 4. enumerate split i and maximize 1LL * best_left[i] * best_right[i + 1]\n        return 0;\n    }\n};\n```",
  },
  "sum-of-scores-of-built-strings": {
    modelProblem:
      "LeetCode 2223 給定字串 `s`。對每個後綴計算其與 `s` 的最長公共前綴長度，回傳所有後綴分數總和。",
    signals: [
      "每個後綴皆須與原字串前綴比較。",
      "暴力比較會重複大量字元。",
      "Z function 正是每個位置開始與整串前綴的 LCP 長度。",
    ],
    invariants: [
      "`z[i]` 表示 `s[i..]` 與 `s[0..]` 的最長公共前綴長度。",
      "維護最右匹配盒 `[left,right]`，盒內區間內容等於前綴。",
      "若 i 在盒內，可由 `z[i-left]` 給出初始下界。",
    ],
    derivation: [
      "計算整個字串的 Z function。",
      "位置 0 的後綴與原字串完全相同，分數為 n。",
      "其他位置 i 的分數即為 `z[i]`。",
      "將 n 與所有 z 值相加。",
    ],
    patterns: ["Z function", "後綴與前綴 LCP", "最右匹配盒"],
    pitfalls: [
      "`z[0]` 通常設為 0，但本題分數須額外加上 n。",
      "盒內初始值須取 `min(right-i+1, z[i-left])`。",
    ],
    complexity: "`O(n)` 時間與 `O(n)` 空間。",
    code: "```cpp\nclass Solution {\npublic:\n    long long sumScores(string s) {\n        int n = s.size();\n        vector<int> z(n, 0);\n        int left = 0;\n        int right = 0;\n        long long answer = n;\n        for (int i = 1; i < n; ++i) {\n            if (i <= right) z[i] = min(right - i + 1, z[i - left]);\n            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;\n            if (i + z[i] - 1 > right) {\n                left = i;\n                right = i + z[i] - 1;\n            }\n            answer += z[i];\n        }\n        return answer;\n    }\n};\n```",
  },
  "count-ways-to-make-array-with-product": {
    modelProblem:
      "LeetCode 1735 給定多個查詢 `[n, k]`，對每個查詢計算有多少個長度為 n 的正整數陣列其元素乘積等於 k，答案取模。",
    signals: [
      "乘積限制可拆為質因數指數分配。",
      "每個質因數的指數可獨立分配至 n 個位置。",
      "分配 e 個相同球至 n 個盒子的方案為組合數。",
    ],
    invariants: [
      "若 `k = p1^e1 * p2^e2 * ...`，不同質因數的分配相互獨立。",
      "單一質因數指數 e 分給 n 個位置的方案數為 `C(n+e-1, e)`。",
      "總方案為所有質因數方案數的乘積。",
    ],
    derivation: [
      "預處理組合數所需的 factorial 與 inverse factorial。",
      "對每個查詢分解 k 的質因數。",
      "對每個指數 e 乘上 `C(n+e-1, e)`。",
      "若最後 k 仍大於 1，代表尚有一個指數為 1 的質因數。",
    ],
    patterns: ["質因數分解", "隔板法", "組合數預處理"],
    pitfalls: [
      "分配的是質因數指數，而非質因數本身。",
      "組合數上界須涵蓋 `n + max_exponent`。",
      "取模除法須使用逆元。",
    ],
    complexity: "預處理 `O(N)`；每個查詢約 `O(sqrt(k))` 分解。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> waysToFillArray(vector<vector<int>>& queries) {\n        // 1. precompute factorials and inverse factorials modulo 1e9+7\n        // 2. factorize k for each query [n, k]\n        // 3. for each prime exponent e, multiply C(n + e - 1, e)\n        // 4. return answers in original order\n        return {};\n    }\n};\n```",
  },
  "find-first-and-last-position-of-element-in-sorted-array": {
    modelProblem:
      "給定非遞減整數陣列 `nums` 與整數 `target`，回傳 `target` 在陣列中第一次與最後一次出現的位置；若不存在則回傳 `{-1, -1}`。",
    signals: [
      "陣列已排序。",
      "target 可能重複出現。",
      "答案要求邊界位置而非任一位置。",
    ],
    invariants: [
      "`lowerBound(nums, target)` 為第一個 `>= target` 的位置。",
      "`lowerBound(nums, target + 1) - 1` 為最後一個 `<= target` 的位置。",
      "若 first 越界或 `nums[first] != target`，代表 target 不存在。",
    ],
    derivation: [
      "將「第一次出現」改寫為第一個 `nums[i] >= target`。",
      "將「最後一次出現」改寫為第一個 `nums[i] >= target + 1` 的前一格。",
      "兩次 lower bound 後進行越界與值相等檢查。",
    ],
    patterns: ["lower_bound 邊界查詢", "兩次二分求閉區間", "半開區間不變式"],
    pitfalls: [
      "找到任一 target 後向左右掃描，最壞會退化為 `O(n)`。",
      "`target + 1` 可能溢位時，應改寫為 upper_bound predicate。",
    ],
    complexity: "兩次二分，時間 `O(log n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> searchRange(vector<int>& nums, int target) {\n        auto lowerBound = [&nums](int value) {\n            int left = 0;\n            int right = nums.size();\n            while (left < right) {\n                int mid = left + (right - left) / 2;\n                if (nums[mid] >= value) {\n                    right = mid;\n                } else {\n                    left = mid + 1;\n                }\n            }\n            return left;\n        };\n\n        int first = lowerBound(target);\n        int after_last = lowerBound(target + 1);\n        if (first == (int)nums.size() || nums[first] != target) return {-1, -1};\n        return {first, after_last - 1};\n    }\n};\n```",
  },
  heaters: {
    modelProblem:
      "給定房屋位置 `houses` 與暖爐位置 `heaters`，每個暖爐可以同一半徑加熱其左右範圍內的房屋；求能覆蓋所有房屋的最小半徑。",
    signals: [
      "每個房屋僅需找最近暖爐。",
      "暖爐位置可排序。",
      "答案為所有房屋到最近暖爐距離的最大值。",
    ],
    invariants: [
      "排序後，某房屋最近的暖爐僅可能為 lower_bound 找到的右側暖爐或其前一個左側暖爐。",
      "`answer` 維護目前所有已處理房屋所需半徑的最大值。",
    ],
    derivation: [
      "先排序 `heaters`。",
      "對每個 `house` 以 lower_bound 找第一個 `>= house` 的暖爐。",
      "同時比較右側暖爐與左側暖爐距離，取較小者作為此房屋需求。",
      "所有房屋需求取最大值即為全域最小半徑。",
    ],
    patterns: ["排序後二分最近點", "每個查詢找左右鄰居", "局部需求取全域最大"],
    pitfalls: [
      "僅看右側暖爐會漏掉左側更近的暖爐。",
      "答案並非距離總和，而是所有房屋最小需求中的最大值。",
    ],
    complexity:
      "排序 `O(m log m)`，每個房屋二分 `O(log m)`，總時間 `O((n + m) log m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int findRadius(vector<int>& houses, vector<int>& heaters) {\n        sort(heaters.begin(), heaters.end());\n        int answer = 0;\n        for (int house : houses) {\n            auto right_it = lower_bound(heaters.begin(), heaters.end(), house);\n            int best = INT_MAX;\n            if (right_it != heaters.end()) best = min(best, abs(*right_it - house));\n            if (right_it != heaters.begin()) best = min(best, abs(*prev(right_it) - house));\n            answer = max(answer, best);\n        }\n        return answer;\n    }\n};\n```",
  },
  "climbing-stairs": {
    modelProblem:
      "給定整數 `n`，自第 0 階開始，每次可走 1 階或 2 階；計算剛好到達第 n 階的不同走法數量。",
    signals: ["最後一步僅有兩種來源。", "狀態僅依賴前兩項。", "詢問方案數。"],
    invariants: [
      "`dp[i]` 表示到達第 i 階的方案數。",
      "最後一步若走 1 階，來源為 `i - 1`；若走 2 階，來源為 `i - 2`。",
      "計算第 i 階時，第 `i - 1` 與第 `i - 2` 階已完成。",
    ],
    derivation: [
      "先定義狀態 `dp[i]`，不可僅寫為「目前答案」。",
      "列出最後一步：由 `i - 1` 走一階或由 `i - 2` 走兩階。",
      "得到轉移 `dp[i] = dp[i - 1] + dp[i - 2]`。",
      "初始化 `dp[0] = 1`，代表不走亦為一種到達起點的方式。",
    ],
    patterns: ["最後一步拆解", "Fibonacci 型 DP", "滾動變數空間壓縮"],
    pitfalls: [
      "`dp[0]` 的語意須界定清楚，否則 n = 1 或 n = 2 易出錯。",
      "若題目擴增可走步數集合，轉移須改為枚舉所有合法前驅。",
    ],
    complexity: "時間 `O(n)`；若僅保留前兩項，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        int prev_two = 1;\n        int prev_one = 1;\n        for (int step = 2; step <= n; ++step) {\n            int current = prev_one + prev_two;\n            prev_two = prev_one;\n            prev_one = current;\n        }\n        return prev_one;\n    }\n};\n```",
  },
  "maximum-average-subarray-i": {
    modelProblem:
      "給定整數陣列 `nums` 與整數 `k`，找出長度剛好為 k 的連續子陣列使其平均值最大，回傳最大平均值。",
    signals: ["固定長度 k。", "連續子陣列。", "平均值最大等價於子陣列和最大。"],
    invariants: [
      "`window_sum` 始終等於目前長度至多為 k 的視窗總和。",
      "當 index `right >= k - 1` 時視窗長度剛好為 k，可更新答案。",
      "更新答案後移除左端，為下一個右端點維護固定長度。",
    ],
    derivation: [
      "平均值分母固定為 k，故僅需最大化長度 k 的視窗和。",
      "右端每次加入 `nums[right]`。",
      "若視窗超過 k 即移除 `nums[right - k]`。",
      "自第一個完整視窗開始更新最大和，最後除以 k。",
    ],
    patterns: ["固定長度滑動視窗", "平均值轉最大和", "右進左出維護總和"],
    pitfalls: [
      "勿對每個視窗重新加總，否則將退化為 `O(nk)`。",
      "答案可能為負數時，最大和初值不可設為 0。",
    ],
    complexity: "一次掃描 `O(n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    double findMaxAverage(vector<int>& nums, int k) {\n        int window_sum = 0;\n        int best_sum = INT_MIN;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            window_sum += nums[right];\n            if (right >= k) window_sum -= nums[right - k];\n            if (right >= k - 1) best_sum = max(best_sum, window_sum);\n        }\n        return 1.0 * best_sum / k;\n    }\n};\n```",
  },
  "two-sum": {
    modelProblem:
      "給定整數陣列 `nums` 與整數 `target`，找出兩個不同下標 `i`、`j` 使 `nums[i] + nums[j] == target`，並回傳該兩個下標。",
    signals: [
      "枚舉右端點時僅需知道左側是否有補數。",
      "每個元素僅能使用一次。",
      "需回傳下標。",
    ],
    invariants: [
      "`seen[value]` 保存目前右端點左側某值的下標。",
      "處理 `right` 時 hash map 不含 `right` 自身，故不會重複使用同一元素。",
      "找到 `target - nums[right]` 時即可更新答案。",
    ],
    derivation: [
      "將雙重迴圈中的左側枚舉壓為 hash map 查詢。",
      "對每個 `right`，先查 `target - nums[right]` 是否在左側出現。",
      "若找到則回傳左側下標與 `right`。",
      "若未找到，再將 `nums[right]` 加入左側集合。",
    ],
    patterns: ["列舉右端點", "hash map 維護左側補數", "查詢後再插入避免自配對"],
    pitfalls: [
      "先插入當前值再查詢，可能於 `target == 2 * nums[right]` 時把自己配給自己。",
      "需回傳下標時，hash map 應存 index 而非僅存布林值。",
    ],
    complexity: "均攤時間 `O(n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            int need = target - nums[right];\n            auto it = seen.find(need);\n            if (it != seen.end()) return {it->second, right};\n            seen[nums[right]] = right;\n        }\n        return {};\n    }\n};\n```",
  },
  "number-of-1-bits": {
    modelProblem:
      "給定非負整數 `n`，回傳其二進位表示中 1 的個數，即 popcount。",
    signals: [
      "僅關心 bit 是否為 1。",
      "每次可消去最低位的 1。",
      "值域固定為整數 bit 數。",
    ],
    invariants: [
      "`n & (n - 1)` 會將 n 的最低位 1 清除。",
      "`answer` 記錄已清除多少個 1。",
      "迴圈結束時 n 為 0，所有 1 皆已計數。",
    ],
    derivation: [
      "若逐位檢查，可看每一位 `(n >> bit) & 1`。",
      "更直接的做法為反覆使用 `n &= n - 1` 清除最低位 1。",
      "每清除一次答案即加一。",
    ],
    patterns: ["lowbit 性質", "清除最低位的 1", "逐 bit 掃描"],
    pitfalls: [
      "若使用有號整數右移，須特別留意負數情況；本題以無號整數較清楚。",
      "`n & (n - 1)` 清的是最低位 1，而非最低位 bit。",
    ],
    complexity: "時間 `O(number_of_ones)`，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int hammingWeight(uint32_t n) {\n        int answer = 0;\n        while (n != 0) {\n            n &= n - 1;\n            answer++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "prime-number-of-set-bits-in-binary-representation": {
    modelProblem:
      "給定整數區間 `[left, right]`，統計其中有多少個整數的二進位 1 的個數為質數。",
    signals: [
      "每個數先轉為 popcount。",
      "popcount 上界甚小。",
      "質數判斷可預先列表。",
    ],
    invariants: [
      "`bits = popcount(x)` 為判斷 x 是否計入答案的唯一狀態。",
      "於 32-bit 整數內，可能的 bit count 甚小，可由布林表判斷質數。",
    ],
    derivation: [
      "預先建立 `is_prime_count`，標記 2、3、5、7、11、13、17、19 等質數。",
      "自 left 至 right 枚舉 x。",
      "計算 `__builtin_popcount(x)`，若在質數表中則答案加一。",
    ],
    patterns: ["枚舉區間", "popcount 後查小範圍質數表", "值域小時預處理判斷"],
    pitfalls: [
      "判斷的是 1 的個數是否為質數，而非 x 本身是否為質數。",
      "1 與 0 皆非質數。",
    ],
    complexity: "枚舉區間，時間 `O(right - left + 1)`，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int countPrimeSetBits(int left, int right) {\n        const unordered_set<int> kPrimeCounts{2, 3, 5, 7, 11, 13, 17, 19};\n        int answer = 0;\n        for (int x = left; x <= right; ++x) {\n            int bit_count = __builtin_popcount((unsigned)x);\n            if (kPrimeCounts.find(bit_count) != kPrimeCounts.end()) answer++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "chuan-di-xin-xi": {
    modelProblem:
      "給定 `n` 名玩家與有向傳遞關係 `relation[i] = {from, to}`，訊息自玩家 0 出發，每輪須沿一條關係傳給下一名玩家；計算恰好傳遞 `k` 輪後訊息到達玩家 `n - 1` 的方案數。",
    signals: [
      "有向邊代表可傳遞。",
      "步數 k 固定。",
      "DFS 狀態包含當前節點與已走輪數。",
    ],
    invariants: [
      "`dfs(node, step)` 表示訊息目前位於 node，已傳 step 輪。",
      "每次遞迴僅沿 `node` 的出邊走至下一名玩家，並令 `step + 1`。",
      "僅當 `step == k` 時可更新答案，且須檢查 node 是否為 `n - 1`。",
    ],
    derivation: [
      "將玩家視為節點，relation 視為有向邊。",
      "建立 adjacency list，使 DFS 可由當前玩家枚舉下一輪可傳給誰。",
      "自 `dfs(0, 0)` 開始搜尋。",
      "若 `step == k`，僅 `node == n - 1` 時答案加一。",
      "否則枚舉所有鄰點並遞迴至 `step + 1`。",
    ],
    patterns: ["固定深度 DFS", "有向圖鄰接表", "DFS 參數帶步數限制"],
    pitfalls: [
      "本題詢問恰好 k 輪方案數，並非到達終點即停止。",
      "DFS 的 visited 不可僅按 node 記錄，因同一節點在不同 step 為不同狀態。",
    ],
    complexity:
      "若不加記憶化，時間與長度為 k 的可行路徑數相關；題目規模較大時可將 `(node, step)` 記憶化為 `O(k * (V + E))`。",
    code: "```cpp\nclass Solution {\n    vector<vector<int>> graph_;\n    int target_ = 0;\n    int max_step_ = 0;\n    int answer_ = 0;\n\n    void dfs(int node, int step) {\n        if (step == max_step_) {\n            if (node == target_) answer_++;\n            return;\n        }\n        for (int next_node : graph_[node]) {\n            dfs(next_node, step + 1);\n        }\n    }\n\npublic:\n    int numWays(int n, vector<vector<int>>& relation, int k) {\n        graph_.assign(n, {});\n        for (const auto& edge : relation) {\n            graph_[edge[0]].push_back(edge[1]);\n        }\n        target_ = n - 1;\n        max_step_ = k;\n        dfs(0, 0);\n        return answer_;\n    }\n};\n```",
  },
  "split-linked-list-in-parts": {
    modelProblem:
      "給定鏈結串列 `head` 與整數 `k`，將鏈表按原順序切為 k 段，使每段長度盡量相等且前面段的長度可比後面段多 1，回傳每段的頭節點。",
    signals: ["head 會被切斷。", "須保留原順序。", "每段長度由總長度除以 k 決定。"],
    invariants: [
      "`base = length / k` 為每段至少分得的節點數。",
      "前 `extra = length % k` 段各多一個節點。",
      "切段時須先保存下一段頭節點，再將當前段尾的 `next` 設為 `nullptr`。",
    ],
    derivation: [
      "先遍歷一次取得鏈表總長度。",
      "計算每段長度：前 extra 段為 `base + 1`，其餘為 `base`。",
      "依序走至每段尾端，保存下一段頭並斷開。",
      "將每段頭放入答案陣列。",
    ],
    patterns: ["先算長度再切段", "前段承接餘數", "斷鏈前保存下一段頭"],
    pitfalls: [
      "若 k 大於鏈表長度，後面的段應為空指標。",
      "切斷 `next` 前未保存下一段頭將丟失後續節點。",
    ],
    complexity: "遍歷鏈表常數次，時間 `O(n + k)`，額外空間不含答案為 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<ListNode*> splitListToParts(ListNode* head, int k) {\n        int length = 0;\n        for (ListNode* node = head; node != nullptr; node = node->next) length++;\n        int base = length / k;\n        int extra = length % k;\n\n        vector<ListNode*> answer(k, nullptr);\n        ListNode* current = head;\n        for (int part = 0; part < k; ++part) {\n            answer[part] = current;\n            int part_size = base + (part < extra ? 1 : 0);\n            for (int i = 1; i < part_size; ++i) current = current->next;\n            if (current != nullptr) {\n                ListNode* next_head = current->next;\n                current->next = nullptr;\n                current = next_head;\n            }\n        }\n        return answer;\n    }\n};\n```",
  },
  "next-greater-element-i": {
    modelProblem:
      "給定兩個無重複元素的陣列 `nums1` 與 `nums2`，其中 `nums1` 為 `nums2` 的子集。對 `nums1` 中每個元素，找出其在 `nums2` 中右側第一個比它大的元素；若不存在則為 -1。",
    signals: ["右側第一個更大。", "nums2 可先預處理。", "查詢僅針對 nums1。"],
    invariants: [
      "單調棧中保存尚未找到下一個更大值的元素。",
      "當 `x` 大於棧頂元素時，`x` 即為該棧頂的下一個更大值。",
      "`next_greater[value]` 保存 nums2 中每個值的答案。",
    ],
    derivation: [
      "掃描 `nums2`，以遞減棧維護待解決元素。",
      "每遇新值 x，彈出所有小於 x 的棧頂並記錄其答案為 x。",
      "掃描結束後，未被解決的元素答案為 -1。",
      "最後依 `nums1` 查表輸出。",
    ],
    patterns: ["下一個更大元素", "單調遞減棧", "先預處理再回答子集查詢"],
    pitfalls: [
      "棧中保存的是尚未找到右側更大值的元素。",
      "若元素可重複，不可直接以 value 為 hash key，須改存 index。",
    ],
    complexity: "每個元素入棧出棧各一次，時間 `O(n + m)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n        unordered_map<int, int> next_greater;\n        vector<int> stack;\n        for (int x : nums2) {\n            while (!stack.empty() && stack.back() < x) {\n                next_greater[stack.back()] = x;\n                stack.pop_back();\n            }\n            stack.push_back(x);\n        }\n\n        vector<int> answer;\n        for (int x : nums1) {\n            auto it = next_greater.find(x);\n            answer.push_back(it == next_greater.end() ? -1 : it->second);\n        }\n        return answer;\n    }\n};\n```",
  },
  "furthest-building-you-can-reach": {
    modelProblem:
      "LeetCode 1642 給定建築高度 `heights`、磚塊數 `bricks` 與梯子數 `ladders`。由第 i 棟走到第 i+1 棟時，若高度增加 `diff > 0`，須消耗 `diff` 個磚塊或 1 把梯子；若高度不增加則不消耗資源。回傳在資源限制下能到達的最遠建築下標。",
    signals: [
      "僅於向上爬時消耗資源。",
      "梯子宜保留給目前遇過的最大爬升。",
      "掃描至某一步方知先前的資源分配是否需要反悔。",
    ],
    invariants: [
      "max-heap 保存目前暫時以磚塊支付的所有爬升高度。",
      "`used_bricks` 為扣除反悔後仍由磚塊支付的爬升總和。",
      "當 `used_bricks > bricks` 時，將 heap 中最大爬升改由梯子支付，即一次反悔。",
      "若已無梯子可反悔且磚塊仍超限，當前邊無法跨過，答案即為前一棟建築。",
    ],
    derivation: [
      "由左至右掃描相鄰建築，略過高度未增加的邊。",
      "先假設每個正爬升皆以磚塊支付，將 `diff` 加入 `used_bricks` 並放入 max-heap。",
      "若磚塊超限，從 heap 取出目前最大爬升改以一把梯子支付。",
      "反悔後若梯子用盡且磚塊仍超限，代表無法跨過當前邊。",
      "能完成所有邊時，答案即為最後一棟建築的下標。",
    ],
    patterns: [
      "反悔堆",
      "先用便宜資源承擔，再將最大代價改交予稀缺資源",
      "掃描到違規時移除已選集合中最值得替換的元素",
    ],
    pitfalls: [
      "本題並非見最大爬升即立刻用梯子，而是先暫定、超限時方反悔。",
      "heap 中應放爬升高度，而非建築高度或下標。",
      "僅 `diff > 0` 時方需消耗資源。",
    ],
    complexity:
      "每個正爬升至多進出 heap 一次，時間 `O(n log n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int furthestBuilding(vector<int>& heights, int bricks, int ladders) {\n        priority_queue<int> paid_by_bricks;\n        long long used_bricks = 0;\n\n        for (int i = 0; i + 1 < (int)heights.size(); ++i) {\n            int climb = heights[i + 1] - heights[i];\n            if (climb <= 0) continue;\n\n            used_bricks += climb;\n            paid_by_bricks.push(climb);\n\n            if (used_bricks > bricks) {\n                if (ladders == 0) return i;\n                used_bricks -= paid_by_bricks.top();\n                paid_by_bricks.pop();\n                ladders--;\n            }\n        }\n        return heights.size() - 1;\n    }\n};\n```",
  },
  "ugly-number-iii": {
    modelProblem:
      "LeetCode 1201 給定正整數 `n`、`a`、`b`、`c`。若一個正整數可被 `a`、`b`、`c` 至少其一整除，即為 ugly number；回傳第 n 個 ugly number。",
    signals: [
      "題目詢問第 n 小的值，而非列出所有值。",
      "固定候選值 x 後可計算 `<= x` 的合法數量。",
      "合法數量隨 x 單調不減。",
    ],
    invariants: [
      "`count(x)` 表示 `[1, x]` 中可被 a、b、c 至少其一整除的數量。",
      "若 `count(x) >= n`，第 n 小 ugly number 必不大於 x。",
      "二分區間始終保留第一個讓 `count(x) >= n` 成立的位置。",
    ],
    derivation: [
      "以容斥計算 `count(x)`：分別加 `x/a`、`x/b`、`x/c`，扣除兩兩 lcm，補回三者 lcm。",
      "答案下界為 1，上界可取 `min(a,b,c) * n`。",
      "對 mid 計算 `count(mid)`；若數量足夠則收縮右界，否則提高左界。",
      "迴圈結束時 left 即為第一個數量達到 n 的值。",
    ],
    patterns: [
      "第 k 小值域二分",
      "二分答案 + 計數函式",
      "容斥原理計算可整除個數",
      "lcm 去重",
    ],
    pitfalls: [
      "三個集合的交集須以容斥補回，不可僅加三個整除數量。",
      "lcm 與乘法可能溢位，須使用 `long long`。",
      "本題找的是第一個 `count(x) >= n` 的 x，並非任意 count 等於 n 的 x。",
    ],
    complexity: "每次 check 為 `O(1)`，值域二分 `O(log answer)`，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\n    long long lcmLl(long long a, long long b) {\n        return a / gcd(a, b) * b;\n    }\n\npublic:\n    int nthUglyNumber(int n, int a, int b, int c) {\n        long long ab = lcmLl(a, b);\n        long long ac = lcmLl(a, c);\n        long long bc = lcmLl(b, c);\n        long long abc = lcmLl(ab, c);\n\n        auto countUgly = [a, b, c, ab, ac, bc, abc](long long value) {\n            return value / a + value / b + value / c - value / ab - value / ac - value / bc + value / abc;\n        };\n\n        long long left = 1;\n        long long right = 1LL * min({a, b, c}) * n;\n        while (left < right) {\n            long long mid = left + (right - left) / 2;\n            if (countUgly(mid) >= n) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return (int)left;\n    }\n};\n```",
  },
  "find-the-index-of-the-first-occurrence-in-a-string": {
    modelProblem:
      "給定字串 `haystack` 與 `needle`，回傳 `needle` 在 `haystack` 中首次完整出現的起始下標；若不存在則回傳 -1。",
    signals: [
      "固定 pattern。",
      "須找首次匹配。",
      "失配後不應自頭比對整個 pattern。",
    ],
    invariants: [
      "`pi[i]` 保存 `needle[0..i]` 的最長相等真前後綴長度。",
      "`matched` 表示目前 haystack 後綴已匹配 needle 前綴的長度。",
      "當 `matched == needle.size()` 時，答案起點為 `i - needle.size() + 1`。",
    ],
    derivation: [
      "先為 `needle` 建立 prefix function。",
      "掃描 `haystack`，相等時將 `matched` 遞增。",
      "失配時以 `pi[matched - 1]` 回退至仍可能匹配的位置。",
      "首次完整匹配時直接回傳起點。",
    ],
    patterns: [
      "KMP prefix function",
      "失配回退 border",
      "第一次完整匹配直接回傳",
    ],
    pitfalls: [
      "空 pattern 的行為須依題目定義處理。",
      "回退時應使用 `pi[matched - 1]`，而非將 matched 直接歸零。",
    ],
    complexity: "建立 pi 與掃描字串總時間 `O(n + m)`，空間 `O(m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int strStr(string haystack, string needle) {\n        vector<int> pi(needle.size());\n        for (int i = 1; i < (int)needle.size(); ++i) {\n            int matched = pi[i - 1];\n            while (matched > 0 && needle[i] != needle[matched]) matched = pi[matched - 1];\n            if (needle[i] == needle[matched]) matched++;\n            pi[i] = matched;\n        }\n\n        int matched = 0;\n        for (int i = 0; i < (int)haystack.size(); ++i) {\n            while (matched > 0 && haystack[i] != needle[matched]) matched = pi[matched - 1];\n            if (haystack[i] == needle[matched]) matched++;\n            if (matched == (int)needle.size()) return i - (int)needle.size() + 1;\n        }\n        return -1;\n    }\n};\n```",
  },
};
