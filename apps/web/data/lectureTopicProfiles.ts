import type { StudyPlanData, TutorialData } from "@/types";
import {
  lectureTopicProfiles,
  defaultLectureExamples,
  exampleLectureOverrides,
} from "./lectureTopicProfiles.data";

export interface LectureTopicProfile {
  key: string;
  planKeys?: string[];
  keywords: string[];
  modelProblem: string;
  signals: string[];
  invariants: string[];
  derivation: string[];
  patterns: string[];
  pitfalls: string[];
  complexity: string;
  code: string;
  examples?: Record<
    string,
    Partial<
      Pick<
        LectureTopicProfile,
        | "modelProblem"
        | "signals"
        | "invariants"
        | "derivation"
        | "patterns"
        | "pitfalls"
        | "complexity"
        | "code"
      >
    >
  >;
}

function normalize(text: string) {
  return text.toLowerCase();
}

function normalizeExampleSlug(slug: string) {
  return slug.replace(/^\/+|\/+$/g, "");
}

function stripNumericPrefix(title: string) {
  return title.replace(/^\d+(?:\.\d+)*\.?\s*/, "").trim();
}

function getRating2100ProfileKey(titleHaystack: string) {
  if (titleHaystack.includes("二分")) return "binary-answer";
  if (titleHaystack.includes("位元")) return "bitwise-contribution";
  if (titleHaystack.includes("資料結構")) {
    return "rating-2100-data-structure";
  }
  if (titleHaystack.includes("動態規劃")) return "rating-2100-dp";
  if (titleHaystack.includes("網格")) return "grid-state-bfs";
  if (titleHaystack.includes("圖論")) return "graph-bfs-dfs";
  if (titleHaystack.includes("貪心")) return "greedy-general";
  if (titleHaystack.includes("數學")) return "math-number-theory";
  if (titleHaystack.includes("單調")) return "monotonic-stack";
  if (titleHaystack.includes("滑動")) return "sliding-window";
  if (titleHaystack.includes("字串")) return "string-tools";
  if (titleHaystack.includes("樹")) return "tree-linked-binary";
  return undefined;
}

function scoreProfile(
  profile: LectureTopicProfile,
  planKey: string,
  haystack: string,
  titleHaystack: string,
) {
  if (profile.planKeys && !profile.planKeys.includes(planKey)) {
    return -1;
  }

  return profile.keywords.reduce(
    (score, keyword) => {
      const normalized_keyword = normalize(keyword);
      const title_score = titleHaystack.includes(normalized_keyword)
        ? Math.max(4, normalized_keyword.length * 2)
        : 0;
      if (haystack.includes(normalized_keyword)) {
        return score + title_score + Math.max(2, normalized_keyword.length);
      }
      return score + title_score;
    },
    profile.planKeys?.includes(planKey) ? 2 : 0,
  );
}

export function findLectureTopicProfile({
  planKey,
  section,
  studySection,
  pathTitles,
  example,
}: {
  planKey: string;
  section: TutorialData.Section;
  studySection?: StudyPlanData.Section;
  pathTitles: string[];
  example?: StudyPlanData.Item;
}) {
  const haystack = normalize(
    [
      planKey,
      ...pathTitles,
      section.title,
      studySection?.title ?? "",
      example?.title ?? "",
      example?.slug ?? "",
    ].join(" "),
  );
  const titleHaystack = normalize(
    [section.title, studySection?.title ?? "", pathTitles.at(-1) ?? ""].join(
      " ",
    ),
  );

  const rating_2100_profile_key =
    planKey === "rating_2100"
      ? getRating2100ProfileKey(titleHaystack)
      : undefined;
  const rating_2100_profile = rating_2100_profile_key
    ? lectureTopicProfiles.find(
        (profile) => profile.key === rating_2100_profile_key,
      )
    : undefined;
  if (rating_2100_profile) {
    return rating_2100_profile;
  }

  let best_profile = lectureTopicProfiles[0]!;
  let best_score = -1;
  for (const profile of lectureTopicProfiles) {
    const score = scoreProfile(profile, planKey, haystack, titleHaystack);
    if (score > best_score) {
      best_score = score;
      best_profile = profile;
    }
  }
  return best_profile;
}

export function mergeExampleProfile(
  profile: LectureTopicProfile,
  example?: StudyPlanData.Item,
): LectureTopicProfile {
  const slug = example ? normalizeExampleSlug(example.slug) : undefined;
  const override = slug
    ? {
        ...exampleLectureOverrides[slug],
        ...profile.examples?.[slug],
      }
    : undefined;
  if (!override) return profile;
  return {
    ...profile,
    ...override,
    key: profile.key,
    keywords: profile.keywords,
    planKeys: profile.planKeys,
    examples: profile.examples,
  };
}

export function hasExampleLectureProfile(
  profile: LectureTopicProfile,
  example?: StudyPlanData.Item,
) {
  const slug = example ? normalizeExampleSlug(example.slug) : undefined;
  if (!slug) return false;
  return Boolean(exampleLectureOverrides[slug] || profile.examples?.[slug]);
}

export function getDefaultLectureExample(
  profile: LectureTopicProfile,
): StudyPlanData.Item | undefined {
  return defaultLectureExamples[profile.key];
}

export function formatLectureTopicTitle(section: TutorialData.Section) {
  return stripNumericPrefix(section.title) || section.title;
}
