## 這個技術解決什麼問題

設計支援等機率隨機取樣的資料結構與演算法：$O(1)$ 隨機取元素、$O(1)$ 插入刪除、對長度未知的資料流等機率取樣、以及公平洗牌。

## 狀態／資料結構定義

`O(1)` 隨機取元素的結構用「陣列 + 雜湊表」：陣列存放全部元素供隨機索引，雜湊表記錄每個元素在陣列中的位置，讓刪除也能 $O(1)$。洗牌則就地交換，不需額外空間。

## 不變量或正確性證明

不變量（結構）：陣列恰好存放當前集合的全部元素且無空洞，雜湊表中每個元素的記錄值等於它在陣列中的真實下標。

$O(1)$ 刪除的手法是「與尾端交換再彈出」：把待刪元素與陣列最後一個元素交換，更新後者在雜湊表中的下標，再彈出尾端。這維持了「無空洞」，因而隨機取索引才是等機率的。

Fisher-Yates 洗牌的正確性：由後往前，對每個 `i` 從 `[0, i]` 中隨機選 `j` 並交換 `a[i]` 與 `a[j]`。

證明每種排列的機率皆為 $1/n!$：第一步把某個元素放到位置 `n-1` 的機率為 $1/n$，第二步在剩下 `n-1` 個中選一個放到位置 `n-2` 的機率為 $1/(n-1)$，依此類推。任一指定排列出現的機率為 $\frac{1}{n}\cdot\frac{1}{n-1}\cdots\frac{1}{1} = \frac{1}{n!}$，且所有排列都可達，故均勻。

常見的錯誤寫法是從 `[0, n-1]` 全域隨機選 `j`，那會產生 $n^n$ 條等機率路徑，無法被 $n!$ 整除，因此分布必然不均勻。

蓄水池抽樣（資料流取一個）：對第 `i` 個元素（由 1 起算）以機率 $1/i$ 取代目前保留者。歸納可證：處理完 `i` 個後每個元素被保留的機率皆為 $1/i$——新元素為 $1/i$，舊元素為 $\frac{1}{i-1}\cdot\frac{i-1}{i} = \frac1i$。

## 時間與空間複雜度

隨機取、插入、刪除皆為期望 $O(1)$，空間 $O(n)$。洗牌 $O(n)$ 時間、$O(1)$ 額外空間。蓄水池抽樣 $O(n)$ 時間、$O(1)$ 空間。

## C++17 模板

```cpp
class RandomizedSet {
public:
    bool insert(int val) {
        if (index_.count(val)) {
            return false;
        }
        index_[val] = values_.size();
        values_.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = index_.find(val);
        if (it == index_.end()) {
            return false;
        }
        const int pos = it->second;
        values_[pos] = values_.back();  // 與尾端交換
        index_[values_[pos]] = pos;     // 更新被搬過來的元素
        values_.pop_back();
        index_.erase(it);
        return true;
    }

    int getRandom() {
        return values_[uniform_int_distribution<int>(0,
                                                     values_.size() - 1)(rng_)];
    }

private:
    vector<int> values_;
    unordered_map<int, int> index_;
    mt19937 rng_{random_device{}()};
};
```

## 常見錯誤與邊界條件

- 刪除後忘記更新被搬到前面那個元素的下標。
- 先 `pop_back` 再更新而讀到已失效的值。
- 洗牌用全域隨機下標造成分布不均。
- 空集合時 `getRandom` 越界。
- `rand() % n` 有模偏差，應使用 `uniform_int_distribution`。

## 與相似技巧的比較

允許重複元素時，雜湊表的值要改成下標集合（`unordered_set`），刪除任取其一；若只需取樣而不需刪除，直接對陣列隨機索引即可；資料流長度未知時只能用蓄水池抽樣。

## 本節重點速查

- 陣列加雜湊表
- 刪除靠與尾端交換
- Fisher-Yates 要從 `[0, i]` 選
- 蓄水池第 `i` 個以 $1/i$ 取代。
