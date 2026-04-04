/**
 * Derives a stable, ASCII-only anchor id from a section title.
 * Section titles consistently start with a numeric prefix such as
 * "1. 連結串列" or "1.6 快慢指針", so we extract that prefix and
 * convert dots to dashes: "1.6 ..." → "s-1-6".
 * Falls back to a slugified version (non-ASCII chars stripped) if no
 * numeric prefix is found.
 */
export function sectionAnchor(title: string): string {
  const match = title.match(/^(\d+(?:\.\d+)*)/);
  if (match) {
    return `s-${match[1]!.replace(/\./g, "-")}`;
  }
  // Fallback: keep only ASCII alphanumerics and hyphens
  const slug = title
    .toLowerCase()
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}
