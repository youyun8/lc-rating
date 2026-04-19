#!/usr/bin/env python3
"""
Deepen tutorial `summary` fields: rating plan topics, generic auto-fills,
ultra-short stubs, and thin 思維擴展 templates.

Run from repo root:
  python3 apps/web/scripts/deepen_tutorial_summaries.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

TUTORIAL_DIR = Path(__file__).resolve().parent.parent / "public" / "tutorial"

PHASE_FOCUS = {
    1: "以建立模板與正確性為主，允許較長思考時間；重點是看懂題意與邊界，不必追求競賽節奏。",
    2: "開始計時單題，練習辨識題型與選對算法；錯題要寫清「為何當時沒想到」。",
    3: "題目常需兩個以上技巧串接；練習先寫暴力上界再換觀察，並習慣閱讀多種題解。",
    4: "接近競賽 Q3/Q4 思維深度；每題做完後用一句話總結「核心不變式／關鍵性質」。",
    5: "偏向綜合建模與實作細節；建議搭配虛擬賽，訓練讀題與取捨。",
    6: "融會多主題，錯誤成本高；以穩定 AC 與嚴格複雜度分析為目標，並定期複盤。",
}

RATING_TOPIC = {
    "二分搜尋": (
        "在有序或具單調性的結構上做「決策」：熟練 `lower_bound`／`upper_bound` 語意（第一個 $\\geq$、$>$ 的位置），並能把它改寫成「最小可行答案」的迴圈不變式。\n\n"
        "**二分答案**：把「最難滿足的那一段」當成 $check(mid)$，證明可行集合為 $[T,\\infty)$ 或 $(-\\infty,T]$ 的單調區間；注意離散與連續、整數與浮點的收斂條件。\n\n"
        "**進階**：第 $K$ 小／乘法表計數、與前綴和／堆疊拼裝；寫完用「全可行／全不可行」兩組小測資驗證邊界。"
    ),
    "位元運算": (
        "熟練 AND／OR／XOR 的真值表與吸收律；能對單一位做貢獻法統計，或把集合操作改寫成位元枚舉／SOS DP。\n\n"
        "**常見套路**：子集枚舉、試填最高位、`popcount`、狀態壓縮；高階題常與貪心、DP 或資料結構（Trie）結合。\n\n"
        "**實務**：先確認是否可「按位獨立」，否則要處理進位／借位耦合。"
    ),
    "資料結構": (
        "依題意選容器：區間和／最值查詢（前綴和、樹狀數組、線段樹）、動態連通性（併查集）、前綴／字典序（Trie、AC 自動機）、Top-K（堆）。\n\n"
        "**訓練重點**：均攤分析、懶標記、可持久化與離線（掃描線、CDQ）何時值得上。\n\n"
        "**習慣**：寫清每個操作的時間界，避免把「看似 log」的常數堆疊到超時。"
    ),
    "動態規劃": (
        "先定義「狀態表示什麼」與「最後一步是誰做的」：線性／劃分／背包、區間、狀態機、樹形與狀壓；再談優化（前綴和、單調隊列、斜率、資料結構優化轉移）。\n\n"
        "**檢查清單**：無後效性、邊界、是否可滾動陣列、是否需要離散化座標或值域。\n\n"
        "**進階**：期望／博弈 DP、數位 DP 與計數分離；證明轉移涵蓋所有情況。"
    ),
    "圖論演算法": (
        "熟練 BFS／DFS 建模（分層圖、0-1 BFS）、最短路（Dijkstra、Bellman-Ford、Floyd）、拓撲與 DAG DP、最小生成樹（Kruskal／Prim）與並查集。\n\n"
        "**進階**：基環樹、二分圖匹配入門、網路流／費用流建模；注意有向無環與有環在 DP 上的差異。\n\n"
        "**習慣**：先判稀疏／稠密再選最短路算法，並手算小圖驗證重邊與自環。"
    ),
    "貪心": (
        "排序鍵、區間右端點、反悔堆與交換論證：能說清「為什麼局部決策不會錯殺全域最優」。\n\n"
        "**對照 DP**：若交換論證失敗或需子問題最優，多半要改 DP；可先寫小例子 brute force 對拍。\n\n"
        "**常見坑**：字典序與數值目標不同、相等元素的穩定排序、證明遺漏的邊界情況。"
    ),
    "網格圖": (
        "四／八鄰接、visited 語意、從多源 BFS 到最短路權重；與狀態壓縮（鑰匙、汙染擴散）結合時，狀態維度要寫在紙上再估複雜度。\n\n"
        "**回溯**：剪枝條件與對稱性去重；大網格優先迭代 DFS 或顯式棧避免遞迴溢出。\n\n"
        "**與樹／圖**：網格可視為特殊圖；座標離散化與障礙處理要一致。"
    ),
    "數學": (
        "數論（整除、同餘、逆元、CRT）、組合（計數、容斥）、線性基與簡單生成函式；機率期望則熟練全機率公式與線性性。\n\n"
        "**策略**：模數運算階梯（先質因分解再組合）、爆搜小範圍找規律再證明。\n\n"
        "**注意**：組合數預處理範圍、Lucas 定理適用條件與浮點幾何精度。"
    ),
    "單調堆疊": (
        "維護單調遞增／遞減以 $O(n)$ 求「下一個更大／更小」；擴展到直方圖最大矩形、雨水、貢獻法計數。\n\n"
        "**細節**：相等元素用嚴格／非嚴格不等式會影響寬度；邊界用哨兵節點簡化。\n\n"
        "**搭配**：常與前綴和、樹狀數組或線段樹做二維統計。"
    ),
    "滑動視窗": (
        "定長與不定長雙指標：右擴張、左收縮時維護「視窗內性質」（和、distinct 數、單調隊列最值）。\n\n"
        "**子陣列個數**：釐清「越短越合法」與「越長越合法」兩套不等式方向，避免雙計數。\n\n"
        "**進階**：同向雙指標、三指標分組迴圈、字串與矩陣上的掃描。"
    ),
    "字串": (
        "KMP／Z 的 border 與 LCP 語意、雙模雜湊比對子串、Manacher 與中心擴展取捨；Trie／AC 處理多模式匹配。\n\n"
        "**後綴結構**：SA／SAM 用於本質不同子串、子串計數；先掌握倍增 SA 再談優化。\n\n"
        "**實務**：雜湊碰撞與模數選擇、索引從 0 或 1 開始的一致性。"
    ),
    "樹和二元樹": (
        "遍歷序還原、LCA（倍增／Tarjan 思想）、直徑與路徑長度、樹形背包與換根 DP。\n\n"
        "**一般樹**：鄰接表 DFS、子樹大小、重心與分治；注意無根樹指定根後的父子向。\n\n"
        "**複習**：後序匯總資訊、前序下傳參數的「有遞有歸」模式。"
    ),
}


def _rating_leaf_summary(leaf_title: str, parent_title: str) -> str | None:
    m = re.match(r"^\d+\.\d+\s+(.+)$", leaf_title.strip())
    if not m:
        return None
    topic = m.group(1).strip()
    pm = re.search(r"Phase\s+(\d+)", parent_title)
    phase = int(pm.group(1)) if pm else 1
    body = RATING_TOPIC.get(topic)
    if not body:
        return None
    hint = PHASE_FOCUS.get(phase, PHASE_FOCUS[3])
    return f"{body}\n\n**本階段（{parent_title.split('：')[0]}）**：{hint}"


def _is_generic_batch(s: str) -> bool:
    return "與本章「" in s or "建議對照題單連結" in s


def _is_thin_mind_ext(s: str) -> bool:
    return "本節為「" in s and "延伸與變形" in s and len(s) < 260


def _deepen_mind_extension(parent: str) -> str:
    base = (
        f"本節為「{parent}」的延伸與變形：題幹包裝更活，常混雜次要條件或需多步轉化。\n\n"
        "**練習流程**：\n"
        "1. 默寫上級節核心不變式與結束條件\n"
        "2. 列出與主模板不同的約束，逐條對應修改點\n"
        "3. 用小測資手跑，特別是空、單元素、全相等、極值\n\n"
    )
    if "二分" in parent or "求最小" in parent or "求最大" in parent:
        base += (
            "**本主線加強**：旋轉陣列、浮點二分精度、`check` 內部是否需離散化或排序；"
            "證明單調時先畫「可行／不可行」示意。"
        )
    elif "貪心" in parent:
        base += "**本主線加強**：交換相鄰兩項的不等式、相等元素穩定處理、與堆／排序鍵的一致性。"
    elif "滑動" in parent or "雙指標" in parent or "視窗" in parent:
        base += "**本主線加強**：子陣列個數兩種單調方向、三指標分組外層迴圈不變式、是否需 multiset／deque。"
    elif "堆疊" in parent or "單調" in parent:
        base += "**本主線加強**：嚴格／非嚴格單調、哨兵、與貢獻法結合時的左右第一次突破。"
    elif "圖" in parent or "DFS" in parent or "BFS" in parent:
        base += "**本主線加強**：回溯去重、分層圖狀態設計、最短路邊權是否允許負權或 0-1。"
    elif "DP" in parent or "規劃" in parent:
        base += "**本主線加強**：維度可否滾動、轉移是否漏情況、是否需要離線或資料結構優化轉移。"
    elif "字串" in parent or "KMP" in parent or "Z" in parent:
        base += "**本主線加強**：border 與週期、雜湊雙模、後綴結構與自動機邊界。"
    elif "並查集" in parent or "字典樹" in parent or "線段樹" in parent or "樹狀" in parent:
        base += "**本主線加強**：路徑壓縮與額外資訊相容性、懶標記下推時機、離線與可持久化取捨。"
    else:
        base += "**本主線加強**：把題意轉成「決策序列／區間／圖」其中一類，再對照主節模板逐項檢查。"
    return base


def _deepen_generic_path(fname: str, titles: list[str]) -> str | None:
    joined = " > ".join(titles)
    leaf = titles[-1]
    parent = titles[-2] if len(titles) > 1 else ""

    def g(text: str) -> str:
        return text + "\n\n**自檢**：能否在 2 分鐘內寫出暴力版本與其上界，再對照本節標籤收斂到正解。"

    if "dp" in fname.lower() or "動態規劃" in joined:
        if "圖 DP" in leaf or "圖" in leaf and "DP" in leaf:
            return g(
                "在有向無環圖或樹上定義 DP：狀態常含節點、父邊或有限色集合；用拓撲序或記憶化 DFS 求最優／計數。\n\n"
                "**重點**：與最短路差別在「路徑是否帶有選擇／計數語意」；環上需特判或改寫成矩陣快速幂／Karp。"
            )
        if "博弈" in leaf:
            return g(
                "公平組合遊戲：Sprague–Grundy、Nim 與變形；小狀態表格式打表找週期，大狀態用數學結論。\n\n"
                "**提醒**：終止態 SG=0；異或和為 0 表示先手必敗（正常玩法）。"
            )
        if "期望" in leaf or "機率" in leaf:
            return g(
                "期望線性性、全機率公式、記憶化搜尋求期望步數；有環時需列方程或高斯消元（小狀態）。\n\n"
                "**注意**：是否馬可夫、是否需模逆元、浮點精度與收斂迭代。"
            )
        if "輪廓線" in leaf:
            return g(
                "狀壓在網格「邊界輪廓」上進行：轉移只依賴上一行局部模式；寬度小時可行，寬度大時考慮其他分解。\n\n"
                "**要點**：正確處理插頭／鋪磚的相容性與邊界填滿。"
            )
        if "數位" in leaf and "其他" in leaf:
            return g(
                "不易歸類的數位 DP：帶前導零、限制與額外餘數／位積等狀態；先寫記憶化搜尋版再轉迭代。\n\n"
                "**習慣**：把「上界緊繃」與「自由位」分開處理，避免重複計數。"
            )
        if "優化" in parent or "優化 DP" in joined:
            return g(
                "轉移式形如 $\\sum_{j} f(j)\\cdot w$ 或斜率形式時，考慮前綴和、單調隊列、凸包技巧（CHT）或線段樹／樹狀數組維護最值。\n\n"
                "**步驟**：寫出暴力轉移 → 找單調性 → 選資料結構；注意索引單調與查詢單調是否一致。"
            )
        if "雜項" in leaf or (leaf.startswith("20.") and "其他" in leaf):
            return g(
                "小專題與綜合題：用於補洞與賽後；每題記一條「新技巧或新反例」。\n\n"
                "**策略**：先歸類到背包／區間／狀壓／樹形之一，再決定是否值得做細緻優化。"
            )
        if "跳躍遊戲" in leaf:
            return g(
                "可達性／最少步：線段上 BFS、貪心維護最遠可達、或單調隊列優化 DP；先畫成「從 i 可到區間」的依賴圖。\n\n"
                "**對照**：與圖論 BFS／最短路章節的建模差異。"
            )

    if "graph" in fname or "圖論" in joined:
        if "跳躍遊戲" in leaf:
            return g(
                "可達性／最少步：線段上 BFS、貪心維護最遠可達、或單調隊列優化 DP；先畫成「從 i 可到區間」的依賴圖。\n\n"
                "**對照**：與圖論 BFS／最短路章節的建模差異。"
            )
        if "分層圖" in leaf:
            return g(
                "把有限資源（免費邊次數、顏色、票券）拆成圖層，層內用 Dijkstra 或 0-1 BFS；狀態數 = 原點數 $\\times$ 層數。\n\n"
                "**檢查**：跨層邊是否有向、層 0 是否為起點集合。"
            )
        if "Bitset" in leaf or "bitset" in leaf.lower():
            return g(
                "用位集並行更新 Floyd 的可達性矩陣，適合稠密圖且 $n$ 約千級；注意語言常數與 cache。\n\n"
                "**風險**：位運算錯誤難查，建議小圖對拍標準 Floyd。"
            )
        if "模擬費用流" in leaf:
            return g(
                "用堆＋最短路或貪心反覆「增廣」模擬費用流決策；適合特殊費用結構。\n\n"
                "**要點**：證明每步局部最優能推到全局；注意負圈與退流是否被題目允許。"
            )
        if "其他" in leaf and len(titles) <= 3:
            return g(
                "圖論雜項：建模技巧、冷門性質與綜合題；做完後把模型畫成「節點＝狀態、邊＝轉移」。\n\n"
                "**習慣**：重邊、自環、0 權邊與斷連對算法的影響逐條檢查。"
            )

    if "data_structure" in fname or "資料結構" in joined:
        if "Part A" in leaf or "Part B" in leaf:
            return g(
                "高複雜度綜合題：可能同時用到線段樹分治、可持久化、分塊或離線技巧；建議分兩次做，第一次只寫暴力與部分分。\n\n"
                "**策略**：拆子任務，確認模數與常數後再整合。"
            )
        if "專題：比較複雜" in parent or "複雜的題目" in joined:
            return g(
                "整章為大型建模與實驗場：優先掌握題單前十二章再回來；每題記「資料結構選型理由」。\n\n"
                "**心態**：允許長週期完成，重在思路而非 AC 速度。"
            )

    if "math" in fname and "放球" in joined:
        return g(
            "Stars and bars、不可辨識球盒與受限分配；與組合、生成函式、容斥連用。\n\n"
            "**提醒**：「至少一個」與「可為空」的插入隔板法差異。"
        )

    if "greedy" in fname or "貪心" in joined:
        if "倒序貪心" in leaf:
            return g(
                "從尾端或高位開始決策：常見於迴文構造、括號與字典序；每步決策要證明不影響前面已鎖定的最優性。\n\n"
                "**對照**：與單調棧從左到右建最小字典序的差異。"
            )

    if "string" in fname:
        if "進階" in leaf and "其他" in parent:
            return g(
                "字串冷門與綜合：後綴自動機進階、子序列自動機與複雜度取捨；先確定是否需要線上／離線。\n\n"
                "**習慣**：長度與字元集決定是否可用 $O(n^2)$ 或必須線性。"
            )

    # default generic replacement
    return g(
        f"「{leaf}」與「{parent or '本章'}」主線相扣：請對照題單連結中的範例與證明思路，把暴力上界、關鍵觀察與最終複雜度寫成三段筆記。"
    )


def _deepen_ultra_short(fname: str, leaf: str, titles: list[str]) -> str | None:
    joined = " > ".join(titles)
    if "腦筋急轉彎" in leaf:
        return (
            "題意跳脫常規模板，常需小例子手算＋大膽猜結論再證明；與構造、不變式、奇偶論證高度相關。\n\n"
            "**策略**：寫暴力小搜尋規律；賽場上若無思路，先判有無多解與構造型答案。"
        )
    if leaf == "8. 思維題" and "位元運算" in joined:
        return (
            "非常規位元技巧：試填、構造反例、利用代數恆等式化簡式子；每題先列出「位獨立／不獨立」。\n\n"
            "**提醒**：長整數與 Python 大數的位長度、C++ 無號溢位。"
        )
    if "旅行商" in leaf or "TSP" in leaf:
        return (
            "狀壓經典：$dp[mask][i]$ 表示走過集合 `mask` 且最後在 $i$ 的最短路長；可搭配子集枚舉優化或Held–Karp $O(n^2 2^n)$。\n\n"
            "**注意**：起點固定與否、是否要求回到起點會影響初始化與答案讀取。"
        )
    if "斜率優化" in leaf or "凸包最佳化" in leaf or "CHT" in leaf:
        return (
            "當 DP 轉移式可改寫成「直線在某一點取最大／最小」且查詢的斜率或橫座標具單調性時，可用 deque 維護下凸殼／上凸殼，均攤 $O(n)$。\n\n"
            "**步驟**：把狀態改寫成 $y = kx + b$ 的形式 → 確認加入直線與查詢順序是否單調 → 選李超線段樹或單調隊列版 CHT。\n\n"
            "**對照**：若查詢不單調，考慮李超樹或分治優化 DP。"
        )
    if leaf == "5.1 基礎" and "佇列" in joined:
        return (
            "FIFO 基本操作與應用：層序遍歷、滑動視窗單調隊列的輔助容器、BFS 佇列實作細節。\n\n"
            "**對照**：與雙端佇列、優先佇列在題意上的取捨。"
        )
    if leaf == "7.1 基礎" and "字典樹" in joined:
        return (
            "Trie 插入／前綴查詢、結尾標記與路徑計數；26 叉與動態開點的記憶體估算。\n\n"
            "**延伸**：與 AC 自動機 fail 樹、可持久化 Trie 的銜接。"
        )
    if "0-1 字典樹" in leaf or "異或字典樹" in leaf:
        return (
            "按二進位位建二元 Trie：查詢與集合中某數的最大 XOR、區間最大異或（可持久化）。\n\n"
            "**細節**：從高位到低位走訪、補前導零對齊長度。"
        )
    if leaf == "12. 區間選點" and "貪心" in joined:
        return (
            "與「不相交區間」對偶：最少點覆蓋所有區間常按右端點排序貪心；與區間圖的點覆蓋關係可畫線段圖理解。\n\n"
            "**證明**：交換論證說明為何總可選當前區間最右點。"
        )
    if leaf == "14. 尤拉路徑/尤拉回路" and "圖論" in joined:
        return (
            "無向／有向圖歐拉路存在的充要條件（度數奇偶、連通性、半歐拉）；Hierholzer 找回路。\n\n"
            "**實作**：邊刪除用鄰接表迭代器或 multiset；注意重邊與自環。"
        )
    if leaf == "4. 堆疊" and "資料結構" in joined:
        return (
            "LIFO：括號匹配、單調棧、遞迴消除與顯式棧；理解與「函式呼叫棧」的對應。\n\n"
            "**進階**：兩棧實作佇列、支援區間反轉的棧序列。"
        )
    if leaf == "16. 容斥原理":
        return (
            "計算「至少／至多」與並集大小：二進位枚舉子集容斥符號 $(-1)^{|S|}$；與 gcd 集合、排列限制搭配。\n\n"
            "**技巧**：先轉成補集或「不合條件」較好數時再用容斥。"
        )
    if leaf == "13. 同向雙指標" and "滑動" in joined:
        return (
            "兩個指標同向掃描：常見於合併有序陣列、快排 partition、去重；與滑動視窗差在「是否維護固定窗口性質」。\n\n"
            "**複雜度**：通常 $O(n)$，注意內層 while 總步數均攤。"
        )
    if leaf == "15. 背向雙指標" and "滑動" in joined:
        return (
            "從中間向兩端或從兩端向中間：迴文、有序陣列兩數之和、夾擠法；停止條件與重複元素去重要寫清。\n\n"
            "**對照**：與「相向」在實作上的命名差異以題單為準，重點是索引移動方向。"
        )
    if leaf == "21. 三指標" and "滑動" in joined:
        return (
            "外層固定一個指標，內層雙指標掃描：如排序陣列找三元組和；總複雜度多為 $O(n^2)$。\n\n"
            "**優化**：排序後去重、剪枝與提前 break。"
        )
    if leaf == "5. 其他遞迴/分治" and "鏈結" in joined:
        return (
            "分治與遞迴在鏈表上的應用：merge sort 鏈表、分治反轉；注意斷鏈與歸併後頭節點返回。\n\n"
            "**複雜度**：找中點 $O(n)$，總 $O(n\\log n)$。"
        )
    if leaf == "5.1 應用題" and "遞迴" in joined:
        return (
            "遞迴分形、樹狀遞迴與實作題：重點是遞迴深度、模數與記憶化邊界。\n\n"
            "**習慣**：先寫數學閉式或小範圍表，再對拍遞迴版。"
        )
    if "刪除節點" in leaf and "連結串列" in joined:
        return (
            "已知節點指標刪除（拷貝值＋刪後繼）與按值／按索引刪除；虛擬頭可統一頭刪。\n\n"
            "**邊界**：刪頭、刪尾、單節點、空表。"
        )
    if "反轉連結串列" in leaf and "連結串列" in joined:
        return (
            "迭代三指標反轉與遞迴版；區間反轉可先走到左端再標準反轉 $n$ 步。\n\n"
            "**延伸**：k 組一組反轉用迴圈分段接線。"
        )
    if "前後指標" in leaf and "連結串列" in joined:
        return (
            "prev／cur 同步推進：插入、刪除與反轉都依賴「前驅」資訊；畫三格圖避免斷鏈。\n\n"
            "**模板**：反轉時 `next = cur->next; cur->next = prev;` 前移。"
        )
    if "快慢指標" in leaf and "連結串列" in joined:
        return (
            "偵測環、找中點、刪倒數第 k 個：快指標步長與停止條件（偶數長度中點偏左／右）。\n\n"
            "**數學**：Floyd 判環相遇點與環長公式。"
        )
    if leaf == "3.5 樹的直徑" and "一般樹" in joined:
        return (
            "兩次 DFS／BFS：任取一點找最遠 $u$，再從 $u$ 找最遠 $v$，距離即直徑；負權時不適用。\n\n"
            "**證明**：樹上最遠端點必為某一直徑端點。"
        )
    if leaf == "18. 專題：把 X 變成 Y" and "動態規劃" in joined:
        return (
            "最少操作／最小成本把字串、陣列或數變成目標：常為線性／區間 DP 或 BFS on state；先定義「一步」是什麼。\n\n"
            "**技巧**：雙串對齊可聯想到編輯距離類轉移。"
        )
    if leaf == "2. 單序列配對":
        return (
            "同一陣列內元素配對（如最小化 $|a_i-a_j|$ 和）：排序後相鄰配對常為最優或重要候選；需交換論證支持。\n\n"
            "**對照**：與「雙序列配對」差在是否允許跨兩個陣列重排。"
        )
    if leaf == "3. 雙序列配對":
        return (
            "兩個陣列元素一一配對：排序後同序或反序配對常由排序不等式給出極值；注意是否允許重排。\n\n"
            "**驗證**：小規模全排列對拍貪心結論。"
        )
    if leaf == "14. 合併區間" and "貪心" in joined:
        return (
            "排序後線性合併相交區間；與排程、覆蓋問題相關。若需輸出合併後列表，注意排序鍵用左或右端點的一致性。\n\n"
            "**複雜度**：排序 $O(n\\log n)$，掃描 $O(n)$。"
        )
    if "專題：比較複雜" in leaf and "資料結構" in joined and len(joined) < 80:
        return (
            "整章為高難度模擬與大實作：常同時考線段樹分治、可持久化結構、分塊或離線轉化。\n\n"
            "**建議**：先讀題拆解子任務，寫清每部分的時間界再動手；可與題單第 12 章離線技巧對照。"
        )
    if leaf == "1.10 其他" and "字串" in joined:
        return (
            "字串進階雜項：LCP／border 與週期性、重複子串計數、帶修改或線上詢問等。\n\n"
            "**路線**：能默寫 KMP／雙模雜湊後，再依題選 Manacher、後綴結構或自動機；每題記「為何暴力 TLE」。"
        )
    return None


def _deepen_video_stub(leaf: str, old: str) -> str | None:
    if not old.startswith("影片講解") or len(old) > 60:
        return None
    return (
        f"{old}\n\n"
        f"**本節「{leaf}」練習重點**：在默寫模板前先畫「三節點」示意，確認指標重連順序與迴圈退出條件；"
        "與題單同章的長文模板對照，補上邊界（空表、單節點、環）手算範例。"
    )


def _deepen_misc_bucket(fname: str, titles: list[str], old: str) -> str | None:
    if "不便單獨成類" not in old or len(old) > 280:
        return None
    leaf = titles[-1]
    joined = " > ".join(titles)
    tail = (
        "\n\n**做法**：每題寫「暴力複雜度 → 觀察單調性或可離線 → 選資料結構」三行摘要；"
        "若與主線模板差異大，標記為賽後補強而非當日主線。"
    )
    if "greedy" in fname or "貪心" in joined:
        return (
            "貪心章節的收尾：多為區間＋排序＋構造的綜合，或需交換論證才能定序的冷門題。\n\n"
            "**建議**：回顧題單第五章思考清單，逐條對照本節題目是否命中。" + tail
        )
    if "math" in fname or "數學" in joined:
        return (
            "數學雜項：含組合特例、機率小結、幾何邊角與不易歸類的推導；優先補齊模逆元、CRT、容斥與線性基等「工具箱」。"
            + tail
        )
    if "graph" in fname or "圖論" in joined:
        return (
            "圖論雜項：特殊最短路建模、混合邊權、或與 DSU／線段樹拼裝的題；做完畫「狀態＝節點」示意避免漏邊向。"
            + tail
        )
    if "dp" in fname.lower() or "動態規劃" in joined:
        return (
            "DP 雜項：多為狀態維度怪異或優化冷門的題；先寫子集／值域較小的暴力版本，再對照標籤找對應優化關鍵字。"
            + tail
        )
    if "trees" in fname or "樹" in joined or "連結串列" in joined:
        return (
            "樹與鏈表雜項：長敘事與實作細節向題目；著重邊界與指標／遞迴深度，並與題單前序章節模板交叉驗證。"
            + tail
        )
    return (
        f"「{leaf}」：收錄主線之外的小綜合題，用於擴充題感與冷門技巧。" + tail
    )


def _deepen_sliding_chapter(fname: str, titles: list[str], old: str) -> str | None:
    if fname != "sliding_window.json" or len(old) >= 260:
        return None
    leaf = titles[-1]
    joined = " > ".join(titles)
    extra = (
        "\n\n**加強**：寫出「右擴張／左收縮」各自維護的單調量；子陣列個數題先判「越短越合法」還是「越長越合法」，"
        "再決定雙指標移動時用 $\\le$ 還是 $\\ge$ 的不等式方向，避免雙重計數。"
    )
    if "進階" in leaf or "選做" in leaf or "其他" in leaf:
        return (
            "在已掌握定長／不定長模板後，本節收錄變形與較依個人目標的題目；著重「狀態定義」與「單調隊列／ multiset 」的取捨。"
            + extra
        )
    if "思維擴展" in leaf or "相似題目" in leaf:
        return old + extra
    if "反轉字串" in leaf:
        return (
            "雙指標交換或整段反轉：注意 Unicode 字元與原地要求；可先轉成陣列再兩頭夾擊。\n\n"
            "**延伸**：與迴文、字串雜湊結合時，反轉常作為對稱操作。"
        )
    if "矩陣" in leaf:
        return (
            "把列／行視為獨立序列或掃描線：依題意固定一維，在另一維上跑雙指標或滑動視窗；注意複雜度是 $O(R\\cdot C)$ 還是帶 log。\n\n"
            "**邊界**：空矩陣、單列、單欄與走訪方向。"
        )
    if "背向" in leaf:
        return (
            "雙指標從兩端向中間或從中間向外：常見於有序陣列兩數之和、迴文判定；與「相向」命名差異以題意為準，核心是索引移動方向與去重。"
            + extra
        )
    return None


def _walk_apply(
    fname: str,
    node: dict,
    titles: list[str],
    stats: dict[str, int],
) -> None:
    tlist = titles + [node["title"]]
    old = (node.get("summary") or "").strip()
    new: str | None = None

    if old:
        if fname == "rating_2400.json" and len(tlist) >= 2:
            new = _rating_leaf_summary(tlist[-1], tlist[-2])
        if new is None:
            new = _deepen_ultra_short(fname, tlist[-1], tlist)
        if new is None and _is_thin_mind_ext(old) and len(tlist) >= 2:
            new = _deepen_mind_extension(tlist[-2])
        if new is None and _is_generic_batch(old):
            new = _deepen_generic_path(fname, tlist)
        if new is None and len(old) < 120:
            new = _deepen_ultra_short(fname, tlist[-1], tlist)
        if new is None:
            new = _deepen_video_stub(tlist[-1], old)
        if new is None:
            new = _deepen_sliding_chapter(fname, tlist, old)
        if new is None:
            new = _deepen_misc_bucket(fname, tlist, old)

        if new is not None and new != old:
            node["summary"] = new
            stats["updated"] = stats.get("updated", 0) + 1

    for ch in node.get("children") or []:
        _walk_apply(fname, ch, tlist, stats)


def main() -> None:
    for path in sorted(TUTORIAL_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        stats: dict[str, int] = {}
        fname = path.name
        root_title = data["title"]
        for ch in data.get("children") or []:
            _walk_apply(fname, ch, [root_title], stats)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        u = stats.get("updated", 0)
        if u:
            print(f"{fname}: deepened {u} summaries")


if __name__ == "__main__":
    main()
