import { LECTURE_CATEGORIES } from "@/features/lecture/content";
import type { TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";
import { tutorialDataMap } from "@/utils/tutorialIndex";

export interface TutorialSectionLink {
  id: number;
  title: string;
  slug: string;
  href: string;
  planKey: string;
  planTitle: string;
  depth: number;
  pathTitles: string[];
}

function flattenTutorialSectionLinks(
  planKey: string,
  sections: TutorialData.Section[] | undefined,
  pathTitles: string[] = [],
  depth = 0,
): TutorialSectionLink[] {
  if (!sections) return [];

  const planTitle = LECTURE_CATEGORIES[planKey] ?? planKey;

  return sections.flatMap((section) => {
    const slug = sectionAnchor(section.title, section.id);
    const currentPath = [...pathTitles, section.title];
    const link: TutorialSectionLink = {
      id: section.id,
      title: section.title,
      slug,
      href: `/lecture/${planKey}/${slug}`,
      planKey,
      planTitle,
      depth,
      pathTitles: currentPath,
    };

    return [
      link,
      ...flattenTutorialSectionLinks(
        planKey,
        section.children,
        currentPath,
        depth + 1,
      ),
    ];
  });
}

export function getTutorialSectionLinkGroups() {
  return Object.keys(LECTURE_CATEGORIES)
    .map((planKey) => ({
      planKey,
      planTitle: LECTURE_CATEGORIES[planKey] ?? planKey,
      links: flattenTutorialSectionLinks(
        planKey,
        tutorialDataMap[planKey]?.children,
      ),
    }))
    .filter((group) => group.links.length > 0);
}
