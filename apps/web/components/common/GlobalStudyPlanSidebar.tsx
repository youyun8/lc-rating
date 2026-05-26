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
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";

type PageType = "lecture" | "studyplan";

function getSectionHref(
  section: StudyPlanData.Section | TutorialData.Section,
  pageType: PageType,
  currentPlanKey: string | null,
) {
  if (pageType === "lecture" && currentPlanKey) {
    return `/lecture/${currentPlanKey}/${sectionAnchor(section.title)}`;
  }

  return `#${sectionAnchor(section.title)}`;
}

interface SubTopicItemProps {
  section: StudyPlanData.Section | TutorialData.Section;
  pageType: PageType;
  currentPlanKey: string | null;
}

function SubTopicItem({
  section,
  pageType,
  currentPlanKey,
}: SubTopicItemProps) {
  const children = section.children ?? [];
  const hasChildren = children.length > 0;
  const href = getSectionHref(section, pageType, currentPlanKey);
  const isLectureLink = pageType === "lecture" && Boolean(currentPlanKey);

  if (hasChildren) {
    return (
      <>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild>
            {isLectureLink ? (
              <Link href={href} className="truncate">
                {section.title}
              </Link>
            ) : (
              <a href={href} className="truncate">
                {section.title}
              </a>
            )}
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSub>
          {children.map((child) => (
            <SubTopicItem
              key={child.id}
              section={child}
              pageType={pageType}
              currentPlanKey={currentPlanKey}
            />
          ))}
        </SidebarMenuSub>
      </>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        {isLectureLink ? (
          <Link href={href} className="truncate">
            {section.title}
          </Link>
        ) : (
          <a href={href} className="truncate">
            {section.title}
          </a>
        )}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
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

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r before:absolute before:inset-x-0 before:top-0 before:h-px before:brand-gradient before:opacity-70 before:animate-hairline-drift">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-2">
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
          <div className="flex items-center gap-2.5 px-2 text-lg font-bold">
            {(() => {
              const Icon = studyPlanIcons[currentPlanKey as string] || BookOpen;
              return (
                <span className="brand-gradient inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_6px_18px_-8px_rgba(168,83,186,0.6)]">
                  <Icon className="h-4 w-4" />
                </span>
              );
            })()}
            <span className="brand-text-gradient truncate">
              {currentPlanTitle}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {data && (
          <SidebarGroup>
            <SidebarGroupLabel>章節導覽</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.children.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    {section.children && section.children.length > 0 ? (
                      <>
                        <SidebarMenuButton asChild>
                          {pageType === "lecture" && currentPlanKey ? (
                            <Link
                              href={getSectionHref(
                                section,
                                pageType,
                                currentPlanKey,
                              )}
                              className="font-medium"
                            >
                              {section.title}
                            </Link>
                          ) : (
                            <a
                              href={getSectionHref(
                                section,
                                pageType,
                                currentPlanKey,
                              )}
                              className="font-medium"
                            >
                              {section.title}
                            </a>
                          )}
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {section.children.map((child) => (
                            <SubTopicItem
                              key={child.id}
                              section={child}
                              pageType={pageType}
                              currentPlanKey={currentPlanKey}
                            />
                          ))}
                        </SidebarMenuSub>
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        {pageType === "lecture" && currentPlanKey ? (
                          <Link
                            href={getSectionHref(
                              section,
                              pageType,
                              currentPlanKey,
                            )}
                            className="font-medium"
                          >
                            {section.title}
                          </Link>
                        ) : (
                          <a
                            href={getSectionHref(
                              section,
                              pageType,
                              currentPlanKey,
                            )}
                            className="font-medium"
                          >
                            {section.title}
                          </a>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
