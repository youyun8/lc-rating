import type { BookFigure } from "./types";
import { part1Figures } from "./part1";
import { part2Figures } from "./part2";
import { part3Figures } from "./part3";
import { part4Figures } from "./part4";
import { part5Figures } from "./part5";
import { part6Figures } from "./part6";
import { C, box, line, measure, rect, svg, text } from "./svg";

export const ALL_FIGURES: BookFigure[] = [
  ...part1Figures,
  ...part2Figures,
  ...part3Figures,
  ...part4Figures,
  ...part5Figures,
  ...part6Figures,
];

export interface ChapterMapItem {
  num: string;
  title: string;
  childCount: number;
  optional: boolean;
}

/** Chapter opener "map": every top-level section as a numbered card. */
export function chapterMap(items: ChapterMapItem[]): string {
  const cols = items.length > 12 ? 3 : 2;
  const W = 600;
  const gap = 10;
  const cw = (W - gap * (cols - 1)) / cols;
  const ch = 30;
  const rows = Math.ceil(items.length / cols);
  let body = "";
  items.forEach((it, i) => {
    // Column-major so the reading order runs down each column.
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = col * (cw + gap);
    const y = row * (ch + 7);
    const fill = it.optional ? C.gray : C.blueSoft;
    body += rect(x, y, cw, ch, {
      fill,
      stroke: it.optional ? C.line : C.blueMid,
      rx: 4,
      sw: 1,
    });
    body += rect(x, y, 34, ch, {
      fill: it.optional ? C.line : C.blue,
      stroke: "none",
      rx: 4,
    });
    body += rect(x + 30, y, 4, ch, {
      fill: it.optional ? C.line : C.blue,
      stroke: "none",
    });
    body += text(x + 17, y + ch / 2 + 1, it.num, {
      size: 11,
      fill: C.paper,
      weight: "bold",
      mono: true,
    });
    const maxChars = cw - 48 - (it.childCount ? 34 : 0);
    let label = it.title;
    while (measure(label, 12) > maxChars && label.length > 2)
      label = label.slice(0, -2) + "…";
    body += text(x + 42, y + ch / 2 + 1, label, { anchor: "start", size: 12 });
    if (it.childCount) {
      body += text(x + cw - 8, y + ch / 2 + 1, `${it.childCount} 節`, {
        anchor: "end",
        size: 10,
        fill: C.muted,
      });
    }
  });
  return svg(W, rows * (ch + 7), body);
}

/** Preface figure: the fixed 15-heading skeleton every section follows. */
export function skeletonFigure(): string {
  const steps: [string, string, boolean][] = [
    ["這個技術解決什麼問題", "暴力為何不夠", false],
    ["辨識題型的訊號", "看到什麼就該想到它", false],
    ["核心想法與直覺", "本書圖解多半放在這裡", false],
    ["狀態／資料結構定義", "變數與區間語意", false],
    ["不變量或正確性證明", "全節最重要的一段", true],
    ["逐步演算法", "", false],
    ["C++17 模板", "", false],
    ["程式碼拆解", "", false],
    ["時間與空間複雜度", "含推導理由", false],
    ["常見錯誤與邊界條件", "一個坑一條", false],
    ["常見變形", "", false],
    ["與相似技巧的比較", "", false],
    ["代表例題", "", false],
    ["例題與分級練習", "依難度分數排序", false],
    ["本節重點速查", "複習時先讀這裡", true],
  ];
  const groups: [number, number, string, string][] = [
    [0, 2, "① 認識問題", C.blueSoft],
    [3, 5, "② 建立正確性", C.orangeSoft],
    [6, 8, "③ 實作與分析", C.greenSoft],
    [9, 12, "④ 避坑與遷移", C.purpleSoft],
    [13, 14, "⑤ 練習與複習", C.yellowSoft],
  ];
  const rowH = 27;
  const x0 = 130;
  let body = "";
  for (const [a, b, label, fill] of groups) {
    const y1 = 10 + a * rowH;
    const y2 = 10 + (b + 1) * rowH - 5;
    body += rect(0, y1, 118, y2 - y1, { fill, stroke: "none", rx: 5 });
    body += text(59, (y1 + y2) / 2, label, { size: 12, weight: "bold" });
  }
  steps.forEach(([title, note, key], i) => {
    const y = 10 + i * rowH;
    body += box(x0, y, 250, rowH - 5, `${i + 1}. ${title}`, {
      size: 12,
      fill: key ? C.ink : C.paper,
      color: key ? C.paper : C.ink,
      stroke: C.ink,
      sw: 1,
      rx: 3,
      weight: key ? "bold" : undefined,
    });
    if (i < steps.length - 1)
      body += line(x0 + 125, y + rowH - 5, x0 + 125, y + rowH, {
        stroke: C.line,
        sw: 1,
      });
    if (note)
      body += text(x0 + 262, y + (rowH - 5) / 2, note, {
        anchor: "start",
        size: 11,
        fill: C.muted,
      });
  });
  return svg(560, 10 + steps.length * rowH, body);
}
