"use client";

import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import {
  CUSTOM_STUDYPLAN_KEYS,
  INTERVIEW_PREP_KEYS,
  LEARNING_PATH_KEYS,
} from "@/config/constants";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/common/StatCard";
import { SectionDivider } from "@/components/common/SectionDivider";
import { BookOpen, FolderTree, Search } from "lucide-react";
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
import { LeetCodeIdResults } from "@/components/common/LeetCodeIdResults";
import {
  parseLeetCodeId,
  searchLectureByLeetCodeId,
} from "@/utils/leetcodeContentIndex";

function TutorialOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  // A purely-numeric query is treated as a LeetCode 題號 lookup.
  const lcId = useMemo(() => parseLeetCodeId(searchQuery), [searchQuery]);
  const lcHits = useMemo(
    () => (lcId === null ? [] : searchLectureByLeetCodeId(lcId)),
    [lcId],
  );

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
                <h1 className="page-title">講義</h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  依主題整理的演算法筆記與模板；題目練習請至對應題單。
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-xl 2xl:gap-4">
              <StatCard
                icon={FolderTree}
                label="章節總數"
                value={overviewStats.totalSections}
              />
              <StatCard
                icon={BookOpen}
                label="筆記總數"
                value={overviewStats.documentedSections}
              />
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋講義主題、章節或 LeetCode 題號..."
                className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-4 text-sm shadow-none transition-colors hover:border-primary/30 focus-visible:ring-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="page-shell px-3 pb-8 sm:px-4 md:px-6 md:pb-10 xl:px-8">
        {lcId !== null && (
          <LeetCodeIdResults id={lcId} hits={lcHits} language="zh" />
        )}

        {lcId === null && (
          <>
            {filteredPlans.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">
                  <Search className="h-6 w-6" />
                </span>
                <p className="text-lg font-medium text-foreground">
                  沒有找到匹配的講義
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
                            <TutorialCard
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

            {!trimmedQuery && (
              <div className="mt-6 flex flex-col gap-4">
                <TutorialMarkdownPanel
                  title="學習順序與前置依賴"
                  content={lectureLearningPath}
                />
                <TutorialMarkdownPanel
                  title="通用解題心法"
                  content={lectureMetaSummary}
                />
                <TutorialMarkdownPanel
                  title="測試與除錯"
                  description="WA / TLE / RE 的自我檢查清單。"
                  content={lectureDebuggingGuide}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TutorialOverview;
