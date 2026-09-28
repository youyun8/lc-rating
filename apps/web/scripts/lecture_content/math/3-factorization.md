## 這個技術解決什麼問題

把整數 `n` 寫成質數乘積。許多數論題（求因數個數、判斷平方數、化簡分數、統計公因數）都先要拿到質因數結構，而算術基本定理保證這個分解唯一。

## 狀態／資料結構定義

用 `vector<pair<long long,int>>` 或 `map` 收集「質因數 → 指數」。試除變數 `p` 從 2 遞增；每找到一個因數就把它除盡再繼續。

## 不變量或正確性證明

不變量：外層走到 `p` 時，`n` 已不含任何小於 `p` 的質因數。

因此當 `p` 整除 `n` 時，`p` 必為質數——若 `p` 是合數，它的質因數更小，早已被除盡，不可能仍整除 `n`。這說明我們不需要事先準備質數表，直接用連續整數試除即可。

迴圈只跑到 $\sqrt{n}$ 的理由：除盡所有不超過 $\sqrt{n}$ 的質因數後，剩下的 `n` 要嘛是 1，要嘛是一個大於 $\sqrt{n}$ 的質數。後者不可能是合數，否則它至少有兩個大於 $\sqrt{n}$ 的因數，乘積會超過原值。所以迴圈結束後若 `n > 1`，把它整個當成最後一個質因數即可。

## C++17 模板

```cpp
vector<pair<long long, int>> factorize(long long n) {
    vector<pair<long long, int>> factors;
    for (long long p = 2; p * p <= n; ++p) {
        if (n % p != 0) {
            continue;
        }
        int exponent = 0;
        while (n % p == 0) {
            n /= p;
            ++exponent;
        }  // 除盡才換下一個
        factors.emplace_back(p, exponent);
    }
    if (n > 1) {
        factors.emplace_back(n, 1);
    }  // 剩下的必是大質數
    return factors;
}
```

## 時間與空間複雜度

時間 $O(\sqrt{n})$，空間為質因數個數 $O(\log n)$——因為每個質因數至少是 2，指數總和不超過 $\log_2 n$。若已用線性篩預處理最小質因數，單次分解可降到 $O(\log n)$。

## 常見錯誤與邊界條件

- 忘記迴圈後補上 `n > 1` 的那個大質因數（例如 `n = 14` 會漏掉 7）。
- 找到因數後只除一次而非除盡，導致指數錯誤。
- 迴圈條件用已被修改的 `n` 是正確且更快的，但若寫成固定上界就會多跑。
- `n = 1` 應回傳空集合。
- `p * p` 溢位需用 `long long`。

## 常見變形

要對整個值域反覆查詢時，可一次預處理「不同質因數列表」：

```cpp
vector<vector<int>> distinctPrimeFactors(int limit) {
    vector<vector<int>> factors(limit + 1);
    for (int p = 2; p <= limit; ++p) {
        if (!factors[p].empty()) {
            continue;
        }  // 尚未被較小質數標過，p 是質數
        for (int multiple = p; multiple <= limit; multiple += p) {
            factors[multiple].push_back(p);
        }
    }
    return factors;
}
```

每個質數 `p` 走過 `limit / p` 個倍數，時間與總儲存量皆為
$\sum_{p\le N}\lfloor N/p\rfloor = O(N\log\log N)$；列表只記不同質因數，不含指數。

若還要快速取得每個指數，改預處理最小質因數 `spf[x]`：

```cpp
vector<int> buildSpf(int limit) {
    vector<int> spf(limit + 1);
    for (int p = 2; p <= limit; ++p) {
        if (spf[p] != 0) {
            continue;
        }
        for (int multiple = p; multiple <= limit; multiple += p) {
            if (spf[multiple] == 0) {
                spf[multiple] = p;
            }
        }
    }
    return spf;
}

vector<pair<int, int>> factorizeWithSpf(int x, const vector<int>& spf) {
    vector<pair<int, int>> result;
    while (x > 1) {
        const int p = spf[x];
        int exponent = 0;
        do {
            x /= p;
            ++exponent;
        } while (x > 1 && spf[x] == p);
        result.emplace_back(p, exponent);
    }
    return result;
}
```

這個埃氏式 SPF 建表為 $O(N\log\log N)$、空間 $O(N)$；每次分解至少除掉一個質因數，為 $O(\log x)$。若用線性篩建 SPF，預處理可進一步降到 $O(N)$。

## 與相似技巧的比較

單次分解用根號試除；要對大量數字分解，先用線性篩求出每個數的最小質因數，之後每次分解只需沿著最小質因數往下除，成本 $O(\log n)$。若 `n` 超過 $10^{18}$，需要 Pollard's rho。

## 本節重點速查

- 連續整數試除即可，命中者必為質數
- 找到就除盡
- 迴圈後別忘了剩下的大質數
- 分解唯一。
