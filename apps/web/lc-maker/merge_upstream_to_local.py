#!/usr/bin/env python3
"""Merge newly added upstream study-plan problems into local files."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

from translate_to_traditional import translate_dict


DEFAULT_UPSTREAM_BASE = (
    "https://raw.githubusercontent.com/huxulm/lc-rating"
    "/main/apps/web/public/studyplan"
)
DEFAULT_LOCAL_DIR = Path(__file__).resolve().parent.parent / "public" / "studyplan"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; lc-rating-studyplan-sync/1.0)",
}
REQUEST_TIMEOUT = 30
STUDY_PLANS = (
    "binary_search",
    "bitwise_operations",
    "data_structure",
    "dynamic_programming",
    "graph",
    "greedy",
    "grid",
    "math",
    "monotonic_stack",
    "sliding_window",
    "string",
    "trees",
)

_tc2sc_converter = None


def fetch_json(url: str) -> dict | list:
    """Download and parse a JSON file from a URL."""
    request = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        return json.loads(response.read())


def get_tc2sc_converter():
    """Lazily create the Traditional-Chinese-to-Simplified converter."""
    global _tc2sc_converter
    if _tc2sc_converter is None:
        try:
            import opencc
        except ImportError:
            return None
        _tc2sc_converter = opencc.OpenCC("t2s")
    return _tc2sc_converter


def normalize_id(problem_id: object) -> str:
    """Normalize problem identifiers so local and upstream IDs compare cleanly."""
    if isinstance(problem_id, int):
        return str(problem_id)

    value = str(problem_id)
    if any("\u4e00" <= character <= "\u9fff" for character in value):
        converter = get_tc2sc_converter()
        if converter is not None:
            value = converter.convert(value)
        else:
            value = value.replace("面試題", "面试题").replace("棋盤", "棋盘")

    return value


def collect_problem_ids(node: dict | list) -> set[str]:
    """Collect normalized problem IDs from a study-plan tree."""
    ids: set[str] = set()

    if isinstance(node, dict):
        for problem in node.get("problems", []):
            problem_id = problem.get("id") or problem.get("slug")
            if problem_id is not None:
                ids.add(normalize_id(problem_id))
        for child in node.get("children", []):
            ids.update(collect_problem_ids(child))
    else:
        for item in node:
            ids.update(collect_problem_ids(item))

    return ids


def collect_leaf_sections(node: dict | list, sections: list[dict] | None = None) -> list[dict]:
    """Collect sections that directly contain problems."""
    if sections is None:
        sections = []

    if isinstance(node, dict):
        if node.get("problems"):
            sections.append(node)
        for child in node.get("children", []):
            collect_leaf_sections(child, sections)
    else:
        for item in node:
            collect_leaf_sections(item, sections)

    return sections


def section_ids(section: dict) -> set[str]:
    """Collect normalized IDs for problems directly inside a section."""
    return {
        normalize_id(problem.get("id") or problem.get("slug"))
        for problem in section.get("problems", [])
    }


def find_best_local_section(upstream_section: dict, local_sections: list[dict]) -> dict | None:
    """Find the local section with the highest problem-ID overlap."""
    upstream_ids = section_ids(upstream_section)
    if not upstream_ids:
        return None

    best_section = None
    best_overlap = 0
    for local_section in local_sections:
        overlap = len(upstream_ids & section_ids(local_section))
        if overlap > best_overlap:
            best_overlap = overlap
            best_section = local_section

    return best_section


def build_parent_map(
    node: dict | list,
    parent: dict | None = None,
    parent_map: dict[int, dict | None] | None = None,
) -> dict[int, dict | None]:
    """Build a map from node identity to parent node."""
    if parent_map is None:
        parent_map = {}

    if isinstance(node, dict):
        parent_map[id(node)] = parent
        for child in node.get("children", []):
            build_parent_map(child, node, parent_map)
    else:
        for item in node:
            build_parent_map(item, parent, parent_map)

    return parent_map


def find_sibling_target(
    upstream_section: dict,
    upstream_root: dict,
    local_sections: list[dict],
) -> dict | None:
    """Find a local section via sibling overlap when direct matching fails."""
    parent_map = build_parent_map(upstream_root)
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


def parse_score(score: object) -> float | None:
    """Convert a score value to a sortable number."""
    if score is None:
        return None
    if isinstance(score, (int, float)):
        return float(score)
    try:
        return float(str(score))
    except (TypeError, ValueError):
        return None


def problem_sort_key(problem: dict) -> tuple[bool, float, str]:
    """Sort problems by score ascending, with null scores first."""
    score = parse_score(problem.get("score"))
    tie_breaker = str(problem.get("id") or problem.get("slug") or "")
    return (score is not None, score if score is not None else float("-inf"), tie_breaker)


def sort_section_problems(section: dict) -> None:
    """Sort a section's problems in ascending score order."""
    section["problems"] = sorted(section.get("problems", []), key=problem_sort_key)


def merge_new_problems(local_root: dict, upstream_root: dict) -> int:
    """Merge new upstream problems into the best-matching local sections."""
    local_ids = collect_problem_ids(local_root)
    local_sections = collect_leaf_sections(local_root)
    touched_sections: dict[int, dict] = {}
    added = 0

    def walk(upstream_node: dict | list) -> None:
        nonlocal added

        if isinstance(upstream_node, dict):
            new_problems = [
                problem
                for problem in upstream_node.get("problems", [])
                if normalize_id(problem.get("id") or problem.get("slug")) not in local_ids
            ]

            if new_problems:
                target = find_best_local_section(upstream_node, local_sections)
                if target is None:
                    target = find_sibling_target(upstream_node, upstream_root, local_sections)

                if target is not None:
                    for problem in new_problems:
                        translated_problem = translate_dict(problem)
                        target.setdefault("problems", []).append(translated_problem)
                        local_ids.add(normalize_id(problem.get("id") or problem.get("slug")))
                        added += 1
                    touched_sections[id(target)] = target
                else:
                    titles = [problem.get("title", "?") for problem in new_problems]
                    print(
                        "  warning: no matching local section for "
                        f"{len(new_problems)} problem(s): {titles}"
                    )

            for child in upstream_node.get("children", []):
                walk(child)
            return

        for item in upstream_node:
            walk(item)

    walk(upstream_root)

    for section in touched_sections.values():
        sort_section_problems(section)

    return added


def load_upstream(plan_name: str, base_url: str) -> dict | None:
    """Load a single upstream study-plan file."""
    try:
        payload = fetch_json(f"{base_url.rstrip('/')}/{plan_name}.json")
    except Exception as exc:  # noqa: BLE001
        print(f"  {plan_name}: failed to load upstream data ({exc})", file=sys.stderr)
        return None

    if isinstance(payload, dict):
        return payload

    print(f"  {plan_name}: upstream payload is not a JSON object", file=sys.stderr)
    return None


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Merge upstream study-plan updates into local JSON files"
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get(
            "LC_RATING_UPSTREAM_STUDYPLAN_BASE",
            DEFAULT_UPSTREAM_BASE,
        ),
        help="Base URL for upstream study-plan JSON files (supports file://).",
    )
    parser.add_argument(
        "--local-dir",
        default=str(DEFAULT_LOCAL_DIR),
        help="Local study-plan directory to update.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview the merge without writing files.",
    )
    return parser.parse_args()


def main() -> int:
    """Merge only new upstream study-plan problems into the local repository."""
    args = parse_args()
    local_dir = Path(args.local_dir)
    total_problems = 0

    for plan_name in STUDY_PLANS:
        local_file = local_dir / f"{plan_name}.json"
        if not local_file.exists():
            print(f"  {plan_name}: local file not found, skipping")
            continue

        upstream_data = load_upstream(plan_name, args.base_url)
        if upstream_data is None:
            continue

        with local_file.open("r", encoding="utf-8") as handle:
            local_data = json.load(handle)

        before = len(collect_problem_ids(local_data))
        added = merge_new_problems(local_data, upstream_data)

        if added:
            if not args.dry_run:
                with local_file.open("w", encoding="utf-8") as handle:
                    json.dump(local_data, handle, ensure_ascii=False, separators=(",", ":"))

            after = len(collect_problem_ids(local_data))
            action = "would update" if args.dry_run else "updated"
            print(
                f"  {plan_name}: {action} +{added} problem(s) "
                f"({before} -> {after} total IDs)"
            )
            total_problems += added
        else:
            print(f"  {plan_name}: up to date")

    print(f"Total study-plan changes: +{total_problems} problem(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
