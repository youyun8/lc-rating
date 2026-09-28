## 這個技術解決什麼問題

收錄數論雜項中最常考的幾個工具：快速冪、完全平方數判定、以及把問題化成封閉式後直接計算。共同精神是先證出一條性質，再用 $O(\log n)$ 或 $O(1)$ 的手段求值，而不是模擬。

## 狀態／資料結構定義

快速冪維護 `result`（累積答案）、`base`（當前平方項）與 `exponent`（剩餘指數）。平方判定則用整數開根號後回乘驗證，避免浮點誤差。

## 不變量或正確性證明

快速冪的不變量：任一時刻 `result * base^exponent` 恆等於所求的 $a^e$。

初始 `result = 1`、`base = a`、`exponent = e`，等式成立。每輪若 `exponent` 為奇數，把一個 `base` 併入 `result`，同時指數減一——乘積不變；接著 `base` 平方、`exponent` 折半，因為 $(\text{base}^2)^{\lfloor e/2 \rfloor} = \text{base}^{e - (e \bmod 2)}$，乘積同樣不變。當 `exponent` 降到 0 時 $\text{base}^0 = 1$，故 `result` 即為答案。

指數每輪至少折半，故迴圈執行 $O(\log e)$ 次。

平方判定的正確性：取 `r = (long long)sqrtl(n)`，因浮點誤差 `r` 可能偏離真值 1，故在 `r-1`、`r`、`r+1` 中檢查 `r * r == n`。整數回乘是精確的，因此判定無誤差。

## 時間與空間複雜度

快速冪 $O(\log e)$ 時間、$O(1)$ 空間。平方判定 $O(1)$（或用二分為 $O(\log n)$）。

## C++17 模板

```cpp
long long power(long long a, long long e, long long mod) {
    long long result = 1;
    a %= mod;
    while (e > 0) {
        if (e & 1) {
            result = result * a % mod;
        }
        a = a * a % mod;
        e >>= 1;
    }
    return result;
}

bool isPerfectSquare(long long n) {
    if (n < 0) {
        return false;
    }
    long long r = static_cast<long long>(sqrtl(static_cast<long double>(n)));
    for (long long c = max(0LL, r - 1); c <= r + 1; ++c) {  // 校正浮點誤差
        if (c * c == n) {
            return true;
        }
    }
    return false;
}
```

## 常見錯誤與邊界條件

- 快速冪忘記先對底數取模而在首次相乘就溢位。
- 指數為 0 時應回傳 1。
- 負指數需先求逆元。
- 平方判定直接信任 `sqrt` 的回傳值而在大數時誤判。
- `e & 1` 對負指數行為不同，需先確保非負。

## 與相似技巧的比較

快速冪的「折半」思想可推廣到矩陣快速冪（解線性遞推）與快速乘（模數接近 $10^{18}$ 時避免溢位）。若模數為質數，快速冪同時是求逆元的最短寫法；若要對很多不同指數求冪，可預處理分塊表。

## 本節重點速查

- 不變量是 `result * base^exp` 不變
- 指數折半、底數平方
- 先取模再乘
- 開根號結果要回乘驗證。
