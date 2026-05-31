import { TableSkeleton } from "@/components/common/TableSkeleton";
import { DataTable } from "./DataTable";
import { TableCol } from "./types";

interface ProblemsTableProps {
  tableData: TableCol[];
  isPending: boolean;
  highlightKey?: number;
}

export function ProblemsTable({
  tableData,
  isPending,
  highlightKey,
}: ProblemsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {isPending ? (
        <TableSkeleton />
      ) : (
        <DataTable data={tableData} highlightKey={highlightKey} />
      )}
    </div>
  );
}
