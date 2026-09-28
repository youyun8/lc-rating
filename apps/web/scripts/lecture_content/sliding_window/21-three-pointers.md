## 這個技術解決什麼問題

用一個右端點搭配**兩個**左端點，在單次掃描中直接算出「恰好型」的答案，取代「至多 `k` 減至多 `k-1`」的兩次滑窗。也用於需要同時追蹤兩個不同閾值邊界的問題。

## 辨識題型的訊號

題目要求「恰好 `k` 個」的子陣列個數；或需要同時維護「最寬的合法視窗」與「最窄的合法視窗」；或在三個序列／三個位置之間協調前進。

## 核心想法與直覺

「恰好 `k`」等於「至多 `k`」減「至多 `k-1`」。既然兩個滑窗的右端點走法完全相同，就沒必要掃兩遍——讓它們共用同一個 `right`，各自維護自己的左端點 `left1`（對應至多 `k`）與 `left2`（對應至多 `k-1`）。

因為 `k-1` 的條件更嚴格，`left2` 永遠不會落在 `left1` 左邊。於是以 `right` 結尾、數量恰好為 `k` 的子陣列，其左端點集合正是 `[left1, left2)`，個數為 `left2 - left1`。

## 狀態／資料結構定義

`left1` 是使視窗滿足「至多 `k`」的最小左端點；`left2` 是使視窗滿足「至多 `k-1`」的最小左端點。兩者各自維護一份統計量，恆有 `left1 <= left2 <= right + 1`。

## 不變量或正確性證明

不變量：每輪處理完後，`left1` 為滿足「數量不超過 `k`」的最小左端點，`left2` 為滿足「數量不超過 `k-1`」的最小左端點，且 `left1 <= left2`。

順序關係的證明：任何滿足「不超過 `k-1`」的區間必然滿足「不超過 `k`」，因此 `left2` 所在位置也是「至多 `k`」的合法左端點；由 `left1` 的最小性得 `left1 <= left2`。

計數的正確性：左端點 `l` 使 `[l, right]` 的數量恰好為 `k`，等價於「不超過 `k`」成立且「不超過 `k-1`」不成立，即 `left1 <= l < left2`。這個集合的大小恰為 `left2 - left1`。各個 `right` 的貢獻互不重疊，總和即為答案。

## 逐步演算法

右端點右移並更新兩份統計量；分別收縮 `left1` 直到數量不超過 `k`、收縮 `left2` 直到數量不超過 `k-1`；累加 `left2 - left1`；掃完回傳總和。

## C++17 模板

以「恰好含 `k` 種不同整數的子陣列個數」為例：

```cpp
class Solution {
public:
    int subarraysWithKDistinct(vector<int>& nums, int k) {
        unordered_map<int, int> count1, count2;
        long long answer = 0;
        int left1 = 0, left2 = 0;

        for (int right = 0; right < static_cast<int>(nums.size()); ++right) {
            ++count1[nums[right]];
            ++count2[nums[right]];

            while (static_cast<int>(count1.size()) > k) {  // 維持至多 k
                if (--count1[nums[left1]] == 0) {
                    count1.erase(nums[left1]);
                }
                ++left1;
            }
            while (static_cast<int>(count2.size()) > k - 1) {  // 維持至多 k-1
                if (--count2[nums[left2]] == 0) {
                    count2.erase(nums[left2]);
                }
                ++left2;
            }
            answer += left2 - left1;  // 恰好 k 的個數
        }
        return static_cast<int>(answer);
    }
};
```

## 時間與空間複雜度

三個指標各自單調右移，總移動 $O(n)$，時間 $O(n)$，只掃一遍。空間 $O(\min(n, \Sigma))$ 用於兩份統計表。

## 常見錯誤與邊界條件

- 兩份統計量共用同一個表（必須各自獨立，否則收縮會互相干擾）。
- `left1` 與 `left2` 的角色寫反，導致差值為負。
- `k` 為 0 時「至多 `-1`」永遠不成立，`left2` 會推進到 `right + 1`，需確認題意或特判。
- 次數歸零時忘記從表中刪除，使 `size()` 失真。

## 與相似技巧的比較

兩次「至多」相減的寫法程式更短、更不易錯，是預設選擇；三指標省下一次掃描，在需要同時取用兩個邊界的變形題（例如同時要回報最短與最長的合法視窗）中才真正不可取代。兩者複雜度同為 $O(n)$。

## 本節重點速查

- 共用右端點、兩個左端點；
- `left1 <= left2`；
- 累加 `left2 - left1`；
- 兩份統計量必須各自獨立。
