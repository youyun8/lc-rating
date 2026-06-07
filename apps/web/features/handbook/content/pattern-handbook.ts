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
}

const TEMPLATES: Record<string, TemplateBlock> = {
  "constraint_scan": {
    "summary": "C++17 Template: Constraint-Guided Scan",
    "code": "// C++17 Template: Constraint-Guided Scan\nclass Solution {\n public:\n  long long countSubarraysAtMost(vector<int>& nums, long long limit) {\n    long long answer = 0;\n    long long window_sum = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (left <= right && window_sum > limit) {\n        window_sum -= nums[left];\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};"
  },
  "brute_force_to_prefix": {
    "summary": "C++17 Template: Replace Inner Work with Prefix State",
    "code": "// C++17 Template: Replace Inner Work with Prefix State\nclass Solution {\n public:\n  int minSubarray(vector<int>& nums, int p) {\n    long long total = 0;\n    for (int value : nums) {\n      total += value;\n    }\n\n    const int target = static_cast<int>(total % p);\n    if (target == 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> last_index;\n    last_index[0] = -1;\n    int prefix = 0;\n    int answer = nums.size();\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      prefix = (prefix + nums[i]) % p;\n      const int need = (prefix - target + p) % p;\n      if (last_index.count(need) != 0) {\n        answer = min(answer, i - last_index[need]);\n      }\n      last_index[prefix] = i;\n    }\n\n    return answer == static_cast<int>(nums.size()) ? -1 : answer;\n  }\n};"
  },
  "answer_search": {
    "summary": "C++17 Template: Binary Search on Answer",
    "code": "// C++17 Template: Binary Search on Answer\nclass Solution {\n public:\n  int shipWithinDays(vector<int>& weights, int days) {\n    int low = 0;\n    long long high_sum = 0;\n    for (int weight : weights) {\n      low = max(low, weight);\n      high_sum += weight;\n    }\n    int high = static_cast<int>(high_sum);\n\n    auto can_ship = [&](int capacity) {\n      int used_days = 1;\n      int load = 0;\n      for (int weight : weights) {\n        if (load + weight > capacity) {\n          ++used_days;\n          load = 0;\n        }\n        load += weight;\n      }\n      return used_days <= days;\n    };\n\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (can_ship(mid)) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};"
  },
  "loop_invariant_binary_search": {
    "summary": "C++17 Template: Lower Bound with Loop Invariant",
    "code": "// C++17 Template: Lower Bound with Loop Invariant\nclass Solution {\n public:\n  int lowerBound(vector<int>& nums, int target) {\n    int low = 0;\n    int high = nums.size();\n\n    // Invariant: every index < low is too small; every index >= high is valid.\n    while (low < high) {\n      const int mid = low + (high - low) / 2;\n      if (nums[mid] >= target) {\n        high = mid;\n      } else {\n        low = mid + 1;\n      }\n    }\n\n    return low;\n  }\n};"
  },
  "enumerate_middle": {
    "summary": "C++17 Template: Enumerate Middle with Fenwick Counts",
    "code": "// C++17 Template: Enumerate Middle with Fenwick Counts\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  long long countIncreasingTriplets(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree left_tree(values.size());\n    FenwickTree right_tree(values.size());\n    for (int value : nums) {\n      right_tree.add(rankOf(values, value), 1);\n    }\n\n    long long answer = 0;\n    for (int value : nums) {\n      const int rank = rankOf(values, value);\n      right_tree.add(rank, -1);\n      const long long smaller_left = left_tree.query(rank - 1);\n      const long long greater_right =\n          right_tree.query(values.size()) - right_tree.query(rank);\n      answer += smaller_left * greater_right;\n      left_tree.add(rank, 1);\n    }\n\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& values, int value) const {\n    return lower_bound(values.begin(), values.end(), value) - values.begin() + 1;\n  }\n};"
  },
  "subset_enumeration": {
    "summary": "C++17 Template: Submask Enumeration",
    "code": "// C++17 Template: Submask Enumeration\nclass Solution {\n public:\n  int bestSubsetScore(vector<int>& score) {\n    const int n = score.size();\n    const int mask_count = 1 << n;\n    vector<int> dp(mask_count, 0);\n\n    for (int mask = 1; mask < mask_count; ++mask) {\n      for (int submask = mask; submask > 0; submask = (submask - 1) & mask) {\n        const int remaining = mask ^ submask;\n        dp[mask] = max(dp[mask], dp[remaining] + valueOf(submask, score));\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n\n private:\n  int valueOf(int mask, const vector<int>& score) const {\n    int value = 0;\n    for (int bit = 0; bit < static_cast<int>(score.size()); ++bit) {\n      if (((mask >> bit) & 1) != 0) {\n        value += score[bit];\n      }\n    }\n    return value;\n  }\n};"
  },
  "contribution_mono": {
    "summary": "C++17 Template: Sum of Subarray Minimums Style",
    "code": "// C++17 Template: Sum of Subarray Minimums Style\nclass Solution {\n public:\n  int sumSubarrayMins(vector<int>& arr) {\n    const int kMod = 1'000'000'007;\n    const int n = arr.size();\n    vector<int> left(n);\n    vector<int> right(n);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] > arr[i]) {\n        stack_indices.pop_back();\n      }\n      left[i] = stack_indices.empty() ? -1 : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    stack_indices.clear();\n    for (int i = n - 1; i >= 0; --i) {\n      while (!stack_indices.empty() && arr[stack_indices.back()] >= arr[i]) {\n        stack_indices.pop_back();\n      }\n      right[i] = stack_indices.empty() ? n : stack_indices.back();\n      stack_indices.push_back(i);\n    }\n\n    long long answer = 0;\n    for (int i = 0; i < n; ++i) {\n      const long long left_choices = i - left[i];\n      const long long right_choices = right[i] - i;\n      answer = (answer + left_choices * right_choices % kMod * arr[i]) % kMod;\n    }\n    return static_cast<int>(answer);\n  }\n};"
  },
  "pair_contribution": {
    "summary": "C++17 Template: Pair Contribution after Sorting",
    "code": "// C++17 Template: Pair Contribution after Sorting\nclass Solution {\n public:\n  long long sumPairDistances(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    long long answer = 0;\n    long long prefix_sum = 0;\n\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      answer += 1LL * nums[i] * i - prefix_sum;\n      prefix_sum += nums[i];\n    }\n\n    return answer;\n  }\n};"
  },
  "prefix_contribution": {
    "summary": "C++17 Template: Prefix and Suffix Contribution",
    "code": "// C++17 Template: Prefix and Suffix Contribution\nclass Solution {\n public:\n  long long countSplitsWithLeftMax(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> prefix_max(n);\n    vector<int> suffix_min(n);\n\n    for (int i = 0; i < n; ++i) {\n      prefix_max[i] = i == 0 ? nums[i] : max(prefix_max[i - 1], nums[i]);\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix_min[i] = i + 1 == n ? nums[i] : min(suffix_min[i + 1], nums[i]);\n    }\n\n    long long answer = 0;\n    for (int cut = 0; cut + 1 < n; ++cut) {\n      if (prefix_max[cut] <= suffix_min[cut + 1]) {\n        ++answer;\n      }\n    }\n    return answer;\n  }\n};"
  },
  "longest_window": {
    "summary": "C++17 Template: Longest Valid Window",
    "code": "// C++17 Template: Longest Valid Window\nclass Solution {\n public:\n  int longestOnes(vector<int>& nums, int k) {\n    int zero_count = 0;\n    int left = 0;\n    int answer = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      if (nums[right] == 0) {\n        ++zero_count;\n      }\n      while (zero_count > k) {\n        if (nums[left] == 0) {\n          --zero_count;\n        }\n        ++left;\n      }\n      answer = max(answer, right - left + 1);\n    }\n\n    return answer;\n  }\n};"
  },
  "shortest_window": {
    "summary": "C++17 Template: Shortest Valid Window",
    "code": "// C++17 Template: Shortest Valid Window\nclass Solution {\n public:\n  int minSubArrayLen(int target, vector<int>& nums) {\n    int answer = nums.size() + 1;\n    int left = 0;\n    long long window_sum = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      window_sum += nums[right];\n      while (window_sum >= target) {\n        answer = min(answer, right - left + 1);\n        window_sum -= nums[left];\n        ++left;\n      }\n    }\n\n    return answer == static_cast<int>(nums.size()) + 1 ? 0 : answer;\n  }\n};"
  },
  "at_most_k_distinct": {
    "summary": "C++17 Template: Count Subarrays with At Most K Distinct Values",
    "code": "// C++17 Template: Count Subarrays with At Most K Distinct Values\nclass Solution {\n public:\n  long long subarraysWithAtMostKDistinct(vector<int>& nums, int k) {\n    unordered_map<int, int> frequency;\n    long long answer = 0;\n    int left = 0;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n\n    return answer;\n  }\n};"
  },
  "exactly_k_distinct": {
    "summary": "C++17 Template: Exactly K via At Most",
    "code": "// C++17 Template: Exactly K via At Most\nclass Solution {\n public:\n  int subarraysWithKDistinct(vector<int>& nums, int k) {\n    return atMost(nums, k) - atMost(nums, k - 1);\n  }\n\n private:\n  int atMost(const vector<int>& nums, int k) {\n    if (k < 0) {\n      return 0;\n    }\n\n    unordered_map<int, int> frequency;\n    int answer = 0;\n    int left = 0;\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      ++frequency[nums[right]];\n      while (static_cast<int>(frequency.size()) > k) {\n        --frequency[nums[left]];\n        if (frequency[nums[left]] == 0) {\n          frequency.erase(nums[left]);\n        }\n        ++left;\n      }\n      answer += right - left + 1;\n    }\n    return answer;\n  }\n};"
  },
  "bitwise_or_window": {
    "summary": "C++17 Template: Bitwise OR Window with Bit Counts",
    "code": "// C++17 Template: Bitwise OR Window with Bit Counts\nclass Solution {\n public:\n  int minimumSubarrayLength(vector<int>& nums, int k) {\n    const int n = nums.size();\n    vector<int> bit_count(kMaxBits, 0);\n    int answer = n + 1;\n    int left = 0;\n\n    for (int right = 0; right < n; ++right) {\n      addValue(nums[right], &bit_count);\n      while (left <= right && currentOr(bit_count) >= k) {\n        answer = min(answer, right - left + 1);\n        removeValue(nums[left], &bit_count);\n        ++left;\n      }\n    }\n\n    return answer == n + 1 ? -1 : answer;\n  }\n\n private:\n  static constexpr int kMaxBits = 31;\n\n  void addValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        ++(*bit_count)[bit];\n      }\n    }\n  }\n\n  void removeValue(int value, vector<int>* bit_count) const {\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (((value >> bit) & 1) != 0) {\n        --(*bit_count)[bit];\n      }\n    }\n  }\n\n  int currentOr(const vector<int>& bit_count) const {\n    int value = 0;\n    for (int bit = 0; bit < kMaxBits; ++bit) {\n      if (bit_count[bit] > 0) {\n        value |= 1 << bit;\n      }\n    }\n    return value;\n  }\n};"
  },
  "prefix_suffix_counts": {
    "summary": "C++17 Template: Prefix/Suffix Counts around a Pivot",
    "code": "// C++17 Template: Prefix/Suffix Counts around a Pivot\nclass Solution {\n public:\n  long long countPatternAroundMiddle(string s) {\n    const int n = s.size();\n    vector<array<int, 10>> prefix(n + 1);\n    vector<array<int, 10>> suffix(n + 1);\n\n    for (int i = 0; i < n; ++i) {\n      prefix[i + 1] = prefix[i];\n      ++prefix[i + 1][s[i] - '0'];\n    }\n    for (int i = n - 1; i >= 0; --i) {\n      suffix[i] = suffix[i + 1];\n      ++suffix[i][s[i] - '0'];\n    }\n\n    long long answer = 0;\n    for (int middle = 0; middle < n; ++middle) {\n      for (int digit = 0; digit < 10; ++digit) {\n        answer += 1LL * prefix[middle][digit] * suffix[middle + 1][digit];\n      }\n    }\n    return answer;\n  }\n};"
  },
  "difference_array": {
    "summary": "C++17 Template: Difference Array Range Add",
    "code": "// C++17 Template: Difference Array Range Add\nclass Solution {\n public:\n  vector<long long> applyRangeUpdates(int n, vector<vector<int>>& updates) {\n    vector<long long> diff(n + 1, 0);\n    for (const auto& update : updates) {\n      const int left = update[0];\n      const int right = update[1];\n      const int delta = update[2];\n      diff[left] += delta;\n      if (right + 1 < n) {\n        diff[right + 1] -= delta;\n      }\n    }\n\n    vector<long long> answer(n, 0);\n    long long running = 0;\n    for (int i = 0; i < n; ++i) {\n      running += diff[i];\n      answer[i] = running;\n    }\n    return answer;\n  }\n};"
  },
  "difference_matrix": {
    "summary": "C++17 Template: 2D Difference Array",
    "code": "// C++17 Template: 2D Difference Array\nclass Solution {\n public:\n  vector<vector<int>> rangeAddQueries(int n, vector<vector<int>>& queries) {\n    vector<vector<int>> diff(n + 1, vector<int>(n + 1, 0));\n    for (const auto& query : queries) {\n      const int row1 = query[0];\n      const int col1 = query[1];\n      const int row2 = query[2];\n      const int col2 = query[3];\n      ++diff[row1][col1];\n      --diff[row2 + 1][col1];\n      --diff[row1][col2 + 1];\n      ++diff[row2 + 1][col2 + 1];\n    }\n\n    vector<vector<int>> answer(n, vector<int>(n, 0));\n    for (int row = 0; row < n; ++row) {\n      for (int col = 0; col < n; ++col) {\n        int value = diff[row][col];\n        if (row > 0) {\n          value += answer[row - 1][col];\n        }\n        if (col > 0) {\n          value += answer[row][col - 1];\n        }\n        if (row > 0 && col > 0) {\n          value -= answer[row - 1][col - 1];\n        }\n        answer[row][col] = value;\n      }\n    }\n    return answer;\n  }\n};"
  },
  "monotonic_stack": {
    "summary": "C++17 Template: Monotonic Stack Boundaries",
    "code": "// C++17 Template: Monotonic Stack Boundaries\nclass Solution {\n public:\n  vector<int> nextGreaterElements(vector<int>& nums) {\n    const int n = nums.size();\n    vector<int> answer(n, -1);\n    vector<int> stack_indices;\n\n    for (int i = 0; i < n; ++i) {\n      while (!stack_indices.empty() && nums[stack_indices.back()] < nums[i]) {\n        answer[stack_indices.back()] = nums[i];\n        stack_indices.pop_back();\n      }\n      stack_indices.push_back(i);\n    }\n\n    return answer;\n  }\n};"
  },
  "monotonic_deque": {
    "summary": "C++17 Template: Monotonic Deque Window Maximum",
    "code": "// C++17 Template: Monotonic Deque Window Maximum\nclass Solution {\n public:\n  vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> indices;\n    vector<int> answer;\n\n    for (int right = 0; right < static_cast<int>(nums.size()); ++right) {\n      while (!indices.empty() && indices.front() <= right - k) {\n        indices.pop_front();\n      }\n      while (!indices.empty() && nums[indices.back()] <= nums[right]) {\n        indices.pop_back();\n      }\n      indices.push_back(right);\n      if (right + 1 >= k) {\n        answer.push_back(nums[indices.front()]);\n      }\n    }\n\n    return answer;\n  }\n};"
  },
  "coordinate_compression_fenwick": {
    "summary": "C++17 Template: Coordinate Compression with Fenwick Tree",
    "code": "// C++17 Template: Coordinate Compression with Fenwick Tree\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countSmaller(vector<int>& nums) {\n    vector<int> values = nums;\n    sort(values.begin(), values.end());\n    values.erase(unique(values.begin(), values.end()), values.end());\n\n    FenwickTree tree(values.size());\n    vector<int> answer(nums.size(), 0);\n    for (int i = static_cast<int>(nums.size()) - 1; i >= 0; --i) {\n      const int rank = lower_bound(values.begin(), values.end(), nums[i]) -\n                       values.begin() + 1;\n      answer[i] = tree.query(rank - 1);\n      tree.add(rank, 1);\n    }\n    return answer;\n  }\n};"
  },
  "exchange_greedy": {
    "summary": "C++17 Template: Greedy by Earliest Finish",
    "code": "// C++17 Template: Greedy by Earliest Finish\nclass Solution {\n public:\n  int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end(), [](const auto& left, const auto& right) {\n      return left[1] < right[1];\n    });\n\n    int kept = 0;\n    int current_end = numeric_limits<int>::min();\n    for (const auto& interval : intervals) {\n      if (interval[0] >= current_end) {\n        ++kept;\n        current_end = interval[1];\n      }\n    }\n\n    return intervals.size() - kept;\n  }\n};"
  },
  "interval_cover_greedy": {
    "summary": "C++17 Template: Greedy Stays Ahead for Interval Cover",
    "code": "// C++17 Template: Greedy Stays Ahead for Interval Cover\nclass Solution {\n public:\n  int minIntervalsToCover(vector<vector<int>>& intervals, int target_right) {\n    sort(intervals.begin(), intervals.end());\n    int answer = 0;\n    int index = 0;\n    int current_end = 0;\n\n    while (current_end < target_right) {\n      int farthest = current_end;\n      while (index < static_cast<int>(intervals.size()) &&\n             intervals[index][0] <= current_end) {\n        farthest = max(farthest, intervals[index][1]);\n        ++index;\n      }\n      if (farthest == current_end) {\n        return -1;\n      }\n      current_end = farthest;\n      ++answer;\n    }\n\n    return answer;\n  }\n};"
  },
  "greedy_builder": {
    "summary": "C++17 Template: Greedy Construction with Feasibility Check",
    "code": "// C++17 Template: Greedy Construction with Feasibility Check\nclass Solution {\n public:\n  string buildSmallestString(int n, int total_value) {\n    string answer;\n    int remaining_value = total_value;\n\n    for (int position = 0; position < n; ++position) {\n      for (char candidate = 'a'; candidate <= 'z'; ++candidate) {\n        const int value = candidate - 'a' + 1;\n        if (canFinish(n - position - 1, remaining_value - value)) {\n          answer.push_back(candidate);\n          remaining_value -= value;\n          break;\n        }\n      }\n    }\n\n    return answer;\n  }\n\n private:\n  bool canFinish(int remaining_slots, int remaining_value) const {\n    const int min_value = remaining_slots;\n    const int max_value = 26 * remaining_slots;\n    return min_value <= remaining_value && remaining_value <= max_value;\n  }\n};"
  },
  "greedy_lexicographic": {
    "summary": "C++17 Template: Lexicographically Smallest Subsequence with Quota",
    "code": "// C++17 Template: Lexicographically Smallest Subsequence with Quota\nclass Solution {\n public:\n  string smallestSubsequence(string s, int k, char letter, int repetition) {\n    int remaining_letter = 0;\n    for (char ch : s) {\n      if (ch == letter) {\n        ++remaining_letter;\n      }\n    }\n\n    string stack_chars;\n    int used_letter = 0;\n    for (int i = 0; i < static_cast<int>(s.size()); ++i) {\n      const char ch = s[i];\n      const int remaining_slots = static_cast<int>(s.size()) - i;\n      while (!stack_chars.empty() && stack_chars.back() > ch &&\n             static_cast<int>(stack_chars.size()) - 1 + remaining_slots >= k) {\n        if (stack_chars.back() == letter) {\n          if (used_letter - 1 + remaining_letter < repetition) {\n            break;\n          }\n          --used_letter;\n        }\n        stack_chars.pop_back();\n      }\n\n      if (static_cast<int>(stack_chars.size()) < k) {\n        if (ch == letter) {\n          stack_chars.push_back(ch);\n          ++used_letter;\n        } else if (k - static_cast<int>(stack_chars.size()) >\n                   repetition - used_letter) {\n          stack_chars.push_back(ch);\n        }\n      }\n\n      if (ch == letter) {\n        --remaining_letter;\n      }\n    }\n\n    return stack_chars;\n  }\n};"
  },
  "remaining_sum_construction": {
    "summary": "C++17 Template: Remaining Sum Feasibility",
    "code": "// C++17 Template: Remaining Sum Feasibility\nclass Solution {\n public:\n  string getSmallestString(int n, int k) {\n    string answer(n, 'a');\n    k -= n;\n\n    for (int i = n - 1; i >= 0 && k > 0; --i) {\n      const int add = min(25, k);\n      answer[i] = static_cast<char>('a' + add);\n      k -= add;\n    }\n\n    return answer;\n  }\n};"
  },
  "frequency_construction": {
    "summary": "C++17 Template: Frequency-Based Construction",
    "code": "// C++17 Template: Frequency-Based Construction\nclass Solution {\n public:\n  string reorganizeString(string s) {\n    array<int, 26> frequency{};\n    for (char ch : s) {\n      ++frequency[ch - 'a'];\n    }\n\n    priority_queue<pair<int, char>> heap;\n    for (int i = 0; i < 26; ++i) {\n      if (frequency[i] > 0) {\n        heap.push({frequency[i], static_cast<char>('a' + i)});\n      }\n    }\n\n    string answer;\n    while (!heap.empty()) {\n      auto first = heap.top();\n      heap.pop();\n      if (!answer.empty() && answer.back() == first.second) {\n        if (heap.empty()) {\n          return \"\";\n        }\n        auto second = heap.top();\n        heap.pop();\n        answer.push_back(second.second);\n        if (--second.first > 0) {\n          heap.push(second);\n        }\n        heap.push(first);\n      } else {\n        answer.push_back(first.second);\n        if (--first.first > 0) {\n          heap.push(first);\n        }\n      }\n    }\n\n    return answer;\n  }\n};"
  },
  "mst_kruskal": {
    "summary": "C++17 Template: Cut Property with Kruskal",
    "code": "// C++17 Template: Cut Property with Kruskal\nclass DisjointSet {\n public:\n  explicit DisjointSet(int n) : parent_(n), size_(n, 1) {\n    iota(parent_.begin(), parent_.end(), 0);\n  }\n\n  int findRoot(int node) {\n    if (parent_[node] != node) {\n      parent_[node] = findRoot(parent_[node]);\n    }\n    return parent_[node];\n  }\n\n  bool unite(int left, int right) {\n    int root_left = findRoot(left);\n    int root_right = findRoot(right);\n    if (root_left == root_right) {\n      return false;\n    }\n    if (size_[root_left] < size_[root_right]) {\n      swap(root_left, root_right);\n    }\n    parent_[root_right] = root_left;\n    size_[root_left] += size_[root_right];\n    return true;\n  }\n\n private:\n  vector<int> parent_;\n  vector<int> size_;\n};\n\nclass Solution {\n public:\n  int minimumCost(int n, vector<vector<int>>& edges) {\n    sort(edges.begin(), edges.end(), [](const auto& left, const auto& right) {\n      return left[2] < right[2];\n    });\n\n    DisjointSet dsu(n);\n    int total_cost = 0;\n    int used_edges = 0;\n    for (const auto& edge : edges) {\n      if (dsu.unite(edge[0], edge[1])) {\n        total_cost += edge[2];\n        ++used_edges;\n      }\n    }\n\n    return used_edges == n - 1 ? total_cost : -1;\n  }\n};"
  },
  "state_bfs": {
    "summary": "C++17 Template: BFS with Explicit State",
    "code": "// C++17 Template: BFS with Explicit State\nclass Solution {\n public:\n  int shortestPathLength(vector<vector<int>>& graph) {\n    const int n = graph.size();\n    const int full_mask = (1 << n) - 1;\n    queue<pair<int, int>> states;\n    vector<vector<int>> distance(n, vector<int>(1 << n, -1));\n\n    for (int node = 0; node < n; ++node) {\n      const int mask = 1 << node;\n      states.push({node, mask});\n      distance[node][mask] = 0;\n    }\n\n    while (!states.empty()) {\n      const auto [node, mask] = states.front();\n      states.pop();\n      if (mask == full_mask) {\n        return distance[node][mask];\n      }\n      for (int next_node : graph[node]) {\n        const int next_mask = mask | (1 << next_node);\n        if (distance[next_node][next_mask] == -1) {\n          distance[next_node][next_mask] = distance[node][mask] + 1;\n          states.push({next_node, next_mask});\n        }\n      }\n    }\n\n    return 0;\n  }\n};"
  },
  "bitmask_dp": {
    "summary": "C++17 Template: Assignment State Compression DP",
    "code": "// C++17 Template: Assignment State Compression DP\nclass Solution {\n public:\n  int minimumXORSum(vector<int>& nums1, vector<int>& nums2) {\n    const int n = nums1.size();\n    const int mask_count = 1 << n;\n    const int kInf = 1'000'000'000;\n    vector<int> dp(mask_count, kInf);\n    dp[0] = 0;\n\n    for (int mask = 0; mask < mask_count; ++mask) {\n      const int index = __builtin_popcount(static_cast<unsigned>(mask));\n      if (index >= n) {\n        continue;\n      }\n      for (int j = 0; j < n; ++j) {\n        if (((mask >> j) & 1) == 0) {\n          const int next_mask = mask | (1 << j);\n          dp[next_mask] = min(dp[next_mask], dp[mask] + (nums1[index] ^ nums2[j]));\n        }\n      }\n    }\n\n    return dp[mask_count - 1];\n  }\n};"
  },
  "offline_fenwick": {
    "summary": "C++17 Template: Offline Queries Sorted by Threshold",
    "code": "// C++17 Template: Offline Queries Sorted by Threshold\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 1, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nstruct Query {\n  int left;\n  int right;\n  int limit;\n  int index;\n};\n\nclass Solution {\n public:\n  vector<int> countValuesAtMost(vector<int>& nums, vector<Query>& queries) {\n    vector<pair<int, int>> values;\n    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {\n      values.push_back({nums[i], i + 1});\n    }\n    sort(values.begin(), values.end());\n    sort(queries.begin(), queries.end(), [](const Query& left, const Query& right) {\n      return left.limit < right.limit;\n    });\n\n    FenwickTree tree(nums.size());\n    vector<int> answer(queries.size(), 0);\n    int value_index = 0;\n    for (const Query& query : queries) {\n      while (value_index < static_cast<int>(values.size()) &&\n             values[value_index].first <= query.limit) {\n        tree.add(values[value_index].second, 1);\n        ++value_index;\n      }\n      answer[query.index] = tree.query(query.right + 1) - tree.query(query.left);\n    }\n    return answer;\n  }\n};"
  },
  "sweep_events": {
    "summary": "C++17 Template: Event Sorting Sweep",
    "code": "// C++17 Template: Event Sorting Sweep\nclass Solution {\n public:\n  int maximumOverlap(vector<vector<int>>& intervals) {\n    vector<pair<int, int>> events;\n    for (const auto& interval : intervals) {\n      events.push_back({interval[0], 1});\n      events.push_back({interval[1] + 1, -1});\n    }\n    sort(events.begin(), events.end());\n\n    int active = 0;\n    int answer = 0;\n    for (const auto& [coordinate, delta] : events) {\n      active += delta;\n      answer = max(answer, active);\n    }\n    return answer;\n  }\n};"
  },
  "sweep_difference": {
    "summary": "C++17 Template: Difference Events",
    "code": "// C++17 Template: Difference Events\nclass Solution {\n public:\n  vector<int> fullBloomFlowers(vector<vector<int>>& flowers, vector<int>& people) {\n    map<int, int> events;\n    for (const auto& flower : flowers) {\n      ++events[flower[0]];\n      --events[flower[1] + 1];\n    }\n\n    vector<pair<int, int>> queries;\n    for (int i = 0; i < static_cast<int>(people.size()); ++i) {\n      queries.push_back({people[i], i});\n    }\n    sort(queries.begin(), queries.end());\n\n    vector<int> answer(people.size(), 0);\n    auto event_it = events.begin();\n    int active = 0;\n    for (const auto& [time, index] : queries) {\n      while (event_it != events.end() && event_it->first <= time) {\n        active += event_it->second;\n        ++event_it;\n      }\n      answer[index] = active;\n    }\n    return answer;\n  }\n};"
  },
  "sweep_heap": {
    "summary": "C++17 Template: Heap-Based Sweep",
    "code": "// C++17 Template: Heap-Based Sweep\nclass Solution {\n public:\n  int minMeetingRooms(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    priority_queue<int, vector<int>, greater<int>> end_times;\n    int answer = 0;\n\n    for (const auto& interval : intervals) {\n      while (!end_times.empty() && end_times.top() <= interval[0]) {\n        end_times.pop();\n      }\n      end_times.push(interval[1]);\n      answer = max(answer, static_cast<int>(end_times.size()));\n    }\n\n    return answer;\n  }\n};"
  },
  "sweep_compressed_fenwick": {
    "summary": "C++17 Template: Compressed Sweep with Range Add",
    "code": "// C++17 Template: Compressed Sweep with Range Add\nclass FenwickTree {\n public:\n  explicit FenwickTree(int size) : tree_(size + 2, 0) {}\n\n  void add(int index, int delta) {\n    for (int i = index; i < static_cast<int>(tree_.size()); i += i & -i) {\n      tree_[i] += delta;\n    }\n  }\n\n  int query(int index) const {\n    int result = 0;\n    for (int i = index; i > 0; i -= i & -i) {\n      result += tree_[i];\n    }\n    return result;\n  }\n\n private:\n  vector<int> tree_;\n};\n\nclass Solution {\n public:\n  vector<int> countCoveredPoints(vector<vector<int>>& intervals, vector<int>& points) {\n    vector<int> coords = points;\n    for (const auto& interval : intervals) {\n      coords.push_back(interval[0]);\n      coords.push_back(interval[1] + 1);\n    }\n    sort(coords.begin(), coords.end());\n    coords.erase(unique(coords.begin(), coords.end()), coords.end());\n\n    FenwickTree tree(coords.size() + 2);\n    for (const auto& interval : intervals) {\n      const int left = rankOf(coords, interval[0]);\n      const int right_after = rankOf(coords, interval[1] + 1);\n      tree.add(left, 1);\n      tree.add(right_after, -1);\n    }\n\n    vector<int> answer;\n    for (int point : points) {\n      answer.push_back(tree.query(rankOf(coords, point)));\n    }\n    return answer;\n  }\n\n private:\n  int rankOf(const vector<int>& coords, int value) const {\n    return lower_bound(coords.begin(), coords.end(), value) - coords.begin() + 1;\n  }\n};"
  },
  "dp_state": {
    "summary": "C++17 Template: DP State with Directional Bests",
    "code": "// C++17 Template: DP State with Directional Bests\nclass Solution {\n public:\n  long long maxPoints(vector<vector<int>>& points) {\n    const int rows = points.size();\n    const int cols = points[0].size();\n    vector<long long> dp(cols, 0);\n\n    for (int row = 0; row < rows; ++row) {\n      vector<long long> left_best(cols, 0);\n      vector<long long> right_best(cols, 0);\n      left_best[0] = dp[0];\n      for (int col = 1; col < cols; ++col) {\n        left_best[col] = max(left_best[col - 1] - 1, dp[col]);\n      }\n      right_best[cols - 1] = dp[cols - 1];\n      for (int col = cols - 2; col >= 0; --col) {\n        right_best[col] = max(right_best[col + 1] - 1, dp[col]);\n      }\n\n      vector<long long> next_dp(cols, 0);\n      for (int col = 0; col < cols; ++col) {\n        next_dp[col] = points[row][col] + max(left_best[col], right_best[col]);\n      }\n      dp.swap(next_dp);\n    }\n\n    return *max_element(dp.begin(), dp.end());\n  }\n};"
  },
  "dp_transition": {
    "summary": "C++17 Template: Interval DP Transition",
    "code": "// C++17 Template: Interval DP Transition\nclass Solution {\n public:\n  int minCost(int n, vector<int>& cuts) {\n    cuts.push_back(0);\n    cuts.push_back(n);\n    sort(cuts.begin(), cuts.end());\n\n    const int m = cuts.size();\n    vector<vector<int>> dp(m, vector<int>(m, 0));\n    for (int length = 2; length < m; ++length) {\n      for (int left = 0; left + length < m; ++left) {\n        const int right = left + length;\n        dp[left][right] = numeric_limits<int>::max();\n        for (int mid = left + 1; mid < right; ++mid) {\n          dp[left][right] = min(\n              dp[left][right],\n              dp[left][mid] + dp[mid][right] + cuts[right] - cuts[left]);\n        }\n      }\n    }\n\n    return dp[0][m - 1];\n  }\n};"
  }
};

const TOPIC_DEFINITIONS: PatternTopicDefinition[] = [
  {
    "slug": "constraint-driven-thinking",
    "title": "Constraint-Driven Thinking",
    "group": "Problem-Solving Mindset",
    "icon": "Gauge",
    "tagline": "Infer viable algorithms from n, q, value ranges, and operation counts before choosing a pattern.",
    "concept": [
      "Constraint-driven thinking is the habit of converting input limits into an algorithm budget.",
      "It prevents guessing by asking whether O(n^2), O(n log n), O(q log n), or O(2^n) can pass.",
      "The goal is to reduce the search space of possible techniques before writing code."
    ],
    "motivation": [
      "Brute force starts by simulating the statement literally, then comparing its operation count to the limit.",
      "When the count misses by a factor of n, look for prefix state, sorting, a window, a heap, or offline processing.",
      "When n is small but states repeat, spend exponential time only over compressed states."
    ],
    "whenUse": [
      "Large n with simple operations usually asks for a maintained summary, not nested loops.",
      "Large q with static data usually asks for precomputation, offline sorting, or a tree.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Estimate the allowed operations first, then pick the weakest pattern that fits.",
      "Record whether values are bounded enough for counting arrays or need compression.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "At every design step, the proposed algorithm must fit both the input size and the value/query dimensions; otherwise it is only a sketch, not a solution.",
    "variants": [
      "Small n: subset or backtracking with pruning.",
      "Large n, few queries: one scan or sorting.",
      "Large q: offline processing, Fenwick/segment tree, or precomputation.",
      "Bounded value domain: counting, buckets, or bit tricks."
    ],
    "templateKeys": [
      "constraint_scan",
      "answer_search"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1590,
        "title": "Make Sum Divisible by P",
        "slug": "make-sum-divisible-by-p",
        "rating": 2039,
        "difficulty": "Medium/Hard",
        "subPattern": "prefix modulo",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1838,
        "title": "Frequency of the Most Frequent Element",
        "slug": "frequency-of-the-most-frequent-element",
        "rating": 1876,
        "difficulty": "Medium",
        "subPattern": "sort + window",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2092,
        "title": "Find all People with Secret",
        "slug": "find-all-people-with-secret",
        "rating": 2004,
        "difficulty": "Medium/Hard",
        "subPattern": "time-grouped graph",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 1898,
        "title": "Maximum Number of Removable Characters",
        "slug": "maximum-number-of-removable-characters",
        "rating": 1913,
        "difficulty": "Medium",
        "subPattern": "monotone deletion check",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2040,
        "title": "Kth Smallest Product of Two Sorted Arrays",
        "slug": "kth-smallest-product-of-two-sorted-arrays",
        "rating": 2518,
        "difficulty": "Hard",
        "subPattern": "value-space counting",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 2736,
        "title": "Maximum Sum Queries",
        "slug": "maximum-sum-queries",
        "rating": 2533,
        "difficulty": "Hard",
        "subPattern": "offline dominance query",
        "why": "Forces an algorithm choice from n, value bounds, and query count instead of from topic tags.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "brute-force-to-optimization",
      "state-design",
      "offline-query-processing",
      "binary-search-on-answer"
    ]
  },
  {
    "slug": "brute-force-to-optimization",
    "title": "Brute Force to Optimization",
    "group": "Problem-Solving Mindset",
    "icon": "TrendingUp",
    "tagline": "Turn a correct slow solution into maintained state, precomputation, or a different enumeration order.",
    "concept": [
      "This pattern treats brute force as a diagnostic tool: it reveals which work is repeated.",
      "Optimization usually means preserving the same correctness argument while changing the cost model.",
      "The useful question is not \"what trick applies?\" but \"what value did I recompute?\""
    ],
    "motivation": [
      "Start with all objects: all subarrays, pairs, cuts, paths, masks, or query answers.",
      "Mark the repeated inner calculation and replace it with prefix sums, hashing, sorting, a data structure, or contribution counting.",
      "Keep the brute force nearby as a mental oracle for stress tests and edge cases."
    ],
    "whenUse": [
      "The statement has a clear O(n^2) or O(n^3) enumeration that is correct but too slow.",
      "A range sum, count, min/max, or feasibility result is recomputed for overlapping objects.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Write the brute force in words, not code, then cross out the repeated computation.",
      "Preserve the same answer decomposition while changing how each piece is queried.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The optimized method must answer exactly the same subquestions as brute force; only the method for retrieving repeated facts changes.",
    "variants": [
      "Prefix sums replace repeated range sums.",
      "Hash maps replace repeated prefix-state searches.",
      "Sorting turns pair conditions into monotone movement.",
      "Contribution counting flips object enumeration into contributor enumeration."
    ],
    "templateKeys": [
      "brute_force_to_prefix",
      "pair_contribution"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2262,
        "title": "Total Appeal of A String",
        "slug": "total-appeal-of-a-string",
        "rating": 2033,
        "difficulty": "Medium/Hard",
        "subPattern": "last-position contribution",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1838,
        "title": "Frequency of the Most Frequent Element",
        "slug": "frequency-of-the-most-frequent-element",
        "rating": 1876,
        "difficulty": "Medium",
        "subPattern": "sort + window",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2025,
        "title": "Maximum Number of Ways to Partition An Array",
        "slug": "maximum-number-of-ways-to-partition-an-array",
        "rating": 2218,
        "difficulty": "Hard",
        "subPattern": "prefix/suffix partition",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2167,
        "title": "Minimum Time to Remove all Cars Containing Illegal Goods",
        "slug": "minimum-time-to-remove-all-cars-containing-illegal-goods",
        "rating": 2219,
        "difficulty": "Hard",
        "subPattern": "prefix/suffix DP",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2916,
        "title": "Subarrays Distinct Element Sum of Squares II",
        "slug": "subarrays-distinct-element-sum-of-squares-ii",
        "rating": 2816,
        "difficulty": "Hard",
        "subPattern": "incremental contribution",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 2281,
        "title": "Sum of Total Strength of Wizards",
        "slug": "sum-of-total-strength-of-wizards",
        "rating": 2621,
        "difficulty": "Hard",
        "subPattern": "monotonic contribution",
        "why": "Shows the exact repeated work that must become prefix, window, sorting, or contribution state.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "constraint-driven-thinking",
      "contribution-counting",
      "prefix-suffix-decomposition",
      "difference-array"
    ]
  },
  {
    "slug": "invariant-thinking",
    "title": "Invariant Thinking",
    "group": "Problem-Solving Mindset",
    "icon": "Crosshair",
    "tagline": "Make every scan, pointer movement, stack update, and greedy choice preserve a named truth.",
    "concept": [
      "An invariant is a sentence that remains true before and after each iteration or committed decision.",
      "It is the bridge between implementation and proof: if the invariant is true at the end, the answer follows.",
      "Most hard bugs in two pointers, binary search, stacks, and greedy code are invariant bugs."
    ],
    "motivation": [
      "Brute force often checks every candidate independently.",
      "The optimized version keeps a partial structure and updates it, so it needs a stronger statement about what that structure means.",
      "The invariant tells you when it is legal to update the answer and which pointer or state may move next."
    ],
    "whenUse": [
      "The algorithm has a loop whose state represents many candidates.",
      "You are unsure whether answer updates happen before or after shrinking, popping, or relaxing.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Write the invariant before the loop.",
      "After every update, ask which line restores the invariant.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The state is always a faithful summary of exactly the candidates it claims to represent; no candidate is silently added, lost, or counted twice.",
    "variants": [
      "Window always valid.",
      "Window shrinks while valid.",
      "Stack remains monotone.",
      "Binary search keeps false/true partitions.",
      "Greedy frontier is never worse than alternatives."
    ],
    "templateKeys": [
      "constraint_scan",
      "loop_invariant_binary_search"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1838,
        "title": "Frequency of the Most Frequent Element",
        "slug": "frequency-of-the-most-frequent-element",
        "rating": 1876,
        "difficulty": "Medium",
        "subPattern": "sort + window",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2302,
        "title": "Count Subarrays with Score Less Than K",
        "slug": "count-subarrays-with-score-less-than-k",
        "rating": 1808,
        "difficulty": "Medium",
        "subPattern": "positive score window",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2398,
        "title": "Maximum Number of Robots Within Budget",
        "slug": "maximum-number-of-robots-within-budget",
        "rating": 1917,
        "difficulty": "Medium",
        "subPattern": "window + monotonic deque",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2444,
        "title": "Count Subarrays with Fixed Bounds",
        "slug": "count-subarrays-with-fixed-bounds",
        "rating": 2093,
        "difficulty": "Medium/Hard",
        "subPattern": "fixed bounds window",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2366,
        "title": "Minimum Replacements to Sort the Array",
        "slug": "minimum-replacements-to-sort-the-array",
        "rating": 2060,
        "difficulty": "Medium/Hard",
        "subPattern": "reverse greedy invariant",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 862,
        "title": "Shortest Subarray with Sum at Least K",
        "slug": "shortest-subarray-with-sum-at-least-k",
        "rating": 2307,
        "difficulty": "Hard",
        "subPattern": "prefix deque invariant",
        "why": "Requires a maintained condition after every pointer, stack, or greedy update.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "loop-invariant",
      "fix-right-maintain-left",
      "monotonic-data-structures",
      "greedy-stays-ahead"
    ]
  },
  {
    "slug": "feasibility-check",
    "title": "Feasibility Check",
    "group": "Problem-Solving Mindset",
    "icon": "PencilRuler",
    "tagline": "Separate optimization from yes/no validation so binary search, greedy construction, and pruning become possible.",
    "concept": [
      "A feasibility check answers whether a candidate value or partial construction can still lead to a valid solution.",
      "It is most powerful when feasibility is monotone: if x works, every easier x also works.",
      "It also guides greedy construction by rejecting choices that would make the suffix impossible."
    ],
    "motivation": [
      "Brute force tries every value or every construction and keeps the best valid one.",
      "Optimization searches the answer space or commits one position at a time, calling a cheaper predicate.",
      "The hard part is proving the predicate is exact and monotone for the chosen direction."
    ],
    "whenUse": [
      "The problem asks minimize maximum, maximize minimum, kth value, lexicographically smallest valid answer, or can/cannot finish.",
      "A candidate can be validated faster than the optimum can be constructed directly.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Define what candidate x means.",
      "Prove whether feasible(x) implies feasible(x + 1) or feasible(x - 1).",
      "Make the predicate independent of binary-search side effects.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The predicate must accept exactly the candidates that have at least one completion; approximate checks break both search and construction.",
    "variants": [
      "Binary search on answer.",
      "Trial filling by lexicographic order.",
      "Greedy with remaining capacity.",
      "DP/backtracking used only as the feasibility oracle."
    ],
    "templateKeys": [
      "answer_search",
      "greedy_builder"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 875,
        "title": "Koko Eating Bananas",
        "slug": "koko-eating-bananas",
        "rating": 1766,
        "difficulty": "Medium",
        "subPattern": "minimum feasible speed",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1011,
        "title": "Capacity to Ship Packages Within D Days",
        "slug": "capacity-to-ship-packages-within-d-days",
        "rating": 1725,
        "difficulty": "Medium",
        "subPattern": "minimum feasible capacity",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1552,
        "title": "Magnetic Force Between Two Balls",
        "slug": "magnetic-force-between-two-balls",
        "rating": 1920,
        "difficulty": "Medium",
        "subPattern": "maximize minimum distance",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2141,
        "title": "Maximum Running Time of N Computers",
        "slug": "maximum-running-time-of-n-computers",
        "rating": 2265,
        "difficulty": "Hard",
        "subPattern": "resource feasibility",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2513,
        "title": "Minimize the Maximum of Two Arrays",
        "slug": "minimize-the-maximum-of-two-arrays",
        "rating": 2302,
        "difficulty": "Hard",
        "subPattern": "number theory feasibility",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3449,
        "title": "Maximize the Minimum Game Score",
        "slug": "maximize-the-minimum-game-score",
        "rating": 2748,
        "difficulty": "Hard",
        "subPattern": "maximize minimum score",
        "why": "Turns optimization into yes/no predicates and checks monotonicity carefully.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "binary-search-on-answer",
      "greedy-construction",
      "constraint-driven-thinking",
      "proof-techniques"
    ]
  },
  {
    "slug": "state-design",
    "title": "State Design",
    "group": "Problem-Solving Mindset",
    "icon": "Layers",
    "tagline": "Choose the smallest state that contains all information needed for future decisions.",
    "concept": [
      "State design is deciding what a node, DP cell, memo key, or search configuration must remember.",
      "A good state is sufficient for future transitions and minimal enough to keep the state space tractable.",
      "It is the core skill behind graph search with extra conditions, DP, memoization, and bitmask problems."
    ],
    "motivation": [
      "Brute force carries the whole history of choices.",
      "Optimization identifies which parts of history affect the future, then encodes only those facts.",
      "If two histories have the same state, they should be interchangeable for the rest of the solution."
    ],
    "whenUse": [
      "The same position can be reached with different resources, masks, parity, cooldowns, or counts.",
      "A plain visited[node] or dp[i] loses necessary information.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "List all facts used by the next transition.",
      "Remove facts derivable from others.",
      "Estimate the number of states before coding.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Two partial histories with the same state must have the same set of possible future completions, up to the value already accumulated.",
    "variants": [
      "Graph node plus mask/cost/resource.",
      "DP index plus count/last choice.",
      "Memoized recursion with sorted remaining multiset.",
      "Bitmask assignment and subset partitioning."
    ],
    "templateKeys": [
      "state_bfs",
      "bitmask_dp"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 847,
        "title": "Shortest Path Visiting all Nodes",
        "slug": "shortest-path-visiting-all-nodes",
        "rating": 2201,
        "difficulty": "Hard",
        "subPattern": "BFS over state mask",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1601,
        "title": "Maximum Number of Achievable Transfer Requests",
        "slug": "maximum-number-of-achievable-transfer-requests",
        "rating": 2119,
        "difficulty": "Medium/Hard",
        "subPattern": "subset state balance",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1723,
        "title": "Find Minimum Time to Finish all Jobs",
        "slug": "find-minimum-time-to-finish-all-jobs",
        "rating": 2284,
        "difficulty": "Hard",
        "subPattern": "assignment state",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 3533,
        "title": "Concatenated Divisibility",
        "slug": "concatenated-divisibility",
        "rating": 2257,
        "difficulty": "Hard",
        "subPattern": "permutation mask DP",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3615,
        "title": "Longest Palindromic Path in Graph",
        "slug": "longest-palindromic-path-in-graph",
        "rating": 2463,
        "difficulty": "Hard",
        "subPattern": "graph + bitmask state",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 1000,
        "title": "Minimum Cost to Merge Stones",
        "slug": "minimum-cost-to-merge-stones",
        "rating": 2423,
        "difficulty": "Hard",
        "subPattern": "interval DP state",
        "why": "Rewards encoding enough state and no irrelevant history.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "dp-state-design",
      "state-compression",
      "dp-transition-design",
      "constraint-driven-thinking"
    ]
  },
  {
    "slug": "boundary-and-edge-case-thinking",
    "title": "Boundary and Edge Case Thinking",
    "group": "Problem-Solving Mindset",
    "icon": "PanelsTopLeft",
    "tagline": "Control inclusive/exclusive ranges, sentinels, duplicates, and empty structures before they become bugs.",
    "concept": [
      "Boundary thinking is the habit of deciding interval semantics and degenerate cases before implementation.",
      "It matters more as patterns become compressed: difference arrays, sweeps, binary search, and windows encode many cases in few lines.",
      "Most off-by-one bugs are caused by mixing closed, half-open, and sentinel conventions."
    ],
    "motivation": [
      "Brute force naturally loops over explicit objects, so boundaries are visible.",
      "Optimized patterns replace objects with events, ranks, or pointers; the same boundary must be represented indirectly.",
      "A boundary checklist keeps the compressed representation equivalent to the direct one."
    ],
    "whenUse": [
      "The problem has intervals, ranges, first/last positions, duplicates, empty answers, or endpoint equality.",
      "You need sentinels like n, -1, end + 1, or high = size.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Choose closed [l, r] or half-open [l, r) once.",
      "Convert all updates and queries to that convention.",
      "Test minimum and maximum sizes by hand.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Every represented event or pointer position must correspond to exactly one real boundary in the original problem.",
    "variants": [
      "Inclusive interval converted to end + 1.",
      "Binary search over [low, high).",
      "Monotonic stack uses one strict and one non-strict side.",
      "Empty answer represented by sentinel n + 1 or -1."
    ],
    "templateKeys": [
      "difference_array",
      "loop_invariant_binary_search"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2444,
        "title": "Count Subarrays with Fixed Bounds",
        "slug": "count-subarrays-with-fixed-bounds",
        "rating": 2093,
        "difficulty": "Medium/Hard",
        "subPattern": "fixed bounds window",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1574,
        "title": "Shortest Subarray to Be Removed to Make Array Sorted",
        "slug": "shortest-subarray-to-be-removed-to-make-array-sorted",
        "rating": 1932,
        "difficulty": "Medium",
        "subPattern": "prefix/suffix splice",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2516,
        "title": "Take K of Each Character from Left and Right",
        "slug": "take-k-of-each-character-from-left-and-right",
        "rating": 1948,
        "difficulty": "Medium",
        "subPattern": "outside-inside window",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 1851,
        "title": "Minimum Interval to Include Each Query",
        "slug": "minimum-interval-to-include-each-query",
        "rating": 2286,
        "difficulty": "Hard",
        "subPattern": "offline interval query",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2251,
        "title": "Number of Flowers in Full Bloom",
        "slug": "number-of-flowers-in-full-bloom",
        "rating": 2022,
        "difficulty": "Medium/Hard",
        "subPattern": "event sweep boundaries",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3356,
        "title": "Zero Array Transformation II",
        "slug": "zero-array-transformation-ii",
        "rating": 1913,
        "difficulty": "Medium",
        "subPattern": "range update boundary",
        "why": "Stresses inclusive/exclusive endpoints, empty cases, duplicates, and sentinel choices.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "difference-array",
      "sweep-line",
      "loop-invariant",
      "binary-search-on-answer"
    ]
  },
  {
    "slug": "proof-techniques",
    "title": "Proof Techniques",
    "group": "Problem-Solving Mindset",
    "icon": "GitCompare",
    "tagline": "Use invariants, exchange arguments, induction, and cut arguments to justify why a pattern works.",
    "concept": [
      "Proof technique selection is pattern recognition for correctness, not for code.",
      "Greedy usually needs exchange or stays-ahead; loops need invariants; DP needs induction over state order; MST needs cut property.",
      "A short proof prevents local tricks from becoming unjustified guesses."
    ],
    "motivation": [
      "Brute force is correct because it checks every candidate.",
      "An optimized solution skips candidates, commits choices, or merges histories, so it owes a reason those skipped cases are unnecessary.",
      "The proof identifies the equivalence, dominance, or monotonicity that makes skipping safe."
    ],
    "whenUse": [
      "You can explain the code but not why it cannot miss an answer.",
      "A local greedy choice feels right but needs a replacement argument.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Match the algorithm shape to a proof shape.",
      "State the claim before writing implementation details.",
      "Use the invariant or induction hypothesis at the exact line where the choice is made.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Every skipped candidate is either dominated, represented by state, or impossible under a maintained invariant.",
    "variants": [
      "Loop invariant.",
      "Exchange argument.",
      "Greedy stays ahead.",
      "DP induction.",
      "Cut property.",
      "Contradiction via first differing position."
    ],
    "templateKeys": [
      "exchange_greedy",
      "loop_invariant_binary_search"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1024,
        "title": "Video Stitching",
        "slug": "video-stitching",
        "rating": 1746,
        "difficulty": "Medium",
        "subPattern": "interval cover exchange",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1326,
        "title": "Minimum Number of Taps to Open to Water A Garden",
        "slug": "minimum-number-of-taps-to-open-to-water-a-garden",
        "rating": 1885,
        "difficulty": "Medium",
        "subPattern": "minimum interval cover",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2366,
        "title": "Minimum Replacements to Sort the Array",
        "slug": "minimum-replacements-to-sort-the-array",
        "rating": 2060,
        "difficulty": "Medium/Hard",
        "subPattern": "reverse greedy invariant",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 871,
        "title": "Minimum Number of Refueling Stops",
        "slug": "minimum-number-of-refueling-stops",
        "rating": 2074,
        "difficulty": "Medium/Hard",
        "subPattern": "heap greedy exchange",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 1383,
        "title": "Maximum Performance of A Team",
        "slug": "maximum-performance-of-a-team",
        "rating": 2091,
        "difficulty": "Medium/Hard",
        "subPattern": "sort + heap greedy",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 1489,
        "title": "Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",
        "slug": "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
        "rating": 2572,
        "difficulty": "Hard",
        "subPattern": "MST cut property",
        "why": "Needs a correctness argument, not only an implementation trick.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "exchange-argument",
      "greedy-stays-ahead",
      "cut-property",
      "loop-invariant"
    ]
  },
  {
    "slug": "enumeration-strategy",
    "title": "Enumeration Strategy",
    "group": "Enumeration and Counting",
    "icon": "List",
    "tagline": "Pick the right object to enumerate: endpoint, pivot, value, mask, edge, event, or answer.",
    "concept": [
      "Enumeration strategy is choosing which dimension remains explicit and which dimensions become maintained state.",
      "The same problem can be impossible when enumerating pairs but easy when enumerating the middle, right endpoint, or contribution owner.",
      "Competitive solutions often come from changing the enumerated object, not from adding a new data structure."
    ],
    "motivation": [
      "Brute force enumerates all candidate tuples or all subarrays.",
      "Optimization fixes one object and asks what information from the left/right/past/future is enough to count the rest.",
      "The best enumeration makes each candidate charged once."
    ],
    "whenUse": [
      "The statement asks for pairs, triplets, subsequences, subarrays, paths, or all valid constructions.",
      "One dimension can be fixed so the rest becomes prefix/suffix, frequency, or data-structure state.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Try endpoint, pivot, value, and contribution owner as possible anchors.",
      "Compute how many partners each anchor has.",
      "Avoid symmetric double counting by assigning ownership.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Each valid answer has one canonical owner in the enumeration order; the algorithm counts it when and only when that owner is processed.",
    "variants": [
      "Fix right, maintain left.",
      "Enumerate pivot or middle.",
      "Enumerate smaller side of meet-in-the-middle.",
      "Enumerate masks/submasks.",
      "Enumerate sorted value thresholds."
    ],
    "templateKeys": [
      "enumerate_middle",
      "subset_enumeration"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1761,
        "title": "Minimum Degree of A Connected Trio in A Graph",
        "slug": "minimum-degree-of-a-connected-trio-in-a-graph",
        "rating": 2005,
        "difficulty": "Medium/Hard",
        "subPattern": "enumerate trio",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1601,
        "title": "Maximum Number of Achievable Transfer Requests",
        "slug": "maximum-number-of-achievable-transfer-requests",
        "rating": 2119,
        "difficulty": "Medium/Hard",
        "subPattern": "subset state balance",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2444,
        "title": "Count Subarrays with Fixed Bounds",
        "slug": "count-subarrays-with-fixed-bounds",
        "rating": 2093,
        "difficulty": "Medium/Hard",
        "subPattern": "fixed bounds window",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2484,
        "title": "Count Palindromic Subsequences",
        "slug": "count-palindromic-subsequences",
        "rating": 2223,
        "difficulty": "Hard",
        "subPattern": "middle enumeration",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2552,
        "title": "Count Increasing Quadruplets",
        "slug": "count-increasing-quadruplets",
        "rating": 2433,
        "difficulty": "Hard",
        "subPattern": "quadruplet counting",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3395,
        "title": "Subsequences with A Unique Middle Mode I",
        "slug": "subsequences-with-a-unique-middle-mode-i",
        "rating": 2800,
        "difficulty": "Hard",
        "subPattern": "middle mode counting",
        "why": "Trains choosing the one object to enumerate so the rest can be maintained.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "fix-right-maintain-left",
      "enumerate-pivot-middle",
      "contribution-counting",
      "prefix-suffix-decomposition"
    ]
  },
  {
    "slug": "contribution-counting",
    "title": "Contribution Counting",
    "group": "Enumeration and Counting",
    "icon": "Sigma",
    "tagline": "Compute the total by asking how much each element, pair, boundary, or edge contributes.",
    "concept": [
      "Contribution counting, or gongxian fa, flips \"sum over all answers\" into \"sum over all contributors\".",
      "Instead of building every subarray, subsequence, pair, or path, count how many times one atomic object appears with a fixed role.",
      "It is a core pattern for totals of minimums, maximums, widths, distances, appeals, and tree/path effects."
    ],
    "motivation": [
      "Brute force enumerates every result object and computes its value independently.",
      "Repeated work appears because the same element or pair appears in many result objects.",
      "The optimized pattern assigns each occurrence to a unique contributor and multiplies by the number of choices around it."
    ],
    "whenUse": [
      "The answer is a sum over all subarrays, subsequences, pairs, paths, or substrings.",
      "Each element can be the minimum, maximum, boundary, middle, last occurrence, or endpoint many times.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Enumerate the contributor, not the final object.",
      "Count left choices times right choices, or previous occurrences times future choices.",
      "Use strict/non-strict boundaries to make duplicates owned by exactly one side.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Every final object is assigned to exactly one contributor for the role being counted; duplicate values use asymmetric boundaries so ownership is unique.",
    "variants": [
      "Element as minimum.",
      "Element as maximum.",
      "Element as boundary.",
      "Element as pivot or middle.",
      "Pair contribution after sorting.",
      "Tree edge contribution.",
      "Contribution with prefix sums.",
      "Contribution with monotonic stack."
    ],
    "templateKeys": [
      "contribution_mono",
      "pair_contribution",
      "prefix_contribution"
    ],
    "complexity": [
      "Monotonic stack contribution is O(n); sorted pair contribution is O(n log n); prefix contribution is usually O(n).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Using < on both sides or <= on both sides for duplicates.",
      "Forgetting modulo or long long when multiplying choices.",
      "Counting each pair twice after sorting.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2262,
        "title": "Total Appeal of A String",
        "slug": "total-appeal-of-a-string",
        "rating": 2033,
        "difficulty": "Medium/Hard",
        "subPattern": "last-position contribution",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 3428,
        "title": "Maximum and Minimum Sums of at Most Size K Subsequences",
        "slug": "maximum-and-minimum-sums-of-at-most-size-k-subsequences",
        "rating": 2028,
        "difficulty": "Medium/Hard",
        "subPattern": "subsequence contribution",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 3430,
        "title": "Maximum and Minimum Sums of at Most Size K Subarrays",
        "slug": "maximum-and-minimum-sums-of-at-most-size-k-subarrays",
        "rating": 2645,
        "difficulty": "Hard",
        "subPattern": "bounded subarray extrema",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2281,
        "title": "Sum of Total Strength of Wizards",
        "slug": "sum-of-total-strength-of-wizards",
        "rating": 2621,
        "difficulty": "Hard",
        "subPattern": "monotonic contribution",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2916,
        "title": "Subarrays Distinct Element Sum of Squares II",
        "slug": "subarrays-distinct-element-sum-of-squares-ii",
        "rating": 2816,
        "difficulty": "Hard",
        "subPattern": "incremental contribution",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3480,
        "title": "Maximize Subarrays after Removing One Conflicting Pair",
        "slug": "maximize-subarrays-after-removing-one-conflicting-pair",
        "rating": 2764,
        "difficulty": "Hard",
        "subPattern": "conflict-pair contribution",
        "why": "Direct practice for counting how many answers each element, pair, or boundary contributes to.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Does the statement say total sum over many objects?",
      "Can one element, edge, or pair be assigned a stable role like minimum or boundary?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "monotonic-data-structures",
      "prefix-suffix-decomposition",
      "enumeration-strategy",
      "dp-transition-design"
    ]
  },
  {
    "slug": "fix-right-maintain-left",
    "title": "Fix Right, Maintain Left",
    "group": "Enumeration and Counting",
    "icon": "ArrowLeftRight",
    "tagline": "Enumerate the right endpoint and maintain the smallest left endpoint that restores the window invariant.",
    "concept": [
      "Fix right, maintain left is the endpoint view of sliding window.",
      "The right endpoint moves once; left moves only to restore an invariant such as at most K, sum <= K, or coverage satisfied.",
      "It avoids O(n^2) subarray enumeration when validity changes monotonically as left moves."
    ],
    "motivation": [
      "Brute force checks all left/right pairs.",
      "If adding elements on the right only makes a constraint harder or easier in one direction, left never needs to move backward.",
      "For each right endpoint, all valid starts often form a contiguous interval that can be counted at once."
    ],
    "whenUse": [
      "Subarray or substring with longest, shortest, count valid, at most K, exactly K, frequency, non-negative sum, or bitwise OR constraints.",
      "The window can be updated by adding nums[right] and removing nums[left].",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Expand right exactly once per iteration.",
      "Shrink left until the invariant is restored or until removing more would break the objective.",
      "For counting at most K, add right - left + 1 after restoring validity.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "After processing each right endpoint, left is the first index such that the maintained window satisfies the chosen invariant.",
    "variants": [
      "Longest valid window.",
      "Shortest valid window.",
      "Count valid subarrays.",
      "At most K and exactly K via subtraction.",
      "Frequency window.",
      "Bitwise OR window with bit counts.",
      "Two-window counting trick."
    ],
    "templateKeys": [
      "longest_window",
      "shortest_window",
      "at_most_k_distinct",
      "exactly_k_distinct",
      "bitwise_or_window"
    ],
    "complexity": [
      "Each pointer moves O(n); map or bit operations add O(log V), O(1) average, or O(bit count).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Updating answer before shrinking to validity.",
      "Using exactly K directly when atMost(K) - atMost(K - 1) is cleaner.",
      "Trying this pattern when negative numbers break sum monotonicity.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1838,
        "title": "Frequency of the Most Frequent Element",
        "slug": "frequency-of-the-most-frequent-element",
        "rating": 1876,
        "difficulty": "Medium",
        "subPattern": "sort + window",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2302,
        "title": "Count Subarrays with Score Less Than K",
        "slug": "count-subarrays-with-score-less-than-k",
        "rating": 1808,
        "difficulty": "Medium",
        "subPattern": "positive score window",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2398,
        "title": "Maximum Number of Robots Within Budget",
        "slug": "maximum-number-of-robots-within-budget",
        "rating": 1917,
        "difficulty": "Medium",
        "subPattern": "window + monotonic deque",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2444,
        "title": "Count Subarrays with Fixed Bounds",
        "slug": "count-subarrays-with-fixed-bounds",
        "rating": 2093,
        "difficulty": "Medium/Hard",
        "subPattern": "fixed bounds window",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3578,
        "title": "Count Partitions with Max Min Difference at Most K",
        "slug": "count-partitions-with-max-min-difference-at-most-k",
        "rating": 2033,
        "difficulty": "Medium/Hard",
        "subPattern": "partition window",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3589,
        "title": "Count Prime Gap Balanced Subarrays",
        "slug": "count-prime-gap-balanced-subarrays",
        "rating": 2235,
        "difficulty": "Hard",
        "subPattern": "balanced subarray window",
        "why": "Practices fixing the right endpoint and converting all valid starts into a contribution.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "For a fixed right, do valid starts form a suffix or prefix interval?",
      "Does left only need to move forward?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "difference-array",
      "monotonic-data-structures",
      "binary-search-on-answer",
      "prefix-suffix-decomposition"
    ]
  },
  {
    "slug": "enumerate-pivot-middle",
    "title": "Enumerate Pivot / Middle",
    "group": "Enumeration and Counting",
    "icon": "Crosshair",
    "tagline": "Fix the central object so left-side and right-side facts can be combined independently.",
    "concept": [
      "Pivot enumeration fixes an index, value, edge, or middle position and counts compatible objects on both sides.",
      "It is common in triplets, palindromic subsequences, special subsequences, and split-based array problems.",
      "The middle object gives a canonical owner that prevents counting the same structure multiple times."
    ],
    "motivation": [
      "Brute force chooses all positions in a tuple.",
      "By fixing the middle, the left and right choices become independent counts or compressed states.",
      "The answer becomes a product or convolution of facts around the pivot."
    ],
    "whenUse": [
      "Problem asks for length-3/5 subsequences, increasing quadruplets, unique middle, split position, or center of symmetry.",
      "Left and right of a candidate can be summarized separately.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Precompute or maintain left-side facts.",
      "Precompute or maintain right-side facts.",
      "For each pivot, combine compatible facts and then move the pivot boundary.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Each valid structure has a unique pivot under the chosen definition, so combining left and right facts around that pivot counts it once.",
    "variants": [
      "Middle index in triplets.",
      "Two middle positions in length-5 palindromes.",
      "Pivot value in frequency counting.",
      "Split point in arrays.",
      "Root or LCA as tree pivot."
    ],
    "templateKeys": [
      "enumerate_middle",
      "prefix_suffix_counts"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2484,
        "title": "Count Palindromic Subsequences",
        "slug": "count-palindromic-subsequences",
        "rating": 2223,
        "difficulty": "Hard",
        "subPattern": "middle enumeration",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2552,
        "title": "Count Increasing Quadruplets",
        "slug": "count-increasing-quadruplets",
        "rating": 2433,
        "difficulty": "Hard",
        "subPattern": "quadruplet counting",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 3395,
        "title": "Subsequences with A Unique Middle Mode I",
        "slug": "subsequences-with-a-unique-middle-mode-i",
        "rating": 2800,
        "difficulty": "Hard",
        "subPattern": "middle mode counting",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 3404,
        "title": "Count Special Subsequences",
        "slug": "count-special-subsequences",
        "rating": 2445,
        "difficulty": "Hard",
        "subPattern": "special subsequence counting",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3257,
        "title": "Maximum Value Sum by Placing Three Rooks II",
        "slug": "maximum-value-sum-by-placing-three-rooks-ii",
        "rating": 2553,
        "difficulty": "Hard",
        "subPattern": "choose pivots under constraints",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3529,
        "title": "Count Cells in Overlapping Horizontal and Vertical Substrings",
        "slug": "count-cells-in-overlapping-horizontal-and-vertical-substrings",
        "rating": 2105,
        "difficulty": "Medium/Hard",
        "subPattern": "overlap contribution",
        "why": "Makes the middle/pivot object explicit and moves the expensive parts into side state.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "prefix-suffix-decomposition",
      "contribution-counting",
      "enumeration-strategy",
      "state-design"
    ]
  },
  {
    "slug": "prefix-suffix-decomposition",
    "title": "Prefix/Suffix Decomposition",
    "group": "Enumeration and Counting",
    "icon": "PanelsTopLeft",
    "tagline": "Precompute what the left and right of every cut can provide, then combine them in O(1) or logarithmic time.",
    "concept": [
      "Prefix/suffix decomposition stores facts before and after every cut or pivot.",
      "It is the array/string version of not rescanning the same side repeatedly.",
      "The pattern is strongest when the final answer is a cut, removal, splice, partition, or outside-inside choice."
    ],
    "motivation": [
      "Brute force tries a cut and scans left/right to evaluate it.",
      "Optimization performs the left-to-right and right-to-left scans once.",
      "Each cut then becomes a constant-time combination of previously computed facts."
    ],
    "whenUse": [
      "Question asks remove one subarray, choose from both ends, split array, compare prefix and suffix, or combine left/right bests.",
      "The property on each side is independent once the cut is fixed.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Define the cut semantics first: left ends at i, right starts at i + 1, or half-open ranges.",
      "Compute prefix facts in one direction and suffix facts in the other.",
      "Combine only compatible facts at each cut.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "For every cut, prefix state summarizes exactly the left side and suffix state summarizes exactly the right side under the same boundary convention.",
    "variants": [
      "Prefix max with suffix min.",
      "Prefix count with suffix count.",
      "Outside window from two ends.",
      "Forward/backward DP.",
      "String prefix-function and suffix matching."
    ],
    "templateKeys": [
      "prefix_contribution",
      "prefix_suffix_counts"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2025,
        "title": "Maximum Number of Ways to Partition An Array",
        "slug": "maximum-number-of-ways-to-partition-an-array",
        "rating": 2218,
        "difficulty": "Hard",
        "subPattern": "prefix/suffix partition",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2167,
        "title": "Minimum Time to Remove all Cars Containing Illegal Goods",
        "slug": "minimum-time-to-remove-all-cars-containing-illegal-goods",
        "rating": 2219,
        "difficulty": "Hard",
        "subPattern": "prefix/suffix DP",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1574,
        "title": "Shortest Subarray to Be Removed to Make Array Sorted",
        "slug": "shortest-subarray-to-be-removed-to-make-array-sorted",
        "rating": 1932,
        "difficulty": "Medium",
        "subPattern": "prefix/suffix splice",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2516,
        "title": "Take K of Each Character from Left and Right",
        "slug": "take-k-of-each-character-from-left-and-right",
        "rating": 1948,
        "difficulty": "Medium",
        "subPattern": "outside-inside window",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3316,
        "title": "Find Maximum Removals from Source String",
        "slug": "find-maximum-removals-from-source-string",
        "rating": 2062,
        "difficulty": "Medium/Hard",
        "subPattern": "removal prefix/suffix DP",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3261,
        "title": "Count Substrings That Satisfy K Constraint II",
        "slug": "count-substrings-that-satisfy-k-constraint-ii",
        "rating": 2659,
        "difficulty": "Hard",
        "subPattern": "K-constraint substrings",
        "why": "Uses left and right precomputation to remove repeated scans around a cut.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "enumerate-pivot-middle",
      "boundary-and-edge-case-thinking",
      "brute-force-to-optimization",
      "difference-array"
    ]
  },
  {
    "slug": "difference-array",
    "title": "Difference Array",
    "group": "Core Array/String Patterns",
    "icon": "Hash",
    "tagline": "Represent many range updates as endpoint deltas, then reconstruct actual values with one prefix pass.",
    "concept": [
      "A difference array stores changes between adjacent positions rather than final values.",
      "A range add becomes two endpoint events: add at left, subtract after right.",
      "It is ideal when updates are batched and final values or validity are checked after reconstruction."
    ],
    "motivation": [
      "Brute force applies every update to every affected index.",
      "If there are many long ranges, that repeats work inside overlapping intervals.",
      "Endpoint deltas preserve the net effect and defer all interior work to one prefix scan."
    ],
    "whenUse": [
      "Many range add/subtract operations.",
      "Need final array, coverage counts, or feasibility after applying intervals.",
      "Queries can be processed offline rather than requiring arbitrary online updates.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Convert each closed range [l, r] to diff[l] += delta and diff[r + 1] -= delta.",
      "Run a prefix sum to recover final values.",
      "For validation problems, greedily create deltas only when a position still needs help.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The prefix sum at index i equals the total delta of every update whose range contains i.",
    "variants": [
      "1D range add.",
      "2D rectangle add.",
      "Difference over cost function breakpoints.",
      "Greedy validation with active operations.",
      "Event sweep as a sparse difference array."
    ],
    "templateKeys": [
      "difference_array",
      "difference_matrix"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 995,
        "title": "Minimum Number of K Consecutive Bit Flips",
        "slug": "minimum-number-of-k-consecutive-bit-flips",
        "rating": 1835,
        "difficulty": "Medium",
        "subPattern": "range flip difference",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1526,
        "title": "Minimum Number of Increments on Subarrays to Form A Target Array",
        "slug": "minimum-number-of-increments-on-subarrays-to-form-a-target-array",
        "rating": 1872,
        "difficulty": "Medium",
        "subPattern": "positive difference contribution",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1674,
        "title": "Minimum Moves to Make Array Complementary",
        "slug": "minimum-moves-to-make-array-complementary",
        "rating": 2333,
        "difficulty": "Hard",
        "subPattern": "difference over pair cost",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2772,
        "title": "Apply Operations to Make all Array Elements Equal to Zero",
        "slug": "apply-operations-to-make-all-array-elements-equal-to-zero",
        "rating": 2029,
        "difficulty": "Medium/Hard",
        "subPattern": "greedy diff validation",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3356,
        "title": "Zero Array Transformation II",
        "slug": "zero-array-transformation-ii",
        "rating": 1913,
        "difficulty": "Medium",
        "subPattern": "range update boundary",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3362,
        "title": "Zero Array Transformation III",
        "slug": "zero-array-transformation-iii",
        "rating": 2424,
        "difficulty": "Hard",
        "subPattern": "range coverage maximization",
        "why": "Turns many range operations into endpoint events and one reconstruction pass.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "sweep-line",
      "boundary-and-edge-case-thinking",
      "offline-query-processing",
      "prefix-suffix-decomposition"
    ]
  },
  {
    "slug": "binary-search-on-answer",
    "title": "Binary Search on Answer",
    "group": "Core Array/String Patterns",
    "icon": "Gauge",
    "tagline": "Search the value space when feasibility is monotone and cheaper than direct optimization.",
    "concept": [
      "Binary search on answer transforms an optimization problem into repeated feasibility checks.",
      "The candidate value is not an index in the input; it is a speed, capacity, distance, time, maximum, minimum, or kth value.",
      "The entire technique depends on proving monotonicity of the predicate."
    ],
    "motivation": [
      "Brute force tests every possible answer value.",
      "If values are large but valid/invalid forms a prefix or suffix, binary search cuts the value space logarithmically.",
      "The predicate often uses greedy, counting, two pointers, or DSU."
    ],
    "whenUse": [
      "Minimize maximum, maximize minimum, kth smallest, minimum time, maximum feasible score.",
      "Given x, checking feasibility is O(n), O(n log n), or O(q alpha(n)).",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Choose low/high as definitely impossible/possible or both inclusive bounds.",
      "Write can(x) first and test monotonic direction.",
      "Return the first feasible or last feasible value according to the invariant.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The search interval always contains the boundary between infeasible and feasible candidate values.",
    "variants": [
      "Minimum feasible value.",
      "Maximum feasible value.",
      "Kth value by count <= x.",
      "Real-valued binary search.",
      "Binary search plus greedy construction."
    ],
    "templateKeys": [
      "answer_search",
      "loop_invariant_binary_search"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 875,
        "title": "Koko Eating Bananas",
        "slug": "koko-eating-bananas",
        "rating": 1766,
        "difficulty": "Medium",
        "subPattern": "minimum feasible speed",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1011,
        "title": "Capacity to Ship Packages Within D Days",
        "slug": "capacity-to-ship-packages-within-d-days",
        "rating": 1725,
        "difficulty": "Medium",
        "subPattern": "minimum feasible capacity",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1552,
        "title": "Magnetic Force Between Two Balls",
        "slug": "magnetic-force-between-two-balls",
        "rating": 1920,
        "difficulty": "Medium",
        "subPattern": "maximize minimum distance",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2141,
        "title": "Maximum Running Time of N Computers",
        "slug": "maximum-running-time-of-n-computers",
        "rating": 2265,
        "difficulty": "Hard",
        "subPattern": "resource feasibility",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2513,
        "title": "Minimize the Maximum of Two Arrays",
        "slug": "minimize-the-maximum-of-two-arrays",
        "rating": 2302,
        "difficulty": "Hard",
        "subPattern": "number theory feasibility",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3449,
        "title": "Maximize the Minimum Game Score",
        "slug": "maximize-the-minimum-game-score",
        "rating": 2748,
        "difficulty": "Hard",
        "subPattern": "maximize minimum score",
        "why": "Separates value-space search from a linear or greedy feasibility check.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "feasibility-check",
      "loop-invariant",
      "constraint-driven-thinking",
      "greedy-construction"
    ]
  },
  {
    "slug": "monotonic-data-structures",
    "title": "Monotonic Data Structures",
    "group": "Data Structure Patterns",
    "icon": "ArrowDownWideNarrow",
    "tagline": "Use stacks, deques, and queues that discard dominated candidates while preserving nearest or best boundaries.",
    "concept": [
      "Monotonic structures keep candidates in sorted order of value, index, or priority as a scan advances.",
      "They remove dominated candidates that can never become the next answer.",
      "They are essential for nearest greater/smaller, sliding extrema, subarray minimum contribution, and prefix deque problems."
    ],
    "motivation": [
      "Brute force scans left or right from every index to find a boundary or best candidate.",
      "A monotonic stack/deque stores exactly the unresolved useful candidates from previous positions.",
      "Each index enters and leaves once, which turns many O(n^2) boundary searches into O(n)."
    ],
    "whenUse": [
      "Nearest greater/smaller, next boundary, window max/min, shortest subarray with prefix constraints, or contribution by min/max.",
      "A candidate becomes useless when a newer candidate is both closer and no worse.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Define whether the structure is increasing or decreasing.",
      "Pop while the new element dominates the back.",
      "Use strict/non-strict comparisons deliberately for duplicates.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "After each insertion, the structure contains only undominated candidates in scan order and monotonic value order.",
    "variants": [
      "Monotonic stack for next greater/smaller.",
      "Monotonic deque for sliding window extrema.",
      "Prefix-sum deque for shortest subarray.",
      "Contribution boundaries with duplicate policy.",
      "Monotonic queue optimized DP."
    ],
    "templateKeys": [
      "monotonic_stack",
      "monotonic_deque",
      "contribution_mono"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 862,
        "title": "Shortest Subarray with Sum at Least K",
        "slug": "shortest-subarray-with-sum-at-least-k",
        "rating": 2307,
        "difficulty": "Hard",
        "subPattern": "prefix deque invariant",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1673,
        "title": "Find the Most Competitive Subsequence",
        "slug": "find-the-most-competitive-subsequence",
        "rating": 1802,
        "difficulty": "Medium",
        "subPattern": "monotonic stack subsequence",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 2454,
        "title": "Next Greater Element IV",
        "slug": "next-greater-element-iv",
        "rating": 2175,
        "difficulty": "Medium/Hard",
        "subPattern": "two-pass monotonic stack",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2281,
        "title": "Sum of Total Strength of Wizards",
        "slug": "sum-of-total-strength-of-wizards",
        "rating": 2621,
        "difficulty": "Hard",
        "subPattern": "monotonic contribution",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2398,
        "title": "Maximum Number of Robots Within Budget",
        "slug": "maximum-number-of-robots-within-budget",
        "rating": 1917,
        "difficulty": "Medium",
        "subPattern": "window + monotonic deque",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3430,
        "title": "Maximum and Minimum Sums of at Most Size K Subarrays",
        "slug": "maximum-and-minimum-sums-of-at-most-size-k-subarrays",
        "rating": 2645,
        "difficulty": "Hard",
        "subPattern": "bounded subarray extrema",
        "why": "Uses monotonic stacks or deques to expose the nearest useful boundary.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "contribution-counting",
      "fix-right-maintain-left",
      "difference-array",
      "dp-transition-design"
    ]
  },
  {
    "slug": "coordinate-compression",
    "title": "Coordinate Compression",
    "group": "Data Structure Patterns",
    "icon": "Blocks",
    "tagline": "Map large sparse values to dense ranks while preserving order comparisons and equality.",
    "concept": [
      "Coordinate compression replaces raw coordinates with ranks 1..m.",
      "It preserves ordering and equality but discards irrelevant gaps between values.",
      "It enables Fenwick trees, segment trees, counting arrays, and sweeps on values up to 1e9 or beyond."
    ],
    "motivation": [
      "Brute force over the coordinate range is impossible when values are huge.",
      "Only coordinates that appear in updates, queries, or boundaries can affect the answer.",
      "Sorting those coordinates creates a compact index space for data structures."
    ],
    "whenUse": [
      "Values are large but only O(n + q) distinct coordinates matter.",
      "Need order-statistics, range counts, offline queries, or interval endpoints.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Collect every coordinate that can be queried or updated.",
      "Sort and unique.",
      "Use lower_bound to map raw values to ranks.",
      "For intervals, include boundary sentinels such as r + 1 when using difference semantics.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Rank order is identical to raw coordinate order for every coordinate the algorithm may compare or update.",
    "variants": [
      "Point compression for Fenwick.",
      "Endpoint compression for intervals.",
      "Value compression for inversion and inequality counts.",
      "2D compression for rectangles.",
      "Compression with sentinels for half-open ranges."
    ],
    "templateKeys": [
      "coordinate_compression_fenwick"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1649,
        "title": "Create Sorted Array Through Instructions",
        "slug": "create-sorted-array-through-instructions",
        "rating": 2208,
        "difficulty": "Hard",
        "subPattern": "ranked insertion counts",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2426,
        "title": "Number of Pairs Satisfying Inequality",
        "slug": "number-of-pairs-satisfying-inequality",
        "rating": 2030,
        "difficulty": "Medium/Hard",
        "subPattern": "compressed inequality count",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1906,
        "title": "Minimum Absolute Difference Queries",
        "slug": "minimum-absolute-difference-queries",
        "rating": 2147,
        "difficulty": "Medium/Hard",
        "subPattern": "range frequency compression",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2736,
        "title": "Maximum Sum Queries",
        "slug": "maximum-sum-queries",
        "rating": 2533,
        "difficulty": "Hard",
        "subPattern": "offline dominance query",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3768,
        "title": "Minimum Inversion Count in Subarrays of Fixed Length",
        "slug": "minimum-inversion-count-in-subarrays-of-fixed-length",
        "rating": 2158,
        "difficulty": "Medium/Hard",
        "subPattern": "window inversion counts",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3636,
        "title": "Threshold Majority Queries",
        "slug": "threshold-majority-queries",
        "rating": 2451,
        "difficulty": "Hard",
        "subPattern": "majority query structure",
        "why": "Replaces large coordinates with rank space while preserving order and equality.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "offline-query-processing",
      "sweep-line",
      "difference-array",
      "boundary-and-edge-case-thinking"
    ]
  },
  {
    "slug": "exchange-argument",
    "title": "Exchange Argument",
    "group": "Greedy Patterns",
    "icon": "GitCompare",
    "tagline": "Prove a greedy choice by replacing the first disagreeing optimal choice without making the solution worse.",
    "concept": [
      "An exchange argument is the standard proof for many sorting and interval greedy algorithms.",
      "It shows that some optimal solution can be transformed to include the greedy choice.",
      "Once that first choice is justified, the same argument repeats on the remaining subproblem."
    ],
    "motivation": [
      "Brute force tries all subsets, schedules, or orders.",
      "Greedy commits to one locally best item, such as earliest finish, smallest end, largest gain, or cheapest safe edge.",
      "The proof must show every optimal solution can exchange its first conflicting item for the greedy item."
    ],
    "whenUse": [
      "The algorithm sorts and repeatedly takes one local best candidate.",
      "You can compare two solutions by the first position where they differ.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Identify the greedy choice.",
      "Take an optimal solution that differs first at this choice.",
      "Swap in the greedy choice and show feasibility and objective do not worsen.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "There exists an optimal solution whose prefix matches the greedy prefix after each exchange step.",
    "variants": [
      "Earliest finish interval scheduling.",
      "Heap replacement by best current resource.",
      "Sort by deadline or end.",
      "MST lightest edge across a cut.",
      "Lexicographic first differing position."
    ],
    "templateKeys": [
      "exchange_greedy"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1024,
        "title": "Video Stitching",
        "slug": "video-stitching",
        "rating": 1746,
        "difficulty": "Medium",
        "subPattern": "interval cover exchange",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1326,
        "title": "Minimum Number of Taps to Open to Water A Garden",
        "slug": "minimum-number-of-taps-to-open-to-water-a-garden",
        "rating": 1885,
        "difficulty": "Medium",
        "subPattern": "minimum interval cover",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1705,
        "title": "Maximum Number of Eaten Apples",
        "slug": "maximum-number-of-eaten-apples",
        "rating": 1930,
        "difficulty": "Medium",
        "subPattern": "expiry heap greedy",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2366,
        "title": "Minimum Replacements to Sort the Array",
        "slug": "minimum-replacements-to-sort-the-array",
        "rating": 2060,
        "difficulty": "Medium/Hard",
        "subPattern": "reverse greedy invariant",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 871,
        "title": "Minimum Number of Refueling Stops",
        "slug": "minimum-number-of-refueling-stops",
        "rating": 2074,
        "difficulty": "Medium/Hard",
        "subPattern": "heap greedy exchange",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 1383,
        "title": "Maximum Performance of A Team",
        "slug": "maximum-performance-of-a-team",
        "rating": 2091,
        "difficulty": "Medium/Hard",
        "subPattern": "sort + heap greedy",
        "why": "Needs a local choice whose replacement argument can be defended.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "greedy-stays-ahead",
      "greedy-construction",
      "proof-techniques",
      "cut-property"
    ]
  },
  {
    "slug": "greedy-construction",
    "title": "Greedy Construction",
    "group": "Greedy Patterns",
    "icon": "PencilRuler",
    "tagline": "Trial filling / feasibility-guided construction for lexicographically or numerically optimal valid answers.",
    "concept": [
      "Greedy construction builds the answer one position at a time in preferred order.",
      "At each position, it tries the best candidate and commits only if the remaining suffix is feasible.",
      "It differs from ordinary greedy because the feasibility check is part of the choice, not an afterthought."
    ],
    "motivation": [
      "Brute force enumerates every string, array, permutation, or sequence.",
      "If lexicographic or high-to-low priority decides the earliest differing position, we can try candidates in that order.",
      "The first candidate that still permits completion is safe to commit."
    ],
    "whenUse": [
      "Construct lexicographically smallest/largest answer, build digits/bits/array, or choose smallest valid candidate per position.",
      "There are remaining resources such as sum, frequency, required letters, or mask constraints.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Iterate positions in priority order.",
      "Try candidates from best to worst.",
      "Check whether the remaining positions can still satisfy all constraints.",
      "Commit and update remaining resources.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "After fixing each prefix, there exists an optimal answer with that prefix, and the remaining constraints still admit at least one completion.",
    "variants": [
      "Lexicographically smallest string.",
      "Lexicographically largest sequence.",
      "Digit-by-digit construction.",
      "Remaining sum or count bounds.",
      "Frequency-based construction.",
      "Backtracking-looking problems solved by greedy trial filling."
    ],
    "templateKeys": [
      "greedy_builder",
      "greedy_lexicographic",
      "remaining_sum_construction",
      "frequency_construction"
    ],
    "complexity": [
      "If each position tries A candidates and feasibility is F, complexity is O(n * A * F); stack constructions are usually O(n).",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Using a feasibility check that is necessary but not sufficient.",
      "Trying candidates in the wrong order for the objective.",
      "Forgetting to update remaining quotas after committing.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1718,
        "title": "Construct the Lexicographically Largest Valid Sequence",
        "slug": "construct-the-lexicographically-largest-valid-sequence",
        "rating": 2080,
        "difficulty": "Medium/Hard",
        "subPattern": "trial filling sequence",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2030,
        "title": "Smallest K Length Subsequence with Occurrences of A Letter",
        "slug": "smallest-k-length-subsequence-with-occurrences-of-a-letter",
        "rating": 2562,
        "difficulty": "Hard",
        "subPattern": "quota greedy stack",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 3302,
        "title": "Find the Lexicographically Smallest Valid Sequence",
        "slug": "find-the-lexicographically-smallest-valid-sequence",
        "rating": 2474,
        "difficulty": "Hard",
        "subPattern": "lexicographic feasibility",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 3518,
        "title": "Smallest Palindromic Rearrangement II",
        "slug": "smallest-palindromic-rearrangement-ii",
        "rating": 2375,
        "difficulty": "Hard",
        "subPattern": "k-th palindrome construction",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3474,
        "title": "Lexicographically Smallest Generated String",
        "slug": "lexicographically-smallest-generated-string",
        "rating": 2605,
        "difficulty": "Hard",
        "subPattern": "generated string construction",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3444,
        "title": "Minimum Increments for Target Multiples in An Array",
        "slug": "minimum-increments-for-target-multiples-in-an-array",
        "rating": 2337,
        "difficulty": "Hard",
        "subPattern": "LCM mask construction",
        "why": "Builds the answer position by position while proving the suffix remains feasible.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Does the objective compare earliest differing positions?",
      "Can I cheaply decide whether a partial prefix can be completed?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "feasibility-check",
      "exchange-argument",
      "greedy-stays-ahead",
      "state-design"
    ]
  },
  {
    "slug": "greedy-stays-ahead",
    "title": "Greedy Stays Ahead",
    "group": "Greedy Patterns",
    "icon": "TrendingUp",
    "tagline": "Prove that the greedy frontier is always at least as good as any alternative after the same number of choices.",
    "concept": [
      "Greedy stays ahead proves progress by comparing frontiers after each step.",
      "It is common in interval cover, jump reachability, refueling, and resource extension problems.",
      "The algorithm chooses the option that maximizes the next frontier among all currently reachable choices."
    ],
    "motivation": [
      "Brute force tries every sequence of jumps, intervals, or resources.",
      "The optimized greedy processes all choices currently available and commits to the one with farthest reach or best future capacity.",
      "The proof compares how far any solution with the same number of steps could have reached."
    ],
    "whenUse": [
      "Need minimum number of jumps/intervals/refuels to reach a target.",
      "Available candidates are defined by current reach, and each candidate extends reach.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Maintain current frontier.",
      "Scan all candidates starting before or at the frontier.",
      "Commit the candidate with farthest next frontier.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "After k greedy choices, the greedy reachable frontier is at least as far as the frontier of any solution using k choices.",
    "variants": [
      "Jump Game style reach.",
      "Interval cover.",
      "Minimum taps.",
      "Refueling with max heap.",
      "Batch processing currently reachable events."
    ],
    "templateKeys": [
      "interval_cover_greedy",
      "exchange_greedy"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1024,
        "title": "Video Stitching",
        "slug": "video-stitching",
        "rating": 1746,
        "difficulty": "Medium",
        "subPattern": "interval cover exchange",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1326,
        "title": "Minimum Number of Taps to Open to Water A Garden",
        "slug": "minimum-number-of-taps-to-open-to-water-a-garden",
        "rating": 1885,
        "difficulty": "Medium",
        "subPattern": "minimum interval cover",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1705,
        "title": "Maximum Number of Eaten Apples",
        "slug": "maximum-number-of-eaten-apples",
        "rating": 1930,
        "difficulty": "Medium",
        "subPattern": "expiry heap greedy",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2366,
        "title": "Minimum Replacements to Sort the Array",
        "slug": "minimum-replacements-to-sort-the-array",
        "rating": 2060,
        "difficulty": "Medium/Hard",
        "subPattern": "reverse greedy invariant",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2439,
        "title": "Minimize Maximum of Array",
        "slug": "minimize-maximum-of-array",
        "rating": 1965,
        "difficulty": "Medium/Hard",
        "subPattern": "prefix bound greedy",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 871,
        "title": "Minimum Number of Refueling Stops",
        "slug": "minimum-number-of-refueling-stops",
        "rating": 2074,
        "difficulty": "Medium/Hard",
        "subPattern": "heap greedy exchange",
        "why": "Uses a frontier that is never behind any alternative after the same number of steps.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "exchange-argument",
      "feasibility-check",
      "proof-techniques",
      "binary-search-on-answer"
    ]
  },
  {
    "slug": "cut-property",
    "title": "Cut Property",
    "group": "Graph Patterns",
    "icon": "Network",
    "tagline": "Use graph cuts to justify safe edge choices in MST, connectivity, and bridge-style reasoning.",
    "concept": [
      "The cut property says the lightest edge crossing a cut is safe for some minimum spanning tree.",
      "More generally, cut reasoning separates already-connected components from the rest and asks which edge must be considered.",
      "It underlies Kruskal, Prim, critical-edge tests, and many DSU-by-threshold problems."
    ],
    "motivation": [
      "Brute force over all spanning trees is impossible.",
      "Kruskal sorts edges and only considers whether an edge connects two current components.",
      "The cut property proves that taking the next lightest crossing edge cannot block optimality."
    ],
    "whenUse": [
      "Minimum spanning tree, critical edges, connect all points, DSU sorted by edge weight/value, or graph thresholds.",
      "Need to decide whether adding an edge is safe or redundant.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Sort candidate edges by weight or threshold.",
      "Maintain connected components with DSU.",
      "Accept edges that cross component cuts; reject edges inside one component.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "For every accepted edge, there is a cut separating its two components where this edge is a minimum available crossing edge.",
    "variants": [
      "Kruskal MST.",
      "Prim MST.",
      "Critical and pseudo-critical edges.",
      "DSU by value threshold.",
      "Bridge/cut-edge reasoning for connectivity loss."
    ],
    "templateKeys": [
      "mst_kruskal"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1584,
        "title": "Min Cost to Connect all Points",
        "slug": "min-cost-to-connect-all-points",
        "rating": 1858,
        "difficulty": "Medium",
        "subPattern": "MST geometry",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1489,
        "title": "Find Critical and Pseudo Critical Edges in Minimum Spanning Tree",
        "slug": "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
        "rating": 2572,
        "difficulty": "Hard",
        "subPattern": "MST cut property",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1579,
        "title": "Remove Max Number of Edges to Keep Graph Fully Traversable",
        "slug": "remove-max-number-of-edges-to-keep-graph-fully-traversable",
        "rating": 2132,
        "difficulty": "Medium/Hard",
        "subPattern": "shared DSU cut choice",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2421,
        "title": "Number of Good Paths",
        "slug": "number-of-good-paths",
        "rating": 2445,
        "difficulty": "Hard",
        "subPattern": "DSU by value",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 3600,
        "title": "Maximize Spanning Tree Stability with Upgrades",
        "slug": "maximize-spanning-tree-stability-with-upgrades",
        "rating": 2301,
        "difficulty": "Hard",
        "subPattern": "MST with upgrades",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 1192,
        "title": "Critical Connections in A Network",
        "slug": "critical-connections-in-a-network",
        "rating": 2085,
        "difficulty": "Medium/Hard",
        "subPattern": "bridge cut edge",
        "why": "Applies graph cut reasoning: the selected edge is safe for every optimal solution crossing a cut.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "exchange-argument",
      "offline-query-processing",
      "proof-techniques",
      "state-design"
    ]
  },
  {
    "slug": "dp-state-design",
    "title": "DP State Design",
    "group": "Dynamic Programming",
    "icon": "Layers",
    "tagline": "Define DP dimensions that are sufficient, minimal, and ordered for computation.",
    "concept": [
      "DP state design chooses what a subproblem means.",
      "The state must include every fact that can change future choices and exclude facts that are irrelevant or derivable.",
      "A strong state definition is usually more important than the final recurrence syntax."
    ],
    "motivation": [
      "Brute force explores all choice histories.",
      "DP merges histories that have the same future behavior under a state definition.",
      "The optimization is valid only when merged histories are truly equivalent."
    ],
    "whenUse": [
      "Overlapping subproblems, choices over prefixes, intervals, rows, trees, counts, or masks.",
      "You can describe the answer for a partial object and extend it.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Write dp state in one sentence.",
      "List allowed transitions into or out of that state.",
      "Pick an evaluation order where dependencies are already known.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "All histories represented by the same DP state have the same optimal future value except for the accumulated value stored in the state.",
    "variants": [
      "Linear DP by index.",
      "Grid DP by cell and direction.",
      "Tree DP by node and selected status.",
      "Interval DP by left/right.",
      "Multi-dimensional DP by count/last group."
    ],
    "templateKeys": [
      "dp_state"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1269,
        "title": "Number of Ways to Stay in the Same Place after Some Steps",
        "slug": "number-of-ways-to-stay-in-the-same-place-after-some-steps",
        "rating": 1854,
        "difficulty": "Medium",
        "subPattern": "position DP",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1473,
        "title": "Paint House III",
        "slug": "paint-house-iii",
        "rating": 2056,
        "difficulty": "Medium/Hard",
        "subPattern": "multi-dimensional state",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1937,
        "title": "Maximum Number of Points with Cost",
        "slug": "maximum-number-of-points-with-cost",
        "rating": 2106,
        "difficulty": "Medium/Hard",
        "subPattern": "row DP optimization",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2209,
        "title": "Minimum White Tiles after Covering with Carpets",
        "slug": "minimum-white-tiles-after-covering-with-carpets",
        "rating": 2106,
        "difficulty": "Medium/Hard",
        "subPattern": "covering DP",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2312,
        "title": "Selling Pieces of Wood",
        "slug": "selling-pieces-of-wood",
        "rating": 2363,
        "difficulty": "Hard",
        "subPattern": "2D split DP",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 1000,
        "title": "Minimum Cost to Merge Stones",
        "slug": "minimum-cost-to-merge-stones",
        "rating": 2423,
        "difficulty": "Hard",
        "subPattern": "interval DP state",
        "why": "Tests whether the chosen DP dimensions are sufficient and minimal.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "dp-transition-design",
      "state-design",
      "state-compression",
      "proof-techniques"
    ]
  },
  {
    "slug": "dp-transition-design",
    "title": "DP Transition Design",
    "group": "Dynamic Programming",
    "icon": "GitBranch",
    "tagline": "Derive transitions from the last decision, split point, previous state, or chosen boundary.",
    "concept": [
      "A DP transition explains how a larger state is built from smaller states.",
      "Good transitions come from the last action, the first cut, the chosen middle, or the boundary that separates independent subproblems.",
      "The recurrence is a proof of optimal substructure in executable form."
    ],
    "motivation": [
      "Brute force tries all decision sequences recursively.",
      "DP keeps the same branching choices but memoizes or tabulates by state.",
      "Optimization often comes from reducing transition candidates with prefix maxima, monotonic queues, or convexity, but only after the base recurrence is correct."
    ],
    "whenUse": [
      "You know the state but are unsure how states connect.",
      "There is a natural last operation, split point, chosen item, or previous group.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Choose the transition owner: last action, next action, split, or pivot.",
      "Ensure every valid solution appears in at least one transition.",
      "Ensure no transition uses a state that includes the current decision twice.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "The optimal value for a state is exactly the best over all legal final decisions that lead from smaller states to this state.",
    "variants": [
      "Take/skip transition.",
      "Partition transition.",
      "Interval split.",
      "Tree child merge.",
      "State compression transition.",
      "Optimized transition with prefix bests."
    ],
    "templateKeys": [
      "dp_transition"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1547,
        "title": "Minimum Cost to Cut A Stick",
        "slug": "minimum-cost-to-cut-a-stick",
        "rating": 2116,
        "difficulty": "Medium/Hard",
        "subPattern": "interval DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1690,
        "title": "Stone Game Vii",
        "slug": "stone-game-vii",
        "rating": 1951,
        "difficulty": "Medium/Hard",
        "subPattern": "game DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1770,
        "title": "Maximum Score from Performing Multiplication Operations",
        "slug": "maximum-score-from-performing-multiplication-operations",
        "rating": 2068,
        "difficulty": "Medium/Hard",
        "subPattern": "two-end DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 1872,
        "title": "Stone Game Viii",
        "slug": "stone-game-viii",
        "rating": 2440,
        "difficulty": "Hard",
        "subPattern": "suffix transition DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 1959,
        "title": "Minimum Total Space Wasted with K Resizing Operations",
        "slug": "minimum-total-space-wasted-with-k-resizing-operations",
        "rating": 2310,
        "difficulty": "Hard",
        "subPattern": "partition DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 3193,
        "title": "Count the Number of Inversions",
        "slug": "count-the-number-of-inversions",
        "rating": 2266,
        "difficulty": "Hard",
        "subPattern": "inversion-count DP",
        "why": "Focuses on deriving transitions from the last decision, split, or interval boundary.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "dp-state-design",
      "state-compression",
      "enumerate-pivot-middle",
      "monotonic-data-structures"
    ]
  },
  {
    "slug": "offline-query-processing",
    "title": "Offline Query Processing",
    "group": "Range Query and Offline Techniques",
    "icon": "CalendarRange",
    "tagline": "Reorder queries with events so expensive updates happen once and answers are restored by original index.",
    "concept": [
      "Offline processing answers queries after reading all of them, allowing a helpful order different from input order.",
      "Sorting by threshold, coordinate, time, or block can turn repeated work into incremental updates.",
      "The answer array stores results by original query index so output order is preserved."
    ],
    "motivation": [
      "Online brute force handles each query independently.",
      "If queries share thresholds or sweep coordinates, process them in sorted order and maintain an active data structure.",
      "Each item enters or leaves the structure a small number of times instead of once per query."
    ],
    "whenUse": [
      "All queries are known in advance.",
      "Query condition has a threshold, coordinate, value limit, or time segment.",
      "The statement does not require immediate online answers.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Choose the sorting key that makes updates monotone.",
      "Store original query index.",
      "Move a pointer through events while answering queries.",
      "Use Fenwick, DSU, heap, or ordered set for active state.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Before answering a query in offline order, the active structure contains exactly the objects that satisfy that query key.",
    "variants": [
      "Sort queries by value threshold.",
      "Offline DSU by edge limit.",
      "Sweep line over coordinates.",
      "Mo algorithm by blocks.",
      "Rollback DSU over time segments."
    ],
    "templateKeys": [
      "offline_fenwick",
      "coordinate_compression_fenwick"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 2070,
        "title": "Most Beautiful Item for Each Query",
        "slug": "most-beautiful-item-for-each-query",
        "rating": 1724,
        "difficulty": "Medium",
        "subPattern": "sorted query sweep",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1851,
        "title": "Minimum Interval to Include Each Query",
        "slug": "minimum-interval-to-include-each-query",
        "rating": 2286,
        "difficulty": "Hard",
        "subPattern": "offline interval query",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1697,
        "title": "Checking Existence of Edge Length Limited Paths",
        "slug": "checking-existence-of-edge-length-limited-paths",
        "rating": 2300,
        "difficulty": "Hard",
        "subPattern": "offline DSU threshold",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2503,
        "title": "Maximum Number of Points from Grid Queries",
        "slug": "maximum-number-of-points-from-grid-queries",
        "rating": 2196,
        "difficulty": "Medium/Hard",
        "subPattern": "grid query sweep",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2940,
        "title": "Find Building Where Alice and Bob Can Meet",
        "slug": "find-building-where-alice-and-bob-can-meet",
        "rating": 2327,
        "difficulty": "Hard",
        "subPattern": "monotonic offline query",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 2736,
        "title": "Maximum Sum Queries",
        "slug": "maximum-sum-queries",
        "rating": 2533,
        "difficulty": "Hard",
        "subPattern": "offline dominance query",
        "why": "Sorts events and queries so updates happen once and query state is cheap.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "coordinate-compression",
      "sweep-line",
      "cut-property",
      "difference-array"
    ]
  },
  {
    "slug": "sweep-line",
    "title": "Sweep Line",
    "group": "Range Query and Offline Techniques",
    "icon": "CalendarRange",
    "tagline": "Turn intervals, points, times, and rectangles into sorted events with an active set.",
    "concept": [
      "Sweep line processes events in coordinate order and maintains the active objects crossing the current coordinate.",
      "It converts pairwise interval or geometry checks into start/end updates and queries on active state.",
      "The active state can be a counter, heap, ordered set, Fenwick tree, or segment tree."
    ],
    "motivation": [
      "Brute force compares every point with every interval or every rectangle with every coordinate.",
      "Events matter only when something starts, ends, or a query is asked.",
      "Sorting those events lets the algorithm update state exactly at the coordinates where the answer can change."
    ],
    "whenUse": [
      "Intervals, booking, meeting rooms, flowers in bloom, rectangles, points covered by ranges, or offline coordinate queries.",
      "Need maximum overlap, active minimum/maximum, or area/coverage.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Design start, end, and query events.",
      "Sort with a deliberate tie-break rule.",
      "Maintain active state after applying all events that should affect the current coordinate.",
      "Compress coordinates for large sparse geometry.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "When the sweep reaches coordinate x, the data structure contains exactly the objects active at x under the chosen boundary convention.",
    "variants": [
      "Interval overlap counting.",
      "Meeting rooms with heap.",
      "Range add / point query.",
      "Rectangle union area.",
      "Points covered by intervals.",
      "Sweep with ordered set or segment tree.",
      "Offline query sweep."
    ],
    "templateKeys": [
      "sweep_events",
      "sweep_difference",
      "sweep_heap",
      "sweep_compressed_fenwick"
    ],
    "complexity": [
      "Sorting events costs O((n + q) log(n + q)); active updates usually cost O(log n), or O(1) for simple counters.",
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Wrong start/end tie-breaking.",
      "Mixing inclusive and exclusive endpoints.",
      "Forgetting to add r + 1 for integer closed intervals.",
      "Overflow in area or coordinate products.",
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1851,
        "title": "Minimum Interval to Include Each Query",
        "slug": "minimum-interval-to-include-each-query",
        "rating": 2286,
        "difficulty": "Hard",
        "subPattern": "offline interval query",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 2251,
        "title": "Number of Flowers in Full Bloom",
        "slug": "number-of-flowers-in-full-bloom",
        "rating": 2022,
        "difficulty": "Medium/Hard",
        "subPattern": "event sweep boundaries",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 850,
        "title": "Rectangle Area II",
        "slug": "rectangle-area-ii",
        "rating": 2236,
        "difficulty": "Hard",
        "subPattern": "rectangle union sweep",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 2276,
        "title": "Count Integers in Intervals",
        "slug": "count-integers-in-intervals",
        "rating": 2222,
        "difficulty": "Hard",
        "subPattern": "dynamic interval coverage",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 2503,
        "title": "Maximum Number of Points from Grid Queries",
        "slug": "maximum-number-of-points-from-grid-queries",
        "rating": 2196,
        "difficulty": "Medium/Hard",
        "subPattern": "grid query sweep",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 2736,
        "title": "Maximum Sum Queries",
        "slug": "maximum-sum-queries",
        "rating": 2533,
        "difficulty": "Hard",
        "subPattern": "offline dominance query",
        "why": "Represents interval or geometry changes as events over one ordered coordinate.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can the answer change only at event coordinates?",
      "What exactly is active at a query coordinate?",
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "difference-array",
      "coordinate-compression",
      "offline-query-processing",
      "boundary-and-edge-case-thinking"
    ]
  },
  {
    "slug": "state-compression",
    "title": "State Compression",
    "group": "Bit and Math Patterns",
    "icon": "Binary",
    "tagline": "Encode subsets, assignments, parity, or small resources as bitmasks for DP or graph search.",
    "concept": [
      "State compression maps a set of boolean choices into bits of an integer mask.",
      "It makes exponential search explicit and allows memoization over masks instead of over whole histories.",
      "It is practical when n is around 15 to 22, or when only a few independent features must be tracked."
    ],
    "motivation": [
      "Brute force recursively explores all assignments or subsets.",
      "Many histories lead to the same used set, remaining set, or visited set.",
      "A mask state merges those histories and transitions by setting, clearing, or iterating bits."
    ],
    "whenUse": [
      "n is small, usually <= 20.",
      "Need visit all nodes, assign people/items, partition into groups, or track used elements.",
      "The future depends on the set, not the order used to obtain it.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "Represent chosen elements as mask bits.",
      "Use popcount to derive the next index when possible.",
      "Iterate unset bits for assignment or submasks for partition.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "All histories with the same mask have the same remaining choices; the best value for that mask is sufficient.",
    "variants": [
      "Assignment DP.",
      "Subset partition DP.",
      "BFS over node + mask.",
      "Submask enumeration.",
      "SOS-style transforms and meet in the middle."
    ],
    "templateKeys": [
      "bitmask_dp",
      "state_bfs",
      "subset_enumeration"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 1681,
        "title": "Minimum Incompatibility",
        "slug": "minimum-incompatibility",
        "rating": 2390,
        "difficulty": "Hard",
        "subPattern": "partition mask DP",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1655,
        "title": "Distribute Repeating Integers",
        "slug": "distribute-repeating-integers",
        "rating": 2307,
        "difficulty": "Hard",
        "subPattern": "customer subset DP",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1879,
        "title": "Minimum XOR Sum of Two Arrays",
        "slug": "minimum-xor-sum-of-two-arrays",
        "rating": 2145,
        "difficulty": "Medium/Hard",
        "subPattern": "assignment mask DP",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 1986,
        "title": "Minimum Number of Work Sessions to Finish the Tasks",
        "slug": "minimum-number-of-work-sessions-to-finish-the-tasks",
        "rating": 1995,
        "difficulty": "Medium/Hard",
        "subPattern": "session mask DP",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 1799,
        "title": "Maximize Score after N Operations",
        "slug": "maximize-score-after-n-operations",
        "rating": 2073,
        "difficulty": "Medium/Hard",
        "subPattern": "pairing mask DP",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 847,
        "title": "Shortest Path Visiting all Nodes",
        "slug": "shortest-path-visiting-all-nodes",
        "rating": 2201,
        "difficulty": "Hard",
        "subPattern": "BFS over state mask",
        "why": "Uses bitmasks to make exponential state explicit and memoizable.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "dp-state-design",
      "dp-transition-design",
      "state-design",
      "enumeration-strategy"
    ]
  },
  {
    "slug": "loop-invariant",
    "title": "Loop Invariant",
    "group": "Advanced Mixed Patterns",
    "icon": "GitBranch",
    "tagline": "Write loop contracts that make binary search, windows, stacks, and DP scans mechanically correct.",
    "concept": [
      "A loop invariant is a contract that holds before the first iteration, after every iteration, and at termination.",
      "It is the implementation-level version of correctness for scans and searches.",
      "Hard bugs become easier to find when each line is either preserving or restoring the invariant."
    ],
    "motivation": [
      "Brute force often has no compressed loop state: each candidate is checked directly.",
      "Optimized loops compress many candidates into a few variables, so correctness depends on what those variables mean.",
      "The invariant explains why terminating at low, left, stack top, or dp index returns the right answer."
    ],
    "whenUse": [
      "Binary search boundaries, two pointers, monotonic structures, greedy frontiers, or rolling DP.",
      "You are unsure what low/high/left/right mean after an update.",
      "The direct enumeration is clear but one dimension is too expensive.",
      "Constraints suggest O(n log n), O(n), O(q log n), or a controlled exponential state.",
      "The answer can be updated incrementally after sorting, scanning, grouping, or fixing one object."
    ],
    "coreIdea": [
      "State initialization makes the invariant true.",
      "Each branch preserves the invariant.",
      "Termination plus invariant implies the postcondition.",
      "Name the object being enumerated or committed.",
      "Name the state that summarizes all previous work.",
      "Update the answer exactly when the invariant says the state is valid.",
      "Write the boundary policy before coding: inclusive ends, duplicates, sentinels, and empty ranges."
    ],
    "invariant": "Initialization, maintenance, and termination all hold: the loop starts valid, every iteration preserves validity, and the final state directly yields the answer.",
    "variants": [
      "Binary search false/true partition.",
      "Sliding window valid range.",
      "Monotonic stack unresolved candidates.",
      "Greedy frontier.",
      "DP scan with previous row/state."
    ],
    "templateKeys": [
      "loop_invariant_binary_search",
      "constraint_scan"
    ],
    "complexity": [
      "Most optimized versions target O(n), O(n log n), O((n + q) log n), or O(2^n * poly(n)) depending on the state size.",
      "The hidden cost is usually inside the feasibility check, transition loop, or data-structure operation.",
      "If a template nests a scan inside another scan, re-check whether that scan should be precomputed or maintained."
    ],
    "mistakes": [
      "Keeping too much state and making transitions harder than the original problem.",
      "Updating the answer before the invariant has been restored.",
      "Using int where the contribution count or product needs long long.",
      "Not testing n = 0/1, duplicate values, equal boundaries, and maximum constraints."
    ],
    "practice": [
      {
        "id": 875,
        "title": "Koko Eating Bananas",
        "slug": "koko-eating-bananas",
        "rating": 1766,
        "difficulty": "Medium",
        "subPattern": "minimum feasible speed",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 1,
        "tier": "Core Practice"
      },
      {
        "id": 1011,
        "title": "Capacity to Ship Packages Within D Days",
        "slug": "capacity-to-ship-packages-within-d-days",
        "rating": 1725,
        "difficulty": "Medium",
        "subPattern": "minimum feasible capacity",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 2,
        "tier": "Core Practice"
      },
      {
        "id": 1898,
        "title": "Maximum Number of Removable Characters",
        "slug": "maximum-number-of-removable-characters",
        "rating": 1913,
        "difficulty": "Medium",
        "subPattern": "monotone deletion check",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 3,
        "tier": "Advanced Practice"
      },
      {
        "id": 1574,
        "title": "Shortest Subarray to Be Removed to Make Array Sorted",
        "slug": "shortest-subarray-to-be-removed-to-make-array-sorted",
        "rating": 1932,
        "difficulty": "Medium",
        "subPattern": "prefix/suffix splice",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 4,
        "tier": "Advanced Practice"
      },
      {
        "id": 1838,
        "title": "Frequency of the Most Frequent Element",
        "slug": "frequency-of-the-most-frequent-element",
        "rating": 1876,
        "difficulty": "Medium",
        "subPattern": "sort + window",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 5,
        "tier": "Challenge Practice"
      },
      {
        "id": 862,
        "title": "Shortest Subarray with Sum at Least K",
        "slug": "shortest-subarray-with-sum-at-least-k",
        "rating": 2307,
        "difficulty": "Hard",
        "subPattern": "prefix deque invariant",
        "why": "Requires writing and maintaining the exact condition before every loop iteration.",
        "order": 6,
        "tier": "Challenge Practice"
      }
    ],
    "recognition": [
      "Can I state the brute-force objects and which one I will stop enumerating?",
      "Is there a monotone predicate, maintained window, sorted order, contribution count, or DP state?",
      "What exact invariant is true before and after each update?",
      "Which sample would break if duplicates or boundary equality are handled incorrectly?"
    ],
    "related": [
      "invariant-thinking",
      "binary-search-on-answer",
      "fix-right-maintain-left",
      "proof-techniques"
    ]
  }
];

const TOPIC_TITLE_BY_SLUG = new Map(
  TOPIC_DEFINITIONS.map((topic) => [topic.slug, topic.title]),
);

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function templateMarkdown(keys: string[]): string {
  return keys
    .map((key) => {
      const template = TEMPLATES[key];
      if (!template) {
        throw new Error(`Missing handbook template: ${key}`);
      }
      return [
        "<details>",
        `<summary>${template.summary}</summary>`,
        "",
        "```cpp",
        template.code,
        "```",
        "",
        "</details>",
      ].join("\n");
    })
    .join("\n\n");
}

function practiceTable(title: PracticeProblem["tier"], rows: PracticeProblem[]): string {
  if (rows.length === 0) {
    return "";
  }

  const header = [
    `**${title}**`,
    "",
    "| LC | Problem | Rating | Difficulty | Sub-pattern | Why useful | Order |",
    "|---:|---|---:|---|---|---|---:|",
  ];
  const body = rows.map((problem) =>
    `| ${problem.id} | [${problem.title}](https://leetcode.com/problems/${problem.slug}) | ~${problem.rating} | ${problem.difficulty} | ${problem.subPattern} | ${problem.why} | ${problem.order} |`,
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
    .map((tier) => practiceTable(tier, problems.filter((p) => p.tier === tier)))
    .filter(Boolean)
    .join("\n\n");
}

function proofMarkdown(topic: PatternTopicDefinition): string {
  return `<details>\n<summary>Proof Sketch: ${topic.title}</summary>\n\n${topic.invariant} The algorithm initializes this statement before processing, restores it after each update, and only reads the answer from state covered by the statement. Any candidate skipped by the optimized algorithm is either represented inside the maintained state, dominated by a better candidate, or assigned to a different canonical owner. Therefore the optimized count or choice matches the brute-force definition.\n\n</details>`;
}

function relatedMarkdown(slugs: string[]): string {
  return slugs
    .map((slug) => {
      const title = TOPIC_TITLE_BY_SLUG.get(slug) ?? slug;
      return `- [${title}](/handbook/${slug})`;
    })
    .join("\n");
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
        body: `${bulletList(def.concept)}\n\nThis topic differs from brute force by replacing repeated candidate evaluation with a named pattern, maintained state, or proof obligation.`,
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
        body: bulletList(def.coreIdea),
      },
      {
        id: "key-invariant",
        title: "5. Key Invariant or Correctness Idea",
        body: `${def.invariant}\n\n${proofMarkdown(def)}`,
      },
      {
        id: "common-variants",
        title: "6. Common Variants",
        body: bulletList(def.variants),
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
        title: "10. Practice Problems rating >= 1700",
        body: practiceMarkdown(def.practice),
      },
      {
        id: "recognition-checklist",
        title: "11. Recognition Checklist",
        body: bulletList(def.recognition),
      },
      {
        id: "related-topics",
        title: "12. Related Topics",
        body: relatedMarkdown(def.related),
      },
    ],
  };
}

export const PATTERN_HANDBOOK_TOPICS: HandbookTopic[] =
  TOPIC_DEFINITIONS.map(createTopic);
