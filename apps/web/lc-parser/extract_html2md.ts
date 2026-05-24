import * as TurndownPluginGfm from "@joplin/turndown-plugin-gfm";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { pathToFileURL } from "node:url";
import TurndownService from "turndown";

const OUTPUT_DIR = process.cwd() + "/dist";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

/**
 * Download file from URL
 */
async function downloadFile(
  url: string,
  localFilename: string,
): Promise<string> {
  const response = await axios.get(url, {
    responseType: "stream",
  });

  const writer = fs.createWriteStream(localFilename);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(localFilename));
    writer.on("error", reject);
  });
}

/**
 * Convert a LeetCode discussion HTML document into markdown content.
 */
export function convertHtmlToMarkdown(htmlContent: string): string {
  const $ = cheerio.load(htmlContent);

  // Extract Title
  const titleClass = ".text-lc-text-primary";
  const titleElement = $(`${titleClass}`);

  let title: string;
  if (titleElement.length > 0) {
    title = titleElement.text().trim();
  } else {
    title = "Untitled";
    console.warn("Warning: Title element not found.");
  }

  // Extract Main Content
  const contentClass =
    "relative mt-4 flex w-full flex-none flex-col overflow-auto px-4 pb-8 gap-4";
  const contentElement = $(`.${contentClass.split(" ").join(".")}`);

  let markdownContent = "";
  if (contentElement.length > 0) {
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    turndownService.use(TurndownPluginGfm.gfm);
    markdownContent = turndownService.turndown(contentElement.html() || "");
  } else {
    console.warn("Warning: Content element not found.");
  }

  return `# ${title}\n\n${markdownContent}`;
}

/**
 * Extract and convert HTML to Markdown
 */
async function extractAndConvert(htmlFile: string): Promise<void> {
  const htmlContent = fs.readFileSync(htmlFile, "utf-8");
  const finalMarkdown = convertHtmlToMarkdown(htmlContent);

  // Save to file
  const outputFilename = htmlFile.replace(".html", ".md");
  fs.writeFileSync(outputFilename, finalMarkdown, "utf-8");
  console.log(`Successfully converted '${htmlFile}' to '${outputFilename}'`);
}

/**
 * Main function
 */
async function main() {
  const lists: [string, string][] = [
    ["sliding_window.html", "https://leetcode.cn/circle/discuss/0viNMK/"],
    ["binary_search.html", "https://leetcode.cn/circle/discuss/SqopEo/"],
    ["monotonic_stack.html", "https://leetcode.cn/circle/discuss/9oZFK9/"],
    ["grid.html", "https://leetcode.cn/circle/discuss/YiXPXW/"],
    ["bitwise_operations.html", "https://leetcode.cn/circle/discuss/dHn9Vk/"],
    ["graph.html", "https://leetcode.cn/circle/discuss/01LUak/"],
    ["dynamic_programming.html", "https://leetcode.cn/circle/discuss/tXLS3i/"],
    ["data_structure.html", "https://leetcode.cn/circle/discuss/mOr1u6/"],
    ["math.html", "https://leetcode.cn/circle/discuss/IYT3ss/"],
    ["greedy.html", "https://leetcode.cn/circle/discuss/g6KTKL/"],
    ["trees.html", "https://leetcode.cn/circle/discuss/K0n2gO/"],
    ["string.html", "https://leetcode.cn/circle/discuss/SJFwQI/"],
  ];

  for (const [name, url] of lists) {
    const filename = OUTPUT_DIR + "/" + name;
    try {
      const localFile = await downloadFile(url, filename);
      await extractAndConvert(localFile);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch(console.error);
}

// extractAndConvert('dynamic_programming.html').catch(console.error);

// export { downloadFile, extractAndConvert, sanitizeFilename };
