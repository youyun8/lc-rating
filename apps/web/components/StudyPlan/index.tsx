"use client";

import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useProgressStore } from "@/hooks/useProgress";
import { STUDYPLANS } from "@/config/constants";
import { studyPlanIcons, studyPlanThemes, defaultTheme } from "@/config/studyPlanThemes";
import { SectionContainer } from "./SectionContainer";
import { StudyPlanData } from "@/types";
import { BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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

function countSections(section: StudyPlanData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce((acc, child) => acc + countSections(child), 0);
  }
  return count;
}

interface StudyPlanProps {
  plan: string;
}

function StudyPlan({ plan }: StudyPlanProps) {
  const { studyPlan } = useStudyPlan(plan);
  const progress = useProgressStore((state) => state.progress);

  const planTitle = STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? studyPlan?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const stats = useMemo(() => {
    if (!studyPlan) return { total: 0, completed: 0, sections: 0, pct: 0 };
    const ids = collectProblemIds(studyPlan.children);
    const total = ids.length;
    const completed = ids.filter((id) => progress[id] === "AC").length;
    const sections = studyPlan.children.reduce((acc, child) => acc + countSections(child), 0);
    return { total, completed, sections, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [studyPlan, progress]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background font-song">
      {/* Hero Header */}
      {studyPlan && (
        <div className="relative overflow-hidden" style={{ background: theme.gradient }}>
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute top-8 right-1/4 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-white/70 mb-5">
              <Link href="/studyplan" className="hover:text-white transition-colors">
                題單
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">{planTitle}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Icon + Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/20 shrink-0">
                  <Icon className="h-8 w-8 text-white drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                    {studyPlan.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-white/70">
                    <a
                      href={studyPlan.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      查看原文
                    </a>
                    <span>·</span>
                    <span>更新於 {new Date(studyPlan.last_update).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2.5 text-center ring-1 ring-white/10">
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-white/60">題目</div>
                </div>
                <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2.5 text-center ring-1 ring-white/10">
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.sections}</div>
                  <div className="text-xs text-white/60">章節</div>
                </div>
                <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2.5 text-center ring-1 ring-white/10">
                  <div className="text-xl md:text-2xl font-bold text-white">{stats.pct}%</div>
                  <div className="text-xs text-white/60">完成</div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="mt-6 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>已完成 {stats.completed} / {stats.total} 題</span>
                  <span className="font-semibold text-white">{stats.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/90 transition-all duration-500"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 pb-20">
        <div className="flex flex-col gap-8">
          {studyPlan?.children.map((section) => (
            <SectionContainer key={section.title} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;
