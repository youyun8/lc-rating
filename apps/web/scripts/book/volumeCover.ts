/**
 * Covers for the difficulty edition.
 *
 * Coordinates are in cover units (1 unit = 0.25 mm), so the 185 × 260 mm
 * front cover is 740 × 1040 units. Each volume gets its own palette and a
 * motif drawn from an algorithm that volume teaches, computed rather than
 * hand-placed:
 *
 *   簡單篇  相向雙指標在有序陣列上找兩數之和
 *   中等篇  BFS 從起點一層一層向外擴展
 *   困難篇  線段樹回答區間和查詢時拆出的節點
 *
 * `frontCoverSvg` is the reading-edition cover (trim size, no bleed);
 * `coverSpreadSvg` is the print cover: back + spine + front with bleed.
 */
import { PAGE } from "./config";
import { LEVELS, VOLUMES, type Level, type VolumeInfo } from "./difficulty";
import { FONT_MONO, FONT_SANS, esc, measure } from "./figures/svg";

export const U = 4; // units per mm
const FW = PAGE.width * U;
const FH = PAGE.height * U;

export interface CoverStats {
  chapters: string[];
  sections: number;
  figures: number;
  problems: number;
  pages: number;
}

interface TextOpt {
  size: number;
  fill: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  spacing?: number;
  opacity?: number;
}

function t(x: number, y: number, s: string | number, o: TextOpt): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${o.mono ? FONT_MONO : FONT_SANS}" font-size="${o.size}" fill="${o.fill}"${o.weight ? ` font-weight="${o.weight}"` : ""}${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.spacing ? ` letter-spacing="${o.spacing}"` : ""}${o.opacity !== undefined ? ` opacity="${o.opacity}"` : ""}>${esc(s)}</text>`;
}

/** Greedy line wrap by estimated glyph width (CJK ≈ 1em). */
export function wrap(s: string, maxW: number, size: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of s) {
    if (measure(cur + ch, size) > maxW && cur) {
      // Do not start a line with closing punctuation.
      if (/[，。、；：）」』！？]/.test(ch)) {
        cur += ch;
        lines.push(cur);
        cur = "";
        continue;
      }
      lines.push(cur);
      cur = "";
    }
    cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

function defs(v: VolumeInfo, id: string): string {
  return `<defs>
<linearGradient id="${id}-bg" x1="0" y1="0" x2="0.35" y2="1">
  <stop offset="0" stop-color="${v.coverDark}"/>
  <stop offset="0.62" stop-color="${v.coverMid}"/>
  <stop offset="1" stop-color="${v.coverDark}"/>
</linearGradient>
<radialGradient id="${id}-halo" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="${v.coverGlow}" stop-opacity="0.32"/>
  <stop offset="0.55" stop-color="${v.coverGlow}" stop-opacity="0.08"/>
  <stop offset="1" stop-color="${v.coverGlow}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="${id}-bar" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${v.coverGlow}" stop-opacity="0.95"/>
  <stop offset="1" stop-color="${v.coverGlow}" stop-opacity="0.25"/>
</linearGradient>
</defs>`;
}

function dotGrid(x0: number, y0: number, w: number, h: number, color: string) {
  let out = "";
  for (let y = y0 + 18; y < y0 + h; y += 36)
    for (let x = x0 + 18; x < x0 + w; x += 36)
      out += `<circle cx="${x}" cy="${y}" r="1.6" fill="${color}" opacity="0.16"/>`;
  return out;
}

// ---------------------------------------------------------------------------
// Motifs (local coordinates: a 640 × 380 box)
// ---------------------------------------------------------------------------

function easyMotif(v: VolumeInfo, id: string): string {
  // Two pointers on a sorted array looking for a pair that sums to target.
  const a = [2, 3, 5, 7, 8, 11, 13, 16, 19, 22];
  const target = 26;
  const steps: [number, number][] = [];
  let l = 0;
  let r = a.length - 1;
  while (l < r) {
    steps.push([l, r]);
    const s = a[l]! + a[r]!;
    if (s === target) break;
    if (s > target) r--;
    else l++;
  }
  const [fl, fr] = steps[steps.length - 1]!;
  const cw = 60;
  const x0 = 20;
  const base = 300;
  let out = "";
  a.forEach((val, i) => {
    const h = 30 + val * 10;
    const hit = i === fl || i === fr;
    const visited = steps.some(([p, q]) => p === i || q === i);
    out += `<rect x="${x0 + i * cw + 8}" y="${base - h}" width="${cw - 16}" height="${h}" rx="6" fill="${hit ? `url(#${id}-bar)` : v.coverGlow}" opacity="${hit ? 1 : visited ? 0.32 : 0.16}"/>`;
    out += `<rect x="${x0 + i * cw + 2}" y="${base + 12}" width="${cw - 4}" height="${cw - 4}" rx="6" fill="${hit ? v.coverGlow : "none"}" fill-opacity="${hit ? 0.22 : 0}" stroke="${v.coverGlow}" stroke-opacity="${hit ? 1 : 0.45}" stroke-width="2"/>`;
    out += t(x0 + i * cw + cw / 2, base + 12 + cw / 2 + 8, val, {
      size: 22,
      fill: "#ffffff",
      anchor: "middle",
      mono: true,
      opacity: hit ? 1 : 0.7,
      weight: hit ? 700 : 400,
    });
  });
  const px = (i: number) => x0 + i * cw + cw / 2;
  // Pointer trails: every position l and r visited, fading with age.
  steps.forEach(([p, q], k) => {
    const op = 0.25 + (0.75 * (k + 1)) / steps.length;
    out += `<circle cx="${px(p)}" cy="${base + 96}" r="5" fill="${v.coverGlow}" opacity="${op}"/>`;
    out += `<circle cx="${px(q)}" cy="${base + 96}" r="5" fill="${v.coverGlow}" opacity="${op}"/>`;
  });
  out += `<path d="M${px(0)},${base + 96} L${px(fl) - 14},${base + 96}" stroke="${v.coverGlow}" stroke-width="2.5" opacity="0.7"/>`;
  out += `<path d="M${px(a.length - 1)},${base + 96} L${px(fr) + 14},${base + 96}" stroke="${v.coverGlow}" stroke-width="2.5" opacity="0.7"/>`;
  out += `<path d="M${px(fl) - 16},${base + 86} l14,10 l-14,10 z" fill="${v.coverGlow}"/>`;
  out += `<path d="M${px(fr) + 16},${base + 86} l-14,10 l14,10 z" fill="${v.coverGlow}"/>`;
  out += t(px(fl), base + 130, "l", {
    size: 22,
    fill: v.coverGlow,
    anchor: "middle",
    mono: true,
    weight: 700,
  });
  out += t(px(fr), base + 130, "r", {
    size: 22,
    fill: v.coverGlow,
    anchor: "middle",
    mono: true,
    weight: 700,
  });
  out += t(20, 40, `a[l] + a[r] = ${a[fl]! + a[fr]!}`, {
    size: 22,
    fill: "#ffffff",
    anchor: "start",
    mono: true,
    opacity: 0.85,
  });
  return out;
}

function mediumMotif(v: VolumeInfo): string {
  // BFS layers on a small fixed graph; distances come from running BFS.
  const nodes: [number, number][] = [
    [90, 200], // 0 source
    [210, 110],
    [220, 210],
    [200, 310],
    [340, 70],
    [350, 160],
    [345, 255],
    [330, 340],
    [470, 110],
    [480, 205],
    [470, 300],
    [600, 160],
    [590, 260],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [2, 6],
    [3, 6],
    [3, 7],
    [4, 8],
    [5, 8],
    [5, 9],
    [6, 9],
    [6, 10],
    [7, 10],
    [8, 11],
    [9, 11],
    [9, 12],
    [10, 12],
    [4, 5],
    [6, 7],
  ];
  const adj = nodes.map(() => [] as number[]);
  for (const [a, b] of edges) {
    adj[a]!.push(b);
    adj[b]!.push(a);
  }
  const dist = nodes.map(() => -1);
  const parent = nodes.map(() => -1);
  dist[0] = 0;
  const q = [0];
  for (let h = 0; h < q.length; h++) {
    const u = q[h]!;
    for (const w of adj[u]!) {
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1;
        parent[w] = u;
        q.push(w);
      }
    }
  }
  const maxD = Math.max(...dist);
  let out = "";
  // Wavefront arcs centred on the source.
  for (let d = 1; d <= maxD; d++) {
    const r = 128 * d - 6;
    out += `<circle cx="${nodes[0]![0]}" cy="${nodes[0]![1]}" r="${r}" fill="none" stroke="${v.coverGlow}" stroke-width="1.5" stroke-dasharray="3 9" opacity="${0.55 - d * 0.1}"/>`;
  }
  for (const [a, b] of edges) {
    const tree = parent[b] === a || parent[a] === b;
    const [x1, y1] = nodes[a]!;
    const [x2, y2] = nodes[b]!;
    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${v.coverGlow}" stroke-width="${tree ? 3.2 : 1.4}" opacity="${tree ? 0.9 : 0.3}"/>`;
  }
  nodes.forEach(([x, y], i) => {
    const d = dist[i]!;
    const op = 1 - d * 0.12;
    out += `<circle cx="${x}" cy="${y}" r="${i === 0 ? 24 : 18}" fill="${i === 0 ? v.coverGlow : v.coverDark}" stroke="${v.coverGlow}" stroke-width="2.5" opacity="${op}"/>`;
    out += t(x, y + 7, d, {
      size: i === 0 ? 22 : 18,
      fill: i === 0 ? v.coverDark : "#ffffff",
      anchor: "middle",
      mono: true,
      weight: 700,
    });
  });
  return out;
}

function hardMotif(v: VolumeInfo): string {
  // Segment tree over 8 values; highlight the nodes that answer sum[2, 6].
  const a = [5, 8, 6, 3, 2, 7, 2, 6];
  const n = a.length;
  const tree = Array<number>(4 * n).fill(0);
  const build = (o: number, l: number, r: number) => {
    if (l === r) {
      tree[o] = a[l]!;
      return;
    }
    const m = (l + r) >> 1;
    build(2 * o, l, m);
    build(2 * o + 1, m + 1, r);
    tree[o] = tree[2 * o]! + tree[2 * o + 1]!;
  };
  build(1, 0, n - 1);
  const [ql, qr] = [2, 6];
  const used = new Set<number>();
  const visited = new Set<number>();
  const query = (o: number, l: number, r: number): number => {
    visited.add(o);
    if (ql <= l && r <= qr) {
      used.add(o);
      return tree[o]!;
    }
    const m = (l + r) >> 1;
    let s = 0;
    if (ql <= m) s += query(2 * o, l, m);
    if (qr > m) s += query(2 * o + 1, m + 1, r);
    return s;
  };
  const total = query(1, 0, n - 1);
  let out = "";
  const cell = 76;
  const x0 = 16;
  const levelY = [20, 110, 200, 290];
  const draw = (o: number, l: number, r: number, depth: number) => {
    const x = x0 + l * cell + 4;
    const w = (r - l + 1) * cell - 8;
    const y = levelY[depth]!;
    const hot = used.has(o);
    const seen = visited.has(o);
    if (l !== r) {
      const m = (l + r) >> 1;
      for (const [cl, cr] of [
        [l, m],
        [m + 1, r],
      ] as const) {
        const cx = x0 + ((cl + cr + 1) / 2) * cell;
        out += `<line x1="${x + w / 2}" y1="${y + 56}" x2="${cx}" y2="${levelY[depth + 1]!}" stroke="${v.coverGlow}" stroke-width="1.6" opacity="0.35"/>`;
      }
    }
    out += `<rect x="${x}" y="${y}" width="${w}" height="56" rx="8" fill="${hot ? v.coverGlow : "none"}" fill-opacity="${hot ? 0.9 : 0}" stroke="${v.coverGlow}" stroke-width="${hot ? 3 : 1.6}" stroke-opacity="${hot ? 1 : seen ? 0.75 : 0.35}"/>`;
    out += t(x + w / 2, y + 37, tree[o]!, {
      size: 24,
      fill: hot ? v.coverDark : "#ffffff",
      anchor: "middle",
      mono: true,
      weight: 700,
      opacity: hot ? 1 : seen ? 0.9 : 0.55,
    });
    if (l !== r) {
      const m = (l + r) >> 1;
      draw(2 * o, l, m, depth + 1);
      draw(2 * o + 1, m + 1, r, depth + 1);
    }
  };
  draw(1, 0, n - 1, 0);
  out += `<path d="M${x0 + ql * cell + 4},372 L${x0 + ql * cell + 4},382 L${x0 + (qr + 1) * cell - 4},382 L${x0 + (qr + 1) * cell - 4},372" fill="none" stroke="${v.coverGlow}" stroke-width="2.5"/>`;
  out += t(
    x0 + ((ql + qr + 1) / 2) * cell,
    414,
    `sum[${ql}, ${qr}] = ${total}`,
    {
      size: 22,
      fill: "#ffffff",
      anchor: "middle",
      mono: true,
    },
  );
  return out;
}

function motif(v: VolumeInfo, id: string): string {
  if (v.level === "easy") return easyMotif(v, id);
  if (v.level === "medium") return mediumMotif(v);
  return hardMotif(v);
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

/** Difficulty meter: three rising bars, `filled` of them lit. */
function meter(x: number, y: number, filled: number, v: VolumeInfo): string {
  let out = "";
  for (let i = 0; i < 3; i++) {
    const h = 26 + i * 20;
    const on = i < filled;
    out += `<rect x="${x + i * 22}" y="${y - h}" width="14" height="${h}" rx="3" fill="${on ? v.coverGlow : "none"}" stroke="${v.coverGlow}" stroke-width="2" opacity="${on ? 1 : 0.5}"/>`;
  }
  return out;
}

/** Front cover content in local trim coordinates (0..FW, 0..FH). */
function frontPanel(
  v: VolumeInfo,
  id: string,
  title: string,
  authors: string,
): string {
  const idx = LEVELS.indexOf(v.level);
  let out = "";
  out += `<circle cx="${FW * 0.62}" cy="${FH * 0.71}" r="${FW * 0.62}" fill="url(#${id}-halo)"/>`;
  // Series line.
  out += t(60, 86, "LEETCODE 分級講義", {
    size: 17,
    fill: v.coverGlow,
    spacing: 5,
    weight: 700,
  });
  out += t(60, 112, "C++17 技術面試\u3000三冊本", {
    size: 16,
    fill: "#ffffff",
    opacity: 0.72,
    spacing: 3,
  });
  out += meter(FW - 124, 112, idx + 1, v);
  out += `<line x1="60" y1="140" x2="${FW - 60}" y2="140" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/>`;
  // Title.
  out += t(56, 300, title, {
    size: 112,
    fill: "#ffffff",
    weight: 900,
    spacing: 8,
  });
  out += t(60, 400, v.name, {
    size: 74,
    fill: v.coverGlow,
    weight: 900,
    spacing: 6,
  });
  const nameW = measure(v.name, 74) + 3 * 6 + 40;
  out += `<rect x="${60 + nameW}" y="346" width="${measure(v.ordinal, 26) + 30}" height="44" rx="22" fill="none" stroke="${v.coverGlow}" stroke-width="2"/>`;
  out += t(60 + nameW + (measure(v.ordinal, 26) + 30) / 2, 377, v.ordinal, {
    size: 26,
    fill: v.coverGlow,
    anchor: "middle",
    weight: 700,
  });
  out += t(62, 446, v.english, {
    size: 20,
    fill: "#ffffff",
    opacity: 0.6,
    mono: true,
    spacing: 8,
  });
  out += `<rect x="60" y="476" width="96" height="7" rx="3.5" fill="${v.coverGlow}"/>`;
  wrap(v.tagline, FW - 130, 25).forEach((ln, i) => {
    out += t(60, 532 + i * 38, ln, {
      size: 25,
      fill: "#ffffff",
      opacity: 0.86,
    });
  });
  // Motif: a 640 × 420 local box, scaled and clipped to the band above the footer.
  const ms = 0.72;
  out += `<clipPath id="${id}-clip"><rect x="-20" y="-10" width="680" height="440"/></clipPath>`;
  out += `<g transform="translate(${((FW - 640 * ms) / 2).toFixed(1)}, 606) scale(${ms})"><g clip-path="url(#${id}-clip)">${motif(v, id)}</g></g>`;
  // Footer.
  out += t(60, FH - 92, `${v.ratingRange}・${v.contestSlot}`, {
    size: 18,
    fill: v.coverGlow,
    weight: 700,
    spacing: 1,
  });
  out += t(60, FH - 56, authors, { size: 22, fill: "#ffffff", opacity: 0.9 });
  // Series strip: the three volumes, this one lit.
  LEVELS.forEach((l, i) => {
    const sv = VOLUMES[l];
    const w = 56;
    const x = FW - 60 - (3 - i) * (w + 8) + 8;
    out += `<rect x="${x}" y="${FH - 78}" width="${w}" height="10" rx="5" fill="${l === v.level ? sv.coverGlow : "#ffffff"}" opacity="${l === v.level ? 1 : 0.22}"/>`;
  });
  return out;
}

/** Reading-edition front cover (trim size, no bleed). */
export function frontCoverSvg(
  level: Level,
  title: string,
  authors: string,
): string {
  const v = VOLUMES[level];
  const id = `cv-${level}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}" preserveAspectRatio="xMidYMid slice">${defs(v, id)}<rect width="${FW}" height="${FH}" fill="url(#${id}-bg)"/>${dotGrid(0, 0, FW, FH, v.coverGlow)}${frontPanel(v, id, title, authors)}</svg>`;
}

function backPanel(v: VolumeInfo, stats: CoverStats, blurb: string[]): string {
  let out = "";
  const x = 70;
  out += t(x, 120, `${v.name}\u3000本冊內容`, {
    size: 30,
    fill: "#ffffff",
    weight: 900,
  });
  out += `<rect x="${x}" y="142" width="72" height="6" rx="3" fill="${v.coverGlow}"/>`;
  let y = 206;
  for (const para of blurb) {
    for (const ln of wrap(para, FW - 2 * x, 21)) {
      out += t(x, y, ln, { size: 21, fill: "#ffffff", opacity: 0.88 });
      y += 34;
    }
    y += 16;
  }
  y += 6;
  out += t(x, y, "收錄主題", {
    size: 18,
    fill: v.coverGlow,
    weight: 700,
    spacing: 2,
  });
  y += 36;
  for (const ln of wrap(stats.chapters.join("・"), FW - 2 * x, 20)) {
    out += t(x, y, ln, { size: 20, fill: "#ffffff", opacity: 0.85 });
    y += 32;
  }
  // Stats row.
  const items: [string, string][] = [
    [String(stats.chapters.length), "章"],
    [String(stats.sections), "小節"],
    [String(stats.figures), "幅圖解"],
    [String(stats.problems), "道練習題"],
    [String(stats.pages), "頁"],
  ];
  const sy = Math.max(y + 40, 640);
  const cw = (FW - 2 * x) / items.length;
  items.forEach(([num, label], i) => {
    const cx = x + i * cw + cw / 2;
    out += t(cx, sy, num, {
      size: 40,
      fill: v.coverGlow,
      anchor: "middle",
      weight: 900,
      mono: true,
    });
    out += t(cx, sy + 30, label, {
      size: 17,
      fill: "#ffffff",
      anchor: "middle",
      opacity: 0.75,
    });
    if (i)
      out += `<line x1="${x + i * cw}" y1="${sy - 36}" x2="${x + i * cw}" y2="${sy + 34}" stroke="#ffffff" stroke-opacity="0.2"/>`;
  });
  // Series overview.
  const ty = sy + 96;
  out += t(x, ty, "全套三冊", {
    size: 18,
    fill: v.coverGlow,
    weight: 700,
    spacing: 2,
  });
  LEVELS.forEach((l, i) => {
    const sv = VOLUMES[l];
    const yy = ty + 40 + i * 40;
    const cur = l === v.level;
    out += `<rect x="${x}" y="${yy - 22}" width="10" height="28" rx="3" fill="${sv.coverGlow}" opacity="${cur ? 1 : 0.4}"/>`;
    out += t(x + 24, yy, `${sv.ordinal}\u3000${sv.name}`, {
      size: 20,
      fill: "#ffffff",
      weight: cur ? 700 : 400,
      opacity: cur ? 1 : 0.6,
    });
    out += t(x + 210, yy, sv.ratingRange, {
      size: 17,
      fill: "#ffffff",
      opacity: cur ? 0.9 : 0.5,
    });
  });
  // Audience + barcode area.
  out += t(x, FH - 120, "適讀對象", {
    size: 16,
    fill: v.coverGlow,
    weight: 700,
    spacing: 2,
  });
  out += t(x, FH - 88, "準備技術面試的 C++ 工程師", {
    size: 20,
    fill: "#ffffff",
    opacity: 0.9,
  });
  out += t(x, FH - 60, "需具備 C++ 基本語法與 STL 使用經驗", {
    size: 16,
    fill: "#ffffff",
    opacity: 0.6,
  });
  const bw = 200;
  const bh = 128;
  out += `<rect x="${FW - x - bw}" y="${FH - 70 - bh}" width="${bw}" height="${bh}" fill="#ffffff"/>`;
  out += t(FW - x - bw / 2, FH - 70 - bh / 2 + 6, "ISBN 條碼位置", {
    size: 15,
    fill: "#9aa5b1",
    anchor: "middle",
  });
  return out;
}

function spinePanel(
  v: VolumeInfo,
  w: number,
  h: number,
  title: string,
): string {
  let out = "";
  const cx = w / 2;
  const size = Math.max(14, Math.min(40, w * 0.52));
  const small = Math.max(11, Math.min(22, w * 0.3));
  let y = 70;
  if (w >= 40) {
    out += `<circle cx="${cx}" cy="${y}" r="${Math.min(26, w * 0.34)}" fill="${v.coverGlow}"/>`;
    out += t(cx, y + small * 0.36, v.mark, {
      size: small * 1.1,
      fill: v.coverDark,
      anchor: "middle",
      weight: 900,
    });
    y += 76;
  }
  for (const ch of title) {
    y += size * 1.12;
    out += t(cx, y, ch, {
      size,
      fill: "#ffffff",
      anchor: "middle",
      weight: 900,
    });
  }
  y += size * 0.7;
  for (const ch of v.name) {
    y += size * 1.12;
    out += t(cx, y, ch, {
      size,
      fill: v.coverGlow,
      anchor: "middle",
      weight: 900,
    });
  }
  y += size * 0.5;
  for (const ch of v.ordinal) {
    y += small * 1.2;
    out += t(cx, y, ch, {
      size: small,
      fill: "#ffffff",
      anchor: "middle",
      opacity: 0.75,
    });
  }
  let by = h - 70;
  const credit = "講義小組";
  for (const ch of [...credit].reverse()) {
    out += t(cx, by, ch, {
      size: small,
      fill: "#ffffff",
      anchor: "middle",
      opacity: 0.75,
    });
    by -= small * 1.2;
  }
  return out;
}

/**
 * Print cover spread: back cover, spine and front cover side by side, with
 * `bleedMm` of artwork beyond the trim on every outer edge. Returns the SVG
 * and its size in mm.
 */
export function coverSpreadSvg(
  level: Level,
  title: string,
  authors: string,
  spineMm: number,
  bleedMm: number,
  stats: CoverStats,
  blurb: string[],
): { svg: string; widthMm: number; heightMm: number } {
  const v = VOLUMES[level];
  const id = `sp-${level}`;
  const b = bleedMm * U;
  const s = spineMm * U;
  const W = 2 * FW + s + 2 * b;
  const H = FH + 2 * b;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W / U}mm" height="${H / U}mm">${defs(v, id)}`;
  out += `<rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>`;
  out += dotGrid(0, 0, W, H, v.coverGlow);
  // Back cover: a darker veil so the blurb reads well.
  out += `<rect x="0" y="0" width="${b + FW}" height="${H}" fill="${v.coverDark}" opacity="0.55"/>`;
  out += `<g transform="translate(${b}, ${b})">${backPanel(v, stats, blurb)}</g>`;
  // Spine.
  out += `<rect x="${b + FW}" y="0" width="${s}" height="${H}" fill="${v.coverDark}" opacity="0.85"/>`;
  out += `<g transform="translate(${b + FW}, ${b})">${spinePanel(v, s, FH, title)}</g>`;
  // Front cover.
  out += `<g transform="translate(${b + FW + s}, ${b})">${frontPanel(v, id, title, authors)}</g>`;
  out += `</svg>`;
  return { svg: out, widthMm: W / U, heightMm: H / U };
}
