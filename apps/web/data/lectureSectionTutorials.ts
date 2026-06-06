import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import type { TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { tutorialDataMap } from "@/utils/tutorialIndex";

interface LectureSectionNavItem {
  id: number;
  title: string;
  slug: string;
  depth: number;
}

interface LectureSectionChildItem extends LectureSectionNavItem {
  summary?: string;
  childCount: number;
  totalSections: number;
}

export interface LectureSectionTutorial {
  id: number;
  title: string;
  slug: string;
  planKey: string;
  planTitle: string;
  pathTitles: string[];
  content: string;
  navItems: LectureSectionNavItem[];
  children: LectureSectionChildItem[];
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

function countTutorialSections(section: TutorialData.Section): number {
  return (
    1 +
    (section.children ?? []).reduce(
      (sum, child) => sum + countTutorialSections(child),
      0,
    )
  );
}

function getPlanTitle(planKey: string) {
  return LECTURE_CATEGORIES[planKey] ?? planKey;
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

  // The lecture body is the section's own authored content. Practice problems
  // are embedded inline in that content as 「搭配練習」 problem tables, so the
  // lecture is fully self-contained and no longer joins the studyplan by id.
  const content = indexed.section.summary?.trim() ?? "";

  return {
    id: indexed.id,
    title: indexed.title,
    slug: indexed.slug,
    planKey,
    planTitle: getPlanTitle(planKey),
    pathTitles: indexed.pathTitles,
    content,
    navItems: sections.map(({ id, title, slug, depth }) => ({
      id,
      title,
      slug,
      depth,
    })),
    children: (indexed.section.children ?? []).map((child) => ({
      id: child.id,
      title: child.title,
      slug: sectionAnchor(child.title),
      depth: indexed.depth + 1,
      summary: child.summary,
      childCount: child.children?.length ?? 0,
      totalSections: countTutorialSections(child),
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
