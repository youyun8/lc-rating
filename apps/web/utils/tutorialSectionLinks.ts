import { STUDYPLANS } from "@/config/constants";
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

  const planTitle = STUDYPLANS[planKey as keyof typeof STUDYPLANS] ?? planKey;

  return sections.flatMap((section) => {
    const slug = sectionAnchor(section.title);
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
  return Object.keys(STUDYPLANS)
    .map((planKey) => ({
      planKey,
      planTitle: STUDYPLANS[planKey as keyof typeof STUDYPLANS] ?? planKey,
      links: flattenTutorialSectionLinks(
        planKey,
        tutorialDataMap[planKey]?.children,
      ),
    }))
    .filter((group) => group.links.length > 0);
}
