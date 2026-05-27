"use client";

import { STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderTree,
  LayoutGrid,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, type ReactNode } from "react";
import { StudyPlanData } from "@/types";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { useProgressStore } from "@/hooks/useProgress";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { getStudyPlanPracticeStats } from "@/features/learning/utils/sectionTree";

type ProgressMap = Record<string, string | undefined>;

function getPlanSummary(
  data: StudyPlanData.Root | undefined,
  progress: ProgressMap,
) {
  const stats = getStudyPlanPracticeStats(data, progress);

  return {
    totalProblems: stats.total,
    totalSections: stats.sections,
    completedProblems: stats.completed,
    pct: stats.pct,
  };
}

type StudyPlanSearchMatch = {
  kind: "plan" | "section" | "problem";
  label: string;
  text: string;
  context?: string;
};

const MAX_VISIBLE_MATCHES = 4;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string): ReactNode {
  const trimmedQuery = normalizeDisplayText(query.trim());
  if (!trimmedQuery) return text;

  const pattern = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-primary/15 px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

function getStudyPlanMatches(
  data: StudyPlanData.Root,
  title: string,
  query: string,
): StudyPlanSearchMatch[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const normalizedQuery = normalizeDisplayText(trimmedQuery).toLowerCase();
  const matches: StudyPlanSearchMatch[] = [];
  const seen = new Set<string>();
  const normalizedTitle = normalizeDisplayText(title);

  const addMatch = (match: StudyPlanSearchMatch) => {
    const key = `${match.kind}:${match.label}:${match.text}:${match.context ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push(match);
  };

  if (normalizedTitle.toLowerCase().includes(normalizedQuery)) {
    addMatch({ kind: "plan", label: "題單", text: normalizedTitle });
  }

  const visitSection = (
    section: StudyPlanData.Section,
    parentTitles: string[] = [],
  ) => {
    const normalizedSectionTitle = normalizeDisplayText(section.title);
    if (normalizedSectionTitle.toLowerCase().includes(normalizedQuery)) {
      addMatch({
        kind: "section",
        label: "章節",
        text: normalizedSectionTitle,
        context: parentTitles.length > 0 ? parentTitles.join(" / ") : undefined,
      });
    }

    const currentPath = [...parentTitles, normalizedSectionTitle];

    section.problems?.forEach((problem) => {
      const problemId = problem.id?.toString();
      const normalizedProblemTitle = normalizeDisplayText(problem.title);
      const isProblemMatch =
        problemId === trimmedQuery ||
        normalizedProblemTitle.toLowerCase().includes(normalizedQuery);

      if (!isProblemMatch) return;

      addMatch({
        kind: "problem",
        label: problemId ? `題目 #${problemId}` : "題目",
        text: normalizedProblemTitle,
        context: currentPath.join(" / "),
      });
    });

    section.children?.forEach((child) => visitSection(child, currentPath));
  };

  data.children.forEach((section) => visitSection(section));
  return matches;
}

type FilterType = "all" | "in_progress" | "completed";

interface StudyPlanCardProps {
  planKey: string;
  title: string;
  searchQuery: string;
  searchMatches: StudyPlanSearchMatch[];
}

function StudyPlanCard({
  planKey,
  title,
  searchQuery,
  searchMatches,
}: StudyPlanCardProps) {
  const router = useRouter();
  const Icon = studyPlanIcons[planKey] ?? BookOpen;
  const theme = studyPlanThemes[planKey] ?? defaultTheme;
  const data = studyPlanDataMap[planKey];
  const progress = useProgressStore((state) => state.progress);

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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/20">
              <Icon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-lg">
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
                    style={{ width: `${pct}%`, backgroundColor: theme.accent }}
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

function StudyPlanOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const progress = useProgressStore((state) => state.progress);
  const trimmedQuery = searchQuery.trim();

  const planStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalProblems: number;
        totalSections: number;
        completedProblems: number;
        pct: number;
      }
    > = {};
    for (const planKey of Object.keys(STUDYPLANS)) {
      stats[planKey] = getPlanSummary(studyPlanDataMap[planKey], progress);
    }
    return stats;
  }, [progress]);

  const overviewStats = useMemo(() => {
    return Object.values(planStats).reduce(
      (acc, stat) => {
        acc.totalProblems += stat.totalProblems;
        acc.totalSections += stat.totalSections;
        acc.completedProblems += stat.completedProblems;
        return acc;
      },
      {
        totalProblems: 0,
        totalSections: 0,
        completedProblems: 0,
      },
    );
  }, [planStats]);

  const planSearchMatches = useMemo(() => {
    if (!trimmedQuery) return {};

    return Object.entries(STUDYPLANS).reduce<
      Record<string, StudyPlanSearchMatch[]>
    >((acc, [key, title]) => {
      const data = studyPlanDataMap[key];
      acc[key] = data ? getStudyPlanMatches(data, title, trimmedQuery) : [];
      return acc;
    }, {});
  }, [trimmedQuery]);

  const filteredPlans = useMemo(() => {
    return Object.entries(STUDYPLANS).filter(([key]) => {
      if (trimmedQuery) {
        const matches = planSearchMatches[key];
        if (!matches || matches.length === 0) return false;
      }
      const stat = planStats[key];
      if (filter === "in_progress")
        return stat && stat.pct > 0 && stat.pct < 100;
      if (filter === "completed") return stat && stat.pct === 100;
      return true;
    });
  }, [trimmedQuery, filter, planSearchMatches, planStats]);

  const counts = useMemo(() => {
    const all = Object.keys(STUDYPLANS).length;
    const inProgress = Object.values(planStats).filter(
      (s) => s.pct > 0 && s.pct < 100,
    ).length;
    const completed = Object.values(planStats).filter(
      (s) => s.pct === 100,
    ).length;
    return { all, inProgress, completed };
  }, [planStats]);

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "全部", count: counts.all },
    { key: "in_progress", label: "進行中", count: counts.inProgress },
    { key: "completed", label: "已完成", count: counts.completed },
  ];

  const activeFilterLabel =
    filterTabs.find((tab) => tab.key === filter)?.label ?? "全部";

  return (
    <div className="min-h-screen bg-background font-song">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-[0_30px_80px_-50px_rgba(6,182,212,0.55)]">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:gap-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h1 className="brand-text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
                  題單
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  由靈茶山艾府（0x3F）整理的演算法題單，按主題分層規劃。
                </p>
              </div>
              <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 self-start rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="shrink-0">資料來源</span>
                <span className="font-medium text-foreground">
                  靈茶山艾府（0x3F）題單
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <LayoutGrid className="h-4 w-4" />
                  題單總數
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {counts.all}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  涵蓋常見演算法與資料結構主題
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  題目總數
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overviewStats.totalProblems}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  所有題單合計可練習的題目數
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  章節覆蓋
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overviewStats.totalSections}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  支援依章節層級快速定位學習路線
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  已完成題目
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overviewStats.completedProblems}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  依你的進度同步顯示已標記為 AC 的題目
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/60 bg-card shadow-sm sm:mt-5">
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  搜尋與篩選
                </h2>
                <p className="text-sm text-muted-foreground">
                  搜尋題單、章節或題號
                </p>
              </div>
              <div className="w-full lg:max-w-sm xl:max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜尋題單、子章節或題目編號..."
                    className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-4 text-sm shadow-none transition-colors hover:border-primary/30 focus-visible:ring-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                  顯示 {filteredPlans.length} / {counts.all} 份題單
                </span>
                <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                  目前篩選：{activeFilterLabel}
                </span>
                {trimmedQuery && (
                  <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1">
                    搜尋：{trimmedQuery}
                  </span>
                )}
              </div>

              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-2 px-1">
                  {filterTabs.map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        filter === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {label}
                      <span
                        className={`ml-1.5 ${filter === key ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 md:px-6 md:pb-10 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              題單列表
            </h2>
            <p className="text-sm text-muted-foreground">
              按主題挑選題單，或直接從已開始的進度繼續練習。
            </p>
          </div>
        </div>
        {filteredPlans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-lg font-medium text-foreground">
              沒有找到匹配的題單
            </p>
            <p className="mt-1 text-sm">
              試試其他搜尋關鍵字，或切換回不同的進度篩選條件。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
            {filteredPlans.map(([key, title]) => (
              <StudyPlanCard
                key={key}
                planKey={key}
                title={title}
                searchQuery={trimmedQuery}
                searchMatches={planSearchMatches[key] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPlanOverview;
