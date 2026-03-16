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
import {
  BookOpen,
  Search,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Zap,
  Grid,
  Calculator,
  Maximize,
  Type,
  Trees,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { StudyPlanData } from "@/types";

const icons: Record<string, LucideIcon> = {
  binary_search: Search,
  bitwise_operations: Cpu,
  data_structure: Database,
  dynamic_programming: Layers,
  graph: GitBranch,
  greedy: Zap,
  grid: Grid,
  math: Calculator,
  monotonic_stack: Maximize,
  sliding_window: BookOpen,
  string: Type,
  trees: Trees,
};

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

export function GlobalStudyPlanSidebar() {
  const pathname = usePathname();

  // Check if we're on a study plan page
  const isStudyPlanPage = pathname.startsWith("/studyplan/");
  const currentPlanKey = isStudyPlanPage
    ? pathname.replace("/studyplan/", "").split("/")[0]
    : null;

  const { studyPlan } = useStudyPlan(currentPlanKey || "");

  // Get current plan title
  const currentPlanTitle = currentPlanKey
    ? STUDYPLANS[currentPlanKey as keyof typeof STUDYPLANS] || currentPlanKey
    : null;

  return (
    <Sidebar className="top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] border-r">
      <SidebarHeader className="p-4">
        {isStudyPlanPage && currentPlanTitle ? (
          // Show back button and current plan title when on a study plan page
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
                  icons[currentPlanKey as keyof typeof icons] || BookOpen;
                return <Icon className="h-6 w-6 text-primary" />;
              })()}
              <span className="truncate">{currentPlanTitle}</span>
            </div>
          </div>
        ) : (
          // Show default header when not on a study plan page
          <div className="flex items-center gap-2 font-bold text-xl px-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>題單</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isStudyPlanPage ? "章節導覽" : "演算法分類"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {isStudyPlanPage && studyPlan ? (
              // Show sub-topics when on a study plan page
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
            ) : (
              // Show all study plan categories when not on a specific study plan page
              <SidebarMenu>
                {Object.entries(STUDYPLANS).map(([key, title]) => {
                  const Icon = icons[key] || BookOpen;
                  const href = `/studyplan/${key}`;
                  const isActive = pathname === href;

                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                      >
                        <Link
                          href={href}
                          className="flex items-center gap-3 py-2"
                        >
                          <Icon
                            className={`h-4 w-4 ${isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                              }`}
                          />
                          <span className="font-medium">{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
