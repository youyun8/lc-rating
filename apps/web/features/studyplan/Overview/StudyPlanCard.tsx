import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { useProgressMap } from "@/features/userData";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { sectionAnchor } from "@/utils/sectionAnchor";

import { getPlanSummary } from "./stats";
import {
  highlightMatch,
  MAX_VISIBLE_MATCHES,
  type StudyPlanSearchMatch,
} from "./search";

interface StudyPlanCardProps {
  planKey: string;
  title: string;
  searchQuery: string;
  searchMatches: StudyPlanSearchMatch[];
}

export function StudyPlanCard({
  planKey,
  title,
  searchQuery,
  searchMatches,
}: StudyPlanCardProps) {
  const router = useRouter();
  const Icon = studyPlanIcons[planKey] ?? BookOpen;
  const theme = studyPlanThemes[planKey] ?? defaultTheme;
  const data = studyPlanDataMap[planKey];
  const progress = useProgressMap();

  const { totalProblems, totalSections, completedProblems } = useMemo(() => {
    return getPlanSummary(data, progress);
  }, [data, progress]);

  const pct =
    totalProblems > 0
      ? Math.round((completedProblems / totalProblems) * 100)
      : 0;
  const visibleMatches = searchMatches.slice(0, MAX_VISIBLE_MATCHES);

  if (!data) return null;

  function getMatchHref(match: StudyPlanSearchMatch): string {
    const base = `/studyplan/${planKey}`;
    if (match.kind === "plan") return base;
    if (match.kind === "section") return `${base}#${sectionAnchor(match.text)}`;
    if (match.context) {
      const parts = match.context.split(" / ");
      return `${base}#${sectionAnchor(parts[parts.length - 1] ?? "")}`;
    }
    return base;
  }

  return (
    <Link href={`/studyplan/${planKey}`} className="block h-full">
      <div
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-accent-dark)]/50 hover:shadow-lg"
        style={
          { "--card-accent-dark": theme.accentDark } as React.CSSProperties
        }
      >
        {/* Gradient Banner */}
        <div
          className="relative h-28 overflow-hidden sm:h-32"
          style={{ background: theme.gradient }}
        >
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/5" />
          <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-white/5" />
          <div className="absolute right-3 top-3">
            <Badge className="border-white/15 bg-white/15 text-white backdrop-blur-sm">
              {pct === 100 ? "已完成" : pct > 0 ? `${pct}% 進行中` : "未開始"}
            </Badge>
          </div>
          <div className="relative flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-base font-bold tracking-tight transition-colors group-hover:text-[var(--card-accent-dark)] sm:text-lg">
            {title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {totalProblems} 題
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {totalSections} 個章節
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              已完成 {completedProblems} 題
            </span>
          </div>

          {searchQuery.trim() && visibleMatches.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  搜尋命中
                </p>
                {searchMatches.length > visibleMatches.length && (
                  <span className="text-xs text-muted-foreground">
                    +{searchMatches.length - visibleMatches.length} 項
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {visibleMatches.map((match, index) => (
                  <div
                    key={`${match.kind}-${match.label}-${match.text}-${index}`}
                    className="rounded-xl border border-border/40 bg-background/80 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(getMatchHref(match));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        router.push(getMatchHref(match));
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: `${theme.accent}1A`,
                          color: theme.accent,
                        }}
                      >
                        {highlightMatch(match.label, searchQuery)}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="break-words font-medium leading-snug text-foreground">
                          {highlightMatch(match.text, searchQuery)}
                        </p>
                        {match.context && (
                          <p className="break-words text-xs leading-snug text-muted-foreground">
                            {highlightMatch(match.context, searchQuery)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mt-auto pt-4">
            {totalProblems > 0 && (
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    完成進度
                  </p>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: theme.accent }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    已完成 {completedProblems} / {totalProblems} 題
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: theme.gradient }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            className="mt-4 inline-flex items-center text-sm font-medium transition-colors"
            style={{ color: theme.accent }}
          >
            {pct > 0 ? "繼續學習" : "開始學習"}
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
