"use client";
import { LC_HOST_EN, LC_HOST_ZH } from "@/config/constants";
import { useProgressStore } from "@/hooks/useProgress";
import { useContests } from "@/hooks/useContests";
import { useProblems } from "@/hooks/useProblems";
import { useSolutions } from "@/hooks/useSolutions";
import { useTags } from "@/hooks/useTags";
import { isTruthy } from "@/types/common";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import { CheckCircle2, FileText, Tags } from "lucide-react";

import { useCallback, useMemo, useRef, useState } from "react";
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
  const progress = useProgressStore((state) => state.progress);

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
      const contest =
        problem.contestId !== undefined
          ? contestMap[problem.contestId]
          : undefined;
      const solution = solutionMap[problem._hash];

      return {
        id: problem.id,
        title: normalizeDisplayText(problem.title),
        rating: problem.rating,
        titleSlug: problem.titleSlug,
        premium: problem.premium,
        contest: contest
          ? {
              ...contest,
              title: normalizeDisplayText(contest.title),
            }
          : undefined,
        tags: problem.tagIds.map((tagId) => tagMap[tagId]).filter(isTruthy),
        solution: solution
          ? {
              ...solution,
              title: normalizeDisplayText(solution.title),
            }
          : undefined,
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
  }, [
    contestError,
    contestMap,
    problemError,
    problemMap,
    solutionError,
    solutionMap,
    tagError,
    tagMap,
  ]);

  const [similarities, setSimilarties] = useState<number[] | undefined>();
  const [searchKey, setSearchKey] = useState(0);
  const tableRef = useRef<HTMLElement>(null);

  const handleSearch = useCallback(
    (similarities: number[], options?: { scroll?: boolean }) => {
      setSimilarties(similarities);
      if (options?.scroll) {
        setSearchKey((k) => k + 1);
        requestAnimationFrame(() => {
          tableRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    },
    [],
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
  const visibleCount = searchedData.length;

  const overviewStats = useMemo(() => {
    const total = tableData.length || problemCount;
    const solved = tableData.filter(
      ({ problem }) => progress[problem.id] === "SOLVED",
    ).length;
    const withSolutions = tableData.filter(({ solution }) =>
      Boolean(solution.id),
    ).length;
    const totalTags = Object.keys(tagMap).length;

    return {
      total,
      solved,
      withSolutions,
      totalTags,
    };
  }, [problemCount, progress, tableData, tagMap]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 md:px-8">
      {/* Header */}
      <div className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-[0_30px_80px_-50px_rgba(168,83,186,0.55)]">
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="brand-text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
                題庫
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                按題號、題名、競賽、難度、標籤與進度快速縮小範圍
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
            <div className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                題目總數
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.total}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                涵蓋競賽題與常見演算法主題
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                已完成
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.solved}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                已標記為 AC 的題目數
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-4 w-4" />
                題解數量
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.withSolutions}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                可直接跳轉查看的 0x3F 題解
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Tags className="h-4 w-4" />
                標籤覆蓋
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {isPending ? "--" : overviewStats.totalTags}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                支援用演算法標籤快速篩選
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Search
        data={tableData}
        onSearch={handleSearch}
        totalCount={problemCount}
        resultCount={visibleCount}
      />

      {/* Table */}
      <section
        ref={tableRef}
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              搜尋結果
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "正在載入題目資料..."
                : `目前顯示 ${visibleCount} / ${problemCount} 道題目`}
            </p>
          </div>
          {!isPending && visibleCount !== problemCount ? (
            <div className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
              已篩掉 {problemCount - visibleCount} 道題目
            </div>
          ) : null}
        </div>

        <div className="w-full overflow-x-hidden">
          <ProblemsTable
            tableData={searchedData}
            isPending={isPending}
            highlightKey={searchKey}
          />
        </div>
      </section>
    </div>
  );
}

export default ProblemSet;
