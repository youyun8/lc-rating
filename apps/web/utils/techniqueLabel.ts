/**
 * Normalise a raw lecture "technique" / "label" table cell into clean chip text.
 *
 * Unlike the curated study-plan `subsection` field, these cells are authored as
 * teaching notes rather than tags, so they interleave the actual pattern name
 * with cross-references, reading markers, complexity, code snippets and boundary
 * caveats. A chip should show only the *pattern*, so we keep the leading pattern
 * clause and drop the surrounding teaching detail:
 *
 *   "[ADVANCED / NICHE] 前綴和佈局，查詢 O(1)；邊界：含 0 列/欄索引"  →  ["前綴和佈局"]
 *   "XOR + popcount，O(1)；邊界：相等為 0"                          →  ["XOR + popcount"]
 *   "popcount、`n&(n-1)` 清最低位 1；邊界：0、全 1"                  →  ["popcount"]
 *   "binary_search → 求最小"                                       →  ["求最小"]
 *   "陣列游標 / 雙棧"                                              →  ["陣列游標", "雙棧"]
 *
 * Design notes:
 * - A " + " compound (e.g. "XOR + popcount") names one combined technique and is
 *   kept together; only a spaced " / " (genuine "either/or" alternatives) splits
 *   into separate chips. A bare "a/b" inside a single name stays intact too.
 * - Complexity such as "O(1)" carries no LeetCode-pattern meaning and is dropped.
 * - This is intentionally NOT applied to curated study-plan subsections, some of
 *   which legitimately contain "，"/"、" (e.g. "矩形、多邊形", "先列舉，再貪心").
 */
export function normalizeTechniqueLabels(raw: string): string[] {
  let s = raw.trim();
  if (!s) return [];

  // 1. Plan-key cross-reference prefix: "binary_search → …".
  s = s.replace(/^[a-z0-9_]+\s*→\s*/, "");
  // 2. All-caps reading marker: "[ADVANCED / NICHE] …". Anchored and caps-only
  //    so it never eats a markdown link such as "[兩數相除](…)".
  s = s.replace(/^\[[A-Z][A-Z\s/]*\]\s*/, "");
  // 3. Boundary / caveat note: drop everything from the first "；" onward.
  s = s.split(/[；;]/, 1)[0]!;
  // 4. Inline-code snippets are implementation detail, not a pattern name.
  s = s.replace(/`[^`]*`/g, " ");
  // 5. Complexity annotations (O(1), Θ(n log n), Ω(…)) say nothing about pattern.
  s = s.replace(/[OΘΩ]\s*\([^)]*\)/g, " ");
  // 6. Keep only the leading pattern clause, dropping CJK elaboration that
  //    follows a "，" / "、" / fullwidth "：".
  s = s.split(/[，、：]/, 1)[0]!;
  // 7. For a CJK-led pattern, drop a trailing lower-case latin operation note
  //    left behind by step 5 (e.g. "對頂堆 add O(log n)/query" → "對頂堆").
  const head = s.trim();
  if (head.charCodeAt(0) > 0x7f) {
    s = head.replace(/\s+[a-z].*$/, "");
  }
  // 8. Tidy whitespace and any stray separators left behind by the removals.
  s = s
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s/，、]+|[\s/，、]+$/g, "")
    .trim();

  // 9. Split genuine "either/or" alternatives on a spaced " / "; dedupe.
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const part of s.split(/\s+\/\s+/)) {
    const label = part.trim();
    if (label && !seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}
