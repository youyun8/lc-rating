import { BaseDataTable } from "@/components/common/BaseDataTable";
import { genericMemo } from "@/types/common";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { columnInitialTableState, getColumns } from "./columns";
import { key2Label, TableCol } from "./types";

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
  });

  return (
    <BaseDataTable
      table={table}
      columns={columns}
      key2Label={key2Label}
      minWidth="w-full table-auto"
      headerClassName="flex items-center justify-center text-center text-xs font-normal tracking-wider text-lime-900 dark:text-lime-100"
      headerBorderClassName="border-b border-lime-200/80 bg-lime-50/80 align-top whitespace-normal dark:border-lime-900/60 dark:bg-lime-950/30"
      cellBorderClassName="border-b border-lime-100/80 align-top whitespace-normal dark:border-lime-900/40"
      rowClassName="transition-colors hover:bg-lime-50/70 dark:hover:bg-lime-950/25"
    />
  );
});
