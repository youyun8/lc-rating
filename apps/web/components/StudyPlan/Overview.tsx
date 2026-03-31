"use client";

import { STUDYPLANS } from "@/config/constants";
import { studyPlanIcons, studyPlanThemes, defaultTheme } from "@/config/studyPlanThemes";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { StudyPlanData } from "@/types";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { useProgressStore } from "@/hooks/useProgress";

function countProblems(section: StudyPlanData.Section): number {
  let count = section.problems?.length || 0;
  if (section.children) {
    count += section.children.reduce((acc, child) => acc + countProblems(child), 0);
  }
  return count;
}

function countSections(section: StudyPlanData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce((acc, child) => acc + countSections(child), 0);
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

function matchesSearch(data: StudyPlanData.Root, title: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (title.toLowerCase().includes(q)) return true;
  function checkSection(section: StudyPlanData.Section): boolean {
    if (section.title.toLowerCase().includes(q)) return true;
    if (section.problems?.some((p) => p.id?.toString() === query || p.title.toLowerCase().includes(q)))
      return true;
    if (section.children?.some((child) => checkSection(child))) return true;
    return false;
  }
  return data.children.some((s) => checkSection(s));
}

type FilterType = "all" | "in_progress" | "completed";

interface StudyPlanCardProps {
  planKey: string;
  title: string;
}

function StudyPlanCard({ planKey, title }: StudyPlanCardProps) {
  const Icon = studyPlanIcons[planKey] ?? BookOpen;
  const theme = studyPlanThemes[planKey] ?? defaultTheme;
  const data = studyPlanDataMap[planKey];
  const progress = useProgressStore((state) => state.progress);

  const { totalProblems, totalSections, completedProblems } = useMemo(() => {
    if (!data) return { totalProblems: 0, totalSections: 0, completedProblems: 0 };
    const ids = collectProblemIds(data.children);
    return {
      totalProblems:
        ids.length ||
        data.children.reduce((acc: number, child: StudyPlanData.Section) => acc + countProblems(child), 0),
      totalSections: data.children.reduce(
        (acc: number, child: StudyPlanData.Section) => acc + countSections(child),
        0,
      ),
      completedProblems: ids.filter((id) => progress[id] === "AC").length,
    };
  }, [data, progress]);

  const pct = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

  if (!data) return null;

  return (
    <Link href={`/studyplan/${planKey}`} className="block h-full">
      <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        {/* Gradient Banner */}
        <div className="relative h-28 overflow-hidden" style={{ background: theme.gradient }}>
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
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalProblems} 題 · {totalSections} 個章節
          </p>

          {/* Progress */}
          <div className="mt-auto pt-4">
            {totalProblems > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    已完成 {completedProblems} / {totalProblems} 題
                  </span>
                  <span className="font-semibold" style={{ color: theme.accent }}>
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
          <div className="mt-4 inline-flex items-center text-sm font-medium transition-colors" style={{ color: theme.accent }}>
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
      stats[planKey] = { pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }
    return stats;
  }, [progress]);

  const filteredPlans = useMemo(() => {
    const query = searchQuery.trim();
    return Object.entries(STUDYPLANS).filter(([key, title]) => {
      if (query) {
        const data = studyPlanDataMap[key];
        if (!data || !matchesSearch(data, title, query)) return false;
      }
      const stat = planStats[key];
      if (filter === "in_progress") return stat && stat.pct > 0 && stat.pct < 100;
      if (filter === "completed") return stat && stat.pct === 100;
      return true;
    });
  }, [searchQuery, filter, planStats]);

  const counts = useMemo(() => {
    const all = Object.keys(STUDYPLANS).length;
    const inProgress = Object.values(planStats).filter((s) => s.pct > 0 && s.pct < 100).length;
    const completed = Object.values(planStats).filter((s) => s.pct === 100).length;
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
              <h1 className="text-3xl font-bold tracking-tight">題單</h1>
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
          <div className="mt-6 flex items-center gap-1">
            {filterTabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">沒有找到匹配的題單</p>
            <p className="text-sm mt-1">嘗試其他搜尋關鍵字或篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map(([key, title]) => (
              <StudyPlanCard key={key} planKey={key} title={title} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPlanOverview;
