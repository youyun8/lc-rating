## 這個技術解決什麼問題

在求出 `gcd(a, b)` 的同時，找出整數 `x`、`y` 滿足貝祖等式 `a·x + b·y = gcd(a, b)`。它是求模逆元、解線性同餘方程 `ax ≡ c (mod m)`、以及中國剩餘定理的基礎。

## 狀態／資料結構定義

遞迴回傳三元組 `(g, x, y)`：`g` 為最大公約數，`x`、`y` 為對應的貝祖係數。迭代版則維護兩組係數，隨著歐幾里得的每一步同步更新。

## 不變量或正確性證明

不變量：遞迴每一層回傳的 `(g, x, y)` 都滿足 `a·x + b·y = g`。

歸納證明：出口為 `b = 0`，此時 `gcd(a, 0) = a`，取 `x = 1`、`y = 0` 顯然滿足 `a·1 + 0·0 = a`。

歸納步驟：設遞迴呼叫 `(b, a mod b)` 回傳 `(g, x₁, y₁)`，即 `b·x₁ + (a mod b)·y₁ = g`。代入 `a mod b = a - \lfloor a/b \rfloor · b`：

$$b x_1 + \left(a - \lfloor a/b \rfloor b\right) y_1 = a y_1 + b\left(x_1 - \lfloor a/b \rfloor y_1\right) = g$$

對照 `a·x + b·y = g` 可讀出 `x = y₁`、`y = x₁ - ⌊a/b⌋·y₁`，這正是實作中的更新式。

解的存在性即貝祖定理；解不唯一，通解為 `x + k·(b/g)`、`y - k·(a/g)`。方程 `ax + by = c` 有整數解的充要條件是 `g` 整除 `c`。

## 時間與空間複雜度

與歐幾里得同階，時間 $O(\log \min(a,b))$；遞迴空間為同樣的對數深度。

## C++17 模板

```cpp
// 回傳 gcd(a, b)，並令 a * x + b * y = gcd(a, b)。
long long exgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long x1, y1;
    const long long g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// a 在模 m 下的乘法逆元；僅當 gcd(a, m) == 1 時存在。
long long modInverse(long long a, long long m) {
    long long x, y;
    if (exgcd(a, m, x, y) != 1) {
        return -1;
    }
    return (x % m + m) % m;  // 轉成非負代表元
}
```

## 常見錯誤與邊界條件

- 回傳的 `x` 可能為負，取模後要 `(x % m + m) % m` 校正。
- 只有在 `gcd(a, m) == 1` 時逆元才存在，否則無解。
- 解 `ax + by = c` 時忘記先檢查 `g` 整除 `c`，或忘記把特解乘上 `c / g`。
- 中間乘積溢位需用 `long long` 甚至 `__int128`。

## 與相似技巧的比較

模數為質數時，用費馬小定理配合快速冪求逆元（$a^{p-2}$）更好寫，但只適用於質數模；擴展歐幾里得適用於任何互質的模數，且能解一般的線性丟番圖方程。批量求 `1..n` 的逆元有 $O(n)$ 的遞推公式。

## 本節重點速查

- `x = y₁`、`y = x₁ - ⌊a/b⌋·y₁`
- 出口取 `(1, 0)`
- 逆元存在的條件是互質
- 結果記得校正成非負。
