#!/usr/bin/env python3
"""
Translate Simplified Chinese to Traditional Chinese for LeetCode data files.
Uses opencc-python-reimplemented for conversion.
"""

import json
import sys
from pathlib import Path

try:
    import opencc
except ImportError:
    print("Error: opencc-python-reimplemented not installed.")
    print("Install with: pip install opencc-python-reimplemented")
    sys.exit(1)

# Create converter
converter = opencc.OpenCC('s2t')  # Simplified to Traditional

# Post-conversion replacements: OpenCC misses these or uses mainland terms.
# Keys are OpenCC s2t output; values are preferred Taiwan Traditional Chinese.
POST_CONVERT_MAP = {
    '周賽': '週賽',
    # Taiwan CS terminology
    '棧': '堆疊',
    '隊列': '佇列',
    '鏈表': '鏈結串列',
    '字符串': '字串',
    '數組': '陣列',
    '遞歸': '遞迴',
    '指針': '指標',
    '哈希': '雜湊',
}

def translate_text(text):
    """Translate a string from Simplified to Traditional Chinese."""
    if not isinstance(text, str):
        return text
    result = converter.convert(text)
    for wrong, correct in POST_CONVERT_MAP.items():
        result = result.replace(wrong, correct)
    return result

def translate_dict(obj):
    """Recursively translate all Chinese strings in a dict/list."""
    if isinstance(obj, dict):
        return {k: translate_dict(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_dict(item) for item in obj]
    elif isinstance(obj, str):
        return translate_text(obj)
    else:
        return obj

def process_file(input_path, output_path=None):
    """Translate a JSON file from SC to TC."""
    input_path = Path(input_path)
    if output_path is None:
        output_path = input_path
    else:
        output_path = Path(output_path)
    
    print(f"Processing: {input_path}")
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Translate the data
        translated = translate_dict(data)
        
        # Write back
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(translated, f, ensure_ascii=False, separators=(',', ':'))
        
        print(f"  ✓ Translated and saved to: {output_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error processing {input_path}: {e}")
        return False

def main():
    """Main entry point."""
    base_dir = Path(__file__).parent.parent / "public"
    
    # Files to translate
    files_to_translate = [
        base_dir / "problemset" / "problems.json",
        base_dir / "problemset" / "contests.json",
        base_dir / "problemset" / "solutions.json",
        base_dir / "problemset" / "tags.json",  # Will overwrite with TC version
    ]
    
    # Also translate studyplan files
    studyplan_dir = base_dir / "studyplan"
    if studyplan_dir.exists():
        for json_file in studyplan_dir.glob("*.json"):
            files_to_translate.append(json_file)
    
    success_count = 0
    for file_path in files_to_translate:
        if file_path.exists():
            if process_file(file_path):
                success_count += 1
        else:
            print(f"Skipping (not found): {file_path}")
    
    print(f"\n✓ Translated {success_count} files successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())
