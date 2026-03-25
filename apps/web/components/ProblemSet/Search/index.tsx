import { Button } from "@/components/ui-customized/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsDownUp, ChevronsUpDown, Filter } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TableCol } from "../ProblemTable/types";
import { RatingFilter } from "./RatingFilter";
import { TagFilter } from "./TagFilter";
import { WordFilter } from "./WordFilter";

interface SearchProps {
  data: TableCol[];
  onSearch: (similarities: number[]) => void;
  totalCount: number;
  resultCount: number;
}

const Search = React.memo(
  ({ data, onSearch, totalCount, resultCount }: SearchProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [similaritiesMap, setSimilartiesMap] = useState<
      Record<string, number[]>
    >({});
    const [resets, setResets] = useState<Record<string, () => void>>({});
    const handleConfirmRef = useRef<(() => void) | null>(null);

    const updateIndices = useCallback(
      (name: string, newSimilarties: number[]) => {
        setSimilartiesMap((prev) => {
          const next = { ...prev };
          next[name] = newSimilarties;
          return next;
        });
      },
      [],
    );

    const updateReset = useCallback((idx: string, newReset: () => void) => {
      setResets((prev) => {
        const next = { ...prev };
        next[idx] = newReset;
        return next;
      });
    }, []);

    const handleConfirm = useCallback(() => {
      const results = Object.values(similaritiesMap).reduce(
        (total, arr) => {
          arr.forEach((val, idx) => {
            if (total[idx]) {
              total[idx] *= val;
            }
          });
          return total;
        },
        Array.from({ length: data.length }, () => 1),
      );

      onSearch(results);
    }, [similaritiesMap, data.length, onSearch]);

    useEffect(() => {
      handleConfirmRef.current = handleConfirm;
    }, [handleConfirm]);

    const debouncedConfirm = useCallback(() => {
      if (handleConfirmRef.current) {
        handleConfirmRef.current();
      }
    }, []);

    const handleReset = useCallback(() => {
      Object.values(resets).forEach((fn) => fn?.());
      setSimilartiesMap({});
      onSearch(data.map(() => 1));
    }, [resets, onSearch, data]);

    const isFiltered = totalCount > 0 && resultCount !== totalCount;
    const resultCopy =
      totalCount === 0
        ? "資料載入中..."
        : resultCount === 0
          ? "目前沒有符合條件的題目"
          : isFiltered
            ? `目前顯示 ${resultCount} / ${totalCount} 道題目`
            : `目前顯示全部 ${totalCount} 道題目`;

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm"
      >
        <div className="border-b border-border/60 bg-muted/20 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                搜尋與篩選
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                可搜尋競賽、題號、題名與題解。輸入關鍵字後按下「確認」，或使用下方進階篩選縮小結果。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-fit">
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">目前顯示</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {resultCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">資料總數</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <WordFilter
              name={"WordFilter"}
              data={data}
              registerReset={updateReset}
              onChange={updateIndices}
            />
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full shrink-0 gap-1.5 sm:mt-7 sm:w-auto"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{isOpen ? "收起篩選" : "進階篩選"}</span>
              {isOpen ? (
                <ChevronsDownUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronsUpDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-5 border-t border-border px-4 py-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                難度範圍
              </p>
              <RatingFilter
                name={"RatingFilter"}
                data={data}
                registerReset={updateReset}
                onChange={updateIndices}
                onDebouncedConfirm={debouncedConfirm}
              />
            </div>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                演算法標籤
              </p>
              <TagFilter
                name={"TagFilter"}
                data={data}
                registerReset={updateReset}
                onChange={updateIndices}
              />
            </div>
          </div>
        </CollapsibleContent>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{resultCopy}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleConfirm}
              variant="default"
              size="sm"
              className="w-full cursor-pointer px-6 sm:w-auto"
            >
              確認
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="w-full cursor-pointer px-6 sm:w-auto"
            >
              重置
            </Button>
          </div>
        </div>
      </Collapsible>
    );
  },
);

Search.displayName = "Search";
export { Search };
