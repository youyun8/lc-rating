import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCodeBlockIndentation,
  normalizeMarkdownCodeBlockIndentation,
} from "./normalizeCodeBlockIndentation";

test("normalizeCodeBlockIndentation doubles 2-space indents", () => {
  const input = "for (int i = 0; i < n; ++i) {\n  seen[i] = true;\n}";
  const output = normalizeCodeBlockIndentation(input);

  assert.equal(output, "for (int i = 0; i < n; ++i) {\n    seen[i] = true;\n}");
});

test("normalizeCodeBlockIndentation leaves 4-space indents unchanged", () => {
  const input = "for (int i = 0; i < n; ++i) {\n    seen[i] = true;\n}";
  const output = normalizeCodeBlockIndentation(input);

  assert.equal(output, input);
});

test("normalizeMarkdownCodeBlockIndentation updates fenced blocks only", () => {
  const input = ["text", "```cpp", "if (ok) {", "  return 1;", "}", "```"].join(
    "\n",
  );

  const output = normalizeMarkdownCodeBlockIndentation(input);

  assert.match(output, /```cpp\nif \(ok\) \{\n {4}return 1;\n\}\n```/);
  assert.match(output, /^text$/m);
});

test("normalizeCodeBlockIndentation halves doubled 8-space indents", () => {
  const input = [
    "sort(a.begin(), a.end(),",
    "                    [](auto& a, auto& b) { return a[1] < b[1]; });",
    "for (auto& it : a) {",
    "        if (it[0] >= last) {",
    "                ++cnt;",
    "        }",
    "}",
  ].join("\n");

  const output = normalizeCodeBlockIndentation(input);
  assert.equal(
    output,
    "sort(a.begin(), a.end(),\n          [](auto& a, auto& b) { return a[1] < b[1]; });\nfor (auto& it : a) {\n    if (it[0] >= last) {\n        ++cnt;\n    }\n}",
  );
});

test("normalizeCodeBlockIndentation keeps 4-space code with aligned continuation lines", () => {
  const input = [
    "long long solve(const vector<int>& w,",
    "                const vector<int>& v) {",
    "    for (int i = 0; i < n; i++) {",
    "        g[i] = w[i];",
    "    }",
    "}",
  ].join("\n");

  assert.equal(normalizeCodeBlockIndentation(input), input);
});
