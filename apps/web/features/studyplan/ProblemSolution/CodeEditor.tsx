"use client";

import { cn } from "@/lib/utils";
import { useMemo, type CSSProperties, type KeyboardEvent } from "react";
import { highlightCode } from "./solutionUtils";

/** Padding applied identically to the textarea and the highlight layer (px). */
const PADDING = 16;
const GUTTER_WIDTH = 48;

/**
 * Critical metrics that must match exactly between the editable textarea and
 * the highlighted layer behind it, otherwise the caret drifts from the text.
 */
const SHARED_TEXT_STYLE: CSSProperties = {
  fontFamily: "monospace",
  fontSize: 13,
  lineHeight: 1.6,
  tabSize: 2,
  fontVariantLigatures: "none",
  whiteSpace: "pre",
  padding: PADDING,
  margin: 0,
};

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * A lightweight code editor with live syntax highlighting. A transparent
 * textarea sits on top of a highlighted layer that mirrors its content, so
 * users type into the textarea while seeing colorized code.
 */
export function CodeEditor({
  value,
  language,
  onChange,
  placeholder,
  className,
  minHeight = 240,
  maxHeight = 440,
}: CodeEditorProps) {
  const lineCount = Math.max(1, value.split("\n").length);
  const html = useMemo(() => {
    const highlighted = highlightCode(value, language);
    // The browser collapses a single trailing newline in <pre>, which would
    // make the highlight layer shorter than the textarea. Pad it so heights
    // stay in sync and the caret never drifts on the last line.
    return value.endsWith("\n") ? `${highlighted}\n` : highlighted;
  }, [value, language]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    const { selectionStart, selectionEnd } = target;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = selectionStart + 2;
    });
  };

  return (
    <div
      className={cn(
        "relative overflow-auto rounded-lg border border-border/60 bg-muted/20 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15",
        className,
      )}
      style={{ maxHeight }}
    >
      <div
        lang="en"
        className="relative"
        style={{ minHeight, minWidth: "100%", width: "max-content" }}
      >
        <div
          aria-hidden
          className="absolute left-0 top-0 flex h-full select-none flex-col border-r border-border/60 bg-muted/30 pr-2 text-right text-muted-foreground/70"
          style={{
            ...SHARED_TEXT_STYLE,
            width: GUTTER_WIDTH,
            paddingLeft: 0,
            paddingRight: 8,
          }}
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre
          aria-hidden
          className="pointer-events-none select-none text-foreground"
          style={{
            ...SHARED_TEXT_STYLE,
            minWidth: "max-content",
            paddingLeft: GUTTER_WIDTH + PADDING,
            background: "transparent",
          }}
        >
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </pre>
        {value.length === 0 && placeholder ? (
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 text-muted-foreground/70"
            style={{
              ...SHARED_TEXT_STYLE,
              paddingLeft: GUTTER_WIDTH + PADDING,
            }}
          >
            {placeholder}
          </div>
        ) : null}
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent text-transparent outline-none"
          style={{
            ...SHARED_TEXT_STYLE,
            minWidth: "max-content",
            overflow: "hidden",
            paddingLeft: GUTTER_WIDTH + PADDING,
            caretColor: "var(--color-foreground)",
          }}
        />
      </div>
    </div>
  );
}
