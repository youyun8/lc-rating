import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StudyPlanData } from "@/types";
import hljs from 'highlight.js';
import katex from 'katex';
import markedKatex from 'marked-katex-extension';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import React, { useEffect, useRef } from "react";
import { ProblemList } from "./ProblemList";

const marked = new Marked(
  markedHighlight({
	emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  }),
  markedKatex({
    throwOnError: false,
    output: 'html'
  })
);

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
          img.className = "w-2/3 md:w-1/2";
        });
      }
    }, [innerHtml]);

    const createMarkup = (md: string) => {
      const parsed = marked.parse(md);
      if (typeof parsed === 'string') {
        return { __html: parsed };
      }
      console.error("marked.parse returned non-string:", parsed);
      return { __html: "" };
    };

    const cardClasses = cn("scroll-mt-[70px] w-full", {
      "border-none shadow-none bg-transparent": level > 0,
      "border shadow-sm": level === 0,
    }, "h-fit transition-all");

    const contentClasses = cn("flex flex-col p-0 gap-6", {
      "pl-4 md:pl-8 border-l-2 border-muted ml-2 mt-4": level >= 0 && section.children && section.children.length > 0,
    });

    return (
      <Card
        id={`${section.title}`}
        className={cardClasses}
      >
        <CardHeader className={cn("pb-3", level > 0 ? "px-0" : "")}>
          <CardTitle className={cn(
            "font-bold tracking-tight",
            level === 0 ? "text-2xl" : level === 1 ? "text-xl" : "text-lg"
          )}>
            {section.title}
          </CardTitle>
          {(section.summary || section.content) ? (
            <CardDescription className="text-foreground mt-3">
              <div
                ref={innerHtml}
                className="prose prose-base dark:prose-invert max-w-none prose-pre:my-2"
                dangerouslySetInnerHTML={createMarkup(section.summary || section.content || "")}
              />
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className={level > 0 ? "px-0" : ""}>
          <div className={contentClasses}>
            {section.problems && section.problems.length ? (
              <div className="w-full">
                <ProblemList problems={section.problems} />
              </div>
            ) : null}
            { section.children && section.children.length > 0 && (
              <div className="flex flex-col gap-8 w-full">
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
  }
);

SectionContainer.displayName = "SectionContainer";

export { SectionContainer };