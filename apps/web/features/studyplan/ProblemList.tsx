import { I18NTag } from "@/components/common/I18NTag";
import { ProblemNoteButton } from "@/components/common/ProblemNoteButton";
import { ProgressSelector } from "@/components/common/ProgressSelector";
import { ratingInfo } from "@/components/common/RatingCircle";
import { useProblemProgress, useProgressMap } from "@/features/userData";
import { useGlobalSettingsStore } from "@/hooks/useGlobalSettings";
import { useOptions } from "@/hooks/useOptions";
import { useProblems } from "@/hooks/useProblems";
import { useTags } from "@/hooks/useTags";
import type { ProblemMap, TagMap } from "@/types";
import { StudyPlanData } from "@/types";
import { getLeetCodeProblemUrl } from "@/utils/leetcodeLinks";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, MoreHorizontal } from "lucide-react";
import React, { Fragment, useMemo } from "react";
import { ProblemSolution } from "./ProblemSolution";

const SOLVED = "SOLVED";

interface ProblemListProps {
  problems: StudyPlanData.Item[];
  title?: string;
  /** UI language for the header/labels. Defaults to "zh" (studyplan/lectures). */
  language?: "zh" | "en";
  /** Which label chips to show under each problem title. */
  labelSource?: "subsection" | "problemset";
  /** Keep authored order instead of sorting by rating and problem id. */
  preserveOrder?: boolean;
  /**
   * "boxed" (default) draws its own frame and header, for problem tables
   * embedded in prose. "flush" renders bare rows for a parent card.
   */
  variant?: "boxed" | "flush";
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
      ?.split(/\s*(?:\/|·)\s*/)
      .map((label) => label.trim())
      .filter(Boolean) ?? []
  );
}

function getDifficultyLabel(problem: StudyPlanData.Item) {
  if (problem.difficultyLabel) {
    return problem.difficultyLabel;
  }

  if (problem.difficulty === 1) return "Easy";
  if (problem.difficulty === 2) return "Medium";
  if (problem.difficulty === 3) return "Hard";
  return "難度 TODO";
}

function hasExtendedProblemMeta(problem: StudyPlanData.Item) {
  return Boolean(
    problem.pattern ||
      problem.why ||
      problem.insight ||
      problem.practiceOrder ||
      problem.stage ||
      problem.difficultyLabel,
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
    variant = "boxed",
  }: ProblemListProps) => {
    const linkLanguage = useGlobalSettingsStore((state) => state.linkLanguage);
    const { problemMap } = useProblems();
    const { tagMap } = useTags(labelSource === "problemset");
    const progress = useProgressMap();
    const { getOption } = useOptions();
    const { setStatus, clearStatus } = useProblemProgress();
    const pendingOption = getOption();

    // Enrich problems with scores from problemMap
    const enrichedProblems = useMemo(() => {
      const mapped = problems.map((problem) => {
        const problemId = problem.id?.toString();
        const fallbackScore =
          problemId && problemMap ? problemMap[problemId]?.rating : undefined;

        const fallbackSlug =
          problemId && problemMap
            ? problemMap[problemId]?.titleSlug
            : undefined;
        const slug = problem.slug || fallbackSlug || "";

        if (problem.score !== null && problem.score !== undefined) {
          return {
            ...problem,
            title: normalizeDisplayText(problem.title),
            slug,
            score: problem.score,
          };
        }

        return {
          ...problem,
          title: normalizeDisplayText(problem.title),
          slug,
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

    const solvedCount = enrichedProblems.filter(
      (p) => p.id !== undefined && progress[p.id.toString()] === SOLVED,
    ).length;

    const rows = enrichedProblems.map((problem) => {
      const problemId = problem.id?.toString();
      const info = ratingInfo(problem.score || 0);
      const subsectionLabels = getSubsectionLabels(problem);
      const problemsetTags = getProblemsetTags(problem, problemMap, tagMap);
      const statusKey = problemId ? progress[problemId] : undefined;
      const statusOption = getOption(statusKey);
      const showExtendedMeta = hasExtendedProblemMeta(problem);
      const solved = statusKey === SOLVED;
      const hasStarted =
        typeof statusKey !== "undefined" &&
        statusOption.key !== pendingOption.key;

      return (
        <li
          key={`${problem.slug}-${problemId}`}
          className="group/row grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-x-2.5 gap-y-2 px-4 py-3 transition-colors hover:bg-muted/30 sm:px-5 lg:items-center lg:gap-x-3"
        >
          {problemId ? (
            <button
              type="button"
              onClick={() =>
                solved ? clearStatus(problemId) : setStatus(problemId, SOLVED)
              }
              aria-label={solved ? "取消已解題" : "標記為已解題"}
              title={
                solved
                  ? "取消已解題"
                  : hasStarted
                    ? `${statusOption.label}・點一下標記為已解題`
                    : "標記為已解題"
              }
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all lg:mt-0",
                solved
                  ? "border-success bg-success text-white"
                  : "border-border text-transparent hover:border-success hover:text-success",
              )}
              style={
                hasStarted && !solved
                  ? { borderColor: statusOption.color }
                  : undefined
              }
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          ) : (
            <span className="h-7 w-7" />
          )}

          <div className="min-w-0">
            <a
              href={getLeetCodeProblemUrl(problem.slug, linkLanguage)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm leading-snug transition-colors hover:text-primary sm:text-[15px]",
                solved ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {problem.id?.toString() === "1000000000" ||
              problem.title.startsWith(`${problem.id}`) ? (
                problem.title
              ) : (
                <>
                  <span className="font-num text-muted-foreground">
                    {problem.id}.
                  </span>{" "}
                  {problem.title}
                </>
              )}
            </a>
            {hasStarted && !solved && (
              <span
                className="ml-2 inline-flex items-center rounded-full px-1.5 py-px align-middle text-[10px] font-semibold"
                style={{
                  color: statusOption.color,
                  backgroundColor: `color-mix(in srgb, ${statusOption.color} 14%, transparent)`,
                }}
              >
                {statusOption.label}
              </span>
            )}
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
            {labelSource === "subsection" && subsectionLabels.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {subsectionLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex max-w-[24ch] items-center truncate rounded-md bg-muted/70 px-1.5 py-0.5 text-[11px] leading-tight text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            {showExtendedMeta && (
              <details className="group/meta mt-1.5">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-primary/90 hover:text-primary">
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-open/meta:rotate-90" />
                  解題提示
                  {problem.pattern && (
                    <span className="font-normal text-muted-foreground">
                      ・{problem.pattern}
                    </span>
                  )}
                </summary>
                <dl className="mt-2 grid gap-x-4 gap-y-1.5 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[auto_minmax(0,1fr)]">
                  {(
                    [
                      ["難度", getDifficultyLabel(problem)],
                      ["模式", problem.pattern],
                      ["建議順序", problem.practiceOrder],
                      ["為什麼歸類", problem.why],
                      ["關鍵想法", problem.insight],
                    ] as const
                  )
                    .filter(
                      ([, value]) =>
                        value !== undefined && value !== null && value !== "",
                    )
                    .map(([label, value]) => (
                      <Fragment key={label}>
                        <dt className="font-medium text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="leading-relaxed text-foreground">
                          {value}
                        </dd>
                      </Fragment>
                    ))}
                </dl>
              </details>
            )}
          </div>

          <span
            className="font-num mt-1 w-12 shrink-0 text-right text-sm font-semibold lg:mt-0"
            style={problem.score ? { color: info.color } : undefined}
            title={problem.score ? "競賽難度分" : unratedLabel}
          >
            {problem.score ? (
              problem.score.toFixed(0)
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </span>

          {problemId && (
            // Phones fold the per-problem tools behind 「⋯」 to keep rows short.
            <label
              className="mt-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="更多操作"
            >
              <input type="checkbox" className="sr-only" />
              <MoreHorizontal className="h-4 w-4" />
            </label>
          )}

          {problemId ? (
            <div className="col-start-2 col-end-5 hidden items-center gap-1.5 group-has-[input:checked]/row:flex lg:col-start-auto lg:col-end-auto lg:flex">
              <ProblemNoteButton
                problemId={problemId}
                title={problem.title}
                triggerClassName="size-8 px-0"
              />
              <ProblemSolution problemId={problemId} title={problem.title} />
              <ProgressSelector
                problemId={problemId}
                triggerClassName="h-8 w-[7.5rem] text-xs"
              />
            </div>
          ) : (
            <span className="hidden lg:block" />
          )}
        </li>
      );
    });

    if (variant === "flush") {
      return <ul className="divide-y divide-border/60">{rows}</ul>;
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5 sm:px-5">
          <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
            {resolvedTitle}
          </p>
          <span className="font-num shrink-0 text-xs text-muted-foreground">
            {solvedCount}/{countLabel}
          </span>
        </div>
        <ul className="divide-y divide-border/60">{rows}</ul>
      </div>
    );
  },
);

ProblemList.displayName = "ProblemList";

export { ProblemList };
