import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import React from "react";

interface TutorialMarkdownPanelProps {
  title: string;
  description: string;
  badge: string;
  content: string;
}

export function TutorialMarkdownPanel({
  title,
  description,
  badge,
  content,
}: TutorialMarkdownPanelProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 md:p-6">
        <StudyPlanMarkdownContent content={content} variant="plan" />
      </div>
    </section>
  );
}
