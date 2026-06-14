"use client";

import { useTutorial } from "@/hooks/useTutorial";
import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  FolderTree,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { TutorialMarkdownPanel } from "./MarkdownPanel";
import { CourseMaterials } from "./CourseMaterials";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { getTutorialStats } from "@/features/learning/utils/sectionTree";
import {
  getStudyPlanProblemsForSection,
  LectureSectionCards,
  makeLectureSectionCardItem,
} from "@/features/tutorial/LectureSectionCards";

interface TutorialProps {
  plan: string;
}

function Tutorial({ plan }: TutorialProps) {
  const { tutorial } = useTutorial(plan);

  const planTitle = LECTURE_CATEGORIES[plan] ?? tutorial?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const stats = useMemo(() => getTutorialStats(tutorial), [tutorial]);
  const sectionCardItems = useMemo(
    () =>
      tutorial?.children.map((section) =>
        makeLectureSectionCardItem(
          section,
          plan,
          0,
          getStudyPlanProblemsForSection(studyPlanDataMap[plan], section.id),
        ),
      ) ?? [],
    [plan, tutorial?.children],
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-han">
      {tutorial && (
        <div className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 md:px-6 md:pt-8 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
          <div
            className="motion-rise relative overflow-hidden rounded-[1.75rem] shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)] sm:rounded-[2rem]"
            style={{ background: theme.gradient }}
          >
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute top-8 right-1/4 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative p-4 sm:p-6 md:p-8 xl:p-10">
              <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
                <Link
                  href="/lecture"
                  className="transition-colors hover:text-white"
                >
                  講義
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-white">{planTitle}</span>
              </nav>

              <div className="flex flex-col gap-5 lg:gap-6">
                <div className="min-w-0">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 rounded-2xl bg-white/15 p-3 backdrop-blur-sm ring-1 ring-white/20 sm:p-3.5">
                      <Icon className="h-7 w-7 text-white drop-shadow-sm sm:h-8 sm:w-8" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl font-bold tracking-tight text-white sm:text-3xl xl:text-4xl">
                        {tutorial.title}
                      </h1>
                      {tutorial.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
                          {tutorial.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/70 sm:text-sm">
                        {tutorial.src && (
                          <>
                            <a
                              href={tutorial.src}
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
                        {tutorial.last_update && (
                          <>
                            <span>
                              更新於{" "}
                              {new Date(
                                tutorial.last_update,
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

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                      <FolderTree className="h-4 w-4" />
                      主章節
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {stats.rootSections}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                      <Layers3 className="h-4 w-4" />
                      總章節
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {stats.sections}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/65">
                      <BookOpen className="h-4 w-4" />
                      有筆記
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {stats.documented}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-white/75">
                  <Link
                    href="/lecture"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
                  >
                    返回講義列表
                  </Link>
                  <Link
                    href={`/studyplan/${plan}`}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
                  >
                    前往對應題單
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  {tutorial.src && (
                    <a
                      href={tutorial.src}
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
      )}

      <div className="mx-auto w-full max-w-7xl px-3 py-5 pb-24 sm:px-4 sm:py-6 md:px-6 md:py-8 md:pb-20 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <div className="flex flex-col gap-8">
          {tutorial?.summary && (
            <TutorialMarkdownPanel
              title="講義總覽"
              description="先通讀本頁概要，再深入各章節複習重點與模板。"
              badge="章節導讀"
              content={tutorial.summary}
            />
          )}

          <CourseMaterials plan={plan} />

          {tutorial && (
            <LectureSectionCards
              title="單元導覽"
              description="先選擇要學的單元；若單元底下還有子單元，下一頁會繼續以小圖卡呈現。"
              items={sectionCardItems}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
