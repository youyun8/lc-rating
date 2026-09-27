/**
 * Figures for bitwise operations and graph algorithms. As in part1, every
 * number shown is computed by running the algorithm on the example.
 */
import type { BookFigure } from "./types";
import {
  C,
  array,
  chip,
  drawGraph,
  grid,
  gridHeaders,
  panelTitle,
  rect,
  svg,
  text,
  type GEdge,
  type GNode,
} from "./svg";

const at = <T>(a: readonly T[], i: number): T => a[i] as T;
const bits = (x: number, w: number) =>
  Array.from({ length: w }, (_, i) => (x >> (w - 1 - i)) & 1);

// ---------------------------------------------------------------------------
// Bitwise
// ---------------------------------------------------------------------------

function bitRows(
  rows: {
    label: string;
    value: number;
    note?: string;
    hi?: (bit: number, v: number) => string | undefined;
  }[],
  w: number,
  o: { x0?: number; cell?: number; header?: boolean } = {},
) {
  const cell = o.cell ?? 34;
  const x0 = o.x0 ?? 170;
  let body = "";
  if (o.header !== false) {
    for (let b = 0; b < w; b++)
      body += text(
        x0 + b * cell + cell / 2,
        16,
        `2^${w - 1 - b}`.replace("2^", "b"),
        { size: 10, fill: C.muted, mono: true },
      );
  }
  rows.forEach((r, k) => {
    const y = 28 + k * (cell + 8);
    body += text(x0 - 12, y + cell / 2, r.label, {
      anchor: "end",
      size: 13,
      mono: true,
    });
    const bs = bits(r.value & ((1 << w) - 1), w);
    body += array(x0, y, bs, {
      cell,
      fill: (i) =>
        r.hi?.(w - 1 - i, at(bs, i)) ?? (at(bs, i) ? C.blueSoft : undefined),
      size: 14,
    });
    if (r.note)
      body += text(x0 + w * cell + 14, y + cell / 2, r.note, {
        anchor: "start",
        size: 12,
        fill: C.muted,
      });
  });
  return { body, height: 28 + rows.length * (cell + 8) };
}

function lowbit(): string {
  const x = 44;
  const lb = x & -x;
  const lowIdx = Math.log2(lb);
  const hi = (b: number, v: number) =>
    b === lowIdx ? C.orangeSoft : v ? C.blueSoft : undefined;
  const { body, height } = bitRows(
    [
      { label: "x", value: x, note: `= ${x}`, hi },
      {
        label: "x − 1",
        value: x - 1,
        note: `= ${x - 1}（最低位 1 變 0，其下全變 1）`,
        hi,
      },
      {
        label: "x & (x−1)",
        value: x & (x - 1),
        note: `= ${x & (x - 1)}（去掉最低位的 1）`,
        hi,
      },
      { label: "−x", value: -x, note: "= ~x + 1（補數）", hi },
      {
        label: "x & −x",
        value: lb,
        note: `= ${lb}（只留最低位的 1：lowbit）`,
        hi,
      },
    ],
    8,
  );
  return svg(640, height + 4, body);
}

function bitSet(): string {
  const A = 0b1101;
  const B = 0b0110;
  const setOf = (m: number) =>
    `{${[0, 1, 2, 3].filter((i) => (m >> i) & 1).join(", ")}}`;
  const { body, height } = bitRows(
    [
      { label: "A", value: A, note: `集合 ${setOf(A)}` },
      { label: "B", value: B, note: `集合 ${setOf(B)}` },
      { label: "A | B", value: A | B, note: `聯集 ${setOf(A | B)}` },
      { label: "A & B", value: A & B, note: `交集 ${setOf(A & B)}` },
      { label: "A & ~B", value: A & ~B, note: `差集 A∖B = ${setOf(A & ~B)}` },
      { label: "A ^ B", value: A ^ B, note: `對稱差 ${setOf(A ^ B)}` },
    ],
    4,
    { cell: 36, x0: 120 },
  );
  return svg(
    520,
    height + 20,
    body +
      text(
        120,
        height + 6,
        "第 i 位是 1 ⇔ 元素 i 在集合中（位元由右往左編號 0, 1, 2, …）",
        { anchor: "start", size: 11, fill: C.muted },
      ),
  );
}

function prefixXor(): string {
  const nums = [3, 5, 6, 1, 4];
  const P = [0];
  nums.forEach((v) => P.push(at(P, P.length - 1) ^ v));
  const cell = 46;
  const x0 = 110;
  let body = text(x0 - 14, 50 + cell / 2, "nums", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0 + cell / 2, 50, nums, {
    cell,
    showIndex: true,
    indexBelow: false,
    fill: (i) => (i >= 1 && i <= 3 ? C.blueSoft : undefined),
  });
  body += text(x0 - 14, 140 + cell / 2, "P", {
    anchor: "end",
    size: 13,
    mono: true,
  });
  body += array(x0, 140, P, {
    cell,
    showIndex: true,
    fill: (i) => (i === 1 || i === 4 ? C.orangeSoft : undefined),
  });
  const l = 1;
  const r = 3;
  const xr = nums.slice(l, r + 1).reduce((a, b) => a ^ b, 0);
  body += text(x0, 230, `P[i] = nums[0] ^ … ^ nums[i−1]；P[0] = 0`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(
    x0,
    252,
    `nums[${l}..${r}] 的異或 = P[${r + 1}] ^ P[${l}] = ${at(P, r + 1)} ^ ${at(P, l)} = ${at(P, r + 1) ^ at(P, l)}（直接算：${nums.slice(l, r + 1).join(" ^ ")} = ${xr}）`,
    {
      anchor: "start",
      size: 12,
      mono: true,
      fill: C.orange,
    },
  );
  body += text(
    x0,
    274,
    "原理：x ^ x = 0，P[r+1] 與 P[l] 共同的前綴 nums[0..l−1] 兩兩抵銷。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 290, body);
}

function logTrickTable(
  nums: number[],
  op: (a: number, b: number) => number,
  opName: string,
): string {
  const n = nums.length;
  const cell = 44;
  const x0 = 90;
  const y0 = 60;
  const val = (l: number, r: number) => nums.slice(l, r + 1).reduce(op);
  const palette = [
    C.blueSoft,
    C.orangeSoft,
    C.greenSoft,
    C.purpleSoft,
    C.yellowSoft,
    C.redSoft,
  ];
  let body = gridHeaders(
    x0,
    y0,
    cell,
    nums.map((_, i) => `l=${i}`),
    nums.map((_, i) => `r=${i}`),
  );
  body += text(x0 - 60, y0 - 36, `nums = [${nums.join(", ")}]`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.muted,
  });
  const distinct: number[] = [];
  for (let r = 0; r < n; r++) {
    const vals = new Map<number, number>();
    for (let l = r; l >= 0; l--) {
      const v = val(l, r);
      if (!vals.has(v)) vals.set(v, vals.size);
    }
    distinct.push(vals.size);
    for (let l = 0; l <= r; l++) {
      const v = val(l, r);
      const k = vals.get(v) ?? 0;
      body += rect(x0 + r * cell, y0 + l * cell, cell, cell, {
        fill: at(palette, k % palette.length),
        stroke: C.line,
        sw: 1,
      });
      body += text(x0 + r * cell + cell / 2, y0 + l * cell + cell / 2 + 1, v, {
        mono: true,
        size: 13,
      });
    }
  }
  body += rect(x0, y0, n * cell, n * cell, { stroke: C.ink, sw: 1.2 });
  distinct.forEach((d, r) => {
    body += text(x0 + r * cell + cell / 2, y0 + n * cell + 16, `${d} 種`, {
      size: 11,
      fill: C.orange,
      weight: "bold",
    });
  });
  const tx = x0 + n * cell + 24;
  body += text(tx, y0 + 10, `格 (l, r) = ${opName}(nums[l..r])`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, y0 + 34, "同一行（固定 r）由下往上 l 變小，", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, y0 + 56, "值只會單調變化且每次變化至少", {
    anchor: "start",
    size: 12,
  });
  body += text(
    tx,
    y0 + 78,
    opName === "gcd"
      ? "減半 → 至多 O(log U) 種不同值。"
      : "多一個 1 位 → 至多 O(log U) 種。",
    { anchor: "start", size: 12 },
  );
  body += text(tx, y0 + 108, "同色 = 同值：只需維護每種值", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(tx, y0 + 130, "最左的 l，就能 O(n log U) 列舉。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, y0 + n * cell + 30, body);
}

function splitBits(): string {
  const nums = [3, 5, 6, 7];
  const w = 3;
  const cell = 38;
  const x0 = 110;
  let body = "";
  for (let b = 0; b < w; b++)
    body += text(x0 + b * cell + cell / 2, 16, `b${w - 1 - b}`, {
      size: 11,
      mono: true,
      fill: C.muted,
    });
  nums.forEach((v, k) => {
    const y = 26 + k * (cell + 4);
    body += text(x0 - 12, y + cell / 2, v, {
      anchor: "end",
      mono: true,
      size: 13,
    });
    const bs = bits(v, w);
    body += array(x0, y, bs, {
      cell,
      h: cell,
      fill: (i) => (at(bs, i) ? C.blueSoft : undefined),
    });
  });
  const yb = 26 + nums.length * (cell + 4) + 8;
  let total = 0;
  const lines: string[] = [];
  for (let b = 0; b < w; b++) {
    const bit = w - 1 - b;
    const c1 = nums.filter((v) => (v >> bit) & 1).length;
    const c0 = nums.length - c1;
    body += text(x0 + b * cell + cell / 2, yb + 6, `${c1}·${c0}`, {
      mono: true,
      size: 12,
      fill: C.orange,
      weight: "bold",
    });
    total += c1 * c0 * (1 << bit);
    lines.push(`${c1}×${c0}×${1 << bit}`);
  }
  let brute = 0;
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      brute += at(nums, i) ^ at(nums, j);
  body += text(x0 - 12, yb + 6, "1 的個數·0 的個數", {
    anchor: "end",
    size: 11,
    fill: C.orange,
  });
  const tx = x0 + w * cell + 40;
  body += text(tx, 40, "所有數對的異或和：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 64, "第 b 位只有「一個 1、一個 0」的數對", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 86, "會貢獻 2^b，共 c1 × c0 對。", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 116, `Σ = ${lines.join(" + ")}`, {
    anchor: "start",
    size: 12,
    mono: true,
  });
  body += text(tx, 138, `  = ${total}（暴力驗算 ${brute}）`, {
    anchor: "start",
    size: 12,
    mono: true,
    fill: C.green,
  });
  body += text(tx, 168, "每一位獨立計算 → O(n log U)。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, yb + 24, body);
}

function trialFill(): string {
  const nums = [3, 10, 5, 25, 2, 8];
  const W = 5;
  let ans = 0;
  const rows: { b: number; cand: number; ok: boolean; pair: string }[] = [];
  for (let b = W - 1; b >= 0; b--) {
    const mask = ((1 << W) - 1) ^ ((1 << b) - 1);
    const cand = ans | (1 << b);
    const seen = new Set<number>();
    let ok = false;
    let pair = "";
    for (const x of nums) {
      const p = x & mask;
      if (seen.has(p ^ cand)) {
        ok = true;
        const y = nums.find((z) => (z & mask) === (p ^ cand));
        pair = `${y} ^ ${x}`;
        break;
      }
      seen.add(p);
    }
    rows.push({ b, cand, ok, pair });
    if (ok) ans = cand;
  }
  const x0 = 30;
  const cell = 30;
  let body = text(
    x0,
    16,
    `nums = [${nums.join(", ")}]：從高位到低位逐位「試著填 1」`,
    { anchor: "start", size: 12, fill: C.muted },
  );
  body += text(x0, 44, "位", { anchor: "start", size: 12, weight: "bold" });
  body += text(x0 + 50, 44, "候選答案（二進位）", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(x0 + 250, 44, "能否找到兩數前綴異或 = 候選？", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  rows.forEach((r, k) => {
    const y = 60 + k * (cell + 8);
    body += text(x0 + 10, y + cell / 2, `b${r.b}`, { mono: true, size: 13 });
    const bs = bits(r.cand, W);
    body += array(x0 + 50, y, bs, {
      cell,
      size: 13,
      fill: (i) =>
        W - 1 - i === r.b
          ? r.ok
            ? C.greenSoft
            : C.redSoft
          : W - 1 - i > r.b
            ? C.gray
            : undefined,
      dim: (i) => W - 1 - i < r.b,
    });
    body += text(
      x0 + 250,
      y + cell / 2,
      r.ok ? `可以（${r.pair}）→ 這一位定為 1` : "不行 → 這一位只能是 0",
      {
        anchor: "start",
        size: 12,
        fill: r.ok ? C.green : C.red,
      },
    );
  });
  const y = 60 + rows.length * (cell + 8) + 10;
  body += text(
    x0,
    y,
    `最大異或值 = ${ans}。高位的 1 比低位全部加起來還大，所以逐位貪心是對的。`,
    { anchor: "start", size: 12, weight: "bold" },
  );
  return svg(640, y + 16, body);
}

function linearBasis(): string {
  const nums = [9, 13, 6, 7, 10];
  const W = 4;
  const basis = new Array<number>(W).fill(0);
  const steps: { x: number; trace: number[]; placed: number | null }[] = [];
  for (const x0 of nums) {
    let x = x0;
    const trace = [x];
    let placed: number | null = null;
    for (let b = W - 1; b >= 0; b--) {
      if (!((x >> b) & 1)) continue;
      if (at(basis, b) === 0) {
        basis[b] = x;
        placed = b;
        break;
      }
      x ^= at(basis, b);
      trace.push(x);
    }
    steps.push({ x: x0, trace, placed });
  }
  const x0 = 30;
  let body = text(x0, 16, `依序插入 ${nums.join(", ")}（4 位元）`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  steps.forEach((s, k) => {
    const y = 40 + k * 32;
    body += text(x0, y, `插入 ${s.x}`, {
      anchor: "start",
      size: 12,
      mono: true,
      weight: "bold",
    });
    const chain = s.trace
      .map((v) => v.toString(2).padStart(W, "0"))
      .join(" → ");
    body += text(x0 + 80, y, chain, { anchor: "start", size: 12, mono: true });
    body += text(
      x0 + 330,
      y,
      s.placed === null
        ? "消成 0：與既有基線性相關，丟棄"
        : `放進 basis[${s.placed}]`,
      {
        anchor: "start",
        size: 12,
        fill: s.placed === null ? C.red : C.green,
      },
    );
  });
  const yb = 40 + steps.length * 32 + 10;
  body += panelTitle(x0, yb, "最終的基（每一列的最高位 = 主元，互不相同）");
  const cell = 32;
  for (let b = W - 1; b >= 0; b--) {
    const y = yb + 14 + (W - 1 - b) * (cell + 4);
    body += text(x0 + 60, y + cell / 2, `basis[${b}]`, {
      anchor: "end",
      size: 12,
      mono: true,
    });
    const v = at(basis, b);
    const bs = bits(v, W);
    body += array(x0 + 70, y, bs, {
      cell,
      size: 13,
      fill: (i) =>
        v && W - 1 - i === b
          ? C.orangeSoft
          : at(bs, i)
            ? C.blueSoft
            : undefined,
      dim: () => v === 0,
    });
    body += text(
      x0 + 70 + W * cell + 12,
      y + cell / 2,
      v ? `= ${v}` : "（空）",
      { anchor: "start", size: 12, fill: C.muted },
    );
  }
  const yEnd = yb + 14 + W * (cell + 4);
  body += text(
    x0 + 260,
    yb + 50,
    `基的大小 = ${basis.filter(Boolean).length}：原集合能異或出`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0 + 260,
    yb + 72,
    `2^${basis.filter(Boolean).length} = ${1 << basis.filter(Boolean).length} 種不同的值。`,
    { anchor: "start", size: 12 },
  );
  body += text(x0 + 260, yb + 102, "求最大異或：從高位的基開始，", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(x0 + 260, yb + 124, "能讓答案變大就異或進去。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(640, yEnd + 8, body);
}

function xorAndIdentity(): string {
  const a = 13;
  const b = 11;
  const { body, height } = bitRows(
    [
      { label: "a", value: a, note: `= ${a}` },
      { label: "b", value: b, note: `= ${b}` },
      { label: "a ^ b", value: a ^ b, note: `= ${a ^ b}（不進位的加法）` },
      { label: "a & b", value: a & b, note: `= ${a & b}（需要進位的位置）` },
      {
        label: "(a&b)<<1",
        value: (a & b) << 1,
        note: `= ${(a & b) << 1}（進位往左一格）`,
      },
    ],
    6,
    { cell: 34, x0: 130 },
  );
  return svg(
    560,
    height + 30,
    body +
      text(
        130,
        height + 12,
        `a + b = (a ^ b) + 2·(a & b) = ${a ^ b} + ${(a & b) << 1} = ${a + b}`,
        {
          anchor: "start",
          size: 13,
          mono: true,
          weight: "bold",
          fill: C.orange,
        },
      ),
  );
}

function submasks(): string {
  const m = 0b1011;
  const list: number[] = [];
  for (let s = m; ; s = (s - 1) & m) {
    list.push(s);
    if (s === 0) break;
  }
  const cell = 28;
  const x0 = 40;
  let body = text(x0, 16, `枚舉 m = 1011 的所有子集：s = (s − 1) & m`, {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  list.forEach((s, k) => {
    const col = k % 4;
    const row = Math.floor(k / 4);
    const x = x0 + col * 150;
    const y = 36 + row * 56;
    const bs = bits(s, 4);
    body += array(x, y, bs, {
      cell,
      size: 13,
      fill: (i) =>
        at(bs, i) ? C.blueSoft : (m >> (3 - i)) & 1 ? undefined : C.gray,
    });
    body += text(x + 4 * cell + 8, y + cell / 2, `${s}`, {
      anchor: "start",
      size: 12,
      mono: true,
      fill: C.muted,
    });
    if (k < list.length - 1 && col < 3)
      body += text(x + 4 * cell + 34, y + cell / 2, "→", {
        anchor: "start",
        size: 14,
        fill: C.orange,
      });
  });
  const y = 36 + Math.ceil(list.length / 4) * 56;
  body += text(
    x0,
    y,
    `共 2^popcount(m) = ${list.length} 個，由大到小；灰色位永遠為 0。對所有 m 枚舉子集總計 O(3^n)。`,
    { anchor: "start", size: 12 },
  );
  return svg(640, y + 16, body);
}

// ---------------------------------------------------------------------------
// Graphs
// ---------------------------------------------------------------------------

const G7: GNode[] = [
  { id: 0, x: 60, y: 110 },
  { id: 1, x: 170, y: 50 },
  { id: 2, x: 170, y: 170 },
  { id: 3, x: 290, y: 50 },
  { id: 4, x: 290, y: 170 },
  { id: 5, x: 400, y: 110 },
  { id: 6, x: 400, y: 220 },
];
const E7: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];

function adj(n: number, edges: [number, number][], directed = false) {
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    at(g, a).push(b);
    if (!directed) at(g, b).push(a);
  }
  g.forEach((l) => l.sort((x, y) => x - y));
  return g;
}

function dfsFigure(): string {
  const g = adj(7, E7);
  const order: number[] = [];
  const treeEdges = new Set<string>();
  const seen = new Set<number>();
  const dfs = (u: number) => {
    seen.add(u);
    order.push(u);
    for (const v of at(g, u)) {
      if (!seen.has(v)) {
        treeEdges.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
        dfs(v);
      }
    }
  };
  dfs(0);
  const nodes = G7.map((n) => ({
    ...n,
    x: n.x + 20,
    y: n.y + 20,
    note: `#${order.indexOf(Number(n.id)) + 1}`,
    noteDy: -26,
    fill: n.id === 0 ? C.orangeSoft : C.blueSoft,
  }));
  const edges: GEdge[] = E7.map(([a, b]) => {
    const tree = treeEdges.has(`${a}-${b}`);
    return {
      a,
      b,
      color: tree ? C.blue : C.line,
      sw: tree ? 2.6 : 1.3,
      dash: tree ? undefined : "5 4",
    };
  });
  let body = drawGraph(nodes, edges);
  body += text(480, 60, `DFS 順序：${order.join(" → ")}`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(480, 86, "藍色實線：DFS 樹邊", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(480, 108, "灰色虛線：回邊（指向祖先）", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(480, 138, "#k：第 k 個被造訪。", {
    anchor: "start",
    size: 12,
    fill: C.orange,
  });
  body += text(480, 160, "鄰居由小到大嘗試；一路走到底", {
    anchor: "start",
    size: 12,
  });
  body += text(480, 182, "再回溯，所以 4 比 2 早結束。", {
    anchor: "start",
    size: 12,
  });
  return svg(720, 270, body);
}

function bfsFigure(): string {
  const g = adj(7, E7);
  const dist = new Array<number>(7).fill(-1);
  dist[0] = 0;
  const q = [0];
  const parent = new Array<number>(7).fill(-1);
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    for (const v of at(g, u)) {
      if (at(dist, v) === -1) {
        dist[v] = at(dist, u) + 1;
        parent[v] = u;
        q.push(v);
      }
    }
  }
  const maxD = Math.max(...dist);
  const layers: number[][] = Array.from({ length: maxD + 1 }, () => []);
  q.forEach((u) => at(layers, at(dist, u)).push(u));
  const fills = [
    C.orangeSoft,
    C.blueSoft,
    C.greenSoft,
    C.purpleSoft,
    C.yellowSoft,
  ];
  const colW = 120;
  const nodes: GNode[] = [];
  layers.forEach((L, d) => {
    L.forEach((u, k) => {
      nodes.push({
        id: u,
        x: 60 + d * colW,
        y: 70 + k * 70 + (3 - L.length) * 35 - 35,
        fill: at(fills, d),
      });
    });
  });
  let body = "";
  layers.forEach((_, d) => {
    body += rect(60 + d * colW - 40, 26, 80, 212, {
      fill: at(fills, d),
      stroke: "none",
      rx: 8,
      opacity: 0.35,
    });
    body += text(60 + d * colW, 18, `距離 ${d}`, { size: 12, weight: "bold" });
  });
  const edges: GEdge[] = E7.map(([a, b]) => {
    const tree = at(parent, b) === a || at(parent, a) === b;
    return {
      a,
      b,
      color: tree ? C.blue : C.line,
      sw: tree ? 2.4 : 1.2,
      dash: tree ? undefined : "5 4",
    };
  });
  body += drawGraph(nodes, edges);
  const tx = 60 + (maxD + 1) * colW - 10;
  body += text(tx, 60, `出佇列順序：${q.join(", ")}`, {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 86, "同一層的點距離相同；", { anchor: "start", size: 12 });
  body += text(tx, 108, "邊只連同層或相鄰層。", { anchor: "start", size: 12 });
  body += text(tx, 138, "藍邊構成 BFS 樹：", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  body += text(tx, 160, "樹上路徑即最短路。", {
    anchor: "start",
    size: 12,
    fill: C.blue,
  });
  return svg(740, 250, body);
}

function wordLadder(): string {
  const words = ["hit", "hot", "dot", "lot", "dog", "log", "cog"];
  const pos: Record<string, [number, number]> = {
    hit: [60, 110],
    hot: [170, 110],
    dot: [290, 50],
    lot: [290, 170],
    dog: [410, 50],
    log: [410, 170],
    cog: [530, 110],
  };
  const diff1 = (a: string, b: string) =>
    a.split("").filter((c, i) => c !== b.charAt(i)).length === 1;
  const edges: GEdge[] = [];
  for (let i = 0; i < words.length; i++)
    for (let j = i + 1; j < words.length; j++)
      if (diff1(at(words, i), at(words, j)))
        edges.push({ a: at(words, i), b: at(words, j) });
  const path = ["hit", "hot", "dot", "dog", "cog"];
  const onPath = (a: string | number, b: string | number) =>
    path.some(
      (w, k) =>
        k > 0 &&
        ((at(path, k - 1) === a && w === b) ||
          (at(path, k - 1) === b && w === a)),
    );
  const nodes: GNode[] = words.map((w) => ({
    id: w,
    x: at(pos[w]!, 0),
    y: at(pos[w]!, 1),
    fill: path.includes(w) ? C.greenSoft : C.paper,
  }));
  const styled = edges.map((e) =>
    onPath(e.a, e.b) ? { ...e, color: C.green, sw: 2.6 } : e,
  );
  let body = drawGraph(nodes, styled, { r: 22, size: 13 });
  body += text(
    60,
    220,
    "點 = 單字；兩字只差一個字母就連邊。hit → cog 的最少轉換次數 = 這張隱式圖上的 BFS 最短路（4 步）。",
    { anchor: "start", size: 12 },
  );
  body += text(
    60,
    242,
    "不必先建完整張圖：出佇列時枚舉「改一個字母」的所有候選，查字典即可。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 258, body);
}

function jumpGame(): string {
  const arr = [4, 2, 3, 0, 3, 1, 2];
  const start = 5;
  const n = arr.length;
  const dist = new Array<number>(n).fill(-1);
  dist[start] = 0;
  const q = [start];
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    for (const v of [u + at(arr, u), u - at(arr, u)]) {
      if (v >= 0 && v < n && at(dist, v) === -1) {
        dist[v] = at(dist, u) + 1;
        q.push(v);
      }
    }
  }
  const cell = 56;
  const x0 = 40;
  const y0 = 110;
  let body = array(x0, y0, arr, {
    cell,
    showIndex: true,
    fill: (i) =>
      i === start
        ? C.orangeSoft
        : at(arr, i) === 0
          ? C.greenSoft
          : at(dist, i) >= 0
            ? C.blueSoft
            : C.gray,
  });
  for (let i = 0; i < n; i++) {
    for (const j of [i + at(arr, i), i - at(arr, i)]) {
      if (j < 0 || j >= n || j === i) continue;
      const x1 = x0 + i * cell + cell / 2;
      const x2 = x0 + j * cell + cell / 2;
      const h = 14 + Math.abs(j - i) * 12;
      const up = j > i;
      const yy = up ? y0 : y0 + cell;
      const cy = up ? yy - h * 1.6 : yy + h * 1.6 + 16;
      body += `<path d="M${x1},${yy} Q${(x1 + x2) / 2},${cy} ${x2 + (up ? -4 : 4)},${yy + (up ? -2 : 2)}" fill="none" stroke="${at(dist, i) >= 0 ? C.blue : C.line}" stroke-width="1.4" marker-end="url(#${at(dist, i) >= 0 ? "ah-blue" : "ah-muted"})"/>`;
    }
  }
  for (let i = 0; i < n; i++) {
    if (at(dist, i) >= 0)
      body += text(
        x0 + i * cell + cell / 2,
        y0 + cell / 2 + 16,
        `d=${at(dist, i)}`,
        { size: 10, fill: C.orange },
      );
  }
  body += text(
    x0,
    290,
    `從下標 ${start} 出發，每格可跳到 i ± arr[i]（上方弧向右、下方弧向左）。BFS 找到值為 0 的下標 3。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    x0,
    310,
    "把「位置」當點、「一次跳躍」當邊，陣列題就變成圖上的最短路。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 326, body);
}

const DAG: GNode[] = [
  { id: 0, x: 60, y: 60 },
  { id: 1, x: 60, y: 180 },
  { id: 2, x: 190, y: 60 },
  { id: 3, x: 190, y: 180 },
  { id: 4, x: 320, y: 120 },
  { id: 5, x: 450, y: 60 },
  { id: 6, x: 450, y: 180 },
];
const DAG_E: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 3],
  [2, 4],
  [3, 4],
  [2, 5],
  [4, 5],
  [4, 6],
  [3, 6],
];

function topoFigure(): string {
  const n = 7;
  const g = adj(n, DAG_E, true);
  const indeg = new Array<number>(n).fill(0);
  DAG_E.forEach(([, b]) => (indeg[b] = at(indeg, b) + 1));
  const origIn = [...indeg];
  const q: number[] = [];
  indeg.forEach((d, i) => d === 0 && q.push(i));
  const order: number[] = [];
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    order.push(u);
    for (const v of at(g, u)) {
      indeg[v] = at(indeg, v) - 1;
      if (at(indeg, v) === 0) q.push(v);
    }
  }
  const nodes = DAG.map((d) => ({
    ...d,
    y: d.y + 10,
    fill: C.blueSoft,
    note: `入度 ${at(origIn, Number(d.id))}・第 ${order.indexOf(Number(d.id)) + 1}`,
    noteDy: 32,
  }));
  let body = drawGraph(
    nodes,
    DAG_E.map(([a, b]) => ({ a, b, directed: true })),
  );
  const y = 250;
  body += text(40, y, "拓撲序：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  order.forEach((u, k) => {
    body += rect(100 + k * 46, y - 14, 38, 28, {
      fill: C.greenSoft,
      stroke: C.green,
      rx: 4,
    });
    body += text(100 + k * 46 + 19, y, u, { mono: true, size: 13 });
    if (k < order.length - 1)
      body += text(100 + k * 46 + 42, y, "›", { size: 14, fill: C.muted });
  });
  body += text(
    40,
    y + 34,
    "Kahn 演算法：入度為 0 的點入佇列；彈出時刪掉它的出邊，鄰點入度歸零就入佇列。",
    { anchor: "start", size: 12 },
  );
  body += text(40, y + 54, "若最後輸出的點數 < n，圖中有環。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(560, y + 70, body);
}

function dagDp(): string {
  const n = 7;
  const w = [3, 2, 4, 1, 5, 2, 3];
  const g = adj(n, DAG_E, true);
  const pred: number[][] = Array.from({ length: n }, () => []);
  DAG_E.forEach(([a, b]) => at(pred, b).push(a));
  const indeg = new Array<number>(n).fill(0);
  DAG_E.forEach(([, b]) => (indeg[b] = at(indeg, b) + 1));
  const q: number[] = [];
  indeg.forEach((d, i) => d === 0 && q.push(i));
  for (let h = 0; h < q.length; h++) {
    for (const v of at(g, at(q, h))) {
      indeg[v] = at(indeg, v) - 1;
      if (at(indeg, v) === 0) q.push(v);
    }
  }
  const f = new Array<number>(n).fill(0);
  const from = new Array<number>(n).fill(-1);
  for (const u of q) {
    let best = 0;
    for (const p of at(pred, u)) {
      if (at(f, p) > best) {
        best = at(f, p);
        from[u] = p;
      }
    }
    f[u] = best + at(w, u);
  }
  let end = 0;
  f.forEach((v, i) => v > at(f, end) && (end = i));
  const onPath = new Set<number>();
  for (let u = end; u !== -1; u = at(from, u)) onPath.add(u);
  const nodes = DAG.map((d) => ({
    ...d,
    y: d.y + 20,
    label: `${d.id}`,
    fill: onPath.has(Number(d.id)) ? C.orangeSoft : C.paper,
    note: `w=${at(w, Number(d.id))}  f=${at(f, Number(d.id))}`,
    noteDy: 32,
    noteColor: onPath.has(Number(d.id)) ? C.orange : C.muted,
  }));
  const edges: GEdge[] = DAG_E.map(([a, b]) => ({
    a,
    b,
    directed: true,
    color:
      onPath.has(a) && onPath.has(b) && at(from, b) === a ? C.orange : C.ink,
    sw: onPath.has(a) && onPath.has(b) && at(from, b) === a ? 2.6 : 1.3,
  }));
  let body = drawGraph(nodes, edges);
  body += text(
    40,
    262,
    `f[v] = w[v] + max{ f[u] : u → v }，按拓撲序計算。最重路徑權重 = ${at(f, end)}（橘色）。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    40,
    282,
    "拓撲序保證算 f[v] 時所有前驅都已算好——這就是 DAG 上 DP 的「無後效性」。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(560, 298, body);
}

function functionalGraph(): string {
  const f = [1, 2, 3, 1, 3, 4, 7, 8, 6, 8];
  const n = f.length;
  // Find cycle nodes: repeatedly remove indegree-0 nodes.
  const indeg = new Array<number>(n).fill(0);
  f.forEach((t) => (indeg[t] = at(indeg, t) + 1));
  const q: number[] = [];
  indeg.forEach((d, i) => d === 0 && q.push(i));
  const removed = new Set<number>();
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    removed.add(u);
    const v = at(f, u);
    indeg[v] = at(indeg, v) - 1;
    if (at(indeg, v) === 0) q.push(v);
  }
  const pos: [number, number][] = [
    [40, 150],
    [120, 100],
    [210, 60],
    [210, 150],
    [300, 100],
    [390, 100],
    [470, 170],
    [520, 90],
    [590, 170],
    [620, 60],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y: y + 10,
    fill: removed.has(i) ? C.paper : C.orangeSoft,
  }));
  const edges: GEdge[] = f.map((t, i) => {
    const cyc = !removed.has(i) && !removed.has(t);
    return {
      a: i,
      b: t,
      directed: true,
      color: cyc ? C.orange : C.ink,
      sw: cyc ? 2.4 : 1.3,
      bend: i === 3 ? 18 : i === 1 ? 0 : 0,
    };
  });
  let body = drawGraph(nodes, edges);
  body += text(
    30,
    230,
    `f = [${f.join(", ")}]：每個點恰有一條出邊 i → f[i]。`,
    { anchor: "start", size: 12, mono: true },
  );
  body += text(
    30,
    252,
    "每個連通塊恰有一個環（橘色），其餘點形成指向環的樹。拓撲排序剝掉入度為 0 的點，剩下的就是環。",
    { anchor: "start", size: 12 },
  );
  return svg(660, 268, body);
}

interface WEdge {
  a: number;
  b: number;
  w: number;
}

function dijkstraFigure(): string {
  const n = 5;
  const E: WEdge[] = [
    { a: 0, b: 1, w: 4 },
    { a: 0, b: 2, w: 1 },
    { a: 2, b: 1, w: 2 },
    { a: 1, b: 3, w: 1 },
    { a: 2, b: 3, w: 5 },
    { a: 3, b: 4, w: 3 },
    { a: 2, b: 4, w: 8 },
  ];
  const INF = Infinity;
  const dist = new Array<number>(n).fill(INF);
  dist[0] = 0;
  const done = new Array<boolean>(n).fill(false);
  const snaps: { pick: number; dist: number[] }[] = [];
  const par = new Array<number>(n).fill(-1);
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!at(done, i) && (u === -1 || at(dist, i) < at(dist, u))) u = i;
    done[u] = true;
    for (const e of E) {
      if (e.a === u && at(dist, u) + e.w < at(dist, e.b)) {
        dist[e.b] = at(dist, u) + e.w;
        par[e.b] = u;
      }
    }
    snaps.push({ pick: u, dist: [...dist] });
  }
  const pos: [number, number][] = [
    [50, 110],
    [180, 40],
    [180, 180],
    [310, 110],
    [420, 180],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y: y + 10,
    fill: C.blueSoft,
    note: `d=${at(dist, i)}`,
    noteDy: -27,
  }));
  const edges: GEdge[] = E.map((e) => ({
    a: e.a,
    b: e.b,
    w: e.w,
    directed: true,
    color: at(par, e.b) === e.a ? C.blue : C.ink,
    sw: at(par, e.b) === e.a ? 2.6 : 1.3,
  }));
  let body = drawGraph(nodes, edges);
  const x0 = 470;
  const cw = 30;
  body += text(x0, 14, "每輪取出的點與 dist", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  for (let i = 0; i < n; i++)
    body += text(x0 + 46 + i * cw + cw / 2, 36, i, {
      size: 11,
      mono: true,
      fill: C.muted,
    });
  snaps.forEach((s, k) => {
    const y = 46 + k * 30;
    body += chip(x0 + 18, y + 12, `取 ${s.pick}`, { size: 10, fill: C.orange });
    s.dist.forEach((d, i) => {
      const fin = snaps.slice(0, k + 1).some((t) => t.pick === i);
      body += rect(x0 + 46 + i * cw, y, cw, 24, {
        fill: i === s.pick ? C.orangeSoft : fin ? C.gray : C.paper,
        stroke: C.line,
        sw: 1,
      });
      body += text(x0 + 46 + i * cw + cw / 2, y + 12, d === INF ? "∞" : d, {
        size: 12,
        mono: true,
        fill: fin && i !== s.pick ? C.muted : C.ink,
      });
    });
  });
  body += text(
    30,
    250,
    "每輪取出 dist 最小且未確定的點（橘），用它鬆弛出邊；灰色 = 已確定。藍邊為最短路樹。",
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    270,
    "正確性依賴邊權非負：被取出的點不可能再經由更遠的點變得更近。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(700, 286, body);
}

function layeredGraph(): string {
  const base: [number, number][] = [
    [60, 0],
    [180, 0],
    [300, 0],
    [420, 0],
  ];
  const E: WEdge[] = [
    { a: 0, b: 1, w: 5 },
    { a: 1, b: 2, w: 6 },
    { a: 2, b: 3, w: 4 },
    { a: 0, b: 2, w: 9 },
  ];
  const layers = 2;
  const nodes: GNode[] = [];
  for (let L = 0; L < layers; L++) {
    base.forEach(([x], i) =>
      nodes.push({
        id: `${i}_${L}`,
        label: `${i}`,
        x: x + 40,
        y: 70 + L * 130,
        fill: L === 0 ? C.blueSoft : C.orangeSoft,
      }),
    );
  }
  const edges: GEdge[] = [];
  for (let L = 0; L < layers; L++) {
    for (const e of E)
      edges.push({
        a: `${e.a}_${L}`,
        b: `${e.b}_${L}`,
        w: e.w,
        directed: true,
        bend: e.a === 0 && e.b === 2 ? -30 : 0,
      });
  }
  for (const e of E) {
    edges.push({
      a: `${e.a}_0`,
      b: `${e.b}_1`,
      w: 0,
      directed: true,
      color: C.green,
      dash: "5 3",
    });
  }
  let body = "";
  body += rect(20, 20, 520, 100, {
    fill: C.blueSoft,
    stroke: "none",
    rx: 10,
    opacity: 0.35,
  });
  body += rect(20, 150, 520, 100, {
    fill: C.orangeSoft,
    stroke: "none",
    rx: 10,
    opacity: 0.45,
  });
  body += text(30, 36, "第 0 層：還沒用免費券", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(30, 240, "第 1 層：已用 1 張免費券", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += drawGraph(nodes, edges);
  body += text(
    20,
    280,
    "綠色虛線：使用免費券走這條邊（邊權 0）並下降一層。在 (點, 已用次數) 的分層圖上跑 Dijkstra。",
    { anchor: "start", size: 12 },
  );
  body += text(
    20,
    300,
    "k 次機會 → k+1 層，點數變成 n(k+1)，複雜度 O(k·m log(nk))。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 316, body);
}

function diffConstraints(): string {
  const cons: [number, number, number][] = [
    [1, 0, 3],
    [2, 1, -2],
    [2, 0, 2],
    [3, 2, 4],
    [3, 1, 1],
  ];
  // Edge u -> v with weight w encodes x_v - x_u <= w.
  const n = 4;
  const S = n;
  const dist = new Array<number>(n + 1).fill(Infinity);
  dist[S] = 0;
  const E: WEdge[] = cons.map(([v, u, w]) => ({ a: u, b: v, w }));
  for (let i = 0; i < n; i++) E.push({ a: S, b: i, w: 0 });
  for (let k = 0; k < n; k++)
    for (const e of E)
      if (at(dist, e.a) + e.w < at(dist, e.b)) dist[e.b] = at(dist, e.a) + e.w;
  const pos: [number, number][] = [
    [80, 150],
    [220, 60],
    [360, 150],
    [220, 250],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    label: `x${i}`,
    x,
    y,
    fill: C.blueSoft,
    note: `= ${at(dist, i)}`,
    noteDy: -28,
  }));
  const edges: GEdge[] = cons.map(([v, u, w]) => ({
    a: u,
    b: v,
    w,
    directed: true,
    bend: u === 1 && v === 3 ? 70 : 0,
  }));
  let body = drawGraph(nodes, edges, { r: 19, size: 12 });
  const tx = 430;
  body += text(tx, 40, "約束 x_v − x_u ≤ w", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  body += text(tx, 60, "⇔ 邊 u → v，權重 w", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  cons.forEach(([v, u, w], k) => {
    body += text(tx, 90 + k * 22, `x${v} − x${u} ≤ ${w}`, {
      anchor: "start",
      size: 12,
      mono: true,
    });
  });
  body += text(tx, 90 + cons.length * 22 + 10, "加超級源點連到每點（權 0），", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90 + cons.length * 22 + 32, "最短路 dist 即一組可行解；", {
    anchor: "start",
    size: 12,
  });
  body += text(tx, 90 + cons.length * 22 + 54, "有負環 ⇔ 無解。", {
    anchor: "start",
    size: 12,
    fill: C.red,
  });
  return svg(660, 290, body);
}

function floydFigure(): string {
  const n = 4;
  const INF = Infinity;
  const E: WEdge[] = [
    { a: 0, b: 1, w: 3 },
    { a: 1, b: 2, w: 2 },
    { a: 2, b: 3, w: 1 },
    { a: 0, b: 3, w: 9 },
    { a: 3, b: 0, w: 2 },
    { a: 1, b: 3, w: 7 },
  ];
  const d0: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)),
  );
  E.forEach((e) => (at(d0, e.a)[e.b] = e.w));
  const d = d0.map((r) => [...r]);
  const changedBy: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(-1),
  );
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (at(at(d, i), k) + at(at(d, k), j) < at(at(d, i), j)) {
          at(d, i)[j] = at(at(d, i), k) + at(at(d, k), j);
          at(changedBy, i)[j] = k;
        }
  const pos: [number, number][] = [
    [50, 60],
    [170, 60],
    [170, 180],
    [50, 180],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y: y + 10,
    fill: C.blueSoft,
  }));
  let body = drawGraph(
    nodes,
    E.map((e) => ({
      a: e.a,
      b: e.b,
      w: e.w,
      directed: true,
      bend:
        (e.a === 0 && e.b === 3) || (e.a === 3 && e.b === 0)
          ? e.a === 0
            ? 18
            : 18
          : 0,
    })),
  );
  const cell = 36;
  const fmt = (v: number) => (v === INF ? "∞" : v);
  const gx1 = 260;
  const gy = 50;
  body += panelTitle(gx1, 24, "初始 D（只有直接邊）");
  body += grid(gx1, gy, n, n, {
    cell,
    label: (i, j) => fmt(at(at(d0, i), j)),
    fill: (i, j) => (i === j ? C.gray : undefined),
  });
  body += gridHeaders(gx1, gy, cell, [0, 1, 2, 3], null);
  const gx2 = gx1 + n * cell + 50;
  body += panelTitle(gx2, 24, "k = 0..3 全部做完");
  body += grid(gx2, gy, n, n, {
    cell,
    label: (i, j) => fmt(at(at(d, i), j)),
    fill: (i, j) =>
      i === j
        ? C.gray
        : at(at(changedBy, i), j) >= 0
          ? C.orangeSoft
          : undefined,
  });
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const k = at(at(changedBy, i), j);
      if (k >= 0)
        body += text(gx2 + j * cell + cell - 5, gy + i * cell + 9, `k${k}`, {
          size: 8,
          fill: C.orange,
          anchor: "end",
        });
    }
  body += text(
    30,
    250,
    "D[i][j] = min(D[i][j], D[i][k] + D[k][j])：第 k 輪結束時，D 是「中轉點只用 0..k」的最短路。",
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    270,
    "橘色格子被更新過，右上角標出最後一次更新它的中轉點 k。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(660, 286, body);
}

function kruskalFigure(): string {
  const pos: [number, number][] = [
    [60, 60],
    [200, 40],
    [340, 60],
    [60, 200],
    [200, 170],
    [340, 200],
  ];
  const E: WEdge[] = [
    { a: 0, b: 1, w: 4 },
    { a: 1, b: 2, w: 6 },
    { a: 0, b: 3, w: 2 },
    { a: 1, b: 4, w: 3 },
    { a: 2, b: 5, w: 5 },
    { a: 3, b: 4, w: 7 },
    { a: 4, b: 5, w: 1 },
    { a: 0, b: 4, w: 8 },
    { a: 2, b: 4, w: 4 },
  ];
  const fa = pos.map((_, i) => i);
  const find = (x: number): number =>
    at(fa, x) === x ? x : (fa[x] = find(at(fa, x)));
  const order = [...E].sort((p, q) => p.w - q.w);
  const chosen = new Map<WEdge, number>();
  const rejected = new Set<WEdge>();
  let total = 0;
  for (const e of order) {
    const ra = find(e.a);
    const rb = find(e.b);
    if (ra === rb) {
      rejected.add(e);
      continue;
    }
    fa[ra] = rb;
    chosen.set(e, chosen.size + 1);
    total += e.w;
  }
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x: x + 10,
    y: y + 10,
    fill: C.blueSoft,
  }));
  const edges: GEdge[] = E.map((e) => ({
    a: e.a,
    b: e.b,
    w: e.w,
    color: chosen.has(e) ? C.green : C.line,
    sw: chosen.has(e) ? 3 : 1.2,
    dash: chosen.has(e) ? undefined : "4 3",
  }));
  let body = drawGraph(nodes, edges);
  const tx = 410;
  body += text(tx, 30, "邊按權重排序後依序考慮：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  order.forEach((e, k) => {
    const y = 54 + k * 20;
    const c = chosen.get(e);
    body += text(tx, y, `w=${e.w}  (${e.a},${e.b})`, {
      anchor: "start",
      size: 12,
      mono: true,
    });
    body += text(tx + 120, y, c ? `選，第 ${c} 條` : "跳過（成環）", {
      anchor: "start",
      size: 12,
      fill: c ? C.green : C.red,
    });
  });
  body += text(
    20,
    260,
    `綠色 = 最小生成樹，總權重 ${total}。並查集判斷兩端是否已連通：已連通再加邊就會成環。`,
    { anchor: "start", size: 12 },
  );
  return svg(640, 276, body);
}

function eulerFigure(): string {
  const pos: [number, number][] = [
    [60, 140],
    [180, 50],
    [180, 230],
    [320, 140],
    [440, 50],
    [440, 230],
  ];
  const E: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 0],
    [1, 3],
    [3, 2],
    [3, 4],
    [4, 5],
    [5, 3],
  ];
  // Hierholzer on undirected multigraph, starting from an odd vertex if any.
  const n = pos.length;
  const g: { to: number; id: number }[][] = Array.from({ length: n }, () => []);
  E.forEach(([a, b], id) => {
    at(g, a).push({ to: b, id });
    at(g, b).push({ to: a, id });
  });
  g.forEach((l) => l.sort((p, q) => p.to - q.to));
  const used = new Array<boolean>(E.length).fill(false);
  const deg = g.map((l) => l.length);
  const startV = Math.max(
    0,
    deg.findIndex((d) => d % 2 === 1),
  );
  const stack: [number, number][] = [[startV, -1]];
  const pathEdges: number[] = [];
  const pathV: number[] = [];
  while (stack.length) {
    const [u] = at(stack, stack.length - 1);
    const nxt = at(g, u).find((e) => !at(used, e.id));
    if (nxt) {
      used[nxt.id] = true;
      stack.push([nxt.to, nxt.id]);
    } else {
      const [v, eid] = stack.pop() as [number, number];
      pathV.push(v);
      if (eid >= 0) pathEdges.push(eid);
    }
  }
  pathV.reverse();
  pathEdges.reverse();
  const stepOf = new Map<number, number>();
  pathEdges.forEach((e, k) => stepOf.set(e, k + 1));
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y,
    fill: at(deg, i) % 2 ? C.orangeSoft : C.blueSoft,
    note: `度 ${at(deg, i)}`,
    noteDy: 30,
  }));
  const edges: GEdge[] = E.map(([a, b], id) => ({
    a,
    b,
    w: `${stepOf.get(id)}`,
    color: C.purple,
    sw: 2,
  }));
  let body = drawGraph(nodes, edges);
  body += text(500, 60, "邊上數字：歐拉路徑中的第幾步", {
    anchor: "start",
    size: 12,
  });
  body += text(500, 84, `路徑：${pathV.join("→")}`, {
    anchor: "start",
    size: 12,
    mono: true,
    weight: "bold",
  });
  body += text(500, 114, "無向圖有歐拉路徑 ⇔ 連通且", {
    anchor: "start",
    size: 12,
  });
  body += text(500, 136, "奇度點為 0 或 2 個（橘色）；", {
    anchor: "start",
    size: 12,
  });
  body += text(500, 158, "有 2 個時必須從奇度點出發。", {
    anchor: "start",
    size: 12,
  });
  body += text(500, 188, "Hierholzer：走不動時才把點", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  body += text(500, 210, "放進答案，最後反轉。", {
    anchor: "start",
    size: 12,
    fill: C.muted,
  });
  return svg(740, 280, body);
}

function sccFigure(): string {
  const n = 8;
  const E: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 3],
    [5, 6],
    [6, 7],
    [7, 6],
    [1, 4],
  ];
  const g = adj(n, E, true);
  const rg = adj(
    n,
    E.map(([a, b]) => [b, a] as [number, number]),
    true,
  );
  const seen = new Array<boolean>(n).fill(false);
  const order: number[] = [];
  const dfs1 = (u: number) => {
    seen[u] = true;
    for (const v of at(g, u)) if (!at(seen, v)) dfs1(v);
    order.push(u);
  };
  for (let i = 0; i < n; i++) if (!at(seen, i)) dfs1(i);
  const comp = new Array<number>(n).fill(-1);
  let c = 0;
  const dfs2 = (u: number) => {
    comp[u] = c;
    for (const v of at(rg, u)) if (at(comp, v) === -1) dfs2(v);
  };
  for (let i = n - 1; i >= 0; i--) {
    const u = at(order, i);
    if (at(comp, u) === -1) {
      dfs2(u);
      c++;
    }
  }
  const fills = [C.blueSoft, C.orangeSoft, C.greenSoft, C.purpleSoft];
  const pos: [number, number][] = [
    [50, 60],
    [150, 60],
    [100, 150],
    [240, 150],
    [290, 60],
    [340, 150],
    [440, 150],
    [520, 150],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    x,
    y: y + 10,
    fill: at(fills, at(comp, i) % 4),
  }));
  const edges: GEdge[] = E.map(([a, b]) => {
    const inside = at(comp, a) === at(comp, b);
    return {
      a,
      b,
      directed: true,
      color: inside ? C.ink : C.red,
      sw: inside ? 1.4 : 2,
      bend: (a === 6 && b === 7) || (a === 7 && b === 6) ? 14 : 0,
    };
  });
  let body = drawGraph(nodes, edges);
  // Condensation DAG.
  const y2 = 250;
  body += text(40, y2, "縮點後：", {
    anchor: "start",
    size: 12,
    weight: "bold",
  });
  const compNodes: GNode[] = [];
  for (let k = 0; k < c; k++) {
    const members = pos.map((_, i) => i).filter((i) => at(comp, i) === k);
    compNodes.push({
      id: `c${k}`,
      label: `{${members.join(",")}}`,
      x: 150 + k * 130,
      y: y2,
      fill: at(fills, k % 4),
    });
  }
  const cEdges = new Set<string>();
  E.forEach(([a, b]) => {
    if (at(comp, a) !== at(comp, b))
      cEdges.add(`${at(comp, a)}-${at(comp, b)}`);
  });
  body += drawGraph(
    compNodes,
    [...cEdges].map((s) => {
      const [a, b] = s.split("-");
      return { a: `c${a}`, b: `c${b}`, directed: true, color: C.red, sw: 2 };
    }),
    { r: 26, size: 11 },
  );
  body += text(
    40,
    y2 + 50,
    "同色 = 同一個強連通分量（互相可達）。紅邊跨分量；把每個分量縮成一點後一定是 DAG。",
    { anchor: "start", size: 12 },
  );
  return svg(640, y2 + 66, body);
}

function bipartiteFigure(): string {
  const leftPos: [number, number][] = [
    [80, 60],
    [80, 130],
    [80, 200],
  ];
  const rightPos: [number, number][] = [
    [230, 60],
    [230, 130],
    [230, 200],
  ];
  const nodesA: GNode[] = [
    ...leftPos.map(([x, y], i) => ({ id: i, x, y, fill: C.blueSoft })),
    ...rightPos.map(([x, y], i) => ({ id: i + 3, x, y, fill: C.orangeSoft })),
  ];
  const edgesA: GEdge[] = [
    [0, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [2, 5],
  ].map(([a, b]) => ({ a: a!, b: b! }));
  let body = panelTitle(40, 20, "可二染色：每條邊兩端顏色不同");
  body += drawGraph(nodesA, edgesA);
  const tri: GNode[] = [
    { id: "a", label: "0", x: 440, y: 70, fill: C.blueSoft },
    { id: "b", label: "1", x: 380, y: 180, fill: C.orangeSoft },
    { id: "c", label: "2", x: 500, y: 180, fill: C.redSoft, stroke: C.red },
  ];
  body += panelTitle(350, 20, "奇環：不可能二染色");
  body += drawGraph(tri, [
    { a: "a", b: "b" },
    { a: "b", b: "c" },
    { a: "a", b: "c", color: C.red, sw: 2.6 },
  ]);
  body += text(530, 150, "2 的兩個鄰居", {
    anchor: "start",
    size: 11,
    fill: C.red,
  });
  body += text(530, 168, "顏色不同 → 衝突", {
    anchor: "start",
    size: 11,
    fill: C.red,
  });
  body += text(
    40,
    250,
    "DFS/BFS 時給鄰居塗上相反顏色；遇到同色鄰居就說明存在奇環，圖不是二分圖。",
    { anchor: "start", size: 12 },
  );
  return svg(640, 266, body);
}

function maxFlowFigure(): string {
  const n = 6;
  const S = 0;
  const T = 5;
  const E: { a: number; b: number; cap: number }[] = [
    { a: 0, b: 1, cap: 10 },
    { a: 0, b: 2, cap: 8 },
    { a: 1, b: 2, cap: 2 },
    { a: 1, b: 3, cap: 5 },
    { a: 2, b: 4, cap: 10 },
    { a: 3, b: 5, cap: 7 },
    { a: 4, b: 3, cap: 8 },
    { a: 4, b: 5, cap: 10 },
  ];
  const cap: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );
  E.forEach((e) => (at(cap, e.a)[e.b] = e.cap));
  const flow: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  );
  let total = 0;
  for (;;) {
    const par = new Array<number>(n).fill(-1);
    par[S] = S;
    const q = [S];
    for (let h = 0; h < q.length && at(par, T) === -1; h++) {
      const u = at(q, h);
      for (let v = 0; v < n; v++) {
        if (at(par, v) === -1 && at(at(cap, u), v) - at(at(flow, u), v) > 0) {
          par[v] = u;
          q.push(v);
        }
      }
    }
    if (at(par, T) === -1) break;
    let aug = Infinity;
    for (let v = T; v !== S; v = at(par, v))
      aug = Math.min(
        aug,
        at(at(cap, at(par, v)), v) - at(at(flow, at(par, v)), v),
      );
    for (let v = T; v !== S; v = at(par, v)) {
      const u = at(par, v);
      at(flow, u)[v] = at(at(flow, u), v) + aug;
      at(flow, v)[u] = at(at(flow, v), u) - aug;
    }
    total += aug;
  }
  // Min cut: reachable set in residual graph.
  const reach = new Set<number>([S]);
  const q = [S];
  for (let h = 0; h < q.length; h++) {
    const u = at(q, h);
    for (let v = 0; v < n; v++)
      if (!reach.has(v) && at(at(cap, u), v) - at(at(flow, u), v) > 0) {
        reach.add(v);
        q.push(v);
      }
  }
  const pos: [number, number][] = [
    [50, 130],
    [190, 50],
    [190, 210],
    [350, 50],
    [350, 210],
    [490, 130],
  ];
  const nodes: GNode[] = pos.map(([x, y], i) => ({
    id: i,
    label: i === S ? "s" : i === T ? "t" : `${i}`,
    x,
    y,
    fill: reach.has(i) ? C.blueSoft : C.orangeSoft,
  }));
  const edges: GEdge[] = E.map((e) => {
    const f = Math.max(0, at(at(flow, e.a), e.b));
    const cut = reach.has(e.a) && !reach.has(e.b);
    return {
      a: e.a,
      b: e.b,
      w: `${f}/${e.cap}`,
      directed: true,
      color: cut ? C.red : f > 0 ? C.blue : C.line,
      sw: cut ? 2.8 : f > 0 ? 2 : 1.2,
      labelOffset: 12,
    };
  });
  let body = drawGraph(nodes, edges);
  body += text(
    30,
    270,
    `邊上標記 流量/容量。最大流 = ${total}；紅邊是最小割（藍色點集 → 橘色點集），容量和也是 ${total}。`,
    { anchor: "start", size: 12 },
  );
  body += text(
    30,
    290,
    "Edmonds–Karp：反覆在殘量網路上用 BFS 找增廣路，直到 s 到不了 t。",
    { anchor: "start", size: 12, fill: C.muted },
  );
  return svg(640, 306, body);
}

export const part2Figures: BookFigure[] = [
  {
    id: "bit-lowbit",
    category: "bitwise_operations",
    section: "1.1 基礎題",
    caption: "最低位的 1：x & (x−1) 與 x & −x",
    render: lowbit,
  },
  {
    id: "bit-set",
    category: "bitwise_operations",
    section: "1.2 用位運算代替陣列操作",
    caption: "用二進位表示集合：位運算即集合運算",
    render: bitSet,
  },
  {
    id: "bit-xor",
    category: "bitwise_operations",
    section: "2. 異或（XOR）的性質",
    caption: "字首異或：區間異或 = 兩個字首異或值再異或",
    render: prefixXor,
  },
  {
    id: "bit-logtrick",
    category: "bitwise_operations",
    section: "3.2 AND/OR LogTrick",
    caption: "OR LogTrick：固定右端點，所有子陣列 OR 值只有 O(log U) 種",
    render: () => logTrickTable([1, 2, 1, 4, 8, 2], (a, b) => a | b, "OR"),
  },
  {
    id: "bit-gcdtrick",
    category: "bitwise_operations",
    section: "3.3 GCD LogTrick",
    caption: "GCD LogTrick：固定右端點，子陣列 GCD 只有 O(log U) 種",
    render: () =>
      logTrickTable(
        [24, 36, 18, 12, 30, 45],
        (a, b) => {
          let x = a;
          let y = b;
          while (y) [x, y] = [y, x % y];
          return x;
        },
        "gcd",
      ),
  },
  {
    id: "bit-split",
    category: "bitwise_operations",
    section: "4.1 拆位 / 貢獻法",
    caption: "拆位：每一位獨立統計 1 與 0 的個數",
    render: splitBits,
  },
  {
    id: "bit-trial",
    category: "bitwise_operations",
    section: "5. 試填法",
    caption: "試填法：陣列中兩數的最大異或值 (LC 421)",
    render: trialFill,
  },
  {
    id: "bit-identity",
    category: "bitwise_operations",
    section: "6. 恆等式",
    caption: "加法 = 不進位加法 + 進位：a + b = (a ^ b) + 2(a & b)",
    render: xorAndIdentity,
  },
  {
    id: "bit-basis",
    category: "bitwise_operations",
    section: "7. 線性基",
    caption: "異或線性基的插入過程與最終形態",
    render: linearBasis,
  },
  {
    id: "bit-submask",
    category: "bitwise_operations",
    section: "9. 其他",
    caption: "子集枚舉：s = (s − 1) & m 由大到小走遍 m 的所有子集",
    render: submasks,
  },

  {
    id: "graph-dfs",
    category: "graph",
    section: "1. 深度優先搜尋（DFS）",
    caption: "DFS：造訪順序、樹邊與回邊",
    render: dfsFigure,
  },
  {
    id: "graph-bfs",
    category: "graph",
    section: "2. 廣度優先搜尋（BFS）",
    caption: "BFS：按距離分層擴張",
    render: bfsFigure,
  },
  {
    id: "graph-model",
    category: "graph",
    section: "3. 圖論建模 + BFS 最短路",
    caption: "圖論建模：單詞接龍 (LC 127) 的隱式圖",
    render: wordLadder,
  },
  {
    id: "graph-jump",
    category: "graph",
    section: "4. 圖論建模 + BFS 最短路 > 專題：跳躍遊戲",
    caption: "跳躍遊戲 III (LC 1306)：陣列下標是點，跳躍是邊",
    render: jumpGame,
  },
  {
    id: "graph-topo",
    category: "graph",
    section: "5. 拓撲排序",
    caption: "Kahn 拓撲排序：不斷刪除入度為 0 的點",
    render: topoFigure,
  },
  {
    id: "graph-dagdp",
    category: "graph",
    section: "6. 在拓撲序上 DP",
    caption: "按拓撲序 DP：DAG 上的最重路徑",
    render: dagDp,
  },
  {
    id: "graph-functional",
    category: "graph",
    section: "7. 基環樹",
    caption: "基環樹（內向）：每個連通塊是一個環加上掛在環上的樹",
    render: functionalGraph,
  },
  {
    id: "graph-dijkstra",
    category: "graph",
    section: "8. 單源最短路：Dijkstra 演算法",
    caption: "Dijkstra：每輪確定一個點的最短距離",
    render: dijkstraFigure,
  },
  {
    id: "graph-layered",
    category: "graph",
    section: "9. 單源最短路：Dijkstra 演算法 > 分層圖最短路",
    caption: "分層圖：把「已用幾次特權」加進狀態",
    render: layeredGraph,
  },
  {
    id: "graph-diffcons",
    category: "graph",
    section: "10. 單源最短路：Dijkstra 演算法 > SPFA 與差分約束",
    caption: "差分約束系統轉成最短路",
    render: diffConstraints,
  },
  {
    id: "graph-floyd",
    category: "graph",
    section: "11. 全源最短路：Floyd 演算法",
    caption: "Floyd：逐一開放中轉點 k",
    render: floydFigure,
  },
  {
    id: "graph-mst",
    category: "graph",
    section: "13. 最小生成樹",
    caption: "Kruskal：由小到大選邊，用並查集拒絕成環的邊",
    render: kruskalFigure,
  },
  {
    id: "graph-euler",
    category: "graph",
    section: "14. 尤拉路徑/尤拉回路",
    caption: "歐拉路徑：每條邊恰好走一次（Hierholzer 演算法）",
    render: eulerFigure,
  },
  {
    id: "graph-scc",
    category: "graph",
    section: "15. 強連通分量/雙連通分量",
    caption: "強連通分量與縮點",
    render: sccFigure,
  },
  {
    id: "graph-bipartite",
    category: "graph",
    section: "16. 二分圖染色",
    caption: "二分圖判定：二染色成功 ⇔ 沒有奇環",
    render: bipartiteFigure,
  },
  {
    id: "graph-flow",
    category: "graph",
    section: "17.1 網路流",
    caption: "最大流與最小割",
    render: maxFlowFigure,
  },
];
