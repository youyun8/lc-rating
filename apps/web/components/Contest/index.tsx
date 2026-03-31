"use client";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useContests } from "@/hooks/useContests";
import { useProblems } from "@/hooks/useProblems";
import { useSolutions } from "@/hooks/useSolutions";
import { useTags } from "@/hooks/useTags";
import { Problem, Solution } from "@/types";
import { Quodra } from "@/types/common";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import {
  FileText,
  Gauge,
  Sparkles,
  Swords,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { ProblemsTable } from "./ContestTable";
import { TableCol } from "./ContestTable/types";

function ContestPage() {
  const {
    problemMap = {},
    isPending: problemPending,
    error: problemError,
  } = useProblems();
  const {
    contestMap = {},
    isPending: contestPending,
    error: contestError,
  } = useContests();
  const { isPending: tagPending, error: tagError } = useTags();
  const {
    solutionMap = {},
    isPending: solutionPending,
    error: solutionError,
  } = useSolutions();

  const isPending =
    problemPending || contestPending || tagPending || solutionPending;

  useEffect(() => {
    if (problemError) {
      console.error("[Contest] problems Error: ", problemError);
    }
    if (contestError) {
      console.error("[Contest] contests Error: ", contestError);
    }
    if (tagError) {
      console.error("[Contest] tags Error: ", tagError);
    }
    if (solutionError) {
      console.error("[Contest] solutions Error: ", solutionError);
    }
  }, [isPending, contestError, problemError, solutionError, tagError]);

  const tableData: TableCol[] = useMemo(() => {
    if (isPending) {
      return [];
    }

    const contests = Object.values(contestMap);

    return contests.map((contest) => {
      const problems = contest.problemIds.map(
        (problemId) => problemMap[problemId],
      ) as Quodra<Problem>;

      const solutions = problems.map((problem) =>
        problem ? solutionMap[problem._hash] : undefined,
      ) as Quodra<Solution | undefined>;

      const generate = (index: 0 | 1 | 2 | 3) => {
        const problem = problems[index];
        const solution = solutions[index];

        if (!problem) {
          return {
            problem: {
              id: "0",
              title: "Unknown",
              link: {
                zh: "#",
                en: "#",
              },
              rating: 0,
              premium: false,
            },
            solution: undefined,
          };
        }

        return {
          problem: {
            id: problem.id,
            title: normalizeDisplayText(problem.title),
            link: {
              zh: `${LC_HOST_ZH}/problems/${problem.titleSlug}`,
              en: `${LC_HOST_EN}/problems/${problem.titleSlug}`,
            },
            rating: problem.rating,
            premium: problem.premium,
          },
          solution: solution && {
            id: solution.id,
            title: normalizeDisplayText(solution.title),
            link: {
              zh: `${LC_HOST_ZH}/problems/${problem.titleSlug}/solution/${solution.titleSlug}`,
              en: `${LC_HOST_EN}/problems/${problem.titleSlug}/solution/${solution.titleSlug}`,
            },
            time: solution.time || 0,
          },
        };
      };

      return {
        contest: {
          id: contest.id,
          time: contest.time,
          title: normalizeDisplayText(contest.title),
          link: {
            zh: `${LC_HOST_ZH}/contest/${contest.titleSlug}`,
            en: `${LC_HOST_EN}/contest/${contest.titleSlug}`,
          },
        },
        Q1: generate(0),
        Q2: generate(1),
        Q3: generate(2),
        Q4: generate(3),
      };
    });
  }, [isPending, problemMap, contestMap, solutionMap]);

  const contestCount = Object.keys(contestMap).length;
  const overviewStats = useMemo(() => {
    const questions = tableData.flatMap((row) => [row.Q1, row.Q2, row.Q3, row.Q4]);
    const totalProblems = questions.length;
    const solutionCount = questions.filter((item) => Boolean(item.solution)).length;
    const ratedProblems = questions.filter((item) => item.problem.rating > 0);
    const averageRating =
      ratedProblems.length > 0
        ? Math.round(
            ratedProblems.reduce((sum, item) => sum + item.problem.rating, 0) /
              ratedProblems.length,
          )
        : 0;
    const hardestRating =
      ratedProblems.length > 0
        ? Math.max(...ratedProblems.map((item) => item.problem.rating))
        : 0;

    return {
      totalProblems,
      solutionCount,
      averageRating,
      hardestRating,
    };
  }, [tableData]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 md:px-8">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background">
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                比賽題目
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                按場次查看每場比賽的四題難度分布
              </p>
            </div>
            <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 self-start rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="shrink-0">題解來源</span>
              <a
                className="font-medium text-red-600 hover:underline dark:text-red-400"
                href="https://space.bilibili.com/206214/"
                target="_blank"
                rel="noopener noreferrer"
              >
                靈茶山艾府（0x3F）@B站
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Swords className="h-4 w-4" />
                比賽總數
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : contestCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                收錄每場競賽的四題資料
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-4 w-4" />
                題目總數
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.totalProblems}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                方便整批練習同場比賽的四題
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                題解覆蓋
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.solutionCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                可直接跳轉查看的對應題解數
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Gauge className="h-4 w-4" />
                難度概況
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.averageRating}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                平均 rating；最高約 {isPending ? "--" : overviewStats.hardestRating}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              比賽列表
            </h2>
            <p className="text-sm text-muted-foreground">
              依預設由新到舊排序
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-hidden">
          <ProblemsTable tableData={tableData} isPending={isPending} />
        </div>
      </section>
    </div>
  );
}

export default ContestPage;
