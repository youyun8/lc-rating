import { Badge } from "@/components/ui/badge";
import { LC_HOST_ZH } from "@/config/constants";
import { useRecentProgress } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { ExternalLink } from "lucide-react";

const RECENT_LIMIT = 10;

const relativeTimeFormatter = new Intl.RelativeTimeFormat("zh-TW", {
  numeric: "auto",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-TW", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdatedAt(timestamp: number) {
  if (!timestamp) return "未知時間";

  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return relativeTimeFormatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return relativeTimeFormatter.format(diffDays, "day");
  }

  return dateTimeFormatter.format(timestamp);
}

export default function RecentSubmissions() {
  const recent = useRecentProgress(RECENT_LIMIT);
  const tagLanguage = useGlobalSettingsStore((state) => state.tagLanguage);
  const isZh = tagLanguage === "zh";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        這裡列出你最近更新進度的題目，依時間由新到舊排序。
      </p>

      {recent.length === 0 ? (
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          目前還沒有任何做題紀錄，先去題庫標記一題進度吧。
        </p>
      ) : (
        <ul className="space-y-2">
          {recent.map((item) => {
            const link = item.titleSlug
              ? `${LC_HOST_ZH}/problems/${item.titleSlug}/`
              : undefined;

            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.statusColor }}
                  />
                  <div className="min-w-0">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 truncate text-sm font-medium hover:underline"
                      >
                        <span className="truncate">{item.title}</span>
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                      </a>
                    ) : (
                      <span className="block truncate text-sm font-medium">
                        {item.title}
                      </span>
                    )}
                    {item.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="px-1.5 py-0 text-[11px] font-normal text-muted-foreground"
                          >
                            {isZh ? tag.zh : tag.en}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatUpdatedAt(item.updatedAt)}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className="shrink-0"
                  style={{
                    backgroundColor: `${item.statusColor}1a`,
                    color: item.statusColor,
                  }}
                >
                  {item.statusLabel}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
