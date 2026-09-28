## 這個技術解決什麼問題

計數時若條件之間會互相重疊，直接相加會重複計算。容斥原理提供一套「加上單個、減去兩兩交集、加回三三交集」的修正記帳法，讓每個元素恰好被計一次。

## 狀態／資料結構定義

當條件數 `m` 不大（通常不超過 20），用位元遮罩枚舉子集：遮罩的每一位代表「是否納入該條件」。符號由子集大小的奇偶決定，交集大小依題目性質計算（常見是 LCM 的倍數個數）。

## 不變量或正確性證明

容斥公式：

$$\left|\bigcup_{i=1}^{m} A_i\right| = \sum_{\emptyset \ne S \subseteq [m]} (-1)^{|S|+1} \left|\bigcap_{i \in S} A_i\right|$$

證明採「逐元素驗算」：取任一屬於聯集的元素 `x`，設它恰好屬於其中 `t` 個集合（`t ≥ 1`）。它在所有大小為 `j` 的子集交集中被數到 $\binom{t}{j}$ 次，符號為 $(-1)^{j+1}$。故它的總貢獻為

$$\sum_{j=1}^{t} (-1)^{j+1}\binom{t}{j} = 1 - \sum_{j=0}^{t} (-1)^{j}\binom{t}{j} + 1 - 1 = 1 - (1-1)^t = 1$$

因為 $t \ge 1$ 時 $(1-1)^t = 0$。每個元素恰好貢獻 1，總和即為聯集大小。不屬於聯集的元素貢獻 0，不影響結果。

## 時間與空間複雜度

枚舉全部子集為 $O(2^m)$，每個子集計算交集大小的成本另計（例如求 LCM 為 $O(m \log V)$），總計 $O(2^m \cdot m)$。空間 $O(1)$ 或 $O(m)$。

## C++17 模板

以「`[1, n]` 中能被 `nums` 任一元素整除的數的個數」為例：

```cpp
long long countDivisibleByAny(long long n, const vector<long long>& nums) {
    const int m = nums.size();
    long long total = 0;

    for (int mask = 1; mask < (1 << m); ++mask) {
        long long lcmValue = 1;
        bool overflow = false;
        for (int i = 0; i < m; ++i) {
            if (!(mask >> i & 1)) {
                continue;
            }
            lcmValue = lcmValue / gcd(lcmValue, nums[i]) * nums[i];
            if (lcmValue > n) {
                overflow = true;
                break;
            }  // 已無倍數，提前結束
        }
        if (overflow) {
            continue;
        }
        const long long count = n / lcmValue;
        // 子集大小為奇數則加、偶數則減
        total += (__builtin_popcount(mask) & 1) ? count : -count;
    }
    return total;
}
```

## 常見錯誤與邊界條件

- 符號取反（奇數個集合應為加）。
- LCM 在計算中溢位，需在超過 `n` 時提前中斷。
- 忘記排除空集合（`mask` 從 1 開始）。
- 條件數過多時 $2^m$ 爆炸，需改用其他方法。
- 交集的計算方式與題意不符。

## 與相似技巧的比較

條件少而交集易算時用容斥；條件多但具備數論結構時改用莫比烏斯反演（本質是容斥的封閉形式）；若條件之間互斥則直接相加，不需容斥。補集思想（算「都不滿足」再用全體減去）常能讓式子更短。

## 本節重點速查

- 奇加偶減
- 每個元素恰被計一次由 $(1-1)^t = 0$ 保證
- `mask` 從 1 開始
- LCM 超過上界就提前剪枝。
