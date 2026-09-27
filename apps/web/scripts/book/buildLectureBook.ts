/**
 * Build the 講義 as a print-ready book PDF.
 *
 *   npx tsx scripts/book/buildLectureBook.ts [options]
 *
 * Options:
 *   --out <file>          Output PDF (default: book-dist/lc-lecture-book.pdf)
 *   --chapters a,b        Only these lecture categories (for quick previews)
 *   --volumes             Also write one PDF per part (篇) next to --out
 *   --html                Keep the intermediate HTML in book-dist/
 *   --chrome <path>       Chromium executable (default: $CHROME_PATH or the
 *                         Playwright-managed Chromium)
 *
 * Pipeline:
 *   1. Walk `lectureContentMap` in the part / chapter order of `config.ts`,
 *      render every section with the site's markdown stack (`markdown.ts`) and
 *      insert the figures registered in `figures/`.
 *   2. Print the main matter with Chromium (paged media: named pages give
 *      per-chapter running heads, margin boxes give folios). Pass 1 reads the
 *      page of every heading back from the PDF outline; pass 2 inserts blank
 *      versos so every part and chapter opens on a recto.
 *   3. Print the front matter (cover, title, copyright, preface, contents,
 *      list of figures) with the page numbers from pass 2.
 *   4. Merge with pdf-lib, rebuild the bookmark tree, turn contents entries
 *      into internal links and set roman / arabic page labels.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFRef,
  PDFString,
  type PDFObject,
} from "pdf-lib";
import { chromium, type Browser } from "playwright-core";
import {
  LECTURE_CATEGORIES,
  lectureContentMap,
} from "../../features/lecture/content";
import type { TutorialData } from "../../types";
import { BOOK, PAGE, PARTS, type BookPart } from "./config";
import { coverSvg } from "./cover";
import { ALL_FIGURES, chapterMap, skeletonFigure } from "./figures";
import type { BookFigure } from "./figures/types";
import { insertAfterAnchor, renderMarkdown } from "./markdown";

const WEB_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../..",
);
const NODE_MODULES = path.join(WEB_ROOT, "node_modules");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Options {
  out: string;
  chapters: string[] | null;
  volumes: boolean;
  keepHtml: boolean;
  chrome: string | undefined;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    out: path.join(WEB_ROOT, "book-dist", "lc-lecture-book.pdf"),
    chapters: null,
    volumes: false,
    keepHtml: false,
    // eslint-disable-next-line turbo/no-undeclared-env-vars -- local build tool, not a turbo task input
    chrome: process.env.CHROME_PATH,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = path.resolve(argv[++i] ?? opts.out);
    else if (a === "--chapters")
      opts.chapters = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (a === "--volumes") opts.volumes = true;
    else if (a === "--html") opts.keepHtml = true;
    else if (a === "--chrome") opts.chrome = argv[++i];
    else throw new Error(`Unknown option ${a}`);
  }
  return opts;
}

function findChrome(explicit: string | undefined): string | undefined {
  if (explicit) return explicit;
  // eslint-disable-next-line turbo/no-undeclared-env-vars -- local build tool, not a turbo task input
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!fs.existsSync(root)) return undefined;
  const dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d));
  for (const d of dirs.sort().reverse()) {
    const exe = path.join(root, d, "chrome-linux", "chrome");
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Book model
// ---------------------------------------------------------------------------

interface HeadingRef {
  id: string;
  level: 0 | 1 | 2 | 3 | 4; // part, chapter, section, subsection, deep
  num: string;
  title: string;
  /** Physical page index in the main-matter PDF (0-based), filled after printing. */
  page?: number;
}

interface FigureRef {
  id: string;
  num: string;
  caption: string;
  headingId: string;
}

interface Chapter {
  key: string;
  num: number;
  title: string;
  longTitle: string;
  root: TutorialData.Root;
  part: BookPart;
}

function stripNumber(title: string) {
  return title.replace(/^\s*\d+(?:\.\d+)*\.?\s*/, "").trim();
}

function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cssString(text: string) {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const OPTIONAL_RE = /選做|常見面試模式|其他|雜項/;

class BookBuilder {
  headings: HeadingRef[] = [];
  figures: FigureRef[] = [];
  figureUse = new Map<string, number>();
  /** LeetCode id -> title and the headings whose practice tables list it. */
  problems = new Map<string, { title: string; headings: string[] }>();
  private idSeq = 0;

  constructor(
    private chapters: Chapter[],
    private parts: BookPart[],
  ) {}

  private nextId(prefix: string) {
    return `${prefix}-${++this.idSeq}`;
  }

  private figureHtml(
    chapter: Chapter,
    fig: { id: string; caption: string; svg: string },
    headingId: string,
  ) {
    const count =
      this.figures.filter((f) => f.num.startsWith(`${chapter.num}-`)).length +
      1;
    const num = `${chapter.num}-${count}`;
    this.figures.push({ id: fig.id, num, caption: fig.caption, headingId });
    // Scale figures to ~0.78 CSS px per SVG unit; max-width keeps wide ones in the text block.
    const svgScaled = fig.svg.replace(
      / width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/,
      (_m, w: string, h: string) => {
        const s = 0.84;
        return ` width="${(Number(w) * s).toFixed(0)}" height="${(Number(h) * s).toFixed(0)}"`;
      },
    );
    return `<figure class="fig" id="fig-${esc(fig.id)}">${svgScaled}<figcaption><b>圖 ${num}</b>${esc(fig.caption)}</figcaption></figure>`;
  }

  private figuresFor(category: string, section: string): BookFigure[] {
    return ALL_FIGURES.filter(
      (f) => f.category === category && f.section === section,
    );
  }

  private collectProblems(md: string, headingId: string) {
    for (const line of md.split("\n")) {
      const m = line.match(
        /^\|\s*(\d{1,4}[A-Z]?)\s*\|\s*\[([^\]]+)\]\((?:https?:\/\/)?leetcode/,
      );
      if (!m) continue;
      const id = m[1]!;
      const entry = this.problems.get(id) ?? { title: m[2]!, headings: [] };
      if (!entry.headings.includes(headingId)) entry.headings.push(headingId);
      this.problems.set(id, entry);
    }
  }

  private sectionBody(
    chapter: Chapter,
    section: string,
    md: string,
    headingId: string,
  ) {
    this.collectProblems(md, headingId);
    let body = md;
    for (const fig of this.figuresFor(chapter.key, section)) {
      this.figureUse.set(fig.id, (this.figureUse.get(fig.id) ?? 0) + 1);
      const html = this.figureHtml(
        chapter,
        { id: fig.id, caption: fig.caption, svg: fig.render() },
        headingId,
      );
      // Chapter root summaries replace their authored "> 圖：" placeholder.
      if (section === "" && /^> 圖：.*$/m.test(body)) {
        body = body.replace(/^> 圖：.*$/m, `\n${html}\n`);
      } else {
        body = insertAfterAnchor(body, fig.anchor ?? "核心想法與直覺", html);
      }
    }
    return renderMarkdown(body).html;
  }

  private renderSections(
    chapter: Chapter,
    sections: TutorialData.Section[] | undefined,
    prefix: string,
    depth: number,
  ): string {
    if (!sections?.length) return "";
    let out = "";
    sections.forEach((s, i) => {
      const num = `${prefix}.${i + 1}`;
      const id = this.nextId("s");
      const level = Math.min(4, depth + 2) as 2 | 3 | 4;
      const title = stripNumber(s.title);
      this.headings.push({ id, level, num, title });
      const tag = depth === 0 ? "h3" : depth === 1 ? "h4" : "h5";
      const cls = depth === 0 ? "sec" : depth === 1 ? "sec" : "sec deep";
      const hClass = depth === 0 ? "sec top" : cls;
      out += `<section class="section d${depth}">`;
      out += `<${tag} id="${id}" class="${hClass}"><span class="secnum">${num}</span>${esc(title)}</${tag}>`;
      const md = s.summary?.trim() ?? "";
      if (md)
        out += `<div class="body">${this.sectionBody(chapter, s.title, md, id)}</div>`;
      out += this.renderSections(chapter, s.children, num, depth + 1);
      out += `</section>`;
    });
    return out;
  }

  private chapterHtml(ch: Chapter): string {
    const id = this.nextId("c");
    this.headings.push({
      id,
      level: 1,
      num: `第 ${ch.num} 章`,
      title: ch.title,
    });
    const items = (ch.root.children ?? []).map((s, i) => ({
      num: String(i + 1),
      title: stripNumber(s.title),
      childCount: s.children?.length ?? 0,
      optional: OPTIONAL_RE.test(s.title),
    }));
    const mapFig = this.figureHtml(
      ch,
      {
        id: `${ch.key}-map`,
        caption: `${ch.title}：本章地圖（灰色為選讀或綜合整理小節）`,
        svg: chapterMap(items),
      },
      id,
    );
    let out = `<section class="chapter" style="page: ch${ch.num}">`;
    out += `<div class="chapter-opener" style="page: opener">`;
    out += `<div class="chapter-num">CHAPTER<b>${ch.num}</b></div>`;
    out += `<h2 id="${id}">${esc(ch.title)}</h2>`;
    out += `<div class="chapter-src">${esc(ch.longTitle)}</div>`;
    out += `<div class="chapter-map">${mapFig}</div>`;
    out += `</div>`;
    const intro = ch.root.summary?.trim();
    if (intro) {
      out += `<div class="chapter-intro"><div class="intro-label">本章導讀</div>${this.sectionBody(ch, "", intro, id)}</div>`;
    }
    out += this.renderSections(ch, ch.root.children, String(ch.num), 0);
    out += `</section>`;
    return out;
  }

  private partHtml(part: BookPart, idx: number, chapters: Chapter[]): string {
    const id = this.nextId("p");
    const [label = "", name = part.title] = part.title.split("\u3000");
    this.headings.push({ id, level: 0, num: label, title: name });
    let out = `<div class="part-page" style="page: partpage">`;
    out += `<div class="pnum">PART ${idx + 1}\u3000${esc(label)}</div>`;
    out += `<h1 id="${id}">${esc(name)}</h1>`;
    out += `<div class="psub">${esc(part.subtitle)}</div>`;
    out += `<div class="pchapters">${chapters.map((c) => `第 ${c.num} 章\u3000${esc(c.title)}`).join("<br>")}</div>`;
    out += `</div>`;
    return out;
  }

  /**
   * Back-matter problem index. `pageOf` maps heading ids to printed page
   * numbers; in pass 1 it is empty and placeholders of the same width keep
   * the index the same length.
   */
  private indexHtml(pageOf: Map<string, number>): string {
    const id = this.nextId("x");
    this.headings.push({ id, level: 1, num: "附錄", title: "題號索引" });
    const byNum = [...this.problems.entries()].sort(
      (a, b) =>
        parseInt(a[0], 10) - parseInt(b[0], 10) || a[0].localeCompare(b[0]),
    );
    const secNum = new Map(this.headings.map((h) => [h.id, h.num]));
    let rows = "";
    for (const [pid, { title, headings }] of byNum) {
      const refs = headings
        .map((h) => {
          const pg = pageOf.get(h);
          return `${esc(secNum.get(h) ?? "")}<span class="ix-pg">${pg === undefined ? "000" : pg}</span>`;
        })
        .join("，");
      rows += `<div class="ix-row"><span class="ix-id">${esc(pid)}</span><span class="ix-title">${esc(title)}</span><span class="ix-refs">${refs}</span></div>`;
    }
    return `<section class="chapter appendix" style="page: appendix"><h2 id="${id}" class="appendix-title">附錄\u3000題號索引</h2><p class="ix-note">全書各小節「搭配練習」「例題與分級練習」表格中出現的 LeetCode 題目，依題號排序。每筆列出所在小節編號與頁碼（灰色小字）；同一題出現在多個小節時全部列出，可用來比較同一題在不同技巧下的解法。共 ${byNum.length} 題。</p><div class="ix">${rows}</div></section>`;
  }

  /** Main matter HTML. `blankBefore` holds heading ids that need a blank verso before them. */
  mainHtml(
    blankBefore: Set<string>,
    pageOf: Map<string, number> = new Map(),
  ): string {
    this.headings = [];
    this.figures = [];
    this.figureUse.clear();
    this.problems.clear();
    this.idSeq = 0;
    let body = "";
    this.parts.forEach((part, pi) => {
      const chs = this.chapters.filter((c) => c.part === part);
      if (!chs.length) return;
      const partHtml = this.partHtml(part, pi, chs);
      const partId = this.headings[this.headings.length - 1]!.id;
      if (blankBefore.has(partId))
        body += `<div class="blank-page" style="page: blank"></div>`;
      body += partHtml;
      for (const ch of chs) {
        const chHtml = this.chapterHtml(ch);
        const chId = this.headings.find(
          (h) => h.level === 1 && h.title === ch.title,
        )!.id;
        if (blankBefore.has(chId))
          body += `<div class="blank-page" style="page: blank"></div>`;
        body += chHtml;
      }
    });
    const ixHtml = this.indexHtml(pageOf);
    const ixId = this.headings[this.headings.length - 1]!.id;
    if (blankBefore.has(ixId))
      body += `<div class="blank-page" style="page: blank"></div>`;
    body += ixHtml;
    return documentHtml(mainPageCss(this.chapters), body);
  }
}

// ---------------------------------------------------------------------------
// HTML documents
// ---------------------------------------------------------------------------

function fileUrl(p: string) {
  return pathToFileURL(p).href;
}

function documentHtml(pageCss: string, body: string) {
  const fonts = [
    "@fontsource/noto-serif-tc/400.css",
    "@fontsource/noto-serif-tc/700.css",
    "@fontsource/noto-sans-tc/400.css",
    "@fontsource/noto-sans-tc/700.css",
    "@fontsource/noto-sans-tc/900.css",
    "@fontsource/jetbrains-mono/400.css",
    "@fontsource/jetbrains-mono/700.css",
    "katex/dist/katex.min.css",
    "highlight.js/styles/github.css",
  ]
    .map(
      (f) =>
        `<link rel="stylesheet" href="${fileUrl(path.join(NODE_MODULES, f))}">`,
    )
    .join("\n");
  const css = fs.readFileSync(
    path.join(WEB_ROOT, "scripts/book/book.css"),
    "utf8",
  );
  return `<!doctype html>
<html lang="${BOOK.lang}">
<head>
<meta charset="utf-8">
<title>${esc(BOOK.title)}</title>
${fonts}
<style>${css}</style>
<style>${pageCss}</style>
</head>
<body>${body}</body>
</html>`;
}

function basePageCss() {
  const { width, height, top, bottom, inner, outer } = PAGE;
  const folio = `font-family: "JetBrains Mono", monospace; font-size: 8pt; color: #3e4c59;`;
  const head = `font-family: "Noto Sans TC", sans-serif; font-size: 7.6pt; color: #616e7c; vertical-align: bottom; padding-bottom: 4mm;`;
  return `
@page { size: ${width}mm ${height}mm; margin: ${top}mm ${outer}mm ${bottom}mm ${inner}mm; }
@page :left { margin-left: ${outer}mm; margin-right: ${inner}mm;
  @bottom-left { content: counter(page); ${folio} vertical-align: top; padding-top: 5mm; } }
@page :right { margin-left: ${inner}mm; margin-right: ${outer}mm;
  @bottom-right { content: counter(page); ${folio} vertical-align: top; padding-top: 5mm; } }
@page opener:left { @bottom-left { content: none; } }
@page opener:right { @bottom-right { content: none; } }
@page partpage:left { @bottom-left { content: none; } }
@page partpage:right { @bottom-right { content: none; } }
@page blank:left { @bottom-left { content: none; } }
@page blank:right { @bottom-right { content: none; } }
@page appendix:left { @top-left { content: "附錄\\3000題號索引"; font-family: "Noto Sans TC", sans-serif; font-size: 7.6pt; color: #616e7c; vertical-align: bottom; padding-bottom: 3.5mm; border-bottom: 0.4pt solid #cbd2d9; } }
@page appendix:right { @top-right { content: "附錄\\3000題號索引"; font-family: "Noto Sans TC", sans-serif; font-size: 7.6pt; color: #616e7c; vertical-align: bottom; padding-bottom: 3.5mm; border-bottom: 0.4pt solid #cbd2d9; } }
/* header styles shared by chapter pages */
.__head { ${head} }
`;
}

function mainPageCss(chapters: Chapter[]) {
  const head = `font-family: "Noto Sans TC", sans-serif; font-size: 7.6pt; color: #616e7c; vertical-align: bottom; padding-bottom: 3.5mm; border-bottom: 0.4pt solid #cbd2d9;`;
  let css = basePageCss();
  for (const ch of chapters) {
    const left = `第 ${ch.num} 章\u3000${ch.title}`;
    const right = ch.part.title;
    css += `
@page ch${ch.num}:left { @top-left { content: ${cssString(left)}; ${head} } @top-right { content: ""; ${head} } }
@page ch${ch.num}:right { @top-right { content: ${cssString(right)}; ${head} } @top-left { content: ""; ${head} } }`;
  }
  return css;
}

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

function frontHtml(
  chapters: Chapter[],
  headings: HeadingRef[],
  figures: FigureRef[],
  figureTotal: number,
  today: string,
) {
  const pageNo = (h: HeadingRef | undefined) =>
    h?.page !== undefined ? String(h.page + 1) : "";
  const link = (id: string) => `https://book.invalid/#${id}`;
  const secCount = headings.filter((h) => h.level >= 2).length;

  let toc = "";
  for (const h of headings) {
    if (h.level === 0) {
      toc += `<a class="toc-row l0 part" href="${link(h.id)}"><span class="lbl">${esc(h.num)}\u3000${esc(h.title)}</span><span class="dots"></span><span class="pg">${pageNo(h)}</span></a>`;
    } else if (h.level === 1) {
      toc += `<a class="toc-row l0" href="${link(h.id)}"><span class="lbl"><span class="n">${esc(h.num)}</span>${esc(h.title)}</span><span class="dots"></span><span class="pg">${pageNo(h)}</span></a>`;
    } else if (h.level === 2) {
      toc += `<a class="toc-row l1" href="${link(h.id)}"><span class="lbl"><span class="n">${esc(h.num)}</span>${esc(h.title)}</span><span class="dots"></span><span class="pg">${pageNo(h)}</span></a>`;
    } else if (h.level === 3) {
      toc += `<a class="toc-row l2" href="${link(h.id)}"><span class="lbl"><span class="n">${esc(h.num)}</span>${esc(h.title)}</span><span class="dots"></span><span class="pg">${pageNo(h)}</span></a>`;
    }
  }

  const byId = new Map(headings.map((h) => [h.id, h]));
  let lof = "";
  for (const f of figures) {
    lof += `<a class="toc-row l1" href="${link(`fig-${f.id}`)}"><span class="lbl"><span class="n">圖 ${esc(f.num)}</span>${esc(f.caption)}</span><span class="dots"></span><span class="pg">${pageNo(byId.get(f.headingId))}</span></a>`;
  }

  const chapterList = chapters
    .map((c) => `第 ${c.num} 章「${esc(c.title)}」`)
    .join("、");

  const body = `
<div class="front-page cover" style="page: cover">${coverSvg()}</div>
<div class="front-page" style="page: frontblank"></div>
<div class="front-page half-title" style="page: frontblank"><div class="t">${esc(BOOK.title)}</div><div class="s">${esc(BOOK.subtitle)}</div></div>
<div class="front-page copyright" style="page: frontblank">
<table><tbody>
<tr><td>書名</td><td>${esc(BOOK.title)}：${esc(BOOK.subtitle)}</td></tr>
<tr><td>叢書</td><td>${esc(BOOK.series)}</td></tr>
<tr><td>編著</td><td>${esc(BOOK.authors.replace(/\u3000編著$/, ""))}</td></tr>
<tr><td>版次</td><td>${esc(BOOK.edition)}（排版日期 ${today}）</td></tr>
<tr><td>規格</td><td>${PAGE.width} × ${PAGE.height} mm（16 開）</td></tr>
<tr><td>ISBN</td><td>（出版前由出版社申請）</td></tr>
</tbody></table>
<p>本書內容與線上講義 ${esc(BOOK.site)} 同源，由開源專案 ${esc(BOOK.repo)} 的講義原始檔（<code>apps/web/features/lecture/content/</code>）以 <code>scripts/book/buildLectureBook.ts</code> 自動排版產生；書中圖解均由程式實際執行演算法後繪製。</p>
<p>題單分類架構參考靈茶山艾府（0x3F）於力扣中國社群發布的分類題單；題目難度分數採用 zerotrac 的力扣競賽題目評分。LeetCode 為其所有者之商標，本書與 LeetCode 官方無任何隸屬關係。</p>
<p>程式碼部分依 MIT 授權釋出。講義文字與圖解之出版、翻印與改作，請洽專案維護者取得授權。</p>
</div>
<div class="front-page preface" style="page: front">
<h1 class="front-title">前言</h1>
<p>這是一本以「題型」為單位組織的演算法講義。全書 ${chapters.length} 章、${secCount} 個小節，依序為${chapterList}。每一小節都圍繞一個技巧，從「暴力為什麼不夠」講起，一路走到可以直接套用的 C++17 模板，最後附上按難度分數排序的練習題。</p>
<p>與一般教科書不同，本書的每一小節都遵循同一個十五段骨架（見圖 0-1）。固定骨架的好處是：讀到任何一節，你都知道去哪裡找「這個技巧的前提」、「為什麼正確」和「最常見的坑」。其中<strong>不變量或正確性證明</strong>是全書最用力寫的一段——模板可以背，但只有理解不變量，才能在題目稍微變形時仍然寫對。</p>
<figure class="fig">${skeletonFigure().replace(/ width="(\d+)" height="(\d+)"/, (_m, w: string, h: string) => ` width="${Math.round(Number(w) * 0.84)}" height="${Math.round(Number(h) * 0.84)}"`)}<figcaption><b>圖 0-1</b>每一小節共用的十五段骨架</figcaption></figure>
<div class="kh kh2">如何閱讀本書</div>
<ul>
<li><strong>第一次讀</strong>：依章節順序讀每節的前五段（到「不變量或正確性證明」），再動手做「例題與分級練習」中分數最低的三題。</li>
<li><strong>刷題時查閱</strong>：直接翻到「辨識題型的訊號」與「C++17 模板」；卡住時再回頭看不變量。</li>
<li><strong>考前複習</strong>：只讀每節最後的「本節重點速查」，並檢查「常見錯誤與邊界條件」的每一條是否都能說出原因。</li>
<li><strong>圖解</strong>：全書共 ${figureTotal} 幅圖，多半放在「核心想法與直覺」段落開頭；圖中的每一個數字都是實際執行演算法得到的結果，可以拿來對照自己的程式。</li>
</ul>
<div class="kh kh2">排版慣例</div>
<ul>
<li>題號如「LC 704」指 LeetCode 題號；練習表中的「分數」為競賽難度評分，約 1200 相當於週賽第一題、2400 以上屬第四題難度。</li>
<li>標示「選做」的小節屬進階內容，初讀可跳過；灰色卡片在各章地圖中標出這些小節。</li>
<li>區間一律寫明開閉：<code>[l, r]</code> 為閉區間，<code>[l, r)</code> 為左閉右開。複雜度中的 n 為輸入長度，除非另有說明。</li>
</ul>
</div>
<div class="front-page toc" style="page: front"><h1 class="front-title">目錄</h1>${toc}</div>
<div class="front-page lof" style="page: front"><h1 class="front-title">圖目錄</h1>${lof}</div>
`;
  const css =
    basePageCss() +
    `
@page cover { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
@page frontblank:left { @bottom-left { content: none; } }
@page frontblank:right { @bottom-right { content: none; } }
@page front:left { @bottom-left { content: counter(page, lower-roman); } }
@page front:right { @bottom-right { content: counter(page, lower-roman); } }
.cover svg { display: block; width: ${PAGE.width}mm; height: ${PAGE.height}mm; }
a.toc-row { color: inherit; text-decoration: none; }
`;
  return documentHtml(css, body);
}

// ---------------------------------------------------------------------------
// PDF helpers
// ---------------------------------------------------------------------------

async function printPdf(
  browser: Browser,
  html: string,
  htmlPath: string,
): Promise<Uint8Array> {
  fs.writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(fileUrl(htmlPath), { waitUntil: "load", timeout: 0 });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const buf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    outline: true,
    tagged: true,
  });
  await page.close();
  return new Uint8Array(buf);
}

function decodePdfText(obj: PDFObject | undefined): string {
  if (obj instanceof PDFString || obj instanceof PDFHexString)
    return obj.decodeText();
  return "";
}

/** Flatten the Chromium-generated outline into [title, pageIndex] in document order. */
function readOutline(doc: PDFDocument): { title: string; page: number }[] {
  const pageIndex = new Map<string, number>();
  doc.getPages().forEach((p, i) => pageIndex.set(p.ref.toString(), i));
  const out: { title: string; page: number }[] = [];
  const outlines = doc.catalog.lookupMaybe(PDFName.of("Outlines"), PDFDict);
  const visit = (ref: PDFObject | undefined) => {
    let cur = ref;
    while (cur) {
      const item = doc.context.lookup(cur, PDFDict);
      let dest = item.lookupMaybe(PDFName.of("Dest"), PDFArray);
      if (!dest) {
        const action = item.lookupMaybe(PDFName.of("A"), PDFDict);
        dest = action?.lookupMaybe(PDFName.of("D"), PDFArray);
      }
      const pageRef = dest?.get(0);
      out.push({
        title: decodePdfText(item.lookup(PDFName.of("Title"))),
        page:
          pageRef instanceof PDFRef
            ? (pageIndex.get(pageRef.toString()) ?? -1)
            : -1,
      });
      visit(item.get(PDFName.of("First")));
      cur = item.get(PDFName.of("Next"));
    }
  };
  if (outlines) visit(outlines.get(PDFName.of("First")));
  return out;
}

function assignPages(
  headings: HeadingRef[],
  outline: { title: string; page: number }[],
) {
  if (outline.length !== headings.length) {
    throw new Error(
      `Outline has ${outline.length} entries but the book has ${headings.length} headings`,
    );
  }
  headings.forEach((h, i) => {
    h.page = outline[i]!.page;
  });
}

function buildOutline(
  doc: PDFDocument,
  headings: HeadingRef[],
  figuresTitle: { title: string; page: number }[],
  mainOffset: number,
) {
  interface Node {
    title: string;
    page: number;
    children: Node[];
    level: number;
  }
  const root: Node = { title: "", page: 0, children: [], level: -1 };
  const stack: Node[] = [root];
  for (const f of figuresTitle)
    root.children.push({
      title: f.title,
      page: f.page,
      children: [],
      level: 0,
    });
  for (const h of headings) {
    if (h.level > 3) continue;
    const node: Node = {
      title: h.level <= 1 ? `${h.num}\u3000${h.title}` : `${h.num} ${h.title}`,
      page: (h.page ?? 0) + mainOffset,
      children: [],
      level: h.level,
    };
    while (stack.length > 1 && stack[stack.length - 1]!.level >= h.level)
      stack.pop();
    stack[stack.length - 1]!.children.push(node);
    stack.push(node);
  }
  const pages = doc.getPages();
  const ctx = doc.context;
  const write = (
    node: Node,
    parentRef: PDFRef,
  ): { ref: PDFRef; count: number } => {
    const ref = ctx.nextRef();
    const dict = ctx.obj({}) as PDFDict;
    dict.set(PDFName.of("Title"), PDFHexString.fromText(node.title));
    dict.set(PDFName.of("Parent"), parentRef);
    const dest = ctx.obj([
      pages[Math.min(node.page, pages.length - 1)]!.ref,
      PDFName.of("XYZ"),
      PDFNull,
      PDFNull,
      PDFNull,
    ]);
    dict.set(PDFName.of("Dest"), dest);
    const count = writeChildren(node.children, ref, dict);
    // Parts and chapters open, sections collapsed.
    if (node.children.length)
      dict.set(
        PDFName.of("Count"),
        PDFNumber.of(node.level <= 0 ? count : -count),
      );
    ctx.assign(ref, dict);
    return { ref, count: node.level <= 0 ? count + 1 : 1 };
  };
  const writeChildren = (
    children: Node[],
    parentRef: PDFRef,
    parentDict: PDFDict,
  ) => {
    const refs: PDFRef[] = [];
    let total = 0;
    const dicts: PDFDict[] = [];
    for (const c of children) {
      const { ref, count } = write(c, parentRef);
      refs.push(ref);
      dicts.push(ctx.lookup(ref, PDFDict));
      total += count;
    }
    dicts.forEach((dict, i) => {
      if (i > 0) dict.set(PDFName.of("Prev"), refs[i - 1]!);
      if (i < refs.length - 1) dict.set(PDFName.of("Next"), refs[i + 1]!);
    });
    if (refs.length) {
      parentDict.set(PDFName.of("First"), refs[0]!);
      parentDict.set(PDFName.of("Last"), refs[refs.length - 1]!);
    }
    return total;
  };
  const outlinesRef = ctx.nextRef();
  const outlinesDict = ctx.obj({ Type: "Outlines" }) as PDFDict;
  const total = writeChildren(root.children, outlinesRef, outlinesDict);
  outlinesDict.set(PDFName.of("Count"), PDFNumber.of(total));
  ctx.assign(outlinesRef, outlinesDict);
  doc.catalog.set(PDFName.of("Outlines"), outlinesRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
  doc.catalog.set(PDFName.of("PageLayout"), PDFName.of("TwoPageRight"));
}

function setPageLabels(
  doc: PDFDocument,
  frontPages: number,
  firstMainPage: number,
) {
  const ctx = doc.context;
  const labels = ctx.obj({
    Nums: [
      0,
      ctx.obj({ S: "r" }),
      frontPages,
      ctx.obj({ S: "D", St: firstMainPage }),
    ],
  });
  doc.catalog.set(PDFName.of("PageLabels"), labels);
}

/** Rewrite the `https://book.invalid/#id` links from the contents pages into internal GoTo links. */
function relinkContents(doc: PDFDocument, targets: Map<string, number>) {
  const pages = doc.getPages();
  let fixed = 0;
  for (const page of pages) {
    const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const annot = annots.lookup(i, PDFDict);
      const action = annot.lookupMaybe(PDFName.of("A"), PDFDict);
      const uri = decodePdfText(action?.lookup(PDFName.of("URI")));
      const m = uri.match(/^https:\/\/book\.invalid\/#(.+)$/);
      if (!m || !action) continue;
      const target = targets.get(m[1]!);
      if (target === undefined) continue;
      annot.delete(PDFName.of("A"));
      annot.set(
        PDFName.of("Dest"),
        doc.context.obj([
          pages[target]!.ref,
          PDFName.of("XYZ"),
          PDFNull,
          PDFNull,
          PDFNull,
        ]),
      );
      fixed++;
    }
  }
  return fixed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function loadChapters(only: string[] | null): {
  chapters: Chapter[];
  parts: BookPart[];
} {
  const chapters: Chapter[] = [];
  const parts: BookPart[] = [];
  let num = 0;
  for (const part of PARTS) {
    const keys = part.chapters.filter((k) => !only || only.includes(k));
    if (!keys.length) continue;
    const p = { ...part, chapters: keys };
    parts.push(p);
    for (const key of keys) {
      const root = lectureContentMap[key];
      if (!root) throw new Error(`Unknown lecture category ${key}`);
      chapters.push({
        key,
        num: ++num,
        title: LECTURE_CATEGORIES[key] ?? key,
        longTitle: root.title,
        root,
        part: p,
      });
    }
  }
  const missing = Object.keys(lectureContentMap).filter(
    (k) => !PARTS.some((p) => p.chapters.includes(k)),
  );
  if (missing.length)
    console.warn(
      `[book] categories not placed in any part: ${missing.join(", ")}`,
    );
  return { chapters, parts };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = path.dirname(opts.out);
  fs.mkdirSync(outDir, { recursive: true });
  const { chapters, parts } = loadChapters(opts.chapters);
  const today = new Date().toISOString().slice(0, 10);
  const executablePath = findChrome(opts.chrome);
  const browser = await chromium.launch({ executablePath });
  const t0 = Date.now();
  const log = (msg: string) =>
    console.log(`[book ${((Date.now() - t0) / 1000).toFixed(0)}s] ${msg}`);

  try {
    const builder = new BookBuilder(chapters, parts);
    const mainPath = path.join(outDir, "main.html");

    // Pass 1: natural pagination.
    let html = builder.mainHtml(new Set());
    log(
      `pass 1: ${builder.headings.length} headings, ${builder.figures.length} figures, ${(html.length / 1e6).toFixed(1)} MB HTML`,
    );
    let pdf = await printPdf(browser, html, mainPath);
    let doc = await PDFDocument.load(pdf);
    assignPages(builder.headings, readOutline(doc));
    log(`pass 1: ${doc.getPageCount()} pages`);

    // Later passes: every part / chapter opens on a recto (odd page = even
    // index), and the problem index carries the pages of the previous pass.
    // Chromium's pagination is not perfectly stable across passes (a blank
    // verso flips every following page between left and right), so repeat
    // until the pages printed in the index match the pages they point to.
    const blanks = new Set<string>();
    for (let pass = 2; pass <= 5; pass++) {
      const predicted = new Map<string, number>();
      let shift = 0;
      for (const h of builder.headings) {
        if (h.level <= 1 && ((h.page ?? 0) + shift) % 2 === 1) {
          if (blanks.has(h.id)) blanks.delete(h.id);
          else blanks.add(h.id);
          shift += blanks.has(h.id) ? 1 : -1;
        }
        predicted.set(h.id, (h.page ?? 0) + shift + 1);
      }
      html = builder.mainHtml(blanks, predicted);
      pdf = await printPdf(browser, html, mainPath);
      doc = await PDFDocument.load(pdf);
      assignPages(builder.headings, readOutline(doc));
      const verso = builder.headings.filter(
        (h) => h.level <= 1 && (h.page ?? 0) % 2 === 1,
      );
      const moved = builder.headings.filter(
        (h) => predicted.get(h.id) !== (h.page ?? 0) + 1,
      );
      log(
        `pass ${pass}: ${doc.getPageCount()} pages (${blanks.size} blank versos, ${moved.length} headings moved, ${verso.length} openers on a verso)`,
      );
      if (!moved.length && !verso.length) break;
      if (pass === 5)
        console.warn(
          "[book] pagination did not converge; problem-index page numbers may be off by one",
        );
    }
    const unused = ALL_FIGURES.filter(
      (f) =>
        !builder.figureUse.has(f.id) &&
        (!opts.chapters || opts.chapters.includes(f.category)),
    );
    if (unused.length)
      console.warn(
        `[book] figures with no matching section: ${unused.map((f) => `${f.id} (${f.category} / ${f.section})`).join(", ")}`,
      );

    // Front matter (page numbers come from the final pass).
    const figureTotal = builder.figures.length + 1;
    let frontPdf = await printPdf(
      browser,
      frontHtml(
        chapters,
        builder.headings,
        builder.figures,
        figureTotal,
        today,
      ),
      path.join(outDir, "front.html"),
    );
    let frontDoc = await PDFDocument.load(frontPdf);
    if (frontDoc.getPageCount() % 2 === 1) {
      frontDoc.addPage([(PAGE.width / 25.4) * 72, (PAGE.height / 25.4) * 72]);
      frontPdf = await frontDoc.save();
      frontDoc = await PDFDocument.load(frontPdf);
    }
    const frontPages = frontDoc.getPageCount();
    log(`front matter: ${frontPages} pages`);

    const writeBook = async (
      outFile: string,
      range: [number, number] | null,
      title: string,
    ) => {
      const book = await PDFDocument.create();
      const fp = await book.copyPages(frontDoc, frontDoc.getPageIndices());
      fp.forEach((p) => book.addPage(p));
      const mainIdx = range
        ? Array.from({ length: range[1] - range[0] }, (_, i) => range[0] + i)
        : doc.getPageIndices();
      const mp = await book.copyPages(doc, mainIdx);
      mp.forEach((p) => book.addPage(p));
      const offset = frontPages - (range ? range[0] : 0);
      const inRange = builder.headings.filter(
        (h) =>
          !range || ((h.page ?? 0) >= range[0] && (h.page ?? 0) < range[1]),
      );
      const frontOutline = readOutline(frontDoc)
        .filter((o) => o.title && o.page >= 0)
        .map((o) => ({ title: o.title, page: o.page }));
      buildOutline(book, inRange, frontOutline, offset);
      setPageLabels(book, frontPages, range ? range[0] + 1 : 1);
      const targets = new Map<string, number>();
      for (const h of inRange) targets.set(h.id, (h.page ?? 0) + offset);
      for (const f of builder.figures) {
        const h = inRange.find((x) => x.id === f.headingId);
        if (h) targets.set(`fig-${f.id}`, (h.page ?? 0) + offset);
      }
      const links = relinkContents(book, targets);
      book.setTitle(title);
      book.setSubject(BOOK.subtitle);
      book.setAuthor(BOOK.authors.replace(/\u3000編著$/, ""));
      book.setKeywords([...BOOK.keywords]);
      book.setCreator("lc-rating scripts/book/buildLectureBook.ts");
      book.setProducer("Chromium + pdf-lib");
      book.setLanguage(BOOK.lang);
      fs.writeFileSync(outFile, await book.save());
      log(
        `wrote ${path.relative(process.cwd(), outFile)} (${book.getPageCount()} pages, ${links} contents links)`,
      );
    };

    await writeBook(opts.out, null, `${BOOK.title}：${BOOK.subtitle}`);

    if (opts.volumes) {
      const partHeads = builder.headings.filter((h) => h.level === 0);
      for (let i = 0; i < partHeads.length; i++) {
        const start = partHeads[i]!.page ?? 0;
        const end = partHeads[i + 1]?.page ?? doc.getPageCount();
        const file = opts.out.replace(/\.pdf$/, `-vol${i + 1}.pdf`);
        await writeBook(
          file,
          [start, end],
          `${BOOK.title}（${partHeads[i]!.num}\u3000${partHeads[i]!.title}）`,
        );
      }
    }

    if (!opts.keepHtml) {
      fs.rmSync(mainPath, { force: true });
      fs.rmSync(path.join(outDir, "front.html"), { force: true });
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
