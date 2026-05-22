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

function scoreProfile(
  profile: LectureTopicProfile,
  planKey: string,
  haystack: string,
) {
  if (profile.planKeys && !profile.planKeys.includes(planKey)) {
    return -1;
  }

  return profile.keywords.reduce(
    (score, keyword) => {
      const normalized_keyword = normalize(keyword);
      if (haystack.includes(normalized_keyword)) {
        return score + Math.max(2, normalized_keyword.length);
      }
      return score;
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

  let best_profile = lectureTopicProfiles[0]!;
  let best_score = -1;
  for (const profile of lectureTopicProfiles) {
    const score = scoreProfile(profile, planKey, haystack);
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

export function formatLectureTopicTitle(section: TutorialData.Section) {
  return stripNumericPrefix(section.title) || section.title;
}

const lectureTopicProfiles: LectureTopicProfile[] = [
  {
    key: "binary-lower-bound",
    planKeys: ["binary_search"],
    keywords: ["基礎", "第一個", "最後一個", "插入位置", "lower", "upper"],
    modelProblem:
      "給定一個非遞減陣列 `nums` 與目標值 `target`，請找出第一個 `nums[i] >= target` 的位置；若要找目標值的左右端點，則分別找 `target` 與 `target + 1` 的 lower bound。",
    signals: ["輸入已排序", "題目問第一個或最後一個位置", "重複值會影響答案"],
    invariants: [
      "`[0, left)` 內的位置都確定不滿足條件。",
      "`[right, n)` 內的位置都可以視為候選答案之後的區域。",
      "答案始終落在半開區間 `[left, right)`。",
    ],
    derivation: [
      "把題目改寫成 predicate：`nums[index] >= target`。",
      "若 `predicate(mid)` 成立，第一個合法位置不會在 mid 右邊，因此令 `right = mid`。",
      "若不成立，mid 與左邊都不是答案，因此令 `left = mid + 1`。",
      "迴圈結束時 `left == right`，就是第一個合法位置；再依題意檢查是否越界。",
    ],
    patterns: [
      "lower_bound",
      "upper_bound",
      "兩次二分求左右端點",
      "二分後做合法性檢查",
    ],
    pitfalls: [
      "閉區間與半開區間更新式不可混用。",
      "找到任一個 target 不等於找到第一個 target。",
    ],
    complexity: "每次查詢 `O(log n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int lowerBound(vector<int>& nums, int target) {\n        int left = 0;\n        int right = nums.size();\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] >= target) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n\n    vector<int> searchRange(vector<int>& nums, int target) {\n        int first = lowerBound(nums, target);\n        int after_last = lowerBound(nums, target + 1);\n        if (first == (int)nums.size() || nums[first] != target) {\n            return {-1, -1};\n        }\n        return {first, after_last - 1};\n    }\n};\n```",
  },
  {
    key: "kth-smallest",
    planKeys: ["binary_search"],
    keywords: ["第 K", "第 k", "K 小", "K 大", "kth", "查詢和最小"],
    modelProblem:
      "給定兩個已排序陣列 `nums1`、`nums2` 與整數 `k`，請回傳和最小的 k 個 pair `(nums1[i], nums2[j])`。每一列固定 i 時，pair sum 會隨 j 遞增，因此可以把候選看成多條已排序鏈的合併。",
    signals: [
      "題目問第 k 小或前 k 小",
      "候選集合不是單一陣列，而是矩陣、pair、子陣列或乘法表",
      "候選值具有局部有序性",
    ],
    invariants: [
      "priority queue 內只放每一條鏈目前尚未輸出的最小候選。",
      "每次彈出的候選是全域當前最小，因為其他候選都不小於各自鏈頭。",
      "對固定 `i`，彈出 `(i, j)` 後只需要推入同列下一個 `(i, j + 1)`。",
    ],
    derivation: [
      "把所有 pair 按 `i` 分成多列：第 i 列是 `(i, 0), (i, 1), ...`，且 sum 遞增。",
      "先把前 `min(k, nums1.size())` 列的第一個 pair 放入 min-heap。",
      "重複 k 次：彈出 heap top，這就是下一個最小 pair。",
      "若彈出的 pair 還有同列下一個候選，推入 `(i, j + 1)`。",
    ],
    patterns: [
      "多路合併",
      "第 k 小候選生成",
      "二分答案 + countLessEqual",
      "heap frontier",
    ],
    pitfalls: [
      "不要一次把所有 `n*m` 個 pair 放入 heap。",
      "若改成第 k 小數值而不需要列出前 k 個，通常可考慮二分答案並計數。",
      "k 可能大於 pair 總數，迴圈條件要同時檢查 heap 是否為空。",
    ],
    complexity:
      "回傳前 k 個 pair 時，時間 `O(k log min(k, n))`，空間 `O(min(k, n))`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {\n        using State = tuple<int, int, int>; // sum, index in nums1, index in nums2\n        priority_queue<State, vector<State>, greater<State>> frontier;\n        vector<vector<int>> answer;\n\n        if (nums1.empty() || nums2.empty() || k == 0) return answer;\n        int initial_rows = min<int>(nums1.size(), k);\n        for (int i = 0; i < initial_rows; ++i) {\n            frontier.push({nums1[i] + nums2[0], i, 0});\n        }\n\n        while (!frontier.empty() && (int)answer.size() < k) {\n            auto [sum, i, j] = frontier.top();\n            frontier.pop();\n            answer.push_back({nums1[i], nums2[j]});\n            if (j + 1 < (int)nums2.size()) {\n                frontier.push({nums1[i] + nums2[j + 1], i, j + 1});\n            }\n        }\n        return answer;\n    }\n};\n```",
    examples: {
      "find-k-pairs-with-smallest-sums": {},
      "kth-smallest-element-in-a-sorted-matrix": {
        modelProblem:
          "給定一個每列、每欄都非遞減的 `n x n` 矩陣與整數 `k`，請找出矩陣中第 k 小的元素。你不需要輸出前 k 個元素，只需要輸出第 k 小的值。",
        signals: [
          "矩陣列與欄都有序",
          "只求第 k 小的值",
          "給定值 x 可計算 `<= x` 的元素個數",
        ],
        derivation: [
          "答案值域是 `[matrix[0][0], matrix[n-1][n-1]]`。",
          "對候選值 `mid`，從左下角出發計算有多少元素 `<= mid`。",
          "若個數至少 k，代表第 k 小不大於 mid，收縮右界。",
          "否則第 k 小大於 mid，移動左界。",
        ],
        complexity: "計數 `O(n)`，二分值域總時間 `O(n log V)`。",
        code: "```cpp\nclass Solution {\npublic:\n    int kthSmallest(vector<vector<int>>& matrix, int k) {\n        int n = matrix.size();\n        int left = matrix[0][0];\n        int right = matrix[n - 1][n - 1];\n\n        auto countLessEqual = [&matrix, n](int value) {\n            int row = n - 1;\n            int col = 0;\n            int count = 0;\n            while (row >= 0 && col < n) {\n                if (matrix[row][col] <= value) {\n                    count += row + 1;\n                    col++;\n                } else {\n                    row--;\n                }\n            }\n            return count;\n        };\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (countLessEqual(mid) >= k) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n};\n```",
      },
    },
  },
  {
    key: "binary-answer",
    planKeys: ["binary_search"],
    keywords: ["求最小", "求最大", "最小化最大值", "最大化最小值", "分間接值"],
    modelProblem:
      "給定一個答案值域，若把候選答案 `x` 固定後，可以用貪心或計數在一次掃描內判斷是否可行，請找出最小可行值或最大可行值。",
    signals: [
      "題目問最小速度、最小容量、最大最小距離",
      "固定答案後可以 check",
      "check 結果具有單調性",
    ],
    invariants: [
      "`can(x)` 為 true 後，所有更寬鬆的 x 也 true。",
      "二分區間始終保留可能答案。",
    ],
    derivation: [
      "先用題目限制推導答案下界與上界。",
      "設計 `can(limit)`，只回答 limit 是否足夠，不在裡面求最優。",
      "若 `can(mid)` 成立，嘗試更小答案；否則提高下界。",
    ],
    patterns: [
      "最小速度",
      "最小容量",
      "最大化最小距離",
      "二分答案 + greedy check",
    ],
    pitfalls: [
      "沒有單調性時不能二分答案。",
      "check 函式的貪心策略也需要證明。",
    ],
    complexity: "`O(log V * check_cost)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int shipWithinDays(vector<int>& weights, int days) {\n        int left = *max_element(weights.begin(), weights.end());\n        int right = accumulate(weights.begin(), weights.end(), 0);\n\n        auto canShip = [&weights, days](int capacity) {\n            int used_days = 1;\n            int current = 0;\n            for (int weight : weights) {\n                if (current + weight > capacity) {\n                    used_days++;\n                    current = 0;\n                }\n                current += weight;\n            }\n            return used_days <= days;\n        };\n\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (canShip(mid)) {\n                right = mid;\n            } else {\n                left = mid + 1;\n            }\n        }\n        return left;\n    }\n};\n```",
  },
  {
    key: "prefix-sum",
    planKeys: ["data_structure", "math"],
    keywords: ["字首和", "前綴和", "同餘", "距離和", "狀態壓縮字首和"],
    modelProblem:
      "給定陣列 `nums` 與目標 `k`，請計算有多少個連續子陣列滿足區間和條件。區間 `(l, r]` 的和等於 `prefix[r] - prefix[l]`。",
    signals: ["連續子陣列", "區間和", "可被 k 整除", "同一前綴狀態重複"],
    invariants: [
      "掃描到 right 時，雜湊表保存所有 left 前綴狀態。",
      "每次只統計以目前 right 結尾的子陣列。",
    ],
    derivation: [
      "定義 `prefix` 為目前掃描過的總和。",
      "若目標是和為 target，需要找過去出現過多少個 `prefix - target`。",
      "若目標是可被 k 整除，需要找同餘餘數相同的舊前綴。",
    ],
    patterns: ["前綴和 + hash map", "前綴同餘", "奇偶 mask 前綴", "二維前綴和"],
    pitfalls: [
      "有負數時不要誤用滑動視窗。",
      "`count[0] = 1` 代表從 index 0 開始的子陣列。",
    ],
    complexity: "一次掃描 `O(n)`，空間 `O(不同前綴狀態數)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        unordered_map<int, int> count;\n        count[0] = 1;\n        int prefix_sum = 0;\n        int answer = 0;\n\n        for (int x : nums) {\n            prefix_sum += x;\n            answer += count[prefix_sum - k];\n            count[prefix_sum]++;\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "enumerate-maintain",
    planKeys: ["data_structure", "rating_2100"],
    keywords: ["列舉", "維護左", "列舉中間", "對角線", "遍歷"],
    modelProblem:
      "給定一個需要枚舉右端點、中間點或對角線的結構，請在枚舉當前位置時維護已掃過部分的最佳候選，避免雙重或三重暴力。",
    signals: [
      "枚舉一個位置後，另一側只需要最大值、最小值、計數或集合",
      "題目可按右端點或中間點拆解",
      "暴力枚舉所有 pair/triple 太慢",
    ],
    invariants: [
      "掃描到 `right` 時，左側資料結構只包含 index `< right` 的候選。",
      "答案只用當前位置與已維護摘要更新，不回頭重掃左側。",
    ],
    derivation: [
      "先決定枚舉哪個維度能讓另一側變成歷史資訊。",
      "把歷史資訊壓成最大值、最小值、計數表或有序集合。",
      "每處理一個位置，先用歷史資訊更新答案，再把當前位置加入歷史集合。",
    ],
    patterns: ["列舉右維護左", "列舉中間", "對角線遍歷", "排序後掃描"],
    pitfalls: [
      "加入當前位置的時機會影響是否把自己配對到自己。",
      "若維護值需要刪除過期元素，普通變數不夠，要改用 heap、deque 或 set。",
    ],
    complexity: "通常把 `O(n^2)` 降成 `O(n)` 或 `O(n log n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long maxPairScore(vector<int>& nums) {\n        long long best_left = LLONG_MIN;\n        long long answer = LLONG_MIN;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            if (best_left != LLONG_MIN) {\n                answer = max(answer, best_left + nums[right] - right);\n            }\n            best_left = max(best_left, 1LL * nums[right] + right);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "difference-array",
    planKeys: ["data_structure"],
    keywords: ["差分", "一維差分", "二維差分"],
    modelProblem:
      "給定長度為 n 的陣列與大量區間加值操作 `[left, right, delta]`，請在所有操作結束後回傳每個位置的值。",
    signals: ["多次區間加減", "最後統一查詢", "更新多、即時查詢少"],
    invariants: [
      "`diff[i]` 表示原陣列在 i 位置相對前一格的變化量。",
      "對 `[l, r]` 加 delta 只需要修改兩個邊界。",
    ],
    derivation: [
      "區間開始處增加 delta，使後面值都多 delta。",
      "區間結束後一格減少 delta，抵消這次更新。",
      "最後對 diff 做前綴和即可還原每個位置。",
    ],
    patterns: ["一維差分", "二維差分", "差分 + 二分答案", "差分 + 掃描線"],
    pitfalls: [
      "閉區間要在 `right + 1` 抵消。",
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
      "請維護一個陣列，支援 `add(index, delta)` 單點加值，以及 `rangeSum(left, right)` 區間和查詢。",
    signals: ["單點更新", "前綴查詢", "逆序對", "動態排名"],
    invariants: [
      "`tree[index]` 保存一段長度為 lowbit(index) 的區間和。",
      "更新往上跳，查詢往下跳。",
    ],
    derivation: [
      "內部使用 1-index，讓 `index & -index` 表示節點管理的區間長度。",
      "單點更新時，所有包含該點的桶都要加 delta。",
      "區間和由兩個前綴和相減得到。",
    ],
    patterns: ["單點加、區間和", "離散化 + 排名", "逆序對", "樹狀陣列二分"],
    pitfalls: ["0-index 直接套 lowbit 會死循環。", "值域大時要先離散化。"],
    complexity: "更新與查詢都是 `O(log n)`，空間 `O(n)`。",
    code: "```cpp\nclass Fenwick {\n    vector<long long> tree_;\n\npublic:\n    explicit Fenwick(int n) : tree_(n + 1, 0) {}\n\n    void add(int index, long long delta) {\n        for (++index; index < (int)tree_.size(); index += index & -index) {\n            tree_[index] += delta;\n        }\n    }\n\n    long long prefixSum(int index) const {\n        long long sum = 0;\n        for (++index; index > 0; index -= index & -index) {\n            sum += tree_[index];\n        }\n        return sum;\n    }\n\n    long long rangeSum(int left, int right) const {\n        return prefixSum(right) - (left == 0 ? 0 : prefixSum(left - 1));\n    }\n};\n```",
  },
  {
    key: "dsu",
    planKeys: ["data_structure", "graph"],
    keywords: ["並查集", "DSU", "Union Find", "最小生成樹", "Kruskal"],
    modelProblem:
      "給定 n 個點與一批逐步加入的無向邊，請維護連通分量、判斷兩點是否連通，或判斷加入一條邊是否形成 cycle。",
    signals: ["逐步加邊", "合併集合", "連通性", "判斷成環", "Kruskal"],
    invariants: [
      "每個集合只有一個代表元。",
      "同一集合內任兩點已由加入過的邊連通。",
    ],
    derivation: [
      "初始化時每個點自成集合。",
      "加入邊 `(u, v)` 時先找兩端代表元。",
      "若代表元相同，這條邊會形成 cycle；否則合併兩個集合。",
    ],
    patterns: ["動態加邊連通性", "Kruskal MST", "冗餘邊", "帶權並查集"],
    pitfalls: ["普通 DSU 不支援刪邊。", "若題目問最短路或路徑內容，DSU 不夠。"],
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
      "給定一個序列，請找每個元素左/右第一個比它大或小的位置，或計算每個元素作為區間極值時可覆蓋多少子陣列。",
    signals: [
      "第一個更大或更小",
      "最近邊界",
      "直方圖",
      "子陣列最小值總和",
      "字典序最小",
    ],
    invariants: [
      "棧內 index 對應的值保持單調。",
      "當新元素破壞單調性，被彈出的元素就確定右邊界。",
    ],
    derivation: [
      "決定棧要遞增或遞減，以及相等元素保留哪一側。",
      "掃描到 i 時，彈出所有被 `nums[i]` 解決的舊 index。",
      "彈出時更新答案；最後未彈出的元素代表右側沒有破壞者。",
    ],
    patterns: [
      "Next Greater Element",
      "直方圖最大矩形",
      "貢獻法",
      "最小字典序 subsequence",
    ],
    pitfalls: [
      "貢獻法中相等元素必須一邊嚴格、一邊非嚴格。",
      "需要距離時應存 index，不只存 value。",
    ],
    complexity: "每個元素最多入棧與出棧一次，總時間 `O(n)`。",
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
      "給定陣列或字串，請在連續窗口上維護計數、總和或種類數，求最長合法窗口、最短合法窗口或合法子陣列數量。",
    signals: [
      "連續子陣列或子字串",
      "右端加入、左端移除後可更新",
      "最多/至少/恰好 k",
    ],
    invariants: [
      "窗口 `[left, right]` 保存目前考慮的連續區間。",
      "移動 left 是為了恢復或打破合法性。",
    ],
    derivation: [
      "右端逐步擴張，加入新元素並更新窗口狀態。",
      "當窗口不符合目前題型的條件時，移動左端並撤銷離開元素。",
      "對每個 right，根據窗口長度或可選 left 數量累加答案。",
    ],
    patterns: [
      "固定長度窗口",
      "最長合法窗口",
      "最短覆蓋窗口",
      "恰好 K = atMost(K) - atMost(K-1)",
    ],
    pitfalls: [
      "若陣列有負數，和的單調性可能不存在。",
      "計數題要明確每個 right 貢獻多少個子陣列。",
    ],
    complexity: "左右指標各走過一次，時間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    long long atMostKDistinct(vector<int>& nums, int k) {\n        unordered_map<int, int> count;\n        long long answer = 0;\n        int left = 0;\n\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            if (count[nums[right]]++ == 0) k--;\n            while (k < 0) {\n                if (--count[nums[left]] == 0) k++;\n                left++;\n            }\n            answer += right - left + 1;\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "knapsack",
    planKeys: ["dynamic_programming"],
    keywords: ["背包", "0-1", "完全背包", "多重背包", "分組背包"],
    modelProblem:
      "給定物品重量、價值與容量限制，請在不同選取規則下最大化價值、判斷可行或計算方案數。",
    signals: ["容量限制", "每個物品最多一次或可重複選", "方案數", "分組選擇"],
    invariants: [
      "`dp[cap]` 表示目前處理過的物品在容量 cap 下的最佳值。",
      "0-1 背包倒序枚舉容量，避免同一物品重複使用。",
    ],
    derivation: [
      "對每個物品，只有選或不選兩種決策。",
      "若選，狀態來自 `cap - weight`。",
      "0-1 倒序、完全背包正序，差別在於是否允許同輪重複使用物品。",
    ],
    patterns: ["0-1 背包", "完全背包", "分組背包", "方案數背包"],
    pitfalls: [
      "容量迴圈方向錯會改變選取規則。",
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
      "給定一個二維網格，移動方向通常受限於向右、向下或固定鄰格，請計算到達每個格子的方案數、最小代價或最大收益。",
    signals: ["二維矩陣", "每格答案由上方或左方轉移", "路徑只能按固定方向前進"],
    invariants: [
      "`dp[row][col]` 表示到達該格或處理到該格時的最佳答案。",
      "填表順序必須保證轉移來源已經計算完成。",
    ],
    derivation: [
      "先定義起點與障礙格如何初始化。",
      "逐列或逐行掃描，每格從合法前驅轉移。",
      "若移動方向會形成環，應改用 BFS/Dijkstra，而不是一次 DP。",
    ],
    patterns: ["路徑計數", "最小路徑和", "帶障礙網格 DP", "滾動陣列壓縮"],
    pitfalls: [
      "第一列與第一行的邊界要單獨處理。",
      "可上下左右任意走的最短路不是普通網格 DP。",
    ],
    complexity: "`O(rows * cols)` 時間，空間可壓到 `O(cols)`。",
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
      "給定一個按 index 推進的序列，請定義 `dp[i]` 表示前 i 個元素的最佳值、可行性或方案數，並由前面狀態轉移。",
    signals: ["前 i 個", "選或不選", "最後一步", "子序列", "切分"],
    invariants: [
      "計算 `dp[i]` 時，它依賴的狀態都已計算完成。",
      "`dp` 的語意必須能完整描述未來需要的資訊。",
    ],
    derivation: [
      "先用暴力遞迴描述最後一步。",
      "找出重複子問題，把遞迴參數變成 dp 維度。",
      "根據依賴順序填表，再視情況壓縮空間。",
    ],
    patterns: ["take/skip", "Kadane 最大子段和", "LIS tails 陣列", "劃分 DP"],
    pitfalls: [
      "全負數最大子段和不能把空段當答案。",
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
      "給定圖或網格，請找出所有可達節點、統計連通塊，或在每條邊代價相同時求最短步數。",
    signals: ["可達性", "連通塊", "島嶼", "等權最短路", "層序"],
    invariants: [
      "BFS 中第一次到達某狀態時距離最短。",
      "DFS/BFS 每個狀態只應被首次訪問時處理。",
    ],
    derivation: [
      "把格子或物件轉成節點，合法移動轉成邊。",
      "若只問連通，用 DFS/BFS 走完整個 component。",
      "若問最短步數且邊權相同，用 queue 按層擴張。",
    ],
    patterns: ["連通塊 DFS", "多源 BFS", "二分圖染色", "狀態 BFS"],
    pitfalls: [
      "狀態包含鑰匙、剩餘資源或時間時，visited 也要包含這些維度。",
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
      "給定 n 個任務、每個任務耗時與依賴關係 `[u, v]`，表示 u 必須在 v 前完成。請判斷是否有 cycle，並求完成所有任務的最早時間。",
    signals: ["有向依賴", "先修課", "任務排程", "DAG 上 DP"],
    invariants: [
      "入度為 0 代表所有前置條件已處理。",
      "在拓撲序中處理節點時，所有前驅 DP 值已確定。",
    ],
    derivation: [
      "建立 `u -> v` 的有向邊與 indegree。",
      "所有 indegree 為 0 的任務可立即開始。",
      "處理 u 時，用 `finish[u] + time[v]` 更新 v 的最早完成時間。",
      "若處理節點數少於 n，代表依賴成環。",
    ],
    patterns: ["Kahn 拓撲排序", "DAG 最長路", "課程表", "依賴排程"],
    pitfalls: [
      "邊方向寫反會讓 DP 語意錯誤。",
      "有 cycle 時不能只回傳最大 finish，必須標記無解。",
    ],
    complexity: "`O(V + E)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int minimumTime(int n, vector<vector<int>>& relations, vector<int>& time) {\n        vector<vector<int>> graph(n);\n        vector<int> indegree(n, 0);\n        vector<int> finish(n, 0);\n        for (auto& edge : relations) {\n            int from = edge[0] - 1;\n            int to = edge[1] - 1;\n            graph[from].push_back(to);\n            indegree[to]++;\n        }\n\n        queue<int> q;\n        for (int node = 0; node < n; ++node) {\n            finish[node] = time[node];\n            if (indegree[node] == 0) q.push(node);\n        }\n\n        int seen = 0;\n        while (!q.empty()) {\n            int node = q.front();\n            q.pop();\n            seen++;\n            for (int next_node : graph[node]) {\n                finish[next_node] = max(finish[next_node], finish[node] + time[next_node]);\n                if (--indegree[next_node] == 0) q.push(next_node);\n            }\n        }\n        return seen == n ? *max_element(finish.begin(), finish.end()) : -1;\n    }\n};\n```",
  },
  {
    key: "dijkstra",
    planKeys: ["graph", "grid"],
    keywords: ["Dijkstra", "最短路", "分層圖", "0-1 BFS", "SPFA", "Floyd"],
    modelProblem:
      "給定非負權圖，請求起點到其他點的最短距離；若題目有折扣、剩餘資源或時間狀態，請把狀態擴成分層圖。",
    signals: ["邊權非負", "最小代價", "狀態包含額外資源", "最短路"],
    invariants: [
      "priority queue 每次取出的最小距離狀態已定型。",
      "鬆弛只在找到更短距離時更新。",
    ],
    derivation: [
      "建立鄰接表，邊保存 `(to, weight)`。",
      "距離初始化為無限大，起點距離為 0。",
      "每次取出目前距離最小的狀態，鬆弛所有出邊。",
    ],
    patterns: ["Dijkstra", "0-1 BFS", "分層圖最短路", "反圖 Dijkstra"],
    pitfalls: [
      "有負權時不能使用 Dijkstra。",
      "額外資源會影響未來時，不能只用 node 當狀態。",
    ],
    complexity: "`O((V + E) log V)`；分層圖需乘上狀態層數。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<long long> dijkstra(int n, vector<vector<pair<int, int>>>& graph, int source) {\n        constexpr long long kInf = 4e18;\n        vector<long long> dist(n, kInf);\n        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n        dist[source] = 0;\n        pq.push({0, source});\n\n        while (!pq.empty()) {\n            auto [current_dist, node] = pq.top();\n            pq.pop();\n            if (current_dist != dist[node]) continue;\n            for (auto [next_node, weight] : graph[node]) {\n                if (dist[next_node] > current_dist + weight) {\n                    dist[next_node] = current_dist + weight;\n                    pq.push({dist[next_node], next_node});\n                }\n            }\n        }\n        return dist;\n    }\n};\n```",
  },
  {
    key: "mst",
    planKeys: ["graph"],
    keywords: ["最小生成樹", "Kruskal", "Prim", "生成樹"],
    modelProblem:
      "給定無向加權圖，請選出 `n - 1` 條邊連通所有點，並讓總權重最小；若無法連通所有點，回傳無解。",
    signals: ["無向圖", "連通所有點", "總成本最小", "選 n-1 條邊"],
    invariants: [
      "Kruskal 掃描到某條邊時，所有更小的邊都已被考慮。",
      "DSU 保證加入的邊不會讓目前森林成環。",
    ],
    derivation: [
      "把所有邊整理成 `(weight, from, to)`。",
      "依權重由小到大排序。",
      "若一條邊連接兩個不同連通塊，就選它並合併。",
      "最後若選了 `n - 1` 條邊，就是 MST。",
    ],
    patterns: ["Kruskal + DSU", "Prim + heap", "最大生成樹", "瓶頸生成樹"],
    pitfalls: ["有向圖不能直接套 MST。", "邊權排序鍵寫錯會破壞貪心。"],
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
      "給定圖，請找出有向圖中的強連通分量，或找出無向圖中移除後會讓連通塊增加的橋。",
    signals: ["互相可達", "critical connections", "刪掉邊是否斷開", "low-link"],
    invariants: [
      "`dfn[u]` 是第一次訪問時間。",
      "`low[u]` 是 u 子樹能回到的最早 dfn。",
    ],
    derivation: [
      "DFS 時記錄每個點的 `dfn` 與 `low`。",
      "回溯時用 child 的 low 更新 parent。",
      "若無向 DFS tree edge `(u, v)` 滿足 `low[v] > dfn[u]`，它就是橋。",
    ],
    patterns: ["Tarjan bridge", "Tarjan SCC", "割點", "縮點 DAG"],
    pitfalls: [
      "無向圖找橋要用 edge id，避免把父邊當回邊。",
      "SCC 是有向圖概念，不等同無向連通塊。",
    ],
    complexity: "`O(V + E)`。",
    code: "```cpp\nclass Solution {\n    vector<vector<pair<int, int>>> graph_;\n    vector<int> dfn_;\n    vector<int> low_;\n    vector<vector<int>> bridges_;\n    int timer_ = 0;\n\n    void dfs(int node, int parent_edge) {\n        dfn_[node] = low_[node] = ++timer_;\n        for (auto [next_node, edge_id] : graph_[node]) {\n            if (edge_id == parent_edge) continue;\n            if (dfn_[next_node] == 0) {\n                dfs(next_node, edge_id);\n                low_[node] = min(low_[node], low_[next_node]);\n                if (low_[next_node] > dfn_[node]) {\n                    bridges_.push_back({node, next_node});\n                }\n            } else {\n                low_[node] = min(low_[node], dfn_[next_node]);\n            }\n        }\n    }\n};\n```",
  },
  {
    key: "network-flow",
    planKeys: ["graph"],
    keywords: ["網路流", "最大流", "最小割", "二分圖匹配", "費用流"],
    modelProblem:
      "給定 source、sink 與帶容量的邊，請求最大可傳輸流量；二分圖匹配與最小割也常可轉成最大流模型。",
    signals: ["容量限制", "source/sink", "匹配", "割", "流量守恆"],
    invariants: [
      "每條正向邊都有一條反向邊表示可撤銷流量。",
      "Dinic 的 DFS 只沿分層圖中 level 增加一層的邊增廣。",
    ],
    derivation: [
      "把每個實體拆成節點，容量限制拆成邊。",
      "BFS 建立 source 到各點的 level。",
      "DFS 在分層圖上送流，直到 sink 不可達。",
    ],
    patterns: ["Dinic 最大流", "二分圖匹配", "最小割建模", "費用流"],
    pitfalls: ["容量方向錯會改變問題。", "反向邊缺失會導致無法撤銷錯誤增廣。"],
    complexity: "Dinic 複雜度依圖性質而定，二分圖匹配場合通常表現穩定。",
    code: "```cpp\nstruct Edge {\n    int to;\n    int rev;\n    long long cap;\n};\n\nclass Dinic {\n    vector<vector<Edge>> graph_;\n    vector<int> level_;\n    vector<int> iter_;\n\npublic:\n    explicit Dinic(int n) : graph_(n), level_(n), iter_(n) {}\n\n    void addEdge(int from, int to, long long cap) {\n        Edge forward{to, (int)graph_[to].size(), cap};\n        Edge backward{from, (int)graph_[from].size(), 0};\n        graph_[from].push_back(forward);\n        graph_[to].push_back(backward);\n    }\n};\n```",
  },
  {
    key: "greedy-interval",
    planKeys: ["greedy"],
    keywords: ["區間", "不相交", "分組", "選點", "覆蓋", "合併"],
    modelProblem:
      "給定一批區間 `[start, end]`，請選出最多不重疊區間、用最少點覆蓋所有區間，或合併重疊區間。",
    signals: ["區間端點", "不重疊", "覆蓋", "會議室", "最少箭"],
    invariants: [
      "按右端點排序時，先選最早結束的區間會留下最大後續空間。",
      "掃描過程中 `last_end` 是已選集合最右邊界。",
    ],
    derivation: [
      "依右端點排序。",
      "若當前區間左端點不早於 `last_end`，就可以選它。",
      "選擇右端點最早的區間可用交換論證：替換後不會減少後續可選區間。",
    ],
    patterns: ["最多不重疊區間", "區間分組", "區間覆蓋", "合併區間"],
    pitfalls: [
      "閉區間與半開區間會影響 `>=` 或 `>`。",
      "覆蓋問題不一定按右端點直接選。",
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
      "給定整數與整除條件，請判斷質數、分解質因數、計算 gcd/lcm，或利用同餘關係統計答案。",
    signals: ["整除", "質數", "因數", "最大公約數", "模", "週期"],
    invariants: [
      "Euclid 中 `gcd(a, b) = gcd(b, a % b)`。",
      "篩法中每個合數會被某個質因數標記。",
    ],
    derivation: [
      "先判斷是單次查詢還是多次查詢。",
      "多次質因數分解時預處理最小質因數 SPF。",
      "把題目限制轉成 gcd、餘數或質因數指數的條件。",
    ],
    patterns: ["Euclid", "質數篩", "SPF 分解", "模運算", "容斥前的數論化簡"],
    pitfalls: [
      "`lcm(a,b)` 要先除以 gcd 再乘，避免溢位。",
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
      "給定文字 `text` 與模式字串 `pattern`，請在線性時間找出 pattern 在 text 中所有出現位置。",
    signals: ["固定 pattern", "前後綴", "border", "週期", "大量匹配"],
    invariants: [
      "`pi[i]` 是 `pattern[0..i]` 的最長相等真前後綴長度。",
      "失配時保留仍可能匹配的最長 border。",
    ],
    derivation: [
      "先對 pattern 建 prefix function。",
      "掃描 text 時，用 matched 表示目前匹配了 pattern 前綴多長。",
      "失配時沿 `pi[matched - 1]` 回退，而不是重頭開始。",
    ],
    patterns: ["KMP 匹配", "border tree", "週期判斷", "字串出現次數統計"],
    pitfalls: [
      "找到一次完整匹配後要回退，否則會漏掉重疊匹配。",
      "pi 的語意不是 Z function。",
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
      "給定鏈結串列或二元樹，請透過指標操作、前序傳狀態、後序合併子樹資訊，完成反轉、刪除、路徑或子樹問題。",
    signals: [
      "ListNode",
      "TreeNode",
      "head 可能改變",
      "子樹資訊",
      "路徑",
      "LCA",
    ],
    invariants: [
      "鏈表操作前要保存即將斷開的 next。",
      "二元樹後序 DFS 回傳的是當前子樹提供給父節點的資訊。",
    ],
    derivation: [
      "鏈表題先畫出每個指標在修改前後指向哪裡。",
      "二元樹題先定義 DFS 回傳值，例如高度、最大單邊路徑或是否平衡。",
      "在回溯階段合併左右子樹，並更新全域答案。",
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
      "改 `next` 前不保存後繼會丟失鏈表後半段。",
      "路徑題要分清向下路徑與任意兩點路徑。",
    ],
    complexity: "通常 `O(n)` 時間；鏈表額外空間 `O(1)`，樹遞迴棧 `O(height)`。",
    code: "```cpp\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n};\n\nclass Solution {\n    int answer_ = 0;\n\n    int depth(TreeNode* node) {\n        if (node == nullptr) return 0;\n        int left_depth = depth(node->left);\n        int right_depth = depth(node->right);\n        answer_ = max(answer_, left_depth + right_depth);\n        return max(left_depth, right_depth) + 1;\n    }\n\npublic:\n    int diameterOfBinaryTree(TreeNode* root) {\n        depth(root);\n        return answer_;\n    }\n};\n```",
  },
  {
    key: "bitwise-contribution",
    planKeys: ["bitwise_operations"],
    keywords: [
      "基礎",
      "位",
      "XOR",
      "異或",
      "AND",
      "OR",
      "拆位",
      "貢獻",
      "試填",
    ],
    modelProblem:
      "給定一組整數，請利用每個 bit 的獨立性計算 XOR/OR/AND 的總貢獻，或從高位到低位構造最大可行答案。",
    signals: [
      "整數可拆成二進位",
      "題目出現 XOR、OR、AND",
      "答案可逐 bit 判斷",
      "值域 bit 數固定",
    ],
    invariants: [
      "逐 bit 貢獻中，每一位可以獨立計算後乘上 `2^bit`。",
      "XOR 的某位為 1，當且僅當兩個數在該位不同。",
      "高位貪心中，已決定的高位不再被低位影響。",
    ],
    derivation: [
      "先決定是 pair、subarray 還是 subset 問題。",
      "若是 pair XOR，統計每一 bit 的 0/1 個數。",
      "若是最大 XOR，從高位到低位嘗試把答案該位設為 1，再檢查是否存在兩個前綴可達成。",
    ],
    patterns: ["逐 bit 貢獻", "高位試填", "狀態壓縮 DP", "線性基"],
    pitfalls: [
      "`1 << bit` 可能溢位，較大值域要用 `1LL << bit`。",
      "XOR 的計數公式不能直接套到 OR/AND。",
    ],
    complexity: "常見為 `O(n * B)`，`B` 是 bit 數。",
    code: "```cpp\nclass Solution {\npublic:\n    long long pairXorSum(vector<int>& nums) {\n        long long answer = 0;\n        for (int bit = 0; bit < 31; ++bit) {\n            long long ones = 0;\n            for (int x : nums) {\n                ones += (x >> bit) & 1;\n            }\n            long long zeros = nums.size() - ones;\n            answer += ones * zeros * (1LL << bit);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "linear-basis",
    planKeys: ["bitwise_operations"],
    keywords: ["線性基", "基向量", "子集異或", "最大異或"],
    modelProblem:
      "給定一組整數，請維護它們在 XOR 意義下能生成的線性空間，用來求任意子集 XOR 的最大值、判斷某個值是否可表示，或計算線性獨立的秩。",
    signals: ["子集 XOR", "最大異或值", "線性獨立", "可表示性", "基向量"],
    invariants: [
      "`basis[bit]` 若非 0，表示目前有一個最高位為 bit 的基向量。",
      "插入新數時不斷用已有最高位基向量消去最高位。",
      "若最後 x 變成 0，代表它可由既有基向量表示。",
    ],
    derivation: [
      "把每個數視為 GF(2) 上的 bit 向量。",
      "從最高位往低位看，若該位已有基向量，就 XOR 消去。",
      "若該位沒有基向量，將目前 x 放入該位，維持每個最高位只有一個代表。",
      "求最大 XOR 時，從高位往低位嘗試 `answer ^ basis[bit]` 是否變大。",
    ],
    patterns: [
      "最大子集 XOR",
      "判斷 XOR 可表示",
      "線性基合併",
      "帶刪除限制時改用可持久化或離線技巧",
    ],
    pitfalls: [
      "線性基只適用 XOR 線性空間，不適用 OR/AND。",
      "bit 上限要依值域決定，`long long` 通常看 60 到 62 位。",
    ],
    complexity: "每次插入或查詢 `O(B)`，`B` 是 bit 數。",
    code: "```cpp\nclass XorBasis {\n    static constexpr int kMaxBit = 60;\n    array<long long, kMaxBit + 1> basis_{};\n\npublic:\n    void insert(long long x) {\n        for (int bit = kMaxBit; bit >= 0; --bit) {\n            if (((x >> bit) & 1LL) == 0) continue;\n            if (basis_[bit] == 0) {\n                basis_[bit] = x;\n                return;\n            }\n            x ^= basis_[bit];\n        }\n    }\n\n    long long maxXor() const {\n        long long answer = 0;\n        for (int bit = kMaxBit; bit >= 0; --bit) {\n            answer = max(answer, answer ^ basis_[bit]);\n        }\n        return answer;\n    }\n};\n```",
  },
  {
    key: "greedy-general",
    planKeys: ["greedy", "rating_2100"],
    keywords: [
      "貪心",
      "最小",
      "最大",
      "反悔",
      "字典序",
      "相鄰不同",
      "交換論證",
      "排序不等式",
      "乘積",
    ],
    modelProblem:
      "給定一批候選決策，請先排序或維護候選集合，每一步做一個可被交換論證證明安全的局部選擇。",
    signals: [
      "局部選擇會影響後續空間",
      "可排序",
      "超限後移除最差候選",
      "要求字典序最小或最大",
    ],
    invariants: [
      "已選集合始終可以擴展成某個最優解。",
      "若使用反悔 heap，heap 中保存目前被暫時接受的候選。",
      "超出限制時，移除已選集合中最不值得保留的元素。",
    ],
    derivation: [
      "先找出排序鍵，讓限制按掃描順序逐步變化。",
      "掃描時把當前候選加入集合。",
      "若集合違反限制，移除成本最大或收益最小的候選，維持可行性。",
    ],
    patterns: ["交換論證", "反悔貪心", "字典序貪心", "構造貪心"],
    pitfalls: [
      "只說「每次選最小」不是證明。",
      "反悔貪心必須說明被移除者永遠不比留下者更值得。",
    ],
    complexity: "通常排序 `O(n log n)`，每個候選進出 heap 一次。",
    code: "```cpp\nclass Solution {\npublic:\n    int scheduleCourse(vector<vector<int>>& courses) {\n        sort(courses.begin(), courses.end(), [](const auto& lhs, const auto& rhs) {\n            return lhs[1] < rhs[1];\n        });\n\n        priority_queue<int> chosen_durations;\n        int used_time = 0;\n        for (const auto& course : courses) {\n            int duration = course[0];\n            int last_day = course[1];\n            used_time += duration;\n            chosen_durations.push(duration);\n            if (used_time > last_day) {\n                used_time -= chosen_durations.top();\n                chosen_durations.pop();\n            }\n        }\n        return chosen_durations.size();\n    }\n};\n```",
  },
  {
    key: "manacher",
    planKeys: ["string"],
    keywords: ["Manacher", "迴文", "中心擴展"],
    modelProblem:
      "給定字串 `s`，請在線性時間求出每個中心的最長迴文半徑，進而計算最長迴文子串或迴文子串數量。",
    signals: ["回文子串", "每個中心", "最長迴文", "中心擴展太慢"],
    invariants: [
      "目前維護的 `[left, right]` 是已知最靠右的迴文區間。",
      "若 i 落在區間內，可用鏡射點 `left + right - i` 提供初始半徑。",
      "半徑延伸停止時，該中心的最大回文範圍已確定。",
    ],
    derivation: [
      "先決定奇偶分開處理，或插入分隔符統一處理。",
      "對每個中心 i，若它在最右迴文區間內，先用鏡射半徑取下界。",
      "再向左右暴力延伸；成功延伸的總次數在線性範圍內。",
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
      "使用分隔符版本時，原字串 index 與處理後 index 要分清。",
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
      "給定字串與大量比較或匹配需求，請選擇 KMP/Z/Manacher/hash/Trie 等工具，把原本重複的字元比較降成線性或近似常數查詢。",
    signals: [
      "固定 pattern 匹配",
      "多 pattern",
      "回文半徑",
      "任意子串比較",
      "前綴或後綴重複比較",
    ],
    invariants: [
      "Z 函式維護最右匹配盒 `[left, right]`。",
      "Manacher 維護最右回文區間，利用鏡射中心得到初始半徑。",
      "Rolling hash 的同長度子串可以用標準化 hash 比較。",
    ],
    derivation: [
      "先判斷昂貴操作是哪一種字串比較。",
      "若比較 pattern 與 text，使用 KMP 或 Z。",
      "若比較任意子串，使用 rolling hash；若是多字典詞，使用 Trie 或 AC 自動機。",
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
      "Hash 有碰撞風險，嚴格場合要雙 hash 或額外驗證。",
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
      "給定計數或幾何限制，請把題目拆成可相乘的選擇、需要容斥的重疊條件，或用向量運算判斷幾何關係。",
    signals: ["方案數", "至少/至多", "期望", "座標", "共線", "面積", "凸包"],
    invariants: [
      "組合計數中，每個物件必須被計數一次且只計數一次。",
      "容斥中，交集大小依違反條件數量的奇偶加減。",
      "幾何中，叉積符號代表方向，絕對值代表平行四邊形面積。",
    ],
    derivation: [
      "先定義被計數的物件或幾何關係。",
      "若限制重疊，用容斥或 DP 拆開。",
      "若是幾何，先用向量、叉積、點積寫出判斷式，再處理邊界。",
    ],
    patterns: [
      "排列組合",
      "容斥原理",
      "期望線性性",
      "叉積判方向",
      "凸包單調鏈",
    ],
    pitfalls: ["排列與組合不可混用。", "幾何題要處理共線、重點與浮點誤差。"],
    complexity: "組合預處理常為 `O(n)`；凸包通常 `O(n log n)`。",
    code: "```cpp\nstruct Point {\n    long long x;\n    long long y;\n};\n\nlong long cross(Point origin, Point a, Point b) {\n    long long ax = a.x - origin.x;\n    long long ay = a.y - origin.y;\n    long long bx = b.x - origin.x;\n    long long by = b.y - origin.y;\n    return ax * by - ay * bx;\n}\n```",
  },
];

const exampleLectureOverrides: NonNullable<LectureTopicProfile["examples"]> = {
  "find-first-and-last-position-of-element-in-sorted-array": {
    modelProblem:
      "給定一個非遞減整數陣列 `nums` 與整數 `target`，請回傳 `target` 在陣列中第一次與最後一次出現的位置；若不存在，回傳 `{-1, -1}`。",
    signals: [
      "陣列已排序",
      "target 可能重複出現",
      "答案要求邊界位置而不是任一位置",
    ],
    invariants: [
      "`lowerBound(nums, target)` 找到第一個 `>= target` 的位置。",
      "`lowerBound(nums, target + 1) - 1` 是最後一個 `<= target` 的位置。",
      "若 first 越界或 `nums[first] != target`，代表 target 不存在。",
    ],
    derivation: [
      "把「第一次出現」改寫成第一個 `nums[i] >= target`。",
      "把「最後一次出現」改寫成第一個 `nums[i] >= target + 1` 的前一格。",
      "兩次 lower bound 後做越界與值相等檢查。",
    ],
    patterns: ["lower_bound 邊界查詢", "兩次二分求閉區間", "半開區間不變式"],
    pitfalls: [
      "找到任一個 target 後向左右掃描，最壞會退化成 `O(n)`。",
      "`target + 1` 可能溢位時，應改寫成 upper_bound predicate。",
    ],
    complexity: "兩次二分，時間 `O(log n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> searchRange(vector<int>& nums, int target) {\n        auto lowerBound = [&nums](int value) {\n            int left = 0;\n            int right = nums.size();\n            while (left < right) {\n                int mid = left + (right - left) / 2;\n                if (nums[mid] >= value) {\n                    right = mid;\n                } else {\n                    left = mid + 1;\n                }\n            }\n            return left;\n        };\n\n        int first = lowerBound(target);\n        int after_last = lowerBound(target + 1);\n        if (first == (int)nums.size() || nums[first] != target) return {-1, -1};\n        return {first, after_last - 1};\n    }\n};\n```",
  },
  heaters: {
    modelProblem:
      "給定房屋位置 `houses` 與暖爐位置 `heaters`，每個暖爐可用同一半徑加熱其左右範圍內的房屋。請求能覆蓋所有房屋的最小半徑。",
    signals: [
      "每個房屋只需要找最近暖爐",
      "暖爐位置可排序",
      "答案是所有房屋到最近暖爐距離的最大值",
    ],
    invariants: [
      "排序後，某個房屋最近的暖爐只可能是 lower_bound 找到的右側暖爐或其前一個左側暖爐。",
      "`answer` 維護目前所有已處理房屋所需半徑的最大值。",
    ],
    derivation: [
      "先排序 `heaters`。",
      "對每個 `house`，用 lower_bound 找第一個 `>= house` 的暖爐。",
      "同時比較右側暖爐與左側暖爐距離，取較小者作為此房屋需求。",
      "所有房屋需求取最大，即為全域最小半徑。",
    ],
    patterns: ["排序後二分最近點", "每個查詢找左右鄰居", "局部需求取全域最大"],
    pitfalls: [
      "只看右側暖爐會漏掉左側更近的暖爐。",
      "答案不是距離總和，而是所有房屋最小需求中的最大值。",
    ],
    complexity:
      "排序 `O(m log m)`，每個房屋二分 `O(log m)`，總時間 `O((n + m) log m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int findRadius(vector<int>& houses, vector<int>& heaters) {\n        sort(heaters.begin(), heaters.end());\n        int answer = 0;\n        for (int house : houses) {\n            auto right_it = lower_bound(heaters.begin(), heaters.end(), house);\n            int best = INT_MAX;\n            if (right_it != heaters.end()) best = min(best, abs(*right_it - house));\n            if (right_it != heaters.begin()) best = min(best, abs(*prev(right_it) - house));\n            answer = max(answer, best);\n        }\n        return answer;\n    }\n};\n```",
  },
  "climbing-stairs": {
    modelProblem:
      "給定整數 `n`，你從第 0 階開始，每次可以走 1 階或 2 階。請計算剛好到達第 n 階的不同走法數量。",
    signals: ["最後一步只有兩種來源", "狀態只依賴前兩項", "問方案數"],
    invariants: [
      "`dp[i]` 表示到達第 i 階的方案數。",
      "最後一步若走 1 階，來源是 `i - 1`；若走 2 階，來源是 `i - 2`。",
      "計算第 i 階時，第 `i - 1` 與第 `i - 2` 階已經完成。",
    ],
    derivation: [
      "先定義狀態 `dp[i]`，不要把它寫成「目前答案」。",
      "列出最後一步：從 `i - 1` 走一階，或從 `i - 2` 走兩階。",
      "得到轉移 `dp[i] = dp[i - 1] + dp[i - 2]`。",
      "初始化 `dp[0] = 1`，代表什麼都不走也是一種到達起點的方式。",
    ],
    patterns: ["最後一步拆解", "Fibonacci 型 DP", "滾動變數空間壓縮"],
    pitfalls: [
      "`dp[0]` 的語意要定清楚，否則 n = 1 或 n = 2 容易錯。",
      "若題目增加可走步數集合，轉移要改成枚舉所有合法前驅。",
    ],
    complexity: "時間 `O(n)`；若只保留前兩項，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        int prev_two = 1;\n        int prev_one = 1;\n        for (int step = 2; step <= n; ++step) {\n            int current = prev_one + prev_two;\n            prev_two = prev_one;\n            prev_one = current;\n        }\n        return prev_one;\n    }\n};\n```",
  },
  "maximum-average-subarray-i": {
    modelProblem:
      "給定整數陣列 `nums` 與整數 `k`，請找出長度剛好為 k 的連續子陣列，使其平均值最大，並回傳最大平均值。",
    signals: ["固定長度 k", "連續子陣列", "平均值最大等價於子陣列和最大"],
    invariants: [
      "`window_sum` 始終等於目前長度最多為 k 的視窗總和。",
      "當 index `right >= k - 1` 時，視窗長度剛好為 k，可以更新答案。",
      "更新答案後移除左端，為下一個右端點維護固定長度。",
    ],
    derivation: [
      "平均值分母固定為 k，因此只需要最大化長度 k 的視窗和。",
      "右端每次加入 `nums[right]`。",
      "若視窗超過 k，移除 `nums[right - k]`。",
      "從第一個完整視窗開始更新最大和，最後除以 k。",
    ],
    patterns: ["固定長度滑動視窗", "平均值轉最大和", "右進左出維護總和"],
    pitfalls: [
      "不要每個視窗重新加總，否則會變成 `O(nk)`。",
      "答案可能為負數時，最大和初值不能設為 0。",
    ],
    complexity: "一次掃描 `O(n)`，額外空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    double findMaxAverage(vector<int>& nums, int k) {\n        int window_sum = 0;\n        int best_sum = INT_MIN;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            window_sum += nums[right];\n            if (right >= k) window_sum -= nums[right - k];\n            if (right >= k - 1) best_sum = max(best_sum, window_sum);\n        }\n        return 1.0 * best_sum / k;\n    }\n};\n```",
  },
  "two-sum": {
    modelProblem:
      "給定整數陣列 `nums` 與整數 `target`，請找出兩個不同下標 `i`、`j`，使 `nums[i] + nums[j] == target`，並回傳這兩個下標。",
    signals: [
      "枚舉右端點時只需要知道左側是否有補數",
      "每個元素只能使用一次",
      "需要回傳下標",
    ],
    invariants: [
      "`seen[value]` 保存目前右端點左側某個值的下標。",
      "處理 `right` 時，hash map 不包含 `right` 自己，因此不會重複使用同一元素。",
      "找到 `target - nums[right]` 時即可更新答案。",
    ],
    derivation: [
      "把雙重迴圈中的左側枚舉壓成 hash map 查詢。",
      "對每個 `right`，先查 `target - nums[right]` 是否在左側出現。",
      "若找到，回傳左側下標與 `right`。",
      "若沒找到，再把 `nums[right]` 加入左側集合。",
    ],
    patterns: ["列舉右端點", "hash map 維護左側補數", "查詢後再插入避免自配對"],
    pitfalls: [
      "先插入當前值再查詢，可能在 `target == 2 * nums[right]` 時把自己配到自己。",
      "需要回傳下標時，hash map 應存 index 而不是只存布林值。",
    ],
    complexity: "均攤時間 `O(n)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int right = 0; right < (int)nums.size(); ++right) {\n            int need = target - nums[right];\n            auto it = seen.find(need);\n            if (it != seen.end()) return {it->second, right};\n            seen[nums[right]] = right;\n        }\n        return {};\n    }\n};\n```",
  },
  "number-of-1-bits": {
    modelProblem:
      "給定一個非負整數 `n`，請回傳其二進位表示中 1 的個數，也就是 popcount。",
    signals: [
      "只關心 bit 是否為 1",
      "每次可消去最低位的 1",
      "值域固定為整數 bit 數",
    ],
    invariants: [
      "`n & (n - 1)` 會把 n 的最低位 1 清掉。",
      "`answer` 記錄已清掉多少個 1。",
      "迴圈結束時 n 為 0，所有 1 都已被計數。",
    ],
    derivation: [
      "若逐位檢查，可以看每一位 `(n >> bit) & 1`。",
      "更直接的做法是反覆使用 `n &= n - 1` 清除最低位 1。",
      "每清一次，答案加一。",
    ],
    patterns: ["lowbit 性質", "清除最低位的 1", "逐 bit 掃描"],
    pitfalls: [
      "若使用有號整數右移，負數情況要特別小心；此題用無號整數較清楚。",
      "`n & (n - 1)` 清的是最低位 1，不是最低位 bit。",
    ],
    complexity: "時間 `O(number_of_ones)`，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int hammingWeight(uint32_t n) {\n        int answer = 0;\n        while (n != 0) {\n            n &= n - 1;\n            answer++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "prime-number-of-set-bits-in-binary-representation": {
    modelProblem:
      "給定整數區間 `[left, right]`，請統計有多少個整數的二進位 1 的個數是質數。",
    signals: [
      "每個數先轉成 popcount",
      "popcount 上界很小",
      "質數判斷可預先列表",
    ],
    invariants: [
      "`bits = popcount(x)` 是判斷 x 是否計入答案的唯一狀態。",
      "在 32-bit 整數內，可能的 bit count 很小，可用布林表判斷質數。",
    ],
    derivation: [
      "預先建立 `is_prime_count`，標記 2、3、5、7、11、13、17、19 等質數。",
      "從 left 到 right 枚舉 x。",
      "計算 `__builtin_popcount(x)`，若在質數表中則答案加一。",
    ],
    patterns: ["枚舉區間", "popcount 後查小範圍質數表", "值域小時預處理判斷"],
    pitfalls: [
      "判斷的是 1 的個數是否為質數，不是 x 本身是否為質數。",
      "1 不是質數，0 也不是質數。",
    ],
    complexity: "枚舉區間，時間 `O(right - left + 1)`，空間 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int countPrimeSetBits(int left, int right) {\n        const unordered_set<int> kPrimeCounts{2, 3, 5, 7, 11, 13, 17, 19};\n        int answer = 0;\n        for (int x = left; x <= right; ++x) {\n            int bit_count = __builtin_popcount((unsigned)x);\n            if (kPrimeCounts.find(bit_count) != kPrimeCounts.end()) answer++;\n        }\n        return answer;\n    }\n};\n```",
  },
  "chuan-di-xin-xi": {
    modelProblem:
      "給定 `n` 名玩家與有向傳遞關係 `relation[i] = {from, to}`，訊息從玩家 0 出發，每一輪必須沿一條關係傳給下一名玩家。請計算恰好傳遞 `k` 輪後，訊息到達玩家 `n - 1` 的方案數。",
    signals: [
      "有向邊代表可傳遞",
      "步數 k 固定",
      "DFS 狀態包含目前節點與已走輪數",
    ],
    invariants: [
      "`dfs(node, step)` 表示訊息目前在 node，已經傳了 step 輪。",
      "每次遞迴只沿 `node` 的出邊走到下一名玩家，並令 `step + 1`。",
      "只有 `step == k` 時才能更新答案，且必須檢查 node 是否為 `n - 1`。",
    ],
    derivation: [
      "把玩家視為節點，把 relation 視為有向邊。",
      "建立 adjacency list，讓 DFS 可以從目前玩家枚舉下一輪可傳給誰。",
      "從 `dfs(0, 0)` 開始搜尋。",
      "若 `step == k`，只有 `node == n - 1` 時答案加一。",
      "否則枚舉所有鄰點並遞迴到 `step + 1`。",
    ],
    patterns: ["固定深度 DFS", "有向圖鄰接表", "DFS 參數帶步數限制"],
    pitfalls: [
      "這題問恰好 k 輪方案數，不是到達終點就立刻停止。",
      "DFS 的 visited 不能只按 node 記，因為同一節點在不同 step 是不同狀態。",
    ],
    complexity:
      "若不加記憶化，時間與長度為 k 的可行路徑數相關；題目規模較大時可把 `(node, step)` 記憶化成 `O(k * (V + E))`。",
    code: "```cpp\nclass Solution {\n    vector<vector<int>> graph_;\n    int target_ = 0;\n    int max_step_ = 0;\n    int answer_ = 0;\n\n    void dfs(int node, int step) {\n        if (step == max_step_) {\n            if (node == target_) answer_++;\n            return;\n        }\n        for (int next_node : graph_[node]) {\n            dfs(next_node, step + 1);\n        }\n    }\n\npublic:\n    int numWays(int n, vector<vector<int>>& relation, int k) {\n        graph_.assign(n, {});\n        for (const auto& edge : relation) {\n            graph_[edge[0]].push_back(edge[1]);\n        }\n        target_ = n - 1;\n        max_step_ = k;\n        dfs(0, 0);\n        return answer_;\n    }\n};\n```",
  },
  "split-linked-list-in-parts": {
    modelProblem:
      "給定鏈結串列 `head` 與整數 `k`，請把鏈表按原順序切成 k 段，使每段長度盡量相等，前面的段長度可以比後面的段多 1，並回傳每段的頭節點。",
    signals: ["head 會被切斷", "需要保留原順序", "每段長度由總長度除以 k 決定"],
    invariants: [
      "`base = length / k` 是每段至少分到的節點數。",
      "前 `extra = length % k` 段各多一個節點。",
      "切段時必須先保存下一段頭節點，再把目前段尾的 `next` 設為 `nullptr`。",
    ],
    derivation: [
      "先遍歷一次取得鏈表總長度。",
      "計算每段長度：前 extra 段為 `base + 1`，其餘為 `base`。",
      "依序走到每段尾端，保存下一段頭並斷開。",
      "把每段頭放入答案陣列。",
    ],
    patterns: ["先算長度再切段", "前段承接餘數", "斷鏈前保存下一段頭"],
    pitfalls: [
      "如果 k 大於鏈表長度，後面的段應該是空指標。",
      "切斷 `next` 前沒有保存下一段頭，會丟失後續節點。",
    ],
    complexity: "遍歷鏈表常數次，時間 `O(n + k)`，額外空間不含答案為 `O(1)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<ListNode*> splitListToParts(ListNode* head, int k) {\n        int length = 0;\n        for (ListNode* node = head; node != nullptr; node = node->next) length++;\n        int base = length / k;\n        int extra = length % k;\n\n        vector<ListNode*> answer(k, nullptr);\n        ListNode* current = head;\n        for (int part = 0; part < k; ++part) {\n            answer[part] = current;\n            int part_size = base + (part < extra ? 1 : 0);\n            for (int i = 1; i < part_size; ++i) current = current->next;\n            if (current != nullptr) {\n                ListNode* next_head = current->next;\n                current->next = nullptr;\n                current = next_head;\n            }\n        }\n        return answer;\n    }\n};\n```",
  },
  "next-greater-element-i": {
    modelProblem:
      "給定兩個沒有重複元素的陣列 `nums1` 與 `nums2`，且 `nums1` 是 `nums2` 的子集。對 `nums1` 中每個元素，請找出它在 `nums2` 中右側第一個比它大的元素；若不存在則為 -1。",
    signals: ["右側第一個更大", "nums2 可先預處理", "查詢只針對 nums1"],
    invariants: [
      "單調棧中保存尚未找到下一個更大值的元素。",
      "當 `x` 大於棧頂元素時，`x` 就是該棧頂的下一個更大值。",
      "`next_greater[value]` 保存 nums2 中每個值的答案。",
    ],
    derivation: [
      "掃描 `nums2`，用遞減棧維護待解決元素。",
      "每遇到新值 x，彈出所有小於 x 的棧頂，並記錄它們的答案為 x。",
      "掃描結束後，未被解決的元素答案為 -1。",
      "最後依 `nums1` 查表輸出。",
    ],
    patterns: ["下一個更大元素", "單調遞減棧", "先預處理再回答子集查詢"],
    pitfalls: [
      "棧中保存的是尚未找到右側更大值的元素。",
      "若元素可重複，不能直接用 value 當 hash key，需要改存 index。",
    ],
    complexity: "每個元素入棧出棧各一次，時間 `O(n + m)`，空間 `O(n)`。",
    code: "```cpp\nclass Solution {\npublic:\n    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n        unordered_map<int, int> next_greater;\n        vector<int> stack;\n        for (int x : nums2) {\n            while (!stack.empty() && stack.back() < x) {\n                next_greater[stack.back()] = x;\n                stack.pop_back();\n            }\n            stack.push_back(x);\n        }\n\n        vector<int> answer;\n        for (int x : nums1) {\n            auto it = next_greater.find(x);\n            answer.push_back(it == next_greater.end() ? -1 : it->second);\n        }\n        return answer;\n    }\n};\n```",
  },
  "find-the-index-of-the-first-occurrence-in-a-string": {
    modelProblem:
      "給定字串 `haystack` 與 `needle`，請回傳 `needle` 在 `haystack` 中第一次完整出現的起始下標；若不存在，回傳 -1。",
    signals: [
      "固定 pattern",
      "需要找第一次匹配",
      "失配後不應重頭比對整個 pattern",
    ],
    invariants: [
      "`pi[i]` 保存 `needle[0..i]` 的最長相等真前後綴長度。",
      "`matched` 表示目前 haystack 後綴已匹配 needle 前綴的長度。",
      "當 `matched == needle.size()` 時，答案起點是 `i - needle.size() + 1`。",
    ],
    derivation: [
      "先為 `needle` 建立 prefix function。",
      "掃描 `haystack`，相等時增加 `matched`。",
      "失配時用 `pi[matched - 1]` 回退到仍可能匹配的位置。",
      "第一次完整匹配時直接回傳起點。",
    ],
    patterns: [
      "KMP prefix function",
      "失配回退 border",
      "第一次完整匹配直接回傳",
    ],
    pitfalls: [
      "空 pattern 的行為要依題目定義處理。",
      "回退時應使用 `pi[matched - 1]`，不是把 matched 直接歸零。",
    ],
    complexity: "建立 pi 與掃描字串總時間 `O(n + m)`，空間 `O(m)`。",
    code: "```cpp\nclass Solution {\npublic:\n    int strStr(string haystack, string needle) {\n        vector<int> pi(needle.size());\n        for (int i = 1; i < (int)needle.size(); ++i) {\n            int matched = pi[i - 1];\n            while (matched > 0 && needle[i] != needle[matched]) matched = pi[matched - 1];\n            if (needle[i] == needle[matched]) matched++;\n            pi[i] = matched;\n        }\n\n        int matched = 0;\n        for (int i = 0; i < (int)haystack.size(); ++i) {\n            while (matched > 0 && haystack[i] != needle[matched]) matched = pi[matched - 1];\n            if (haystack[i] == needle[matched]) matched++;\n            if (matched == (int)needle.size()) return i - (int)needle.size() + 1;\n        }\n        return -1;\n    }\n};\n```",
  },
};
