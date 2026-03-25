"use client";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useContests } from "@/hooks/useContests";
import { useProblems } from "@/hooks/useProblems";
import { useSolutions } from "@/hooks/useSolutions";
import { useTags } from "@/hooks/useTags";
import { Problem, Solution } from "@/types";
import { Quodra } from "@/types/common";
import { useEffect, useMemo } from "react";
import { ProblemsTable } from "./ContestTable";
import { TableCol } from "./ContestTable/types";

function ProblemSet() {
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
      console.error("[ProblemSet] problems Error: ", problemError);
    }
    if (contestError) {
      console.error("[ProblemSet] contests Error: ", contestError);
    }
    if (tagError) {
      console.error("[ProblemSet] tags Error: ", tagError);
    }
    if (solutionError) {
      console.error("[ProblemSet] solutions Error: ", solutionError);
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
            title: problem.title,
            link: {
              zh: `${LC_HOST_ZH}/problems/${problem.titleSlug}`,
              en: `${LC_HOST_EN}/problems/${problem.titleSlug}`,
            },
            rating: problem.rating,
            premium: problem.premium,
          },
          solution: solution && {
            id: solution.id,
            title: solution.title,
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
          title: contest.title,
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

  return (
    <div className="flex flex-col gap-5 px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            比賽題目
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPending
              ? "\u00a0"
              : `${contestCount} 場比賽 · 收錄每場競賽的四題與題解連結`}
          </p>
        </div>
        <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
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

      {/* Table */}
      <div className="w-full overflow-x-hidden">
        <ProblemsTable tableData={tableData} isPending={isPending} />
      </div>
    </div>
  );
}

export default ProblemSet;
