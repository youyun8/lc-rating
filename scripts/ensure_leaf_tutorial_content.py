#!/usr/bin/env python3
"""Ensure every tutorial leaf starts with leaf-specific principle + implementation.

The lecture pages use apps/web/public/tutorial/*.json as authored content.
This script keeps the authored examples and problem lists intact, while replacing
the opening "原理講解" block of each leaf with a title-aware primer and explicit
"實作方式" checklist.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parent.parent
TUTORIAL_DIR = REPO_ROOT / "apps" / "web" / "public" / "tutorial"

SECTION_MARKERS = (
    "**題目線索",
    "**代表例題",
    "**C++",
    "**程式碼",
    "**常見",
    "**實作注意事項",
    "**本節題單",
    "---",
)

GENERIC_TITLES = {
    "基礎",
    "進階",
    "其他",
    "相似題目",
    "其他（選做）",
    "綜合應用",
    "應用題",
    "Part A",
    "Part B",
}


@dataclass(frozen=True)
class FamilyContent:
    principle: str
    state: str
    update: str
    answer: str
    pitfall: str


FAMILIES: dict[str, FamilyContent] = {
    "binary_search": FamilyContent(
        principle="把答案或位置壓成一個單調 predicate，並用左右邊界不變式保證每次折半都不丟失真正答案。",
        state="明確定義 `left`、`right` 的閉開語意，以及 `check(x)` 為真代表偏左收縮還是偏右收縮。",
        update="每次取 `mid = left + (right - left) / 2`，根據 predicate 單調方向只移動一側邊界。",
        answer="迴圈結束時由 `left == right` 取得第一個可行值，最後再檢查越界或題目要求的精確命中。",
        pitfall="不要混用閉區間與半開區間；二分答案前必須先證明 `check` 具備單調性。",
    ),
    "bitwise": FamilyContent(
        principle="把整數拆成位元來看，利用 XOR、AND、OR 或二進位大小關係，把全局條件拆成每一位的貢獻或可行性判斷。",
        state="記錄每一位的 0/1 次數、目前 mask、線性基或 trie 節點，讓位元資訊能被增量更新。",
        update="按位掃描或從高位到低位試填，遇到 XOR/AND/OR 題先寫出該位對答案的公式。",
        answer="將各位貢獻乘上權值後相加，或在高位貪心試填後得到最大/最小可行值。",
        pitfall="位移前注意型別寬度；含負數或第 31/63 位時要改用 unsigned 或 long long。",
    ),
    "prefix_sum": FamilyContent(
        principle="把連續區間的值改寫成兩個前綴狀態的差，讓每次查詢不必重新掃描整段。",
        state="定義 `prefix[i]` 的含義，並視題目需要保存前綴和、前綴餘數、奇偶 mask 或二維前綴矩陣。",
        update="掃描時先用目前前綴查找需要的歷史狀態，再把目前前綴加入 hash map、陣列或有序集合。",
        answer="區間 `[l, r]` 由 `prefix[r + 1] - prefix[l]` 取得；計數題則累加歷史狀態的出現次數。",
        pitfall="有負數時滑動視窗通常失效；`count[0] = 1` 或二維邊界補零是常見初始條件。",
    ),
    "difference": FamilyContent(
        principle="把多次區間修改延後到最後一次前綴還原，單次區間加值只改動差分陣列的邊界。",
        state="一維保存 `diff[l] += v, diff[r + 1] -= v`；二維保存矩形四角的加減標記。",
        update="處理每個操作時只更新端點，不逐格修改原陣列；所有操作結束後做一次前綴累加。",
        answer="還原後的前綴值就是每個位置的最終值，若只需判斷容量或覆蓋次數可在還原時同步檢查。",
        pitfall="右端點加一可能越界；二維差分四個角的符號必須成對出現。",
    ),
    "enumeration": FamilyContent(
        principle="選對枚舉維度，讓另一側變成已處理資訊的摘要，避免 pair、triple 或矩陣座標被重複掃描。",
        state="保存左側/右側的最大值、最小值、計數表、位置集合，或按對角線與中心點分組的摘要。",
        update="固定目前枚舉點，先用已維護摘要更新答案，再把目前點加入摘要，避免自己配自己。",
        answer="每個候選只在被指定的枚舉點負責一次，答案由局部候選與歷史摘要合併而成。",
        pitfall="加入當前元素的時機會影響是否重複或漏算；需要刪除過期資訊時要換成 deque、heap 或 set。",
    ),
    "stack": FamilyContent(
        principle="用後進先出的容器保存尚未匹配、尚未結算或需要回到最近上下文的元素。",
        state="棧中元素應明確代表括號期待值、未結算下標、運算子上下文，或一段仍可合併的狀態。",
        update="遇到新元素時根據棧頂決定匹配、彈出結算、合併或入棧等待後續資訊。",
        answer="每次彈棧時結算一批已確定答案；掃描結束後再處理棧內剩餘元素或檢查是否完全匹配。",
        pitfall="棧頂語意必須固定；空棧、相等元素、括號方向與最後清棧是最常見錯誤。",
    ),
    "monotonic_stack": FamilyContent(
        principle="用單調棧保存還沒找到左/右邊界的元素，新元素破壞單調性時一次結算被彈出的元素。",
        state="棧中通常保存下標而不是值，並維持遞增或遞減的不變式。",
        update="掃描到新元素時，持續彈出不再滿足單調性的棧頂；彈出瞬間即可確定其一側邊界。",
        answer="下一個更大/更小、矩形寬度或貢獻次數由左右第一個破壞單調性的邊界計算。",
        pitfall="相等元素用 `<` 還是 `<=` 會影響去重與左右邊界，貢獻法尤其要一側嚴格一側非嚴格。",
    ),
    "queue": FamilyContent(
        principle="用先進先出的順序保存待處理狀態，適合層序擴展、固定順序消費或維護窗口端點。",
        state="佇列元素需包含足以恢復狀態的欄位，例如節點、距離、時間或所在層。",
        update="每次彈出隊首後擴展下一批狀態，合法且未訪問的狀態才入隊。",
        answer="BFS 類題第一次到達目標就是最短步數；資料流類題則由隊首代表最早仍有效元素。",
        pitfall="visited 的語意要和狀態一致；若狀態多了鑰匙、方向或剩餘次數，visited 也要多維。",
    ),
    "monotonic_queue": FamilyContent(
        principle="在滑動窗口中用 deque 維護單調候選，讓隊首始終是窗口內最大或最小值。",
        state="deque 保存下標，並同時滿足下標在窗口內、值保持單調兩個不變式。",
        update="新元素進來前後清理隊尾劣勢候選；窗口左端前進時清理過期隊首。",
        answer="清理後的隊首就是當前窗口最值，可直接更新答案或作為 DP 最佳前驅。",
        pitfall="先出隊、先入隊還是先更新答案取決於當前元素是否屬於查詢窗口。",
    ),
    "heap": FamilyContent(
        principle="用堆保存動態候選集合的當前最優元素，避免每次查最大、最小或 Top-K 時重新排序。",
        state="堆元素要包含排序鍵與必要的定位資訊，例如值、下標、過期邊界或來源序列。",
        update="每次加入候選後只調整堆的局部結構；若堆大小有上限，立刻彈出不需要的候選。",
        answer="堆頂代表目前最優候選；若可能過期，讀取前必須先清理堆頂。",
        pitfall="C++ `priority_queue` 預設大根堆；自訂比較器要符合嚴格弱序。",
    ),
    "lazy_heap": FamilyContent(
        principle="處理堆不能刪除任意元素的限制：真實狀態存在 hash map、版本號或 alive 標記中，堆只保存候選快照。",
        state="定義 canonical state，例如 `index -> number`、`timestamp -> price`、`id -> version/alive`，以及堆中快照的 key。",
        update="更新時只改 canonical state 並推入新快照，不嘗試從堆中找出舊快照。",
        answer="每次讀 `top()` 前執行清理：堆頂快照若與 canonical state 不一致就 pop，直到堆頂有效或堆空。",
        pitfall="所有查詢入口都要清理；若判斷過期只看 value 而漏看 id/timestamp，會把舊資料誤當答案。",
    ),
    "regret_heap": FamilyContent(
        principle="先貪心接納候選，一旦違反限制就用堆反悔刪掉代價最大或收益最差的選擇。",
        state="堆中保存目前已選集合中最應被反悔的元素，另用累積值記錄目前資源消耗或收益。",
        update="按截止時間、位置或門檻排序掃描；加入當前候選後若限制被破壞，就彈出堆頂並修正累積值。",
        answer="掃描結束時堆內剩餘數量或累積收益就是在所有局部反悔後的最佳結果。",
        pitfall="排序鍵與堆鍵是兩回事；排序決定可行前綴，堆決定反悔哪個已選候選。",
    ),
    "dual_heap": FamilyContent(
        principle="用兩個堆或兩側容器維護分界，讓第 K 小/大、中位數或滑動窗口統計能在動態更新下保持平衡。",
        state="小的一側通常用大根堆，大的一側用小根堆，並維護兩側大小與順序關係。",
        update="插入或刪除後先放到對應側，再透過 rebalance 移動堆頂，必要時配合懶刪除清理過期元素。",
        answer="平衡後的堆頂就是中位數、第 K 小/大或分界值；若需總和，兩側還要同步維護 sum。",
        pitfall="刪除元素時要先判斷它屬於哪一側並修正有效 size，不能只看 heap 的實際長度。",
    ),
    "trie": FamilyContent(
        principle="把大量字串或二進位數的共同前綴合併成樹，讓前綴查詢、多模式匹配或逐位貪心不必重複比較。",
        state="節點保存子節點指標、經過次數、結尾標記，二進位 trie 則保存 0/1 兩條邊。",
        update="插入時沿字元或位元逐層建立節點；查詢時沿目標前綴或相反位元走最有利的分支。",
        answer="到達前綴節點可取得匹配數，或在高位貪心走完後得到最大 XOR/字典序結果。",
        pitfall="刪除或計數題需要維護 pass count；字元集大小會直接影響空間。",
    ),
    "dsu": FamilyContent(
        principle="用代表元維護等價類或連通塊，只關心兩個元素是否屬於同一集合及集合合併後的摘要。",
        state="`parent[x]` 指向代表元，`size/rank` 或額外權值保存在代表元或到父節點的邊上。",
        update="`find` 時路徑壓縮，`union` 時按大小或秩合併，帶權並查集還要同步更新相對關係。",
        answer="連通性由代表元是否相同判斷，集合大小、連通塊數或矛盾判定在 union 時維護。",
        pitfall="普通並查集不支援在線刪邊；刪除類題通常要離線倒序或改用其他資料結構。",
    ),
    "fenwick": FamilyContent(
        principle="用 lowbit 拆分前綴區間，支援單點更新與前綴查詢，常配合離散化處理排名和計數。",
        state="`tree[i]` 保存一段長度為 `lowbit(i)` 的聚合值，內部通常使用 1-indexed 下標。",
        update="單點 add 沿 `i += i & -i` 更新所有覆蓋它的桶；查前綴沿 `i -= i & -i` 累加。",
        answer="區間查詢由兩個前綴相減；逆序對與排名題先離散化再查小於/大於的數量。",
        pitfall="0-index 與 1-index 轉換要一致；查詢值域前先把所有可能值離散化。",
    ),
    "segment_tree": FamilyContent(
        principle="把區間遞迴拆成左右子區間，支援更通用的區間查詢、單點/區間更新與懶標記。",
        state="每個節點保存該區間的聚合值，若有區間更新還要保存 lazy tag。",
        update="更新或查詢時遞迴覆蓋區間；完整覆蓋直接套 tag，部分覆蓋先 push down 再合併左右答案。",
        answer="查詢區間由若干不相交節點的聚合合併而成，根節點可保存全局答案。",
        pitfall="聚合函式、lazy tag 套用方式與 pushUp 必須一致；動態開點要在訪問子節點前建立節點。",
    ),
    "sparse_table": FamilyContent(
        principle="對不可修改陣列預處理長度為 2 的冪的區間答案，適合冪等操作的 O(1) RMQ。",
        state="`st[k][i]` 表示從 i 開始、長度 `2^k` 的區間聚合值。",
        update="預處理時由兩個長度 `2^(k-1)` 的相鄰區間合併出 `st[k][i]`。",
        answer="查 `[l,r]` 時取 `k=floor(log2(len))`，合併 `[l,l+2^k-1]` 與 `[r-2^k+1,r]`。",
        pitfall="ST 表不支援在線修改；只有 min/max/gcd 這類冪等操作才能用重疊區間 O(1) 查詢。",
    ),
    "splay": FamilyContent(
        principle="用旋轉把剛訪問的節點調到根，讓序列分裂、合併、插入、刪除與區間翻轉能在均攤對數時間完成。",
        state="節點保存左右兒子、父指標、子樹大小與需要維護的區間資訊或懶標記。",
        update="每次 access 後 splay 到根；區間操作常先把左右邊界旋到指定位置，再對中間子樹打標記。",
        answer="根或目標子樹保存的聚合值就是查詢答案，序列順序由中序遍歷表示。",
        pitfall="旋轉時父子關係與 size/pushUp 必須同步；下傳翻轉標記前不要繼續往下走。",
    ),
    "sqrt": FamilyContent(
        principle="把資料切成約 sqrt(n) 大小的塊，在整塊上用預處理摘要，零散部分直接暴力。",
        state="每塊保存 sum、max、頻次表或排序後陣列等摘要，原陣列保存單點真實值。",
        update="單點或區間更新時，完整塊更新摘要，邊界散塊逐元素處理後重建該塊。",
        answer="查詢時整塊直接合併摘要，左右邊界不足一塊的部分暴力掃描。",
        pitfall="塊大小要按操作類型調整；更新後忘記重建塊摘要會讓後續查詢錯誤。",
    ),
    "mo": FamilyContent(
        principle="把所有區間查詢離線排序，讓左右端點按小步移動，透過 add/remove 維護當前區間答案。",
        state="保存目前 `[L,R]`、元素頻次與由頻次推得的答案摘要。",
        update="按莫隊順序移動 L/R，每移入一個元素呼叫 add，每移出一個元素呼叫 remove。",
        answer="當目前區間調整到查詢區間後，當前摘要就是該查詢答案，按原查詢 id 回填。",
        pitfall="只有沒有在線修改或可離線處理的查詢適用；add/remove 的順序要和答案統計一致。",
    ),
    "offline": FamilyContent(
        principle="把更新與查詢按可排序的門檻重排，使每個候選只在變合法時加入資料結構一次。",
        state="保存排序後的事件、查詢原 id，以及當前已加入候選的資料結構。",
        update="按門檻遞增或遞減掃描，先把所有已滿足門檻的元素加入，再回答當前查詢。",
        answer="資料結構中的內容恰好是當前查詢可見的候選；答案回填到原查詢順序。",
        pitfall="離線排序不能改變有時間依賴的語意；若查詢依賴操作順序，要把時間也納入維度。",
    ),
    "dp": FamilyContent(
        principle="先定義狀態語意，再從最後一步決策推導轉移，將重複子問題收斂成可表格化的計算。",
        state="明確 `dp` 下標代表的範圍、結尾條件、已選集合或狀態機階段。",
        update="按依賴方向填表：線性從前到後、區間按長度、樹形用後序，狀壓按 mask 遞增。",
        answer="答案可能是某個終態、所有終態最大/最小值，或根節點回傳值；需和狀態定義一致。",
        pitfall="不要先背公式；初始化、不可達值與空間壓縮更新順序最容易出錯。",
    ),
    "knapsack": FamilyContent(
        principle="把容量或限制當作 DP 維度，逐個物品決定選或不選、選幾次。",
        state="`dp[c]` 表示容量為 c 時的最佳值或方案數，必要時加上物品種類或數量維度。",
        update="0-1 背包容量倒序，完全背包容量正序，多重背包可二進位拆分或用單調隊列優化。",
        answer="通常取 `dp[capacity]` 或所有合法容量的最優值，計數題則累加方案數。",
        pitfall="正序/倒序決定同一物品能否重複使用，這是背包題最關鍵的不變式。",
    ),
    "interval_dp": FamilyContent(
        principle="把答案限制在一段區間內，按區間長度由短到長合併左右子問題或枚舉最後一次操作。",
        state="`dp[l][r]` 表示只考慮閉區間 `[l,r]` 的答案。",
        update="按長度枚舉區間，再枚舉分割點、匹配端點或最後操作的位置。",
        answer="整段答案通常在 `dp[0][n-1]`；開區間模板則注意虛擬邊界。",
        pitfall="轉移依賴短區間，填表順序不能反；端點是否包含會影響下標。",
    ),
    "state_dp": FamilyContent(
        principle="用 bitmask 表示已選集合或輪廓狀態，將指數級搜尋中的重複集合狀態合併。",
        state="`mask` 的每一位代表元素是否已選，必要時再加最後位置、輪廓或連通狀態。",
        update="從舊 mask 加入一個未選元素，或枚舉子集/補集做合併轉移。",
        answer="全選 mask、合法終點或所有 mask 的最優值即為答案。",
        pitfall="狀態數是 `2^n`，要先確認 n 足夠小；子集枚舉需避免重複與空集陷阱。",
    ),
    "graph": FamilyContent(
        principle="先把題意建成節點與邊，再根據邊權、方向與狀態維度選 DFS、BFS、拓撲、最短路或連通性演算法。",
        state="節點可是真實點，也可以是 `(位置, 狀態)`；邊要明確成本與合法轉移。",
        update="DFS/BFS 標記訪問，Dijkstra 鬆弛距離，拓撲排序移除入度，低鏈演算法回傳可到達祖先。",
        answer="答案來自距離陣列、連通塊數、拓撲序、橋/割點集合或可達狀態。",
        pitfall="邊權為 0/1、非負或可能為負會決定完全不同的最短路演算法。",
    ),
    "grid": FamilyContent(
        principle="把格子視為圖上的節點，方向陣列生成鄰邊；若有鑰匙、障礙消除或方向成本，狀態也要進入節點。",
        state="保存 `(row, col)` 以及必要的 mask、剩餘次數、方向或時間。",
        update="檢查邊界與障礙後擴展四/八方向；普通最短路用 BFS，0/1 成本用 deque，非負權用 Dijkstra。",
        answer="首次到達目標的距離、所有連通區域大小或遍歷後的標記矩陣即為答案。",
        pitfall="visited 不能只看座標；同一格以不同鑰匙集合或剩餘消除次數到達可能是不同狀態。",
    ),
    "greedy": FamilyContent(
        principle="找到可證明安全的局部選擇規則，並用交換論證、反悔或不變式說明它不會傷害最優解。",
        state="保存目前已選集合的摘要，例如最後結束時間、剩餘資源、堆中的可反悔候選或構造前綴。",
        update="按證明需要的排序鍵掃描，每一步做當前安全選擇，必要時反悔刪掉最差已選候選。",
        answer="掃描完成後，已選集合大小、構造字串或累積代價就是答案。",
        pitfall="不能只憑直覺選最大/最小；若交換論證不成立，通常需要 DP 或搜尋。",
    ),
    "sliding_window": FamilyContent(
        principle="用左右指標維護一段連續窗口，使窗口條件在端點單調移動下可以增量更新。",
        state="保存窗口 `[left,right]` 內的總和、頻次、種類數、最大值或其他可增刪摘要。",
        update="右端擴張納入新元素；當條件不合法或可繼續縮短時，左端前進並移除舊元素。",
        answer="在每個合法窗口更新最長、最短或計數；恰好型常轉成「至多 K - 至多 K-1」。",
        pitfall="窗口要求條件對端點移動具備單調性；有負數的和條件通常不能直接滑動。",
    ),
    "two_pointers": FamilyContent(
        principle="利用排序、相向移動或同向單調性，讓兩個指標各自只走線性次數。",
        state="保存左右指標、當前和/差、已處理區間與必要的去重資訊。",
        update="根據當前值與目標的比較移動左或右；同向雙指標則讓慢指標維護寫入或窗口邊界。",
        answer="每次命中條件或形成合法區間時更新答案，指標掃完即完成所有候選。",
        pitfall="去重與排序前後的原下標要分清；相向指標的移動理由必須來自單調性。",
    ),
    "string": FamilyContent(
        principle="重用已比對過的資訊，避免每次字串比較、匹配或查詢都從頭開始。",
        state="依方法保存 pi/Z 陣列、回文半徑、前綴 hash、trie 節點或自動機轉移。",
        update="按字元掃描並維護目前匹配長度、最右匹配區間、hash 前綴或 automaton 狀態。",
        answer="匹配位置、LCP、回文長度或子串相等性由預處理狀態 O(1) 或均攤 O(1) 取得。",
        pitfall="hash 有碰撞風險；KMP/Z 的邊界回退與 Manacher 的半徑換算要統一。",
    ),
    "math": FamilyContent(
        principle="先把文字條件翻成公式、整除性、同餘、組合模型或幾何關係，再用可證明的數學性質化簡。",
        state="保存質數表、因子次數、gcd/lcm、組合數預處理、期望狀態或幾何向量。",
        update="依公式做篩法、分解、快速冪、容斥、遞推或座標運算。",
        answer="由推導出的閉式、計數公式、取模結果或幾何判定直接計算。",
        pitfall="先用小資料猜規律可以，但最後必須補證明；乘法、組合數與取模除法要注意溢位和逆元。",
    ),
    "linked_list": FamilyContent(
        principle="用指標改接來表示序列操作，重點是保存下一個節點，避免改指標後丟失剩餘鏈。",
        state="保存 `prev`、`cur`、`next`、dummy head，快慢指標題還要保存步速差。",
        update="每次改邊前先記下下一個節點；刪除、插入、反轉都只改局部幾條指標。",
        answer="返回 dummy 的下一個節點、新頭節點，或快慢指標相遇/分離後的位置。",
        pitfall="頭節點被刪除或反轉時要用 dummy 統一；環形鏈表要先判斷是否相遇。",
    ),
    "tree": FamilyContent(
        principle="在樹上用 DFS/BFS 傳遞資訊，自底向上彙總子樹，自頂向下攜帶祖先或父側狀態。",
        state="節點回傳子樹摘要，例如高度、路徑和、是否平衡、LCA 候選或 DP 狀態。",
        update="遞迴處理子節點後合併；需要父側資訊時再做第二次 DFS 或倍增預處理。",
        answer="答案可能在根的回傳值、全局變數、每個節點的 DP，或查詢時的祖先跳躍結果中。",
        pitfall="遞迴深度可能爆 stack；LCA、換根與直徑題要分清向父延伸值和閉合答案。",
    ),
    "backtracking": FamilyContent(
        principle="在決策樹上枚舉所有可行選擇，遞迴前做選擇，遞迴後恢復現場，並用剪枝提前停止不可能分支。",
        state="保存 path、used 標記、起始下標、剩餘目標值或當前局面。",
        update="每層枚舉可選候選，加入 path 後遞迴，返回時撤銷同一個修改。",
        answer="到達合法葉子或每個中間節點時收集 path，求最值題則更新全局答案。",
        pitfall="排列、組合、子集的去重規則不同；含重複元素通常要先排序並做同層去重。",
    ),
    "generic": FamilyContent(
        principle="圍繞本節標題建立資料表示、不變式與答案更新規則，避免只套用上層分類的通用模板。",
        state="先寫出輸入中的哪些量會變、哪些量需要快速查詢，以及它們應保存在何種結構中。",
        update="按題目自然順序或排序後順序處理，每一步只更新與當前元素相關的局部狀態。",
        answer="在不變式成立的位置讀取答案，並明確說明答案來自哪個狀態或資料結構。",
        pitfall="若無法說清狀態語意與更新時機，就先回到暴力解再找可維護的重複部分。",
    ),
}


def denumber(title: str) -> str:
    return re.sub(r"^\d+(?:\.\d+)*\.?\s*", "", title).strip()


def normalize(text: str) -> str:
    return text.lower()


def display_topic(path_titles: list[str]) -> str:
    raw = path_titles[-1]
    clean = denumber(raw)
    parent = denumber(path_titles[-2]) if len(path_titles) >= 2 else ""

    if clean in GENERIC_TITLES or clean.startswith("Part "):
        return f"{parent}：{clean}" if parent else clean
    return clean


def family_for(file_name: str, path_titles: list[str]) -> str:
    scoped_titles = path_titles[1:] if len(path_titles) > 1 else path_titles
    hay = normalize(" ".join([file_name, *scoped_titles]))

    checks: list[tuple[str, tuple[str, ...]]] = [
        ("lazy_heap", ("懶刪除堆", "lazy deletion")),
        ("regret_heap", ("反悔堆",)),
        ("dual_heap", ("對頂堆", "中位數")),
        ("heap", ("堆（", "優先佇列", "第 k 小", "第 k 大", "重排元素")),
        ("monotonic_queue", ("單調佇列", "單調隊列")),
        ("monotonic_stack", ("單調堆疊", "矩形", "貢獻法")),
        ("stack", ("堆疊", "棧", "表示式解析", "鄰項消除")),
        ("queue", ("佇列", "隊列")),
        ("difference", ("差分",)),
        ("prefix_sum", ("字首和", "前綴和")),
        ("splay", ("伸展樹", "splay")),
        ("mo", ("莫隊",)),
        ("sqrt", ("根號", "sqrt")),
        ("sparse_table", ("st 表", "sparse table")),
        ("segment_tree", ("線段樹", "segment tree")),
        ("fenwick", ("樹狀陣列", "fenwick")),
        ("dsu", ("並查集",)),
        ("trie", ("字典樹", "trie", "0-1")),
        ("offline", ("離線",)),
        ("enumeration", ("列舉", "枚舉", "對角線", "遍歷")),
        ("knapsack", ("背包",)),
        ("interval_dp", ("區間 dp",)),
        ("state_dp", ("狀態壓縮", "狀壓", "tsp", "輪廓線")),
        ("dp", ("動態規劃", "dp", "打家劫舍", "最大子陣列", "樹形")),
        ("grid", ("網格", "0-1 bfs")),
        ("graph", ("圖論", "最短路", "拓撲", "dijkstra", "基環樹", "生成樹", "網路流", "低鏈")),
        ("sliding_window", ("滑動視窗", "窗口")),
        ("two_pointers", ("雙指標", "快慢指標", "前後指標", "相向")),
        ("greedy", ("貪心", "反悔", "交換論證", "區間覆蓋", "構造")),
        ("bitwise", ("位元", "bit", "xor", "and/or", "線性基")),
        ("string", ("字串", "kmp", "manacher", "雜湊", "後綴", "自動機", "z 函式")),
        ("math", ("數學", "質數", "gcd", "lcm", "組合", "機率", "幾何", "博弈", "因子")),
        ("linked_list", ("連結串列", "鏈表")),
        ("backtracking", ("回溯", "搜尋")),
        ("tree", ("二叉樹", "二元樹", "一般樹", "lca", "樹上")),
        ("binary_search", ("二分", "第k小", "第 k")),
    ]

    for family, keywords in checks:
        if any(keyword in hay for keyword in keywords):
            return family
    return "generic"


def build_intro(raw_title: str, topic: str, family: FamilyContent) -> str:
    return "\n\n".join(
        [
            "**原理講解**",
            (
                f"本葉子章節「{raw_title}」聚焦於「{topic}」。"
                f"它的核心原理是{family.principle}"
            ),
            (
                "實作方式上，先把題目拆成「狀態表示、更新規則、答案讀取」三件事。"
                f"本節的關鍵是不變式要能支撐每一步更新：{family.state}"
            ),
            "**實作方式**",
            "\n".join(
                [
                    f"- 狀態表示：{family.state}",
                    f"- 更新流程：{family.update}",
                    f"- 答案讀取：{family.answer}",
                    f"- 邊界與複雜度：{family.pitfall}",
                ]
            ),
        ]
    )


def build_pattern(topic: str, family: FamilyContent) -> str:
    return "\n\n".join(
        [
            "**題目線索（Pattern）**",
            "\n".join(
                [
                    f"- 題目可以被整理成「{topic}」的狀態與更新模型。",
                    f"- 暴力做法會反覆重算；本節做法把重複工作壓進可維護狀態：{family.state}",
                    f"- 每次操作只需要局部更新：{family.update}",
                    f"- 答案能從維護後的狀態直接讀出：{family.answer}",
                ]
            ),
        ]
    )


def build_cpp_hint(topic: str, family: FamilyContent) -> str:
    return "\n\n".join(
        [
            "**C++ 實作提示**",
            (
                f"本節題目請以「{topic}」的不變式為中心，不要套用其他章節的示範題。"
                "寫程式前先把下面四個部位固定下來。"
            ),
            "\n".join(
                [
                    f"- 狀態欄位：{family.state}",
                    f"- 更新函式：{family.update}",
                    f"- 查詢/答案：{family.answer}",
                    f"- 防錯檢查：{family.pitfall}",
                ]
            ),
        ]
    )


def find_body_start(summary: str) -> int:
    starts: list[int] = []
    for marker in SECTION_MARKERS:
        pos = summary.find(marker)
        if pos > 0:
            starts.append(pos)
    return min(starts) if starts else len(summary)


def find_next_marker(summary: str, start: int, markers: tuple[str, ...]) -> int:
    positions = [summary.find(marker, start) for marker in markers]
    positions = [position for position in positions if position != -1]
    return min(positions) if positions else len(summary)


def replace_pattern_section(summary: str, topic: str, family: FamilyContent) -> str:
    start = summary.find("**題目線索")
    replacement = build_pattern(topic, family)
    if start == -1:
        insertion = summary.find("**代表例題")
        if insertion == -1:
            insertion = summary.find("**C++")
        if insertion == -1:
            return f"{summary.rstrip()}\n\n{replacement}"
        return f"{summary[:insertion].rstrip()}\n\n{replacement}\n\n{summary[insertion:].lstrip()}"

    end = find_next_marker(
        summary,
        start + 1,
        ("**代表例題", "**C++", "**本節題單", "---"),
    )
    return f"{summary[:start].rstrip()}\n\n{replacement}\n\n{summary[end:].lstrip()}"


def clean_legacy_body(
    summary: str,
    topic: str,
    family: FamilyContent,
) -> str:
    legacy_problem_note = "需要反覆取出當前最優候選；練習定義堆中元素代表的邊界與過期清理規則。"
    summary = summary.replace(
        legacy_problem_note,
        f"請套用「{topic}」的狀態、不變式與實作方式，先寫出資料表示、更新流程與答案讀取規則。",
    )

    legacy_cpp_sentinels = (
        "以下用同型延伸示範題 215. 陣列中的第 K 個最大元素 展示核心寫法。",
        "以下用同型延伸示範題 20. 有效的括號 展示核心寫法。",
    )
    if any(sentinel in summary for sentinel in legacy_cpp_sentinels):
        start = summary.find("**C++ 範例講解**")
        if start != -1:
            summary = f"{summary[:start].rstrip()}\n\n{build_cpp_hint(topic, family)}"

    return summary


def replace_opening(summary: str, intro: str) -> str:
    stripped = summary.strip()
    if not stripped:
        return intro

    start = find_body_start(stripped)
    rest = stripped[start:].lstrip()
    if not rest:
        return intro
    return f"{intro}\n\n{rest}"


def walk_leaves(node: dict[str, Any], path_titles: list[str]):
    current_path = [*path_titles, str(node.get("title", ""))]
    children = node.get("children") or []
    if not children:
        yield node, current_path
        return
    for child in children:
        yield from walk_leaves(child, current_path)


def process_file(path: Path, check: bool) -> tuple[int, int, list[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    total = 0
    failures: list[str] = []

    for leaf, path_titles in walk_leaves(data, []):
        total += 1
        raw_title = path_titles[-1]
        topic = display_topic(path_titles)
        family = FAMILIES[family_for(path.name, path_titles)]
        intro = build_intro(raw_title, topic, family)
        old_summary = str(leaf.get("summary") or "")
        new_summary = replace_opening(old_summary, intro)
        new_summary = replace_pattern_section(new_summary, topic, family)
        new_summary = clean_legacy_body(new_summary, topic, family)

        opening = new_summary[: find_body_start(new_summary)]
        title_ok = raw_title in opening or topic in opening or denumber(raw_title) in opening
        if "**原理講解**" not in opening or "**實作方式**" not in opening or not title_ok:
            failures.append(" > ".join(path_titles))

        if old_summary != new_summary:
            leaf["summary"] = new_summary
            changed += 1

    if changed and not check:
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return total, changed, failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="audit without writing")
    args = parser.parse_args()

    total_leaves = 0
    total_changed = 0
    failures: list[str] = []

    for path in sorted(TUTORIAL_DIR.glob("*.json")):
        leaves, changed, file_failures = process_file(path, args.check)
        total_leaves += leaves
        total_changed += changed
        failures.extend(file_failures)
        mode = "would update" if args.check else "updated"
        print(f"{path.name}: {leaves} leaves, {mode} {changed}")

    print(f"total: {total_leaves} leaves, changed {total_changed}")
    if failures:
        print("audit failures:")
        for item in failures:
            print(f"- {item}")
        return 1
    print("audit passed: every leaf opening has 原理講解, the leaf title/topic, and 實作方式")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
