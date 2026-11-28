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
import { SectionContainer } from "./SectionContainer";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  FolderTree,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { extractImageUrls } from "./dedupe";
import { StudyPlanMarkdownContent } from "./MarkdownContent";
import { SectionQuickLinks } from "@/features/learning/components/SectionQuickLinks";
import { SidebarVisibilityButtons } from "@/features/learning/components/SidebarVisibilityButtons";
import { QuestCelebrations } from "@/features/quest/QuestCelebrations";
import { getStudyPlanPracticeStats } from "@/features/learning/utils/sectionTree";
import {
  getMergedStudyPlan,
  isMergedLearningPath,
} from "@/features/learning/utils/mergeStudyPlanContent";

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

      <div className="page-shell px-3 py-5 pb-24 sm:px-4 sm:py-6 md:px-6 md:py-8 md:pb-20 xl:px-8">
        <div className="flex flex-col gap-8">
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
          {rootSummary && (
            <section className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
                <div
                  className="shrink-0 rounded-2xl p-2.5 ring-1 ring-border/60"
                  style={{ background: theme.gradient }}
                >
                  <GraduationCap className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    課程總覽
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {mergedPath
                      ? "觀念說明已整合進本題單；下方各章節同時附上重點講解與練習題。"
                      : "先閱讀原題單導讀，再依下方章節順序完成練習；完整觀念與模板請前往講義。"}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <StudyPlanMarkdownContent
                  content={rootSummary}
                  variant="section"
                />
              </div>
            </section>
          )}

          {!mergedPath && tutorial && (
            <Link
              href={`/lecture/${plan}`}
              className="group block overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                <div className="flex items-start gap-3 sm:items-center">
                  <div
                    className="shrink-0 rounded-2xl p-3 ring-1 ring-border/60"
                    style={{ background: theme.gradient }}
                  >
                    <GraduationCap className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      想看觀念說明？前往對應講義
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      此頁專注題目練習；題型概念、模板與例題請至講義頁閱讀。
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium transition-colors group-hover:border-primary/40 sm:self-auto"
                  style={{ color: theme.accent }}
                >
                  閱讀講義
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}

          {studyPlan && (
            <section className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    章節導覽
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    依照章節順序循序練習；也可用側欄導覽快速跳轉到指定章節。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <SidebarVisibilityButtons />
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.rootSections} 個主章節
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.sections} 個總章節
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                    {stats.total} 題
                  </span>
                </div>
              </div>
            </section>
          )}

          {studyPlan && (
            <SectionQuickLinks
              sections={studyPlan.children}
              description="可先打開側欄查看完整章節樹，或直接用下方章節捷徑快速跳轉。"
            />
          )}

          {studyPlan?.children.map((section) => (
            <SectionContainer
              key={section.id}
              section={section}
              parentImageUrls={topLevelImageUrls}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;
