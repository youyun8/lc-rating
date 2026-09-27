## 這個技術解決什麼問題

在答案極大時，題目通常要求對某個模數（常見為 $10^9+7$）取餘。同餘運算讓我們全程只保留餘數，避免大數運算，同時保證結果正確。

## 狀態／資料結構定義

所有中間值都維持在 `[0, m)`。加減乘後立即取模；因為兩個小於 $10^9$ 的數相乘可達 $10^{18}$，乘法前必須轉成 `long long`。

## 不變量或正確性證明

不變量：每個中間變數恆等於「真實值對 `m` 取餘」的結果。

同餘關係對加法與乘法封閉：若 $a \equiv a' \pmod m$ 且 $b \equiv b' \pmod m$，則 $a+b \equiv a'+b'$、$ab \equiv a'b' \pmod m$。證明以乘法為例：設 `a = a' + km`、`b = b' + lm`，展開得 `ab = a'b' + m(a'l + b'k + klm)`，第二項是 `m` 的倍數，故兩者同餘。

由此可歸納出：任何只由加、減、乘構成的運算式，「每步取模」與「最後取模」結果相同——這正是全程取模的正當性。

除法是例外：$\frac{a}{b} \bmod m$ 不等於 $\frac{a \bmod m}{b \bmod m}$。必須改乘以 `b` 的模逆元，而逆元存在的條件是 `gcd(b, m) = 1`。`m` 為質數時可用費馬小定理 $b^{-1} \equiv b^{m-2}$。

## 時間與空間複雜度

單次加減乘取模為 $O(1)$；快速冪求逆元為 $O(\log m)$。批量求 `1..n` 的逆元有 $O(n)$ 的線性遞推。

## C++17 模板

```cpp
constexpr long long kMod = 1'000'000'007;

long long add(long long a, long long b) {
    return (a + b) % kMod;
}
long long sub(long long a, long long b) {
    return ((a - b) % kMod + kMod) % kMod;
}
long long mul(long long a, long long b) {
    return a % kMod * (b % kMod) % kMod;
}

// 快速冪：a^e mod kMod
long long power(long long a, long long e) {
    long long result = 1;
    a %= kMod;
    while (e > 0) {
        if (e & 1) {
            result = result * a % kMod;
        }
        a = a * a % kMod;
        e >>= 1;
    }
    return result;
}

// kMod 為質數時的逆元（費馬小定理）
long long inverse(long long a) {
    return power(a, kMod - 2);
}
```

## 常見錯誤與邊界條件

- 減法後出現負數未校正（必須 `(x % m + m) % m`）。
- 乘法在 `int` 下溢位。
- 直接做除法而非乘逆元。
- `a` 為 0 時無逆元。
- 費馬小定理誤用在非質數模上。
- 快速冪的指數為 0 時應回傳 1。

## 與相似技巧的比較

模數為質數時費馬小定理最好寫；模數為合數但與底數互質時用擴展歐幾里得；模數不互質則逆元不存在，需改變思路（例如改用質因數指數統計）。多個模數的方程組用中國剩餘定理合併。

## 本節重點速查

- 加減乘可全程取模，除法不行
- 減法後補正負數
- 乘法先轉 `long long`
- 質數模的逆元是 $a^{m-2}$。
