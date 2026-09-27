/**
 * Figures for the mathematics and greedy chapters.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  axes,
  brace,
  circle,
  drawTree,
  grid,
  layoutTree,
  line,
  panelTitle,
  path,
  pointer,
  rect,
  svg,
  text,
  type TreeNode,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

function sieve(): string {
  const N = 60;
  const spf = new Array<number>(N + 1).fill(0);
  for (let i = 2; i <= N; i++) {
    if (at(spf, i)) continue;
    for (let j = i; j <= N; j += i) if (!at(spf, j)) spf[j] = i;
  }
  const color: Record<number, string> = {
    2: C.blueSoft,
    3: C.greenSoft,
    5: C.purpleSoft,
    7: C.yellowSoft,
  };
  const cols = 10;
  const cell = 40;
  const x0 = 30;
  const y0 = 20;
  let body = grid(x0, y0, 6, cols, {
    cell,
    label: (r, c) => r * cols + c + 1,
    fill: (r, c) => {
      const v = r * cols + c + 1;
      if (v < 2) return C.gray;
      if (at(spf, v) === v) return C.orangeSoft;
      return color[at(spf, v)] ?? C.gray;
    },
    bold: (r, c) => {
      const v = r * cols + c + 1;
      return v >= 2 && at(spf, v) === v;
    },
    size: 13,
  });
  const tx = x0 + cols * cell + 24;
  body += text(tx, y0 + 10, "橘色粗體：質數", {
    anchor: "start",
    size: 12,
    fill: C.orange,
    weight: "bold",
  });
  body += text(tx, y0 + 36, "其餘依「最小質因數」上色：", {
    anchor: "start",
    size: 12,
  });
  [
    [2, "藍：被 2 篩掉"],
    [3, "綠：被 3 篩掉"],
    [5, "紫：被 5 篩掉"],
    [7, "黃：被 7 篩掉"],
  ].forEach(([p, label], k) => {
    body += rect(tx, y0 + 52 + k * 22, 14, 14, {
      fill: color[p as number] ?? C.gray,
      stroke: C.ink,
      sw: 1,
    });
    body += text(tx + 20, y0 + 59 + k * 22, label as string, {
      anchor: "start",
      size: 12,
    });
  });
  body += text(tx, y0 + 160, "埃氏篩：從 p² 開始劃掉 p 的倍數，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, y0 + 182, "O(n log log n)。線性篩讓每個合數", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, y0 + 204, "只被最小質因數篩一次，O(n)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, y0 + 6 * cell + 14, body);
}

function factorTree(): string {
  const build = (n: number): TreeNode => {
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0)
        return {
          label: n,
          children: [{ label: p, fill: C.orangeSoft }, build(n / p)],
        };
    }
    return { label: n, fill: C.orangeSoft };
  };
  const placed = layoutTree(build(360), 50, 52, 40, 30);
  let body = drawTree(placed, { r: 17, size: 13 });
  const tx = 330;
  body += text(tx, 40, "360 = 2³ × 3² × 5", {
    anchor: "start",
    size: 15,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 72, "試除法：p 從 2 試到 √n，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 94, "能整除就一直除乾淨；", { anchor: "start", size: 12 });
  body += text(tx, 116, "最後剩下 > 1 的數本身是質數。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 146, "因數個數 = (3+1)(2+1)(1+1) = 24", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.blue,
  });
  body += text(tx, 168, "因數和 = (1+2+4+8)(1+3+9)(1+5)", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.blue,
  });
  body += text(tx, 196, "時間 O(√n)；多次查詢改用最小質因數篩，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 218, "每次 O(log n)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 330, body);
}

function divisorPairs(): string {
  const n = 24;
  const ds: number[] = [];
  for (let i = 1; i * i <= n; i++) if (n % i === 0) ds.push(i);
  const x0 = 40;
  const scale = 22;
  let body = line(x0, 90, x0 + n * scale + 16, 90, {
    stroke: C.line,
    arrow: "end",
    marker: "ah-muted",
  });
  const sq = Math.sqrt(n);
  body += line(x0 + sq * scale, 40, x0 + sq * scale, 140, {
    stroke: C.red,
    dash: "5 3",
    sw: 1.6,
  });
  body += text(x0 + sq * scale, 34, `√${n} ≈ ${sq.toFixed(1)}`, {
    size: 12,
    fill: C.red,
    weight: "bold",
  });
  ds.forEach((d, k) => {
    const e = n / d;
    body += circle(x0 + d * scale, 90, 8, { fill: C.blueSoft, stroke: C.blue });
    body += text(x0 + d * scale, 112, d, {
      size: 11,
      mono: true,
      fill: C.blue,
    });
    if (e !== d) {
      body += circle(x0 + e * scale, 90, 8, {
        fill: C.orangeSoft,
        stroke: C.orange,
      });
      body += text(x0 + e * scale, 112, e, {
        size: 11,
        mono: true,
        fill: C.orange,
      });
      body += path(
        `M${x0 + d * scale},${80} Q${x0 + ((d + e) / 2) * scale},${60 - k * 10 - (e - d) * 0.8} ${x0 + e * scale},${80}`,
        { stroke: C.muted, sw: 1 },
      );
    }
  });
  body += text(
    x0,
    160,
    `${n} 的因數成對出現：d 與 ${n}/d 一個 ≤ √${n}、一個 ≥ √${n}。只需枚舉 d ≤ √n，就能 O(√n) 找出全部因數。`,
    { anchor: "start", size: 12 },
  );
  return svg(640, 176, body);
}

function euclid(): string {
  const a0 = 30;
  const b0 = 12;
  const unit = 12;
  const x0 = 30;
  const y0 = 30;
  let body = rect(x0, y0, a0 * unit, b0 * unit, { stroke: C.ink, sw: 1.6 });
  // Tile with squares following the Euclidean algorithm.
  let x = x0;
  let y = y0;
  let w = a0;
  let h = b0;
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft];
  let step = 0;
  const steps: string[] = [];
  while (w > 0 && h > 0) {
    if (w >= h) {
      const k = Math.floor(w / h);
      steps.push(`gcd(${w}, ${h}) → ${w} = ${k}×${h} + ${w % h}`);
      for (let t = 0; t < k; t++) {
        body += rect(x + t * h * unit, y, h * unit, h * unit, {
          fill: at(fills, step % 3),
          stroke: C.ink,
          sw: 1,
        });
        body += text(
          x + t * h * unit + (h * unit) / 2,
          y + (h * unit) / 2,
          `${h}×${h}`,
          { size: 11, mono: true },
        );
      }
      x += k * h * unit;
      w -= k * h;
    } else {
      const k = Math.floor(h / w);
      steps.push(`gcd(${h}, ${w}) → ${h} = ${k}×${w} + ${h % w}`);
      for (let t = 0; t < k; t++) {
        body += rect(x, y + t * w * unit, w * unit, w * unit, {
          fill: at(fills, step % 3),
          stroke: C.ink,
          sw: 1,
        });
        body += text(
          x + (w * unit) / 2,
          y + t * w * unit + (w * unit) / 2,
          `${w}×${w}`,
          { size: 11, mono: true },
        );
      }
      y += k * w * unit;
      h -= k * w;
    }
    step++;
  }
  const tx = x0 + a0 * unit + 24;
  body += text(tx, y0 + 10, `${a0} × ${b0} 的長方形`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  steps.forEach(
    (s, k) =>
      (body += text(tx, y0 + 36 + k * 22, s, {
        anchor: "start",
        size: 12,
        mono: true,
      })),
  );
  body += text(
    tx,
    y0 + 36 + steps.length * 22 + 8,
    `能鋪滿的最大正方形邊長 = gcd = 6`,
    { anchor: "start", size: 12, fill: C.orange, weight: "bold" },
  );
  body += text(
    x0,
    y0 + b0 * unit + 26,
    "gcd(a, b) = gcd(b, a mod b)：不斷切下最大的正方形，剩下的長方形與原來有相同的公因數。",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    y0 + b0 * unit + 46,
    "每兩步 a 至少減半 → O(log min(a, b))。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(700, y0 + b0 * unit + 62, body);
}

function modClock(): string {
  const m = 7;
  const cx = 130;
  const cy = 130;
  const R = 90;
  let body = circle(cx, cy, R, { fill: "none", stroke: C.line });
  for (let k = 0; k < m; k++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * k) / m;
    const x = cx + R * Math.cos(ang);
    const y = cy + R * Math.sin(ang);
    const hot = k === 3;
    body += circle(x, y, 16, {
      fill: hot ? C.orangeSoft : C.blueSoft,
      stroke: hot ? C.orange : C.ink,
    });
    body += text(x, y + 1, k, {
      mono: true,
      size: 13,
      weight: hot ? "bold" : undefined,
    });
    const members = [k - 7, k, k + 7, k + 14].join(", ");
    const lx = cx + (R + 44) * Math.cos(ang);
    const ly = cy + (R + 30) * Math.sin(ang);
    if (hot)
      body += text(lx + 20, ly, `{…, ${members}, …}`, {
        size: 11,
        fill: C.orange,
        anchor: "start",
      });
  }
  const tx = 300;
  body += text(tx, 40, "模 7 的剩餘類：每個整數落在 7 個點之一。", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 66, "a ≡ b (mod m) ⇔ m | (a − b)", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 96, "加、減、乘都可以先取模再算：", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 118, "(a·b) mod m = (a mod m)(b mod m) mod m", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 148, "除法不行：要乘「模反元素」。", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, 170, "m 是質數時 a⁻¹ ≡ a^(m−2)（費馬小定理）。", {
    anchor: "start",
    size: 12,
    mono: false,
  });
  body += text(tx, 200, "常見用法：計數「和能被 k 整除的子陣列」", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 222, "→ 找字首和模 k 相同的點對。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 270, body);
}

function floorBlocks(): string {
  const n = 20;
  const vals = Array.from({ length: n }, (_, i) => Math.floor(n / (i + 1)));
  const x0 = 50;
  const y0 = 20;
  const bw = 26;
  const H = 180;
  let body = axes(x0, y0, n * bw + 20, H, { xLabel: "i", yLabel: `⌊${n}/i⌋` });
  const fills = [
    C.blueSoft,
    C.orangeSoft,
    C.greenSoft,
    C.purpleSoft,
    C.yellowSoft,
  ];
  let block = 0;
  let i = 1;
  const blocks: [number, number, number][] = [];
  while (i <= n) {
    const v = Math.floor(n / i);
    const j = Math.floor(n / v);
    blocks.push([i, j, v]);
    for (let t = i; t <= j; t++) {
      const h = (v / n) * (H - 30);
      body += rect(x0 + 4 + (t - 1) * bw, y0 + H - h, bw - 4, h, {
        fill: at(fills, block % fills.length),
        stroke: C.ink,
        sw: 0.8,
      });
    }
    block++;
    i = j + 1;
  }
  vals.forEach(
    (v, t) =>
      (body += text(x0 + 4 + t * bw + (bw - 4) / 2, y0 + H + 12, t + 1, {
        size: 10,
        mono: true,
        fill: C.muted,
      })),
  );
  blocks.forEach(([l, r, v]) => {
    const h = (v / n) * (H - 30);
    body += text(
      x0 + 4 + ((l - 1 + r) / 2) * bw + (bw - 4) / 2 - bw / 2 + bw / 2,
      y0 + H - h - 8,
      v,
      { size: 11, mono: true, weight: "bold" },
    );
  });
  body += text(
    x0,
    y0 + H + 36,
    `⌊${n}/i⌋ 只有 ${blocks.length} 種值（同色為一塊）。塊 [l, r] 的右端 r = ⌊n / ⌊n/l⌋⌋，所以可以一塊一塊跳。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    y0 + H + 56,
    "i ≤ √n 時每個 i 一塊；i > √n 時值 < √n → 總塊數 ≤ 2√n，Σ f(⌊n/i⌋) 可在 O(√n) 內算完。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y0 + H + 72, body);
}

function pascal(): string {
  const N = 7;
  const tri: number[][] = [];
  for (let n = 0; n < N; n++) {
    const row = [1];
    for (let k = 1; k < n; k++)
      row.push(at(at(tri, n - 1), k - 1) + at(at(tri, n - 1), k));
    if (n > 0) row.push(1);
    tri.push(row);
  }
  const cw = 46;
  const rh = 36;
  const cx = 230;
  let body = "";
  const hn = 5;
  const hk = 2;
  tri.forEach((row, n) => {
    row.forEach((v, k) => {
      const x = cx + (k - n / 2) * cw;
      const y = 30 + n * rh;
      const hot = n === hn && k === hk;
      const src = n === hn - 1 && (k === hk - 1 || k === hk);
      body += rect(x - 19, y - 14, 38, 28, {
        fill: hot ? C.orangeSoft : src ? C.blueSoft : C.paper,
        stroke: hot ? C.orange : C.line,
        rx: 14,
      });
      body += text(x, y + 1, v, {
        mono: true,
        size: 13,
        weight: hot ? "bold" : undefined,
      });
    });
    body += text(20, 30 + n * rh, `n=${n}`, {
      anchor: "start",
      size: 11,
      mono: true,
      fill: C.muted,
    });
  });
  const tx = 420;
  body += text(tx, 50, "C(n, k) = C(n−1, k−1) + C(n−1, k)", {
    anchor: "start",
    size: 12,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 76, `C(5,2) = C(4,1) + C(4,2) = 10`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
  });
  body += text(tx, 106, "組合意義：第 n 個元素選或不選。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 136, "n 很大且要取模時，改用", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 158, "C(n, k) = n! / (k!(n−k)!)，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
    mono: true,
  });
  body += text(tx, 180, "預處理階乘與階乘的模反元素，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 202, "每次查詢 O(1)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(720, 30 + N * rh, body);
}

function starsBars(): string {
  const seq = "●●●|●●|●●";
  const cell = 34;
  const x0 = 60;
  let body = "";
  let box = 0;
  const counts = [0, 0, 0];
  seq.split("").forEach((ch, i) => {
    const isBar = ch === "|";
    body += rect(x0 + i * cell, 40, cell, cell, {
      fill: isBar
        ? C.orangeSoft
        : ([C.blueSoft, C.greenSoft, C.purpleSoft][box] ?? C.paper),
      stroke: C.ink,
      sw: 1,
    });
    body += text(
      x0 + i * cell + cell / 2,
      40 + cell / 2 + 1,
      isBar ? "|" : "●",
      { size: isBar ? 18 : 16, weight: "bold", fill: isBar ? C.orange : C.ink },
    );
    if (isBar) box++;
    else counts[box] = (counts[box] ?? 0) + 1;
  });
  let start = 0;
  counts.forEach((c, b) => {
    body += brace(
      x0 + start * cell + 3,
      x0 + (start + c) * cell - 3,
      40 + cell + 6,
      `盒 ${b + 1}：${c} 顆`,
      { size: 11 },
    );
    start += c + 1;
  });
  body += text(
    x0,
    140,
    "7 顆相同的球放進 3 個不同的盒子（可空）⇔ 7 個 ● 與 2 條 | 的排列。",
    { anchor: "start", size: 12 },
  );
  body += text(x0, 162, "方法數 = C(7 + 3 − 1, 3 − 1) = C(9, 2) = 36。", {
    anchor: "start",
    size: 12,
    mono: false,
    weight: "bold",
  });
  body += text(
    x0,
    184,
    "若每盒至少 1 顆：先各放 1 顆，化為 4 顆球放 3 盒 → C(6, 2) = 15（或在 6 個空隙中選 2 個插板）。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 200, body);
}

function venn(): string {
  let body = "";
  const cs: [number, number, string, string][] = [
    [170, 110, C.blue, "A"],
    [250, 110, C.orange, "B"],
    [210, 180, C.green, "C"],
  ];
  for (const [x, y, color] of cs)
    body += circle(x, y, 70, {
      fill: color,
      stroke: color,
      opacity: 0.15,
      sw: 2,
    });
  for (const [x, y, color] of cs)
    body += circle(x, y, 70, { fill: "none", stroke: color, sw: 2 });
  body += text(120, 70, "A", { size: 16, weight: "bold", fill: C.blue });
  body += text(300, 70, "B", { size: 16, weight: "bold", fill: C.orange });
  body += text(210, 262, "C", { size: 16, weight: "bold", fill: C.green });
  body += text(210, 140, "+1", { size: 12, weight: "bold" });
  const tx = 360;
  body += text(tx, 50, "|A ∪ B ∪ C|", {
    anchor: "start",
    size: 13,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 76, " = |A| + |B| + |C|", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 98, " − |A∩B| − |A∩C| − |B∩C|", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.red,
  });
  body += text(tx, 120, " + |A∩B∩C|", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 152, "中央區域：加 3 次、減 3 次、", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 174, "再加 1 次 → 恰好算 1 次。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 204, "一般式：奇數個集合的交取 +，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 226, "偶數個取 −；常搭配位元枚舉子集。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 276, body);
}

function nimFigure(): string {
  const piles = [3, 4, 5];
  const x = piles.reduce((a, b) => a ^ b, 0);
  const cell = 34;
  let body = "";
  piles.forEach((p, k) => {
    for (let t = 0; t < p; t++)
      body += circle(60 + t * 28, 40 + k * 44, 11, {
        fill: C.orangeSoft,
        stroke: C.orange,
      });
    body += text(30, 40 + k * 44, `${p}`, {
      size: 13,
      mono: true,
      weight: "bold",
    });
    const bits = p.toString(2).padStart(3, "0").split("");
    body += array(260, 40 + k * 44 - cell / 2, bits, {
      cell,
      size: 13,
      fill: (i) => (bits[i] === "1" ? C.blueSoft : undefined),
    });
  });
  const xb = x.toString(2).padStart(3, "0").split("");
  body += line(250, 40 + 3 * 44 - 26, 380, 40 + 3 * 44 - 26, { sw: 1.4 });
  body += text(230, 40 + 3 * 44, "⊕", { size: 16, weight: "bold" });
  body += array(260, 40 + 3 * 44 - cell / 2, xb, {
    cell,
    size: 13,
    fill: () => (x ? C.greenSoft : C.redSoft),
  });
  const tx = 410;
  body += text(tx, 40, `3 ⊕ 4 ⊕ 5 = ${x} ≠ 0`, {
    anchor: "start",
    size: 13,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 66, "→ 先手必勝。", {
    anchor: "start",
    size: 12,
    fill: C.green,
    weight: "bold",
  });
  body += text(tx, 96, "必勝走法：找一堆 p 使 p ⊕ x < p，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 118, `把它變成 p ⊕ x。此處 3 → 3⊕${x} = ${3 ^ x}，`, {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 140, "之後異或和為 0，對手必敗。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 170, "推廣：SG 定理——每個子遊戲的", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 192, "SG 值異或起來即整局的勝負。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 220, body);
}

function crossProduct(): string {
  let body = "";
  const O: [number, number] = [70, 220];
  const A: [number, number] = [250, 190];
  const B: [number, number] = [150, 100];
  const P: [number, number] = [270, 265];
  body += line(O[0], O[1], A[0], A[1], {
    stroke: C.blue,
    sw: 2.4,
    arrow: "end",
    marker: "ah-blue",
  });
  body += line(O[0], O[1], B[0], B[1], {
    stroke: C.green,
    sw: 2.2,
    arrow: "end",
    marker: "ah-green",
  });
  body += line(O[0], O[1], P[0], P[1], {
    stroke: C.red,
    sw: 2.2,
    arrow: "end",
    marker: "ah-red",
  });
  body += path(
    `M${O[0]},${O[1]} L${A[0]},${A[1]} L${A[0] + B[0] - O[0]},${A[1] + B[1] - O[1]} L${B[0]},${B[1]} Z`,
    { fill: C.greenSoft, stroke: C.line, dash: "4 3", opacity: 0.8 },
  );
  body += text(O[0] - 8, O[1] + 14, "O", { size: 13, weight: "bold" });
  body += text(A[0] + 10, A[1], "a", {
    size: 13,
    weight: "bold",
    fill: C.blue,
    anchor: "start",
  });
  body += text(B[0] - 4, B[1] - 12, "b", {
    size: 13,
    weight: "bold",
    fill: C.green,
  });
  body += text(P[0] + 10, P[1], "c", {
    size: 13,
    weight: "bold",
    fill: C.red,
    anchor: "start",
  });
  const tx = 420;
  body += text(tx, 40, "cross(a, b) = a.x·b.y − a.y·b.x", {
    anchor: "start",
    size: 12,
    mono: true,
    weight: "bold",
  });
  body += text(tx, 70, "> 0：b 在 a 的逆時針側（綠）", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(tx, 92, "< 0：c 在 a 的順時針側（紅）", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, 114, "= 0：三點共線", { anchor: "start", size: 12 });
  body += text(tx, 144, "|cross| = 平行四邊形面積（淡綠），", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 166, "三角形面積 = |cross| / 2。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 196, "全程整數運算，沒有浮點誤差；", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 218, "判斷轉向、線段相交都靠它。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 280, body);
}

function convexHull(): string {
  const pts: [number, number][] = [
    [1, 1],
    [2, 5],
    [3, 3],
    [4, 6],
    [5, 2],
    [6, 4],
    [7, 1],
    [4, 3],
    [3, 1.5],
    [6, 6],
    [8, 4],
  ];
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (
    o: [number, number],
    a: [number, number],
    b: [number, number],
  ) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(at(lower, lower.length - 2), at(lower, lower.length - 1), p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (const p of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(at(upper, upper.length - 2), at(upper, upper.length - 1), p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  const X = (x: number) => 30 + x * 44;
  const Y = (y: number) => 290 - y * 42;
  let body = "";
  body += path(
    lower.map(([x, y], i) => `${i ? "L" : "M"}${X(x)},${Y(y)}`).join(" "),
    { stroke: C.blue, sw: 2.4 },
  );
  body += path(
    upper.map(([x, y], i) => `${i ? "L" : "M"}${X(x)},${Y(y)}`).join(" "),
    { stroke: C.orange, sw: 2.4 },
  );
  const hull = new Set([...lower, ...upper].map(([x, y]) => `${x},${y}`));
  for (const [x, y] of pts)
    body += circle(X(x), Y(y), 5.5, {
      fill: hull.has(`${x},${y}`) ? C.ink : C.paper,
      stroke: C.ink,
    });
  const tx = 430;
  body += text(tx, 40, "Andrew 單調鏈：", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 66, "1. 點按 (x, y) 排序", { anchor: "start", size: 12 });
  body += text(tx, 88, "2. 由左到右建下凸殼（藍）", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 110, "3. 由右到左建上凸殼（橘）", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 140, "加入新點前，若最後兩點與新點", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 162, "不構成逆時針轉（cross ≤ 0），", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 184, "就把最後一點彈出——單調堆疊。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 214, "排序 O(n log n)，建殼 O(n)。", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  return svg(660, 310, body);
}

function manhattan(): string {
  let body = "";
  const cx = 130;
  const cy = 140;
  const s = 30;
  body += panelTitle(40, 20, "曼哈頓距離 ≤ 2 的點（菱形）");
  body += path(
    `M${cx},${cy - 2 * s} L${cx + 2 * s},${cy} L${cx},${cy + 2 * s} L${cx - 2 * s},${cy} Z`,
    { fill: C.blueSoft, stroke: C.blue, sw: 2 },
  );
  for (let x = -3; x <= 3; x++)
    for (let y = -3; y <= 3; y++) {
      const inside = Math.abs(x) + Math.abs(y) <= 2;
      body += circle(cx + x * s, cy + y * s, 3, {
        fill: inside ? C.blue : C.line,
        stroke: "none",
      });
    }
  const cx2 = 470;
  body += panelTitle(360, 20, "旋轉 45°：(x, y) → (x + y, x − y)");
  body += rect(cx2 - 2 * s, cy - 2 * s, 4 * s, 4 * s, {
    fill: C.orangeSoft,
    stroke: C.orange,
    sw: 2,
  });
  for (let u = -3; u <= 3; u++)
    for (let v = -3; v <= 3; v++) {
      const inside =
        Math.max(Math.abs(u), Math.abs(v)) <= 2 && (u + v) % 2 === 0;
      body += circle(cx2 + u * s, cy + v * s, inside ? 3.5 : 2, {
        fill: inside ? C.orange : C.faint,
        stroke: "none",
      });
    }
  body += line(250, cy, 330, cy, { arrow: "end", sw: 1.8 });
  body += text(
    40,
    260,
    "|x₁ − x₂| + |y₁ − y₂| = max(|u₁ − u₂|, |v₁ − v₂|)，其中 u = x + y、v = x − y。",
    { anchor: "start", size: 12 },
  );
  body += text(
    40,
    282,
    "（u, v 同奇偶的格點才對應原來的整點。）變成切比雪夫距離後兩維可分開處理：最遠點對 = 各維極差的較大者。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 298, body);
}

function mooreVote(): string {
  const nums = [2, 2, 1, 1, 1, 2, 2];
  let cand = 0;
  let cnt = 0;
  const rows: [number, number][] = [];
  for (const v of nums) {
    if (cnt === 0) cand = v;
    cnt += v === cand ? 1 : -1;
    rows.push([cand, cnt]);
  }
  const cell = 46;
  const x0 = 110;
  let body = text(x0 - 12, 40 + 20, "nums", {
    anchor: "end",
    size: 12,
    mono: true,
  });
  body += array(x0, 40, nums, {
    cell,
    h: 40,
    fill: (i) => (at(nums, i) === 2 ? C.blueSoft : C.orangeSoft),
  });
  body += text(x0 - 12, 110 + 18, "候選", { anchor: "end", size: 12 });
  body += array(
    x0,
    110,
    rows.map((r) => r[0]),
    { cell, h: 36, size: 13 },
  );
  body += text(x0 - 12, 160 + 18, "票數", { anchor: "end", size: 12 });
  body += array(
    x0,
    160,
    rows.map((r) => r[1]),
    {
      cell,
      h: 36,
      size: 13,
      fill: (i) => (at(rows, i)[1] === 0 ? C.redSoft : undefined),
    },
  );
  body += text(
    x0,
    230,
    "相同 +1、不同 −1，票數歸零就換候選人。眾數（出現 > n/2 次）每被抵銷一次，也消耗掉一個非眾數，",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    250,
    `所以最後一定留下來：候選 = ${cand}。O(n) 時間、O(1) 空間；若不保證存在眾數要再掃一次驗證。`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 266, body);
}

// ---------------------------------------------------------------------------
// Greedy
// ---------------------------------------------------------------------------

type Interval = [number, number];

function intervalCanvas(
  ivs: Interval[],
  o: {
    fill: (i: number) => string;
    stroke?: (i: number) => string;
    label?: (i: number) => string;
    x0?: number;
    scale?: number;
    y0?: number;
    rowH?: number;
  },
) {
  const x0 = o.x0 ?? 60;
  const scale = o.scale ?? 30;
  const y0 = o.y0 ?? 40;
  const rowH = o.rowH ?? 26;
  const maxX = Math.max(...ivs.map((v) => v[1]));
  let body = "";
  for (let x = 0; x <= maxX; x++) {
    body += line(
      x0 + x * scale,
      y0 - 10,
      x0 + x * scale,
      y0 + ivs.length * rowH,
      { stroke: C.faint, sw: 1 },
    );
    body += text(x0 + x * scale, y0 - 18, x, {
      size: 10,
      mono: true,
      fill: C.muted,
    });
  }
  ivs.forEach(([l, r], i) => {
    const y = y0 + i * rowH;
    body += rect(x0 + l * scale, y + 3, (r - l) * scale, rowH - 8, {
      fill: o.fill(i),
      stroke: o.stroke?.(i) ?? C.ink,
      rx: 4,
      sw: 1.2,
    });
    if (o.label)
      body += text(x0 + l * scale - 6, y + rowH / 2 - 1, o.label(i), {
        anchor: "end",
        size: 11,
        mono: true,
        fill: C.muted,
      });
  });
  return { body, height: y0 + ivs.length * rowH, width: x0 + maxX * scale };
}

function nonOverlap(): string {
  const raw: Interval[] = [
    [1, 4],
    [3, 5],
    [0, 6],
    [5, 7],
    [3, 9],
    [5, 9],
    [6, 10],
    [8, 11],
    [8, 12],
    [2, 14],
    [12, 16],
  ];
  const ivs = [...raw].sort((a, b) => a[1] - b[1]);
  const chosen = new Set<number>();
  let end = -Infinity;
  ivs.forEach(([l, r], i) => {
    if (l >= end) {
      chosen.add(i);
      end = r;
    }
  });
  const { body: b0, height } = intervalCanvas(ivs, {
    fill: (i) => (chosen.has(i) ? C.greenSoft : C.gray),
    stroke: (i) => (chosen.has(i) ? C.green : C.line),
    label: (i) => `[${at(ivs, i)[0]},${at(ivs, i)[1]})`,
    x0: 80,
    scale: 28,
  });
  let body = b0;
  body += text(
    20,
    height + 20,
    `按右端點排序，能選就選（左端 ≥ 上一個選中的右端）。共選 ${chosen.size} 個互不重疊的區間（綠）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    height + 40,
    "交換論證：最優解的第一個區間總能換成「右端最小」的那個，而不讓後面變差。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, height + 56, body);
}

function meetingRooms(): string {
  const ivs: Interval[] = [
    [0, 5],
    [1, 3],
    [2, 7],
    [3, 6],
    [5, 9],
    [6, 8],
    [7, 10],
    [8, 11],
  ];
  const sorted = [...ivs].sort((a, b) => a[0] - b[0]);
  const roomEnd: number[] = [];
  const roomOf: number[] = [];
  for (const [l, r] of sorted) {
    let k = roomEnd.findIndex((e) => e <= l);
    if (k < 0) {
      k = roomEnd.length;
      roomEnd.push(r);
    } else roomEnd[k] = r;
    roomOf.push(k);
  }
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft, C.purpleSoft];
  const x0 = 110;
  const scale = 40;
  let body = "";
  for (let x = 0; x <= 11; x++) {
    body += line(x0 + x * scale, 30, x0 + x * scale, 30 + roomEnd.length * 44, {
      stroke: C.faint,
      sw: 1,
    });
    body += text(x0 + x * scale, 22, x, {
      size: 10,
      mono: true,
      fill: C.muted,
    });
  }
  for (let k = 0; k < roomEnd.length; k++)
    body += text(x0 - 12, 30 + k * 44 + 20, `會議室 ${k + 1}`, {
      anchor: "end",
      size: 12,
    });
  sorted.forEach(([l, r], i) => {
    const k = at(roomOf, i);
    body += rect(x0 + l * scale + 1, 30 + k * 44 + 6, (r - l) * scale - 2, 30, {
      fill: at(fills, k % 4),
      stroke: C.ink,
      rx: 4,
    });
    body += text(x0 + ((l + r) / 2) * scale, 30 + k * 44 + 21, `[${l},${r})`, {
      size: 11,
      mono: true,
    });
  });
  const y = 30 + roomEnd.length * 44 + 20;
  body += text(
    20,
    y,
    `按開始時間排序；小根堆存各會議室的結束時間，堆頂 ≤ 開始時間就重用，否則開新房間。共需 ${roomEnd.length} 間。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    y + 20,
    "答案 = 同一時刻最多重疊的區間數（下界），貪心恰好達到它。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y + 36, body);
}

function pointsCover(): string {
  const raw: Interval[] = [
    [10, 16],
    [2, 8],
    [1, 6],
    [7, 12],
    [11, 14],
    [3, 5],
  ];
  const ivs = [...raw].sort((a, b) => a[1] - b[1]);
  const shots: number[] = [];
  for (const [l, r] of ivs)
    if (!shots.length || at(shots, shots.length - 1) < l) shots.push(r);
  const x0 = 80;
  const scale = 30;
  const { body: b0, height } = intervalCanvas(ivs, {
    fill: (i) =>
      [C.blueSoft, C.orangeSoft, C.greenSoft][
        shots.findIndex((s) => at(ivs, i)[0] <= s && s <= at(ivs, i)[1]) % 3
      ] ?? C.gray,
    label: (i) => `[${at(ivs, i)[0]},${at(ivs, i)[1]}]`,
    x0,
    scale,
  });
  let body = b0;
  shots.forEach((s) => {
    body += line(x0 + s * scale, 30, x0 + s * scale, height + 4, {
      stroke: C.red,
      sw: 2.2,
    });
    body += text(x0 + s * scale, height + 16, `x=${s}`, {
      size: 11,
      fill: C.red,
      weight: "bold",
    });
  });
  body += text(
    20,
    height + 40,
    `按右端點排序；目前的點戳不到下一個區間時，就在該區間的右端放一個新點。共 ${shots.length} 個點（LC 452）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    height + 60,
    "放在右端點最「划算」：它能同時戳到最多後續的區間。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, height + 76, body);
}

function intervalCover(): string {
  const raw: Interval[] = [
    [0, 2],
    [1, 5],
    [1, 9],
    [4, 6],
    [5, 9],
    [8, 10],
    [9, 12],
    [11, 13],
  ];
  const T = 13;
  const ivs = [...raw].sort((a, b) => a[0] - b[0]);
  const chosen = new Set<number>();
  let cur = 0;
  let i = 0;
  while (cur < T) {
    let best = -1;
    let far = cur;
    while (i < ivs.length && at(ivs, i)[0] <= cur) {
      if (at(ivs, i)[1] > far) {
        far = at(ivs, i)[1];
        best = i;
      }
      i++;
    }
    if (best < 0) break;
    chosen.add(best);
    cur = far;
  }
  const x0 = 80;
  const scale = 34;
  const { body: b0, height } = intervalCanvas(ivs, {
    fill: (k) => (chosen.has(k) ? C.greenSoft : C.gray),
    stroke: (k) => (chosen.has(k) ? C.green : C.line),
    label: (k) => `[${at(ivs, k)[0]},${at(ivs, k)[1]}]`,
    x0,
    scale,
  });
  let body = b0;
  body += rect(x0, height + 6, T * scale, 10, {
    fill: C.orangeSoft,
    stroke: C.orange,
  });
  body += text(x0 + T * scale + 8, height + 12, `目標 [0, ${T}]`, {
    anchor: "start",
    size: 11,
    fill: C.orange,
  });
  body += text(
    20,
    height + 40,
    `在所有「左端 ≤ 目前已覆蓋右端」的區間中，選右端最遠的一個；重複直到覆蓋 [0, ${T}]，共 ${chosen.size} 個。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    height + 60,
    "與跳躍遊戲 II 同構：每一步都跳到能到的最遠處。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, height + 76, body);
}

function mergeIntervals(): string {
  const raw: Interval[] = [
    [1, 3],
    [2, 6],
    [8, 10],
    [9, 12],
    [15, 18],
    [16, 17],
  ];
  const ivs = [...raw].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  const group: number[] = [];
  for (const [l, r] of ivs) {
    const last = merged[merged.length - 1];
    if (last && l <= last[1]) last[1] = Math.max(last[1], r);
    else merged.push([l, r]);
    group.push(merged.length - 1);
  }
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft];
  const x0 = 60;
  const scale = 28;
  const { body: b0, height } = intervalCanvas(ivs, {
    fill: (i) => at(fills, at(group, i) % 3),
    x0,
    scale,
    y0: 40,
  });
  let body = b0;
  body += panelTitle(20, height + 24, "合併後");
  merged.forEach(([l, r], k) => {
    body += rect(
      x0 + l * scale,
      height + 34,
      Math.max(4, (r - l) * scale),
      22,
      { fill: at(fills, k % 3), stroke: C.ink, sw: 1.6, rx: 4 },
    );
    body += text(x0 + ((l + r) / 2) * scale, height + 45, `[${l},${r}]`, {
      size: 11,
      mono: true,
    });
  });
  body += text(
    20,
    height + 84,
    "按左端點排序後，當前區間的左端 ≤ 已合併區間的右端就重疊：更新右端為兩者較大值；否則開新的一段。",
    { anchor: "start", size: 12 },
  );
  return svg(640, height + 100, body);
}

function exchangeArg(): string {
  let body = "";
  const draw = (y: number, order: [string, number][], label: string) => {
    let t = 0;
    body += text(20, y + 14, label, {
      anchor: "start",
      size: 12,
      weight: "bold",
    });
    order.forEach(([name, d], k) => {
      const hot = name === "a" || name === "b";
      body += rect(150 + t * 26, y, d * 26, 28, {
        fill: hot ? (name === "a" ? C.blueSoft : C.orangeSoft) : C.gray,
        stroke: C.ink,
        sw: 1,
      });
      body += text(150 + t * 26 + (d * 26) / 2, y + 14, `${name}(${d})`, {
        size: 11,
        mono: true,
      });
      t += d;
      if (hot)
        body += text(150 + t * 26, y + 42, `完成 ${t}`, {
          size: 10,
          fill: C.muted,
        });
      void k;
    });
  };
  draw(
    30,
    [
      ["…", 3],
      ["a", 2],
      ["b", 5],
      ["…", 3],
    ],
    "先 a 後 b",
  );
  draw(
    100,
    [
      ["…", 3],
      ["b", 5],
      ["a", 2],
      ["…", 3],
    ],
    "先 b 後 a",
  );
  body += text(
    20,
    180,
    "只交換相鄰的 a、b：前面與後面的工作完成時間都不變，只有 a、b 自己的代價改變。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    202,
    "例如最小化「完成時間總和」：先 a 後 b 的差值 = d_a − d_b < 0 ⇒ 短工作放前面更好。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    224,
    "任何不滿足此順序的解都能透過相鄰交換變得不更差 → 排序後的順序是最優的。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 240, body);
}

function regretHeap(): string {
  // LC 630: courses (duration, lastDay)
  const courses: [number, number][] = [
    [100, 200],
    [200, 1300],
    [1000, 1250],
    [300, 1400],
    [2000, 3200],
  ];
  const sorted = [...courses].sort((a, b) => a[1] - b[1]);
  const heap: number[] = [];
  let t = 0;
  const rows: string[] = [];
  for (const [d, last] of sorted) {
    if (t + d <= last) {
      heap.push(d);
      t += d;
      rows.push(`(${d}, ${last})：t = ${t} ≤ ${last}，直接選`);
    } else {
      const mx = Math.max(...heap);
      if (mx > d) {
        heap.splice(heap.indexOf(mx), 1, d);
        t += d - mx;
        rows.push(
          `(${d}, ${last})：放不下；反悔——丟掉最長的 ${mx}、換成 ${d}，t = ${t}`,
        );
      } else rows.push(`(${d}, ${last})：放不下且不比已選的短，放棄`);
    }
  }
  let body = text(20, 20, "課程表 III (LC 630)：按截止日排序，逐門嘗試", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  rows.forEach((r, k) => {
    body += text(30, 48 + k * 24, r, {
      anchor: "start",
      size: 12,
      mono: false,
      fill: r.includes("反悔") ? C.orange : r.includes("放棄") ? C.red : C.ink,
    });
  });
  const y = 48 + rows.length * 24 + 10;
  body += text(
    20,
    y,
    `最終選 ${heap.length} 門：大根堆 {${[...heap].sort((a, b) => b - a).join(", ")}}。`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(
    20,
    y + 22,
    "反悔貪心：先貪心地選；之後發現更好的選擇時，用堆找出「最該反悔」的舊選擇換掉。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y + 38, body);
}

function medianGreedy(): string {
  const xs = [1, 2, 4, 9, 10];
  const x0 = 50;
  const scale = 46;
  const med = at(xs, 2);
  let body = line(x0 - 10, 80, x0 + 11 * scale, 80, {
    stroke: C.line,
    arrow: "end",
    marker: "ah-muted",
  });
  for (let v = 0; v <= 10; v++)
    body += text(x0 + v * scale, 100, v, {
      size: 10,
      mono: true,
      fill: C.muted,
    });
  xs.forEach((v) => {
    body += path(
      `M${x0 + v * scale},${72} Q${x0 + ((v + med) / 2) * scale},${40 - Math.abs(v - med) * 3} ${x0 + med * scale},${72}`,
      { stroke: C.orange, sw: 1.2 },
    );
    body += circle(x0 + v * scale, 80, 8, { fill: C.blueSoft, stroke: C.blue });
  });
  body += pointer(x0 + med * scale, 118, `中位數 ${med}`, {
    below: true,
    color: C.green,
    len: 14,
  });
  const cost = (c: number) => xs.reduce((s, v) => s + Math.abs(v - c), 0);
  body += text(
    x0,
    170,
    `把所有點移到同一個位置 c 的總距離 Σ|x − c|：c = ${med} 時 = ${cost(med)}；c = 5 時 = ${cost(5)}；c = 3 時 = ${cost(3)}。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    192,
    "c 往右移一格，左邊的點各遠 1、右邊的點各近 1——左右點數相等（中位數）時無法再改善。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(620, 208, body);
}

function rearrangement(): string {
  const a = [1, 3, 5];
  const b = [2, 4, 6];
  let body = "";
  const draw = (
    x: number,
    pairs: [number, number][],
    title: string,
    good: boolean,
  ) => {
    body += panelTitle(x, 20, title, { color: good ? C.green : C.red });
    a.forEach((v, i) => {
      body += circle(x + 20, 60 + i * 50, 16, {
        fill: C.blueSoft,
        stroke: C.blue,
      });
      body += text(x + 20, 61 + i * 50, v, { mono: true, size: 13 });
    });
    b.forEach((v, i) => {
      body += circle(x + 170, 60 + i * 50, 16, {
        fill: C.orangeSoft,
        stroke: C.orange,
      });
      body += text(x + 170, 61 + i * 50, v, { mono: true, size: 13 });
    });
    pairs.forEach(
      ([i, j]) =>
        (body += line(x + 36, 60 + i * 50, x + 154, 60 + j * 50, {
          stroke: good ? C.green : C.red,
          sw: 1.8,
        })),
    );
    const sum = pairs.reduce((s, [i, j]) => s + at(a, i) * at(b, j), 0);
    body += text(x + 95, 200, `Σ aᵢbⱼ = ${sum}`, {
      size: 13,
      mono: true,
      weight: "bold",
      fill: good ? C.green : C.red,
    });
  };
  draw(
    20,
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    "同序配對：最大",
    true,
  );
  draw(
    240,
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
    "反序配對：最小",
    false,
  );
  body += text(460, 60, "排序不等式：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(460, 84, "反序和 ≤ 亂序和 ≤ 同序和", {
    anchor: "start",
    size: 12,
  });
  body += text(460, 114, "證明：若有交叉（i < j 但", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(460, 136, "配到的 b 反過來），交換後", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(460, 158, "和增加 (aⱼ−aᵢ)(bⱼ−bᵢ) ≥ 0。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 220, body);
}

function taskScheduler(): string {
  const counts: [string, number][] = [
    ["A", 4],
    ["B", 3],
    ["C", 2],
    ["D", 1],
  ];
  const n = 2;
  const maxCnt = 4;
  const x0 = 60;
  const cell = 40;
  let body = "";
  const frames: string[][] = Array.from({ length: maxCnt }, () => []);
  counts.forEach(([t, c]) => {
    for (let k = 0; k < c; k++) at(frames, k).push(t);
  });
  const fills: Record<string, string> = {
    A: C.orangeSoft,
    B: C.blueSoft,
    C: C.greenSoft,
    D: C.purpleSoft,
  };
  frames.forEach((f, r) => {
    const cols = r < maxCnt - 1 ? Math.max(n + 1, f.length) : f.length;
    for (let c = 0; c < cols; c++) {
      const t = f[c];
      body += rect(x0 + c * cell, 30 + r * (cell + 6), cell, cell, {
        fill: t ? fills[t] : C.gray,
        stroke: C.ink,
        sw: 1,
      });
      body += text(
        x0 + c * cell + cell / 2,
        30 + r * (cell + 6) + cell / 2 + 1,
        t ?? "idle",
        { size: t ? 14 : 10, mono: true, fill: t ? C.ink : C.muted },
      );
    }
    body += text(x0 - 10, 30 + r * (cell + 6) + cell / 2, `第 ${r + 1} 框`, {
      anchor: "end",
      size: 11,
      fill: C.muted,
    });
  });
  const total = Math.max(
    (maxCnt - 1) * (n + 1) + counts.filter(([, c]) => c === maxCnt).length,
    counts.reduce((s, [, c]) => s + c, 0),
  );
  const tx = x0 + 5 * cell + 30;
  body += text(tx, 40, `任務 A×4、B×3、C×2、D×1，冷卻 n = ${n}`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 66, "以最多的 A 為骨架切成 maxCnt 個框，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 88, "每框長 n + 1（最後一框只放最多的任務）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 114, "其他任務依序填入，保證同種任務相鄰 ≥ n+1。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 144, `答案 = max((maxCnt−1)(n+1) + 最多的種數, 總數)`, {
    anchor: "start",
    size: 12,
    mono: false,
  });
  body += text(tx, 166, `     = max(3·3 + 1, 10) = ${total}`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
    weight: "bold",
  });
  return svg(660, 30 + maxCnt * (cell + 6) + 10, body);
}

function pairGreedy(): string {
  const nums = [3, 5, 2, 3, 8, 6].sort((a, b) => a - b);
  const cell = 46;
  const x0 = 60;
  let body = array(x0, 80, nums, {
    cell,
    showIndex: true,
    fill: (i) =>
      [C.blueSoft, C.orangeSoft, C.greenSoft][Math.min(i, nums.length - 1 - i)],
  });
  const n = nums.length;
  let mx = 0;
  for (let i = 0; i < n / 2; i++) {
    const j = n - 1 - i;
    const s = at(nums, i) + at(nums, j);
    mx = Math.max(mx, s);
    const x1 = x0 + i * cell + cell / 2;
    const x2 = x0 + j * cell + cell / 2;
    body += path(`M${x1},80 Q${(x1 + x2) / 2},${40 - (j - i) * 8} ${x2},80`, {
      stroke: [C.blue, C.orange, C.green][i],
      sw: 1.8,
    });
    body += text(
      x0 + n * cell + 24,
      90 + i * 20,
      `${at(nums, i)} + ${at(nums, j)} = ${s}`,
      {
        anchor: "start",
        size: 12,
        fill: [C.blue, C.orange, C.green][i],
        weight: "bold",
      },
    );
  }
  body += text(
    x0,
    170,
    `最小化「數對和的最大值」(LC 1877)：排序後最小配最大、次小配次大……答案 = ${mx}。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    190,
    "交換論證：若最大值 a_n 沒配最小值 a_1，把兩對交叉互換，最大的那一對只會變小。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 206, body);
}

export const part5Figures: BookFigure[] = [
  {
    id: "math-sieve",
    category: "math",
    section: "2. 預處理質數（篩質數）",
    caption: "質數篩：1..60，合數按最小質因數上色",
    render: sieve,
  },
  {
    id: "math-factor",
    category: "math",
    section: "3. 質因數分解",
    caption: "試除法分解 360",
    render: factorTree,
  },
  {
    id: "math-divisors",
    category: "math",
    section: "5. 因子",
    caption: "因數成對出現：只需枚舉到 √n",
    render: divisorPairs,
  },
  {
    id: "math-euclid",
    category: "math",
    section: "6. 最大公約數（GCD）",
    caption: "輾轉相除法的幾何意義：用正方形鋪滿長方形",
    render: euclid,
  },
  {
    id: "math-mod",
    category: "math",
    section: "10. 同餘",
    caption: "模 m 的剩餘類與模運算規則",
    render: modClock,
  },
  {
    id: "math-floor",
    category: "math",
    section: "11. 數論分塊",
    caption: "數論分塊：⌊n/i⌋ 只有 O(√n) 種取值",
    render: floorBlocks,
  },
  {
    id: "math-pascal",
    category: "math",
    section: "14. 組合計數",
    caption: "楊輝三角與組合數遞推",
    render: pascal,
  },
  {
    id: "math-stars",
    category: "math",
    section: "15. 放球問題",
    caption: "插板法：相同的球放進不同的盒子",
    render: starsBars,
  },
  {
    id: "math-venn",
    category: "math",
    section: "16. 容斥原理",
    caption: "三個集合的容斥原理",
    render: venn,
  },
  {
    id: "math-nim",
    category: "math",
    section: "20. 博弈論",
    caption: "Nim 遊戲：石子數異或和決定勝負",
    render: nimFigure,
  },
  {
    id: "math-cross",
    category: "math",
    section: "21. 點、線",
    caption: "叉積：判斷方向與計算面積",
    render: crossProduct,
  },
  {
    id: "math-hull",
    category: "math",
    section: "24. 凸包",
    caption: "Andrew 單調鏈求凸包",
    render: convexHull,
  },
  {
    id: "math-manhattan",
    category: "math",
    section: "29. 曼哈頓距離與切比雪夫距離",
    caption: "座標旋轉 45°：曼哈頓距離轉成切比雪夫距離",
    render: manhattan,
  },
  {
    id: "math-moore",
    category: "math",
    section: "32. 摩爾投票法",
    caption: "摩爾投票：候選人與票數的變化",
    render: mooreVote,
  },

  {
    id: "greedy-pair",
    category: "greedy",
    section: "2. 單序列配對",
    caption: "單序列配對：最小配最大",
    render: pairGreedy,
  },
  {
    id: "greedy-exchange",
    category: "greedy",
    section: "7.1 交換論證法",
    caption: "交換論證：只比較相鄰兩個元素交換前後的代價",
    render: exchangeArg,
  },
  {
    id: "greedy-adjacent",
    category: "greedy",
    section: "8. 相鄰不同",
    caption: "任務排程器 (LC 621)：以出現最多的任務為骨架分框",
    render: taskScheduler,
  },
  {
    id: "greedy-regret",
    category: "greedy",
    section: "9. 反悔貪心",
    caption: "反悔貪心：用堆撤銷最差的舊選擇",
    render: regretHeap,
  },
  {
    id: "greedy-nonoverlap",
    category: "greedy",
    section: "10. 不相交區間",
    caption: "最多不相交區間：按右端點排序後能選就選",
    render: nonOverlap,
  },
  {
    id: "greedy-rooms",
    category: "greedy",
    section: "11. 區間分組",
    caption: "區間分組（會議室）：最少組數 = 最大重疊數",
    render: meetingRooms,
  },
  {
    id: "greedy-points",
    category: "greedy",
    section: "12. 區間選點",
    caption: "區間選點：在右端點放點",
    render: pointsCover,
  },
  {
    id: "greedy-cover",
    category: "greedy",
    section: "13. 區間覆蓋",
    caption: "區間覆蓋：每次選能延伸最遠的區間",
    render: intervalCover,
  },
  {
    id: "greedy-merge",
    category: "greedy",
    section: "14. 合併區間",
    caption: "合併區間 (LC 56)",
    render: mergeIntervals,
  },
  {
    id: "greedy-rearrange",
    category: "greedy",
    section: "20. 排序不等式",
    caption: "排序不等式：同序和最大、反序和最小",
    render: rearrangement,
  },
  {
    id: "greedy-median",
    category: "greedy",
    section: "22. 中位數貪心",
    caption: "中位數貪心：到所有點距離和最小的位置",
    render: medianGreedy,
  },
];
