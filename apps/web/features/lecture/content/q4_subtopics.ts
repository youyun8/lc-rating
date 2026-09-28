import type { TutorialData } from "@/types";
import { LC_HOST_EN } from "@/config/constants";

export interface Q4Subtopic {
  title: string;
  blurb: string;
  summary: string;
}

/**
 * A single curated practice problem for a leaf section. Mirrors the Q3 手冊
 * `PracticeRef` shape: only the LeetCode numeric `id`, `slug`, display `title`
 * and Traditional-Chinese `labels` are stored. The rendered markdown builds a
 * link from the slug and the renderer rewrites the host at runtime to match the
 * reader's leetcode.com / leetcode.cn toggle.
 */
export interface PracticeRef {
  id: number;
  slug: string;
  title: string;
  labels: string[];
}

export interface SubtopicQuestions {
  basic: PracticeRef[];
  advanced: PracticeRef[];
  challenge: PracticeRef[];
}

const questionTableHeader = "| ID | Problem | Labels |\n| --- | --- | --- |";

function practiceRefRow(ref: PracticeRef): string {
  return `| ${ref.id} | [${ref.title}](${LC_HOST_EN}/problems/${ref.slug}/) | ${ref.labels.join("、")} |`;
}

function questionStageTable(label: string, refs: PracticeRef[]): string {
  if (refs.length === 0) return "";
  return `**${label}**\n\n${questionTableHeader}\n${refs.map(practiceRefRow).join("\n")}`;
}

function renderQuestions(questions: SubtopicQuestions): string {
  const tables = [
    questionStageTable("必修", questions.basic),
    questionStageTable("進階", questions.advanced),
    questionStageTable("挑戰", questions.challenge),
  ].filter(Boolean);
  if (tables.length === 0) return "";
  return [
    "## 練習題",
    "依序練習：必修先把核心技巧寫成肌肉記憶，進階加入第二層洞察或建模，挑戰則是更深的變形。題目連結會依你的語言設定自動切換 leetcode.com 與 leetcode.cn。",
    tables.join("\n\n"),
  ].join("\n\n");
}

/**
 * Rich leaf-section builder following the insight-driven pedagogical arc
 * (motivating question → brute-force → key insight → invariant/algorithm →
 * annotated code → counter-example → recognition signals → anchored mistakes).
 * `body` is authored markdown; `questions` is optionally appended as a 練習題
 * table.
 */
function subRich(
  title: string,
  blurb: string,
  body: string,
  questions?: SubtopicQuestions,
): Q4Subtopic {
  const rendered = questions ? renderQuestions(questions) : "";
  return {
    title,
    blurb,
    summary: rendered ? `${body}\n\n${rendered}` : body,
  };
}

export const Q4_PATTERN_TOPIC_IDS = [
  94005, 94006, 94007, 94008, 94009, 94010, 94011, 94012,
] as const;

export type Q4PatternTopicId = (typeof Q4_PATTERN_TOPIC_IDS)[number];

export const Q4_PATTERN_META: Record<
  Q4PatternTopicId,
  { title: string; description: string; overview: string }
> = {
  94005: {
    title: "進階動態規劃",
    description:
      "Q4 的 DP 難在狀態設計與轉移優化：區間、狀壓、數位、樹形，加上單調隊列、矩陣快速冪這類把 O(n²) 壓到可接受的技巧。先把狀態語意說清楚，再談優化。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

第四題的 DP 幾乎不是「以 i 結尾的一維陣列」那種入門型，而是狀態多了一個維度或換了維度語意：區間 DP 用 \`dp[l][r]\`，把「最後合併／戳破哪一個」當最後一步；狀壓 DP 用 \`dp[mask]\` 或 \`dp[mask][last]\`，把「已選集合」壓成一個整數；數位 DP 用 \`dp[pos][tight][state]\`，逐位決定數字；樹形 DP 用 \`dp[u][0/1]\`，在後序遍歷合併子樹。共同點是：狀態要能一句話說清楚，且轉移只讀「更小、已算好」的狀態。

## 核心直覺

Q4 的 DP 通常分兩層難點。第一層是**建模**：從最後一步反推狀態。第二層是**優化**：暴力轉移寫得出來但 O(n²) 太慢，這時要問「我在轉移裡查的是什麼歷史最佳值」——若是滑動窗口內最大值就用單調隊列，若是固定線性遞推就用矩陣快速冪，若是前綴最佳就用前綴 max / 樹狀陣列。先寫對 O(n²) 版本再套優化結構，順序不能反。

## 典型讀題訊號

- 要對一段區間做決策，且答案由「先合併哪一段」決定：\`dp[l][r]\`，區間 DP。
- n ≤ 20 左右且要枚舉子集、排列或「已完成的集合」：狀壓 DP。
- 要統計 [0, N] 內滿足某數位性質的數字個數：數位 DP。
- 決策發生在樹上，子樹之間互相獨立：樹形 DP，必要時換根。
- 遞推是 \`f(i) = f(i-1) + f(i-2) + …\` 且 n 高達 1e9：矩陣快速冪。
- 轉移是 \`dp[i] = max(dp[j]) + a[i]\`，j 落在一段滑動窗口：單調隊列優化。


## C++ 模板或偽程式

\`\`\`cpp
// 區間 DP 骨架：先枚舉長度，短區間推長區間
for (int len = 2; len <= n; ++len) {
    for (int l = 0; l + len - 1 < n; ++l) {
        int r = l + len - 1;
        for (int k = l; k < r; ++k)  // 枚舉最後一步的分割點
            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + cost(l, k, r));
    }
}

// 狀壓 DP 骨架：dp[mask] = 用集合 mask 內元素完成的最佳值
for (int mask = 0; mask < (1 << n); ++mask)
    for (int j = 0; j < n; ++j)
        if (!(mask >> j & 1))
            dp[mask | (1 << j)] =
                best(dp[mask | (1 << j)], dp[mask] + w(mask, j));
\`\`\`

## 常見錯誤

- 區間 DP 遍歷順序錯：必須按區間長度由小到大，否則讀到未算好的子區間。
- 狀壓維度爆炸：n > 20 還想枚舉 \`2^n\` 子集，或忘了 \`dp[mask][last]\` 的 last 維度。
- 數位 DP 忘記處理前導零與 tight 邊界，導致多算或少算。
- 先套 Fenwick／deque／矩陣才發現 O(n²) 版本本身就寫錯。
- 非法狀態初始化成 0 而不是 -INF／+INF，讓不可能路徑混進 max／min。

## 建議練習順序

- 必修：1547、312（區間 DP 的分割點思維）、526（狀壓入門）。
- 進階：943、691（狀壓建模）、233（數位 DP 模板）。
- 挑戰：2376（數位 DP 計數）、1425（單調隊列優化）、968（樹形 DP）。

## 我能認出這個模式嗎？

- 我的狀態每一維語意能否一句話說清楚？
- 最後一步是切區間、加入 mask、定一位數字，還是合併子樹？
- 暴力轉移是幾次方？瓶頸出在查哪一種歷史最佳值？
- 遍歷順序是否保證轉移只讀已算好的狀態？`,
  },
  94006: {
    title: "線段樹與樹狀陣列",
    description:
      "當題目要在動態變化的序列上反覆做「區間查詢 + 單點／區間更新」，就需要一棵支援 O(log n) 操作的樹。樹狀陣列輕巧、線段樹通用，配合離散化與掃描線能解一大類 Q4。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

樹狀陣列（Fenwick）與線段樹都在解決同一種需求：一邊改資料、一邊查區間統計，而且要比 O(n) 掃描快。樹狀陣列程式碼短，適合前綴和、單點加、區間求和這類可差分的問題；線段樹更通用，能維護區間最大、最小、區間賦值、懶標記等樹狀陣列做不到的操作。很多「逆序對」「右側更小元素個數」的題目，本質是把值離散化後在值域上做「單點加、前綴查」。

## 核心直覺

如果暴力是「對每個元素回頭掃描前面所有元素」，那就是 O(n²)，而這些掃描查的往往是「前面有多少個比我小／比我大／在某區間內」。把值域建成樹狀陣列，邊掃邊插入、邊查前綴，就能把每次 O(n) 查詢壓成 O(log n)。線段樹則把區間拆成 O(log n) 個節點，讓區間更新與區間查詢都在對數時間完成；懶標記是「先在父節點記一筆，等真的往下走時才下推」的延遲手法。

## 典型讀題訊號

- 逆序對、右側更小元素、區間內元素個數：值域樹狀陣列 + 離散化。
- 反覆「單點修改 + 區間求和／求最值」：樹狀陣列或線段樹。
- 需要區間賦值、區間加、區間最值：線段樹 + 懶標記。
- 座標很大但事件很少：先離散化再上樹。
- 矩形覆蓋、天際線、掉落方塊：掃描線 + 線段樹／堆。


## C++ 模板或偽程式

\`\`\`cpp
// 樹狀陣列：單點加、前綴和查詢
struct BIT {
    int n;
    vector<long long> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i, long long v) {
        for (; i <= n; i += i & -i) t[i] += v;
    }
    long long sum(int i) {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }
    long long range(int l, int r) { return sum(r) - sum(l - 1); }  // 1-indexed
};

// 逆序對／右側更小：離散化後從右往左，先查前綴再插入
for (int i = n - 1; i >= 0; --i) {
    ans[i] = bit.sum(rank[i] - 1);  // 值域中比 a[i] 小的、已在右側出現的個數
    bit.add(rank[i], 1);
}
\`\`\`

## 常見錯誤

- 樹狀陣列下標從 0 開始：\`i & -i\` 會死迴圈，必須 1-indexed。
- 忘記離散化，值域高達 1e9 直接開陣列。
- 線段樹懶標記下推時機錯：查詢／更新進入子節點前一定要先 pushDown。
- 逆序對查詢與插入順序反了，把自己也算進去。
- 區間和用 int 溢位，應該用 long long。

## 建議練習順序

- 必修：307（BIT 基本操作）、315、493（逆序對家族）。
- 進階：327（前綴和 + 值域樹狀陣列）、1649、699（線段樹 / 座標壓縮）。
- 挑戰：218（掃描線）、715（區間模組）、2179（三元組計數）。

## 我能認出這個模式嗎？

- 我要維護的是區間和、區間最值，還是值域計數？
- 更新是單點還是區間？需要懶標記嗎？
- 值域要不要先離散化？
- 掃描順序（左到右、右到左、按事件）決定了什麼時候插入、什麼時候查詢？`,
  },
  94007: {
    title: "進階圖論",
    description:
      "Q4 的圖論題常把「圖」藏在網格、狀態或操作序列裡。認出邊權型態選對演算法（BFS／0-1 BFS／Dijkstra／Bellman-Ford），並用分層圖、狀態壓縮或併查集擴充節點語意。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

進階圖論的第一步永遠是建模：節點代表什麼「狀態」、邊代表什麼「轉移」、邊權是什麼。很多題目的節點不只是位置，而是「位置 + 已收集鑰匙的集合」「位置 + 剩餘可打破的牆」「位置 + 到達時間的奇偶」。認清狀態後，再依邊權型態選演算法：全為 1 用 BFS、只有 0/1 用雙端隊列 BFS、非負任意權重用 Dijkstra、含負權或限制邊數用 Bellman-Ford。

## 核心直覺

最短路演算法的正確性都建立在「第一次以最小代價確定某狀態時，這個代價就是最終答案」。BFS 靠按層擴展保證這點；Dijkstra 靠優先隊列每次彈出當前最小。分層圖是把「還能用幾次特殊操作」變成額外維度，等於複製多層圖再連邊。狀壓 BFS 則把小集合（鑰匙、已訪問點）塞進節點編號。併查集處理的是另一類問題：只加邊、問連通性或連通塊大小，用路徑壓縮 + 按秩合併做到近乎常數。

## 典型讀題訊號

- 網格或狀態間求最少步數／最小代價／最短時間。
- 每步代價全 1、只有 0/1，或任意非負：分別對應 BFS、0-1 BFS、Dijkstra。
- 節點需要附帶「剩餘資源、已收集集合、上一步方向」等額外狀態。
- 限制「最多經過 k 條邊」：Bellman-Ford 或分層。
- 只加邊問連通、連通塊大小、是否成環：併查集。


## C++ 模板或偽程式

\`\`\`cpp
// Dijkstra：非負權重，取出時驗證是否為過期項目
using PLI = pair<long long, int>;
priority_queue<PLI, vector<PLI>, greater<>> pq;
vector<long long> dist(n, LLONG_MAX);
dist[s] = 0;
pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) continue;  // 過期項目，跳過
    for (auto [v, w] : g[u])
        if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
}

// 併查集：路徑壓縮
int find(int x) {
    return f[x] == x ? x : f[x] = find(f[x]);
}
void uni(int a, int b) {
    f[find(a)] = find(b);
}
\`\`\`

## 常見錯誤

- visited／dist 只用位置當鍵，漏掉剩餘資源等狀態維度，把不同狀態當成同一個。
- 0-1 BFS 遇到權重 0 的邊沒有 push_front。
- Dijkstra 沒跳過 stale entry，重複擴展甚至得到錯誤結果。
- 有負權還硬用 Dijkstra；限制邊數卻沒用 Bellman-Ford。
- 併查集忘記路徑壓縮或按秩合併，退化成鏈。

## 建議練習順序

- 必修：743（Dijkstra）、787（限制邊數）、210（拓撲排序）。
- 進階：864（狀壓 BFS）、1786（Dijkstra + DP）、1319（併查集）。
- 挑戰：847（狀壓 BFS）、778（Dijkstra / 併查集 + 二分）、924（併查集）。

## 我能認出這個模式嗎？

- 節點狀態除了位置還需要哪些資訊？
- 邊權是 1、0/1，還是任意非負？有沒有負權或邊數限制？
- 這題其實只在問連通性嗎？那用併查集更簡單。
- priority_queue 取出時我有沒有驗證過期項目？`,
  },
  94008: {
    title: "字串進階",
    description:
      "Q4 的字串題超出「兩層迴圈比對」的範圍：字串雜湊做 O(1) 子串比較、KMP／Z 函數做線性匹配、字典樹處理前綴與 XOR、迴文技巧處理對稱結構。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

字串進階的核心是把「比較兩段子串是否相等」從 O(len) 壓成 O(1) 或整體線性。字串雜湊把子串映射成一個數，用前綴雜湊 O(1) 取任意子串的雜湊值；KMP 與 Z 函數靠預處理的失配／匹配函數，一次線性掃描完成模式匹配；字典樹（Trie）把一堆字串或二進位數按前綴組織起來，適合前綴查詢與最大異或。迴文問題則圍繞「以某中心對稱」或「前後綴相接」的結構展開。

## 核心直覺

暴力字串匹配之所以慢，是因為失配後把指標退回重來，浪費了已知資訊。KMP 的 next 陣列記錄「已匹配前綴的最長相等真前後綴」，失配時直接跳到該處，指標不回頭。字串雜湊則用一次預處理換來 O(1) 的任意子串比較，讓「二分答案 + 判斷是否存在長度 L 的重複子串」成為可能。01-Trie 把數字按二進位位插入，貪心地走「與當前位相反」的分支，就能求最大異或。

## 典型讀題訊號

- 在文本中找模式串出現位置或次數：KMP / Z 函數。
- 需要 O(1) 比較任意兩段子串是否相等：字串雜湊（雙雜湊更穩）。
- 一堆字串的前綴查詢、前後綴搜尋、詞典補全：字典樹。
- 最大／最小異或、異或值落在某範圍：01-Trie。
- 迴文、對稱、前後綴相接：中心擴展、Manacher 或雜湊。


## C++ 模板或偽程式

\`\`\`cpp
// 字串雜湊：前綴雜湊 + O(1) 取子串雜湊
const unsigned long long B = 131;
vector<unsigned long long> h(n + 1), p(n + 1, 1);
for (int i = 0; i < n; ++i) {
    h[i + 1] = h[i] * B + s[i];
    p[i + 1] = p[i] * B;
}
auto sub = [&](int l, int r) {  // [l, r) 的雜湊
    return h[r] - h[l] * p[r - l];
};

// KMP next 陣列
vector<int> nxt(m, 0);
for (int i = 1, j = 0; i < m; ++i) {
    while (j && t[i] != t[j]) j = nxt[j - 1];
    if (t[i] == t[j]) ++j;
    nxt[i] = j;
}
\`\`\`

## 常見錯誤

- 單雜湊容易被卡，比賽最好雙底數 / 雙模數。
- KMP 的 next 陣列邊界（\`j = nxt[j-1]\`）寫錯導致死迴圈。
- Trie 節點沒開夠或忘記記錄結尾標記。
- 中心擴展忘記同時處理奇數與偶數長度的迴文中心。
- 雜湊用有符號溢位、模數選太小造成碰撞。

## 建議練習順序

- 必修：28（KMP）、208（Trie）、647（迴文中心擴展）。
- 進階：214（KMP / 雜湊）、1044（二分 + 雜湊）、1707（01-Trie 離線）。
- 挑戰：336（迴文對）、745（前後綴 Trie）、1147（雜湊 + 貪心）。

## 我能認出這個模式嗎？

- 我需要的是「單次匹配」還是「反覆比較任意子串」？
- 前綴結構重要嗎？那可能是 Trie。
- 這是異或問題嗎？01-Trie 幾乎是首選。
- 迴文中心是單一字元還是兩字元之間？`,
  },
  94009: {
    title: "數學與數論",
    description:
      "Q4 常見的數學題型：快速冪與模逆元、組合數取模、容斥原理、質因數分解與篩法。關鍵是把計數或最佳化問題翻譯成一條可計算的式子。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

數論題的難點通常不在演算法，而在「把題目翻譯成式子」。組合計數題要先想清楚「這一步有幾種選擇、彼此獨不獨立」，再用乘法、加法、排列組合公式表達，最後對大質數（常見 1e9+7）取模。取模世界裡除法要換成乘上模逆元；逆元用費馬小定理（快速冪求 \`a^(p-2)\`）或擴展歐幾里得。容斥原理處理「至少滿足其中之一」這類重疊計數。質數與因數問題靠篩法或試除。

## 核心直覺

快速冪把 \`a^n\` 的 n 次乘法壓成 O(log n)：把指數看成二進位，逐位平方累乘。這個技巧不只算冪，也能做矩陣快速冪加速線性遞推。容斥的核心是「加上單個集合、減去兩兩交集、加回三三交集……」以消除重複。求 [1, N] 內是 a 或 b 倍數的個數，就是 \`N/a + N/b − N/lcm(a,b)\`，配合二分能解「第 N 個神奇數字」這類題。組合數取模則要預處理階乘與階乘逆元，做到 O(1) 查詢 \`C(n, k)\`。

## 典型讀題訊號

- 答案要對 1e9+7 取模，且是方案數：組合計數 + 模逆元。
- 「第 N 個滿足某整除性質的數」「不超過 X 且是 a 或 b 倍數的個數」：二分 + 容斥。
- 指數極大（1e9 以上）或線性遞推項數極大：快速冪 / 矩陣快速冪。
- 涉及最大公因數、最小公倍數、質因數分解：GCD、篩法。
- 需要頻繁查 \`C(n, k) mod p\`：預處理階乘逆元。


## C++ 模板或偽程式

\`\`\`cpp
const long long MOD = 1e9 + 7;
long long qpow(long long a, long long b, long long m) {
    long long r = 1;
    a %= m;
    for (; b; b >>= 1, a = a * a % m)
        if (b & 1) r = r * a % m;
    return r;
}
// 費馬小定理求逆元
long long inv(long long a) {
    return qpow(a, MOD - 2, MOD);
}

// 預處理階乘與逆元後 O(1) 查組合數
long long C(int n, int k) {
    if (k < 0 || k > n) return 0;
    return fac[n] * ifac[k] % MOD * ifac[n - k] % MOD;
}
\`\`\`

## 常見錯誤

- 取模除法直接用整數除，忘記改成乘模逆元。
- 快速冪或連乘中間結果溢位，未及時取模或未用 long long。
- 容斥漏項或符號錯（奇加偶減）。
- 篩法邊界或 lcm 溢位（\`a*b\` 前先除 gcd）。
- 組合數 k > n 或 k < 0 沒回傳 0。

## 建議練習順序

- 必修：50（快速冪）、172、204（數論基礎與篩法）。
- 進階：1201、878（二分 + 容斥）、2400（組合數 + 逆元）。
- 挑戰：920（組合 DP / 容斥）、952（質因數 + 併查集）、2513（二分 + 容斥）。

## 我能認出這個模式嗎？

- 這是計數題嗎？每一步的選擇彼此獨立嗎？
- 有沒有「至少滿足其一」的重疊，需要容斥？
- 指數或項數是否大到必須快速冪 / 矩陣快速冪？
- 需要頻繁取模除法時，逆元怎麼求？`,
  },
  94010: {
    title: "樹上進階技巧",
    description:
      "把「以每個節點為根各算一次」的 O(n²) 樹上問題，用一次 DFS 求出所有答案。核心是樹形 DP、換根 DP、樹的直徑與 LCA，配合父指標與子樹資訊合併。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

樹上問題的基礎是後序 DFS：先遞迴處理子樹，回到父節點時把各子樹的資訊合併。樹形 DP 就是給每個節點定義一個狀態（例如 \`dp[u][0/1]\` 表示 u 選或不選），從葉子往上轉移。樹的直徑（最長路徑）有兩種經典解法：兩次 BFS/DFS，或一次 DFS 維護「經過每個節點的最長 + 次長向下路徑」。LCA（最近公共祖先）則回答「兩點的公共祖先中最深的那個」，是許多路徑問題的基石。

## 核心直覺

很多題目要「以每個節點為根」算一次答案，暴力是 O(n²)。換根 DP的洞察是：先用一次 DFS 算出以某個固定根的答案，再用第二次 DFS，從父節點的答案 O(1) 推出每個子節點作為根的答案——因為換根只影響「這條邊兩側的貢獻」。這把 O(n²) 壓成 O(n)。樹形 DP 能成立，是因為子樹之間相互獨立，父節點只需要各子樹的摘要，不需要子樹的完整結構。

## 典型讀題訊號

- 對每個節點都要一個答案，且答案和「以它為根」有關：換根 DP。
- 選或不選、覆蓋、獨立集這類子樹可獨立決策：樹形 DP。
- 要找樹上最長路徑或最遠點對：樹的直徑。
- 反覆查兩點距離、路徑資訊、公共祖先：LCA（倍增或歐拉序 + RMQ）。
- 路徑計數、子樹統計：DFS 序 + 樹上差分。


## C++ 模板或偽程式

\`\`\`cpp
// 樹形 DP：打家劫舍 III 型（選 / 不選）
pair<long long, long long> dfs(int u, int parent) {
    long long rob = val[u], skip = 0;  // rob: 選 u；skip: 不選 u
    for (int v : g[u])
        if (v != parent) {
            auto [r, s] = dfs(v, u);
            rob += s;           // 選 u 則子節點不能選
            skip += max(r, s);  // 不選 u 則子節點自由
        }
    return {rob, skip};
}

// 換根 DP 第二次 DFS 的骨架
void reroot(int u, int parent) {
    for (int v : g[u])
        if (v != parent) {
            ans[v] = ans[u] + shift(u, v);  // 由父答案 O(1) 推子答案
            reroot(v, u);
        }
}
\`\`\`

## 常見錯誤

- DFS 忘記傳 parent，往回走造成無限遞迴。
- 遞迴太深爆棧：大樹要改迭代 DFS 或加大棧。
- 換根時「移出當前子樹貢獻、加回父側貢獻」的公式推錯。
- 直徑只維護最長向下路徑，忘了同時考慮「最長 + 次長」在該節點會合。
- LCA 忘記先把兩點提到同一深度。

## 建議練習順序

- 必修：236（LCA）、543（直徑 / 樹形 DP）、863（父指標 + BFS）。
- 進階：834（換根 DP）、310（樹的直徑 / 拓撲）、2246（樹形 DP）。
- 挑戰：979（樹形 DP）、2867（質數 + 併查集 / 樹上路徑計數）。

## 我能認出這個模式嗎？

- 答案是「對每個節點各算一次」嗎？那想想換根。
- 父節點需要子樹的哪個摘要就夠了？
- 這是直徑、路徑，還是子樹統計？
- 需要反覆查兩點關係嗎？那可能要 LCA。`,
  },
  94011: {
    title: "折半枚舉與分治",
    description:
      "當 n 太大無法 2^n 枚舉、卻小到 2^(n/2) 可行時，折半枚舉（meet in the middle）把指數砍半。分治則把問題拆成子問題，在合併階段統計跨越中點的貢獻。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

分治的骨架是「拆成兩半、各自遞迴解決、再合併」。歸併排序、快速選擇、逆序對計數都是分治：真正的巧思在合併階段——如何在 O(n) 或 O(n log n) 內統計「跨越左右兩半」的貢獻。折半枚舉是分治的近親，專治「n 約 40、2^n 太大但 2^20 可行」的題：把元素分成兩半，各自枚舉所有子集（各 2^(n/2) 種），再把兩半的結果配對（排序 + 二分，或雙指標）求答案。

## 核心直覺

\`2^40\` 不可行，但 \`2^20 ≈ 1e6\` 完全可行。折半的關鍵是：一個全集子集 = 左半子集 ∪ 右半子集，兩半獨立。所以先算出左半所有子集的和（或其它可加性統計量），排序；再枚舉右半每個子集，用二分在左半找最佳搭配。分治統計跨中點貢獻時同理：左半的每個元素要和右半的一段配對，先把兩半各自排好序，合併時用雙指標線性掃描，就能數出「左邊大於右邊兩倍」這類逆序型貢獻。

## 典型讀題訊號

- n 在 30～40 之間，要枚舉子集但 2^n 超時：折半枚舉。
- 求「最接近目標的子集和」「兩堆和之差最小」：折半 + 排序 + 二分。
- 統計逆序對、翻轉對、區間和落在某範圍的個數：歸併分治。
- 「所有加括號方式的結果」「按運算子拆分」：分治遞迴 + 記憶化。
- 兩個有序陣列合併後的第 k 小 / 中位數：分治二分。


## C++ 模板或偽程式

\`\`\`cpp
// 折半枚舉：左半所有子集和排序，右半枚舉後二分
vector<long long> L, R;
for (int m = 0; m < (1 << a); ++m) {  // 左半 a 個元素
    long long s = 0;
    for (int i = 0; i < a; ++i)
        if (m >> i & 1) s += nums[i];
    L.push_back(s);
}
sort(L.begin(), L.end());
long long best = LLONG_MAX;
for (int m = 0; m < (1 << b); ++m) {  // 右半 b 個元素
    long long s = 0;
    for (int i = 0; i < b; ++i)
        if (m >> i & 1) s += nums[a + i];
    auto it = lower_bound(L.begin(), L.end(), target - s);  // 在左半找最佳搭配
    if (it != L.end()) best = min(best, *it + s - target);
}
\`\`\`

## 常見錯誤

- 折半時兩半劃分或下標偏移錯，漏掉某些子集。
- 配對階段忘了同時檢查 lower_bound 命中點與它前一個位置。
- 歸併統計跨中點貢獻時，左右指標推進條件寫錯導致重算或漏算。
- 子集和可能很大或為負，未用 long long / 未處理負數。
- 分治遞迴沒有記憶化，導致重複子問題指數爆炸。

## 建議練習順序

- 必修：241（分治 + 記憶化）、912、148（歸併分治）。
- 進階：1755、2035（折半枚舉 + 二分）、805（折半 / 背包）。
- 挑戰：4（分治 / 二分求中位數）。

## 我能認出這個模式嗎？

- n 是不是剛好卡在 2^n 太大、2^(n/2) 可行的區間？
- 問題能不能拆成「左半 + 右半各自獨立枚舉」？
- 合併階段我要統計的跨中點貢獻是什麼？
- 需要記憶化避免重複子問題嗎？`,
  },
  94012: {
    title: "位元進階",
    description:
      "把集合壓成整數 mask，用子集枚舉、SOS DP 或 01-Trie 處理與 AND／OR／XOR 有關的計數與最佳化。關鍵是認出三種位運算各自的單調性與可壓縮性。",
    overview: `## 涵蓋主題

以下每個子主題皆有獨立說明頁；建議依序閱讀後，再進入「搭配追蹤題單」練習。


## 初學者先懂什麼

位運算的三個主角性質不同：OR 只會把 bit 從 0 變 1（單調增），AND 只會把 bit 從 1 變 0（單調減），XOR 是翻轉、沒有單調性。認清這點就能選對工具。集合可以壓成整數 mask，\`mask & (1 << i)\` 判斷第 i 個元素在不在。枚舉一個 mask 的所有子集有個經典寫法 \`for (int s = mask; s; s = (s - 1) & mask)\`。01-Trie 把數字按二進位位插入，是處理最大／最小異或的利器。

## 核心直覺

固定右端點時，所有以它結尾的子陣列 OR 值最多只有約 30 種——因為每往左擴一個元素，OR 的 bit 只能增加，而 bit 總數有限。AND 同理只能減少。這個「不同值很少」的性質讓一大類子陣列位運算題變成 O(n log V)。SOS DP（子集和 DP）在 O(n · 2^n) 內算出「每個 mask 的所有子集貢獻總和」。XOR 沒有單調性，但前綴 XOR 加 01-Trie 能貪心地逐位選相反方向，求出最大異或或統計異或落在範圍內的數對。

## 典型讀題訊號

- 題目直接出現 AND / OR / XOR / 子集 / mask。
- 子陣列的 OR、AND 值，或這些值的種類數：利用「不同值很少」。
- 最大異或、異或值在某範圍內的數對：01-Trie。
- 「對每個 mask 統計其所有子集的貢獻」：SOS DP。
- n ≤ 20 且要枚舉子集：子集枚舉 / 狀壓。


## C++ 模板或偽程式

\`\`\`cpp
// 枚舉 mask 的所有子集
for (int s = mask; s; s = (s - 1) & mask) {
    // s 是 mask 的一個非空子集
}

// 以每個右端點維護「所有子陣列 OR 值」的集合（去重後至多 ~30 個）
unordered_set<int> ors;
int cur = 0;
for (int x : nums) {
    unordered_set<int> next{x};
    for (int v : ors) next.insert(v | x);
    ors = move(next);  // ors 內是以當前元素結尾的所有 OR 值
}

// SOS DP：把每個 mask 累加其所有子集的值
for (int i = 0; i < B; ++i)
    for (int m = 0; m < (1 << B); ++m)
        if (m >> i & 1) f[m] += f[m ^ (1 << i)];
\`\`\`

## 常見錯誤

- 把 XOR 當成 OR / AND 一樣有單調性。
- mask 位數超過 int 範圍，\`1 << bit\` 溢位（要 \`1LL << bit\`）。
- 枚舉子集的寫法漏掉空集或多算全集。
- 滑動視窗維護 OR 時忘記按 bit 記頻次，導致移出元素時無法還原。
- AND 的初始值設成 0（應由第一個元素起算或用全 1）。

## 建議練習順序

- 必修：78（子集枚舉）、421（01-Trie / 線性基）、137（位元計數）。
- 進階：2044（子集枚舉）、898（OR 集合的對數性質）、260（XOR 分組）。
- 挑戰：982（SOS / 計數）、1803（01-Trie 統計異或範圍）。

## 我能認出這個模式嗎？

- 這題是 OR、AND 還是 XOR？它有沒有單調性？
- 不同的位運算結果值是否被 bit 數限制在很少個？
- 是異或問題嗎？01-Trie 能不能逐位貪心？
- mask 需要多少位？會不會溢位？`,
  },
};

export const Q4_SUBTOPICS: Record<number, Q4Subtopic[]> = {
  94005: [
    subRich(
      "區間 DP",
      "以 dp[l][r] 表示一段區間的最佳解，枚舉「最後合併／戳破哪一個」當作最後一步，短區間推長區間。",
      [
        "## 從一個問題出發",
        "把一排數字兩兩合併成一堆，每次合併的代價是兩堆之和，問合併成一堆的最小總代價（合併石頭類）。或者「戳氣球」：戳破第 i 顆得到 `left * i * right` 的硬幣，問全部戳破的最大收益。這類題的共同特徵是：**決策順序會互相影響**，某一步戳破誰，會改變它左右鄰居的貢獻。",
        "## 暴力法浪費在哪裡",
        "直接枚舉所有戳破順序是 O(n!)。但注意：一旦固定「哪一顆最後戳破」，它左右兩邊就變成兩個獨立子問題——因為最後戳破的那顆，此時左右鄰居正好是區間外的邊界。相同的子區間會在不同順序下被反覆計算，這正是 DP 的訊號。",
        "## 關鍵觀察：枚舉最後一步的分割點",
        "定義 `dp[l][r]` 為處理完區間 `[l, r]` 的最佳解。轉移時枚舉最後一個動作發生在哪個位置 k：",
        "```text\ndp[l][r] = 最佳 over k∈[l,r] { dp[l][k-1] + dp[k+1][r] + 該步的代價 }\n```",
        "戳氣球把 k 當成「最後戳破的那顆」，此時它的左右鄰居是 `l-1` 與 `r+1`（區間外的邊界），代價是 `nums[l-1]*nums[k]*nums[r+1]`。",
        "## 遍歷順序：短區間先算",
        "`dp[l][r]` 依賴更短的子區間 `dp[l][k-1]`、`dp[k+1][r]`，所以必須**按區間長度由小到大**填表，或按 l 從大到小、r 從小到大。順序錯就會讀到還沒算好的值。",
        "```cpp\nfor (int len = 1; len <= n; ++len)\n    for (int l = 0; l + len - 1 < n; ++l) {\n        int r = l + len - 1;\n        for (int k = l; k <= r; ++k)\n            dp[l][r] =\n                max(dp[l][r], (l ? dp[l][k - 1] : 0) + val(l - 1, k, r + 1) +\n                                  (k < r ? dp[k + 1][r] : 0));\n    }\n```",
        "## 什麼時候用區間 DP",
        "- 對一段連續區間做決策，答案取決於「先處理／最後處理哪一個」。",
        "- 合併、戳破、插入、括號匹配、回文分割。",
        "- n 通常不大（幾百），O(n³) 可接受。",
        "## 常見錯誤",
        "遍歷順序不是按長度遞增：讀到未算好的子區間。修正：外層迴圈枚舉 len。",
        "邊界（區間外的虛擬元素）處理錯：戳氣球要在兩端補 1。修正：明確定義 `l-1`、`r+1` 的取值。",
        "把 k 當成「第一步」而非「最後一步」：左右子問題不再獨立。修正：讓 k 是最後被處理的那個。",
      ].join("\n\n"),
    ),
    subRich(
      "數位 DP",
      "逐位決定數字，用 dp[pos][tight][state] 統計 [0, N] 內滿足某數位性質的數的個數。",
      [
        "## 從一個問題出發",
        "問 `[1, N]` 內有多少個數，其各位數字互不相同（統計特殊整數）？或有多少個數包含數字 1（數字 1 的個數）？N 可能高達 1e9，逐個檢查會超時。",
        "## 關鍵觀察：從高位到低位逐位填",
        "把 N 看成一串數字，從最高位開始逐位決定當前位填什麼。核心狀態有三個：",
        "- `pos`：目前填到第幾位。",
        "- `tight`（是否貼著上界）：如果前面每一位都填成和 N 一樣，這一位就不能超過 N 的對應位；一旦某位填得比 N 小，後面就自由了。",
        "- `state`：題目要求的額外資訊，例如「已用過哪些數字的 mask」「前一位是什麼」「目前是否還是前導零」。",
        "## 記憶化的關鍵：只快取 tight=false 的狀態",
        "當 `tight=true` 時每條路徑上界不同，無法共用；只有 `tight=false`（已自由）的子問題才能被不同前綴重複利用，快取它們即可。前導零要單獨用一個 flag，避免把 007 當成用了數字 0。",
        "```cpp\nint dp[12][1 << 10];  // pos, used-mask；僅在 !tight && !lead 時有效\nint dfs(int pos, int mask, bool tight, bool lead) {\n    if (pos == len) return lead ? 0 : 1;\n    if (!tight && !lead && dp[pos][mask] != -1) return dp[pos][mask];\n    int up = tight ? digit[pos] : 9, res = 0;\n    for (int d = 0; d <= up; ++d) {\n        if (mask >> d & 1) continue;  // 該數字已用過\n        bool nlead = lead && d == 0;\n        res +=\n            dfs(pos + 1, nlead ? 0 : mask | (1 << d), tight && d == up, nlead);\n    }\n    if (!tight && !lead) dp[pos][mask] = res;\n    return res;\n}\n```",
        "## 什麼時候用數位 DP",
        "- 問「[0, N] 或 [L, R] 內滿足某數位性質的數字個數」。",
        "- 性質只跟各位數字有關：不含連續 1、各位不同、數位和、含某數字。",
        "- 區間答案用 `f(R) - f(L-1)` 拆成兩次前綴查詢。",
        "## 常見錯誤",
        "把 tight=true 的狀態也拿去快取：不同上界互相污染。修正：只在 `!tight` 快取。",
        "忘記前導零 flag：把短數字的高位 0 誤當成使用了數字 0。修正：獨立 lead 標記。",
        "區間查詢忘了減去 L-1 的前綴。修正：`f(R) - f(L-1)`。",
      ].join("\n\n"),
    ),
  ],
  94006: [
    subRich(
      "值域樹狀陣列與逆序對",
      "把值離散化後在值域上做「單點加、前綴查」，一次掃描統計每個元素左／右有多少比它小或大。",
      [
        "## 從一個問題出發",
        "對每個元素，統計它右邊有多少個比它小的數（右側更小元素個數）。暴力對每個 i 往右掃是 O(n²)。",
        "## 關鍵觀察：把「比我小」變成值域上的前綴和",
        "從右往左掃描，維護一個「已經看過的元素」的值域計數器。處理到 `a[i]` 時，「右邊比 `a[i]` 小的個數」就是值域中 `[min, a[i]-1]` 的計數總和——這是一個前綴查詢。每看完一個元素就把它加進值域計數器（單點加）。樹狀陣列讓這兩個操作都是 O(log n)。",
        "## 離散化：值域太大先壓縮",
        "值可能高達 1e9，不能直接開陣列。把所有出現過的值排序去重，用它們的排名（rank）當作樹狀陣列的下標，值域大小就降到 n。",
        "```cpp\nvector<int> vals(a.begin(), a.end());\nsort(vals.begin(), vals.end());\nvals.erase(unique(vals.begin(), vals.end()), vals.end());\nauto rk = [&](int x) {\n    return lower_bound(vals.begin(), vals.end(), x) - vals.begin() + 1;\n};\n\nBIT bit(vals.size());\nvector<int> ans(n);\nfor (int i = n - 1; i >= 0; --i) {\n    ans[i] = bit.sum(rk(a[i]) - 1);  // 右邊已出現、且比 a[i] 小的個數\n    bit.add(rk(a[i]), 1);\n}\n```",
        "## 這個框架能解的變形",
        "- 逆序對總數：從右往左，累加 `sum(rk-1)`。",
        "- 翻轉對（`a[i] > 2*a[j]`）：查詢時對 `2*a[i]` 做離散化後的邊界查詢。",
        "- 區間和個數：對前綴和陣列做離散化 + 樹狀陣列。",
        "## 常見錯誤",
        "沒離散化直接開 1e9 陣列：MLE。修正：排序去重取 rank。",
        "查詢與插入順序反了，把自己算進去。修正：先查再插入（或先插再查，依題意）。",
        "翻轉對的 `2*a[j]` 溢位或離散化邊界錯。修正：用 long long 並小心 lower/upper_bound。",
      ].join("\n\n"),
    ),
    subRich(
      "線段樹與懶標記",
      "把區間拆成 O(log n) 個節點，支援區間更新與區間查詢；懶標記把更新延遲到真正需要下推時。",
      [
        "## 從一個問題出發",
        "反覆對區間 `[l, r]` 整段加一個值，又要隨時查某段的區間和或最大值。樹狀陣列做區間加區間和要技巧，線段樹則天生支援。",
        "## 關鍵觀察：懶標記——先記帳，晚下推",
        "區間加時，如果某個線段樹節點完整覆蓋在更新區間內，就不必遞迴到葉子，只在這個節點記一筆「懶標記」表示「我這棵子樹每個元素都還欠加 v」，並直接更新這個節點的區間和。等到之後查詢或更新需要進入它的子節點時，才把懶標記**下推**給兩個孩子。這讓區間更新也是 O(log n)。",
        "```cpp\nvoid pushDown(int node, int len) {\n    if (!lazy[node]) return;\n    for (int c : {node * 2, node * 2 + 1}) {\n        lazy[c] += lazy[node];\n        sum[c] += lazy[node] * (len / 2);  // 子區間長度\n    }\n    lazy[node] = 0;\n}\nvoid update(int node, int lo, int hi, int l, int r, long long v) {\n    if (r < lo || hi < l) return;\n    if (l <= lo && hi <= r) {\n        sum[node] += v * (hi - lo + 1);\n        lazy[node] += v;\n        return;\n    }\n    pushDown(node, hi - lo + 1);\n    int mid = (lo + hi) / 2;\n    update(node * 2, lo, mid, l, r, v);\n    update(node * 2 + 1, mid + 1, hi, l, r, v);\n    sum[node] = sum[node * 2] + sum[node * 2 + 1];\n}\n```",
        "## 什麼時候用線段樹而非樹狀陣列",
        "- 需要區間賦值、區間最大／最小、區間 gcd 等樹狀陣列難做的操作。",
        "- 掃描線問題：把矩形／區間事件排序後，用線段樹維護當前覆蓋。",
        "- 座標很大時先離散化，再對離散後的區間建樹。",
        "## 常見錯誤",
        "進入子節點前忘記 pushDown：查到過期的值。修正：update / query 遞迴前先下推。",
        "懶標記更新區間和時漏乘區間長度。修正：`sum += v * 區間長度`。",
        "區間賦值與區間加混用時懶標記合併規則寫錯。修正：定義清楚兩種標記的優先順序。",
      ].join("\n\n"),
    ),
  ],
  94007: [
    subRich(
      "分層圖與狀態最短路",
      "把「還能用幾次特殊操作」或「已收集哪些鑰匙」加進節點，等於複製多層圖，再在擴充狀態上跑 BFS／Dijkstra。",
      [
        "## 從一個問題出發",
        "最多能免費坐 k 段的航班中，求從起點到終點的最低票價（K 站中轉）。或在網格中收集所有鑰匙才能開對應的門，求最短步數（獲取所有鑰匙的最短路徑）。這些題的「位置」不足以描述狀態。",
        "## 關鍵觀察：狀態 = 位置 + 附加資訊",
        "把節點從「位置」擴充成「位置 + 附加狀態」。K 站中轉裡狀態是 `(城市, 已用中轉次數)`；收集鑰匙裡狀態是 `(格子, 已收集鑰匙的 mask)`。擴充後，同一個位置在不同附加狀態下是**不同節點**，於是普通最短路演算法就能直接套用。",
        "## 分層圖的兩種實作",
        "- 顯式分層：真的建 `k+1` 層圖，第 t 層到第 t+1 層連特殊邊。",
        "- 隱式狀態：不建圖，直接讓 `dist[state]` 的 state 帶上附加維度。收集鑰匙用 `dist[row][col][mask]`，BFS 逐層擴展。",
        "```cpp\n// 收集所有鑰匙：狀態 BFS，visited 帶上鑰匙 mask\nqueue<tuple<int, int, int>> q;  // row, col, keyMask\nq.push({sr, sc, 0});\nseen.insert({sr, sc, 0});\nint steps = 0, full = (1 << numKeys) - 1;\nwhile (!q.empty()) {\n    for (int sz = q.size(); sz; --sz) {\n        auto [r, c, mask] = q.front();\n        q.pop();\n        if (mask == full) return steps;\n        for (auto [nr, nc] : neighbors(r, c)) {\n            int nmask = mask;\n            if (isKey(nr, nc)) nmask |= keyBit(nr, nc);\n            if (isLock(nr, nc) && !(mask >> lockBit(nr, nc) & 1)) continue;\n            if (seen.insert({nr, nc, nmask}).second) q.push({nr, nc, nmask});\n        }\n    }\n    ++steps;\n}\n```",
        "## 什麼時候用分層／狀態最短路",
        "- 有「最多 k 次某操作」「必須先收集某些東西」的限制。",
        "- 附加狀態的取值數量不大（次數 ≤ 幾百、鑰匙 ≤ 6～10 個）。",
        "- 邊權全 1 用 BFS，非負用 Dijkstra，含次數限制可用 Bellman-Ford。",
        "## 常見錯誤",
        "visited 只記位置，忽略附加狀態，導致把不同狀態當同一個而漏解。修正：visited 帶完整狀態。",
        "附加狀態空間爆炸（鑰匙太多、次數太大）。修正：確認狀態數在可接受範圍。",
        "K 站中轉用普通 Dijkstra 而不限制邊數，得到用了太多中轉的解。修正：狀態加入中轉次數或用 Bellman-Ford 迭代 k 次。",
      ].join("\n\n"),
    ),
    subRich(
      "併查集",
      "只加邊、問連通性或連通塊資訊時，用路徑壓縮 + 按秩合併做到近乎常數，並可維護連通塊大小、數量。",
      [
        "## 從一個問題出發",
        "給一堆連線，問把整個網路連通至少要移動幾條多餘的線（連通網路的操作次數）；或每次合併兩個集合，隨時查連通塊數量與大小。這些都只「加邊、查連通」，不刪邊。",
        "## 關鍵觀察：只在乎連通性時，別建完整圖",
        "如果題目只問「這兩點連不連通」「有幾個連通塊」「最大連通塊多大」，而且邊只增不減，那併查集比 BFS/DFS 更輕。每個元素記一個「父指標」，同一集合的元素最終指向同一個根。",
        "```cpp\nint f[N], sz[N], comps;\nvoid init(int n) {\n    comps = n;\n    for (int i = 0; i < n; ++i) {\n        f[i] = i;\n        sz[i] = 1;\n    }\n}\nint find(int x) {\n    return f[x] == x ? x : f[x] = find(f[x]);\n}  // 路徑壓縮\nbool uni(int a, int b) {\n    a = find(a);\n    b = find(b);\n    if (a == b) return false;       // 已連通\n    if (sz[a] < sz[b]) swap(a, b);  // 按秩合併\n    f[b] = a;\n    sz[a] += sz[b];\n    --comps;\n    return true;\n}\n```",
        "## 這個框架能解的變形",
        "- 連通網路操作次數：若「多餘邊數 ≥ 連通塊數 - 1」則答案是 `comps - 1`，否則 -1。",
        "- 惡意軟體傳播：刪掉某節點後看連通塊，用併查集算每個塊的大小與「初始感染數」。",
        "- 質因數分組：952 把每個數和它的質因數 union，求最大連通塊。",
        "- 帶權併查集 / 種類並查集處理「敵人的敵人」類關係。",
        "## 什麼時候用併查集",
        "- 操作是「合併集合」+「查連通」，且不需要刪邊。",
        "- 要動態維護連通塊數量或大小。",
        "- 離線時可把邊排序後逐步 union（如 Kruskal、按邊權加入）。",
        "## 常見錯誤",
        "只做路徑壓縮不按秩合併（或反之），最壞退化成鏈。修正：兩者都用。",
        "find 寫成非壓縮的遞迴，效率差。修正：`f[x]=find(f[x])`。",
        "需要刪邊卻用併查集：併查集不支援刪邊。修正：改離線倒序或可回滾併查集。",
      ].join("\n\n"),
    ),
  ],
  94008: [
    subRich(
      "字串雜湊",
      "用前綴雜湊把任意子串映射成一個數，O(1) 比較兩段子串是否相等，配合二分能找最長重複子串。",
      [
        "## 從一個問題出發",
        "在一個字串裡找最長的、至少出現兩次的子串（最長重複子串）。暴力枚舉長度再逐一比較是 O(n³)。",
        "## 關鍵觀察：子串相等 ⇒ 雜湊相等",
        "把字串看成一個 base 進制的大數，前綴雜湊 `h[i]` 是前 i 個字元組成的數。任意子串 `[l, r)` 的雜湊值可以 O(1) 由 `h[r] - h[l] * base^(r-l)` 算出。於是「兩段子串是否相等」變成「兩個數是否相等」，O(1)。",
        "## 二分答案 + 雜湊：長度具單調性",
        "如果存在長度 L 的重複子串，那長度 L-1 的也一定存在（取其前綴）。這個單調性讓我們二分答案 L：對每個 L，把所有長度 L 的子串雜湊丟進雜湊表，看有沒有碰撞。",
        "```cpp\nauto check = [&](int L) -> int {  // 回傳某個長度 L 的重複子串起點，或 -1\n    unordered_set<unsigned long long> seen;\n    for (int i = 0; i + L <= n; ++i) {\n        unsigned long long hv = sub(i, i + L);\n        if (!seen.insert(hv).second) return i;\n    }\n    return -1;\n};\nint lo = 1, hi = n, ansPos = -1, ansLen = 0;\nwhile (lo <= hi) {\n    int mid = (lo + hi) / 2, pos = check(mid);\n    if (pos >= 0) {\n        ansLen = mid;\n        ansPos = pos;\n        lo = mid + 1;\n    } else\n        hi = mid - 1;\n}\n```",
        "## 降低碰撞：雙雜湊",
        "單一底數／模數容易被構造資料卡出碰撞。比賽建議用兩組不同的 (base, mod)，把兩個雜湊值拼成一個 pair 或一個 128 位數比較。",
        "## 什麼時候用字串雜湊",
        "- 需要反覆比較任意兩段子串是否相等。",
        "- 「最長重複子串」「不同子串個數」「判斷迴文」。",
        "- 二分答案的判定函數需要 O(1) 子串比較。",
        "## 常見錯誤",
        "單雜湊被卡。修正：雙雜湊或隨機底數。",
        "`h[r] - h[l]*p[r-l]` 的冪次或下標算錯。修正：仔細對齊前綴定義。",
        "用有符號類型溢位行為不確定。修正：用 `unsigned long long` 自然溢位或明確取模。",
      ].join("\n\n"),
    ),
    subRich(
      "01-Trie 與最大異或",
      "把數字按二進位位插入字典樹，查詢時貪心地走與當前位相反的分支，求最大異或或統計異或落在範圍。",
      [
        "## 從一個問題出發",
        "給一組數，問任兩個數異或的最大值（陣列中兩個數的最大異或值）。暴力兩兩配對是 O(n²)。",
        "## 關鍵觀察：異或最大 ⇒ 每一位盡量取 1",
        "異或的每一位獨立：要讓結果大，就從最高位開始，每一位都希望兩數在該位不同（異或得 1）。把所有數按二進位從高位到低位插入一棵 01-Trie（每個節點兩個孩子：0 和 1）。查詢某個數 x 的最佳搭配時，在每一位都優先走「與 x 該位相反」的分支；走得通就這一位得 1。",
        "```cpp\nstruct Trie {\n    int ch[MAXBIT * N][2], idx = 0;\n    void insert(int x) {\n        int u = 0;\n        for (int b = MAXBIT - 1; b >= 0; --b) {\n            int bit = x >> b & 1;\n            if (!ch[u][bit]) ch[u][bit] = ++idx;\n            u = ch[u][bit];\n        }\n    }\n    int query(int x) {  // 與 x 異或的最大值\n        int u = 0, res = 0;\n        for (int b = MAXBIT - 1; b >= 0; --b) {\n            int bit = x >> b & 1;\n            if (ch[u][bit ^ 1]) {\n                res |= 1 << b;\n                u = ch[u][bit ^ 1];\n            } else\n                u = ch[u][bit];\n        }\n        return res;\n    }\n};\n```",
        "## 進階：帶限制與範圍統計",
        "- 1707 與陣列中元素的最大異或值：對查詢按上限離線排序，逐步把 ≤ 限制的數插入 Trie。",
        "- 1803 統計異或值在範圍內的數對：在 Trie 節點記子樹大小，用「異或 < 上界」的計數技巧，`count(high) - count(low-1)`。",
        "## 什麼時候用 01-Trie",
        "- 求最大／最小異或、異或值落在某範圍。",
        "- 前綴 XOR 配 Trie 處理「子陣列異或」問題。",
        "- 需要離線按值域限制逐步插入。",
        "## 常見錯誤",
        "位數 MAXBIT 開太小，漏掉高位。修正：依值域上限決定位數。",
        "`1 << b` 在大位數溢位。修正：必要時 `1LL << b`。",
        "範圍統計時邊界（< 還是 ≤）處理錯。修正：用 `count(R) - count(L-1)`。",
      ].join("\n\n"),
    ),
  ],
  94009: [
    subRich(
      "快速冪與模逆元",
      "把 a^n 的 n 次乘法壓成 O(log n)；取模世界的除法用費馬小定理求逆元代替。",
      [
        "## 從一個問題出發",
        "算 `a^n mod p`，n 高達 1e9；或在計數題裡要算 `C(n, k) mod p`，其中涉及除以階乘。直接連乘會超時，直接除法在取模下也不成立。",
        "## 關鍵觀察：指數的二進位分解",
        "`a^13 = a^8 · a^4 · a^1`，因為 13 = 1101₂。逐位處理指數：底數不斷平方（`a, a², a⁴, a⁸…`），當指數該位是 1 時就把當前底數乘進答案。這樣只要 O(log n) 次乘法。",
        "```cpp\nlong long qpow(long long a, long long b, long long m) {\n    long long r = 1;\n    a %= m;\n    for (; b; b >>= 1, a = a * a % m)\n        if (b & 1) r = r * a % m;\n    return r;\n}\n```",
        "## 取模除法 = 乘上逆元",
        "在模質數 p 下，`a / b mod p` 不能直接整除，要乘上 b 的模逆元 `b^(p-2)`（費馬小定理，p 為質數）。所以組合數 `C(n,k) = n! / (k!(n-k)!)` 取模時，預處理階乘 `fac[]` 與階乘逆元 `ifac[]`，就能 O(1) 查詢。",
        "```cpp\nvector<long long> fac(N), ifac(N);\nfac[0] = 1;\nfor (int i = 1; i < N; ++i) fac[i] = fac[i - 1] * i % MOD;\nifac[N - 1] = qpow(fac[N - 1], MOD - 2, MOD);\nfor (int i = N - 1; i > 0; --i) ifac[i - 1] = ifac[i] * i % MOD;\nauto C = [&](int n, int k) {\n    return k < 0 || k > n ? 0 : fac[n] * ifac[k] % MOD * ifac[n - k] % MOD;\n};\n```",
        "## 延伸：矩陣快速冪",
        "線性遞推（如費波那契、學生出勤記錄 II）可以寫成「狀態向量乘一個轉移矩陣」。要算第 n 項就是把轉移矩陣做 n 次冪——用同樣的快速冪骨架，把「乘法」換成「矩陣乘法」，O(k³ log n)。",
        "## 常見錯誤",
        "取模除法直接整除。修正：乘模逆元。",
        "`a * a` 在取模前溢位。修正：用 long long 並每步取模。",
        "逆元用非質數模數的費馬小定理。修正：非質數模用擴展歐幾里得。",
        "組合數 k 越界沒回傳 0。修正：先判 `k<0||k>n`。",
      ].join("\n\n"),
    ),
    subRich(
      "容斥原理",
      "「至少滿足其一」的計數，用加單個、減兩兩交、加三三交……消除重複，常配合二分求第 N 個。",
      [
        "## 從一個問題出發",
        "求第 N 個能被 a 或 b 整除的數（第 N 個神奇數字）；或 `[1, X]` 內是 2、3、5 任一倍數的個數。直接列舉太慢。",
        "## 關鍵觀察：先數出 [1, X] 內的個數，再二分",
        "`[1, X]` 內是 a 或 b 倍數的個數 = `X/a + X/b − X/lcm(a,b)`——加上各自的倍數，再減去被重複計算的公倍數。這個計數對 X 單調遞增，於是可以二分 X，找「恰好累積到第 N 個」的位置。",
        "```cpp\nlong long lcm(long long a, long long b) {\n    return a / __gcd(a, b) * b;\n}\nauto count = [&](long long x) { return x / a + x / b - x / lcm(a, b); };\nlong long lo = 1, hi = (long long)N * min(a, b);\nwhile (lo < hi) {\n    long long mid = (lo + hi) / 2;\n    if (count(mid) >= N)\n        hi = mid;\n    else\n        lo = mid + 1;\n}\n// lo 即第 N 個神奇數字\n```",
        "## 多集合容斥的符號規律",
        "三個以上集合時：加上所有單集合、減去所有兩兩交集、加回所有三集合交集……奇數個集合的交是加、偶數個是減。可以用枚舉子集 mask，依 popcount 的奇偶決定正負。",
        "## 什麼時候用容斥",
        "- 「至少滿足其中之一」「是某些數之一的倍數」的計數。",
        "- 計數對某參數單調，可配二分求第 k 個或最小可行值。",
        "- 「總數 − 不合法數」比直接數合法數容易時。",
        "## 常見錯誤",
        "漏掉交集項或符號寫反。修正：用 popcount 奇偶統一決定正負。",
        "`lcm` 計算 `a*b` 先乘再除導致溢位。修正：`a / gcd * b`。",
        "二分上界 hi 太小，答案落在範圍外。修正：`hi = N * min(a,b)` 之類的安全上界。",
      ].join("\n\n"),
    ),
  ],
  94010: [
    subRich(
      "換根 DP",
      "先一次 DFS 算出固定根的答案，再一次 DFS 從父節點 O(1) 推出每個節點作為根的答案，把 O(n²) 壓成 O(n)。",
      [
        "## 從一個問題出發",
        "求「每個節點到所有其他節點的距離總和」（樹中距離之和）。對每個節點各跑一次 BFS 是 O(n²)，n 大就超時。",
        "## 關鍵觀察：換根只影響一條邊兩側",
        "先隨便選一個根（例如 0），一次 DFS 算出 `ans[0]`（根到所有點的距離和）以及每棵子樹的大小 `sz[u]`。接著考慮把根從 u 換到它的孩子 v：v 這一側的所有 `sz[v]` 個節點離根近了 1，另一側的 `n - sz[v]` 個節點遠了 1。於是：",
        "```text\nans[v] = ans[u] - sz[v] + (n - sz[v])\n```",
        "第二次 DFS 就用這條 O(1) 公式，從父節點的答案推出每個子節點的答案。",
        "```cpp\nvoid dfs1(int u, int p, int depth) {  // 算 sz 與 ans[root]\n    sz[u] = 1;\n    ans[0] += depth;\n    for (int v : g[u])\n        if (v != p) {\n            dfs1(v, u, depth + 1);\n            sz[u] += sz[v];\n        }\n}\nvoid dfs2(int u, int p) {  // 換根推每個節點\n    for (int v : g[u])\n        if (v != p) {\n            ans[v] = ans[u] - sz[v] + (n - sz[v]);\n            dfs2(v, u);\n        }\n}\n```",
        "## 換根 DP 的一般步驟",
        "1. 第一次 DFS（後序）：算出以固定根的答案，以及各子樹的摘要（大小、最大深度、計數…）。",
        "2. 推導「父 → 子」的換根轉移：移出當前子樹的貢獻、加上父側的貢獻。",
        "3. 第二次 DFS（前序）：用轉移把答案傳遞到每個節點。",
        "## 什麼時候用換根 DP",
        "- 要對每個節點都算一個「以它為根」的答案。",
        "- 該答案能由父節點答案加一條邊的調整量 O(1) 推出。",
        "- 例：所有點距離和、最長路徑端點、子樹外資訊。",
        "## 常見錯誤",
        "換根轉移公式沒把「兩側各自的貢獻變化」算全。修正：明確寫出近了誰、遠了誰。",
        "第二次 DFS 用錯遍歷序（該前序卻寫後序）。修正：先更新 v 再遞迴 v。",
        "需要「次大值」卻只維護最大值，換根到最大值來源的分支時出錯。修正：同時記錄最大與次大。",
      ].join("\n\n"),
    ),
    subRich(
      "樹的直徑",
      "樹上最長路徑，可用兩次 DFS 或一次 DFS 維護「每個節點向下的最長 + 次長路徑」求出。",
      [
        "## 從一個問題出發",
        "求一棵樹裡最長的一條簡單路徑有多長（樹的直徑）；或相鄰字元不同的最長路徑（樹形 DP 變形）。",
        "## 解法一：兩次 DFS/BFS",
        "從任意點出發找最遠點 A，再從 A 出發找最遠點 B，`A–B` 就是直徑。直覺是：離任意點最遠的點，必是某條直徑的端點。這個方法簡潔，但只適用邊權非負的樹。",
        "## 解法二：一次 DFS 維護最長 + 次長",
        "更通用的是樹形 DP。對每個節點 u，計算「從 u 往下走能到的最長路徑」`down[u]`。經過 u 的最長路徑，是它兩個孩子方向的「最長 + 次長」向下路徑接起來。一邊 DFS 一邊用所有節點的「最長 + 次長」更新全域答案。",
        "```cpp\nint diameter = 0;\nint dfs(int u, int p) {  // 回傳 u 往下的最長路徑長度（邊數）\n    int max1 = 0, max2 = 0;\n    for (int v : g[u])\n        if (v != p) {\n            int d = dfs(v, u) + 1;\n            if (d > max1) {\n                max2 = max1;\n                max1 = d;\n            } else if (d > max2)\n                max2 = d;\n        }\n    diameter = max(diameter, max1 + max2);  // 經過 u 的最長路徑\n    return max1;\n}\n```",
        "## 為什麼要「最長 + 次長」",
        "經過某節點的最長路徑要往兩個不同的孩子方向延伸，所以需要它向下的前兩長路徑；只維護最長會漏掉「拐彎經過該節點」的情形。這也是 543 二元樹直徑、2246 最長路徑的統一框架。",
        "## 什麼時候用直徑技巧",
        "- 求樹上最長路徑或最遠點對。",
        "- 「經過某節點、往兩個子樹方向會合」的最長／最優路徑。",
        "- 310 最小高度樹：直徑中點就是最小高度樹的根。",
        "## 常見錯誤",
        "只維護最長向下路徑，忘了次長，漏掉拐彎路徑。修正：同時記 max1、max2。",
        "邊權有負時用兩次 DFS 法（不成立）。修正：改樹形 DP。",
        "混淆「邊數」與「節點數」的長度定義。修正：統一以邊數或節點數計。",
      ].join("\n\n"),
    ),
  ],
  94011: [
    subRich(
      "折半枚舉",
      "n 約 40 時，把元素分兩半各枚舉 2^(n/2) 個子集，再把兩半結果排序後二分配對，求最接近目標的組合。",
      [
        "## 從一個問題出發",
        "從 n（約 40）個數裡選一個子集，使子集和最接近 target（最接近目標值的子序列和）。`2^40` 太大，但 `2^20 ≈ 1e6` 完全可行。",
        "## 關鍵觀察：一個子集 = 左半子集 + 右半子集",
        "把 n 個數分成兩半 A、B（各約 n/2 個）。任何一個全集子集，都能唯一拆成「A 的某子集」加「B 的某子集」，兩者獨立。所以：先枚舉 A 的所有 `2^|A|` 個子集和，存進陣列並排序；再枚舉 B 的每個子集和 s，在排好序的 A 和裡二分找最接近 `target - s` 的值。",
        "```cpp\nvector<long long> sumsA;  // A 的所有子集和\nfor (int m = 0; m < (1 << a); ++m) {\n    long long s = 0;\n    for (int i = 0; i < a; ++i)\n        if (m >> i & 1) s += A[i];\n    sumsA.push_back(s);\n}\nsort(sumsA.begin(), sumsA.end());\nlong long best = LLONG_MAX;\nfor (int m = 0; m < (1 << b); ++m) {\n    long long s = 0;\n    for (int i = 0; i < b; ++i)\n        if (m >> i & 1) s += B[i];\n    long long need = target - s;\n    auto it = lower_bound(sumsA.begin(), sumsA.end(), need);\n    if (it != sumsA.end()) best = min(best, llabs(*it + s - target));\n    if (it != sumsA.begin()) best = min(best, llabs(*prev(it) + s - target));\n}\n```",
        "## 配對階段要檢查兩側",
        "`lower_bound` 找到的是第一個 ≥ need 的位置，但最接近的值也可能是它前一個（< need）。所以命中點和它前一位都要比。",
        "## 什麼時候用折半枚舉",
        "- n 卡在 30～40：`2^n` 超時但 `2^(n/2)` 可行。",
        "- 求「最接近目標的子集和」「兩堆和之差最小」「湊出某值的方案」。",
        "- 兩半可獨立枚舉、再用可加性統計量配對。",
        "## 常見錯誤",
        "只比 lower_bound 命中點，漏掉前一位。修正：命中點與前一位都比。",
        "兩半劃分或下標偏移錯。修正：明確 A 是前 a 個、B 是後 b 個。",
        "子集和溢位或未考慮負數。修正：long long，排序後二分照樣適用。",
      ].join("\n\n"),
    ),
    subRich(
      "分治與合併統計",
      "把序列拆成左右兩半各自遞迴，關鍵在合併階段用雙指標線性統計「跨越中點」的貢獻。",
      [
        "## 從一個問題出發",
        "統計逆序對，或翻轉對 `a[i] > 2*a[j]` 且 `i < j` 的個數。除了樹狀陣列，歸併分治是另一條經典路線。",
        "## 關鍵觀察：貢獻按「是否跨中點」分類",
        "把陣列從中間切成左右兩半。任何一對 `(i, j)` 要嘛都在左半、都在右半（遞迴解決），要嘛 i 在左、j 在右（跨中點，在合併階段統計）。分治的精髓就是：遞迴解決兩側，再高效地數出跨中點的貢獻。",
        "## 合併階段用雙指標，因為兩半已排好序",
        "歸併排序在合併前，左右兩半各自已排序。統計翻轉對時，對左半每個 i，右半中滿足 `a[i] > 2*a[j]` 的 j 是一個前綴——因為右半有序，用一個隨 i 單調前進的指標線性數出，不必重掃。數完再做標準歸併把兩半合併成有序。",
        "```cpp\nlong long merge_count(vector<int>& a, int lo, int mid, int hi) {\n    long long cnt = 0;\n    int j = mid + 1;\n    for (int i = lo; i <= mid; ++i) {  // 統計跨中點翻轉對\n        while (j <= hi && (long long)a[i] > 2LL * a[j]) ++j;\n        cnt += j - (mid + 1);\n    }\n    inplace_merge(a.begin() + lo, a.begin() + mid + 1,\n                  a.begin() + hi + 1);  // 保持有序\n    return cnt;\n}\n```",
        "## 什麼時候用分治合併統計",
        "- 逆序對、翻轉對、區間和落在某範圍的個數。",
        "- 「所有加括號方式」「按運算子拆分」用分治遞迴 + 記憶化（241）。",
        "- 兩個有序陣列的第 k 小 / 中位數用分治二分（4）。",
        "## 常見錯誤",
        "統計指標 j 每次都從頭掃，退化成 O(n²)。修正：利用有序性讓 j 單調前進。",
        "統計與歸併的順序或邊界弄混，導致重算或漏算。修正：先統計跨中點貢獻再合併。",
        "翻轉對 `2*a[j]` 溢位。修正：用 long long 比較。",
      ].join("\n\n"),
    ),
  ],
  94012: [
    subRich(
      "子集枚舉與 SOS DP",
      "枚舉一個 mask 的所有子集，或用子集和 DP（SOS）在 O(n·2^n) 內算出每個 mask 對其所有子集的貢獻。",
      [
        "## 從一個問題出發",
        "統計按位與為零的三元組 `(i, j, k)`，即 `nums[i] & nums[j] & nums[k] == 0`（982）。值域是 `2^16`，暴力三重迴圈 O(n³) 太慢。",
        "## 子集枚舉的經典寫法",
        "枚舉 mask 的所有子集，用 `for (int s = mask; s; s = (s - 1) & mask)`：每次把 s 減 1 再和 mask 相與，能不重不漏地走遍所有非空子集。所有 mask 的子集總數是 `3^n`（每位有「在 mask、在 s、都不在」三種狀態）。",
        "```cpp\nfor (int mask = 0; mask < (1 << n); ++mask)\n    for (int s = mask; s; s = (s - 1) & mask) {\n        // s 是 mask 的一個非空真子集或本身\n    }\n```",
        "## SOS DP：每個 mask 累加所有子集的值",
        "「Sum over Subsets」在 O(n·2^n) 內，對每個 mask 算出「其所有子集 f 值之和」。做法是逐位處理：對第 i 位，若 mask 含該位，就把去掉該位的子集貢獻加進來。982 的解法是先算兩兩 AND 的計數，再用 SOS 統計「與某值 AND 為 0（即是其補集子集）」的第三個數個數。",
        "```cpp\n// f[mask] 初始為值等於 mask 的元素個數；跑完後 f[mask] = 所有子集計數和\nfor (int i = 0; i < B; ++i)\n    for (int m = 0; m < (1 << B); ++m)\n        if (m >> i & 1) f[m] += f[m ^ (1 << i)];\n```",
        "## 什麼時候用子集枚舉 / SOS",
        "- n ≤ 20 且要枚舉「已選集合」：狀壓 + 子集轉移。",
        "- 「對每個 mask 統計其子集／超集的貢獻」：SOS DP。",
        "- AND / OR 為特定值的配對或三元組計數。",
        "## 常見錯誤",
        "子集枚舉迴圈漏掉空集或寫成死迴圈。修正：用標準 `s = (s-1) & mask` 寫法，需要空集時另外處理。",
        "SOS 的位迴圈與 mask 迴圈內外層寫反。修正：外層枚舉位、內層枚舉 mask。",
        "值域位數 B 設錯導致陣列過大或漏值。修正：依題目值域上限決定 B。",
      ].join("\n\n"),
    ),
    subRich(
      "子陣列 OR/AND 的有限性",
      "固定右端點時，以它結尾的所有子陣列 OR（或 AND）值只有約 30 種，據此把子陣列位運算題壓到 O(n log V)。",
      [
        "## 從一個問題出發",
        "求一個陣列所有子陣列的按位 OR 有多少種不同的值（子陣列按位或操作，898）。子陣列有 O(n²) 個，但答案值域有限。",
        "## 關鍵觀察：OR 只增、AND 只減，所以種類很少",
        "固定右端點 r，考慮所有以 r 結尾的子陣列 `[l, r]` 的 OR 值。當 l 從 r 往左移，OR 值只可能把某些 bit 從 0 變 1，絕不會變回去。一個數最多 ~30 個 bit，所以「以 r 結尾的不同 OR 值」最多約 30 個。AND 同理只會把 bit 從 1 變 0，種類也 ≤ 30。",
        "## 維護「以當前元素結尾的所有 OR 值」集合",
        "從左到右掃，維護一個集合 `cur`，表示以前一個元素結尾的所有子陣列 OR 值。加入新元素 x 時，新的集合是 `{x} ∪ {v | x : v ∈ cur}`。這個集合大小 ≤ 30，所以每步 O(30)，總體 O(n·30)。把每步產生的值丟進全域集合即可統計不同值個數。",
        "```cpp\nunordered_set<int> distinct;\nvector<int> cur;  // 以上一個元素結尾的所有 OR 值（去重）\nfor (int x : nums) {\n    vector<int> next{x};\n    for (int v : cur) {\n        int nv = v | x;\n        if (nv != next.back()) next.push_back(nv);  // OR 值遞增，相鄰去重\n    }\n    cur = move(next);\n    for (int v : cur) distinct.insert(v);\n}\n// distinct.size() 即不同 OR 值的個數\n```",
        "## 這個框架能解的變形",
        "- 統計不同的子陣列 OR / AND 值個數。",
        "- 找「OR 值 ≥ 目標」的最短子陣列。",
        "- 2411 每個下標為右端點時、OR 達到後綴最大值的最短子陣列。",
        "## 什麼時候用這個技巧",
        "- 子陣列的 OR 或 AND 相關（值、種類數、達標最短長度）。",
        "- 值域被 bit 數限制（~30 位）。",
        "## 常見錯誤",
        "把 XOR 也套這個框架（XOR 沒有單調性，種類不受限）。修正：XOR 改用前綴 XOR / Trie。",
        "集合不去重導致大小膨脹。修正：利用 OR 遞增性相鄰去重。",
        "滑動視窗維護 OR 時直接減元素（OR 不可逆）。修正：改用本框架或按 bit 記頻次。",
      ].join("\n\n"),
    ),
  ],
};

export function overviewSectionId(topicId: number): number {
  return topicId * 100;
}

export function subtopicSectionId(topicId: number, index: number): number {
  return topicId * 100 + index + 1;
}

export function practiceSectionId(topicId: number): number {
  return topicId * 10 + 9;
}

function isDuplicateTopicCard(subtopic: Q4Subtopic, topicTitle: string) {
  return subtopic.title.trim() === topicTitle.trim();
}

function buildSubtopicGuide(subtopics: Q4Subtopic[]) {
  if (subtopics.length === 0) {
    return "## 涵蓋主題\n\n本模式的重點已整合在下方總覽與題表中；先確認讀題訊號，再依必修、進階、挑戰順序練習。";
  }

  const rows = subtopics
    .map(
      (subtopic, index) =>
        `${index + 1}. **${subtopic.title}**：${subtopic.blurb}`,
    )
    .join("\n");

  return `## 涵蓋主題\n\n模式總覽先整理核心直覺與讀題訊號；下面只列出需要獨立展開的細分技巧，模式本身的基礎概念已併入本頁總覽。\n\n${rows}`;
}

function enrichOverviewWithSubtopicGuide(
  overview: string,
  subtopics: Q4Subtopic[],
) {
  const guide = buildSubtopicGuide(subtopics);
  const withGuide = overview.replace(
    /^## 涵蓋主題\n\n[\s\S]*?(?=\n\n## )/,
    guide,
  );

  return withGuide === overview ? `${guide}\n\n${overview}` : withGuide;
}

export function buildPatternSection(
  topicId: number,
  title: string,
  description: string,
  overview: string,
  withTopicPractice: (summary: string, topicId: number) => string,
): TutorialData.Section {
  const subtopics = Q4_SUBTOPICS[topicId] ?? [];
  const visibleSubtopics = subtopics
    .map((subtopic, index) => ({ subtopic, index }))
    .filter(({ subtopic }) => !isDuplicateTopicCard(subtopic, title));
  const overviewSummary = withTopicPractice(
    enrichOverviewWithSubtopicGuide(
      overview,
      visibleSubtopics.map(({ subtopic }) => subtopic),
    ),
    topicId,
  );

  return {
    id: topicId,
    title,
    description,
    summary: `## 章節導覽\n\n本模式共有 ${visibleSubtopics.length} 個細分子主題講義；「模式總覽」頁已包含核心直覺、讀題訊號、模板、常見錯誤與帶 Labels 的完整題表。建議先讀總覽並挑必修題練手，再依卡片順序補強細分技巧。`,
    children: [
      {
        id: overviewSectionId(topicId),
        title: "模式總覽",
        description:
          "本模式的整體直覺、讀題訊號、模板、常見錯誤與完整練習題表。",
        summary: overviewSummary,
      },
      ...visibleSubtopics.map(({ subtopic: st, index }) => ({
        id: subtopicSectionId(topicId, index),
        title: st.title,
        description: st.blurb,
        summary: st.summary,
      })),
      {
        id: practiceSectionId(topicId),
        title: "搭配追蹤題單",
        description: "依必修、進階、挑戰三階段練習本模式，並在題表記錄進度。",
        summary: withTopicPractice(
          "## 如何使用本題單\n\n先讀「模式總覽」與各子主題講義，再用下面三張題表依序練習。每題的 Labels 會標出對應的子主題，方便對照講義。",
          topicId,
        ),
      },
    ],
  };
}
