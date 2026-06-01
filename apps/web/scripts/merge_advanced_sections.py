#!/usr/bin/env python3
"""Merge 思維擴展 / 進階 extension subsections into their main sections.

For every node whose title contains "思維擴展" or the breadcrumb " > 進階",
fold it back into its main section in both the 題單 (public/studyplan) and the
parallel 講義 (public/tutorial) trees, which share numeric ``id`` values:

* studyplan: the node's ``problems`` are appended to the target section, then the
  combined list is de-duplicated by slug and sorted by rating (inline ``score``
  if present, otherwise the rating from public/problemset/problems.json, with
  unrated problems first -- matching the frontend ProblemList sort).
* tutorial: the node's ``summary`` markdown is appended onto the target's
  ``summary`` (blank-line separated).
* the node itself is removed from its parent's ``children``.

Merge target:
* nodes with a parent section  -> the immediate parent.
* top-level nodes (parent is the document root) -> the sibling top-level section
  named by the breadcrumb prefix; if that sibling's title ends in " > 基礎" it is
  tidied to drop the breadcrumb (it now holds both 基礎 and 進階).

The script is idempotent and re-runnable: the JSONs are synced from upstream via
lc-maker/merge_upstream_to_local.py, so a future upstream sync may reintroduce
these subsections -- just run this again.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

WEB_ROOT = Path(__file__).resolve().parent.parent
STUDYPLAN_DIR = WEB_ROOT / "public" / "studyplan"
TUTORIAL_DIR = WEB_ROOT / "public" / "tutorial"
PROBLEMS_JSON = WEB_ROOT / "public" / "problemset" / "problems.json"

_NUM_PREFIX = re.compile(r"^[\d.]+\s*")


def is_mergeable(title: str) -> bool:
    return "思維擴展" in title or " > 進階" in title


def denumber(title: str) -> str:
    return _NUM_PREFIX.sub("", title).strip()


def leading_number(title: str) -> str:
    m = _NUM_PREFIX.match(title)
    return m.group(0).strip().rstrip(".") if m else ""


def load_rating_map() -> dict:
    data = json.loads(PROBLEMS_JSON.read_text(encoding="utf-8"))
    return {str(k): v for k, v in data.items()}


def problem_rating(p: dict, ratings: dict):
    score = p.get("score")
    if isinstance(score, (int, float)):
        return score
    pid = p.get("id")
    if pid is not None:
        info = ratings.get(str(pid))
        if info and info.get("rating") is not None:
            return info["rating"]
    return None


def dedupe_key(p: dict) -> str:
    slug = (p.get("slug") or "").strip("/").lower()
    return slug if slug else f"id:{p.get('id')}"


def canonical_score(p: dict) -> int:
    score = 0
    pid = p.get("id")
    if isinstance(pid, str):
        upper = pid.upper()
        if upper.startswith("LCP") or upper.startswith("LCS") or "面試" in pid:
            score += 4
        else:
            score += 1
    slug = p.get("slug") or ""
    if slug and not (slug.startswith("/") and slug.endswith("/")):
        score += 1
    return score


def id_natural(pid):
    s = str(pid)
    return (0, int(s)) if s.isdigit() else (1, s)


def merge_problems(problems: list, ratings: dict) -> list:
    by_key: dict[str, dict] = {}
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


def iter_nodes(root: dict):
    """Yield (node, parent, depth); parent is the document root for top-level."""

    def walk(node, parent, depth):
        for child in node.get("children", []):
            yield child, node, depth
            yield from walk(child, child, depth + 1)

    yield from walk(root, root, 0)


def find_by_id(root: dict, target_id) -> dict | None:
    for node, _, _ in iter_nodes(root):
        if node.get("id") == target_id:
            return node
    return None


def remove_child(root: dict, child_id) -> None:
    for node, _, _ in iter_nodes(root):
        children = node.get("children")
        if children:
            node["children"] = [c for c in children if c.get("id") != child_id]
    root["children"] = [c for c in root.get("children", []) if c.get("id") != child_id]


def resolve_target(node: dict, parent: dict, root: dict) -> tuple[dict | None, bool]:
    """Return (target_node, tidy_basis) for a mergeable node."""
    if parent is not root:
        return parent, False

    # Top-level node: match a sibling by the breadcrumb prefix.
    prefix = denumber(node["title"]).split(" > 進階")[0].strip()
    plain = None
    basis = None
    for sib in root.get("children", []):
        if sib is node:
            continue
        sib_name = denumber(sib["title"])
        if sib_name == prefix:
            plain = sib
        elif sib_name == f"{prefix} > 基礎":
            basis = sib
    target = basis or plain
    return target, target is basis


def append_summary(target: dict, node: dict) -> None:
    extra = (node.get("summary") or "").strip()
    if not extra:
        return
    base = (target.get("summary") or "").rstrip()
    target["summary"] = f"{base}\n\n{extra}" if base else extra


def tidy_title(node: dict) -> None:
    """Drop a trailing ' > 基礎' breadcrumb once the section holds 基礎+進階."""
    name = denumber(node["title"])
    if name.endswith(" > 基礎"):
        num = leading_number(node["title"])
        new_name = name[: -len(" > 基礎")].strip()
        node["title"] = f"{num}. {new_name}" if num else new_name


def process_pair(name: str, ratings: dict) -> list[str]:
    sp_path = STUDYPLAN_DIR / f"{name}.json"
    tut_path = TUTORIAL_DIR / f"{name}.json"
    sp = json.loads(sp_path.read_text(encoding="utf-8"))
    tut = json.loads(tut_path.read_text(encoding="utf-8"))

    # Collect mergeable nodes from the studyplan, deepest-first.
    actions = []
    for node, parent, depth in iter_nodes(sp):
        if is_mergeable(node["title"]):
            actions.append((depth, node, parent))
    actions.sort(key=lambda a: a[0], reverse=True)
    if not actions:
        return []

    log: list[str] = []
    for _depth, node, parent in actions:
        node_id = node["id"]
        target, tidy = resolve_target(node, parent, sp)
        if target is None:
            log.append(f"  ! SKIP id={node_id} {node['title']!r} (no merge target)")
            continue

        # studyplan: move + dedupe + sort problems.
        moved = node.get("problems", [])
        target["problems"] = merge_problems(
            target.get("problems", []) + moved, ratings
        )
        remove_child(sp, node_id)

        # tutorial: append summary, remove node.
        tut_target = find_by_id(tut, target["id"])
        tut_node = find_by_id(tut, node_id)
        if tut_target is not None and tut_node is not None:
            append_summary(tut_target, tut_node)
        if tut_node is not None:
            remove_child(tut, node_id)

        if tidy:
            tidy_title(target)
            if tut_target is not None:
                tidy_title(tut_target)

        log.append(
            f"  - id={node_id} {node['title']!r} "
            f"-> id={target['id']} {target['title']!r} "
            f"(+{len(moved)} probs)"
        )

    sp_path.write_text(
        json.dumps(sp, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    tut_path.write_text(
        json.dumps(tut, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return log


def main() -> None:
    ratings = load_rating_map()
    names = sorted(p.stem for p in STUDYPLAN_DIR.glob("*.json"))
    for name in names:
        log = process_pair(name, ratings)
        if log:
            print(f"{name}.json")
            print("\n".join(log))


if __name__ == "__main__":
    main()
