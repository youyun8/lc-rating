"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { STUDYPLANS } from "@/config/constants";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Cpu,
  Database,
  Layers,
  GitBranch,
  Zap,
  Grid,
  Calculator,
  Maximize,
  Type,
  Trees,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { StudyPlanData } from "@/types";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { useProgressStore } from "@/hooks/useProgress";

const icons: Record<string, LucideIcon> = {
  binary_search: Search,
  bitwise_operations: Cpu,
  data_structure: Database,
  dynamic_programming: Layers,
  graph: GitBranch,
  greedy: Zap,
  grid: Grid,
  math: Calculator,
  monotonic_stack: Maximize,
  sliding_window: BookOpen,
  string: Type,
  trees: Trees,
};

// Count total problems in a section recursively
function countProblems(section: StudyPlanData.Section): number {
  let count = section.problems?.length || 0;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countProblems(child),
      0
    );
  }
  return count;
}

// Count total sections recursively
function countSections(section: StudyPlanData.Section): number {
  let count = 1;
  if (section.children) {
    count += section.children.reduce(
      (acc, child) => acc + countSections(child),
      0
    );
  }
  return count;
}

// Collect all problem IDs from sections recursively
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

// Filter sections recursively based on search query (matches section titles and problem IDs)
function filterSections(
  sections: StudyPlanData.Section[],
  query: string
): StudyPlanData.Section[] {
  if (!query) return sections;

  const lowerQuery = query.toLowerCase();

  return sections.reduce((acc: StudyPlanData.Section[], section) => {
    const matchesTitle = section.title.toLowerCase().includes(lowerQuery);

    const matchingProblems = section.problems?.filter(
      (p) => p.id?.toString() === query || p.title.toLowerCase().includes(lowerQuery)
    );
    const hasMatchingProblems = matchingProblems && matchingProblems.length > 0;

    let filteredChildren: StudyPlanData.Section[] = [];
    if (section.children) {
      filteredChildren = filterSections(section.children, query);
    }

    if (matchesTitle) {
      acc.push(section);
    } else if (hasMatchingProblems || filteredChildren.length > 0) {
      acc.push({
        ...section,
        ...(hasMatchingProblems ? { problems: matchingProblems } : {}),
        ...(filteredChildren.length > 0 ? { children: filteredChildren } : { children: [] }),
      });
    }

    return acc;
  }, []);
}

interface StudyPlanCardProps {
  planKey: string;
  title: string;
  searchQuery?: string;
}

function StudyPlanCard({ planKey, title, searchQuery = "" }: StudyPlanCardProps) {
  const Icon = icons[planKey] || BookOpen;
  const [isOpen, setIsOpen] = useState(false);

  const data = studyPlanDataMap[planKey];
  const progress = useProgressStore((state) => state.progress);

  const { totalProblems, totalSections, completedProblems } = useMemo(() => {
    if (!data) return { totalProblems: 0, totalSections: 0, completedProblems: 0 };
    const ids = collectProblemIds(data.children);
    return {
      totalProblems: ids.length || data.children.reduce(
        (acc: number, child: StudyPlanData.Section) => acc + countProblems(child),
        0
      ),
      totalSections: data.children.reduce(
        (acc: number, child: StudyPlanData.Section) => acc + countSections(child),
        0
      ),
      completedProblems: ids.filter((id) => progress[id] === "AC").length,
    };
  }, [data, progress]);

  const pct = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

  const query = searchQuery.trim().toLowerCase();
  const matchesPlanTitle = title.toLowerCase().includes(query);

  const displaySections = useMemo(() => {
    if (!data) return [];
    if (!query) return data.children;
    if (matchesPlanTitle) return data.children;
    return filterSections(data.children, query);
  }, [data, query, matchesPlanTitle]);

  if (!data) {
    return null;
  }

  if (query && !matchesPlanTitle && displaySections.length === 0) {
    return null;
  }

  const isSearchActive = query.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <Link
                  href={`/studyplan/${planKey}`}
                  className="hover:text-primary transition-colors"
                >
                  {title}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {totalProblems} 題 · {totalSections} 個章節
              </CardDescription>
              {totalProblems > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    已完成 {completedProblems} / {totalProblems} 題{" "}
                    <span
                      className={
                        pct === 100
                          ? "text-green-500 font-semibold"
                          : pct >= 50
                          ? "text-amber-500 font-semibold"
                          : pct > 0
                          ? "text-blue-500 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={
                        pct === 100
                          ? "h-full rounded-full bg-green-500 transition-all duration-500"
                          : pct >= 50
                          ? "h-full rounded-full bg-amber-500 transition-all duration-500"
                          : "h-full rounded-full bg-blue-500 transition-all duration-500"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <Link
            href={`/studyplan/${planKey}`}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <Collapsible open={isSearchActive || isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <span>查看章節</span>
              {isSearchActive || isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="text-sm border-l-2 border-border pl-3 mt-2 space-y-1">
              {displaySections.map((section: StudyPlanData.Section) => (
                <SectionTree
                  key={section.title}
                  section={section}
                  planKey={planKey}
                  searchQuery={query}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

interface SectionTreeProps {
  section: StudyPlanData.Section;
  planKey: string;
  depth?: number;
  searchQuery?: string;
}

function SectionTree({ section, planKey, depth = 0, searchQuery = "" }: SectionTreeProps) {
  const hasChildren = section.children && section.children.length > 0;
  const problemCount = countProblems(section);

  const isMatch = searchQuery && section.title.toLowerCase().includes(searchQuery.toLowerCase());
  const hasMatchingProblems = searchQuery && section.problems && section.problems.length > 0;

  return (
    <div className={depth > 0 ? "ml-3 border-l border-border pl-2" : ""}>
      <Link
        href={`/studyplan/${planKey}#${section.title}`}
        className={`flex items-center justify-between py-1 hover:text-primary transition-colors group ${isMatch ? "text-primary font-medium" : ""}`}
      >
        <span className="truncate">{section.title}</span>
        {problemCount > 0 && (
          <span className={`text-xs group-hover:text-primary ${isMatch ? "text-primary/80" : "text-muted-foreground"}`}>
            {problemCount} 題
          </span>
        )}
      </Link>
      {searchQuery && hasMatchingProblems && (
        <div className="ml-3 border-l border-border pl-2">
          {section.problems!.map((problem) => (
            <a
              key={problem.slug}
              href={problem.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-0.5 text-xs text-primary hover:underline transition-colors"
            >
              {problem.id && <span className="text-muted-foreground">{problem.id}.</span>}
              <span className="truncate">{problem.title}</span>
            </a>
          ))}
        </div>
      )}
      {hasChildren && (
        <div className="mt-1">
          {section.children!.map((child) => (
            <SectionTree
              key={child.title}
              section={child}
              planKey={planKey}
              depth={depth + 1}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudyPlanOverview() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 font-song">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">題單</h1>
          <p className="text-muted-foreground">
            由靈茶山艾府（0x3F）整理的演算法題單，涵蓋各種常見演算法與資料結構。
            點擊任意題單查看詳細內容與題目列表。
          </p>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="搜尋題單、子章節或題目編號..."
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background hover:border-primary/30 focus:border-primary focus-visible:ring-1 focus-visible:ring-ring transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(STUDYPLANS).map(([key, title]) => (
          <StudyPlanCard key={key} planKey={key} title={title} searchQuery={searchQuery} />
        ))}
      </div>
    </div>
  );
}

export default StudyPlanOverview;
