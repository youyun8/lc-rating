"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import { SidebarVisibilityButtons } from "@/features/learning/components/SidebarVisibilityButtons";
import { useProgressMap } from "@/features/userData";
import { cn } from "@/lib/utils";
import type { StudyPlanData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { useEffect, useMemo, useRef, useState } from "react";

import { sectionProgress, splitSectionTitle } from "./sectionProgress";

interface ChapterEntry {
  anchor: string;
  number: string | null;
  label: string;
  solved: number;
  total: number;
}

function useChapters(sections: StudyPlanData.Section[]): ChapterEntry[] {
  const progress = useProgressMap();
  return useMemo(
    () =>
      sections.map((section) => {
        const { number, label } = splitSectionTitle(section.title);
        return {
          anchor: sectionAnchor(section.title),
          number,
          label,
          ...sectionProgress(section, progress),
        };
      }),
    [sections, progress],
  );
}

/** The chapter currently at the top of the reading area. */
function useActiveChapter(anchors: string[]) {
  const [active, setActive] = useState<string | null>(anchors[0] ?? null);
  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // The first chapter (in document order) that is still on screen.
        const first = anchors.find((anchor) => visible.has(anchor));
        if (first) setActive(first);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    for (const anchor of anchors) {
      const el = document.getElementById(anchor);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [anchors]);
  return active;
}

function ChapterRing({
  chapter,
  size,
}: {
  chapter: ChapterEntry;
  size: number;
}) {
  const done = chapter.total > 0 && chapter.solved === chapter.total;
  return (
    <ProgressRing
      value={chapter.total > 0 ? chapter.solved / chapter.total : 0}
      size={size}
      stroke={3}
      color={done ? "var(--gold)" : "var(--plan-accent, var(--primary))"}
    >
      <span className="font-num text-[10px] font-bold">
        {chapter.number ?? "•"}
      </span>
    </ProgressRing>
  );
}

/**
 * Sticky chapter navigation with per-chapter progress: a side rail on wide
 * screens, a horizontally scrolling chip bar below that.
 */
export function ChapterNav({
  sections,
  variant,
}: {
  sections: StudyPlanData.Section[];
  variant: "rail" | "bar";
}) {
  const chapters = useChapters(sections);
  const anchors = useMemo(() => chapters.map((c) => c.anchor), [chapters]);
  const active = useActiveChapter(anchors);
  const barRef = useRef<HTMLDivElement>(null);

  // Keep the active chip visible in the horizontal bar.
  useEffect(() => {
    if (variant !== "bar" || !active) return;
    const chip = barRef.current?.querySelector<HTMLElement>(
      `[data-anchor="${active}"]`,
    );
    chip?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active, variant]);

  if (chapters.length < 2) return null;

  if (variant === "bar") {
    return (
      <div className="sticky top-[var(--navbar-height)] z-10 -mx-3 border-b border-border/60 bg-background/90 px-3 py-2 backdrop-blur-md sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 xl:hidden">
        <div
          ref={barRef}
          className="flex gap-1.5 overflow-x-auto scrollbar-none"
        >
          {chapters.map((chapter) => (
            <a
              key={chapter.anchor}
              href={`#${chapter.anchor}`}
              data-anchor={chapter.anchor}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-3 text-xs font-medium transition-colors",
                active === chapter.anchor
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <ChapterRing chapter={chapter} size={24} />
              <span className="max-w-[10rem] truncate">{chapter.label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav
      aria-label="章節"
      className="sticky top-[calc(var(--navbar-height)+1rem)] hidden max-h-[calc(100vh-var(--navbar-height)-2rem)] flex-col xl:flex"
    >
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        章節 · {chapters.length}
      </p>
      <ul className="-mr-2 flex-1 space-y-0.5 overflow-y-auto pr-2">
        {chapters.map((chapter) => {
          const isActive = active === chapter.anchor;
          const pct = chapter.total > 0 ? chapter.solved / chapter.total : 0;
          return (
            <li key={chapter.anchor}>
              <a
                href={`#${chapter.anchor}`}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-border/70"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <ChapterRing chapter={chapter} size={26} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{chapter.label}</span>
                  {isActive && chapter.total > 0 && (
                    <span className="font-num block text-[11px] font-normal text-muted-foreground">
                      {chapter.solved}/{chapter.total} · {Math.round(pct * 100)}
                      %
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 border-t border-border/60 pt-3 [&_button]:w-full [&_button]:justify-start">
        <SidebarVisibilityButtons showLabel="完整章節樹" />
      </div>
    </nav>
  );
}
