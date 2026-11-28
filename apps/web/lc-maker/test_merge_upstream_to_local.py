"""Offline tests for the study-plan localized-overlay synchronizer."""

from __future__ import annotations

import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path

import merge_upstream_to_local as sync


def make_problem(
    slug: str,
    *,
    problem_id: object = "1",
    title: str = "Title",
    score: object = None,
    src: str | None = None,
    solution: str | None = None,
    premium: bool = False,
) -> dict:
    return {
        "id": problem_id,
        "title": title,
        "slug": slug,
        "src": src or f"https://leetcode.cn/problems/{slug.strip('/')}/",
        "solution": solution,
        "score": score,
        "isPremium": premium,
    }


def make_leaf(
    title: str,
    problems: list[dict] | None = None,
    *,
    section_id: int = 2,
    summary: str | None = None,
) -> dict:
    node = {
        "id": section_id,
        "title": title,
        "isLeaf": True,
        "problems": problems or [],
        "children": [],
    }
    if summary is not None:
        node["summary"] = summary
    return node


def make_plan(
    children: list[dict],
    *,
    summary: str | None = None,
    title: str = "Local title",
) -> dict:
    root = {
        "id": 1,
        "title": title,
        "children": children,
    }
    if summary is not None:
        root["summary"] = summary
    return root


def find_section(root: dict, title: str) -> dict:
    return next(
        node
        for node in sync.iter_nodes(root)
        if node.get("title") == title
    )


class SlugIdentityTests(unittest.TestCase):
    def test_normalizes_wrappers_urls_case_and_known_typo(self) -> None:
        canonical = (
            "minimum-number-of-valid-strings-to-form-target-"
            "with-their-product"
        )
        self.assertEqual(sync.normalize_slug("/Two-Sum/"), "two-sum")
        self.assertEqual(
            sync.normalize_slug(
                "https://leetcode.cn/problems/Two-Sum/?envType=daily"
            ),
            "two-sum",
        )
        self.assertEqual(
            sync.normalize_slug(
                "minimum-number-of-valid-strings-to-form-target-"
                "with-the-product"
            ),
            canonical,
        )
        self.assertIsNone(sync.normalize_slug(None))

    def test_duplicate_and_sentinel_ids_do_not_conflate_slugs(self) -> None:
        local = make_plan(
            [
                make_leaf(
                    "Local",
                    [
                        make_problem(
                            "alpha",
                            problem_id="local-a",
                            title="Old A",
                        ),
                        make_problem(
                            "beta",
                            problem_id="local-b",
                            title="Old B",
                        ),
                    ],
                )
            ]
        )
        upstream = make_plan(
            [
                make_leaf(
                    "Upstream",
                    [
                        make_problem(
                            "/alpha/",
                            problem_id=1_000_000_000,
                            title="New A",
                        ),
                        make_problem(
                            "/beta/",
                            problem_id=1_000_000_000,
                            title="New B",
                        ),
                    ],
                )
            ]
        )

        result = sync.merge_plan(local, upstream, "binary_search")
        problems = result.data["children"][0]["problems"]
        self.assertEqual(
            [(item["slug"], item["title"]) for item in problems],
            [("alpha", "New A"), ("beta", "New B")],
        )
        self.assertEqual(
            [item["id"] for item in problems],
            ["local-a", "local-b"],
        )
        self.assertTrue(
            any("ID '1000000000'" in item for item in result.stats.warnings)
        )

    def test_lc2892_correction_matches_and_repairs_source_url(self) -> None:
        canonical = sync.LC2892_SLUG
        typo = canonical.replace("with-their-product", "with-the-product")
        local = make_plan(
            [make_leaf("Local", [make_problem(canonical, problem_id="2892")])]
        )
        upstream = make_plan(
            [
                make_leaf(
                    "Upstream",
                    [
                        make_problem(
                            typo,
                            problem_id="2892",
                            src=f"https://leetcode.cn/problems/{typo}/",
                        )
                    ],
                )
            ]
        )

        result = sync.merge_plan(local, upstream, "binary_search")
        problem = result.data["children"][0]["problems"][0]
        self.assertEqual(problem["slug"], canonical)
        self.assertEqual(
            problem["src"],
            f"https://leetcode.cn/problems/{canonical}/",
        )
        self.assertEqual(result.stats.added_problems, 0)


class ProblemMergeTests(unittest.TestCase):
    def test_refreshes_mutable_metadata_but_preserves_null_score(self) -> None:
        local_problem = make_problem(
            "shared",
            problem_id="old-id",
            title="Old",
            score=None,
            src="https://old.invalid/shared",
            solution="old solution",
            premium=False,
        )
        upstream_problem = make_problem(
            "/shared/",
            problem_id="42",
            title="New",
            score=1999,
            src="https://leetcode.cn/problems/shared/",
            solution="new solution",
            premium=True,
        )
        result = sync.merge_plan(
            make_plan([make_leaf("Local", [local_problem])]),
            make_plan([make_leaf("Upstream", [upstream_problem])]),
            "binary_search",
        )

        merged = result.data["children"][0]["problems"][0]
        self.assertEqual(merged["id"], "42")
        self.assertEqual(merged["slug"], "shared")
        self.assertEqual(merged["title"], "New")
        self.assertEqual(merged["solution"], "new solution")
        self.assertTrue(merged["isPremium"])
        self.assertIsNone(merged["score"])
        self.assertEqual(result.stats.refreshed_problems, 1)

    def test_preserves_local_only_problem_and_section_structure(self) -> None:
        local_only = make_problem(
            "local-only",
            problem_id="9001",
            title="Keep me",
            score=1777,
        )
        local = make_plan(
            [
                make_leaf(
                    "Stable local title",
                    [make_problem("shared"), local_only],
                    section_id=77,
                )
            ],
            title="Stable root title",
        )
        upstream = make_plan(
            [make_leaf("Different title", [make_problem("shared")])]
        )

        result = sync.merge_plan(local, upstream, "binary_search")
        section = result.data["children"][0]
        self.assertEqual(result.data["title"], "Stable root title")
        self.assertEqual(section["id"], 77)
        self.assertEqual(section["title"], "Stable local title")
        self.assertEqual(section["problems"][1], local_only)
        self.assertEqual(result.stats.preserved_local_problems, 1)

    def test_routes_new_problem_by_specific_direct_overlap(self) -> None:
        local = make_plan(
            [
                make_leaf(
                    "First",
                    [make_problem("anchor-a")],
                    section_id=10,
                ),
                make_leaf(
                    "Second",
                    [make_problem("anchor-b")],
                    section_id=20,
                ),
            ]
        )
        upstream = make_plan(
            [
                make_leaf(
                    "Specific",
                    [
                        make_problem("anchor-b"),
                        make_problem("new-b", problem_id="3"),
                    ],
                )
            ]
        )

        result = sync.merge_plan(local, upstream, "binary_search")
        first = find_section(result.data, "First")
        second = find_section(result.data, "Second")
        self.assertEqual(
            [item["slug"] for item in first["problems"]],
            ["anchor-a"],
        )
        self.assertEqual(
            [item["slug"] for item in second["problems"]],
            ["anchor-b", "new-b"],
        )

    def test_routes_all_new_child_via_ancestor_descendant_overlap(self) -> None:
        local = make_plan(
            [make_leaf("Target", [make_problem("existing")])]
        )
        upstream_group = {
            "title": "Group",
            "problems": [],
            "children": [
                make_leaf("Old child", [make_problem("existing")]),
                make_leaf(
                    "Brand-new child",
                    [make_problem("brand-new", problem_id="9")],
                ),
            ],
        }
        upstream = make_plan([upstream_group])

        result = sync.merge_plan(local, upstream, "binary_search")
        slugs = [
            item["slug"]
            for item in result.data["children"][0]["problems"]
        ]
        self.assertEqual(slugs, ["existing", "brand-new"])


class SummaryMergeTests(unittest.TestCase):
    def test_clears_authored_prose_and_replaces_mapped_summaries(self) -> None:
        mapped = make_leaf(
            "Mapped",
            [make_problem("shared")],
            section_id=2,
            summary="Full local lesson",
        )
        mapped["content"] = "Legacy duplicate lesson"
        local_only = make_leaf(
            "Local only",
            [make_problem("local")],
            section_id=3,
            summary="Local-only lesson",
        )
        local = make_plan(
            [mapped, local_only],
            summary="Old root lesson",
        )
        navigation = {
            "title": "关联题单",
            "summary": "[Other plan](https://example.invalid)",
            "problems": [],
            "children": [],
        }
        upstream = make_plan(
            [
                make_leaf(
                    "Current section",
                    [make_problem("shared")],
                    summary="Current upstream summary",
                ),
                navigation,
            ],
            summary="Current root summary",
        )

        result = sync.merge_plan(local, upstream, "binary_search")
        mapped_result = find_section(result.data, "Mapped")
        local_only_result = find_section(result.data, "Local only")
        self.assertEqual(
            result.data["summary"],
            "Current root summary",
        )
        self.assertEqual(
            mapped_result["summary"],
            "Current upstream summary",
        )
        self.assertNotIn("content", mapped_result)
        self.assertNotIn("summary", local_only_result)
        self.assertNotIn("content", local_only_result)
        self.assertEqual(result.stats.summaries_replaced, 2)
        self.assertEqual(result.stats.summaries_removed, 1)

    def test_explicit_path_override_routes_prose_and_new_problem(self) -> None:
        local = make_plan([make_leaf("Empty target")])
        upstream = make_plan(
            [
                make_leaf(
                    "Prose-only mapping",
                    [make_problem("new", problem_id="9")],
                    summary="Mapped prose",
                )
            ]
        )
        overrides = {
            "binary_search": {
                ("Prose-only mapping",): ("Empty target",),
            }
        }

        result = sync.merge_plan(
            local,
            upstream,
            "binary_search",
            overrides=overrides,
        )
        target = result.data["children"][0]
        self.assertEqual(target["problems"][0]["slug"], "new")
        self.assertEqual(target["summary"], "Mapped prose")
        self.assertFalse(result.stats.mapping_failures)

    def test_second_merge_is_idempotent(self) -> None:
        local = make_plan(
            [make_leaf("Local", [make_problem("shared")])],
            summary="Old",
        )
        upstream = make_plan(
            [
                make_leaf(
                    "Upstream",
                    [
                        make_problem("shared", title="New"),
                        make_problem("new", problem_id="2"),
                    ],
                    summary="Section summary",
                )
            ],
            summary="Root summary",
        )

        first = sync.merge_plan(local, upstream, "binary_search")
        second = sync.merge_plan(
            first.data,
            upstream,
            "binary_search",
        )
        self.assertTrue(first.changed)
        self.assertFalse(second.changed)
        self.assertEqual(second.stats.added_problems, 0)
        self.assertEqual(second.stats.refreshed_problems, 0)


class SanitizeSummaryTests(unittest.TestCase):
    def test_removes_keyword_spam_banner_but_keeps_prose(self) -> None:
        text = (
            "![二分題單 二分查詢 leetcode 二分]"
            "(https://pic.leetcode.cn/x-t2.png)\n\n"
            "> 圖：閉區間二分\n\n**刷題建議**：先刷簡單題。"
        )
        cleaned = sync.sanitize_summary(text)
        self.assertNotIn("pic.leetcode.cn", cleaned)
        self.assertTrue(cleaned.startswith("> 圖：閉區間二分"))
        self.assertIn("**刷題建議**", cleaned)

    def test_removes_html_img_tag_banner(self) -> None:
        text = (
            '<img src="https://pic.leetcode.cn/grid004.png" '
            'alt="網格圖題單 DFS 力扣">\n\n正文'
        )
        self.assertEqual(sync.sanitize_summary(text), "正文")

    def test_follows_upstream_last_update(self) -> None:
        local = {"id": 1, "title": "t", "last_update": "2026-02-24",
                 "children": []}
        upstream = {"id": 1, "title": "t", "last_update": "2026-11-21",
                    "children": []}
        result = sync.merge_plan(local, upstream, "graph")
        self.assertEqual(result.data["last_update"], "2026-11-21")
        self.assertTrue(result.changed)

    def test_escapes_hash_inside_texttt_for_katex(self) -> None:
        text = "$\\textit{p} + \\texttt{#} + \\textit{s}$"
        self.assertEqual(
            sync.sanitize_summary(text),
            "$\\textit{p} + \\texttt{\\#} + \\textit{s}$",
        )

    def test_removes_banner_when_alt_is_simplified(self) -> None:
        text = "![位運算题单 力扣](https://pic.leetcode.cn/and.png)\n\n正文"
        self.assertEqual(sync.sanitize_summary(text), "正文")

    def test_empties_summary_that_is_only_a_banner(self) -> None:
        text = "![資料結構題單 靈神](https://pic.leetcode.cn/prog.jfif)"
        self.assertEqual(sync.sanitize_summary(text), "")

    def test_removes_trailing_dangling_template_label(self) -> None:
        text = "推薦開區間寫二分。\n\n開區間二分模板（求最大）："
        self.assertEqual(sync.sanitize_summary(text), "推薦開區間寫二分。")

    def test_removes_bare_dangling_template_label(self) -> None:
        self.assertEqual(sync.sanitize_summary("支援刪除。\n\n模板："), "支援刪除。")

    def test_keeps_template_label_followed_by_code(self) -> None:
        text = "模板：\n\n```py\ndef f():\n    return 1\n```"
        self.assertEqual(sync.sanitize_summary(text), text)

    def test_keeps_ordinary_image_and_prose_untouched(self) -> None:
        text = "![toposort diagram](https://pic.leetcode.cn/006.png)\n\n正文"
        self.assertEqual(sync.sanitize_summary(text), text)

    def test_is_idempotent(self) -> None:
        text = (
            "![二分題單](https://pic.leetcode.cn/x.png)\n\n正文\n\n模板："
        )
        once = sync.sanitize_summary(text)
        self.assertEqual(sync.sanitize_summary(once), once)
        self.assertEqual(once, "正文")

    def test_merge_strips_banner_and_dangling_label_from_upstream(self) -> None:
        local = make_plan([make_leaf("Local", [make_problem("shared")])])
        upstream = make_plan(
            [
                make_leaf(
                    "Local",
                    [make_problem("shared")],
                    summary="推薦開區間寫二分。\n\n開區間二分模板（求最大）：",
                )
            ],
            summary=(
                "![二分題單 leetcode 二分](https://pic.leetcode.cn/x.png)\n\n"
                "> 圖：查詢第一個 8"
            ),
        )
        result = sync.merge_plan(local, upstream, "binary_search")
        section = find_section(result.data, "Local")
        self.assertNotIn("pic.leetcode.cn", result.data["summary"])
        self.assertEqual(result.data["summary"], "> 圖：查詢第一個 8")
        self.assertEqual(section["summary"], "推薦開區間寫二分。")


class SectionTemplateTests(unittest.TestCase):
    def test_fills_binary_search_max_template(self) -> None:
        text = "推薦使用開區間寫二分。\n\n開區間二分模板（求最大）："
        out = sync.inject_section_template("binary_search", "4. 求最大", text)
        self.assertIn("```cpp", out)
        self.assertIn("binarySearchMax", out)
        self.assertIn("開區間二分模板（求最大）：", out)
        self.assertTrue(out.rstrip().endswith("```"))
        # dangling label is gone (now followed by code)
        self.assertFalse(sync._DANGLING_TEMPLATE_RE.search(out.rstrip()))

    def test_fills_data_structure_bare_label_by_title(self) -> None:
        out = sync.inject_section_template("data_structure", "5.4 單調佇列", "前言\n\n模板：")
        self.assertIn("maxSlidingWindow", out)
        out2 = sync.inject_section_template("data_structure", "6.6 懶刪除堆", "前言\n\n模板：")
        self.assertIn("LazyHeap", out2)

    def test_no_template_leaves_dangling_label_for_sanitize(self) -> None:
        text = "foo\n\n模板："
        # a section we have no template for: inject is a no-op...
        self.assertEqual(sync.inject_section_template("binary_search", "9. 其他", text), text)
        # ...and sanitize then strips the dangling label
        self.assertEqual(sync.sanitize_summary(text), "foo")

    def test_non_dangling_summary_is_untouched(self) -> None:
        text = "求最大 already documented, no label here."
        self.assertEqual(sync.inject_section_template("binary_search", "4. 求最大", text), text)

    def test_merge_fills_template_end_to_end(self) -> None:
        local = make_plan([make_leaf("4. 求最大", [make_problem("shared")])])
        upstream = make_plan(
            [
                make_leaf(
                    "4. 求最大",
                    [make_problem("shared")],
                    summary="推荐使用开区间写二分。\n\n开区间二分模板（求最大）：",
                )
            ]
        )
        result = sync.merge_plan(local, upstream, "binary_search")
        section = find_section(result.data, "4. 求最大")
        self.assertIn("```cpp", section["summary"])
        self.assertIn("binarySearchMax", section["summary"])


class CliTests(unittest.TestCase):
    def _run_main(self, argv: list[str]) -> int:
        with (
            contextlib.redirect_stdout(io.StringIO()),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            return sync.main(argv)

    def test_only_twelve_shared_plans_are_supported(self) -> None:
        self.assertEqual(len(sync.STUDY_PLANS), 12)
        self.assertNotIn("weekly_contest", sync.STUDY_PLANS)
        with self.assertRaises(SystemExit):
            with contextlib.redirect_stderr(io.StringIO()):
                sync.parse_args(["weekly_contest"])

    def test_selectors_check_apply_and_idempotence_without_network(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            local_dir = root / "local"
            upstream_dir = root / "upstream"
            local_dir.mkdir()
            upstream_dir.mkdir()

            local = make_plan(
                [make_leaf("Stable", [make_problem("shared", title="Old")])]
            )
            upstream = make_plan(
                [
                    make_leaf(
                        "Changed",
                        [make_problem("shared", title="新標題")],
                        summary="Fresh summary",
                    )
                ]
            )
            local_path = local_dir / "binary_search.json"
            local_path.write_text(
                json.dumps(local, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            (upstream_dir / "binary_search.json").write_text(
                json.dumps(upstream, ensure_ascii=False),
                encoding="utf-8",
            )
            untouched = local_dir / "graph.json"
            untouched.write_text('{"untouched":true}', encoding="utf-8")
            original = local_path.read_text(encoding="utf-8")
            common = [
                "binary_search",
                "--base-url",
                upstream_dir.as_uri(),
                "--local-dir",
                str(local_dir),
            ]

            self.assertEqual(self._run_main(common + ["--dry-run"]), 0)
            self.assertEqual(
                local_path.read_text(encoding="utf-8"),
                original,
            )
            self.assertEqual(self._run_main(common + ["--check"]), 1)
            self.assertEqual(
                local_path.read_text(encoding="utf-8"),
                original,
            )
            self.assertEqual(self._run_main(common), 0)
            written = local_path.read_text(encoding="utf-8")
            self.assertNotIn("\n", written)
            self.assertIn("新標題", written)
            self.assertNotIn("\\u", written)
            self.assertEqual(untouched.read_text(), '{"untouched":true}')
            self.assertEqual(self._run_main(common + ["--check"]), 0)

    def test_mapping_failure_is_nonzero_and_blocks_apply(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            local_dir = root / "local"
            upstream_dir = root / "upstream"
            local_dir.mkdir()
            upstream_dir.mkdir()
            local = make_plan(
                [make_leaf("Existing", [make_problem("existing")])]
            )
            upstream = make_plan(
                [
                    make_leaf(
                        "Unmapped",
                        [make_problem("entirely-new")],
                        summary="Cannot route safely",
                    )
                ]
            )
            local_path = local_dir / "binary_search.json"
            original = json.dumps(local, ensure_ascii=False)
            local_path.write_text(original, encoding="utf-8")
            (upstream_dir / "binary_search.json").write_text(
                json.dumps(upstream, ensure_ascii=False),
                encoding="utf-8",
            )

            exit_code = self._run_main(
                [
                    "binary_search",
                    "--base-url",
                    upstream_dir.as_uri(),
                    "--local-dir",
                    str(local_dir),
                ]
            )
            self.assertEqual(exit_code, 2)
            self.assertEqual(local_path.read_text(encoding="utf-8"), original)

    def test_load_failure_is_nonzero_in_check_mode(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            local_dir = root / "local"
            upstream_dir = root / "upstream"
            local_dir.mkdir()
            upstream_dir.mkdir()
            (local_dir / "binary_search.json").write_text(
                json.dumps(make_plan([])),
                encoding="utf-8",
            )
            exit_code = self._run_main(
                [
                    "binary_search",
                    "--base-url",
                    upstream_dir.as_uri(),
                    "--local-dir",
                    str(local_dir),
                    "--check",
                ]
            )
            self.assertEqual(exit_code, 2)


if __name__ == "__main__":
    unittest.main()
