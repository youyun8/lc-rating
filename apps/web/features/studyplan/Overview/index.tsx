"use client";

import {
  CUSTOM_STUDYPLAN_KEYS,
  INTERVIEW_PREP_KEYS,
  LEARNING_PATH_KEYS,
  STUDYPLANS,
} from "@/config/constants";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/common/StatCard";
import { SectionDivider } from "@/components/common/SectionDivider";
import {
  BookOpen,
  CheckCircle2,
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

  const originalPlans = filteredPlans.filter(
    ([key]) => !CUSTOM_STUDYPLAN_KEYS.has(key),
  );
  const learningPathPlans = filteredPlans.filter(([key]) =>
    LEARNING_PATH_KEYS.has(key),
  );
  const interviewPrepPlans = filteredPlans.filter(([key]) =>
    INTERVIEW_PREP_KEYS.has(key),
  );

  return (
    <div className="min-h-screen bg-background font-han">
      <div className="page-shell px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:px-8">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:gap-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <h1 className="page-title">題單</h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  由靈茶山艾府（0x3F）整理的演算法主題題單，按知識點分層規劃。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-xl 2xl:gap-4">
              <StatCard
                icon={BookOpen}
                label="題目總數"
                value={overviewStats.totalProblems}
              />
              <StatCard
                icon={CheckCircle2}
                label="已完成題目"
                value={overviewStats.completedProblems}
              />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/60 bg-card shadow-sm sm:mt-5">
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋題單、子章節或題目編號..."
                className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-4 text-sm shadow-none transition-colors hover:border-primary/30 focus-visible:ring-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground">
                顯示 {filteredPlans.length} / {counts.all} 份題單
              </p>

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
      <div className="page-shell px-3 pb-8 sm:px-4 md:px-6 md:pb-10 xl:px-8">
        {filteredPlans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-lg font-medium text-foreground">
              沒有找到匹配的題單
            </p>
          </div>
        ) : (
          <>
            {(
              [
                ["0x3F 題單", originalPlans],
                ["學習路線", learningPathPlans],
                ["面試準備", interviewPrepPlans],
              ] as const
            ).map(
              ([label, plans]) =>
                plans.length > 0 && (
                  <div key={label}>
                    <SectionDivider label={label} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
                      {plans.map(([key, title]) => (
                        <StudyPlanCard
                          key={key}
                          planKey={key}
                          title={title}
                          searchQuery={trimmedQuery}
                          searchMatches={planSearchMatches[key] ?? []}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudyPlanOverview;
