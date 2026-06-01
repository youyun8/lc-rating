#!/usr/bin/env python3
"""
Standardize all leaf tutorial summaries.

Run from repo root:
  python3 apps/web/scripts/standardize_tutorial_leaf_summaries.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

WEB_ROOT = Path(__file__).resolve().parent.parent
TUTORIAL_DIR = WEB_ROOT / "public" / "tutorial"
STUDYPLAN_DIR = WEB_ROOT / "public" / "studyplan"
PROBLEMS_PATH = WEB_ROOT / "public" / "problemset" / "problems.json"


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def clean_title(title: str) -> str:
    title = re.sub(r"^\d+(?:\.\d+)*\.?\s*", "", str(title)).strip()
    return title or str(title).strip()


def normalize_id(value: Any) -> str:
    return str(value).strip()


def display_rating(problem: dict[str, Any], rating_map: dict[str, float]) -> str:
    score = problem.get("score")
    pid = normalize_id(problem.get("id", ""))
    rating = score if isinstance(score, (int, float)) else rating_map.get(pid)
    if isinstance(rating, (int, float)):
        return str(round(rating))
    return "N/A"


def collect_studyplan_leaves(root: dict[str, Any]) -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}

    def walk(node: dict[str, Any]) -> None:
        children = node.get("children") or []
        if children:
            for child in children:
                walk(child)
            return
        node_id = node.get("id")
        if isinstance(node_id, int):
            out[node_id] = node

    for child in root.get("children") or []:
        walk(child)
    return out


def problem_line(problem: dict[str, Any], rating_map: dict[str, float]) -> str:
    pid = normalize_id(problem.get("id", ""))
    title = clean_title(problem.get("title") or problem.get("titleSlug") or "題目")
    rating = display_rating(problem, rating_map)
    premium = "，Premium" if problem.get("isPremium") or problem.get("premium") else ""
    prefix = f"{pid}. " if pid else ""
    return f"{prefix}{title}（rating: {rating}{premium}）"


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


EXAMPLE_NOTES: dict[str, str] = {
    "34": "練習在重複元素中找左右邊界；核心不是找到任一 target，而是分別找第一個 `>= target` 與第一個 `> target`。",
    "35": "把插入位置視為第一個 `>= target` 的下標，統一處理存在與不存在兩種情況。",
    "704": "確認閉區間二分的不變式：`[l, r]` 內仍可能有答案，每次比較後刪掉不可能的一半。",
    "373": "把每個 `nums1[i]` 搭配 `nums2` 的和視為一條遞增鏈，用小根堆只展開當前最小的下一對；適合對照「產生前 K 個」與「只求第 K 個值」的差別。",
    "378": "矩陣行列有序時，不必攤平成 `n^2` 個數；對值 `x` 從左下或右上計算 `<= x` 的數量，二分第一個計數達到 `k` 的值。",
    "410": "把「分成 `k` 段後最大段和最小」改成判斷上限 `limit` 能否在不超過 `k` 段內完成。",
    "475": "把暖爐半徑視為答案門檻；半徑越大越容易覆蓋所有房屋，因此可二分最小可行半徑。",
    "668": "乘法表不用真的建表；固定 `x` 後第 `i` 列有 `min(n, x / i)` 個數不超過 `x`，這就是排名判斷。",
    "719": "先排序陣列，固定距離 `x` 後用雙指標統計距離 `<= x` 的數對數，再二分最小可達第 `k` 名的距離。",
    "786": "分數有序但候選是有理數；可二分值並用雙指標計數，同時記錄不超過門檻的最大分數作答案候選。",
    "1648": "把逐顆賣球改成價格層門檻：先二分最後會賣到的價格層，再用等差級數一次加總收益。",
    "275": "在已排序引用數中二分 H 指數 `h`：若至少有 `h` 篇論文引用數不小於 `h`，就嘗試更大的 `h`。",
    "1552": "排序座標後，判斷能否放下 `m` 顆球且相鄰距離至少為 `d`；`d` 越小越容易，答案要找最後一個可行值。",
}


def generated_example_note(title: str, kind: str, topic: str) -> str:
    topic = clean_title(topic)
    if kind in {"binary", "binary_answer", "binary_minimax", "binary_maximin", "binary_kth"}:
        if "binary_kth" == kind or has_any(title, ["第 K", "第 k", "中位數", "第 N"]):
            return "先把候選集合視為有排名的多重集合；練習寫 `count(<=x)`，再找第一個排名達標的值。"
        if kind == "binary_maximin":
            return "把答案當成保底下限；練習證明下限提高後只會更難，並用偏右二分找最後可行值。"
        if kind == "binary_minimax":
            return "把答案當成允許上限；練習設計 `check(limit)`，判斷所有局部成本能否被壓在上限內。"
        return "重點是定義候選值 `x` 的語意；先畫出真假分界，再決定找第一個或最後一個可行值。"
    if kind.startswith("dp"):
        if kind == "dp_rob":
            return "把選/不選造成的相鄰限制寫進狀態；練習用兩個狀態隔離非法轉移。"
        if has_any(title, ["股票", "買賣"]):
            return "把持有/未持有、交易次數或冷凍期寫進狀態；練習列出合法狀態轉移。"
        if has_any(title, ["樹", "二叉"]):
            return "適合練自底向上的樹形 DP；每個節點要回傳可被父節點合併的資訊。"
        if has_any(title, ["方案", "統計", "數目", "數量", "個數", "組合"]):
            return "這是計數型 DP；先說清 `dp` 計的是前綴、容量還是狀態集合，並處理模數與初始化。"
        if has_any(title, ["最大", "最小", "最佳", "最高", "最低"]):
            return "這是最優值 DP；練習把最後一步拆成若干前態，並確認取 `min/max` 的狀態已完整。"
        if has_any(title, ["路徑", "網格", "矩陣"]):
            return "把位置與限制一起放進狀態；練習檢查移動方向、邊界與滾動更新順序。"
        return f"放在「{topic}」下，重點是先定義狀態含義，再由最後一步推導轉移與答案位置。"
    if kind.startswith("graph"):
        if has_any(title, ["課程", "依賴", "拓撲", "序列"]):
            return "把先後限制建成有向邊；練習用入度或 DFS 顏色判斷拓撲序與環。"
        if has_any(title, ["最短", "最少", "距離", "路徑", "到達"]):
            return "核心是狀態圖最短路；先判斷邊權是 1、0/1 還是一般非負權，再選 BFS 或 Dijkstra。"
        if has_any(title, ["連通", "省份", "合併", "分量"]):
            return "要維護連通塊；練習比較 DFS/BFS 標記與並查集合併的邊界。"
        if "環" in title:
            return "要把環的判定條件寫清楚；練習區分無向圖 parent、 directed graph 顏色與拓撲剩餘點。"
        return "先做圖建模：節點代表什麼、邊代表什麼、額外狀態是否要進入 visited/dist。"
    if kind in {"grid"}:
        return "把格子當節點處理；練習明確 visited、方向陣列、障礙與多源/單源的差別。"
    if kind in {"greedy", "greedy_regret"}:
        if has_any(title, ["區間", "會議", "射氣球"]):
            return "先選排序鍵；練習用右端點、左端點或覆蓋範圍證明局部選擇不吃虧。"
        if has_any(title, ["字典序", "最大數", "最小"]):
            return "通常從高位或關鍵位置決策；練習說明當前選擇如何保留後續最優空間。"
        if kind == "greedy_regret" or has_any(title, ["課程", "加油", "反悔"]):
            return "適合練反悔貪心；先接受候選，違法時用堆刪掉最不划算的一項。"
        return "不能只憑局部最大；請寫出選擇規則，並用交換論證或歸納說明它保留最優解。"
    if kind in {"sliding", "sliding_fixed", "sliding_min"}:
        if kind == "sliding_fixed":
            return "視窗長度固定；練習用進出兩端的差量維護總和、頻次或最值。"
        if kind == "sliding_min":
            return "通常是達標後收縮左端；練習在每次合法時更新最短答案。"
        return "先判斷合法性是否隨左右端單調變化；再決定何時移動左端與何時計數。"
    if kind in {"mono_stack", "mono_rect"}:
        return "要找最近的更大/更小邊界；練習用單調結構讓每個元素只進出一次。"
    if kind in {"prefix_sum"}:
        return "要把區間量改寫成前綴狀態之差；若是計數題，重點是查找過去需要的前綴值。"
    if kind in {"enumeration"}:
        return "要固定一個枚舉維度，再維護另一側已看過的資訊；重點是避免雙重暴力重複掃描。"
    if kind in {"heap"}:
        return "需要反覆取出當前最優候選；練習定義堆中元素代表的邊界與過期清理規則。"
    if kind in {"trie"}:
        return "要共用前綴路徑；練習分清單詞終止、前綴計數與子節點結構。"
    if kind in {"dsu"}:
        return "把等價或連通關係合併到代表元；練習在 union 時同步維護集合資訊。"
    if kind in {"fenwick", "segment_tree"}:
        return "有動態更新與區間查詢；練習先離散化值域，再確認查詢/更新的閉開區間。"
    if kind in {"stack"}:
        return "用堆疊保存尚未匹配或尚未結算的元素；練習每次 push/pop 對不變式的影響。"
    if kind in {"queue"}:
        return "用佇列維持時間順序或視窗順序；練習清理過期元素與保持端點語意一致。"
    if kind in {"bitwise"}:
        return "要拆成位元看；練習判斷 XOR/AND/OR 的每一位能否獨立統計或貪心決策。"
    if kind in {"string", "palindrome"}:
        if has_any(title, ["迴文", "回文"]):
            return "要利用左右對稱；練習同時處理奇偶中心、半徑或區間狀態。"
        return "重點是重用已比對資訊；練習把 border、LCP、hash 或自動機狀態寫成不變式。"
    if kind in {"math", "game", "vote"}:
        if has_any(title, ["質數", "因數", "整除"]):
            return "先處理整除與篩法邊界；練習用根號枚舉或預處理避免逐一暴力。"
        if has_any(title, ["遊戲", "博弈"]):
            return "要先定義必勝/必敗態；練習從終止局面反推轉移。"
        if has_any(title, ["組合", "排列", "方案"]):
            return "先拆成計數模型；練習確認是否需要容斥、排列順序或模逆元。"
        return "需要先公式化；練習用小資料驗證規律，再處理溢位、取模或精度。"
    return f"放在「{topic}」下，是為了練習該小節的核心狀態與不變式；請先寫出資料如何表示，再寫答案如何更新。"


def example_note(problem: dict[str, Any], kind: str, topic: str, index: int) -> str:
    del index
    pid = normalize_id(problem.get("id", ""))
    if pid in EXAMPLE_NOTES:
        return EXAMPLE_NOTES[pid]
    title = clean_title(problem.get("title") or problem.get("titleSlug") or "題目")
    return generated_example_note(title, kind, topic)


def representative_examples(
    problems: list[dict[str, Any]],
    rating_map: dict[str, float],
    kind: str,
    topic: str,
) -> str:
    if not problems:
        return "- 本節題單尚未配置代表題；建議先用章節標題關鍵字到題庫搜尋同型題，並記錄暴力解與正解差異。"
    rows: list[str] = []
    for idx, problem in enumerate(problems[:5]):
        rows.append(f"- {problem_line(problem, rating_map)}：{example_note(problem, kind, topic, idx)}")
    return "\n".join(rows)


CODE_SNIPPETS: dict[str, dict[str, str]] = {
    "704": {
        "name": "LeetCode 704. 二分查詢",
        "cpp": """class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = (int)nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
};""",
        "explain": "用閉區間維護候選答案；每次比較後刪掉必不可能含答案的一半。若改成二分答案，`target` 會替換成 `check(mid)` 的可行性。"
    },
    "410": {
        "name": "LeetCode 410. 分割陣列的最大值",
        "cpp": """class Solution {
public:
    int splitArray(vector<int>& nums, int k) {
        long long l = *max_element(nums.begin(), nums.end());
        long long r = accumulate(nums.begin(), nums.end(), 0LL);
        auto ok = [&](long long limit) {
            int groups = 1;
            long long sum = 0;
            for (int x : nums) {
                if (sum + x > limit) {
                    groups++;
                    sum = 0;
                }
                sum += x;
            }
            return groups <= k;
        };
        while (l < r) {
            long long mid = l + (r - l) / 2;
            if (ok(mid)) r = mid;
            else l = mid + 1;
        }
        return (int)l;
    }
};""",
        "explain": "答案越大越容易分割成功，因此可二分最小可行值；`ok` 只做貪心掃描，維持每段和不超過 `limit`。"
    },
    "378": {
        "name": "LeetCode 378. 有序矩陣中第 K 小的元素",
        "cpp": """class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        int l = matrix[0][0], r = matrix[n - 1][n - 1];
        auto countLE = [&](int x) {
            int cnt = 0, row = n - 1, col = 0;
            while (row >= 0 && col < n) {
                if (matrix[row][col] <= x) {
                    cnt += row + 1;
                    col++;
                } else {
                    row--;
                }
            }
            return cnt;
        };
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (countLE(mid) >= k) r = mid;
            else l = mid + 1;
        }
        return l;
    }
};""",
        "explain": "二分的是元素值而不是矩陣下標；`countLE(x)` 利用行列有序在線性時間計算排名，最後找第一個排名至少為 `k` 的值。"
    },
    "1552": {
        "name": "LeetCode 1552. 兩球之間的磁力",
        "cpp": """class Solution {
public:
    int maxDistance(vector<int>& position, int m) {
        sort(position.begin(), position.end());
        int l = 1, r = position.back() - position.front();
        auto ok = [&](int dist) {
            int cnt = 1, last = position[0];
            for (int x : position) {
                if (x - last >= dist) {
                    cnt++;
                    last = x;
                }
            }
            return cnt >= m;
        };
        while (l < r) {
            int mid = l + (r - l + 1) / 2;
            if (ok(mid)) l = mid;
            else r = mid - 1;
        }
        return l;
    }
};""",
        "explain": "距離下限越小越容易放球，因此 `ok(dist)` 是前半段可行、後半段不可行；用偏右中點尋找最後一個可行距離。"
    },
    "475": {
        "name": "LeetCode 475. 供暖器",
        "cpp": """class Solution {
public:
    int findRadius(vector<int>& houses, vector<int>& heaters) {
        sort(houses.begin(), houses.end());
        sort(heaters.begin(), heaters.end());
        int l = 0, r = max(houses.back(), heaters.back()) - min(houses[0], heaters[0]);
        auto ok = [&](int radius) {
            int j = 0;
            for (int house : houses) {
                while (j < (int)heaters.size() && heaters[j] + radius < house) j++;
                if (j == (int)heaters.size() || heaters[j] - radius > house) return false;
            }
            return true;
        };
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (ok(mid)) r = mid;
            else l = mid + 1;
        }
        return l;
    }
};""",
        "explain": "半徑越大越容易覆蓋全部房屋，所以要找第一個可行半徑；`ok(radius)` 用排序後的暖爐指標線性掃描。"
    },
    "275": {
        "name": "LeetCode 275. H 指數 II",
        "cpp": """class Solution {
public:
    int hIndex(vector<int>& citations) {
        int n = citations.size();
        int l = 0, r = n;
        auto ok = [&](int h) {
            return h == 0 || citations[n - h] >= h;
        };
        while (l < r) {
            int mid = l + (r - l + 1) / 2;
            if (ok(mid)) l = mid;
            else r = mid - 1;
        }
        return l;
    }
};""",
        "explain": "`h` 越大條件越難滿足；排序後只要檢查第 `n-h` 篇是否至少有 `h` 次引用，並找最後一個可行的 `h`。"
    },
    "1648": {
        "name": "LeetCode 1648. 銷售價值減少的顏色球",
        "cpp": """class Solution {
public:
    int maxProfit(vector<int>& inventory, int orders) {
        const long long MOD = 1000000007;
        long long l = 0, r = *max_element(inventory.begin(), inventory.end());
        auto countGreater = [&](long long price) {
            long long cnt = 0;
            for (int x : inventory) {
                if (x > price) cnt += x - price;
            }
            return cnt;
        };
        while (l < r) {
            long long mid = l + (r - l) / 2;
            if (countGreater(mid) <= orders) r = mid;
            else l = mid + 1;
        }

        long long floor = l, sold = 0, ans = 0;
        for (int x : inventory) {
            if (x <= floor) continue;
            long long cnt = x - floor;
            sold += cnt;
            ans = (ans + (x + floor + 1) * cnt / 2) % MOD;
        }
        ans = (ans + (orders - sold) * floor) % MOD;
        return (int)ans;
    }
};""",
        "explain": "逐顆賣會太慢；二分價格地板 `floor` 後，所有高於它的完整價格層可用等差級數加總，剩餘訂單都以 `floor` 價格補齊。"
    },
    "643": {
        "name": "LeetCode 643. 子陣列最大平均數 I",
        "cpp": """class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int sum = 0;
        for (int i = 0; i < k; ++i) sum += nums[i];
        int best = sum;
        for (int i = k; i < (int)nums.size(); ++i) {
            sum += nums[i] - nums[i - k];
            best = max(best, sum);
        }
        return (double)best / k;
    }
};""",
        "explain": "定長視窗只需要維護進出兩端的差量，避免重算每個子陣列。所有同型題都可替換 `sum/best` 為頻次、種類數或最值結構。"
    },
    "3": {
        "name": "LeetCode 3. 無重複字元的最長子串",
        "cpp": """class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> cnt(256);
        int ans = 0, left = 0;
        for (int right = 0; right < (int)s.size(); ++right) {
            cnt[s[right]]++;
            while (cnt[s[right]] > 1) cnt[s[left++]]--;
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};""",
        "explain": "右端加入新元素後，只在違反條件時移動左端；因此每個位置最多進出視窗一次，總複雜度為 O(n)。"
    },
    "76": {
        "name": "LeetCode 76. 最小覆蓋子串",
        "cpp": """class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128), win(128);
        int missing = 0;
        for (char c : t) if (need[c]++ == 0) missing++;
        int bestLen = INT_MAX, bestL = 0;
        for (int l = 0, r = 0; r < (int)s.size(); ++r) {
            if (++win[s[r]] == need[s[r]]) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) bestLen = r - l + 1, bestL = l;
                if (win[s[l]]-- == need[s[l]]) missing++;
                l++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};""",
        "explain": "視窗越長越容易合法；每次合法後盡量收縮左端，收縮前更新最短答案。"
    },
    "496": {
        "name": "LeetCode 496. 下一個更大元素 I",
        "cpp": """class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        unordered_map<int, int> nxt;
        vector<int> st;
        for (int x : nums2) {
            while (!st.empty() && st.back() < x) {
                nxt[st.back()] = x;
                st.pop_back();
            }
            st.push_back(x);
        }
        vector<int> ans;
        for (int x : nums1) ans.push_back(nxt.count(x) ? nxt[x] : -1);
        return ans;
    }
};""",
        "explain": "堆疊內維持遞減；當新元素更大時，它就是被彈出元素右側第一個更大值。"
    },
    "84": {
        "name": "LeetCode 84. 柱狀圖中最大的矩形",
        "cpp": """class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h = heights;
        h.push_back(0);
        vector<int> st;
        int ans = 0;
        for (int i = 0; i < (int)h.size(); ++i) {
            while (!st.empty() && h[st.back()] > h[i]) {
                int height = h[st.back()];
                st.pop_back();
                int left = st.empty() ? -1 : st.back();
                ans = max(ans, height * (i - left - 1));
            }
            st.push_back(i);
        }
        return ans;
    }
};""",
        "explain": "每根柱子在被彈出時，左右第一個更矮位置都已確定；哨兵 0 可強制清空堆疊。"
    },
    "70": {
        "name": "LeetCode 70. 爬樓梯",
        "cpp": """class Solution {
public:
    int climbStairs(int n) {
        int a = 1, b = 1;
        for (int i = 2; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};""",
        "explain": "`dp[i]` 由最後一步從 `i-1` 或 `i-2` 轉移而來；只依賴前兩項時可滾動壓縮。"
    },
    "53": {
        "name": "LeetCode 53. 最大子陣列和",
        "problem_id": "53",
        "cpp": """class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int bestEnd = nums[0], ans = nums[0];
        for (int i = 1; i < (int)nums.size(); ++i) {
            bestEnd = max(nums[i], bestEnd + nums[i]);
            ans = max(ans, bestEnd);
        }
        return ans;
    }
};""",
        "explain": "`bestEnd` 表示必須以當前位置結尾的最大子陣列和；每一步決定接上前一段或從當前元素重新開始。"
    },
    "198": {
        "name": "LeetCode 198. 打家劫舍",
        "cpp": """class Solution {
public:
    int rob(vector<int>& nums) {
        int skip = 0, take = 0;
        for (int x : nums) {
            int newTake = skip + x;
            skip = max(skip, take);
            take = newTake;
        }
        return max(skip, take);
    }
};""",
        "explain": "狀態代表上一間是否偷；每處理一間房只從合法前態轉移，避免相鄰同選。"
    },
    "300": {
        "name": "LeetCode 300. 最長遞增子序列",
        "cpp": """class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tail;
        for (int x : nums) {
            auto it = lower_bound(tail.begin(), tail.end(), x);
            if (it == tail.end()) tail.push_back(x);
            else *it = x;
        }
        return tail.size();
    }
};""",
        "explain": "`tail[len]` 維護長度為 `len+1` 的遞增子序列最小結尾；結尾越小，後續延伸空間越大。"
    },
    "416": {
        "name": "LeetCode 416. 分割等和子集",
        "cpp": """class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        if (sum % 2) return false;
        int target = sum / 2;
        vector<char> dp(target + 1);
        dp[0] = true;
        for (int x : nums) {
            for (int s = target; s >= x; --s) dp[s] |= dp[s - x];
        }
        return dp[target];
    }
};""",
        "explain": "0-1 背包每個物品只能用一次，因此容量必須倒序更新，防止同一輪重複選取。"
    },
    "322": {
        "name": "LeetCode 322. 零錢兌換",
        "problem_id": "322",
        "cpp": """class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        const int INF = 1e9;
        vector<int> dp(amount + 1, INF);
        dp[0] = 0;
        for (int s = 1; s <= amount; ++s) {
            for (int c : coins) {
                if (s >= c) dp[s] = min(dp[s], dp[s - c] + 1);
            }
        }
        return dp[amount] == INF ? -1 : dp[amount];
    }
};""",
        "explain": "完全背包中硬幣可重複使用；`dp[s]` 表示湊出金額 s 的最少硬幣數，從所有最後一枚硬幣轉移。"
    },
    "64": {
        "name": "LeetCode 64. 最小路徑和",
        "problem_id": "64",
        "cpp": """class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<int> dp(n, INT_MAX / 2);
        dp[0] = 0;
        for (int r = 0; r < m; ++r) {
            dp[0] += grid[r][0];
            for (int c = 1; c < n; ++c) {
                dp[c] = min(dp[c], dp[c - 1]) + grid[r][c];
            }
        }
        return dp[n - 1];
    }
};""",
        "explain": "網格 DP 的前態只來自上方與左方；用一維 `dp[c]` 時，更新前代表上方，`dp[c-1]` 代表左方。"
    },
    "1143": {
        "name": "LeetCode 1143. 最長公共子序列",
        "problem_id": "1143",
        "cpp": """class Solution {
public:
    int longestCommonSubsequence(string a, string b) {
        int m = a.size(), n = b.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[m][n];
    }
};""",
        "explain": "`dp[i][j]` 表示兩個前綴的 LCS 長度；最後一個字元相等就一起選，否則丟掉其中一邊的尾字元。"
    },
    "139": {
        "name": "LeetCode 139. 單詞拆分",
        "problem_id": "139",
        "cpp": """class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        vector<char> dp(s.size() + 1);
        dp[0] = true;
        for (int i = 1; i <= (int)s.size(); ++i) {
            for (int j = 0; j < i; ++j) {
                if (dp[j] && dict.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.size()];
    }
};""",
        "explain": "劃分型 DP 枚舉最後一段 `[j,i)`；只要前綴 `j` 可行且最後一段在字典中，前綴 `i` 就可行。"
    },
    "121": {
        "name": "LeetCode 121. 買賣股票的最佳時機",
        "problem_id": "121",
        "cpp": """class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int bestBuy = INT_MAX, ans = 0;
        for (int price : prices) {
            bestBuy = min(bestBuy, price);
            ans = max(ans, price - bestBuy);
        }
        return ans;
    }
};""",
        "explain": "狀態機可壓成「目前最低買入價」與「目前最大收益」；賣出日固定時，最優買入日一定在它之前。"
    },
    "516": {
        "name": "LeetCode 516. 最長迴文子序列",
        "problem_id": "516",
        "cpp": """class Solution {
public:
    int longestPalindromeSubseq(string s) {
        int n = s.size();
        vector<vector<int>> dp(n, vector<int>(n));
        for (int i = n - 1; i >= 0; --i) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; ++j) {
                if (s[i] == s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
                else dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
        return dp[0][n - 1];
    }
};""",
        "explain": "區間 DP 按長度由短到長，或讓左端點倒序；`dp[i][j]` 依賴更短區間，因此更新順序不能反。"
    },
    "526": {
        "name": "LeetCode 526. 優美的排列",
        "problem_id": "526",
        "cpp": """class Solution {
public:
    int countArrangement(int n) {
        int full = 1 << n;
        vector<int> dp(full);
        dp[0] = 1;
        for (int mask = 0; mask < full; ++mask) {
            int pos = __builtin_popcount((unsigned)mask) + 1;
            for (int i = 1; i <= n; ++i) {
                if (mask >> (i - 1) & 1) continue;
                if (i % pos == 0 || pos % i == 0) dp[mask | (1 << (i - 1))] += dp[mask];
            }
        }
        return dp[full - 1];
    }
};""",
        "explain": "狀壓 DP 用 mask 表示已放的數；已放數量決定下一個位置，因此狀態不需要再額外存 pos。"
    },
    "600": {
        "name": "LeetCode 600. 不含連續 1 的非負整數",
        "problem_id": "600",
        "cpp": """class Solution {
public:
    int findIntegers(int n) {
        string bits;
        for (int x = n; x; x >>= 1) bits.push_back('0' + (x & 1));
        reverse(bits.begin(), bits.end());
        if (bits.empty()) bits = "0";
        int memo[32][2];
        memset(memo, -1, sizeof(memo));
        function<int(int,int,bool)> dfs = [&](int i, int prev, bool tight) -> int {
            if (i == (int)bits.size()) return 1;
            if (!tight && memo[i][prev] != -1) return memo[i][prev];
            int up = tight ? bits[i] - '0' : 1;
            int ans = 0;
            for (int b = 0; b <= up; ++b) {
                if (prev && b) continue;
                ans += dfs(i + 1, b, tight && b == up);
            }
            if (!tight) memo[i][prev] = ans;
            return ans;
        };
        return dfs(0, 0, true);
    }
};""",
        "explain": "數位 DP 從高位到低位枚舉，`tight` 表示前綴是否貼著上界；本題額外記錄上一位是否為 1。"
    },
    "1425": {
        "name": "LeetCode 1425. 帶限制的子序列和",
        "problem_id": "1425",
        "cpp": """class Solution {
public:
    int constrainedSubsetSum(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> dp(nums.size());
        int ans = INT_MIN;
        for (int i = 0; i < (int)nums.size(); ++i) {
            while (!dq.empty() && dq.front() < i - k) dq.pop_front();
            dp[i] = nums[i] + (dq.empty() ? 0 : max(0, dp[dq.front()]));
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
            ans = max(ans, dp[i]);
        }
        return ans;
    }
};""",
        "explain": "`dp[i]` 需要查前 k 個位置的最大 dp 值；單調佇列把這個區間最大值查詢降成均攤 O(1)。"
    },
    "337": {
        "name": "LeetCode 337. 打家劫舍 III",
        "problem_id": "337",
        "cpp": """class Solution {
public:
    pair<int,int> dfs(TreeNode* root) {
        if (!root) return {0, 0};
        auto [l0, l1] = dfs(root->left);
        auto [r0, r1] = dfs(root->right);
        int skip = max(l0, l1) + max(r0, r1);
        int take = root->val + l0 + r0;
        return {skip, take};
    }
    int rob(TreeNode* root) {
        auto [skip, take] = dfs(root);
        return max(skip, take);
    }
};""",
        "explain": "樹形 DP 回傳兩個狀態：不選當前節點與選當前節點；父節點只需合併子節點的這兩種結果。"
    },
    "486": {
        "name": "LeetCode 486. 預測贏家",
        "problem_id": "486",
        "cpp": """class Solution {
public:
    bool predictTheWinner(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> dp(n, vector<int>(n));
        for (int i = 0; i < n; ++i) dp[i][i] = nums[i];
        for (int len = 2; len <= n; ++len) {
            for (int l = 0; l + len <= n; ++l) {
                int r = l + len - 1;
                dp[l][r] = max(nums[l] - dp[l + 1][r], nums[r] - dp[l][r - 1]);
            }
        }
        return dp[0][n - 1] >= 0;
    }
};""",
        "explain": "博弈 DP 常改成目前玩家相對對手的最大分差；選左端或右端後，剩餘區間輪到對手。"
    },
    "688": {
        "name": "LeetCode 688. 騎士在棋盤上的機率",
        "problem_id": "688",
        "cpp": """class Solution {
public:
    double knightProbability(int n, int k, int row, int column) {
        vector<vector<double>> dp(n, vector<double>(n));
        dp[row][column] = 1.0;
        int dirs[8][2] = {{1,2},{2,1},{2,-1},{1,-2},{-1,-2},{-2,-1},{-2,1},{-1,2}};
        while (k--) {
            vector<vector<double>> ndp(n, vector<double>(n));
            for (int r = 0; r < n; ++r) {
                for (int c = 0; c < n; ++c) {
                    for (auto& d : dirs) {
                        int nr = r + d[0], nc = c + d[1];
                        if (0 <= nr && nr < n && 0 <= nc && nc < n) ndp[nr][nc] += dp[r][c] / 8.0;
                    }
                }
            }
            dp = move(ndp);
        }
        double ans = 0;
        for (auto& rowVals : dp) ans += accumulate(rowVals.begin(), rowVals.end(), 0.0);
        return ans;
    }
};""",
        "explain": "機率 DP 把每一步的機率分散到下一層狀態；越界的轉移直接丟棄，最後棋盤內機率總和就是答案。"
    },
    "200": {
        "name": "LeetCode 200. 島嶼數量",
        "cpp": """class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = grid.size(), n = grid[0].size(), ans = 0;
        int dirs[5] = {1, 0, -1, 0, 1};
        function<void(int,int)> dfs = [&](int r, int c) {
            grid[r][c] = '0';
            for (int k = 0; k < 4; ++k) {
                int nr = r + dirs[k], nc = c + dirs[k + 1];
                if (0 <= nr && nr < m && 0 <= nc && nc < n && grid[nr][nc] == '1') {
                    dfs(nr, nc);
                }
            }
        };
        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c)
                if (grid[r][c] == '1') ans++, dfs(r, c);
        return ans;
    }
};""",
        "explain": "每次遇到未訪問陸地就開一個連通塊，DFS 把同島所有格子標記掉。"
    },
    "743": {
        "name": "LeetCode 743. 網路延遲時間",
        "cpp": """class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> g(n + 1);
        for (auto& e : times) g[e[0]].push_back({e[1], e[2]});
        const int INF = 1e9;
        vector<int> dist(n + 1, INF);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        dist[k] = 0;
        pq.push({0, k});
        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d != dist[u]) continue;
            for (auto [v, w] : g[u]) {
                if (dist[v] > d + w) {
                    dist[v] = d + w;
                    pq.push({dist[v], v});
                }
            }
        }
        int ans = *max_element(dist.begin() + 1, dist.end());
        return ans == INF ? -1 : ans;
    }
};""",
        "explain": "非負權最短路使用 Dijkstra；堆中舊距離要跳過，避免重複鬆弛造成常數過大。"
    },
    "547_dfs": {
        "name": "LeetCode 547. 省份數量",
        "problem_id": "547",
        "cpp": """class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), ans = 0;
        vector<char> vis(n);
        function<void(int)> dfs = [&](int u) {
            vis[u] = true;
            for (int v = 0; v < n; ++v) {
                if (isConnected[u][v] && !vis[v]) dfs(v);
            }
        };
        for (int i = 0; i < n; ++i) {
            if (!vis[i]) {
                ans++;
                dfs(i);
            }
        }
        return ans;
    }
};""",
        "explain": "DFS 把同一連通塊的城市全部標記；每次遇到未訪問城市，就代表找到一個新的省份。"
    },
    "127_bfs": {
        "name": "LeetCode 127. 單詞接龍",
        "problem_id": "127",
        "cpp": """class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        queue<string> q;
        q.push(beginWord);
        words.erase(beginWord);
        for (int step = 1; !q.empty(); ++step) {
            for (int sz = q.size(); sz; --sz) {
                string cur = q.front(); q.pop();
                if (cur == endWord) return step;
                for (int i = 0; i < (int)cur.size(); ++i) {
                    char old = cur[i];
                    for (char ch = 'a'; ch <= 'z'; ++ch) {
                        cur[i] = ch;
                        if (words.erase(cur)) q.push(cur);
                    }
                    cur[i] = old;
                }
            }
        }
        return 0;
    }
};""",
        "explain": "每次改一個字母是一條無權邊；BFS 按層擴展，第一次到達終點就是最短變換長度。"
    },
    "210_topo": {
        "name": "LeetCode 210. 課程表 II",
        "problem_id": "210",
        "cpp": """class Solution {
public:
    vector<int> findOrder(int n, vector<vector<int>>& prerequisites) {
        vector<vector<int>> g(n);
        vector<int> indeg(n), ans;
        for (auto& e : prerequisites) {
            g[e[1]].push_back(e[0]);
            indeg[e[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < n; ++i) if (indeg[i] == 0) q.push(i);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            ans.push_back(u);
            for (int v : g[u]) {
                if (--indeg[v] == 0) q.push(v);
            }
        }
        return ans.size() == n ? ans : vector<int>{};
    }
};""",
        "explain": "拓撲排序維護入度為 0 的可學課程；若最後沒有取完所有節點，說明圖中存在環。"
    },
    "1334_floyd": {
        "name": "LeetCode 1334. 閾值距離內鄰居最少的城市",
        "problem_id": "1334",
        "cpp": """class Solution {
public:
    int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
        const int INF = 1e9;
        vector<vector<int>> dist(n, vector<int>(n, INF));
        for (int i = 0; i < n; ++i) dist[i][i] = 0;
        for (auto& e : edges) {
            dist[e[0]][e[1]] = dist[e[1]][e[0]] = e[2];
        }
        for (int k = 0; k < n; ++k)
            for (int i = 0; i < n; ++i)
                for (int j = 0; j < n; ++j)
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
        int ans = -1, best = INF;
        for (int i = 0; i < n; ++i) {
            int cnt = 0;
            for (int j = 0; j < n; ++j) cnt += dist[i][j] <= distanceThreshold;
            if (cnt <= best) best = cnt, ans = i;
        }
        return ans;
    }
};""",
        "explain": "Floyd 枚舉中轉點 `k`，逐步允許路徑經過更多中間點；適合點數較小的全源最短路。"
    },
    "1584_mst": {
        "name": "LeetCode 1584. 連接所有點的最小費用",
        "problem_id": "1584",
        "cpp": """class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size(), ans = 0;
        vector<int> minDist(n, INT_MAX);
        vector<char> used(n);
        minDist[0] = 0;
        for (int it = 0; it < n; ++it) {
            int u = -1;
            for (int i = 0; i < n; ++i) {
                if (!used[i] && (u == -1 || minDist[i] < minDist[u])) u = i;
            }
            used[u] = true;
            ans += minDist[u];
            for (int v = 0; v < n; ++v) {
                int w = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                if (!used[v]) minDist[v] = min(minDist[v], w);
            }
        }
        return ans;
    }
};""",
        "explain": "Prim 每次把距離目前生成樹最近的點加入；`minDist[v]` 維護 v 連到已選集合的最小邊權。"
    },
    "332_euler": {
        "name": "LeetCode 332. 重新安排行程",
        "problem_id": "332",
        "cpp": """class Solution {
    unordered_map<string, priority_queue<string, vector<string>, greater<string>>> g;
    vector<string> ans;
    void dfs(const string& u) {
        auto& pq = g[u];
        while (!pq.empty()) {
            string v = pq.top();
            pq.pop();
            dfs(v);
        }
        ans.push_back(u);
    }
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        for (auto& e : tickets) g[e[0]].push(e[1]);
        dfs("JFK");
        reverse(ans.begin(), ans.end());
        return ans;
    }
};""",
        "explain": "Hierholzer 演算法沿邊走到底後回填路徑；用小根堆保存目的地，可同時滿足字典序最小要求。"
    },
    "785_bipartite": {
        "name": "LeetCode 785. 判斷二分圖",
        "problem_id": "785",
        "cpp": """class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> color(n, -1);
        for (int i = 0; i < n; ++i) {
            if (color[i] != -1) continue;
            queue<int> q;
            q.push(i);
            color[i] = 0;
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : graph[u]) {
                    if (color[v] == -1) {
                        color[v] = color[u] ^ 1;
                        q.push(v);
                    } else if (color[v] == color[u]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
};""",
        "explain": "二分圖染色要求每條邊兩端顏色相反；BFS/DFS 擴展時若遇到同色鄰點，就存在奇環。"
    },
    "206": {
        "name": "LeetCode 206. 反轉連結串列",
        "cpp": """class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* nxt = head->next;
            head->next = prev;
            prev = head;
            head = nxt;
        }
        return prev;
    }
};""",
        "explain": "每步先保存下一個節點，再反轉當前指標；連結串列題的核心是不要丟失後續鏈。"
    },
    "104": {
        "name": "LeetCode 104. 二叉樹的最大深度",
        "cpp": """class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};""",
        "explain": "後序 DFS 從子樹回傳資訊，父節點只負責合併左右答案；樹形 DP 也遵循這個資料流。"
    },
    "46": {
        "name": "LeetCode 46. 全排列",
        "cpp": """class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> ans;
        vector<int> path;
        vector<char> used(nums.size());
        function<void()> dfs = [&]() {
            if (path.size() == nums.size()) {
                ans.push_back(path);
                return;
            }
            for (int i = 0; i < (int)nums.size(); ++i) {
                if (used[i]) continue;
                used[i] = true;
                path.push_back(nums[i]);
                dfs();
                path.pop_back();
                used[i] = false;
            }
        };
        dfs();
        return ans;
    }
};""",
        "explain": "回溯維護路徑與可選集合；遞迴返回前恢復現場，確保下一個分支看到同樣的狀態。"
    },
    "435": {
        "name": "LeetCode 435. 無重疊區間",
        "cpp": """class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {
            return a[1] < b[1];
        });
        int kept = 0, end = INT_MIN;
        for (auto& in : intervals) {
            if (in[0] >= end) {
                kept++;
                end = in[1];
            }
        }
        return intervals.size() - kept;
    }
};""",
        "explain": "按右端點最小優先，能留下最多後續空間；這是區間排程的典型交換論證。"
    },
    "630": {
        "name": "LeetCode 630. 課程表 III",
        "cpp": """class Solution {
public:
    int scheduleCourse(vector<vector<int>>& courses) {
        sort(courses.begin(), courses.end(), [](auto& a, auto& b) {
            return a[1] < b[1];
        });
        priority_queue<int> pq;
        int time = 0;
        for (auto& c : courses) {
            time += c[0];
            pq.push(c[0]);
            if (time > c[1]) {
                time -= pq.top();
                pq.pop();
            }
        }
        return pq.size();
    }
};""",
        "explain": "先接受當前課程；若超過期限，就反悔刪掉耗時最長的一門，使已選集合的總時間最小。"
    },
    "28": {
        "name": "LeetCode 28. 找出字串中第一個匹配項的下標",
        "cpp": """class Solution {
public:
    int strStr(string haystack, string needle) {
        int m = needle.size();
        vector<int> pi(m);
        for (int i = 1; i < m; ++i) {
            int j = pi[i - 1];
            while (j && needle[i] != needle[j]) j = pi[j - 1];
            if (needle[i] == needle[j]) j++;
            pi[i] = j;
        }
        for (int i = 0, j = 0; i < (int)haystack.size(); ++i) {
            while (j && haystack[i] != needle[j]) j = pi[j - 1];
            if (haystack[i] == needle[j]) j++;
            if (j == m) return i - m + 1;
        }
        return -1;
    }
};""",
        "explain": "`pi[i]` 表示前綴的最長 border；失配時跳到下一個可能 border，而不是回頭重比。"
    },
    "5": {
        "name": "LeetCode 5. 最長迴文子串",
        "cpp": """class Solution {
public:
    string longestPalindrome(string s) {
        int bestL = 0, bestLen = 1;
        auto expand = [&](int l, int r) {
            while (l >= 0 && r < (int)s.size() && s[l] == s[r]) l--, r++;
            if (r - l - 1 > bestLen) {
                bestLen = r - l - 1;
                bestL = l + 1;
            }
        };
        for (int i = 0; i < (int)s.size(); ++i) {
            expand(i, i);
            expand(i, i + 1);
        }
        return s.substr(bestL, bestLen);
    }
};""",
        "explain": "中心擴展枚舉奇偶中心；Manacher 則把已知迴文半徑復用到下一個中心以降到 O(n)。"
    },
    "1310": {
        "name": "LeetCode 1310. 子陣列異或查詢",
        "cpp": """class Solution {
public:
    vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
        vector<int> pre(arr.size() + 1);
        for (int i = 0; i < (int)arr.size(); ++i) pre[i + 1] = pre[i] ^ arr[i];
        vector<int> ans;
        for (auto& q : queries) ans.push_back(pre[q[1] + 1] ^ pre[q[0]]);
        return ans;
    }
};""",
        "explain": "XOR 具有自反性 `x ^ x = 0`，因此區間 XOR 可用前綴 XOR 相消。"
    },
    "204": {
        "name": "LeetCode 204. 計數質數",
        "cpp": """class Solution {
public:
    int countPrimes(int n) {
        vector<char> isPrime(n, true);
        int ans = 0;
        for (int i = 2; i < n; ++i) {
            if (!isPrime[i]) continue;
            ans++;
            if ((long long)i * i < n) {
                for (long long j = 1LL * i * i; j < n; j += i) isPrime[j] = false;
            }
        }
        return ans;
    }
};""",
        "explain": "篩法從 `i*i` 開始標記合數，因為更小倍數已被更小質因數處理。"
    },
    "292": {
        "name": "LeetCode 292. Nim 遊戲",
        "cpp": """class Solution {
public:
    bool canWinNim(int n) {
        return n % 4 != 0;
    }
};""",
        "explain": "必敗態是能被 4 整除的局面；先手若不是必敗態，就能拿走若干石子把對手送到必敗態。"
    },
    "169": {
        "name": "LeetCode 169. 多數元素",
        "cpp": """class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int cand = 0, cnt = 0;
        for (int x : nums) {
            if (cnt == 0) cand = x;
            cnt += (x == cand ? 1 : -1);
        }
        return cand;
    }
};""",
        "explain": "摩爾投票把候選值與不同值兩兩抵消；若多數元素一定存在，最後留下的候選就是答案。"
    },
    "498": {
        "name": "LeetCode 498. 對角線遍歷",
        "cpp": """class Solution {
public:
    vector<int> findDiagonalOrder(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<int> ans;
        for (int s = 0; s <= m + n - 2; ++s) {
            vector<int> cur;
            for (int r = max(0, s - n + 1); r <= min(m - 1, s); ++r) {
                int c = s - r;
                cur.push_back(mat[r][c]);
            }
            if (s % 2 == 0) reverse(cur.begin(), cur.end());
            ans.insert(ans.end(), cur.begin(), cur.end());
        }
        return ans;
    }
};""",
        "explain": "同一條副對角線滿足 `r+c` 相同；先按對角線分組，再依題目要求決定是否反轉。"
    },
    "560": {
        "name": "LeetCode 560. 和為 K 的子陣列",
        "cpp": """class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> cnt;
        cnt[0] = 1;
        int pre = 0, ans = 0;
        for (int x : nums) {
            pre += x;
            ans += cnt[pre - k];
            cnt[pre]++;
        }
        return ans;
    }
};""",
        "explain": "若當前前綴和為 `pre`，要找和為 k 的左端點，就需要之前出現過 `pre-k`。"
    },
    "1109_diff": {
        "name": "LeetCode 1109. 航班預訂統計",
        "problem_id": "1109",
        "cpp": """class Solution {
public:
    vector<int> corpFlightBookings(vector<vector<int>>& bookings, int n) {
        vector<int> diff(n + 1);
        for (auto& b : bookings) {
            diff[b[0] - 1] += b[2];
            diff[b[1]] -= b[2];
        }
        vector<int> ans(n);
        int cur = 0;
        for (int i = 0; i < n; ++i) {
            cur += diff[i];
            ans[i] = cur;
        }
        return ans;
    }
};""",
        "explain": "差分把區間加轉成兩個端點更新；最後做一次前綴和即可還原每個位置的實際值。"
    },
    "20_stack": {
        "name": "LeetCode 20. 有效的括號",
        "problem_id": "20",
        "cpp": """class Solution {
public:
    bool isValid(string s) {
        vector<char> st;
        for (char c : s) {
            if (c == '(') st.push_back(')');
            else if (c == '[') st.push_back(']');
            else if (c == '{') st.push_back('}');
            else {
                if (st.empty() || st.back() != c) return false;
                st.pop_back();
            }
        }
        return st.empty();
    }
};""",
        "explain": "堆疊保存尚未匹配的右括號期待值；遇到右括號時必須和棧頂匹配，最後棧要清空。"
    },
    "933_queue": {
        "name": "LeetCode 933. 最近的請求次數",
        "problem_id": "933",
        "cpp": """class RecentCounter {
    queue<int> q;
public:
    int ping(int t) {
        q.push(t);
        while (q.front() < t - 3000) q.pop();
        return q.size();
    }
};""",
        "explain": "佇列按時間遞增保存請求；每次查詢前移除過期時間，剩下的就是目前視窗內的請求。"
    },
    "239_mono_queue": {
        "name": "LeetCode 239. 滑動視窗最大值",
        "problem_id": "239",
        "cpp": """class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> ans;
        for (int i = 0; i < (int)nums.size(); ++i) {
            while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (i >= k - 1) ans.push_back(nums[dq.front()]);
        }
        return ans;
    }
};""",
        "explain": "單調佇列保存可能成為最大值的下標；過期元素從隊首移除，被新元素支配的元素從隊尾移除。"
    },
    "215": {
        "name": "LeetCode 215. 陣列中的第 K 個最大元素",
        "cpp": """class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int x : nums) {
            pq.push(x);
            if ((int)pq.size() > k) pq.pop();
        }
        return pq.top();
    }
};""",
        "explain": "小根堆只保留目前最大的 k 個數；堆頂就是這 k 個數中最小者，也就是全域第 k 大。"
    },
    "208": {
        "name": "LeetCode 208. 實現 Trie",
        "cpp": """class Trie {
    struct Node {
        int child[26];
        bool end = false;
        Node() { fill(std::begin(child), std::end(child), -1); }
    };
    vector<Node> tr{Node()};
public:
    void insert(string word) {
        int u = 0;
        for (char ch : word) {
            int c = ch - 'a';
            if (tr[u].child[c] == -1) {
                tr[u].child[c] = tr.size();
                tr.push_back(Node());
            }
            u = tr[u].child[c];
        }
        tr[u].end = true;
    }
    bool search(string word) {
        int u = 0;
        for (char ch : word) {
            int c = ch - 'a';
            if (tr[u].child[c] == -1) return false;
            u = tr[u].child[c];
        }
        return tr[u].end;
    }
    bool startsWith(string prefix) {
        int u = 0;
        for (char ch : prefix) {
            int c = ch - 'a';
            if (tr[u].child[c] == -1) return false;
            u = tr[u].child[c];
        }
        return true;
    }
};""",
        "explain": "Trie 把共同前綴壓到同一條路徑；查詢完整單詞需檢查終止標記，前綴查詢則只需走到節點。"
    },
    "547": {
        "name": "LeetCode 547. 省份數量",
        "cpp": """class Solution {
    vector<int> parent;
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j)
                if (isConnected[i][j]) parent[find(i)] = find(j);
        int ans = 0;
        for (int i = 0; i < n; ++i) ans += find(i) == i;
        return ans;
    }
};""",
        "explain": "並查集把連通的點合併到同一代表元；最後代表元數量就是連通塊數。"
    },
    "307": {
        "name": "LeetCode 307. 區域和檢索 - 陣列可修改",
        "cpp": """class NumArray {
    int n;
    vector<int> bit, nums;
    void add(int i, int delta) {
        for (++i; i <= n; i += i & -i) bit[i] += delta;
    }
    int sumPrefix(int i) {
        int s = 0;
        for (++i; i > 0; i -= i & -i) s += bit[i];
        return s;
    }
public:
    NumArray(vector<int>& a) : n(a.size()), bit(n + 1), nums(a) {
        for (int i = 0; i < n; ++i) add(i, nums[i]);
    }
    void update(int index, int val) {
        add(index, val - nums[index]);
        nums[index] = val;
    }
    int sumRange(int left, int right) {
        return sumPrefix(right) - (left ? sumPrefix(left - 1) : 0);
    }
};""",
        "explain": "樹狀陣列維護前綴和差分；單點修改影響 O(log n) 個節點，區間和由兩個前綴和相減。"
    },
}


PROBLEM_STATEMENTS: dict[str, str] = {
    "704": "題意：給定升序整數陣列 `nums` 與目標值 `target`，若 `target` 存在則回傳下標，否則回傳 `-1`。",
    "410": "題意：將非負整數陣列 `nums` 分割成 `k` 個非空連續子陣列，最小化這 `k` 段中的最大段和。",
    "378": "題意：給定每列、每欄皆升序的 `n x n` 矩陣，回傳其中第 `k` 小的元素；重複值要分別計入排名。",
    "1552": "題意：給定籃子座標 `position` 與球數 `m`，選出 `m` 個位置放球，使任兩球距離的最小值最大化。",
    "475": "題意：給定房屋與暖爐座標，選一個統一供暖半徑，使每間房屋都至少被一個暖爐覆蓋，並最小化半徑。",
    "275": "題意：給定已升序排列的論文引用數，回傳研究者的 H 指數。",
    "1648": "題意：每種顏色球的售價等於目前剩餘數量，每賣出一顆該顏色售價減一；賣出 `orders` 顆以最大化收益。",
    "643": "題意：給定整數陣列與長度 `k`，找出長度剛好為 `k` 的連續子陣列最大平均值。",
    "3": "題意：給定字串 `s`，回傳不含重複字元的最長子字串長度。",
    "76": "題意：給定字串 `s` 與 `t`，找出 `s` 中涵蓋 `t` 所有字元需求的最短子字串。",
    "496": "題意：對 `nums1` 中每個元素，找出它在 `nums2` 右側第一個比它大的元素，若不存在則為 `-1`。",
    "84": "題意：給定柱狀圖高度陣列，找出能由相鄰柱子形成的最大矩形面積。",
    "70": "題意：每次可爬 1 或 2 階，給定階數 `n`，計算到達樓頂的不同方法數。",
    "53": "題意：給定整數陣列，找出和最大的非空連續子陣列並回傳其和。",
    "198": "題意：沿街房屋不能偷相鄰兩間，給定每間金額，求能偷到的最大總額。",
    "300": "題意：給定整數陣列，回傳最長嚴格遞增子序列的長度。",
    "416": "題意：判斷整數陣列能否分成兩個子集，使兩個子集元素和相等。",
    "322": "題意：給定硬幣面額與總金額，求湊出總金額所需的最少硬幣數；若無法湊出則回傳 `-1`。",
    "64": "題意：給定非負整數網格，只能向右或向下走，求從左上到右下的最小路徑和。",
    "1143": "題意：給定兩個字串，回傳它們的最長公共子序列長度。",
    "139": "題意：給定字串與字典，判斷字串能否被切分成一個或多個字典中的單詞。",
    "121": "題意：給定每天股價，只能買賣一次，求最大利潤。",
    "516": "題意：給定字串，回傳最長迴文子序列的長度。",
    "526": "題意：計算 1 到 n 的排列數量，使第 i 個位置上的數能整除 i 或被 i 整除。",
    "600": "題意：給定非負整數 n，計算 `[0,n]` 中二進位表示不含連續 1 的整數數量。",
    "1425": "題意：選擇一個非空子序列，使相鄰被選元素下標差不超過 k，並最大化元素和。",
    "337": "題意：在二叉樹上打家劫舍，不能同時偷直接相連的兩個節點，求最大金額。",
    "486": "題意：兩名玩家從陣列兩端輪流取數，判斷先手是否能保證分數不小於後手。",
    "688": "題意：騎士從指定格子出發走 k 步，每步等機率選一種騎士走法，求最後仍在棋盤內的機率。",
    "200": "題意：給定由水與陸地組成的網格，計算四方向相連的陸地島嶼數量。",
    "743": "題意：給定有向帶權邊、節點數與起點，求訊號從起點傳到所有節點所需的最長最短路時間；若有節點不可達則回傳 `-1`。",
    "547_dfs": "題意：給定城市連通矩陣，計算互相直接或間接連通的省份數量。",
    "127_bfs": "題意：每次只能改變一個字母，且中間字串必須在字典中，求從起點單詞到終點單詞的最短轉換長度。",
    "210_topo": "題意：給定課程數與先修關係，回傳一個可完成所有課程的修課順序；若不存在則回傳空陣列。",
    "1334_floyd": "題意：給定帶權無向圖與距離閾值，找出閾值內可達城市數最少的城市，平手取編號較大者。",
    "1584_mst": "題意：給定平面上的點，兩點連線成本為曼哈頓距離，求連通所有點的最小總成本。",
    "332_euler": "題意：給定機票起迄點，從 JFK 出發用完所有機票一次，回傳字典序最小的行程。",
    "785_bipartite": "題意：給定無向圖，判斷是否能把所有節點分成兩組，使每條邊兩端位於不同組。",
    "206": "題意：給定單向連結串列的頭節點，反轉整條串列並回傳新的頭節點。",
    "104": "題意：給定二叉樹根節點，回傳從根到最深葉節點的節點數。",
    "46": "題意：給定不重複整數陣列，列出所有可能排列。",
    "435": "題意：給定多個區間，移除最少區間，使剩下區間兩兩不重疊。",
    "630": "題意：每門課有修課時間與截止日，選最多課程，使每門被選課程都能在截止日前完成。",
    "28": "題意：在字串 `haystack` 中尋找字串 `needle` 第一次出現的位置，若不存在則回傳 `-1`。",
    "5": "題意：給定字串，回傳其中最長的迴文子字串。",
    "1310": "題意：給定陣列與多個 `[l, r]` 查詢，回傳每段子陣列的 XOR 值。",
    "204": "題意：給定整數 `n`，計算所有小於 `n` 的質數個數。",
    "292": "題意：兩人輪流從一堆石子中拿 1 到 3 顆，拿到最後一顆者勝，判斷先手在 `n` 顆石子時是否必勝。",
    "169": "題意：給定陣列，找出出現次數超過 `n / 2` 的多數元素；題目保證答案存在。",
    "498": "題意：給定矩陣，依題目指定的鋸齒狀對角線順序回傳所有元素。",
    "560": "題意：給定整數陣列與 `k`，計算和為 `k` 的連續子陣列數量。",
    "1109_diff": "題意：給定多筆航班區間座位預訂，回傳每個航班最後被預訂的座位數。",
    "20_stack": "題意：判斷只含括號字元的字串是否有效，括號必須按正確順序閉合。",
    "933_queue": "題意：設計計數器，對每次請求時間 `t`，回傳 `[t-3000,t]` 內的請求數。",
    "239_mono_queue": "題意：給定陣列與視窗大小 `k`，回傳每個滑動視窗中的最大值。",
    "215": "題意：給定未排序陣列與 `k`，回傳第 `k` 大元素。",
    "208": "題意：設計 Trie，支援插入單詞、查詢完整單詞、查詢是否存在指定前綴。",
    "547": "題意：給定城市連通矩陣，計算互相直接或間接連通的省份數量。",
    "307": "題意：設計可修改陣列，支援單點更新與區間和查詢。",
}


def display_problem_name(name: str) -> str:
    """Drop platform noise in lesson text while keeping the problem number."""
    return re.sub(r"^LeetCode\s+", "", name).strip()


def statement_body(statement: str) -> str:
    return re.sub(r"^題意：\s*", "", statement).strip()


FULL_PROBLEM_OVERRIDES: dict[str, str] = {
    "215": "給定整數陣列 `nums` 和整數 `k`，請回傳陣列排序後第 `k` 個最大的元素。第 `k` 大按照重複元素計算，不是第 `k` 個不同元素；題目只要求回傳元素值，不要求輸出排序後的陣列。",
}


def full_problem_body(snippet_id: str, statement: str) -> str:
    return FULL_PROBLEM_OVERRIDES.get(snippet_id, statement_body(statement))


def kind_family(kind: str) -> str:
    if kind.startswith("dp"):
        return "dp"
    if kind.startswith("graph"):
        return "graph"
    if kind.startswith("binary"):
        return "binary"
    return {
        "diff": "prefix_sum",
        "stack": "mono_stack",
        "queue": "sliding",
        "mono_queue": "sliding",
        "segment_tree": "fenwick",
        "mono_rect": "mono_stack",
        "greedy_regret": "heap",
        "palindrome": "string",
        "game": "math",
        "vote": "math",
    }.get(kind, kind)


PRINCIPLE_EXTRA_BY_FAMILY: dict[str, str] = {
    "binary": "使用這個 pattern 的原因，是每次判斷都能丟掉一整段不可能的候選，而不是逐一試。讀題時先找「有序」「單調」「第一個/最後一個」這些字眼；寫程式時則把 `l, r, mid` 對應到還可能含答案的範圍。",
    "sliding": "滑動視窗適合連續區間，因為左右端點都只往前走，窗口內的總和、頻次或種類數可以用增量更新。關鍵是先判斷條件是否會隨著左端右移而恢復合法，否則就不能硬套雙指標。",
    "mono_stack": "單調結構的作用是延後結算：元素還沒找到右邊界時先留在容器中，直到新元素破壞單調性才一次彈出。這樣每個元素只進出一次，省掉暴力向左右反覆尋找邊界的成本。",
    "dp": "DP 的價值在於把大量重複子問題收斂成狀態。動手前先用一句話定義 `dp` 的含義，再問「最後一步」從哪些前態來；若狀態無法描述未來所需資訊，轉移再漂亮也不可靠。",
    "graph": "圖論題不要急著套 BFS 或 Dijkstra，先定義節點、邊與邊權。當題目含有鑰匙、剩餘步數、免費次數等附加條件時，這些資訊也要進入狀態，否則 visited/dist 會把不同未來混在一起。",
    "grid": "網格題只是圖論的一種固定形狀。好處是鄰邊可以由方向陣列即時計算；難點是邊界、障礙、是否可重訪，以及狀態是否只靠座標就足夠。",
    "tree": "樹題通常靠 DFS 的資料流解決：自底向上回傳子樹摘要，自頂向下攜帶祖先資訊。每個遞迴函式最好只承擔一種語意，否則全域答案與回傳值容易混淆。",
    "backtracking": "回溯其實是在決策樹上做有紀律的暴搜。每次選擇後都要恢復現場，並用剪枝阻止不可能分支；若題目只求最值或計數，還要思考是否能記憶化成 DP。",
    "greedy": "貪心不是選看起來最大的那個，而是找到一個能被證明安全的局部規則。常見證明方式是交換論證：把任一最優解中的第一個不同決策換成貪心決策，答案不會變差。",
    "heap": "堆適合候選集合會動態變化的情境。暴力每一步重新排序是 `O(n log n)` 的重複工作；堆只維護目前需要的最大/最小候選，加入與取頂都是局部更新。反悔貪心中，堆頂通常代表「最該被淘汰」或「下一個最值得使用」的選項。",
    "string": "字串 pattern 的共同目標是避免重複比較。KMP/Z 重用前後綴資訊，雜湊把子串比較壓成常數級，自動機則把多次匹配轉成狀態轉移；選工具前先找昂貴操作是哪一種比較。",
    "bitwise": "位元題的簡化來自按位分析。若每一位互不影響，就能把整數問題拆成多個 0/1 問題；若有大小比較或進位，則通常從高位往低位固定，因為高位收益支配低位。",
    "math": "數學題的第一步是把文字條件翻成公式、整除、同餘、組合模型或幾何關係。小範圍暴力常用來猜規律，但最後仍要補上為何公式涵蓋全部情況與邊界。",
    "enumeration": "枚舉題的關鍵不是少枚舉，而是讓每個候選只被負責一次。常見做法是固定右端點、中心點、排序後的位置或對角線編號，剩下資訊用已維護的摘要回答。",
    "prefix_sum": "前綴技巧把區間查詢改成兩個狀態相減。當題目要反覆求連續區間和、餘數或計數時，先存歷史前綴，就能避免每次重新掃過整段。",
    "trie": "Trie 的優勢是共用前綴。若許多字串查詢都從第一個字元開始比較，樹狀前綴會把重複路徑合併；二進位 Trie 也用同樣思想逐位尋找最優配對。",
    "dsu": "並查集只回答集合代表與合併，不保存完整路徑。它適合只加邊的連通性；若題目要刪邊、查最短路或恢復具體路徑，通常需要離線倒序或換資料結構。",
    "fenwick": "樹狀陣列與線段樹都是把大區間拆成可合併的小區間。當資料會更新而查詢仍很多時，靜態前綴和不夠用，就需要用樹狀結構把修改與查詢都壓到對數級。",
}


SPECIFIC_PATTERN_CLUES: dict[str, str] = {
    "215": "題目只要求第 `k` 大，沒有要求完整排序；這表示掃描時只需保留目前最大的 `k` 個候選，小根堆堆頂正好是這批候選中最小的，也就是目前的第 `k` 大。",
    "630": "題目同時有「修課耗時」與「截止日」，掃描到某個截止日前若總時間超標，就必須從已選課程中反悔刪掉耗時最長者，這正是最大堆維護淘汰候選的線索。",
}


PATTERN_CLUE_BY_KIND: dict[str, str] = {
    "binary": "題目提供有序資料或明確的真假分界，答案落在第一個/最後一個滿足條件的位置，這是二分的主要線索。",
    "binary_answer": "題目要求最小化上限或最大化下限，且給定候選值後可以快速判斷可不可行，這是二分答案的線索。",
    "binary_minimax": "目標是壓低最大代價；看到「最小化最大值」時，通常把答案當成允許上限 `limit`，再檢查是否可行。",
    "binary_maximin": "目標是拉高最低保障；看到「最大化最小值」時，通常把答案當成下限，判斷是否還能完成安排。",
    "binary_kth": "題目問第 K 小/大，但候選集合太大不能全部列出；能計算 `<= x` 的候選數量，就是二分排名的線索。",
    "sliding_fixed": "題目限制連續區間且長度固定；只要每次加入右端、移出左端，就能增量維護答案。",
    "sliding": "題目限制連續子陣列/子字串，且合法性可透過移動左端恢復，這是滑動視窗的線索。",
    "sliding_min": "題目要求最短合法連續區間；一旦窗口合法就嘗試收縮左端，是越長越容易合法的線索。",
    "mono_stack": "題目要找最近更大/更小邊界或某元素的貢獻範圍；這表示元素應在單調結構中等待被右側元素結算。",
    "mono_rect": "題目把每個位置當作高度或邊界，要求最大矩形/範圍貢獻；左右第一個更矮/更小就是單調棧線索。",
    "dp": "題目能拆成前綴、位置或選擇序列，且不同路徑會到達相同子問題；需要把影響未來的資訊寫成狀態。",
    "graph": "題目描述可達、路徑、依賴或關係傳遞；把物件當節點、操作當邊後，就能選遍歷或最短路。",
    "grid": "題目在矩陣中移動、擴散或統計連通塊；格子可直接當節點，方向陣列就是隱式邊。",
    "tree": "題目資料本身是樹，或答案可由子樹合併/祖先下傳；DFS 的回傳值與參數就是核心線索。",
    "backtracking": "題目要求列出所有方案、排列、組合或路徑；需要逐步選擇並在返回時撤銷。",
    "greedy": "題目可拆成一連串決策，且存在排序鍵或局部選擇能保留後續最優空間；要同步準備交換論證。",
    "greedy_regret": "題目按順序接受候選，但限制可能被破壞；若違法時可刪掉已選集合中最差的一項，就是反悔貪心線索。",
    "heap": "題目反覆需要當前最大/最小、Top-K 或淘汰最差候選；堆能只維護必要候選而不必每步排序。",
    "string": "題目需要大量子串匹配、前後綴或相等比較；重用已比較資訊就是 KMP/Z/雜湊/自動機的線索。",
    "palindrome": "題目圍繞迴文的左右對稱；中心、半徑或區間兩端是最自然的狀態。",
    "bitwise": "題目出現 XOR/AND/OR、mask 或二進位；先判斷每一位是否能獨立統計或從高位貪心。",
    "math": "題目核心限制可翻成整除、同餘、組合數、幾何量或博弈狀態；公式化比資料結構更重要。",
    "enumeration": "題目看似多重枚舉，但其中一維可以固定，另一側用已掃描資訊或分組鍵維護。",
    "prefix_sum": "題目反覆詢問連續區間量；若區間值能由兩個前綴狀態相減，就應優先想到前綴和。",
    "trie": "題目大量查前綴、字典詞或逐位最優配對；共同前綴可被壓縮成樹路徑。",
    "dsu": "題目只需要維護等價關係或動態連通塊，且關係主要是加入而非刪除。",
    "fenwick": "題目同時有更新與區間/前綴查詢；若值域大，先離散化再用樹狀結構維護統計。",
}


CODE_WALKTHROUGH_BY_KIND: dict[str, list[str]] = {
    "binary": [
        "`l` 與 `r` 表示仍可能包含答案的範圍，`mid` 只是用來判斷要丟掉哪一半。",
        "每個分支都要能說明被排除的區間為何不可能含答案；這就是二分不變式。",
    ],
    "sliding": [
        "右端加入新元素後更新窗口狀態；若條件被破壞，就移動左端直到恢復合法。",
        "每個下標最多被加入與移出一次，因此整體是線性掃描。",
    ],
    "mono_stack": [
        "容器中保存尚未結算的元素；新元素破壞單調性時，被彈出的元素就找到了右邊界。",
        "程式通常存下標而非數值，因為答案需要計算距離或回填到原位置。",
    ],
    "dp": [
        "`dp` 變數代表已處理前綴或子問題的答案，不是模糊的目前最佳值。",
        "迴圈順序必須保證轉移來源已經算好；壓縮空間時更要確認讀到的是舊值還是新值。",
    ],
    "graph": [
        "先建出鄰接關係，再用 `visited`、`dist`、`indeg` 等狀態控制每個節點何時處理。",
        "如果同一節點在不同資源狀態下未來不同，就不能只用節點編號當 visited 鍵。",
    ],
    "grid": [
        "雙層迴圈枚舉格子，方向陣列負責產生相鄰節點。",
        "修改原網格或標記 visited 的時機，決定同一格是否會被重複處理。",
    ],
    "tree": [
        "遞迴函式回傳可被父節點合併的資訊，空節點返回值要和合併式相容。",
        "若需要全域答案，通常在回溯合併左右子樹時更新，而不是只看根節點。",
    ],
    "backtracking": [
        "`path` 保存目前已做的選擇，`used` 或 `start` 控制下一步可選集合。",
        "每次遞迴後都要撤銷選擇，讓下一個分支看到相同的現場。",
    ],
    "greedy": [
        "排序鍵必須直接服務於貪心證明；程式中的比較器就是解法的核心決策。",
        "掃描時維護的變數代表目前已選集合的邊界或成本，用來判斷下一個候選能否保留。",
    ],
    "heap": [
        "堆中只放目前仍有機會影響答案的候選，堆頂代表下一個要使用或淘汰的元素。",
        "每次加入新候選後立刻修正堆大小或合法性，確保迴圈不變式在下一輪成立。",
    ],
    "string": [
        "預處理陣列或狀態機保存已比對資訊，主迴圈失配時不用回到原點重比。",
        "下標與長度的換算要固定，尤其是 border、LCP、半徑與回傳起點。",
    ],
    "bitwise": [
        "程式把整數轉成位元狀態或前綴 XOR，利用位元運算的可逆性/獨立性更新答案。",
        "涉及高位貪心時，迴圈通常從最高位往低位試，因為高位決定主要大小關係。",
    ],
    "math": [
        "程式直接落實公式或必勝/必敗規律；重點是邊界、溢位與取模。",
        "若規律來自小樣本，實作前要先確認公式對最小值與極值都成立。",
    ],
    "enumeration": [
        "外層迴圈固定一個維度，內層只處理與該維度相關的必要候選。",
        "分組鍵、左右端點或對角線編號要先算清合法範圍，避免漏算邊界。",
    ],
    "prefix_sum": [
        "前綴狀態先保存空前綴，讓從下標 0 開始的區間也能統一處理。",
        "查詢區間時只做兩個前綴狀態相減；計數題則查找歷史中需要的前綴值。",
    ],
    "trie": [
        "每個節點代表一段前綴；插入和查詢都沿著同一條字元路徑前進。",
        "完整單詞查詢要檢查終止標記，前綴查詢只需要能走到對應節點。",
    ],
    "dsu": [
        "`find` 取得代表元，`union` 只合併兩個代表元；額外資訊也應掛在代表元上。",
        "最後統計答案時要再次 `find`，避免使用尚未壓縮的中間父節點。",
    ],
    "fenwick": [
        "`add` 沿著 `i += i & -i` 更新所有包含該點的桶，`sum` 沿著 `i -= i & -i` 收集前綴。",
        "外部下標與內部 1-indexed 下標要分清，離散化後也不要混用原值。",
    ],
}


SPECIFIC_CODE_WALKTHROUGH: dict[str, list[str]] = {
    "215": [
        "`priority_queue<int, vector<int>, greater<int>>` 是小根堆，堆頂是目前保留元素中最小的一個。",
        "每讀到一個數先 `push` 進候選集合；若堆大小超過 `k`，就 `pop` 掉最小值，留下目前最大的 `k` 個數。",
        "掃描結束後，堆內恰好是全陣列最大的 `k` 個元素；其中最小者 `pq.top()` 就是第 `k` 大。",
    ],
    "630": [
        "課程先按截止日排序，確保掃描到目前為止只需滿足當前及更早的截止日。",
        "最大堆保存已選課程的耗時；一旦總時間超過當前截止日，就刪掉耗時最長的一門課。",
        "刪掉最長課程後，已選課程數少一但總時間降最多，留下的集合最有機會容納後續課程。",
    ],
}


def build_principle_intro(kind: str, principle: str) -> str:
    family = kind_family(kind)
    extra = PRINCIPLE_EXTRA_BY_FAMILY.get(
        kind,
        PRINCIPLE_EXTRA_BY_FAMILY.get(
            family,
            "這個 pattern 的價值在於把暴力中的重複工作壓成可維護的狀態。讀題時先找資料如何進入、候選何時失效、答案在哪一步更新；這三件事對齊後，程式架構通常就清楚了。",
        ),
    )
    return f"{principle}\n\n{extra}"


def build_pattern_clue(kind: str, snippet_id: str, patterns: list[str]) -> str:
    if snippet_id in SPECIFIC_PATTERN_CLUES:
        return SPECIFIC_PATTERN_CLUES[snippet_id]
    family = kind_family(kind)
    if kind in PATTERN_CLUE_BY_KIND:
        return PATTERN_CLUE_BY_KIND[kind]
    if family in PATTERN_CLUE_BY_KIND:
        return PATTERN_CLUE_BY_KIND[family]
    if patterns:
        return f"題目中的「{patterns[0]}」是主要線索；先把它翻成狀態、候選集合或判斷函式，再套用本節 pattern。"
    return "先找出題目中可被維護的不變式，再決定資料如何表示、答案何時更新。"


def build_code_walkthrough(kind: str, snippet_id: str, snippet: dict[str, str]) -> str:
    bullets = SPECIFIC_CODE_WALKTHROUGH.get(snippet_id)
    if bullets is not None:
        return "\n".join(f"- {line}" for line in bullets)

    family = kind_family(kind)
    bullets = CODE_WALKTHROUGH_BY_KIND.get(
        kind,
        CODE_WALKTHROUGH_BY_KIND.get(family, CODE_WALKTHROUGH_BY_KIND["dp"]),
    )
    return "\n".join([f"- {snippet['explain']}", *(f"- {line}" for line in bullets)])


DEFAULT_SNIPPET_BY_KIND = {
    "binary": "704",
    "binary_answer": "410",
    "binary_minimax": "410",
    "binary_maximin": "1552",
    "binary_kth": "378",
    "sliding_fixed": "643",
    "sliding": "3",
    "sliding_min": "76",
    "mono_stack": "496",
    "mono_rect": "84",
    "dp": "70",
    "dp_linear": "53",
    "dp_rob": "198",
    "dp_grid": "64",
    "dp_lcs": "1143",
    "dp_lis": "300",
    "dp_knapsack": "416",
    "dp_complete_knapsack": "322",
    "dp_partition": "139",
    "dp_state_machine": "121",
    "dp_interval": "516",
    "dp_bitmask": "526",
    "dp_digit": "600",
    "dp_optimized": "1425",
    "dp_tree": "337",
    "dp_game": "486",
    "dp_probability": "688",
    "graph": "743",
    "graph_dfs": "547_dfs",
    "graph_bfs": "127_bfs",
    "graph_topo": "210_topo",
    "graph_dijkstra": "743",
    "graph_floyd": "1334_floyd",
    "graph_mst": "1584_mst",
    "graph_euler": "332_euler",
    "graph_bipartite": "785_bipartite",
    "grid": "200",
    "linked_list": "206",
    "tree": "104",
    "backtracking": "46",
    "greedy": "435",
    "greedy_regret": "630",
    "string": "28",
    "palindrome": "5",
    "bitwise": "1310",
    "math": "204",
    "game": "292",
    "vote": "169",
    "enumeration": "498",
    "prefix_sum": "560",
    "diff": "1109_diff",
    "stack": "20_stack",
    "queue": "933_queue",
    "mono_queue": "239_mono_queue",
    "heap": "215",
    "trie": "208",
    "dsu": "547",
    "fenwick": "307",
}


def infer_kind(fname: str, path_titles: list[str]) -> str:
    local_titles = path_titles[1:] if len(path_titles) > 1 else path_titles
    joined = " > ".join(local_titles)
    leaf = path_titles[-1]
    if fname == "binary_search.json":
        if any(k in joined for k in ["第 K", "第K"]):
            return "binary_kth"
        if "最小化最大" in joined:
            return "binary_minimax"
        if "最大化最小" in joined:
            return "binary_maximin"
        if any(k in joined for k in ["求最小", "求最大", "分間接值"]):
            return "binary_answer"
        return "binary"
    if fname == "sliding_window.json":
        if "定長" in joined or "基礎" in path_titles[-1]:
            return "sliding_fixed"
        if "最短" in joined or "越長越合法" in joined:
            return "sliding_min"
        return "sliding"
    if fname == "monotonic_stack.json":
        if "矩形" in joined:
            return "mono_rect"
        return "mono_stack"
    if fname == "dynamic_programming.json":
        if "網格" in joined:
            return "dp_grid"
        if any(k in joined for k in ["最大子陣列", "最大子段", "其他線性 DP", "一維 DP", "子陣列 DP", "計數 DP", "前字尾分解"]):
            return "dp_linear"
        if "完全背包" in joined:
            return "dp_complete_knapsack"
        if "打家劫舍" in joined:
            return "dp_rob"
        if "LCS" in joined or "最長公共子序列" in joined:
            return "dp_lcs"
        if "LIS" in joined or "最長遞增" in joined:
            return "dp_lis"
        if "背包" in joined:
            return "dp_knapsack"
        if "劃分" in joined or "划分" in joined:
            return "dp_partition"
        if "狀態機" in joined or "股票" in joined:
            return "dp_state_machine"
        if "區間 DP" in joined or "迴文子序列" in joined:
            return "dp_interval"
        if "狀態壓縮" in joined or "狀壓" in joined or "TSP" in joined or "SOS" in joined:
            return "dp_bitmask"
        if "數位 DP" in joined:
            return "dp_digit"
        if "優化 DP" in joined:
            return "dp_optimized"
        if "樹形 DP" in joined or "樹的" in joined or "樹上" in joined or "換根" in joined:
            return "dp_tree"
        if "圖 DP" in joined or "跳躍遊戲" in joined or "把 X 變成 Y" in joined:
            return "graph_bfs"
        if "博弈" in joined:
            return "dp_game"
        if "機率" in joined or "期望" in joined:
            return "dp_probability"
        return "dp"
    if fname == "graph.json":
        if "DFS" in joined or "深度優先" in joined:
            return "graph_dfs"
        if "BFS" in joined or "廣度優先" in joined:
            return "graph_bfs"
        if "拓撲" in joined:
            return "graph_topo"
        if "基環" in joined or "強連通" in joined or "雙連通" in joined:
            return "graph_dfs"
        if "Dijkstra" in joined or "單源最短路" in joined:
            return "graph_dijkstra"
        if "SPFA" in joined or "差分約束" in joined:
            return "graph_bfs"
        if "Floyd" in joined or "全源最短路" in joined:
            return "graph_floyd"
        if "最小生成樹" in joined:
            return "graph_mst"
        if "尤拉" in joined:
            return "graph_euler"
        if "二分圖" in joined:
            return "graph_bipartite"
        return "graph"
    if fname == "grid.json":
        return "grid"
    if fname == "trees.json" and ("連結串列" in joined or "鏈結" in joined):
        return "linked_list"
    if fname == "trees.json" and "回溯" in joined:
        return "backtracking"
    if fname == "trees.json":
        return "tree"
    if fname == "data_structure.json":
        if any(k in joined for k in ["字首和", "前綴和", "前缀和"]):
            return "prefix_sum"
        if "差分" in joined:
            return "diff"
        if "字典樹" in joined or "Trie" in joined:
            return "trie"
        if "並查集" in joined or "并查集" in joined:
            return "dsu"
        if "樹狀" in joined or "Fenwick" in joined or "線段樹" in joined or "线段树" in joined:
            return "fenwick"
        if "堆" in joined and "堆疊" not in joined:
            return "heap"
        if "單調佇列" in joined or "單調隊列" in joined:
            return "mono_queue"
        if "堆疊" in joined or "棧" in joined:
            return "mono_stack" if "單調" in joined else "stack"
        if "佇列" in joined or "隊列" in joined:
            return "queue"
        if any(k in joined for k in ["列舉", "枚舉", "遍歷對角線", "遍历对角线"]):
            return "enumeration"
        return "prefix_sum"
    if fname == "greedy.json" and "反悔" in joined:
        return "greedy_regret"
    if fname == "greedy.json":
        return "greedy"
    if fname == "string.json" and ("迴文" in joined or "Manacher" in joined):
        return "palindrome"
    if fname == "string.json":
        return "string"
    if fname == "bitwise_operations.json":
        return "bitwise"
    if fname == "math.json" and ("博弈" in leaf or "Nim" in leaf):
        return "game"
    if fname == "math.json" and ("摩爾" in leaf or "投票" in leaf):
        return "vote"
    if fname == "math.json":
        return "math"
    if "二分" in joined:
        if any(k in joined for k in ["第 K", "第K"]):
            return "binary_kth"
        if "最小化最大" in joined:
            return "binary_minimax"
        if "最大化最小" in joined:
            return "binary_maximin"
        return "binary_answer" if any(k in joined for k in ["最小", "最大"]) else "binary"
    if "滑動" in joined or "雙指標" in joined:
        return "sliding_min" if "最短" in joined else "sliding"
    if "單調堆疊" in joined:
        return "mono_stack"
    if "資料結構" in joined or "資料流" in joined or "API" in joined:
        return "heap"
    if "數學" in joined:
        return "math"
    if "動態規劃" in joined or "高階 DP" in joined:
        return "dp_optimized"
    if "固定一個維度" in joined:
        return "enumeration"
    if "最短路" in joined or "壓縮 BFS" in joined or "狀態空間" in joined:
        return "graph_bfs"
    if "圖" in joined:
        return "grid" if "網格" in joined else "graph"
    if "樹" in joined:
        return "tree"
    if "貪心" in joined:
        return "greedy_regret" if "反悔" in joined else "greedy"
    if "字串" in joined or "KMP" in joined or "Z 函式" in joined:
        return "palindrome" if "迴文" in joined else "string"
    if "位元" in joined or "XOR" in joined or "異或" in joined:
        return "bitwise"
    return "dp"


def topic_pack(kind: str, leaf: str, parent: str) -> tuple[str, list[str], list[str], list[str]]:
    topic = clean_title(leaf)
    parent_topic = clean_title(parent)
    special_packs: dict[str, tuple[str, list[str], list[str], list[str]]] = {
        "dp_grid": (
            f"「{topic}」把座標當成狀態。先確認每格可從哪些方向轉移而來，再決定是否能用一維滾動壓縮。",
            ["題目在矩陣/三角形/棋盤上移動或計數。", "每個位置的答案由相鄰位置轉移。", "限制可能包含障礙、方向、步數或剩餘資源。", "資料量通常要求 O(mn) 或在此基礎上壓縮。"],
            ["最短/最小路徑和。", "路徑條數與障礙格。", "多起點、多終點或雙人同步行走。"],
            ["先定義 `dp[r][c]` 的含義。", "一維壓縮時分清上方與左方。", "障礙格要阻斷轉移。", "雙人路徑常需升維表示兩個位置。"],
        ),
        "dp_lcs": (
            f"「{topic}」處理兩個序列的前綴關係。狀態通常是 `dp[i][j]`，表示兩個前綴在某種匹配規則下的最優值或方案數。",
            ["題目問兩字串/兩陣列的公共子序列、編輯距離或交錯匹配。", "最後一個元素是否匹配會改變轉移。", "刪除、插入、替換可視為前綴狀態移動。", "需要保留順序但不一定連續。"],
            ["LCS、編輯距離。", "最短公共超序列。", "正則/萬用字元匹配。"],
            ["初始化空前綴。", "相等與不相等分支要分開寫。", "子序列與子字串不同。", "若要恢復方案，需要保存前驅。"],
        ),
        "dp_complete_knapsack": (
            f"「{topic}」允許同一物品重複使用。和 0-1 背包最大的差異是容量更新方向與轉移語意。",
            ["每種物品/操作可用多次。", "限制通常是容量、金額、長度或目標和。", "答案可能是最少物品數、最大價值或方案數。", "容量值域可接受 O(nW) 或 O(W)。"],
            ["零錢兌換最少硬幣。", "完全背包方案數。", "無限次拼接/構造。"],
            ["容量正序更新才能重複使用同一物品。", "方案數題要分清排列與組合。", "不可達狀態要初始化為 INF。", "若物品有順序限制，不能直接套完全背包。"],
        ),
        "dp_partition": (
            f"「{topic}」把答案拆成若干段。核心是枚舉最後一段的起點，檢查這段是否合法或代價是多少，再和前綴答案合併。",
            ["題目要求把字串/陣列切成若干段。", "每段有獨立合法性或代價。", "答案是可行性、最小代價、最大得分或方案數。", "段數可能有限制。"],
            ["單詞拆分。", "迴文切割。", "固定段數的最優劃分。"],
            ["預處理段合法性可降複雜度。", "枚舉最後一段時注意空段。", "段數限制要進狀態。", "若代價符合單調性，可能可再優化。"],
        ),
        "dp_state_machine": (
            f"「{topic}」把互斥狀態畫成狀態機。每一步先列出能從哪些舊狀態轉入，再決定是否需要交易次數、冷凍期或持有狀態。",
            ["每個位置有少數互斥狀態。", "當前選擇會限制下一步。", "題目常見於股票、擺動、乘積正負、冷凍期。", "局部貪心可能被後續限制推翻。"],
            ["股票持有/未持有。", "相鄰選/不選。", "正負乘積狀態。"],
            ["更新前保存舊狀態。", "非法轉移不要寫進 max/min。", "交易次數維度要倒序或獨立保存。", "允許不選時初始值不能強迫交易。"],
        ),
        "dp_interval": (
            f"「{topic}」在區間上合併答案。先確定短區間，再逐步擴到長區間；轉移通常來自去掉一端或枚舉中間斷點。",
            ["題目問子串/子陣列區間的最優值。", "答案依賴更短區間。", "常見於迴文、戳氣球、合併石子。", "暴力分割會有 O(n^3) 風險。"],
            ["兩端匹配。", "枚舉最後合併點。", "區間可行性與最少操作。"],
            ["按區間長度更新。", "注意 `dp[i+1][j-1]` 的空區間。", "開閉區間要固定。", "若需環形，常複製一倍或枚舉斷點。"],
        ),
        "dp_bitmask": (
            f"「{topic}」用 bitmask 表示集合狀態。每個 bit 代表一個元素是否已選，轉移就是加入、刪除或合併子集。",
            ["n 通常不大，約 20 以內。", "狀態是已選集合、剩餘集合或子集關係。", "題目要求排列、配對、覆蓋或 TSP 類路徑。", "需要枚舉子集或最後一個元素。"],
            ["排列型狀壓。", "TSP。", "子集 DP / SOS DP。"],
            ["位元下標與元素下標要對齊。", "`1 << n` 可能需 long long。", "枚舉子集用 `(sub-1)&mask`。", "恢復路徑需保存前驅。"],
        ),
        "dp_digit": (
            f"「{topic}」逐位構造數字。狀態通常包含位置、是否貼上界 `tight`、是否已開始 `started`，以及題目需要的餘數/前一位/統計量。",
            ["題目問 `[0,n]` 或 `[l,r]` 中滿足條件的數量/總和。", "條件和十進位/二進位位元相關。", "不能逐個枚舉所有數。", "上界限制使 `tight` 必須進狀態。"],
            ["統計不含某些位型的數。", "數位和/出現次數。", "帶餘數或自動機狀態的數位 DP。"],
            ["`tight=false` 才能記憶化。", "前導零是否計入要明確。", "區間 `[l,r]` 通常做 `f(r)-f(l-1)`。", "狀態維度不要漏掉影響未來的資訊。"],
        ),
        "dp_optimized": (
            f"「{topic}」不是換一個模板，而是觀察轉移式中哪一部分可以被資料結構或單調性維護。先寫出樸素 DP，再指出瓶頸項。",
            ["樸素轉移需要枚舉大量前驅。", "轉移中有區間 max/min、前綴和、斜率或單調隊列結構。", "資料量使 O(n^2) 不可接受。", "優化必須保持和樸素轉移等價。"],
            ["前綴和優化。", "單調佇列/堆疊優化。", "樹狀陣列、線段樹、斜率優化。"],
            ["先保留樸素式方便驗證。", "資料結構查的是哪個前驅集合要寫清楚。", "單調性不成立時不能硬套。", "可用小範圍對拍確認優化等價。"],
        ),
        "dp_tree": (
            f"「{topic}」在樹上做狀態合併。後序 DFS 適合彙總子樹，換根則需要先自底向上再自頂向下傳遞父側資訊。",
            ["答案與子樹、路徑或父子選擇有關。", "每個節點需要回傳固定數量的狀態。", "無根樹要指定 parent 防止走回頭路。", "換根題要求每個點作根的答案。"],
            ["樹的直徑。", "樹上選/不選。", "換根 DP。"],
            ["空節點返回值要可合併。", "全域答案與回傳值語意要分開。", "一般樹 DFS 要跳過 parent。", "深樹注意遞迴深度。"],
        ),
        "dp_game": (
            f"「{topic}」把雙方最優決策寫進狀態。常見做法是記錄當前玩家相對對手的最大分差，或直接標記必勝/必敗態。",
            ["兩人輪流決策且都最優。", "局面會轉移到更小局面。", "答案可能是勝負或分數差。", "暴力搜尋會重複訪問局面。"],
            ["區間取數分差 DP。", "必勝/必敗態。", "SG 函數與異或。"],
            ["先定義終止局面。", "分數型與勝負型狀態不同。", "當前玩家視角可簡化轉移。", "記憶化避免重複局面。"],
        ),
        "dp_probability": (
            f"「{topic}」把機率或期望在狀態間轉移。先定義一次操作如何分配機率，再決定正推、反推或解方程。",
            ["題目問期望步數、留在某狀態的機率或隨機過程結果。", "每一步有多個等機率或帶權轉移。", "狀態數有限但不能直接模擬所有路徑。", "答案通常是浮點數。"],
            ["逐步機率分佈。", "吸收態期望。", "有限步隨機遊走。"],
            ["機率總和可用來檢查轉移。", "越界或失敗狀態要明確處理。", "期望 DP 可能需要反向方程。", "浮點比較不要用整數思維。"],
        ),
        "graph_dfs": (
            f"「{topic}」用遞迴或顯式棧沿邊深入。重點是 visited 的語意：已完成、正在路徑上，還是只是已入棧。",
            ["題目問連通塊、可達性、環或拓撲依賴。", "沿一條路徑探索到底更自然。", "需要在回溯時彙總子問題。", "圖可能不是直接給鄰接表。"],
            ["連通塊 DFS。", "三色標記判環。", "Tarjan 類低鏈值。"],
            ["有向/無向圖判環不同。", "遞迴深度可能爆棧。", "建圖時注意 0/1-indexed。", "無向圖 DFS 要跳過父邊。"],
        ),
        "graph_bfs": (
            f"「{topic}」按層擴展狀態。只要每條邊成本相同，第一次到達某狀態就是最短步數。",
            ["題目問最少操作、最短步數或最短轉換。", "每次操作成本相同。", "狀態可能是字串、數字、位置或附加資源。", "需要避免重複入隊。"],
            ["單源 BFS。", "多源 BFS。", "雙向 BFS。"],
            ["入隊時就標記 visited。", "層數更新要和 queue size 對齊。", "狀態壓縮後要可 hash。", "有權邊不能直接用普通 BFS。"],
        ),
        "graph_topo": (
            f"「{topic}」處理有向無環依賴。入度法逐步移除沒有前置條件的節點；若移不完，表示存在環。",
            ["題目有先修、依賴、偏序或任務排程。", "邊表示必須先做哪件事。", "需要判斷是否有環或輸出一個合法順序。", "DAG 上可按拓撲序做 DP。"],
            ["Kahn 入度法。", "DFS 三色判環。", "拓撲序上最長路/計數。"],
            ["邊方向要和入度語意一致。", "平手順序若有要求需用堆。", "不是 DAG 就不能直接做拓撲 DP。", "輸出唯一序需檢查每層候選數。"],
        ),
        "graph_dijkstra": (
            f"「{topic}」處理非負權最短路。每次取出當前距離最小的未確定節點，鬆弛它的出邊。",
            ["邊權非負。", "需要單源到其他點的最短距離。", "狀態圖可能包含額外資源層。", "普通 BFS 無法處理不同邊權。"],
            ["堆優化 Dijkstra。", "分層圖最短路。", "0-1 BFS 是邊權只有 0/1 的特例。"],
            ["負權邊不適用 Dijkstra。", "堆中舊距離要跳過。", "距離可能溢位要用 long long。", "狀態維度要全部進 dist。"],
        ),
        "graph_floyd": (
            f"「{topic}」枚舉中轉點做全源最短路。`dist[i][j]` 在第 k 輪後表示只允許經過前 k 類中轉點的最短距離。",
            ["點數較小。", "需要任意兩點最短路。", "可能有多次路徑查詢。", "邊權可為負但不能有負環。"],
            ["標準 Floyd。", "傳遞閉包。", "Bitset 優化可達性。"],
            ["三層迴圈順序通常是 k-i-j。", "INF 相加要防溢位。", "無向圖要建雙向邊。", "負環會讓結果失去一般最短路語意。"],
        ),
        "graph_mst": (
            f"「{topic}」選邊連通所有節點並最小化總權重。Kruskal 按邊權排序配合並查集，Prim 維護點到生成樹的最小連接邊。",
            ["題目要求連通所有點/城市/網路。", "成本是邊權總和。", "不關心路徑長度，只關心連通成本。", "需要避免成環。"],
            ["Kruskal。", "Prim。", "最小生成樹與瓶頸邊。"],
            ["圖不連通時沒有生成樹。", "Kruskal 需要排序邊。", "Prim 適合稠密圖或隱式完全圖。", "並查集合併前要先判同集合。"],
        ),
    }
    if kind in special_packs:
        return special_packs[kind]
    packs: dict[str, tuple[str, list[str], list[str], list[str]]] = {
        "binary": (
            f"「{topic}」的核心是把搜尋空間縮成有序序列或可比較的位置集合，並用不變式保證答案不被丟掉。先明確閉區間/半開區間語意，再決定要找第一個滿足、最後一個滿足，或精確命中。",
            ["題目明示排序陣列、矩陣行列有序，或可用 `lower_bound` 表達。", "答案位置左右兩側有明確真假分界。", "暴力掃描是 O(n)，但比較一次可以排除一半候選。", "需要處理不存在、重複元素、插入位置或左右邊界。"],
            ["找第一個 >= x / 第一個 > x。", "在旋轉陣列、山脈陣列或分段單調結構中先判定落在哪一段。", "浮點二分與三分法處理連續答案。"],
            ["固定一種區間寫法，不要在同一題混用。", "`mid = l + (r-l)/2` 避免溢位。", "重複元素題要先決定答案偏左或偏右。", "用全小、全大、單元素測資檢查邊界。"],
        ),
        "binary_answer": (
            f"「{topic}」不是在陣列下標上找元素，而是在答案值域上找門檻。先定義 `check(x)` 的語意：`x` 是容量、時間、成本、距離還是排名門檻；再確認真假只切換一次。",
            ["直接構造最佳答案困難，但給定候選值 `x` 可以快速驗證。", "`check(x)` 在值域上呈現前真後假或前假後真。", "答案值域比完整組合空間小，或可以用排序後的候選值壓縮。", "題目常問最小可行成本、最大可行限制、臨界時間或臨界門檻。"],
            ["求最小可行值：找第一個 `check(x)=true`。", "求最大可行值：找最後一個 `check(x)=true`。", "間接值題先把收益/成本轉成可比較的門檻。"],
            ["先寫出 `x` 的單位與上下界，避免把下標和答案值混在一起。", "`check` 必須足夠快，否則外層二分會放大成本。", "明確單調方向後，再決定使用偏左或偏右中點。", "用最小值、最大值、剛好不可行三種測資檢查邊界。"],
        ),
        "binary_minimax": (
            f"「{topic}」是在壓低最壞情況。把答案 `x` 解讀成允許的最大上限，`check(x)` 判斷是否能讓每段、每條路徑或每個操作成本都不超過 `x`。",
            ["目標是最小化最大段和、最大邊權、最大單次代價或最大負載。", "給定上限 `x` 後，通常可用貪心、BFS/DFS、Dijkstra 或計數判斷是否可行。", "`x` 越大限制越寬，原本可行的方案仍可行。", "答案是第一個可行上限，而不是某個局部最大值本身。"],
            ["分割陣列最大段和：貪心檢查段數。", "路徑最大邊權最小：只保留不超過門檻的邊再判斷可達。", "工作量分配：判斷容量上限是否足夠。"],
            ["下界常是單個元素/單條邊的最大值，上界常是總和或最大可能代價。", "`check` 裡若用貪心，要說明為何局部塞滿不會增加段數。", "找第一個 true 時使用偏左中點。", "注意題目是否要求恰好 k 組；很多 minimax check 只需不超過 k 組。"],
        ),
        "binary_maximin": (
            f"「{topic}」是在拉高保底值。把答案 `x` 解讀成最低要求，`check(x)` 判斷能否讓每個相鄰距離、路徑安全值或分配收益都至少達到 `x`。",
            ["目標是最大化最小距離、最小安全值、最小甜蜜度或最小得分。", "給定下限 `x` 後，常用貪心放置、連通性檢查或累積切段判斷。", "`x` 越大限制越嚴，能通過的候選只會變少。", "答案是最後一個可行下限。"],
            ["放置問題：排序後盡量早放，保留後續空間。", "切分收益：累積到至少 `x` 就切一段。", "網格安全值：只走安全值不低於門檻的格子。"],
            ["上界常是最大座標差、最大格值或總收益。", "找最後一個 true 時使用偏右中點，避免死循環。", "貪心檢查要維持「越早滿足越不吃虧」的不變式。", "若資料未排序，通常先排序或預處理門檻。"],
        ),
        "binary_kth": (
            f"「{topic}」不是最大化/最小化某個限制，而是在隱式排序後的多重集合中找排名。對候選值 `x` 計算 `count(<= x)`，答案就是第一個讓計數至少為 `k` 的值。",
            ["候選數量很大，無法全部列出排序。", "給定 `x` 時，可以利用有序矩陣、乘法表公式、排序後雙指標或堆邊界計算排名。", "`count(<= x)` 隨 `x` 單調不減。", "重複值要按題意計入排名，不能只看 distinct 值。"],
            ["矩陣第 K 小：用行列有序計數。", "乘法表第 K 小：逐列加總 `<= x` 的個數。", "數對距離第 K 小：排序後雙指標計數距離不超過 `x` 的數對。"],
            ["二分值域時回傳值，不是回傳下標。", "`count(<= mid) >= k` 表示答案在左半邊含 mid。", "若要回傳實際分數/配對，計數時還要同步維護最接近門檻的候選。", "大值域與乘法計數要用 long long 避免溢位。"],
        ),
        "sliding_fixed": (
            f"「{topic}」使用固定長度視窗：視窗大小不變，每次右端加入一個元素、左端移出一個元素。它的價值在於把每段重算降成差量維護。",
            ["子陣列/子字串長度固定為 k。", "需要最大/最小和、平均值、種類數或符合條件的視窗數。", "每個視窗和上一個視窗只差兩個端點。", "題目可用連續片段表示，而不是任意子序列。"],
            ["固定 k 的頻次表、distinct 個數。", "環形陣列可複製或用取模。", "搭配單調佇列維護固定視窗最大/最小。"],
            ["先建立第一個完整視窗，再開始更新答案。", "移出元素後頻次為 0 要刪除或扣 distinct。", "平均值比較可改成和比較，避免浮點誤差。", "k 可能為 0、1 或等於 n 時要特判。"],
        ),
        "sliding": (
            f"「{topic}」依賴雙指標維護一段連續區間。右端負責擴張搜尋，左端只在條件失效或可再縮時前進，因此每個元素最多被處理常數次。",
            ["題目問最長/最短連續子陣列、子字串，或連續片段數量。", "合法性可由視窗內的和、頻次、最大最小值或 distinct 數描述。", "移動左端後合法性朝單一方向改善。", "暴力枚舉左右端會 O(n^2)，但左右指標都不回退。"],
            ["越短越合法：違法時收縮，更新最長。", "越長越合法：合法時收縮，更新最短。", "恰好型可轉成 `atMost(k)-atMost(k-1)`。"],
            ["先判斷合法性方向，再寫 while 條件。", "答案計數時常用 `right-left+1` 或 `left`，兩者語意不同。", "頻次表字元集可用陣列，值域大時用 map。", "含負數時滑窗的單調性可能失效。"],
        ),
        "sliding_min": (
            f"「{topic}」屬於越長越容易合法的視窗。右端擴張直到滿足要求，再反覆移動左端找最短合法片段。",
            ["題目問最短覆蓋、最小長度、至少包含某些元素。", "加入元素只會讓條件更接近合法。", "刪除左端可能破壞合法性，因此收縮停止點就是局部最優。", "常見資料是正數陣列或字元頻次。"],
            ["最小覆蓋子串。", "正整數陣列和至少為 target。", "多個有序表的最小覆蓋區間。"],
            ["每次合法時先更新答案，再移出左端。", "用 `missing` 或 `formed` 統一表示還缺多少類。", "若陣列有負數，和的單調性不成立，需前綴和+單調佇列。", "空答案要回傳題目要求的 sentinel。"],
        ),
        "mono_stack": (
            f"「{topic}」用單調堆疊維護尚未找到答案的元素。新元素到來時，若破壞單調性，就能立刻確定一批元素的右側第一個更大/更小位置。",
            ["題目問下一個更大/更小、左/右第一個突破邊界。", "每個元素的答案由最近的更高/更低元素決定。", "暴力往左右找會 O(n^2)。", "需要把局部相鄰比較延伸成全域最近關係。"],
            ["循環陣列可掃兩遍。", "用索引入棧以計算距離或寬度。", "貢獻法中分別求左/右第一個嚴格或非嚴格邊界。"],
            ["先決定維持遞增還是遞減。", "相等元素用 `<` 還是 `<=` 會影響去重與邊界。", "需要寬度時入棧索引而不是值。", "哨兵可簡化最後清棧。"],
        ),
        "mono_rect": (
            f"「{topic}」把每根柱子/格子當成限制高度，尋找它能向左右延伸到哪裡。單調堆疊能在線性時間求出左右第一個更矮位置。",
            ["題目出現柱狀圖、矩形面積、全 1 子矩陣。", "某個元素作為最小值時，答案取決於它能覆蓋的最大區間。", "需要同時知道左邊界與右邊界。", "高度或連續 1 長度可逐行更新。"],
            ["接雨水可用單調堆疊或雙指標。", "最大矩形可把每一行轉成柱狀圖。", "子陣列最小值貢獻與矩形寬度思路相同。"],
            ["加入高度 0 哨兵強制彈出剩餘柱子。", "寬度是 `right-left-1`。", "面積可能超出 int 時用 long long。", "矩陣題要逐行累積高度。"],
        ),
        "dp": (
            f"「{topic}」的 DP 重點是先定義狀態，再從最後一步或最後一次決策推導轉移。不要先背公式；先說清 `dp[i]` 表示什麼，答案在哪個狀態。",
            ["題目可拆成重疊子問題。", "當前決策只依賴有限個較小狀態。", "暴力遞迴會重複計算。", "需要最大/最小值、方案數或可行性判定。"],
            ["線性 DP、區間 DP、狀態機 DP。", "前綴和、單調佇列、資料結構可優化轉移。", "記憶化 DFS 與迭代 DP 可互相轉換。"],
            ["狀態定義要包含足夠資訊，不能偷用未來。", "初始化比轉移更容易出錯。", "方案數注意模數與負值取模。", "能滾動時確認轉移方向不會覆蓋舊狀態。"],
        ),
        "dp_rob": (
            f"「{topic}」是狀態機 DP 的入門：每個位置只有選或不選，但相鄰限制會讓某些轉移非法。關鍵是把『上一個是否選』寫進狀態。",
            ["題目有相鄰不能同選、冷凍期、持有/未持有等互斥狀態。", "每一步決策少，但狀態會影響下一步。", "貪心看似可行但局部最大可能破壞後續。", "常見於打家劫舍、股票、刪除獲點。"],
            ["環形限制可拆成不選首或不選尾。", "樹形打家劫舍把狀態放到節點。", "多狀態股票題可加入交易次數/冷凍期。"],
            ["列出所有狀態，再畫轉移箭頭。", "互斥狀態不要用同一變數覆蓋後又讀舊值。", "環形題要避免首尾同時被選。", "負收益題要確認是否允許不選。"],
        ),
        "dp_lis": (
            f"「{topic}」的核心是維護遞增關係。O(n^2) DP 枚舉前驅最直觀；若只求長度，可用貪心加二分維護每種長度的最小結尾。",
            ["題目問最長遞增/非遞減子序列、套娃或排序後鏈長。", "元素順序不能打亂，但可跳過。", "轉移需要找前面小於當前的最佳值。", "資料量較大時 O(n^2) 不可接受。"],
            ["二維偏序先排序一維，再對另一維做 LIS。", "求方案數需保留計數，不能只用 tail。", "帶差值限制可用樹狀陣列/線段樹查區間最大。"],
            ["嚴格遞增用 `lower_bound`，非遞減用 `upper_bound`。", "二維排序同寬時第二維通常降序，避免同組互選。", "`tail` 只能求長度，不保證是一條真實答案。", "需要恢復路徑時保存前驅。"],
        ),
        "dp_knapsack": (
            f"「{topic}」把限制看成容量，把每個物品的選擇看成轉移。先判斷物品能用一次、無限次或分組互斥，再決定迴圈方向。",
            ["題目有容量/目標和/成本限制。", "每個元素可選或不選，或可選多次。", "答案是可行性、最大價值、最小物品數或方案數。", "值域容量可接受 O(nW)。"],
            ["0-1 背包倒序容量。", "完全背包正序容量。", "多重背包可二進制拆分或單調隊列優化。"],
            ["容量維度含義必須固定：恰好、至多、至少不同。", "倒序/正序錯了會重複用物品。", "最小值初始化為 INF，可行性初始化 `dp[0]=true`。", "方案數題外層物品與外層容量會決定是否計排列。"],
        ),
        "graph": (
            f"「{topic}」先把題意建成節點與邊，再選遍歷或最短路演算法。圖論題最重要的不是模板，而是狀態是否完整、邊權是否符合演算法前提。",
            ["題目有關係網、路徑、依賴、連通性或最短代價。", "狀態可抽象成點，操作可抽象成邊。", "需要判斷可達、最短距離、拓撲順序或連通塊。", "原始資料可能是矩陣、字串、集合，而不直接給圖。"],
            ["無權最短路用 BFS。", "0/1 權用 0-1 BFS。", "非負權用 Dijkstra；有負權需 Bellman-Ford/SPFA 類思路。"],
            ["先估點數與邊數，決定鄰接表或矩陣。", "Dijkstra 不適用負權邊。", "多源 BFS 要把所有源點同時入隊。", "狀態圖要包含資源、鑰匙、次數等額外維度。"],
        ),
        "grid": (
            f"「{topic}」把格子視為圖上的節點，四/八方向移動就是邊。先決定 visited 的語意：是永久標記、當前路徑標記，還是帶狀態的距離陣列。",
            ["題目在矩陣、迷宮、島嶼、擴散或最短步數上操作。", "移動方向固定，邊界與障礙是主要限制。", "需要連通塊、最短距離或可達性。", "多個起點同時擴散時適合多源 BFS。"],
            ["DFS 計連通塊與面積。", "BFS 求最短步數或擴散時間。", "帶轉向/代價可轉成 0-1 BFS 或 Dijkstra。"],
            ["方向陣列保持一致，例如 `{1,0,-1,0,1}`。", "遞迴 DFS 在大網格可能爆棧，可改顯式棧。", "修改原矩陣前確認題目允許。", "狀態含鑰匙/方向時 visited 需升維。"],
        ),
        "linked_list": (
            f"「{topic}」考驗指標操作順序。連結串列不能隨機訪問，因此常用 dummy head、快慢指標、前後指標來把邊界情況統一。",
            ["題目要求刪除、插入、反轉、合併或找第 k 個節點。", "只給 head，無法 O(1) 找前驅。", "首節點也可能被修改。", "需要保持鏈不斷、不成環。"],
            ["快慢指標找中點或倒數第 k。", "dummy head 處理刪除頭節點。", "分治合併多條有序鏈。"],
            ["改 `next` 前先保存後繼。", "dummy 節點可避免特判 head。", "循環條件用 `node && node->next` 時先確認訪問順序。", "返回值可能是新 head，不一定是原 head。"],
        ),
        "tree": (
            f"「{topic}」通常靠 DFS/BFS 在樹上傳遞資訊。自底向上適合彙總子樹答案，自頂向下適合攜帶路徑狀態或祖先資訊。",
            ["題目在二叉樹/一般樹上求深度、路徑、祖先、直徑或子樹資訊。", "每個節點的答案能由左右子樹合併。", "需要遍歷順序：前序決策、後序彙總、層序最短。", "無根樹需先指定父節點避免回走。"],
            ["直徑題回傳向下最大鏈，順手更新全域答案。", "LCA 可用遞迴、倍增或 Tarjan 離線。", "換根 DP 需要先下後上兩次遍歷。"],
            ["空節點的返回值要與合併式相容。", "全域答案在遞迴中更新時注意初始化。", "一般樹 DFS 要跳過 parent。", "深樹可能遞迴溢位，必要時改迭代。"],
        ),
        "backtracking": (
            f"「{topic}」是在決策樹上搜尋所有可行解。每層選一個決策，遞迴返回時恢復現場；剪枝則用約束提前停止不可能分支。",
            ["題目要求列出所有排列、組合、子集、路徑或棋盤方案。", "解空間可表示成逐步選擇。", "需要去重、剪枝或回復狀態。", "輸出所有答案而非只求最值。"],
            ["排序後用 `i>start && nums[i]==nums[i-1]` 去重。", "用 bitmask 表示已選集合。", "可與 DFS、DP 記憶化結合剪枝。"],
            ["push 後必須 pop，標記後必須復原。", "排列與組合的 start/used 語意不同。", "剪枝條件要保證不漏解。", "答案要拷貝 path，而不是存引用。"],
        ),
        "greedy": (
            f"「{topic}」不是只看局部最大，而是要找到可證明的排序鍵或選擇規則。常用證明方式是交換論證、留出最多後續空間或歸納維護不變式。",
            ["題目目標可拆成一串選擇，且局部選擇能保留最優性。", "排序後相鄰交換可比較優劣。", "區間題常看右端點、左端點或覆蓋範圍。", "若局部選擇失敗，通常要改 DP 或反悔堆。"],
            ["區間排程按右端點。", "字典序題從高位決策。", "數學貪心常需不等式或構造證明。"],
            ["先寫出貪心準則，再補證明。", "排序 tie-breaker 要與證明一致。", "相等元素與空集合是常見反例來源。", "可用小範圍 brute force 對拍檢查。"],
        ),
        "greedy_regret": (
            f"「{topic}」先做看似可行的選擇，當限制被破壞時再刪掉最不划算的已選項。堆用來快速找到要反悔的候選。",
            ["題目按時間/位置順序處理，選擇後可能超出限制。", "需要最大化選中數量或收益。", "當前集合違法時，移除某個最大成本/最小收益項最合理。", "普通貪心無法一開始就知道該放棄誰。"],
            ["課程表、最低加油次數、魔塔遊戲。", "最大堆刪最大耗時，最小堆補最小代價。", "可與排序截止時間搭配。"],
            ["堆中存反悔依據，不一定是原值。", "每次違法只反悔到恢復合法。", "排序順序通常是截止時間或觸發順序。", "證明要說明被刪項在已選集合中最差。"],
        ),
        "string": (
            f"「{topic}」的核心是重用已比對過的資訊。KMP/Z/雜湊/自動機都在避免從頭重比，差別是維護 border、LCP、hash 還是狀態轉移。",
            ["題目問子串匹配、前後綴、週期、LCP 或多模式查詢。", "暴力比對會反覆掃描相同字元。", "需要大量比較子串相等或字典序。", "字串長度使 O(nm) 不可接受。"],
            ["KMP 處理模式串 border。", "Z 函式處理每個後綴和整串的 LCP。", "雜湊適合快速判等，AC 自動機適合多模式。"],
            ["索引從 0 開始時 border 長度與下標要分清。", "雜湊建議雙模或 unsigned long long，並理解碰撞風險。", "字元集大時不要硬開 26。", "空模式或長度 1 要特判。"],
        ),
        "palindrome": (
            f"「{topic}」利用迴文的左右對稱性。中心擴展最直觀，Manacher 則利用已知最右迴文區間，把對稱位置的半徑作為初值。",
            ["題目問最長迴文、迴文個數、迴文切分或最少修改。", "判斷區間是否迴文會被大量重複使用。", "奇偶長度都要處理。", "需要從中心或區間兩端推導。"],
            ["中心擴展 O(n^2) 適合中小資料。", "Manacher O(n) 適合只看迴文半徑。", "區間 DP 適合切分、最少修改或子序列。"],
            ["偶數中心是 `(i,i+1)`，不要漏。", "Manacher 可插入分隔符統一奇偶。", "回傳子串時注意起點與長度。", "子串與子序列是不同問題。"],
        ),
        "bitwise": (
            f"「{topic}」先把整數拆成二進位位元，再利用 AND/OR/XOR 的代數性質。若各位互不影響，可逐位統計；若有進位或大小比較，則要額外處理耦合。",
            ["題目出現 XOR、AND、OR、子集 mask、二進位表示。", "操作可按位獨立分析。", "需要快速查區間 XOR、最大 XOR 或位元貢獻。", "狀態數不大時可用 bitmask 表示集合。"],
            ["前綴 XOR 處理區間異或。", "試填最高位處理最大 XOR/最大值。", "SOS DP 處理子集包含關係。"],
            ["位移用 `1LL << b` 避免溢位。", "負數右移與符號位要小心。", "按位貢獻要確認每位獨立。", "`__builtin_popcountll` 對 long long 使用 ll 版本。"],
        ),
        "math": (
            f"「{topic}」需要把題意轉成公式、整除性、同餘或計數模型。競程數學題常先用小資料找規律，再補嚴格證明與邊界。",
            ["題目有質數、因數、排列組合、同餘、幾何或期望。", "演算法瓶頸不是資料結構，而是公式化。", "暴力能列小樣本，有助猜測規律。", "答案常需取模或避免浮點誤差。"],
            ["數論：gcd、篩法、質因數分解、模逆元。", "組合：乘法原理、容斥、生成函式。", "幾何：叉積、凸包、距離轉換。"],
            ["先確認數值範圍與是否溢位。", "取模除法要用逆元，且模數通常需為質數。", "浮點比較用 eps。", "公式推完後用小範圍暴力驗證。"],
        ),
        "game": (
            f"「{topic}」把局面分成必勝與必敗。若能走到必敗態就是必勝；若所有走法都到必勝態就是必敗。更一般的公平遊戲可用 SG 函數。",
            ["兩人輪流操作，且雙方最優。", "局面可轉移到更小局面。", "題目問先手是否必勝或可保證的分數。", "小局面打表可能出現週期。"],
            ["Nim 異或和判勝負。", "區間博弈用 DP 比較雙方分差。", "可拆成獨立子遊戲時用 SG 異或。"],
            ["明確正常玩法或反常玩法。", "終止態先定義清楚。", "記憶化避免重複搜尋局面。", "分數型博弈與勝負型博弈狀態不同。"],
        ),
        "vote": (
            f"「{topic}」用抵消思想維護候選者。若某元素出現次數超過閾值，和其他元素兩兩抵消後仍會留下候選。",
            ["題目問多數元素、超過 n/2 或 n/3 的元素。", "資料流式處理，要求 O(1) 額外空間。", "存在強出現次數保證。", "排序或 hash 可以做，但不是最優。"],
            ["n/2 只需一個候選。", "n/3 需要兩個候選。", "沒有保證存在時，最後要二次計數驗證。"],
            ["抵消後的候選不一定有效，除非題目保證存在。", "更新順序很重要：先匹配候選，再處理空槽。", "多候選版本要避免兩個候選相同。", "二次驗證時計數清零重算。"],
        ),
        "enumeration": (
            f"「{topic}」的重點是選對枚舉順序，讓每個候選只被看一次或少數幾次。競程中常把二維座標、左右端點、中心點或對角線改寫成一個可遞增的鍵。",
            ["題目看似要枚舉兩維或三維，但其中一維可由另一維推出。", "矩陣題出現行列、對角線、反對角線或固定方向掃描。", "需要統計所有候選，但不需要複雜資料結構。", "暴力枚舉有大量重複，可透過分組消除。"],
            ["枚舉右端點並維護左側資訊。", "枚舉中心點處理左右對稱。", "依 `r+c` 或 `r-c` 分組遍歷矩陣對角線。"],
            ["先寫出枚舉變數的合法範圍。", "二維轉一維時檢查邊界是否越界。", "分組鍵可能為負，使用 map 或加偏移。", "若每組需要排序，總複雜度要算所有組的總和。"],
        ),
        "prefix_sum": (
            f"「{topic}」把區間資訊轉成兩個前綴狀態的差。當題目反覆詢問子陣列/子矩陣和、或要統計和為某值的片段時，前綴和能把每次查詢降到 O(1) 或 O(log n)。",
            ["題目問連續區間和、平均值、餘數或出現次數。", "多次查詢同一陣列的區間資訊。", "需要計數 `sum(l..r)=k` 類條件。", "資料可離線預處理。"],
            ["一維前綴和、二維前綴和。", "前綴和 + hash map 統計子陣列數。", "前綴和 + 有序集合處理上下界或最大不超過 k。"],
            ["前綴陣列常開 n+1，讓空前綴為 0。", "區間 `[l,r]` 對應 `pre[r+1]-pre[l]`。", "含負數時不能用滑動視窗替代前綴和。", "和可能溢位時用 long long。"],
        ),
        "heap": (
            f"「{topic}」使用堆維護動態最值。當題目需要反覆取最大/最小、保留 Top-K，或在掃描過程中淘汰最差候選時，堆比每次排序更合適。",
            ["題目反覆出現最大值/最小值查詢。", "需要第 K 大、小根堆保留 K 個候選。", "事件按時間推進，過期元素需要延遲刪除。", "反悔貪心需要快速刪掉最大成本或最小收益。"],
            ["小根堆保留 Top-K 最大。", "雙堆維護中位數。", "堆 + lazy deletion 處理滑動視窗最值。"],
            ["C++ `priority_queue` 預設大根堆。", "自訂比較器要符合嚴格弱序。", "需要刪任意元素時通常要 lazy deletion 或改用 multiset。", "堆內元素可能過期，取 top 前要清理。"],
        ),
        "trie": (
            f"「{topic}」把字串或二進位數的前綴共用在一棵樹上。它適合前綴查詢、多模式匹配、字典序搜尋，或逐位決策最大 XOR。",
            ["題目大量插入/查詢單詞或前綴。", "需要找共同前綴、替換詞根、字典序或 XOR 最優配對。", "暴力逐字串比較成本太高。", "字元集或位元長度有限。"],
            ["普通 Trie 儲存單詞與前綴計數。", "0-1 Trie 處理最大 XOR。", "AC 自動機在 Trie 上加入 fail 邊做多模式匹配。"],
            ["節點數上限約為所有字串長度總和。", "完整單詞與前綴要分別標記。", "字元集不是小寫英文字母時要改 child 結構。", "0-1 Trie 從最高位往低位走。"],
        ),
        "dsu": (
            f"「{topic}」用並查集維護動態連通塊。每個集合有代表元，`find` 找代表、`union` 合併集合；路徑壓縮讓均攤成本接近常數。",
            ["題目問連通性、分組數量、等價關係或 Kruskal。", "邊逐步加入，不需要刪除。", "需要快速判斷兩點是否在同一集合。", "可把字串、座標或帳號離散成 id。"],
            ["按秩/大小合併。", "帶權並查集維護相對距離或比例。", "離線倒序處理刪邊問題。"],
            ["`parent[find(x)] = find(y)`，不要直接連未壓縮節點。", "額外資訊要掛在根節點並在合併時更新。", "需要刪邊時普通並查集不支援線上操作。", "座標題先做好離散化。"],
        ),
        "fenwick": (
            f"「{topic}」處理動態前綴資訊。樹狀陣列適合單點修改與前綴查詢；線段樹更通用，可支援區間修改、區間最值與懶標記。",
            ["題目有多次更新與區間查詢。", "查詢是前綴和、區間和、最大值或計數。", "靜態前綴和不夠，因為資料會變。", "值域大時需要離散化後再建樹。"],
            ["樹狀陣列：單點加、前綴和。", "線段樹：區間查詢、區間修改、懶標記。", "掃描線 + 樹狀陣列/線段樹統計二維偏序。"],
            ["樹狀陣列常用 1-indexed。", "`i += i & -i` 更新，`i -= i & -i` 查詢。", "線段樹懶標記下推時機要一致。", "離散化後不要混用原座標與壓縮座標。"],
        ),
    }
    fallback = kind
    if kind.startswith("dp"):
        fallback = "dp"
    elif kind.startswith("graph"):
        fallback = "graph"
    elif kind in {"diff", "stack", "queue", "mono_queue", "segment_tree"}:
        fallback = {
            "diff": "prefix_sum",
            "stack": "mono_stack",
            "queue": "sliding",
            "mono_queue": "sliding_fixed",
            "segment_tree": "fenwick",
        }[kind]
    return packs.get(kind, packs.get(fallback, packs["dp"]))


def choose_snippet(kind: str, problems: list[dict[str, Any]]) -> tuple[str, dict[str, str], bool]:
    problem_ids = {normalize_id(p.get("id", "")) for p in problems}
    default_id = DEFAULT_SNIPPET_BY_KIND.get(kind, "70")
    snippet = CODE_SNIPPETS[default_id]
    snippet_problem_id = snippet.get("problem_id", default_id)
    return default_id, snippet, snippet_problem_id in problem_ids


def build_summary(
    fname: str,
    path_titles: list[str],
    study_leaf: dict[str, Any] | None,
    rating_map: dict[str, float],
) -> str:
    leaf = path_titles[-1]
    parent = path_titles[-2] if len(path_titles) >= 2 else ""
    problems = list((study_leaf or {}).get("problems") or [])
    kind = infer_kind(fname, path_titles)
    principle, patterns, variants, notes = topic_pack(kind, leaf, parent)
    snippet_id, snippet, is_local_example = choose_snippet(kind, problems)
    example_scope = "本節代表題" if is_local_example else "同型延伸示範題"
    statement = PROBLEM_STATEMENTS.get(
        snippet_id,
        f"題意：{snippet['name']} 要依題目限制回傳指定答案；先確認輸入、輸出與邊界，再對照下面的狀態設計。",
    )
    snippet_name = display_problem_name(snippet["name"])
    full_problem = full_problem_body(snippet_id, statement)
    pattern_clue = build_pattern_clue(kind, snippet_id, patterns)
    code_walkthrough = build_code_walkthrough(kind, snippet_id, snippet)

    rep = representative_examples(problems, rating_map, kind, leaf)
    pattern_md = "\n".join(f"- {x}" for x in patterns)
    variants_md = "\n".join(f"- {x}" for x in variants)
    notes_md = "\n".join(f"- {x}" for x in notes)

    return (
        f"**原理講解**\n\n"
        f"{build_principle_intro(kind, principle)}\n\n"
        f"**題目線索（Pattern）**\n\n"
        f"{pattern_md}\n\n"
        f"**代表例題**\n\n"
        f"{rep}\n\n"
        f"**C++ 範例講解**\n\n"
        f"以下用{example_scope} {snippet_name} 展示核心寫法。\n\n"
        f"**完整題目**：{full_problem}\n\n"
        f"**想到本 Pattern 的線索**：{pattern_clue}\n\n"
        f"```cpp\n{snippet['cpp']}\n```\n\n"
        f"**程式碼拆解**\n\n"
        f"{code_walkthrough}\n\n"
        f"**常見變形**\n\n"
        f"{variants_md}\n\n"
        f"**實作注意事項**\n\n"
        f"{notes_md}"
    )


def standardize_file(path: Path, rating_map: dict[str, float]) -> int:
    tutorial = read_json(path)
    study_path = STUDYPLAN_DIR / path.name
    study_leaves = collect_studyplan_leaves(read_json(study_path)) if study_path.exists() else {}
    changed = 0

    def walk(node: dict[str, Any], path_titles: list[str]) -> None:
        nonlocal changed
        children = node.get("children") or []
        current_path = path_titles + [str(node.get("title", ""))]
        if children:
            for child in children:
                walk(child, current_path)
            return
        node_id = node.get("id")
        study_leaf = study_leaves.get(node_id) if isinstance(node_id, int) else None
        node["summary"] = build_summary(path.name, current_path, study_leaf, rating_map)
        changed += 1

    for child in tutorial.get("children") or []:
        walk(child, [str(tutorial.get("title", ""))])

    write_json(path, tutorial)
    return changed


def main() -> None:
    problems = read_json(PROBLEMS_PATH)
    rating_map = {
        normalize_id(pid): data["rating"]
        for pid, data in problems.items()
        if isinstance(data, dict) and isinstance(data.get("rating"), (int, float))
    }
    total = 0
    for path in sorted(TUTORIAL_DIR.glob("*.json")):
        count = standardize_file(path, rating_map)
        total += count
        print(f"{path.name}: standardized {count} leaf summaries")
    print(f"Total leaf summaries standardized: {total}")


if __name__ == "__main__":
    main()
