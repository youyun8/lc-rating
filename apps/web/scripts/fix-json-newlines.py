#!/usr/bin/env python3
import json
import sys

files_to_fix = [
    'public/studyplan/bitwise_operations.json',
    'public/studyplan/graph.json'
]

for filepath in files_to_fix:
    print(f"Processing {filepath}...")

    # Read the file as text
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Try to parse - if it fails, we'll need to fix it manually
    try:
        data = json.loads(content)
        print(f"  ✓ {filepath} is already valid JSON")
        continue
    except json.JSONDecodeError as e:
        print(f"  Found JSON error at line {e.lineno}, col {e.colno}")
        print(f"  Error: {e.msg}")

    # The issue is that these files have literal newlines in strings
    # We need to read line by line and reconstruct

    # For now, let's use a different approach: read the file as raw bytes
    # and manually fix the multiline strings in the summary fields

    print(f"  Attempting to fix...")

    # Strategy: Find summary fields that have code blocks and fix them
    # The pattern is: "summary": "...```cpp\n<code>\n```..."
    # We need to escape the newlines inside the code blocks

    lines = content.split('\n')
    fixed_lines = []
    in_summary = False
    summary_indent = 0
    summary_parts = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if we're entering a summary field with code blocks
        if '"summary":' in line and '```cpp' in line:
            # This line starts a multiline summary with code
            # We need to collect all lines until we find the closing quote
            summary_parts = [line]
            i += 1

            # Collect lines until we find a line that ends the summary
            # The summary should end with a closing quote followed by comma
            while i < len(lines):
                summary_parts.append(lines[i])
                # Check if this line ends the summary
                # Look for patterns like: ...",$  or  ..."\n  or  ...",
                stripped = lines[i].strip()
                if (stripped.endswith('",') or
                    stripped.endswith('"') and i + 1 < len(lines) and
                    (lines[i + 1].strip().startswith('"') or
                     lines[i + 1].strip().startswith('}') or
                     lines[i + 1].strip().startswith(']'))):
                    i += 1
                    break
                i += 1

            # Now we have all the summary lines
            # Join them and properly escape
            summary_text = '\n'.join(summary_parts)

            # Find the value part (after "summary": ")
            if '"summary": "' in summary_text:
                parts = summary_text.split('"summary": "', 1)
                prefix = parts[0] + '"summary": "'
                rest = parts[1]

                # Find the closing quote (last occurrence before comma or end)
                # This is tricky because the string itself might contain quotes
                # Let's find the last ", before the end
                if rest.rstrip().endswith('",'):
                    value_part = rest.rstrip()[:-2]  # Remove ", at the end
                    suffix = '",\n'
                elif rest.rstrip().endswith('"'):
                    value_part = rest.rstrip()[:-1]  # Remove " at the end
                    suffix = '"\n'
                else:
                    # Couldn't find proper end, just use as-is
                    fixed_lines.append(summary_text)
                    continue

                # Now escape all newlines in value_part
                # But we need to be careful not to double-escape already escaped ones
                value_part_escaped = value_part.replace('\\n', '\x00')  # Temporary placeholder
                value_part_escaped = value_part_escaped.replace('\n', '\\n')
                value_part_escaped = value_part_escaped.replace('\x00', '\\n')  # Restore

                # Reconstruct the line
                fixed_line = prefix + value_part_escaped + suffix
                fixed_lines.append(fixed_line.rstrip('\n'))
        else:
            fixed_lines.append(line)
            i += 1

    # Write the fixed content
    fixed_content = '\n'.join(fixed_lines)

    # Verify it's valid JSON
    try:
        json.loads(fixed_content)
        print(f"  ✓ Fixed JSON is valid!")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"  ✓ Wrote fixed JSON to {filepath}")
    except json.JSONDecodeError as e:
        print(f"  ✗ Fixed JSON is still invalid: {e}")
        print(f"     Line {e.lineno}, col {e.colno}")
        # Don't write the file if it's still invalid

print("\nDone!")
