## 這個技術解決什麼問題

求最小公倍數。逐個列舉倍數再比對太慢；透過 `lcm(a, b) = a / gcd(a, b) * b` 可以在對數時間內求得，是週期對齊、分數通分、循環重合這類題目的核心。

## 狀態／資料結構定義

只需兩個整數與一次 GCD 呼叫。多個數的 LCM 由結合律逐個折疊：`lcm(lcm(x, y), z)`。

## 不變量或正確性證明

由算術基本定理，設 $a = \prod p_i^{e_i}$、$b = \prod p_i^{f_i}$，則

$$\gcd(a,b) = \prod p_i^{\min(e_i,f_i)}, \qquad \operatorname{lcm}(a,b) = \prod p_i^{\max(e_i,f_i)}$$

因為公因數必須在每個質數上取兩者指數的較小值，而公倍數必須取較大值。由恆等式 $\min(e,f) + \max(e,f) = e + f$，兩者相乘後每個質數的指數恰為 $e_i + f_i$，故 $\gcd(a,b) \cdot \operatorname{lcm}(a,b) = a \cdot b$，移項即得公式。

實作上務必寫成 `a / g * b` 而非 `a * b / g`：前者先除後乘，中間值不超過答案本身；後者的 `a * b` 可能在答案仍在範圍內時就先溢位。除法無誤差是因為 `g` 必定整除 `a`。

## 時間與空間複雜度

一次 GCD 加常數次乘除，時間 $O(\log \min(a,b))$，空間 $O(1)$。折疊 `n` 個數為 $O(n \log V)$。

## C++17 模板

```cpp
long long lcm(long long a, long long b) {
    if (a == 0 || b == 0) {
        return 0;
    }
    return a / gcd(a, b) * b;  // 先除後乘，避免中間溢位
}

// 多個數的 LCM：逐個折疊，過程中留意是否超出題目上界
long long lcmAll(const vector<long long>& nums) {
    long long result = 1;
    for (long long v : nums) {
        result = lcm(result, v);
    }
    return result;
}
```

C++17 起 `std::lcm`（`<numeric>`）可直接使用。

## 常見錯誤與邊界條件

- 寫成 `a * b / g` 而在中途溢位。
- 含 0 時 `lcm` 定義為 0，但直接套公式會除以零，需特判。
- 多數折疊時結果成長極快，常需在超過上界時提前結束或改用 `__int128`。
- 負數應先取絕對值。

## 與相似技巧的比較

GCD 取各質數指數的最小值、LCM 取最大值，兩者互為對偶；週期性問題（兩個訊號何時重合）用 LCM，而分組與可達性問題用 GCD。若要對答案取模，注意 LCM 的除法不能直接在模意義下做，須改用質因數指數合併。

## 本節重點速查

- `a / gcd * b`，先除後乘
- GCD 取 min 指數、LCM 取 max
- 乘積等於 `a * b`
- 含 0 要特判。
