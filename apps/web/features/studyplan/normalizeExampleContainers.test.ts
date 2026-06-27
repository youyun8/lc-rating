import assert from "node:assert/strict";
import { test } from "node:test";

import {
  normalizeExampleContainers,
  stripExampleContainerMarkers,
} from "./normalizeExampleContainers";
import { HANDBOOK_TOPICS } from "../handbook/content";
import { lectureContentMap } from "../lecture/content";

test("converts example containers to details blocks", () => {
  const input = [
    "實作方式",
    "",
    ":::example 排序鍵：依題目目標決定升冪或降冪",
    "**1. 決定排序鍵與方向。** 先想清楚：要讓答案變大就通常從大的開始挑。",
    "",
    "```cpp",
    "// 排序鍵：依題目目標決定升冪或降冪",
    "sort(a.begin(), a.end());",
    "```",
    ":::",
  ].join("\n");

  const output = normalizeExampleContainers(input);

  assert.equal(output.includes(":::example"), false);
  assert.equal(output.includes("\n:::"), false);
  assert.match(output, /<summary>排序鍵：依題目目標決定升冪或降冪<\/summary>/);
  assert.match(output, /\*\*1\. 決定排序鍵與方向。\*\*/);
  assert.match(output, /```cpp\n\/\/ 排序鍵：依題目目標決定升冪或降冪/);
});

test("handles two-colon example typo without leaking markers", () => {
  const output = normalizeExampleContainers("::example 範例\nbody\n::");

  assert.equal(output.includes("::example"), false);
  assert.equal(output.includes("\n::"), false);
  assert.match(output, /<summary>範例<\/summary>/);
  assert.match(output, /\nbody\n/);
});

test("escapes summary titles", () => {
  const output = normalizeExampleContainers(":::example A < B & C\nbody\n:::");

  assert.match(output, /<summary>A &lt; B &amp; C<\/summary>/);
});

test("leaves directive-like text inside code fences untouched", () => {
  const input = ["```md", ":::example not a container", ":::", "```"].join(
    "\n",
  );

  assert.equal(normalizeExampleContainers(input), input);
});

test("strips example markers for plain text previews", () => {
  const output = stripExampleContainerMarkers(
    "前言\n\n:::example 排序鍵\n內容\n:::\n結尾",
  );

  assert.equal(output.includes(":::example"), false);
  assert.equal(output.includes("\n:::"), false);
  assert.match(output, /排序鍵\n內容/);
});

test("normalizes all authored lecture and handbook documents", () => {
  const rawMarker = /(^|\n)\s*:{2,}example\b|(^|\n)\s*:{2,}\s*($|\n)/m;
  const failures: string[] = [];

  function checkText(path: string, text: string) {
    if (rawMarker.test(normalizeExampleContainers(text))) {
      failures.push(`${path} normalized`);
    }
    if (rawMarker.test(stripExampleContainerMarkers(text))) {
      failures.push(`${path} preview`);
    }
  }

  function visit(path: string, value: unknown) {
    if (!value || typeof value !== "object") return;

    const record = value as Record<string, unknown>;
    for (const key of ["summary", "description", "body", "content"]) {
      const text = record[key];
      if (typeof text === "string") {
        checkText(`${path}.${key}`, text);
      }
    }

    const children = record.children;
    if (Array.isArray(children)) {
      children.forEach((child, index) =>
        visit(`${path}.children[${index}]`, child),
      );
    }

    const sections = record.sections;
    if (Array.isArray(sections)) {
      sections.forEach((section, index) =>
        visit(`${path}.sections[${index}]`, section),
      );
    }
  }

  Object.entries(lectureContentMap).forEach(([key, root]) =>
    visit(`lecture.${key}`, root),
  );
  HANDBOOK_TOPICS.forEach((topic, index) => visit(`handbook[${index}]`, topic));

  assert.deepEqual(failures, []);
});
