import { I18NLink } from "@/components/common/I18NLink";
import { I18NTag } from "@/components/common/I18NTag";
import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import { SortIndicator } from "@/components/common/SortIndicator";
import { createColumnHelper, InitialTableState } from "@tanstack/react-table";
import { key2Label, TableCol } from "./types";

const columnHelper = createColumnHelper<TableCol>();

export const getColumns = () => [
  columnHelper.accessor("contest", {
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        {key2Label["contest"]}
        <SortIndicator column={column} />
      </div>
    ),
    cell: ({ row }) => {
      const contest = row.getValue<TableCol["contest"]>("contest");
      if (!contest.id) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }
      return (
        <I18NLink
          link={contest.link}
          title={contest.title}
          className="block max-w-[12rem] truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
        />
      );
    },
    sortingFn: (a, b) =>
      a.getValue<TableCol["contest"]>("contest").time -
      b.getValue<TableCol["contest"]>("contest").time,
    enableHiding: true,
  }),
  columnHelper.accessor("problem", {
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        {key2Label["problem"]}
        <SortIndicator column={column} />
      </div>
    ),
    cell: ({ row }) => {
      const problem = row.getValue<TableCol["problem"]>("problem");
      return (
        <I18NLink
          link={problem.link}
          title={
            problem.id === "1000000000"
              ? problem.title
              : `${problem.id}. ${problem.title}`
          }
          className="block min-w-[14rem] max-w-[20rem] text-sm font-medium leading-6 text-foreground transition-colors hover:text-primary"
        />
      );
    },
    sortingFn: (a, b) =>
      parseInt(a.getValue<TableCol["problem"]>("problem").id) -
      parseInt(b.getValue<TableCol["problem"]>("problem").id),
    enableHiding: true,
  }),
  columnHelper.accessor("rating", {
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        {key2Label["rating"]}
        <SortIndicator column={column} />
      </div>
    ),
    cell: ({ row }) => {
      const rating = row.getValue<number>("rating");
      const info = ratingInfo(rating);
      return (
        <div className="flex items-center justify-center">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
            style={{ color: info.color, backgroundColor: `${info.color}1a` }}
          >
            {rating.toFixed(0)}
          </span>
        </div>
      );
    },
    enableHiding: true,
  }),
  columnHelper.accessor("tags", {
    header: () => <div>{key2Label["tags"]}</div>,
    cell: ({ row }) => {
      const tags = row.getValue<TableCol["tags"]>("tags");
      return (
        <div className="mx-auto flex max-w-[240px] flex-wrap items-center justify-center gap-1 md:max-w-[280px]">
          {tags.map((tag) => (
            <I18NTag key={tag.id} label={tag.label} />
          ))}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  }),
  columnHelper.accessor("progress", {
    header: () => <div>{key2Label["progress"]}</div>,
    cell: ({ row }) => {
      const progress = row.getValue<TableCol["progress"]>("progress");
      return (
        <div className="w-fit mx-auto">
          <ProgressSelector problemId={progress.problemId} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  }),
  columnHelper.accessor("solution", {
    header: () => <div>{key2Label["solution"]}</div>,
    cell: ({ row }) => {
      const solution = row.getValue<TableCol["solution"]>("solution");
      if (!solution.id) {
        return <span className="text-xs text-muted-foreground">暫無</span>;
      }
      return (
        <I18NLink
          link={solution.link}
          title={solution.title}
          className="block max-w-[12rem] text-sm text-muted-foreground transition duration-300 hover:text-foreground"
        />
      );
    },
    enableSorting: false,
    enableHiding: true,
  }),
];

export const columnInitialTableState: InitialTableState = {
  sorting: [
    // {
    //   id: "problem",
    //   desc: true,
    // },
  ],
};
