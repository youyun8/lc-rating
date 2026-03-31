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
import { ColumnDef, flexRender, Table as TanstackTable } from "@tanstack/react-table";
import React from "react";

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
  renderHeaderExtra?: (header: { column: { getCanSort: () => boolean; getToggleSortingHandler: () => ((event: unknown) => void) | undefined } }) => React.ReactNode;
}

export function BaseDataTable<TData>({
  table,
  columns,
  key2Label,
  minWidth = "min-w-[800px]",
  headerClassName = "flex items-center justify-center",
  headerBorderClassName = "border border-muted-foreground",
  cellBorderClassName = "border border-muted-foreground/30",
  rowClassName,
  separator,
}: BaseDataTableProps<TData>) {
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
      <div className="flex flex-col sm:flex-row items-center justify-center p-2 gap-2">
        {pageControl}
        <div className="hidden sm:block">
          <VisibilityControl table={table} key2Label={key2Label} />
        </div>
      </div>

      {separator}

      <div className="overflow-x-auto">
        <Table className={minWidth}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={headerBorderClassName}>
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
                            header.getContext()
                          )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={rowClassName}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellBorderClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暫無資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {separator}

      <div className="flex flex-col sm:flex-row items-center justify-center p-2 gap-2">
        {pageControl}
        <div className="sm:hidden">
          <VisibilityControl table={table} key2Label={key2Label} />
        </div>
      </div>
    </div>
  );
}
