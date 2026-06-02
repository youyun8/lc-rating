"use client";

import { StudyPlanMarkdownContent } from "@/features/studyplan/MarkdownContent";
import { ProblemList } from "@/features/studyplan/ProblemList";
import type { StudyPlanData } from "@/types";
import { Fragment, useMemo } from "react";

type Segment =
  | { kind: "markdown"; content: string }
  | { kind: "problems"; title?: string; problems: StudyPlanData.Item[] };

interface HandbookSectionBodyProps {
  body: string;
}

/**
 * Renders a handbook section: prose is handed to {@link StudyPlanMarkdownContent},
 * while `| ID | Problem | (Rating) | Technique |` tables become interactive
 * {@link ProblemList} widgets so readers can track their progress (completed,
 * in progress, …) and store solutions — the same experience as the 講義 lectures.
 */
export function HandbookSectionBody({ body }: HandbookSectionBodyProps) {
  const segments = useMemo(() => splitSectionBody(body), [body]);

  return (
    <>
      {segments.map((segment, idx) =>
        segment.kind === "problems" ? (
          <div key={idx} className="my-4">
            <ProblemList problems={segment.problems} title={segment.title} />
          </div>
        ) : (
          <StudyPlanMarkdownContent
            key={idx}
            content={segment.content}
            variant="lecture"
            enhanceLeetCode
          />
        ),
      )}
    </>
  );
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

function slugFromUrl(url: string) {
  const match = url.match(/\/problems\/([^/?#]+)/);
  return (match?.[1] ?? url).replace(/\/+$/, "");
}

function parseProblemId(token: string): string | number | undefined {
  const trimmed = token.trim();
  if (!trimmed) return undefined;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
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
        subsection: tech || undefined,
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
        subsection: tech || undefined,
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

    // A markdown table starts with a header row followed by a separator row.
    if (isTableRow(line) && next !== undefined && isSeparatorRow(next)) {
      const tableLines: string[] = [];
      let j = i;
      while (j < lines.length && isTableRow(lines[j]!)) {
        tableLines.push(lines[j]!);
        j++;
      }

      const headers = parseCells(tableLines[0]!).map((h) => h.toLowerCase());
      const idCol = headers.findIndex((h) => h === "id");
      const problemCol = headers.findIndex((h) => h === "problem");

      if (idCol !== -1 && problemCol !== -1) {
        const ratingCol = headers.findIndex((h) => h === "rating");
        const techCol = headers.findIndex(
          (_, idx) => idx !== idCol && idx !== problemCol && idx !== ratingCol,
        );

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
          tech: techCol,
        });
        segments.push({ kind: "problems", title, problems });

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
