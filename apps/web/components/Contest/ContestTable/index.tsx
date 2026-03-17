import { TableSkeleton } from "@/components/common/TableSkeleton";
import { DataTable } from "./DataTable";
import { TableCol } from "./types";

interface ProblemsTableProps {
  tableData: TableCol[];
  isPending: boolean;
}

export function ProblemsTable({ tableData, isPending }: ProblemsTableProps) {
  return (
    <div className="rounded-md border">
      {isPending ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable data={tableData} />
        </>
      )}
    </div>
  );
}
