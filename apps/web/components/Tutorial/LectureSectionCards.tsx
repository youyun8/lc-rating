"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOptions } from "@/hooks/useOptions";
import { useProgressStore } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import type { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  FolderTree,
  ListChecks,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useMemo } from "react";

export interface LectureSectionCardItem {
  id: number;
  title: string;
  slug: string;
  href: string;
  summary?: string;
  childCount: number;
  totalSections: number;
  problemCount: number;
  problemIds: string[];
  depth: number;
}

interface LectureSectionCardsProps {
  title: string;
  description: string;
  items: LectureSectionCardItem[];
  emptyText?: string;
}

function getSummaryPreview(summary?: string) {
  if (!summary)
    return "進入此單元後，可依下一層子單元繼續閱讀，或直接開啟完整講義與搭配練習。";

  return summary
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\*\*/g, "")
    .replace(/[#>`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

function getLevelLabel(depth: number) {
  if (depth === 0) return "單元";
  if (depth === 1) return "子單元";
  return "細分單元";
}

function getProblemIds(problems: StudyPlanData.Item[]) {
  return Array.from(
    new Set(
      problems
        .map((problem) => problem.id?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

export function makeLectureSectionCardItem(
  section: TutorialData.Section,
  planKey: string,
  depth = 0,
  problems: StudyPlanData.Item[] = [],
): LectureSectionCardItem {
  const slug = sectionAnchor(section.title);
  const problemIds = getProblemIds(problems);
  const totalSections =
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialDescendants(child),
      0,
    );

  return {
    id: section.id,
    title: section.title,
    slug,
    href: `/lecture/${planKey}/${slug}`,
    summary: section.summary,
    childCount: section.children?.length ?? 0,
    totalSections,
    problemCount: problemIds.length,
    problemIds,
    depth,
  };
}

function countTutorialDescendants(section: TutorialData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialDescendants(child),
      0,
    )
  );
}

function getCardProgressState(
  problemIds: string[],
  progress: Record<string, string | undefined>,
  pendingKey: string,
) {
  const total = problemIds.length;
  const solved = problemIds.filter((id) => progress[id] === "SOLVED").length;
  const started = problemIds.filter((id) => {
    const status = progress[id];
    return Boolean(status && status !== pendingKey);
  }).length;

  if (total > 0 && solved === total) {
    return {
      key: "completed" as const,
      label: "已完成",
      helper: `${solved}/${total} 題`,
      color: "#28a745",
      darkColor: "#15803d",
      Icon: CheckCircle2,
    };
  }

  if (started > 0 || solved > 0) {
    return {
      key: "working" as const,
      label: "進行中",
      helper: `${solved}/${total} 題完成`,
      color: "#1E90FF",
      darkColor: "#1d4ed8",
      Icon: PlayCircle,
    };
  }

  return {
    key: "pending" as const,
    label: total > 0 ? "未開始" : "未配置題目",
    helper: total > 0 ? `0/${total} 題` : "暫無題目",
    color: "#64748b",
    darkColor: "#334155",
    Icon: CircleDashed,
  };
}

export function LectureSectionCards({
  title,
  description,
  items,
  emptyText = "此層目前沒有可顯示的單元。",
}: LectureSectionCardsProps) {
  const progress = useProgressStore((state) => state.progress);
  const { getOption } = useOptions();
  const pendingKey = getOption().key;

  const progressByItemId = useMemo(
    () =>
      new Map(
        items.map((item) => [
          item.id,
          getCardProgressState(item.problemIds, progress, pendingKey),
        ]),
      ),
    [items, pendingKey, progress],
  );

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 xl:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="w-fit rounded-full">
          {items.length} 個單元
        </Badge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isLeaf = item.childCount === 0;
            const progressState = progressByItemId.get(item.id)!;
            const ProgressIcon = progressState.Icon;
            const isActive = progressState.key !== "pending";

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex min-h-64 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  isActive
                    ? "border-[color:var(--section-progress-color)]"
                    : "border-border/60 hover:border-primary/30",
                )}
                style={
                  {
                    "--section-progress-color": progressState.color,
                    "--section-progress-color-dark": progressState.darkColor,
                    background: isActive
                      ? `linear-gradient(135deg, color-mix(in srgb, ${progressState.color} 13%, transparent), transparent 46%), var(--card)`
                      : undefined,
                  } as CSSProperties
                }
              >
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                        isLeaf
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border/60 bg-muted/35 text-muted-foreground",
                      )}
                    >
                      {isLeaf ? (
                        <BookOpen className="h-5 w-5" />
                      ) : (
                        <FolderTree className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        variant={isLeaf ? "default" : "outline"}
                        className="rounded-full text-[11px]"
                      >
                        {isLeaf ? "完整講義" : getLevelLabel(item.depth)}
                      </Badge>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          borderColor: `color-mix(in srgb, ${progressState.color} 35%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${progressState.color} 12%, transparent)`,
                          color: progressState.color,
                        }}
                      >
                        <ProgressIcon className="h-3 w-3" />
                        {progressState.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="break-words text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[var(--section-progress-color-dark)] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {getSummaryPreview(item.summary)}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5 text-xs text-muted-foreground">
                    {!isLeaf && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                        <FolderTree className="h-3.5 w-3.5" />
                        {item.childCount} 個子單元
                      </span>
                    )}
                    {item.totalSections > 1 && (
                      <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                        共 {item.totalSections} 節
                      </span>
                    )}
                    {item.problemCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                        <ListChecks className="h-3.5 w-3.5" />
                        {progressState.helper}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-between px-0 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent group-hover:text-[var(--section-progress-color-dark)]"
                    asChild
                  >
                    <span>
                      {isLeaf ? "閱讀完整講義" : "進入子單元"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
