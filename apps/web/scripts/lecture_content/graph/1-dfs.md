## 這個技術解決什麼問題

要走遍一張圖的每個點與每條邊，並在走的過程中順手算出「這個連通塊有多大」「這條路徑上累積了什麼」「有沒有環」。DFS 用一條路走到底再回頭的順序完成遍歷，讓每個節點恰好被展開一次。

## 辨識題型的訊號

問連通塊數量或大小、判斷兩點是否相通、需要列舉所有路徑、要在樹或 DAG 上由子節點資訊組出父節點資訊、判斷有向圖是否有環。若題目只問「最少幾步」，那是 BFS 的訊號而不是 DFS。

## 核心想法與直覺

把「走訪」拆成兩個時刻：進入節點時做的事（前序）與所有子樹處理完後做的事（後序）。前序適合把資訊往下傳（例如目前路徑和），後序適合把資訊往上收（例如子樹大小）。遞迴堆疊天然保存了「目前這條路徑」。

## 狀態／資料結構定義

`g[x]` 是節點 `x` 的鄰接表。`visited[x]` 表示 `x` 是否已經被展開過。對有向圖判環改用三色標記：`color[x]` 為 `0` 未訪問、`1` 在目前遞迴路徑上、`2` 已完全處理完畢。

## 不變量或正確性證明

不變量：任一時刻，`visited[x]` 為真的節點，其所有出邊都已被檢查過或正在被檢查。因為每個節點只在 `visited[x]` 為假時才展開，且展開後立刻設為真，所以每個節點恰好展開一次、每條邊恰好被檢查一次，遍歷不會遺漏也不會重複。

判環的正確性：`color[y] == 1` 表示 `y` 仍在目前的遞迴路徑上，而我們正從 `x` 走到 `y`，於是「`y` 到 `x` 的路徑」加上邊 `x -> y` 構成一個環。反之若圖有環，沿環第一個被展開的節點必然會在自己尚未變成 `2` 之前被再次遇到。

## 逐步演算法

建鄰接表；對每個尚未訪問的節點呼叫一次 DFS，作為新連通塊的起點；在 DFS 中先標記自己，再逐一遞迴未訪問的鄰居；離開前做後序統計。

## C++17 模板

```cpp
class Solution {
public:
    // 回傳連通塊個數，並在 component_size 中記錄每塊大小。
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<vector<int>> g(n);
        for (const auto& e : edges) {
            g[e[0]].push_back(e[1]);
            g[e[1]].push_back(e[0]);  // 有向圖刪掉這行
        }

        vector<int> visited(n, 0);
        int components = 0;

        // 回傳以 x 為根走到的節點數（後序統計）。
        function<int(int)> dfs = [&](int x) -> int {
            visited[x] = 1;
            int size = 1;
            for (int y : g[x]) {
                if (!visited[y]) {
                    size += dfs(y);
                }
            }
            return size;
        };

        for (int i = 0; i < n; ++i) {
            if (!visited[i]) {
                dfs(i);
                ++components;
            }
        }
        return components;
    }
};
```

有向圖判環（三色標記）：

```cpp
bool hasCycle(int n, const vector<vector<int>>& g) {
    vector<int> color(n, 0);  // 0 未訪問 / 1 在路徑上 / 2 已完成
    function<bool(int)> dfs = [&](int x) -> bool {
        color[x] = 1;
        for (int y : g[x]) {
            if (color[y] == 1) {
                return true;
            }  // 回邊，成環
            if (color[y] == 0 && dfs(y)) {
                return true;
            }
        }
        color[x] = 2;
        return false;
    };
    for (int i = 0; i < n; ++i) {
        if (color[i] == 0 && dfs(i)) {
            return true;
        }
    }
    return false;
}
```

## 時間與空間複雜度

每個節點展開一次、每條邊檢查一次，時間 $O(n + m)$。空間為鄰接表 $O(n + m)$ 加上遞迴堆疊最差 $O(n)$。

## 常見錯誤與邊界條件

- 在無向圖判環時把「走回父節點」誤判成環（需另外傳入父節點或以邊編號排除）。
- 用 `color[y] == 2` 當成環的條件（那只是重複到達，不是環）。
- 忘記圖可能不連通而只從節點 `0` 出發。
- 鏈狀圖遞迴過深造成堆疊溢位，此時改寫成手動堆疊的迭代版本。

## 與相似技巧的比較

BFS 同樣是 $O(n + m)$ 遍歷，但按層擴展，因此無權圖最短路要用 BFS；DFS 的價值在於後序時機，適合子樹統計與拓撲相關推導。並查集也能數連通塊，但無法提供路徑或後序資訊。

## 本節重點速查

- 每點展開一次、每邊檢查一次
- 前序往下傳、後序往上收
- 有向圖判環看的是「在路徑上」而不是「已訪問」。
