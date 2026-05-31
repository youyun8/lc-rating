import { type ReactNode } from "react";
import { TutorialData } from "@/types";
import { normalizeDisplayText } from "@/utils/normalizeDisplayText";

export type TutorialSearchMatch = {
  kind: "plan" | "section";
  label: string;
  text: string;
  context?: string;
};

export const MAX_VISIBLE_MATCHES = 4;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatch(text: string, query: string): ReactNode {
  const trimmedQuery = normalizeDisplayText(query.trim());
  if (!trimmedQuery) return text;

  const pattern = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-sm bg-primary/15 px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function getTutorialMatches(
  data: TutorialData.Root,
  title: string,
  query: string,
): TutorialSearchMatch[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const normalizedQuery = normalizeDisplayText(trimmedQuery).toLowerCase();
  const matches: TutorialSearchMatch[] = [];
  const seen = new Set<string>();
  const normalizedTitle = normalizeDisplayText(title);

  const addMatch = (match: TutorialSearchMatch) => {
    const key = `${match.kind}:${match.label}:${match.text}:${match.context ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push(match);
  };

  if (normalizedTitle.toLowerCase().includes(normalizedQuery)) {
    addMatch({ kind: "plan", label: "講義", text: normalizedTitle });
  }

  const visitSection = (
    section: TutorialData.Section,
    parentTitles: string[] = [],
  ) => {
    const normalizedSectionTitle = normalizeDisplayText(section.title);
    if (normalizedSectionTitle.toLowerCase().includes(normalizedQuery)) {
      addMatch({
        kind: "section",
        label: "章節",
        text: normalizedSectionTitle,
        context: parentTitles.length > 0 ? parentTitles.join(" / ") : undefined,
      });
    }

    const currentPath = [...parentTitles, normalizedSectionTitle];
    section.children?.forEach((child) => visitSection(child, currentPath));
  };

  data.children.forEach((section) => visitSection(section));
  return matches;
}
