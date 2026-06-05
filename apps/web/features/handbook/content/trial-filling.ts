import type { HandbookTopic } from "../model";

export const trialFilling: HandbookTopic = {
  slug: "trial-filling",
  title: "Trial Filling",
  tagline:
    "Build the answer one bit, digit, or character at a time — greedily try the smallest/largest feasible value and check that a valid completion still exists.",
  icon: "PencilRuler",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `**Trial filling** (试填法) constructs an optimal answer **position by position**, starting from the most significant end. At each position you *try* a candidate value — the smallest character for a lexicographically minimal answer, or the highest bit for a maximal number — and then run a cheap **feasibility check**: *can the remaining positions still be completed into a valid answer?* If yes, commit and move on; if no, back off to the next candidate. Because the most significant position dominates the objective, a greedy "best feasible choice first" is provably optimal, and an exponential search space (\`2^B\` numbers, \`26^n\` strings) collapses to polynomial.

Signals:

- "construct the **lexicographically smallest / largest** string or array satisfying …"
- "**maximize / minimize** a number or XOR under constraints" — decide it **bit by bit**
- "find the **k-th** element in some order" — descend the implicit trie one digit at a time
- the objective is dominated by the leftmost / highest position, and a feasibility test for "can I finish?" is easy

The shape is always: *for each position, in significance order, pick the most desirable value whose feasibility check passes, then fix it and recurse on the rest.*`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Greedy reasoning and the idea that the most significant position dominates the rest.
- Bit operations for the bitwise variant (see [Bit Manipulation](/handbook/bit-manipulation)).
- A feasibility / counting subroutine — sometimes a formula, sometimes a [DP](/handbook/dynamic-programming) or [Binary Search](/handbook/binary-search).

Related: [Strings](/handbook/strings), [Backtracking](/handbook/backtracking) (trial filling is greedy backtracking with a feasibility oracle instead of exhaustive retries), [Math](/handbook/math).`,
    },
    {
      id: "bitwise",
      title: "Filling bits from high to low",
      body: `Because a higher bit outweighs all lower bits combined, decide bits from the most significant down. To **maximize** a value, greedily try to set each bit and keep it only if the target is still reachable.

\`\`\`cpp
// Maximum XOR of two numbers, built bit by bit (LC 421)
int findMaximumXOR(vector<int>& a) {
  int best = 0, mask = 0;
  for (int b = 30; b >= 0; b--) {
    mask |= (1 << b);                 // only consider the top bits so far
    unordered_set<int> prefixes;
    for (int x : a) prefixes.insert(x & mask);
    int candidate = best | (1 << b);  // TRY to make this bit a 1
    for (int p : prefixes) {
      if (prefixes.count(candidate ^ p)) {  // some pair achieves this prefix
        best = candidate;             // feasible -> commit the bit
        break;
      }
    }
  }
  return best;
}
\`\`\`

The same high-to-low discipline drives Minimize XOR (LC 2429) — place the required set bits on the highest positions of \`x\` to match \`num1\` — and Minimum Array End (LC 3133), which fills the free (zero) bits of the running value to keep it minimal.`,
    },
    {
      id: "lexicographic",
      title: "Filling characters left to right",
      body: `To produce the **lexicographically smallest** string, walk left to right and, at each position, place the **smallest** character such that the remaining positions can still be completed. The feasibility check is what separates trial filling from a naive greedy that paints itself into a corner.

\`\`\`cpp
// Smallest string of length n with numeric value k (LC 1663)
string getSmallestString(int n, int k) {
  string s;
  for (int i = 0; i < n; i++) {
    int rest = n - i - 1;  // positions after this one
    for (int c = 1; c <= 26; c++) {
      int remain = k - c;  // value left for the rest
      // feasible iff 'rest' chars in [1,26] can sum to 'remain'
      if (remain >= rest * 1 && remain <= rest * 26) {
        s += char('a' + c - 1);  // smallest feasible char -> commit
        k = remain;
        break;
      }
    }
  }
  return s;
}
\`\`\`

The explicit \`rest * 1 <= remain <= rest * 26\` bound is the "can I finish?" oracle. Construct Smallest Number From DI String (LC 2375) and Numbers With Same Consecutive Differences (LC 967) use the same place-then-verify loop over digits.`,
    },
    {
      id: "kth-order",
      title: "Filling to find the k-th element",
      body: `When the answer is "the **k-th** value in lexicographic (or some structured) order", trial-fill the answer as a path down an **implicit trie**: at each node, *count* how many leaves live under each child; if a whole subtree has \`\\le k\` leaves, skip it (move to the next sibling), otherwise descend into it (fix that digit) and recurse.

\`\`\`cpp
// K-th smallest in lexicographical order (LC 440): descend the 10-ary trie
int findKthNumber(int n, int k) {
  long long cur = 1;
  k--;  // cur = 1 is the 1st number
  auto countUnder = [&](long long prefix) {  // # numbers with this prefix, <= n
    long long steps = 0, lo = prefix, hi = prefix;
    while (lo <= n) {
      steps += min((long long)n, hi) - lo + 1;
      lo *= 10;
      hi = hi * 10 + 9;
    }
    return steps;
  };
  while (k > 0) {
    long long cnt = countUnder(cur);
    if (cnt <= k) {       // whole subtree is too early -> skip to next sibling
      k -= cnt;
      cur++;
    } else {              // answer is inside -> descend (fill next digit)
      cur *= 10;
      k--;
    }
  }
  return (int)cur;
}
\`\`\`

"Skip the subtree or descend into it" is trial filling with a *counting* feasibility test, the same engine behind digit-by-digit ranking problems.`,
    },
    {
      id: "feasibility",
      title: "When the feasibility check is a DP or binary search",
      body: `The oracle "can I complete the rest?" is sometimes a closed-form bound (as in LC 1663), but often it is itself a subproblem:

- **Counting / Digit DP.** Numbers At Most N Given Digit Set (LC 902) and Count Special Integers (LC 2376) fix each digit left to right while counting how many completions stay \`\\le N\` — trial filling where the check is a [digit DP](/handbook/dynamic-programming). Non-negative Integers without Consecutive Ones (LC 600) fills bits high-to-low with a "no two adjacent ones" count.
- **Binary search on the value.** Maximum Number That Sum of the Prices Is ≤ K (LC 3007) binary-searches the answer, and the feasibility predicate counts set bits across a range — a counting check wrapped around the search.

The pattern is robust: *the construction loop stays the same; only the "can I finish?" subroutine grows in sophistication.*`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Variant | Time | Notes |
| --- | --- | --- |
| Bitwise high-to-low | \`O(B \\cdot \\text{check})\` | \`B\` bits; check often \`O(n)\` |
| Lexicographic string | \`O(n \\cdot \\Sigma \\cdot \\text{check})\` | \`\\Sigma\` = alphabet size |
| K-th via trie descent | \`O(\\log_b N \\cdot \\log_b N)\` | each step counts a subtree |
| Check = digit DP | \`O(\\text{digits} \\cdot \\text{states})\` | per feasibility call |

Each position is decided once, so the cost is (number of positions) × (cost of one feasibility test) — never the exponential size of the answer space.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Fill order |
| --- | --- | --- |
| 421 | [Maximum XOR of Two Numbers](https://leetcode.cn/problems/maximum-xor-of-two-numbers-in-an-array) | bits, high → low |
| 440 | [K-th Smallest in Lexicographical Order](https://leetcode.cn/problems/k-th-smallest-in-lexicographical-order) | trie descent |
| 967 | [Numbers With Same Consecutive Differences](https://leetcode.cn/problems/numbers-with-same-consecutive-differences) | digits, left → right |
| 1663 | [Smallest String With a Given Numeric Value](https://leetcode.cn/problems/smallest-string-with-a-given-numeric-value) | chars, left → right |
| 1980 | [Find Unique Binary String](https://leetcode.cn/problems/find-unique-binary-string) | bit per position |
| 2375 | [Construct Smallest Number From DI String](https://leetcode.cn/problems/construct-smallest-number-from-di-string) | digits, left → right |
| 2429 | [Minimize XOR](https://leetcode.cn/problems/minimize-xor) | bits, high → low |

**Advanced practice problems**

| ID | Problem | Feasibility check |
| --- | --- | --- |
| 600 | [Non-negative Integers without Consecutive Ones](https://leetcode.cn/problems/non-negative-integers-without-consecutive-ones) | digit DP over bits |
| 902 | [Numbers At Most N Given Digit Set](https://leetcode.cn/problems/numbers-at-most-n-given-digit-set) | digit DP count |
| 2376 | [Count Special Integers](https://leetcode.cn/problems/count-special-integers) | digit DP with mask |
| 2935 | [Maximum Strong Pair XOR II](https://leetcode.cn/problems/maximum-strong-pair-xor-ii) | bit trie + window |
| 3007 | [Maximum Number with Price Sum ≤ K](https://leetcode.cn/problems/maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k) | binary search + bit count |
| 3133 | [Minimum Array End](https://leetcode.cn/problems/minimum-array-end) | fill free bits |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **No feasibility check = wrong greedy.** Picking the locally smallest value without verifying a completion exists is the classic failure; the check is the whole technique.
- **Significance order matters.** Fill from the *dominant* end — high bit / leftmost char first. Filling least-significant-first breaks the greedy guarantee.
- **Off-by-one in k.** When descending a trie for the k-th element, decide whether the current prefix itself counts as a visited node (the \`k--\` on descent), or you will land one position off.
- **Overflow in counting.** Subtree counts (e.g. LC 440's \`hi = hi*10 + 9\`) overflow 32-bit — use \`long long\` and clamp to \`n\`.
- **Smallest vs largest.** For a maximal answer, try the *largest* candidate first (set the bit, then verify); the loop is mirror-image of the minimal case.`,
    },
  ],
};
