#!/usr/bin/env python3
"""Merge new upstream study plan problems and grouping summaries into local plans.

This script handles the structural mismatch between upstream (Simplified Chinese,
nested hierarchy with Chinese numerals like "一、二分查找" > "§1.1 基础") and local
(Traditional Chinese, flat numbered structure like "1. 基礎", "2. 進階").

Strategy:
  1. Normalize problem IDs (int/str, SC/TC) for comparison.
  2. For each new upstream problem, find its section, then find the best-matching
     local section by maximizing problem ID overlap.
  3. Translate new problem fields from SC to TC.
  4. Prepend upstream grouping section summaries (stripped of python code blocks)
     to the first matching child local section.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Reuse translate_to_traditional.py's translation logic
# ---------------------------------------------------------------------------
sys.path.insert(0, str(Path(__file__).parent))
from translate_to_traditional import translate_text, translate_dict


# ---------------------------------------------------------------------------
# ID normalisation
# ---------------------------------------------------------------------------

_tc2sc_converter = None


def _get_tc2sc():
    global _tc2sc_converter
    if _tc2sc_converter is None:
        try:
            import opencc
            _tc2sc_converter = opencc.OpenCC("t2s")
        except ImportError:
            pass
    return _tc2sc_converter


def normalize_id(pid):
    """Normalise a problem ID so that int/str and SC/TC variants match.

    Converts to Simplified Chinese for uniform comparison.
    """
    if isinstance(pid, int):
        return str(pid)
    s = str(pid)
    # If the ID contains any CJK characters, convert TC→SC for normalisation
    if any("\u4e00" <= c <= "\u9fff" for c in s):
        conv = _get_tc2sc()
        if conv:
            s = conv.convert(s)
        else:
            s = s.replace("面試題", "面试题")
            s = s.replace("棋盤", "棋盘")
    return s


def collect_problem_ids(node):
    """Return a set of *normalised* problem IDs in the tree rooted at node."""
    ids = set()
    if isinstance(node, dict):
        for p in node.get("problems", []):
            pid = p.get("id") or p.get("slug")
            if pid is not None:
                ids.add(normalize_id(pid))
        for child in node.get("children", []):
            ids.update(collect_problem_ids(child))
    elif isinstance(node, list):
        for item in node:
            ids.update(collect_problem_ids(item))
    return ids


# ---------------------------------------------------------------------------
# Section helpers
# ---------------------------------------------------------------------------

def collect_leaf_sections(node, out=None):
    """Collect all sections that directly contain problems (leaf sections)."""
    if out is None:
        out = []
    if isinstance(node, dict):
        if node.get("problems"):
            out.append(node)
        for child in node.get("children", []):
            collect_leaf_sections(child, out)
    elif isinstance(node, list):
        for item in node:
            collect_leaf_sections(item, out)
    return out


def section_ids(section):
    """Return set of normalised IDs for problems directly in this section."""
    return {normalize_id(p.get("id") or p.get("slug"))
            for p in section.get("problems", [])}


def find_best_local_section(upstream_section, local_sections):
    """Find the local section with the most problem ID overlap."""
    up_ids = section_ids(upstream_section)
    if not up_ids:
        return None

    best_section = None
    best_overlap = 0
    for local_sec in local_sections:
        overlap = len(up_ids & section_ids(local_sec))
        if overlap > best_overlap:
            best_overlap = overlap
            best_section = local_sec
    return best_section


def _build_parent_map(node, parent=None, pmap=None):
    """Build a dict mapping node id -> parent node."""
    if pmap is None:
        pmap = {}
    if isinstance(node, dict):
        pmap[id(node)] = parent
        for child in node.get("children", []):
            _build_parent_map(child, node, pmap)
    elif isinstance(node, list):
        for item in node:
            _build_parent_map(item, parent, pmap)
    return pmap


def find_sibling_target(upstream_section, upstream_root, local_sections):
    """Fallback: find local target via sibling sections that DO have overlap."""
    parent_map = _build_parent_map(upstream_root)
    parent = parent_map.get(id(upstream_section))
    if parent is None:
        return None
    for sibling in parent.get("children", []):
        if id(sibling) == id(upstream_section):
            continue
        target = find_best_local_section(sibling, local_sections)
        if target is not None:
            return target
    return None


# ---------------------------------------------------------------------------
# Step 1: Merge new problems
# ---------------------------------------------------------------------------

def merge_new_problems(local_root, upstream_root):
    """Merge problems from upstream not present in local.

    Returns the number of problems added.
    """
    local_ids = collect_problem_ids(local_root)
    local_sections = collect_leaf_sections(local_root)

    added = 0

    def walk(upstream_node):
        nonlocal added
        if isinstance(upstream_node, dict):
            problems = upstream_node.get("problems", [])
            new_problems = [
                p for p in problems
                if normalize_id(p.get("id") or p.get("slug")) not in local_ids
            ]
            if new_problems:
                target = find_best_local_section(upstream_node, local_sections)
                if target is None:
                    # Fallback: find via sibling sections
                    target = find_sibling_target(
                        upstream_node, upstream_root, local_sections
                    )
                if target is not None:
                    for p in new_problems:
                        translated = translate_dict(p)
                        target.setdefault("problems", []).append(translated)
                        local_ids.add(normalize_id(p.get("id") or p.get("slug")))
                        added += 1
                else:
                    titles = [p.get("title", "?") for p in new_problems]
                    print(f"    WARNING: No matching local section for "
                          f"{len(new_problems)} problem(s): {titles}")
            for child in upstream_node.get("children", []):
                walk(child)
        elif isinstance(upstream_node, list):
            for item in upstream_node:
                walk(item)

    walk(upstream_root)
    return added


# ---------------------------------------------------------------------------
# Step 2: Merge grouping summaries
# ---------------------------------------------------------------------------

def strip_python_code_blocks(text):
    """Remove ```py / ```python code blocks from markdown text."""
    return re.sub(r"```(?:py|python)\b.*?```", "", text, flags=re.DOTALL)


def collect_grouping_sections(node, out=None):
    """Collect sections that have children but no direct problems and have a summary."""
    if out is None:
        out = []
    if isinstance(node, dict):
        children = node.get("children", [])
        problems = node.get("problems", [])
        summary = node.get("summary", "")
        if children and not problems and summary and summary.strip():
            out.append(node)
        for child in children:
            collect_grouping_sections(child, out)
    elif isinstance(node, list):
        for item in node:
            collect_grouping_sections(item, out)
    return out


def find_first_matching_child(grouping_section, local_sections):
    """For a grouping section, find its first child that maps to a local section."""
    for child in grouping_section.get("children", []):
        # If child is a leaf (has problems), match directly
        if child.get("problems"):
            match = find_best_local_section(child, local_sections)
            if match:
                return match
        # If child is also a grouping, recurse into its first child
        for grandchild in child.get("children", []):
            if grandchild.get("problems"):
                match = find_best_local_section(grandchild, local_sections)
                if match:
                    return match
    return None


def merge_grouping_summaries(local_root, upstream_root):
    """Prepend upstream grouping summaries to the first matching local child section.

    Returns the number of summaries prepended.
    """
    grouping_sections = collect_grouping_sections(upstream_root)
    local_sections = collect_leaf_sections(local_root)

    prepended = 0
    for gs in grouping_sections:
        target = find_first_matching_child(gs, local_sections)
        if target is None:
            continue

        raw_summary = gs.get("summary", "")
        cleaned = strip_python_code_blocks(raw_summary).strip()
        if not cleaned:
            continue

        translated = translate_text(cleaned)

        # Check if this summary is already present (avoid duplicate prepends)
        existing = target.get("summary", "")
        if translated in existing:
            continue

        if existing.strip():
            target["summary"] = translated + "\n\n---\n\n" + existing
        else:
            target["summary"] = translated

        prepended += 1

    return prepended


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

STUDY_PLANS = [
    "binary_search", "bitwise_operations", "data_structure",
    "dynamic_programming", "graph", "greedy", "grid", "math",
    "monotonic_stack", "sliding_window", "string", "trees",
]


def load_upstream(plan_name):
    """Load the upstream version of a study plan from git."""
    try:
        raw = subprocess.check_output(
            ["git", "show", f"upstream/main:apps/web/public/studyplan/{plan_name}.json"],
            stderr=subprocess.DEVNULL,
        )
        return json.loads(raw)
    except (subprocess.CalledProcessError, json.JSONDecodeError):
        return None


def main():
    local_dir = Path(__file__).parent.parent / "public" / "studyplan"

    total_problems = 0
    total_summaries = 0

    for plan in STUDY_PLANS:
        local_file = local_dir / f"{plan}.json"
        if not local_file.exists():
            print(f"  {plan}: local file not found, skipping")
            continue

        upstream_data = load_upstream(plan)
        if upstream_data is None:
            print(f"  {plan}: upstream not found, skipping")
            continue

        with open(local_file, "r", encoding="utf-8") as f:
            local_data = json.load(f)

        # Count before
        before = len(collect_problem_ids(local_data))

        # Step 1: merge new problems
        added = merge_new_problems(local_data, upstream_data)

        # Step 2: merge grouping summaries
        summaries = merge_grouping_summaries(local_data, upstream_data)

        if added or summaries:
            with open(local_file, "w", encoding="utf-8") as f:
                json.dump(local_data, f, ensure_ascii=False, separators=(",", ":"))

            after = len(collect_problem_ids(local_data))
            parts = []
            if added:
                parts.append(f"+{added} problem(s)")
            if summaries:
                parts.append(f"+{summaries} summary(ies)")
            print(f"  {plan}: {', '.join(parts)}  ({before} → {after} total IDs)")
            total_problems += added
            total_summaries += summaries
        else:
            print(f"  {plan}: up to date")

    print(f"\nTotal: +{total_problems} problem(s), +{total_summaries} summary(ies)")


if __name__ == "__main__":
    main()
