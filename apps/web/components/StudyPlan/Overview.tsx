"use client";

import { STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, type ReactNode } from "react";
import { StudyPlanData } from "@/types";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { useProgressStore } from "@/hooks/useProgress";

function countProblems(section: StudyPlanData.Section): number {
  let count = section.problems?.length || 0;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countProblems(child),
      0,
    );
  }
  return count;
}

function countSections(section: StudyPlanData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countSections(child),
      0,
    );
  }
  return count;
}

function collectProblemIds(sections: StudyPlanData.Section[]): string[] {
  const ids: string[] = [];
  function walk(section: StudyPlanData.Section) {
    if (section.problems) {
      for (const p of section.problems) {
        const id = p.id?.toString();
        if (id) ids.push(id);
      }
    }
    if (section.children) {
      for (const child of section.children) walk(child);
    }
  }
  for (const s of sections) walk(s);
  return ids;
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
  const trimmedQuery = query.trim();
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

  const normalizedQuery = trimmedQuery.toLowerCase();
  const matches: StudyPlanSearchMatch[] = [];
  const seen = new Set<string>();

  const addMatch = (match: StudyPlanSearchMatch) => {
    const key = `${match.kind}:${match.label}:${match.text}:${match.context ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push(match);
  };

  if (title.toLowerCase().includes(normalizedQuery)) {
    addMatch({ kind: "plan", label: "題單", text: title });
  }

  const visitSection = (
    section: StudyPlanData.Section,
    parentTitles: string[] = [],
  ) => {
    if (section.title.toLowerCase().includes(normalizedQuery)) {
      addMatch({
        kind: "section",
        label: "章節",
        text: section.title,
        context: parentTitles.length > 0 ? parentTitles.join(" / ") : undefined,
      });
    }

    const currentPath = [...parentTitles, section.title];

    section.problems?.forEach((problem) => {
      const problemId = problem.id?.toString();
      const isProblemMatch =
        problemId === trimmedQuery ||
        problem.title.toLowerCase().includes(normalizedQuery);

      if (!isProblemMatch) return;

      addMatch({
        kind: "problem",
        label: problemId ? `題目 #${problemId}` : "題目",
        text: problem.title,
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
  const Icon = studyPlanIcons[planKey] ?? BookOpen;
  const theme = studyPlanThemes[planKey] ?? defaultTheme;
  const data = studyPlanDataMap[planKey];
  const progress = useProgressStore((state) => state.progress);

  const { totalProblems, totalSections, completedProblems } = useMemo(() => {
    if (!data)
      return { totalProblems: 0, totalSections: 0, completedProblems: 0 };
    const ids = collectProblemIds(data.children);
    return {
      totalProblems:
        ids.length ||
        data.children.reduce(
          (acc: number, child: StudyPlanData.Section) =>
            acc + countProblems(child),
          0,
        ),
      totalSections: data.children.reduce(
        (acc: number, child: StudyPlanData.Section) =>
          acc + countSections(child),
        0,
      ),
      completedProblems: ids.filter((id) => progress[id] === "AC").length,
    };
  }, [data, progress]);

  const pct =
    totalProblems > 0
      ? Math.round((completedProblems / totalProblems) * 100)
      : 0;
  const visibleMatches = searchMatches.slice(0, MAX_VISIBLE_MATCHES);

  if (!data) return null;

  return (
    <Link href={`/studyplan/${planKey}`} className="block h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Gradient Banner */}
        <div
          className="relative h-24 overflow-hidden sm:h-28"
          style={{ background: theme.gradient }}
        >
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/5" />
          <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-white/5" />
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
          <p className="mt-1 text-sm text-muted-foreground">
            {totalProblems} 題 · {totalSections} 個章節
          </p>

          {searchQuery.trim() && visibleMatches.length > 0 && (
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/40 p-3 sm:mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  匹配結果
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
                    className="rounded-md bg-background/80 px-2.5 py-2 text-sm"
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
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    已完成 {completedProblems} / {totalProblems} 題
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: theme.accent }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
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
    const stats: Record<string, { pct: number }> = {};
    for (const planKey of Object.keys(STUDYPLANS)) {
      const data = studyPlanDataMap[planKey];
      if (!data) {
        stats[planKey] = { pct: 0 };
        continue;
      }
      const ids = collectProblemIds(data.children);
      const total = ids.length;
      const completed = ids.filter((id) => progress[id] === "AC").length;
      stats[planKey] = {
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }
    return stats;
  }, [progress]);

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

  return (
    <div className="min-h-screen bg-background font-song">
      {/* Page Header */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                題單
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                由靈茶山艾府（0x3F）整理的演算法題單，涵蓋各種常見演算法與資料結構。
                <br className="hidden sm:block" />
                點擊任意題單查看詳細內容與題目列表。
              </p>
            </div>
            <div className="w-full sm:w-80 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="搜尋題單、子章節或題目編號..."
                  className="w-full pl-9 pr-4 py-2.5 border border-input rounded-lg bg-background hover:border-primary/30 focus:border-primary focus-visible:ring-1 focus-visible:ring-ring transition-colors text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-6 -mx-1 overflow-x-auto pb-1">
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

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">沒有找到匹配的題單</p>
            <p className="text-sm mt-1">嘗試其他搜尋關鍵字或篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
