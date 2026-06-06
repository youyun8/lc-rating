import type { HandbookTopic } from "../model";

export const linkedList: HandbookTopic = {
  slug: "linked-list",
  title: "Linked List",
  tagline:
    "Pointer choreography over a chain of nodes — dummy heads, in-place reversal, and fast/slow pointers turn fiddly edge cases into clean O(1)-space code.",
  icon: "Link",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `A **linked list** stores elements in nodes scattered across memory, each holding a value plus a pointer to the next node (and, in a **doubly linked list**, the previous node too). Unlike an array, there is no random access — reaching index \`i\` costs \`O(i)\` — but splicing a node in or out is \`O(1)\` once you hold a pointer to it. Most interview problems use the **singly linked** \`ListNode\`:

\`\`\`cpp
// The canonical singly-linked node
struct ListNode {
  int val;
  ListNode* next;
};
\`\`\`

The whole genre is about **pointer manipulation**: you rarely allocate, and you almost never copy values around. Instead you re-thread \`next\` pointers, and the difficulty is entirely in not losing a reference or stepping off the end into \`nullptr\`.

Signals that you are looking at a linked-list problem:

- the input is already a chain of nodes (\`head\`) and you must reverse, merge, partition, or reorder it **in place**
- you need \`O(1)\` extra space, so you cannot dump the list into a \`vector\` and sort/index it
- the task is "find the middle", "detect a cycle", or "k-th from the end" — classic **fast & slow pointer** territory
- the structure must support \`O(1)\` insert/erase at a known position (an LRU cache is a hash map plus a doubly linked list)

When order does not matter or you need random access, an array is almost always simpler and faster; reach for a linked list when the problem hands you one or demands constant-space pointer surgery.`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort with pointers, \`nullptr\`, and the difference between a node and the pointer that names it.
- The **two-pointer** mindset — offset pointers and the fast/slow gap (see [Two Pointers](/handbook/two-pointers)).
- For merging many lists efficiently, a priority queue (see [Heap & Priority Queue](/handbook/heap-priority-queue)).

Related: [Data Structures](/handbook/data-structures) (linked lists power the LRU cache), [Trees & Binary Trees](/handbook/trees) (the same pointer discipline on two children).`,
    },
    {
      id: "dummy-head",
      title: "The dummy-head idiom",
      body: `Half of all linked-list bugs live at the **head**: when the node you want to delete or insert before is the first one, special-casing it scatters \`if (head == ...)\` branches everywhere. A **dummy (sentinel) head** — a throwaway node whose \`next\` points at the real head — erases that asymmetry. Every node now has a predecessor, so insert/delete is uniform and you return \`dummy.next\` at the end.

:::example Remove Linked List Elements (LC 203)
Without a dummy you would need a separate branch to drop leading matches; with one, a single loop handles head and interior nodes identically.

\`\`\`cpp
// Remove every node equal to val (LC 203) using a dummy head
ListNode* removeElements(ListNode* head, int val) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode* prev = &dummy;
  while (prev->next) {
    if (prev->next->val == val) {
      prev->next = prev->next->next;  // splice the node out, prev stays put
    } else {
      prev = prev->next;
    }
  }
  return dummy.next;  // the real head, possibly changed
}
\`\`\`
:::

The same sentinel cleans up **Merge Two Sorted Lists** (LC 21), **Partition List** (LC 86), and **Remove Duplicates from Sorted List II** (LC 82). Rule of thumb: if the head itself can change or be removed, start with a dummy.`,
    },
    {
      id: "reversal",
      title: "In-place reversal",
      body: `Reversing a singly linked list is the field's "hello world": walk the chain, and at each node flip its \`next\` to point backward, carrying a \`prev\` pointer behind you. The only trick is to **stash \`head->next\` before you overwrite it**, or you lose the rest of the list.

:::example Reverse Linked List (LC 206)
Three pointers — \`prev\`, the current \`head\`, and a saved \`nxt\` — march down the list once in \`O(n)\` time and \`O(1)\` space.

\`\`\`cpp
// Reverse a singly linked list (LC 206)
ListNode* reverseList(ListNode* head) {
  ListNode* prev = nullptr;
  while (head) {
    ListNode* nxt = head->next;  // save before we clobber it
    head->next = prev;           // flip the link
    prev = head;                 // advance prev and head
    head = nxt;
  }
  return prev;  // new head is the old tail
}
\`\`\`
:::

The harder cousin reverses the list in fixed-size blocks. **Reverse Nodes in k-Group** (LC 25) reverses each run of \`k\` nodes and leaves a trailing remainder of fewer than \`k\` untouched — count ahead to confirm a full group exists, reverse it, then stitch the reversed block back to the previous group's tail.

:::example Reverse Nodes in k-Group (LC 25)
A dummy head anchors the chain; \`groupPrev\` tracks the tail of the last finished group so each reversed block reconnects cleanly.

\`\`\`cpp
// Reverse the list in blocks of k, leftover tail stays as-is (LC 25)
ListNode* reverseKGroup(ListNode* head, int k) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode* groupPrev = &dummy;
  while (true) {
    ListNode* kth = groupPrev;  // walk k nodes ahead
    for (int i = 0; i < k && kth; ++i) {
      kth = kth->next;
    }
    if (!kth) {
      break;  // fewer than k left -> done
    }
    ListNode* groupNext = kth->next;  // first node of the next group
    ListNode* prev = groupNext;       // reverse [groupPrev->next .. kth]
    ListNode* cur = groupPrev->next;
    while (cur != groupNext) {
      ListNode* nxt = cur->next;
      cur->next = prev;
      prev = cur;
      cur = nxt;
    }
    ListNode* newGroupPrev = groupPrev->next;  // old head is now the tail
    groupPrev->next = kth;                     // wire prev group to new head
    groupPrev = newGroupPrev;
  }
  return dummy.next;
}
\`\`\`
:::

**Reverse Linked List II** (LC 92) reverses only the sub-list between positions \`(left, right)\` — the same engine bounded by two sentinels.`,
    },
    {
      id: "fast-slow",
      title: "Fast & slow pointers",
      body: `Move one pointer twice as fast as another and their *gap* encodes structure. The fast pointer reaches the end in half the steps, so when it stops the slow pointer sits at the **middle**; on a cyclic list the fast pointer eventually laps the slow one and they **meet inside the cycle**. This is Floyd's tortoise-and-hare, and it needs only \`O(1)\` space.

:::example Middle of the Linked List (LC 876)
When \`fast\` runs off the end, \`slow\` is at the midpoint. With this exact loop condition, an even-length list returns the **second** of the two middles.

\`\`\`cpp
// Find the middle node (LC 876): slow advances half as fast
ListNode* middleNode(ListNode* head) {
  ListNode *slow = head, *fast = head;
  while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
  }
  return slow;
}
\`\`\`
:::

:::example Linked List Cycle II (LC 142)
First detect a meeting point (LC 141); then reset one pointer to the head and advance both one step at a time — they re-meet exactly at the cycle's entrance. The reason: if the meeting point is distance \`m\` into the cycle and the cycle length is \`c\`, the head and meeting point are congruent modulo \`c\`, so they collide at the start of the loop.

\`\`\`cpp
// Return the node where the cycle begins, or nullptr (LC 141 / 142)
ListNode* detectCycle(ListNode* head) {
  ListNode *slow = head, *fast = head;
  while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) {  // cycle confirmed
      ListNode* p = head;
      while (p != slow) {  // walk in lockstep to the entrance
        p = p->next;
        slow = slow->next;
      }
      return p;
    }
  }
  return nullptr;  // fast hit the end -> no cycle
}
\`\`\`
:::

The middle-finder also feeds **Palindrome Linked List** (LC 234): split at the middle, reverse the second half, and compare the two halves node by node.`,
    },
    {
      id: "merging",
      title: "Merging sorted lists",
      body: `Merging is the linked-list analogue of the merge step in merge sort. With a dummy head you splice the smaller front node onto the result and advance that list's pointer, never copying values.

:::example Merge Two Sorted Lists (LC 21)
The dummy head means you never special-case the first append; at the end, attach whichever list still has nodes.

\`\`\`cpp
// Merge two sorted lists into one sorted list (LC 21)
ListNode* mergeTwoLists(ListNode* a, ListNode* b) {
  ListNode dummy(0);
  ListNode* tail = &dummy;
  while (a && b) {
    if (a->val <= b->val) {
      tail->next = a;
      a = a->next;
    } else {
      tail->next = b;
      b = b->next;
    }
    tail = tail->next;
  }
  tail->next = a ? a : b;  // append the non-empty remainder
  return dummy.next;
}
\`\`\`
:::

To merge \`k\` lists, repeatedly pulling the global minimum naively costs \`O(k)\` per node. Instead keep the heads in a **min-heap** and pop the smallest in \`O(log k)\`, giving \`O(N log k)\` overall for **Merge k Sorted Lists** (LC 23) — see [Heap & Priority Queue](/handbook/heap-priority-queue) and the heap section of [Data Structures](/handbook/data-structures). (Pairwise divide-and-conquer merging achieves the same bound without a heap.)`,
    },
    {
      id: "reorder-misc",
      title: "Reorder & pointer surgery",
      body: `Once dummy heads, reversal, and fast/slow pointers are in hand, most remaining problems are compositions of them plus careful re-threading.

:::example Remove Nth Node From End of List (LC 19)
Advance a lead pointer \`n\` steps first, then move both until the lead hits the end — the trailing pointer now sits just before the target. A dummy head makes removing the first node uniform.

\`\`\`cpp
// Remove the n-th node counting from the end (LC 19)
ListNode* removeNthFromEnd(ListNode* head, int n) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode *lead = &dummy, *trail = &dummy;
  for (int i = 0; i < n; ++i) {
    lead = lead->next;  // open a gap of n nodes
  }
  while (lead->next) {  // slide both to the end
    lead = lead->next;
    trail = trail->next;
  }
  trail->next = trail->next->next;  // splice out the n-th-from-end
  return dummy.next;
}
\`\`\`
:::

:::example Reorder List (LC 143)
The pattern \`L0 → L1 → … → Ln\` becomes \`L0 → Ln → L1 → Ln-1 → …\`. Combine three primitives: find the middle (fast/slow), reverse the second half, then weave the two halves together.

\`\`\`cpp
// Reorder list to L0, Ln, L1, Ln-1, ... (LC 143)
void reorderList(ListNode* head) {
  if (!head || !head->next) {
    return;
  }
  ListNode *slow = head, *fast = head;  // find middle (first of two middles)
  while (fast->next && fast->next->next) {
    slow = slow->next;
    fast = fast->next->next;
  }
  ListNode* second = slow->next;  // reverse the second half
  slow->next = nullptr;
  ListNode* prev = nullptr;
  while (second) {
    ListNode* nxt = second->next;
    second->next = prev;
    prev = second;
    second = nxt;
  }
  ListNode* first = head;  // interleave the two halves
  while (prev) {
    ListNode* f = first->next;
    ListNode* s = prev->next;
    first->next = prev;
    prev->next = f;
    first = f;
    prev = s;
  }
}
\`\`\`
:::

:::example Copy List with Random Pointer (LC 138)
Each node has an extra \`random\` pointer to an arbitrary node. Interleave each copy right after its original (\`A → A' → B → B' → …\`), set \`copy->random = orig->random->next\`, then unzip the two lists — \`O(n)\` time and \`O(1)\` extra space beyond the clones (a hash map of \`orig → copy\` also works).

\`\`\`cpp
// Deep-copy a list whose nodes carry a random pointer (LC 138)
Node* copyRandomList(Node* head) {
  if (!head) {
    return nullptr;
  }
  for (Node* p = head; p; p = p->next->next) {  // weave copies inline
    Node* c = new Node(p->val);
    c->next = p->next;
    p->next = c;
  }
  for (Node* p = head; p; p = p->next->next) {  // wire random on the copies
    p->next->random = p->random ? p->random->next : nullptr;
  }
  Node* res = head->next;  // unzip the interleaved lists
  for (Node* p = head; p; p = p->next) {
    Node* c = p->next;
    p->next = c->next;
    c->next = c->next ? c->next->next : nullptr;
  }
  return res;
}
\`\`\`
:::

The same toolkit handles **Add Two Numbers** (LC 2, digit-by-digit with carry), **Swap Nodes in Pairs** (LC 24), and **Intersection of Two Linked Lists** (LC 160, two pointers that switch heads to cancel the length difference).`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Dummy head | head may change or be deleted | sentinel \`dummy.next = head\`, return \`dummy.next\` | [Remove Nth From End](https://leetcode.cn/problems/remove-nth-node-from-end-of-list) |
| In-place reversal | "reverse the list / a sublist / in groups" | three-pointer flip with saved \`next\` | [Reverse Linked List](https://leetcode.cn/problems/reverse-linked-list) |
| Fast & slow | "middle", "cycle", "k-th from end" | two pointers at different speeds | [Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii) |
| Merge | combine sorted chains | dummy head, splice smaller front | [Merge Two Sorted Lists](https://leetcode.cn/problems/merge-two-sorted-lists) |
| Merge k via heap | many sorted lists at once | min-heap of heads, pop in \`O(log k)\` | [Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists) |
| Split + reverse + weave | "reorder", "palindrome" | middle, reverse half, interleave/compare | [Reorder List](https://leetcode.cn/problems/reorder-list) |
| Two-pass / offset | delete or find by position | gap of \`n\` between two pointers | [Palindrome Linked List](https://leetcode.cn/problems/palindrome-linked-list) |`,
    },
    {
      id: "advanced-techniques",
      title: "Advanced techniques",
      body: `Advanced linked-list questions mix pointer surgery with another invariant: reverse a bounded segment, splice nodes across lists, or pair a list with a hashmap for O(1) lookup. Draw prev/current/next ownership before writing assignments.`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| Access / search by index | \`O(n)\` | \`O(1)\` | no random access |
| Insert / delete at known node | \`O(1)\` | \`O(1)\` | just re-thread \`next\` |
| Reverse (whole or sublist) | \`O(n)\` | \`O(1)\` | three-pointer walk |
| Reverse in k-groups | \`O(n)\` | \`O(1)\` | each node touched once |
| Find middle / detect cycle | \`O(n)\` | \`O(1)\` | fast & slow pointers |
| Merge two sorted lists | \`O(m + n)\` | \`O(1)\` | splice, no copy |
| Merge k sorted lists (heap) | \`O(N log k)\` | \`O(k)\` | \`N\` = total nodes |
| Copy with random pointer | \`O(n)\` | \`O(1)\`* | *interleave trick; \`O(n)\` with a hash map |`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 3507 | [Minimum Pair Removal to Sort Array I](https://leetcode.cn/problems/minimum-pair-removal-to-sort-array-i) | 1349 | linked list + heap simulation |
| 3510 | [Minimum Pair Removal to Sort Array II](https://leetcode.cn/problems/minimum-pair-removal-to-sort-array-ii) | 2608 | linked list + ordered set |
| 2487 | [Remove Nodes from Linked List](https://leetcode.cn/problems/remove-nodes-from-linked-list) | 1455 | monotonic stack over list |
| 2816 | [Double a Number Represented as a Linked List](https://leetcode.cn/problems/double-a-number-represented-as-a-linked-list) | 1394 | carry propagation |
| 25 | [Reverse Nodes in k-Group](https://leetcode.cn/problems/reverse-nodes-in-k-group) | - | reverse groups classic |
| 23 | [Merge k Sorted Lists](https://leetcode.cn/problems/merge-k-sorted-lists) | - | heap merge classic |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Null-check before dereferencing.** \`fast->next->next\` crashes if \`fast->next\` is \`nullptr\`; always guard \`while (fast && fast->next)\` and test \`head\`/\`head->next\` up front.
- **Save \`next\` before overwriting it.** Reversal and reorder lose the tail of the list the instant you set \`head->next = prev\` without first stashing the old \`head->next\`.
- **Use a dummy head when the head can change.** It removes the leading-node special case and the off-by-one in delete/insert; remember to return \`dummy.next\`, not \`head\`.
- **Mind the even/odd middle.** \`while (fast && fast->next)\` returns the *second* middle; \`while (fast->next && fast->next->next)\` returns the *first* — pick the one your split needs.
- **Terminate the new tail.** After splitting or reordering, set the last node's \`next\` to \`nullptr\`, or you create an accidental cycle.
- **Cycle math, not luck.** In LC 142, the second walk must start from \`head\` and move one step at a time; starting elsewhere or two-stepping breaks the meeting-point proof.
- **Off-by-one in offset pointers.** For "n-th from the end" (LC 19), anchor the lead pointer at the dummy and advance it exactly \`n\` steps so \`trail\` lands on the predecessor.`,
    },
  ],
};
