#!/usr/bin/env python3
"""Sync problemset data from the upstream repository."""

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
    "/main/apps/web/public/problemset"
)
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "problemset"
UPSTREAM_FILES = ("problems.json", "solutions.json", "contests.json", "tags.json")
CONTEST_KEYWORDS = ("周赛", "双周赛", "週賽", "雙週賽")
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; lc-rating-upstream-sync/1.0)",
}
REQUEST_TIMEOUT = 30


def fetch_json(url: str) -> dict | list:
    """Download and parse a JSON file from a URL."""
    request = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        return json.loads(response.read())


def filter_contests(contests: dict) -> tuple[dict, int]:
    """Keep only regular weekly and biweekly contests."""
    kept: dict[str, dict] = {}
    removed = 0

    for contest_id, contest in contests.items():
        title = contest.get("title", "")
        if any(keyword in title for keyword in CONTEST_KEYWORDS):
            kept[contest_id] = contest
        else:
            removed += 1

    return kept, removed


def write_json(path: Path, data: dict | list) -> None:
    """Write JSON using the repository's compact formatting style."""
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))


def summarize_changes(local_path: Path, upstream_data: dict | list) -> None:
    """Print a small summary of the difference against the local file."""
    if not local_path.exists():
        print(f"  {local_path.name}: new file")
        return

    with local_path.open("r", encoding="utf-8") as handle:
        local_data = json.load(handle)

    if isinstance(local_data, dict) and isinstance(upstream_data, dict):
        new_keys = set(upstream_data) - set(local_data)
        removed_keys = set(local_data) - set(upstream_data)
        print(
            f"  {local_path.name}: +{len(new_keys)} new, -{len(removed_keys)} removed"
        )
        return

    if isinstance(local_data, list) and isinstance(upstream_data, list):
        print(f"  {local_path.name}: {len(local_data)} -> {len(upstream_data)} item(s)")


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(description="Sync upstream problemset data")
    parser.add_argument(
        "--base-url",
        default=os.environ.get("LC_RATING_UPSTREAM_BASE", DEFAULT_UPSTREAM_BASE),
        help="Base URL for upstream JSON files (supports file:// for local tests).",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory where refreshed JSON files should be written.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview the sync without writing files.",
    )
    parser.add_argument(
        "--skip-translate",
        action="store_true",
        help="Skip Simplified Chinese to Traditional Chinese translation.",
    )
    return parser.parse_args()


def main() -> int:
    """Sync upstream problemset files into the local public directory."""
    args = parse_args()
    base_url = args.base_url.rstrip("/")
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    upstream_payloads: dict[str, dict | list] = {}

    for filename in UPSTREAM_FILES:
        url = f"{base_url}/{filename}"
        print(f"Fetching {url}")
        try:
            payload = fetch_json(url)
        except Exception as exc:  # noqa: BLE001
            print(f"Failed to fetch {filename}: {exc}", file=sys.stderr)
            return 1

        if filename == "contests.json" and isinstance(payload, dict):
            payload, removed = filter_contests(payload)
            print(
                f"  contests.json: kept {len(payload)} regular contest(s), "
                f"removed {removed}"
            )

        upstream_payloads[filename] = payload
        summarize_changes(output_dir / filename, payload)

    if args.dry_run:
        print("Dry run complete; no files were written.")
        return 0

    if not args.skip_translate:
        print("Translating synced data to Traditional Chinese")
        for filename, payload in upstream_payloads.items():
            upstream_payloads[filename] = translate_dict(payload)

    print("Writing refreshed problemset files")
    for filename, payload in upstream_payloads.items():
        write_json(output_dir / filename, payload)
        print(f"  wrote {output_dir / filename}")

    print("Problemset sync complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
