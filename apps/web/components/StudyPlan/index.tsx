"use client";

import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useTutorial } from "@/hooks/useTutorial";
import { useProgressStore } from "@/hooks/useProgress";
import { STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { SectionContainer } from "./SectionContainer";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FolderTree,
  GraduationCap,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { extractImageUrls } from "./dedupe";
import { SectionQuickLinks } from "@/features/learning/components/SectionQuickLinks";
import { SidebarVisibilityButtons } from "@/features/learning/components/SidebarVisibilityButtons";
import {
  getStudyPlanPracticeStats,
  indexTutorialSectionsById,
} from "@/features/learning/utils/sectionTree";

interface StudyPlanProps {
  plan: string;
}

function StudyPlan({ plan }: StudyPlanProps) {
  const { studyPlan } = useStudyPlan(plan);
  const { tutorial } = useTutorial(plan);
  const progress = useProgressStore((state) => state.progress);

  const planTitle =
    STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? studyPlan?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const tutorialById = useMemo(
    () => indexTutorialSectionsById(tutorial),
    [tutorial],
  );

  const topLevelImageUrls = useMemo(
    () =>
      tutorial?.summary
        ? extractImageUrls(tutorial.summary)
        : new Set<string>(),
    [tutorial?.summary],
  );

  const stats = useMemo(
    () => getStudyPlanPracticeStats(studyPlan, progress),
    [studyPlan, progress],
  );

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
                        {studyPlan.last_update && (
                          <>
                            <span>
                              更新於{" "}
                              {new Date(
                                studyPlan.last_update,
                              ).toLocaleDateString()}
                            </span>
                            <span className="hidden sm:inline">·</span>
                          </>
                        )}
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
          {tutorial && (
            <Link
              href={`/lecture/${plan}`}
              className="group block overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                <div className="flex items-start gap-3 sm:items-center">
                  <div
                    className="shrink-0 rounded-2xl p-3 ring-1 ring-border/60"
                    style={{ background: theme.gradient }}
                  >
                    <GraduationCap className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      想看觀念說明？前往對應講義
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      此頁專注題目練習；題型概念、模板與例題請至講義頁閱讀。
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium transition-colors group-hover:border-primary/40 sm:self-auto"
                  style={{ color: theme.accent }}
                >
                  閱讀講義
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
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
                  <SidebarVisibilityButtons />
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
            <SectionQuickLinks
              sections={studyPlan.children}
              description="可先打開側欄查看完整章節樹，或直接用下方章節捷徑快速跳轉。"
            />
          )}

          {studyPlan?.children.map((section) => (
            <SectionContainer
              key={section.id}
              section={section}
              tutorialById={tutorialById}
              parentImageUrls={topLevelImageUrls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;
