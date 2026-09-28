## 這個技術解決什麼問題

在**已排序**的陣列（或具備類似單調結構的資料）上，用一頭一尾兩個指標相向移動，把 $O(n^2)$ 的兩重列舉降到 $O(n)$。經典應用是兩數之和、三數之和、盛最多水的容器、驗證迴文。

## 辨識題型的訊號

陣列已排序或可以先排序；要找一對元素滿足某個和／差的條件；或要從兩端同時判斷（迴文、容器面積）。若題目要求保留原始下標，排序前需先記錄。

## 核心想法與直覺

關鍵在於每次比較都能**確定性地淘汰一整排候選**。以有序陣列找兩數之和為例：若 `nums[left] + nums[right] < target`，那麼 `nums[left]` 與任何不大於 `nums[right]` 的元素相加都更小，因此 `left` 這個元素與所有右側候選都無望，可以直接右移 `left`。反之則左移 `right`。每次比較淘汰一列，總共 $O(n)$ 步。

## 狀態／資料結構定義

`left` 與 `right` 分別從兩端出發，維持 `left < right`。搜尋空間是「所有 `left <= i < j <= right` 的配對」，每次移動都在縮小這個矩形區域。

## 不變量或正確性證明

不變量：所有尚未被檢查的可行解，其下標都落在 `[left, right]` 區間內。

證明淘汰的安全性（以兩數之和為例）：當 `nums[left] + nums[right] < target` 時，對任意 `j` 滿足 `left < j <= right`，由陣列有序知 `nums[j] <= nums[right]`，故 `nums[left] + nums[j] <= nums[left] + nums[right] < target`。也就是說，以 `left` 為左端的所有配對都不可能達到 `target`，右移 `left` 不會丟失任何解。對稱地，和過大時左移 `right` 同樣安全。因此不變量在每步之後保持，指標相遇時搜尋空間為空，所有解都已被檢查過。

盛水容器的淘汰理由不同但同樣嚴格：面積由較矮的一側決定，移動較高的一側寬度變小而高度不會增加，故必不更優，只能移動較矮的一側。

## 逐步演算法

必要時先排序；`left` 置於開頭、`right` 置於結尾；比較當前組合與目標，依上述規則移動其中一個指標；相遇即結束。

## C++17 模板

有序陣列找兩數之和：

```cpp
vector<int> twoSum(const vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        const int sum = nums[left] + nums[right];
        if (sum == target) {
            return {left, right};
        }
        if (sum < target) {
            ++left;
        } else {
            --right;
        }
    }
    return {};
}
```

三數之和：固定最小的一個，對其右側跑相向雙指標，並在兩層都跳過重複值以去重：

```cpp
sort(nums.begin(), nums.end());
for (int i = 0; i + 2 < n; ++i) {
    if (i > 0 && nums[i] == nums[i - 1]) {
        continue;
    }  // 去重
    int left = i + 1, right = n - 1;
    while (left < right) {
        const long long sum = 1LL * nums[i] + nums[left] + nums[right];
        if (sum < 0) {
            ++left;
        } else if (sum > 0) {
            --right;
        } else {
            answer.push_back({nums[i], nums[left], nums[right]});
            ++left;
            --right;
            while (left < right && nums[left] == nums[left - 1]) {
                ++left;
            }
            while (left < right && nums[right] == nums[right + 1]) {
                --right;
            }
        }
    }
}
```

## 時間與空間複雜度

雙指標本身 $O(n)$；若需先排序則總計 $O(n \log n)$。三數之和為 $O(n^2)$。空間 $O(1)$（不計排序與輸出）。

## 常見錯誤與邊界條件

- 忘記陣列必須有序。
- 迴圈條件寫成 `left <= right` 而讓同一元素被使用兩次。
- 去重邏輯遺漏或位置寫錯（應在移動後才跳過重複）。
- 找到解後只移動一個指標導致重複輸出。
- 和的計算溢位需轉 `long long`。
- 排序後下標改變而題目要求原始下標。

## 與相似技巧的比較

雜湊表解兩數之和不需排序且為 $O(n)$，但無法自然去重、也不適合「最接近目標」這類需要有序性的變形；二分搜尋是固定一端再查另一端，為 $O(n \log n)$，比雙指標多一個對數因子。

## 本節重點速查

- 必須先有序；
- 每次比較淘汰一整列候選；
- `left < right` 不可寫成 `<=`；
- 去重在移動之後做。
