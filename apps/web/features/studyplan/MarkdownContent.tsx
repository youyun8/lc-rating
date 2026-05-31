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

function normalizeInlineMath(md: string) {
  return md
    .split(/(```[\s\S]*?```)/g)
    .map((segment) => {
      if (segment.startsWith("```")) {
        return segment;
      }

      // Some study plan content wraps KaTeX inline math in backticks by mistake.
      return segment
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

function createMarkup(md: string) {
  const normalizedMarkdown = normalizeInlineMath(normalizeCppCodeBlocks(md));
  const parsed = marked.parse(normalizedMarkdown);
  if (typeof parsed === "string") {
    return { __html: parsed };
  }
  console.error("marked.parse returned non-string:", parsed);
  return { __html: "" };
}

interface StudyPlanMarkdownContentProps {
  content: string;
  variant?: "plan" | "section" | "lecture";
  className?: string;
}

export function StudyPlanMarkdownContent({
  content,
  variant = "section",
  className,
}: StudyPlanMarkdownContentProps) {
  const innerHtml = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CHEVRON_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    if (!innerHtml.current) return;

    // Chrome resolves the generic `monospace` via a per-script font preference.
    // The document is lang="zh", so code would otherwise fall back to the
    // Chinese fixed-width font (e.g. NSimSun). Tagging code as English makes
    // Chrome use the Latin fixed-width font configured in the browser.
    innerHtml.current.querySelectorAll("pre, code").forEach((el) => {
      el.setAttribute("lang", "en");
    });

    const imageClassName =
      variant === "plan" || variant === "lecture"
        ? "mx-auto my-5 w-full max-w-4xl rounded-[1.5rem] border border-border/60 bg-background/80 shadow-sm"
        : "my-4 w-full rounded-2xl border border-border/60 bg-background/80 shadow-sm sm:w-2/3 md:w-1/2";

    innerHtml.current.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("style");
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.className = "font-medium text-primary underline underline-offset-4";
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
  }, [content, variant]);

  return (
    <div
      ref={innerHtml}
      className={cn(
        "prose max-w-none text-foreground dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mb-3 prose-headings:mt-6 prose-p:leading-7 prose-li:leading-7 prose-strong:text-foreground prose-a:no-underline prose-blockquote:text-foreground/80 prose-pre:my-4 prose-pre:overflow-x-hidden prose-pre:whitespace-pre-wrap prose-pre:break-words prose-code:text-[0.95em]",
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
