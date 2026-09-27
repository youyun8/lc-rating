## 這個技術解決什麼問題

計算位元卷積：給定陣列 `a`、`b`，求 `c[k] = Σ a[i] * b[j]`，其中 `i` 與 `j` 經某種位元運算（XOR、AND、OR）等於 `k`。樸素做法是 $O(n^2)$；快速沃爾什變換把它降到 $O(n \log n)$。

## 狀態／資料結構定義

陣列長度須為 2 的冪 $n = 2^m$，下標視為 `m` 位的位元遮罩。變換就地進行，外層枚舉當前處理的位元寬度 `len`，內層對每一對「該位為 0 與為 1」的下標做蝴蝶運算。

## 不變量或正確性證明

FWT 的設計目標是找一個線性變換 $T$，使得**逐點相乘**對應原空間的位元卷積：

$$T(a \ast b) = T(a) \odot T(b)$$

其中 $\odot$ 是逐點乘法。有了它，卷積就化為「正變換 → 逐點乘 → 逆變換」。

以 XOR 為例，變換取 $T(a)[k] = \sum_i (-1)^{|i \wedge k|} a[i]$，其中 $|i \wedge k|$ 是 `i` 與 `k` 按位與後的 1 的個數。驗證乘性：

$$T(a)[k]\,T(b)[k] = \sum_{i,j} (-1)^{|i \wedge k| + |j \wedge k|} a[i]b[j]$$

關鍵恆等式是 $|i \wedge k| + |j \wedge k| \equiv |(i \oplus j) \wedge k| \pmod 2$——因為對 `k` 的每一位，`i` 與 `j` 在該位的貢獻相加的奇偶性，恰等於 `i xor j` 在該位的值。於是上式等於 $\sum_t (-1)^{|t \wedge k|} \sum_{i \oplus j = t} a[i]b[j] = T(a \ast b)[k]$，乘性成立。

蝴蝶運算 $(x, y) \mapsto (x+y,\; x-y)$ 正是這個變換在單一位元上的實現；逆變換只需再除以 2（整體除以 $n$）。AND 與 OR 卷積對應的是子集和／超集和變換，蝴蝶運算改為單向加減，逆變換為對應的減法。

## 時間與空間複雜度

`m` 層外迴圈、每層 $O(n)$ 次蝴蝶運算，變換為 $O(n \log n)$；逐點相乘 $O(n)$。總計 $O(n \log n)$ 時間、$O(n)$ 空間。

## C++17 模板

```cpp
// XOR 卷積的沃爾什變換；invert 時整體除以 n。
void fwtXor(vector<long long>& a, bool invert) {
    const int n = a.size();
    for (int len = 1; len < n; len <<= 1) {
        for (int i = 0; i < n; i += len << 1) {
            for (int j = i; j < i + len; ++j) {
                const long long x = a[j], y = a[j + len];
                a[j] = x + y;  // 蝴蝶運算
                a[j + len] = x - y;
            }
        }
    }
    if (invert) {
        for (long long& v : a) {
            v /= n;
        }
    }
}

vector<long long> xorConvolution(vector<long long> a, vector<long long> b) {
    fwtXor(a, false);
    fwtXor(b, false);
    for (size_t i = 0; i < a.size(); ++i) {
        a[i] *= b[i];
    }
    fwtXor(a, true);
    return a;
}
```

## 常見錯誤與邊界條件

- 陣列長度不是 2 的冪（須先補零至 $2^m$）。
- 逆變換忘記除以 `n`。
- 在模意義下用整數除法而非乘以 `n` 的逆元。
- 中間值溢位需 `long long`。
- 把 XOR 的蝴蝶運算誤用在 AND/OR 卷積上（三者的變換不同）。

## 與相似技巧的比較

FFT/NTT 處理的是「下標相加」的普通卷積，FWT 處理「下標做位元運算」的卷積，兩者結構相似但變換矩陣不同。若只需子集和（OR 卷積的一半），SOS DP 更直接。位元數很小時直接 $O(4^m)$ 枚舉反而簡單。

## 本節重點速查

- 正變換、逐點乘、逆變換
- XOR 的蝴蝶是 $(x+y, x-y)$
- 逆變換要除以 `n`
- 長度必須是 2 的冪。
