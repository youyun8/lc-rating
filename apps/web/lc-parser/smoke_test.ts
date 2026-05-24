import { strict as assert } from "node:assert";

import { convertHtmlToMarkdown } from "./extract_html2md";

const sampleHtml = `
  <html>
    <body>
      <div class="text-lc-text-primary">Binary Search Notes</div>
      <div class="relative mt-4 flex w-full flex-none flex-col overflow-auto px-4 pb-8 gap-4">
        <h2>Overview</h2>
        <p>Use binary search on monotonic answers.</p>
        <ul>
          <li>First bad version</li>
          <li>Search insert position</li>
        </ul>
      </div>
    </body>
  </html>
`;

const markdown = convertHtmlToMarkdown(sampleHtml);

assert.ok(markdown.startsWith("# Binary Search Notes\n\n"));
assert.ok(markdown.includes("## Overview"));
assert.ok(markdown.includes("Use binary search on monotonic answers."));
assert.match(markdown, /[-*]\s+First bad version/);
assert.match(markdown, /[-*]\s+Search insert position/);

console.log("lc-parser smoke test passed");
