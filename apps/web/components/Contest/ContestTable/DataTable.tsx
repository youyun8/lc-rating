import { PageControl } from "@/components/common/PageControl";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { genericMemo } from "@/types/common";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { columnInitialTableState, getColumns } from "./columns";
import { TableCol } from "./types";
import { VisibilityControl } from "./VisibilityControl";

interface DataTableProps<TData extends TableCol> {
  data: TData[];
}

export const DataTable = genericMemo(function <TData extends TableCol>({
  data,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      ...columnInitialTableState,
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      columnVisibility,
    },
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
  });

  const tableState = table.getState();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-center p-2 gap-2">
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
        <div className="hidden sm:block">
          <VisibilityControl table={table} />
        </div>
      </div>

      <Separator />

      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="border border-muted-foreground">
                    <div
                      className={cn(
                        "flex items-center justify-center font-extrabold",
                        {
                          "cursor-pointer": header.column.getCanSort(),
                        }
                      )}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border border-muted-foreground/50">
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

      <Separator />

      <div className="flex flex-col sm:flex-row items-center justify-center p-2 gap-2">
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
        <div className="sm:hidden">
          <VisibilityControl table={table} />
        </div>
      </div>
    </div>
  );
});