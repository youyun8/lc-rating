import { CheckCircle2, FileText, Tags } from "lucide-react";

export interface ProblemSetStats {
  total: number;
  solved: number;
  withSolutions: number;
  totalTags: number;
}

interface ProblemSetHeaderProps {
  stats: ProblemSetStats;
  isPending: boolean;
}

export function ProblemSetHeader({ stats, isPending }: ProblemSetHeaderProps) {
  return (
    <div className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              題庫
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              完整的 LeetCode 題庫，可依題號、題名、競賽、難度、標籤與進度篩選。
            </p>
          </div>
          <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 self-start rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground">
            <span className="shrink-0">題解來源</span>
            <a
              className="font-medium text-red-600 hover:underline dark:text-red-400"
              href="https://space.bilibili.com/206214/"
              target="_blank"
              rel="noopener noreferrer"
            >
              靈茶山艾府（0x3F）@B站
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              題目總數
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {isPending ? "--" : stats.total}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              涵蓋競賽題與常見演算法主題
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              已完成
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {isPending ? "--" : stats.solved}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              已標記為 AC 的題目數
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <FileText className="h-4 w-4" />
              題解數量
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {isPending ? "--" : stats.withSolutions}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              可直接跳轉查看的 0x3F 題解
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Tags className="h-4 w-4" />
              標籤覆蓋
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {isPending ? "--" : stats.totalTags}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              支援用演算法標籤快速篩選
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
