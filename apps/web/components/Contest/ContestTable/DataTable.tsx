import { BaseDataTable } from "@/components/common/BaseDataTable";
import { Separator } from "@/components/ui/separator";
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
    columnResizeMode: "onChange",
  });

  return (
    <BaseDataTable
      table={table}
      columns={columns}
      key2Label={key2Label}
      minWidth="min-w-[900px]"
      headerClassName="flex items-center justify-center font-extrabold"
      cellBorderClassName="border border-muted-foreground/50"
      separator={<Separator />}
    />
  );
});
