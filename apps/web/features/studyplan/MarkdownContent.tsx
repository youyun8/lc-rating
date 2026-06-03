"use client";

import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import markedKatex from "marked-katex-extension";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import React, { useEffect, useRef } from "react";

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  markedKatex({
    nonStandard: true,
    throwOnError: false,
    output: "html",
  }),
);

function normalizeCppCodeBlocks(md: string) {
  return md.replace(
    /```(cpp|c\+\+|cc|cxx)\n([\s\S]*?)```/g,
    (_, lang: string, code: string) =>
      `\`\`\`${lang}\n${expandCppSingleLineControlBodies(code)}\`\`\``,
  );
}

function expandCppSingleLineControlBodies(code: string) {
  let result = code;

  for (let pass = 0; pass < 4; pass++) {
    const next = result
      .split("\n")
      .map(expandCppSingleLineControlBody)
      .join("\n");

    if (next === result) {
      return result;
    }
    result = next;
  }

  return result;
}

function expandCppSingleLineControlBody(line: string) {
  const parsed = parseCppSingleLineControlBody(line);

  if (!parsed) {
    return line;
  }

  const { indent, head, body } = parsed;
  return `${indent}${head} {\n${indent}    ${body}\n${indent}}`;
}

function parseCppSingleLineControlBody(line: string) {
  const indent = line.match(/^\s*/)?.[0] ?? "";
  const rest = line.slice(indent.length);

  if (rest.startsWith("}")) {
    return null;
  }

  const elseMatch = rest.match(/^else\s+(.+)$/);
  if (elseMatch && !rest.startsWith("else if")) {
    return parseCppSingleLineBody(indent, "else", elseMatch[1] ?? "");
  }

  const keywordMatch = rest.match(/^(else\s+if|if|for|while)\s*\(/);
  if (!keywordMatch) {
    return null;
  }

  const keyword = keywordMatch[1]!;
  const openParenIndex = rest.indexOf("(", keyword.length);
  const closeParenIndex = findMatchingParen(rest, openParenIndex);

  if (closeParenIndex === -1) {
    return null;
  }

  const head = rest.slice(0, closeParenIndex + 1);
  const body = rest.slice(closeParenIndex + 1).trim();
  return parseCppSingleLineBody(indent, head, body);
}

function parseCppSingleLineBody(indent: string, head: string, body: string) {
  const bodyWithoutComment = body.replace(/\s*\/\/.*$/, "");

  if (
    !bodyWithoutComment.endsWith(";") ||
    bodyWithoutComment.slice(0, -1).includes(";") ||
    /[{}]/.test(bodyWithoutComment)
  ) {
    return null;
  }

  return { indent, head, body };
}

function findMatchingParen(text: string, openParenIndex: number) {
  let depth = 0;

  for (let i = openParenIndex; i < text.length; i++) {
    if (text[i] === "(") {
      depth++;
    } else if (text[i] === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

// Greek letters used in asymptotic notation (e.g. `O(α(n))`, `Θ(n)`) mapped to
// their LaTeX commands so KaTeX renders them as real symbols.
const GREEK_TO_LATEX: Record<string, string> = {
  α: "\\alpha",
  β: "\\beta",
  γ: "\\gamma",
  δ: "\\delta",
  ε: "\\epsilon",
  ζ: "\\zeta",
  η: "\\eta",
  θ: "\\theta",
  λ: "\\lambda",
  μ: "\\mu",
  π: "\\pi",
  ρ: "\\rho",
  σ: "\\sigma",
  τ: "\\tau",
  φ: "\\phi",
  χ: "\\chi",
  ψ: "\\psi",
  ω: "\\omega",
  Γ: "\\Gamma",
  Δ: "\\Delta",
  Θ: "\\Theta",
  Λ: "\\Lambda",
  Σ: "\\Sigma",
  Φ: "\\Phi",
  Ω: "\\Omega",
};

// Convert backtick-wrapped complexity expressions (e.g. `O(n log n)`,
// `O(2^{n/2})`, `O(α(n))`) into KaTeX inline math so symbols and superscripts
// render properly. Gating is structural — the span must look like asymptotic
// notation, e.g. O(...), Θ(...), Ω(...) — rather than relying on a character
// allow-list (which silently dropped valid math such as Greek letters). Spans
// describing things in CJK (e.g. `O(不同前綴狀態數)`) are intentionally left as
// inline code, and any expression KaTeX cannot parse falls back gracefully
// because the renderer is configured with `throwOnError: false`.
function complexityToKatex(text: string) {
  return text.replace(/`([^`\n]+)`/g, (match, inner: string) => {
    const expr = inner.trim();
    if (!/^[OΘΩ]\(.+\)$/.test(expr)) return match;
    if (/[\u3400-\u9fff\uf900-\ufaff]/.test(expr)) return match;
    const latex = expr
      // Accept every spelling of the radicand — `sqrt(n)`, `sqrt{n}`, and the
      // bare `sqrt n` (the space-separated form used alongside `O(n log n)`).
      // Without the bare case, KaTeX rendered the literal letters s·q·r·t·n,
      // i.e. the "O(sqrtn)" glitch.
      .replace(/\bsqrt\s*\(\s*([^()]*?)\s*\)/g, "\\sqrt{$1}")
      .replace(/\bsqrt\s*\{\s*([^{}]*?)\s*\}/g, "\\sqrt{$1}")
      .replace(/\bsqrt\s+([A-Za-z0-9]+)/g, "\\sqrt{$1}")
      .replace(/\blog\b/g, "\\log")
      // Map bare min/max operators to their LaTeX commands so KaTeX renders
      // them upright instead of as the italic letters m\u00b7i\u00b7n / m\u00b7a\u00b7x (the same
      // glitch class as the `sqrt`/`log` cases above).
      .replace(/\bmin\b/g, "\\min")
      .replace(/\bmax\b/g, "\\max")
      // Brace multi-letter snake_case runs so authors don't have to. Without
      // this, `count_cost` renders as `count` with a stray single-char
      // subscript (count_c \u00b7 ost); a bare `number_of_ones` would even trip
      // KaTeX's "double subscript" error. We turn the first underscore into a
      // real subscript covering the whole trailing run and escape any further
      // underscores inside it. Single-letter subscripts (`a_i`, `n_2`) already
      // render correctly and are intentionally left alone.
      .replace(
        /([A-Za-z][A-Za-z0-9]*)_([A-Za-z0-9]{2,}(?:_[A-Za-z0-9]+)*)/g,
        (_m, base: string, run: string) =>
          `${base}_{${run.replace(/_/g, "\\_")}}`,
      )
      .replace(/[\u0370-\u03ff]/g, (g) => GREEK_TO_LATEX[g] ?? g)
      .replace(/\s*\*\s*/g, " \\cdot ");
    return `$${latex}$`;
  });
}

function normalizeInlineMath(md: string) {
  return md
    .split(/(```[\s\S]*?```)/g)
    .map((segment) => {
      if (segment.startsWith("```")) {
        return segment;
      }

      // Some study plan content wraps KaTeX inline math in backticks by mistake.
      return complexityToKatex(segment)
        .replace(/`(\${1,2}[^`\n]+?\${1,2})`/g, "$1")
        .replace(/(^|[^$])\$([^$\n]+)\$(?!\$)/g, (match, prefix, math) => {
          if (shouldRenderAsPlainText(math)) {
            return `${prefix}${math}`;
          }

          return match;
        });
    })
    .join("");
}

function shouldRenderAsPlainText(math: string) {
  const normalized = math.trim();

  if (/[\u3400-\u9fff]/.test(normalized)) {
    return true;
  }

  return /^\([A-Za-z_][\w\s,]*\)$/.test(normalized);
}

const LEETCODE_HOST_RE = /leetcode\.(cn|com)/i;

function isLeetCodeLink(href: string | null) {
  return !!href && LEETCODE_HOST_RE.test(href);
}

function createMarkup(md: string) {
  const normalizedMarkdown = normalizeInlineMath(normalizeCppCodeBlocks(md));
  const parsed = marked.parse(normalizedMarkdown);
  if (typeof parsed === "string") {
    // Tag code as English so Chrome resolves the generic `monospace` via the
    // browser's Latin fixed-width font. The document is lang="zh", which would
    // otherwise make Chrome pick the Chinese fixed-width font (e.g. NSimSun)
    // even for Latin code. Done here (not in an effect) so the attribute is in
    // the server-rendered HTML regardless of hydration.
    const withCodeLang = parsed
      .replace(/<pre>/g, '<pre lang="en">')
      .replace(/<code/g, '<code lang="en"');
    return { __html: withCodeLang };
  }
  console.error("marked.parse returned non-string:", parsed);
  return { __html: "" };
}

interface StudyPlanMarkdownContentProps {
  content: string;
  variant?: "plan" | "section" | "lecture";
  className?: string;
  /**
   * Give LeetCode links a distinct color and render `ID | Problem | …` tables as
   * 講義-style problem lists. Opt-in (used by the handbook).
   */
  enhanceLeetCode?: boolean;
}

export function StudyPlanMarkdownContent({
  content,
  variant = "section",
  className,
  enhanceLeetCode = false,
}: StudyPlanMarkdownContentProps) {
  const innerHtml = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CHEVRON_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    if (!innerHtml.current) return;

    const imageClassName =
      variant === "plan" || variant === "lecture"
        ? "mx-auto my-5 w-full max-w-4xl rounded-[1.5rem] border border-border/60 bg-background/80 shadow-sm"
        : "my-4 w-full rounded-2xl border border-border/60 bg-background/80 shadow-sm sm:w-2/3 md:w-1/2";

    innerHtml.current.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("style");
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      if (enhanceLeetCode && isLeetCodeLink(link.getAttribute("href"))) {
        link.className =
          "font-medium text-orange-600 underline underline-offset-4 dark:text-orange-400";
      } else {
        link.className =
          "font-medium text-primary underline underline-offset-4";
      }
    });

    innerHtml.current.querySelectorAll("img").forEach((img) => {
      img.removeAttribute("style");
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      img.className = imageClassName;
    });

    // Wrap each <pre> code block in a collapsible toggle container
    innerHtml.current.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.getAttribute("data-code-toggle") === "true")
        return;

      // Extract label from the first comment line
      const codeEl = pre.querySelector("code");
      const codeText = codeEl?.textContent ?? "";
      const firstLine =
        codeText.split("\n").find((l) => l.trim().length > 0) ?? "";
      const commentMatch = firstLine.match(/^\/\/\s*(.+)/);
      const label = commentMatch?.[1]?.trim() ?? "程式碼";

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-toggle", "true");
      wrapper.className =
        "not-prose my-4 overflow-hidden rounded-xl border border-border/60";

      const header = document.createElement("div");
      header.className =
        "flex w-full items-center gap-2 bg-muted/25 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className =
        "flex min-w-0 flex-1 cursor-pointer select-none items-center gap-2 text-left";

      const chevron = document.createElement("span");
      chevron.className =
        "shrink-0 transition-transform duration-200 flex items-center";
      chevron.innerHTML = CHEVRON_SVG;

      const labelEl = document.createElement("span");
      labelEl.className = "min-w-0 flex-1 truncate font-medium";
      labelEl.textContent = label;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className =
        "ml-auto shrink-0 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
      copyButton.textContent = "複製";
      copyButton.addEventListener("click", async (event) => {
        event.stopPropagation();

        try {
          await navigator.clipboard.writeText(codeText.trimEnd());
          copyButton.textContent = "已複製";
          window.setTimeout(() => {
            copyButton.textContent = "複製";
          }, 1200);
        } catch {
          copyButton.textContent = "複製失敗";
          window.setTimeout(() => {
            copyButton.textContent = "複製";
          }, 1200);
        }
      });

      toggle.appendChild(chevron);
      toggle.appendChild(labelEl);
      header.appendChild(toggle);
      header.appendChild(copyButton);

      // Start collapsed
      pre.style.display = "none";
      pre.style.margin = "0";
      pre.style.borderRadius = "0";
      pre.style.borderTop = "1px solid hsl(var(--border) / 0.6)";

      toggle.addEventListener("click", () => {
        const isHidden = pre.style.display === "none";
        pre.style.display = isHidden ? "" : "none";
        chevron.style.transform = isHidden ? "rotate(90deg)" : "";
      });

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });
  }, [content, variant, enhanceLeetCode]);

  return (
    <div
      ref={innerHtml}
      className={cn(
        "prose max-w-none text-foreground dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mb-3 prose-headings:mt-6 prose-p:leading-7 prose-li:leading-7 prose-strong:text-foreground prose-a:no-underline prose-blockquote:text-foreground/80 prose-pre:my-4 prose-code:text-[0.95em]",
        // Long code lines wrap on narrow screens (readable on phones); the
        // handbook switches to one-line + horizontal scroll at lg and up.
        enhanceLeetCode
          ? "prose-pre:overflow-x-hidden prose-pre:whitespace-pre-wrap prose-pre:break-words lg:prose-pre:overflow-x-auto lg:prose-pre:whitespace-pre lg:prose-pre:break-normal"
          : "prose-pre:overflow-x-hidden prose-pre:whitespace-pre-wrap prose-pre:break-words",
        variant === "lecture"
          ? "prose-base lg:prose-lg prose-p:leading-8 prose-li:leading-8"
          : variant === "plan"
            ? "prose-sm sm:prose-base lg:prose-lg"
            : "prose-sm sm:prose-base",
        className,
      )}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
}
