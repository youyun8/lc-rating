"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { STUDYPLANS } from "@/config/constants";
import { studyPlanIcons } from "@/config/studyPlanThemes";
import { BookOpen, ChevronRight, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";
import { SectionTreeItem } from "./sidebarNav";

/** Renders a chapter sidebar on study-plan and lecture detail pages. */
export function GlobalStudyPlanSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash.slice(1));

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

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
      ? pathname.replace(`/lecture/${currentPlanKey}`, "").replace(/^\//, "") ||
        null
      : null;
  const activeSlug = pageType === "lecture" ? currentSlug : currentHash || null;

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r border-sidebar-border/70">
      <SidebarHeader className="gap-2 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <SidebarMenuButton asChild className="-ml-1 h-9 min-w-0 flex-1">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-sidebar-foreground/75 hover:text-sidebar-foreground"
            >
              <ChevronRight className="h-4 w-4 shrink-0 rotate-180" />
              <span className="truncate text-sm">{backLabel}</span>
            </Link>
          </SidebarMenuButton>
          {(isMobile ? openMobile : open) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                  return;
                }
                setOpen(false);
              }}
              aria-label="收合側欄"
              title="收合側欄"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sidebar-foreground">
          {(() => {
            const Icon = studyPlanIcons[currentPlanKey as string] || BookOpen;
            return (
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
            );
          })()}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight">
              {currentPlanTitle}
            </p>
            <p className="text-xs leading-tight text-sidebar-foreground/55">
              {pageType === "lecture" ? "講義" : "題單"}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="bg-sidebar-border/60" />
      <SidebarContent className="px-1.5 pb-3 pt-1">
        {data && (
          <SidebarGroup className="p-1">
            <SidebarGroupLabel className="h-7 px-2 text-xs font-medium text-sidebar-foreground/55">
              章節導覽
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {data.children.map((section, index) => (
                  <SectionTreeItem
                    key={section.id}
                    section={section}
                    pageType={pageType}
                    currentPlanKey={currentPlanKey}
                    activeSlug={activeSlug}
                    indexLabel={`${index + 1}`}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
      <SidebarResizeHandle />
    </Sidebar>
  );
}
