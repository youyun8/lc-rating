import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-8 w-1/1" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-5/6" />
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-8 w-1/1" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-5/6" />
      <Skeleton className="h-8 w-4/5" />
    </div>
  );
}
