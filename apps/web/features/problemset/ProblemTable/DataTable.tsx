import { BaseDataTable } from "@/components/common/BaseDataTable";
import { LC_RATING_PROBLEMSET_TABLE_KEY } from "@/config/constants";
import { createTableStore } from "@/hooks/useTableState";
import { genericMemo } from "@/types/common";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { columnInitialTableState, getColumns } from "./columns";
import { key2Label, TableCol } from "./types";

const { useTableState, setState } = createTableStore({
  key: LC_RATING_PROBLEMSET_TABLE_KEY,
  initialState: {
    pagination: {
      pageIndex: 0,
      pageSize: 20,
    },
  },
  ...columnInitialTableState,
});

interface DataTableProps<TData extends TableCol> {
  data: TData[];
  highlightKey?: number;
}

export const DataTable = genericMemo(function <TData extends TableCol>({
  data,
  highlightKey,
}: DataTableProps<TData>) {
  const columns = useMemo(() => getColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.problem.id,
    state: useTableState(),
    onStateChange: (state) => setState(state),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
  });

  useEffect(() => {
    table.resetSorting();
    table.setPageIndex(0);
  }, [data, table]);

  return (
    <BaseDataTable
      table={table}
      columns={columns}
      key2Label={key2Label}
      highlightKey={highlightKey}
      minWidth="min-w-[760px]"
      applySizeStyles
      headerClassName="flex items-center justify-center text-xs font-medium tracking-wide text-muted-foreground"
      cellBorderClassName="align-middle"
    />
  );
});
