import { Badge } from "@/components/ui/badge";
import { useOptions } from "@/hooks/useOptions";
import { useProblems } from "@/hooks/useProblems";
import { useProgressStore } from "@/hooks/useProgress";
import { getStudyPlanProblemInfo } from "@/utils/studyPlanIndex";
import Link from "next/link";
import { useMemo } from "react";

const numberFormatter = new Intl.NumberFormat("zh-TW");

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatTimestamp(timestamp?: number) {
  if (!timestamp) return "尚無紀錄";

  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function ProgressOverview() {
  const { getOption } = useOptions();
  const { problemMap } = useProblems();
  const progress = useProgressStore((state) => state.progress);
  const progressUpdatedAt = useProgressStore(
    (state) => state.progressUpdatedAt,
  );

  const progressEntries = useMemo(() => Object.entries(progress), [progress]);
  const trackedCount = progressEntries.length;
  const totalProblemCount = useMemo(
    () => (problemMap ? Object.keys(problemMap).length : 0),
    [problemMap],
  );

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    progressEntries.forEach(([, status]) => {
      counts[status] = (counts[status] ?? 0) + 1;
    });

    return Object.entries(counts)
      .map(([key, count]) => {
        const option = getOption(key);
        return {
          key,
          count,
          label: option.label || option.key,
          color: option.color,
        };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [progressEntries, getOption]);

  const acCount =
    statusSummary.find((status) => status.key === "AC")?.count ?? 0;
  const acRate = trackedCount > 0 ? (acCount / trackedCount) * 100 : 0;
  const coveredRate =
    totalProblemCount > 0 ? (trackedCount / totalProblemCount) * 100 : 0;

  const latestUpdate = useMemo(() => {
    const timestamps = Object.values(progressUpdatedAt);
    return timestamps.length ? Math.max(...timestamps) : undefined;
  }, [progressUpdatedAt]);

  const withTimestampCount = useMemo(
    () =>
      progressEntries.filter(([id]) => Boolean(progressUpdatedAt[id])).length,
    [progressEntries, progressUpdatedAt],
  );
  const missingTimestampCount = trackedCount - withTimestampCount;

  const recentUpdates = useMemo(() => {
    return progressEntries
      .map(([problemId, status]) => ({
        problemId,
        status,
        updatedAt: progressUpdatedAt[problemId] ?? 0,
      }))
      .filter((item) => item.updatedAt > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8);
  }, [progressEntries, progressUpdatedAt]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        這裡會即時顯示目前本機刷題進度，不需另外同步即可查看。
      </p>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">已標記題目</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCount(trackedCount)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">AC 題數</p>
          <p className="mt-2 text-2xl font-semibold">{formatCount(acCount)}</p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">AC 比例</p>
          <p className="mt-2 text-2xl font-semibold">{formatPercent(acRate)}</p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">覆蓋題庫比例</p>
          <p className="mt-2 text-2xl font-semibold">
            {totalProblemCount > 0 ? formatPercent(coveredRate) : "--"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalProblemCount > 0
              ? `${formatCount(trackedCount)} / ${formatCount(totalProblemCount)}`
              : "題庫載入中"}
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">進度分布</h3>
          <Badge variant="secondary">
            {formatCount(statusSummary.length)} 種狀態
          </Badge>
        </div>

        {trackedCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            目前還沒有任何已標記題目，先去題庫設定一題進度吧。
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {statusSummary.map((status) => (
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

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">最近更新</h3>
          <p className="text-xs text-muted-foreground">
            最後更新：{formatTimestamp(latestUpdate)}
          </p>
        </div>

        {recentUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            尚未記錄更新時間，可能是舊版資料匯入或尚未變更過進度。
          </p>
        ) : (
          <div className="space-y-2">
            {recentUpdates.map((item) => {
              const option = getOption(item.status);
              const problemTitle = problemMap?.[item.problemId]?.title;
              const studyPlanInfo = getStudyPlanProblemInfo(item.problemId);
              // Study plan titles may include an "id. " prefix — strip it to avoid duplication
              const rawFallbackTitle = studyPlanInfo?.title;
              const fallbackTitle = rawFallbackTitle?.replace(
                new RegExp(`^${item.problemId}\\.\\s*`),
                "",
              );
              const displayTitle = problemTitle ?? fallbackTitle;
              const studyPlanPlans = studyPlanInfo?.plans ?? [];

              return (
                <div
                  key={item.problemId}
                  className="flex items-start justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.problemId}
                      {displayTitle
                        ? ` ${displayTitle}`
                        : !problemMap
                          ? " 題目名稱載入中"
                          : " 題目名稱未收錄"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(item.updatedAt)}
                    </p>
                    {studyPlanPlans.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span className="mr-1">題單</span>
                        {studyPlanPlans.map((plan) => (
                          <Badge
                            key={plan.planKey}
                            variant="secondary"
                            asChild
                            className="h-5 px-2 text-[11px]"
                          >
                            <Link href={`/studyplan/${plan.planKey}`}>
                              {plan.planTitle}
                            </Link>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0"
                    style={{ borderColor: option.color, color: option.color }}
                  >
                    {option.label || option.key}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {missingTimestampCount > 0 && (
          <p className="text-xs text-muted-foreground">
            另有 {formatCount(missingTimestampCount)} 筆資料尚無更新時間。
          </p>
        )}
      </section>
    </div>
  );
}
