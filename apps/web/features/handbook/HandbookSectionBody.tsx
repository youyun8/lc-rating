"use client";

import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import { ProblemList } from "@/features/studyplan/ProblemList";
import type { StudyPlanData } from "@/types";
import { useMemo } from "react";
import { HandbookExample } from "./HandbookExample";

type Segment =
  | { kind: "markdown"; content: string }
  | {
      kind: "problems";
      title?: string;
      problems: StudyPlanData.Item[];
      preserveOrder?: boolean;
    }
  | { kind: "example"; title: string; content: string };

interface HandbookSectionBodyProps {
  body: string;
  /** Prefix on collapsible example cards ("例題" for handbook, "範例" for lectures). */
  exampleLabel?: string;
  /** ProblemList UI language for inline problem tables. */
  language?: "en" | "zh";
  /** Label source for inline LeetCode problem tables. */
  problemLabelSource?: "subsection" | "problemset";
}

/**
 * Renders a handbook/lecture section: prose is handed to
 * {@link StudyPlanMarkdownContent}, `:::example` blocks become collapsible
 * {@link HandbookExample} cards, and LeetCode problem tables such as
 * `| ID | Problem | (Rating) | Technique |` or `| LC ID | Title | ... |`
 * become interactive {@link ProblemList} widgets so readers can track progress
 * and store solutions. Shared by the handbook and the 講義 lectures.
 */
export function HandbookSectionBody({
  body,
  exampleLabel = "例題",
  language = "en",
  problemLabelSource = "subsection",
}: HandbookSectionBodyProps) {
  const segments = useMemo(() => splitSectionBody(body), [body]);
  return (
    <>
      {renderSegments(
        segments,
        false,
        exampleLabel,
        language,
        problemLabelSource,
      )}
    </>
  );
}

/**
 * Render parsed segments to JSX. `codeInitiallyOpen` is threaded down so code
 * blocks inside an example card start expanded (the card itself is the
 * collapsible), avoiding a redundant second toggle.
 */
function renderSegments(
  segments: Segment[],
  codeInitiallyOpen: boolean,
  exampleLabel: string,
  language: "en" | "zh",
  problemLabelSource: "subsection" | "problemset",
) {
  return segments.map((segment, idx) => {
    if (segment.kind === "problems") {
      return (
        <div key={idx} className="my-4">
          <ProblemList
            problems={segment.problems}
            title={segment.title}
            language={language}
            labelSource={problemLabelSource}
            preserveOrder={segment.preserveOrder}
          />
        </div>
      );
    }

    if (segment.kind === "example") {
      return (
        <HandbookExample key={idx} title={segment.title} label={exampleLabel}>
          {renderSegments(
            splitSectionBody(segment.content),
            true,
            exampleLabel,
            language,
            problemLabelSource,
          )}
        </HandbookExample>
      );
    }

    return (
      <StudyPlanMarkdownContent
        key={idx}
        content={segment.content}
        variant="lecture"
        enhanceLeetCode
        codeInitiallyOpen={codeInitiallyOpen}
      />
    );
  });
}

function isTableRow(line: string) {
  return line.trim().startsWith("|");
}

function isSeparatorRow(line: string) {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

function parseCells(line: string) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function findHeaderIndex(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

function slugFromUrl(url: string) {
  const match = url.match(/\/problems\/([^/?#]+)/);
  return (match?.[1] ?? url).replace(/\/+$/, "");
}

function parseProblemId(token: string): string | number | undefined {
  const trimmed = token.trim();
  if (!trimmed) return undefined;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
}

/**
 * Split a technique cell into individual labels. Both ` / ` and ` + ` act as
 * separators (e.g. "BS on answer + greedy check" → "BS on answer", "greedy
 * check"), then re-join with ` / ` so {@link ProblemList} renders one chip each.
 */
function techToSubsection(tech: string): string | undefined {
  const labels = tech
    .split(/\s+\+\s+|\s*\/\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
  return labels.length > 0 ? labels.join(" / ") : undefined;
}

/** Build study-plan items from one `| ID | Problem | … |` table. */
function parseProblemRows(
  tableLines: string[],
  cols: { id: number; problem: number; rating: number; tech: number },
): StudyPlanData.Item[] {
  const items: StudyPlanData.Item[] = [];

  // Skip the header (0) and separator (1) rows.
  for (let i = 2; i < tableLines.length; i++) {
    const cells = parseCells(tableLines[i]!);
    if (cells.length === 0) continue;

    const idTokens = (cells[cols.id] ?? "").split("/").map((t) => t.trim());
    const problemCell = cells[cols.problem] ?? "";
    const tech = cols.tech !== -1 ? (cells[cols.tech] ?? "").trim() : "";
    const ratingText =
      cols.rating !== -1 ? (cells[cols.rating] ?? "").trim() : "";
    const ratingNum = Number.parseInt(ratingText, 10);
    const score = Number.isNaN(ratingNum) ? null : ratingNum;

    const links = [...problemCell.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];

    if (links.length === 0) {
      // Plain-text problem (no link) — keep the id so progress still works.
      items.push({
        id: parseProblemId(idTokens[0] ?? ""),
        title: problemCell.replace(/[*`]/g, "").trim(),
        slug: "",
        src: "",
        solution: null,
        score,
        isPremium: false,
        subsection: techToSubsection(tech),
      });
      continue;
    }

    links.forEach((link, j) => {
      const idToken = idTokens[j] ?? idTokens[0] ?? "";
      items.push({
        id: parseProblemId(idToken),
        title: link[1]!.trim(),
        slug: slugFromUrl(link[2]!.trim()),
        src: "",
        solution: null,
        score,
        isPremium: false,
        subsection: techToSubsection(tech),
      });
    });
  }

  return items;
}

function splitSectionBody(body: string): Segment[] {
  const lines = body.split("\n");
  const segments: Segment[] = [];
  let buffer: string[] = [];

  const flushMarkdown = () => {
    const content = buffer.join("\n").trim();
    if (content) segments.push({ kind: "markdown", content });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const next = lines[i + 1];

    // A `:::example <title>` … `:::` block becomes a collapsible 例題 card. The
    // inner body (prose + code, occasionally a table) is re-split when rendered.
    const exampleMatch = line.trim().match(/^:::example\b(.*)$/);
    if (exampleMatch) {
      flushMarkdown();
      const title = exampleMatch[1]!.trim();
      const inner: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j]!.trim() !== ":::") {
        inner.push(lines[j]!);
        j++;
      }
      segments.push({
        kind: "example",
        title,
        content: inner.join("\n").trim(),
      });
      i = j; // skip past the closing ":::"
      continue;
    }

    // A markdown table starts with a header row followed by a separator row.
    if (isTableRow(line) && next !== undefined && isSeparatorRow(next)) {
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && isTableRow(lines[j]!)) {
        tableLines.push(lines[j]!);
        j++;
      }

      const headers = parseCells(tableLines[0]!).map(normalizeHeader);
      const idCol = findHeaderIndex(headers, ["id", "lc id"]);
      const problemCol = findHeaderIndex(headers, ["problem", "title"]);

      if (idCol !== -1 && problemCol !== -1) {
        const ratingCol = findHeaderIndex(headers, ["rating"]);
        const explicitTechCol = findHeaderIndex(headers, [
          "technique",
          "sub-section in lecture",
          "subsection",
        ]);
        const techCol =
          explicitTechCol !== -1
            ? explicitTechCol
            : headers.findIndex(
                (_, idx) =>
                  idx !== idCol && idx !== problemCol && idx !== ratingCol,
              );

        const ignoredMetadataCols = new Set(
          ["#", "i", "f", "l", "score", "why it matters"]
            .map((header) => headers.indexOf(header))
            .filter((idx) => idx !== -1),
        );
        const fallbackTechCol =
          explicitTechCol === -1 && ignoredMetadataCols.has(techCol)
            ? -1
            : techCol;

        // Use a bold caption directly above the table as the list title.
        let title: string | undefined;
        while (buffer.length > 0 && buffer[buffer.length - 1]!.trim() === "") {
          buffer.pop();
        }
        const lastLine = buffer[buffer.length - 1]?.trim();
        const captionMatch = lastLine?.match(/^\*\*(.+?)\*\*$/);
        if (captionMatch) {
          title = captionMatch[1]!.trim();
          buffer.pop();
        }

        flushMarkdown();

        const problems = parseProblemRows(tableLines, {
          id: idCol,
          problem: problemCol,
          rating: ratingCol,
          tech: fallbackTechCol,
        });
        segments.push({
          kind: "problems",
          title,
          problems,
          preserveOrder: headers.includes("#") && headers.includes("score"),
        });

        i = j - 1;
        continue;
      }

      // Not a problem table (e.g. complexity table) — keep it as markdown.
      buffer.push(...tableLines);
      i = j - 1;
      continue;
    }

    buffer.push(line);
  }

  flushMarkdown();
  return segments;
}
