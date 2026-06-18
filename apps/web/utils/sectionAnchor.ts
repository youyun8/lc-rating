/**
 * Derives a stable, ASCII-only anchor id from a section title.
 * Section titles consistently start with a numeric prefix such as
 * "1. 連結串列" or "1.6 快慢指針", so we extract that prefix and
 * convert dots to dashes: "1.6 ..." → "s-1-6".
 * Falls back to a slugified version (non-ASCII chars stripped) if no
 * numeric prefix is found. Titles with no usable ASCII characters (for
 * example pure-Chinese section names like "滑動視窗") fall back to a
 * deterministic hash so distinct titles never collapse onto the same
 * anchor and links stay unique.
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
  if (slug) return slug;
  // No ASCII slug available (e.g. Chinese-only titles): derive a stable,
  // unique anchor from the title hash instead of a shared constant.
  return `s-${hashTitle(title)}`;
}

/** FNV-1a hash rendered in base36; stable and ASCII-safe for URL segments. */
function hashTitle(title: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
