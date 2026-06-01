#!/usr/bin/env python3
"""One-off restructuring for two study plans.

1. String plan (studyplan + tutorial): drop the artificial "1. 介紹" wrapper and
   promote its 10 algorithm topics to top-level chapters 1-10, renumbering every
   descendant title by stripping the redundant leading "1." prefix.

2. Data-structure plan (studyplan + tutorial): fold the stray
   "列舉右，維護左 > 基礎" node back into "列舉右，維護左", restore the missing
   思維擴展 problem 3027, then de-dup + re-sort by rating -- matching the upstream
   huxulm/lc-rating "常用枚舉技巧" section.
"""

import json
import re
from pathlib import Path

WEB_PUBLIC = Path(__file__).resolve().parent.parent / "apps" / "web" / "public"
STUDYPLAN = WEB_PUBLIC / "studyplan"
TUTORIAL = WEB_PUBLIC / "tutorial"
PROBLEMS_JSON = WEB_PUBLIC / "problemset" / "problems.json"

_NUM_PREFIX = re.compile(r"^([\d.]+)\s*(.*)$", re.DOTALL)


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------- #
# Task 1: string plan renumbering
# --------------------------------------------------------------------------- #
def renumber_title(title):
    """"1.2 Z 函式" -> "2. Z 函式";  "1.2.2 LCP 陣列" -> "2.2 LCP 陣列"."""
    m = _NUM_PREFIX.match(title)
    if not m:
        return title
    prefix, name = m.group(1), m.group(2)
    if not prefix.startswith("1."):
        return title
    stripped = prefix[2:]  # drop leading "1."
    sep = " " if "." in stripped else ". "
    return f"{stripped}{sep}{name}"


def renumber_tree(node):
    if "title" in node:
        node["title"] = renumber_title(node["title"])
    for child in node.get("children", []):
        renumber_tree(child)


def restructure_string(path):
    data = load(path)
    intro = data["children"][0]
    assert "介紹" in intro["title"], f"unexpected wrapper: {intro['title']!r}"

    # Preserve the wrapper's overview prose by folding it into the root summary.
    intro_summary = (intro.get("summary") or "").strip()
    if intro_summary:
        root_summary = (data.get("summary") or "").rstrip()
        if intro_summary not in root_summary:
            data["summary"] = (
                f"{root_summary}\n\n{intro_summary}" if root_summary else intro_summary
            )

    promoted = intro["children"]
    for child in promoted:
        renumber_tree(child)
    data["children"] = promoted
    dump(path, data)
    print(f"  {path.name}: promoted {len(promoted)} chapters")


# --------------------------------------------------------------------------- #
# Task 2: data-structure 常用列舉技巧 completion
# --------------------------------------------------------------------------- #
def load_ratings():
    data = json.loads(PROBLEMS_JSON.read_text(encoding="utf-8"))
    return {str(k): v for k, v in data.items()}


def denumber(title):
    return re.sub(r"^[\d.]+\s*", "", title).strip()


def problem_rating(p, ratings):
    score = p.get("score")
    if isinstance(score, (int, float)):
        return score
    info = ratings.get(str(p.get("id")))
    if info and info.get("rating") is not None:
        return info["rating"]
    return None


def dedupe_key(p):
    """Key on the problem identity, tolerating malformed upstream slugs.

    Some upstream entries carry a "/description/" suffix (e.g.
    "number-of-equivalent-domino-pairs-description"); normalise it away and fall
    back to the numeric id so the same problem collapses to one entry.
    """
    pid = str(p.get("id") or "")
    if pid.isdigit():
        return f"id:{pid}"
    slug = (p.get("slug") or "").strip("/").lower()
    slug = re.sub(r"(-description|/description)$", "", slug)
    return slug if slug else f"id:{pid}"


def canonical_score(p):
    score = 0
    pid = p.get("id")
    if isinstance(pid, str):
        if pid.upper().startswith(("LCP", "LCS")) or "面試" in pid:
            score += 4
        else:
            score += 1
    slug = p.get("slug") or ""
    if slug and not (slug.startswith("/") and slug.endswith("/")):
        score += 1
    # Prefer the canonical entry over a "/description"-suffixed duplicate.
    if "description" not in slug:
        score += 2
    return score


def id_natural(pid):
    s = str(pid)
    return (0, int(s)) if s.isdigit() else (1, s)


def merge_problems(problems, ratings):
    by_key = {}
    for p in problems:
        key = dedupe_key(p)
        existing = by_key.get(key)
        if existing is None or canonical_score(p) > canonical_score(existing):
            by_key[key] = p
    merged = list(by_key.values())
    merged.sort(
        key=lambda p: (
            problem_rating(p, ratings) is not None,
            problem_rating(p, ratings) if problem_rating(p, ratings) is not None else 0,
            id_natural(p.get("id")),
            p.get("slug") or "",
        )
    )
    return merged


def make_entry(pid, title, slug, premium=False):
    return {
        "id": pid,
        "title": title,
        "slug": f"/{slug}/",
        "src": f"https://leetcode.cn/problems/{slug}/",
        "solution": None,
        "score": None,
        "isPremium": premium,
    }


# 思維擴展 problem dropped during the earlier merge; restore it.
MISSING = [make_entry("3027", "人員站位的方案數 II", "find-the-number-of-ways-to-place-people-ii")]


def fix_enum_studyplan(path, ratings):
    data = load(path)
    chapter = data["children"][0]
    assert "列舉技巧" in chapter["title"], chapter["title"]

    target = next(c for c in chapter["children"] if denumber(c["title"]) == "列舉右，維護左")
    strays = [c for c in chapter["children"] if denumber(c["title"]) == "列舉右，維護左 > 基礎"]

    pool = list(target.get("problems", []))
    for stray in strays:
        pool += stray.get("problems", [])
    pool += MISSING
    target["problems"] = merge_problems(pool, ratings)

    chapter["children"] = [c for c in chapter["children"] if c not in strays]
    dump(path, data)
    print(
        f"  {path.name}: folded {len(strays)} stray node(s); "
        f"1.1 now has {len(target['problems'])} problems"
    )


def fix_enum_tutorial(path):
    data = load(path)
    chapter = data["children"][0]
    target = next(c for c in chapter["children"] if denumber(c["title"]) == "列舉右，維護左")
    strays = [c for c in chapter["children"] if denumber(c["title"]) == "列舉右，維護左 > 基礎"]

    for stray in strays:
        extra = (stray.get("summary") or "").strip()
        if extra:
            base = (target.get("summary") or "").rstrip()
            if extra not in base:
                target["summary"] = f"{base}\n\n{extra}" if base else extra
    chapter["children"] = [c for c in chapter["children"] if c not in strays]
    dump(path, data)
    print(f"  {path.name}: folded {len(strays)} stray node(s)")


def main():
    print("Task 1: renumber string plan")
    restructure_string(STUDYPLAN / "string.json")
    restructure_string(TUTORIAL / "string.json")

    print("Task 2: complete 常用列舉技巧")
    ratings = load_ratings()
    fix_enum_studyplan(STUDYPLAN / "data_structure.json", ratings)
    fix_enum_tutorial(TUTORIAL / "data_structure.json")


if __name__ == "__main__":
    main()
