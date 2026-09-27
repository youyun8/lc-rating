/**
 * Markdown → print HTML for the lecture book.
 *
 * Uses the same marked + KaTeX + highlight.js stack and the same authoring
 * normalizers as the website (`features/studyplan/*`), so a formula or code
 * block that renders on the site renders identically in the book. Only the
 * interactive bits are swapped for print equivalents:
 *
 * - `:::example 標題` containers become framed boxes instead of <details>.
 * - Skeleton headings (`##`, `###`) become styled, non-outline headings so the
 *   PDF bookmarks stay at chapter / section depth.
 * - Links keep their text; external URLs are dropped from print.
 */
import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import { normalizeInlineMath } from "../../features/studyplan/markdownMath";
import { normalizeMarkdownCodeBlockIndentation } from "../../features/studyplan/normalizeCodeBlockIndentation";

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  markedKatex({ nonStandard: true, throwOnError: false, output: "html" }),
);

function escapeHtml(text: string) {
  return text.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
  );
}

/** Split markdown into lines while tracking whether we're inside a fence. */
function mapOutsideFences(md: string, fn: (line: string) => string): string {
  let inFence = false;
  return md
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : fn(line);
    })
    .join("\n");
}

/**
 * Turn `:::example title` … `:::` into an HTML box whose body is still
 * markdown (blank lines around the body make marked parse it as markdown).
 */
export function exampleContainersToBoxes(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inFence = false;
  let depth = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("```")) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence) {
      const open = t.match(/^:{2,}example\b(.*)$/);
      if (open) {
        const title = (open[1] ?? "").trim() || "範例";
        out.push(
          "",
          `<div class="example"><div class="example-title"><span class="example-tag">範例</span>${escapeHtml(title)}</div>`,
          "",
        );
        depth++;
        continue;
      }
      if (depth > 0 && /^:{2,}\s*$/.test(t)) {
        out.push("", "</div>", "");
        depth--;
        continue;
      }
    }
    out.push(line);
  }
  while (depth-- > 0) out.push("", "</div>", "");
  return out.join("\n");
}

/** Section-level headings inside the lecture body. */
const HEADING_CLASS: Record<string, string> = {
  "1": "kh kh1",
  "2": "kh kh2",
  "3": "kh kh3",
  "4": "kh kh4",
  "5": "kh kh4",
  "6": "kh kh4",
};

export interface RenderedMarkdown {
  html: string;
  /** Plain-text skeleton headings found in the body, in order. */
  headings: string[];
}

export function renderMarkdown(md: string): RenderedMarkdown {
  const headings: string[] = [];
  mapOutsideFences(md, (line) => {
    const m = line.match(/^##\s+(.+)$/);
    if (m) headings.push((m[1] ?? "").trim());
    return line;
  });

  const prepared = normalizeInlineMath(
    normalizeMarkdownCodeBlockIndentation(exampleContainersToBoxes(md)),
  );
  let html = marked.parse(prepared) as string;

  html = html
    // Demote headings to styled blocks (keeps them out of the PDF outline).
    .replace(
      /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,
      (_m, level: string, _attrs: string, inner: string) => {
        const cls = HEADING_CLASS[level] ?? "kh";
        return `<div class="${cls}">${inner}</div>`;
      },
    )
    // Print links as emphasized text; LeetCode problem links keep a marker.
    .replace(
      /<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
      (_m, href: string, inner: string) => {
        const lc = /leetcode\.(cn|com)\/problems\//.test(href);
        return `<span class="${lc ? "lc-link" : "ext-link"}">${inner}</span>`;
      },
    )
    .replace(/<pre>/g, '<pre lang="en">')
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");

  return { html, headings };
}

/**
 * Insert `snippet` (raw HTML) into markdown right after the first paragraph
 * that follows the heading `## anchor`. If the heading is absent the snippet
 * goes after the section's first paragraph. Blocks that are not plain paragraphs (code, tables, lists,
 * containers) are not split: the snippet goes before them.
 */
export function insertAfterAnchor(
  md: string,
  anchor: string,
  snippet: string,
): string {
  const lines = md.split("\n");
  const block = ["", snippet, ""];
  const h = lines.findIndex((l) => l.trim() === `## ${anchor}`);
  // Free-form sections without the skeleton: after their first paragraph.
  let i = h + 1;
  while (i < lines.length && (lines[i] ?? "").trim() === "") i++;
  const first = (lines[i] ?? "").trim();
  const special = /^(```|:::|\||[-*+]\s|>|#|\d+\.\s|<)/.test(first);
  if (!special) {
    while (i < lines.length && (lines[i] ?? "").trim() !== "") i++;
  }
  lines.splice(i, 0, ...block);
  return lines.join("\n");
}
