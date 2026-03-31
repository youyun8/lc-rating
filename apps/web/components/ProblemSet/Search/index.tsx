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
}

const Search = React.memo(({ data, onSearch }: SearchProps) => {
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
    []
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
      Array.from({ length: data.length }, () => 1)
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
    onSearch(data.map((_, idx) => idx));
  }, [resets, onSearch, data]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1">
          <WordFilter
            name={"WordFilter"}
            data={data}
            registerReset={updateReset}
            onChange={updateIndices}
          />
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            {isOpen ? (
              <>
                <span className="hidden sm:inline">收起篩選</span>
                <ChevronsDownUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">展開篩選</span>
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="border-t border-border px-4 py-3 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">難度範圍</p>
            <RatingFilter
              name={"RatingFilter"}
              data={data}
              registerReset={updateReset}
              onChange={updateIndices}
              onDebouncedConfirm={debouncedConfirm}
            />
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">演算法標籤</p>
            <TagFilter
              name={"TagFilter"}
              data={data}
              registerReset={updateReset}
              onChange={updateIndices}
            />
          </div>
        </div>
      </CollapsibleContent>

      <div className="flex justify-center gap-3 p-3 border-t border-border">
        <Button
          onClick={handleConfirm}
          variant="default"
          size="sm"
          className="cursor-pointer px-6"
        >
          確認
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="cursor-pointer px-6"
        >
          重置
        </Button>
      </div>
    </Collapsible>
  );
});

Search.displayName = "Search";
export { Search };