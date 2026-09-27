/**
 * Figures for the dynamic programming chapter. Tables are filled by running
 * the recurrences; highlighted cells and arrows are read back from the
 * computed tables (argmax / traceback), not placed by hand.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  axes,
  brace,
  circle,
  drawGraph,
  drawTree,
  grid,
  gridHeaders,
  layoutTree,
  line,
  panelTitle,
  path,
  rect,
  svg,
  text,
  type GNode,
  type TreeNode,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;
const cellOf = (t: number[][], i: number, j: number) => at(at(t, i), j);

function climbTree(): string {
  const counts = new Map<number, number>();
  const build = (n: number, depth: number): TreeNode => {
    counts.set(n, (counts.get(n) ?? 0) + 1);
    const node: TreeNode = { label: `f${n}` };
    if (n > 1 && depth < 4)
      node.children = [build(n - 1, depth + 1), build(n - 2, depth + 1)];
    return node;
  };
  const root = build(5, 0);
  const dupColor = (n: TreeNode): void => {
    const k = Number(String(n.label).slice(1));
    n.fill = k === 3 ? C.orangeSoft : k === 2 ? C.yellowSoft : C.paper;
    n.children?.forEach((c) => c && dupColor(c));
  };
  dupColor(root);
  const placed = layoutTree(root, 38, 52, 30, 30);
  let body = drawTree(placed, { r: 15, size: 11 });
  const x1 = 470;
  body += panelTitle(x1, 24, "記憶化後：每個狀態只算一次");
  const memo = [0, 1, 1, 2, 3, 5];
  for (let i = 5; i >= 0; i--) {
    const y = 50 + (5 - i) * 34;
    body += circle(x1 + 30, y, 14, { fill: C.greenSoft, stroke: C.green });
    body += text(x1 + 30, y + 1, `f${i}`, { size: 11, mono: true });
    body += text(x1 + 56, y, `= ${memo[i]}`, {
      anchor: "start",
      size: 12,
      mono: true,
    });
    if (i > 0)
      body += line(x1 + 30, y + 14, x1 + 30, y + 20, {
        stroke: C.green,
        arrow: "end",
        marker: "ah-green",
      });
  }
  body += text(
    30,
    290,
    `左：不記憶化的遞迴樹（只畫前 4 層）。f3 被算了 ${counts.get(3)} 次、f2 被算了 ${counts.get(2)} 次——重複子問題讓時間變成指數級。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    310,
    "右：把 f[i] 存起來，n 個狀態各算一次，O(n)。這就是 DP 的「記憶化搜尋 ⇔ 遞推」。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 326, body);
}

function robFigure(): string {
  const nums = [2, 7, 9, 3, 1, 5];
  const n = nums.length;
  const f = new Array<number>(n + 2).fill(0);
  for (let i = 0; i < n; i++)
    f[i + 2] = Math.max(at(f, i + 1), at(f, i) + at(nums, i));
  // Traceback chosen houses.
  const chosen = new Set<number>();
  for (let i = n - 1; i >= 0; ) {
    if (at(f, i + 2) === at(f, i + 1)) i--;
    else {
      chosen.add(i);
      i -= 2;
    }
  }
  const cell = 52;
  const x0 = 110;
  let body = text(x0 - 14, 40 + cell / 2, "nums", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0 + 2 * cell, 40, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) => (chosen.has(i) ? C.orangeSoft : undefined),
  });
  body += text(x0 - 14, 140 + cell / 2, "f", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0, 140, f, {
    cell,
    fill: (i) => (i < 2 ? C.gray : C.blueSoft),
  });
  body += text(x0 + cell / 2, 140 + cell + 14, "f[0]", {
    size: 10,
    fill: C.muted,
    mono: true,
  });
  body += text(x0 + cell * 1.5, 140 + cell + 14, "f[1]", {
    size: 10,
    fill: C.muted,
    mono: true,
  });
  const i = 4; // highlight f[i+2] computation for nums[4]
  const tx = x0 + (i + 2) * cell + cell / 2;
  body += path(
    `M${x0 + (i + 1) * cell + cell / 2},${140 + cell} Q${tx - cell / 2},${140 + cell + 36} ${tx - 6},${140 + cell + 2}`,
    { stroke: C.blue, arrow: "end", marker: "ah-blue" },
  );
  body += path(
    `M${x0 + i * cell + cell / 2},${140} Q${tx - cell},${100} ${tx - 4},${140 - 2}`,
    { stroke: C.orange, arrow: "end", marker: "ah-orange" },
  );
  body += line(x0 + (i + 2) * cell + cell / 2, 40 + cell + 18, tx, 138, {
    stroke: C.orange,
    arrow: "end",
    marker: "ah-orange",
    dash: "4 3",
  });
  body += text(
    x0,
    240,
    `f[i+2] = max( f[i+1]（不偷 i）, f[i] + nums[i]（偷 i）)。最大金額 = ${at(f, n + 1)}，橘色為被偷的房子。`,
    { anchor: "start", size: 12, mono: false },
  );
  body += text(x0, 260, "只依賴前兩項 → 空間可壓到 O(1)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 276, body);
}

function kadane(): string {
  const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
  const f: number[] = [];
  nums.forEach((v, i) => f.push(i === 0 ? v : Math.max(at(f, i - 1), 0) + v));
  let best = 0;
  f.forEach((v, i) => v > at(f, best) && (best = i));
  let start = best;
  while (start > 0 && at(f, start - 1) > 0) start--;
  const cell = 46;
  const x0 = 80;
  let body = text(x0 - 12, 40 + cell / 2, "nums", {
    anchor: "end",
    size: 12,
    mono: true,
  });
  body += array(x0, 40, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) => (i >= start && i <= best ? C.orangeSoft : undefined),
  });
  body += text(x0 - 12, 120 + cell / 2, "f", {
    anchor: "end",
    size: 12,
    mono: true,
  });
  body += array(x0, 120, f, {
    cell,
    fill: (i) =>
      i === best
        ? C.orangeSoft
        : i > 0 && at(f, i - 1) <= 0
          ? C.yellowSoft
          : C.blueSoft,
  });
  body += brace(
    x0 + start * cell + 3,
    x0 + (best + 1) * cell - 3,
    40 + cell + 4,
    `最大和 ${at(f, best)}`,
    { color: C.orange },
  );
  f.forEach((_, i) => {
    if (i > 0 && at(f, i - 1) <= 0)
      body += text(x0 + i * cell + cell / 2, 120 + cell + 14, "重開", {
        size: 10,
        fill: C.orange,
      });
  });
  body += text(
    x0,
    210,
    "f[i] = max(f[i−1], 0) + nums[i]：以 i 結尾的最大子陣列和。前面的和 ≤ 0 就捨棄（黃色：從自己重新開始）。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 226, body);
}

function gridDp(): string {
  const g = [
    [1, 3, 1, 2],
    [1, 5, 1, 3],
    [4, 2, 1, 1],
  ];
  const R = g.length;
  const Cn = at(g, 0).length;
  const f: number[][] = g.map((row) => row.map(() => 0));
  for (let i = 0; i < R; i++)
    for (let j = 0; j < Cn; j++) {
      const up = i > 0 ? cellOf(f, i - 1, j) : Infinity;
      const left = j > 0 ? cellOf(f, i, j - 1) : Infinity;
      at(f, i)[j] =
        cellOf(g, i, j) + (i === 0 && j === 0 ? 0 : Math.min(up, left));
    }
  const onPath = new Set<string>();
  let i = R - 1;
  let j = Cn - 1;
  onPath.add(`${i},${j}`);
  while (i > 0 || j > 0) {
    if (i > 0 && (j === 0 || cellOf(f, i - 1, j) <= cellOf(f, i, j - 1))) i--;
    else j--;
    onPath.add(`${i},${j}`);
  }
  const cell = 50;
  const x0 = 30;
  const y0 = 40;
  let body = panelTitle(x0, 20, "grid（每格的數字）");
  body += grid(x0, y0, R, Cn, {
    cell,
    label: (r, c) => cellOf(g, r, c),
    fill: (r, c) => (onPath.has(`${r},${c}`) ? C.orangeSoft : undefined),
    size: 15,
  });
  const x1 = x0 + Cn * cell + 50;
  body += panelTitle(x1, 20, "f[i][j]：走到 (i, j) 的最小路徑和");
  body += grid(x1, y0, R, Cn, {
    cell,
    label: (r, c) => cellOf(f, r, c),
    fill: (r, c) => (onPath.has(`${r},${c}`) ? C.orangeSoft : C.blueSoft),
    bold: (r, c) => r === R - 1 && c === Cn - 1,
    size: 15,
  });
  // Arrows into (1,2)
  const ti = 1;
  const tj = 2;
  body += line(
    x1 + tj * cell + cell / 2,
    y0 + (ti - 1) * cell + cell - 8,
    x1 + tj * cell + cell / 2,
    y0 + ti * cell + 10,
    { stroke: C.blue, arrow: "end", marker: "ah-blue", sw: 1.8 },
  );
  body += line(
    x1 + (tj - 1) * cell + cell - 8,
    y0 + ti * cell + cell / 2,
    x1 + tj * cell + 10,
    y0 + ti * cell + cell / 2,
    { stroke: C.blue, arrow: "end", marker: "ah-blue", sw: 1.8 },
  );
  body += text(
    x0,
    y0 + R * cell + 26,
    "f[i][j] = grid[i][j] + min(f[i−1][j], f[i][j−1])：只能從上方或左方走來（藍色箭頭）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    y0 + R * cell + 46,
    `右下角 ${cellOf(f, R - 1, Cn - 1)} 即答案；沿較小的來源回溯得到橘色路徑。按列由上到下、每列由左到右填表。`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y0 + R * cell + 62, body);
}

function knapsack01(): string {
  const items = [
    { w: 1, v: 1 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 7 },
  ];
  const Wc = 7;
  const n = items.length;
  const f: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(Wc + 1).fill(0),
  );
  for (let i = 1; i <= n; i++)
    for (let c = 0; c <= Wc; c++) {
      const it = at(items, i - 1);
      at(f, i)[c] = cellOf(f, i - 1, c);
      if (c >= it.w)
        at(f, i)[c] = Math.max(
          cellOf(f, i, c),
          cellOf(f, i - 1, c - it.w) + it.v,
        );
    }
  const take = new Set<number>();
  for (let i = n, c = Wc; i > 0; i--) {
    if (cellOf(f, i, c) !== cellOf(f, i - 1, c)) {
      take.add(i);
      c -= at(items, i - 1).w;
    }
  }
  const cell = 40;
  const x0 = 170;
  const y0 = 50;
  const hi = { i: 3, c: 7 };
  const it = at(items, hi.i - 1);
  let body = gridHeaders(
    x0,
    y0,
    cell,
    ["前 0 個", ...items.map((t, k) => `前 ${k + 1} 個 (w${t.w},v${t.v})`)],
    Array.from({ length: Wc + 1 }, (_, c) => `c=${c}`),
  );
  body += grid(x0, y0, n + 1, Wc + 1, {
    cell,
    label: (i, c) => cellOf(f, i, c),
    fill: (i, c) =>
      i === hi.i && c === hi.c
        ? C.orangeSoft
        : i === hi.i - 1 && (c === hi.c || c === hi.c - it.w)
          ? C.blueSoft
          : i === 0
            ? C.gray
            : undefined,
    size: 14,
  });
  const cx = (c: number) => x0 + c * cell + cell / 2;
  const cy = (i: number) => y0 + i * cell + cell / 2;
  body += line(cx(hi.c), cy(hi.i - 1) + 12, cx(hi.c), cy(hi.i) - 12, {
    stroke: C.blue,
    arrow: "end",
    marker: "ah-blue",
    sw: 1.8,
  });
  body += line(
    cx(hi.c - it.w) + 10,
    cy(hi.i - 1) + 10,
    cx(hi.c) - 12,
    cy(hi.i) - 10,
    { stroke: C.orange, arrow: "end", marker: "ah-orange", sw: 1.8 },
  );
  const yb = y0 + (n + 1) * cell + 26;
  body += text(
    20,
    yb,
    `f[i][c] = max( f[i−1][c]（不選第 i 個）, f[i−1][c−w_i] + v_i（選）)。例：f[3][7] = max(${cellOf(f, 2, 7)}, ${cellOf(f, 2, 7 - it.w)} + ${it.v}) = ${cellOf(f, 3, 7)}。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    yb + 20,
    `容量 ${Wc} 的最大價值 = ${cellOf(f, n, Wc)}，回溯得選第 ${[...take].sort().join("、")} 個物品。兩個來源都在上一列 → 一維滾動時 c 必須倒序。`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, yb + 36, body);
}

function knapsackOrder(): string {
  const cell = 40;
  const x0 = 60;
  let body = "";
  const draw = (
    y: number,
    title: string,
    reverse: boolean,
    color: string,
    note: string,
  ) => {
    body += panelTitle(x0, y - 22, title, { color });
    body += array(
      x0,
      y,
      Array.from({ length: 9 }, (_, c) => `f${c}`),
      {
        cell,
        size: 11,
        fill: (c) =>
          c === 7 ? C.orangeSoft : c === 4 ? C.blueSoft : undefined,
      },
    );
    body += path(
      `M${x0 + 4 * cell + cell / 2},${y} Q${x0 + 5.5 * cell + cell / 2},${y - 32} ${x0 + 7 * cell + cell / 2 - 4},${y - 2}`,
      {
        stroke: color,
        arrow: "end",
        marker: color === C.orange ? "ah-orange" : "ah-green",
        sw: 1.8,
      },
    );
    const dir = reverse ? "← c 由大到小" : "c 由小到大 →";
    body += text(x0 + 9 * cell + 16, y + cell / 2, dir, {
      anchor: "start",
      size: 12,
      weight: "bold",
      fill: color,
    });
    body += text(x0, y + cell + 20, note, { anchor: "start", size: 12 });
  };
  draw(
    50,
    "0-1 背包（每個物品至多一次）：倒序",
    true,
    C.orange,
    "更新 f[7] 時，f[4] 還是「上一個物品」的舊值 → 物品 w=3 不會被重複使用。",
  );
  draw(
    160,
    "完全背包（每個物品無限次）：正序",
    false,
    C.green,
    "更新 f[7] 時，f[4] 已經是「本物品」的新值 → 允許再選一次同一物品。",
  );
  return svg(640, 240, body);
}

function lcsFigure(): string {
  const a = "abcde";
  const b = "ace";
  const n = a.length;
  const m = b.length;
  const f: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      at(f, i)[j] =
        a.charAt(i - 1) === b.charAt(j - 1)
          ? cellOf(f, i - 1, j - 1) + 1
          : Math.max(cellOf(f, i - 1, j), cellOf(f, i, j - 1));
  const pathCells: [number, number, "diag" | "up" | "left"][] = [];
  for (let i = n, j = m; i > 0 && j > 0; ) {
    if (a.charAt(i - 1) === b.charAt(j - 1)) {
      pathCells.push([i, j, "diag"]);
      i--;
      j--;
    } else if (cellOf(f, i - 1, j) >= cellOf(f, i, j - 1)) {
      pathCells.push([i, j, "up"]);
      i--;
    } else {
      pathCells.push([i, j, "left"]);
      j--;
    }
  }
  const cell = 44;
  const x0 = 90;
  const y0 = 70;
  let body = gridHeaders(
    x0,
    y0,
    cell,
    ["", ...a.split("")],
    ["", ...b.split("")],
    { size: 14, color: C.ink },
  );
  body += text(x0 - 40, y0 - 30, "s \\ t", { size: 11, fill: C.muted });
  body += grid(x0, y0, n + 1, m + 1, {
    cell,
    label: (i, j) => cellOf(f, i, j),
    fill: (i, j) => {
      const p = pathCells.find(([pi, pj]) => pi === i && pj === j);
      if (p) return p[2] === "diag" ? C.greenSoft : C.yellowSoft;
      return i === 0 || j === 0 ? C.gray : undefined;
    },
    size: 14,
  });
  for (const [i, j, d] of pathCells) {
    const cx = x0 + j * cell + cell / 2;
    const cy = y0 + i * cell + cell / 2;
    if (d === "diag")
      body += line(cx - 8, cy - 8, cx - cell + 12, cy - cell + 12, {
        stroke: C.green,
        arrow: "end",
        marker: "ah-green",
        sw: 1.8,
      });
    else if (d === "up")
      body += line(cx, cy - 10, cx, cy - cell + 12, {
        stroke: C.orange,
        arrow: "end",
        marker: "ah-orange",
        sw: 1.6,
      });
    else
      body += line(cx - 10, cy, cx - cell + 12, cy, {
        stroke: C.orange,
        arrow: "end",
        marker: "ah-orange",
        sw: 1.6,
      });
  }
  const tx = x0 + (m + 1) * cell + 30;
  body += text(tx, y0 + 10, "s[i−1] = t[j−1]：", {
    anchor: "start",
    size: 12,
    weight: "bold",
    fill: C.green,
  });
  body += text(tx, y0 + 32, "  f[i][j] = f[i−1][j−1] + 1（斜向）", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 60, "否則：", {
    anchor: "start",
    size: 12,
    weight: "bold",
    fill: C.orange,
  });
  body += text(tx, y0 + 82, "  f[i][j] = max(f[i−1][j], f[i][j−1])", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 116, `LCS 長度 = ${cellOf(f, n, m)}；從右下角回溯，`, {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 138, '綠色斜向格子的字元即 "ace"。', {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 168, "第 0 列、第 0 行是空字串（灰）。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, y0 + (n + 1) * cell + 16, body);
}

function lisTails(): string {
  const nums = [10, 9, 2, 5, 3, 7, 101, 18];
  const cell = 40;
  const x0 = 150;
  let body = text(20, 16, `nums = [${nums.join(", ")}]`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.muted,
  });
  const g: number[] = [];
  nums.forEach((x, k) => {
    let lo = 0;
    let hi = g.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (at(g, mid) < x) lo = mid + 1;
      else hi = mid;
    }
    const replaced = lo < g.length ? at(g, lo) : null;
    if (lo === g.length) g.push(x);
    else g[lo] = x;
    const y = 34 + k * 40;
    body += text(20, y + 16, `讀入 ${x}`, {
      anchor: "start",
      size: 12,
      mono: true,
    });
    body += array(x0, y, [...g], {
      cell,
      h: 32,
      fill: (i) =>
        i === lo
          ? replaced === null
            ? C.greenSoft
            : C.orangeSoft
          : C.blueSoft,
    });
    body += text(
      x0 + 5 * cell + 16,
      y + 16,
      replaced === null
        ? `比所有尾巴都大 → 接在最後（長度 ${g.length}）`
        : `替換 g[${lo}] = ${replaced} → ${x}（同長度、結尾更小）`,
      {
        anchor: "start",
        size: 12,
        fill: replaced === null ? C.green : C.orange,
      },
    );
  });
  const y = 34 + nums.length * 40 + 8;
  body += text(
    20,
    y,
    `g[k] = 長度為 k+1 的遞增子序列的最小結尾；g 嚴格遞增，所以每次用二分找第一個 ≥ x 的位置。LIS 長度 = ${g.length}。`,
    { anchor: "start", size: 12 },
  );
  return svg(660, y + 16, body);
}

function partitionDp(): string {
  const s = "aabbcbd";
  const cell = 44;
  const x0 = 60;
  const i = 6;
  const j = 3;
  let body = array(x0, 50, s.split(""), {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (k) =>
      k >= j && k < i ? C.orangeSoft : k < j ? C.blueSoft : undefined,
  });
  body += brace(
    x0 + 2,
    x0 + j * cell - 2,
    50 + cell + 6,
    "f[j]：前 j 個字元的最優劃分",
    { color: C.blue },
  );
  body += brace(
    x0 + j * cell + 2,
    x0 + i * cell - 2,
    50 + cell + 36,
    "最後一段 s[j..i−1]",
    { color: C.orange },
  );
  body += line(x0 + j * cell, 30, x0 + j * cell, 50 + cell + 2, {
    stroke: C.red,
    dash: "5 3",
    sw: 1.6,
  });
  body += text(x0 + j * cell, 22, "切點 j", {
    size: 12,
    fill: C.red,
    weight: "bold",
  });
  body += text(
    x0,
    190,
    "f[i] = min over j < i { f[j] + cost(s[j..i−1]) }（最優劃分；判定型則是 OR、計數型則是求和）",
    { anchor: "start", size: 12, mono: false },
  );
  body += text(
    x0,
    212,
    "列舉「最後一段從哪裡開始」，把長度 i 的問題化成長度 j 的子問題。狀態 O(n)、轉移 O(n) → O(n²)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 228, body);
}

function stockMachine(): string {
  const nodes: GNode[] = [
    { id: "free", label: "", x: 150, y: 110, fill: C.blueSoft },
    { id: "hold", label: "", x: 400, y: 110, fill: C.orangeSoft },
  ];
  let body = "";
  body += `<ellipse cx="150" cy="110" rx="70" ry="38" fill="${C.blueSoft}" stroke="${C.ink}" stroke-width="1.4"/>`;
  body += `<ellipse cx="400" cy="110" rx="70" ry="38" fill="${C.orangeSoft}" stroke="${C.ink}" stroke-width="1.4"/>`;
  body += text(150, 104, "不持有", { size: 14, weight: "bold" });
  body += text(150, 124, "f[i][0]", { size: 12, mono: true, fill: C.muted });
  body += text(400, 104, "持有", { size: 14, weight: "bold" });
  body += text(400, 124, "f[i][1]", { size: 12, mono: true, fill: C.muted });
  body += path("M205,88 Q275,40 345,88", {
    stroke: C.red,
    sw: 2,
    arrow: "end",
    marker: "ah-red",
  });
  body += text(275, 44, "買入：− prices[i]", {
    size: 12,
    fill: C.red,
    weight: "bold",
  });
  body += path("M345,132 Q275,180 205,132", {
    stroke: C.green,
    sw: 2,
    arrow: "end",
    marker: "ah-green",
  });
  body += text(275, 178, "賣出：+ prices[i]", {
    size: 12,
    fill: C.green,
    weight: "bold",
  });
  body += path("M95,90 C40,40 40,180 95,130", { stroke: C.ink, arrow: "end" });
  body += text(40, 110, "休息", { size: 12, anchor: "end" });
  body += path("M455,90 C510,40 510,180 455,130", {
    stroke: C.ink,
    arrow: "end",
  });
  body += text(510, 110, "休息", { size: 12, anchor: "start" });
  void nodes;
  body += text(20, 216, "f[i][0] = max(f[i−1][0], f[i−1][1] + p[i])", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(20, 236, "f[i][1] = max(f[i−1][1], f[i−1][0] − p[i])", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(
    20,
    262,
    "每天的決策只依賴「昨天的狀態」。限制交易次數 → 狀態再加一維 k；冷凍期 → 賣出後改從 f[i−2] 轉移。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(600, 278, body);
}

function palSubseq(): string {
  const s = "bbbab";
  const n = s.length;
  const f: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    at(f, i)[i] = 1;
    for (let j = i + 1; j < n; j++)
      at(f, i)[j] =
        s.charAt(i) === s.charAt(j)
          ? cellOf(f, i + 1, j - 1) + 2
          : Math.max(cellOf(f, i + 1, j), cellOf(f, i, j - 1));
  }
  const cell = 48;
  const x0 = 80;
  const y0 = 60;
  const fills = [C.gray, C.blueSoft, C.greenSoft, C.yellowSoft, C.orangeSoft];
  let body = gridHeaders(
    x0,
    y0,
    cell,
    s.split("").map((c, i) => `i=${i} ${c}`),
    s.split("").map((c, j) => `j=${j} ${c}`),
  );
  body += grid(x0, y0, n, n, {
    cell,
    label: (i, j) => (j >= i ? cellOf(f, i, j) : ""),
    fill: (i, j) => (j >= i ? at(fills, Math.min(4, j - i)) : C.paper),
    bold: (i, j) => i === 0 && j === n - 1,
    size: 15,
  });
  const tx = x0 + n * cell + 26;
  body += text(tx, y0 + 10, "f[i][j]：s[i..j] 的最長迴文子序列", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, y0 + 36, "s[i] = s[j]：f[i+1][j−1] + 2", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 58, "否則：max(f[i+1][j], f[i][j−1])", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 90, "顏色 = 區間長度（對角線）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 112, "每格依賴左、下、左下 → 按長度", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 134, "由短到長（或 i 由大到小）填表。", {
    anchor: "start",
    size: 12,
  });
  body += text(
    tx,
    y0 + 164,
    `答案在右上角 f[0][${n - 1}] = ${cellOf(f, 0, n - 1)}。`,
    { anchor: "start", size: 12, fill: C.orange, weight: "bold" },
  );
  return svg(660, y0 + n * cell + 16, body);
}

function intervalSplit(): string {
  const cell = 48;
  const x0 = 70;
  const n = 7;
  const i = 1;
  const k = 3;
  const j = 5;
  let body = array(
    x0,
    40,
    Array.from({ length: n }, (_, t) => `a${t}`),
    {
      cell,
      size: 13,
      fill: (t) =>
        t >= i && t <= k
          ? C.blueSoft
          : t > k && t <= j
            ? C.greenSoft
            : undefined,
    },
  );
  body += brace(x0 + i * cell + 2, x0 + (j + 1) * cell - 2, 40, "區間 [i, j]", {
    above: true,
    color: C.ink,
  });
  body += brace(
    x0 + i * cell + 2,
    x0 + (k + 1) * cell - 2,
    40 + cell + 4,
    "f[i][k]",
    { color: C.blue },
  );
  body += brace(
    x0 + (k + 1) * cell + 2,
    x0 + (j + 1) * cell - 2,
    40 + cell + 4,
    "f[k+1][j]",
    { color: C.green },
  );
  body += line(x0 + (k + 1) * cell, 40, x0 + (k + 1) * cell, 40 + cell + 30, {
    stroke: C.red,
    dash: "5 3",
    sw: 1.6,
  });
  body += text(x0 + (k + 1) * cell, 40 + cell + 44, "分割點 k | k+1", {
    size: 12,
    fill: C.red,
    weight: "bold",
  });
  body += text(
    x0,
    160,
    "f[i][j] = min over i ≤ k < j { f[i][k] + f[k+1][j] + cost(i, j) }",
    { anchor: "start", size: 13, mono: true },
  );
  body += text(
    x0,
    184,
    "子區間都比 [i, j] 短 → 外層迴圈按區間長度由小到大；共 O(n²) 狀態 × O(n) 轉移 = O(n³)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(600, 200, body);
}

function subsetLattice(): string {
  const n = 3;
  const levels: number[][] = [[], [], [], []];
  for (let m = 0; m < 1 << n; m++) {
    let pc = 0;
    for (let b = 0; b < n; b++) pc += (m >> b) & 1;
    at(levels, pc).push(m);
  }
  const pos = new Map<number, [number, number]>();
  levels.forEach((L, d) => {
    L.forEach((m, k) =>
      pos.set(m, [320 + (k - (L.length - 1) / 2) * 130, 40 + d * 80]),
    );
  });
  let body = "";
  for (let m = 0; m < 1 << n; m++) {
    for (let b = 0; b < n; b++) {
      if ((m >> b) & 1) continue;
      const t = m | (1 << b);
      const [x1, y1] = pos.get(m)!;
      const [x2, y2] = pos.get(t)!;
      body += line(x1, y1 + 16, x2, y2 - 16, {
        stroke: C.line,
        arrow: "end",
        marker: "ah-muted",
        sw: 1.2,
      });
    }
  }
  for (const [m, [x, y]] of pos) {
    body += rect(x - 38, y - 15, 76, 30, {
      fill: C.blueSoft,
      stroke: C.ink,
      rx: 15,
    });
    body += text(x, y + 1, m.toString(2).padStart(n, "0"), {
      mono: true,
      size: 14,
    });
  }
  body += text(40, 40, "已選集合", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  levels.forEach(
    (_, d) =>
      (body += text(40, 40 + d * 80, `|S| = ${d}`, {
        anchor: "start",
        size: 12,
        fill: C.muted,
      })),
  );
  body += text(
    40,
    330,
    "f[S]：已經安排好集合 S 裡的元素（排列型狀壓 ①：只與 |S| 有關，不在乎順序）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    40,
    350,
    "每條邊 = 多加入一個元素；mask 從小到大遍歷即為合法順序。n 個元素 → 2^n 個狀態、n·2^n 次轉移。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 366, body);
}

function tspFigure(): string {
  const pos: [number, number][] = [
    [60, 80],
    [200, 40],
    [220, 170],
    [80, 200],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y,
    fill: i === 0 || i === 1 || i === 3 ? C.orangeSoft : C.paper,
  }));
  let body = drawGraph(nodes, [
    { a: 0, b: 1, directed: true, color: C.orange, sw: 2.4 },
    { a: 1, b: 3, directed: true, color: C.orange, sw: 2.4 },
    { a: 3, b: 2, directed: true, color: C.blue, sw: 2.2, dash: "5 3" },
  ]);
  const tx = 300;
  body += text(tx, 40, "狀態 f[S][v]：", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 64, "已經走過集合 S，且目前停在 v", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 94, "例：S = {0, 1, 3} = 1011₂，v = 3（橘色）", {
    anchor: "start",
    size: 12,
    mono: false,
    fill: C.orange,
  });
  body += text(tx, 124, "轉移：走到尚未造訪的 u（藍色虛線）", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 146, "f[S ∪ {u}][u] ← f[S][v] + dist(v, u)", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.blue,
  });
  body += text(tx, 176, "與「排列型①」不同：下一步的代價", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 198, "取決於「最後一個」元素 → 狀態多存 v。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 228, "複雜度 O(2^n · n²)。", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  return svg(620, 250, body);
}

function profileDp(): string {
  const R = 4;
  const Cn = 6;
  const cell = 40;
  const x0 = 40;
  const y0 = 30;
  const ci = 2;
  const cj = 3; // current cell
  let body = grid(x0, y0, R, Cn, {
    cell,
    fill: (r, c) =>
      r < ci || (r === ci && c < cj)
        ? C.blueSoft
        : r === ci && c === cj
          ? C.orangeSoft
          : undefined,
  });
  // Profile line: cells whose state is stored (last Cn cells processed).
  let d = `M${x0},${y0 + (ci + 1) * cell} L${x0 + cj * cell},${y0 + (ci + 1) * cell} L${x0 + cj * cell},${y0 + ci * cell} L${x0 + Cn * cell},${y0 + ci * cell}`;
  body += path(d, { stroke: C.red, sw: 3.2 });
  d = "";
  for (let c = 0; c < Cn; c++) {
    const r = c < cj ? ci : ci - 1;
    body += text(
      x0 + c * cell + cell / 2,
      y0 + r * cell + cell / 2 + 1,
      `b${c}`,
      { size: 11, mono: true, fill: C.red, weight: "bold" },
    );
  }
  body += text(x0 + cj * cell + cell / 2, y0 + ci * cell + cell / 2 + 1, "?", {
    size: 14,
    weight: "bold",
  });
  const tx = x0 + Cn * cell + 24;
  body += text(tx, y0 + 12, "逐格處理（藍 = 已決定）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 36, "紅色輪廓線上的 m 個格子", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, y0 + 58, "（b0…b5）用一個 m 位 mask 表示：", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, y0 + 80, "它們是還會影響未來的全部資訊。", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, y0 + 110, "處理「?」時只看它上方 b3 與", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 132, "左方 b2，然後輪廓線右移一格。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 162, "複雜度 O(n·m·2^m)。", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  return svg(620, y0 + R * cell + 16, body);
}

function sosFigure(): string {
  const n = 3;
  const a = [1, 2, 4, 3, 5, 1, 2, 6];
  const steps: number[][] = [a.slice()];
  const f = a.slice();
  for (let b = 0; b < n; b++) {
    for (let m = 0; m < 1 << n; m++)
      if ((m >> b) & 1) f[m] = at(f, m) + at(f, m ^ (1 << b));
    steps.push(f.slice());
  }
  const cell = 50;
  const x0 = 120;
  let body = "";
  for (let m = 0; m < 1 << n; m++)
    body += text(x0 + m * cell + cell / 2, 18, m.toString(2).padStart(n, "0"), {
      size: 11,
      mono: true,
      fill: C.muted,
    });
  steps.forEach((row, k) => {
    const y = 28 + k * 62;
    body += text(
      x0 - 12,
      y + 18,
      k === 0 ? "a[mask]" : `處理第 ${k - 1} 位後`,
      { anchor: "end", size: 12 },
    );
    body += array(x0, y, row, {
      cell,
      h: 36,
      size: 13,
      fill: (m) =>
        k > 0 && (m >> (k - 1)) & 1
          ? C.orangeSoft
          : k === n
            ? C.greenSoft
            : undefined,
    });
    if (k > 0) {
      const b = k - 1;
      for (let m = 0; m < 1 << n; m++) {
        if (!((m >> b) & 1)) continue;
        const src = m ^ (1 << b);
        const x1 = x0 + src * cell + cell / 2;
        const x2 = x0 + m * cell + cell / 2;
        if (m === 7 || (b === 0 && m === 1))
          body += line(x1, y - 26, x2 - 3, y - 2, {
            stroke: C.orange,
            arrow: "end",
            marker: "ah-orange",
            sw: 1.3,
          });
      }
    }
  });
  const y = 28 + steps.length * 62;
  body += text(
    20,
    y,
    "f[mask] = Σ a[sub]，sub ⊆ mask。逐位處理：第 b 位為 1 的 mask 加上「把第 b 位清掉」的值（橘色格被更新）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    y + 20,
    `最後一列 f[111] = ${at(f, 7)} = 所有 a 之和；總複雜度 O(n·2^n)，取代 O(3^n) 的子集枚舉。`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y + 36, body);
}

function digitTree(): string {
  const N = "235";
  const root: TreeNode = { label: "", fill: C.gray };
  const mk = (pos: number, limit: boolean): TreeNode[] => {
    if (pos >= N.length) return [];
    const up = limit ? Number(N.charAt(pos)) : 9;
    const kids: TreeNode[] = [];
    for (let d = 0; d <= up; d++) {
      const isLim = limit && d === up;
      if (pos === 0 || isLim || d === 0 || d === up) {
        kids.push({
          label: d,
          fill: isLim ? C.orangeSoft : C.blueSoft,
          stroke: isLim ? C.orange : C.ink,
          children: isLim ? mk(pos + 1, true) : [],
          note:
            !isLim && pos < N.length - 1
              ? `${10 ** (N.length - 1 - pos)} 種`
              : undefined,
          noteColor: C.blue,
        });
      } else if (d === 1 && up > 2) {
        kids.push({ label: "…", fill: C.paper, stroke: C.line });
      }
    }
    return kids;
  };
  root.children = mk(0, true);
  root.label = "·";
  const placed = layoutTree(root, 50, 62, 30, 30);
  let body = drawTree(placed, { r: 14, size: 12 });
  const tx = 480;
  body += text(tx, 30, `統計 0..${N} 的數字：`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 54, "從高位往低位逐位填數。", { anchor: "start", size: 12 });
  body += text(tx, 80, "橘色：isLimit = true，", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 100, "前綴與 N 相同，下一位", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 120, "只能填到 N 對應的那一位。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 148, "藍色：已經比 N 小，", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 168, "之後各位可任意填 0..9——", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 188, "這些子樹形狀相同，記憶化", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 208, "(pos, 狀態) 即可共用。", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  return svg(660, 250, body);
}

function monoQueueDp(): string {
  const f = [3, 5, 2, 6, 8, 1, 5, 3, 2];
  const k = 4;
  const i = 8;
  const cell = 44;
  const x0 = 60;
  const win = [i - k, i - 1];
  // Deque of candidate indices in window with decreasing f.
  const dq: number[] = [];
  for (let j = win[0]!; j <= win[1]!; j++) {
    while (dq.length && at(f, at(dq, dq.length - 1)) <= at(f, j)) dq.pop();
    dq.push(j);
  }
  let body = array(
    x0,
    50,
    f.map((v, j) => (j === i ? "?" : v)),
    {
      cell,
      showIndex: true,
      indexBelow: false,
      fill: (j) =>
        j === i
          ? C.orangeSoft
          : j >= win[0]! && j <= win[1]!
            ? dq.includes(j)
              ? C.greenSoft
              : C.blueSoft
            : undefined,
    },
  );
  body += brace(
    x0 + win[0]! * cell + 2,
    x0 + (win[1]! + 1) * cell - 2,
    50 + cell + 6,
    `可轉移的 j ∈ [i−${k}, i−1]`,
    { color: C.blue },
  );
  body += text(x0 - 10, 50 + cell / 2, "f", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  const y = 140;
  body += panelTitle(x0, y, "單調佇列（下標，對應 f 值遞減）：");
  dq.forEach((j, t) => {
    body += rect(x0 + 230 + t * 60, y - 14, 56, 28, {
      fill: C.greenSoft,
      stroke: C.green,
      rx: 4,
    });
    body += text(x0 + 230 + t * 60 + 28, y, `${j}:${at(f, j)}`, {
      mono: true,
      size: 12,
    });
  });
  body += text(x0 + 230 - 8, y + 26, "隊首 = 視窗最大值", {
    anchor: "start",
    size: 11,
    fill: C.green,
  });
  body += text(
    x0,
    196,
    `f[i] = max{ f[j] : i−k ≤ j < i } + cost(i)：轉移來源是一個滑動視窗，隊首即最佳 j（此處 j = ${at(dq, 0)}）。`,
    { anchor: "start", size: 12 },
  );
  body += text(x0, 216, "每個 j 進出佇列各一次，轉移從 O(k) 降為均攤 O(1)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 232, body);
}

function matrixPower(): string {
  let body = "";
  const mat = (
    x: number,
    y: number,
    rows: (string | number)[][],
    label?: string,
  ) => {
    const cw = typeof at(at(rows, 0), 0) === "string" ? 64 : 40;
    const h = rows.length * 30;
    body += path(
      `M${x + 6},${y} L${x},${y} L${x},${y + h} L${x + 6},${y + h}`,
      { sw: 1.6 },
    );
    const w = at(rows, 0).length * cw;
    body += path(
      `M${x + w - 6},${y} L${x + w},${y} L${x + w},${y + h} L${x + w - 6},${y + h}`,
      { sw: 1.6 },
    );
    rows.forEach((r, i) =>
      r.forEach(
        (v, j) =>
          (body += text(x + j * cw + cw / 2, y + i * 30 + 15, v, {
            mono: true,
            size: 13,
          })),
      ),
    );
    if (label)
      body += text(x + w / 2, y + h + 16, label, { size: 11, fill: C.muted });
    return w;
  };
  let x = 30;
  x += mat(x, 30, [["F(n+1)"], ["F(n)"]]) + 14;
  body += text(x, 60, "=", { size: 16 });
  x += 20;
  x +=
    mat(x, 30, [
      [1, 1],
      [1, 0],
    ]) + 6;
  body += text(x + 4, 26, "n", { size: 11, mono: true });
  x += 18;
  mat(x, 30, [["F(1)"], ["F(0)"]]);
  body += panelTitle(30, 130, "快速冪：n = 13 = 1101₂");
  const n = 13;
  const powers = [1, 2, 4, 8];
  powers.forEach((p, k) => {
    const used = (n >> k) & 1;
    body += rect(30 + k * 110, 146, 100, 34, {
      fill: used ? C.orangeSoft : C.gray,
      stroke: used ? C.orange : C.line,
      rx: 4,
    });
    body += text(30 + k * 110 + 50, 163, `M^${p}`, {
      mono: true,
      size: 14,
      weight: used ? "bold" : undefined,
    });
    if (k < 3)
      body += text(30 + k * 110 + 105, 163, "→²", { size: 11, fill: C.muted });
  });
  body += text(
    30,
    204,
    "M^13 = M^8 · M^4 · M^1（橘色對應 n 的二進位 1）：只需 ⌈log₂ n⌉ 次平方與至多同樣多次乘法。",
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    224,
    "線性遞推的轉移寫成 k×k 矩陣後，DP 從 O(n·k) 變成 O(k³ log n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 240, body);
}

function convexHullTrick(): string {
  const pts: [number, number][] = [
    [1, 7],
    [2, 4],
    [3, 3.2],
    [4, 3.8],
    [5, 2],
    [6, 2.6],
    [7, 3.4],
  ];
  // Lower hull.
  const cross = (
    o: [number, number],
    a: [number, number],
    b: [number, number],
  ) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const hull: [number, number][] = [];
  for (const p of pts) {
    while (
      hull.length >= 2 &&
      cross(at(hull, hull.length - 2), at(hull, hull.length - 1), p) <= 0
    )
      hull.pop();
    hull.push(p);
  }
  const X = (x: number) => 60 + x * 60;
  const Y = (y: number) => 230 - y * 26;
  let body = axes(40, 20, 470, 220, { xLabel: "x_j", yLabel: "y_j" });
  body += path(
    hull.map(([x, y], i) => `${i ? "L" : "M"}${X(x)},${Y(y)}`).join(" "),
    { stroke: C.green, sw: 2.4 },
  );
  // Query slope k: minimize y - k x, tangent point.
  const k = -0.9;
  let bestI = 0;
  hull.forEach(([x, y], i) => {
    const [bx, by] = at(hull, bestI);
    if (y - k * x < by - k * bx) bestI = i;
  });
  const [tx, ty] = at(hull, bestI);
  const b0 = ty - k * tx;
  body += line(X(0.2), Y(k * 0.2 + b0), X(7.6), Y(k * 7.6 + b0), {
    stroke: C.orange,
    sw: 1.8,
    dash: "6 4",
  });
  for (const [x, y] of pts) {
    const onHull = hull.some(([hx, hy]) => hx === x && hy === y);
    body += circle(X(x), Y(y), 5, {
      fill: onHull ? C.green : C.paper,
      stroke: onHull ? C.green : C.line,
    });
  }
  body += circle(X(tx), Y(ty), 9, { fill: "none", stroke: C.orange, sw: 2.4 });
  body += text(X(7.6) + 6, Y(k * 7.6 + b0), `斜率 k_i`, {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(520, 40, "f[i] = min_j (y_j − k_i · x_j) + …", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(520, 66, "每個 j 是平面上一點 (x_j, y_j)。", {
    anchor: "start",
    size: 12,
  });
  body += text(520, 88, "用斜率 k_i 的直線由下往上平移，", {
    anchor: "start",
    size: 12,
  });
  body += text(520, 110, "第一個碰到的點就是最佳 j。", {
    anchor: "start",
    size: 12,
  });
  body += text(520, 140, "最佳點一定在下凸殼（綠）上；", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(520, 162, "空心點永遠不會是答案。", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(520, 192, "k_i 單調 → 單調佇列 O(n)；", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(520, 214, "否則在凸殼上二分 O(n log n)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(760, 266, body);
}

// --- Trees ---------------------------------------------------------------

interface T {
  v: number;
  c: T[];
}
const SAMPLE_TREE: T = {
  v: 0,
  c: [
    {
      v: 1,
      c: [
        { v: 3, c: [] },
        { v: 4, c: [{ v: 7, c: [] }] },
      ],
    },
    {
      v: 2,
      c: [
        {
          v: 5,
          c: [
            { v: 8, c: [] },
            { v: 9, c: [] },
          ],
        },
        { v: 6, c: [] },
      ],
    },
  ],
};

function treeDiameter(): string {
  const depth = new Map<number, number>();
  let best = 0;
  let bestNode = 0;
  const h = (t: T): number => {
    let m1 = 0;
    let m2 = 0;
    for (const c of t.c) {
      const d = h(c) + 1;
      if (d > m1) {
        m2 = m1;
        m1 = d;
      } else if (d > m2) m2 = d;
    }
    depth.set(t.v, m1);
    if (m1 + m2 > best) {
      best = m1 + m2;
      bestNode = t.v;
    }
    return m1;
  };
  h(SAMPLE_TREE);
  // Path: from bestNode down two deepest children.
  const onPath = new Set<number>([bestNode]);
  const find = (v: number, t: T): T | undefined =>
    t.v === v ? t : t.c.map((c) => find(v, c)).find(Boolean);
  const top = find(bestNode, SAMPLE_TREE)!;
  const down = (t: T) => {
    let cur = t;
    while (cur.c.length) {
      cur = cur.c.reduce((a, b) =>
        (depth.get(a.v) ?? 0) >= (depth.get(b.v) ?? 0) ? a : b,
      );
      onPath.add(cur.v);
    }
  };
  const kids = [...top.c]
    .sort((a, b) => (depth.get(b.v) ?? 0) - (depth.get(a.v) ?? 0))
    .slice(0, 2);
  kids.forEach((k) => {
    onPath.add(k.v);
    down(k);
  });
  const toNode = (t: T): TreeNode => ({
    label: t.v,
    fill:
      t.v === bestNode
        ? C.orangeSoft
        : onPath.has(t.v)
          ? C.yellowSoft
          : C.paper,
    note: `h=${depth.get(t.v)}`,
    edgeColor: undefined,
    children: t.c.map(toNode),
  });
  const root = toNode(SAMPLE_TREE);
  const mark = (n: TreeNode, parentOn: boolean) => {
    const on = onPath.has(Number(n.label));
    if (on && parentOn) n.edgeColor = C.orange;
    n.children?.forEach((c) => c && mark(c, on));
  };
  mark(root, false);
  const placed = layoutTree(root, 56, 70, 40, 30);
  let body = drawTree(placed);
  const tx = 470;
  body += text(tx, 40, "h = 以該點為根的子樹高度（邊數）", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 66, "在每個點「拐彎」：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 88, "經過 v 的最長路 = 最深兩個子樹", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 110, "的 (h + 1) 之和。", { anchor: "start", size: 12 });
  body += text(tx, 140, `直徑 = ${best}，在點 ${bestNode}（橘）拐彎。`, {
    anchor: "start",
    size: 12,
    fill: C.orange,
    weight: "bold",
  });
  body += text(tx, 170, "一次後序 DFS：回傳 h，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 192, "同時用 m1 + m2 更新答案。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 300, body);
}

function treeIndependentSet(): string {
  const w: Record<number, number> = {
    0: 3,
    1: 4,
    2: 5,
    3: 1,
    4: 3,
    5: 1,
    6: 2,
    7: 6,
    8: 2,
    9: 3,
  };
  const res = new Map<number, [number, number]>();
  const dfs = (t: T): [number, number] => {
    let take = w[t.v] ?? 0;
    let skip = 0;
    for (const c of t.c) {
      const [ct, cs] = dfs(c);
      take += cs;
      skip += Math.max(ct, cs);
    }
    res.set(t.v, [take, skip]);
    return [take, skip];
  };
  dfs(SAMPLE_TREE);
  const chosen = new Set<number>();
  const pick = (t: T, parentTaken: boolean) => {
    const [tk, sk] = res.get(t.v)!;
    const takeIt = !parentTaken && tk >= sk;
    if (takeIt) chosen.add(t.v);
    t.c.forEach((c) => pick(c, takeIt));
  };
  pick(SAMPLE_TREE, false);
  const toNode = (t: T): TreeNode => {
    const [tk, sk] = res.get(t.v)!;
    return {
      label: `${w[t.v]}`,
      fill: chosen.has(t.v) ? C.orangeSoft : C.paper,
      note: `(${tk}, ${sk})`,
      children: t.c.map(toNode),
    };
  };
  const placed = layoutTree(toNode(SAMPLE_TREE), 58, 72, 40, 30);
  let body = drawTree(placed);
  const [rt, rs] = res.get(0)!;
  const tx = 480;
  body += text(tx, 40, "節點上的數字 = 權重", { anchor: "start", size: 12 });
  body += text(tx, 62, "(選, 不選) = 子樹內最大權", {
    anchor: "start",
    size: 12,
    mono: false,
  });
  body += text(tx, 92, "選 v：子節點都不能選", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 114, "  w[v] + Σ 不選(c)", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 140, "不選 v：子節點任意", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 162, "  Σ max(選(c), 不選(c))", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 194, `答案 = max(${rt}, ${rs}) = ${Math.max(rt, rs)}`, {
    anchor: "start",
    size: 12,
    fill: C.orange,
    weight: "bold",
  });
  body += text(tx, 216, "橘色是一組最佳選法。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  return svg(700, 310, body);
}

function rerootFigure(): string {
  // Sum of distances (LC 834).
  const n = 6;
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [2, 3],
    [2, 4],
    [2, 5],
  ];
  const g: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(([a, b]) => {
    at(g, a).push(b);
    at(g, b).push(a);
  });
  const size = new Array<number>(n).fill(1);
  const ans = new Array<number>(n).fill(0);
  const dfs1 = (u: number, p: number, d: number) => {
    ans[0] = at(ans, 0) + d;
    for (const v of at(g, u))
      if (v !== p) {
        dfs1(v, u, d + 1);
        size[u] = at(size, u) + at(size, v);
      }
  };
  dfs1(0, -1, 0);
  const dfs2 = (u: number, p: number) => {
    for (const v of at(g, u))
      if (v !== p) {
        ans[v] = at(ans, u) + n - 2 * at(size, v);
        dfs2(v, u);
      }
  };
  dfs2(0, -1);
  const pos: [number, number][] = [
    [120, 50],
    [60, 150],
    [220, 150],
    [150, 250],
    [220, 250],
    [290, 250],
  ];
  const sub = new Set([2, 3, 4, 5]);
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y,
    fill: sub.has(i) ? C.greenSoft : C.blueSoft,
    note: `ans=${at(ans, i)}`,
    noteDy: i === 0 ? -26 : 30,
  }));
  let body = `<ellipse cx="220" cy="215" rx="115" ry="72" fill="none" stroke="${C.green}" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  body += drawGraph(
    nodes,
    edges.map(([a, b]) => ({
      a,
      b,
      color: a === 0 && b === 2 ? C.orange : C.ink,
      sw: a === 0 && b === 2 ? 3 : 1.4,
    })),
  );
  body += text(120, 300, `綠色虛線圈：size[2] = ${at(size, 2)}`, {
    anchor: "start",
    size: 12,
    fill: C.green,
    weight: "bold",
  });
  const tx = 370;
  body += text(tx, 40, "根從 0 換到 2（橘邊）時：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 66, "・綠色子樹內 size[2] 個點各近 1", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(tx, 88, "・其餘 n − size[2] 個點各遠 1", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 118, "ans[2] = ans[0] + n − 2·size[2]", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(
    tx,
    140,
    `       = ${at(ans, 0)} + ${n} − ${2 * at(size, 2)} = ${at(ans, 2)}`,
    { anchor: "start", size: 12, mono: true, fill: C.orange },
  );
  body += text(tx, 172, "第一次 DFS 以 0 為根求 size 與 ans[0]，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 194, "第二次 DFS 由父推子，O(1) 換根。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 216, "總計 O(n) 求出所有點為根的答案。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(680, 312, body);
}

function gameStates(): string {
  const n = 12;
  const moves = [1, 3, 4];
  const win = new Array<boolean>(n + 1).fill(false);
  for (let i = 1; i <= n; i++)
    win[i] = moves.some((m) => m <= i && !at(win, i - m));
  const cell = 44;
  const x0 = 40;
  let body = array(
    x0,
    50,
    win.map((w) => (w ? "N" : "P")),
    {
      cell,
      showIndex: true,
      indexBelow: false,
      fill: (i) => (at(win, i) ? C.greenSoft : C.redSoft),
      bold: () => true,
    },
  );
  const i = 10;
  const winMove = moves.find((m) => !at(win, i - m)) ?? 0;
  moves.forEach((m, k) => {
    const x1 = x0 + i * cell + cell / 2;
    const x2 = x0 + (i - m) * cell + cell / 2;
    body += path(
      `M${x1},${50 + cell} Q${(x1 + x2) / 2},${50 + cell + 24 + k * 14} ${x2},${50 + cell + 2}`,
      {
        stroke: at(win, i - m) ? C.muted : C.orange,
        arrow: "end",
        marker: at(win, i - m) ? "ah-muted" : "ah-orange",
        sw: 1.5,
      },
    );
  });
  body += text(
    x0,
    50 + cell + 70,
    `一次可拿 ${moves.join(" / ")} 顆石子，拿到最後一顆者勝。N = 先手必勝，P = 先手必敗。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    50 + cell + 92,
    `N ⇔ 存在一步走到 P；P ⇔ 所有走法都到 N。例：${i} 可以拿 ${winMove} 走到 ${i - winMove}（P），所以 ${i} 是 N（橘色箭頭）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    50 + cell + 114,
    "狀態從小到大計算，每個狀態看所有走法 → O(n·|moves|)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 50 + cell + 130, body);
}

function trapWater(): string {
  const h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  const n = h.length;
  const pre = new Array<number>(n).fill(0);
  const suf = new Array<number>(n).fill(0);
  h.forEach((v, i) => (pre[i] = Math.max(v, i ? at(pre, i - 1) : 0)));
  for (let i = n - 1; i >= 0; i--)
    suf[i] = Math.max(at(h, i), i < n - 1 ? at(suf, i + 1) : 0);
  const unit = 30;
  const cw = 40;
  const x0 = 70;
  const base = 130;
  let body = "";
  let total = 0;
  h.forEach((v, i) => {
    const water = Math.min(at(pre, i), at(suf, i)) - v;
    total += water;
    if (water > 0)
      body += rect(x0 + i * cw, base - (v + water) * unit, cw, water * unit, {
        fill: C.blueSoft,
        stroke: C.blueMid,
        sw: 0.8,
      });
    if (v > 0)
      body += rect(x0 + i * cw, base - v * unit, cw, v * unit, {
        fill: C.line,
        stroke: C.ink,
        sw: 1,
      });
    if (water > 0)
      body += text(
        x0 + i * cw + cw / 2,
        base - v * unit - (water * unit) / 2,
        water,
        { size: 12, fill: C.blue, weight: "bold" },
      );
  });
  body += line(x0 - 4, base, x0 + n * cw + 4, base, { sw: 1.4 });
  const row = (y: number, label: string, arr: number[], color: string) => {
    body += text(x0 - 10, y + 13, label, {
      anchor: "end",
      size: 12,
      mono: true,
      fill: color,
    });
    body += array(x0, y, arr, {
      cell: cw,
      h: 26,
      size: 12,
      color: () => color,
    });
  };
  row(base + 14, "h", h, C.ink);
  row(base + 46, "preMax", pre, C.orange);
  row(base + 78, "sufMax", suf, C.green);
  body += text(
    x0,
    base + 130,
    `water[i] = min(preMax[i], sufMax[i]) − h[i]，總和 = ${total}。`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(
    x0,
    base + 150,
    "前後綴分解：把「左邊最高」與「右邊最高」各預處理成一個陣列，每個位置就能 O(1) 回答。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, base + 166, body);
}

function editDistance(): string {
  const a = "horse";
  const b = "ros";
  const n = a.length;
  const m = b.length;
  const f: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      at(f, i)[j] =
        a.charAt(i - 1) === b.charAt(j - 1)
          ? cellOf(f, i - 1, j - 1)
          : 1 +
            Math.min(
              cellOf(f, i - 1, j),
              cellOf(f, i, j - 1),
              cellOf(f, i - 1, j - 1),
            );
  const trace: [number, number, string][] = [];
  for (let i = n, j = m; i > 0 || j > 0; ) {
    if (i > 0 && j > 0 && a.charAt(i - 1) === b.charAt(j - 1)) {
      trace.push([i, j, "相同"]);
      i--;
      j--;
    } else if (
      i > 0 &&
      j > 0 &&
      cellOf(f, i, j) === cellOf(f, i - 1, j - 1) + 1
    ) {
      trace.push([i, j, `替換 ${a.charAt(i - 1)}→${b.charAt(j - 1)}`]);
      i--;
      j--;
    } else if (i > 0 && cellOf(f, i, j) === cellOf(f, i - 1, j) + 1) {
      trace.push([i, j, `刪除 ${a.charAt(i - 1)}`]);
      i--;
    } else {
      trace.push([i, j, `插入 ${b.charAt(j - 1)}`]);
      j--;
    }
  }
  const cell = 42;
  const x0 = 80;
  const y0 = 60;
  let body = gridHeaders(
    x0,
    y0,
    cell,
    ["∅", ...a.split("")],
    ["∅", ...b.split("")],
    { size: 13, color: C.ink },
  );
  body += grid(x0, y0, n + 1, m + 1, {
    cell,
    label: (i, j) => cellOf(f, i, j),
    fill: (i, j) => {
      const t = trace.find(([ti, tj]) => ti === i && tj === j);
      if (t) return t[2] === "相同" ? C.greenSoft : C.orangeSoft;
      return i === 0 || j === 0 ? C.gray : undefined;
    },
    size: 14,
  });
  const tx = x0 + (m + 1) * cell + 30;
  body += text(tx, y0 + 6, "f[i][j]：a 前 i 個 → b 前 j 個的最少操作", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, y0 + 30, "a[i−1] = b[j−1]：f[i−1][j−1]", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 52, "否則 1 + min(", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 74, "  f[i−1][j]   刪除,", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 96, "  f[i][j−1]   插入,", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, y0 + 118, "  f[i−1][j−1] 替換)", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(
    tx,
    y0 + 150,
    `回溯（由後往前）：${trace
      .filter((t) => t[2] !== "相同")
      .map((t) => t[2])
      .reverse()
      .join("、")}`,
    { anchor: "start", size: 12, fill: C.orange },
  );
  body += text(tx, y0 + 172, `編輯距離 = ${cellOf(f, n, m)}。`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  return svg(700, y0 + (n + 1) * cell + 16, body);
}

function jumpGameGreedy(): string {
  const nums = [2, 3, 1, 1, 4, 1, 2];
  const cell = 50;
  const x0 = 40;
  let body = array(x0, 70, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: () => undefined,
  });
  let steps = 0;
  let curEnd = 0;
  let far = 0;
  const layers: [number, number][] = [];
  let start = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    far = Math.max(far, i + at(nums, i));
    if (i === curEnd) {
      layers.push([start, curEnd]);
      start = curEnd + 1;
      curEnd = far;
      steps++;
    }
  }
  layers.push([start, nums.length - 1]);
  const fills = [C.orangeSoft, C.blueSoft, C.greenSoft, C.purpleSoft];
  layers.forEach(([a, b], k) => {
    body += rect(x0 + a * cell + 2, 70 + 2, (b - a + 1) * cell - 4, cell - 4, {
      fill: at(fills, k % 4),
      stroke: "none",
      opacity: 0.9,
    });
    body += brace(
      x0 + a * cell + 3,
      x0 + (b + 1) * cell - 3,
      70 + cell + 6,
      `${k} 步可達`,
      { size: 11 },
    );
  });
  nums.forEach(
    (v, i) =>
      (body += text(x0 + i * cell + cell / 2, 70 + cell / 2 + 1, v, {
        mono: true,
        size: 15,
      })),
  );
  body += text(
    x0,
    170,
    `把「恰好 k 步可達」的下標看成一段區間；掃過第 k 段時，下一段右端 = max(i + nums[i])。最少 ${steps} 步。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    190,
    "等價於在隱式圖上做 BFS，但每層是連續區間，所以只需兩個指標，O(n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 206, body);
}

export const part3Figures: BookFigure[] = [
  {
    id: "dp-climb",
    category: "dynamic_programming",
    section: "1.1 爬樓梯",
    caption: "重複子問題：遞迴樹 vs. 記憶化",
    render: climbTree,
  },
  {
    id: "dp-rob",
    category: "dynamic_programming",
    section: "1.2 打家劫舍",
    caption: "打家劫舍 (LC 198)：選或不選的線性 DP",
    render: robFigure,
  },
  {
    id: "dp-kadane",
    category: "dynamic_programming",
    section: "1.3 最大子陣列和（最大子段和）",
    caption: "最大子陣列和 (LC 53)：以 i 結尾的最優值",
    render: kadane,
  },
  {
    id: "dp-grid",
    category: "dynamic_programming",
    section: "2.1 基礎",
    caption: "網格圖 DP：最小路徑和 (LC 64)",
    render: gridDp,
  },
  {
    id: "dp-01knap",
    category: "dynamic_programming",
    section: "3.1 0-1 背包",
    caption: "0-1 背包的 DP 表：每格只看上一列的兩個位置",
    render: knapsack01,
  },
  {
    id: "dp-knap-order",
    category: "dynamic_programming",
    section: "3.2 完全背包",
    caption: "一維滾動陣列：0-1 背包倒序、完全背包正序",
    render: knapsackOrder,
  },
  {
    id: "dp-lcs",
    category: "dynamic_programming",
    section: "4.1.1 基礎",
    caption: "最長公共子序列 (LC 1143) 的 DP 表與回溯路徑",
    render: lcsFigure,
  },
  {
    id: "dp-lis",
    category: "dynamic_programming",
    section: "4.2.1 基礎",
    caption: "LIS 的貪心 + 二分：維護每個長度的最小結尾",
    render: lisTails,
  },
  {
    id: "dp-partition",
    category: "dynamic_programming",
    section: "5.2 最優劃分",
    caption: "劃分型 DP：列舉最後一段的起點",
    render: partitionDp,
  },
  {
    id: "dp-stock",
    category: "dynamic_programming",
    section: "6.1 買賣股票",
    caption: "狀態機 DP：買賣股票的兩個狀態與轉移",
    render: stockMachine,
  },
  {
    id: "dp-palsub",
    category: "dynamic_programming",
    section: "8.1 最長迴文子序列",
    caption: "區間 DP：最長迴文子序列 (LC 516)，按對角線填表",
    render: palSubseq,
  },
  {
    id: "dp-interval",
    category: "dynamic_programming",
    section: "8.2 區間 DP",
    caption: "區間 DP 的分割點列舉",
    render: intervalSplit,
  },
  {
    id: "dp-lattice",
    category: "dynamic_programming",
    section: "9.1 排列型狀壓 DP ① 相鄰無關",
    caption: "狀壓 DP 的狀態空間：n = 3 的子集格",
    render: subsetLattice,
  },
  {
    id: "dp-tsp",
    category: "dynamic_programming",
    section: "9.3 旅行商問題（TSP）",
    caption: "TSP 的狀態 (S, v)：走過的集合 + 最後停留的點",
    render: tspFigure,
  },
  {
    id: "dp-profile",
    category: "dynamic_programming",
    section: "9.5 輪廓線 DP",
    caption: "輪廓線 DP：只記住分隔已處理與未處理格子的那條線",
    render: profileDp,
  },
  {
    id: "dp-sos",
    category: "dynamic_programming",
    section: "9.6 SOS DP",
    caption: "SOS DP（子集和）：逐位累加",
    render: sosFigure,
  },
  {
    id: "dp-digit",
    category: "dynamic_programming",
    section: "10.1 統計合法元素的數目",
    caption: "數位 DP 的搜尋樹：isLimit 路徑與可共用的自由子樹",
    render: digitTree,
  },
  {
    id: "dp-monoq",
    category: "dynamic_programming",
    section: "11.3 單調佇列優化 DP",
    caption: "單調佇列優化：轉移來源是滑動視窗",
    render: monoQueueDp,
  },
  {
    id: "dp-matpow",
    category: "dynamic_programming",
    section: "11.6 矩陣快速冪優化 DP",
    caption: "矩陣快速冪：費氏數列與二進位拆分",
    render: matrixPower,
  },
  {
    id: "dp-cht",
    category: "dynamic_programming",
    section: "11.7 斜率優化 DP",
    caption: "斜率優化：最佳轉移點落在下凸殼上",
    render: convexHullTrick,
  },
  {
    id: "dp-diameter",
    category: "dynamic_programming",
    section: "12.1 樹的直徑",
    caption: "樹形 DP 求直徑：在每個點拐彎",
    render: treeDiameter,
  },
  {
    id: "dp-mis",
    category: "dynamic_programming",
    section: "12.2 樹上最大獨立集",
    caption: "樹上最大權獨立集：每個點回傳（選, 不選）",
    render: treeIndependentSet,
  },
  {
    id: "dp-reroot",
    category: "dynamic_programming",
    section: "12.4 換根 DP",
    caption: "換根 DP：樹中距離之和 (LC 834)",
    render: rerootFigure,
  },
  {
    id: "dp-game",
    category: "dynamic_programming",
    section: "14. 博弈 DP",
    caption: "博弈 DP：必勝態 N 與必敗態 P",
    render: gameStates,
  },
  {
    id: "dp-trap",
    category: "dynamic_programming",
    section: "17. 專題：前字尾分解",
    caption: "前後綴分解：接雨水 (LC 42)",
    render: trapWater,
  },
  {
    id: "dp-edit",
    category: "dynamic_programming",
    section: "18. 專題：把 X 變成 Y",
    caption: "編輯距離 (LC 72)：horse → ros",
    render: editDistance,
  },
  {
    id: "dp-jump",
    category: "dynamic_programming",
    section: "19. 專題：跳躍遊戲",
    caption: "跳躍遊戲 II (LC 45)：按「步數」分層的區間",
    render: jumpGameGreedy,
  },
];
