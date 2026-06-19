/**
 * Derives a stable, ASCII-only anchor id from a section title.
 * Section titles consistently start with a numeric prefix such as
 * "1. 連結串列" or "1.6 快慢指針", so we extract that prefix and
 * convert dots to dashes: "1.6 ..." → "s-1-6".
 *
 * Titles without a numeric prefix (for example Chinese-only names like
 * "模式總覽") cannot be disambiguated from each other by text alone, and
 * several distinct sections can legitimately share the same title — e.g.
 * every pattern chapter in the Q3 手冊 has its own "模式總覽" and
 * "搭配追蹤題單" page. To keep their anchors (and therefore their lecture
 * routes) unique, callers that own the section pass its stable numeric `id`,
 * which is then used as the anchor. When no id is available we fall back to a
 * slugified ASCII form, and finally to a deterministic hash of the title.
 */
export function sectionAnchor(title: string, id?: number | string): string {
  const match = title.match(/^(\d+(?:\.\d+)*)/);
  if (match) {
    return `s-${match[1]!.replace(/\./g, "-")}`;
  }
  // Non-numeric title: prefer the stable section id so that distinct sections
  // sharing the same title never collapse onto the same anchor.
  if (id !== undefined && id !== null && `${id}`.length > 0) {
    return `s-${id}`;
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
