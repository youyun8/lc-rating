import type { HandbookTopic } from "../model";

export const monotonicStackVsDeque: HandbookTopic = {
  slug: "monotonic-stack-vs-deque",
  title: "Monotonic Stack vs Deque",
  tagline:
    "Two cousins, one invariant — when a one-ended monotonic stack is enough and when you need the double-ended deque.",
  icon: "GitCompare",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview",
      body: `A monotonic **stack** and a monotonic **deque** both keep their contents sorted as you scan, and both pop violators so that each index is touched \`O(1)\` amortized times. Beginners blur them together because the "pop while the order is broken" loop looks identical. The difference is the **access pattern**, and it changes what problems each can solve:

- A **monotonic stack** touches **one end** (push/pop the back). Its purpose is to *discover a relationship* — the moment an element is popped, the element that evicted it is its "next greater/smaller" (and the new top is its "previous greater/smaller").
- A **monotonic deque** touches **both ends**. It pops the **back** to preserve monotonicity (exactly like the stack) **and** pops the **front** to evict elements that have slid out of a moving window. You then *read the front* as the current window's max or min.

In one line: a stack answers "**who blocks me?**" per element; a deque answers "**what is the best value in this range right now?**" per window. This page is a focused comparison — the deep dives live in [Monotonic Stack](/handbook/monotonic-stack) and [Sliding Window](/handbook/sliding-window).`,
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
      id: "stack-recap",
      title: "Monotonic stack in one template",
      body: `Keep indices whose values are **decreasing**; when a larger value arrives it is the "next greater" for everything it pops. The popped element — not the front — is what carries the answer.

\`\`\`cpp
// Next greater element to the right (index, else -1)
vector<int> nextGreater(const vector<int>& a) {
  int n = a.size();
  vector<int> res(n, -1);
  stack<int> st;  // indices, values decreasing bottom->top
  for (int i = 0; i < n; i++) {
    while (!st.empty() && a[st.top()] < a[i]) {
      res[st.top()] = i;  // a[i] blocks st.top() -> answer discovered on pop
      st.pop();
    }
    st.push(i);
  }
  return res;
}
\`\`\`

There is **no front operation** — an element stays until something of opposite order evicts it. See [Monotonic Stack](/handbook/monotonic-stack) for histograms, contribution counting, and lexicographic greedy removal.`,
    },
    {
      id: "deque-recap",
      title: "Monotonic deque in one template",
      body: `Same monotonic back, **plus** a front that drops indices older than the window. The front is always the window's extremum, so you read it every step.

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

Drop the \`pop_front\` line and you are back to a monotonic stack — but you would also lose the ability to answer windowed queries.`,
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
2. **Do I need, per index/window, "the max or min over a range whose left bound is moving"?** → monotonic **deque** (sliding-window extrema, longest window with \`\\max - \\min \\le \\text{limit}\`).
3. **Is it a DP transition \`dp[i] = \\text{best}(dp[j])\` where \`j\` ranges over a sliding window?** → monotonic **deque** (windowed-max DP).
4. **Is the value an aggregate I can attribute to an element's span?** → monotonic **stack** feeding the [Contribution Method](/handbook/contribution).

Quick mnemonic: **stack = relationships, deque = windows.**`,
    },
    {
      id: "dp-role",
      title: "Shared role: optimizing DP transitions",
      body: `Both structures are used to drop a factor of \`n\` from a DP recurrence; which one depends on the transition's range.

A **deque** handles \`dp[i] = a[i] + \\max(dp[i-k .. i-1])\` — a max over a sliding window of predecessors:

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

A **stack**, by contrast, optimizes transitions tied to spans — largest rectangle in a histogram, or attributing each subarray to its minimum. The deque variant generalizes to Constrained Subsequence Sum (LC 1425) and Shortest Subarray with Sum ≥ K (LC 862, prefix sums + increasing deque).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Structure | Time | Space | Reads |
| --- | --- | --- | --- |
| Monotonic stack | \`O(n)\` | \`O(n)\` | on pop (the evicted element) |
| Monotonic deque | \`O(n)\` | \`O(k)\` | the front (window extremum) |

Both are amortized linear; the deque's tighter \`O(k)\` space comes from continuously expiring its front.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `**Monotonic stack (relationships / spans)**

| ID | Problem | Why a stack |
| --- | --- | --- |
| 84 | [Largest Rectangle in Histogram](https://leetcode.cn/problems/largest-rectangle-in-histogram) | previous/next smaller span |
| 402 | [Remove K Digits](https://leetcode.cn/problems/remove-k-digits) | greedy lexicographic removal |
| 496 | [Next Greater Element I](https://leetcode.cn/problems/next-greater-element-i) | per-element next greater |
| 739 | [Daily Temperatures](https://leetcode.cn/problems/daily-temperatures) | distance to next greater |
| 907 | [Sum of Subarray Minimums](https://leetcode.cn/problems/sum-of-subarray-minimums) | min-domination spans |

**Monotonic deque (windowed extrema)**

| ID | Problem | Why a deque |
| --- | --- | --- |
| 239 | [Sliding Window Maximum](https://leetcode.cn/problems/sliding-window-maximum) | max of every length-k window |
| 862 | [Shortest Subarray with Sum at Least K](https://leetcode.cn/problems/shortest-subarray-with-sum-at-least-k) | prefix sums + increasing deque |
| 1425 | [Constrained Subsequence Sum](https://leetcode.cn/problems/constrained-subsequence-sum) | windowed-max DP |
| 1438 | [Longest Subarray with Abs Diff ≤ Limit](https://leetcode.cn/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit) | two deques (max & min) |
| 1696 | [Jump Game VI](https://leetcode.cn/problems/jump-game-vi) | windowed-max DP |
| 2398 | [Maximum Robots Within Budget](https://leetcode.cn/problems/maximum-number-of-robots-within-budget) | window + monotonic deque |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Using a stack where a window expires**: the classic bug — a plain stack cannot remove a still-extreme but out-of-window element. If the left bound moves, reach for the deque.
- **Forgetting the front-pop**: a deque without \`pop_front\` silently degrades into a wrong-answer stack; check expiry *before* reading the front.
- **Store indices, not values**, in both — you need positions to compute spans (stack) and to test window expiry (deque).
- **Strict vs non-strict back-pop**: \`<\` vs \`<=\` decides tie handling; for window *max* with duplicates either works, but for contribution sums it must be asymmetric (see [Monotonic Stack](/handbook/monotonic-stack)).
- **Read timing**: a stack's answer appears *when an element is popped*; a deque's answer is read *from the front after maintenance*. Mixing the two timings is a frequent mistake.`,
    },
  ],
};
