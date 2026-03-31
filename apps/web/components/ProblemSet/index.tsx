"use client";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useContests } from "@/hooks/useContests";
import { useProblems } from "@/hooks/useProblems";
import { useSolutions } from "@/hooks/useSolutions";
import { useTags } from "@/hooks/useTags";
import { isTruthy } from "@/types/common";

import { useCallback, useMemo, useState } from "react";
import { ProblemsTable } from "./ProblemTable";
import { TableCol } from "./ProblemTable/types";
import { Search } from "./Search";

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
  const { tagMap = {}, isPending: tagPending, error: tagError } = useTags();
  const {
    solutionMap = {},
    isPending: solutionPending,
    error: solutionError,
  } = useSolutions();

  const isPending =
    problemPending || contestPending || tagPending || solutionPending;

  const tableData: TableCol[] = useMemo(() => {
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

    const joinProblems = Object.values(problemMap).map((problem) => {
      return {
        id: problem.id,
        title: problem.title,
        rating: problem.rating,
        titleSlug: problem.titleSlug,
        premium: problem.premium,
        contest:
          problem.contestId !== undefined
            ? contestMap[problem?.contestId]
            : undefined,
        tags: problem.tagIds.map((tagId) => tagMap[tagId]).filter(isTruthy),
        solution: solutionMap[problem._hash],
      };
    });
    return joinProblems.map((problem) => {
      return {
        contest: {
          id: problem.contest?.id || "",
          time: problem.contest?.time || 0,
          title: problem.contest?.title || "",
          link: {
            zh: problem.contest
              ? `${LC_HOST_ZH}/contest/${problem.contest.titleSlug}`
              : "",
            en: problem.contest
              ? `${LC_HOST_EN}/contest/${problem.contest.titleSlug}`
              : "",
          },
        },
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
        rating: problem.rating,
        tags: problem.tags.map((tag) => ({
          id: tag.id,
          label: { zh: tag.zh, en: tag.en },
        })),
        progress: {
          problemId: problem.id,
        },
        solution: {
          id: problem.solution?.id || "",
          title: problem.solution?.title || "",
          link: {
            zh: problem.solution
              ? `${LC_HOST_ZH}/problems/${problem.titleSlug}/solution/${problem.solution.titleSlug}`
              : "",
            en: problem.solution
              ? `${LC_HOST_EN}/problems/${problem.titleSlug}/solution/${problem.solution.titleSlug}`
              : "",
          },
          time: problem.solution?.time || 0,
        },
      };
    });
  }, [contestError, contestMap, problemError, problemMap, solutionError, solutionMap, tagError, tagMap]);

  const [similarities, setSimilarties] = useState<number[] | undefined>();

  const handleSearch = useCallback(
    (similarities: number[]) => {
      setSimilarties(similarities);
    },
    []
  );

  const searchedData = useMemo(() => {
    if (similarities === undefined) {
      return tableData;
    }
    const indices = tableData
      .map((_, idx) => idx)
      .filter((idx) => similarities[idx] && similarities[idx] > 0.5);
    indices.sort((a, b) => Number(similarities[b]) - Number(similarities[a]));
    const filtData = indices.map((idx) => tableData[idx] as TableCol);

    return filtData;
  }, [tableData, similarities]);

  const problemCount = Object.keys(problemMap).length;

  return (
    <div className="px-4 md:px-8 py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">題庫</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPending ? "\u00a0" : `${problemCount} 道題目`}
          </p>
        </div>
        <div className="text-xs text-muted-foreground shrink-0 pb-1">
          題解：
          <a
            className="text-red-600 dark:text-red-400 hover:underline"
            href="https://space.bilibili.com/206214/"
            target="_blank"
            rel="noopener noreferrer"
          >
            靈茶山艾府（0x3F）@B站
          </a>
        </div>
      </div>

      {/* Search */}
      <Search data={tableData} onSearch={handleSearch} />

      {/* Table */}
      <div className="w-full overflow-x-hidden">
        <ProblemsTable tableData={searchedData} isPending={isPending} />
      </div>
    </div>
  );
}

export default ProblemSet;
