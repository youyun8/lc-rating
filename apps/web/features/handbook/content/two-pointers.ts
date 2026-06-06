import type { HandbookTopic } from "../model";

export const twoPointers: HandbookTopic = {
  slug: "two-pointers",
  title: "Two Pointers",
  tagline:
    "Walk two indices through a sequence — toward each other, in lockstep, or at different speeds — to turn an O(n^2) scan into a single linear pass.",
  icon: "ArrowLeftRight",
  group: "Foundations",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `The **two pointers** technique keeps two indices into the same (usually sorted or otherwise structured) sequence and advances them according to a rule, so that every element is visited a constant number of times. Instead of checking all $O(n^2)$ pairs, you exploit **monotonicity**: when you know that moving one pointer can only make a quantity grow and moving the other can only make it shrink, you can always decide which pointer to move next and never need to revisit a pair.

Three shapes cover almost everything:

- **Opposite ends.** \`l\` starts at the front, \`r\` at the back; they converge. Great for sorted arrays and palindromes.
- **Same direction.** A *slow* write pointer trails a *fast* read pointer through one pass — in-place filtering and dedup.
- **Different speeds.** One pointer moves twice as fast as the other to detect cycles or find the middle.

Signals:

- the array (or string) is **sorted**, or sorting it does not lose information you need
- you are looking for a **pair / triple** that meets a sum or difference target
- "**remove / move / partition in place** with \`O(1)\` extra space"
- "**palindrome**", "reverse", or "merge two sorted sequences"
- a quantity is **monotonic** as a pointer moves (wider container, larger sum, longer run)

If the window has a variable size and you add/remove from both ends to maintain a constraint, you have crossed into the [Sliding Window](/handbook/sliding-window) variant of the same idea.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort with array/string indexing and the half-open vs. closed interval distinction.
- Knowing when [Sorting](/handbook/sorting) is allowed (it reorders elements — fine for "does a pair exist?", not for "return original indices").
- The monotonicity argument: why moving the chosen pointer never skips a valid answer.

Related: [Sliding Window](/handbook/sliding-window) (a same-direction pair maintaining an invariant), [Sorting](/handbook/sorting) (the usual preprocessing step for pair/triple search), [Linked List](/handbook/linked-list) (fast & slow pointers for cycles and middles), [Binary Search](/handbook/binary-search) (an alternative for the sorted two-sum).`,
    },
    {
      id: "opposite-ends",
      title: "Opposite-ends pointers (converging)",
      body: `Place \`l\` at the front and \`r\` at the back of a **sorted** array and move whichever pointer improves the situation. For a target sum, if \`a[l] + a[r]\` is too small the only way to grow it is to raise the left value, so \`l++\`; if too big, \`r--\`. Each step discards a row or column of the implicit pair matrix, giving \`O(n)\` after the sort.

:::example Two Sum II — sorted input (LC 167)
Because the array is sorted, the sum is monotonic in each pointer, so one linear sweep finds the unique pair.

\`\`\`cpp
// Two Sum II on a sorted array (LC 167), 1-indexed answer
vector<int> twoSum(vector<int>& a, int target) {
  int l = 0, r = (int)a.size() - 1;
  while (l < r) {
    int sum = a[l] + a[r];
    if (sum == target) return {l + 1, r + 1};
    if (sum < target) {
      l++;  // need a bigger value
    } else {
      r--;  // need a smaller value
    }
  }
  return {};
}
\`\`\`
:::

:::example Container With Most Water (LC 11)
The area is \`min(h[l], h[r]) * (r - l)\`. Moving the **taller** wall inward can never beat the current area (width shrinks, height is still capped by the shorter wall), so always move the shorter wall — that is the only move that might find something better.

\`\`\`cpp
// Container with most water (LC 11)
int maxArea(vector<int>& h) {
  int l = 0, r = (int)h.size() - 1, best = 0;
  while (l < r) {
    int area = min(h[l], h[r]) * (r - l);
    best = max(best, area);
    if (h[l] < h[r]) l++;    // move the shorter wall; the taller can't help
    else r--;
  }
  return best;
}
\`\`\`
:::

:::example Valid Palindrome (LC 125)
Compare characters from both ends inward, skipping non-alphanumerics. A mismatch anywhere proves it is not a palindrome.

\`\`\`cpp
// Valid palindrome, ignoring case and non-alphanumerics (LC 125)
bool isPalindrome(string s) {
  int l = 0, r = (int)s.size() - 1;
  while (l < r) {
    while (l < r && !isalnum((unsigned char)s[l])) l++;
    while (l < r && !isalnum((unsigned char)s[r])) r--;
    if (tolower((unsigned char)s[l]) != tolower((unsigned char)s[r])) return false;
    l++;
    r--;
  }
  return true;
}
\`\`\`
:::

The same converging sweep reverses an array or string in place and validates Valid Palindrome II (LC 680) with one allowed deletion.`,
    },
    {
      id: "same-direction",
      title: "Same-direction slow/fast write pointer",
      body: `When you must rewrite an array **in place**, let a *fast* pointer scan every element and a *slow* pointer mark where the next kept element goes. Everything before \`slow\` is the finished, compacted prefix; the gap between them is scratch space. This is the read/write split behind almost every "do it with \`O(1)\` extra space" array problem.

:::example Remove Duplicates from Sorted Array (LC 26)
Keep an element only when it differs from the last one written. \`slow\` ends as the new length.

\`\`\`cpp
// Remove duplicates from a sorted array in place (LC 26)
int removeDuplicates(vector<int>& a) {
  if (a.empty()) return 0;
  int slow = 0;                       // last unique position written
  for (int fast = 1; fast < (int)a.size(); fast++) {
    if (a[fast] != a[slow]) {
      a[++slow] = a[fast];            // write the next distinct value
    }
  }
  return slow + 1;
}
\`\`\`
:::

:::example Move Zeroes (LC 283)
\`slow\` points at the next slot for a non-zero value; after copying the non-zeroes forward, fill the tail with zeros (or swap as you go to keep it stable in one pass).

\`\`\`cpp
// Move all zeroes to the end, keeping order (LC 283)
void moveZeroes(vector<int>& a) {
  int slow = 0;
  for (int fast = 0; fast < (int)a.size(); fast++) {
    if (a[fast] != 0) {
      swap(a[slow], a[fast]);         // bring the non-zero to the front block
      slow++;
    }
  }
}
\`\`\`
:::

The identical skeleton powers Remove Element (LC 27) and Remove Duplicates II (LC 80, allow up to two of each by comparing against \`a[slow - 1]\`).`,
    },
    {
      id: "three-pointers",
      title: "Three pointers: fixed anchor and partitioning",
      body: `Two natural extensions need a third index. The first **fixes one element** and runs an opposite-ends sweep on the rest; the second sweeps a single pointer while two boundaries partition the array into regions.

:::example 3Sum (LC 15)
Sort, fix \`a[i]\` as the smallest of the triple, then two-pointer the remaining suffix for a pair summing to \`-a[i]\`. Skip equal neighbours at every level to avoid duplicate triples.

\`\`\`cpp
// 3Sum: all unique triples summing to zero (LC 15)
vector<vector<int>> threeSum(vector<int>& a) {
  sort(a.begin(), a.end());
  vector<vector<int>> res;
  int n = a.size();
  for (int i = 0; i + 2 < n; i++) {
    if (i > 0 && a[i] == a[i - 1]) continue;   // dedup the anchor
    int l = i + 1, r = n - 1;
    while (l < r) {
      int sum = a[i] + a[l] + a[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        res.push_back({a[i], a[l], a[r]});
        while (l < r && a[l] == a[l + 1]) l++;  // dedup left
        while (l < r && a[r] == a[r - 1]) r--;  // dedup right
        l++;
        r--;
      }
    }
  }
  return res;
}
\`\`\`
:::

:::example Sort Colors — Dutch national flag (LC 75)
Three pointers carve the array into [0s | 1s | unscanned | 2s]. \`lo\` is the 0/1 boundary, \`hi\` the 1/2 boundary, and \`i\` scans. Crucially, after swapping a 2 to the back you do **not** advance \`i\`, because the value swapped in is still unexamined.

\`\`\`cpp
// Dutch national flag, sort an array of 0/1/2 in one pass (LC 75)
void sortColors(vector<int>& a) {
  int lo = 0, i = 0, hi = (int)a.size() - 1;
  while (i <= hi) {
    if (a[i] == 0) swap(a[lo++], a[i++]);
    else if (a[i] == 2) swap(a[i], a[hi--]);  // do NOT i++ here
    else i++;
  }
}
\`\`\`
:::

The fixed-anchor pattern scales to 3Sum Closest (LC 16) and, with one more nested loop, 4Sum (LC 18); the partition pattern is the heart of quickselect and Lomuto/Hoare partitioning.`,
    },
    {
      id: "fast-slow",
      title: "Fast & slow cycle pointers",
      body: `Advancing one pointer one step and another two steps per iteration (Floyd's tortoise and hare) detects a cycle in \`O(1)\` space and locates the midpoint of a list. It is most famous on linked lists, but the same trick finds the duplicate in an array viewed as a functional graph.

:::example Linked List Cycle II (LC 142)
If \`fast\` ever meets \`slow\`, a cycle exists. Resetting one pointer to the head and stepping both one at a time lands them on the cycle entrance — a tidy consequence of the meeting-point arithmetic.

\`\`\`cpp
// Find the node where the cycle begins (LC 142)
ListNode* detectCycle(ListNode* head) {
  ListNode* slow = head;
  ListNode* fast = head;
  while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) {                 // cycle confirmed
      ListNode* p = head;
      while (p != slow) {               // both move one step now
        p = p->next;
        slow = slow->next;
      }
      return p;                         // cycle entrance
    }
  }
  return nullptr;
}
\`\`\`
:::

The exact pointer mechanics — finding the middle, detecting and entering a cycle, removing the n-th node from the end with a gap of \`n\` between two pointers — live in [Linked List](/handbook/linked-list). Find the Duplicate Number (LC 287) maps an array to a linked list and reuses this engine verbatim.`,
    },
    {
      id: "merging",
      title: "Merging and partitioning two sequences",
      body: `When two pointers walk **two different sorted sequences**, comparing the fronts and emitting the smaller merges them in linear time — the merge step of merge sort. Filling from the back avoids overwriting unread data when the result must land in one of the inputs.

:::example Merge Sorted Array (LC 88)
\`nums1\` has room at the end for \`nums2\`. Merge **from the back** so you never clobber an element of \`nums1\` you have not copied yet.

\`\`\`cpp
// Merge nums2 into nums1 in place, filling from the back (LC 88)
void merge(vector<int>& a, int m, vector<int>& b, int n) {
  int i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && a[i] > b[j]) a[k--] = a[i--];
    else a[k--] = b[j--];               // b exhausted last, so drive on j
  }
}
\`\`\`
:::

The front-to-back version produces the merged list for Merge Two Sorted Lists (LC 21), computes the Intersection of Two Arrays II (LC 350) by advancing the pointer at the smaller value, and underlies Backspace String Compare (LC 844) when scanned from the right.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Opposite ends, sorted | sorted array, find a pair by sum | move \`l\`/\`r\` toward the target | [Two Sum II](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted) |
| Opposite ends, area/width | maximize over a width × height tradeoff | move the limiting (shorter) side | [Container With Most Water](https://leetcode.cn/problems/container-with-most-water) |
| Palindrome check | compare symmetric positions | converge, skip/allow per rules | [Valid Palindrome](https://leetcode.cn/problems/valid-palindrome) |
| Slow/fast write | filter or dedup in place, \`O(1)\` space | write at \`slow\`, scan with \`fast\` | [Remove Duplicates](https://leetcode.cn/problems/remove-duplicates-from-sorted-array) |
| Fixed anchor + sweep | triple/quad with a sum target | fix one, two-pointer the rest | [3Sum](https://leetcode.cn/problems/3sum) |
| Three-way partition | values fall into 3 buckets | \`lo\`/\`i\`/\`hi\` Dutch flag | [Sort Colors](https://leetcode.cn/problems/sort-colors) |
| Fast & slow cycle | cycle / middle / n-th from end | tortoise and hare | [Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii) |
| Merge two sorted | combine sorted inputs | compare fronts (or backs) | [Merge Sorted Array](https://leetcode.cn/problems/merge-sorted-array) |`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Variant | Time | Space |
| --- | --- | --- |
| Opposite ends (already sorted) | \`O(n)\` | \`O(1)\` |
| Opposite ends (must sort first) | \`O(n log n)\` | \`O(1)\`–\`O(n)\` for the sort |
| Slow/fast write (in place) | \`O(n)\` | \`O(1)\` |
| Fixed anchor + sweep (kSum) | \`O(n^{k - 1})\` | \`O(1)\` extra |
| Dutch national flag partition | \`O(n)\` | \`O(1)\` |
| Fast & slow cycle detection | \`O(n)\` | \`O(1)\` |
| Merge two sorted sequences | \`O(m + n)\` | \`O(1)\` in place |

The pointer logic itself is always linear; whenever you see \`O(n log n)\` it is the preprocessing sort, not the sweep, that dominates.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 11 | [Container With Most Water](https://leetcode.cn/problems/container-with-most-water) | opposite ends |
| 15 | [3Sum](https://leetcode.cn/problems/3sum) | fixed anchor + sweep |
| 16 | [3Sum Closest](https://leetcode.cn/problems/3sum-closest) | fixed anchor + sweep |
| 26 | [Remove Duplicates from Sorted Array](https://leetcode.cn/problems/remove-duplicates-from-sorted-array) | slow/fast write |
| 42 | [Trapping Rain Water](https://leetcode.cn/problems/trapping-rain-water) | opposite ends |
| 75 | [Sort Colors](https://leetcode.cn/problems/sort-colors) | three-way partition |
| 88 | [Merge Sorted Array](https://leetcode.cn/problems/merge-sorted-array) | merge from back |
| 125 | [Valid Palindrome](https://leetcode.cn/problems/valid-palindrome) | opposite ends |
| 142 | [Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii) | fast & slow |
| 167 | [Two Sum II](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted) | opposite ends |
| 283 | [Move Zeroes](https://leetcode.cn/problems/move-zeroes) | slow/fast write |
| 287 | [Find the Duplicate Number](https://leetcode.cn/problems/find-the-duplicate-number) | fast & slow |
| 680 | [Valid Palindrome II](https://leetcode.cn/problems/valid-palindrome-ii) | opposite ends + skip |
| 844 | [Backspace String Compare](https://leetcode.cn/problems/backspace-string-compare) | reverse two pointers |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Sorting destroys original indices.** If the problem wants the indices into the *unsorted* array (the classic Two Sum, LC 1), two pointers on a sorted copy loses them — use a hash map instead.
- **Pick the right pointer to move.** The whole correctness rests on a monotonicity argument: in Container With Most Water you must move the *shorter* wall; moving the taller one can silently skip the optimum.
- **Do not advance after a back-swap.** In Dutch national flag, after swapping a 2 to the tail the incoming value is unexamined — re-check the same \`i\`. Advancing it is the #1 bug.
- **Merge from the back when the output overlaps an input** (LC 88); front-to-back overwrites data you still need to read.
- **Off-by-one at the boundary.** Decide up front whether the loop is \`l < r\` or \`l <= r\`; converging two-sum uses \`l < r\` so a single element is never paired with itself.
- **Deduplicate at every level** in kSum, and skip equal neighbours for both the anchor and the inner pointers, or you will emit repeated tuples.
- **Empty / single-element inputs.** Guard the slow/fast write and the fast & slow cycle loops (\`fast && fast->next\`) so they do not dereference past the end.`,
    },
  ],
};
