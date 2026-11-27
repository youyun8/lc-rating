"use client";

import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProblemProgress } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { cn } from "@/lib/utils";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import { sectionAnchor } from "@/utils/sectionAnchor";
import {
  CheckCircle2,
  Crown,
  ExternalLink,
  Lock,
  TableProperties,
} from "lucide-react";
import Link from "next/link";

import {
  nextProblem,
  problemsToNextStar,
  SOLVED_KEY,
  type QuestStage,
} from "./engine";
import { StarRow } from "./PlayerCard";

interface StageDialogProps {
  planKey: string;
  stage: QuestStage | null;
  bossId: string | null;
  accent: string;
  onOpenChange: (open: boolean) => void;
}

export function StageDialog({
  planKey,
  stage,
  bossId,
  accent,
  onOpenChange,
}: StageDialogProps) {
  const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
  const { setStatus } = useProblemProgress();
  const suggested = nextProblem(stage);

  return (
    <Dialog open={stage !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 font-han sm:max-w-2xl">
        {stage && (
          <>
            <DialogHeader className="border-b border-border/60 p-5 pr-12 text-left">
              <p className="text-xs font-medium" style={{ color: accent }}>
                第 {stage.index + 1} 關
              </p>
              <DialogTitle className="text-lg leading-snug">
                {stage.title}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <StarRow
                      stars={stage.stars}
                      size="h-5 w-5"
                      className="text-muted-foreground"
                    />
                    <span className="tabular-nums text-foreground">
                      {stage.solved} / {stage.total} 題
                    </span>
                    <span className="text-muted-foreground">
                      {stage.stars === 3
                        ? "完美通關！"
                        : `再 AC ${problemsToNextStar(stage)} 題拿到 ${"★".repeat(stage.stars + 1)}`}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(stage.solved / stage.total) * 100}%`,
                        background: accent,
                      }}
                    />
                    {stage.starThresholds.slice(0, 2).map((need, i) => (
                      <span
                        key={i}
                        className="absolute top-0 h-full w-0.5 bg-background"
                        style={{ left: `${(need / stage.total) * 100}%` }}
                      />
                    ))}
                  </div>
                  {stage.state === "locked" && (
                    <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <Lock className="h-3.5 w-3.5" />
                      這關還沒解鎖，但你仍可先偷看題目；AC 任一題就會直接開啟。
                    </p>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <ul className="flex-1 divide-y divide-border/50 overflow-y-auto">
              {stage.problems.map((problem) => {
                const isBoss = problem.id === bossId;
                const isNext = problem.id === suggested?.id;
                return (
                  <li
                    key={problem.id}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3",
                      problem.solved && "bg-emerald-500/5",
                      isNext && "bg-primary/5",
                    )}
                  >
                    <span className="w-5 shrink-0">
                      {problem.solved ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : isBoss ? (
                        <Crown className="h-5 w-5 text-amber-500" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={getLeetCodeProblemUrl(problem.slug, linkLanguage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex max-w-full items-center gap-1 text-sm font-medium hover:underline"
                      >
                        <span className="truncate">
                          {problem.id}. {problem.title}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                      </a>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {problem.rating !== null && (
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: ratingInfo(problem.rating).color }}
                          >
                            {Math.round(problem.rating)}
                          </span>
                        )}
                        {isBoss && (
                          <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                            魔王題 +200 XP
                          </span>
                        )}
                        {isNext && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                            建議下一題
                          </span>
                        )}
                        {problem.isPremium && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                            會員
                          </span>
                        )}
                      </div>
                    </div>
                    {!problem.solved && (
                      <button
                        type="button"
                        onClick={() => setStatus(problem.id, SOLVED_KEY)}
                        className="hidden shrink-0 rounded-md border border-emerald-500/40 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 sm:inline-flex dark:text-emerald-400"
                      >
                        AC ✓
                      </button>
                    )}
                    <ProgressSelector
                      problemId={problem.id}
                      triggerClassName="h-8 w-[6.5rem] text-xs"
                    />
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
              <span>把狀態設成「已解題」就會計入星星與 XP</span>
              <Link
                href={`/studyplan/${planKey}#${sectionAnchor(stage.anchorTitle)}`}
                className="inline-flex shrink-0 items-center gap-1 font-medium hover:text-foreground"
              >
                <TableProperties className="h-3.5 w-3.5" />
                題單與導讀
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
