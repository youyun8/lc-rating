import type { HandbookTopic } from "../model";
import { getInterviewFrequency } from "./interview-frequency";

interface TemplateBlock {
  summary: string;
  code: string;
}

interface PracticeProblem {
  id: number;
  title: string;
  slug: string;
  rating: number;
  difficulty: string;
  subPattern: string;
  why: string;
  order: number;
  tier: "Core Practice" | "Advanced Practice" | "Challenge Practice";
}

interface PatternTopicDefinition {
  slug: string;
  title: string;
  tagline: string;
  icon: string;
  group: HandbookTopic["group"];
  concept: string[];
  motivation: string[];
  whenUse: string[];
  coreIdea: string[];
  invariant: string;
  variants: string[];
  templateKeys: string[];
  complexity: string[];
  mistakes: string[];
  practice: PracticeProblem[];
  recognition: string[];
  related: string[];
  /**
   * Optional extra markdown appended as a subsection of section 4 (Core Idea).
   * Used by Enumeration Strategy for the "Enumeration Viewpoint Taxonomy".
   */
  coreIdeaAppendix?: string;
}

const TEMPLATES: Record<string, TemplateBlock> = {
  constraint_scan: {
    summary: "C++17 模板：約束引導掃描",
    code: "// C++17 Template: Constraint-Guided Scan\nclass Solution {\n public:\n  long long countSubarraysAtMost(vector<int>& nums, long long limit) {\n    long long answer = 0;\n    long long window_sum = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (left <= right && window_sum > limit) {\n        window_sum -= nums[left];\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};",
  },
  brute_force_to_prefix: {
    summary: "C++17 模板：用前綴狀態取代內部工作",
    code: "// C++17 Template: Replace Inner Work with Prefix State\nclass Solution {\n public:\n  int minSubarray(vector<int>& nums, int p) {\n    long long total = 0;\n    for (int value : nums) {\n      total += value;\n    }\n\n    const int target = static_cast<int>(total % p);\n    if (target == 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> last_index;\n    last_index[0] = -1;\n    int prefix = 0;\n    int answer = nums.size();\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      prefix = (prefix + nums[i]) % p;\n      const int need = (prefix - target + p) % p;\n      if (last_index.count(need) != 0) {\n        answer = min(answer, i - last_index[need]);\n      }\n      last_index[prefix] = i;\n    }\n\n    return answer == static_cast<int>(nums.size()) ? -1 : answer;\n  }\n};",
  },
  answer_search: {
    summary: "C++17 範本：對答案進行二分查找",
    code: "// C++17 Template: Binary Search on Answer\nclass Solution {\n public:\n  int shipWithinDays(vector<int>& weights, int days) {\n    int low = 0;\n    long long high_sum = 0;\n    for (int weight : weights) {\n      low = max(low, weight);\n      high_sum += weight;\n    }\n    int high = static_cast<int>(high_sum);\n\n    auto can_ship = [&](int capacity) {\n      int used_days = 1;\n      int load = 0;\n      for (int weight : weights) {\n        if (load + weight > capacity) {\n          ++used_days;\n          load = 0;\n        }\n        load += weight;\n      }\n      return used_days <= days;\n    };\n\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (can_ship(mid)) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};",
  },
  loop_invariant_binary_search: {
    summary: "C++17 模板：具有循環不變性的下界",
    code: "// C++17 Template: Lower Bound with Loop Invariant\nclass Solution {\n public:\n  int lowerBound(vector<int>& nums, int target) {\n    int low = 0;\n    int high = nums.size();\n\n    // Invariant: every index < low is too small; every index >= high is valid.\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (nums[mid] >= target) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};",
  },
  enumerate_middle: {
    summary: "C++17 範本：使用 Fenwick 計數列舉中間值",
    code: "// C++17 Template: Enumerate Middle with Fenwick Counts\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  long long countIncreasingTriplets(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree left_tree(values.size());\n    FenwickTree right_tree(values.size());\n    for (int value : nums) {\n      right_tree.add(rankOf(values, value), 1);\n    }\n\n    long long answer = 0;\n    for (int value : nums) {\n      const int rank = rankOf(values, value);\n      right_tree.add(rank, -1);\n      const long long smaller_left = left_tree.query(rank - 1);\n      const long long greater_right =\n          right_tree.query(values.size()) - right_tree.query(rank);\n      answer += smaller_left * greater_right;\n      left_tree.add(rank, 1);\n    }\n\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& values, int value) const {\n    return lower_bound(values.begin(), values.end(), value) - values.begin() + 1;\n  }\n};",
  },
  subset_enumeration: {
    summary: "C++17 模板：子掩碼枚舉",
    code: "// C++17 Template: Submask Enumeration\nclass Solution {\n public:\n  int bestSubsetScore(vector<int>& score) {\n    const int n = score.size();\n    const int mask_count = 1 << n;\n    vector<int> dp(mask_count, 0);\n\n    for (int mask = 1; mask < mask_count; ++mask) {\n      for (int submask = mask; submask > 0; submask = (submask - 1) & mask) {\n        const int remaining = mask ^ submask;\n        dp[mask] = max(dp[mask], dp[remaining] + valueOf(submask, score));\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n\n private:\n  int valueOf(int mask, const vector<int>& score) const {\n    int value = 0;\n    for (int bit = 0; bit < static_cast<int>(score.size()); ++bit) {\n      if (((mask >> bit) & 1) != 0) {\n        value += score[bit];\n      }\n    }\n    return value;\n  }\n};",
  },
  contribution_mono: {
    summary: "C++17 模板：子數組最小值總和樣式",
    code: "// C++17 Template: Sum of Subarray Minimums Style\nclass Solution {\n public:\n  int sumSubarrayMins(vector<int>& arr) {\n    const int kMod = 1'000'000'007;\n    const int n = arr.size();\n    vector<int> left(n);\n    vector<int> right(n);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] > arr[i]) {\n        stack_indices.pop_back();\n      }\n      left[i] = stack_indices.empty() ? -1 : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    stack_indices.clear();\n    for (int i = n - 1; i >= 0; --i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] >= arr[i]) {\n        stack_indices.pop_back();\n      }\n      right[i] = stack_indices.empty() ? n : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    long long answer = 0;\n    for (int i = 0; i < n; ++i) {\n      const long long left_choices = i - left[i];\n      const long long right_choices = right[i] - i;\n      answer = (answer + left_choices * right_choices % kMod * arr[i]) % kMod;\n    }\n    return static_cast<int>(answer);\n  }\n};",
  },
  pair_contribution: {
    summary: "C++17 範本：排序後的配對貢獻",
    code: "// C++17 Template: Pair Contribution after Sorting\nclass Solution {\n public:\n  long long sumPairDistances(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    long long answer = 0;\n    long long prefix_sum = 0;\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      answer += 1LL * nums[i] * i - prefix_sum;\n      prefix_sum += nums[i];\n    }\n\n    return answer;\n  }\n};",
  },
  prefix_contribution: {
    summary: "C++17 模板：前綴和後綴貢獻",
    code: "// C++17 Template: Prefix and Suffix Contribution\nclass Solution {\n public:\n  long long countSplitsWithLeftMax(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> prefix_max(n);\n    vector<int> suffix_min(n);\n\n    for (int i = 0; i < n; ++i) {\n      prefix_max[i] = i == 0 ? nums[i] : max(prefix_max[i - 1], nums[i]);\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix_min[i] = i + 1 == n ? nums[i] : min(suffix_min[i + 1], nums[i]);\n    }\n\n    long long answer = 0;\n    for (int cut = 0; cut + 1 < n; ++cut) {\n      if (prefix_max[cut] <= suffix_min[cut + 1]) {\n        ++answer;\n      }\n    }\n    return answer;\n  }\n};",
  },
  longest_window: {
    summary: "C++17 模板：最長有效窗口",
    code: "// C++17 Template: Longest Valid Window\nclass Solution {\n public:\n  int longestOnes(vector<int>& nums, int k) {\n    int zero_count = 0;\n    int left = 0;\n    int answer = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      if (nums[right] == 0) {\n        ++zero_count;\n      }\n      while (zero_count > k) {\n        if (nums[left] == 0) {\n          --zero_count;\n        }\n        ++left;\n      }\n      answer = max(answer, right - left + 1);\n    }\n\n    return answer;\n  }\n};",
  },
  shortest_window: {
    summary: "C++17 模板：最短有效窗口",
    code: "// C++17 Template: Shortest Valid Window\nclass Solution {\n public:\n  int minSubArrayLen(int target, vector<int>& nums) {\n    int answer = nums.size() + 1;\n    int left = 0;\n    long long window_sum = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (window_sum >= target) {\n        answer = min(answer, right - left + 1);\n        window_sum -= nums[left];\n        ++left;\n      }\n    }\n\n    return answer == static_cast<int>(nums.size()) + 1 ? 0 : answer;\n  }\n};",
  },
  at_most_k_distinct: {
    summary: "C++17 範本：計算最多具有 K 個不同值的子數組",
    code: "// C++17 Template: Count Subarrays with At Most K Distinct Values\nclass Solution {\n public:\n  long long subarraysWithAtMostKDistinct(vector<int>& nums, int k) {\n    unordered_map<int, int> frequency;\n    long long answer = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};",
  },
  exactly_k_distinct: {
    summary: "C++17 模板：最多剛好 K",
    code: "// C++17 Template: Exactly K via At Most\nclass Solution {\n public:\n  int subarraysWithKDistinct(vector<int>& nums, int k) {\n    return atMost(nums, k) - atMost(nums, k - 1);\n  }\n\n private:\n  int atMost(const vector<int>& nums, int k) {\n    if (k < 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> frequency;\n    int answer = 0;\n    int left = 0;\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n    return answer;\n  }\n};",
  },
  bitwise_or_window: {
    summary: "C++17 範本：具有位元計數的位元或視窗",
    code: "// C++17 Template: Bitwise OR Window with Bit Counts\nclass Solution {\n public:\n  int minimumSubarrayLength(vector<int>& nums, int k) {\n    const int n = nums.size();\n    vector<int> bit_count(kMaxBits, 0);\n    int answer = n + 1;\n    int left = 0;\n\n    for (int right = 0; right < n; ++right) {\n      addValue(nums[right], &bit_count);\n      while (left <= right && currentOr(bit_count) >= k) {\n        answer = min(answer, right - left + 1);\n        removeValue(nums[left], &bit_count);\n        ++left;\n      }\n    }\n\n    return answer == n + 1 ? -1 : answer;\n  }\n\n private:\n  static constexpr int kMaxBits = 31;\n\n  void addValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        ++(*bit_count)[bit];\n      }\n    }\n  }\n\n  void removeValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        --(*bit_count)[bit];\n      }\n    }\n  }\n\n  int currentOr(const vector<int>& bit_count) const {\n    int value = 0;\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (bit_count[bit] > 0) {\n        value |= 1 << bit;\n      }\n    }\n    return value;\n  }\n};",
  },
  prefix_suffix_counts: {
    summary: "C++17 模板：圍繞樞軸的前綴/後綴計數",
    code: "// C++17 Template: Prefix/Suffix Counts around a Pivot\nclass Solution {\n public:\n  long long countPatternAroundMiddle(string s) {\n    const int n = s.size();\n    vector<array<int, 10>> prefix(n + 1);\n    vector<array<int, 10>> suffix(n + 1);\n\n    for (int i = 0; i < n; ++i) {\n      prefix[i + 1] = prefix[i];\n      ++prefix[i + 1][s[i] - '0'];\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix[i] = suffix[i + 1];\n      ++suffix[i][s[i] - '0'];\n    }\n\n    long long answer = 0;\n    for (int middle = 0; middle < n; ++middle) {\n      for (int digit = 0; digit < 10; ++digit) {\n        answer += 1LL * prefix[middle][digit] * suffix[middle + 1][digit];\n      }\n    }\n    return answer;\n  }\n};",
  },
  difference_array: {
    summary: "C++17 範本：差異數組範圍添加",
    code: "// C++17 Template: Difference Array Range Add\nclass Solution {\n public:\n  vector<long long> applyRangeUpdates(int n, vector<vector<int>>& updates) {\n    vector<long long> diff(n + 1, 0);\n    for (const auto& update : updates) {\n      const int left = update[0];\n      const int right = update[1];\n      const int delta = update[2];\n      diff[left] += delta;\n      if (right + 1 < n) {\n        diff[right + 1] -= delta;\n      }\n    }\n\n    vector<long long> answer(n, 0);\n    long long running = 0;\n    for (int i = 0; i < n; ++i) {\n      running += diff[i];\n      answer[i] = running;\n    }\n    return answer;\n  }\n};",
  },
  difference_matrix: {
    summary: "C++17 範本：2D 差分數組",
    code: "// C++17 Template: 2D Difference Array\nclass Solution {\n public:\n  vector<vector<int>> rangeAddQueries(int n, vector<vector<int>>& queries) {\n    vector<vector<int>> diff(n + 1, vector<int>(n + 1, 0));\n    for (const auto& query : queries) {\n      const int row1 = query[0];\n      const int col1 = query[1];\n      const int row2 = query[2];\n      const int col2 = query[3];\n      ++diff[row1][col1];\n      --diff[row2 + 1][col1];\n      --diff[row1][col2 + 1];\n      ++diff[row2 + 1][col2 + 1];\n    }\n\n    vector<vector<int>> answer(n, vector<int>(n, 0));\n    for (int row = 0; row < n; ++row) {\n      for (int col = 0; col < n; ++col) {\n        int value = diff[row][col];\n        if (row > 0) {\n          value += answer[row - 1][col];\n        }\n        if (col > 0) {\n          value += answer[row][col - 1];\n        }\n        if (row > 0 && col > 0) {\n          value -= answer[row - 1][col - 1];\n        }\n        answer[row][col] = value;\n      }\n    }\n    return answer;\n  }\n};",
  },
  monotonic_stack: {
    summary: "C++17 模板：單調堆疊邊界",
    code: "// C++17 Template: Monotonic Stack Boundaries\nclass Solution {\n public:\n  vector<int> nextGreaterElements(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> answer(n, -1);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && nums[stack_indices.back()] < nums[i]) {\n        answer[stack_indices.back()] = nums[i];\n        stack_indices.pop_back();\n      }\n      stack_indices.push_back(i);\n    }\n\n    return answer;\n  }\n};",
  },
  monotonic_deque: {
    summary: "C++17 範本：單調雙端佇列視窗最大值",
    code: "// C++17 Template: Monotonic Deque Window Maximum\nclass Solution {\n public:\n  vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> indices;\n    vector<int> answer;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      while (!indices.empty() && indices.front() <= right - k) {\n        indices.pop_front();\n      }\n      while (!indices.empty() && nums[indices.back()] <= nums[right]) {\n        indices.pop_back();\n      }\n      indices.push_back(right);\n      if (right + 1 >= k) {\n        answer.push_back(nums[indices.front()]);\n      }\n    }\n\n    return answer;\n  }\n};",
  },
  coordinate_compression_fenwick: {
    summary: "C++17 範本：與 Fenwick 樹協調壓縮",
    code: "// C++17 Template: Coordinate Compression with Fenwick Tree\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countSmaller(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree tree(values.size());\n    vector<int> answer(nums.size(), 0);\n    for (int i = static_cast<int>(nums.size()) - 1; i >= 0; --i) {\n      const int rank = lower_bound(values.begin(), values.end(), nums[i]) -\n                       values.begin() + 1;\n      answer[i] = tree.query(rank - 1);\n      tree.add(rank, 1);\n    }\n    return answer;\n  }\n};",
  },
  exchange_greedy: {
    summary: "C++17 模板：貪婪最早完成",
    code: "// C++17 Template: Greedy by Earliest Finish\nclass Solution {\n public:\n  int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end(), [](const auto& left, const auto& right) {\n      return left[1] < right[1];\n    });\n\n    int kept = 0;\n    int current_end = numeric_limits<int>::min();\n    for (const auto& interval : intervals) {\n      if (interval[0] >= current_end) {\n        ++kept;\n        current_end = interval[1];\n      }\n    }\n\n    return intervals.size() - kept;\n  }\n};",
  },
  interval_cover_greedy: {
    summary: "C++17 模板：貪婪在區間覆蓋中保持領先",
    code: "// C++17 Template: Greedy Stays Ahead for Interval Cover\nclass Solution {\n public:\n  int minIntervalsToCover(vector<vector<int>>& intervals, int target_right) {\n    sort(intervals.begin(), intervals.end());\n    int answer = 0;\n    int index = 0;\n    int current_end = 0;\n\n    while (current_end < target_right) {\n      int farthest = current_end;\n      while (index < static_cast<int>(intervals.size()) &&\n             intervals[index][0] <= current_end) {\n        farthest = max(farthest, intervals[index][1]);\n        ++index;\n      }\n      if (farthest == current_end) {\n        return -1;\n      }\n      current_end = farthest;\n      ++answer;\n    }\n\n    return answer;\n  }\n};",
  },
  greedy_builder: {
    summary: "C++17 模板：具有可行性檢查的貪婪構造",
    code: "// C++17 Template: Greedy Construction with Feasibility Check\nclass Solution {\n public:\n  string buildSmallestString(int n, int total_value) {\n    string answer;\n    int remaining_value = total_value;\n\n    for (int position = 0; position < n; ++position) {\n      for (char candidate = 'a'; candidate <= 'z'; ++candidate) {\n        const int value = candidate - 'a' + 1;\n        if (canFinish(n - position - 1, remaining_value - value)) {\n          answer.push_back(candidate);\n          remaining_value -= value;\n          break;\n        }\n      }\n    }\n\n    return answer;\n  }\n\n private:\n  bool canFinish(int remaining_slots, int remaining_value) const {\n    const int min_value = remaining_slots;\n    const int max_value = 26 * remaining_slots;\n    return min_value <= remaining_value && remaining_value <= max_value;\n  }\n};",
  },
  greedy_lexicographic: {
    summary: "C++17 範本：具有配額的字典順序最小子序列",
    code: "// C++17 Template: Lexicographically Smallest Subsequence with Quota\nclass Solution {\n public:\n  string smallestSubsequence(string s, int k, char letter, int repetition) {\n    int remaining_letter = 0;\n    for (char ch : s) {\n      if (ch == letter) {\n        ++remaining_letter;\n      }\n    }\n\n    string stack_chars;\n    int used_letter = 0;\n    for (int i = 0; i < static_cast<int>(s.size()); ++i) {\n      const char ch = s[i];\n      const int remaining_slots = static_cast<int>(s.size()) - i;\n      while (!stack_chars.empty() && stack_chars.back() > ch &&\n             static_cast<int>(stack_chars.size()) - 1 + remaining_slots >= k) {\n        if (stack_chars.back() == letter) {\n          if (used_letter - 1 + remaining_letter < repetition) {\n            break;\n          }\n          --used_letter;\n        }\n        stack_chars.pop_back();\n      }\n\n      if (static_cast<int>(stack_chars.size()) < k) {\n        if (ch == letter) {\n          stack_chars.push_back(ch);\n          ++used_letter;\n        } else if (k - static_cast<int>(stack_chars.size()) >\n                   repetition - used_letter) {\n          stack_chars.push_back(ch);\n        }\n      }\n\n      if (ch == letter) {\n        --remaining_letter;\n      }\n    }\n\n    return stack_chars;\n  }\n};",
  },
  remaining_sum_construction: {
    summary: "C++17 範本：剩餘金額可行性",
    code: "// C++17 Template: Remaining Sum Feasibility\nclass Solution {\n public:\n  string getSmallestString(int n, int k) {\n    string answer(n, 'a');\n    k -= n;\n\n    for (int i = n - 1; i >= 0 && k > 0; --i) {\n      const int add = min(25, k);\n      answer[i] = static_cast<char>('a' + add);\n      k -= add;\n    }\n\n    return answer;\n  }\n};",
  },
  frequency_construction: {
    summary: "C++17 模板：基於頻率的構造",
    code: "// C++17 Template: Frequency-Based Construction\nclass Solution {\n public:\n  string reorganizeString(string s) {\n    array<int, 26> frequency{};\n    for (char ch : s) {\n      ++frequency[ch - 'a'];\n    }\n\n    priority_queue<pair<int, char>> heap;\n    for (int i = 0; i < 26; ++i) {\n      if (frequency[i] > 0) {\n        heap.push({frequency[i], static_cast<char>('a' + i)});\n      }\n    }\n\n    string answer;\n    while (!heap.empty()) {\n      auto first = heap.top();\n      heap.pop();\n      if (!answer.empty() && answer.back() == first.second) {\n        if (heap.empty()) {\n          return \"\";\n        }\n        auto second = heap.top();\n        heap.pop();\n        answer.push_back(second.second);\n        if (--second.first > 0) {\n          heap.push(second);\n        }\n        heap.push(first);\n      } else {\n        answer.push_back(first.second);\n        if (--first.first > 0) {\n          heap.push(first);\n        }\n      }\n    }\n\n    return answer;\n  }\n};",
  },
  mst_kruskal: {
    summary: "C++17 模板：使用 Kruskal 剪切屬性",
    code: "// C++17 Template: Cut Property with Kruskal\nclass DisjointSet {\n public:\n  explicit DisjointSet(int n) : parent_(n), size_(n, 1) {\n    iota(parent_.begin(), parent_.end(), 0);\n  }\n\n  int findRoot(int node) {\n    if (parent_[node] != node) {\n      parent_[node] = findRoot(parent_[node]);\n    }\n    return parent_[node];\n  }\n\n  bool unite(int left, int right) {\n    int root_left = findRoot(left);\n    int root_right = findRoot(right);\n    if (root_left == root_right) {\n      return false;\n    }\n    if (size_[root_left] < size_[root_right]) {\n      swap(root_left, root_right);\n    }\n    parent_[root_right] = root_left;\n    size_[root_left] += size_[root_right];\n    return true;\n  }\n\n private:\n  vector<int> parent_;\n  vector<int> size_;\n};\n\nclass Solution {\n public:\n  int minimumCost(int n, vector<vector<int>>& edges) {\n    sort(edges.begin(), edges.end(), [](const auto& left, const auto& right) {\n      return left[2] < right[2];\n    });\n\n    DisjointSet dsu(n);\n    int total_cost = 0;\n    int used_edges = 0;\n    for (const auto& edge : edges) {\n      if (dsu.unite(edge[0], edge[1])) {\n        total_cost += edge[2];\n        ++used_edges;\n      }\n    }\n\n    return used_edges == n - 1 ? total_cost : -1;\n  }\n};",
  },
  state_bfs: {
    summary: "C++17 範本：具有明確狀態的 BFS",
    code: "// C++17 Template: BFS with Explicit State\nclass Solution {\n public:\n  int shortestPathLength(vector<vector<int>>& graph) {\n    const int n = graph.size();\n    const int full_mask = (1 << n) - 1;\n    queue<pair<int, int>> states;\n    vector<vector<int>> distance(n, vector<int>(1 << n, -1));\n\n    for (int node = 0; node < n; ++node) {\n      const int mask = 1 << node;\n      states.push({node, mask});\n      distance[node][mask] = 0;\n    }\n\n    while (!states.empty()) {\n      const auto [node, mask] = states.front();\n      states.pop();\n      if (mask == full_mask) {\n        return distance[node][mask];\n      }\n      for (int next_node : graph[node]) {\n        const int next_mask = mask | (1 << next_node);\n        if (distance[next_node][next_mask] == -1) {\n          distance[next_node][next_mask] = distance[node][mask] + 1;\n          states.push({next_node, next_mask});\n        }\n      }\n    }\n\n    return 0;\n  }\n};",
  },
  bitmask_dp: {
    summary: "C++17 模板：賦值狀態壓縮 DP",
    code: "// C++17 Template: Assignment State Compression DP\nclass Solution {\n public:\n  int minimumXORSum(vector<int>& nums1, vector<int>& nums2) {\n    const int n = nums1.size();\n    const int mask_count = 1 << n;\n    const int kInf = 1'000'000'000;\n    vector<int> dp(mask_count, kInf);\n    dp[0] = 0;\n\n    for (int mask = 0; mask < mask_count; ++mask) {\n      const int index = __builtin_popcount(static_cast<unsigned>(mask));\n      if (index >= n) {\n        continue;\n      }\n      for (int j = 0; j < n; ++j) {\n        if (((mask >> j) & 1) == 0) {\n          const int next_mask = mask | (1 << j);\n          dp[next_mask] = min(dp[next_mask], dp[mask] + (nums1[index] ^ nums2[j]));\n        }\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n};",
  },
  offline_fenwick: {
    summary: "C++17 模板：按閾值排序的離線查詢",
    code: "// C++17 Template: Offline Queries Sorted by Threshold\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nstruct Query {\n  int left;\n  int right;\n  int limit;\n  int index;\n};\n\nclass Solution {\n public:\n  vector<int> countValuesAtMost(vector<int>& nums, vector<Query>& queries) {\n    vector<pair<int, int>> values;\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      values.push_back({nums[i], i + 1});\n    }\n    sort(values.begin(), values.end());\n    sort(queries.begin(), queries.end(), [](const Query& left, const Query& right) {\n      return left.limit < right.limit;\n    });\n\n    FenwickTree tree(nums.size());\n    vector<int> answer(queries.size(), 0);\n    int value_index = 0;\n    for (const Query& query : queries) {\n      while (value_index < static_cast<int>(values.size()) &&\n             values[value_index].first <= query.limit) {\n        tree.add(values[value_index].second, 1);\n        ++value_index;\n      }\n      answer[query.index] = tree.query(query.right + 1) - tree.query(query.left);\n    }\n    return answer;\n  }\n};",
  },
  sweep_events: {
    summary: "C++17 範本：事件排序掃描",
    code: "// C++17 Template: Event Sorting Sweep\nclass Solution {\n public:\n  int maximumOverlap(vector<vector<int>>& intervals) {\n    vector<pair<int, int>> events;\n    for (const auto& interval : intervals) {\n      events.push_back({interval[0], 1});\n      events.push_back({interval[1] + 1, -1});\n    }\n    sort(events.begin(), events.end());\n\n    int active = 0;\n    int answer = 0;\n    for (const auto& [coordinate, delta] : events) {\n      active += delta;\n      answer = max(answer, active);\n    }\n    return answer;\n  }\n};",
  },
  sweep_difference: {
    summary: "C++17 範本：差異事件",
    code: "// C++17 Template: Difference Events\nclass Solution {\n public:\n  vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {\n    map<int, int> events;\n    for (const auto& flower : flowers) {\n      ++events[flower[0]];\n      --events[flower[1] + 1];\n    }\n\n    vector<pair<int, int>> queries;\n    for (int i = 0; i < static_cast<int>(people.size()); ++i) {\n      queries.push_back({people[i], i});\n    }\n    sort(queries.begin(), queries.end());\n\n    vector<int> answer(people.size(), 0);\n    auto event_it = events.begin();\n    int active = 0;\n    for (const auto& [time, index] : queries) {\n      while (event_it != events.end() && event_it->first <= time) {\n        active += event_it->second;\n        ++event_it;\n      }\n      answer[index] = active;\n    }\n    return answer;\n  }\n};",
  },
  sweep_heap: {
    summary: "C++17 模板：基於堆疊的掃描",
    code: "// C++17 Template: Heap-Based Sweep\nclass Solution {\n public:\n  int minMeetingRooms(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    priority_queue<int, vector<int>, greater<int>> end_times;\n    int answer = 0;\n\n    for (const auto& interval : intervals) {\n      while (!end_times.empty() && end_times.top() <= interval[0]) {\n        end_times.pop();\n      }\n      end_times.push(interval[1]);\n      answer = max(answer, static_cast<int>(end_times.size()));\n    }\n\n    return answer;\n  }\n};",
  },
  sweep_compressed_fenwick: {
    summary: "C++17 範本：帶範圍新增的壓縮掃描",
    code: "// C++17 Template: Compressed Sweep with Range Add\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 2, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countCoveredPoints(vector<vector<int>>& intervals, vector<int>& points) {\n    vector<int> coords = points;\n    for (const auto& interval : intervals) {\n      coords.push_back(interval[0]);\n      coords.push_back(interval[1] + 1);\n    }\n    sort(coords.begin(), coords.end());\n    coords.erase(unique(coords.begin(), coords.end()), coords.end());\n\n    FenwickTree tree(coords.size() + 2);\n    for (const auto& interval : intervals) {\n      const int left = rankOf(coords, interval[0]);\n      const int right_after = rankOf(coords, interval[1] + 1);\n      tree.add(left, 1);\n      tree.add(right_after, -1);\n    }\n\n    vector<int> answer;\n    for (int point : points) {\n      answer.push_back(tree.query(rankOf(coords, point)));\n    }\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& coords, int value) const {\n    return lower_bound(coords.begin(), coords.end(), value) - coords.begin() + 1;\n  }\n};",
  },
  dp_state: {
    summary: "C++17 範本：具有方向最佳值的 DP 狀態",
    code: "// C++17 Template: DP State with Directional Bests\nclass Solution {\n public:\n  long long maxPoints(vector<vector<int>>& points) {\n    const int rows = points.size();\n    const int cols = points[0].size();\n    vector<long long> dp(cols, 0);\n\n    for (int row = 0; row < rows; ++row) {\n      vector<long long> left_best(cols, 0);\n      vector<long long> right_best(cols, 0);\n      left_best[0] = dp[0];\n      for (int col = 1; col < cols; ++col) {\n        left_best[col] = max(left_best[col - 1] - 1, dp[col]);\n      }\n      right_best[cols - 1] = dp[cols - 1];\n      for (int col = cols - 2; col >= 0; --col) {\n        right_best[col] = max(right_best[col + 1] - 1, dp[col]);\n      }\n\n      vector<long long> next_dp(cols, 0);\n      for (int col = 0; col < cols; ++col) {\n        next_dp[col] = points[row][col] + max(left_best[col], right_best[col]);\n      }\n      dp.swap(next_dp);\n    }\n\n    return *max_element(dp.begin(), dp.end());\n  }\n};",
  },
  dp_transition: {
    summary: "C++17 範本：間隔 DP 過渡",
    code: "// C++17 Template: Interval DP Transition\nclass Solution {\n public:\n  int minCost(int n, vector<int>& cuts) {\n    cuts.push_back(0);\n    cuts.push_back(n);\n    sort(cuts.begin(), cuts.end());\n\n    const int m = cuts.size();\n    vector<vector<int>> dp(m, vector<int>(m, 0));\n    for (int length = 2; length < m; ++length) {\n      for (int left = 0; left + length < m; ++left) {\n        const int right = left + length;\n        dp[left][right] = numeric_limits<int>::max();\n        for (int mid = left + 1; mid < right; ++mid) {\n          dp[left][right] = min(\n              dp[left][right],\n              dp[left][mid] + dp[mid][right] + cuts[right] - cuts[left]);\n        }\n      }\n    }\n\n    return dp[0][m - 1];\n  }\n};",
  },
  coordinate_compress: {
    summary: "C++17 範本：協調壓縮到等級",
    code: `// C++17 Template: Coordinate Compression to Ranks
class Solution {
 public:
  vector<int> compress(vector<int>& nums) {
    vector<int> sorted_values = nums;
    sort(sorted_values.begin(), sorted_values.end());
    sorted_values.erase(unique(sorted_values.begin(), sorted_values.end()),
                        sorted_values.end());

    vector<int> ranks(nums.size());
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
      ranks[i] = lower_bound(sorted_values.begin(), sorted_values.end(),
                             nums[i]) -
                 sorted_values.begin();
    }
    return ranks;
  }
};`,
  },
  exchange_swap_sort: {
    summary: "C++17 範本：成對交換比較器排序",
    code: `// C++17 Template: Pairwise Exchange Comparator Sort
class Solution {
 public:
  string largestNumber(vector<int>& nums) {
    vector<string> parts;
    for (int value : nums) {
      parts.push_back(to_string(value));
    }
    sort(parts.begin(), parts.end(), [](const string& a, const string& b) {
      return a + b > b + a;
    });
    if (parts.front() == "0") {
      return "0";
    }
    string answer;
    for (const string& part : parts) {
      answer += part;
    }
    return answer;
  }
};`,
  },
  mst_prim: {
    summary: "C++17 模板：Prim 最小生成樹",
    code: `// C++17 Template: Prim Minimum Spanning Tree
class Solution {
 public:
  int minimumSpanningTree(int n, vector<vector<int>>& edges) {
    vector<vector<pair<int, int>>> graph(n);
    for (const auto& edge : edges) {
      graph[edge[0]].push_back({edge[1], edge[2]});
      graph[edge[1]].push_back({edge[0], edge[2]});
    }

    vector<bool> in_tree(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>,
                   greater<pair<int, int>>>
        frontier;
    frontier.push({0, 0});
    int total_cost = 0;
    int used = 0;

    while (!frontier.empty() && used < n) {
      auto [weight, node] = frontier.top();
      frontier.pop();
      if (in_tree[node]) {
        continue;
      }
      in_tree[node] = true;
      total_cost += weight;
      ++used;
      for (const auto& [next_node, next_weight] : graph[node]) {
        if (!in_tree[next_node]) {
          frontier.push({next_weight, next_node});
        }
      }
    }

    return used == n ? total_cost : -1;
  }
};`,
  },
  dp_state_machine: {
    summary: "C++17 範本：DP 狀態機（持有/現金）",
    code: `// C++17 Template: DP State Machine (Hold / Cash)
class Solution {
 public:
  int maxProfit(vector<int>& prices, int fee) {
    const int kNegInf = numeric_limits<int>::min() / 2;
    int cash = 0;
    int hold = kNegInf;

    for (int price : prices) {
      const int prev_cash = cash;
      cash = max(cash, hold + price - fee);
      hold = max(hold, prev_cash - price);
    }

    return cash;
  }
};`,
  },
  dp_knapsack: {
    summary: "C++17 模板：0/1 背包，帶反向容量環",
    code: `// C++17 Template: 0/1 Knapsack with Reverse Capacity Loop
class Solution {
 public:
  int maxValue(vector<int>& weights, vector<int>& values, int capacity) {
    vector<int> dp(capacity + 1, 0);
    for (int i = 0; i < static_cast<int>(weights.size()); ++i) {
      for (int c = capacity; c >= weights[i]; --c) {
        dp[c] = max(dp[c], dp[c - weights[i]] + values[i]);
      }
    }
    return dp[capacity];
  }
};`,
  },
  game_nim_xor: {
    summary: "C++17 範本：Nim XOR 獲勝者檢查",
    code: `// C++17 Template: Nim XOR Winner Check
class Solution {
 public:
  bool firstPlayerWins(vector<int>& piles) {
    int xorSum = 0;
    for (int pile : piles) {
      xorSum ^= pile;
    }
    // A nonzero XOR means the first player has a winning move.
    return xorSum != 0;
  }
};`,
  },
  game_grundy: {
    summary: "C++17 模板：Grundy Value 透過 Memoized DFS",
    code: `// C++17 Template: Grundy Value via Memoized DFS
class Solution {
 public:
  // moves(state) returns every state reachable in one move.
  int grundy(int state, unordered_map<int, int>& memo,
             const function<vector<int>(int)>& moves) {
    if (auto it = memo.find(state); it != memo.end()) {
      return it->second;
    }
    set<int> reachable;
    for (int next : moves(state)) {
      reachable.insert(grundy(next, memo, moves));
    }
    int mex = 0;
    while (reachable.count(mex) != 0) {
      ++mex;
    }
    return memo[state] = mex;
  }
};`,
  },
  game_interval_dp: {
    summary: "C++17 模板：間隔 DP 兩人遊戲",
    code: `// C++17 Template: Interval DP Two-Player Game
class Solution {
 public:
  bool predictTheWinner(vector<int>& nums) {
    const int n = nums.size();
    // dp[i][j] = best (current player - opponent) score on subarray [i, j].
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; ++i) {
      dp[i][i] = nums[i];
    }
    for (int length = 2; length <= n; ++length) {
      for (int i = 0; i + length - 1 < n; ++i) {
        const int j = i + length - 1;
        dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);
      }
    }
    return dp[0][n - 1] >= 0;
  }
};`,
  },
  game_pn_table: {
    summary: "C++17 範本：P/N 位置表結構",
    code: `// C++17 Template: P/N Position Table Construction
class Solution {
 public:
  // win[s] = true if the player to move from state s can force a win.
  vector<bool> winningPositions(int n,
                                const function<vector<int>(int)>& moves) {
    vector<bool> win(n + 1, false);
    for (int s = 1; s <= n; ++s) {
      for (int next : moves(s)) {
        if (!win[next]) {  // move the opponent into a losing position
          win[s] = true;
          break;
        }
      }
    }
    return win;
  }
};`,
  },
  two_pointers_opposite: {
    summary: "C++17 模板：相反方向的兩個指針",
    code: `// C++17 Template: Opposite-Direction Two Pointers
class Solution {
 public:
  vector<int> twoSumSorted(vector<int>& nums, int target) {
    int lo = 0, hi = static_cast<int>(nums.size()) - 1;
    while (lo < hi) {
      int sum = nums[lo] + nums[hi];
      if (sum == target) return {lo, hi};
      if (sum < target) ++lo; else --hi;
    }
    return {-1, -1};
  }
};`,
  },
  three_sum: {
    summary: "C++17 範本：帶有已排序的兩個指標的 3Sum",
    code: `// C++17 Template: 3Sum with Sorted Two Pointers
class Solution {
 public:
  vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> res;
    for (int i = 0; i < n - 2; ++i) {
      if (i > 0 && nums[i] == nums[i - 1]) continue;  // skip duplicate pivots
      int lo = i + 1, hi = n - 1;
      while (lo < hi) {
        int sum = nums[i] + nums[lo] + nums[hi];
        if (sum < 0) {
          ++lo;
        } else if (sum > 0) {
          --hi;
        } else {
          res.push_back({nums[i], nums[lo], nums[hi]});
          while (lo < hi && nums[lo] == nums[lo + 1]) ++lo;
          while (lo < hi && nums[hi] == nums[hi - 1]) --hi;
          ++lo; --hi;
        }
      }
    }
    return res;
  }
};`,
  },
  backtrack_permute: {
    summary: "C++17 模板：回溯排列",
    code: `// C++17 Template: Backtracking Permutations
class Solution {
 public:
  vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> cur;
    vector<bool> used(nums.size(), false);
    dfs(nums, used, cur, res);
    return res;
  }

 private:
  void dfs(vector<int>& nums, vector<bool>& used, vector<int>& cur,
           vector<vector<int>>& res) {
    if (cur.size() == nums.size()) {
      res.push_back(cur);
      return;
    }
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
      if (used[i]) continue;
      used[i] = true;
      cur.push_back(nums[i]);
      dfs(nums, used, cur, res);
      cur.pop_back();
      used[i] = false;
    }
  }
};`,
  },
  backtrack_subsets: {
    summary: "C++17 範本：回溯子集",
    code: `// C++17 Template: Backtracking Subsets
class Solution {
 public:
  vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> cur;
    dfs(0, nums, cur, res);
    return res;
  }

 private:
  void dfs(int start, vector<int>& nums, vector<int>& cur,
           vector<vector<int>>& res) {
    res.push_back(cur);  // every node of the recursion tree is a subset
    for (int i = start; i < static_cast<int>(nums.size()); ++i) {
      cur.push_back(nums[i]);
      dfs(i + 1, nums, cur, res);
      cur.pop_back();
    }
  }
};`,
  },
  backtrack_combination_sum: {
    summary: "C++17 模板：剪枝組合和",
    code: `// C++17 Template: Combination Sum with Pruning
class Solution {
 public:
  vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> res;
    vector<int> cur;
    dfs(0, target, candidates, cur, res);
    return res;
  }

 private:
  void dfs(int start, int remain, vector<int>& candidates, vector<int>& cur,
           vector<vector<int>>& res) {
    if (remain == 0) {
      res.push_back(cur);
      return;
    }
    for (int i = start; i < static_cast<int>(candidates.size()); ++i) {
      if (candidates[i] > remain) break;  // sorted: all later candidates fail too
      cur.push_back(candidates[i]);
      dfs(i, remain - candidates[i], candidates, cur, res);  // reuse allowed: stay at i
      cur.pop_back();
    }
  }
};`,
  },
  hashmap_two_sum: {
    summary: "C++17 模板：一次哈希圖（二和）",
    code: `// C++17 Template: One-Pass Hash Map (Two Sum)
class Solution {
 public:
  vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;  // value -> index
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
      auto it = seen.find(target - nums[i]);
      if (it != seen.end()) return {it->second, i};
      seen[nums[i]] = i;
    }
    return {};
  }
};`,
  },
  prefix_count_hashmap: {
    summary: "C++17 模板：帶有雜湊映射計數的前綴和",
    code: `// C++17 Template: Prefix Sum with Hash Map Counting
class Solution {
 public:
  int subarraySum(vector<int>& nums, int k) {
    unordered_map<long long, int> count;  // prefix value -> times seen
    count[0] = 1;
    long long prefix = 0;
    int res = 0;
    for (int x : nums) {
      prefix += x;
      auto it = count.find(prefix - k);
      if (it != count.end()) res += it->second;
      ++count[prefix];
    }
    return res;
  }
};`,
  },
  tree_dfs: {
    summary: "C++17 模板：樹 DFS 回傳子樹事實",
    code: `// C++17 Template: Tree DFS Returning a Subtree Fact
class Solution {
 public:
  int diameterOfBinaryTree(TreeNode* root) {
    int best = 0;
    height(root, best);  // best is updated as a side effect (the answer)
    return best;
  }

 private:
  // Returns the height of node; updates best with the longest path through node.
  int height(TreeNode* node, int& best) {
    if (!node) return 0;
    int left = height(node->left, best);
    int right = height(node->right, best);
    best = max(best, left + right);
    return max(left, right) + 1;
  }
};`,
  },
  tree_bfs_levels: {
    summary: "C++17 模板：樹級順序 BFS",
    code: `// C++17 Template: Tree Level-Order BFS
class Solution {
 public:
  vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
      int sz = q.size();  // freeze the count: process exactly one level
      vector<int> level;
      for (int i = 0; i < sz; ++i) {
        TreeNode* node = q.front();
        q.pop();
        level.push_back(node->val);
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
      }
      res.push_back(level);
    }
    return res;
  }
};`,
  },
  grid_dfs: {
    summary: "C++17 範本：網格洪水填充 (DFS)",
    code: `// C++17 Template: Grid Flood Fill (DFS)
class Solution {
 public:
  int numIslands(vector<vector<char>>& grid) {
    int rows = grid.size(), cols = grid[0].size(), count = 0;
    for (int r = 0; r < rows; ++r) {
      for (int c = 0; c < cols; ++c) {
        if (grid[r][c] == '1') {
          ++count;
          flood(grid, r, c);
        }
      }
    }
    return count;
  }

 private:
  void flood(vector<vector<char>>& grid, int r, int c) {
    if (r < 0 || c < 0 || r >= static_cast<int>(grid.size()) ||
        c >= static_cast<int>(grid[0].size()) || grid[r][c] != '1') {
      return;
    }
    grid[r][c] = '0';  // mark visited in place
    flood(grid, r + 1, c);
    flood(grid, r - 1, c);
    flood(grid, r, c + 1);
    flood(grid, r, c - 1);
  }
};`,
  },
  multi_source_bfs: {
    summary: "C++17 範本：多源網格 BFS",
    code: `// C++17 Template: Multi-Source Grid BFS
class Solution {
 public:
  int orangesRotting(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size(), fresh = 0, minutes = 0;
    queue<pair<int, int>> q;
    for (int r = 0; r < rows; ++r) {
      for (int c = 0; c < cols; ++c) {
        if (grid[r][c] == 2) q.push({r, c});  // seed all sources at once
        else if (grid[r][c] == 1) ++fresh;
      }
    }
    const int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!q.empty() && fresh > 0) {
      int sz = q.size();
      for (int i = 0; i < sz; ++i) {
        auto [r, c] = q.front();
        q.pop();
        for (int d = 0; d < 4; ++d) {
          int nr = r + dr[d], nc = c + dc[d];
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) {
            continue;
          }
          grid[nr][nc] = 2;
          --fresh;
          q.push({nr, nc});
        }
      }
      ++minutes;
    }
    return fresh == 0 ? minutes : -1;
  }
};`,
  },
  union_find: {
    summary: "C++17 範本：帶路徑壓縮的並查找",
    code: `// C++17 Template: Union-Find with Path Compression
class UnionFind {
 public:
  explicit UnionFind(int n) : parent_(n), rank_(n, 0), components_(n) {
    iota(parent_.begin(), parent_.end(), 0);
  }

  int find(int x) {
    while (parent_[x] != x) {
      parent_[x] = parent_[parent_[x]];  // path halving
      x = parent_[x];
    }
    return x;
  }

  bool unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    if (rank_[ra] < rank_[rb]) swap(ra, rb);  // union by rank
    parent_[rb] = ra;
    if (rank_[ra] == rank_[rb]) ++rank_[ra];
    --components_;
    return true;
  }

  int components() const { return components_; }

 private:
  vector<int> parent_, rank_;
  int components_;
};`,
  },
  fenwick_basic: {
    summary: "C++17 範本：Fenwick 樹（點更新、範圍總和）",
    code: `// C++17 Template: Fenwick Tree (Point Update, Range Sum)
class Fenwick {
 public:
  explicit Fenwick(int n) : tree_(n + 1, 0) {}

  void update(int i, long long delta) {
    for (++i; i < static_cast<int>(tree_.size()); i += i & -i) tree_[i] += delta;
  }

  long long query(int i) const {  // prefix sum of [0, i]
    long long s = 0;
    for (++i; i > 0; i -= i & -i) s += tree_[i];
    return s;
  }

  long long range(int l, int r) const {
    return query(r) - (l ? query(l - 1) : 0);
  }

 private:
  vector<long long> tree_;
};`,
  },
  segment_tree_lazy: {
    summary: "C++17 模板：具有延遲傳播的線段樹",
    code: `// C++17 Template: Segment Tree with Lazy Propagation (range add, range sum)
class SegmentTree {
 public:
  explicit SegmentTree(const vector<long long>& a)
      : n_(a.size()), sum_(4 * a.size(), 0), lazy_(4 * a.size(), 0) {
    build(1, 0, n_ - 1, a);
  }

  void update(int l, int r, long long val) { update(1, 0, n_ - 1, l, r, val); }
  long long query(int l, int r) { return query(1, 0, n_ - 1, l, r); }

 private:
  int n_;
  vector<long long> sum_, lazy_;

  void build(int node, int lo, int hi, const vector<long long>& a) {
    if (lo == hi) {
      sum_[node] = a[lo];
      return;
    }
    int mid = (lo + hi) / 2;
    build(2 * node, lo, mid, a);
    build(2 * node + 1, mid + 1, hi, a);
    sum_[node] = sum_[2 * node] + sum_[2 * node + 1];
  }

  void applyLazy(int node, int lo, int hi, long long val) {
    sum_[node] += static_cast<long long>(hi - lo + 1) * val;
    lazy_[node] += val;
  }

  void push(int node, int lo, int hi) {
    if (lazy_[node] == 0) return;
    int mid = (lo + hi) / 2;
    applyLazy(2 * node, lo, mid, lazy_[node]);
    applyLazy(2 * node + 1, mid + 1, hi, lazy_[node]);
    lazy_[node] = 0;
  }

  void update(int node, int lo, int hi, int l, int r, long long val) {
    if (r < lo || hi < l) return;
    if (l <= lo && hi <= r) {
      applyLazy(node, lo, hi, val);
      return;
    }
    push(node, lo, hi);
    int mid = (lo + hi) / 2;
    update(2 * node, lo, mid, l, r, val);
    update(2 * node + 1, mid + 1, hi, l, r, val);
    sum_[node] = sum_[2 * node] + sum_[2 * node + 1];
  }

  long long query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return sum_[node];
    push(node, lo, hi);
    int mid = (lo + hi) / 2;
    return query(2 * node, lo, mid, l, r) +
           query(2 * node + 1, mid + 1, hi, l, r);
  }
};`,
  },
  topo_kahn: {
    summary: "C++17 範本：拓樸排序 (Kahn BFS)",
    code: `// C++17 Template: Topological Sort (Kahn BFS)
class Solution {
 public:
  vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indeg(numCourses, 0);
    for (auto& p : prerequisites) {
      adj[p[1]].push_back(p[0]);
      ++indeg[p[0]];
    }
    queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
      if (indeg[i] == 0) q.push(i);
    }
    vector<int> order;
    while (!q.empty()) {
      int u = q.front();
      q.pop();
      order.push_back(u);
      for (int v : adj[u]) {
        if (--indeg[v] == 0) q.push(v);
      }
    }
    // A short order means a cycle blocked the rest.
    return static_cast<int>(order.size()) == numCourses ? order : vector<int>{};
  }
};`,
  },
  topo_dfs: {
    summary: "C++17 範本：拓樸排序/循環偵測（DFS）",
    code: `// C++17 Template: Topological Sort / Cycle Detection (DFS)
class Solution {
 public:
  bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    for (auto& p : prerequisites) adj[p[1]].push_back(p[0]);
    vector<int> state(numCourses, 0);  // 0=unseen, 1=on stack, 2=done
    for (int i = 0; i < numCourses; ++i) {
      if (state[i] == 0 && hasCycle(i, adj, state)) return false;
    }
    return true;
  }

 private:
  bool hasCycle(int u, vector<vector<int>>& adj, vector<int>& state) {
    state[u] = 1;
    for (int v : adj[u]) {
      if (state[v] == 1) return true;  // back edge to a node on the stack
      if (state[v] == 0 && hasCycle(v, adj, state)) return true;
    }
    state[u] = 2;
    return false;
  }
};`,
  },
  merge_intervals: {
    summary: "C++17 範本：合併重疊區間",
    code: `// C++17 Template: Merge Overlapping Intervals
class Solution {
 public:
  vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());  // by start
    vector<vector<int>> res;
    for (auto& iv : intervals) {
      if (!res.empty() && iv[0] <= res.back()[1]) {
        res.back()[1] = max(res.back()[1], iv[1]);  // extend the open interval
      } else {
        res.push_back(iv);
      }
    }
    return res;
  }
};`,
  },
  kmp: {
    summary: "C++17 範本：KMP 故障功能及搜尋",
    code: `// C++17 Template: KMP Failure Function and Search
class Solution {
 public:
  int strStr(string haystack, string needle) {
    int n = haystack.size(), m = needle.size();
    if (m == 0) return 0;

    vector<int> lps(m, 0);  // longest proper prefix that is also a suffix
    for (int i = 1, len = 0; i < m;) {
      if (needle[i] == needle[len]) {
        lps[i++] = ++len;
      } else if (len) {
        len = lps[len - 1];
      } else {
        lps[i++] = 0;
      }
    }

    for (int i = 0, j = 0; i < n;) {
      if (haystack[i] == needle[j]) {
        ++i; ++j;
        if (j == m) return i - m;
      } else if (j) {
        j = lps[j - 1];  // fall back without moving i
      } else {
        ++i;
      }
    }
    return -1;
  }
};`,
  },
  z_function: {
    summary: "C++17 模板：Z 函數",
    code: `// C++17 Template: Z-Function
class Solution {
 public:
  // z[i] = length of the longest substring from i that matches a prefix of s.
  vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; ++i) {
      if (i < r) z[i] = min(r - i, z[i - l]);  // reuse the current Z-box
      while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
      if (i + z[i] > r) {
        l = i;
        r = i + z[i];
      }
    }
    return z;
  }
};`,
  },
  trie_pointer: {
    summary: "C++17 模板：基於指針的 Trie",
    code: `// C++17 Template: Pointer-Based Trie
class Trie {
 public:
  Trie() : children_{}, isEnd_(false) {}

  void insert(const string& word) {
    Trie* node = this;
    for (char ch : word) {
      int i = ch - 'a';
      if (!node->children_[i]) node->children_[i] = new Trie();
      node = node->children_[i];
    }
    node->isEnd_ = true;
  }

  bool search(const string& word) {
    Trie* node = find(word);
    return node != nullptr && node->isEnd_;
  }

  bool startsWith(const string& prefix) { return find(prefix) != nullptr; }

 private:
  array<Trie*, 26> children_;
  bool isEnd_;

  Trie* find(const string& s) {
    Trie* node = this;
    for (char ch : s) {
      int i = ch - 'a';
      if (!node->children_[i]) return nullptr;
      node = node->children_[i];
    }
    return node;
  }
};`,
  },
  trie_xor: {
    summary: "C++17 範本：用於 XOR 最大化的二進位 Trie",
    code: `// C++17 Template: Binary Trie for XOR Maximization
class Solution {
 public:
  int findMaximumXOR(vector<int>& nums) {
    vector<array<int, 2>> trie(1, {0, 0});  // array-based bit trie

    auto insert = [&](int x) {
      int node = 0;
      for (int b = 31; b >= 0; --b) {
        int bit = (x >> b) & 1;
        if (!trie[node][bit]) {
          trie.push_back({0, 0});
          trie[node][bit] = static_cast<int>(trie.size()) - 1;
        }
        node = trie[node][bit];
      }
    };

    auto query = [&](int x) {  // greedily take the opposite bit when possible
      int node = 0, best = 0;
      for (int b = 31; b >= 0; --b) {
        int bit = (x >> b) & 1;
        if (trie[node][bit ^ 1]) {
          best |= (1 << b);
          node = trie[node][bit ^ 1];
        } else {
          node = trie[node][bit];
        }
      }
      return best;
    };

    int res = 0;
    for (int x : nums) {
      insert(x);
      res = max(res, query(x));
    }
    return res;
  }
};`,
  },
  two_heap_median: {
    summary: "C++17 模板：兩堆運行中位數",
    code: `// C++17 Template: Two-Heap Running Median
class MedianFinder {
 public:
  void addNum(int num) {
    lo_.push(num);                 // push to max-heap
    hi_.push(lo_.top()); lo_.pop();  // balance the largest of lo into hi
    if (hi_.size() > lo_.size()) {   // keep lo the same size or one larger
      lo_.push(hi_.top());
      hi_.pop();
    }
  }

  double findMedian() {
    if (lo_.size() > hi_.size()) return lo_.top();
    return (lo_.top() + hi_.top()) / 2.0;
  }

 private:
  priority_queue<int> lo_;                                // lower half (max-heap)
  priority_queue<int, vector<int>, greater<int>> hi_;     // upper half (min-heap)
};`,
  },
  merge_k_heap: {
    summary: "C++17 範本：將 K 個排序清單與堆疊合併",
    code: `// C++17 Template: Merge K Sorted Lists with a Heap
class Solution {
 public:
  ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
    for (ListNode* node : lists) {
      if (node) pq.push(node);
    }
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (!pq.empty()) {
      ListNode* node = pq.top();
      pq.pop();
      tail->next = node;
      tail = node;
      if (node->next) pq.push(node->next);
    }
    return dummy.next;
  }
};`,
  },
  sieve: {
    summary: "C++17 模板：埃拉托斯特尼篩法",
    code: `// C++17 Template: Sieve of Eratosthenes
class Solution {
 public:
  int countPrimes(int n) {
    if (n < 3) return 0;
    vector<bool> isComposite(n, false);
    int count = 0;
    for (int i = 2; i < n; ++i) {
      if (isComposite[i]) continue;
      ++count;
      for (long long j = static_cast<long long>(i) * i; j < n; j += i) {
        isComposite[j] = true;  // start at i*i; smaller multiples already marked
      }
    }
    return count;
  }
};`,
  },
  fast_pow: {
    summary: "C++17 模板：快速模冪",
    code: `// C++17 Template: Fast Modular Exponentiation
class Solution {
 public:
  long long power(long long base, long long exp, long long mod) {
    long long result = 1 % mod;
    base %= mod;
    while (exp > 0) {
      if (exp & 1) result = result * base % mod;  // multiply on set bits
      base = base * base % mod;
      exp >>= 1;
    }
    return result;
  }
};`,
  },
  merge_sort_count: {
    summary: "C++17 範本：歸併排序反轉計數",
    code: `// C++17 Template: Merge Sort Inversion Counting
class Solution {
 public:
  long long countInversions(vector<int>& nums) {
    vector<int> buffer(nums.size());
    return sortCount(nums, buffer, 0, static_cast<int>(nums.size()) - 1);
  }

 private:
  long long sortCount(vector<int>& a, vector<int>& buf, int lo, int hi) {
    if (lo >= hi) return 0;
    int mid = (lo + hi) / 2;
    long long count = sortCount(a, buf, lo, mid) + sortCount(a, buf, mid + 1, hi);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
      if (a[i] <= a[j]) {
        buf[k++] = a[i++];
      } else {
        count += mid - i + 1;  // a[i..mid] all exceed a[j]
        buf[k++] = a[j++];
      }
    }
    while (i <= mid) buf[k++] = a[i++];
    while (j <= hi) buf[k++] = a[j++];
    for (int t = lo; t <= hi; ++t) a[t] = buf[t];
    return count;
  }
};`,
  },
  quickselect: {
    summary: "C++17 範本：快速選擇第 K 個元素",
    code: `// C++17 Template: Quickselect for the K-th Element
class Solution {
 public:
  int findKthLargest(vector<int>& nums, int k) {
    int target = static_cast<int>(nums.size()) - k;  // k-th largest = (n-k)-th smallest
    int lo = 0, hi = static_cast<int>(nums.size()) - 1;
    while (lo < hi) {
      int p = partition(nums, lo, hi);
      if (p == target) break;
      if (p < target) lo = p + 1; else hi = p - 1;
    }
    return nums[target];
  }

 private:
  int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; ++j) {
      if (a[j] < pivot) swap(a[i++], a[j]);
    }
    swap(a[i], a[hi]);
    return i;
  }
};`,
  },
  dijkstra_lazy: {
    summary: "C++17 模板：帶有延遲刪除的 Dijkstra",
    code: "// C++17 Template: Dijkstra with Lazy Deletion\nclass Solution {\n public:\n  int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n    vector<vector<pair<int, int>>> graph(n + 1);\n    for (const auto& edge : times) {\n      graph[edge[0]].push_back({edge[1], edge[2]});\n    }\n\n    const long long kUnreachable = LLONG_MAX / 4;\n    vector<long long> dist(n + 1, kUnreachable);\n    priority_queue heap(greater<>{}, vector<pair<long long, int>>{});\n    dist[k] = 0;\n    heap.push({0, k});\n\n    while (!heap.empty()) {\n      const auto [d, node] = heap.top();\n      heap.pop();\n      if (d > dist[node]) {\n        continue;  // Stale entry: a shorter path was already settled.\n      }\n      for (const auto& [next, weight] : graph[node]) {\n        if (d + weight < dist[next]) {\n          dist[next] = d + weight;\n          heap.push({dist[next], next});\n        }\n      }\n    }\n\n    long long answer = 0;\n    for (int node = 1; node <= n; ++node) {\n      answer = max(answer, dist[node]);\n    }\n    return answer >= kUnreachable ? -1 : static_cast<int>(answer);\n  }\n};",
  },
  zero_one_bfs: {
    summary: "C++17 範本：0-1 BFS 與雙端佇列",
    code: "// C++17 Template: 0-1 BFS with a Deque\nclass Solution {\n public:\n  int minCost(vector<vector<int>>& grid) {\n    const int rows = grid.size();\n    const int cols = grid[0].size();\n    const int kDirs[4][2] = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};\n\n    vector<vector<int>> dist(rows, vector<int>(cols, INT_MAX));\n    deque<pair<int, int>> queue;\n    dist[0][0] = 0;\n    queue.push_front({0, 0});\n\n    while (!queue.empty()) {\n      const auto [row, col] = queue.front();\n      queue.pop_front();\n      for (int dir = 0; dir < 4; ++dir) {\n        const int next_row = row + kDirs[dir][0];\n        const int next_col = col + kDirs[dir][1];\n        if (next_row < 0 || next_row >= rows || next_col < 0 ||\n            next_col >= cols) {\n          continue;\n        }\n        const int cost = grid[row][col] == dir + 1 ? 0 : 1;\n        if (dist[row][col] + cost < dist[next_row][next_col]) {\n          dist[next_row][next_col] = dist[row][col] + cost;\n          if (cost == 0) {\n            queue.push_front({next_row, next_col});\n          } else {\n            queue.push_back({next_row, next_col});\n          }\n        }\n      }\n    }\n\n    return dist[rows - 1][cols - 1];\n  }\n};",
  },
  bellman_ford_k_edges: {
    summary: "C++17 模板：貝爾曼-福特僅限 K 輪",
    code: "// C++17 Template: Bellman-Ford Limited to K Rounds\nclass Solution {\n public:\n  int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst,\n                        int k) {\n    const int kUnreachable = INT_MAX / 2;\n    vector<int> dist(n, kUnreachable);\n    dist[src] = 0;\n\n    for (int round = 0; round <= k; ++round) {\n      vector<int> next_dist = dist;  // Snapshot so each round adds one edge.\n      for (const auto& flight : flights) {\n        const int from = flight[0];\n        const int to = flight[1];\n        const int price = flight[2];\n        next_dist[to] = min(next_dist[to], dist[from] + price);\n      }\n      dist = move(next_dist);\n    }\n\n    return dist[dst] >= kUnreachable ? -1 : dist[dst];\n  }\n};",
  },
  fast_slow_cycle: {
    summary: "C++17 範本：Floyd 循環偵測",
    code: "// C++17 Template: Floyd Cycle Detection\nclass Solution {\n public:\n  ListNode* detectCycle(ListNode* head) {\n    ListNode* slow = head;\n    ListNode* fast = head;\n\n    while (fast != nullptr && fast->next != nullptr) {\n      slow = slow->next;\n      fast = fast->next->next;\n      if (slow == fast) {\n        // Restart one pointer at the head; both now advance one step.\n        slow = head;\n        while (slow != fast) {\n          slow = slow->next;\n          fast = fast->next;\n        }\n        return slow;\n      }\n    }\n\n    return nullptr;\n  }\n};",
  },
  reverse_linked_list: {
    summary: "C++17 範本：就地鍊錶反轉",
    code: "// C++17 Template: In-Place Linked-List Reversal\nclass Solution {\n public:\n  ListNode* reverseList(ListNode* head) {\n    ListNode* previous = nullptr;\n    ListNode* current = head;\n\n    // Invariant: previous heads the reversed prefix; current heads the\n    // untouched suffix.\n    while (current != nullptr) {\n      ListNode* next = current->next;\n      current->next = previous;\n      previous = current;\n      current = next;\n    }\n\n    return previous;\n  }\n};",
  },
  merge_sorted_lists: {
    summary: "C++17 模板：假頭合併",
    code: "// C++17 Template: Dummy-Head Merge\nclass Solution {\n public:\n  ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    ListNode dummy(0);\n    ListNode* tail = &dummy;\n\n    while (list1 != nullptr && list2 != nullptr) {\n      if (list1->val <= list2->val) {\n        tail->next = list1;\n        list1 = list1->next;\n      } else {\n        tail->next = list2;\n        list2 = list2->next;\n      }\n      tail = tail->next;\n    }\n    tail->next = list1 != nullptr ? list1 : list2;\n\n    return dummy.next;\n  }\n};",
  },
  lru_cache: {
    summary: "C++17 模板：LRU 快取（列表+哈希圖）",
    code: "// C++17 Template: LRU Cache (List + Hash Map)\nclass LRUCache {\n public:\n  explicit LRUCache(int capacity) : capacity_(capacity) {}\n\n  int get(int key) {\n    const auto it = index_.find(key);\n    if (it == index_.end()) {\n      return -1;\n    }\n    items_.splice(items_.begin(), items_, it->second);\n    return it->second->second;\n  }\n\n  void put(int key, int value) {\n    const auto it = index_.find(key);\n    if (it != index_.end()) {\n      it->second->second = value;\n      items_.splice(items_.begin(), items_, it->second);\n      return;\n    }\n    if (static_cast<int>(items_.size()) == capacity_) {\n      index_.erase(items_.back().first);\n      items_.pop_back();\n    }\n    items_.emplace_front(key, value);\n    index_[key] = items_.begin();\n  }\n\n private:\n  int capacity_;\n  list<pair<int, int>> items_;  // Most recently used at the front.\n  unordered_map<int, list<pair<int, int>>::iterator> index_;\n};",
  },
  insert_delete_getrandom: {
    summary: "C++17 模板：與最後一個隨機集交換",
    code: "// C++17 Template: Swap-With-Last Random Set\nclass RandomizedSet {\n public:\n  bool insert(int val) {\n    if (position_.count(val) != 0) {\n      return false;\n    }\n    position_[val] = values_.size();\n    values_.push_back(val);\n    return true;\n  }\n\n  bool remove(int val) {\n    const auto it = position_.find(val);\n    if (it == position_.end()) {\n      return false;\n    }\n    // Move the last element into the vacated slot, then pop the tail.\n    const int last = values_.back();\n    values_[it->second] = last;\n    position_[last] = it->second;\n    values_.pop_back();\n    position_.erase(val);\n    return true;\n  }\n\n  int getRandom() { return values_[rand() % values_.size()]; }\n\n private:\n  vector<int> values_;\n  unordered_map<int, int> position_;\n};",
  },
  min_stack: {
    summary: "C++17 模板：具有同步最小值的堆疊",
    code: "// C++17 Template: Stack with Synchronized Minimum\nclass MinStack {\n public:\n  void push(int val) {\n    values_.push_back(val);\n    minimums_.push_back(minimums_.empty() ? val : min(val, minimums_.back()));\n  }\n\n  void pop() {\n    values_.pop_back();\n    minimums_.pop_back();\n  }\n\n  int top() const { return values_.back(); }\n\n  int getMin() const { return minimums_.back(); }\n\n private:\n  vector<int> values_;\n  vector<int> minimums_;  // minimums_[i] = min of values_[0..i].\n};",
  },
};

/**
 * Display metadata for each template, used by the unified collapsible system.
 * Kept separate from {@link TEMPLATES} so the verified C++17 code strings stay
 * byte-identical. The collapsible trigger renders as `${name} — ${complexity}`
 * and `whenToUse` is shown between the trigger and the code block.
 */
interface TemplateMeta {
  /** Human-readable template name (no "C++17 Template:" prefix). */
  name: string;
  /** Asymptotic cost, e.g. "O(n log n)". Rendered in the collapsed trigger. */
  complexity: string;
  /** 1–2 sentences describing when to reach for this template. */
  whenToUse: string;
}

const TEMPLATE_META: Record<string, TemplateMeta> = {
  constraint_scan: {
    name: "約束引導滑動掃描",
    complexity: "在）",
    whenToUse:
      "計算加法成本保持≤限制的子數組，當添加元素時只會增加成本，因此左邊緣永遠不會向後移動。",
  },
  brute_force_to_prefix: {
    name: "前綴狀態替換",
    complexity: "在）",
    whenToUse:
      "將 O(n) 內部重新計算替換為正在運行的前綴加上先前看到的狀態的雜湊圖，例如sum == target (mod p) 的最短子數組。",
  },
  answer_search: {
    name: "對答案進行二分查找",
    complexity: "O(n log(最大答案))",
    whenToUse:
      "答案是透過單調可行性測試的最小/最大值，並且單一貪婪傳遞可以檢查一個候選值。",
  },
  loop_invariant_binary_search: {
    name: "具有循環不變性的下界",
    complexity: "O(logn)",
    whenToUse:
      "找出滿足單調謂詞的排序數組的第一個索引；保持半開不變性 `[low, high)` 以避免差一錯誤。",
  },
  enumerate_middle: {
    name: "使用 Fenwick 計數枚舉中間",
    complexity: "O(n log n)",
    whenToUse:
      "透過固定中間元素並詢問其左側和右側有多少個有效元素來計算三元組/四元組。",
  },
  subset_enumeration: {
    name: "子掩碼枚舉 DP",
    complexity: "O(3^n)",
    whenToUse:
      "對 n ≤ ~18 個元素進行分區或覆蓋問題，其中每個遮罩分為子遮罩及其剩餘補碼。",
  },
  contribution_mono: {
    name: "子數組最小貢獻（單調堆疊）",
    complexity: "在）",
    whenToUse: "透過計算每個元素的最小/最大子數組數量，對所有子數組求和。",
  },
  pair_contribution: {
    name: "排序後的配對貢獻",
    complexity: "O(n log n)",
    whenToUse:
      "透過對每對進行排序並將其轉換為前綴和貢獻，對所有對（例如 Σ|a_i − a_j|）求和。",
  },
  prefix_contribution: {
    name: "前綴/後綴分割掃描",
    complexity: "在）",
    whenToUse:
      "使用左側的前綴聚合 (max) 和右側的後綴聚合 (min) 來計算有效分割點。",
  },
  longest_window: {
    name: "最長有效窗口",
    complexity: "在）",
    whenToUse: "最大化視窗長度，同時違規計數器（例如翻轉零）保持在預算 k 內。",
  },
  shortest_window: {
    name: "最短有效視窗",
    complexity: "在）",
    whenToUse:
      "一旦滿足 ≥ 閾值條件，就最小化視窗長度，在條件仍然成立時從左側縮小。",
  },
  at_most_k_distinct: {
    name: "最多 K 個不同窗口",
    complexity: "在）",
    whenToUse:
      "使用視窗的頻率圖對不同值的數量不超過 k 的子數組進行計數或測量。",
  },
  exactly_k_distinct: {
    name: "精確-K 透過 At-Most(K) − At-Most(K−1)",
    complexity: "在）",
    whenToUse:
      "當直接精確視窗不方便時，將精確計數要求轉換為最多兩個單調計數的差。",
  },
  bitwise_or_window: {
    name: "帶位計數的位元或視窗",
    complexity: "O(n·B)",
    whenToUse:
      "Windows 受位元 OR ≥ k 約束，其中每位計數器允許您在刪除左側元素後支援 OR。",
  },
  prefix_suffix_counts: {
    name: "圍繞樞軸的前綴/後綴計數",
    complexity: "O(n·Σ)",
    whenToUse:
      "透過固定中間值並乘以匹配的前綴和後綴字元計數，對 x…y…x 等模式進行計數。",
  },
  difference_array: {
    name: "一維差分數組",
    complexity: "O(n+q)",
    whenToUse: "應用許多範圍添加更新，然後透過單一前綴和傳遞具體化最終數組。",
  },
  difference_matrix: {
    name: "二維差分數組",
    complexity: "O(n^2 + q)",
    whenToUse: "在網格上套用許多矩形新增更新，然後使用 2D 前綴和重建值。",
  },
  monotonic_stack: {
    name: "單調堆疊邊界",
    complexity: "在）",
    whenToUse:
      "一次找出下一個/上一個更大或更小的元素，或每個元素占主導地位的跨度。",
  },
  monotonic_deque: {
    name: "單調雙端佇列視窗極值",
    complexity: "在）",
    whenToUse:
      "滑動視窗最大值/最小值，您需要目前視窗的極端值（以攤銷 O(1) 表示）。",
  },
  coordinate_compression_fenwick: {
    name: "座標壓縮 + Fenwick",
    complexity: "O(n log n)",
    whenToUse: "將數值壓縮到排名後，對大或稀疏值域上的反轉或向右較小進行計數。",
  },
  exchange_greedy: {
    name: "最早完成貪婪（交換參數）",
    complexity: "O(n log n)",
    whenToUse:
      "最大非重疊間隔/間隔調度，透過對結束時間和交換參數進行排序證明是正確的。",
  },
  interval_cover_greedy: {
    name: "保持領先間隔覆蓋",
    complexity: "O(n log n)",
    whenToUse: "透過重複跳到目前可到達的最遠右端，以最少的間隔覆蓋[0，目標]。",
  },
  greedy_builder: {
    name: "帶可行性檢查的貪婪構造",
    complexity: "O(n·Σ)",
    whenToUse:
      "按位置建立字典順序最小的答案位置，僅在剩餘位置仍可完成時才做出選擇。",
  },
  greedy_lexicographic: {
    name: "帶配額的字典序最小子序列",
    complexity: "在）",
    whenToUse:
      "單調堆疊貪婪，彈出較大的前導字符，同時保持大小 k 和每個字母配額約束可行。",
  },
  remaining_sum_construction: {
    name: "餘款建設",
    complexity: "在）",
    whenToUse: "從後面貪婪地分配目標金額，以便前面的頭寸保持盡可能小。",
  },
  frequency_construction: {
    name: "基於頻率的堆構建",
    complexity: "O(n log Σ)",
    whenToUse:
      "透過始終放置與最後一個不同的最高剩餘頻率來重新排列字符，以便沒有兩個相鄰字符相等。",
  },
  mst_kruskal: {
    name: "克魯斯卡爾 MST（切割屬性）",
    complexity: "O(E log E)",
    whenToUse:
      "透過添加連接兩個組件的最便宜的邊來建立最小生成樹，或回答連接成本問題。",
  },
  state_bfs: {
    name: "BFS 過明確（節點，遮罩）狀態",
    complexity: "O(2^n·n)",
    whenToUse:
      "最短路徑時狀態必須記住哪些節點已經被存取過，而不僅僅是當前節點。",
  },
  bitmask_dp: {
    name: "賦值位元遮罩 DP",
    complexity: "O(2^n·n)",
    whenToUse:
      "n 個項目到 n 個槽的最佳一對一分配，其中遮罩對已使用的槽進行編碼。",
  },
  offline_fenwick: {
    name: "按閾值排序的離線查詢",
    complexity: "O((n + q) log n)",
    whenToUse:
      "透過對閾值上的查詢進行排序並隨著閾值的增長插入值來回答由值閾值門控的許多範圍計數查詢。",
  },
  sweep_events: {
    name: "事件排序掃描",
    complexity: "O(n log n)",
    whenToUse: "透過以座標順序掃描 +1 和 −1 事件來實現最大並發間隔/峰值重疊。",
  },
  sweep_difference: {
    name: "使用查詢進行差異事件掃描",
    complexity: "O((n + q) log(n + q))",
    whenToUse:
      "透過將排序的差異圖累積到每個查詢座標來回答針對多個間隔的點查詢。",
  },
  sweep_heap: {
    name: "並發資源的堆疊掃描",
    complexity: "O(n log n)",
    whenToUse:
      "透過從結束時間的最小堆中彈出已完成的間隔來最小化會議室/並發資源。",
  },
  sweep_compressed_fenwick: {
    name: "帶有範圍添加的壓縮掃描",
    complexity: "O((n + q) log n)",
    whenToUse:
      "使用壓縮加上 Fenwick 範圍添加來計算在大座標空間上覆蓋每個查詢點的間隔數量。",
  },
  dp_state: {
    name: "滾動 DP 方向最佳",
    complexity: "O(n·米)",
    whenToUse: "網格/序列 DP，其中每行的轉換需要從左側和右側可到達的最佳值。",
  },
  dp_transition: {
    name: "間隔 DP 轉換",
    complexity: "O(n^3)",
    whenToUse:
      "透過嘗試每個分割點（合併石頭、切割棒、矩陣鏈）來找到組合連續範圍的最佳方法。",
  },
  coordinate_compress: {
    name: "協調壓縮到等級",
    complexity: "O(n log n)",
    whenToUse:
      "在索引計數數組、Fenwick 樹或 DP 表之前，將大值域或稀疏值域對應到密集索引 0..m−1。",
  },
  exchange_swap_sort: {
    name: "成對交換比較器排序",
    complexity: "O(n log n)",
    whenToUse:
      "最佳順序由成對「a before b」測試定義；按該比較器排序，並使用相鄰交換交換參數來證明其合理性。",
  },
  mst_prim: {
    name: "Prim最小生成樹",
    complexity: "O(E log V)",
    whenToUse:
      "從種子節點產生 MST，重複將穿過切口的最輕邊拉入樹中 - 這在作為鄰接給出的密集圖上很方便。",
  },
  dp_state_machine: {
    name: "DP 狀態機（持有/現金）",
    complexity: "在）",
    whenToUse:
      "每個位置都有一些相互排斥的狀態（持有與不持有、鎖定與自由）；為每個狀態保留一個變數並讀取最佳的最終狀態。",
  },
  dp_knapsack: {
    name: "0/1 背包帶反向容量環",
    complexity: "O(n·W)",
    whenToUse:
      "子集選擇 DP，其中每個項目最多使用一次；向下迭代容量，以便每個項目僅更新每個狀態一次。",
  },
  game_nim_xor: {
    name: "Nim / XOR 優勝者檢查",
    complexity: "在）",
    whenToUse:
      "獨立堆，其中一步移動會縮小一個堆（經典 Nim，或分解為 Grundy 值的 XOR 和的任何遊戲）。",
  },
  game_grundy: {
    name: "透過 Memoized DFS 獲得的 Grundy 價值",
    complexity: "O(狀態·分支)",
    whenToUse:
      "計算遊戲狀態的 Grundy 數（可達 Grundy 值的 mex）；異或獨立組件來決定勝負。",
  },
  game_interval_dp: {
    name: "間隔 DP 兩人遊戲",
    complexity: "O(n^2)",
    whenToUse:
      "在子陣列上進行回合製遊戲，每位玩家從一端拿取；追蹤目前玩家可以施加的分數差異。",
  },
  game_pn_table: {
    name: "P/N 位置表",
    complexity: "O(n·分支)",
    whenToUse:
      "小型單堆遊戲（Bash、Divisor）；當某個動作使對手處於失敗（P）狀態時，一個狀態就獲勝。",
  },
  two_pointers_opposite: {
    name: "相反方向的兩個指針",
    complexity: "在）",
    whenToUse:
      "排序數組（或對稱結構），其中將兩端之一移入/移出足以找到一對/三元組或檢查回文。",
  },
  three_sum: {
    name: "3Sum 與已排序的兩個指針",
    complexity: "O(n^2)",
    whenToUse:
      "固定最小元素，然後將內對搜尋折疊到相反方向的兩個指標；跳過重複項以進行重複資料刪除。",
  },
  backtrack_permute: {
    name: "回溯排列",
    complexity: "O(n·n!)",
    whenToUse: "枚舉所有訂單；跟踪 `used[]` 集並在遞歸後撤消它。",
  },
  backtrack_subsets: {
    name: "回溯子集",
    complexity: "O(n·2^n)",
    whenToUse:
      "列舉所有子集/組合； `start` 索引可防止重新訪問較早的元素並避免重複的集合。",
  },
  backtrack_combination_sum: {
    name: "剪枝組合和",
    complexity: "O(答案·目標)",
    whenToUse:
      "在目標下重複選擇；首先排序，以便 `candidate > remain` 修剪分支的整個尾部。",
  },
  hashmap_two_sum: {
    name: "一次哈希圖（二和）",
    complexity: "在）",
    whenToUse:
      "尋找先前看到的補碼（`target - x`）；掃描時儲存值→索引，因此每個元素都會檢查一次。",
  },
  prefix_count_hashmap: {
    name: "帶有哈希映射計數的前綴和",
    complexity: "在）",
    whenToUse:
      "透過計算有多少個早期前綴等於 `prefix - k` 來計算具有目標和/屬性的子數組。",
  },
  tree_dfs: {
    name: "返回子樹事實的樹 DFS",
    complexity: "在）",
    whenToUse:
      "每個節點都需要根據其子節點計算出一個值（高度、總和、直徑）；向上返回事實並更新全域最佳值。",
  },
  tree_bfs_levels: {
    name: "樹級順序 BFS",
    complexity: "在）",
    whenToUse:
      "您需要按級別進行處理（級別順序、右側視圖、最小深度）；凍結佇列大小以限制一級。",
  },
  grid_dfs: {
    name: "網格洪水填充 (DFS)",
    complexity: "O(列·列)",
    whenToUse:
      "計算或測量網格中的連接區域；標記已造訪的單元格，以避免單獨存取的陣列。",
  },
  multi_source_bfs: {
    name: "多源網格 BFS",
    complexity: "O(列·列)",
    whenToUse:
      "同時距多個來源的最短時間/距離（腐爛的橙子，最接近 0）；將每個來源播種到 0 級的隊列中。",
  },
  union_find: {
    name: "帶路徑壓縮的並查找",
    complexity: "O(α(n)) 攤銷",
    whenToUse:
      "增量聯合下的動態連接/計數組件；路徑減半+依等級並集給出近乎恆定的查詢。",
  },
  fenwick_basic: {
    name: "芬威克樹（點更新，範圍總和）",
    complexity: "每個運算的 O(log n)",
    whenToUse:
      "維護點更新下的前綴和；當您只需要範圍內的總和（而不是最小值/最大值）時，最簡單的結構。",
  },
  segment_tree_lazy: {
    name: "具有延遲傳播的線段樹",
    complexity: "每個運算的 O(log n)",
    whenToUse:
      "範圍更新和範圍查詢在一起（範圍添加+範圍總和）；惰性標籤推遲工作直到節點被分裂。",
  },
  topo_kahn: {
    name: "拓樸排序（Kahn BFS）",
    complexity: "O(V+E)",
    whenToUse:
      "產生 DAG 的排序（或透過短輸出偵測循環）；重複發出度數為零的節點。",
  },
  topo_dfs: {
    name: "拓樸排序/循環檢測（DFS）",
    complexity: "O(V+E)",
    whenToUse: "偵測有向循環或獲得具有三色 DFS 狀態的逆後序拓撲順序。",
  },
  merge_intervals: {
    name: "合併重疊區間",
    complexity: "O(n log n)",
    whenToUse: "按開始排序，然後在下一個與最後一個保留的間隔重疊時延長它。",
  },
  kmp: {
    name: "KMP故障功能及查找",
    complexity: "O(n+m)",
    whenToUse:
      "子字串搜尋或自重疊問題； LPS 陣列可以讓模式回退，而無需重新掃描文字。",
  },
  z_function: {
    name: "Z-Function",
    complexity: "在）",
    whenToUse:
      "一次將前綴與每個後綴進行匹配（透過 `pattern + '#' + text` 進行模式搜索，句點檢測）。",
  },
  trie_pointer: {
    name: "基於指針的特里樹",
    complexity: "每個字 O(L)",
    whenToUse: "插入/搜尋/開始多個字串共享前綴；每個字母一個子指標。",
  },
  trie_xor: {
    name: "用於 XOR 最大化的二進位 Trie",
    complexity: "O(n·32)",
    whenToUse: "針對集合最大化/最小化異或；逐位儲存數字並貪婪地走到相反的位。",
  },
  two_heap_median: {
    name: "兩堆運行中位數",
    complexity: "每次新增 O(log n)",
    whenToUse: "維護流的中位數；下半部的最大堆和上半部的最小堆保持平衡。",
  },
  merge_k_heap: {
    name: "將 K 個排序清單與堆疊合併",
    complexity: "O(N log k)",
    whenToUse: "合併k個排序序列；每個目前前端的堆將全域最小值保持在頂部。",
  },
  sieve: {
    name: "埃拉托斯特尼篩法",
    complexity: "O(n 對數 n)",
    whenToUse:
      "預先計算直到 n 的所有質數（或最小素因數）；從 i·i 開始標記複合材料。",
  },
  fast_pow: {
    name: "快速模冪",
    complexity: "O(對數指數)",
    whenToUse:
      "計算大指數的底^exp (mod m)；求底數的平方並乘以指數的每個設定位。",
  },
  merge_sort_count: {
    name: "歸併排序反轉計數",
    complexity: "O(n log n)",
    whenToUse:
      "排序時計算反轉/範圍和對；當取出右側元素時，所有剩餘的左側元素形成反轉。",
  },
  quickselect: {
    name: "快速選擇第 K 個元素",
    complexity: "O(n) 平均",
    whenToUse:
      "無需完全排序，找到第k個最小/最大的；分區並遞歸到僅包含目標的一側。",
  },
  dijkstra_lazy: {
    name: "Dijkstra 與延遲刪除",
    complexity: "O((n + m) log m)",
    whenToUse:
      "具有非負邊權重的單源最短路徑；推動改進的距離並跳過陳舊的堆條目，而不是減少鍵。",
  },
  zero_one_bfs: {
    name: "0-1 BFS 帶雙端佇列",
    complexity: "O(n+m)",
    whenToUse:
      "當每條邊的成本為 0 或 1 時的最短路徑（通常在網格中，跟隨箭頭是免費的，改變它是有代價的）：將 0 邊推到前面，將 1 邊推到後面。",
  },
  bellman_ford_k_edges: {
    name: "貝爾曼-福特僅限 K 輪",
    complexity: "O(k·米)",
    whenToUse:
      "使用至多 k+1 條邊的最便宜路徑，或具有負邊的圖，其中 Dijkstra 的固定集參數中斷；快照每輪的距離。",
  },
  fast_slow_cycle: {
    name: "Floyd騎乘偵測（龜兔賽跑）",
    complexity: "在）",
    whenToUse:
      "檢測循環並在 O(1) 空間中的鍊錶中找到其條目 - 或任何隱式後繼函數，例如數組索引上的重複查找。",
  },
  reverse_linked_list: {
    name: "原地鍊錶反轉",
    complexity: "在）",
    whenToUse:
      "透過每一步重定向一個 `next` 指標來反轉整個列表、子列表或固定大小的群組，同時保持反轉前綴/完整後綴不變量。",
  },
  merge_sorted_lists: {
    name: "假人頭合併",
    complexity: "O(n+m)",
    whenToUse:
      "將兩個排序清單拼接在一起；虛擬頭將第一個真實節點轉換為普通情況，因此沒有分支特殊情況會出現空結果。",
  },
  lru_cache: {
    name: "LRU 快取（列表+哈希圖）",
    complexity: "每次操作 O(1)",
    whenToUse:
      "使用雙向鍊錶維護新近順序，並使用列表迭代器的雜湊映射進行 O(1) 查找； splice 將節點接觸到前面並從尾部逐出。",
  },
  insert_delete_getrandom: {
    name: "與最後一個隨機集交換",
    complexity: "每次操作 O(1)",
    whenToUse:
      "透過將值儲存在向量中並用最後一個元素填充每個刪除孔來支援插入、刪除和均勻隨機取樣。",
  },
  min_stack: {
    name: "具有同步最小值的堆疊",
    complexity: "每次操作 O(1)",
    whenToUse:
      "透過將正在運行的聚合與每個值一起推送並將它們一起彈出來回答當前堆疊內容的聚合（最小/最大）。",
  },
};

/**
 * What each template implements, so readers know it at a glance. A template is
 * either `lc` (its code is essentially the solution to a specific LeetCode
 * problem — rendered as a linked "Based on" reference) or `pattern` (a generic
 * technique — rendered as a detailed "Pattern" description). IDs/slugs/titles
 * were taken from the official LeetCode problems API.
 */
const TEMPLATE_BASIS: Record<
  string,
  { lc?: { id: number; slug: string; title: string }; pattern?: string }
> = {
  brute_force_to_prefix: {
    lc: {
      id: 1590,
      slug: "make-sum-divisible-by-p",
      title: "使總和可被 P 整除",
    },
  },
  answer_search: {
    lc: {
      id: 1011,
      slug: "capacity-to-ship-packages-within-d-days",
      title: "D 天內運送包裹的能力",
    },
  },
  contribution_mono: {
    lc: {
      id: 907,
      slug: "sum-of-subarray-minimums",
      title: "子數組最小值之和",
    },
  },
  longest_window: {
    lc: {
      id: 1004,
      slug: "max-consecutive-ones-iii",
      title: "最大連續數 III",
    },
  },
  shortest_window: {
    lc: {
      id: 209,
      slug: "minimum-size-subarray-sum",
      title: "最小子數組總和",
    },
  },
  exactly_k_distinct: {
    lc: {
      id: 992,
      slug: "subarrays-with-k-different-integers",
      title: "具有 K 個不同整數的子數組",
    },
  },
  bitwise_or_window: {
    lc: {
      id: 3097,
      slug: "shortest-subarray-with-or-at-least-k-ii",
      title: "OR 至少 K II 的最短子數組",
    },
  },
  difference_matrix: {
    lc: {
      id: 2536,
      slug: "increment-submatrices-by-one",
      title: "將子矩陣加一",
    },
  },
  monotonic_deque: {
    lc: {
      id: 239,
      slug: "sliding-window-maximum",
      title: "滑動視窗最大值",
    },
  },
  coordinate_compression_fenwick: {
    lc: {
      id: 315,
      slug: "count-of-smaller-numbers-after-self",
      title: "數出自身之後較小的數字",
    },
  },
  exchange_greedy: {
    lc: {
      id: 435,
      slug: "non-overlapping-intervals",
      title: "非重疊區間",
    },
  },
  greedy_lexicographic: {
    lc: {
      id: 2030,
      slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter",
      title: "出現字母的最小 K 長度子序列",
    },
  },
  remaining_sum_construction: {
    lc: {
      id: 1663,
      slug: "smallest-string-with-a-given-numeric-value",
      title: "具有給定數值的最小字串",
    },
  },
  frequency_construction: {
    lc: { id: 767, slug: "reorganize-string", title: "重組字串" },
  },
  state_bfs: {
    lc: {
      id: 847,
      slug: "shortest-path-visiting-all-nodes",
      title: "存取所有節點的最短路徑",
    },
  },
  bitmask_dp: {
    lc: {
      id: 1879,
      slug: "minimum-xor-sum-of-two-arrays",
      title: "兩個數組的最小異或和",
    },
  },
  sweep_difference: {
    lc: {
      id: 2251,
      slug: "number-of-flowers-in-full-bloom",
      title: "盛開的花朵數量",
    },
  },
  sweep_heap: {
    lc: { id: 253, slug: "meeting-rooms-ii", title: "會議室二" },
  },
  dp_state: {
    lc: {
      id: 1937,
      slug: "maximum-number-of-points-with-cost",
      title: "最大點數與成本",
    },
  },
  dp_transition: {
    lc: {
      id: 1547,
      slug: "minimum-cost-to-cut-a-stick",
      title: "砍一根棍子的最低成本",
    },
  },
  exchange_swap_sort: {
    lc: { id: 179, slug: "largest-number", title: "最大數量" },
  },
  dp_state_machine: {
    lc: {
      id: 714,
      slug: "best-time-to-buy-and-sell-stock-with-transaction-fee",
      title: "買賣股票並收取交易費的最佳時機",
    },
  },
  game_interval_dp: {
    lc: { id: 486, slug: "predict-the-winner", title: "預測獲勝者" },
  },
  two_pointers_opposite: {
    lc: {
      id: 167,
      slug: "two-sum-ii-input-array-is-sorted",
      title: "兩數之和 II - 輸入數組已排序",
    },
  },
  three_sum: { lc: { id: 15, slug: "3sum", title: "3Sum" } },
  backtrack_permute: {
    lc: { id: 46, slug: "permutations", title: "Permutations" },
  },
  backtrack_subsets: { lc: { id: 78, slug: "subsets", title: "Subsets" } },
  backtrack_combination_sum: {
    lc: { id: 39, slug: "combination-sum", title: "組合總和" },
  },
  hashmap_two_sum: { lc: { id: 1, slug: "two-sum", title: "兩和" } },
  prefix_count_hashmap: {
    lc: {
      id: 560,
      slug: "subarray-sum-equals-k",
      title: "子數組和等於 K",
    },
  },
  tree_dfs: {
    lc: {
      id: 543,
      slug: "diameter-of-binary-tree",
      title: "二叉樹的直徑",
    },
  },
  tree_bfs_levels: {
    lc: {
      id: 102,
      slug: "binary-tree-level-order-traversal",
      title: "二元樹層次順序遍歷",
    },
  },
  grid_dfs: {
    lc: { id: 200, slug: "number-of-islands", title: "島嶼數量" },
  },
  multi_source_bfs: {
    lc: { id: 994, slug: "rotting-oranges", title: "腐爛的橙子" },
  },
  topo_kahn: {
    lc: { id: 210, slug: "course-schedule-ii", title: "課程安排二" },
  },
  topo_dfs: {
    lc: { id: 207, slug: "course-schedule", title: "課程安排" },
  },
  merge_intervals: {
    lc: { id: 56, slug: "merge-intervals", title: "合併間隔" },
  },
  kmp: {
    lc: {
      id: 28,
      slug: "find-the-index-of-the-first-occurrence-in-a-string",
      title: "尋找字串中第一次出現的索引",
    },
  },
  trie_pointer: {
    lc: {
      id: 208,
      slug: "implement-trie-prefix-tree",
      title: "實作 Trie（前綴樹）",
    },
  },
  trie_xor: {
    lc: {
      id: 421,
      slug: "maximum-xor-of-two-numbers-in-an-array",
      title: "數組中兩個數字的最大異或",
    },
  },
  two_heap_median: {
    lc: {
      id: 295,
      slug: "find-median-from-data-stream",
      title: "從資料流中尋找中值",
    },
  },
  merge_k_heap: {
    lc: { id: 23, slug: "merge-k-sorted-lists", title: "合併 k 個排序列表" },
  },
  sieve: { lc: { id: 204, slug: "count-primes", title: "計算素數" } },
  quickselect: {
    lc: {
      id: 215,
      slug: "kth-largest-element-in-an-array",
      title: "數組中第 K 個最大元素",
    },
  },
  greedy_builder: {
    pattern:
      "貪心字典式構造：在每個位置嘗試最小的候選，只有在可行性檢查證明剩餘位置仍然可以完成有效答案時才接受它。",
  },
  constraint_scan: {
    pattern:
      "透過滑動左邊緣僅向前移動的視窗（「最多」計數技巧）來計算運行附加成本保持在限制範圍內的子數組。",
  },
  loop_invariant_binary_search: {
    pattern:
      "lower_bound 習慣用語：在 [low, high) 上進行半開二分搜索，返回單調謂詞變成 true 的第一個索引。",
  },
  enumerate_middle: {
    pattern:
      "透過固定中間元素並使用兩棵 Fenwick 樹「向左較小」和「向右較大」來計算增加的三元組（LeetCode 2179 / 2552 背後的技術）。",
  },
  subset_enumeration: {
    pattern:
      "子掩碼總和 DP：對於每個掩碼，透過 `submask = (submask - 1) & mask` (O(3^n)) 迭代其子掩碼，以將所選子掩碼與其補碼組合。",
  },
  pair_contribution: {
    pattern:
      "排序後對所有對的數量求和：每個元素的貢獻是 `i * nums[i] - prefixSum`（LeetCode 1685 背後的排序對技巧）。",
  },
  prefix_contribution: {
    pattern:
      "前綴最大/後綴最小分割掃描：從左側預先計算運行最大值，從右側預先計算運行最小值，然後評估 O(1) 中的每個分割點（例如 LeetCode 915）。",
  },
  at_most_k_distinct: {
    pattern:
      "滑動視窗助手對最多具有 k 個不同值的子數組進行計數；減去兩個這樣的計數得到正好-k（例如 LeetCode 340 / 992）。",
  },
  prefix_suffix_counts: {
    pattern:
      "透過固定中間索引並乘以匹配的前綴和後綴字元計數來計算 x..x 模式（LeetCode 1930 背後的技術）。",
  },
  difference_array: {
    pattern:
      "差異數組：將許多範圍加更新套用為 l 處的 +d 和 r+1 處的 -d，然後採用前綴和來具體化最終數組（例如 LeetCode 1109）。",
  },
  monotonic_stack: {
    pattern:
      "使用遞減單調堆疊尋找每個位置的下一個更大元素（LeetCode 496 / 503 / 739 的基礎）。",
  },
  interval_cover_greedy: {
    pattern:
      "覆蓋[0，目標]的最小間隔：重複跳到目前覆蓋範圍內可到達的最右端（例如 LeetCode 1024 / 45）。",
  },
  mst_kruskal: {
    pattern:
      "Kruskal 的 MST：按權重對邊進行排序，並透過 union-find 添加連接兩個組件的每個邊（剪切屬性；例如 LeetCode 1584 / 1135）。",
  },
  offline_fenwick: {
    pattern:
      "離線範圍計數查詢：按閾值對值和查詢進行排序，隨著閾值的增長將值插入 Fenwick 樹，將每個值作為前綴範圍進行回答。",
  },
  sweep_events: {
    pattern:
      "針對峰值並發的事件排序掃描：在間隔結束時發出 +1/-1 事件，按座標排序，並追蹤運行最大值（例如 LeetCode 253）。",
  },
  sweep_compressed_fenwick: {
    pattern:
      "座標壓縮掃描：將每個間隔轉換為壓縮座標上 Fenwick 樹上的 +1/-1 範圍新增事件，然後讀取查詢點處的覆蓋範圍。",
  },
  coordinate_compress: {
    pattern:
      "座標壓縮：透過 sort + unique + lower_bound 將任意值對應到密集等級 0..m-1，以便它們可以索引計數陣列或 Fenwick 樹。",
  },
  mst_prim: {
    pattern:
      "Prim 的 MST：從種子節點開始生長樹，從最小堆拉出穿過切割的最輕邊（來自節點側的切割屬性；例如 LeetCode 1584）。",
  },
  dp_knapsack: {
    pattern:
      "0/1背包：每種物品最多使用一次；向下迭代容量可確保每個項目僅更新每個容量狀態一次（例如 LeetCode 416 / 474）。",
  },
  game_nim_xor: {
    pattern:
      "多樁 Nim 獲勝者測試：如果所有樁大小的異或非零，則移動的玩家獲勝（Sprague-Grundy 應用於 Nim）。",
  },
  game_grundy: {
    pattern:
      "Sprague-Grundy 值：g(state) = mex 可達狀態的 Grundy 值（已記憶）；異或獨立組件來決定總冠軍。",
  },
  game_pn_table: {
    pattern:
      "小型單堆外送遊戲（Bash / Divisor 遊戲）的 P/N 位置表：如果某個動作達到失敗 (P) 狀態，則狀態為獲勝。",
  },
  z_function: {
    pattern:
      "Z 函數：z[i] 是從 i 開始匹配字串前綴的最長子字串的長度，透過滾動 Z 盒在 O(n) 中建構。",
  },
  union_find: {
    pattern:
      "具有路徑壓縮的不相交集合並集 + 按等級並集：增量並集下的近 O(alpha(n)) 連接性和組件計數（例如 LeetCode 547 / 684）。",
  },
  segment_tree_lazy: {
    pattern:
      "具有範圍添加 + 範圍和的延遲傳播的線段樹；惰性標籤推遲對子節點的更新，直到節點被拆分（將 LeetCode 307 概括為範圍更新）。",
  },
  fast_pow: {
    pattern:
      "二進制求冪：透過對底數平方並乘以指數的每個設定位，在 O(log exp) 中計算底數^exp (mod m)。",
  },
  fenwick_basic: {
    pattern:
      "Fenwick（二進位索引）樹：使用低位元跳轉在 O(log n) 中進行點更新和前綴/範圍總和（例如 LeetCode 307）。",
  },
  merge_sort_count: {
    pattern:
      "合併排序時計算反轉：當取得右半部元素時，所有剩餘的左半部元素與其形成反轉（LeetCode 315 / 493 的基礎）。",
  },
  dijkstra_lazy: {
    lc: { id: 743, slug: "network-delay-time", title: "網路延遲時間" },
  },
  zero_one_bfs: {
    lc: {
      id: 1368,
      slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
      title: "在網格中建立至少一條有效路徑的最低成本",
    },
  },
  bellman_ford_k_edges: {
    lc: {
      id: 787,
      slug: "cheapest-flights-within-k-stops",
      title: "K 站內最便宜的航班",
    },
  },
  fast_slow_cycle: {
    lc: {
      id: 142,
      slug: "linked-list-cycle-ii",
      title: "鍊錶循環II",
    },
  },
  reverse_linked_list: {
    lc: { id: 206, slug: "reverse-linked-list", title: "反向鍊錶" },
  },
  merge_sorted_lists: {
    lc: {
      id: 21,
      slug: "merge-two-sorted-lists",
      title: "合併兩個排序列表",
    },
  },
  lru_cache: {
    lc: { id: 146, slug: "lru-cache", title: "LRU 快取" },
  },
  insert_delete_getrandom: {
    lc: {
      id: 380,
      slug: "insert-delete-getrandom-o1",
      title: "插入 刪除 GetRandom O(1)",
    },
  },
  min_stack: {
    lc: { id: 155, slug: "min-stack", title: "最小堆疊" },
  },
};

/**
 * The single, unified collapsible primitive for the whole handbook. Every
 * collapsible block (templates, variants, checklist, related topics, proof
 * sketch, taxonomy worked examples) is emitted through this helper so the
 * markup, styling, and behavior are identical everywhere. It renders as a
 * native `<details>` which {@link StudyPlanMarkdownContent} restyles into the
 * shared card with a rotating chevron. Pass `open` to expand by default.
 *
 * IMPORTANT: section 10 (LeetCode Problems) must never be routed through this
 * helper — that constraint is enforced by {@link assertSectionsAreValid}.
 */
function collapsible(summary: string, body: string, open = false): string {
  return [
    `<details${open ? " open" : ""}>`,
    `<summary>${summary}</summary>`,
    "",
    body,
    "",
    "</details>",
  ].join("\n");
}

/** A worked example for the Enumeration Viewpoint Taxonomy (section 4 appendix). */
function taxonomyExample(title: string, prose: string, code: string): string {
  return collapsible(
    `Worked Example — ${title}`,
    `${prose}\n\n\`\`\`cpp\n${code}\n\`\`\``,
  );
}

/** One curated practice problem for an enumeration viewpoint. */
interface TaxonomyPracticeProblem {
  id: number;
  title: string;
  slug: string;
  /** Zerotrac rating; omit when unknown — ProblemList backfills it from problem data. */
  rating?: number;
  tier: "Core" | "Advanced" | "Challenge";
}

/**
 * Practice problems for the Enumeration Viewpoint Taxonomy, grouped by the
 * viewpoint they train. Each group is emitted as a `| ID | Problem | Rating |
 * Tier |` table (see {@link taxonomyPracticeTable}) so HandbookSectionBody
 * upgrades it into an interactive ProblemList — one table per viewpoint, with
 * progress tracking, EN/CN links, rating pills, and the tier as a chip.
 */
const ENUMERATION_TAXONOMY_PRACTICE: {
  viewpoint: string;
  problems: TaxonomyPracticeProblem[];
}[] = [
  {
    viewpoint: "枚舉所有者/貢獻者",
    problems: [
      {
        id: 828,
        title: "計算給定字串的所有子字串的唯一字符",
        slug: "count-unique-characters-of-all-substrings-of-a-given-string",
        rating: 2034,
        tier: "Advanced",
      },
      {
        id: 1856,
        title: "最大子數組最小積",
        slug: "maximum-subarray-min-product",
        rating: 2051,
        tier: "Advanced",
      },
      {
        id: 2818,
        title: "應用運算來最大化分數",
        slug: "apply-operations-to-maximize-score",
        rating: 2397,
        tier: "Challenge",
      },
      {
        id: 2281,
        title: "巫師總實力總和",
        slug: "sum-of-total-strength-of-wizards",
        rating: 2621,
        tier: "Challenge",
      },
    ],
  },
  {
    viewpoint: "列舉正確的端點",
    problems: [
      {
        id: 713,
        title: "小於 K 的子數組積",
        slug: "subarray-product-less-than-k",
        tier: "Core",
      },
      {
        id: 2799,
        title: "計算數組中完整子數組的數量",
        slug: "count-complete-subarrays-in-an-array",
        rating: 1398,
        tier: "Core",
      },
      {
        id: 3325,
        title: "計算 K 頻字元的子字串 I",
        slug: "count-substrings-with-k-frequency-characters-i",
        rating: 1455,
        tier: "Core",
      },
      {
        id: 1248,
        title: "計算好子數組的數量",
        slug: "count-number-of-nice-subarrays",
        rating: 1624,
        tier: "Core",
      },
      {
        id: 1358,
        title: "包含所有三個字元的子字串的數量",
        slug: "number-of-substrings-containing-all-three-characters",
        rating: 1646,
        tier: "Core",
      },
      {
        id: 2762,
        title: "連續子數組",
        slug: "continuous-subarrays",
        rating: 1940,
        tier: "Core",
      },
      {
        id: 992,
        title: "具有 K 個不同整數的子數組",
        slug: "subarrays-with-k-different-integers",
        rating: 2210,
        tier: "Advanced",
      },
    ],
  },
  {
    viewpoint: "枚舉樞軸/中間",
    problems: [
      {
        id: 1534,
        title: "數好三胞胎",
        slug: "count-good-triplets",
        rating: 1279,
        tier: "Core",
      },
      {
        id: 1685,
        title: "排序數組中的絕對差之和",
        slug: "sum-of-absolute-differences-in-a-sorted-array",
        rating: 1496,
        tier: "Core",
      },
      {
        id: 2222,
        title: "選擇建築物的方式數量",
        slug: "number-of-ways-to-select-buildings",
        rating: 1657,
        tier: "Core",
      },
      {
        id: 2179,
        title: "計算數組中好的三元組數",
        slug: "count-good-triplets-in-an-array",
        rating: 2272,
        tier: "Advanced",
      },
      {
        id: 2552,
        title: "計數增加的四聯體",
        slug: "count-increasing-quadruplets",
        rating: 2433,
        tier: "Challenge",
      },
    ],
  },
  {
    viewpoint: "列舉繳費單位",
    problems: [
      {
        id: 1814,
        title: "計算數組中的好對",
        slug: "count-nice-pairs-in-an-array",
        rating: 1738,
        tier: "Core",
      },
      {
        id: 2615,
        title: "距離總和",
        slug: "sum-of-distances",
        rating: 1793,
        tier: "Core",
      },
      {
        id: 2681,
        title: "英雄的力量",
        slug: "power-of-heroes",
        rating: 2060,
        tier: "Advanced",
      },
      {
        id: 891,
        title: "子序列寬度之和",
        slug: "sum-of-subsequence-widths",
        rating: 2183,
        tier: "Advanced",
      },
      {
        id: 2916,
        title: "子數組不同元素平方和 II",
        slug: "subarrays-distinct-element-sum-of-squares-ii",
        rating: 2816,
        tier: "Challenge",
      },
    ],
  },
  {
    viewpoint: "Enumerate the value domain (差值、餘數、GCD)",
    problems: [
      {
        id: 523,
        title: "連續子數組和",
        slug: "continuous-subarray-sum",
        tier: "Core",
      },
      {
        id: 2748,
        title: "美麗對的數量",
        slug: "number-of-beautiful-pairs",
        rating: 1301,
        tier: "Core",
      },
      {
        id: 2470,
        title: "LCM 等於 K 的子陣列數量",
        slug: "number-of-subarrays-with-lcm-equal-to-k",
        rating: 1560,
        tier: "Core",
      },
      {
        id: 2447,
        title: "GCD 等於 K 的子數組數量",
        slug: "number-of-subarrays-with-gcd-equal-to-k",
        rating: 1603,
        tier: "Core",
      },
      {
        id: 974,
        title: "子數組和可被 K 整除",
        slug: "subarray-sums-divisible-by-k",
        rating: 1676,
        tier: "Core",
      },
      {
        id: 2183,
        title: "計算可被 K 整除的數組對",
        slug: "count-array-pairs-divisible-by-k",
        rating: 2246,
        tier: "Advanced",
      },
      {
        id: 952,
        title: "以公因數計算的最大組件尺寸",
        slug: "largest-component-size-by-common-factor",
        rating: 2272,
        tier: "Advanced",
      },
    ],
  },
  {
    viewpoint: "枚舉切點（二切/三段）",
    problems: [
      {
        id: 410,
        title: "分割數組最大和",
        slug: "split-array-largest-sum",
        tier: "Core",
      },
      {
        id: 915,
        title: "將陣列分成不相交的區間",
        slug: "partition-array-into-disjoint-intervals",
        rating: 1501,
        tier: "Core",
      },
      {
        id: 1031,
        title: "兩個不重疊子數組的最大和",
        slug: "maximum-sum-of-two-non-overlapping-subarrays",
        rating: 1680,
        tier: "Core",
      },
      {
        id: 1043,
        title: "劃分數組以獲得最大和",
        slug: "partition-array-for-maximum-sum",
        rating: 1916,
        tier: "Core",
      },
      {
        id: 813,
        title: "最大平均值之和",
        slug: "largest-sum-of-averages",
        rating: 1937,
        tier: "Core",
      },
    ],
  },
  {
    viewpoint: "枚舉較小的一邊（從小到大合併）",
    problems: [
      {
        id: 2421,
        title: "良好路徑數",
        slug: "number-of-good-paths",
        rating: 2445,
        tier: "Challenge",
      },
    ],
  },
  {
    viewpoint: "逐位列舉（從高位開始貪心）",
    problems: [
      {
        id: 2429,
        title: "最小化異或",
        slug: "minimize-xor",
        rating: 1532,
        tier: "Core",
      },
      {
        id: 2935,
        title: "最大強對 XOR II",
        slug: "maximum-strong-pair-xor-ii",
        rating: 2349,
        tier: "Challenge",
      },
      {
        id: 1707,
        title: "與數組中的元素進行最大異或",
        slug: "maximum-xor-with-an-element-from-array",
        rating: 2359,
        tier: "Challenge",
      },
    ],
  },
  {
    viewpoint: "枚舉觸發器/事件（事件驅動）",
    problems: [
      {
        id: 731,
        title: "我的日曆二",
        slug: "my-calendar-ii",
        tier: "Core",
      },
      {
        id: 1094,
        title: "共乘",
        slug: "car-pooling",
        rating: 1441,
        tier: "Core",
      },
      {
        id: 759,
        title: "員工空閒時間",
        slug: "employee-free-time",
        rating: 1710,
        tier: "Core",
      },
      {
        id: 2402,
        title: "會議室三",
        slug: "meeting-rooms-iii",
        rating: 2093,
        tier: "Advanced",
      },
      {
        id: 1851,
        title: "包含每個查詢的最小間隔",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        tier: "Advanced",
      },
    ],
  },
];

/**
 * Render one viewpoint's problems as a `| ID | Problem | Rating | Tier |`
 * markdown table with a bold caption. The caption becomes the ProblemList
 * title; the Tier column becomes a chip under each problem.
 */
function taxonomyPracticeTable(group: {
  viewpoint: string;
  problems: TaxonomyPracticeProblem[];
}): string {
  const rows = group.problems.map(
    (p) =>
      `| ${p.id} | [${p.title}](https://leetcode.cn/problems/${p.slug}/) | ${p.rating ?? ""} | ${p.tier} |`,
  );
  return [
    `**${group.viewpoint}**`,
    "",
    "| ID | 問題 | 等級 | 等級 |",
    "|---:|---|---:|---|",
    ...rows,
  ].join("\n");
}

/**
 * TASK 6 — Enumeration Viewpoint Taxonomy. A reference table plus one collapsed
 * worked example per newly-added viewpoint. Appended to section 4 (Core Idea) of
 * the Enumeration Strategy topic. All representative problems are real LeetCode
 * problems; the worked-example snippets are C++17 and compile under `-std=c++17`.
 */
const ENUMERATION_TAXONOMY: string = [
  "### 列舉觀點分類法",
  "",
  "選擇*視點*（您迭代的物件）通常比資料結構更重要。同樣的問題可能很容易解決，也可能毫無希望，這取決於您解決的問題和您改變的問題。表中列出了常見的觀點、每個觀點所依賴的不變量以及一個代表性問題。 **粗體**中的五個觀點透過下面的工作範例進行了擴展。",
  "",
  "| 觀點 | 你所列舉的 | 保持不變 | 代表性問題 |",
  "|---|---|---|---|",
  "| 枚舉所有者/貢獻者 | 每個元素作為子數組的“負責” | 每個子數組由一個所有者計算 | 907. 子數組最小值之和 |",
  "| 列舉正確的端點 | 固定右端，計算有效左端 | 視窗/狀態對目前右端有效 | 2302. 計算分數小於 K 的子數組 |",
  "| 枚舉樞軸/中間 | 固定中心元素 | 左側和右側計數是獨立的 | 1395. 計算隊伍數量 |",
  "| 列舉繳費單位 | 每對/三元組的附加價值 | 單位之和等於整體之和 | 2104. 子數組範圍之和 |",
  "| **Enumerate the value domain** (差值、餘數、GCD) | each candidate value, remainder, or gcd | the answer reduces to one cheap check per value | 1819. Number of Different Subsequence GCDs |",
  "| **枚舉切點**（二切/三段） | 每個分割位置 | prefix-left 和 suffix-right 獨立計算 | 689. 3 個不重疊子數組的最大和 |",
  "| **列舉較小的一面**（從小到大合併） | 合併時始終迭代較小的集合 | 總工作量保持為 O(n log n)，因為每個元素移動 O(log n) 次 | 2003. 每個子樹中最小缺失遺傳值 |",
  "| **逐位列舉**（從高位開始貪心） | 每位從高到低 | 已固定位的前綴是最佳的 | 421. 陣列中兩個數的最大值 XOR |",
  "| **枚舉觸發器/事件**（事件驅動） | 每一刻狀態都會改變 | 事件按時間順序處理並回應一次 | 1834. 單線程CPU |",
  "",
  "####練習題",
  "",
  "每個觀點都有自己的問題表 - 追蹤進度並內聯開啟解決方案。",
  "",
  ENUMERATION_TAXONOMY_PRACTICE.map(taxonomyPracticeTable).join("\n\n"),
  "",
  taxonomyExample(
    "枚舉值域（GCD）",
    "對於**1819。不同子序列 GCD 的數量** 值是有界的 (~2·10⁵)，但子序列的數量是指數級的。翻轉觀點：不再列舉子序列，而是列舉每個候選 gcd `g`。某些子序列的 gcd 恰好是 `g`，當且僅當 `g` 的當前倍數一起減少到 `g`。對每個`g`掃描倍數`g, 2g, 3g, …`就是調和級數，所以整個搜尋是`O(maxVal log maxVal)`。",
    "// 列舉GCD值，然後用它的倍數進行驗證\nint countDifferentGcds(向量<int>& nums, int maxVal) {\n  向量<bool>存在(maxVal + 1, false);\n  for (int x : nums) Present[x] = true;\n  整數答案=0；\n  for (int g = 1; g <= maxVal; ++g) {\n    整數當前= 0；\n    for (int multiple = g; multiple <= maxVal; multiple += g) {\n      if (目前[多]) current = gcd(當前, 多);\n      if (目前 == g) { ++answer;休息; }\n    }\n  }\n  返回答案；\n}",
  ),
  "",
  taxonomyExample(
    "枚舉切點（三段）",
    "當答案將陣列分割成獨立的部分時，枚舉**邊界**，而不是部分。對於兩個不重疊的部分，您可以修復一次剪切，並將左側結束的最佳子數組與右側開始的最佳子數組組合起來；兩邊都是在線性時間內預先計算的。同樣的想法延伸到**689。具有兩個分割點的 3 個非重疊子數組**的最大和。",
    "// 枚舉cut：左邊最好的子數組+右邊最好的子數組\nint maxTwoNonOverlap(向量<int>& a) {\n  int n = a.size();\n  向量<int> leftBest(n), rightBest(n);\n  int 運行 = 0;\n  for (int i = 0; i < n; ++i) {\n    運行 = max(a[i], 運行 + a[i]);\n    左最佳[i] = i ? max(leftBest[i - 1], run) : 運行；\n  }\n  運行=0；\n  for (int i = n - 1; i >= 0; --i) {\n    運行 = max(a[i], 運行 + a[i]);\n    rightBest[i] = i + 1 < n ? max(rightBest[i + 1], 運行) : 運行;\n  }\n  int 答案 = INT_MIN；\n  for (int cut = 0; cut + 1 < n; ++cut)\n    答案 = max(答案, leftBest[cut] + rightBest[cut + 1]);\n  返回答案；\n}",
  ),
  "",
  taxonomyExample(
    "枚舉較小的一側（從小到大）",
    "當您重複合併集合時（例如 **2003 年中的子樹多重集合。每個子樹中最小的缺失遺傳值**），請始終將*較小的*集合迭代到較大的集合中。只有當每個元素所在的集合至少加倍時才會複製每個元素，因此它會被複製 `O(log n)` 次，並且總合併成本為 `O(n log n)`，即使簡單的合併看起來是二次的。",
    "//從小到大：總是將較小的集合合併到較大的集合中\nvoid mergeInto(unordered_set<int>&large, unordered_set<int>&small) {\n  if (大.size() < 小.size()) 交換(大, 小);\n  for (int x : 小) large.insert(x);\n  小.clear();\n}",
  ),
  "",
  taxonomyExample(
    "逐位列舉（高位貪心）",
    "對於 XOR 最大化（**421。數組中兩個數字的最大 XOR**）從最高有效位元向下枚舉位元。貪婪地假設答案的下一位可以是 1，然後使用已經固定的前綴檢查兩個數字是否可以實現它。一旦某個位元被鎖定，就永遠不會被重新訪問，因為較高位元總是支配所有較低位元。",
    "// 從高到低枚舉位，如果可以實現則貪婪地打開每個位\nint findMaximumXOR(向量<int>& nums) {\n  int 答案 = 0，遮罩 = 0；\n  for (int 位元 = 31; 位元 >= 0; --位元) {\n    掩碼 |= (1 << 位元);\n    unordered_set<int> 前綴；\n    for (int x : nums) prefixes.insert(x & mask);\n    int 候選 = 答案 | (1 << 位);\n    for (int 字首: 字首) {\n      if (prefixes.count(候選^前綴)) {\n        答案=候選人；\n        休息;\n      }\n    }\n  }\n  返回答案；\n}",
  ),
  "",
  taxonomyExample(
    "枚舉觸發器/事件",
    "與掃描線（預先對*所有*座標進行排序）不同，事件列舉僅將時間提前到下一刻某些東西變得可用並做出反應一次。 **1834年。單執行緒 CPU** 您可以按就緒時間對任務進行排序，在空閒時將時鐘跳到下一個就緒任務，並始終從堆中運行最便宜的當前可用任務。",
    "// 按時間順序列舉事件；堆疊目前可用的選擇\nintfirstAvailableWinner(向量<int>&準備好，向量<int>&成本){\n  int n = 準備好.size();\n  向量<int>階(n);\n  iota(order.begin(), order.end(), 0);\n  排序（訂單.開始（），訂單.結束（），\n       [&](int a, int b) { return 就緒[a] < 就緒[b]; });\n  priority_queue<pair<int, int>、向量<pair<int, int>>、greater<>>可用；\n  很長一段時間=0；\n  int i = 0, 完成 = -1;\n  while (done < 0 && (i < n || !available.empty())) {\n    if (available.empty() && i < n) {\n      時間 = max<long long>(時間, 準備好[訂單[i]]);\n    }\n    while (i < n && 準備好[訂單[i]] <= 時間) {\n      available.push({cost[order[i]], order[i]});\n      ++我；\n    }\n    auto [c, idx] = available.top();\n    可用.pop();\n    時間+=c；\n    完成=idx；\n  }\n  返回完成；\n}",
  ),
].join("\n");

/**
 * TASK 7 — Game Theory layered deep dive. Appended to section 4 (Core Idea) of
 * the Game Theory topic: the Nim XOR correctness walkthrough, a Sprague-Grundy
 * worked example, and the interval-DP worked examples (Predict the Winner, Stone
 * Game VII). All collapsible blocks use the unified `collapsible()` primitive.
 */
const GAME_THEORY_DEEP_DIVE: string = [
  "### 分層深入研究",
  "",
  "**第 1 層 — 組合遊戲基礎。 ** *公正*遊戲是指兩個玩家在任何位置都可以採取相同的動作（Nim，不是國際象棋）。根據“正常比賽慣例”，無法移動的玩家就輸了。將每個位置分類為**P-位置**（前一個玩家獲勝→移動的玩家失敗）或**N-位置**（下一個移動的玩家獲勝）。產生整個表格的規則：如果「某些」移動導致 P 位置，則位置為 N；如果*每*一步都導致 N 位置，則為 P；終端位置為 P。",
  "",
  "| 狀態（一堆，取 1-3 個） | 移至 | 班級 |",
  "|---:|---|:--|",
  "| 0 | - （終端） | 磷 |",
  "| 1 | 0（P） | 氮 |",
  "| 2 | 0,1 | 氮 |",
  "| 3 | 0,1,2 | 氮 |",
  "| 4 | 1,2,3（全N） | 磷 |",
  "| 5 | 4（頁） | 氮 |",
  "",
  "Bash 遊戲（從一堆中取出 1..k）的周期為 `k + 1`：位置 `s` 是 P 位置 iff `s % (k + 1) == 0`。上面，`k = 3` 給了 4 倍數的 P 位。",
  "",
  collapsible(
    "工作範例 - 為什麼 XOR 決定 Nim",
    [
      "主張：對於幾堆，該位置是一個 P 位置（玩家移動的損失）**當且僅當**所有堆大小的 XOR 都為 0。三個事實證明了這一點：",
      "",
      "1、**終點站。 **全堆空→XOR `= 0`，為P位。 ✔",
      "2. **從XOR ≠ 0 可以得到XOR = 0。 ** 令`x = a₁ ⊕ … ⊕ aₖ ≠ 0` 並令`b` 為其最高置位。一些 `aᵢ` 已設定該位。然後`aᵢ ⊕ x < aᵢ`（高位關閉），這樣就可以合法地將堆`i`縮小為`aᵢ ⊕ x`；新的XOR是`x ⊕ aᵢ ⊕ (aᵢ ⊕ x) = 0`。因此，每個 N 位置都會移動到 P 位置。",
      "3. **從 XOR = 0 開始，每一步都會給 XOR ≠ 0。 ** 將一堆從 `aᵢ` 更改為 `aᵢ' ≠ aᵢ` 會將 XOR 更改為 `aᵢ ⊕ aᵢ' ≠ 0`，因此零 XOR 不能保持為零。每次離開 P 位置都會到達 N 位置。",
      "",
      "總而言之：零 XOR 位置正是您只能給對手帶來獲勝位置的位置 - 它們是損失。例：樁`[3, 4, 5]`有XOR `3 ⊕ 4 ⊕ 5 = 2 ≠ 0`，所以第一個玩家獲勝；獲勝的棋步將堆 `5` 縮小到 `5 ⊕ 2 = 7`？否 - `7 > 5` 是非法的，因此選擇高位（值 2）已設定的堆：堆 `3 → 3 ⊕ 2 = 1`，將 `[1, 4, 5]` 與 XOR `0` 分開。",
    ].join("\n"),
  ),
  "",
  "**第 2 層 — Sprague-Grundy。 ** 任何公正的遊戲位置都有一個 **Grundy 值** `g(s) = mex{g(t) : s → t}`，其中 `mex` 是不在集合中的最小非負整數。一個位置是 P 位置當且僅當其 G​​rundy 值為 0（因此單樁 Nim 有 `g(s) = s`）。 Sprague-Grundy 定理表示，獨立遊戲的「總和」的 Grundy 值是其 Grundy 值的 **XOR**——直觀地說，因為每個組件的行為都與大小為 `g` 的 Nim 堆完全相同，而 Nim 添加了 XOR。",
  "",
  collapsible(
    "工作範例－Grundy 對小遊戲的評價",
    [
      "遊戲：整數`s ≥ 0`上的單一計數器；一步減 1 或 2；達到 0 且無法移動失敗（正常遊戲）。使用 `mex` 自下而上計算 Grundy 值：",
      "",
      "| s | 可達到的 g 值 | g(s) = 墨西哥 |",
      "|---:|---|---:|",
      "| 0 | {} | 0 |",
      "| 1 | {g(0)=0} | 1 |",
      "| 2 | {g(0)=0, g(1)=1} | 2 |",
      "| 3 | {g(1)=1, g(2)=2} | 0 |",
      "| 4 | {g(2)=2, g(3)=0} | 1 |",
      "",
      "圖案是 `g(s) = s % 3`，因此 P 位置 (g = 0) 是 3 的倍數。對於 `s = 4` 和 `s = 5`、XOR 處的兩個獨立的此類計數器，Grundy 值：`g(4) ⊕ g(5) = 1 ⊕ 2 = 3 ≠ 0`，因此移動的玩家獲勝。使用 `Grundy Value via Memoized DFS` 模板計算任意移動集的 `g`。",
    ].join("\n"),
  ),
  "",
  "**第 3 層 — DP 賽局理論。 ** 當遊戲依序進行且分數累積時，不存在 Grundy 捷徑；相反，定義 `dp[i][j]` = 在子數組 `[i, j]` 上可實現的最佳*得分差*（當前玩家減去對手）。當前玩家選擇一個結束，然後「繼承對手對剩餘的最佳差異的否定」。",
  "",
  collapsible(
    "工作範例 - 預測獲勝者 (LC 486)",
    [
      "`dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1])`。取`nums = [1, 5, 233, 7]`。",
      "",
      "底面：`dp[i][i] = nums[i]` → `dp = [1, 5, 233, 7]` 在對角線上。",
      "",
      "長度2：`dp[0][1] = max(1 - 5, 5 - 1) = 4`；`dp[1][2] = max(5 - 233, 233 - 5) = 228`；`dp[2][3] = max(233 - 7, 7 - 233) = 226`。",
      "",
      "長度3：`dp[0][2] = max(1 - 228, 233 - 4) = 229`；`dp[1][3] = max(5 - 226, 7 - 228) = -221`。",
      "",
      "長度4：`dp[0][3] = max(1 - dp[1][3], 7 - dp[0][2]) = max(1 - (-221), 7 - 229) = 222`。",
      "",
      "`dp[0][3] = 222 ≥ 0`，所以玩家 1 獲勝。這正是 `Interval DP Two-Player Game` 模板。",
    ].join("\n"),
  ),
  "",
  collapsible(
    "工作範例 - Stone Game VII (LC 1690)",
    [
      "移除一顆石頭的得分是剩餘**石頭的**總和，因此前綴總和給出了每次移動的 O(1) 增益。對於 `range(i, j) = prefix[j + 1] - prefix[i]`：",
      "",
      "`dp[i][j] = max(range(i + 1, j) - dp[i + 1][j], range(i, j - 1) - dp[i][j - 1])`，底座`dp[i][i] = 0`。",
      "",
      "每個玩家都最大化自己的跑動差異；答案是`dp[0][n - 1]`。",
      "",
      "````cpp",
      "// 石頭遊戲 VII — 分數差的區間 DP",
      "int StoneGameVII(向量<int>& 石頭) {",
      "int n =stones.size();",
      "向量 <int> 前綴(n + 1, 0);",
      "for (int i = 0; i < n; ++i) 字首[i + 1] = 字首[i] + 石頭[i];",
      "向量<向量<int>> dp(n, 向量<int>(n, 0));",
      "for (int len = 2; len <= n; ++len)",
      "for (int i = 0; i + len - 1 < n; ++i) {",
      "int j = i + len - 1；",
      "int takeLeft = (前綴[j + 1] - 前綴[i + 1]) - dp[i + 1][j];",
      "int takeRight = (前綴[j] - 前綴[i]) - dp[i][j - 1];",
      "dp[i][j] = max(takeLeft, takeRight);",
      "    }",
      "返回 dp[0][n - 1]；",
      "}",
      "```",
    ].join("\n"),
  ),
].join("\n");

const TOPIC_DEFINITIONS: PatternTopicDefinition[] = [
  {
    slug: "constraint-driven-thinking",
    title: "約束驅動的思維",
    group: "Problem-Solving Mindset",
    icon: "Gauge",
    tagline: "在選擇模式之前，根據 n、q、值範圍和操作計數推斷可行的演算法。",
    concept: [
      "將約束視為在選擇路線之前發布的速度限制。允許大約10^8個簡單操作的判斷就是速度限制； `n`、`q` 和值範圍告訴您必須行駛多遠。在寫一行之前，你要檢查你想要的路線——暴力、排序、一扇窗戶、一棵樹——是否可以在沒有票的情況下走完這段距離（超過時間限制）。",
      "約束驅動的思維是將輸入限制轉換為演算法預算的習慣，因此您可以在紙上拒絕注定失敗的方法，而不是在提交失敗後拒絕。",
      "一個有用的經驗法則：`n ≤ 20` 暗示指數 `O(2^{n})`，`O(n^{3})` 暗示 `n ≤ 500`，`O(n^{2})` 暗示 `n ≤ 5000`，`O(n log n)` 暗示 `n ≤ 10^5`，`n ≥ 10^6` 暗示 `O(n)`。",
      "目標是在編碼之前縮小候選技術集，而不是找到最聰明的技術。",
    ],
    motivation: [
      "先寫出字面暴力法，然後統計它的操作次數。範例：`nums` 具有 `n = 10^5` 元素，並且您想要總和 ≥ `target` 的最短子數組。簡單的解決方案嘗試每一對 `(left, right)` 並重新計算切片的總和：大約 `n^2/2 = 5·10^9` 添加 - 大約超出預算 50 倍。",
      "現在找到重複的工作：每個新的 `right` 都會重新計算一個與前一個幾乎完全重疊的總和。這種重疊就是浪費訊號。",
      "以維護狀態取代重新計算——新增 `nums[right]` 並刪除 `nums[left]` 的運行視窗總和——將 `O(n^2)` 變成 `O(n)`。所有權規則（每個`right`尋找其最好的`left`）不變；只是總和的取得方式改變了。",
      "當 `n` 很小但狀態重複時（例如 `n ≤ 18`），請執行相反的操作：保留指數搜索，但將重複狀態壓縮到位遮罩中，以便指數因子超過狀態，而不是超過原始選擇。",
    ],
    whenUse: [
      "如果您看到 `n ≤ 20`，請考慮子集/位元遮罩枚舉或中間相遇。",
      "如果您看到 `n` 到 `10^5`–`10^6` 具有簡單的每個元素工作，請考慮單一維護的摘要（視窗、前綴、堆疊），而不是嵌套循環。",
      "如果您在靜態資料上看到許多查詢 `q`，請考慮預先計算、離線排序或 Fenwick/線段樹，而不是從頭開始回答每個查詢。",
      "如果您看到有界值範圍（例如，值 ≤ `10^5`），請在取得映射之前考慮對陣列、桶或位元技巧進行計數。",
      "如果您看到“檢查通過的最小/最大 X”，請考慮使用貪婪可行性檢查對答案進行二分搜尋。",
    ],
    coreIdea: [
      "根據限制估計營運預算，然後選擇適合它的最弱（最簡單）模式。",
      "確定值是否足夠小以用於對數組進行計數，或者是否必須進行坐標壓縮。",
      "命名您將列舉或提交的單一物件（索引、端點、值、剪下）。",
      "將總結所有早期工作的狀態命名為 `O(1)` 或 `O(log n)`。",
      "當不變量表明維護的狀態有效時，準確更新答案。",
      "在編碼之前編寫邊界策略：包含與排除結束、重複、標記和空範圍。",
    ],
    invariant:
      "**預算適合不變性。 ** 在每個設計步驟中，所提出的演算法必須適合輸入大小和值/查詢維度。簡單來說：如果您無法指出為什麼 `n`、`q` 以及值範圍中的每一個都保持在操作預算之內，那麼您得到的只是一個草圖，而不是一個解決方案 - 而且即使超出一個維度的草圖也會 TLE，無論其餘部分多麼優雅。",
    variants: [
      "小n：子集或回溯與修剪。",
      "n 大，查詢少：一次掃描或排序。",
      "大q：離線處理、Fenwick/線段樹或預計算。",
      "有界值域：計數、桶或位元技巧。",
    ],
    templateKeys: ["constraint_scan", "answer_search"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "從主題標籤而不是預算中選擇模式。反例：以 `n ≤ 18` 標記「DP」的問題幾乎總是位元遮罩 DP，而不是 `O(n^2)` 間隔 DP — 讀取標籤而非 `n` 會導致錯誤的重複出現。",
      "忘記第二個昂貴的維度。反例：為每個 `q = 10^5` 查詢運行的 `O(n log n)` 解決方案是 `O(q · n log n) ≈ 10^{11}` — 遠遠超出預算，儘管每個查詢部分「看起來很快」。",
      "使用 `int` 答案溢位。反例：在 `n = 10^5` 相等的情況下，子數組計數總和達到 `~5·10^9`，這會默默地包裝一個 32 位元的 `int`；使用`long long`。",
      "跳過預算意味著的極端輸入：`n = 0/1`、所有重複值、相等邊界以及實際觸發 TLE 的最大大小情況。",
    ],
    practice: [
      {
        id: 1590,
        title: "使總和可被 P 整除",
        slug: "make-sum-divisible-by-p",
        rating: 2039,
        difficulty: "Medium",
        subPattern: "前綴模數",
        why: "強制從 n、值邊界和查詢計數（而不是從主題標籤）中選擇演算法。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1838,
        title: "最常見元素的頻率",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "排序+視窗",
        why: "強制從 n、值邊界和查詢計數（而不是從主題標籤）中選擇演算法。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2092,
        title: "找到所有有秘密的人",
        slug: "find-all-people-with-secret",
        rating: 2004,
        difficulty: "Hard",
        subPattern: "時間分組圖",
        why: "強制從 n、值邊界和查詢計數（而不是從主題標籤）中選擇演算法。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2269,
        title: "尋找某個數字的 K-Beauty",
        slug: "find-the-k-beauty-of-a-number",
        rating: 1280,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3364,
        title: "最小正和子數組",
        slug: "minimum-positive-sum-subarray",
        rating: 1301,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2697,
        title: "字典順序上最小的回文",
        slug: "lexicographically-smallest-palindrome",
        rating: 1304,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1984,
        title: "K 分數最高和最低之間的最小差異",
        slug: "minimum-difference-between-highest-and-lowest-of-k-scores",
        rating: 1306,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3191,
        title: "使二進制數組元素等於 1 的最少操作 I",
        slug: "minimum-operations-to-make-binary-array-elements-equal-to-one-i",
        rating: 1312,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2109,
        title: "在字串中添加空格",
        slug: "adding-spaces-to-a-string",
        rating: 1315,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2861,
        title: "合金最大數量",
        slug: "maximum-number-of-alloys",
        rating: 1981,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3771,
        title: "地牢跑酷總分",
        slug: "total-score-of-dungeon-runs",
        rating: 1981,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 902,
        title: "最多 N 個給定數字集的數字",
        slug: "numbers-at-most-n-given-digit-set",
        rating: 1990,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2953,
        title: "計算完整子字串",
        slug: "count-complete-substrings",
        rating: 2449,
        difficulty: "Hard",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3636,
        title: "門檻多數查詢",
        slug: "threshold-majority-queries",
        rating: 2451,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1040,
        title: "移動石頭直至連續 II",
        slug: "moving-stones-until-consecutive-ii",
        rating: 2456,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "約束條件（n、值範圍、查詢計數）決定哪種技術可以通過，這正是本章訓練的推理。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "`n`、`q`隱含的營運預算、取值範圍是多少，它指向哪個目標複雜度？",
      "我的蠻力中哪個單一維度太昂貴，什麼狀態可以使它成為 `O(1)` 或 `O(log n)`？",
      "這些值對於計數數組/桶來說足夠小，還是必須進行坐標壓縮？",
      "如果有疑問，我可以離線（排序）回答它們，而不是從頭開始獨立回答嗎？",
    ],
    related: [
      "brute-force-to-optimization",
      "state-design",
      "offline-query-processing",
      "binary-search-on-answer",
    ],
  },
  {
    slug: "brute-force-to-optimization",
    title: "暴力優化",
    group: "Problem-Solving Mindset",
    icon: "TrendingUp",
    tagline: "將正確的慢速解決方案轉變為維護狀態、預先計算或不同的枚舉順序。",
    concept: [
      "優化就像注意到你每天都會重新購買相同的食品雜貨，而不是保留一個庫存充足的食品儲藏室。蠻力每次都讓旅程從頭開始；優化庫存了一個儲藏室——一個前綴和、一個哈希圖、一個排序順序——所以下一次旅行只讀取貨架上已有的東西。至關重要的是，你們吃同樣的餐點（答案是相同的）；只是購物方式改變了。",
      "因此，暴力破解是一種診斷工具，而不是一種尷尬：它準確地向您顯示重複了哪些計算。",
      "有用的問題不是“應用了什麼巧妙的技巧？”但是“我重新計算了哪些值是可以儲存的？”",
    ],
    motivation: [
      "對所有物件（所有子數組、對、剪切、路徑、遮罩或查詢答案）編寫暴力破解，然後在一個小範例上運行它。對於 `nums = [2, 1, 3]`，在已知 `sum[0..1]` 後詢問「每個子數組的總和」會從頭開始重新計算 `sum[0..2]`。",
      "標記重複的內部計算。在這裡，每個子數組和都與先前計算的前綴重疊。",
      "庫儲存藏室：前綴和陣列使任何範圍和 `prefix[r + 1] - prefix[l]` 成為 `O(1)` 查找，因此整個任務從 `O(n^2)` 重新計算下降到 `O(n)`。",
      "將蠻力作為精神神諭放在附近：它是您在隨機小輸入上對優化版本進行壓力測試的參考。",
    ],
    whenUse: [
      "如果您看到正確的 `O(n^2)`/`O(n^3)` 枚舉僅按時失敗，請思考“我可以緩存哪些重複事實？”",
      "如果您看到重疊物件重新計算的範圍總和/計數/最小/最大，請考慮前綴總和、稀疏表或芬威克樹。",
      "如果您看到對先前見過的前綴狀態的搜索，請考慮以該狀態為鍵的雜湊映射。",
      "如果您看到像 `a[i] + a[j] ≤ k` 這樣的成對條件，請考慮使用排序後兩個指標來使第二個索引單調移動。",
      "如果您看到“所有子數組/對的總和”，請考慮貢獻計數 - 從枚舉物件翻轉到枚舉每個元素的貢獻。",
    ],
    coreIdea: [
      "用文字寫出蠻力，然後劃掉迭代中重複的計算。",
      "保持相同的答案分解（相同的子問題）－僅改變每個部分的檢索方式。",
      "命名您列舉的物件（子陣列結束、配對、剪下、遮罩）。",
      "命名快速回答每個子問題的儲存狀態（前綴數組、雜湊映射、排序順序、資料結構）。",
      "當維護的狀態對目前物件有效時，準確更新答案。",
      "在編碼之前編寫邊界策略：包含與排除結束、重複、標記和空範圍。",
    ],
    invariant:
      "**相同的子問題不變。 **優化的方法回答與暴力破解完全相同的子問題；只是重複事實的檢索方式改變了。這免費保證了正確性：如果每個子問題的答案都與強力匹配並且組合規則不變，則最終結果必須匹配 - 因此更改答案的優化已經秘密更改了子問題，而不僅僅是其檢索。",
    variants: [
      "前綴和取代重複的範圍和。",
      "哈希映射取代了重複的前綴狀態搜尋。",
      "排序將配對條件轉變為單調移動。",
      "貢獻計數將物件枚舉翻轉為貢獻者枚舉。",
    ],
    templateKeys: ["brute_force_to_prefix", "pair_contribution"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "前綴和索引中相差一。反例：定義`prefix[i] = nums[0] + … + nums[i]`，然後寫一個範圍和作為`prefix[r] - prefix[l]`下降`nums[l]`；半開形式 `prefix[i] = nums[0] + … + nums[i - 1]` 和 `prefix[r + 1] - prefix[l]` 則避免了這種情況。",
      "優化錯誤的蠻力。反例：如果簡單的解決方案錯誤地處理空子數組，則快速版本會繼承該錯誤 - 首先對隨機小輸入進行預言機壓力測試。",
      "加速後溢出。反例：對 `n = 10^5` 相等元素進行貢獻計數產生總和 `~10^{10}`；將累加器保留在 `long long` 中。",
      "不測試 `n = 0/1`、所有重複值、相等邊界以及優化旨在生存的最大尺寸情況。",
    ],
    practice: [
      {
        id: 2262,
        title: "一條弦的總吸引力",
        slug: "total-appeal-of-a-string",
        rating: 2033,
        difficulty: "Hard",
        subPattern: "最後位置貢獻",
        why: "顯示必須成為前綴、視窗、排序或貢獻狀態的確切重複工作。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1838,
        title: "最常見元素的頻率",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "排序+視窗",
        why: "顯示必須成為前綴、視窗、排序或貢獻狀態的確切重複工作。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2025,
        title: "數組分區的最大方式數",
        slug: "maximum-number-of-ways-to-partition-an-array",
        rating: 2218,
        difficulty: "Hard",
        subPattern: "前綴/後綴分區",
        why: "顯示必須成為前綴、視窗、排序或貢獻狀態的確切重複工作。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2351,
        title: "第一個出現兩次的字母",
        slug: "first-letter-to-appear-twice",
        rating: 1155,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 1512,
        title: "好對數",
        slug: "number-of-good-pairs",
        rating: 1161,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 961,
        title: "大小為 2N 的陣列中的 N 個重複元素",
        slug: "n-repeated-element-in-size-2n-array",
        rating: 1162,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3289,
        title: "Digitville 的兩個偷偷摸摸的數字",
        slug: "the-two-sneaky-numbers-of-digitville",
        rating: 1164,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 771,
        title: "珠寶和寶石",
        slug: "jewels-and-stones",
        rating: 1165,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1832,
        title: "檢查句子是否為 Pangram",
        slug: "check-if-the-sentence-is-pangram",
        rating: 1167,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3599,
        title: "對數組進行分區以最小化異或",
        slug: "partition-array-to-minimize-xor",
        rating: 1955,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3756,
        title: "連接非零數字並乘以 Sum II",
        slug: "concatenate-non-zero-digits-and-multiply-by-sum-ii",
        rating: 1968,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3138,
        title: "字謎串聯的最小長度",
        slug: "minimum-length-of-anagram-concatenation",
        rating: 1979,
        difficulty: "Medium",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3518,
        title: "最小回文重排 II",
        slug: "smallest-palindromic-rearrangement-ii",
        rating: 2375,
        difficulty: "Hard",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 854,
        title: "K-相似串",
        slug: "k-similar-strings",
        rating: 2377,
        difficulty: "Hard",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3272,
        title: "求整數的個數",
        slug: "find-the-count-of-good-integers",
        rating: 2382,
        difficulty: "Hard",
        subPattern: "哈希映射",
        why: "簡單的掃描會重新計算此處的重疊工作；用維護狀態或預計算取代它是本章的核心舉措。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以用一句話寫出蠻力並指出迭代中重複的精確計算嗎？",
      "重複的工作是範圍查詢（→ 前綴/Fenwick）、前綴狀態查找（→ 雜湊映射）還是成對條件（→ 排序 + 兩個指標）？",
      "我的優化版本是否回答了與暴力破解相同的子問題，或者我是否悄悄改變了分解？",
      "對於隨機小輸入（預言機測試），暴力破解仍然與快速版本一致嗎？",
    ],
    related: [
      "constraint-driven-thinking",
      "contribution-counting",
      "prefix-suffix-decomposition",
      "difference-array",
    ],
  },
  {
    slug: "invariant-thinking",
    title: "不變的思維",
    group: "Problem-Solving Mindset",
    icon: "Crosshair",
    tagline: "讓每次掃描、指標移動、堆疊更新和貪婪選擇都保留命名的事實。",
    concept: [
      "不變量就像支票簿中的流動餘額：每次交易後都為真的一句話。您不必在每一行上重新新增整個歷史記錄 - 您信任餘額，套用一項變更並保持正確。在程式碼中，循環體是一筆交易，不變式是您承諾在交易前後保持準確的餘額。",
      "這個承諾是實現和證明之間的橋樑：如果循環結束時不變量成立，則答案直接得出。",
      "在兩個指標、二分搜尋、單調堆疊和貪婪程式碼中最令人痛苦的錯誤是不變的錯誤——一筆交易的餘額默默地出了問題。",
    ],
    motivation: [
      "蠻力獨立檢查每個候選者，因此它不需要不變量 - 它只是重新計算所有內容。範例：`nums = [1, 0, 1, 0, 1]` 上的“最多具有 `k` 零的最長子數組”，`k = 1` 可以重新掃描每個 `[left, right]`。",
      "相反，快速版本保留一個視窗和其中的零計數，並向前滑動 `right`。只有當你能夠準確地陳述它所代表的內容時，這種維持的狀態才有意義。",
      "不變量——「視窗 `[left, right]` 最多包含 `k` 零」——準確地告訴您何時收縮（`left++`，當零 > k 時）以及何時記錄答案是合法的（`right - left + 1`）。沒有它，你就無法決定是在收縮之前還是之後更新答案。",
    ],
    whenUse: [
      "如果您看到一個循環，其狀態同時代表許多候選項，請思考“關於此狀態，哪句話始終為真？”",
      "如果您不確定是否在收縮/彈出/放鬆之前或之後更新答案，請思考：寫下不變量並讓它決定。",
      "如果您看到單調堆疊或雙端佇列，請考慮結構保持排序的不變量以及每次彈出的含義。",
      "如果您看到二分搜索，請考慮一個不變量：一側始終為假，另一側始終為真。",
      "如果您看到一個做出選擇的貪婪者，請考慮保持領先的不變量：部分解決方案永遠不會比迄今為止的任何替代方案更糟。",
    ],
    coreIdea: [
      "在編寫循環之前，將不變量寫成一句話。",
      "初始化狀態，使不變量在第一次迭代之前為真。",
      "每次狀態變更後，確定恢復不變量的確切行。",
      "僅在不變量保證狀態有效的地方閱讀答案。",
      "命名正在列舉的物件以及總結所有早期工作的狀態。",
      "在編碼之前編寫邊界策略：包含與排除結束、重複、標記和空範圍。",
    ],
    invariant:
      "**忠實總結不變性。 ** 國家始終是對其聲稱代表的候選人的忠實總結——沒有候選人被默默地添加、丟失或計算兩次。為什麼這保證了正確性：如果摘要在每一步都是準確的，並且您只有在準確時才閱讀答案，那麼最終的閱讀通過歸納法是準確的。每一個經典的錯誤（重複計算一個元素、在更新中讀取答案、忘記驅逐）都恰恰是這句話錯誤的時刻。",
    variants: [
      "視窗始終有效。",
      "視窗在有效時縮小。",
      "堆疊保持單調。",
      "二分查找保留假/真分區。",
      "貪婪的前沿永遠不會比其他選擇更糟。",
    ],
    templateKeys: ["constraint_scan", "loop_invariant_binary_search"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "更新中閱讀答案。反例：在「最多 `k` 零」中，當零已經超過 `k` 時，在收縮之前記錄 `right - left + 1` 計數無效視窗 - 首先恢復不變量（收縮），然後讀取。",
      "驅逐錯誤的元素。反例：單調堆疊「下一個更大」在 `>=` 而不是 `>` 上彈出，打破平局並對相等元素進行雙重計數；不變量告訴您哪個比較使堆疊保持忠實。",
      "差一會破壞二分搜索分區。反例：當 `mid` 已知為 false 時，`low = mid`（而非 `mid + 1`）可以永遠循環 - false/true 不變性固定正確的更新。",
      "不測試 `n = 0/1`、全部相等的值以及視窗必須折疊為空的全部無效的情況。",
    ],
    practice: [
      {
        id: 1838,
        title: "最常見元素的頻率",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "排序+視窗",
        why: "每次指標、堆疊或貪婪更新後都需要維護條件。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "計算分數小於 K 的子數組",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "正分數視窗",
        why: "每次指標、堆疊或貪婪更新後都需要維護條件。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2398,
        title: "預算內機器人的最大數量",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "視窗+單調雙端隊列",
        why: "每次指標、堆疊或貪婪更新後都需要維護條件。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2460,
        title: "對數組應用操作",
        slug: "apply-operations-to-an-array",
        rating: 1224,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 917,
        title: "僅反轉字母",
        slug: "reverse-only-letters",
        rating: 1229,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 3794,
        title: "反轉字串前綴",
        slug: "reverse-string-prefix",
        rating: 1230,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 876,
        title: "鍊錶的中間",
        slug: "middle-of-the-linked-list",
        rating: 1232,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1961,
        title: "檢查字串是否是數組的前綴",
        slug: "check-if-string-is-a-prefix-of-array",
        rating: 1234,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3643,
        title: "垂直翻轉方形子矩陣",
        slug: "flip-square-submatrix-vertically",
        rating: 1235,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2472,
        title: "非重疊回文子字串的最大數量",
        slug: "maximum-number-of-non-overlapping-palindrome-substrings",
        rating: 2013,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3645,
        title: "最佳啟動順序的最大總數",
        slug: "maximum-total-from-optimal-activation-order",
        rating: 2019,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2271,
        title: "地毯覆蓋的最大白瓷磚數量",
        slug: "maximum-white-tiles-covered-by-a-carpet",
        rating: 2022,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3362,
        title: "零陣改造三",
        slug: "zero-array-transformation-iii",
        rating: 2424,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2565,
        title: "具有最低分數的子序列",
        slug: "subsequence-with-the-minimum-score",
        rating: 2432,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2968,
        title: "應用操作來最大化頻率分數",
        slug: "apply-operations-to-maximize-frequency-score",
        rating: 2444,
        difficulty: "Hard",
        subPattern: "滑動窗",
        why: "正確性取決於視窗/指標不變量，該不變量在每一步之後都必須保持，這就是本章形式化的內容。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以用一句話說明每次迭代之前和之後我的視窗/堆疊/前緣始終正確的是什麼嗎？",
      "不變量在哪一行被暫時破壞，哪一行又恢復了它？",
      "我是否僅在不變量保證狀態有效時才閱讀答案？",
      "在關係和平等邊界上，我的比較是否保持國家忠誠（沒有添加、失去或重複計算元素）？",
    ],
    related: [
      "loop-invariant",
      "fix-right-maintain-left",
      "monotonic-data-structures",
      "greedy-stays-ahead",
    ],
  },
  {
    slug: "feasibility-check",
    title: "可行性檢查",
    group: "Problem-Solving Mindset",
    icon: "PencilRuler",
    tagline: "將最佳化與是/否驗證分開，以便二分搜尋、貪婪構造和修剪成為可能。",
    concept: [
      "回答「這可行嗎？」比回答「什麼是最好的？」要容易得多。 — 就像檢查您的行李是否適合隨身攜帶的尺寸測量器，而不是計算適合的單一最大行李。一旦您可以廉價地回答是/否問題，您就可以對最佳大小進行二分搜索，而不是直接建構它。可行性檢查正是這樣的規模確定器：給定一個候選者，它會說可以完成或不能完成，僅此而已。",
      "當可行性單調時它是最強大的：如果值 `x` 有效，則每個更簡單的值也有效，因此可以透過二分搜尋找到「否」和「是」之間的邊界。",
      "同樣的「是/否」預言也指導貪婪的建構：拒絕任何會使其餘部分無法完成的選擇。",
    ],
    motivation: [
      "蠻力構建並比較每個候選人。範例：「將 `nums` 拆分為 `m` 部分，最小化最大部分總和」與 `nums = [7, 2, 5, 10, 8]`、`m = 2` — 枚舉所有拆分是指數級的。",
      "將其翻轉為是/否問題：「我們可以分成 ≤ `m` 部分，每個部分的總和 ≤ `cap` 嗎？」對於 `cap = 18`，貪婪傳遞 `[7, 2, 5] | [10, 8]` 使用 2 個部分 → 可行；對於 `cap = 14`，您需要 3 個零件 → 不可行。",
      "因為 `cap` 中的可行性是單調的（更大的上限永遠不會更難），所以對最小可行 `cap` 進行二分搜尋——每次檢查都是單一 `O(n)` 貪婪傳遞，因此整個搜尋是 `O(n log(sum))`。",
      "困難的部分是證明謂詞在所選方向上是精確且單調的；如果出錯，搜尋就會收斂到錯誤的邊界。",
    ],
    whenUse: [
      "如果您看到“最小化最大值”或“最大化最小值”，請考慮對答案進行二分搜尋並進行可行性檢查。",
      "如果您在隱式集合上看到“第 k 個最小/最大值”，請考慮使用“count ≤ x”檢查對該值進行二分搜尋。",
      "如果您看到“我們可以完成嗎/是否可能”，請認為支票本身就是全部答案。",
      "如果您看到“字典順序最小的有效答案”，請考慮貪婪構造，其中檢查拒絕死端前綴。",
      "如果您發現驗證候選者比建立最佳值便宜得多，請考慮可行性+搜尋。",
    ],
    coreIdea: [
      "精確定義候選 `x` 的意思（容量、速度、計數、前綴）。",
      "證明單調性方向：`feasible(x)` 是否蘊涵 `feasible(x + 1)` 或 `feasible(x - 1)`？",
      "編寫謂詞，使其準確且沒有搜尋副作用（呼叫之間沒有共享可變狀態）。",
      "選擇搜索：在一個值範圍內進行二分搜索，或一次一個位置的貪婪構造。",
      "在搜尋收斂到的單調邊界處讀取答案。",
      "在編碼之前編寫邊界策略：包含與排除端、初始 `[low, high]` 範圍以及空/簡併輸入。",
    ],
    invariant:
      "**精確謂詞不變。 ** 謂詞完全接受至少有一個有效完成的候選人 - 沒有誤報，沒有漏報。為什麼這是不可協商的：二分搜尋假設一個乾淨的假→真邊界，而貪婪的構造信任檢查只修剪真正的死前綴。即使稍微近似的謂詞也會創建第二個邊界或修剪活動分支，並且搜尋會默默地傳回錯誤但合理的答案。",
    variants: [
      "對答案進行二分搜尋。",
      "按字典順序試填。",
      "貪婪剩餘容量。",
      "DP/回溯僅用作可行性預言機。",
    ],
    templateKeys: ["answer_search", "greedy_builder"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "在錯誤的單調方向上搜尋。反例：對於“最小化最大值”，`feasible(cap)` 對於大的 `cap` 必須為 true，對於小 `cap` 必須為 false；如果你寫的檢查對於小 `cap` 來說是正確的，那麼二分搜尋會收斂到相反的一端。",
      "具有隱藏副作用的謂詞。反例：改變共享數組的 `can(x)` 使第二次調用看到剩餘狀態，因此相同的 `x` 在迭代中返回不同的答案 - 保持每次檢查的純淨。",
      "初始邊界錯誤。反例：`low = 0` 用於 Koko 式速度，使 `feasible(0)` 除以零或永遠循環；當零無意義時啟動`low = 1`。",
      "邊界或總和中的整數溢位。反例：`high = sum(nums)`與`n = 10^5`大值溢位`int`；使用 `long long` 作為範圍和累加器。",
    ],
    practice: [
      {
        id: 875,
        title: "科科吃香蕉",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "最小可行速度",
        why: "將優化轉換為是/否謂詞並仔細檢查單調性。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "D 天內運送包裹的能力",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "最小可行容量",
        why: "將優化轉換為是/否謂詞並仔細檢查單調性。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1552,
        title: "兩球之間的磁力",
        slug: "magnetic-force-between-two-balls",
        rating: 1920,
        difficulty: "Medium",
        subPattern: "最大化最小距離",
        why: "將優化轉換為是/否謂詞並仔細檢查單調性。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1351,
        title: "計算排序矩陣中的負數",
        slug: "count-negative-numbers-in-a-sorted-matrix",
        rating: 1139,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2089,
        title: "數組排序後尋找目標索引",
        slug: "find-target-indices-after-sorting-array",
        rating: 1152,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 852,
        title: "山脈陣列中的峰值索引",
        slug: "peak-index-in-a-mountain-array",
        rating: 1182,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 2529,
        title: "正整數和負整數的最大計數",
        slug: "maximum-count-of-positive-integer-and-negative-integer",
        rating: 1196,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1346,
        title: "檢查 N 及其雙精度數是否存在",
        slug: "check-if-n-and-its-double-exist",
        rating: 1225,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1385,
        title: "找出兩個數組之間的距離值",
        slug: "find-the-distance-value-between-two-arrays",
        rating: 1235,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1671,
        title: "製作山脈陣列的最少移除次數",
        slug: "minimum-number-of-removals-to-make-mountain-array",
        rating: 1913,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 2594,
        title: "最短修車時間",
        slug: "minimum-time-to-repair-cars",
        rating: 1915,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1562,
        title: "尋找最新一組 M 碼",
        slug: "find-latest-group-of-size-m",
        rating: 1928,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1187,
        title: "使數組嚴格遞增",
        slug: "make-array-strictly-increasing",
        rating: 2316,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2258,
        title: "逃離蔓延的火勢",
        slug: "escape-the-spreading-fire",
        rating: 2347,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1713,
        title: "產生子序列的最少操作",
        slug: "minimum-operations-to-make-a-subsequence",
        rating: 2351,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "答案是透過對單調可行性謂詞（本章的中心模式）進行二分搜尋來找到的。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以將最佳化重新表述為關於單一候選值的是/否問題嗎？",
      "可行性是否單調——讓候選人變得更容易永遠不會把“是”變成“否”嗎？",
      "我的謂詞是否準確（當且僅在存在有效完成時接受候選）且沒有交叉呼叫副作用？",
      "我的初始 `[low, high]` 邊界是否足夠寬以包含答案並且不會被零除/溢出？",
    ],
    related: [
      "binary-search-on-answer",
      "greedy-construction",
      "constraint-driven-thinking",
      "proof-techniques",
    ],
  },
  {
    slug: "state-design",
    title: "狀態設計",
    group: "Problem-Solving Mindset",
    icon: "Layers",
    tagline: "選擇包含未來決策所需的所有資訊的最小狀態。",
    concept: [
      "設計一個狀態就像為一次旅行打包行李一樣，有嚴格的重量限制：你帶上剩餘旅程所需的東西，留下所有你可以重新創建或不再需要的東西。狀態是你收拾好的行李——一個節點、一個 DP 單元、一個備忘錄密鑰——而轉換是旅程的下一段。裝太少，你就會卡住（狀態不足）；打包太多，包包（狀態空間）太重，無法攜帶。",
      "因此，良好的狀態對於未來的每次轉換來說“足夠”，但又“最小”足以保持狀態數量易於處理。",
      "這是具有額外條件、DP、記憶化和位元遮罩問題的圖搜尋背後的核心技能——選擇要記住的內容是大部分的戰鬥。",
    ],
    motivation: [
      "蠻力承載著整個選擇的歷史。範例：4 節點圖上的「存取所有節點的最短路徑」－記住您採用的完整路徑會組合爆炸。",
      "詢問歷史的哪些部分真正影響未來。在這裡，只有當前節點和已訪問過的節點的「集合」才重要；您訪問它們的順序並非如此。",
      "僅將這些事實編碼為狀態 `(node, visitedMask)`。在訪問同一集合的同一節點處結束的兩條行走是可以互換的，因此 BFS over `n · 2^n` 狀態可以找到路徑枚舉無法找到的答案。",
      "明確地測試互換聲明：如果兩個歷史共享一個狀態但具有不同的未來，則該狀態缺少一個事實並且必須擴大。",
    ],
    whenUse: [
      "如果您看到使用不同的資源/遮罩/奇偶校驗/冷卻時間可以到達相同的位置，請考慮「將該維度新增至狀態」。",
      "如果您發現普通的 `visited[node]` 或 `dp[i]` 遺失了訊息，請考慮使用更豐富的金鑰，例如 `(node, mask)` 或 `(i, lastChoice)`。",
      "如果您看到「存取全部/收集全部」帶有小 `n` (≤ ~18)，請考慮收集的內容的位元遮罩。",
      "如果您看到冷卻時間或交替回合，請考慮在狀態下新增一個小的相位/奇偶校驗場。",
      "如果您看到 DP 需要先前的決策，請考慮將該決策折疊到索引中。",
    ],
    coreIdea: [
      "列出下一個轉換讀取的每個事實。",
      "刪除可從其他事實推導出來的事實（可以重新計算的順序、總數）。",
      "估計最終的狀態數量並在編碼之前確認其符合預算。",
      "選擇一種編碼（元組、位元遮罩、打包整數）和一個備忘錄/存取結構。",
      "僅在不變量證明完整的狀態下更新答案（例如達到完整遮罩）。",
      "在編碼之前編寫邊界策略：開始狀態、接受狀態和不可達/退化情況。",
    ],
    invariant:
      "**可互換性不變。 ** 映射到同一狀態的兩個部分歷史具有相同的一組可能的未來完成（直到已經累積的值）。為什麼這使得記憶是正確的：如果未來僅取決於狀態，那麼解決每個狀態一次並重複使用結果不會損失任何東西。一旦兩個相同狀態的歷史具有不同的未來，快取一個並為另一個重用它會返回錯誤的答案 - 解決方法始終是將缺失的事實添加到狀態中。",
    variants: [
      "圖節點加上遮罩/成本/資源。",
      "DP 索引加計數/最後選擇。",
      "記憶遞歸與排序的剩餘多重集合。",
      "位元遮罩分配和子集分區。",
    ],
    templateKeys: ["state_bfs", "bitmask_dp"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "不足的狀態。反例：使用 `visited[node]` 而不是 `visited[node][mask]` 來「存取所有節點」標記在一個遮罩之後完成的節點，並阻止使用不同的存取集到達該節點 - 失去最佳路徑。",
      "臃腫的狀態。反例：儲存完整存取的*順序*而不是一組，將狀態計數乘以 `n!` 並將可行的 `n · 2^n` 搜尋變成棘手的搜尋。",
      "忘記對狀態進行重複資料刪除。反例：將 `(node, mask)` 推入 BFS 佇列而不進行 `dist`/`seen` 檢查會以指數方式重新存取相同的狀態；第一次出列時標記一個狀態。",
      "蒙版中存在溢出或寬度錯誤。反例：32位元`int`中的`1 << n`與`n = 31`溢位；使用 `1u << n` 或 64 位元型別和大小的陣列作為 `1 << n`。",
    ],
    practice: [
      {
        id: 847,
        title: "存取所有節點的最短路徑",
        slug: "shortest-path-visiting-all-nodes",
        rating: 2201,
        difficulty: "Hard",
        subPattern: "BFS 過狀態掩碼",
        why: "獎勵編碼足夠的狀態並且沒有不相關的歷史。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1601,
        title: "可實現的傳輸請求的最大數量",
        slug: "maximum-number-of-achievable-transfer-requests",
        rating: 2119,
        difficulty: "Hard",
        subPattern: "子集狀態平衡",
        why: "獎勵編碼足夠的狀態並且沒有不相關的歷史。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1723,
        title: "找到完成所有工作的最短時間",
        slug: "find-minimum-time-to-finish-all-jobs",
        rating: 2284,
        difficulty: "Hard",
        subPattern: "賦值狀態",
        why: "獎勵編碼足夠的狀態並且沒有不相關的歷史。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2606,
        title: "找到成本最大的子字串",
        slug: "find-the-substring-with-maximum-cost",
        rating: 1422,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 1493,
        title: "刪除一個元素後最長的 1 子數組",
        slug: "longest-subarray-of-1s-after-deleting-one-element",
        rating: 1423,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2957,
        title: "刪除相鄰的幾乎相等的字符",
        slug: "remove-adjacent-almost-equal-characters",
        rating: 1430,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3192,
        title: "使二進位數組元素等於 1 的最少操作 II",
        slug: "minimum-operations-to-make-binary-array-elements-equal-to-one-ii",
        rating: 1433,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 845,
        title: "陣列中最長的山",
        slug: "longest-mountain-in-array",
        rating: 1437,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3147,
        title: "從神秘地牢中獲取最大能量",
        slug: "taking-maximum-energy-from-the-mystic-dungeon",
        rating: 1460,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 873,
        title: "最長斐波那契子序列的長度",
        slug: "length-of-longest-fibonacci-subsequence",
        rating: 1911,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 1373,
        title: "二元樹中的最大和 BST",
        slug: "maximum-sum-bst-in-binary-tree",
        rating: 1914,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2147,
        title: "劃分長走廊的多種方法",
        slug: "number-of-ways-to-divide-a-long-corridor",
        rating: 1915,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1866,
        title: "重新排列 K 棒可見的棒的方法數量",
        slug: "number-of-ways-to-rearrange-sticks-with-k-sticks-visible",
        rating: 2333,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1611,
        title: "使整數為零的最少一位運算",
        slug: "minimum-one-bit-operations-to-make-integers-zero",
        rating: 2345,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2999,
        title: "計算強力整數的數量",
        slug: "count-the-number-of-powerful-integers",
        rating: 2351,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "乾淨地解決這個問題需要命名總結所有早期選擇的最小狀態，這也是本章的重點。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "下一個過渡讀取的最小事實集合是什麼？我可以放棄從中得出的任何內容嗎？",
      "具有相同狀態的兩個歷史是否真的具有相同的未來，或者我是否缺少資源/遮罩/奇偶校驗欄位？",
      "有多少個州，這個數量是否符合營運預算？",
      "我的開始狀態、接受狀態是什麼？如何對狀態進行重複資料刪除以便每個狀態都處理一次？",
    ],
    related: [
      "dp-state-design",
      "state-compression",
      "dp-transition-design",
      "constraint-driven-thinking",
    ],
  },
  {
    slug: "boundary-and-edge-case-thinking",
    title: "邊界和邊緣案例思維",
    group: "Problem-Solving Mindset",
    icon: "PanelsTopLeft",
    tagline: "在包含/排除範圍、哨兵、重複項和空結構成為錯誤之前對其進行控制。",
    concept: [
      "邊界是演算法的柵欄柱，差一錯誤是典型的「柵欄柱錯誤」：要在每米有柱子的 10 公尺跑步中圍欄，您需要 11 根柱子，而不是 10 根。每當您將問題壓縮為間隔、指針或事件時，您都在計算柵欄柱 - 將“封閉”`[l, r]` 與“半開”`[l, r)` 混合在一起完全是對它們的計數錯誤。",
      "因此，邊界思維是在編寫循環之前修復區間語義和退化情況的習慣，而不是在編寫循環之後修補它們。",
      "最重要的是程式碼最密集的地方——差異數組、掃描線、二分搜尋、滑動視窗——因為幾行可以同時代表多種情況。",
    ],
    motivation: [
      "蠻力在顯式物件上循環，因此邊界是可見的。範例：透過列出 `2, 3, 4, 5` 來計算 `[2, 5]` 中的整數顯然會得到 `5 - 2 + 1 = 4`。",
      "最佳化模式會以事件、等級或指針取代這些對象，因此現在相同的邊界是隱式的。差異數組在 `l` 處新增 `+1`，在 `r + 1` 處新增 `-1` - 忘記 `r + 1` 上的 `+1`，最後一個元素會默默地刪除。",
      "固定約定並將每個更新和查詢一致地轉換為約定；封閉範圍 `[l, r]` 成為半開事件對 `[l, r + 1)`。",
      "保留一個微小的工作範例（長度為 1 的範圍、空範圍）作為檢查壓縮表示是否仍等於明確表示。",
    ],
    whenUse: [
      "如果您看到間隔/範圍，請考慮“封閉還是半開放？”並在編碼之前做出承諾。",
      "如果您看到「第一個/最後一個位置」或重複項，請考慮您的二分搜尋是否會傳回最左邊或最右邊的符合項。",
      "如果您看到差異陣列或掃描，請思考“效果到底在哪裡結束 - `r` 或 `r + 1`？”",
      "如果您發現可能存在空或單元素答案，請考慮代表它的標記（`-1`、`n`、`n + 1`）。",
      "如果您看到單調堆棧，請考慮哪一側使用嚴格的 `<`，哪一側使用非嚴格的 `<=` 來處理平局。",
    ],
    coreIdea: [
      "為整個解決方案選擇一種間隔約定 - 閉合 `[l, r]` 或半開 `[l, r)`。",
      "將每個更新、查詢和指標移動轉換為單一約定。",
      "預先確定哨兵：空答案、未找到和超出範圍標記。",
      "在信任程式碼之前手動執行最小情況（大小 0 和大小 1）和最大情況。",
      "僅在邊界語義保證所表示的範圍是真實的情況下才閱讀答案。",
      "從所選約定重新派生任何 `+1`/`-1`，而不是猜測，直到測試通過。",
    ],
    invariant:
      "**一邊界不變。 ** 每個表示的事件、指標或索引都恰好對應於原始問題中的一個真實邊界 - 永遠不會為零，也永遠不會兩個。為什麼這會消除一個錯誤：如果每個壓縮標記映射到唯一的真實柵欄柱，則標記的數量等於真實邊界的數量，因此範圍長度和包含內容會準確無誤。每個差一都是一個映射到錯誤帖子或沒有映射到任何帖子的標記。",
    variants: [
      "包含區間轉換為 end + 1。",
      "對 [low, high) 進行二分查找。",
      "單調堆疊使用一側嚴格和一側非嚴格。",
      "空答案以哨兵 n + 1 或 -1 表示。",
    ],
    templateKeys: ["difference_array", "loop_invariant_binary_search"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "差異數組末尾相差一。反例：要將`+1`新增至`[l, r]`，您必須執行`diff[r + 1] -= 1`；寫入 `diff[r] -= 1` 會降低索引 `r` 的貢獻。",
      "二分找出在領帶上回傳錯誤的一面。反例：在 `[1, 2, 2, 2, 3]` 中搜尋 `target`，下限與上限混合返回索引 1 而不是 4（反之亦然）作為「最後一次出現」。",
      "半開與閉合視窗長度不符。反例：視窗 `[left, right]` 的長度為 `right - left + 1`，但 `[left, right)` 的長度為 `right - left`；每次迭代使用錯誤的 1 都會導致多計數/少計數。",
      "不執行約定隱藏的簡併輸入：空數組、單一元素、`l == r` 以及整個數組作為一個範圍。",
    ],
    practice: [
      {
        id: 2444,
        title: "計算具有固定邊界的子數組",
        slug: "count-subarrays-with-fixed-bounds",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "固定邊界窗口",
        why: "強調包含/排除端點、空白案例、重複項和哨兵選擇。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1574,
        title: "刪除最短子數組以使數組排序",
        slug: "shortest-subarray-to-be-removed-to-make-array-sorted",
        rating: 1932,
        difficulty: "Medium",
        subPattern: "前綴/後綴拼接",
        why: "強調包含/排除端點、空白案例、重複項和哨兵選擇。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2516,
        title: "從左、右各取K個字符",
        slug: "take-k-of-each-character-from-left-and-right",
        rating: 1948,
        difficulty: "Medium",
        subPattern: "外窗內窗",
        why: "強調包含/排除端點、空白案例、重複項和哨兵選擇。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2149,
        title: "按符號重新排列數組元素",
        slug: "rearrange-array-elements-by-sign",
        rating: 1236,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 832,
        title: "翻轉影像",
        slug: "flipping-an-image",
        rating: 1243,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2465,
        title: "不同平均值的數量",
        slug: "number-of-distinct-averages",
        rating: 1250,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3823,
        title: "將字串中的字母反轉然後特殊字符",
        slug: "reverse-letters-then-special-characters-in-a-string",
        rating: 1250,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2562,
        title: "尋找數組串聯值",
        slug: "find-the-array-concatenation-value",
        rating: 1260,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1089,
        title: "重複的零",
        slug: "duplicate-zeros",
        rating: 1263,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1760,
        title: "袋中球的最小數量",
        slug: "minimum-limit-of-balls-in-a-bag",
        rating: 1940,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 2111,
        title: "使數組 K 遞增的最少操作",
        slug: "minimum-operations-to-make-the-array-k-increasing",
        rating: 1941,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1482,
        title: "製作 m 束花束的最少天數",
        slug: "minimum-number-of-days-to-make-m-bouquets",
        rating: 1946,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 887,
        title: "超級蛋掉落",
        slug: "super-egg-drop",
        rating: 2377,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3116,
        title: "單面額組合第 K 個最小金額",
        slug: "kth-smallest-amount-with-single-denomination-combination",
        rating: 2388,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3585,
        title: "尋找樹中的加權中值節點",
        slug: "find-weighted-median-node-in-tree",
        rating: 2429,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "相差一的末端、空範圍和重複邊界決定了此處的正確性，即本章所針對的確切故障模式。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我是否承諾整個解決方案採用封閉式 `[l, r]` 或半開放式 `[l, r)`？",
      "對於每個 `+1`/`-1` 或指針移動，我可以說出它所代表的確切真實邊界嗎？",
      "我的二分搜尋是否返回重複項的最左邊或最右邊的匹配項，這就是問題想要的嗎？",
      "我是否根據顯式定義手動檢查了大小 0、大小 1 和全範圍大小寫？",
    ],
    related: [
      "difference-array",
      "sweep-line",
      "loop-invariant",
      "binary-search-on-answer",
    ],
  },
  {
    slug: "proof-techniques",
    title: "證明技術",
    group: "Problem-Solving Mindset",
    icon: "GitCompare",
    tagline: "使用不變量、交換參數、歸納和剪切參數來證明模式有效的原​​因。",
    concept: [
      "正確性證明是讓您無需擔心而跳過工作的收據。蠻力支付全額——它會檢查每個候選人——所以它永遠不需要收據。優化的演算法會跳過候選者，證據就是顯示每個跳過的候選者已經被覆蓋、主導或不可能的收據。如果沒有收據，「看起來正確」的快速解決方案只是一個未經測試的猜測。",
      "選擇證明技術是正確性的模式識別，反映演算法的形狀：貪婪→交換或保持領先，循環→不變，DP→狀態順序歸納，MST→切割屬性。",
      "預先進行兩行證明比在隱藏測試中發現您的本地技巧跳過了最佳答案要便宜。",
    ],
    motivation: [
      "暴力破解在構造上是正確的：它會檢查每個候選者，因此不會遺漏任何內容。範例：「最大非重疊間隔」可以測試所有子集。",
      "最佳化的解決方案會跳過候選方案 - 貪婪方案僅保留最早完成時間的間隔 - 因此它有一個原因導致跳過的子集無法擊敗它。",
      "交換論證提供了這個理由：採取任何最佳解決方案；如果它沒有選擇最早完成的間隔，則交換該間隔 - 它不會更晚結束，釋放至少同樣多的空間，並保留計數。因此，包含貪婪選擇的解決方案至少同樣好，並且透過歸納，貪婪是最優的。",
      "一般來說，證明指出了使跳躍安全的等價性、支配性或單調性。",
    ],
    whenUse: [
      "如果您可以解釋程式碼的“功能”，但不能解釋“為什麼它不會錯過答案”，請思考：選擇一個證明形狀。",
      "如果您看到貪婪的本地選擇，請考慮交換參數（交換到貪婪的選擇）或保持領先（貪婪永遠不會落後）。",
      "如果您看到一個循環維持狀態，請認為循環不變。",
      "如果您看到 DP，請考慮歸納法：假設較小的狀態是正確的，表示轉換保留了它。",
      "如果您看到生成樹或“最便宜的連接邊”，請考慮剪切屬性。",
    ],
    coreIdea: [
      "將演算法的形狀與證明形狀相符（貪婪/循環/DP/割）。",
      "在編寫實作細節之前用一句話陳述主張。",
      "確定證明必須證明的確切決定（跳過的候選人）。",
      "精確地在做決策的那一行應用不變量或歸納假設。",
      "僅在證明保證最優性/完整性的情況下閱讀答案才能得出結論。",
      "針對針對跳過案例的小型對抗性輸入對證據進行健全性檢查。",
    ],
    invariant:
      "**安全跳過不變式。 ** 演算法跳過的每個候選者都受其保留的候選者支配，已經由維護的狀態表示，或者在維護的不變量下不可能。為什麼這就是整個遊戲：暴力破解是非常正確的，因此優化演算法與它匹配，前提是它丟棄的任何內容都不是唯一的最佳演算法。如果您可以將每個跳過的候選人放入這三個桶之一，則證明仍然可以達到最佳值；證明的反例就是一個不適合任何桶的被跳過的候選者。",
    variants: [
      "循環不變。",
      "交換論點。",
      "貪婪保持領先。",
      "DP感應。",
      "削減財產。",
      "透過第一個不同的立場產生矛盾。",
    ],
    templateKeys: ["exchange_greedy", "loop_invariant_binary_search"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "假設在沒有交換參數的情況下貪婪是正確的。反例：對於“最大非重疊間隔”，按“開始”時間排序並在 `[[1, 10], [2, 3], [4, 5]]` 上貪婪地選取失敗（選取 1，獲得 1 個間隔；最優選取 `[2, 3], [4, 5]` 為 2）——按“完成”時間排序是交換參數實際證明的合理性。",
      "證明主張的方向是錯誤的。反例：顯示「貪婪≤最優」是空洞的；你必須表現出「貪婪≥最優」（或等於）才能建立最優性。",
      "將“示例工作”與證明混淆了。反例：在樣本上保持領先但在第一個不同位置之後不保持領先的主張是猜測，而不是證明。",
      "忽略退化的情況，證明靜靜地假設：空輸入，單一候選者，以及關係決定正確性的全相等鍵。",
    ],
    practice: [
      {
        id: 1024,
        title: "視訊拼接",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "間隔覆蓋交換",
        why: "需要正確性論證，而不僅僅是實現技巧。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "給花園澆水的最少水龍頭數量",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "最小間隔覆蓋",
        why: "需要正確性論證，而不僅僅是實現技巧。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2366,
        title: "對陣列進行排序的最少替換次數",
        slug: "minimum-replacements-to-sort-the-array",
        rating: 2060,
        difficulty: "Hard",
        subPattern: "反向貪婪不變量",
        why: "需要正確性論證，而不僅僅是實現技巧。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1323,
        title: "最多 69 個號碼",
        slug: "maximum-69-number",
        rating: 1194,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3074,
        title: "蘋果重新分配到盒子裡",
        slug: "apple-redistribution-into-boxes",
        rating: 1198,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2706,
        title: "買兩塊巧克力",
        slug: "buy-two-chocolates",
        rating: 1208,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3545,
        title: "最多 K 個不同字元的最小刪除量",
        slug: "minimum-deletions-for-at-most-k-distinct-characters",
        rating: 1211,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2656,
        title: "恰好 K 個元素的最大和",
        slug: "maximum-sum-with-exactly-k-elements",
        rating: 1213,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1221,
        title: "將字串拆分為平衡字串",
        slug: "split-a-string-in-balanced-strings",
        rating: 1220,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1665,
        title: "完成任務的最小初始能量",
        slug: "minimum-initial-energy-to-finish-tasks",
        rating: 1901,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 991,
        title: "損壞的計算器",
        slug: "broken-calculator",
        rating: 1909,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2673,
        title: "使二元樹中的路徑成本相等",
        slug: "make-costs-of-paths-equal-in-a-binary-tree",
        rating: 1917,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2897,
        title: "對數組應用運算以最大化平方和",
        slug: "apply-operations-on-array-to-maximize-sum-of-squares",
        rating: 2301,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1585,
        title: "檢查字串是否可以透過子字串排序操作進行轉換",
        slug: "check-if-string-is-transformable-with-substring-sort-operations",
        rating: 2333,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1520,
        title: "非重疊子串的最大數量",
        slug: "maximum-number-of-non-overlapping-substrings",
        rating: 2363,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪/結構選擇需要一個簡短的正確性論證（交換或不變量），這是本章所講授的。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我的演算法會跳過哪些候選者，以及每個候選者屬於哪個類別（主導、代表性或不可能）？",
      "演算法的形狀（貪婪/循環/DP/割）是否向我指出了匹配的證明形狀？",
      "對於我的貪婪來說，我實際上可以執行交換參數所需的交換而不會使解決方案變得更糟嗎？",
      "我可以針對跳過的案例建立一個小型對抗性輸入，並且證明仍然成立嗎？",
    ],
    related: [
      "exchange-argument",
      "greedy-stays-ahead",
      "cut-property",
      "loop-invariant",
    ],
  },
  {
    slug: "enumeration-strategy",
    title: "列舉策略",
    group: "Enumeration and Counting",
    icon: "List",
    tagline: "選擇要列舉的正確物件：端點、樞軸、值、遮罩、邊緣、事件或答案。",
    concept: [
      "枚舉策略是選擇哪些維度保持明確以及哪些維度成為維護狀態。",
      "在枚舉對時，同樣的問題可能是不可能的，但在枚舉中間、右端點或貢獻所有者時很容易出現。",
      "有競爭力的解決方案通常來自於更改枚舉對象，而不是添加新的資料結構。",
    ],
    motivation: [
      "暴力列舉所有候選元組或所有子數組。",
      "優化修復一個對象，並詢問來自左/右/過去/未來的哪些資訊足以計算其餘對象。",
      "最好的枚舉使每個候選人被收費一次。",
    ],
    whenUse: [
      "此語句要求提供對、三元組、子序列、子數組、路徑或所有有效的結構。",
      "一個維度可以是固定的，因此其餘維度變成前綴/後綴、頻率或資料結構狀態。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "嘗試將端點、樞軸、價值和貢獻所有者作為可能的錨點。",
      "計算每個錨點有多少個合作夥伴。",
      "透過分配所有權來避免對稱重複計算。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "每個有效答案在枚舉順序中都有一個規範所有者；當且僅當該所有者被處理時，演算法才會對其進行計數。",
    variants: [
      "固定右側，維持左側。",
      "枚舉樞軸或中間。",
      "枚舉中間相遇的較小一邊。",
      "枚舉掩碼/子遮罩。",
      "枚舉排序值閾值。",
    ],
    templateKeys: ["enumerate_middle", "subset_enumeration"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1761,
        title: "圖中連通三元組的最小度",
        slug: "minimum-degree-of-a-connected-trio-in-a-graph",
        rating: 2005,
        difficulty: "Hard",
        subPattern: "列舉三人組",
        why: "火車選擇一個物件進行枚舉，以便維護其餘物件。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1601,
        title: "可實現的傳輸請求的最大數量",
        slug: "maximum-number-of-achievable-transfer-requests",
        rating: 2119,
        difficulty: "Hard",
        subPattern: "子集狀態平衡",
        why: "火車選擇一個物件進行枚舉，以便維護其餘物件。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2444,
        title: "計算具有固定邊界的子數組",
        slug: "count-subarrays-with-fixed-bounds",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "固定邊界窗口",
        why: "火車選擇一個物件進行枚舉，以便維護其餘物件。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1534,
        title: "數好三胞胎",
        slug: "count-good-triplets",
        rating: 1279,
        difficulty: "Easy",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 713,
        title: "小於 K 的子數組積",
        slug: "subarray-product-less-than-k",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2748,
        title: "美麗對的數量",
        slug: "number-of-beautiful-pairs",
        rating: 1301,
        difficulty: "Easy",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1395,
        title: "計算團隊數量",
        slug: "count-number-of-teams",
        rating: 1344,
        difficulty: "Medium",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2799,
        title: "計算數組中完整子數組的數量",
        slug: "count-complete-subarrays-in-an-array",
        rating: 1398,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1094,
        title: "共乘",
        slug: "car-pooling",
        rating: 1441,
        difficulty: "Medium",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3325,
        title: "計算 K 頻字元的子字串 I",
        slug: "count-substrings-with-k-frequency-characters-i",
        rating: 1455,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 1685,
        title: "排序數組中的絕對差之和",
        slug: "sum-of-absolute-differences-in-a-sorted-array",
        rating: 1496,
        difficulty: "Medium",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 523,
        title: "連續子數組和",
        slug: "continuous-subarray-sum",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 731,
        title: "我的日曆二",
        slug: "my-calendar-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 915,
        title: "將陣列分成不相交的區間",
        slug: "partition-array-into-disjoint-intervals",
        rating: 1501,
        difficulty: "Medium",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 14,
        tier: "Core Practice",
      },
      {
        id: 2104,
        title: "子數組範圍之和",
        slug: "sum-of-subarray-ranges",
        rating: 1504,
        difficulty: "Medium",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 15,
        tier: "Core Practice",
      },
      {
        id: 2429,
        title: "最小化異或",
        slug: "minimize-xor",
        rating: 1532,
        difficulty: "Medium",
        subPattern: "逐位列舉（高位貪婪）",
        why: "從分類學角度運用逐位列舉（高位貪婪）列舉觀點。",
        order: 16,
        tier: "Core Practice",
      },
      {
        id: 2470,
        title: "LCM 等於 K 的子陣列數量",
        slug: "number-of-subarrays-with-lcm-equal-to-k",
        rating: 1560,
        difficulty: "Medium",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 17,
        tier: "Core Practice",
      },
      {
        id: 2447,
        title: "GCD 等於 K 的子數組數量",
        slug: "number-of-subarrays-with-gcd-equal-to-k",
        rating: 1603,
        difficulty: "Medium",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 18,
        tier: "Core Practice",
      },
      {
        id: 1248,
        title: "計算好子數組的數量",
        slug: "count-number-of-nice-subarrays",
        rating: 1624,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 19,
        tier: "Core Practice",
      },
      {
        id: 1358,
        title: "包含所有三個字元的子字串的數量",
        slug: "number-of-substrings-containing-all-three-characters",
        rating: 1646,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 20,
        tier: "Core Practice",
      },
      {
        id: 2222,
        title: "選擇建築物的方式數量",
        slug: "number-of-ways-to-select-buildings",
        rating: 1657,
        difficulty: "Medium",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 21,
        tier: "Core Practice",
      },
      {
        id: 974,
        title: "子數組和可被 K 整除",
        slug: "subarray-sums-divisible-by-k",
        rating: 1676,
        difficulty: "Medium",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 22,
        tier: "Core Practice",
      },
      {
        id: 1031,
        title: "兩個不重疊子數組的最大和",
        slug: "maximum-sum-of-two-non-overlapping-subarrays",
        rating: 1680,
        difficulty: "Medium",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 23,
        tier: "Core Practice",
      },
      {
        id: 759,
        title: "員工空閒時間",
        slug: "employee-free-time",
        rating: 1710,
        difficulty: "Hard",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 24,
        tier: "Core Practice",
      },
      {
        id: 1814,
        title: "計算數組中的好對",
        slug: "count-nice-pairs-in-an-array",
        rating: 1738,
        difficulty: "Medium",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 25,
        tier: "Core Practice",
      },
      {
        id: 2615,
        title: "距離總和",
        slug: "sum-of-distances",
        rating: 1793,
        difficulty: "Medium",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 26,
        tier: "Core Practice",
      },
      {
        id: 1834,
        title: "單線程 CPU",
        slug: "single-threaded-cpu",
        rating: 1798,
        difficulty: "Medium",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 27,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "計算分數小於 K 的子數組",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 28,
        tier: "Core Practice",
      },
      {
        id: 421,
        title: "數組中兩個數字的最大異或",
        slug: "maximum-xor-of-two-numbers-in-an-array",
        rating: 1900,
        difficulty: "Medium",
        subPattern: "逐位列舉（高位貪婪）",
        why: "從分類學角度運用逐位列舉（高位貪婪）列舉觀點。",
        order: 29,
        tier: "Core Practice",
      },
      {
        id: 689,
        title: "3 個不重疊子數組的最大和",
        slug: "maximum-sum-of-3-non-overlapping-subarrays",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 30,
        tier: "Core Practice",
      },
      {
        id: 1043,
        title: "劃分數組以獲得最大和",
        slug: "partition-array-for-maximum-sum",
        rating: 1916,
        difficulty: "Medium",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 31,
        tier: "Core Practice",
      },
      {
        id: 813,
        title: "最大平均值之和",
        slug: "largest-sum-of-averages",
        rating: 1937,
        difficulty: "Medium",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 32,
        tier: "Core Practice",
      },
      {
        id: 2762,
        title: "連續子數組",
        slug: "continuous-subarrays",
        rating: 1940,
        difficulty: "Medium",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 33,
        tier: "Core Practice",
      },
      {
        id: 410,
        title: "分割數組最大和",
        slug: "split-array-largest-sum",
        rating: 1950,
        difficulty: "Hard",
        subPattern: "列舉切點",
        why: "從分類學上運用枚舉切點枚舉的觀點。",
        order: 34,
        tier: "Core Practice",
      },
      {
        id: 907,
        title: "子數組最小值之和",
        slug: "sum-of-subarray-minimums",
        rating: 1976,
        difficulty: "Medium",
        subPattern: "所有者/貢獻者（單調堆疊）",
        why: "從分類學中運用所有者/貢獻者（單調堆疊）列舉觀點。",
        order: 35,
        tier: "Core Practice",
      },
      {
        id: 828,
        title: "計算給定字串的所有子字串的唯一字符",
        slug: "count-unique-characters-of-all-substrings-of-a-given-string",
        rating: 2034,
        difficulty: "Hard",
        subPattern: "所有者/貢獻者（單調堆疊）",
        why: "從分類學中運用所有者/貢獻者（單調堆疊）列舉觀點。",
        order: 36,
        tier: "Advanced Practice",
      },
      {
        id: 1856,
        title: "最大子數組最小積",
        slug: "maximum-subarray-min-product",
        rating: 2051,
        difficulty: "Medium",
        subPattern: "所有者/貢獻者（單調堆疊）",
        why: "從分類學中運用所有者/貢獻者（單調堆疊）列舉觀點。",
        order: 37,
        tier: "Advanced Practice",
      },
      {
        id: 2681,
        title: "英雄的力量",
        slug: "power-of-heroes",
        rating: 2060,
        difficulty: "Hard",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 38,
        tier: "Advanced Practice",
      },
      {
        id: 2402,
        title: "會議室三",
        slug: "meeting-rooms-iii",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 39,
        tier: "Advanced Practice",
      },
      {
        id: 891,
        title: "子序列寬度之和",
        slug: "sum-of-subsequence-widths",
        rating: 2183,
        difficulty: "Hard",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 40,
        tier: "Advanced Practice",
      },
      {
        id: 992,
        title: "具有 K 個不同整數的子數組",
        slug: "subarrays-with-k-different-integers",
        rating: 2210,
        difficulty: "Hard",
        subPattern: "固定右側，計算有效左側",
        why: "練習修復右，從分類學計數有效的左枚舉觀點。",
        order: 41,
        tier: "Advanced Practice",
      },
      {
        id: 2183,
        title: "計算可被 K 整除的數組對",
        slug: "count-array-pairs-divisible-by-k",
        rating: 2246,
        difficulty: "Hard",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 42,
        tier: "Advanced Practice",
      },
      {
        id: 952,
        title: "以公因數計算的最大組件尺寸",
        slug: "largest-component-size-by-common-factor",
        rating: 2272,
        difficulty: "Hard",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 43,
        tier: "Advanced Practice",
      },
      {
        id: 2179,
        title: "計算數組中好的三元組數",
        slug: "count-good-triplets-in-an-array",
        rating: 2272,
        difficulty: "Hard",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 44,
        tier: "Advanced Practice",
      },
      {
        id: 1851,
        title: "包含每個查詢的最小間隔",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "枚舉觸發器/事件",
        why: "練習從分類法列舉觸發器/事件列舉的觀點。",
        order: 45,
        tier: "Advanced Practice",
      },
      {
        id: 2935,
        title: "最大強對 XOR II",
        slug: "maximum-strong-pair-xor-ii",
        rating: 2349,
        difficulty: "Hard",
        subPattern: "逐位列舉（高位貪婪）",
        why: "從分類學角度運用逐位列舉（高位貪婪）列舉觀點。",
        order: 46,
        tier: "Challenge Practice",
      },
      {
        id: 1707,
        title: "與數組中的元素進行最大異或",
        slug: "maximum-xor-with-an-element-from-array",
        rating: 2359,
        difficulty: "Hard",
        subPattern: "逐位列舉（高位貪婪）",
        why: "從分類學角度運用逐位列舉（高位貪婪）列舉觀點。",
        order: 47,
        tier: "Challenge Practice",
      },
      {
        id: 2818,
        title: "應用運算來最大化分數",
        slug: "apply-operations-to-maximize-score",
        rating: 2397,
        difficulty: "Hard",
        subPattern: "所有者/貢獻者（單調堆疊）",
        why: "從分類學中運用所有者/貢獻者（單調堆疊）列舉觀點。",
        order: 48,
        tier: "Challenge Practice",
      },
      {
        id: 2003,
        title: "每個子樹中最小的缺失遺傳值",
        slug: "smallest-missing-genetic-value-in-each-subtree",
        rating: 2415,
        difficulty: "Hard",
        subPattern: "從小到大合併",
        why: "從分類學角度運用從小到大合併枚舉的觀點。",
        order: 49,
        tier: "Challenge Practice",
      },
      {
        id: 2552,
        title: "計數增加的四聯體",
        slug: "count-increasing-quadruplets",
        rating: 2433,
        difficulty: "Hard",
        subPattern: "枚舉樞軸/中間",
        why: "從分類學中運用枚舉樞軸/中間枚舉的觀點。",
        order: 50,
        tier: "Challenge Practice",
      },
      {
        id: 2421,
        title: "良好路徑數",
        slug: "number-of-good-paths",
        rating: 2445,
        difficulty: "Hard",
        subPattern: "從小到大合併",
        why: "從分類學角度運用從小到大合併枚舉的觀點。",
        order: 51,
        tier: "Challenge Practice",
      },
      {
        id: 1819,
        title: "不同子序列 GCD 的數量",
        slug: "number-of-different-subsequences-gcds",
        rating: 2540,
        difficulty: "Hard",
        subPattern: "enumerate the value domain (差值/餘數/GCD)",
        why: "Exercises the enumerate the value domain (差值/餘數/GCD) enumeration viewpoint from the taxonomy.",
        order: 52,
        tier: "Challenge Practice",
      },
      {
        id: 2281,
        title: "巫師總實力總和",
        slug: "sum-of-total-strength-of-wizards",
        rating: 2621,
        difficulty: "Hard",
        subPattern: "所有者/貢獻者（單調堆疊）",
        why: "從分類學中運用所有者/貢獻者（單調堆疊）列舉觀點。",
        order: 53,
        tier: "Challenge Practice",
      },
      {
        id: 2916,
        title: "子數組不同元素平方和 II",
        slug: "subarrays-distinct-element-sum-of-squares-ii",
        rating: 2816,
        difficulty: "Hard",
        subPattern: "貢獻單位（對/子序列）",
        why: "從分類學角度運用貢獻單位（對/子序列）列舉觀點。",
        order: 54,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "fix-right-maintain-left",
      "enumerate-pivot-middle",
      "contribution-counting",
      "prefix-suffix-decomposition",
    ],
    coreIdeaAppendix: ENUMERATION_TAXONOMY,
  },
  {
    slug: "contribution-counting",
    title: "貢獻計數",
    group: "Enumeration and Counting",
    icon: "Sigma",
    tagline: "透過詢問每個元素、對、邊界或邊的貢獻來計算總數。",
    concept: [
      "貢獻計數（或稱貢獻法）將「所有答案的總和」翻轉為「所有貢獻者的總和」。",
      "不要建構每個子數組、子序列、對或路徑，而是計算一個原子物件以固定角色出現的次數。",
      "它是最小值、最大值、寬度、距離、吸引力和樹/路徑效應總計的核心模式。",
    ],
    motivation: [
      "暴力列舉每個結果對象並獨立計算其值。",
      "由於相同的元素或對出現在許多結果物件中，因此會出現重複工作。",
      "最佳化的模式將每個事件分配給一個唯一的貢獻者，並乘以它周圍的選擇數量。",
    ],
    whenUse: [
      "答案是所有子數組、子序列、對、路徑或子字串的總和。",
      "每個元素可以是最小值、最大值、邊界、中間、最後出現或端點多次。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "枚舉貢獻者，而不是最終物件。",
      "計算左選擇乘以右選擇，或計算先前發生的選擇乘以未來的選擇。",
      "使用嚴格/非嚴格邊界使重複項恰好由一側擁有。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "每個最終物件都被指派給所計算角色的一個貢獻者；重複值使用不對稱邊界，因此所有權是唯一的。",
    variants: [
      "元素為最小值。",
      "元素為最大值。",
      "元素作為邊界。",
      "元素作為樞軸或中間。",
      "排序後配對貢獻。",
      "樹邊緣貢獻。",
      "具有前綴和的貢獻。",
      "單調堆疊的貢獻。",
    ],
    templateKeys: [
      "contribution_mono",
      "pair_contribution",
      "prefix_contribution",
    ],
    complexity: [
      "單調堆疊貢獻為 O(n)；排序對貢獻為 O(n log n)；前綴貢獻通常為 O(n)。",
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "在兩側使用 < 或在兩側使用 <= 來重複。",
      "乘法選擇時忘記取模或 long 長。",
      "排序後對每對計數兩次。",
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 2262,
        title: "一條弦的總吸引力",
        slug: "total-appeal-of-a-string",
        rating: 2033,
        difficulty: "Hard",
        subPattern: "最後位置貢獻",
        why: "直接練習計算每個元素、對或邊界貢獻了多少個答案。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 3428,
        title: "至多大小為 K 的子序列的最大和最小和",
        slug: "maximum-and-minimum-sums-of-at-most-size-k-subsequences",
        rating: 2028,
        difficulty: "Medium",
        subPattern: "後續貢獻",
        why: "直接練習計算每個元素、對或邊界貢獻了多少個答案。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3430,
        title: "最多 K 個子數組的最大和最小和",
        slug: "maximum-and-minimum-sums-of-at-most-size-k-subarrays",
        rating: 2645,
        difficulty: "Hard",
        subPattern: "有界子陣極值",
        why: "直接練習計算每個元素、對或邊界貢獻了多少個答案。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1441,
        title: "使用堆疊操作建立數組",
        slug: "build-an-array-with-stack-operations",
        rating: 1180,
        difficulty: "Medium",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2000,
        title: "單字的反向前綴",
        slug: "reverse-prefix-of-word",
        rating: 1199,
        difficulty: "Easy",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 844,
        title: "退格字串比較",
        slug: "backspace-string-compare",
        rating: 1228,
        difficulty: "Easy",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 921,
        title: "使括號有效的最小添加量",
        slug: "minimum-add-to-make-parentheses-valid",
        rating: 1242,
        difficulty: "Medium",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3174,
        title: "清除數字",
        slug: "clear-digits",
        rating: 1255,
        difficulty: "Easy",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2696,
        title: "刪除子字串後的最小字串長度",
        slug: "minimum-string-length-after-removing-substrings",
        rating: 1282,
        difficulty: "Easy",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2296,
        title: "設計一個文字編輯器",
        slug: "design-a-text-editor",
        rating: 1912,
        difficulty: "Hard",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 2434,
        title: "使用機器人列印按字典順序最小的字串",
        slug: "using-a-robot-to-print-the-lexicographically-smallest-string",
        rating: 1953,
        difficulty: "Medium",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 880,
        title: "索引處的解碼字串",
        slug: "decoded-string-at-index",
        rating: 2011,
        difficulty: "Medium",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2289,
        title: "使數組不減的步驟",
        slug: "steps-to-make-array-non-decreasing",
        rating: 2482,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1776,
        title: "車隊II",
        slug: "car-fleet-ii",
        rating: 2531,
        difficulty: "Hard",
        subPattern: "單調堆疊",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1896,
        title: "改變表達式最終值的最小成本",
        slug: "minimum-cost-to-change-the-final-value-of-expression",
        rating: 2532,
        difficulty: "Hard",
        subPattern: "stack",
        why: "您無需枚舉子數組，而是將每個元素在其主導範圍（章節模式）中的貢獻相加。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "該語句是否表示了許多物件的總和？",
      "一個元素、邊或對可以被分配一個穩定的角色，如最小值或邊界嗎？",
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "monotonic-data-structures",
      "prefix-suffix-decomposition",
      "enumeration-strategy",
      "dp-transition-design",
    ],
  },
  {
    slug: "fix-right-maintain-left",
    title: "修復右側，維持左側",
    group: "Enumeration and Counting",
    icon: "ArrowLeftRight",
    tagline: "枚舉右端點並維護恢復視窗不變性的最小左端點。",
    concept: [
      "固定右邊，維持左邊就是滑動視窗的端點視圖。",
      "右端點移動一次；左移僅用於恢復不變量，例如最多 K、總和 <= K 或滿足覆蓋範圍。",
      "當有效性隨著向左移動而單調變化時，它避免了 O(n^2) 子數組枚舉。",
    ],
    motivation: [
      "暴力檢查所有左/右對。",
      "如果在右側添加元素只會使一個方向上的約束變得更難或更容易，那麼左側永遠不需要向後移動。",
      "對於每個右端點，所有有效的開始通常會形成一個可以立即計數的連續間隔。",
    ],
    whenUse: [
      "具有最長、最短、計數有效、最多 K、剛好 K、頻率、非負和或位元 OR 約束的子數組或子字串。",
      "可以透過新增 nums[right] 和刪除 nums[left] 來更新視窗。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "每次迭代向右擴展一次。",
      "向左收縮，直到恢復不變量或直到刪除更多不變量會破壞目標。",
      "最多計數K時，恢復有效性後加右-左+1。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "處理完每個右端點後，左端點是第一個索引，使得維護的視窗滿足所選的不變量。",
    variants: [
      "最長有效窗口。",
      "最短有效視窗。",
      "計算有效子數組的數量。",
      "最多 K 且恰好 K 通過減法。",
      "頻率視窗。",
      "具有位數的按位或視窗。",
      "雙視窗計數技巧。",
    ],
    templateKeys: [
      "longest_window",
      "shortest_window",
      "at_most_k_distinct",
      "exactly_k_distinct",
      "bitwise_or_window",
    ],
    complexity: [
      "每個指標移動 O(n)；映射或位元操作新增 O(log V)、O(1) 平均值或 O(位元計數)。",
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "在縮小有效性之前更新答案。",
      "當 atMost(K) - atMost(K - 1) 較乾淨時，直接使用 K。",
      "當負數破壞總和單調性時嘗試此模式。",
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1838,
        title: "最常見元素的頻率",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "排序+視窗",
        why: "練習確定正確的終點並將所有有效的開始轉化為貢獻。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "計算分數小於 K 的子數組",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "正分數視窗",
        why: "練習確定正確的終點並將所有有效的開始轉化為貢獻。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2398,
        title: "預算內機器人的最大數量",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "視窗+單調雙端隊列",
        why: "練習確定正確的終點並將所有有效的開始轉化為貢獻。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2441,
        title: "與其負數一起存在的最大正整數",
        slug: "largest-positive-integer-that-exists-with-its-negative",
        rating: 1168,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 922,
        title: "依奇偶校驗排序數組 II",
        slug: "sort-array-by-parity-ii",
        rating: 1174,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 905,
        title: "依奇偶校驗對數組排序",
        slug: "sort-array-by-parity",
        rating: 1178,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3194,
        title: "最小和最大元素的最小平均值",
        slug: "minimum-average-of-smallest-and-largest-elements",
        rating: 1195,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3940,
        title: "限制排序數組中的出現次數",
        slug: "limit-occurrences-in-sorted-array",
        rating: 1202,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2108,
        title: "尋找數組中的第一個回文字串",
        slug: "find-first-palindromic-string-in-the-array",
        rating: 1216,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2831,
        title: "求最長的相等子數組",
        slug: "find-the-longest-equal-subarray",
        rating: 1976,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3844,
        title: "最長的近回文子字串",
        slug: "longest-almost-palindromic-substring",
        rating: 1990,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1888,
        title: "使二進位字串交替的最小翻轉次數",
        slug: "minimum-number-of-flips-to-make-the-binary-string-alternating",
        rating: 2006,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3504,
        title: "子字串連接後的最長回文 II",
        slug: "longest-palindrome-after-substring-concatenation-ii",
        rating: 2398,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3801,
        title: "合併排序清單的最低成本",
        slug: "minimum-cost-to-merge-sorted-lists",
        rating: 2399,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2747,
        title: "計數零請求伺服器",
        slug: "count-zero-request-servers",
        rating: 2405,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "固定右端點並推進左邊界可以使視窗在線性時間內保持有效，這是本章的技術。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "對於固定權限，有效的開頭是否形成後綴或前綴間隔？",
      "左手只需要向前走嗎？",
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "difference-array",
      "monotonic-data-structures",
      "binary-search-on-answer",
      "prefix-suffix-decomposition",
    ],
  },
  {
    slug: "enumerate-pivot-middle",
    title: "枚舉樞軸/中間",
    group: "Enumeration and Counting",
    icon: "Crosshair",
    tagline: "固定中心對象，以便左側和右側事實可以獨立組合。",
    concept: [
      "樞軸枚舉固定索引、值、邊緣或中間位置，並對兩側的相容物件進行計數。",
      "它在三元組、回文子序列、特殊子序列和基於分割的陣列問題中很常見。",
      "中間物件提供了一個規範所有者，可以防止多次計算相同的結構。",
    ],
    motivation: [
      "蠻力選擇元組中的所有位置。",
      "透過固定中間，左右選擇成為獨立計數或壓縮狀態。",
      "答案成為事實圍繞樞軸的乘積或卷積。",
    ],
    whenUse: [
      "問題要求長度為 3/5 的子序列、遞增四聯體、唯一中間、分裂位置或對稱中心。",
      "候選人的左右可以分別總結。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "預先計算或維護左側事實。",
      "預先計算或維護右側事實。",
      "對於每個樞軸，組合相容的事實，然後移動樞軸邊界。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "每個有效結構在所選定義下都有一個唯一的主元，因此圍繞該主元組合左右事實將計算一次。",
    variants: [
      "三元組中的中間索引。",
      "長度為 5 的回文中的兩個中間位置。",
      "頻率計數中的樞軸值。",
      "數組中的分割點。",
      "根或 LCA 作為樹樞軸。",
    ],
    templateKeys: ["enumerate_middle", "prefix_suffix_counts"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 2484,
        title: "計算回文子序列",
        slug: "count-palindromic-subsequences",
        rating: 2223,
        difficulty: "Hard",
        subPattern: "中間枚舉",
        why: "使中間/樞軸物件變得明確，並將昂貴的部分移至側面狀態。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2552,
        title: "計數增加的四聯體",
        slug: "count-increasing-quadruplets",
        rating: 2433,
        difficulty: "Hard",
        subPattern: "四聯體計數",
        why: "使中間/樞軸物件變得明確，並將昂貴的部分移至側面狀態。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3395,
        title: "具有獨特中間模式的子序列 I",
        slug: "subsequences-with-a-unique-middle-mode-i",
        rating: 2800,
        difficulty: "Hard",
        subPattern: "中模式計數",
        why: "使中間/樞軸物件變得明確，並將昂貴的部分移至側面狀態。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2778,
        title: "特殊元素的平方和",
        slug: "sum-of-squares-of-special-elements",
        rating: 1152,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3833,
        title: "統計主導指數",
        slug: "count-dominant-indices",
        rating: 1172,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2951,
        title: "尋找高峰",
        slug: "find-the-peaks",
        rating: 1189,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3827,
        title: "計算 Monobit 整數",
        slug: "count-monobit-integers",
        rating: 1191,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2367,
        title: "算術三元組的數量",
        slug: "number-of-arithmetic-triplets",
        rating: 1203,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3745,
        title: "最大化表達三要素",
        slug: "maximize-expression-of-three-elements",
        rating: 1218,
        difficulty: "Easy",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2018,
        title: "檢查單字是否可以放入填字遊戲中",
        slug: "check-if-word-can-be-placed-in-crossword",
        rating: 1930,
        difficulty: "Medium",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3720,
        title: "按字典順序排列的最小排列大於目標",
        slug: "lexicographically-smallest-permutation-greater-than-target",
        rating: 1958,
        difficulty: "Medium",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2151,
        title: "基於陳述的最大好人",
        slug: "maximum-good-people-based-on-statements",
        rating: 1980,
        difficulty: "Hard",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3398,
        title: "具有相同字元的最小子字串 I",
        slug: "smallest-substring-with-identical-characters-i",
        rating: 2301,
        difficulty: "Hard",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2242,
        title: "節點序列的最大分數",
        slug: "maximum-score-of-a-node-sequence",
        rating: 2304,
        difficulty: "Hard",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2306,
        title: "命名公司",
        slug: "naming-a-company",
        rating: 2305,
        difficulty: "Hard",
        subPattern: "enumeration",
        why: "修復中間/樞軸元素並計算有效邊數將 O(n^3) 搜尋變成 O(n^2) 或更好，這是本章的想法。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "prefix-suffix-decomposition",
      "contribution-counting",
      "enumeration-strategy",
      "state-design",
    ],
  },
  {
    slug: "prefix-suffix-decomposition",
    title: "前綴/後綴分解",
    group: "Enumeration and Counting",
    icon: "PanelsTopLeft",
    tagline:
      "預先計算每次切割的左側和右側可以提供什麼，然後在 O(1) 或對數時間內將它們組合起來。",
    concept: [
      "前綴/後綴分解儲存每次切割或旋轉之前和之後的事實。",
      "它是不重複重新掃描同一面的陣列/字串版本。",
      "當最終答案是切割、移除、拼接、分區或從外到內的選擇時，此模式最強。",
    ],
    motivation: [
      "暴力嘗試切割並左/右掃描以對其進行評估。",
      "優化執行一次從左到右和從右到左的掃描。",
      "然後，每次切割都成為先前​​計算的事實的恆定時間組合。",
    ],
    whenUse: [
      "問題要求刪除子數組，從兩端選擇，拆分數組，比較前綴和後綴，或組合左/右最佳值。",
      "一旦切口固定，每一側的屬性都是獨立的。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "首先定義剪切語意：左端於 i，右端於 i + 1 或半開範圍。",
      "在一個方向上計算前綴事實，並在另一個方向上計算後綴事實。",
      "每次切割時僅合併相容的事實。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "對於每次切割，在相同邊界約定下，前綴狀態精確地總結左側，後綴狀態精確地總結右側。",
    variants: [
      "前綴 max 後綴 min。",
      "前綴計數與後綴計數。",
      "從兩端向外的窗戶。",
      "前進/後退 DP。",
      "字串前綴函數和後綴匹配。",
    ],
    templateKeys: ["prefix_contribution", "prefix_suffix_counts"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 2025,
        title: "數組分區的最大方式數",
        slug: "maximum-number-of-ways-to-partition-an-array",
        rating: 2218,
        difficulty: "Hard",
        subPattern: "前綴/後綴分區",
        why: "使用左右預計算來刪除切口周圍的重複掃描。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2167,
        title: "清除所有含有非法物品的汽車的最短時間",
        slug: "minimum-time-to-remove-all-cars-containing-illegal-goods",
        rating: 2219,
        difficulty: "Hard",
        subPattern: "前綴/後綴 DP",
        why: "使用左右預計算來刪除切口周圍的重複掃描。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1574,
        title: "刪除最短子數組以使數組排序",
        slug: "shortest-subarray-to-be-removed-to-make-array-sorted",
        rating: 1932,
        difficulty: "Medium",
        subPattern: "前綴/後綴拼接",
        why: "使用左右預計算來刪除切口周圍的重複掃描。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3316,
        title: "尋找來源字串中的最大刪除次數",
        slug: "find-maximum-removals-from-source-string",
        rating: 2062,
        difficulty: "Medium",
        subPattern: "刪除前綴/後綴 DP",
        why: "使用左右預計算來刪除切口周圍的重複掃描。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 1480,
        title: "一維數組的運行總和",
        slug: "running-sum-of-1d-array",
        rating: 1105,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3028,
        title: "邊界上的螞蟻",
        slug: "ant-on-the-boundary",
        rating: 1116,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3432,
        title: "計算總和差為偶數的分區",
        slug: "count-partitions-with-even-sum-difference",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2574,
        title: "左和右和差異",
        slug: "left-and-right-sum-differences",
        rating: 1206,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2485,
        title: "找到樞軸整數",
        slug: "find-the-pivot-integer",
        rating: 1207,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 1413,
        title: "逐步求和得到正數的最小值",
        slug: "minimum-value-to-get-positive-step-by-step-sum",
        rating: 1212,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 2602,
        title: "使所有數組元素相等的最少操作",
        slug: "minimum-operations-to-make-all-array-elements-equal",
        rating: 1903,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3728,
        title: "具有相等邊界和內部和的穩定子數組",
        slug: "stable-subarrays-with-equal-boundary-and-interior-sum",
        rating: 1909,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 2680,
        title: "最大或",
        slug: "maximum-or",
        rating: 1912,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 2478,
        title: "漂亮分區數量",
        slug: "number-of-beautiful-partitions",
        rating: 2344,
        difficulty: "Hard",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 15,
        tier: "Challenge Practice",
      },
      {
        id: 2132,
        title: "沖壓網格",
        slug: "stamping-the-grid",
        rating: 2364,
        difficulty: "Hard",
        subPattern: "前綴和",
        why: "將答案拆分為預先計算的前綴和後綴部分可以消除內部循環（即章節的分解）。",
        order: 16,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "enumerate-pivot-middle",
      "boundary-and-edge-case-thinking",
      "brute-force-to-optimization",
      "difference-array",
    ],
  },
  {
    slug: "difference-array",
    title: "差分數組",
    group: "Core Array/String Patterns",
    icon: "Hash",
    tagline: "將許多範圍更新表示為端點增量，然後使用一個前綴傳遞重建實際值。",
    concept: [
      "差異數組儲存相鄰位置之間的變化而不是最終值。",
      "範圍加法變成兩個端點事件：在左側加法，在右側減法。",
      "當批量更新並在重建後檢查最終值或有效性時，這是理想的選擇。",
    ],
    motivation: [
      "強力將每個更新應用於每個受影響的索引。",
      "如果有許多長範圍，則會在重疊間隔內重複工作。",
      "端點增量保留淨效果並將所有內部工作推遲到一次前綴掃描。",
    ],
    whenUse: [
      "許多範圍加/減運算。",
      "應用間隔後需要最終陣列、覆蓋計數或可行性。",
      "查詢可以離線處理，而不需要任意線上更新。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "將每個閉範圍 [l, r] 轉換為 diff[l] += delta 和 diff[r + 1] -= delta。",
      "運行前綴和以恢復最終值。",
      "對於驗證問題，僅在職位仍需要幫助時才貪婪地創建增量。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant: "索引 i 處的前綴總和等於範圍包含 i 的每個更新的總增量。",
    variants: [
      "一維範圍添加。",
      "二維矩形添加。",
      "成本函數斷點的差異。",
      "透過主動操作進行貪婪驗證。",
      "事件掃描作為稀疏差分數組。",
    ],
    templateKeys: ["difference_array", "difference_matrix"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 995,
        title: "K 連續位翻轉的最小次數",
        slug: "minimum-number-of-k-consecutive-bit-flips",
        rating: 1835,
        difficulty: "Hard",
        subPattern: "範圍翻轉差異",
        why: "將許多範圍操作轉變為端點事件和一次重建過程。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1526,
        title: "形成目標數組的子數組的最小增量數",
        slug: "minimum-number-of-increments-on-subarrays-to-form-a-target-array",
        rating: 1872,
        difficulty: "Medium",
        subPattern: "正差異貢獻",
        why: "將許多範圍操作轉變為端點事件和一次重建過程。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1674,
        title: "使陣列互補的最少移動次數",
        slug: "minimum-moves-to-make-array-complementary",
        rating: 2333,
        difficulty: "Medium",
        subPattern: "與配對成本的差異",
        why: "將許多範圍操作轉變為端點事件和一次重建過程。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3356,
        title: "零陣改造二",
        slug: "zero-array-transformation-ii",
        rating: 1913,
        difficulty: "Medium",
        subPattern: "範圍更新邊界",
        why: "將許多範圍操作轉變為端點事件和一次重建過程。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3427,
        title: "可變長度子數組的總和",
        slug: "sum-of-variable-length-subarrays",
        rating: 1216,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3903,
        title: "最小穩定指數 I",
        slug: "smallest-stable-index-i",
        rating: 1235,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1422,
        title: "分割字串後的最大分數",
        slug: "maximum-score-after-splitting-a-string",
        rating: 1238,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1732,
        title: "找出最高海拔",
        slug: "find-the-highest-altitude",
        rating: 1257,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3707,
        title: "等分子串",
        slug: "equal-score-substrings",
        rating: 1262,
        difficulty: "Easy",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 2428,
        title: "沙漏的最大總和",
        slug: "maximum-sum-of-an-hourglass",
        rating: 1290,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 2731,
        title: "機器人的運動",
        slug: "movement-of-robots",
        rating: 1923,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3381,
        title: "長度可被 K 整除的最大子數組和",
        slug: "maximum-subarray-sum-with-length-divisible-by-k",
        rating: 1943,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 1737,
        title: "更改最低字元數以滿足三個條件之一",
        slug: "change-minimum-characters-to-satisfy-one-of-three-conditions",
        rating: 1953,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 3413,
        title: "K 連續袋中的最大硬幣數",
        slug: "maximum-coins-from-k-consecutive-bags",
        rating: 2374,
        difficulty: "Medium",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 15,
        tier: "Challenge Practice",
      },
      {
        id: 3797,
        title: "計算攀爬矩形網格的路線",
        slug: "count-routes-to-climb-a-rectangular-grid",
        rating: 2376,
        difficulty: "Hard",
        subPattern: "前綴和",
        why: "範圍更新折疊為兩個端點編輯加上一個前綴傳遞，這是本章介紹的差異數組技巧。",
        order: 16,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "sweep-line",
      "boundary-and-edge-case-thinking",
      "offline-query-processing",
      "prefix-suffix-decomposition",
    ],
  },
  {
    slug: "binary-search-on-answer",
    title: "對答案進行二分搜索",
    group: "Core Array/String Patterns",
    icon: "Gauge",
    tagline: "當可行性單調且比直接優化更便宜時，搜尋價值空間。",
    concept: [
      "對答案的二分搜尋將最佳化問題轉化為重複的可行性檢查。",
      "候選值不是輸入中的索引；它是速度、容量、距離、時間、最大值、最小值或第 k 個值。",
      "整個技術取決於證明謂詞的單調性。",
    ],
    motivation: [
      "暴力測試每個可能的答案值。",
      "如果值很大但有效/無效形成前綴或後綴，則二分搜尋以對數方式切割值空間。",
      "謂詞經常使用貪婪、計數、兩個指針或 DSU。",
    ],
    whenUse: [
      "最小化最大值、最大化最小值、第 k 個最小、最短時間、最大可行分數。",
      "給定 x，檢查可行性的時間複雜度為 O(n)、O(n log n) 或 O(q alpha(n))。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "選擇低/高作為絕對不可能/可能或兩者都包含的邊界。",
      "首先編寫 can(x) 並測試單調方向。",
      "根據不變量傳回第一個可行值或最後一個可行值。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant: "搜尋區間始終包含不可行和可行候選值之間的邊界。",
    variants: [
      "最小可行值。",
      "最大可行值。",
      "按計數的第 K 個值 <= x。",
      "實值二分查找。",
      "二分查找加貪心構造。",
    ],
    templateKeys: ["answer_search", "loop_invariant_binary_search"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 875,
        title: "科科吃香蕉",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "最小可行速度",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "D 天內運送包裹的能力",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "最小可行容量",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1552,
        title: "兩球之間的磁力",
        slug: "magnetic-force-between-two-balls",
        rating: 1920,
        difficulty: "Medium",
        subPattern: "最大化最小距離",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2141,
        title: "N台計算機的最大運作時間",
        slug: "maximum-running-time-of-n-computers",
        rating: 2265,
        difficulty: "Hard",
        subPattern: "資源可行性",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2513,
        title: "最小化兩個數組的最大值",
        slug: "minimize-the-maximum-of-two-arrays",
        rating: 2302,
        difficulty: "Medium",
        subPattern: "數論可行性",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3449,
        title: "最大化最低遊戲分數",
        slug: "maximize-the-minimum-game-score",
        rating: 2748,
        difficulty: "Hard",
        subPattern: "最大化最低分數",
        why: "將值空間搜尋與線性或貪婪可行性檢查分開。",
        order: 6,
        tier: "Challenge Practice",
      },
      {
        id: 2540,
        title: "最小共同價值",
        slug: "minimum-common-value",
        rating: 1250,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1539,
        title: "第 K 個缺失正數",
        slug: "kth-missing-positive-number",
        rating: 1295,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2554,
        title: "從範圍 I 中選擇的最大整數數",
        slug: "maximum-number-of-integers-to-choose-from-a-range-i",
        rating: 1333,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 888,
        title: "公平糖果交換",
        slug: "fair-candy-swap",
        rating: 1334,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3633,
        title: "陸地和水上遊樂設施 I 的最早完成時間",
        slug: "earliest-finish-time-for-land-and-water-rides-i",
        rating: 1343,
        difficulty: "Easy",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 1894,
        title: "找到將更換粉筆的學生",
        slug: "find-the-student-that-will-replace-the-chalk",
        rating: 1356,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 1802,
        title: "有界數組中給定索引處的最大值",
        slug: "maximum-value-at-a-given-index-in-a-bounded-array",
        rating: 1929,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 2411,
        title: "具有最大位元或的最小子數組",
        slug: "smallest-subarrays-with-maximum-bitwise-or",
        rating: 1938,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 3399,
        title: "具有相同字元的最小子字串 II",
        slug: "smallest-substring-with-identical-characters-ii",
        rating: 2376,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "最佳方案是單調是/否檢查的邊界，因此您可以對答案本身（本章的模式）進行二分搜尋。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "feasibility-check",
      "loop-invariant",
      "constraint-driven-thinking",
      "greedy-construction",
    ],
  },
  {
    slug: "monotonic-data-structures",
    title: "單調資料結構",
    group: "Data Structure Patterns",
    icon: "ArrowDownWideNarrow",
    tagline:
      "使用堆疊、雙端佇列和佇列來丟棄主導候選者，同時保留最近或最佳邊界。",
    concept: [
      "隨著掃描的進行，單調結構將候選者按值、索引或優先順序的排序順序保持。",
      "他們刪除了永遠無法成為下一個答案的主導候選人。",
      "它們對於最近的較大/較小、滑動極值、子數組最小貢獻和前綴雙端隊列問題至關重要。",
    ],
    motivation: [
      "暴力掃描從每個索引向左或向右掃描，以找到邊界或最佳候選者。",
      "單調堆疊/雙端佇列精確儲存先前位置中未解決的有用候選者。",
      "每個索引進入和離開一次，這將許多 O(n^2) 邊界搜尋變成了 O(n)。",
    ],
    whenUse: [
      "最近的更大/更小、下一個邊界、視窗最大/最小、具有前綴約束的最短子數組或最小/最大的貢獻。",
      "當新的候選人既接近又不更差時，候選人就變得毫無用處。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "定義結構是遞增還是遞減。",
      "背部流行新元素。",
      "有意對重複項使用嚴格/非嚴格比較。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "每次插入後，該結構僅包含按掃描順序和單調值順序排列的非支配候選者。",
    variants: [
      "下一個更大/更小的單調堆疊。",
      "滑動視窗極值的單調雙端佇列。",
      "最短子數組的前綴和雙端佇列。",
      "具有重複策略的貢獻邊界。",
      "單調佇列優化 DP。",
    ],
    templateKeys: ["monotonic_stack", "monotonic_deque", "contribution_mono"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 862,
        title: "總和至少為 K 的最短子數組",
        slug: "shortest-subarray-with-sum-at-least-k",
        rating: 2307,
        difficulty: "Hard",
        subPattern: "前綴雙端佇列不變式",
        why: "使用單調堆疊或雙端佇列來公開最近的有用邊界。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1673,
        title: "找出最具競爭力的子序列",
        slug: "find-the-most-competitive-subsequence",
        rating: 1802,
        difficulty: "Medium",
        subPattern: "單調堆疊子序列",
        why: "使用單調堆疊或雙端佇列來公開最近的有用邊界。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2454,
        title: "下一個更大元素 IV",
        slug: "next-greater-element-iv",
        rating: 2175,
        difficulty: "Hard",
        subPattern: "兩遍單調堆疊",
        why: "使用單調堆疊或雙端佇列來公開最近的有用邊界。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2398,
        title: "預算內機器人的最大數量",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "視窗+單調雙端隊列",
        why: "使用單調堆疊或雙端佇列來公開最近的有用邊界。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3676,
        title: "計算碗子數組",
        slug: "count-bowl-subarrays",
        rating: 1848,
        difficulty: "Medium",
        subPattern: "單調邊界堆疊",
        why: "使用單調堆疊或雙端佇列來公開最近的有用邊界。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1475,
        title: "商店特別折扣的最終價格",
        slug: "final-prices-with-a-special-discount-in-a-shop",
        rating: 1212,
        difficulty: "Easy",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3523,
        title: "使數組不減",
        slug: "make-array-non-decreasing",
        rating: 1435,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2487,
        title: "從鍊錶中刪除節點",
        slug: "remove-nodes-from-linked-list",
        rating: 1455,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3638,
        title: "最大平衡出貨量",
        slug: "maximum-balanced-shipments",
        rating: 1463,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 2865,
        title: "美麗的塔樓 I",
        slug: "beautiful-towers-i",
        rating: 1519,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 1124,
        title: "最長的良好表現間隔",
        slug: "longest-well-performing-interval",
        rating: 1908,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 1130,
        title: "根據葉子值計算最小成本樹",
        slug: "minimum-cost-tree-from-leaf-values",
        rating: 1919,
        difficulty: "Medium",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 1793,
        title: "好子數組的最大分數",
        slug: "maximum-score-of-a-good-subarray",
        rating: 1946,
        difficulty: "Hard",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 15,
        tier: "Advanced Practice",
      },
      {
        id: 3816,
        title: "刪除重複字元後按字典順序最小的字串",
        slug: "lexicographically-smallest-string-after-deleting-duplicate-characters",
        rating: 2377,
        difficulty: "Hard",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 16,
        tier: "Challenge Practice",
      },
      {
        id: 2334,
        title: "元素大於變化閾值的子數組",
        slug: "subarray-with-elements-greater-than-varying-threshold",
        rating: 2381,
        difficulty: "Hard",
        subPattern: "單調堆疊",
        why: "單調堆疊/雙端佇列維護唯一仍可獲勝的候選者，即本章所建構的結構。",
        order: 17,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "contribution-counting",
      "fix-right-maintain-left",
      "difference-array",
      "dp-transition-design",
    ],
  },
  {
    slug: "coordinate-compression",
    title: "座標壓縮",
    group: "Data Structure Patterns",
    icon: "Blocks",
    tagline: "將大型稀疏值對應到密集排名，同時保留順序比較和相等性。",
    concept: [
      "座標壓縮用等級 1..m 取代原始座標。",
      "它保留了順序和平等，但丟棄了數值之間不相關的差距。",
      "它支援 Fenwick 樹、線段樹、計數數組以及掃描高達 1e9 或更大的值。",
    ],
    motivation: [
      "當值很大時，在座標範圍內進行暴力破解是不可能的。",
      "只有更新、查詢或邊界中出現的座標才會影響答案。",
      "對這些座標進行排序會為資料結構建立緊湊的索引空間。",
    ],
    whenUse: [
      "值很大，但只有 O(n + q) 不同的座標很重要。",
      "需要訂單統計、範圍計數、離線查詢或間隔端點。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "收集每個可以查詢或更新的座標。",
      "排序且獨特。",
      "使用 lower_bound 將原始值對應到排名。",
      "對於間隔，在使用差異語義時包括邊界標記，例如 r + 1。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "對於演算法可能比較或更新的每個座標，排名順序與原始座標順序相同。",
    variants: [
      "Fenwick 的點壓縮。",
      "間隔的端點壓縮。",
      "反轉和不等式計數的值壓縮。",
      "矩形的 2D 壓縮。",
      "半開範圍的哨兵壓縮。",
    ],
    templateKeys: ["coordinate_compression_fenwick", "coordinate_compress"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1649,
        title: "透過指令建立排序數組",
        slug: "create-sorted-array-through-instructions",
        rating: 2208,
        difficulty: "Hard",
        subPattern: "排名插入計數",
        why: "用排名空間取代大座標，同時保留順序和平等。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2426,
        title: "滿足不等式的對的數量",
        slug: "number-of-pairs-satisfying-inequality",
        rating: 2030,
        difficulty: "Hard",
        subPattern: "壓縮不等式計數",
        why: "用排名空間取代大座標，同時保留順序和平等。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1906,
        title: "最小絕對差查詢",
        slug: "minimum-absolute-difference-queries",
        rating: 2147,
        difficulty: "Medium",
        subPattern: "範圍頻率壓縮",
        why: "用排名空間取代大座標，同時保留順序和平等。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2363,
        title: "合併相似的項目",
        slug: "merge-similar-items",
        rating: 1271,
        difficulty: "Easy",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3507,
        title: "排序數組 I 的最小對移除",
        slug: "minimum-pair-removal-to-sort-array-i",
        rating: 1349,
        difficulty: "Easy",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2336,
        title: "無限集中的最小數",
        slug: "smallest-number-in-infinite-set",
        rating: 1375,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1418,
        title: "顯示餐廳中的食品訂單表",
        slug: "display-table-of-food-orders-in-a-restaurant",
        rating: 1485,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2349,
        title: "設計數位容器系統",
        slug: "design-a-number-container-system",
        rating: 1540,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3885,
        title: "設計活動經理",
        slug: "design-event-manager",
        rating: 1548,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1818,
        title: "最小絕對差和",
        slug: "minimum-absolute-sum-difference",
        rating: 1934,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 895,
        title: "最大頻率堆疊",
        slug: "maximum-frequency-stack",
        rating: 2028,
        difficulty: "Hard",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1348,
        title: "每個頻率的推文計數",
        slug: "tweet-counts-per-frequency",
        rating: 2037,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2713,
        title: "矩陣中最大嚴格遞增單元",
        slug: "maximum-strictly-increasing-cells-in-a-matrix",
        rating: 2387,
        difficulty: "Hard",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1825,
        title: "求 MK 平均值",
        slug: "finding-mk-average",
        rating: 2396,
        difficulty: "Hard",
        subPattern: "有序集",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3605,
        title: "陣列最小穩定係數",
        slug: "minimum-stability-factor-of-array",
        rating: 2410,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "大的或稀疏的值被重新映射到密集的等級，以便將數組/位元對它們進行索引，這是本章的預處理步驟。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "offline-query-processing",
      "sweep-line",
      "difference-array",
      "boundary-and-edge-case-thinking",
    ],
  },
  {
    slug: "exchange-argument",
    title: "交換論證",
    group: "Greedy Patterns",
    icon: "GitCompare",
    tagline:
      "透過替換第一個不一致的最優選擇來證明貪婪選擇，而不會使解決方案變得更糟。",
    concept: [
      "交換參數是許多排序和區間貪婪演算法的標準證明。",
      "它顯示一些最優解可以轉化為包含貪婪選擇。",
      "一旦第一個選擇被證明是合理的，相同的論點就會在剩下的子問題上重複。",
    ],
    motivation: [
      "暴力嘗試所有子集、計劃或訂單。",
      "貪心致力於一項局部最好的項目，例如最早完成、最小結束、最大收益或最便宜的安全邊緣。",
      "證明必須顯示每個最優解都可以將其第一個衝突項交換為貪婪項。",
    ],
    whenUse: [
      "此演算法進行排序並重複選取一個局部最佳候選者。",
      "您可以透過兩個解決方案不同的第一個位置來比較它們。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "確定貪婪的選擇。",
      "在此選擇時首先採取不同的最優解。",
      "交換貪婪的選擇並顯示可行性和目標不會惡化。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant: "存在一個最優解，其前綴在每個交換步驟之後與貪婪前綴相符。",
    variants: [
      "最早完成間隔調度。",
      "按當前最佳資源進行堆替換。",
      "按截止日期或結束時間排序。",
      "MST 穿過切口最輕的邊緣。",
      "字典順序第一不同位置。",
    ],
    templateKeys: ["exchange_greedy", "exchange_swap_sort"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1024,
        title: "視訊拼接",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "間隔覆蓋交換",
        why: "需要一個本地選擇，其替代論點可以辯護。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "給花園澆水的最少水龍頭數量",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "最小間隔覆蓋",
        why: "需要一個本地選擇，其替代論點可以辯護。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1705,
        title: "最大吃蘋果數",
        slug: "maximum-number-of-eaten-apples",
        rating: 1930,
        difficulty: "Medium",
        subPattern: "貪婪過期堆疊",
        why: "需要一個本地選擇，其替代論點可以辯護。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1502,
        title: "可以根據序列進行算術級數",
        slug: "can-make-arithmetic-progression-from-sequence",
        rating: 1155,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3842,
        title: "切換燈泡",
        slug: "toggle-light-bulbs",
        rating: 1161,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 3467,
        title: "透過奇偶校驗轉換數組",
        slug: "transform-array-by-parity",
        rating: 1166,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 747,
        title: "數量最多 至少是其他數量的兩倍",
        slug: "largest-number-at-least-twice-of-others",
        rating: 1189,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1122,
        title: "相對排序數組",
        slug: "relative-sort-array",
        rating: 1189,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2418,
        title: "對人進行排序",
        slug: "sort-the-people",
        rating: 1193,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1969,
        title: "數組元素的最小非零積",
        slug: "minimum-non-zero-product-of-the-array-elements",
        rating: 1967,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 1733,
        title: "最少教學人數",
        slug: "minimum-number-of-people-to-teach",
        rating: 1984,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3440,
        title: "重新安排會議以獲得最長的空閒時間 II",
        slug: "reschedule-meetings-for-maximum-free-time-ii",
        rating: 1998,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2463,
        title: "最小總行駛距離",
        slug: "minimum-total-distance-traveled",
        rating: 2454,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1782,
        title: "計算節點對數",
        slug: "count-pairs-of-nodes",
        rating: 2457,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3691,
        title: "最大子數組總值 II",
        slug: "maximum-total-subarray-value-ii",
        rating: 2469,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "透過證明任何反轉都可以無損失地交換（本章的交換論點），證明了最佳順序。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "greedy-stays-ahead",
      "greedy-construction",
      "proof-techniques",
      "cut-property",
    ],
  },
  {
    slug: "greedy-construction",
    title: "貪婪構造",
    group: "Greedy Patterns",
    icon: "PencilRuler",
    tagline: "嘗試填充/可行性引導構建字典或數字上的最佳有效答案。",
    concept: [
      "貪婪構造按首選順序一次建構一個位置的答案。",
      "在每個位置，它都會嘗試最佳候選者，並且僅在剩餘後綴可行時才提交。",
      "它與普通的貪婪不同，因為可行性檢查是選擇的一部分，而不是事後的想法。",
    ],
    motivation: [
      "暴力枚舉每個字串、陣列、排列或序列。",
      "如果字典順序或從高到低的優先順序決定了最早的不同位置，我們可以按該順序嘗試候選者。",
      "第一個仍然允許完成的候選者可以安全地提交。",
    ],
    whenUse: [
      "依字典順序建構最小/最大答案，建立數字/位元/數組，或選擇每個位置的最小有效候選者。",
      "還有剩餘資源，例如總和、頻率、所需字母或遮罩約束。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "按優先順序迭代位置。",
      "從最好到最差嘗試候選人。",
      "檢查剩餘位置是否仍能滿足所有限制。",
      "提交並更新剩餘資源。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "修復每個前綴後，存在該前綴的最佳答案，並且其餘約束仍然允許至少一個完成。",
    variants: [
      "按字典順序排列的最小字串。",
      "字典順序上最大的序列。",
      "逐位建構。",
      "剩餘總和或計數界限。",
      "基於頻率的建構。",
      "透過貪婪試驗填充解決回溯問題。",
    ],
    templateKeys: [
      "greedy_builder",
      "greedy_lexicographic",
      "remaining_sum_construction",
      "frequency_construction",
    ],
    complexity: [
      "如果每個職位都嘗試A個候選人，可行性為F，複雜度為O(n * A * F)；堆疊結構通常是 O(n)。",
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "使用可行性檢查是必要的，但還不夠。",
      "為了達到目標，以錯誤的順序嘗試候選人。",
      "提交後忘記更新剩餘配額。",
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1718,
        title: "構造字典序上最大的有效序列",
        slug: "construct-the-lexicographically-largest-valid-sequence",
        rating: 2080,
        difficulty: "Medium",
        subPattern: "試裝順序",
        why: "按位置建立答案位置，同時證明字尾仍然可行。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2030,
        title: "出現字母的最小 K 長度子序列",
        slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter",
        rating: 2562,
        difficulty: "Hard",
        subPattern: "配額貪婪堆疊",
        why: "按位置建立答案位置，同時證明字尾仍然可行。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3302,
        title: "找出按字典順序最小的有效序列",
        slug: "find-the-lexicographically-smallest-valid-sequence",
        rating: 2474,
        difficulty: "Medium",
        subPattern: "字典編排的可行性",
        why: "按位置建立答案位置，同時證明字尾仍然可行。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2357,
        title: "透過減去等量使數組為零",
        slug: "make-array-zero-by-subtracting-equal-amounts",
        rating: 1225,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2864,
        title: "最大奇二進制數",
        slug: "maximum-odd-binary-number",
        rating: 1238,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2078,
        title: "最遠的兩座不同顏色的房子",
        slug: "two-furthest-houses-with-different-colors",
        rating: 1241,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3216,
        title: "交換後依字典順序最小的字串",
        slug: "lexicographically-smallest-string-after-a-swap",
        rating: 1243,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3402,
        title: "最少的操作使列嚴格增加",
        slug: "minimum-operations-to-make-columns-strictly-increasing",
        rating: 1246,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1903,
        title: "字串中最大的奇數",
        slug: "largest-odd-number-in-string",
        rating: 1249,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3002,
        title: "刪除後集合的最大大小",
        slug: "maximum-size-of-a-set-after-removals",
        rating: 1917,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 1727,
        title: "具有重排的最大子矩陣",
        slug: "largest-submatrix-with-rearrangements",
        rating: 1927,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1798,
        title: "您可以產生的連續值的最大數量",
        slug: "maximum-number-of-consecutive-values-you-can-make",
        rating: 1931,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3260,
        title: "找出可被 K 整除的最大回文",
        slug: "find-the-largest-palindrome-divisible-by-k",
        rating: 2370,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3680,
        title: "產生時間表",
        slug: "generate-schedule",
        rating: 2378,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 757,
        title: "設定交叉點大小至少 2",
        slug: "set-intersection-size-at-least-two",
        rating: 2379,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "透過反覆提交局部最佳安全選擇來建立答案解決了這個問題，即本章的建構風格。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "目標是否比較最早的不同位置？",
      "我可以便宜地決定是否可以完成部分前綴嗎？",
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "feasibility-check",
      "exchange-argument",
      "greedy-stays-ahead",
      "state-design",
    ],
  },
  {
    slug: "greedy-stays-ahead",
    title: "貪婪保持領先",
    group: "Greedy Patterns",
    icon: "TrendingUp",
    tagline: "證明在相同數量的選擇之後，貪婪邊界總是至少與任何替代方案一樣好。",
    concept: [
      "貪婪保持領先通過比較每一步後的前沿來證明進步。",
      "常見於區間覆蓋、跳躍可及性、加油和資源擴展問題。",
      "該演算法在所有目前可達的選擇中選擇最大化下一個邊界的選項。",
    ],
    motivation: [
      "蠻力會嘗試每一個跳躍序列、間隔或資源。",
      "優化的貪心演算法會處理目前可用的所有選擇，並致力於選擇具有最遠範圍或最佳未來容量的選擇。",
      "該證明比較了具有相同步驟數的任何解決方案可以達到的程度。",
    ],
    whenUse: [
      "需要最少次數的跳躍/間隔/加油才能達到目標。",
      "可用候選人由目前覆蓋範圍定義，每個候選人都會擴展覆蓋範圍。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "維持現有邊界。",
      "從邊境之前或邊境開始掃描所有候選人。",
      "提交下一個邊界最遠的候選人。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "在 k 個貪婪選擇之後，貪婪可達邊界至少與使用 k 個選擇的任何解決方案的邊界一樣遠。",
    variants: [
      "跳躍遊戲風格達到。",
      "間隔蓋。",
      "最少的水龍頭。",
      "以最大堆加油。",
      "批次目前可達的事件。",
    ],
    templateKeys: ["interval_cover_greedy", "exchange_greedy"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1024,
        title: "視訊拼接",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "間隔覆蓋交換",
        why: "使用的邊界在相同數量的步驟後永遠不會落後於任何替代方案。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "給花園澆水的最少水龍頭數量",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "最小間隔覆蓋",
        why: "使用的邊界在相同數量的步驟後永遠不會落後於任何替代方案。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1705,
        title: "最大吃蘋果數",
        slug: "maximum-number-of-eaten-apples",
        rating: 1930,
        difficulty: "Medium",
        subPattern: "貪婪過期堆疊",
        why: "使用的邊界在相同數量的步驟後永遠不會落後於任何替代方案。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2279,
        title: "滿載岩石的最大袋數",
        slug: "maximum-bags-with-full-capacity-of-rocks",
        rating: 1249,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 1833,
        title: "最大冰淇淋棒數",
        slug: "maximum-ice-cream-bars",
        rating: 1253,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2144,
        title: "以折扣價購買糖果的最低成本",
        slug: "minimum-cost-of-buying-candies-with-discount",
        rating: 1261,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1736,
        title: "透過替換隱藏數字的最新時間",
        slug: "latest-time-by-replacing-hidden-digits",
        rating: 1264,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1282,
        title: "根據人員所屬的群體規模將他們分組",
        slug: "group-the-people-given-the-group-size-they-belong-to",
        rating: 1267,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1005,
        title: "K 次否定後最大化數組的和",
        slug: "maximize-sum-of-array-after-k-negations",
        rating: 1275,
        difficulty: "Easy",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3858,
        title: "網格的最小位元或",
        slug: "minimum-bitwise-or-from-grid",
        rating: 1947,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3891,
        title: "最小增加以最大化特殊指數",
        slug: "minimum-increase-to-maximize-special-indices",
        rating: 1953,
        difficulty: "Medium",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2350,
        title: "滾動的最短不可能序列",
        slug: "shortest-impossible-sequence-of-rolls",
        rating: 1961,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1388,
        title: "3n 片披薩",
        slug: "pizza-with-3n-slices",
        rating: 2410,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2663,
        title: "字典順序上最小的美麗字符串",
        slug: "lexicographically-smallest-beautiful-string",
        rating: 2416,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1703,
        title: "K 個連續的最小相鄰交換",
        slug: "minimum-adjacent-swaps-for-k-consecutive-ones",
        rating: 2467,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "貪婪的選擇可以證明領先於任何替代前綴，這是本章訓練的證明風格。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "exchange-argument",
      "feasibility-check",
      "proof-techniques",
      "binary-search-on-answer",
    ],
  },
  {
    slug: "cut-property",
    title: "削減財產",
    group: "Graph Patterns",
    icon: "Network",
    tagline: "使用圖割來證明 MST、連結性和橋式推理中安全邊選擇的合理性。",
    concept: [
      "割屬性表示穿過割的最輕邊對於某些最小生成樹是安全的。",
      "更一般地說，剪切推理將已連接的組件與其餘組件分開，並詢問必須考慮哪條邊。",
      "它是 Kruskal、Prim、臨界邊緣測試和許多 DSU 閾值問題的基礎。",
    ],
    motivation: [
      "對所有生成樹進行暴力破解是不可能的。",
      "Kruskal對邊進行排序，只考慮一條邊是否連接兩個目前組件。",
      "切割特性證明，採用下一個最輕的交叉邊不會阻礙最優性。",
    ],
    whenUse: [
      "最小生成樹、關鍵邊、連接所有點、按邊權重/值排序的 DSU 或圖閾值。",
      "需要決定添加邊是安全的還是多餘的。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "按權重或閾值對候選邊進行排序。",
      "使用 DSU 維護連接的組件。",
      "接受與組件切割交叉的邊；拒絕一個組件內的邊緣。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "對於每個接受的邊緣，都有一個切口將其兩個組件分開，其中該邊緣是最小可用交叉邊緣。",
    variants: [
      "克魯斯卡爾 MST。",
      "原始 MST。",
      "關鍵邊緣和偽關鍵邊緣。",
      "DSU 按值閾值。",
      "連接丟失的橋接/前沿推理。",
    ],
    templateKeys: ["mst_kruskal", "mst_prim"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1584,
        title: "連接所有點的最小成本",
        slug: "min-cost-to-connect-all-points",
        rating: 1858,
        difficulty: "Medium",
        subPattern: "MST幾何",
        why: "應用圖切割推理：所選邊對於每個穿過切割的最佳解決方案都是安全的。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1489,
        title: "在最小生成樹中尋找關鍵邊和偽關鍵邊",
        slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
        rating: 2572,
        difficulty: "Hard",
        subPattern: "MST 削減財產",
        why: "應用圖切割推理：所選邊對於每個穿過切割的最佳解決方案都是安全的。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1579,
        title: "刪除最大邊數以保持圖表完全可遍歷",
        slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable",
        rating: 2132,
        difficulty: "Hard",
        subPattern: "共享 DSU 切割選擇",
        why: "應用圖切割推理：所選邊對於每個穿過切割的最佳解決方案都是安全的。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 997,
        title: "找到鎮法官",
        slug: "find-the-town-judge",
        rating: 1202,
        difficulty: "Easy",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3898,
        title: "求每個頂點的度數",
        slug: "find-the-degree-of-each-vertex",
        rating: 1202,
        difficulty: "Easy",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 1791,
        title: "找到星圖的中心",
        slug: "find-center-of-star-graph",
        rating: 1287,
        difficulty: "Easy",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 797,
        title: "從來源到目標的所有路徑",
        slug: "all-paths-from-source-to-target",
        rating: 1383,
        difficulty: "Medium",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 841,
        title: "鑰匙和房間",
        slug: "keys-and-rooms",
        rating: 1412,
        difficulty: "Medium",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2374,
        title: "邊緣得分最高的節點",
        slug: "node-with-highest-edge-score",
        rating: 1419,
        difficulty: "Medium",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2608,
        title: "圖中的最短週期",
        slug: "shortest-cycle-in-a-graph",
        rating: 1904,
        difficulty: "Hard",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 928,
        title: "最大限度地減少惡意軟體傳播 II",
        slug: "minimize-malware-spread-ii",
        rating: 1985,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 765,
        title: "情侶牽手",
        slug: "couples-holding-hands",
        rating: 1999,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3547,
        title: "圖中邊值的最大和",
        slug: "maximum-sum-of-edge-values-in-a-graph",
        rating: 2344,
        difficulty: "Hard",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2577,
        title: "存取網格中的單元的最短時間",
        slug: "minimum-time-to-visit-a-cell-in-a-grid",
        rating: 2382,
        difficulty: "Hard",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1928,
        title: "及時到達目的地的最低成本",
        slug: "minimum-cost-to-reach-destination-in-time",
        rating: 2413,
        difficulty: "Hard",
        subPattern: "graph",
        why: "安全邊緣/剪切論證證明了連通性或跨越選擇的合理性，即本章的正確性想法。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "exchange-argument",
      "offline-query-processing",
      "proof-techniques",
      "state-design",
    ],
  },
  {
    slug: "dp-state-design",
    title: "DP狀態設計",
    group: "Dynamic Programming",
    icon: "Layers",
    tagline: "定義足夠的、最小的和有序的計算維度 DP。",
    concept: [
      "DP 狀態設計選擇子問題的涵義。",
      "國家必須包括所有可以改變未來選擇的事實，並排除不相關或可推導的事實。",
      "強狀態定義通常比最終的遞歸語法更重要。",
    ],
    motivation: [
      "蠻力探索所有選擇歷史。",
      "DP 合併在狀態定義下具有相同未來行為的歷史。",
      "只有當合併的歷史真正等效時，最佳化才有效。",
    ],
    whenUse: [
      "重疊子問題，前綴、間隔、行、樹、計數或遮罩的選擇。",
      "您可以描述部分物件的答案並擴展它。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "用一句話寫出 dp 狀態。",
      "列出允許進入或離開該狀態的轉換。",
      "選擇依賴關係已知的評估順序。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "同一 DP 狀態表示的所有歷史除了狀態中儲存的累積值外，都具有相同的最優未來值。",
    variants: [
      "依索引線性 DP。",
      "按單元格和方向劃分網格 DP。",
      "依節點和選定狀態建立樹 DP。",
      "左/右間隔 DP。",
      "按計數/最後一組的多維 DP。",
    ],
    templateKeys: ["dp_state", "dp_state_machine"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1269,
        title: "走完幾步後留在同一個地方的方式數",
        slug: "number-of-ways-to-stay-in-the-same-place-after-some-steps",
        rating: 1854,
        difficulty: "Hard",
        subPattern: "位置 DP",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1473,
        title: "油漆屋 III",
        slug: "paint-house-iii",
        rating: 2056,
        difficulty: "Hard",
        subPattern: "多維狀態",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1937,
        title: "最大點數與成本",
        slug: "maximum-number-of-points-with-cost",
        rating: 2106,
        difficulty: "Medium",
        subPattern: "行DP優化",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2209,
        title: "鋪地毯後最少白瓷磚",
        slug: "minimum-white-tiles-after-covering-with-carpets",
        rating: 2106,
        difficulty: "Hard",
        subPattern: "覆蓋DP",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2312,
        title: "賣木頭",
        slug: "selling-pieces-of-wood",
        rating: 2363,
        difficulty: "Hard",
        subPattern: "2D分割DP",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 1000,
        title: "合併寶石的最低成本",
        slug: "minimum-cost-to-merge-stones",
        rating: 2423,
        difficulty: "Hard",
        subPattern: "區間DP狀態",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 6,
        tier: "Challenge Practice",
      },
      {
        id: 3742,
        title: "網格中的最大路徑分數",
        slug: "maximum-path-score-in-a-grid",
        rating: 1804,
        difficulty: "Medium",
        subPattern: "電網DP狀態",
        why: "測試所選的 DP 尺寸是否足夠且最小。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 309,
        title: "買賣股票的最佳時機（有冷卻時間）",
        slug: "best-time-to-buy-and-sell-stock-with-cooldown",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "保持/現金/冷卻狀態機",
        why: "三種顯式狀態使轉換變得明顯且最小。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1186,
        title: "一次刪除的最大子數組和",
        slug: "maximum-subarray-sum-with-one-deletion",
        rating: 1799,
        difficulty: "Medium",
        subPattern: "已刪除/未刪除狀態",
        why: "第二個布林狀態維度擷取可選刪除。",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 1137,
        title: "N 個特里波那契數",
        slug: "n-th-tribonacci-number",
        rating: 1143,
        difficulty: "Easy",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3857,
        title: "分裂成的最低成本",
        slug: "minimum-cost-to-split-into-ones",
        rating: 1322,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 746,
        title: "爬樓梯的最低成本",
        slug: "min-cost-climbing-stairs",
        rating: 1358,
        difficulty: "Easy",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 978,
        title: "最長湍流子陣",
        slug: "longest-turbulent-subarray",
        rating: 1393,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 3122,
        title: "滿足條件的最少操作次數",
        slug: "minimum-number-of-operations-to-satisfy-conditions",
        rating: 1905,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 2188,
        title: "完成比賽的最短時間",
        slug: "minimum-time-to-finish-the-race",
        rating: 2315,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "選擇正確的 DP 狀態使子問題獨立是關鍵，也是本章的重點。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "dp-transition-design",
      "state-design",
      "state-compression",
      "proof-techniques",
    ],
  },
  {
    slug: "dp-transition-design",
    title: "DP 過渡設計",
    group: "Dynamic Programming",
    icon: "GitBranch",
    tagline: "從最後的決策、分割點、先前的狀態或選定的邊界導出轉換。",
    concept: [
      "DP 轉換解釋瞭如何從較小的狀態建立較大的狀態。",
      "好的過渡來自最後一個動作、第一次剪下、選擇的中間部分或分隔獨立子問題的邊界。",
      "遞歸是可執行形式的最佳子結構的證明。",
    ],
    motivation: [
      "蠻力遞歸地嘗試所有決策序列。",
      "DP 保留相同的分支選擇，但按狀態記憶或製表。",
      "最佳化通常來自於減少具有前綴最大值、單調隊列或凸性的轉換候選，但前提是基礎遞歸正確。",
    ],
    whenUse: [
      "您了解狀態，但不確定狀態如何連線。",
      "有一個自然的最後一個操作、分割點、所選項目或上一個群組。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "選擇轉換所有者：上一個操作、下一個操作、分割或透視。",
      "確保每個有效的解決方案至少出現在一次轉換中。",
      "確保沒有任何轉換使用包含目前決策兩次的狀態。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant: "一個州的最優值恰好是從較小州到該州的所有法律最終決策中最好的。",
    variants: [
      "進行/跳過轉換。",
      "分區過渡。",
      "間隔分割。",
      "樹子合併。",
      "狀態壓縮轉換。",
      "具有最佳前綴的最佳化轉換。",
    ],
    templateKeys: ["dp_transition", "dp_knapsack"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1547,
        title: "砍一根棍子的最低成本",
        slug: "minimum-cost-to-cut-a-stick",
        rating: 2116,
        difficulty: "Hard",
        subPattern: "區間DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1690,
        title: "石頭遊戲七",
        slug: "stone-game-vii",
        rating: 1951,
        difficulty: "Medium",
        subPattern: "遊戲 DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1770,
        title: "執行乘法運算的最高分數",
        slug: "maximum-score-from-performing-multiplication-operations",
        rating: 2068,
        difficulty: "Hard",
        subPattern: "兩端DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1872,
        title: "石頭遊戲八",
        slug: "stone-game-viii",
        rating: 2440,
        difficulty: "Hard",
        subPattern: "後綴過渡 DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 1959,
        title: "K 大小調整操作浪費的總空間最少",
        slug: "minimum-total-space-wasted-with-k-resizing-operations",
        rating: 2310,
        difficulty: "Medium",
        subPattern: "隔間DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3193,
        title: "計算倒轉次數",
        slug: "count-the-number-of-inversions",
        rating: 2266,
        difficulty: "Hard",
        subPattern: "反轉計數 DP",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 3743,
        title: "最大化循環分區分數",
        slug: "maximize-cyclic-partition-score",
        rating: 3125,
        difficulty: "Hard",
        subPattern: "循環分區轉換",
        why: "專注於從最後的決策、分割或區間邊界導出轉換。",
        order: 7,
        tier: "Challenge Practice",
      },
      {
        id: 1043,
        title: "劃分數組以獲得最大和",
        slug: "partition-array-for-maximum-sum",
        rating: 1916,
        difficulty: "Medium",
        subPattern: "最後一段轉換",
        why: "Transition 列舉最後一段的長度。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 132,
        title: "回文分區 II",
        slug: "palindrome-partitioning-ii",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "剪切位置轉換",
        why: "dp[i] 在每個有效的最後回文切割上轉換。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1668,
        title: "最大重複子字串",
        slug: "maximum-repeating-substring",
        rating: 1396,
        difficulty: "Easy",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 788,
        title: "旋轉數字",
        slug: "rotated-digits",
        rating: 1397,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 3751,
        title: "範圍 I 中數字的總波動度",
        slug: "total-waviness-of-numbers-in-range-i",
        rating: 1404,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 2110,
        title: "股票的平滑下跌週期數",
        slug: "number-of-smooth-descent-periods-of-a-stock",
        rating: 1408,
        difficulty: "Medium",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 2585,
        title: "賺取積分的方式",
        slug: "number-of-ways-to-earn-points",
        rating: 1910,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 2827,
        title: "範圍內美麗整數的數量",
        slug: "number-of-beautiful-integers-in-the-range",
        rating: 2324,
        difficulty: "Hard",
        subPattern: "動態規劃",
        why: "最困難的部分是本章訓練的狀態之間的轉換遞歸。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "dp-state-design",
      "state-compression",
      "enumerate-pivot-middle",
      "monotonic-data-structures",
    ],
  },
  {
    slug: "offline-query-processing",
    title: "離線查詢處理",
    group: "Range Query and Offline Techniques",
    icon: "CalendarRange",
    tagline:
      "對帶有事件的查詢進行重新排序，因此昂貴的更新發生一次，並且答案由原始索引恢復。",
    concept: [
      "離線處理在閱讀所有查詢後回答查詢，從而允許不同於輸入順序的有用順序。",
      "按閾值、座標、時間或區塊排序可以將重複工作轉換為增量更新。",
      "答案數組會以原始查詢索引儲存結果，因此保留輸出順序。",
    ],
    motivation: [
      "線上暴力破解獨立處理每個查詢。",
      "如果查詢共享閾值或掃描座標，請按排序順序處理它們並維護活動的資料結構。",
      "每個項目都會進入或離開結構幾次，而不是每次查詢一次。",
    ],
    whenUse: [
      "所有查詢都是預先知道的。",
      "查詢條件有閾值、座標、值限製或時間段。",
      "該聲明不需要立即在線答复。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "選擇使更新單調的排序鍵。",
      "儲存原始查詢索引。",
      "在回答查詢時在事件中移動指標。",
      "使用 Fenwick、DSU、堆疊或有序集作為活動狀態。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant: "在以離線順序回答查詢之前，活動結構恰好包含滿足該查詢鍵的物件。",
    variants: [
      "按值閾值對查詢進行排序。",
      "透過邊緣限制使 DSU 離線。",
      "在座標上掃線。",
      "Mo 演算法由區塊組成。",
      "按時間段回滾 DSU。",
    ],
    templateKeys: ["offline_fenwick", "coordinate_compression_fenwick"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 2070,
        title: "每個查詢最漂亮的項目",
        slug: "most-beautiful-item-for-each-query",
        rating: 1724,
        difficulty: "Medium",
        subPattern: "排序查詢掃描",
        why: "對事件和查詢進行排序，以便更新一次，並且查詢狀態很便宜。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1851,
        title: "包含每個查詢的最小間隔",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "離線區間查詢",
        why: "對事件和查詢進行排序，以便更新一次，並且查詢狀態很便宜。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1697,
        title: "檢查邊長有限路徑是否存在",
        slug: "checking-existence-of-edge-length-limited-paths",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "離線DSU閾值",
        why: "對事件和查詢進行排序，以便更新一次，並且查詢狀態很便宜。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3477,
        title: "水果放進籃子II",
        slug: "fruits-into-baskets-ii",
        rating: 1296,
        difficulty: "Easy",
        subPattern: "線段樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2913,
        title: "子數組不同元素平方和 I",
        slug: "subarrays-distinct-element-sum-of-squares-i",
        rating: 1297,
        difficulty: "Easy",
        subPattern: "線段樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 1409,
        title: "帶鍵的排列查詢",
        slug: "queries-on-a-permutation-with-key",
        rating: 1335,
        difficulty: "Medium",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 2424,
        title: "最長上傳前綴",
        slug: "longest-uploaded-prefix",
        rating: 1604,
        difficulty: "Medium",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2080,
        title: "範圍頻率查詢",
        slug: "range-frequency-queries",
        rating: 1702,
        difficulty: "Medium",
        subPattern: "線段樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3380,
        title: "帶點約束的最大面積矩形 I",
        slug: "maximum-area-rectangle-with-point-constraints-i",
        rating: 1743,
        difficulty: "Medium",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1964,
        title: "找到每個位置的最長有效障礙路線",
        slug: "find-the-longest-valid-obstacle-course-at-each-position",
        rating: 1933,
        difficulty: "Hard",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 2250,
        title: "計算包含每個點的矩形數量",
        slug: "count-number-of-rectangles-containing-each-point",
        rating: 1998,
        difficulty: "Medium",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3209,
        title: "具有 AND 值 K 的子數組的數量",
        slug: "number-of-subarrays-with-and-value-of-k",
        rating: 2050,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3515,
        title: "加權樹中的最短路徑",
        slug: "shortest-path-in-a-weighted-tree",
        rating: 2312,
        difficulty: "Hard",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 2940,
        title: "找到愛麗絲和鮑伯可以見面的建築物",
        slug: "find-building-where-alice-and-bob-can-meet",
        rating: 2327,
        difficulty: "Hard",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1505,
        title: "最多 K 次相鄰數字交換後的最小可能整數",
        slug: "minimum-possible-integer-after-at-most-k-adjacent-swaps-on-digits",
        rating: 2337,
        difficulty: "Hard",
        subPattern: "芬威克樹",
        why: "透過按鍵重新排序後回答問題，然後從頭開始回答每個問題，這是本章的離線想法。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "coordinate-compression",
      "sweep-line",
      "cut-property",
      "difference-array",
    ],
  },
  {
    slug: "sweep-line",
    title: "掃線",
    group: "Range Query and Offline Techniques",
    icon: "CalendarRange",
    tagline: "將間隔、點、時間和矩形轉換為具有活動集的排序事件。",
    concept: [
      "掃描線按座標順序處理事件並維護穿過當前座標的活動物件。",
      "它將成對間隔或幾何檢查轉換為活動狀態的開始/結束更新和查詢。",
      "活動狀態可以是計數器、堆、有序集、Fenwick 樹或段樹。",
    ],
    motivation: [
      "蠻力將每個點與每個區間或每個矩形與每個座標進行比較。",
      "只有當某件事開始、結束或提出查詢時，事件才有意義。",
      "對這些事件進行排序可以讓演算法精確地在答案可能改變的座標處更新狀態。",
    ],
    whenUse: [
      "區間、預訂、會議室、盛開的花朵、矩形、範圍覆蓋的點或離線座標查詢。",
      "需要最大重疊、活動最小/最大或面積/覆蓋範圍。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "設計開始、結束和查詢事件。",
      "按照故意的平局規則進行排序。",
      "應用所有應影響當前座標的事件後保持活動狀態。",
      "壓縮大型稀疏幾何圖形的座標。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "當掃描到達座標 x 時，資料結構恰好包含在所選邊界約定下在 x 處活動的物件。",
    variants: [
      "間隔重疊計數。",
      "有堆的會議室。",
      "範圍新增/點查詢。",
      "矩形聯合區域。",
      "區間覆蓋的點。",
      "使用有序集或線段樹進行掃描。",
      "離線查詢掃一掃。",
    ],
    templateKeys: [
      "sweep_events",
      "sweep_difference",
      "sweep_heap",
      "sweep_compressed_fenwick",
    ],
    complexity: [
      "對事件進行排序的成本為 O((n + q) log(n + q))；主動更新通常花費 O(log n) 或簡單計數器的 O(1) 成本。",
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "錯誤的開始/結束決勝局。",
      "混合包容性和排他性端點。",
      "忘記為整數閉區間加 r + 1。",
      "區域或座標產品溢出。",
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1851,
        title: "包含每個查詢的最小間隔",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "離線區間查詢",
        why: "將間隔或幾何變化表示為一個有序座標上的事件。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2251,
        title: "盛開的花朵數量",
        slug: "number-of-flowers-in-full-bloom",
        rating: 2022,
        difficulty: "Hard",
        subPattern: "事件掃描邊界",
        why: "將間隔或幾何變化表示為一個有序座標上的事件。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 850,
        title: "矩形區域二",
        slug: "rectangle-area-ii",
        rating: 2236,
        difficulty: "Hard",
        subPattern: "矩形聯合掃描",
        why: "將間隔或幾何變化表示為一個有序座標上的事件。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2276,
        title: "計算區間內的整數",
        slug: "count-integers-in-intervals",
        rating: 2222,
        difficulty: "Hard",
        subPattern: "動態區間覆蓋",
        why: "將間隔或幾何變化表示為一個有序座標上的事件。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2503,
        title: "網格查詢的最大點數",
        slug: "maximum-number-of-points-from-grid-queries",
        rating: 2196,
        difficulty: "Hard",
        subPattern: "網格查詢掃描",
        why: "將間隔或幾何變化表示為一個有序座標上的事件。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 2848,
        title: "與汽車相交的點",
        slug: "points-that-intersect-with-cars",
        rating: 1230,
        difficulty: "Easy",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1893,
        title: "檢查某個範圍內的所有整數是否都被覆蓋",
        slug: "check-if-all-the-integers-in-a-range-are-covered",
        rating: 1307,
        difficulty: "Easy",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 729,
        title: "我的日曆一",
        slug: "my-calendar-i",
        rating: 0,
        difficulty: "Medium",
        subPattern: "有序集",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1854,
        title: "人口最多年份",
        slug: "maximum-population-year",
        rating: 1370,
        difficulty: "Easy",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1288,
        title: "刪除覆蓋的區間",
        slug: "remove-covered-intervals",
        rating: 1375,
        difficulty: "Medium",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 763,
        title: "分區標籤",
        slug: "partition-labels",
        rating: 1443,
        difficulty: "Medium",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 699,
        title: "掉落的方塊",
        slug: "falling-squares",
        rating: 0,
        difficulty: "Hard",
        subPattern: "有序集",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1235,
        title: "作業調度的最大利潤",
        slug: "maximum-profit-in-job-scheduling",
        rating: 2023,
        difficulty: "Hard",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 2589,
        title: "完成所有任務的最短時間",
        slug: "minimum-time-to-complete-all-tasks",
        rating: 2381,
        difficulty: "Hard",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3454,
        title: "獨立方塊 II",
        slug: "separate-squares-ii",
        rating: 2671,
        difficulty: "Hard",
        subPattern: "線掃描",
        why: "對事件進行排序並掃描一條線可以增量地維持活動狀態，這是本章的技術。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "答案只能在事件座標處改變嗎？",
      "查詢座標處到底什麼是活動的？",
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "difference-array",
      "coordinate-compression",
      "offline-query-processing",
      "boundary-and-edge-case-thinking",
    ],
  },
  {
    slug: "state-compression",
    title: "狀態壓縮",
    group: "Bit and Math Patterns",
    icon: "Binary",
    tagline: "將子集、分配、奇偶校驗或小資源編碼為 DP 或圖形搜尋的位元遮罩。",
    concept: [
      "狀態壓縮將一組布林選擇映射到整數遮罩的位元中。",
      "它使指數搜索變得明確，並允許記憶掩碼而不是整個歷史。",
      "當 n 約為 15 到 22 時，或僅需要追蹤少數獨立特徵時，它是實用的。",
    ],
    motivation: [
      "蠻力遞歸地探索所有分配或子集。",
      "許多歷史記錄都會導致相同的已使用集、剩餘集或已存取集。",
      "掩碼狀態透過設定、清除或迭代位元來合併這些歷史和轉換。",
    ],
    whenUse: [
      "n 很小，通常 <= 20。",
      "需要存取所有節點、分配人員/項目、分組或追蹤使用的元素。",
      "未來取決於集合，而不是用於獲取它的順序。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "將所選元素表示為遮罩位元。",
      "如果可能，請使用 popcount 派生下一個索引。",
      "迭代分配的未設定位元或分區的子遮罩。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "所有具有相同面具的歷史都有相同的剩餘選擇；該遮罩的最佳值就足夠了。",
    variants: [
      "賦值 DP。",
      "子集分區 DP。",
      "BFS 透過節點 + 遮罩。",
      "子掩碼枚舉。",
      "SOS 式的轉變並在中間相遇。",
    ],
    templateKeys: ["bitmask_dp", "state_bfs", "subset_enumeration"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 1681,
        title: "最小不相容性",
        slug: "minimum-incompatibility",
        rating: 2390,
        difficulty: "Hard",
        subPattern: "分區遮罩 DP",
        why: "使用位元遮罩使指數狀態變得明確且可記憶。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1655,
        title: "分配重複整數",
        slug: "distribute-repeating-integers",
        rating: 2307,
        difficulty: "Hard",
        subPattern: "客戶子集 DP",
        why: "使用位元遮罩使指數狀態變得明確且可記憶。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1879,
        title: "兩個數組的最小異或和",
        slug: "minimum-xor-sum-of-two-arrays",
        rating: 2145,
        difficulty: "Hard",
        subPattern: "賦值掩碼 DP",
        why: "使用位元遮罩使指數狀態變得明確且可記憶。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1947,
        title: "最大相容性分數總和",
        slug: "maximum-compatibility-score-sum",
        rating: 1704,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3376,
        title: "最短開鎖時間 I",
        slug: "minimum-time-to-break-locks-i",
        rating: 1793,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2002,
        title: "兩個回文子序列的長度的最大乘積",
        slug: "maximum-product-of-the-length-of-two-palindromic-subsequences",
        rating: 1869,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1255,
        title: "字母組成的最高分單字",
        slug: "maximum-score-words-formed-by-letters",
        rating: 1882,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2305,
        title: "Cookie 的公平分配",
        slug: "fair-distribution-of-cookies",
        rating: 1887,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 464,
        title: "我能贏嗎",
        slug: "can-i-win",
        rating: 0,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 996,
        title: "方形陣列的數量",
        slug: "number-of-squareful-arrays",
        rating: 1932,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 805,
        title: "具有相同平均值的分割數組",
        slug: "split-array-with-same-average",
        rating: 1983,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1986,
        title: "完成任務的最少工作會話數",
        slug: "minimum-number-of-work-sessions-to-finish-the-tasks",
        rating: 1995,
        difficulty: "Medium",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1617,
        title: "計算城市之間最大距離的子樹",
        slug: "count-subtrees-with-max-distance-between-cities",
        rating: 2309,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3444,
        title: "數組中目標倍數的最小增量",
        slug: "minimum-increments-for-target-multiples-in-an-array",
        rating: 2337,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3575,
        title: "最大良好子樹分數",
        slug: "maximum-good-subtree-score",
        rating: 2360,
        difficulty: "Hard",
        subPattern: "位元遮罩狀態",
        why: "小集合的子集被編碼為位元遮罩，因此指數狀態變成數組索引，這是本章的想法。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "dp-state-design",
      "dp-transition-design",
      "state-design",
      "enumeration-strategy",
    ],
  },
  {
    slug: "loop-invariant",
    title: "循環不變性",
    group: "Advanced Mixed Patterns",
    icon: "GitBranch",
    tagline: "編寫循環合約，使二分搜尋、視窗、堆疊和 DP 掃描機械地正確。",
    concept: [
      "循環不變量是在第一次迭代之前、每次迭代之後和終止時保持的契約。",
      "它是掃描和搜尋正確性的實現級版本。",
      "當每一行都保留或恢復不變量時，硬錯誤變得更容易發現。",
    ],
    motivation: [
      "蠻力通常沒有壓縮循環狀態：直接檢查每個候選者。",
      "最佳化循環將許多候選壓縮為幾個變量，因此正確性取決於這些變數的含義。",
      "這個不變量解釋了為什麼在 low、left、stack top 或 dp 索引處終止會回傳正確的答案。",
    ],
    whenUse: [
      "二分搜尋邊界、兩個指針、單調結構、貪婪邊界或滾動 DP。",
      "您不確定更新後低/高/左/右意味著什麼。",
      "直接枚舉很清楚，但一維成本太高。",
      "約束建議 O(n log n)、O(n)、O(q log n) 或受控指數狀態。",
      "在對一個物件進行排序、掃描、分組或修復後，可以逐步更新答案。",
    ],
    coreIdea: [
      "狀態初始化使不變量成立。",
      "每個分支都保留不變量。",
      "終止加上不變量意味著後置條件。",
      "命名正在列舉或提交的物件。",
      "命名總結所有先前工作的狀態。",
      "當不變量顯示狀態有效時準確更新答案。",
      "在編碼之前編寫邊界策略：包含結束、重複、標記和空範圍。",
    ],
    invariant:
      "初始化、維護和終止都成立：循環開始時有效，每次迭代都保持有效性，最終狀態直接產生答案。",
    variants: [
      "二分查找假/真分區。",
      "滑動視窗有效範圍。",
      "單調堆疊未解決的候選者。",
      "貪婪的邊境。",
      "DP 掃描前一行/狀態。",
    ],
    templateKeys: ["loop_invariant_binary_search", "constraint_scan"],
    complexity: [
      "大多數最佳化版本的目標是 O(n)、O(n log n)、O((n + q) log n) 或 O(2^n * poly(n))，取決於狀態大小。",
      "隱藏成本通常存在於可行性檢查、轉換循環或資料結構操作中。",
      "如果模板將一個掃描嵌套在另一個掃描中，請重新檢查是否應預先計算或維護該掃描。",
    ],
    mistakes: [
      "保留過多的狀態並使轉換比原來的問題更困難。",
      "在恢復不變量之前更新答案。",
      "當貢獻計數或產品需要 long long 時使用 int。",
      "不測試 n = 0/1、重複值、相等邊界和最大約束。",
    ],
    practice: [
      {
        id: 875,
        title: "科科吃香蕉",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "最小可行速度",
        why: "需要在每次循環迭代之前編寫並維護準確的條件。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "D 天內運送包裹的能力",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "最小可行容量",
        why: "需要在每次循環迭代之前編寫並維護準確的條件。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1898,
        title: "最大可刪除字元數",
        slug: "maximum-number-of-removable-characters",
        rating: 1913,
        difficulty: "Medium",
        subPattern: "單調刪除檢查",
        why: "需要在每次循環迭代之前編寫並維護準確的條件。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 821,
        title: "到角色的最短距離",
        slug: "shortest-distance-to-a-character",
        rating: 1266,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2200,
        title: "尋找數組中的所有 K 距離索引",
        slug: "find-all-k-distant-indices-in-an-array",
        rating: 1266,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 925,
        title: "長按姓名",
        slug: "long-pressed-name",
        rating: 1271,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 2570,
        title: "透過求和值合併兩個二維數組",
        slug: "merge-two-2d-arrays-by-summing-values",
        rating: 1281,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3750,
        title: "反轉二進位字串的最小翻轉次數",
        slug: "minimum-number-of-flips-to-reverse-binary-string",
        rating: 1289,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1877,
        title: "最小化數組中的最大對和",
        slug: "minimize-maximum-pair-sum-in-array",
        rating: 1301,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2439,
        title: "最小化數組的最大值",
        slug: "minimize-maximum-of-array",
        rating: 1965,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3733,
        title: "完成所有交付的最短時間",
        slug: "minimum-time-to-complete-all-deliveries",
        rating: 1973,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1488,
        title: "避免城市淹水",
        slug: "avoid-flood-in-the-city",
        rating: 1974,
        difficulty: "Medium",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2926,
        title: "最大平衡子序列和",
        slug: "maximum-balanced-subsequence-sum",
        rating: 2448,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3288,
        title: "最長增長路徑的長度",
        slug: "length-of-the-longest-increasing-path",
        rating: 2450,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3134,
        title: "求唯一性數組的中位數",
        slug: "find-the-median-of-the-uniqueness-array",
        rating: 2451,
        difficulty: "Hard",
        subPattern: "二分查找",
        why: "正確性來自於每次迭代中維護的循環不變量，即本章的規則。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我可以說明哪些暴力對像以及我將停止列舉哪一個對象嗎？",
      "是否存在單調謂詞、維護視窗、排序順序、貢獻計數或 DP 狀態？",
      "每次更新前後到底什麼不變量是正確的？",
      "如果重複或邊界相等處理不正確，哪一個樣本會被破壞？",
    ],
    related: [
      "invariant-thinking",
      "binary-search-on-answer",
      "fix-right-maintain-left",
      "proof-techniques",
    ],
  },
  {
    slug: "two-pointers-opposite",
    title: "兩個指針（相反方向）",
    group: "Core Array/String Patterns",
    icon: "ArrowLeftRight",
    tagline: "從排序或對稱數組的兩端靠近，在線性時間內尋找對、三元組和回文。",
    concept: [
      "想像兩個人從一個排序好的書架的兩端走向對方，每個人都可以向內邁進。如果他們拿著的兩本書太重，那麼重的（右）一端的人就會介入；如果太輕，左邊的人就會介入。因為架子是排序的，所以每一步都會同時排除一整批的物品——這就是整個技巧。",
      "相反方向的兩個指標維持一個縮小的視窗 `[lo, hi]`，並根據比較每一步精確移動一個端點。",
      "與同向（滑動視窗）指針對比：兩個指標都向前移動；在這裡，它們相互靠近，並且通常首先對數組進行排序。",
    ],
    motivation: [
      "「找到一對求和到目標」的蠻力會嘗試所有對。範例：`nums = [2, 7, 11, 15]`，目標 9 檢查 (2,7),(2,11),… — `O(n^2)`。",
      "排序（或假設已排序），然後讀取兩端：`2 + 15 = 17 > 9`，因此刪除最大的（移動 `hi`）；`2 + 11 = 13 > 9` 移動 `hi`；`2 + 7 = 9` — 已找到。",
      "每次比較都會丟棄矩陣的整個行/列，因此在 `O(n log n)` 排序後掃描為 `O(n)`。蠻力所做的重複工作——重新檢查訂單已經排除的配對——被消除了。",
    ],
    whenUse: [
      "如果您看到一個排序數組並“找到具有總和/條件的一對/三元組”，請考慮從兩端關閉的指標。",
      "如果您看到“它是回文嗎”或“就地反轉”，請想像兩端都有一個指針向內移動。",
      "如果您看到 3Sum/4Sum，請思考：修復外部元素，然後將其餘元素兩點化。",
      "如果您看到「大部分水」/「兩條線」區域問題，請考慮將限制（較短）端向內移動。",
      "如果數組未排序，但只有值（而不是索引）重要，請考慮首先排序，然後是兩個指標。",
    ],
    coreIdea: [
      "對數組進行排序，除非它已經排序並且必須保留索引。",
      "將 `lo` 放在開頭，將 `hi` 放在結尾。",
      "將目前對與目標/條件進行比較。",
      "向右移動 `lo` 增加數量，或向左移動 `hi` 減少數量。",
      "在匹配中，記錄它並跳過相同的鄰居以避免重複結果。",
      "當`lo >= hi`時停止。",
    ],
    invariant:
      "**無丟棄解不變。 ** 仍包含答案的每一對都位於 `[lo, hi]` 內。為什麼每次移動都是安全的：如果 `nums[lo] + nums[hi]` 太小，那麼 `nums[lo]` 與任何 ≤ `nums[hi]` 配對也太小，因此 `lo` 永遠不能成為解決方案的一部分並被丟棄； `hi` 對稱。因為每個步驟僅刪除可證明不能作為答案的對，所以倖存視窗總是包含它。",
    variants: [
      "排序對搜尋：找到兩個值求和為目標（Two Sum II）。",
      "3Sum / 4Sum：修復外部索引，然後對內部對進行兩點計算，跳過重複項。",
      "回文檢查：比較向內移動的鏡像字元。",
      "容器/區域：將較短的牆向內移動，因為較高的牆與較短的牆配對時無法提高。",
      "分區（荷蘭國旗）：三分球一次傳球橫掃三路。",
    ],
    templateKeys: ["two_pointers_opposite", "three_sum"],
    complexity: [
      "兩個指標掃描是O(n)；隱藏成本是通常在其先前的 O(n log n) 排序，它在總數中占主導地位。",
      "3Sum/4Sum 將掃描嵌套在固定 1-2 個元素內：O(n^2) / O(n^3)；隱藏的成本是重複跳過，無需額外的傳遞即可保持結果的唯一性。",
      "輸出以外的空間為 O(1)（或排序的 O(log n)–O(n)，取決於演算法）。",
    ],
    mistakes: [
      "忘記跳過重複項。反例：`nums = [0, 0, 0]`，3Sum 中的目標 0 會多次發出 `[0, 0, 0]`，除非您在配對後前進超過相等的 `lo`/`hi` 值。",
      "在未排序的陣列上使用兩個指標。反例：在`[3, 1, 4, 2]`上，移動規則沒有意義，因為更大的數值可以坐在左邊；先排序。",
      "在區域問題中移動錯誤的一端。反例：移動盛水最多的容器中較高的壁只能縮小寬度，而不會提高極限高度，錯過了最佳選擇－移動較短的壁。",
      "總和溢出。反例：`10^9`附近的兩個值溢位`int`；與 `long long` 進行比較或重新排列比較。",
    ],
    practice: [
      {
        id: 167,
        title: "兩數之和 II - 輸入數組已排序",
        slug: "two-sum-ii-input-array-is-sorted",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "排序對搜尋",
        why: "基本情況：排序數組的每一端都有一個指標。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 11,
        title: "裝最多水的容器",
        slug: "container-with-most-water",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "移動較短的牆",
        why: "經典的「移動限制端點」交換論點。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 15,
        title: "3Sum",
        slug: "3sum",
        rating: 1550,
        difficulty: "Medium",
        subPattern: "修復一+二指針",
        why: "具有重複跳過的規範修復外部然後兩點。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 16,
        title: "3 總和最接近",
        slug: "3sum-closest",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "追蹤最接近的總和",
        why: "相同的掃描，但保持最近的距離而不是相等。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 18,
        title: "4Sum",
        slug: "4sum",
        rating: 1650,
        difficulty: "Medium",
        subPattern: "修復兩個+兩個指針",
        why: "新增第二個固定索引和仔細的溢出/重複處理。",
        order: 5,
        tier: "Advanced Practice",
      },
      {
        id: 42,
        title: "收集雨水",
        slug: "trapping-rain-water",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "具有運行最大值的兩個指針",
        why: "由較小一側的運行最大值驅動的相反指針。",
        order: 6,
        tier: "Challenge Practice",
      },
      {
        id: 977,
        title: "排序數組的平方",
        slug: "squares-of-a-sorted-array",
        rating: 1130,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2903,
        title: "尋找具有指數和價值差異的指數 I",
        slug: "find-indices-with-index-and-value-difference-i",
        rating: 1158,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3884,
        title: "兩端的第一個匹配字符",
        slug: "first-matching-character-from-both-ends",
        rating: 1161,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2824,
        title: "計算總和小於目標的對",
        slug: "count-pairs-whose-sum-is-less-than-target",
        rating: 1166,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 1768,
        title: "交替合併字串",
        slug: "merge-strings-alternately",
        rating: 1167,
        difficulty: "Easy",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 777,
        title: "交換 LR 字串中的相鄰項",
        slug: "swap-adjacent-in-lr-string",
        rating: 1939,
        difficulty: "Medium",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1537,
        title: "獲得最高分",
        slug: "get-the-maximum-score",
        rating: 1961,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 3734,
        title: "字典順序上最小的回文排列大於目標",
        slug: "lexicographically-smallest-palindromic-permutation-greater-than-target",
        rating: 2330,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1755,
        title: "最接近的子序列和",
        slug: "closest-subsequence-sum",
        rating: 2364,
        difficulty: "Hard",
        subPattern: "兩個指針",
        why: "從兩端匯聚的兩個指標利用排序性來刪除因子 n，這是本章的技術。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "數組是否已排序（或者我可以對其進行排序，因為只有值而不是原始索引才重要）？",
      "移動一個端點是否單調增加或減少我比較的數量？",
      "比賽結束後，我是否會跳過同等的鄰居以使結果保持唯一？",
      "對於區域/分區變體，哪個端點是我必須移動的限制端點？",
    ],
    related: [
      "sliding-window",
      "sorting-as-a-tool",
      "fix-right-maintain-left",
      "binary-search-on-answer",
    ],
  },
  {
    slug: "sliding-window",
    title: "滑動視窗（精確大小/最多 K）",
    group: "Core Array/String Patterns",
    icon: "SlidersHorizontal",
    tagline:
      "維護一個連續的視窗並滑動它來回答固定大小、最長、最短和恰好 k 個子數組的問題，時間複雜度為 O(n)。",
    concept: [
      "想像一下在一行文字上拖曳一個固定寬度的放大鏡：當它向右移動一個字元時，一個新字元進入，一個舊字元離開其視圖，因此您永遠不會重新閱讀中間部分。滑動視窗是陣列上的玻璃——您可以增量更新聚合（總和、不同計數、頻率圖），而不是從頭開始重新計算每個視窗。",
      "視窗有三種形狀：固定大小、透過增大/縮小以保持有效的可變大小以及使用「至多 k」算術的計數視窗。",
      "兩個指針的移動方向相同（左右同時前進），這與相反方向的兩個指針不同。",
    ],
    motivation: [
      '「無重複的最長子字串」的強力測試每個子字串並重新掃描它是否有重複項。範例：`s = "abcabcbb"` 重新檢查重疊範圍 - `O(n^2)` 或更糟。',
      "維護一個視窗 `[left, right]` 及其字元集/計數；擴展`right`，當出現重複時，前進`left`，直到視窗再次有效。",
      "每個角色最多進入和離開窗口一次，因此作品為`O(n)`。重疊範圍的重複掃描正是視窗刪除的內容。",
      "對於“恰好 k 個不同的”，計算 `atMost(k) - atMost(k - 1)`：每個最多計數是一個單調窗口，並且它們的差異隔離了確切的情況。",
    ],
    whenUse: [
      "如果您看到“大小為 k 的子數組/子字串”，請考慮一個固定大小的窗口，其中每張幻燈片上都會更新聚合。",
      "如果您看到“最長子數組使得 <條件保持有效>”，請考慮增加 `right`，在無效時縮小 `left`。",
      "如果您看到“總和/條件≥目標的最短子數組”，請考慮一旦條件成立就從左側收縮。",
      "如果您看到“計算具有恰好 k ... 的子數組”，請考慮 `atMost(k) - atMost(k - 1)`。",
      "如果您看到“最多 k 個不同/奇數/零”，請考慮頻率圖加上收縮條件。",
    ],
    coreIdea: [
      "選擇視窗類型：固定大小、最長有效、最短有效或計數。",
      "透過移動 `right` 並將 `nums[right]` 折疊到聚合中來擴展視窗。",
      "當視窗違反其條件時，請移動 `left` 並從聚合中刪除 `nums[left]`。",
      "記錄視窗有效時的答案（長度、計數或聚合）。",
      "對於精確的 k 計數，最多減去兩個視窗。",
      "確保每個元素恰好進入和離開聚合一次。",
    ],
    invariant:
      "**視窗有效性不變。 ** 在讀取答案時，窗口 `[left, right]` 滿足問題的條件（並且，對於最長/至多窗口，`[left - 1, right]` 不會滿足）。為什麼這給出了正確的計數：因為 `left` 只會前進，每個 `right` 都與唯一的最小有效 `left` 配對，因此每個最大/至多視窗都會計數一次，並且線性掃描是詳盡的。",
    variants: [
      "固定大小窗口：滑動寬度為k的窗口，加入進入元素，刪除離開元素。",
      "最長有效視窗：僅在條件中斷時增加 `right`，縮小 `left`。",
      "最短有效視窗：在條件仍然成立的情況下積極縮小 `left`。",
      "At-most-k window：保留頻率圖；當不同/違規超過 k 時收縮。",
      "至多精確-k：`atMost(k) - atMost(k - 1)`。",
    ],
    templateKeys: ["longest_window", "shortest_window", "exactly_k_distinct"],
    complexity: [
      "所有變體都是 O(n) 時間，因為每個索引都被添加和刪除一次；隱藏成本是每個步驟映射/聚合更新（哈希映射為 O(1) 攤銷，固定數組為 O(alphabet)）。",
      "Exactly-k 最多運行兩次，仍然是 O(n)；隱藏成本是當 k = 0 時正確進行減法。",
      "對於頻率結構，空間是 O(window)，對於固定字母表，空間是 O(1)，否則是 O(k)。",
    ],
    mistakes: [
      "在恢復有效性之前記錄答案。反例：對於“最多有 k 個零的最長”，當零 > k 時取 `right - left + 1` 計數無效視窗 - 首先縮小。",
      "最短與最長的收縮條件錯誤。反例：使用「無效時收縮」來解決最短視窗問題永遠不會最小化；最短視窗縮小但仍然有效。",
      "忘記`atMost(-1) = 0`。反例：恰好0不同呼叫`atMost(-1)`；傳回 0 以外的任何值都會破壞減法。",
      "不從地圖中刪除離開的元素。反例：過時的計數會使不同計數檢查錯誤，且視窗永遠不會縮小。",
    ],
    practice: [
      {
        id: 209,
        title: "最小子數組總和",
        slug: "minimum-size-subarray-sum",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "最短有效視窗",
        why: "一旦總和≥目標，有效時收縮以最小化長度。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 3,
        title: "沒有重複字元的最長子串",
        slug: "longest-substring-without-repeating-characters",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "最長有效窗口",
        why: "向右增長，向左收縮，重複－典型的最長視窗。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 567,
        title: "字串中的排列",
        slug: "permutation-in-string",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "固定大小的頻率視窗",
        why: "比較字元頻率的固定寬度視窗。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 424,
        title: "最長重複字元替換",
        slug: "longest-repeating-character-replacement",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "視窗減去最大頻率",
        why: "有效性使用視窗長度減去最頻繁的計數。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 1004,
        title: "最大連續數 III",
        slug: "max-consecutive-ones-iii",
        rating: 1656,
        difficulty: "Medium",
        subPattern: "至多 k 個零窗口",
        why: "預算為 k 次翻轉的最長視窗。",
        order: 5,
        tier: "Advanced Practice",
      },
      {
        id: 992,
        title: "具有 K 個不同整數的子數組",
        slug: "subarrays-with-k-different-integers",
        rating: 2210,
        difficulty: "Hard",
        subPattern: "至多恰好 k 個",
        why: "定義「atMost(k) - atMost(k-1)」計數技巧。",
        order: 6,
        tier: "Challenge Practice",
      },
      {
        id: 3206,
        title: "交替組 I",
        slug: "alternating-groups-i",
        rating: 1224,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1876,
        title: "具有不同字元的大小為 3 的子字串",
        slug: "substrings-of-size-three-with-distinct-characters",
        rating: 1249,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3258,
        title: "計算滿足 K 限制 I 的子字串",
        slug: "count-substrings-that-satisfy-k-constraint-i",
        rating: 1258,
        difficulty: "Easy",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1456,
        title: "給定長度的子字串中元音的最大數量",
        slug: "maximum-number-of-vowels-in-a-substring-of-given-length",
        rating: 1263,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3254,
        title: "求 K 尺寸子陣列的功效 I",
        slug: "find-the-power-of-k-size-subarrays-i",
        rating: 1267,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 3298,
        title: "計算可以重新排列以包含字串 II 的子字串",
        slug: "count-substrings-that-can-be-rearranged-to-contain-a-string-ii",
        rating: 1909,
        difficulty: "Hard",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2875,
        title: "無限數組中的最小大小子數組",
        slug: "minimum-size-subarray-in-infinite-array",
        rating: 1914,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 3859,
        title: "計算具有 K 個不同整數的子數組",
        slug: "count-subarrays-with-k-distinct-integers",
        rating: 2302,
        difficulty: "Hard",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 837,
        title: "新21遊戲",
        slug: "new-21-game",
        rating: 2350,
        difficulty: "Medium",
        subPattern: "滑動窗",
        why: "增長/收縮的視窗在線性時間（章節的模式）中維持對連續元素的限制。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "目標物件是否連續（子陣列/子字串），因此視窗甚至適用？",
      "我想要最長（僅在無效時收縮）還是最短（在有效時收縮）？",
      "隨著視窗的增長，數量是否單調，因此 `left` 永遠不需要向後移動？",
      "這是一個精確計數問題，是否可以更好地表達為最多兩個計數的差異？",
    ],
    related: [
      "fix-right-maintain-left",
      "two-pointers-opposite",
      "hash-map-frequency",
      "monotonic-data-structures",
    ],
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    group: "Recursion and Search",
    icon: "GitBranch",
    tagline: "逐步建立候選者並撤銷最後的選擇，儘早修剪遞歸樹的整個分支。",
    concept: [
      "回溯是在你身後展開一條繩子的同時探索樹籬迷宮：在每個交叉點你選擇一條路徑，當你遇到死胡同時，你沿著繩子回到最後一個交叉點並嘗試下一條路徑。該字串是呼叫堆疊； “撤消最後的選擇”是倒退一步。你永遠不會傳送——你總是回到最後做出決定的地方。",
      "從形式上來說，你一次只能選擇一個部分解決方案；當它完成時，你記錄它，當它無法通往任何有效的地方時，你放棄（修剪）該分支。",
      "心智模型是一棵遞歸樹，其節點是部分狀態，其邊是選擇；修剪會在探索子樹之前刪除整個子樹。",
    ],
    motivation: [
      "暴力生成每個完整的候選人和過濾器。範例：`[1, 2, 3]` 的所有排列都可以透過巢狀三個循環來構建，但這會硬編碼深度並重新派生共享前綴。",
      "相反，遞歸：選擇一個未使用的元素，遞歸其餘元素，然後取消選擇。共享前綴 `[1, 2]` 建構一次並重新用於 `[1, 2, 3]` 和（回溯後）任何同級。",
      "修剪是回溯擊敗枚舉的地方：在組合求和中，一旦候選超過剩餘目標，排序就可以讓您 `break`，刪除該分支的整個尾部。每個修剪規則都會從遞歸樹中刪除一個子樹，將其從完整的產品空間縮小到僅活動區域。",
      "因此，隨著每條規則的添加，遞歸樹的形狀明顯改變：可行性剪枝剪掉無法完成的分支；捆綁修剪修剪的樹枝無法擊敗迄今為止最好的樹枝。",
    ],
    whenUse: [
      "如果您看到“產生所有排列/組合/子集”，請考慮具有選擇/遞歸/取消選擇的遞歸樹。",
      "如果您看到“將字串/陣列劃分為有效的部分”，請考慮在每個有效的前綴切割上遞歸。",
      "如果您看到「放置受約束的物品」（N-皇后、數獨），請考慮選擇一個插槽、驗證、遞歸、撤銷。",
      "如果您看到小 n 帶有“計算/查找所有解決方案”，請考慮使用積極修剪進行回溯。",
      "如果貪婪或 DP 不適用，因為您確實需要每個解決方案，請考慮回溯。",
    ],
    coreIdea: [
      "定義部分狀態以及「完整」的意思。",
      "在每一步中，枚舉當前狀態的合法選擇。",
      "應用選擇（改變部分狀態）。",
      "遞歸，然後完全撤銷選擇（恢復狀態）。",
      "修剪：跳過違反可行性或無法擊敗當前最佳選擇的選擇。",
      "狀態完成後記錄候選人。",
    ],
    invariant:
      "**乾淨狀態不變。 ** 遞歸呼叫返回後，部分狀態逐字節與呼叫之前相同。為什麼這使得搜尋正確：每個分支都從原始前綴探索其子樹，因此兄弟分支永遠不會看到彼此的剩餘部分；結合“嘗試每一個合法的選擇”，這棵樹被徹底地探索並且沒有受到污染。這裡的一個錯誤（忘記撤消）悄悄地將狀態洩漏到同級中並產生幻影解決方案。",
    variants: [
      "排列：追蹤 `used[]` 集合；順序很重要。",
      "組合/子集：帶有 `start` 索引，因此每個元素被考慮一次並且集合保持唯一。",
      "Choose-with-repetition (Combination Sum)：遞迴保持在相同索引處；將 `break` 修剪排序。",
      "網格/位置搜尋（單字搜尋、N-Queens）：標記使用的儲存格/列、遞歸、取消標記。",
      "可行性與限制修剪：修剪無法完成的分支與無法擊敗最好的分支。",
    ],
    templateKeys: [
      "backtrack_permute",
      "backtrack_subsets",
      "backtrack_combination_sum",
    ],
    complexity: [
      "輸出敏感：排列為 O(n · n!)，子集為 O(n · 2^n)，因為存在許多候選者；隱藏成本是每次記錄完整候選者時進行的 O(length) 副本。",
      "剪枝改變了常量，通常是實際的基礎，但不是所有候選都有效時的最壞情況。",
      "遞歸堆疊的空間為 O(深度)，加上部分解的空間為 O(狀態)。",
    ],
    mistakes: [
      "忘記撤銷選擇。反例：在排列中，遞歸後不重置 `used[i] = false` 會使後面的兄弟姐妹看到該元素已被採用，從而刪除有效的排列。",
      "重新發出重複集。反例：不排序的 `[1, 2, 2]` 的子集+「跳過相同深度的相同兄弟」會產生 `[1, 2]` 兩次。",
      "修剪不排序。反例：Combination Sum 中的 `break` 僅在候選已排序時才起作用；對於未排序的輸入，它會錯誤地提前停止。",
      "複製錯誤的物件。反例：推送可變 `cur` 的引用而不是副本，會使每個記錄的解決方案變異為最終的空狀態。",
    ],
    practice: [
      {
        id: 46,
        title: "Permutations",
        slug: "permutations",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "使用[]排列",
        why: "帶有選擇/撤消的基本排列遞歸。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 78,
        title: "Subsets",
        slug: "subsets",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "起始索引子集",
        why: "每個遞歸樹節點都是一個子集。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 77,
        title: "Combinations",
        slug: "combinations",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "k-of-n 組合",
        why: "起始索引加上大小目標。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 39,
        title: "組合總和",
        slug: "combination-sum",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "重複使用+排序修剪",
        why: "選擇重複和規範的中斷修剪。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 40,
        title: "組合總和II",
        slug: "combination-sum-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "跳過重複的兄弟姊妹",
        why: "每個數字使用一次，並進行重複分支修剪。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 90,
        title: "子集II",
        slug: "subsets-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "去重子集",
        why: "具有重複元素的子集；排序然後跳過相等的兄弟姐妹。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 47,
        title: "排列二",
        slug: "permutations-ii",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "去重排列",
        why: "在每個深度進行重複分支修剪的排列。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 79,
        title: "單字搜尋",
        slug: "word-search",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "網格 DFS 帶回溯",
        why: "匹配路徑時標記/取消標記單元格。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 131,
        title: "回文分區",
        slug: "palindrome-partitioning",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "遞歸有效的前綴剪切",
        why: "剪切每個回文前綴並遞歸其餘部分。",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 216,
        title: "組合總和 III",
        slug: "combination-sum-iii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "有界數字+總和",
        why: "兩個約束（計數和總和）一起修剪。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 51,
        title: "N-Queens",
        slug: "n-queens",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "柱/對角線可行性修剪",
        why: "具有 O(1) 衝突檢查的經典佈局搜尋。",
        order: 11,
        tier: "Challenge Practice",
      },
      {
        id: 37,
        title: "數獨求解器",
        slug: "sudoku-solver",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "約束傳播+回溯",
        why: "大量修剪使得指數搜尋變得實用。",
        order: 12,
        tier: "Challenge Practice",
      },
      {
        id: 784,
        title: "字母大小寫排列",
        slug: "letter-case-permutation",
        rating: 1342,
        difficulty: "Medium",
        subPattern: "backtracking",
        why: "系統選擇/探索/撤銷與修剪枚舉有效的配置，章節的模式。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 3211,
        title: "產生沒有相鄰零的二進位字串",
        slug: "generate-binary-strings-without-adjacent-zeros",
        rating: 1353,
        difficulty: "Medium",
        subPattern: "backtracking",
        why: "系統選擇/探索/撤銷與修剪枚舉有效的配置，章節的模式。",
        order: 14,
        tier: "Core Practice",
      },
      {
        id: 1096,
        title: "支架擴張 II",
        slug: "brace-expansion-ii",
        rating: 2349,
        difficulty: "Hard",
        subPattern: "backtracking",
        why: "系統選擇/探索/撤銷與修剪枚舉有效的配置，章節的模式。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我真的需要所有解決方案（或所有滿足約束的解決方案），而不僅僅是一個最佳方案嗎？",
      "我可以定義部分狀態以及擴展它的法律選擇嗎？",
      "什麼可行性或邊界檢查可以讓我在完全探索分支之前對其進行修剪？",
      "我是否撤銷每個選擇，以便兄弟姐妹從乾淨的狀態開始，並複製（而不是別名）記錄的解決方案？",
    ],
    related: [
      "state-design",
      "divide-and-conquer",
      "state-compression",
      "tree-traversal",
    ],
  },
  {
    slug: "hash-map-frequency",
    title: "哈希圖/頻率計數",
    group: "Core Array/String Patterns",
    icon: "Hash",
    tagline:
      "用記憶體換取時間：儲存看到的值、補集、前綴狀態或 O(1) 尋找的計數。",
    concept: [
      "哈希圖就像一個衣帽寄存櫃檯：您交出一件物品並獲得一張即時領取票，然後您可以一步檢索它，而不是搜索每個鉤子。在演算法中，您檢查已經看到的事實 - 值、補碼、運行的前綴和、字元計數 - 因此未來的問題變成單個 O(1) 查找而不是重新掃描。",
      "重複的動作是：當你掃描時，問“我看到了我需要的東西嗎？”並同時“簽入”當前元素以進行後續步驟。",
      "頻率計數與應用於多重性的想法相同：從鍵到計數的映射直接回答字謎、多數和余數問題。",
    ],
    motivation: [
      "強力二和測試每對 `nums[i] + nums[j] == target` — `O(n^2)`。範例：`nums = [2, 7, 11, 15]`，目標 9 個掃描對。",
      "邊走邊檢查每個值；對於目前的 `x`，請尋找 `target - x`。當您到達 7 時，您會立即發現 2 人已簽入 — `O(n)`。",
      "對於“count subarrays with sum k”，檢查每個前綴和的頻率；等於 `prefix - k` 的較早前綴的數量是此處結束的合格子數組的計數。重複的內部求和分解為地圖查找。",
      "對於分組/字謎，鍵是規範簽章（排序的字串或 26 計數元組），並且映射桶在一次傳遞中匹配項目。",
    ],
    whenUse: [
      "如果您看到“尋找具有屬性 X 的兩個元素”，請考慮在映射中儲存補集。",
      "如果您看到“對具有總和或屬性 k 的子數組/子字串進行計數”，請考慮前綴值 → 頻率。",
      "如果您看到“group/anagram/duplicate”，請考慮一個規範鍵 → 儲存桶或計數。",
      "如果您看到“第一個唯一”、“前 k 個頻繁”或“多數”，請考慮頻率圖。",
      "如果您看到以餘數或奇偶校驗進行計數，請考慮按 `value % m` 儲存桶。",
    ],
    coreIdea: [
      "決定將什麼儲存為鍵：值、補碼、前綴狀態或規範簽章。",
      "當您掃描時，請先在地圖上查詢您需要的事實。",
      "然後插入/更新目前元素，以便將來的步驟可以使用它。",
      "對於計數，使用儲存的頻率進行累加（通常在遞增之前）。",
      "當涉及前綴和時，為空前綴 (`count[0] = 1`) 播種映射。",
      "選擇可散列的密鑰類型並防止前綴和溢出。",
    ],
    invariant:
      "**Seen-Set Invariant。 ** 當處理索引 `i` 時，映射準確反映索引 `< i` 中的元素/前綴（而不是從 `i` 開始）。為什麼這可以防止重複計算：插入之前查詢可以保證僅對嚴格較早的伙伴進行計數，因此每個符合條件的對都被計數一次，並且自配對（`i` 與其自身）是不可能的。",
    variants: [
      "二和/補查找：映射值→索引，查詢`target - x`。",
      "前綴和+雜湊映射：映射前綴→子數組和和整除問題的計數。",
      "字謎分組：映射排序/調號 → 單字列表。",
      "帶有頻率圖的滑動視窗：當前視窗元素的計數。",
      "依餘數/屬性計數：按 `value % m` 或衍生特徵進行儲存。",
    ],
    templateKeys: ["hashmap_two_sum", "prefix_count_hashmap"],
    complexity: [
      "大多數模式的平均值是 O(n)；隱藏的成本是雜湊本身——在對抗性衝突下每個操作的最壞情況 O(n)，以及與陣列索引相比的大常數。",
      "當鍵是長度為 L 的已排序字串時，Anagram 分組為 O(n · L log L)；使用 26 計數金鑰可消除 log L 因子。",
      "空間是 O(不同的鍵)，可以等於 O(n)。",
    ],
    mistakes: [
      "在查詢之前插入。反例：在具有重複值的 Two Sum 中，先插入 `nums[i]` 使其與自身配對，並返回 `[i, i]`。",
      "忘記空前綴種子。反例：除非 `count[0] = 1`，否則會錯過從索引 0 開始的「子數組總和等於 k」。",
      "前綴鍵溢出。反例：超過`10^5`大值的前綴和超過`int`；使用 `long long` 鍵。",
      "使用非規範組密鑰。反例：透過原始字串鍵入字謎詞將 `eat` 和 `tea` 放入不同的儲存桶中 - 對鍵進行排序或使用計數簽章。",
    ],
    practice: [
      {
        id: 1,
        title: "兩和",
        slug: "two-sum",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "補碼查找",
        why: "原型：在插入之前查詢補集。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 49,
        title: "組字謎",
        slug: "group-anagrams",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "規範鍵存儲",
        why: "將排序/計數簽章對應到儲存桶。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 242,
        title: "有效的字謎詞",
        slug: "valid-anagram",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "頻率平等",
        why: "比較兩個 26 計數頻率圖。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 560,
        title: "子數組和等於 K",
        slug: "subarray-sum-equals-k",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "前綴和+映射",
        why: "計算等於前綴 - k 的較早前綴。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 974,
        title: "子數組和可被 K 整除",
        slug: "subarray-sums-divisible-by-k",
        rating: 1676,
        difficulty: "Medium",
        subPattern: "前綴餘數桶",
        why: "依前綴餘數模 k 計數。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 525,
        title: "連續數組",
        slug: "contiguous-array",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "前綴狀態的第一個索引",
        why: "將 +1/-1 前綴映射到其最早的索引。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 454,
        title: "4總和II",
        slug: "4sum-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "分裂+補圖",
        why: "中間相遇：計算地圖中對的總和。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 128,
        title: "最長連續序列",
        slug: "longest-consecutive-sequence",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "設定會員運行",
        why: "僅從該組中沒有前任的數字開始運行。",
        order: 8,
        tier: "Challenge Practice",
      },
      {
        id: 1248,
        title: "計算好子數組的數量",
        slug: "count-number-of-nice-subarrays",
        rating: 1624,
        difficulty: "Medium",
        subPattern: "前綴奇偶校驗計數",
        why: "使用頻率圖計算奇數前綴。",
        order: 9,
        tier: "Challenge Practice",
      },
      {
        id: 1394,
        title: "在數組中尋找幸運整數",
        slug: "find-lucky-integer-in-an-array",
        rating: 1118,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3184,
        title: "數出構成完整一天的對 I",
        slug: "count-pairs-that-form-a-complete-day-i",
        rating: 1150,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 3146,
        title: "兩個字串之間的排列差異",
        slug: "permutation-difference-between-two-strings",
        rating: 1152,
        difficulty: "Easy",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 3144,
        title: "等字元頻率的最小子串劃分",
        slug: "minimum-substring-partition-of-equal-character-frequency",
        rating: 1917,
        difficulty: "Medium",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 2564,
        title: "子字串異或查詢",
        slug: "substring-xor-queries",
        rating: 1959,
        difficulty: "Medium",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 3177,
        title: "求好子序列 II 的最大長度",
        slug: "find-the-maximum-length-of-a-good-subsequence-ii",
        rating: 2365,
        difficulty: "Hard",
        subPattern: "哈希映射",
        why: "計數或上次看到的索引的雜湊圖將重複查找變成 O(1)，這是本章的核心結構。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "如果我在 O(1) 中得到它，哪個單一事實會崩潰內部循環——補碼、前綴計數、簽名？",
      "我應該在插入當前元素之前查詢地圖以避免自我/前向配對嗎？",
      "對於前綴和計數，我是否播種了空前綴並選擇了溢出安全性金鑰類型？",
      "我的群組/儲存桶密鑰對於群組的所有成員來說真的是規範的嗎？",
    ],
    related: [
      "prefix-suffix-decomposition",
      "sliding-window",
      "contribution-counting",
      "number-theory-and-math",
    ],
  },
  {
    slug: "sorting-as-a-tool",
    title: "排序作為工具",
    group: "Core Array/String Patterns",
    icon: "ArrowDownWideNarrow",
    tagline:
      "首先對資料重新排序，以便稍後的掃描、二分搜尋、貪婪選擇或比較器完成真正的工作。",
    concept: [
      "排序就是在開始之前整理桌子：一旦文件整理好，查找、配對和分組就變成了瑣碎的掃視，而不是全面的搜索。你很少為了排序本身而排序——你排序是為了讓「下一步」（線性掃描、二分搜尋、貪婪掃描）能夠呈現順序並變得簡單和正確。",
      "此技能是選擇正確的鍵/比較器，以便您需要的屬性變得鄰接、單調或清晰的邊界。",
      "自訂比較器可以編碼令人驚訝的豐富邏輯——「哪種排列更好」——透過交換論證證明是正確的。",
    ],
    motivation: [
      "「合併重疊間隔」的強力比較每對重疊 - `O(n^2)`。範例：`[[1, 3], [2, 6], [8, 10]]`。",
      "按開始優先排序；現在重疊的間隔是相鄰的，因此擴展或開啟間隔的單一從左到右掃描就足夠了 - `O(n log n)`。",
      "此順序將全域成對問題轉換為局部鄰居問題，從而消除了重複工作。",
      "對於“串聯中的最大數字”，正確的工具是比較器（`a + b > b + a`）——按它排序直接產生答案，並通過交換參數進行證明。",
    ],
    whenUse: [
      "如果您發現重疊/間隔問題，請考慮按開始（或結束）排序，然後進行掃描。",
      "如果您看到“具有值條件的對/三元組”，請考慮對兩個指標進行排序或二分搜尋。",
      "如果您看到“安排以最佳化串聯/調度”，請考慮自訂比較器+交換證明。",
      "如果您在靜態資料上看到“第 k 個最小/最接近”，請考慮排序然後索引/二分搜尋。",
      "如果值很小且有界，請考慮使用計數/桶排序來實現 O(n)。",
    ],
    coreIdea: [
      "決定下一步需要的屬性（鄰接性、單調性、邊界）。",
      "選擇建立該屬性的排序鍵或比較器。",
      "Sort.",
      "運行廉價的後續操作：線性掃描、兩個指針、二分搜尋或貪婪。",
      "如果使用比較器，請確認它是嚴格的弱排序（一致、傳遞）。",
      "當值域較小時考慮計數/桶排序。",
    ],
    invariant:
      "**順序啟用局部性不變。 **排序後，後續的屬性依賴於相鄰（或單調掃描）元素之間的保留。為什麼這就是重點：正確的比較器使“全局更好”等同於“對抗鄰居更好”，因此單個有序傳遞（僅檢查鄰居或單調移動）即可達到全局答案。",
    variants: [
      "先排序後掃描：合併間隔、偵測重複項、將相鄰項分組。",
      "先排序後兩個指標：值的對/三重求和條件。",
      "先排序後二元搜尋：有序資料上的第 k 個/最接近/可行性。",
      "自訂比較器：串聯順序、按比例調度、多鍵搶七。",
      "計數/桶排序：O(n) 的小有界值域。",
    ],
    templateKeys: ["exchange_swap_sort", "exchange_greedy"],
    complexity: [
      "排序的時間複雜度為 O(n log n)，並且通常占主導地位；隱藏的成本是比較器——一個重型比較器（字串連接、元組構建）將每個比較乘以它自己的成本。",
      "當域很小時，計數/桶排序是 O(n + range)，用記憶體換取對數因子。",
      "後續掃描/搜尋是 O(n) 或 O(n log n)，很少成為瓶頸。",
    ],
    mistakes: [
      "不一致的比較器。反例：不是嚴格弱排序的比較器（例如，對於 `a < b` 和 `b < a` 都回傳 true）會導致 std::sort 中的未定義行為/崩潰。",
      "當原始索引很重要時進行排序。反例：排序後返回索引（如兩個總和）會遺失映射，除非對索引對進行排序。",
      "穩定性假設。反例：依靠相同的元素保持 `std::sort`（不穩定）的輸入順序打破了多遍方案；使用`stable_sort`。",
      "比較器/按鍵溢出。反例：比較`a * b`是否存在比率調度溢位`int`；比較 `long long` 中的叉積或作為 `a + b` 字串。",
    ],
    practice: [
      {
        id: 56,
        title: "合併間隔",
        slug: "merge-intervals",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "按開始+掃描排序",
        why: "排序然後本地掃描的原型。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 179,
        title: "最大數量",
        slug: "largest-number",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "自訂連接比較器",
        why: "具有交換參數證明的比較器 (a+b > b+a)。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 75,
        title: "顏色排序",
        slug: "sort-colors",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "數數/荷蘭國旗",
        why: "限界→計數或三分球一傳。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 274,
        title: "H-Index",
        slug: "h-index",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "排序然後掃描閾值",
        why: "降序排序，求交叉索引。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 164,
        title: "最大間隙",
        slug: "maximum-gap",
        rating: 1850,
        difficulty: "Medium",
        subPattern: "桶排序鴿舍",
        why: "官方說法中等但困難：透過分桶實現線性時間間隙，而不是比較排序。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3024,
        title: "三角形類型",
        slug: "type-of-triangle",
        rating: 1135,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1913,
        title: "兩對之間的最大乘積差",
        slug: "maximum-product-difference-between-two-pairs",
        rating: 1145,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2733,
        title: "既不是最小值也不是最大值",
        slug: "neither-minimum-nor-maximum",
        rating: 1148,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1365,
        title: "有多少個數字比目前數字小",
        slug: "how-many-numbers-are-smaller-than-the-current-number",
        rating: 1152,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1460,
        title: "透過反轉子數組使兩個數組相等",
        slug: "make-two-arrays-equal-by-reversing-subarrays",
        rating: 1152,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 823,
        title: "有因子的二元樹",
        slug: "binary-trees-with-factors",
        rating: 1900,
        difficulty: "Medium",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3394,
        title: "檢查網格是否可以切割成多個部分",
        slug: "check-if-grid-can-be-cut-into-sections",
        rating: 1916,
        difficulty: "Medium",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1943,
        title: "描述這幅畫",
        slug: "describe-the-painting",
        rating: 1969,
        difficulty: "Medium",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 1840,
        title: "最大建築高度",
        slug: "maximum-building-height",
        rating: 2374,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1998,
        title: "數組的 GCD 排序",
        slug: "gcd-sort-of-an-array",
        rating: 2429,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "排序首先暴露出鄰接性或單調結構，這使得其餘部分變得貪婪或線性，這是章節的槓桿。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "什麼屬性會讓後續變得微不足道──鄰接性、單調性還是清晰的邊界？",
      "哪個鍵或比較器會建立該屬性，比較器是有效的嚴格弱排序嗎？",
      "我是否需要保留原始索引或輸入順序（因此我必須保持配對或使用穩定排序）？",
      "值域是否夠小，以至於計數/桶排序能夠勝過 O(n log n)？",
    ],
    related: [
      "interval-merging",
      "exchange-argument",
      "two-pointers-opposite",
      "binary-search-on-answer",
    ],
  },
  {
    slug: "tree-traversal",
    title: "樹 DFS 和 BFS",
    group: "Tree Patterns",
    icon: "TreePine",
    tagline:
      "選擇遍歷順序並決定每個節點返回的內容和接收的內容，以乾淨地解決有根樹問題。",
    concept: [
      "一棵樹是一個公司的組織結構圖，遍歷它就是向每個人提出一個問題。深度優先是在備份之前一直遵循一個命令鏈；廣度優先是逐級輪詢整個組織。大多數樹代碼只是這些遍歷之一，加上關於哪些資訊向上流動（子樹摘要）與向下流動（來自祖先的上下文）的決定。",
      "DFS 有前序（在子節點之前執行）、中序（在子節點之間執行，對於 BST 有意義）和後序（在子節點之後執行，當節點依賴其子樹時需要）。",
      "BFS 使用佇列逐級訪問，這是最短深度和每級問題的正確工具。",
    ],
    motivation: [
      "「直徑」（任兩個節點之間的最長路徑）的強力可以測試所有節點對併計算每條路徑 - 太慢了。範例：n 個節點的平衡樹。",
      "後序 DFS 相反地返回每個子樹的高度向上；在每個節點，通過它的最佳路徑是 `leftHeight + rightHeight`，在一次遍歷中更新為全域最大值 - `O(n)`。",
      "重複的工作（重新計算共享路徑段）消失了，因為每個子樹事實都計算一次並由其父樹重用。",
      "關鍵的設計選擇是返回值與參數：高度作為返回值「向上」流動，而來自根的運行路徑和作為參數「向下」流動。",
    ],
    whenUse: [
      "如果您看到“深度/高度/直徑/子樹總和”，請考慮後序 DFS 返回子樹事實。",
      "如果您看到“BST 按排序順序/第 k 個最小”，請考慮中序 DFS。",
      "如果您看到“關卡順序/每關/最小深度/右側視圖”，請考慮具有佇列的 BFS。",
      "如果您看到“帶有運行上下文的根路徑”，請考慮 DFS 向下傳遞累加器參數。",
      "如果您看到“最低共同祖先”，請考慮組合子訊號的後序 DFS。",
    ],
    coreIdea: [
      "決定 DFS（一次一條鏈）或 BFS（一層一層）。",
      "對於 DFS，選擇節點必須採取行動的順序：前序、中序或後序。",
      "決定每個節點傳回給其父節點的內容（子樹摘要）。",
      "決定每個節點從其父節點（祖先上下文）接收什麼。",
      "將子結果（和/或參數）合併到該節點的答案中。",
      "更新已知完整路徑/子樹的節點處的任何全域答案。",
    ],
    invariant:
      "**子樹完整不變式。 ** 當後序 DFS 完成一個節點時，它傳回的值正確地總結了該節點的整個子樹。為什麼這樣組成：每個父節點組合已經正確的子節點摘要，因此透過從葉子歸納，每個節點的答案都是正確的，並且單個 O(n) 傳遞就足夠了。對 BFS 來說，並行不變量是佇列一次恰好保存一個完整等級。",
    variants: [
      "預序：在其子節點之前對節點進行操作（自上而下複製/序列化）。",
      "Inorder: left, node, right — 產生依排序順序的 BST 值。",
      "後序：節點之前的子節點 — 高度、總和、直徑、LCA。",
      "等級順序 BFS：一次處理一個凍結等級的佇列。",
      "傳回值與參數：子樹事實向上與祖先上下文向下。",
    ],
    templateKeys: ["tree_dfs", "tree_bfs_levels"],
    complexity: [
      "每次遍歷都是 O(n) 時間，因為每個節點都被訪問一次；隱藏成本是遞歸堆疊，O(h)，其中 h 是退化（傾斜）樹的高度 - O(n)，它可能會溢出堆疊。",
      "BFS 使用 O(width) 佇列空間，最寬等級可達 O(n)。",
      "每個節點超過 O(1) 的工作（例如，在序列化中建立字串）會相應地增加總數。",
    ],
    mistakes: [
      "遍歷順序錯誤。反例：在其子節點之前計算節點的直徑值（前序）會產生垃圾 - 必須先知道高度（後序）。",
      "不凍結 BFS 關卡大小。反例：在推動子級將等級合併在一起後，循環 `while(!q.empty())` 並在循環中讀取 `q.size()` 。",
      "空子級處理。反例：在沒有空檢查的情況下取消引用 `node->left->val` 會在葉子上崩潰；保護每個孩子的出入。",
      "將返回值與參數混淆。反例：嘗試將根到節點的路徑總和向上推，作為返回值重複計數；相反，將其作為參數傳遞下來。",
    ],
    practice: [
      {
        id: 94,
        title: "二元樹中序遍歷",
        slug: "binary-tree-inorder-traversal",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "中序 DFS",
        why: "基本中序遍歷（遞歸和迭代）。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 102,
        title: "二元樹層次順序遍歷",
        slug: "binary-tree-level-order-traversal",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "水平階 BFS",
        why: "底座 BFS 具有凍結等級尺寸。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 104,
        title: "二元樹的最大深度",
        slug: "maximum-depth-of-binary-tree",
        rating: 1100,
        difficulty: "Easy",
        subPattern: "訂單後高度",
        why: "返迴向上的子樹事實（高度）。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 543,
        title: "二叉樹的直徑",
        slug: "diameter-of-binary-tree",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "身高+全球最佳",
        why: "具有全域路徑更新的後序高度。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 236,
        title: "二元樹的最低共同祖先",
        slug: "lowest-common-ancestor-of-a-binary-tree",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "後序訊號合併",
        why: "合併每個節點處的子找到訊號。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 112,
        title: "路徑總和",
        slug: "path-sum",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "向下累加器",
        why: "將剩餘目標作為參數向下傳遞。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 113,
        title: "路徑總和II",
        slug: "path-sum-ii",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "DFS 帶回溯路徑",
        why: "遞歸時進位和撤銷路徑。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 199,
        title: "二元樹右側視圖",
        slug: "binary-tree-right-side-view",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "BFS 最後一級",
        why: "取每個 BFS 層的最後一個節點。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 124,
        title: "二元樹最大路徑和",
        slug: "binary-tree-maximum-path-sum",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "後序收益+全球最佳",
        why: "傳回最佳向下增益；更新全域通過節點最大值。",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 297,
        title: "序列化與反序列化二元樹",
        slug: "serialize-and-deserialize-binary-tree",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "有空標記的預購",
        why: "透過預序編碼來回傳輸樹。",
        order: 10,
        tier: "Challenge Practice",
      },
      {
        id: 987,
        title: "二元樹的垂直順序遍歷",
        slug: "vertical-order-traversal-of-a-binary-tree",
        rating: 1676,
        difficulty: "Hard",
        subPattern: "BFS/DFS 帶（列、行）鍵",
        why: "遍歷加上仔細的多鍵排序。",
        order: 11,
        tier: "Challenge Practice",
      },
      {
        id: 965,
        title: "無值二元樹",
        slug: "univalued-binary-tree",
        rating: 1178,
        difficulty: "Easy",
        subPattern: "二元樹",
        why: "答案是根據本章模式的根樹遞歸期間的子回傳值組合而成的。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 1161,
        title: "二元樹的最大層和",
        slug: "maximum-level-sum-of-a-binary-tree",
        rating: 1250,
        difficulty: "Medium",
        subPattern: "二元樹",
        why: "答案是根據本章模式的根樹遞歸期間的子回傳值組合而成的。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 3067,
        title: "計算加權樹網路中可連接伺服器對的數量",
        slug: "count-pairs-of-connectable-servers-in-a-weighted-tree-network",
        rating: 1909,
        difficulty: "Medium",
        subPattern: "樹遞迴",
        why: "答案是根據本章模式的根樹遞歸期間的子回傳值組合而成的。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 2920,
        title: "所有節點收集硬幣後的最大積分",
        slug: "maximum-points-after-collecting-coins-from-all-nodes",
        rating: 2351,
        difficulty: "Hard",
        subPattern: "樹遞迴",
        why: "答案是根據本章模式的根樹遞歸期間的子回傳值組合而成的。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "節點的答案是否取決於它的子樹（後序）、它的祖先（參數向下）或其在排序順序中的位置（中序）？",
      "這是一個按級別或最短深度的問題，透過 DFS 發送 BFS 訊號嗎？",
      "每個節點到底回傳什麼給它的父節點，它收到什麼？",
      "樹是否會傾斜，從而面臨 O(n) 遞歸深度和堆疊溢位的風險？",
    ],
    related: [
      "graph-traversal",
      "backtracking",
      "dp-state-design",
      "divide-and-conquer",
    ],
  },
  {
    slug: "graph-traversal",
    title: "圖 BFS 和 DFS",
    group: "Graph Patterns",
    icon: "Workflow",
    tagline:
      "使用已訪問的集合探索頂點； BFS 用於未加權最短路徑，DFS 用於連接和組件。",
    concept: [
      "探索圖表就像用粉筆探索洞穴系統：你進入的每個房間都用粉筆標記，這樣你就不會在原地徘徊。粉筆是訪問集，它是將有限遍歷與無限循環分開的單一規則。 DFS 沿著一條隧道潛入最深；BFS像漣漪一樣擴張，一步到達所有房間，然後兩步，依此類推。",
      "由於 BFS 到達節點的距離不減，因此它給出了未加權圖中的最短路徑； DFS 自然地暴露連接性和組件結構。",
      "網格是變相的圖形：每個單元格都是與其鄰居相連的頂點，因此洪水填充和最短網格路徑只是 DFS/BFS。",
    ],
    motivation: [
      "對「島嶼數量」的暴力破解可能會重複重新掃描網格以對單元格進行分組。例：陸地/水單元網格。",
      "相反，掃描一次；在每個未訪問的陸地單元上，啟動一個 DFS/BFS 來記錄整個連接的斑點，增加每個斑點的計數器 - `O(rows·cols)`。",
      "訪問過的標記消除了對同一區域的重複重新探索，這是浪費的工作。",
      "對於未加權迷宮中的最短路徑，BFS 從一開始就在出列的第一時刻到達目標，因為較早的層嚴格更接近。",
    ],
    whenUse: [
      "如果您看到“連接的組件/組數”，請考慮 DFS 或 BFS 淹沒每個組件一次。",
      "如果您看到“未加權圖形/網格中的最短步驟”，請逐層思考 BFS。",
      "如果您看到“洪水填充/島嶼/區域數量”，請考慮網格 DFS 標記已就位訪問。",
      "如果您看到“A 可以到達 B/它是否已連接”，請考慮具有訪問集的單一 DFS/BFS。",
      "如果您看到“同時從多個來源傳播”，請考慮多來源 BFS。",
    ],
    coreIdea: [
      "將問題建模為頂點和邊（網格：單元格和 4/8 鄰居）。",
      "選擇 BFS（佇列）以獲得最短未加權距離，選擇 DFS（堆疊/遞歸）以獲得可達性/組件。",
      "在探索其鄰居之前，在第一次到達某個節點時標記已訪問過的節點。",
      "僅推送/遞歸到未訪問的邊界內鄰居。",
      "累積答案：組件數量、距離層或可達集。",
      "對於 BFS 距離，每步擴展一整層。",
    ],
    invariant:
      "**訪問一次不變。 ** 每個頂點在第一次到達時最多排隊/進入一次。為什麼這很重要：它透過防止重新探索來限制 O(V + E) 的總工作量，並且對於 BFS，它保證第一次到達沿著最短路徑，因為頂點是按非遞減距離順序發現的。標記訪問“在”出隊之後而不是在入隊時通過允許隊列中存在重複項來打破界限。",
    variants: [
      "DFS 連接元件：透過洪氾一次對 blob 進行計數。",
      "BFS 最短路徑（未加權）：距源的逐層距離。",
      "網格洪水填充：在擴展時標記訪問過的單元格。",
      "循環檢測：無向圖上的 DFS 顏色/聯合查找。",
      "多源 BFS：在距離 0 處為每個來源播種。",
    ],
    templateKeys: ["grid_dfs", "multi_source_bfs"],
    complexity: [
      "BFS 和 DFS 是 O(V + E)；對於 O(rows·cols) 的網格，因為每個單元格有 O(1) 個鄰居。隱藏成本是存取的結構，對於 BFS 來說，是佇列——兩者都是 O(V)。",
      "DFS 遞歸深度是 O(V) 最壞情況（長路徑/蛇網格），有堆疊溢出的風險；顯式堆疊可以避免它。",
      "邊表示很重要：鄰接表是 O(V+E) 空間，鄰接矩陣是 O(V^2)。",
    ],
    mistakes: [
      "標記訪問得太晚了。反例：在BFS中，標記一個節點僅在出隊時才被訪問，讓它首先被幾個鄰居入隊，從而炸毀隊列和時間。",
      "使用 DFS 表示未加權的最短路徑。反例：DFS可能先經過很長的路徑到達目標；只有 BFS 保證最少的步驟。",
      "忘記網格上的邊界/訪問。反例：遞歸離開邊緣或進入存取的儲存格會導致無限循環或超出範圍存取。",
      "鄰居集錯誤。反例：當問題意味著 4 向（或反之亦然）改變連接性和答案時，使用 8 向移動。",
    ],
    practice: [
      {
        id: 200,
        title: "島嶼數量",
        slug: "number-of-islands",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "網格洪水填充",
        why: "原型連通分量洪水填充。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 695,
        title: "島嶼最大面積",
        slug: "max-area-of-island",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "洪水填充尺寸",
        why: "洪水填充返回每個斑點的大小。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 733,
        title: "洪水填充",
        slug: "flood-fill",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "重新著色區域",
        why: "種子細胞的最小洪水填充。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 994,
        title: "腐爛的橙子",
        slug: "rotting-oranges",
        rating: 1433,
        difficulty: "Medium",
        subPattern: "多源BFS",
        why: "在 BFS 層中測量的同時傳播。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 547,
        title: "省份數量",
        slug: "number-of-provinces",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "相鄰組件",
        why: "計算鄰接矩陣中的分量。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 133,
        title: "複製圖",
        slug: "clone-graph",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "DFS/BFS 含克隆圖",
        why: "一邊建構節點一邊遍歷→複製地圖。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 130,
        title: "週邊地區",
        slug: "surrounded-regions",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "邊界錨定洪水",
        why: "洪水從邊境湧來，紀念倖存者。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 417,
        title: "太平洋大西洋水流",
        slug: "pacific-atlantic-water-flow",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "從邊緣反向可達性",
        why: "兩次洪水從海洋接壤，然後相交。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 127,
        title: "字梯",
        slug: "word-ladder",
        rating: 1800,
        difficulty: "Hard",
        subPattern: "隱式圖 BFS",
        why: "透過 BFS 進行文字編輯的最短轉換。",
        order: 9,
        tier: "Challenge Practice",
      },
      {
        id: 815,
        title: "巴士路線",
        slug: "bus-routes",
        rating: 1964,
        difficulty: "Hard",
        subPattern: "BFS過路線",
        why: "將路線（而非停靠站）建模為 BFS 節點。",
        order: 10,
        tier: "Challenge Practice",
      },
      {
        id: 1305,
        title: "兩個二元搜尋樹中的所有元素",
        slug: "all-elements-in-two-binary-search-trees",
        rating: 1260,
        difficulty: "Medium",
        subPattern: "DFS",
        why: "（可能是隱式的）圖上的 BFS/DFS 到達所有可到達的狀態，即章節的遍歷。",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 872,
        title: "葉相似樹",
        slug: "leaf-similar-trees",
        rating: 1288,
        difficulty: "Easy",
        subPattern: "DFS",
        why: "（可能是隱式的）圖上的 BFS/DFS 到達所有可到達的狀態，即章節的遍歷。",
        order: 12,
        tier: "Core Practice",
      },
      {
        id: 993,
        title: "二元樹中的表兄弟",
        slug: "cousins-in-binary-tree",
        rating: 1288,
        difficulty: "Easy",
        subPattern: "DFS",
        why: "（可能是隱式的）圖上的 BFS/DFS 到達所有可到達的狀態，即章節的遍歷。",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 2049,
        title: "計算得分最高的節點",
        slug: "count-nodes-with-the-highest-score",
        rating: 1912,
        difficulty: "Medium",
        subPattern: "DFS",
        why: "（可能是隱式的）圖上的 BFS/DFS 到達所有可到達的狀態，即章節的遍歷。",
        order: 14,
        tier: "Advanced Practice",
      },
      {
        id: 3939,
        title: "計算有根樹中的非相鄰子集",
        slug: "count-non-adjacent-subsets-in-a-rooted-tree",
        rating: 2354,
        difficulty: "Hard",
        subPattern: "DFS",
        why: "（可能是隱式的）圖上的 BFS/DFS 到達所有可到達的狀態，即章節的遍歷。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "答案是關於距離/步數（→ BFS）還是關於可達性/組件（→ DFS）？",
      "頂點和邊是什麼－這是一個秘密的網格還是一個隱式圖？",
      "我是否在正確的時刻標記已訪問（在 BFS 的排隊上）以保留每個節點一次？",
      "我的鄰居的移動和邊界檢查是否正是問題所在（4 方向與 8 方向）？",
    ],
    related: [
      "tree-traversal",
      "union-find",
      "topological-sort",
      "state-design",
    ],
  },
  {
    slug: "union-find",
    title: "聯查 (DSU)",
    group: "Graph Patterns",
    icon: "Combine",
    tagline: "透過近乎恆定的並集來維護不相交的集合，並尋找動態連接和分組。",
    concept: [
      "Union-Find 追蹤不斷壯大的聚會中的朋友群組：當兩個人被介紹時，他們的整個群組就會合併，要檢查兩個人是否有聯繫，您只需詢問他們是否有相同的群組領導即可。每個集合都是一棵樹，其根是領導者；`find` 走到根，`union` 將一個根連結到另一個根下。兩個最佳化使其接近 O(1)：路徑壓縮使行走變得平坦，按等級並集使樹保持淺層。",
      "它擅長「增量」連接（僅添加邊緣），而每次從頭開始重新計算組件將是一種浪費。",
      "該結構回答“這兩個在同一組中嗎？”以及“有多少套？”隨著圖表的增長。",
    ],
    motivation: [
      "對於「在這些並集之後 a 和 b 連接」的暴力破解，每個查詢會重新運行 BFS/DFS — `O(query · (V+E))`。範例：許多連接查詢與邊緣新增交錯。",
      "Union-Find 在壓縮後以接近 O(1) 的方式攤銷每個 `find`，因此整個序列幾乎是線性的。",
      "透過讀取代表性根來代替相同組件的重複重新遍歷。",
      "計數組件是免費的：從 V 開始，在每個成功的並集上遞減。",
    ],
    whenUse: [
      "如果您在新增的邊下方看到“這些是否已連接/相同的群組”，請考慮 DSU。",
      "如果您看到“計算連接的組件/省份/朋友圈”，請考慮 DSU 組件計數器。",
      "如果您看到「新增邊時偵測循環」（無向），請考慮 union 在現有對上傳回 false。",
      "如果您看到“冗餘邊/建造森林”，請認為 DSU 拒絕加入現有集合的邊。",
      "如果問題自然是離線的並且可以反向添加邊，請在反向時間軸上考慮 DSU。",
    ],
    coreIdea: [
      "將每個元素初始化為其自己的集合（父元素 = 其自身）。",
      "`find(x)` 跟隨父級到根，壓縮途中的路徑。",
      "`union(a, b)` 將較短的樹連結到較高的樹下（依等級聯合）。",
      "維護一個組件計數器，每次成功聯合時遞減。",
      "透過比較根來回答連通性。",
      "對於離線問題，請按照使結構單調的順序處理並集。",
    ],
    invariant:
      "**同根不變。 ** 當且僅當 `find` 傳回兩個元素相同的根時，兩個元素位於同一集合中。為什麼操作保留它：`union` 只將一個根連結到另一個根（從不分裂），因此連接性單調增長並且永遠不會錯誤報告，而路徑壓縮會更改父項，但不會更改集合的根身份。",
    variants: [
      "連通性查詢：比較一系列並集後的根。",
      "組件計數：追蹤不同組的數量。",
      "無向圖上的循環偵測：找到相等根的並集是循環。",
      "加權/帶大小 DSU：在根處儲存設定大小或相對偏移量。",
      "回滾/離線 DSU：撤銷聯合以回答變化圖上的查詢。",
    ],
    templateKeys: ["union_find", "mst_kruskal"],
    complexity: [
      "透過路徑壓縮和按等級並集，m 個操作在 O(m · α(n)) 中運行，其中 α 是逆阿克曼函數 — 實際上是常數。隱藏的成本是 α 雖然很小，但實際上並不是 O(1)，並且沒有兩種優化的簡單 DSU 每個操作會降級為 O(log n) 或 O(n)。",
      "父（和等級/大小）數組的空間為 O(n)。",
      "回滾 DSU 放棄路徑壓縮（以允許撤銷），每個操作的複雜度為 O(log n)。",
    ],
    mistakes: [
      "跳過優化。反例：n 個並集鏈上沒有等級/大小的並集建構一個鍊錶，使 `find` O(n) 和整個事物二次。",
      "比較父母而不是根源。反例：`parent[a] == parent[b]` 不連通；你必須比較`find(a) == find(b)`。",
      "元件計數錯誤。反例：即使兩個元素已經在同一集合中，計數器也會遞減，導致合併過度計數。",
      "使用帶有回滾的路徑壓縮。反例：壓縮會重寫祖先，因此簡單的撤消無法恢復它們 - 當您需要回滾時禁用壓縮。",
    ],
    practice: [
      {
        id: 684,
        title: "冗餘連接",
        slug: "redundant-connection",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "週期邊緣偵測",
        why: "其並集找到相等根的邊閉合一個循環。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 547,
        title: "省份數量",
        slug: "number-of-provinces",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "元件計數",
        why: "聯合鄰接，計算剩餘集合。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1319,
        title: "實現網路連線的操作次數",
        slug: "number-of-operations-to-make-network-connected",
        rating: 1633,
        difficulty: "Medium",
        subPattern: "備用邊緣與組件",
        why: "需要組件 - 1 條備用電纜來連接所有零件。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 803,
        title: "磚塊被擊中時掉落",
        slug: "bricks-falling-when-hit",
        rating: 2765,
        difficulty: "Hard",
        subPattern: "逆時聯合",
        why: "過程相反，用 DSU 添加磚塊。",
        order: 4,
        tier: "Challenge Practice",
      },
      {
        id: 1267,
        title: "計算通信的伺服器數量",
        slug: "count-servers-that-communicate",
        rating: 1375,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 3619,
        title: "計算總價值可被 K 整除的島嶼",
        slug: "count-islands-with-total-value-divisible-by-k",
        rating: 1461,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1361,
        title: "驗證二元樹節點",
        slug: "validate-binary-tree-nodes",
        rating: 1465,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2368,
        title: "有限制的可到達節點",
        slug: "reachable-nodes-with-restrictions",
        rating: 1477,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2658,
        title: "網格中的最大魚數",
        slug: "maximum-number-of-fish-in-a-grid",
        rating: 1490,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3493,
        title: "屬性圖",
        slug: "properties-graph",
        rating: 1565,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 827,
        title: "建造一個大島",
        slug: "making-a-large-island",
        rating: 1934,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1631,
        title: "最省力的路徑",
        slug: "path-with-minimum-effort",
        rating: 1948,
        difficulty: "Medium",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3695,
        title: "使用掉期最大化交替和",
        slug: "maximize-alternating-sum-using-swaps",
        rating: 1984,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 3600,
        title: "透過升級最大限度地提高生成樹穩定性",
        slug: "maximize-spanning-tree-stability-with-upgrades",
        rating: 2301,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2493,
        title: "將節點劃分為最大數量的群組",
        slug: "divide-nodes-into-the-maximum-number-of-groups",
        rating: 2415,
        difficulty: "Hard",
        subPattern: "union-find",
        why: "動態連接和分組是透過本章的結構 union-find 來維護的。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "是否僅添加邊緣（從不刪除），使增量 DSU 自然 - 還是我需要回滾？",
      "我是否透過 `find` 比較根，而不是原始父指標？",
      "我是否同時使用路徑壓縮和按等級/大小並集以保持接近恆定？",
      "逆向處理時間軸能否將刪除問題變成新增問題？",
    ],
    related: [
      "cut-property",
      "graph-traversal",
      "topological-sort",
      "segment-tree-and-fenwick-tree",
    ],
  },
  {
    slug: "segment-tree-and-fenwick-tree",
    title: "線段樹和 Fenwick 樹",
    group: "Range Query and Offline Techniques",
    icon: "Blocks",
    tagline:
      "透過將部分結果儲存在平衡的間隔樹上，以 O(log n) 的方式回答和更新範圍聚合。",
    concept: [
      "Fenwick 或線段樹是一種公司報告層次結構：每個經理都會保留整個團隊的運作總計，因此區域總計是一些經理報告的總和，而不是對每個員工進行輪詢。此陣列是員工；該樹按時間間隔儲存預先聚合的總數，因此範圍查詢涉及 O(log n) 個節點，並且更新會通知 O(log n) 個祖先。",
      "Fenwick（二進位索引）樹是點更新下前綴和的緊湊專家；線段樹是通用工具，還支援範圍更新（透過延遲傳播）和非求和聚合（最小值、最大值、gcd）。",
      "兩者都以 O(log n) 取代了每次查詢 O(n) 的暴力破解，不再重新計算總計已儲存的子範圍。",
    ],
    motivation: [
      "「偶爾更新的 [l, r] 總和」的暴力破解會重新計算每個查詢的範圍 — 每個查詢 `O(n)`，總計 `O(nq)`。範例：具有交錯更新和範圍求和查詢的陣列。",
      "Fenwick 樹儲存部分和，因此前綴和為 O(log n)，更新涉及 O(log n) 個單元；範圍總和是兩個前綴查詢。",
      "重疊範圍的重複重新求和被重新使用儲存的間隔總計所取代。",
      "當更新本身覆蓋範圍（將 5 加到 [l, r]）時，帶有惰性標記的線段樹會透過標記節點並僅在需要時下推，將工作推遲到 O(log n)。",
    ],
    whenUse: [
      "如果您看到帶有範圍總和/最小/最大查詢的點更新，請考慮 Fenwick（總和）或線段樹（任何聚合）。",
      "如果您同時看到範圍更新和範圍查詢，請考慮具有延遲傳播的線段樹。",
      "如果您看到「向右計數更小/更大」或倒置，請考慮使用 Fenwick 壓縮值。",
      "如果您看到離線查詢可按閾值排序，請考慮 Fenwick 增量填充。",
      "如果您只需要點更新下的前綴和，則更喜歡 Fenwick，因為它的常數和程式碼大小較小。",
    ],
    coreIdea: [
      "決定聚合（總和、最小值、最大值、gcd）以及更新是點還是範圍。",
      "選擇 Fenwick 來實現前綴和/點更新的簡單性，選擇線段樹來實現一般聚合或範圍更新。",
      "建立樹，以便每個節點儲存其間隔的聚合。",
      "透過組合完全涵蓋範圍的 O(log n) 個規範節點進行查詢。",
      "透過調整受影響的節點及其 O(log n) 祖先進行更新。",
      "對於範圍更新，儲存一個延遲標籤並在遞歸之前將其延遲下推。",
    ],
    invariant:
      "**節點聚合不變性。 ** 每個樹節點都保存其間隔的正確聚合，前提是其祖先上的待處理惰性標記已被下推。為什麼 O(log n) 就足夠了：任何範圍都分解為 O(log n) 規範節點間隔，其存儲的聚合組合成答案，並且更新僅更改覆蓋所觸及索引的 O(log n) 節點 - 因此這兩個操作都不會檢查整個數組。",
    variants: [
      "芬威克點更新 + 前綴/範圍總和。",
      "Fenwick 用於對座標壓縮值進行反演計數。",
      "線段樹點更新+範圍最小值/最大值/總和。",
      "用於範圍更新+範圍查詢的延遲傳播的線段樹。",
      "根據聚合類型和更新粒度選擇 Fenwick 與線段樹。",
    ],
    templateKeys: [
      "fenwick_basic",
      "segment_tree_lazy",
      "coordinate_compression_fenwick",
    ],
    complexity: [
      "建置時間複雜度為 O(n)；每次查詢/更新都是 O(log n)。線段樹中的隱藏成本是惰性下推：忘記它會使範圍查詢默默地錯誤，並且這樣做會增加與 Fenwick 相比的常數因子。",
      "對於 Fenwick，空間為 O(n)；對於遞迴線段樹，空間為 O(4n)。",
      "當值稀疏/較大時，座標壓縮會加入 O(n log n) 預處理步驟。",
    ],
    mistakes: [
      "忘記推送惰性標籤。反例：在範圍更新後查詢子項而不推送父項的標籤會傳回陳舊的更新前總和。",
      "1-Fenwick 的索引錯誤。反例：使用基於 0 的索引呼叫 `update`/`query`，而沒有內部 `++i` 會跳過索引 0 或讀取超出範圍。",
      "使用 Fenwick 進行不可逆聚合。反例：範圍min不能用「前綴減前綴」來回答；使用線段樹。",
      "累計溢位。反例：將`10^9`附近的`10^5`值求和會溢位`int`；將總和儲存在 `long long` 中。",
    ],
    practice: [
      {
        id: 307,
        title: "範圍總和查詢 - 可變",
        slug: "range-sum-query-mutable",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "點更新+範圍總和",
        why: "基本 Fenwick / 線段樹用例。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 315,
        title: "數出自身之後較小的數字",
        slug: "count-of-smaller-numbers-after-self",
        rating: 2200,
        difficulty: "Hard",
        subPattern: "芬威克 (Fenwick) 壓縮價值",
        why: "帶有座標壓縮的反轉式計數。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 327,
        title: "範圍總和的計數",
        slug: "count-of-range-sum",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "前綴和+有序計數",
        why: "計算值帶內的前綴和對。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2179,
        title: "計算數組中好的三元組數",
        slug: "count-good-triplets-in-an-array",
        rating: 2272,
        difficulty: "Hard",
        subPattern: "中間有兩個芬威克",
        why: "用左/右 Fenwick 計數列舉中間部分。",
        order: 4,
        tier: "Challenge Practice",
      },
      {
        id: 218,
        title: "天際線問題",
        slug: "the-skyline-problem",
        rating: 0,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 406,
        title: "按高度重建佇列",
        slug: "queue-reconstruction-by-height",
        rating: 0,
        difficulty: "Medium",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 673,
        title: "最長遞增子序列的數量",
        slug: "number-of-longest-increasing-subsequence",
        rating: 0,
        difficulty: "Medium",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 715,
        title: "量程模組",
        slug: "range-module",
        rating: 0,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 732,
        title: "我的日曆 III",
        slug: "my-calendar-iii",
        rating: 0,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3187,
        title: "陣列中的峰",
        slug: "peaks-in-array",
        rating: 2154,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3072,
        title: "將元素分佈到兩個數組 II",
        slug: "distribute-elements-into-two-arrays-ii",
        rating: 2053,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3739,
        title: "使用多數元素計數子數組 II",
        slug: "count-subarrays-with-majority-element-ii",
        rating: 2090,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2193,
        title: "形成回文的最少移動次數",
        slug: "minimum-number-of-moves-to-make-palindrome",
        rating: 2091,
        difficulty: "Hard",
        subPattern: "芬威克樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 1521,
        title: "找到最接近目標的神秘函數的值",
        slug: "find-a-value-of-a-mysterious-function-closest-to-target",
        rating: 2384,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2569,
        title: "更新後處理總和查詢",
        slug: "handling-sum-queries-after-update",
        rating: 2398,
        difficulty: "Hard",
        subPattern: "線段樹",
        why: "使用範圍查詢進行點更新（反之亦然）需要一個 Fenwick/線段樹，即章節的結構。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "更新是點還是範圍，查詢是範圍聚合——這決定了 Fenwick 與惰性線段樹？",
      "聚合是可逆的（總和），所以 Fenwick 可以工作，還是基於順序（最小/最大）需要線段樹？",
      "由於值很大或稀疏，我是否需要坐標壓縮？",
      "如果我使用惰性傳播，我是否會在每次遞歸下降之前向下推？",
    ],
    related: [
      "coordinate-compression",
      "offline-query-processing",
      "difference-array",
      "enumerate-pivot-middle",
    ],
  },
  {
    slug: "topological-sort",
    title: "拓撲排序",
    group: "Graph Patterns",
    icon: "Waypoints",
    tagline: "將 DAG 的頂點排序，使每條邊都指向前方；排序本身通常就是答案。",
    concept: [
      "拓樸排序是根據先決條件來安排任務，例如穿衣服：先穿襪子再穿鞋，先穿襯衫再穿夾克。有效的順序是任何先決條件都出現在需要它的事物之前的順序。當不存在循環依賴關係（有向圖中沒有循環）時，這種順序恰好存在。",
      "卡恩演算法透過重複執行沒有剩餘先決條件的任務（入度 0）來建構順序； DFS 變體以相反的完成順序發出節點。",
      "除了排序之外，它還可以充當循環檢測器：如果無法對每個節點進行排序，則該圖就有一個循環。",
    ],
    motivation: [
      "對於「是否存在有效的課程順序」的蠻力可能會嘗試排列 - 階乘。例：有先決條件對的課程。",
      "相反，Kahn 的演算法計算入度，對入度為零的節點進行排隊，然後將它們一一剝離，從而減少鄰居的入度 — `O(V + E)`。",
      "嘗試無效訂單的浪費工作被始終擴展保證有效的前綴所取代。",
      "如果發出的順序短於 V，則剩餘節點形成一個循環 - 因此檢測和排序來自同一遍。",
    ],
    whenUse: [
      "如果您看到先決條件/依賴關係並“找到順序”，請考慮拓撲排序。",
      "如果您看到“是否可以完成/沒有循環依賴”，請將拓撲排序視為循環檢測。",
      "如果您在 DP 之前看到“按依賴順序處理”，請將拓撲順序視為預處理。",
      "如果訂購本身就是可交付成果（建立訂單、配方訂單），請考慮 Kahn 的 BFS。",
      "如果您還需要知道哪些節點在循環上，請考慮 DFS 三色狀態。",
    ],
    coreIdea: [
      "建立有向鄰接表併計算入度（對於卡恩）。",
      "將入度為 0 的每個頂點進行排隊。",
      "重複彈出一個頂點，將其附加到順序中，並減少其鄰居的入度。",
      "將任何入度達到 0 的鄰居入隊。",
      "如果訂單長度等於V，則訂單有效；否則存在循環。",
      "對於 DFS 變體，以相反的後序發出節點並使用顏色來捕捉後緣。",
    ],
    invariant:
      "**先決條件完成不變。 ** 只有當頂點的所有先決條件都已出現在其中（其入度已降至 0）後，才會將頂點附加到順序。為什麼這會產生有效的拓撲順序：每條邊 u→v 都得到滿足，因為 v 僅在 u 發出一次後才發出，並且從未達到入度 0 的頂點可以證明被困在循環後面 - 使相同的演算法成為健全的循環測試。",
    variants: [
      "Kahn的BFS：剝離零入度節點；自然用於生產訂單。",
      "DFS後序：反向整理順序；自然的遞迴。",
      "週期偵測：短Kahn輸出，或DFS後沿（灰色節點）。",
      "依字典順序最小順序：用最小堆取代佇列。",
      "排序作為答案：建構/配方/編譯序列。",
    ],
    templateKeys: ["topo_kahn", "topo_dfs"],
    complexity: [
      "兩種變體都是 O(V + E)；隱藏的成本是建立鄰接表和入度數組，這也是 O(V + E) 但很容易分配不足。",
      "字典順序最小順序的最小堆將其提升到 O(V log V + E)。",
      "圖的空間為 O(V + E)，加上入度/隊列/遞歸的 O(V)。",
    ],
    mistakes: [
      "反轉邊緣方向。反例：將邊加入為 `course → prereq` 而不是 `prereq → course` 會產生違反每個依賴性的順序。",
      "未檢測到循環。反例：傳回部分順序而不檢查 `order.size() == V` 在循環輸入上傳回無效（不完整）序列。",
      "重新計算度數不正確。反例：增加錯誤端點的入度會在佇列中播種錯誤的節點並立即停止。",
      "DFS 無「灰色」狀態。反例：僅標記訪問/完成無法區分交叉邊緣和後邊緣，從而丟失了一些週期。",
    ],
    practice: [
      {
        id: 207,
        title: "課程安排",
        slug: "course-schedule",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "循環檢測",
        why: "完成能力正是無循環性。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 210,
        title: "課程安排二",
        slug: "course-schedule-ii",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "生產訂單",
        why: "傳回有效的拓樸順序（或循環上為空）。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2115,
        title: "從給定的補給中找到所有可能的食譜",
        slug: "find-all-possible-recipes-from-given-supplies",
        rating: 1679,
        difficulty: "Medium",
        subPattern: "依賴解析",
        why: "食譜取決於可能是其他食譜的成分。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1462,
        title: "課程安排四",
        slug: "course-schedule-iv",
        rating: 1693,
        difficulty: "Medium",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 851,
        title: "響亮而豐富",
        slug: "loud-and-rich",
        rating: 1783,
        difficulty: "Medium",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2192,
        title: "有向無環圖中節點的所有祖先",
        slug: "all-ancestors-of-a-node-in-a-directed-acyclic-graph",
        rating: 1788,
        difficulty: "Medium",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 2360,
        title: "圖中的最長週期",
        slug: "longest-cycle-in-a-graph",
        rating: 1897,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 310,
        title: "最小高度樹木",
        slug: "minimum-height-trees",
        rating: 0,
        difficulty: "Medium",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 329,
        title: "矩陣中最長的遞增路徑",
        slug: "longest-increasing-path-in-a-matrix",
        rating: 0,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2392,
        title: "建立有條件的矩陣",
        slug: "build-a-matrix-with-conditions",
        rating: 1961,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 802,
        title: "找到最終的安全狀態",
        slug: "find-eventual-safe-states",
        rating: 1962,
        difficulty: "Medium",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3620,
        title: "網路恢復途徑",
        slug: "network-recovery-pathways",
        rating: 1998,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1857,
        title: "有向圖中的最大顏色值",
        slug: "largest-color-value-in-a-directed-graph",
        rating: 2313,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3530,
        title: "DAG 中有效拓樸順序的最大利潤",
        slug: "maximum-profit-from-valid-topological-order-in-dag",
        rating: 2353,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1203,
        title: "依尊重依賴性的組別對項目進行排序",
        slug: "sort-items-by-groups-respecting-dependencies",
        rating: 2419,
        difficulty: "Hard",
        subPattern: "拓撲排序",
        why: "依賴關係形成一個 DAG，必須按照拓樸順序（章節的模式）來處理。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "圖是有向的嗎？邊編碼「必須先於」嗎？",
      "我是否將邊緣先決條件→依賴定位，以便入度意味著「未滿足的先決條件」？",
      "我是否檢查 `order.size() == V` 到地面循環？",
      "排序本身就是答案，還是只是為以後的 DP 進行預處理？",
    ],
    related: [
      "graph-traversal",
      "union-find",
      "dp-transition-design",
      "state-design",
    ],
  },
  {
    slug: "interval-merging",
    title: "區間合併",
    group: "Core Array/String Patterns",
    icon: "CalendarRange",
    tagline: "按端點對間隔進行排序，然後掃描一次以合併、插入或貪婪地計算重疊。",
    concept: [
      "合併間隔是將重疊的日曆約會合併到忙碌的區塊中：一旦會議按開始時間列出，您就可以沿著清單向下走，每當下一個會議在當前區塊結束之前開始時，您就可以延長該區塊；否則，您將其關閉並打開一個新的。排序將全局重疊問題轉變為局部“這是否觸及前一個？”查看。",
      "排序鍵的選擇很重要：按開始排序以合併/插入，按結束排序以最大化非重疊或計算最小刪除/箭頭。",
      "它本質上是貪婪的，透過對所選端點順序的交換參數來證明其合理性。",
    ],
    motivation: [
      "蠻力比較每個間隔對的重疊並將它們聯合起來 - `O(n^2)`。範例：`[[1, 3], [2, 6], [8, 10], [15, 18]]`。",
      "按開始排序；現在重疊是相鄰的，因此一次傳遞要么擴展最後一個區塊（`start <= lastEnd`），要么開始一個新區塊 - `O(n log n)`。",
      "重複的成對重疊檢查會分解為單一鄰居比較。",
      "對於“最小箭頭/最大不重疊”，按末尾排序並貪婪地保留最早完成的間隔，丟棄任何重疊的內容。",
    ],
    whenUse: [
      "如果您看到“合併重疊間隔”，請考慮按開始排序然後掃描。",
      "如果您看到“將間隔插入排序集中”，請考慮在三相掃描之前/重疊/之後。",
      "如果您看到“最大不重疊/最小移除/最小箭頭”，請考慮按末尾排序+貪婪保留。",
      "如果您看到“最小會議室/最大並發數”，請考慮掃描或結束時間堆。",
      "如果您看到有截止日期的調度，請考慮按決定端點排序，然後貪婪。",
    ],
    coreIdea: [
      "確定目標：合併（按開始排序）與選擇/計數非重疊（按結束排序）。",
      "依該端點對間隔進行排序。",
      "掃描一次，追蹤目前合併的區塊或最後保留的間隔的結尾。",
      "在重疊時，擴展區塊（合併）或跳過間隔（選擇）。",
      "在沒有重疊的情況下，發出/開啟一個新區塊或保持間隔並推進邊界。",
      "使用排序鍵上的交換參數確認貪婪選擇。",
    ],
    invariant:
      "**边界单调不变。 ** 在按排序順序處理間隔後，運行邊界（最後合併的端或最後保留的端）是迄今為止所見的最緊密的邊界。為什麼合併是正確的：因為開始是非遞減的，任何與較早的區塊重疊的間隔都必須與當前區塊重疊，因此單個鄰居測試永遠不會錯過重疊；對於最終排序的選擇，保留最早的完成者會留下最大的空間，並且通過交換是最佳的。",
    variants: [
      "合併重疊間隔（按開始排序）。",
      "將間隔插入已排序的、不重疊的集合中（三相）。",
      "使不重疊的最小移除量（按末尾排序，計數重疊）。",
      "爆炸氣球的最小箭頭（按末端排序，共享點貪婪）。",
      "劃分為最小組/會議室（清理或結束時間堆）。",
    ],
    templateKeys: ["merge_intervals", "exchange_greedy"],
    complexity: [
      "以 O(n log n) 排序為主；掃描本身是 O(n)。隱藏的成本是排序鍵的選擇——按錯誤的端點排序會使貪心演算法被證明是錯誤的，而不僅僅是緩慢的。",
      "輸出的空間為 O(n)（或用於計數變體的額外空間為 O(1)）。",
      "基於堆的並發變體添加了 O(log n) 每個時間間隔因子。",
    ],
    mistakes: [
      "排序的端點錯誤。反例：透過在開始時排序來最大化非重疊間隔在 `[[1, 100], [2, 3], [3, 4]]` 上失敗（開始排序保留 1 間隔；結束排序保留 2）。",
      "邊界包含性錯誤。反例：將 `[1, 2]` 和 `[2, 3]` 視為重疊（或不重疊）會不一致地變更箭頭/房間計數 - 修正觸控端點是否計數。",
      "迭代時變異。反例：在掃描過程中從向量中擦除會使索引無效；相反，建立新的結果。",
      "忘記用 max 來擴充。反例：當巢狀間隔提前結束時，設定 `lastEnd = cur.end` 而不是 `max(lastEnd, cur.end)` 會縮小區塊。",
    ],
    practice: [
      {
        id: 56,
        title: "合併間隔",
        slug: "merge-intervals",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "按開始+合併排序",
        why: "規範的合併掃描。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 57,
        title: "插入間隔",
        slug: "insert-interval",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "之前/重疊/之後",
        why: "三相插入有序集合。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 435,
        title: "非重疊區間",
        slug: "non-overlapping-intervals",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "按尾排序+貪心保留",
        why: "透過最早完成的貪心演算法進行最小移除。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 452,
        title: "爆破氣球的最少箭數",
        slug: "minimum-number-of-arrows-to-burst-balloons",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "共享點貪婪",
        why: "在重疊範圍上進行最終貪婪排序。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2406,
        title: "將間隔分割為最少數量的群組",
        slug: "divide-intervals-into-minimum-number-of-groups",
        rating: 1713,
        difficulty: "Medium",
        subPattern: "最大並發掃描",
        why: "最小組等於高峰重疊。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 1200,
        title: "最小絕對差",
        slug: "minimum-absolute-difference",
        rating: 1199,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3536,
        title: "兩位數的最大乘積",
        slug: "maximum-product-of-two-digits",
        rating: 1199,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1491,
        title: "平均工資，不包括最低和最高工資",
        slug: "average-salary-excluding-the-minimum-and-maximum-salary",
        rating: 1201,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2148,
        title: "計算嚴格較小和較大元素的元素",
        slug: "count-elements-with-strictly-smaller-and-greater-elements",
        rating: 1202,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3774,
        title: "最大和最小 K 個元素之間的絕對差",
        slug: "absolute-difference-between-maximum-and-minimum-k-elements",
        rating: 1206,
        difficulty: "Easy",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3897,
        title: "連接二進位段的最大值",
        slug: "maximum-value-of-concatenated-binary-segments",
        rating: 1998,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3886,
        title: "可排序整數總和",
        slug: "sum-of-sortable-integers",
        rating: 1999,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 2448,
        title: "使數組相等的最小成本",
        slug: "minimum-cost-to-make-array-equal",
        rating: 2005,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 1330,
        title: "反轉子數組以最大化數組值",
        slug: "reverse-subarray-to-maximize-array-value",
        rating: 2482,
        difficulty: "Hard",
        subPattern: "greedy",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2035,
        title: "將數組劃分為兩個數組以最小化總和差異",
        slug: "partition-array-into-two-arrays-to-minimize-sum-difference",
        rating: 2490,
        difficulty: "Hard",
        subPattern: "sorting",
        why: "按端點對間隔進行排序並進行掃描合併或正確選擇它們，即章節的模式。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我的目標是合併（按開始排序）還是選擇/計數非重疊（按結束排序）？",
      "對於此問題，接觸端點是否算重疊？",
      "我是否用最大值擴展了邊界，以便嵌套間隔不會縮小它？",
      "我可以透過排序鍵上的交換參數來證明貪婪的保留/跳過嗎？",
    ],
    related: [
      "sorting-as-a-tool",
      "sweep-line",
      "exchange-argument",
      "greedy-stays-ahead",
    ],
  },
  {
    slug: "string-matching",
    title: "字串模式匹配",
    group: "String Patterns",
    icon: "Regex",
    tagline: "使用 KMP 失效函數、Z 函數和捲動雜湊在線性時間內尋找模式。",
    concept: [
      "樸素的子字串搜尋是根據每個鎖位置檢查鑰匙，並在每次不匹配時從頭開始 - 丟棄您剛剛學到的所有內容。線性時間匹配保留了這些知識：當字元不匹配時，預先計算的表會告訴您最大的安全移位，因此您永遠不會重新檢查已經匹配的文字。 KMP、Z 函數和滾動雜湊是三種記住方式。",
      "KMP 為每個模式前綴預先計算最長的正確前綴，它也是後綴（失敗函數），因此不匹配會在不移動文字指標的情況下回退。",
      "Z 函數將其概括為每個位置處的“與整個字串前綴的最長匹配”，並且滾動雜湊允許您在 O(n) 設定後以 O(1) 的時間比較子字串。",
    ],
    motivation: [
      "蠻力在每個文字位置對齊模式並重新比較最多 m 個字元 — `O(n·m)`。範例：文字 `aaaaab`，模式 `aaab` 重複重新掃描 a 的運作。",
      "KMP 在 O(m) 內建立一次故障表；如果模式索引 j 不匹配，它會跳到 `lps[j - 1]` 而不是重新啟動，因為已知該前綴匹配。",
      "相同角色的重複重新比較——O(n·m) 爆炸的核心——正是失敗函數刪除的內容，給出 O(n + m)。",
      "滾動哈希以不同的方式攻擊它：對模式進行一次哈希，在文字中滾動視窗哈希，並在 O(1) 中比較哈希（在命中時進行 O(m) 驗證以消除衝突）。",
    ],
    whenUse: [
      "如果您看到大規模的“查找/索引子字串”，請考慮 KMP 或 Z 函數而不是樸素搜尋。",
      "如果您看到“週期性/重複子字串/最短週期”，請考慮 KMP 失效函數或 Z。",
      "如果您看到“最短回文/最長前綴後綴”，請考慮 KMP 的巧妙串聯。",
      "如果您看到“比較多個子字串是否相等”，請考慮使用滾動雜湊進行 O(1) 比較。",
      "如果您需要每個位置的前綴匹配長度，請考慮 Z 函數。",
    ],
    coreIdea: [
      "決定必須計算的內容：單一出現、所有出現、句點或子字串相等。",
      "對於發生/週期，在 O(m) 中建置模式的失敗 (LPS) 或 Z 陣列。",
      "掃描一次文本，將兩個指針向前移動到匹配的位置。",
      "如果不匹配，則透過表格回退模式指針，而不移動文字指針。",
      "對於散列，預先計算前綴散列和冪，然後比較 O(1) 範圍並驗證命中。",
      "選擇大模數/雙散列來控制碰撞風險。",
    ],
    invariant:
      "**匹配前缀不变。 ** 在每個文字位置，演算法知道在此結束的最長模式前綴的長度，並且該前綴與文字真正匹配。為什麼 O(n + m) 成立：文字指標永遠不會向後移動，並且每個回退嚴格縮短匹配的前綴，因此指針移動的總數是線性的 - 失敗表將看起來像嵌套循環的內容轉換為單一前向掃描。",
    variants: [
      "KMP搜尋：失敗功能+不回溯文字掃描。",
      "KMP 週期：除以 n 時最短週期為 `n - lps[n - 1]`。",
      "Z函數搜尋：建立`pattern + sep + text`的Z，尋找Z = m。",
      "滾動雜湊 (Rabin-Karp)：O(1) 子串比較與驗證。",
      "透過 KMP 連接的最短回文/前綴後綴技巧。",
    ],
    templateKeys: ["kmp", "z_function"],
    complexity: [
      "KMP 和 Z 是 O(n + m) 時間，O(m)（或 O(n)）空間；隱藏的成本是預處理表，很容易錯誤索引。",
      "滾動雜湊預計為 O(n + m)，但在沒有驗證的情況下，最壞情況為 O(n·m)，因為衝突會強制進行全面比較。",
      "雙散列或 64 位元模數以恆定因子成本降低了衝突機率。",
    ],
    mistakes: [
      "LPS 陣列中相差一。反例：將 `lps[0]` 設為 0 以外的任何值，或混合前綴長度和索引變量，都會破壞每個回退。",
      "將文字指標移到不匹配的位置。反例：當不匹配後的 `j > 0` 時遞增 `i` 會跳過潛在的匹配 — 僅回退到 `j`。",
      "信任哈希值而不進行驗證。反例：兩個不同的子字串可以共享一個hash；除非您重新比較命中，否則碰撞會報告錯誤匹配。",
      "弱哈希基/模數。反例：對抗性輸入的小模量會導致質量碰撞，退化為 O(n·m)。",
    ],
    practice: [
      {
        id: 28,
        title: "尋找字串中第一次出現的索引",
        slug: "find-the-index-of-the-first-occurrence-in-a-string",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "KMP / Z 搜索",
        why: "基本子串搜尋問題。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 459,
        title: "重複子串模式",
        slug: "repeated-substring-pattern",
        rating: 1400,
        difficulty: "Easy",
        subPattern: "KMP 週期性",
        why: "通過 `n - lps[n - 1]` 的周期。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 214,
        title: "最短回文",
        slug: "shortest-palindrome",
        rating: 1800,
        difficulty: "Hard",
        subPattern: "KMP on s + '#' + 反向",
        why: "失敗函數的最長回文前綴。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1455,
        title: "檢查某個單字是否以句子中任何單字的前綴出現",
        slug: "check-if-a-word-occurs-as-a-prefix-of-any-word-in-a-sentence",
        rating: 1126,
        difficulty: "Easy",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 796,
        title: "旋轉字串",
        slug: "rotate-string",
        rating: 1167,
        difficulty: "Easy",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2185,
        title: "計算具有給定前綴的單字數",
        slug: "counting-words-with-a-given-prefix",
        rating: 1167,
        difficulty: "Easy",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3042,
        title: "計算前綴和後綴對 I",
        slug: "count-prefix-and-suffix-pairs-i",
        rating: 1214,
        difficulty: "Easy",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1408,
        title: "數組中的字串匹配",
        slug: "string-matching-in-an-array",
        rating: 1223,
        difficulty: "Easy",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3034,
        title: "與模式 I 相符的子數組的數量",
        slug: "number-of-subarrays-that-match-a-pattern-i",
        rating: 1384,
        difficulty: "Medium",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1147,
        title: "最長分塊回文分解",
        slug: "longest-chunked-palindrome-decomposition",
        rating: 1912,
        difficulty: "Hard",
        subPattern: "滾動哈希",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3008,
        title: "在給定數組中找到漂亮的索引 II",
        slug: "find-beautiful-indices-in-the-given-array-ii",
        rating: 2016,
        difficulty: "Hard",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 2156,
        title: "尋找具有給定哈希值的子字串",
        slug: "find-substring-with-given-hash-value",
        rating: 2063,
        difficulty: "Hard",
        subPattern: "滾動哈希",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3455,
        title: "最短匹配子字串",
        slug: "shortest-matching-substring",
        rating: 2303,
        difficulty: "Hard",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3045,
        title: "計數前綴和後綴對 II",
        slug: "count-prefix-and-suffix-pairs-ii",
        rating: 2328,
        difficulty: "Hard",
        subPattern: "字串匹配",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1044,
        title: "最長重複子字串",
        slug: "longest-duplicate-substring",
        rating: 2429,
        difficulty: "Hard",
        subPattern: "滾動哈希",
        why: "透過失效函數或雜湊的線性時間匹配避免了二次掃描，即本章的模式。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我需要單一匹配、所有匹配、句點還是多個子字串比較？",
      "我可以預先計算失敗/Z 數組，以便文字指標永遠不會回溯嗎？",
      "如果我散列，我是否會驗證命中以防止衝突？",
      "我的模數/基數對於對抗性輸入來說夠強大嗎？",
    ],
    related: [
      "trie",
      "hash-map-frequency",
      "prefix-suffix-decomposition",
      "loop-invariant",
    ],
  },
  {
    slug: "trie",
    title: "Trie",
    group: "String Patterns",
    icon: "ListTree",
    tagline:
      "將字串儲存在前綴樹中，以進行 O(L) 插入/搜尋和共用前綴查詢，包括位元異或嘗試。",
    concept: [
      "trie 是一種按字母選項卡組織的電話簿：所有以“CA”開頭的姓名都位於 C 選項卡下，然後是 A 選項卡下，因此查找或添加姓名時一次跟隨一個字母，並且共享前綴會存儲一次。每個節點代表一個前綴；每條邊都是一個字元；標誌標記了真正單字的結束位置。",
      "這使得前綴查詢 (`startsWith`) 和字典查找為 O(length)，與儲存的單字數量無關。",
      "相同的形狀，以位而不是字母為分支，成為一個二進制特里樹，通過在每個級別貪婪地選擇相反的位來回答最大異或查詢。",
    ],
    motivation: [
      "「是否有任何儲存的單字以前綴開頭」的暴力破解會掃描所有單字並比較前綴 - `O(words · L)`。例：一本字典加上許多前綴查詢。",
      "trie 遍歷前綴一次；到達節點證明某個單字具有該前綴 - 每次查詢 `O(L)`，無論字典大小如何。",
      "由於共享前綴共享路徑，因此消​​除了對不相關單字的重複重新掃描。",
      "為了獲得最大的 XOR，請逐位插入數字；對於查詢，每個位元都貪婪地下降到相反的位，因此只要有可能就設定 XOR 的高位。",
    ],
    whenUse: [
      "如果您看到很多單字和 prefix/startsWith/autocomplete 查詢，請考慮使用 trie。",
      "如果您看到帶有通配符 (`.`) 的單字字典，請考慮使用分支搜尋的 trie。",
      "如果您看到“最大/最小異或對/子數組”，請考慮二進制（按位）特里樹。",
      "如果您看到“在帶有字典的板上進行單字搜尋”，請考慮嘗試修剪 DFS。",
      "如果記憶體很重要且字母表是固定的，請考慮使用陣列索引特里樹。",
    ],
    coreIdea: [
      "建立一個根節點，每個字母符號有一個子槽（或位元有兩個子槽）。",
      "透過遍歷/建立每個字元一個節點並標記終端節點來插入。",
      "透過行走路徑來搜尋/startsWith；缺少邊意味著不匹配。",
      "對於通配符，當查詢字元是通配符時，分支到所有子層級。",
      "對於 XOR 查詢，從高到低儲存位並貪婪地取相反的位元。",
      "透過約束選擇基於指標（稀疏）或基於數組（密集、更快）的節點。",
    ],
    invariant:
      "**前綴路徑不變。 ** 從根到任何節點的路徑準確地拼寫該節點表示的前綴，並且當且僅當某些路徑在標記的終端節點上結束時才會儲存單字。為什麼查詢是 O(L)：每個字元只前進一個邊緣，因此搜尋成本僅取決於查詢長度，而不取決於儲存的單字數量 - 並且共享前綴在物理上是共享的，因此儲存受到總不同前綴字元的限制。",
    variants: [
      "基於指標的 trie：每個使用的前綴分配一個節點（稀疏、靈活）。",
      "基於陣列的 trie：每個節點一個固定的子陣列（密集、快取友善、更快）。",
      "通配符搜尋樹：對 `.` 上的所有子節點進行分支。",
      "用於 XOR 最大化的二進位 trie：位元分支，貪婪地取相反值。",
      "Trie + DFS 剪枝：當沒有單字分享當前前綴時停止董事會搜尋。",
    ],
    templateKeys: ["trie_pointer", "trie_xor"],
    complexity: [
      "每個單字的插入/搜尋時間複雜度為 O(L)；隱藏的成本是記憶體——數組節點高達 O(總字元·字母表)，這對於大型字母表來說可能占主導地位。",
      "對於固定寬度整數，二進位 trie 的每個數字的複雜度為 O(32) 或 O(64)。",
      "指標嘗試交換記憶體以獲得靈活性；陣列嘗試以記憶體換取速度。",
    ],
    mistakes: [
      "忘記終端標誌。反例：持有 `apple` 的 trie 會將 `app` 報告為儲存的單詞，除非 `isEnd` 標誌將單字與單純的前綴區分開。",
      "不處理缺失的邊緣。反例：在搜尋崩潰期間取消引用空子級而不是傳回 false。",
      "XOR trie 中的位元順序錯誤。反例：從低到高插入位會使貪婪選擇最佳化錯誤（低）位，從而失去最大值。",
      "字母大小。反例：26 槽數組在大寫/數字/Unicode 上失敗；將子數組的大小設定為實際字母表的大小。",
    ],
    practice: [
      {
        id: 208,
        title: "實作 Trie（前綴樹）",
        slug: "implement-trie-prefix-tree",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "插入/搜尋/開始",
        why: "基本特里樹 API。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 211,
        title: "設計新增和搜尋單字資料結構",
        slug: "design-add-and-search-words-data-structure",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "通配符分支搜索",
        why: "嘗試搜尋在「.」上分支的內容通配符。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 212,
        title: "單字搜尋 II",
        slug: "word-search-ii",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "三剪板 DFS",
        why: "trie 修剪多詞網格搜尋。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2932,
        title: "最大強對 XOR I",
        slug: "maximum-strong-pair-xor-i",
        rating: 1246,
        difficulty: "Easy",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3597,
        title: "分區字串",
        slug: "partition-string",
        rating: 1347,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2452,
        title: "字典兩次編輯內的單字",
        slug: "words-within-two-edits-of-dictionary",
        rating: 1460,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1023,
        title: "駝峰匹配",
        slug: "camelcase-matching",
        rating: 1537,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1233,
        title: "從檔案系統中刪除子資料夾",
        slug: "remove-sub-folders-from-the-filesystem",
        rating: 1545,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1268,
        title: "搜尋建議系統",
        slug: "search-suggestions-system",
        rating: 1573,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 2227,
        title: "加密和解密字串",
        slug: "encrypt-and-decrypt-strings",
        rating: 1945,
        difficulty: "Hard",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 1032,
        title: "字元流",
        slug: "stream-of-characters",
        rating: 1970,
        difficulty: "Hard",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3291,
        title: "形成目標 I 的有效字串的最小數量",
        slug: "minimum-number-of-valid-strings-to-form-target-i",
        rating: 2082,
        difficulty: "Medium",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3845,
        title: "有界範圍的最大子數組異或",
        slug: "maximum-subarray-xor-with-bounded-range",
        rating: 2347,
        difficulty: "Hard",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 1803,
        title: "使用 XOR 計算一定範圍內的對數",
        slug: "count-pairs-with-xor-in-a-range",
        rating: 2479,
        difficulty: "Hard",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 1938,
        title: "最大遺傳差異查詢",
        slug: "maximum-genetic-difference-query",
        rating: 2503,
        difficulty: "Hard",
        subPattern: "trie",
        why: "前綴樹共享公共前綴，因此查找是有長度限制的，即章節的結構。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "是否有許多字串共享前綴，查詢是否關心前綴？",
      "我是否需要哈希集無法做到的通配符或模糊匹配？",
      "這實際上是一個可以用二進位 trie 解決的位元異或問題嗎？",
      "給定字母表和計數，基於指標或基於數組是正確的節點佈局嗎？",
    ],
    related: [
      "string-matching",
      "hash-map-frequency",
      "state-compression",
      "backtracking",
    ],
  },
  {
    slug: "heap-patterns",
    title: "堆疊模式",
    group: "Data Structure Patterns",
    icon: "PieChart",
    tagline:
      "對於第 k 個、前 k 個、合併和流中位數問題，僅保留 O(log n) 中可用的極端元素。",
    concept: [
      "堆就像醫院的分診台：任何時候你都可以立即看到最緊急的病人，並在 O(log n) 中插入新病人或刪除最上面的病人 - 但你永遠不會得到完整的排序列表，只是極端的情況。這對於「第 k 個/前 k 個/下一個最小的」來說已經足夠了，而無需付費對所有內容進行排序。",
      "最大堆暴露最大的元素；最小堆最小；相反類型的固定大小堆保持運行的 top-k。",
      "彼此面對的兩個堆將流分成下半部分和上半部分，因此中位數始終位於兩個頂部。",
    ],
    motivation: [
      "暴力破解「流中第 k 個最大的」在每次插入時重新排序 — 每個查詢 `O(n log n)`。例：一次到達一個數字。",
      "保留大小為 k 的最小堆：頂部是第 k 大的，每次插入的時間複雜度為 O(log k)。重複的完整排序被一個小的維護堆所取代。",
      "對於“合併 k 個排序清單”，每個清單目前前面的堆疊始終會產生 O(log k) 的全域最小值，從而避免每次輸出重新掃描所有清單。",
      "對於流中位數，最大堆（下半部）和最小堆（上半部）保持平衡，將中位數放在頂部 - 每次新增 O(log n)，每次查詢 O(1)。",
    ],
    whenUse: [
      "如果您看到“第 k 個最大/最小”，請考慮相反極性的 k 個大小的堆疊。",
      "如果您看到“前 k 個頻繁/最接近”，請考慮按排名數量鍵控的堆。",
      "如果您看到“合併 k 個排序清單/陣列”，請考慮 k 個邊界的最小堆。",
      "如果您看到“資料流的中位數”，請考慮兩個平衡堆。",
      "如果您看到“透過重複採用最佳可用進行調度”，請將堆疊視為邊界（如果需要，則進行延遲刪除）。",
    ],
    coreIdea: [
      "確定您反覆需要的極端值（最大值、最小值或兩端）。",
      "選擇堆極性；對於 top-k，使用相反極性的固定大小堆。",
      "推送新元素；pop 保持大小或消耗到極致。",
      "對於合併，用每個序列的第一個元素作為堆的種子，然後重新推送其後繼元素。",
      "對於中位數，平衡兩個堆，使其大小最多相差一。",
      "當元素過期時，使用惰性刪除（跳過陳舊的頂部）。",
    ],
    invariant:
      "**堆頂是極端不變的。 **堆的根始終是其內容的當前極端。為什麼這些模式有效：大小為 k 的最小堆的根是第 k 個最大的，因為正好 k 個最大的存活下來；合併保持正確，因為最小的未消耗元素始終是某個列表的當前前端，位於堆中；並且雙堆中位數成立，因為兩半之間的邊界恰好是兩個根。",
    variants: [
      "第 k 個/前 k 個的固定大小堆。",
      "用於合併 k 個排序序列的最小邊界堆。",
      "流中位數的兩個堆（最大 + 最小）。",
      "惰性刪除：跳過過時的頂部而不是從中間刪除。",
      "堆作為貪婪前沿（例如選擇最有利可圖的可用任務）。",
    ],
    templateKeys: ["two_heap_median", "merge_k_heap"],
    complexity: [
      "推入/彈出都是O(log size)； n 個元素上的 top-k 時間複雜度為 O(n log k)，優於 O(n log n) 完全排序。隱藏的成本是堆的快取局部性較差以及與平面數組相比較大的常數。",
      "兩堆中值每次加為 O(log n)，每次查詢為 O(1)。",
      "延遲刪除可能會讓堆增長超出邏輯大小，因此請考慮空間限制中的陳舊條目。",
    ],
    mistakes: [
      "top-k 的堆疊極性錯誤。反例：為「第 k 大」保留大小為 k 的最大堆會驅逐大元素；你需要一個大小為 k 的最小堆，這樣小的堆就會掉下來。",
      "不平衡的中值堆。反例：總是向一側推而不重新平衡會使中位數處於錯誤的位置；將尺寸保持在 1 以內。",
      "比較器符號錯誤。反例：`greater < >` 與預設 `less < >` 默默地翻轉最小值/最大值；驗證您所得到的根。",
      "忘記惰性刪除的陳舊性。反例：讀取頂部而不丟棄過期條目會傳回不再有效的元素。",
    ],
    practice: [
      {
        id: 215,
        title: "數組中第 K 個最大元素",
        slug: "kth-largest-element-in-an-array",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "大小 k 的最小堆",
        why: "通過維護的堆的基本第 k 個元素。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 347,
        title: "前 K 個頻繁元素",
        slug: "top-k-frequent-elements",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "按頻率鍵控的堆",
        why: "頻率圖上的 Top-k。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 23,
        title: "合併 k 個排序列表",
        slug: "merge-k-sorted-lists",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "邊界最小堆",
        why: "列表頭堆產生全域最小值。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 295,
        title: "從資料流中尋找中值",
        slug: "find-median-from-data-stream",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "兩個平衡堆",
        why: "定義的兩堆中位數分割。",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 502,
        title: "IPO",
        slug: "ipo",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "堆積作為貪婪邊界",
        why: "解鎖負擔得起的項目，推出最賺錢的項目。",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 1464,
        title: "數組中兩個元素的最大乘積",
        slug: "maximum-product-of-two-elements-in-an-array",
        rating: 1121,
        difficulty: "Easy",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1046,
        title: "最後一塊石頭的重量",
        slug: "last-stone-weight",
        rating: 1173,
        difficulty: "Easy",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3264,
        title: "K 乘法運算後的最終陣列狀態 I",
        slug: "final-array-state-after-k-multiplication-operations-i",
        rating: 1178,
        difficulty: "Easy",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2974,
        title: "最低人數遊戲",
        slug: "minimum-number-game",
        rating: 1185,
        difficulty: "Easy",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1337,
        title: "矩陣中最弱的 K 行",
        slug: "the-k-weakest-rows-in-a-matrix",
        rating: 1225,
        difficulty: "Easy",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 3081,
        title: "替換字串中的問號以最小化其價值",
        slug: "replace-question-marks-in-string-to-minimize-its-value",
        rating: 1905,
        difficulty: "Medium",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1696,
        title: "跳躍遊戲六",
        slug: "jump-game-vi",
        rating: 1954,
        difficulty: "Medium",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 1642,
        title: "您可以到達的最遠的建築物",
        slug: "furthest-building-you-can-reach",
        rating: 1962,
        difficulty: "Medium",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 13,
        tier: "Advanced Practice",
      },
      {
        id: 882,
        title: "細分圖中的可達節點",
        slug: "reachable-nodes-in-subdivided-graph",
        rating: 2328,
        difficulty: "Hard",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 2203,
        title: "具有所需路徑的最小加權子圖",
        slug: "minimum-weighted-subgraph-with-the-required-paths",
        rating: 2364,
        difficulty: "Hard",
        subPattern: "heap",
        why: "堆將目前的 best-k 或下一個事件保持在 O(log n)（章節結構）中可用。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "我是否只需要重複極端的順序，而不需要完整的排序順序？",
      "對於 top-k，我的堆是否極性相反且大小為 k？",
      "對於合併/串流傳輸，我追蹤其極值的邊界集是什麼？",
      "是否有任何元素過期，需要延遲刪除過時的頂部？",
    ],
    related: [
      "sorting-as-a-tool",
      "sweep-line",
      "greedy-stays-ahead",
      "divide-and-conquer",
    ],
  },
  {
    slug: "number-theory-and-math",
    title: "數論與數學",
    group: "Math Patterns",
    icon: "Calculator",
    tagline:
      "用於解決數學問題的 GCD/LCM、模算術、快速求冪、篩子和組合數學工具包。",
    concept: [
      "數論問題是關於整數背後隱藏的齒輪——整除性、餘數、素數——而一個小工具包可以將強力轉化為一些乾淨的運算。透過嘗試每個除數來計算 GCD 就像逐個硬幣地數零錢一樣；歐幾里德演算法正在用精確的帳單進行支付。此模式正在辨識哪種經典工具（GCD、模算術、快速冪、篩選、組合數學）會破壞工作。",
      "模運算可讓您在素數模下保持較小的數字，同時保留 `+`、`−`、`×`（以及透過模逆的 `÷`）。",
      "快速求冪和篩選是兩個主力：它們將 O(n) 和 O(n√n) 循環變成 O(log n) 和 O(n log log n)。",
    ],
    motivation: [
      "暴力破解「是 x 素數，對於許多 x 最多 n」次測試每個查詢的除數 - `O(n√n)`。例：計算 n 以下的質數。",
      "埃拉托斯特尼篩法在一次 O(n log log n) 遍中標記從 i·i 開始的複合，同時回答所有素性。",
      "`base ^ exp mod m` 的暴力破解會增加exp時間－`O(exp)`，對於巨大的指數來說是不可能的；快速求冪對底數進行平方並乘以 O(log exp) 中的設定位。",
      "重複的工作——重新測試整除性或重新相乘——被重複使用篩表或將指數減半所取代。",
    ],
    whenUse: [
      "如果您看到“計算素數/直到 n 的最小素因數”，請考慮一個篩選。",
      "如果您看到巨大的冪或“答案模 1e9+7”，請考慮快速模冪（以及除法的模逆）。",
      "如果您看到 GCD/LCM、約簡分數或循環長度，請考慮歐幾里德演算法。",
      "如果您看到“方法數/選擇 k”，請考慮階乘和模逆的組合數學。",
      "如果您看到餘數/週期性，請考慮使用模算術。",
    ],
    coreIdea: [
      "辨識算術結構：質數、整除性、冪或計數。",
      "對於 n 以內的質數，運行一次篩子並重複使用。",
      "對於大冪或模除法，請使用快速求冪（以及質數模下的費馬逆）。",
      "對於GCD/LCM，使用歐幾裡得演算法； LCM 為 `a / gcd(a, b) * b`（先除以避免溢位）。",
      "對於組合數學，預先計算階乘和逆階乘以質數為模。",
      "保持每個中間值以 m 為模減少以防止溢出。",
    ],
    invariant:
      "**模一致性不變。 ** 每個中間結果都與真值模 m 保持一致，並且使用的所有操作都是保模操作（`+`、`−`、`×` 和 `÷` 僅透過模逆）。為什麼答案保持正確：因為這些操作透過取餘數進行交換，所以每一步的減少都不會改變最終的殘數——但它使數字保持有界，這使得計算完全可行。",
    variants: [
      "GCD/LCM 透過歐幾裡得演算法。",
      "具有加法/乘法和除法費馬逆運算的模算術。",
      "冪和模逆的快速（二進位）求冪。",
      "素數和最小素因子表的埃拉托斯特尼篩法。",
      "組合學：C(n, k) mod p 透過預先計算的階乘和逆階乘。",
    ],
    templateKeys: ["sieve", "fast_pow"],
    complexity: [
      "篩子的時間為 O(n log log n)，空間為 O(n)；快速求冪是 O(log exp)。隱藏成本是溢出——即使最終答案合適，`% m` 溢出 `int`/`long long` 之前的單一未減少的 `a * b` 也是如此。",
      "GCD 為 O(log min(a,b))；對於階乘表，組合數學設定為 O(n)。",
      "透過 Fermat 進行模求逆，每次除法都會花費額外的 O(log p)。",
    ],
    mistakes: [
      "減少前溢出。反例：`result = result * base % mod`在`long long`時是安全的，但在`base, result ~ 10^9`時`int`就溢位了；拓寬型。",
      "直接除以模數。反例：`(a / b) % m` 錯誤；改為乘以 `b` 的模逆。",
      "篩子起始位置太低。反例：從`2 * i`而不是`i * i`標記倍數是正確的，但速度較慢；開始循環變數低於 2 將 0/1 標記為質數。",
      "LCM 溢位。反例：`a * b / gcd`對於大的a、b溢位；計算`a / gcd * b`。",
    ],
    practice: [
      {
        id: 204,
        title: "計算素數",
        slug: "count-primes",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "埃拉托斯特尼篩法",
        why: "基礎篩應用。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 50,
        title: "戰俘（x，n）",
        slug: "powx-n",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "快速求冪",
        why: "具有負指數處理的二進制求冪。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1922,
        title: "數好數字",
        slug: "count-good-numbers",
        rating: 1675,
        difficulty: "Medium",
        subPattern: "模組化快速電源",
        why: "模數為 1e9+7 的大型模組化電源。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2413,
        title: "最小偶數倍",
        slug: "smallest-even-multiple",
        rating: 1145,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 2427,
        title: "公因子數",
        slug: "number-of-common-factors",
        rating: 1172,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 1979,
        title: "求數組的最大公約數",
        slug: "find-greatest-common-divisor-of-array",
        rating: 1184,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3461,
        title: "檢查運算後字串中的數字是否相等 I",
        slug: "check-if-digits-are-equal-in-string-after-operations-i",
        rating: 1189,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 1952,
        title: "三除數",
        slug: "three-divisors",
        rating: 1204,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 3658,
        title: "奇偶和的 GCD",
        slug: "gcd-of-odd-and-even-sums",
        rating: 1220,
        difficulty: "Easy",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3669,
        title: "平衡 K 因子分解",
        slug: "balanced-k-factor-decomposition",
        rating: 1917,
        difficulty: "Medium",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 2654,
        title: "使所有數組元素等於 1 的最少運算次數",
        slug: "minimum-number-of-operations-to-make-all-array-elements-equal-to-1",
        rating: 1929,
        difficulty: "Medium",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 866,
        title: "素數回文",
        slug: "prime-palindrome",
        rating: 1938,
        difficulty: "Medium",
        subPattern: "數論",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3405,
        title: "計算具有 K 個匹配相鄰元素的陣列的數量",
        slug: "count-the-number-of-arrays-with-k-matching-adjacent-elements",
        rating: 2310,
        difficulty: "Hard",
        subPattern: "combinatorics",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3251,
        title: "求單調對的數 II",
        slug: "find-the-count-of-monotonic-pairs-ii",
        rating: 2323,
        difficulty: "Hard",
        subPattern: "combinatorics",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3621,
        title: "Popcount-Depth 等於 K I 的整數數量",
        slug: "number-of-integers-with-popcount-depth-equal-to-k-i",
        rating: 2331,
        difficulty: "Hard",
        subPattern: "combinatorics",
        why: "GCD/模組化/組合結構使封閉形式或篩子成為可能，本章的工具包。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "哪種經典工具適合——篩子、快速功率、GCD 還是組合？",
      "是否有模數，我是否在每次乘法後減少以避免溢出？",
      "該問題是否需要在模數下進行除法（→ 模逆）？",
      "我可以預先計算一個表格（篩、階乘）一次並在查詢中重複使用它嗎？",
    ],
    related: [
      "hash-map-frequency",
      "state-compression",
      "game-theory",
      "contribution-counting",
    ],
  },
  {
    slug: "divide-and-conquer",
    title: "分而治之",
    group: "Recursion and Search",
    icon: "Split",
    tagline:
      "分成獨立的兩半，解決每個問題，然後組合 - 組合步驟是計數和選擇發生的地方。",
    concept: [
      "分而治之是透過將一大堆考試分成兩個評分者來組織，然後每個評分者再次分開，直到每個人都持有一小堆；然後將排序後的堆合併回去。威力很少體現在分裂中——它體現在「合併」步驟中，在該步驟中，合併兩個已解決的一半也可以揭示跨半資訊（例如有多少對是亂序的）。",
      "像是歸併排序、反轉計數和範圍總和計數之類的遞歸都共享這個骨架：在中間拆分，遞歸，然後進行線性跨邊界工作。",
      "選擇變體（快速選擇）劃分但僅遞歸到一側，用合併換取分區。",
    ],
    motivation: [
      "「計數反轉」的暴力破解（i<j 與 a[i]>a[j] 對）會檢查所有對 — `O(n^2)`。範例：`[2, 4, 1, 3, 5]`。",
      "將陣列進行歸併排序；在每次合併期間，當右半部元素放置在剩餘左半部元素之前時，這些左半部元素都是反轉，每個元素的複雜度為 O(1)。",
      "重複的成對比較在合併期間分解為線性計數，給出 `O(n log n)`。",
      "Quickselect 重複使用分區，但僅遞歸到包含目標排名的一側，從而實現第 k 個元素的 O(n) 平均值。",
    ],
    whenUse: [
      "如果您看到“計數反轉/無序對/範圍和對”，請考慮合併排序計數。",
      "如果您看到「第 k 個最小/最大」且堆感覺很重，請考慮快速選擇。",
      "如果您看到一個問題透過廉價的組合分解為獨立的子問題，請考慮分而治之。",
      "如果您看到“排序但在排序過程中也報告某些內容”，請考慮增強合併排序。",
      "如果出現遞推 T(n)=aT(n/b)+f(n)，請考慮主定理的複雜度。",
    ],
    coreIdea: [
      "將中間的輸入分成獨立的兩半。",
      "對每一半進行遞歸，直到得到一個簡單的基本情況。",
      "在線性時間內將兩半結合起來，在那裡提取跨界資訊。",
      "為了進行計數，請計算合併過程中跨半部的貢獻。",
      "對於選擇，僅分區並遞歸到相關側。",
      "使用主定理來推理由此產生的複雜性。",
    ],
    invariant:
      "**獨立子問題不變。 ** 每一半都在不參考另一半的情況下正確求解，並且每個跨半交互作用在組合步驟中只考慮一次。為什麼計數是精確的：反轉要么完全位於左半部分，要么完全位於右半部分，或者橫跨分割——遞歸處理前兩個，單個合併處理第三個，因此不會遺漏或重複計算任何對。",
    variants: [
      "歸併排序：拆分、對半排序、合併。",
      "合併過程中的反轉計數/範圍總和計數。",
      "Quickselect：分區，遞歸到第 k 個元素的一側。",
      "快速排序：分區，遞歸到兩邊。",
      "拆分組合遞歸的主定理分析。",
    ],
    templateKeys: ["merge_sort_count", "quickselect"],
    complexity: [
      "歸併排序式分而治之的時間複雜度為 O(n log n)，暫存空間為 O(n)；隱藏成本是在每個層級上完成的緩衝區和線性組合（每個層級的 log n 個層級都涉及所有 n 個元素）。",
      "快速選擇的平均時間複雜度為 O(n)，但在壞樞軸上最壞情況為 O(n^2)；隨機化恢復了預期的線性時間。",
      "主定理從分割計數 a、收縮因子 b 和組合成本 f(n) 讀取複雜性。",
    ],
    mistakes: [
      "在錯誤的時刻計算交叉對。反例：在合併後（當順序遺失時）計算反轉，而不是在合併重複計數或遺失對時進行計數。",
      "使用最後一個元素樞軸快速選擇已排序的陣列。反例：已經排序的輸入將分區降級為 O(n^2)；選擇一個隨機樞軸。",
      "每次呼叫時重新分配緩衝區。反例：每次合併新的 `vector` 會將常數變成記憶體風暴；傳遞一個共享暫存緩衝區。",
      "反轉計數溢出。反例：n=10^5 時最多 ~n²/2 次反轉超過 `int`；累積在`long long`。",
    ],
    practice: [
      {
        id: 912,
        title: "對數組進行排序",
        slug: "sort-an-array",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "歸併排序",
        why: "實現分治排序本身。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 215,
        title: "數組中第 K 個最大元素",
        slug: "kth-largest-element-in-an-array",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "quickselect",
        why: "透過分區進行平均 O(n) 選擇。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 493,
        title: "反向對",
        slug: "reverse-pairs",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "合併排序計數",
        why: "在合併過程中計算跨半對的數量。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 973,
        title: "最接近原點的 K 個點",
        slug: "k-closest-points-to-origin",
        rating: 1214,
        difficulty: "Medium",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3759,
        title: "計算至少 K 個較大值的元素",
        slug: "count-elements-with-at-least-k-greater-values",
        rating: 1373,
        difficulty: "Medium",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 1985,
        title: "找出數組中第 K 個最大的整數",
        slug: "find-the-kth-largest-integer-in-the-array",
        rating: 1414,
        difficulty: "Medium",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 3737,
        title: "計算佔多數元素的子數組 I",
        slug: "count-subarrays-with-majority-element-i",
        rating: 1423,
        difficulty: "Medium",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3719,
        title: "最長平衡子數組 I",
        slug: "longest-balanced-subarray-i",
        rating: 1467,
        difficulty: "Medium",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1763,
        title: "最長的好子串",
        slug: "longest-nice-substring",
        rating: 1522,
        difficulty: "Easy",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3864,
        title: "分區二進位字串的最小成本",
        slug: "minimum-cost-to-partition-a-binary-string",
        rating: 2032,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 3855,
        title: "某個範圍內的 K 位數字的總和",
        slug: "sum-of-k-digit-numbers-in-a-range",
        rating: 2085,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 3624,
        title: "Popcount-Depth 等於 K II 的整數數量",
        slug: "number-of-integers-with-popcount-depth-equal-to-k-ii",
        rating: 2086,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 3826,
        title: "最低分區分數",
        slug: "minimum-partition-score",
        rating: 2345,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3841,
        title: "樹中的回文路徑查詢",
        slug: "palindromic-path-queries-in-a-tree",
        rating: 2384,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 3943,
        title: "增量後的對數",
        slug: "number-of-pairs-after-increment",
        rating: 2410,
        difficulty: "Hard",
        subPattern: "分而治之",
        why: "拆分、求解一半以及跨邊界組合可以提高速度，這是本章的技術。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "兩半是否獨立求解，並在線性組合中進行實際工作？",
      "合併過程中跨界數（倒數、範圍和對）是否只計算一次？",
      "對於選擇，我可以僅遞歸到一側而不是兩側嗎？",
      "遞迴是否符合主定理，並且我是否防範了 O(n^2) 主元情況？",
    ],
    related: [
      "backtracking",
      "sorting-as-a-tool",
      "dp-transition-design",
      "heap-patterns",
    ],
  },
  {
    slug: "game-theory",
    title: "博弈論",
    group: "Math Patterns",
    icon: "Swords",
    tagline:
      "使用 P/N 位置、Nim XOR、Sprague-Grundy 值和區間 DP 決定兩人遊戲的獲勝者。",
    concept: [
      "組合遊戲就像迷宮，兩個玩家一起走過，輪流選擇下一條走廊；在正常遊戲中，到達死胡同（不動）的玩家就輸了。你不需要讀完整個迷宮——你只需要把每個房間標記為站在其中的人的勝利或失敗，從死胡同倒著走。",
      "這些標籤是 P 位置（前一個玩家獲勝，即移動的玩家失敗）和 N 位置（下一個移動玩家獲勝）。",
      "對於公正的遊戲（兩個玩家共享相同的動作），這個標籤具有令人驚訝的結構：單樁遊戲是週期性的，多樁 Nim 由 XOR 決定，並且遊戲的任何總和都會崩潰為 Grundy 值的 XOR。",
    ],
    motivation: [
      "蠻力就是簡單的極小極大：遞歸每一步並詢問「移動的玩家能否獲勝？」。例：一堆 4 塊石頭，取 1-3 個——極小極大探索整個移動樹。",
      "重複的工作是透過多次移動指令對同一個位置進行重新評估，並且樹是指數型的。",
      "記住位置，在線性時間內得到P/N表；對於單樁外帶遊戲，表格甚至是週期性的，因此答案是模檢查。",
      "當遊戲分成獨立的子遊戲時，不要搜尋乘積空間 - 計算每個部分的 Grundy 值並對它們進行異或 (Sprague-Grundy)，將指數乘積轉換為總和。",
    ],
    whenUse: [
      "如果您看到“兩名玩家交替，最佳發揮，誰獲勝？”，請先考慮 P/N 位置。",
      "如果您看到獨立的堆並且移動會縮小一個堆，請考慮 Nim → XOR 堆大小。",
      "如果您看到一個遊戲分解為獨立的組件，請考慮每個組件的 Grundy 值，然後進行異或。",
      "如果您看到從陣列兩端累積的分數，請考慮分數差上的區間 DP，而不是 Grundy。",
      "如果狀態空間很小，請考慮狀態上的記憶 DFS / P-N 表。",
    ],
    coreIdea: [
      "確定遊戲是否公正（雙方的動作相同）——只有這樣 Nim/Grundy 才適用。",
      "找到終端位置並標記它們（在正常遊戲下沒有移動的玩家失敗）。",
      "傳播標籤：如果某個動作到達 P 位置，則位置為 N，否則為 P。",
      "對於公正博弈的和，計算每個 Grundy 值 `mex{reachable}` 並對它們進行異或；非零異或意味著移動的玩家獲勝。",
      "對於得分遊戲，將 `dp[i][j]` 定義為最佳得分差，並將兩個最終選擇結合在一起。",
      "從起始位置的標籤、Grundy XOR 或 `dp[0][n - 1]` 符號讀取獲勝者。",
    ],
    invariant:
      "**P/N 標籤不變。 ** 每個位置都一致地標記：P 位置有*所有*移動導致 N 位置，而 N 位置有*至少一個*移動導致 P 位置。為什麼這決定了比賽：N位的玩家總是可以走到P位，讓對手輸，而P位的玩家則被迫走到N位，讓對手贏。從終端位置進行歸納可以使標籤準確無誤，從而使預測的獲勝者準確無誤。",
    variants: [
      "Nim（幾個堆，從其中取任意數量）：當且僅當堆大小異或 ≠ 0 時，第一個玩家獲勝。",
      "Bash 遊戲（從一堆中取出 1..k）：P 位置是 k+1 的倍數。",
      "Sprague-Grundy sum（獨立子遊戲）：對每個組件的 Grundy 值進行異或。",
      "Misère 玩法（最後一步失敗）：與正常玩法不同，分析在接近尾聲時發生翻轉，需要小心。",
      "陣列上的計分遊戲（預測獲勝者、Stone Game 系列）：得分差上的區間 DP。",
    ],
    templateKeys: [
      "game_nim_xor",
      "game_grundy",
      "game_interval_dp",
      "game_pn_table",
    ],
    complexity: [
      "P/N 或 Grundy 表的成本為 O(狀態·分支)；隱藏成本是 `moves(state)` 的分支因子，當每個狀態有許多後繼者時，它可以占主導地位。",
      "Nim 的 XOR 檢查在堆上的時間複雜度為 O(n)——整個博弈論隱藏在一個折疊內。",
      "間隔 DP 得分遊戲是 O(n^2) 時間和 O(n^2) 空間（可簡化為 O(n) 滾動空間）；隱藏成本是 n^2 個狀態，而不是 O(1) 轉換。",
    ],
    mistakes: [
      "將 Nim/Grundy 應用於遊擊遊戲或得分遊戲。反例：Stone Game VII 是累加積分的，所以 XOR/Grundy 沒有意義－需要在分差上設定區間 DP。",
      "錯誤定義端子標籤。反例：正常比賽時，不能移動的玩家輸，所以空位置是P位置；翻轉它會翻轉整個表格。",
      "混淆“最大化我的分數”和“最大化差異”。反例：在預測獲勝者中，貪婪地最大化原始分數失敗了； `dp` 必須跟踪（我 - 對手），這被證明是等價的，並且是跨回合組成的唯一公式。",
      "忘記 `mex` 會跳過目前值。反例：可達Grundy值{0,1,3}給出`mex = 2`（不是4）；需要掃描最小的不存在的非負整數。",
    ],
    practice: [
      {
        id: 292,
        title: "尼姆遊戲",
        slug: "nim-game",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "Bash 遊戲週期性",
        why: "最簡潔的 P/N 推理：當且僅當 n 是 4 的倍數時失敗。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 486,
        title: "預測獲勝者",
        slug: "predict-the-winner",
        rating: 1701,
        difficulty: "Medium",
        subPattern: "區間DP分數差",
        why: "典型的兩人得分差區間為 DP。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 877,
        title: "石頭遊戲",
        slug: "stone-game",
        rating: 1590,
        difficulty: "Medium",
        subPattern: "區間 DP / 奇偶校驗參數",
        why: "區間 DP 也承認偶數堆的光滑奇偶校驗證明。",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3627,
        title: "大小為 3 的子序列的最大中位數和",
        slug: "maximum-median-sum-of-subsequences-of-size-3",
        rating: 1262,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 3222,
        title: "尋找硬幣遊戲中的獲勝玩家",
        slug: "find-the-winning-player-in-coin-game",
        rating: 1270,
        difficulty: "Easy",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 1561,
        title: "您可以獲得的最大金幣數量",
        slug: "maximum-number-of-coins-you-can-get",
        rating: 1406,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 1025,
        title: "除數遊戲",
        slug: "divisor-game",
        rating: 1435,
        difficulty: "Easy",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 3227,
        title: "字串中的元音遊戲",
        slug: "vowels-game-in-a-string",
        rating: 1452,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 2038,
        title: "如果兩個鄰居的顏色相同，則刪除彩色區塊",
        slug: "remove-colored-pieces-if-both-neighbors-are-the-same-color",
        rating: 1468,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 1686,
        title: "石頭遊戲六",
        slug: "stone-game-vi",
        rating: 2001,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 1927,
        title: "和遊戲",
        slug: "sum-game",
        rating: 2005,
        difficulty: "Medium",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 11,
        tier: "Advanced Practice",
      },
      {
        id: 1406,
        title: "石頭遊戲III",
        slug: "stone-game-iii",
        rating: 2027,
        difficulty: "Hard",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 12,
        tier: "Advanced Practice",
      },
      {
        id: 810,
        title: "黑板異或遊戲",
        slug: "chalkboard-xor-game",
        rating: 2341,
        difficulty: "Hard",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 13,
        tier: "Challenge Practice",
      },
      {
        id: 3283,
        title: "殺死所有棋子的最大移動次數",
        slug: "maximum-number-of-moves-to-kill-all-pawns",
        rating: 2473,
        difficulty: "Hard",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 14,
        tier: "Challenge Practice",
      },
      {
        id: 913,
        title: "貓和老鼠",
        slug: "cat-and-mouse",
        rating: 2567,
        difficulty: "Hard",
        subPattern: "博弈論",
        why: "最佳遊戲取決於贏/輸狀態或 Grundy 值（本章的分析）。",
        order: 15,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "遊戲是否公正（兩名玩家都有相同的動作），因此 Nim/Grundy 可以申請嗎？",
      "該位置是否分解為獨立的子博弈，我可以對其 Grundy 值進行異或？",
      "這是從序列末尾開始得分的遊戲（→ 差異上的區間 DP）而不是最後移動的遊戲嗎？",
      "我是否在聲明中正確標記了（正常與錯誤）約定的終端位置？",
    ],
    related: [
      "dp-transition-design",
      "state-design",
      "number-theory-and-math",
      "proof-techniques",
    ],
    coreIdeaAppendix: GAME_THEORY_DEEP_DIVE,
  },
  {
    slug: "shortest-paths",
    title: "最短路徑（Dijkstra / 0-1 BFS / Bellman-Ford）",
    tagline:
      "選擇正確的鬆弛引擎 - 堆疊、雙端佇列或輪限制掃描 - 以獲得加權圖上的最小成本路徑。",
    icon: "Waypoints",
    group: "Graph Patterns",
    concept: [
      "想像一下，將一塊鵝卵石扔進池塘，其中水沿著某些渠道傳播的速度比其他渠道快。當最便宜的路線已經全部走完時，漣漪就會準確地到達每個點。最短路徑演算法模擬這種漣漪：它們不是逐條嘗試路線，而是按照累積成本的順序向外擴展邊界，因此漣漪第一次接觸節點時被證明是到達那裡最便宜的方式。",
      "所有三個引擎共享一個原語 - 鬆弛：如果 `dist[u] + w(u, v) < dist[v]`，則改進 `dist[v]`。它們的差異僅在於鬆弛發生的順序：Dijkstra 使用堆疊按總成本排序，使用雙端隊列按 0-1 BFS 排序，而 Bellman-Ford 則按輪掃描每個邊。",
      "與普通 BFS 比較：BFS 計算跳數，僅當每條邊的權重相同時才等於最短距離。當權重不同時，訪問順序必須遵循成本，而不是跳數。",
    ],
    motivation: [
      "暴力列舉整個路徑：從來源開始，嘗試每個鄰居，遞歸，並保持到達目標的最便宜的總數。在有循環的圖上，路徑計數是無界的，即使在 DAG 上，它也會呈指數增長。",
      "範例：4 個節點，邊為 `0→1 (1)`、`0→2 (5)`、`1→2 (1)`、`2→3 (1)`。路徑枚舉為每個延續重新派生 `0→1→2` 前綴。 Dijkstra 以成本 2 結算節點 2 一次，並且不再重新考慮。",
      "重複的工作是為經過節點的每條路徑重新計算進入節點的最佳路徑。每個節點儲存一個數字（迄今為止的最佳距離）會將所有這些前綴折疊為每條邊的單一鬆弛。",
    ],
    whenUse: [
      "如果您在加權圖或網格上看到達到目標的最低成本/時間/精力，請考慮使用最小堆的 Dijkstra。",
      "如果每條邊的成本為 0 或 1（跟隨箭頭是免費的，更改它是付費的），請考慮使用雙端隊列的 0-1 BFS。",
      "如果您看到最多 k 個停止/邊，或負邊權重，請考慮每輪有快照的回合限制貝爾曼-福特。",
      "如果路徑的成本是其最大邊而不是總和，請考慮極小極大 Dijkstra：用 `max(d, w)` 而不是 `d + w` 來放鬆。",
      "如果答案是最大化的機率乘積，請考慮帶有乘法的最大堆上的 Dijkstra。",
    ],
    coreIdea: [
      "建立鄰接清單（或將網格單元視為具有 4 個鄰居邊的節點）。",
      "初始化 `dist[src] = 0` 和每隔一個安全無窮大的距離。",
      "按邊權重選擇引擎：全部相等→普通BFS； 0/1 → 雙端佇列；非負 → 堆；負或邊緣限制 → Bellman-Ford 回合。",
      "提取最便宜的邊界節點並放鬆其傳出邊緣，推動改進的距離而不是減少鍵。",
      "跳過過時的堆條目 (`d > dist[node]`)，以便每個節點擴展一次。",
      "當目標被彈出時儘早停止——那一刻它的距離是最終的。",
    ],
    invariant:
      "**定居邊界不變性。 ** 對於非負權重，當從距離為 `d` 的堆中彈出節點時，沒有其他路徑可以更便宜：任何替代路徑都必須通過某個鍵值已經≥ `d` 的前沿節點離開定居區域，並且擴展路徑永遠不會降低其成本。 Bellman-Ford 將其替換為輪不變量 - 在 `i` 輪之後，`dist[v]` 是使用最多 `i` 邊的最便宜成本 - 它可以承受負權重，因為它從不聲稱節點已完成。",
    variants: [
      "Minimax /瓶頸路徑：用`max(d, w)`放鬆；涵蓋最省力和最早游泳時間的網格。範例：邊 `0→1 (4)`、`1→2 (3)`、`0→2 (6)` — 兩跳路由成本為 `max(4, 3) = 4`，優於直接邊的 `6`，儘管其總和 `7` 較大。",
      "最大機率：具有乘積鬆弛的最大堆疊；非消極性成為 `(0, 1]` 中的因素。",
      "計算最短路徑：與 `dist` 一起，每當等成本路由到達時，保持 `ways[v]` 的總和。",
      "多源：將每個源推到距離 0 處——所有源都會立即產生漣漪。",
      "K 站最便宜的航班：貝爾曼-福特 (Bellman-Ford) 航班恰好為 `k + 1` 輪次和每輪快照。",
    ],
    templateKeys: ["dijkstra_lazy", "zero_one_bfs", "bellman_ford_k_edges"],
    complexity: [
      "Dijkstra 具有惰性刪除：O((n + m) log m) 時間和 O(n + m) 空間；堆可能包含重複項，過時檢查會過濾掉這些重複項。",
      "0-1 BFS：O(n + m)時間－每個節點最多進入雙端佇列兩次；隱藏成本是決定哪些邊是真正的 0 權重。",
      "Bellman-Ford 限制為 k 輪：O(k·m) 時間；完整的演算法使用 n − 1 輪，並且額外一輪檢測負循環。",
    ],
    mistakes: [
      "使用負邊緣運行 Dijkstra。反例：邊`0→1 (2)`、`0→2 (5)`、`2→1 (-4)`－節點1位於距離2處，但真實距離為1；固定集證明需非負權重。",
      "忘記陳舊性檢查。如果沒有 `if (d > dist[node]) continue;`，每個堆重複節點都會擴展一次，從而使密集改進鏈上的成本增加到 O(nm log m)。",
      "從目前回合的 k 站貝爾曼-福特值中放鬆下來。如果沒有快照，一輪可以連結多個邊，因此最多 k 約束會悄悄打破。",
      "對 `int` 中的距離求和。反例：權重為10^9的10^5條邊的路徑溢出；在 `long long` 中累加並使用除法無窮大，例如 `LLONG_MAX / 4`。",
    ],
    practice: [
      {
        id: 743,
        title: "網路延遲時間",
        slug: "network-delay-time",
        rating: 1800,
        difficulty: "Medium",
        subPattern: "普通迪傑斯特拉",
        why: "參考單源問題：建構圖，運行Dijkstra，讀取最遠的節點。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 787,
        title: "K 站內最便宜的航班",
        slug: "cheapest-flights-within-k-stops",
        rating: 1786,
        difficulty: "Medium",
        subPattern: "k 輪貝爾曼-福特",
        why: "使用每輪快照進行邊緣限制鬆弛－Dijkstra 錯誤的情況。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1514,
        title: "具有最大機率的路徑",
        slug: "path-with-maximum-probability",
        rating: 1846,
        difficulty: "Medium",
        subPattern: "最大堆積 Dijkstra",
        why: "具有乘法和最大堆的相同引擎；表明放鬆是通用的。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 1631,
        title: "最省力的路徑",
        slug: "path-with-minimum-effort",
        rating: 1948,
        difficulty: "Medium",
        subPattern: "網格上的極小極大 Dijkstra",
        why: "使用 max(d, |高度差|) 而不是求和來放鬆。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 1368,
        title: "在網格中建立至少一條有效路徑的最低成本",
        slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
        rating: 2069,
        difficulty: "Hard",
        subPattern: "0-1 BFS",
        why: "沿著箭頭自由移動，付費重定向——典型的雙端佇列問題。",
        order: 5,
        tier: "Advanced Practice",
      },
      {
        id: 1976,
        title: "到達目的地的方式數量",
        slug: "number-of-ways-to-arrive-at-destination",
        rating: 2095,
        difficulty: "Medium",
        subPattern: "Dijkstra + 路徑計數",
        why: "攜帶一個在等價到達時更新的ways[]數組，並使用模算術。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 778,
        title: "在上漲的水中游泳",
        slug: "swim-in-rising-water",
        rating: 2097,
        difficulty: "Hard",
        subPattern: "瓶頸路徑",
        why: "最小化路徑上的最大單元格；與二分查找 + BFS 進行比較。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 2290,
        title: "到達角落所需清除的障礙物最少",
        slug: "minimum-obstacle-removal-to-reach-corner",
        rating: 2138,
        difficulty: "Hard",
        subPattern: "網格上的 0-1 BFS",
        why: "障礙物成本為 1，空白單元格成本為 0 — 辨識二進位權重。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 2812,
        title: "尋找網格中最安全的路徑",
        slug: "find-the-safest-path-in-a-grid",
        rating: 2154,
        difficulty: "Medium",
        subPattern: "多源+最大最小",
        why: "多源 BFS 首先計算安全性，然後在頂部執行最大最小路徑搜尋。",
        order: 9,
        tier: "Challenge Practice",
      },
      {
        id: 2577,
        title: "存取網格中的單元的最短時間",
        slug: "minimum-time-to-visit-a-cell-in-a-grid",
        rating: 2381,
        difficulty: "Hard",
        subPattern: "Dijkstra 等待",
        why: "放鬆必須透過邊緣奇偶性來縮短等待時間——這是一種國家設計的扭曲。",
        order: 10,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "邊權重是否相等（BFS）、二進位（雙端佇列）、非負（堆）或負/邊限制（貝爾曼-福特輪）？",
      "路徑成本是總和、最大值還是乘積——我是否相應地調整了鬆弛度？",
      "我是否跳過過時的堆條目並使用溢出安全無窮大？",
      "我可以在目標彈出時立即停止，而不是解決整個圖表嗎？",
    ],
    related: [
      "graph-traversal",
      "heap-patterns",
      "binary-search-on-answer",
      "dp-transition-design",
    ],
  },

  {
    slug: "linked-list-patterns",
    title: "連結列表模式（快/慢指標和就地反轉）",
    tagline:
      "龜兔賽跑指針、虛擬頭和一次一個指針反轉解決了 O(1) 空間中的循環、中間和重新排序問題。",
    icon: "Link",
    group: "Data Structure Patterns",
    concept: [
      "將兩名跑者放在同一條跑道上並一起出發，其中一名跑者的速度是兩倍。在直道上，跑得快的人首先跑完；在環形跑道上，跑得快的人跑得慢的人一圈，然後他們相遇了。鍊錶問題正是利用了這一點：一次會議證明了一個循環，跑步者完成比賽時所站的位置編碼了位置（例如中間位置），如果不先測量列表，您就無法知道這些位置。",
      "三個原語涵蓋了大多數問題：快/慢指標（中間、循環、從末尾算起的第 k 個）、就地反轉（每步重定向一個 `next` 指標）和虛擬頭（使第一個真實節點成為普通情況的哨兵）。",
      "與數組比較：沒有隨機訪問，也沒有後向鏈接，因此每種技術都必須可表示為向前行走，每步最多重新連接恆定數量的指針。",
    ],
    motivation: [
      "用於檢測循環的蠻力將每個訪問的節點存儲在哈希集中 - O(n) 額外內存 - 或者如果列表尚未結束，則走 n 步並聲明循環，這需要提前未知的長度 n。",
      "範例：先計算節點數（一次完整遍歷），然後步行 n/2 步（第二次遍歷），找到中間位置。快/慢指針一次完成－當快指針到達末端時，慢指針站在中間。",
      "重複的工作是重新測量指標可以隱式編碼的位置：速度比和領先開始取代顯式計數過程。",
    ],
    whenUse: [
      "如果您看到循環偵測或找到循環開始的位置，請想一想烏龜和兔子，然後將一個指針重置到頭部。",
      "如果您看到清單的中間或從末尾開始的第 k 個節點，請考慮具有速度比或第 k 個節點領先的兩個指標。",
      "如果您看到反轉群組中的清單/子清單/節點，請考慮使用 `previous`/`current` 對進行就地反轉。",
      "如果您看到回文或重新排序，請思考：找到中間部分，反轉後半部分，然後將兩個半段一起走。",
      "如果頭部本身可以移除或更換，請考慮假頭。",
      "如果您在值 1..n 的陣列中看到重複的數字，請將 `i → nums[i]` 視為隱式鍊錶並執行循環偵測。",
    ],
    coreIdea: [
      "只要第一個節點可以更改，就在頭之前錨定一個虛擬節點。",
      "`slow` 增加 1，`fast` 增加 2；當 `fast` 或 `fast->next` 為空（無循環）或指針相遇（循環）時停止。",
      "對於循環入口，將一個指針重置到頭部，並將兩者都前進一；他們在入口處見面。",
      "反轉時，保留`previous`和`current`；每一步都會儲存 `current->next`，將其重定向到 `previous`，並將兩者都右轉。",
      "對於重新排序/回文，組成原語：中間→反轉後半部→合併或比較。",
      "如果問題需要無損檢查，請稍後恢復清單。",
    ],
    invariant:
      "**距離間隙不變。 ** `slow` 走一步，`fast` 走兩步，它們之間的間隙每步增加一倍，並且在長度為 `c` 的循環內，間隙計數以 `c` 為模 — 因此，一旦兩個指針都在內部，間隙必須在 `c` 步內達到 0，從而強制相遇。對於入口點：如果頭部從入口處開始是`a`個節點，而碰巧有`b`個節點進入循環，則為`a ≡ c − b (mod c)`，這樣兩個指針從頭部開始一步步前進，從相遇點一起到達入口處。反轉保持其自身的不變量：`current` 之前的前綴完全反轉，而 `current` 的後綴保持不變，因此隨時停止都會留下一致的列表。",
    variants: [
      "循環入口（鍊錶循環II）：相遇，重置一個指標到頭，步調一致地前進。",
      "從末端開始第 K 個：給引導指標一個 k 個節點的起始位置，並向前推進，直到它脫落。",
      "k組反轉：一次反轉k個節點，將每個組的舊頭重新連接為新尾。",
      "回文檢查：中間+反向後半部+平行行走（可選恢復清單）。",
      "陣列作為隱式清單：尋找重複數字在 `i → nums[i]` 上執行 Floyd。",
    ],
    templateKeys: [
      "fast_slow_cycle",
      "reverse_linked_list",
      "merge_sorted_lists",
    ],
    complexity: [
      "每個基元都是 O(n) 時間和 O(1) 額外空間－此常數空間通常是整個點與雜湊集或陣列複製基線。",
      "Floyd 的會議最多需要 n + c 步；找出入口階段最多再增加n個。",
      "遞歸列表解決方案消耗 O(n) 堆疊空間，默默地喪失 O(1) 空間優勢。",
    ],
    mistakes: [
      "取消引用 `fast->next->next` 而不檢查 `fast->next`。反例：除非 `fast` 和 `fast->next` 都經過測試，否則雙節點非循環列表在第二次前進時崩潰。",
      "在反轉過程中遺失後綴。在重定向之前忘記保存 `current->next` 會孤立清單的其餘部分；拯救必須先行。",
      "中間相差一，長度均勻。 `while (fast && fast->next)`環路在第二個中間節點上留下`slow`；回文拆分必須選擇一種約定並遵守它。",
      "拆卸時跳過假人頭。反例：從 2 節點清單末尾刪除第二個節點會刪除頭本身 - 只有哨兵才能使其成為普通的取消連結。",
    ],
    practice: [
      {
        id: 206,
        title: "反向鍊錶",
        slug: "reverse-linked-list",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "原地反轉",
        why: "孤立的反轉原語；掌握之前/當前的舞蹈。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 876,
        title: "鍊錶的中間",
        slug: "middle-of-the-linked-list",
        rating: 1250,
        difficulty: "Easy",
        subPattern: "快/慢中",
        why: "純速比定位：一次通過，不計數。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 141,
        title: "鍊錶循環",
        slug: "linked-list-cycle",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "循環檢測",
        why: "佛洛伊德的會議爭論沒有額外的記憶。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 21,
        title: "合併兩個排序列表",
        slug: "merge-two-sorted-lists",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "虛擬頭合併",
        why: "哨兵刪除每個第一個節點的特殊情況。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 19,
        title: "從清單末尾刪除第 N 個節點",
        slug: "remove-nth-node-from-end-of-list",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "領先差距",
        why: "k 節點領先取代了長度計數過程；假頭負責頭部移除。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 142,
        title: "鍊錶循環II",
        slug: "linked-list-cycle-ii",
        rating: 1550,
        difficulty: "Medium",
        subPattern: "循環進入",
        why: "重設到頭階段－本章的模組化算術核心。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 234,
        title: "回文鍊錶",
        slug: "palindrome-linked-list",
        rating: 1450,
        difficulty: "Easy",
        subPattern: "中間+反向+比較",
        why: "將三個原語組合成 O(1) 空間檢定。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 143,
        title: "重新排序列表",
        slug: "reorder-list",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "中間+反向+交錯",
        why: "相同的構圖，但是拼接而不是比較。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 92,
        title: "反向鍊錶二",
        slug: "reverse-linked-list-ii",
        rating: 1650,
        difficulty: "Medium",
        subPattern: "子列表反轉",
        why: "兩側邊界重新連接的逆轉。",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 287,
        title: "找到重複的數字",
        slug: "find-the-duplicate-number",
        rating: 1750,
        difficulty: "Medium",
        subPattern: "隱式清單循環",
        why: "Floyd on i → nums[i]：迴圈條目等於重複值。",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 25,
        title: "k 組中的反向節點",
        slug: "reverse-nodes-in-k-group",
        rating: 1950,
        difficulty: "Hard",
        subPattern: "分組反轉",
        why: "透過嚴格的組核算重複子列表反轉。",
        order: 11,
        tier: "Challenge Practice",
      },
      {
        id: 23,
        title: "合併 k 個排序列表",
        slug: "merge-k-sorted-lists",
        rating: 1850,
        difficulty: "Hard",
        subPattern: "k 路虛擬頭合併",
        why: "使用堆或分而治之來擴展合併。",
        order: 12,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "速度比或領先優勢能否取代明確的長度計數過程？",
      "我的循環防護是否在雙倍前進之前檢查 `fast` 和 `fast->next` ？",
      "我是否在反轉期間重定向 `current->next` 之前保存它？",
      "頭部會改變嗎？如果是的話，我是否錨定了一個虛擬節點？",
    ],
    related: [
      "two-pointers-opposite",
      "heap-patterns",
      "loop-invariant",
      "divide-and-conquer",
    ],
  },

  {
    slug: "design-data-structures",
    title: "設計問題（LRU 快取和 O(1) 結構）",
    tagline:
      "使用列表、向量和堆組成哈希映射，以便每個承諾的操作（獲取、放置、逐出、採樣）都滿足其規定的時間限制。",
    icon: "Blocks",
    group: "Data Structure Patterns",
    concept: [
      "忙碌的廚房把最常用的平底鍋放在前面的掛鉤上：抓起一個，做飯，把它掛回前面，而最後一個掛鉤上的平底鍋總是沒人接觸時間最長的一個。當新的平底鍋到達並且架子已滿時，後平底鍋就會被存放起來。 LRU 快取正是這個機架 - 一個按最近順序排序的清單 - 加上一個標記索引，可以立即告訴您每個平底鍋掛在哪個掛鉤上，因此您永遠不需要搜尋機架。",
      "設計問題為您提供了一個操作契約（每個呼叫都有其所需的複雜性）而不是輸入/輸出難題。該工藝由兩個或三個原始結構組成，因此每個結構都涵蓋其他結構無法快速完成的操作。",
      "與演算法問題相比：計算沒有最終答案——正確性意味著每個操作在達到其界限的同時保持結構的相互一致性。",
    ],
    motivation: [
      "LRU 快取的蠻力將對儲存在向量中：在 O(n) 中進行掃描，刷新新近度意味著擦除和重新附加 - 也是 O(n)。",
      "範例：容量 2，呼叫 put(1)、put(2)、get(1)、put(3)。向量掃描會在每次呼叫時重新派生每個鍵的位置，而逐出掃描會在每次快取已滿時重新派生最舊的條目。",
      "重複的工作是搜尋索引可以記住的內容：雜湊映射會記住每個鍵的位置（消除獲取掃描），而雙向鍊錶會記住新近順序（消除逐出掃描並移至前端 O(1)）。",
    ],
    whenUse: [
      "如果您看到設計 X 支援 O(1) / O(log n) 的操作，請思考：為每個所需操作列出一個結構，然後將它們連接起來。",
      "如果您看到新近度或頻率驅逐（LRU、LFU），請考慮雙向鍊錶加上迭代器的雜湊映射。",
      "如果您看到使用插入/刪除 (getRandom) 進行隨機取樣，請考慮向量 + 與最後交換 + 索引對應。",
      "如果您看到流的運行聚合（中值、最小值），請考慮兩個堆疊或同步的輔助堆疊。",
      "如果您看到與其他容器一起實作一個容器（透過堆疊排隊），請考慮收件匣和寄件匣之間的攤提傳輸。",
    ],
    coreIdea: [
      "寫下操作契約：每個呼叫及其所需的綁定。",
      "每個硬要求選擇一個原語：用於尋找的雜湊圖、用於有序 O(1) 拼接的鍊錶、用於隨機存取的向量、用於極端的堆疊。",
      "連接它們：映射將位置（迭代器或索引）儲存在訂單結構內，而不是資料的副本。",
      "每個事實都保留一個事實來源，並在同一調用中更新每個鏡像 - 無需延遲記帳。",
      "遍歷每個操作並驗證它僅涉及 O(1)（或 O(log n)）工作，包括逐出路徑。",
      "測試契約邊：容量1，重新插入現有金鑰，刪除最後一個元素。",
    ],
    invariant:
      "**鏡像一致性不變。 ** 在每次操作之後，每個輔助結構都是主狀態的精確投影：雜湊映射精確地包含映射到其真實位置的活動鍵，並且順序結構精確地包含以其聲明的順序的活動條目。每個移動資料的操作都會在返回之前更新所有鏡像，因此任何單一結構都可以回答其查詢，而無需諮詢其他結構。逐出正確性直接遵循：新近度清單的尾部確實是最近最近的，因為每次訪問都會將所觸及的節點拼接到前面。",
    variants: [
      "LRU快取：雙向鍊錶+迭代器的雜湊圖；驅逐在尾部。",
      "LFU快取：按頻率清單+鍵映射+最小頻率遊標。",
      "與最後一個隨機集交換：向量+索引圖；刪除會用尾部元素填滿這個洞。",
      "兩堆中位數：下半部的最大堆，上半部的最小堆，大小平衡在一內。",
      "聚合堆疊/佇列：運行最小值的輔助堆疊，或由兩個具有攤銷 O(1) 傳輸的堆疊建構的佇列。",
    ],
    templateKeys: ["lru_cache", "insert_delete_getrandom", "min_stack"],
    complexity: [
      "LRU 操作是 O(1) 最壞情況 - 哈希查找加上列表拼接；空間是O(容量)，迭代器映射是隱藏成本。",
      "與最後交換給出 O(1) 插入/刪除/樣本；隱藏的限制是元素順序被破壞，這正是均勻取樣所允許的。",
      "兩堆中位數是 O(log n) 插入和 O(1) 查詢；支援刪除新增了延遲刪除清理攤銷。",
    ],
    mistakes: [
      "將值儲存在地圖中並在列表中排序而不連結它們。反例： get(key) 在 O(1) 中找到值，但必須掃描列表以刷新新近度 - 映射必須儲存列表迭代器，而不是單獨的值。",
      "透過擦除並重新插入使迭代器無效。 `std::list::splice` 將節點移到前面時保留迭代器；擦除加插入則不會。",
      "將現有鑰匙上的放置視為插入。反例：容量 2 與 put(1)、put(2)、put(1, new)、put(3) 必須逐出 2，而不是 1 — 現有鍵路徑刷新新近度並更新值而不逐出。",
      "在 swap-with-last 中，在更新移動元素之前會清除目標的索引條目。當刪除最後一個元素時，兩個條目發生衝突；首先更新移動的索引或保護相同的情況。",
    ],
    practice: [
      {
        id: 155,
        title: "最小堆疊",
        slug: "min-stack",
        rating: 1350,
        difficulty: "Medium",
        subPattern: "同步聚合堆疊",
        why: "最小的組成：一個輔助陣列反映了運行的最小值。",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 232,
        title: "使用堆疊實作佇列",
        slug: "implement-queue-using-stacks",
        rating: 1250,
        difficulty: "Easy",
        subPattern: "攤銷兩棧轉移",
        why: "收件匣/寄件匣技巧及其攤銷 O(1) 參數。",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 706,
        title: "設計HashMap",
        slug: "design-hashmap",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "從頭開始的水桶",
        why: "建立其他一切所依賴的原始版本。",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 380,
        title: "插入 刪除 GetRandom O(1)",
        slug: "insert-delete-getrandom-o1",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "swap-with-last",
        why: "向量+索引圖；刪除的是整個訪談。",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 146,
        title: "LRU 快取",
        slug: "lru-cache",
        rating: 1800,
        difficulty: "Medium",
        subPattern: "列表+迭代器映射",
        why: "規格設計問題：在 O(1) 中拼接的新近度清單。",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 622,
        title: "設計循環隊列",
        slug: "design-circular-queue",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "環形緩衝區算術",
        why: "具有明確的滿/空狀態的頭/尾模組化算術。",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 1396,
        title: "設計地下系統",
        slug: "design-underground-system",
        rating: 1464,
        difficulty: "Medium",
        subPattern: "配對哈希映射",
        why: "兩張不同鍵控的地圖必須一致地反映同一個旅程事實。",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 2349,
        title: "設計數位容器系統",
        slug: "design-a-number-container-system",
        rating: 1540,
        difficulty: "Medium",
        subPattern: "映射 + 每個值的有序集",
        why: "索引更新必須擦除陳舊的反向映射。",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 295,
        title: "從資料流中尋找中值",
        slug: "find-median-from-data-stream",
        rating: 1850,
        difficulty: "Hard",
        subPattern: "兩個平衡堆",
        why: "經典的流聚合具有大小平衡不變量。",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 460,
        title: "LFU 快取",
        slug: "lfu-cache",
        rating: 2100,
        difficulty: "Hard",
        subPattern: "頻率桶",
        why: "每個頻率桶內都有一個 LRU 清單以及一個最小頻率遊標。",
        order: 10,
        tier: "Challenge Practice",
      },
      {
        id: 432,
        title: "所有 O`one 資料結構",
        slug: "all-oone-data-structure",
        rating: 2050,
        difficulty: "Hard",
        subPattern: "計數桶列表",
        why: "雙向連結計數桶將最小和最大鍵保留在 O(1) 的末端。",
        order: 11,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "在選擇結構之前我是否寫下了每個操作的複雜性契約？",
      "每個事實是否都有一個事實來源，所有鏡像都在同一個呼叫中更新？",
      "驅逐/刪除路徑是否也是 O(1)，而不僅僅是快樂路徑？",
      "我是否測試了容量 1、重新插入現有密鑰並刪除尾部元素？",
    ],
    related: [
      "hash-map-frequency",
      "heap-patterns",
      "monotonic-data-structures",
      "state-design",
    ],
  },
];

const TOPIC_TITLE_BY_SLUG = new Map(
  TOPIC_DEFINITIONS.map((topic) => [topic.slug, topic.title]),
);

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * Section 1 renders the first `concept` entry as a lead paragraph (the intuitive
 * analogy, tutorial style) and the remaining entries as supporting bullets.
 */
function conceptMarkdown(concept: string[]): string {
  const [lead, ...rest] = concept;
  const intro = lead ?? "";
  const bullets = rest.length > 0 ? `\n\n${bulletList(rest)}` : "";
  return `${intro}${bullets}\n\n這個主題與暴力法的差異，在於它用明確命名的模式、可維護的狀態或證明義務，取代重複的候選評估。`;
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function templateMarkdown(keys: string[]): string {
  return keys
    .map((key) => {
      const template = TEMPLATES[key];
      const meta = TEMPLATE_META[key];
      const basis = TEMPLATE_BASIS[key];
      if (!template || !meta || !basis) {
        throw new Error(`Missing handbook template, meta, or basis: ${key}`);
      }
      // Tell the reader exactly what the code implements: a linked LeetCode
      // reference when it solves one problem, or a detailed pattern description.
      const basisLine = basis.lc
        ? `_依據：_ [LeetCode ${basis.lc.id}. ${basis.lc.title}](https://leetcode.cn/problems/${basis.lc.slug}/)`
        : `_模式：_ ${basis.pattern}`;
      const body = [
        basisLine,
        "",
        `_使用時機：_ ${meta.whenToUse}`,
        "",
        "````cpp",
        template.code,
        "```",
      ].join("\n");
      // Every C++17 template is collapsed by default so the section stays
      // compact; readers expand the templates they want to study.
      return collapsible(`${meta.name} — ${meta.complexity}`, body);
    })
    .join("\n\n");
}

function practiceTable(
  title: PracticeProblem["tier"],
  rows: PracticeProblem[],
): string {
  if (rows.length === 0) {
    return "";
  }

  const tierLabel: Record<PracticeProblem["tier"], string> = {
    "Core Practice": "核心練習",
    "Advanced Practice": "進階練習",
    "Challenge Practice": "挑戰練習",
  };
  const difficultyLabel: Record<string, string> = {
    Easy: "簡單",
    Medium: "中等",
    Hard: "困難",
  };

  const header = [
    `**${tierLabel[title]}**`,
    "",
    // Keep this four-column shape so HandbookSectionBody upgrades it to
    // ProblemList, which applies the EN/CN LeetCode host from site settings.
    "| 題號 | 題目 | 評分 | 技巧 |",
    "|---:|---|---:|---|",
  ];
  const body = rows.map(
    (problem) =>
      `| ${problem.id} | [${problem.title}](https://leetcode.com/problems/${problem.slug}) | ${problem.rating} | ${problem.order}. ${problem.subPattern} (${difficultyLabel[problem.difficulty] ?? problem.difficulty}) |`,
  );
  return [...header, ...body].join("\n");
}

function practiceMarkdown(problems: PracticeProblem[]): string {
  const tiers: PracticeProblem["tier"][] = [
    "Core Practice",
    "Advanced Practice",
    "Challenge Practice",
  ];
  return tiers
    .map((tier) =>
      practiceTable(
        tier,
        problems.filter((p) => p.tier === tier),
      ),
    )
    .filter(Boolean)
    .join("\n\n");
}

function variantsMarkdown(variants: string[]): string {
  return collapsible(`常見變形 — ${variants.length} 種`, bulletList(variants));
}

function recognitionMarkdown(recognition: string[]): string {
  return collapsible(
    `辨識檢查清單 — ${recognition.length} 個問題`,
    bulletList(recognition),
  );
}

function proofMarkdown(topic: PatternTopicDefinition): string {
  const body = `${topic.invariant} 演算法會在處理前建立這個敘述，在每次更新後恢復它，並且只從此敘述涵蓋的狀態讀取答案。任何被最佳化演算法略過的候選者，都已經由維護中的狀態表示、被更好的候選者支配，或被歸到另一個標準負責者。因此，最佳化後的計數或選擇會與暴力法定義相同。`;
  return collapsible(`證明草圖：${topic.title}`, body);
}

function relatedMarkdown(slugs: string[]): string {
  const links = slugs
    .map((slug) => {
      const title = TOPIC_TITLE_BY_SLUG.get(slug) ?? slug;
      return `- [${title}](/handbook/${slug})`;
    })
    .join("\n");
  return collapsible(`相關主題 — ${slugs.length} 個連結`, links);
}

/**
 * Runtime guard enforcing the handbook's collapsible contract:
 *  - section 10 (LeetCode Problems) is NEVER wrapped in a collapsible, and
 *  - every template in the C++17 templates section is collapsed by default.
 * Throws during module load (and therefore at build time) on violation.
 */
function assertSectionsAreValid(topic: HandbookTopic): HandbookTopic {
  const problems = topic.sections.find((s) => s.id === "practice-problems");
  if (problems && /<details|<summary|:::example/.test(problems.body)) {
    throw new Error(
      `Section 10 of "${topic.slug}" must not be collapsible (found a <details>/:::example wrapper).`,
    );
  }
  const templates = topic.sections.find((s) => s.id === "cpp17-templates");
  if (templates) {
    const openCount = (templates.body.match(/<details open>/g) ?? []).length;
    if (openCount !== 0) {
      throw new Error(
        `Section 7 of "${topic.slug}" must have every template collapsed by default (found ${openCount} expanded).`,
      );
    }
  }
  return topic;
}

function createTopic(def: PatternTopicDefinition): HandbookTopic {
  return {
    slug: def.slug,
    title: def.title,
    tagline: def.tagline,
    icon: def.icon,
    group: def.group,
    interviewFrequency: getInterviewFrequency(def.slug),
    sections: [
      {
        id: "concept-explanation",
        title: "1. 概念解釋",
        body: conceptMarkdown(def.concept),
      },
      {
        id: "problem-motivation",
        title: "2. 問題動機",
        body: `先從字面上的暴力解法出發，再找出重複工作。\n\n${numberedList(def.motivation)}\n\n最佳化後的模式保留暴力法的負責規則，但改變昂貴資訊的取得方式。`,
      },
      {
        id: "when-to-use",
        title: "3. 何時使用",
        body: bulletList(def.whenUse),
      },
      {
        id: "core-idea",
        title: "4. 核心理念",
        // Numbered so each step of the core algorithm is explicit (tutorial style).
        body: def.coreIdeaAppendix
          ? `${numberedList(def.coreIdea)}\n\n${def.coreIdeaAppendix}`
          : numberedList(def.coreIdea),
      },
      {
        id: "key-invariant",
        title: "5. 關鍵不變性或正確性的想法",
        body: `${def.invariant}\n\n${proofMarkdown(def)}`,
      },
      {
        id: "common-variants",
        title: "6. 常見變異",
        body: variantsMarkdown(def.variants),
      },
      {
        id: "cpp17-templates",
        title: "7. C++17 模板",
        body: `這些模板刻意保持精簡，並以 LeetCode 題型為導向。實作時請依題目敘述調整命名與回傳型別。\n\n${templateMarkdown(def.templateKeys)}`,
      },
      {
        id: "complexity-analysis",
        title: "8. 複雜度分析",
        body: bulletList(def.complexity),
      },
      {
        id: "common-mistakes",
        title: "9. 常見錯誤",
        body: bulletList(def.mistakes),
      },
      {
        id: "practice-problems",
        title: "10. LeetCode 題目",
        body: practiceMarkdown(def.practice),
      },
      {
        id: "recognition-checklist",
        title: "11. 辨識檢查清單",
        body: recognitionMarkdown(def.recognition),
      },
      {
        id: "related-topics",
        title: "12. 相關主題",
        body: relatedMarkdown(def.related),
      },
    ],
  };
}

export const PATTERN_HANDBOOK_TOPICS: HandbookTopic[] = TOPIC_DEFINITIONS.map(
  (def) => assertSectionsAreValid(createTopic(def)),
);
