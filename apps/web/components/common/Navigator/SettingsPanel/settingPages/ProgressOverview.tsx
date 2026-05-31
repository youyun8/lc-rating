import { Badge } from "@/components/ui/badge";
import { useProgressStats } from "@/features/userData";

const numberFormatter = new Intl.NumberFormat("zh-TW");

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function ProgressOverview() {
  const { tracked, solved, solvedRate, totalProblems, coverageRate, byStatus } =
    useProgressStats();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        這裡會即時顯示你目前的刷題進度。
      </p>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">已標記題目</p>
          <p className="mt-2 text-2xl font-semibold">{formatCount(tracked)}</p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">AC 題數</p>
          <p className="mt-2 text-2xl font-semibold">{formatCount(solved)}</p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">AC 比例</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatPercent(solvedRate)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">覆蓋題庫比例</p>
          <p className="mt-2 text-2xl font-semibold">
            {totalProblems > 0 ? formatPercent(coverageRate) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalProblems > 0
              ? `${formatCount(tracked)} / ${formatCount(totalProblems)}`
              : "題庫載入中"}
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">進度分布</h3>
          <Badge variant="secondary">
            {formatCount(byStatus.length)} 種狀態
          </Badge>
        </div>

        {tracked === 0 ? (
          <p className="text-sm text-muted-foreground">
            目前還沒有任何已標記題目，先去題庫設定一題進度吧。
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {byStatus.map((status) => (
              <div
                key={status.key}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                  <p className="truncate text-sm">{status.label}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCount(status.count)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
