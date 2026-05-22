import { STUDYPLANS } from "@/config/constants";
import { getGoogleInterviewSectionTutorial } from "@/data/googleInterviewSectionTutorials";
import {
  findLectureTopicProfile,
  formatLectureTopicTitle,
  getDefaultLectureExample,
  hasExampleLectureProfile,
  mergeExampleProfile,
} from "@/data/lectureTopicProfiles";
import problemMapJson from "@/public/problemset/problems.json";
import type { ProblemMap, StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";

const EXAMPLE_MIN_RATING = 1900;
const problemMap = problemMapJson as ProblemMap;
const problemBySlug = new Map(
  Object.values(problemMap).map((problem) => [problem.titleSlug, problem]),
);

export interface LectureSectionNavItem {
  id: number;
  title: string;
  slug: string;
  depth: number;
}

export interface LectureSectionTutorial {
  id: number;
  title: string;
  slug: string;
  planKey: string;
  planTitle: string;
  content: string;
  navItems: LectureSectionNavItem[];
  previous?: LectureSectionNavItem;
  next?: LectureSectionNavItem;
}

interface IndexedTutorialSection extends LectureSectionNavItem {
  section: TutorialData.Section;
  pathTitles: string[];
}

function flattenTutorialSections(
  sections: TutorialData.Section[] | undefined,
  pathTitles: string[] = [],
  depth = 0,
): IndexedTutorialSection[] {
  if (!sections) return [];

  return sections.flatMap((section) => {
    const item: IndexedTutorialSection = {
      id: section.id,
      title: section.title,
      slug: sectionAnchor(section.title),
      depth,
      section,
      pathTitles: [...pathTitles, section.title],
    };
    return [
      item,
      ...flattenTutorialSections(
        section.children,
        [...pathTitles, section.title],
        depth + 1,
      ),
    ];
  });
}

function findStudyPlanSectionById(
  sections: StudyPlanData.Section[] | undefined,
  id: number,
): StudyPlanData.Section | undefined {
  if (!sections) return undefined;

  for (const section of sections) {
    if (section.id === id) return section;
    const child = findStudyPlanSectionById(section.children, id);
    if (child) return child;
  }

  return undefined;
}

function flattenProblems(
  section: StudyPlanData.Section | undefined,
): StudyPlanData.Item[] {
  if (!section) return [];
  return [
    ...(section.problems ?? []),
    ...(section.children ?? []).flatMap(flattenProblems),
  ];
}

function getProblemRating(problem: StudyPlanData.Item | undefined) {
  if (!problem) return undefined;
  if (typeof problem.score === "number") return problem.score;

  const problem_id = problem.id?.toString();
  const indexed_by_id = problem_id ? problemMap[problem_id] : undefined;
  return indexed_by_id?.rating ?? problemBySlug.get(problem.slug)?.rating;
}

function getProblemDisplayId(problem: StudyPlanData.Item | undefined) {
  if (!problem) return undefined;
  return problem.id?.toString();
}

function getProblemDisplayTitle(problem: StudyPlanData.Item) {
  const problem_id = getProblemDisplayId(problem);
  if (!problem_id) return problem.title;
  const escaped_id = problem_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return problem.title.replace(new RegExp(`^${escaped_id}\\.?\\s*`), "");
}

function pickExampleProblem(
  section: StudyPlanData.Section | undefined,
): StudyPlanData.Item | undefined {
  const problems = flattenProblems(section);
  if (problems.length === 0) return undefined;

  const high = problems
    .filter((problem) => (getProblemRating(problem) ?? 0) >= EXAMPLE_MIN_RATING)
    .sort((a, b) => (getProblemRating(a) ?? 0) - (getProblemRating(b) ?? 0));
  if (high.length > 0) return high[0];

  return problems
    .slice()
    .sort(
      (a, b) =>
        (getProblemRating(b) ?? Number.NEGATIVE_INFINITY) -
        (getProblemRating(a) ?? Number.NEGATIVE_INFINITY),
    )[0];
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatSteps(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function formatProblemReference(
  example: StudyPlanData.Item | undefined,
  isFromStudyPlan: boolean,
) {
  if (!example) return "本節使用本章標準模型題作為講解主線。";
  const problem_id = getProblemDisplayId(example);
  const rating = getProblemRating(example);
  const problem_label = problem_id
    ? `LeetCode ${problem_id}「${getProblemDisplayTitle(example)}」`
    : `「${getProblemDisplayTitle(example)}」`;
  const source = isFromStudyPlan ? "題單中的 " : "";
  return `本節以${source}${problem_label} 作為主例題${
    typeof rating === "number" ? `（rating ${Math.round(rating)}）` : ""
  }，並把同一套不變式延伸到本節其他題目。`;
}

function formatProblemHeading(
  example: StudyPlanData.Item | undefined,
  fallbackTitle: string,
) {
  if (!example) return fallbackTitle;
  const problem_id = getProblemDisplayId(example);
  const prefix = problem_id ? `LeetCode ${problem_id} ` : "";
  return `${prefix}${getProblemDisplayTitle(example)}`;
}

function buildRelatedProblems(studySection: StudyPlanData.Section | undefined) {
  const problems = flattenProblems(studySection).slice(0, 5);
  if (problems.length === 0) return undefined;

  return [
    "**本節題單中的延伸題**",
    formatList(
      problems.map((problem) => {
        const rating =
          typeof getProblemRating(problem) === "number"
            ? `，rating ${Math.round(getProblemRating(problem)!)}`
            : "";
        const problem_id = getProblemDisplayId(problem);
        const prefix = problem_id ? `LeetCode ${problem_id} ` : "";
        return `${prefix}${getProblemDisplayTitle(problem)}${rating}`;
      }),
    ),
  ].join("\n\n");
}

function normalizeGoogleContent(content: string) {
  return content.replace(/\n\n題目：/g, "\n\n**完整問題**：");
}

function buildGenericSectionContent(
  planKey: string,
  indexed: IndexedTutorialSection,
  studySection: StudyPlanData.Section | undefined,
) {
  const { section } = indexed;
  const picked_example = pickExampleProblem(studySection);
  const baseProfile = findLectureTopicProfile({
    planKey,
    section,
    studySection,
    pathTitles: indexed.pathTitles,
    example: picked_example,
  });
  const has_picked_specific_profile =
    picked_example && hasExampleLectureProfile(baseProfile, picked_example);
  const example = has_picked_specific_profile
    ? picked_example
    : getDefaultLectureExample(baseProfile);
  const isFromStudyPlan = Boolean(has_picked_specific_profile);
  const profile = mergeExampleProfile(baseProfile, example);
  const topic = formatLectureTopicTitle(section);
  const summary = [
    "**觀念講解**",
    `本節主題是「${topic}」。這一頁不延續題單的短版摘要，而是把章節中的代表模型完整拆開：先確認題目訊號，再把輸入轉成狀態或資料結構，接著說明每一步轉移如何維護不變式，最後才落到 C++ 骨架。`,
    "**本節核心模型**",
    profile.modelProblem,
    "**從零建模**",
    formatSteps(profile.derivation),
  ].join("\n\n");
  const relatedProblems = buildRelatedProblems(studySection);

  return [
    summary,
    [
      `**例題解析：${formatProblemHeading(example, topic)}**`,
      `**完整問題**：${profile.modelProblem}`,
      formatProblemReference(example, isFromStudyPlan),
      "**題目訊號**",
      formatList(profile.signals),
      "**狀態、不變式與答案更新**",
      formatList(profile.invariants),
      "**操作流程**",
      formatSteps(profile.derivation),
      "**常見模式**",
      formatList(profile.patterns),
      "**常見錯誤**",
      formatList(profile.pitfalls),
      `**複雜度**：${profile.complexity}`,
    ].join("\n\n"),
    relatedProblems,
    ["**C++ 實作骨架**", profile.code].join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function getPlanTitle(planKey: string) {
  return STUDYPLANS[planKey as keyof typeof STUDYPLANS] ?? planKey;
}

function getPlanNavItems(planKey: string): IndexedTutorialSection[] {
  return flattenTutorialSections(tutorialDataMap[planKey]?.children);
}

export function getLectureSectionStaticParams() {
  return Object.keys(tutorialDataMap).flatMap((category) =>
    getPlanNavItems(category).map((section) => ({
      category,
      section: section.slug,
    })),
  );
}

export function getLectureSectionTutorial(
  planKey: string,
  sectionSlug: string,
): LectureSectionTutorial | undefined {
  const tutorialRoot = tutorialDataMap[planKey];
  if (!tutorialRoot) return undefined;

  const sections = getPlanNavItems(planKey);
  const index = sections.findIndex(
    (item) => item.slug === sectionSlug || String(item.id) === sectionSlug,
  );
  const indexed = sections[index];
  if (!indexed) return undefined;

  const googleSection =
    planKey === "google_interview"
      ? getGoogleInterviewSectionTutorial(indexed.slug)
      : undefined;
  const studySection = findStudyPlanSectionById(
    studyPlanDataMap[planKey]?.children,
    indexed.id,
  );
  const content = googleSection
    ? normalizeGoogleContent(googleSection.content)
    : buildGenericSectionContent(planKey, indexed, studySection);

  return {
    id: indexed.id,
    title: indexed.title,
    slug: indexed.slug,
    planKey,
    planTitle: getPlanTitle(planKey),
    content,
    navItems: sections.map(({ id, title, slug, depth }) => ({
      id,
      title,
      slug,
      depth,
    })),
    previous:
      index > 0
        ? {
            id: sections[index - 1]!.id,
            title: sections[index - 1]!.title,
            slug: sections[index - 1]!.slug,
            depth: sections[index - 1]!.depth,
          }
        : undefined,
    next:
      index >= 0 && index < sections.length - 1
        ? {
            id: sections[index + 1]!.id,
            title: sections[index + 1]!.title,
            slug: sections[index + 1]!.slug,
            depth: sections[index + 1]!.depth,
          }
        : undefined,
  };
}
