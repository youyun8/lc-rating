"use client";

import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import { Button } from "@/components/ui/button";
import {
  getGoogleInterviewSectionTutorial,
  googleInterviewSectionTutorials,
} from "@/data/googleInterviewSectionTutorials";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

interface GoogleSectionPageProps {
  sectionSlug: string;
}

function getNeighborIndex(slug: string) {
  return googleInterviewSectionTutorials.findIndex(
    (section) => section.slug === slug || String(section.id) === slug,
  );
}

export function GoogleSectionPage({ sectionSlug }: GoogleSectionPageProps) {
  const section = getGoogleInterviewSectionTutorial(sectionSlug);
  const index = getNeighborIndex(sectionSlug);
  const previous =
    index > 0 ? googleInterviewSectionTutorials[index - 1] : undefined;
  const next =
    index >= 0 && index < googleInterviewSectionTutorials.length - 1
      ? googleInterviewSectionTutorials[index + 1]
      : undefined;

  if (!section) {
    return null;
  }

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
              href="/lecture/google_interview"
              className="transition-colors hover:text-foreground"
            >
              Google 面試準備
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{section.title}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                Google 面試章節講義
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {section.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                從基礎觀念開始，依序拆解模型、判斷流程、例題推導與 C++ 實作。
              </p>
            </div>

            <Button asChild variant="outline" className="w-fit">
              <Link href="/lecture/google_interview">
                <ArrowLeft className="h-4 w-4" />
                返回章節列表
              </Link>
            </Button>
          </div>
        </div>
      </div>

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

        <aside className="h-fit rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Google 章節
          </h2>
          <div className="mt-3 flex flex-col gap-1.5">
            {googleInterviewSectionTutorials.map((item) => (
              <Link
                key={item.id}
                href={`/lecture/google_interview/${item.slug}`}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  item.id === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </aside>

        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          {previous ? (
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/lecture/google_interview/${previous.slug}`}>
                <ArrowLeft className="h-4 w-4" />
                {previous.title}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button
              asChild
              variant="outline"
              className="justify-start sm:justify-end"
            >
              <Link href={`/lecture/google_interview/${next.slug}`}>
                {next.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </div>
  );
}
