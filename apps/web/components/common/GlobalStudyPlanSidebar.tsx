"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { STUDYPLANS } from "@/config/constants";
import { studyPlanIcons } from "@/config/studyPlanThemes";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";

type PageType = "lecture" | "studyplan";
type AnySection = StudyPlanData.Section | TutorialData.Section;

function getSectionHref(
  section: AnySection,
  pageType: PageType,
  currentPlanKey: string | null,
) {
  if (pageType === "lecture" && currentPlanKey) {
    return `/lecture/${currentPlanKey}/${sectionAnchor(section.title)}`;
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
function ChapterLink({
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

interface SubTopicItemProps {
  section: AnySection;
  pageType: PageType;
  currentPlanKey: string | null;
  currentSlug: string | null;
}

function SubTopicItem({
  section,
  pageType,
  currentPlanKey,
  currentSlug,
}: SubTopicItemProps) {
  const children = section.children ?? [];
  const hasChildren = children.length > 0;
  const href = getSectionHref(section, pageType, currentPlanKey);
  const isLectureLink = pageType === "lecture" && Boolean(currentPlanKey);
  const isActive =
    isLectureLink && currentSlug === sectionAnchor(section.title);

  return (
    <>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isActive}>
          <ChapterLink
            href={href}
            isLectureLink={isLectureLink}
            className={cn("truncate", isActive && "font-semibold")}
          >
            {section.title}
          </ChapterLink>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
      {hasChildren && (
        <SidebarMenuSub>
          {children.map((child) => (
            <SubTopicItem
              key={child.id}
              section={child}
              pageType={pageType}
              currentPlanKey={currentPlanKey}
              currentSlug={currentSlug}
            />
          ))}
        </SidebarMenuSub>
      )}
    </>
  );
}

/** Renders a chapter sidebar on study-plan and lecture detail pages. */
export function GlobalStudyPlanSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();

  const pageType = pathname.startsWith("/lecture/")
    ? "lecture"
    : pathname.startsWith("/studyplan/")
      ? "studyplan"
      : null;
  const planSegment = pageType
    ? (pathname.replace(`/${pageType}/`, "").split("/")[0] ?? "")
    : "";
  const isDetailPage = Boolean(
    STUDYPLANS[planSegment as keyof typeof STUDYPLANS],
  );
  const currentPlanKey = isDetailPage ? planSegment : null;

  // No sidebar on overview, contest, problemset, etc.
  if (!isDetailPage || !pageType || !currentPlanKey) return null;

  const data =
    pageType === "lecture"
      ? tutorialDataMap[currentPlanKey]
      : studyPlanDataMap[currentPlanKey];

  const currentPlanTitle =
    STUDYPLANS[currentPlanKey as keyof typeof STUDYPLANS] || currentPlanKey;
  const backHref = pageType === "lecture" ? "/lecture" : "/studyplan";
  const backLabel = pageType === "lecture" ? "返回講義列表" : "返回題單列表";

  const currentSlug =
    pageType === "lecture"
      ? (pathname.replace(`/lecture/${currentPlanKey}`, "").replace(/^\//, "") ||
        null)
      : null;

  const isLectureLink = pageType === "lecture" && Boolean(currentPlanKey);

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r before:absolute before:inset-x-0 before:top-0 before:h-px before:brand-gradient before:opacity-70 before:animate-hairline-drift">
      <SidebarHeader className="gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <SidebarMenuButton asChild className="w-fit -ml-2">
            <Link
              href={backHref}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="text-xs">{backLabel}</span>
            </Link>
          </SidebarMenuButton>
          {(isMobile ? openMobile : open) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 border border-sidebar-border/60 bg-transparent px-2.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                  return;
                }
                setOpen(false);
              }}
            >
              隱藏側欄
            </Button>
          )}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar-accent/30 via-sidebar/60 to-sidebar p-3">
          <span
            aria-hidden
            className="brand-gradient absolute inset-x-0 top-0 h-px opacity-70"
          />
          <div className="flex items-center gap-2.5">
            {(() => {
              const Icon = studyPlanIcons[currentPlanKey as string] || BookOpen;
              return (
                <span className="brand-gradient inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
              );
            })()}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {pageType === "lecture" ? "講義" : "題單"}
              </p>
              <p className="brand-text-gradient truncate text-base font-bold leading-tight">
                {currentPlanTitle}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {data && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
              章節導覽
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {data.children.map((section, index) => {
                  const href = getSectionHref(
                    section,
                    pageType,
                    currentPlanKey,
                  );
                  const isActive =
                    isLectureLink &&
                    currentSlug === sectionAnchor(section.title);
                  const hasChildren =
                    section.children && section.children.length > 0;

                  return (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="group/chapter h-auto py-2"
                      >
                        <ChapterLink
                          href={href}
                          isLectureLink={isLectureLink}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold tabular-nums transition-colors",
                              isActive
                                ? "border-transparent bg-sidebar-primary/15 text-sidebar-primary"
                                : "border-sidebar-border/60 text-muted-foreground/80 group-hover/chapter:border-sidebar-primary/40 group-hover/chapter:text-sidebar-primary",
                            )}
                          >
                            {index + 1}
                          </span>
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              isActive && "font-semibold text-sidebar-primary",
                            )}
                          >
                            {section.title}
                          </span>
                        </ChapterLink>
                      </SidebarMenuButton>
                      {hasChildren && (
                        <SidebarMenuSub className="mt-0.5 gap-0.5 border-l-sidebar-border/60 pl-3">
                          {section.children!.map((child) => (
                            <SubTopicItem
                              key={child.id}
                              section={child}
                              pageType={pageType}
                              currentPlanKey={currentPlanKey}
                              currentSlug={currentSlug}
                            />
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
