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
          link.className = "underline text-blue-500";
        });
        innerHtml.current.querySelectorAll("img").forEach((img) => {
          img.removeAttribute("style");
          img.className = "w-full sm:w-2/3 md:w-1/2";
        });
      }
    }, [innerHtml]);

    const cardClasses = cn(
      "scroll-mt-[70px] h-fit w-full rounded-xl border bg-card shadow-none sm:rounded-2xl",
    );

    return (
      <Card id={`${section.title}`} className={cardClasses}>
        <CardHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
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
            <CardDescription className="text-foreground mt-3">
              <div
                ref={innerHtml}
                className="prose prose-sm max-w-none dark:prose-invert prose-pre:my-2 sm:prose-base"
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
              <div className="flex flex-col gap-4 w-full">
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
