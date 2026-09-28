## 這個技術解決什麼問題

計算隨機過程的期望值與機率。直接枚舉所有結果往往是指數級；期望的線性性讓我們把複雜的整體拆成一堆簡單的局部，各自求期望再相加。

## 狀態／資料結構定義

機率題常用 `dp[state]` 表示「從該狀態出發的期望值」。答案多為分數，需在模意義下用逆元表示。轉移方向要想清楚：多數期望 DP 從終止狀態往回推。

## 不變量或正確性證明

期望的線性性：對任意隨機變數 $X, Y$（不需獨立）與常數 $a, b$，

$$E[aX + bY] = aE[X] + bE[Y]$$

這是本節最重要的工具，因為它**不要求獨立**。證明由定義展開：$E[X+Y] = \sum_\omega P(\omega)(X(\omega)+Y(\omega)) = \sum_\omega P(\omega)X(\omega) + \sum_\omega P(\omega)Y(\omega)$。

常用手法是「指示變數拆解」：要求「期望有幾個位置滿足某性質」，令 $X_i$ 為第 `i` 個位置是否滿足的指示變數（滿足為 1，否則為 0），則 $X = \sum X_i$，而 $E[X_i] = P(\text{第 } i \text{ 個位置滿足})$。由線性性得 $E[X] = \sum P_i$——即使各位置高度相關，這一步依然成立，這正是它威力所在。

全期望公式（條件期望）：$E[X] = \sum_i P(A_i) E[X \mid A_i]$，其中 $\{A_i\}$ 是樣本空間的一組劃分。期望 DP 的轉移就是它的直接應用。

## 時間與空間複雜度

指示變數拆解通常把指數級降到 $O(n)$。期望 DP 的成本為狀態數乘以轉移數。若轉移成環（例如可以回到原狀態），需解線性方程組或用代數消元。

## C++17 模板

```cpp
constexpr long long kMod = 1'000'000'007;

// 期望值在模意義下：分數 a/b 表示為 a * b^{-1} mod p
long long expectedValue(const vector<long long>& values,
                        const vector<pair<long long, long long>>& probs) {
    long long result = 0;
    for (size_t i = 0; i < values.size(); ++i) {
        const auto [num, den] = probs[i];  // 機率 num/den
        const long long p = num % kMod * power(den, kMod - 2, kMod) % kMod;
        result = (result + values[i] % kMod * p) % kMod;
    }
    return result;
}
```

## 常見錯誤與邊界條件

- 誤以為線性性需要獨立（不需要）。
- 把 $E[XY]$ 拆成 $E[X]E[Y]$（這才需要獨立）。
- 期望 DP 的轉移方向弄反。
- 轉移成環時直接遞推導致死循環。
- 分數未用逆元表示而用浮點造成精度不足。
- 機率總和不為 1。

## 與相似技巧的比較

能用指示變數拆解時，成本遠低於狀態 DP，應優先嘗試；狀態之間有明確轉移且無環時用期望 DP；有環則需解方程。若只要求機率而非期望，多半是直接的組合計數。

## 本節重點速查

- 線性性不需獨立
- 指示變數把整體拆成各位置機率相加
- 期望 DP 多從終點回推
- 分數用逆元。
