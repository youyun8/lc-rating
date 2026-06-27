/** Re-indent fenced code from 2-space steps to 4-space steps when needed. */
export function normalizeCodeBlockIndentation(code: string): string {
  const lines = code.split("\n");
  const indents = lines
    .map((line) => line.match(/^(\s+)\S/)?.[1]?.length ?? 0)
    .filter((n) => n > 0);

  if (indents.length === 0) {
    return code;
  }

  const alreadyFourSpace =
    indents.every((n) => n % 4 === 0) && Math.min(...indents) >= 4;
  if (alreadyFourSpace) {
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

export function normalizeMarkdownCodeBlockIndentation(markdown: string): string {
  return markdown.replace(
    /```([\w+-]*)\n([\s\S]*?)```/g,
    (_, lang: string, code: string) =>
      `\`\`\`${lang}\n${normalizeCodeBlockIndentation(code)}\`\`\``,
  );
}
