import type { HandbookTopic } from "../model";

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
    summary: "C++17 Template: Constraint-Guided Scan",
    code: "// C++17 Template: Constraint-Guided Scan\nclass Solution {\n public:\n  long long countSubarraysAtMost(vector<int>& nums, long long limit) {\n    long long answer = 0;\n    long long window_sum = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (left <= right && window_sum > limit) {\n        window_sum -= nums[left];\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};",
  },
  brute_force_to_prefix: {
    summary: "C++17 Template: Replace Inner Work with Prefix State",
    code: "// C++17 Template: Replace Inner Work with Prefix State\nclass Solution {\n public:\n  int minSubarray(vector<int>& nums, int p) {\n    long long total = 0;\n    for (int value : nums) {\n      total += value;\n    }\n\n    const int target = static_cast<int>(total % p);\n    if (target == 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> last_index;\n    last_index[0] = -1;\n    int prefix = 0;\n    int answer = nums.size();\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      prefix = (prefix + nums[i]) % p;\n      const int need = (prefix - target + p) % p;\n      if (last_index.count(need) != 0) {\n        answer = min(answer, i - last_index[need]);\n      }\n      last_index[prefix] = i;\n    }\n\n    return answer == static_cast<int>(nums.size()) ? -1 : answer;\n  }\n};",
  },
  answer_search: {
    summary: "C++17 Template: Binary Search on Answer",
    code: "// C++17 Template: Binary Search on Answer\nclass Solution {\n public:\n  int shipWithinDays(vector<int>& weights, int days) {\n    int low = 0;\n    long long high_sum = 0;\n    for (int weight : weights) {\n      low = max(low, weight);\n      high_sum += weight;\n    }\n    int high = static_cast<int>(high_sum);\n\n    auto can_ship = [&](int capacity) {\n      int used_days = 1;\n      int load = 0;\n      for (int weight : weights) {\n        if (load + weight > capacity) {\n          ++used_days;\n          load = 0;\n        }\n        load += weight;\n      }\n      return used_days <= days;\n    };\n\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (can_ship(mid)) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};",
  },
  loop_invariant_binary_search: {
    summary: "C++17 Template: Lower Bound with Loop Invariant",
    code: "// C++17 Template: Lower Bound with Loop Invariant\nclass Solution {\n public:\n  int lowerBound(vector<int>& nums, int target) {\n    int low = 0;\n    int high = nums.size();\n\n    // Invariant: every index < low is too small; every index >= high is valid.\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (nums[mid] >= target) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};",
  },
  enumerate_middle: {
    summary: "C++17 Template: Enumerate Middle with Fenwick Counts",
    code: "// C++17 Template: Enumerate Middle with Fenwick Counts\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  long long countIncreasingTriplets(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree left_tree(values.size());\n    FenwickTree right_tree(values.size());\n    for (int value : nums) {\n      right_tree.add(rankOf(values, value), 1);\n    }\n\n    long long answer = 0;\n    for (int value : nums) {\n      const int rank = rankOf(values, value);\n      right_tree.add(rank, -1);\n      const long long smaller_left = left_tree.query(rank - 1);\n      const long long greater_right =\n          right_tree.query(values.size()) - right_tree.query(rank);\n      answer += smaller_left * greater_right;\n      left_tree.add(rank, 1);\n    }\n\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& values, int value) const {\n    return lower_bound(values.begin(), values.end(), value) - values.begin() + 1;\n  }\n};",
  },
  subset_enumeration: {
    summary: "C++17 Template: Submask Enumeration",
    code: "// C++17 Template: Submask Enumeration\nclass Solution {\n public:\n  int bestSubsetScore(vector<int>& score) {\n    const int n = score.size();\n    const int mask_count = 1 << n;\n    vector<int> dp(mask_count, 0);\n\n    for (int mask = 1; mask < mask_count; ++mask) {\n      for (int submask = mask; submask > 0; submask = (submask - 1) & mask) {\n        const int remaining = mask ^ submask;\n        dp[mask] = max(dp[mask], dp[remaining] + valueOf(submask, score));\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n\n private:\n  int valueOf(int mask, const vector<int>& score) const {\n    int value = 0;\n    for (int bit = 0; bit < static_cast<int>(score.size()); ++bit) {\n      if (((mask >> bit) & 1) != 0) {\n        value += score[bit];\n      }\n    }\n    return value;\n  }\n};",
  },
  contribution_mono: {
    summary: "C++17 Template: Sum of Subarray Minimums Style",
    code: "// C++17 Template: Sum of Subarray Minimums Style\nclass Solution {\n public:\n  int sumSubarrayMins(vector<int>& arr) {\n    const int kMod = 1'000'000'007;\n    const int n = arr.size();\n    vector<int> left(n);\n    vector<int> right(n);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] > arr[i]) {\n        stack_indices.pop_back();\n      }\n      left[i] = stack_indices.empty() ? -1 : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    stack_indices.clear();\n    for (int i = n - 1; i >= 0; --i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] >= arr[i]) {\n        stack_indices.pop_back();\n      }\n      right[i] = stack_indices.empty() ? n : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    long long answer = 0;\n    for (int i = 0; i < n; ++i) {\n      const long long left_choices = i - left[i];\n      const long long right_choices = right[i] - i;\n      answer = (answer + left_choices * right_choices % kMod * arr[i]) % kMod;\n    }\n    return static_cast<int>(answer);\n  }\n};",
  },
  pair_contribution: {
    summary: "C++17 Template: Pair Contribution after Sorting",
    code: "// C++17 Template: Pair Contribution after Sorting\nclass Solution {\n public:\n  long long sumPairDistances(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    long long answer = 0;\n    long long prefix_sum = 0;\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      answer += 1LL * nums[i] * i - prefix_sum;\n      prefix_sum += nums[i];\n    }\n\n    return answer;\n  }\n};",
  },
  prefix_contribution: {
    summary: "C++17 Template: Prefix and Suffix Contribution",
    code: "// C++17 Template: Prefix and Suffix Contribution\nclass Solution {\n public:\n  long long countSplitsWithLeftMax(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> prefix_max(n);\n    vector<int> suffix_min(n);\n\n    for (int i = 0; i < n; ++i) {\n      prefix_max[i] = i == 0 ? nums[i] : max(prefix_max[i - 1], nums[i]);\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix_min[i] = i + 1 == n ? nums[i] : min(suffix_min[i + 1], nums[i]);\n    }\n\n    long long answer = 0;\n    for (int cut = 0; cut + 1 < n; ++cut) {\n      if (prefix_max[cut] <= suffix_min[cut + 1]) {\n        ++answer;\n      }\n    }\n    return answer;\n  }\n};",
  },
  longest_window: {
    summary: "C++17 Template: Longest Valid Window",
    code: "// C++17 Template: Longest Valid Window\nclass Solution {\n public:\n  int longestOnes(vector<int>& nums, int k) {\n    int zero_count = 0;\n    int left = 0;\n    int answer = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      if (nums[right] == 0) {\n        ++zero_count;\n      }\n      while (zero_count > k) {\n        if (nums[left] == 0) {\n          --zero_count;\n        }\n        ++left;\n      }\n      answer = max(answer, right - left + 1);\n    }\n\n    return answer;\n  }\n};",
  },
  shortest_window: {
    summary: "C++17 Template: Shortest Valid Window",
    code: "// C++17 Template: Shortest Valid Window\nclass Solution {\n public:\n  int minSubArrayLen(int target, vector<int>& nums) {\n    int answer = nums.size() + 1;\n    int left = 0;\n    long long window_sum = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (window_sum >= target) {\n        answer = min(answer, right - left + 1);\n        window_sum -= nums[left];\n        ++left;\n      }\n    }\n\n    return answer == static_cast<int>(nums.size()) + 1 ? 0 : answer;\n  }\n};",
  },
  at_most_k_distinct: {
    summary: "C++17 Template: Count Subarrays with At Most K Distinct Values",
    code: "// C++17 Template: Count Subarrays with At Most K Distinct Values\nclass Solution {\n public:\n  long long subarraysWithAtMostKDistinct(vector<int>& nums, int k) {\n    unordered_map<int, int> frequency;\n    long long answer = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};",
  },
  exactly_k_distinct: {
    summary: "C++17 Template: Exactly K via At Most",
    code: "// C++17 Template: Exactly K via At Most\nclass Solution {\n public:\n  int subarraysWithKDistinct(vector<int>& nums, int k) {\n    return atMost(nums, k) - atMost(nums, k - 1);\n  }\n\n private:\n  int atMost(const vector<int>& nums, int k) {\n    if (k < 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> frequency;\n    int answer = 0;\n    int left = 0;\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n    return answer;\n  }\n};",
  },
  bitwise_or_window: {
    summary: "C++17 Template: Bitwise OR Window with Bit Counts",
    code: "// C++17 Template: Bitwise OR Window with Bit Counts\nclass Solution {\n public:\n  int minimumSubarrayLength(vector<int>& nums, int k) {\n    const int n = nums.size();\n    vector<int> bit_count(kMaxBits, 0);\n    int answer = n + 1;\n    int left = 0;\n\n    for (int right = 0; right < n; ++right) {\n      addValue(nums[right], &bit_count);\n      while (left <= right && currentOr(bit_count) >= k) {\n        answer = min(answer, right - left + 1);\n        removeValue(nums[left], &bit_count);\n        ++left;\n      }\n    }\n\n    return answer == n + 1 ? -1 : answer;\n  }\n\n private:\n  static constexpr int kMaxBits = 31;\n\n  void addValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        ++(*bit_count)[bit];\n      }\n    }\n  }\n\n  void removeValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        --(*bit_count)[bit];\n      }\n    }\n  }\n\n  int currentOr(const vector<int>& bit_count) const {\n    int value = 0;\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (bit_count[bit] > 0) {\n        value |= 1 << bit;\n      }\n    }\n    return value;\n  }\n};",
  },
  prefix_suffix_counts: {
    summary: "C++17 Template: Prefix/Suffix Counts around a Pivot",
    code: "// C++17 Template: Prefix/Suffix Counts around a Pivot\nclass Solution {\n public:\n  long long countPatternAroundMiddle(string s) {\n    const int n = s.size();\n    vector<array<int, 10>> prefix(n + 1);\n    vector<array<int, 10>> suffix(n + 1);\n\n    for (int i = 0; i < n; ++i) {\n      prefix[i + 1] = prefix[i];\n      ++prefix[i + 1][s[i] - '0'];\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix[i] = suffix[i + 1];\n      ++suffix[i][s[i] - '0'];\n    }\n\n    long long answer = 0;\n    for (int middle = 0; middle < n; ++middle) {\n      for (int digit = 0; digit < 10; ++digit) {\n        answer += 1LL * prefix[middle][digit] * suffix[middle + 1][digit];\n      }\n    }\n    return answer;\n  }\n};",
  },
  difference_array: {
    summary: "C++17 Template: Difference Array Range Add",
    code: "// C++17 Template: Difference Array Range Add\nclass Solution {\n public:\n  vector<long long> applyRangeUpdates(int n, vector<vector<int>>& updates) {\n    vector<long long> diff(n + 1, 0);\n    for (const auto& update : updates) {\n      const int left = update[0];\n      const int right = update[1];\n      const int delta = update[2];\n      diff[left] += delta;\n      if (right + 1 < n) {\n        diff[right + 1] -= delta;\n      }\n    }\n\n    vector<long long> answer(n, 0);\n    long long running = 0;\n    for (int i = 0; i < n; ++i) {\n      running += diff[i];\n      answer[i] = running;\n    }\n    return answer;\n  }\n};",
  },
  difference_matrix: {
    summary: "C++17 Template: 2D Difference Array",
    code: "// C++17 Template: 2D Difference Array\nclass Solution {\n public:\n  vector<vector<int>> rangeAddQueries(int n, vector<vector<int>>& queries) {\n    vector<vector<int>> diff(n + 1, vector<int>(n + 1, 0));\n    for (const auto& query : queries) {\n      const int row1 = query[0];\n      const int col1 = query[1];\n      const int row2 = query[2];\n      const int col2 = query[3];\n      ++diff[row1][col1];\n      --diff[row2 + 1][col1];\n      --diff[row1][col2 + 1];\n      ++diff[row2 + 1][col2 + 1];\n    }\n\n    vector<vector<int>> answer(n, vector<int>(n, 0));\n    for (int row = 0; row < n; ++row) {\n      for (int col = 0; col < n; ++col) {\n        int value = diff[row][col];\n        if (row > 0) {\n          value += answer[row - 1][col];\n        }\n        if (col > 0) {\n          value += answer[row][col - 1];\n        }\n        if (row > 0 && col > 0) {\n          value -= answer[row - 1][col - 1];\n        }\n        answer[row][col] = value;\n      }\n    }\n    return answer;\n  }\n};",
  },
  monotonic_stack: {
    summary: "C++17 Template: Monotonic Stack Boundaries",
    code: "// C++17 Template: Monotonic Stack Boundaries\nclass Solution {\n public:\n  vector<int> nextGreaterElements(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> answer(n, -1);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && nums[stack_indices.back()] < nums[i]) {\n        answer[stack_indices.back()] = nums[i];\n        stack_indices.pop_back();\n      }\n      stack_indices.push_back(i);\n    }\n\n    return answer;\n  }\n};",
  },
  monotonic_deque: {
    summary: "C++17 Template: Monotonic Deque Window Maximum",
    code: "// C++17 Template: Monotonic Deque Window Maximum\nclass Solution {\n public:\n  vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> indices;\n    vector<int> answer;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      while (!indices.empty() && indices.front() <= right - k) {\n        indices.pop_front();\n      }\n      while (!indices.empty() && nums[indices.back()] <= nums[right]) {\n        indices.pop_back();\n      }\n      indices.push_back(right);\n      if (right + 1 >= k) {\n        answer.push_back(nums[indices.front()]);\n      }\n    }\n\n    return answer;\n  }\n};",
  },
  coordinate_compression_fenwick: {
    summary: "C++17 Template: Coordinate Compression with Fenwick Tree",
    code: "// C++17 Template: Coordinate Compression with Fenwick Tree\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countSmaller(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree tree(values.size());\n    vector<int> answer(nums.size(), 0);\n    for (int i = static_cast<int>(nums.size()) - 1; i >= 0; --i) {\n      const int rank = lower_bound(values.begin(), values.end(), nums[i]) -\n                       values.begin() + 1;\n      answer[i] = tree.query(rank - 1);\n      tree.add(rank, 1);\n    }\n    return answer;\n  }\n};",
  },
  exchange_greedy: {
    summary: "C++17 Template: Greedy by Earliest Finish",
    code: "// C++17 Template: Greedy by Earliest Finish\nclass Solution {\n public:\n  int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end(), [](const auto& left, const auto& right) {\n      return left[1] < right[1];\n    });\n\n    int kept = 0;\n    int current_end = numeric_limits<int>::min();\n    for (const auto& interval : intervals) {\n      if (interval[0] >= current_end) {\n        ++kept;\n        current_end = interval[1];\n      }\n    }\n\n    return intervals.size() - kept;\n  }\n};",
  },
  interval_cover_greedy: {
    summary: "C++17 Template: Greedy Stays Ahead for Interval Cover",
    code: "// C++17 Template: Greedy Stays Ahead for Interval Cover\nclass Solution {\n public:\n  int minIntervalsToCover(vector<vector<int>>& intervals, int target_right) {\n    sort(intervals.begin(), intervals.end());\n    int answer = 0;\n    int index = 0;\n    int current_end = 0;\n\n    while (current_end < target_right) {\n      int farthest = current_end;\n      while (index < static_cast<int>(intervals.size()) &&\n             intervals[index][0] <= current_end) {\n        farthest = max(farthest, intervals[index][1]);\n        ++index;\n      }\n      if (farthest == current_end) {\n        return -1;\n      }\n      current_end = farthest;\n      ++answer;\n    }\n\n    return answer;\n  }\n};",
  },
  greedy_builder: {
    summary: "C++17 Template: Greedy Construction with Feasibility Check",
    code: "// C++17 Template: Greedy Construction with Feasibility Check\nclass Solution {\n public:\n  string buildSmallestString(int n, int total_value) {\n    string answer;\n    int remaining_value = total_value;\n\n    for (int position = 0; position < n; ++position) {\n      for (char candidate = 'a'; candidate <= 'z'; ++candidate) {\n        const int value = candidate - 'a' + 1;\n        if (canFinish(n - position - 1, remaining_value - value)) {\n          answer.push_back(candidate);\n          remaining_value -= value;\n          break;\n        }\n      }\n    }\n\n    return answer;\n  }\n\n private:\n  bool canFinish(int remaining_slots, int remaining_value) const {\n    const int min_value = remaining_slots;\n    const int max_value = 26 * remaining_slots;\n    return min_value <= remaining_value && remaining_value <= max_value;\n  }\n};",
  },
  greedy_lexicographic: {
    summary:
      "C++17 Template: Lexicographically Smallest Subsequence with Quota",
    code: "// C++17 Template: Lexicographically Smallest Subsequence with Quota\nclass Solution {\n public:\n  string smallestSubsequence(string s, int k, char letter, int repetition) {\n    int remaining_letter = 0;\n    for (char ch : s) {\n      if (ch == letter) {\n        ++remaining_letter;\n      }\n    }\n\n    string stack_chars;\n    int used_letter = 0;\n    for (int i = 0; i < static_cast<int>(s.size()); ++i) {\n      const char ch = s[i];\n      const int remaining_slots = static_cast<int>(s.size()) - i;\n      while (!stack_chars.empty() && stack_chars.back() > ch &&\n             static_cast<int>(stack_chars.size()) - 1 + remaining_slots >= k) {\n        if (stack_chars.back() == letter) {\n          if (used_letter - 1 + remaining_letter < repetition) {\n            break;\n          }\n          --used_letter;\n        }\n        stack_chars.pop_back();\n      }\n\n      if (static_cast<int>(stack_chars.size()) < k) {\n        if (ch == letter) {\n          stack_chars.push_back(ch);\n          ++used_letter;\n        } else if (k - static_cast<int>(stack_chars.size()) >\n                   repetition - used_letter) {\n          stack_chars.push_back(ch);\n        }\n      }\n\n      if (ch == letter) {\n        --remaining_letter;\n      }\n    }\n\n    return stack_chars;\n  }\n};",
  },
  remaining_sum_construction: {
    summary: "C++17 Template: Remaining Sum Feasibility",
    code: "// C++17 Template: Remaining Sum Feasibility\nclass Solution {\n public:\n  string getSmallestString(int n, int k) {\n    string answer(n, 'a');\n    k -= n;\n\n    for (int i = n - 1; i >= 0 && k > 0; --i) {\n      const int add = min(25, k);\n      answer[i] = static_cast<char>('a' + add);\n      k -= add;\n    }\n\n    return answer;\n  }\n};",
  },
  frequency_construction: {
    summary: "C++17 Template: Frequency-Based Construction",
    code: "// C++17 Template: Frequency-Based Construction\nclass Solution {\n public:\n  string reorganizeString(string s) {\n    array<int, 26> frequency{};\n    for (char ch : s) {\n      ++frequency[ch - 'a'];\n    }\n\n    priority_queue<pair<int, char>> heap;\n    for (int i = 0; i < 26; ++i) {\n      if (frequency[i] > 0) {\n        heap.push({frequency[i], static_cast<char>('a' + i)});\n      }\n    }\n\n    string answer;\n    while (!heap.empty()) {\n      auto first = heap.top();\n      heap.pop();\n      if (!answer.empty() && answer.back() == first.second) {\n        if (heap.empty()) {\n          return \"\";\n        }\n        auto second = heap.top();\n        heap.pop();\n        answer.push_back(second.second);\n        if (--second.first > 0) {\n          heap.push(second);\n        }\n        heap.push(first);\n      } else {\n        answer.push_back(first.second);\n        if (--first.first > 0) {\n          heap.push(first);\n        }\n      }\n    }\n\n    return answer;\n  }\n};",
  },
  mst_kruskal: {
    summary: "C++17 Template: Cut Property with Kruskal",
    code: "// C++17 Template: Cut Property with Kruskal\nclass DisjointSet {\n public:\n  explicit DisjointSet(int n) : parent_(n), size_(n, 1) {\n    iota(parent_.begin(), parent_.end(), 0);\n  }\n\n  int findRoot(int node) {\n    if (parent_[node] != node) {\n      parent_[node] = findRoot(parent_[node]);\n    }\n    return parent_[node];\n  }\n\n  bool unite(int left, int right) {\n    int root_left = findRoot(left);\n    int root_right = findRoot(right);\n    if (root_left == root_right) {\n      return false;\n    }\n    if (size_[root_left] < size_[root_right]) {\n      swap(root_left, root_right);\n    }\n    parent_[root_right] = root_left;\n    size_[root_left] += size_[root_right];\n    return true;\n  }\n\n private:\n  vector<int> parent_;\n  vector<int> size_;\n};\n\nclass Solution {\n public:\n  int minimumCost(int n, vector<vector<int>>& edges) {\n    sort(edges.begin(), edges.end(), [](const auto& left, const auto& right) {\n      return left[2] < right[2];\n    });\n\n    DisjointSet dsu(n);\n    int total_cost = 0;\n    int used_edges = 0;\n    for (const auto& edge : edges) {\n      if (dsu.unite(edge[0], edge[1])) {\n        total_cost += edge[2];\n        ++used_edges;\n      }\n    }\n\n    return used_edges == n - 1 ? total_cost : -1;\n  }\n};",
  },
  state_bfs: {
    summary: "C++17 Template: BFS with Explicit State",
    code: "// C++17 Template: BFS with Explicit State\nclass Solution {\n public:\n  int shortestPathLength(vector<vector<int>>& graph) {\n    const int n = graph.size();\n    const int full_mask = (1 << n) - 1;\n    queue<pair<int, int>> states;\n    vector<vector<int>> distance(n, vector<int>(1 << n, -1));\n\n    for (int node = 0; node < n; ++node) {\n      const int mask = 1 << node;\n      states.push({node, mask});\n      distance[node][mask] = 0;\n    }\n\n    while (!states.empty()) {\n      const auto [node, mask] = states.front();\n      states.pop();\n      if (mask == full_mask) {\n        return distance[node][mask];\n      }\n      for (int next_node : graph[node]) {\n        const int next_mask = mask | (1 << next_node);\n        if (distance[next_node][next_mask] == -1) {\n          distance[next_node][next_mask] = distance[node][mask] + 1;\n          states.push({next_node, next_mask});\n        }\n      }\n    }\n\n    return 0;\n  }\n};",
  },
  bitmask_dp: {
    summary: "C++17 Template: Assignment State Compression DP",
    code: "// C++17 Template: Assignment State Compression DP\nclass Solution {\n public:\n  int minimumXORSum(vector<int>& nums1, vector<int>& nums2) {\n    const int n = nums1.size();\n    const int mask_count = 1 << n;\n    const int kInf = 1'000'000'000;\n    vector<int> dp(mask_count, kInf);\n    dp[0] = 0;\n\n    for (int mask = 0; mask < mask_count; ++mask) {\n      const int index = __builtin_popcount(static_cast<unsigned>(mask));\n      if (index >= n) {\n        continue;\n      }\n      for (int j = 0; j < n; ++j) {\n        if (((mask >> j) & 1) == 0) {\n          const int next_mask = mask | (1 << j);\n          dp[next_mask] = min(dp[next_mask], dp[mask] + (nums1[index] ^ nums2[j]));\n        }\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n};",
  },
  offline_fenwick: {
    summary: "C++17 Template: Offline Queries Sorted by Threshold",
    code: "// C++17 Template: Offline Queries Sorted by Threshold\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nstruct Query {\n  int left;\n  int right;\n  int limit;\n  int index;\n};\n\nclass Solution {\n public:\n  vector<int> countValuesAtMost(vector<int>& nums, vector<Query>& queries) {\n    vector<pair<int, int>> values;\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      values.push_back({nums[i], i + 1});\n    }\n    sort(values.begin(), values.end());\n    sort(queries.begin(), queries.end(), [](const Query& left, const Query& right) {\n      return left.limit < right.limit;\n    });\n\n    FenwickTree tree(nums.size());\n    vector<int> answer(queries.size(), 0);\n    int value_index = 0;\n    for (const Query& query : queries) {\n      while (value_index < static_cast<int>(values.size()) &&\n             values[value_index].first <= query.limit) {\n        tree.add(values[value_index].second, 1);\n        ++value_index;\n      }\n      answer[query.index] = tree.query(query.right + 1) - tree.query(query.left);\n    }\n    return answer;\n  }\n};",
  },
  sweep_events: {
    summary: "C++17 Template: Event Sorting Sweep",
    code: "// C++17 Template: Event Sorting Sweep\nclass Solution {\n public:\n  int maximumOverlap(vector<vector<int>>& intervals) {\n    vector<pair<int, int>> events;\n    for (const auto& interval : intervals) {\n      events.push_back({interval[0], 1});\n      events.push_back({interval[1] + 1, -1});\n    }\n    sort(events.begin(), events.end());\n\n    int active = 0;\n    int answer = 0;\n    for (const auto& [coordinate, delta] : events) {\n      active += delta;\n      answer = max(answer, active);\n    }\n    return answer;\n  }\n};",
  },
  sweep_difference: {
    summary: "C++17 Template: Difference Events",
    code: "// C++17 Template: Difference Events\nclass Solution {\n public:\n  vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {\n    map<int, int> events;\n    for (const auto& flower : flowers) {\n      ++events[flower[0]];\n      --events[flower[1] + 1];\n    }\n\n    vector<pair<int, int>> queries;\n    for (int i = 0; i < static_cast<int>(people.size()); ++i) {\n      queries.push_back({people[i], i});\n    }\n    sort(queries.begin(), queries.end());\n\n    vector<int> answer(people.size(), 0);\n    auto event_it = events.begin();\n    int active = 0;\n    for (const auto& [time, index] : queries) {\n      while (event_it != events.end() && event_it->first <= time) {\n        active += event_it->second;\n        ++event_it;\n      }\n      answer[index] = active;\n    }\n    return answer;\n  }\n};",
  },
  sweep_heap: {
    summary: "C++17 Template: Heap-Based Sweep",
    code: "// C++17 Template: Heap-Based Sweep\nclass Solution {\n public:\n  int minMeetingRooms(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    priority_queue<int, vector<int>, greater<int>> end_times;\n    int answer = 0;\n\n    for (const auto& interval : intervals) {\n      while (!end_times.empty() && end_times.top() <= interval[0]) {\n        end_times.pop();\n      }\n      end_times.push(interval[1]);\n      answer = max(answer, static_cast<int>(end_times.size()));\n    }\n\n    return answer;\n  }\n};",
  },
  sweep_compressed_fenwick: {
    summary: "C++17 Template: Compressed Sweep with Range Add",
    code: "// C++17 Template: Compressed Sweep with Range Add\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 2, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countCoveredPoints(vector<vector<int>>& intervals, vector<int>& points) {\n    vector<int> coords = points;\n    for (const auto& interval : intervals) {\n      coords.push_back(interval[0]);\n      coords.push_back(interval[1] + 1);\n    }\n    sort(coords.begin(), coords.end());\n    coords.erase(unique(coords.begin(), coords.end()), coords.end());\n\n    FenwickTree tree(coords.size() + 2);\n    for (const auto& interval : intervals) {\n      const int left = rankOf(coords, interval[0]);\n      const int right_after = rankOf(coords, interval[1] + 1);\n      tree.add(left, 1);\n      tree.add(right_after, -1);\n    }\n\n    vector<int> answer;\n    for (int point : points) {\n      answer.push_back(tree.query(rankOf(coords, point)));\n    }\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& coords, int value) const {\n    return lower_bound(coords.begin(), coords.end(), value) - coords.begin() + 1;\n  }\n};",
  },
  dp_state: {
    summary: "C++17 Template: DP State with Directional Bests",
    code: "// C++17 Template: DP State with Directional Bests\nclass Solution {\n public:\n  long long maxPoints(vector<vector<int>>& points) {\n    const int rows = points.size();\n    const int cols = points[0].size();\n    vector<long long> dp(cols, 0);\n\n    for (int row = 0; row < rows; ++row) {\n      vector<long long> left_best(cols, 0);\n      vector<long long> right_best(cols, 0);\n      left_best[0] = dp[0];\n      for (int col = 1; col < cols; ++col) {\n        left_best[col] = max(left_best[col - 1] - 1, dp[col]);\n      }\n      right_best[cols - 1] = dp[cols - 1];\n      for (int col = cols - 2; col >= 0; --col) {\n        right_best[col] = max(right_best[col + 1] - 1, dp[col]);\n      }\n\n      vector<long long> next_dp(cols, 0);\n      for (int col = 0; col < cols; ++col) {\n        next_dp[col] = points[row][col] + max(left_best[col], right_best[col]);\n      }\n      dp.swap(next_dp);\n    }\n\n    return *max_element(dp.begin(), dp.end());\n  }\n};",
  },
  dp_transition: {
    summary: "C++17 Template: Interval DP Transition",
    code: "// C++17 Template: Interval DP Transition\nclass Solution {\n public:\n  int minCost(int n, vector<int>& cuts) {\n    cuts.push_back(0);\n    cuts.push_back(n);\n    sort(cuts.begin(), cuts.end());\n\n    const int m = cuts.size();\n    vector<vector<int>> dp(m, vector<int>(m, 0));\n    for (int length = 2; length < m; ++length) {\n      for (int left = 0; left + length < m; ++left) {\n        const int right = left + length;\n        dp[left][right] = numeric_limits<int>::max();\n        for (int mid = left + 1; mid < right; ++mid) {\n          dp[left][right] = min(\n              dp[left][right],\n              dp[left][mid] + dp[mid][right] + cuts[right] - cuts[left]);\n        }\n      }\n    }\n\n    return dp[0][m - 1];\n  }\n};",
  },
  coordinate_compress: {
    summary: "C++17 Template: Coordinate Compression to Ranks",
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
    summary: "C++17 Template: Pairwise Exchange Comparator Sort",
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
    summary: "C++17 Template: Prim Minimum Spanning Tree",
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
    summary: "C++17 Template: DP State Machine (Hold / Cash)",
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
    summary: "C++17 Template: 0/1 Knapsack with Reverse Capacity Loop",
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
    summary: "C++17 Template: Nim XOR Winner Check",
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
    summary: "C++17 Template: Grundy Value via Memoized DFS",
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
    summary: "C++17 Template: Interval DP Two-Player Game",
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
    summary: "C++17 Template: P/N Position Table Construction",
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
    summary: "C++17 Template: Opposite-Direction Two Pointers",
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
    summary: "C++17 Template: 3Sum with Sorted Two Pointers",
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
    summary: "C++17 Template: Backtracking Permutations",
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
    summary: "C++17 Template: Backtracking Subsets",
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
    summary: "C++17 Template: Combination Sum with Pruning",
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
    summary: "C++17 Template: One-Pass Hash Map (Two Sum)",
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
    summary: "C++17 Template: Prefix Sum with Hash Map Counting",
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
    summary: "C++17 Template: Tree DFS Returning a Subtree Fact",
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
    summary: "C++17 Template: Tree Level-Order BFS",
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
    summary: "C++17 Template: Grid Flood Fill (DFS)",
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
    summary: "C++17 Template: Multi-Source Grid BFS",
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
    summary: "C++17 Template: Union-Find with Path Compression",
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
    summary: "C++17 Template: Fenwick Tree (Point Update, Range Sum)",
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
    summary: "C++17 Template: Segment Tree with Lazy Propagation",
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
    summary: "C++17 Template: Topological Sort (Kahn BFS)",
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
    summary: "C++17 Template: Topological Sort / Cycle Detection (DFS)",
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
    summary: "C++17 Template: Merge Overlapping Intervals",
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
    summary: "C++17 Template: KMP Failure Function and Search",
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
    summary: "C++17 Template: Z-Function",
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
    summary: "C++17 Template: Pointer-Based Trie",
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
    summary: "C++17 Template: Binary Trie for XOR Maximization",
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
    summary: "C++17 Template: Two-Heap Running Median",
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
    summary: "C++17 Template: Merge K Sorted Lists with a Heap",
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
    summary: "C++17 Template: Sieve of Eratosthenes",
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
    summary: "C++17 Template: Fast Modular Exponentiation",
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
    summary: "C++17 Template: Merge Sort Inversion Counting",
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
    summary: "C++17 Template: Quickselect for the K-th Element",
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
    name: "Constraint-Guided Sliding Scan",
    complexity: "O(n)",
    whenToUse:
      "Count subarrays whose additive cost stays ≤ a limit, when adding an element only grows the cost so the left edge never moves backward.",
  },
  brute_force_to_prefix: {
    name: "Prefix-State Replacement",
    complexity: "O(n)",
    whenToUse:
      "Replace an O(n) inner recomputation with a running prefix plus a hash map of previously seen states, e.g. shortest subarray with sum ≡ target (mod p).",
  },
  answer_search: {
    name: "Binary Search on the Answer",
    complexity: "O(n log(maxAnswer))",
    whenToUse:
      "The answer is the smallest/largest value passing a monotone feasibility test, and a single greedy pass can check one candidate value.",
  },
  loop_invariant_binary_search: {
    name: "Lower Bound with Loop Invariant",
    complexity: "O(log n)",
    whenToUse:
      "Find the first index of a sorted array satisfying a monotone predicate; keep the half-open invariant `[low, high)` to avoid off-by-one bugs.",
  },
  enumerate_middle: {
    name: "Enumerate Middle with Fenwick Counts",
    complexity: "O(n log n)",
    whenToUse:
      "Count triples/quadruples by fixing the middle element and asking how many valid elements lie to its left and right.",
  },
  subset_enumeration: {
    name: "Submask Enumeration DP",
    complexity: "O(3^n)",
    whenToUse:
      "Partition or cover problems over n ≤ ~18 elements where each mask is split into a submask plus its remaining complement.",
  },
  contribution_mono: {
    name: "Subarray-Min Contribution (Monotonic Stack)",
    complexity: "O(n)",
    whenToUse:
      "Sum a quantity over all subarrays by counting, for each element, how many subarrays it is the min/max of.",
  },
  pair_contribution: {
    name: "Pair Contribution after Sorting",
    complexity: "O(n log n)",
    whenToUse:
      "Sum a value over all pairs (e.g. Σ|a_i − a_j|) by sorting and turning each pair into a prefix-sum contribution.",
  },
  prefix_contribution: {
    name: "Prefix/Suffix Split Scan",
    complexity: "O(n)",
    whenToUse:
      "Count valid split points using a prefix aggregate (max) on the left and a suffix aggregate (min) on the right.",
  },
  longest_window: {
    name: "Longest Valid Window",
    complexity: "O(n)",
    whenToUse:
      "Maximize window length while a violation counter (e.g. zeros flipped) stays within a budget k.",
  },
  shortest_window: {
    name: "Shortest Valid Window",
    complexity: "O(n)",
    whenToUse:
      "Minimize window length once a ≥-threshold condition is satisfied, shrinking from the left while the condition still holds.",
  },
  at_most_k_distinct: {
    name: "At-Most-K Distinct Window",
    complexity: "O(n)",
    whenToUse:
      "Count or measure subarrays whose number of distinct values never exceeds k, using a frequency map of the window.",
  },
  exactly_k_distinct: {
    name: "Exactly-K via At-Most(K) − At-Most(K−1)",
    complexity: "O(n)",
    whenToUse:
      "Turn an exact-count requirement into the difference of two monotone at-most counts when a direct exact window is awkward.",
  },
  bitwise_or_window: {
    name: "Bitwise-OR Window with Bit Counts",
    complexity: "O(n · B)",
    whenToUse:
      "Windows constrained by a bitwise OR ≥ k, where per-bit counters let you support OR after removing the left element.",
  },
  prefix_suffix_counts: {
    name: "Prefix/Suffix Counts around a Pivot",
    complexity: "O(n · Σ)",
    whenToUse:
      "Count patterns like x…y…x by fixing the middle and multiplying matching prefix and suffix character counts.",
  },
  difference_array: {
    name: "1D Difference Array",
    complexity: "O(n + q)",
    whenToUse:
      "Apply many range-add updates, then materialize the final array with a single prefix-sum pass.",
  },
  difference_matrix: {
    name: "2D Difference Array",
    complexity: "O(n^2 + q)",
    whenToUse:
      "Apply many rectangle-add updates on a grid, then reconstruct values with a 2D prefix sum.",
  },
  monotonic_stack: {
    name: "Monotonic Stack Boundaries",
    complexity: "O(n)",
    whenToUse:
      "Find the next/previous greater or smaller element, or the span each element dominates, in one pass.",
  },
  monotonic_deque: {
    name: "Monotonic Deque Window Extremum",
    complexity: "O(n)",
    whenToUse:
      "Sliding-window maximum/minimum where you need the extreme of the current window in amortized O(1).",
  },
  coordinate_compression_fenwick: {
    name: "Coordinate Compression + Fenwick",
    complexity: "O(n log n)",
    whenToUse:
      "Count inversions or smaller-to-the-right over a large or sparse value domain after compressing values to ranks.",
  },
  exchange_greedy: {
    name: "Earliest-Finish Greedy (Exchange Argument)",
    complexity: "O(n log n)",
    whenToUse:
      "Maximum non-overlapping intervals / interval scheduling, proven correct by sorting on end time and an exchange argument.",
  },
  interval_cover_greedy: {
    name: "Stays-Ahead Interval Cover",
    complexity: "O(n log n)",
    whenToUse:
      "Cover [0, target] with the fewest intervals by repeatedly jumping to the farthest right end currently reachable.",
  },
  greedy_builder: {
    name: "Greedy Construction with Feasibility Check",
    complexity: "O(n · Σ)",
    whenToUse:
      "Build the lexicographically smallest answer position by position, committing to a choice only if the remaining slots can still be completed.",
  },
  greedy_lexicographic: {
    name: "Lexicographically Smallest Subsequence with Quota",
    complexity: "O(n)",
    whenToUse:
      "Monotonic-stack greedy that pops larger leading characters while keeping the size-k and per-letter quota constraints feasible.",
  },
  remaining_sum_construction: {
    name: "Remaining-Sum Construction",
    complexity: "O(n)",
    whenToUse:
      "Distribute a target sum greedily from the back so earlier positions stay as small as possible.",
  },
  frequency_construction: {
    name: "Frequency-Based Heap Construction",
    complexity: "O(n log Σ)",
    whenToUse:
      "Rearrange characters so no two adjacent are equal by always placing the highest remaining frequency that differs from the last.",
  },
  mst_kruskal: {
    name: "Kruskal MST (Cut Property)",
    complexity: "O(E log E)",
    whenToUse:
      "Build a minimum spanning tree, or answer connectivity-cost questions, by adding the cheapest edge that joins two components.",
  },
  state_bfs: {
    name: "BFS over Explicit (node, mask) State",
    complexity: "O(2^n · n)",
    whenToUse:
      "Shortest path when the state must remember which nodes have already been visited, not just the current node.",
  },
  bitmask_dp: {
    name: "Assignment Bitmask DP",
    complexity: "O(2^n · n)",
    whenToUse:
      "Optimal one-to-one assignment of n items to n slots where the mask encodes which slots are already used.",
  },
  offline_fenwick: {
    name: "Offline Queries Sorted by Threshold",
    complexity: "O((n + q) log n)",
    whenToUse:
      "Answer many range-count queries gated by a value threshold by sorting queries on the threshold and inserting values as the threshold grows.",
  },
  sweep_events: {
    name: "Event-Sort Sweep",
    complexity: "O(n log n)",
    whenToUse:
      "Maximum concurrent intervals / peak overlap by sweeping +1 and −1 events in coordinate order.",
  },
  sweep_difference: {
    name: "Difference-Event Sweep with Queries",
    complexity: "O((n + q) log(n + q))",
    whenToUse:
      "Answer point queries against many intervals by accumulating a sorted difference map up to each query coordinate.",
  },
  sweep_heap: {
    name: "Heap Sweep for Concurrent Resources",
    complexity: "O(n log n)",
    whenToUse:
      "Minimum meeting rooms / concurrent resources by popping already-finished intervals from a min-heap of end times.",
  },
  sweep_compressed_fenwick: {
    name: "Compressed Sweep with Range Add",
    complexity: "O((n + q) log n)",
    whenToUse:
      "Count how many intervals cover each query point over a large coordinate space, using compression plus a Fenwick range add.",
  },
  dp_state: {
    name: "Rolling DP with Directional Bests",
    complexity: "O(n · m)",
    whenToUse:
      "Grid/sequence DP where each row's transition needs the best value reachable from the left and from the right.",
  },
  dp_transition: {
    name: "Interval DP Transition",
    complexity: "O(n^3)",
    whenToUse:
      "Find the optimal way to combine a contiguous range by trying every split point (merge stones, cut rod, matrix chain).",
  },
  coordinate_compress: {
    name: "Coordinate Compression to Ranks",
    complexity: "O(n log n)",
    whenToUse:
      "Map a large or sparse value domain to dense indices 0..m−1 before indexing a counting array, Fenwick tree, or DP table.",
  },
  exchange_swap_sort: {
    name: "Pairwise Exchange Comparator Sort",
    complexity: "O(n log n)",
    whenToUse:
      "The optimal order is defined by a pairwise 'a before b' test; sort by that comparator and justify it with an adjacent-swap exchange argument.",
  },
  mst_prim: {
    name: "Prim Minimum Spanning Tree",
    complexity: "O(E log V)",
    whenToUse:
      "Grow an MST from a seed node, repeatedly pulling the lightest edge crossing the cut into the tree — handy on dense graphs given as adjacency.",
  },
  dp_state_machine: {
    name: "DP State Machine (Hold / Cash)",
    complexity: "O(n)",
    whenToUse:
      "Each position has a few mutually exclusive states (holding vs. not, locked vs. free); keep one variable per state and read the best terminal state.",
  },
  dp_knapsack: {
    name: "0/1 Knapsack with Reverse Capacity Loop",
    complexity: "O(n · W)",
    whenToUse:
      "Subset-selection DP where each item is used at most once; iterate capacity downward so each item updates each state only once.",
  },
  game_nim_xor: {
    name: "Nim / XOR Winner Check",
    complexity: "O(n)",
    whenToUse:
      "Independent heaps where a move shrinks one heap (classic Nim, or any game that decomposes into a XOR-sum of Grundy values).",
  },
  game_grundy: {
    name: "Grundy Value via Memoized DFS",
    complexity: "O(states · branching)",
    whenToUse:
      "Compute the Grundy number (mex of reachable Grundy values) of a game state; XOR independent components to decide the winner.",
  },
  game_interval_dp: {
    name: "Interval DP Two-Player Game",
    complexity: "O(n^2)",
    whenToUse:
      "Turn-based games on a subarray where each player takes from an end; track the score difference the current player can force.",
  },
  game_pn_table: {
    name: "P/N Position Table",
    complexity: "O(n · branching)",
    whenToUse:
      "Small single-pile games (Bash, Divisor); a state is winning iff some move lands the opponent on a losing (P) state.",
  },
  two_pointers_opposite: {
    name: "Opposite-Direction Two Pointers",
    complexity: "O(n)",
    whenToUse:
      "A sorted array (or symmetric structure) where moving one of two ends in/out is enough to find a pair/triple or check a palindrome.",
  },
  three_sum: {
    name: "3Sum with Sorted Two Pointers",
    complexity: "O(n^2)",
    whenToUse:
      "Fix the smallest element, then collapse the inner pair search to opposite-direction two pointers; skip duplicates to dedupe.",
  },
  backtrack_permute: {
    name: "Backtracking Permutations",
    complexity: "O(n · n!)",
    whenToUse:
      "Enumerate all orderings; track a `used[]` set and undo it after recursing.",
  },
  backtrack_subsets: {
    name: "Backtracking Subsets",
    complexity: "O(n · 2^n)",
    whenToUse:
      "Enumerate all subsets/combinations; a `start` index prevents revisiting earlier elements and avoids duplicate sets.",
  },
  backtrack_combination_sum: {
    name: "Combination Sum with Pruning",
    complexity: "O(answers · target)",
    whenToUse:
      "Choose-with-repetition under a target; sort first so `candidate > remain` prunes the whole tail of the branch.",
  },
  hashmap_two_sum: {
    name: "One-Pass Hash Map (Two Sum)",
    complexity: "O(n)",
    whenToUse:
      "Look for a complement (`target - x`) seen earlier; store value→index as you scan so each element is checked once.",
  },
  prefix_count_hashmap: {
    name: "Prefix Sum with Hash Map Counting",
    complexity: "O(n)",
    whenToUse:
      "Count subarrays with a target sum/property by counting how many earlier prefixes equal `prefix - k`.",
  },
  tree_dfs: {
    name: "Tree DFS Returning a Subtree Fact",
    complexity: "O(n)",
    whenToUse:
      "Each node needs a value computed from its children (height, sum, diameter); return the fact upward and update a global best.",
  },
  tree_bfs_levels: {
    name: "Tree Level-Order BFS",
    complexity: "O(n)",
    whenToUse:
      "You need per-level processing (level order, right-side view, min depth); freeze the queue size to bound one level.",
  },
  grid_dfs: {
    name: "Grid Flood Fill (DFS)",
    complexity: "O(rows · cols)",
    whenToUse:
      "Count or measure connected regions in a grid; mark cells visited in place to avoid a separate visited array.",
  },
  multi_source_bfs: {
    name: "Multi-Source Grid BFS",
    complexity: "O(rows · cols)",
    whenToUse:
      "Shortest time/distance from many sources at once (rotting oranges, nearest 0); seed every source into the queue at level 0.",
  },
  union_find: {
    name: "Union-Find with Path Compression",
    complexity: "O(α(n)) amortized",
    whenToUse:
      "Dynamic connectivity / counting components under incremental unions; path halving + union by rank give near-constant queries.",
  },
  fenwick_basic: {
    name: "Fenwick Tree (Point Update, Range Sum)",
    complexity: "O(log n) per op",
    whenToUse:
      "Maintain prefix sums under point updates; simplest structure when you only need sums (not min/max) over ranges.",
  },
  segment_tree_lazy: {
    name: "Segment Tree with Lazy Propagation",
    complexity: "O(log n) per op",
    whenToUse:
      "Range update AND range query together (range add + range sum); lazy tags defer work until a node is split.",
  },
  topo_kahn: {
    name: "Topological Sort (Kahn BFS)",
    complexity: "O(V + E)",
    whenToUse:
      "Produce an ordering of a DAG (or detect a cycle by a short output); repeatedly emit zero-in-degree nodes.",
  },
  topo_dfs: {
    name: "Topological Sort / Cycle Detection (DFS)",
    complexity: "O(V + E)",
    whenToUse:
      "Detect a directed cycle or get a reverse-postorder topological order with three-color DFS state.",
  },
  merge_intervals: {
    name: "Merge Overlapping Intervals",
    complexity: "O(n log n)",
    whenToUse:
      "Sort by start, then extend the last kept interval whenever the next one overlaps it.",
  },
  kmp: {
    name: "KMP Failure Function and Search",
    complexity: "O(n + m)",
    whenToUse:
      "Substring search or self-overlap problems; the LPS array lets the pattern fall back without rescanning the text.",
  },
  z_function: {
    name: "Z-Function",
    complexity: "O(n)",
    whenToUse:
      "Match a prefix against every suffix in one pass (pattern search via `pattern + '#' + text`, period detection).",
  },
  trie_pointer: {
    name: "Pointer-Based Trie",
    complexity: "O(L) per word",
    whenToUse:
      "Insert/search/startsWith over many strings sharing prefixes; one child pointer per alphabet letter.",
  },
  trie_xor: {
    name: "Binary Trie for XOR Maximization",
    complexity: "O(n · 32)",
    whenToUse:
      "Maximize/minimize XOR against a set; store numbers bit-by-bit and greedily walk to the opposite bit.",
  },
  two_heap_median: {
    name: "Two-Heap Running Median",
    complexity: "O(log n) per add",
    whenToUse:
      "Maintain the median of a stream; a max-heap of the lower half and a min-heap of the upper half kept balanced.",
  },
  merge_k_heap: {
    name: "Merge K Sorted Lists with a Heap",
    complexity: "O(N log k)",
    whenToUse:
      "Merge k sorted sequences; a heap of the current front of each keeps the global minimum at the top.",
  },
  sieve: {
    name: "Sieve of Eratosthenes",
    complexity: "O(n log log n)",
    whenToUse:
      "Precompute all primes (or smallest prime factors) up to n; mark composites starting from i·i.",
  },
  fast_pow: {
    name: "Fast Modular Exponentiation",
    complexity: "O(log exp)",
    whenToUse:
      "Compute base^exp (mod m) for huge exponents; square the base and multiply on each set bit of the exponent.",
  },
  merge_sort_count: {
    name: "Merge Sort Inversion Counting",
    complexity: "O(n log n)",
    whenToUse:
      "Count inversions / range-sum pairs while sorting; when the right element is taken, all remaining left elements form inversions.",
  },
  quickselect: {
    name: "Quickselect for the K-th Element",
    complexity: "O(n) average",
    whenToUse:
      "Find the k-th smallest/largest without fully sorting; partition and recurse into only the side containing the target.",
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
      title: "Make Sum Divisible by P",
    },
  },
  answer_search: {
    lc: {
      id: 1011,
      slug: "capacity-to-ship-packages-within-d-days",
      title: "Capacity To Ship Packages Within D Days",
    },
  },
  contribution_mono: {
    lc: {
      id: 907,
      slug: "sum-of-subarray-minimums",
      title: "Sum of Subarray Minimums",
    },
  },
  longest_window: {
    lc: {
      id: 1004,
      slug: "max-consecutive-ones-iii",
      title: "Max Consecutive Ones III",
    },
  },
  shortest_window: {
    lc: {
      id: 209,
      slug: "minimum-size-subarray-sum",
      title: "Minimum Size Subarray Sum",
    },
  },
  exactly_k_distinct: {
    lc: {
      id: 992,
      slug: "subarrays-with-k-different-integers",
      title: "Subarrays with K Different Integers",
    },
  },
  bitwise_or_window: {
    lc: {
      id: 3097,
      slug: "shortest-subarray-with-or-at-least-k-ii",
      title: "Shortest Subarray With OR at Least K II",
    },
  },
  difference_matrix: {
    lc: {
      id: 2536,
      slug: "increment-submatrices-by-one",
      title: "Increment Submatrices by One",
    },
  },
  monotonic_deque: {
    lc: {
      id: 239,
      slug: "sliding-window-maximum",
      title: "Sliding Window Maximum",
    },
  },
  coordinate_compression_fenwick: {
    lc: {
      id: 315,
      slug: "count-of-smaller-numbers-after-self",
      title: "Count of Smaller Numbers After Self",
    },
  },
  exchange_greedy: {
    lc: {
      id: 435,
      slug: "non-overlapping-intervals",
      title: "Non-overlapping Intervals",
    },
  },
  greedy_lexicographic: {
    lc: {
      id: 2030,
      slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter",
      title: "Smallest K-Length Subsequence With Occurrences of a Letter",
    },
  },
  remaining_sum_construction: {
    lc: {
      id: 1663,
      slug: "smallest-string-with-a-given-numeric-value",
      title: "Smallest String With A Given Numeric Value",
    },
  },
  frequency_construction: {
    lc: { id: 767, slug: "reorganize-string", title: "Reorganize String" },
  },
  state_bfs: {
    lc: {
      id: 847,
      slug: "shortest-path-visiting-all-nodes",
      title: "Shortest Path Visiting All Nodes",
    },
  },
  bitmask_dp: {
    lc: {
      id: 1879,
      slug: "minimum-xor-sum-of-two-arrays",
      title: "Minimum XOR Sum of Two Arrays",
    },
  },
  sweep_difference: {
    lc: {
      id: 2251,
      slug: "number-of-flowers-in-full-bloom",
      title: "Number of Flowers in Full Bloom",
    },
  },
  sweep_heap: {
    lc: { id: 253, slug: "meeting-rooms-ii", title: "Meeting Rooms II" },
  },
  dp_state: {
    lc: {
      id: 1937,
      slug: "maximum-number-of-points-with-cost",
      title: "Maximum Number of Points with Cost",
    },
  },
  dp_transition: {
    lc: {
      id: 1547,
      slug: "minimum-cost-to-cut-a-stick",
      title: "Minimum Cost to Cut a Stick",
    },
  },
  exchange_swap_sort: {
    lc: { id: 179, slug: "largest-number", title: "Largest Number" },
  },
  dp_state_machine: {
    lc: {
      id: 714,
      slug: "best-time-to-buy-and-sell-stock-with-transaction-fee",
      title: "Best Time to Buy and Sell Stock with Transaction Fee",
    },
  },
  game_interval_dp: {
    lc: { id: 486, slug: "predict-the-winner", title: "Predict the Winner" },
  },
  two_pointers_opposite: {
    lc: {
      id: 167,
      slug: "two-sum-ii-input-array-is-sorted",
      title: "Two Sum II - Input Array Is Sorted",
    },
  },
  three_sum: { lc: { id: 15, slug: "3sum", title: "3Sum" } },
  backtrack_permute: {
    lc: { id: 46, slug: "permutations", title: "Permutations" },
  },
  backtrack_subsets: { lc: { id: 78, slug: "subsets", title: "Subsets" } },
  backtrack_combination_sum: {
    lc: { id: 39, slug: "combination-sum", title: "Combination Sum" },
  },
  hashmap_two_sum: { lc: { id: 1, slug: "two-sum", title: "Two Sum" } },
  prefix_count_hashmap: {
    lc: {
      id: 560,
      slug: "subarray-sum-equals-k",
      title: "Subarray Sum Equals K",
    },
  },
  tree_dfs: {
    lc: {
      id: 543,
      slug: "diameter-of-binary-tree",
      title: "Diameter of Binary Tree",
    },
  },
  tree_bfs_levels: {
    lc: {
      id: 102,
      slug: "binary-tree-level-order-traversal",
      title: "Binary Tree Level Order Traversal",
    },
  },
  grid_dfs: {
    lc: { id: 200, slug: "number-of-islands", title: "Number of Islands" },
  },
  multi_source_bfs: {
    lc: { id: 994, slug: "rotting-oranges", title: "Rotting Oranges" },
  },
  topo_kahn: {
    lc: { id: 210, slug: "course-schedule-ii", title: "Course Schedule II" },
  },
  topo_dfs: {
    lc: { id: 207, slug: "course-schedule", title: "Course Schedule" },
  },
  merge_intervals: {
    lc: { id: 56, slug: "merge-intervals", title: "Merge Intervals" },
  },
  kmp: {
    lc: {
      id: 28,
      slug: "find-the-index-of-the-first-occurrence-in-a-string",
      title: "Find the Index of the First Occurrence in a String",
    },
  },
  trie_pointer: {
    lc: {
      id: 208,
      slug: "implement-trie-prefix-tree",
      title: "Implement Trie (Prefix Tree)",
    },
  },
  trie_xor: {
    lc: {
      id: 421,
      slug: "maximum-xor-of-two-numbers-in-an-array",
      title: "Maximum XOR of Two Numbers in an Array",
    },
  },
  two_heap_median: {
    lc: {
      id: 295,
      slug: "find-median-from-data-stream",
      title: "Find Median from Data Stream",
    },
  },
  merge_k_heap: {
    lc: { id: 23, slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists" },
  },
  sieve: { lc: { id: 204, slug: "count-primes", title: "Count Primes" } },
  quickselect: {
    lc: {
      id: 215,
      slug: "kth-largest-element-in-an-array",
      title: "Kth Largest Element in an Array",
    },
  },
  greedy_builder: {
    pattern:
      "Greedy lexicographic construction: try the smallest candidate at each position and accept it only if a feasibility check proves the remaining positions can still complete a valid answer.",
  },
  constraint_scan: {
    pattern:
      "Counts subarrays whose running additive cost stays within a limit by sliding a window whose left edge only moves forward (the 'at most' counting trick).",
  },
  loop_invariant_binary_search: {
    pattern:
      "The lower_bound idiom: half-open binary search over [low, high) returning the first index where a monotone predicate becomes true.",
  },
  enumerate_middle: {
    pattern:
      "Counts increasing triples by fixing the middle element and using two Fenwick trees for 'smaller to the left' and 'greater to the right' (the technique behind LeetCode 2179 / 2552).",
  },
  subset_enumeration: {
    pattern:
      "Submask-sum DP: for each mask, iterate its submasks via `submask = (submask - 1) & mask` (O(3^n)) to combine a chosen submask with its complement.",
  },
  pair_contribution: {
    pattern:
      "Sums a quantity over all pairs after sorting: each element's contribution is `i*nums[i] - prefixSum` (the sorted-pairs trick behind LeetCode 1685).",
  },
  prefix_contribution: {
    pattern:
      "Prefix-max / suffix-min split scan: precompute the running max from the left and min from the right, then evaluate every cut point in O(1) (e.g. LeetCode 915).",
  },
  at_most_k_distinct: {
    pattern:
      "Sliding-window helper counting subarrays with at most k distinct values; subtracting two such counts yields exactly-k (e.g. LeetCode 340 / 992).",
  },
  prefix_suffix_counts: {
    pattern:
      "Counts x..x patterns by fixing the middle index and multiplying matching prefix and suffix character counts (technique behind LeetCode 1930).",
  },
  difference_array: {
    pattern:
      "Difference array: apply many range-add updates as +d at l and -d at r+1, then take a prefix sum to materialize the final array (e.g. LeetCode 1109).",
  },
  monotonic_stack: {
    pattern:
      "Finds the next greater element for each position using a decreasing monotonic stack (basis for LeetCode 496 / 503 / 739).",
  },
  interval_cover_greedy: {
    pattern:
      "Minimum intervals to cover [0, target]: repeatedly jump to the farthest right end reachable from the current coverage (e.g. LeetCode 1024 / 45).",
  },
  mst_kruskal: {
    pattern:
      "Kruskal's MST: sort edges by weight and add each that joins two components via union-find (the cut property; e.g. LeetCode 1584 / 1135).",
  },
  offline_fenwick: {
    pattern:
      "Offline range-count queries: sort values and queries by a threshold, insert values into a Fenwick tree as the threshold grows, answer each as a prefix range.",
  },
  sweep_events: {
    pattern:
      "Event-sort sweep for peak concurrency: emit +1/-1 events at interval ends, sort by coordinate, and track the running maximum (e.g. LeetCode 253).",
  },
  sweep_compressed_fenwick: {
    pattern:
      "Coordinate-compressed sweep: turn each interval into +1/-1 range-add events on a Fenwick tree over compressed coordinates, then read coverage at query points.",
  },
  coordinate_compress: {
    pattern:
      "Coordinate compression: map arbitrary values to dense ranks 0..m-1 via sort + unique + lower_bound so they can index counting arrays or Fenwick trees.",
  },
  mst_prim: {
    pattern:
      "Prim's MST: grow the tree from a seed node, pulling the lightest edge crossing the cut from a min-heap (the cut property from the node side; e.g. LeetCode 1584).",
  },
  dp_knapsack: {
    pattern:
      "0/1 knapsack: each item used at most once; iterating capacity downward ensures each item updates each capacity state only once (e.g. LeetCode 416 / 474).",
  },
  game_nim_xor: {
    pattern:
      "Multi-pile Nim winner test: the player to move wins iff the XOR of all pile sizes is nonzero (Sprague-Grundy applied to Nim).",
  },
  game_grundy: {
    pattern:
      "Sprague-Grundy values: g(state) = mex of reachable states' Grundy values (memoized); XOR independent components to decide the overall winner.",
  },
  game_pn_table: {
    pattern:
      "P/N position table for a small single-pile take-away game (Bash / Divisor games): a state is winning iff some move reaches a losing (P) state.",
  },
  z_function: {
    pattern:
      "Z-function: z[i] is the length of the longest substring from i matching a prefix of the string, built via the rolling Z-box in O(n).",
  },
  union_find: {
    pattern:
      "Disjoint Set Union with path compression + union by rank: near-O(alpha(n)) connectivity and component counting under incremental unions (e.g. LeetCode 547 / 684).",
  },
  segment_tree_lazy: {
    pattern:
      "Segment tree with lazy propagation for range-add + range-sum; lazy tags defer updates to children until a node is split (generalizes LeetCode 307 to range updates).",
  },
  fast_pow: {
    pattern:
      "Binary exponentiation: compute base^exp (mod m) in O(log exp) by squaring the base and multiplying on each set bit of the exponent.",
  },
  fenwick_basic: {
    pattern:
      "Fenwick (binary indexed) tree: point updates and prefix/range sums in O(log n) using lowbit jumps (e.g. LeetCode 307).",
  },
  merge_sort_count: {
    pattern:
      "Counts inversions while merge-sorting: when a right-half element is taken, all remaining left-half elements form inversions with it (basis for LeetCode 315 / 493).",
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

/**
 * TASK 6 — Enumeration Viewpoint Taxonomy. A reference table plus one collapsed
 * worked example per newly-added viewpoint. Appended to section 4 (Core Idea) of
 * the Enumeration Strategy topic. All representative problems are real LeetCode
 * problems; the worked-example snippets are C++17 and compile under `-std=c++17`.
 */
const ENUMERATION_TAXONOMY: string = [
  "### Enumeration Viewpoint Taxonomy",
  "",
  "Choosing the *viewpoint* — the object you iterate over — usually matters more than the data structure. The same problem can be easy or hopeless depending on what you fix and what you let vary. This table names the common viewpoints, the invariant each one relies on, and a representative problem. The five viewpoints in **bold** are expanded with a worked example below.",
  "",
  "| Viewpoint | What you enumerate | Invariant maintained | Representative problem | Practice Problems |",
  "|---|---|---|---|---|",
  '| Enumerate the owner / contributor | each element as the one "responsible" for a subarray | every subarray is counted by exactly one owner | 907. Sum of Subarray Minimums | [828. Count Unique Characters of All Substrings of a Given String](https://leetcode.cn/problems/count-unique-characters-of-all-substrings-of-a-given-string/) (2034) [Advanced]<br>[1856. Maximum Subarray Min-Product](https://leetcode.cn/problems/maximum-subarray-min-product/) (2051) [Advanced]<br>[2818. Apply Operations to Maximize Score](https://leetcode.cn/problems/apply-operations-to-maximize-score/) (2397) [Challenge]<br>[2281. Sum of Total Strength of Wizards](https://leetcode.cn/problems/sum-of-total-strength-of-wizards/) (2621) [Challenge] |',
  "| Enumerate the right endpoint | fix the right end, count valid left ends | the window/state is valid for the current right end | 2302. Count Subarrays With Score Less Than K | [713. Subarray Product Less Than K](https://leetcode.cn/problems/subarray-product-less-than-k/) [Core]<br>[2799. Count Complete Subarrays in an Array](https://leetcode.cn/problems/count-complete-subarrays-in-an-array/) (1398) [Core]<br>[3325. Count Substrings With K-Frequency Characters I](https://leetcode.cn/problems/count-substrings-with-k-frequency-characters-i/) (1455) [Core]<br>[1248. Count Number of Nice Subarrays](https://leetcode.cn/problems/count-number-of-nice-subarrays/) (1624) [Core]<br>[1358. Number of Substrings Containing All Three Characters](https://leetcode.cn/problems/number-of-substrings-containing-all-three-characters/) (1646) [Core]<br>[2762. Continuous Subarrays](https://leetcode.cn/problems/continuous-subarrays/) (1940) [Core]<br>[992. Subarrays with K Different Integers](https://leetcode.cn/problems/subarrays-with-k-different-integers/) (2210) [Advanced] |",
  "| Enumerate the pivot / middle | fix the center element | left-side and right-side counts are independent | 1395. Count Number of Teams | [1534. Count Good Triplets](https://leetcode.cn/problems/count-good-triplets/) (1279) [Core]<br>[1685. Sum of Absolute Differences in a Sorted Array](https://leetcode.cn/problems/sum-of-absolute-differences-in-a-sorted-array/) (1496) [Core]<br>[2222. Number of Ways to Select Buildings](https://leetcode.cn/problems/number-of-ways-to-select-buildings/) (1657) [Core]<br>[2179. Count Good Triplets in an Array](https://leetcode.cn/problems/count-good-triplets-in-an-array/) (2272) [Advanced]<br>[2552. Count Increasing Quadruplets](https://leetcode.cn/problems/count-increasing-quadruplets/) (2433) [Challenge] |",
  "| Enumerate the contribution unit | each pair/triple's added value | sum over units equals the sum over the whole | 2104. Sum of Subarray Ranges | [1814. Count Nice Pairs in an Array](https://leetcode.cn/problems/count-nice-pairs-in-an-array/) (1738) [Core]<br>[2615. Sum of Distances](https://leetcode.cn/problems/sum-of-distances/) (1793) [Core]<br>[2681. Power of Heroes](https://leetcode.cn/problems/power-of-heroes/) (2060) [Advanced]<br>[891. Sum of Subsequence Widths](https://leetcode.cn/problems/sum-of-subsequence-widths/) (2183) [Advanced]<br>[2916. Subarrays Distinct Element Sum of Squares II](https://leetcode.cn/problems/subarrays-distinct-element-sum-of-squares-ii/) (2816) [Challenge] |",
  "| **Enumerate the value domain** (差值、餘數、GCD) | each candidate value, remainder, or gcd | the answer reduces to one cheap check per value | 1819. Number of Different Subsequence GCDs | [523. Continuous Subarray Sum](https://leetcode.cn/problems/continuous-subarray-sum/) [Core]<br>[2748. Number of Beautiful Pairs](https://leetcode.cn/problems/number-of-beautiful-pairs/) (1301) [Core]<br>[2470. Number of Subarrays With LCM Equal to K](https://leetcode.cn/problems/number-of-subarrays-with-lcm-equal-to-k/) (1560) [Core]<br>[2447. Number of Subarrays With GCD Equal to K](https://leetcode.cn/problems/number-of-subarrays-with-gcd-equal-to-k/) (1603) [Core]<br>[974. Subarray Sums Divisible by K](https://leetcode.cn/problems/subarray-sums-divisible-by-k/) (1676) [Core]<br>[2183. Count Array Pairs Divisible by K](https://leetcode.cn/problems/count-array-pairs-divisible-by-k/) (2246) [Advanced]<br>[952. Largest Component Size by Common Factor](https://leetcode.cn/problems/largest-component-size-by-common-factor/) (2272) [Advanced] |",
  "| **Enumerate the cut point** (two-cut / three-segment) | each split position | prefix-left and suffix-right are computed independently | 689. Maximum Sum of 3 Non-Overlapping Subarrays | [410. Split Array Largest Sum](https://leetcode.cn/problems/split-array-largest-sum/) [Core]<br>[915. Partition Array into Disjoint Intervals](https://leetcode.cn/problems/partition-array-into-disjoint-intervals/) (1501) [Core]<br>[1031. Maximum Sum of Two Non-Overlapping Subarrays](https://leetcode.cn/problems/maximum-sum-of-two-non-overlapping-subarrays/) (1680) [Core]<br>[1043. Partition Array for Maximum Sum](https://leetcode.cn/problems/partition-array-for-maximum-sum/) (1916) [Core]<br>[813. Largest Sum of Averages](https://leetcode.cn/problems/largest-sum-of-averages/) (1937) [Core] |",
  "| **Enumerate the smaller side** (small-to-large merging) | always iterate the smaller set when merging | total work stays O(n log n) because each element moves O(log n) times | 2003. Smallest Missing Genetic Value in Each Subtree | [2421. Number of Good Paths](https://leetcode.cn/problems/number-of-good-paths/) (2445) [Challenge] |",
  "| **Enumerate bit by bit** (greedy from the high bit) | each bit from high to low | the prefix of already-fixed bits is optimal | 421. Maximum XOR of Two Numbers in an Array | [2429. Minimize XOR](https://leetcode.cn/problems/minimize-xor/) (1532) [Core]<br>[2935. Maximum Strong Pair XOR II](https://leetcode.cn/problems/maximum-strong-pair-xor-ii/) (2349) [Challenge]<br>[1707. Maximum XOR With an Element From Array](https://leetcode.cn/problems/maximum-xor-with-an-element-from-array/) (2359) [Challenge] |",
  "| **Enumerate the trigger / event** (event-driven) | each moment the state changes | events are processed in time order and reacted to once | 1834. Single-Threaded CPU | [731. My Calendar II](https://leetcode.cn/problems/my-calendar-ii/) [Core]<br>[1094. Car Pooling](https://leetcode.cn/problems/car-pooling/) (1441) [Core]<br>[759. Employee Free Time](https://leetcode.cn/problems/employee-free-time/) (1710) [Core]<br>[2402. Meeting Rooms III](https://leetcode.cn/problems/meeting-rooms-iii/) (2093) [Advanced]<br>[1851. Minimum Interval to Include Each Query](https://leetcode.cn/problems/minimum-interval-to-include-each-query/) (2286) [Advanced] |",
  "",
  taxonomyExample(
    "Enumerate the value domain (GCD)",
    "For **1819. Number of Different Subsequence GCDs** the values are bounded (~2·10⁵) but the number of subsequences is exponential. Flip the viewpoint: instead of enumerating subsequences, enumerate every candidate gcd `g`. Some subsequence has gcd exactly `g` iff the present multiples of `g` together reduce to `g`. Scanning the multiples `g, 2g, 3g, …` for every `g` is the harmonic series, so the whole search is `O(maxVal log maxVal)`.",
    `// Enumerate the GCD value, then verify with its multiples
int countDifferentGcds(vector<int>& nums, int maxVal) {
  vector<bool> present(maxVal + 1, false);
  for (int x : nums) present[x] = true;
  int answer = 0;
  for (int g = 1; g <= maxVal; ++g) {
    int current = 0;
    for (int multiple = g; multiple <= maxVal; multiple += g) {
      if (present[multiple]) current = gcd(current, multiple);
      if (current == g) { ++answer; break; }
    }
  }
  return answer;
}`,
  ),
  "",
  taxonomyExample(
    "Enumerate the cut point (three segments)",
    "When the answer splits the array into independent pieces, enumerate the **boundary**, not the pieces. For two non-overlapping parts you fix one cut and combine the best subarray ending on the left with the best starting on the right; both sides are precomputed in linear time. The same idea extends to **689. Maximum Sum of 3 Non-Overlapping Subarrays** with two cut points.",
    `// Enumerate the cut: best subarray on the left + best on the right
int maxTwoNonOverlap(vector<int>& a) {
  int n = a.size();
  vector<int> leftBest(n), rightBest(n);
  int run = 0;
  for (int i = 0; i < n; ++i) {
    run = max(a[i], run + a[i]);
    leftBest[i] = i ? max(leftBest[i - 1], run) : run;
  }
  run = 0;
  for (int i = n - 1; i >= 0; --i) {
    run = max(a[i], run + a[i]);
    rightBest[i] = i + 1 < n ? max(rightBest[i + 1], run) : run;
  }
  int answer = INT_MIN;
  for (int cut = 0; cut + 1 < n; ++cut)
    answer = max(answer, leftBest[cut] + rightBest[cut + 1]);
  return answer;
}`,
  ),
  "",
  taxonomyExample(
    "Enumerate the smaller side (small-to-large)",
    "When you repeatedly merge sets (e.g. subtree multisets in **2003. Smallest Missing Genetic Value in Each Subtree**), always iterate the *smaller* set into the larger one. Each element is copied only when the set it lives in at least doubles, so it is copied `O(log n)` times and the total merge cost is `O(n log n)` even though a naïve merge looks quadratic.",
    `// Small-to-large: always merge the smaller set into the larger
void mergeInto(unordered_set<int>& large, unordered_set<int>& small) {
  if (large.size() < small.size()) swap(large, small);
  for (int x : small) large.insert(x);
  small.clear();
}`,
  ),
  "",
  taxonomyExample(
    "Enumerate bit by bit (high-bit greedy)",
    "For XOR-maximization (**421. Maximum XOR of Two Numbers in an Array**) enumerate bits from the most significant down. Greedily assume the next bit of the answer can be 1, then check — using the prefixes already fixed — whether two numbers can realize it. Once a bit is locked it is never revisited, because a higher bit always dominates all lower bits.",
    `// Enumerate bits high to low, greedily turning each on if achievable
int findMaximumXOR(vector<int>& nums) {
  int answer = 0, mask = 0;
  for (int bit = 31; bit >= 0; --bit) {
    mask |= (1 << bit);
    unordered_set<int> prefixes;
    for (int x : nums) prefixes.insert(x & mask);
    int candidate = answer | (1 << bit);
    for (int prefix : prefixes) {
      if (prefixes.count(candidate ^ prefix)) {
        answer = candidate;
        break;
      }
    }
  }
  return answer;
}`,
  ),
  "",
  taxonomyExample(
    "Enumerate the trigger / event",
    "Unlike a sweep line (which sorts *all* coordinates up front), event enumeration advances time only to the next moment something becomes available and reacts once. In **1834. Single-Threaded CPU** you sort tasks by ready time, jump the clock to the next ready task when idle, and always run the cheapest currently-available task from a heap.",
    `// Enumerate events in time order; a heap holds currently-available choices
int firstAvailableWinner(vector<int>& ready, vector<int>& cost) {
  int n = ready.size();
  vector<int> order(n);
  iota(order.begin(), order.end(), 0);
  sort(order.begin(), order.end(),
       [&](int a, int b) { return ready[a] < ready[b]; });
  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> available;
  long long time = 0;
  int i = 0, done = -1;
  while (done < 0 && (i < n || !available.empty())) {
    if (available.empty() && i < n) {
      time = max<long long>(time, ready[order[i]]);
    }
    while (i < n && ready[order[i]] <= time) {
      available.push({cost[order[i]], order[i]});
      ++i;
    }
    auto [c, idx] = available.top();
    available.pop();
    time += c;
    done = idx;
  }
  return done;
}`,
  ),
].join("\n");

/**
 * TASK 7 — Game Theory layered deep dive. Appended to section 4 (Core Idea) of
 * the Game Theory topic: the Nim XOR correctness walkthrough, a Sprague-Grundy
 * worked example, and the interval-DP worked examples (Predict the Winner, Stone
 * Game VII). All collapsible blocks use the unified `collapsible()` primitive.
 */
const GAME_THEORY_DEEP_DIVE: string = [
  "### Layered Deep Dive",
  "",
  "**Layer 1 — Combinatorial game basics.** An *impartial* game is one where both players have the same moves available from any position (Nim, not chess). Under the *normal-play convention* the player who cannot move loses. Classify each position as a **P-position** (Previous player wins → the player to move loses) or an **N-position** (Next player to move wins). The rule that generates the whole table: a position is N if *some* move leads to a P-position; it is P if *every* move leads to an N-position; terminal positions are P.",
  "",
  "| State (one pile, take 1–3) | Moves to | Class |",
  "|---:|---|:--|",
  "| 0 | — (terminal) | P |",
  "| 1 | 0 (P) | N |",
  "| 2 | 0,1 | N |",
  "| 3 | 0,1,2 | N |",
  "| 4 | 1,2,3 (all N) | P |",
  "| 5 | 4 (P) | N |",
  "",
  "The Bash game (take 1..k from one pile) has period `k + 1`: position `s` is a P-position iff `s % (k + 1) == 0`. Above, `k = 3` gives P-positions at multiples of 4.",
  "",
  collapsible(
    "Worked Example — Why XOR decides Nim",
    [
      "Claim: with several piles, the position is a P-position (loss for the player to move) **iff** the XOR of all pile sizes is 0. Three facts prove it:",
      "",
      "1. **Terminal.** All piles empty → XOR `= 0`, and it is a P-position. ✔",
      "2. **From XOR ≠ 0 you can reach XOR = 0.** Let `x = a₁ ⊕ … ⊕ aₖ ≠ 0` and let `b` be its highest set bit. Some pile `aᵢ` has that bit set. Then `aᵢ ⊕ x < aᵢ` (the high bit turns off), so you may legally shrink pile `i` to `aᵢ ⊕ x`; the new XOR is `x ⊕ aᵢ ⊕ (aᵢ ⊕ x) = 0`. So every N-position has a move to a P-position.",
      "3. **From XOR = 0 every move gives XOR ≠ 0.** Changing one pile from `aᵢ` to `aᵢ' ≠ aᵢ` changes the XOR by `aᵢ ⊕ aᵢ' ≠ 0`, so a zero XOR cannot stay zero. Every move out of a P-position lands on an N-position.",
      "",
      "Together: zero-XOR positions are exactly the ones from which you can only hand the opponent a winning position — they are the losses. Example: piles `[3, 4, 5]` have XOR `3 ⊕ 4 ⊕ 5 = 2 ≠ 0`, so the first player wins; the winning move shrinks pile `5` to `5 ⊕ 2 = 7`? No — `7 > 5` is illegal, so instead pick the pile whose high bit (value 2) is set: pile `3 → 3 ⊕ 2 = 1`, leaving `[1, 4, 5]` with XOR `0`.",
    ].join("\n"),
  ),
  "",
  "**Layer 2 — Sprague-Grundy.** Any impartial game position has a **Grundy value** `g(s) = mex{ g(t) : s → t }`, where `mex` is the smallest non-negative integer not in the set. A position is a P-position iff its Grundy value is 0 (so single-pile Nim has `g(s) = s`). The Sprague-Grundy theorem says the Grundy value of a *sum* of independent games is the **XOR** of their Grundy values — intuitively because each component behaves exactly like a Nim pile of size `g`, and Nim adds by XOR.",
  "",
  collapsible(
    "Worked Example — Grundy values on a tiny game",
    [
      "Game: a single counter on integer `s ≥ 0`; a move subtracts 1 or 2; reaching 0 and being unable to move loses (normal play). Compute Grundy values bottom-up with `mex`:",
      "",
      "| s | reachable g-values | g(s) = mex |",
      "|---:|---|---:|",
      "| 0 | {} | 0 |",
      "| 1 | {g(0)=0} | 1 |",
      "| 2 | {g(0)=0, g(1)=1} | 2 |",
      "| 3 | {g(1)=1, g(2)=2} | 0 |",
      "| 4 | {g(2)=2, g(3)=0} | 1 |",
      "",
      "The pattern is `g(s) = s % 3`, so P-positions (g = 0) are the multiples of 3. For two independent such counters at `s = 4` and `s = 5`, XOR the Grundy values: `g(4) ⊕ g(5) = 1 ⊕ 2 = 3 ≠ 0`, so the player to move wins. Use the `Grundy Value via Memoized DFS` template to compute `g` for arbitrary move sets.",
    ].join("\n"),
  ),
  "",
  "**Layer 3 — DP game theory.** When the game is played on a sequence and scores accumulate, there is no Grundy shortcut; instead define `dp[i][j]` = the best *score difference* (current player minus opponent) achievable on subarray `[i, j]`. The current player picks an end and then *inherits the negation* of the opponent's optimal difference on what remains.",
  "",
  collapsible(
    "Worked Example — Predict the Winner (LC 486)",
    [
      "`dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1])`. Take `nums = [1, 5, 233, 7]`.",
      "",
      "Base: `dp[i][i] = nums[i]` → `dp = [1, 5, 233, 7]` on the diagonal.",
      "",
      "Length 2: `dp[0][1] = max(1-5, 5-1) = 4`; `dp[1][2] = max(5-233, 233-5) = 228`; `dp[2][3] = max(233-7, 7-233) = 226`.",
      "",
      "Length 3: `dp[0][2] = max(1-228, 233-4) = 229`; `dp[1][3] = max(5-226, 7-228) = -221`.",
      "",
      "Length 4: `dp[0][3] = max(1 - dp[1][3], 7 - dp[0][2]) = max(1-(-221), 7-229) = 222`.",
      "",
      "`dp[0][3] = 222 ≥ 0`, so player 1 wins. This is exactly the `Interval DP Two-Player Game` template.",
    ].join("\n"),
  ),
  "",
  collapsible(
    "Worked Example — Stone Game VII (LC 1690)",
    [
      "Removing a stone scores the **sum of the remaining** stones, so prefix sums give each move's gain in O(1). With `range(i,j) = prefix[j+1] - prefix[i]`:",
      "",
      "`dp[i][j] = max( range(i+1, j) - dp[i+1][j],  range(i, j-1) - dp[i][j-1] )`, base `dp[i][i] = 0`.",
      "",
      "Each player maximizes their own running difference; the answer is `dp[0][n-1]`.",
      "",
      "```cpp",
      "// Stone Game VII — interval DP on the score difference",
      "int stoneGameVII(vector<int>& stones) {",
      "  int n = stones.size();",
      "  vector<int> prefix(n + 1, 0);",
      "  for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + stones[i];",
      "  vector<vector<int>> dp(n, vector<int>(n, 0));",
      "  for (int len = 2; len <= n; ++len)",
      "    for (int i = 0; i + len - 1 < n; ++i) {",
      "      int j = i + len - 1;",
      "      int takeLeft = (prefix[j + 1] - prefix[i + 1]) - dp[i + 1][j];",
      "      int takeRight = (prefix[j] - prefix[i]) - dp[i][j - 1];",
      "      dp[i][j] = max(takeLeft, takeRight);",
      "    }",
      "  return dp[0][n - 1];",
      "}",
      "```",
    ].join("\n"),
  ),
].join("\n");

const TOPIC_DEFINITIONS: PatternTopicDefinition[] = [
  {
    slug: "constraint-driven-thinking",
    title: "Constraint-Driven Thinking",
    group: "Problem-Solving Mindset",
    icon: "Gauge",
    tagline:
      "Infer viable algorithms from n, q, value ranges, and operation counts before choosing a pattern.",
    concept: [
      "Think of the constraints as a speed limit posted before you choose a route. A judge that allows about 10^8 simple operations is the speed limit; `n`, `q`, and the value range tell you how far you must travel. Before writing a single line you check whether your intended route — brute force, sorting, a window, a tree — can cover that distance without a ticket (a Time Limit Exceeded).",
      "Constraint-driven thinking is the habit of converting input limits into an algorithm budget, so you reject doomed approaches on paper instead of after a failed submission.",
      "A useful rule of thumb: `n ≤ 20` hints at exponential `O(2^n)`, `n ≤ 500` at `O(n^3)`, `n ≤ 5000` at `O(n^2)`, `n ≤ 10^5` at `O(n log n)`, and `n ≥ 10^6` at `O(n)` or `O(n)` with a tiny constant.",
      "The goal is to shrink the set of candidate techniques before coding, not to find the cleverest one.",
    ],
    motivation: [
      "Write the literal brute force first and count its operations. Example: `nums` has `n = 10^5` elements and you want the shortest subarray with sum ≥ `target`. The naive solution tries every pair `(left, right)` and re-sums the slice: about `n^2/2 = 5·10^9` additions — roughly 50× over budget.",
      "Now locate the repeated work: each new `right` recomputes a sum that overlaps almost entirely with the previous one. That overlap is the waste signal.",
      "Replace the recomputation with maintained state — a running window sum that adds `nums[right]` and drops `nums[left]` — turning `O(n^2)` into `O(n)`. The ownership rule (each `right` looks for its best `left`) is unchanged; only how the sum is obtained changed.",
      "When `n` is tiny but states repeat (e.g. `n ≤ 18`), do the opposite: keep the exponential search but compress repeated states into a bitmask so the exponential factor is over states, not over raw choices.",
    ],
    whenUse: [
      "If you see `n ≤ 20`, think subset/bitmask enumeration or meet-in-the-middle.",
      "If you see `n` up to `10^5`–`10^6` with simple per-element work, think a single maintained summary (window, prefix, heap), not nested loops.",
      "If you see many queries `q` over static data, think precomputation, offline sorting, or a Fenwick/segment tree instead of answering each query from scratch.",
      "If you see a bounded value range (e.g. values ≤ `10^5`), think counting arrays, buckets, or bit tricks before reaching for a map.",
      "If you see 'minimum/maximum X such that a check passes', think binary search on the answer with a greedy feasibility check.",
    ],
    coreIdea: [
      "Estimate the operation budget from the limits, then pick the weakest (simplest) pattern that fits it.",
      "Decide whether values are small enough for counting arrays or must be coordinate-compressed.",
      "Name the single object you will enumerate or commit to (an index, an endpoint, a value, a cut).",
      "Name the state that summarizes all earlier work so each step is `O(1)` or `O(log n)`.",
      "Update the answer exactly when the invariant says the maintained state is valid.",
      "Write the boundary policy before coding: inclusive vs. exclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "**Budget-Fit Invariant.** At every design step the proposed algorithm must fit both the input size and the value/query dimensions. In plain terms: if you cannot point to why each of `n`, `q`, and the value range stays inside the operation budget, you have a sketch, not a solution — and a sketch that overshoots even one dimension will TLE no matter how elegant the rest is.",
    variants: [
      "Small n: subset or backtracking with pruning.",
      "Large n, few queries: one scan or sorting.",
      "Large q: offline processing, Fenwick/segment tree, or precomputation.",
      "Bounded value domain: counting, buckets, or bit tricks.",
    ],
    templateKeys: ["constraint_scan", "answer_search"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Choosing a pattern from the topic tag instead of the budget. Counter-example: a problem tagged 'DP' with `n ≤ 18` is almost always bitmask DP, not `O(n^2)` interval DP — reading the tag instead of `n` sends you down the wrong recurrence.",
      "Forgetting a second expensive dimension. Counter-example: an `O(n log n)` solution that runs for each of `q = 10^5` queries is `O(q · n log n) ≈ 10^{11}` — well over budget even though the per-query part 'looks fast'.",
      "Using `int` where the answer overflows. Counter-example: with `n = 10^5` equal values, a sum of subarray counts reaches `~5·10^9`, which silently wraps a 32-bit `int`; use `long long`.",
      "Skipping the extreme inputs the budget implies: `n = 0/1`, all-duplicate values, equal boundaries, and the maximum-size case that actually triggers the TLE.",
    ],
    practice: [
      {
        id: 1590,
        title: "Make Sum Divisible by P",
        slug: "make-sum-divisible-by-p",
        rating: 2039,
        difficulty: "Medium",
        subPattern: "prefix modulo",
        why: "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1838,
        title: "Frequency of the Most Frequent Element",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "sort + window",
        why: "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2092,
        title: "Find all People with Secret",
        slug: "find-all-people-with-secret",
        rating: 2004,
        difficulty: "Hard",
        subPattern: "time-grouped graph",
        why: "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "What is the operation budget implied by `n`, `q`, and the value range, and which target complexity does it point to?",
      "Which single dimension in my brute force is too expensive, and what state could make it `O(1)` or `O(log n)`?",
      "Are the values small enough for a counting array/bucket, or must I coordinate-compress?",
      "If there are queries, can I answer them offline (sorted) instead of independently from scratch?",
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
    title: "Brute Force to Optimization",
    group: "Problem-Solving Mindset",
    icon: "TrendingUp",
    tagline:
      "Turn a correct slow solution into maintained state, precomputation, or a different enumeration order.",
    concept: [
      "Optimizing is like noticing you re-buy the same groceries every day instead of keeping a stocked pantry. Brute force makes the trip from scratch each time; optimization stocks a pantry — a prefix sum, a hash map, a sorted order — so the next trip just reads what is already on the shelf. Crucially, you eat the same meals (the answer is identical); only the shopping changed.",
      "So brute force is a diagnostic tool, not an embarrassment: it shows you exactly which computation is repeated.",
      'The useful question is not "what clever trick applies?" but "what value did I recompute that I could have stored?"',
    ],
    motivation: [
      "Write the brute force over all objects — all subarrays, pairs, cuts, paths, masks, or query answers — and run it on a tiny example. For `nums = [2, 1, 3]`, asking 'sum of every subarray' recomputes `sum[0..2]` from scratch after already knowing `sum[0..1]`.",
      "Mark that repeated inner calculation. Here, every subarray sum overlaps a previously computed prefix.",
      "Stock the pantry: a prefix-sum array makes any range sum `prefix[r+1] - prefix[l]` an `O(1)` lookup, so the whole task drops from `O(n^2)` recomputation to `O(n)`.",
      "Keep the brute force nearby as a mental oracle: it is the reference you stress-test the optimized version against on random small inputs.",
    ],
    whenUse: [
      "If you see a correct `O(n^2)`/`O(n^3)` enumeration that only fails on time, think 'what repeated fact can I cache?'",
      "If you see a range sum/count/min/max recomputed for overlapping objects, think prefix sums, a sparse table, or a Fenwick tree.",
      "If you see a search for a previously seen prefix-state, think hash map keyed by that state.",
      "If you see a pairwise condition like `a[i] + a[j] ≤ k`, think sort-then-two-pointers to make the second index move monotonically.",
      "If you see 'sum over all subarrays/pairs', think contribution counting — flip from enumerating objects to enumerating each element's contribution.",
    ],
    coreIdea: [
      "Write the brute force in words, then cross out the computation that repeats across iterations.",
      "Keep the same answer decomposition (the same subquestions) — only change how each piece is retrieved.",
      "Name the object you enumerate (subarray end, pair, cut, mask).",
      "Name the stored state (prefix array, hash map, sorted order, data structure) that answers each subquestion fast.",
      "Update the answer exactly when the maintained state is valid for the current object.",
      "Write the boundary policy before coding: inclusive vs. exclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "**Same-Subquestions Invariant.** The optimized method answers exactly the same subquestions as brute force; only how a repeated fact is retrieved changes. This guarantees correctness for free: if every subquestion's answer matches the brute force and the combination rule is unchanged, the final result must match — so an optimization that changes the answer has secretly changed a subquestion, not just its retrieval.",
    variants: [
      "Prefix sums replace repeated range sums.",
      "Hash maps replace repeated prefix-state searches.",
      "Sorting turns pair conditions into monotone movement.",
      "Contribution counting flips object enumeration into contributor enumeration.",
    ],
    templateKeys: ["brute_force_to_prefix", "pair_contribution"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Off-by-one in prefix-sum indexing. Counter-example: defining `prefix[i] = nums[0]+…+nums[i]` then writing a range sum as `prefix[r] - prefix[l]` drops `nums[l]`; the half-open form `prefix[i] = nums[0]+…+nums[i-1]` with `prefix[r+1]-prefix[l]` avoids it.",
      "Optimizing a wrong brute force. Counter-example: if the naive solution mishandles empty subarrays, the fast version inherits the bug — stress-test against the oracle on random small inputs first.",
      "Overflow after speeding up. Counter-example: contribution counting over `n = 10^5` equal elements produces sums `~10^{10}`; keep accumulators in `long long`.",
      "Not testing `n = 0/1`, all-duplicate values, equal boundaries, and the maximum-size case that the optimization was meant to survive.",
    ],
    practice: [
      {
        id: 2262,
        title: "Total Appeal of A String",
        slug: "total-appeal-of-a-string",
        rating: 2033,
        difficulty: "Hard",
        subPattern: "last-position contribution",
        why: "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1838,
        title: "Frequency of the Most Frequent Element",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "sort + window",
        why: "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2025,
        title: "Maximum Number of Ways to Partition An Array",
        slug: "maximum-number-of-ways-to-partition-an-array",
        rating: 2218,
        difficulty: "Hard",
        subPattern: "prefix/suffix partition",
        why: "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I write the brute force in one sentence and point at the exact computation that repeats across iterations?",
      "Is the repeated work a range query (→ prefix/Fenwick), a prefix-state lookup (→ hash map), or a pair condition (→ sort + two pointers)?",
      "Does my optimized version answer the same subquestions as the brute force, or did I quietly change the decomposition?",
      "Does the brute force still agree with the fast version on random small inputs (the oracle test)?",
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
    title: "Invariant Thinking",
    group: "Problem-Solving Mindset",
    icon: "Crosshair",
    tagline:
      "Make every scan, pointer movement, stack update, and greedy choice preserve a named truth.",
    concept: [
      "An invariant is like the running balance in a checkbook: a single sentence that is true after every transaction. You don't re-add the whole history on each line — you trust the balance, apply one change, and keep it correct. In code, the loop body is one transaction, and the invariant is the balance you promise stays accurate before and after it.",
      "That promise is the bridge between implementation and proof: if the invariant holds when the loop ends, the answer follows directly from it.",
      "Most painful bugs in two pointers, binary search, monotonic stacks, and greedy code are invariant bugs — the balance silently went wrong on one transaction.",
    ],
    motivation: [
      "Brute force checks each candidate independently, so it needs no invariant — it just recomputes everything. Example: 'longest subarray with at most `k` zeros' over `nums = [1,0,1,0,1]`, `k = 1` could re-scan every `[left, right]`.",
      "The fast version instead keeps a window and a count of zeros inside it, and slides `right` forward. That maintained state only means something if you can state precisely what it represents.",
      "The invariant — 'the window `[left, right]` contains at most `k` zeros' — tells you exactly when to shrink (`left++` while zeros > k) and when it is legal to record the answer (`right - left + 1`). Without it, you cannot say whether to update the answer before or after shrinking.",
    ],
    whenUse: [
      "If you see a loop whose state stands in for many candidates at once, think 'what sentence is always true about this state?'",
      "If you are unsure whether to update the answer before or after shrinking/popping/relaxing, think: write the invariant and let it decide.",
      "If you see a monotonic stack or deque, think of the invariant that the structure stays sorted and what each pop means.",
      "If you see binary search, think of the invariant that one side is always false and the other always true.",
      "If you see a greedy that commits choices, think of the stays-ahead invariant: the partial solution is never worse than any alternative so far.",
    ],
    coreIdea: [
      "Write the invariant as one sentence before you write the loop.",
      "Initialize the state so the invariant is true before the first iteration.",
      "After every state change, identify the exact line that restores the invariant.",
      "Read the answer only at points where the invariant guarantees the state is valid.",
      "Name the object being enumerated and the state that summarizes all earlier work.",
      "Write the boundary policy before coding: inclusive vs. exclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "**Faithful-Summary Invariant.** The state is always a faithful summary of exactly the candidates it claims to represent — no candidate is silently added, lost, or counted twice. Why this guarantees correctness: if the summary is exact at every step and you only read the answer when it is exact, then the final read is exact by induction. Every classic bug (double-counting an element, reading the answer mid-update, forgetting to evict) is precisely a moment when this sentence was false.",
    variants: [
      "Window always valid.",
      "Window shrinks while valid.",
      "Stack remains monotone.",
      "Binary search keeps false/true partitions.",
      "Greedy frontier is never worse than alternatives.",
    ],
    templateKeys: ["constraint_scan", "loop_invariant_binary_search"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Reading the answer mid-update. Counter-example: in 'at most `k` zeros', recording `right - left + 1` before shrinking when zeros has already exceeded `k` counts an invalid window — restore the invariant (shrink) first, then read.",
      "Evicting the wrong element. Counter-example: a monotonic-stack 'next greater' that pops on `>=` instead of `>` breaks ties and double-counts equal elements; the invariant tells you which comparison keeps the stack faithful.",
      "Off-by-one that breaks the binary-search partition. Counter-example: `low = mid` (instead of `mid + 1`) when `mid` is known false can loop forever — the false/true invariant pins the correct update.",
      "Not testing `n = 0/1`, all-equal values, and the all-invalid case where the window must collapse to empty.",
    ],
    practice: [
      {
        id: 1838,
        title: "Frequency of the Most Frequent Element",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "sort + window",
        why: "Requires a maintained condition after every pointer, stack, or greedy update.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "Count Subarrays with Score Less Than K",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "positive score window",
        why: "Requires a maintained condition after every pointer, stack, or greedy update.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2398,
        title: "Maximum Number of Robots Within Budget",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "window + monotonic deque",
        why: "Requires a maintained condition after every pointer, stack, or greedy update.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state, in one sentence, what is always true of my window/stack/frontier before and after each iteration?",
      "At which exact line is the invariant temporarily broken, and which line restores it?",
      "Do I read the answer only when the invariant guarantees the state is valid?",
      "On ties and equal boundaries, does my comparison keep the state faithful (no element added, lost, or double-counted)?",
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
    title: "Feasibility Check",
    group: "Problem-Solving Mindset",
    icon: "PencilRuler",
    tagline:
      "Separate optimization from yes/no validation so binary search, greedy construction, and pruning become possible.",
    concept: [
      "Answering 'is this feasible?' is far easier than answering 'what is the best?' — like checking whether your luggage fits a carry-on sizer versus computing the single largest bag that would fit. Once you can answer the yes/no question cheaply, you can binary-search the best size instead of constructing it directly. A feasibility check is exactly that sizer: given a candidate, it says can-finish or cannot, nothing more.",
      "It is most powerful when feasibility is monotone: if value `x` works, every easier value also works, so the boundary between 'no' and 'yes' can be found by binary search.",
      "The same yes/no oracle also guides greedy construction: reject any choice that would make the rest impossible to complete.",
    ],
    motivation: [
      "Brute force constructs and compares every candidate. Example: 'split `nums` into `m` parts minimizing the largest part-sum' with `nums = [7,2,5,10,8]`, `m = 2` — enumerating all splits is exponential.",
      "Flip it into a yes/no question: 'can we split into ≤ `m` parts each with sum ≤ `cap`?' For `cap = 18` the greedy pass `[7,2,5] | [10,8]` uses 2 parts → feasible; for `cap = 14` you need 3 parts → infeasible.",
      "Because feasibility is monotone in `cap` (a larger cap is never harder), binary-search the smallest feasible `cap` — each check is a single `O(n)` greedy pass, so the whole search is `O(n log(sum))`.",
      "The hard part is proving the predicate is exact and monotone in the chosen direction; get that wrong and the search converges to the wrong boundary.",
    ],
    whenUse: [
      "If you see 'minimize the maximum' or 'maximize the minimum', think binary search on the answer with a feasibility check.",
      "If you see 'kth smallest/largest value' over an implicit set, think binary search on the value with a 'count ≤ x' check.",
      "If you see 'can we finish / is it possible', think the check itself is the whole answer.",
      "If you see 'lexicographically smallest valid answer', think greedy construction where the check rejects dead-end prefixes.",
      "If you see that validating a candidate is far cheaper than building the optimum, think feasibility + search.",
    ],
    coreIdea: [
      "Define precisely what a candidate `x` means (a capacity, a speed, a count, a prefix).",
      "Prove the monotonicity direction: does `feasible(x)` imply `feasible(x+1)` or `feasible(x-1)`?",
      "Write the predicate so it is exact and free of search side effects (no shared mutable state between calls).",
      "Pick the search: binary search over a value range, or one-position-at-a-time greedy construction.",
      "Read the answer at the monotonic boundary the search converges to.",
      "Write the boundary policy before coding: inclusive vs. exclusive ends, the initial `[low, high]` range, and empty/degenerate inputs.",
    ],
    invariant:
      "**Exact-Predicate Invariant.** The predicate accepts exactly the candidates that have at least one valid completion — no false positives, no false negatives. Why this is non-negotiable: binary search assumes a single clean false→true boundary, and greedy construction trusts the check to prune only truly-dead prefixes. A predicate that is even slightly approximate creates a second boundary or prunes a live branch, and the search silently returns a wrong-but-plausible answer.",
    variants: [
      "Binary search on answer.",
      "Trial filling by lexicographic order.",
      "Greedy with remaining capacity.",
      "DP/backtracking used only as the feasibility oracle.",
    ],
    templateKeys: ["answer_search", "greedy_builder"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Searching in the wrong monotonic direction. Counter-example: for 'minimize the maximum', `feasible(cap)` must be true for large `cap` and false for small; if you wrote the check so it's true for small `cap`, binary search converges to the opposite end.",
      "A predicate with hidden side effects. Counter-example: a `can(x)` that mutates a shared array makes the second call see leftover state, so the same `x` returns different answers across iterations — keep each check pure.",
      "Wrong initial bounds. Counter-example: `low = 0` for a Koko-style speed makes `feasible(0)` divide by zero or loop forever; start `low = 1` when zero is meaningless.",
      "Integer overflow in the bound or the sum. Counter-example: `high = sum(nums)` with `n = 10^5` large values overflows `int`; use `long long` for the range and the accumulator.",
    ],
    practice: [
      {
        id: 875,
        title: "Koko Eating Bananas",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "minimum feasible speed",
        why: "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "Capacity to Ship Packages Within D Days",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "minimum feasible capacity",
        why: "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1552,
        title: "Magnetic Force Between Two Balls",
        slug: "magnetic-force-between-two-balls",
        rating: 1920,
        difficulty: "Medium",
        subPattern: "maximize minimum distance",
        why: "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I rephrase the optimization as a yes/no question about a single candidate value?",
      "Is feasibility monotone — does making the candidate easier never turn a 'yes' into a 'no'?",
      "Is my predicate exact (accepts a candidate iff a valid completion exists) and free of cross-call side effects?",
      "Are my initial `[low, high]` bounds wide enough to contain the answer and safe from divide-by-zero / overflow?",
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
    title: "State Design",
    group: "Problem-Solving Mindset",
    icon: "Layers",
    tagline:
      "Choose the smallest state that contains all information needed for future decisions.",
    concept: [
      "Designing a state is like packing for a trip with a strict weight limit: you bring exactly what the rest of the journey needs and leave behind everything you can recreate or no longer need. The state is your packed bag — a node, a DP cell, a memo key — and the transition is the next leg of the trip. Pack too little and you get stuck (the state is insufficient); pack too much and the bag (the state space) is too heavy to carry.",
      "A good state is therefore *sufficient* for every future transition yet *minimal* enough to keep the number of states tractable.",
      "This is the core skill behind graph search with extra conditions, DP, memoization, and bitmask problems — choosing what to remember is most of the battle.",
    ],
    motivation: [
      "Brute force carries the entire history of choices. Example: 'shortest path visiting all nodes' over a 4-node graph — remembering the full path you took explodes combinatorially.",
      "Ask which parts of the history actually affect the future. Here, only your current node and the *set* of nodes already visited matter; the order you visited them in does not.",
      "Encode just those facts as the state `(node, visitedMask)`. Two walks that end at the same node having visited the same set are interchangeable, so BFS over `n · 2^n` states finds the answer where path enumeration could not.",
      "Test the interchange claim explicitly: if two histories share a state but have different futures, the state is missing a fact and must be enlarged.",
    ],
    whenUse: [
      "If you see the same position reachable with different resources/masks/parity/cooldowns, think 'add that dimension to the state'.",
      "If you see that a plain `visited[node]` or `dp[i]` loses information, think a richer key like `(node, mask)` or `(i, lastChoice)`.",
      "If you see 'visit all / collect all' with small `n` (≤ ~18), think a bitmask of what is collected.",
      "If you see cooldowns or alternating turns, think adding a small phase/parity field to the state.",
      "If you see a DP that needs the previous decision, think folding that decision into the index.",
    ],
    coreIdea: [
      "List every fact the next transition reads.",
      "Delete facts that are derivable from the others (order, totals you can recompute).",
      "Estimate the resulting number of states and confirm it fits the budget before coding.",
      "Choose an encoding (tuple, bitmask, packed integer) and a memo/visited structure for it.",
      "Update the answer only at states the invariant certifies as complete (e.g. full mask reached).",
      "Write the boundary policy before coding: the start state(s), the accepting state, and unreachable/degenerate cases.",
    ],
    invariant:
      "**Interchangeability Invariant.** Two partial histories that map to the same state have the same set of possible future completions (up to the value already accumulated). Why this makes memoization correct: if futures depend only on the state, then solving each state once and reusing the result loses nothing. The instant two same-state histories have different futures, caching one and reusing it for the other returns a wrong answer — the cure is always to add the missing fact to the state.",
    variants: [
      "Graph node plus mask/cost/resource.",
      "DP index plus count/last choice.",
      "Memoized recursion with sorted remaining multiset.",
      "Bitmask assignment and subset partitioning.",
    ],
    templateKeys: ["state_bfs", "bitmask_dp"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "An insufficient state. Counter-example: using `visited[node]` instead of `visited[node][mask]` for 'visit all nodes' marks a node done after one mask and blocks reaching it with a different visited-set — losing the optimal path.",
      "A bloated state. Counter-example: storing the full visited *order* instead of a set multiplies the state count by `n!` and turns a feasible `n · 2^n` search into an intractable one.",
      "Forgetting to dedup states. Counter-example: pushing `(node, mask)` into a BFS queue without a `dist`/`seen` check revisits the same state exponentially; mark a state the first time it is dequeued.",
      "Overflow or width bugs in the mask. Counter-example: `1 << n` with `n = 31` in a 32-bit `int` overflows; use `1u << n` or a 64-bit type and size arrays as `1 << n`.",
    ],
    practice: [
      {
        id: 847,
        title: "Shortest Path Visiting all Nodes",
        slug: "shortest-path-visiting-all-nodes",
        rating: 2201,
        difficulty: "Hard",
        subPattern: "BFS over state mask",
        why: "Rewards encoding enough state and no irrelevant history.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1601,
        title: "Maximum Number of Achievable Transfer Requests",
        slug: "maximum-number-of-achievable-transfer-requests",
        rating: 2119,
        difficulty: "Hard",
        subPattern: "subset state balance",
        why: "Rewards encoding enough state and no irrelevant history.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1723,
        title: "Find Minimum Time to Finish all Jobs",
        slug: "find-minimum-time-to-finish-all-jobs",
        rating: 2284,
        difficulty: "Hard",
        subPattern: "assignment state",
        why: "Rewards encoding enough state and no irrelevant history.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "What is the minimal set of facts the next transition reads — and can I drop anything derivable from them?",
      "Do two histories with the same state truly have the same future, or am I missing a resource/mask/parity field?",
      "How many states are there, and does that count fit the operation budget?",
      "What are my start state, accepting state, and how do I dedup states so each is processed once?",
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
    title: "Boundary and Edge Case Thinking",
    group: "Problem-Solving Mindset",
    icon: "PanelsTopLeft",
    tagline:
      "Control inclusive/exclusive ranges, sentinels, duplicates, and empty structures before they become bugs.",
    concept: [
      "Boundaries are the fence posts of an algorithm, and off-by-one bugs are the classic 'fence-post error': to fence a 10-metre run with posts every metre you need 11 posts, not 10. Whenever you compress a problem into intervals, pointers, or events, you are counting fence posts — and mixing 'closed' `[l, r]` with 'half-open' `[l, r)` is exactly miscounting them.",
      "So boundary thinking is the habit of fixing interval semantics and degenerate cases *before* writing the loop, not patching them after.",
      "It matters most precisely where code is densest — difference arrays, sweep lines, binary search, sliding windows — because a few lines stand in for many cases at once.",
    ],
    motivation: [
      "Brute force loops over explicit objects, so boundaries are visible. Example: counting integers in `[2, 5]` by listing `2,3,4,5` obviously gives `5 - 2 + 1 = 4`.",
      "Optimized patterns replace those objects with events, ranks, or pointers, so the same boundary is now implicit. A difference array adds `+1` at `l` and `-1` at `r + 1` — forget the `+1` on `r + 1` and the last element silently drops out.",
      "Pin the convention and translate every update and query into it consistently; a closed range `[l, r]` becomes the half-open event pair `[l, r + 1)`.",
      "Keep a tiny worked example (a length-1 range, an empty range) as a check that the compressed representation still equals the explicit one.",
    ],
    whenUse: [
      "If you see intervals/ranges, think 'closed or half-open?' and commit to one before coding.",
      "If you see 'first/last position' or duplicates, think about whether your binary search returns the leftmost or rightmost match.",
      "If you see a difference array or sweep, think 'where exactly does the effect end — at `r` or `r + 1`?'",
      "If you see an empty or single-element answer is possible, think about the sentinel that represents it (`-1`, `n`, `n + 1`).",
      "If you see a monotonic stack, think which side uses strict `<` and which uses non-strict `<=` to handle ties.",
    ],
    coreIdea: [
      "Choose one interval convention — closed `[l, r]` or half-open `[l, r)` — for the whole solution.",
      "Translate every update, query, and pointer move into that single convention.",
      "Decide the sentinels up front: empty answer, not-found, and out-of-range markers.",
      "Hand-run the minimum cases (size 0 and size 1) and the maximum case before trusting the code.",
      "Read the answer only where the boundary semantics guarantee the represented range is real.",
      "Re-derive any `+1`/`-1` from the chosen convention rather than guessing until tests pass.",
    ],
    invariant:
      "**One-Boundary Invariant.** Every represented event, pointer, or index corresponds to exactly one real boundary in the original problem — never zero, never two. Why this kills off-by-one bugs: if each compressed marker maps to a unique real fence post, the count of markers equals the count of real boundaries, so range lengths and inclusions come out exact. Every off-by-one is a marker that mapped to the wrong post or to none.",
    variants: [
      "Inclusive interval converted to end + 1.",
      "Binary search over [low, high).",
      "Monotonic stack uses one strict and one non-strict side.",
      "Empty answer represented by sentinel n + 1 or -1.",
    ],
    templateKeys: ["difference_array", "loop_invariant_binary_search"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Difference-array end off-by-one. Counter-example: to add `+1` to `[l, r]` you must do `diff[r + 1] -= 1`; writing `diff[r] -= 1` drops the contribution at index `r`.",
      "Binary search returning the wrong side on ties. Counter-example: searching for `target` in `[1, 2, 2, 2, 3]`, a lower-bound vs. upper-bound mix-up returns index 1 instead of 4 (or vice versa) for 'last occurrence'.",
      "Half-open vs. closed mismatch in window length. Counter-example: a window `[left, right]` has length `right - left + 1`, but `[left, right)` has length `right - left`; using the wrong one over-/under-counts by one every iteration.",
      "Not exercising the degenerate inputs the convention hides: empty array, single element, `l == r`, and the whole array as one range.",
    ],
    practice: [
      {
        id: 2444,
        title: "Count Subarrays with Fixed Bounds",
        slug: "count-subarrays-with-fixed-bounds",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "fixed bounds window",
        why: "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1574,
        title: "Shortest Subarray to Be Removed to Make Array Sorted",
        slug: "shortest-subarray-to-be-removed-to-make-array-sorted",
        rating: 1932,
        difficulty: "Medium",
        subPattern: "prefix/suffix splice",
        why: "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2516,
        title: "Take K of Each Character from Left and Right",
        slug: "take-k-of-each-character-from-left-and-right",
        rating: 1948,
        difficulty: "Medium",
        subPattern: "outside-inside window",
        why: "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Have I committed to closed `[l, r]` or half-open `[l, r)` for the entire solution?",
      "For each `+1`/`-1` or pointer move, can I name the exact real boundary it represents?",
      "Does my binary search return the leftmost or rightmost match on duplicates, and is that what the problem wants?",
      "Have I hand-checked size 0, size 1, and the full-range case against the explicit definition?",
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
    title: "Proof Techniques",
    group: "Problem-Solving Mindset",
    icon: "GitCompare",
    tagline:
      "Use invariants, exchange arguments, induction, and cut arguments to justify why a pattern works.",
    concept: [
      "A correctness proof is the receipt that lets you skip work without worrying. Brute force pays full price — it inspects every candidate — so it never needs a receipt. An optimized algorithm skips candidates, and the proof is the receipt showing each skipped one was already covered, dominated, or impossible. Without the receipt, a fast solution that 'looks right' is just an untested guess.",
      "Choosing a proof technique is pattern recognition for correctness, mirroring the algorithm's shape: greedy → exchange or stays-ahead, loops → invariant, DP → induction over state order, MST → cut property.",
      "A two-line proof up front is cheaper than discovering on a hidden test that your local trick skipped the optimal answer.",
    ],
    motivation: [
      "Brute force is correct by construction: it checks every candidate, so nothing can be missed. Example: 'max non-overlapping intervals' could test all subsets.",
      "An optimized solution skips candidates — the greedy keeps only the interval with the earliest finish time — so it owes a reason the skipped subsets cannot beat it.",
      "The exchange argument supplies that reason: take any optimal solution; if it doesn't pick the earliest-finishing interval, swap that interval in — it ends no later, frees at least as much room, and keeps the count. So a solution containing the greedy choice is at least as good, and by induction the greedy is optimal.",
      "In general the proof names the equivalence, dominance, or monotonicity that makes skipping safe.",
    ],
    whenUse: [
      "If you can explain *what* the code does but not *why it cannot miss the answer*, think: pick a proof shape.",
      "If you see a greedy local choice, think exchange argument (swap toward the greedy choice) or stays-ahead (greedy is never behind).",
      "If you see a loop maintaining state, think loop invariant.",
      "If you see a DP, think induction: assume smaller states are correct, show the transition preserves it.",
      "If you see spanning trees or 'cheapest connecting edge', think the cut property.",
    ],
    coreIdea: [
      "Match the algorithm's shape to a proof shape (greedy/loop/DP/cut).",
      "State the claim in one sentence before writing implementation details.",
      "Identify the exact decision the proof must justify (the skipped candidates).",
      "Apply the invariant or induction hypothesis precisely at the line where that decision is made.",
      "Conclude by reading the answer only where the proof guarantees optimality/completeness.",
      "Sanity-check the proof against a small adversarial input that targets the skipped cases.",
    ],
    invariant:
      "**Safe-Skip Invariant.** Every candidate the algorithm skips is dominated by one it keeps, already represented by maintained state, or impossible under a maintained invariant. Why this is the whole game: brute force is trivially correct, so the optimized algorithm matches it iff nothing it discards could have been the unique best. If you can place every skipped candidate into one of those three buckets, the optimum is provably still reachable; a counter-example to the proof is exactly a skipped candidate that fits none of the buckets.",
    variants: [
      "Loop invariant.",
      "Exchange argument.",
      "Greedy stays ahead.",
      "DP induction.",
      "Cut property.",
      "Contradiction via first differing position.",
    ],
    templateKeys: ["exchange_greedy", "loop_invariant_binary_search"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Assuming a greedy is correct without an exchange argument. Counter-example: for 'max non-overlapping intervals', sorting by *start* time and picking greedily fails on `[[1,10],[2,3],[4,5]]` (picks 1, gets 1 interval; the optimum picks `[2,3],[4,5]` for 2) — sorting by *finish* time is what the exchange argument actually justifies.",
      "Proving the wrong direction of the claim. Counter-example: showing 'greedy ≤ optimal' is vacuous; you must show 'greedy ≥ optimal' (or equals) to establish optimality.",
      "Confusing 'works on examples' with a proof. Counter-example: a stays-ahead claim that holds on the samples but not after the first differing position is a guess, not a proof.",
      "Ignoring the degenerate cases the proof quietly assumes: empty input, a single candidate, and all-equal keys where ties decide correctness.",
    ],
    practice: [
      {
        id: 1024,
        title: "Video Stitching",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "interval cover exchange",
        why: "Needs a correctness argument, not only an implementation trick.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "Minimum Number of Taps to Open to Water A Garden",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "minimum interval cover",
        why: "Needs a correctness argument, not only an implementation trick.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2366,
        title: "Minimum Replacements to Sort the Array",
        slug: "minimum-replacements-to-sort-the-array",
        rating: 2060,
        difficulty: "Hard",
        subPattern: "reverse greedy invariant",
        why: "Needs a correctness argument, not only an implementation trick.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Which candidates does my algorithm skip, and into which bucket — dominated, represented, or impossible — does each fall?",
      "Does the algorithm's shape (greedy/loop/DP/cut) point me to a matching proof shape?",
      "For my greedy, can I actually perform the swap an exchange argument requires without making the solution worse?",
      "Can I construct a small adversarial input aimed at the skipped cases, and does the proof still hold on it?",
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
    title: "Enumeration Strategy",
    group: "Enumeration and Counting",
    icon: "List",
    tagline:
      "Pick the right object to enumerate: endpoint, pivot, value, mask, edge, event, or answer.",
    concept: [
      "Enumeration strategy is choosing which dimension remains explicit and which dimensions become maintained state.",
      "The same problem can be impossible when enumerating pairs but easy when enumerating the middle, right endpoint, or contribution owner.",
      "Competitive solutions often come from changing the enumerated object, not from adding a new data structure.",
    ],
    motivation: [
      "Brute force enumerates all candidate tuples or all subarrays.",
      "Optimization fixes one object and asks what information from the left/right/past/future is enough to count the rest.",
      "The best enumeration makes each candidate charged once.",
    ],
    whenUse: [
      "The statement asks for pairs, triplets, subsequences, subarrays, paths, or all valid constructions.",
      "One dimension can be fixed so the rest becomes prefix/suffix, frequency, or data-structure state.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Try endpoint, pivot, value, and contribution owner as possible anchors.",
      "Compute how many partners each anchor has.",
      "Avoid symmetric double counting by assigning ownership.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Each valid answer has one canonical owner in the enumeration order; the algorithm counts it when and only when that owner is processed.",
    variants: [
      "Fix right, maintain left.",
      "Enumerate pivot or middle.",
      "Enumerate smaller side of meet-in-the-middle.",
      "Enumerate masks/submasks.",
      "Enumerate sorted value thresholds.",
    ],
    templateKeys: ["enumerate_middle", "subset_enumeration"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1761,
        title: "Minimum Degree of A Connected Trio in A Graph",
        slug: "minimum-degree-of-a-connected-trio-in-a-graph",
        rating: 2005,
        difficulty: "Hard",
        subPattern: "enumerate trio",
        why: "Trains choosing the one object to enumerate so the rest can be maintained.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1601,
        title: "Maximum Number of Achievable Transfer Requests",
        slug: "maximum-number-of-achievable-transfer-requests",
        rating: 2119,
        difficulty: "Hard",
        subPattern: "subset state balance",
        why: "Trains choosing the one object to enumerate so the rest can be maintained.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2444,
        title: "Count Subarrays with Fixed Bounds",
        slug: "count-subarrays-with-fixed-bounds",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "fixed bounds window",
        why: "Trains choosing the one object to enumerate so the rest can be maintained.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1534,
        title: "Count Good Triplets",
        slug: "count-good-triplets",
        rating: 1279,
        difficulty: "Easy",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 713,
        title: "Subarray Product Less Than K",
        slug: "subarray-product-less-than-k",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 2748,
        title: "Number of Beautiful Pairs",
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
        title: "Count Number of Teams",
        slug: "count-number-of-teams",
        rating: 1344,
        difficulty: "Medium",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 2799,
        title: "Count Complete Subarrays in an Array",
        slug: "count-complete-subarrays-in-an-array",
        rating: 1398,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1094,
        title: "Car Pooling",
        slug: "car-pooling",
        rating: 1441,
        difficulty: "Medium",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 9,
        tier: "Core Practice",
      },
      {
        id: 3325,
        title: "Count Substrings With K-Frequency Characters I",
        slug: "count-substrings-with-k-frequency-characters-i",
        rating: 1455,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 10,
        tier: "Core Practice",
      },
      {
        id: 1685,
        title: "Sum of Absolute Differences in a Sorted Array",
        slug: "sum-of-absolute-differences-in-a-sorted-array",
        rating: 1496,
        difficulty: "Medium",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 11,
        tier: "Core Practice",
      },
      {
        id: 523,
        title: "Continuous Subarray Sum",
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
        title: "My Calendar II",
        slug: "my-calendar-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 13,
        tier: "Core Practice",
      },
      {
        id: 915,
        title: "Partition Array into Disjoint Intervals",
        slug: "partition-array-into-disjoint-intervals",
        rating: 1501,
        difficulty: "Medium",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 14,
        tier: "Core Practice",
      },
      {
        id: 2104,
        title: "Sum of Subarray Ranges",
        slug: "sum-of-subarray-ranges",
        rating: 1504,
        difficulty: "Medium",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 15,
        tier: "Core Practice",
      },
      {
        id: 2429,
        title: "Minimize XOR",
        slug: "minimize-xor",
        rating: 1532,
        difficulty: "Medium",
        subPattern: "enumerate bit by bit (high bit greedy)",
        why: "Exercises the enumerate bit by bit (high bit greedy) enumeration viewpoint from the taxonomy.",
        order: 16,
        tier: "Core Practice",
      },
      {
        id: 2470,
        title: "Number of Subarrays With LCM Equal to K",
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
        title: "Number of Subarrays With GCD Equal to K",
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
        title: "Count Number of Nice Subarrays",
        slug: "count-number-of-nice-subarrays",
        rating: 1624,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 19,
        tier: "Core Practice",
      },
      {
        id: 1358,
        title: "Number of Substrings Containing All Three Characters",
        slug: "number-of-substrings-containing-all-three-characters",
        rating: 1646,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 20,
        tier: "Core Practice",
      },
      {
        id: 2222,
        title: "Number of Ways to Select Buildings",
        slug: "number-of-ways-to-select-buildings",
        rating: 1657,
        difficulty: "Medium",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 21,
        tier: "Core Practice",
      },
      {
        id: 974,
        title: "Subarray Sums Divisible by K",
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
        title: "Maximum Sum of Two Non-Overlapping Subarrays",
        slug: "maximum-sum-of-two-non-overlapping-subarrays",
        rating: 1680,
        difficulty: "Medium",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 23,
        tier: "Core Practice",
      },
      {
        id: 759,
        title: "Employee Free Time",
        slug: "employee-free-time",
        rating: 1710,
        difficulty: "Hard",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 24,
        tier: "Core Practice",
      },
      {
        id: 1814,
        title: "Count Nice Pairs in an Array",
        slug: "count-nice-pairs-in-an-array",
        rating: 1738,
        difficulty: "Medium",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 25,
        tier: "Core Practice",
      },
      {
        id: 2615,
        title: "Sum of Distances",
        slug: "sum-of-distances",
        rating: 1793,
        difficulty: "Medium",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 26,
        tier: "Core Practice",
      },
      {
        id: 1834,
        title: "Single-Threaded CPU",
        slug: "single-threaded-cpu",
        rating: 1798,
        difficulty: "Medium",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 27,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "Count Subarrays With Score Less Than K",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 28,
        tier: "Core Practice",
      },
      {
        id: 421,
        title: "Maximum XOR of Two Numbers in an Array",
        slug: "maximum-xor-of-two-numbers-in-an-array",
        rating: 1900,
        difficulty: "Medium",
        subPattern: "enumerate bit by bit (high bit greedy)",
        why: "Exercises the enumerate bit by bit (high bit greedy) enumeration viewpoint from the taxonomy.",
        order: 29,
        tier: "Core Practice",
      },
      {
        id: 689,
        title: "Maximum Sum of 3 Non-Overlapping Subarrays",
        slug: "maximum-sum-of-3-non-overlapping-subarrays",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 30,
        tier: "Core Practice",
      },
      {
        id: 1043,
        title: "Partition Array for Maximum Sum",
        slug: "partition-array-for-maximum-sum",
        rating: 1916,
        difficulty: "Medium",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 31,
        tier: "Core Practice",
      },
      {
        id: 813,
        title: "Largest Sum of Averages",
        slug: "largest-sum-of-averages",
        rating: 1937,
        difficulty: "Medium",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 32,
        tier: "Core Practice",
      },
      {
        id: 2762,
        title: "Continuous Subarrays",
        slug: "continuous-subarrays",
        rating: 1940,
        difficulty: "Medium",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 33,
        tier: "Core Practice",
      },
      {
        id: 410,
        title: "Split Array Largest Sum",
        slug: "split-array-largest-sum",
        rating: 1950,
        difficulty: "Hard",
        subPattern: "enumerate the cut point",
        why: "Exercises the enumerate the cut point enumeration viewpoint from the taxonomy.",
        order: 34,
        tier: "Core Practice",
      },
      {
        id: 907,
        title: "Sum of Subarray Minimums",
        slug: "sum-of-subarray-minimums",
        rating: 1976,
        difficulty: "Medium",
        subPattern: "owner / contributor (monotonic stack)",
        why: "Exercises the owner / contributor (monotonic stack) enumeration viewpoint from the taxonomy.",
        order: 35,
        tier: "Core Practice",
      },
      {
        id: 828,
        title: "Count Unique Characters of All Substrings of a Given String",
        slug: "count-unique-characters-of-all-substrings-of-a-given-string",
        rating: 2034,
        difficulty: "Hard",
        subPattern: "owner / contributor (monotonic stack)",
        why: "Exercises the owner / contributor (monotonic stack) enumeration viewpoint from the taxonomy.",
        order: 36,
        tier: "Advanced Practice",
      },
      {
        id: 1856,
        title: "Maximum Subarray Min-Product",
        slug: "maximum-subarray-min-product",
        rating: 2051,
        difficulty: "Medium",
        subPattern: "owner / contributor (monotonic stack)",
        why: "Exercises the owner / contributor (monotonic stack) enumeration viewpoint from the taxonomy.",
        order: 37,
        tier: "Advanced Practice",
      },
      {
        id: 2681,
        title: "Power of Heroes",
        slug: "power-of-heroes",
        rating: 2060,
        difficulty: "Hard",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 38,
        tier: "Advanced Practice",
      },
      {
        id: 2402,
        title: "Meeting Rooms III",
        slug: "meeting-rooms-iii",
        rating: 2093,
        difficulty: "Hard",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 39,
        tier: "Advanced Practice",
      },
      {
        id: 891,
        title: "Sum of Subsequence Widths",
        slug: "sum-of-subsequence-widths",
        rating: 2183,
        difficulty: "Hard",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 40,
        tier: "Advanced Practice",
      },
      {
        id: 992,
        title: "Subarrays with K Different Integers",
        slug: "subarrays-with-k-different-integers",
        rating: 2210,
        difficulty: "Hard",
        subPattern: "fix right, count valid lefts",
        why: "Exercises the fix right, count valid lefts enumeration viewpoint from the taxonomy.",
        order: 41,
        tier: "Advanced Practice",
      },
      {
        id: 2183,
        title: "Count Array Pairs Divisible by K",
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
        title: "Largest Component Size by Common Factor",
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
        title: "Count Good Triplets in an Array",
        slug: "count-good-triplets-in-an-array",
        rating: 2272,
        difficulty: "Hard",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 44,
        tier: "Advanced Practice",
      },
      {
        id: 1851,
        title: "Minimum Interval to Include Each Query",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "enumerate the trigger / event",
        why: "Exercises the enumerate the trigger / event enumeration viewpoint from the taxonomy.",
        order: 45,
        tier: "Advanced Practice",
      },
      {
        id: 2935,
        title: "Maximum Strong Pair XOR II",
        slug: "maximum-strong-pair-xor-ii",
        rating: 2349,
        difficulty: "Hard",
        subPattern: "enumerate bit by bit (high bit greedy)",
        why: "Exercises the enumerate bit by bit (high bit greedy) enumeration viewpoint from the taxonomy.",
        order: 46,
        tier: "Challenge Practice",
      },
      {
        id: 1707,
        title: "Maximum XOR With an Element From Array",
        slug: "maximum-xor-with-an-element-from-array",
        rating: 2359,
        difficulty: "Hard",
        subPattern: "enumerate bit by bit (high bit greedy)",
        why: "Exercises the enumerate bit by bit (high bit greedy) enumeration viewpoint from the taxonomy.",
        order: 47,
        tier: "Challenge Practice",
      },
      {
        id: 2818,
        title: "Apply Operations to Maximize Score",
        slug: "apply-operations-to-maximize-score",
        rating: 2397,
        difficulty: "Hard",
        subPattern: "owner / contributor (monotonic stack)",
        why: "Exercises the owner / contributor (monotonic stack) enumeration viewpoint from the taxonomy.",
        order: 48,
        tier: "Challenge Practice",
      },
      {
        id: 2003,
        title: "Smallest Missing Genetic Value in Each Subtree",
        slug: "smallest-missing-genetic-value-in-each-subtree",
        rating: 2415,
        difficulty: "Hard",
        subPattern: "small-to-large merging",
        why: "Exercises the small-to-large merging enumeration viewpoint from the taxonomy.",
        order: 49,
        tier: "Challenge Practice",
      },
      {
        id: 2552,
        title: "Count Increasing Quadruplets",
        slug: "count-increasing-quadruplets",
        rating: 2433,
        difficulty: "Hard",
        subPattern: "enumerate the pivot / middle",
        why: "Exercises the enumerate the pivot / middle enumeration viewpoint from the taxonomy.",
        order: 50,
        tier: "Challenge Practice",
      },
      {
        id: 2421,
        title: "Number of Good Paths",
        slug: "number-of-good-paths",
        rating: 2445,
        difficulty: "Hard",
        subPattern: "small-to-large merging",
        why: "Exercises the small-to-large merging enumeration viewpoint from the taxonomy.",
        order: 51,
        tier: "Challenge Practice",
      },
      {
        id: 1819,
        title: "Number of Different Subsequences GCDs",
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
        title: "Sum of Total Strength of Wizards",
        slug: "sum-of-total-strength-of-wizards",
        rating: 2621,
        difficulty: "Hard",
        subPattern: "owner / contributor (monotonic stack)",
        why: "Exercises the owner / contributor (monotonic stack) enumeration viewpoint from the taxonomy.",
        order: 53,
        tier: "Challenge Practice",
      },
      {
        id: 2916,
        title: "Subarrays Distinct Element Sum of Squares II",
        slug: "subarrays-distinct-element-sum-of-squares-ii",
        rating: 2816,
        difficulty: "Hard",
        subPattern: "contribution unit (pairs / subsequences)",
        why: "Exercises the contribution unit (pairs / subsequences) enumeration viewpoint from the taxonomy.",
        order: 54,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Contribution Counting",
    group: "Enumeration and Counting",
    icon: "Sigma",
    tagline:
      "Compute the total by asking how much each element, pair, boundary, or edge contributes.",
    concept: [
      'Contribution counting, or gongxian fa, flips "sum over all answers" into "sum over all contributors".',
      "Instead of building every subarray, subsequence, pair, or path, count how many times one atomic object appears with a fixed role.",
      "It is a core pattern for totals of minimums, maximums, widths, distances, appeals, and tree/path effects.",
    ],
    motivation: [
      "Brute force enumerates every result object and computes its value independently.",
      "Repeated work appears because the same element or pair appears in many result objects.",
      "The optimized pattern assigns each occurrence to a unique contributor and multiplies by the number of choices around it.",
    ],
    whenUse: [
      "The answer is a sum over all subarrays, subsequences, pairs, paths, or substrings.",
      "Each element can be the minimum, maximum, boundary, middle, last occurrence, or endpoint many times.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Enumerate the contributor, not the final object.",
      "Count left choices times right choices, or previous occurrences times future choices.",
      "Use strict/non-strict boundaries to make duplicates owned by exactly one side.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Every final object is assigned to exactly one contributor for the role being counted; duplicate values use asymmetric boundaries so ownership is unique.",
    variants: [
      "Element as minimum.",
      "Element as maximum.",
      "Element as boundary.",
      "Element as pivot or middle.",
      "Pair contribution after sorting.",
      "Tree edge contribution.",
      "Contribution with prefix sums.",
      "Contribution with monotonic stack.",
    ],
    templateKeys: [
      "contribution_mono",
      "pair_contribution",
      "prefix_contribution",
    ],
    complexity: [
      "Monotonic stack contribution is O(n); sorted pair contribution is O(n log n); prefix contribution is usually O(n).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Using < on both sides or <= on both sides for duplicates.",
      "Forgetting modulo or long long when multiplying choices.",
      "Counting each pair twice after sorting.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 2262,
        title: "Total Appeal of A String",
        slug: "total-appeal-of-a-string",
        rating: 2033,
        difficulty: "Hard",
        subPattern: "last-position contribution",
        why: "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 3428,
        title: "Maximum and Minimum Sums of at Most Size K Subsequences",
        slug: "maximum-and-minimum-sums-of-at-most-size-k-subsequences",
        rating: 2028,
        difficulty: "Medium",
        subPattern: "subsequence contribution",
        why: "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3430,
        title: "Maximum and Minimum Sums of at Most Size K Subarrays",
        slug: "maximum-and-minimum-sums-of-at-most-size-k-subarrays",
        rating: 2645,
        difficulty: "Hard",
        subPattern: "bounded subarray extrema",
        why: "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Does the statement say total sum over many objects?",
      "Can one element, edge, or pair be assigned a stable role like minimum or boundary?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Fix Right, Maintain Left",
    group: "Enumeration and Counting",
    icon: "ArrowLeftRight",
    tagline:
      "Enumerate the right endpoint and maintain the smallest left endpoint that restores the window invariant.",
    concept: [
      "Fix right, maintain left is the endpoint view of sliding window.",
      "The right endpoint moves once; left moves only to restore an invariant such as at most K, sum <= K, or coverage satisfied.",
      "It avoids O(n^2) subarray enumeration when validity changes monotonically as left moves.",
    ],
    motivation: [
      "Brute force checks all left/right pairs.",
      "If adding elements on the right only makes a constraint harder or easier in one direction, left never needs to move backward.",
      "For each right endpoint, all valid starts often form a contiguous interval that can be counted at once.",
    ],
    whenUse: [
      "Subarray or substring with longest, shortest, count valid, at most K, exactly K, frequency, non-negative sum, or bitwise OR constraints.",
      "The window can be updated by adding nums[right] and removing nums[left].",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Expand right exactly once per iteration.",
      "Shrink left until the invariant is restored or until removing more would break the objective.",
      "For counting at most K, add right - left + 1 after restoring validity.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "After processing each right endpoint, left is the first index such that the maintained window satisfies the chosen invariant.",
    variants: [
      "Longest valid window.",
      "Shortest valid window.",
      "Count valid subarrays.",
      "At most K and exactly K via subtraction.",
      "Frequency window.",
      "Bitwise OR window with bit counts.",
      "Two-window counting trick.",
    ],
    templateKeys: [
      "longest_window",
      "shortest_window",
      "at_most_k_distinct",
      "exactly_k_distinct",
      "bitwise_or_window",
    ],
    complexity: [
      "Each pointer moves O(n); map or bit operations add O(log V), O(1) average, or O(bit count).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Updating answer before shrinking to validity.",
      "Using exactly K directly when atMost(K) - atMost(K - 1) is cleaner.",
      "Trying this pattern when negative numbers break sum monotonicity.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1838,
        title: "Frequency of the Most Frequent Element",
        slug: "frequency-of-the-most-frequent-element",
        rating: 1876,
        difficulty: "Medium",
        subPattern: "sort + window",
        why: "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2302,
        title: "Count Subarrays with Score Less Than K",
        slug: "count-subarrays-with-score-less-than-k",
        rating: 1808,
        difficulty: "Hard",
        subPattern: "positive score window",
        why: "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2398,
        title: "Maximum Number of Robots Within Budget",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "window + monotonic deque",
        why: "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "For a fixed right, do valid starts form a suffix or prefix interval?",
      "Does left only need to move forward?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Enumerate Pivot / Middle",
    group: "Enumeration and Counting",
    icon: "Crosshair",
    tagline:
      "Fix the central object so left-side and right-side facts can be combined independently.",
    concept: [
      "Pivot enumeration fixes an index, value, edge, or middle position and counts compatible objects on both sides.",
      "It is common in triplets, palindromic subsequences, special subsequences, and split-based array problems.",
      "The middle object gives a canonical owner that prevents counting the same structure multiple times.",
    ],
    motivation: [
      "Brute force chooses all positions in a tuple.",
      "By fixing the middle, the left and right choices become independent counts or compressed states.",
      "The answer becomes a product or convolution of facts around the pivot.",
    ],
    whenUse: [
      "Problem asks for length-3/5 subsequences, increasing quadruplets, unique middle, split position, or center of symmetry.",
      "Left and right of a candidate can be summarized separately.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Precompute or maintain left-side facts.",
      "Precompute or maintain right-side facts.",
      "For each pivot, combine compatible facts and then move the pivot boundary.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Each valid structure has a unique pivot under the chosen definition, so combining left and right facts around that pivot counts it once.",
    variants: [
      "Middle index in triplets.",
      "Two middle positions in length-5 palindromes.",
      "Pivot value in frequency counting.",
      "Split point in arrays.",
      "Root or LCA as tree pivot.",
    ],
    templateKeys: ["enumerate_middle", "prefix_suffix_counts"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 2484,
        title: "Count Palindromic Subsequences",
        slug: "count-palindromic-subsequences",
        rating: 2223,
        difficulty: "Hard",
        subPattern: "middle enumeration",
        why: "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2552,
        title: "Count Increasing Quadruplets",
        slug: "count-increasing-quadruplets",
        rating: 2433,
        difficulty: "Hard",
        subPattern: "quadruplet counting",
        why: "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3395,
        title: "Subsequences with A Unique Middle Mode I",
        slug: "subsequences-with-a-unique-middle-mode-i",
        rating: 2800,
        difficulty: "Hard",
        subPattern: "middle mode counting",
        why: "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Prefix/Suffix Decomposition",
    group: "Enumeration and Counting",
    icon: "PanelsTopLeft",
    tagline:
      "Precompute what the left and right of every cut can provide, then combine them in O(1) or logarithmic time.",
    concept: [
      "Prefix/suffix decomposition stores facts before and after every cut or pivot.",
      "It is the array/string version of not rescanning the same side repeatedly.",
      "The pattern is strongest when the final answer is a cut, removal, splice, partition, or outside-inside choice.",
    ],
    motivation: [
      "Brute force tries a cut and scans left/right to evaluate it.",
      "Optimization performs the left-to-right and right-to-left scans once.",
      "Each cut then becomes a constant-time combination of previously computed facts.",
    ],
    whenUse: [
      "Question asks remove one subarray, choose from both ends, split array, compare prefix and suffix, or combine left/right bests.",
      "The property on each side is independent once the cut is fixed.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Define the cut semantics first: left ends at i, right starts at i + 1, or half-open ranges.",
      "Compute prefix facts in one direction and suffix facts in the other.",
      "Combine only compatible facts at each cut.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "For every cut, prefix state summarizes exactly the left side and suffix state summarizes exactly the right side under the same boundary convention.",
    variants: [
      "Prefix max with suffix min.",
      "Prefix count with suffix count.",
      "Outside window from two ends.",
      "Forward/backward DP.",
      "String prefix-function and suffix matching.",
    ],
    templateKeys: ["prefix_contribution", "prefix_suffix_counts"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 2025,
        title: "Maximum Number of Ways to Partition An Array",
        slug: "maximum-number-of-ways-to-partition-an-array",
        rating: 2218,
        difficulty: "Hard",
        subPattern: "prefix/suffix partition",
        why: "Uses left and right precomputation to remove repeated scans around a cut.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2167,
        title: "Minimum Time to Remove all Cars Containing Illegal Goods",
        slug: "minimum-time-to-remove-all-cars-containing-illegal-goods",
        rating: 2219,
        difficulty: "Hard",
        subPattern: "prefix/suffix DP",
        why: "Uses left and right precomputation to remove repeated scans around a cut.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1574,
        title: "Shortest Subarray to Be Removed to Make Array Sorted",
        slug: "shortest-subarray-to-be-removed-to-make-array-sorted",
        rating: 1932,
        difficulty: "Medium",
        subPattern: "prefix/suffix splice",
        why: "Uses left and right precomputation to remove repeated scans around a cut.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3316,
        title: "Find Maximum Removals from Source String",
        slug: "find-maximum-removals-from-source-string",
        rating: 2062,
        difficulty: "Medium",
        subPattern: "removal prefix/suffix DP",
        why: "Uses left and right precomputation to remove repeated scans around a cut.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Difference Array",
    group: "Core Array/String Patterns",
    icon: "Hash",
    tagline:
      "Represent many range updates as endpoint deltas, then reconstruct actual values with one prefix pass.",
    concept: [
      "A difference array stores changes between adjacent positions rather than final values.",
      "A range add becomes two endpoint events: add at left, subtract after right.",
      "It is ideal when updates are batched and final values or validity are checked after reconstruction.",
    ],
    motivation: [
      "Brute force applies every update to every affected index.",
      "If there are many long ranges, that repeats work inside overlapping intervals.",
      "Endpoint deltas preserve the net effect and defer all interior work to one prefix scan.",
    ],
    whenUse: [
      "Many range add/subtract operations.",
      "Need final array, coverage counts, or feasibility after applying intervals.",
      "Queries can be processed offline rather than requiring arbitrary online updates.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Convert each closed range [l, r] to diff[l] += delta and diff[r + 1] -= delta.",
      "Run a prefix sum to recover final values.",
      "For validation problems, greedily create deltas only when a position still needs help.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "The prefix sum at index i equals the total delta of every update whose range contains i.",
    variants: [
      "1D range add.",
      "2D rectangle add.",
      "Difference over cost function breakpoints.",
      "Greedy validation with active operations.",
      "Event sweep as a sparse difference array.",
    ],
    templateKeys: ["difference_array", "difference_matrix"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 995,
        title: "Minimum Number of K Consecutive Bit Flips",
        slug: "minimum-number-of-k-consecutive-bit-flips",
        rating: 1835,
        difficulty: "Hard",
        subPattern: "range flip difference",
        why: "Turns many range operations into endpoint events and one reconstruction pass.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1526,
        title:
          "Minimum Number of Increments on Subarrays to Form A Target Array",
        slug: "minimum-number-of-increments-on-subarrays-to-form-a-target-array",
        rating: 1872,
        difficulty: "Medium",
        subPattern: "positive difference contribution",
        why: "Turns many range operations into endpoint events and one reconstruction pass.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1674,
        title: "Minimum Moves to Make Array Complementary",
        slug: "minimum-moves-to-make-array-complementary",
        rating: 2333,
        difficulty: "Medium",
        subPattern: "difference over pair cost",
        why: "Turns many range operations into endpoint events and one reconstruction pass.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 3356,
        title: "Zero Array Transformation II",
        slug: "zero-array-transformation-ii",
        rating: 1913,
        difficulty: "Medium",
        subPattern: "range update boundary",
        why: "Turns many range operations into endpoint events and one reconstruction pass.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Binary Search on Answer",
    group: "Core Array/String Patterns",
    icon: "Gauge",
    tagline:
      "Search the value space when feasibility is monotone and cheaper than direct optimization.",
    concept: [
      "Binary search on answer transforms an optimization problem into repeated feasibility checks.",
      "The candidate value is not an index in the input; it is a speed, capacity, distance, time, maximum, minimum, or kth value.",
      "The entire technique depends on proving monotonicity of the predicate.",
    ],
    motivation: [
      "Brute force tests every possible answer value.",
      "If values are large but valid/invalid forms a prefix or suffix, binary search cuts the value space logarithmically.",
      "The predicate often uses greedy, counting, two pointers, or DSU.",
    ],
    whenUse: [
      "Minimize maximum, maximize minimum, kth smallest, minimum time, maximum feasible score.",
      "Given x, checking feasibility is O(n), O(n log n), or O(q alpha(n)).",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Choose low/high as definitely impossible/possible or both inclusive bounds.",
      "Write can(x) first and test monotonic direction.",
      "Return the first feasible or last feasible value according to the invariant.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "The search interval always contains the boundary between infeasible and feasible candidate values.",
    variants: [
      "Minimum feasible value.",
      "Maximum feasible value.",
      "Kth value by count <= x.",
      "Real-valued binary search.",
      "Binary search plus greedy construction.",
    ],
    templateKeys: ["answer_search", "loop_invariant_binary_search"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 875,
        title: "Koko Eating Bananas",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "minimum feasible speed",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "Capacity to Ship Packages Within D Days",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "minimum feasible capacity",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1552,
        title: "Magnetic Force Between Two Balls",
        slug: "magnetic-force-between-two-balls",
        rating: 1920,
        difficulty: "Medium",
        subPattern: "maximize minimum distance",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2141,
        title: "Maximum Running Time of N Computers",
        slug: "maximum-running-time-of-n-computers",
        rating: 2265,
        difficulty: "Hard",
        subPattern: "resource feasibility",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2513,
        title: "Minimize the Maximum of Two Arrays",
        slug: "minimize-the-maximum-of-two-arrays",
        rating: 2302,
        difficulty: "Medium",
        subPattern: "number theory feasibility",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3449,
        title: "Maximize the Minimum Game Score",
        slug: "maximize-the-minimum-game-score",
        rating: 2748,
        difficulty: "Hard",
        subPattern: "maximize minimum score",
        why: "Separates value-space search from a linear or greedy feasibility check.",
        order: 6,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Monotonic Data Structures",
    group: "Data Structure Patterns",
    icon: "ArrowDownWideNarrow",
    tagline:
      "Use stacks, deques, and queues that discard dominated candidates while preserving nearest or best boundaries.",
    concept: [
      "Monotonic structures keep candidates in sorted order of value, index, or priority as a scan advances.",
      "They remove dominated candidates that can never become the next answer.",
      "They are essential for nearest greater/smaller, sliding extrema, subarray minimum contribution, and prefix deque problems.",
    ],
    motivation: [
      "Brute force scans left or right from every index to find a boundary or best candidate.",
      "A monotonic stack/deque stores exactly the unresolved useful candidates from previous positions.",
      "Each index enters and leaves once, which turns many O(n^2) boundary searches into O(n).",
    ],
    whenUse: [
      "Nearest greater/smaller, next boundary, window max/min, shortest subarray with prefix constraints, or contribution by min/max.",
      "A candidate becomes useless when a newer candidate is both closer and no worse.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Define whether the structure is increasing or decreasing.",
      "Pop while the new element dominates the back.",
      "Use strict/non-strict comparisons deliberately for duplicates.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "After each insertion, the structure contains only undominated candidates in scan order and monotonic value order.",
    variants: [
      "Monotonic stack for next greater/smaller.",
      "Monotonic deque for sliding window extrema.",
      "Prefix-sum deque for shortest subarray.",
      "Contribution boundaries with duplicate policy.",
      "Monotonic queue optimized DP.",
    ],
    templateKeys: ["monotonic_stack", "monotonic_deque", "contribution_mono"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 862,
        title: "Shortest Subarray with Sum at Least K",
        slug: "shortest-subarray-with-sum-at-least-k",
        rating: 2307,
        difficulty: "Hard",
        subPattern: "prefix deque invariant",
        why: "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1673,
        title: "Find the Most Competitive Subsequence",
        slug: "find-the-most-competitive-subsequence",
        rating: 1802,
        difficulty: "Medium",
        subPattern: "monotonic stack subsequence",
        why: "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2454,
        title: "Next Greater Element IV",
        slug: "next-greater-element-iv",
        rating: 2175,
        difficulty: "Hard",
        subPattern: "two-pass monotonic stack",
        why: "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2398,
        title: "Maximum Number of Robots Within Budget",
        slug: "maximum-number-of-robots-within-budget",
        rating: 1917,
        difficulty: "Hard",
        subPattern: "window + monotonic deque",
        why: "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3676,
        title: "Count Bowl Subarrays",
        slug: "count-bowl-subarrays",
        rating: 1848,
        difficulty: "Medium",
        subPattern: "monotonic boundary stack",
        why: "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        order: 7,
        tier: "Core Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Coordinate Compression",
    group: "Data Structure Patterns",
    icon: "Blocks",
    tagline:
      "Map large sparse values to dense ranks while preserving order comparisons and equality.",
    concept: [
      "Coordinate compression replaces raw coordinates with ranks 1..m.",
      "It preserves ordering and equality but discards irrelevant gaps between values.",
      "It enables Fenwick trees, segment trees, counting arrays, and sweeps on values up to 1e9 or beyond.",
    ],
    motivation: [
      "Brute force over the coordinate range is impossible when values are huge.",
      "Only coordinates that appear in updates, queries, or boundaries can affect the answer.",
      "Sorting those coordinates creates a compact index space for data structures.",
    ],
    whenUse: [
      "Values are large but only O(n + q) distinct coordinates matter.",
      "Need order-statistics, range counts, offline queries, or interval endpoints.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Collect every coordinate that can be queried or updated.",
      "Sort and unique.",
      "Use lower_bound to map raw values to ranks.",
      "For intervals, include boundary sentinels such as r + 1 when using difference semantics.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Rank order is identical to raw coordinate order for every coordinate the algorithm may compare or update.",
    variants: [
      "Point compression for Fenwick.",
      "Endpoint compression for intervals.",
      "Value compression for inversion and inequality counts.",
      "2D compression for rectangles.",
      "Compression with sentinels for half-open ranges.",
    ],
    templateKeys: ["coordinate_compression_fenwick", "coordinate_compress"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1649,
        title: "Create Sorted Array Through Instructions",
        slug: "create-sorted-array-through-instructions",
        rating: 2208,
        difficulty: "Hard",
        subPattern: "ranked insertion counts",
        why: "Replaces large coordinates with rank space while preserving order and equality.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2426,
        title: "Number of Pairs Satisfying Inequality",
        slug: "number-of-pairs-satisfying-inequality",
        rating: 2030,
        difficulty: "Hard",
        subPattern: "compressed inequality count",
        why: "Replaces large coordinates with rank space while preserving order and equality.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1906,
        title: "Minimum Absolute Difference Queries",
        slug: "minimum-absolute-difference-queries",
        rating: 2147,
        difficulty: "Medium",
        subPattern: "range frequency compression",
        why: "Replaces large coordinates with rank space while preserving order and equality.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Exchange Argument",
    group: "Greedy Patterns",
    icon: "GitCompare",
    tagline:
      "Prove a greedy choice by replacing the first disagreeing optimal choice without making the solution worse.",
    concept: [
      "An exchange argument is the standard proof for many sorting and interval greedy algorithms.",
      "It shows that some optimal solution can be transformed to include the greedy choice.",
      "Once that first choice is justified, the same argument repeats on the remaining subproblem.",
    ],
    motivation: [
      "Brute force tries all subsets, schedules, or orders.",
      "Greedy commits to one locally best item, such as earliest finish, smallest end, largest gain, or cheapest safe edge.",
      "The proof must show every optimal solution can exchange its first conflicting item for the greedy item.",
    ],
    whenUse: [
      "The algorithm sorts and repeatedly takes one local best candidate.",
      "You can compare two solutions by the first position where they differ.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Identify the greedy choice.",
      "Take an optimal solution that differs first at this choice.",
      "Swap in the greedy choice and show feasibility and objective do not worsen.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "There exists an optimal solution whose prefix matches the greedy prefix after each exchange step.",
    variants: [
      "Earliest finish interval scheduling.",
      "Heap replacement by best current resource.",
      "Sort by deadline or end.",
      "MST lightest edge across a cut.",
      "Lexicographic first differing position.",
    ],
    templateKeys: ["exchange_greedy", "exchange_swap_sort"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1024,
        title: "Video Stitching",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "interval cover exchange",
        why: "Needs a local choice whose replacement argument can be defended.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "Minimum Number of Taps to Open to Water A Garden",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "minimum interval cover",
        why: "Needs a local choice whose replacement argument can be defended.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1705,
        title: "Maximum Number of Eaten Apples",
        slug: "maximum-number-of-eaten-apples",
        rating: 1930,
        difficulty: "Medium",
        subPattern: "expiry heap greedy",
        why: "Needs a local choice whose replacement argument can be defended.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Greedy Construction",
    group: "Greedy Patterns",
    icon: "PencilRuler",
    tagline:
      "Trial filling / feasibility-guided construction for lexicographically or numerically optimal valid answers.",
    concept: [
      "Greedy construction builds the answer one position at a time in preferred order.",
      "At each position, it tries the best candidate and commits only if the remaining suffix is feasible.",
      "It differs from ordinary greedy because the feasibility check is part of the choice, not an afterthought.",
    ],
    motivation: [
      "Brute force enumerates every string, array, permutation, or sequence.",
      "If lexicographic or high-to-low priority decides the earliest differing position, we can try candidates in that order.",
      "The first candidate that still permits completion is safe to commit.",
    ],
    whenUse: [
      "Construct lexicographically smallest/largest answer, build digits/bits/array, or choose smallest valid candidate per position.",
      "There are remaining resources such as sum, frequency, required letters, or mask constraints.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Iterate positions in priority order.",
      "Try candidates from best to worst.",
      "Check whether the remaining positions can still satisfy all constraints.",
      "Commit and update remaining resources.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "After fixing each prefix, there exists an optimal answer with that prefix, and the remaining constraints still admit at least one completion.",
    variants: [
      "Lexicographically smallest string.",
      "Lexicographically largest sequence.",
      "Digit-by-digit construction.",
      "Remaining sum or count bounds.",
      "Frequency-based construction.",
      "Backtracking-looking problems solved by greedy trial filling.",
    ],
    templateKeys: [
      "greedy_builder",
      "greedy_lexicographic",
      "remaining_sum_construction",
      "frequency_construction",
    ],
    complexity: [
      "If each position tries A candidates and feasibility is F, complexity is O(n * A * F); stack constructions are usually O(n).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Using a feasibility check that is necessary but not sufficient.",
      "Trying candidates in the wrong order for the objective.",
      "Forgetting to update remaining quotas after committing.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1718,
        title: "Construct the Lexicographically Largest Valid Sequence",
        slug: "construct-the-lexicographically-largest-valid-sequence",
        rating: 2080,
        difficulty: "Medium",
        subPattern: "trial filling sequence",
        why: "Builds the answer position by position while proving the suffix remains feasible.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2030,
        title: "Smallest K Length Subsequence with Occurrences of A Letter",
        slug: "smallest-k-length-subsequence-with-occurrences-of-a-letter",
        rating: 2562,
        difficulty: "Hard",
        subPattern: "quota greedy stack",
        why: "Builds the answer position by position while proving the suffix remains feasible.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 3302,
        title: "Find the Lexicographically Smallest Valid Sequence",
        slug: "find-the-lexicographically-smallest-valid-sequence",
        rating: 2474,
        difficulty: "Medium",
        subPattern: "lexicographic feasibility",
        why: "Builds the answer position by position while proving the suffix remains feasible.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Does the objective compare earliest differing positions?",
      "Can I cheaply decide whether a partial prefix can be completed?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Greedy Stays Ahead",
    group: "Greedy Patterns",
    icon: "TrendingUp",
    tagline:
      "Prove that the greedy frontier is always at least as good as any alternative after the same number of choices.",
    concept: [
      "Greedy stays ahead proves progress by comparing frontiers after each step.",
      "It is common in interval cover, jump reachability, refueling, and resource extension problems.",
      "The algorithm chooses the option that maximizes the next frontier among all currently reachable choices.",
    ],
    motivation: [
      "Brute force tries every sequence of jumps, intervals, or resources.",
      "The optimized greedy processes all choices currently available and commits to the one with farthest reach or best future capacity.",
      "The proof compares how far any solution with the same number of steps could have reached.",
    ],
    whenUse: [
      "Need minimum number of jumps/intervals/refuels to reach a target.",
      "Available candidates are defined by current reach, and each candidate extends reach.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Maintain current frontier.",
      "Scan all candidates starting before or at the frontier.",
      "Commit the candidate with farthest next frontier.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "After k greedy choices, the greedy reachable frontier is at least as far as the frontier of any solution using k choices.",
    variants: [
      "Jump Game style reach.",
      "Interval cover.",
      "Minimum taps.",
      "Refueling with max heap.",
      "Batch processing currently reachable events.",
    ],
    templateKeys: ["interval_cover_greedy", "exchange_greedy"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1024,
        title: "Video Stitching",
        slug: "video-stitching",
        rating: 1746,
        difficulty: "Medium",
        subPattern: "interval cover exchange",
        why: "Uses a frontier that is never behind any alternative after the same number of steps.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1326,
        title: "Minimum Number of Taps to Open to Water A Garden",
        slug: "minimum-number-of-taps-to-open-to-water-a-garden",
        rating: 1885,
        difficulty: "Hard",
        subPattern: "minimum interval cover",
        why: "Uses a frontier that is never behind any alternative after the same number of steps.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1705,
        title: "Maximum Number of Eaten Apples",
        slug: "maximum-number-of-eaten-apples",
        rating: 1930,
        difficulty: "Medium",
        subPattern: "expiry heap greedy",
        why: "Uses a frontier that is never behind any alternative after the same number of steps.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Cut Property",
    group: "Graph Patterns",
    icon: "Network",
    tagline:
      "Use graph cuts to justify safe edge choices in MST, connectivity, and bridge-style reasoning.",
    concept: [
      "The cut property says the lightest edge crossing a cut is safe for some minimum spanning tree.",
      "More generally, cut reasoning separates already-connected components from the rest and asks which edge must be considered.",
      "It underlies Kruskal, Prim, critical-edge tests, and many DSU-by-threshold problems.",
    ],
    motivation: [
      "Brute force over all spanning trees is impossible.",
      "Kruskal sorts edges and only considers whether an edge connects two current components.",
      "The cut property proves that taking the next lightest crossing edge cannot block optimality.",
    ],
    whenUse: [
      "Minimum spanning tree, critical edges, connect all points, DSU sorted by edge weight/value, or graph thresholds.",
      "Need to decide whether adding an edge is safe or redundant.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Sort candidate edges by weight or threshold.",
      "Maintain connected components with DSU.",
      "Accept edges that cross component cuts; reject edges inside one component.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "For every accepted edge, there is a cut separating its two components where this edge is a minimum available crossing edge.",
    variants: [
      "Kruskal MST.",
      "Prim MST.",
      "Critical and pseudo-critical edges.",
      "DSU by value threshold.",
      "Bridge/cut-edge reasoning for connectivity loss.",
    ],
    templateKeys: ["mst_kruskal", "mst_prim"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1584,
        title: "Min Cost to Connect all Points",
        slug: "min-cost-to-connect-all-points",
        rating: 1858,
        difficulty: "Medium",
        subPattern: "MST geometry",
        why: "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1489,
        title:
          "Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",
        slug: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
        rating: 2572,
        difficulty: "Hard",
        subPattern: "MST cut property",
        why: "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1579,
        title: "Remove Max Number of Edges to Keep Graph Fully Traversable",
        slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable",
        rating: 2132,
        difficulty: "Hard",
        subPattern: "shared DSU cut choice",
        why: "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "DP State Design",
    group: "Dynamic Programming",
    icon: "Layers",
    tagline:
      "Define DP dimensions that are sufficient, minimal, and ordered for computation.",
    concept: [
      "DP state design chooses what a subproblem means.",
      "The state must include every fact that can change future choices and exclude facts that are irrelevant or derivable.",
      "A strong state definition is usually more important than the final recurrence syntax.",
    ],
    motivation: [
      "Brute force explores all choice histories.",
      "DP merges histories that have the same future behavior under a state definition.",
      "The optimization is valid only when merged histories are truly equivalent.",
    ],
    whenUse: [
      "Overlapping subproblems, choices over prefixes, intervals, rows, trees, counts, or masks.",
      "You can describe the answer for a partial object and extend it.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Write dp state in one sentence.",
      "List allowed transitions into or out of that state.",
      "Pick an evaluation order where dependencies are already known.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "All histories represented by the same DP state have the same optimal future value except for the accumulated value stored in the state.",
    variants: [
      "Linear DP by index.",
      "Grid DP by cell and direction.",
      "Tree DP by node and selected status.",
      "Interval DP by left/right.",
      "Multi-dimensional DP by count/last group.",
    ],
    templateKeys: ["dp_state", "dp_state_machine"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1269,
        title: "Number of Ways to Stay in the Same Place after Some Steps",
        slug: "number-of-ways-to-stay-in-the-same-place-after-some-steps",
        rating: 1854,
        difficulty: "Hard",
        subPattern: "position DP",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1473,
        title: "Paint House III",
        slug: "paint-house-iii",
        rating: 2056,
        difficulty: "Hard",
        subPattern: "multi-dimensional state",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1937,
        title: "Maximum Number of Points with Cost",
        slug: "maximum-number-of-points-with-cost",
        rating: 2106,
        difficulty: "Medium",
        subPattern: "row DP optimization",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2209,
        title: "Minimum White Tiles after Covering with Carpets",
        slug: "minimum-white-tiles-after-covering-with-carpets",
        rating: 2106,
        difficulty: "Hard",
        subPattern: "covering DP",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2312,
        title: "Selling Pieces of Wood",
        slug: "selling-pieces-of-wood",
        rating: 2363,
        difficulty: "Hard",
        subPattern: "2D split DP",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 1000,
        title: "Minimum Cost to Merge Stones",
        slug: "minimum-cost-to-merge-stones",
        rating: 2423,
        difficulty: "Hard",
        subPattern: "interval DP state",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 6,
        tier: "Challenge Practice",
      },
      {
        id: 3742,
        title: "Maximum Path Score in a Grid",
        slug: "maximum-path-score-in-a-grid",
        rating: 1804,
        difficulty: "Medium",
        subPattern: "grid DP state",
        why: "Tests whether the chosen DP dimensions are sufficient and minimal.",
        order: 7,
        tier: "Core Practice",
      },
      {
        id: 309,
        title: "Best Time to Buy and Sell Stock with Cooldown",
        slug: "best-time-to-buy-and-sell-stock-with-cooldown",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "hold/cash/cooldown state machine",
        why: "Three explicit states make the transitions obvious and minimal.",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 1186,
        title: "Maximum Subarray Sum with One Deletion",
        slug: "maximum-subarray-sum-with-one-deletion",
        rating: 1799,
        difficulty: "Medium",
        subPattern: "deleted / not-deleted state",
        why: "A second boolean state dimension captures the optional deletion.",
        order: 9,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "DP Transition Design",
    group: "Dynamic Programming",
    icon: "GitBranch",
    tagline:
      "Derive transitions from the last decision, split point, previous state, or chosen boundary.",
    concept: [
      "A DP transition explains how a larger state is built from smaller states.",
      "Good transitions come from the last action, the first cut, the chosen middle, or the boundary that separates independent subproblems.",
      "The recurrence is a proof of optimal substructure in executable form.",
    ],
    motivation: [
      "Brute force tries all decision sequences recursively.",
      "DP keeps the same branching choices but memoizes or tabulates by state.",
      "Optimization often comes from reducing transition candidates with prefix maxima, monotonic queues, or convexity, but only after the base recurrence is correct.",
    ],
    whenUse: [
      "You know the state but are unsure how states connect.",
      "There is a natural last operation, split point, chosen item, or previous group.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Choose the transition owner: last action, next action, split, or pivot.",
      "Ensure every valid solution appears in at least one transition.",
      "Ensure no transition uses a state that includes the current decision twice.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "The optimal value for a state is exactly the best over all legal final decisions that lead from smaller states to this state.",
    variants: [
      "Take/skip transition.",
      "Partition transition.",
      "Interval split.",
      "Tree child merge.",
      "State compression transition.",
      "Optimized transition with prefix bests.",
    ],
    templateKeys: ["dp_transition", "dp_knapsack"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1547,
        title: "Minimum Cost to Cut A Stick",
        slug: "minimum-cost-to-cut-a-stick",
        rating: 2116,
        difficulty: "Hard",
        subPattern: "interval DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1690,
        title: "Stone Game Vii",
        slug: "stone-game-vii",
        rating: 1951,
        difficulty: "Medium",
        subPattern: "game DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1770,
        title: "Maximum Score from Performing Multiplication Operations",
        slug: "maximum-score-from-performing-multiplication-operations",
        rating: 2068,
        difficulty: "Hard",
        subPattern: "two-end DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 1872,
        title: "Stone Game Viii",
        slug: "stone-game-viii",
        rating: 2440,
        difficulty: "Hard",
        subPattern: "suffix transition DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 1959,
        title: "Minimum Total Space Wasted with K Resizing Operations",
        slug: "minimum-total-space-wasted-with-k-resizing-operations",
        rating: 2310,
        difficulty: "Medium",
        subPattern: "partition DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 5,
        tier: "Challenge Practice",
      },
      {
        id: 3193,
        title: "Count the Number of Inversions",
        slug: "count-the-number-of-inversions",
        rating: 2266,
        difficulty: "Hard",
        subPattern: "inversion-count DP",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 3743,
        title: "Maximize Cyclic Partition Score",
        slug: "maximize-cyclic-partition-score",
        rating: 3125,
        difficulty: "Hard",
        subPattern: "cyclic partition transition",
        why: "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        order: 7,
        tier: "Challenge Practice",
      },
      {
        id: 1043,
        title: "Partition Array for Maximum Sum",
        slug: "partition-array-for-maximum-sum",
        rating: 1916,
        difficulty: "Medium",
        subPattern: "last-segment transition",
        why: "Transition enumerates the length of the final segment.",
        order: 8,
        tier: "Core Practice",
      },
      {
        id: 132,
        title: "Palindrome Partitioning II",
        slug: "palindrome-partitioning-ii",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "cut-position transition",
        why: "dp[i] transitions over every valid last palindromic cut.",
        order: 9,
        tier: "Core Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Offline Query Processing",
    group: "Range Query and Offline Techniques",
    icon: "CalendarRange",
    tagline:
      "Reorder queries with events so expensive updates happen once and answers are restored by original index.",
    concept: [
      "Offline processing answers queries after reading all of them, allowing a helpful order different from input order.",
      "Sorting by threshold, coordinate, time, or block can turn repeated work into incremental updates.",
      "The answer array stores results by original query index so output order is preserved.",
    ],
    motivation: [
      "Online brute force handles each query independently.",
      "If queries share thresholds or sweep coordinates, process them in sorted order and maintain an active data structure.",
      "Each item enters or leaves the structure a small number of times instead of once per query.",
    ],
    whenUse: [
      "All queries are known in advance.",
      "Query condition has a threshold, coordinate, value limit, or time segment.",
      "The statement does not require immediate online answers.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Choose the sorting key that makes updates monotone.",
      "Store original query index.",
      "Move a pointer through events while answering queries.",
      "Use Fenwick, DSU, heap, or ordered set for active state.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Before answering a query in offline order, the active structure contains exactly the objects that satisfy that query key.",
    variants: [
      "Sort queries by value threshold.",
      "Offline DSU by edge limit.",
      "Sweep line over coordinates.",
      "Mo algorithm by blocks.",
      "Rollback DSU over time segments.",
    ],
    templateKeys: ["offline_fenwick", "coordinate_compression_fenwick"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 2070,
        title: "Most Beautiful Item for Each Query",
        slug: "most-beautiful-item-for-each-query",
        rating: 1724,
        difficulty: "Medium",
        subPattern: "sorted query sweep",
        why: "Sorts events and queries so updates happen once and query state is cheap.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1851,
        title: "Minimum Interval to Include Each Query",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "offline interval query",
        why: "Sorts events and queries so updates happen once and query state is cheap.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1697,
        title: "Checking Existence of Edge Length Limited Paths",
        slug: "checking-existence-of-edge-length-limited-paths",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "offline DSU threshold",
        why: "Sorts events and queries so updates happen once and query state is cheap.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Sweep Line",
    group: "Range Query and Offline Techniques",
    icon: "CalendarRange",
    tagline:
      "Turn intervals, points, times, and rectangles into sorted events with an active set.",
    concept: [
      "Sweep line processes events in coordinate order and maintains the active objects crossing the current coordinate.",
      "It converts pairwise interval or geometry checks into start/end updates and queries on active state.",
      "The active state can be a counter, heap, ordered set, Fenwick tree, or segment tree.",
    ],
    motivation: [
      "Brute force compares every point with every interval or every rectangle with every coordinate.",
      "Events matter only when something starts, ends, or a query is asked.",
      "Sorting those events lets the algorithm update state exactly at the coordinates where the answer can change.",
    ],
    whenUse: [
      "Intervals, booking, meeting rooms, flowers in bloom, rectangles, points covered by ranges, or offline coordinate queries.",
      "Need maximum overlap, active minimum/maximum, or area/coverage.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Design start, end, and query events.",
      "Sort with a deliberate tie-break rule.",
      "Maintain active state after applying all events that should affect the current coordinate.",
      "Compress coordinates for large sparse geometry.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "When the sweep reaches coordinate x, the data structure contains exactly the objects active at x under the chosen boundary convention.",
    variants: [
      "Interval overlap counting.",
      "Meeting rooms with heap.",
      "Range add / point query.",
      "Rectangle union area.",
      "Points covered by intervals.",
      "Sweep with ordered set or segment tree.",
      "Offline query sweep.",
    ],
    templateKeys: [
      "sweep_events",
      "sweep_difference",
      "sweep_heap",
      "sweep_compressed_fenwick",
    ],
    complexity: [
      "Sorting events costs O((n + q) log(n + q)); active updates usually cost O(log n), or O(1) for simple counters.",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Wrong start/end tie-breaking.",
      "Mixing inclusive and exclusive endpoints.",
      "Forgetting to add r + 1 for integer closed intervals.",
      "Overflow in area or coordinate products.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1851,
        title: "Minimum Interval to Include Each Query",
        slug: "minimum-interval-to-include-each-query",
        rating: 2286,
        difficulty: "Hard",
        subPattern: "offline interval query",
        why: "Represents interval or geometry changes as events over one ordered coordinate.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 2251,
        title: "Number of Flowers in Full Bloom",
        slug: "number-of-flowers-in-full-bloom",
        rating: 2022,
        difficulty: "Hard",
        subPattern: "event sweep boundaries",
        why: "Represents interval or geometry changes as events over one ordered coordinate.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 850,
        title: "Rectangle Area II",
        slug: "rectangle-area-ii",
        rating: 2236,
        difficulty: "Hard",
        subPattern: "rectangle union sweep",
        why: "Represents interval or geometry changes as events over one ordered coordinate.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2276,
        title: "Count Integers in Intervals",
        slug: "count-integers-in-intervals",
        rating: 2222,
        difficulty: "Hard",
        subPattern: "dynamic interval coverage",
        why: "Represents interval or geometry changes as events over one ordered coordinate.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2503,
        title: "Maximum Number of Points from Grid Queries",
        slug: "maximum-number-of-points-from-grid-queries",
        rating: 2196,
        difficulty: "Hard",
        subPattern: "grid query sweep",
        why: "Represents interval or geometry changes as events over one ordered coordinate.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Can the answer change only at event coordinates?",
      "What exactly is active at a query coordinate?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "State Compression",
    group: "Bit and Math Patterns",
    icon: "Binary",
    tagline:
      "Encode subsets, assignments, parity, or small resources as bitmasks for DP or graph search.",
    concept: [
      "State compression maps a set of boolean choices into bits of an integer mask.",
      "It makes exponential search explicit and allows memoization over masks instead of over whole histories.",
      "It is practical when n is around 15 to 22, or when only a few independent features must be tracked.",
    ],
    motivation: [
      "Brute force recursively explores all assignments or subsets.",
      "Many histories lead to the same used set, remaining set, or visited set.",
      "A mask state merges those histories and transitions by setting, clearing, or iterating bits.",
    ],
    whenUse: [
      "n is small, usually <= 20.",
      "Need visit all nodes, assign people/items, partition into groups, or track used elements.",
      "The future depends on the set, not the order used to obtain it.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "Represent chosen elements as mask bits.",
      "Use popcount to derive the next index when possible.",
      "Iterate unset bits for assignment or submasks for partition.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "All histories with the same mask have the same remaining choices; the best value for that mask is sufficient.",
    variants: [
      "Assignment DP.",
      "Subset partition DP.",
      "BFS over node + mask.",
      "Submask enumeration.",
      "SOS-style transforms and meet in the middle.",
    ],
    templateKeys: ["bitmask_dp", "state_bfs", "subset_enumeration"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 1681,
        title: "Minimum Incompatibility",
        slug: "minimum-incompatibility",
        rating: 2390,
        difficulty: "Hard",
        subPattern: "partition mask DP",
        why: "Uses bitmasks to make exponential state explicit and memoizable.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1655,
        title: "Distribute Repeating Integers",
        slug: "distribute-repeating-integers",
        rating: 2307,
        difficulty: "Hard",
        subPattern: "customer subset DP",
        why: "Uses bitmasks to make exponential state explicit and memoizable.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1879,
        title: "Minimum XOR Sum of Two Arrays",
        slug: "minimum-xor-sum-of-two-arrays",
        rating: 2145,
        difficulty: "Hard",
        subPattern: "assignment mask DP",
        why: "Uses bitmasks to make exponential state explicit and memoizable.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Loop Invariant",
    group: "Advanced Mixed Patterns",
    icon: "GitBranch",
    tagline:
      "Write loop contracts that make binary search, windows, stacks, and DP scans mechanically correct.",
    concept: [
      "A loop invariant is a contract that holds before the first iteration, after every iteration, and at termination.",
      "It is the implementation-level version of correctness for scans and searches.",
      "Hard bugs become easier to find when each line is either preserving or restoring the invariant.",
    ],
    motivation: [
      "Brute force often has no compressed loop state: each candidate is checked directly.",
      "Optimized loops compress many candidates into a few variables, so correctness depends on what those variables mean.",
      "The invariant explains why terminating at low, left, stack top, or dp index returns the right answer.",
    ],
    whenUse: [
      "Binary search boundaries, two pointers, monotonic structures, greedy frontiers, or rolling DP.",
      "You are unsure what low/high/left/right mean after an update.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object.",
    ],
    coreIdea: [
      "State initialization makes the invariant true.",
      "Each branch preserves the invariant.",
      "Termination plus invariant implies the postcondition.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges.",
    ],
    invariant:
      "Initialization, maintenance, and termination all hold: the loop starts valid, every iteration preserves validity, and the final state directly yields the answer.",
    variants: [
      "Binary search false/true partition.",
      "Sliding window valid range.",
      "Monotonic stack unresolved candidates.",
      "Greedy frontier.",
      "DP scan with previous row/state.",
    ],
    templateKeys: ["loop_invariant_binary_search", "constraint_scan"],
    complexity: [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained.",
    ],
    mistakes: [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints.",
    ],
    practice: [
      {
        id: 875,
        title: "Koko Eating Bananas",
        slug: "koko-eating-bananas",
        rating: 1766,
        difficulty: "Medium",
        subPattern: "minimum feasible speed",
        why: "Requires writing and maintaining the exact condition before every loop iteration.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 1011,
        title: "Capacity to Ship Packages Within D Days",
        slug: "capacity-to-ship-packages-within-d-days",
        rating: 1725,
        difficulty: "Medium",
        subPattern: "minimum feasible capacity",
        why: "Requires writing and maintaining the exact condition before every loop iteration.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1898,
        title: "Maximum Number of Removable Characters",
        slug: "maximum-number-of-removable-characters",
        rating: 1913,
        difficulty: "Medium",
        subPattern: "monotone deletion check",
        why: "Requires writing and maintaining the exact condition before every loop iteration.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?",
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
    title: "Two Pointers (Opposite Direction)",
    group: "Core Array/String Patterns",
    icon: "ArrowLeftRight",
    tagline:
      "Close in from both ends of a sorted or symmetric array to find pairs, triples, and palindromes in linear time.",
    concept: [
      "Picture two people walking toward each other from opposite ends of a sorted bookshelf, each able to step inward. If the two books they hold are together too heavy, the person on the heavy (right) end steps in; if too light, the left person steps in. Because the shelf is sorted, every step rules out a whole batch of pairs at once — that is the entire trick.",
      "Opposite-direction two pointers maintain a shrinking window `[lo, hi]` and move exactly one endpoint per step based on a comparison.",
      "Contrast with same-direction (sliding-window) pointers: there both pointers move forward; here they move toward each other and the array is usually sorted first.",
    ],
    motivation: [
      "Brute force for 'find a pair summing to target' tries all pairs. Example: `nums = [2, 7, 11, 15]`, target 9 checks (2,7),(2,11),… — `O(n^2)`.",
      "Sort (or assume sorted), then read both ends: `2 + 15 = 17 > 9` so drop the largest (move `hi`); `2 + 11 = 13 > 9` move `hi`; `2 + 7 = 9` — found.",
      "Each comparison discards an entire row/column of the pair matrix, so the scan is `O(n)` after the `O(n log n)` sort. The repeated work brute force did — re-checking pairs that the order already rules out — is eliminated.",
    ],
    whenUse: [
      "If you see a sorted array and 'find a pair/triple with sum/condition', think pointers closing from both ends.",
      "If you see 'is it a palindrome' or 'reverse in place', think one pointer at each end moving inward.",
      "If you see 3Sum/4Sum, think: fix the outer element(s), then two-point the rest.",
      "If you see 'most water'/'two lines' area problems, think move the limiting (shorter) end inward.",
      "If the array is unsorted but only values matter (not indices), think sort first, then two pointers.",
    ],
    coreIdea: [
      "Sort the array unless it is already ordered and indices must be preserved.",
      "Place `lo` at the start and `hi` at the end.",
      "Compare the current pair against the target/condition.",
      "Move `lo` rightward to increase, or `hi` leftward to decrease, the quantity.",
      "On a match, record it and skip equal neighbors to avoid duplicate results.",
      "Stop when `lo >= hi`.",
    ],
    invariant:
      "**No-Discarded-Solution Invariant.** Every pair still containing the answer lies within `[lo, hi]`. Why each move is safe: if `nums[lo] + nums[hi]` is too small, then `nums[lo]` paired with anything ≤ `nums[hi]` is also too small, so `lo` can never be part of a solution and is discarded; symmetrically for `hi`. Because each step removes only pairs that provably cannot be the answer, the surviving window always contains it.",
    variants: [
      "Sorted-pair search: find two values summing to a target (Two Sum II).",
      "3Sum / 4Sum: fix the outer indices, then two-point the inner pair, skipping duplicates.",
      "Palindrome check: compare mirrored characters moving inward.",
      "Container/area: move the shorter wall inward because the taller one cannot improve while paired with the shorter.",
      "Partition (Dutch national flag): three pointers sweeping a 3-way split in one pass.",
    ],
    templateKeys: ["two_pointers_opposite", "three_sum"],
    complexity: [
      "Two-pointer scan is O(n); the hidden cost is the O(n log n) sort that usually precedes it, which dominates the total.",
      "3Sum/4Sum nest the scan inside fixing 1–2 elements: O(n^2) / O(n^3); the hidden cost is the duplicate-skipping that keeps results unique without extra passes.",
      "Space is O(1) beyond the output (or O(log n)–O(n) for the sort, depending on the algorithm).",
    ],
    mistakes: [
      "Forgetting to skip duplicates. Counter-example: `nums = [0,0,0]`, target 0 in 3Sum emits `[0,0,0]` many times unless you advance past equal `lo`/`hi` values after a match.",
      "Using two pointers on an unsorted array. Counter-example: on `[3,1,4,2]` the move rule is meaningless because a larger value can sit to the left; sort first.",
      "Moving the wrong end in the area problem. Counter-example: moving the taller wall in Container With Most Water can only shrink the width without raising the limiting height, missing the optimum — move the shorter wall.",
      "Overflow in the sum. Counter-example: two values near `10^9` overflow `int`; compare with `long long` or rearrange the comparison.",
    ],
    practice: [
      {
        id: 167,
        title: "Two Sum II - Input Array Is Sorted",
        slug: "two-sum-ii-input-array-is-sorted",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "sorted pair search",
        why: "The base case: one pointer at each end of a sorted array.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 11,
        title: "Container With Most Water",
        slug: "container-with-most-water",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "move the shorter wall",
        why: "Classic 'move the limiting endpoint' exchange argument.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 15,
        title: "3Sum",
        slug: "3sum",
        rating: 1550,
        difficulty: "Medium",
        subPattern: "fix one + two pointers",
        why: "Canonical fix-outer-then-two-point with duplicate skipping.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 16,
        title: "3Sum Closest",
        slug: "3sum-closest",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "track closest sum",
        why: "Same scan, but maintain the closest distance instead of equality.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 18,
        title: "4Sum",
        slug: "4sum",
        rating: 1650,
        difficulty: "Medium",
        subPattern: "fix two + two pointers",
        why: "Adds a second fixed index and careful overflow/duplicate handling.",
        order: 5,
        tier: "Advanced Practice",
      },
      {
        id: 42,
        title: "Trapping Rain Water",
        slug: "trapping-rain-water",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "two pointers with running maxima",
        why: "Opposite pointers driven by the smaller side's running max.",
        order: 6,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Is the array sorted (or can I sort it because only values, not original indices, matter)?",
      "Does moving one endpoint monotonically increase or decrease the quantity I compare?",
      "After a match, am I skipping equal neighbors so results stay unique?",
      "For area/partition variants, which endpoint is the limiting one I must move?",
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
    title: "Sliding Window (Exact Size / At-Most-K)",
    group: "Core Array/String Patterns",
    icon: "SlidersHorizontal",
    tagline:
      "Maintain a contiguous window and slide it to answer fixed-size, longest, shortest, and exactly-k subarray questions in O(n).",
    concept: [
      "Think of a fixed-width magnifying glass dragged across a line of text: as it moves one character right, one new character enters and one old character leaves its view, so you never re-read the middle. A sliding window is that glass over an array — you update an aggregate (sum, distinct count, frequency map) incrementally instead of recomputing each window from scratch.",
      "Windows come in three shapes: fixed size, variable size that grows/shrinks to stay valid, and counting windows that use 'at most k' arithmetic.",
      "Both pointers move in the same direction (left and right both advance), which distinguishes it from opposite-direction two pointers.",
    ],
    motivation: [
      "Brute force for 'longest substring without repeats' tests every substring and rescans it for duplicates. Example: `s = \\\"abcabcbb\\\"` re-examines overlapping ranges — `O(n^2)` or worse.",
      "Maintain a window `[left, right]` plus a set/count of its characters; extend `right`, and when a duplicate appears, advance `left` until the window is valid again.",
      "Each character enters and leaves the window at most once, so the work is `O(n)`. The repeated scanning of overlapping ranges is exactly what the window removes.",
      "For 'exactly k distinct', compute `atMost(k) - atMost(k-1)`: each at-most count is a single monotone window, and their difference isolates the exact case.",
    ],
    whenUse: [
      "If you see 'subarray/substring of size k', think a fixed-size window with an aggregate updated on each slide.",
      "If you see 'longest subarray such that <condition stays valid>', think grow `right`, shrink `left` when invalid.",
      "If you see 'shortest subarray with sum/condition ≥ target', think shrink from the left once the condition holds.",
      "If you see 'count subarrays with exactly k …', think `atMost(k) - atMost(k-1)`.",
      "If you see 'at most k distinct/odd/zeros', think a frequency map plus a shrink condition.",
    ],
    coreIdea: [
      "Choose the window type: fixed size, longest-valid, shortest-valid, or counting.",
      "Extend the window by moving `right` and folding `nums[right]` into the aggregate.",
      "While the window violates its condition, move `left` and remove `nums[left]` from the aggregate.",
      "Record the answer at the moment the window is valid (length, count, or aggregate).",
      "For exact-k counts, subtract two at-most windows.",
      "Ensure every element enters and leaves the aggregate exactly once.",
    ],
    invariant:
      "**Window-Validity Invariant.** At the point where the answer is read, the window `[left, right]` satisfies the problem's condition (and, for longest/at-most windows, `[left-1, right]` would not). Why this gives the right count: because `left` only ever advances, each `right` is paired with the unique smallest valid `left`, so every maximal/at-most window is counted once and the linear scan is exhaustive.",
    variants: [
      "Fixed-size window: slide a width-k window, add the entering and drop the leaving element.",
      "Longest valid window: grow `right`, shrink `left` only when the condition breaks.",
      "Shortest valid window: shrink `left` aggressively while the condition still holds.",
      "At-most-k window: keep a frequency map; shrink while distinct/violations exceed k.",
      "Exactly-k via at-most: `atMost(k) - atMost(k-1)`.",
    ],
    templateKeys: ["longest_window", "shortest_window", "exactly_k_distinct"],
    complexity: [
      "All variants are O(n) time because each index is added and removed once; the hidden cost is the per-step map/aggregate update (O(1) amortized for hash maps, O(alphabet) for fixed arrays).",
      "Exactly-k runs two at-most passes, still O(n); the hidden cost is doing the subtraction correctly when k = 0.",
      "Space is O(window) for the frequency structure — O(1) for a fixed alphabet, O(k) otherwise.",
    ],
    mistakes: [
      "Recording the answer before restoring validity. Counter-example: for 'longest with at most k zeros', taking `right-left+1` while zeros > k counts an invalid window — shrink first.",
      "Wrong shrink condition for shortest vs. longest. Counter-example: using 'shrink while invalid' for a shortest-window problem never minimizes; shortest windows shrink while still valid.",
      "Forgetting `atMost(-1) = 0`. Counter-example: exactly-0-distinct calls `atMost(-1)`; returning anything but 0 corrupts the subtraction.",
      "Not removing the leaving element from the map. Counter-example: stale counts make distinct-count checks wrong and the window never shrinks.",
    ],
    practice: [
      {
        id: 209,
        title: "Minimum Size Subarray Sum",
        slug: "minimum-size-subarray-sum",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "shortest valid window",
        why: "Shrink-while-valid to minimize length once sum ≥ target.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 3,
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "longest valid window",
        why: "Grow right, shrink left on a repeat — the canonical longest window.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 567,
        title: "Permutation in String",
        slug: "permutation-in-string",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "fixed-size frequency window",
        why: "Fixed-width window comparing character frequencies.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 424,
        title: "Longest Repeating Character Replacement",
        slug: "longest-repeating-character-replacement",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "window minus max-frequency",
        why: "Validity uses window length minus the most frequent count.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 1004,
        title: "Max Consecutive Ones III",
        slug: "max-consecutive-ones-iii",
        rating: 1656,
        difficulty: "Medium",
        subPattern: "at-most-k zeros window",
        why: "Longest window with a budget of k flips.",
        order: 5,
        tier: "Advanced Practice",
      },
      {
        id: 992,
        title: "Subarrays with K Different Integers",
        slug: "subarrays-with-k-different-integers",
        rating: 2210,
        difficulty: "Hard",
        subPattern: "exactly-k via at-most",
        why: "The defining 'atMost(k) - atMost(k-1)' counting trick.",
        order: 6,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Is the target object contiguous (a subarray/substring), so a window even applies?",
      "Do I want longest (shrink only when invalid) or shortest (shrink while valid)?",
      "Is the quantity monotone as the window grows, so `left` never needs to move backward?",
      "Is this an exact-count question better expressed as a difference of two at-most counts?",
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
    tagline:
      "Build candidates incrementally and undo the last choice, pruning whole branches of the recursion tree early.",
    concept: [
      "Backtracking is exploring a hedge maze while unrolling a string behind you: at each junction you pick a path, and when you hit a dead end you follow the string back to the last junction and try the next path. The string is the call stack; 'undo the last choice' is rewinding one step. You never teleport — you always return to exactly where the last decision was made.",
      "Formally you grow a partial solution one choice at a time; when it is complete you record it, and when it cannot lead anywhere valid you abandon (prune) the branch.",
      "The mental model is a recursion tree whose nodes are partial states and whose edges are choices; pruning deletes entire subtrees before exploring them.",
    ],
    motivation: [
      "Brute force generates every full candidate and filters. Example: all permutations of `[1,2,3]` could be built by nesting three loops, but that hard-codes the depth and re-derives shared prefixes.",
      "Instead, recurse: choose an unused element, recurse on the rest, then unchoose. The shared prefix `[1,2]` is built once and reused for both `[1,2,3]` and (after backtracking) any sibling.",
      "Pruning is where backtracking beats enumeration: in Combination Sum, sorting lets you `break` as soon as a candidate exceeds the remaining target, deleting the whole tail of that branch. Each pruning rule removes a subtree from the recursion tree, shrinking it from the full product space toward only the live region.",
      "So the recursion tree visibly changes shape with each rule added: a feasibility prune cuts branches that cannot complete; a bound prune cuts branches that cannot beat the best so far.",
    ],
    whenUse: [
      "If you see 'generate all permutations/combinations/subsets', think a recursion tree with choose/recurse/unchoose.",
      "If you see 'partition the string/array into valid pieces', think recurse on each valid prefix cut.",
      "If you see 'place items subject to constraints' (N-Queens, Sudoku), think choose a slot, validate, recurse, undo.",
      "If you see small n with 'count/find all solutions', think backtracking with aggressive pruning.",
      "If a greedy or DP does not apply because you truly need every solution, think backtracking.",
    ],
    coreIdea: [
      "Define the partial state and what 'complete' means.",
      "At each step, enumerate the legal choices from the current state.",
      "Apply a choice (mutate the partial state).",
      "Recurse, then undo the choice exactly (restore the state).",
      "Prune: skip choices that violate feasibility or cannot beat the current best.",
      "Record the candidate when the state is complete.",
    ],
    invariant:
      "**Clean-State Invariant.** After a recursive call returns, the partial state is byte-for-byte what it was before the call. Why this makes the search correct: each branch explores its subtree from a pristine prefix, so sibling branches never see leftovers from one another; combined with 'every legal choice is tried', the tree is explored exhaustively and without contamination. A bug here (forgetting to undo) silently leaks state into siblings and produces phantom solutions.",
    variants: [
      "Permutations: track a `used[]` set; order matters.",
      "Combinations/subsets: carry a `start` index so each element is considered once and sets stay unique.",
      "Choose-with-repetition (Combination Sum): recurse staying at the same index; sort for the `break` prune.",
      "Grid/placement search (Word Search, N-Queens): mark a cell/column used, recurse, unmark.",
      "Feasibility vs. bound pruning: cut branches that cannot complete vs. cannot beat the best.",
    ],
    templateKeys: [
      "backtrack_permute",
      "backtrack_subsets",
      "backtrack_combination_sum",
    ],
    complexity: [
      "Output-sensitive: permutations are O(n · n!), subsets O(n · 2^n), because that many candidates exist; the hidden cost is the O(length) copy made each time a complete candidate is recorded.",
      "Pruning changes the constant and often the practical base, but not the worst case when all candidates are valid.",
      "Space is O(depth) for the recursion stack plus O(state) for the partial solution.",
    ],
    mistakes: [
      "Forgetting to undo a choice. Counter-example: in permutations, not resetting `used[i] = false` after recursion makes later siblings see the element as taken, dropping valid permutations.",
      "Re-emitting duplicate sets. Counter-example: subsets of `[1,2,2]` without sorting + 'skip equal sibling at the same depth' yields `[1,2]` twice.",
      "Pruning without sorting. Counter-example: the `break` in Combination Sum only works because candidates are sorted; on unsorted input it wrongly stops early.",
      "Copying the wrong object. Counter-example: pushing a reference to the mutable `cur` instead of a copy makes every recorded solution mutate to the final empty state.",
    ],
    practice: [
      {
        id: 46,
        title: "Permutations",
        slug: "permutations",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "used[] permutations",
        why: "The base permutation recursion with choose/undo.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 78,
        title: "Subsets",
        slug: "subsets",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "start-index subsets",
        why: "Every recursion-tree node is a subset.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 77,
        title: "Combinations",
        slug: "combinations",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "k-of-n combinations",
        why: "Start index plus a size target.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 39,
        title: "Combination Sum",
        slug: "combination-sum",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "reuse + sorted prune",
        why: "Choose-with-repetition and the canonical break-prune.",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 40,
        title: "Combination Sum II",
        slug: "combination-sum-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "skip duplicate siblings",
        why: "Each number used once, with duplicate-branch pruning.",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 90,
        title: "Subsets II",
        slug: "subsets-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "dedup subsets",
        why: "Subsets with duplicate elements; sort then skip equal siblings.",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 47,
        title: "Permutations II",
        slug: "permutations-ii",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "dedup permutations",
        why: "Permutations with duplicate-branch pruning at each depth.",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 79,
        title: "Word Search",
        slug: "word-search",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "grid DFS with backtrack",
        why: "Mark/unmark cells while matching a path.",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 131,
        title: "Palindrome Partitioning",
        slug: "palindrome-partitioning",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "recurse on valid prefix cut",
        why: "Cut at each palindromic prefix and recurse on the rest.",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 216,
        title: "Combination Sum III",
        slug: "combination-sum-iii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "bounded digits + sum",
        why: "Two constraints (count and sum) prune together.",
        order: 10,
        tier: "Advanced Practice",
      },
      {
        id: 51,
        title: "N-Queens",
        slug: "n-queens",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "column/diagonal feasibility prune",
        why: "Classic placement search with O(1) conflict checks.",
        order: 11,
        tier: "Challenge Practice",
      },
      {
        id: 37,
        title: "Sudoku Solver",
        slug: "sudoku-solver",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "constraint propagation + backtrack",
        why: "Heavy pruning makes an exponential search practical.",
        order: 12,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Do I genuinely need all solutions (or all that satisfy a constraint), not just one optimum?",
      "Can I define a partial state plus the legal choices that extend it?",
      "What feasibility or bound check lets me prune a branch before fully exploring it?",
      "Do I undo every choice so siblings start from a clean state, and copy (not alias) recorded solutions?",
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
    title: "Hash Map / Frequency Counting",
    group: "Core Array/String Patterns",
    icon: "Hash",
    tagline:
      "Trade memory for time: store seen values, complements, prefix states, or counts for O(1) lookups.",
    concept: [
      "A hash map is a coat-check counter: you hand over an item and get an instant claim ticket, and later you retrieve it in one step instead of searching every hook. In algorithms you check in the facts you have already seen — a value, a complement, a running prefix sum, a character count — so a future question becomes a single O(1) lookup instead of a re-scan.",
      "The recurring move is: as you scan, ask 'have I seen what I need?' and simultaneously 'check in' the current element for future steps.",
      "Frequency counting is the same idea applied to multiplicities: a map from key to count answers anagram, majority, and remainder questions directly.",
    ],
    motivation: [
      "Brute force for Two Sum tests every pair for `nums[i] + nums[j] == target` — `O(n^2)`. Example: `nums = [2,7,11,15]`, target 9 scans pairs.",
      "Check in each value as you go; for the current `x` look up `target - x`. When you reach 7 you instantly find 2 was checked in — `O(n)`.",
      "For 'count subarrays with sum k', check in each prefix sum's frequency; the number of earlier prefixes equal to `prefix - k` is the count of qualifying subarrays ending here. The repeated inner summation collapses to a map lookup.",
      "For grouping/anagrams, the key is a canonical signature (sorted string or a 26-count tuple), and the map buckets matching items in one pass.",
    ],
    whenUse: [
      "If you see 'find two elements with property X', think store complements in a map.",
      "If you see 'count subarrays/substrings with sum or property k', think prefix value → frequency.",
      "If you see 'group/anagram/duplicate', think a canonical key → bucket or count.",
      "If you see 'first unique', 'top k frequent', or 'majority', think a frequency map.",
      "If you see counting by remainder or parity, think bucket by `value % m`.",
    ],
    coreIdea: [
      "Decide what to store as the key: a value, a complement, a prefix state, or a canonical signature.",
      "As you scan, first query the map for the fact you need.",
      "Then insert/update the current element so future steps can use it.",
      "For counting, accumulate using the stored frequency (often before incrementing).",
      "Seed the map for the empty prefix (`count[0] = 1`) when prefix sums are involved.",
      "Pick a hashable key type and guard against overflow in prefix sums.",
    ],
    invariant:
      "**Seen-Set Invariant.** When processing index `i`, the map reflects exactly the elements/prefixes from indices `< i` (and nothing from `i` onward). Why this prevents double counting: querying before inserting guarantees a pair/subarray is counted only with strictly-earlier partners, so each qualifying pair is counted once, and self-pairing (`i` with itself) is impossible.",
    variants: [
      "Two-sum / complement search: map value → index, query `target - x`.",
      "Prefix sum + hash map: map prefix → count for subarray-sum and divisibility questions.",
      "Anagram grouping: map a sorted/key signature → list of words.",
      "Sliding window with a frequency map: counts of the current window's elements.",
      "Counting by remainder/property: bucket by `value % m` or by a derived feature.",
    ],
    templateKeys: ["hashmap_two_sum", "prefix_count_hashmap"],
    complexity: [
      "Most patterns are O(n) average; the hidden cost is the hash itself — worst-case O(n) per operation under adversarial collisions, and a large constant versus array indexing.",
      "Anagram grouping is O(n · L log L) when keys are sorted strings of length L; using a 26-count key removes the log L factor.",
      "Space is O(distinct keys), which can equal O(n).",
    ],
    mistakes: [
      "Inserting before querying. Counter-example: in Two Sum with a repeated value, inserting `nums[i]` first lets it pair with itself, returning `[i, i]`.",
      "Forgetting the empty-prefix seed. Counter-example: 'subarray sum equals k' that starts at index 0 is missed unless `count[0] = 1`.",
      "Overflowing the prefix key. Counter-example: prefix sums over `10^5` large values exceed `int`; use `long long` keys.",
      "Using a non-canonical group key. Counter-example: keying anagrams by the raw string puts `eat` and `tea` in different buckets — sort the key or use a count signature.",
    ],
    practice: [
      {
        id: 1,
        title: "Two Sum",
        slug: "two-sum",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "complement lookup",
        why: "The archetype: query the complement before inserting.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 49,
        title: "Group Anagrams",
        slug: "group-anagrams",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "canonical key bucketing",
        why: "Map a sorted/count signature to a bucket.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 242,
        title: "Valid Anagram",
        slug: "valid-anagram",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "frequency equality",
        why: "Compare two 26-count frequency maps.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 560,
        title: "Subarray Sum Equals K",
        slug: "subarray-sum-equals-k",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "prefix sum + map",
        why: "Count earlier prefixes equal to prefix - k.",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 974,
        title: "Subarray Sums Divisible by K",
        slug: "subarray-sums-divisible-by-k",
        rating: 1676,
        difficulty: "Medium",
        subPattern: "prefix remainder buckets",
        why: "Count by prefix remainder modulo k.",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 525,
        title: "Contiguous Array",
        slug: "contiguous-array",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "first index of a prefix state",
        why: "Map a +1/-1 prefix to its earliest index.",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 454,
        title: "4Sum II",
        slug: "4sum-ii",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "split + complement map",
        why: "Meet-in-the-middle: count pair sums in a map.",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 128,
        title: "Longest Consecutive Sequence",
        slug: "longest-consecutive-sequence",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "set membership runs",
        why: "Start a run only at numbers with no predecessor in the set.",
        order: 8,
        tier: "Challenge Practice",
      },
      {
        id: 1248,
        title: "Count Number of Nice Subarrays",
        slug: "count-number-of-nice-subarrays",
        rating: 1624,
        difficulty: "Medium",
        subPattern: "prefix parity count",
        why: "Count odd-number prefixes with a frequency map.",
        order: 9,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "What single fact, if I had it in O(1), would collapse the inner loop — a complement, a prefix count, a signature?",
      "Should I query the map before inserting the current element to avoid self/forward pairing?",
      "For prefix-sum counting, did I seed the empty prefix and pick an overflow-safe key type?",
      "Is my group/bucket key truly canonical for all members of a group?",
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
    title: "Sorting as a Tool",
    group: "Core Array/String Patterns",
    icon: "ArrowDownWideNarrow",
    tagline:
      "Reorder data first so a later scan, binary search, greedy choice, or comparator does the real work.",
    concept: [
      "Sorting is tidying a desk before you start: once papers are in order, finding, pairing, and grouping become trivial glances instead of full searches. You rarely sort for its own sake — you sort so that the *next* step (a linear scan, a binary search, a greedy sweep) can assume order and become simple and correct.",
      "The skill is choosing the right key/comparator so the property you need becomes adjacency, monotonicity, or a clean boundary.",
      "A custom comparator can encode surprisingly rich logic — 'which arrangement is better' — proven correct by an exchange argument.",
    ],
    motivation: [
      "Brute force for 'merge overlapping intervals' compares every pair for overlap — `O(n^2)`. Example: `[[1,3],[2,6],[8,10]]`.",
      "Sort by start first; now overlapping intervals are adjacent, so a single left-to-right scan that extends or opens an interval suffices — `O(n log n)`.",
      "The order converts a global pairwise question into a local neighbor question, which is the repeated work eliminated.",
      "For 'largest number from concatenation', the right tool is a comparator (`a+b > b+a`) — sorting by it directly yields the answer, justified by an exchange argument.",
    ],
    whenUse: [
      "If you see overlap/interval problems, think sort by start (or end) then sweep.",
      "If you see 'pair/triple with a value condition', think sort then two pointers or binary search.",
      "If you see 'arrange to optimize concatenation/scheduling', think a custom comparator + exchange proof.",
      "If you see 'k-th smallest/closest' on static data, think sort then index/binary search.",
      "If values are small and bounded, think counting/bucket sort for O(n).",
    ],
    coreIdea: [
      "Identify the property the next step needs (adjacency, monotonicity, a boundary).",
      "Choose the sort key or comparator that creates that property.",
      "Sort.",
      "Run the cheap follow-up: linear scan, two pointers, binary search, or greedy.",
      "If using a comparator, confirm it is a strict weak ordering (consistent, transitive).",
      "Consider counting/bucket sort when the value domain is small.",
    ],
    invariant:
      "**Order-Enables-Locality Invariant.** After sorting, the property the follow-up relies on holds between adjacent (or monotonically scanned) elements. Why this is the whole point: a correct comparator makes 'better globally' equivalent to 'better against your neighbor', so a single ordered pass — which only ever inspects neighbors or moves monotonically — reaches the global answer.",
    variants: [
      "Sort-then-scan: merge intervals, detect duplicates, group adjacents.",
      "Sort-then-two-pointers: pair/triple sum conditions on values.",
      "Sort-then-binary-search: k-th / closest / feasibility on ordered data.",
      "Custom comparator: concatenation order, scheduling by ratio, multi-key tie-breaks.",
      "Counting / bucket sort: small bounded value domain for O(n).",
    ],
    templateKeys: ["exchange_swap_sort", "exchange_greedy"],
    complexity: [
      "The sort is O(n log n) and usually dominates; the hidden cost is the comparator — a heavy comparator (string concatenation, tuple build) multiplies every comparison by its own cost.",
      "Counting/bucket sort is O(n + range) when the domain is small, trading memory for the log factor.",
      "The follow-up scan/search is O(n) or O(n log n), rarely the bottleneck.",
    ],
    mistakes: [
      "An inconsistent comparator. Counter-example: a comparator that is not a strict weak ordering (e.g. returns true for both `a<b` and `b<a`) causes undefined behavior / crashes in std::sort.",
      "Sorting when original indices matter. Counter-example: returning indices (as in Two Sum) after sorting loses the mapping unless you sort index pairs.",
      "Stability assumptions. Counter-example: relying on equal elements keeping input order with `std::sort` (not stable) breaks multi-pass schemes; use `stable_sort`.",
      "Overflow in the comparator/key. Counter-example: comparing `a*b` for ratio scheduling overflows `int`; compare cross-products in `long long` or as `a+b` strings.",
    ],
    practice: [
      {
        id: 56,
        title: "Merge Intervals",
        slug: "merge-intervals",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "sort by start + sweep",
        why: "The archetype of sort-then-local-scan.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 179,
        title: "Largest Number",
        slug: "largest-number",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "custom concat comparator",
        why: "Comparator (a+b > b+a) with an exchange-argument proof.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 75,
        title: "Sort Colors",
        slug: "sort-colors",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "counting / Dutch flag",
        why: "Bounded domain → counting or three-pointer one pass.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 274,
        title: "H-Index",
        slug: "h-index",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "sort then scan threshold",
        why: "Sort descending, find the crossover index.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 164,
        title: "Maximum Gap",
        slug: "maximum-gap",
        rating: 1850,
        difficulty: "Medium",
        subPattern: "bucket sort pigeonhole",
        why: "Officially Medium but tough: linear-time gap via bucketing, not comparison sort.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "What property would make the follow-up trivial — adjacency, monotonicity, or a clean boundary?",
      "Which key or comparator creates that property, and is the comparator a valid strict weak ordering?",
      "Do I need original indices or input order preserved (so I must keep pairs or use a stable sort)?",
      "Is the value domain small enough that counting/bucket sort beats O(n log n)?",
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
    title: "Tree DFS and BFS",
    group: "Tree Patterns",
    icon: "TreePine",
    tagline:
      "Choose the traversal order and decide what each node returns vs. receives to solve rooted-tree problems cleanly.",
    concept: [
      "A tree is a company org chart, and traversing it is asking a question of everyone. Depth-first is following one chain of command all the way down before backing up; breadth-first is polling the whole org level by level. Most tree code is just one of these walks plus a decision about what information flows up (a subtree summary) versus down (context from ancestors).",
      "DFS comes in preorder (act before children), inorder (act between children, meaningful for BSTs), and postorder (act after children, needed when a node depends on its subtree).",
      "BFS visits level by level using a queue, which is the right tool for shortest-depth and per-level questions.",
    ],
    motivation: [
      "Brute force for 'diameter' (longest path between any two nodes) could test all node pairs and compute each path — far too slow. Example: a balanced tree of n nodes.",
      "Postorder DFS instead returns each subtree's height upward; at every node the best path through it is `leftHeight + rightHeight`, updated into a global max in one traversal — `O(n)`.",
      "The repeated work (recomputing shared path segments) vanishes because each subtree fact is computed once and reused by its parent.",
      "The key design choice is return-value vs. parameter: a height flows *up* as a return value, while a running path-sum from the root flows *down* as a parameter.",
    ],
    whenUse: [
      "If you see 'depth/height/diameter/subtree sum', think postorder DFS returning a subtree fact.",
      "If you see 'BST in sorted order / k-th smallest', think inorder DFS.",
      "If you see 'level order / per-level / minimum depth / right-side view', think BFS with a queue.",
      "If you see 'path from root with running context', think DFS passing an accumulator parameter down.",
      "If you see 'lowest common ancestor', think postorder DFS combining child signals.",
    ],
    coreIdea: [
      "Decide DFS (one chain at a time) or BFS (level by level).",
      "For DFS, pick the order: preorder, inorder, or postorder by when the node must act.",
      "Decide what each node returns to its parent (a subtree summary).",
      "Decide what each node receives from its parent (ancestor context).",
      "Combine child results (and/or the parameter) into this node's answer.",
      "Update any global answer at the node where the full path/subtree is known.",
    ],
    invariant:
      "**Subtree-Complete Invariant.** When a postorder DFS finishes a node, the value it returns correctly summarizes that node's entire subtree. Why this composes: each parent combines already-correct child summaries, so by induction from the leaves every node's answer is correct, and a single O(n) pass suffices. For BFS the parallel invariant is that the queue holds exactly one full level at a time.",
    variants: [
      "Preorder: act on a node before its children (copy/serialize top-down).",
      "Inorder: left, node, right — yields BST values in sorted order.",
      "Postorder: children before node — heights, sums, diameter, LCA.",
      "Level-order BFS: process the queue one frozen level at a time.",
      "Return-value vs. parameter: subtree fact up vs. ancestor context down.",
    ],
    templateKeys: ["tree_dfs", "tree_bfs_levels"],
    complexity: [
      "Every traversal is O(n) time since each node is visited once; the hidden cost is the recursion stack, O(h) where h is the height — O(n) for a degenerate (skewed) tree, which can overflow the stack.",
      "BFS uses O(width) queue space, up to O(n) for the widest level.",
      "Per-node work beyond O(1) (e.g. building strings in serialization) multiplies the total accordingly.",
    ],
    mistakes: [
      "Wrong traversal order. Counter-example: computing a node's value before its children (preorder) for diameter gives garbage — heights must be known first (postorder).",
      "Not freezing the BFS level size. Counter-example: looping `while(!q.empty())` and reading `q.size()` mid-loop after pushing children merges levels together.",
      "Null-child handling. Counter-example: dereferencing `node->left->val` without a null check crashes on leaves; guard every child access.",
      "Confusing return value with parameter. Counter-example: trying to push a root-to-node path sum upward as a return value double-counts; pass it down as a parameter instead.",
    ],
    practice: [
      {
        id: 94,
        title: "Binary Tree Inorder Traversal",
        slug: "binary-tree-inorder-traversal",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "inorder DFS",
        why: "The base inorder walk (recursive and iterative).",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 102,
        title: "Binary Tree Level Order Traversal",
        slug: "binary-tree-level-order-traversal",
        rating: 1300,
        difficulty: "Medium",
        subPattern: "level-order BFS",
        why: "The base BFS with frozen level size.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 104,
        title: "Maximum Depth of Binary Tree",
        slug: "maximum-depth-of-binary-tree",
        rating: 1100,
        difficulty: "Easy",
        subPattern: "postorder height",
        why: "Return a subtree fact (height) upward.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 543,
        title: "Diameter of Binary Tree",
        slug: "diameter-of-binary-tree",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "height + global best",
        why: "Postorder height with a global path update.",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 236,
        title: "Lowest Common Ancestor of a Binary Tree",
        slug: "lowest-common-ancestor-of-a-binary-tree",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "postorder signal merge",
        why: "Combine child found-signals at each node.",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 112,
        title: "Path Sum",
        slug: "path-sum",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "downward accumulator",
        why: "Pass remaining target down as a parameter.",
        order: 6,
        tier: "Core Practice",
      },
      {
        id: 113,
        title: "Path Sum II",
        slug: "path-sum-ii",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "DFS with backtracking path",
        why: "Carry and undo the path while recursing.",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 199,
        title: "Binary Tree Right Side View",
        slug: "binary-tree-right-side-view",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "BFS last-of-level",
        why: "Take the last node of each BFS level.",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 124,
        title: "Binary Tree Maximum Path Sum",
        slug: "binary-tree-maximum-path-sum",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "postorder gain + global best",
        why: "Return best downward gain; update a global through-node max.",
        order: 9,
        tier: "Advanced Practice",
      },
      {
        id: 297,
        title: "Serialize and Deserialize Binary Tree",
        slug: "serialize-and-deserialize-binary-tree",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "preorder with null markers",
        why: "Round-trip a tree via preorder encoding.",
        order: 10,
        tier: "Challenge Practice",
      },
      {
        id: 987,
        title: "Vertical Order Traversal of a Binary Tree",
        slug: "vertical-order-traversal-of-a-binary-tree",
        rating: 1676,
        difficulty: "Hard",
        subPattern: "BFS/DFS with (col,row) keys",
        why: "Traversal plus a careful multi-key ordering.",
        order: 11,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Does a node's answer depend on its subtree (postorder), its ancestors (parameter down), or its position in sorted order (inorder)?",
      "Is this a per-level or shortest-depth question, signalling BFS over DFS?",
      "What exactly does each node return to its parent, and what does it receive?",
      "Could the tree be skewed, risking O(n) recursion depth and a stack overflow?",
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
    title: "Graph BFS and DFS",
    group: "Graph Patterns",
    icon: "Workflow",
    tagline:
      "Explore vertices with a visited set; BFS for unweighted shortest paths, DFS for connectivity and components.",
    concept: [
      "Exploring a graph is like exploring a cave system with chalk: every chamber you enter you mark with chalk so you never wander in circles. The chalk is the visited set, and it is the single discipline that separates a finite traversal from an infinite loop. DFS dives down one tunnel as far as it goes; BFS expands like a ripple, reaching all chambers one step away, then two steps, and so on.",
      "Because BFS reaches nodes in nondecreasing distance, it gives shortest paths in unweighted graphs; DFS naturally exposes connectivity and component structure.",
      "Grids are graphs in disguise: each cell is a vertex connected to its neighbors, so flood fill and shortest grid paths are just DFS/BFS.",
    ],
    motivation: [
      "Brute force for 'number of islands' might rescan the grid repeatedly to group cells. Example: a grid of land/water cells.",
      "Instead, scan once; at each unvisited land cell, start a DFS/BFS that chalks the whole connected blob, incrementing a counter per blob — `O(rows·cols)`.",
      "The visited marking removes the repeated re-exploration of the same region, which is the wasted work.",
      "For shortest path in an unweighted maze, BFS from the start reaches the target at the first moment it is dequeued, because earlier layers are strictly closer.",
    ],
    whenUse: [
      "If you see 'connected components / number of groups', think DFS or BFS flooding each component once.",
      "If you see 'shortest steps in an unweighted graph/grid', think BFS layer by layer.",
      "If you see 'flood fill / number of islands / regions', think grid DFS marking visited in place.",
      "If you see 'can A reach B / is it connected', think a single DFS/BFS with a visited set.",
      "If you see 'spread from multiple sources simultaneously', think multi-source BFS.",
    ],
    coreIdea: [
      "Model the problem as vertices and edges (grids: cells and 4/8 neighbors).",
      "Pick BFS (queue) for shortest unweighted distance, DFS (stack/recursion) for reachability/components.",
      "Mark a node visited when you first reach it, before exploring its neighbors.",
      "Push/recurse only into unvisited, in-bounds neighbors.",
      "Accumulate the answer: component count, distance layers, or reachable set.",
      "For BFS distance, expand one full layer per step.",
    ],
    invariant:
      "**Visit-Once Invariant.** Each vertex is enqueued/entered at most once, the first time it is reached. Why this matters twice over: it bounds total work at O(V + E) by preventing re-exploration, and for BFS it guarantees the first arrival is along a shortest path, since vertices are discovered in nondecreasing distance order. Marking visited *after* dequeuing instead of on enqueue breaks the bound by allowing duplicates in the queue.",
    variants: [
      "DFS connected components: count blobs by flooding each once.",
      "BFS shortest path (unweighted): layer-by-layer distance from a source.",
      "Grid flood fill: mark cells visited in place while expanding.",
      "Cycle detection: DFS colors / union-find on undirected graphs.",
      "Multi-source BFS: seed every source at distance 0.",
    ],
    templateKeys: ["grid_dfs", "multi_source_bfs"],
    complexity: [
      "BFS and DFS are O(V + E); for a grid that is O(rows·cols) since each cell has O(1) neighbors. The hidden cost is the visited structure and, for BFS, the queue — both O(V).",
      "DFS recursion depth is O(V) worst case (a long path/snake grid), risking stack overflow; an explicit stack avoids it.",
      "Edge representation matters: adjacency list is O(V+E) space, an adjacency matrix is O(V^2).",
    ],
    mistakes: [
      "Marking visited too late. Counter-example: in BFS, marking a node visited only when dequeued lets it be enqueued by several neighbors first, blowing up the queue and time.",
      "Using DFS for unweighted shortest path. Counter-example: DFS may reach the target via a long path first; only BFS guarantees minimal steps.",
      "Forgetting bounds/visited on grids. Counter-example: recursing off the edge or into a visited cell causes infinite loops or out-of-range access.",
      "Wrong neighbor set. Counter-example: using 8-directional moves when the problem means 4-directional (or vice versa) changes connectivity and the answer.",
    ],
    practice: [
      {
        id: 200,
        title: "Number of Islands",
        slug: "number-of-islands",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "grid flood fill",
        why: "The archetypal connected-components flood fill.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 695,
        title: "Max Area of Island",
        slug: "max-area-of-island",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "flood fill with size",
        why: "Flood fill returning the size of each blob.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 733,
        title: "Flood Fill",
        slug: "flood-fill",
        rating: 1200,
        difficulty: "Easy",
        subPattern: "recolor region",
        why: "Minimal flood fill from a seed cell.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 994,
        title: "Rotting Oranges",
        slug: "rotting-oranges",
        rating: 1433,
        difficulty: "Medium",
        subPattern: "multi-source BFS",
        why: "Simultaneous spread measured in BFS layers.",
        order: 4,
        tier: "Core Practice",
      },
      {
        id: 547,
        title: "Number of Provinces",
        slug: "number-of-provinces",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "components on adjacency",
        why: "Count components from an adjacency matrix.",
        order: 5,
        tier: "Core Practice",
      },
      {
        id: 133,
        title: "Clone Graph",
        slug: "clone-graph",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "DFS/BFS with a clone map",
        why: "Traverse while building a node→copy map.",
        order: 6,
        tier: "Advanced Practice",
      },
      {
        id: 130,
        title: "Surrounded Regions",
        slug: "surrounded-regions",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "border-anchored flood",
        why: "Flood from the border to mark survivors.",
        order: 7,
        tier: "Advanced Practice",
      },
      {
        id: 417,
        title: "Pacific Atlantic Water Flow",
        slug: "pacific-atlantic-water-flow",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "reverse reachability from edges",
        why: "Two floods from the ocean borders, then intersect.",
        order: 8,
        tier: "Advanced Practice",
      },
      {
        id: 127,
        title: "Word Ladder",
        slug: "word-ladder",
        rating: 1800,
        difficulty: "Hard",
        subPattern: "implicit-graph BFS",
        why: "Shortest transformation via BFS over word edits.",
        order: 9,
        tier: "Challenge Practice",
      },
      {
        id: 815,
        title: "Bus Routes",
        slug: "bus-routes",
        rating: 1964,
        difficulty: "Hard",
        subPattern: "BFS over routes",
        why: "Model routes (not stops) as BFS nodes.",
        order: 10,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Is the answer about distance/steps (→ BFS) or about reachability/components (→ DFS)?",
      "What are the vertices and edges — is this secretly a grid or an implicit graph?",
      "Am I marking visited at the right moment (on enqueue for BFS) to keep each node once?",
      "Are my neighbor moves and bounds checks exactly the problem's (4- vs. 8-directional)?",
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
    title: "Union-Find (DSU)",
    group: "Graph Patterns",
    icon: "Combine",
    tagline:
      "Maintain disjoint sets with near-constant union and find for dynamic connectivity and grouping.",
    concept: [
      "Union-Find tracks friend groups at a growing party: when two people are introduced, their whole groups merge, and to check if two people are connected you just ask whether they have the same group leader. Each set is a tree whose root is the leader; `find` walks to the root, `union` links one root under another. Two optimizations keep it nearly O(1): path compression flattens the walk, and union by rank keeps trees shallow.",
      "It excels at *incremental* connectivity — edges only get added — where recomputing components from scratch each time would be wasteful.",
      "The structure answers 'are these two in the same set?' and 'how many sets are there?' as the graph grows.",
    ],
    motivation: [
      "Brute force for 'are a and b connected after these unions' reruns a BFS/DFS per query — `O(query · (V+E))`. Example: many connectivity queries interleaved with edge additions.",
      "Union-Find answers each `find` in near-O(1) amortized after compression, so the whole sequence is almost linear.",
      "The repeated re-traversal of the same components is replaced by reading a representative root.",
      "Counting components is free: start at V, decrement on each successful union.",
    ],
    whenUse: [
      "If you see 'are these connected / same group' under added edges, think DSU.",
      "If you see 'count connected components / provinces / friend circles', think DSU component counter.",
      "If you see 'detect a cycle while adding edges' (undirected), think union returning false on an existing pair.",
      "If you see 'redundant edge / build a forest', think DSU rejecting the edge that joins an existing set.",
      "If a problem is naturally offline and edges can be added in reverse, think DSU on the reversed timeline.",
    ],
    coreIdea: [
      "Initialize each element as its own set (parent = itself).",
      "`find(x)` follows parents to the root, compressing the path on the way.",
      "`union(a, b)` links the shorter tree under the taller (union by rank).",
      "Maintain a component counter, decremented on each successful union.",
      "Answer connectivity by comparing roots.",
      "For offline problems, process unions in the order that makes the structure monotone.",
    ],
    invariant:
      "**Same-Root Invariant.** Two elements are in the same set if and only if `find` returns the same root for both. Why operations preserve it: `union` only ever links one root to another (never splits), so connectivity grows monotonically and is never falsely reported, while path compression changes parents but never the root identity of a set.",
    variants: [
      "Connectivity queries: compare roots after a series of unions.",
      "Component counting: track the number of distinct sets.",
      "Cycle detection on undirected graphs: a union that finds equal roots is a cycle.",
      "Weighted/with-size DSU: store set sizes or relative offsets at the root.",
      "Rollback / offline DSU: undo unions to answer queries on a changing graph.",
    ],
    templateKeys: ["union_find", "mst_kruskal"],
    complexity: [
      "With path compression and union by rank, m operations run in O(m · α(n)) where α is the inverse Ackermann function — effectively constant. The hidden cost is that α, while tiny, is not literally O(1), and a naive DSU without both optimizations degrades to O(log n) or O(n) per op.",
      "Space is O(n) for parent (and rank/size) arrays.",
      "Rollback DSU forgoes path compression (to allow undo), trading to O(log n) per op.",
    ],
    mistakes: [
      "Skipping an optimization. Counter-example: union without rank/size on a chain of n unions builds a linked list, making `find` O(n) and the whole thing quadratic.",
      "Comparing parents instead of roots. Counter-example: `parent[a] == parent[b]` is not connectivity; you must compare `find(a) == find(b)`.",
      "Counting components wrong. Counter-example: decrementing the counter even when the two elements were already in the same set over-counts merges.",
      "Using path compression with rollback. Counter-example: compression rewrites ancestors, so naive undo cannot restore them — disable compression when you need rollback.",
    ],
    practice: [
      {
        id: 684,
        title: "Redundant Connection",
        slug: "redundant-connection",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "cycle edge detection",
        why: "The edge whose union finds equal roots closes a cycle.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 547,
        title: "Number of Provinces",
        slug: "number-of-provinces",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "component counting",
        why: "Union adjacencies, count remaining sets.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1319,
        title: "Number of Operations to Make Network Connected",
        slug: "number-of-operations-to-make-network-connected",
        rating: 1633,
        difficulty: "Medium",
        subPattern: "spare edges vs components",
        why: "Need components-1 spare cables to connect everything.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 803,
        title: "Bricks Falling When Hit",
        slug: "bricks-falling-when-hit",
        rating: 2765,
        difficulty: "Hard",
        subPattern: "reverse-time union",
        why: "Process hits in reverse, adding bricks back with DSU.",
        order: 4,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Are edges only added (never removed), making incremental DSU natural — or do I need rollback?",
      "Am I comparing roots via `find`, not raw parent pointers?",
      "Do I use both path compression and union by rank/size to stay near-constant?",
      "Could processing the timeline in reverse turn a deletion problem into an addition problem?",
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
    title: "Segment Tree and Fenwick Tree",
    group: "Range Query and Offline Techniques",
    icon: "Blocks",
    tagline:
      "Answer and update range aggregates in O(log n) by storing partial results over a balanced tree of intervals.",
    concept: [
      "A Fenwick or segment tree is a corporate reporting hierarchy: each manager keeps a running total for their whole team, so a regional total is a few manager reports added up rather than polling every employee. The array is the employees; the tree stores pre-aggregated totals over intervals, so a range query touches O(log n) nodes and an update notifies O(log n) ancestors.",
      "A Fenwick (binary indexed) tree is the compact specialist for prefix sums under point updates; a segment tree is the general-purpose tool that also supports range updates (via lazy propagation) and non-sum aggregates (min, max, gcd).",
      "Both replace the O(n)-per-query brute force with O(log n) by never recomputing a sub-range whose total is already stored.",
    ],
    motivation: [
      "Brute force for 'sum of [l, r] with occasional updates' recomputes the range each query — `O(n)` per query, `O(nq)` total. Example: an array with interleaved updates and range-sum queries.",
      "A Fenwick tree stores partial sums so a prefix sum is O(log n) and an update touches O(log n) cells; a range sum is two prefix queries.",
      "The repeated re-summation of overlapping ranges is replaced by reusing stored interval totals.",
      "When updates themselves cover ranges (add 5 to [l, r]), a segment tree with lazy tags defers the work to O(log n) by marking a node and pushing down only when needed.",
    ],
    whenUse: [
      "If you see point updates with range sum/min/max queries, think Fenwick (sum) or segment tree (any aggregate).",
      "If you see range updates AND range queries together, think segment tree with lazy propagation.",
      "If you see 'count smaller/greater to the right' or inversions, think a Fenwick over compressed values.",
      "If you see offline queries sortable by a threshold, think a Fenwick filled incrementally.",
      "If you only need prefix sums under point updates, prefer Fenwick for its small constant and code size.",
    ],
    coreIdea: [
      "Decide the aggregate (sum, min, max, gcd) and whether updates are point or range.",
      "Choose Fenwick for prefix-sum/point-update simplicity, segment tree for general aggregates or range updates.",
      "Build the tree so each node stores its interval's aggregate.",
      "Query by combining O(log n) canonical nodes that exactly cover the range.",
      "Update by adjusting the affected node(s) and their O(log n) ancestors.",
      "For range updates, store a lazy tag and push it down lazily before recursing.",
    ],
    invariant:
      "**Node-Aggregate Invariant.** Every tree node holds the correct aggregate of its interval, given that pending lazy tags on its ancestors have been pushed down. Why O(log n) suffices: any range decomposes into O(log n) canonical node-intervals whose stored aggregates combine to the answer, and an update changes only the O(log n) nodes covering the touched index — so neither operation ever inspects the whole array.",
    variants: [
      "Fenwick point update + prefix/range sum.",
      "Fenwick for inversion counting over coordinate-compressed values.",
      "Segment tree point update + range min/max/sum.",
      "Segment tree with lazy propagation for range update + range query.",
      "Choosing Fenwick vs. segment tree by aggregate type and update granularity.",
    ],
    templateKeys: [
      "fenwick_basic",
      "segment_tree_lazy",
      "coordinate_compression_fenwick",
    ],
    complexity: [
      "Build is O(n); each query/update is O(log n). The hidden cost in the segment tree is the lazy push-down: forgetting it makes range queries silently wrong, and doing it adds a constant factor versus Fenwick.",
      "Space is O(n) for Fenwick and O(4n) for a recursive segment tree.",
      "Coordinate compression adds an O(n log n) preprocessing step when values are sparse/large.",
    ],
    mistakes: [
      "Forgetting to push lazy tags. Counter-example: querying a child after a range update without pushing the parent's tag returns the stale pre-update sum.",
      "1-indexing mistakes in Fenwick. Counter-example: calling `update`/`query` with a 0-based index without the internal `++i` skips index 0 or reads out of range.",
      "Using Fenwick for non-invertible aggregates. Counter-example: range min cannot be answered by 'prefix minus prefix'; use a segment tree.",
      "Overflow in the aggregate. Counter-example: summing `10^5` values near `10^9` overflows `int`; store sums in `long long`.",
    ],
    practice: [
      {
        id: 307,
        title: "Range Sum Query - Mutable",
        slug: "range-sum-query-mutable",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "point update + range sum",
        why: "The base Fenwick / segment-tree use case.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 315,
        title: "Count of Smaller Numbers After Self",
        slug: "count-of-smaller-numbers-after-self",
        rating: 2200,
        difficulty: "Hard",
        subPattern: "Fenwick over compressed values",
        why: "Inversion-style counting with coordinate compression.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 327,
        title: "Count of Range Sum",
        slug: "count-of-range-sum",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "prefix sums + ordered counting",
        why: "Count prefix-sum pairs within a value band.",
        order: 3,
        tier: "Advanced Practice",
      },
      {
        id: 2179,
        title: "Count Good Triplets in an Array",
        slug: "count-good-triplets-in-an-array",
        rating: 2272,
        difficulty: "Hard",
        subPattern: "two Fenwicks around a middle",
        why: "Enumerate the middle with left/right Fenwick counts.",
        order: 4,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Are updates point or range, and is the query a range aggregate — which decides Fenwick vs. lazy segment tree?",
      "Is the aggregate invertible (sum) so Fenwick works, or order-based (min/max) needing a segment tree?",
      "Do I need coordinate compression because values are large or sparse?",
      "If I use lazy propagation, do I push down before every recursive descent?",
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
    title: "Topological Sort",
    group: "Graph Patterns",
    icon: "Waypoints",
    tagline:
      "Order the vertices of a DAG so every edge points forward; the ordering itself is often the answer.",
    concept: [
      "Topological sort is scheduling tasks with prerequisites, like getting dressed: socks before shoes, shirt before jacket. A valid order is any sequence where every prerequisite comes before the thing that needs it. Such an order exists exactly when there are no circular dependencies — no cycle in the directed graph.",
      "Kahn's algorithm builds the order by repeatedly taking a task with no remaining prerequisites (in-degree 0); a DFS variant emits nodes in reverse finishing order.",
      "Beyond ordering, it doubles as a cycle detector: if you cannot order every node, the graph has a cycle.",
    ],
    motivation: [
      "Brute force for 'is there a valid course order' might try permutations — factorial. Example: courses with prerequisite pairs.",
      "Kahn's algorithm instead counts in-degrees, queues the zero-in-degree nodes, and peels them one by one, decrementing neighbors' in-degrees — `O(V + E)`.",
      "The wasted work of trying invalid orders is replaced by always extending a guaranteed-valid prefix.",
      "If the emitted order is shorter than V, the leftover nodes form a cycle — so detection and ordering come from the same pass.",
    ],
    whenUse: [
      "If you see prerequisites/dependencies and 'find an order', think topological sort.",
      "If you see 'is it possible to finish / no circular dependency', think topo sort as cycle detection.",
      "If you see 'process in dependency order' before a DP, think topo order as preprocessing.",
      "If the ordering itself is the deliverable (build order, recipe order), think Kahn's BFS.",
      "If you also need to know which nodes are on a cycle, think DFS three-color state.",
    ],
    coreIdea: [
      "Build the directed adjacency list and compute in-degrees (for Kahn).",
      "Queue every vertex with in-degree 0.",
      "Repeatedly pop a vertex, append it to the order, and decrement its neighbors' in-degrees.",
      "Enqueue any neighbor whose in-degree reaches 0.",
      "If the order's length equals V, it is valid; otherwise a cycle exists.",
      "For the DFS variant, emit nodes in reverse post-order and use colors to catch back edges.",
    ],
    invariant:
      "**Prerequisites-Done Invariant.** A vertex is appended to the order only after all its prerequisites already appear in it (its in-degree has dropped to 0). Why this yields a valid topological order: every edge u→v is satisfied because v is emitted only once u has been, and a vertex that never reaches in-degree 0 is provably trapped behind a cycle — making the same algorithm a sound cycle test.",
    variants: [
      "Kahn's BFS: peel zero-in-degree nodes; natural for producing the order.",
      "DFS post-order: reverse finishing order; natural with recursion.",
      "Cycle detection: short Kahn output, or a DFS back edge (gray node).",
      "Lexicographically smallest order: replace the queue with a min-heap.",
      "Ordering as the answer: build/recipe/compile sequences.",
    ],
    templateKeys: ["topo_kahn", "topo_dfs"],
    complexity: [
      "Both variants are O(V + E); the hidden cost is building the adjacency list and in-degree array, which is also O(V + E) but easy to under-allocate.",
      "A min-heap for the lexicographically smallest order raises it to O(V log V + E).",
      "Space is O(V + E) for the graph plus O(V) for in-degrees/queue/recursion.",
    ],
    mistakes: [
      "Reversing edge direction. Counter-example: adding the edge as `course → prereq` instead of `prereq → course` produces an order that violates every dependency.",
      "Not detecting the cycle. Counter-example: returning the partial order without checking `order.size() == V` hands back an invalid (incomplete) sequence on cyclic input.",
      "Recomputing in-degrees incorrectly. Counter-example: incrementing the wrong endpoint's in-degree seeds the queue with the wrong nodes and stalls immediately.",
      "DFS without a 'gray' state. Counter-example: only marking visited/done cannot tell a cross edge from a back edge, missing some cycles.",
    ],
    practice: [
      {
        id: 207,
        title: "Course Schedule",
        slug: "course-schedule",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "cycle detection",
        why: "Finish-ability is exactly acyclicity.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 210,
        title: "Course Schedule II",
        slug: "course-schedule-ii",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "produce the order",
        why: "Return a valid topological order (or empty on a cycle).",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 2115,
        title: "Find All Possible Recipes from Given Supplies",
        slug: "find-all-possible-recipes-from-given-supplies",
        rating: 1679,
        difficulty: "Medium",
        subPattern: "dependency resolution",
        why: "Recipes depend on ingredients that may be other recipes.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Is the graph directed, and do edges encode 'must come before'?",
      "Do I orient edges prerequisite→dependent so in-degree means 'unmet prerequisites'?",
      "Do I check `order.size() == V` to surface cycles?",
      "Is the ordering itself the answer, or just preprocessing for a later DP?",
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
    title: "Interval Merging",
    group: "Core Array/String Patterns",
    icon: "CalendarRange",
    tagline:
      "Sort intervals by an endpoint, then sweep once to merge, insert, or count overlaps greedily.",
    concept: [
      "Merging intervals is consolidating overlapping calendar appointments into busy blocks: once the meetings are listed by start time, you walk down the list and whenever the next meeting starts before the current block ends, you stretch the block; otherwise you close it and open a new one. Sorting turns a global overlap question into a local 'does this touch the previous one?' check.",
      "The choice of sort key matters: sort by start to merge/insert, sort by end to maximize non-overlap or count minimum removals/arrows.",
      "It is greedy at heart, justified by an exchange argument on the chosen endpoint order.",
    ],
    motivation: [
      "Brute force compares every interval pair for overlap and unions them — `O(n^2)`. Example: `[[1,3],[2,6],[8,10],[15,18]]`.",
      "Sort by start; now overlaps are adjacent, so one pass either extends the last block (`start <= lastEnd`) or starts a new one — `O(n log n)`.",
      "The repeated pairwise overlap checks collapse into single neighbor comparisons.",
      "For 'minimum arrows / maximum non-overlapping', sort by end and greedily keep the earliest-finishing interval, dropping anything it overlaps.",
    ],
    whenUse: [
      "If you see 'merge overlapping intervals', think sort by start then sweep.",
      "If you see 'insert an interval into a sorted set', think before/overlap/after three-phase scan.",
      "If you see 'maximum non-overlapping / minimum removals / minimum arrows', think sort by end + greedy keep.",
      "If you see 'minimum meeting rooms / max concurrency', think a sweep or end-time heap.",
      "If you see scheduling with deadlines, think sort by the deciding endpoint then greedy.",
    ],
    coreIdea: [
      "Decide the goal: merge (sort by start) vs. select/count non-overlap (sort by end).",
      "Sort the intervals by that endpoint.",
      "Sweep once, tracking the current merged block or the last kept interval's end.",
      "On overlap, extend the block (merge) or skip the interval (selection).",
      "On no overlap, emit/open a new block or keep the interval and advance the boundary.",
      "Confirm the greedy choice with an exchange argument on the sort key.",
    ],
    invariant:
      "**Boundary-Monotone Invariant.** After processing intervals in sorted order, the running boundary (last merged end, or last kept end) is the tightest possible given everything seen so far. Why merging is then correct: because starts are nondecreasing, any interval that overlaps an earlier one must overlap the current block, so a single neighbor test never misses an overlap; for end-sorted selection, keeping the earliest finisher leaves the most room and is optimal by exchange.",
    variants: [
      "Merge overlapping intervals (sort by start).",
      "Insert interval into a sorted, non-overlapping set (three-phase).",
      "Minimum removals to make non-overlapping (sort by end, count overlaps).",
      "Minimum arrows to burst balloons (sort by end, shared-point greedy).",
      "Partition into minimum groups / meeting rooms (sweep or end-time heap).",
    ],
    templateKeys: ["merge_intervals", "exchange_greedy"],
    complexity: [
      "Dominated by the O(n log n) sort; the sweep itself is O(n). The hidden cost is the sort key choice — sorting by the wrong endpoint makes the greedy provably incorrect, not just slow.",
      "Space is O(n) for the output (or O(1) extra for counting variants).",
      "Heap-based concurrency variants add an O(log n) per-interval factor.",
    ],
    mistakes: [
      "Wrong endpoint for the sort. Counter-example: maximizing non-overlapping intervals by sorting on start fails on `[[1,100],[2,3],[3,4]]` (start-sort keeps 1 interval; end-sort keeps 2).",
      "Boundary inclusivity errors. Counter-example: treating `[1,2]` and `[2,3]` as overlapping (or not) inconsistently changes arrow/room counts — fix whether touching endpoints count.",
      "Mutating while iterating. Counter-example: erasing from the vector mid-sweep invalidates indices; build a fresh result instead.",
      "Forgetting to extend with max. Counter-example: setting `lastEnd = cur.end` instead of `max(lastEnd, cur.end)` shrinks a block when a nested interval ends earlier.",
    ],
    practice: [
      {
        id: 56,
        title: "Merge Intervals",
        slug: "merge-intervals",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "sort by start + merge",
        why: "The canonical merge sweep.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 57,
        title: "Insert Interval",
        slug: "insert-interval",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "before / overlap / after",
        why: "Three-phase insertion into a sorted set.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 435,
        title: "Non-overlapping Intervals",
        slug: "non-overlapping-intervals",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "sort by end + greedy keep",
        why: "Minimum removals via earliest-finish greedy.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 452,
        title: "Minimum Number of Arrows to Burst Balloons",
        slug: "minimum-number-of-arrows-to-burst-balloons",
        rating: 1700,
        difficulty: "Medium",
        subPattern: "shared-point greedy",
        why: "End-sorted greedy on overlapping ranges.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 2406,
        title: "Divide Intervals Into Minimum Number of Groups",
        slug: "divide-intervals-into-minimum-number-of-groups",
        rating: 1713,
        difficulty: "Medium",
        subPattern: "max concurrency sweep",
        why: "Minimum groups equals peak overlap.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Is my goal to merge (sort by start) or to select/count non-overlap (sort by end)?",
      "Do touching endpoints count as overlapping for this problem?",
      "Am I extending the boundary with a max so nested intervals do not shrink it?",
      "Can I justify the greedy keep/skip with an exchange argument on the sort key?",
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
    title: "String Pattern Matching",
    group: "String Patterns",
    icon: "Regex",
    tagline:
      "Find patterns in linear time with KMP failure functions, the Z-function, and rolling hashes.",
    concept: [
      "Naive substring search is checking a key against every lock position and starting over from scratch on each mismatch — throwing away everything you just learned. Linear-time matching keeps that knowledge: when characters mismatch, a precomputed table tells you the largest safe shift so you never re-examine text you already matched. KMP, the Z-function, and rolling hashes are three ways to remember.",
      "KMP precomputes, for each pattern prefix, the longest proper prefix that is also a suffix (the failure function), so a mismatch falls back without moving the text pointer.",
      "The Z-function generalizes this to 'longest match with the whole string's prefix' at every position, and rolling hashes let you compare substrings in O(1) after O(n) setup.",
    ],
    motivation: [
      "Brute force aligns the pattern at every text position and re-compares up to m characters — `O(n·m)`. Example: text `aaaaab`, pattern `aaab` re-scans the run of a's repeatedly.",
      "KMP builds the failure table once in O(m); on a mismatch at pattern index j it jumps to `lps[j-1]` instead of restarting, because that prefix is already known to match.",
      "The repeated re-comparison of the same characters — the heart of the O(n·m) blow-up — is exactly what the failure function removes, giving O(n + m).",
      "Rolling hashes attack it differently: hash the pattern once, roll a window hash across the text, and compare hashes in O(1) (with an O(m) verify on a hit to defeat collisions).",
    ],
    whenUse: [
      "If you see 'find/index of a substring' at scale, think KMP or Z-function over naive search.",
      "If you see 'periodicity / repeated substring / shortest period', think KMP failure function or Z.",
      "If you see 'shortest palindrome / longest prefix-suffix', think KMP on a clever concatenation.",
      "If you see 'compare many substrings for equality', think rolling hash for O(1) comparisons.",
      "If you need prefix-match lengths at every position, think the Z-function.",
    ],
    coreIdea: [
      "Decide what you must compute: a single occurrence, all occurrences, periods, or substring equality.",
      "For occurrence/period, build the failure (LPS) or Z array of the pattern in O(m).",
      "Scan the text once, advancing both pointers on a match.",
      "On a mismatch, fall back the pattern pointer via the table without moving the text pointer.",
      "For hashing, precompute prefix hashes and powers, then compare ranges in O(1) and verify hits.",
      "Pick a large modulus / double hashing to control collision risk.",
    ],
    invariant:
      "**Matched-Prefix Invariant.** At each text position, the algorithm knows the length of the longest pattern prefix that ends here, and that prefix genuinely matches the text. Why O(n + m) holds: the text pointer never moves backward, and each fallback strictly shortens the matched prefix, so the total number of pointer moves is linear — the failure table converts what looks like nested loops into a single forward sweep.",
    variants: [
      "KMP search: failure function + non-backtracking text scan.",
      "KMP periodicity: shortest period is `n - lps[n-1]` when it divides n.",
      "Z-function search: build Z of `pattern + sep + text`, look for Z = m.",
      "Rolling hash (Rabin-Karp): O(1) substring comparison with verification.",
      "Shortest palindrome / prefix-suffix tricks via KMP on concatenations.",
    ],
    templateKeys: ["kmp", "z_function"],
    complexity: [
      "KMP and Z are O(n + m) time, O(m) (or O(n)) space; the hidden cost is the preprocessing table, which is easy to misindex.",
      "Rolling hash is O(n + m) expected but O(n·m) worst case without verification, because collisions force full comparisons.",
      "Double hashing or a 64-bit modulus reduces collision probability at a constant-factor cost.",
    ],
    mistakes: [
      "Off-by-one in the LPS array. Counter-example: setting `lps[0]` to anything but 0, or mixing the prefix-length and index variables, corrupts every fallback.",
      "Moving the text pointer on a mismatch. Counter-example: incrementing `i` when `j > 0` after a mismatch skips potential matches — only fall back `j`.",
      "Trusting a hash without verification. Counter-example: two different substrings can share a hash; a collision reports a false match unless you re-compare on a hit.",
      "A weak hash base/modulus. Counter-example: a small modulus on adversarial input causes mass collisions, degrading to O(n·m).",
    ],
    practice: [
      {
        id: 28,
        title: "Find the Index of the First Occurrence in a String",
        slug: "find-the-index-of-the-first-occurrence-in-a-string",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "KMP / Z search",
        why: "The base substring-search problem.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 459,
        title: "Repeated Substring Pattern",
        slug: "repeated-substring-pattern",
        rating: 1400,
        difficulty: "Easy",
        subPattern: "KMP periodicity",
        why: "Period via `n - lps[n-1]`.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 214,
        title: "Shortest Palindrome",
        slug: "shortest-palindrome",
        rating: 1800,
        difficulty: "Hard",
        subPattern: "KMP on s + '#' + reverse(s)",
        why: "Longest palindromic prefix from a failure function.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Do I need a single match, all matches, a period, or many substring comparisons?",
      "Can I precompute a failure/Z array so the text pointer never backtracks?",
      "If I hash, am I verifying hits to guard against collisions?",
      "Is my modulus/base strong enough for adversarial inputs?",
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
      "Store strings in a prefix tree for O(L) insert/search and shared-prefix queries, including bitwise XOR tries.",
    concept: [
      "A trie is a telephone directory organized by letter tabs: all names starting with 'CA' live under the C tab then the A tab, so finding or adding a name follows one letter at a time and shared prefixes are stored once. Each node represents a prefix; each edge is a character; a flag marks where a real word ends.",
      "This makes prefix queries (`startsWith`) and dictionary lookups O(length), independent of how many words are stored.",
      "The same shape, branching on bits instead of letters, becomes a binary trie that answers maximum-XOR queries by greedily choosing the opposite bit at each level.",
    ],
    motivation: [
      "Brute force for 'do any stored words start with this prefix' scans all words and compares prefixes — `O(words · L)`. Example: a dictionary plus many prefix queries.",
      "A trie walks the prefix once; reaching a node proves some word has that prefix — `O(L)` per query regardless of dictionary size.",
      "The repeated re-scanning of unrelated words is removed because shared prefixes share a path.",
      "For maximum XOR, insert numbers bit-by-bit; for a query, at each bit greedily descend toward the opposite bit so high bits of the XOR are set whenever possible.",
    ],
    whenUse: [
      "If you see many words and prefix/startsWith/autocomplete queries, think a trie.",
      "If you see a word dictionary with wildcards (`.`), think a trie with branching search.",
      "If you see 'maximum/minimum XOR pair/subarray', think a binary (bitwise) trie.",
      "If you see 'word search on a board with a dictionary', think a trie to prune the DFS.",
      "If memory matters and the alphabet is fixed, think an array-indexed trie.",
    ],
    coreIdea: [
      "Create a root node with one child slot per alphabet symbol (or two for bits).",
      "Insert by walking/creating a node per character and flagging the terminal node.",
      "Search/startsWith by walking the path; missing edges mean no match.",
      "For wildcards, branch over all children when the query char is a wildcard.",
      "For XOR queries, store bits high-to-low and greedily take the opposite bit.",
      "Choose pointer-based (sparse) or array-based (dense, faster) nodes by constraints.",
    ],
    invariant:
      "**Prefix-Path Invariant.** The path from the root to any node spells exactly the prefix that node represents, and a word is stored iff some path ends on a flagged terminal node. Why queries are O(L): each character advances exactly one edge, so search cost depends only on the query length, never on the number of stored words — and shared prefixes are physically shared, so storage is bounded by total distinct prefix characters.",
    variants: [
      "Pointer-based trie: one allocated node per used prefix (sparse, flexible).",
      "Array-based trie: a fixed children array per node (dense, cache-friendly, faster).",
      "Wildcard search trie: branch over all children on a `.`.",
      "Binary trie for XOR maximization: branch on bits, greedily take the opposite.",
      "Trie + DFS pruning: stop a board search when no word shares the current prefix.",
    ],
    templateKeys: ["trie_pointer", "trie_xor"],
    complexity: [
      "Insert/search are O(L) per word; the hidden cost is memory — up to O(total characters · alphabet) for array nodes, which can dominate for large alphabets.",
      "A binary trie is O(32) or O(64) per number for fixed-width integers.",
      "Pointer tries trade memory for flexibility; array tries trade memory for speed.",
    ],
    mistakes: [
      "Forgetting the terminal flag. Counter-example: a trie holding `apple` would report `app` as a stored word unless an `isEnd` flag distinguishes words from mere prefixes.",
      "Not handling missing edges. Counter-example: dereferencing a null child during search crashes instead of returning false.",
      "Wrong bit order in an XOR trie. Counter-example: inserting bits low-to-high makes the greedy choice optimize the wrong (low) bits, missing the maximum.",
      "Alphabet sizing. Counter-example: a 26-slot array fails on uppercase/digits/Unicode; size the children array to the real alphabet.",
    ],
    practice: [
      {
        id: 208,
        title: "Implement Trie (Prefix Tree)",
        slug: "implement-trie-prefix-tree",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "insert / search / startsWith",
        why: "The base trie API.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 211,
        title: "Design Add and Search Words Data Structure",
        slug: "design-add-and-search-words-data-structure",
        rating: 1600,
        difficulty: "Medium",
        subPattern: "wildcard branching search",
        why: "Trie search that branches on the '.' wildcard.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 212,
        title: "Word Search II",
        slug: "word-search-ii",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "trie-pruned board DFS",
        why: "A trie prunes the multi-word grid search.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Are there many strings sharing prefixes, and do queries care about prefixes?",
      "Do I need wildcard or fuzzy matching that a hash set cannot do?",
      "Is this actually a bitwise XOR problem solvable with a binary trie?",
      "Given the alphabet and counts, is pointer-based or array-based the right node layout?",
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
    title: "Heap Patterns",
    group: "Data Structure Patterns",
    icon: "PieChart",
    tagline:
      "Keep only the extreme elements available in O(log n) for k-th, top-k, merging, and streaming-median problems.",
    concept: [
      "A heap is a hospital triage desk: at any moment you can instantly see the single most urgent patient, and inserting a new patient or removing the top one reshuffles in O(log n) — but you never get a full sorted list, just the extreme. That is exactly enough for 'the k-th / the top-k / the next smallest' without paying to sort everything.",
      "A max-heap exposes the largest element; a min-heap the smallest; a fixed-size heap of the opposite type keeps a running top-k.",
      "Two heaps facing each other split a stream into a lower and upper half so the median is always at the two tops.",
    ],
    motivation: [
      "Brute force for 'k-th largest in a stream' re-sorts on every insert — `O(n log n)` per query. Example: numbers arriving one at a time.",
      "Keep a min-heap of size k: the top is the k-th largest, and each insert is O(log k). The repeated full sort is replaced by a small maintained heap.",
      "For 'merge k sorted lists', a heap of the current front of each list always yields the global minimum in O(log k), avoiding rescanning all lists per output.",
      "For a streaming median, a max-heap (lower half) and min-heap (upper half) kept balanced put the median at the tops — O(log n) per add, O(1) per query.",
    ],
    whenUse: [
      "If you see 'k-th largest/smallest', think a size-k heap of the opposite polarity.",
      "If you see 'top k frequent/closest', think a heap keyed by the ranking quantity.",
      "If you see 'merge k sorted lists/arrays', think a min-heap of the k frontiers.",
      "If you see 'median of a data stream', think two balanced heaps.",
      "If you see 'schedule by repeatedly taking the best available', think a heap as the frontier (lazy deletion if needed).",
    ],
    coreIdea: [
      "Identify the extreme you repeatedly need (max, min, or both ends).",
      "Pick a heap polarity; for top-k use a fixed-size heap of the opposite polarity.",
      "Push new elements; pop to maintain the size or to consume the extreme.",
      "For merging, seed the heap with each sequence's first element and re-push its successor.",
      "For medians, balance two heaps so their sizes differ by at most one.",
      "Use lazy deletion (skip stale tops) when elements expire.",
    ],
    invariant:
      "**Heap-Top-Is-Extreme Invariant.** The heap's root is always the current extreme of its contents. Why the patterns work: a size-k min-heap's root is the k-th largest because exactly the k largest survive; merging stays correct because the smallest unconsumed element is always some list's current front, which sits in the heap; and the two-heap median holds because the boundary between halves is exactly the two roots.",
    variants: [
      "Fixed-size heap for k-th / top-k.",
      "Min-heap of frontiers for merging k sorted sequences.",
      "Two heaps (max + min) for a streaming median.",
      "Lazy deletion: skip outdated tops instead of removing from the middle.",
      "Heap as a greedy frontier (e.g. pick the most profitable available task).",
    ],
    templateKeys: ["two_heap_median", "merge_k_heap"],
    complexity: [
      "Push/pop are O(log size); top-k over n elements is O(n log k), better than O(n log n) full sorting. The hidden cost is the heap's poor cache locality and large constant versus a flat array.",
      "Two-heap median is O(log n) per add and O(1) per query.",
      "Lazy deletion can let a heap grow beyond the logical size, so account for stale entries in the space bound.",
    ],
    mistakes: [
      "Wrong heap polarity for top-k. Counter-example: keeping a max-heap of size k for 'k-th largest' evicts large elements; you need a min-heap of size k so small ones fall out.",
      "Unbalanced median heaps. Counter-example: pushing always to one side without rebalancing puts the median in the wrong place; keep sizes within one.",
      "Comparator sign errors. Counter-example: `greater<>` vs default `less<>` silently flips min/max; verify which root you get.",
      "Forgetting lazy-deletion staleness. Counter-example: reading the top without discarding expired entries returns an element no longer valid.",
    ],
    practice: [
      {
        id: 215,
        title: "Kth Largest Element in an Array",
        slug: "kth-largest-element-in-an-array",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "size-k min-heap",
        why: "The base k-th element via a maintained heap.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 347,
        title: "Top K Frequent Elements",
        slug: "top-k-frequent-elements",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "heap keyed by frequency",
        why: "Top-k over a frequency map.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 23,
        title: "Merge k Sorted Lists",
        slug: "merge-k-sorted-lists",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "min-heap of frontiers",
        why: "Heap of list heads yields the global minimum.",
        order: 3,
        tier: "Core Practice",
      },
      {
        id: 295,
        title: "Find Median from Data Stream",
        slug: "find-median-from-data-stream",
        rating: 1900,
        difficulty: "Hard",
        subPattern: "two balanced heaps",
        why: "The defining two-heap median split.",
        order: 4,
        tier: "Advanced Practice",
      },
      {
        id: 502,
        title: "IPO",
        slug: "ipo",
        rating: 2000,
        difficulty: "Hard",
        subPattern: "heap as greedy frontier",
        why: "Unlock affordable projects, pop the most profitable.",
        order: 5,
        tier: "Challenge Practice",
      },
    ],
    recognition: [
      "Do I only need the extreme repeatedly, not a full sorted order?",
      "For top-k, is my heap the opposite polarity and capped at size k?",
      "For merging/streaming, what is the frontier set whose extreme I track?",
      "Do any elements expire, requiring lazy deletion of stale tops?",
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
    title: "Number Theory and Math",
    group: "Math Patterns",
    icon: "Calculator",
    tagline:
      "A toolkit of GCD/LCM, modular arithmetic, fast exponentiation, sieves, and combinatorics for math-flavored problems.",
    concept: [
      "Number-theory problems are about the hidden gears behind the integers — divisibility, remainders, primes — and a small toolkit turns brute force into a few clean operations. Computing a GCD by trying every divisor is like counting change coin by coin; the Euclidean algorithm is paying with exact bills. The pattern is recognizing which classic tool (GCD, modular arithmetic, fast power, sieve, combinatorics) collapses the work.",
      "Modular arithmetic lets you keep numbers small under a prime modulus while preserving `+`, `−`, `×` (and `÷` via modular inverse).",
      "Fast exponentiation and the sieve are the two workhorses: they turn O(n) and O(n√n) loops into O(log n) and O(n log log n).",
    ],
    motivation: [
      "Brute force for 'is x prime, for many x up to n' tests divisors per query — `O(n√n)`. Example: counting primes below n.",
      "The Sieve of Eratosthenes marks composites starting at i·i in one O(n log log n) pass, answering all primality at once.",
      "Brute force for `base^exp mod m` multiplies exp times — `O(exp)`, impossible for huge exponents; fast exponentiation squares the base and multiplies on set bits in O(log exp).",
      "The repeated work — re-testing divisibility or re-multiplying — is replaced by reusing a sieve table or by halving the exponent.",
    ],
    whenUse: [
      "If you see 'count primes / smallest prime factor up to n', think a sieve.",
      "If you see huge powers or 'answer modulo 1e9+7', think fast modular exponentiation (and modular inverse for division).",
      "If you see GCD/LCM, reduced fractions, or cycle lengths, think the Euclidean algorithm.",
      "If you see 'number of ways / choose k', think combinatorics with factorials and modular inverse.",
      "If you see remainders/periodicity, think working in modular arithmetic.",
    ],
    coreIdea: [
      "Identify the arithmetic structure: primality, divisibility, powers, or counting.",
      "For primes up to n, run a sieve once and reuse it.",
      "For large powers or modular division, use fast exponentiation (and Fermat's inverse under a prime modulus).",
      "For GCD/LCM, use the Euclidean algorithm; LCM is `a / gcd(a,b) * b` (divide first to avoid overflow).",
      "For combinatorics, precompute factorials and inverse factorials modulo a prime.",
      "Keep every intermediate value reduced modulo m to prevent overflow.",
    ],
    invariant:
      "**Modular-Consistency Invariant.** Every intermediate result is kept congruent to the true value modulo m, and all operations used are the modulus-preserving ones (`+`, `−`, `×`, and `÷` only via modular inverse). Why the answer stays correct: because these operations commute with taking the remainder, reducing at every step never changes the final residue — but it keeps numbers bounded, which is what makes the computation feasible at all.",
    variants: [
      "GCD/LCM via the Euclidean algorithm.",
      "Modular arithmetic with addition/multiplication and Fermat inverse for division.",
      "Fast (binary) exponentiation for powers and modular inverse.",
      "Sieve of Eratosthenes for primes and smallest-prime-factor tables.",
      "Combinatorics: C(n, k) mod p via precomputed factorials and inverse factorials.",
    ],
    templateKeys: ["sieve", "fast_pow"],
    complexity: [
      "The sieve is O(n log log n) time and O(n) space; fast exponentiation is O(log exp). The hidden cost is overflow — a single un-reduced `a*b` before `% m` overflows `int`/`long long` even when the final answer fits.",
      "GCD is O(log min(a,b)); combinatorics setup is O(n) for factorial tables.",
      "Modular inverse via Fermat costs an extra O(log p) per division.",
    ],
    mistakes: [
      "Overflow before reducing. Counter-example: `result = result * base % mod` is safe in `long long`, but `int` overflows when `base, result ~ 10^9`; widen the type.",
      "Dividing under a modulus directly. Counter-example: `(a / b) % m` is wrong; multiply by the modular inverse of `b` instead.",
      "Sieve starting too low. Counter-example: marking multiples from `2*i` instead of `i*i` is correct but slower; starting the loop variable below 2 marks 0/1 as prime.",
      "LCM overflow. Counter-example: `a * b / gcd` overflows for large a, b; compute `a / gcd * b`.",
    ],
    practice: [
      {
        id: 204,
        title: "Count Primes",
        slug: "count-primes",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "sieve of Eratosthenes",
        why: "The base sieve application.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 50,
        title: "Pow(x, n)",
        slug: "powx-n",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "fast exponentiation",
        why: "Binary exponentiation with negative-exponent handling.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 1922,
        title: "Count Good Numbers",
        slug: "count-good-numbers",
        rating: 1675,
        difficulty: "Medium",
        subPattern: "modular fast power",
        why: "Large modular powers with the 1e9+7 modulus.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Which classic tool fits — sieve, fast power, GCD, or combinatorics?",
      "Is there a modulus, and am I reducing after every multiplication to avoid overflow?",
      "Does the problem need division under a modulus (→ modular inverse)?",
      "Can I precompute a table (sieve, factorials) once and reuse it across queries?",
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
    title: "Divide and Conquer",
    group: "Recursion and Search",
    icon: "Split",
    tagline:
      "Split into independent halves, solve each, and combine — the combine step is where counting and selection happen.",
    concept: [
      "Divide and conquer is organizing a huge stack of exams by splitting it between two graders, who each split again, until each person holds a trivial pile; then the sorted piles are merged back. The power is rarely in the splitting — it is in the *combine* step, where merging two solved halves also reveals cross-half information (like how many pairs are out of order).",
      "Recurrences like merge sort, count of inversions, and count of range sums all share this skeleton: split at the middle, recurse, then do linear cross-boundary work.",
      "Selection variants (quickselect) divide but recurse into only one side, trading the merge for a partition.",
    ],
    motivation: [
      "Brute force for 'count inversions' (pairs i<j with a[i]>a[j]) checks all pairs — `O(n^2)`. Example: `[2,4,1,3,5]`.",
      "Merge sort the array; during each merge, when a right-half element is placed before remaining left-half elements, those left elements are all inversions, counted in O(1) each.",
      "The repeated pairwise comparison collapses into linear counting during merges, giving `O(n log n)`.",
      "Quickselect reuses partitioning but recurses into only the side containing the target rank, achieving O(n) average for the k-th element.",
    ],
    whenUse: [
      "If you see 'count inversions / pairs out of order / range-sum pairs', think merge-sort counting.",
      "If you see 'k-th smallest/largest' and a heap feels heavy, think quickselect.",
      "If you see a problem that splits into independent subproblems with a cheap combine, think divide and conquer.",
      "If you see 'sort but also report something during sorting', think augmenting merge sort.",
      "If a recurrence T(n)=aT(n/b)+f(n) appears, think the master theorem for its complexity.",
    ],
    coreIdea: [
      "Split the input at the middle into independent halves.",
      "Recurse on each half until a trivial base case.",
      "Combine the halves in linear time, extracting cross-boundary information there.",
      "For counting, tally cross-half contributions during the merge.",
      "For selection, partition and recurse into only the relevant side.",
      "Use the master theorem to reason about the resulting complexity.",
    ],
    invariant:
      "**Independent-Subproblem Invariant.** Each half is solved correctly without reference to the other, and every cross-half interaction is accounted for exactly once in the combine step. Why the count is exact: an inversion either lies entirely in the left half, entirely in the right, or straddles the split — the recursion handles the first two and the single merge handles the third, so no pair is missed or double-counted.",
    variants: [
      "Merge sort: split, sort halves, merge.",
      "Inversion counting / count of range sums during the merge.",
      "Quickselect: partition, recurse into one side for the k-th element.",
      "Quicksort: partition, recurse into both sides.",
      "Master-theorem analysis of split-and-combine recurrences.",
    ],
    templateKeys: ["merge_sort_count", "quickselect"],
    complexity: [
      "Merge-sort-style divide and conquer is O(n log n) with O(n) scratch space; the hidden cost is that buffer and the linear combine done at every level (the log n levels each touch all n elements).",
      "Quickselect is O(n) average but O(n^2) worst case on bad pivots; randomization restores expected linear time.",
      "The master theorem reads complexity from the split count a, shrink factor b, and combine cost f(n).",
    ],
    mistakes: [
      "Counting cross pairs at the wrong moment. Counter-example: tallying inversions after the merge (when order is lost) instead of while merging double-counts or misses pairs.",
      "Quickselect on a sorted array with a last-element pivot. Counter-example: already-sorted input degrades partitioning to O(n^2); pick a random pivot.",
      "Reallocating the buffer each call. Counter-example: a fresh `vector` per merge turns the constant into a memory storm; pass one shared scratch buffer.",
      "Overflow in the inversion count. Counter-example: up to ~n²/2 inversions for n=10^5 exceeds `int`; accumulate in `long long`.",
    ],
    practice: [
      {
        id: 912,
        title: "Sort an Array",
        slug: "sort-an-array",
        rating: 1500,
        difficulty: "Medium",
        subPattern: "merge sort",
        why: "Implement the divide-and-conquer sort itself.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 215,
        title: "Kth Largest Element in an Array",
        slug: "kth-largest-element-in-an-array",
        rating: 1400,
        difficulty: "Medium",
        subPattern: "quickselect",
        why: "Average O(n) selection via partitioning.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 493,
        title: "Reverse Pairs",
        slug: "reverse-pairs",
        rating: 2300,
        difficulty: "Hard",
        subPattern: "merge-sort counting",
        why: "Count cross-half pairs during the merge.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Do the halves solve independently, with the real work in a linear combine?",
      "Is the cross-boundary quantity (inversions, range-sum pairs) counted exactly once during the merge?",
      "For selection, can I recurse into only one side instead of both?",
      "Does the recurrence fit the master theorem, and have I guarded against the O(n^2) pivot case?",
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
    title: "Game Theory",
    group: "Math Patterns",
    icon: "Swords",
    tagline:
      "Decide the winner of two-player games with P/N positions, Nim XOR, Sprague-Grundy values, and interval DP.",
    concept: [
      "A combinatorial game is like a maze that two players walk through together, taking turns choosing the next corridor; under normal play the player who reaches a dead end (no move) loses. You do not need to read the whole maze — you only need to label each room as a win or a loss for whoever stands in it, working backward from the dead ends.",
      "Those labels are P-positions (the Previous player wins, i.e. the player to move loses) and N-positions (the Next player to move wins).",
      "For impartial games (both players share the same moves) this labeling has astonishing structure: single-pile games are periodic, multi-pile Nim is decided by a XOR, and any sum of games collapses to a XOR of Grundy values.",
    ],
    motivation: [
      "Brute force is plain minimax: recurse over every move and ask 'can the player to move force a win?'. Example: one pile of 4 stones, take 1–3 — minimax explores the whole tree of moves.",
      "The repeated work is that the same position is re-evaluated through many move orders, and the tree is exponential.",
      "Memoize on the position to get a P/N table in linear time; for single-pile take-away games the table is even periodic, so the answer is a modulo check.",
      "When the game splits into independent sub-games, do not search the product space — compute each part's Grundy value and XOR them (Sprague-Grundy), turning an exponential product into a sum.",
    ],
    whenUse: [
      "If you see 'two players alternate, optimal play, who wins?', think P/N positions first.",
      "If you see independent heaps and a move shrinks one heap, think Nim → XOR of pile sizes.",
      "If you see a single game that decomposes into independent components, think Grundy value per component, then XOR.",
      "If you see a score accumulated from the ends of an array, think interval DP on the score difference, not Grundy.",
      "If the state space is tiny, think a memoized DFS / P-N table over states.",
    ],
    coreIdea: [
      "Identify whether the game is impartial (same moves for both) — only then do Nim/Grundy apply.",
      "Find the terminal positions and label them (a player with no move loses under normal play).",
      "Propagate labels: a position is N if some move reaches a P-position, else P.",
      "For sums of impartial games, compute each Grundy value `mex{reachable}` and XOR them; nonzero XOR means the player to move wins.",
      "For score games, define `dp[i][j]` as the best score difference and combine the two end choices.",
      "Read the winner from the start position's label, Grundy XOR, or `dp[0][n-1]` sign.",
    ],
    invariant:
      "**P/N Labeling Invariant.** Every position is consistently labeled: a P-position has *all* moves leading to N-positions, and an N-position has *at least one* move leading to a P-position. Why this decides the game: a player on an N-position can always step onto a P-position and hand the opponent a loss, while a player on a P-position is forced to step onto an N-position and hand the opponent the win. Induction from the terminal positions makes the labels — and therefore the predicted winner — exact.",
    variants: [
      "Nim (several heaps, take any amount from one): first player wins iff XOR of heap sizes ≠ 0.",
      "Bash game (take 1..k from one heap): P-positions are the multiples of k+1.",
      "Sprague-Grundy sum (independent sub-games): XOR the per-component Grundy values.",
      "Misère play (last to move loses): the analysis flips near the end and needs care, unlike normal play.",
      "Scoring games on an array (Predict the Winner, Stone Game family): interval DP on the score difference.",
    ],
    templateKeys: [
      "game_nim_xor",
      "game_grundy",
      "game_interval_dp",
      "game_pn_table",
    ],
    complexity: [
      "P/N or Grundy tables cost O(states · branching); the hidden cost is the branching factor of `moves(state)`, which can dominate when each state has many successors.",
      "Nim's XOR check is O(n) over the heaps — the entire game theory hides inside a single fold.",
      "Interval DP score games are O(n^2) time and O(n^2) space (reducible to O(n) rolling space); the hidden cost is the n^2 states, not the O(1) transition.",
    ],
    mistakes: [
      "Applying Nim/Grundy to a partisan or scoring game. Counter-example: Stone Game VII accumulates points, so XOR/Grundy is meaningless — it needs interval DP on the score difference.",
      "Mis-defining the terminal label. Counter-example: under normal play the player who cannot move loses, so the empty position is a P-position; flipping this inverts the entire table.",
      "Confusing 'maximize my score' with 'maximize the difference'. Counter-example: in Predict the Winner, maximizing raw score greedily fails; `dp` must track (me − opponent), which is provably equivalent and the only formulation that composes across turns.",
      "Forgetting `mex` skips present values. Counter-example: reachable Grundy values {0, 1, 3} give `mex = 2` (not 4); scanning for the smallest absent non-negative integer is required.",
    ],
    practice: [
      {
        id: 292,
        title: "Nim Game",
        slug: "nim-game",
        rating: 1300,
        difficulty: "Easy",
        subPattern: "Bash game periodicity",
        why: "The cleanest P/N reasoning: lose iff n is a multiple of 4.",
        order: 1,
        tier: "Core Practice",
      },
      {
        id: 486,
        title: "Predict the Winner",
        slug: "predict-the-winner",
        rating: 1701,
        difficulty: "Medium",
        subPattern: "interval DP score difference",
        why: "Canonical two-player interval DP on the score difference.",
        order: 2,
        tier: "Core Practice",
      },
      {
        id: 877,
        title: "Stone Game",
        slug: "stone-game",
        rating: 1590,
        difficulty: "Medium",
        subPattern: "interval DP / parity argument",
        why: "Interval DP that also admits a slick parity proof for even piles.",
        order: 3,
        tier: "Advanced Practice",
      },
    ],
    recognition: [
      "Is the game impartial (both players have identical moves), so Nim/Grundy can apply at all?",
      "Does the position decompose into independent sub-games whose Grundy values I can XOR?",
      "Is this a scoring game from the ends of a sequence (→ interval DP on the difference) rather than a last-to-move game?",
      "Have I labeled the terminal positions correctly for the (normal vs. misère) convention in the statement?",
    ],
    related: [
      "dp-transition-design",
      "state-design",
      "number-theory-and-math",
      "proof-techniques",
    ],
    coreIdeaAppendix: GAME_THEORY_DEEP_DIVE,
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
  return `${intro}${bullets}\n\nThis topic differs from brute force by replacing repeated candidate evaluation with a named pattern, maintained state, or proof obligation.`;
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function templateMarkdown(keys: string[]): string {
  return keys
    .map((key, index) => {
      const template = TEMPLATES[key];
      const meta = TEMPLATE_META[key];
      const basis = TEMPLATE_BASIS[key];
      if (!template || !meta || !basis) {
        throw new Error(`Missing handbook template, meta, or basis: ${key}`);
      }
      // Tell the reader exactly what the code implements: a linked LeetCode
      // reference when it solves one problem, or a detailed pattern description.
      const basisLine = basis.lc
        ? `_Based on:_ [LeetCode ${basis.lc.id}. ${basis.lc.title}](https://leetcode.cn/problems/${basis.lc.slug}/)`
        : `_Pattern:_ ${basis.pattern}`;
      const body = [
        basisLine,
        "",
        `_When to use:_ ${meta.whenToUse}`,
        "",
        "```cpp",
        template.code,
        "```",
      ].join("\n");
      // The first template of every topic is expanded by default; the rest are
      // collapsed, per the unified collapsible contract.
      return collapsible(
        `${meta.name} — ${meta.complexity}`,
        body,
        index === 0,
      );
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

  const header = [
    `**${title}**`,
    "",
    // Keep this four-column shape so HandbookSectionBody upgrades it to
    // ProblemList, which applies the EN/CN LeetCode host from site settings.
    "| ID | Problem | Rating | Technique |",
    "|---:|---|---:|---|",
  ];
  const body = rows.map(
    (problem) =>
      `| ${problem.id} | [${problem.title}](https://leetcode.com/problems/${problem.slug}) | ${problem.rating} | ${problem.order}. ${problem.subPattern} (${problem.difficulty}) |`,
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
  return collapsible(
    `Common Variants — ${variants.length} variants`,
    bulletList(variants),
  );
}

function recognitionMarkdown(recognition: string[]): string {
  return collapsible(
    `Recognition Checklist — ${recognition.length} questions`,
    bulletList(recognition),
  );
}

function proofMarkdown(topic: PatternTopicDefinition): string {
  const body = `${topic.invariant} The algorithm initializes this statement before processing, restores it after each update, and only reads the answer from state covered by the statement. Any candidate skipped by the optimized algorithm is either represented inside the maintained state, dominated by a better candidate, or assigned to a different canonical owner. Therefore the optimized count or choice matches the brute-force definition.`;
  return collapsible(`Proof Sketch: ${topic.title}`, body);
}

function relatedMarkdown(slugs: string[]): string {
  const links = slugs
    .map((slug) => {
      const title = TOPIC_TITLE_BY_SLUG.get(slug) ?? slug;
      return `- [${title}](/handbook/${slug})`;
    })
    .join("\n");
  return collapsible(`Related Topics — ${slugs.length} links`, links);
}

/**
 * Runtime guard enforcing the handbook's collapsible contract:
 *  - section 10 (LeetCode Problems) is NEVER wrapped in a collapsible, and
 *  - the C++17 templates section opens with exactly one expanded template.
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
    const totalCount = (templates.body.match(/<details(?: open)?>/g) ?? [])
      .length;
    if (totalCount > 0 && openCount !== 1) {
      throw new Error(
        `Section 7 of "${topic.slug}" must have exactly one template expanded by default (found ${openCount}).`,
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
    sections: [
      {
        id: "concept-explanation",
        title: "1. Concept Explanation",
        body: conceptMarkdown(def.concept),
      },
      {
        id: "problem-motivation",
        title: "2. Problem Motivation",
        body: `Start from the literal brute-force solution, then locate the repeated work.\n\n${numberedList(def.motivation)}\n\nThe optimized pattern keeps the brute-force ownership rule but changes how the expensive fact is obtained.`,
      },
      {
        id: "when-to-use",
        title: "3. When to Use",
        body: bulletList(def.whenUse),
      },
      {
        id: "core-idea",
        title: "4. Core Idea",
        // Numbered so each step of the core algorithm is explicit (tutorial style).
        body: def.coreIdeaAppendix
          ? `${numberedList(def.coreIdea)}\n\n${def.coreIdeaAppendix}`
          : numberedList(def.coreIdea),
      },
      {
        id: "key-invariant",
        title: "5. Key Invariant or Correctness Idea",
        body: `${def.invariant}\n\n${proofMarkdown(def)}`,
      },
      {
        id: "common-variants",
        title: "6. Common Variants",
        body: variantsMarkdown(def.variants),
      },
      {
        id: "cpp17-templates",
        title: "7. C++17 Templates",
        body: `The templates are intentionally compact and LeetCode-oriented. Adapt names and return types to the problem statement.\n\n${templateMarkdown(def.templateKeys)}`,
      },
      {
        id: "complexity-analysis",
        title: "8. Complexity Analysis",
        body: bulletList(def.complexity),
      },
      {
        id: "common-mistakes",
        title: "9. Common Mistakes",
        body: bulletList(def.mistakes),
      },
      {
        id: "practice-problems",
        title: "10. LeetCode Problems",
        body: practiceMarkdown(def.practice),
      },
      {
        id: "recognition-checklist",
        title: "11. Recognition Checklist",
        body: recognitionMarkdown(def.recognition),
      },
      {
        id: "related-topics",
        title: "12. Related Topics",
        body: relatedMarkdown(def.related),
      },
    ],
  };
}

export const PATTERN_HANDBOOK_TOPICS: HandbookTopic[] = TOPIC_DEFINITIONS.map(
  (def) => assertSectionsAreValid(createTopic(def)),
);
