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
  const input = [
    "text",
    "```cpp",
    "if (ok) {",
    "  return 1;",
    "}",
    "```",
  ].join("\n");

  const output = normalizeMarkdownCodeBlockIndentation(input);

  assert.match(output, /```cpp\nif \(ok\) \{\n    return 1;\n\}\n```/);
  assert.match(output, /^text$/m);
});
