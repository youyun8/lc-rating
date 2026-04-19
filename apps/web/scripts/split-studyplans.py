#!/usr/bin/env python3
"""
Split combined studyplan JSONs into two sibling trees that share the same
numeric `id` as a stable, 1:1 join key.

  apps/web/public/studyplan/<key>.json   problemset tree: id, title, problems, children
  apps/web/public/tutorial/<key>.json    tutorial tree:   id, title, summary,  children

Ids are assigned per-plan via pre-order traversal, starting at 1 for the root.
On re-run, existing ids in either output file are preserved (matched by the
title-path), so authored edits keep stable ids.
"""

from __future__ import annotations

import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
STUDYPLAN_DIR = (SCRIPT_DIR / ".." / "public" / "studyplan").resolve()
TUTORIAL_DIR = (SCRIPT_DIR / ".." / "public" / "tutorial").resolve()


def collect_existing_ids(root: dict | None) -> dict[str, int]:
    """Map of title-path -> existing id from a prior output, if any."""
    out: dict[str, int] = {}
    if not root:
        return out

    def walk(node: dict, parents: list[str]) -> None:
        key = " / ".join([*parents, node.get("title", "")])
        if isinstance(node.get("id"), int):
            out[key] = node["id"]
        for child in node.get("children", []) or []:
            walk(child, [*parents, node.get("title", "")])

    walk(root, [])
    return out


def assign_ids(root: dict, existing: dict[str, int]) -> None:
    used = set(existing.values())
    counter = [1]

    def next_free() -> int:
        while counter[0] in used:
            counter[0] += 1
        value = counter[0]
        used.add(value)
        counter[0] += 1
        return value

    def walk(node: dict, parents: list[str]) -> None:
        key = " / ".join([*parents, node.get("title", "")])
        preserved = existing.get(key)
        node["id"] = preserved if isinstance(preserved, int) else next_free()
        child_path = [*parents, node.get("title", "")]
        for child in node.get("children", []) or []:
            walk(child, child_path)

    walk(root, [])


def build_problemset_node(node: dict) -> dict:
    out: dict = {"id": node["id"], "title": node.get("title", "")}
    if node.get("src") is not None:
        out["src"] = node["src"]
    if isinstance(node.get("isLeaf"), bool):
        out["isLeaf"] = node["isLeaf"]
    if isinstance(node.get("problems"), list):
        out["problems"] = node["problems"]
    if isinstance(node.get("children"), list):
        out["children"] = [build_problemset_node(c) for c in node["children"]]
    return out


def build_tutorial_node(node: dict) -> dict:
    out: dict = {"id": node["id"], "title": node.get("title", "")}
    if node.get("src") is not None:
        out["src"] = node["src"]
    summary = node.get("summary")
    if not isinstance(summary, str) or not summary:
        summary = node.get("content") if isinstance(node.get("content"), str) else None
    if isinstance(summary, str) and summary:
        out["summary"] = summary
    if isinstance(node.get("children"), list):
        out["children"] = [build_tutorial_node(c) for c in node["children"]]
    return out


def build_problemset_root(root: dict) -> dict:
    return {
        "id": root["id"],
        "title": root.get("title", ""),
        "src": root.get("src"),
        "last_update": root.get("last_update"),
        "children": [build_problemset_node(c) for c in root.get("children", []) or []],
    }


def build_tutorial_root(root: dict) -> dict:
    out: dict = {
        "id": root["id"],
        "title": root.get("title", ""),
        "src": root.get("src"),
        "last_update": root.get("last_update"),
        "children": [build_tutorial_node(c) for c in root.get("children", []) or []],
    }
    summary = root.get("summary")
    if isinstance(summary, str) and summary:
        out["summary"] = summary
    return out


def read_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def split_file(file_name: str) -> None:
    source_path = STUDYPLAN_DIR / file_name
    tutorial_path = TUTORIAL_DIR / file_name

    source = read_json(source_path)
    if source is None:
        return

    existing = collect_existing_ids(read_json(tutorial_path)) or collect_existing_ids(
        source
    )

    # Deep-copy via json round-trip so the mutation below is isolated.
    working = json.loads(json.dumps(source))
    assign_ids(working, existing)

    write_json(source_path, build_problemset_root(working))
    write_json(tutorial_path, build_tutorial_root(working))

    print(f"  [ok] {file_name} -> studyplan + tutorial")


def main() -> None:
    files = sorted(p.name for p in STUDYPLAN_DIR.glob("*.json"))
    if not files:
        print("No studyplan JSON files found.")
        return

    print(f"Splitting {len(files)} studyplan file(s)...")
    for name in files:
        split_file(name)
    print("\nDone.")


if __name__ == "__main__":
    main()
