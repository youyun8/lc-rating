"use client";

import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useTutorial } from "@/hooks/useTutorial";
import { useProgressMap } from "@/features/userData";
import { HIDDEN_STUDYPLAN_KEYS, STUDYPLANS } from "@/config/constants";
import {
  studyPlanIcons,
  studyPlanThemes,
  defaultTheme,
} from "@/config/studyPlanThemes";
import { ChapterNav } from "./ChapterNav";
import { SectionContainer } from "./SectionContainer";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  FolderTree,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { extractImageUrls } from "./dedupe";
import { StudyPlanMarkdownContent } from "./MarkdownContent";
import { QuestCelebrations } from "@/features/quest/QuestCelebrations";
import { getStudyPlanPracticeStats } from "@/features/learning/utils/sectionTree";
import {
  getMergedStudyPlan,
  isMergedLearningPath,
} from "@/features/learning/utils/mergeStudyPlanContent";

/** The plan's introduction, folded to a preview until the reader asks. */
function PlanOverview({
  summary,
  lectureHref,
  accent,
  gradient,
  merged,
}: {
  summary: string;
  lectureHref: string | null;
  accent: string;
  gradient: string;
  merged: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: gradient }}
        >
          <GraduationCap className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">課程總覽</h2>
          <p className="truncate text-xs text-muted-foreground">
            {merged
              ? "觀念說明已整合進各章節，展開「本章導讀」與「重點整理」即可閱讀。"
              : "先讀導讀，再依章節順序練習；完整觀念與模板在講義。"}
          </p>
        </div>
        {lectureHref && (
          <Link
            href={lectureHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/70 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            style={{ color: accent }}
          >
            講義
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {summary && (
        <div className="relative border-t border-border/60">
          <div
            className={cn(
              "px-4 py-4 sm:px-5",
              !expanded && "max-h-40 overflow-hidden",
            )}
          >
            <StudyPlanMarkdownContent content={summary} variant="section" />
          </div>
          {!expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
          )}
          <div className="relative flex justify-center pb-3">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm hover:text-foreground"
            >
              {expanded ? "收起" : "展開全文"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

interface StudyPlanProps {
  plan: string;
}

function StudyPlan({ plan }: StudyPlanProps) {
  // Self-authored learning paths (進階刷題衝刺 等) no longer have a standalone
  // 講義 page; their prose is folded into the 題單 tree here. Upstream-backed
  // plans render their localized JSON summaries and link to standalone lectures.
  const merged = useMemo(() => getMergedStudyPlan(plan), [plan]);
  const mergedPath = isMergedLearningPath(plan);
  const { studyPlan: fetchedStudyPlan } = useStudyPlan(plan, !mergedPath);
  const { tutorial } = useTutorial(plan);
  const progress = useProgressMap();
  const mergedIntoAdventure = HIDDEN_STUDYPLAN_KEYS.has(plan);
  const studyPlan = mergedPath ? merged?.root : fetchedStudyPlan;

  const planTitle =
    STUDYPLANS[plan as keyof typeof STUDYPLANS] ?? studyPlan?.title ?? plan;
  const Icon = studyPlanIcons[plan] ?? BookOpen;
  const theme = studyPlanThemes[plan] ?? defaultTheme;

  const rootSummary = mergedPath
    ? (merged?.summary ?? "")
    : (studyPlan?.summary ?? "");

  const topLevelImageUrls = useMemo(
    () => (rootSummary ? extractImageUrls(rootSummary) : new Set<string>()),
    [rootSummary],
  );

  // Deep links (#s-3, from 破關模式 or a merged plan's banner) arrive before
  // the sections render, so the browser's own jump finds nothing. Retry
  // briefly once the plan is on screen.
  const hasPlan = Boolean(studyPlan);
  useEffect(() => {
    if (!hasPlan) return;
    let attempts = 0;
    let timer = 0;
    // Client-side navigation may reset the scroll position right after we
    // jump, so keep checking until the target stays near the top.
    const tryScroll = () => {
      // Read the hash each time: on client-side navigation the URL may only
      // gain it after this effect first runs.
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        if (attempts++ < 5) timer = window.setTimeout(tryScroll, 100);
        return;
      }
      const target = document.getElementById(id);
      const settled =
        target !== null && Math.abs(target.getBoundingClientRect().top) < 120;
      if (target && !settled) target.scrollIntoView({ block: "start" });
      if (!settled && attempts++ < 30) {
        timer = window.setTimeout(tryScroll, 100);
      }
    };
    timer = window.setTimeout(tryScroll, 50);
    return () => window.clearTimeout(timer);
  }, [hasPlan, plan]);

  const stats = useMemo(
    () => getStudyPlanPracticeStats(studyPlan, progress),
    [studyPlan, progress],
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-han">
      <QuestCelebrations />
      {studyPlan && (
        <div className="page-shell px-3 pt-4 sm:px-4 sm:pt-6 md:px-6 xl:px-8">
          <div
            className="motion-rise relative overflow-hidden rounded-3xl text-white shadow-lg"
            style={{ background: theme.gradient }}
          >
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <nav className="mb-3 flex items-center gap-1.5 text-xs text-white/70">
                  <Link href="/studyplan" className="hover:text-white">
                    題單
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate text-white/90">{planTitle}</span>
                </nav>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl xl:text-3xl">
                    {studyPlan.title}
                  </h1>
                </div>
                <div className="font-num mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {stats.total} 題
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FolderTree className="h-3.5 w-3.5" />
                    {stats.sections} 節
                  </span>
                  {studyPlan.last_update && (
                    <span>
                      更新於{" "}
                      {new Date(studyPlan.last_update).toLocaleDateString()}
                    </span>
                  )}
                  {studyPlan.src && (
                    <a
                      href={studyPlan.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      原文
                    </a>
                  )}
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-80">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 text-white/85">
                    <CheckCircle2 className="h-4 w-4" />
                    已完成
                  </span>
                  <span className="font-num font-bold">
                    {stats.completed}/{stats.total} · {stats.pct}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-700"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
                <Link
                  href={`/quest/${mergedIntoAdventure ? "adventure" : plan}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-foreground shadow-md transition-transform hover:-translate-y-px"
                >
                  <Gamepad2 className="h-4 w-4" />
                  用破關模式玩這份題單
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="page-shell px-3 pb-24 pt-5 sm:px-4 sm:pt-6 md:px-6 md:pb-20 xl:px-8"
        style={
          {
            "--plan-accent": theme.accent,
            "--plan-gradient": theme.gradient,
          } as React.CSSProperties
        }
      >
        <div className="flex flex-col gap-4">
          {mergedIntoAdventure && (
            <Link
              href="/studyplan/adventure"
              className="group flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm transition-colors hover:bg-primary/10"
            >
              <Compass className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                這份題單的題目已整合進
                <span className="font-semibold">「冒險路線」</span>
                ，依靈茶山艾府的分類重新排列，講解也搬到對應主題的導讀；進度會自動帶過去。
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {(rootSummary || (!mergedPath && tutorial)) && (
            <PlanOverview
              summary={rootSummary}
              lectureHref={!mergedPath && tutorial ? `/lecture/${plan}` : null}
              accent={theme.accent}
              gradient={theme.gradient}
              merged={mergedPath}
            />
          )}
        </div>

        {studyPlan && (
          <>
            <div className="mt-4">
              <ChapterNav sections={studyPlan.children} variant="bar" />
            </div>
            <div className="mt-6 grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
              <ChapterNav sections={studyPlan.children} variant="rail" />
              <div className="min-w-0 space-y-12">
                {studyPlan.children.map((section) => (
                  <SectionContainer
                    key={section.id}
                    section={section}
                    parentImageUrls={topLevelImageUrls}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudyPlan;
