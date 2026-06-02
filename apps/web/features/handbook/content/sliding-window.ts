import type { HandbookTopic } from "../model";

export const slidingWindow: HandbookTopic = {
  slug: "sliding-window",
  title: "Sliding Window",
  tagline:
    "Maintain a moving sub-array/substring and amortize work to O(n) with two pointers.",
  icon: "PanelsTopLeft",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A sliding window keeps a contiguous range \`[left, right]\` over an array or string and slides it forward, updating an aggregate (sum, count, frequency map) incrementally instead of recomputing it. Each element enters and leaves the window at most once, so the total work is \`O(n)\`.

Signals that point to a sliding window:

- "longest / shortest **contiguous** subarray or substring such that …"
- "subarray with sum / product / distinct-count constraint"
- "at most K …" or "exactly K …" of something within a contiguous range
- A brute force over all subarrays is \`O(n^2)\` and the constraint is **monotone** as the window grows or shrinks.

There are three canonical shapes: **variable-size** (grow right, shrink left while invalid), **fixed-size** (window of length \`k\`), and **at-most-K → exactly-K** (difference of two at-most windows).`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Two-pointer thinking and the idea of *amortized* analysis (each index moves forward only).
- Hash maps / frequency arrays for counting characters or values.
- Prefix sums as a fallback when negatives break monotonicity.

Related: [Binary Search](/handbook/binary-search), [Monotonic Stack](/handbook/monotonic-stack) (monotonic **deque** powers sliding-window maximum), and [Strings](/handbook/strings).`,
    },
    {
      id: "variable",
      title: "Template: variable-size window",
      body: `Grow the window by moving \`right\`; whenever the window becomes invalid, shrink from \`left\` until it is valid again. Track the best valid window.

\`\`\`cpp
// Longest substring without repeating characters (LC 3)
int lengthOfLongestSubstring(string s) {
    vector<int> last(128, -1);        // last index each char was seen
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char c = s[right];
        if (last[c] >= left) left = last[c] + 1; // jump left past the duplicate
        last[c] = right;
        best = max(best, right - left + 1);
    }
    return best;
}
\`\`\`

The general "shrink while invalid" skeleton:

\`\`\`cpp
// Generic variable window: maximize length subject to an invariant
int left = 0, best = 0;
for (int right = 0; right < n; right++) {
    add(a[right]);                    // include a[right]
    while (!valid()) { remove(a[left]); left++; } // restore the invariant
    best = max(best, right - left + 1);
}
\`\`\`

For *minimum-length* windows, shrink as far as possible *while still valid* and record the length on each successful shrink (LC 209 Minimum Size Subarray Sum, LC 76 Minimum Window Substring).`,
    },
    {
      id: "fixed",
      title: "Template: fixed-size window",
      body: `When the window length \`k\` is fixed, add the entering element and remove the leaving one each step.

\`\`\`cpp
// Maximum average / sum of any length-k subarray
double maxAverage(vector<int>& a, int k) {
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    long long best = sum;
    for (int i = k; i < (int)a.size(); i++) {
        sum += a[i] - a[i - k];       // slide: add new, drop old
        best = max(best, sum);
    }
    return (double)best / k;
}
\`\`\`

For "permutation in string" / "find all anagrams" (LC 567, LC 438), keep a frequency array and a \`matches\` counter so each step is \`O(1)\` over the 26-letter alphabet.`,
    },
    {
      id: "atmostk",
      title: "Technique: at-most-K and exactly-K",
      body: `Counting subarrays with **exactly K** of something is awkward directly, but **at most K** is a clean variable window. Use:

> exactly(K) = atMost(K) − atMost(K − 1)

\`\`\`cpp
// Count subarrays with exactly K distinct integers (LC 992)
int subarraysWithKDistinct(vector<int>& a, int k) {
    auto atMost = [&](int k) {
        unordered_map<int,int> cnt;
        int left = 0, res = 0;
        for (int right = 0; right < (int)a.size(); right++) {
            if (++cnt[a[right]] == 1) k--;        // new distinct value
            while (k < 0) if (--cnt[a[left++]] == 0) k++;
            res += right - left + 1;              // # valid windows ending at right
        }
        return res;
    };
    return atMost(k) - atMost(k - 1);
}
\`\`\`

The same trick counts subarrays with sum / product / odd-count constraints (LC 1248 Count Number of Nice Subarrays, LC 713 Subarray Product Less Than K).`,
    },
    {
      id: "deque",
      title: "Technique: monotonic deque for window extrema",
      body: `To get the **maximum (or minimum) of every length-k window** in \`O(n)\`, keep a deque of indices whose values are monotonically decreasing; the front is always the window maximum.

\`\`\`cpp
// Sliding window maximum (LC 239)
vector<int> maxSlidingWindow(vector<int>& a, int k) {
    deque<int> dq;                    // indices, values decreasing front->back
    vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back(); // pop smaller
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();    // drop out-of-window index
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}
\`\`\`

This deque idea generalizes to "longest subarray where max − min ≤ limit" (LC 1438) using two deques (one for max, one for min).`,
    },
    {
      id: "advanced",
      title: "Advanced techniques (hard problems)",
      body: `**When negatives break the window: prefix sums + monotonic deque.** The plain shrinking window fails for "shortest subarray with sum ≥ K" when values can be negative, because growing the window no longer monotonically grows the sum. Switch to prefix sums and keep a deque of *increasing* prefix values.

\`\`\`cpp
// Shortest subarray with sum >= k, values may be negative (LC 862)
int shortestSubarray(vector<int>& a, long long k) {
    int n = a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    deque<int> dq;                              // indices, pre[] increasing front->back
    int best = INT_MAX;
    for (int i = 0; i <= n; i++) {
        while (!dq.empty() && pre[i] - pre[dq.front()] >= k) {  // found a valid window
            best = min(best, i - dq.front()); dq.pop_front();
        }
        while (!dq.empty() && pre[dq.back()] >= pre[i]) dq.pop_back(); // keep increasing
        dq.push_back(i);
    }
    return best == INT_MAX ? -1 : best;
}
\`\`\`

**Multi-word / structured windows.** Substring with Concatenation of All Words (LC 30) slides a window of fixed total length and matches a word-frequency map at each of the \`wordLen\` phase offsets. Minimum Window Subsequence (LC 727) uses a forward/backward two-pointer scan (or DP) because order — not just membership — must be preserved.

**Window + auxiliary structure.** "Longest subarray with abs(max − min) ≤ limit" (LC 1438) needs two monotonic deques. "Subarrays with bounded value range" and "count of nice subarrays" combine the window with the at-most-K subtraction trick. The general lesson: when a single counter cannot certify validity in \`O(1)\`, attach a deque, a multiset, or a frequency map to the window.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Time | Space |
| --- | --- | --- |
| Variable / fixed window | \`O(n)\` | \`O(1)\` or \`O(alphabet)\` |
| At-most-K counting | \`O(n)\` | \`O(distinct)\` |
| Monotonic-deque extrema | \`O(n)\` | \`O(k)\` |

Every index enters and exits the window once — that is the source of the linear bound.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| Problem | Technique |
| --- | --- |
| 3 Longest Substring Without Repeating | variable window |
| 209 Minimum Size Subarray Sum | shrinking min-window |
| 76 Minimum Window Substring | min-window with counts |
| 567 / 438 Permutation in String / Find Anagrams | fixed window + freq |
| 424 Longest Repeating Char Replacement | window with majority count |
| 992 Subarrays with K Distinct | at-most-K trick |
| 1248 Count Nice Subarrays | at-most-K trick |
| 713 Subarray Product Less Than K | product window |
| 239 Sliding Window Maximum | monotonic deque |
| 1438 Longest Subarray with Abs Diff ≤ Limit | two deques |

**Harder & newer problems**

| Problem | Technique |
| --- | --- |
| 2444 Count Subarrays With Fixed Bounds | two-pointer window |
| 2398 Maximum Number of Robots Within Budget | window + monotonic deque |
| 2962 Count Subarrays Where Max Element Appears at Least K Times | window |
| 2799 Count Complete Subarrays in an Array | at-most-K window |
| 862 Shortest Subarray with Sum at Least K | prefix sums + deque |
| 727 Minimum Window Subsequence | two-pointer / DP |

**Newer medium problems (rating ≥ 1800)**

| Problem | Rating | Technique |
| --- | --- | --- |
| 3578 Count Partitions With Max-Min Difference at Most K | 2033 | window + monotonic deque |
| 2762 Continuous Subarrays | 1940 | window + two deques |
| 2875 Minimum Size Subarray in Infinite Array | 1914 | window on doubled array |
| 3097 Shortest Subarray With OR at Least K II | 1891 | bit-count window |
| 3346 Maximum Frequency of an Element After Operations I | 1865 | sort + window |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Negatives break monotonicity**: "subarray sum ≥ target" is *not* a clean window when values can be negative — use prefix sums + a monotonic deque or a hash map instead.
- **When to record the answer**: maximize → record after shrinking to valid; minimize → record *while* shrinking and still valid.
- **Char arrays beat hash maps**: for lowercase letters use \`int cnt[26]\` for speed.
- **Exactly-K**: don't try to maintain "exactly" directly; subtract two at-most windows.
- **Window length**: it is \`right - left + 1\` for inclusive pointers — be consistent.`,
    },
  ],
};
