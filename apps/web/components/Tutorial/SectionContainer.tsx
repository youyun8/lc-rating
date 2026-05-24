import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StudyPlanData, TutorialData } from "@/types";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { StudyPlanMarkdownContent } from "@/components/StudyPlan/MarkdownContent";
import {
  extractImageUrls,
  stripDuplicateImages,
} from "@/components/StudyPlan/dedupe";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { SectionPracticePanel } from "@/features/learning/components/SectionPracticePanel";
import { countTutorialSections } from "@/features/learning/utils/sectionTree";

interface TutorialSectionContainerProps {
  section: TutorialData.Section;
  /** Lookup of practice problems by shared section id (sourced from the matching study plan). */
  practiceBySectionId?: Map<number, StudyPlanData.Item[]>;
  planKey?: string;
  level?: number;
  parentImageUrls?: Set<string>;
}

const TutorialSectionContainer = React.memo(
  ({
    section,
    practiceBySectionId,
    planKey,
    level = 0,
    parentImageUrls = new Set(),
  }: TutorialSectionContainerProps) => {
    const practiceProblems = practiceBySectionId?.get(section.id) ?? [];
    const childCount = section.children?.length ?? 0;
    const totalSections = countTutorialSections(section);
    const detailHref = planKey
      ? `/lecture/${planKey}/${sectionAnchor(section.title)}`
      : undefined;

    const rawSummary = section.summary ?? "";
    const dedupedSummary = useMemo(
      () => stripDuplicateImages(rawSummary, parentImageUrls),
      [rawSummary, parentImageUrls],
    );

    const mergedImageUrls = useMemo(() => {
      const own = extractImageUrls(rawSummary);
      if (own.size === 0) return parentImageUrls;
      const merged = new Set(parentImageUrls);
      for (const u of own) merged.add(u);
      return merged;
    }, [rawSummary, parentImageUrls]);

    const cardClasses = cn(
      "scroll-mt-[78px] h-fit w-full overflow-hidden border border-border/60 shadow-sm",
      level === 0
        ? "rounded-3xl bg-card"
        : level === 1
          ? "rounded-[1.5rem] bg-card/95"
          : "rounded-2xl bg-muted/10",
    );

    return (
      <Card id={sectionAnchor(section.title)} className={cardClasses}>
        <CardHeader className="px-4 pb-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 font-medium">
              {level === 0 ? "主章節" : level === 1 ? "子章節" : "細分章節"}
            </span>
            {childCount > 0 && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                {childCount} 個子章節
              </span>
            )}
            {totalSections > 1 && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                共 {totalSections} 個章節
              </span>
            )}
          </div>
          <CardTitle
            className={cn(
              "font-bold tracking-tight",
              level === 0
                ? "text-xl sm:text-2xl"
                : level === 1
                  ? "text-lg sm:text-xl"
                  : "text-base sm:text-lg",
            )}
          >
            {section.title}
          </CardTitle>
          {detailHref && (
            <Link
              href={detailHref}
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" />
              閱讀完整講義
            </Link>
          )}
          {dedupedSummary ? (
            <div className="mt-4 rounded-[1.5rem] border border-border/60 bg-muted/20 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 font-medium">
                  {level === 0 ? "章節摘要" : "重點整理"}
                </span>
              </div>
              <StudyPlanMarkdownContent
                content={dedupedSummary}
                variant="section"
              />
            </div>
          ) : null}
        </CardHeader>
        {(practiceProblems.length > 0 ||
          (section.children && section.children.length > 0)) && (
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex w-full flex-col gap-4">
              <SectionPracticePanel problems={practiceProblems} />
              {section.children && section.children.length > 0 && (
                <div className="flex w-full flex-col gap-4 border-t border-border/50 pt-1">
                  {section.children.map((child) => (
                    <TutorialSectionContainer
                      key={child.id}
                      section={child}
                      practiceBySectionId={practiceBySectionId}
                      planKey={planKey}
                      level={level + 1}
                      parentImageUrls={mergedImageUrls}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  },
);

TutorialSectionContainer.displayName = "TutorialSectionContainer";

export { TutorialSectionContainer };
