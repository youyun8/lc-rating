import { I18NTag } from "@/components/common/I18NTag";
import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import { useProgressMap } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { useOptions } from "@/hooks/useOptions";
import { useProblems } from "@/hooks/useProblems";
import { useTags } from "@/hooks/useTags";
import type { ProblemMap, TagMap } from "@/types";
import { StudyPlanData } from "@/types";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import React, { useMemo } from "react";
import { ProblemSolution } from "./ProblemSolution";

interface ProblemListProps {
  problems: StudyPlanData.Item[];
  title?: string;
  /** UI language for the header/labels. Defaults to "zh" (studyplan/lectures). */
  language?: "zh" | "en";
  /** Which label chips to show under each problem title. */
  labelSource?: "subsection" | "problemset";
  /** Keep authored order instead of sorting by rating and problem id. */
  preserveOrder?: boolean;
}

function getSortableProblemIndex(problem: StudyPlanData.Item) {
  return String(problem.id ?? problem.slug ?? "");
}

function getSortableProblemScore(problem: StudyPlanData.Item) {
  return typeof problem.score === "number"
    ? problem.score
    : Number.NEGATIVE_INFINITY;
}

function compareStudyPlanProblems(
  a: StudyPlanData.Item,
  b: StudyPlanData.Item,
) {
  const scoreDiff = getSortableProblemScore(a) - getSortableProblemScore(b);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  const indexDiff = getSortableProblemIndex(a).localeCompare(
    getSortableProblemIndex(b),
    undefined,
    { numeric: true, sensitivity: "base" },
  );

  if (indexDiff !== 0) {
    return indexDiff;
  }

  return a.slug.localeCompare(b.slug);
}

function studyPlanProblemDedupeKey(problem: StudyPlanData.Item) {
  const trimmed = problem.slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  return trimmed.length > 0 ? trimmed : `id:${String(problem.id ?? "")}`;
}

/** Prefer canonical CN ids (LCP/LCS/面試題) over numeric duplicates that share the same slug. */
function studyPlanProblemCanonicalScore(problem: StudyPlanData.Item) {
  let score = 0;
  const { id, slug } = problem;
  if (typeof id === "string") {
    const upper = id.toUpperCase();
    if (upper.startsWith("LCP") || upper.startsWith("LCS")) {
      score += 4;
    } else if (id.includes("面試")) {
      score += 4;
    } else {
      score += 1;
    }
  } else if (typeof id === "number" && id === 1_000_000_000) {
    score -= 2;
  }
  if (slug && !(slug.startsWith("/") && slug.endsWith("/"))) {
    score += 1;
  }
  return score;
}

function dedupeStudyPlanProblems(
  problems: StudyPlanData.Item[],
  preserveOrder = false,
) {
  const byKey = new Map<string, StudyPlanData.Item>();
  for (const problem of problems) {
    const key = studyPlanProblemDedupeKey(problem);
    const existing = byKey.get(key);
    if (
      !existing ||
      studyPlanProblemCanonicalScore(problem) >
        studyPlanProblemCanonicalScore(existing)
    ) {
      byKey.set(key, problem);
    }
  }
  const deduped = Array.from(byKey.values());
  return preserveOrder ? deduped : deduped.sort(compareStudyPlanProblems);
}

function normalizedStudyPlanSlug(slug: string) {
  return slug.replace(/^\/+|\/+$/g, "").toLowerCase();
}

function getSubsectionLabels(problem: StudyPlanData.Item) {
  return (
    problem.subsection
      ?.split(" / ")
      .map((label) => label.trim())
      .filter(Boolean) ?? []
  );
}

function getProblemsetTags(
  problem: StudyPlanData.Item,
  problemMap: ProblemMap | undefined,
  tagMap: TagMap | undefined,
) {
  const problemId = problem.id?.toString();
  if (!problemId) {
    return [];
  }

  const tagIds = problemMap?.[problemId]?.tagIds ?? [];
  return tagIds
    .map((tagId) => tagMap?.[tagId])
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
}

/** Same numeric/LC id listed twice with different slugs (data typo or alternate URLs). */
function mergeStudyPlanProblemsById(
  problems: StudyPlanData.Item[],
  problemMap: ProblemMap | undefined,
  preserveOrder = false,
) {
  const fromSlug = dedupeStudyPlanProblems(problems, preserveOrder);
  if (!problemMap) {
    return fromSlug;
  }

  const rank = (p: StudyPlanData.Item) => {
    let score = studyPlanProblemCanonicalScore(p);
    const pid = p.id?.toString();
    const expected = pid ? problemMap[pid]?.titleSlug : undefined;
    if (
      expected &&
      normalizedStudyPlanSlug(p.slug) === normalizedStudyPlanSlug(expected)
    ) {
      score += 6;
    }
    return score;
  };

  const groups = new Map<string, StudyPlanData.Item[]>();
  for (const p of fromSlug) {
    if (p.id === undefined || p.id === null) {
      continue;
    }
    const k = String(p.id);
    const g = groups.get(k);
    if (g) {
      g.push(p);
    } else {
      groups.set(k, [p]);
    }
  }

  const losers = new Set<StudyPlanData.Item>();
  for (const items of groups.values()) {
    if (items.length < 2) {
      continue;
    }
    const keep = items.reduce((a, b) => (rank(b) > rank(a) ? b : a));
    for (const it of items) {
      if (it !== keep) {
        losers.add(it);
      }
    }
  }

  const merged = fromSlug.filter((p) => !losers.has(p));
  return preserveOrder ? merged : merged.sort(compareStudyPlanProblems);
}

const ProblemList = React.memo(
  ({
    problems,
    title,
    language = "zh",
    labelSource = "subsection",
    preserveOrder = false,
  }: ProblemListProps) => {
    const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
    const { problemMap } = useProblems();
    const { tagMap } = useTags(labelSource === "problemset");
    const progress = useProgressMap();
    const { getOption } = useOptions();
    const pendingOption = getOption();

    // Enrich problems with scores from problemMap
    const enrichedProblems = useMemo(() => {
      const mapped = problems.map((problem) => {
        const problemId = problem.id?.toString();
        const fallbackScore =
          problemId && problemMap ? problemMap[problemId]?.rating : undefined;

        if (problem.score !== null && problem.score !== undefined) {
          return {
            ...problem,
            title: normalizeDisplayText(problem.title),
            score: problem.score,
          };
        }

        return {
          ...problem,
          title: normalizeDisplayText(problem.title),
          score: fallbackScore ?? problem.score,
        };
      });
      return mergeStudyPlanProblemsById(mapped, problemMap, preserveOrder);
    }, [preserveOrder, problems, problemMap]);

    const isEnglish = language === "en";
    const count = enrichedProblems.length;
    const resolvedTitle = title ?? (isEnglish ? "Problems" : "題目列表");
    const countLabel = isEnglish
      ? `${count} ${count === 1 ? "problem" : "problems"}`
      : `${count} 題`;
    const unratedLabel = isEnglish ? "Unrated" : "無評分";

    return (
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-4 py-3">
          <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
            {resolvedTitle}
          </p>
          <span className="shrink-0 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
            {countLabel}
          </span>
        </div>

        {enrichedProblems.map((problem, idx) => {
          const problemId = problem.id?.toString();
          const info = ratingInfo(problem.score || 0);
          const subsectionLabels = getSubsectionLabels(problem);
          const problemsetTags = getProblemsetTags(problem, problemMap, tagMap);
          const statusKey = problemId ? progress[problemId] : undefined;
          const statusOption = getOption(statusKey);
          const hasStarted =
            typeof statusKey !== "undefined" &&
            statusOption.key !== pendingOption.key;

          return (
            <div
              key={`${problem.slug}-${problemId}`}
              className={`flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between${
                idx < enrichedProblems.length - 1
                  ? " border-b border-border/60"
                  : ""
              }`}
              style={
                hasStarted
                  ? {
                      backgroundColor: `color-mix(in srgb, ${statusOption.color} 10%, transparent)`,
                    }
                  : undefined
              }
            >
              <div className="min-w-0 flex-1">
                <a
                  href={getLeetCodeProblemUrl(problem.slug, linkLanguage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:text-[15px]"
                >
                  {problem.id?.toString() === "1000000000" ||
                  problem.title.startsWith(`${problem.id}`)
                    ? problem.title
                    : `${problem.id}. ${problem.title}`}
                </a>
                {labelSource === "problemset" && problemsetTags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {problemsetTags.map((tag) => (
                      <I18NTag
                        key={tag.id}
                        label={{ zh: tag.zh, en: tag.en }}
                        className="max-w-[24ch] truncate text-[11px] leading-tight"
                      />
                    ))}
                  </div>
                )}
                {labelSource === "subsection" &&
                  subsectionLabels.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {subsectionLabels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex max-w-[24ch] items-center truncate rounded-md border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[11px] leading-tight text-muted-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <div className="flex items-center gap-2">
                  {problem.score ? (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                      style={{
                        color: info.color,
                        backgroundColor: `${info.color}1a`,
                      }}
                    >
                      {problem.score.toFixed(0)}
                    </span>
                  ) : (
                    <span className="rounded-full border border-dashed border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                      {unratedLabel}
                    </span>
                  )}
                </div>
                {problemId ? (
                  <>
                    <ProblemSolution
                      problemId={problemId}
                      title={problem.title}
                    />
                    <ProgressSelector
                      problemId={problemId}
                      triggerClassName="min-w-[7.5rem] sm:min-w-[8rem] max-w-[12rem]"
                    />
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

ProblemList.displayName = "ProblemList";

export { ProblemList };
