"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Lightbulb } from "lucide-react";
import { useState, type ReactNode } from "react";

interface HandbookExampleProps {
  /** Card heading, shown after a 「例題：」 prefix (e.g. "Maximum XOR (LC 421)"). */
  title: string;
  /** The worked-example body (prose + code), rendered inside the card. */
  children: ReactNode;
}

/**
 * A collapsible "例題講解" (worked-example) card styled as a lime admonition:
 * a left accent bar, a Lightbulb glyph, and a chevron that rotates on expand.
 *
 * Collapsed by default so the conceptual flow of a section stays compact and
 * readers expand individual walkthroughs on demand. The body stays mounted and
 * is hidden via CSS (not unmounted) so KaTeX renders once and in-page search
 * (Ctrl+F) and anchor links keep working — matching the code-block toggles in
 * {@link StudyPlanMarkdownContent}.
 */
export function HandbookExample({ title, children }: HandbookExampleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="not-prose my-4 overflow-hidden rounded-xl border border-lime-500/30 border-l-4 border-l-lime-500 bg-lime-500/5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer select-none items-center gap-2 bg-lime-500/10 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-lime-500/15"
      >
        <Lightbulb className="h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" />
        <span className="min-w-0 flex-1">
          <span className="text-lime-700 dark:text-lime-300">例題：</span>
          {title}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>
      <div className={cn("px-4 py-3", !open && "hidden")}>{children}</div>
    </div>
  );
}
