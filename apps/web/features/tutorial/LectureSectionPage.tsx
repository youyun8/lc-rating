import { Button } from "@/components/ui/button";
import type { LectureSectionTutorial } from "@/data/lectureSectionTutorials";
import { HandbookSectionBody } from "@/features/handbook/HandbookSectionBody";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import Link from "next/link";
import { LectureSectionCards } from "@/features/tutorial/LectureSectionCards";
import {
  getProblemIds,
  getStudyPlanProblemsForSection,
  parseDescriptionBullets,
} from "@/features/tutorial/LectureSectionCards/cardModel";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";

interface LectureSectionPageProps {
  section: LectureSectionTutorial;
}

export function LectureSectionPage({ section }: LectureSectionPageProps) {
  const hasChildren = section.children.length > 0;
  const studyPlan = studyPlanDataMap[section.planKey];
  const descriptionBullets = parseDescriptionBullets(section.description);
  const childItems = section.children.map((child) => {
    const childProblems = getStudyPlanProblemsForSection(studyPlan, child.id);
    const problemsForProgress =
      child.title === "模式總覽" && childProblems.length === 0
        ? getStudyPlanProblemsForSection(studyPlan, section.id)
        : childProblems;
    const problemIds = getProblemIds(problemsForProgress);

    return {
      id: child.id,
      title: child.title,
      description: child.description,
      slug: child.slug,
      href: `/lecture/${section.planKey}/${child.slug}`,
      summary: child.summary,
      childCount: child.childCount,
      totalSections: child.totalSections,
      problemCount: problemIds.length,
      problemIds,
      depth: child.depth,
    };
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-han">
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 py-6 sm:px-6 md:py-8 xl:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/lecture"
              className="transition-colors hover:text-foreground"
            >
              講義
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/lecture/${section.planKey}`}
              className="transition-colors hover:text-foreground"
            >
              {section.planTitle}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{section.title}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {hasChildren ? (
                  <FolderTree className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                {hasChildren ? "單元導覽" : "章節完整講義"}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {section.title}
              </h1>
              {descriptionBullets ? (
                <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground sm:text-base">
                  {descriptionBullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span className="min-w-0 break-words">{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  {section.description ??
                    (hasChildren
                      ? "先選擇此單元底下的子單元；到最細層後會顯示完整講義與搭配題目。"
                      : "依序展開觀念、模式、例題推導與 C++ 實作骨架。")}
                </p>
              )}
            </div>

            <Button asChild variant="outline" className="w-fit">
              <Link href={`/lecture/${section.planKey}`}>
                <ArrowLeft className="h-4 w-4" />
                返回章節列表
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {hasChildren ? (
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 md:py-8 xl:max-w-[88rem] xl:px-8">
          <LectureSectionCards
            title="子單元"
            description={`${section.title} 底下的講義依子單元整理；選到最後一層即可閱讀完整講義與題目。`}
            items={childItems}
          />
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 px-4 py-6 pb-24 sm:px-6 md:py-8 xl:px-8">
          <article className="mx-auto w-full min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:max-w-[var(--lecture-reading-width)]">
            <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                完整講義
              </h2>
            </div>
            <div className="px-4 py-5 sm:px-6 md:py-7">
              <HandbookSectionBody
                body={section.content}
                exampleLabel="範例"
                language="zh"
              />
            </div>
          </article>

          <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {section.previous ? (
              <Button asChild variant="outline" className="justify-start">
                <Link
                  href={`/lecture/${section.planKey}/${section.previous.slug}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {section.previous.title}
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {section.next ? (
              <Button
                asChild
                variant="outline"
                className="justify-start sm:justify-end"
              >
                <Link href={`/lecture/${section.planKey}/${section.next.slug}`}>
                  {section.next.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        </main>
      )}
    </div>
  );
}
