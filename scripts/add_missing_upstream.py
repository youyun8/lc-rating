#!/usr/bin/env python3
"""Add upstream (huxulm/lc-rating) problems missing from the local study plans.

Each problem is placed into the closest existing subsection (our structure has
diverged from upstream: 思維擴展 folded into mains, some sections renamed). New
entries reuse the canonical Traditional-Chinese title already present in another
plan, falling back to the same OpenCC ``s2twp`` conversion the build uses. After
insertion each target subsection is de-duped by problem identity and re-sorted by
rating, matching the frontend ProblemList order.
"""

import json
import re
from pathlib import Path

from opencc import OpenCC

WEB_PUBLIC = Path(__file__).resolve().parent.parent / "apps" / "web" / "public"
STUDYPLAN = WEB_PUBLIC / "studyplan"
PROBLEMS_JSON = WEB_PUBLIC / "problemset" / "problems.json"

_cc = OpenCC("s2twp")
_POST = {"爲": "為", "峯": "峰"}

# plan -> { target leaf title (current numbering) -> [slugs in upstream order] }
ADDITIONS = {
    "string": {
        "4.1 基礎": ["find-substring-with-given-hash-value",
                    "concatenate-non-zero-digits-and-multiply-by-sum-ii"],
        "7.1 基礎": ["convert-number-words-to-digits"],
        "8.1 基礎": ["pattern-matching-lcci", "number-of-distinct-substrings-in-a-string"],
    },
    "data_structure": {
        "6.2 進階": ["maximum-subsequence-scores"],
        "9.1 樹狀陣列": ["queries-on-a-permutation"],
    },
    "dynamic_programming": {
        "12.5 其他樹形 DP": ["er-cha-shu-deng-shi"],
    },
    "trees": {
        "1.6 快慢指標": ["find-the-duplicate-number", "smallest-integer-divisible-by-k",
                      "smallest-all-ones-multiple"],
        "2.13 二叉樹 BFS": ["median-of-a-binary-search-tree-level"],
        "3.2 自頂向下 DFS": ["pythagorean-distance-nodes-in-a-tree"],
        "3.3 自底向上 DFS": ["minimum-edge-toggles-on-a-tree"],
        "3.5 樹的直徑": ["find-diameter-endpoints-of-a-tree"],
        "3.6 樹的拓撲排序": ["minimum-edge-toggles-on-a-tree"],  # also an upstream example here
        "3.8 最近公共祖先（LCA）、倍增演算法": [
            "path-existence-queries-in-a-graph-ii",
            "maximize-value-of-function-in-a-ball-passing-game",
            "maximize-the-distance-between-points-on-a-square",
        ],
        "3.12 其他": ["total-sum-of-interaction-cost-in-tree-groups"],  # upstream: 虛樹 (no local section)
        "4.2 子集型回溯": ["combination-sum"],
        "4.5 排列型回溯": ["word-squares-ii"],
        "4.7 搜尋": ["pyramid-transition-matrix", "tiling-a-rectangle-with-the-fewest-squares",
                   "24-game", "expression-add-operators"],
        "4.8 折半列舉": ["minimum-cost-to-merge-sorted-lists"],
        "5.1 應用題": ["kth-largest-element-in-an-array"],
    },
}

# plans whose stored slug is wrapped in slashes
SLASHED = {"string", "trees"}


def convert(text):
    out = _cc.convert(text)
    for a, b in _POST.items():
        out = out.replace(a, b)
    return out


def norm(slug):
    s = (slug or "").strip().strip("/").lower()
    return re.sub(r"(-description|/description)$", "", s)


def load_title_map():
    """slug -> canonical TC title, harvested from every existing plan."""
    out = {}
    for path in STUDYPLAN.glob("*.json"):
        d = json.loads(path.read_text(encoding="utf-8"))

        def walk(n):
            for p in n.get("problems", []):
                k = norm(p.get("slug"))
                if k and k not in out:
                    out[k] = p["title"]
            for c in n.get("children", []):
                walk(c)

        walk(d)
    return out


def load_raw_rows():
    """slug -> (id, raw_title, slug, premium) from every *_raw.txt snapshot."""
    rows = {}
    for path in (Path(__file__).resolve().parent / "data").glob("*_raw.txt"):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line.startswith("PROBLEM|"):
                continue
            parts = line.split("|")
            if len(parts) != 7:
                continue
            _, _sec, pid, title, slug, _score, prem = parts
            # snapshots disagree on wrapping slashes; store the bare slug
            rows[norm(slug)] = (pid.strip(), title.strip(), slug.strip().strip("/"),
                                prem.strip().lower() == "true")
    return rows


def load_ratings():
    data = json.loads(PROBLEMS_JSON.read_text(encoding="utf-8"))
    return {str(k): v for k, v in data.items()}


def problem_rating(p, ratings):
    score = p.get("score")
    if isinstance(score, (int, float)):
        return score
    info = ratings.get(str(p.get("id")))
    if info and info.get("rating") is not None:
        return info["rating"]
    return None


def dedupe_key(p):
    pid = str(p.get("id") or "")
    if pid.isdigit():
        return f"id:{pid}"
    slug = norm(p.get("slug"))
    return slug or f"id:{pid}"


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


def find_leaf(node, title):
    if node.get("title") == title:
        return node
    for c in node.get("children", []):
        r = find_leaf(c, title)
        if r:
            return r
    return None


def make_entry(pid, slug, premium, title, slashed):
    slug = slug.strip("/")  # raw snapshots are inconsistent about wrapping slashes
    return {
        "id": pid,
        "title": title,
        "slug": f"/{slug}/" if slashed else slug,
        "src": f"https://leetcode.cn/problems/{slug}/",
        "solution": None,
        "score": None,
        "isPremium": premium,
    }


def collect_ids(node, out):
    for p in node.get("problems", []):
        out.add(str(p.get("id")))
    for c in node.get("children", []):
        collect_ids(c, out)


def main():
    title_map = load_title_map()
    raw = load_raw_rows()
    ratings = load_ratings()

    for plan, targets in ADDITIONS.items():
        path = STUDYPLAN / f"{plan}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        slashed = plan in SLASHED
        # Snapshot pre-existing ids: some raw slugs differ from the canonical slug
        # already in the plan (e.g. LCP 64 -> U7WvvU), so dedup by id, not slug.
        existing = set()
        collect_ids(data, existing)
        added, skipped = 0, []
        for leaf_title, slugs in targets.items():
            leaf = find_leaf(data, leaf_title)
            assert leaf is not None, f"{plan}: leaf {leaf_title!r} not found"
            leaf.setdefault("problems", [])
            changed = False
            for slug in slugs:
                key = norm(slug)
                pid, raw_title, real_slug, premium = raw[key]
                if pid in existing:
                    skipped.append(pid)
                    continue
                title = title_map.get(key) or convert(raw_title)
                leaf["problems"].append(make_entry(pid, real_slug, premium, title, slashed))
                added += 1
                changed = True
            if changed:
                leaf["problems"] = merge_problems(leaf["problems"], ratings)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        msg = f"{plan}.json: +{added} problem entries"
        if skipped:
            msg += f" (skipped already-present: {', '.join(sorted(set(skipped)))})"
        print(msg)


if __name__ == "__main__":
    main()
