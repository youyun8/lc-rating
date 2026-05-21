import { STUDYPLANS } from "@/config/constants";
import { getGoogleInterviewSectionTutorial } from "@/data/googleInterviewSectionTutorials";
import type { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { studyPlanDataMap } from "@/utils/studyPlanIndex";
import { tutorialDataMap } from "@/utils/tutorialIndex";

const EXAMPLE_MIN_RATING = 1700;

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
}

function flattenTutorialSections(
  sections: TutorialData.Section[] | undefined,
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
    };
    return [item, ...flattenTutorialSections(section.children, depth + 1)];
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

function pickExampleProblem(
  section: StudyPlanData.Section | undefined,
): StudyPlanData.Item | undefined {
  const problems = flattenProblems(section);
  if (problems.length === 0) return undefined;

  const high = problems
    .filter(
      (problem) =>
        typeof problem.score === "number" &&
        problem.score >= EXAMPLE_MIN_RATING,
    )
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  if (high.length > 0) return high[0];

  return problems
    .slice()
    .sort(
      (a, b) =>
        (b.score ?? Number.NEGATIVE_INFINITY) -
        (a.score ?? Number.NEGATIVE_INFINITY),
    )[0];
}

function stripNumericPrefix(title: string) {
  return title.replace(/^\d+(?:\.\d+)*\.?\s*/, "").trim();
}

function buildCompleteProblem(
  planKey: string,
  section: TutorialData.Section,
  example: StudyPlanData.Item | undefined,
) {
  const topic = stripNumericPrefix(section.title) || section.title;
  const exampleLine = example
    ? `本頁選用題單例題「${example.title}」${
        typeof example.score === "number"
          ? `（rating ${Math.round(example.score)}）`
          : ""
      }作為參考。`
    : "本頁使用一個抽象化的標準模型題作為參考。";

  const templates: Record<string, string> = {
    binary_search:
      "給定一個具有單調性的搜尋空間，以及一個可以在 `O(check)` 時間內判斷是否合法的條件，請找出第一個合法值或最後一個合法值。",
    bitwise_operations:
      "給定一組整數，請利用每個 bit 的獨立性，計算集合狀態、位元貢獻，或從高位到低位構造最優答案。",
    data_structure:
      "給定一串更新與查詢操作，請設計資料結構，使每次操作後都能快速回答目前狀態下的查詢。",
    dynamic_programming:
      "給定一個可分解成重複子問題的決策過程，請定義狀態、轉移與初始值，求出最優值、可行性或方案數。",
    graph:
      "給定節點與邊所描述的關係，請先判斷圖的方向、權重與連通性，再求可達性、依賴順序、最短路或關鍵結構。",
    greedy:
      "給定一組可排序或可逐步決策的候選項，請找出一個局部選擇規則，並證明此規則不會排除全域最優解。",
    grid: "給定一個二維網格，格子代表狀態、相鄰格代表轉移，請依移動成本與額外狀態求連通性、最短距離或可達區域。",
    math: "給定整數、序列或計數限制，請利用整除、同餘、質因數、組合計數或不變量推導答案。",
    monotonic_stack:
      "給定一個序列，請對每個元素找出左側或右側第一個破壞單調性的元素，或計算它作為區間極值時的貢獻。",
    rating_2100:
      "給定一道需要多個基本技巧組合的中高難度題，請先分解限制，再決定要排序、枚舉、二分、DP 還是用資料結構維護候選。",
    sliding_window:
      "給定一個序列或字串，請在連續區間上維護合法性，求最長、最短或符合條件的區間數量。",
    string:
      "給定字串、pattern 或字典詞集合，請快速回答匹配、前後綴、任意子串比較或多模式查詢。",
    trees:
      "給定鏈結串列、二元樹、一般樹或搜尋狀態樹，請利用遞迴語意、子樹合併或回溯枚舉求答案。",
  };

  return [
    `**完整問題**：${templates[planKey] ?? "給定符合本章主題的輸入資料，請選擇合適模型並求出題目要求的答案。"}`,
    `本章主題是「${topic}」。${exampleLine}`,
    "解題時必須明確寫出輸入如何轉成狀態、每次操作或轉移如何進行、答案在何處更新，以及時間與空間複雜度是否符合限制。",
  ].join("\n\n");
}

function buildExampleAnalysis(
  planKey: string,
  section: TutorialData.Section,
  example: StudyPlanData.Item | undefined,
) {
  const topic = stripNumericPrefix(section.title) || section.title;

  return [
    `**例題解析：${example?.title ?? topic}**`,
    buildCompleteProblem(planKey, section, example),
    "**系統化解法**：\n1. 把題目文字改寫成狀態與轉移，不先急著套模板。\n2. 找出本章 pattern 的核心不變式，例如單調性、連通性、前綴資訊或子樹回傳值。\n3. 用一個小例子手算一輪，確認每次更新都維護不變式。\n4. 寫出 C++ 骨架後，再補上題目特有的邊界條件。",
  ].join("\n\n");
}

function buildCommonPatterns(section: TutorialData.Section) {
  const children = section.children?.map((child) =>
    stripNumericPrefix(child.title),
  );
  if (children && children.length > 0) {
    return [
      "**常見模式**",
      children.map((title) => `- ${title}`).join("\n"),
    ].join("\n\n");
  }

  return [
    "**常見模式**",
    "- 先判斷題目訊號與輸入限制。",
    "- 寫出狀態或資料結構的語意。",
    "- 用不變式檢查每一次轉移或更新。",
    "- 最後再確認複雜度與邊界條件。",
  ].join("\n\n");
}

function buildCppSkeleton(planKey: string) {
  if (planKey === "trees") {
    return [
      "**C++ 實作骨架**",
      "```cpp\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n};\n\nclass Solution {\npublic:\n    int solve(TreeNode* root) {\n        // Define the recursive state and combine child results here.\n        return 0;\n    }\n};\n```",
    ].join("\n\n");
  }

  return [
    "**C++ 實作骨架**",
    "```cpp\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // 1. Define the state or maintained data structure.\n        // 2. Iterate in the order required by the invariant.\n        // 3. Update the answer and handle boundary cases.\n        return 0;\n    }\n};\n```",
  ].join("\n\n");
}

function normalizeGoogleContent(content: string) {
  return content.replace(/\n\n題目：/g, "\n\n**完整問題**：");
}

function buildGenericSectionContent(
  planKey: string,
  section: TutorialData.Section,
  studySection: StudyPlanData.Section | undefined,
) {
  const example = pickExampleProblem(studySection);
  const summary = section.summary
    ? ["**觀念講解**", section.summary].join("\n\n")
    : [
        "**觀念講解**",
        "本章重點是先辨認題目訊號，再選擇對應的狀態、資料結構或遍歷順序。若章節沒有額外摘要，請搭配本頁的完整問題、模式清單與 C++ 骨架閱讀。",
      ].join("\n\n");

  return [
    summary,
    buildExampleAnalysis(planKey, section, example),
    buildCommonPatterns(section),
    buildCppSkeleton(planKey),
  ].join("\n\n---\n\n");
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
    : buildGenericSectionContent(planKey, indexed.section, studySection);

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
