#!/usr/bin/env python3
"""Highlight representative (rating >= 1700) upstream problems in the 講義.

The lecture already auto-lists practice problems from the matching studyplan
section; this adds a short inline "代表例題" note (matching the existing
"模板題為 X" convention) to the relevant tutorial subsection summary so the
strongest, technique-defining example is called out in the prose.
Idempotent: a note is skipped if that subsection already mentions "代表例題".
"""

import json
from pathlib import Path

TUTORIAL = Path(__file__).resolve().parent.parent / "apps" / "web" / "public" / "tutorial"

# plan -> { subsection title -> 代表例題 note appended to its summary }
NOTES = {
    "trees": {
        "1.6 快慢指標":
            "**代表例題**：1015. 可被 K 整除的最小整數（rating 1875）——餘數狀態至多 K 種，"
            "連續對 K 取餘必然成環（與快慢指標判環同源），K 步內未回到餘數 0 即無解。",
        "3.2 自頂向下 DFS":
            "**代表例題**：3820. 樹上的勾股距離節點（rating 1725）——自頂向下沿根到節點下傳"
            "距離資訊，邊遞迴邊判定符合條件的節點。",
        "3.3 自底向上 DFS":
            "**代表例題**：3812. 翻轉樹上最少邊（rating 2179）——後序回傳各子樹的狀態，"
            "在歸途上自底向上累計最少翻轉邊數。",
        "3.8 最近公共祖先（LCA）、倍增演算法":
            "**代表例題**：2836. 在傳球遊戲中最大化函式值（rating 2769）——函式圖（每點一條出邊）"
            "上跳 $k$ 步，以倍增預處理第 $2^j$ 個後繼與路徑和，$O(n\\log k)$ 求解；"
            "3534. 針對圖的路徑存在性查詢 II（rating 2507）亦為倍增／LCA 的代表應用。",
        "4.7 搜尋":
            "**代表例題**：1240. 鋪瓷磚（rating 2242）——回溯搜尋＋剪枝，每次在最上左的空格"
            "嘗試放入邊長遞減的正方形；756. 金字塔轉換矩陣（rating 1990）為狀態搜尋的另一代表。",
        "4.8 折半列舉":
            "**代表例題**：3801. 合併有序列表的最小成本（rating 2399）——將清單分成兩半各自"
            "列舉合併方案，再配對兩側結果，把指數級搜尋降為 $O(2^{n/2})$。",
    },
    "data_structure": {
        "6.2 進階":
            "**代表例題**：2542. 最大子序列的分數（rating 2056）——按乘數降序排序後枚舉，"
            "用大小為 k 的最小堆維護另一維的前 k 大之和，邊掃邊更新答案。",
    },
}


def find(node, title):
    if node.get("title") == title:
        return node
    for c in node.get("children", []):
        r = find(c, title)
        if r:
            return r
    return None


def main():
    for plan, notes in NOTES.items():
        path = TUTORIAL / f"{plan}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        touched = 0
        for title, note in notes.items():
            node = find(data, title)
            assert node is not None, f"{plan}: subsection {title!r} not found"
            summary = node.get("summary") or ""
            if "代表例題" in summary:
                continue
            node["summary"] = f"{summary.rstrip()}\n\n{note}" if summary.strip() else note
            touched += 1
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{plan}.json: annotated {touched} subsection(s)")


if __name__ == "__main__":
    main()
