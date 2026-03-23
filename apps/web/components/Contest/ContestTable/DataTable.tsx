import { BaseDataTable } from "@/components/common/BaseDataTable";
import { genericMemo } from "@/types/common";
import {
  ColumnSizingState,
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

const CHAR_PX = 8;
const BASE_PX = 50;
const CONTEST_CHAR_PX = 5;
const CONTEST_BASE_PX = 16;
const MIN_CONTEST_PX = 80;
// Q headers contain two filter inputs (~120px), so enforce a larger minimum.
const MIN_Q_PX = 160;

function avgLen(strs: string[]): number {
  return strs.reduce((sum, s) => sum + s.length, 0) / strs.length;
}

function problemTitle(data: TableCol[], key: "Q1" | "Q2" | "Q3" | "Q4"): string[] {
  return data.map((r) => {
    const p = r[key].problem;
    return p.id === "1000000000" ? p.title : `${p.id}. ${p.title}`;
  });
}

export const DataTable = genericMemo(function <TData extends TableCol>({
  data,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = useMemo(() => getColumns(), []);

  const columnSizing = useMemo((): ColumnSizingState => {
    if (!data.length) return {};
    return {
      contest: Math.max(MIN_CONTEST_PX, avgLen(data.map((r) => r.contest.title)) * CONTEST_CHAR_PX + CONTEST_BASE_PX),
      Q1: Math.max(MIN_Q_PX, avgLen(problemTitle(data, "Q1")) * CHAR_PX + BASE_PX),
      Q2: Math.max(MIN_Q_PX, avgLen(problemTitle(data, "Q2")) * CHAR_PX + BASE_PX),
      Q3: Math.max(MIN_Q_PX, avgLen(problemTitle(data, "Q3")) * CHAR_PX + BASE_PX),
      Q4: Math.max(MIN_Q_PX, avgLen(problemTitle(data, "Q4")) * CHAR_PX + BASE_PX),
    };
  }, [data]);

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
      columnSizing,
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
      minWidth="table-fixed"
      applySizeStyles
      headerClassName="flex items-center justify-center text-xs font-medium tracking-wider text-muted-foreground"
      headerBorderClassName="border-b border-border bg-muted/30"
      cellBorderClassName="border-b border-border"
      rowClassName="hover:bg-muted/20 transition-colors"
    />
  );
});
