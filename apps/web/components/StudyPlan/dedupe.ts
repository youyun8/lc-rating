const MD_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

/** Extract all image URLs from a markdown string. */
export function extractImageUrls(md: string): Set<string> {
  const urls = new Set<string>();
  for (const m of md.matchAll(MD_IMAGE_RE)) {
    urls.add(m[1]!);
  }
  return urls;
}

/**
 * Remove markdown image tags whose URL appears in `imageUrls`.
 * Also strips blank lines left behind after removal.
 */
export function stripDuplicateImages(
  md: string,
  imageUrls: Set<string>,
): string {
  if (imageUrls.size === 0) return md;

  const cleaned = md.replace(MD_IMAGE_RE, (match, url: string) =>
    imageUrls.has(url) ? "" : match,
  );

  // Collapse runs of 3+ newlines into 2
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
