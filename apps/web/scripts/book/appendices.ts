/**
 * Back-matter written for the difficulty edition (each volume carries the
 * same reference appendices so it can be read on its own). Markdown here goes
 * through the same renderer as the lectures (`markdown.ts`).
 */

export interface AuthoredAppendix {
  key: string;
  letter: string;
  title: string;
  /** Short running-head text. */
  head: string;
  markdown: string;
}

/** String.raw keeps the backslash of an escaped backtick; drop it. */
const md = (s: string) => s.replace(/\\`/g, "`");

const STL = md(String.raw`
這份速查表只收面試與刷題真正會用到的部分，重點放在**複雜度**與**容易踩的坑**。複雜度欄中 $n$ 為容器大小；「均攤」表示偶爾一次很慢、但平均每次是該複雜度。

## 容器操作的複雜度

| 容器 | 存取 / 查找 | 插入 / 刪除 | 備註 |
| --- | --- | --- | --- |
| \`vector<T>\` | 下標 $O(1)$；查值 $O(n)$ | 尾端 \`push_back\` 均攤 $O(1)$；中間 $O(n)$ | 擴容會讓所有迭代器、指標與參考失效 |
| \`deque<T>\` | 下標 $O(1)$ | 兩端 $O(1)$；中間 $O(n)$ | 單調佇列、0-1 BFS 的首選 |
| \`list<T>\` | 只能走訪 $O(n)$ | 已知位置 $O(1)$ | LRU 快取搭配 \`unordered_map\` 存迭代器 |
| \`set\` / \`map\` | $O(\log n)$ | $O(\log n)$ | 有序；\`lower_bound\` 找前驅後繼 |
| \`multiset\` | $O(\log n)$ | $O(\log n)$ | \`erase(x)\` 刪掉**全部**的 x；只刪一個要 \`erase(find(x))\` |
| \`unordered_set\` / \`unordered_map\` | 平均 $O(1)$，最壞 $O(n)$ | 平均 $O(1)$ | 無序；\`pair\` 當鍵要自備雜湊 |
| \`priority_queue<T>\` | \`top\` $O(1)$ | \`push\` / \`pop\` $O(\log n)$ | **預設是大根堆**；不支援刪除任意元素 |
| \`stack\` / \`queue\` | 頂端 / 隊頭 $O(1)$ | $O(1)$ | 空容器呼叫 \`top()\`、\`front()\` 是未定義行為 |
| \`string\` | 下標 $O(1)$ | 尾端 \`+=\` 均攤 $O(1)$ | \`substr\` 會複製，迴圈裡反覆呼叫是 $O(n^2)$ |

## 演算法標頭的常用函式

| 函式 | 用途 | 複雜度 |
| --- | --- | --- |
| \`sort(b, e, cmp)\` | 排序；\`cmp\` 必須是嚴格弱序 | $O(n \log n)$ |
| \`stable_sort\` | 相等元素保持原順序 | $O(n \log n)$ |
| \`lower_bound\` / \`upper_bound\` | 第一個 $\ge x$ / 第一個 $> x$ | $O(\log n)$（隨機存取迭代器） |
| \`nth_element(b, b + k, e)\` | 第 k 小就位，左小右大 | 平均 $O(n)$ |
| \`partial_sum\` / \`accumulate\` | 字首和 / 總和 | $O(n)$ |
| \`iota(b, e, 0)\` | 填入 0, 1, 2, … | $O(n)$ |
| \`unique\` + \`erase\` | 排序後去重 | $O(n)$ |
| \`next_permutation\` | 下一個字典序排列 | 均攤 $O(1)$ |
| \`gcd\` / \`lcm\`（\`<numeric>\`） | C++17 起內建 | $O(\log \min(a, b))$ |
| \`__builtin_popcount\` / \`__builtin_ctz\` | 1 的個數 / 尾端 0 的個數（GCC） | $O(1)$ |

\`set\` 與 \`map\` 的迭代器不是隨機存取，必須用成員函式 \`s.lower_bound(x)\`；寫成 \`lower_bound(s.begin(), s.end(), x)\` 會退化成 $O(n)$。

## 面試常用的慣用寫法

:::example 小根堆、自訂排序與結構化綁定
\`\`\`cpp
// Min-heap of (distance, node): greater<> flips the default max-heap.
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
pq.emplace(0, src);
while (!pq.empty()) {
    auto [d, u] = pq.top();  // structured binding (C++17)
    pq.pop();
    if (d > dist[u]) continue;  // stale entry (lazy deletion)
    // relax edges of u ...
}

// Sort intervals by right endpoint; the comparator must be strict (<, never <=).
sort(iv.begin(), iv.end(), [](const auto& a, const auto& b) {
    return a[1] < b[1];
});

// Coordinate compression.
vector<int> xs = nums;
sort(xs.begin(), xs.end());
xs.erase(unique(xs.begin(), xs.end()), xs.end());
auto rankOf = [&xs](int v) {
    return int(lower_bound(xs.begin(), xs.end(), v) - xs.begin());
};
\`\`\`
:::

:::example 遞迴 lambda 與 pair 的雜湊
\`\`\`cpp
// Recursive lambda: pass itself as the first argument (C++17 friendly).
auto dfs = [&](auto&& self, int u, int parent) -> int {
    int size = 1;
    for (int v : adj[u])
        if (v != parent) size += self(self, v, u);
    return size;
};
int total = dfs(dfs, 0, -1);

// unordered_map keyed by a pair: encode it into one 64-bit integer.
unordered_map<long long, int> seen;
auto key = [](int r, int c) { return (long long)r << 32 | (unsigned)c; };
seen[key(r, c)] = step;
\`\`\`
:::

## 最常見的陷阱

- **\`size()\` 是無號數**：\`v.size() - 1\` 在空陣列上會變成極大值。迴圈寫 \`i + 1 < (int)v.size()\` 或先轉成 \`int\`。
- **\`int\` 溢位**：$10^5 \times 10^5$ 已超過 \`int\`。乘法先轉型 \`1LL * a * b\`；\`accumulate\` 的初值寫 \`0LL\`，否則整段都用 \`int\` 加。
- **\`map[key]\` 會插入**：只想查詢時用 \`count\`、\`find\` 或 \`contains\`（C++20），否則會悄悄插入預設值並改變 \`size()\`。
- **比較函式寫成 \`<=\`**：違反嚴格弱序，\`sort\` 可能越界或無窮迴圈，是未定義行為。
- **走訪時刪除**：\`for (auto it = m.begin(); it != m.end();)\` 裡要寫 \`it = m.erase(it)\`，不能刪完再 \`++it\`。
- **\`vector\` 擴容讓參考失效**：先存 \`auto& x = v[0];\` 再 \`push_back\`，\`x\` 可能懸空。
- **負數的除法與取餘**：C++ 向零取整，\`-7 / 2 == -3\`、\`-7 % 2 == -1\`。取模要寫 \`(a % m + m) % m\`。
- **\`abs(INT_MIN)\` 溢位**：取絕對值前先轉 \`long long\`。
- **二分的中點**：\`(l + r) / 2\` 可能溢位，寫 \`l + (r - l) / 2\`。
- **遞迴太深**：鏈狀樹深度可達 $10^5$，可能把呼叫堆疊撐爆；必要時改成顯式堆疊或 BFS。
- **\`unordered_map\` 被卡**：特製資料能讓雜湊退化成 $O(n)$；面試時提一句「可改用 \`map\` 或自訂雜湊」即可。
- **輸出用 \`endl\`**：每次都會清空緩衝區；大量輸出改用 \`'\n'\`。

## 白板上的程式碼風格

- 變數名說出語意：\`left\`、\`right\`、\`best\` 勝過 \`i\`、\`j\`、\`ans2\`。
- 大物件用 \`const vector<int>&\` 傳入，避免無意的複製。
- 先寫出函式簽名與邊界判斷，再寫主迴圈；寫完立刻用題目的範例手動跑一次。
- 一邊寫一邊說出不變量（「進入迴圈時，答案一定在 \`[l, r]\` 內」），面試官最想聽的就是這句。
`);

const COMPLEXITY = md(String.raw`
## 從輸入規模反推演算法

線上評測與面試題的限制，大致可以用「每秒約 $10^8$ 次簡單運算」來估算。下表是看到 $n$ 的上限時，第一個該考慮的複雜度。

| $n$ 的上限 | 可接受的複雜度 | 典型做法 |
| --- | --- | --- |
| $\le 10$ | $O(n! \cdot n)$ | 全排列、暴力回溯 |
| $\le 20$ | $O(2^n \cdot n)$ | 子集列舉、狀壓 DP |
| $\le 40$ | $O(2^{n/2})$ | 折半列舉 |
| $\le 500$ | $O(n^3)$ | 區間 DP、Floyd |
| $\le 5000$ | $O(n^2)$ | 二維 DP、雙重迴圈 |
| $\le 10^6$ | $O(n \log n)$ | 排序、二分、堆、線段樹 |
| $\le 10^7$ | $O(n)$ | 雙指標、單調堆疊、線性篩 |
| $\le 10^{18}$ | $O(\log n)$ 或 $O(\sqrt{n})$ | 二分答案、快速冪、數學公式 |

記憶體以 256 MB 估算：\`int\` 陣列約可開 $6 \times 10^7$ 個，\`long long\` 減半。二維 DP 開 $5000 \times 5000$ 的 \`int\` 約 100 MB，已經接近上限，通常要滾動陣列。

## 45 分鐘面試的答題流程

| 階段 | 時間 | 要做的事 |
| --- | --- | --- |
| 1. 釐清題意 | 3–5 分 | 複述題目；問清楚輸入範圍、是否有序、有無重複、負數、空輸入 |
| 2. 舉例 | 2–3 分 | 自己造一個小例子與一個邊界例子，確認輸出格式 |
| 3. 暴力解 | 2–3 分 | 先說出最直接的做法與它的複雜度，證明你理解問題 |
| 4. 優化 | 5–10 分 | 找出暴力的重複計算；對照「辨識題型的訊號」選技巧，說出不變量 |
| 5. 實作 | 15 分 | 先寫簽名與邊界，再寫主迴圈；邊寫邊說明每個變數的語意 |
| 6. 測試 | 5 分 | 用第 2 步的例子手動跑；再檢查空、單一元素、全相同、極值 |

優化卡住時，依序問自己四個問題：**能不能排序？能不能用雜湊表記住看過的東西？答案有沒有單調性？子問題有沒有重疊？** 這四問分別通往本書的貪心與雙指標、雜湊與字首和、二分、動態規劃。

## 邊界測資清單

- 空輸入、只有一個元素、只有兩個元素。
- 全部相同、嚴格遞增、嚴格遞減。
- 含負數、含 0、最大值與最小值（\`INT_MAX\`、\`INT_MIN\`）。
- 答案不存在時要回傳什麼（\`-1\`、空陣列、\`false\`）。
- 規模最大時是否會超時、溢位或遞迴太深。
`);

export const AUTHORED_APPENDICES: AuthoredAppendix[] = [
  {
    key: "cpp",
    letter: "A",
    title: "C++17 面試速查",
    head: "附錄 A\u3000C++17 面試速查",
    markdown: STL,
  },
  {
    key: "complexity",
    letter: "B",
    title: "複雜度估算與面試答題流程",
    head: "附錄 B\u3000複雜度估算與面試答題流程",
    markdown: COMPLEXITY,
  },
];
