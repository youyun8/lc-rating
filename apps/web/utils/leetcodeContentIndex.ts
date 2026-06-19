import { HANDBOOK_TOPICS } from "@/features/handbook/content";
import {
  LECTURE_CATEGORIES,
  lectureContentMap,
} from "@/features/lecture/content";
import type { TutorialData } from "@/types";
import { sectionAnchor } from "@/utils/sectionAnchor";

/**
 * A single place in the handbook or lectures that references a LeetCode
 * problem, surfaced by the "search by LeetCode ID" boxes on the overview pages.
 */
export interface LeetCodeHit {
  /** The LeetCode problem id. */
  id: number;
  /** Problem title captured from the source (table link text or example title). */
  problemTitle?: string;
  /** Top-level grouping: handbook topic title, or lecture category title. */
  groupTitle: string;
  /** The section that contains the reference. */
  sectionTitle: string;
  /** Link straight to the section (with anchor for the handbook). */
  href: string;
}

interface RawRef {
  id: number;
  title?: string;
}

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const EXAMPLE_RE = /:::example[ \t]+([^\n]+)/g;
// "LC 435", "LC-435", "LeetCode 275", "LeetCode：275", "LC #1011"
const LC_IN_TEXT_RE = /(?:LC|LeetCode)\s*[#:：-]?\s*(\d{1,5})/gi;
const LC_MENTION_STRIP_RE =
  /[（(]?\s*(?:LC|LeetCode)\s*[#:：-]?\s*\d{1,5}\s*[)）]?/gi;

/**
 * Extract every LeetCode reference from one markdown string. Two structured
 * signals are recognised (kept deliberately precise to avoid false positives):
 *
 *  1. Problem-table rows whose first cell is a numeric id and which link to a
 *     `/problems/...` page. This covers both the English `| ID | Problem | … |`
 *     handbook/lecture tables and the Chinese `| 題號 | 題目 | … |` lecture
 *     tables uniformly, without needing to detect the header language.
 *  2. `:::example <title>` headings that mention `LC <n>` / `LeetCode <n>`.
 */
function extractRefs(markdown: string): RawRef[] {
  const refs: RawRef[] = [];

  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|") || !line.includes("/problems/")) continue;

    const cells = line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
    const first = cells[0] ?? "";
    // The id cell may hold several ids ("55 / 45"); each maps to one link.
    const idTokens = first
      .split("/")
      .map((t) => t.replace(/[#\s]/g, ""))
      .filter(Boolean);
    if (idTokens.length === 0 || !idTokens.every((t) => /^\d{1,5}$/.test(t))) {
      continue;
    }

    const links = [...line.matchAll(LINK_RE)];
    idTokens.forEach((tok, j) => {
      const link = links[j] ?? links[0];
      refs.push({ id: Number(tok), title: link?.[1]?.trim() });
    });
  }

  for (const m of markdown.matchAll(EXAMPLE_RE)) {
    const title = m[1]!.trim();
    const ids = [...title.matchAll(LC_IN_TEXT_RE)];
    if (ids.length === 0) continue;
    const cleaned = title.replace(LC_MENTION_STRIP_RE, "").trim();
    for (const lm of ids) {
      refs.push({ id: Number(lm[1]), title: cleaned || undefined });
    }
  }

  return refs;
}

/** Append a hit, deduping by destination href and backfilling a title. */
function pushHit(
  map: Map<number, LeetCodeHit[]>,
  ref: RawRef,
  hit: LeetCodeHit,
) {
  const list = map.get(ref.id);
  if (!list) {
    map.set(ref.id, [hit]);
    return;
  }
  const existing = list.find((h) => h.href === hit.href);
  if (existing) {
    if (!existing.problemTitle && hit.problemTitle) {
      existing.problemTitle = hit.problemTitle;
    }
    return;
  }
  list.push(hit);
}

let handbookIndex: Map<number, LeetCodeHit[]> | null = null;
let lectureIndex: Map<number, LeetCodeHit[]> | null = null;

function buildHandbookIndex(): Map<number, LeetCodeHit[]> {
  const map = new Map<number, LeetCodeHit[]>();
  for (const topic of HANDBOOK_TOPICS) {
    for (const section of topic.sections) {
      for (const ref of extractRefs(section.body)) {
        pushHit(map, ref, {
          id: ref.id,
          problemTitle: ref.title,
          groupTitle: topic.title,
          sectionTitle: section.title,
          href: `/handbook/${topic.slug}#${section.id}`,
        });
      }
    }
  }
  return map;
}

function indexLectureSummary(
  map: Map<number, LeetCodeHit[]>,
  summary: string | undefined,
  groupTitle: string,
  sectionTitle: string,
  href: string,
) {
  if (!summary) return;
  for (const ref of extractRefs(summary)) {
    pushHit(map, ref, {
      id: ref.id,
      problemTitle: ref.title,
      groupTitle,
      sectionTitle,
      href,
    });
  }
}

function walkLectureSections(
  map: Map<number, LeetCodeHit[]>,
  sections: TutorialData.Section[] | undefined,
  category: string,
  groupTitle: string,
) {
  for (const section of sections ?? []) {
    indexLectureSummary(
      map,
      section.summary,
      groupTitle,
      section.title,
      `/lecture/${category}/${sectionAnchor(section.title, section.id)}`,
    );
    walkLectureSections(map, section.children, category, groupTitle);
  }
}

function buildLectureIndex(): Map<number, LeetCodeHit[]> {
  const map = new Map<number, LeetCodeHit[]>();
  for (const [category, root] of Object.entries(lectureContentMap)) {
    const groupTitle = LECTURE_CATEGORIES[category] ?? category;
    // The root summary renders on the category overview page (no section slug).
    indexLectureSummary(
      map,
      root.summary,
      groupTitle,
      "總覽",
      `/lecture/${category}`,
    );
    walkLectureSections(map, root.children, category, groupTitle);
  }
  return map;
}

/** Parse a search query into a LeetCode id, or null if it isn't an id query. */
export function parseLeetCodeId(query: string): number | null {
  const match = query.trim().match(/^#?(\d{1,5})$/);
  return match ? Number(match[1]) : null;
}

export function searchHandbookByLeetCodeId(id: number): LeetCodeHit[] {
  handbookIndex ??= buildHandbookIndex();
  return handbookIndex.get(id) ?? [];
}

export function searchLectureByLeetCodeId(id: number): LeetCodeHit[] {
  lectureIndex ??= buildLectureIndex();
  return lectureIndex.get(id) ?? [];
}
