import { I18NLink } from "@/components/common/I18NLink";
import { ratingInfo } from "@/components/common/RatingCircle";
import { Input } from "@/components/ui/input";
import { SortIndicator } from "@/components/common/SortIndicator";
import {
  createColumnHelper,
  IdentifiedColumnDef,
  InitialTableState,
} from "@tanstack/react-table";
import { key2Label, Q, TableCol } from "./types";

const columnHelper = createColumnHelper<TableCol>();

interface RatingFilter {
  min?: number;
  max?: number;
}

const isRatingFilter = (value: unknown): value is RatingFilter => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("min" in value ? typeof value.min === "number" : true) &&
    ("max" in value ? typeof value.max === "number" : true)
  );
};

const generate = (
  key: "Q1" | "Q2" | "Q3" | "Q4",
): IdentifiedColumnDef<TableCol, Q> => {
  return {
    header: ({ column }) => {
      const filterValue = column.getFilterValue();
      const min =
        isRatingFilter(filterValue) && Number.isFinite(filterValue.min)
          ? filterValue.min
          : "";
      const max =
        isRatingFilter(filterValue) && Number.isFinite(filterValue.max)
          ? filterValue.max
          : "";

      return (
        <div className="flex min-w-[8.5rem] flex-col items-center gap-1.5 py-1">
          <div className="flex items-center gap-1.5">
            <div>{key2Label[key]}</div>
            <SortIndicator column={column} />
          </div>
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Min"
              value={min}
              onChange={(e) => {
                const value = e.target.value;
                const min = value ? Number(value) : -Infinity;
                column.setFilterValue((prev: RatingFilter | undefined) => ({
                  min,
                  max: prev?.max ?? Infinity,
                }));
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-16 rounded-md border-border/60 bg-background/80 px-1.5 text-center text-xs shadow-none"
            />
            <Input
              type="number"
              placeholder="Max"
              value={max}
              onChange={(e) => {
                const value = e.target.value;
                const max = value ? Number(value) : Infinity;
                column.setFilterValue((prev: RatingFilter | undefined) => ({
                  min: prev?.min ?? -Infinity,
                  max,
                }));
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-16 rounded-md border-border/60 bg-background/80 px-1.5 text-center text-xs shadow-none"
            />
          </div>
        </div>
      );
    },
    cell: ({ row }) => {
      const Q = row.getValue<TableCol[typeof key]>(key);
      const rating = Q.problem.rating;
      const info = ratingInfo(rating);
      return (
        <div className="flex items-start justify-between gap-1.5 py-1.5">
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: info.color }}
            />
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5">
              <I18NLink
                link={Q.problem.link}
                title={
                  Q.problem.id === "1000000000"
                    ? Q.problem.title
                    : `${Q.problem.id}. ${Q.problem.title}`
                }
                className="min-w-0 whitespace-normal break-words text-sm font-normal leading-5 text-foreground transition-colors hover:text-primary hover:underline sm:line-clamp-2"
              />
              <span
                className="mt-0.5 inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums"
                style={{
                  color: info.color,
                  backgroundColor: `${info.color}1a`,
                }}
              >
                {rating.toFixed(0)}
              </span>
            </div>
          </div>
          {Q.solution && (
            <I18NLink
              link={Q.solution.link}
              title="🎈"
              className="mt-0.5 flex-shrink-0 text-base opacity-70 transition-opacity hover:opacity-100 hover:no-underline"
            />
          )}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (a, b) => {
      const A = a.getValue<TableCol[typeof key]>(key);
      const B = b.getValue<TableCol[typeof key]>(key);
      return A.problem.rating - B.problem.rating;
    },
    filterFn: (
      row,
      columnId,
      filterValue: { min: number | undefined; max: number | undefined },
    ) => {
      const q = row.getValue<TableCol[typeof key]>(columnId);
      const rating = q.problem.rating;
      const min = filterValue?.min ?? -Infinity;
      const max = filterValue?.max ?? Infinity;
      return rating >= min && rating <= max;
    },
    enableHiding: true,
  };
};

export const getColumns = () => [
  columnHelper.accessor("contest", {
    header: ({ column }) => (
      <div className="flex items-center gap-2 py-1">
        <span>{key2Label["contest"]}</span>
        <SortIndicator column={column} />
      </div>
    ),
    cell: ({ row }) => {
      const contest = row.getValue<TableCol["contest"]>("contest");
      return (
        <I18NLink
          link={contest.link}
          title={contest.title}
          className="block whitespace-normal text-sm font-medium leading-5 text-foreground transition-colors hover:text-primary hover:underline break-words"
        />
      );
    },
    enableSorting: true,
    sortingFn: (a, b) =>
      a.getValue<TableCol["contest"]>("contest").time -
      b.getValue<TableCol["contest"]>("contest").time,
    enableHiding: true,
  }),
  columnHelper.accessor("Q1", generate("Q1")),
  columnHelper.accessor("Q2", generate("Q2")),
  columnHelper.accessor("Q3", generate("Q3")),
  columnHelper.accessor("Q4", generate("Q4")),
];

export const columnInitialTableState: InitialTableState = {
  sorting: [
    {
      id: "contest",
      desc: true,
    },
  ],
};
