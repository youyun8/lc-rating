#!/usr/bin/env python3
"""Translate Simplified Chinese data to Traditional Chinese."""

from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import opencc
except ImportError:
    print("Error: opencc-python-reimplemented is not installed.", file=sys.stderr)
    print(
        "Install it with: python -m pip install opencc-python-reimplemented",
        file=sys.stderr,
    )
    sys.exit(1)


converter = opencc.OpenCC("s2twp")

POST_CONVERT_MAP = {
    "周賽": "週賽",
    "棧": "堆疊",
    "隊列": "佇列",
    "鏈表": "鏈結串列",
    "字符串": "字串",
    "數組": "陣列",
    "遞歸": "遞迴",
    "指針": "指標",
    "哈希": "雜湊",
    "爲": "為",
    "峯": "峰",
}


def translate_text(text: str) -> str:
    """Translate a single string to Traditional Chinese."""
    result = converter.convert(text)
    for source, target in POST_CONVERT_MAP.items():
        result = result.replace(source, target)
    return result


def translate_dict(obj: object) -> object:
    """Recursively translate strings inside dictionaries and lists."""
    if isinstance(obj, dict):
        return {key: translate_dict(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [translate_dict(item) for item in obj]
    if isinstance(obj, str):
        return translate_text(obj)
    return obj


def process_file(input_path: str | Path, output_path: str | Path | None = None) -> bool:
    """Translate a JSON file from Simplified to Traditional Chinese."""
    input_path = Path(input_path)
    output_path = input_path if output_path is None else Path(output_path)

    try:
        with input_path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)

        translated = translate_dict(data)

        with output_path.open("w", encoding="utf-8") as handle:
            json.dump(translated, handle, ensure_ascii=False, separators=(",", ":"))

        print(f"Translated {input_path} -> {output_path}")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to translate {input_path}: {exc}", file=sys.stderr)
        return False


def main() -> int:
    """Translate the local static JSON files in place."""
    base_dir = Path(__file__).resolve().parent.parent / "public"
    files_to_translate = [
        base_dir / "problemset" / "problems.json",
        base_dir / "problemset" / "contests.json",
        base_dir / "problemset" / "solutions.json",
        base_dir / "problemset" / "tags.json",
    ]

    studyplan_dir = base_dir / "studyplan"
    if studyplan_dir.exists():
        files_to_translate.extend(sorted(studyplan_dir.glob("*.json")))

    translated_count = 0
    for file_path in files_to_translate:
        if file_path.exists() and process_file(file_path):
            translated_count += 1

    print(f"Translated {translated_count} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
