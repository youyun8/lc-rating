#!/usr/bin/env python3
"""Synchronize upstream study plans into the local Traditional-Chinese overlay."""

from __future__ import annotations

import argparse
import copy
import json
import os
import re
import sys
import urllib.request
from dataclasses import dataclass, field
from fractions import Fraction
from pathlib import Path
from typing import Iterable, Iterator, Sequence
from urllib.parse import unquote, urlparse

from translate_to_traditional import translate_dict, translate_text


DEFAULT_UPSTREAM_BASE = (
    "https://raw.githubusercontent.com/huxulm/lc-rating"
    "/main/apps/web/public/studyplan"
)
DEFAULT_LOCAL_DIR = Path(__file__).resolve().parent.parent / "public" / "studyplan"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; lc-rating-studyplan-sync/2.0)",
}
REQUEST_TIMEOUT = 30

# These are the only plans backed by upstream. The other seven local plans must
# never be selected implicitly or accepted as selectors.
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

SLUG_CORRECTIONS = {
    # Keep the requested historical malformed spelling covered as well.
    "minimum-number-of-valid-strings-to-form-target-with-the-product":
        "minimum-number-of-valid-strings-to-form-target-with-their-product",
    # The live upstream LC 2892 record uses this singular form. LeetCode and
    # the local overlay use "their product".
    "minimizing-array-after-replacing-pairs-with-the-product":
        "minimizing-array-after-replacing-pairs-with-their-product",
}
LC2892_SLUG = (
    "minimizing-array-after-replacing-pairs-with-their-product"
)

# Values here are reapplied after every upstream refresh. This is deliberately
# an explicit allowlist rather than a general preference for stale local data.
LOCAL_CORRECTION_ALLOWLIST: dict[str, dict[str, object]] = {
    LC2892_SLUG: {
        "slug": LC2892_SLUG,
        "src": f"https://leetcode.cn/problems/{LC2892_SLUG}/",
    },
}

# An override maps an upstream title path (excluding the document root) to a
# canonical slug that anchors the intended local section. Slug anchors avoid
# coupling the sync to unreliable upstream IDs or local numeric section IDs.
SectionRoute = str | tuple[str, ...]

SECTION_ROUTE_OVERRIDES: dict[
    str,
    dict[tuple[str, ...], SectionRoute],
] = {
    "binary_search": {
        ("一、二分查找",):
            "find-first-and-last-position-of-element-in-sorted-array",
        # Overlap ties between 求最小／求最大／第 K 小 flip as upstream adds
        # problems; pin the chapter intro to where 二分答案 starts.
        ("二、二分答案",): ("3. 求最小",),
    },
    "data_structure": {
        ("九、根号算法", "§9.1 分块"): (
            "11. 根號演算法",
            "11.1 根號分解（Sqrt Decomposition）",
        ),
    },
    # Upstream closes these plans with a prose-only Q&A / exercise node.
    # Keep it in the same place: the last local section.
    "greedy": {
        ("答疑",): ("34. 其他",),
    },
    "grid": {
        ("介绍", "思考题"): ("1. 網格圖 DFS",),
        ("思考题",): ("4. 綜合應用",),
    },
    "sliding_window": {
        ("思考",): ("22. 分組迴圈",),
    },
    "string": {
        ("介绍", "六、字典树"): ("6. 字典樹",),
        ("六、字典树",): ("6. 字典樹",),
    },
}

MUTABLE_PROBLEM_FIELDS = ("title", "src", "solution", "isPremium")
CROSS_REFERENCE_KEYWORDS = (
    "关联题单",
    "相關題單",
    "算法题单",
    "演算法題單",
    "参见",
    "參見",
    "我的题解精选",
    "我的題解精選",
    "B站@",
)
SENTINEL_ID_MINIMUM = 1_000_000_000

_tc2sc_converter = None


@dataclass
class NodeInfo:
    """Indexed facts about one node in a study-plan tree."""

    node: dict
    parent: NodeInfo | None
    path: tuple[str, ...]
    depth: int
    order: int
    direct_slugs: frozenset[str] = frozenset()
    descendant_slugs: frozenset[str] = frozenset()

    @property
    def can_hold_problems(self) -> bool:
        return bool(self.node.get("problems")) or not self.node.get("children")


@dataclass
class TreeIndex:
    """Pre-order node index with recursive slug sets."""

    root: NodeInfo
    nodes: list[NodeInfo]
    by_identity: dict[int, NodeInfo]


@dataclass
class RouteDecision:
    """A deterministic section-routing result."""

    target: NodeInfo | None
    warning: str | None = None


@dataclass
class MergeStats:
    """Human-readable counters and diagnostics for one plan."""

    added_problems: int = 0
    refreshed_problems: int = 0
    preserved_local_problems: int = 0
    summaries_added: int = 0
    summaries_replaced: int = 0
    summaries_removed: int = 0
    warnings: list[str] = field(default_factory=list)
    mapping_failures: list[str] = field(default_factory=list)


@dataclass
class MergeResult:
    """The desired local document and its diagnostics."""

    data: dict
    changed: bool
    stats: MergeStats


@dataclass
class UpstreamProblem:
    """The preferred upstream record and its source section."""

    problem: dict
    section: NodeInfo
    safe_id: bool


@dataclass
class TopicRun:
    """Loaded result for a CLI-selected topic."""

    name: str
    local_file: Path
    result: MergeResult | None = None
    load_error: str | None = None


class SyncLoadError(RuntimeError):
    """Raised when a local or upstream plan cannot be loaded safely."""


def fetch_json(url: str) -> dict | list:
    """Download and parse one JSON resource."""
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
    """Normalize display identifiers without using them as problem identity."""
    if isinstance(problem_id, int):
        return str(problem_id)

    value = str(problem_id)
    if any("\u4e00" <= character <= "\u9fff" for character in value):
        converter = get_tc2sc_converter()
        if converter is not None:
            value = converter.convert(value)
        else:
            value = value.replace("面試題", "面试题").replace("棋盤", "棋盘")
    return value.strip()


def normalize_slug(value: object) -> str | None:
    """Return a canonical slug from a bare slug, wrapper, or problem URL."""
    if value is None:
        return None

    raw = unquote(str(value).strip())
    if not raw:
        return None

    parsed = urlparse(raw)
    path = parsed.path or raw.split("?", 1)[0].split("#", 1)[0]
    parts = [part for part in path.split("/") if part]
    if "problems" in parts:
        index = parts.index("problems")
        if index + 1 >= len(parts):
            return None
        slug = parts[index + 1]
    elif len(parts) == 1:
        slug = parts[0]
    elif not parsed.scheme and parts:
        # This also accepts slash-wrapped values such as /two-sum/.
        slug = parts[-1]
    else:
        return None

    normalized = slug.strip().lower()
    if not normalized:
        return None
    return SLUG_CORRECTIONS.get(normalized, normalized)


def problem_slug(problem: dict) -> str | None:
    """Return the normalized slug identity for a problem record."""
    return normalize_slug(problem.get("slug") or problem.get("src"))


def iter_nodes(node: dict | list) -> Iterator[dict]:
    """Yield all dictionary nodes in pre-order."""
    if isinstance(node, dict):
        yield node
        for child in node.get("children", []):
            yield from iter_nodes(child)
    else:
        for item in node:
            yield from iter_nodes(item)


def iter_problems(node: dict | list) -> Iterator[dict]:
    """Yield all problem records without deduplicating them."""
    for section in iter_nodes(node):
        for problem in section.get("problems", []):
            if isinstance(problem, dict):
                yield problem


def collect_problem_slugs(node: dict | list) -> set[str]:
    """Collect canonical problem identities from a study-plan tree."""
    return {
        slug
        for problem in iter_problems(node)
        if (slug := problem_slug(problem)) is not None
    }


def build_tree_index(root: dict) -> TreeIndex:
    """Index a tree and compute direct and descendant slug sets."""
    nodes: list[NodeInfo] = []
    by_identity: dict[int, NodeInfo] = {}

    def visit(
        node: dict,
        parent: NodeInfo | None,
        path: tuple[str, ...],
        depth: int,
    ) -> NodeInfo:
        info = NodeInfo(
            node=node,
            parent=parent,
            path=path,
            depth=depth,
            order=len(nodes),
        )
        nodes.append(info)
        by_identity[id(node)] = info

        direct = {
            slug
            for problem in node.get("problems", [])
            if isinstance(problem, dict)
            if (slug := problem_slug(problem)) is not None
        }
        descendants = set(direct)
        for child in node.get("children", []):
            if not isinstance(child, dict):
                continue
            title = str(child.get("title") or "").strip()
            child_info = visit(child, info, path + (title,), depth + 1)
            descendants.update(child_info.descendant_slugs)

        info.direct_slugs = frozenset(direct)
        info.descendant_slugs = frozenset(descendants)
        return info

    root_info = visit(root, None, (), 0)
    return TreeIndex(root=root_info, nodes=nodes, by_identity=by_identity)


def format_path(info: NodeInfo) -> str:
    """Format a section path for diagnostics."""
    return " > ".join(info.path) if info.path else "<root>"


def _route_score(
    source: NodeInfo,
    candidate: NodeInfo,
) -> tuple[object, ...] | None:
    direct_overlap = len(source.direct_slugs & candidate.direct_slugs)
    descendant_overlap = len(
        source.descendant_slugs & candidate.descendant_slugs
    )
    if descendant_overlap == 0:
        return None

    if source.direct_slugs and direct_overlap:
        return (
            1,
            direct_overlap,
            Fraction(direct_overlap, max(1, len(candidate.direct_slugs))),
            int(candidate.can_hold_problems),
            Fraction(
                descendant_overlap,
                max(1, len(source.descendant_slugs)),
            ),
            Fraction(
                descendant_overlap,
                max(1, len(candidate.descendant_slugs)),
            ),
            candidate.depth,
            -len(candidate.descendant_slugs),
        )

    return (
        0,
        Fraction(
            descendant_overlap,
            max(1, len(source.descendant_slugs)),
        ),
        Fraction(
            descendant_overlap,
            max(1, len(candidate.descendant_slugs)),
        ),
        descendant_overlap,
        candidate.depth,
        -len(candidate.descendant_slugs),
    )


def _explicit_route(
    plan_name: str,
    source: NodeInfo,
    candidates: Sequence[NodeInfo],
    overrides: dict[str, dict[tuple[str, ...], SectionRoute]],
) -> RouteDecision | None:
    anchor = overrides.get(plan_name, {}).get(source.path)
    if anchor is None:
        return None
    if isinstance(anchor, tuple):
        matches = [
            candidate
            for candidate in candidates
            if candidate.path == anchor
        ]
        if not matches:
            return RouteDecision(
                None,
                f"override for {format_path(source)} has missing local "
                f"path {' > '.join(anchor)!r}",
            )
        return RouteDecision(matches[0])

    canonical_anchor = normalize_slug(anchor)
    matches = [
        candidate
        for candidate in candidates
        if canonical_anchor in candidate.direct_slugs
    ]
    if not matches:
        return RouteDecision(
            None,
            f"override for {format_path(source)} has missing local "
            f"anchor {anchor!r}",
        )
    matches.sort(key=lambda item: (-item.depth, item.order))
    warning = None
    if len(matches) > 1:
        warning = (
            f"override anchor {anchor!r} occurs in multiple local sections; "
            f"using {format_path(matches[0])}"
        )
    return RouteDecision(matches[0], warning)


def resolve_overrides(
    overrides: dict[str, dict[tuple[str, ...], SectionRoute]] | None,
) -> dict[str, dict[tuple[str, ...], SectionRoute]]:
    """Fall back to the built-in route table when no override map is given."""
    return SECTION_ROUTE_OVERRIDES if overrides is None else overrides


def route_section(
    plan_name: str,
    source: NodeInfo,
    candidates: Sequence[NodeInfo],
    overrides: (
        dict[str, dict[tuple[str, ...], SectionRoute]] | None
    ) = None,
) -> RouteDecision:
    """Route by explicit slug anchor, then recursive slug overlap."""
    explicit = _explicit_route(
        plan_name,
        source,
        candidates,
        resolve_overrides(overrides),
    )
    if explicit is not None:
        return explicit

    scored: list[tuple[tuple[object, ...], NodeInfo]] = []
    for candidate in candidates:
        score = _route_score(source, candidate)
        if score is not None:
            scored.append((score, candidate))
    if not scored:
        return RouteDecision(None)

    best_score = max(score for score, _candidate in scored)
    tied = [
        candidate for score, candidate in scored if score == best_score
    ]
    tied.sort(key=lambda item: item.order)
    warning = None
    if len(tied) > 1:
        warning = (
            f"ambiguous overlap for {format_path(source)}; using "
            f"{format_path(tied[0])} before "
            + ", ".join(format_path(item) for item in tied[1:])
        )
    return RouteDecision(tied[0], warning)


def is_sentinel_id(problem_id: object) -> bool:
    """Return whether an ID is a known scraper/rating sentinel."""
    if isinstance(problem_id, bool) or problem_id is None:
        return False
    try:
        return int(str(problem_id)) >= SENTINEL_ID_MINIMUM
    except ValueError:
        return False


def has_safe_id(
    problem: dict,
    slug: str,
    id_to_slugs: dict[str, set[str]],
) -> bool:
    """Return whether a problem's ID unambiguously denotes exactly this slug."""
    problem_id = problem.get("id")
    if problem_id is None:
        return False
    normalized_id = normalize_id(problem_id)
    return bool(
        normalized_id
        and not is_sentinel_id(problem_id)
        and id_to_slugs.get(normalized_id) == {slug}
    )


def _problem_candidate_quality(
    problem: dict,
    slug: str,
    id_to_slugs: dict[str, set[str]],
) -> tuple[int, int, int]:
    safe_id = has_safe_id(problem, slug, id_to_slugs)
    raw_slug = str(problem.get("slug") or "")
    clean_slug = (
        bool(raw_slug)
        and not raw_slug.startswith("/")
        and "://" not in raw_slug
    )
    populated = sum(
        field_name in problem
        for field_name in MUTABLE_PROBLEM_FIELDS
    )
    return (int(safe_id), int(clean_slug), populated)


def build_upstream_problem_catalog(
    upstream_index: TreeIndex,
    stats: MergeStats,
) -> dict[str, UpstreamProblem]:
    """Choose one metadata source per slug without trusting IDs as identity."""
    records: list[tuple[dict, NodeInfo, int, str]] = []
    id_to_slugs: dict[str, set[str]] = {}

    for section in upstream_index.nodes:
        for problem in section.node.get("problems", []):
            if not isinstance(problem, dict):
                continue
            slug = problem_slug(problem)
            if slug is None:
                stats.mapping_failures.append(
                    f"upstream problem {problem.get('title')!r} in "
                    f"{format_path(section)} has no usable slug"
                )
                continue
            records.append((problem, section, len(records), slug))
            if problem.get("id") is not None:
                problem_id = normalize_id(problem["id"])
                id_to_slugs.setdefault(problem_id, set()).add(slug)

    for problem_id, slugs in sorted(id_to_slugs.items()):
        if len(slugs) > 1 or is_sentinel_id(problem_id):
            reason = "duplicate" if len(slugs) > 1 else "sentinel"
            stats.warnings.append(
                f"ignored {reason} upstream ID {problem_id!r} for identity"
            )

    by_slug: dict[str, list[tuple[dict, NodeInfo, int]]] = {}
    for problem, section, order, slug in records:
        by_slug.setdefault(slug, []).append((problem, section, order))

    catalog: dict[str, UpstreamProblem] = {}
    for slug, choices in by_slug.items():
        chosen_problem, chosen_section, _order = max(
            choices,
            key=lambda choice: (
                _problem_candidate_quality(
                    choice[0],
                    slug,
                    id_to_slugs,
                ),
                -choice[2],
            ),
        )
        catalog[slug] = UpstreamProblem(
            problem=chosen_problem,
            section=chosen_section,
            safe_id=has_safe_id(chosen_problem, slug, id_to_slugs),
        )
    return catalog


def translated_problem(problem: dict, slug: str) -> dict:
    """Translate an upstream problem and apply canonical local corrections."""
    translated = translate_dict(copy.deepcopy(problem))
    if not isinstance(translated, dict):
        raise TypeError("translated problem must remain a dictionary")
    translated["slug"] = slug
    translated.update(LOCAL_CORRECTION_ALLOWLIST.get(slug, {}))
    return translated


def refresh_existing_problem(
    local_problem: dict,
    upstream_problem: UpstreamProblem,
    slug: str,
) -> bool:
    """Refresh mutable fields while preserving an intentional null score."""
    translated = translated_problem(upstream_problem.problem, slug)
    changed = False

    for field_name in MUTABLE_PROBLEM_FIELDS:
        if field_name not in translated:
            continue
        if local_problem.get(field_name) != translated[field_name]:
            local_problem[field_name] = translated[field_name]
            changed = True

    if upstream_problem.safe_id and "id" in translated:
        if local_problem.get("id") != translated["id"]:
            local_problem["id"] = translated["id"]
            changed = True

    if local_problem.get("slug") != translated["slug"]:
        local_problem["slug"] = translated["slug"]
        changed = True

    # Local null means "look up the runtime rating"; do not materialize the
    # upstream snapshot into that field. Existing non-null values may refresh.
    if (
        "score" in translated
        and local_problem.get("score") is not None
        and local_problem.get("score") != translated["score"]
    ):
        local_problem["score"] = translated["score"]
        changed = True

    for field_name, value in LOCAL_CORRECTION_ALLOWLIST.get(slug, {}).items():
        if local_problem.get(field_name) != value:
            local_problem[field_name] = value
            changed = True

    return changed


def _record_route_warning(stats: MergeStats, decision: RouteDecision) -> None:
    if decision.warning and decision.warning not in stats.warnings:
        stats.warnings.append(decision.warning)


def find_problem_target(
    plan_name: str,
    source: NodeInfo,
    local_candidates: Sequence[NodeInfo],
    stats: MergeStats,
    overrides: dict[str, dict[tuple[str, ...], SectionRoute]] | None,
) -> NodeInfo | None:
    """Find a stable local leaf, falling back through upstream ancestors."""
    # Built-in overrides are summary-only prose mappings. Callers may provide
    # explicit problem overrides for a known all-new upstream section.
    problem_overrides = {} if overrides is None else overrides
    current: NodeInfo | None = source
    while current is not None and current.parent is not None:
        decision = route_section(
            plan_name,
            current,
            local_candidates,
            problem_overrides,
        )
        _record_route_warning(stats, decision)
        if decision.target is not None:
            return decision.target
        current = current.parent
    return None


def merge_problems(
    plan_name: str,
    local_index: TreeIndex,
    upstream_index: TreeIndex,
    stats: MergeStats,
    overrides: (
        dict[str, dict[tuple[str, ...], SectionRoute]] | None
    ) = None,
) -> None:
    """Refresh known slugs and append unseen slugs without deleting local data."""
    upstream_catalog = build_upstream_problem_catalog(upstream_index, stats)
    local_by_slug: dict[str, list[dict]] = {}
    missing_local_slug_count = 0
    for problem in iter_problems(local_index.root.node):
        slug = problem_slug(problem)
        if slug is None:
            missing_local_slug_count += 1
            continue
        local_by_slug.setdefault(slug, []).append(problem)

    stats.preserved_local_problems = (
        len(set(local_by_slug) - set(upstream_catalog))
        + missing_local_slug_count
    )

    for slug, upstream_problem in upstream_catalog.items():
        existing = local_by_slug.get(slug)
        if existing:
            for local_problem in existing:
                if refresh_existing_problem(
                    local_problem,
                    upstream_problem,
                    slug,
                ):
                    stats.refreshed_problems += 1
            continue

        local_candidates = [
            info
            for info in local_index.nodes
            if info.parent is not None and info.can_hold_problems
        ]
        target = find_problem_target(
            plan_name,
            upstream_problem.section,
            local_candidates,
            stats,
            overrides,
        )
        if target is None:
            stats.mapping_failures.append(
                f"no local section for new problem {slug!r} from "
                f"{format_path(upstream_problem.section)}"
            )
            continue

        target.node.setdefault("problems", []).append(
            translated_problem(upstream_problem.problem, slug)
        )
        local_by_slug[slug] = target.node["problems"][-1:]
        stats.added_problems += 1


def section_summary(node: dict) -> str:
    """Return a node's upstream prose, accepting the legacy content field."""
    value = node.get("summary")
    if not value:
        value = node.get("content")
    return str(value) if value else ""


# Upstream summaries carry two systematic artifacts. First, a leetcode SEO
# "banner" image whose alt text is keyword spam (and whose host is unreachable
# from many networks, so it renders as broken alt text) — always dropped.
# Second, a trailing "…模板…：" label left dangling because upstream strips the
# code block it introduces: where we have the canonical template
# (SECTION_TEMPLATES) we re-attach a C++ version, otherwise we drop the label.
_BANNER_IMAGE_RE = re.compile(r"!\[[^\]]*(?:題單|题单)[^\]]*\]\([^)]*\)\n*")
_BANNER_IMG_TAG_RE = re.compile(r"<img\b[^>]*(?:題單|题单)[^>]*>\n*")
_DANGLING_TEMPLATE_RE = re.compile(r"\n*[^\n]*模板[^\n]*[：:]\s*\Z")


_UNESCAPED_TEXTTT_HASH_RE = re.compile(r"\\texttt\{#\}")


def sanitize_summary(text: str) -> str:
    """Strip upstream keyword-spam banners and dangling template labels."""
    if not text:
        return text
    cleaned = _BANNER_IMAGE_RE.sub("", text)
    cleaned = _BANNER_IMG_TAG_RE.sub("", cleaned)
    cleaned = _DANGLING_TEMPLATE_RE.sub("", cleaned)
    # KaTeX treats a bare "#" as a macro parameter; upstream writes \texttt{#}.
    cleaned = _UNESCAPED_TEXTTT_HASH_RE.sub(r"\\texttt{\\#}", cleaned)
    if cleaned == text:
        # Preserve untouched prose byte-for-byte; only normalize whitespace
        # around content we actually removed.
        return text
    return cleaned.strip()


# Upstream stores these algorithm templates only in its legacy apps/v0 data, in
# a flattened form (<br>-joined, indentation lost, other languages only). We
# reconstruct a clean C++ version and re-attach it where the dangling "模板："
# label appears. Comments are Traditional Chinese to match the fork's prose.
_CPP_BSEARCH_MIN = """// 開區間二分模板（求最小）：回傳滿足 check(x) == true 的最小 x
// 迴圈不變量：check(left) 恆為 false，check(right) 恆為 true
int binarySearchMin(vector<int>& nums) {
    auto check = [&](int mid) -> bool {
        // 依題意判斷 mid 是否滿足要求
    };
    int left = -1, right = nums.size();  // 開區間 (left, right)，依題意設定初始邊界
    while (left + 1 < right) {           // 開區間不為空
        int mid = left + (right - left) / 2;
        if (check(mid)) {
            right = mid;  // check(mid) == true，答案在 (left, mid]
        } else {
            left = mid;   // check(mid) == false，答案在 (mid, right)
        }
    }
    return right;  // 最小的滿足 check 的值
}"""

_CPP_BSEARCH_MAX = """// 開區間二分模板（求最大）：回傳滿足 check(x) == true 的最大 x
// 迴圈不變量：check(left) 恆為 true，check(right) 恆為 false
int binarySearchMax(vector<int>& nums) {
    auto check = [&](int mid) -> bool {
        // 依題意判斷 mid 是否滿足要求
    };
    int left = -1, right = nums.size();  // 開區間 (left, right)，依題意設定初始邊界
    while (left + 1 < right) {           // 開區間不為空
        int mid = left + (right - left) / 2;
        if (check(mid)) {
            left = mid;   // 注意這裡更新的是 left，和求最小相反
        } else {
            right = mid;
        }
    }
    return left;  // check 更新的是誰，最終就回傳誰
}"""

_CPP_MONOTONIC_QUEUE = """// 單調佇列模板：計算每個長度為 k 的視窗的最大值，時間複雜度 O(n)
vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> ans(n - k + 1);  // 視窗個數
    deque<int> q;                // 雙端佇列，儲存下標
    for (int i = 0; i < n; i++) {
        // 1. 右邊入：維護佇列單調遞減
        while (!q.empty() && nums[q.back()] <= nums[i]) {
            q.pop_back();
        }
        q.push_back(i);
        // 2. 左邊出：隊首離開視窗就彈出
        int left = i - k + 1;  // 視窗左端點
        if (q.front() < left) {
            q.pop_front();
        }
        // 3. 在視窗左端點記錄答案（隊首即最大值）
        if (left >= 0) {
            ans[left] = nums[q.front()];
        }
    }
    return ans;
}"""

_CPP_LAZY_HEAP = """// 懶刪除堆模板：支援刪除堆中任意元素
// 最大堆 LazyHeap<int> maxPq; 最小堆 LazyHeap<int, greater<int>> minPq;
template <typename T, typename Compare = less<T>>
class LazyHeap {
    priority_queue<T, vector<T>, Compare> pq;
    unordered_map<T, int> remove_cnt;  // 每個元素剩餘要刪除的次數
    size_t sz = 0;                     // 堆的實際大小

    void apply_remove() {  // 正式執行延遲的刪除
        while (!pq.empty() && remove_cnt[pq.top()] > 0) {
            remove_cnt[pq.top()]--;
            pq.pop();
        }
    }

public:
    size_t size() { return sz; }

    void remove(T x) {  // 懶刪除
        remove_cnt[x]++;
        sz--;
    }

    T top() {
        apply_remove();
        return pq.top();
    }

    T pop() {
        apply_remove();
        sz--;
        T x = pq.top();
        pq.pop();
        return x;
    }

    void push(T x) {
        if (remove_cnt[x] > 0) {
            remove_cnt[x]--;  // 抵消先前的刪除
        } else {
            pq.push(x);
        }
        sz++;
    }
};"""

# plan -> list of (title keyword, intro label, C++ code). Matched when a local
# section's title contains the keyword and its summary ends with a dangling
# "模板…：" label.
SECTION_TEMPLATES: dict[str, list[tuple[str, str, str]]] = {
    "binary_search": [
        ("求最小", "開區間二分模板（求最小）：", _CPP_BSEARCH_MIN),
        ("求最大", "開區間二分模板（求最大）：", _CPP_BSEARCH_MAX),
    ],
    "data_structure": [
        ("單調佇列", "模板：", _CPP_MONOTONIC_QUEUE),
        ("懶刪除堆", "模板：", _CPP_LAZY_HEAP),
    ],
}


def template_block(label: str, code: str) -> str:
    """Render the intro label followed by a fenced C++ block."""
    return f"{label}\n\n```cpp\n{code}\n```"


def inject_section_template(plan_name: str, title: str, summary: str) -> str:
    """Replace a dangling "模板…：" label with the canonical C++ template."""
    entries = SECTION_TEMPLATES.get(plan_name)
    if not entries or not summary:
        return summary
    if not _DANGLING_TEMPLATE_RE.search(summary.rstrip()):
        return summary
    for keyword, label, code in entries:
        if keyword in title:
            base = _DANGLING_TEMPLATE_RE.sub("", summary).rstrip()
            block = template_block(label, code)
            return f"{base}\n\n{block}" if base else block
    return summary


def is_pure_navigation_node(info: NodeInfo) -> bool:
    """Return whether a slugless section is only cross-reference navigation."""
    if info.descendant_slugs:
        return False
    path_text = " > ".join(info.path)
    if any(keyword in path_text for keyword in CROSS_REFERENCE_KEYWORDS):
        return True
    summary = section_summary(info.node).lstrip()
    return bool(
        re.match(r"^(?:见|見)\s*(?:\[|【)", summary)
        or summary.startswith("GitHub 仓库")
        or summary.startswith("GitHub 倉庫")
        or summary.startswith("关注作者")
        or summary.startswith("關注作者")
    )


def merge_summaries(
    plan_name: str,
    local_index: TreeIndex,
    upstream_index: TreeIndex,
    stats: MergeStats,
    overrides: (
        dict[str, dict[tuple[str, ...], SectionRoute]] | None
    ) = None,
) -> None:
    """Replace all local prose fields with mapped current upstream summaries."""
    before: dict[int, tuple[bool, str, str]] = {}
    for info in local_index.nodes:
        node = info.node
        before[id(node)] = (
            "summary" in node or "content" in node,
            str(node.get("summary") or ""),
            str(node.get("content") or ""),
        )
        node.pop("summary", None)
        node.pop("content", None)

    pending: dict[int, list[str]] = {}

    def add_summary(target: NodeInfo, text: str) -> None:
        translated = translate_text(text)
        translated = inject_section_template(
            plan_name, str(target.node.get("title") or ""), translated
        )
        translated = sanitize_summary(translated)
        if not translated:
            return
        values = pending.setdefault(id(target.node), [])
        if translated not in values:
            values.append(translated)

    root_summary = section_summary(upstream_index.root.node)
    if root_summary:
        add_summary(local_index.root, root_summary)

    local_candidates = [
        info for info in local_index.nodes if info.parent is not None
    ]
    active_overrides = resolve_overrides(overrides)
    for source in upstream_index.nodes:
        if source.parent is None:
            continue
        summary = section_summary(source.node)
        has_override = source.path in active_overrides.get(plan_name, {})
        if not summary or (
            is_pure_navigation_node(source) and not has_override
        ):
            continue
        decision = route_section(
            plan_name,
            source,
            local_candidates,
            overrides,
        )
        _record_route_warning(stats, decision)
        if decision.target is None:
            stats.mapping_failures.append(
                f"no local section for upstream summary at "
                f"{format_path(source)}"
            )
            continue
        add_summary(decision.target, summary)

    for info in local_index.nodes:
        values = pending.get(id(info.node))
        if values:
            info.node["summary"] = "\n\n".join(values)

    for info in local_index.nodes:
        had_fields, old_summary, old_content = before[id(info.node)]
        old_text = old_summary or old_content
        new_text = str(info.node.get("summary") or "")
        if new_text and not old_text:
            stats.summaries_added += 1
        elif new_text and (
            new_text != old_text
            or bool(old_content)
            or ("content" in info.node)
        ):
            stats.summaries_replaced += 1
        elif not new_text and (old_text or had_fields):
            stats.summaries_removed += 1


def merge_plan(
    local_root: dict,
    upstream_root: dict,
    plan_name: str,
    *,
    overrides: (
        dict[str, dict[tuple[str, ...], SectionRoute]] | None
    ) = None,
) -> MergeResult:
    """Build the desired localized overlay without mutating either input."""
    if plan_name not in STUDY_PLANS:
        raise ValueError(f"unsupported study plan: {plan_name}")
    if not isinstance(local_root, dict) or not isinstance(upstream_root, dict):
        raise TypeError("study-plan roots must be JSON objects")

    merged = copy.deepcopy(local_root)
    upstream = copy.deepcopy(upstream_root)
    stats = MergeStats()
    local_index = build_tree_index(merged)
    upstream_index = build_tree_index(upstream)

    merge_problems(
        plan_name,
        local_index,
        upstream_index,
        stats,
        overrides,
    )
    merge_summaries(
        plan_name,
        local_index,
        upstream_index,
        stats,
        overrides,
    )
    # The page shows last_update as 「更新於」; follow upstream so readers can
    # tell the plan is current.
    upstream_update = upstream_root.get("last_update")
    if isinstance(upstream_update, str) and upstream_update:
        merged["last_update"] = upstream_update
    return MergeResult(data=merged, changed=merged != local_root, stats=stats)


def load_upstream(plan_name: str, base_url: str) -> dict:
    """Load and validate one upstream study-plan file."""
    url = f"{base_url.rstrip('/')}/{plan_name}.json"
    try:
        payload = fetch_json(url)
    except Exception as exc:  # noqa: BLE001
        raise SyncLoadError(
            f"failed to load upstream data from {url}: {exc}"
        ) from exc
    if not isinstance(payload, dict):
        raise SyncLoadError(f"upstream payload from {url} is not an object")
    return payload


def load_local(local_file: Path) -> dict:
    """Load and validate one local study-plan file."""
    try:
        with local_file.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except Exception as exc:  # noqa: BLE001
        raise SyncLoadError(
            f"failed to load local data from {local_file}: {exc}"
        ) from exc
    if not isinstance(payload, dict):
        raise SyncLoadError(f"local payload in {local_file} is not an object")
    return payload


def write_minified_json(path: Path, payload: dict) -> None:
    """Write the established minified, unescaped UTF-8 representation."""
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Synchronize upstream study plans into the local overlay"
    )
    parser.add_argument(
        "topics",
        nargs="*",
        metavar="TOPIC",
        help="Optional shared study-plan topic(s); defaults to all 12.",
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
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing; mapping failures still fail.",
    )
    mode.add_argument(
        "--check",
        action="store_true",
        help="Do not write and exit nonzero if any selected file would change.",
    )
    args = parser.parse_args(argv)
    invalid_topics = [
        topic for topic in args.topics if topic not in STUDY_PLANS
    ]
    if invalid_topics:
        parser.error(
            "invalid topic(s): "
            + ", ".join(invalid_topics)
            + "; choose from "
            + ", ".join(STUDY_PLANS)
        )
    return args


def selected_topics(topics: Iterable[str]) -> tuple[str, ...]:
    """Deduplicate selectors while preserving their command-line order."""
    selected = tuple(dict.fromkeys(topics))
    return selected or STUDY_PLANS


def print_topic_report(run: TopicRun, preview: bool) -> None:
    """Print useful per-topic change and failure details."""
    if run.load_error:
        print(f"  {run.name}: FAILED ({run.load_error})", file=sys.stderr)
        return
    assert run.result is not None
    result = run.result
    stats = result.stats
    if stats.mapping_failures:
        print(
            f"  {run.name}: FAILED ({len(stats.mapping_failures)} "
            "mapping failure(s))",
            file=sys.stderr,
        )
    elif result.changed:
        action = "would update" if preview else "updated"
        print(f"  {run.name}: {action}")
    else:
        print(f"  {run.name}: up to date")

    print(
        "    problems: "
        f"+{stats.added_problems} added, "
        f"{stats.refreshed_problems} refreshed, "
        f"{stats.preserved_local_problems} local-only preserved"
    )
    print(
        "    summaries: "
        f"{stats.summaries_replaced} replaced, "
        f"{stats.summaries_removed} removed, "
        f"{stats.summaries_added} added"
    )
    for warning in stats.warnings:
        print(f"    warning: {warning}")
    for failure in stats.mapping_failures:
        print(f"    error: {failure}", file=sys.stderr)


def main(argv: Sequence[str] | None = None) -> int:
    """Run the selected sync atomically with respect to validation failures."""
    args = parse_args(argv)
    topics = selected_topics(args.topics)
    local_dir = Path(args.local_dir)
    runs: list[TopicRun] = []

    for plan_name in topics:
        local_file = local_dir / f"{plan_name}.json"
        run = TopicRun(name=plan_name, local_file=local_file)
        try:
            local_data = load_local(local_file)
            upstream_data = load_upstream(plan_name, args.base_url)
            run.result = merge_plan(local_data, upstream_data, plan_name)
        except (SyncLoadError, TypeError, ValueError) as exc:
            run.load_error = str(exc)
        runs.append(run)

    failed = any(
        run.load_error
        or (
            run.result is not None
            and bool(run.result.stats.mapping_failures)
        )
        for run in runs
    )
    preview = args.dry_run or args.check or failed

    # Do not leave a partially updated set when any selected plan failed.
    if not preview:
        for run in runs:
            assert run.result is not None
            if run.result.changed:
                write_minified_json(run.local_file, run.result.data)

    for run in runs:
        print_topic_report(run, preview)

    completed = [run.result for run in runs if run.result is not None]
    changed_topics = sum(result.changed for result in completed)
    print(
        "Totals: "
        f"{len(runs)} topic(s), "
        f"{changed_topics} changed, "
        f"+{sum(result.stats.added_problems for result in completed)} "
        "problem(s), "
        f"{sum(result.stats.refreshed_problems for result in completed)} "
        "refreshed, "
        f"{sum(result.stats.summaries_replaced for result in completed)} "
        "summary replacement(s), "
        f"{sum(result.stats.summaries_removed for result in completed)} "
        "summary removal(s), "
        f"{sum(len(result.stats.warnings) for result in completed)} warning(s)"
    )

    if failed:
        return 2
    if args.check and changed_topics:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
