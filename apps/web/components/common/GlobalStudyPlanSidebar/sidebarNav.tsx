import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { StudyPlanData, TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";

export type PageType = "lecture" | "studyplan";
export type AnySection = StudyPlanData.Section | TutorialData.Section;

export function getSectionHref(
  section: AnySection,
  pageType: PageType,
  currentPlanKey: string | null,
) {
  if (pageType === "lecture" && currentPlanKey) {
    return `/lecture/${currentPlanKey}/${sectionAnchor(section.title)}`;
  }

  return `#${sectionAnchor(section.title)}`;
}

interface ChapterLinkProps {
  href: string;
  isLectureLink: boolean;
  className?: string;
  children: ReactNode;
}

/** Lecture pages cross route boundaries (Next Link); studyplan uses in-page anchors. */
export function ChapterLink({
  href,
  isLectureLink,
  className,
  children,
}: ChapterLinkProps) {
  if (isLectureLink) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

interface SubTopicItemProps {
  section: AnySection;
  pageType: PageType;
  currentPlanKey: string | null;
  currentSlug: string | null;
}

export function SubTopicItem({
  section,
  pageType,
  currentPlanKey,
  currentSlug,
}: SubTopicItemProps) {
  const children = section.children ?? [];
  const hasChildren = children.length > 0;
  const href = getSectionHref(section, pageType, currentPlanKey);
  const isLectureLink = pageType === "lecture" && Boolean(currentPlanKey);
  const isActive =
    isLectureLink && currentSlug === sectionAnchor(section.title);

  return (
    <>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isActive}>
          <ChapterLink
            href={href}
            isLectureLink={isLectureLink}
            className={cn("truncate", isActive && "font-semibold")}
          >
            {section.title}
          </ChapterLink>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
      {hasChildren && (
        <SidebarMenuSub>
          {children.map((child) => (
            <SubTopicItem
              key={child.id}
              section={child}
              pageType={pageType}
              currentPlanKey={currentPlanKey}
              currentSlug={currentSlug}
            />
          ))}
        </SidebarMenuSub>
      )}
    </>
  );
}
