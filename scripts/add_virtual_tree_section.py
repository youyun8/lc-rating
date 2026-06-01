#!/usr/bin/env python3
"""Add the 虛樹 (virtual tree) subsection to the trees plan, per upstream.

Upstream (huxulm/lc-rating) lists §3.9 虛樹 immediately after §3.8 LCA in the
一般樹 chapter. Locally that slot is taken, so we insert 虛樹 right after LCA and
shift the trailing subsections (樹上滑動視窗/啟發式合併/點分治/其他) up by one.
Problem 3786, previously filed under 其他, is moved into the new 虛樹 section.
Studyplan and tutorial share section ids, so both trees are edited in lockstep.
"""

import json
import re
from pathlib import Path

PUB = Path(__file__).resolve().parent.parent / "apps" / "web" / "public"

NEW_ID = 55                       # next free id (current max is 54)
AFTER_ID = 39                     # 3.8 最近公共祖先（LCA）、倍增演算法
OTHER_ID = 43                     # 3.12 其他 (holds 3786 before the move)
SHIFT_IDS = [40, 41, 42, 43]      # subsections renumbered +1
VT_PID = 3786

VT_SUMMARY = (
    "**虛樹（virtual tree / 輔助樹）**：給定樹上 k 個關鍵點，只保留這些點與它們"
    "兩兩的 LCA，壓縮成一棵節點數 $O(k)$ 的樹，邊代表原樹上的一段路徑。適用於"
    "「多次詢問、每次給一批關鍵點，在這些點構成的子結構上做樹形 DP」的題，"
    "把每次的複雜度從 $O(n)$ 降到 $O(k\\log n)$。\n\n"
    "**建法**：關鍵點按 DFS 序（dfn）排序，用單調棧依序加入，相鄰點以 LCA 連邊。\n\n"
    "**C++ 模板（建虛樹，需先有 dfn[] 與 lca()）**：\n\n"
    "```cpp\n"
    "// key：關鍵點；建出虛樹鄰接表 g（邊權/原樹資訊另存）\n"
    "sort(key.begin(), key.end(), [](int a, int b) { return dfn[a] < dfn[b]; });\n"
    "vector<int> stk = {key[0]};\n"
    "auto addEdge = [&](int u, int v) { g[u].push_back(v); };\n"
    "for (int i = 1; i < (int)key.size(); i++) {\n"
    "    int u = key[i], l = lca(stk.back(), u);\n"
    "    while (stk.size() >= 2 && dfn[stk[stk.size() - 2]] >= dfn[l]) {\n"
    "        addEdge(stk[stk.size() - 2], stk.back());\n"
    "        stk.pop_back();\n"
    "    }\n"
    "    if (stk.back() != l) {        // l 為新的分叉點\n"
    "        addEdge(l, stk.back());\n"
    "        stk.back() = l;\n"
    "    }\n"
    "    stk.push_back(u);\n"
    "}\n"
    "for (int i = 0; i + 1 < (int)stk.size(); i++) {\n"
    "    addEdge(stk[i], stk[i + 1]);\n"
    "}\n"
    "```\n\n"
    "**代表例題**：3786. 樹組的互動代價總和（rating 2139）——多組關鍵點查詢，"
    "對每組點建虛樹後，在 $O(k)$ 規模的壓縮樹上統計貢獻。"
)


def bump_title(title):
    m = re.match(r"^3\.(\d+)\s+(.*)$", title)
    return f"3.{int(m.group(1)) + 1} {m.group(2)}" if m else title


def general_tree_chapter(root):
    return next(c for c in root["children"] if c.get("title") == "3. 一般樹")


def insert_after(children, after_id, node):
    idx = next(i for i, c in enumerate(children) if c.get("id") == after_id)
    children.insert(idx + 1, node)


def edit_studyplan(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    chapter = general_tree_chapter(data)
    kids = chapter["children"]

    # pull 3786 out of 其他
    other = next(c for c in kids if c.get("id") == OTHER_ID)
    moved = next(p for p in other["problems"] if p.get("id") == VT_PID)
    other["problems"] = [p for p in other["problems"] if p.get("id") != VT_PID]

    for c in kids:
        if c.get("id") in SHIFT_IDS:
            c["title"] = bump_title(c["title"])

    node = {"id": NEW_ID, "title": "3.9 虛樹", "isLeaf": False,
            "problems": [moved], "children": []}
    insert_after(kids, AFTER_ID, node)

    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path.name}: inserted 3.9 虛樹 (id {NEW_ID}) with problem {VT_PID}")


def edit_tutorial(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    chapter = general_tree_chapter(data)
    kids = chapter["children"]

    for c in kids:
        if c.get("id") in SHIFT_IDS:
            c["title"] = bump_title(c["title"])

    node = {"id": NEW_ID, "title": "3.9 虛樹", "children": [], "summary": VT_SUMMARY}
    insert_after(kids, AFTER_ID, node)

    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{path.name}: inserted 3.9 虛樹 (id {NEW_ID})")


def main():
    edit_studyplan(PUB / "studyplan" / "trees.json")
    edit_tutorial(PUB / "tutorial" / "trees.json")


if __name__ == "__main__":
    main()
