#!/usr/bin/env python3
"""
Sync problemset data from the upstream repository (huxulm/lc-rating) and
translate Simplified Chinese to Traditional Chinese.

This replaces the previous approach of fetching directly from the LeetCode
GraphQL API, which is often blocked by rate-limits or IP restrictions.

Usage:
    python sync_upstream.py                     # sync all data
    python sync_upstream.py --dry-run           # preview changes without writing
    python sync_upstream.py --skip-translate     # sync without SC→TC translation
"""

import argparse
import json
import sys
import urllib.request
from pathlib import Path

try:
    from translate_to_traditional import translate_dict
except ImportError:
    print("Error: translate_to_traditional module not found.")
    print("Make sure you're running from the lc-maker directory.")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

UPSTREAM_BASE = (
    "https://raw.githubusercontent.com/huxulm/lc-rating"
    "/main/apps/web/public/problemset"
)

UPSTREAM_FILES = ["problems.json", "solutions.json", "contests.json", "tags.json"]

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; lc-rating-sync/1.0)",
}

REQUEST_TIMEOUT = 30

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "problemset"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def fetch_json(url: str) -> dict | list:
    """Download and parse a JSON file from a URL."""
    req = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        return json.loads(resp.read())


def filter_contests(contests: dict) -> tuple[dict, int]:
    """Keep only regular weekly/biweekly contests (週賽 / 雙週賽 in SC)."""
    kept = {}
    removed = 0
    for cid, contest in contests.items():
        title = contest.get("title", "")
        if "周赛" in title or "双周赛" in title:
            kept[cid] = contest
        else:
            removed += 1
    return kept, removed


def write_json(path: Path, data: dict | list) -> None:
    """Write JSON with compact formatting and no ASCII escaping."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync upstream LeetCode data")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing files",
    )
    parser.add_argument(
        "--skip-translate",
        action="store_true",
        help="Skip SC→TC translation (for debugging)",
    )
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Fetch all upstream files
    upstream: dict[str, dict | list] = {}
    for filename in UPSTREAM_FILES:
        url = f"{UPSTREAM_BASE}/{filename}"
        print(f"Fetching {filename} ...")
        try:
            upstream[filename] = fetch_json(url)
            if isinstance(upstream[filename], dict):
                print(f"  ✓ {len(upstream[filename])} entries")
            else:
                print(f"  ✓ {len(upstream[filename])} items")
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            return 1

    # Step 2: Filter contests
    if "contests.json" in upstream:
        contests = upstream["contests.json"]
        if isinstance(contests, dict):
            filtered, removed = filter_contests(contests)
            upstream["contests.json"] = filtered
            print(f"\nFiltered contests: kept {len(filtered)}, removed {removed} non-regular")

    # Step 3: Show diff summary
    for filename in UPSTREAM_FILES:
        local_path = OUTPUT_DIR / filename
        if local_path.exists():
            with open(local_path, "r", encoding="utf-8") as f:
                local_data = json.load(f)
            upstream_data = upstream[filename]
            if isinstance(upstream_data, dict) and isinstance(local_data, dict):
                new_keys = set(upstream_data.keys()) - set(local_data.keys())
                removed_keys = set(local_data.keys()) - set(upstream_data.keys())
                if new_keys or removed_keys:
                    print(f"\n{filename}: +{len(new_keys)} new, -{len(removed_keys)} removed")
        else:
            print(f"\n{filename}: new file")

    if args.dry_run:
        print("\n[Dry run] No files written.")
        return 0

    # Step 4: Translate SC → TC
    if not args.skip_translate:
        print("\nTranslating SC → TC ...")
        for filename in UPSTREAM_FILES:
            upstream[filename] = translate_dict(upstream[filename])
            print(f"  ✓ {filename}")

    # Step 5: Write files
    print("\nWriting files ...")
    for filename in UPSTREAM_FILES:
        out_path = OUTPUT_DIR / filename
        write_json(out_path, upstream[filename])
        print(f"  ✓ {out_path}")

    print("\n✓ Sync complete!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
