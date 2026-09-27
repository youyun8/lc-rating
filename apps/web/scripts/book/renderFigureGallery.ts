/**
 * Render every book figure on one HTML page for visual review.
 *
 *   npx tsx scripts/book/renderFigureGallery.ts [out.html] [idRegex]
 *
 * Open the output in a browser (it links fonts from node_modules), or pass
 * an id regex such as `^dp-` to review a single chapter's figures.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ALL_FIGURES } from "./figures";

const WEB_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../..",
);
const out = path.resolve(
  process.argv[2] ?? path.join(WEB_ROOT, "book-dist", "figures.html"),
);
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
const figures = ALL_FIGURES.filter((f) => !filter || filter.test(f.id));

const fonts = [
  "noto-sans-tc/400.css",
  "noto-sans-tc/700.css",
  "jetbrains-mono/400.css",
  "jetbrains-mono/700.css",
]
  .map(
    (f) =>
      `<link rel="stylesheet" href="${pathToFileURL(path.join(WEB_ROOT, "node_modules/@fontsource", f)).href}">`,
  )
  .join("");

const cards = figures
  .map(
    (f) =>
      `<section style="border:1px solid #cbd2d9;margin:8px;padding:8px"><b>${f.id}</b>（${f.category} / ${f.section || "本章導讀"}）${f.caption}<br>${f.render()}</section>`,
  )
  .join("\n");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8">${fonts}<body style="width:700px;font-family:'Noto Sans TC'">${cards}</body>`,
);
console.log(`wrote ${figures.length} figures to ${out}`);
