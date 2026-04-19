import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TutorialData } from "@/types";
import React, { useMemo } from "react";
import { StudyPlanMarkdownContent } from "@/components/StudyPlan/MarkdownContent";
import {
  extractImageUrls,
  stripDuplicateImages,
} from "@/components/StudyPlan/dedupe";
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

interface TutorialSectionContainerProps {
  section: TutorialData.Section;
  level?: number;
  parentImageUrls?: Set<string>;
}

const TutorialSectionContainer = React.memo(
  ({
    section,
    level = 0,
    parentImageUrls = new Set(),
  }: TutorialSectionContainerProps) => {
    const childCount = section.children?.length ?? 0;
    const totalSections = countSections(section);

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
        {section.children && section.children.length > 0 ? (
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex w-full flex-col gap-4 border-t border-border/50 pt-1">
              {section.children.map((child) => (
                <TutorialSectionContainer
                  key={child.id}
                  section={child}
                  level={level + 1}
                  parentImageUrls={mergedImageUrls}
                />
              ))}
            </div>
          </CardContent>
        ) : null}
      </Card>
    );
  },
);

TutorialSectionContainer.displayName = "TutorialSectionContainer";

export { TutorialSectionContainer };
