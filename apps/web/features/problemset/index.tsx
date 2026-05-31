"use client";
import { useProgressMap } from "@/features/userData";
import { useCallback, useMemo, useRef, useState } from "react";
import { ProblemsTable } from "./ProblemTable";
import { TableCol } from "./ProblemTable/types";
import { Search } from "./Search";
import { ProblemSetHeader } from "./ProblemSetHeader";
import { useProblemSetData } from "./useProblemSetData";

function ProblemSet() {
  const { tableData, isPending, problemCount, tagCount } = useProblemSetData();
  const progress = useProgressMap();

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

  const visibleCount = searchedData.length;

  const overviewStats = useMemo(() => {
    const total = tableData.length || problemCount;
    const solved = tableData.filter(
      ({ problem }) => progress[problem.id] === "SOLVED",
    ).length;
    const withSolutions = tableData.filter(({ solution }) =>
      Boolean(solution.id),
    ).length;

    return {
      total,
      solved,
      withSolutions,
      totalTags: tagCount,
    };
  }, [problemCount, progress, tableData, tagCount]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 md:px-8">
      <ProblemSetHeader stats={overviewStats} isPending={isPending} />

      <Search
        data={tableData}
        onSearch={handleSearch}
        totalCount={problemCount}
        resultCount={visibleCount}
      />

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
