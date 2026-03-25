import { Button } from "@/components/ui-customized/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useCallback } from "react";
import { PageJumper } from "./PageJumper";
import { PageResizer } from "./PageResizer";

interface PaginationControlsProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
}

const PageControl = React.memo(
  ({
    pageIndex,
    pageCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
  }: PaginationControlsProps) => {
    const handleSelectChange = useCallback(
      (value: number) => onPageSizeChange(value),
      [onPageSizeChange],
    );

    const handlePrevClick = useCallback(() => {
      if (canPreviousPage) {
        previousPage();
      }
    }, [canPreviousPage, previousPage]);

    const handleNextClick = useCallback(() => {
      if (canNextPage) {
        nextPage();
      }
    }, [canNextPage, nextPage]);

    return (
      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-1">
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 sm:justify-center">
            <span className="text-sm text-muted-foreground text-nowrap">
              每頁顯示
            </span>
            <PageResizer
              options={[20, 30, 50, 100, 200, 500, 1000]}
              value={pageSize}
              onValueChange={handleSelectChange}
            />
          </div>
          <div className="rounded-lg border bg-background px-3 py-2 text-center text-sm text-muted-foreground">
            第{" "}
            <span className="font-semibold text-foreground">
              {`${pageIndex + 1} / ${pageCount}`}
            </span>{" "}
            頁
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:w-auto xl:flex-none">
          <Pagination className="w-full sm:w-auto">
            <PaginationContent className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center">
              <PaginationItem>
                <Button
                  variant="outline"
                  onClick={handlePrevClick}
                  disabled={!canPreviousPage}
                  aria-label="Go to previous page"
                  size="default"
                  className="h-9 w-full justify-center gap-1 px-3 sm:w-auto"
                >
                  <ChevronLeftIcon />
                  <span>上一頁</span>
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="outline"
                  onClick={handleNextClick}
                  disabled={!canNextPage}
                  aria-label="Go to next page"
                  size="default"
                  className="h-9 w-full justify-center gap-1 px-3 sm:w-auto"
                >
                  <span>下一頁</span>
                  <ChevronRightIcon />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <PageJumper
            pageIndex={pageIndex}
            pageCount={pageCount}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    );
  },
);

PageControl.displayName = "PageControl";
export { PageControl };
