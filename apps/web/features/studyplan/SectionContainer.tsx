"use client";

import { ProgressRing } from "@/components/common/ProgressRing";
import { useProgressMap } from "@/features/userData";
import { cn } from "@/lib/utils";
import { StudyPlanData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { BookOpenText, Check, ChevronDown, Crown } from "lucide-react";
import React, { useMemo, useState } from "react";

import { extractImageUrls, stripDuplicateImages } from "./dedupe";
import { StudyPlanMarkdownContent } from "./MarkdownContent";
import { ProblemList } from "./ProblemList";
import {
  sectionProgress,
  splitSectionTitle,
  type SectionProgress,
} from "./sectionProgress";

interface SectionContainerProps {
  section: StudyPlanData.Section;
  level?: number;
  parentImageUrls?: Set<string>;
}

const ACCENT = "var(--plan-accent, var(--primary))";

/** Whether the URL hash names this section or one of its descendants. */
function hashTargets(section: StudyPlanData.Section): boolean {
  if (typeof window === "undefined") return false;
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return false;
  const walk = (node: StudyPlanData.Section): boolean =>
    sectionAnchor(node.title) === hash || (node.children ?? []).some(walk);
  return walk(section);
}

function useSectionImages(
  summary: string,
  parentImageUrls: Set<string>,
): { summary: string; images: Set<string> } {
  const deduped = useMemo(
    () => stripDuplicateImages(summary, parentImageUrls),
    [summary, parentImageUrls],
  );
  // Children shouldn't repeat images their ancestors already showed.
  const images = useMemo(() => {
    const own = extractImageUrls(summary);
    if (own.size === 0) return parentImageUrls;
    const merged = new Set(parentImageUrls);
    for (const u of own) merged.add(u);
    return merged;
  }, [summary, parentImageUrls]);
  return { summary: deduped, images };
}

/** "重點整理" toggle that reveals a section's prose. */
function SummaryToggle({
  summary,
  label,
  defaultOpen = false,
  className,
}: {
  summary: string;
  label: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <BookOpenText className="h-3.5 w-3.5" />
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-border/60 bg-muted/25 p-4 sm:p-5">
          <StudyPlanMarkdownContent content={summary} variant="section" />
        </div>
      )}
    </div>
  );
}

function ProgressBadge({ progress }: { progress: SectionProgress }) {
  if (progress.total === 0) return null;
  const done = progress.solved === progress.total;
  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="font-num text-xs text-muted-foreground">
        {progress.solved}/{progress.total}
      </span>
      <ProgressRing
        value={progress.solved / progress.total}
        size={22}
        stroke={3}
        color={done ? "var(--success)" : ACCENT}
      >
        {done && <Check className="h-3 w-3 text-success" strokeWidth={3} />}
      </ProgressRing>
    </span>
  );
}

/** Nested sections inside a lesson card: a label strip, then bare rows. */
function SubSection({
  section,
  parentImageUrls,
}: {
  section: StudyPlanData.Section;
  parentImageUrls: Set<string>;
}) {
  const progress = useProgressMap();
  const stats = sectionProgress(section, progress);
  const { summary, images } = useSectionImages(
    section.summary ?? "",
    parentImageUrls,
  );
  const { number, label } = splitSectionTitle(section.title);
  return (
    <div
      id={sectionAnchor(section.title)}
      className="scroll-mt-[calc(var(--navbar-height)+4rem)]"
    >
      <div className="flex items-center gap-3 border-y border-border/60 bg-muted/40 px-4 py-2 sm:px-5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {number && (
            <span className="font-num mr-1.5 text-muted-foreground">
              {number}
            </span>
          )}
          {label}
        </p>
        <ProgressBadge progress={stats} />
      </div>
      {(summary || section.description) && (
        <div className="px-4 pt-3 sm:px-5">
          {section.description && (
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
          {summary && <SummaryToggle summary={summary} label="重點整理" />}
        </div>
      )}
      {section.problems && section.problems.length > 0 && (
        <ProblemList problems={section.problems} variant="flush" />
      )}
      {section.children?.map((child) => (
        <SubSection key={child.id} section={child} parentImageUrls={images} />
      ))}
    </div>
  );
}

/** Prose-only pages (導讀, 模式總覽…) as an expandable reading list. */
function ProseItem({
  section,
  depth,
  parentImageUrls,
}: {
  section: StudyPlanData.Section;
  depth: number;
  parentImageUrls: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const { summary, images } = useSectionImages(
    section.summary ?? "",
    parentImageUrls,
  );
  const { number, label } = splitSectionTitle(section.title);
  const children = section.children ?? [];
  return (
    <li
      id={sectionAnchor(section.title)}
      className="scroll-mt-[calc(var(--navbar-height)+4rem)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-2 text-left text-sm transition-colors hover:text-primary"
        style={{ paddingLeft: depth * 16 }}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
        <BookOpenText className="h-3.5 w-3.5 shrink-0 text-primary/70" />
        <span className={cn("min-w-0 flex-1", open && "font-semibold")}>
          {number && (
            <span className="font-num mr-1.5 text-xs text-muted-foreground">
              {number}
            </span>
          )}
          {label}
        </span>
        {children.length > 0 && (
          <span className="font-num shrink-0 text-[11px] text-muted-foreground">
            {children.length} 篇
          </span>
        )}
      </button>
      {open && (
        <div style={{ paddingLeft: depth * 16 + 24 }} className="pb-2">
          {section.description && (
            <p className="mb-2 text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
          {summary && (
            <div className="rounded-xl border border-border/60 bg-muted/25 p-4 sm:p-5">
              <StudyPlanMarkdownContent content={summary} variant="section" />
            </div>
          )}
          {children.length > 0 && (
            <ul className="mt-1">
              {children.map((child) => (
                <ProseItem
                  key={child.id}
                  section={child}
                  depth={0}
                  parentImageUrls={images}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

/** A practice unit: one card with its problems, collapsible when done. */
function LessonCard({
  section,
  parentImageUrls,
  chapterBody = false,
}: {
  section: StudyPlanData.Section;
  parentImageUrls: Set<string>;
  /** The card of a chapter without sub-sections: no anchor, no repeated title. */
  chapterBody?: boolean;
}) {
  const progress = useProgressMap();
  const stats = sectionProgress(section, progress);
  const complete = stats.total > 0 && stats.solved === stats.total;
  // Finished sections start folded so the page shows what's left to do,
  // unless a deep link (#anchor) points inside them.
  const [collapsed, setCollapsed] = useState(
    () => complete && !hashTargets(section),
  );
  const { summary, images } = useSectionImages(
    section.summary ?? "",
    parentImageUrls,
  );
  const { number, label } = splitSectionTitle(section.title);
  const hasProblems = stats.total > 0;
  const proseOnly = !hasProblems;
  const onlyChild =
    !section.problems?.length && section.children?.length === 1
      ? section.children[0]!
      : null;
  const soleStage =
    onlyChild &&
    (onlyChild.problems?.length ?? 0) > 0 &&
    !onlyChild.children?.length &&
    !onlyChild.summary
      ? onlyChild
      : null;

  return (
    <article
      id={chapterBody ? undefined : sectionAnchor(section.title)}
      className={cn(
        "scroll-mt-[calc(var(--navbar-height)+4rem)] overflow-hidden rounded-2xl border bg-card",
        complete ? "border-success/40" : "border-border/70",
      )}
    >
      <header className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1">
          {chapterBody ? (
            <h3 className="text-sm font-semibold text-muted-foreground">
              練習題
            </h3>
          ) : (
            <h3 className="text-[15px] font-bold leading-snug sm:text-base">
              {number && (
                <span className="font-num mr-2 text-sm font-semibold text-muted-foreground">
                  {number}
                </span>
              )}
              {label}
            </h3>
          )}
          {section.description && !chapterBody && (
            <p className="mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
          {summary && !collapsed && (
            <SummaryToggle
              summary={summary}
              label={proseOnly ? "閱讀講解" : "重點整理"}
              className="mt-1.5"
            />
          )}
        </div>
        {hasProblems && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "展開題目" : "收合題目"}
            className="flex shrink-0 items-center gap-2 rounded-lg py-1 pl-2 pr-1 transition-colors hover:bg-muted"
          >
            {complete && collapsed ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <Crown className="h-3.5 w-3.5" />
                已完成
              </span>
            ) : (
              <ProgressBadge progress={stats} />
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                !collapsed && "rotate-180",
              )}
            />
          </button>
        )}
      </header>

      {!collapsed && proseOnly && (section.children?.length ?? 0) > 0 && (
        <ul className="border-t border-border/60 px-4 py-1 sm:px-5">
          {section.children!.map((child) => (
            <ProseItem
              key={child.id}
              section={child}
              depth={0}
              parentImageUrls={images}
            />
          ))}
        </ul>
      )}
      {!collapsed && !proseOnly && (
        <div className="border-t border-border/60">
          {section.problems && section.problems.length > 0 && (
            <ProblemList problems={section.problems} variant="flush" />
          )}
          {soleStage ? (
            // A card whose only child is one stage: skip the redundant strip.
            <div
              id={sectionAnchor(soleStage.title)}
              className="scroll-mt-[calc(var(--navbar-height)+4rem)]"
            >
              <ProblemList problems={soleStage.problems!} variant="flush" />
            </div>
          ) : (
            section.children?.map((child) =>
              sectionProgress(child, progress).total === 0 ? (
                <ul
                  key={child.id}
                  className="border-t border-border/60 px-4 sm:px-5"
                >
                  <ProseItem
                    section={child}
                    depth={0}
                    parentImageUrls={images}
                  />
                </ul>
              ) : (
                <SubSection
                  key={child.id}
                  section={child}
                  parentImageUrls={images}
                />
              ),
            )
          )}
        </div>
      )}
    </article>
  );
}

/** A top-level chapter: an open header with progress, then lesson cards. */
function Chapter({
  section,
  parentImageUrls,
}: {
  section: StudyPlanData.Section;
  parentImageUrls: Set<string>;
}) {
  const progress = useProgressMap();
  const stats = sectionProgress(section, progress);
  const { summary, images } = useSectionImages(
    section.summary ?? "",
    parentImageUrls,
  );
  const { number, label } = splitSectionTitle(section.title);
  const pct = stats.total > 0 ? stats.solved / stats.total : 0;
  const complete = stats.total > 0 && stats.solved === stats.total;
  const children = section.children ?? [];
  // A chapter without sub-sections is itself the practice unit.
  const isLeaf = children.length === 0;

  return (
    <section
      id={sectionAnchor(section.title)}
      className="scroll-mt-[calc(var(--navbar-height)+4rem)]"
    >
      <header className="mb-3 flex items-start gap-3 sm:gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm sm:h-12 sm:w-12",
            complete && "bg-gold",
          )}
          style={
            complete
              ? undefined
              : { background: "var(--plan-gradient, var(--primary))" }
          }
        >
          {complete ? (
            <Crown className="h-5 w-5" />
          ) : (
            <span className="font-num">{number ?? "•"}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {label}
          </h2>
          {stats.total > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${pct * 100}%`,
                    background: complete ? "var(--gold)" : ACCENT,
                  }}
                />
              </div>
              <span className="font-num text-xs text-muted-foreground">
                {stats.solved}/{stats.total} 題
                {children.length > 0 && ` · ${children.length} 節`}
              </span>
            </div>
          )}
          {section.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
          {summary && !isLeaf && (
            <SummaryToggle
              summary={summary}
              label="本章導讀"
              className="mt-2"
            />
          )}
        </div>
      </header>

      <div className="space-y-3">
        {isLeaf ? (
          <LessonCard
            section={section}
            parentImageUrls={parentImageUrls}
            chapterBody
          />
        ) : (
          children.map((child) => (
            <LessonCard
              key={child.id}
              section={child}
              parentImageUrls={images}
            />
          ))
        )}
      </div>
    </section>
  );
}

const SectionContainer = React.memo(
  ({
    section,
    level = 0,
    parentImageUrls = new Set(),
  }: SectionContainerProps) =>
    level === 0 ? (
      <Chapter section={section} parentImageUrls={parentImageUrls} />
    ) : (
      <LessonCard section={section} parentImageUrls={parentImageUrls} />
    ),
);

SectionContainer.displayName = "SectionContainer";

export { SectionContainer };
