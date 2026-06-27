function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function isCodeFence(line: string) {
  return line.trim().startsWith("```");
}

function isExampleOpen(line: string) {
  return line.trim().match(/^:{2,}example\b(.*)$/);
}

function isDirectiveClose(line: string) {
  return /^:{2,}\s*$/.test(line.trim());
}

/**
 * Convert custom `:::example title` containers into native `<details>` blocks.
 *
 * `HandbookSectionBody` renders these as React cards on lecture/handbook pages.
 * This fallback exists for plain markdown surfaces, especially study-plan
 * summaries, so authoring directives never leak as visible `:::example` text.
 */
export function normalizeExampleContainers(markdown: string) {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (isCodeFence(line)) {
      inCodeFence = !inCodeFence;
      output.push(line);
      continue;
    }

    const match = !inCodeFence ? isExampleOpen(line) : null;
    if (!match) {
      output.push(line);
      continue;
    }

    const title = match[1]!.trim() || "範例";
    const inner: string[] = [];
    let j = i + 1;
    let innerCodeFence = false;

    while (j < lines.length) {
      const current = lines[j]!;

      if (isCodeFence(current)) {
        innerCodeFence = !innerCodeFence;
      }

      if (!innerCodeFence && isDirectiveClose(current)) {
        break;
      }

      inner.push(current);
      j++;
    }

    output.push(
      "<details>",
      `<summary>${escapeHtml(title)}</summary>`,
      "",
      ...inner,
      "",
      "</details>",
    );
    i = j;
  }

  return output.join("\n");
}

export function stripExampleContainerMarkers(markdown: string) {
  return markdown
    .replace(/^\s*:{2,}example\b\s*/gm, "")
    .replace(/^\s*:{2,}\s*$/gm, "");
}
