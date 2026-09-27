/**
 * Figures for the data-structure chapter: enumeration, prefix sums,
 * difference arrays, stacks / queues, heaps, tries, union-find, Fenwick and
 * segment trees, sqrt decomposition and offline processing.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  box,
  brace,
  circle,
  drawGraph,
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
  type GNode,
  type TreeNode,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;

function enumRightKeepLeft(): string {
  const nums = [3, 8, 11, 2, 5, 7];
  const target = 9;
  const cell = 46;
  const x0 = 80;
  let body = "";
  const seen = new Map<number, number>();
  let found: [number, number] | null = null;
  const frames: { r: number; map: [number, number][]; hit: number | null }[] =
    [];
  for (let r = 0; r < nums.length && !found; r++) {
    const need = target - at(nums, r);
    const hit = seen.has(need) ? (seen.get(need) as number) : null;
    frames.push({ r, map: [...seen.entries()], hit });
    if (hit !== null) found = [hit, r];
    seen.set(at(nums, r), r);
  }
  frames.forEach((f, k) => {
    const y = 30 + k * 70;
    body += array(x0, y, nums, {
      cell,
      h: 36,
      showIndex: k === 0,
      indexBelow: false,
      fill: (i) =>
        i === f.r
          ? C.orangeSoft
          : i === f.hit
            ? C.greenSoft
            : i < f.r
              ? C.blueSoft
              : undefined,
      dim: (i) => i > f.r,
    });
    body += pointer(x0 + f.r * cell + cell / 2, y + 36, "r", {
      below: true,
      len: 8,
      color: C.orange,
      size: 11,
    });
    const mapText = f.map.length
      ? `{ ${f.map.map(([v, i]) => `${v}:${i}`).join(", ")} }`
      : "{ }";
    body += text(x0 + nums.length * cell + 16, y + 10, `雜湊表 ${mapText}`, {
      anchor: "start",
      size: 12,
      mono: true,
    });
    body += text(
      x0 + nums.length * cell + 16,
      y + 30,
      f.hit !== null
        ? `找到 ${target} − ${at(nums, f.r)} = ${target - at(nums, f.r)}，下標 ${f.hit}`
        : `查 ${target} − ${at(nums, f.r)} = ${target - at(nums, f.r)}：不存在`,
      {
        anchor: "start",
        size: 12,
        fill: f.hit !== null ? C.green : C.muted,
      },
    );
  });
  const y = 30 + frames.length * 70;
  body += text(
    20,
    y,
    "列舉右端 r，把左邊所有元素維護在雜湊表裡：配對問題從 O(n²) 降到 O(n)。先查再存，避免和自己配對。",
    { anchor: "start", size: 12 },
  );
  return svg(660, y + 16, body);
}

function prefixSum(): string {
  const nums = [3, 1, 4, 1, 5, 9, 2];
  const P = [0];
  nums.forEach((v) => P.push(at(P, P.length - 1) + v));
  const cell = 46;
  const x0 = 90;
  const l = 2;
  const r = 5;
  let body = text(x0 - 14, 50 + 20, "nums", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0 + cell / 2, 50, nums, {
    cell,
    h: 40,
    showIndex: true,
    indexBelow: false,
    fill: (i) => (i >= l && i <= r ? C.blueSoft : undefined),
  });
  body += text(x0 - 14, 140 + 20, "s", { anchor: "end", size: 13, mono: true });
  body += array(x0, 140, P, {
    cell,
    h: 40,
    showIndex: true,
    fill: (i) =>
      i === l ? C.orangeSoft : i === r + 1 ? C.greenSoft : undefined,
  });
  body += brace(
    x0 + cell / 2 + l * cell + 2,
    x0 + cell / 2 + (r + 1) * cell - 2,
    50 + 40 + 6,
    `和 = ${nums.slice(l, r + 1).reduce((a, b) => a + b, 0)}`,
    { color: C.blue },
  );
  body += text(x0, 222, `s[i] = nums[0] + … + nums[i−1]，s[0] = 0。`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(
    x0,
    244,
    `nums[${l}..${r}] 的和 = s[${r + 1}] − s[${l}] = ${at(P, r + 1)} − ${at(P, l)} = ${at(P, r + 1) - at(P, l)}`,
    { anchor: "start", size: 12, mono: true, fill: C.orange, weight: "bold" },
  );
  body += text(x0, 266, "s 比 nums 多一格：這樣左端點為 0 的區間不用特判。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(600, 282, body);
}

function prefixHash(): string {
  const nums = [1, 2, 3, -2, 2, 1, -1];
  const k = 3;
  const P = [0];
  nums.forEach((v) => P.push(at(P, P.length - 1) + v));
  const x0 = 50;
  const W = 540;
  const minP = Math.min(...P);
  const maxP = Math.max(...P);
  const X = (v: number) => x0 + ((v - minP) / (maxP - minP)) * W;
  let body = line(x0 - 10, 110, x0 + W + 16, 110, {
    stroke: C.line,
    arrow: "end",
    marker: "ah-muted",
  });
  for (let v = minP; v <= maxP; v++)
    body += text(X(v), 128, v, { size: 11, mono: true, fill: C.muted });
  const count = new Map<number, number>();
  let total = 0;
  const pairs: [number, number][] = [];
  P.forEach((v, j) => {
    const need = v - k;
    P.slice(0, j).forEach((u, i) => {
      if (u === need) pairs.push([i, j]);
    });
    total += count.get(need) ?? 0;
    count.set(v, (count.get(v) ?? 0) + 1);
  });
  const stackAt = new Map<number, number>();
  const ys: number[] = [];
  P.forEach((v) => {
    const s = stackAt.get(v) ?? 0;
    stackAt.set(v, s + 1);
    ys.push(92 - s * 26);
  });
  pairs.forEach(([i, j], t) => {
    body += path(
      `M${X(at(P, i))},${at(ys, i) - 10} Q${(X(at(P, i)) + X(at(P, j))) / 2},${20 - t * 3} ${X(at(P, j))},${at(ys, j) - 10}`,
      { stroke: C.orange, sw: 1.4, arrow: "end", marker: "ah-orange" },
    );
  });
  P.forEach((v, j) => {
    body += circle(X(v), at(ys, j), 11, { fill: C.blueSoft, stroke: C.blue });
    body += text(X(v), at(ys, j) + 1, `s${j}`, { size: 10, mono: true });
  });
  body += text(
    x0,
    156,
    `nums = [${nums.join(", ")}]，k = ${k}。把每個字首和 s_j 畫在數線上（s_j 的值 = 橫座標）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    178,
    `和為 k 的子陣列 ⇔ 一對 i < j 使 s_j − s_i = k（橘色弧，共 ${total} 對）。`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(
    x0,
    200,
    "由左到右掃描 j，用雜湊表記錄「每個 s 值出現過幾次」，答案加上 cnt[s_j − k]。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 216, body);
}

function prefix2d(): string {
  const cell = 34;
  const x0 = 40;
  const y0 = 30;
  const R = 6;
  const Cn = 7;
  const r1 = 2;
  const c1 = 3;
  const r2 = 4;
  const c2 = 5;
  let body = grid(x0, y0, R, Cn, {
    cell,
    fill: (r, c) => {
      if (r >= r1 && r <= r2 && c >= c1 && c <= c2) return C.greenSoft;
      if (r <= r2 && c <= c2 && r < r1 && c < c1) return C.redSoft;
      if (r <= r2 && c < c1) return C.blueSoft;
      if (r < r1 && c <= c2) return C.orangeSoft;
      return undefined;
    },
  });
  const corner = (r: number, c: number, label: string, color: string) => {
    body += circle(x0 + (c + 1) * cell, y0 + (r + 1) * cell, 5, {
      fill: color,
      stroke: color,
    });
    body += text(x0 + (c + 1) * cell + 6, y0 + (r + 1) * cell - 8, label, {
      anchor: "start",
      size: 11,
      fill: color,
      weight: "bold",
      mono: true,
    });
  };
  corner(r2, c2, "A", C.ink);
  corner(r1 - 1, c2, "B", C.orange);
  corner(r2, c1 - 1, "C", C.blue);
  corner(r1 - 1, c1 - 1, "D", C.red);
  const tx = x0 + Cn * cell + 30;
  body += text(tx, 40, "s[i][j] = 左上角 i × j 矩形的和", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 70, "綠色子矩形 = A − B − C + D", {
    anchor: "start",
    size: 13,
    mono: true,
    fill: C.green,
    weight: "bold",
  });
  body += text(tx, 100, "A：到右下角的整塊", { anchor: "start", size: 12 });
  body += text(tx, 122, "B：減掉上方（橘 + 紅）", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 144, "C：減掉左方（藍 + 紅）", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 166, "D：紅色被減了兩次，加回來", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  body += text(tx, 196, "建表同理：s[i+1][j+1] = s[i][j+1]", {
    anchor: "start",
    size: 12,
    fill: C.muted,
    mono: true,
  });
  body += text(tx, 216, "  + s[i+1][j] − s[i][j] + a[i][j]", {
    anchor: "start",
    size: 12,
    fill: C.muted,
    mono: true,
  });
  return svg(640, y0 + R * cell + 20, body);
}

function diffArray(): string {
  const n = 8;
  const ops: [number, number, number][] = [
    [1, 4, 3],
    [3, 6, 2],
  ];
  const d = new Array<number>(n + 1).fill(0);
  ops.forEach(([l, r, v]) => {
    d[l] = at(d, l) + v;
    d[r + 1] = at(d, r + 1) - v;
  });
  const a: number[] = [];
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += at(d, i);
    a.push(s);
  }
  const cell = 46;
  const x0 = 110;
  let body = "";
  body += text(
    20,
    20,
    `兩次區間加：[${ops[0]![0]}, ${ops[0]![1]}] += ${ops[0]![2]}，[${ops[1]![0]}, ${ops[1]![1]}] += ${ops[1]![2]}`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  body += text(x0 - 14, 50 + 20, "diff", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0, 50, d, {
    cell,
    h: 40,
    showIndex: true,
    indexBelow: false,
    fill: (i) =>
      at(d, i) > 0 ? C.greenSoft : at(d, i) < 0 ? C.redSoft : undefined,
  });
  body += text(x0 - 14, 150 + 20, "字首和", { anchor: "end", size: 13 });
  body += array(x0, 150, a, {
    cell,
    h: 40,
    fill: (i) => (at(a, i) ? C.blueSoft : undefined),
  });
  for (let i = 0; i < n; i++)
    body += line(x0 + i * cell + cell / 2, 94, x0 + i * cell + cell / 2, 148, {
      stroke: C.faint,
      sw: 1,
    });
  ops.forEach(([l, r, v], k) => {
    const y = 214 + k * 22;
    body += rect(x0 + l * cell + 2, y - 8, (r - l + 1) * cell - 4, 16, {
      fill: k ? C.orangeSoft : C.greenSoft,
      stroke: "none",
      rx: 8,
    });
    body += text(x0 + l * cell + 8, y, `+${v}`, {
      anchor: "start",
      size: 11,
      weight: "bold",
    });
  });
  body += text(
    20,
    270,
    "區間 [l, r] 加 v ⇔ diff[l] += v、diff[r+1] −= v：兩次 O(1) 修改；所有修改做完後一次字首和還原。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 286, body);
}

function diff2d(): string {
  const cell = 36;
  const x0 = 40;
  const y0 = 30;
  const R = 6;
  const Cn = 7;
  const r1 = 1;
  const c1 = 2;
  const r2 = 3;
  const c2 = 4;
  let body = grid(x0, y0, R, Cn, {
    cell,
    fill: (r, c) =>
      r >= r1 && r <= r2 && c >= c1 && c <= c2 ? C.blueSoft : undefined,
    label: (r, c) =>
      r === r1 && c === c1
        ? "+v"
        : r === r1 && c === c2 + 1
          ? "−v"
          : r === r2 + 1 && c === c1
            ? "−v"
            : r === r2 + 1 && c === c2 + 1
              ? "+v"
              : "",
    color: (r, c) =>
      (r === r1 && c === c1) || (r === r2 + 1 && c === c2 + 1)
        ? C.green
        : C.red,
    bold: () => true,
  });
  body += rect(
    x0 + c1 * cell,
    y0 + r1 * cell,
    (c2 - c1 + 1) * cell,
    (r2 - r1 + 1) * cell,
    { stroke: C.blue, sw: 2.4 },
  );
  const tx = x0 + Cn * cell + 30;
  body += text(tx, 40, "子矩形 (r1,c1)–(r2,c2) 全部加 v：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 66, "d[r1][c1]     += v", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 88, "d[r1][c2+1]   −= v", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.red,
  });
  body += text(tx, 110, "d[r2+1][c1]   −= v", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.red,
  });
  body += text(tx, 132, "d[r2+1][c2+1] += v", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 164, "做一次二維字首和後，+v 的影響", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 186, "恰好覆蓋藍色矩形，其餘被抵銷。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, y0 + R * cell + 16, body);
}

function bracketBalance(): string {
  const s = "(()())())(";
  const cell = 36;
  const x0 = 60;
  const base = 150;
  const unit = 26;
  let bal = 0;
  const pts: [number, number][] = [[x0, base]];
  let firstNeg = -1;
  s.split("").forEach((ch, i) => {
    bal += ch === "(" ? 1 : -1;
    if (bal < 0 && firstNeg < 0) firstNeg = i;
    pts.push([x0 + (i + 1) * cell, base - bal * unit]);
  });
  let body = array(x0, 20, s.split(""), {
    cell,
    h: 32,
    fill: (i) => (i === firstNeg ? C.redSoft : undefined),
  });
  body += line(x0, base, x0 + s.length * cell + 10, base, {
    stroke: C.line,
    dash: "4 3",
  });
  body += text(x0 - 8, base, "0", {
    anchor: "end",
    size: 11,
    mono: true,
    fill: C.muted,
  });
  body += path(pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" "), {
    stroke: C.blue,
    sw: 2.2,
  });
  pts.forEach(([x, y], i) => {
    const neg = y > base;
    body += circle(x, y, 4, {
      fill: neg ? C.red : C.blue,
      stroke: neg ? C.red : C.blue,
    });
    if (i > 0)
      body += text(x, y - 12, (base - y) / unit, {
        size: 10,
        mono: true,
        fill: neg ? C.red : C.muted,
      });
  });
  body += text(
    x0,
    base + 50,
    "平衡值：遇 '(' +1、遇 ')' −1。合法括號串 ⇔ 折線從不低於 0，且終點回到 0。",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    base + 70,
    `此串在下標 ${firstNeg} 首次跌破 0（紅），之前的前綴 "${s.slice(0, firstNeg)}" 是合法的。`,
    { anchor: "start", size: 12, fill: C.red },
  );
  return svg(560, base + 86, body);
}

function exprTree(): string {
  const tree: TreeNode = {
    label: "+",
    fill: C.orangeSoft,
    children: [
      { label: "3", fill: C.blueSoft },
      {
        label: "×",
        fill: C.orangeSoft,
        children: [
          { label: "2", fill: C.blueSoft },
          {
            label: "−",
            fill: C.orangeSoft,
            children: [
              { label: "4", fill: C.blueSoft },
              { label: "1", fill: C.blueSoft },
            ],
          },
        ],
      },
    ],
  };
  const placed = layoutTree(tree, 60, 62, 50, 36);
  let body = drawTree(placed, { r: 18, size: 15 });
  const tx = 300;
  body += text(tx, 30, "3 + 2 × (4 − 1) = 9", {
    anchor: "start",
    size: 14,
    mono: true,
    weight: "bold",
  });
  const steps: [string, string, string][] = [
    ["3", "3", ""],
    ["+", "3", "+"],
    ["2", "3 2", "+"],
    ["×", "3 2", "+ ×"],
    ["(", "3 2", "+ × ("],
    ["4", "3 2 4", "+ × ("],
    ["−", "3 2 4", "+ × ( −"],
    ["1", "3 2 4 1", "+ × ( −"],
    [")", "3 2 3", "+ ×"],
    ["結束", "9", ""],
  ];
  body += text(tx, 58, "讀入", { anchor: "start", size: 11, weight: "bold" });
  body += text(tx + 50, 58, "數字堆疊", {
    anchor: "start",
    size: 11,
    weight: "bold",
    fill: C.blue,
  });
  body += text(tx + 170, 58, "運算子堆疊", {
    anchor: "start",
    size: 11,
    weight: "bold",
    fill: C.orange,
  });
  steps.forEach(([tok, nums, ops], k) => {
    const y = 78 + k * 19;
    body += text(tx, y, tok, { anchor: "start", size: 11, mono: true });
    body += text(tx + 50, y, nums, {
      anchor: "start",
      size: 11,
      mono: true,
      fill: C.blue,
    });
    body += text(tx + 170, y, ops, {
      anchor: "start",
      size: 11,
      mono: true,
      fill: C.orange,
    });
  });
  body += text(
    20,
    290,
    "左：運算式樹，後序遍歷就是求值順序。右：雙堆疊法——遇到右括號或優先級較低的運算子時，",
    { anchor: "start", size: 12 },
  );
  body += text(20, 310, "先把運算子堆疊頂端優先級 ≥ 它的運算子彈出來計算。", {
    anchor: "start",
    size: 12,
  });
  return svg(640, 326, body);
}

function monoDeque(): string {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const rows: { i: number; dq: number[]; out: number | null }[] = [];
  const dq: number[] = [];
  nums.forEach((v, i) => {
    while (dq.length && at(nums, at(dq, dq.length - 1)) <= v) dq.pop();
    dq.push(i);
    if (at(dq, 0) <= i - k) dq.shift();
    rows.push({ i, dq: [...dq], out: i >= k - 1 ? at(nums, at(dq, 0)) : null });
  });
  const cell = 34;
  const x0 = 50;
  let body = text(20, 16, `滑動視窗最大值 (k = ${k})`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(
    x0 + nums.length * cell + 30,
    16,
    "單調佇列（下標:值，隊首在左）",
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(x0 + nums.length * cell + 280, 16, "最大值", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  rows.forEach((r, t) => {
    const y = 28 + t * 34;
    body += array(x0, y, nums, {
      cell,
      h: 28,
      size: 12,
      fill: (j) =>
        j > r.i - k && j <= r.i
          ? r.dq.includes(j)
            ? C.greenSoft
            : C.blueSoft
          : undefined,
      dim: (j) => j > r.i,
    });
    r.dq.forEach((j, q) => {
      body += rect(x0 + nums.length * cell + 30 + q * 56, y + 2, 52, 24, {
        fill: q === 0 ? C.greenSoft : C.paper,
        stroke: C.green,
        sw: 1,
        rx: 3,
      });
      body += text(
        x0 + nums.length * cell + 30 + q * 56 + 26,
        y + 14,
        `${j}:${at(nums, j)}`,
        { size: 11, mono: true },
      );
    });
    if (r.out !== null)
      body += text(x0 + nums.length * cell + 300, y + 14, r.out, {
        size: 13,
        mono: true,
        weight: "bold",
        fill: C.orange,
      });
  });
  const y = 28 + rows.length * 34 + 10;
  body += text(
    20,
    y,
    "新元素從隊尾進入前，先把所有 ≤ 它的隊尾彈出（它們更舊又更小，永遠不會再當最大值）；隊首過期就從隊首彈出。",
    { anchor: "start", size: 12 },
  );
  return svg(700, y + 16, body);
}

function heapFigure(): string {
  const a = [1, 3, 2, 7, 4, 5, 9, 8, 10];
  const build = (i: number): TreeNode | null => {
    if (i >= a.length) return null;
    const l = build(2 * i + 1);
    const r = build(2 * i + 2);
    return {
      label: at(a, i),
      note: `[${i}]`,
      fill: i === 0 ? C.orangeSoft : C.blueSoft,
      children: l || r ? [l, r] : [],
    };
  };
  const placed = layoutTree(build(0)!, 50, 62, 40, 30);
  let body = drawTree(placed);
  const y = 250;
  body += array(40, y, a, {
    cell: 40,
    showIndex: true,
    fill: (i) => (i === 0 ? C.orangeSoft : C.blueSoft),
  });
  // children of index 1 arrows
  body += path(
    `M${40 + 1 * 40 + 20},${y} Q${40 + 2 * 40 + 20},${y - 30} ${40 + 3 * 40 + 20},${y - 2}`,
    { stroke: C.orange, arrow: "end", marker: "ah-orange" },
  );
  body += path(
    `M${40 + 1 * 40 + 20},${y} Q${40 + 2.5 * 40 + 20},${y - 40} ${40 + 4 * 40 + 18},${y - 2}`,
    { stroke: C.orange, arrow: "end", marker: "ah-orange" },
  );
  const tx = 460;
  body += text(tx, 40, "最小堆：父 ≤ 子", {
    anchor: "start",
    size: 13,
    weight: "bold",
  });
  body += text(tx, 68, "陣列下標 i 的", { anchor: "start", size: 12 });
  body += text(tx, 90, "  左子 = 2i + 1", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 112, "  右子 = 2i + 2", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 134, "  父   = (i − 1) / 2", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 164, "push：放到末尾再上浮", { anchor: "start", size: 12 });
  body += text(tx, 186, "pop：末尾搬到根再下沉", { anchor: "start", size: 12 });
  body += text(tx, 208, "樹高 ⌊log₂ n⌋ → O(log n)", {
    anchor: "start",
    size: 12,
    fill: C.orange,
    weight: "bold",
  });
  return svg(660, y + 60, body);
}

function twoHeaps(): string {
  const nums = [5, 15, 1, 3, 8, 7, 9, 10, 20];
  const sorted = [...nums].sort((a, b) => a - b);
  const half = Math.ceil(sorted.length / 2);
  const left = sorted.slice(0, half);
  const right = sorted.slice(half);
  const x0 = 50;
  const scale = 26;
  let body = line(x0, 80, x0 + 21 * scale + 10, 80, {
    stroke: C.line,
    arrow: "end",
    marker: "ah-muted",
  });
  for (const v of sorted) {
    const isL = left.includes(v) && sorted.indexOf(v) < half;
    body += circle(x0 + v * scale, 80, 11, {
      fill: isL ? C.blueSoft : C.orangeSoft,
      stroke: isL ? C.blue : C.orange,
    });
    body += text(x0 + v * scale, 81, v, { size: 11, mono: true });
  }
  const med = at(left, left.length - 1);
  body += pointer(x0 + med * scale, 68, `中位數 ${med}`, {
    color: C.green,
    len: 20,
  });
  body += box(
    x0,
    130,
    250,
    70,
    `大根堆（較小的一半）\n堆頂 = ${med}（左半最大）`,
    { fill: C.blueSoft, size: 12 },
  );
  body += box(
    x0 + 290,
    130,
    250,
    70,
    `小根堆（較大的一半）\n堆頂 = ${at(right, 0)}（右半最小）`,
    { fill: C.orangeSoft, size: 12 },
  );
  body += text(
    x0,
    226,
    "維持 |左| = |右| 或 |左| = |右| + 1，且左堆頂 ≤ 右堆頂。插入一個數後至多搬動一個元素來恢復平衡。",
    { anchor: "start", size: 12 },
  );
  body += text(x0, 246, "中位數就在兩個堆頂：插入 O(log n)、查詢 O(1)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, 262, body);
}

interface TrieN {
  ch: string;
  end: boolean;
  kids: Map<string, TrieN>;
}

function trieFigure(): string {
  const words = ["app", "apple", "apt", "bat", "bad", "ban"];
  const root: TrieN = { ch: "", end: false, kids: new Map() };
  for (const w of words) {
    let cur = root;
    for (const ch of w) {
      if (!cur.kids.has(ch))
        cur.kids.set(ch, { ch, end: false, kids: new Map() });
      cur = cur.kids.get(ch)!;
    }
    cur.end = true;
  }
  const query = "apt";
  const toNode = (t: TrieN, prefix: string): TreeNode => ({
    label: t.ch || "·",
    fill: t.end
      ? C.greenSoft
      : prefix && query.startsWith(prefix)
        ? C.orangeSoft
        : C.paper,
    stroke: t.end ? C.green : C.ink,
    edgeLabel: undefined,
    edgeColor: prefix && query.startsWith(prefix) ? C.orange : undefined,
    children: [...t.kids.values()].map((k) => toNode(k, prefix + k.ch)),
  });
  const placed = layoutTree(toNode(root, ""), 46, 50, 40, 26);
  let body = drawTree(placed, { r: 15 });
  const tx = 420;
  body += text(tx, 40, `插入：${words.join(", ")}`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 70, "每條邊代表一個字元；", { anchor: "start", size: 12 });
  body += text(tx, 92, "共同前綴共用同一條路徑。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 122, "綠色：某個單字在此結束（end 標記）", {
    anchor: "start",
    size: 12,
    fill: C.green,
  });
  body += text(tx, 152, `橘色：查詢 "${query}" 走過的路徑`, {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 182, "插入與查詢都是 O(字串長度)，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 204, "與字典中有多少單字無關。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 320, body);
}

function xorTrie(): string {
  const nums = [3, 10, 5];
  const W = 4;
  const x = 12;
  interface BN {
    kids: [BN | null, BN | null];
  }
  const root: BN = { kids: [null, null] };
  for (const v of nums) {
    let cur = root;
    for (let b = W - 1; b >= 0; b--) {
      const bit = (v >> b) & 1;
      if (!cur.kids[bit]) cur.kids[bit] = { kids: [null, null] };
      cur = cur.kids[bit]!;
    }
  }
  // Greedy query path.
  const path1: BN[] = [root];
  let cur = root;
  let got = 0;
  for (let b = W - 1; b >= 0; b--) {
    const want = ((x >> b) & 1) ^ 1;
    if (cur.kids[want]) {
      cur = cur.kids[want]!;
      got |= 1 << b;
    } else cur = cur.kids[want ^ 1]!;
    path1.push(cur);
  }
  const onPath = new Set(path1);
  const toNode = (n: BN, bit: string, depth: number): TreeNode => ({
    label: bit,
    fill: onPath.has(n) ? C.orangeSoft : C.paper,
    edgeColor: onPath.has(n) && depth > 0 ? C.orange : undefined,
    children: n.kids.every((k) => !k)
      ? []
      : n.kids.map((k, i) => (k ? toNode(k, String(i), depth + 1) : null)),
  });
  const placed = layoutTree(toNode(root, "·", 0), 44, 52, 30, 26);
  let body = drawTree(placed, { r: 14 });
  const tx = 380;
  body += text(
    tx,
    30,
    `插入 ${nums.map((v) => `${v}=${v.toString(2).padStart(W, "0")}`).join("、")}`,
    { anchor: "start", size: 12, mono: true },
  );
  body += text(
    tx,
    58,
    `查詢 x = ${x} = ${x.toString(2).padStart(W, "0")} 的最大異或：`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  body += text(tx, 82, "從最高位開始，每一位盡量走", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 104, "「與 x 相反」的分支（橘色）。", {
    anchor: "start",
    size: 12,
  });
  body += text(
    tx,
    134,
    `結果 ${got} = ${got.toString(2).padStart(W, "0")}（與 ${x ^ got} 異或）`,
    { anchor: "start", size: 12, fill: C.orange, weight: "bold" },
  );
  body += text(tx, 164, "高位優先的貪心：高位多一個 1 比", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 186, "低位全部是 1 還大。O(log U)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(660, 280, body);
}

function unionFind(): string {
  // Before: chain 0<-1<-2<-3<-4 (parent pointers), after find(4) path compression.
  const pos: [number, number][] = [
    [80, 40],
    [80, 100],
    [80, 160],
    [80, 220],
    [80, 280],
  ];
  const before: GNode[] = pos.map(([x, y], i) => ({
    id: `b${i}`,
    label: `${i}`,
    x,
    y,
    fill: i === 4 ? C.orangeSoft : i === 0 ? C.greenSoft : C.blueSoft,
  }));
  let body = panelTitle(30, 16, "壓縮前：find(4) 要走 4 步");
  body += drawGraph(
    before,
    [1, 2, 3, 4].map((i) => ({ a: `b${i}`, b: `b${i - 1}`, directed: true })),
  );
  body += path("M110,280 C170,220 170,100 110,50", {
    stroke: C.orange,
    dash: "5 4",
    arrow: "end",
    marker: "ah-orange",
  });
  body += text(175, 170, "find", { anchor: "start", size: 12, fill: C.orange });
  const after: GNode[] = [
    { id: "a0", label: "0", x: 400, y: 60, fill: C.greenSoft },
    { id: "a1", label: "1", x: 300, y: 170, fill: C.blueSoft },
    { id: "a2", label: "2", x: 370, y: 170, fill: C.blueSoft },
    { id: "a3", label: "3", x: 440, y: 170, fill: C.blueSoft },
    { id: "a4", label: "4", x: 510, y: 170, fill: C.orangeSoft },
  ];
  body += panelTitle(290, 16, "壓縮後：路徑上每個點直接指向根");
  body += drawGraph(
    after,
    [1, 2, 3, 4].map((i) => ({
      a: `a${i}`,
      b: "a0",
      directed: true,
      color: i > 1 ? C.orange : C.ink,
      sw: i > 1 ? 2 : 1.4,
    })),
  );
  body += text(290, 230, "fa[x] = find(fa[x])：遞迴返回時順手改指標。", {
    anchor: "start",
    size: 12,
    mono: false,
  });
  body += text(290, 252, "再配合按秩（或按大小）合併，", {
    anchor: "start",
    size: 12,
  });
  body += text(290, 274, "均攤 O(α(n))，實務上視為常數。", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  return svg(620, 310, body);
}

function weightedUf(): string {
  const nodes: GNode[] = [
    { id: "a", x: 80, y: 150, fill: C.blueSoft },
    { id: "b", x: 230, y: 150, fill: C.blueSoft },
    { id: "c", x: 380, y: 150, fill: C.greenSoft },
  ];
  let body = drawGraph(nodes, [
    { a: "a", b: "b", directed: true, w: "×2", labelOffset: 14 },
    { a: "b", b: "c", directed: true, w: "×3", labelOffset: 14 },
  ]);
  body += path("M80,125 Q230,40 372,128", {
    stroke: C.orange,
    sw: 2,
    arrow: "end",
    marker: "ah-orange",
  });
  body += text(230, 70, "壓縮後 a → c：×6", {
    size: 12,
    fill: C.orange,
    weight: "bold",
  });
  const tx = 440;
  body += text(tx, 60, "帶權並查集：除了 fa[x]，", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 82, "還存 w[x] = x 相對於 fa[x] 的量", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 104, "（例：a / b = 2、b / c = 3）。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 134, "路徑壓縮時把權重沿路徑合成：", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 156, "w[a] ← w[a] ⊗ w[b] = 6", {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.orange,
  });
  body += text(tx, 186, "查詢 x / y：同根時 = w[x] / w[y]。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 208, "⊗ 可以是乘法、加法或異或。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 230, body);
}

function fenwick(): string {
  const n = 16;
  const cw = 34;
  const x0 = 50;
  let body = "";
  for (let i = 1; i <= n; i++)
    body += text(x0 + (i - 1) * cw + cw / 2, 20, i, {
      size: 11,
      mono: true,
      fill: C.muted,
    });
  const levelOf = (i: number) => Math.log2(i & -i);
  const q = 13;
  const qset = new Set<number>();
  for (let i = q; i > 0; i -= i & -i) qset.add(i);
  const u = 5;
  const uset = new Set<number>();
  for (let i = u; i <= n; i += i & -i) uset.add(i);
  for (let i = 1; i <= n; i++) {
    const lb = i & -i;
    const lvl = levelOf(i);
    const y = 36 + lvl * 34;
    const fill = qset.has(i)
      ? C.orangeSoft
      : uset.has(i)
        ? C.greenSoft
        : C.blueSoft;
    body += rect(x0 + (i - lb) * cw + 1, y, lb * cw - 2, 26, {
      fill,
      stroke: qset.has(i) ? C.orange : uset.has(i) ? C.green : C.blueMid,
      rx: 3,
    });
    body += text(x0 + (i - 1) * cw + cw / 2, y + 13, `t${i}`, {
      size: 11,
      mono: true,
    });
  }
  const y = 36 + 5 * 34 + 10;
  body += text(
    20,
    y,
    `t[i] 管理區間 (i − lowbit(i), i]。查詢字首和 [1, ${q}]：${[...qset].map((i) => `t${i}`).join(" + ")}（橘，i −= lowbit）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    y + 20,
    `單點更新 a[${u}]：影響 ${[...uset].map((i) => `t${i}`).join("、")}（綠，i += lowbit）。兩者都只有 O(log n) 個。`,
    { anchor: "start", size: 12 },
  );
  return svg(640, y + 36, body);
}

function segTree(lazy: boolean): string {
  const n = 8;
  const ql = 1;
  const qr = 5;
  const picked: string[] = [];
  const visited: string[] = [];
  const build = (l: number, r: number, covered: boolean): TreeNode => {
    const key = `${l}-${r}`;
    const full = !covered && ql <= l && r <= qr;
    const overlap = !covered && !(r < ql || l > qr);
    if (overlap) visited.push(key);
    if (full) picked.push(key);
    const node: TreeNode = {
      label: l === r ? `${l}` : `${l}-${r}`,
      fill: full
        ? C.orangeSoft
        : covered
          ? lazy
            ? C.gray
            : C.paper
          : overlap
            ? C.blueSoft
            : C.paper,
      stroke: full ? C.orange : C.ink,
      dashed: lazy && covered,
      note: lazy && full ? "tag+v" : undefined,
      noteColor: C.red,
    };
    if (l < r) {
      const m = (l + r) >> 1;
      node.children = [
        build(l, m, covered || full),
        build(m + 1, r, covered || full),
      ];
    }
    return node;
  };
  const root = build(0, n - 1, false);
  const placed = layoutTree(root, 70, 62, 40, 30);
  let body = drawTree(placed, { r: 20, size: 11 });
  const y = 300;
  body += text(
    20,
    y,
    lazy
      ? `區間 [${ql}, ${qr}] 加 v：只在 ${picked.length} 個完全覆蓋的節點（橘）更新總和並打上懶標記（tag），`
      : `查詢 [${ql}, ${qr}]：被拆成 ${picked.length} 個完全覆蓋的節點（橘）——${picked.map((k) => `[${k.replace("-", ",")}]`).join(" ")}。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    y + 20,
    lazy
      ? "灰色子孫暫不更新；日後真的要往下走時才把 tag 下傳（pushdown）。區間修改 O(log n)。"
      : "藍色是遞迴經過但未完全覆蓋的節點。每層至多 4 個節點被訪問 → O(log n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, y + 36, body);
}

function inversionMerge(): string {
  const L = [2, 5, 8];
  const R = [1, 3, 9];
  const cell = 42;
  let body = panelTitle(30, 20, "合併兩個已排序的半段時計數逆序對");
  body += text(30, 60, "左半", { anchor: "start", size: 12, fill: C.blue });
  body += array(80, 40, L, { cell, fill: () => C.blueSoft });
  body += text(260, 60, "右半", { anchor: "start", size: 12, fill: C.orange });
  body += array(310, 40, R, { cell, fill: () => C.orangeSoft });
  let i = 0;
  let j = 0;
  const merged: number[] = [];
  const notes: string[] = [];
  let inv = 0;
  while (i < L.length || j < R.length) {
    if (j >= R.length || (i < L.length && at(L, i) <= at(R, j))) {
      merged.push(at(L, i++));
    } else {
      const c = L.length - i;
      inv += c;
      if (c > 0) notes.push(`取右 ${at(R, j)}：左半剩 ${c} 個比它大 → +${c}`);
      merged.push(at(R, j++));
    }
  }
  body += text(30, 130, "合併", { anchor: "start", size: 12 });
  body += array(80, 110, merged, {
    cell,
    fill: (k) => (R.includes(at(merged, k)) ? C.orangeSoft : C.blueSoft),
  });
  notes.forEach(
    (n, k) =>
      (body += text(360, 118 + k * 20, n, {
        anchor: "start",
        size: 12,
        fill: C.red,
      })),
  );
  body += text(
    30,
    190,
    `跨越兩半的逆序對共 ${inv} 對。右半元素被取出時，左半還沒取的元素都比它大，一次加上「左半剩餘數」。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    210,
    "遞迴處理兩半內部的逆序對，總計 O(n log n)；也可以用樹狀陣列從左到右統計「已出現且比我大」的個數。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 226, body);
}

function sparseTable(): string {
  const n = 13;
  const cell = 38;
  const x0 = 40;
  const l = 2;
  const r = 10;
  const len = r - l + 1;
  const k = Math.floor(Math.log2(len));
  let body = array(
    x0,
    30,
    Array.from({ length: n }, (_, i) => i),
    {
      cell,
      size: 11,
      fill: (i) => (i >= l && i <= r ? C.gray : undefined),
      color: () => C.muted,
    },
  );
  const y1 = 90;
  body += rect(x0 + l * cell + 2, y1, (1 << k) * cell - 4, 26, {
    fill: C.blueSoft,
    stroke: C.blue,
    rx: 4,
  });
  body += text(
    x0 + l * cell + ((1 << k) * cell) / 2,
    y1 + 13,
    `st[${k}][${l}]：[${l}, ${l + (1 << k) - 1}]`,
    { size: 12, mono: true },
  );
  const s2 = r - (1 << k) + 1;
  body += rect(x0 + s2 * cell + 2, y1 + 34, (1 << k) * cell - 4, 26, {
    fill: C.orangeSoft,
    stroke: C.orange,
    rx: 4,
  });
  body += text(
    x0 + s2 * cell + ((1 << k) * cell) / 2,
    y1 + 47,
    `st[${k}][${s2}]：[${s2}, ${r}]`,
    { size: 12, mono: true },
  );
  body += text(
    x0,
    190,
    `查詢 [${l}, ${r}]（長度 ${len}）：取 k = ⌊log₂ ${len}⌋ = ${k}，用兩個長 2^${k} = ${1 << k} 的區間覆蓋，重疊沒關係。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    210,
    "min / max / gcd 這類「重複計算不影響結果」的運算：預處理 O(n log n)，查詢 O(1)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  body += text(x0, 230, "st[j][i] = op(st[j−1][i], st[j−1][i + 2^(j−1)])", {
    anchor: "start",
    size: 12,
    mono: true,
  });
  return svg(580, 246, body);
}

function splayRotate(): string {
  const left: TreeNode = {
    label: "y",
    fill: C.blueSoft,
    children: [
      {
        label: "x",
        fill: C.orangeSoft,
        children: [
          { label: "A", fill: C.gray },
          { label: "B", fill: C.gray },
        ],
      },
      { label: "C", fill: C.gray },
    ],
  };
  const right: TreeNode = {
    label: "x",
    fill: C.orangeSoft,
    children: [
      { label: "A", fill: C.gray },
      {
        label: "y",
        fill: C.blueSoft,
        children: [
          { label: "B", fill: C.gray },
          { label: "C", fill: C.gray },
        ],
      },
    ],
  };
  let body = drawTree(layoutTree(left, 50, 64, 40, 40), { r: 17 });
  body += drawTree(layoutTree(right, 50, 64, 360, 40), { r: 17 });
  body += line(220, 110, 320, 110, { arrow: "end", sw: 1.8 });
  body += text(270, 96, "右旋 x", { size: 12, weight: "bold" });
  body += line(320, 130, 220, 130, {
    arrow: "end",
    sw: 1.4,
    stroke: C.muted,
    marker: "ah-muted",
  });
  body += text(270, 148, "左旋 y", { size: 12, fill: C.muted });
  body += text(
    30,
    240,
    "旋轉不改變中序 A x B y C（二叉搜尋樹的性質不變），只改變深度：x 上升一層，y 下降一層。",
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    260,
    "Splay 每次存取都用 zig / zig-zig / zig-zag 組合把節點轉到根，均攤 O(log n)。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 276, body);
}

function sqrtDecomp(): string {
  const n = 16;
  const B = 4;
  const cell = 34;
  const x0 = 40;
  const l = 2;
  const r = 13;
  let body = "";
  for (let b = 0; b < n / B; b++) {
    body += rect(x0 + b * B * cell, 24, B * cell, 20, {
      fill: C.gray,
      stroke: C.line,
      sw: 1,
    });
    body += text(x0 + b * B * cell + (B * cell) / 2, 34, `塊 ${b}`, {
      size: 11,
      fill: C.muted,
    });
  }
  body += array(
    x0,
    50,
    Array.from({ length: n }, (_, i) => i),
    {
      cell,
      size: 11,
      color: () => C.muted,
      fill: (i) => {
        if (i < l || i > r) return undefined;
        const bl = Math.floor(i / B);
        const whole = bl * B >= l && bl * B + B - 1 <= r;
        return whole ? C.greenSoft : C.orangeSoft;
      },
    },
  );
  for (let b = 1; b < n / B; b++)
    body += line(x0 + b * B * cell, 20, x0 + b * B * cell, 50 + cell + 6, {
      stroke: C.ink,
      sw: 2,
    });
  body += brace(
    x0 + l * cell + 2,
    x0 + (r + 1) * cell - 2,
    50 + cell + 6,
    `查詢 [${l}, ${r}]`,
  );
  body += text(x0, 140, "橘色：頭尾不完整的塊，逐個元素處理（各 ≤ B 個）。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(
    x0,
    162,
    "綠色：中間完整的塊，直接用預先維護的整塊資訊（≤ n/B 塊）。",
    { anchor: "start", size: 12, fill: C.green },
  );
  body += text(
    x0,
    190,
    "單次代價 O(B + n/B)，取 B = √n 時為 O(√n)。區間修改則對整塊打標記。",
    { anchor: "start", size: 12, weight: "bold" },
  );
  return svg(620, 206, body);
}

function moOrder(): string {
  const qs: [number, number][] = [
    [1, 9],
    [2, 4],
    [0, 6],
    [5, 7],
    [9, 14],
    [6, 12],
    [11, 13],
    [12, 15],
    [3, 10],
  ];
  const B = 4;
  const sorted = [...qs].sort((a, b) => {
    const ba = Math.floor(a[0] / B);
    const bb = Math.floor(b[0] / B);
    if (ba !== bb) return ba - bb;
    return ba % 2 ? b[1] - a[1] : a[1] - b[1];
  });
  const X = (l: number) => 60 + l * 22;
  const Y = (r: number) => 250 - r * 14;
  let body = line(50, 250, 420, 250, {
    arrow: "end",
    stroke: C.line,
    marker: "ah-muted",
  });
  body += line(50, 250, 50, 20, {
    arrow: "end",
    stroke: C.line,
    marker: "ah-muted",
  });
  body += text(420, 266, "l", { size: 12, mono: true });
  body += text(40, 20, "r", { size: 12, mono: true });
  for (let b = 1; b * B <= 15; b++)
    body += line(X(b * B) - 11, 250, X(b * B) - 11, 30, {
      stroke: C.faint,
      dash: "4 3",
    });
  for (let b = 0; b * B <= 15; b++)
    body += text(X(b * B + 1.5), 266, `塊 ${b}`, { size: 10, fill: C.muted });
  body += path(
    sorted.map(([l, r], i) => `${i ? "L" : "M"}${X(l)},${Y(r)}`).join(" "),
    { stroke: C.orange, sw: 1.6 },
  );
  sorted.forEach(([l, r], i) => {
    body += circle(X(l), Y(r), 9, { fill: C.orangeSoft, stroke: C.orange });
    body += text(X(l), Y(r) + 1, i + 1, { size: 10, mono: true });
  });
  const tx = 450;
  body += text(tx, 40, "把查詢 [l, r] 看成平面上的點。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 64, "按 (l 所在塊, r) 排序後依序處理，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 86, "兩個指標的總移動量 = 折線長度。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 116, "塊內 r 單調：r 共走 O(n√n)；", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 138, "l 每次只在塊內晃動：O(q√n)。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(tx, 168, "奇偶塊交替 r 的方向（蛇形）", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, 190, "可再省下約一半的移動。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(700, 280, body);
}

function offlineSweep(): string {
  const nums = [5, 2, 8, 6, 3, 9, 1];
  const queries: [string, number][] = [
    ["q1", 4],
    ["q2", 7],
  ];
  const cell = 44;
  const x0 = 60;
  let body = panelTitle(
    x0,
    20,
    "問題：對每個查詢 x，求陣列中 ≤ x 的元素個數（且陣列會逐步加入元素）",
  );
  const sortedNums = [...nums].sort((a, b) => a - b);
  body += text(x0 - 10, 70, "元素", { anchor: "end", size: 12 });
  body += array(x0, 50, sortedNums, {
    cell,
    h: 36,
    fill: (i) =>
      at(sortedNums, i) <= 7
        ? at(sortedNums, i) <= 4
          ? C.blueSoft
          : C.greenSoft
        : undefined,
  });
  queries.forEach(([name, x], k) => {
    const idx = sortedNums.filter((v) => v <= x).length;
    const px = x0 + idx * cell;
    body += line(px, 40, px, 110 + k * 26, {
      stroke: k ? C.green : C.blue,
      sw: 2,
    });
    body += text(px + 6, 106 + k * 26, `${name}: x = ${x} → 答案 ${idx}`, {
      anchor: "start",
      size: 12,
      fill: k ? C.green : C.blue,
      weight: "bold",
    });
  });
  body += text(
    x0,
    180,
    "離線：先讀入所有查詢，把元素與查詢一起按數值排序，用一條「掃描線」從小到大推進。",
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    200,
    "推進時把元素加入資料結構（如樹狀陣列），遇到查詢就回答——線上很難的問題常因此變成單調的。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 216, body);
}

function persistentSeg(): string {
  const v1: TreeNode = {
    label: "v1",
    fill: C.blueSoft,
    children: [
      {
        label: "L",
        fill: C.blueSoft,
        children: [
          { label: "a", fill: C.blueSoft },
          { label: "b", fill: C.blueSoft },
        ],
      },
      {
        label: "R",
        fill: C.blueSoft,
        children: [
          { label: "c", fill: C.blueSoft },
          { label: "d", fill: C.blueSoft },
        ],
      },
    ],
  };
  let body = drawTree(layoutTree(v1, 56, 64, 40, 50), { r: 16 });
  // Version 2 new path copies: root', R', d'
  const nodes: GNode[] = [
    { id: "r2", label: "v2", x: 360, y: 50, fill: C.orangeSoft },
    { id: "R2", label: "R'", x: 400, y: 114, fill: C.orangeSoft },
    { id: "d2", label: "d'", x: 430, y: 178, fill: C.orangeSoft },
  ];
  body += drawGraph(
    nodes,
    [
      { a: "r2", b: "R2", color: C.orange, sw: 2 },
      { a: "R2", b: "d2", color: C.orange, sw: 2 },
    ],
    { r: 16, size: 12 },
  );
  // shared links to old nodes: L at x=? layout: leaves a=40,b=96,c=152,d=208; L=68,R=180
  body += line(346, 60, 84, 108, { stroke: C.orange, dash: "5 4", sw: 1.4 });
  body += line(386, 124, 166, 172, { stroke: C.orange, dash: "5 4", sw: 1.4 });
  body += text(
    30,
    250,
    "修改葉子 d 產生版本 v2：只複製根到 d 的路徑（橘，O(log n) 個新節點），",
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    270,
    "其餘子樹用虛線直接指向舊版本共享。每個版本都有自己的根，可隨時查詢歷史版本。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 286, body);
}

export const part4Figures: BookFigure[] = [
  {
    id: "ds-enum",
    category: "data_structure",
    section: "1.1 列舉右，維護左",
    caption: "列舉右，維護左：兩數之和 (LC 1) 的雜湊表",
    render: enumRightKeepLeft,
  },
  {
    id: "ds-prefix",
    category: "data_structure",
    section: "2.1 基礎",
    caption: "字首和：任意區間和 = 兩個字首和之差",
    render: prefixSum,
  },
  {
    id: "ds-prefix-hash",
    category: "data_structure",
    section: "2.2 字首和與雜湊表",
    caption: "和為 K 的子陣列 (LC 560)：在字首和數線上找差為 k 的點對",
    render: prefixHash,
  },
  {
    id: "ds-prefix2d",
    category: "data_structure",
    section: "2.6 二維字首和",
    caption: "二維字首和的容斥",
    render: prefix2d,
  },
  {
    id: "ds-diff",
    category: "data_structure",
    section: "3.1.1 基礎",
    caption: "差分陣列：區間加變成兩次單點修改",
    render: diffArray,
  },
  {
    id: "ds-diff2d",
    category: "data_structure",
    section: "3.2 二維差分",
    caption: "二維差分：四個角的 ±v",
    render: diff2d,
  },
  {
    id: "ds-brackets",
    category: "data_structure",
    section: "4.4 合法括號字串（RBS）",
    caption: "括號串的平衡值折線",
    render: bracketBalance,
  },
  {
    id: "ds-expr",
    category: "data_structure",
    section: "4.5 表示式解析",
    caption: "表示式求值：運算式樹與雙堆疊",
    render: exprTree,
  },
  {
    id: "ds-monodeque",
    category: "data_structure",
    section: "5.4 單調佇列",
    caption: "單調佇列：滑動視窗最大值 (LC 239)",
    render: monoDeque,
  },
  {
    id: "ds-heap",
    category: "data_structure",
    section: "6.1 基礎",
    caption: "二元堆：完全二叉樹與陣列下標的對應",
    render: heapFigure,
  },
  {
    id: "ds-twoheaps",
    category: "data_structure",
    section: "6.7 對頂堆（滑動視窗第 K 小/大）",
    caption: "對頂堆：用兩個堆維護中位數",
    render: twoHeaps,
  },
  {
    id: "ds-trie",
    category: "data_structure",
    section: "7.1 基礎",
    caption: "字典樹：共同前綴共用路徑",
    render: trieFigure,
  },
  {
    id: "ds-xortrie",
    category: "data_structure",
    section: "7.4 0-1 字典樹（異或字典樹）",
    caption: "0-1 字典樹：逐位貪心求最大異或",
    render: xorTrie,
  },
  {
    id: "ds-uf",
    category: "data_structure",
    section: "8.1 基礎",
    caption: "並查集的路徑壓縮",
    render: unionFind,
  },
  {
    id: "ds-wuf",
    category: "data_structure",
    section: "8.6 帶權並查集（邊權並查集）",
    caption: "帶權並查集：路徑壓縮時合成權重",
    render: weightedUf,
  },
  {
    id: "ds-fenwick",
    category: "data_structure",
    section: "9.1 樹狀陣列",
    caption: "樹狀陣列：每個 t[i] 管理長度為 lowbit(i) 的區間",
    render: fenwick,
  },
  {
    id: "ds-inversion",
    category: "data_structure",
    section: "9.2 逆序對",
    caption: "合併排序中計數逆序對",
    render: inversionMerge,
  },
  {
    id: "ds-segtree",
    category: "data_structure",
    section: "9.3 線段樹（無區間更新）",
    caption: "線段樹：區間查詢拆成 O(log n) 個節點",
    render: () => segTree(false),
  },
  {
    id: "ds-lazy",
    category: "data_structure",
    section: "9.4 Lazy 線段樹（有區間更新）",
    caption: "Lazy 線段樹：在完全覆蓋的節點打標記",
    render: () => segTree(true),
  },
  {
    id: "ds-persistent",
    category: "data_structure",
    section: "9.6 可持久化線段樹",
    caption: "可持久化線段樹：新版本只複製一條路徑",
    render: persistentSeg,
  },
  {
    id: "ds-st",
    category: "data_structure",
    section: "9.7 ST 表（Sparse Table）",
    caption: "ST 表：兩個重疊的 2^k 區間覆蓋查詢區間",
    render: sparseTable,
  },
  {
    id: "ds-splay",
    category: "data_structure",
    section: "10.1 基礎",
    caption: "旋轉：保持中序不變地調整深度",
    render: splayRotate,
  },
  {
    id: "ds-sqrt",
    category: "data_structure",
    section: "11.1 根號分解（Sqrt Decomposition）",
    caption: "根號分解：完整塊整體處理、零散元素逐個處理",
    render: sqrtDecomp,
  },
  {
    id: "ds-mo",
    category: "data_structure",
    section: "11.2 莫隊演算法",
    caption: "莫隊演算法：查詢排序後指標的移動軌跡",
    render: moOrder,
  },
  {
    id: "ds-offline",
    category: "data_structure",
    section: "12.1 基礎",
    caption: "離線處理：查詢與元素一起排序後掃描",
    render: offlineSweep,
  },
];
