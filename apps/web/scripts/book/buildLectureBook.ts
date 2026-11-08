/**
 * Build the 講義 as a print-ready book PDF.
 *
 *   npx tsx scripts/book/buildLectureBook.ts [options]
 *
 * Two editions share this pipeline:
 *
 * - Topic edition (default): one book, four parts ordered by technique.
 * - Difficulty edition (`--difficulty`): three volumes 簡單篇 / 中等篇 /
 *   困難篇. Every leaf section goes to exactly one volume according to the
 *   ratings of its practice problems (`difficulty.ts`); each volume keeps the
 *   four-part order, adds a volume guide, cross references to the other two
 *   volumes, and reference appendices for C++ interview preparation.
 *
 * Options:
 *   --out <file>          Output PDF (topic edition; default
 *                         book-dist/lc-lecture-book.pdf). In the difficulty
 *                         edition its directory receives
 *                         lc-lecture-<easy|medium|hard>.pdf.
 *   --chapters a,b        Only these lecture categories (for quick previews)
 *   --volumes             Topic edition: also write one PDF per part (篇)
 *   --difficulty          Build the three difficulty volumes instead
 *   --level easy,hard     Difficulty edition: only these volumes
 *   --print               Difficulty edition: also write the print files
 *                         (interior without cover, cover spread with spine
 *                         and bleed, CMYK versions when Ghostscript exists,
 *                         and a print spec sheet)
 *   --html                Keep the intermediate HTML in book-dist/
 *   --chrome <path>       Chromium executable (default: $CHROME_PATH or the
 *                         Playwright-managed Chromium)
 *
 * Pipeline:
 *   1. Walk the lecture trees in the part / chapter order of `config.ts`,
 *      render every section with the site's markdown stack (`markdown.ts`) and
 *      insert the figures registered in `figures/`.
 *   2. Print the main matter with Chromium (paged media: named pages give
 *      per-chapter running heads, margin boxes give folios). Pass 1 reads the
 *      page of every heading back from the PDF outline; later passes insert
 *      blank versos so every part and chapter opens on a recto.
 *   3. Print the front matter (half title, copyright, preface or volume
 *      guide, contents, list of figures) with the final page numbers, and
 *      the cover separately.
 *   4. Merge with pdf-lib, rebuild the bookmark tree, turn contents entries
 *      into internal links and set page labels.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import { chromium, type Browser } from "playwright-core";
import {
  LECTURE_CATEGORIES,
  lectureContentMap,
} from "../../features/lecture/content";
import type { TutorialData } from "../../types";
import { AUTHORED_APPENDICES } from "./appendices";
import { BOOK, PAGE, PARTS, PRINT, TOPIC_BACK, type BookPart } from "./config";
import { coverSvg } from "./cover";
import {
  LEVELS,
  VOLUMES,
  classifyLeaf,
  filterRoot,
  levelCounts,
  tableRatings,
  type Level,
  type VolumeInfo,
} from "./difficulty";
import { ALL_FIGURES, chapterMap, skeletonFigure } from "./figures";
import type { BookFigure } from "./figures/types";
import { levelSpread, ratingHistogram } from "./figures/volume";
import { insertAfterAnchor, renderMarkdown } from "./markdown";
import {
  assignPages,
  buildOutline,
  printPdf,
  readOutline,
  relinkContents,
  setPageLabels,
} from "./pdf";
import {
  backCoverSvg,
  coverSpreadSvg,
  frontCoverSvg,
  type BackCoverContent,
  type CoverStats,
} from "./volumeCover";

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
  difficulty: boolean;
  levels: Level[];
  print: boolean;
  keepHtml: boolean;
  chrome: string | undefined;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    out: path.join(WEB_ROOT, "book-dist", "lc-lecture-book.pdf"),
    chapters: null,
    volumes: false,
    difficulty: false,
    levels: [...LEVELS],
    print: false,
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
    else if (a === "--difficulty") opts.difficulty = true;
    else if (a === "--level") {
      const ls = (argv[++i] ?? "").split(",").filter(Boolean);
      for (const l of ls)
        if (!LEVELS.includes(l as Level)) throw new Error(`Unknown level ${l}`);
      opts.levels = ls as Level[];
      opts.difficulty = true;
    } else if (a === "--print") opts.print = true;
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
  /** The (possibly filtered) tree printed in this book. */
  root: TutorialData.Root;
  part: BookPart;
}

/** One printed section, located in one difficulty volume. */
interface SectionLoc {
  level: Level;
  category: string;
  chapterNum: number;
  num: string;
  title: string;
}

/** Everything one difficulty volume needs to know about the other two. */
interface SeriesContext {
  layouts: Record<Level, { chapters: Chapter[] }>;
  /** `category/section title` → location, for leaf sections of every volume. */
  sections: Map<string, SectionLoc>;
  /** LeetCode id → locations of the practice tables that list it. */
  problemLocs: Map<string, SectionLoc[]>;
  /** Rated practice problems per volume (deduplicated by id). */
  ratings: Record<Level, number[]>;
  /** Real (non-"all") leaf sections per volume. */
  sectionCounts: Record<Level, number>;
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

/** Scale an inline figure SVG (`width`/`height` attributes) by `s`. */
function scaleSvg(svgText: string, s: number) {
  return svgText.replace(
    / width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/,
    (_m, w: string, h: string) =>
      ` width="${(Number(w) * s).toFixed(0)}" height="${(Number(h) * s).toFixed(0)}"`,
  );
}

const OPTIONAL_RE = /選做|常見面試模式|其他|雜項/;
const PROBLEM_ROW_RE =
  /^\|\s*(\d{1,4}[A-Z]?)\s*\|\s*\[([^\]]+)\]\((?:https?:\/\/)?leetcode/;

interface BackMatter {
  key: string;
  num: string;
  title: string;
  head: string;
  html: (pageOf: Map<string, number>, id: string) => string;
}

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
    private volume: VolumeInfo | null = null,
    private series: SeriesContext | null = null,
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
    // Scale figures to ~0.84 CSS px per SVG unit; max-width keeps wide ones in the text block.
    return `<figure class="fig" id="fig-${esc(fig.id)}">${scaleSvg(fig.svg, 0.84)}<figcaption><b>圖 ${num}</b>${esc(fig.caption)}</figcaption></figure>`;
  }

  private figuresFor(category: string, section: string): BookFigure[] {
    return ALL_FIGURES.filter(
      (f) => f.category === category && f.section === section,
    );
  }

  private collectProblems(md: string, headingId: string) {
    for (const line of md.split("\n")) {
      const m = line.match(PROBLEM_ROW_RE);
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

  /** Chapter-end box: where the rest of this topic lives in the other volumes. */
  private crossRefHtml(ch: Chapter): string {
    if (!this.volume || !this.series) return "";
    const series = this.series;
    let rows = "";
    for (const l of LEVELS) {
      if (l === this.volume.level) continue;
      const other = series.layouts[l].chapters.find((c) => c.key === ch.key);
      if (!other) continue;
      const locs = [...series.sections.values()].filter(
        (s) => s.level === l && s.category === ch.key,
      );
      if (!locs.length) continue;
      const v = VOLUMES[l];
      rows += `<div class="xref-row"><span class="xref-mark" style="background:${v.accent}">${v.mark}</span><div><div class="xref-vol">${esc(v.ordinal)}・${esc(v.name)}\u3000第 ${other.num} 章「${esc(other.title)}」</div><div class="xref-list">${locs.map((s) => `<span>${esc(s.num)} ${esc(stripNumber(s.title))}</span>`).join("")}</div></div></div>`;
    }
    if (!rows) return "";
    return `<aside class="xref"><div class="xref-title">本主題的其他小節</div>${rows}</aside>`;
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
        caption: this.volume
          ? `${ch.title}：本冊收錄的小節（灰色為選讀或綜合整理小節）`
          : `${ch.title}：本章地圖（灰色為選讀或綜合整理小節）`,
        svg: chapterMap(items),
      },
      id,
    );
    let out = `<section class="chapter" style="page: ch${ch.num}">`;
    out += `<div class="chapter-opener" style="page: opener">`;
    out += `<div class="chapter-num">CHAPTER<b>${ch.num}</b></div>`;
    out += `<h2 id="${id}">${esc(ch.title)}</h2>`;
    out += `<div class="chapter-src">${esc(ch.longTitle)}</div>`;
    if (this.volume) {
      const counts = levelCounts(ch.key, lectureContentMap[ch.key]!);
      out += `<div class="chapter-spread"><div class="spread-label">本主題在三冊中的小節數</div>${scaleSvg(levelSpread(counts, this.volume.level), 0.84)}</div>`;
    }
    out += `<div class="chapter-map">${mapFig}</div>`;
    out += `</div>`;
    const intro = ch.root.summary?.trim();
    if (intro) {
      out += `<div class="chapter-intro"><div class="intro-label">本章導讀</div>${this.sectionBody(ch, "", intro, id)}</div>`;
    }
    out += this.renderSections(ch, ch.root.children, String(ch.num), 0);
    out += this.crossRefHtml(ch);
    out += `</section>`;
    return out;
  }

  private partHtml(part: BookPart, idx: number, chapters: Chapter[]): string {
    const id = this.nextId("p");
    const [label = "", name = part.title] = part.title.split("\u3000");
    this.headings.push({ id, level: 0, num: label, title: name });
    let sub = part.subtitle;
    if (this.volume) {
      const lv = this.volume.level;
      const list = chapters
        .map((c) => {
          const n = levelCounts(c.key, lectureContentMap[c.key]!)[lv];
          return `${c.title}（${n} 節）`;
        })
        .join("、");
      sub = `本冊收錄：${list}。`;
    }
    let out = `<div class="part-page" style="page: partpage">`;
    out += `<div class="pnum">PART ${idx + 1}\u3000${esc(label)}</div>`;
    out += `<h1 id="${id}">${esc(name)}</h1>`;
    out += `<div class="psub">${esc(sub)}</div>`;
    out += `<div class="pchapters">${chapters.map((c) => `第 ${c.num} 章\u3000${esc(c.title)}`).join("<br>")}</div>`;
    out += `</div>`;
    return out;
  }

  /** Back matter in print order. The index is always last. */
  backMatter(): BackMatter[] {
    const list: BackMatter[] = [];
    if (this.volume) {
      for (const a of AUTHORED_APPENDICES) {
        const html = renderMarkdown(a.markdown).html;
        list.push({
          key: a.key,
          num: `附錄 ${a.letter}`,
          title: a.title,
          head: a.head,
          html: () => `<div class="body appendix-body">${html}</div>`,
        });
      }
      list.push({
        key: "interview",
        num: "附錄 C",
        title: "面試高頻題對照",
        head: "附錄 C\u3000面試高頻題對照",
        html: (pageOf) => this.interviewMapHtml(pageOf),
      });
    }
    const letter = this.volume ? " D" : "";
    list.push({
      key: "index",
      num: `附錄${letter}`,
      title: "題號索引",
      head: `附錄${letter}\u3000題號索引`,
      html: (pageOf) => this.indexHtml(pageOf),
    });
    return list;
  }

  /** Location label for a section of any volume: 「簡 2.3（p. 41）」. */
  private locHtml(loc: SectionLoc, pageOf: Map<string, number>): string {
    const v = VOLUMES[loc.level];
    let pg = "";
    if (this.volume && loc.level === this.volume.level) {
      const h = this.headings.find((x) => x.num === loc.num && x.level >= 2);
      const p = h ? pageOf.get(h.id) : undefined;
      pg = `<span class="ix-pg">${p === undefined ? "000" : p}</span>`;
    }
    const cur = this.volume && loc.level === this.volume.level ? " cur" : "";
    return `<span class="loc${cur}"><span class="loc-mark" style="color:${v.accent}">${v.mark}</span>${esc(loc.num)}${pg}</span>`;
  }

  private interviewMapHtml(pageOf: Map<string, number>): string {
    const series = this.series!;
    const plan = loadInterviewPlan();
    const ratings = loadRatings();
    let out = `<p class="ix-note">下表取自本專案「面試衝刺計畫」的高優題單，共 ${plan.reduce((s, g) => s + g.problems.length, 0)} 題，依主題分組。「所在小節」列出題目出現在三冊哪些小節的練習表中：<b>簡</b>、<b>中</b>、<b>難</b>分別代表上、中、下冊，後接小節編號；本冊的小節另以灰色小字標出頁碼。一題出現在多個小節時全部列出，可以比較同一題在不同技巧下的寫法。</p>`;
    for (const g of plan) {
      out += `<div class="kh kh2">${esc(g.title)}</div>`;
      out += `<div class="table-wrap"><table class="imap"><thead><tr><th>題號</th><th>題目</th><th>分數</th><th>所在小節</th></tr></thead><tbody>`;
      for (const p of g.problems) {
        const locs = series.problemLocs.get(p.id) ?? [];
        const r = ratings.get(p.id);
        const where = locs.length
          ? locs.map((l) => this.locHtml(l, pageOf)).join("")
          : `<span class="muted">本書練習表未收錄</span>`;
        out += `<tr><td class="mono">${esc(p.id)}</td><td>${esc(p.title)}</td><td class="mono">${r ? Math.round(r) : "—"}</td><td>${where}</td></tr>`;
      }
      out += `</tbody></table></div>`;
    }
    return out;
  }

  /**
   * Problem index. `pageOf` maps heading ids to printed page numbers; in
   * pass 1 it is empty and placeholders of the same width keep the index
   * the same length.
   */
  private indexHtml(pageOf: Map<string, number>): string {
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
    const scope = this.volume ? "本冊" : "全書";
    return `<p class="ix-note">${scope}各小節「搭配練習」「例題與分級練習」表格中出現的 LeetCode 題目，依題號排序。每筆列出所在小節編號與頁碼（灰色小字）；同一題出現在多個小節時全部列出，可用來比較同一題在不同技巧下的解法。共 ${byNum.length} 題。</p><div class="ix">${rows}</div>`;
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
    const blank = (id: string) =>
      blankBefore.has(id)
        ? `<div class="blank-page" style="page: blank"></div>`
        : "";
    this.parts.forEach((part, pi) => {
      const chs = this.chapters.filter((c) => c.part === part);
      if (!chs.length) return;
      const partHtml = this.partHtml(part, pi, chs);
      body += blank(this.headings[this.headings.length - 1]!.id) + partHtml;
      for (const ch of chs) {
        const chHtml = this.chapterHtml(ch);
        const chId = this.headings.find(
          (h) => h.level === 1 && h.title === ch.title,
        )!.id;
        body += blank(chId) + chHtml;
      }
    });
    const back = this.backMatter();
    for (const b of back) {
      const id = this.nextId("x");
      this.headings.push({ id, level: 1, num: b.num, title: b.title });
      body +=
        blank(id) +
        `<section class="chapter appendix" style="page: apx-${b.key}"><h2 id="${id}" class="appendix-title">${esc(b.num)}\u3000${esc(b.title)}</h2>${b.html(pageOf, id)}</section>`;
    }
    return documentHtml(
      mainPageCss(this.chapters, back, this.volume),
      body,
      themeCss(this.volume),
    );
  }
}

// ---------------------------------------------------------------------------
// Data for the difficulty edition
// ---------------------------------------------------------------------------

interface InterviewGroup {
  title: string;
  problems: { id: string; title: string }[];
}

function loadInterviewPlan(): InterviewGroup[] {
  const file = path.join(WEB_ROOT, "public/studyplan/interview_sprint.json");
  const plan = JSON.parse(fs.readFileSync(file, "utf8")) as {
    children: {
      title: string;
      children?: {
        title: string;
        problems?: { id: string; title: string }[];
      }[];
    }[];
  };
  const top = plan.children.find((c) => /高優/.test(c.title));
  if (!top?.children) return [];
  return top.children.map((c) => ({
    title: c.title.replace(/^\d+(?:\.\d+)*\s*/, ""),
    problems: (c.problems ?? []).map((p) => ({ id: p.id, title: p.title })),
  }));
}

let ratingCache: Map<string, number> | null = null;
function loadRatings(): Map<string, number> {
  if (ratingCache) return ratingCache;
  const file = path.join(WEB_ROOT, "public/problemset/problems.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    { rating?: number }
  >;
  ratingCache = new Map(
    Object.entries(data)
      .filter(([, v]) => typeof v.rating === "number")
      .map(([k, v]) => [k, v.rating!]),
  );
  return ratingCache;
}

/** Number the sections of a volume exactly as `renderSections` will. */
function numberSections(chapters: Chapter[], level: Level): SectionLoc[] {
  const out: SectionLoc[] = [];
  for (const ch of chapters) {
    const walk = (ss: TutorialData.Section[] | undefined, prefix: string) => {
      (ss ?? []).forEach((s, i) => {
        const num = `${prefix}.${i + 1}`;
        if (s.children?.length) walk(s.children, num);
        else if (classifyLeaf(ch.key, s) === level)
          out.push({
            level,
            category: ch.key,
            chapterNum: ch.num,
            num,
            title: s.title,
          });
      });
    };
    walk(ch.root.children, String(ch.num));
  }
  return out;
}

function seriesContext(only: string[] | null): SeriesContext {
  const layouts = {} as SeriesContext["layouts"];
  const sections = new Map<string, SectionLoc>();
  const problemLocs = new Map<string, SectionLoc[]>();
  const ratings = {} as Record<Level, number[]>;
  const sectionCounts = {} as Record<Level, number>;
  for (const l of LEVELS) {
    const { chapters } = loadChapters(only, l);
    layouts[l] = { chapters };
    const seen = new Set<string>();
    ratings[l] = [];
    const locs = numberSections(chapters, l);
    sectionCounts[l] = locs.length;
    for (const loc of locs) {
      sections.set(`${loc.category}/${loc.title}`, loc);
      const md =
        findSection(lectureContentMap[loc.category]!, loc.title)?.summary ?? "";
      for (const line of md.split("\n")) {
        const m = line.match(PROBLEM_ROW_RE);
        if (!m) continue;
        const list = problemLocs.get(m[1]!) ?? [];
        if (!list.some((x) => x.level === l && x.num === loc.num))
          list.push(loc);
        problemLocs.set(m[1]!, list);
      }
      // Ratings: one per problem id per volume.
      const rated = md
        .split("\n")
        .map((line) => {
          const m = line.match(PROBLEM_ROW_RE);
          const r = tableRatings(line);
          return m && r.length ? ([m[1]!, r[0]!] as const) : null;
        })
        .filter((x): x is readonly [string, number] => x !== null);
      for (const [pid, r] of rated) {
        if (seen.has(pid)) continue;
        seen.add(pid);
        ratings[l].push(r);
      }
    }
  }
  return { layouts, sections, problemLocs, ratings, sectionCounts };
}

function findSection(
  root: TutorialData.Root,
  title: string,
): TutorialData.Section | undefined {
  const walk = (
    ss: TutorialData.Section[] | undefined,
  ): TutorialData.Section | undefined => {
    for (const s of ss ?? []) {
      if (s.title === title && !s.children?.length) return s;
      const r = walk(s.children);
      if (r) return r;
    }
    return undefined;
  };
  return walk(root.children);
}

// ---------------------------------------------------------------------------
// HTML documents
// ---------------------------------------------------------------------------

function fileUrl(p: string) {
  return pathToFileURL(p).href;
}

function themeCss(volume: VolumeInfo | null): string {
  if (!volume) return "";
  return `:root { --accent: ${volume.accent}; --accent-soft: ${volume.accentSoft}; }`;
}

function documentHtml(pageCss: string, body: string, extraCss = "") {
  const fonts = [
    "@fontsource/noto-serif-tc/400.css",
    "@fontsource/noto-serif-tc/700.css",
    "@fontsource/noto-sans-tc/400.css",
    "@fontsource/noto-sans-tc/700.css",
    "@fontsource/noto-sans-tc/900.css",
    "@fontsource/jetbrains-mono/400.css",
    "@fontsource/jetbrains-mono/700.css",
    "@fontsource/ubuntu-mono/400.css",
    "@fontsource/ubuntu-mono/700.css",
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
<style>${extraCss}</style>
<style>${pageCss}</style>
</head>
<body>${body}</body>
</html>`;
}

const HEAD_STYLE = `font-family: "Noto Sans TC", sans-serif; font-size: 7.6pt; color: #616e7c; vertical-align: bottom; padding-bottom: 3.5mm; border-bottom: 0.4pt solid #cbd2d9;`;

function basePageCss() {
  const { width, height, top, bottom, inner, outer } = PAGE;
  const folio = `font-family: "JetBrains Mono", monospace; font-size: 8pt; color: #3e4c59;`;
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
`;
}

function mainPageCss(
  chapters: Chapter[],
  back: BackMatter[],
  volume: VolumeInfo | null,
) {
  let css = basePageCss();
  for (const ch of chapters) {
    const left = `第 ${ch.num} 章\u3000${ch.title}`;
    const right = volume
      ? `${volume.name}\u3000${ch.part.title}`
      : ch.part.title;
    css += `
@page ch${ch.num}:left { @top-left { content: ${cssString(left)}; ${HEAD_STYLE} } @top-right { content: ""; ${HEAD_STYLE} } }
@page ch${ch.num}:right { @top-right { content: ${cssString(right)}; ${HEAD_STYLE} } @top-left { content: ""; ${HEAD_STYLE} } }`;
  }
  for (const b of back) {
    css += `
@page apx-${b.key}:left { @top-left { content: ${cssString(b.head)}; ${HEAD_STYLE} } }
@page apx-${b.key}:right { @top-right { content: ${cssString(b.head)}; ${HEAD_STYLE} } }`;
  }
  return css;
}

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

function tocHtml(headings: HeadingRef[], figures: FigureRef[]) {
  const pageNo = (h: HeadingRef | undefined) =>
    h?.page !== undefined ? String(h.page + 1) : "";
  const link = (id: string) => `https://book.invalid/#${id}`;
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
  return `<div class="front-page toc" style="page: front"><h1 class="front-title">目錄</h1>${toc}</div>
<div class="front-page lof" style="page: front"><h1 class="front-title">圖目錄</h1>${lof}</div>`;
}

function skeletonFigureHtml(num: string) {
  return `<figure class="fig">${scaleSvg(skeletonFigure(), 0.84)}<figcaption><b>圖 ${num}</b>每一小節共用的十五段骨架</figcaption></figure>`;
}

const READING_CONVENTIONS = `<div class="kh kh2">排版慣例</div>
<ul>
<li>題號如「LC 704」指 LeetCode 題號；練習表中的「分數」為競賽難度評分，約 1200 相當於週賽第一題、2400 以上屬第四題難度。</li>
<li>標示「選做」的小節屬進階內容，初讀可跳過；灰色卡片在各章地圖中標出這些小節。</li>
<li>區間一律寫明開閉：<code>[l, r]</code> 為閉區間，<code>[l, r)</code> 為左閉右開。複雜度中的 n 為輸入長度，除非另有說明。</li>
</ul>`;

function copyrightHtml(today: string, volume: VolumeInfo | null) {
  const name = volume
    ? `${BOOK.title}（${volume.ordinal}・${volume.name}）`
    : `${BOOK.title}：${BOOK.subtitle}`;
  const volRow = volume
    ? `<tr><td>冊次</td><td>${esc(volume.ordinal)}（共三冊）：${esc(volume.name)}，${esc(volume.ratingRange)}</td></tr>`
    : "";
  return `<div class="front-page copyright" style="page: frontblank">
<table><tbody>
<tr><td>書名</td><td>${esc(name)}</td></tr>
<tr><td>叢書</td><td>${esc(BOOK.series)}</td></tr>
${volRow}
<tr><td>編著</td><td>${esc(BOOK.authors.replace(/\u3000編著$/, ""))}</td></tr>
<tr><td>版次</td><td>${esc(BOOK.edition)}（排版日期 ${today}）</td></tr>
<tr><td>規格</td><td>${PAGE.width} × ${PAGE.height} mm（16 開）</td></tr>
<tr><td>ISBN</td><td>（出版前由出版社申請）</td></tr>
</tbody></table>
<p>本書內容與線上講義 ${esc(BOOK.site)} 同源，由開源專案 ${esc(BOOK.repo)} 的講義原始檔（<code>apps/web/features/lecture/content/</code>）以 <code>scripts/book/buildLectureBook.ts</code> 自動排版產生；書中圖解均由程式實際執行演算法後繪製。</p>
<p>題單分類架構參考靈茶山艾府（0x3F）於力扣中國社群發布的分類題單；題目難度分數採用 zerotrac 的力扣競賽題目評分。LeetCode 為其所有者之商標，本書與 LeetCode 官方無任何隸屬關係。</p>
<p>程式碼部分依 MIT 授權釋出。講義文字與圖解之出版、翻印與改作，請洽專案維護者取得授權。</p>
</div>`;
}

function halfTitleHtml(volume: VolumeInfo | null) {
  const sub = volume ? `${volume.ordinal}・${volume.name}` : BOOK.subtitle;
  return `<div class="front-page half-title" style="page: frontblank"><div class="t">${esc(BOOK.title)}</div><div class="s">${esc(sub)}</div></div>`;
}

function topicPrefaceHtml(
  chapters: Chapter[],
  secCount: number,
  figureTotal: number,
) {
  const chapterList = chapters
    .map((c) => `第 ${c.num} 章「${esc(c.title)}」`)
    .join("、");
  return `<div class="front-page preface" style="page: front">
<h1 class="front-title">前言</h1>
<p>這是一本以「題型」為單位組織的演算法講義。全書 ${chapters.length} 章、${secCount} 個小節，依序為${chapterList}。每一小節都圍繞一個技巧，從「暴力為什麼不夠」講起，一路走到可以直接套用的 C++17 模板，最後附上按難度分數排序的練習題。</p>
<p>與一般教科書不同，本書的每一小節都遵循同一個十五段骨架（見圖 0-1）。固定骨架的好處是：讀到任何一節，你都知道去哪裡找「這個技巧的前提」、「為什麼正確」和「最常見的坑」。其中<strong>不變量或正確性證明</strong>是全書最用力寫的一段——模板可以背，但只有理解不變量，才能在題目稍微變形時仍然寫對。</p>
${skeletonFigureHtml("0-1")}
<div class="kh kh2">如何閱讀本書</div>
<ul>
<li><strong>第一次讀</strong>：依章節順序讀每節的前五段（到「不變量或正確性證明」），再動手做「例題與分級練習」中分數最低的三題。</li>
<li><strong>刷題時查閱</strong>：直接翻到「辨識題型的訊號」與「C++17 模板」；卡住時再回頭看不變量。</li>
<li><strong>考前複習</strong>：只讀每節最後的「本節重點速查」，並檢查「常見錯誤與邊界條件」的每一條是否都能說出原因。</li>
<li><strong>圖解</strong>：全書共 ${figureTotal} 幅圖，多半放在「核心想法與直覺」段落開頭；圖中的每一個數字都是實際執行演算法得到的結果，可以拿來對照自己的程式。</li>
</ul>
${READING_CONVENTIONS}
</div>`;
}

function volumeGuideHtml(
  volume: VolumeInfo,
  chapters: Chapter[],
  series: SeriesContext,
  figureTotal: number,
) {
  const lv = volume.level;
  const total = LEVELS.reduce((s, l) => s + series.sectionCounts[l], 0);
  const rows = LEVELS.map((l) => {
    const v = VOLUMES[l];
    const chs = series.layouts[l].chapters.length;
    const cls = l === lv ? ' class="cur"' : "";
    return `<tr${cls}><td><span class="vol-dot" style="background:${v.accent}"></span>${esc(v.ordinal)}・${esc(v.name)}</td><td>${esc(v.ratingRange.replace("難度分數 ", ""))}</td><td>${esc(v.contestSlot)}</td><td class="num">${chs}</td><td class="num">${series.sectionCounts[l]}</td><td class="num">${series.ratings[l].length}</td></tr>`;
  }).join("");
  // A data-driven example of one topic spread over the three volumes.
  const exampleKey = "binary_search";
  const exampleParts = LEVELS.map((l) => {
    const names = [...series.sections.values()]
      .filter((s) => s.level === l && s.category === exampleKey)
      .map((s) => `「${stripNumber(s.title)}」`);
    return names.length ? `${VOLUMES[l].ordinal}收${names.join("")}` : "";
  }).filter(Boolean);
  const hist = ratingHistogram(series.ratings, lv);
  const howTo = volume.howTo.map((s) => `<li>${esc(s)}</li>`).join("");
  return `<div class="front-page preface" style="page: front">
<h1 class="front-title">本冊導讀</h1>
<p>《${esc(BOOK.title)}》依練習題的難度分成三冊。你手上的是<strong>${esc(volume.ordinal)}「${esc(volume.name)}」</strong>：收錄 ${chapters.length} 個主題、${series.sectionCounts[lv]} 個小節，每一節練習題的難度分數中位數落在 ${esc(volume.ratingRange.replace("難度分數 ", ""))}，大約相當於 LeetCode ${esc(volume.contestSlot)}的水準。三冊合計 ${total} 節，分冊方式如下表。</p>
<div class="table-wrap"><table class="voltab"><thead><tr><th>冊次</th><th>難度分數</th><th>相當於</th><th>主題</th><th>小節</th><th>評分題</th></tr></thead><tbody>${rows}</tbody></table></div>
<figure class="fig">${scaleSvg(hist, 0.84)}<figcaption><b>圖 0-1</b>三冊練習題的難度分布（本冊以主色標出，灰色為其他兩冊）</figcaption></figure>
<p><strong>分冊依據</strong>：每一小節取「例題與分級練習」表中有難度分數題目的中位數，低於 1600 歸上冊、1600 到 2099 歸中冊、2100 以上歸下冊。少數小節的代表題是沒有競賽分數的經典面試題（例如爬樓梯、反轉連結串列），或整節沒有評分題目，則依內容人工歸類。各章最後的「常見面試模式」是一頁的速查表，三冊都收。</p>
<p>因此同一個主題會分散在三冊。以二分搜尋為例：${exampleParts.join("；")}。每章開頭的色條標出本主題在三冊中各有幾節，章末的「本主題的其他小節」列出另外兩冊的對應小節編號。</p>
<div class="kh kh2">本冊怎麼讀</div>
<ul>${howTo}</ul>
<div class="kh kh2">每一小節的骨架</div>
<p>三冊的每一小節都遵循同一個十五段骨架（圖 0-2）。讀到任何一節，你都知道去哪裡找「這個技巧的前提」、「為什麼正確」和「最常見的坑」。其中<strong>不變量或正確性證明</strong>是最用力寫的一段——模板可以背，但只有理解不變量，才能在題目稍微變形時仍然寫對；這也是面試官追問「為什麼」時你要說的話。</p>
${skeletonFigureHtml("0-2")}
<div class="kh kh2">附錄</div>
<ul>
<li><strong>附錄 A\u3000C++17 面試速查</strong>：容器與演算法的複雜度、慣用寫法與最常見的陷阱。</li>
<li><strong>附錄 B\u3000複雜度估算與面試答題流程</strong>：從輸入規模反推演算法、45 分鐘的答題節奏與邊界測資清單。</li>
<li><strong>附錄 C\u3000面試高頻題對照</strong>：高優題單中的每一題落在三冊的哪一節。</li>
<li><strong>附錄 D\u3000題號索引</strong>：本冊練習表中所有題目的題號與頁碼。</li>
</ul>
<p>本冊共 ${figureTotal} 幅圖，多半放在「核心想法與直覺」段落開頭；圖中的每一個數字都是實際執行演算法得到的結果，可以拿來對照自己的程式。</p>
${READING_CONVENTIONS}
</div>`;
}

function frontPageCss() {
  return (
    basePageCss() +
    `
@page frontblank:left { @bottom-left { content: none; } }
@page frontblank:right { @bottom-right { content: none; } }
@page front:left { @bottom-left { content: counter(page, lower-roman); } }
@page front:right { @bottom-right { content: counter(page, lower-roman); } }
a.toc-row { color: inherit; text-decoration: none; }
`
  );
}

function coverHtml(svgText: string, widthMm: number, heightMm: number) {
  const css = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
html, body { margin: 0; padding: 0; }
.cover svg { display: block; width: ${widthMm}mm; height: ${heightMm}mm; }`;
  return documentHtml("", `<div class="cover">${svgText}</div>`, css);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function loadChapters(
  only: string[] | null,
  level: Level | null = null,
): { chapters: Chapter[]; parts: BookPart[] } {
  const chapters: Chapter[] = [];
  const parts: BookPart[] = [];
  let num = 0;
  for (const part of PARTS) {
    const p: BookPart = { ...part, chapters: [] };
    for (const key of part.chapters) {
      if (only && !only.includes(key)) continue;
      const full = lectureContentMap[key];
      if (!full) throw new Error(`Unknown lecture category ${key}`);
      const root = level ? filterRoot(key, full, level) : full;
      if (!root) continue;
      p.chapters.push(key);
      chapters.push({
        key,
        num: ++num,
        title: LECTURE_CATEGORIES[key] ?? key,
        longTitle: full.title,
        root,
        part: p,
      });
    }
    if (p.chapters.length) parts.push(p);
  }
  const missing = Object.keys(lectureContentMap).filter(
    (k) => !PARTS.some((pp) => pp.chapters.includes(k)),
  );
  if (missing.length)
    console.warn(
      `[book] categories not placed in any part: ${missing.join(", ")}`,
    );
  return { chapters, parts };
}

type Log = (msg: string) => void;

interface Paginated {
  builder: BookBuilder;
  doc: PDFDocument;
}

/** Print the main matter until every part / chapter opens on a recto. */
async function paginate(
  browser: Browser,
  builder: BookBuilder,
  mainPath: string,
  log: Log,
): Promise<Paginated> {
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
  // index), and the back matter carries the pages of the previous pass.
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
        "[book] pagination did not converge; index page numbers may be off by one",
      );
  }
  return { builder, doc };
}

async function printFront(
  browser: Browser,
  body: string,
  file: string,
  volume: VolumeInfo | null,
): Promise<PDFDocument> {
  let frontPdf = await printPdf(
    browser,
    documentHtml(frontPageCss(), body, themeCss(volume)),
    file,
  );
  let frontDoc = await PDFDocument.load(frontPdf);
  if (frontDoc.getPageCount() % 2 === 1) {
    frontDoc.addPage([(PAGE.width / 25.4) * 72, (PAGE.height / 25.4) * 72]);
    frontPdf = await frontDoc.save();
    frontDoc = await PDFDocument.load(frontPdf);
  }
  return frontDoc;
}

/** Print one trim-size cover SVG into a one-page PDF. */
async function svgPage(
  browser: Browser,
  svgText: string,
  htmlFile: string,
): Promise<PDFDocument> {
  return PDFDocument.load(
    await printPdf(
      browser,
      coverHtml(svgText, PAGE.width, PAGE.height),
      htmlFile,
    ),
  );
}

/** Pages of the bound interior: front + main, padded for printing. */
function interiorPages(front: PDFDocument, main: PDFDocument) {
  const n = front.getPageCount() + main.getPageCount();
  return Math.ceil(n / PRINT.padPagesTo) * PRINT.padPagesTo;
}

interface Assemble {
  outFile: string;
  title: string;
  subject: string;
  cover: PDFDocument | null;
  /** Back cover page, placed last on a verso after an inside-back blank. */
  back?: PDFDocument | null;
  front: PDFDocument;
  main: PDFDocument;
  headings: HeadingRef[];
  figures: FigureRef[];
  /** Main-matter page range [start, end) for split volumes. */
  range?: [number, number];
  /** Pad the page count to a multiple of this (print interiors). */
  padTo?: number;
}

const MM_PT = 72 / 25.4;

/** Merge cover / front / main into one PDF with outline, labels and links. */
async function assemble(a: Assemble, log: Log): Promise<number> {
  const book = await PDFDocument.create();
  const coverPages = a.cover ? 2 : 0;
  if (a.cover) {
    const [c] = await book.copyPages(a.cover, [0]);
    book.addPage(c!);
    book.addPage([PAGE.width * MM_PT, PAGE.height * MM_PT]);
  }
  const fp = await book.copyPages(a.front, a.front.getPageIndices());
  fp.forEach((p) => book.addPage(p));
  const frontPages = a.front.getPageCount();
  const range = a.range;
  const mainIdx = range
    ? Array.from({ length: range[1] - range[0] }, (_, i) => range[0] + i)
    : a.main.getPageIndices();
  const mp = await book.copyPages(a.main, mainIdx);
  mp.forEach((p) => book.addPage(p));
  if (a.padTo) {
    while (book.getPageCount() % a.padTo)
      book.addPage([PAGE.width * MM_PT, PAGE.height * MM_PT]);
  }
  let backIndex = -1;
  if (a.back) {
    // At least one blank (inside back cover), then the back cover on an
    // even page so it closes the book as a verso in two-page view.
    book.addPage([PAGE.width * MM_PT, PAGE.height * MM_PT]);
    if (book.getPageCount() % 2 === 0)
      book.addPage([PAGE.width * MM_PT, PAGE.height * MM_PT]);
    const [bp] = await book.copyPages(a.back, [0]);
    book.addPage(bp!);
    backIndex = book.getPageCount() - 1;
  }
  const offset = coverPages + frontPages - (range ? range[0] : 0);
  const inRange = a.headings.filter(
    (h) => !range || ((h.page ?? 0) >= range[0] && (h.page ?? 0) < range[1]),
  );
  const frontOutline = readOutline(a.front)
    .filter((o) => o.title && o.page >= 0)
    .map((o) => ({ title: o.title, page: o.page + coverPages }));
  buildOutline(book, inRange, frontOutline, offset);
  const labels: Parameters<typeof setPageLabels>[1] = [];
  if (coverPages) labels.push({ from: 0, prefix: "封面" });
  labels.push({ from: coverPages, roman: true });
  labels.push({
    from: coverPages + frontPages,
    arabicStart: range ? range[0] + 1 : 1,
  });
  if (backIndex >= 0) labels.push({ from: backIndex, prefix: "封底" });
  setPageLabels(book, labels);
  const targets = new Map<string, number>();
  for (const h of inRange) targets.set(h.id, (h.page ?? 0) + offset);
  for (const f of a.figures) {
    const h = inRange.find((x) => x.id === f.headingId);
    if (h) targets.set(`fig-${f.id}`, (h.page ?? 0) + offset);
  }
  const links = relinkContents(book, targets);
  // Print geometry: the interior has no bleed, so trim = bleed = media box.
  for (const p of book.getPages()) {
    const { width, height } = p.getSize();
    p.setTrimBox(0, 0, width, height);
    p.setBleedBox(0, 0, width, height);
  }
  book.setTitle(a.title);
  book.setSubject(a.subject);
  book.setAuthor(BOOK.authors.replace(/\u3000編著$/, ""));
  book.setKeywords([...BOOK.keywords]);
  book.setCreator("lc-rating scripts/book/buildLectureBook.ts");
  book.setProducer("Chromium + pdf-lib");
  book.setLanguage(BOOK.lang);
  fs.writeFileSync(a.outFile, await book.save());
  log(
    `wrote ${path.relative(process.cwd(), a.outFile)} (${book.getPageCount()} pages, ${links} contents links)`,
  );
  return book.getPageCount();
}

function warnUnusedFigures(builder: BookBuilder, only: string[] | null) {
  const unused = ALL_FIGURES.filter(
    (f) => !builder.figureUse.has(f.id) && (!only || only.includes(f.category)),
  );
  return unused;
}

function hasGhostscript(): boolean {
  try {
    execFileSync("gs", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert to CMYK with Ghostscript (text and vectors stay vectors; fonts stay
 * embedded), then restore the trim / bleed boxes on every page.
 */
async function toCmyk(
  input: string,
  output: string,
  boxes: {
    trim: [number, number, number, number];
    bleed: [number, number, number, number];
  } | null,
) {
  execFileSync(
    "gs",
    [
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-dQUIET",
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.6",
      "-sColorConversionStrategy=CMYK",
      "-sProcessColorModel=DeviceCMYK",
      "-dEmbedAllFonts=true",
      "-dSubsetFonts=true",
      "-dAutoRotatePages=/None",
      "-dDownsampleColorImages=false",
      `-sOutputFile=${output}`,
      input,
    ],
    { stdio: "inherit" },
  );
  const doc = await PDFDocument.load(fs.readFileSync(output));
  for (const p of doc.getPages()) {
    const { width, height } = p.getSize();
    const t = boxes?.trim ?? [0, 0, width, height];
    const b = boxes?.bleed ?? [0, 0, width, height];
    p.setTrimBox(...t);
    p.setBleedBox(...b);
  }
  fs.writeFileSync(output, await doc.save());
}

async function buildTopicEdition(browser: Browser, opts: Options, log: Log) {
  const outDir = path.dirname(opts.out);
  const today = new Date().toISOString().slice(0, 10);
  const { chapters, parts } = loadChapters(opts.chapters);
  const builder = new BookBuilder(chapters, parts);
  const mainPath = path.join(outDir, "main.html");
  const { doc } = await paginate(browser, builder, mainPath, log);
  const unused = warnUnusedFigures(builder, opts.chapters);
  if (unused.length)
    console.warn(
      `[book] figures with no matching section: ${unused.map((f) => `${f.id} (${f.category} / ${f.section})`).join(", ")}`,
    );
  const figureTotal = builder.figures.length + 1;
  const secCount = builder.headings.filter((h) => h.level >= 2).length;
  const frontDoc = await printFront(
    browser,
    halfTitleHtml(null) +
      copyrightHtml(today, null) +
      topicPrefaceHtml(chapters, secCount, figureTotal) +
      tocHtml(builder.headings, builder.figures),
    path.join(outDir, "front.html"),
    null,
  );
  log(`front matter: ${frontDoc.getPageCount()} pages`);
  const coverDoc = await svgPage(
    browser,
    coverSvg(),
    path.join(outDir, "cover.html"),
  );
  const back: BackCoverContent = {
    heading: "本書內容",
    blurb: [...TOPIC_BACK.blurb],
    stats: {
      chapters: chapters.map((c) => c.title),
      sections: secCount,
      figures: figureTotal,
      problems: builder.problems.size,
      pages: interiorPages(frontDoc, doc),
    },
    series: null,
    outline: {
      label: "全書四篇",
      rows: parts.map((p) => {
        const [a = "", b = p.title] = p.title.split("\u3000");
        return [a, b];
      }),
    },
    barcode: false,
    site: BOOK.site,
  };
  const backDoc = await svgPage(
    browser,
    backCoverSvg(TOPIC_BACK.theme, back),
    path.join(outDir, "back.html"),
  );
  const common = {
    subject: BOOK.subtitle,
    cover: coverDoc,
    back: backDoc,
    front: frontDoc,
    main: doc,
    headings: builder.headings,
    figures: builder.figures,
  };
  await assemble(
    { ...common, outFile: opts.out, title: `${BOOK.title}：${BOOK.subtitle}` },
    log,
  );
  if (opts.volumes) {
    const partHeads = builder.headings.filter((h) => h.level === 0);
    for (let i = 0; i < partHeads.length; i++) {
      const start = partHeads[i]!.page ?? 0;
      const end = partHeads[i + 1]?.page ?? doc.getPageCount();
      await assemble(
        {
          ...common,
          outFile: opts.out.replace(/\.pdf$/, `-vol${i + 1}.pdf`),
          title: `${BOOK.title}（${partHeads[i]!.num}\u3000${partHeads[i]!.title}）`,
          range: [start, end],
        },
        log,
      );
    }
  }
  if (!opts.keepHtml)
    for (const f of ["main.html", "front.html", "cover.html", "back.html"])
      fs.rmSync(path.join(outDir, f), { force: true });
}

async function buildDifficultyEdition(
  browser: Browser,
  opts: Options,
  log: Log,
) {
  const outDir = path.dirname(opts.out);
  const today = new Date().toISOString().slice(0, 10);
  const series = seriesContext(opts.chapters);
  const used = new Set<string>();
  const gs = opts.print && hasGhostscript();
  if (opts.print && !gs)
    console.warn("[book] Ghostscript (gs) not found: skipping CMYK conversion");
  for (const level of opts.levels) {
    const volume = VOLUMES[level];
    const vlog: Log = (m) => log(`[${volume.slug}] ${m}`);
    const { chapters, parts } = loadChapters(opts.chapters, level);
    const builder = new BookBuilder(chapters, parts, volume, series);
    const base = path.join(outDir, `lc-lecture-${volume.slug}`);
    const mainPath = `${base}-main.html`;
    const { doc } = await paginate(browser, builder, mainPath, vlog);
    for (const id of builder.figureUse.keys()) used.add(id);
    const figureTotal = builder.figures.length + 2;
    const frontDoc = await printFront(
      browser,
      halfTitleHtml(volume) +
        copyrightHtml(today, volume) +
        volumeGuideHtml(volume, chapters, series, figureTotal) +
        tocHtml(builder.headings, builder.figures),
      `${base}-front.html`,
      volume,
    );
    vlog(`front matter: ${frontDoc.getPageCount()} pages`);
    const coverDoc = await svgPage(
      browser,
      frontCoverSvg(level, BOOK.title, BOOK.authors),
      `${base}-cover.html`,
    );
    const stats: CoverStats = {
      chapters: chapters.map((c) => c.title),
      sections: series.sectionCounts[level],
      figures: figureTotal,
      problems: builder.problems.size,
      pages: interiorPages(frontDoc, doc),
    };
    const backDoc = await svgPage(
      browser,
      backCoverSvg(volume, {
        heading: `${volume.name}\u3000本冊內容`,
        blurb: volume.blurb,
        stats,
        series: level,
        barcode: false,
        site: BOOK.site,
      }),
      `${base}-back.html`,
    );
    const title = `${BOOK.title}（${volume.ordinal}・${volume.name}）`;
    const common = {
      title,
      subject: `${BOOK.subtitle}｜${volume.ratingRange}`,
      front: frontDoc,
      main: doc,
      headings: builder.headings,
      figures: builder.figures,
    };
    await assemble(
      { ...common, outFile: `${base}.pdf`, cover: coverDoc, back: backDoc },
      vlog,
    );

    if (opts.print) {
      const interior = `${base}-print-interior.pdf`;
      const pages = await assemble(
        { ...common, outFile: interior, cover: null, padTo: PRINT.padPagesTo },
        vlog,
      );
      const spineMm =
        Math.round((pages / 2) * PRINT.leafThicknessMm * 10) / 10 +
        PRINT.spineAllowanceMm;
      if (pages !== stats.pages)
        throw new Error(`interior has ${pages} pages, expected ${stats.pages}`);
      const spread = coverSpreadSvg(
        level,
        BOOK.title,
        BOOK.authors,
        spineMm,
        PRINT.bleedMm,
        stats,
        volume.blurb,
      );
      const coverFile = `${base}-print-cover.pdf`;
      const spreadDoc = await PDFDocument.load(
        await printPdf(
          browser,
          coverHtml(spread.svg, spread.widthMm, spread.heightMm),
          `${base}-spread.html`,
        ),
      );
      // Boxes from the printed media box (Chromium rounds the page size).
      const page = spreadDoc.getPage(0);
      const { width: pw, height: ph } = page.getSize();
      const b = PRINT.bleedMm * MM_PT;
      const trim: [number, number, number, number] = [
        b,
        b,
        pw - 2 * b,
        ph - 2 * b,
      ];
      const bleed: [number, number, number, number] = [0, 0, pw, ph];
      page.setTrimBox(...trim);
      page.setBleedBox(...bleed);
      spreadDoc.setTitle(`${title}\u3000封面（含書背與出血）`);
      fs.writeFileSync(coverFile, await spreadDoc.save());
      vlog(
        `wrote ${path.relative(process.cwd(), coverFile)} (${spread.widthMm.toFixed(1)} × ${spread.heightMm.toFixed(1)} mm, spine ${spineMm} mm)`,
      );
      const outputs = [interior, coverFile];
      if (gs) {
        const ci = interior.replace(/\.pdf$/, "-cmyk.pdf");
        const cc = coverFile.replace(/\.pdf$/, "-cmyk.pdf");
        await toCmyk(interior, ci, null);
        await toCmyk(coverFile, cc, { trim, bleed });
        outputs.push(ci, cc);
        vlog(`wrote CMYK versions`);
      }
      const spec = [
        `${title}\u3000印刷規格`,
        ``,
        `成品尺寸（裁切後）：${PAGE.width} × ${PAGE.height} mm（16 開），內頁不出血`,
        `內頁：${pages} 頁（已補足為 ${PRINT.padPagesTo} 的倍數），四色印刷，字型完整嵌入`,
        `內頁版心：上 ${PAGE.top} mm、下 ${PAGE.bottom} mm、內側 ${PAGE.inner} mm、外側 ${PAGE.outer} mm`,
        `封面展開：${spread.widthMm.toFixed(1)} × ${spread.heightMm.toFixed(1)} mm（封底 ${PAGE.width} + 書背 ${spineMm} + 封面 ${PAGE.width}，四邊出血 ${PRINT.bleedMm} mm）`,
        `書背寬度依每張紙 ${PRINT.leafThicknessMm} mm（約 80 g 道林紙）估算，另加 ${PRINT.spineAllowanceMm} mm 膠裝餘量；換紙時請依印刷廠提供的紙厚重算（config.ts 的 PRINT）。`,
        `PDF 已設定 TrimBox 與 BleedBox。`,
        gs
          ? `色彩：*-cmyk.pdf 為 Ghostscript 轉換的 CMYK 版本（未嵌入特定 ICC 輸出意圖）；若印刷廠指定 PDF/X-1a 或特定色彩描述檔，請以其設定重新轉檔。`
          : `色彩：RGB（未安裝 Ghostscript，未產生 CMYK 版本）。`,
        `ISBN 與條碼：封底右下保留白色條碼區（50 × 32 mm），版權頁 ISBN 欄待出版社填入。`,
        ``,
        `檔案：`,
        ...outputs.map((f) => `  ${path.basename(f)}`),
      ].join("\n");
      fs.writeFileSync(`${base}-print-spec.txt`, spec + "\n");
      vlog(`wrote ${path.basename(base)}-print-spec.txt`);
      if (!opts.keepHtml) fs.rmSync(`${base}-spread.html`, { force: true });
    }
    if (!opts.keepHtml)
      for (const f of ["main", "front", "cover", "back"])
        fs.rmSync(`${base}-${f}.html`, { force: true });
  }
  if (opts.levels.length === LEVELS.length) {
    const unused = ALL_FIGURES.filter(
      (f) =>
        !used.has(f.id) &&
        (!opts.chapters || opts.chapters.includes(f.category)),
    );
    if (unused.length)
      console.warn(
        `[book] figures with no matching section: ${unused.map((f) => `${f.id} (${f.category} / ${f.section})`).join(", ")}`,
      );
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  const executablePath = findChrome(opts.chrome);
  const browser = await chromium.launch({ executablePath });
  const t0 = Date.now();
  const log: Log = (msg) =>
    console.log(`[book ${((Date.now() - t0) / 1000).toFixed(0)}s] ${msg}`);
  try {
    if (opts.difficulty) await buildDifficultyEdition(browser, opts, log);
    else await buildTopicEdition(browser, opts, log);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
