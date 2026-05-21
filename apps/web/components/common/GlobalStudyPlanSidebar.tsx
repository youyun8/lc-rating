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
import { googleInterviewSectionTutorials } from "@/data/googleInterviewSectionTutorials";

interface SubTopicItemProps {
  section: StudyPlanData.Section | TutorialData.Section;
}

function SubTopicItem({ section }: SubTopicItemProps) {
  const hasChildren = section.children && section.children.length > 0;

  if (hasChildren) {
    return (
      <>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild>
            <a href={`#${sectionAnchor(section.title)}`} className="truncate">
              {section.title}
            </a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSub>
          {section.children!.map((child) => (
            <SubTopicItem key={child.id} section={child} />
          ))}
        </SidebarMenuSub>
      </>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href={`#${sectionAnchor(section.title)}`} className="truncate">
          {section.title}
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

/** Renders a chapter sidebar on study-plan and tutorial detail pages. */
export function GlobalStudyPlanSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();

  const pageType = pathname.startsWith("/tutorial/")
    ? "tutorial"
    : pathname.startsWith("/studyplan/")
      ? "studyplan"
      : null;
  const planSegment = pageType
    ? (pathname.replace(`/${pageType}/`, "").split("/")[0] ?? "")
    : "";
  const isDetailPage = planSegment.length > 0;
  const currentPlanKey = isDetailPage ? planSegment : null;

  const data =
    currentPlanKey && pageType === "tutorial"
      ? tutorialDataMap[currentPlanKey]
      : currentPlanKey
        ? studyPlanDataMap[currentPlanKey]
        : null;

  const currentPlanTitle = currentPlanKey
    ? STUDYPLANS[currentPlanKey as keyof typeof STUDYPLANS] || currentPlanKey
    : null;
  const backHref = pageType === "tutorial" ? "/tutorial" : "/studyplan";
  const backLabel = pageType === "tutorial" ? "返回教學列表" : "返回題單列表";
  const googleTutorialHrefById = new Map(
    googleInterviewSectionTutorials.map((section) => [
      section.id,
      `/tutorial/google_interview/${section.slug}`,
    ]),
  );
  const useGoogleTutorialPages =
    pageType === "tutorial" && currentPlanKey === "google_interview";

  // No sidebar on overview, contest, problemset, etc.
  if (!isDetailPage) return null;

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r">
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
          <div className="flex items-center gap-2 px-2 text-lg font-bold">
            {(() => {
              const Icon = studyPlanIcons[currentPlanKey as string] || BookOpen;
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            <span className="truncate">{currentPlanTitle}</span>
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
                          <a
                            href={`#${sectionAnchor(section.title)}`}
                            className="font-medium"
                          >
                            {section.title}
                          </a>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {section.children.map((child) => (
                            <SubTopicItem key={child.id} section={child} />
                          ))}
                        </SidebarMenuSub>
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        {useGoogleTutorialPages ? (
                          <Link
                            href={
                              googleTutorialHrefById.get(section.id) ??
                              `/tutorial/google_interview/${sectionAnchor(section.title)}`
                            }
                            className="font-medium"
                          >
                            {section.title}
                          </Link>
                        ) : (
                          <a
                            href={`#${sectionAnchor(section.title)}`}
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
