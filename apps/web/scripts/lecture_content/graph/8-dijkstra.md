## 這個技術解決什麼問題

在邊權非負的圖上，求單一起點到所有節點的最短路。BFS 只適用於等權圖，Dijkstra 把「逐層擴展」推廣成「按目前已知距離由小到大擴展」。

## 辨識題型的訊號

帶權圖求最短路徑、最小成本、最短時間；邊權皆非負。若存在負權邊必須改用 Bellman-Ford 或 SPFA；若邊權只有 0 與 1，0-1 BFS 更快。

## 核心想法與直覺

維護一個「已確定最短距離」的集合，每次從尚未確定的節點中挑出 `dis` 最小的那個——因為所有邊權非負，沒有任何繞路能讓它變得更短，於是它可以直接定案。定案後用它去鬆弛鄰居。優先佇列讓「挑最小」變成 $O(\log m)$。

## 狀態／資料結構定義

`dis[x]` 是目前已知的起點到 `x` 的最短距離上界，未知為無限大。堆中存放 `(距離, 節點)`。採用「懶刪除」：不去修改堆中舊值，而是插入新值，出堆時用 `d > dis[x]` 過濾掉過期項目。

## 不變量或正確性證明

不變量：每當節點 `x` 以距離 `d` 出堆且 `d == dis[x]` 時，`d` 就是起點到 `x` 的真正最短距離。

反證：設 `x` 是第一個被錯誤定案的節點，真正最短路為 `P`，長度小於 `d`。沿 `P` 找出第一個尚未定案的節點 `y`（可能就是 `x`）。`y` 的前驅已定案並鬆弛過 `y`，故 `dis[y]` 不超過 `P` 上到 `y` 的前綴長度。因為邊權非負，該前綴長度不超過 `P` 的總長，也就小於 `d`，於是 `y` 會比 `x` 更早出堆，與 `x` 是最先出堆者矛盾。非負性正是這裡唯一用到的前提，也是負權會讓演算法失效的原因。

## 逐步演算法

`dis[start]` 設 0、其餘設無限大，把 `(0, start)` 入堆；取出堆頂，若其距離大於 `dis` 則跳過（過期項目）；否則沿每條出邊嘗試鬆弛，成功就把新的 `(距離, 鄰居)` 入堆；堆空即完成。

## C++17 模板

```cpp
// 回傳起點到各點的最短距離；不可達為 LLONG_MAX。要求邊權非負。
vector<long long> dijkstra(int n, const vector<vector<pair<int, int>>>& g,
                           int start) {
    const long long kInf = LLONG_MAX;
    vector<long long> dis(n, kInf);
    dis[start] = 0;

    using Node = pair<long long, int>;  // (距離, 節點)
    priority_queue<Node, vector<Node>, greater<Node>> heap;
    heap.emplace(0LL, start);

    while (!heap.empty()) {
        const auto [d, x] = heap.top();
        heap.pop();
        if (d > dis[x]) {
            continue;
        }  // 懶刪除：過期項目
        for (const auto& [y, w] : g[x]) {
            const long long next = d + w;
            if (next < dis[y]) {
                dis[y] = next;
                heap.emplace(next, y);
            }
        }
    }
    return dis;
}
```

稠密圖（$m$ 接近 $n^2$）改用不帶堆的 $O(n^2)$ 版本反而更快：每輪線性掃描找出未定案中 `dis` 最小者。

## 時間與空間複雜度

堆中最多有 $O(m)$ 個項目，時間 $O(m \log m)$（也常寫成 $O(m \log n)$），空間 $O(n + m)$。稠密圖的樸素版本為 $O(n^2)$。

## 常見錯誤與邊界條件

- 圖有負權邊仍套用 Dijkstra（結果錯誤且不會報錯）。
- 忘記懶刪除的 `continue`，使複雜度退化。
- 距離累加溢位，應用 `long long` 並在比較前避免對無限大再加值。
- 無向圖忘記加反向邊。
- 不可達節點要當成無解而非距離 0。

## 與相似技巧的比較

BFS 是所有邊權相同時的特例；0-1 BFS 用雙端佇列處理權為 0/1 的情形；Bellman-Ford 允許負權且能偵測負環，代價是 $O(nm)$；Floyd 求全源最短路，適合 $n$ 很小的情況；A\* 是加上啟發式估計的 Dijkstra。

## 本節重點速查

- 邊權非負才成立
- 出堆即定案
- 懶刪除用 `d > dis[x]` 過濾
- 距離用 `long long`。
