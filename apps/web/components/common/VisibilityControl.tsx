import { Button } from "@/components/ui-customized/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import { EyeOff } from "lucide-react";

interface VisibilityControlProps<TData> {
  table: Table<TData>;
  key2Label: Record<string, string>;
  className?: string;
}

export function VisibilityControl<TData>({
  table,
  key2Label,
  className,
}: VisibilityControlProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-center", className)}>
          <EyeOff className="w-4 h-4 mr-2" />
          顯示欄位
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(60vh,22rem)] w-48 overflow-y-auto"
      >
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {key2Label[column.id]}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
