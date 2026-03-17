import { Column } from "@tanstack/react-table";
import { ArrowDownUp, MoveDown, MoveUp } from "lucide-react";

interface SortIndicatorProps<TData> {
  column: Column<TData, unknown>;
}

export function SortIndicator<TData>({ column }: SortIndicatorProps<TData>) {
  if (!column.getCanSort()) {
    return null;
  } else if (!column.getIsSorted()) {
    return <ArrowDownUp size="1em" />;
  } else if (column.getIsSorted() === "desc") {
    return <MoveDown size="1em" />;
  } else {
    return <MoveUp size="1em" />;
  }
}
