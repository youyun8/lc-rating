import type { HandbookTopic } from "../model";

export const design: HandbookTopic = {
  slug: "design",
  title: "Data-Structure Design",
  tagline:
    "Compose simple structures — hashmap + linked list / heap / BST / array — into a class whose operations all run in O(1) or O(log n).",
  icon: "Blocks",
  group: "Data Structures",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `**Data-structure design** problems hand you a *specification* — "implement a class with \`get\`, \`put\`, \`insert\`, \`getRandom\` …, each in \`O(1)\` (or \`O(log n)\`)" — and leave the representation entirely up to you. No single built-in container hits every requirement at once, so the core trick is to **combine simple structures** and let each one cover the operation the others are slow at.

The recurring pairings:

- **hashmap + doubly linked list** — \`O(1)\` lookup *and* \`O(1)\` ordering/eviction (LRU, LFU).
- **array + hashmap** — \`O(1)\` random access *and* \`O(1)\` membership / delete (randomized set).
- **hashmap + heap** — \`O(1)\` keyed access *and* \`O(log n)\` "pull the best" (feeds, schedulers).
- **value → sorted list, binary search** — append-only history with point-in-time queries.
- **auxiliary stack** — a parallel stack that caches an aggregate (min/max) so a query stays \`O(1)\`.

Signals:

- the prompt literally says **"Design …"** or **"Implement the \`X\` class"** with a fixed method list.
- every method has a **target complexity**, usually \`O(1)\` amortized or \`O(log n)\`.
- one container alone is too slow for at least one method — you need a *second* structure to patch the gap.
- the data is **mutated by the operations themselves** (insert/remove/access) rather than queried over a static array.

The shape is always: *pick the structure that makes the hardest operation fast, then bolt on a side structure that keeps the others fast and stays in sync with it.*`,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      body: `- Comfort wiring **pointers / iterators** between nodes and keeping two containers consistent.
- Amortized analysis (why \`O(1)\` amortized append or hash insert is fine).
- The building blocks themselves: [Linked List](/handbook/linked-list), [Heap & Priority Queue](/handbook/heap-priority-queue), and the broader toolbox in [Data Structures](/handbook/data-structures).

Related: [Strings](/handbook/strings) (Trie-backed designs like add-and-search), [Binary Search](/handbook/binary-search) (versioned key-value stores).`,
    },
    {
      id: "lru",
      title: "Hashmap + doubly linked list (LRU)",
      body: `The canonical design pairing. A **doubly linked list** keeps entries in usage order (front = most recently used, back = least), and a **hashmap** of \`key → node iterator\` lets you find any entry in \`O(1)\` so you can splice it to the front or evict the tail without scanning.

:::example LRU Cache (LC 146)
On \`get\`, look up the node and **move it to the front**. On \`put\`, update-and-promote if present, otherwise insert at the front and, if over capacity, **evict the back**. \`std::list::splice\` moves a node between positions in \`O(1)\` and — crucially — keeps existing iterators valid, so the hashmap never goes stale.

\`\`\`cpp
// LRU cache: hashmap + doubly linked list, O(1) get/put (LC 146)
class LRUCache {
  int cap;
  list<pair<int, int>> dll;  // front = most-recently-used; (key, value)
  unordered_map<int, list<pair<int, int>>::iterator> pos;

 public:
  LRUCache(int capacity) : cap(capacity) {}

  int get(int key) {
    auto it = pos.find(key);
    if (it == pos.end()) {
      return -1;
    }
    dll.splice(dll.begin(), dll, it->second);  // promote, iterators stay valid
    return it->second->second;
  }

  void put(int key, int value) {
    auto it = pos.find(key);
    if (it != pos.end()) {
      it->second->second = value;
      dll.splice(dll.begin(), dll, it->second);  // promote
      return;
    }
    if ((int)dll.size() == cap) {
      pos.erase(dll.back().first);  // evict least-recently-used
      dll.pop_back();
    }
    dll.push_front({key, value});
    pos[key] = dll.begin();  // keep map in sync with list
  }
};
\`\`\`
:::

The whole technique lives in the invariant *the map and the list always describe the same set of keys* — every list mutation has a matching map update. Roll your own node struct if you cannot use \`std::list\`, but the iterator-stability guarantee makes \`list\` the cleaner choice.`,
    },
    {
      id: "lfu",
      title: "Frequency buckets (LFU)",
      body: `**LFU** evicts the *least frequently used* key, breaking ties by least recently used. The extension over LRU: bucket keys by their access count. Keep one doubly linked list **per frequency** (each list is LRU-ordered within that frequency), a \`key → node\` map, and a running \`minFreq\`. An access moves a key from its frequency-\`f\` list to the frequency-\`(f+1)\` list; eviction pops the back of the \`minFreq\` list.

:::example LFU Cache (LC 460)
\`std::list\` again gives \`O(1)\` splice between buckets. When the \`minFreq\` bucket empties after promoting a key, bump \`minFreq\`; on a fresh insert reset \`minFreq\` to \`1\`.

\`\`\`cpp
// LFU cache: per-frequency LRU lists + key map, O(1) get/put (LC 460)
class LFUCache {
  int cap, minFreq = 0;
  struct Node {
    int key, val, freq;
  };
  unordered_map<int, list<Node>::iterator> pos;  // key -> node
  unordered_map<int, list<Node>> buckets;        // freq -> LRU list of nodes

  void touch(list<Node>::iterator it) {
    int f = it->freq, key = it->key, val = it->val;
    buckets[f].erase(it);
    if (buckets[f].empty() && f == minFreq) {
      minFreq++;  // that bucket is gone, next-least is f+1
    }
    buckets[f + 1].push_front({key, val, f + 1});
    pos[key] = buckets[f + 1].begin();
  }

 public:
  LFUCache(int capacity) : cap(capacity) {}

  int get(int key) {
    auto it = pos.find(key);
    if (it == pos.end()) {
      return -1;
    }
    int val = it->second->val;
    touch(it->second);
    return val;
  }

  void put(int key, int value) {
    if (cap == 0) {
      return;
    }
    auto it = pos.find(key);
    if (it != pos.end()) {
      it->second->val = value;
      touch(it->second);
      return;
    }
    if ((int)pos.size() == cap) {
      auto& lru = buckets[minFreq];
      pos.erase(lru.back().key);  // least-freq, least-recent
      lru.pop_back();
    }
    buckets[1].push_front({key, value, 1});
    pos[key] = buckets[1].begin();
    minFreq = 1;  // the new key has freq 1
  }
};
\`\`\`
:::

LFU is "LRU with a frequency dimension": the same hashmap-plus-list machinery, indexed by access count.`,
    },
    {
      id: "min-stack",
      title: "Auxiliary stack (Min Stack)",
      body: `When a query asks for an **aggregate of the whole structure in \`O(1)\`** (the minimum, maximum, running max-frequency), maintain a *second* structure alongside the primary one that caches that aggregate at each step. For a stack, push the running minimum onto a parallel stack so \`getMin\` is a single \`top()\`.

:::example Min Stack (LC 155)
Each entry on the auxiliary stack is "the min of everything at or below this position", so it pops in lock-step with the main stack and stays correct after removals.

\`\`\`cpp
// Min stack: parallel stack of running minima, O(1) for all ops (LC 155)
class MinStack {
  stack<int> st;
  stack<int> mins;  // mins.top() == min of st

 public:
  void push(int val) {
    st.push(val);
    mins.push(mins.empty() ? val : min(val, mins.top()));
  }
  void pop() {
    st.pop();
    mins.pop();  // pops in lock-step, so the cached min stays valid
  }
  int top() { return st.top(); }
  int getMin() { return mins.top(); }
};
\`\`\`
:::

Same idea powers Max Stack (LC 716) and the deque-based sliding-window maximum. The lesson: *if a query needs an aggregate fast, store the aggregate incrementally instead of recomputing it.*`,
    },
    {
      id: "random-set",
      title: "Array + hashmap for O(1) random",
      body: `\`getRandom\` needs **uniform \`O(1)\` access by index**, which only a flat array gives; \`insert\`/\`remove\` need **\`O(1)\` membership**, which only a hashmap gives. Combine them: store values in a \`vector\`, and a \`value → index\` map. The trick for \`O(1)\` delete is to **swap the victim with the last element**, pop the back, and fix the moved element's index — order does not matter for random sampling.

:::example Insert Delete GetRandom O(1) (LC 380)
\`\`\`cpp
// Insert/Delete/GetRandom all O(1): vector + value->index map (LC 380)
class RandomizedSet {
  vector<int> vals;
  unordered_map<int, int> idx;  // value -> position in vals

 public:
  bool insert(int val) {
    if (idx.count(val)) {
      return false;
    }
    idx[val] = vals.size();
    vals.push_back(val);
    return true;
  }

  bool remove(int val) {
    auto it = idx.find(val);
    if (it == idx.end()) {
      return false;
    }
    int i = it->second, last = vals.back();
    vals[i] = last;  // move last element into the hole
    idx[last] = i;   // fix its recorded index
    vals.pop_back();
    idx.erase(it);
    return true;
  }

  int getRandom() { return vals[rand() % vals.size()]; }
};
\`\`\`
:::

To allow duplicates (LC 381), make the map a \`value → unordered_set<int>\` of positions; the swap-with-last delete still works, you just erase one stored index. The swap-and-pop idiom is the heart of \`O(1)\` deletion from an array.`,
    },
    {
      id: "twitter",
      title: "Hashmap + heap (Design Twitter)",
      body: `Feed-style designs keep per-key data in hashmaps but answer "give me the top \`k\` across several sources" by **merging with a heap**. A monotone global timestamp orders posts; \`getNewsFeed\` does a k-way merge of the user's own tweets and those of everyone they follow.

:::example Design Twitter (LC 355)
Store each user's tweets as \`(time, id)\` and a \`followee\` set. To build the feed, push the newest tweet from each relevant user into a max-heap keyed by time, then repeatedly pop and push that user's next-older tweet — a k-way merge that stops after 10 items.

\`\`\`cpp
// Design Twitter: per-user tweet lists + follow sets, heap merge feed (LC 355)
class Twitter {
  int clock = 0;
  unordered_map<int, vector<pair<int, int>>> tweets;  // user -> (time, id)
  unordered_map<int, unordered_set<int>> follows;     // user -> followees

 public:
  void postTweet(int userId, int tweetId) {
    tweets[userId].push_back({clock++, tweetId});
  }

  vector<int> getNewsFeed(int userId) {
    // max-heap of (time, tweetIndex, userId), seeded with each source's newest
    priority_queue<tuple<int, int, int>> pq;
    auto seed = [&](int u) {
      if (!tweets[u].empty()) {
        int i = tweets[u].size() - 1;
        pq.push({tweets[u][i].first, i, u});
      }
    };
    seed(userId);
    for (int f : follows[userId]) {
      seed(f);
    }
    vector<int> res;
    while (!pq.empty() && res.size() < 10) {
      auto [t, i, u] = pq.top();
      pq.pop();
      res.push_back(tweets[u][i].second);
      if (i > 0) {
        pq.push({tweets[u][i - 1].first, i - 1, u});  // next-older from u
      }
    }
    return res;
  }

  void follow(int a, int b) { follows[a].insert(b); }
  void unfollow(int a, int b) { follows[a].erase(b); }
};
\`\`\`
:::

The pattern generalizes to any "top-k over many keyed streams" design — the hashmap routes to a stream, the heap merges across streams.`,
    },
    {
      id: "versioned",
      title: "Binary search over versions",
      body: `Append-only histories with point-in-time reads use a **\`key → sorted list of (timestamp, value)\`** map. Because \`set\` calls arrive with non-decreasing timestamps, each list is already sorted, so \`get(key, t)\` is a **binary search** for the latest entry with \`timestamp <= t\`.

:::example Time Based Key-Value Store (LC 981)
\`upper_bound\` finds the first entry strictly after \`t\`; step back one to get the most recent value at or before \`t\`.

\`\`\`cpp
// Time-based key-value store: per-key sorted history + binary search (LC 981)
class TimeMap {
  unordered_map<string, vector<pair<int, string>>> store;  // key -> (ts, val)

 public:
  void set(string key, string value, int timestamp) {
    store[key].push_back({timestamp, value});  // timestamps arrive increasing
  }

  string get(string key, int timestamp) {
    auto it = store.find(key);
    if (it == store.end()) {
      return "";
    }
    auto& v = it->second;
    // first entry with ts > timestamp; the one before it is our answer
    int lo = 0, hi = v.size();
    while (lo < hi) {
      int mid = (lo + hi) / 2;
      if (v[mid].first <= timestamp) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo == 0 ? "" : v[lo - 1].second;
  }
};
\`\`\`
:::

If timestamps could arrive *out of order*, swap the \`vector\` for a \`map<int, string>\` per key and use \`upper_bound\`; the binary-search-over-history idea is unchanged.`,
    },
    {
      id: "interview-patterns",
      title: "Common interview patterns",
      body: `| Pattern | Signal | Go-to move | Representative |
| --- | --- | --- | --- |
| Hashmap + doubly linked list | \`O(1)\` get/put with eviction order | map of \`key → node\`, splice to front, evict back | [LRU Cache](https://leetcode.cn/problems/lru-cache) |
| Frequency buckets | evict least-*frequently* used | per-frequency LRU lists + \`minFreq\` | [LFU Cache](https://leetcode.cn/problems/lfu-cache) |
| Auxiliary aggregate stack | \`O(1)\` min/max of a stack | parallel stack caching the running aggregate | [Min Stack](https://leetcode.cn/problems/min-stack) |
| Array + hashmap | \`O(1)\` insert/delete *and* random | swap-with-last delete, \`value → index\` map | [Insert Delete GetRandom](https://leetcode.cn/problems/insert-delete-getrandom-o1) |
| Hashmap + heap | top-k merged across keyed streams | route by map, k-way merge by heap | [Design Twitter](https://leetcode.cn/problems/design-twitter) |
| Versioned binary search | point-in-time read of append-only data | per-key sorted history, \`upper_bound\` | [Time Based Key-Value Store](https://leetcode.cn/problems/time-based-key-value-store) |
| Ring buffer / two pointers | fixed-capacity FIFO with \`O(1)\` ends | array + head/tail indices (mod capacity) | [Design Circular Queue](https://leetcode.cn/problems/design-circular-queue) |
| Trie-backed lookup | prefix / wildcard membership | character-indexed trie nodes, DFS for \`.\` | [Add and Search Words](https://leetcode.cn/problems/design-add-and-search-words-data-structure) |`,
    },
    {
      id: "complexity",
      title: "Complexity cheatsheet",
      body: `| Design | Operation | Cost |
| --- | --- | --- |
| LRU cache | \`get\` / \`put\` | \`O(1)\` |
| LFU cache | \`get\` / \`put\` | \`O(1)\` |
| Min stack | \`push\` / \`pop\` / \`getMin\` | \`O(1)\` |
| Randomized set | \`insert\` / \`remove\` / \`getRandom\` | \`O(1)\` avg |
| Design Twitter | \`postTweet\` / \`follow\` | \`O(1)\` |
| Design Twitter | \`getNewsFeed\` | \`O(n log n)\` for \`n\` followees, capped at 10 outputs |
| Time-based KV store | \`set\` | \`O(1)\` amortized |
| Time-based KV store | \`get\` | \`O(log n)\` |
| Circular queue | \`enQueue\` / \`deQueue\` | \`O(1)\` |
| Add/Search Words | \`addWord\` | \`O(L)\` |
| Add/Search Words | \`search\` (with \`.\`) | \`O(26^d * L)\` worst case |

The whole point of the genre is that *every* listed operation lands at \`O(1)\` or \`O(log n)\` — if any method is still linear, you are missing a side structure.`,
    },
    {
      id: "problems",
      title: "Representative LeetCode problems",
      body: `| ID | Problem | Technique |
| --- | --- | --- |
| 146 | [LRU Cache](https://leetcode.cn/problems/lru-cache) | hashmap + list |
| 155 | [Min Stack](https://leetcode.cn/problems/min-stack) | auxiliary stack |
| 208 | [Implement Trie](https://leetcode.cn/problems/implement-trie-prefix-tree) | trie nodes |
| 211 | [Add and Search Words](https://leetcode.cn/problems/design-add-and-search-words-data-structure) | trie + DFS wildcard |
| 295 | [Find Median from Data Stream](https://leetcode.cn/problems/find-median-from-data-stream) | two heaps |
| 355 | [Design Twitter](https://leetcode.cn/problems/design-twitter) | hashmap + heap |
| 380 | [Insert Delete GetRandom O(1)](https://leetcode.cn/problems/insert-delete-getrandom-o1) | array + hashmap |
| 460 | [LFU Cache](https://leetcode.cn/problems/lfu-cache) | frequency buckets |
| 622 | [Design Circular Queue](https://leetcode.cn/problems/design-circular-queue) | ring buffer |
| 705 | [Design HashSet](https://leetcode.cn/problems/design-hashset) | buckets + chaining |
| 706 | [Design HashMap](https://leetcode.cn/problems/design-hashmap) | buckets + chaining |
| 981 | [Time Based Key-Value Store](https://leetcode.cn/problems/time-based-key-value-store) | versioned binary search |
| 1472 | [Design Browser History](https://leetcode.cn/problems/design-browser-history) | stack / array + cursor |`,
    },
    {
      id: "pitfalls",
      title: "Pitfalls & tips",
      body: `- **Keep the two structures in sync.** Every mutation of the primary container (list splice, vector swap, bucket move) must have a matching update to the hashmap — a single forgotten \`pos[key] = ...\` leaves a dangling reference and a wrong answer.
- **Iterator / pointer invalidation.** Prefer \`std::list\` for the LRU/LFU linked list precisely because \`splice\` preserves iterators; \`vector\` reallocation invalidates everything, so never store \`vector\` iterators in a map across a \`push_back\`.
- **\`splice\` is the \`O(1)\` move.** Use \`dll.splice(dll.begin(), dll, it)\` to move-to-front; erase-then-reinsert allocates a new node and breaks the stored iterator.
- **Swap-with-last for \`O(1)\` delete.** Removing from the middle of a \`vector\` is \`O(n)\`; overwrite the victim with the back element, fix that element's index, then \`pop_back\`.
- **Capacity-0 edge case.** An LRU/LFU cache with capacity \`0\` must accept \`put\` as a no-op and never evict from an empty list — guard before \`pop_back\`.
- **LFU \`minFreq\` bookkeeping.** Reset \`minFreq = 1\` on every fresh insert, and only increment it when promoting the *last* key out of the current \`minFreq\` bucket.
- **Monotone vs arbitrary timestamps.** The \`vector\` + binary-search KV store assumes non-decreasing \`set\` timestamps; if they can arrive out of order, switch to an ordered \`map\` per key.`,
    },
  ],
};
