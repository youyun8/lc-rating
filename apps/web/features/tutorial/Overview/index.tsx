"use client";

import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import { Input } from "@/components/ui/input";
import { BookOpen, FolderTree, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { tutorialDataMap } from "@/utils/tutorialIndex";
import { lectureLearningPath } from "@/data/lectureLearningPath";
import { lectureMetaSummary } from "@/data/lectureMetaSummary";
import { lectureDebuggingGuide } from "@/data/lectureDebuggingGuide";
import { TutorialMarkdownPanel } from "@/features/tutorial/MarkdownPanel";

import { getTutorialSummary } from "./stats";
import { getTutorialMatches, type TutorialSearchMatch } from "./search";
import { TutorialCard } from "./TutorialCard";

function TutorialOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  const planSearchMatches = useMemo(() => {
    if (!trimmedQuery) return {} as Record<string, TutorialSearchMatch[]>;

    return Object.entries(LECTURE_CATEGORIES).reduce<
      Record<string, TutorialSearchMatch[]>
    >((acc, [key, title]) => {
      const data = tutorialDataMap[key];
      acc[key] = data ? getTutorialMatches(data, title, trimmedQuery) : [];
      return acc;
    }, {});
  }, [trimmedQuery]);

  const filteredPlans = useMemo(() => {
    return Object.entries(LECTURE_CATEGORIES).filter(([key]) => {
      if (!trimmedQuery) return true;
      const matches = planSearchMatches[key];
      return matches && matches.length > 0;
    });
  }, [trimmedQuery, planSearchMatches]);

  const overviewStats = useMemo(() => {
    return Object.keys(LECTURE_CATEGORIES).reduce(
      (acc, key) => {
        const stat = getTutorialSummary(tutorialDataMap[key]);
        acc.totalSections += stat.totalSections;
        acc.documentedSections += stat.documentedSections;
        return acc;
      },
      { totalSections: 0, documentedSections: 0 },
    );
  }, []);

  const totalPlans = Object.keys(LECTURE_CATEGORIES).length;

  return (
    <div className="min-h-screen bg-background font-han">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:gap-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  講義
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  依主題整理的演算法筆記與模板，適合學習與複習；題目練習請至對應題單。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start">
                <Link
                  href="/lecture/full"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  完整講義索引
                </Link>
                <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="shrink-0">資料來源</span>
                  <span className="font-medium text-foreground">
                    靈茶山艾府（0x3F）題單整理
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 2xl:gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <LayoutGrid className="h-4 w-4" />
                  講義主題
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {totalPlans}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  涵蓋常見演算法與資料結構
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  章節總數
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overviewStats.totalSections}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  可依章節層級快速跳轉
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  筆記總數
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {overviewStats.documentedSections}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  已整理筆記的章節數
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
                  搜尋
                </h2>
                <p className="text-sm text-muted-foreground">
                  以講義主題或章節名稱搜尋
                </p>
              </div>
              <div className="w-full lg:max-w-sm xl:max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜尋講義主題或章節..."
                    className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-4 text-sm shadow-none transition-colors hover:border-primary/30 focus-visible:ring-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 md:px-6 md:pb-10 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              講義主題
            </h2>
            <p className="text-sm text-muted-foreground">
              先依主題查看摘要，再進入章節完整講義。
            </p>
          </div>
        </div>
        {filteredPlans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-lg font-medium text-foreground">
              沒有找到匹配的講義
            </p>
            <p className="mt-1 text-sm">試試其他搜尋關鍵字。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
            {filteredPlans.map(([key, title]) => (
              <TutorialCard
                key={key}
                planKey={key}
                title={title}
                searchQuery={trimmedQuery}
                searchMatches={planSearchMatches[key] ?? []}
              />
            ))}
          </div>
        )}

        {!trimmedQuery && (
          <div className="mt-6 flex flex-col gap-4">
            <TutorialMarkdownPanel
              title="學習順序與前置依賴"
              description="由易到難的建議路線，箭頭代表前置依賴。"
              badge="學習路線"
              content={lectureLearningPath}
            />
            <TutorialMarkdownPanel
              title="通用解題心法"
              description="貫穿各章節的共通判斷準則，適合讀完各主題後回頭對照。"
              badge="跨章節整理"
              content={lectureMetaSummary}
            />
            <TutorialMarkdownPanel
              title="測試與除錯"
              description="LeetCode 常見的 WA / TLE / RE 自我檢查清單與手動模擬建議。"
              badge="方法論"
              content={lectureDebuggingGuide}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorialOverview;
