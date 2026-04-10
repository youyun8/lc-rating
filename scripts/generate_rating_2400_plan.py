#!/usr/bin/env python3
"""
Generate the "Rating 2400 精進計畫" study plan.

Collects problems from all 12 existing topic-based study plans,
filters to problems with rating <= 2400, and organizes them into
6 progressive rating tiers with topic sub-sections.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
STUDYPLAN_DIR = REPO_ROOT / "apps" / "web" / "public" / "studyplan"
PROBLEMS_JSON = REPO_ROOT / "apps" / "web" / "public" / "problemset" / "problems.json"

# Mapping from study plan filename to Chinese display name
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
        "title": "Phase 1：基礎鞏固（< 1400）",
        "min": 0,
        "max": 1400,
        "summary": (
            "從難度較低的題目開始，建立各主題的基礎概念與解題模式。"
            "這個階段的目標是熟悉常見的演算法模板，培養對問題分類的直覺。"
            "建議每道題目至少獨立思考 15 分鐘再看提示。"
        ),
    },
    {
        "title": "Phase 2：進階突破（1400–1600）",
        "min": 1400,
        "max": 1600,
        "summary": (
            "進入中等難度區間，開始接觸需要組合多種技巧的問題。"
            "這個階段重點在於提升解題速度與準確度，學會辨識題目的核心考點。"
            "建議練習計時解題，模擬競賽節奏。"
        ),
    },
    {
        "title": "Phase 3：能力提升（1600–1800）",
        "min": 1600,
        "max": 1800,
        "summary": (
            "挑戰較高難度的題目，需要更深入的演算法理解與靈活運用。"
            "這個階段的題目通常需要創造性思維或多步驟推導。"
            "建議做完題目後閱讀其他人的解法，學習不同的思路。"
        ),
    },
    {
        "title": "Phase 4：鞏固實力（1800–2000）",
        "min": 1800,
        "max": 2000,
        "summary": (
            "鞏固所有主題的高難度技巧，達到穩定 2000 分的水準。"
            "這些題目接近競賽中 Q3/Q4 的水準，需要紮實的基礎和靈活的思維。"
            "建議每週穩定練習，並定期回顧錯題。"
        ),
    },
    {
        "title": "Phase 5：高手之路（2000–2200）",
        "min": 2000,
        "max": 2200,
        "summary": (
            "進入高手區間，題目往往需要較深的數學推導或巧妙的演算法設計。"
            "這個階段需要對各主題的進階技巧有系統性的掌握，"
            "例如進階 DP 優化、複雜圖論模型、高級資料結構等。"
            "建議嘗試虛擬競賽(Virtual Contest)來檢驗綜合能力。"
        ),
    },
    {
        "title": "Phase 6：衝刺 2400（2200–2400）",
        "min": 2200,
        "max": 2400,
        "summary": (
            "最後衝刺階段，挑戰最高難度的題目。"
            "這些題目需要融會貫通多個主題的知識，靈活組合各種演算法與資料結構。"
            "能穩定解出這個等級的題目，代表你已具備頂尖的演算法能力。"
            "堅持到底，rating 2400 就在眼前！"
        ),
    },
]

TOPIC_SUMMARIES = {
    "二分搜尋": "練習二分查詢的各種變形：二分答案、最小化最大值、最大化最小值、第 K 小等。",
    "位元運算": "掌握 AND/OR/XOR 的性質，練習位元 DP、子集枚舉、位元貪心等技巧。",
    "資料結構": "熟悉堆疊、佇列、堆積、並查集、線段樹等資料結構的應用場景。",
    "動態規劃": "從基礎的線性 DP 到進階的區間 DP、狀態壓縮 DP，系統性地提升 DP 能力。",
    "圖論演算法": "練習 BFS、DFS、最短路、拓撲排序、最小生成樹等圖論經典演算法。",
    "貪心": "培養貪心思維，學會證明貪心策略的正確性，掌握排序貪心、區間貪心等常見模式。",
    "網格圖": "練習網格圖上的 BFS/DFS、動態規劃、回溯等技巧。",
    "數學": "涵蓋數論、組合數學、機率等數學相關演算法題目。",
    "單調堆疊": "掌握單調堆疊的核心思想，練習下一個更大元素、矩形面積等經典問題。",
    "滑動視窗": "練習定長與不定長滑動視窗，掌握雙指標的移動策略。",
    "字串": "練習字串匹配、KMP、Z 函式、字典樹等字串演算法。",
    "樹和二元樹": "練習二元樹遍歷、LCA、樹形 DP、樹上路徑等問題。",
}


def load_problems_db():
    """Load problems.json and build id -> rating mapping."""
    with open(PROBLEMS_JSON, "r", encoding="utf-8") as f:
        problems = json.load(f)
    rating_map = {}
    for pid, pdata in problems.items():
        rating = pdata.get("rating")
        if rating is not None:
            rating_map[pid] = rating
        # Also map by titleSlug for fallback
        slug = pdata.get("titleSlug", "")
        if slug and rating is not None:
            rating_map[f"slug:{slug}"] = rating
    return rating_map


def collect_problems_from_plan(plan_path):
    """Recursively collect all (problem, section_title) pairs from a study plan JSON.

    section_title is the direct parent section title with any leading numeric
    prefix (e.g. "8. ", "2.1 ", "4.1.1 ") stripped for readability.
    """
    with open(plan_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    problems = []  # list of (problem_dict, section_title)

    def strip_prefix(title: str) -> str:
        # Matches "1. ", "10. ", "2.1 ", "4.1.1 ", "1.1.1.1 " etc.
        return re.sub(r"^\d+(?:\.\d+)*\.?\s+", "", title)

    def walk(section):
        section_title = strip_prefix(section.get("title", ""))
        for p in section.get("problems", []):
            problems.append((p, section_title))
        for child in section.get("children", []):
            walk(child)

    for child in data.get("children", []):
        walk(child)

    return problems


def get_problem_rating(problem, rating_map):
    """Get rating for a problem, trying id first, then slug."""
    pid = str(problem.get("id", ""))
    if pid in rating_map:
        return rating_map[pid]

    # Try score field from the study plan itself
    score = problem.get("score")
    if score is not None:
        return float(score)

    # Try slug lookup
    slug = problem.get("slug", "").strip("/")
    slug_key = f"slug:{slug}"
    if slug_key in rating_map:
        return rating_map[slug_key]

    return None


def main():
    rating_map = load_problems_db()

    # Collect all problems from all topic plans, tagged with their topic
    # Use (id or slug) as dedup key to avoid duplicates across plans
    seen = {}  # dedup_key -> (problem_dict, topic_name, section_title, rating)

    for plan_key, topic_name in TOPIC_PLANS.items():
        plan_path = STUDYPLAN_DIR / f"{plan_key}.json"
        if not plan_path.exists():
            print(f"Warning: {plan_path} not found, skipping")
            continue

        problems = collect_problems_from_plan(plan_path)
        for p, section_title in problems:
            pid = str(p.get("id", ""))
            slug = p.get("slug", "").strip("/")
            dedup_key = pid if pid else slug

            if not dedup_key:
                continue

            rating = get_problem_rating(p, rating_map)
            if rating is None:
                continue
            if rating > 2400:
                continue
            if p.get("isPremium", False):
                continue

            # If we've seen this problem, keep the first topic association
            if dedup_key not in seen:
                seen[dedup_key] = (p, topic_name, section_title, rating)

    print(f"Total problems with rating <= 2400 (non-premium): {len(seen)}")

    # Organize into phases and topics
    phase_data = {i: {} for i in range(len(PHASES))}

    for dedup_key, (problem, topic, section_title, rating) in seen.items():
        # Determine phase
        phase_idx = None
        for i, phase in enumerate(PHASES):
            if phase["min"] <= rating < phase["max"]:
                phase_idx = i
                break
        # rating == 2400 exactly goes into the last phase
        if phase_idx is None and rating == 2400:
            phase_idx = len(PHASES) - 1

        if phase_idx is None:
            continue

        if topic not in phase_data[phase_idx]:
            phase_data[phase_idx][topic] = []
        phase_data[phase_idx][topic].append((problem, section_title, rating))

    # Build the JSON structure
    children = []
    for phase_idx, phase_info in enumerate(PHASES):
        topic_sections = []
        topics = phase_data[phase_idx]

        # Sort topics by the order in TOPIC_PLANS
        topic_order = list(TOPIC_PLANS.values())
        sorted_topics = sorted(topics.keys(), key=lambda t: topic_order.index(t))

        for child_idx, topic_name in enumerate(sorted_topics, 1):
            problems_with_rating = topics[topic_name]
            # Sort problems by rating ascending
            problems_with_rating.sort(key=lambda x: x[2])

            problem_list = []
            for p, section_title, _rating in problems_with_rating:
                problem_list.append({
                    "id": p.get("id"),
                    "title": p.get("title", ""),
                    "slug": p.get("slug", ""),
                    "src": p.get("src", ""),
                    "solution": p.get("solution"),
                    "score": p.get("score"),
                    "subsection": section_title,
                    "isPremium": p.get("isPremium", False),
                })

            # Prefix with "N.M " so sectionAnchor generates a unique "s-N-M" anchor
            topic_section = {
                "title": f"{phase_idx + 1}.{child_idx} {topic_name}",
                "summary": TOPIC_SUMMARIES.get(topic_name, ""),
                "problems": problem_list,
                "children": [],
                "isLeaf": True,
            }
            topic_sections.append(topic_section)

        # Prefix with "N. " so sectionAnchor generates a unique "s-N" anchor
        phase_section = {
            "title": f"{phase_idx + 1}. {phase_info['title']}",
            "summary": phase_info["summary"],
            "children": topic_sections,
        }
        children.append(phase_section)

    # Print stats
    for phase_idx, phase_info in enumerate(PHASES):
        total = sum(len(v) for v in phase_data[phase_idx].values())
        topics_count = len(phase_data[phase_idx])
        print(f"  {phase_info['title']}: {total} problems across {topics_count} topics")

    result = {
        "title": "Rating 2400 精進計畫",
        "src": "",
        "last_update": datetime.now(timezone.utc).isoformat(),
        "summary": (
            "本計畫從 12 個主題題單中精選 rating ≤ 2400 的題目，"
            "按難度分為六個階段，每個階段再按主題分類。\n\n"
            "**使用建議：**\n"
            "- 從 Phase 1 開始，按順序完成每個階段\n"
            "- 每個階段內可以選擇自己較弱的主題優先練習\n"
            "- 每道題目建議獨立思考後再參考題解\n"
            "- 搭配週賽練習，檢驗學習成果\n"
            "- Phase 5、6 的題目難度較高，建議已穩定 2000 分後再挑戰"
        ),
        "children": children,
    }

    output_path = STUDYPLAN_DIR / "rating_2400.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

    total_problems = sum(
        len(v) for phase_topics in phase_data.values() for v in phase_topics.values()
    )
    print(f"\nGenerated {output_path}")
    print(f"Total problems: {total_problems}")


if __name__ == "__main__":
    main()
