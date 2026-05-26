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
  FolderTree,
  LayoutGrid,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, type ReactNode } from "react";
import { TutorialData } from "@/types";
import { tutorialDataMap } from "@/utils/tutorialIndex";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { getTutorialStats } from "@/features/learning/utils/sectionTree";

function getTutorialSummary(data: TutorialData.Root | undefined) {
  const stats = getTutorialStats(data);
  return {
    totalSections: stats.sections,
    documentedSections: stats.documented + (data?.summary ? 1 : 0),
  };
}

type TutorialSearchMatch = {
  kind: "plan" | "section";
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

function getTutorialMatches(
  data: TutorialData.Root,
  title: string,
  query: string,
): TutorialSearchMatch[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const normalizedQuery = normalizeDisplayText(trimmedQuery).toLowerCase();
  const matches: TutorialSearchMatch[] = [];
  const seen = new Set<string>();
  const normalizedTitle = normalizeDisplayText(title);

  const addMatch = (match: TutorialSearchMatch) => {
    const key = `${match.kind}:${match.label}:${match.text}:${match.context ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push(match);
  };

  if (normalizedTitle.toLowerCase().includes(normalizedQuery)) {
    addMatch({ kind: "plan", label: "講義", text: normalizedTitle });
  }

  const visitSection = (
    section: TutorialData.Section,
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
    section.children?.forEach((child) => visitSection(child, currentPath));
  };

  data.children.forEach((section) => visitSection(section));
  return matches;
}

interface TutorialCardProps {
  planKey: string;
  title: string;
  searchQuery: string;
  searchMatches: TutorialSearchMatch[];
}

function TutorialCard({
  planKey,
  title,
  searchQuery,
  searchMatches,
}: TutorialCardProps) {
  const router = useRouter();
  const Icon = studyPlanIcons[planKey] ?? BookOpen;
  const theme = studyPlanThemes[planKey] ?? defaultTheme;
  const data = tutorialDataMap[planKey];

  const { totalSections, documentedSections } = useMemo(
    () => getTutorialSummary(data),
    [data],
  );

  const visibleMatches = searchMatches.slice(0, MAX_VISIBLE_MATCHES);

  if (!data) return null;

  const getMatchHref = (match: TutorialSearchMatch): string => {
    const base = `/lecture/${planKey}`;
    if (match.kind === "plan") return base;
    if (match.kind === "section") return `${base}#${sectionAnchor(match.text)}`;
    return base;
  };

  return (
    <Link href={`/lecture/${planKey}`} className="block h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div
          className="relative h-28 overflow-hidden sm:h-32"
          style={{ background: theme.gradient }}
        >
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/5" />
          <div className="absolute top-3 right-3 h-16 w-16 rounded-full bg-white/5" />
          <div className="absolute right-3 top-3">
            <Badge className="border-white/15 bg-white/15 text-white backdrop-blur-sm">
              {documentedSections} 則筆記
            </Badge>
          </div>
          <div className="relative flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm ring-1 ring-white/20">
              <Icon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-lg">
            {title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {totalSections} 個章節
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {documentedSections} 則筆記
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

          <div
            className="mt-auto inline-flex items-center pt-4 text-sm font-medium transition-colors"
            style={{ color: theme.accent }}
          >
            閱讀講義
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TutorialOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  const planSearchMatches = useMemo(() => {
    if (!trimmedQuery) return {} as Record<string, TutorialSearchMatch[]>;

    return Object.entries(STUDYPLANS).reduce<
      Record<string, TutorialSearchMatch[]>
    >((acc, [key, title]) => {
      const data = tutorialDataMap[key];
      acc[key] = data ? getTutorialMatches(data, title, trimmedQuery) : [];
      return acc;
    }, {});
  }, [trimmedQuery]);

  const filteredPlans = useMemo(() => {
    return Object.entries(STUDYPLANS).filter(([key]) => {
      if (!trimmedQuery) return true;
      const matches = planSearchMatches[key];
      return matches && matches.length > 0;
    });
  }, [trimmedQuery, planSearchMatches]);

  const overviewStats = useMemo(() => {
    return Object.keys(STUDYPLANS).reduce(
      (acc, key) => {
        const stat = getTutorialSummary(tutorialDataMap[key]);
        acc.totalSections += stat.totalSections;
        acc.documentedSections += stat.documentedSections;
        return acc;
      },
      { totalSections: 0, documentedSections: 0 },
    );
  }, []);

  const totalPlans = Object.keys(STUDYPLANS).length;

  return (
    <div className="min-h-screen bg-background font-song">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:gap-6 xl:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  講義
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  依主題整理的演算法筆記與模板，專注於學習與複習；題目練習請至對應題單。
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
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
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

              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
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

              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center text-muted-foreground">
            <Search className="mb-4 h-12 w-12 opacity-30" />
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
      </div>
    </div>
  );
}

export default TutorialOverview;
