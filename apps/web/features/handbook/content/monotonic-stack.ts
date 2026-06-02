import type { HandbookTopic } from "../model";

export const monotonicStack: HandbookTopic = {
  slug: "monotonic-stack",
  title: "Monotonic Stack",
  tagline:
    "Find the next/previous greater or smaller element in O(n) — the backbone of span, histogram, and contribution problems.",
  icon: "Layers",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A monotonic stack keeps its elements in sorted order (increasing or decreasing). As you push a new element, you pop everything that violates the order — and that pop is exactly the moment you discover a "next greater/smaller" relationship. Each index is pushed and popped once, giving \`O(n)\`.

Signals:

- "**next greater / next smaller** element", "previous greater/smaller"
- "**span**" or "how many days until a warmer temperature"
- Largest rectangle in a **histogram**; maximal rectangle in a binary matrix
- "Sum/min/max over all subarrays" via **contribution counting** (how many subarrays does each element dominate)
- Removing characters to get the smallest/largest result (monotonic + greedy)

The companion structure, the **monotonic deque**, handles sliding-window extrema (see [Sliding Window](/handbook/sliding-window)).`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Stack semantics (LIFO) and amortized analysis.
- Comfort indexing arrays and reasoning about "the nearest index to the left/right that …".

Related: [Sliding Window](/handbook/sliding-window), [Dynamic Programming](/handbook/dynamic-programming) (monotonic stacks often optimize DP transitions).`,
    },
    {
      id: "next-greater",
      title: "Template: next greater element",
      body: `Keep indices on a stack so that their values are **decreasing**. When the current value is larger, it is the "next greater" for everything we pop.

\`\`\`cpp
// For each i, index of the next strictly greater element to the right, else -1
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> res(n, -1);
    stack<int> st;                    // indices, values decreasing bottom->top
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            res[st.top()] = i;        // a[i] is the next greater for st.top()
            st.pop();
        }
        st.push(i);
    }
    return res;
}
\`\`\`

Variations are just sign/direction flips:

- **Next smaller**: pop while \`a[st.top()] > a[i]\`.
- **Previous greater/smaller**: iterate \`i\` from right to left, or read what remains on the stack.
- **Circular array** (LC 503): iterate \`2n\` times using \`i % n\`.
- **Daily Temperatures** (LC 739): store \`res[i] = i - st.top()\` instead of the index.`,
    },
    {
      id: "histogram",
      title: "Technique: largest rectangle in a histogram",
      body: `For each bar, the widest rectangle of that height extends from the previous-smaller bar to the next-smaller bar. A single increasing stack computes both boundaries.

\`\`\`cpp
// Largest rectangle in histogram (LC 84); sentinel 0 flushes the stack
int largestRectangleArea(vector<int> h) {
    h.push_back(0);                   // sentinel forces all bars to pop
    stack<int> st;                    // indices with increasing heights
    int best = 0;
    for (int i = 0; i < (int)h.size(); i++) {
        while (!st.empty() && h[st.top()] >= h[i]) {
            int height = h[st.top()]; st.pop();
            int left = st.empty() ? -1 : st.top();
            best = max(best, height * (i - left - 1)); // width between boundaries
        }
        st.push(i);
    }
    return best;
}
\`\`\`

**Maximal rectangle** in a 0/1 matrix (LC 85) reduces to running this per row over column-wise height histograms.`,
    },
    {
      id: "contribution",
      title: "Technique: contribution / subarray domination",
      body: `Many "sum over all subarrays of (min/max)" problems are solved by asking, for each element, *in how many subarrays is it the minimum (or maximum)?* A monotonic stack finds the boundaries where it stops being the extreme.

\`\`\`cpp
// Sum of minimums of all subarrays (LC 907), mod 1e9+7
int sumSubarrayMins(vector<int>& a) {
    const long long MOD = 1e9 + 7;
    int n = a.size();
    vector<long long> left(n), right(n);   // span where a[i] is the min
    stack<int> st;
    for (int i = 0; i < n; i++) {          // strictly-smaller to the left
        while (!st.empty() && a[st.top()] >= a[i]) st.pop();
        left[i] = st.empty() ? i + 1 : i - st.top();
        st.push(i);
    }
    while (!st.empty()) st.pop();
    for (int i = n - 1; i >= 0; i--) {     // smaller-or-equal to the right
        while (!st.empty() && a[st.top()] > a[i]) st.pop();
        right[i] = st.empty() ? n - i : st.top() - i;
        st.push(i);
    }
    long long ans = 0;
    for (int i = 0; i < n; i++) ans = (ans + a[i] * left[i] % MOD * right[i]) % MOD;
    return ans;
}
\`\`\`

The asymmetric strict/non-strict comparison (\`>=\` on one side, \`>\` on the other) avoids double counting equal values.`,
    },
    {
      id: "lexicographic",
      title: "Technique: greedy + monotonic stack for lexicographic results",
      body: `When you must delete characters/digits to make the result as small (or large) as possible while keeping order, greedily pop larger trailing elements as long as you still have deletions or future elements to spare.

\`\`\`cpp
// Remove k digits to form the smallest number (LC 402)
string removeKdigits(string num, int k) {
    string st;                        // acts as a monotonic (non-decreasing) stack
    for (char c : num) {
        while (k > 0 && !st.empty() && st.back() > c) { st.pop_back(); k--; }
        st.push_back(c);
    }
    st.resize(st.size() - k);         // still have deletions left -> drop from tail
    int i = 0; while (i < (int)st.size() - 1 && st[i] == '0') i++; // strip leading 0s
    string res = st.substr(i);
    return res.empty() ? "0" : res;
}
\`\`\`

The same idea powers "Remove Duplicate Letters" (LC 316) and "Create Maximum Number" (LC 321).`,
    },
    {
      id: "advanced",
      title: "Advanced techniques (hard problems)",
      body: `**Monotonic stack as a greedy tree builder (LC 1130).** Minimum Cost Tree From Leaf Values pairs each leaf with the smaller of its neighbours; a decreasing stack pops a local minimum the moment a larger value arrives, charging it against its cheaper neighbour.

\`\`\`cpp
// Minimum Cost Tree From Leaf Values (LC 1130)
int mctFromLeafValues(vector<int>& a) {
    int res = 0;
    vector<int> st = {INT_MAX};                 // sentinel
    for (int x : a) {
        while (st.back() <= x) {                // x is a larger neighbour for st.back()
            int mid = st.back(); st.pop_back();
            res += mid * min(st.back(), x);     // merge cost with the cheaper side
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
    int n = a.size(); stack<int> st;
    for (int i = 0; i < n; i++) if (st.empty() || a[st.top()] > a[i]) st.push(i);
    int res = 0;
    for (int j = n - 1; j >= 0; j--)
        while (!st.empty() && a[st.top()] <= a[j]) { res = max(res, j - st.top()); st.pop(); }
    return res;
}
\`\`\`

**More hard patterns.** Sum of Subarray Ranges (LC 2104) = (sum of subarray maxima) − (sum of subarray minima), each via contribution counting. Trapping Rain Water (LC 42) and Maximal Rectangle (LC 85) are stack classics. Steps to Make Array Non-decreasing (LC 2289) and Max Chunks To Make Sorted (LC 768/769) combine a monotonic stack with per-element state. A monotonic stack also builds a **Cartesian tree** in \`O(n)\`, the bridge to range-minimum and treap-style problems.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Pattern | Time | Space |
| --- | --- | --- |
| Next/previous greater-smaller | \`O(n)\` | \`O(n)\` |
| Histogram / maximal rectangle | \`O(n)\` / \`O(rows * cols)\` | \`O(n)\` |
| Subarray contribution sums | \`O(n)\` | \`O(n)\` |
| Lexicographic greedy removal | \`O(n)\` | \`O(n)\` |

The \`O(n)\` bound holds because each index is pushed once and popped once.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| Problem | Technique |
| --- | --- |
| 496 / 503 Next Greater Element I/II | next greater (circular) |
| 739 Daily Temperatures | next greater (distance) |
| 84 Largest Rectangle in Histogram | histogram spans |
| 85 Maximal Rectangle | per-row histogram |
| 907 Sum of Subarray Minimums | contribution counting |
| 2104 Sum of Subarray Ranges | min + max contributions |
| 402 Remove K Digits | greedy monotonic removal |
| 316 Remove Duplicate Letters | greedy + seen set |
| 901 Online Stock Span | running span |
| 42 Trapping Rain Water | decreasing stack (or two pointers) |

**Harder & newer problems**

| Problem | Technique |
| --- | --- |
| 2454 Next Greater Element IV | two monotonic stacks |
| 2334 Subarray With Elements Greater Than Varying Threshold | monotonic stack |
| 2487 Remove Nodes From Linked List | monotonic stack |
| 2818 Apply Operations to Maximize Score | monotonic stack + math |
| 1130 Minimum Cost Tree From Leaf Values | greedy monotonic stack |
| 962 Maximum Width Ramp | stack + reverse scan |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Strict vs. non-strict**: choosing \`<\` vs. \`<=\` decides how equal values are handled; for contribution sums use one strict and one non-strict side to avoid double counting.
- **Store indices, not values**, so you can compute widths/distances.
- **Sentinels**: appending a \`0\` (histogram) or \`±INF\` cleanly flushes the stack at the end.
- **Direction**: "next" → iterate left-to-right popping; "previous" → iterate right-to-left, or read the stack top after pushing.
- **Don't forget leftovers**: elements still on the stack have no next greater/smaller (default \`-1\` or full span).`,
    },
  ],
};
