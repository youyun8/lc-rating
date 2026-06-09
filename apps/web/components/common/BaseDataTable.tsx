import { PageControl } from "@/components/common/PageControl";
import { VisibilityControl } from "@/components/common/VisibilityControl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  Table as TanstackTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";

interface BaseDataTableProps<TData> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  key2Label: Record<string, string>;
  minWidth?: string;
  headerClassName?: string;
  headerBorderClassName?: string;
  cellBorderClassName?: string;
  rowClassName?: string;
  separator?: React.ReactNode;
  renderHeaderExtra?: (header: {
    column: {
      getCanSort: () => boolean;
      getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
    };
  }) => React.ReactNode;
  /** When true, applies each column's TanStack size as an inline width style on <th> elements. Useful with table-fixed layout. */
  applySizeStyles?: boolean;
  /** Changing this value triggers a brief highlight animation on visible rows. */
  highlightKey?: number;
}

export function BaseDataTable<TData>({
  table,
  columns,
  key2Label,
  minWidth = "min-w-[800px]",
  headerClassName = "flex items-center justify-center",
  headerBorderClassName = "",
  cellBorderClassName = "",
  rowClassName,
  separator,
  applySizeStyles = false,
  highlightKey,
}: BaseDataTableProps<TData>) {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (highlightKey && highlightKey > 0) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [highlightKey]);
  const tableState = table.getState();

  const pageControl = (
    <PageControl
      pageSize={tableState.pagination.pageSize}
      onPageSizeChange={table.setPageSize}
      pageIndex={tableState.pagination.pageIndex}
      pageCount={table.getPageCount()}
      onPageChange={table.setPageIndex}
      canPreviousPage={table.getCanPreviousPage()}
      canNextPage={table.getCanNextPage()}
      previousPage={table.previousPage}
      nextPage={table.nextPage}
    />
  );

  return (
    <div>
      <div className="border-b border-border/60 bg-muted/20 px-3 py-3">
        <div className="flex flex-col gap-3">
          {pageControl}
          <div className="hidden sm:flex sm:justify-end">
            <VisibilityControl table={table} key2Label={key2Label} />
          </div>
        </div>
      </div>

      {separator}

      <div className="px-3 pt-2 text-xs text-muted-foreground sm:hidden">
        可左右滑動查看完整表格
      </div>

      <div className="overflow-x-auto overscroll-x-contain">
        <Table className={cn(minWidth, applySizeStyles && "table-fixed")}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              const totalSize = applySizeStyles
                ? headerGroup.headers.reduce(
                    (sum, h) => sum + h.column.getSize(),
                    0,
                  )
                : 0;
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={headerBorderClassName}
                      style={
                        applySizeStyles
                          ? {
                              width: `${(header.column.getSize() / totalSize) * 100}%`,
                            }
                          : undefined
                      }
                    >
                      <div
                        className={cn(headerClassName, {
                          "cursor-pointer": header.column.getCanSort(),
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  data-problem-id={row.id}
                  className={cn(
                    rowClassName,
                    isHighlighted && "animate-search-highlight",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellBorderClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  暫無資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {separator}

      <div className="border-t border-border/60 bg-muted/20 px-3 py-3">
        <div className="flex flex-col gap-3">{pageControl}</div>
        <div className="sm:hidden">
          <VisibilityControl
            table={table}
            key2Label={key2Label}
            className="w-full justify-center"
          />
        </div>
      </div>
    </div>
  );
}
