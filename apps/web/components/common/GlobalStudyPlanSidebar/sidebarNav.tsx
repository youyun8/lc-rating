"use client";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import type { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";

export type PageType = "lecture" | "studyplan";
export type AnySection = StudyPlanData.Section | TutorialData.Section;

/**
 * Anchor for a section in the sidebar. Lecture pages route to dedicated
 * section pages whose slugs fold in the stable section id (so distinct
 * sections sharing a title, e.g. each pattern's "模式總覽", stay unique).
 * Studyplan pages scroll to in-page DOM ids that are derived from the title
 * alone, so they must keep using the title-only anchor.
 */
function sectionSlug(section: AnySection, pageType: PageType) {
  return pageType === "lecture"
    ? sectionAnchor(section.title, section.id)
    : sectionAnchor(section.title);
}

export function getSectionHref(
  section: AnySection,
  pageType: PageType,
  currentPlanKey: string | null,
) {
  if (pageType === "lecture" && currentPlanKey) {
    return `/lecture/${currentPlanKey}/${sectionSlug(section, pageType)}`;
  }

  return `#${sectionAnchor(section.title)}`;
}

interface ChapterLinkProps {
  href: string;
  isLectureLink: boolean;
  className?: string;
  children: ReactNode;
}

/** Lecture pages cross route boundaries (Next Link); studyplan uses in-page anchors. */
export function ChapterLink({
  href,
  isLectureLink,
  className,
  children,
}: ChapterLinkProps) {
  if (isLectureLink) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function countProblems(section: AnySection): number {
  const ownProblems =
    "problems" in section && section.problems ? section.problems.length : 0;

  return (
    ownProblems +
    (section.children ?? []).reduce(
      (total, child) => total + countProblems(child),
      0,
    )
  );
}

function countLeafSections(section: AnySection): number {
  const children = section.children ?? [];

  if (children.length === 0) return 1;

  return children.reduce((total, child) => total + countLeafSections(child), 0);
}

function hasActiveSection(
  section: AnySection,
  activeSlug: string | null,
  pageType: PageType,
): boolean {
  if (!activeSlug) return false;

  if (sectionSlug(section, pageType) === activeSlug) return true;

  return (section.children ?? []).some((child) =>
    hasActiveSection(child, activeSlug, pageType),
  );
}

function sectionMetric(section: AnySection, pageType: PageType) {
  if (pageType === "studyplan") {
    const problems = countProblems(section);
    return problems > 0 ? `${problems} 題` : null;
  }

  const leaves = countLeafSections(section);
  return leaves > 1 ? `${leaves} 節` : null;
}

function displayTitle(title: string) {
  return title.replace(/^\d+(?:\.\d+)*\.?\s*/, "");
}

interface SectionTreeItemProps {
  section: AnySection;
  pageType: PageType;
  currentPlanKey: string | null;
  activeSlug: string | null;
  depth?: number;
  indexLabel?: string;
}

export function SectionTreeItem({
  section,
  pageType,
  currentPlanKey,
  activeSlug,
  depth = 0,
  indexLabel,
}: SectionTreeItemProps) {
  const children = section.children ?? [];
  const hasChildren = children.length > 0;
  const href = getSectionHref(section, pageType, currentPlanKey);
  const isLectureLink = pageType === "lecture" && Boolean(currentPlanKey);
  const slug = sectionSlug(section, pageType);
  const isActive = activeSlug === slug;
  const containsActiveSection = hasActiveSection(section, activeSlug, pageType);
  const metric = sectionMetric(section, pageType);
  const branchIsOpen = depth === 0 || containsActiveSection;
  const [isOpen, setIsOpen] = useState(branchIsOpen);

  useEffect(() => {
    if (containsActiveSection) setIsOpen(true);
  }, [containsActiveSection]);

  return (
    <SidebarMenuItem>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group/tree-item relative"
      >
        <div
          className={cn(
            "group/tree-row relative flex min-w-0 items-center",
            depth > 0 && "pl-0",
          )}
        >
          {depth > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-3 top-1/2 h-px w-3 bg-sidebar-border/70",
                isActive && "bg-sidebar-primary/70",
              )}
            />
          )}
          <ChapterLink
            href={href}
            isLectureLink={isLectureLink}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-sidebar-foreground/75 outline-hidden transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              depth === 0 ? "py-2.5 text-sm" : "py-1.5 text-[13px]",
              hasChildren && "pr-8",
              containsActiveSection && !isActive && "text-sidebar-foreground",
              isActive &&
                "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--sidebar-primary)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex shrink-0 items-center justify-center text-sidebar-foreground/45 transition-colors",
                depth === 0
                  ? "h-5 w-5 rounded-md bg-sidebar-accent/70 text-[10px] font-semibold tabular-nums"
                  : "h-2 w-2 rounded-full bg-sidebar-border",
                containsActiveSection &&
                  !isActive &&
                  "bg-sidebar-primary/35 text-sidebar-primary",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground",
              )}
            >
              {depth === 0 ? indexLabel : null}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {displayTitle(section.title)}
            </span>
            {metric && (
              <span
                className={cn(
                  "ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/45",
                  isActive && "text-sidebar-accent-foreground/70",
                )}
              >
                {metric}
              </span>
            )}
          </ChapterLink>
          {hasChildren && (
            <CollapsibleTrigger
              type="button"
              className="absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/45 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden"
              aria-label={`切換 ${displayTitle(section.title)}`}
            >
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/tree-item:rotate-90" />
            </CollapsibleTrigger>
          )}
        </div>
        {hasChildren && (
          <CollapsibleContent>
            <ul
              className={cn(
                "relative ml-3 flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border/60 py-1 pl-3",
                depth > 0 && "ml-2",
              )}
            >
              {children.map((child) => (
                <SectionTreeItem
                  key={child.id}
                  section={child}
                  pageType={pageType}
                  currentPlanKey={currentPlanKey}
                  activeSlug={activeSlug}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
}
