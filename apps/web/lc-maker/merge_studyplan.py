#!/usr/bin/env python3
"""Merge new problems from upstream study plans into local study plans.

For each study plan JSON, this script:
1. Collects all problem IDs already present in the local file.
2. Walks the upstream file to find problems not in the local set.
3. Appends new problems to the matching local section (by title).
4. Reports what was added (if anything).

Local customisations (summaries, translations, C++ templates, extra fields)
are preserved because the local file is only *appended to*, never overwritten.
"""

import json
import os
import sys
from pathlib import Path


def collect_problem_ids(node):
    """Return a set of problem IDs found in the tree rooted at *node*."""
    ids = set()
    if isinstance(node, dict):
        for p in node.get("problems", []):
            pid = p.get("id") or p.get("slug")
            if pid is not None:
                ids.add(pid)
        for child in node.get("children", []):
            ids.update(collect_problem_ids(child))
    elif isinstance(node, list):
        for item in node:
            ids.update(collect_problem_ids(item))
    return ids


def _build_title_index(node, index, path=()):
    """Build a dict mapping section title -> node reference."""
    if isinstance(node, dict):
        title = node.get("title", "")
        if title:
            index[title] = node
        for child in node.get("children", []):
            _build_title_index(child, index, path + (title,))
    elif isinstance(node, list):
        for item in node:
            _build_title_index(item, index, path)


def merge_new_problems(local_root, upstream_root):
    """Merge problems present in *upstream_root* but missing from *local_root*.

    Returns the number of problems added.
    """
    local_ids = collect_problem_ids(local_root)
    title_index = {}
    _build_title_index(local_root, title_index)

    added = 0

    def _walk(upstream_node):
        nonlocal added
        if isinstance(upstream_node, dict):
            title = upstream_node.get("title", "")
            new_problems = [
                p
                for p in upstream_node.get("problems", [])
                if (p.get("id") or p.get("slug")) not in local_ids
            ]
            if new_problems and title in title_index:
                target = title_index[title]
                target.setdefault("problems", []).extend(new_problems)
                for p in new_problems:
                    local_ids.add(p.get("id") or p.get("slug"))
                added += len(new_problems)
            for child in upstream_node.get("children", []):
                _walk(child)
        elif isinstance(upstream_node, list):
            for item in upstream_node:
                _walk(item)

    _walk(upstream_root)
    return added


def main():
    upstream_dir = os.environ.get("UPSTREAM_STUDYPLAN_DIR")
    local_dir = os.environ.get("LOCAL_STUDYPLAN_DIR",
                               "apps/web/public/studyplan")

    if not upstream_dir:
        print("Error: set UPSTREAM_STUDYPLAN_DIR to the temp directory "
              "containing upstream study plan JSONs.", file=sys.stderr)
        sys.exit(1)

    upstream_path = Path(upstream_dir)
    local_path = Path(local_dir)
    total_added = 0

    for upstream_file in sorted(upstream_path.glob("*.json")):
        local_file = local_path / upstream_file.name
        if not local_file.exists():
            # Brand-new study plan from upstream — copy as-is
            local_file.write_text(upstream_file.read_text())
            print(f"  NEW file: {upstream_file.name}")
            continue

        with open(upstream_file, "r") as f:
            upstream_data = json.load(f)
        with open(local_file, "r") as f:
            local_data = json.load(f)

        added = merge_new_problems(local_data, upstream_data)
        if added:
            with open(local_file, "w") as f:
                json.dump(local_data, f, ensure_ascii=False, indent=4)
            print(f"  {upstream_file.name}: +{added} new problem(s)")
            total_added += added
        else:
            print(f"  {upstream_file.name}: up to date")

    print(f"\nTotal new problems added: {total_added}")


if __name__ == "__main__":
    main()
