import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeTechniqueLabels } from "./techniqueLabel";

test("drops the plan-key cross-reference prefix", () => {
  assert.deepEqual(normalizeTechniqueLabels("binary_search → 求最小"), [
    "求最小",
  ]);
  assert.deepEqual(normalizeTechniqueLabels("binary_search → 其他"), ["其他"]);
});

test("keeps a bare a/b concept name intact, splits a spaced a / b", () => {
  assert.deepEqual(
    normalizeTechniqueLabels("sliding_window → 越短越合法/求最長"),
    ["越短越合法/求最長"],
  );
  assert.deepEqual(normalizeTechniqueLabels("陣列游標 / 雙棧"), [
    "陣列游標",
    "雙棧",
  ]);
});

test("keeps ' + ' compound techniques together", () => {
  assert.deepEqual(normalizeTechniqueLabels("XOR + popcount，O(1)；邊界：相等為 0"), [
    "XOR + popcount",
  ]);
  assert.deepEqual(normalizeTechniqueLabels("雜湊 + 雙向鏈結串列"), [
    "雜湊 + 雙向鏈結串列",
  ]);
});

test("strips the all-caps reading marker without touching markdown links", () => {
  assert.deepEqual(
    normalizeTechniqueLabels("[ADVANCED / NICHE] 公共前綴；邊界：跨 2 的冪歸 0"),
    ["公共前綴"],
  );
  assert.deepEqual(
    normalizeTechniqueLabels("[兩數相除](https://x)、[Pow(x, n)](https://y)"),
    ["[兩數相除](https://x)"],
  );
});

test("drops complexity, code snippets and boundary notes", () => {
  assert.deepEqual(
    normalizeTechniqueLabels("popcount、`n&(n-1)` 清最低位 1；邊界：0、全 1"),
    ["popcount"],
  );
  assert.deepEqual(
    normalizeTechniqueLabels("DP `cnt[i]=cnt[i>>1]+(i&1)`；邊界：n=0"),
    ["DP"],
  );
  assert.deepEqual(
    normalizeTechniqueLabels(
      "[ADVANCED / NICHE] 前綴和佈局，查詢 O(1)；邊界：含 0 列/欄索引",
    ),
    ["前綴和佈局"],
  );
  assert.deepEqual(
    normalizeTechniqueLabels("[ADVANCED / NICHE] 逐位統計貢獻 O(32n)；邊界：避免 O(n^2)"),
    ["逐位統計貢獻"],
  );
});

test("drops a trailing latin operation note on a CJK-led pattern", () => {
  assert.deepEqual(
    normalizeTechniqueLabels(
      "[ADVANCED / NICHE] 對頂堆 add O(log n)/query O(1)；邊界：偶數筆",
    ),
    ["對頂堆"],
  );
});

test("splits genuine either/or alternatives", () => {
  assert.deepEqual(
    normalizeTechniqueLabels("[ADVANCED / NICHE] 逐位模 3 / 狀態機；邊界：負數補碼"),
    ["逐位模 3", "狀態機"],
  );
  assert.deepEqual(normalizeTechniqueLabels("多源 BFS / 兩遍 DP；邊界：無 0、全 0"), [
    "多源 BFS",
    "兩遍 DP",
  ]);
});

test("returns an empty list for empty input", () => {
  assert.deepEqual(normalizeTechniqueLabels(""), []);
  assert.deepEqual(normalizeTechniqueLabels("   "), []);
});
