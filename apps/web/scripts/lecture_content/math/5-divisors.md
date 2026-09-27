## 這個技術解決什麼問題

列舉一個數的所有因數，或統計因數個數。暴力從 1 試到 `n` 是 $O(n)$；利用因數成對出現的性質，只需掃到 $\sqrt{n}$。

## 狀態／資料結構定義

迴圈變數 `i` 從 1 到 $\lfloor\sqrt{n}\rfloor$。每命中一個 `i`，同時取得搭檔 `n / i`。結果若需有序，可分別收集小的一半與大的一半再拼接，或最後排序。

## 不變量或正確性證明

不變量：掃描到 `i` 時，所有不超過 `i` 的因數都已被收集，且它們的搭檔也已一併收集。

配對的完備性：若 `d` 整除 `n`，則 `n / d` 也整除 `n`，兩者構成一對且乘積為 `n`。一對中必有一個不超過 $\sqrt{n}$（否則乘積大於 `n`），因此掃過 `[1, \sqrt{n}]` 就能觸及每一對，不會遺漏任何因數。

唯一要小心的是完全平方數：當 `i * i == n` 時 `i` 與 `n / i` 是同一個數，只能計入一次，否則因數個數會多算。

由質因數分解也能直接得到因數個數：若 $n = p_1^{e_1} \cdots p_k^{e_k}$，則因數個數為 $\prod (e_i + 1)$——每個質因數的指數可獨立取 `0` 到 `e_i`，由乘法原理相乘。

## C++17 模板

```cpp
vector<long long> divisors(long long n) {
    vector<long long> small, large;
    for (long long i = 1; i * i <= n; ++i) {
        if (n % i != 0) {
            continue;
        }
        small.push_back(i);
        if (i != n / i) {
            large.push_back(n / i);
        }  // 完全平方數只取一次
    }
    small.insert(small.end(), large.rbegin(), large.rend());
    return small;  // 已由小到大
}
```

求範圍內每個數的因數個數（調和級數篩）：

```cpp
vector<int> count(n + 1, 0);
for (int d = 1; d <= n; ++d) {
    for (int multiple = d; multiple <= n; multiple += d) {
        ++count[multiple];
    }
}
```

若後續真的要列舉每個數的因數，而不只是個數，可以直接物化所有列表：

```cpp
vector<vector<int>> buildDivisorLists(int n) {
    vector<vector<int>> divisors(n + 1);
    for (int d = 1; d <= n; ++d) {
        for (int multiple = d; multiple <= n; multiple += d) {
            divisors[multiple].push_back(d);
        }
    }
    return divisors;  // 每個列表自然由小到大
}
```

## 時間與空間複雜度

單一 `n` 的根號列舉為 $O(\sqrt n)$ 時間，額外空間等於輸出因數數量。批量建立計數或完整列表時，總迭代次數與列表總元素數都是

$$
\sum_{d=1}^{N}\left\lfloor\frac{N}{d}\right\rfloor
= N\log N + O(N),
$$

因此物化所有列表的時間與儲存量皆為 $O(N\log N)$；不能只把外層陣列的 $O(N)$ 算成全部空間。若只需因數個數，使用一維 `count` 可把空間降為 $O(N)$。

## 常見錯誤與邊界條件

- 完全平方數把中間那個因數算兩次。
- `i * i <= n` 寫成 `i <= n / i` 時要注意 `n = 0`。
- 輸出要求有序卻直接 push 造成亂序。
- `n = 1` 只有一個因數。
- 把「因數個數」與「質因數個數」混淆。
- 物化所有列表時低估調和級數級的儲存量。

## 與相似技巧的比較

單一數字用根號枚舉；整個範圍用調和級數篩，$\sum_{d=1}^{n} n/d = O(n \log n)$，比逐個根號枚舉的 $O(n\sqrt{n})$ 快得多。若已有質因數分解，因數個數可直接由指數加一相乘得到，不需列舉。

## 本節重點速查

- 因數成對出現，只掃到根號
- 完全平方數的中點只算一次
- 範圍統計用調和級數篩
- 個數等於各指數加一相乘。
