#!/usr/bin/env python3
"""
Fetch LeetCode contest data, problem details, ratings, and 0x3F's solutions
from public APIs. Outputs JSON files matching the app's expected schemas.

Usage:
    python fetch_data.py --latest --scope problemset --out ../public/problemset
    python fetch_data.py --latest --scope solutions --out ../public/problemset
    python fetch_data.py --full --out ../public/problemset
"""

import argparse
import json
import sys
import time
import zlib
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: requests not installed.")
    print("Install with: pip install requests")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

LEETCODE_GRAPHQL = "https://leetcode.cn/graphql/"
ZEROTRAC_RATINGS_URL = (
    "https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating"
    "/main/data.json"
)
ENDLESSCHENG_USER_SLUG = "endlesscheng"
REQUEST_TIMEOUT = 30
RATE_LIMIT_SLEEP = 0.3
SOLUTIONS_PAGE_SIZE = 50

GRAPHQL_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; lc-rating-fetcher/1.0)",
}

# ---------------------------------------------------------------------------
# GraphQL helpers
# ---------------------------------------------------------------------------


def graphql_request(query, variables=None, retries=3):
    """Send a GraphQL request to leetcode.cn with retry logic."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    for attempt in range(retries):
        try:
            resp = requests.post(
                LEETCODE_GRAPHQL,
                json=payload,
                headers=GRAPHQL_HEADERS,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
            if "errors" in data:
                raise RuntimeError(f"GraphQL errors: {data['errors']}")
            return data["data"]
        except (requests.RequestException, RuntimeError) as exc:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt + 1}/{retries} after error: {exc}")
                time.sleep(wait)
            else:
                raise


# ---------------------------------------------------------------------------
# Phase 1: Fetch contests
# ---------------------------------------------------------------------------

ALL_CONTESTS_QUERY = """
query {
    allContests {
        title
        titleSlug
        startTime
        questions {
            questionId
            titleSlug
        }
    }
}
"""


def fetch_contests(existing_contests):
    """Fetch all contests from LeetCode and return a contest map.

    Returns:
        dict: contestId -> contest dict
        dict: questionTitleSlug -> questionId (from contest questions)
    """
    print("Phase 1: Fetching contests...")
    data = graphql_request(ALL_CONTESTS_QUERY)
    all_contests = data["allContests"]

    now_ms = int(time.time() * 1000)

    # Build slug -> existing id mapping
    slug_to_id = {}
    for cid, c in existing_contests.items():
        slug_to_id[c["titleSlug"]] = cid

    # Find the next available contest ID
    existing_ids = [int(cid) for cid in existing_contests.keys()] if existing_contests else [0]
    next_id = max(existing_ids) + 1 if existing_ids else 1

    contest_map = {}
    question_slug_to_qid = {}

    for contest in all_contests:
        start_time_ms = contest["startTime"] * 1000
        questions = contest.get("questions") or []

        # Only include past contests with exactly 4 questions
        if start_time_ms >= now_ms or len(questions) != 4:
            continue

        slug = contest["titleSlug"]

        # Reuse existing ID or assign new one
        if slug in slug_to_id:
            cid = slug_to_id[slug]
        else:
            cid = str(next_id)
            next_id += 1

        # Collect question slugs (we'll resolve frontendIds later)
        for q in questions:
            question_slug_to_qid[q["titleSlug"]] = q["questionId"]

        contest_map[cid] = {
            "id": cid,
            "title": contest["title"],
            "titleSlug": slug,
            "time": start_time_ms,
            "_questionSlugs": [q["titleSlug"] for q in questions],
        }

    print(f"  Found {len(contest_map)} contests")
    return contest_map, question_slug_to_qid


# ---------------------------------------------------------------------------
# Phase 2: Fetch problem details
# ---------------------------------------------------------------------------

QUESTION_DETAIL_QUERY = """
query questionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        isPaidOnly
        topicTags {
            slug
            translatedName
            name
        }
    }
}
"""


def fetch_problem_details(question_slugs, existing_problems):
    """Fetch problem details for each question slug.

    Args:
        question_slugs: set of titleSlugs to fetch
        existing_problems: existing problems map (frontendId -> problem)

    Returns:
        dict: titleSlug -> problem detail dict
    """
    print("Phase 2: Fetching problem details...")

    # Build slug -> existing problem mapping for skipping
    existing_slug_set = set()
    for p in existing_problems.values():
        existing_slug_set.add(p["titleSlug"])

    # Only fetch new problems
    new_slugs = [s for s in question_slugs if s not in existing_slug_set]
    print(f"  {len(question_slugs)} total problems, {len(new_slugs)} new to fetch")

    details = {}

    # First, add existing problems by slug
    for p in existing_problems.values():
        details[p["titleSlug"]] = {
            "questionFrontendId": p["id"],
            "title": p["title"],
            "titleSlug": p["titleSlug"],
            "isPaidOnly": p.get("premium", False),
            "topicTags": [],  # Will be preserved from existing data
            "_existing": True,
        }

    # Fetch new problems
    for i, slug in enumerate(new_slugs):
        if i > 0 and i % 50 == 0:
            print(f"  Fetched {i}/{len(new_slugs)} problem details...")
        try:
            data = graphql_request(QUESTION_DETAIL_QUERY, {"titleSlug": slug})
            q = data["question"]
            if q is None:
                print(f"  Warning: question '{slug}' not found, skipping")
                continue
            details[slug] = {
                "questionFrontendId": q["questionFrontendId"],
                "title": q["title"],
                "titleSlug": q["titleSlug"],
                "isPaidOnly": q["isPaidOnly"],
                "topicTags": q["topicTags"],
                "_existing": False,
            }
        except Exception as exc:
            print(f"  Warning: failed to fetch '{slug}': {exc}")
        time.sleep(RATE_LIMIT_SLEEP)

    print(f"  Got details for {len(details)} problems total")
    return details


# ---------------------------------------------------------------------------
# Phase 3: Fetch ratings
# ---------------------------------------------------------------------------


def fetch_ratings():
    """Download problem ratings from zerotrac's GitHub repo.

    Returns:
        dict: questionFrontendId (str) -> rating (float)
    """
    print("Phase 3: Fetching ratings from zerotrac...")
    resp = requests.get(ZEROTRAC_RATINGS_URL, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    data = resp.json()

    ratings = {}
    for entry in data:
        fid = str(entry.get("ContestID_en", entry.get("ID", "")))
        # The field is "Rating" in zerotrac's data
        rating = entry.get("Rating", 0)
        # Map by frontend ID
        frontend_id = str(entry.get("ID", ""))
        if frontend_id:
            ratings[frontend_id] = rating

    print(f"  Got ratings for {len(ratings)} problems")
    return ratings


# ---------------------------------------------------------------------------
# Phase 4: Fetch 0x3F's solutions
# ---------------------------------------------------------------------------

SOLUTION_ARTICLES_QUERY = """
query solutionArticles($userSlug: String!, $skip: Int, $first: Int) {
    solutionArticles(userSlug: $userSlug, skip: $skip, first: $first) {
        edges {
            node {
                slug
                title
                createdAt
                question {
                    questionFrontendId
                    titleSlug
                }
            }
        }
        hasNextPage
    }
}
"""


def fetch_solutions(existing_solutions, incremental=True):
    """Fetch 0x3F's solution articles from LeetCode.

    Args:
        existing_solutions: existing solutions map (id -> solution)
        incremental: if True, stop when reaching already-known solutions

    Returns:
        dict: solutionId -> solution dict
    """
    print("Phase 4: Fetching 0x3F's solutions...")

    # Find the newest existing solution timestamp for early stopping
    newest_existing_time = 0
    if incremental and existing_solutions:
        newest_existing_time = max(
            s.get("time", 0) for s in existing_solutions.values()
        )
        print(f"  Incremental mode: will stop at timestamp {newest_existing_time}")

    existing_ids = set(existing_solutions.keys()) if existing_solutions else set()

    solutions = {}
    skip = 0
    should_stop = False

    while not should_stop:
        try:
            data = graphql_request(
                SOLUTION_ARTICLES_QUERY,
                {
                    "userSlug": ENDLESSCHENG_USER_SLUG,
                    "skip": skip,
                    "first": SOLUTIONS_PAGE_SIZE,
                },
            )
        except Exception as exc:
            print(f"  Warning: failed to fetch solutions at skip={skip}: {exc}")
            break

        articles = data["solutionArticles"]
        edges = articles.get("edges") or []
        has_next = articles.get("hasNextPage", False)

        if not edges:
            break

        for edge in edges:
            node = edge["node"]
            question = node.get("question")
            if question is None:
                continue

            # createdAt is a string timestamp — parse to ms
            created_at = node.get("createdAt", "")
            try:
                # createdAt may be epoch seconds or ISO string
                if isinstance(created_at, (int, float)):
                    time_ms = int(created_at * 1000)
                else:
                    time_ms = int(float(created_at) * 1000)
            except (ValueError, TypeError):
                time_ms = 0

            sol_slug = node["slug"]
            frontend_id = question.get("questionFrontendId", "")

            # Use slug as a hash to generate a numeric ID compatible with existing data
            sol_id = str(zlib.crc32(sol_slug.encode()) & 0xFFFFFFFF)

            solutions[sol_id] = {
                "id": sol_id,
                "title": node["title"],
                "titleSlug": sol_slug,
                "time": time_ms,
                "problemId": str(frontend_id),
            }

            # In incremental mode, stop if we've reached old solutions
            if incremental and time_ms > 0 and time_ms <= newest_existing_time:
                if sol_id in existing_ids:
                    should_stop = True

        skip += SOLUTIONS_PAGE_SIZE
        if not has_next:
            break

        time.sleep(RATE_LIMIT_SLEEP)
        if skip % 200 == 0:
            print(f"  Fetched {skip} solution entries...")

    print(f"  Got {len(solutions)} solutions")
    return solutions


# ---------------------------------------------------------------------------
# Tag handling
# ---------------------------------------------------------------------------


def build_tag_map(problem_details, existing_tags):
    """Build tag map from problem details, reusing existing tag IDs.

    Args:
        problem_details: dict of titleSlug -> detail (with topicTags)
        existing_tags: existing tags map (tagId -> tag)

    Returns:
        dict: tagId -> tag dict
        dict: tagSlug -> tagId (for problem tag mapping)
    """
    # Build slug -> existing tag mapping
    slug_to_existing = {}
    for tid, tag in existing_tags.items():
        # Try to find slug from en name (lowercase, spaces to hyphens)
        en = tag.get("en", "")
        slug = en.lower().replace(" ", "-").replace("(", "").replace(")", "")
        slug_to_existing[slug] = tid
        # Also index by the English name directly
        slug_to_existing[en.lower()] = tid

    tag_map = dict(existing_tags)  # Start with existing tags
    slug_to_id = {}

    # Map existing tags by their known slugs
    for tid, tag in existing_tags.items():
        en = tag.get("en", "")
        slug = en.lower().replace(" ", "-").replace("(", "").replace(")", "")
        slug_to_id[slug] = tid

    # Process all problem details for new tags
    for detail in problem_details.values():
        if detail.get("_existing"):
            continue
        for topic in detail.get("topicTags") or []:
            slug = topic["slug"]
            if slug in slug_to_id:
                continue

            # Check if we can match by name
            name_lower = topic.get("name", "").lower()
            if name_lower in slug_to_existing:
                slug_to_id[slug] = slug_to_existing[name_lower]
                continue

            # New tag — generate ID from slug
            new_id = str(zlib.crc32(slug.encode()) & 0xFFFFFFFF)
            zh_name = topic.get("translatedName") or topic.get("name", slug)
            en_name = topic.get("name", slug)
            tag_map[new_id] = {
                "id": new_id,
                "zh": zh_name,
                "en": en_name,
            }
            slug_to_id[slug] = new_id

    return tag_map, slug_to_id


# ---------------------------------------------------------------------------
# Assembly: build final output
# ---------------------------------------------------------------------------


def assemble_output(
    contest_map, problem_details, ratings, solutions,
    tag_map, slug_to_tag_id,
    existing_problems, existing_contests, existing_solutions,
):
    """Assemble final contests.json, problems.json, solutions.json, tags.json.

    Returns:
        tuple of (contests, problems, solutions, tags) dicts
    """
    # --- Build slug -> frontendId mapping from problem details ---
    slug_to_frontend_id = {}
    for detail in problem_details.values():
        slug_to_frontend_id[detail["titleSlug"]] = detail["questionFrontendId"]

    # --- Build problemFrontendId -> solutionId mapping ---
    problem_to_solution = {}
    # From existing problems
    for p in existing_problems.values():
        if p.get("solutionId"):
            problem_to_solution[p["id"]] = p["solutionId"]
    # From newly fetched solutions (overrides existing)
    for sol_id, sol in solutions.items():
        if sol.get("problemId"):
            problem_to_solution[sol["problemId"]] = sol_id

    # --- Build contestSlug -> contestId for problem->contest mapping ---
    slug_to_contest_id = {}
    for cid, c in contest_map.items():
        slug_to_contest_id[c["titleSlug"]] = cid

    # --- Finalize contests (replace _questionSlugs with problemIds) ---
    final_contests = dict(existing_contests)
    for cid, contest in contest_map.items():
        q_slugs = contest.pop("_questionSlugs", [])
        problem_ids = []
        for qs in q_slugs:
            fid = slug_to_frontend_id.get(qs)
            if fid:
                problem_ids.append(str(fid))
            else:
                problem_ids.append("")
        contest["problemIds"] = problem_ids
        final_contests[cid] = contest

    # --- Build problem -> contestId mapping from contests ---
    problem_to_contest = {}
    for cid, contest in final_contests.items():
        for pid in contest.get("problemIds", []):
            if pid:
                problem_to_contest[pid] = cid

    # --- Finalize problems ---
    final_problems = dict(existing_problems)
    for detail in problem_details.values():
        fid = str(detail["questionFrontendId"])
        slug = detail["titleSlug"]

        # If already exists, just update rating and solution info
        if fid in final_problems:
            p = final_problems[fid]
            # Update rating if we have a new one
            if fid in ratings:
                p["rating"] = ratings[fid]
            # Update solution link
            if fid in problem_to_solution:
                p["_hash"] = problem_to_solution[fid]
                p["solutionId"] = problem_to_solution[fid]
            continue

        # New problem
        rating = ratings.get(fid, 0)
        sol_id = problem_to_solution.get(fid, "")
        contest_id = problem_to_contest.get(fid, "")

        # Build tag IDs
        tag_ids = []
        if not detail.get("_existing"):
            for topic in detail.get("topicTags") or []:
                tid = slug_to_tag_id.get(topic["slug"])
                if tid:
                    tag_ids.append(tid)

        problem = {
            "id": fid,
            "title": detail["title"],
            "titleSlug": slug,
            "rating": rating,
            "premium": detail.get("isPaidOnly", False),
            "_hash": sol_id,
            "contestId": contest_id,
            "tagIds": tag_ids,
        }
        if sol_id:
            problem["solutionId"] = sol_id

        final_problems[fid] = problem

    # --- Finalize solutions (merge existing + new) ---
    final_solutions = dict(existing_solutions)
    for sol_id, sol in solutions.items():
        final_solutions[sol_id] = sol

    return final_contests, final_problems, final_solutions, tag_map


# ---------------------------------------------------------------------------
# I/O helpers
# ---------------------------------------------------------------------------


def load_json(path):
    """Load a JSON file, returning empty dict if not found."""
    p = Path(path)
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_json(path, data):
    """Save data as compact JSON."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  Wrote {p} ({len(data)} entries)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Fetch LeetCode contest/problem/rating/solution data"
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--full",
        action="store_true",
        help="Fetch everything from scratch",
    )
    mode.add_argument(
        "--latest",
        action="store_true",
        help="Incremental update (default)",
    )
    parser.add_argument(
        "--out",
        default="../public/problemset",
        help="Output directory (default: ../public/problemset)",
    )
    parser.add_argument(
        "--scope",
        choices=["all", "problemset", "solutions"],
        default="all",
        help="What to fetch: all, problemset (contests+problems+tags), "
             "solutions (solutions+ratings)",
    )
    args = parser.parse_args()

    # Default to --latest if neither specified
    full_mode = args.full
    incremental = not full_mode

    out_dir = Path(args.out)
    scope = args.scope

    # Load existing data (empty in --full mode)
    if incremental:
        existing_contests = load_json(out_dir / "contests.json")
        existing_problems = load_json(out_dir / "problems.json")
        existing_solutions = load_json(out_dir / "solutions.json")
        existing_tags = load_json(out_dir / "tags.json")
    else:
        existing_contests = {}
        existing_problems = {}
        existing_solutions = {}
        existing_tags = {}

    # Phase dispatch based on scope
    contest_map = {}
    problem_details = {}
    ratings = {}
    solutions = {}
    question_slugs = set()

    if scope in ("all", "problemset"):
        # Phase 1: Fetch contests
        contest_map, question_slug_to_qid = fetch_contests(existing_contests)

        # Collect all question slugs from contests
        for c in contest_map.values():
            for qs in c.get("_questionSlugs", []):
                question_slugs.add(qs)

        # Phase 2: Fetch problem details
        if incremental:
            problem_details = fetch_problem_details(question_slugs, existing_problems)
        else:
            problem_details = fetch_problem_details(question_slugs, {})

    if scope in ("all", "solutions"):
        # Phase 3: Fetch ratings
        ratings = fetch_ratings()

        # Phase 4: Fetch solutions
        solutions = fetch_solutions(existing_solutions, incremental=incremental)

    # Build tags (only if we fetched problem details)
    if problem_details:
        tag_map, slug_to_tag_id = build_tag_map(problem_details, existing_tags)
    else:
        tag_map = existing_tags
        slug_to_tag_id = {}

    # Assemble and write output
    print("\nAssembling output...")
    final_contests, final_problems, final_solutions, final_tags = assemble_output(
        contest_map, problem_details, ratings, solutions,
        tag_map, slug_to_tag_id,
        existing_problems, existing_contests, existing_solutions,
    )

    print("\nWriting output files...")
    if scope in ("all", "problemset"):
        save_json(out_dir / "contests.json", final_contests)
        save_json(out_dir / "tags.json", final_tags)
    if scope in ("all", "problemset", "solutions"):
        save_json(out_dir / "problems.json", final_problems)
    if scope in ("all", "solutions"):
        save_json(out_dir / "solutions.json", final_solutions)

    print("\nDone!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
