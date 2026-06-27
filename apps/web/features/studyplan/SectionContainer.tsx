import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { StudyPlanData, TutorialData } from "@/types";
import { ChevronDown } from "lucide-react";
import React, { useMemo } from "react";
import { StudyPlanMarkdownContent } from "./MarkdownContent";
import { ProblemList } from "./ProblemList";
import { extractImageUrls, stripDuplicateImages } from "./dedupe";
import { normalizeExampleContainers } from "./normalizeExampleContainers";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { countStudyPlanProblems } from "@/features/learning/utils/sectionTree";

interface SectionContainerProps {
  section: StudyPlanData.Section;
  /** Lookup of tutorial node by shared numeric id, for summary rendering. */
  tutorialById?: Map<number, TutorialData.Section>;
  level?: number;
  parentImageUrls?: Set<string>;
}

const SectionContainer = React.memo(
  ({
    section,
    tutorialById,
    level = 0,
    parentImageUrls = new Set(),
  }: SectionContainerProps) => {
    const totalProblems = countStudyPlanProblems(section);
    const childCount = section.children?.length ?? 0;

    const tutorial = tutorialById?.get(section.id);
    const rawSummary = tutorial?.summary ?? "";
    const dedupedSummary = useMemo(
      () => stripDuplicateImages(rawSummary, parentImageUrls),
      [rawSummary, parentImageUrls],
    );
    const normalizedSummary = useMemo(
      () => normalizeExampleContainers(dedupedSummary),
      [dedupedSummary],
    );

    // Merge parent + current section images so children won't repeat them either
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
            <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
              {totalProblems} 題
            </span>
            {childCount > 0 && (
              <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                {childCount} 個子章節
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
            <Collapsible className="group/summary mt-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-0.5">
                    {level === 0 ? "章節摘要" : "重點整理"}
                  </span>
                  <span className="text-muted-foreground/80">展開觀念說明</span>
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/summary:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 rounded-[1.5rem] border border-border/60 bg-muted/20 p-4 sm:p-5">
                  <StudyPlanMarkdownContent
                    content={normalizedSummary}
                    variant="section"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4">
            {section.problems && section.problems.length ? (
              <div className="w-full">
                <ProblemList problems={section.problems} />
              </div>
            ) : null}
            {section.children && section.children.length > 0 && (
              <div className="flex w-full flex-col gap-4 border-t border-border/50 pt-1">
                {section.children.map((child) => (
                  <SectionContainer
                    key={child.id}
                    section={child}
                    tutorialById={tutorialById}
                    level={level + 1}
                    parentImageUrls={mergedImageUrls}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

SectionContainer.displayName = "SectionContainer";

export { SectionContainer };
