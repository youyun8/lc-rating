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
} from "@/components/ui/sidebar";
import { STUDYPLANS } from "@/config/constants";
import { studyPlanIcons } from "@/config/studyPlanThemes";
import {
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { StudyPlanData } from "@/types";

interface SubTopicItemProps {
  section: StudyPlanData.Section;
}

function SubTopicItem({ section }: SubTopicItemProps) {
  const hasChildren = section.children && section.children.length > 0;

  if (hasChildren) {
    return (
      <>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild>
            <a href={`#${section.title}`} className="truncate">
              {section.title}
            </a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSub>
          {section.children!.map((child) => (
            <SubTopicItem key={child.title} section={child} />
          ))}
        </SidebarMenuSub>
      </>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href={`#${section.title}`} className="truncate">
          {section.title}
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

/** Only renders a sidebar on study-plan detail pages (`/studyplan/[category]`). */
export function GlobalStudyPlanSidebar() {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";

  const planSegment = pathname.startsWith("/studyplan/")
    ? (pathname.replace("/studyplan/", "").split("/")[0] ?? "")
    : "";
  const isDetailPage = planSegment.length > 0;
  const currentPlanKey = isDetailPage ? planSegment : null;

  const { studyPlan } = useStudyPlan(currentPlanKey || "");

  const currentPlanTitle = currentPlanKey
    ? STUDYPLANS[currentPlanKey as keyof typeof STUDYPLANS] || currentPlanKey
    : null;

  // No sidebar on overview, contest, problemset, etc.
  if (!isDetailPage) return null;

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-2">
          <SidebarMenuButton asChild className="w-fit -ml-2">
            <Link href="/studyplan" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="text-xs">返回題單列表</span>
            </Link>
          </SidebarMenuButton>
          <div className="flex items-center gap-2 font-bold text-lg px-2">
            {(() => {
              const Icon =
                studyPlanIcons[currentPlanKey as string] || BookOpen;
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            <span className="truncate">{currentPlanTitle}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {studyPlan && (
          <SidebarGroup>
            <SidebarGroupLabel>章節導覽</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studyPlan.children.map((section) => (
                  <SidebarMenuItem key={section.title}>
                    {section.children && section.children.length > 0 ? (
                      <>
                        <SidebarMenuButton asChild>
                          <a href={`#${section.title}`} className="font-medium">
                            {section.title}
                          </a>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {section.children.map((child) => (
                            <SubTopicItem key={child.title} section={child} />
                          ))}
                        </SidebarMenuSub>
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        <a href={`#${section.title}`} className="font-medium">
                          {section.title}
                        </a>
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
