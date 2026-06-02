import type { HandbookTopic } from "../model";

export const bitManipulation: HandbookTopic = {
  slug: "bit-manipulation",
  title: "Bit Manipulation",
  tagline:
    "Think in bits — masks, XOR tricks, lowest-set-bit, popcount, and subset enumeration.",
  icon: "Binary",
  group: "Strings & Math",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `Bit manipulation treats an integer as an array of bits, enabling \`O(1)\` set operations, compact state for small sets, and elegant XOR-based tricks. It is fast and memory-light, and it underpins bitmask DP (see [Dynamic Programming](/handbook/dynamic-programming)).

Signals:

- "every element appears twice except one" / "find the missing number" → XOR.
- "subsets of a set with \`n <= 20\`" → represent subsets as bitmasks.
- "is it a power of two", "count set bits", "swap without temp" → bit tricks.
- Flags/permissions packed into a single integer.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Binary representation and two's complement for negatives.
- Operator precedence (bitwise operators are *lower* than comparison — parenthesize!).

Related: [Math](/handbook/math), [Dynamic Programming](/handbook/dynamic-programming) (bitmask DP), [Strings](/handbook/strings) (bitwise Trie for max XOR).`,
    },
    {
      id: "basics",
      title: "The operators",
      body: `| Op | Meaning | Example |
| --- | --- | --- |
| \`&\` | AND | mask / test bits |
| \`\\|\` | OR | set bits |
| \`^\` | XOR | toggle / cancel pairs |
| \`~\` | NOT | flip all bits |
| \`<<\` / \`>>\` | shift left/right | multiply/divide by 2^k |

\`\`\`cpp
// Test, set, clear, toggle the i-th bit of x
bool bit = (x >> i) & 1;  // read bit i
x |= (1 << i);            // set bit i to 1
x &= ~(1 << i);           // clear bit i to 0
x ^= (1 << i);            // toggle bit i
\`\`\`

Use \`1u << i\` or \`1LL << i\` when \`i >= 31\` to avoid signed overflow / UB.`,
    },
    {
      id: "tricks",
      title: "Essential tricks",
      body: `\`\`\`cpp
// Lowest set bit and clearing it
int low = x & (-x);  // isolates the lowest set bit (also Fenwick's i&-i)
x &= (x - 1);        // clears the lowest set bit (Brian Kernighan)
\`\`\`

\`\`\`cpp
// Power-of-two check and counting set bits
bool isPow2 = x > 0 && (x & (x - 1)) == 0;
int bits = __builtin_popcount(x);  // popcountll for long long
\`\`\`

\`\`\`cpp
// Other handy builtins (GCC/Clang)
int leadingZeros = __builtin_clz(x);     // x != 0
int trailingZeros = __builtin_ctz(x);    // x != 0; index of lowest set bit
int highestBit = 31 - __builtin_clz(x);  // floor(log2(x))
\`\`\`

Counting set bits for all numbers \`0..n\` in \`O(n)\` (LC 338): \`dp[i] = dp[i >> 1] + (i & 1)\`.`,
    },
    {
      id: "xor",
      title: "XOR tricks",
      body: `XOR cancels pairs (\`a ^ a = 0\`, \`a ^ 0 = a\`, commutative/associative), which solves a surprising number of problems.

\`\`\`cpp
// Single Number (LC 136): everything cancels except the unique element
int singleNumber(vector<int>& a) {
  int x = 0;
  for (int v : a) {
    x ^= v;
  }
  return x;
}
\`\`\`

\`\`\`cpp
// Missing Number (LC 268): XOR indices and values
int missingNumber(vector<int>& a) {
  int x = a.size();
  for (int i = 0; i < (int)a.size(); i++) {
    x ^= i ^ a[i];
  }
  return x;
}
\`\`\`

Single Number II (LC 137, every element thrice but one) uses bit-count mod 3 per position; Single Number III (LC 260, two uniques) splits by a differing bit. XOR also gives the swap-without-temp trick and prefix-XOR for subarray-XOR queries (LC 1310).`,
    },
    {
      id: "subsets",
      title: "Subset & mask enumeration",
      body: `With \`n\` items, iterate every subset as an integer \`0 .. 2^n - 1\`.

\`\`\`cpp
// Enumerate all subsets of an n-element set (LC 78 Subsets)
vector<vector<int>> subsets(vector<int>& a) {
  int n = a.size();
  vector<vector<int>> res;
  for (int mask = 0; mask < (1 << n); mask++) {
    vector<int> cur;
    for (int i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        cur.push_back(a[i]);
      }
    }
    res.push_back(cur);
  }
  return res;
}
\`\`\`

To enumerate **submasks** of a mask (used in bitmask DP partition problems) in \`O(3^n)\` total:

\`\`\`cpp
// Iterate every non-empty submask of 'mask'
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
  // 'sub' ranges over all submasks of mask
}
\`\`\``,
    },
    {
      id: "xor-basis",
      title: "Linear (XOR) basis",
      body: `A linear basis over GF(2) keeps an independent set of values so any XOR-subset result is reproducible. It answers "maximum XOR of any subset", "is x representable", and "size of the span" in \`O(BITS)\` per insert.

\`\`\`cpp
// XOR / linear basis: maximum-XOR subset and membership
struct XorBasis {
  static const int B = 60;
  long long basis[B + 1] = {0};
  void insert(long long x) {
    for (int b = B; b >= 0; b--) {
      if (!((x >> b) & 1)) {
        continue;
      }
      if (!basis[b]) {
        basis[b] = x;
        return;  // new independent vector
      }
      x ^= basis[b];  // reduce and continue
    }
  }
  long long maxXor() {
    long long res = 0;
    for (int b = B; b >= 0; b--) {
      res = max(res, res ^ basis[b]);
    }
    return res;
  }
};
\`\`\`

This is the tool behind Maximum XOR With an Element From Array (LC 1707, also a bitwise Trie) and subset-XOR span problems.`,
    },
    {
      id: "subset-enumeration-advanced",
      title: "Gosper's hack, SOS & meet in the middle",
      body: `**Gosper's hack** enumerates every \`k\`-bit subset of an \`n\`-bit set in increasing order — useful for "choose exactly k" bitmask DP.

\`\`\`cpp
// Iterate all k-subsets of an n-element set
int sub = (1 << k) - 1;
while (sub < (1 << n)) {
  // use 'sub' here (exactly k bits set)
  int c = sub & -sub, r = sub + c;
  sub = (((r ^ sub) >> 2) / c) | r;
}
\`\`\`

**Sum over Subsets (SOS) DP** aggregates over all submasks in \`O(n·2^n)\` (see the DP chapter) — it solves Count Triplets That Can Form Two Arrays of Equal XOR-style and Number of Triplets with bitwise-AND zero (LC 982).

**Meet in the middle.** When \`n ≤ ~40\`, split the set in half, enumerate the \`2^{n/2}\` subset values of each half, then combine by sorting + two pointers or hashing. Closest Subsequence Sum (LC 1755) and Partition to minimize difference (LC 2035) use this to beat \`2^n\`.

**Bitset acceleration.** A \`std::bitset\` packs 64 booleans per word, cutting reachability/subset-sum DP by a constant factor of ~64 (e.g. boolean knapsack feasibility for large capacities).`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation | Time |
| --- | --- |
| Single bit test/set/clear | \`O(1)\` |
| popcount / clz / ctz | \`O(1)\` (hardware) |
| XOR sweep | \`O(n)\` |
| Enumerate all subsets | \`O(2^n · n)\` |
| Enumerate all submasks of all masks | \`O(3^n)\` |`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 136 / 137 / 260 | [Single Number I/II/III](https://leetcode.cn/problems/single-number) | XOR / bit-count |
| 268 | [Missing Number](https://leetcode.cn/problems/missing-number) | XOR |
| 191 | [Number of 1 Bits](https://leetcode.cn/problems/number-of-1-bits) | popcount |
| 338 | [Counting Bits](https://leetcode.cn/problems/counting-bits) | bit DP |
| 231 | [Power of Two](https://leetcode.cn/problems/power-of-two) | \`x & (x-1)\` |
| 78 | [Subsets](https://leetcode.cn/problems/subsets) | mask enumeration |
| 1310 | [XOR Queries of a Subarray](https://leetcode.cn/problems/xor-queries-of-a-subarray) | prefix XOR |
| 421 | [Maximum XOR of Two Numbers](https://leetcode.cn/problems/maximum-xor-of-two-numbers-in-an-array) | bitwise Trie |
| 201 | [Bitwise AND of Range](https://leetcode.cn/problems/bitwise-and-of-numbers-range) | common prefix |
| 190 | [Reverse Bits](https://leetcode.cn/problems/reverse-bits) | bit-by-bit |

**Advanced practice problems**

| ID | Problem | Technique |
| --- | --- | --- |
| 2588 | [Count the Number of Beautiful Subarrays](https://leetcode.cn/problems/count-the-number-of-beautiful-subarrays) | prefix XOR |
| 2429 | [Minimize XOR](https://leetcode.cn/problems/minimize-xor) | greedy bits |
| 2680 | [Maximum OR](https://leetcode.cn/problems/maximum-or) | prefix / suffix OR |
| 2411 | [Smallest Subarrays With Maximum Bitwise OR](https://leetcode.cn/problems/smallest-subarrays-with-maximum-bitwise-or) | bit-position tracking |
| 982 | [Triples with Bitwise AND Equal To Zero](https://leetcode.cn/problems/triples-with-bitwise-and-equal-to-zero) | SOS DP |
| 1707 | [Maximum XOR With an Element From Array](https://leetcode.cn/problems/maximum-xor-with-an-element-from-array) | bitwise Trie |
| 1755 | [Closest Subsequence Sum](https://leetcode.cn/problems/closest-subsequence-sum) | meet in the middle |

**Recent medium problems (rating ≥ 1800)**

| ID | Problem | Rating | Technique |
| --- | --- | --- | --- |
| 2857 | [Count Pairs of Points With Distance K](https://leetcode.cn/problems/count-pairs-of-points-with-distance-k) | 2082 | XOR + hashing |
| 2741 | [Special Permutations](https://leetcode.cn/problems/special-permutations) | 2021 | bitmask DP |
| 2564 | [Substring XOR Queries](https://leetcode.cn/problems/substring-xor-queries) | 1959 | prefix XOR / bits |
| 3133 | [Minimum Array End](https://leetcode.cn/problems/minimum-array-end) | 1935 | bit construction |
| 3514 | [Number of Unique XOR Triplets II](https://leetcode.cn/problems/number-of-unique-xor-triplets-ii) | 1884 | XOR enumeration |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Precedence**: \`x & 1 == 0\` parses as \`x & (1 == 0)\`. Always parenthesize: \`(x & 1) == 0\`.
- **Shift overflow**: \`1 << 31\` overflows \`int\`; use \`1u\`/\`1LL\`. Shifting by ≥ width is UB.
- **Negative numbers**: \`>>\` on signed ints is implementation-defined sign extension; prefer \`unsigned\` for bit twiddling.
- **\`__builtin_clz(0)\` / \`ctz(0)\` are undefined** — guard against zero.
- **Mask off-by-one**: \`(1 << n)\` is the count of subsets; the largest mask is \`(1 << n) - 1\`.`,
    },
  ],
};
