## 這個技術解決什麼問題

判斷一個數是否為迴文，以及在給定範圍內列舉或生成迴文數。轉成字串雖然直觀，但需要額外空間；更有價值的是「生成」——當範圍很大時，枚舉所有數再篩選不可行，必須反過來直接構造迴文。

## 狀態／資料結構定義

判斷時用 `rev` 累積反轉後半段，與剩餘的前半段 `x` 比較。生成時枚舉「一半」的數，再鏡射補成完整迴文，並分別處理奇數與偶數長度。

## 不變量或正確性證明

只反轉一半的判斷法，不變量是：每輪過後 `rev` 恆等於原數末尾若干位反轉的結果，而 `x` 為剩下的前段。

迴圈條件 `x > rev` 保證在中點停止：每輪 `x` 去掉一位、`rev` 增加一位，因此位數差每輪縮小 2。當 `x <= rev` 時已跨過中點。偶數位時停在 `x == rev`；奇數位時中間那位落在 `rev` 的最低位，用 `rev / 10` 去掉後再比較。

生成迴文的完備性：長度為 `L` 的迴文由它的前 $\lceil L/2 \rceil$ 位唯一決定——後半段是前半段的鏡射，沒有自由度。因此枚舉所有可能的前半段，就恰好不重不漏地生成所有該長度的迴文。這把「檢查 $10^L$ 個數」降為「生成 $10^{L/2}$ 個數」，是平方級的縮減。

## C++17 模板

```cpp
bool isPalindrome(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0)) {
        return false;
    }  // 負數與尾零
    int rev = 0;
    while (x > rev) {
        rev = rev * 10 + x % 10;
        x /= 10;
    }
    return x == rev || x == rev / 10;  // 偶數位 / 奇數位
}

// 由前半段 half 鏡射出迴文；odd 表示總長度為奇數。
long long buildPalindrome(long long half, bool odd) {
    long long result = half;
    if (odd) {
        half /= 10;
    }  // 奇數長度時中間位不重複
    while (half > 0) {
        result = result * 10 + half % 10;
        half /= 10;
    }
    return result;
}
```

需要**由小到大**列舉且受上界限制時，按「1 位、2 位、3 位、4 位……」生成；同一長度內前半段遞增，完整迴文也遞增。以下版本在每次乘 10 前檢查 `limit`，不會先溢位再比較：

```cpp
bool buildBounded(long long half, bool odd, long long limit, long long& value) {
    value = half;
    long long tail = odd ? half / 10 : half;
    while (tail > 0) {
        const int digit = tail % 10;
        if (value > (limit - digit) / 10) {
            return false;
        }
        value = value * 10 + digit;
        tail /= 10;
    }
    return value <= limit;
}

vector<long long> palindromesUpTo(long long limit) {
    vector<long long> result;
    if (limit < 1) {
        return result;
    }

    for (long long base = 1;;) {
        // base=1 產生 1 位、2 位；base=10 產生 3 位、4 位；依此類推。
        const long long decadeEnd =
            base > LLONG_MAX / 10 ? LLONG_MAX : base * 10 - 1;
        for (long long half = base; half <= limit && half <= decadeEnd;
             ++half) {
            long long value;
            if (!buildBounded(half, true, limit, value)) {
                break;
            }
            result.push_back(value);
        }
        for (long long half = base; half <= limit && half <= decadeEnd;
             ++half) {
            long long value;
            if (!buildBounded(half, false, limit, value)) {
                break;
            }
            result.push_back(value);
        }
        if (base > limit / 10 || base > LLONG_MAX / 10) {
            break;
        }
        base *= 10;
    }
    return result;
}
```

外層每輪先產生奇數長度，再產生下一個偶數長度，例如 `1..9`、`11..99`、`101..999`，所以輸出全域有序。`base > limit / 10` 與 `base > LLONG_MAX / 10` 同時限制下一輪的題目上界與型別上界。

## 時間與空間複雜度

判斷為 $O(\log_{10} x)$ 時間、$O(1)$ 空間。若上界為 `N`，候選前半段約有 $O(\sqrt N)$ 個；鏡射每個候選需 $O(\log N)$ 位元操作，因此嚴格寫成 $O(\sqrt N\log N)$ 時間，若把 64 位整數位數視為常數則常簡記為 $O(\sqrt N)$。回傳完整列表需 $O(\sqrt N)$ 輸出空間；串流逐個處理可用 $O(1)$ 額外空間。

## 常見錯誤與邊界條件

- 負數應直接判否（負號不對稱）。
- 末位為 0 而本身非 0 的數不可能是迴文（首位不會是 0）。
- 奇數長度時忘記 `rev / 10` 去掉中間位。
- 生成時奇偶兩種長度只做一種而漏解。
- 先做 `value * 10 + digit` 再檢查會在比較前就溢位。
- 把所有奇數長度全部生成完才生成偶數長度，輸出不會全域有序。

## 與相似技巧的比較

轉字串後用雙指標比較最直觀，適合面試口述，但需 $O(\log x)$ 空間；只反轉一半省空間且避免整數反轉溢位。若要找「下一個迴文數」或「範圍內第 `k` 個迴文」，一律走生成路線而非逐一判斷。

## 本節重點速查

- 只反轉一半，條件是 `x > rev`
- 奇數位比 `rev / 10`
- 負數與尾零直接否
- 大範圍要用生成而非枚舉。
