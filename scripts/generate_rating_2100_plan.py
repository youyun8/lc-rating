#!/usr/bin/env python3
"""
Generate the "Rating 2100 攻略計畫" study plan and tutorial.

This track assumes the learner is already around 1700 rating and needs a
structured path to reach 2100. It collects non-premium problems from the topic
study plans, filters to ratings in [1700, 2100], and organizes them into
progressive rating bands with topic sub-sections.
"""

import copy
import json
import re
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
STUDYPLAN_DIR = REPO_ROOT / "apps" / "web" / "public" / "studyplan"
TUTORIAL_DIR = REPO_ROOT / "apps" / "web" / "public" / "tutorial"
PROBLEMS_JSON = REPO_ROOT / "apps" / "web" / "public" / "problemset" / "problems.json"

TOPIC_PLANS = {
    "binary_search": "二分搜尋",
    "bitwise_operations": "位元運算",
    "data_structure": "資料結構",
    "dynamic_programming": "動態規劃",
    "graph": "圖論演算法",
    "greedy": "貪心",
    "grid": "網格圖",
    "math": "數學",
    "monotonic_stack": "單調堆疊",
    "sliding_window": "滑動視窗",
    "string": "字串",
    "trees": "樹和二元樹",
}

PHASES = [
    {
        "title": "Phase 1：穩住 1700 基本盤（1700-1800）",
        "min": 1700,
        "max": 1800,
        "summary": (
            "用中高難度題校準基本功：題目通常不靠冷門技巧，而是考驗模型轉換、"
            "邊界處理與模板熟練度。建議以 35 分鐘為單題上限，卡住後先寫出狀態、"
            "單調性或不變式，再看提示。"
        ),
    },
    {
        "title": "Phase 2：打穿 1800 題型牆（1800-1900）",
        "min": 1800,
        "max": 1900,
        "summary": (
            "這一段開始需要把兩個技巧拼起來，例如二分加貪心、圖論加 DP、資料結構加離線。"
            "每題做完都要記錄最早可以識別出的關鍵訊號，訓練比賽中的選型速度。"
        ),
    },
    {
        "title": "Phase 3：建立 2000 分解題節奏（1900-2000）",
        "min": 1900,
        "max": 2000,
        "summary": (
            "目標是把 Q3 後段和 Q4 入門題變成可攻克題。練習時要完整寫出複雜度證明，"
            "並用小範圍暴力或手算樣例驗證貪心、DP 轉移與資料結構維護。"
        ),
    },
    {
        "title": "Phase 4：衝刺 2100 穩定輸出（2000-2100）",
        "min": 2000,
        "max": 2100,
        "summary": (
            "最後一段專注於高強度綜合題。建議採用虛擬競賽節奏：先在 20 分鐘內定方向，"
            "再用 40-60 分鐘完成實作；賽後整理錯題時，重點不是背答案，而是提煉可複用的決策規則。"
        ),
    },
]

TOPIC_SUMMARIES = {
    "二分搜尋": "把題目轉成單調判定或有序結構查找；重點訓練 check 函式設計、邊界收斂與二分答案的可行性證明。",
    "位元運算": "掌握按位獨立、XOR 性質、子集枚舉與位元貪心；遇到狀態壓縮時先估狀態數與轉移成本。",
    "資料結構": "選對容器並維護不變式：堆、並查集、樹狀數組、線段樹、Trie 與離線掃描都要能說清操作複雜度。",
    "動態規劃": "從狀態定義開始，拆出最後一步與轉移來源；1900+ 題特別注意前綴優化、單調性與狀態壓縮。",
    "圖論演算法": "把題意建成圖或 DAG，再選 BFS、最短路、拓撲、並查集或樹形 DP；先判斷點邊規模再決定算法。",
    "貪心": "用交換論證、排序鍵或反悔堆支撐決策；如果局部最優說不清，優先回退到 DP 或二分判定。",
    "網格圖": "把座標、方向與狀態維度寫清楚；多源 BFS、0-1 BFS、回溯剪枝和網格 DP 是常見組合。",
    "數學": "訓練同餘、組合計數、因式分解、容斥與規律歸納；先用小範圍暴力找結構，再補嚴謹證明。",
    "單調堆疊": "練習下一個更大/更小、貢獻法、直方圖模型與相等元素處理；索引邊界要用哨兵或明確規則固定。",
    "滑動視窗": "分清固定長度、至多/至少、越長越合法/越短越合法；常與計數、單調隊列和前綴和結合。",
    "字串": "熟悉 KMP、Z、雜湊、Trie 與字串 DP；先明確比較的是前綴、後綴、LCP 還是子串集合。",
    "樹和二元樹": "掌握後序彙總、前序下傳、換根 DP、LCA 與路徑貢獻；無根樹先固定根並定義父子方向。",
}


def load_problems_db():
    with open(PROBLEMS_JSON, "r", encoding="utf-8") as f:
        problems = json.load(f)

    rating_map = {}
    for pid, pdata in problems.items():
        rating = pdata.get("rating")
        if rating is not None:
            rating_map[pid] = rating
        slug = pdata.get("titleSlug", "")
        if slug and rating is not None:
            rating_map[f"slug:{slug}"] = rating
    return rating_map


def strip_prefix(title: str) -> str:
    return re.sub(r"^\d+(?:\.\d+)*\.?\s+", "", title)


def collect_problems_from_plan(plan_path):
    with open(plan_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    problems = []

    def walk(section):
        section_title = strip_prefix(section.get("title", ""))
        for problem in section.get("problems", []):
            problems.append((problem, section_title))
        for child in section.get("children", []):
            walk(child)

    for child in data.get("children", []):
        walk(child)

    return problems


def get_problem_rating(problem, rating_map):
    pid = str(problem.get("id", ""))
    if pid in rating_map:
        return rating_map[pid]

    score = problem.get("score")
    if score is not None:
        return float(score)

    slug = problem.get("slug", "").strip("/")
    return rating_map.get(f"slug:{slug}")


def assign_ids(root):
    next_id = 1

    def visit(node):
        nonlocal next_id
        node["id"] = next_id
        next_id += 1
        for child in node.get("children", []):
            visit(child)

    visit(root)


def mark_leaves(section):
    has_children = bool(section.get("children"))
    section["isLeaf"] = not has_children
    for child in section.get("children", []):
        mark_leaves(child)


def build_tutorial_tree(study_tree):
    tutorial = copy.deepcopy(study_tree)

    def prune(section):
        section.pop("problems", None)
        section.pop("isLeaf", None)
        for child in section.get("children", []):
            prune(child)

    for child in tutorial.get("children", []):
        prune(child)

    return tutorial


def main():
    rating_map = load_problems_db()
    seen = {}

    for plan_key, topic_name in TOPIC_PLANS.items():
        plan_path = STUDYPLAN_DIR / f"{plan_key}.json"
        if not plan_path.exists():
            print(f"Warning: {plan_path} not found, skipping")
            continue

        for problem, section_title in collect_problems_from_plan(plan_path):
            pid = str(problem.get("id", ""))
            slug = problem.get("slug", "").strip("/")
            dedup_key = pid if pid else slug
            if not dedup_key or problem.get("isPremium", False):
                continue

            rating = get_problem_rating(problem, rating_map)
            if rating is None or rating < 1700 or rating > 2100:
                continue

            if dedup_key not in seen:
                seen[dedup_key] = (problem, topic_name, section_title, rating)

    phase_data = {i: {} for i in range(len(PHASES))}
    for problem, topic, section_title, rating in seen.values():
        phase_idx = None
        for idx, phase in enumerate(PHASES):
            if phase["min"] <= rating < phase["max"]:
                phase_idx = idx
                break
        if phase_idx is None and rating == 2100:
            phase_idx = len(PHASES) - 1
        if phase_idx is None:
            continue

        phase_data[phase_idx].setdefault(topic, []).append((problem, section_title, rating))

    children = []
    topic_order = list(TOPIC_PLANS.values())
    for phase_idx, phase in enumerate(PHASES):
        topic_sections = []
        sorted_topics = sorted(
            phase_data[phase_idx].keys(), key=lambda topic: topic_order.index(topic)
        )

        for child_idx, topic_name in enumerate(sorted_topics, 1):
            problems_with_rating = sorted(
                phase_data[phase_idx][topic_name], key=lambda item: item[2]
            )
            problem_list = []
            for problem, section_title, rating in problems_with_rating:
                problem_list.append(
                    {
                        "id": problem.get("id"),
                        "title": problem.get("title", ""),
                        "slug": problem.get("slug", ""),
                        "src": problem.get("src", ""),
                        "solution": problem.get("solution"),
                        "score": problem.get("score") or rating,
                        "subsection": section_title,
                        "isPremium": problem.get("isPremium", False),
                    }
                )

            topic_sections.append(
                {
                    "title": f"{phase_idx + 1}.{child_idx} {topic_name}",
                    "summary": TOPIC_SUMMARIES.get(topic_name, ""),
                    "problems": problem_list,
                    "children": [],
                }
            )

        children.append(
            {
                "title": f"{phase_idx + 1}. {phase['title']}",
                "summary": phase["summary"],
                "children": topic_sections,
            }
        )

    now = datetime.now(timezone.utc).isoformat()
    root = {
        "title": "Rating 2100 攻略計畫",
        "src": "",
        "last_update": now,
        "summary": (
            "這是一條面向已具備約 1700 rating 基礎的進階路線，目標是在 1700-2100 "
            "區間建立穩定解題輸出。題目按 rating 分成四個階段，每個階段再按主題分類，"
            "方便你在保持綜合訓練的同時補強弱項。\n\n"
            "**使用建議：**\n"
            "- 每週選 2-3 個主題交替練習，避免只刷熟悉類型\n"
            "- 1700-1900 題控制在 35-45 分鐘內，1900+ 題控制在 60 分鐘內\n"
            "- 每道錯題記錄三件事：題型訊號、卡住原因、下次可復用的判斷規則\n"
            "- 每完成一個 phase，做 2-3 場 Virtual Contest 檢查是否能在比賽中調用技巧\n"
            "- 已經穩定解出 2000+ 題後，再銜接 Rating 2400 精進計畫"
        ),
        "children": children,
    }
    assign_ids(root)
    for child in root["children"]:
        mark_leaves(child)

    tutorial = build_tutorial_tree(root)

    studyplan_path = STUDYPLAN_DIR / "rating_2100.json"
    tutorial_path = TUTORIAL_DIR / "rating_2100.json"

    with open(studyplan_path, "w", encoding="utf-8") as f:
        json.dump(root, f, ensure_ascii=False, separators=(",", ":"))
    with open(tutorial_path, "w", encoding="utf-8") as f:
        json.dump(tutorial, f, ensure_ascii=False, separators=(",", ":"))

    for phase_idx, phase in enumerate(PHASES):
        total = sum(len(problems) for problems in phase_data[phase_idx].values())
        topics_count = len(phase_data[phase_idx])
        print(f"  {phase['title']}: {total} problems across {topics_count} topics")

    print(f"\nGenerated {studyplan_path}")
    print(f"Generated {tutorial_path}")
    print(f"Total problems: {sum(len(v) for p in phase_data.values() for v in p.values())}")


if __name__ == "__main__":
    main()
