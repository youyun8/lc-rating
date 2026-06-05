import type { HandbookTopic } from "../model";

export const monotonicStackVsDeque: HandbookTopic = {
  slug: "monotonic-stack-vs-deque",
  title: "Monotonic Stack vs Deque",
  tagline:
    "Both monotonic structures in one place — every stack pattern (next-greater, histogram, contribution, lexicographic) and every deque pattern (window extrema, windowed-max DP), plus when to reach for each.",
  icon: "GitCompare",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A monotonic **stack** and a monotonic **deque** both keep their contents sorted as you scan, and both pop violators so that each index is touched \`O(1)\` amortized times. Beginners blur them together because the "pop while the order is broken" loop looks identical. The difference is the **access pattern**, and it changes what each can solve:

- A **monotonic stack** touches **one end** (push/pop the back). Its purpose is to *discover a relationship* — the moment an element is popped, the element that evicted it is its "next greater/smaller" (and the new top is its "previous greater/smaller").
- A **monotonic deque** touches **both ends**. It pops the **back** to preserve monotonicity (exactly like the stack) **and** pops the **front** to evict elements that have slid out of a moving window. You then *read the front* as the current window's max or min.

In one line: a stack answers "**who blocks me?**" per element; a deque answers "**what is the best value in this range right now?**" per window.

This page is the home for **both** structures. The stack patterns are [next/previous greater](#stack-next-greater), [histogram spans](#stack-histogram), [contribution counting](#stack-contribution), [lexicographic removal](#stack-lexicographic), and [advanced tricks](#stack-advanced). The deque patterns are [window extrema](#deque-window), [two-deque ranges](#deque-two), [prefix sums with negatives](#deque-prefix), and [windowed-max DP](#deque-dp). The [comparison](#why-two-ends) and [decision guide](#decision) tie them together.`,
    },
    {
      id: "distinction",
      title: "The core distinction",
      body: `| Aspect | Monotonic stack | Monotonic deque |
| --- | --- | --- |
| Ends used | one (back only) | two (back + front) |
| What you read | the element being **popped** | the **front** element |
| Question answered | next/previous greater or smaller | max/min of the current window |
| Why an element leaves | a "blocker" of opposite order arrives | order (back) **or** window expiry (front) |
| Output shape | one answer per element | one answer per window/index |
| Range left bound | implicit (whole prefix) | explicit and **moving** |
| Typical signals | spans, histogram, NGE, contribution | "max/min of every length-k window" |
| Space | \`O(n)\` | \`O(k)\` |

Both are \`O(n)\` amortized because every index is pushed once and popped once. The deque simply has a *second* exit door (the front) for the sliding-window deadline.`,
    },
    {
      id: "stack-next-greater",
      title: "Stack pattern: next / previous greater or smaller",
      body: `Keep indices on the stack so their values are **decreasing**. When a larger value arrives it is the "next greater" for everything it pops — the answer is discovered *on the pop*, not from the front.

\`\`\`cpp
// For each i, index of the next strictly greater element to the right, else -1
vector<int> nextGreater(const vector<int>& a) {
  int n = a.size();
  vector<int> res(n, -1);
  stack<int> st;  // indices, values decreasing bottom->top
  for (int i = 0; i < n; i++) {
    while (!st.empty() && a[st.top()] < a[i]) {
      res[st.top()] = i;  // a[i] is the next greater for st.top()
      st.pop();
    }
    st.push(i);
  }
  return res;
}
\`\`\`

Variations are sign/direction flips:

- **Next smaller**: pop while \`a[st.top()] > a[i]\`.
- **Previous greater/smaller**: iterate right to left, or read what remains on the stack.
- **Circular array** (LC 503): iterate \`2n\` times using \`i % n\`.
- **Daily Temperatures** (LC 739): store \`res[i] = i - st.top()\` instead of the index.`,
    },
    {
      id: "stack-histogram",
      title: "Stack pattern: largest rectangle in a histogram",
      body: `For each bar, the widest rectangle of that height runs from the previous-smaller bar to the next-smaller bar. A single increasing stack computes both boundaries.

\`\`\`cpp
// Largest rectangle in histogram (LC 84); sentinel 0 flushes the stack
int largestRectangleArea(vector<int> h) {
  h.push_back(0);  // sentinel forces all bars to pop
  stack<int> st;   // indices with increasing heights
  int best = 0;
  for (int i = 0; i < (int)h.size(); i++) {
    while (!st.empty() && h[st.top()] >= h[i]) {
      int height = h[st.top()];
      st.pop();
      int left = st.empty() ? -1 : st.top();
      best = max(best, height * (i - left - 1));  // width between boundaries
    }
    st.push(i);
  }
  return best;
}
\`\`\`

**Maximal Rectangle** in a 0/1 matrix (LC 85) reduces to running this per row over column-wise height histograms.`,
    },
    {
      id: "stack-contribution",
      title: "Stack pattern: contribution / subarray domination",
      body: `Many "sum over all subarrays of (min/max)" problems ask, for each element, *in how many subarrays is it the minimum (or maximum)?* The stack finds the span where it stops being the extreme; the contribution is \`a[i] * left * right\`.

\`\`\`cpp
// Sum of minimums of all subarrays (LC 907), mod 1e9+7
int sumSubarrayMins(vector<int>& a) {
  const long long MOD = 1e9 + 7;
  int n = a.size();
  vector<long long> left(n), right(n);  // span where a[i] is the min
  stack<int> st;
  for (int i = 0; i < n; i++) {  // strictly-smaller to the left
    while (!st.empty() && a[st.top()] >= a[i]) st.pop();
    left[i] = st.empty() ? i + 1 : i - st.top();
    st.push(i);
  }
  st = {};
  for (int i = n - 1; i >= 0; i--) {  // smaller-or-equal to the right
    while (!st.empty() && a[st.top()] > a[i]) st.pop();
    right[i] = st.empty() ? n - i : st.top() - i;
    st.push(i);
  }
  long long ans = 0;
  for (int i = 0; i < n; i++) ans = (ans + a[i] * left[i] % MOD * right[i]) % MOD;
  return ans;
}
\`\`\`

The asymmetric strict/non-strict comparison (\`>=\` one side, \`>\` the other) avoids double-counting equal values. This is one entry in a larger toolkit — see the [Contribution Method](/handbook/contribution) for the per-bit, pairwise, subsequence, and tree variants.`,
    },
    {
      id: "stack-lexicographic",
      title: "Stack pattern: greedy lexicographic removal",
      body: `When you delete characters/digits to make the result as small (or large) as possible while keeping order, greedily pop larger trailing elements while you still have deletions or future elements to spare.

\`\`\`cpp
// Remove k digits to form the smallest number (LC 402)
string removeKdigits(string num, int k) {
  string st;  // acts as a monotonic (non-decreasing) stack
  for (char c : num) {
    while (k > 0 && !st.empty() && st.back() > c) {
      st.pop_back();
      k--;
    }
    st.push_back(c);
  }
  st.resize(st.size() - k);  // still have deletions left -> drop from tail
  int i = 0;
  while (i < (int)st.size() - 1 && st[i] == '0') i++;  // strip leading 0s
  string res = st.substr(i);
  return res.empty() ? "0" : res;
}
\`\`\`

The same idea powers Remove Duplicate Letters (LC 316) and Create Maximum Number (LC 321).`,
    },
    {
      id: "stack-advanced",
      title: "Stack pattern: advanced (trees, ramps, leaves)",
      body: `**Greedy tree builder (LC 1130).** Minimum Cost Tree From Leaf Values pairs each leaf with the smaller of its neighbours; a decreasing stack pops a local minimum the moment a larger value arrives, charging it against its cheaper neighbour.

\`\`\`cpp
// Minimum Cost Tree From Leaf Values (LC 1130)
int mctFromLeafValues(vector<int>& a) {
  int res = 0;
  vector<int> st = {INT_MAX};  // sentinel
  for (int x : a) {
    while (st.back() <= x) {  // x is a larger neighbour for st.back()
      int mid = st.back();
      st.pop_back();
      res += mid * min(st.back(), x);  // merge cost with the cheaper side
    }
    st.push_back(x);
  }
  for (int i = 2; i < (int)st.size(); i++) res += st[i] * st[i - 1];
  return res;
}
\`\`\`

**Decreasing-stack candidates + reverse scan (LC 962).** Maximum Width Ramp builds a stack of indices whose values strictly decrease (the only possible left ends), then scans from the right to pop the widest matches.

\`\`\`cpp
// Maximum Width Ramp (LC 962)
int maxWidthRamp(vector<int>& a) {
  int n = a.size();
  stack<int> st;
  for (int i = 0; i < n; i++) {
    if (st.empty() || a[st.top()] > a[i]) st.push(i);
  }
  int res = 0;
  for (int j = n - 1; j >= 0; j--) {
    while (!st.empty() && a[st.top()] <= a[j]) {
      res = max(res, j - st.top());
      st.pop();
    }
  }
  return res;
}
\`\`\`

**More.** Sum of Subarray Ranges (LC 2104) = max contributions − min contributions. Trapping Rain Water (LC 42), Next Greater Element IV (LC 2454, two stacks), and Steps to Make Array Non-decreasing (LC 2289) are all stack classics. A monotonic stack also builds a **Cartesian tree** in \`O(n)\`, the bridge to range-minimum and treap problems.`,
    },
    {
      id: "deque-window",
      title: "Deque pattern: sliding-window maximum / minimum",
      body: `To get the **maximum (or minimum) of every length-k window** in \`O(n)\`, keep a deque of indices whose values are monotonically decreasing; the front is always the window maximum. The extra step versus a stack is **front eviction** of indices that have aged out of the window.

\`\`\`cpp
// Maximum of every length-k window (LC 239)
vector<int> maxSlidingWindow(vector<int>& a, int k) {
  deque<int> dq;  // indices, values decreasing front->back
  vector<int> res;
  for (int i = 0; i < (int)a.size(); i++) {
    if (!dq.empty() && dq.front() <= i - k) dq.pop_front();  // expire (FRONT)
    while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();  // order (BACK)
    dq.push_back(i);
    if (i >= k - 1) res.push_back(a[dq.front()]);  // read the window max
  }
  return res;
}
\`\`\`

Flip the back comparison to \`>=\` for a window **minimum**. Drop the \`pop_front\` line and you are back to a monotonic stack — but you lose the ability to answer windowed queries.`,
    },
    {
      id: "deque-two",
      title: "Deque pattern: two deques for max − min windows",
      body: `When validity depends on both ends of the value range — "longest subarray where $\\max - \\min \\le \\text{limit}$" (LC 1438) — run **two** monotonic deques over the same sliding window: one decreasing (tracks the max at its front) and one increasing (tracks the min). Shrink \`left\` whenever \`maxDeque.front - minDeque.front > limit\`.

\`\`\`cpp
// Longest subarray with abs(max - min) <= limit (LC 1438)
int longestSubarray(vector<int>& a, int limit) {
  deque<int> mx, mn;  // mx decreasing, mn increasing (store values)
  int left = 0, best = 0;
  for (int right = 0; right < (int)a.size(); right++) {
    while (!mx.empty() && mx.back() < a[right]) mx.pop_back();
    while (!mn.empty() && mn.back() > a[right]) mn.pop_back();
    mx.push_back(a[right]);
    mn.push_back(a[right]);
    while (mx.front() - mn.front() > limit) {  // window invalid -> shrink
      if (mx.front() == a[left]) mx.pop_front();
      if (mn.front() == a[left]) mn.pop_front();
      left++;
    }
    best = max(best, right - left + 1);
  }
  return best;
}
\`\`\`

Continuous Subarrays (LC 2762) is the same two-deque window with a counting objective.`,
    },
    {
      id: "deque-prefix",
      title: "Deque pattern: prefix sums + deque (negatives)",
      body: `A plain shrinking window fails for "shortest subarray with sum >= k" when values can be **negative**, because growing the window no longer monotonically grows the sum. Switch to prefix sums and keep a deque of *increasing* prefix values.

\`\`\`cpp
// Shortest subarray with sum >= k, values may be negative (LC 862)
int shortestSubarray(vector<int>& a, long long k) {
  int n = a.size();
  vector<long long> pre(n + 1, 0);
  for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
  deque<int> dq;  // indices, pre[] increasing front->back
  int best = INT_MAX;
  for (int i = 0; i <= n; i++) {
    while (!dq.empty() && pre[i] - pre[dq.front()] >= k) {  // valid window
      best = min(best, i - dq.front());
      dq.pop_front();
    }
    while (!dq.empty() && pre[dq.back()] >= pre[i]) dq.pop_back();  // keep increasing
    dq.push_back(i);
  }
  return best == INT_MAX ? -1 : best;
}
\`\`\`

This and the windowed-max cases below are why the [Sliding Window](/handbook/sliding-window) chapter leans on the deque whenever a single counter cannot certify the window in \`O(1)\`.`,
    },
    {
      id: "deque-dp",
      title: "Deque pattern: windowed-max DP optimization",
      body: `A deque drops a factor of \`n\` from a DP whose transition is a max/min over a **sliding window of predecessors**, e.g. \`dp[i] = a[i] + max(dp[i-k .. i-1])\`.

\`\`\`cpp
// Jump Game VI (LC 1696): dp[i] = nums[i] + max(dp[i-k..i-1]) via deque
int maxResult(vector<int>& nums, int k) {
  int n = nums.size();
  vector<int> dp(n);
  deque<int> dq;  // indices, dp[] decreasing front->back
  dp[0] = nums[0];
  dq.push_back(0);
  for (int i = 1; i < n; i++) {
    if (dq.front() < i - k) dq.pop_front();      // window expiry (FRONT)
    dp[i] = nums[i] + dp[dq.front()];            // best reachable predecessor
    while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();  // order (BACK)
    dq.push_back(i);
  }
  return dp[n - 1];
}
\`\`\`

Constrained Subsequence Sum (LC 1425) is the same recurrence with a "take or skip" twist; Maximum Number of Robots Within Budget (LC 2398) pairs the windowed max with a two-pointer cost window.`,
    },
    {
      id: "why-two-ends",
      title: "Why the deque needs two ends",
      body: `The decisive question is: *can the value you want disappear for a reason other than being out-ordered?*

- For **next greater / span** problems, no. An element is relevant until a strictly greater value pops it; nothing else can retire it. One end suffices, so a stack works.
- For **sliding-window max/min**, yes. The current maximum can stay the largest value yet **age out of the window** before any larger value arrives. A stack has no way to remove a still-largest-but-expired element from the middle. The deque's front-eviction is exactly that missing capability.

So the rule of thumb: **a moving left boundary forces the second end.** If the range you query has a fixed left edge (the start of the array, or "everything before me"), a stack is enough; if the left edge slides forward, you need a deque.`,
    },
    {
      id: "decision",
      title: "Choosing between them",
      body: `Ask these in order:

1. **Do I need, per element, "the next/previous bigger or smaller one"?** → monotonic **stack** (NGE, daily temperatures, stock span, histogram, contribution sums).
2. **Do I need, per index/window, "the max or min over a range whose left bound is moving"?** → monotonic **deque** (sliding-window extrema, longest window with $\\max - \\min \\le \\text{limit}$).
3. **Is it a DP transition \`dp[i] = best(dp[j])\` where \`j\` ranges over a sliding window?** → monotonic **deque** (windowed-max DP).
4. **Is the value an aggregate I can attribute to an element's span?** → monotonic **stack** feeding the [Contribution Method](/handbook/contribution).

Quick mnemonic: **stack = relationships, deque = windows.**`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Structure | Time | Space |
| --- | --- | --- | --- |
| Next/previous greater-smaller | stack | \`O(n)\` | \`O(n)\` |
| Histogram / maximal rectangle | stack | \`O(n)\` / \`O(rows*cols)\` | \`O(n)\` |
| Subarray contribution sums | stack | \`O(n)\` | \`O(n)\` |
| Lexicographic greedy removal | stack | \`O(n)\` | \`O(n)\` |
| Sliding-window max/min | deque | \`O(n)\` | \`O(k)\` |
| max − min window (two deques) | deque | \`O(n)\` | \`O(k)\` |
| Prefix sums + deque | deque | \`O(n)\` | \`O(n)\` |
| Windowed-max DP | deque | \`O(n)\` | \`O(n)\` |

Both are amortized linear; the deque's tighter \`O(k)\` window space comes from continuously expiring its front.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `**Monotonic stack (relationships / spans)**

| ID | Problem | Technique |
| --- | --- | --- |
| 42 | [Trapping Rain Water](https://leetcode.cn/problems/trapping-rain-water) | decreasing stack (or two pointers) |
| 84 | [Largest Rectangle in Histogram](https://leetcode.cn/problems/largest-rectangle-in-histogram) | histogram spans |
| 85 | [Maximal Rectangle](https://leetcode.cn/problems/maximal-rectangle) | per-row histogram |
| 316 | [Remove Duplicate Letters](https://leetcode.cn/problems/remove-duplicate-letters) | greedy + seen set |
| 402 | [Remove K Digits](https://leetcode.cn/problems/remove-k-digits) | greedy monotonic removal |
| 496 / 503 | [Next Greater Element I/II](https://leetcode.cn/problems/next-greater-element-i) | next greater (circular) |
| 739 | [Daily Temperatures](https://leetcode.cn/problems/daily-temperatures) | next greater (distance) |
| 901 | [Online Stock Span](https://leetcode.cn/problems/online-stock-span) | running span |
| 907 | [Sum of Subarray Minimums](https://leetcode.cn/problems/sum-of-subarray-minimums) | contribution counting |
| 962 | [Maximum Width Ramp](https://leetcode.cn/problems/maximum-width-ramp) | stack + reverse scan |
| 1130 | [Minimum Cost Tree From Leaf Values](https://leetcode.cn/problems/minimum-cost-tree-from-leaf-values) | greedy monotonic stack |

**Monotonic deque (windowed extrema)**

| ID | Problem | Technique |
| --- | --- | --- |
| 239 | [Sliding Window Maximum](https://leetcode.cn/problems/sliding-window-maximum) | monotonic deque |
| 862 | [Shortest Subarray with Sum at Least K](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k) | prefix sums + deque |
| 1425 | [Constrained Subsequence Sum](https://leetcode.cn/problems/constrained-subsequence-sum) | windowed-max DP |
| 1438 | [Longest Subarray with Abs Diff ≤ Limit](https://leetcode.cn/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit) | two deques |
| 1696 | [Jump Game VI](https://leetcode.cn/problems/jump-game-vi) | windowed-max DP |
| 2398 | [Maximum Robots Within Budget](https://leetcode.cn/problems/maximum-number-of-robots-within-budget) | window + deque |
| 2762 | [Continuous Subarrays](https://leetcode.cn/problems/continuous-subarrays) | two deques |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Using a stack where a window expires**: the classic bug — a plain stack cannot remove a still-extreme but out-of-window element. If the left bound moves, reach for the deque.
- **Forgetting the front-pop**: a deque without \`pop_front\` silently degrades into a wrong-answer stack; check expiry *before* reading the front.
- **Store indices, not values** (deque min/max can store either, but indices are needed for expiry and for stack spans/widths).
- **Strict vs non-strict back-pop**: \`<\` vs \`<=\` decides tie handling; for window *max* with duplicates either works, but for contribution sums it must be asymmetric (one strict side, one non-strict).
- **Sentinels**: appending a \`0\` (histogram) or \`±INF\` cleanly flushes a stack at the end.
- **Read timing**: a stack's answer appears *when an element is popped*; a deque's answer is read *from the front after maintenance*. Mixing the two timings is a frequent mistake.`,
    },
  ],
};
