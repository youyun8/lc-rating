"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ListChecks, Sparkles } from "lucide-react";

import { ProblemList } from "@/components/StudyPlan/ProblemList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgressStore } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import type { StudyPlanData } from "@/types";
import {
  getPracticeDifficulty,
  pickRecommendedPractice,
  RECOMMENDED_MIN_RATING,
} from "@/features/learning/utils/practice";

type PracticeTab = "recommended" | "todo" | "done" | "all";
type DifficultyFilter = "all" | "foundation" | "core" | "challenge" | "unrated";

interface SectionPracticePanelProps {
  problems: StudyPlanData.Item[];
  title?: string;
}

const difficultyLabels: Record<DifficultyFilter, string> = {
  all: "全部",
  foundation: "< 1600",
  core: "1600-2199",
  challenge: "2200+",
  unrated: "無評分",
};

function getProblemId(problem: StudyPlanData.Item) {
  return problem.id?.toString();
}

function isSolved(
  problem: StudyPlanData.Item,
  progress: Record<string, string | undefined>,
) {
  const id = getProblemId(problem);
  return id ? progress[id] === "SOLVED" : false;
}

function filterByDifficulty(
  problems: StudyPlanData.Item[],
  difficulty: DifficultyFilter,
) {
  if (difficulty === "all") return problems;
  return problems.filter(
    (problem) => getPracticeDifficulty(problem) === difficulty,
  );
}

function uniqueProblems(problems: StudyPlanData.Item[]) {
  const seen = new Set<string>();
  return problems.filter((problem) => {
    const key = problem.slug || getProblemId(problem);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function SectionPracticePanel({
  problems,
  title = "章節練習",
}: SectionPracticePanelProps) {
  const [tab, setTab] = useState<PracticeTab>("recommended");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const progress = useProgressStore((state) => state.progress);

  const allProblems = useMemo(() => uniqueProblems(problems), [problems]);
  const recommended = useMemo(
    () => pickRecommendedPractice(allProblems),
    [allProblems],
  );

  const counts = useMemo(() => {
    const solved = allProblems.filter((problem) => isSolved(problem, progress));
    return {
      all: allProblems.length,
      done: solved.length,
      todo: allProblems.length - solved.length,
      recommended: recommended.length,
    };
  }, [allProblems, progress, recommended.length]);

  const visibleProblems = useMemo(() => {
    const base =
      tab === "recommended"
        ? recommended
        : tab === "done"
          ? allProblems.filter((problem) => isSolved(problem, progress))
          : tab === "todo"
            ? allProblems.filter((problem) => !isSolved(problem, progress))
            : allProblems;

    return filterByDifficulty(base, difficulty);
  }, [allProblems, difficulty, progress, recommended, tab]);

  const completionPct =
    counts.all > 0 ? Math.round((counts.done / counts.all) * 100) : 0;

  if (allProblems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {title}
            </span>
            <span className="text-xs text-muted-foreground">
              推薦題優先選擇分數 {">="} {RECOMMENDED_MIN_RATING} 的題目
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
              <ListChecks className="h-3.5 w-3.5" />
              {counts.all} 題
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {counts.done} 題完成
            </span>
          </div>
        </div>

        <div className="min-w-[12rem]">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>完成率</span>
            <span className="font-medium text-foreground">
              {completionPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as PracticeTab)}
        >
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="recommended">
              推薦 {counts.recommended}
            </TabsTrigger>
            <TabsTrigger value="todo">待完成 {counts.todo}</TabsTrigger>
            <TabsTrigger value="done">已完成 {counts.done}</TabsTrigger>
            <TabsTrigger value="all">全部 {counts.all}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(difficultyLabels) as DifficultyFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                difficulty === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onClick={() => setDifficulty(key)}
            >
              {difficultyLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {visibleProblems.length > 0 ? (
        <ProblemList problems={visibleProblems} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          目前篩選條件下沒有題目。
        </div>
      )}
    </div>
  );
}
