import { ADVENTURE_KEY } from "@/config/constants";
import type { StudyPlanData } from "@/types";

/**
 * 冒險路線: the five self-authored plans folded into one route, easiest first.
 * Problems keep only their first appearance along the route; later sections
 * get a short note pointing back to where the problem was first assigned.
 */
export const ADVENTURE_PLAN_KEY = ADVENTURE_KEY;

export const ADVENTURE_CHAPTERS = [
  { key: "interview_sprint", title: "面試衝刺" },
  { key: "technical_interview", title: "技術面試" },
  { key: "q3_handbook", title: "競賽 Q3 模式" },
  { key: "rating_2100", title: "進階衝刺 1700 → 2100" },
  { key: "q4_handbook", title: "競賽 Q4 模式" },
] as const;

export type AdventureSourceKey = (typeof ADVENTURE_CHAPTERS)[number]["key"];

/** Section ids are namespaced per chapter so the five sources never collide. */
const CHAPTER_ID_STRIDE = 10_000_000;

const NUMERIC_PREFIX_RE = /^\s*\d+(?:\.\d+)*\.?\s*/;

export const ADVENTURE_SUMMARY = [
  "把原本五份自建題單（面試衝刺、技術面試、競賽 Q3／Q4 手冊、1700 → 2100 進階衝刺）整合成一條由淺入深的路線。",
  "",
  "- 每一章保留原題單的教學內容與章節順序。",
  "- 同一題只在**第一次出現**的章節列出；後面章節以「🔁 前面出現過」標出並可點回原處，做過的題目不必重刷。",
  "- 進度依題號記錄，原本在舊題單打勾的題目會直接帶過來。",
  "- 想要玩法？打開「破關模式」，每個小節就是一道關卡。",
].join("\n");

export function stripNumericPrefix(title: string): string {
  return title.replace(NUMERIC_PREFIX_RE, "").trim() || title.trim();
}

function problemKey(problem: StudyPlanData.Item): string {
  const id = problem.id?.toString();
  return id ? `id:${id}` : `slug:${problem.slug.replace(/^\/+|\/+$/g, "")}`;
}

interface FirstSeen {
  sectionTitle: string;
}

export interface AdventureSource {
  key: AdventureSourceKey;
  root: StudyPlanData.Root;
  /** Root-level prose of the source plan, shown as the chapter summary. */
  summary?: string;
}

/**
 * Build the merged route. Works on both the raw problem trees and the trees
 * with 講義 prose folded in, producing identical section ids and titles so
 * progress, anchors and quest stages line up between the two.
 */
export function buildAdventurePlan(
  sources: AdventureSource[],
  numberingSources: AdventureSource[] = sources,
): StudyPlanData.Root {
  const seen = new Map<string, FirstSeen>();
  const chapters: StudyPlanData.Section[] = [];

  for (const [index, chapter] of ADVENTURE_CHAPTERS.entries()) {
    const source = sources.find((s) => s.key === chapter.key);
    if (!source) continue;
    const chapterNumber = index + 1;
    const idOffset = chapterNumber * CHAPTER_ID_STRIDE;

    // Numbers come from the raw problem tree, so prose-only sections that the
    // 講義 merge injects don't shift the numbering (and thus the anchors).
    const numbers = new Map<number, string>();
    const assign = (sections: StudyPlanData.Section[], prefix: string) => {
      sections.forEach((section, i) => {
        const number = `${prefix}.${i + 1}`;
        numbers.set(section.id, number);
        assign(section.children ?? [], number);
      });
    };
    const numberingRoot =
      numberingSources.find((s) => s.key === chapter.key)?.root ?? source.root;
    assign(numberingRoot.children, String(chapterNumber));

    const convert = (section: StudyPlanData.Section): StudyPlanData.Section => {
      const number = numbers.get(section.id);
      const title = number
        ? `${number} ${stripNumericPrefix(section.title)}`
        : section.title;
      const kept: StudyPlanData.Item[] = [];
      const repeats: { problem: StudyPlanData.Item; firstSeen: FirstSeen }[] =
        [];
      const localKeys = new Set<string>();
      for (const problem of section.problems ?? []) {
        const key = problemKey(problem);
        if (localKeys.has(key)) continue;
        localKeys.add(key);
        const firstSeen = seen.get(key);
        if (firstSeen) {
          repeats.push({ problem, firstSeen });
        } else {
          seen.set(key, { sectionTitle: title });
          kept.push(problem);
        }
      }

      const children = (section.children ?? []).map(convert);
      return {
        ...section,
        id: idOffset + section.id,
        title,
        repeats:
          repeats.length > 0
            ? repeats.map(({ problem, firstSeen }) => ({
                id: problem.id,
                title: problem.title,
                firstSeenIn: firstSeen.sectionTitle,
              }))
            : undefined,
        problems: kept.length > 0 ? kept : section.problems ? [] : undefined,
        children: children.length > 0 ? children : undefined,
      };
    };

    chapters.push({
      id: idOffset,
      title: `${chapterNumber}. ${chapter.title}`,
      summary: source.summary || source.root.summary || undefined,
      children: source.root.children.map(convert),
    });
  }

  return {
    id: 0,
    title: "冒險路線：從面試到競賽 Q4",
    src: null,
    last_update: null,
    summary: ADVENTURE_SUMMARY,
    children: chapters,
  };
}

/** Where a retired source plan now lives inside the route. */
export function adventureChapterFor(
  planKey: string,
): { number: number; title: string } | null {
  const index = ADVENTURE_CHAPTERS.findIndex((c) => c.key === planKey);
  if (index === -1) return null;
  return { number: index + 1, title: ADVENTURE_CHAPTERS[index]!.title };
}
