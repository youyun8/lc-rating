## 這個技術解決什麼問題

計算排列數與組合數。題目常要對 $10^9+7$ 取模，且需要反覆查詢不同的 `C(n, k)`，因此要能在預處理後 $O(1)$ 回答。

## 狀態／資料結構定義

預處理兩個陣列：`fact[i]` 為 $i! \bmod p$，`inv_fact[i]` 為 $(i!)^{-1} \bmod p$。之後

$$C(n,k) = \text{fact}[n] \cdot \text{inv\_fact}[k] \cdot \text{inv\_fact}[n-k] \bmod p$$

## 不變量或正確性證明

組合數公式的正確性：從 `n` 個元素取 `k` 個排成一列有 $n!/(n-k)!$ 種；每個「不計順序的選法」對應 `k!` 種排列，故除以 `k!` 得 $C(n,k) = \frac{n!}{k!(n-k)!}$。這一步用的是乘法原理與等價類劃分。

模意義下除法的處理：由費馬小定理，`p` 為質數且 `a` 不被 `p` 整除時 $a^{p-1} \equiv 1$，故 $a^{-1} \equiv a^{p-2}$。因為 $k! < p$（題目通常保證 `n < p`），階乘不會被 `p` 整除，逆元存在。

逆階乘的線性遞推：由 $\frac{1}{(i-1)!} = \frac{i}{i!}$ 得 `inv_fact[i-1] = inv_fact[i] * i`。因此只需用快速冪求出最大的那個逆階乘，其餘倒推即可，把 `n` 次快速冪降為一次。

## 時間與空間複雜度

預處理 $O(n + \log p)$ 時間、$O(n)$ 空間；之後每次查詢 $O(1)$。若不預處理而每次直接算，單次為 $O(k)$ 或 $O(\log p)$。

## C++17 模板

```cpp
constexpr long long kMod = 1'000'000'007;
vector<long long> fact, invFact;

void initCombinatorics(int n) {
    fact.assign(n + 1, 1);
    invFact.assign(n + 1, 1);
    for (int i = 1; i <= n; ++i) {
        fact[i] = fact[i - 1] * i % kMod;
    }
    invFact[n] = power(fact[n], kMod - 2, kMod);  // 只做一次快速冪
    for (int i = n; i > 0; --i) {
        invFact[i - 1] = invFact[i] * i % kMod;
    }
}

long long comb(int n, int k) {
    if (k < 0 || k > n) {
        return 0;
    }  // 邊界視為 0
    return fact[n] * invFact[k] % kMod * invFact[n - k] % kMod;
}
```

## 常見錯誤與邊界條件

- `k < 0` 或 `k > n` 未回傳 0 而造成越界。
- 預處理長度不足。
- 模數非質數卻用費馬小定理（此時需 Lucas 定理或 CRT）。
- `n` 大於等於 `p` 時階乘含因數 `p` 使逆元不存在。
- 連乘時漏掉中間取模。

## 與相似技巧的比較

`n` 很小時用帕斯卡三角遞推 $C(n,k) = C(n-1,k-1) + C(n-1,k)$ 更直觀，且不需要逆元，適合非質數模；`n` 極大而 `k` 很小時直接連乘 `k` 項再乘逆元；模數為小質數而 `n` 巨大時用 Lucas 定理。

## 本節重點速查

- $C(n,k) = n!\,(k!)^{-1}((n-k)!)^{-1}$
- 逆階乘倒推只需一次快速冪
- 越界回傳 0
- 模數要是質數。
