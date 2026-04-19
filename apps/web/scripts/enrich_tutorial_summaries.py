#!/usr/bin/env python3
"""
Fill empty `summary` fields in apps/web/public/tutorial/*.json.
Run from repo root: python3 apps/web/scripts/enrich_tutorial_summaries.py
"""

from __future__ import annotations

import json
from pathlib import Path

TUTORIAL_DIR = Path(__file__).resolve().parent.parent / "public" / "tutorial"

# (filename, node_id) -> exact summary (overrides heuristics)
OVERRIDES: dict[tuple[str, int], str] = {
    (
        "binary_search.json",
        13,
    ): (
        "二分以外的變形與小專題：例如與前綴和、堆、圖論或離散化結合，或 `check(mid)` 不易一眼看出單調性的題目。\n\n"
        "**建議**：先完成本題單前九章，再回頭掃這裡；寫 `check` 時務必手算小例子確認單調區間與邊界。"
    ),
}


def _nonempty(s: object | None) -> bool:
    return bool(str(s or "").strip())


def _summary_for(filename: str, titles: list[str]) -> str:
    """titles: path from plan root title down to this node's title."""
    leaf = titles[-1]
    parent = titles[-2] if len(titles) >= 2 else ""
    section = titles[1] if len(titles) >= 2 else leaf

    if "思維擴展" in leaf or "思维扩展" in leaf:
        return (
            f"本節為「{parent}」的延伸與變形，題意或約束更靈活，常與其他技巧拼裝。\n\n"
            "**練習建議**：先能默寫上級節的核心模板與不變式，再刷本節；卡住時用紙筆畫單調性、邊界與反例。"
        )

    if "相似題目" in leaf or "相似题目" in leaf:
        return (
            f"與「{parent}」同一主線套路，差在資料範圍、問法或細節約束；適合用来強化題型辨識與遷移。\n\n"
            "**做法**：先不要看標籤，試著自己歸納與上級節的相同點，再對照題解補洞。"
        )

    if "選做" in leaf:
        return (
            f"選做題組，難度或抽象程度較高，可依競賽／面試目標決定是否投入。\n\n"
            "**建議**：主線節點穩了再回來；賽後補題時優先寫清暴力上界與性質，再追求最優解。"
        )

    if leaf.endswith("基礎") or leaf.endswith("基础"):
        return (
            f"「{parent}」的入門與模板題：熟悉定義、實作細節與常見邊界（空輸入、長度 1、全相同字元等）。\n\n"
            "**目標**：能在壓力下快速寫對核心流程，並說清時間與空間複雜度。"
        )

    if "LCP" in leaf:
        return (
            "在 Z 函式或後綴結構基礎上，建立「相鄰後綴」或子串之間的最長公共字首陣列，供線性比對與計數使用。\n\n"
            "**提示**：常與字串匹配、重複子串、 border／週期性質一併出現。"
        )

    if "中心擴展" in leaf:
        return (
            "不寫 Manacher 時，可用奇偶中心向外擴展求最長迴文；實作簡單但最壞 $O(n^2)$，適合長度不大或作為對拍。\n\n"
            "**對照**：與同節 Manacher 模板對照，理解「避免重複擴展」的優化點。"
        )

    if "不相交區間" in leaf or "不相交区间" in leaf:
        return (
            "經典區間排程：例如最多個互不重疊區間，常按右端點排序後貪心掃描；變形含最少點覆蓋區間、帶權版本等。\n\n"
            "**關鍵**：證明排序鍵為何不破壞最優性（交換論證或圖示小例子）。"
        )

    if "其他區間貪心" in leaf:
        return (
            "不易單獨歸入「分組／選點／覆蓋」標準模板的區間題，仍多從端點排序與掃描入手。\n\n"
            "**建議**：先列出幾種區間貪心範式，再對照題意選擇或組合。"
        )

    if "迴文串貪心" in leaf or "回文串贪心" in leaf:
        return (
            "在迴文約束下做字典序、最少插入或重排：常需雙指標從兩端向中收斂，並用堆／計數平衡中間奇數字元。\n\n"
            "**注意**：證明每一步貪心不破壞「仍可迴文化」的不變式。"
        )

    if leaf in ("18. 基礎",) or leaf.endswith("18. 基礎"):
        return (
            "字串與陣列上的直覺貪心入門：例如區域性取最值、一次掃描決策，步驟少但需寫清理由。\n\n"
            "**提醒**：先問「答案是否對順序不敏感」——敏感時多半要先排序或定序規則。"
        )

    if "乘積貪心" in leaf:
        return (
            "在乘積或比值目標下排序元素：常化為自定義比較或取對數後轉加法直覺；注意溢出與精度。\n\n"
            "**驗證**：用交換相鄰兩項的不等式檢查排序鍵是否自洽。"
        )

    if "歸納法" in leaf:
        return (
            "從 $n=1,2$ 等小規模猜規律，再用歸納／構造說明一般 $n$；常與構造題、證明最優性一起出現。\n\n"
            "**練習**：寫出「歸納步」如何把 $n-1$ 的解擴成 $n$ 的解。"
        )

    if "其他數學貪心" in leaf:
        return (
            "不等式、整除、同餘或組合直覺的貪心雜項；題目離散度高，需先化簡量再決策。\n\n"
            "**策略**：先找鬆弛上／下界，看能否構造達到該界的演算法。"
        )

    if "從特殊到一般" in leaf:
        return (
            "先構造邊界、對稱或極小案例得到線索，再推廣到一般輸入；適合規律不明顯的構造與貪心。\n\n"
            "**習慣**：把「小例子答案」表格化，找與 $n$、奇偶、模數的關係。"
        )

    if "等價轉換" in leaf:
        return (
            "把原問題變成已知的排序、區間、匹配或圖模型；轉換正確性通常要雙向論證。\n\n"
            "**檢查**：反過來從新模型的任一可行解是否都能映射回原題。"
        )

    if "逆向思維" in leaf and "時光倒流" not in leaf:
        return (
            "從終態或答案反推操作序列、或把刪除改為反向插入；可降低前綴約束的難度。\n\n"
            "**常見**：時間倒流、反向併查集、從右往左掃描。"
        )

    if "時光倒流" in leaf:
        return (
            "離線處理的一種：按時間反轉操作，把「刪除」看成「加入」，便於用併查集、堆等增量結構。\n\n"
            "**關鍵**：確認反轉後的問題與原問題等價且資訊完整。"
        )

    if "分類討論" in leaf:
        return (
            "依奇偶、正負、區間端點、是否取模等分情況討論；每類用簡單貪心或暴力即可。\n\n"
            "**提醒**：分類要「不重不漏」，並在類別邊界手算測試。"
        )

    if "互動題" in leaf:
        return (
            "與評測機互動詢問：需在提問次數限制內推斷隱藏資訊；常結合二分、隨機或圖查詢。\n\n"
            "**習慣**：先算資訊理論下界，再設計逼近該界的策略。"
        )

    if leaf.endswith("其他") or leaf.endswith("其他（選做）"):
        return (
            f"歸在「{section}」底下、不便單獨成類的小題與綜合題，適合查漏與賽後補強。\n\n"
            "**建議**：已掌握同章主線後再掃一眼即可。"
        )

    if "進階" in leaf and "思維" not in leaf:
        return (
            f"「{parent}」的進階題：約束更緊、常與其他章節（堆、單調隊列、數學）拼裝。\n\n"
            "**目標**：在模板之上能獨立完成建模與複雜度權衡。"
        )

    if "專題：跳躍遊戲" in leaf:
        return (
            "以跳躍可達性建模的題群：可視為 BFS／最短路在線段或圖上的變形，亦可能與貪心、單調隊列優化 DP 重疊。\n\n"
            "**入手**：先畫節點為下標、邊為一次跳躍可達的依賴關係。"
        )

    if "分層圖最短路" in leaf:
        return (
            "把「剩餘免費邊數」「顏色狀態」等有限資訊拆成圖層，在分層圖上跑 Dijkstra 0-1 BFS。\n\n"
            "**要點**：層內邊權與跨層邊權定義清楚，狀態數乘原點數須在限制內。"
        )

    if "Bitset" in leaf or "bitset" in leaf.lower():
        return (
            "以位集壓縮 Floyd 中「可達性／距離」的更新，利用字並行加速；適合稠密圖且 $n$ 在千級左右。\n\n"
            "**注意**：常數與語言實作相關，需預留測資餘量。"
        )

    if "模擬費用流" in leaf:
        return (
            "用堆、貪心或最短路反覆增廣，模擬最小費用流的局部決策；適合特殊費用結構而無需寫完整 network simplex。\n\n"
            "**提醒**：論證每步選擇的全局不壞性，避免陷入局部極小。"
        )

    if "輪廓線" in leaf:
        return (
            "狀壓 DP 在網格上的實用寫法：用上一行邊界作為狀態（輪廓），轉移只與相鄰格有關。\n\n"
            "**適用**：寬度小、高度可枚舉的棋盤覆蓋、鋪磚類問題。"
        )

    if "圖 DP" in leaf:
        return (
            "在有向無環圖或樹上進行 DP：狀態常含節點、父邊或簡單子集；注意拓撲序與記憶化。\n\n"
            "**區分**：與最短路、樹形 DP 章節的邊界——是否帶有「路徑計數／選擇」語意。"
        )

    if "博弈 DP" in leaf:
        return (
            "公平組合遊戲的必敗／必勝態：常見 SG 函式、Nim 變形；狀態空間小時可直接 DP。\n\n"
            "**步驟**：列出合法轉移、判斷終止態，再表格式推導。"
        )

    if "機率" in leaf and "期望" in leaf:
        return (
            "以期望線性性、全機率公式或記憶化搜尋計算期望步數／得分；注意狀態是否馬可夫。\n\n"
            "**檢查**：有無環、是否需要高斯消元或浮點精度控制。"
        )

    if "階乘分解" in leaf:
        return (
            "把 $n!$ 質因數分解為各質數的冪次，用於組合計數上下約分、尾端零個數或模意義下的除法。\n\n"
            "**工具**：勒讓德公式數質數 $p$ 在階乘中的指數。"
        )

    if "GCD" in leaf or "最大公約數" in leaf:
        return (
            "輾轉相除與貝祖等式：擴展欧几里得求係數、同餘方程與模逆；常與中國剩餘定理、線性同餘串聯。\n\n"
            "**熟練**：$\\gcd(a,b)=\\gcd(b,a\\bmod b)$ 與解的存在條件。"
        )

    if "生成函式" in leaf or "母函式" in leaf:
        return (
            "把組合計數寫成形式冪級數，用乘法／卷積表達「選或不選」與限制；進階與 FFT／NTT 結合。\n\n"
            "**入門**：先從普通生成函式處理硬幣問題、整數拆分計數。"
        )

    if "整數拆分" in leaf:
        return (
            "把正整數寫成若干正整數之和的計數／最優性質：無序拆分常與背包、生成函式相關。\n\n"
            "**區分**：是否區分順序（組合 vs 合成）。"
        )

    if "多項式" in leaf and "FWT" not in leaf:
        return (
            "多項式乘法、求逆、ln／exp 等可在 $O(n\\log n)$ 完成；用於組合、字串與訊號卷積。\n\n"
            "**基礎**：熟練 NTT 模數與原根選擇。"
        )

    if "FWT" in leaf or "沃爾什" in leaf:
        return (
            "快速沃爾什變換處理 AND／OR／XOR 下的卷積，適合子集與位元計數問題。\n\n"
            "**對照**：與子集卷積、高維前綴和的適用場景比較。"
        )

    if "點、線" in leaf:
        return (
            "向量、叉積與線段相交：判斷順逆時針、多邊形面積、凸包前置；注意整數座標與精度。\n\n"
            "**習慣**：叉積符號與「左側／右側」對應關係畫圖記牢。"
        )

    if leaf.endswith("圓") or leaf == "22. 圓":
        return (
            "圓與圓、圓與線的交點、弧長與扇形面積；可用參數方程或幾何變換化簡。\n\n"
            "**注意**：浮點比較與 $\\pi$ 精度。"
        )

    if "矩形" in leaf or "多邊形" in leaf:
        return (
            "矩形並面積、多邊形裁剪與旋轉卡殼等；常離散化座標後掃描線。\n\n"
            "**基礎**：鞋带公式求多邊形有向面積。"
        )

    if "隨機化技巧" in leaf:
        return (
            "隨機增量、隨機素數檢測、隨機重排降維；用正確率換時間，需估算失敗機率上界。\n\n"
            "**實務**：固定種子便於除錯，提交時再改真隨機。"
        )

    if "Splay" in leaf or "伸展樹" in leaf:
        return (
            "平衡樹的一種，支援分裂、合併與區間反轉；常作為線段樹難以表達的動態序列底層。\n\n"
            "**取捨**：實作量大，賽場上優先確認是否可用 simpler 結構替代。"
        )

    if "根號" in leaf and "演算法" in leaf:
        return (
            "分塊、莫隊、根號分治：以 $O(n\\sqrt n)$ 或 $O((n+q)\\sqrt n)$ 換取較鬆的常數與思維難度。\n\n"
            "**辨識**：離線詢問、區間眾數、可加不可減資訊。"
        )

    if "並查集" in parent or "并查集" in parent:
        if "GCD" in leaf:
            return (
                "在併查集邊上維護 gcd 類資訊或按值合併；查詢時對集合代表元讀聚合結果。\n\n"
                "**關鍵**：合併方向與資訊可結合性。"
            )
        if "區間" in leaf:
            return (
                "以「下一個未覆蓋位置」指標跳躍的併查集，支援區間染色、區間刪除等均攤近似線性操作。\n\n"
                "**典型**：區間連續覆蓋、下一個空位查詢。"
            )
        if "陣列" in leaf or "数组" in leaf:
            return (
                "把陣列下標當節點，依題意在相鄰或特定關係上 merge；常與掃描線、單調性一起出現。\n\n"
                "**注意**：路徑壓縮是否破壞需要額外維護的資訊。"
            )
        return (
            f"「{leaf}」：熟練路徑壓縮與按秩合併，並能與 Kruskal、連通性計數、額外權值維護結合。\n\n"
            "**複習**：判斷環、二分圖（染色）、動態連通性取捨。"
        )

    if "字典樹" in parent and "trie" in parent.lower():
        return (
            f"「{leaf}」：在 trie 上進行統計、xor 最大路徑或與 DP 結合；注意壓縮邊與記憶體。\n\n"
            "**延伸**：可持久化 trie 處理區間查詢。"
        )

    if "佇列" in parent or "队列" in parent:
        if "設計" in leaf:
            return (
                "實作帶有最小／最大查詢、延遲刪除或單調性質的佇列包裝；常見雙堆、懶刪堆。\n\n"
                "**目標**：均攤分析與介面語意（peek vs pop）一致。"
            )
        if "雙端" in leaf:
            return (
                "Deque 支援頭尾 $O(1)$ 插入刪除：滑動視窗最大值、單調隊列的底層容器。\n\n"
                "**對照**：與普通佇列、優先佇列的選型。"
            )

    if "字首和與有序集合" in leaf or "前缀和与有序集合" in leaf:
        return (
            "前綴和配合平衡樹／`sortedcontainers` 思想，查詢「歷史前綴與當前值差」的秩次或前驅；離線亦可 CDQ。\n\n"
            "**典型**：和為 $k$ 的子陣列個數推廣。"
        )

    if "二維字首最小值" in leaf or "二维前缀最小值" in leaf:
        return (
            "二維前綴最小／最大可用稀疏表或枚舉高固定一維後在一維上單調隊列；純前綴和無法 $O(1)$ 維護最值。\n\n"
            "**取捨**：預處理時間、查詢次數與矩形大小的權衡。"
        )

    # trees: linked list subsections
    if "遍歷連結串列" in leaf or "遍历链表" in leaf:
        return (
            "熟練 `while (cur)` 遍歷與虛擬頭節點技巧；邊界包含空表、單節點與斷鏈後是否仍要訪問 `next`。\n\n"
            "**習慣**：先畫三節點再寫指標重連。"
        )

    if "插入節點" in leaf:
        return (
            "在給定位置或排序鏈表中插入：注意先接後斷、與虛擬頭簡化頭插。\n\n"
            "**複雜度**：定位 $O(n)$，插入本身 $O(1)$。"
        )

    if "雙指標" in leaf and "連結串列" in section:
        return (
            "快慢指標以外的同向雙指標：例如找倒數第 $k$ 個、分割鏈表、去重排序鏈表。\n\n"
            "**關鍵**：兩指標步長與停止條件，避免空指標。"
        )

    if "合併連結串列" in leaf or "合并链表" in leaf:
        return (
            "多路歸併可用分治或優先佇列；二路合併類似 merge sort 的合併段，注意空表與結果頭節點。\n\n"
            "**複雜度**：$k$ 條總長 $n$ 用堆為 $O(n\\log k)$。"
        )

    if "分治" in leaf and "連結串列" in section:
        return (
            "鏈表分治：如 merge sort 鏈表、中點切分遞迴；先快慢找中點再斷開，避免遞迴深度過淺。\n\n"
            "**注意**：斷開後要恢復或複製結構以免影響其他題意。"
        )

    if "綜合應用" in leaf and "連結串列" in section:
        return (
            "多技巧組合：反轉區段 + 重連、與樹／圖節點表示結合等；題意敘述通常較長。\n\n"
            "**策略**：拆成子操作，逐段驗證指標不變式。"
        )

    if "連結串列" in section and "其他" in leaf:
        return (
            "鏈表小雜題與會員／冷門題；鞏固指標與邊界後可選做。\n\n"
            "**心態**：與陣列互轉、深拷貝等實作向題目。"
        )

    if "連結串列+二叉樹" in leaf or "链表+二叉树" in leaf:
        return (
            "樹上節點附帶 `next` 指標填補、或與鏈表互相轉換；本質仍是樹上 BFS／前序的改寫。\n\n"
            "**提示**：層序常配合佇列尾接。"
        )

    if "N 叉樹" in leaf or "N 叉树" in leaf:
        return (
            "子節點列表形式的樹：遍歷用迴圈取代左右兒；直徑、編碼等性質與二叉樹類比。\n\n"
            "**實作**：注意子節點數組拷貝與空節點。"
        )

    if "一般樹" in section:
        if "遍歷" in leaf:
            return (
                "從鄰接表做 DFS／BFS；記錄父節點避免回邊。與二叉樹差在分支數不固定。\n\n"
                "**模板**：`for (v : adj[u]) if (v != fa)`。"
            )
        if "自頂向下" in leaf:
            return (
                "帶參數 DFS：深度、路徑集合、前綴異或等從根下傳；注意陣列複製成本改用引用＋回溯。\n\n"
                "**對照**：與二叉樹章同名的節點一併複習。"
            )
        if "自底向上" in leaf:
            return (
                "後序匯總子樹聚合量：大小、高度、黑點數等；合併時檢查長子樹與其它子樹的介面。\n\n"
                "**複雜度**：多叉樹注意單節點子樹總和仍為 $O(n)$。"
            )
        if "有遞有歸" in leaf:
            return (
                "同時需要父傳子資訊與子樹回傳結果：例如路徑長度同時依賴深度與子樹最優。\n\n"
                "**寫法**：函式回傳結構體打包多個量。"
            )
        if "拓撲" in leaf:
            return (
                "樹是有向無環圖的特例：拓撲序即某種 DFS 順序；與依賴關係、樹上前綴結合。\n\n"
                "**注意**：有根樹方向與無根樹討論時邊向一致。"
            )
        if "滑動視窗" in leaf or "滑动窗口" in leaf:
            return (
                "在樹路徑或 DFS 序上維護滑動統計：常先展平成欧拉序或進入離開時間區間。\n\n"
                "**難點**：路徑與子樹查詢對應到序列區間。"
            )
        if "啟發式合併" in leaf or "启发式合并" in leaf:
            return (
                "DSU on tree 或小合併到大：在 DFS 同時維護子樹 multiset，均攤 $O(n\\log^2 n)$ 或更優。\n\n"
                "**關鍵**：只保留重子樹的資料結構，輕子樹暴力插入。"
            )

    if "其他遞迴" in section or "其他递归" in section:
        return (
            "分形、遞迴樹與應用向題目：著重遞迴邊界與數學歸納敘述。\n\n"
            "**建議**：先寫暴力遞迴再考慮記憶化或封閉式。"
        )

    # sliding / grid / monotonic / bitwise short sections
    if filename == "sliding_window.json":
        return (
            f"「{leaf}」：對照本章主節的定長／不定長模板，辨識「最長／最短合法子陣列」與「子陣列個數」兩類寫法的差異。\n\n"
            "**習慣**：右指標擴張、左指標收縮時檢查單調隊列／雜湊計數是否同步更新。"
        )

    if filename == "grid.json":
        if "綜合應用" in leaf:
            return (
                "網格上的建模混合：多源 BFS、最短路權重、狀態壓縮在格點等；先確定狀態維度再選擇 DFS 或 BFS。\n\n"
                "**檢查**：走訪標記與回溯還原是否影響後續測資。"
            )
        return (
            f"「{leaf}」：與網格 DFS 主節搭配，注意邊界、斜向移動與 visited 語意（是否允許重訪）。\n\n"
            "**複雜度**：格點數乘狀態數。"
        )

    if filename == "monotonic_stack.json":
        return (
            f"「{leaf}」：延續單調堆疊「最近更大／更小」框架，思考相等元素與嚴格性的處理。\n\n"
            "**延伸**：常與貢獻法、直方圖面積一併複習。"
        )

    if filename == "bitwise_operations.json":
        return (
            f"「{leaf}」：熟練 AND／OR／XOR 的真值表與吸收律；拆位時注意每位獨立與進位耦合的區別。\n\n"
            "**習慣**：先小範圍枚舉再歸納式子。"
        )

    if filename == "string.json" and leaf == "1. 介紹":
        return (
            "字串算法的總覽與模板索引：從匹配（KMP／Z）、迴文（Manacher）、雜湊到 AC 自動機與後綴結構。\n\n"
            "**路線**：先穩定寫出 KMP 與雙模雜湊，再視題目深度補 Manacher 與自動機。"
        )

    if filename == "string.json" and "字典樹" in leaf:
        return (
            "Trie 前綴樹：插入、前綴查詢、與 xor 最大路徑；為 AC 自動機與可持久化結構打底。\n\n"
            "**實作**：26 叉或壓縮邊、結尾標記與路徑計數。"
        )

    # default
    return (
        f"「{leaf}」：與本章「{section}」主線相關的題目與小結；建議對照題單連結中的講解與範例程式一併閱讀。\n\n"
        "**練習法**：先歸納輸入規模與關鍵操作，再選擇合適資料結構與複雜度上界。"
    )


def _assign_ids(filename: str, node: dict, titles: list[str], patches: dict[int, str]) -> None:
    tlist = titles + [node["title"]]
    nid = int(node["id"])
    if not _nonempty(node.get("summary")):
        summary = OVERRIDES.get((filename, nid))
        if summary is None:
            summary = _summary_for(filename, tlist)
        node["summary"] = summary
        patches[nid] = summary
    for ch in node.get("children") or []:
        _assign_ids(filename, ch, tlist, patches)


def main() -> None:
    for path in sorted(TUTORIAL_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        patches: dict[int, str] = {}
        fname = path.name
        root_title = data["title"]
        for ch in data.get("children") or []:
            _assign_ids(fname, ch, [root_title], patches)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{fname}: filled {len(patches)} section summaries")


if __name__ == "__main__":
    main()
