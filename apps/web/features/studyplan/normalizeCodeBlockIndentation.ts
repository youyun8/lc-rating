/**
 * Indent step of a code block, measured only where a line ending in `{` opens
 * a block. Continuation lines (arguments aligned under an opening bracket)
 * start at arbitrary columns and must not influence the guess.
 */
function blockIndentSteps(lines: string[]): number[] {
  const steps: number[] = [];
  const indentOf = (line: string) => line.match(/^ */)![0].length;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.trimEnd().endsWith("{")) continue;
    const next = lines.slice(i + 1).find((line) => line.trim() !== "");
    if (next === undefined) continue;
    const step = indentOf(next) - indentOf(lines[i]!);
    if (step > 0) steps.push(step);
  }
  return steps;
}

/** Re-indent fenced code from 2-space (or doubled 8-space) steps to 4-space steps. */
export function normalizeCodeBlockIndentation(code: string): string {
  const lines = code.split("\n");
  if (code.includes("\t")) {
    return lines
      .map((line) => line.replace(/^\s+/, (ws) => ws.replace(/\t/g, "    ")))
      .join("\n");
  }

  const steps = blockIndentSteps(lines);
  if (steps.length === 0 || steps.includes(4)) {
    return code;
  }

  if (steps.every((n) => n === 8)) {
    return lines
      .map((line) =>
        line.replace(/^ +/, (m) => " ".repeat(Math.floor(m.length / 2))),
      )
      .join("\n");
  }

  if (!steps.every((n) => n === 2)) {
    return code;
  }

  return lines
    .map((line) => {
      const match = line.match(/^(\s*)(.*)$/);
      if (!match) {
        return line;
      }

      const [, whitespace, rest] = match;
      if (!whitespace) {
        return rest;
      }

      if (whitespace.includes("\t")) {
        const expanded = whitespace.replace(/\t/g, "    ");
        return `${expanded}${rest}`;
      }

      return `${" ".repeat(whitespace.length * 2)}${rest}`;
    })
    .join("\n");
}

export function normalizeMarkdownCodeBlockIndentation(
  markdown: string,
): string {
  return markdown.replace(
    /```([\w+-]*)\n([\s\S]*?)```/g,
    (_, lang: string, code: string) =>
      `\`\`\`${lang}\n${normalizeCodeBlockIndentation(code)}\`\`\``,
  );
}
