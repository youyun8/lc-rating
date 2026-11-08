/**
 * PDF plumbing shared by the book builders: print HTML with Chromium, read
 * the outline back, rebuild bookmarks, page labels and internal links.
 */
import fs from "node:fs";
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
import type { Browser } from "playwright-core";

function fileUrl(p: string) {
  return pathToFileURL(p).href;
}

export async function printPdf(
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

export function decodePdfText(obj: PDFObject | undefined): string {
  if (obj instanceof PDFString || obj instanceof PDFHexString)
    return obj.decodeText();
  return "";
}

/** Flatten the Chromium-generated outline into [title, pageIndex] in document order. */
export function readOutline(
  doc: PDFDocument,
): { title: string; page: number }[] {
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

export function assignPages(
  headings: { page?: number }[],
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

export function buildOutline(
  doc: PDFDocument,
  headings: { level: number; num: string; title: string; page?: number }[],
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

/**
 * Page labels: `ranges` lists [first page index, style] in order. Style is
 * "r" (lower roman), "D" (arabic, with optional start) or a fixed prefix.
 */
export function setPageLabels(
  doc: PDFDocument,
  ranges: {
    from: number;
    roman?: boolean;
    arabicStart?: number;
    prefix?: string;
  }[],
) {
  const ctx = doc.context;
  const nums: (number | PDFDict)[] = [];
  for (const r of ranges) {
    const d = ctx.obj({}) as PDFDict;
    if (r.prefix !== undefined)
      d.set(PDFName.of("P"), PDFHexString.fromText(r.prefix));
    else if (r.roman) d.set(PDFName.of("S"), PDFName.of("r"));
    else {
      d.set(PDFName.of("S"), PDFName.of("D"));
      if (r.arabicStart && r.arabicStart !== 1)
        d.set(PDFName.of("St"), PDFNumber.of(r.arabicStart));
    }
    nums.push(r.from, d);
  }
  doc.catalog.set(PDFName.of("PageLabels"), ctx.obj({ Nums: nums }));
}

/** Rewrite the `https://book.invalid/#id` links from the contents pages into internal GoTo links. */
export function relinkContents(doc: PDFDocument, targets: Map<string, number>) {
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
