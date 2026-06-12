import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, FolderTree, ListChecks } from "lucide-react";
import Link from "next/link";
import { type CSSProperties } from "react";
import {
  getLevelLabel,
  getSummaryPreview,
  type CardProgressState,
  type LectureSectionCardItem,
} from "./cardModel";

interface LectureSectionCardProps {
  item: LectureSectionCardItem;
  progressState: CardProgressState;
}

export function LectureSectionCard({
  item,
  progressState,
}: LectureSectionCardProps) {
  const isLeaf = item.childCount === 0;
  const ProgressIcon = progressState.Icon;
  const isActive = progressState.key !== "pending";

  return (
    <Link
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
              !isLeaf &&
                !isActive &&
                "border-border/60 bg-muted/35 text-muted-foreground",
              isLeaf &&
                !isActive &&
                "border-primary/20 bg-primary/10 text-primary",
            )}
            style={
              isActive
                ? {
                    borderColor: `color-mix(in srgb, ${progressState.color} 35%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${progressState.color} 12%, transparent)`,
                    color: progressState.color,
                  }
                : undefined
            }
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
          {getSummaryPreview(item.description ?? item.summary)}
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
}
