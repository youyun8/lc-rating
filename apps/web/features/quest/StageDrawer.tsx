"use client";

import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProblemProgress } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { cn } from "@/lib/utils";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import { sectionAnchor } from "@/utils/sectionAnchor";
import {
  Check,
  ChevronLeft,
  ChevronRight,
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
  type QuestMap,
  type QuestStage,
} from "./engine";
import { StarRow } from "./PlayerCard";

interface StageDrawerProps {
  planKey: string;
  map: QuestMap;
  stage: QuestStage | null;
  theme: { accent: string; gradient: string };
  onSelect: (stage: QuestStage | null) => void;
}

const stripNumber = (title: string) => title.replace(/^\d+(?:\.\d+)*\s*/, "");

/** Stage details in a side drawer: star meter, problems, quick AC. */
export function StageDrawer({
  planKey,
  map,
  stage,
  theme,
  onSelect,
}: StageDrawerProps) {
  const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
  const { setStatus, clearStatus } = useProblemProgress();
  const suggested = nextProblem(stage);
  const world = stage ? map.worlds[stage.worldIndex] : undefined;
  const bossId = world?.boss?.id ?? null;
  const prev = stage ? map.stages[stage.index - 1] : undefined;
  const next = stage ? map.stages[stage.index + 1] : undefined;

  return (
    <Sheet
      open={stage !== null}
      onOpenChange={(open) => !open && onSelect(null)}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 font-han sm:max-w-lg"
      >
        {stage && (
          <>
            <div
              className="relative overflow-hidden px-5 pb-5 pt-6 text-white"
              style={{ background: theme.gradient }}
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <p className="relative text-xs font-semibold text-white/80">
                {world ? stripNumber(world.title) : ""} · 第 {stage.index + 1}{" "}
                關
              </p>
              <SheetTitle className="relative mt-1 pr-8 text-xl font-bold leading-snug text-white">
                {stripNumber(stage.title)}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="relative mt-3 text-white">
                  <div className="flex items-center gap-3">
                    <StarRow
                      stars={stage.stars}
                      size="h-6 w-6"
                      className="text-white"
                    />
                    <span className="font-num text-sm">
                      {stage.solved}/{stage.total}
                    </span>
                    <span className="ml-auto text-xs text-white/85">
                      {stage.stars === 3
                        ? "完美通關！"
                        : `再 ${problemsToNextStar(stage)} 題 → ${"★".repeat(stage.stars + 1)}`}
                    </span>
                  </div>
                  <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-500"
                      style={{
                        width: `${(stage.solved / stage.total) * 100}%`,
                      }}
                    />
                    {stage.starThresholds.slice(0, 2).map((need, i) => (
                      <span
                        key={i}
                        className="absolute top-0 h-full w-0.5 bg-black/20"
                        style={{ left: `${(need / stage.total) * 100}%` }}
                      />
                    ))}
                  </div>
                  {stage.state === "locked" && (
                    <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1.5 text-xs">
                      <Lock className="h-3.5 w-3.5" />
                      尚未解鎖，但可以先看題目；AC 任一題就會直接開啟。
                    </p>
                  )}
                </div>
              </SheetDescription>
            </div>

            <ul className="flex-1 divide-y divide-border/60 overflow-y-auto">
              {stage.problems.map((problem) => {
                const isBoss = problem.id === bossId;
                const isNext = problem.id === suggested?.id;
                return (
                  <li
                    key={problem.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      isNext && !problem.solved && "bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        problem.solved
                          ? clearStatus(problem.id)
                          : setStatus(problem.id, SOLVED_KEY)
                      }
                      aria-label={
                        problem.solved ? "取消已解題" : "標記為已解題"
                      }
                      title={problem.solved ? "取消已解題" : "標記為已解題"}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        problem.solved
                          ? "border-success bg-success text-white"
                          : "border-border text-transparent hover:border-success hover:text-success",
                      )}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <a
                        href={getLeetCodeProblemUrl(problem.slug, linkLanguage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group inline-flex max-w-full items-center gap-1 text-sm font-medium hover:underline",
                          problem.solved && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          <span className="font-num text-muted-foreground">
                            {problem.id}.
                          </span>{" "}
                          {problem.title}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                      </a>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {problem.rating !== null && (
                          <span
                            className="font-num font-semibold"
                            style={{ color: ratingInfo(problem.rating).color }}
                          >
                            {Math.round(problem.rating)}
                          </span>
                        )}
                        {isBoss && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gold-soft px-1.5 py-0.5 font-semibold text-gold-ink">
                            <Crown className="h-3 w-3" />
                            魔王 +200 XP
                          </span>
                        )}
                        {isNext && !problem.solved && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
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
                    {/* On phones the check circle is enough; titles need the room. */}
                    <div className="hidden sm:block">
                      <ProgressSelector
                        problemId={problem.id}
                        triggerClassName="h-8 w-[6.5rem] text-xs"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-3">
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && onSelect(prev)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                上一關
              </button>
              <Link
                href={`/studyplan/${planKey}#${sectionAnchor(stage.anchorTitle)}`}
                className="mx-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <TableProperties className="h-3.5 w-3.5" />
                題單與導讀
              </Link>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && onSelect(next)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
              >
                下一關
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
