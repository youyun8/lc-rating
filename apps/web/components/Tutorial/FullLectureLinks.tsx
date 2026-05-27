"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STUDYPLANS } from "@/config/constants";
import {
  defaultTheme,
  studyPlanIcons,
  studyPlanThemes,
} from "@/config/studyPlanThemes";
import {
  getTutorialSectionLinkGroups,
  type TutorialSectionLink,
} from "@/utils/tutorialSectionLinks";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderTree,
  LayoutList,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const lectureGroups = getTutorialSectionLinkGroups();
const totalLinks = lectureGroups.reduce(
  (sum, group) => sum + group.links.length,
  0,
);

function matchesQuery(link: TutorialSectionLink, query: string) {
  if (!query) return true;

  const target = [
    link.planTitle,
    link.title,
    link.pathTitles.join(" "),
    link.slug,
  ]
    .join(" ")
    .toLowerCase();

  return target.includes(query.toLowerCase());
}

function FullLectureLinks() {
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  const filteredGroups = useMemo(() => {
    return lectureGroups
      .map((group) => ({
        ...group,
        links: group.links.filter((link) => matchesQuery(link, trimmedQuery)),
      }))
      .filter((group) => group.links.length > 0);
  }, [trimmedQuery]);

  const filteredTotal = filteredGroups.reduce(
    (sum, group) => sum + group.links.length,
    0,
  );

  return (
    <div className="min-h-screen bg-background font-song">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        <section className="brand-glow motion-rise relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-[0_30px_80px_-50px_rgba(6,182,212,0.55)]">
          <div className="flex flex-col gap-5 p-4 sm:p-6 xl:p-8">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <Link
                href="/lecture"
                className="transition-colors hover:text-foreground"
              >
                講義
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">完整講義索引</span>
            </nav>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  完整講義
                </div>
                <h1 className="brand-text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
                  完整講義索引
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  集中所有章節的完整講義連結，可依主題或章節名稱快速搜尋。
                </p>
              </div>

              <Link
                href="/lecture"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                返回講義列表
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 2xl:gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <LayoutList className="h-4 w-4" />
                  完整講義
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {totalLinks}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  所有章節詳解頁
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  講義主題
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {Object.keys(STUDYPLANS).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  依題單主題分組
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Search className="h-4 w-4" />
                  目前顯示
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {filteredTotal}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  符合搜尋條件
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border/60 bg-card shadow-sm sm:mt-5">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                搜尋完整講義
              </h2>
              <p className="text-sm text-muted-foreground">
                可搜尋主題、章節名稱或章節路徑。
              </p>
            </div>
            <div className="w-full lg:max-w-sm xl:max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜尋完整講義..."
                  className="h-11 rounded-xl border-border/60 bg-background pl-9 pr-4 text-sm shadow-none transition-colors hover:border-primary/30 focus-visible:ring-2"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-8 sm:px-4 md:px-6 md:pb-10 xl:max-w-[88rem] xl:px-8 2xl:max-w-[96rem]">
        {filteredGroups.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-lg font-medium text-foreground">
              沒有找到匹配的完整講義
            </p>
            <p className="mt-1 text-sm">試試其他搜尋關鍵字。</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredGroups.map((group) => {
              const Icon = studyPlanIcons[group.planKey] ?? BookOpen;
              const theme = studyPlanThemes[group.planKey] ?? defaultTheme;

              return (
                <section
                  key={group.planKey}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
                >
                  <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ background: theme.gradient }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                          {group.planTitle}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {group.links.length} 篇完整講義
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/lecture/${group.planKey}`}
                      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      主題頁
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-3">
                    {group.links.map((link) => (
                      <Link
                        key={`${link.planKey}-${link.id}`}
                        href={link.href}
                        className="group flex min-h-24 flex-col justify-between gap-3 border-b border-border/60 p-4 transition-colors hover:bg-muted/35 sm:border-r sm:p-5 xl:[&:nth-child(3n)]:border-r-0"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-full text-[11px] font-medium"
                            >
                              {link.depth === 0
                                ? "主章節"
                                : link.depth === 1
                                  ? "子章節"
                                  : "細分章節"}
                            </Badge>
                            {link.depth > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Level {link.depth + 1}
                              </span>
                            )}
                          </div>
                          <h3 className="break-words text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
                            {link.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-xs text-muted-foreground">
                            {link.pathTitles.slice(0, -1).join(" / ") ||
                              link.planTitle}
                          </p>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FullLectureLinks;
