import type { StudyPlanData } from "@/types";

const RECOMMENDED_PRACTICE_COUNT = 5;
export const RECOMMENDED_MIN_RATING = 1700;

function getProblemScore(problem: StudyPlanData.Item) {
  return typeof problem.score === "number"
    ? problem.score
    : Number.NEGATIVE_INFINITY;
}

function compareProblemsByScore(a: StudyPlanData.Item, b: StudyPlanData.Item) {
  const scoreDiff = getProblemScore(a) - getProblemScore(b);
  if (scoreDiff !== 0) return scoreDiff;

  return String(a.id ?? a.slug).localeCompare(
    String(b.id ?? b.slug),
    undefined,
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

export function pickRecommendedPractice(
  problems: StudyPlanData.Item[],
  limit = RECOMMENDED_PRACTICE_COUNT,
) {
  const hasRecommendedScore = (problem: StudyPlanData.Item) =>
    typeof problem.score === "number" &&
    problem.score >= RECOMMENDED_MIN_RATING;

  const recommended = problems
    .filter(hasRecommendedScore)
    .sort(compareProblemsByScore);

  if (recommended.length >= limit) {
    return recommended.slice(0, limit);
  }

  const fillers = problems
    .filter((problem) => !hasRecommendedScore(problem))
    .sort((a, b) => getProblemScore(b) - getProblemScore(a))
    .slice(0, limit - recommended.length);

  return [...recommended, ...fillers];
}

export function getPracticeDifficulty(problem: StudyPlanData.Item) {
  if (typeof problem.score !== "number") return "unrated";
  if (problem.score < 1600) return "foundation";
  if (problem.score < 2200) return "core";
  return "challenge";
}
