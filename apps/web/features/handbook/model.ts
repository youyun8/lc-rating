/**
 * Data model for the standalone Algorithm Handbook (/handbook).
 *
 * The handbook is intentionally self-contained: it does NOT reuse the
 * STUDYPLANS config, the tutorial JSON files, or the lecture data loaders.
 * Each topic is authored as plain markdown grouped into sections so the
 * content is trivial to edit and extend.
 */

/** A single section within a topic lecture; rendered with an anchor for the TOC. */
export interface HandbookSection {
  /** Stable, ASCII anchor id used by the in-page table of contents. */
  id: string;
  /** Section heading shown in the page and the TOC. */
  title: string;
  /** Markdown body. C++ code blocks should start with a `// label` comment. */
  body: string;
}

/** Coarse grouping used only to organize the overview page. */
export type HandbookGroup =
  | "Foundations"
  | "System Design"
  | "Data Structures"
  | "Graphs & Grids"
  | "Dynamic Programming"
  | "Strings & Math";

/** A full topic lecture. */
export interface HandbookTopic {
  /** URL segment, e.g. "binary-search". */
  slug: string;
  /** Display title, e.g. "Binary Search". */
  title: string;
  /** One-line description shown on cards and the topic hero. */
  tagline: string;
  /** lucide-react icon name resolved in the overview UI. */
  icon: string;
  /** Overview grouping. */
  group: HandbookGroup;
  /** Ordered lecture sections. */
  sections: HandbookSection[];
}

/** A lightweight reference to a neighbouring topic for prev/next navigation. */
export interface HandbookTopicRef {
  slug: string;
  title: string;
}
