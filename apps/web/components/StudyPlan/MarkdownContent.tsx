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

function normalizeInlineMath(md: string) {
  return md
    .split(/(```[\s\S]*?```)/g)
    .map((segment) => {
      if (segment.startsWith("```")) {
        return segment;
      }

      // Some study plan content wraps KaTeX inline math in backticks by mistake.
      return segment.replace(/`(\${1,2}[^`\n]+?\${1,2})`/g, "$1");
    })
    .join("");
}

function createMarkup(md: string) {
  const parsed = marked.parse(normalizeInlineMath(md));
  if (typeof parsed === "string") {
    return { __html: parsed };
  }
  console.error("marked.parse returned non-string:", parsed);
  return { __html: "" };
}

interface StudyPlanMarkdownContentProps {
  content: string;
  variant?: "plan" | "section";
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

    const imageClassName =
      variant === "plan"
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
      if (
        pre.parentElement?.getAttribute("data-code-toggle") === "true"
      )
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

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className =
        "flex w-full items-center gap-2 bg-muted/25 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 cursor-pointer select-none";

      const chevron = document.createElement("span");
      chevron.className =
        "shrink-0 transition-transform duration-200 flex items-center";
      chevron.innerHTML = CHEVRON_SVG;

      const labelEl = document.createElement("span");
      labelEl.className = "font-medium truncate";
      labelEl.textContent = label;

      toggle.appendChild(chevron);
      toggle.appendChild(labelEl);

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
      wrapper.appendChild(toggle);
      wrapper.appendChild(pre);
    });
  }, [content, variant]);

  return (
    <div
      ref={innerHtml}
      className={cn(
        "prose max-w-none text-foreground dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-headings:mb-3 prose-headings:mt-6 prose-p:leading-7 prose-li:leading-7 prose-strong:text-foreground prose-a:no-underline prose-blockquote:text-foreground/80 prose-pre:my-4 prose-pre:overflow-x-auto prose-code:text-[0.95em]",
        variant === "plan"
          ? "prose-sm sm:prose-base lg:prose-lg"
          : "prose-sm sm:prose-base",
        className,
      )}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
}
