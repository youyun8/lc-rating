## 這個技術解決什麼問題

快速計算 $\sum_{i=1}^{n} \lfloor n/i \rfloor$ 這類含整除的求和。逐項累加是 $O(n)$，當 `n` 達 $10^{12}$ 時不可行；數論分塊利用「商只有 $O(\sqrt{n})$ 種取值」把成本降到根號級。

## 狀態／資料結構定義

用左端點 `l` 掃描，對每個 `l` 求出商相同的最大右端點 `r`。區間 `[l, r]` 內 $\lfloor n/i \rfloor$ 為定值，可整段一次計入。

## 不變量或正確性證明

核心事實：對固定的 `n`，$\lfloor n/i \rfloor$ 至多有 $2\sqrt{n}$ 種不同取值。

理由：當 $i \le \sqrt{n}$ 時，`i` 本身只有 $\sqrt{n}$ 種取值；當 $i > \sqrt{n}$ 時，商 $\lfloor n/i \rfloor < \sqrt{n}$，也只有 $\sqrt{n}$ 種取值。兩段合計不超過 $2\sqrt{n}$。

分塊右端點公式：給定 `l`，令 $q = \lfloor n/l \rfloor$，則使商仍等於 `q` 的最大下標為 $r = \lfloor n/q \rfloor$。

證明：對任意 `i`，$\lfloor n/i \rfloor \ge q$ 等價於 $i \le n/q$，即 $i \le \lfloor n/q \rfloor$。又因為商隨 `i` 遞增而不增，且 `l` 處的商為 `q`，故區間 $[l, \lfloor n/q \rfloor]$ 上的商恆為 `q`，而 $\lfloor n/q \rfloor + 1$ 處必定更小。

不變量：每輪開始時 `l` 是尚未處理的最小下標，且 `[1, l)` 的貢獻已全部累加。

## 時間與空間複雜度

迴圈輪數等於不同商的個數，時間 $O(\sqrt{n})$，空間 $O(1)$。

## C++17 模板

```cpp
// 計算 sum_{i=1}^{n} floor(n / i)
long long divideBlocks(long long n) {
    long long total = 0;
    for (long long l = 1, r; l <= n; l = r + 1) {
        const long long q = n / l;
        r = n / q;                 // 商仍為 q 的最大下標
        total += q * (r - l + 1);  // 整段一次計入
    }
    return total;
}
```

若求和上界是 `m` 而非 `n`，把右端點取成 `min(m, n / q)` 即可。

## 常見錯誤與邊界條件

- 忘記 `l = r + 1` 而死迴圈。
- `r` 算成 `n / q - 1`。
- 上界與 `n` 不同時未取 `min` 而越界。
- `q` 為 0（當 `l > n`）會除以零，迴圈條件須擋住。
- 乘積 `q * (r - l + 1)` 溢位需用 `long long`。

## 與相似技巧的比較

若求和中還帶有積性函數的前綴和（如莫比烏斯函數），數論分塊要搭配杜教篩或線性篩；若只是單純計數倍數，直接用調和級數的 $O(n \log n)$ 篩法在 `n` 不大時更簡單。分塊的價值在於 `n` 極大而只需一個總和。

## 本節重點速查

- 商只有 $O(\sqrt{n})$ 種
- `r = n / (n / l)`
- 整段一次累加
- 下一輪從 `r + 1` 開始。
