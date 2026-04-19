"use client";

import { useTutorial } from "@/hooks/useTutorial";
import { STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { TutorialSectionContainer } from "./SectionContainer";
import { TutorialData } from "@/types";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  FolderTree,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { StudyPlanMarkdownContent } from "@/components/StudyPlan/MarkdownContent";
import { extractImageUrls } from "@/components/StudyPlan/dedupe";
import { sectionAnchor } from "@/utils/sectionAnchor";

function countSections(section: TutorialData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countSections(child),
      0,
    );
  }
  return count;
}

function countSectionsWithSummary(section: TutorialData.Section): number {
  let count = section.summary ? 1 : 0;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countSectionsWithSummary(child),
      0,
    );
  }
  return count;
}

interface TutorialProps {
  plan: string;
}

function Tutorial({ plan }: TutorialProps) {
  const { tutorial } = useTutorial(plan);

  const planTitle =
    STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? tutorial?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const topLevelImageUrls = useMemo(
    () =>
      tutorial?.summary
        ? extractImageUrls(tutorial.summary)
        : new Set<string>(),
    [tutorial?.summary],
  );

  const stats = useMemo(() => {
    if (!tutorial) {
      return { sections: 0, rootSections: 0, documented: 0 };
    }
    const sections = tutorial.children.reduce(
      (acc, child) => acc + countSections(child),
      0,
    );
    const documented = tutorial.children.reduce(
      (acc, child) => acc + countSectionsWithSummary(child),
      0,
    );
    return {
      sections,
      rootSections: tutorial.children.length,
      documented,
    };
  }, [tutorial]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-song">
      {tutorial && (
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
                  href="/tutorial"
                  className="transition-colors hover:text-white"
                >
                  教學
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
                    href="/tutorial"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
                  >
                    返回教學列表
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
            <section className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm">
              <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      教學總覽
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      先通讀本頁概要，再深入各章節複習重點與模板。
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    章節導讀
                  </span>
                </div>
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <StudyPlanMarkdownContent
                  content={tutorial.summary}
                  variant="plan"
                />
              </div>
            </section>
          )}

          {tutorial && (
            <section className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-2">
                {tutorial.children.map((section) => (
                  <a
                    key={section.id}
                    href={`#${sectionAnchor(section.title)}`}
                    className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </section>
          )}

          {tutorial?.children.map((section) => (
            <TutorialSectionContainer
              key={section.id}
              section={section}
              parentImageUrls={topLevelImageUrls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
