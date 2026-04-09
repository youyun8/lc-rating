"use client";

import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useProgressStore } from "@/hooks/useProgress";
import { STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { SectionContainer } from "./SectionContainer";
import { StudyPlanData } from "@/types";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FolderTree,
  Layers3,
  PanelLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { StudyPlanMarkdownContent } from "./MarkdownContent";
import { extractImageUrls } from "./dedupe";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

function collectProblemIds(sections: StudyPlanData.Section[]): string[] {
  const ids: string[] = [];
  function walk(section: StudyPlanData.Section) {
    if (section.problems) {
      for (const p of section.problems) {
        const id = p.id?.toString();
        if (id) ids.push(id);
      }
    }
    if (section.children) {
      for (const child of section.children) walk(child);
    }
  }
  for (const s of sections) walk(s);
  return ids;
}

function countSections(section: StudyPlanData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countSections(child),
      0,
    );
  }
  return count;
}

interface StudyPlanProps {
  plan: string;
}

function StudyPlanSidebarButtons() {
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();
  const isSidebarVisible = isMobile ? openMobile : open;

  return (
    <>
      {!isSidebarVisible && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border border-border/60 bg-transparent text-muted-foreground hover:bg-accent/70 hover:text-foreground"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(true);
              return;
            }
            setOpen(true);
          }}
        >
          <PanelLeftIcon className="h-4 w-4" />
          顯示側欄
        </Button>
      )}
      {isSidebarVisible && !isMobile && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border border-border/60 bg-transparent text-muted-foreground hover:bg-accent/70 hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          <PanelLeftIcon className="h-4 w-4" />
          隱藏側欄
        </Button>
      )}
    </>
  );
}

function StudyPlan({ plan }: StudyPlanProps) {
  const { studyPlan } = useStudyPlan(plan);
  const progress = useProgressStore((state) => state.progress);

  const planTitle =
    STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? studyPlan?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const topLevelImageUrls = useMemo(
    () =>
      studyPlan?.summary
        ? extractImageUrls(studyPlan.summary)
        : new Set<string>(),
    [studyPlan?.summary],
  );

  const stats = useMemo(() => {
    if (!studyPlan) {
      return {
        total: 0,
        completed: 0,
        sections: 0,
        rootSections: 0,
        pct: 0,
      };
    }

    const ids = collectProblemIds(studyPlan.children);
    const total = ids.length;
    const completed = ids.filter((id) => progress[id] === "SOLVED").length;
    const sections = studyPlan.children.reduce(
      (acc, child) => acc + countSections(child),
      0,
    );

    return {
      total,
      completed,
      sections,
      rootSections: studyPlan.children.length,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [studyPlan, progress]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-song">
      {studyPlan && (
        <div className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 md:px-6 md:pt-8 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
          <div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
            style={{ background: theme.gradient }}
          >
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute top-8 right-1/4 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative p-4 sm:p-6 md:p-8 xl:p-10">
              <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
                <Link
                  href="/studyplan"
                  className="transition-colors hover:text-white"
                >
                  題單
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-white">{planTitle}</span>
              </nav>

              <div className="flex flex-col gap-5 lg:gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,28rem)] 2xl:items-start 2xl:gap-8">
                <div className="min-w-0">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 rounded-2xl bg-white/15 p-3 backdrop-blur-sm ring-1 ring-white/20 sm:p-3.5">
                      <Icon className="h-7 w-7 text-white drop-shadow-sm sm:h-8 sm:w-8" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl font-bold tracking-tight text-white sm:text-3xl xl:text-4xl">
                        {studyPlan.title}
                      </h1>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/70 sm:text-sm">
                        {studyPlan.src && (
                          <>
                            <a
                              href={studyPlan.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 transition-colors hover:text-white"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              查看原文
                            </a>
                            <span className="hidden sm:inline">·</span>
                          </>
                        )}
                        <span>
                          更新於{" "}
                          {new Date(studyPlan.last_update).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>{stats.rootSections} 個主章節</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-1 2xl:self-stretch">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-2">
                    <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                        <BookOpen className="h-4 w-4" />
                        題目
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stats.total}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                        <FolderTree className="h-4 w-4" />
                        章節
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stats.sections}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                        <CheckCircle2 className="h-4 w-4" />
                        已完成
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stats.completed}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                        <Layers3 className="h-4 w-4" />
                        完成率
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {stats.pct}%
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm ring-1 ring-white/10 2xl:h-full">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/70">
                      <span>
                        已完成 {stats.completed} / {stats.total} 題
                      </span>
                      <span className="font-semibold text-white">
                        {stats.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white/90 transition-all duration-500"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
                      <Link
                        href="/studyplan"
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
                      >
                        返回題單列表
                      </Link>
                      {studyPlan.src && (
                        <a
                          href={studyPlan.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
                        >
                          原文連結
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-3 py-5 pb-24 sm:px-4 sm:py-6 md:px-6 md:py-8 md:pb-20 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <div className="flex flex-col gap-8">
          {studyPlan?.summary && (
            <section className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm">
              <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      學習摘要
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      先掌握題單重點與刷題建議，再依章節順序往下練習。
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    題單導讀
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <StudyPlanMarkdownContent
                  content={studyPlan.summary}
                  variant="plan"
                />
              </div>
            </section>
          )}

          {studyPlan && (
            <section className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    章節導覽
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    依照章節順序循序練習；也可用側欄導覽快速跳轉到指定章節。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StudyPlanSidebarButtons />
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.rootSections} 個主章節
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.sections} 個總章節
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.total} 題
                  </span>
                </div>
              </div>
            </section>
          )}

          {studyPlan && (
            <section className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm xl:hidden sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                    <PanelLeftIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      快速章節提醒
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      可先打開側欄查看完整章節樹，或直接用下方章節捷徑快速跳轉。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {studyPlan.children.map((section) => (
                    <a
                      key={section.title}
                      href={`#${section.title}`}
                      className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {studyPlan?.children.map((section) => (
            <SectionContainer
              key={section.title}
              section={section}
              parentImageUrls={topLevelImageUrls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;
