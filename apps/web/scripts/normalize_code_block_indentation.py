#!/usr/bin/env python3
"""Normalize fenced code blocks from 2-space to 4-space indentation."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKIP_PARTS = {"node_modules", ".git", "dist", ".next", "build"}

FENCE_ESCAPED = re.compile(r"```([\w+-]*)\\n([\s\S]*?)\\n```")
FENCE_PLAIN = re.compile(r"```([\w+-]*)\n([\s\S]*?)\n```")


def normalize_code_block_indentation(code: str) -> str:
    lines = code.split("\n")
    indents = [
        len(m.group(1))
        for line in lines
        if (m := re.match(r"^(\s+)\S", line)) and "\t" not in m.group(1)
    ]

    if not indents:
        return code

    if all(n % 4 == 0 for n in indents) and min(indents) >= 4:
        return code

    normalized: list[str] = []
    for line in lines:
        match = re.match(r"^(\s*)(.*)$", line)
        if not match:
            normalized.append(line)
            continue

        whitespace, rest = match.group(1), match.group(2)
        if not whitespace:
            normalized.append(rest)
            continue

        if "\t" in whitespace:
            normalized.append(whitespace.replace("\t", "    ") + rest)
            continue

        normalized.append(" " * (len(whitespace) * 2) + rest)

    return "\n".join(normalized)


def normalize_fence(lang: str, code: str, escaped: bool) -> str:
    normalized = normalize_code_block_indentation(code.replace("\\n", "\n"))
    if escaped:
        normalized = normalized.replace("\n", "\\n")
        return f"```{lang}\\n{normalized}\\n```"
    return f"```{lang}\n{normalized}\n```"


def normalize_text(text: str) -> tuple[str, int]:
    changes = 0

    def replace_escaped(match: re.Match[str]) -> str:
        nonlocal changes
        lang, code = match.group(1), match.group(2)
        updated = normalize_fence(lang, code, escaped=True)
        if updated != match.group(0):
            changes += 1
        return updated

    def replace_plain(match: re.Match[str]) -> str:
        nonlocal changes
        lang, code = match.group(1), match.group(2)
        updated = normalize_fence(lang, code, escaped=False)
        if updated != match.group(0):
            changes += 1
        return updated

    text = FENCE_ESCAPED.sub(replace_escaped, text)
    text = FENCE_PLAIN.sub(replace_plain, text)
    return text, changes


def should_process(path: Path) -> bool:
    if path.suffix not in {".ts", ".md", ".json", ".py"}:
        return False
    return not any(part in SKIP_PARTS for part in path.parts)


def main() -> int:
    total_files = 0
    total_blocks = 0

    for path in ROOT.rglob("*"):
        if not should_process(path):
            continue

        original = path.read_text(encoding="utf-8")
        updated = original
        file_changes = 0

        while True:
            next_text, changes = normalize_text(updated)
            if changes == 0:
                break
            updated = next_text
            file_changes += changes

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            total_files += 1
            total_blocks += file_changes
            print(f"updated {path} ({file_changes} blocks)")

    print(f"done: {total_files} files, {total_blocks} code blocks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
