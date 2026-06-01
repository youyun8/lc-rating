"use client";

import { STUDYPLANS } from "@/config/constants";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  CheckCircle2,
  FolderTree,
  LayoutGrid,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useProgressMap } from "@/features/userData";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";

import { getPlanSummary, type PlanSummary } from "./stats";
import { getStudyPlanMatches, type StudyPlanSearchMatch } from "./search";
import { StudyPlanCard } from "./StudyPlanCard";

type FilterType = "all" | "in_progress" | "completed";

function StudyPlanOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const progress = useProgressMap();
  const trimmedQuery = searchQuery.trim();

  const planStats = useMemo(() => {
    const stats: Record<string, PlanSummary> = {};
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
    <div className="min-h-screen bg-background font-han">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:gap-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  題單
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  由靈茶山艾府（0x3F）整理的演算法主題題單，按知識點分層規劃。
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
                  已標記為 AC 的題目數
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
