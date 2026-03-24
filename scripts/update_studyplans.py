#!/usr/bin/env python3
"""
Update study plan JSON files from parsed WebFetch output.

This script takes a text file containing parsed problem data in the format:
PROBLEM|section_path|id|title|slug|score|premium

And generates/updates the corresponding study plan JSON file.
"""

import json
import re
import sys
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path

try:
    from opencc import OpenCC
    cc = OpenCC('s2twp')
except ImportError:
    print("Warning: opencc not installed, will not convert to Traditional Chinese")
    cc = None

POST_CONVERT_MAP = {
    '爲': '為',
    '峯': '峰',
}

REPO_ROOT = Path(__file__).resolve().parent.parent
STUDYPLAN_DIR = REPO_ROOT / "apps" / "web" / "public" / "studyplan"
PROBLEMS_JSON = REPO_ROOT / "apps" / "web" / "public" / "problemset" / "problems.json"

# Load problems.json for score lookups and title translations
def load_problems_db():
    """Load problems.json and build lookup maps."""
    with open(PROBLEMS_JSON, 'r', encoding='utf-8') as f:
        problems = json.load(f)

    # Build slug -> problem mapping
    slug_map = {}
    id_map = {}
    for pid, pdata in problems.items():
        slug = pdata.get('titleSlug', '')
        if slug:
            slug_map[slug] = pdata
        id_map[pid] = pdata

    return slug_map, id_map


def to_traditional(text):
    """Convert Simplified Chinese to Traditional Chinese."""
    if cc is None:
        return text
    result = cc.convert(text)
    for wrong, correct in POST_CONVERT_MAP.items():
        result = result.replace(wrong, correct)
    return result


def parse_problem_line(line):
    """Parse a PROBLEM line into a dict."""
    parts = line.split('|')
    if len(parts) != 7 or parts[0] != 'PROBLEM':
        return None

    _, section_path, pid, title, slug, score, premium = parts

    score_val = None
    if score.strip() and score.strip() != 'null':
        try:
            score_val = int(score.strip())
        except ValueError:
            try:
                score_val = float(score.strip())
            except ValueError:
                score_val = None

    return {
        'section': section_path.strip(),
        'id': pid.strip(),
        'title': title.strip(),
        'slug': slug.strip(),
        'score': score_val,
        'isPremium': premium.strip().lower() == 'true',
    }


def build_problem_entry(parsed, slug_map, id_map, existing_problems_map):
    """Build a problem entry matching the study plan JSON schema."""
    slug = parsed['slug']
    pid = parsed['id']
    title = parsed['title']

    # Try to get score from problems.json if not provided
    score = parsed['score']
    if score is None and slug in slug_map:
        rating = slug_map[slug].get('rating')
        if rating is not None:
            score = round(rating)

    # Try to get Traditional Chinese title
    # First check existing problems in current study plan
    if slug in existing_problems_map:
        title = existing_problems_map[slug]['title']
    else:
        # Convert from Simplified to Traditional Chinese
        title = to_traditional(title)

    return {
        'id': pid,
        'title': title,
        'slug': f'/{slug}/' if not slug.startswith('/') else slug if slug.endswith('/') else f'{slug}/',
        'src': f'https://leetcode.cn/problems/{slug}/',
        'solution': None,
        'score': score,
        'isPremium': parsed['isPremium'],
    }


def build_section_tree(problems_data, existing_data=None):
    """Build a hierarchical section tree from flat problem data."""
    # Group problems by section
    sections = OrderedDict()
    for p in problems_data:
        section = p['section']
        if section not in sections:
            sections[section] = []
        sections[section].append(p)

    # Build existing problems map for title lookups
    existing_problems_map = {}
    if existing_data:
        def collect_existing(node):
            for p in node.get('problems', []):
                s = p['slug'].strip('/')
                existing_problems_map[s] = p
            for child in node.get('children', []):
                collect_existing(child)
        collect_existing(existing_data)

    # Build existing section summaries map
    existing_summaries = {}
    if existing_data:
        def collect_summaries(node, path=''):
            title = node.get('title', '')
            current_path = f"{path}/{title}" if path else title
            if node.get('summary'):
                existing_summaries[title] = node['summary']
            for child in node.get('children', []):
                collect_summaries(child, current_path)
        collect_summaries(existing_data)

    slug_map, id_map = load_problems_db()

    # Build section nodes
    children = []
    for section_name, section_problems in sections.items():
        problems = []
        for p in section_problems:
            entry = build_problem_entry(p, slug_map, id_map, existing_problems_map)
            problems.append(entry)

        section_node = {
            'title': to_traditional(section_name),
            'src': None,
            'summary': existing_summaries.get(to_traditional(section_name)),
            'problems': problems,
            'children': [],
        }
        # Remove None summary
        if section_node['summary'] is None:
            del section_node['summary']

        children.append(section_node)

    return children


def nest_sections(flat_sections):
    """
    Attempt to nest sections based on naming patterns.
    e.g., "三、与或（AND/OR）的性质 > AND/OR LogTrick" becomes a child of "三、与或..."
    """
    # Sections with ">" in the name indicate parent > child relationship
    result = []
    parent_map = {}

    for section in flat_sections:
        title = section['title']
        if ' > ' in title:
            # This is a child section
            parts = title.split(' > ', 1)
            parent_title = parts[0].strip()
            child_title = parts[1].strip()
            section['title'] = to_traditional(child_title)

            if parent_title in parent_map:
                parent_map[parent_title]['children'].append(section)
            else:
                # Parent not found yet, add as top-level
                result.append(section)
        else:
            parent_map[title] = section
            result.append(section)

    return result


def merge_new_problems_into_existing(existing_data, new_problems_data, slug_map, id_map):
    """
    Merge new problems into existing study plan data.
    Keeps all existing problems, adds new ones to their sections.
    Returns the updated existing_data.
    """
    # Build a set of all existing problem slugs
    existing_slugs = set()
    existing_problems_map = {}
    def collect_existing(node):
        for p in node.get('problems', []):
            s = p['slug'].strip('/')
            existing_slugs.add(s)
            existing_problems_map[s] = p
        for child in node.get('children', []):
            collect_existing(child)
    collect_existing(existing_data)

    # Find new problems not in existing data
    new_only = []
    for p in new_problems_data:
        slug = p['slug'].strip('/')
        if slug not in existing_slugs:
            new_only.append(p)

    if not new_only:
        print(f"  No new problems to merge (all {len(new_problems_data)} already exist)")
        return existing_data

    print(f"  Found {len(new_only)} new problems to merge")

    # Group new problems by section
    section_groups = OrderedDict()
    for p in new_only:
        section = p['section']
        if section not in section_groups:
            section_groups[section] = []
        section_groups[section].append(p)

    # Build a map of existing sections by title (Traditional Chinese)
    existing_sections = {}
    def map_sections(node, path=''):
        title = node.get('title', '')
        existing_sections[title] = node
        for child in node.get('children', []):
            map_sections(child, title)
    for child in existing_data.get('children', []):
        map_sections(child)

    # Add new problems to their sections
    for section_name, section_problems in section_groups.items():
        tc_section = to_traditional(section_name)
        # Handle nested sections (with " > ")
        if ' > ' in section_name:
            parts = section_name.split(' > ', 1)
            tc_parent = to_traditional(parts[0].strip())
            tc_child = to_traditional(parts[1].strip())

            parent_node = existing_sections.get(tc_parent)
            if parent_node:
                # Find or create child section
                child_node = None
                for c in parent_node.get('children', []):
                    if c['title'] == tc_child:
                        child_node = c
                        break
                if child_node is None:
                    child_node = {
                        'title': tc_child,
                        'src': None,
                        'problems': [],
                        'children': [],
                    }
                    parent_node['children'].append(child_node)
                    existing_sections[tc_child] = child_node

                for p in section_problems:
                    entry = build_problem_entry(p, slug_map, id_map, existing_problems_map)
                    child_node['problems'].append(entry)
                    print(f"    Added {entry['id']} to {tc_parent} > {tc_child}")
            else:
                # Create both parent and child
                child_node = {
                    'title': tc_child,
                    'src': None,
                    'problems': [],
                    'children': [],
                }
                for p in section_problems:
                    entry = build_problem_entry(p, slug_map, id_map, existing_problems_map)
                    child_node['problems'].append(entry)
                    print(f"    Added {entry['id']} to NEW {tc_parent} > {tc_child}")

                parent_node = {
                    'title': tc_parent,
                    'src': None,
                    'problems': [],
                    'children': [child_node],
                }
                existing_data['children'].append(parent_node)
                existing_sections[tc_parent] = parent_node
                existing_sections[tc_child] = child_node
        else:
            target = existing_sections.get(tc_section)
            if target is None:
                # Create new section
                target = {
                    'title': tc_section,
                    'src': None,
                    'problems': [],
                    'children': [],
                }
                existing_data['children'].append(target)
                existing_sections[tc_section] = target

            for p in section_problems:
                entry = build_problem_entry(p, slug_map, id_map, existing_problems_map)
                target['problems'].append(entry)
                print(f"    Added {entry['id']} to {tc_section}")

    return existing_data


def update_studyplan(plan_name, problems_text, metadata=None, merge=False):
    """Update a study plan JSON file with new problem data."""
    json_path = STUDYPLAN_DIR / f"{plan_name}.json"

    # Load existing data if available
    existing_data = None
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

    # Parse problem lines
    problems_data = []
    summaries = {}

    for line in problems_text.strip().split('\n'):
        line = line.strip()
        if line.startswith('PROBLEM|'):
            parsed = parse_problem_line(line)
            if parsed:
                problems_data.append(parsed)
        elif line.startswith('SUMMARY|'):
            parts = line.split('|', 2)
            if len(parts) == 3:
                summaries[parts[1].strip()] = parts[2].strip()

    if not problems_data:
        print(f"No problems found for {plan_name}")
        return

    # Count problems helper
    def count_problems(node):
        total = len(node.get('problems', []))
        for child in node.get('children', []):
            total += count_problems(child)
        return total

    old_count = count_problems(existing_data) if existing_data else 0

    if merge and existing_data:
        # Merge mode: keep existing, add new
        slug_map, id_map = load_problems_db()
        result = merge_new_problems_into_existing(existing_data, problems_data, slug_map, id_map)
        result['last_update'] = datetime.now(timezone.utc).isoformat()
    else:
        # Replace mode: build fresh from parsed data
        children = build_section_tree(problems_data, existing_data)
        children = nest_sections(children)

        result = {
            'title': existing_data.get('title', '') if existing_data else '',
            'src': existing_data.get('src', '') if existing_data else '',
            'last_update': datetime.now(timezone.utc).isoformat(),
        }

        if existing_data and 'summary' in existing_data:
            result['summary'] = existing_data['summary']

        if metadata:
            if 'title' in metadata:
                result['title'] = to_traditional(metadata['title'])
            if 'src' in metadata:
                result['src'] = metadata['src']
            if 'summary' in metadata:
                result['summary'] = to_traditional(metadata['summary'])

        for section in children:
            section_title_sc = section['title']
            if section_title_sc in summaries:
                section['summary'] = to_traditional(summaries[section_title_sc])

        result['children'] = children

    # Write output
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, separators=(',', ':'))

    new_count = count_problems(result)
    print(f"Updated {plan_name}: {old_count} -> {new_count} problems ({new_count - old_count:+d})")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <plan_name> <problems_file> [--merge]")
        print(f"  plan_name: e.g., 'grid', 'sliding_window'")
        print(f"  problems_file: text file with PROBLEM|... lines")
        print(f"  --merge: keep existing problems, only add new ones")
        sys.exit(1)

    plan_name = sys.argv[1]
    problems_file = sys.argv[2]
    merge = '--merge' in sys.argv

    with open(problems_file, 'r', encoding='utf-8') as f:
        problems_text = f.read()

    update_studyplan(plan_name, problems_text, merge=merge)
