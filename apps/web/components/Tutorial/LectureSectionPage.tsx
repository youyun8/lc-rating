import { StudyPlanMarkdownContent } from "@/components/StudyPlan/MarkdownContent";
import { Button } from "@/components/ui/button";
import type { LectureSectionTutorial } from "@/data/lectureSectionTutorials";
import { SectionPracticePanel } from "@/features/learning/components/SectionPracticePanel";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import Link from "next/link";
import { LectureSectionCards } from "@/components/Tutorial/LectureSectionCards";

interface LectureSectionPageProps {
  section: LectureSectionTutorial;
}

export function LectureSectionPage({ section }: LectureSectionPageProps) {
  const hasChildren = section.children.length > 0;
  const childItems = section.children.map((child) => ({
    id: child.id,
    title: child.title,
    slug: child.slug,
    href: `/lecture/${section.planKey}/${child.slug}`,
    summary: child.summary,
    childCount: child.childCount,
    totalSections: child.totalSections,
    problemCount: child.practiceProblemCount,
    depth: child.depth,
  }));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-song">
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
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                {hasChildren
                  ? "先選擇此單元底下的子單元；到最細層後會顯示完整講義與搭配題目。"
                  : "依序展開觀念、模式、例題推導與 C++ 實作骨架。"}
              </p>
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
        <main className="mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-6 pb-24 sm:px-6 md:py-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:px-8">
          <article className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm lg:w-full lg:max-w-[var(--lecture-reading-width)] lg:justify-self-center">
            <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                完整講義
              </h2>
            </div>
            <div className="px-4 py-5 sm:px-6 md:py-7">
              <StudyPlanMarkdownContent
                content={section.content}
                variant="lecture"
              />
            </div>
          </article>

          <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {section.planTitle} 章節
              </h2>
              <div className="mt-3 flex flex-col gap-1.5">
                {section.navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/lecture/${section.planKey}/${item.slug}`}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm transition-colors",
                      item.depth > 0 && "ml-3 text-xs",
                      item.id === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {section.practiceProblems.length > 0 && (
            <section className="lg:col-span-2">
              <SectionPracticePanel
                problems={section.practiceProblems}
                title="搭配練習"
              />
            </section>
          )}

          <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
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
