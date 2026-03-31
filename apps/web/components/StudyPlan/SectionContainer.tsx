import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StudyPlanData } from "@/types";
import hljs from "highlight.js";
import markedKatex from "marked-katex-extension";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import React, { useEffect, useRef } from "react";
import { ProblemList } from "./ProblemList";

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
  markedKatex({
    nonStandard: true,
    throwOnError: false,
    output: "html",
  }),
);

function createMarkup(md: string) {
  const parsed = marked.parse(md);
  if (typeof parsed === "string") {
    return { __html: parsed };
  }
  console.error("marked.parse returned non-string:", parsed);
  return { __html: "" };
}

function createInlineMarkup(md: string) {
  const parsed = marked.parseInline(md);
  if (typeof parsed === "string") {
    return { __html: parsed };
  }
  console.error("marked.parseInline returned non-string:", parsed);
  return { __html: "" };
}

function countProblems(section: StudyPlanData.Section): number {
  let count = section.problems?.length ?? 0;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countProblems(child),
      0,
    );
  }
  return count;
}

interface SectionContainerProps {
  section: StudyPlanData.Section;
  level?: number;
}

const SectionContainer = React.memo(
  ({ section, level = 0 }: SectionContainerProps) => {
    const innerHtml = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
      if (innerHtml.current) {
        innerHtml.current.querySelectorAll("a").forEach((link) => {
          link.removeAttribute("style");
          link.setAttribute("target", "_blank");
          link.className =
            "font-medium text-primary underline underline-offset-4";
        });
        innerHtml.current.querySelectorAll("img").forEach((img) => {
          img.removeAttribute("style");
          img.className =
            "w-full rounded-2xl border border-border/60 bg-background/80 shadow-sm sm:w-2/3 md:w-1/2";
        });
      }
    }, [innerHtml]);

    const totalProblems = countProblems(section);
    const childCount = section.children?.length ?? 0;
    const cardClasses = cn(
      "scroll-mt-[78px] h-fit w-full overflow-hidden border border-border/60 shadow-sm",
      level === 0
        ? "rounded-3xl bg-card"
        : level === 1
          ? "rounded-[1.5rem] bg-card/95"
          : "rounded-2xl bg-muted/10",
    );

    return (
      <Card id={`${section.title}`} className={cardClasses}>
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
            <span dangerouslySetInnerHTML={createInlineMarkup(section.title)} />
          </CardTitle>
          {section.summary || section.content ? (
            <CardDescription className="mt-3 text-foreground">
              <div
                ref={innerHtml}
                className="prose prose-sm max-w-none text-foreground dark:prose-invert prose-headings:text-foreground prose-p:leading-7 prose-li:leading-7 prose-pre:my-3 prose-pre:overflow-x-auto prose-img:mx-0 sm:prose-base"
                dangerouslySetInnerHTML={createMarkup(
                  section.summary || section.content || "",
                )}
              />
            </CardDescription>
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
                    key={child.title}
                    section={child}
                    level={level + 1}
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
